/**
 * @license
 * Copyright 2011 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licenced: https://opensource.org/licenses/MIT
 */

/**
 * @fileoverview Based on PlotKitLayout, but modified to meet the needs of
 * dygraphs.
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
 * Creates a new DygraphLayout object.
 *
 * This class contains all the data to be charted.
 * It uses data coordinates, but also records the chart range (in data
 * coordinates) and hence is able to calculate percentage positions ('In this
 * view, Point A lies 25% down the x-axis.')
 *
 * Two things that it does not do are:
 * 1. Record pixel coordinates for anything.
 * 2. (oddly) determine anything about the layout of chart elements.
 *
 * The naming is a vestige of Dygraph's original PlotKit roots.
 *
 * @constructor
 */
var DygraphLayout = function DygraphLayout(dygraph) {
  this.dygraph_ = dygraph;
  /**
   * Array of points for each series.
   *
   * [series index][row index in series] = |Point| structure,
   * where series index refers to visible series only, and the
   * point index is for the reduced set of points for the current
   * zoom region (including one point just outside the window).
   * All points in the same row index share the same X value.
   *
   * @type {Array.<Array.<Dygraph.PointType>>}
   */
  this.points = [];
  this.setNames = [];
  this.annotations = [];
  this.yAxes_ = null;

  // TODO(danvk): it's odd that xTicks_ and yTicks_ are inputs,
  // but xticks and yticks are outputs. Clean this up.
  this.xTicks_ = null;
  this.yTicks_ = null;
};

/**
 * Add points for a single series.
 *
 * @param {string} setname Name of the series.
 * @param {Array.<Dygraph.PointType>} set_xy Points for the series.
 */
DygraphLayout.prototype.addDataset = function (setname, set_xy) {
  this.points.push(set_xy);
  this.setNames.push(setname);
};

/**
 * Returns the box which the chart should be drawn in. This is the canvas's
 * box, less space needed for the axis and chart labels.
 *
 * @return {{x: number, y: number, w: number, h: number}}
 */
DygraphLayout.prototype.getPlotArea = function () {
  return this.area_;
};

// Compute the box which the chart should be drawn in. This is the canvas's
// box, less space needed for axis, chart labels, and other plug-ins.
// NOTE: This should only be called by Dygraph.predraw_().
DygraphLayout.prototype.computePlotArea = function () {
  var area = {
    // TODO(danvk): per-axis setting.
    x: 0,
    y: 0
  };
  area.w = this.dygraph_.width_ - area.x - this.dygraph_.getOption('rightGap');
  area.h = this.dygraph_.height_;

  // Let plugins reserve space.
  var e = {
    chart_div: this.dygraph_.graphDiv,
    reserveSpaceLeft: function reserveSpaceLeft(px) {
      var r = {
        x: area.x,
        y: area.y,
        w: px,
        h: area.h
      };
      area.x += px;
      area.w -= px;
      return r;
    },
    reserveSpaceRight: function reserveSpaceRight(px) {
      var r = {
        x: area.x + area.w - px,
        y: area.y,
        w: px,
        h: area.h
      };
      area.w -= px;
      return r;
    },
    reserveSpaceTop: function reserveSpaceTop(px) {
      var r = {
        x: area.x,
        y: area.y,
        w: area.w,
        h: px
      };
      area.y += px;
      area.h -= px;
      return r;
    },
    reserveSpaceBottom: function reserveSpaceBottom(px) {
      var r = {
        x: area.x,
        y: area.y + area.h - px,
        w: area.w,
        h: px
      };
      area.h -= px;
      return r;
    },
    chartRect: function chartRect() {
      return {
        x: area.x,
        y: area.y,
        w: area.w,
        h: area.h
      };
    }
  };
  this.dygraph_.cascadeEvents_('layout', e);
  this.area_ = area;
};
DygraphLayout.prototype.setAnnotations = function (ann) {
  // The Dygraph object's annotations aren't parsed. We parse them here and
  // save a copy. If there is no parser, then the user must be using raw format.
  this.annotations = [];
  var parse = this.dygraph_.getOption('xValueParser') || function (x) {
    return x;
  };
  for (var i = 0; i < ann.length; i++) {
    var a = {};
    if (!ann[i].xval && ann[i].x === undefined) {
      console.error("Annotations must have an 'x' property");
      return;
    }
    if (ann[i].icon && !(ann[i].hasOwnProperty('width') && ann[i].hasOwnProperty('height'))) {
      console.error("Must set width and height when setting " + "annotation.icon property");
      return;
    }
    utils.update(a, ann[i]);
    if (!a.xval) a.xval = parse(a.x);
    this.annotations.push(a);
  }
};
DygraphLayout.prototype.setXTicks = function (xTicks) {
  this.xTicks_ = xTicks;
};

// TODO(danvk): add this to the Dygraph object's API or move it into Layout.
DygraphLayout.prototype.setYAxes = function (yAxes) {
  this.yAxes_ = yAxes;
};
DygraphLayout.prototype.evaluate = function () {
  this._xAxis = {};
  this._evaluateLimits();
  this._evaluateLineCharts();
  this._evaluateLineTicks();
  this._evaluateAnnotations();
};
DygraphLayout.prototype._evaluateLimits = function () {
  var xlimits = this.dygraph_.xAxisRange();
  this._xAxis.minval = xlimits[0];
  this._xAxis.maxval = xlimits[1];
  var xrange = xlimits[1] - xlimits[0];
  this._xAxis.scale = xrange !== 0 ? 1 / xrange : 1.0;
  if (this.dygraph_.getOptionForAxis("logscale", 'x')) {
    this._xAxis.xlogrange = utils.log10(this._xAxis.maxval) - utils.log10(this._xAxis.minval);
    this._xAxis.xlogscale = this._xAxis.xlogrange !== 0 ? 1.0 / this._xAxis.xlogrange : 1.0;
  }
  for (var i = 0; i < this.yAxes_.length; i++) {
    var axis = this.yAxes_[i];
    axis.minyval = axis.computedValueRange[0];
    axis.maxyval = axis.computedValueRange[1];
    axis.yrange = axis.maxyval - axis.minyval;
    axis.yscale = axis.yrange !== 0 ? 1.0 / axis.yrange : 1.0;
    if (this.dygraph_.getOption("logscale") || axis.logscale) {
      axis.ylogrange = utils.log10(axis.maxyval) - utils.log10(axis.minyval);
      axis.ylogscale = axis.ylogrange !== 0 ? 1.0 / axis.ylogrange : 1.0;
      if (!isFinite(axis.ylogrange) || isNaN(axis.ylogrange)) {
        console.error('axis ' + i + ' of graph at ' + axis.g + ' can\'t be displayed in log scale for range [' + axis.minyval + ' - ' + axis.maxyval + ']');
      }
    }
  }
};
DygraphLayout.calcXNormal_ = function (value, xAxis, logscale) {
  if (logscale) {
    return (utils.log10(value) - utils.log10(xAxis.minval)) * xAxis.xlogscale;
  } else {
    return (value - xAxis.minval) * xAxis.scale;
  }
};

