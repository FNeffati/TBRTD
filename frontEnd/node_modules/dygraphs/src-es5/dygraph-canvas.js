/**
 * @license
 * Copyright 2006 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licenced: https://opensource.org/licenses/MIT
 */

/**
 * @fileoverview Based on PlotKit.CanvasRenderer, but modified to meet the
 * needs of dygraphs.
 *
 * In particular, support for:
 * - grid overlays
 * - high/low bands
 * - dygraphs attribute system
 */

/**
 * The DygraphCanvasRenderer class does the actual rendering of the chart onto
 * a canvas. It's based on PlotKit.CanvasRenderer.
 * @param {Object} element The canvas to attach to
 * @param {Object} elementContext The 2d context of the canvas (injected so it
 * can be mocked for testing.)
 * @param {Layout} layout The DygraphLayout object for this graph.
 * @constructor
 */

/*global Dygraph:false */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var utils = _interopRequireWildcard(require("./dygraph-utils"));
var _dygraph = _interopRequireDefault(require("./dygraph"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @constructor
 *
 * This gets called when there are "new points" to chart. This is generally the
 * case when the underlying data being charted has changed. It is _not_ called
 * in the common case that the user has zoomed or is panning the view.
 *
 * The chart canvas has already been created by the Dygraph object. The
 * renderer simply gets a drawing context.
 *
 * @param {Dygraph} dygraph The chart to which this renderer belongs.
 * @param {HTMLCanvasElement} element The &lt;canvas&gt; DOM element on which to draw.
 * @param {CanvasRenderingContext2D} elementContext The drawing context.
 * @param {DygraphLayout} layout The chart's DygraphLayout object.
 *
 * TODO(danvk): remove the elementContext property.
 */
var DygraphCanvasRenderer = function DygraphCanvasRenderer(dygraph, element, elementContext, layout) {
  this.dygraph_ = dygraph;
  this.layout = layout;
  this.element = element;
  this.elementContext = elementContext;
  this.height = dygraph.height_;
  this.width = dygraph.width_;

  // --- check whether everything is ok before we return
  if (!utils.isCanvasSupported(this.element)) {
    throw "Canvas is not supported.";
  }

  // internal state
  this.area = layout.getPlotArea();

  // Set up a clipping area for the canvas (and the interaction canvas).
  // This ensures that we don't overdraw.
  var ctx = this.dygraph_.canvas_ctx_;
  ctx.beginPath();
  ctx.rect(this.area.x, this.area.y, this.area.w, this.area.h);
  ctx.clip();
  ctx = this.dygraph_.hidden_ctx_;
  ctx.beginPath();
  ctx.rect(this.area.x, this.area.y, this.area.w, this.area.h);
  ctx.clip();
};

/**
 * Clears out all chart content and DOM elements.
 * This is called immediately before render() on every frame, including
 * during zooms and pans.
 * @private
 */
DygraphCanvasRenderer.prototype.clear = function () {
  this.elementContext.clearRect(0, 0, this.width, this.height);
};

/**
 * This method is responsible for drawing everything on the chart, including
 * lines, high/low bands, fills and axes.
 * It is called immediately after clear() on every frame, including during pans
 * and zooms.
 * @private
 */
DygraphCanvasRenderer.prototype.render = function () {
  // attaches point.canvas{x,y}
  this._updatePoints();

  // actually draws the chart.
  this._renderLineChart();
};

/**
 * Returns a predicate to be used with an iterator, which will
 * iterate over points appropriately, depending on whether
 * connectSeparatedPoints is true. When it's false, the predicate will
 * skip over points with missing yVals.
 */
DygraphCanvasRenderer._getIteratorPredicate = function (connectSeparatedPoints) {
  return connectSeparatedPoints ? DygraphCanvasRenderer._predicateThatSkipsEmptyPoints : null;
};
DygraphCanvasRenderer._predicateThatSkipsEmptyPoints = function (array, idx) {
  return array[idx].yval !== null;
};

/**
 * Draws a line with the styles passed in and calls all the drawPointCallbacks.
 * @param {Object} e The dictionary passed to the plotter function.
 * @private
 */
DygraphCanvasRenderer._drawStyledLine = function (e, color, strokeWidth, strokePattern, drawPoints, drawPointCallback, pointSize) {
  var g = e.dygraph;
  // TODO(konigsberg): Compute attributes outside this method call.
  var stepPlot = g.getBooleanOption("stepPlot", e.setName);
  if (!utils.isArrayLike(strokePattern)) {
    strokePattern = null;
  }
  var drawGapPoints = g.getBooleanOption('drawGapEdgePoints', e.setName);
  var points = e.points;
  var setName = e.setName;
  var iter = utils.createIterator(points, 0, points.length, DygraphCanvasRenderer._getIteratorPredicate(g.getBooleanOption("connectSeparatedPoints", setName)));
  var stroking = strokePattern && strokePattern.length >= 2;
  var ctx = e.drawingContext;
  ctx.save();
  if (stroking) {
    if (ctx.setLineDash) ctx.setLineDash(strokePattern);
  }
  var pointsOnLine = DygraphCanvasRenderer._drawSeries(e, iter, strokeWidth, pointSize, drawPoints, drawGapPoints, stepPlot, color);
  DygraphCanvasRenderer._drawPointsOnLine(e, pointsOnLine, drawPointCallback, color, pointSize);
  if (stroking) {
    if (ctx.setLineDash) ctx.setLineDash([]);
  }
  ctx.restore();
};

/**
 * This does the actual drawing of lines on the canvas, for just one series.
 * Returns a list of [canvasx, canvasy] pairs for points for which a
 * drawPointCallback should be fired.  These include isolated points, or all
 * points if drawPoints=true.
 * @param {Object} e The dictionary passed to the plotter function.
 * @private
 */
DygraphCanvasRenderer._drawSeries = function (e, iter, strokeWidth, pointSize, drawPoints, drawGapPoints, stepPlot, color) {
  var prevCanvasX = null;
  var prevCanvasY = null;
  var nextCanvasY = null;
  var isIsolated; // true if this point is isolated (no line segments)
  var point; // the point being processed in the while loop
  var pointsOnLine = []; // Array of [canvasx, canvasy] pairs.
  var first = true; // the first cycle through the while loop

  var ctx = e.drawingContext;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;

  // NOTE: we break the iterator's encapsulation here for about a 25% speedup.
  var arr = iter.array_;
  var limit = iter.end_;
  var predicate = iter.predicate_;
  for (var i = iter.start_; i < limit; i++) {
    point = arr[i];
    if (predicate) {
      while (i < limit && !predicate(arr, i)) {
        i++;
      }
      if (i == limit) break;
      point = arr[i];
    }

    // FIXME: The 'canvasy != canvasy' test here catches NaN values but the test
    // doesn't catch Infinity values. Could change this to
    // !isFinite(point.canvasy), but I assume it avoids isNaN for performance?
    if (point.canvasy === null || point.canvasy != point.canvasy) {
      if (stepPlot && prevCanvasX !== null) {
        // Draw a horizontal line to the start of the missing data
        ctx.moveTo(prevCanvasX, prevCanvasY);
        ctx.lineTo(point.canvasx, prevCanvasY);
      }
      prevCanvasX = prevCanvasY = null;
    } else {
      isIsolated = false;
      if (drawGapPoints || prevCanvasX === null) {
        iter.nextIdx_ = i;
        iter.next();
        nextCanvasY = iter.hasNext ? iter.peek.canvasy : null;
        var isNextCanvasYNullOrNaN = nextCanvasY === null || nextCanvasY != nextCanvasY;
        isIsolated = prevCanvasX === null && isNextCanvasYNullOrNaN;
        if (drawGapPoints) {
          // Also consider a point to be "isolated" if it's adjacent to a
          // null point, excluding the graph edges.
          if (!first && prevCanvasX === null || iter.hasNext && isNextCanvasYNullOrNaN) {
            isIsolated = true;
          }
        }
      }
      if (prevCanvasX !== null) {
        if (strokeWidth) {
          if (stepPlot) {
            ctx.moveTo(prevCanvasX, prevCanvasY);
            ctx.lineTo(point.canvasx, prevCanvasY);
          }
          ctx.lineTo(point.canvasx, point.canvasy);
        }
      } else {
        ctx.moveTo(point.canvasx, point.canvasy);
      }
      if (drawPoints || isIsolated) {
        pointsOnLine.push([point.canvasx, point.canvasy, point.idx]);
      }
      prevCanvasX = point.canvasx;
      prevCanvasY = point.canvasy;
    }
    first = false;
  }
  ctx.stroke();
  return pointsOnLine;
};

/**
 * This fires the drawPointCallback functions, which draw dots on the points by
 * default. This gets used when the "drawPoints" option is set, or when there
 * are isolated points.
 * @param {Object} e The dictionary passed to the plotter function.
 * @private
 */
DygraphCanvasRenderer._drawPointsOnLine = function (e, pointsOnLine, drawPointCallback, color, pointSize) {
  var ctx = e.drawingContext;
  for (var idx = 0; idx < pointsOnLine.length; idx++) {
    var cb = pointsOnLine[idx];
    ctx.save();
    drawPointCallback.call(e.dygraph, e.dygraph, e.setName, ctx, cb[0], cb[1], color, pointSize, cb[2]);
    ctx.restore();
  }
};

/**
 * Attaches canvas coordinates to the points array.
 * @private
 */
DygraphCanvasRenderer.prototype._updatePoints = function () {
  // Update Points
  // TODO(danvk): here
  //
  // TODO(bhs): this loop is a hot-spot for high-point-count charts. These
  // transformations can be pushed into the canvas via linear transformation
  // matrices.
  // NOTE(danvk): this is trickier than it sounds at first. The transformation
  // needs to be done before the .moveTo() and .lineTo() calls, but must be
  // undone before the .stroke() call to ensure that the stroke width is
  // unaffected.  An alternative is to reduce the stroke width in the
  // transformed coordinate space, but you can't specify different values for
  // each dimension (as you can with .scale()). The speedup here is ~12%.
  var sets = this.layout.points;
  for (var i = sets.length; i--;) {
    var points = sets[i];
    for (var j = points.length; j--;) {
      var point = points[j];
      point.canvasx = this.area.w * point.x + this.area.x;
      point.canvasy = this.area.h * point.y + this.area.y;
    }
  }
};

/**
 * Add canvas Actually draw the lines chart, including high/low bands.
 *
 * This function can only be called if DygraphLayout's points array has been
 * updated with canvas{x,y} attributes, i.e. by
 * DygraphCanvasRenderer._updatePoints.
 *
 * @param {string=} opt_seriesName when specified, only that series will
 *     be drawn. (This is used for expedited redrawing with highlightSeriesOpts)
 * @param {CanvasRenderingContext2D} opt_ctx when specified, the drawing
 *     context.  However, lines are typically drawn on the object's
 *     elementContext.
 * @private
 */
DygraphCanvasRenderer.prototype._renderLineChart = function (opt_seriesName, opt_ctx) {
  var ctx = opt_ctx || this.elementContext;
  var i;
  var sets = this.layout.points;
  var setNames = this.layout.setNames;
  var setName;
  this.colors = this.dygraph_.colorsMap_;

  // Determine which series have specialized plotters.
  var plotter_attr = this.dygraph_.getOption("plotter");
  var plotters = plotter_attr;
  if (!utils.isArrayLike(plotters)) {
    plotters = [plotters];
  }
  var setPlotters = {}; // series name -> plotter fn.
  for (i = 0; i < setNames.length; i++) {
    setName = setNames[i];
    var setPlotter = this.dygraph_.getOption("plotter", setName);
    if (setPlotter == plotter_attr) continue; // not specialized.

    setPlotters[setName] = setPlotter;
  }
  for (i = 0; i < plotters.length; i++) {
    var plotter = plotters[i];
    var is_last = i == plotters.length - 1;
    for (var j = 0; j < sets.length; j++) {
      setName = setNames[j];
      if (opt_seriesName && setName != opt_seriesName) continue;
      var points = sets[j];

      // Only throw in the specialized plotters on the last iteration.
      var p = plotter;
      if (setName in setPlotters) {
        if (is_last) {
          p = setPlotters[setName];
        } else {
          // Don't use the standard plotters in this case.
          continue;
        }
      }
      var color = this.colors[setName];
      var strokeWidth = this.dygraph_.getOption("strokeWidth", setName);
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      p({
        points: points,
        setName: setName,
        drawingContext: ctx,
        color: color,
        strokeWidth: strokeWidth,
        dygraph: this.dygraph_,
        axis: this.dygraph_.axisPropertiesForSeries(setName),
        plotArea: this.area,
        seriesIndex: j,
        seriesCount: sets.length,
        singleSeriesName: opt_seriesName,
        allSeriesPoints: sets
      });
      ctx.restore();
    }
  }
};

/**
 * Standard plotters. These may be used by clients via Dygraph.Plotters.
 * See comments there for more details.
 */
DygraphCanvasRenderer._Plotters = {
  linePlotter: function linePlotter(e) {
    DygraphCanvasRenderer._linePlotter(e);
  },
  fillPlotter: function fillPlotter(e) {
    DygraphCanvasRenderer._fillPlotter(e);
  },
  errorPlotter: function errorPlotter(e) {
    DygraphCanvasRenderer._errorPlotter(e);
  }
};

/**
 * Plotter which draws the central lines for a series.
 * @private
 */
DygraphCanvasRenderer._linePlotter = function (e) {
  var g = e.dygraph;
  var setName = e.setName;
  var strokeWidth = e.strokeWidth;

  // TODO(danvk): Check if there's any performance impact of just calling
  // getOption() inside of _drawStyledLine. Passing in so many parameters makes
  // this code a bit nasty.
  var borderWidth = g.getNumericOption("strokeBorderWidth", setName);
  var drawPointCallback = g.getOption("drawPointCallback", setName) || utils.Circles.DEFAULT;
  var strokePattern = g.getOption("strokePattern", setName);
  var drawPoints = g.getBooleanOption("drawPoints", setName);
  var pointSize = g.getNumericOption("pointSize", setName);
  if (borderWidth && strokeWidth) {
    DygraphCanvasRenderer._drawStyledLine(e, g.getOption("strokeBorderColor", setName), strokeWidth + 2 * borderWidth, strokePattern, drawPoints, drawPointCallback, pointSize);
  }
  DygraphCanvasRenderer._drawStyledLine(e, e.color, strokeWidth, strokePattern, drawPoints, drawPointCallback, pointSize);
};

/**
 * Draws the shaded high/low bands (confidence intervals) for each series.
 * This happens before the center lines are drawn, since the center lines
 * need to be drawn on top of the high/low bands for all series.
 * @private
 */
DygraphCanvasRenderer._errorPlotter = function (e) {
  var g = e.dygraph;
  var setName = e.setName;
  var errorBars = g.getBooleanOption("errorBars") || g.getBooleanOption("customBars");
  if (!errorBars) return;
  var fillGraph = g.getBooleanOption("fillGraph", setName);
  if (fillGraph) {
    console.warn("Can't use fillGraph option with customBars or errorBars option");
  }
  var ctx = e.drawingContext;
  var color = e.color;
  var fillAlpha = g.getNumericOption('fillAlpha', setName);
  var stepPlot = g.getBooleanOption("stepPlot", setName);
  var points = e.points;
  var iter = utils.createIterator(points, 0, points.length, DygraphCanvasRenderer._getIteratorPredicate(g.getBooleanOption("connectSeparatedPoints", setName)));
  var newYs;

  // setup graphics context
  var prevX = NaN;
  var prevY = NaN;
  var prevYs = [-1, -1];
  // should be same color as the lines but only 15% opaque.
  var rgb = utils.toRGB_(color);
  var err_color = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + fillAlpha + ')';
  ctx.fillStyle = err_color;
  ctx.beginPath();
  var isNullUndefinedOrNaN = function isNullUndefinedOrNaN(x) {
    return x === null || x === undefined || isNaN(x);
  };
  while (iter.hasNext) {
    var point = iter.next();
    if (!stepPlot && isNullUndefinedOrNaN(point.y) || stepPlot && !isNaN(prevY) && isNullUndefinedOrNaN(prevY)) {
      prevX = NaN;
      continue;
    }
    newYs = [point.y_bottom, point.y_top];
    if (stepPlot) {
      prevY = point.y;
    }

    // The documentation specifically disallows nulls inside the point arrays,
    // but in case it happens we should do something sensible.
    if (isNaN(newYs[0])) newYs[0] = point.y;
    if (isNaN(newYs[1])) newYs[1] = point.y;
    newYs[0] = e.plotArea.h * newYs[0] + e.plotArea.y;
    newYs[1] = e.plotArea.h * newYs[1] + e.plotArea.y;
    if (!isNaN(prevX)) {
      if (stepPlot) {
        ctx.moveTo(prevX, prevYs[0]);
        ctx.lineTo(point.canvasx, prevYs[0]);
        ctx.lineTo(point.canvasx, prevYs[1]);
      } else {
        ctx.moveTo(prevX, prevYs[0]);
        ctx.lineTo(point.canvasx, newYs[0]);
        ctx.lineTo(point.canvasx, newYs[1]);
      }
      ctx.lineTo(prevX, prevYs[1]);
      ctx.closePath();
    }
    prevYs = newYs;
    prevX = point.canvasx;
  }
  ctx.fill();
};

/**
 * Proxy for CanvasRenderingContext2D which drops moveTo/lineTo calls which are
 * superfluous. It accumulates all movements which haven't changed the x-value
 * and only applies the two with the most extreme y-values.
 *
 * Calls to lineTo/moveTo must have non-decreasing x-values.
 */
DygraphCanvasRenderer._fastCanvasProxy = function (context) {
  var pendingActions = []; // array of [type, x, y] tuples
  var lastRoundedX = null;
  var lastFlushedX = null;
  var LINE_TO = 1,
    MOVE_TO = 2;
  var actionCount = 0; // number of moveTos and lineTos passed to context.

  // Drop superfluous motions
  // Assumes all pendingActions have the same (rounded) x-value.
  var compressActions = function compressActions(opt_losslessOnly) {
    if (pendingActions.length <= 1) return;

    // Lossless compression: drop inconsequential moveTos.
    for (var i = pendingActions.length - 1; i > 0; i--) {
      var action = pendingActions[i];
      if (action[0] == MOVE_TO) {
        var prevAction = pendingActions[i - 1];
        if (prevAction[1] == action[1] && prevAction[2] == action[2]) {
          pendingActions.splice(i, 1);
        }
      }
    }

    // Lossless compression: ... drop consecutive moveTos ...
    for /* incremented internally */
    (var i = 0; i < pendingActions.length - 1;) {
      var action = pendingActions[i];
      if (action[0] == MOVE_TO && pendingActions[i + 1][0] == MOVE_TO) {
        pendingActions.splice(i, 1);
      } else {
        i++;
      }
    }

    // Lossy compression: ... drop all but the extreme y-values ...
    if (pendingActions.length > 2 && !opt_losslessOnly) {
      // keep an initial moveTo, but drop all others.
      var startIdx = 0;
      if (pendingActions[0][0] == MOVE_TO) startIdx++;
      var minIdx = null,
        maxIdx = null;
      for (var i = startIdx; i < pendingActions.length; i++) {
        var action = pendingActions[i];
        if (action[0] != LINE_TO) continue;
        if (minIdx === null && maxIdx === null) {
          minIdx = i;
          maxIdx = i;
        } else {
          var y = action[2];
          if (y < pendingActions[minIdx][2]) {
            minIdx = i;
          } else if (y > pendingActions[maxIdx][2]) {
            maxIdx = i;
          }
        }
      }
      var minAction = pendingActions[minIdx],
        maxAction = pendingActions[maxIdx];
      pendingActions.splice(startIdx, pendingActions.length - startIdx);
      if (minIdx < maxIdx) {
        pendingActions.push(minAction);
        pendingActions.push(maxAction);
      } else if (minIdx > maxIdx) {
        pendingActions.push(maxAction);
        pendingActions.push(minAction);
      } else {
        pendingActions.push(minAction);
      }
    }
  };
  var flushActions = function flushActions(opt_noLossyCompression) {
    compressActions(opt_noLossyCompression);
    for (var i = 0, len = pendingActions.length; i < len; i++) {
      var action = pendingActions[i];
      if (action[0] == LINE_TO) {
        context.lineTo(action[1], action[2]);
      } else if (action[0] == MOVE_TO) {
        context.moveTo(action[1], action[2]);
      }
    }
    if (pendingActions.length) {
      lastFlushedX = pendingActions[pendingActions.length - 1][1];
    }
    actionCount += pendingActions.length;
    pendingActions = [];
  };
  var addAction = function addAction(action, x, y) {
    var rx = Math.round(x);
    if (lastRoundedX === null || rx != lastRoundedX) {
      // if there are large gaps on the x-axis, it's essential to keep the
      // first and last point as well.
      var hasGapOnLeft = lastRoundedX - lastFlushedX > 1,
        hasGapOnRight = rx - lastRoundedX > 1,
        hasGap = hasGapOnLeft || hasGapOnRight;
      flushActions(hasGap);
      lastRoundedX = rx;
    }
    pendingActions.push([action, x, y]);
  };
  return {
    moveTo: function moveTo(x, y) {
      addAction(MOVE_TO, x, y);
    },
    lineTo: function lineTo(x, y) {
      addAction(LINE_TO, x, y);
    },
    // for major operations like stroke/fill, we skip compression to ensure
    // that there are no artifacts at the right edge.
    stroke: function stroke() {
      flushActions(true);
      context.stroke();
    },
    fill: function fill() {
      flushActions(true);
      context.fill();
    },
    beginPath: function beginPath() {
      flushActions(true);
      context.beginPath();
    },
    closePath: function closePath() {
      flushActions(true);
      context.closePath();
    },
    _count: function _count() {
      return actionCount;
    }
  };
};

/**
 * Draws the shaded regions when "fillGraph" is set.
 * Not to be confused with high/low bands (historically misnamed errorBars).
 *
 * For stacked charts, it's more convenient to handle all the series
 * simultaneously. So this plotter plots all the points on the first series
 * it's asked to draw, then ignores all the other series.
 *
 * @private
 */
DygraphCanvasRenderer._fillPlotter = function (e) {
  // Skip if we're drawing a single series for interactive highlight overlay.
  if (e.singleSeriesName) return;

  // We'll handle all the series at once, not one-by-one.
  if (e.seriesIndex !== 0) return;
  var g = e.dygraph;
  var setNames = g.getLabels().slice(1); // remove x-axis

  // getLabels() includes names for invisible series, which are not included in
  // allSeriesPoints. We remove those to make the two match.
  // TODO(danvk): provide a simpler way to get this information.
  for (var i = setNames.length; i >= 0; i--) {
    if (!g.visibility()[i]) setNames.splice(i, 1);
  }
  var anySeriesFilled = function () {
    for (var i = 0; i < setNames.length; i++) {
      if (g.getBooleanOption("fillGraph", setNames[i])) return true;
    }
    return false;
  }();
  if (!anySeriesFilled) return;
  var area = e.plotArea;
  var sets = e.allSeriesPoints;
  var setCount = sets.length;
  var stackedGraph = g.getBooleanOption("stackedGraph");
  var colors = g.getColors();

  // For stacked graphs, track the baseline for filling.
  //
  // The filled areas below graph lines are trapezoids with two
  // vertical edges. The top edge is the line segment being drawn, and
  // the baseline is the bottom edge. Each baseline corresponds to the
  // top line segment from the previous stacked line. In the case of
  // step plots, the trapezoids are rectangles.
  var baseline = {};
  var currBaseline;
  var prevStepPlot; // for different line drawing modes (line/step) per series

  // Helper function to trace a line back along the baseline.
  var traceBackPath = function traceBackPath(ctx, baselineX, baselineY, pathBack) {
    ctx.lineTo(baselineX, baselineY);
    if (stackedGraph) {
      for (var i = pathBack.length - 1; i >= 0; i--) {
        var pt = pathBack[i];
        ctx.lineTo(pt[0], pt[1]);
      }
    }
  };

  // process sets in reverse order (needed for stacked graphs)
  for (var setIdx = setCount - 1; setIdx >= 0; setIdx--) {
    var ctx = e.drawingContext;
    var setName = setNames[setIdx];
    if (!g.getBooleanOption('fillGraph', setName)) continue;
    var fillAlpha = g.getNumericOption('fillAlpha', setName);
    var stepPlot = g.getBooleanOption('stepPlot', setName);
    var color = colors[setIdx];
    var axis = g.axisPropertiesForSeries(setName);
    var axisY = 1.0 + axis.minyval * axis.yscale;
    if (axisY < 0.0) axisY = 0.0;else if (axisY > 1.0) axisY = 1.0;
    axisY = area.h * axisY + area.y;
    var points = sets[setIdx];
    var iter = utils.createIterator(points, 0, points.length, DygraphCanvasRenderer._getIteratorPredicate(g.getBooleanOption("connectSeparatedPoints", setName)));

    // setup graphics context
    var prevX = NaN;
    var prevYs = [-1, -1];
    var newYs;
    // should be same color as the lines but only 15% opaque.
    var rgb = utils.toRGB_(color);
    var err_color = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + fillAlpha + ')';
    ctx.fillStyle = err_color;
    ctx.beginPath();
    var last_x,
      is_first = true;

    // If the point density is high enough, dropping segments on their way to
    // the canvas justifies the overhead of doing so.
    if (points.length > 2 * g.width_ || _dygraph["default"].FORCE_FAST_PROXY) {
      ctx = DygraphCanvasRenderer._fastCanvasProxy(ctx);
    }

    // For filled charts, we draw points from left to right, then back along
    // the x-axis to complete a shape for filling.
    // For stacked plots, this "back path" is a more complex shape. This array
    // stores the [x, y] values needed to trace that shape.
    var pathBack = [];

    // TODO(danvk): there are a lot of options at play in this loop.
    //     The logic would be much clearer if some (e.g. stackGraph and
    //     stepPlot) were split off into separate sub-plotters.
    var point;
    while (iter.hasNext) {
      point = iter.next();
      if (!utils.isOK(point.y) && !stepPlot) {
        traceBackPath(ctx, prevX, prevYs[1], pathBack);
        pathBack = [];
        prevX = NaN;
        if (point.y_stacked !== null && !isNaN(point.y_stacked)) {
          baseline[point.canvasx] = area.h * point.y_stacked + area.y;
        }
        continue;
      }
      if (stackedGraph) {
        if (!is_first && last_x == point.xval) {
          continue;
        } else {
          is_first = false;
          last_x = point.xval;
        }
        currBaseline = baseline[point.canvasx];
        var lastY;
        if (currBaseline === undefined) {
          lastY = axisY;
        } else {
          if (prevStepPlot) {
            lastY = currBaseline[0];
          } else {
            lastY = currBaseline;
          }
        }
        newYs = [point.canvasy, lastY];
        if (stepPlot) {
          // Step plots must keep track of the top and bottom of
          // the baseline at each point.
          if (prevYs[0] === -1) {
            baseline[point.canvasx] = [point.canvasy, axisY];
          } else {
            baseline[point.canvasx] = [point.canvasy, prevYs[0]];
          }
        } else {
          baseline[point.canvasx] = point.canvasy;
        }
      } else {
        if (isNaN(point.canvasy) && stepPlot) {
          newYs = [area.y + area.h, axisY];
        } else {
          newYs = [point.canvasy, axisY];
        }
      }
      if (!isNaN(prevX)) {
        // Move to top fill point
        if (stepPlot) {
          ctx.lineTo(point.canvasx, prevYs[0]);
          ctx.lineTo(point.canvasx, newYs[0]);
        } else {
          ctx.lineTo(point.canvasx, newYs[0]);
        }

        // Record the baseline for the reverse path.
        if (stackedGraph) {
          pathBack.push([prevX, prevYs[1]]);
          if (prevStepPlot && currBaseline) {
            // Draw to the bottom of the baseline
            pathBack.push([point.canvasx, currBaseline[1]]);
          } else {
            pathBack.push([point.canvasx, newYs[1]]);
          }
        }
      } else {
        ctx.moveTo(point.canvasx, newYs[1]);
        ctx.lineTo(point.canvasx, newYs[0]);
      }
      prevYs = newYs;
      prevX = point.canvasx;
    }
    prevStepPlot = stepPlot;
    if (newYs && point) {
      traceBackPath(ctx, point.canvasx, newYs[1], pathBack);
      pathBack = [];
    }
    ctx.fill();
  }
};
var _default = DygraphCanvasRenderer;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEeWdyYXBoQ2FudmFzUmVuZGVyZXIiLCJkeWdyYXBoIiwiZWxlbWVudCIsImVsZW1lbnRDb250ZXh0IiwibGF5b3V0IiwiZHlncmFwaF8iLCJoZWlnaHQiLCJoZWlnaHRfIiwid2lkdGgiLCJ3aWR0aF8iLCJ1dGlscyIsImlzQ2FudmFzU3VwcG9ydGVkIiwiYXJlYSIsImdldFBsb3RBcmVhIiwiY3R4IiwiY2FudmFzX2N0eF8iLCJiZWdpblBhdGgiLCJyZWN0IiwieCIsInkiLCJ3IiwiaCIsImNsaXAiLCJoaWRkZW5fY3R4XyIsInByb3RvdHlwZSIsImNsZWFyIiwiY2xlYXJSZWN0IiwicmVuZGVyIiwiX3VwZGF0ZVBvaW50cyIsIl9yZW5kZXJMaW5lQ2hhcnQiLCJfZ2V0SXRlcmF0b3JQcmVkaWNhdGUiLCJjb25uZWN0U2VwYXJhdGVkUG9pbnRzIiwiX3ByZWRpY2F0ZVRoYXRTa2lwc0VtcHR5UG9pbnRzIiwiYXJyYXkiLCJpZHgiLCJ5dmFsIiwiX2RyYXdTdHlsZWRMaW5lIiwiZSIsImNvbG9yIiwic3Ryb2tlV2lkdGgiLCJzdHJva2VQYXR0ZXJuIiwiZHJhd1BvaW50cyIsImRyYXdQb2ludENhbGxiYWNrIiwicG9pbnRTaXplIiwiZyIsInN0ZXBQbG90IiwiZ2V0Qm9vbGVhbk9wdGlvbiIsInNldE5hbWUiLCJpc0FycmF5TGlrZSIsImRyYXdHYXBQb2ludHMiLCJwb2ludHMiLCJpdGVyIiwiY3JlYXRlSXRlcmF0b3IiLCJsZW5ndGgiLCJzdHJva2luZyIsImRyYXdpbmdDb250ZXh0Iiwic2F2ZSIsInNldExpbmVEYXNoIiwicG9pbnRzT25MaW5lIiwiX2RyYXdTZXJpZXMiLCJfZHJhd1BvaW50c09uTGluZSIsInJlc3RvcmUiLCJwcmV2Q2FudmFzWCIsInByZXZDYW52YXNZIiwibmV4dENhbnZhc1kiLCJpc0lzb2xhdGVkIiwicG9pbnQiLCJmaXJzdCIsInN0cm9rZVN0eWxlIiwibGluZVdpZHRoIiwiYXJyIiwiYXJyYXlfIiwibGltaXQiLCJlbmRfIiwicHJlZGljYXRlIiwicHJlZGljYXRlXyIsImkiLCJzdGFydF8iLCJjYW52YXN5IiwibW92ZVRvIiwibGluZVRvIiwiY2FudmFzeCIsIm5leHRJZHhfIiwibmV4dCIsImhhc05leHQiLCJwZWVrIiwiaXNOZXh0Q2FudmFzWU51bGxPck5hTiIsInB1c2giLCJzdHJva2UiLCJjYiIsImNhbGwiLCJzZXRzIiwiaiIsIm9wdF9zZXJpZXNOYW1lIiwib3B0X2N0eCIsInNldE5hbWVzIiwiY29sb3JzIiwiY29sb3JzTWFwXyIsInBsb3R0ZXJfYXR0ciIsImdldE9wdGlvbiIsInBsb3R0ZXJzIiwic2V0UGxvdHRlcnMiLCJzZXRQbG90dGVyIiwicGxvdHRlciIsImlzX2xhc3QiLCJwIiwiYXhpcyIsImF4aXNQcm9wZXJ0aWVzRm9yU2VyaWVzIiwicGxvdEFyZWEiLCJzZXJpZXNJbmRleCIsInNlcmllc0NvdW50Iiwic2luZ2xlU2VyaWVzTmFtZSIsImFsbFNlcmllc1BvaW50cyIsIl9QbG90dGVycyIsImxpbmVQbG90dGVyIiwiX2xpbmVQbG90dGVyIiwiZmlsbFBsb3R0ZXIiLCJfZmlsbFBsb3R0ZXIiLCJlcnJvclBsb3R0ZXIiLCJfZXJyb3JQbG90dGVyIiwiYm9yZGVyV2lkdGgiLCJnZXROdW1lcmljT3B0aW9uIiwiQ2lyY2xlcyIsIkRFRkFVTFQiLCJlcnJvckJhcnMiLCJmaWxsR3JhcGgiLCJjb25zb2xlIiwid2FybiIsImZpbGxBbHBoYSIsIm5ld1lzIiwicHJldlgiLCJOYU4iLCJwcmV2WSIsInByZXZZcyIsInJnYiIsInRvUkdCXyIsImVycl9jb2xvciIsInIiLCJiIiwiZmlsbFN0eWxlIiwiaXNOdWxsVW5kZWZpbmVkT3JOYU4iLCJ1bmRlZmluZWQiLCJpc05hTiIsInlfYm90dG9tIiwieV90b3AiLCJjbG9zZVBhdGgiLCJmaWxsIiwiX2Zhc3RDYW52YXNQcm94eSIsImNvbnRleHQiLCJwZW5kaW5nQWN0aW9ucyIsImxhc3RSb3VuZGVkWCIsImxhc3RGbHVzaGVkWCIsIkxJTkVfVE8iLCJNT1ZFX1RPIiwiYWN0aW9uQ291bnQiLCJjb21wcmVzc0FjdGlvbnMiLCJvcHRfbG9zc2xlc3NPbmx5IiwiYWN0aW9uIiwicHJldkFjdGlvbiIsInNwbGljZSIsInN0YXJ0SWR4IiwibWluSWR4IiwibWF4SWR4IiwibWluQWN0aW9uIiwibWF4QWN0aW9uIiwiZmx1c2hBY3Rpb25zIiwib3B0X25vTG9zc3lDb21wcmVzc2lvbiIsImxlbiIsImFkZEFjdGlvbiIsInJ4IiwiTWF0aCIsInJvdW5kIiwiaGFzR2FwT25MZWZ0IiwiaGFzR2FwT25SaWdodCIsImhhc0dhcCIsIl9jb3VudCIsImdldExhYmVscyIsInNsaWNlIiwidmlzaWJpbGl0eSIsImFueVNlcmllc0ZpbGxlZCIsInNldENvdW50Iiwic3RhY2tlZEdyYXBoIiwiZ2V0Q29sb3JzIiwiYmFzZWxpbmUiLCJjdXJyQmFzZWxpbmUiLCJwcmV2U3RlcFBsb3QiLCJ0cmFjZUJhY2tQYXRoIiwiYmFzZWxpbmVYIiwiYmFzZWxpbmVZIiwicGF0aEJhY2siLCJwdCIsInNldElkeCIsImF4aXNZIiwibWlueXZhbCIsInlzY2FsZSIsImxhc3RfeCIsImlzX2ZpcnN0IiwiRHlncmFwaCIsIkZPUkNFX0ZBU1RfUFJPWFkiLCJpc09LIiwieV9zdGFja2VkIiwieHZhbCIsImxhc3RZIl0sInNvdXJjZXMiOlsiLi4vc3JjL2R5Z3JhcGgtY2FudmFzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDA2IERhbiBWYW5kZXJrYW0gKGRhbnZka0BnbWFpbC5jb20pXG4gKiBNSVQtbGljZW5jZWQ6IGh0dHBzOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEJhc2VkIG9uIFBsb3RLaXQuQ2FudmFzUmVuZGVyZXIsIGJ1dCBtb2RpZmllZCB0byBtZWV0IHRoZVxuICogbmVlZHMgb2YgZHlncmFwaHMuXG4gKlxuICogSW4gcGFydGljdWxhciwgc3VwcG9ydCBmb3I6XG4gKiAtIGdyaWQgb3ZlcmxheXNcbiAqIC0gaGlnaC9sb3cgYmFuZHNcbiAqIC0gZHlncmFwaHMgYXR0cmlidXRlIHN5c3RlbVxuICovXG5cbi8qKlxuICogVGhlIER5Z3JhcGhDYW52YXNSZW5kZXJlciBjbGFzcyBkb2VzIHRoZSBhY3R1YWwgcmVuZGVyaW5nIG9mIHRoZSBjaGFydCBvbnRvXG4gKiBhIGNhbnZhcy4gSXQncyBiYXNlZCBvbiBQbG90S2l0LkNhbnZhc1JlbmRlcmVyLlxuICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgVGhlIGNhbnZhcyB0byBhdHRhY2ggdG9cbiAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50Q29udGV4dCBUaGUgMmQgY29udGV4dCBvZiB0aGUgY2FudmFzIChpbmplY3RlZCBzbyBpdFxuICogY2FuIGJlIG1vY2tlZCBmb3IgdGVzdGluZy4pXG4gKiBAcGFyYW0ge0xheW91dH0gbGF5b3V0IFRoZSBEeWdyYXBoTGF5b3V0IG9iamVjdCBmb3IgdGhpcyBncmFwaC5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5cbi8qZ2xvYmFsIER5Z3JhcGg6ZmFsc2UgKi9cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tICcuL2R5Z3JhcGgtdXRpbHMnO1xuaW1wb3J0IER5Z3JhcGggZnJvbSAnLi9keWdyYXBoJztcblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqXG4gKiBUaGlzIGdldHMgY2FsbGVkIHdoZW4gdGhlcmUgYXJlIFwibmV3IHBvaW50c1wiIHRvIGNoYXJ0LiBUaGlzIGlzIGdlbmVyYWxseSB0aGVcbiAqIGNhc2Ugd2hlbiB0aGUgdW5kZXJseWluZyBkYXRhIGJlaW5nIGNoYXJ0ZWQgaGFzIGNoYW5nZWQuIEl0IGlzIF9ub3RfIGNhbGxlZFxuICogaW4gdGhlIGNvbW1vbiBjYXNlIHRoYXQgdGhlIHVzZXIgaGFzIHpvb21lZCBvciBpcyBwYW5uaW5nIHRoZSB2aWV3LlxuICpcbiAqIFRoZSBjaGFydCBjYW52YXMgaGFzIGFscmVhZHkgYmVlbiBjcmVhdGVkIGJ5IHRoZSBEeWdyYXBoIG9iamVjdC4gVGhlXG4gKiByZW5kZXJlciBzaW1wbHkgZ2V0cyBhIGRyYXdpbmcgY29udGV4dC5cbiAqXG4gKiBAcGFyYW0ge0R5Z3JhcGh9IGR5Z3JhcGggVGhlIGNoYXJ0IHRvIHdoaWNoIHRoaXMgcmVuZGVyZXIgYmVsb25ncy5cbiAqIEBwYXJhbSB7SFRNTENhbnZhc0VsZW1lbnR9IGVsZW1lbnQgVGhlICZsdDtjYW52YXMmZ3Q7IERPTSBlbGVtZW50IG9uIHdoaWNoIHRvIGRyYXcuXG4gKiBAcGFyYW0ge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gZWxlbWVudENvbnRleHQgVGhlIGRyYXdpbmcgY29udGV4dC5cbiAqIEBwYXJhbSB7RHlncmFwaExheW91dH0gbGF5b3V0IFRoZSBjaGFydCdzIER5Z3JhcGhMYXlvdXQgb2JqZWN0LlxuICpcbiAqIFRPRE8oZGFudmspOiByZW1vdmUgdGhlIGVsZW1lbnRDb250ZXh0IHByb3BlcnR5LlxuICovXG52YXIgRHlncmFwaENhbnZhc1JlbmRlcmVyID0gZnVuY3Rpb24oZHlncmFwaCwgZWxlbWVudCwgZWxlbWVudENvbnRleHQsIGxheW91dCkge1xuICB0aGlzLmR5Z3JhcGhfID0gZHlncmFwaDtcblxuICB0aGlzLmxheW91dCA9IGxheW91dDtcbiAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgdGhpcy5lbGVtZW50Q29udGV4dCA9IGVsZW1lbnRDb250ZXh0O1xuXG4gIHRoaXMuaGVpZ2h0ID0gZHlncmFwaC5oZWlnaHRfO1xuICB0aGlzLndpZHRoID0gZHlncmFwaC53aWR0aF87XG5cbiAgLy8gLS0tIGNoZWNrIHdoZXRoZXIgZXZlcnl0aGluZyBpcyBvayBiZWZvcmUgd2UgcmV0dXJuXG4gIGlmICghdXRpbHMuaXNDYW52YXNTdXBwb3J0ZWQodGhpcy5lbGVtZW50KSkge1xuICAgIHRocm93IFwiQ2FudmFzIGlzIG5vdCBzdXBwb3J0ZWQuXCI7XG4gIH1cblxuICAvLyBpbnRlcm5hbCBzdGF0ZVxuICB0aGlzLmFyZWEgPSBsYXlvdXQuZ2V0UGxvdEFyZWEoKTtcblxuICAvLyBTZXQgdXAgYSBjbGlwcGluZyBhcmVhIGZvciB0aGUgY2FudmFzIChhbmQgdGhlIGludGVyYWN0aW9uIGNhbnZhcykuXG4gIC8vIFRoaXMgZW5zdXJlcyB0aGF0IHdlIGRvbid0IG92ZXJkcmF3LlxuICB2YXIgY3R4ID0gdGhpcy5keWdyYXBoXy5jYW52YXNfY3R4XztcbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHgucmVjdCh0aGlzLmFyZWEueCwgdGhpcy5hcmVhLnksIHRoaXMuYXJlYS53LCB0aGlzLmFyZWEuaCk7XG4gIGN0eC5jbGlwKCk7XG5cbiAgY3R4ID0gdGhpcy5keWdyYXBoXy5oaWRkZW5fY3R4XztcbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHgucmVjdCh0aGlzLmFyZWEueCwgdGhpcy5hcmVhLnksIHRoaXMuYXJlYS53LCB0aGlzLmFyZWEuaCk7XG4gIGN0eC5jbGlwKCk7XG59O1xuXG4vKipcbiAqIENsZWFycyBvdXQgYWxsIGNoYXJ0IGNvbnRlbnQgYW5kIERPTSBlbGVtZW50cy5cbiAqIFRoaXMgaXMgY2FsbGVkIGltbWVkaWF0ZWx5IGJlZm9yZSByZW5kZXIoKSBvbiBldmVyeSBmcmFtZSwgaW5jbHVkaW5nXG4gKiBkdXJpbmcgem9vbXMgYW5kIHBhbnMuXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZWxlbWVudENvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbn07XG5cbi8qKlxuICogVGhpcyBtZXRob2QgaXMgcmVzcG9uc2libGUgZm9yIGRyYXdpbmcgZXZlcnl0aGluZyBvbiB0aGUgY2hhcnQsIGluY2x1ZGluZ1xuICogbGluZXMsIGhpZ2gvbG93IGJhbmRzLCBmaWxscyBhbmQgYXhlcy5cbiAqIEl0IGlzIGNhbGxlZCBpbW1lZGlhdGVseSBhZnRlciBjbGVhcigpIG9uIGV2ZXJ5IGZyYW1lLCBpbmNsdWRpbmcgZHVyaW5nIHBhbnNcbiAqIGFuZCB6b29tcy5cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGhDYW52YXNSZW5kZXJlci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gIC8vIGF0dGFjaGVzIHBvaW50LmNhbnZhc3t4LHl9XG4gIHRoaXMuX3VwZGF0ZVBvaW50cygpO1xuXG4gIC8vIGFjdHVhbGx5IGRyYXdzIHRoZSBjaGFydC5cbiAgdGhpcy5fcmVuZGVyTGluZUNoYXJ0KCk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBwcmVkaWNhdGUgdG8gYmUgdXNlZCB3aXRoIGFuIGl0ZXJhdG9yLCB3aGljaCB3aWxsXG4gKiBpdGVyYXRlIG92ZXIgcG9pbnRzIGFwcHJvcHJpYXRlbHksIGRlcGVuZGluZyBvbiB3aGV0aGVyXG4gKiBjb25uZWN0U2VwYXJhdGVkUG9pbnRzIGlzIHRydWUuIFdoZW4gaXQncyBmYWxzZSwgdGhlIHByZWRpY2F0ZSB3aWxsXG4gKiBza2lwIG92ZXIgcG9pbnRzIHdpdGggbWlzc2luZyB5VmFscy5cbiAqL1xuRHlncmFwaENhbnZhc1JlbmRlcmVyLl9nZXRJdGVyYXRvclByZWRpY2F0ZSA9IGZ1bmN0aW9uKGNvbm5lY3RTZXBhcmF0ZWRQb2ludHMpIHtcbiAgcmV0dXJuIGNvbm5lY3RTZXBhcmF0ZWRQb2ludHMgP1xuICAgICAgRHlncmFwaENhbnZhc1JlbmRlcmVyLl9wcmVkaWNhdGVUaGF0U2tpcHNFbXB0eVBvaW50cyA6XG4gICAgICBudWxsO1xufTtcblxuRHlncmFwaENhbnZhc1JlbmRlcmVyLl9wcmVkaWNhdGVUaGF0U2tpcHNFbXB0eVBvaW50cyA9XG4gICAgZnVuY3Rpb24oYXJyYXksIGlkeCkge1xuICByZXR1cm4gYXJyYXlbaWR4XS55dmFsICE9PSBudWxsO1xufTtcblxuLyoqXG4gKiBEcmF3cyBhIGxpbmUgd2l0aCB0aGUgc3R5bGVzIHBhc3NlZCBpbiBhbmQgY2FsbHMgYWxsIHRoZSBkcmF3UG9pbnRDYWxsYmFja3MuXG4gKiBAcGFyYW0ge09iamVjdH0gZSBUaGUgZGljdGlvbmFyeSBwYXNzZWQgdG8gdGhlIHBsb3R0ZXIgZnVuY3Rpb24uXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoQ2FudmFzUmVuZGVyZXIuX2RyYXdTdHlsZWRMaW5lID0gZnVuY3Rpb24oZSxcbiAgICBjb2xvciwgc3Ryb2tlV2lkdGgsIHN0cm9rZVBhdHRlcm4sIGRyYXdQb2ludHMsXG4gICAgZHJhd1BvaW50Q2FsbGJhY2ssIHBvaW50U2l6ZSkge1xuICB2YXIgZyA9IGUuZHlncmFwaDtcbiAgLy8gVE9ETyhrb25pZ3NiZXJnKTogQ29tcHV0ZSBhdHRyaWJ1dGVzIG91dHNpZGUgdGhpcyBtZXRob2QgY2FsbC5cbiAgdmFyIHN0ZXBQbG90ID0gZy5nZXRCb29sZWFuT3B0aW9uKFwic3RlcFBsb3RcIiwgZS5zZXROYW1lKTtcblxuICBpZiAoIXV0aWxzLmlzQXJyYXlMaWtlKHN0cm9rZVBhdHRlcm4pKSB7XG4gICAgc3Ryb2tlUGF0dGVybiA9IG51bGw7XG4gIH1cblxuICB2YXIgZHJhd0dhcFBvaW50cyA9IGcuZ2V0Qm9vbGVhbk9wdGlvbignZHJhd0dhcEVkZ2VQb2ludHMnLCBlLnNldE5hbWUpO1xuXG4gIHZhciBwb2ludHMgPSBlLnBvaW50cztcbiAgdmFyIHNldE5hbWUgPSBlLnNldE5hbWU7XG4gIHZhciBpdGVyID0gdXRpbHMuY3JlYXRlSXRlcmF0b3IocG9pbnRzLCAwLCBwb2ludHMubGVuZ3RoLFxuICAgICAgRHlncmFwaENhbnZhc1JlbmRlcmVyLl9nZXRJdGVyYXRvclByZWRpY2F0ZShcbiAgICAgICAgICBnLmdldEJvb2xlYW5PcHRpb24oXCJjb25uZWN0U2VwYXJhdGVkUG9pbnRzXCIsIHNldE5hbWUpKSk7XG5cbiAgdmFyIHN0cm9raW5nID0gc3Ryb2tlUGF0dGVybiAmJiAoc3Ryb2tlUGF0dGVybi5sZW5ndGggPj0gMik7XG5cbiAgdmFyIGN0eCA9IGUuZHJhd2luZ0NvbnRleHQ7XG4gIGN0eC5zYXZlKCk7XG4gIGlmIChzdHJva2luZykge1xuICAgIGlmIChjdHguc2V0TGluZURhc2gpIGN0eC5zZXRMaW5lRGFzaChzdHJva2VQYXR0ZXJuKTtcbiAgfVxuXG4gIHZhciBwb2ludHNPbkxpbmUgPSBEeWdyYXBoQ2FudmFzUmVuZGVyZXIuX2RyYXdTZXJpZXMoXG4gICAgICBlLCBpdGVyLCBzdHJva2VXaWR0aCwgcG9pbnRTaXplLCBkcmF3UG9pbnRzLCBkcmF3R2FwUG9pbnRzLCBzdGVwUGxvdCwgY29sb3IpO1xuICBEeWdyYXBoQ2FudmFzUmVuZGVyZXIuX2RyYXdQb2ludHNPbkxpbmUoXG4gICAgICBlLCBwb2ludHNPbkxpbmUsIGRyYXdQb2ludENhbGxiYWNrLCBjb2xvciwgcG9pbnRTaXplKTtcblxuICBpZiAoc3Ryb2tpbmcpIHtcbiAgICBpZiAoY3R4LnNldExpbmVEYXNoKSBjdHguc2V0TGluZURhc2goW10pO1xuICB9XG5cbiAgY3R4LnJlc3RvcmUoKTtcbn07XG5cbi8qKlxuICogVGhpcyBkb2VzIHRoZSBhY3R1YWwgZHJhd2luZyBvZiBsaW5lcyBvbiB0aGUgY2FudmFzLCBmb3IganVzdCBvbmUgc2VyaWVzLlxuICogUmV0dXJucyBhIGxpc3Qgb2YgW2NhbnZhc3gsIGNhbnZhc3ldIHBhaXJzIGZvciBwb2ludHMgZm9yIHdoaWNoIGFcbiAqIGRyYXdQb2ludENhbGxiYWNrIHNob3VsZCBiZSBmaXJlZC4gIFRoZXNlIGluY2x1ZGUgaXNvbGF0ZWQgcG9pbnRzLCBvciBhbGxcbiAqIHBvaW50cyBpZiBkcmF3UG9pbnRzPXRydWUuXG4gKiBAcGFyYW0ge09iamVjdH0gZSBUaGUgZGljdGlvbmFyeSBwYXNzZWQgdG8gdGhlIHBsb3R0ZXIgZnVuY3Rpb24uXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoQ2FudmFzUmVuZGVyZXIuX2RyYXdTZXJpZXMgPSBmdW5jdGlvbihlLFxuICAgIGl0ZXIsIHN0cm9rZVdpZHRoLCBwb2ludFNpemUsIGRyYXdQb2ludHMsIGRyYXdHYXBQb2ludHMsIHN0ZXBQbG90LCBjb2xvcikge1xuXG4gIHZhciBwcmV2Q2FudmFzWCA9IG51bGw7XG4gIHZhciBwcmV2Q2FudmFzWSA9IG51bGw7XG4gIHZhciBuZXh0Q2FudmFzWSA9IG51bGw7XG4gIHZhciBpc0lzb2xhdGVkOyAvLyB0cnVlIGlmIHRoaXMgcG9pbnQgaXMgaXNvbGF0ZWQgKG5vIGxpbmUgc2VnbWVudHMpXG4gIHZhciBwb2ludDsgLy8gdGhlIHBvaW50IGJlaW5nIHByb2Nlc3NlZCBpbiB0aGUgd2hpbGUgbG9vcFxuICB2YXIgcG9pbnRzT25MaW5lID0gW107IC8vIEFycmF5IG9mIFtjYW52YXN4LCBjYW52YXN5XSBwYWlycy5cbiAgdmFyIGZpcnN0ID0gdHJ1ZTsgLy8gdGhlIGZpcnN0IGN5Y2xlIHRocm91Z2ggdGhlIHdoaWxlIGxvb3BcblxuICB2YXIgY3R4ID0gZS5kcmF3aW5nQ29udGV4dDtcbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHguc3Ryb2tlU3R5bGUgPSBjb2xvcjtcbiAgY3R4LmxpbmVXaWR0aCA9IHN0cm9rZVdpZHRoO1xuXG4gIC8vIE5PVEU6IHdlIGJyZWFrIHRoZSBpdGVyYXRvcidzIGVuY2Fwc3VsYXRpb24gaGVyZSBmb3IgYWJvdXQgYSAyNSUgc3BlZWR1cC5cbiAgdmFyIGFyciA9IGl0ZXIuYXJyYXlfO1xuICB2YXIgbGltaXQgPSBpdGVyLmVuZF87XG4gIHZhciBwcmVkaWNhdGUgPSBpdGVyLnByZWRpY2F0ZV87XG5cbiAgZm9yICh2YXIgaSA9IGl0ZXIuc3RhcnRfOyBpIDwgbGltaXQ7IGkrKykge1xuICAgIHBvaW50ID0gYXJyW2ldO1xuICAgIGlmIChwcmVkaWNhdGUpIHtcbiAgICAgIHdoaWxlIChpIDwgbGltaXQgJiYgIXByZWRpY2F0ZShhcnIsIGkpKSB7XG4gICAgICAgIGkrKztcbiAgICAgIH1cbiAgICAgIGlmIChpID09IGxpbWl0KSBicmVhaztcbiAgICAgIHBvaW50ID0gYXJyW2ldO1xuICAgIH1cblxuICAgIC8vIEZJWE1FOiBUaGUgJ2NhbnZhc3kgIT0gY2FudmFzeScgdGVzdCBoZXJlIGNhdGNoZXMgTmFOIHZhbHVlcyBidXQgdGhlIHRlc3RcbiAgICAvLyBkb2Vzbid0IGNhdGNoIEluZmluaXR5IHZhbHVlcy4gQ291bGQgY2hhbmdlIHRoaXMgdG9cbiAgICAvLyAhaXNGaW5pdGUocG9pbnQuY2FudmFzeSksIGJ1dCBJIGFzc3VtZSBpdCBhdm9pZHMgaXNOYU4gZm9yIHBlcmZvcm1hbmNlP1xuICAgIGlmIChwb2ludC5jYW52YXN5ID09PSBudWxsIHx8IHBvaW50LmNhbnZhc3kgIT0gcG9pbnQuY2FudmFzeSkge1xuICAgICAgaWYgKHN0ZXBQbG90ICYmIHByZXZDYW52YXNYICE9PSBudWxsKSB7XG4gICAgICAgIC8vIERyYXcgYSBob3Jpem9udGFsIGxpbmUgdG8gdGhlIHN0YXJ0IG9mIHRoZSBtaXNzaW5nIGRhdGFcbiAgICAgICAgY3R4Lm1vdmVUbyhwcmV2Q2FudmFzWCwgcHJldkNhbnZhc1kpO1xuICAgICAgICBjdHgubGluZVRvKHBvaW50LmNhbnZhc3gsIHByZXZDYW52YXNZKTtcbiAgICAgIH1cbiAgICAgIHByZXZDYW52YXNYID0gcHJldkNhbnZhc1kgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICBpc0lzb2xhdGVkID0gZmFsc2U7XG4gICAgICBpZiAoZHJhd0dhcFBvaW50cyB8fCBwcmV2Q2FudmFzWCA9PT0gbnVsbCkge1xuICAgICAgICBpdGVyLm5leHRJZHhfID0gaTtcbiAgICAgICAgaXRlci5uZXh0KCk7XG4gICAgICAgIG5leHRDYW52YXNZID0gaXRlci5oYXNOZXh0ID8gaXRlci5wZWVrLmNhbnZhc3kgOiBudWxsO1xuXG4gICAgICAgIHZhciBpc05leHRDYW52YXNZTnVsbE9yTmFOID0gbmV4dENhbnZhc1kgPT09IG51bGwgfHxcbiAgICAgICAgICAgIG5leHRDYW52YXNZICE9IG5leHRDYW52YXNZO1xuICAgICAgICBpc0lzb2xhdGVkID0gKHByZXZDYW52YXNYID09PSBudWxsICYmIGlzTmV4dENhbnZhc1lOdWxsT3JOYU4pO1xuICAgICAgICBpZiAoZHJhd0dhcFBvaW50cykge1xuICAgICAgICAgIC8vIEFsc28gY29uc2lkZXIgYSBwb2ludCB0byBiZSBcImlzb2xhdGVkXCIgaWYgaXQncyBhZGphY2VudCB0byBhXG4gICAgICAgICAgLy8gbnVsbCBwb2ludCwgZXhjbHVkaW5nIHRoZSBncmFwaCBlZGdlcy5cbiAgICAgICAgICBpZiAoKCFmaXJzdCAmJiBwcmV2Q2FudmFzWCA9PT0gbnVsbCkgfHxcbiAgICAgICAgICAgICAgKGl0ZXIuaGFzTmV4dCAmJiBpc05leHRDYW52YXNZTnVsbE9yTmFOKSkge1xuICAgICAgICAgICAgaXNJc29sYXRlZCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChwcmV2Q2FudmFzWCAhPT0gbnVsbCkge1xuICAgICAgICBpZiAoc3Ryb2tlV2lkdGgpIHtcbiAgICAgICAgICBpZiAoc3RlcFBsb3QpIHtcbiAgICAgICAgICAgIGN0eC5tb3ZlVG8ocHJldkNhbnZhc1gsIHByZXZDYW52YXNZKTtcbiAgICAgICAgICAgIGN0eC5saW5lVG8ocG9pbnQuY2FudmFzeCwgcHJldkNhbnZhc1kpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGN0eC5saW5lVG8ocG9pbnQuY2FudmFzeCwgcG9pbnQuY2FudmFzeSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN0eC5tb3ZlVG8ocG9pbnQuY2FudmFzeCwgcG9pbnQuY2FudmFzeSk7XG4gICAgICB9XG4gICAgICBpZiAoZHJhd1BvaW50cyB8fCBpc0lzb2xhdGVkKSB7XG4gICAgICAgIHBvaW50c09uTGluZS5wdXNoKFtwb2ludC5jYW52YXN4LCBwb2ludC5jYW52YXN5LCBwb2ludC5pZHhdKTtcbiAgICAgIH1cbiAgICAgIHByZXZDYW52YXNYID0gcG9pbnQuY2FudmFzeDtcbiAgICAgIHByZXZDYW52YXNZID0gcG9pbnQuY2FudmFzeTtcbiAgICB9XG4gICAgZmlyc3QgPSBmYWxzZTtcbiAgfVxuICBjdHguc3Ryb2tlKCk7XG4gIHJldHVybiBwb2ludHNPbkxpbmU7XG59O1xuXG4vKipcbiAqIFRoaXMgZmlyZXMgdGhlIGRyYXdQb2ludENhbGxiYWNrIGZ1bmN0aW9ucywgd2hpY2ggZHJhdyBkb3RzIG9uIHRoZSBwb2ludHMgYnlcbiAqIGRlZmF1bHQuIFRoaXMgZ2V0cyB1c2VkIHdoZW4gdGhlIFwiZHJhd1BvaW50c1wiIG9wdGlvbiBpcyBzZXQsIG9yIHdoZW4gdGhlcmVcbiAqIGFyZSBpc29sYXRlZCBwb2ludHMuXG4gKiBAcGFyYW0ge09iamVjdH0gZSBUaGUgZGljdGlvbmFyeSBwYXNzZWQgdG8gdGhlIHBsb3R0ZXIgZnVuY3Rpb24uXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoQ2FudmFzUmVuZGVyZXIuX2RyYXdQb2ludHNPbkxpbmUgPSBmdW5jdGlvbihcbiAgICBlLCBwb2ludHNPbkxpbmUsIGRyYXdQb2ludENhbGxiYWNrLCBjb2xvciwgcG9pbnRTaXplKSB7XG4gIHZhciBjdHggPSBlLmRyYXdpbmdDb250ZXh0O1xuICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBwb2ludHNPbkxpbmUubGVuZ3RoOyBpZHgrKykge1xuICAgIHZhciBjYiA9IHBvaW50c09uTGluZVtpZHhdO1xuICAgIGN0eC5zYXZlKCk7XG4gICAgZHJhd1BvaW50Q2FsbGJhY2suY2FsbChlLmR5Z3JhcGgsXG4gICAgICAgIGUuZHlncmFwaCwgZS5zZXROYW1lLCBjdHgsIGNiWzBdLCBjYlsxXSwgY29sb3IsIHBvaW50U2l6ZSwgY2JbMl0pO1xuICAgIGN0eC5yZXN0b3JlKCk7XG4gIH1cbn07XG5cbi8qKlxuICogQXR0YWNoZXMgY2FudmFzIGNvb3JkaW5hdGVzIHRvIHRoZSBwb2ludHMgYXJyYXkuXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLl91cGRhdGVQb2ludHMgPSBmdW5jdGlvbigpIHtcbiAgLy8gVXBkYXRlIFBvaW50c1xuICAvLyBUT0RPKGRhbnZrKTogaGVyZVxuICAvL1xuICAvLyBUT0RPKGJocyk6IHRoaXMgbG9vcCBpcyBhIGhvdC1zcG90IGZvciBoaWdoLXBvaW50LWNvdW50IGNoYXJ0cy4gVGhlc2VcbiAgLy8gdHJhbnNmb3JtYXRpb25zIGNhbiBiZSBwdXNoZWQgaW50byB0aGUgY2FudmFzIHZpYSBsaW5lYXIgdHJhbnNmb3JtYXRpb25cbiAgLy8gbWF0cmljZXMuXG4gIC8vIE5PVEUoZGFudmspOiB0aGlzIGlzIHRyaWNraWVyIHRoYW4gaXQgc291bmRzIGF0IGZpcnN0LiBUaGUgdHJhbnNmb3JtYXRpb25cbiAgLy8gbmVlZHMgdG8gYmUgZG9uZSBiZWZvcmUgdGhlIC5tb3ZlVG8oKSBhbmQgLmxpbmVUbygpIGNhbGxzLCBidXQgbXVzdCBiZVxuICAvLyB1bmRvbmUgYmVmb3JlIHRoZSAuc3Ryb2tlKCkgY2FsbCB0byBlbnN1cmUgdGhhdCB0aGUgc3Ryb2tlIHdpZHRoIGlzXG4gIC8vIHVuYWZmZWN0ZWQuICBBbiBhbHRlcm5hdGl2ZSBpcyB0byByZWR1Y2UgdGhlIHN0cm9rZSB3aWR0aCBpbiB0aGVcbiAgLy8gdHJhbnNmb3JtZWQgY29vcmRpbmF0ZSBzcGFjZSwgYnV0IHlvdSBjYW4ndCBzcGVjaWZ5IGRpZmZlcmVudCB2YWx1ZXMgZm9yXG4gIC8vIGVhY2ggZGltZW5zaW9uIChhcyB5b3UgY2FuIHdpdGggLnNjYWxlKCkpLiBUaGUgc3BlZWR1cCBoZXJlIGlzIH4xMiUuXG4gIHZhciBzZXRzID0gdGhpcy5sYXlvdXQucG9pbnRzO1xuICBmb3IgKHZhciBpID0gc2V0cy5sZW5ndGg7IGktLTspIHtcbiAgICB2YXIgcG9pbnRzID0gc2V0c1tpXTtcbiAgICBmb3IgKHZhciBqID0gcG9pbnRzLmxlbmd0aDsgai0tOykge1xuICAgICAgdmFyIHBvaW50ID0gcG9pbnRzW2pdO1xuICAgICAgcG9pbnQuY2FudmFzeCA9IHRoaXMuYXJlYS53ICogcG9pbnQueCArIHRoaXMuYXJlYS54O1xuICAgICAgcG9pbnQuY2FudmFzeSA9IHRoaXMuYXJlYS5oICogcG9pbnQueSArIHRoaXMuYXJlYS55O1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBBZGQgY2FudmFzIEFjdHVhbGx5IGRyYXcgdGhlIGxpbmVzIGNoYXJ0LCBpbmNsdWRpbmcgaGlnaC9sb3cgYmFuZHMuXG4gKlxuICogVGhpcyBmdW5jdGlvbiBjYW4gb25seSBiZSBjYWxsZWQgaWYgRHlncmFwaExheW91dCdzIHBvaW50cyBhcnJheSBoYXMgYmVlblxuICogdXBkYXRlZCB3aXRoIGNhbnZhc3t4LHl9IGF0dHJpYnV0ZXMsIGkuZS4gYnlcbiAqIER5Z3JhcGhDYW52YXNSZW5kZXJlci5fdXBkYXRlUG9pbnRzLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X3Nlcmllc05hbWUgd2hlbiBzcGVjaWZpZWQsIG9ubHkgdGhhdCBzZXJpZXMgd2lsbFxuICogICAgIGJlIGRyYXduLiAoVGhpcyBpcyB1c2VkIGZvciBleHBlZGl0ZWQgcmVkcmF3aW5nIHdpdGggaGlnaGxpZ2h0U2VyaWVzT3B0cylcbiAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBvcHRfY3R4IHdoZW4gc3BlY2lmaWVkLCB0aGUgZHJhd2luZ1xuICogICAgIGNvbnRleHQuICBIb3dldmVyLCBsaW5lcyBhcmUgdHlwaWNhbGx5IGRyYXduIG9uIHRoZSBvYmplY3Qnc1xuICogICAgIGVsZW1lbnRDb250ZXh0LlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaENhbnZhc1JlbmRlcmVyLnByb3RvdHlwZS5fcmVuZGVyTGluZUNoYXJ0ID0gZnVuY3Rpb24ob3B0X3Nlcmllc05hbWUsIG9wdF9jdHgpIHtcbiAgdmFyIGN0eCA9IG9wdF9jdHggfHwgdGhpcy5lbGVtZW50Q29udGV4dDtcbiAgdmFyIGk7XG5cbiAgdmFyIHNldHMgPSB0aGlzLmxheW91dC5wb2ludHM7XG4gIHZhciBzZXROYW1lcyA9IHRoaXMubGF5b3V0LnNldE5hbWVzO1xuICB2YXIgc2V0TmFtZTtcblxuICB0aGlzLmNvbG9ycyA9IHRoaXMuZHlncmFwaF8uY29sb3JzTWFwXztcblxuICAvLyBEZXRlcm1pbmUgd2hpY2ggc2VyaWVzIGhhdmUgc3BlY2lhbGl6ZWQgcGxvdHRlcnMuXG4gIHZhciBwbG90dGVyX2F0dHIgPSB0aGlzLmR5Z3JhcGhfLmdldE9wdGlvbihcInBsb3R0ZXJcIik7XG4gIHZhciBwbG90dGVycyA9IHBsb3R0ZXJfYXR0cjtcbiAgaWYgKCF1dGlscy5pc0FycmF5TGlrZShwbG90dGVycykpIHtcbiAgICBwbG90dGVycyA9IFtwbG90dGVyc107XG4gIH1cblxuICB2YXIgc2V0UGxvdHRlcnMgPSB7fTsgIC8vIHNlcmllcyBuYW1lIC0+IHBsb3R0ZXIgZm4uXG4gIGZvciAoaSA9IDA7IGkgPCBzZXROYW1lcy5sZW5ndGg7IGkrKykge1xuICAgIHNldE5hbWUgPSBzZXROYW1lc1tpXTtcbiAgICB2YXIgc2V0UGxvdHRlciA9IHRoaXMuZHlncmFwaF8uZ2V0T3B0aW9uKFwicGxvdHRlclwiLCBzZXROYW1lKTtcbiAgICBpZiAoc2V0UGxvdHRlciA9PSBwbG90dGVyX2F0dHIpIGNvbnRpbnVlOyAgLy8gbm90IHNwZWNpYWxpemVkLlxuXG4gICAgc2V0UGxvdHRlcnNbc2V0TmFtZV0gPSBzZXRQbG90dGVyO1xuICB9XG5cbiAgZm9yIChpID0gMDsgaSA8IHBsb3R0ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHBsb3R0ZXIgPSBwbG90dGVyc1tpXTtcbiAgICB2YXIgaXNfbGFzdCA9IChpID09IHBsb3R0ZXJzLmxlbmd0aCAtIDEpO1xuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBzZXRzLmxlbmd0aDsgaisrKSB7XG4gICAgICBzZXROYW1lID0gc2V0TmFtZXNbal07XG4gICAgICBpZiAob3B0X3Nlcmllc05hbWUgJiYgc2V0TmFtZSAhPSBvcHRfc2VyaWVzTmFtZSkgY29udGludWU7XG5cbiAgICAgIHZhciBwb2ludHMgPSBzZXRzW2pdO1xuXG4gICAgICAvLyBPbmx5IHRocm93IGluIHRoZSBzcGVjaWFsaXplZCBwbG90dGVycyBvbiB0aGUgbGFzdCBpdGVyYXRpb24uXG4gICAgICB2YXIgcCA9IHBsb3R0ZXI7XG4gICAgICBpZiAoc2V0TmFtZSBpbiBzZXRQbG90dGVycykge1xuICAgICAgICBpZiAoaXNfbGFzdCkge1xuICAgICAgICAgIHAgPSBzZXRQbG90dGVyc1tzZXROYW1lXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBEb24ndCB1c2UgdGhlIHN0YW5kYXJkIHBsb3R0ZXJzIGluIHRoaXMgY2FzZS5cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgY29sb3IgPSB0aGlzLmNvbG9yc1tzZXROYW1lXTtcbiAgICAgIHZhciBzdHJva2VXaWR0aCA9IHRoaXMuZHlncmFwaF8uZ2V0T3B0aW9uKFwic3Ryb2tlV2lkdGhcIiwgc2V0TmFtZSk7XG5cbiAgICAgIGN0eC5zYXZlKCk7XG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSBjb2xvcjtcbiAgICAgIGN0eC5saW5lV2lkdGggPSBzdHJva2VXaWR0aDtcbiAgICAgIHAoe1xuICAgICAgICBwb2ludHM6IHBvaW50cyxcbiAgICAgICAgc2V0TmFtZTogc2V0TmFtZSxcbiAgICAgICAgZHJhd2luZ0NvbnRleHQ6IGN0eCxcbiAgICAgICAgY29sb3I6IGNvbG9yLFxuICAgICAgICBzdHJva2VXaWR0aDogc3Ryb2tlV2lkdGgsXG4gICAgICAgIGR5Z3JhcGg6IHRoaXMuZHlncmFwaF8sXG4gICAgICAgIGF4aXM6IHRoaXMuZHlncmFwaF8uYXhpc1Byb3BlcnRpZXNGb3JTZXJpZXMoc2V0TmFtZSksXG4gICAgICAgIHBsb3RBcmVhOiB0aGlzLmFyZWEsXG4gICAgICAgIHNlcmllc0luZGV4OiBqLFxuICAgICAgICBzZXJpZXNDb3VudDogc2V0cy5sZW5ndGgsXG4gICAgICAgIHNpbmdsZVNlcmllc05hbWU6IG9wdF9zZXJpZXNOYW1lLFxuICAgICAgICBhbGxTZXJpZXNQb2ludHM6IHNldHNcbiAgICAgIH0pO1xuICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogU3RhbmRhcmQgcGxvdHRlcnMuIFRoZXNlIG1heSBiZSB1c2VkIGJ5IGNsaWVudHMgdmlhIER5Z3JhcGguUGxvdHRlcnMuXG4gKiBTZWUgY29tbWVudHMgdGhlcmUgZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuRHlncmFwaENhbnZhc1JlbmRlcmVyLl9QbG90dGVycyA9IHtcbiAgbGluZVBsb3R0ZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICBEeWdyYXBoQ2FudmFzUmVuZGVyZXIuX2xpbmVQbG90dGVyKGUpO1xuICB9LFxuXG4gIGZpbGxQbG90dGVyOiBmdW5jdGlvbihlKSB7XG4gICAgRHlncmFwaENhbnZhc1JlbmRlcmVyLl9maWxsUGxvdHRlcihlKTtcbiAgfSxcblxuICBlcnJvclBsb3R0ZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICBEeWdyYXBoQ2FudmFzUmVuZGVyZXIuX2Vycm9yUGxvdHRlcihlKTtcbiAgfVxufTtcblxuLyoqXG4gKiBQbG90dGVyIHdoaWNoIGRyYXdzIHRoZSBjZW50cmFsIGxpbmVzIGZvciBhIHNlcmllcy5cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGhDYW52YXNSZW5kZXJlci5fbGluZVBsb3R0ZXIgPSBmdW5jdGlvbihlKSB7XG4gIHZhciBnID0gZS5keWdyYXBoO1xuICB2YXIgc2V0TmFtZSA9IGUuc2V0TmFtZTtcbiAgdmFyIHN0cm9rZVdpZHRoID0gZS5zdHJva2VXaWR0aDtcblxuICAvLyBUT0RPKGRhbnZrKTogQ2hlY2sgaWYgdGhlcmUncyBhbnkgcGVyZm9ybWFuY2UgaW1wYWN0IG9mIGp1c3QgY2FsbGluZ1xuICAvLyBnZXRPcHRpb24oKSBpbnNpZGUgb2YgX2RyYXdTdHlsZWRMaW5lLiBQYXNzaW5nIGluIHNvIG1hbnkgcGFyYW1ldGVycyBtYWtlc1xuICAvLyB0aGlzIGNvZGUgYSBiaXQgbmFzdHkuXG4gIHZhciBib3JkZXJXaWR0aCA9IGcuZ2V0TnVtZXJpY09wdGlvbihcInN0cm9rZUJvcmRlcldpZHRoXCIsIHNldE5hbWUpO1xuICB2YXIgZHJhd1BvaW50Q2FsbGJhY2sgPSBnLmdldE9wdGlvbihcImRyYXdQb2ludENhbGxiYWNrXCIsIHNldE5hbWUpIHx8XG4gICAgICB1dGlscy5DaXJjbGVzLkRFRkFVTFQ7XG4gIHZhciBzdHJva2VQYXR0ZXJuID0gZy5nZXRPcHRpb24oXCJzdHJva2VQYXR0ZXJuXCIsIHNldE5hbWUpO1xuICB2YXIgZHJhd1BvaW50cyA9IGcuZ2V0Qm9vbGVhbk9wdGlvbihcImRyYXdQb2ludHNcIiwgc2V0TmFtZSk7XG4gIHZhciBwb2ludFNpemUgPSBnLmdldE51bWVyaWNPcHRpb24oXCJwb2ludFNpemVcIiwgc2V0TmFtZSk7XG5cbiAgaWYgKGJvcmRlcldpZHRoICYmIHN0cm9rZVdpZHRoKSB7XG4gICAgRHlncmFwaENhbnZhc1JlbmRlcmVyLl9kcmF3U3R5bGVkTGluZShlLFxuICAgICAgICBnLmdldE9wdGlvbihcInN0cm9rZUJvcmRlckNvbG9yXCIsIHNldE5hbWUpLFxuICAgICAgICBzdHJva2VXaWR0aCArIDIgKiBib3JkZXJXaWR0aCxcbiAgICAgICAgc3Ryb2tlUGF0dGVybixcbiAgICAgICAgZHJhd1BvaW50cyxcbiAgICAgICAgZHJhd1BvaW50Q2FsbGJhY2ssXG4gICAgICAgIHBvaW50U2l6ZVxuICAgICAgICApO1xuICB9XG5cbiAgRHlncmFwaENhbnZhc1JlbmRlcmVyLl9kcmF3U3R5bGVkTGluZShlLFxuICAgICAgZS5jb2xvcixcbiAgICAgIHN0cm9rZVdpZHRoLFxuICAgICAgc3Ryb2tlUGF0dGVybixcbiAgICAgIGRyYXdQb2ludHMsXG4gICAgICBkcmF3UG9pbnRDYWxsYmFjayxcbiAgICAgIHBvaW50U2l6ZVxuICApO1xufTtcblxuLyoqXG4gKiBEcmF3cyB0aGUgc2hhZGVkIGhpZ2gvbG93IGJhbmRzIChjb25maWRlbmNlIGludGVydmFscykgZm9yIGVhY2ggc2VyaWVzLlxuICogVGhpcyBoYXBwZW5zIGJlZm9yZSB0aGUgY2VudGVyIGxpbmVzIGFyZSBkcmF3biwgc2luY2UgdGhlIGNlbnRlciBsaW5lc1xuICogbmVlZCB0byBiZSBkcmF3biBvbiB0b3Agb2YgdGhlIGhpZ2gvbG93IGJhbmRzIGZvciBhbGwgc2VyaWVzLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaENhbnZhc1JlbmRlcmVyLl9lcnJvclBsb3R0ZXIgPSBmdW5jdGlvbihlKSB7XG4gIHZhciBnID0gZS5keWdyYXBoO1xuICB2YXIgc2V0TmFtZSA9IGUuc2V0TmFtZTtcbiAgdmFyIGVycm9yQmFycyA9IGcuZ2V0Qm9vbGVhbk9wdGlvbihcImVycm9yQmFyc1wiKSB8fFxuICAgICAgZy5nZXRCb29sZWFuT3B0aW9uKFwiY3VzdG9tQmFyc1wiKTtcbiAgaWYgKCFlcnJvckJhcnMpIHJldHVybjtcblxuICB2YXIgZmlsbEdyYXBoID0gZy5nZXRCb29sZWFuT3B0aW9uKFwiZmlsbEdyYXBoXCIsIHNldE5hbWUpO1xuICBpZiAoZmlsbEdyYXBoKSB7XG4gICAgY29uc29sZS53YXJuKFwiQ2FuJ3QgdXNlIGZpbGxHcmFwaCBvcHRpb24gd2l0aCBjdXN0b21CYXJzIG9yIGVycm9yQmFycyBvcHRpb25cIik7XG4gIH1cblxuICB2YXIgY3R4ID0gZS5kcmF3aW5nQ29udGV4dDtcbiAgdmFyIGNvbG9yID0gZS5jb2xvcjtcbiAgdmFyIGZpbGxBbHBoYSA9IGcuZ2V0TnVtZXJpY09wdGlvbignZmlsbEFscGhhJywgc2V0TmFtZSk7XG4gIHZhciBzdGVwUGxvdCA9IGcuZ2V0Qm9vbGVhbk9wdGlvbihcInN0ZXBQbG90XCIsIHNldE5hbWUpO1xuICB2YXIgcG9pbnRzID0gZS5wb2ludHM7XG5cbiAgdmFyIGl0ZXIgPSB1dGlscy5jcmVhdGVJdGVyYXRvcihwb2ludHMsIDAsIHBvaW50cy5sZW5ndGgsXG4gICAgICBEeWdyYXBoQ2FudmFzUmVuZGVyZXIuX2dldEl0ZXJhdG9yUHJlZGljYXRlKFxuICAgICAgICAgIGcuZ2V0Qm9vbGVhbk9wdGlvbihcImNvbm5lY3RTZXBhcmF0ZWRQb2ludHNcIiwgc2V0TmFtZSkpKTtcblxuICB2YXIgbmV3WXM7XG5cbiAgLy8gc2V0dXAgZ3JhcGhpY3MgY29udGV4dFxuICB2YXIgcHJldlggPSBOYU47XG4gIHZhciBwcmV2WSA9IE5hTjtcbiAgdmFyIHByZXZZcyA9IFstMSwgLTFdO1xuICAvLyBzaG91bGQgYmUgc2FtZSBjb2xvciBhcyB0aGUgbGluZXMgYnV0IG9ubHkgMTUlIG9wYXF1ZS5cbiAgdmFyIHJnYiA9IHV0aWxzLnRvUkdCXyhjb2xvcik7XG4gIHZhciBlcnJfY29sb3IgPVxuICAgICAgJ3JnYmEoJyArIHJnYi5yICsgJywnICsgcmdiLmcgKyAnLCcgKyByZ2IuYiArICcsJyArIGZpbGxBbHBoYSArICcpJztcbiAgY3R4LmZpbGxTdHlsZSA9IGVycl9jb2xvcjtcbiAgY3R4LmJlZ2luUGF0aCgpO1xuXG4gIHZhciBpc051bGxVbmRlZmluZWRPck5hTiA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gKHggPT09IG51bGwgfHxcbiAgICAgICAgICAgIHggPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgaXNOYU4oeCkpO1xuICB9O1xuXG4gIHdoaWxlIChpdGVyLmhhc05leHQpIHtcbiAgICB2YXIgcG9pbnQgPSBpdGVyLm5leHQoKTtcbiAgICBpZiAoKCFzdGVwUGxvdCAmJiBpc051bGxVbmRlZmluZWRPck5hTihwb2ludC55KSkgfHxcbiAgICAgICAgKHN0ZXBQbG90ICYmICFpc05hTihwcmV2WSkgJiYgaXNOdWxsVW5kZWZpbmVkT3JOYU4ocHJldlkpKSkge1xuICAgICAgcHJldlggPSBOYU47XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBuZXdZcyA9IFsgcG9pbnQueV9ib3R0b20sIHBvaW50LnlfdG9wIF07XG4gICAgaWYgKHN0ZXBQbG90KSB7XG4gICAgICBwcmV2WSA9IHBvaW50Lnk7XG4gICAgfVxuXG4gICAgLy8gVGhlIGRvY3VtZW50YXRpb24gc3BlY2lmaWNhbGx5IGRpc2FsbG93cyBudWxscyBpbnNpZGUgdGhlIHBvaW50IGFycmF5cyxcbiAgICAvLyBidXQgaW4gY2FzZSBpdCBoYXBwZW5zIHdlIHNob3VsZCBkbyBzb21ldGhpbmcgc2Vuc2libGUuXG4gICAgaWYgKGlzTmFOKG5ld1lzWzBdKSkgbmV3WXNbMF0gPSBwb2ludC55O1xuICAgIGlmIChpc05hTihuZXdZc1sxXSkpIG5ld1lzWzFdID0gcG9pbnQueTtcblxuICAgIG5ld1lzWzBdID0gZS5wbG90QXJlYS5oICogbmV3WXNbMF0gKyBlLnBsb3RBcmVhLnk7XG4gICAgbmV3WXNbMV0gPSBlLnBsb3RBcmVhLmggKiBuZXdZc1sxXSArIGUucGxvdEFyZWEueTtcbiAgICBpZiAoIWlzTmFOKHByZXZYKSkge1xuICAgICAgaWYgKHN0ZXBQbG90KSB7XG4gICAgICAgIGN0eC5tb3ZlVG8ocHJldlgsIHByZXZZc1swXSk7XG4gICAgICAgIGN0eC5saW5lVG8ocG9pbnQuY2FudmFzeCwgcHJldllzWzBdKTtcbiAgICAgICAgY3R4LmxpbmVUbyhwb2ludC5jYW52YXN4LCBwcmV2WXNbMV0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3R4Lm1vdmVUbyhwcmV2WCwgcHJldllzWzBdKTtcbiAgICAgICAgY3R4LmxpbmVUbyhwb2ludC5jYW52YXN4LCBuZXdZc1swXSk7XG4gICAgICAgIGN0eC5saW5lVG8ocG9pbnQuY2FudmFzeCwgbmV3WXNbMV0pO1xuICAgICAgfVxuICAgICAgY3R4LmxpbmVUbyhwcmV2WCwgcHJldllzWzFdKTtcbiAgICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICB9XG4gICAgcHJldllzID0gbmV3WXM7XG4gICAgcHJldlggPSBwb2ludC5jYW52YXN4O1xuICB9XG4gIGN0eC5maWxsKCk7XG59O1xuXG4vKipcbiAqIFByb3h5IGZvciBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgd2hpY2ggZHJvcHMgbW92ZVRvL2xpbmVUbyBjYWxscyB3aGljaCBhcmVcbiAqIHN1cGVyZmx1b3VzLiBJdCBhY2N1bXVsYXRlcyBhbGwgbW92ZW1lbnRzIHdoaWNoIGhhdmVuJ3QgY2hhbmdlZCB0aGUgeC12YWx1ZVxuICogYW5kIG9ubHkgYXBwbGllcyB0aGUgdHdvIHdpdGggdGhlIG1vc3QgZXh0cmVtZSB5LXZhbHVlcy5cbiAqXG4gKiBDYWxscyB0byBsaW5lVG8vbW92ZVRvIG11c3QgaGF2ZSBub24tZGVjcmVhc2luZyB4LXZhbHVlcy5cbiAqL1xuRHlncmFwaENhbnZhc1JlbmRlcmVyLl9mYXN0Q2FudmFzUHJveHkgPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gIHZhciBwZW5kaW5nQWN0aW9ucyA9IFtdOyAgLy8gYXJyYXkgb2YgW3R5cGUsIHgsIHldIHR1cGxlc1xuICB2YXIgbGFzdFJvdW5kZWRYID0gbnVsbDtcbiAgdmFyIGxhc3RGbHVzaGVkWCA9IG51bGw7XG5cbiAgdmFyIExJTkVfVE8gPSAxLFxuICAgICAgTU9WRV9UTyA9IDI7XG5cbiAgdmFyIGFjdGlvbkNvdW50ID0gMDsgIC8vIG51bWJlciBvZiBtb3ZlVG9zIGFuZCBsaW5lVG9zIHBhc3NlZCB0byBjb250ZXh0LlxuXG4gIC8vIERyb3Agc3VwZXJmbHVvdXMgbW90aW9uc1xuICAvLyBBc3N1bWVzIGFsbCBwZW5kaW5nQWN0aW9ucyBoYXZlIHRoZSBzYW1lIChyb3VuZGVkKSB4LXZhbHVlLlxuICB2YXIgY29tcHJlc3NBY3Rpb25zID0gZnVuY3Rpb24ob3B0X2xvc3NsZXNzT25seSkge1xuICAgIGlmIChwZW5kaW5nQWN0aW9ucy5sZW5ndGggPD0gMSkgcmV0dXJuO1xuXG4gICAgLy8gTG9zc2xlc3MgY29tcHJlc3Npb246IGRyb3AgaW5jb25zZXF1ZW50aWFsIG1vdmVUb3MuXG4gICAgZm9yICh2YXIgaSA9IHBlbmRpbmdBY3Rpb25zLmxlbmd0aCAtIDE7IGkgPiAwOyBpLS0pIHtcbiAgICAgIHZhciBhY3Rpb24gPSBwZW5kaW5nQWN0aW9uc1tpXTtcbiAgICAgIGlmIChhY3Rpb25bMF0gPT0gTU9WRV9UTykge1xuICAgICAgICB2YXIgcHJldkFjdGlvbiA9IHBlbmRpbmdBY3Rpb25zW2kgLSAxXTtcbiAgICAgICAgaWYgKHByZXZBY3Rpb25bMV0gPT0gYWN0aW9uWzFdICYmIHByZXZBY3Rpb25bMl0gPT0gYWN0aW9uWzJdKSB7XG4gICAgICAgICAgcGVuZGluZ0FjdGlvbnMuc3BsaWNlKGksIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTG9zc2xlc3MgY29tcHJlc3Npb246IC4uLiBkcm9wIGNvbnNlY3V0aXZlIG1vdmVUb3MgLi4uXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwZW5kaW5nQWN0aW9ucy5sZW5ndGggLSAxOyAvKiBpbmNyZW1lbnRlZCBpbnRlcm5hbGx5ICovKSB7XG4gICAgICB2YXIgYWN0aW9uID0gcGVuZGluZ0FjdGlvbnNbaV07XG4gICAgICBpZiAoYWN0aW9uWzBdID09IE1PVkVfVE8gJiYgcGVuZGluZ0FjdGlvbnNbaSArIDFdWzBdID09IE1PVkVfVE8pIHtcbiAgICAgICAgcGVuZGluZ0FjdGlvbnMuc3BsaWNlKGksIDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaSsrO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIExvc3N5IGNvbXByZXNzaW9uOiAuLi4gZHJvcCBhbGwgYnV0IHRoZSBleHRyZW1lIHktdmFsdWVzIC4uLlxuICAgIGlmIChwZW5kaW5nQWN0aW9ucy5sZW5ndGggPiAyICYmICFvcHRfbG9zc2xlc3NPbmx5KSB7XG4gICAgICAvLyBrZWVwIGFuIGluaXRpYWwgbW92ZVRvLCBidXQgZHJvcCBhbGwgb3RoZXJzLlxuICAgICAgdmFyIHN0YXJ0SWR4ID0gMDtcbiAgICAgIGlmIChwZW5kaW5nQWN0aW9uc1swXVswXSA9PSBNT1ZFX1RPKSBzdGFydElkeCsrO1xuICAgICAgdmFyIG1pbklkeCA9IG51bGwsIG1heElkeCA9IG51bGw7XG4gICAgICBmb3IgKHZhciBpID0gc3RhcnRJZHg7IGkgPCBwZW5kaW5nQWN0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYWN0aW9uID0gcGVuZGluZ0FjdGlvbnNbaV07XG4gICAgICAgIGlmIChhY3Rpb25bMF0gIT0gTElORV9UTykgY29udGludWU7XG4gICAgICAgIGlmIChtaW5JZHggPT09IG51bGwgJiYgbWF4SWR4ID09PSBudWxsKSB7XG4gICAgICAgICAgbWluSWR4ID0gaTtcbiAgICAgICAgICBtYXhJZHggPSBpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciB5ID0gYWN0aW9uWzJdO1xuICAgICAgICAgIGlmICh5IDwgcGVuZGluZ0FjdGlvbnNbbWluSWR4XVsyXSkge1xuICAgICAgICAgICAgbWluSWR4ID0gaTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHkgPiBwZW5kaW5nQWN0aW9uc1ttYXhJZHhdWzJdKSB7XG4gICAgICAgICAgICBtYXhJZHggPSBpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIG1pbkFjdGlvbiA9IHBlbmRpbmdBY3Rpb25zW21pbklkeF0sXG4gICAgICAgICAgbWF4QWN0aW9uID0gcGVuZGluZ0FjdGlvbnNbbWF4SWR4XTtcbiAgICAgIHBlbmRpbmdBY3Rpb25zLnNwbGljZShzdGFydElkeCwgcGVuZGluZ0FjdGlvbnMubGVuZ3RoIC0gc3RhcnRJZHgpO1xuICAgICAgaWYgKG1pbklkeCA8IG1heElkeCkge1xuICAgICAgICBwZW5kaW5nQWN0aW9ucy5wdXNoKG1pbkFjdGlvbik7XG4gICAgICAgIHBlbmRpbmdBY3Rpb25zLnB1c2gobWF4QWN0aW9uKTtcbiAgICAgIH0gZWxzZSBpZiAobWluSWR4ID4gbWF4SWR4KSB7XG4gICAgICAgIHBlbmRpbmdBY3Rpb25zLnB1c2gobWF4QWN0aW9uKTtcbiAgICAgICAgcGVuZGluZ0FjdGlvbnMucHVzaChtaW5BY3Rpb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGVuZGluZ0FjdGlvbnMucHVzaChtaW5BY3Rpb24pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICB2YXIgZmx1c2hBY3Rpb25zID0gZnVuY3Rpb24ob3B0X25vTG9zc3lDb21wcmVzc2lvbikge1xuICAgIGNvbXByZXNzQWN0aW9ucyhvcHRfbm9Mb3NzeUNvbXByZXNzaW9uKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGVuZGluZ0FjdGlvbnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHZhciBhY3Rpb24gPSBwZW5kaW5nQWN0aW9uc1tpXTtcbiAgICAgIGlmIChhY3Rpb25bMF0gPT0gTElORV9UTykge1xuICAgICAgICBjb250ZXh0LmxpbmVUbyhhY3Rpb25bMV0sIGFjdGlvblsyXSk7XG4gICAgICB9IGVsc2UgaWYgKGFjdGlvblswXSA9PSBNT1ZFX1RPKSB7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKGFjdGlvblsxXSwgYWN0aW9uWzJdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHBlbmRpbmdBY3Rpb25zLmxlbmd0aCkge1xuICAgICAgbGFzdEZsdXNoZWRYID0gcGVuZGluZ0FjdGlvbnNbcGVuZGluZ0FjdGlvbnMubGVuZ3RoIC0gMV1bMV07XG4gICAgfVxuICAgIGFjdGlvbkNvdW50ICs9IHBlbmRpbmdBY3Rpb25zLmxlbmd0aDtcbiAgICBwZW5kaW5nQWN0aW9ucyA9IFtdO1xuICB9O1xuXG4gIHZhciBhZGRBY3Rpb24gPSBmdW5jdGlvbihhY3Rpb24sIHgsIHkpIHtcbiAgICB2YXIgcnggPSBNYXRoLnJvdW5kKHgpO1xuICAgIGlmIChsYXN0Um91bmRlZFggPT09IG51bGwgfHwgcnggIT0gbGFzdFJvdW5kZWRYKSB7XG4gICAgICAvLyBpZiB0aGVyZSBhcmUgbGFyZ2UgZ2FwcyBvbiB0aGUgeC1heGlzLCBpdCdzIGVzc2VudGlhbCB0byBrZWVwIHRoZVxuICAgICAgLy8gZmlyc3QgYW5kIGxhc3QgcG9pbnQgYXMgd2VsbC5cbiAgICAgIHZhciBoYXNHYXBPbkxlZnQgPSAobGFzdFJvdW5kZWRYIC0gbGFzdEZsdXNoZWRYID4gMSksXG4gICAgICAgICAgaGFzR2FwT25SaWdodCA9IChyeCAtIGxhc3RSb3VuZGVkWCA+IDEpLFxuICAgICAgICAgIGhhc0dhcCA9IGhhc0dhcE9uTGVmdCB8fCBoYXNHYXBPblJpZ2h0O1xuICAgICAgZmx1c2hBY3Rpb25zKGhhc0dhcCk7XG4gICAgICBsYXN0Um91bmRlZFggPSByeDtcbiAgICB9XG4gICAgcGVuZGluZ0FjdGlvbnMucHVzaChbYWN0aW9uLCB4LCB5XSk7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBtb3ZlVG86IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIGFkZEFjdGlvbihNT1ZFX1RPLCB4LCB5KTtcbiAgICB9LFxuICAgIGxpbmVUbzogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgYWRkQWN0aW9uKExJTkVfVE8sIHgsIHkpO1xuICAgIH0sXG5cbiAgICAvLyBmb3IgbWFqb3Igb3BlcmF0aW9ucyBsaWtlIHN0cm9rZS9maWxsLCB3ZSBza2lwIGNvbXByZXNzaW9uIHRvIGVuc3VyZVxuICAgIC8vIHRoYXQgdGhlcmUgYXJlIG5vIGFydGlmYWN0cyBhdCB0aGUgcmlnaHQgZWRnZS5cbiAgICBzdHJva2U6ICAgIGZ1bmN0aW9uKCkgeyBmbHVzaEFjdGlvbnModHJ1ZSk7IGNvbnRleHQuc3Ryb2tlKCk7IH0sXG4gICAgZmlsbDogICAgICBmdW5jdGlvbigpIHsgZmx1c2hBY3Rpb25zKHRydWUpOyBjb250ZXh0LmZpbGwoKTsgfSxcbiAgICBiZWdpblBhdGg6IGZ1bmN0aW9uKCkgeyBmbHVzaEFjdGlvbnModHJ1ZSk7IGNvbnRleHQuYmVnaW5QYXRoKCk7IH0sXG4gICAgY2xvc2VQYXRoOiBmdW5jdGlvbigpIHsgZmx1c2hBY3Rpb25zKHRydWUpOyBjb250ZXh0LmNsb3NlUGF0aCgpOyB9LFxuXG4gICAgX2NvdW50OiBmdW5jdGlvbigpIHsgcmV0dXJuIGFjdGlvbkNvdW50OyB9XG4gIH07XG59O1xuXG4vKipcbiAqIERyYXdzIHRoZSBzaGFkZWQgcmVnaW9ucyB3aGVuIFwiZmlsbEdyYXBoXCIgaXMgc2V0LlxuICogTm90IHRvIGJlIGNvbmZ1c2VkIHdpdGggaGlnaC9sb3cgYmFuZHMgKGhpc3RvcmljYWxseSBtaXNuYW1lZCBlcnJvckJhcnMpLlxuICpcbiAqIEZvciBzdGFja2VkIGNoYXJ0cywgaXQncyBtb3JlIGNvbnZlbmllbnQgdG8gaGFuZGxlIGFsbCB0aGUgc2VyaWVzXG4gKiBzaW11bHRhbmVvdXNseS4gU28gdGhpcyBwbG90dGVyIHBsb3RzIGFsbCB0aGUgcG9pbnRzIG9uIHRoZSBmaXJzdCBzZXJpZXNcbiAqIGl0J3MgYXNrZWQgdG8gZHJhdywgdGhlbiBpZ25vcmVzIGFsbCB0aGUgb3RoZXIgc2VyaWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGhDYW52YXNSZW5kZXJlci5fZmlsbFBsb3R0ZXIgPSBmdW5jdGlvbihlKSB7XG4gIC8vIFNraXAgaWYgd2UncmUgZHJhd2luZyBhIHNpbmdsZSBzZXJpZXMgZm9yIGludGVyYWN0aXZlIGhpZ2hsaWdodCBvdmVybGF5LlxuICBpZiAoZS5zaW5nbGVTZXJpZXNOYW1lKSByZXR1cm47XG5cbiAgLy8gV2UnbGwgaGFuZGxlIGFsbCB0aGUgc2VyaWVzIGF0IG9uY2UsIG5vdCBvbmUtYnktb25lLlxuICBpZiAoZS5zZXJpZXNJbmRleCAhPT0gMCkgcmV0dXJuO1xuXG4gIHZhciBnID0gZS5keWdyYXBoO1xuICB2YXIgc2V0TmFtZXMgPSBnLmdldExhYmVscygpLnNsaWNlKDEpOyAgLy8gcmVtb3ZlIHgtYXhpc1xuXG4gIC8vIGdldExhYmVscygpIGluY2x1ZGVzIG5hbWVzIGZvciBpbnZpc2libGUgc2VyaWVzLCB3aGljaCBhcmUgbm90IGluY2x1ZGVkIGluXG4gIC8vIGFsbFNlcmllc1BvaW50cy4gV2UgcmVtb3ZlIHRob3NlIHRvIG1ha2UgdGhlIHR3byBtYXRjaC5cbiAgLy8gVE9ETyhkYW52ayk6IHByb3ZpZGUgYSBzaW1wbGVyIHdheSB0byBnZXQgdGhpcyBpbmZvcm1hdGlvbi5cbiAgZm9yICh2YXIgaSA9IHNldE5hbWVzLmxlbmd0aDsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAoIWcudmlzaWJpbGl0eSgpW2ldKSBzZXROYW1lcy5zcGxpY2UoaSwgMSk7XG4gIH1cblxuICB2YXIgYW55U2VyaWVzRmlsbGVkID0gKGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2V0TmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChnLmdldEJvb2xlYW5PcHRpb24oXCJmaWxsR3JhcGhcIiwgc2V0TmFtZXNbaV0pKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KSgpO1xuXG4gIGlmICghYW55U2VyaWVzRmlsbGVkKSByZXR1cm47XG5cbiAgdmFyIGFyZWEgPSBlLnBsb3RBcmVhO1xuICB2YXIgc2V0cyA9IGUuYWxsU2VyaWVzUG9pbnRzO1xuICB2YXIgc2V0Q291bnQgPSBzZXRzLmxlbmd0aDtcblxuICB2YXIgc3RhY2tlZEdyYXBoID0gZy5nZXRCb29sZWFuT3B0aW9uKFwic3RhY2tlZEdyYXBoXCIpO1xuICB2YXIgY29sb3JzID0gZy5nZXRDb2xvcnMoKTtcblxuICAvLyBGb3Igc3RhY2tlZCBncmFwaHMsIHRyYWNrIHRoZSBiYXNlbGluZSBmb3IgZmlsbGluZy5cbiAgLy9cbiAgLy8gVGhlIGZpbGxlZCBhcmVhcyBiZWxvdyBncmFwaCBsaW5lcyBhcmUgdHJhcGV6b2lkcyB3aXRoIHR3b1xuICAvLyB2ZXJ0aWNhbCBlZGdlcy4gVGhlIHRvcCBlZGdlIGlzIHRoZSBsaW5lIHNlZ21lbnQgYmVpbmcgZHJhd24sIGFuZFxuICAvLyB0aGUgYmFzZWxpbmUgaXMgdGhlIGJvdHRvbSBlZGdlLiBFYWNoIGJhc2VsaW5lIGNvcnJlc3BvbmRzIHRvIHRoZVxuICAvLyB0b3AgbGluZSBzZWdtZW50IGZyb20gdGhlIHByZXZpb3VzIHN0YWNrZWQgbGluZS4gSW4gdGhlIGNhc2Ugb2ZcbiAgLy8gc3RlcCBwbG90cywgdGhlIHRyYXBlem9pZHMgYXJlIHJlY3RhbmdsZXMuXG4gIHZhciBiYXNlbGluZSA9IHt9O1xuICB2YXIgY3VyckJhc2VsaW5lO1xuICB2YXIgcHJldlN0ZXBQbG90OyAgLy8gZm9yIGRpZmZlcmVudCBsaW5lIGRyYXdpbmcgbW9kZXMgKGxpbmUvc3RlcCkgcGVyIHNlcmllc1xuXG4gIC8vIEhlbHBlciBmdW5jdGlvbiB0byB0cmFjZSBhIGxpbmUgYmFjayBhbG9uZyB0aGUgYmFzZWxpbmUuXG4gIHZhciB0cmFjZUJhY2tQYXRoID0gZnVuY3Rpb24oY3R4LCBiYXNlbGluZVgsIGJhc2VsaW5lWSwgcGF0aEJhY2spIHtcbiAgICBjdHgubGluZVRvKGJhc2VsaW5lWCwgYmFzZWxpbmVZKTtcbiAgICBpZiAoc3RhY2tlZEdyYXBoKSB7XG4gICAgICBmb3IgKHZhciBpID0gcGF0aEJhY2subGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgdmFyIHB0ID0gcGF0aEJhY2tbaV07XG4gICAgICAgIGN0eC5saW5lVG8ocHRbMF0sIHB0WzFdKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLy8gcHJvY2VzcyBzZXRzIGluIHJldmVyc2Ugb3JkZXIgKG5lZWRlZCBmb3Igc3RhY2tlZCBncmFwaHMpXG4gIGZvciAodmFyIHNldElkeCA9IHNldENvdW50IC0gMTsgc2V0SWR4ID49IDA7IHNldElkeC0tKSB7XG4gICAgdmFyIGN0eCA9IGUuZHJhd2luZ0NvbnRleHQ7XG4gICAgdmFyIHNldE5hbWUgPSBzZXROYW1lc1tzZXRJZHhdO1xuICAgIGlmICghZy5nZXRCb29sZWFuT3B0aW9uKCdmaWxsR3JhcGgnLCBzZXROYW1lKSkgY29udGludWU7XG5cbiAgICB2YXIgZmlsbEFscGhhID0gZy5nZXROdW1lcmljT3B0aW9uKCdmaWxsQWxwaGEnLCBzZXROYW1lKTtcbiAgICB2YXIgc3RlcFBsb3QgPSBnLmdldEJvb2xlYW5PcHRpb24oJ3N0ZXBQbG90Jywgc2V0TmFtZSk7XG4gICAgdmFyIGNvbG9yID0gY29sb3JzW3NldElkeF07XG4gICAgdmFyIGF4aXMgPSBnLmF4aXNQcm9wZXJ0aWVzRm9yU2VyaWVzKHNldE5hbWUpO1xuICAgIHZhciBheGlzWSA9IDEuMCArIGF4aXMubWlueXZhbCAqIGF4aXMueXNjYWxlO1xuICAgIGlmIChheGlzWSA8IDAuMCkgYXhpc1kgPSAwLjA7XG4gICAgZWxzZSBpZiAoYXhpc1kgPiAxLjApIGF4aXNZID0gMS4wO1xuICAgIGF4aXNZID0gYXJlYS5oICogYXhpc1kgKyBhcmVhLnk7XG5cbiAgICB2YXIgcG9pbnRzID0gc2V0c1tzZXRJZHhdO1xuICAgIHZhciBpdGVyID0gdXRpbHMuY3JlYXRlSXRlcmF0b3IocG9pbnRzLCAwLCBwb2ludHMubGVuZ3RoLFxuICAgICAgICBEeWdyYXBoQ2FudmFzUmVuZGVyZXIuX2dldEl0ZXJhdG9yUHJlZGljYXRlKFxuICAgICAgICAgICAgZy5nZXRCb29sZWFuT3B0aW9uKFwiY29ubmVjdFNlcGFyYXRlZFBvaW50c1wiLCBzZXROYW1lKSkpO1xuXG4gICAgLy8gc2V0dXAgZ3JhcGhpY3MgY29udGV4dFxuICAgIHZhciBwcmV2WCA9IE5hTjtcbiAgICB2YXIgcHJldllzID0gWy0xLCAtMV07XG4gICAgdmFyIG5ld1lzO1xuICAgIC8vIHNob3VsZCBiZSBzYW1lIGNvbG9yIGFzIHRoZSBsaW5lcyBidXQgb25seSAxNSUgb3BhcXVlLlxuICAgIHZhciByZ2IgPSB1dGlscy50b1JHQl8oY29sb3IpO1xuICAgIHZhciBlcnJfY29sb3IgPVxuICAgICAgICAncmdiYSgnICsgcmdiLnIgKyAnLCcgKyByZ2IuZyArICcsJyArIHJnYi5iICsgJywnICsgZmlsbEFscGhhICsgJyknO1xuICAgIGN0eC5maWxsU3R5bGUgPSBlcnJfY29sb3I7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIHZhciBsYXN0X3gsIGlzX2ZpcnN0ID0gdHJ1ZTtcblxuICAgIC8vIElmIHRoZSBwb2ludCBkZW5zaXR5IGlzIGhpZ2ggZW5vdWdoLCBkcm9wcGluZyBzZWdtZW50cyBvbiB0aGVpciB3YXkgdG9cbiAgICAvLyB0aGUgY2FudmFzIGp1c3RpZmllcyB0aGUgb3ZlcmhlYWQgb2YgZG9pbmcgc28uXG4gICAgaWYgKHBvaW50cy5sZW5ndGggPiAyICogZy53aWR0aF8gfHwgRHlncmFwaC5GT1JDRV9GQVNUX1BST1hZKSB7XG4gICAgICBjdHggPSBEeWdyYXBoQ2FudmFzUmVuZGVyZXIuX2Zhc3RDYW52YXNQcm94eShjdHgpO1xuICAgIH1cblxuICAgIC8vIEZvciBmaWxsZWQgY2hhcnRzLCB3ZSBkcmF3IHBvaW50cyBmcm9tIGxlZnQgdG8gcmlnaHQsIHRoZW4gYmFjayBhbG9uZ1xuICAgIC8vIHRoZSB4LWF4aXMgdG8gY29tcGxldGUgYSBzaGFwZSBmb3IgZmlsbGluZy5cbiAgICAvLyBGb3Igc3RhY2tlZCBwbG90cywgdGhpcyBcImJhY2sgcGF0aFwiIGlzIGEgbW9yZSBjb21wbGV4IHNoYXBlLiBUaGlzIGFycmF5XG4gICAgLy8gc3RvcmVzIHRoZSBbeCwgeV0gdmFsdWVzIG5lZWRlZCB0byB0cmFjZSB0aGF0IHNoYXBlLlxuICAgIHZhciBwYXRoQmFjayA9IFtdO1xuXG4gICAgLy8gVE9ETyhkYW52ayk6IHRoZXJlIGFyZSBhIGxvdCBvZiBvcHRpb25zIGF0IHBsYXkgaW4gdGhpcyBsb29wLlxuICAgIC8vICAgICBUaGUgbG9naWMgd291bGQgYmUgbXVjaCBjbGVhcmVyIGlmIHNvbWUgKGUuZy4gc3RhY2tHcmFwaCBhbmRcbiAgICAvLyAgICAgc3RlcFBsb3QpIHdlcmUgc3BsaXQgb2ZmIGludG8gc2VwYXJhdGUgc3ViLXBsb3R0ZXJzLlxuICAgIHZhciBwb2ludDtcbiAgICB3aGlsZSAoaXRlci5oYXNOZXh0KSB7XG4gICAgICBwb2ludCA9IGl0ZXIubmV4dCgpO1xuICAgICAgaWYgKCF1dGlscy5pc09LKHBvaW50LnkpICYmICFzdGVwUGxvdCkge1xuICAgICAgICB0cmFjZUJhY2tQYXRoKGN0eCwgcHJldlgsIHByZXZZc1sxXSwgcGF0aEJhY2spO1xuICAgICAgICBwYXRoQmFjayA9IFtdO1xuICAgICAgICBwcmV2WCA9IE5hTjtcbiAgICAgICAgaWYgKHBvaW50Lnlfc3RhY2tlZCAhPT0gbnVsbCAmJiAhaXNOYU4ocG9pbnQueV9zdGFja2VkKSkge1xuICAgICAgICAgIGJhc2VsaW5lW3BvaW50LmNhbnZhc3hdID0gYXJlYS5oICogcG9pbnQueV9zdGFja2VkICsgYXJlYS55O1xuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKHN0YWNrZWRHcmFwaCkge1xuICAgICAgICBpZiAoIWlzX2ZpcnN0ICYmIGxhc3RfeCA9PSBwb2ludC54dmFsKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXNfZmlyc3QgPSBmYWxzZTtcbiAgICAgICAgICBsYXN0X3ggPSBwb2ludC54dmFsO1xuICAgICAgICB9XG5cbiAgICAgICAgY3VyckJhc2VsaW5lID0gYmFzZWxpbmVbcG9pbnQuY2FudmFzeF07XG4gICAgICAgIHZhciBsYXN0WTtcbiAgICAgICAgaWYgKGN1cnJCYXNlbGluZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgbGFzdFkgPSBheGlzWTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZihwcmV2U3RlcFBsb3QpIHtcbiAgICAgICAgICAgIGxhc3RZID0gY3VyckJhc2VsaW5lWzBdO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsYXN0WSA9IGN1cnJCYXNlbGluZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbmV3WXMgPSBbIHBvaW50LmNhbnZhc3ksIGxhc3RZIF07XG5cbiAgICAgICAgaWYgKHN0ZXBQbG90KSB7XG4gICAgICAgICAgLy8gU3RlcCBwbG90cyBtdXN0IGtlZXAgdHJhY2sgb2YgdGhlIHRvcCBhbmQgYm90dG9tIG9mXG4gICAgICAgICAgLy8gdGhlIGJhc2VsaW5lIGF0IGVhY2ggcG9pbnQuXG4gICAgICAgICAgaWYgKHByZXZZc1swXSA9PT0gLTEpIHtcbiAgICAgICAgICAgIGJhc2VsaW5lW3BvaW50LmNhbnZhc3hdID0gWyBwb2ludC5jYW52YXN5LCBheGlzWSBdO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBiYXNlbGluZVtwb2ludC5jYW52YXN4XSA9IFsgcG9pbnQuY2FudmFzeSwgcHJldllzWzBdIF07XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJhc2VsaW5lW3BvaW50LmNhbnZhc3hdID0gcG9pbnQuY2FudmFzeTtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaXNOYU4ocG9pbnQuY2FudmFzeSkgJiYgc3RlcFBsb3QpIHtcbiAgICAgICAgICBuZXdZcyA9IFsgYXJlYS55ICsgYXJlYS5oLCBheGlzWSBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5ld1lzID0gWyBwb2ludC5jYW52YXN5LCBheGlzWSBdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIWlzTmFOKHByZXZYKSkge1xuICAgICAgICAvLyBNb3ZlIHRvIHRvcCBmaWxsIHBvaW50XG4gICAgICAgIGlmIChzdGVwUGxvdCkge1xuICAgICAgICAgIGN0eC5saW5lVG8ocG9pbnQuY2FudmFzeCwgcHJldllzWzBdKTtcbiAgICAgICAgICBjdHgubGluZVRvKHBvaW50LmNhbnZhc3gsIG5ld1lzWzBdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjdHgubGluZVRvKHBvaW50LmNhbnZhc3gsIG5ld1lzWzBdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlY29yZCB0aGUgYmFzZWxpbmUgZm9yIHRoZSByZXZlcnNlIHBhdGguXG4gICAgICAgIGlmIChzdGFja2VkR3JhcGgpIHtcbiAgICAgICAgICBwYXRoQmFjay5wdXNoKFtwcmV2WCwgcHJldllzWzFdXSk7XG4gICAgICAgICAgaWYgKHByZXZTdGVwUGxvdCAmJiBjdXJyQmFzZWxpbmUpIHtcbiAgICAgICAgICAgIC8vIERyYXcgdG8gdGhlIGJvdHRvbSBvZiB0aGUgYmFzZWxpbmVcbiAgICAgICAgICAgIHBhdGhCYWNrLnB1c2goW3BvaW50LmNhbnZhc3gsIGN1cnJCYXNlbGluZVsxXV0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXRoQmFjay5wdXNoKFtwb2ludC5jYW52YXN4LCBuZXdZc1sxXV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3R4Lm1vdmVUbyhwb2ludC5jYW52YXN4LCBuZXdZc1sxXSk7XG4gICAgICAgIGN0eC5saW5lVG8ocG9pbnQuY2FudmFzeCwgbmV3WXNbMF0pO1xuICAgICAgfVxuICAgICAgcHJldllzID0gbmV3WXM7XG4gICAgICBwcmV2WCA9IHBvaW50LmNhbnZhc3g7XG4gICAgfVxuICAgIHByZXZTdGVwUGxvdCA9IHN0ZXBQbG90O1xuICAgIGlmIChuZXdZcyAmJiBwb2ludCkge1xuICAgICAgdHJhY2VCYWNrUGF0aChjdHgsIHBvaW50LmNhbnZhc3gsIG5ld1lzWzFdLCBwYXRoQmFjayk7XG4gICAgICBwYXRoQmFjayA9IFtdO1xuICAgIH1cbiAgICBjdHguZmlsbCgpO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBEeWdyYXBoQ2FudmFzUmVuZGVyZXI7XG4iXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFlBQVk7O0FBQUM7RUFBQTtBQUFBO0FBQUE7QUFFYjtBQUNBO0FBQWdDO0FBQUE7QUFBQTtBQUVoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSUEscUJBQXFCLEdBQUcsU0FBeEJBLHFCQUFxQixDQUFZQyxPQUFPLEVBQUVDLE9BQU8sRUFBRUMsY0FBYyxFQUFFQyxNQUFNLEVBQUU7RUFDN0UsSUFBSSxDQUFDQyxRQUFRLEdBQUdKLE9BQU87RUFFdkIsSUFBSSxDQUFDRyxNQUFNLEdBQUdBLE1BQU07RUFDcEIsSUFBSSxDQUFDRixPQUFPLEdBQUdBLE9BQU87RUFDdEIsSUFBSSxDQUFDQyxjQUFjLEdBQUdBLGNBQWM7RUFFcEMsSUFBSSxDQUFDRyxNQUFNLEdBQUdMLE9BQU8sQ0FBQ00sT0FBTztFQUM3QixJQUFJLENBQUNDLEtBQUssR0FBR1AsT0FBTyxDQUFDUSxNQUFNOztFQUUzQjtFQUNBLElBQUksQ0FBQ0MsS0FBSyxDQUFDQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUNULE9BQU8sQ0FBQyxFQUFFO0lBQzFDLE1BQU0sMEJBQTBCO0VBQ2xDOztFQUVBO0VBQ0EsSUFBSSxDQUFDVSxJQUFJLEdBQUdSLE1BQU0sQ0FBQ1MsV0FBVyxFQUFFOztFQUVoQztFQUNBO0VBQ0EsSUFBSUMsR0FBRyxHQUFHLElBQUksQ0FBQ1QsUUFBUSxDQUFDVSxXQUFXO0VBQ25DRCxHQUFHLENBQUNFLFNBQVMsRUFBRTtFQUNmRixHQUFHLENBQUNHLElBQUksQ0FBQyxJQUFJLENBQUNMLElBQUksQ0FBQ00sQ0FBQyxFQUFFLElBQUksQ0FBQ04sSUFBSSxDQUFDTyxDQUFDLEVBQUUsSUFBSSxDQUFDUCxJQUFJLENBQUNRLENBQUMsRUFBRSxJQUFJLENBQUNSLElBQUksQ0FBQ1MsQ0FBQyxDQUFDO0VBQzVEUCxHQUFHLENBQUNRLElBQUksRUFBRTtFQUVWUixHQUFHLEdBQUcsSUFBSSxDQUFDVCxRQUFRLENBQUNrQixXQUFXO0VBQy9CVCxHQUFHLENBQUNFLFNBQVMsRUFBRTtFQUNmRixHQUFHLENBQUNHLElBQUksQ0FBQyxJQUFJLENBQUNMLElBQUksQ0FBQ00sQ0FBQyxFQUFFLElBQUksQ0FBQ04sSUFBSSxDQUFDTyxDQUFDLEVBQUUsSUFBSSxDQUFDUCxJQUFJLENBQUNRLENBQUMsRUFBRSxJQUFJLENBQUNSLElBQUksQ0FBQ1MsQ0FBQyxDQUFDO0VBQzVEUCxHQUFHLENBQUNRLElBQUksRUFBRTtBQUNaLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0F0QixxQkFBcUIsQ0FBQ3dCLFNBQVMsQ0FBQ0MsS0FBSyxHQUFHLFlBQVc7RUFDakQsSUFBSSxDQUFDdEIsY0FBYyxDQUFDdUIsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDbEIsS0FBSyxFQUFFLElBQUksQ0FBQ0YsTUFBTSxDQUFDO0FBQzlELENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQU4scUJBQXFCLENBQUN3QixTQUFTLENBQUNHLE1BQU0sR0FBRyxZQUFXO0VBQ2xEO0VBQ0EsSUFBSSxDQUFDQyxhQUFhLEVBQUU7O0VBRXBCO0VBQ0EsSUFBSSxDQUFDQyxnQkFBZ0IsRUFBRTtBQUN6QixDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBN0IscUJBQXFCLENBQUM4QixxQkFBcUIsR0FBRyxVQUFTQyxzQkFBc0IsRUFBRTtFQUM3RSxPQUFPQSxzQkFBc0IsR0FDekIvQixxQkFBcUIsQ0FBQ2dDLDhCQUE4QixHQUNwRCxJQUFJO0FBQ1YsQ0FBQztBQUVEaEMscUJBQXFCLENBQUNnQyw4QkFBOEIsR0FDaEQsVUFBU0MsS0FBSyxFQUFFQyxHQUFHLEVBQUU7RUFDdkIsT0FBT0QsS0FBSyxDQUFDQyxHQUFHLENBQUMsQ0FBQ0MsSUFBSSxLQUFLLElBQUk7QUFDakMsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FuQyxxQkFBcUIsQ0FBQ29DLGVBQWUsR0FBRyxVQUFTQyxDQUFDLEVBQzlDQyxLQUFLLEVBQUVDLFdBQVcsRUFBRUMsYUFBYSxFQUFFQyxVQUFVLEVBQzdDQyxpQkFBaUIsRUFBRUMsU0FBUyxFQUFFO0VBQ2hDLElBQUlDLENBQUMsR0FBR1AsQ0FBQyxDQUFDcEMsT0FBTztFQUNqQjtFQUNBLElBQUk0QyxRQUFRLEdBQUdELENBQUMsQ0FBQ0UsZ0JBQWdCLENBQUMsVUFBVSxFQUFFVCxDQUFDLENBQUNVLE9BQU8sQ0FBQztFQUV4RCxJQUFJLENBQUNyQyxLQUFLLENBQUNzQyxXQUFXLENBQUNSLGFBQWEsQ0FBQyxFQUFFO0lBQ3JDQSxhQUFhLEdBQUcsSUFBSTtFQUN0QjtFQUVBLElBQUlTLGFBQWEsR0FBR0wsQ0FBQyxDQUFDRSxnQkFBZ0IsQ0FBQyxtQkFBbUIsRUFBRVQsQ0FBQyxDQUFDVSxPQUFPLENBQUM7RUFFdEUsSUFBSUcsTUFBTSxHQUFHYixDQUFDLENBQUNhLE1BQU07RUFDckIsSUFBSUgsT0FBTyxHQUFHVixDQUFDLENBQUNVLE9BQU87RUFDdkIsSUFBSUksSUFBSSxHQUFHekMsS0FBSyxDQUFDMEMsY0FBYyxDQUFDRixNQUFNLEVBQUUsQ0FBQyxFQUFFQSxNQUFNLENBQUNHLE1BQU0sRUFDcERyRCxxQkFBcUIsQ0FBQzhCLHFCQUFxQixDQUN2Q2MsQ0FBQyxDQUFDRSxnQkFBZ0IsQ0FBQyx3QkFBd0IsRUFBRUMsT0FBTyxDQUFDLENBQUMsQ0FBQztFQUUvRCxJQUFJTyxRQUFRLEdBQUdkLGFBQWEsSUFBS0EsYUFBYSxDQUFDYSxNQUFNLElBQUksQ0FBRTtFQUUzRCxJQUFJdkMsR0FBRyxHQUFHdUIsQ0FBQyxDQUFDa0IsY0FBYztFQUMxQnpDLEdBQUcsQ0FBQzBDLElBQUksRUFBRTtFQUNWLElBQUlGLFFBQVEsRUFBRTtJQUNaLElBQUl4QyxHQUFHLENBQUMyQyxXQUFXLEVBQUUzQyxHQUFHLENBQUMyQyxXQUFXLENBQUNqQixhQUFhLENBQUM7RUFDckQ7RUFFQSxJQUFJa0IsWUFBWSxHQUFHMUQscUJBQXFCLENBQUMyRCxXQUFXLENBQ2hEdEIsQ0FBQyxFQUFFYyxJQUFJLEVBQUVaLFdBQVcsRUFBRUksU0FBUyxFQUFFRixVQUFVLEVBQUVRLGFBQWEsRUFBRUosUUFBUSxFQUFFUCxLQUFLLENBQUM7RUFDaEZ0QyxxQkFBcUIsQ0FBQzRELGlCQUFpQixDQUNuQ3ZCLENBQUMsRUFBRXFCLFlBQVksRUFBRWhCLGlCQUFpQixFQUFFSixLQUFLLEVBQUVLLFNBQVMsQ0FBQztFQUV6RCxJQUFJVyxRQUFRLEVBQUU7SUFDWixJQUFJeEMsR0FBRyxDQUFDMkMsV0FBVyxFQUFFM0MsR0FBRyxDQUFDMkMsV0FBVyxDQUFDLEVBQUUsQ0FBQztFQUMxQztFQUVBM0MsR0FBRyxDQUFDK0MsT0FBTyxFQUFFO0FBQ2YsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E3RCxxQkFBcUIsQ0FBQzJELFdBQVcsR0FBRyxVQUFTdEIsQ0FBQyxFQUMxQ2MsSUFBSSxFQUFFWixXQUFXLEVBQUVJLFNBQVMsRUFBRUYsVUFBVSxFQUFFUSxhQUFhLEVBQUVKLFFBQVEsRUFBRVAsS0FBSyxFQUFFO0VBRTVFLElBQUl3QixXQUFXLEdBQUcsSUFBSTtFQUN0QixJQUFJQyxXQUFXLEdBQUcsSUFBSTtFQUN0QixJQUFJQyxXQUFXLEdBQUcsSUFBSTtFQUN0QixJQUFJQyxVQUFVLENBQUMsQ0FBQztFQUNoQixJQUFJQyxLQUFLLENBQUMsQ0FBQztFQUNYLElBQUlSLFlBQVksR0FBRyxFQUFFLENBQUMsQ0FBQztFQUN2QixJQUFJUyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUM7O0VBRWxCLElBQUlyRCxHQUFHLEdBQUd1QixDQUFDLENBQUNrQixjQUFjO0VBQzFCekMsR0FBRyxDQUFDRSxTQUFTLEVBQUU7RUFDZkYsR0FBRyxDQUFDc0QsV0FBVyxHQUFHOUIsS0FBSztFQUN2QnhCLEdBQUcsQ0FBQ3VELFNBQVMsR0FBRzlCLFdBQVc7O0VBRTNCO0VBQ0EsSUFBSStCLEdBQUcsR0FBR25CLElBQUksQ0FBQ29CLE1BQU07RUFDckIsSUFBSUMsS0FBSyxHQUFHckIsSUFBSSxDQUFDc0IsSUFBSTtFQUNyQixJQUFJQyxTQUFTLEdBQUd2QixJQUFJLENBQUN3QixVQUFVO0VBRS9CLEtBQUssSUFBSUMsQ0FBQyxHQUFHekIsSUFBSSxDQUFDMEIsTUFBTSxFQUFFRCxDQUFDLEdBQUdKLEtBQUssRUFBRUksQ0FBQyxFQUFFLEVBQUU7SUFDeENWLEtBQUssR0FBR0ksR0FBRyxDQUFDTSxDQUFDLENBQUM7SUFDZCxJQUFJRixTQUFTLEVBQUU7TUFDYixPQUFPRSxDQUFDLEdBQUdKLEtBQUssSUFBSSxDQUFDRSxTQUFTLENBQUNKLEdBQUcsRUFBRU0sQ0FBQyxDQUFDLEVBQUU7UUFDdENBLENBQUMsRUFBRTtNQUNMO01BQ0EsSUFBSUEsQ0FBQyxJQUFJSixLQUFLLEVBQUU7TUFDaEJOLEtBQUssR0FBR0ksR0FBRyxDQUFDTSxDQUFDLENBQUM7SUFDaEI7O0lBRUE7SUFDQTtJQUNBO0lBQ0EsSUFBSVYsS0FBSyxDQUFDWSxPQUFPLEtBQUssSUFBSSxJQUFJWixLQUFLLENBQUNZLE9BQU8sSUFBSVosS0FBSyxDQUFDWSxPQUFPLEVBQUU7TUFDNUQsSUFBSWpDLFFBQVEsSUFBSWlCLFdBQVcsS0FBSyxJQUFJLEVBQUU7UUFDcEM7UUFDQWhELEdBQUcsQ0FBQ2lFLE1BQU0sQ0FBQ2pCLFdBQVcsRUFBRUMsV0FBVyxDQUFDO1FBQ3BDakQsR0FBRyxDQUFDa0UsTUFBTSxDQUFDZCxLQUFLLENBQUNlLE9BQU8sRUFBRWxCLFdBQVcsQ0FBQztNQUN4QztNQUNBRCxXQUFXLEdBQUdDLFdBQVcsR0FBRyxJQUFJO0lBQ2xDLENBQUMsTUFBTTtNQUNMRSxVQUFVLEdBQUcsS0FBSztNQUNsQixJQUFJaEIsYUFBYSxJQUFJYSxXQUFXLEtBQUssSUFBSSxFQUFFO1FBQ3pDWCxJQUFJLENBQUMrQixRQUFRLEdBQUdOLENBQUM7UUFDakJ6QixJQUFJLENBQUNnQyxJQUFJLEVBQUU7UUFDWG5CLFdBQVcsR0FBR2IsSUFBSSxDQUFDaUMsT0FBTyxHQUFHakMsSUFBSSxDQUFDa0MsSUFBSSxDQUFDUCxPQUFPLEdBQUcsSUFBSTtRQUVyRCxJQUFJUSxzQkFBc0IsR0FBR3RCLFdBQVcsS0FBSyxJQUFJLElBQzdDQSxXQUFXLElBQUlBLFdBQVc7UUFDOUJDLFVBQVUsR0FBSUgsV0FBVyxLQUFLLElBQUksSUFBSXdCLHNCQUF1QjtRQUM3RCxJQUFJckMsYUFBYSxFQUFFO1VBQ2pCO1VBQ0E7VUFDQSxJQUFLLENBQUNrQixLQUFLLElBQUlMLFdBQVcsS0FBSyxJQUFJLElBQzlCWCxJQUFJLENBQUNpQyxPQUFPLElBQUlFLHNCQUF1QixFQUFFO1lBQzVDckIsVUFBVSxHQUFHLElBQUk7VUFDbkI7UUFDRjtNQUNGO01BRUEsSUFBSUgsV0FBVyxLQUFLLElBQUksRUFBRTtRQUN4QixJQUFJdkIsV0FBVyxFQUFFO1VBQ2YsSUFBSU0sUUFBUSxFQUFFO1lBQ1ovQixHQUFHLENBQUNpRSxNQUFNLENBQUNqQixXQUFXLEVBQUVDLFdBQVcsQ0FBQztZQUNwQ2pELEdBQUcsQ0FBQ2tFLE1BQU0sQ0FBQ2QsS0FBSyxDQUFDZSxPQUFPLEVBQUVsQixXQUFXLENBQUM7VUFDeEM7VUFFQWpELEdBQUcsQ0FBQ2tFLE1BQU0sQ0FBQ2QsS0FBSyxDQUFDZSxPQUFPLEVBQUVmLEtBQUssQ0FBQ1ksT0FBTyxDQUFDO1FBQzFDO01BQ0YsQ0FBQyxNQUFNO1FBQ0xoRSxHQUFHLENBQUNpRSxNQUFNLENBQUNiLEtBQUssQ0FBQ2UsT0FBTyxFQUFFZixLQUFLLENBQUNZLE9BQU8sQ0FBQztNQUMxQztNQUNBLElBQUlyQyxVQUFVLElBQUl3QixVQUFVLEVBQUU7UUFDNUJQLFlBQVksQ0FBQzZCLElBQUksQ0FBQyxDQUFDckIsS0FBSyxDQUFDZSxPQUFPLEVBQUVmLEtBQUssQ0FBQ1ksT0FBTyxFQUFFWixLQUFLLENBQUNoQyxHQUFHLENBQUMsQ0FBQztNQUM5RDtNQUNBNEIsV0FBVyxHQUFHSSxLQUFLLENBQUNlLE9BQU87TUFDM0JsQixXQUFXLEdBQUdHLEtBQUssQ0FBQ1ksT0FBTztJQUM3QjtJQUNBWCxLQUFLLEdBQUcsS0FBSztFQUNmO0VBQ0FyRCxHQUFHLENBQUMwRSxNQUFNLEVBQUU7RUFDWixPQUFPOUIsWUFBWTtBQUNyQixDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0ExRCxxQkFBcUIsQ0FBQzRELGlCQUFpQixHQUFHLFVBQ3RDdkIsQ0FBQyxFQUFFcUIsWUFBWSxFQUFFaEIsaUJBQWlCLEVBQUVKLEtBQUssRUFBRUssU0FBUyxFQUFFO0VBQ3hELElBQUk3QixHQUFHLEdBQUd1QixDQUFDLENBQUNrQixjQUFjO0VBQzFCLEtBQUssSUFBSXJCLEdBQUcsR0FBRyxDQUFDLEVBQUVBLEdBQUcsR0FBR3dCLFlBQVksQ0FBQ0wsTUFBTSxFQUFFbkIsR0FBRyxFQUFFLEVBQUU7SUFDbEQsSUFBSXVELEVBQUUsR0FBRy9CLFlBQVksQ0FBQ3hCLEdBQUcsQ0FBQztJQUMxQnBCLEdBQUcsQ0FBQzBDLElBQUksRUFBRTtJQUNWZCxpQkFBaUIsQ0FBQ2dELElBQUksQ0FBQ3JELENBQUMsQ0FBQ3BDLE9BQU8sRUFDNUJvQyxDQUFDLENBQUNwQyxPQUFPLEVBQUVvQyxDQUFDLENBQUNVLE9BQU8sRUFBRWpDLEdBQUcsRUFBRTJFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRUEsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFbkQsS0FBSyxFQUFFSyxTQUFTLEVBQUU4QyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckUzRSxHQUFHLENBQUMrQyxPQUFPLEVBQUU7RUFDZjtBQUNGLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTdELHFCQUFxQixDQUFDd0IsU0FBUyxDQUFDSSxhQUFhLEdBQUcsWUFBVztFQUN6RDtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQSxJQUFJK0QsSUFBSSxHQUFHLElBQUksQ0FBQ3ZGLE1BQU0sQ0FBQzhDLE1BQU07RUFDN0IsS0FBSyxJQUFJMEIsQ0FBQyxHQUFHZSxJQUFJLENBQUN0QyxNQUFNLEVBQUV1QixDQUFDLEVBQUUsR0FBRztJQUM5QixJQUFJMUIsTUFBTSxHQUFHeUMsSUFBSSxDQUFDZixDQUFDLENBQUM7SUFDcEIsS0FBSyxJQUFJZ0IsQ0FBQyxHQUFHMUMsTUFBTSxDQUFDRyxNQUFNLEVBQUV1QyxDQUFDLEVBQUUsR0FBRztNQUNoQyxJQUFJMUIsS0FBSyxHQUFHaEIsTUFBTSxDQUFDMEMsQ0FBQyxDQUFDO01BQ3JCMUIsS0FBSyxDQUFDZSxPQUFPLEdBQUcsSUFBSSxDQUFDckUsSUFBSSxDQUFDUSxDQUFDLEdBQUc4QyxLQUFLLENBQUNoRCxDQUFDLEdBQUcsSUFBSSxDQUFDTixJQUFJLENBQUNNLENBQUM7TUFDbkRnRCxLQUFLLENBQUNZLE9BQU8sR0FBRyxJQUFJLENBQUNsRSxJQUFJLENBQUNTLENBQUMsR0FBRzZDLEtBQUssQ0FBQy9DLENBQUMsR0FBRyxJQUFJLENBQUNQLElBQUksQ0FBQ08sQ0FBQztJQUNyRDtFQUNGO0FBQ0YsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FuQixxQkFBcUIsQ0FBQ3dCLFNBQVMsQ0FBQ0ssZ0JBQWdCLEdBQUcsVUFBU2dFLGNBQWMsRUFBRUMsT0FBTyxFQUFFO0VBQ25GLElBQUloRixHQUFHLEdBQUdnRixPQUFPLElBQUksSUFBSSxDQUFDM0YsY0FBYztFQUN4QyxJQUFJeUUsQ0FBQztFQUVMLElBQUllLElBQUksR0FBRyxJQUFJLENBQUN2RixNQUFNLENBQUM4QyxNQUFNO0VBQzdCLElBQUk2QyxRQUFRLEdBQUcsSUFBSSxDQUFDM0YsTUFBTSxDQUFDMkYsUUFBUTtFQUNuQyxJQUFJaEQsT0FBTztFQUVYLElBQUksQ0FBQ2lELE1BQU0sR0FBRyxJQUFJLENBQUMzRixRQUFRLENBQUM0RixVQUFVOztFQUV0QztFQUNBLElBQUlDLFlBQVksR0FBRyxJQUFJLENBQUM3RixRQUFRLENBQUM4RixTQUFTLENBQUMsU0FBUyxDQUFDO0VBQ3JELElBQUlDLFFBQVEsR0FBR0YsWUFBWTtFQUMzQixJQUFJLENBQUN4RixLQUFLLENBQUNzQyxXQUFXLENBQUNvRCxRQUFRLENBQUMsRUFBRTtJQUNoQ0EsUUFBUSxHQUFHLENBQUNBLFFBQVEsQ0FBQztFQUN2QjtFQUVBLElBQUlDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFFO0VBQ3ZCLEtBQUt6QixDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdtQixRQUFRLENBQUMxQyxNQUFNLEVBQUV1QixDQUFDLEVBQUUsRUFBRTtJQUNwQzdCLE9BQU8sR0FBR2dELFFBQVEsQ0FBQ25CLENBQUMsQ0FBQztJQUNyQixJQUFJMEIsVUFBVSxHQUFHLElBQUksQ0FBQ2pHLFFBQVEsQ0FBQzhGLFNBQVMsQ0FBQyxTQUFTLEVBQUVwRCxPQUFPLENBQUM7SUFDNUQsSUFBSXVELFVBQVUsSUFBSUosWUFBWSxFQUFFLFNBQVMsQ0FBRTs7SUFFM0NHLFdBQVcsQ0FBQ3RELE9BQU8sQ0FBQyxHQUFHdUQsVUFBVTtFQUNuQztFQUVBLEtBQUsxQixDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUd3QixRQUFRLENBQUMvQyxNQUFNLEVBQUV1QixDQUFDLEVBQUUsRUFBRTtJQUNwQyxJQUFJMkIsT0FBTyxHQUFHSCxRQUFRLENBQUN4QixDQUFDLENBQUM7SUFDekIsSUFBSTRCLE9BQU8sR0FBSTVCLENBQUMsSUFBSXdCLFFBQVEsQ0FBQy9DLE1BQU0sR0FBRyxDQUFFO0lBRXhDLEtBQUssSUFBSXVDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR0QsSUFBSSxDQUFDdEMsTUFBTSxFQUFFdUMsQ0FBQyxFQUFFLEVBQUU7TUFDcEM3QyxPQUFPLEdBQUdnRCxRQUFRLENBQUNILENBQUMsQ0FBQztNQUNyQixJQUFJQyxjQUFjLElBQUk5QyxPQUFPLElBQUk4QyxjQUFjLEVBQUU7TUFFakQsSUFBSTNDLE1BQU0sR0FBR3lDLElBQUksQ0FBQ0MsQ0FBQyxDQUFDOztNQUVwQjtNQUNBLElBQUlhLENBQUMsR0FBR0YsT0FBTztNQUNmLElBQUl4RCxPQUFPLElBQUlzRCxXQUFXLEVBQUU7UUFDMUIsSUFBSUcsT0FBTyxFQUFFO1VBQ1hDLENBQUMsR0FBR0osV0FBVyxDQUFDdEQsT0FBTyxDQUFDO1FBQzFCLENBQUMsTUFBTTtVQUNMO1VBQ0E7UUFDRjtNQUNGO01BRUEsSUFBSVQsS0FBSyxHQUFHLElBQUksQ0FBQzBELE1BQU0sQ0FBQ2pELE9BQU8sQ0FBQztNQUNoQyxJQUFJUixXQUFXLEdBQUcsSUFBSSxDQUFDbEMsUUFBUSxDQUFDOEYsU0FBUyxDQUFDLGFBQWEsRUFBRXBELE9BQU8sQ0FBQztNQUVqRWpDLEdBQUcsQ0FBQzBDLElBQUksRUFBRTtNQUNWMUMsR0FBRyxDQUFDc0QsV0FBVyxHQUFHOUIsS0FBSztNQUN2QnhCLEdBQUcsQ0FBQ3VELFNBQVMsR0FBRzlCLFdBQVc7TUFDM0JrRSxDQUFDLENBQUM7UUFDQXZELE1BQU0sRUFBRUEsTUFBTTtRQUNkSCxPQUFPLEVBQUVBLE9BQU87UUFDaEJRLGNBQWMsRUFBRXpDLEdBQUc7UUFDbkJ3QixLQUFLLEVBQUVBLEtBQUs7UUFDWkMsV0FBVyxFQUFFQSxXQUFXO1FBQ3hCdEMsT0FBTyxFQUFFLElBQUksQ0FBQ0ksUUFBUTtRQUN0QnFHLElBQUksRUFBRSxJQUFJLENBQUNyRyxRQUFRLENBQUNzRyx1QkFBdUIsQ0FBQzVELE9BQU8sQ0FBQztRQUNwRDZELFFBQVEsRUFBRSxJQUFJLENBQUNoRyxJQUFJO1FBQ25CaUcsV0FBVyxFQUFFakIsQ0FBQztRQUNka0IsV0FBVyxFQUFFbkIsSUFBSSxDQUFDdEMsTUFBTTtRQUN4QjBELGdCQUFnQixFQUFFbEIsY0FBYztRQUNoQ21CLGVBQWUsRUFBRXJCO01BQ25CLENBQUMsQ0FBQztNQUNGN0UsR0FBRyxDQUFDK0MsT0FBTyxFQUFFO0lBQ2Y7RUFDRjtBQUNGLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTdELHFCQUFxQixDQUFDaUgsU0FBUyxHQUFHO0VBQ2hDQyxXQUFXLEVBQUUscUJBQVM3RSxDQUFDLEVBQUU7SUFDdkJyQyxxQkFBcUIsQ0FBQ21ILFlBQVksQ0FBQzlFLENBQUMsQ0FBQztFQUN2QyxDQUFDO0VBRUQrRSxXQUFXLEVBQUUscUJBQVMvRSxDQUFDLEVBQUU7SUFDdkJyQyxxQkFBcUIsQ0FBQ3FILFlBQVksQ0FBQ2hGLENBQUMsQ0FBQztFQUN2QyxDQUFDO0VBRURpRixZQUFZLEVBQUUsc0JBQVNqRixDQUFDLEVBQUU7SUFDeEJyQyxxQkFBcUIsQ0FBQ3VILGFBQWEsQ0FBQ2xGLENBQUMsQ0FBQztFQUN4QztBQUNGLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQXJDLHFCQUFxQixDQUFDbUgsWUFBWSxHQUFHLFVBQVM5RSxDQUFDLEVBQUU7RUFDL0MsSUFBSU8sQ0FBQyxHQUFHUCxDQUFDLENBQUNwQyxPQUFPO0VBQ2pCLElBQUk4QyxPQUFPLEdBQUdWLENBQUMsQ0FBQ1UsT0FBTztFQUN2QixJQUFJUixXQUFXLEdBQUdGLENBQUMsQ0FBQ0UsV0FBVzs7RUFFL0I7RUFDQTtFQUNBO0VBQ0EsSUFBSWlGLFdBQVcsR0FBRzVFLENBQUMsQ0FBQzZFLGdCQUFnQixDQUFDLG1CQUFtQixFQUFFMUUsT0FBTyxDQUFDO0VBQ2xFLElBQUlMLGlCQUFpQixHQUFHRSxDQUFDLENBQUN1RCxTQUFTLENBQUMsbUJBQW1CLEVBQUVwRCxPQUFPLENBQUMsSUFDN0RyQyxLQUFLLENBQUNnSCxPQUFPLENBQUNDLE9BQU87RUFDekIsSUFBSW5GLGFBQWEsR0FBR0ksQ0FBQyxDQUFDdUQsU0FBUyxDQUFDLGVBQWUsRUFBRXBELE9BQU8sQ0FBQztFQUN6RCxJQUFJTixVQUFVLEdBQUdHLENBQUMsQ0FBQ0UsZ0JBQWdCLENBQUMsWUFBWSxFQUFFQyxPQUFPLENBQUM7RUFDMUQsSUFBSUosU0FBUyxHQUFHQyxDQUFDLENBQUM2RSxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUxRSxPQUFPLENBQUM7RUFFeEQsSUFBSXlFLFdBQVcsSUFBSWpGLFdBQVcsRUFBRTtJQUM5QnZDLHFCQUFxQixDQUFDb0MsZUFBZSxDQUFDQyxDQUFDLEVBQ25DTyxDQUFDLENBQUN1RCxTQUFTLENBQUMsbUJBQW1CLEVBQUVwRCxPQUFPLENBQUMsRUFDekNSLFdBQVcsR0FBRyxDQUFDLEdBQUdpRixXQUFXLEVBQzdCaEYsYUFBYSxFQUNiQyxVQUFVLEVBQ1ZDLGlCQUFpQixFQUNqQkMsU0FBUyxDQUNSO0VBQ1A7RUFFQTNDLHFCQUFxQixDQUFDb0MsZUFBZSxDQUFDQyxDQUFDLEVBQ25DQSxDQUFDLENBQUNDLEtBQUssRUFDUEMsV0FBVyxFQUNYQyxhQUFhLEVBQ2JDLFVBQVUsRUFDVkMsaUJBQWlCLEVBQ2pCQyxTQUFTLENBQ1o7QUFDSCxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBM0MscUJBQXFCLENBQUN1SCxhQUFhLEdBQUcsVUFBU2xGLENBQUMsRUFBRTtFQUNoRCxJQUFJTyxDQUFDLEdBQUdQLENBQUMsQ0FBQ3BDLE9BQU87RUFDakIsSUFBSThDLE9BQU8sR0FBR1YsQ0FBQyxDQUFDVSxPQUFPO0VBQ3ZCLElBQUk2RSxTQUFTLEdBQUdoRixDQUFDLENBQUNFLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxJQUMzQ0YsQ0FBQyxDQUFDRSxnQkFBZ0IsQ0FBQyxZQUFZLENBQUM7RUFDcEMsSUFBSSxDQUFDOEUsU0FBUyxFQUFFO0VBRWhCLElBQUlDLFNBQVMsR0FBR2pGLENBQUMsQ0FBQ0UsZ0JBQWdCLENBQUMsV0FBVyxFQUFFQyxPQUFPLENBQUM7RUFDeEQsSUFBSThFLFNBQVMsRUFBRTtJQUNiQyxPQUFPLENBQUNDLElBQUksQ0FBQyxnRUFBZ0UsQ0FBQztFQUNoRjtFQUVBLElBQUlqSCxHQUFHLEdBQUd1QixDQUFDLENBQUNrQixjQUFjO0VBQzFCLElBQUlqQixLQUFLLEdBQUdELENBQUMsQ0FBQ0MsS0FBSztFQUNuQixJQUFJMEYsU0FBUyxHQUFHcEYsQ0FBQyxDQUFDNkUsZ0JBQWdCLENBQUMsV0FBVyxFQUFFMUUsT0FBTyxDQUFDO0VBQ3hELElBQUlGLFFBQVEsR0FBR0QsQ0FBQyxDQUFDRSxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUVDLE9BQU8sQ0FBQztFQUN0RCxJQUFJRyxNQUFNLEdBQUdiLENBQUMsQ0FBQ2EsTUFBTTtFQUVyQixJQUFJQyxJQUFJLEdBQUd6QyxLQUFLLENBQUMwQyxjQUFjLENBQUNGLE1BQU0sRUFBRSxDQUFDLEVBQUVBLE1BQU0sQ0FBQ0csTUFBTSxFQUNwRHJELHFCQUFxQixDQUFDOEIscUJBQXFCLENBQ3ZDYyxDQUFDLENBQUNFLGdCQUFnQixDQUFDLHdCQUF3QixFQUFFQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0VBRS9ELElBQUlrRixLQUFLOztFQUVUO0VBQ0EsSUFBSUMsS0FBSyxHQUFHQyxHQUFHO0VBQ2YsSUFBSUMsS0FBSyxHQUFHRCxHQUFHO0VBQ2YsSUFBSUUsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7RUFDckI7RUFDQSxJQUFJQyxHQUFHLEdBQUc1SCxLQUFLLENBQUM2SCxNQUFNLENBQUNqRyxLQUFLLENBQUM7RUFDN0IsSUFBSWtHLFNBQVMsR0FDVCxPQUFPLEdBQUdGLEdBQUcsQ0FBQ0csQ0FBQyxHQUFHLEdBQUcsR0FBR0gsR0FBRyxDQUFDMUYsQ0FBQyxHQUFHLEdBQUcsR0FBRzBGLEdBQUcsQ0FBQ0ksQ0FBQyxHQUFHLEdBQUcsR0FBR1YsU0FBUyxHQUFHLEdBQUc7RUFDdkVsSCxHQUFHLENBQUM2SCxTQUFTLEdBQUdILFNBQVM7RUFDekIxSCxHQUFHLENBQUNFLFNBQVMsRUFBRTtFQUVmLElBQUk0SCxvQkFBb0IsR0FBRyxTQUF2QkEsb0JBQW9CLENBQVkxSCxDQUFDLEVBQUU7SUFDckMsT0FBUUEsQ0FBQyxLQUFLLElBQUksSUFDVkEsQ0FBQyxLQUFLMkgsU0FBUyxJQUNmQyxLQUFLLENBQUM1SCxDQUFDLENBQUM7RUFDbEIsQ0FBQztFQUVELE9BQU9pQyxJQUFJLENBQUNpQyxPQUFPLEVBQUU7SUFDbkIsSUFBSWxCLEtBQUssR0FBR2YsSUFBSSxDQUFDZ0MsSUFBSSxFQUFFO0lBQ3ZCLElBQUssQ0FBQ3RDLFFBQVEsSUFBSStGLG9CQUFvQixDQUFDMUUsS0FBSyxDQUFDL0MsQ0FBQyxDQUFDLElBQzFDMEIsUUFBUSxJQUFJLENBQUNpRyxLQUFLLENBQUNWLEtBQUssQ0FBQyxJQUFJUSxvQkFBb0IsQ0FBQ1IsS0FBSyxDQUFFLEVBQUU7TUFDOURGLEtBQUssR0FBR0MsR0FBRztNQUNYO0lBQ0Y7SUFFQUYsS0FBSyxHQUFHLENBQUUvRCxLQUFLLENBQUM2RSxRQUFRLEVBQUU3RSxLQUFLLENBQUM4RSxLQUFLLENBQUU7SUFDdkMsSUFBSW5HLFFBQVEsRUFBRTtNQUNadUYsS0FBSyxHQUFHbEUsS0FBSyxDQUFDL0MsQ0FBQztJQUNqQjs7SUFFQTtJQUNBO0lBQ0EsSUFBSTJILEtBQUssQ0FBQ2IsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUVBLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRy9ELEtBQUssQ0FBQy9DLENBQUM7SUFDdkMsSUFBSTJILEtBQUssQ0FBQ2IsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUVBLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRy9ELEtBQUssQ0FBQy9DLENBQUM7SUFFdkM4RyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUc1RixDQUFDLENBQUN1RSxRQUFRLENBQUN2RixDQUFDLEdBQUc0RyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUc1RixDQUFDLENBQUN1RSxRQUFRLENBQUN6RixDQUFDO0lBQ2pEOEcsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHNUYsQ0FBQyxDQUFDdUUsUUFBUSxDQUFDdkYsQ0FBQyxHQUFHNEcsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHNUYsQ0FBQyxDQUFDdUUsUUFBUSxDQUFDekYsQ0FBQztJQUNqRCxJQUFJLENBQUMySCxLQUFLLENBQUNaLEtBQUssQ0FBQyxFQUFFO01BQ2pCLElBQUlyRixRQUFRLEVBQUU7UUFDWi9CLEdBQUcsQ0FBQ2lFLE1BQU0sQ0FBQ21ELEtBQUssRUFBRUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCdkgsR0FBRyxDQUFDa0UsTUFBTSxDQUFDZCxLQUFLLENBQUNlLE9BQU8sRUFBRW9ELE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQ3ZILEdBQUcsQ0FBQ2tFLE1BQU0sQ0FBQ2QsS0FBSyxDQUFDZSxPQUFPLEVBQUVvRCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7TUFDdEMsQ0FBQyxNQUFNO1FBQ0x2SCxHQUFHLENBQUNpRSxNQUFNLENBQUNtRCxLQUFLLEVBQUVHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QnZILEdBQUcsQ0FBQ2tFLE1BQU0sQ0FBQ2QsS0FBSyxDQUFDZSxPQUFPLEVBQUVnRCxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkNuSCxHQUFHLENBQUNrRSxNQUFNLENBQUNkLEtBQUssQ0FBQ2UsT0FBTyxFQUFFZ0QsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO01BQ3JDO01BQ0FuSCxHQUFHLENBQUNrRSxNQUFNLENBQUNrRCxLQUFLLEVBQUVHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUM1QnZILEdBQUcsQ0FBQ21JLFNBQVMsRUFBRTtJQUNqQjtJQUNBWixNQUFNLEdBQUdKLEtBQUs7SUFDZEMsS0FBSyxHQUFHaEUsS0FBSyxDQUFDZSxPQUFPO0VBQ3ZCO0VBQ0FuRSxHQUFHLENBQUNvSSxJQUFJLEVBQUU7QUFDWixDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FsSixxQkFBcUIsQ0FBQ21KLGdCQUFnQixHQUFHLFVBQVNDLE9BQU8sRUFBRTtFQUN6RCxJQUFJQyxjQUFjLEdBQUcsRUFBRSxDQUFDLENBQUU7RUFDMUIsSUFBSUMsWUFBWSxHQUFHLElBQUk7RUFDdkIsSUFBSUMsWUFBWSxHQUFHLElBQUk7RUFFdkIsSUFBSUMsT0FBTyxHQUFHLENBQUM7SUFDWEMsT0FBTyxHQUFHLENBQUM7RUFFZixJQUFJQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUU7O0VBRXRCO0VBQ0E7RUFDQSxJQUFJQyxlQUFlLEdBQUcsU0FBbEJBLGVBQWUsQ0FBWUMsZ0JBQWdCLEVBQUU7SUFDL0MsSUFBSVAsY0FBYyxDQUFDaEcsTUFBTSxJQUFJLENBQUMsRUFBRTs7SUFFaEM7SUFDQSxLQUFLLElBQUl1QixDQUFDLEdBQUd5RSxjQUFjLENBQUNoRyxNQUFNLEdBQUcsQ0FBQyxFQUFFdUIsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxFQUFFLEVBQUU7TUFDbEQsSUFBSWlGLE1BQU0sR0FBR1IsY0FBYyxDQUFDekUsQ0FBQyxDQUFDO01BQzlCLElBQUlpRixNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUlKLE9BQU8sRUFBRTtRQUN4QixJQUFJSyxVQUFVLEdBQUdULGNBQWMsQ0FBQ3pFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEMsSUFBSWtGLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSUQsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUlELE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRTtVQUM1RFIsY0FBYyxDQUFDVSxNQUFNLENBQUNuRixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzdCO01BQ0Y7SUFDRjs7SUFFQTtJQUNBLElBQStDO0lBQUEsQ0FBMUMsSUFBSUEsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHeUUsY0FBYyxDQUFDaEcsTUFBTSxHQUFHLENBQUMsR0FBZ0M7TUFDM0UsSUFBSXdHLE1BQU0sR0FBR1IsY0FBYyxDQUFDekUsQ0FBQyxDQUFDO01BQzlCLElBQUlpRixNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUlKLE9BQU8sSUFBSUosY0FBYyxDQUFDekUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJNkUsT0FBTyxFQUFFO1FBQy9ESixjQUFjLENBQUNVLE1BQU0sQ0FBQ25GLENBQUMsRUFBRSxDQUFDLENBQUM7TUFDN0IsQ0FBQyxNQUFNO1FBQ0xBLENBQUMsRUFBRTtNQUNMO0lBQ0Y7O0lBRUE7SUFDQSxJQUFJeUUsY0FBYyxDQUFDaEcsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDdUcsZ0JBQWdCLEVBQUU7TUFDbEQ7TUFDQSxJQUFJSSxRQUFRLEdBQUcsQ0FBQztNQUNoQixJQUFJWCxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUlJLE9BQU8sRUFBRU8sUUFBUSxFQUFFO01BQy9DLElBQUlDLE1BQU0sR0FBRyxJQUFJO1FBQUVDLE1BQU0sR0FBRyxJQUFJO01BQ2hDLEtBQUssSUFBSXRGLENBQUMsR0FBR29GLFFBQVEsRUFBRXBGLENBQUMsR0FBR3lFLGNBQWMsQ0FBQ2hHLE1BQU0sRUFBRXVCLENBQUMsRUFBRSxFQUFFO1FBQ3JELElBQUlpRixNQUFNLEdBQUdSLGNBQWMsQ0FBQ3pFLENBQUMsQ0FBQztRQUM5QixJQUFJaUYsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJTCxPQUFPLEVBQUU7UUFDMUIsSUFBSVMsTUFBTSxLQUFLLElBQUksSUFBSUMsTUFBTSxLQUFLLElBQUksRUFBRTtVQUN0Q0QsTUFBTSxHQUFHckYsQ0FBQztVQUNWc0YsTUFBTSxHQUFHdEYsQ0FBQztRQUNaLENBQUMsTUFBTTtVQUNMLElBQUl6RCxDQUFDLEdBQUcwSSxNQUFNLENBQUMsQ0FBQyxDQUFDO1VBQ2pCLElBQUkxSSxDQUFDLEdBQUdrSSxjQUFjLENBQUNZLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ2pDQSxNQUFNLEdBQUdyRixDQUFDO1VBQ1osQ0FBQyxNQUFNLElBQUl6RCxDQUFDLEdBQUdrSSxjQUFjLENBQUNhLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3hDQSxNQUFNLEdBQUd0RixDQUFDO1VBQ1o7UUFDRjtNQUNGO01BQ0EsSUFBSXVGLFNBQVMsR0FBR2QsY0FBYyxDQUFDWSxNQUFNLENBQUM7UUFDbENHLFNBQVMsR0FBR2YsY0FBYyxDQUFDYSxNQUFNLENBQUM7TUFDdENiLGNBQWMsQ0FBQ1UsTUFBTSxDQUFDQyxRQUFRLEVBQUVYLGNBQWMsQ0FBQ2hHLE1BQU0sR0FBRzJHLFFBQVEsQ0FBQztNQUNqRSxJQUFJQyxNQUFNLEdBQUdDLE1BQU0sRUFBRTtRQUNuQmIsY0FBYyxDQUFDOUQsSUFBSSxDQUFDNEUsU0FBUyxDQUFDO1FBQzlCZCxjQUFjLENBQUM5RCxJQUFJLENBQUM2RSxTQUFTLENBQUM7TUFDaEMsQ0FBQyxNQUFNLElBQUlILE1BQU0sR0FBR0MsTUFBTSxFQUFFO1FBQzFCYixjQUFjLENBQUM5RCxJQUFJLENBQUM2RSxTQUFTLENBQUM7UUFDOUJmLGNBQWMsQ0FBQzlELElBQUksQ0FBQzRFLFNBQVMsQ0FBQztNQUNoQyxDQUFDLE1BQU07UUFDTGQsY0FBYyxDQUFDOUQsSUFBSSxDQUFDNEUsU0FBUyxDQUFDO01BQ2hDO0lBQ0Y7RUFDRixDQUFDO0VBRUQsSUFBSUUsWUFBWSxHQUFHLFNBQWZBLFlBQVksQ0FBWUMsc0JBQXNCLEVBQUU7SUFDbERYLGVBQWUsQ0FBQ1csc0JBQXNCLENBQUM7SUFDdkMsS0FBSyxJQUFJMUYsQ0FBQyxHQUFHLENBQUMsRUFBRTJGLEdBQUcsR0FBR2xCLGNBQWMsQ0FBQ2hHLE1BQU0sRUFBRXVCLENBQUMsR0FBRzJGLEdBQUcsRUFBRTNGLENBQUMsRUFBRSxFQUFFO01BQ3pELElBQUlpRixNQUFNLEdBQUdSLGNBQWMsQ0FBQ3pFLENBQUMsQ0FBQztNQUM5QixJQUFJaUYsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJTCxPQUFPLEVBQUU7UUFDeEJKLE9BQU8sQ0FBQ3BFLE1BQU0sQ0FBQzZFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRUEsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO01BQ3RDLENBQUMsTUFBTSxJQUFJQSxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUlKLE9BQU8sRUFBRTtRQUMvQkwsT0FBTyxDQUFDckUsTUFBTSxDQUFDOEUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFQSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7TUFDdEM7SUFDRjtJQUNBLElBQUlSLGNBQWMsQ0FBQ2hHLE1BQU0sRUFBRTtNQUN6QmtHLFlBQVksR0FBR0YsY0FBYyxDQUFDQSxjQUFjLENBQUNoRyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdEO0lBQ0FxRyxXQUFXLElBQUlMLGNBQWMsQ0FBQ2hHLE1BQU07SUFDcENnRyxjQUFjLEdBQUcsRUFBRTtFQUNyQixDQUFDO0VBRUQsSUFBSW1CLFNBQVMsR0FBRyxTQUFaQSxTQUFTLENBQVlYLE1BQU0sRUFBRTNJLENBQUMsRUFBRUMsQ0FBQyxFQUFFO0lBQ3JDLElBQUlzSixFQUFFLEdBQUdDLElBQUksQ0FBQ0MsS0FBSyxDQUFDekosQ0FBQyxDQUFDO0lBQ3RCLElBQUlvSSxZQUFZLEtBQUssSUFBSSxJQUFJbUIsRUFBRSxJQUFJbkIsWUFBWSxFQUFFO01BQy9DO01BQ0E7TUFDQSxJQUFJc0IsWUFBWSxHQUFJdEIsWUFBWSxHQUFHQyxZQUFZLEdBQUcsQ0FBRTtRQUNoRHNCLGFBQWEsR0FBSUosRUFBRSxHQUFHbkIsWUFBWSxHQUFHLENBQUU7UUFDdkN3QixNQUFNLEdBQUdGLFlBQVksSUFBSUMsYUFBYTtNQUMxQ1IsWUFBWSxDQUFDUyxNQUFNLENBQUM7TUFDcEJ4QixZQUFZLEdBQUdtQixFQUFFO0lBQ25CO0lBQ0FwQixjQUFjLENBQUM5RCxJQUFJLENBQUMsQ0FBQ3NFLE1BQU0sRUFBRTNJLENBQUMsRUFBRUMsQ0FBQyxDQUFDLENBQUM7RUFDckMsQ0FBQztFQUVELE9BQU87SUFDTDRELE1BQU0sRUFBRSxnQkFBUzdELENBQUMsRUFBRUMsQ0FBQyxFQUFFO01BQ3JCcUosU0FBUyxDQUFDZixPQUFPLEVBQUV2SSxDQUFDLEVBQUVDLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBQ0Q2RCxNQUFNLEVBQUUsZ0JBQVM5RCxDQUFDLEVBQUVDLENBQUMsRUFBRTtNQUNyQnFKLFNBQVMsQ0FBQ2hCLE9BQU8sRUFBRXRJLENBQUMsRUFBRUMsQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRDtJQUNBO0lBQ0FxRSxNQUFNLEVBQUssa0JBQVc7TUFBRTZFLFlBQVksQ0FBQyxJQUFJLENBQUM7TUFBRWpCLE9BQU8sQ0FBQzVELE1BQU0sRUFBRTtJQUFFLENBQUM7SUFDL0QwRCxJQUFJLEVBQU8sZ0JBQVc7TUFBRW1CLFlBQVksQ0FBQyxJQUFJLENBQUM7TUFBRWpCLE9BQU8sQ0FBQ0YsSUFBSSxFQUFFO0lBQUUsQ0FBQztJQUM3RGxJLFNBQVMsRUFBRSxxQkFBVztNQUFFcUosWUFBWSxDQUFDLElBQUksQ0FBQztNQUFFakIsT0FBTyxDQUFDcEksU0FBUyxFQUFFO0lBQUUsQ0FBQztJQUNsRWlJLFNBQVMsRUFBRSxxQkFBVztNQUFFb0IsWUFBWSxDQUFDLElBQUksQ0FBQztNQUFFakIsT0FBTyxDQUFDSCxTQUFTLEVBQUU7SUFBRSxDQUFDO0lBRWxFOEIsTUFBTSxFQUFFLGtCQUFXO01BQUUsT0FBT3JCLFdBQVc7SUFBRTtFQUMzQyxDQUFDO0FBQ0gsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBMUoscUJBQXFCLENBQUNxSCxZQUFZLEdBQUcsVUFBU2hGLENBQUMsRUFBRTtFQUMvQztFQUNBLElBQUlBLENBQUMsQ0FBQzBFLGdCQUFnQixFQUFFOztFQUV4QjtFQUNBLElBQUkxRSxDQUFDLENBQUN3RSxXQUFXLEtBQUssQ0FBQyxFQUFFO0VBRXpCLElBQUlqRSxDQUFDLEdBQUdQLENBQUMsQ0FBQ3BDLE9BQU87RUFDakIsSUFBSThGLFFBQVEsR0FBR25ELENBQUMsQ0FBQ29JLFNBQVMsRUFBRSxDQUFDQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBRTs7RUFFeEM7RUFDQTtFQUNBO0VBQ0EsS0FBSyxJQUFJckcsQ0FBQyxHQUFHbUIsUUFBUSxDQUFDMUMsTUFBTSxFQUFFdUIsQ0FBQyxJQUFJLENBQUMsRUFBRUEsQ0FBQyxFQUFFLEVBQUU7SUFDekMsSUFBSSxDQUFDaEMsQ0FBQyxDQUFDc0ksVUFBVSxFQUFFLENBQUN0RyxDQUFDLENBQUMsRUFBRW1CLFFBQVEsQ0FBQ2dFLE1BQU0sQ0FBQ25GLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDL0M7RUFFQSxJQUFJdUcsZUFBZSxHQUFJLFlBQVc7SUFDaEMsS0FBSyxJQUFJdkcsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHbUIsUUFBUSxDQUFDMUMsTUFBTSxFQUFFdUIsQ0FBQyxFQUFFLEVBQUU7TUFDeEMsSUFBSWhDLENBQUMsQ0FBQ0UsZ0JBQWdCLENBQUMsV0FBVyxFQUFFaUQsUUFBUSxDQUFDbkIsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLElBQUk7SUFDL0Q7SUFDQSxPQUFPLEtBQUs7RUFDZCxDQUFDLEVBQUc7RUFFSixJQUFJLENBQUN1RyxlQUFlLEVBQUU7RUFFdEIsSUFBSXZLLElBQUksR0FBR3lCLENBQUMsQ0FBQ3VFLFFBQVE7RUFDckIsSUFBSWpCLElBQUksR0FBR3RELENBQUMsQ0FBQzJFLGVBQWU7RUFDNUIsSUFBSW9FLFFBQVEsR0FBR3pGLElBQUksQ0FBQ3RDLE1BQU07RUFFMUIsSUFBSWdJLFlBQVksR0FBR3pJLENBQUMsQ0FBQ0UsZ0JBQWdCLENBQUMsY0FBYyxDQUFDO0VBQ3JELElBQUlrRCxNQUFNLEdBQUdwRCxDQUFDLENBQUMwSSxTQUFTLEVBQUU7O0VBRTFCO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsSUFBSUMsUUFBUSxHQUFHLENBQUMsQ0FBQztFQUNqQixJQUFJQyxZQUFZO0VBQ2hCLElBQUlDLFlBQVksQ0FBQyxDQUFFOztFQUVuQjtFQUNBLElBQUlDLGFBQWEsR0FBRyxTQUFoQkEsYUFBYSxDQUFZNUssR0FBRyxFQUFFNkssU0FBUyxFQUFFQyxTQUFTLEVBQUVDLFFBQVEsRUFBRTtJQUNoRS9LLEdBQUcsQ0FBQ2tFLE1BQU0sQ0FBQzJHLFNBQVMsRUFBRUMsU0FBUyxDQUFDO0lBQ2hDLElBQUlQLFlBQVksRUFBRTtNQUNoQixLQUFLLElBQUl6RyxDQUFDLEdBQUdpSCxRQUFRLENBQUN4SSxNQUFNLEdBQUcsQ0FBQyxFQUFFdUIsQ0FBQyxJQUFJLENBQUMsRUFBRUEsQ0FBQyxFQUFFLEVBQUU7UUFDN0MsSUFBSWtILEVBQUUsR0FBR0QsUUFBUSxDQUFDakgsQ0FBQyxDQUFDO1FBQ3BCOUQsR0FBRyxDQUFDa0UsTUFBTSxDQUFDOEcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFQSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7TUFDMUI7SUFDRjtFQUNGLENBQUM7O0VBRUQ7RUFDQSxLQUFLLElBQUlDLE1BQU0sR0FBR1gsUUFBUSxHQUFHLENBQUMsRUFBRVcsTUFBTSxJQUFJLENBQUMsRUFBRUEsTUFBTSxFQUFFLEVBQUU7SUFDckQsSUFBSWpMLEdBQUcsR0FBR3VCLENBQUMsQ0FBQ2tCLGNBQWM7SUFDMUIsSUFBSVIsT0FBTyxHQUFHZ0QsUUFBUSxDQUFDZ0csTUFBTSxDQUFDO0lBQzlCLElBQUksQ0FBQ25KLENBQUMsQ0FBQ0UsZ0JBQWdCLENBQUMsV0FBVyxFQUFFQyxPQUFPLENBQUMsRUFBRTtJQUUvQyxJQUFJaUYsU0FBUyxHQUFHcEYsQ0FBQyxDQUFDNkUsZ0JBQWdCLENBQUMsV0FBVyxFQUFFMUUsT0FBTyxDQUFDO0lBQ3hELElBQUlGLFFBQVEsR0FBR0QsQ0FBQyxDQUFDRSxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUVDLE9BQU8sQ0FBQztJQUN0RCxJQUFJVCxLQUFLLEdBQUcwRCxNQUFNLENBQUMrRixNQUFNLENBQUM7SUFDMUIsSUFBSXJGLElBQUksR0FBRzlELENBQUMsQ0FBQytELHVCQUF1QixDQUFDNUQsT0FBTyxDQUFDO0lBQzdDLElBQUlpSixLQUFLLEdBQUcsR0FBRyxHQUFHdEYsSUFBSSxDQUFDdUYsT0FBTyxHQUFHdkYsSUFBSSxDQUFDd0YsTUFBTTtJQUM1QyxJQUFJRixLQUFLLEdBQUcsR0FBRyxFQUFFQSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQ3hCLElBQUlBLEtBQUssR0FBRyxHQUFHLEVBQUVBLEtBQUssR0FBRyxHQUFHO0lBQ2pDQSxLQUFLLEdBQUdwTCxJQUFJLENBQUNTLENBQUMsR0FBRzJLLEtBQUssR0FBR3BMLElBQUksQ0FBQ08sQ0FBQztJQUUvQixJQUFJK0IsTUFBTSxHQUFHeUMsSUFBSSxDQUFDb0csTUFBTSxDQUFDO0lBQ3pCLElBQUk1SSxJQUFJLEdBQUd6QyxLQUFLLENBQUMwQyxjQUFjLENBQUNGLE1BQU0sRUFBRSxDQUFDLEVBQUVBLE1BQU0sQ0FBQ0csTUFBTSxFQUNwRHJELHFCQUFxQixDQUFDOEIscUJBQXFCLENBQ3ZDYyxDQUFDLENBQUNFLGdCQUFnQixDQUFDLHdCQUF3QixFQUFFQyxPQUFPLENBQUMsQ0FBQyxDQUFDOztJQUUvRDtJQUNBLElBQUltRixLQUFLLEdBQUdDLEdBQUc7SUFDZixJQUFJRSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNyQixJQUFJSixLQUFLO0lBQ1Q7SUFDQSxJQUFJSyxHQUFHLEdBQUc1SCxLQUFLLENBQUM2SCxNQUFNLENBQUNqRyxLQUFLLENBQUM7SUFDN0IsSUFBSWtHLFNBQVMsR0FDVCxPQUFPLEdBQUdGLEdBQUcsQ0FBQ0csQ0FBQyxHQUFHLEdBQUcsR0FBR0gsR0FBRyxDQUFDMUYsQ0FBQyxHQUFHLEdBQUcsR0FBRzBGLEdBQUcsQ0FBQ0ksQ0FBQyxHQUFHLEdBQUcsR0FBR1YsU0FBUyxHQUFHLEdBQUc7SUFDdkVsSCxHQUFHLENBQUM2SCxTQUFTLEdBQUdILFNBQVM7SUFDekIxSCxHQUFHLENBQUNFLFNBQVMsRUFBRTtJQUNmLElBQUltTCxNQUFNO01BQUVDLFFBQVEsR0FBRyxJQUFJOztJQUUzQjtJQUNBO0lBQ0EsSUFBSWxKLE1BQU0sQ0FBQ0csTUFBTSxHQUFHLENBQUMsR0FBR1QsQ0FBQyxDQUFDbkMsTUFBTSxJQUFJNEwsbUJBQU8sQ0FBQ0MsZ0JBQWdCLEVBQUU7TUFDNUR4TCxHQUFHLEdBQUdkLHFCQUFxQixDQUFDbUosZ0JBQWdCLENBQUNySSxHQUFHLENBQUM7SUFDbkQ7O0lBRUE7SUFDQTtJQUNBO0lBQ0E7SUFDQSxJQUFJK0ssUUFBUSxHQUFHLEVBQUU7O0lBRWpCO0lBQ0E7SUFDQTtJQUNBLElBQUkzSCxLQUFLO0lBQ1QsT0FBT2YsSUFBSSxDQUFDaUMsT0FBTyxFQUFFO01BQ25CbEIsS0FBSyxHQUFHZixJQUFJLENBQUNnQyxJQUFJLEVBQUU7TUFDbkIsSUFBSSxDQUFDekUsS0FBSyxDQUFDNkwsSUFBSSxDQUFDckksS0FBSyxDQUFDL0MsQ0FBQyxDQUFDLElBQUksQ0FBQzBCLFFBQVEsRUFBRTtRQUNyQzZJLGFBQWEsQ0FBQzVLLEdBQUcsRUFBRW9ILEtBQUssRUFBRUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFd0QsUUFBUSxDQUFDO1FBQzlDQSxRQUFRLEdBQUcsRUFBRTtRQUNiM0QsS0FBSyxHQUFHQyxHQUFHO1FBQ1gsSUFBSWpFLEtBQUssQ0FBQ3NJLFNBQVMsS0FBSyxJQUFJLElBQUksQ0FBQzFELEtBQUssQ0FBQzVFLEtBQUssQ0FBQ3NJLFNBQVMsQ0FBQyxFQUFFO1VBQ3ZEakIsUUFBUSxDQUFDckgsS0FBSyxDQUFDZSxPQUFPLENBQUMsR0FBR3JFLElBQUksQ0FBQ1MsQ0FBQyxHQUFHNkMsS0FBSyxDQUFDc0ksU0FBUyxHQUFHNUwsSUFBSSxDQUFDTyxDQUFDO1FBQzdEO1FBQ0E7TUFDRjtNQUNBLElBQUlrSyxZQUFZLEVBQUU7UUFDaEIsSUFBSSxDQUFDZSxRQUFRLElBQUlELE1BQU0sSUFBSWpJLEtBQUssQ0FBQ3VJLElBQUksRUFBRTtVQUNyQztRQUNGLENBQUMsTUFBTTtVQUNMTCxRQUFRLEdBQUcsS0FBSztVQUNoQkQsTUFBTSxHQUFHakksS0FBSyxDQUFDdUksSUFBSTtRQUNyQjtRQUVBakIsWUFBWSxHQUFHRCxRQUFRLENBQUNySCxLQUFLLENBQUNlLE9BQU8sQ0FBQztRQUN0QyxJQUFJeUgsS0FBSztRQUNULElBQUlsQixZQUFZLEtBQUszQyxTQUFTLEVBQUU7VUFDOUI2RCxLQUFLLEdBQUdWLEtBQUs7UUFDZixDQUFDLE1BQU07VUFDTCxJQUFHUCxZQUFZLEVBQUU7WUFDZmlCLEtBQUssR0FBR2xCLFlBQVksQ0FBQyxDQUFDLENBQUM7VUFDekIsQ0FBQyxNQUFNO1lBQ0xrQixLQUFLLEdBQUdsQixZQUFZO1VBQ3RCO1FBQ0Y7UUFDQXZELEtBQUssR0FBRyxDQUFFL0QsS0FBSyxDQUFDWSxPQUFPLEVBQUU0SCxLQUFLLENBQUU7UUFFaEMsSUFBSTdKLFFBQVEsRUFBRTtVQUNaO1VBQ0E7VUFDQSxJQUFJd0YsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQ3BCa0QsUUFBUSxDQUFDckgsS0FBSyxDQUFDZSxPQUFPLENBQUMsR0FBRyxDQUFFZixLQUFLLENBQUNZLE9BQU8sRUFBRWtILEtBQUssQ0FBRTtVQUNwRCxDQUFDLE1BQU07WUFDTFQsUUFBUSxDQUFDckgsS0FBSyxDQUFDZSxPQUFPLENBQUMsR0FBRyxDQUFFZixLQUFLLENBQUNZLE9BQU8sRUFBRXVELE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBRTtVQUN4RDtRQUNGLENBQUMsTUFBTTtVQUNMa0QsUUFBUSxDQUFDckgsS0FBSyxDQUFDZSxPQUFPLENBQUMsR0FBR2YsS0FBSyxDQUFDWSxPQUFPO1FBQ3pDO01BRUYsQ0FBQyxNQUFNO1FBQ0wsSUFBSWdFLEtBQUssQ0FBQzVFLEtBQUssQ0FBQ1ksT0FBTyxDQUFDLElBQUlqQyxRQUFRLEVBQUU7VUFDcENvRixLQUFLLEdBQUcsQ0FBRXJILElBQUksQ0FBQ08sQ0FBQyxHQUFHUCxJQUFJLENBQUNTLENBQUMsRUFBRTJLLEtBQUssQ0FBRTtRQUNwQyxDQUFDLE1BQU07VUFDTC9ELEtBQUssR0FBRyxDQUFFL0QsS0FBSyxDQUFDWSxPQUFPLEVBQUVrSCxLQUFLLENBQUU7UUFDbEM7TUFDRjtNQUNBLElBQUksQ0FBQ2xELEtBQUssQ0FBQ1osS0FBSyxDQUFDLEVBQUU7UUFDakI7UUFDQSxJQUFJckYsUUFBUSxFQUFFO1VBQ1ovQixHQUFHLENBQUNrRSxNQUFNLENBQUNkLEtBQUssQ0FBQ2UsT0FBTyxFQUFFb0QsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1VBQ3BDdkgsR0FBRyxDQUFDa0UsTUFBTSxDQUFDZCxLQUFLLENBQUNlLE9BQU8sRUFBRWdELEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQyxDQUFDLE1BQU07VUFDTG5ILEdBQUcsQ0FBQ2tFLE1BQU0sQ0FBQ2QsS0FBSyxDQUFDZSxPQUFPLEVBQUVnRCxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckM7O1FBRUE7UUFDQSxJQUFJb0QsWUFBWSxFQUFFO1VBQ2hCUSxRQUFRLENBQUN0RyxJQUFJLENBQUMsQ0FBQzJDLEtBQUssRUFBRUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7VUFDakMsSUFBSW9ELFlBQVksSUFBSUQsWUFBWSxFQUFFO1lBQ2hDO1lBQ0FLLFFBQVEsQ0FBQ3RHLElBQUksQ0FBQyxDQUFDckIsS0FBSyxDQUFDZSxPQUFPLEVBQUV1RyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztVQUNqRCxDQUFDLE1BQU07WUFDTEssUUFBUSxDQUFDdEcsSUFBSSxDQUFDLENBQUNyQixLQUFLLENBQUNlLE9BQU8sRUFBRWdELEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1VBQzFDO1FBQ0Y7TUFDRixDQUFDLE1BQU07UUFDTG5ILEdBQUcsQ0FBQ2lFLE1BQU0sQ0FBQ2IsS0FBSyxDQUFDZSxPQUFPLEVBQUVnRCxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkNuSCxHQUFHLENBQUNrRSxNQUFNLENBQUNkLEtBQUssQ0FBQ2UsT0FBTyxFQUFFZ0QsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO01BQ3JDO01BQ0FJLE1BQU0sR0FBR0osS0FBSztNQUNkQyxLQUFLLEdBQUdoRSxLQUFLLENBQUNlLE9BQU87SUFDdkI7SUFDQXdHLFlBQVksR0FBRzVJLFFBQVE7SUFDdkIsSUFBSW9GLEtBQUssSUFBSS9ELEtBQUssRUFBRTtNQUNsQndILGFBQWEsQ0FBQzVLLEdBQUcsRUFBRW9ELEtBQUssQ0FBQ2UsT0FBTyxFQUFFZ0QsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFNEQsUUFBUSxDQUFDO01BQ3JEQSxRQUFRLEdBQUcsRUFBRTtJQUNmO0lBQ0EvSyxHQUFHLENBQUNvSSxJQUFJLEVBQUU7RUFDWjtBQUNGLENBQUM7QUFBQyxlQUVhbEoscUJBQXFCO0FBQUE7QUFBQSJ9