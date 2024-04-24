/**
 * @license
 * Copyright 2011 Paul Felix (paul.eric.felix@gmail.com)
 * MIT-licenced: https://opensource.org/licenses/MIT
 */
/*global Dygraph:false,TouchEvent:false */

/**
 * @fileoverview This file contains the RangeSelector plugin used to provide
 * a timeline range selector widget for dygraphs.
 */

/*global Dygraph:false */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var utils = _interopRequireWildcard(require("../dygraph-utils"));
var _dygraphInteractionModel = _interopRequireDefault(require("../dygraph-interaction-model"));
var _iframeTarp = _interopRequireDefault(require("../iframe-tarp"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var rangeSelector = function rangeSelector() {
  this.hasTouchInterface_ = typeof TouchEvent != 'undefined';
  this.isMobileDevice_ = /mobile|android/gi.test(navigator.appVersion);
  this.interfaceCreated_ = false;
};
rangeSelector.prototype.toString = function () {
  return "RangeSelector Plugin";
};
rangeSelector.prototype.activate = function (dygraph) {
  this.dygraph_ = dygraph;
  if (this.getOption_('showRangeSelector')) {
    this.createInterface_();
  }
  return {
    layout: this.reserveSpace_,
    predraw: this.renderStaticLayer_,
    didDrawChart: this.renderInteractiveLayer_
  };
};
rangeSelector.prototype.destroy = function () {
  this.bgcanvas_ = null;
  this.fgcanvas_ = null;
  this.leftZoomHandle_ = null;
  this.rightZoomHandle_ = null;
};

//------------------------------------------------------------------
// Private methods
//------------------------------------------------------------------

rangeSelector.prototype.getOption_ = function (name, opt_series) {
  return this.dygraph_.getOption(name, opt_series);
};
rangeSelector.prototype.setDefaultOption_ = function (name, value) {
  this.dygraph_.attrs_[name] = value;
};

/**
 * @private
 * Creates the range selector elements and adds them to the graph.
 */
rangeSelector.prototype.createInterface_ = function () {
  this.createCanvases_();
  this.createZoomHandles_();
  this.initInteraction_();

  // Range selector and animatedZooms have a bad interaction. See issue 359.
  if (this.getOption_('animatedZooms')) {
    console.warn('Animated zooms and range selector are not compatible; disabling animatedZooms.');
    this.dygraph_.updateOptions({
      animatedZooms: false
    }, true);
  }
  this.interfaceCreated_ = true;
  this.addToGraph_();
};

/**
 * @private
 * Adds the range selector to the graph.
 */
rangeSelector.prototype.addToGraph_ = function () {
  var graphDiv = this.graphDiv_ = this.dygraph_.graphDiv;
  graphDiv.appendChild(this.bgcanvas_);
  graphDiv.appendChild(this.fgcanvas_);
  graphDiv.appendChild(this.leftZoomHandle_);
  graphDiv.appendChild(this.rightZoomHandle_);
};

/**
 * @private
 * Removes the range selector from the graph.
 */
rangeSelector.prototype.removeFromGraph_ = function () {
  var graphDiv = this.graphDiv_;
  graphDiv.removeChild(this.bgcanvas_);
  graphDiv.removeChild(this.fgcanvas_);
  graphDiv.removeChild(this.leftZoomHandle_);
  graphDiv.removeChild(this.rightZoomHandle_);
  this.graphDiv_ = null;
};

/**
 * @private
 * Called by Layout to allow range selector to reserve its space.
 */
rangeSelector.prototype.reserveSpace_ = function (e) {
  if (this.getOption_('showRangeSelector')) {
    e.reserveSpaceBottom(this.getOption_('rangeSelectorHeight') + 4);
  }
};

/**
 * @private
 * Renders the static portion of the range selector at the predraw stage.
 */
rangeSelector.prototype.renderStaticLayer_ = function () {
  if (!this.updateVisibility_()) {
    return;
  }
  this.resize_();
  this.drawStaticLayer_();
};

/**
 * @private
 * Renders the interactive portion of the range selector after the chart has been drawn.
 */
rangeSelector.prototype.renderInteractiveLayer_ = function () {
  if (!this.updateVisibility_() || this.isChangingRange_) {
    return;
  }
  this.placeZoomHandles_();
  this.drawInteractiveLayer_();
};

/**
 * @private
 * Check to see if the range selector is enabled/disabled and update visibility accordingly.
 */
rangeSelector.prototype.updateVisibility_ = function () {
  var enabled = this.getOption_('showRangeSelector');
  if (enabled) {
    if (!this.interfaceCreated_) {
      this.createInterface_();
    } else if (!this.graphDiv_ || !this.graphDiv_.parentNode) {
      this.addToGraph_();
    }
  } else if (this.graphDiv_) {
    this.removeFromGraph_();
    var dygraph = this.dygraph_;
    setTimeout(function () {
      dygraph.width_ = 0;
      dygraph.resize();
    }, 1);
  }
  return enabled;
};

/**
 * @private
 * Resizes the range selector.
 */
rangeSelector.prototype.resize_ = function () {
  function setElementRect(canvas, context, rect, pixelRatioOption) {
    var canvasScale = pixelRatioOption || utils.getContextPixelRatio(context);
    canvas.style.top = rect.y + 'px';
    canvas.style.left = rect.x + 'px';
    canvas.width = rect.w * canvasScale;
    canvas.height = rect.h * canvasScale;
    canvas.style.width = rect.w + 'px';
    canvas.style.height = rect.h + 'px';
    if (canvasScale != 1) {
      context.scale(canvasScale, canvasScale);
    }
  }
  var plotArea = this.dygraph_.layout_.getPlotArea();
  var xAxisLabelHeight = 0;
  if (this.dygraph_.getOptionForAxis('drawAxis', 'x')) {
    xAxisLabelHeight = this.getOption_('xAxisHeight') || this.getOption_('axisLabelFontSize') + 2 * this.getOption_('axisTickSize');
  }
  this.canvasRect_ = {
    x: plotArea.x,
    y: plotArea.y + plotArea.h + xAxisLabelHeight + 4,
    w: plotArea.w,
    h: this.getOption_('rangeSelectorHeight')
  };
  var pixelRatioOption = this.dygraph_.getNumericOption('pixelRatio');
  setElementRect(this.bgcanvas_, this.bgcanvas_ctx_, this.canvasRect_, pixelRatioOption);
  setElementRect(this.fgcanvas_, this.fgcanvas_ctx_, this.canvasRect_, pixelRatioOption);
};

/**
 * @private
 * Creates the background and foreground canvases.
 */
rangeSelector.prototype.createCanvases_ = function () {
  this.bgcanvas_ = utils.createCanvas();
  this.bgcanvas_.className = 'dygraph-rangesel-bgcanvas';
  this.bgcanvas_.style.position = 'absolute';
  this.bgcanvas_.style.zIndex = 9;
  this.bgcanvas_ctx_ = utils.getContext(this.bgcanvas_);
  this.fgcanvas_ = utils.createCanvas();
  this.fgcanvas_.className = 'dygraph-rangesel-fgcanvas';
  this.fgcanvas_.style.position = 'absolute';
  this.fgcanvas_.style.zIndex = 9;
  this.fgcanvas_.style.cursor = 'default';
  this.fgcanvas_ctx_ = utils.getContext(this.fgcanvas_);
};

/**
 * @private
 * Creates the zoom handle elements.
 */
rangeSelector.prototype.createZoomHandles_ = function () {
  var img = new Image();
  img.className = 'dygraph-rangesel-zoomhandle';
  img.style.position = 'absolute';
  img.style.zIndex = 10;
  img.style.visibility = 'hidden'; // Initially hidden so they don't show up in the wrong place.
  img.style.cursor = 'col-resize';
  // TODO: change image to more options
  img.width = 9;
  img.height = 16;
  img.src = 'data:image/png;base64,' + 'iVBORw0KGgoAAAANSUhEUgAAAAkAAAAQCAYAAADESFVDAAAAAXNSR0IArs4c6QAAAAZiS0dEANAA' + 'zwDP4Z7KegAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAAd0SU1FB9sHGw0cMqdt1UwAAAAZdEVYdENv' + 'bW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAaElEQVQoz+3SsRFAQBCF4Z9WJM8KCDVwownl' + '6YXsTmCUsyKGkZzcl7zkz3YLkypgAnreFmDEpHkIwVOMfpdi9CEEN2nGpFdwD03yEqDtOgCaun7s' + 'qSTDH32I1pQA2Pb9sZecAxc5r3IAb21d6878xsAAAAAASUVORK5CYII=';
  if (this.isMobileDevice_) {
    img.width *= 2;
    img.height *= 2;
  }
  this.leftZoomHandle_ = img;
  this.rightZoomHandle_ = img.cloneNode(false);
};

/**
 * @private
 * Sets up the interaction for the range selector.
 */
rangeSelector.prototype.initInteraction_ = function () {
  var self = this;
  var topElem = document;
  var clientXLast = 0;
  var handle = null;
  var isZooming = false;
  var isPanning = false;
  var dynamic = !this.isMobileDevice_;

  // We cover iframes during mouse interactions. See comments in
  // dygraph-utils.js for more info on why this is a good idea.
  var tarp = new _iframeTarp["default"]();

  // functions, defined below.  Defining them this way (rather than with
  // "function foo() {...}") makes JSHint happy.
  var toXDataWindow, onZoomStart, onZoom, _onZoomEnd, doZoom, isMouseInPanZone, onPanStart, onPan, _onPanEnd, doPan, onCanvasHover;

  // Touch event functions
  var onZoomHandleTouchEvent, onCanvasTouchEvent, addTouchEvents;
  toXDataWindow = function toXDataWindow(zoomHandleStatus) {
    var xDataLimits = self.dygraph_.xAxisExtremes();
    var fact = (xDataLimits[1] - xDataLimits[0]) / self.canvasRect_.w;
    var xDataMin = xDataLimits[0] + (zoomHandleStatus.leftHandlePos - self.canvasRect_.x) * fact;
    var xDataMax = xDataLimits[0] + (zoomHandleStatus.rightHandlePos - self.canvasRect_.x) * fact;
    return [xDataMin, xDataMax];
  };
  onZoomStart = function onZoomStart(e) {
    utils.cancelEvent(e);
    isZooming = true;
    clientXLast = e.clientX;
    handle = e.target ? e.target : e.srcElement;
    if (e.type === 'mousedown' || e.type === 'dragstart') {
      // These events are removed manually.
      utils.addEvent(topElem, 'mousemove', onZoom);
      utils.addEvent(topElem, 'mouseup', _onZoomEnd);
    }
    self.fgcanvas_.style.cursor = 'col-resize';
    tarp.cover();
    return true;
  };
  onZoom = function onZoom(e) {
    if (!isZooming) {
      return false;
    }
    utils.cancelEvent(e);
    var delX = e.clientX - clientXLast;
    if (Math.abs(delX) < 4) {
      return true;
    }
    clientXLast = e.clientX;

    // Move handle.
    var zoomHandleStatus = self.getZoomHandleStatus_();
    var newPos;
    if (handle == self.leftZoomHandle_) {
      newPos = zoomHandleStatus.leftHandlePos + delX;
      newPos = Math.min(newPos, zoomHandleStatus.rightHandlePos - handle.width - 3);
      newPos = Math.max(newPos, self.canvasRect_.x);
    } else {
      newPos = zoomHandleStatus.rightHandlePos + delX;
      newPos = Math.min(newPos, self.canvasRect_.x + self.canvasRect_.w);
      newPos = Math.max(newPos, zoomHandleStatus.leftHandlePos + handle.width + 3);
    }
    var halfHandleWidth = handle.width / 2;
    handle.style.left = newPos - halfHandleWidth + 'px';
    self.drawInteractiveLayer_();

    // Zoom on the fly.
    if (dynamic) {
      doZoom();
    }
    return true;
  };
  _onZoomEnd = function onZoomEnd(e) {
    if (!isZooming) {
      return false;
    }
    isZooming = false;
    tarp.uncover();
    utils.removeEvent(topElem, 'mousemove', onZoom);
    utils.removeEvent(topElem, 'mouseup', _onZoomEnd);
    self.fgcanvas_.style.cursor = 'default';

    // If on a slower device, zoom now.
    if (!dynamic) {
      doZoom();
    }
    return true;
  };
  doZoom = function doZoom() {
    try {
      var zoomHandleStatus = self.getZoomHandleStatus_();
      self.isChangingRange_ = true;
      if (!zoomHandleStatus.isZoomed) {
        self.dygraph_.resetZoom();
      } else {
        var xDataWindow = toXDataWindow(zoomHandleStatus);
        self.dygraph_.doZoomXDates_(xDataWindow[0], xDataWindow[1]);
      }
    } finally {
      self.isChangingRange_ = false;
    }
  };
  isMouseInPanZone = function isMouseInPanZone(e) {
    var rect = self.leftZoomHandle_.getBoundingClientRect();
    var leftHandleClientX = rect.left + rect.width / 2;
    rect = self.rightZoomHandle_.getBoundingClientRect();
    var rightHandleClientX = rect.left + rect.width / 2;
    return e.clientX > leftHandleClientX && e.clientX < rightHandleClientX;
  };
  onPanStart = function onPanStart(e) {
    if (!isPanning && isMouseInPanZone(e) && self.getZoomHandleStatus_().isZoomed) {
      utils.cancelEvent(e);
      isPanning = true;
      clientXLast = e.clientX;
      if (e.type === 'mousedown') {
        // These events are removed manually.
        utils.addEvent(topElem, 'mousemove', onPan);
        utils.addEvent(topElem, 'mouseup', _onPanEnd);
      }
      return true;
    }
    return false;
  };
  onPan = function onPan(e) {
    if (!isPanning) {
      return false;
    }
    utils.cancelEvent(e);
    var delX = e.clientX - clientXLast;
    if (Math.abs(delX) < 4) {
      return true;
    }
    clientXLast = e.clientX;

    // Move range view
    var zoomHandleStatus = self.getZoomHandleStatus_();
    var leftHandlePos = zoomHandleStatus.leftHandlePos;
    var rightHandlePos = zoomHandleStatus.rightHandlePos;
    var rangeSize = rightHandlePos - leftHandlePos;
    if (leftHandlePos + delX <= self.canvasRect_.x) {
      leftHandlePos = self.canvasRect_.x;
      rightHandlePos = leftHandlePos + rangeSize;
    } else if (rightHandlePos + delX >= self.canvasRect_.x + self.canvasRect_.w) {
      rightHandlePos = self.canvasRect_.x + self.canvasRect_.w;
      leftHandlePos = rightHandlePos - rangeSize;
    } else {
      leftHandlePos += delX;
      rightHandlePos += delX;
    }
    var halfHandleWidth = self.leftZoomHandle_.width / 2;
    self.leftZoomHandle_.style.left = leftHandlePos - halfHandleWidth + 'px';
    self.rightZoomHandle_.style.left = rightHandlePos - halfHandleWidth + 'px';
    self.drawInteractiveLayer_();

    // Do pan on the fly.
    if (dynamic) {
      doPan();
    }
    return true;
  };
  _onPanEnd = function onPanEnd(e) {
    if (!isPanning) {
      return false;
    }
    isPanning = false;
    utils.removeEvent(topElem, 'mousemove', onPan);
    utils.removeEvent(topElem, 'mouseup', _onPanEnd);
    // If on a slower device, do pan now.
    if (!dynamic) {
      doPan();
    }
    return true;
  };
  doPan = function doPan() {
    try {
      self.isChangingRange_ = true;
      self.dygraph_.dateWindow_ = toXDataWindow(self.getZoomHandleStatus_());
      self.dygraph_.drawGraph_(false);
    } finally {
      self.isChangingRange_ = false;
    }
  };
  onCanvasHover = function onCanvasHover(e) {
    if (isZooming || isPanning) {
      return;
    }
    var cursor = isMouseInPanZone(e) ? 'move' : 'default';
    if (cursor != self.fgcanvas_.style.cursor) {
      self.fgcanvas_.style.cursor = cursor;
    }
  };
  onZoomHandleTouchEvent = function onZoomHandleTouchEvent(e) {
    if (e.type == 'touchstart' && e.targetTouches.length == 1) {
      if (onZoomStart(e.targetTouches[0])) {
        utils.cancelEvent(e);
      }
    } else if (e.type == 'touchmove' && e.targetTouches.length == 1) {
      if (onZoom(e.targetTouches[0])) {
        utils.cancelEvent(e);
      }
    } else {
      _onZoomEnd(e);
    }
  };
  onCanvasTouchEvent = function onCanvasTouchEvent(e) {
    if (e.type == 'touchstart' && e.targetTouches.length == 1) {
      if (onPanStart(e.targetTouches[0])) {
        utils.cancelEvent(e);
      }
    } else if (e.type == 'touchmove' && e.targetTouches.length == 1) {
      if (onPan(e.targetTouches[0])) {
        utils.cancelEvent(e);
      }
    } else {
      _onPanEnd(e);
    }
  };
  addTouchEvents = function addTouchEvents(elem, fn) {
    var types = ['touchstart', 'touchend', 'touchmove', 'touchcancel'];
    for (var i = 0; i < types.length; i++) {
      self.dygraph_.addAndTrackEvent(elem, types[i], fn);
    }
  };
  this.setDefaultOption_('interactionModel', _dygraphInteractionModel["default"].dragIsPanInteractionModel);
  this.setDefaultOption_('panEdgeFraction', 0.0001);
  var dragStartEvent = window.opera ? 'mousedown' : 'dragstart';
  this.dygraph_.addAndTrackEvent(this.leftZoomHandle_, dragStartEvent, onZoomStart);
  this.dygraph_.addAndTrackEvent(this.rightZoomHandle_, dragStartEvent, onZoomStart);
  this.dygraph_.addAndTrackEvent(this.fgcanvas_, 'mousedown', onPanStart);
  this.dygraph_.addAndTrackEvent(this.fgcanvas_, 'mousemove', onCanvasHover);

  // Touch events
  if (this.hasTouchInterface_) {
    addTouchEvents(this.leftZoomHandle_, onZoomHandleTouchEvent);
    addTouchEvents(this.rightZoomHandle_, onZoomHandleTouchEvent);
    addTouchEvents(this.fgcanvas_, onCanvasTouchEvent);
  }
};

/**
 * @private
 * Draws the static layer in the background canvas.
 */
rangeSelector.prototype.drawStaticLayer_ = function () {
  var ctx = this.bgcanvas_ctx_;
  ctx.clearRect(0, 0, this.canvasRect_.w, this.canvasRect_.h);
  try {
    this.drawMiniPlot_();
  } catch (ex) {
    console.warn(ex);
  }
  var margin = 0.5;
  this.bgcanvas_ctx_.lineWidth = this.getOption_('rangeSelectorBackgroundLineWidth');
  ctx.strokeStyle = this.getOption_('rangeSelectorBackgroundStrokeColor');
  ctx.beginPath();
  ctx.moveTo(margin, margin);
  ctx.lineTo(margin, this.canvasRect_.h - margin);
  ctx.lineTo(this.canvasRect_.w - margin, this.canvasRect_.h - margin);
  ctx.lineTo(this.canvasRect_.w - margin, margin);
  ctx.stroke();
};

/**
 * @private
 * Draws the mini plot in the background canvas.
 */
rangeSelector.prototype.drawMiniPlot_ = function () {
  var fillStyle = this.getOption_('rangeSelectorPlotFillColor');
  var fillGradientStyle = this.getOption_('rangeSelectorPlotFillGradientColor');
  var strokeStyle = this.getOption_('rangeSelectorPlotStrokeColor');
  if (!fillStyle && !strokeStyle) {
    return;
  }
  var stepPlot = this.getOption_('stepPlot');
  var combinedSeriesData = this.computeCombinedSeriesAndLimits_();
  var yRange = combinedSeriesData.yMax - combinedSeriesData.yMin;

  // Draw the mini plot.
  var ctx = this.bgcanvas_ctx_;
  var margin = 0.5;
  var xExtremes = this.dygraph_.xAxisExtremes();
  var xRange = Math.max(xExtremes[1] - xExtremes[0], 1.e-30);
  var xFact = (this.canvasRect_.w - margin) / xRange;
  var yFact = (this.canvasRect_.h - margin) / yRange;
  var canvasWidth = this.canvasRect_.w - margin;
  var canvasHeight = this.canvasRect_.h - margin;
  var prevX = null,
    prevY = null;
  ctx.beginPath();
  ctx.moveTo(margin, canvasHeight);
  for (var i = 0; i < combinedSeriesData.data.length; i++) {
    var dataPoint = combinedSeriesData.data[i];
    var x = dataPoint[0] !== null ? (dataPoint[0] - xExtremes[0]) * xFact : NaN;
    var y = dataPoint[1] !== null ? canvasHeight - (dataPoint[1] - combinedSeriesData.yMin) * yFact : NaN;

    // Skip points that don't change the x-value. Overly fine-grained points
    // can cause major slowdowns with the ctx.fill() call below.
    if (!stepPlot && prevX !== null && Math.round(x) == Math.round(prevX)) {
      continue;
    }
    if (isFinite(x) && isFinite(y)) {
      if (prevX === null) {
        ctx.lineTo(x, canvasHeight);
      } else if (stepPlot) {
        ctx.lineTo(x, prevY);
      }
      ctx.lineTo(x, y);
      prevX = x;
      prevY = y;
    } else {
      if (prevX !== null) {
        if (stepPlot) {
          ctx.lineTo(x, prevY);
          ctx.lineTo(x, canvasHeight);
        } else {
          ctx.lineTo(prevX, canvasHeight);
        }
      }
      prevX = prevY = null;
    }
  }
  ctx.lineTo(canvasWidth, canvasHeight);
  ctx.closePath();
  if (fillStyle) {
    var lingrad = this.bgcanvas_ctx_.createLinearGradient(0, 0, 0, canvasHeight);
    if (fillGradientStyle) {
      lingrad.addColorStop(0, fillGradientStyle);
    }
    lingrad.addColorStop(1, fillStyle);
    this.bgcanvas_ctx_.fillStyle = lingrad;
    ctx.fill();
  }
  if (strokeStyle) {
    this.bgcanvas_ctx_.strokeStyle = strokeStyle;
    this.bgcanvas_ctx_.lineWidth = this.getOption_('rangeSelectorPlotLineWidth');
    ctx.stroke();
  }
};

/**
 * @private
 * Computes and returns the combined series data along with min/max for the mini plot.
 * The combined series consists of averaged values for all series.
 * When series have error bars, the error bars are ignored.
 * @return {Object} An object containing combined series array, ymin, ymax.
 */
rangeSelector.prototype.computeCombinedSeriesAndLimits_ = function () {
  var g = this.dygraph_;
  var logscale = this.getOption_('logscale');
  var i;

  // Select series to combine. By default, all series are combined.
  var numColumns = g.numColumns();
  var labels = g.getLabels();
  var includeSeries = new Array(numColumns);
  var anySet = false;
  var visibility = g.visibility();
  var inclusion = [];
  for (i = 1; i < numColumns; i++) {
    var include = this.getOption_('showInRangeSelector', labels[i]);
    inclusion.push(include);
    if (include !== null) anySet = true; // it's set explicitly for this series
  }

  if (anySet) {
    for (i = 1; i < numColumns; i++) {
      includeSeries[i] = inclusion[i - 1];
    }
  } else {
    for (i = 1; i < numColumns; i++) {
      includeSeries[i] = visibility[i - 1];
    }
  }

  // Create a combined series (average of selected series values).
  // TODO(danvk): short-circuit if there's only one series.
  var rolledSeries = [];
  var dataHandler = g.dataHandler_;
  var options = g.attributes_;
  for (i = 1; i < g.numColumns(); i++) {
    if (!includeSeries[i]) continue;
    var series = dataHandler.extractSeries(g.rawData_, i, options);
    if (g.rollPeriod() > 1) {
      series = dataHandler.rollingAverage(series, g.rollPeriod(), options, i);
    }
    rolledSeries.push(series);
  }
  var combinedSeries = [];
  for (i = 0; i < rolledSeries[0].length; i++) {
    var sum = 0;
    var count = 0;
    for (var j = 0; j < rolledSeries.length; j++) {
      var y = rolledSeries[j][i][1];
      if (y === null || isNaN(y)) continue;
      count++;
      sum += y;
    }
    combinedSeries.push([rolledSeries[0][i][0], sum / count]);
  }

  // Compute the y range.
  var yMin = Number.MAX_VALUE;
  var yMax = -Number.MAX_VALUE;
  for (i = 0; i < combinedSeries.length; i++) {
    var yVal = combinedSeries[i][1];
    if (yVal !== null && isFinite(yVal) && (!logscale || yVal > 0)) {
      yMin = Math.min(yMin, yVal);
      yMax = Math.max(yMax, yVal);
    }
  }

  // Convert Y data to log scale if needed.
  // Also, expand the Y range to compress the mini plot a little.
  var extraPercent = 0.25;
  if (logscale) {
    yMax = utils.log10(yMax);
    yMax += yMax * extraPercent;
    yMin = utils.log10(yMin);
    for (i = 0; i < combinedSeries.length; i++) {
      combinedSeries[i][1] = utils.log10(combinedSeries[i][1]);
    }
  } else {
    var yExtra;
    var yRange = yMax - yMin;
    if (yRange <= Number.MIN_VALUE) {
      yExtra = yMax * extraPercent;
    } else {
      yExtra = yRange * extraPercent;
    }
    yMax += yExtra;
    yMin -= yExtra;
  }
  return {
    data: combinedSeries,
    yMin: yMin,
    yMax: yMax
  };
};

/**
 * @private
 * Places the zoom handles in the proper position based on the current X data window.
 */
rangeSelector.prototype.placeZoomHandles_ = function () {
  var xExtremes = this.dygraph_.xAxisExtremes();
  var xWindowLimits = this.dygraph_.xAxisRange();
  var xRange = xExtremes[1] - xExtremes[0];
  var leftPercent = Math.max(0, (xWindowLimits[0] - xExtremes[0]) / xRange);
  var rightPercent = Math.max(0, (xExtremes[1] - xWindowLimits[1]) / xRange);
  var leftCoord = this.canvasRect_.x + this.canvasRect_.w * leftPercent;
  var rightCoord = this.canvasRect_.x + this.canvasRect_.w * (1 - rightPercent);
  var handleTop = Math.max(this.canvasRect_.y, this.canvasRect_.y + (this.canvasRect_.h - this.leftZoomHandle_.height) / 2);
  var halfHandleWidth = this.leftZoomHandle_.width / 2;
  this.leftZoomHandle_.style.left = leftCoord - halfHandleWidth + 'px';
  this.leftZoomHandle_.style.top = handleTop + 'px';
  this.rightZoomHandle_.style.left = rightCoord - halfHandleWidth + 'px';
  this.rightZoomHandle_.style.top = this.leftZoomHandle_.style.top;
  this.leftZoomHandle_.style.visibility = 'visible';
  this.rightZoomHandle_.style.visibility = 'visible';
};

/**
 * @private
 * Draws the interactive layer in the foreground canvas.
 */
rangeSelector.prototype.drawInteractiveLayer_ = function () {
  var ctx = this.fgcanvas_ctx_;
  ctx.clearRect(0, 0, this.canvasRect_.w, this.canvasRect_.h);
  var margin = 1;
  var width = this.canvasRect_.w - margin;
  var height = this.canvasRect_.h - margin;
  var zoomHandleStatus = this.getZoomHandleStatus_();
  ctx.strokeStyle = this.getOption_('rangeSelectorForegroundStrokeColor');
  ctx.lineWidth = this.getOption_('rangeSelectorForegroundLineWidth');
  if (!zoomHandleStatus.isZoomed) {
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, height);
    ctx.lineTo(width, height);
    ctx.lineTo(width, margin);
    ctx.stroke();
  } else {
    var leftHandleCanvasPos = Math.max(margin, zoomHandleStatus.leftHandlePos - this.canvasRect_.x);
    var rightHandleCanvasPos = Math.min(width, zoomHandleStatus.rightHandlePos - this.canvasRect_.x);
    var veilColour = this.getOption_('rangeSelectorVeilColour');
    ctx.fillStyle = veilColour ? veilColour : 'rgba(240, 240, 240, ' + this.getOption_('rangeSelectorAlpha').toString() + ')';
    ctx.fillRect(0, 0, leftHandleCanvasPos, this.canvasRect_.h);
    ctx.fillRect(rightHandleCanvasPos, 0, this.canvasRect_.w - rightHandleCanvasPos, this.canvasRect_.h);
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(leftHandleCanvasPos, margin);
    ctx.lineTo(leftHandleCanvasPos, height);
    ctx.lineTo(rightHandleCanvasPos, height);
    ctx.lineTo(rightHandleCanvasPos, margin);
    ctx.lineTo(width, margin);
    ctx.stroke();
  }
};

/**
 * @private
 * Returns the current zoom handle position information.
 * @return {Object} The zoom handle status.
 */
rangeSelector.prototype.getZoomHandleStatus_ = function () {
  var halfHandleWidth = this.leftZoomHandle_.width / 2;
  var leftHandlePos = parseFloat(this.leftZoomHandle_.style.left) + halfHandleWidth;
  var rightHandlePos = parseFloat(this.rightZoomHandle_.style.left) + halfHandleWidth;
  return {
    leftHandlePos: leftHandlePos,
    rightHandlePos: rightHandlePos,
    isZoomed: leftHandlePos - 1 > this.canvasRect_.x || rightHandlePos + 1 < this.canvasRect_.x + this.canvasRect_.w
  };
};
var _default = rangeSelector;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJyYW5nZVNlbGVjdG9yIiwiaGFzVG91Y2hJbnRlcmZhY2VfIiwiVG91Y2hFdmVudCIsImlzTW9iaWxlRGV2aWNlXyIsInRlc3QiLCJuYXZpZ2F0b3IiLCJhcHBWZXJzaW9uIiwiaW50ZXJmYWNlQ3JlYXRlZF8iLCJwcm90b3R5cGUiLCJ0b1N0cmluZyIsImFjdGl2YXRlIiwiZHlncmFwaCIsImR5Z3JhcGhfIiwiZ2V0T3B0aW9uXyIsImNyZWF0ZUludGVyZmFjZV8iLCJsYXlvdXQiLCJyZXNlcnZlU3BhY2VfIiwicHJlZHJhdyIsInJlbmRlclN0YXRpY0xheWVyXyIsImRpZERyYXdDaGFydCIsInJlbmRlckludGVyYWN0aXZlTGF5ZXJfIiwiZGVzdHJveSIsImJnY2FudmFzXyIsImZnY2FudmFzXyIsImxlZnRab29tSGFuZGxlXyIsInJpZ2h0Wm9vbUhhbmRsZV8iLCJuYW1lIiwib3B0X3NlcmllcyIsImdldE9wdGlvbiIsInNldERlZmF1bHRPcHRpb25fIiwidmFsdWUiLCJhdHRyc18iLCJjcmVhdGVDYW52YXNlc18iLCJjcmVhdGVab29tSGFuZGxlc18iLCJpbml0SW50ZXJhY3Rpb25fIiwiY29uc29sZSIsIndhcm4iLCJ1cGRhdGVPcHRpb25zIiwiYW5pbWF0ZWRab29tcyIsImFkZFRvR3JhcGhfIiwiZ3JhcGhEaXYiLCJncmFwaERpdl8iLCJhcHBlbmRDaGlsZCIsInJlbW92ZUZyb21HcmFwaF8iLCJyZW1vdmVDaGlsZCIsImUiLCJyZXNlcnZlU3BhY2VCb3R0b20iLCJ1cGRhdGVWaXNpYmlsaXR5XyIsInJlc2l6ZV8iLCJkcmF3U3RhdGljTGF5ZXJfIiwiaXNDaGFuZ2luZ1JhbmdlXyIsInBsYWNlWm9vbUhhbmRsZXNfIiwiZHJhd0ludGVyYWN0aXZlTGF5ZXJfIiwiZW5hYmxlZCIsInBhcmVudE5vZGUiLCJzZXRUaW1lb3V0Iiwid2lkdGhfIiwicmVzaXplIiwic2V0RWxlbWVudFJlY3QiLCJjYW52YXMiLCJjb250ZXh0IiwicmVjdCIsInBpeGVsUmF0aW9PcHRpb24iLCJjYW52YXNTY2FsZSIsInV0aWxzIiwiZ2V0Q29udGV4dFBpeGVsUmF0aW8iLCJzdHlsZSIsInRvcCIsInkiLCJsZWZ0IiwieCIsIndpZHRoIiwidyIsImhlaWdodCIsImgiLCJzY2FsZSIsInBsb3RBcmVhIiwibGF5b3V0XyIsImdldFBsb3RBcmVhIiwieEF4aXNMYWJlbEhlaWdodCIsImdldE9wdGlvbkZvckF4aXMiLCJjYW52YXNSZWN0XyIsImdldE51bWVyaWNPcHRpb24iLCJiZ2NhbnZhc19jdHhfIiwiZmdjYW52YXNfY3R4XyIsImNyZWF0ZUNhbnZhcyIsImNsYXNzTmFtZSIsInBvc2l0aW9uIiwiekluZGV4IiwiZ2V0Q29udGV4dCIsImN1cnNvciIsImltZyIsIkltYWdlIiwidmlzaWJpbGl0eSIsInNyYyIsImNsb25lTm9kZSIsInNlbGYiLCJ0b3BFbGVtIiwiZG9jdW1lbnQiLCJjbGllbnRYTGFzdCIsImhhbmRsZSIsImlzWm9vbWluZyIsImlzUGFubmluZyIsImR5bmFtaWMiLCJ0YXJwIiwiSUZyYW1lVGFycCIsInRvWERhdGFXaW5kb3ciLCJvblpvb21TdGFydCIsIm9uWm9vbSIsIm9uWm9vbUVuZCIsImRvWm9vbSIsImlzTW91c2VJblBhblpvbmUiLCJvblBhblN0YXJ0Iiwib25QYW4iLCJvblBhbkVuZCIsImRvUGFuIiwib25DYW52YXNIb3ZlciIsIm9uWm9vbUhhbmRsZVRvdWNoRXZlbnQiLCJvbkNhbnZhc1RvdWNoRXZlbnQiLCJhZGRUb3VjaEV2ZW50cyIsInpvb21IYW5kbGVTdGF0dXMiLCJ4RGF0YUxpbWl0cyIsInhBeGlzRXh0cmVtZXMiLCJmYWN0IiwieERhdGFNaW4iLCJsZWZ0SGFuZGxlUG9zIiwieERhdGFNYXgiLCJyaWdodEhhbmRsZVBvcyIsImNhbmNlbEV2ZW50IiwiY2xpZW50WCIsInRhcmdldCIsInNyY0VsZW1lbnQiLCJ0eXBlIiwiYWRkRXZlbnQiLCJjb3ZlciIsImRlbFgiLCJNYXRoIiwiYWJzIiwiZ2V0Wm9vbUhhbmRsZVN0YXR1c18iLCJuZXdQb3MiLCJtaW4iLCJtYXgiLCJoYWxmSGFuZGxlV2lkdGgiLCJ1bmNvdmVyIiwicmVtb3ZlRXZlbnQiLCJpc1pvb21lZCIsInJlc2V0Wm9vbSIsInhEYXRhV2luZG93IiwiZG9ab29tWERhdGVzXyIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsImxlZnRIYW5kbGVDbGllbnRYIiwicmlnaHRIYW5kbGVDbGllbnRYIiwicmFuZ2VTaXplIiwiZGF0ZVdpbmRvd18iLCJkcmF3R3JhcGhfIiwidGFyZ2V0VG91Y2hlcyIsImxlbmd0aCIsImVsZW0iLCJmbiIsInR5cGVzIiwiaSIsImFkZEFuZFRyYWNrRXZlbnQiLCJEeWdyYXBoSW50ZXJhY3Rpb24iLCJkcmFnSXNQYW5JbnRlcmFjdGlvbk1vZGVsIiwiZHJhZ1N0YXJ0RXZlbnQiLCJ3aW5kb3ciLCJvcGVyYSIsImN0eCIsImNsZWFyUmVjdCIsImRyYXdNaW5pUGxvdF8iLCJleCIsIm1hcmdpbiIsImxpbmVXaWR0aCIsInN0cm9rZVN0eWxlIiwiYmVnaW5QYXRoIiwibW92ZVRvIiwibGluZVRvIiwic3Ryb2tlIiwiZmlsbFN0eWxlIiwiZmlsbEdyYWRpZW50U3R5bGUiLCJzdGVwUGxvdCIsImNvbWJpbmVkU2VyaWVzRGF0YSIsImNvbXB1dGVDb21iaW5lZFNlcmllc0FuZExpbWl0c18iLCJ5UmFuZ2UiLCJ5TWF4IiwieU1pbiIsInhFeHRyZW1lcyIsInhSYW5nZSIsInhGYWN0IiwieUZhY3QiLCJjYW52YXNXaWR0aCIsImNhbnZhc0hlaWdodCIsInByZXZYIiwicHJldlkiLCJkYXRhIiwiZGF0YVBvaW50IiwiTmFOIiwicm91bmQiLCJpc0Zpbml0ZSIsImNsb3NlUGF0aCIsImxpbmdyYWQiLCJjcmVhdGVMaW5lYXJHcmFkaWVudCIsImFkZENvbG9yU3RvcCIsImZpbGwiLCJnIiwibG9nc2NhbGUiLCJudW1Db2x1bW5zIiwibGFiZWxzIiwiZ2V0TGFiZWxzIiwiaW5jbHVkZVNlcmllcyIsIkFycmF5IiwiYW55U2V0IiwiaW5jbHVzaW9uIiwiaW5jbHVkZSIsInB1c2giLCJyb2xsZWRTZXJpZXMiLCJkYXRhSGFuZGxlciIsImRhdGFIYW5kbGVyXyIsIm9wdGlvbnMiLCJhdHRyaWJ1dGVzXyIsInNlcmllcyIsImV4dHJhY3RTZXJpZXMiLCJyYXdEYXRhXyIsInJvbGxQZXJpb2QiLCJyb2xsaW5nQXZlcmFnZSIsImNvbWJpbmVkU2VyaWVzIiwic3VtIiwiY291bnQiLCJqIiwiaXNOYU4iLCJOdW1iZXIiLCJNQVhfVkFMVUUiLCJ5VmFsIiwiZXh0cmFQZXJjZW50IiwibG9nMTAiLCJ5RXh0cmEiLCJNSU5fVkFMVUUiLCJ4V2luZG93TGltaXRzIiwieEF4aXNSYW5nZSIsImxlZnRQZXJjZW50IiwicmlnaHRQZXJjZW50IiwibGVmdENvb3JkIiwicmlnaHRDb29yZCIsImhhbmRsZVRvcCIsImxlZnRIYW5kbGVDYW52YXNQb3MiLCJyaWdodEhhbmRsZUNhbnZhc1BvcyIsInZlaWxDb2xvdXIiLCJmaWxsUmVjdCIsInBhcnNlRmxvYXQiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy9yYW5nZS1zZWxlY3Rvci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAxMSBQYXVsIEZlbGl4IChwYXVsLmVyaWMuZmVsaXhAZ21haWwuY29tKVxuICogTUlULWxpY2VuY2VkOiBodHRwczovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICovXG4vKmdsb2JhbCBEeWdyYXBoOmZhbHNlLFRvdWNoRXZlbnQ6ZmFsc2UgKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFRoaXMgZmlsZSBjb250YWlucyB0aGUgUmFuZ2VTZWxlY3RvciBwbHVnaW4gdXNlZCB0byBwcm92aWRlXG4gKiBhIHRpbWVsaW5lIHJhbmdlIHNlbGVjdG9yIHdpZGdldCBmb3IgZHlncmFwaHMuXG4gKi9cblxuLypnbG9iYWwgRHlncmFwaDpmYWxzZSAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gJy4uL2R5Z3JhcGgtdXRpbHMnO1xuaW1wb3J0IER5Z3JhcGhJbnRlcmFjdGlvbiBmcm9tICcuLi9keWdyYXBoLWludGVyYWN0aW9uLW1vZGVsJztcbmltcG9ydCBJRnJhbWVUYXJwIGZyb20gJy4uL2lmcmFtZS10YXJwJztcblxudmFyIHJhbmdlU2VsZWN0b3IgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5oYXNUb3VjaEludGVyZmFjZV8gPSB0eXBlb2YoVG91Y2hFdmVudCkgIT0gJ3VuZGVmaW5lZCc7XG4gIHRoaXMuaXNNb2JpbGVEZXZpY2VfID0gL21vYmlsZXxhbmRyb2lkL2dpLnRlc3QobmF2aWdhdG9yLmFwcFZlcnNpb24pO1xuICB0aGlzLmludGVyZmFjZUNyZWF0ZWRfID0gZmFsc2U7XG59O1xuXG5yYW5nZVNlbGVjdG9yLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gXCJSYW5nZVNlbGVjdG9yIFBsdWdpblwiO1xufTtcblxucmFuZ2VTZWxlY3Rvci5wcm90b3R5cGUuYWN0aXZhdGUgPSBmdW5jdGlvbihkeWdyYXBoKSB7XG4gIHRoaXMuZHlncmFwaF8gPSBkeWdyYXBoO1xuICBpZiAodGhpcy5nZXRPcHRpb25fKCdzaG93UmFuZ2VTZWxlY3RvcicpKSB7XG4gICAgdGhpcy5jcmVhdGVJbnRlcmZhY2VfKCk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBsYXlvdXQ6IHRoaXMucmVzZXJ2ZVNwYWNlXyxcbiAgICBwcmVkcmF3OiB0aGlzLnJlbmRlclN0YXRpY0xheWVyXyxcbiAgICBkaWREcmF3Q2hhcnQ6IHRoaXMucmVuZGVySW50ZXJhY3RpdmVMYXllcl9cbiAgfTtcbn07XG5cbnJhbmdlU2VsZWN0b3IucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5iZ2NhbnZhc18gPSBudWxsO1xuICB0aGlzLmZnY2FudmFzXyA9IG51bGw7XG4gIHRoaXMubGVmdFpvb21IYW5kbGVfID0gbnVsbDtcbiAgdGhpcy5yaWdodFpvb21IYW5kbGVfID0gbnVsbDtcbn07XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBQcml2YXRlIG1ldGhvZHNcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnJhbmdlU2VsZWN0b3IucHJvdG90eXBlLmdldE9wdGlvbl8gPSBmdW5jdGlvbihuYW1lLCBvcHRfc2VyaWVzKSB7XG4gIHJldHVybiB0aGlzLmR5Z3JhcGhfLmdldE9wdGlvbihuYW1lLCBvcHRfc2VyaWVzKTtcbn07XG5cbnJhbmdlU2VsZWN0b3IucHJvdG90eXBlLnNldERlZmF1bHRPcHRpb25fID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdGhpcy5keWdyYXBoXy5hdHRyc19bbmFtZV0gPSB2YWx1ZTtcbn07XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIENyZWF0ZXMgdGhlIHJhbmdlIHNlbGVjdG9yIGVsZW1lbnRzIGFuZCBhZGRzIHRoZW0gdG8gdGhlIGdyYXBoLlxuICovXG5yYW5nZVNlbGVjdG9yLnByb3RvdHlwZS5jcmVhdGVJbnRlcmZhY2VfID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY3JlYXRlQ2FudmFzZXNfKCk7XG4gIHRoaXMuY3JlYXRlWm9vbUhhbmRsZXNfKCk7XG4gIHRoaXMuaW5pdEludGVyYWN0aW9uXygpO1xuXG4gIC8vIFJhbmdlIHNlbGVjdG9yIGFuZCBhbmltYXRlZFpvb21zIGhhdmUgYSBiYWQgaW50ZXJhY3Rpb24uIFNlZSBpc3N1ZSAzNTkuXG4gIGlmICh0aGlzLmdldE9wdGlvbl8oJ2FuaW1hdGVkWm9vbXMnKSkge1xuICAgIGNvbnNvbGUud2FybignQW5pbWF0ZWQgem9vbXMgYW5kIHJhbmdlIHNlbGVjdG9yIGFyZSBub3QgY29tcGF0aWJsZTsgZGlzYWJsaW5nIGFuaW1hdGVkWm9vbXMuJyk7XG4gICAgdGhpcy5keWdyYXBoXy51cGRhdGVPcHRpb25zKHthbmltYXRlZFpvb21zOiBmYWxzZX0sIHRydWUpO1xuICB9XG5cbiAgdGhpcy5pbnRlcmZhY2VDcmVhdGVkXyA9IHRydWU7XG4gIHRoaXMuYWRkVG9HcmFwaF8oKTtcbn07XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIEFkZHMgdGhlIHJhbmdlIHNlbGVjdG9yIHRvIHRoZSBncmFwaC5cbiAqL1xucmFuZ2VTZWxlY3Rvci5wcm90b3R5cGUuYWRkVG9HcmFwaF8gPSBmdW5jdGlvbigpIHtcbiAgdmFyIGdyYXBoRGl2ID0gdGhpcy5ncmFwaERpdl8gPSB0aGlzLmR5Z3JhcGhfLmdyYXBoRGl2O1xuICBncmFwaERpdi5hcHBlbmRDaGlsZCh0aGlzLmJnY2FudmFzXyk7XG4gIGdyYXBoRGl2LmFwcGVuZENoaWxkKHRoaXMuZmdjYW52YXNfKTtcbiAgZ3JhcGhEaXYuYXBwZW5kQ2hpbGQodGhpcy5sZWZ0Wm9vbUhhbmRsZV8pO1xuICBncmFwaERpdi5hcHBlbmRDaGlsZCh0aGlzLnJpZ2h0Wm9vbUhhbmRsZV8pO1xufTtcblxuLyoqXG4gKiBAcHJpdmF0ZVxuICogUmVtb3ZlcyB0aGUgcmFuZ2Ugc2VsZWN0b3IgZnJvbSB0aGUgZ3JhcGguXG4gKi9cbnJhbmdlU2VsZWN0b3IucHJvdG90eXBlLnJlbW92ZUZyb21HcmFwaF8gPSBmdW5jdGlvbigpIHtcbiAgdmFyIGdyYXBoRGl2ID0gdGhpcy5ncmFwaERpdl87XG4gIGdyYXBoRGl2LnJlbW92ZUNoaWxkKHRoaXMuYmdjYW52YXNfKTtcbiAgZ3JhcGhEaXYucmVtb3ZlQ2hpbGQodGhpcy5mZ2NhbnZhc18pO1xuICBncmFwaERpdi5yZW1vdmVDaGlsZCh0aGlzLmxlZnRab29tSGFuZGxlXyk7XG4gIGdyYXBoRGl2LnJlbW92ZUNoaWxkKHRoaXMucmlnaHRab29tSGFuZGxlXyk7XG4gIHRoaXMuZ3JhcGhEaXZfID0gbnVsbDtcbn07XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIENhbGxlZCBieSBMYXlvdXQgdG8gYWxsb3cgcmFuZ2Ugc2VsZWN0b3IgdG8gcmVzZXJ2ZSBpdHMgc3BhY2UuXG4gKi9cbnJhbmdlU2VsZWN0b3IucHJvdG90eXBlLnJlc2VydmVTcGFjZV8gPSBmdW5jdGlvbihlKSB7XG4gIGlmICh0aGlzLmdldE9wdGlvbl8oJ3Nob3dSYW5nZVNlbGVjdG9yJykpIHtcbiAgICBlLnJlc2VydmVTcGFjZUJvdHRvbSh0aGlzLmdldE9wdGlvbl8oJ3JhbmdlU2VsZWN0b3JIZWlnaHQnKSArIDQpO1xuICB9XG59O1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKiBSZW5kZXJzIHRoZSBzdGF0aWMgcG9ydGlvbiBvZiB0aGUgcmFuZ2Ugc2VsZWN0b3IgYXQgdGhlIHByZWRyYXcgc3RhZ2UuXG4gKi9cbnJhbmdlU2VsZWN0b3IucHJvdG90eXBlLnJlbmRlclN0YXRpY0xheWVyXyA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIXRoaXMudXBkYXRlVmlzaWJpbGl0eV8oKSkge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLnJlc2l6ZV8oKTtcbiAgdGhpcy5kcmF3U3RhdGljTGF5ZXJfKCk7XG59O1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKiBSZW5kZXJzIHRoZSBpbnRlcmFjdGl2ZSBwb3J0aW9uIG9mIHRoZSByYW5nZSBzZWxlY3RvciBhZnRlciB0aGUgY2hhcnQgaGFzIGJlZW4gZHJhd24uXG4gKi9cbnJhbmdlU2VsZWN0b3IucHJvdG90eXBlLnJlbmRlckludGVyYWN0aXZlTGF5ZXJfID0gZnVuY3Rpb24oKSB7XG4gIGlmICghdGhpcy51cGRhdGVWaXNpYmlsaXR5XygpIHx8IHRoaXMuaXNDaGFuZ2luZ1JhbmdlXykge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLnBsYWNlWm9vbUhhbmRsZXNfKCk7XG4gIHRoaXMuZHJhd0ludGVyYWN0aXZlTGF5ZXJfKCk7XG59O1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKiBDaGVjayB0byBzZWUgaWYgdGhlIHJhbmdlIHNlbGVjdG9yIGlzIGVuYWJsZWQvZGlzYWJsZWQgYW5kIHVwZGF0ZSB2aXNpYmlsaXR5IGFjY29yZGluZ2x5LlxuICovXG5yYW5nZVNlbGVjdG9yLnByb3RvdHlwZS51cGRhdGVWaXNpYmlsaXR5XyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZW5hYmxlZCA9IHRoaXMuZ2V0T3B0aW9uXygnc2hvd1JhbmdlU2VsZWN0b3InKTtcbiAgaWYgKGVuYWJsZWQpIHtcbiAgICBpZiAoIXRoaXMuaW50ZXJmYWNlQ3JlYXRlZF8pIHtcbiAgICAgIHRoaXMuY3JlYXRlSW50ZXJmYWNlXygpO1xuICAgIH0gZWxzZSBpZiAoIXRoaXMuZ3JhcGhEaXZfIHx8ICF0aGlzLmdyYXBoRGl2Xy5wYXJlbnROb2RlKSB7XG4gICAgICB0aGlzLmFkZFRvR3JhcGhfKCk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHRoaXMuZ3JhcGhEaXZfKSB7XG4gICAgdGhpcy5yZW1vdmVGcm9tR3JhcGhfKCk7XG4gICAgdmFyIGR5Z3JhcGggPSB0aGlzLmR5Z3JhcGhfO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGR5Z3JhcGgud2lkdGhfID0gMDsgZHlncmFwaC5yZXNpemUoKTsgfSwgMSk7XG4gIH1cbiAgcmV0dXJuIGVuYWJsZWQ7XG59O1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKiBSZXNpemVzIHRoZSByYW5nZSBzZWxlY3Rvci5cbiAqL1xucmFuZ2VTZWxlY3Rvci5wcm90b3R5cGUucmVzaXplXyA9IGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBzZXRFbGVtZW50UmVjdChjYW52YXMsIGNvbnRleHQsIHJlY3QsIHBpeGVsUmF0aW9PcHRpb24pIHtcbiAgICB2YXIgY2FudmFzU2NhbGUgPSBwaXhlbFJhdGlvT3B0aW9uIHx8IHV0aWxzLmdldENvbnRleHRQaXhlbFJhdGlvKGNvbnRleHQpO1xuXG4gICAgY2FudmFzLnN0eWxlLnRvcCA9IHJlY3QueSArICdweCc7XG4gICAgY2FudmFzLnN0eWxlLmxlZnQgPSByZWN0LnggKyAncHgnO1xuICAgIGNhbnZhcy53aWR0aCA9IHJlY3QudyAqIGNhbnZhc1NjYWxlO1xuICAgIGNhbnZhcy5oZWlnaHQgPSByZWN0LmggKiBjYW52YXNTY2FsZTtcbiAgICBjYW52YXMuc3R5bGUud2lkdGggPSByZWN0LncgKyAncHgnO1xuICAgIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSByZWN0LmggKyAncHgnO1xuXG4gICAgaWYoY2FudmFzU2NhbGUgIT0gMSkge1xuICAgICAgY29udGV4dC5zY2FsZShjYW52YXNTY2FsZSwgY2FudmFzU2NhbGUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBwbG90QXJlYSA9IHRoaXMuZHlncmFwaF8ubGF5b3V0Xy5nZXRQbG90QXJlYSgpO1xuXG4gIHZhciB4QXhpc0xhYmVsSGVpZ2h0ID0gMDtcbiAgaWYgKHRoaXMuZHlncmFwaF8uZ2V0T3B0aW9uRm9yQXhpcygnZHJhd0F4aXMnLCAneCcpKSB7XG4gICAgeEF4aXNMYWJlbEhlaWdodCA9IHRoaXMuZ2V0T3B0aW9uXygneEF4aXNIZWlnaHQnKSB8fCAodGhpcy5nZXRPcHRpb25fKCdheGlzTGFiZWxGb250U2l6ZScpICsgMiAqIHRoaXMuZ2V0T3B0aW9uXygnYXhpc1RpY2tTaXplJykpO1xuICB9XG4gIHRoaXMuY2FudmFzUmVjdF8gPSB7XG4gICAgeDogcGxvdEFyZWEueCxcbiAgICB5OiBwbG90QXJlYS55ICsgcGxvdEFyZWEuaCArIHhBeGlzTGFiZWxIZWlnaHQgKyA0LFxuICAgIHc6IHBsb3RBcmVhLncsXG4gICAgaDogdGhpcy5nZXRPcHRpb25fKCdyYW5nZVNlbGVjdG9ySGVpZ2h0JylcbiAgfTtcblxuICB2YXIgcGl4ZWxSYXRpb09wdGlvbiA9IHRoaXMuZHlncmFwaF8uZ2V0TnVtZXJpY09wdGlvbigncGl4ZWxSYXRpbycpO1xuICBzZXRFbGVtZW50UmVjdCh0aGlzLmJnY2FudmFzXywgdGhpcy5iZ2NhbnZhc19jdHhfLCB0aGlzLmNhbnZhc1JlY3RfLCBwaXhlbFJhdGlvT3B0aW9uKTtcbiAgc2V0RWxlbWVudFJlY3QodGhpcy5mZ2NhbnZhc18sIHRoaXMuZmdjYW52YXNfY3R4XywgdGhpcy5jYW52YXNSZWN0XywgcGl4ZWxSYXRpb09wdGlvbik7XG59O1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKiBDcmVhdGVzIHRoZSBiYWNrZ3JvdW5kIGFuZCBmb3JlZ3JvdW5kIGNhbnZhc2VzLlxuICovXG5yYW5nZVNlbGVjdG9yLnByb3RvdHlwZS5jcmVhdGVDYW52YXNlc18gPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5iZ2NhbnZhc18gPSB1dGlscy5jcmVhdGVDYW52YXMoKTtcbiAgdGhpcy5iZ2NhbnZhc18uY2xhc3NOYW1lID0gJ2R5Z3JhcGgtcmFuZ2VzZWwtYmdjYW52YXMnO1xuICB0aGlzLmJnY2FudmFzXy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gIHRoaXMuYmdjYW52YXNfLnN0eWxlLnpJbmRleCA9IDk7XG4gIHRoaXMuYmdjYW52YXNfY3R4XyA9IHV0aWxzLmdldENvbnRleHQodGhpcy5iZ2NhbnZhc18pO1xuXG4gIHRoaXMuZmdjYW52YXNfID0gdXRpbHMuY3JlYXRlQ2FudmFzKCk7XG4gIHRoaXMuZmdjYW52YXNfLmNsYXNzTmFtZSA9ICdkeWdyYXBoLXJhbmdlc2VsLWZnY2FudmFzJztcbiAgdGhpcy5mZ2NhbnZhc18uc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICB0aGlzLmZnY2FudmFzXy5zdHlsZS56SW5kZXggPSA5O1xuICB0aGlzLmZnY2FudmFzXy5zdHlsZS5jdXJzb3IgPSAnZGVmYXVsdCc7XG4gIHRoaXMuZmdjYW52YXNfY3R4XyA9IHV0aWxzLmdldENvbnRleHQodGhpcy5mZ2NhbnZhc18pO1xufTtcblxuLyoqXG4gKiBAcHJpdmF0ZVxuICogQ3JlYXRlcyB0aGUgem9vbSBoYW5kbGUgZWxlbWVudHMuXG4gKi9cbnJhbmdlU2VsZWN0b3IucHJvdG90eXBlLmNyZWF0ZVpvb21IYW5kbGVzXyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gIGltZy5jbGFzc05hbWUgPSAnZHlncmFwaC1yYW5nZXNlbC16b29taGFuZGxlJztcbiAgaW1nLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgaW1nLnN0eWxlLnpJbmRleCA9IDEwO1xuICBpbWcuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nOyAvLyBJbml0aWFsbHkgaGlkZGVuIHNvIHRoZXkgZG9uJ3Qgc2hvdyB1cCBpbiB0aGUgd3JvbmcgcGxhY2UuXG4gIGltZy5zdHlsZS5jdXJzb3IgPSAnY29sLXJlc2l6ZSc7XG4gIC8vIFRPRE86IGNoYW5nZSBpbWFnZSB0byBtb3JlIG9wdGlvbnNcbiAgaW1nLndpZHRoID0gOTtcbiAgaW1nLmhlaWdodCA9IDE2O1xuICBpbWcuc3JjID0gJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCwnICtcbidpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQWtBQUFBUUNBWUFBQURFU0ZWREFBQUFBWE5TUjBJQXJzNGM2UUFBQUFaaVMwZEVBTkFBJyArXG4nendEUDRaN0tlZ0FBQUFsd1NGbHpBQUFPeEFBQURzUUJsU3NPR3dBQUFBZDBTVTFGQjlzSEd3MGNNcWR0MVV3QUFBQVpkRVZZZEVOdicgK1xuJ2JXMWxiblFBUTNKbFlYUmxaQ0IzYVhSb0lFZEpUVkJYZ1E0WEFBQUFhRWxFUVZRb3orM1NzUkZBUUJDRjRaOVdKTThLQ0RWd293bmwnICtcbic2WVhzVG1DVXN5S0drWnpjbDd6a3ozWUxreXBnQW5yZUZtREVwSGtJd1ZPTWZwZGk5Q0VFTjJuR3BGZHdEMDN5RXFEdE9nQ2F1bjdzJyArXG4ncVNUREgzMkkxcFFBMlBiOXNaZWNBeGM1cjNJQWIyMWQ2ODc4eHNBQUFBQUFTVVZPUks1Q1lJST0nO1xuXG4gIGlmICh0aGlzLmlzTW9iaWxlRGV2aWNlXykge1xuICAgIGltZy53aWR0aCAqPSAyO1xuICAgIGltZy5oZWlnaHQgKj0gMjtcbiAgfVxuXG4gIHRoaXMubGVmdFpvb21IYW5kbGVfID0gaW1nO1xuICB0aGlzLnJpZ2h0Wm9vbUhhbmRsZV8gPSBpbWcuY2xvbmVOb2RlKGZhbHNlKTtcbn07XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIFNldHMgdXAgdGhlIGludGVyYWN0aW9uIGZvciB0aGUgcmFuZ2Ugc2VsZWN0b3IuXG4gKi9cbnJhbmdlU2VsZWN0b3IucHJvdG90eXBlLmluaXRJbnRlcmFjdGlvbl8gPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgdG9wRWxlbSA9IGRvY3VtZW50O1xuICB2YXIgY2xpZW50WExhc3QgPSAwO1xuICB2YXIgaGFuZGxlID0gbnVsbDtcbiAgdmFyIGlzWm9vbWluZyA9IGZhbHNlO1xuICB2YXIgaXNQYW5uaW5nID0gZmFsc2U7XG4gIHZhciBkeW5hbWljID0gIXRoaXMuaXNNb2JpbGVEZXZpY2VfO1xuXG4gIC8vIFdlIGNvdmVyIGlmcmFtZXMgZHVyaW5nIG1vdXNlIGludGVyYWN0aW9ucy4gU2VlIGNvbW1lbnRzIGluXG4gIC8vIGR5Z3JhcGgtdXRpbHMuanMgZm9yIG1vcmUgaW5mbyBvbiB3aHkgdGhpcyBpcyBhIGdvb2QgaWRlYS5cbiAgdmFyIHRhcnAgPSBuZXcgSUZyYW1lVGFycCgpO1xuXG4gIC8vIGZ1bmN0aW9ucywgZGVmaW5lZCBiZWxvdy4gIERlZmluaW5nIHRoZW0gdGhpcyB3YXkgKHJhdGhlciB0aGFuIHdpdGhcbiAgLy8gXCJmdW5jdGlvbiBmb28oKSB7Li4ufVwiKSBtYWtlcyBKU0hpbnQgaGFwcHkuXG4gIHZhciB0b1hEYXRhV2luZG93LCBvblpvb21TdGFydCwgb25ab29tLCBvblpvb21FbmQsIGRvWm9vbSwgaXNNb3VzZUluUGFuWm9uZSxcbiAgICAgIG9uUGFuU3RhcnQsIG9uUGFuLCBvblBhbkVuZCwgZG9QYW4sIG9uQ2FudmFzSG92ZXI7XG5cbiAgLy8gVG91Y2ggZXZlbnQgZnVuY3Rpb25zXG4gIHZhciBvblpvb21IYW5kbGVUb3VjaEV2ZW50LCBvbkNhbnZhc1RvdWNoRXZlbnQsIGFkZFRvdWNoRXZlbnRzO1xuXG4gIHRvWERhdGFXaW5kb3cgPSBmdW5jdGlvbih6b29tSGFuZGxlU3RhdHVzKSB7XG4gICAgdmFyIHhEYXRhTGltaXRzID0gc2VsZi5keWdyYXBoXy54QXhpc0V4dHJlbWVzKCk7XG4gICAgdmFyIGZhY3QgPSAoeERhdGFMaW1pdHNbMV0gLSB4RGF0YUxpbWl0c1swXSkvc2VsZi5jYW52YXNSZWN0Xy53O1xuICAgIHZhciB4RGF0YU1pbiA9IHhEYXRhTGltaXRzWzBdICsgKHpvb21IYW5kbGVTdGF0dXMubGVmdEhhbmRsZVBvcyAtIHNlbGYuY2FudmFzUmVjdF8ueCkqZmFjdDtcbiAgICB2YXIgeERhdGFNYXggPSB4RGF0YUxpbWl0c1swXSArICh6b29tSGFuZGxlU3RhdHVzLnJpZ2h0SGFuZGxlUG9zIC0gc2VsZi5jYW52YXNSZWN0Xy54KSpmYWN0O1xuICAgIHJldHVybiBbeERhdGFNaW4sIHhEYXRhTWF4XTtcbiAgfTtcblxuICBvblpvb21TdGFydCA9IGZ1bmN0aW9uKGUpIHtcbiAgICB1dGlscy5jYW5jZWxFdmVudChlKTtcbiAgICBpc1pvb21pbmcgPSB0cnVlO1xuICAgIGNsaWVudFhMYXN0ID0gZS5jbGllbnRYO1xuICAgIGhhbmRsZSA9IGUudGFyZ2V0ID8gZS50YXJnZXQgOiBlLnNyY0VsZW1lbnQ7XG4gICAgaWYgKGUudHlwZSA9PT0gJ21vdXNlZG93bicgfHwgZS50eXBlID09PSAnZHJhZ3N0YXJ0Jykge1xuICAgICAgLy8gVGhlc2UgZXZlbnRzIGFyZSByZW1vdmVkIG1hbnVhbGx5LlxuICAgICAgdXRpbHMuYWRkRXZlbnQodG9wRWxlbSwgJ21vdXNlbW92ZScsIG9uWm9vbSk7XG4gICAgICB1dGlscy5hZGRFdmVudCh0b3BFbGVtLCAnbW91c2V1cCcsIG9uWm9vbUVuZCk7XG4gICAgfVxuICAgIHNlbGYuZmdjYW52YXNfLnN0eWxlLmN1cnNvciA9ICdjb2wtcmVzaXplJztcbiAgICB0YXJwLmNvdmVyKCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgb25ab29tID0gZnVuY3Rpb24oZSkge1xuICAgIGlmICghaXNab29taW5nKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHV0aWxzLmNhbmNlbEV2ZW50KGUpO1xuXG4gICAgdmFyIGRlbFggPSBlLmNsaWVudFggLSBjbGllbnRYTGFzdDtcbiAgICBpZiAoTWF0aC5hYnMoZGVsWCkgPCA0KSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgY2xpZW50WExhc3QgPSBlLmNsaWVudFg7XG5cbiAgICAvLyBNb3ZlIGhhbmRsZS5cbiAgICB2YXIgem9vbUhhbmRsZVN0YXR1cyA9IHNlbGYuZ2V0Wm9vbUhhbmRsZVN0YXR1c18oKTtcbiAgICB2YXIgbmV3UG9zO1xuICAgIGlmIChoYW5kbGUgPT0gc2VsZi5sZWZ0Wm9vbUhhbmRsZV8pIHtcbiAgICAgIG5ld1BvcyA9IHpvb21IYW5kbGVTdGF0dXMubGVmdEhhbmRsZVBvcyArIGRlbFg7XG4gICAgICBuZXdQb3MgPSBNYXRoLm1pbihuZXdQb3MsIHpvb21IYW5kbGVTdGF0dXMucmlnaHRIYW5kbGVQb3MgLSBoYW5kbGUud2lkdGggLSAzKTtcbiAgICAgIG5ld1BvcyA9IE1hdGgubWF4KG5ld1Bvcywgc2VsZi5jYW52YXNSZWN0Xy54KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV3UG9zID0gem9vbUhhbmRsZVN0YXR1cy5yaWdodEhhbmRsZVBvcyArIGRlbFg7XG4gICAgICBuZXdQb3MgPSBNYXRoLm1pbihuZXdQb3MsIHNlbGYuY2FudmFzUmVjdF8ueCArIHNlbGYuY2FudmFzUmVjdF8udyk7XG4gICAgICBuZXdQb3MgPSBNYXRoLm1heChuZXdQb3MsIHpvb21IYW5kbGVTdGF0dXMubGVmdEhhbmRsZVBvcyArIGhhbmRsZS53aWR0aCArIDMpO1xuICAgIH1cbiAgICB2YXIgaGFsZkhhbmRsZVdpZHRoID0gaGFuZGxlLndpZHRoLzI7XG4gICAgaGFuZGxlLnN0eWxlLmxlZnQgPSAobmV3UG9zIC0gaGFsZkhhbmRsZVdpZHRoKSArICdweCc7XG4gICAgc2VsZi5kcmF3SW50ZXJhY3RpdmVMYXllcl8oKTtcblxuICAgIC8vIFpvb20gb24gdGhlIGZseS5cbiAgICBpZiAoZHluYW1pYykge1xuICAgICAgZG9ab29tKCk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIG9uWm9vbUVuZCA9IGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAoIWlzWm9vbWluZykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpc1pvb21pbmcgPSBmYWxzZTtcbiAgICB0YXJwLnVuY292ZXIoKTtcbiAgICB1dGlscy5yZW1vdmVFdmVudCh0b3BFbGVtLCAnbW91c2Vtb3ZlJywgb25ab29tKTtcbiAgICB1dGlscy5yZW1vdmVFdmVudCh0b3BFbGVtLCAnbW91c2V1cCcsIG9uWm9vbUVuZCk7XG4gICAgc2VsZi5mZ2NhbnZhc18uc3R5bGUuY3Vyc29yID0gJ2RlZmF1bHQnO1xuXG4gICAgLy8gSWYgb24gYSBzbG93ZXIgZGV2aWNlLCB6b29tIG5vdy5cbiAgICBpZiAoIWR5bmFtaWMpIHtcbiAgICAgIGRvWm9vbSgpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICBkb1pvb20gPSBmdW5jdGlvbigpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHpvb21IYW5kbGVTdGF0dXMgPSBzZWxmLmdldFpvb21IYW5kbGVTdGF0dXNfKCk7XG4gICAgICBzZWxmLmlzQ2hhbmdpbmdSYW5nZV8gPSB0cnVlO1xuICAgICAgaWYgKCF6b29tSGFuZGxlU3RhdHVzLmlzWm9vbWVkKSB7XG4gICAgICAgIHNlbGYuZHlncmFwaF8ucmVzZXRab29tKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgeERhdGFXaW5kb3cgPSB0b1hEYXRhV2luZG93KHpvb21IYW5kbGVTdGF0dXMpO1xuICAgICAgICBzZWxmLmR5Z3JhcGhfLmRvWm9vbVhEYXRlc18oeERhdGFXaW5kb3dbMF0sIHhEYXRhV2luZG93WzFdKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2VsZi5pc0NoYW5naW5nUmFuZ2VfID0gZmFsc2U7XG4gICAgfVxuICB9O1xuXG4gIGlzTW91c2VJblBhblpvbmUgPSBmdW5jdGlvbihlKSB7XG4gICAgdmFyIHJlY3QgPSBzZWxmLmxlZnRab29tSGFuZGxlXy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB2YXIgbGVmdEhhbmRsZUNsaWVudFggPSByZWN0LmxlZnQgKyByZWN0LndpZHRoLzI7XG4gICAgcmVjdCA9IHNlbGYucmlnaHRab29tSGFuZGxlXy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB2YXIgcmlnaHRIYW5kbGVDbGllbnRYID0gcmVjdC5sZWZ0ICsgcmVjdC53aWR0aC8yO1xuICAgIHJldHVybiAoZS5jbGllbnRYID4gbGVmdEhhbmRsZUNsaWVudFggJiYgZS5jbGllbnRYIDwgcmlnaHRIYW5kbGVDbGllbnRYKTtcbiAgfTtcblxuICBvblBhblN0YXJ0ID0gZnVuY3Rpb24oZSkge1xuICAgIGlmICghaXNQYW5uaW5nICYmIGlzTW91c2VJblBhblpvbmUoZSkgJiYgc2VsZi5nZXRab29tSGFuZGxlU3RhdHVzXygpLmlzWm9vbWVkKSB7XG4gICAgICB1dGlscy5jYW5jZWxFdmVudChlKTtcbiAgICAgIGlzUGFubmluZyA9IHRydWU7XG4gICAgICBjbGllbnRYTGFzdCA9IGUuY2xpZW50WDtcbiAgICAgIGlmIChlLnR5cGUgPT09ICdtb3VzZWRvd24nKSB7XG4gICAgICAgIC8vIFRoZXNlIGV2ZW50cyBhcmUgcmVtb3ZlZCBtYW51YWxseS5cbiAgICAgICAgdXRpbHMuYWRkRXZlbnQodG9wRWxlbSwgJ21vdXNlbW92ZScsIG9uUGFuKTtcbiAgICAgICAgdXRpbHMuYWRkRXZlbnQodG9wRWxlbSwgJ21vdXNldXAnLCBvblBhbkVuZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIG9uUGFuID0gZnVuY3Rpb24oZSkge1xuICAgIGlmICghaXNQYW5uaW5nKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHV0aWxzLmNhbmNlbEV2ZW50KGUpO1xuXG4gICAgdmFyIGRlbFggPSBlLmNsaWVudFggLSBjbGllbnRYTGFzdDtcbiAgICBpZiAoTWF0aC5hYnMoZGVsWCkgPCA0KSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgY2xpZW50WExhc3QgPSBlLmNsaWVudFg7XG5cbiAgICAvLyBNb3ZlIHJhbmdlIHZpZXdcbiAgICB2YXIgem9vbUhhbmRsZVN0YXR1cyA9IHNlbGYuZ2V0Wm9vbUhhbmRsZVN0YXR1c18oKTtcbiAgICB2YXIgbGVmdEhhbmRsZVBvcyA9IHpvb21IYW5kbGVTdGF0dXMubGVmdEhhbmRsZVBvcztcbiAgICB2YXIgcmlnaHRIYW5kbGVQb3MgPSB6b29tSGFuZGxlU3RhdHVzLnJpZ2h0SGFuZGxlUG9zO1xuICAgIHZhciByYW5nZVNpemUgPSByaWdodEhhbmRsZVBvcyAtIGxlZnRIYW5kbGVQb3M7XG4gICAgaWYgKGxlZnRIYW5kbGVQb3MgKyBkZWxYIDw9IHNlbGYuY2FudmFzUmVjdF8ueCkge1xuICAgICAgbGVmdEhhbmRsZVBvcyA9IHNlbGYuY2FudmFzUmVjdF8ueDtcbiAgICAgIHJpZ2h0SGFuZGxlUG9zID0gbGVmdEhhbmRsZVBvcyArIHJhbmdlU2l6ZTtcbiAgICB9IGVsc2UgaWYgKHJpZ2h0SGFuZGxlUG9zICsgZGVsWCA+PSBzZWxmLmNhbnZhc1JlY3RfLnggKyBzZWxmLmNhbnZhc1JlY3RfLncpIHtcbiAgICAgIHJpZ2h0SGFuZGxlUG9zID0gc2VsZi5jYW52YXNSZWN0Xy54ICsgc2VsZi5jYW52YXNSZWN0Xy53O1xuICAgICAgbGVmdEhhbmRsZVBvcyA9IHJpZ2h0SGFuZGxlUG9zIC0gcmFuZ2VTaXplO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZWZ0SGFuZGxlUG9zICs9IGRlbFg7XG4gICAgICByaWdodEhhbmRsZVBvcyArPSBkZWxYO1xuICAgIH1cbiAgICB2YXIgaGFsZkhhbmRsZVdpZHRoID0gc2VsZi5sZWZ0Wm9vbUhhbmRsZV8ud2lkdGgvMjtcbiAgICBzZWxmLmxlZnRab29tSGFuZGxlXy5zdHlsZS5sZWZ0ID0gKGxlZnRIYW5kbGVQb3MgLSBoYWxmSGFuZGxlV2lkdGgpICsgJ3B4JztcbiAgICBzZWxmLnJpZ2h0Wm9vbUhhbmRsZV8uc3R5bGUubGVmdCA9IChyaWdodEhhbmRsZVBvcyAtIGhhbGZIYW5kbGVXaWR0aCkgKyAncHgnO1xuICAgIHNlbGYuZHJhd0ludGVyYWN0aXZlTGF5ZXJfKCk7XG5cbiAgICAvLyBEbyBwYW4gb24gdGhlIGZseS5cbiAgICBpZiAoZHluYW1pYykge1xuICAgICAgZG9QYW4oKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgb25QYW5FbmQgPSBmdW5jdGlvbihlKSB7XG4gICAgaWYgKCFpc1Bhbm5pbmcpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaXNQYW5uaW5nID0gZmFsc2U7XG4gICAgdXRpbHMucmVtb3ZlRXZlbnQodG9wRWxlbSwgJ21vdXNlbW92ZScsIG9uUGFuKTtcbiAgICB1dGlscy5yZW1vdmVFdmVudCh0b3BFbGVtLCAnbW91c2V1cCcsIG9uUGFuRW5kKTtcbiAgICAvLyBJZiBvbiBhIHNsb3dlciBkZXZpY2UsIGRvIHBhbiBub3cuXG4gICAgaWYgKCFkeW5hbWljKSB7XG4gICAgICBkb1BhbigpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICBkb1BhbiA9IGZ1bmN0aW9uKCkge1xuICAgIHRyeSB7XG4gICAgICBzZWxmLmlzQ2hhbmdpbmdSYW5nZV8gPSB0cnVlO1xuICAgICAgc2VsZi5keWdyYXBoXy5kYXRlV2luZG93XyA9IHRvWERhdGFXaW5kb3coc2VsZi5nZXRab29tSGFuZGxlU3RhdHVzXygpKTtcbiAgICAgIHNlbGYuZHlncmFwaF8uZHJhd0dyYXBoXyhmYWxzZSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNlbGYuaXNDaGFuZ2luZ1JhbmdlXyA9IGZhbHNlO1xuICAgIH1cbiAgfTtcblxuICBvbkNhbnZhc0hvdmVyID0gZnVuY3Rpb24oZSkge1xuICAgIGlmIChpc1pvb21pbmcgfHwgaXNQYW5uaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBjdXJzb3IgPSBpc01vdXNlSW5QYW5ab25lKGUpID8gJ21vdmUnIDogJ2RlZmF1bHQnO1xuICAgIGlmIChjdXJzb3IgIT0gc2VsZi5mZ2NhbnZhc18uc3R5bGUuY3Vyc29yKSB7XG4gICAgICBzZWxmLmZnY2FudmFzXy5zdHlsZS5jdXJzb3IgPSBjdXJzb3I7XG4gICAgfVxuICB9O1xuXG4gIG9uWm9vbUhhbmRsZVRvdWNoRXZlbnQgPSBmdW5jdGlvbihlKSB7XG4gICAgaWYgKGUudHlwZSA9PSAndG91Y2hzdGFydCcgJiYgZS50YXJnZXRUb3VjaGVzLmxlbmd0aCA9PSAxKSB7XG4gICAgICBpZiAob25ab29tU3RhcnQoZS50YXJnZXRUb3VjaGVzWzBdKSkge1xuICAgICAgICB1dGlscy5jYW5jZWxFdmVudChlKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGUudHlwZSA9PSAndG91Y2htb3ZlJyAmJiBlLnRhcmdldFRvdWNoZXMubGVuZ3RoID09IDEpIHtcbiAgICAgIGlmIChvblpvb20oZS50YXJnZXRUb3VjaGVzWzBdKSkge1xuICAgICAgICB1dGlscy5jYW5jZWxFdmVudChlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgb25ab29tRW5kKGUpO1xuICAgIH1cbiAgfTtcblxuICBvbkNhbnZhc1RvdWNoRXZlbnQgPSBmdW5jdGlvbihlKSB7XG4gICAgaWYgKGUudHlwZSA9PSAndG91Y2hzdGFydCcgJiYgZS50YXJnZXRUb3VjaGVzLmxlbmd0aCA9PSAxKSB7XG4gICAgICBpZiAob25QYW5TdGFydChlLnRhcmdldFRvdWNoZXNbMF0pKSB7XG4gICAgICAgIHV0aWxzLmNhbmNlbEV2ZW50KGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZS50eXBlID09ICd0b3VjaG1vdmUnICYmIGUudGFyZ2V0VG91Y2hlcy5sZW5ndGggPT0gMSkge1xuICAgICAgaWYgKG9uUGFuKGUudGFyZ2V0VG91Y2hlc1swXSkpIHtcbiAgICAgICAgdXRpbHMuY2FuY2VsRXZlbnQoZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG9uUGFuRW5kKGUpO1xuICAgIH1cbiAgfTtcblxuICBhZGRUb3VjaEV2ZW50cyA9IGZ1bmN0aW9uKGVsZW0sIGZuKSB7XG4gICAgdmFyIHR5cGVzID0gWyd0b3VjaHN0YXJ0JywgJ3RvdWNoZW5kJywgJ3RvdWNobW92ZScsICd0b3VjaGNhbmNlbCddO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdHlwZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHNlbGYuZHlncmFwaF8uYWRkQW5kVHJhY2tFdmVudChlbGVtLCB0eXBlc1tpXSwgZm4pO1xuICAgIH1cbiAgfTtcblxuICB0aGlzLnNldERlZmF1bHRPcHRpb25fKCdpbnRlcmFjdGlvbk1vZGVsJywgRHlncmFwaEludGVyYWN0aW9uLmRyYWdJc1BhbkludGVyYWN0aW9uTW9kZWwpO1xuICB0aGlzLnNldERlZmF1bHRPcHRpb25fKCdwYW5FZGdlRnJhY3Rpb24nLCAwLjAwMDEpO1xuXG4gIHZhciBkcmFnU3RhcnRFdmVudCA9IHdpbmRvdy5vcGVyYSA/ICdtb3VzZWRvd24nIDogJ2RyYWdzdGFydCc7XG4gIHRoaXMuZHlncmFwaF8uYWRkQW5kVHJhY2tFdmVudCh0aGlzLmxlZnRab29tSGFuZGxlXywgZHJhZ1N0YXJ0RXZlbnQsIG9uWm9vbVN0YXJ0KTtcbiAgdGhpcy5keWdyYXBoXy5hZGRBbmRUcmFja0V2ZW50KHRoaXMucmlnaHRab29tSGFuZGxlXywgZHJhZ1N0YXJ0RXZlbnQsIG9uWm9vbVN0YXJ0KTtcblxuICB0aGlzLmR5Z3JhcGhfLmFkZEFuZFRyYWNrRXZlbnQodGhpcy5mZ2NhbnZhc18sICdtb3VzZWRvd24nLCBvblBhblN0YXJ0KTtcbiAgdGhpcy5keWdyYXBoXy5hZGRBbmRUcmFja0V2ZW50KHRoaXMuZmdjYW52YXNfLCAnbW91c2Vtb3ZlJywgb25DYW52YXNIb3Zlcik7XG5cbiAgLy8gVG91Y2ggZXZlbnRzXG4gIGlmICh0aGlzLmhhc1RvdWNoSW50ZXJmYWNlXykge1xuICAgIGFkZFRvdWNoRXZlbnRzKHRoaXMubGVmdFpvb21IYW5kbGVfLCBvblpvb21IYW5kbGVUb3VjaEV2ZW50KTtcbiAgICBhZGRUb3VjaEV2ZW50cyh0aGlzLnJpZ2h0Wm9vbUhhbmRsZV8sIG9uWm9vbUhhbmRsZVRvdWNoRXZlbnQpO1xuICAgIGFkZFRvdWNoRXZlbnRzKHRoaXMuZmdjYW52YXNfLCBvbkNhbnZhc1RvdWNoRXZlbnQpO1xuICB9XG59O1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKiBEcmF3cyB0aGUgc3RhdGljIGxheWVyIGluIHRoZSBiYWNrZ3JvdW5kIGNhbnZhcy5cbiAqL1xucmFuZ2VTZWxlY3Rvci5wcm90b3R5cGUuZHJhd1N0YXRpY0xheWVyXyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgY3R4ID0gdGhpcy5iZ2NhbnZhc19jdHhfO1xuICBjdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzUmVjdF8udywgdGhpcy5jYW52YXNSZWN0Xy5oKTtcbiAgdHJ5IHtcbiAgICB0aGlzLmRyYXdNaW5pUGxvdF8oKTtcbiAgfSBjYXRjaChleCkge1xuICAgIGNvbnNvbGUud2FybihleCk7XG4gIH1cblxuICB2YXIgbWFyZ2luID0gMC41O1xuICB0aGlzLmJnY2FudmFzX2N0eF8ubGluZVdpZHRoID0gdGhpcy5nZXRPcHRpb25fKCdyYW5nZVNlbGVjdG9yQmFja2dyb3VuZExpbmVXaWR0aCcpO1xuICBjdHguc3Ryb2tlU3R5bGUgPSB0aGlzLmdldE9wdGlvbl8oJ3JhbmdlU2VsZWN0b3JCYWNrZ3JvdW5kU3Ryb2tlQ29sb3InKTtcbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHgubW92ZVRvKG1hcmdpbiwgbWFyZ2luKTtcbiAgY3R4LmxpbmVUbyhtYXJnaW4sIHRoaXMuY2FudmFzUmVjdF8uaC1tYXJnaW4pO1xuICBjdHgubGluZVRvKHRoaXMuY2FudmFzUmVjdF8udy1tYXJnaW4sIHRoaXMuY2FudmFzUmVjdF8uaC1tYXJnaW4pO1xuICBjdHgubGluZVRvKHRoaXMuY2FudmFzUmVjdF8udy1tYXJnaW4sIG1hcmdpbik7XG4gIGN0eC5zdHJva2UoKTtcbn07XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIERyYXdzIHRoZSBtaW5pIHBsb3QgaW4gdGhlIGJhY2tncm91bmQgY2FudmFzLlxuICovXG5yYW5nZVNlbGVjdG9yLnByb3RvdHlwZS5kcmF3TWluaVBsb3RfID0gZnVuY3Rpb24oKSB7XG4gIHZhciBmaWxsU3R5bGUgPSB0aGlzLmdldE9wdGlvbl8oJ3JhbmdlU2VsZWN0b3JQbG90RmlsbENvbG9yJyk7XG4gIHZhciBmaWxsR3JhZGllbnRTdHlsZSA9IHRoaXMuZ2V0T3B0aW9uXygncmFuZ2VTZWxlY3RvclBsb3RGaWxsR3JhZGllbnRDb2xvcicpO1xuICB2YXIgc3Ryb2tlU3R5bGUgPSB0aGlzLmdldE9wdGlvbl8oJ3JhbmdlU2VsZWN0b3JQbG90U3Ryb2tlQ29sb3InKTtcbiAgaWYgKCFmaWxsU3R5bGUgJiYgIXN0cm9rZVN0eWxlKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIHN0ZXBQbG90ID0gdGhpcy5nZXRPcHRpb25fKCdzdGVwUGxvdCcpO1xuXG4gIHZhciBjb21iaW5lZFNlcmllc0RhdGEgPSB0aGlzLmNvbXB1dGVDb21iaW5lZFNlcmllc0FuZExpbWl0c18oKTtcbiAgdmFyIHlSYW5nZSA9IGNvbWJpbmVkU2VyaWVzRGF0YS55TWF4IC0gY29tYmluZWRTZXJpZXNEYXRhLnlNaW47XG5cbiAgLy8gRHJhdyB0aGUgbWluaSBwbG90LlxuICB2YXIgY3R4ID0gdGhpcy5iZ2NhbnZhc19jdHhfO1xuICB2YXIgbWFyZ2luID0gMC41O1xuXG4gIHZhciB4RXh0cmVtZXMgPSB0aGlzLmR5Z3JhcGhfLnhBeGlzRXh0cmVtZXMoKTtcbiAgdmFyIHhSYW5nZSA9IE1hdGgubWF4KHhFeHRyZW1lc1sxXSAtIHhFeHRyZW1lc1swXSwgMS5lLTMwKTtcbiAgdmFyIHhGYWN0ID0gKHRoaXMuY2FudmFzUmVjdF8udyAtIG1hcmdpbikveFJhbmdlO1xuICB2YXIgeUZhY3QgPSAodGhpcy5jYW52YXNSZWN0Xy5oIC0gbWFyZ2luKS95UmFuZ2U7XG4gIHZhciBjYW52YXNXaWR0aCA9IHRoaXMuY2FudmFzUmVjdF8udyAtIG1hcmdpbjtcbiAgdmFyIGNhbnZhc0hlaWdodCA9IHRoaXMuY2FudmFzUmVjdF8uaCAtIG1hcmdpbjtcblxuICB2YXIgcHJldlggPSBudWxsLCBwcmV2WSA9IG51bGw7XG5cbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHgubW92ZVRvKG1hcmdpbiwgY2FudmFzSGVpZ2h0KTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb21iaW5lZFNlcmllc0RhdGEuZGF0YS5sZW5ndGg7IGkrKykge1xuICAgIHZhciBkYXRhUG9pbnQgPSBjb21iaW5lZFNlcmllc0RhdGEuZGF0YVtpXTtcbiAgICB2YXIgeCA9ICgoZGF0YVBvaW50WzBdICE9PSBudWxsKSA/ICgoZGF0YVBvaW50WzBdIC0geEV4dHJlbWVzWzBdKSp4RmFjdCkgOiBOYU4pO1xuICAgIHZhciB5ID0gKChkYXRhUG9pbnRbMV0gIT09IG51bGwpID8gKGNhbnZhc0hlaWdodCAtIChkYXRhUG9pbnRbMV0gLSBjb21iaW5lZFNlcmllc0RhdGEueU1pbikqeUZhY3QpIDogTmFOKTtcblxuICAgIC8vIFNraXAgcG9pbnRzIHRoYXQgZG9uJ3QgY2hhbmdlIHRoZSB4LXZhbHVlLiBPdmVybHkgZmluZS1ncmFpbmVkIHBvaW50c1xuICAgIC8vIGNhbiBjYXVzZSBtYWpvciBzbG93ZG93bnMgd2l0aCB0aGUgY3R4LmZpbGwoKSBjYWxsIGJlbG93LlxuICAgIGlmICghc3RlcFBsb3QgJiYgcHJldlggIT09IG51bGwgJiYgTWF0aC5yb3VuZCh4KSA9PSBNYXRoLnJvdW5kKHByZXZYKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKGlzRmluaXRlKHgpICYmIGlzRmluaXRlKHkpKSB7XG4gICAgICBpZihwcmV2WCA9PT0gbnVsbCkge1xuICAgICAgICBjdHgubGluZVRvKHgsIGNhbnZhc0hlaWdodCk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChzdGVwUGxvdCkge1xuICAgICAgICBjdHgubGluZVRvKHgsIHByZXZZKTtcbiAgICAgIH1cbiAgICAgIGN0eC5saW5lVG8oeCwgeSk7XG4gICAgICBwcmV2WCA9IHg7XG4gICAgICBwcmV2WSA9IHk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgaWYocHJldlggIT09IG51bGwpIHtcbiAgICAgICAgaWYgKHN0ZXBQbG90KSB7XG4gICAgICAgICAgY3R4LmxpbmVUbyh4LCBwcmV2WSk7XG4gICAgICAgICAgY3R4LmxpbmVUbyh4LCBjYW52YXNIZWlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGN0eC5saW5lVG8ocHJldlgsIGNhbnZhc0hlaWdodCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHByZXZYID0gcHJldlkgPSBudWxsO1xuICAgIH1cbiAgfVxuICBjdHgubGluZVRvKGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQpO1xuICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgaWYgKGZpbGxTdHlsZSkge1xuICAgIHZhciBsaW5ncmFkID0gdGhpcy5iZ2NhbnZhc19jdHhfLmNyZWF0ZUxpbmVhckdyYWRpZW50KDAsIDAsIDAsIGNhbnZhc0hlaWdodCk7XG4gICAgaWYgKGZpbGxHcmFkaWVudFN0eWxlKSB7XG4gICAgICBsaW5ncmFkLmFkZENvbG9yU3RvcCgwLCBmaWxsR3JhZGllbnRTdHlsZSk7XG4gICAgfVxuICAgIGxpbmdyYWQuYWRkQ29sb3JTdG9wKDEsIGZpbGxTdHlsZSk7XG4gICAgdGhpcy5iZ2NhbnZhc19jdHhfLmZpbGxTdHlsZSA9IGxpbmdyYWQ7XG4gICAgY3R4LmZpbGwoKTtcbiAgfVxuXG4gIGlmIChzdHJva2VTdHlsZSkge1xuICAgIHRoaXMuYmdjYW52YXNfY3R4Xy5zdHJva2VTdHlsZSA9IHN0cm9rZVN0eWxlO1xuICAgIHRoaXMuYmdjYW52YXNfY3R4Xy5saW5lV2lkdGggPSB0aGlzLmdldE9wdGlvbl8oJ3JhbmdlU2VsZWN0b3JQbG90TGluZVdpZHRoJyk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICB9XG59O1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKiBDb21wdXRlcyBhbmQgcmV0dXJucyB0aGUgY29tYmluZWQgc2VyaWVzIGRhdGEgYWxvbmcgd2l0aCBtaW4vbWF4IGZvciB0aGUgbWluaSBwbG90LlxuICogVGhlIGNvbWJpbmVkIHNlcmllcyBjb25zaXN0cyBvZiBhdmVyYWdlZCB2YWx1ZXMgZm9yIGFsbCBzZXJpZXMuXG4gKiBXaGVuIHNlcmllcyBoYXZlIGVycm9yIGJhcnMsIHRoZSBlcnJvciBiYXJzIGFyZSBpZ25vcmVkLlxuICogQHJldHVybiB7T2JqZWN0fSBBbiBvYmplY3QgY29udGFpbmluZyBjb21iaW5lZCBzZXJpZXMgYXJyYXksIHltaW4sIHltYXguXG4gKi9cbnJhbmdlU2VsZWN0b3IucHJvdG90eXBlLmNvbXB1dGVDb21iaW5lZFNlcmllc0FuZExpbWl0c18gPSBmdW5jdGlvbigpIHtcbiAgdmFyIGcgPSB0aGlzLmR5Z3JhcGhfO1xuICB2YXIgbG9nc2NhbGUgPSB0aGlzLmdldE9wdGlvbl8oJ2xvZ3NjYWxlJyk7XG4gIHZhciBpO1xuXG4gIC8vIFNlbGVjdCBzZXJpZXMgdG8gY29tYmluZS4gQnkgZGVmYXVsdCwgYWxsIHNlcmllcyBhcmUgY29tYmluZWQuXG4gIHZhciBudW1Db2x1bW5zID0gZy5udW1Db2x1bW5zKCk7XG4gIHZhciBsYWJlbHMgPSBnLmdldExhYmVscygpO1xuICB2YXIgaW5jbHVkZVNlcmllcyA9IG5ldyBBcnJheShudW1Db2x1bW5zKTtcbiAgdmFyIGFueVNldCA9IGZhbHNlO1xuICB2YXIgdmlzaWJpbGl0eSA9IGcudmlzaWJpbGl0eSgpO1xuICB2YXIgaW5jbHVzaW9uID0gW107XG5cbiAgZm9yIChpID0gMTsgaSA8IG51bUNvbHVtbnM7IGkrKykge1xuICAgIHZhciBpbmNsdWRlID0gdGhpcy5nZXRPcHRpb25fKCdzaG93SW5SYW5nZVNlbGVjdG9yJywgbGFiZWxzW2ldKTtcbiAgICBpbmNsdXNpb24ucHVzaChpbmNsdWRlKTtcbiAgICBpZiAoaW5jbHVkZSAhPT0gbnVsbCkgYW55U2V0ID0gdHJ1ZTsgIC8vIGl0J3Mgc2V0IGV4cGxpY2l0bHkgZm9yIHRoaXMgc2VyaWVzXG4gIH1cblxuICBpZiAoYW55U2V0KSB7XG4gICAgZm9yIChpID0gMTsgaSA8IG51bUNvbHVtbnM7IGkrKykge1xuICAgICAgaW5jbHVkZVNlcmllc1tpXSA9IGluY2x1c2lvbltpIC0gMV07XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGZvciAoaSA9IDE7IGkgPCBudW1Db2x1bW5zOyBpKyspIHtcbiAgICAgIGluY2x1ZGVTZXJpZXNbaV0gPSB2aXNpYmlsaXR5W2kgLSAxXTtcbiAgICB9XG4gIH1cblxuICAvLyBDcmVhdGUgYSBjb21iaW5lZCBzZXJpZXMgKGF2ZXJhZ2Ugb2Ygc2VsZWN0ZWQgc2VyaWVzIHZhbHVlcykuXG4gIC8vIFRPRE8oZGFudmspOiBzaG9ydC1jaXJjdWl0IGlmIHRoZXJlJ3Mgb25seSBvbmUgc2VyaWVzLlxuICB2YXIgcm9sbGVkU2VyaWVzID0gW107XG4gIHZhciBkYXRhSGFuZGxlciA9IGcuZGF0YUhhbmRsZXJfO1xuICB2YXIgb3B0aW9ucyA9IGcuYXR0cmlidXRlc187XG4gIGZvciAoaSA9IDE7IGkgPCBnLm51bUNvbHVtbnMoKTsgaSsrKSB7XG4gICAgaWYgKCFpbmNsdWRlU2VyaWVzW2ldKSBjb250aW51ZTtcbiAgICB2YXIgc2VyaWVzID0gZGF0YUhhbmRsZXIuZXh0cmFjdFNlcmllcyhnLnJhd0RhdGFfLCBpLCBvcHRpb25zKTtcbiAgICBpZiAoZy5yb2xsUGVyaW9kKCkgPiAxKSB7XG4gICAgICBzZXJpZXMgPSBkYXRhSGFuZGxlci5yb2xsaW5nQXZlcmFnZShzZXJpZXMsIGcucm9sbFBlcmlvZCgpLCBvcHRpb25zLCBpKTtcbiAgICB9XG5cbiAgICByb2xsZWRTZXJpZXMucHVzaChzZXJpZXMpO1xuICB9XG5cbiAgdmFyIGNvbWJpbmVkU2VyaWVzID0gW107XG4gIGZvciAoaSA9IDA7IGkgPCByb2xsZWRTZXJpZXNbMF0ubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgc3VtID0gMDtcbiAgICB2YXIgY291bnQgPSAwO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgcm9sbGVkU2VyaWVzLmxlbmd0aDsgaisrKSB7XG4gICAgICB2YXIgeSA9IHJvbGxlZFNlcmllc1tqXVtpXVsxXTtcbiAgICAgIGlmICh5ID09PSBudWxsIHx8IGlzTmFOKHkpKSBjb250aW51ZTtcbiAgICAgIGNvdW50Kys7XG4gICAgICBzdW0gKz0geTtcbiAgICB9XG4gICAgY29tYmluZWRTZXJpZXMucHVzaChbcm9sbGVkU2VyaWVzWzBdW2ldWzBdLCBzdW0gLyBjb3VudF0pO1xuICB9XG5cbiAgLy8gQ29tcHV0ZSB0aGUgeSByYW5nZS5cbiAgdmFyIHlNaW4gPSBOdW1iZXIuTUFYX1ZBTFVFO1xuICB2YXIgeU1heCA9IC1OdW1iZXIuTUFYX1ZBTFVFO1xuICBmb3IgKGkgPSAwOyBpIDwgY29tYmluZWRTZXJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgeVZhbCA9IGNvbWJpbmVkU2VyaWVzW2ldWzFdO1xuICAgIGlmICh5VmFsICE9PSBudWxsICYmIGlzRmluaXRlKHlWYWwpICYmICghbG9nc2NhbGUgfHwgeVZhbCA+IDApKSB7XG4gICAgICB5TWluID0gTWF0aC5taW4oeU1pbiwgeVZhbCk7XG4gICAgICB5TWF4ID0gTWF0aC5tYXgoeU1heCwgeVZhbCk7XG4gICAgfVxuICB9XG5cbiAgLy8gQ29udmVydCBZIGRhdGEgdG8gbG9nIHNjYWxlIGlmIG5lZWRlZC5cbiAgLy8gQWxzbywgZXhwYW5kIHRoZSBZIHJhbmdlIHRvIGNvbXByZXNzIHRoZSBtaW5pIHBsb3QgYSBsaXR0bGUuXG4gIHZhciBleHRyYVBlcmNlbnQgPSAwLjI1O1xuICBpZiAobG9nc2NhbGUpIHtcbiAgICB5TWF4ID0gdXRpbHMubG9nMTAoeU1heCk7XG4gICAgeU1heCArPSB5TWF4KmV4dHJhUGVyY2VudDtcbiAgICB5TWluID0gdXRpbHMubG9nMTAoeU1pbik7XG4gICAgZm9yIChpID0gMDsgaSA8IGNvbWJpbmVkU2VyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb21iaW5lZFNlcmllc1tpXVsxXSA9IHV0aWxzLmxvZzEwKGNvbWJpbmVkU2VyaWVzW2ldWzFdKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFyIHlFeHRyYTtcbiAgICB2YXIgeVJhbmdlID0geU1heCAtIHlNaW47XG4gICAgaWYgKHlSYW5nZSA8PSBOdW1iZXIuTUlOX1ZBTFVFKSB7XG4gICAgICB5RXh0cmEgPSB5TWF4KmV4dHJhUGVyY2VudDtcbiAgICB9IGVsc2Uge1xuICAgICAgeUV4dHJhID0geVJhbmdlKmV4dHJhUGVyY2VudDtcbiAgICB9XG4gICAgeU1heCArPSB5RXh0cmE7XG4gICAgeU1pbiAtPSB5RXh0cmE7XG4gIH1cblxuICByZXR1cm4ge2RhdGE6IGNvbWJpbmVkU2VyaWVzLCB5TWluOiB5TWluLCB5TWF4OiB5TWF4fTtcbn07XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIFBsYWNlcyB0aGUgem9vbSBoYW5kbGVzIGluIHRoZSBwcm9wZXIgcG9zaXRpb24gYmFzZWQgb24gdGhlIGN1cnJlbnQgWCBkYXRhIHdpbmRvdy5cbiAqL1xucmFuZ2VTZWxlY3Rvci5wcm90b3R5cGUucGxhY2Vab29tSGFuZGxlc18gPSBmdW5jdGlvbigpIHtcbiAgdmFyIHhFeHRyZW1lcyA9IHRoaXMuZHlncmFwaF8ueEF4aXNFeHRyZW1lcygpO1xuICB2YXIgeFdpbmRvd0xpbWl0cyA9IHRoaXMuZHlncmFwaF8ueEF4aXNSYW5nZSgpO1xuICB2YXIgeFJhbmdlID0geEV4dHJlbWVzWzFdIC0geEV4dHJlbWVzWzBdO1xuICB2YXIgbGVmdFBlcmNlbnQgPSBNYXRoLm1heCgwLCAoeFdpbmRvd0xpbWl0c1swXSAtIHhFeHRyZW1lc1swXSkveFJhbmdlKTtcbiAgdmFyIHJpZ2h0UGVyY2VudCA9IE1hdGgubWF4KDAsICh4RXh0cmVtZXNbMV0gLSB4V2luZG93TGltaXRzWzFdKS94UmFuZ2UpO1xuICB2YXIgbGVmdENvb3JkID0gdGhpcy5jYW52YXNSZWN0Xy54ICsgdGhpcy5jYW52YXNSZWN0Xy53KmxlZnRQZXJjZW50O1xuICB2YXIgcmlnaHRDb29yZCA9IHRoaXMuY2FudmFzUmVjdF8ueCArIHRoaXMuY2FudmFzUmVjdF8udyooMSAtIHJpZ2h0UGVyY2VudCk7XG4gIHZhciBoYW5kbGVUb3AgPSBNYXRoLm1heCh0aGlzLmNhbnZhc1JlY3RfLnksIHRoaXMuY2FudmFzUmVjdF8ueSArICh0aGlzLmNhbnZhc1JlY3RfLmggLSB0aGlzLmxlZnRab29tSGFuZGxlXy5oZWlnaHQpLzIpO1xuICB2YXIgaGFsZkhhbmRsZVdpZHRoID0gdGhpcy5sZWZ0Wm9vbUhhbmRsZV8ud2lkdGgvMjtcbiAgdGhpcy5sZWZ0Wm9vbUhhbmRsZV8uc3R5bGUubGVmdCA9IChsZWZ0Q29vcmQgLSBoYWxmSGFuZGxlV2lkdGgpICsgJ3B4JztcbiAgdGhpcy5sZWZ0Wm9vbUhhbmRsZV8uc3R5bGUudG9wID0gaGFuZGxlVG9wICsgJ3B4JztcbiAgdGhpcy5yaWdodFpvb21IYW5kbGVfLnN0eWxlLmxlZnQgPSAocmlnaHRDb29yZCAtIGhhbGZIYW5kbGVXaWR0aCkgKyAncHgnO1xuICB0aGlzLnJpZ2h0Wm9vbUhhbmRsZV8uc3R5bGUudG9wID0gdGhpcy5sZWZ0Wm9vbUhhbmRsZV8uc3R5bGUudG9wO1xuXG4gIHRoaXMubGVmdFpvb21IYW5kbGVfLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gIHRoaXMucmlnaHRab29tSGFuZGxlXy5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xufTtcblxuLyoqXG4gKiBAcHJpdmF0ZVxuICogRHJhd3MgdGhlIGludGVyYWN0aXZlIGxheWVyIGluIHRoZSBmb3JlZ3JvdW5kIGNhbnZhcy5cbiAqL1xucmFuZ2VTZWxlY3Rvci5wcm90b3R5cGUuZHJhd0ludGVyYWN0aXZlTGF5ZXJfID0gZnVuY3Rpb24oKSB7XG4gIHZhciBjdHggPSB0aGlzLmZnY2FudmFzX2N0eF87XG4gIGN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXNSZWN0Xy53LCB0aGlzLmNhbnZhc1JlY3RfLmgpO1xuICB2YXIgbWFyZ2luID0gMTtcbiAgdmFyIHdpZHRoID0gdGhpcy5jYW52YXNSZWN0Xy53IC0gbWFyZ2luO1xuICB2YXIgaGVpZ2h0ID0gdGhpcy5jYW52YXNSZWN0Xy5oIC0gbWFyZ2luO1xuICB2YXIgem9vbUhhbmRsZVN0YXR1cyA9IHRoaXMuZ2V0Wm9vbUhhbmRsZVN0YXR1c18oKTtcblxuICBjdHguc3Ryb2tlU3R5bGUgPSB0aGlzLmdldE9wdGlvbl8oJ3JhbmdlU2VsZWN0b3JGb3JlZ3JvdW5kU3Ryb2tlQ29sb3InKTtcbiAgY3R4LmxpbmVXaWR0aCA9IHRoaXMuZ2V0T3B0aW9uXygncmFuZ2VTZWxlY3RvckZvcmVncm91bmRMaW5lV2lkdGgnKTtcbiAgaWYgKCF6b29tSGFuZGxlU3RhdHVzLmlzWm9vbWVkKSB7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5tb3ZlVG8obWFyZ2luLCBtYXJnaW4pO1xuICAgIGN0eC5saW5lVG8obWFyZ2luLCBoZWlnaHQpO1xuICAgIGN0eC5saW5lVG8od2lkdGgsIGhlaWdodCk7XG4gICAgY3R4LmxpbmVUbyh3aWR0aCwgbWFyZ2luKTtcbiAgICBjdHguc3Ryb2tlKCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGxlZnRIYW5kbGVDYW52YXNQb3MgPSBNYXRoLm1heChtYXJnaW4sIHpvb21IYW5kbGVTdGF0dXMubGVmdEhhbmRsZVBvcyAtIHRoaXMuY2FudmFzUmVjdF8ueCk7XG4gICAgdmFyIHJpZ2h0SGFuZGxlQ2FudmFzUG9zID0gTWF0aC5taW4od2lkdGgsIHpvb21IYW5kbGVTdGF0dXMucmlnaHRIYW5kbGVQb3MgLSB0aGlzLmNhbnZhc1JlY3RfLngpO1xuXG4gICAgY29uc3QgdmVpbENvbG91ciA9IHRoaXMuZ2V0T3B0aW9uXygncmFuZ2VTZWxlY3RvclZlaWxDb2xvdXInKTtcbiAgICBjdHguZmlsbFN0eWxlID0gdmVpbENvbG91ciA/IHZlaWxDb2xvdXIgOlxuICAgICAgKCdyZ2JhKDI0MCwgMjQwLCAyNDAsICcgKyB0aGlzLmdldE9wdGlvbl8oJ3JhbmdlU2VsZWN0b3JBbHBoYScpLnRvU3RyaW5nKCkgKyAnKScpO1xuICAgIGN0eC5maWxsUmVjdCgwLCAwLCBsZWZ0SGFuZGxlQ2FudmFzUG9zLCB0aGlzLmNhbnZhc1JlY3RfLmgpO1xuICAgIGN0eC5maWxsUmVjdChyaWdodEhhbmRsZUNhbnZhc1BvcywgMCwgdGhpcy5jYW52YXNSZWN0Xy53IC0gcmlnaHRIYW5kbGVDYW52YXNQb3MsIHRoaXMuY2FudmFzUmVjdF8uaCk7XG5cbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4Lm1vdmVUbyhtYXJnaW4sIG1hcmdpbik7XG4gICAgY3R4LmxpbmVUbyhsZWZ0SGFuZGxlQ2FudmFzUG9zLCBtYXJnaW4pO1xuICAgIGN0eC5saW5lVG8obGVmdEhhbmRsZUNhbnZhc1BvcywgaGVpZ2h0KTtcbiAgICBjdHgubGluZVRvKHJpZ2h0SGFuZGxlQ2FudmFzUG9zLCBoZWlnaHQpO1xuICAgIGN0eC5saW5lVG8ocmlnaHRIYW5kbGVDYW52YXNQb3MsIG1hcmdpbik7XG4gICAgY3R4LmxpbmVUbyh3aWR0aCwgbWFyZ2luKTtcbiAgICBjdHguc3Ryb2tlKCk7XG4gIH1cbn07XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIFJldHVybnMgdGhlIGN1cnJlbnQgem9vbSBoYW5kbGUgcG9zaXRpb24gaW5mb3JtYXRpb24uXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB6b29tIGhhbmRsZSBzdGF0dXMuXG4gKi9cbnJhbmdlU2VsZWN0b3IucHJvdG90eXBlLmdldFpvb21IYW5kbGVTdGF0dXNfID0gZnVuY3Rpb24oKSB7XG4gIHZhciBoYWxmSGFuZGxlV2lkdGggPSB0aGlzLmxlZnRab29tSGFuZGxlXy53aWR0aC8yO1xuICB2YXIgbGVmdEhhbmRsZVBvcyA9IHBhcnNlRmxvYXQodGhpcy5sZWZ0Wm9vbUhhbmRsZV8uc3R5bGUubGVmdCkgKyBoYWxmSGFuZGxlV2lkdGg7XG4gIHZhciByaWdodEhhbmRsZVBvcyA9IHBhcnNlRmxvYXQodGhpcy5yaWdodFpvb21IYW5kbGVfLnN0eWxlLmxlZnQpICsgaGFsZkhhbmRsZVdpZHRoO1xuICByZXR1cm4ge1xuICAgICAgbGVmdEhhbmRsZVBvczogbGVmdEhhbmRsZVBvcyxcbiAgICAgIHJpZ2h0SGFuZGxlUG9zOiByaWdodEhhbmRsZVBvcyxcbiAgICAgIGlzWm9vbWVkOiAobGVmdEhhbmRsZVBvcyAtIDEgPiB0aGlzLmNhbnZhc1JlY3RfLnggfHwgcmlnaHRIYW5kbGVQb3MgKyAxIDwgdGhpcy5jYW52YXNSZWN0Xy54K3RoaXMuY2FudmFzUmVjdF8udylcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHJhbmdlU2VsZWN0b3I7XG4iXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFlBQVk7O0FBQUM7RUFBQTtBQUFBO0FBQUE7QUFFYjtBQUNBO0FBQ0E7QUFBd0M7QUFBQTtBQUFBO0FBRXhDLElBQUlBLGFBQWEsR0FBRyxTQUFoQkEsYUFBYSxHQUFjO0VBQzdCLElBQUksQ0FBQ0Msa0JBQWtCLEdBQUcsT0FBT0MsVUFBVyxJQUFJLFdBQVc7RUFDM0QsSUFBSSxDQUFDQyxlQUFlLEdBQUcsa0JBQWtCLENBQUNDLElBQUksQ0FBQ0MsU0FBUyxDQUFDQyxVQUFVLENBQUM7RUFDcEUsSUFBSSxDQUFDQyxpQkFBaUIsR0FBRyxLQUFLO0FBQ2hDLENBQUM7QUFFRFAsYUFBYSxDQUFDUSxTQUFTLENBQUNDLFFBQVEsR0FBRyxZQUFXO0VBQzVDLE9BQU8sc0JBQXNCO0FBQy9CLENBQUM7QUFFRFQsYUFBYSxDQUFDUSxTQUFTLENBQUNFLFFBQVEsR0FBRyxVQUFTQyxPQUFPLEVBQUU7RUFDbkQsSUFBSSxDQUFDQyxRQUFRLEdBQUdELE9BQU87RUFDdkIsSUFBSSxJQUFJLENB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