/**
 * @param {DygraphAxisType} axis
 * @param {number} value
 * @param {boolean} logscale
 * @return {number}
 */
DygraphLayout.calcYNormal_ = function (axis, value, logscale) {
  if (logscale) {
    var x = 1.0 - (utils.log10(value) - utils.log10(axis.minyval)) * axis.ylogscale;
    return isFinite(x) ? x : NaN; // shim for v8 issue; see pull request 276
  } else {
    return 1.0 - (value - axis.minyval) * axis.yscale;
  }
};
DygraphLayout.prototype._evaluateLineCharts = function () {
  var isStacked = this.dygraph_.getOption("stackedGraph");
  var isLogscaleForX = this.dygraph_.getOptionForAxis("logscale", 'x');
  for (var setIdx = 0; setIdx < this.points.length; setIdx++) {
    var points = this.points[setIdx];
    var setName = this.setNames[setIdx];
    var connectSeparated = this.dygraph_.getOption('connectSeparatedPoints', setName);
    var axis = this.dygraph_.axisPropertiesForSeries(setName);
    // TODO (konigsberg): use optionsForAxis instead.
    var logscale = this.dygraph_.attributes_.getForSeries("logscale", setName);
    for (var j = 0; j < points.length; j++) {
      var point = points[j];

      // Range from 0-1 where 0 represents left and 1 represents right.
      point.x = DygraphLayout.calcXNormal_(point.xval, this._xAxis, isLogscaleForX);
      // Range from 0-1 where 0 represents top and 1 represents bottom
      var yval = point.yval;
      if (isStacked) {
        point.y_stacked = DygraphLayout.calcYNormal_(axis, point.yval_stacked, logscale);
        if (yval !== null && !isNaN(yval)) {
          yval = point.yval_stacked;
        }
      }
      if (yval === null) {
        yval = NaN;
        if (!connectSeparated) {
          point.yval = NaN;
        }
      }
      point.y = DygraphLayout.calcYNormal_(axis, yval, logscale);
    }
    this.dygraph_.dataHandler_.onLineEvaluated(points, axis, logscale);
  }
};
DygraphLayout.prototype._evaluateLineTicks = function () {
  var i, tick, label, pos, v, has_tick;
  this.xticks = [];
  for (i = 0; i < this.xTicks_.length; i++) {
    tick = this.xTicks_[i];
    label = tick.label;
    has_tick = !('label_v' in tick);
    v = has_tick ? tick.v : tick.label_v;
    pos = this.dygraph_.toPercentXCoord(v);
    if (pos >= 0.0 && pos < 1.0) {
      this.xticks.push({
        pos: pos,
        label: label,
        has_tick: has_tick
      });
    }
  }
  this.yticks = [];
  for (i = 0; i < this.yAxes_.length; i++) {
    var axis = this.yAxes_[i];
    for (var j = 0; j < axis.ticks.length; j++) {
      tick = axis.ticks[j];
      label = tick.label;
      has_tick = !('label_v' in tick);
      v = has_tick ? tick.v : tick.label_v;
      pos = this.dygraph_.toPercentYCoord(v, i);
      if (pos > 0.0 && pos <= 1.0) {
        this.yticks.push({
          axis: i,
          pos: pos,
          label: label,
          has_tick: has_tick
        });
      }
    }
  }
};
DygraphLayout.prototype._evaluateAnnotations = function () {
  // Add the annotations to the point to which they belong.
  // Make a map from (setName, xval) to annotation for quick lookups.
  var i;
  var annotations = {};
  for (i = 0; i < this.annotations.length; i++) {
    var a = this.annotations[i];
    annotations[a.xval + "," + a.series] = a;
  }
  this.annotated_points = [];

  // Exit the function early if there are no annotations.
  if (!this.annotations || !this.annotations.length) {
    return;
  }

  // TODO(antrob): loop through annotations not points.
  for (var setIdx = 0; setIdx < this.points.length; setIdx++) {
    var points = this.points[setIdx];
    for (i = 0; i < points.length; i++) {
      var p = points[i];
      var k = p.xval + "," + p.name;
      if (k in annotations) {
        p.annotation = annotations[k];
        this.annotated_points.push(p);
        //if there are multiple same x-valued points, the annotation would be rendered multiple times
        //remove already rendered annotation
        delete annotations[k];
      }
    }
  }
};

/**
 * Convenience function to remove all the data sets from a graph
 */
