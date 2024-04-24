/**
 * @license
 * Copyright 2011 Robert Konigsberg (konigsberg@google.com)
 * MIT-licenced: https://opensource.org/licenses/MIT
 */

/**
 * @fileoverview The default interaction model for Dygraphs. This is kept out
 * of dygraph.js for better navigability.
 * @author Robert Konigsberg (konigsberg@google.com)
 */

/*global Dygraph:false */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var utils = _interopRequireWildcard(require("./dygraph-utils"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * You can drag this many pixels past the edge of the chart and still have it
 * be considered a zoom. This makes it easier to zoom to the exact edge of the
 * chart, a fairly common operation.
 */
var DRAG_EDGE_MARGIN = 100;

/**
 * A collection of functions to facilitate build custom interaction models.
 * @class
 */
var DygraphInteraction = {};

/**
 * Checks whether the beginning & ending of an event were close enough that it
 * should be considered a click. If it should, dispatch appropriate events.
 * Returns true if the event was treated as a click.
 *
 * @param {Event} event
 * @param {Dygraph} g
 * @param {Object} context
 */
DygraphInteraction.maybeTreatMouseOpAsClick = function (event, g, context) {
  context.dragEndX = utils.dragGetX_(event, context);
  context.dragEndY = utils.dragGetY_(event, context);
  var regionWidth = Math.abs(context.dragEndX - context.dragStartX);
  var regionHeight = Math.abs(context.dragEndY - context.dragStartY);
  if (regionWidth < 2 && regionHeight < 2 && g.lastx_ !== undefined && g.lastx_ !== null) {
    DygraphInteraction.treatMouseOpAsClick(g, event, context);
  }
  context.regionWidth = regionWidth;
  context.regionHeight = regionHeight;
};

/**
 * Called in response to an interaction model operation that
 * should start the default panning behavior.
 *
 * It's used in the default callback for "mousedown" operations.
 * Custom interaction model builders can use it to provide the default
 * panning behavior.
 *
 * @param {Event} event the event object which led to the startPan call.
 * @param {Dygraph} g The dygraph on which to act.
 * @param {Object} context The dragging context object (with
 *     dragStartX/dragStartY/etc. properties). This function modifies the
 *     context.
 */
DygraphInteraction.startPan = function (event, g, context) {
  var i, axis;
  context.isPanning = true;
  var xRange = g.xAxisRange();
  if (g.getOptionForAxis("logscale", "x")) {
    context.initialLeftmostDate = utils.log10(xRange[0]);
    context.dateRange = utils.log10(xRange[1]) - utils.log10(xRange[0]);
  } else {
    context.initialLeftmostDate = xRange[0];
    context.dateRange = xRange[1] - xRange[0];
  }
  context.xUnitsPerPixel = context.dateRange / (g.plotter_.area.w - 1);
  if (g.getNumericOption("panEdgeFraction")) {
    var maxXPixelsToDraw = g.width_ * g.getNumericOption("panEdgeFraction");
    var xExtremes = g.xAxisExtremes(); // I REALLY WANT TO CALL THIS xTremes!

    var boundedLeftX = g.toDomXCoord(xExtremes[0]) - maxXPixelsToDraw;
    var boundedRightX = g.toDomXCoord(xExtremes[1]) + maxXPixelsToDraw;
    var boundedLeftDate = g.toDataXCoord(boundedLeftX);
    var boundedRightDate = g.toDataXCoord(boundedRightX);
    context.boundedDates = [boundedLeftDate, boundedRightDate];
    var boundedValues = [];
    var maxYPixelsToDraw = g.height_ * g.getNumericOption("panEdgeFraction");
    for (i = 0; i < g.axes_.length; i++) {
      axis = g.axes_[i];
      var yExtremes = axis.extremeRange;
      var boundedTopY = g.toDomYCoord(yExtremes[0], i) + maxYPixelsToDraw;
      var boundedBottomY = g.toDomYCoord(yExtremes[1], i) - maxYPixelsToDraw;
      var boundedTopValue = g.toDataYCoord(boundedTopY, i);
      var boundedBottomValue = g.toDataYCoord(boundedBottomY, i);
      boundedValues[i] = [boundedTopValue, boundedBottomValue];
    }
    context.boundedValues = boundedValues;
  } else {
    // undo effect if it was once set
    context.boundedDates = null;
    context.boundedValues = null;
  }

  // Record the range of each y-axis at the start of the drag.
  // If any axis has a valueRange, then we want a 2D pan.
  // We can't store data directly in g.axes_, because it does not belong to us
  // and could change out from under us during a pan (say if there's a data
  // update).
  context.is2DPan = false;
  context.axes = [];
  for (i = 0; i < g.axes_.length; i++) {
    axis = g.axes_[i];
    var axis_data = {};
    var yRange = g.yAxisRange(i);
    // TODO(konigsberg): These values should be in |context|.
    // In log scale, initialTopValue, dragValueRange and unitsPerPixel are log scale.
    var logscale = g.attributes_.getForAxis("logscale", i);
    if (logscale) {
      axis_data.initialTopValue = utils.log10(yRange[1]);
      axis_data.dragValueRange = utils.log10(yRange[1]) - utils.log10(yRange[0]);
    } else {
      axis_data.initialTopValue = yRange[1];
      axis_data.dragValueRange = yRange[1] - yRange[0];
    }
    axis_data.unitsPerPixel = axis_data.dragValueRange / (g.plotter_.area.h - 1);
    context.axes.push(axis_data);

    // While calculating axes, set 2dpan.
    if (axis.valueRange) context.is2DPan = true;
  }
};

/**
 * Called in response to an interaction model operation that
 * responds to an event that pans the view.
 *
 * It's used in the default callback for "mousemove" operations.
 * Custom interaction model builders can use it to provide the default
 * panning behavior.
 *
 * @param {Event} event the event object which led to the movePan call.
 * @param {Dygraph} g The dygraph on which to act.
 * @param {Object} context The dragging context object (with
 *     dragStartX/dragStartY/etc. properties). This function modifies the
 *     context.
 */
DygraphInteraction.movePan = function (event, g, context) {
  context.dragEndX = utils.dragGetX_(event, context);
  context.dragEndY = utils.dragGetY_(event, context);
  var minDate = context.initialLeftmostDate - (context.dragEndX - context.dragStartX) * context.xUnitsPerPixel;
  if (context.boundedDates) {
    minDate = Math.max(minDate, context.boundedDates[0]);
  }
  var maxDate = minDate + context.dateRange;
  if (context.boundedDates) {
    if (maxDate > context.boundedDates[1]) {
      // Adjust minDate, and recompute maxDate.
      minDate = minDate - (maxDate - context.boundedDates[1]);
      maxDate = minDate + context.dateRange;
    }
  }
  if (g.getOptionForAxis("logscale", "x")) {
    g.dateWindow_ = [Math.pow(utils.LOG_SCALE, minDate), Math.pow(utils.LOG_SCALE, maxDate)];
  } else {
    g.dateWindow_ = [minDate, maxDate];
  }

  // y-axis scaling is automatic unless this is a full 2D pan.
  if (context.is2DPan) {
    var pixelsDragged = context.dragEndY - context.dragStartY;

    // Adjust each axis appropriately.
    for (var i = 0; i < g.axes_.length; i++) {
      var axis = g.axes_[i];
      var axis_data = context.axes[i];
      var unitsDragged = pixelsDragged * axis_data.unitsPerPixel;
      var boundedValue = context.boundedValues ? context.boundedValues[i] : null;

      // In log scale, maxValue and minValue are the logs of those values.
      var maxValue = axis_data.initialTopValue + unitsDragged;
      if (boundedValue) {
        maxValue = Math.min(maxValue, boundedValue[1]);
      }
      var minValue = maxValue - axis_data.dragValueRange;
      if (boundedValue) {
        if (minValue < boundedValue[0]) {
          // Adjust maxValue, and recompute minValue.
          maxValue = maxValue - (minValue - boundedValue[0]);
          minValue = maxValue - axis_data.dragValueRange;
        }
      }
      if (g.attributes_.getForAxis("logscale", i)) {
        axis.valueRange = [Math.pow(utils.LOG_SCALE, minValue), Math.pow(utils.LOG_SCALE, maxValue)];
      } else {
        axis.valueRange = [minValue, maxValue];
      }
    }
  }
  g.drawGraph_(false);
};

/**
 * Called in response to an interaction model operation that
 * responds to an event that ends panning.
 *
 * It's used in the default callback for "mouseup" operations.
 * Custom interaction model builders can use it to provide the default
 * panning behavior.
 *
 * @param {Event} event the event object which led to the endPan call.
 * @param {Dygraph} g The dygraph on which to act.
 * @param {Object} context The dragging context object (with
 *     dragStartX/dragStartY/etc. properties). This function modifies the
 *     context.
 */
DygraphInteraction.endPan = DygraphInteraction.maybeTreatMouseOpAsClick;

/**
 * Called in response to an interaction model operation that
 * responds to an event that starts zooming.
 *
 * It's used in the default callback for "mousedown" operations.
 * Custom interaction model builders can use it to provide the default
 * zooming behavior.
 *
 * @param {Event} event the event object which led to the startZoom call.
 * @param {Dygraph} g The dygraph on which to act.
 * @param {Object} context The dragging context object (with
 *     dragStartX/dragStartY/etc. properties). This function modifies the
 *     context.
 */
DygraphInteraction.startZoom = function (event, g, context) {
  context.isZooming = true;
  context.zoomMoved = false;
};

/**
 * Called in response to an interaction model operation that
 * responds to an event that defines zoom boundaries.
 *
 * It's used in the default callback for "mousemove" operations.
 * Custom interaction model builders can use it to provide the default
 * zooming behavior.
 *
 * @param {Event} event the event object which led to the moveZoom call.
 * @param {Dygraph} g The dygraph on which to act.
 * @param {Object} context The dragging context object (with
 *     dragStartX/dragStartY/etc. properties). This function modifies the
 *     context.
 */
DygraphInteraction.moveZoom = function (event, g, context) {
  context.zoomMoved = true;
  context.dragEndX = utils.dragGetX_(event, context);
  context.dragEndY = utils.dragGetY_(event, context);
  var xDelta = Math.abs(context.dragStartX - context.dragEndX);
  var yDelta = Math.abs(context.dragStartY - context.dragEndY);

  // drag direction threshold for y axis is twice as large as x axis
  context.dragDirection = xDelta < yDelta / 2 ? utils.VERTICAL : utils.HORIZONTAL;
  g.drawZoomRect_(context.dragDirection, context.dragStartX, context.dragEndX, context.dragStartY, context.dragEndY, context.prevDragDirection, context.prevEndX, context.prevEndY);
  context.prevEndX = context.dragEndX;
  context.prevEndY = context.dragEndY;
  context.prevDragDirection = context.dragDirection;
};

/**
 * TODO(danvk): move this logic into dygraph.js
 * @param {Dygraph} g
 * @param {Event} event
 * @param {Object} context
 */
DygraphInteraction.treatMouseOpAsClick = function (g, event, context) {
  var clickCallback = g.getFunctionOption('clickCallback');
  var pointClickCallback = g.getFunctionOption('pointClickCallback');
  var selectedPoint = null;

  // Find out if the click occurs on a point.
  var closestIdx = -1;
  var closestDistance = Number.MAX_VALUE;

  // check if the click was on a particular point.
  for (var i = 0; i < g.selPoints_.length; i++) {
    var p = g.selPoints_[i];
    var distance = Math.pow(p.canvasx - context.dragEndX, 2) + Math.pow(p.canvasy - context.dragEndY, 2);
    if (!isNaN(distance) && (closestIdx == -1 || distance < closestDistance)) {
      closestDistance = distance;
      closestIdx = i;
    }
  }

  // Allow any click within two pixels of the dot.
  var radius = g.getNumericOption('highlightCircleSize') + 2;
  if (closestDistance <= radius * radius) {
    selectedPoint = g.selPoints_[closestIdx];
  }
  if (selectedPoint) {
    var e = {
      cancelable: true,
      point: selectedPoint,
      canvasx: context.dragEndX,
      canvasy: context.dragEndY
    };
    var defaultPrevented = g.cascadeEvents_('pointClick', e);
    if (defaultPrevented) {
      // Note: this also prevents click / clickCallback from firing.
      return;
    }
    if (pointClickCallback) {
      pointClickCallback.call(g, event, selectedPoint);
    }
  }
  var e = {
    cancelable: true,
    xval: g.lastx_,
    // closest point by x value
    pts: g.selPoints_,
    canvasx: context.dragEndX,
    canvasy: context.dragEndY
  };
  if (!g.cascadeEvents_('click', e)) {
    if (clickCallback) {
      // TODO(danvk): pass along more info about the points, e.g. 'x'
      clickCallback.call(g, event, g.lastx_, g.selPoints_);
    }
  }
};

/**
 * Called in response to an interaction model operation that
 * responds to an event that performs a zoom based on previously defined
 * bounds..
 *
 * It's used in the default callback for "mouseup" operations.
 * Custom interaction model builders can use it to provide the default
 * zooming behavior.
 *
 * @param {Event} event the event object which led to the endZoom call.
 * @param {Dygraph} g The dygraph on which to end the zoom.
 * @param {Object} context The dragging context object (with
 *     dragStartX/dragStartY/etc. properties). This function modifies the
 *     context.
 */
DygraphInteraction.endZoom = function (event, g, context) {
  g.clearZoomRect_();
  context.isZooming = false;
  DygraphInteraction.maybeTreatMouseOpAsClick(event, g, context);

  // The zoom rectangle is visibly clipped to the plot area, so its behavior
  // should be as well.
  // See http://code.google.com/p/dygraphs/issues/detail?id=280
  var plotArea = g.getArea();
  if (context.regionWidth >= 10 && context.dragDirection == utils.HORIZONTAL) {
    var left = Math.min(context.dragStartX, context.dragEndX),
      right = Math.max(context.dragStartX, context.dragEndX);
    left = Math.max(left, plotArea.x);
    right = Math.min(right, plotArea.x + plotArea.w);
    if (left < right) {
      g.doZoomX_(left, right);
    }
    context.cancelNextDblclick = true;
  } else if (context.regionHeight >= 10 && context.dragDirection == utils.VERTICAL) {
    var top = Math.min(context.dragStartY, context.dragEndY),
      bottom = Math.max(context.dragStartY, context.dragEndY);
    top = Math.max(top, plotArea.y);
    bottom = Math.min(bottom, plotArea.y + plotArea.h);
    if (top < bottom) {
      g.doZoomY_(top, bottom);
    }
    context.cancelNextDblclick = true;
  }
  context.dragStartX = null;
  context.dragStartY = null;
};

/**
 * @private
 */
DygraphInteraction.startTouch = function (event, g, context) {
  event.preventDefault(); // touch browsers are all nice.
  if (event.touches.length > 1) {
    // If the user ever puts two fingers down, it's not a double tap.
    context.startTimeForDoubleTapMs = null;
  }
  var touches = [];
  for (var i = 0; i < event.touches.length; i++) {
    var t = event.touches[i];
    var rect = t.target.getBoundingClientRect();
    // we dispense with 'dragGetX_' because all touchBrowsers support pageX
    touches.push({
      pageX: t.pageX,
      pageY: t.pageY,
      dataX: g.toDataXCoord(t.clientX - rect.left),
      dataY: g.toDataYCoord(t.clientY - rect.top)
      // identifier: t.identifier
    });
  }

  context.initialTouches = touches;
  if (touches.length == 1) {
    // This is just a swipe.
    context.initialPinchCenter = touches[0];
    context.touchDirections = {
      x: true,
      y: true
    };
  } else if (touches.length >= 2) {
    // It's become a pinch!
    // In case there are 3+ touches, we ignore all but the "first" two.

    // only screen coordinates can be averaged (data coords could be log scale).
    context.initialPinchCenter = {
      pageX: 0.5 * (touches[0].pageX + touches[1].pageX),
      pageY: 0.5 * (touches[0].pageY + touches[1].pageY),
      // TODO(danvk): remove
      dataX: 0.5 * (touches[0].dataX + touches[1].dataX),
      dataY: 0.5 * (touches[0].dataY + touches[1].dataY)
    };

    // Make pinches in a 45-degree swath around either axis 1-dimensional zooms.
    var initialAngle = 180 / Math.PI * Math.atan2(context.initialPinchCenter.pageY - touches[0].pageY, touches[0].pageX - context.initialPinchCenter.pageX);

    // use symmetry to get it into the first quadrant.
    initialAngle = Math.abs(initialAngle);
    if (initialAngle > 90) initialAngle = 90 - initialAngle;
    context.touchDirections = {
      x: initialAngle < 90 - 45 / 2,
      y: initialAngle > 45 / 2
    };
  }

  // save the full x & y ranges.
  context.initialRange = {
    x: g.xAxisRange(),
    y: g.yAxisRange()
  };
};

/**
 * @private
 */
DygraphInteraction.moveTouch = function (event, g, context) {
  // If the tap moves, then it's definitely not part of a double-tap.
  context.startTimeForDoubleTapMs = null;
  var i,
    touches = [];
  for (i = 0; i < event.touches.length; i++) {
    var t = event.touches[i];
    touches.push({
      pageX: t.pageX,
      pageY: t.pageY
    });
  }
  var initialTouches = context.initialTouches;
  var c_now;

  // old and new centers.
  var c_init = context.initialPinchCenter;
  if (touches.length == 1) {
    c_now = touches[0];
  } else {
    c_now = {
      pageX: 0.5 * (touches[0].pageX + touches[1].pageX),
      pageY: 0.5 * (touches[0].pageY + touches[1].pageY)
    };
  }

  // this is the "swipe" component
  // we toss it out for now, but could use it in the future.
  var swipe = {
    pageX: c_now.pageX - c_init.pageX,
    pageY: c_now.pageY - c_init.pageY
  };
  var dataWidth = context.initialRange.x[1] - context.initialRange.x[0];
  var dataHeight = context.initialRange.y[0] - context.initialRange.y[1];
  swipe.dataX = swipe.pageX / g.plotter_.area.w * dataWidth;
  swipe.dataY = swipe.pageY / g.plotter_.area.h * dataHeight;
  var xScale, yScale;

  // The residual bits are usually split into scale & rotate bits, but we split
  // them into x-scale and y-scale bits.
  if (touches.length == 1) {
    xScale = 1.0;
    yScale = 1.0;
  } else if (touches.length >= 2) {
    var initHalfWidth = initialTouches[1].pageX - c_init.pageX;
    xScale = (touches[1].pageX - c_now.pageX) / initHalfWidth;
    var initHalfHeight = initialTouches[1].pageY - c_init.pageY;
    yScale = (touches[1].pageY - c_now.pageY) / initHalfHeight;
  }

  // Clip scaling to [1/8, 8] to prevent too much blowup.
  xScale = Math.min(8, Math.max(0.125, xScale));
  yScale = Math.min(8, Math.max(0.125, yScale));
  var didZoom = false;
  if (context.touchDirections.x) {
    var cFactor = c_init.dataX - swipe.dataX / xScale;
    g.dateWindow_ = [cFactor + (context.initialRange.x[0] - c_init.dataX) / xScale, cFactor + (context.initialRange.x[1] - c_init.dataX) / xScale];
    didZoom = true;
  }
  if (context.touchDirections.y) {
    for (i = 0; i < 1 /*g.axes_.length*/; i++) {
      var axis = g.axes_[i];
      var logscale = g.attributes_.getForAxis("logscale", i);
      if (logscale) {
        // TODO(danvk): implement
      } else {
        var cFactor = c_init.dataY - swipe.dataY / yScale;
        axis.valueRange = [cFactor + (context.initialRange.y[0] - c_init.dataY) / yScale, cFactor + (context.initialRange.y[1] - c_init.dataY) / yScale];
        didZoom = true;
      }
    }
  }
  g.drawGraph_(false);

  // We only call zoomCallback on zooms, not pans, to mirror desktop behavior.
  if (didZoom && touches.length > 1 && g.getFunctionOption('zoomCallback')) {
    var viewWindow = g.xAxisRange();
    g.getFunctionOption("zoomCallback").call(g, viewWindow[0], viewWindow[1], g.yAxisRanges());
  }
};

/**
 * @private
 */
DygraphInteraction.endTouch = function (event, g, context) {
  if (event.touches.length !== 0) {
    // this is effectively a "reset"
    DygraphInteraction.startTouch(event, g, context);
  } else if (event.changedTouches.length == 1) {
    // Could be part of a "double tap"
    // The heuristic here is that it's a double-tap if the two touchend events
    // occur within 500ms and within a 50x50 pixel box.
    var now = new Date().getTime();
    var t = event.changedTouches[0];
    if (context.startTimeForDoubleTapMs && now - context.startTimeForDoubleTapMs < 500 && context.doubleTapX && Math.abs(context.doubleTapX - t.screenX) < 50 && context.doubleTapY && Math.abs(context.doubleTapY - t.screenY) < 50) {
      g.resetZoom();
    } else {
      context.startTimeForDoubleTapMs = now;
      context.doubleTapX = t.screenX;
      context.doubleTapY = t.screenY;
    }
  }
};

// Determine the distance from x to [left, right].
var distanceFromInterval = function distanceFromInterval(x, left, right) {
  if (x < left) {
    return left - x;
  } else if (x > right) {
    return x - right;
  } else {
    return 0;
  }
};

/**
 * Returns the number of pixels by which the event happens from the nearest
 * edge of the chart. For events in the interior of the chart, this returns zero.
 */
var distanceFromChart = function distanceFromChart(event, g) {
  var chartPos = utils.findPos(g.canvas_);
  var box = {
    left: chartPos.x,
    right: chartPos.x + g.canvas_.offsetWidth,
    top: chartPos.y,
    bottom: chartPos.y + g.canvas_.offsetHeight
  };
  var pt = {
    x: utils.pageX(event),
    y: utils.pageY(event)
  };
  var dx = distanceFromInterval(pt.x, box.left, box.right),
    dy = distanceFromInterval(pt.y, box.top, box.bottom);
  return Math.max(dx, dy);
};

/**
 * Default interation model for dygraphs. You can refer to specific elements of
 * this when constructing your own interaction model, e.g.:
 * g.updateOptions( {
 *   interactionModel: {
 *     mousedown: DygraphInteraction.defaultInteractionModel.mousedown
 *   }
 * } );
 */
DygraphInteraction.defaultModel = {
  // Track the beginning of drag events
  mousedown: function mousedown(event, g, context) {
    // Right-click should not initiate a zoom.
    if (event.button && event.button == 2) return;
    context.initializeMouseDown(event, g, context);
    if (event.altKey || event.shiftKey) {
      DygraphInteraction.startPan(event, g, context);
    } else {
      DygraphInteraction.startZoom(event, g, context);
    }

    // Note: we register mousemove/mouseup on document to allow some leeway for
    // events to move outside of the chart. Interaction model events get
    // registered on the canvas, which is too small to allow this.
    var mousemove = function mousemove(event) {
      if (context.isZooming) {
        // When the mouse moves >200px from the chart edge, cancel the zoom.
        var d = distanceFromChart(event, g);
        if (d < DRAG_EDGE_MARGIN) {
          DygraphInteraction.moveZoom(event, g, context);
        } else {
          if (context.dragEndX !== null) {
            context.dragEndX = null;
            context.dragEndY = null;
            g.clearZoomRect_();
          }
        }
      } else if (context.isPanning) {
        DygraphInteraction.movePan(event, g, context);
      }
    };
    var mouseup = function mouseup(event) {
      if (context.isZooming) {
        if (context.dragEndX !== null) {
          DygraphInteraction.endZoom(event, g, context);
        } else {
          DygraphInteraction.maybeTreatMouseOpAsClick(event, g, context);
        }
      } else if (context.isPanning) {
        DygraphInteraction.endPan(event, g, context);
      }
      utils.removeEvent(document, 'mousemove', mousemove);
      utils.removeEvent(document, 'mouseup', mouseup);
      context.destroy();
    };
    g.addAndTrackEvent(document, 'mousemove', mousemove);
    g.addAndTrackEvent(document, 'mouseup', mouseup);
  },
  willDestroyContextMyself: true,
  touchstart: function touchstart(event, g, context) {
    DygraphInteraction.startTouch(event, g, context);
  },
  touchmove: function touchmove(event, g, context) {
    DygraphInteraction.moveTouch(event, g, context);
  },
  touchend: function touchend(event, g, context) {
    DygraphInteraction.endTouch(event, g, context);
  },
  // Disable zooming out if panning.
  dblclick: function dblclick(event, g, context) {
    if (context.cancelNextDblclick) {
      context.cancelNextDblclick = false;
      return;
    }

    // Give plugins a chance to grab this event.
    var e = {
      canvasx: context.dragEndX,
      canvasy: context.dragEndY,
      cancelable: true
    };
    if (g.cascadeEvents_('dblclick', e)) {
      return;
    }
    if (event.altKey || event.shiftKey) {
      return;
    }
    g.resetZoom();
  }
};

/*
Dygraph.DEFAULT_ATTRS.interactionModel = DygraphInteraction.defaultModel;

// old ways of accessing these methods/properties
Dygraph.defaultInteractionModel = DygraphInteraction.defaultModel;
Dygraph.endZoom = DygraphInteraction.endZoom;
Dygraph.moveZoom = DygraphInteraction.moveZoom;
Dygraph.startZoom = DygraphInteraction.startZoom;
Dygraph.endPan = DygraphInteraction.endPan;
Dygraph.movePan = DygraphInteraction.movePan;
Dygraph.startPan = DygraphInteraction.startPan;
*/

DygraphInteraction.nonInteractiveModel_ = {
  mousedown: function mousedown(event, g, context) {
    context.initializeMouseDown(event, g, context);
  },
  mouseup: DygraphInteraction.maybeTreatMouseOpAsClick
};

// Default interaction model when using the range selector.
DygraphInteraction.dragIsPanInteractionModel = {
  mousedown: function mousedown(event, g, context) {
    context.initializeMouseDown(event, g, context);
    DygraphInteraction.startPan(event, g, context);
  },
  mousemove: function mousemove(event, g, context) {
    if (context.isPanning) {
      DygraphInteraction.movePan(event, g, context);
    }
  },
  mouseup: function mouseup(event, g, context) {
    if (context.isPanning) {
      DygraphInteraction.endPan(event, g, context);
    }
  }
};
var _default = DygraphInteraction;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEUkFHX0VER0VfTUFSR0lOIiwiRHlncmFwaEludGVyYWN0aW9uIiwibWF5YmVUcmVhdE1vdXNlT3BBc0NsaWNrIiwiZXZlbnQiLCJnIiwiY29udGV4dCIsImRyYWdFbmRYIiwidXRpbHMiLCJkcmFnR2V0WF8iLCJkcmFnRW5kWSIsImRyYWdHZXRZXyIsInJlZ2lvbldpZHRoIiwiTWF0aCIsImFicyIsImRyYWdTdGFydFgiLCJyZWdpb25IZWlnaHQiLCJkcmFnU3RhcnRZIiwibGFzdHhfIiwidW5kZWZpbmVkIiwidHJlYXRNb3VzZU9wQXNDbGljayIsInN0YXJ0UGFuIiwiaSIsImF4aXMiLCJpc1Bhbm5pbmciLCJ4UmFuZ2UiLCJ4QXhpc1JhbmdlIiwiZ2V0T3B0aW9uRm9yQXhpcyIsImluaXRpYWxMZWZ0bW9zdERhdGUiLCJsb2cxMCIsImRhdGVSYW5nZSIsInhVbml0c1BlclBpeGVsIiwicGxvdHRlcl8iLCJhcmVhIiwidyIsImdldE51bWVyaWNPcHRpb24iLCJtYXhYUGl4ZWxzVG9EcmF3Iiwid2lkdGhfIiwieEV4dHJlbWVzIiwieEF4aXNFeHRyZW1lcyIsImJvdW5kZWRMZWZ0WCIsInRvRG9tWENvb3JkIiwiYm91bmRlZFJpZ2h0WCIsImJvdW5kZWRMZWZ0RGF0ZSIsInRvRGF0YVhDb29yZCIsImJvdW5kZWRSaWdodERhdGUiLCJib3VuZGVkRGF0ZXMiLCJib3VuZGVkVmFsdWVzIiwibWF4WVBpeGVsc1RvRHJhdyIsImhlaWdodF8iLCJheGVzXyIsImxlbmd0aCIsInlFeHRyZW1lcyIsImV4dHJlbWVSYW5nZSIsImJvdW5kZWRUb3BZIiwidG9Eb21ZQ29vcmQiLCJib3VuZGVkQm90dG9tWSIsImJvdW5kZWRUb3BWYWx1ZSIsInRvRGF0YVlDb29yZCIsImJvdW5kZWRCb3R0b21WYWx1ZSIsImlzMkRQYW4iLCJheGVzIiwiYXhpc19kYXRhIiwieVJhbmdlIiwieUF4aXNSYW5nZSIsImxvZ3NjYWxlIiwiYXR0cmlidXRlc18iLCJnZXRGb3JBeGlzIiwiaW5pdGlhbFRvcFZhbHVlIiwiZHJhZ1ZhbHVlUmFuZ2UiLCJ1bml0c1BlclBpeGVsIiwiaCIsInB1c2giLCJ2YWx1ZVJhbmdlIiwibW92ZVBhbiIsIm1pbkRhdGUiLCJtYXgiLCJtYXhEYXRlIiwiZGF0ZVdpbmRvd18iLCJwb3ciLCJMT0dfU0NBTEUiLCJwaXhlbHNEcmFnZ2VkIiwidW5pdHNEcmFnZ2VkIiwiYm91bmRlZFZhbHVlIiwibWF4VmFsdWUiLCJtaW4iLCJtaW5WYWx1ZSIsImRyYXdHcmFwaF8iLCJlbmRQYW4iLCJzdGFydFpvb20iLCJpc1pvb21pbmciLCJ6b29tTW92ZWQiLCJtb3ZlWm9vbSIsInhEZWx0YSIsInlEZWx0YSIsImRyYWdEaXJlY3Rpb24iLCJWRVJUSUNBTCIsIkhPUklaT05UQUwiLCJkcmF3Wm9vbVJlY3RfIiwicHJldkRyYWdEaXJlY3Rpb24iLCJwcmV2RW5kWCIsInByZXZFbmRZIiwiY2xpY2tDYWxsYmFjayIsImdldEZ1bmN0aW9uT3B0aW9uIiwicG9pbnRDbGlja0NhbGxiYWNrIiwic2VsZWN0ZWRQb2ludCIsImNsb3Nlc3RJZHgiLCJjbG9zZXN0RGlzdGFuY2UiLCJOdW1iZXIiLCJNQVhfVkFMVUUiLCJzZWxQb2ludHNfIiwicCIsImRpc3RhbmNlIiwiY2FudmFzeCIsImNhbnZhc3kiLCJpc05hTiIsInJhZGl1cyIsImUiLCJjYW5jZWxhYmxlIiwicG9pbnQiLCJkZWZhdWx0UHJldmVudGVkIiwiY2FzY2FkZUV2ZW50c18iLCJjYWxsIiwieHZhbCIsInB0cyIsImVuZFpvb20iLCJjbGVhclpvb21SZWN0XyIsInBsb3RBcmVhIiwiZ2V0QXJlYSIsImxlZnQiLCJyaWdodCIsIngiLCJkb1pvb21YXyIsImNhbmNlbE5leHREYmxjbGljayIsInRvcCIsImJvdHRvbSIsInkiLCJkb1pvb21ZXyIsInN0YXJ0VG91Y2giLCJwcmV2ZW50RGVmYXVsdCIsInRvdWNoZXMiLCJzdGFydFRpbWVGb3JEb3VibGVUYXBNcyIsInQiLCJyZWN0IiwidGFyZ2V0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwicGFnZVgiLCJwYWdlWSIsImRhdGFYIiwiY2xpZW50WCIsImRhdGFZIiwiY2xpZW50WSIsImluaXRpYWxUb3VjaGVzIiwiaW5pdGlhbFBpbmNoQ2VudGVyIiwidG91Y2hEaXJlY3Rpb25zIiwiaW5pdGlhbEFuZ2xlIiwiUEkiLCJhdGFuMiIsImluaXRpYWxSYW5nZSIsIm1vdmVUb3VjaCIsImNfbm93IiwiY19pbml0Iiwic3dpcGUiLCJkYXRhV2lkdGgiLCJkYXRhSGVpZ2h0IiwieFNjYWxlIiwieVNjYWxlIiwiaW5pdEhhbGZXaWR0aCIsImluaXRIYWxmSGVpZ2h0IiwiZGlkWm9vbSIsImNGYWN0b3IiLCJ2aWV3V2luZG93IiwieUF4aXNSYW5nZXMiLCJlbmRUb3VjaCIsImNoYW5nZWRUb3VjaGVzIiwibm93IiwiRGF0ZSIsImdldFRpbWUiLCJkb3VibGVUYXBYIiwic2NyZWVuWCIsImRvdWJsZVRhcFkiLCJzY3JlZW5ZIiwicmVzZXRab29tIiwiZGlzdGFuY2VGcm9tSW50ZXJ2YWwiLCJkaXN0YW5jZUZyb21DaGFydCIsImNoYXJ0UG9zIiwiZmluZFBvcyIsImNhbnZhc18iLCJib3giLCJvZmZzZXRXaWR0aCIsIm9mZnNldEhlaWdodCIsInB0IiwiZHgiLCJkeSIsImRlZmF1bHRNb2RlbCIsIm1vdXNlZG93biIsImJ1dHRvbiIsImluaXRpYWxpemVNb3VzZURvd24iLCJhbHRLZXkiLCJzaGlmdEtleSIsIm1vdXNlbW92ZSIsImQiLCJtb3VzZXVwIiwicmVtb3ZlRXZlbnQiLCJkb2N1bWVudCIsImRlc3Ryb3kiLCJhZGRBbmRUcmFja0V2ZW50Iiwid2lsbERlc3Ryb3lDb250ZXh0TXlzZWxmIiwidG91Y2hzdGFydCIsInRvdWNobW92ZSIsInRvdWNoZW5kIiwiZGJsY2xpY2siLCJub25JbnRlcmFjdGl2ZU1vZGVsXyIsImRyYWdJc1BhbkludGVyYWN0aW9uTW9kZWwiXSwic291cmNlcyI6WyIuLi9zcmMvZHlncmFwaC1pbnRlcmFjdGlvbi1tb2RlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAxMSBSb2JlcnQgS29uaWdzYmVyZyAoa29uaWdzYmVyZ0Bnb29nbGUuY29tKVxuICogTUlULWxpY2VuY2VkOiBodHRwczovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBUaGUgZGVmYXVsdCBpbnRlcmFjdGlvbiBtb2RlbCBmb3IgRHlncmFwaHMuIFRoaXMgaXMga2VwdCBvdXRcbiAqIG9mIGR5Z3JhcGguanMgZm9yIGJldHRlciBuYXZpZ2FiaWxpdHkuXG4gKiBAYXV0aG9yIFJvYmVydCBLb25pZ3NiZXJnIChrb25pZ3NiZXJnQGdvb2dsZS5jb20pXG4gKi9cblxuLypnbG9iYWwgRHlncmFwaDpmYWxzZSAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gJy4vZHlncmFwaC11dGlscyc7XG5cbi8qKlxuICogWW91IGNhbiBkcmFnIHRoaXMgbWFueSBwaXhlbHMgcGFzdCB0aGUgZWRnZSBvZiB0aGUgY2hhcnQgYW5kIHN0aWxsIGhhdmUgaXRcbiAqIGJlIGNvbnNpZGVyZWQgYSB6b29tLiBUaGlzIG1ha2VzIGl0IGVhc2llciB0byB6b29tIHRvIHRoZSBleGFjdCBlZGdlIG9mIHRoZVxuICogY2hhcnQsIGEgZmFpcmx5IGNvbW1vbiBvcGVyYXRpb24uXG4gKi9cbnZhciBEUkFHX0VER0VfTUFSR0lOID0gMTAwO1xuXG4vKipcbiAqIEEgY29sbGVjdGlvbiBvZiBmdW5jdGlvbnMgdG8gZmFjaWxpdGF0ZSBidWlsZCBjdXN0b20gaW50ZXJhY3Rpb24gbW9kZWxzLlxuICogQGNsYXNzXG4gKi9cbnZhciBEeWdyYXBoSW50ZXJhY3Rpb24gPSB7fTtcblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgYmVnaW5uaW5nICYgZW5kaW5nIG9mIGFuIGV2ZW50IHdlcmUgY2xvc2UgZW5vdWdoIHRoYXQgaXRcbiAqIHNob3VsZCBiZSBjb25zaWRlcmVkIGEgY2xpY2suIElmIGl0IHNob3VsZCwgZGlzcGF0Y2ggYXBwcm9wcmlhdGUgZXZlbnRzLlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBldmVudCB3YXMgdHJlYXRlZCBhcyBhIGNsaWNrLlxuICpcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0R5Z3JhcGh9IGdcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XG4gKi9cbkR5Z3JhcGhJbnRlcmFjdGlvbi5tYXliZVRyZWF0TW91c2VPcEFzQ2xpY2sgPSBmdW5jdGlvbihldmVudCwgZywgY29udGV4dCkge1xuICBjb250ZXh0LmRyYWdFbmRYID0gdXRpbHMuZHJhZ0dldFhfKGV2ZW50LCBjb250ZXh0KTtcbiAgY29udGV4dC5kcmFnRW5kWSA9IHV0aWxzLmRyYWdHZXRZXyhldmVudCwgY29udGV4dCk7XG4gIHZhciByZWdpb25XaWR0aCA9IE1hdGguYWJzKGNvbnRleHQuZHJhZ0VuZFggLSBjb250ZXh0LmRyYWdTdGFydFgpO1xuICB2YXIgcmVnaW9uSGVpZ2h0ID0gTWF0aC5hYnMoY29udGV4dC5kcmFnRW5kWSAtIGNvbnRleHQuZHJhZ1N0YXJ0WSk7XG5cbiAgaWYgKHJlZ2lvbldpZHRoIDwgMiAmJiByZWdpb25IZWlnaHQgPCAyICYmXG4gICAgICBnLmxhc3R4XyAhPT0gdW5kZWZpbmVkICYmIGcubGFzdHhfICE9PSBudWxsKSB7XG4gICAgRHlncmFwaEludGVyYWN0aW9uLnRyZWF0TW91c2VPcEFzQ2xpY2soZywgZXZlbnQsIGNvbnRleHQpO1xuICB9XG5cbiAgY29udGV4dC5yZWdpb25XaWR0aCA9IHJlZ2lvbldpZHRoO1xuICBjb250ZXh0LnJlZ2lvbkhlaWdodCA9IHJlZ2lvbkhlaWdodDtcbn07XG5cbi8qKlxuICogQ2FsbGVkIGluIHJlc3BvbnNlIHRvIGFuIGludGVyYWN0aW9uIG1vZGVsIG9wZXJhdGlvbiB0aGF0XG4gKiBzaG91bGQgc3RhcnQgdGhlIGRlZmF1bHQgcGFubmluZyBiZWhhdmlvci5cbiAqXG4gKiBJdCdzIHVzZWQgaW4gdGhlIGRlZmF1bHQgY2FsbGJhY2sgZm9yIFwibW91c2Vkb3duXCIgb3BlcmF0aW9ucy5cbiAqIEN1c3RvbSBpbnRlcmFjdGlvbiBtb2RlbCBidWlsZGVycyBjYW4gdXNlIGl0IHRvIHByb3ZpZGUgdGhlIGRlZmF1bHRcbiAqIHBhbm5pbmcgYmVoYXZpb3IuXG4gKlxuICogQHBhcmFtIHtFdmVudH0gZXZlbnQgdGhlIGV2ZW50IG9iamVjdCB3aGljaCBsZWQgdG8gdGhlIHN0YXJ0UGFuIGNhbGwuXG4gKiBAcGFyYW0ge0R5Z3JhcGh9IGcgVGhlIGR5Z3JhcGggb24gd2hpY2ggdG8gYWN0LlxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgVGhlIGRyYWdnaW5nIGNvbnRleHQgb2JqZWN0ICh3aXRoXG4gKiAgICAgZHJhZ1N0YXJ0WC9kcmFnU3RhcnRZL2V0Yy4gcHJvcGVydGllcykuIFRoaXMgZnVuY3Rpb24gbW9kaWZpZXMgdGhlXG4gKiAgICAgY29udGV4dC5cbiAqL1xuRHlncmFwaEludGVyYWN0aW9uLnN0YXJ0UGFuID0gZnVuY3Rpb24oZXZlbnQsIGcsIGNvbnRleHQpIHtcbiAgdmFyIGksIGF4aXM7XG4gIGNvbnRleHQuaXNQYW5uaW5nID0gdHJ1ZTtcbiAgdmFyIHhSYW5nZSA9IGcueEF4aXNSYW5nZSgpO1xuXG4gIGlmIChnLmdldE9wdGlvbkZvckF4aXMoXCJsb2dzY2FsZVwiLCBcInhcIikpIHtcbiAgICBjb250ZXh0LmluaXRpYWxMZWZ0bW9zdERhdGUgPSB1dGlscy5sb2cxMCh4UmFuZ2VbMF0pO1xuICAgIGNvbnRleHQuZGF0ZVJhbmdlID0gdXRpbHMubG9nMTAoeFJhbmdlWzFdKSAtIHV0aWxzLmxvZzEwKHhSYW5nZVswXSk7XG4gIH0gZWxzZSB7XG4gICAgY29udGV4dC5pbml0aWFsTGVmdG1vc3REYXRlID0geFJhbmdlWzBdO1xuICAgIGNvbnRleHQuZGF0ZVJhbmdlID0geFJhbmdlWzFdIC0geFJhbmdlWzBdO1xuICB9XG4gIGNvbnRleHQueFVuaXRzUGVyUGl4ZWwgPSBjb250ZXh0LmRhdGVSYW5nZSAvIChnLnBsb3R0ZXJfLmFyZWEudyAtIDEpO1xuXG4gIGlmIChnLmdldE51bWVyaWNPcHRpb24oXCJwYW5FZGdlRnJhY3Rpb25cIikpIHtcbiAgICB2YXIgbWF4WFBpeGVsc1RvRHJhdyA9IGcud2lkdGhfICogZy5nZXROdW1lcmljT3B0aW9uKFwicGFuRWRnZUZyYWN0aW9uXCIpO1xuICAgIHZhciB4RXh0cmVtZXMgPSBnLnhBeGlzRXh0cmVtZXMoKTsgLy8gSSBSRUFMTFkgV0FOVCBUTyBDQUxMIFRISVMgeFRyZW1lcyFcblxuICAgIHZhciBib3VuZGVkTGVmdFggPSBnLnRvRG9tWENvb3JkKHhFeHRyZW1lc1swXSkgLSBtYXhYUGl4ZWxzVG9EcmF3O1xuICAgIHZhciBib3VuZGVkUmlnaHRYID0gZy50b0RvbVhDb29yZCh4RXh0cmVtZXNbMV0pICsgbWF4WFBpeGVsc1RvRHJhdztcblxuICAgIHZhciBib3VuZGVkTGVmdERhdGUgPSBnLnRvRGF0YVhDb29yZChib3VuZGVkTGVmdFgpO1xuICAgIHZhciBib3VuZGVkUmlnaHREYXRlID0gZy50b0RhdGFYQ29vcmQoYm91bmRlZFJpZ2h0WCk7XG4gICAgY29udGV4dC5ib3VuZGVkRGF0ZXMgPSBbYm91bmRlZExlZnREYXRlLCBib3VuZGVkUmlnaHREYXRlXTtcblxuICAgIHZhciBib3VuZGVkVmFsdWVzID0gW107XG4gICAgdmFyIG1heFlQaXhlbHNUb0RyYXcgPSBnLmhlaWdodF8gKiBnLmdldE51bWVyaWNPcHRpb24oXCJwYW5FZGdlRnJhY3Rpb25cIik7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgZy5heGVzXy5sZW5ndGg7IGkrKykge1xuICAgICAgYXhpcyA9IGcuYXhlc19baV07XG4gICAgICB2YXIgeUV4dHJlbWVzID0gYXhpcy5leHRyZW1lUmFuZ2U7XG5cbiAgICAgIHZhciBib3VuZGVkVG9wWSA9IGcudG9Eb21ZQ29vcmQoeUV4dHJlbWVzWzBdLCBpKSArIG1heFlQaXhlbHNUb0RyYXc7XG4gICAgICB2YXIgYm91bmRlZEJvdHRvbVkgPSBnLnRvRG9tWUNvb3JkKHlFeHRyZW1lc1sxXSwgaSkgLSBtYXhZUGl4ZWxzVG9EcmF3O1xuXG4gICAgICB2YXIgYm91bmRlZFRvcFZhbHVlID0gZy50b0RhdGFZQ29vcmQoYm91bmRlZFRvcFksIGkpO1xuICAgICAgdmFyIGJvdW5kZWRCb3R0b21WYWx1ZSA9IGcudG9EYXRhWUNvb3JkKGJvdW5kZWRCb3R0b21ZLCBpKTtcblxuICAgICAgYm91bmRlZFZhbHVlc1tpXSA9IFtib3VuZGVkVG9wVmFsdWUsIGJvdW5kZWRCb3R0b21WYWx1ZV07XG4gICAgfVxuICAgIGNvbnRleHQuYm91bmRlZFZhbHVlcyA9IGJvdW5kZWRWYWx1ZXM7XG4gIH0gZWxzZSB7XG4gICAgLy8gdW5kbyBlZmZlY3QgaWYgaXQgd2FzIG9uY2Ugc2V0XG4gICAgY29udGV4dC5ib3VuZGVkRGF0ZXMgPSBudWxsO1xuICAgIGNvbnRleHQuYm91bmRlZFZhbHVlcyA9IG51bGw7XG4gIH1cblxuICAvLyBSZWNvcmQgdGhlIHJhbmdlIG9mIGVhY2ggeS1heGlzIGF0IHRoZSBzdGFydCBvZiB0aGUgZHJhZy5cbiAgLy8gSWYgYW55IGF4aXMgaGFzIGEgdmFsdWVSYW5nZSwgdGhlbiB3ZSB3YW50IGEgMkQgcGFuLlxuICAvLyBXZSBjYW4ndCBzdG9yZSBkYXRhIGRpcmVjdGx5IGluIGcuYXhlc18sIGJlY2F1c2UgaXQgZG9lcyBub3QgYmVsb25nIHRvIHVzXG4gIC8vIGFuZCBjb3VsZCBjaGFuZ2Ugb3V0IGZyb20gdW5kZXIgdXMgZHVyaW5nIGEgcGFuIChzYXkgaWYgdGhlcmUncyBhIGRhdGFcbiAgLy8gdXBkYXRlKS5cbiAgY29udGV4dC5pczJEUGFuID0gZmFsc2U7XG4gIGNvbnRleHQuYXhlcyA9IFtdO1xuICBmb3IgKGkgPSAwOyBpIDwgZy5heGVzXy5sZW5ndGg7IGkrKykge1xuICAgIGF4aXMgPSBnLmF4ZXNfW2ldO1xuICAgIHZhciBheGlzX2RhdGEgPSB7fTtcbiAgICB2YXIgeVJhbmdlID0gZy55QXhpc1JhbmdlKGkpO1xuICAgIC8vIFRPRE8oa29uaWdzYmVyZyk6IFRoZXNlIHZhbHVlcyBzaG91bGQgYmUgaW4gfGNvbnRleHR8LlxuICAgIC8vIEluIGxvZyBzY2FsZSwgaW5pdGlhbFRvcFZhbHVlLCBkcmFnVmFsdWVSYW5nZSBhbmQgdW5pdHNQZXJQaXhlbCBhcmUgbG9nIHNjYWxlLlxuICAgIHZhciBsb2dzY2FsZSA9IGcuYXR0cmlidXRlc18uZ2V0Rm9yQXhpcyhcImxvZ3NjYWxlXCIsIGkpO1xuICAgIGlmIChsb2dzY2FsZSkge1xuICAgICAgYXhpc19kYXRhLmluaXRpYWxUb3BWYWx1ZSA9IHV0aWxzLmxvZzEwKHlSYW5nZVsxXSk7XG4gICAgICBheGlzX2RhdGEuZHJhZ1ZhbHVlUmFuZ2UgPSB1dGlscy5sb2cxMCh5UmFuZ2VbMV0pIC0gdXRpbHMubG9nMTAoeVJhbmdlWzBdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXhpc19kYXRhLmluaXRpYWxUb3BWYWx1ZSA9IHlSYW5nZVsxXTtcbiAgICAgIGF4aXNfZGF0YS5kcmFnVmFsdWVSYW5nZSA9IHlSYW5nZVsxXSAtIHlSYW5nZVswXTtcbiAgICB9XG4gICAgYXhpc19kYXRhLnVuaXRzUGVyUGl4ZWwgPSBheGlzX2RhdGEuZHJhZ1ZhbHVlUmFuZ2UgLyAoZy5wbG90dGVyXy5hcmVhLmggLSAxKTtcbiAgICBjb250ZXh0LmF4ZXMucHVzaChheGlzX2RhdGEpO1xuXG4gICAgLy8gV2hpbGUgY2FsY3VsYXRpbmcgYXhlcywgc2V0IDJkcGFuLlxuICAgIGlmIChheGlzLnZhbHVlUmFuZ2UpIGNvbnRleHQuaXMyRFBhbiA9IHRydWU7XG4gIH1cbn07XG5cbi8qKlxuICogQ2FsbGVkIGluIHJlc3BvbnNlIHRvIGFuIGludGVyYWN0aW9uIG1vZGVsIG9wZXJhdGlvbiB0aGF0XG4gKiByZXNwb25kcyB0byBhbiBldmVudCB0aGF0IHBhbnMgdGhlIHZpZXcuXG4gKlxuICogSXQncyB1c2VkIGluIHRoZSBkZWZhdWx0IGNhbGxiYWNrIGZvciBcIm1vdXNlbW92ZVwiIG9wZXJhdGlvbnMuXG4gKiBDdXN0b20gaW50ZXJhY3Rpb24gbW9kZWwgYnVpbGRlcnMgY2FuIHVzZSBpdCB0byBwcm92aWRlIHRoZSBkZWZhdWx0XG4gKiBwYW5uaW5nIGJlaGF2aW9yLlxuICpcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IHRoZSBldmVudCBvYmplY3Qgd2hpY2ggbGVkIHRvIHRoZSBtb3ZlUGFuIGNhbGwuXG4gKiBAcGFyYW0ge0R5Z3JhcGh9IGcgVGhlIGR5Z3JhcGggb24gd2hpY2ggdG8gYWN0LlxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgVGhlIGRyYWdnaW5nIGNvbnRleHQgb2JqZWN0ICh3aXRoXG4gKiAgICAgZHJhZ1N0YXJ0WC9kcmFnU3RhcnRZL2V0Yy4gcHJvcGVydGllcykuIFRoaXMgZnVuY3Rpb24gbW9kaWZpZXMgdGhlXG4gKiAgICAgY29udGV4dC5cbiAqL1xuRHlncmFwaEludGVyYWN0aW9uLm1vdmVQYW4gPSBmdW5jdGlvbihldmVudCwgZywgY29udGV4dCkge1xuICBjb250ZXh0LmRyYWdFbmRYID0gdXRpbHMuZHJhZ0dldFhfKGV2ZW50LCBjb250ZXh0KTtcbiAgY29udGV4dC5kcmFnRW5kWSA9IHV0aWxzLmRyYWdHZXRZXyhldmVudCwgY29udGV4dCk7XG5cbiAgdmFyIG1pbkRhdGUgPSBjb250ZXh0LmluaXRpYWxMZWZ0bW9zdERhdGUgLVxuICAgIChjb250ZXh0LmRyYWdFbmRYIC0gY29udGV4dC5kcmFnU3RhcnRYKSAqIGNvbnRleHQueFVuaXRzUGVyUGl4ZWw7XG4gIGlmIChjb250ZXh0LmJvdW5kZWREYXRlcykge1xuICAgIG1pbkRhdGUgPSBNYXRoLm1heChtaW5EYXRlLCBjb250ZXh0LmJvdW5kZWREYXRlc1swXSk7XG4gIH1cbiAgdmFyIG1heERhdGUgPSBtaW5EYXRlICsgY29udGV4dC5kYXRlUmFuZ2U7XG4gIGlmIChjb250ZXh0LmJvdW5kZWREYXRlcykge1xuICAgIGlmIChtYXhEYXRlID4gY29udGV4dC5ib3VuZGVkRGF0ZXNbMV0pIHtcbiAgICAgIC8vIEFkanVzdCBtaW5EYXRlLCBhbmQgcmVjb21wdXRlIG1heERhdGUuXG4gICAgICBtaW5EYXRlID0gbWluRGF0ZSAtIChtYXhEYXRlIC0gY29udGV4dC5ib3VuZGVkRGF0ZXNbMV0pO1xuICAgICAgbWF4RGF0ZSA9IG1pbkRhdGUgKyBjb250ZXh0LmRhdGVSYW5nZTtcbiAgICB9XG4gIH1cblxuICBpZiAoZy5nZXRPcHRpb25Gb3JBeGlzKFwibG9nc2NhbGVcIiwgXCJ4XCIpKSB7XG4gICAgZy5kYXRlV2luZG93XyA9IFsgTWF0aC5wb3codXRpbHMuTE9HX1NDQUxFLCBtaW5EYXRlKSxcbiAgICAgICAgICAgICAgICAgICAgICBNYXRoLnBvdyh1dGlscy5MT0dfU0NBTEUsIG1heERhdGUpIF07XG4gIH0gZWxzZSB7XG4gICAgZy5kYXRlV2luZG93XyA9IFttaW5EYXRlLCBtYXhEYXRlXTtcbiAgfVxuXG4gIC8vIHktYXhpcyBzY2FsaW5nIGlzIGF1dG9tYXRpYyB1bmxlc3MgdGhpcyBpcyBhIGZ1bGwgMkQgcGFuLlxuICBpZiAoY29udGV4dC5pczJEUGFuKSB7XG5cbiAgICB2YXIgcGl4ZWxzRHJhZ2dlZCA9IGNvbnRleHQuZHJhZ0VuZFkgLSBjb250ZXh0LmRyYWdTdGFydFk7XG5cbiAgICAvLyBBZGp1c3QgZWFjaCBheGlzIGFwcHJvcHJpYXRlbHkuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnLmF4ZXNfLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgYXhpcyA9IGcuYXhlc19baV07XG4gICAgICB2YXIgYXhpc19kYXRhID0gY29udGV4dC5heGVzW2ldO1xuICAgICAgdmFyIHVuaXRzRHJhZ2dlZCA9IHBpeGVsc0RyYWdnZWQgKiBheGlzX2RhdGEudW5pdHNQZXJQaXhlbDtcblxuICAgICAgdmFyIGJvdW5kZWRWYWx1ZSA9IGNvbnRleHQuYm91bmRlZFZhbHVlcyA/IGNvbnRleHQuYm91bmRlZFZhbHVlc1tpXSA6IG51bGw7XG5cbiAgICAgIC8vIEluIGxvZyBzY2FsZSwgbWF4VmFsdWUgYW5kIG1pblZhbHVlIGFyZSB0aGUgbG9ncyBvZiB0aG9zZSB2YWx1ZXMuXG4gICAgICB2YXIgbWF4VmFsdWUgPSBheGlzX2RhdGEuaW5pdGlhbFRvcFZhbHVlICsgdW5pdHNEcmFnZ2VkO1xuICAgICAgaWYgKGJvdW5kZWRWYWx1ZSkge1xuICAgICAgICBtYXhWYWx1ZSA9IE1hdGgubWluKG1heFZhbHVlLCBib3VuZGVkVmFsdWVbMV0pO1xuICAgICAgfVxuICAgICAgdmFyIG1pblZhbHVlID0gbWF4VmFsdWUgLSBheGlzX2RhdGEuZHJhZ1ZhbHVlUmFuZ2U7XG4gICAgICBpZiAoYm91bmRlZFZhbHVlKSB7XG4gICAgICAgIGlmIChtaW5WYWx1ZSA8IGJvdW5kZWRWYWx1ZVswXSkge1xuICAgICAgICAgIC8vIEFkanVzdCBtYXhWYWx1ZSwgYW5kIHJlY29tcHV0ZSBtaW5WYWx1ZS5cbiAgICAgICAgICBtYXhWYWx1ZSA9IG1heFZhbHVlIC0gKG1pblZhbHVlIC0gYm91bmRlZFZhbHVlWzBdKTtcbiAgICAgICAgICBtaW5WYWx1ZSA9IG1heFZhbHVlIC0gYXhpc19kYXRhLmRyYWdWYWx1ZVJhbmdlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZy5hdHRyaWJ1dGVzXy5nZXRGb3JBeGlzKFwibG9nc2NhbGVcIiwgaSkpIHtcbiAgICAgICAgYXhpcy52YWx1ZVJhbmdlID0gWyBNYXRoLnBvdyh1dGlscy5MT0dfU0NBTEUsIG1pblZhbHVlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLnBvdyh1dGlscy5MT0dfU0NBTEUsIG1heFZhbHVlKSBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXhpcy52YWx1ZVJhbmdlID0gWyBtaW5WYWx1ZSwgbWF4VmFsdWUgXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnLmRyYXdHcmFwaF8oZmFsc2UpO1xufTtcblxuLyoqXG4gKiBDYWxsZWQgaW4gcmVzcG9uc2UgdG8gYW4gaW50ZXJhY3Rpb24gbW9kZWwgb3BlcmF0aW9uIHRoYXRcbiAqIHJlc3BvbmRzIHRvIGFuIGV2ZW50IHRoYXQgZW5kcyBwYW5uaW5nLlxuICpcbiAqIEl0J3MgdXNlZCBpbiB0aGUgZGVmYXVsdCBjYWxsYmFjayBmb3IgXCJtb3VzZXVwXCIgb3BlcmF0aW9ucy5cbiAqIEN1c3RvbSBpbnRlcmFjdGlvbiBtb2RlbCBidWlsZGVycyBjYW4gdXNlIGl0IHRvIHByb3ZpZGUgdGhlIGRlZmF1bHRcbiAqIHBhbm5pbmcgYmVoYXZpb3IuXG4gKlxuICogQHBhcmFtIHtFdmVudH0gZXZlbnQgdGhlIGV2ZW50IG9iamVjdCB3aGljaCBsZWQgdG8gdGhlIGVuZFBhbiBjYWxsLlxuICogQHBhcmFtIHtEeWdyYXBofSBnIFRoZSBkeWdyYXBoIG9uIHdoaWNoIHRvIGFjdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0IFRoZSBkcmFnZ2luZyBjb250ZXh0IG9iamVjdCAod2l0aFxuICogICAgIGRyYWdTdGFydFgvZHJhZ1N0YXJ0WS9ldGMuIHByb3BlcnRpZXMpLiBUaGlzIGZ1bmN0aW9uIG1vZGlmaWVzIHRoZVxuICogICAgIGNvbnRleHQuXG4gKi9cbkR5Z3JhcGhJbnRlcmFjdGlvbi5lbmRQYW4gPSBEeWdyYXBoSW50ZXJhY3Rpb24ubWF5YmVUcmVhdE1vdXNlT3BBc0NsaWNrO1xuXG4vKipcbiAqIENhbGxlZCBpbiByZXNwb25zZSB0byBhbiBpbnRlcmFjdGlvbiBtb2RlbCBvcGVyYXRpb24gdGhhdFxuICogcmVzcG9uZHMgdG8gYW4gZXZlbnQgdGhhdCBzdGFydHMgem9vbWluZy5cbiAqXG4gKiBJdCdzIHVzZWQgaW4gdGhlIGRlZmF1bHQgY2FsbGJhY2sgZm9yIFwibW91c2Vkb3duXCIgb3BlcmF0aW9ucy5cbiAqIEN1c3RvbSBpbnRlcmFjdGlvbiBtb2RlbCBidWlsZGVycyBjYW4gdXNlIGl0IHRvIHByb3ZpZGUgdGhlIGRlZmF1bHRcbiAqIHpvb21pbmcgYmVoYXZpb3IuXG4gKlxuICogQHBhcmFtIHtFdmVudH0gZXZlbnQgdGhlIGV2ZW50IG9iamVjdCB3aGljaCBsZWQgdG8gdGhlIHN0YXJ0Wm9vbSBjYWxsLlxuICogQHBhcmFtIHtEeWdyYXBofSBnIFRoZSBkeWdyYXBoIG9uIHdoaWNoIHRvIGFjdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0IFRoZSBkcmFnZ2luZyBjb250ZXh0IG9iamVjdCAod2l0aFxuICogICAgIGRyYWdTdGFydFgvZHJhZ1N0YXJ0WS9ldGMuIHByb3BlcnRpZXMpLiBUaGlzIGZ1bmN0aW9uIG1vZGlmaWVzIHRoZVxuICogICAgIGNvbnRleHQuXG4gKi9cbkR5Z3JhcGhJbnRlcmFjdGlvbi5zdGFydFpvb20gPSBmdW5jdGlvbihldmVudCwgZywgY29udGV4dCkge1xuICBjb250ZXh0LmlzWm9vbWluZyA9IHRydWU7XG4gIGNvbnRleHQuem9vbU1vdmVkID0gZmFsc2U7XG59O1xuXG4vKipcbiAqIENhbGxlZCBpbiByZXNwb25zZSB0byBhbiBpbnRlcmFjdGlvbiBtb2RlbCBvcGVyYXRpb24gdGhhdFxuICogcmVzcG9uZHMgdG8gYW4gZXZlbnQgdGhhdCBkZWZpbmVzIHpvb20gYm91bmRhcmllcy5cbiAqXG4gKiBJdCdzIHVzZWQgaW4gdGhlIGRlZmF1bHQgY2FsbGJhY2sgZm9yIFwibW91c2Vtb3ZlXCIgb3BlcmF0aW9ucy5cbiAqIEN1c3RvbSBpbnRlcmFjdGlvbiBtb2RlbCBidWlsZGVycyBjYW4gdXNlIGl0IHRvIHByb3ZpZGUgdGhlIGRlZmF1bHRcbiAqIHpvb21pbmcgYmVoYXZpb3IuXG4gKlxuICogQHBhcmFtIHtFdmVudH0gZXZlbnQgdGhlIGV2ZW50IG9iamVjdCB3aGljaCBsZWQgdG8gdGhlIG1vdmVab29tIGNhbGwuXG4gKiBAcGFyYW0ge0R5Z3JhcGh9IGcgVGhlIGR5Z3JhcGggb24gd2hpY2ggdG8gYWN0LlxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgVGhlIGRyYWdnaW5nIGNvbnRleHQgb2JqZWN0ICh3aXRoXG4gKiAgICAgZHJhZ1N0YXJ0WC9kcmFnU3RhcnRZL2V0Yy4gcHJvcGVydGllcykuIFRoaXMgZnVuY3Rpb24gbW9kaWZpZXMgdGhlXG4gKiAgICAgY29udGV4dC5cbiAqL1xuRHlncmFwaEludGVyYWN0aW9uLm1vdmVab29tID0gZnVuY3Rpb24oZXZlbnQsIGcsIGNvbnRleHQpIHtcbiAgY29udGV4dC56b29tTW92ZWQgPSB0cnVlO1xuICBjb250ZXh0LmRyYWdFbmRYID0gdXRpbHMuZHJhZ0dldFhfKGV2ZW50LCBjb250ZXh0KTtcbiAgY29udGV4dC5kcmFnRW5kWSA9IHV0aWxzLmRyYWdHZXRZXyhldmVudCwgY29udGV4dCk7XG5cbiAgdmFyIHhEZWx0YSA9IE1hdGguYWJzKGNvbnRleHQuZHJhZ1N0YXJ0WCAtIGNvbnRleHQuZHJhZ0VuZFgpO1xuICB2YXIgeURlbHRhID0gTWF0aC5hYnMoY29udGV4dC5kcmFnU3RhcnRZIC0gY29udGV4dC5kcmFnRW5kWSk7XG5cbiAgLy8gZHJhZyBkaXJlY3Rpb24gdGhyZXNob2xkIGZvciB5IGF4aXMgaXMgdHdpY2UgYXMgbGFyZ2UgYXMgeCBheGlzXG4gIGNvbnRleHQuZHJhZ0RpcmVjdGlvbiA9ICh4RGVsdGEgPCB5RGVsdGEgLyAyKSA/IHV0aWxzLlZFUlRJQ0FMIDogdXRpbHMuSE9SSVpPTlRBTDtcblxuICBnLmRyYXdab29tUmVjdF8oXG4gICAgICBjb250ZXh0LmRyYWdEaXJlY3Rpb24sXG4gICAgICBjb250ZXh0LmRyYWdTdGFydFgsXG4gICAgICBjb250ZXh0LmRyYWdFbmRYLFxuICAgICAgY29udGV4dC5kcmFnU3RhcnRZLFxuICAgICAgY29udGV4dC5kcmFnRW5kWSxcbiAgICAgIGNvbnRleHQucHJldkRyYWdEaXJlY3Rpb24sXG4gICAgICBjb250ZXh0LnByZXZFbmRYLFxuICAgICAgY29udGV4dC5wcmV2RW5kWSk7XG5cbiAgY29udGV4dC5wcmV2RW5kWCA9IGNvbnRleHQuZHJhZ0VuZFg7XG4gIGNvbnRleHQucHJldkVuZFkgPSBjb250ZXh0LmRyYWdFbmRZO1xuICBjb250ZXh0LnByZXZEcmFnRGlyZWN0aW9uID0gY29udGV4dC5kcmFnRGlyZWN0aW9uO1xufTtcblxuLyoqXG4gKiBUT0RPKGRhbnZrKTogbW92ZSB0aGlzIGxvZ2ljIGludG8gZHlncmFwaC5qc1xuICogQHBhcmFtIHtEeWdyYXBofSBnXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAqL1xuRHlncmFwaEludGVyYWN0aW9uLnRyZWF0TW91c2VPcEFzQ2xpY2sgPSBmdW5jdGlvbihnLCBldmVudCwgY29udGV4dCkge1xuICB2YXIgY2xpY2tDYWxsYmFjayA9IGcuZ2V0RnVuY3Rpb25PcHRpb24oJ2NsaWNrQ2FsbGJhY2snKTtcbiAgdmFyIHBvaW50Q2xpY2tDYWxsYmFjayA9IGcuZ2V0RnVuY3Rpb25PcHRpb24oJ3BvaW50Q2xpY2tDYWxsYmFjaycpO1xuXG4gIHZhciBzZWxlY3RlZFBvaW50ID0gbnVsbDtcblxuICAvLyBGaW5kIG91dCBpZiB0aGUgY2xpY2sgb2NjdXJzIG9uIGEgcG9pbnQuXG4gIHZhciBjbG9zZXN0SWR4ID0gLTE7XG4gIHZhciBjbG9zZXN0RGlzdGFuY2UgPSBOdW1iZXIuTUFYX1ZBTFVFO1xuXG4gIC8vIGNoZWNrIGlmIHRoZSBjbGljayB3YXMgb24gYSBwYXJ0aWN1bGFyIHBvaW50LlxuICBmb3IgKHZhciBpID0gMDsgaSA8IGcuc2VsUG9pbnRzXy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBwID0gZy5zZWxQb2ludHNfW2ldO1xuICAgIHZhciBkaXN0YW5jZSA9IE1hdGgucG93KHAuY2FudmFzeCAtIGNvbnRleHQuZHJhZ0VuZFgsIDIpICtcbiAgICAgICAgICAgICAgICAgICBNYXRoLnBvdyhwLmNhbnZhc3kgLSBjb250ZXh0LmRyYWdFbmRZLCAyKTtcbiAgICBpZiAoIWlzTmFOKGRpc3RhbmNlKSAmJlxuICAgICAgICAoY2xvc2VzdElkeCA9PSAtMSB8fCBkaXN0YW5jZSA8IGNsb3Nlc3REaXN0YW5jZSkpIHtcbiAgICAgIGNsb3Nlc3REaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgICAgY2xvc2VzdElkeCA9IGk7XG4gICAgfVxuICB9XG5cbiAgLy8gQWxsb3cgYW55IGNsaWNrIHdpdGhpbiB0d28gcGl4ZWxzIG9mIHRoZSBkb3QuXG4gIHZhciByYWRpdXMgPSBnLmdldE51bWVyaWNPcHRpb24oJ2hpZ2hsaWdodENpcmNsZVNpemUnKSArIDI7XG4gIGlmIChjbG9zZXN0RGlzdGFuY2UgPD0gcmFkaXVzICogcmFkaXVzKSB7XG4gICAgc2VsZWN0ZWRQb2ludCA9IGcuc2VsUG9pbnRzX1tjbG9zZXN0SWR4XTtcbiAgfVxuXG4gIGlmIChzZWxlY3RlZFBvaW50KSB7XG4gICAgdmFyIGUgPSB7XG4gICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgcG9pbnQ6IHNlbGVjdGVkUG9pbnQsXG4gICAgICBjYW52YXN4OiBjb250ZXh0LmRyYWdFbmRYLFxuICAgICAgY2FudmFzeTogY29udGV4dC5kcmFnRW5kWVxuICAgIH07XG4gICAgdmFyIGRlZmF1bHRQcmV2ZW50ZWQgPSBnLmNhc2NhZGVFdmVudHNfKCdwb2ludENsaWNrJywgZSk7XG4gICAgaWYgKGRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgIC8vIE5vdGU6IHRoaXMgYWxzbyBwcmV2ZW50cyBjbGljayAvIGNsaWNrQ2FsbGJhY2sgZnJvbSBmaXJpbmcuXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChwb2ludENsaWNrQ2FsbGJhY2spIHtcbiAgICAgIHBvaW50Q2xpY2tDYWxsYmFjay5jYWxsKGcsIGV2ZW50LCBzZWxlY3RlZFBvaW50KTtcbiAgICB9XG4gIH1cblxuICB2YXIgZSA9IHtcbiAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgIHh2YWw6IGcubGFzdHhfLCAgLy8gY2xvc2VzdCBwb2ludCBieSB4IHZhbHVlXG4gICAgcHRzOiBnLnNlbFBvaW50c18sXG4gICAgY2FudmFzeDogY29udGV4dC5kcmFnRW5kWCxcbiAgICBjYW52YXN5OiBjb250ZXh0LmRyYWdFbmRZXG4gIH07XG4gIGlmICghZy5jYXNjYWRlRXZlbnRzXygnY2xpY2snLCBlKSkge1xuICAgIGlmIChjbGlja0NhbGxiYWNrKSB7XG4gICAgICAvLyBUT0RPKGRhbnZrKTogcGFzcyBhbG9uZyBtb3JlIGluZm8gYWJvdXQgdGhlIHBvaW50cywgZS5nLiAneCdcbiAgICAgIGNsaWNrQ2FsbGJhY2suY2FsbChnLCBldmVudCwgZy5sYXN0eF8sIGcuc2VsUG9pbnRzXyk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIENhbGxlZCBpbiByZXNwb25zZSB0byBhbiBpbnRlcmFjdGlvbiBtb2RlbCBvcGVyYXRpb24gdGhhdFxuICogcmVzcG9uZHMgdG8gYW4gZXZlbnQgdGhhdCBwZXJmb3JtcyBhIHpvb20gYmFzZWQgb24gcHJldmlvdXNseSBkZWZpbmVkXG4gKiBib3VuZHMuLlxuICpcbiAqIEl0J3MgdXNlZCBpbiB0aGUgZGVmYXVsdCBjYWxsYmFjayBmb3IgXCJtb3VzZXVwXCIgb3BlcmF0aW9ucy5cbiAqIEN1c3RvbSBpbnRlcmFjdGlvbiBtb2RlbCBidWlsZGVycyBjYW4gdXNlIGl0IHRvIHByb3ZpZGUgdGhlIGRlZmF1bHRcbiAqIHpvb21pbmcgYmVoYXZpb3IuXG4gKlxuICogQHBhcmFtIHtFdmVudH0gZXZlbnQgdGhlIGV2ZW50IG9iamVjdCB3aGljaCBsZWQgdG8gdGhlIGVuZFpvb20gY2FsbC5cbiAqIEBwYXJhbSB7RHlncmFwaH0gZyBUaGUgZHlncmFwaCBvbiB3aGljaCB0byBlbmQgdGhlIHpvb20uXG4gKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCBUaGUgZHJhZ2dpbmcgY29udGV4dCBvYmplY3QgKHdpdGhcbiAqICAgICBkcmFnU3RhcnRYL2RyYWdTdGFydFkvZXRjLiBwcm9wZXJ0aWVzKS4gVGhpcyBmdW5jdGlvbiBtb2RpZmllcyB0aGVcbiAqICAgICBjb250ZXh0LlxuICovXG5EeWdyYXBoSW50ZXJhY3Rpb24uZW5kWm9vbSA9IGZ1bmN0aW9uKGV2ZW50LCBnLCBjb250ZXh0KSB7XG4gIGcuY2xlYXJab29tUmVjdF8oKTtcbiAgY29udGV4dC5pc1pvb21pbmcgPSBmYWxzZTtcbiAgRHlncmFwaEludGVyYWN0aW9uLm1heWJlVHJlYXRNb3VzZU9wQXNDbGljayhldmVudCwgZywgY29udGV4dCk7XG5cbiAgLy8gVGhlIHpvb20gcmVjdGFuZ2xlIGlzIHZpc2libHkgY2xpcHBlZCB0byB0aGUgcGxvdCBhcmVhLCBzbyBpdHMgYmVoYXZpb3JcbiAgLy8gc2hvdWxkIGJlIGFzIHdlbGwuXG4gIC8vIFNlZSBodHRwOi8vY29kZS5nb29nbGUuY29tL3AvZHlncmFwaHMvaXNzdWVzL2RldGFpbD9pZD0yODBcbiAgdmFyIHBsb3RBcmVhID0gZy5nZXRBcmVhKCk7XG4gIGlmIChjb250ZXh0LnJlZ2lvbldpZHRoID49IDEwICYmXG4gICAgICBjb250ZXh0LmRyYWdEaXJlY3Rpb24gPT0gdXRpbHMuSE9SSVpPTlRBTCkge1xuICAgIHZhciBsZWZ0ID0gTWF0aC5taW4oY29udGV4dC5kcmFnU3RhcnRYLCBjb250ZXh0LmRyYWdFbmRYKSxcbiAgICAgICAgcmlnaHQgPSBNYXRoLm1heChjb250ZXh0LmRyYWdTdGFydFgsIGNvbnRleHQuZHJhZ0VuZFgpO1xuICAgIGxlZnQgPSBNYXRoLm1heChsZWZ0LCBwbG90QXJlYS54KTtcbiAgICByaWdodCA9IE1hdGgubWluKHJpZ2h0LCBwbG90QXJlYS54ICsgcGxvdEFyZWEudyk7XG4gICAgaWYgKGxlZnQgPCByaWdodCkge1xuICAgICAgZy5kb1pvb21YXyhsZWZ0LCByaWdodCk7XG4gICAgfVxuICAgIGNvbnRleHQuY2FuY2VsTmV4dERibGNsaWNrID0gdHJ1ZTtcbiAgfSBlbHNlIGlmIChjb250ZXh0LnJlZ2lvbkhlaWdodCA+PSAxMCAmJlxuICAgICAgICAgICAgIGNvbnRleHQuZHJhZ0RpcmVjdGlvbiA9PSB1dGlscy5WRVJUSUNBTCkge1xuICAgIHZhciB0b3AgPSBNYXRoLm1pbihjb250ZXh0LmRyYWdTdGFydFksIGNvbnRleHQuZHJhZ0VuZFkpLFxuICAgICAgICBib3R0b20gPSBNYXRoLm1heChjb250ZXh0LmRyYWdTdGFydFksIGNvbnRleHQuZHJhZ0VuZFkpO1xuICAgIHRvcCA9IE1hdGgubWF4KHRvcCwgcGxvdEFyZWEueSk7XG4gICAgYm90dG9tID0gTWF0aC5taW4oYm90dG9tLCBwbG90QXJlYS55ICsgcGxvdEFyZWEuaCk7XG4gICAgaWYgKHRvcCA8IGJvdHRvbSkge1xuICAgICAgZy5kb1pvb21ZXyh0b3AsIGJvdHRvbSk7XG4gICAgfVxuICAgIGNvbnRleHQuY2FuY2VsTmV4dERibGNsaWNrID0gdHJ1ZTtcbiAgfVxuICBjb250ZXh0LmRyYWdTdGFydFggPSBudWxsO1xuICBjb250ZXh0LmRyYWdTdGFydFkgPSBudWxsO1xufTtcblxuLyoqXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoSW50ZXJhY3Rpb24uc3RhcnRUb3VjaCA9IGZ1bmN0aW9uKGV2ZW50LCBnLCBjb250ZXh0KSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7ICAvLyB0b3VjaCBicm93c2VycyBhcmUgYWxsIG5pY2UuXG4gIGlmIChldmVudC50b3VjaGVzLmxlbmd0aCA+IDEpIHtcbiAgICAvLyBJZiB0aGUgdXNlciBldmVyIHB1dHMgdHdvIGZpbmdlcnMgZG93biwgaXQncyBub3QgYSBkb3VibGUgdGFwLlxuICAgIGNvbnRleHQuc3RhcnRUaW1lRm9yRG91YmxlVGFwTXMgPSBudWxsO1xuICB9XG5cbiAgdmFyIHRvdWNoZXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBldmVudC50b3VjaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHQgPSBldmVudC50b3VjaGVzW2ldO1xuICAgIHZhciByZWN0ID0gdC50YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAvLyB3ZSBkaXNwZW5zZSB3aXRoICdkcmFnR2V0WF8nIGJlY2F1c2UgYWxsIHRvdWNoQnJvd3NlcnMgc3VwcG9ydCBwYWdlWFxuICAgIHRvdWNoZXMucHVzaCh7XG4gICAgICBwYWdlWDogdC5wYWdlWCxcbiAgICAgIHBhZ2VZOiB0LnBhZ2VZLFxuICAgICAgZGF0YVg6IGcudG9EYXRhWENvb3JkKHQuY2xpZW50WCAtIHJlY3QubGVmdCksXG4gICAgICBkYXRhWTogZy50b0RhdGFZQ29vcmQodC5jbGllbnRZIC0gcmVjdC50b3ApXG4gICAgICAvLyBpZGVudGlmaWVyOiB0LmlkZW50aWZpZXJcbiAgICB9KTtcbiAgfVxuICBjb250ZXh0LmluaXRpYWxUb3VjaGVzID0gdG91Y2hlcztcblxuICBpZiAodG91Y2hlcy5sZW5ndGggPT0gMSkge1xuICAgIC8vIFRoaXMgaXMganVzdCBhIHN3aXBlLlxuICAgIGNvbnRleHQuaW5pdGlhbFBpbmNoQ2VudGVyID0gdG91Y2hlc1swXTtcbiAgICBjb250ZXh0LnRvdWNoRGlyZWN0aW9ucyA9IHsgeDogdHJ1ZSwgeTogdHJ1ZSB9O1xuICB9IGVsc2UgaWYgKHRvdWNoZXMubGVuZ3RoID49IDIpIHtcbiAgICAvLyBJdCdzIGJlY29tZSBhIHBpbmNoIVxuICAgIC8vIEluIGNhc2UgdGhlcmUgYXJlIDMrIHRvdWNoZXMsIHdlIGlnbm9yZSBhbGwgYnV0IHRoZSBcImZpcnN0XCIgdHdvLlxuXG4gICAgLy8gb25seSBzY3JlZW4gY29vcmRpbmF0ZXMgY2FuIGJlIGF2ZXJhZ2VkIChkYXRhIGNvb3JkcyBjb3VsZCBiZSBsb2cgc2NhbGUpLlxuICAgIGNvbnRleHQuaW5pdGlhbFBpbmNoQ2VudGVyID0ge1xuICAgICAgcGFnZVg6IDAuNSAqICh0b3VjaGVzWzBdLnBhZ2VYICsgdG91Y2hlc1sxXS5wYWdlWCksXG4gICAgICBwYWdlWTogMC41ICogKHRvdWNoZXNbMF0ucGFnZVkgKyB0b3VjaGVzWzFdLnBhZ2VZKSxcblxuICAgICAgLy8gVE9ETyhkYW52ayk6IHJlbW92ZVxuICAgICAgZGF0YVg6IDAuNSAqICh0b3VjaGVzWzBdLmRhdGFYICsgdG91Y2hlc1sxXS5kYXRhWCksXG4gICAgICBkYXRhWTogMC41ICogKHRvdWNoZXNbMF0uZGF0YVkgKyB0b3VjaGVzWzFdLmRhdGFZKVxuICAgIH07XG5cbiAgICAvLyBNYWtlIHBpbmNoZXMgaW4gYSA0NS1kZWdyZWUgc3dhdGggYXJvdW5kIGVpdGhlciBheGlzIDEtZGltZW5zaW9uYWwgem9vbXMuXG4gICAgdmFyIGluaXRpYWxBbmdsZSA9IDE4MCAvIE1hdGguUEkgKiBNYXRoLmF0YW4yKFxuICAgICAgICBjb250ZXh0LmluaXRpYWxQaW5jaENlbnRlci5wYWdlWSAtIHRvdWNoZXNbMF0ucGFnZVksXG4gICAgICAgIHRvdWNoZXNbMF0ucGFnZVggLSBjb250ZXh0LmluaXRpYWxQaW5jaENlbnRlci5wYWdlWCk7XG5cbiAgICAvLyB1c2Ugc3ltbWV0cnkgdG8gZ2V0IGl0IGludG8gdGhlIGZpcnN0IHF1YWRyYW50LlxuICAgIGluaXRpYWxBbmdsZSA9IE1hdGguYWJzKGluaXRpYWxBbmdsZSk7XG4gICAgaWYgKGluaXRpYWxBbmdsZSA+IDkwKSBpbml0aWFsQW5nbGUgPSA5MCAtIGluaXRpYWxBbmdsZTtcblxuICAgIGNvbnRleHQudG91Y2hEaXJlY3Rpb25zID0ge1xuICAgICAgeDogKGluaXRpYWxBbmdsZSA8ICg5MCAtIDQ1LzIpKSxcbiAgICAgIHk6IChpbml0aWFsQW5nbGUgPiA0NS8yKVxuICAgIH07XG4gIH1cblxuICAvLyBzYXZlIHRoZSBmdWxsIHggJiB5IHJhbmdlcy5cbiAgY29udGV4dC5pbml0aWFsUmFuZ2UgPSB7XG4gICAgeDogZy54QXhpc1JhbmdlKCksXG4gICAgeTogZy55QXhpc1JhbmdlKClcbiAgfTtcbn07XG5cbi8qKlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaEludGVyYWN0aW9uLm1vdmVUb3VjaCA9IGZ1bmN0aW9uKGV2ZW50LCBnLCBjb250ZXh0KSB7XG4gIC8vIElmIHRoZSB0YXAgbW92ZXMsIHRoZW4gaXQncyBkZWZpbml0ZWx5IG5vdCBwYXJ0IG9mIGEgZG91YmxlLXRhcC5cbiAgY29udGV4dC5zdGFydFRpbWVGb3JEb3VibGVUYXBNcyA9IG51bGw7XG5cbiAgdmFyIGksIHRvdWNoZXMgPSBbXTtcbiAgZm9yIChpID0gMDsgaSA8IGV2ZW50LnRvdWNoZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdCA9IGV2ZW50LnRvdWNoZXNbaV07XG4gICAgdG91Y2hlcy5wdXNoKHtcbiAgICAgIHBhZ2VYOiB0LnBhZ2VYLFxuICAgICAgcGFnZVk6IHQucGFnZVlcbiAgICB9KTtcbiAgfVxuICB2YXIgaW5pdGlhbFRvdWNoZXMgPSBjb250ZXh0LmluaXRpYWxUb3VjaGVzO1xuXG4gIHZhciBjX25vdztcblxuICAvLyBvbGQgYW5kIG5ldyBjZW50ZXJzLlxuICB2YXIgY19pbml0ID0gY29udGV4dC5pbml0aWFsUGluY2hDZW50ZXI7XG4gIGlmICh0b3VjaGVzLmxlbmd0aCA9PSAxKSB7XG4gICAgY19ub3cgPSB0b3VjaGVzWzBdO1xuICB9IGVsc2Uge1xuICAgIGNfbm93ID0ge1xuICAgICAgcGFnZVg6IDAuNSAqICh0b3VjaGVzWzBdLnBhZ2VYICsgdG91Y2hlc1sxXS5wYWdlWCksXG4gICAgICBwYWdlWTogMC41ICogKHRvdWNoZXNbMF0ucGFnZVkgKyB0b3VjaGVzWzFdLnBhZ2VZKVxuICAgIH07XG4gIH1cblxuICAvLyB0aGlzIGlzIHRoZSBcInN3aXBlXCIgY29tcG9uZW50XG4gIC8vIHdlIHRvc3MgaXQgb3V0IGZvciBub3csIGJ1dCBjb3VsZCB1c2UgaXQgaW4gdGhlIGZ1dHVyZS5cbiAgdmFyIHN3aXBlID0ge1xuICAgIHBhZ2VYOiBjX25vdy5wYWdlWCAtIGNfaW5pdC5wYWdlWCxcbiAgICBwYWdlWTogY19ub3cucGFnZVkgLSBjX2luaXQucGFnZVlcbiAgfTtcbiAgdmFyIGRhdGFXaWR0aCA9IGNvbnRleHQuaW5pdGlhbFJhbmdlLnhbMV0gLSBjb250ZXh0LmluaXRpYWxSYW5nZS54WzBdO1xuICB2YXIgZGF0YUhlaWdodCA9IGNvbnRleHQuaW5pdGlhbFJhbmdlLnlbMF0gLSBjb250ZXh0LmluaXRpYWxSYW5nZS55WzFdO1xuICBzd2lwZS5kYXRhWCA9IChzd2lwZS5wYWdlWCAvIGcucGxvdHRlcl8uYXJlYS53KSAqIGRhdGFXaWR0aDtcbiAgc3dpcGUuZGF0YVkgPSAoc3dpcGUucGFnZVkgLyBnLnBsb3R0ZXJfLmFyZWEuaCkgKiBkYXRhSGVpZ2h0O1xuICB2YXIgeFNjYWxlLCB5U2NhbGU7XG5cbiAgLy8gVGhlIHJlc2lkdWFsIGJpdHMgYXJlIHVzdWFsbHkgc3BsaXQgaW50byBzY2FsZSAmIHJvdGF0ZSBiaXRzLCBidXQgd2Ugc3BsaXRcbiAgLy8gdGhlbSBpbnRvIHgtc2NhbGUgYW5kIHktc2NhbGUgYml0cy5cbiAgaWYgKHRvdWNoZXMubGVuZ3RoID09IDEpIHtcbiAgICB4U2NhbGUgPSAxLjA7XG4gICAgeVNjYWxlID0gMS4wO1xuICB9IGVsc2UgaWYgKHRvdWNoZXMubGVuZ3RoID49IDIpIHtcbiAgICB2YXIgaW5pdEhhbGZXaWR0aCA9IChpbml0aWFsVG91Y2hlc1sxXS5wYWdlWCAtIGNfaW5pdC5wYWdlWCk7XG4gICAgeFNjYWxlID0gKHRvdWNoZXNbMV0ucGFnZVggLSBjX25vdy5wYWdlWCkgLyBpbml0SGFsZldpZHRoO1xuXG4gICAgdmFyIGluaXRIYWxmSGVpZ2h0ID0gKGluaXRpYWxUb3VjaGVzWzFdLnBhZ2VZIC0gY19pbml0LnBhZ2VZKTtcbiAgICB5U2NhbGUgPSAodG91Y2hlc1sxXS5wYWdlWSAtIGNfbm93LnBhZ2VZKSAvIGluaXRIYWxmSGVpZ2h0O1xuICB9XG5cbiAgLy8gQ2xpcCBzY2FsaW5nIHRvIFsxLzgsIDhdIHRvIHByZXZlbnQgdG9vIG11Y2ggYmxvd3VwLlxuICB4U2NhbGUgPSBNYXRoLm1pbig4LCBNYXRoLm1heCgwLjEyNSwgeFNjYWxlKSk7XG4gIHlTY2FsZSA9IE1hdGgubWluKDgsIE1hdGgubWF4KDAuMTI1LCB5U2NhbGUpKTtcblxuICB2YXIgZGlkWm9vbSA9IGZhbHNlO1xuICBpZiAoY29udGV4dC50b3VjaERpcmVjdGlvbnMueCkge1xuICAgIHZhciBjRmFjdG9yID0gY19pbml0LmRhdGFYIC0gc3dpcGUuZGF0YVggLyB4U2NhbGU7XG4gICAgZy5kYXRlV2luZG93XyA9IFtcbiAgICAgIGNGYWN0b3IgKyAoY29udGV4dC5pbml0aWFsUmFuZ2UueFswXSAtIGNfaW5pdC5kYXRhWCkgLyB4U2NhbGUsXG4gICAgICBjRmFjdG9yICsgKGNvbnRleHQuaW5pdGlhbFJhbmdlLnhbMV0gLSBjX2luaXQuZGF0YVgpIC8geFNjYWxlXG4gICAgXTtcbiAgICBkaWRab29tID0gdHJ1ZTtcbiAgfVxuXG4gIGlmIChjb250ZXh0LnRvdWNoRGlyZWN0aW9ucy55KSB7XG4gICAgZm9yIChpID0gMDsgaSA8IDEgIC8qZy5heGVzXy5sZW5ndGgqLzsgaSsrKSB7XG4gICAgICB2YXIgYXhpcyA9IGcuYXhlc19baV07XG4gICAgICB2YXIgbG9nc2NhbGUgPSBnLmF0dHJpYnV0ZXNfLmdldEZvckF4aXMoXCJsb2dzY2FsZVwiLCBpKTtcbiAgICAgIGlmIChsb2dzY2FsZSkge1xuICAgICAgICAvLyBUT0RPKGRhbnZrKTogaW1wbGVtZW50XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgY0ZhY3RvciA9IGNfaW5pdC5kYXRhWSAtIHN3aXBlLmRhdGFZIC8geVNjYWxlO1xuICAgICAgICBheGlzLnZhbHVlUmFuZ2UgPSBbXG4gICAgICAgICAgY0ZhY3RvciArIChjb250ZXh0LmluaXRpYWxSYW5nZS55WzBdIC0gY19pbml0LmRhdGFZKSAvIHlTY2FsZSxcbiAgICAgICAgICBjRmFjdG9yICsgKGNvbnRleHQuaW5pdGlhbFJhbmdlLnlbMV0gLSBjX2luaXQuZGF0YVkpIC8geVNjYWxlXG4gICAgICAgIF07XG4gICAgICAgIGRpZFpvb20gPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGcuZHJhd0dyYXBoXyhmYWxzZSk7XG5cbiAgLy8gV2Ugb25seSBjYWxsIHpvb21DYWxsYmFjayBvbiB6b29tcywgbm90IHBhbnMsIHRvIG1pcnJvciBkZXNrdG9wIGJlaGF2aW9yLlxuICBpZiAoZGlkWm9vbSAmJiB0b3VjaGVzLmxlbmd0aCA+IDEgJiYgZy5nZXRGdW5jdGlvbk9wdGlvbignem9vbUNhbGxiYWNrJykpIHtcbiAgICB2YXIgdmlld1dpbmRvdyA9IGcueEF4aXNSYW5nZSgpO1xuICAgIGcuZ2V0RnVuY3Rpb25PcHRpb24oXCJ6b29tQ2FsbGJhY2tcIikuY2FsbChnLCB2aWV3V2luZG93WzBdLCB2aWV3V2luZG93WzFdLCBnLnlBeGlzUmFuZ2VzKCkpO1xuICB9XG59O1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGhJbnRlcmFjdGlvbi5lbmRUb3VjaCA9IGZ1bmN0aW9uKGV2ZW50LCBnLCBjb250ZXh0KSB7XG4gIGlmIChldmVudC50b3VjaGVzLmxlbmd0aCAhPT0gMCkge1xuICAgIC8vIHRoaXMgaXMgZWZmZWN0aXZlbHkgYSBcInJlc2V0XCJcbiAgICBEeWdyYXBoSW50ZXJhY3Rpb24uc3RhcnRUb3VjaChldmVudCwgZywgY29udGV4dCk7XG4gIH0gZWxzZSBpZiAoZXZlbnQuY2hhbmdlZFRvdWNoZXMubGVuZ3RoID09IDEpIHtcbiAgICAvLyBDb3VsZCBiZSBwYXJ0IG9mIGEgXCJkb3VibGUgdGFwXCJcbiAgICAvLyBUaGUgaGV1cmlzdGljIGhlcmUgaXMgdGhhdCBpdCdzIGEgZG91YmxlLXRhcCBpZiB0aGUgdHdvIHRvdWNoZW5kIGV2ZW50c1xuICAgIC8vIG9jY3VyIHdpdGhpbiA1MDBtcyBhbmQgd2l0aGluIGEgNTB4NTAgcGl4ZWwgYm94LlxuICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB2YXIgdCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdO1xuICAgIGlmIChjb250ZXh0LnN0YXJ0VGltZUZvckRvdWJsZVRhcE1zICYmXG4gICAgICAgIG5vdyAtIGNvbnRleHQuc3RhcnRUaW1lRm9yRG91YmxlVGFwTXMgPCA1MDAgJiZcbiAgICAgICAgY29udGV4dC5kb3VibGVUYXBYICYmIE1hdGguYWJzKGNvbnRleHQuZG91YmxlVGFwWCAtIHQuc2NyZWVuWCkgPCA1MCAmJlxuICAgICAgICBjb250ZXh0LmRvdWJsZVRhcFkgJiYgTWF0aC5hYnMoY29udGV4dC5kb3VibGVUYXBZIC0gdC5zY3JlZW5ZKSA8IDUwKSB7XG4gICAgICBnLnJlc2V0Wm9vbSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZXh0LnN0YXJ0VGltZUZvckRvdWJsZVRhcE1zID0gbm93O1xuICAgICAgY29udGV4dC5kb3VibGVUYXBYID0gdC5zY3JlZW5YO1xuICAgICAgY29udGV4dC5kb3VibGVUYXBZID0gdC5zY3JlZW5ZO1xuICAgIH1cbiAgfVxufTtcblxuLy8gRGV0ZXJtaW5lIHRoZSBkaXN0YW5jZSBmcm9tIHggdG8gW2xlZnQsIHJpZ2h0XS5cbnZhciBkaXN0YW5jZUZyb21JbnRlcnZhbCA9IGZ1bmN0aW9uKHgsIGxlZnQsIHJpZ2h0KSB7XG4gIGlmICh4IDwgbGVmdCkge1xuICAgIHJldHVybiBsZWZ0IC0geDtcbiAgfSBlbHNlIGlmICh4ID4gcmlnaHQpIHtcbiAgICByZXR1cm4geCAtIHJpZ2h0O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAwO1xuICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG51bWJlciBvZiBwaXhlbHMgYnkgd2hpY2ggdGhlIGV2ZW50IGhhcHBlbnMgZnJvbSB0aGUgbmVhcmVzdFxuICogZWRnZSBvZiB0aGUgY2hhcnQuIEZvciBldmVudHMgaW4gdGhlIGludGVyaW9yIG9mIHRoZSBjaGFydCwgdGhpcyByZXR1cm5zIHplcm8uXG4gKi9cbnZhciBkaXN0YW5jZUZyb21DaGFydCA9IGZ1bmN0aW9uKGV2ZW50LCBnKSB7XG4gIHZhciBjaGFydFBvcyA9IHV0aWxzLmZpbmRQb3MoZy5jYW52YXNfKTtcbiAgdmFyIGJveCA9IHtcbiAgICBsZWZ0OiBjaGFydFBvcy54LFxuICAgIHJpZ2h0OiBjaGFydFBvcy54ICsgZy5jYW52YXNfLm9mZnNldFdpZHRoLFxuICAgIHRvcDogY2hhcnRQb3MueSxcbiAgICBib3R0b206IGNoYXJ0UG9zLnkgKyBnLmNhbnZhc18ub2Zmc2V0SGVpZ2h0XG4gIH07XG5cbiAgdmFyIHB0ID0ge1xuICAgIHg6IHV0aWxzLnBhZ2VYKGV2ZW50KSxcbiAgICB5OiB1dGlscy5wYWdlWShldmVudClcbiAgfTtcblxuICB2YXIgZHggPSBkaXN0YW5jZUZyb21JbnRlcnZhbChwdC54LCBib3gubGVmdCwgYm94LnJpZ2h0KSxcbiAgICAgIGR5ID0gZGlzdGFuY2VGcm9tSW50ZXJ2YWwocHQueSwgYm94LnRvcCwgYm94LmJvdHRvbSk7XG4gIHJldHVybiBNYXRoLm1heChkeCwgZHkpO1xufTtcblxuLyoqXG4gKiBEZWZhdWx0IGludGVyYXRpb24gbW9kZWwgZm9yIGR5Z3JhcGhzLiBZb3UgY2FuIHJlZmVyIHRvIHNwZWNpZmljIGVsZW1lbnRzIG9mXG4gKiB0aGlzIHdoZW4gY29uc3RydWN0aW5nIHlvdXIgb3duIGludGVyYWN0aW9uIG1vZGVsLCBlLmcuOlxuICogZy51cGRhdGVPcHRpb25zKCB7XG4gKiAgIGludGVyYWN0aW9uTW9kZWw6IHtcbiAqICAgICBtb3VzZWRvd246IER5Z3JhcGhJbnRlcmFjdGlvbi5kZWZhdWx0SW50ZXJhY3Rpb25Nb2RlbC5tb3VzZWRvd25cbiAqICAgfVxuICogfSApO1xuICovXG5EeWdyYXBoSW50ZXJhY3Rpb24uZGVmYXVsdE1vZGVsID0ge1xuICAvLyBUcmFjayB0aGUgYmVnaW5uaW5nIG9mIGRyYWcgZXZlbnRzXG4gIG1vdXNlZG93bjogZnVuY3Rpb24oZXZlbnQsIGcsIGNvbnRleHQpIHtcbiAgICAvLyBSaWdodC1jbGljayBzaG91bGQgbm90IGluaXRpYXRlIGEgem9vbS5cbiAgICBpZiAoZXZlbnQuYnV0dG9uICYmIGV2ZW50LmJ1dHRvbiA9PSAyKSByZXR1cm47XG5cbiAgICBjb250ZXh0LmluaXRpYWxpemVNb3VzZURvd24oZXZlbnQsIGcsIGNvbnRleHQpO1xuXG4gICAgaWYgKGV2ZW50LmFsdEtleSB8fCBldmVudC5zaGlmdEtleSkge1xuICAgICAgRHlncmFwaEludGVyYWN0aW9uLnN0YXJ0UGFuKGV2ZW50LCBnLCBjb250ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgRHlncmFwaEludGVyYWN0aW9uLnN0YXJ0Wm9vbShldmVudCwgZywgY29udGV4dCk7XG4gICAgfVxuXG4gICAgLy8gTm90ZTogd2UgcmVnaXN0ZXIgbW91c2Vtb3ZlL21vdXNldXAgb24gZG9jdW1lbnQgdG8gYWxsb3cgc29tZSBsZWV3YXkgZm9yXG4gICAgLy8gZXZlbnRzIHRvIG1vdmUgb3V0c2lkZSBvZiB0aGUgY2hhcnQuIEludGVyYWN0aW9uIG1vZGVsIGV2ZW50cyBnZXRcbiAgICAvLyByZWdpc3RlcmVkIG9uIHRoZSBjYW52YXMsIHdoaWNoIGlzIHRvbyBzbWFsbCB0byBhbGxvdyB0aGlzLlxuICAgIHZhciBtb3VzZW1vdmUgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgaWYgKGNvbnRleHQuaXNab29taW5nKSB7XG4gICAgICAgIC8vIFdoZW4gdGhlIG1vdXNlIG1vdmVzID4yMDBweCBmcm9tIHRoZSBjaGFydCBlZGdlLCBjYW5jZWwgdGhlIHpvb20uXG4gICAgICAgIHZhciBkID0gZGlzdGFuY2VGcm9tQ2hhcnQoZXZlbnQsIGcpO1xuICAgICAgICBpZiAoZCA8IERSQUdfRURHRV9NQVJHSU4pIHtcbiAgICAgICAgICBEeWdyYXBoSW50ZXJhY3Rpb24ubW92ZVpvb20oZXZlbnQsIGcsIGNvbnRleHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChjb250ZXh0LmRyYWdFbmRYICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb250ZXh0LmRyYWdFbmRYID0gbnVsbDtcbiAgICAgICAgICAgIGNvbnRleHQuZHJhZ0VuZFkgPSBudWxsO1xuICAgICAgICAgICAgZy5jbGVhclpvb21SZWN0XygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChjb250ZXh0LmlzUGFubmluZykge1xuICAgICAgICBEeWdyYXBoSW50ZXJhY3Rpb24ubW92ZVBhbihldmVudCwgZywgY29udGV4dCk7XG4gICAgICB9XG4gICAgfTtcbiAgICB2YXIgbW91c2V1cCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBpZiAoY29udGV4dC5pc1pvb21pbmcpIHtcbiAgICAgICAgaWYgKGNvbnRleHQuZHJhZ0VuZFggIT09IG51bGwpIHtcbiAgICAgICAgICBEeWdyYXBoSW50ZXJhY3Rpb24uZW5kWm9vbShldmVudCwgZywgY29udGV4dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgRHlncmFwaEludGVyYWN0aW9uLm1heWJlVHJlYXRNb3VzZU9wQXNDbGljayhldmVudCwgZywgY29udGV4dCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5pc1Bhbm5pbmcpIHtcbiAgICAgICAgRHlncmFwaEludGVyYWN0aW9uLmVuZFBhbihldmVudCwgZywgY29udGV4dCk7XG4gICAgICB9XG5cbiAgICAgIHV0aWxzLnJlbW92ZUV2ZW50KGRvY3VtZW50LCAnbW91c2Vtb3ZlJywgbW91c2Vtb3ZlKTtcbiAgICAgIHV0aWxzLnJlbW92ZUV2ZW50KGRvY3VtZW50LCAnbW91c2V1cCcsIG1vdXNldXApO1xuICAgICAgY29udGV4dC5kZXN0cm95KCk7XG4gICAgfTtcblxuICAgIGcuYWRkQW5kVHJhY2tFdmVudChkb2N1bWVudCwgJ21vdXNlbW92ZScsIG1vdXNlbW92ZSk7XG4gICAgZy5hZGRBbmRUcmFja0V2ZW50KGRvY3VtZW50LCAnbW91c2V1cCcsIG1vdXNldXApO1xuICB9LFxuICB3aWxsRGVzdHJveUNvbnRleHRNeXNlbGY6IHRydWUsXG5cbiAgdG91Y2hzdGFydDogZnVuY3Rpb24oZXZlbnQsIGcsIGNvbnRleHQpIHtcbiAgICBEeWdyYXBoSW50ZXJhY3Rpb24uc3RhcnRUb3VjaChldmVudCwgZywgY29udGV4dCk7XG4gIH0sXG4gIHRvdWNobW92ZTogZnVuY3Rpb24oZXZlbnQsIGcsIGNvbnRleHQpIHtcbiAgICBEeWdyYXBoSW50ZXJhY3Rpb24ubW92ZVRvdWNoKGV2ZW50LCBnLCBjb250ZXh0KTtcbiAgfSxcbiAgdG91Y2hlbmQ6IGZ1bmN0aW9uKGV2ZW50LCBnLCBjb250ZXh0KSB7XG4gICAgRHlncmFwaEludGVyYWN0aW9uLmVuZFRvdWNoKGV2ZW50LCBnLCBjb250ZXh0KTtcbiAgfSxcblxuICAvLyBEaXNhYmxlIHpvb21pbmcgb3V0IGlmIHBhbm5pbmcuXG4gIGRibGNsaWNrOiBmdW5jdGlvbihldmVudCwgZywgY29udGV4dCkge1xuICAgIGlmIChjb250ZXh0LmNhbmNlbE5leHREYmxjbGljaykge1xuICAgICAgY29udGV4dC5jYW5jZWxOZXh0RGJsY2xpY2sgPSBmYWxzZTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBHaXZlIHBsdWdpbnMgYSBjaGFuY2UgdG8gZ3JhYiB0aGlzIGV2ZW50LlxuICAgIHZhciBlID0ge1xuICAgICAgY2FudmFzeDogY29udGV4dC5kcmFnRW5kWCxcbiAgICAgIGNhbnZhc3k6IGNvbnRleHQuZHJhZ0VuZFksXG4gICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgIH07XG4gICAgaWYgKGcuY2FzY2FkZUV2ZW50c18oJ2RibGNsaWNrJywgZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoZXZlbnQuYWx0S2V5IHx8IGV2ZW50LnNoaWZ0S2V5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGcucmVzZXRab29tKCk7XG4gIH1cbn07XG5cbi8qXG5EeWdyYXBoLkRFRkFVTFRfQVRUUlMuaW50ZXJhY3Rpb25Nb2RlbCA9IER5Z3JhcGhJbnRlcmFjdGlvbi5kZWZhdWx0TW9kZWw7XG5cbi8vIG9sZCB3YXlzIG9mIGFjY2Vzc2luZyB0aGVzZSBtZXRob2RzL3Byb3BlcnRpZXNcbkR5Z3JhcGguZGVmYXVsdEludGVyYWN0aW9uTW9kZWwgPSBEeWdyYXBoSW50ZXJhY3Rpb24uZGVmYXVsdE1vZGVsO1xuRHlncmFwaC5lbmRab29tID0gRHlncmFwaEludGVyYWN0aW9uLmVuZFpvb207XG5EeWdyYXBoLm1vdmVab29tID0gRHlncmFwaEludGVyYWN0aW9uLm1vdmVab29tO1xuRHlncmFwaC5zdGFydFpvb20gPSBEeWdyYXBoSW50ZXJhY3Rpb24uc3RhcnRab29tO1xuRHlncmFwaC5lbmRQYW4gPSBEeWdyYXBoSW50ZXJhY3Rpb24uZW5kUGFuO1xuRHlncmFwaC5tb3ZlUGFuID0gRHlncmFwaEludGVyYWN0aW9uLm1vdmVQYW47XG5EeWdyYXBoLnN0YXJ0UGFuID0gRHlncmFwaEludGVyYWN0aW9uLnN0YXJ0UGFuO1xuKi9cblxuRHlncmFwaEludGVyYWN0aW9uLm5vbkludGVyYWN0aXZlTW9kZWxfID0ge1xuICBtb3VzZWRvd246IGZ1bmN0aW9uKGV2ZW50LCBnLCBjb250ZXh0KSB7XG4gICAgY29udGV4dC5pbml0aWFsaXplTW91c2VEb3duKGV2ZW50LCBnLCBjb250ZXh0KTtcbiAgfSxcbiAgbW91c2V1cDogRHlncmFwaEludGVyYWN0aW9uLm1heWJlVHJlYXRNb3VzZU9wQXNDbGlja1xufTtcblxuLy8gRGVmYXVsdCBpbnRlcmFjdGlvbiBtb2RlbCB3aGVuIHVzaW5nIHRoZSByYW5nZSBzZWxlY3Rvci5cbkR5Z3JhcGhJbnRlcmFjdGlvbi5kcmFnSXNQYW5JbnRlcmFjdGlvbk1vZGVsID0ge1xuICBtb3VzZWRvd246IGZ1bmN0aW9uKGV2ZW50LCBnLCBjb250ZXh0KSB7XG4gICAgY29udGV4dC5pbml0aWFsaXplTW91c2VEb3duKGV2ZW50LCBnLCBjb250ZXh0KTtcbiAgICBEeWdyYXBoSW50ZXJhY3Rpb24uc3RhcnRQYW4oZXZlbnQsIGcsIGNvbnRleHQpO1xuICB9LFxuICBtb3VzZW1vdmU6IGZ1bmN0aW9uKGV2ZW50LCBnLCBjb250ZXh0KSB7XG4gICAgaWYgKGNvbnRleHQuaXNQYW5uaW5nKSB7XG4gICAgICBEeWdyYXBoSW50ZXJhY3Rpb24ubW92ZVBhbihldmVudCwgZywgY29udGV4dCk7XG4gICAgfVxuICB9LFxuICBtb3VzZXVwOiBmdW5jdGlvbihldmVudCwgZywgY29udGV4dCkge1xuICAgIGlmIChjb250ZXh0LmlzUGFubmluZykge1xuICAgICAgRHlncmFwaEludGVyYWN0aW9uLmVuZFBhbihldmVudCwgZywgY29udGV4dCk7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBEeWdyYXBoSW50ZXJhY3Rpb247XG4iXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFlBQVk7O0FBQUM7RUFBQTtBQUFBO0FBQUE7QUFFYjtBQUF5QztBQUFBO0FBRXpDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJQSxnQkFBZ0IsR0FBRyxHQUFHOztBQUUxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUlDLGtCQUFrQixHQUFHLENBQUMsQ0FBQzs7QUFFM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FBLGtCQUFrQixDQUFDQyx3QkFBd0IsR0FBRyxVQUFTQyxLQUFLLEVBQUVDLENBQUMsRUFBRUMsT0FBTyxFQUFFO0VBQ3hFQSxPQUFPLENBQUNDLFFBQVEsR0FBR0MsS0FBSyxDQUFDQyxTQUFTLENBQUNMLEtBQUssRUFBRUUsT0FBTyxDQUFDO0VBQ2xEQSxPQUFPLENBQUNJLFFBQVEsR0FBR0YsS0FBSyxDQUFDRyxTQUFTLENBQUNQLEtBQUssRUFBRUUsT0FBTyxDQUFDO0VBQ2xELElBQUlNLFdBQVcsR0FBR0MsSUFBSSxDQUFDQyxHQUFHLENBQUNSLE9BQU8sQ0FBQ0MsUUFBUSxHQUFHRCxPQUFPLENBQUNTLFVBQVUsQ0FBQztFQUNqRSxJQUFJQyxZQUFZLEdBQUdILElBQUksQ0FBQ0MsR0FBRyxDQUFDUixPQUFPLENBQUNJLFFBQVEsR0FBR0osT0FBTyxDQUFDVyxVQUFVLENBQUM7RUFFbEUsSUFBSUwsV0FBVyxHQUFHLENBQUMsSUFBSUksWUFBWSxHQUFHLENBQUMsSUFDbkNYLENBQUMsQ0FBQ2EsTUFBTSxLQUFLQyxTQUFTLElBQUlkLENBQUMsQ0FBQ2EsTUFBTSxLQUFLLElBQUksRUFBRTtJQUMvQ2hCLGtCQUFrQixDQUFDa0IsbUJBQW1CLENBQUNmLENBQUMsRUFBRUQsS0FBSyxFQUFFRSxPQUFPLENBQUM7RUFDM0Q7RUFFQUEsT0FBTyxDQUFDTSxXQUFXLEdBQUdBLFdBQVc7RUFDakNOLE9BQU8sQ0FBQ1UsWUFBWSxHQUFHQSxZQUFZO0FBQ3JDLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBZCxrQkFBa0IsQ0FBQ21CLFFBQVEsR0FBRyxVQUFTakIsS0FBSyxFQUFFQyxDQUFDLEVBQUVDLE9BQU8sRUFBRTtFQUN4RCxJQUFJZ0IsQ0FBQyxFQUFFQyxJQUFJO0VBQ1hqQixPQUFPLENBQUNrQixTQUFTLEdBQUcsSUFBSTtFQUN4QixJQUFJQyxNQUFNLEdBQUdwQixDQUFDLENBQUNxQixVQUFVLEVBQUU7RUFFM0IsSUFBSXJCLENBQUMsQ0FBQ3NCLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsRUFBRTtJQUN2Q3JCLE9BQU8sQ0FBQ3NCLG1CQUFtQixHQUFHcEIsS0FBSyxDQUFDcUIsS0FBSyxDQUFDSixNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcERuQixPQUFPLENBQUN3QixTQUFTLEdBQUd0QixLQUFLLENBQUNxQixLQUFLLENBQUNKLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHakIsS0FBSyxDQUFDcUIsS0FBSyxDQUFDSixNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDckUsQ0FBQyxNQUFNO0lBQ0xuQixPQUFPLENBQUNzQixtQkFBbUIsR0FBR0gsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUN2Q25CLE9BQU8sQ0FBQ3dCLFNBQVMsR0FBR0wsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHQSxNQUFNLENBQUMsQ0FBQyxDQUFDO0VBQzNDO0VBQ0FuQixPQUFPLENBQUN5QixjQUFjLEdBQUd6QixPQUFPLENBQUN3QixTQUFTLElBQUl6QixDQUFDLENBQUMyQixRQUFRLENBQUNDLElBQUksQ0FBQ0MsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUVwRSxJQUFJN0IsQ0FBQyxDQUFDOEIsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUMsRUFBRTtJQUN6QyxJQUFJQyxnQkFBZ0IsR0FBRy9CLENBQUMsQ0FBQ2dDLE1BQU0sR0FBR2hDLENBQUMsQ0FBQzhCLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDO0lBQ3ZFLElBQUlHLFNBQVMsR0FBR2pDLENBQUMsQ0FBQ2tDLGFBQWEsRUFBRSxDQUFDLENBQUM7O0lBRW5DLElBQUlDLFlBQVksR0FBR25DLENBQUMsQ0FBQ29DLFdBQVcsQ0FBQ0gsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUdGLGdCQUFnQjtJQUNqRSxJQUFJTSxhQUFhLEdBQUdyQyxDQUFDLENBQUNvQyxXQUFXLENBQUNILFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHRixnQkFBZ0I7SUFFbEUsSUFBSU8sZUFBZSxHQUFHdEMsQ0FBQyxDQUFDdUMsWUFBWSxDQUFDSixZQUFZLENBQUM7SUFDbEQsSUFBSUssZ0JBQWdCLEdBQUd4QyxDQUFDLENBQUN1QyxZQUFZLENBQUNGLGFBQWEsQ0FBQztJQUNwRHBDLE9BQU8sQ0FBQ3dDLFlBQVksR0FBRyxDQUFDSCxlQUFlLEVBQUVFLGdCQUFnQixDQUFDO0lBRTFELElBQUlFLGFBQWEsR0FBRyxFQUFFO0lBQ3RCLElBQUlDLGdCQUFnQixHQUFHM0MsQ0FBQyxDQUFDNEMsT0FBTyxHQUFHNUMsQ0FBQyxDQUFDOEIsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUM7SUFFeEUsS0FBS2IsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHakIsQ0FBQyxDQUFDNkMsS0FBSyxDQUFDQyxNQUFNLEVBQUU3QixDQUFDLEVBQUUsRUFBRTtNQUNuQ0MsSUFBSSxHQUFHbEIsQ0FBQyxDQUFDNkMsS0FBSyxDQUFDNUIsQ0FBQyxDQUFDO01BQ2pCLElBQUk4QixTQUFTLEdBQUc3QixJQUFJLENBQUM4QixZQUFZO01BRWpDLElBQUlDLFdBQVcsR0FBR2pELENBQUMsQ0FBQ2tELFdBQVcsQ0FBQ0gsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFOUIsQ0FBQyxDQUFDLEdBQUcwQixnQkFBZ0I7TUFDbkUsSUFBSVEsY0FBYyxHQUFHbkQsQ0FBQyxDQUFDa0QsV0FBVyxDQUFDSCxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUU5QixDQUFDLENBQUMsR0FBRzBCLGdCQUFnQjtNQUV0RSxJQUFJUyxlQUFlLEdBQUdwRCxDQUFDLENBQUNxRCxZQUFZLENBQUNKLFdBQVcsRUFBRWhDLENBQUMsQ0FBQztNQUNwRCxJQUFJcUMsa0JBQWtCLEdBQUd0RCxDQUFDLENBQUNxRCxZQUFZLENBQUNGLGNBQWMsRUFBRWxDLENBQUMsQ0FBQztNQUUxRHlCLGFBQWEsQ0FBQ3pCLENBQUMsQ0FBQyxHQUFHLENBQUNtQyxlQUFlLEVBQUVFLGtCQUFrQixDQUFDO0lBQzFEO0lBQ0FyRCxPQUFPLENBQUN5QyxhQUFhLEdBQUdBLGFBQWE7RUFDdkMsQ0FBQyxNQUFNO0lBQ0w7SUFDQXpDLE9BQU8sQ0FBQ3dDLFlBQVksR0FBRyxJQUFJO0lBQzNCeEMsT0FBTyxDQUFDeUMsYUFBYSxHQUFHLElBQUk7RUFDOUI7O0VBRUE7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBekMsT0FBTyxDQUFDc0QsT0FBTyxHQUFHLEtBQUs7RUFDdkJ0RCxPQUFPLENBQUN1RCxJQUFJLEdBQUcsRUFBRTtFQUNqQixLQUFLdkMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHakIsQ0FBQyxDQUFDNkMsS0FBSyxDQUFDQyxNQUFNLEVBQUU3QixDQUFDLEVBQUUsRUFBRTtJQUNuQ0MsSUFBSSxHQUFHbEIsQ0FBQyxDQUFDNkMsS0FBSyxDQUFDNUIsQ0FBQyxDQUFDO0lBQ2pCLElBQUl3QyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLElBQUlDLE1BQU0sR0FBRzFELENBQUMsQ0FBQzJELFVBQVUsQ0FBQzFDLENBQUMsQ0FBQztJQUM1QjtJQUNBO0lBQ0EsSUFBSTJDLFFBQVEsR0FBRzVELENBQUMsQ0FBQzZELFdBQVcsQ0FBQ0MsVUFBVSxDQUFDLFVBQVUsRUFBRTdDLENBQUMsQ0FBQztJQUN0RCxJQUFJMkMsUUFBUSxFQUFFO01BQ1pILFNBQVMsQ0FBQ00sZUFBZSxHQUFHNUQsS0FBSyxDQUFDcUIsS0FBSyxDQUFDa0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO01BQ2xERCxTQUFTLENBQUNPLGNBQWMsR0FBRzdELEtBQUssQ0FBQ3FCLEtBQUssQ0FBQ2tDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHdkQsS0FBSyxDQUFDcUIsS0FBSyxDQUFDa0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVFLENBQUMsTUFBTTtNQUNMRCxTQUFTLENBQUNNLGVBQWUsR0FBR0wsTUFBTSxDQUFDLENBQUMsQ0FBQztNQUNyQ0QsU0FBUyxDQUFDTyxjQUFjLEdBQUdOLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBR0EsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNsRDtJQUNBRCxTQUFTLENBQUNRLGFBQWEsR0FBR1IsU0FBUyxDQUFDTyxjQUFjLElBQUloRSxDQUFDLENBQUMyQixRQUFRLENBQUNDLElBQUksQ0FBQ3NDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDNUVqRSxPQUFPLENBQUN1RCxJQUFJLENBQUNXLElBQUksQ0FBQ1YsU0FBUyxDQUFDOztJQUU1QjtJQUNBLElBQUl2QyxJQUFJLENBQUNrRCxVQUFVLEVBQUVuRSxPQUFPLENBQUNzRCxPQUFPLEdBQUcsSUFBSTtFQUM3QztBQUNGLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBMUQsa0JBQWtCLENBQUN3RSxPQUFPLEdBQUcsVUFBU3RFLEtBQUssRUFBRUMsQ0FBQyxFQUFFQyxPQUFPLEVBQUU7RUFDdkRBLE9BQU8sQ0FBQ0MsUUFBUSxHQUFHQyxLQUFLLENBQUNDLFNBQVMsQ0FBQ0wsS0FBSyxFQUFFRSxPQUFPLENBQUM7RUFDbERBLE9BQU8sQ0FBQ0ksUUFBUSxHQUFHRixLQUFLLENBQUNHLFNBQVMsQ0FBQ1AsS0FBSyxFQUFFRSxPQUFPLENBQUM7RUFFbEQsSUFBSXFFLE9BQU8sR0FBR3JFLE9BQU8sQ0FBQ3NCLG1CQUFtQixHQUN2QyxDQUFDdEIsT0FBTyxDQUFDQyxRQUFRLEdBQUdELE9BQU8sQ0FBQ1MsVUFBVSxJQUFJVCxPQUFPLENBQUN5QixjQUFjO0VBQ2xFLElBQUl6QixPQUFPLENBQUN3QyxZQUFZLEVBQUU7SUFDeEI2QixPQUFPLEdBQUc5RCxJQUFJLENBQUMrRCxHQUFHLENBQUNELE9BQU8sRUFBRXJFLE9BQU8sQ0FBQ3dDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUN0RDtFQUNBLElBQUkrQixPQUFPLEdBQUdGLE9BQU8sR0FBR3JFLE9BQU8sQ0FBQ3dCLFNBQVM7RUFDekMsSUFBSXhCLE9BQU8sQ0FBQ3dDLFlBQVksRUFBRTtJQUN4QixJQUFJK0IsT0FBTyxHQUFHdkUsT0FBTyxDQUFDd0MsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFO01BQ3JDO01BQ0E2QixPQUFPLEdBQUdBLE9BQU8sSUFBSUUsT0FBTyxHQUFHdkUsT0FBTyxDQUFDd0MsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO01BQ3ZEK0IsT0FBTyxHQUFHRixPQUFPLEdBQUdyRSxPQUFPLENBQUN3QixTQUFTO0lBQ3ZDO0VBQ0Y7RUFFQSxJQUFJekIsQ0FBQyxDQUFDc0IsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxFQUFFO0lBQ3ZDdEIsQ0FBQyxDQUFDeUUsV0FBVyxHQUFHLENBQUVqRSxJQUFJLENBQUNrRSxHQUFHLENBQUN2RSxLQUFLLENBQUN3RSxTQUFTLEVBQUVMLE9BQU8sQ0FBQyxFQUNsQzlELElBQUksQ0FBQ2tFLEdBQUcsQ0FBQ3ZFLEtBQUssQ0FBQ3dFLFNBQVMsRUFBRUgsT0FBTyxDQUFDLENBQUU7RUFDeEQsQ0FBQyxNQUFNO0lBQ0x4RSxDQUFDLENBQUN5RSxXQUFXLEdBQUcsQ0FBQ0gsT0FBTyxFQUFFRSxPQUFPLENBQUM7RUFDcEM7O0VBRUE7RUFDQSxJQUFJdkUsT0FBTyxDQUFDc0QsT0FBTyxFQUFFO0lBRW5CLElBQUlxQixhQUFhLEdBQUczRSxPQUFPLENBQUNJLFFBQVEsR0FBR0osT0FBTyxDQUFDVyxVQUFVOztJQUV6RDtJQUNBLEtBQUssSUFBSUssQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHakIsQ0FBQyxDQUFDNkMsS0FBSyxDQUFDQyxNQUFNLEVBQUU3QixDQUFDLEVBQUUsRUFBRTtNQUN2QyxJQUFJQyxJQUFJLEdBQUdsQixDQUFDLENBQUM2QyxLQUFLLENBQUM1QixDQUFDLENBQUM7TUFDckIsSUFBSXdDLFNBQVMsR0FBR3hELE9BQU8sQ0FBQ3VELElBQUksQ0FBQ3ZDLENBQUMsQ0FBQztNQUMvQixJQUFJNEQsWUFBWSxHQUFHRCxhQUFhLEdBQUduQixTQUFTLENBQUNRLGFBQWE7TUFFMUQsSUFBSWEsWUFBWSxHQUFHN0UsT0FBTyxDQUFDeUMsYUFBYSxHQUFHekMsT0FBTyxDQUFDeUMsYUFBYSxDQUFDekIsQ0FBQyxDQUFDLEdBQUcsSUFBSTs7TUFFMUU7TUFDQSxJQUFJOEQsUUFBUSxHQUFHdEIsU0FBUyxDQUFDTSxlQUFlLEdBQUdjLFlBQVk7TUFDdkQsSUFBSUMsWUFBWSxFQUFFO1FBQ2hCQyxRQUFRLEdBQUd2RSxJQUFJLENBQUN3RSxHQUFHLENBQUNELFFBQVEsRUFBRUQsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO01BQ2hEO01BQ0EsSUFBSUcsUUFBUSxHQUFHRixRQUFRLEdBQUd0QixTQUFTLENBQUNPLGNBQWM7TUFDbEQsSUFBSWMsWUFBWSxFQUFFO1FBQ2hCLElBQUlHLFFBQVEsR0FBR0gsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFO1VBQzlCO1VBQ0FDLFFBQVEsR0FBR0EsUUFBUSxJQUFJRSxRQUFRLEdBQUdILFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztVQUNsREcsUUFBUSxHQUFHRixRQUFRLEdBQUd0QixTQUFTLENBQUNPLGNBQWM7UUFDaEQ7TUFDRjtNQUNBLElBQUloRSxDQUFDLENBQUM2RCxXQUFXLENBQUNDLFVBQVUsQ0FBQyxVQUFVLEVBQUU3QyxDQUFDLENBQUMsRUFBRTtRQUMzQ0MsSUFBSSxDQUFDa0QsVUFBVSxHQUFHLENBQUU1RCxJQUFJLENBQUNrRSxHQUFHLENBQUN2RSxLQUFLLENBQUN3RSxTQUFTLEVBQUVNLFFBQVEsQ0FBQyxFQUNuQ3pFLElBQUksQ0FBQ2tFLEdBQUcsQ0FBQ3ZFLEtBQUssQ0FBQ3dFLFNBQVMsRUFBRUksUUFBUSxDQUFDLENBQUU7TUFDM0QsQ0FBQyxNQUFNO1FBQ0w3RCxJQUFJLENBQUNrRCxVQUFVLEdBQUcsQ0FBRWEsUUFBUSxFQUFFRixRQUFRLENBQUU7TUFDMUM7SUFDRjtFQUNGO0VBRUEvRSxDQUFDLENBQUNrRixVQUFVLENBQUMsS0FBSyxDQUFDO0FBQ3JCLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBckYsa0JBQWtCLENBQUNzRixNQUFNLEdBQUd0RixrQkFBa0IsQ0FBQ0Msd0JBQXdCOztBQUV2RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FELGtCQUFrQixDQUFDdUYsU0FBUyxHQUFHLFVBQVNyRixLQUFLLEVBQUVDLENBQUMsRUFBRUMsT0FBTyxFQUFFO0VBQ3pEQSxPQUFPLENBQUNvRixTQUFTLEdBQUcsSUFBSTtFQUN4QnBGLE9BQU8sQ0FBQ3FGLFNBQVMsR0FBRyxLQUFLO0FBQzNCLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBekYsa0JBQWtCLENBQUMwRixRQUFRLEdBQUcsVUFBU3hGLEtBQUssRUFBRUMsQ0FBQyxFQUFFQyxPQUFPLEVBQUU7RUFDeERBLE9BQU8sQ0FBQ3FGLFNBQVMsR0FBRyxJQUFJO0VBQ3hCckYsT0FBTyxDQUFDQyxRQUFRLEdBQUdDLEtBQUssQ0FBQ0MsU0FBUyxDQUFDTCxLQUFLLEVBQUVFLE9BQU8sQ0FBQztFQUNsREEsT0FBTyxDQUFDSSxRQUFRLEdBQUdGLEtBQUssQ0FBQ0csU0FBUyxDQUFDUCxLQUFLLEVBQUVFLE9BQU8sQ0FBQztFQUVsRCxJQUFJdUYsTUFBTSxHQUFHaEYsSUFBSSxDQUFDQyxHQUFHLENBQUNSLE9BQU8sQ0FBQ1MsVUFBVSxHQUFHVCxPQUFPLENBQUNDLFFBQVEsQ0FBQztFQUM1RCxJQUFJdUYsTUFBTSxHQUFHakYsSUFBSSxDQUFDQyxHQUFHLENBQUNSLE9BQU8sQ0FBQ1csVUFBVSxHQUFHWCxPQUFPLENBQUNJLFFBQVEsQ0FBQzs7RUFFNUQ7RUFDQUosT0FBTyxDQUFDeUYsYUFBYSxHQUFJRixNQUFNLEdBQUdDLE1BQU0sR0FBRyxDQUFDLEdBQUl0RixLQUFLLENBQUN3RixRQUFRLEdBQUd4RixLQUFLLENBQUN5RixVQUFVO0VBRWpGNUYsQ0FBQyxDQUFDNkYsYUFBYSxDQUNYNUYsT0FBTyxDQUFDeUYsYUFBYSxFQUNyQnpGLE9BQU8sQ0FBQ1MsVUFBVSxFQUNsQlQsT0FBTyxDQUFDQyxRQUFRLEVBQ2hCRCxPQUFPLENBQUNXLFVBQVUsRUFDbEJYLE9BQU8sQ0FBQ0ksUUFBUSxFQUNoQkosT0FBTyxDQUFDNkYsaUJBQWlCLEVBQ3pCN0YsT0FBTyxDQUFDOEYsUUFBUSxFQUNoQjlGLE9BQU8sQ0FBQytGLFFBQVEsQ0FBQztFQUVyQi9GLE9BQU8sQ0FBQzhGLFFBQVEsR0FBRzlGLE9BQU8sQ0FBQ0MsUUFBUTtFQUNuQ0QsT0FBTyxDQUFDK0YsUUFBUSxHQUFHL0YsT0FBTyxDQUFDSSxRQUFRO0VBQ25DSixPQUFPLENBQUM2RixpQkFBaUIsR0FBRzdGLE9BQU8sQ0FBQ3lGLGFBQWE7QUFDbkQsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTdGLGtCQUFrQixDQUFDa0IsbUJBQW1CLEdBQUcsVUFBU2YsQ0FBQyxFQUFFRCxLQUFLLEVBQUVFLE9BQU8sRUFBRTtFQUNuRSxJQUFJZ0csYUFBYSxHQUFHakcsQ0FBQyxDQUFDa0csaUJBQWlCLENBQUMsZUFBZSxDQUFDO0VBQ3hELElBQUlDLGtCQUFrQixHQUFHbkcsQ0FBQyxDQUFDa0csaUJBQWlCLENBQUMsb0JBQW9CLENBQUM7RUFFbEUsSUFBSUUsYUFBYSxHQUFHLElBQUk7O0VBRXhCO0VBQ0EsSUFBSUMsVUFBVSxHQUFHLENBQUMsQ0FBQztFQUNuQixJQUFJQyxlQUFlLEdBQUdDLE1BQU0sQ0FBQ0MsU0FBUzs7RUFFdEM7RUFDQSxLQUFLLElBQUl2RixDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdqQixDQUFDLENBQUN5RyxVQUFVLENBQUMzRCxNQUFNLEVBQUU3QixDQUFDLEVBQUUsRUFBRTtJQUM1QyxJQUFJeUYsQ0FBQyxHQUFHMUcsQ0FBQyxDQUFDeUcsVUFBVSxDQUFDeEYsQ0FBQyxDQUFDO0lBQ3ZCLElBQUkwRixRQUFRLEdBQUduRyxJQUFJLENBQUNrRSxHQUFHLENBQUNnQyxDQUFDLENBQUNFLE9BQU8sR0FBRzNHLE9BQU8sQ0FBQ0MsUUFBUSxFQUFFLENBQUMsQ0FBQyxHQUN6Q00sSUFBSSxDQUFDa0UsR0FBRyxDQUFDZ0MsQ0FBQyxDQUFDRyxPQUFPLEdBQUc1RyxPQUFPLENBQUNJLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDeEQsSUFBSSxDQUFDeUcsS0FBSyxDQUFDSCxRQUFRLENBQUMsS0FDZk4sVUFBVSxJQUFJLENBQUMsQ0FBQyxJQUFJTSxRQUFRLEdBQUdMLGVBQWUsQ0FBQyxFQUFFO01BQ3BEQSxlQUFlLEdBQUdLLFFBQVE7TUFDMUJOLFVBQVUsR0FBR3BGLENBQUM7SUFDaEI7RUFDRjs7RUFFQTtFQUNBLElBQUk4RixNQUFNLEdBQUcvRyxDQUFDLENBQUM4QixnQkFBZ0IsQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUM7RUFDMUQsSUFBSXdFLGVBQWUsSUFBSVMsTUFBTSxHQUFHQSxNQUFNLEVBQUU7SUFDdENYLGFBQWEsR0FBR3BHLENBQUMsQ0FBQ3lHLFVBQVUsQ0FBQ0osVUFBVSxDQUFDO0VBQzFDO0VBRUEsSUFBSUQsYUFBYSxFQUFFO0lBQ2pCLElBQUlZLENBQUMsR0FBRztNQUNOQyxVQUFVLEVBQUUsSUFBSTtNQUNoQkMsS0FBSyxFQUFFZCxhQUFhO01BQ3BCUSxPQUFPLEVBQUUzRyxPQUFPLENBQUNDLFFBQVE7TUFDekIyRyxPQUFPLEVBQUU1RyxPQUFPLENBQUNJO0lBQ25CLENBQUM7SUFDRCxJQUFJOEcsZ0JBQWdCLEdBQUduSCxDQUFDLENBQUNvSCxjQUFjLENBQUMsWUFBWSxFQUFFSixDQUFDLENBQUM7SUFDeEQsSUFBSUcsZ0JBQWdCLEVBQUU7TUFDcEI7TUFDQTtJQUNGO0lBQ0EsSUFBSWhCLGtCQUFrQixFQUFFO01BQ3RCQSxrQkFBa0IsQ0FBQ2tCLElBQUksQ0FBQ3JILENBQUMsRUFBRUQsS0FBSyxFQUFFcUcsYUFBYSxDQUFDO0lBQ2xEO0VBQ0Y7RUFFQSxJQUFJWSxDQUFDLEdBQUc7SUFDTkMsVUFBVSxFQUFFLElBQUk7SUFDaEJLLElBQUksRUFBRXRILENBQUMsQ0FBQ2EsTUFBTTtJQUFHO0lBQ2pCMEcsR0FBRyxFQUFFdkgsQ0FBQyxDQUFDeUcsVUFBVTtJQUNqQkcsT0FBTyxFQUFFM0csT0FBTyxDQUFDQyxRQUFRO0lBQ3pCMkcsT0FBTyxFQUFFNUcsT0FBTyxDQUFDSTtFQUNuQixDQUFDO0VBQ0QsSUFBSSxDQUFDTCxDQUFDLENBQUNvSCxjQUFjLENBQUMsT0FBTyxFQUFFSixDQUFDLENBQUMsRUFBRTtJQUNqQyxJQUFJZixhQUFhLEVBQUU7TUFDakI7TUFDQUEsYUFBYSxDQUFDb0IsSUFBSSxDQUFDckgsQ0FBQyxFQUFFRCxLQUFLLEVBQUVDLENBQUMsQ0FBQ2EsTUFBTSxFQUFFYixDQUFDLENBQUN5RyxVQUFVLENBQUM7SUFDdEQ7RUFDRjtBQUNGLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E1RyxrQkFBa0IsQ0FBQzJILE9BQU8sR0FBRyxVQUFTekgsS0FBSyxFQUFFQyxDQUFDLEVBQUVDLE9BQU8sRUFBRTtFQUN2REQsQ0FBQyxDQUFDeUgsY0FBYyxFQUFFO0VBQ2xCeEgsT0FBTyxDQUFDb0YsU0FBUyxHQUFHLEtBQUs7RUFDekJ4RixrQkFBa0IsQ0FBQ0Msd0JBQXdCLENBQUNDLEtBQUssRUFBRUMsQ0FBQyxFQUFFQyxPQUFPLENBQUM7O0VBRTlEO0VBQ0E7RUFDQTtFQUNBLElBQUl5SCxRQUFRLEdBQUcxSCxDQUFDLENBQUMySCxPQUFPLEVBQUU7RUFDMUIsSUFBSTFILE9BQU8sQ0FBQ00sV0FBVyxJQUFJLEVBQUUsSUFDekJOLE9BQU8sQ0FBQ3lGLGFBQWEsSUFBSXZGLEtBQUssQ0FBQ3lGLFVBQVUsRUFBRTtJQUM3QyxJQUFJZ0MsSUFBSSxHQUFHcEgsSUFBSSxDQUFDd0UsR0FBRyxDQUFDL0UsT0FBTyxDQUFDUyxVQUFVLEVBQUVULE9BQU8sQ0FBQ0MsUUFBUSxDQUFDO01BQ3JEMkgsS0FBSyxHQUFHckgsSUFBSSxDQUFDK0QsR0FBRyxDQUFDdEUsT0FBTyxDQUFDUyxVQUFVLEVBQUVULE9BQU8sQ0FBQ0MsUUFBUSxDQUFDO0lBQzFEMEgsSUFBSSxHQUFHcEgsSUFBSSxDQUFDK0QsR0FBRyxDQUFDcUQsSUFBSSxFQUFFRixRQUFRLENBQUNJLENBQUMsQ0FBQztJQUNqQ0QsS0FBSyxHQUFHckgsSUFBSSxDQUFDd0UsR0FBRyxDQUFDNkMsS0FBSyxFQUFFSCxRQUFRLENBQUNJLENBQUMsR0FBR0osUUFBUSxDQUFDN0YsQ0FBQyxDQUFDO0lBQ2hELElBQUkrRixJQUFJLEdBQUdDLEtBQUssRUFBRTtNQUNoQjdILENBQUMsQ0FBQytILFFBQVEsQ0FBQ0gsSUFBSSxFQUFFQyxLQUFLLENBQUM7SUFDekI7SUFDQTVILE9BQU8sQ0FBQytILGtCQUFrQixHQUFHLElBQUk7RUFDbkMsQ0FBQyxNQUFNLElBQUkvSCxPQUFPLENBQUNVLFlBQVksSUFBSSxFQUFFLElBQzFCVixPQUFPLENBQUN5RixhQUFhLElBQUl2RixLQUFLLENBQUN3RixRQUFRLEVBQUU7SUFDbEQsSUFBSXNDLEdBQUcsR0FBR3pILElBQUksQ0FBQ3dFLEdBQUcsQ0FBQy9FLE9BQU8sQ0FBQ1csVUFBVSxFQUFFWCxPQUFPLENBQUNJLFFBQVEsQ0FBQztNQUNwRDZILE1BQU0sR0FBRzFILElBQUksQ0FBQytELEdBQUcsQ0FBQ3RFLE9BQU8sQ0FBQ1csVUFBVSxFQUFFWCxPQUFPLENBQUNJLFFBQVEsQ0FBQztJQUMzRDRILEdBQUcsR0FBR3pILElBQUksQ0FBQytELEdBQUcsQ0FBQzBELEdBQUcsRUFBRVAsUUFBUSxDQUFDUyxDQUFDLENBQUM7SUFDL0JELE1BQU0sR0FBRzFILElBQUksQ0FBQ3dFLEdBQUcsQ0FBQ2tELE1BQU0sRUFBRVIsUUFBUSxDQUFDUyxDQUFDLEdBQUdULFFBQVEsQ0FBQ3hELENBQUMsQ0FBQztJQUNsRCxJQUFJK0QsR0FBRyxHQUFHQyxNQUFNLEVBQUU7TUFDaEJsSSxDQUFDLENBQUNvSSxRQUFRLENBQUNILEdBQUcsRUFBRUMsTUFBTSxDQUFDO0lBQ3pCO0lBQ0FqSSxPQUFPLENBQUMrSCxrQkFBa0IsR0FBRyxJQUFJO0VBQ25DO0VBQ0EvSCxPQUFPLENBQUNTLFVBQVUsR0FBRyxJQUFJO0VBQ3pCVCxPQUFPLENBQUNXLFVBQVUsR0FBRyxJQUFJO0FBQzNCLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0FmLGtCQUFrQixDQUFDd0ksVUFBVSxHQUFHLFVBQVN0SSxLQUFLLEVBQUVDLENBQUMsRUFBRUMsT0FBTyxFQUFFO0VBQzFERixLQUFLLENBQUN1SSxjQUFjLEVBQUUsQ0FBQyxDQUFFO0VBQ3pCLElBQUl2SSxLQUFLLENBQUN3SSxPQUFPLENBQUN6RixNQUFNLEdBQUcsQ0FBQyxFQUFFO0lBQzVCO0lBQ0E3QyxPQUFPLENBQUN1SSx1QkFBdUIsR0FBRyxJQUFJO0VBQ3hDO0VBRUEsSUFBSUQsT0FBTyxHQUFHLEVBQUU7RUFDaEIsS0FBSyxJQUFJdEgsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHbEIsS0FBSyxDQUFDd0ksT0FBTyxDQUFDekYsTUFBTSxFQUFFN0IsQ0FBQyxFQUFFLEVBQUU7SUFDN0MsSUFBSXdILENBQUMsR0FBRzFJLEtBQUssQ0FBQ3dJLE9BQU8sQ0FBQ3RILENBQUMsQ0FBQztJQUN4QixJQUFJeUgsSUFBSSxHQUFHRCxDQUFDLENBQUNFLE1BQU0sQ0FBQ0MscUJBQXFCLEVBQUU7SUFDM0M7SUFDQUwsT0FBTyxDQUFDcEUsSUFBSSxDQUFDO01BQ1gwRSxLQUFLLEVBQUVKLENBQUMsQ0FBQ0ksS0FBSztNQUNkQyxLQUFLLEVBQUVMLENBQUMsQ0FBQ0ssS0FBSztNQUNkQyxLQUFLLEVBQUUvSSxDQUFDLENBQUN1QyxZQUFZLENBQUNrRyxDQUFDLENBQUNPLE9BQU8sR0FBR04sSUFBSSxDQUFDZCxJQUFJLENBQUM7TUFDNUNxQixLQUFLLEVBQUVqSixDQUFDLENBQUNxRCxZQUFZLENBQUNvRixDQUFDLENBQUNTLE9BQU8sR0FBR1IsSUFBSSxDQUFDVCxHQUFHO01BQzFDO0lBQ0YsQ0FBQyxDQUFDO0VBQ0o7O0VBQ0FoSSxPQUFPLENBQUNrSixjQUFjLEdBQUdaLE9BQU87RUFFaEMsSUFBSUEsT0FBTyxDQUFDekYsTUFBTSxJQUFJLENBQUMsRUFBRTtJQUN2QjtJQUNBN0MsT0FBTyxDQUFDbUosa0JBQWtCLEdBQUdiLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDdkN0SSxPQUFPLENBQUNvSixlQUFlLEdBQUc7TUFBRXZCLENBQUMsRUFBRSxJQUFJO01BQUVLLENBQUMsRUFBRTtJQUFLLENBQUM7RUFDaEQsQ0FBQyxNQUFNLElBQUlJLE9BQU8sQ0FBQ3pGLE1BQU0sSUFBSSxDQUFDLEVBQUU7SUFDOUI7SUFDQTs7SUFFQTtJQUNBN0MsT0FBTyxDQUFDbUosa0JBQWtCLEdBQUc7TUFDM0JQLEtBQUssRUFBRSxHQUFHLElBQUlOLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQ00sS0FBSyxHQUFHTixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUNNLEtBQUssQ0FBQztNQUNsREMsS0FBSyxFQUFFLEdBQUcsSUFBSVAsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDTyxLQUFLLEdBQUdQLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQ08sS0FBSyxDQUFDO01BRWxEO01BQ0FDLEtBQUssRUFBRSxHQUFHLElBQUlSLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQ1EsS0FBSyxHQUFHUixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUNRLEtBQUssQ0FBQztNQUNsREUsS0FBSyxFQUFFLEdBQUcsSUFBSVYsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDVSxLQUFLLEdBQUdWLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQ1UsS0FBSztJQUNuRCxDQUFDOztJQUVEO0lBQ0EsSUFBSUssWUFBWSxHQUFHLEdBQUcsR0FBRzlJLElBQUksQ0FBQytJLEVBQUUsR0FBRy9JLElBQUksQ0FBQ2dKLEtBQUssQ0FDekN2SixPQUFPLENBQUNtSixrQkFBa0IsQ0FBQ04sS0FBSyxHQUFHUCxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUNPLEtBQUssRUFDbkRQLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQ00sS0FBSyxHQUFHNUksT0FBTyxDQUFDbUosa0JBQWtCLENBQUNQLEtBQUssQ0FBQzs7SUFFeEQ7SUFDQVMsWUFBWSxHQUFHOUksSUFBSSxDQUFDQyxHQUFHLENBQUM2SSxZQUFZLENBQUM7SUFDckMsSUFBSUEsWUFBWSxHQUFHLEVBQUUsRUFBRUEsWUFBWSxHQUFHLEVBQUUsR0FBR0EsWUFBWTtJQUV2RHJKLE9BQU8sQ0FBQ29KLGVBQWUsR0FBRztNQUN4QnZCLENBQUMsRUFBR3dCLFlBQVksR0FBSSxFQUFFLEdBQUcsRUFBRSxHQUFDLENBQUc7TUFDL0JuQixDQUFDLEVBQUdtQixZQUFZLEdBQUcsRUFBRSxHQUFDO0lBQ3hCLENBQUM7RUFDSDs7RUFFQTtFQUNBckosT0FBTyxDQUFDd0osWUFBWSxHQUFHO0lBQ3JCM0IsQ0FBQyxFQUFFOUgsQ0FBQyxDQUFDcUIsVUFBVSxFQUFFO0lBQ2pCOEcsQ0FBQyxFQUFFbkksQ0FBQyxDQUFDMkQsVUFBVTtFQUNqQixDQUFDO0FBQ0gsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTlELGtCQUFrQixDQUFDNkosU0FBUyxHQUFHLFVBQVMzSixLQUFLLEVBQUVDLENBQUMsRUFBRUMsT0FBTyxFQUFFO0VBQ3pEO0VBQ0FBLE9BQU8sQ0FBQ3VJLHVCQUF1QixHQUFHLElBQUk7RUFFdEMsSUFBSXZILENBQUM7SUFBRXNILE9BQU8sR0FBRyxFQUFFO0VBQ25CLEtBQUt0SCxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdsQixLQUFLLENBQUN3SSxPQUFPLENBQUN6RixNQUFNLEVBQUU3QixDQUFDLEVBQUUsRUFBRTtJQUN6QyxJQUFJd0gsQ0FBQyxHQUFHMUksS0FBSyxDQUFDd0ksT0FBTyxDQUFDdEgsQ0FBQyxDQUFDO0lBQ3hCc0gsT0FBTyxDQUFDcEUsSUFBSSxDQUFDO01BQ1gwRSxLQUFLLEVBQUVKLENBQUMsQ0FBQ0ksS0FBSztNQUNkQyxLQUFLLEVBQUVMLENBQUMsQ0FBQ0s7SUFDWCxDQUFDLENBQUM7RUFDSjtFQUNBLElBQUlLLGNBQWMsR0FBR2xKLE9BQU8sQ0FBQ2tKLGNBQWM7RUFFM0MsSUFBSVEsS0FBSzs7RUFFVDtFQUNBLElBQUlDLE1BQU0sR0FBRzNKLE9BQU8sQ0FBQ21KLGtCQUFrQjtFQUN2QyxJQUFJYixPQUFPLENBQUN6RixNQUFNLElBQUksQ0FBQyxFQUFFO0lBQ3ZCNkcsS0FBSyxHQUFHcEIsT0FBTyxDQUFDLENBQUMsQ0FBQztFQUNwQixDQUFDLE1BQU07SUFDTG9CLEtBQUssR0FBRztNQUNOZCxLQUFLLEVBQUUsR0FBRyxJQUFJTixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUNNLEtBQUssR0FBR04sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDTSxLQUFLLENBQUM7TUFDbERDLEtBQUssRUFBRSxHQUFHLElBQUlQLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQ08sS0FBSyxHQUFHUCxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUNPLEtBQUs7SUFDbkQsQ0FBQztFQUNIOztFQUVBO0VBQ0E7RUFDQSxJQUFJZSxLQUFLLEdBQUc7SUFDVmhCLEtBQUssRUFBRWMsS0FBSyxDQUFDZCxLQUFLLEdBQUdlLE1BQU0sQ0FBQ2YsS0FBSztJQUNqQ0MsS0FBSyxFQUFFYSxLQUFLLENBQUNiLEtBQUssR0FBR2MsTUFBTSxDQUFDZDtFQUM5QixDQUFDO0VBQ0QsSUFBSWdCLFNBQVMsR0FBRzdKLE9BQU8sQ0FBQ3dKLFlBQVksQ0FBQzNCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRzdILE9BQU8sQ0FBQ3dKLFlBQVksQ0FBQzNCLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDckUsSUFBSWlDLFVBQVUsR0FBRzlKLE9BQU8sQ0FBQ3dKLFlBQVksQ0FBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBR2xJLE9BQU8sQ0FBQ3dKLFlBQVksQ0FBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDdEUwQixLQUFLLENBQUNkLEtBQUssR0FBSWMsS0FBSyxDQUFDaEIsS0FBSyxHQUFHN0ksQ0FBQyxDQUFDMkIsUUFBUSxDQUFDQyxJQUFJLENBQUNDLENBQUMsR0FBSWlJLFNBQVM7RUFDM0RELEtBQUssQ0FBQ1osS0FBSyxHQUFJWSxLQUFLLENBQUNmLEtBQUssR0FBRzlJLENBQUMsQ0FBQzJCLFFBQVEsQ0FBQ0MsSUFBSSxDQUFDc0MsQ0FBQyxHQUFJNkYsVUFBVTtFQUM1RCxJQUFJQyxNQUFNLEVBQUVDLE1BQU07O0VBRWxCO0VBQ0E7RUFDQSxJQUFJMUIsT0FBTyxDQUFDekYsTUFBTSxJQUFJLENBQUMsRUFBRTtJQUN2QmtILE1BQU0sR0FBRyxHQUFHO0lBQ1pDLE1BQU0sR0FBRyxHQUFHO0VBQ2QsQ0FBQyxNQUFNLElBQUkxQixPQUFPLENBQUN6RixNQUFNLElBQUksQ0FBQyxFQUFFO0lBQzlCLElBQUlvSCxhQUFhLEdBQUlmLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQ04sS0FBSyxHQUFHZSxNQUFNLENBQUNmLEtBQU07SUFDNURtQixNQUFNLEdBQUcsQ0FBQ3pCLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQ00sS0FBSyxHQUFHYyxLQUFLLENBQUNkLEtBQUssSUFBSXFCLGFBQWE7SUFFekQsSUFBSUMsY0FBYyxHQUFJaEIsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDTCxLQUFLLEdBQUdjLE1BQU0sQ0FBQ2QsS0FBTTtJQUM3RG1CLE1BQU0sR0FBRyxDQUFDMUIsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDTyxLQUFLLEdBQUdhLEtBQUssQ0FBQ2IsS0FBSyxJQUFJcUIsY0FBYztFQUM1RDs7RUFFQTtFQUNBSCxNQUFNLEdBQUd4SixJQUFJLENBQUN3RSxHQUFHLENBQUMsQ0FBQyxFQUFFeEUsSUFBSSxDQUFDK0QsR0FBRyxDQUFDLEtBQUssRUFBRXlGLE1BQU0sQ0FBQyxDQUFDO0VBQzdDQyxNQUFNLEdBQUd6SixJQUFJLENBQUN3RSxHQUFHLENBQUMsQ0FBQyxFQUFFeEUsSUFBSSxDQUFDK0QsR0FBRyxDQUFDLEtBQUssRUFBRTBGLE1BQU0sQ0FBQyxDQUFDO0VBRTdDLElBQUlHLE9BQU8sR0FBRyxLQUFLO0VBQ25CLElBQUluSyxPQUFPLENBQUNvSixlQUFlLENBQUN2QixDQUFDLEVBQUU7SUFDN0IsSUFBSXVDLE9BQU8sR0FBR1QsTUFBTSxDQUFDYixLQUFLLEdBQUdjLEtBQUssQ0FBQ2QsS0FBSyxHQUFHaUIsTUFBTTtJQUNqRGhLLENBQUMsQ0FBQ3lFLFdBQVcsR0FBRyxDQUNkNEYsT0FBTyxHQUFHLENBQUNwSyxPQUFPLENBQUN3SixZQUFZLENBQUMzQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUc4QixNQUFNLENBQUNiLEtBQUssSUFBSWlCLE1BQU0sRUFDN0RLLE9BQU8sR0FBRyxDQUFDcEssT0FBTyxDQUFDd0osWUFBWSxDQUFDM0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHOEIsTUFBTSxDQUFDYixLQUFLLElBQUlpQixNQUFNLENBQzlEO0lBQ0RJLE9BQU8sR0FBRyxJQUFJO0VBQ2hCO0VBRUEsSUFBSW5LLE9BQU8sQ0FBQ29KLGVBQWUsQ0FBQ2xCLENBQUMsRUFBRTtJQUM3QixLQUFLbEgsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLENBQUMsQ0FBRSxvQkFBb0JBLENBQUMsRUFBRSxFQUFFO01BQzFDLElBQUlDLElBQUksR0FBR2xCLENBQUMsQ0FBQzZDLEtBQUssQ0FBQzVCLENBQUMsQ0FBQztNQUNyQixJQUFJMkMsUUFBUSxHQUFHNUQsQ0FBQyxDQUFDNkQsV0FBVyxDQUFDQyxVQUFVLENBQUMsVUFBVSxFQUFFN0MsQ0FBQyxDQUFDO01BQ3RELElBQUkyQyxRQUFRLEVBQUU7UUFDWjtNQUFBLENBQ0QsTUFBTTtRQUNMLElBQUl5RyxPQUFPLEdBQUdULE1BQU0sQ0FBQ1gsS0FBSyxHQUFHWSxLQUFLLENBQUNaLEtBQUssR0FBR2dCLE1BQU07UUFDakQvSSxJQUFJLENBQUNrRCxVQUFVLEdBQUcsQ0FDaEJpRyxPQUFPLEdBQUcsQ0FBQ3BLLE9BQU8sQ0FBQ3dKLFlBQVksQ0FBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBR3lCLE1BQU0sQ0FBQ1gsS0FBSyxJQUFJZ0IsTUFBTSxFQUM3REksT0FBTyxHQUFHLENBQUNwSyxPQUFPLENBQUN3SixZQUFZLENBQUN0QixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUd5QixNQUFNLENBQUNYLEtBQUssSUFBSWdCLE1BQU0sQ0FDOUQ7UUFDREcsT0FBTyxHQUFHLElBQUk7TUFDaEI7SUFDRjtFQUNGO0VBRUFwSyxDQUFDLENBQUNrRixVQUFVLENBQUMsS0FBSyxDQUFDOztFQUVuQjtFQUNBLElBQUlrRixPQUFPLElBQUk3QixPQUFPLENBQUN6RixNQUFNLEdBQUcsQ0FBQyxJQUFJOUMsQ0FBQyxDQUFDa0csaUJBQWlCLENBQUMsY0FBYyxDQUFDLEVBQUU7SUFDeEUsSUFBSW9FLFVBQVUsR0FBR3RLLENBQUMsQ0FBQ3FCLFVBQVUsRUFBRTtJQUMvQnJCLENBQUMsQ0FBQ2tHLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxDQUFDbUIsSUFBSSxDQUFDckgsQ0FBQyxFQUFFc0ssVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFQSxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUV0SyxDQUFDLENBQUN1SyxXQUFXLEVBQUUsQ0FBQztFQUM1RjtBQUNGLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0ExSyxrQkFBa0IsQ0FBQzJLLFFBQVEsR0FBRyxVQUFTekssS0FBSyxFQUFFQyxDQUFDLEVBQUVDLE9BQU8sRUFBRTtFQUN4RCxJQUFJRixLQUFLLENBQUN3SSxPQUFPLENBQUN6RixNQUFNLEtBQUssQ0FBQyxFQUFFO0lBQzlCO0lBQ0FqRCxrQkFBa0IsQ0FBQ3dJLFVBQVUsQ0FBQ3RJLEtBQUssRUFBRUMsQ0FBQyxFQUFFQyxPQUFPLENBQUM7RUFDbEQsQ0FBQyxNQUFNLElBQUlGLEtBQUssQ0FBQzBLLGNBQWMsQ0FBQzNILE1BQU0sSUFBSSxDQUFDLEVBQUU7SUFDM0M7SUFDQTtJQUNBO0lBQ0EsSUFBSTRILEdBQUcsR0FBRyxJQUFJQyxJQUFJLEVBQUUsQ0FBQ0MsT0FBTyxFQUFFO0lBQzlCLElBQUluQyxDQUFDLEdBQUcxSSxLQUFLLENBQUMwSyxjQUFjLENBQUMsQ0FBQyxDQUFDO0lBQy9CLElBQUl4SyxPQUFPLENBQUN1SSx1QkFBdUIsSUFDL0JrQyxHQUFHLEdBQUd6SyxPQUFPLENBQUN1SSx1QkFBdUIsR0FBRyxHQUFHLElBQzNDdkksT0FBTyxDQUFDNEssVUFBVSxJQUFJckssSUFBSSxDQUFDQyxHQUFHLENBQUNSLE9BQU8sQ0FBQzRLLFVBQVUsR0FBR3BDLENBQUMsQ0FBQ3FDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsSUFDbkU3SyxPQUFPLENBQUM4SyxVQUFVLElBQUl2SyxJQUFJLENBQUNDLEdBQUcsQ0FBQ1IsT0FBTyxDQUFDOEssVUFBVSxHQUFHdEMsQ0FBQyxDQUFDdUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFO01BQ3ZFaEwsQ0FBQyxDQUFDaUwsU0FBUyxFQUFFO0lBQ2YsQ0FBQyxNQUFNO01BQ0xoTCxPQUFPLENBQUN1SSx1QkFBdUIsR0FBR2tDLEdBQUc7TUFDckN6SyxPQUFPLENBQUM0SyxVQUFVLEdBQUdwQyxDQUFDLENBQUNxQyxPQUFPO01BQzlCN0ssT0FBTyxDQUFDOEssVUFBVSxHQUFHdEMsQ0FBQyxDQUFDdUMsT0FBTztJQUNoQztFQUNGO0FBQ0YsQ0FBQzs7QUFFRDtBQUNBLElBQUlFLG9CQUFvQixHQUFHLFNBQXZCQSxvQkFBb0IsQ0FBWXBELENBQUMsRUFBRUYsSUFBSSxFQUFFQyxLQUFLLEVBQUU7RUFDbEQsSUFBSUMsQ0FBQyxHQUFHRixJQUFJLEVBQUU7SUFDWixPQUFPQSxJQUFJLEdBQUdFLENBQUM7RUFDakIsQ0FBQyxNQUFNLElBQUlBLENBQUMsR0FBR0QsS0FBSyxFQUFFO0lBQ3BCLE9BQU9DLENBQUMsR0FBR0QsS0FBSztFQUNsQixDQUFDLE1BQU07SUFDTCxPQUFPLENBQUM7RUFDVjtBQUNGLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJc0QsaUJBQWlCLEdBQUcsU0FBcEJBLGlCQUFpQixDQUFZcEwsS0FBSyxFQUFFQyxDQUFDLEVBQUU7RUFDekMsSUFBSW9MLFFBQVEsR0FBR2pMLEtBQUssQ0FBQ2tMLE9BQU8sQ0FBQ3JMLENBQUMsQ0FBQ3NMLE9BQU8sQ0FBQztFQUN2QyxJQUFJQyxHQUFHLEdBQUc7SUFDUjNELElBQUksRUFBRXdELFFBQVEsQ0FBQ3RELENBQUM7SUFDaEJELEtBQUssRUFBRXVELFFBQVEsQ0FBQ3RELENBQUMsR0FBRzlILENBQUMsQ0FBQ3NMLE9BQU8sQ0FBQ0UsV0FBVztJQUN6Q3ZELEdBQUcsRUFBRW1ELFFBQVEsQ0FBQ2pELENBQUM7SUFDZkQsTUFBTSxFQUFFa0QsUUFBUSxDQUFDakQsQ0FBQyxHQUFHbkksQ0FBQyxDQUFDc0wsT0FBTyxDQUFDRztFQUNqQyxDQUFDO0VBRUQsSUFBSUMsRUFBRSxHQUFHO0lBQ1A1RCxDQUFDLEVBQUUzSCxLQUFLLENBQUMwSSxLQUFLLENBQUM5SSxLQUFLLENBQUM7SUFDckJvSSxDQUFDLEVBQUVoSSxLQUFLLENBQUMySSxLQUFLLENBQUMvSSxLQUFLO0VBQ3RCLENBQUM7RUFFRCxJQUFJNEwsRUFBRSxHQUFHVCxvQkFBb0IsQ0FBQ1EsRUFBRSxDQUFDNUQsQ0FBQyxFQUFFeUQsR0FBRyxDQUFDM0QsSUFBSSxFQUFFMkQsR0FBRyxDQUFDMUQsS0FBSyxDQUFDO0lBQ3BEK0QsRUFBRSxHQUFHVixvQkFBb0IsQ0FBQ1EsRUFBRSxDQUFDdkQsQ0FBQyxFQUFFb0QsR0FBRyxDQUFDdEQsR0FBRyxFQUFFc0QsR0FBRyxDQUFDckQsTUFBTSxDQUFDO0VBQ3hELE9BQU8xSCxJQUFJLENBQUMrRCxHQUFHLENBQUNvSCxFQUFFLEVBQUVDLEVBQUUsQ0FBQztBQUN6QixDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBL0wsa0JBQWtCLENBQUNnTSxZQUFZLEdBQUc7RUFDaEM7RUFDQUMsU0FBUyxFQUFFLG1CQUFTL0wsS0FBSyxFQUFFQyxDQUFDLEVBQUVDLE9BQU8sRUFBRTtJQUNyQztJQUNBLElBQUlGLEtBQUssQ0FBQ2dNLE1BQU0sSUFBSWhNLEtBQUssQ0FBQ2dNLE1BQU0sSUFBSSxDQUFDLEVBQUU7SUFFdkM5TCxPQUFPLENBQUMrTCxtQkFBbUIsQ0FBQ2pNLEtBQUssRUFBRUMsQ0FBQyxFQUFFQyxPQUFPLENBQUM7SUFFOUMsSUFBSUYsS0FBSyxDQUFDa00sTUFBTSxJQUFJbE0sS0FBSyxDQUFDbU0sUUFBUSxFQUFFO01BQ2xDck0sa0JBQWtCLENBQUNtQixRQUFRLENBQUNqQixLQUFLLEVBQUVDLENBQUMsRUFBRUMsT0FBTyxDQUFDO0lBQ2hELENBQUMsTUFBTTtNQUNMSixrQkFBa0IsQ0FBQ3VGLFNBQVMsQ0FBQ3JGLEtBQUssRUFBRUMsQ0FBQyxFQUFFQyxPQUFPLENBQUM7SUFDakQ7O0lBRUE7SUFDQTtJQUNBO0lBQ0EsSUFBSWtNLFNBQVMsR0FBRyxTQUFaQSxTQUFTLENBQVlwTSxLQUFLLEVBQUU7TUFDOUIsSUFBSUUsT0FBTyxDQUFDb0YsU0FBUyxFQUFFO1FBQ3JCO1FBQ0EsSUFBSStHLENBQUMsR0FBR2pCLGlCQUFpQixDQUFDcEwsS0FBSyxFQUFFQyxDQUFDLENBQUM7UUFDbkMsSUFBSW9NLENBQUMsR0FBR3hNLGdCQUFnQixFQUFFO1VBQ3hCQyxrQkFBa0IsQ0FBQzBGLFFBQVEsQ0FBQ3hGLEtBQUssRUFBRUMsQ0FBQyxFQUFFQyxPQUFPLENBQUM7UUFDaEQsQ0FBQyxNQUFNO1VBQ0wsSUFBSUEsT0FBTyxDQUFDQyxRQUFRLEtBQUssSUFBSSxFQUFFO1lBQzdCRCxPQUFPLENBQUNDLFFBQVEsR0FBRyxJQUFJO1lBQ3ZCRCxPQUFPLENBQUNJLFFBQVEsR0FBRyxJQUFJO1lBQ3ZCTCxDQUFDLENBQUN5SCxjQUFjLEVBQUU7VUFDcEI7UUFDRjtNQUNGLENBQUMsTUFBTSxJQUFJeEgsT0FBTyxDQUFDa0IsU0FBUyxFQUFFO1FBQzVCdEIsa0JBQWtCLENBQUN3RSxPQUFPLENBQUN0RSxLQUFLLEVBQUVDLENBQUMsRUFBRUMsT0FBTyxDQUFDO01BQy9DO0lBQ0YsQ0FBQztJQUNELElBQUlvTSxPQUFPLEdBQUcsU0FBVkEsT0FBTyxDQUFZdE0sS0FBSyxFQUFFO01BQzVCLElBQUlFLE9BQU8sQ0FBQ29GLFNBQVMsRUFBRTtRQUNyQixJQUFJcEYsT0FBTyxDQUFDQyxRQUFRLEtBQUssSUFBSSxFQUFFO1VBQzdCTCxrQkFBa0IsQ0FBQzJILE9BQU8sQ0FBQ3pILEtBQUssRUFBRUMsQ0FBQyxFQUFFQyxPQUFPLENBQUM7UUFDL0MsQ0FBQyxNQUFNO1VBQ0xKLGtCQUFrQixDQUFDQyx3QkFBd0IsQ0FBQ0MsS0FBSyxFQUFFQyxDQUFDLEVBQUVDLE9BQU8sQ0FBQztRQUNoRTtNQUNGLENBQUMsTUFBTSxJQUFJQSxPQUFPLENBQUNrQixTQUFTLEVBQUU7UUFDNUJ0QixrQkFBa0IsQ0FBQ3NGLE1BQU0sQ0FBQ3BGLEtBQUssRUFBRUMsQ0FBQyxFQUFFQyxPQUFPLENBQUM7TUFDOUM7TUFFQUUsS0FBSyxDQUFDbU0sV0FBVyxDQUFDQyxRQUFRLEVBQUUsV0FBVyxFQUFFSixTQUFTLENBQUM7TUFDbkRoTSxLQUFLLENBQUNtTSxXQUFXLENBQUNDLFFBQVEsRUFBRSxTQUFTLEVBQUVGLE9BQU8sQ0FBQztNQUMvQ3BNLE9BQU8sQ0FBQ3VNLE9BQU8sRUFBRTtJQUNuQixDQUFDO0lBRUR4TSxDQUFDLENBQUN5TSxnQkFBZ0IsQ0FBQ0YsUUFBUSxFQUFFLFdBQVcsRUFBRUosU0FBUyxDQUFDO0lBQ3BEbk0sQ0FBQyxDQUFDeU0sZ0JBQWdCLENBQUNGLFFBQVEsRUFBRSxTQUFTLEVBQUVGLE9BQU8sQ0FBQztFQUNsRCxDQUFDO0VBQ0RLLHdCQUF3QixFQUFFLElBQUk7RUFFOUJDLFVBQVUsRUFBRSxvQkFBUzVNLEtBQUssRUFBRUMsQ0FBQyxFQUFFQyxPQUFPLEVBQUU7SUFDdENKLGtCQUFrQixDQUFDd0ksVUFBVSxDQUFDdEksS0FBSyxFQUFFQyxDQUFDLEVBQUVDLE9BQU8sQ0FBQztFQUNsRCxDQUFDO0VBQ0QyTSxTQUFTLEVBQUUsbUJBQVM3TSxLQUFLLEVBQUVDLENBQUMsRUFBRUMsT0FBTyxFQUFFO0lBQ3JDSixrQkFBa0IsQ0FBQzZKLFNBQVMsQ0FBQzNKLEtBQUssRUFBRUMsQ0FBQyxFQUFFQyxPQUFPLENBQUM7RUFDakQsQ0FBQztFQUNENE0sUUFBUSxFQUFFLGtCQUFTOU0sS0FBSyxFQUFFQyxDQUFDLEVBQUVDLE9BQU8sRUFBRTtJQUNwQ0osa0JBQWtCLENBQUMySyxRQUFRLENBQUN6SyxLQUFLLEVBQUVDLENBQUMsRUFBRUMsT0FBTyxDQUFDO0VBQ2hELENBQUM7RUFFRDtFQUNBNk0sUUFBUSxFQUFFLGtCQUFTL00sS0FBSyxFQUFFQyxDQUFDLEVBQUVDLE9BQU8sRUFBRTtJQUNwQyxJQUFJQSxPQUFPLENBQUMrSCxrQkFBa0IsRUFBRTtNQUM5Qi9ILE9BQU8sQ0FBQytILGtCQUFrQixHQUFHLEtBQUs7TUFDbEM7SUFDRjs7SUFFQTtJQUNBLElBQUloQixDQUFDLEdBQUc7TUFDTkosT0FBTyxFQUFFM0csT0FBTyxDQUFDQyxRQUFRO01BQ3pCMkcsT0FBTyxFQUFFNUcsT0FBTyxDQUFDSSxRQUFRO01BQ3pCNEcsVUFBVSxFQUFFO0lBQ2QsQ0FBQztJQUNELElBQUlqSCxDQUFDLENBQUNvSCxjQUFjLENBQUMsVUFBVSxFQUFFSixDQUFDLENBQUMsRUFBRTtNQUNuQztJQUNGO0lBRUEsSUFBSWpILEtBQUssQ0FBQ2tNLE1BQU0sSUFBSWxNLEtBQUssQ0FBQ21NLFFBQVEsRUFBRTtNQUNsQztJQUNGO0lBQ0FsTSxDQUFDLENBQUNpTCxTQUFTLEVBQUU7RUFDZjtBQUNGLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBcEwsa0JBQWtCLENBQUNrTixvQkFBb0IsR0FBRztFQUN4Q2pCLFNBQVMsRUFBRSxtQkFBUy9MLEtBQUssRUFBRUMsQ0FBQyxFQUFFQyxPQUFPLEVBQUU7SUFDckNBLE9BQU8sQ0FBQytMLG1CQUFtQixDQUFDak0sS0FBSyxFQUFFQyxDQUFDLEVBQUVDLE9BQU8sQ0FBQztFQUNoRCxDQUFDO0VBQ0RvTSxPQUFPLEVBQUV4TSxrQkFBa0IsQ0FBQ0M7QUFDOUIsQ0FBQzs7QUFFRDtBQUNBRCxrQkFBa0IsQ0FBQ21OLHlCQUF5QixHQUFHO0VBQzdDbEIsU0FBUyxFQUFFLG1CQUFTL0wsS0FBSyxFQUFFQyxDQUFDLEVBQUVDLE9BQU8sRUFBRTtJQUNyQ0EsT0FBTyxDQUFDK0wsbUJBQW1CLENBQUNqTSxLQUFLLEVBQUVDLENBQUMsRUFBRUMsT0FBTyxDQUFDO0lBQzlDSixrQkFBa0IsQ0FBQ21CLFFBQVEsQ0FBQ2pCLEtBQUssRUFBRUMsQ0FBQyxFQUFFQyxPQUFPLENBQUM7RUFDaEQsQ0FBQztFQUNEa00sU0FBUyxFQUFFLG1CQUFTcE0sS0FBSyxFQUFFQyxDQUFDLEVBQUVDLE9BQU8sRUFBRTtJQUNyQyxJQUFJQSxPQUFPLENBQUNrQixTQUFTLEVBQUU7TUFDckJ0QixrQkFBa0IsQ0FBQ3dFLE9BQU8sQ0FBQ3RFLEtBQUssRUFBRUMsQ0FBQyxFQUFFQyxPQUFPLENBQUM7SUFDL0M7RUFDRixDQUFDO0VBQ0RvTSxPQUFPLEVBQUUsaUJBQVN0TSxLQUFLLEVBQUVDLENBQUMsRUFBRUMsT0FBTyxFQUFFO0lBQ25DLElBQUlBLE9BQU8sQ0FBQ2tCLFNBQVMsRUFBRTtNQUNyQnRCLGtCQUFrQixDQUFDc0YsTUFBTSxDQUFDcEYsS0FBSyxFQUFFQyxDQUFDLEVBQUVDLE9BQU8sQ0FBQztJQUM5QztFQUNGO0FBQ0YsQ0FBQztBQUFDLGVBRWFKLGtCQUFrQjtBQUFBO0FBQUEifQ==