/**
 * @license
 * Copyright 2012 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licenced: https://opensource.org/licenses/MIT
 */
/*global Dygraph:false */

/*
Current bits of jankiness:
- Uses two private APIs:
    1. Dygraph.optionsViewForAxis_
    2. dygraph.plotter_.area
- Registers for a "predraw" event, which should be renamed.
- I call calculateEmWidthInDiv more often than needed.
*/

/*global Dygraph:false */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var utils = _interopRequireWildcard(require("../dygraph-utils"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * Creates the legend, which appears when the user hovers over the chart.
 * The legend can be either a user-specified or generated div.
 *
 * @constructor
 */
var Legend = function Legend() {
  this.legend_div_ = null;
  this.is_generated_div_ = false; // do we own this div, or was it user-specified?
};

Legend.prototype.toString = function () {
  return "Legend Plugin";
};

/**
 * This is called during the dygraph constructor, after options have been set
 * but before the data is available.
 *
 * Proper tasks to do here include:
 * - Reading your own options
 * - DOM manipulation
 * - Registering event listeners
 *
 * @param {Dygraph} g Graph instance.
 * @return {object.<string, function(ev)>} Mapping of event names to callbacks.
 */
Legend.prototype.activate = function (g) {
  var div;
  var userLabelsDiv = g.getOption('labelsDiv');
  if (userLabelsDiv && null !== userLabelsDiv) {
    if (typeof userLabelsDiv == "string" || userLabelsDiv instanceof String) {
      div = document.getElementById(userLabelsDiv);
    } else {
      div = userLabelsDiv;
    }
  } else {
    div = document.createElement("div");
    div.className = "dygraph-legend";
    // TODO(danvk): come up with a cleaner way to expose this.
    g.graphDiv.appendChild(div);
    this.is_generated_div_ = true;
  }
  this.legend_div_ = div;
  this.one_em_width_ = 10; // just a guess, will be updated.

  return {
    select: this.select,
    deselect: this.deselect,
    // TODO(danvk): rethink the name "predraw" before we commit to it in any API.
    predraw: this.predraw,
    didDrawChart: this.didDrawChart
  };
};

// Needed for dashed lines.
var calculateEmWidthInDiv = function calculateEmWidthInDiv(div) {
  var sizeSpan = document.createElement('span');
  sizeSpan.setAttribute('style', 'margin: 0; padding: 0 0 0 1em; border: 0;');
  div.appendChild(sizeSpan);
  var oneEmWidth = sizeSpan.offsetWidth;
  div.removeChild(sizeSpan);
  return oneEmWidth;
};
var escapeHTML = function escapeHTML(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&#34;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
Legend.prototype.select = function (e) {
  var xValue = e.selectedX;
  var points = e.selectedPoints;
  var row = e.selectedRow;
  var legendMode = e.dygraph.getOption('legend');
  if (legendMode === 'never') {
    this.legend_div_.style.display = 'none';
    return;
  }
  var html = Legend.generateLegendHTML(e.dygraph, xValue, points, this.one_em_width_, row);
  if (html instanceof Node && html.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
    this.legend_div_.innerHTML = '';
    this.legend_div_.appendChild(html);
  } else this.legend_div_.innerHTML = html;
  // must be done now so offsetWidth isn’t 0…
  this.legend_div_.style.display = '';
  if (legendMode === 'follow') {
    // create floating legend div
    var area = e.dygraph.plotter_.area;
    var labelsDivWidth = this.legend_div_.offsetWidth;
    var yAxisLabelWidth = e.dygraph.getOptionForAxis('axisLabelWidth', 'y');
    // find the closest data point by checking the currently highlighted series,
    // or fall back to using the first data point available
    var highlightSeries = e.dygraph.getHighlightSeries();
    var point;
    if (highlightSeries) {
      point = points.find(function (p) {
        return p.name === highlightSeries;
      });
      if (!point) point = points[0];
    } else point = points[0];
    // determine floating [left, top] coordinates of the legend div
    // within the plotter_ area
    // offset 50 px to the right and down from the first selection point
    // 50 px is guess based on mouse cursor size
    var followOffsetX = e.dygraph.getNumericOption('legendFollowOffsetX');
    var followOffsetY = e.dygraph.getNumericOption('legendFollowOffsetY');
    var leftLegend = point.x * area.w + followOffsetX;
    var topLegend = point.y * area.h + followOffsetY;

    // if legend floats to end of the chart area, it flips to the other
    // side of the selection point
    if (leftLegend + labelsDivWidth + 1 > area.w) {
      leftLegend = leftLegend - 2 * followOffsetX - labelsDivWidth - (yAxisLabelWidth - area.x);
    }
    this.legend_div_.style.left = yAxisLabelWidth + leftLegend + "px";
    this.legend_div_.style.top = topLegend + "px";
  } else if (legendMode === 'onmouseover' && this.is_generated_div_) {
    // synchronise this with Legend.prototype.predraw below
    var area = e.dygraph.plotter_.area;
    var labelsDivWidth = this.legend_div_.offsetWidth;
    this.legend_div_.style.left = area.x + area.w - labelsDivWidth - 1 + "px";
    this.legend_div_.style.top = area.y + "px";
  }
};
Legend.prototype.deselect = function (e) {
  var legendMode = e.dygraph.getOption('legend');
  if (legendMode !== 'always') {
    this.legend_div_.style.display = "none";
  }

  // Have to do this every time, since styles might have changed.
  var oneEmWidth = calculateEmWidthInDiv(this.legend_div_);
  this.one_em_width_ = oneEmWidth;
  var html = Legend.generateLegendHTML(e.dygraph, undefined, undefined, oneEmWidth, null);
  if (html instanceof Node && html.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
    this.legend_div_.innerHTML = '';
    this.legend_div_.appendChild(html);
  } else this.legend_div_.innerHTML = html;
};
Legend.prototype.didDrawChart = function (e) {
  this.deselect(e);
};

// Right edge should be flush with the right edge of the charting area (which
// may not be the same as the right edge of the div, if we have two y-axes).
// TODO(danvk): is any of this really necessary? Could just set "right" in "activate".
/**
 * Position the labels div so that:
 * - its right edge is flush with the right edge of the charting area
 * - its top edge is flush with the top edge of the charting area
 * @private
 */
Legend.prototype.predraw = function (e) {
  // Don't touch a user-specified labelsDiv.
  if (!this.is_generated_div_) return;

  // TODO(danvk): only use real APIs for this.
  e.dygraph.graphDiv.appendChild(this.legend_div_);
  // synchronise this with Legend.prototype.select above
  var area = e.dygraph.plotter_.area;
  var labelsDivWidth = this.legend_div_.offsetWidth;
  this.legend_div_.style.left = area.x + area.w - labelsDivWidth - 1 + "px";
  this.legend_div_.style.top = area.y + "px";
};

/**
 * Called when dygraph.destroy() is called.
 * You should null out any references and detach any DOM elements.
 */
Legend.prototype.destroy = function () {
  this.legend_div_ = null;
};

/**
 * Generates HTML for the legend which is displayed when hovering over the
 * chart. If no selected points are specified, a default legend is returned
 * (this may just be the empty string).
 * @param {number} x The x-value of the selected points.
 * @param {Object} sel_points List of selected points for the given
 *   x-value. Should have properties like 'name', 'yval' and 'canvasy'.
 * @param {number} oneEmWidth The pixel width for 1em in the legend. Only
 *   relevant when displaying a legend with no selection (i.e. {legend:
 *   'always'}) and with dashed lines.
 * @param {number} row The selected row index.
 * @private
 */
Legend.generateLegendHTML = function (g, x, sel_points, oneEmWidth, row) {
  // Data about the selection to pass to legendFormatter
  var data = {
    dygraph: g,
    x: x,
    i: row,
    series: []
  };
  var labelToSeries = {};
  var labels = g.getLabels();
  if (labels) {
    for (var i = 1; i < labels.length; i++) {
      var series = g.getPropertiesForSeries(labels[i]);
      var strokePattern = g.getOption('strokePattern', labels[i]);
      var seriesData = {
        dashHTML: generateLegendDashHTML(strokePattern, series.color, oneEmWidth),
        label: labels[i],
        labelHTML: escapeHTML(labels[i]),
        isVisible: series.visible,
        color: series.color
      };
      data.series.push(seriesData);
      labelToSeries[labels[i]] = seriesData;
    }
  }
  if (typeof x !== 'undefined') {
    var xOptView = g.optionsViewForAxis_('x');
    var xvf = xOptView('valueFormatter');
    data.xHTML = xvf.call(g, x, xOptView, labels[0], g, row, 0);
    var yOptViews = [];
    var num_axes = g.numAxes();
    for (var i = 0; i < num_axes; i++) {
      // TODO(danvk): remove this use of a private API
      yOptViews[i] = g.optionsViewForAxis_('y' + (i ? 1 + i : ''));
    }
    var showZeros = g.getOption('labelsShowZeroValues');
    var highlightSeries = g.getHighlightSeries();
    for (i = 0; i < sel_points.length; i++) {
      var pt = sel_points[i];
      var seriesData = labelToSeries[pt.name];
      seriesData.y = pt.yval;
      if (pt.yval === 0 && !showZeros || isNaN(pt.canvasy)) {
        seriesData.isVisible = false;
        continue;
      }
      var series = g.getPropertiesForSeries(pt.name);
      var yOptView = yOptViews[series.axis - 1];
      var fmtFunc = yOptView('valueFormatter');
      var yHTML = fmtFunc.call(g, pt.yval, yOptView, pt.name, g, row, labels.indexOf(pt.name));
      utils.update(seriesData, {
        yHTML: yHTML
      });
      if (pt.name == highlightSeries) {
        seriesData.isHighlighted = true;
      }
    }
  }
  var formatter = g.getOption('legendFormatter') || Legend.defaultFormatter;
  return formatter.call(g, data);
};
Legend.defaultFormatter = function (data) {
  var g = data.dygraph;

  // TODO(danvk): deprecate this option in place of {legend: 'never'}
  // XXX should this logic be in the formatter?
  if (g.getOption('showLabelsOnHighlight') !== true) return '';
  var sepLines = g.getOption('labelsSeparateLines');
  var html;
  if (typeof data.x === 'undefined') {
    // TODO: this check is duplicated in generateLegendHTML. Put it in one place.
    if (g.getOption('legend') != 'always') {
      return '';
    }
    html = '';
    for (var i = 0; i < data.series.length; i++) {
      var series = data.series[i];
      if (!series.isVisible) continue;
      if (html !== '') html += sepLines ? '<br />' : ' ';
      html += "<span style='font-weight: bold; color: ".concat(series.color, ";'>").concat(series.dashHTML, " ").concat(series.labelHTML, "</span>");
    }
    return html;
  }
  html = data.xHTML + ':';
  for (var i = 0; i < data.series.length; i++) {
    var series = data.series[i];
    if (!series.y && !series.yHTML) continue;
    if (!series.isVisible) continue;
    if (sepLines) html += '<br>';
    var cls = series.isHighlighted ? ' class="highlight"' : '';
    html += "<span".concat(cls, "> <b><span style='color: ").concat(series.color, ";'>").concat(series.labelHTML, "</span></b>:&#160;").concat(series.yHTML, "</span>");
  }
  return html;
};

/**
 * Generates html for the "dash" displayed on the legend when using "legend: always".
 * In particular, this works for dashed lines with any stroke pattern. It will
 * try to scale the pattern to fit in 1em width. Or if small enough repeat the
 * pattern for 1em width.
 *
 * @param strokePattern The pattern
 * @param color The color of the series.
 * @param oneEmWidth The width in pixels of 1em in the legend.
 * @private
 */
// TODO(danvk): cache the results of this
function generateLegendDashHTML(strokePattern, color, oneEmWidth) {
  // Easy, common case: a solid line
  if (!strokePattern || strokePattern.length <= 1) {
    return "<div class=\"dygraph-legend-line\" style=\"border-bottom-color: ".concat(color, ";\"></div>");
  }
  var i, j, paddingLeft, marginRight;
  var strokePixelLength = 0,
    segmentLoop = 0;
  var normalizedPattern = [];
  var loop;

  // Compute the length of the pixels including the first segment twice,
  // since we repeat it.
  for (i = 0; i <= strokePattern.length; i++) {
    strokePixelLength += strokePattern[i % strokePattern.length];
  }

  // See if we can loop the pattern by itself at least twice.
  loop = Math.floor(oneEmWidth / (strokePixelLength - strokePattern[0]));
  if (loop > 1) {
    // This pattern fits at least two times, no scaling just convert to em;
    for (i = 0; i < strokePattern.length; i++) {
      normalizedPattern[i] = strokePattern[i] / oneEmWidth;
    }
    // Since we are repeating the pattern, we don't worry about repeating the
    // first segment in one draw.
    segmentLoop = normalizedPattern.length;
  } else {
    // If the pattern doesn't fit in the legend we scale it to fit.
    loop = 1;
    for (i = 0; i < strokePattern.length; i++) {
      normalizedPattern[i] = strokePattern[i] / strokePixelLength;
    }
    // For the scaled patterns we do redraw the first segment.
    segmentLoop = normalizedPattern.length + 1;
  }

  // Now make the pattern.
  var dash = "";
  for (j = 0; j < loop; j++) {
    for (i = 0; i < segmentLoop; i += 2) {
      // The padding is the drawn segment.
      paddingLeft = normalizedPattern[i % normalizedPattern.length];
      if (i < strokePattern.length) {
        // The margin is the space segment.
        marginRight = normalizedPattern[(i + 1) % normalizedPattern.length];
      } else {
        // The repeated first segment has no right margin.
        marginRight = 0;
      }
      dash += "<div class=\"dygraph-legend-dash\" style=\"margin-right: ".concat(marginRight, "em; padding-left: ").concat(paddingLeft, "em;\"></div>");
    }
  }
  return dash;
}
var _default = Legend;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMZWdlbmQiLCJsZWdlbmRfZGl2XyIsImlzX2dlbmVyYXRlZF9kaXZfIiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJhY3RpdmF0ZSIsImciLCJkaXYiLCJ1c2VyTGFiZWxzRGl2IiwiZ2V0T3B0aW9uIiwiU3RyaW5nIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImNyZWF0ZUVsZW1lbnQiLCJjbGFzc05hbWUiLCJncmFwaERpdiIsImFwcGVuZENoaWxkIiwib25lX2VtX3dpZHRoXyIsInNlbGVjdCIsImRlc2VsZWN0IiwicHJlZHJhdyIsImRpZERyYXdDaGFydCIsImNhbGN1bGF0ZUVtV2lkdGhJbkRpdiIsInNpemVTcGFuIiwic2V0QXR0cmlidXRlIiwib25lRW1XaWR0aCIsIm9mZnNldFdpZHRoIiwicmVtb3ZlQ2hpbGQiLCJlc2NhcGVIVE1MIiwic3RyIiwicmVwbGFjZSIsImUiLCJ4VmFsdWUiLCJzZWxlY3RlZFgiLCJwb2ludHMiLCJzZWxlY3RlZFBvaW50cyIsInJvdyIsInNlbGVjdGVkUm93IiwibGVnZW5kTW9kZSIsImR5Z3JhcGgiLCJzdHlsZSIsImRpc3BsYXkiLCJodG1sIiwiZ2VuZXJhdGVMZWdlbmRIVE1MIiwiTm9kZSIsIm5vZGVUeXBlIiwiRE9DVU1FTlRfRlJBR01FTlRfTk9ERSIsImlubmVySFRNTCIsImFyZWEiLCJwbG90dGVyXyIsImxhYmVsc0RpdldpZHRoIiwieUF4aXNMYWJlbFdpZHRoIiwiZ2V0T3B0aW9uRm9yQXhpcyIsImhpZ2hsaWdodFNlcmllcyIsImdldEhpZ2hsaWdodFNlcmllcyIsInBvaW50IiwiZmluZCIsInAiLCJuYW1lIiwiZm9sbG93T2Zmc2V0WCIsImdldE51bWVyaWNPcHRpb24iLCJmb2xsb3dPZmZzZXRZIiwibGVmdExlZ2VuZCIsIngiLCJ3IiwidG9wTGVnZW5kIiwieSIsImgiLCJsZWZ0IiwidG9wIiwidW5kZWZpbmVkIiwiZGVzdHJveSIsInNlbF9wb2ludHMiLCJkYXRhIiwiaSIsInNlcmllcyIsImxhYmVsVG9TZXJpZXMiLCJsYWJlbHMiLCJnZXRMYWJlbHMiLCJsZW5ndGgiLCJnZXRQcm9wZXJ0aWVzRm9yU2VyaWVzIiwic3Ryb2tlUGF0dGVybiIsInNlcmllc0RhdGEiLCJkYXNoSFRNTCIsImdlbmVyYXRlTGVnZW5kRGFzaEhUTUwiLCJjb2xvciIsImxhYmVsIiwibGFiZWxIVE1MIiwiaXNWaXNpYmxlIiwidmlzaWJsZSIsInB1c2giLCJ4T3B0VmlldyIsIm9wdGlvbnNWaWV3Rm9yQXhpc18iLCJ4dmYiLCJ4SFRNTCIsImNhbGwiLCJ5T3B0Vmlld3MiLCJudW1fYXhlcyIsIm51bUF4ZXMiLCJzaG93WmVyb3MiLCJwdCIsInl2YWwiLCJpc05hTiIsImNhbnZhc3kiLCJ5T3B0VmlldyIsImF4aXMiLCJmbXRGdW5jIiwieUhUTUwiLCJpbmRleE9mIiwidXRpbHMiLCJ1cGRhdGUiLCJpc0hpZ2hsaWdodGVkIiwiZm9ybWF0dGVyIiwiZGVmYXVsdEZvcm1hdHRlciIsInNlcExpbmVzIiwiY2xzIiwiaiIsInBhZGRpbmdMZWZ0IiwibWFyZ2luUmlnaHQiLCJzdHJva2VQaXhlbExlbmd0aCIsInNlZ21lbnRMb29wIiwibm9ybWFsaXplZFBhdHRlcm4iLCJsb29wIiwiTWF0aCIsImZsb29yIiwiZGFzaCJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL2xlZ2VuZC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAxMiBEYW4gVmFuZGVya2FtIChkYW52ZGtAZ21haWwuY29tKVxuICogTUlULWxpY2VuY2VkOiBodHRwczovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICovXG4vKmdsb2JhbCBEeWdyYXBoOmZhbHNlICovXG5cbi8qXG5DdXJyZW50IGJpdHMgb2YgamFua2luZXNzOlxuLSBVc2VzIHR3byBwcml2YXRlIEFQSXM6XG4gICAgMS4gRHlncmFwaC5vcHRpb25zVmlld0ZvckF4aXNfXG4gICAgMi4gZHlncmFwaC5wbG90dGVyXy5hcmVhXG4tIFJlZ2lzdGVycyBmb3IgYSBcInByZWRyYXdcIiBldmVudCwgd2hpY2ggc2hvdWxkIGJlIHJlbmFtZWQuXG4tIEkgY2FsbCBjYWxjdWxhdGVFbVdpZHRoSW5EaXYgbW9yZSBvZnRlbiB0aGFuIG5lZWRlZC5cbiovXG5cbi8qZ2xvYmFsIER5Z3JhcGg6ZmFsc2UgKi9cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tICcuLi9keWdyYXBoLXV0aWxzJztcblxuLyoqXG4gKiBDcmVhdGVzIHRoZSBsZWdlbmQsIHdoaWNoIGFwcGVhcnMgd2hlbiB0aGUgdXNlciBob3ZlcnMgb3ZlciB0aGUgY2hhcnQuXG4gKiBUaGUgbGVnZW5kIGNhbiBiZSBlaXRoZXIgYSB1c2VyLXNwZWNpZmllZCBvciBnZW5lcmF0ZWQgZGl2LlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICovXG52YXIgTGVnZW5kID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMubGVnZW5kX2Rpdl8gPSBudWxsO1xuICB0aGlzLmlzX2dlbmVyYXRlZF9kaXZfID0gZmFsc2U7ICAvLyBkbyB3ZSBvd24gdGhpcyBkaXYsIG9yIHdhcyBpdCB1c2VyLXNwZWNpZmllZD9cbn07XG5cbkxlZ2VuZC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIFwiTGVnZW5kIFBsdWdpblwiO1xufTtcblxuLyoqXG4gKiBUaGlzIGlzIGNhbGxlZCBkdXJpbmcgdGhlIGR5Z3JhcGggY29uc3RydWN0b3IsIGFmdGVyIG9wdGlvbnMgaGF2ZSBiZWVuIHNldFxuICogYnV0IGJlZm9yZSB0aGUgZGF0YSBpcyBhdmFpbGFibGUuXG4gKlxuICogUHJvcGVyIHRhc2tzIHRvIGRvIGhlcmUgaW5jbHVkZTpcbiAqIC0gUmVhZGluZyB5b3VyIG93biBvcHRpb25zXG4gKiAtIERPTSBtYW5pcHVsYXRpb25cbiAqIC0gUmVnaXN0ZXJpbmcgZXZlbnQgbGlzdGVuZXJzXG4gKlxuICogQHBhcmFtIHtEeWdyYXBofSBnIEdyYXBoIGluc3RhbmNlLlxuICogQHJldHVybiB7b2JqZWN0LjxzdHJpbmcsIGZ1bmN0aW9uKGV2KT59IE1hcHBpbmcgb2YgZXZlbnQgbmFtZXMgdG8gY2FsbGJhY2tzLlxuICovXG5MZWdlbmQucHJvdG90eXBlLmFjdGl2YXRlID0gZnVuY3Rpb24oZykge1xuICB2YXIgZGl2O1xuXG4gIHZhciB1c2VyTGFiZWxzRGl2ID0gZy5nZXRPcHRpb24oJ2xhYmVsc0RpdicpO1xuICBpZiAodXNlckxhYmVsc0RpdiAmJiBudWxsICE9PSB1c2VyTGFiZWxzRGl2KSB7XG4gICAgaWYgKHR5cGVvZih1c2VyTGFiZWxzRGl2KSA9PSBcInN0cmluZ1wiIHx8IHVzZXJMYWJlbHNEaXYgaW5zdGFuY2VvZiBTdHJpbmcpIHtcbiAgICAgIGRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHVzZXJMYWJlbHNEaXYpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkaXYgPSB1c2VyTGFiZWxzRGl2O1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGRpdi5jbGFzc05hbWUgPSBcImR5Z3JhcGgtbGVnZW5kXCI7XG4gICAgLy8gVE9ETyhkYW52ayk6IGNvbWUgdXAgd2l0aCBhIGNsZWFuZXIgd2F5IHRvIGV4cG9zZSB0aGlzLlxuICAgIGcuZ3JhcGhEaXYuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICB0aGlzLmlzX2dlbmVyYXRlZF9kaXZfID0gdHJ1ZTtcbiAgfVxuXG4gIHRoaXMubGVnZW5kX2Rpdl8gPSBkaXY7XG4gIHRoaXMub25lX2VtX3dpZHRoXyA9IDEwOyAgLy8ganVzdCBhIGd1ZXNzLCB3aWxsIGJlIHVwZGF0ZWQuXG5cbiAgcmV0dXJuIHtcbiAgICBzZWxlY3Q6IHRoaXMuc2VsZWN0LFxuICAgIGRlc2VsZWN0OiB0aGlzLmRlc2VsZWN0LFxuICAgIC8vIFRPRE8oZGFudmspOiByZXRoaW5rIHRoZSBuYW1lIFwicHJlZHJhd1wiIGJlZm9yZSB3ZSBjb21taXQgdG8gaXQgaW4gYW55IEFQSS5cbiAgICBwcmVkcmF3OiB0aGlzLnByZWRyYXcsXG4gICAgZGlkRHJhd0NoYXJ0OiB0aGlzLmRpZERyYXdDaGFydFxuICB9O1xufTtcblxuLy8gTmVlZGVkIGZvciBkYXNoZWQgbGluZXMuXG52YXIgY2FsY3VsYXRlRW1XaWR0aEluRGl2ID0gZnVuY3Rpb24oZGl2KSB7XG4gIHZhciBzaXplU3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgc2l6ZVNwYW4uc2V0QXR0cmlidXRlKCdzdHlsZScsICdtYXJnaW46IDA7IHBhZGRpbmc6IDAgMCAwIDFlbTsgYm9yZGVyOiAwOycpO1xuICBkaXYuYXBwZW5kQ2hpbGQoc2l6ZVNwYW4pO1xuICB2YXIgb25lRW1XaWR0aD1zaXplU3Bhbi5vZmZzZXRXaWR0aDtcbiAgZGl2LnJlbW92ZUNoaWxkKHNpemVTcGFuKTtcbiAgcmV0dXJuIG9uZUVtV2lkdGg7XG59O1xuXG52YXIgZXNjYXBlSFRNTCA9IGZ1bmN0aW9uKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoLyYvZywgXCImYW1wO1wiKS5yZXBsYWNlKC9cIi9nLCBcIiYjMzQ7XCIpLnJlcGxhY2UoLzwvZywgXCImbHQ7XCIpLnJlcGxhY2UoLz4vZywgXCImZ3Q7XCIpO1xufTtcblxuTGVnZW5kLnByb3RvdHlwZS5zZWxlY3QgPSBmdW5jdGlvbihlKSB7XG4gIHZhciB4VmFsdWUgPSBlLnNlbGVjdGVkWDtcbiAgdmFyIHBvaW50cyA9IGUuc2VsZWN0ZWRQb2ludHM7XG4gIHZhciByb3cgPSBlLnNlbGVjdGVkUm93O1xuXG4gIHZhciBsZWdlbmRNb2RlID0gZS5keWdyYXBoLmdldE9wdGlvbignbGVnZW5kJyk7XG4gIGlmIChsZWdlbmRNb2RlID09PSAnbmV2ZXInKSB7XG4gICAgdGhpcy5sZWdlbmRfZGl2Xy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBodG1sID0gTGVnZW5kLmdlbmVyYXRlTGVnZW5kSFRNTChlLmR5Z3JhcGgsIHhWYWx1ZSwgcG9pbnRzLCB0aGlzLm9uZV9lbV93aWR0aF8sIHJvdyk7XG4gIGlmIChodG1sIGluc3RhbmNlb2YgTm9kZSAmJiBodG1sLm5vZGVUeXBlID09PSBOb2RlLkRPQ1VNRU5UX0ZSQUdNRU5UX05PREUpIHtcbiAgICB0aGlzLmxlZ2VuZF9kaXZfLmlubmVySFRNTCA9ICcnO1xuICAgIHRoaXMubGVnZW5kX2Rpdl8uYXBwZW5kQ2hpbGQoaHRtbCk7XG4gIH0gZWxzZVxuICAgIHRoaXMubGVnZW5kX2Rpdl8uaW5uZXJIVE1MID0gaHRtbDtcbiAgLy8gbXVzdCBiZSBkb25lIG5vdyBzbyBvZmZzZXRXaWR0aCBpc27igJl0IDDigKZcbiAgdGhpcy5sZWdlbmRfZGl2Xy5zdHlsZS5kaXNwbGF5ID0gJyc7XG5cbiAgaWYgKGxlZ2VuZE1vZGUgPT09ICdmb2xsb3cnKSB7XG4gICAgLy8gY3JlYXRlIGZsb2F0aW5nIGxlZ2VuZCBkaXZcbiAgICB2YXIgYXJlYSA9IGUuZHlncmFwaC5wbG90dGVyXy5hcmVhO1xuICAgIHZhciBsYWJlbHNEaXZXaWR0aCA9IHRoaXMubGVnZW5kX2Rpdl8ub2Zmc2V0V2lkdGg7XG4gICAgdmFyIHlBeGlzTGFiZWxXaWR0aCA9IGUuZHlncmFwaC5nZXRPcHRpb25Gb3JBeGlzKCdheGlzTGFiZWxXaWR0aCcsICd5Jyk7XG4gICAgLy8gZmluZCB0aGUgY2xvc2VzdCBkYXRhIHBvaW50IGJ5IGNoZWNraW5nIHRoZSBjdXJyZW50bHkgaGlnaGxpZ2h0ZWQgc2VyaWVzLFxuICAgIC8vIG9yIGZhbGwgYmFjayB0byB1c2luZyB0aGUgZmlyc3QgZGF0YSBwb2ludCBhdmFpbGFibGVcbiAgICB2YXIgaGlnaGxpZ2h0U2VyaWVzID0gZS5keWdyYXBoLmdldEhpZ2hsaWdodFNlcmllcygpXG4gICAgdmFyIHBvaW50O1xuICAgIGlmIChoaWdobGlnaHRTZXJpZXMpIHtcbiAgICAgIHBvaW50ID0gcG9pbnRzLmZpbmQocCA9PiBwLm5hbWUgPT09IGhpZ2hsaWdodFNlcmllcyk7XG4gICAgICBpZiAoIXBvaW50KVxuICAgICAgICBwb2ludCA9IHBvaW50c1swXTtcbiAgICB9IGVsc2VcbiAgICAgIHBvaW50ID0gcG9pbnRzWzBdO1xuICAgIC8vIGRldGVybWluZSBmbG9hdGluZyBbbGVmdCwgdG9wXSBjb29yZGluYXRlcyBvZiB0aGUgbGVnZW5kIGRpdlxuICAgIC8vIHdpdGhpbiB0aGUgcGxvdHRlcl8gYXJlYVxuICAgIC8vIG9mZnNldCA1MCBweCB0byB0aGUgcmlnaHQgYW5kIGRvd24gZnJvbSB0aGUgZmlyc3Qgc2VsZWN0aW9uIHBvaW50XG4gICAgLy8gNTAgcHggaXMgZ3Vlc3MgYmFzZWQgb24gbW91c2UgY3Vyc29yIHNpemVcbiAgICBjb25zdCBmb2xsb3dPZmZzZXRYID0gZS5keWdyYXBoLmdldE51bWVyaWNPcHRpb24oJ2xlZ2VuZEZvbGxvd09mZnNldFgnKTtcbiAgICBjb25zdCBmb2xsb3dPZmZzZXRZID0gZS5keWdyYXBoLmdldE51bWVyaWNPcHRpb24oJ2xlZ2VuZEZvbGxvd09mZnNldFknKTtcbiAgICB2YXIgbGVmdExlZ2VuZCA9IHBvaW50LnggKiBhcmVhLncgKyBmb2xsb3dPZmZzZXRYO1xuICAgIHZhciB0b3BMZWdlbmQgID0gcG9pbnQueSAqIGFyZWEuaCArIGZvbGxvd09mZnNldFk7XG5cbiAgICAvLyBpZiBsZWdlbmQgZmxvYXRzIHRvIGVuZCBvZiB0aGUgY2hhcnQgYXJlYSwgaXQgZmxpcHMgdG8gdGhlIG90aGVyXG4gICAgLy8gc2lkZSBvZiB0aGUgc2VsZWN0aW9uIHBvaW50XG4gICAgaWYgKChsZWZ0TGVnZW5kICsgbGFiZWxzRGl2V2lkdGggKyAxKSA+IGFyZWEudykge1xuICAgICAgbGVmdExlZ2VuZCA9IGxlZnRMZWdlbmQgLSAyICogZm9sbG93T2Zmc2V0WCAtIGxhYmVsc0RpdldpZHRoIC0gKHlBeGlzTGFiZWxXaWR0aCAtIGFyZWEueCk7XG4gICAgfVxuXG4gICAgdGhpcy5sZWdlbmRfZGl2Xy5zdHlsZS5sZWZ0ID0geUF4aXNMYWJlbFdpZHRoICsgbGVmdExlZ2VuZCArIFwicHhcIjtcbiAgICB0aGlzLmxlZ2VuZF9kaXZfLnN0eWxlLnRvcCA9IHRvcExlZ2VuZCArIFwicHhcIjtcbiAgfSBlbHNlIGlmIChsZWdlbmRNb2RlID09PSAnb25tb3VzZW92ZXInICYmIHRoaXMuaXNfZ2VuZXJhdGVkX2Rpdl8pIHtcbiAgICAvLyBzeW5jaHJvbmlzZSB0aGlzIHdpdGggTGVnZW5kLnByb3RvdHlwZS5wcmVkcmF3IGJlbG93XG4gICAgdmFyIGFyZWEgPSBlLmR5Z3JhcGgucGxvdHRlcl8uYXJlYTtcbiAgICB2YXIgbGFiZWxzRGl2V2lkdGggPSB0aGlzLmxlZ2VuZF9kaXZfLm9mZnNldFdpZHRoO1xuICAgIHRoaXMubGVnZW5kX2Rpdl8uc3R5bGUubGVmdCA9IGFyZWEueCArIGFyZWEudyAtIGxhYmVsc0RpdldpZHRoIC0gMSArIFwicHhcIjtcbiAgICB0aGlzLmxlZ2VuZF9kaXZfLnN0eWxlLnRvcCA9IGFyZWEueSArIFwicHhcIjtcbiAgfVxufTtcblxuTGVnZW5kLnByb3RvdHlwZS5kZXNlbGVjdCA9IGZ1bmN0aW9uKGUpIHtcbiAgdmFyIGxlZ2VuZE1vZGUgPSBlLmR5Z3JhcGguZ2V0T3B0aW9uKCdsZWdlbmQnKTtcbiAgaWYgKGxlZ2VuZE1vZGUgIT09ICdhbHdheXMnKSB7XG4gICAgdGhpcy5sZWdlbmRfZGl2Xy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gIH1cblxuICAvLyBIYXZlIHRvIGRvIHRoaXMgZXZlcnkgdGltZSwgc2luY2Ugc3R5bGVzIG1pZ2h0IGhhdmUgY2hhbmdlZC5cbiAgdmFyIG9uZUVtV2lkdGggPSBjYWxjdWxhdGVFbVdpZHRoSW5EaXYodGhpcy5sZWdlbmRfZGl2Xyk7XG4gIHRoaXMub25lX2VtX3dpZHRoXyA9IG9uZUVtV2lkdGg7XG5cbiAgdmFyIGh0bWwgPSBMZWdlbmQuZ2VuZXJhdGVMZWdlbmRIVE1MKGUuZHlncmFwaCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIG9uZUVtV2lkdGgsIG51bGwpO1xuICBpZiAoaHRtbCBpbnN0YW5jZW9mIE5vZGUgJiYgaHRtbC5ub2RlVHlwZSA9PT0gTm9kZS5ET0NVTUVOVF9GUkFHTUVOVF9OT0RFKSB7XG4gICAgdGhpcy5sZWdlbmRfZGl2Xy5pbm5lckhUTUwgPSAnJztcbiAgICB0aGlzLmxlZ2VuZF9kaXZfLmFwcGVuZENoaWxkKGh0bWwpO1xuICB9IGVsc2VcbiAgICB0aGlzLmxlZ2VuZF9kaXZfLmlubmVySFRNTCA9IGh0bWw7XG59O1xuXG5MZWdlbmQucHJvdG90eXBlLmRpZERyYXdDaGFydCA9IGZ1bmN0aW9uKGUpIHtcbiAgdGhpcy5kZXNlbGVjdChlKTtcbn07XG5cbi8vIFJpZ2h0IGVkZ2Ugc2hvdWxkIGJlIGZsdXNoIHdpdGggdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIGNoYXJ0aW5nIGFyZWEgKHdoaWNoXG4vLyBtYXkgbm90IGJlIHRoZSBzYW1lIGFzIHRoZSByaWdodCBlZGdlIG9mIHRoZSBkaXYsIGlmIHdlIGhhdmUgdHdvIHktYXhlcykuXG4vLyBUT0RPKGRhbnZrKTogaXMgYW55IG9mIHRoaXMgcmVhbGx5IG5lY2Vzc2FyeT8gQ291bGQganVzdCBzZXQgXCJyaWdodFwiIGluIFwiYWN0aXZhdGVcIi5cbi8qKlxuICogUG9zaXRpb24gdGhlIGxhYmVscyBkaXYgc28gdGhhdDpcbiAqIC0gaXRzIHJpZ2h0IGVkZ2UgaXMgZmx1c2ggd2l0aCB0aGUgcmlnaHQgZWRnZSBvZiB0aGUgY2hhcnRpbmcgYXJlYVxuICogLSBpdHMgdG9wIGVkZ2UgaXMgZmx1c2ggd2l0aCB0aGUgdG9wIGVkZ2Ugb2YgdGhlIGNoYXJ0aW5nIGFyZWFcbiAqIEBwcml2YXRlXG4gKi9cbkxlZ2VuZC5wcm90b3R5cGUucHJlZHJhdyA9IGZ1bmN0aW9uKGUpIHtcbiAgLy8gRG9uJ3QgdG91Y2ggYSB1c2VyLXNwZWNpZmllZCBsYWJlbHNEaXYuXG4gIGlmICghdGhpcy5pc19nZW5lcmF0ZWRfZGl2XykgcmV0dXJuO1xuXG4gIC8vIFRPRE8oZGFudmspOiBvbmx5IHVzZSByZWFsIEFQSXMgZm9yIHRoaXMuXG4gIGUuZHlncmFwaC5ncmFwaERpdi5hcHBlbmRDaGlsZCh0aGlzLmxlZ2VuZF9kaXZfKTtcbiAgLy8gc3luY2hyb25pc2UgdGhpcyB3aXRoIExlZ2VuZC5wcm90b3R5cGUuc2VsZWN0IGFib3ZlXG4gIHZhciBhcmVhID0gZS5keWdyYXBoLnBsb3R0ZXJfLmFyZWE7XG4gIHZhciBsYWJlbHNEaXZXaWR0aCA9IHRoaXMubGVnZW5kX2Rpdl8ub2Zmc2V0V2lkdGg7XG4gIHRoaXMubGVnZW5kX2Rpdl8uc3R5bGUubGVmdCA9IGFyZWEueCArIGFyZWEudyAtIGxhYmVsc0RpdldpZHRoIC0gMSArIFwicHhcIjtcbiAgdGhpcy5sZWdlbmRfZGl2Xy5zdHlsZS50b3AgPSBhcmVhLnkgKyBcInB4XCI7XG59O1xuXG4vKipcbiAqIENhbGxlZCB3aGVuIGR5Z3JhcGguZGVzdHJveSgpIGlzIGNhbGxlZC5cbiAqIFlvdSBzaG91bGQgbnVsbCBvdXQgYW55IHJlZmVyZW5jZXMgYW5kIGRldGFjaCBhbnkgRE9NIGVsZW1lbnRzLlxuICovXG5MZWdlbmQucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5sZWdlbmRfZGl2XyA9IG51bGw7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlcyBIVE1MIGZvciB0aGUgbGVnZW5kIHdoaWNoIGlzIGRpc3BsYXllZCB3aGVuIGhvdmVyaW5nIG92ZXIgdGhlXG4gKiBjaGFydC4gSWYgbm8gc2VsZWN0ZWQgcG9pbnRzIGFyZSBzcGVjaWZpZWQsIGEgZGVmYXVsdCBsZWdlbmQgaXMgcmV0dXJuZWRcbiAqICh0aGlzIG1heSBqdXN0IGJlIHRoZSBlbXB0eSBzdHJpbmcpLlxuICogQHBhcmFtIHtudW1iZXJ9IHggVGhlIHgtdmFsdWUgb2YgdGhlIHNlbGVjdGVkIHBvaW50cy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBzZWxfcG9pbnRzIExpc3Qgb2Ygc2VsZWN0ZWQgcG9pbnRzIGZvciB0aGUgZ2l2ZW5cbiAqICAgeC12YWx1ZS4gU2hvdWxkIGhhdmUgcHJvcGVydGllcyBsaWtlICduYW1lJywgJ3l2YWwnIGFuZCAnY2FudmFzeScuXG4gKiBAcGFyYW0ge251bWJlcn0gb25lRW1XaWR0aCBUaGUgcGl4ZWwgd2lkdGggZm9yIDFlbSBpbiB0aGUgbGVnZW5kLiBPbmx5XG4gKiAgIHJlbGV2YW50IHdoZW4gZGlzcGxheWluZyBhIGxlZ2VuZCB3aXRoIG5vIHNlbGVjdGlvbiAoaS5lLiB7bGVnZW5kOlxuICogICAnYWx3YXlzJ30pIGFuZCB3aXRoIGRhc2hlZCBsaW5lcy5cbiAqIEBwYXJhbSB7bnVtYmVyfSByb3cgVGhlIHNlbGVjdGVkIHJvdyBpbmRleC5cbiAqIEBwcml2YXRlXG4gKi9cbkxlZ2VuZC5nZW5lcmF0ZUxlZ2VuZEhUTUwgPSBmdW5jdGlvbihnLCB4LCBzZWxfcG9pbnRzLCBvbmVFbVdpZHRoLCByb3cpIHtcbiAgLy8gRGF0YSBhYm91dCB0aGUgc2VsZWN0aW9uIHRvIHBhc3MgdG8gbGVnZW5kRm9ybWF0dGVyXG4gIHZhciBkYXRhID0ge1xuICAgIGR5Z3JhcGg6IGcsXG4gICAgeDogeCxcbiAgICBpOiByb3csXG4gICAgc2VyaWVzOiBbXVxuICB9O1xuXG4gIHZhciBsYWJlbFRvU2VyaWVzID0ge307XG4gIHZhciBsYWJlbHMgPSBnLmdldExhYmVscygpO1xuICBpZiAobGFiZWxzKSB7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBsYWJlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzZXJpZXMgPSBnLmdldFByb3BlcnRpZXNGb3JTZXJpZXMobGFiZWxzW2ldKTtcbiAgICAgIHZhciBzdHJva2VQYXR0ZXJuID0gZy5nZXRPcHRpb24oJ3N0cm9rZVBhdHRlcm4nLCBsYWJlbHNbaV0pO1xuICAgICAgdmFyIHNlcmllc0RhdGEgPSB7XG4gICAgICAgIGRhc2hIVE1MOiBnZW5lcmF0ZUxlZ2VuZERhc2hIVE1MKHN0cm9rZVBhdHRlcm4sIHNlcmllcy5jb2xvciwgb25lRW1XaWR0aCksXG4gICAgICAgIGxhYmVsOiBsYWJlbHNbaV0sXG4gICAgICAgIGxhYmVsSFRNTDogZXNjYXBlSFRNTChsYWJlbHNbaV0pLFxuICAgICAgICBpc1Zpc2libGU6IHNlcmllcy52aXNpYmxlLFxuICAgICAgICBjb2xvcjogc2VyaWVzLmNvbG9yXG4gICAgICB9O1xuXG4gICAgICBkYXRhLnNlcmllcy5wdXNoKHNlcmllc0RhdGEpO1xuICAgICAgbGFiZWxUb1Nlcmllc1tsYWJlbHNbaV1dID0gc2VyaWVzRGF0YTtcbiAgICB9XG4gIH1cblxuICBpZiAodHlwZW9mKHgpICE9PSAndW5kZWZpbmVkJykge1xuICAgIHZhciB4T3B0VmlldyA9IGcub3B0aW9uc1ZpZXdGb3JBeGlzXygneCcpO1xuICAgIHZhciB4dmYgPSB4T3B0VmlldygndmFsdWVGb3JtYXR0ZXInKTtcbiAgICBkYXRhLnhIVE1MID0geHZmLmNhbGwoZywgeCwgeE9wdFZpZXcsIGxhYmVsc1swXSwgZywgcm93LCAwKTtcblxuICAgIHZhciB5T3B0Vmlld3MgPSBbXTtcbiAgICB2YXIgbnVtX2F4ZXMgPSBnLm51bUF4ZXMoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bV9heGVzOyBpKyspIHtcbiAgICAgIC8vIFRPRE8oZGFudmspOiByZW1vdmUgdGhpcyB1c2Ugb2YgYSBwcml2YXRlIEFQSVxuICAgICAgeU9wdFZpZXdzW2ldID0gZy5vcHRpb25zVmlld0ZvckF4aXNfKCd5JyArIChpID8gMSArIGkgOiAnJykpO1xuICAgIH1cblxuICAgIHZhciBzaG93WmVyb3MgPSBnLmdldE9wdGlvbignbGFiZWxzU2hvd1plcm9WYWx1ZXMnKTtcbiAgICB2YXIgaGlnaGxpZ2h0U2VyaWVzID0gZy5nZXRIaWdobGlnaHRTZXJpZXMoKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgc2VsX3BvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHB0ID0gc2VsX3BvaW50c1tpXTtcbiAgICAgIHZhciBzZXJpZXNEYXRhID0gbGFiZWxUb1Nlcmllc1twdC5uYW1lXTtcbiAgICAgIHNlcmllc0RhdGEueSA9IHB0Lnl2YWw7XG5cbiAgICAgIGlmICgocHQueXZhbCA9PT0gMCAmJiAhc2hvd1plcm9zKSB8fCBpc05hTihwdC5jYW52YXN5KSkge1xuICAgICAgICBzZXJpZXNEYXRhLmlzVmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIHNlcmllcyA9IGcuZ2V0UHJvcGVydGllc0ZvclNlcmllcyhwdC5uYW1lKTtcbiAgICAgIHZhciB5T3B0VmlldyA9IHlPcHRWaWV3c1tzZXJpZXMuYXhpcyAtIDFdO1xuICAgICAgdmFyIGZtdEZ1bmMgPSB5T3B0VmlldygndmFsdWVGb3JtYXR0ZXInKTtcbiAgICAgIHZhciB5SFRNTCA9IGZtdEZ1bmMuY2FsbChnLCBwdC55dmFsLCB5T3B0VmlldywgcHQubmFtZSwgZywgcm93LCBsYWJlbHMuaW5kZXhPZihwdC5uYW1lKSk7XG5cbiAgICAgIHV0aWxzLnVwZGF0ZShzZXJpZXNEYXRhLCB7eUhUTUx9KTtcblxuICAgICAgaWYgKHB0Lm5hbWUgPT0gaGlnaGxpZ2h0U2VyaWVzKSB7XG4gICAgICAgIHNlcmllc0RhdGEuaXNIaWdobGlnaHRlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmFyIGZvcm1hdHRlciA9IChnLmdldE9wdGlvbignbGVnZW5kRm9ybWF0dGVyJykgfHwgTGVnZW5kLmRlZmF1bHRGb3JtYXR0ZXIpO1xuICByZXR1cm4gZm9ybWF0dGVyLmNhbGwoZywgZGF0YSk7XG59XG5cbkxlZ2VuZC5kZWZhdWx0Rm9ybWF0dGVyID0gZnVuY3Rpb24oZGF0YSkge1xuICB2YXIgZyA9IGRhdGEuZHlncmFwaDtcblxuICAvLyBUT0RPKGRhbnZrKTogZGVwcmVjYXRlIHRoaXMgb3B0aW9uIGluIHBsYWNlIG9mIHtsZWdlbmQ6ICduZXZlcid9XG4gIC8vIFhYWCBzaG91bGQgdGhpcyBsb2dpYyBiZSBpbiB0aGUgZm9ybWF0dGVyP1xuICBpZiAoZy5nZXRPcHRpb24oJ3Nob3dMYWJlbHNPbkhpZ2hsaWdodCcpICE9PSB0cnVlKSByZXR1cm4gJyc7XG5cbiAgdmFyIHNlcExpbmVzID0gZy5nZXRPcHRpb24oJ2xhYmVsc1NlcGFyYXRlTGluZXMnKTtcbiAgdmFyIGh0bWw7XG5cbiAgaWYgKHR5cGVvZihkYXRhLngpID09PSAndW5kZWZpbmVkJykge1xuICAgIC8vIFRPRE86IHRoaXMgY2hlY2sgaXMgZHVwbGljYXRlZCBpbiBnZW5lcmF0ZUxlZ2VuZEhUTUwuIFB1dCBpdCBpbiBvbmUgcGxhY2UuXG4gICAgaWYgKGcuZ2V0T3B0aW9uKCdsZWdlbmQnKSAhPSAnYWx3YXlzJykge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIGh0bWwgPSAnJztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEuc2VyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc2VyaWVzID0gZGF0YS5zZXJpZXNbaV07XG4gICAgICBpZiAoIXNlcmllcy5pc1Zpc2libGUpIGNvbnRpbnVlO1xuXG4gICAgICBpZiAoaHRtbCAhPT0gJycpIGh0bWwgKz0gKHNlcExpbmVzID8gJzxiciAvPicgOiAnICcpO1xuICAgICAgaHRtbCArPSBgPHNwYW4gc3R5bGU9J2ZvbnQtd2VpZ2h0OiBib2xkOyBjb2xvcjogJHtzZXJpZXMuY29sb3J9Oyc+JHtzZXJpZXMuZGFzaEhUTUx9ICR7c2VyaWVzLmxhYmVsSFRNTH08L3NwYW4+YDtcbiAgICB9XG4gICAgcmV0dXJuIGh0bWw7XG4gIH1cblxuICBodG1sID0gZGF0YS54SFRNTCArICc6JztcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLnNlcmllcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBzZXJpZXMgPSBkYXRhLnNlcmllc1tpXTtcbiAgICBpZiAoIXNlcmllcy55ICYmICFzZXJpZXMueUhUTUwpIGNvbnRpbnVlO1xuICAgIGlmICghc2VyaWVzLmlzVmlzaWJsZSkgY29udGludWU7XG4gICAgaWYgKHNlcExpbmVzKSBodG1sICs9ICc8YnI+JztcbiAgICB2YXIgY2xzID0gc2VyaWVzLmlzSGlnaGxpZ2h0ZWQgPyAnIGNsYXNzPVwiaGlnaGxpZ2h0XCInIDogJyc7XG4gICAgaHRtbCArPSBgPHNwYW4ke2Nsc30+IDxiPjxzcGFuIHN0eWxlPSdjb2xvcjogJHtzZXJpZXMuY29sb3J9Oyc+JHtzZXJpZXMubGFiZWxIVE1MfTwvc3Bhbj48L2I+OiYjMTYwOyR7c2VyaWVzLnlIVE1MfTwvc3Bhbj5gO1xuICB9XG4gIHJldHVybiBodG1sO1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZXMgaHRtbCBmb3IgdGhlIFwiZGFzaFwiIGRpc3BsYXllZCBvbiB0aGUgbGVnZW5kIHdoZW4gdXNpbmcgXCJsZWdlbmQ6IGFsd2F5c1wiLlxuICogSW4gcGFydGljdWxhciwgdGhpcyB3b3JrcyBmb3IgZGFzaGVkIGxpbmVzIHdpdGggYW55IHN0cm9rZSBwYXR0ZXJuLiBJdCB3aWxsXG4gKiB0cnkgdG8gc2NhbGUgdGhlIHBhdHRlcm4gdG8gZml0IGluIDFlbSB3aWR0aC4gT3IgaWYgc21hbGwgZW5vdWdoIHJlcGVhdCB0aGVcbiAqIHBhdHRlcm4gZm9yIDFlbSB3aWR0aC5cbiAqXG4gKiBAcGFyYW0gc3Ryb2tlUGF0dGVybiBUaGUgcGF0dGVyblxuICogQHBhcmFtIGNvbG9yIFRoZSBjb2xvciBvZiB0aGUgc2VyaWVzLlxuICogQHBhcmFtIG9uZUVtV2lkdGggVGhlIHdpZHRoIGluIHBpeGVscyBvZiAxZW0gaW4gdGhlIGxlZ2VuZC5cbiAqIEBwcml2YXRlXG4gKi9cbi8vIFRPRE8oZGFudmspOiBjYWNoZSB0aGUgcmVzdWx0cyBvZiB0aGlzXG5mdW5jdGlvbiBnZW5lcmF0ZUxlZ2VuZERhc2hIVE1MKHN0cm9rZVBhdHRlcm4sIGNvbG9yLCBvbmVFbVdpZHRoKSB7XG4gIC8vIEVhc3ksIGNvbW1vbiBjYXNlOiBhIHNvbGlkIGxpbmVcbiAgaWYgKCFzdHJva2VQYXR0ZXJuIHx8IHN0cm9rZVBhdHRlcm4ubGVuZ3RoIDw9IDEpIHtcbiAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJkeWdyYXBoLWxlZ2VuZC1saW5lXCIgc3R5bGU9XCJib3JkZXItYm90dG9tLWNvbG9yOiAke2NvbG9yfTtcIj48L2Rpdj5gO1xuICB9XG5cbiAgdmFyIGksIGosIHBhZGRpbmdMZWZ0LCBtYXJnaW5SaWdodDtcbiAgdmFyIHN0cm9rZVBpeGVsTGVuZ3RoID0gMCwgc2VnbWVudExvb3AgPSAwO1xuICB2YXIgbm9ybWFsaXplZFBhdHRlcm4gPSBbXTtcbiAgdmFyIGxvb3A7XG5cbiAgLy8gQ29tcHV0ZSB0aGUgbGVuZ3RoIG9mIHRoZSBwaXhlbHMgaW5jbHVkaW5nIHRoZSBmaXJzdCBzZWdtZW50IHR3aWNlLFxuICAvLyBzaW5jZSB3ZSByZXBlYXQgaXQuXG4gIGZvciAoaSA9IDA7IGkgPD0gc3Ryb2tlUGF0dGVybi5sZW5ndGg7IGkrKykge1xuICAgIHN0cm9rZVBpeGVsTGVuZ3RoICs9IHN0cm9rZVBhdHRlcm5baSVzdHJva2VQYXR0ZXJuLmxlbmd0aF07XG4gIH1cblxuICAvLyBTZWUgaWYgd2UgY2FuIGxvb3AgdGhlIHBhdHRlcm4gYnkgaXRzZWxmIGF0IGxlYXN0IHR3aWNlLlxuICBsb29wID0gTWF0aC5mbG9vcihvbmVFbVdpZHRoLyhzdHJva2VQaXhlbExlbmd0aC1zdHJva2VQYXR0ZXJuWzBdKSk7XG4gIGlmIChsb29wID4gMSkge1xuICAgIC8vIFRoaXMgcGF0dGVybiBmaXRzIGF0IGxlYXN0IHR3byB0aW1lcywgbm8gc2NhbGluZyBqdXN0IGNvbnZlcnQgdG8gZW07XG4gICAgZm9yIChpID0gMDsgaSA8IHN0cm9rZVBhdHRlcm4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIG5vcm1hbGl6ZWRQYXR0ZXJuW2ldID0gc3Ryb2tlUGF0dGVybltpXS9vbmVFbVdpZHRoO1xuICAgIH1cbiAgICAvLyBTaW5jZSB3ZSBhcmUgcmVwZWF0aW5nIHRoZSBwYXR0ZXJuLCB3ZSBkb24ndCB3b3JyeSBhYm91dCByZXBlYXRpbmcgdGhlXG4gICAgLy8gZmlyc3Qgc2VnbWVudCBpbiBvbmUgZHJhdy5cbiAgICBzZWdtZW50TG9vcCA9IG5vcm1hbGl6ZWRQYXR0ZXJuLmxlbmd0aDtcbiAgfSBlbHNlIHtcbiAgICAvLyBJZiB0aGUgcGF0dGVybiBkb2Vzbid0IGZpdCBpbiB0aGUgbGVnZW5kIHdlIHNjYWxlIGl0IHRvIGZpdC5cbiAgICBsb29wID0gMTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgc3Ryb2tlUGF0dGVybi5sZW5ndGg7IGkrKykge1xuICAgICAgbm9ybWFsaXplZFBhdHRlcm5baV0gPSBzdHJva2VQYXR0ZXJuW2ldL3N0cm9rZVBpeGVsTGVuZ3RoO1xuICAgIH1cbiAgICAvLyBGb3IgdGhlIHNjYWxlZCBwYXR0ZXJucyB3ZSBkbyByZWRyYXcgdGhlIGZpcnN0IHNlZ21lbnQuXG4gICAgc2VnbWVudExvb3AgPSBub3JtYWxpemVkUGF0dGVybi5sZW5ndGgrMTtcbiAgfVxuXG4gIC8vIE5vdyBtYWtlIHRoZSBwYXR0ZXJuLlxuICB2YXIgZGFzaCA9IFwiXCI7XG4gIGZvciAoaiA9IDA7IGogPCBsb29wOyBqKyspIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgc2VnbWVudExvb3A7IGkrPTIpIHtcbiAgICAgIC8vIFRoZSBwYWRkaW5nIGlzIHRoZSBkcmF3biBzZWdtZW50LlxuICAgICAgcGFkZGluZ0xlZnQgPSBub3JtYWxpemVkUGF0dGVybltpJW5vcm1hbGl6ZWRQYXR0ZXJuLmxlbmd0aF07XG4gICAgICBpZiAoaSA8IHN0cm9rZVBhdHRlcm4ubGVuZ3RoKSB7XG4gICAgICAgIC8vIFRoZSBtYXJnaW4gaXMgdGhlIHNwYWNlIHNlZ21lbnQuXG4gICAgICAgIG1hcmdpblJpZ2h0ID0gbm9ybWFsaXplZFBhdHRlcm5bKGkrMSklbm9ybWFsaXplZFBhdHRlcm4ubGVuZ3RoXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRoZSByZXBlYXRlZCBmaXJzdCBzZWdtZW50IGhhcyBubyByaWdodCBtYXJnaW4uXG4gICAgICAgIG1hcmdpblJpZ2h0ID0gMDtcbiAgICAgIH1cbiAgICAgIGRhc2ggKz0gYDxkaXYgY2xhc3M9XCJkeWdyYXBoLWxlZ2VuZC1kYXNoXCIgc3R5bGU9XCJtYXJnaW4tcmlnaHQ6ICR7bWFyZ2luUmlnaHR9ZW07IHBhZGRpbmctbGVmdDogJHtwYWRkaW5nTGVmdH1lbTtcIj48L2Rpdj5gO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGFzaDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgTGVnZW5kO1xuIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFlBQVk7O0FBQUM7RUFBQTtBQUFBO0FBQUE7QUFFYjtBQUEwQztBQUFBO0FBRTFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUlBLE1BQU0sR0FBRyxTQUFUQSxNQUFNLEdBQWM7RUFDdEIsSUFBSSxDQUFDQyxXQUFXLEdBQUcsSUFBSTtFQUN2QixJQUFJLENBQUNDLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxDQUFFO0FBQ25DLENBQUM7O0FBRURGLE1BQU0sQ0FBQ0csU0FBUyxDQUFDQyxRQUFRLEdBQUcsWUFBVztFQUNyQyxPQUFPLGVBQWU7QUFDeEIsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQUosTUFBTSxDQUFDRyxTQUFTLENBQUNFLFFBQVEsR0FBRyxVQUFTQyxDQUFDLEVBQUU7RUFDdEMsSUFBSUMsR0FBRztFQUVQLElBQUlDLGFBQWEsR0FBR0YsQ0FBQyxDQUFDRyxTQUFTLENBQUMsV0FBVyxDQUFDO0VBQzVDLElBQUlELGFBQWEsSUFBSSxJQUFJLEtBQUtBLGFBQWEsRUFBRTtJQUMzQyxJQUFJLE9BQU9BLGFBQWMsSUFBSSxRQUFRLElBQUlBLGFBQWEsWUFBWUUsTUFBTSxFQUFFO01BQ3hFSCxHQUFHLEdBQUdJLFFBQVEsQ0FBQ0MsY0FBYyxDQUFDSixhQUFhLENBQUM7SUFDOUMsQ0FBQyxNQUFNO01BQ0xELEdBQUcsR0FB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