DygraphLayout.prototype.removeAllDatasets = function () {
  delete this.points;
  delete this.setNames;
  delete this.setPointsLengths;
  delete this.setPointsOffsets;
  this.points = [];
  this.setNames = [];
  this.setPointsLengths = [];
  this.setPointsOffsets = [];
};
var _default = DygraphLayout;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEeWdyYXBoTGF5b3V0IiwiZHlncmFwaCIsImR5Z3JhcGhfIiwicG9pbnRzIiwic2V0TmFtZXMiLCJhbm5vdGF0aW9ucyIsInlBeGVzXyIsInhUaWNrc18iLCJ5VGlja3NfIiwicHJvdG90eXBlIiwiYWRkRGF0YXNldCIsInNldG5hbWUiLCJzZXRfeHkiLCJwdXNoIiwiZ2V0UGxvdEFyZWEiLCJhcmVhXyIsImNvbXB1dGVQbG90QXJlYSIsImFyZWEiLCJ4IiwieSIsInciLCJ3aWR0aF8iLCJnZXRPcHRpb24iLCJoIiwiaGVpZ2h0XyIsImUiLCJjaGFydF9kaXYiLCJncmFwaERpdiIsInJlc2VydmVTcGFjZUxlZnQiLCJweCIsInIiLCJyZXNlcnZlU3BhY2VSaWdodCIsInJlc2VydmVTcGFjZVRvcCIsInJlc2VydmVTcGFjZUJvdHRvbSIsImNoYXJ0UmVjdCIsImNhc2NhZGVFdmVudHNfIiwic2V0QW5ub3RhdGlvbnMiLCJhbm4iLCJwYXJzZSIsImkiLCJsZW5ndGgiLCJhIiwieHZhbCIsInVuZGVmaW5lZCIsImNvbnNvbGUiLCJlcnJvciIsImljb24iLCJoYXNPd25Qcm9wZXJ0eSIsInV0aWxzIiwidXBkYXRlIiwic2V0WFRpY2tzIiwieFRpY2tzIiwic2V0WUF4ZXMiLCJ5QXhlcyIsImV2YWx1YXRlIiwiX3hBeGlzIiwiX2V2YWx1YXRlTGltaXRzIiwiX2V2YWx1YXRlTGluZUNoYXJ0cyIsIl9ldmFsdWF0ZUxpbmVUaWNrcyIsIl9ldmFsdWF0ZUFubm90YXRpb25zIiwieGxpbWl0cyIsInhBeGlzUmFuZ2UiLCJtaW52YWwiLCJtYXh2YWwiLCJ4cmFuZ2UiLCJzY2FsZSIsImdldE9wdGlvbkZvckF4aXMiLCJ4bG9ncmFuZ2UiLCJsb2cxMCIsInhsb2dzY2FsZSIsImF4aXMiLCJtaW55dmFsIiwiY29tcHV0ZWRWYWx1ZVJhbmdlIiwibWF4eXZhbCIsInlyYW5nZSIsInlzY2FsZSIsImxvZ3NjYWxlIiwieWxvZ3JhbmdlIiwieWxvZ3NjYWxlIiwiaXNGaW5pdGUiLCJpc05hTiIsImciLCJjYWxjWE5vcm1hbF8iLCJ2YWx1ZSIsInhBeGlzIiwiY2FsY1lOb3JtYWxfIiwiTmFOIiwiaXNTdGFja2VkIiwiaXNMb2dzY2FsZUZvclgiLCJzZXRJZHgiLCJzZXROYW1lIiwiY29ubmVjdFNlcGFyYXRlZCIsImF4aXNQcm9wZXJ0aWVzRm9yU2VyaWVzIiwiYXR0cmlidXRlc18iLCJnZXRGb3JTZXJpZXMiLCJqIiwicG9pbnQiLCJ5dmFsIiwieV9zdGFja2VkIiwieXZhbF9zdGFja2VkIiwiZGF0YUhhbmRsZXJfIiwib25MaW5lRXZhbHVhdGVkIiwidGljayIsImxhYmVsIiwicG9zIiwidiIsImhhc190aWNrIiwieHRpY2tzIiwibGFiZWxfdiIsInRvUGVyY2VudFhDb29yZCIsInl0aWNrcyIsInRpY2tzIiwidG9QZXJjZW50WUNvb3JkIiwic2VyaWVzIiwiYW5ub3RhdGVkX3BvaW50cyIsInAiLCJrIiwibmFtZSIsImFubm90YXRpb24iLCJyZW1vdmVBbGxEYXRhc2V0cyIsInNldFBvaW50c0xlbmd0aHMiLCJzZXRQb2ludHNPZmZzZXRzIl0sInNvdXJjZXMiOlsiLi4vc3JjL2R5Z3JhcGgtbGF5b3V0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDExIERhbiBWYW5kZXJrYW0gKGRhbnZka0BnbWFpbC5jb20pXG4gKiBNSVQtbGljZW5jZWQ6IGh0dHBzOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEJhc2VkIG9uIFBsb3RLaXRMYXlvdXQsIGJ1dCBtb2RpZmllZCB0byBtZWV0IHRoZSBuZWVkcyBvZlxuICogZHlncmFwaHMuXG4gKi9cblxuLypnbG9iYWwgRHlncmFwaDpmYWxzZSAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gJy4vZHlncmFwaC11dGlscyc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBEeWdyYXBoTGF5b3V0IG9iamVjdC5cbiAqXG4gKiBUaGlzIGNsYXNzIGNvbnRhaW5zIGFsbCB0aGUgZGF0YSB0byBiZSBjaGFydGVkLlxuICogSXQgdXNlcyBkYXRhIGNvb3JkaW5hdGVzLCBidXQgYWxzbyByZWNvcmRzIHRoZSBjaGFydCByYW5nZSAoaW4gZGF0YVxuICogY29vcmRpbmF0ZXMpIGFuZCBoZW5jZSBpcyBhYmxlIHRvIGNhbGN1bGF0ZSBwZXJjZW50YWdlIHBvc2l0aW9ucyAoJ0luIHRoaXNcbiAqIHZpZXcsIFBvaW50IEEgbGllcyAyNSUgZG93biB0aGUgeC1heGlzLicpXG4gKlxuICogVHdvIHRoaW5ncyB0aGF0IGl0IGRvZXMgbm90IGRvIGFyZTpcbiAqIDEuIFJlY29yZCBwaXhlbCBjb29yZGluYXRlcyBmb3IgYW55dGhpbmcuXG4gKiAyLiAob2RkbHkpIGRldGVybWluZSBhbnl0aGluZyBhYm91dCB0aGUgbGF5b3V0IG9mIGNoYXJ0IGVsZW1lbnRzLlxuICpcbiAqIFRoZSBuYW1pbmcgaXMgYSB2ZXN0aWdlIG9mIER5Z3JhcGgncyBvcmlnaW5hbCBQbG90S2l0IHJvb3RzLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICovXG52YXIgRHlncmFwaExheW91dCA9IGZ1bmN0aW9uKGR5Z3JhcGgpIHtcbiAgdGhpcy5keWdyYXBoXyA9IGR5Z3JhcGg7XG4gIC8qKlxuICAgKiBBcnJheSBvZiBwb2ludHMgZm9yIGVhY2ggc2VyaWVzLlxuICAgKlxuICAgKiBbc2VyaWVzIGluZGV4XVtyb3cgaW5kZXggaW4gc2VyaWVzXSA9IHxQb2ludHwgc3RydWN0dXJlLFxuICAgKiB3aGVyZSBzZXJpZXMgaW5kZXggcmVmZXJzIHRvIHZpc2libGUgc2VyaWVzIG9ubHksIGFuZCB0aGVcbiAgICogcG9pbnQgaW5kZXggaXMgZm9yIHRoZSByZWR1Y2VkIHNldCBvZiBwb2ludHMgZm9yIHRoZSBjdXJyZW50XG4gICAqIHpvb20gcmVnaW9uIChpbmNsdWRpbmcgb25lIHBvaW50IGp1c3Qgb3V0c2lkZSB0aGUgd2luZG93KS5cbiAgICogQWxsIHBvaW50cyBpbiB0aGUgc2FtZSByb3cgaW5kZXggc2hhcmUgdGhlIHNhbWUgWCB2YWx1ZS5cbiAgICpcbiAgICogQHR5cGUge0FycmF5LjxBcnJheS48RHlncmFwaC5Qb2ludFR5cGU+Pn1cbiAgICovXG4gIHRoaXMucG9pbnRzID0gW107XG4gIHRoaXMuc2V0TmFtZXMgPSBbXTtcbiAgdGhpcy5hbm5vdGF0aW9ucyA9IFtdO1xuICB0aGlzLnlBeGVzXyA9IG51bGw7XG5cbiAgLy8gVE9ETyhkYW52ayk6IGl0J3Mgb2RkIHRoYXQgeFRpY2tzXyBhbmQgeVRpY2tzXyBhcmUgaW5wdXRzLFxuICAvLyBidXQgeHRpY2tzIGFuZCB5dGlja3MgYXJlIG91dHB1dHMuIENsZWFuIHRoaXMgdXAuXG4gIHRoaXMueFRpY2tzXyA9IG51bGw7XG4gIHRoaXMueVRpY2tzXyA9IG51bGw7XG59O1xuXG4vKipcbiAqIEFkZCBwb2ludHMgZm9yIGEgc2luZ2xlIHNlcmllcy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc2V0bmFtZSBOYW1lIG9mIHRoZSBzZXJpZXMuXG4gKiBAcGFyYW0ge0FycmF5LjxEeWdyYXBoLlBvaW50VHlwZT59IHNldF94eSBQb2ludHMgZm9yIHRoZSBzZXJpZXMuXG4gKi9cbkR5Z3JhcGhMYXlvdXQucHJvdG90eXBlLmFkZERhdGFzZXQgPSBmdW5jdGlvbihzZXRuYW1lLCBzZXRfeHkpIHtcbiAgdGhpcy5wb2ludHMucHVzaChzZXRfeHkpO1xuICB0aGlzLnNldE5hbWVzLnB1c2goc2V0bmFtZSk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGJveCB3aGljaCB0aGUgY2hhcnQgc2hvdWxkIGJlIGRyYXduIGluLiBUaGlzIGlzIHRoZSBjYW52YXMnc1xuICogYm94LCBsZXNzIHNwYWNlIG5lZWRlZCBmb3IgdGhlIGF4aXMgYW5kIGNoYXJ0IGxhYmVscy5cbiAqXG4gKiBAcmV0dXJuIHt7eDogbnVtYmVyLCB5OiBudW1iZXIsIHc6IG51bWJlciwgaDogbnVtYmVyfX1cbiAqL1xuRHlncmFwaExheW91dC5wcm90b3R5cGUuZ2V0UGxvdEFyZWEgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuYXJlYV87XG59O1xuXG4vLyBDb21wdXRlIHRoZSBib3ggd2hpY2ggdGhlIGNoYXJ0IHNob3VsZCBiZSBkcmF3biBpbi4gVGhpcyBpcyB0aGUgY2FudmFzJ3Ncbi8vIGJveCwgbGVzcyBzcGFjZSBuZWVkZWQgZm9yIGF4aXMsIGNoYXJ0IGxhYmVscywgYW5kIG90aGVyIHBsdWctaW5zLlxuLy8gTk9URTogVGhpcyBzaG91bGQgb25seSBiZSBjYWxsZWQgYnkgRHlncmFwaC5wcmVkcmF3XygpLlxuRHlncmFwaExheW91dC5wcm90b3R5cGUuY29tcHV0ZVBsb3RBcmVhID0gZnVuY3Rpb24oKSB7XG4gIHZhciBhcmVhID0ge1xuICAgIC8vIFRPRE8oZGFudmspOiBwZXItYXhpcyBzZXR0aW5nLlxuICAgIHg6IDAsXG4gICAgeTogMFxuICB9O1xuXG4gIGFyZWEudyA9IHRoaXMuZHlncmFwaF8ud2lkdGhfIC0gYXJlYS54IC0gdGhpcy5keWdyYXBoXy5nZXRPcHRpb24oJ3JpZ2h0R2FwJyk7XG4gIGFyZWEuaCA9IHRoaXMuZHlncmFwaF8uaGVpZ2h0XztcblxuICAvLyBMZXQgcGx1Z2lucyByZXNlcnZlIHNwYWNlLlxuICB2YXIgZSA9IHtcbiAgICBjaGFydF9kaXY6IHRoaXMuZHlncmFwaF8uZ3JhcGhEaXYsXG4gICAgcmVzZXJ2ZVNwYWNlTGVmdDogZnVuY3Rpb24ocHgpIHtcbiAgICAgIHZhciByID0ge1xuICAgICAgICB4OiBhcmVhLngsXG4gICAgICAgIHk6IGFyZWEueSxcbiAgICAgICAgdzogcHgsXG4gICAgICAgIGg6IGFyZWEuaFxuICAgICAgfTtcbiAgICAgIGFyZWEueCArPSBweDtcbiAgICAgIGFyZWEudyAtPSBweDtcbiAgICAgIHJldHVybiByO1xuICAgIH0sXG4gICAgcmVzZXJ2ZVNwYWNlUmlnaHQ6IGZ1bmN0aW9uKHB4KSB7XG4gICAgICB2YXIgciA9IHtcbiAgICAgICAgeDogYXJlYS54ICsgYXJlYS53IC0gcHgsXG4gICAgICAgIHk6IGFyZWEueSxcbiAgICAgICAgdzogcHgsXG4gICAgICAgIGg6IGFyZWEuaFxuICAgICAgfTtcbiAgICAgIGFyZWEudyAtPSBweDtcbiAgICAgIHJldHVybiByO1xuICAgIH0sXG4gICAgcmVzZXJ2ZVNwYWNlVG9wOiBmdW5jdGlvbihweCkge1xuICAgICAgdmFyIHIgPSB7XG4gICAgICAgIHg6IGFyZWEueCxcbiAgICAgICAgeTogYXJlYS55LFxuICAgICAgICB3OiBhcmVhLncsXG4gICAgICAgIGg6IHB4XG4gICAgICB9O1xuICAgICAgYXJlYS55ICs9IHB4O1xuICAgICAgYXJlYS5oIC09IHB4O1xuICAgICAgcmV0dXJuIHI7XG4gICAgfSxcbiAgICByZXNlcnZlU3BhY2VCb3R0b206IGZ1bmN0aW9uKHB4KSB7XG4gICAgICB2YXIgciA9IHtcbiAgICAgICAgeDogYXJlYS54LFxuICAgICAgICB5OiBhcmVhLnkgKyBhcmVhLmggLSBweCxcbiAgICAgICAgdzogYXJlYS53LFxuICAgICAgICBoOiBweFxuICAgICAgfTtcbiAgICAgIGFyZWEuaCAtPSBweDtcbiAgICAgIHJldHVybiByO1xuICAgIH0sXG4gICAgY2hhcnRSZWN0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7eDphcmVhLngsIHk6YXJlYS55LCB3OmFyZWEudywgaDphcmVhLmh9O1xuICAgIH1cbiAgfTtcbiAgdGhpcy5keWdyYXBoXy5jYXNjYWRlRXZlbnRzXygnbGF5b3V0JywgZSk7XG5cbiAgdGhpcy5hcmVhXyA9IGFyZWE7XG59O1xuXG5EeWdyYXBoTGF5b3V0LnByb3RvdHlwZS5zZXRBbm5vdGF0aW9ucyA9IGZ1bmN0aW9uKGFubikge1xuICAvLyBUaGUgRHlncmFwaCBvYmplY3QncyBhbm5vdGF0aW9ucyBhcmVuJ3QgcGFyc2VkLiBXZSBwYXJzZSB0aGVtIGhlcmUgYW5kXG4gIC8vIHNhdmUgYSBjb3B5LiBJZiB0aGVyZSBpcyBubyBwYXJzZXIsIHRoZW4gdGhlIHVzZXIgbXVzdCBiZSB1c2luZyByYXcgZm9ybWF0LlxuICB0aGlzLmFubm90YXRpb25zID0gW107XG4gIHZhciBwYXJzZSA9IHRoaXMuZHlncmFwaF8uZ2V0T3B0aW9uKCd4VmFsdWVQYXJzZXInKSB8fCBmdW5jdGlvbih4KSB7IHJldHVybiB4OyB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFubi5sZW5ndGg7IGkrKykge1xuICAgIHZhciBhID0ge307XG4gICAgaWYgKCFhbm5baV0ueHZhbCAmJiBhbm5baV0ueCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiQW5ub3RhdGlvbnMgbXVzdCBoYXZlIGFuICd4JyBwcm9wZXJ0eVwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGFubltpXS5pY29uICYmXG4gICAgICAgICEoYW5uW2ldLmhhc093blByb3BlcnR5KCd3aWR0aCcpICYmXG4gICAgICAgICAgYW5uW2ldLmhhc093blByb3BlcnR5KCdoZWlnaHQnKSkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJNdXN0IHNldCB3aWR0aCBhbmQgaGVpZ2h0IHdoZW4gc2V0dGluZyBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiYW5ub3RhdGlvbi5pY29uIHByb3BlcnR5XCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB1dGlscy51cGRhdGUoYSwgYW5uW2ldKTtcbiAgICBpZiAoIWEueHZhbCkgYS54dmFsID0gcGFyc2UoYS54KTtcbiAgICB0aGlzLmFubm90YXRpb25zLnB1c2goYSk7XG4gIH1cbn07XG5cbkR5Z3JhcGhMYXlvdXQucHJvdG90eXBlLnNldFhUaWNrcyA9IGZ1bmN0aW9uKHhUaWNrcykge1xuICB0aGlzLnhUaWNrc18gPSB4VGlja3M7XG59O1xuXG4vLyBUT0RPKGRhbnZrKTogYWRkIHRoaXMgdG8gdGhlIER5Z3JhcGggb2JqZWN0J3MgQVBJIG9yIG1vdmUgaXQgaW50byBMYXlvdXQuXG5EeWdyYXBoTGF5b3V0LnByb3RvdHlwZS5zZXRZQXhlcyA9IGZ1bmN0aW9uICh5QXhlcykge1xuICB0aGlzLnlBeGVzXyA9IHlBeGVzO1xufTtcblxuRHlncmFwaExheW91dC5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5feEF4aXMgPSB7fTtcbiAgdGhpcy5fZXZhbHVhdGVMaW1pdHMoKTtcbiAgdGhpcy5fZXZhbHVhdGVMaW5lQ2hhcnRzKCk7XG4gIHRoaXMuX2V2YWx1YXRlTGluZVRpY2tzKCk7XG4gIHRoaXMuX2V2YWx1YXRlQW5ub3RhdGlvbnMoKTtcbn07XG5cbkR5Z3JhcGhMYXlvdXQucHJvdG90eXBlLl9ldmFsdWF0ZUxpbWl0cyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgeGxpbWl0cyA9IHRoaXMuZHlncmFwaF8ueEF4aXNSYW5nZSgpO1xuICB0aGlzLl94QXhpcy5taW52YWwgPSB4bGltaXRzWzBdO1xuICB0aGlzLl94QXhpcy5tYXh2YWwgPSB4bGltaXRzWzFdO1xuICB2YXIgeHJhbmdlID0geGxpbWl0c1sxXSAtIHhsaW1pdHNbMF07XG4gIHRoaXMuX3hBeGlzLnNjYWxlID0gKHhyYW5nZSAhPT0gMCA/IDEgLyB4cmFuZ2UgOiAxLjApO1xuXG4gIGlmICh0aGlzLmR5Z3JhcGhfLmdldE9wdGlvbkZvckF4aXMoXCJsb2dzY2FsZVwiLCAneCcpKSB7XG4gICAgdGhpcy5feEF4aXMueGxvZ3JhbmdlID0gdXRpbHMubG9nMTAodGhpcy5feEF4aXMubWF4dmFsKSAtIHV0aWxzLmxvZzEwKHRoaXMuX3hBeGlzLm1pbnZhbCk7XG4gICAgdGhpcy5feEF4aXMueGxvZ3NjYWxlID0gKHRoaXMuX3hBeGlzLnhsb2dyYW5nZSAhPT0gMCA/IDEuMCAvIHRoaXMuX3hBeGlzLnhsb2dyYW5nZSA6IDEuMCk7XG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnlBeGVzXy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBheGlzID0gdGhpcy55QXhlc19baV07XG4gICAgYXhpcy5taW55dmFsID0gYXhpcy5jb21wdXRlZFZhbHVlUmFuZ2VbMF07XG4gICAgYXhpcy5tYXh5dmFsID0gYXhpcy5jb21wdXRlZFZhbHVlUmFuZ2VbMV07XG4gICAgYXhpcy55cmFuZ2UgPSBheGlzLm1heHl2YWwgLSBheGlzLm1pbnl2YWw7XG4gICAgYXhpcy55c2NhbGUgPSAoYXhpcy55cmFuZ2UgIT09IDAgPyAxLjAgLyBheGlzLnlyYW5nZSA6IDEuMCk7XG5cbiAgICBpZiAodGhpcy5keWdyYXBoXy5nZXRPcHRpb24oXCJsb2dzY2FsZVwiKSB8fCBheGlzLmxvZ3NjYWxlKSB7XG4gICAgICBheGlzLnlsb2dyYW5nZSA9IHV0aWxzLmxvZzEwKGF4aXMubWF4eXZhbCkgLSB1dGlscy5sb2cxMChheGlzLm1pbnl2YWwpO1xuICAgICAgYXhpcy55bG9nc2NhbGUgPSAoYXhpcy55bG9ncmFuZ2UgIT09IDAgPyAxLjAgLyBheGlzLnlsb2dyYW5nZSA6IDEuMCk7XG4gICAgICBpZiAoIWlzRmluaXRlKGF4aXMueWxvZ3JhbmdlKSB8fCBpc05hTihheGlzLnlsb2dyYW5nZSkpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignYXhpcyAnICsgaSArICcgb2YgZ3JhcGggYXQgJyArIGF4aXMuZyArXG4gICAgICAgICAgICAgICAgICAgICAgJyBjYW5cXCd0IGJlIGRpc3BsYXllZCBpbiBsb2cgc2NhbGUgZm9yIHJhbmdlIFsnICtcbiAgICAgICAgICAgICAgICAgICAgICBheGlzLm1pbnl2YWwgKyAnIC0gJyArIGF4aXMubWF4eXZhbCArICddJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5EeWdyYXBoTGF5b3V0LmNhbGNYTm9ybWFsXyA9IGZ1bmN0aW9uKHZhbHVlLCB4QXhpcywgbG9nc2NhbGUpIHtcbiAgaWYgKGxvZ3NjYWxlKSB7XG4gICAgcmV0dXJuICgodXRpbHMubG9nMTAodmFsdWUpIC0gdXRpbHMubG9nMTAoeEF4aXMubWludmFsKSkgKiB4QXhpcy54bG9nc2NhbGUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAodmFsdWUgLSB4QXhpcy5taW52YWwpICogeEF4aXMuc2NhbGU7XG4gIH1cbn07XG5cbi8qKlxuICogQHBhcmFtIHtEeWdyYXBoQXhpc1R5cGV9IGF4aXNcbiAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxuICogQHBhcmFtIHtib29sZWFufSBsb2dzY2FsZVxuICogQHJldHVybiB7bnVtYmVyfVxuICovXG5EeWdyYXBoTGF5b3V0LmNhbGNZTm9ybWFsXyA9IGZ1bmN0aW9uKGF4aXMsIHZhbHVlLCBsb2dzY2FsZSkge1xuICBpZiAobG9nc2NhbGUpIHtcbiAgICB2YXIgeCA9IDEuMCAtICgodXRpbHMubG9nMTAodmFsdWUpIC0gdXRpbHMubG9nMTAoYXhpcy5taW55dmFsKSkgKiBheGlzLnlsb2dzY2FsZSk7XG4gICAgcmV0dXJuIGlzRmluaXRlKHgpID8geCA6IE5hTjsgIC8vIHNoaW0gZm9yIHY4IGlzc3VlOyBzZWUgcHVsbCByZXF1ZXN0IDI3NlxuICB9IGVsc2Uge1xuICAgIHJldHVybiAxLjAgLSAoKHZhbHVlIC0gYXhpcy5taW55dmFsKSAqIGF4aXMueXNjYWxlKTtcbiAgfVxufTtcblxuRHlncmFwaExheW91dC5wcm90b3R5cGUuX2V2YWx1YXRlTGluZUNoYXJ0cyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaXNTdGFja2VkID0gdGhpcy5keWdyYXBoXy5nZXRPcHRpb24oXCJzdGFja2VkR3JhcGhcIik7XG4gIHZhciBpc0xvZ3NjYWxlRm9yWCA9IHRoaXMuZHlncmFwaF8uZ2V0T3B0aW9uRm9yQXhpcyhcImxvZ3NjYWxlXCIsICd4Jyk7XG5cbiAgZm9yICh2YXIgc2V0SWR4ID0gMDsgc2V0SWR4IDwgdGhpcy5wb2ludHMubGVuZ3RoOyBzZXRJZHgrKykge1xuICAgIHZhciBwb2ludHMgPSB0aGlzLnBvaW50c1tzZXRJZHhdO1xuICAgIHZhciBzZXROYW1lID0gdGhpcy5zZXROYW1lc1tzZXRJZHhdO1xuICAgIHZhciBjb25uZWN0U2VwYXJhdGVkID0gdGhpcy5keWdyYXBoXy5nZXRPcHRpb24oJ2Nvbm5lY3RTZXBhcmF0ZWRQb2ludHMnLCBzZXROYW1lKTtcbiAgICB2YXIgYXhpcyA9IHRoaXMuZHlncmFwaF8uYXhpc1Byb3BlcnRpZXNGb3JTZXJpZXMoc2V0TmFtZSk7XG4gICAgLy8gVE9ETyAoa29uaWdzYmVyZyk6IHVzZSBvcHRpb25zRm9yQXhpcyBpbnN0ZWFkLlxuICAgIHZhciBsb2dzY2FsZSA9IHRoaXMuZHlncmFwaF8uYXR0cmlidXRlc18uZ2V0Rm9yU2VyaWVzKFwibG9nc2NhbGVcIiwgc2V0TmFtZSk7XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBvaW50cy5sZW5ndGg7IGorKykge1xuICAgICAgdmFyIHBvaW50ID0gcG9pbnRzW2pdO1xuXG4gICAgICAvLyBSYW5nZSBmcm9tIDAtMSB3aGVyZSAwIHJlcHJlc2VudHMgbGVmdCBhbmQgMSByZXByZXNlbnRzIHJpZ2h0LlxuICAgICAgcG9pbnQueCA9IER5Z3JhcGhMYXlvdXQuY2FsY1hOb3JtYWxfKHBvaW50Lnh2YWwsIHRoaXMuX3hBeGlzLCBpc0xvZ3NjYWxlRm9yWCk7XG4gICAgICAvLyBSYW5nZSBmcm9tIDAtMSB3aGVyZSAwIHJlcHJlc2VudHMgdG9wIGFuZCAxIHJlcHJlc2VudHMgYm90dG9tXG4gICAgICB2YXIgeXZhbCA9IHBvaW50Lnl2YWw7XG4gICAgICBpZiAoaXNTdGFja2VkKSB7XG4gICAgICAgIHBvaW50Lnlfc3RhY2tlZCA9IER5Z3JhcGhMYXlvdXQuY2FsY1lOb3JtYWxfKFxuICAgICAgICAgICAgYXhpcywgcG9pbnQueXZhbF9zdGFja2VkLCBsb2dzY2FsZSk7XG4gICAgICAgIGlmICh5dmFsICE9PSBudWxsICYmICFpc05hTih5dmFsKSkge1xuICAgICAgICAgIHl2YWwgPSBwb2ludC55dmFsX3N0YWNrZWQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh5dmFsID09PSBudWxsKSB7XG4gICAgICAgIHl2YWwgPSBOYU47XG4gICAgICAgIGlmICghY29ubmVjdFNlcGFyYXRlZCkge1xuICAgICAgICAgIHBvaW50Lnl2YWwgPSBOYU47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHBvaW50LnkgPSBEeWdyYXBoTGF5b3V0LmNhbGNZTm9ybWFsXyhheGlzLCB5dmFsLCBsb2dzY2FsZSk7XG4gICAgfVxuXG4gICAgdGhpcy5keWdyYXBoXy5kYXRhSGFuZGxlcl8ub25MaW5lRXZhbHVhdGVkKHBvaW50cywgYXhpcywgbG9nc2NhbGUpO1xuICB9XG59O1xuXG5EeWdyYXBoTGF5b3V0LnByb3RvdHlwZS5fZXZhbHVhdGVMaW5lVGlja3MgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGksIHRpY2ssIGxhYmVsLCBwb3MsIHYsIGhhc190aWNrO1xuICB0aGlzLnh0aWNrcyA9IFtdO1xuICBmb3IgKGkgPSAwOyBpIDwgdGhpcy54VGlja3NfLmxlbmd0aDsgaSsrKSB7XG4gICAgdGljayA9IHRoaXMueFRpY2tzX1tpXTtcbiAgICBsYWJlbCA9IHRpY2subGFiZWw7XG4gICAgaGFzX3RpY2sgPSAhKCdsYWJlbF92JyBpbiB0aWNrKTtcbiAgICB2ID0gaGFzX3RpY2sgPyB0aWNrLnYgOiB0aWNrLmxhYmVsX3Y7XG4gICAgcG9zID0gdGhpcy5keWdyYXBoXy50b1BlcmNlbnRYQ29vcmQodik7XG4gICAgaWYgKChwb3MgPj0gMC4wKSAmJiAocG9zIDwgMS4wKSkge1xuICAgICAgdGhpcy54dGlja3MucHVzaCh7cG9zLCBsYWJlbCwgaGFzX3RpY2t9KTtcbiAgICB9XG4gIH1cblxuICB0aGlzLnl0aWNrcyA9IFtdO1xuICBmb3IgKGkgPSAwOyBpIDwgdGhpcy55QXhlc18ubGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIGF4aXMgPSB0aGlzLnlBeGVzX1tpXTtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IGF4aXMudGlja3MubGVuZ3RoOyBqKyspIHtcbiAgICAgIHRpY2sgPSBheGlzLnRpY2tzW2pdO1xuICAgICAgbGFiZWwgPSB0aWNrLmxhYmVsO1xuICAgICAgaGFzX3RpY2sgPSAhKCdsYWJlbF92JyBpbiB0aWNrKTtcbiAgICAgIHYgPSBoYXNfdGljayA/IHRpY2sudiA6IHRpY2subGFiZWxfdjtcbiAgICAgIHBvcyA9IHRoaXMuZHlncmFwaF8udG9QZXJjZW50WUNvb3JkKHYsIGkpO1xuICAgICAgaWYgKChwb3MgPiAwLjApICYmIChwb3MgPD0gMS4wKSkge1xuICAgICAgICB0aGlzLnl0aWNrcy5wdXNoKHtheGlzOiBpLCBwb3MsIGxhYmVsLCBoYXNfdGlja30pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuRHlncmFwaExheW91dC5wcm90b3R5cGUuX2V2YWx1YXRlQW5ub3RhdGlvbnMgPSBmdW5jdGlvbigpIHtcbiAgLy8gQWRkIHRoZSBhbm5vdGF0aW9ucyB0byB0aGUgcG9pbnQgdG8gd2hpY2ggdGhleSBiZWxvbmcuXG4gIC8vIE1ha2UgYSBtYXAgZnJvbSAoc2V0TmFtZSwgeHZhbCkgdG8gYW5ub3RhdGlvbiBmb3IgcXVpY2sgbG9va3Vwcy5cbiAgdmFyIGk7XG4gIHZhciBhbm5vdGF0aW9ucyA9IHt9O1xuICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5hbm5vdGF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBhID0gdGhpcy5hbm5vdGF0aW9uc1tpXTtcbiAgICBhbm5vdGF0aW9uc1thLnh2YWwgKyBcIixcIiArIGEuc2VyaWVzXSA9IGE7XG4gIH1cblxuICB0aGlzLmFubm90YXRlZF9wb2ludHMgPSBbXTtcblxuICAvLyBFeGl0IHRoZSBmdW5jdGlvbiBlYXJseSBpZiB0aGVyZSBhcmUgbm8gYW5ub3RhdGlvbnMuXG4gIGlmICghdGhpcy5hbm5vdGF0aW9ucyB8fCAhdGhpcy5hbm5vdGF0aW9ucy5sZW5ndGgpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBUT0RPKGFudHJvYik6IGxvb3AgdGhyb3VnaCBhbm5vdGF0aW9ucyBub3QgcG9pbnRzLlxuICBmb3IgKHZhciBzZXRJZHggPSAwOyBzZXRJZHggPCB0aGlzLnBvaW50cy5sZW5ndGg7IHNldElkeCsrKSB7XG4gICAgdmFyIHBvaW50cyA9IHRoaXMucG9pbnRzW3NldElkeF07XG4gICAgZm9yIChpID0gMDsgaSA8IHBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHAgPSBwb2ludHNbaV07XG4gICAgICB2YXIgayA9IHAueHZhbCArIFwiLFwiICsgcC5uYW1lO1xuICAgICAgaWYgKGsgaW4gYW5ub3RhdGlvbnMpIHtcbiAgICAgICAgcC5hbm5vdGF0aW9uID0gYW5ub3RhdGlvbnNba107XG4gICAgICAgIHRoaXMuYW5ub3RhdGVkX3BvaW50cy5wdXNoKHApO1xuICAgICAgICAvL2lmIHRoZXJlIGFyZSBtdWx0aXBsZSBzYW1lIHgtdmFsdWVkIHBvaW50cywgdGhlIGFubm90YXRpb24gd291bGQgYmUgcmVuZGVyZWQgbXVsdGlwbGUgdGltZXNcbiAgICAgICAgLy9yZW1vdmUgYWxyZWFkeSByZW5kZXJlZCBhbm5vdGF0aW9uXG4gICAgICAgIGRlbGV0ZSBhbm5vdGF0aW9uc1trXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogQ29udmVuaWVuY2UgZnVuY3Rpb24gdG8gcmVtb3ZlIGFsbCB0aGUgZGF0YSBzZXRzIGZyb20gYSBncmFwaFxuICovXG5EeWdyYXBoTGF5b3V0LnByb3RvdHlwZS5yZW1vdmVBbGxEYXRhc2V0cyA9IGZ1bmN0aW9uKCkge1xuICBkZWxldGUgdGhpcy5wb2ludHM7XG4gIGRlbGV0ZSB0aGlzLnNldE5hbWVzO1xuICBkZWxldGUgdGhpcy5zZXRQb2ludHNMZW5ndGhzO1xuICBkZWxldGUgdGhpcy5zZXRQb2ludHNPZmZzZXRzO1xuICB0aGlzLnBvaW50cyA9IFtdO1xuICB0aGlzLnNldE5hbWVzID0gW107XG4gIHRoaXMuc2V0UG9pbnRzTGVuZ3RocyA9IFtdO1xuICB0aGlzLnNldFBvaW50c09mZnNldHMgPSBbXTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IER5Z3JhcGhMYXlvdXQ7XG4iXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNB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