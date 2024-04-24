/**
 * @license
 * Copyright 2013 David Eberlein (david.eberlein@ch.sauter-bc.com)
 * MIT-licenced: https://opensource.org/licenses/MIT
 */

/**
 * @fileoverview This file contains the managment of data handlers
 * @author David Eberlein (david.eberlein@ch.sauter-bc.com)
 *
 * The idea is to define a common, generic data format that works for all data
 * structures supported by dygraphs. To make this possible, the DataHandler
 * interface is introduced. This makes it possible, that dygraph itself can work
 * with the same logic for every data type independent of the actual format and
 * the DataHandler takes care of the data format specific jobs.
 * DataHandlers are implemented for all data types supported by Dygraphs and
 * return Dygraphs compliant formats.
 * By default the correct DataHandler is chosen based on the options set.
 * Optionally the user may use his own DataHandler (similar to the plugin
 * system).
 *
 *
 * The unified data format returend by each handler is defined as so:
 * series[n][point] = [x,y,(extras)]
 *
 * This format contains the common basis that is needed to draw a simple line
 * series extended by optional extras for more complex graphing types. It
 * contains a primitive x value as first array entry, a primitive y value as
 * second array entry and an optional extras object for additional data needed.
 *
 * x must always be a number.
 * y must always be a number, NaN of type number or null.
 * extras is optional and must be interpreted by the DataHandler. It may be of
 * any type.
 *
 * In practice this might look something like this:
 * default: [x, yVal]
 * errorBar / customBar: [x, yVal, [yTopVariance, yBottomVariance] ]
 *
 */
/*global Dygraph:false */
/*global DygraphLayout:false */

"use strict";

/**
 *
 * The data handler is responsible for all data specific operations. All of the
 * series data it receives and returns is always in the unified data format.
 * Initially the unified data is created by the extractSeries method
 * @constructor
 */
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var DygraphDataHandler = function DygraphDataHandler() {};
var handler = DygraphDataHandler;

/**
 * X-value array index constant for unified data samples.
 * @const
 * @type {number}
 */
handler.X = 0;

/**
 * Y-value array index constant for unified data samples.
 * @const
 * @type {number}
 */
handler.Y = 1;

/**
 * Extras-value array index constant for unified data samples.
 * @const
 * @type {number}
 */
handler.EXTRAS = 2;

/**
 * Extracts one series from the raw data (a 2D array) into an array of the
 * unified data format.
 * This is where undesirable points (i.e. negative values on log scales and
 * missing values through which we wish to connect lines) are dropped.
 * TODO(danvk): the "missing values" bit above doesn't seem right.
 *
 * @param {!Array.<Array>} rawData The raw data passed into dygraphs where
 *     rawData[i] = [x,ySeries1,...,ySeriesN].
 * @param {!number} seriesIndex Index of the series to extract. All other
 *     series should be ignored.
 * @param {!DygraphOptions} options Dygraph options.
 * @return {Array.<[!number,?number,?]>} The series in the unified data format
 *     where series[i] = [x,y,{extras}].
 */
handler.prototype.extractSeries = function (rawData, seriesIndex, options) {};

/**
 * Converts a series to a Point array.  The resulting point array must be
 * returned in increasing order of idx property.
 *
 * @param {!Array.<[!number,?number,?]>} series The series in the unified
 *          data format where series[i] = [x,y,{extras}].
 * @param {!string} setName Name of the series.
 * @param {!number} boundaryIdStart Index offset of the first point, equal to the
 *          number of skipped points left of the date window minimum (if any).
 * @return {!Array.<Dygraph.PointType>} List of points for this series.
 */
handler.prototype.seriesToPoints = function (series, setName, boundaryIdStart) {
  // TODO(bhs): these loops are a hot-spot for high-point-count charts. In
  // fact,
  // on chrome+linux, they are 6 times more expensive than iterating through
  // the
  // points and drawing the lines. The brunt of the cost comes from allocating
  // the |point| structures.
  var points = [];
  for (var i = 0; i < series.length; ++i) {
    var item = series[i];
    var yraw = item[1];
    var yval = yraw === null ? null : handler.parseFloat(yraw);
    var point = {
      x: NaN,
      y: NaN,
      xval: handler.parseFloat(item[0]),
      yval: yval,
      name: setName,
      // TODO(danvk): is this really necessary?
      idx: i + boundaryIdStart,
      canvasx: NaN,
      // add these so we do not alter the structure later, which slows Chrome
      canvasy: NaN
    };
    points.push(point);
  }
  this.onPointsCreated_(series, points);
  return points;
};

/**
 * Callback called for each series after the series points have been generated
 * which will later be used by the plotters to draw the graph.
 * Here data may be added to the seriesPoints which is needed by the plotters.
 * The indexes of series and points are in sync meaning the original data
 * sample for series[i] is points[i].
 *
 * @param {!Array.<[!number,?number,?]>} series The series in the unified
 *     data format where series[i] = [x,y,{extras}].
 * @param {!Array.<Dygraph.PointType>} points The corresponding points passed
 *     to the plotter.
 * @protected
 */
handler.prototype.onPointsCreated_ = function (series, points) {};

/**
 * Calculates the rolling average of a data set.
 *
 * @param {!Array.<[!number,?number,?]>} series The series in the unified
 *          data format where series[i] = [x,y,{extras}].
 * @param {!number} rollPeriod The number of points over which to average the data
 * @param {!DygraphOptions} options The dygraph options.
 * @param {!number} seriesIndex Index of the series this was extracted from.
 * @return {!Array.<[!number,?number,?]>} the rolled series.
 */
handler.prototype.rollingAverage = function (series, rollPeriod, options, seriesIndex) {};

/**
 * Computes the range of the data series (including confidence intervals).
 *
 * @param {!Array.<[!number,?number,?]>} series The series in the unified
 *     data format where series[i] = [x, y, {extras}].
 * @param {!Array.<number>} dateWindow The x-value range to display with
 *     the format: [min, max].
 * @param {boolean} stepPlot Whether the stepPlot option is set.
 * @return {Array.<number>} The low and high extremes of the series in the
 *     given window with the format: [low, high].
 */
handler.prototype.getExtremeYValues = function (series, dateWindow, stepPlot) {};

/**
 * Callback called for each series after the layouting data has been
 * calculated before the series is drawn. Here normalized positioning data
 * should be calculated for the extras of each point.
 *
 * @param {!Array.<Dygraph.PointType>} points The points passed to
 *          the plotter.
 * @param {!Object} axis The axis on which the series will be plotted.
 * @param {!boolean} logscale Whether or not to use a logscale.
 */
handler.prototype.onLineEvaluated = function (points, axis, logscale) {};

/**
 * Optimized replacement for parseFloat, which was way too slow when almost
 * all values were type number, with few edge cases, none of which were strings.
 * @param {?number} val
 * @return {number}
 * @protected
 */
handler.parseFloat = function (val) {
  // parseFloat(null) is NaN
  if (val === null) {
    return NaN;
  }

  // Assume it's a number or NaN. If it's something else, I'll be shocked.
  return val;
};
var _default = DygraphDataHandler;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEeWdyYXBoRGF0YUhhbmRsZXIiLCJoYW5kbGVyIiwiWCIsIlkiLCJFWFRSQVMiLCJwcm90b3R5cGUiLCJleHRyYWN0U2VyaWVzIiwicmF3RGF0YSIsInNlcmllc0luZGV4Iiwib3B0aW9ucyIsInNlcmllc1RvUG9pbnRzIiwic2VyaWVzIiwic2V0TmFtZSIsImJvdW5kYXJ5SWRTdGFydCIsInBvaW50cyIsImkiLCJsZW5ndGgiLCJpdGVtIiwieXJhdyIsInl2YWwiLCJwYXJzZUZsb2F0IiwicG9pbnQiLCJ4IiwiTmFOIiwieSIsInh2YWwiLCJuYW1lIiwiaWR4IiwiY2FudmFzeCIsImNhbnZhc3kiLCJwdXNoIiwib25Qb2ludHNDcmVhdGVkXyIsInJvbGxpbmdBdmVyYWdlIiwicm9sbFBlcmlvZCIsImdldEV4dHJlbWVZVmFsdWVzIiwiZGF0ZVdpbmRvdyIsInN0ZXBQbG90Iiwib25MaW5lRXZhbHVhdGVkIiwiYXhpcyIsImxvZ3NjYWxlIiwidmFsIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RhdGFoYW5kbGVyL2RhdGFoYW5kbGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDEzIERhdmlkIEViZXJsZWluIChkYXZpZC5lYmVybGVpbkBjaC5zYXV0ZXItYmMuY29tKVxuICogTUlULWxpY2VuY2VkOiBodHRwczovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICovXG5cbi8qKlxuICogQGZpbGVvdmVydmlldyBUaGlzIGZpbGUgY29udGFpbnMgdGhlIG1hbmFnbWVudCBvZiBkYXRhIGhhbmRsZXJzXG4gKiBAYXV0aG9yIERhdmlkIEViZXJsZWluIChkYXZpZC5lYmVybGVpbkBjaC5zYXV0ZXItYmMuY29tKVxuICpcbiAqIFRoZSBpZGVhIGlzIHRvIGRlZmluZSBhIGNvbW1vbiwgZ2VuZXJpYyBkYXRhIGZvcm1hdCB0aGF0IHdvcmtzIGZvciBhbGwgZGF0YVxuICogc3RydWN0dXJlcyBzdXBwb3J0ZWQgYnkgZHlncmFwaHMuIFRvIG1ha2UgdGhpcyBwb3NzaWJsZSwgdGhlIERhdGFIYW5kbGVyXG4gKiBpbnRlcmZhY2UgaXMgaW50cm9kdWNlZC4gVGhpcyBtYWtlcyBpdCBwb3NzaWJsZSwgdGhhdCBkeWdyYXBoIGl0c2VsZiBjYW4gd29ya1xuICogd2l0aCB0aGUgc2FtZSBsb2dpYyBmb3IgZXZlcnkgZGF0YSB0eXBlIGluZGVwZW5kZW50IG9mIHRoZSBhY3R1YWwgZm9ybWF0IGFuZFxuICogdGhlIERhdGFIYW5kbGVyIHRha2VzIGNhcmUgb2YgdGhlIGRhdGEgZm9ybWF0IHNwZWNpZmljIGpvYnMuXG4gKiBEYXRhSGFuZGxlcnMgYXJlIGltcGxlbWVudGVkIGZvciBhbGwgZGF0YSB0eXBlcyBzdXBwb3J0ZWQgYnkgRHlncmFwaHMgYW5kXG4gKiByZXR1cm4gRHlncmFwaHMgY29tcGxpYW50IGZvcm1hdHMuXG4gKiBCeSBkZWZhdWx0IHRoZSBjb3JyZWN0IERhdGFIYW5kbGVyIGlzIGNob3NlbiBiYXNlZCBvbiB0aGUgb3B0aW9ucyBzZXQuXG4gKiBPcHRpb25hbGx5IHRoZSB1c2VyIG1heSB1c2UgaGlzIG93biBEYXRhSGFuZGxlciAoc2ltaWxhciB0byB0aGUgcGx1Z2luXG4gKiBzeXN0ZW0pLlxuICpcbiAqXG4gKiBUaGUgdW5pZmllZCBkYXRhIGZvcm1hdCByZXR1cmVuZCBieSBlYWNoIGhhbmRsZXIgaXMgZGVmaW5lZCBhcyBzbzpcbiAqIHNlcmllc1tuXVtwb2ludF0gPSBbeCx5LChleHRyYXMpXVxuICpcbiAqIFRoaXMgZm9ybWF0IGNvbnRhaW5zIHRoZSBjb21tb24gYmFzaXMgdGhhdCBpcyBuZWVkZWQgdG8gZHJhdyBhIHNpbXBsZSBsaW5lXG4gKiBzZXJpZXMgZXh0ZW5kZWQgYnkgb3B0aW9uYWwgZXh0cmFzIGZvciBtb3JlIGNvbXBsZXggZ3JhcGhpbmcgdHlwZXMuIEl0XG4gKiBjb250YWlucyBhIHByaW1pdGl2ZSB4IHZhbHVlIGFzIGZpcnN0IGFycmF5IGVudHJ5LCBhIHByaW1pdGl2ZSB5IHZhbHVlIGFzXG4gKiBzZWNvbmQgYXJyYXkgZW50cnkgYW5kIGFuIG9wdGlvbmFsIGV4dHJhcyBvYmplY3QgZm9yIGFkZGl0aW9uYWwgZGF0YSBuZWVkZWQuXG4gKlxuICogeCBtdXN0IGFsd2F5cyBiZSBhIG51bWJlci5cbiAqIHkgbXVzdCBhbHdheXMgYmUgYSBudW1iZXIsIE5hTiBvZiB0eXBlIG51bWJlciBvciBudWxsLlxuICogZXh0cmFzIGlzIG9wdGlvbmFsIGFuZCBtdXN0IGJlIGludGVycHJldGVkIGJ5IHRoZSBEYXRhSGFuZGxlci4gSXQgbWF5IGJlIG9mXG4gKiBhbnkgdHlwZS5cbiAqXG4gKiBJbiBwcmFjdGljZSB0aGlzIG1pZ2h0IGxvb2sgc29tZXRoaW5nIGxpa2UgdGhpczpcbiAqIGRlZmF1bHQ6IFt4LCB5VmFsXVxuICogZXJyb3JCYXIgLyBjdXN0b21CYXI6IFt4LCB5VmFsLCBbeVRvcFZhcmlhbmNlLCB5Qm90dG9tVmFyaWFuY2VdIF1cbiAqXG4gKi9cbi8qZ2xvYmFsIER5Z3JhcGg6ZmFsc2UgKi9cbi8qZ2xvYmFsIER5Z3JhcGhMYXlvdXQ6ZmFsc2UgKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICpcbiAqIFRoZSBkYXRhIGhhbmRsZXIgaXMgcmVzcG9uc2libGUgZm9yIGFsbCBkYXRhIHNwZWNpZmljIG9wZXJhdGlvbnMuIEFsbCBvZiB0aGVcbiAqIHNlcmllcyBkYXRhIGl0IHJlY2VpdmVzIGFuZCByZXR1cm5zIGlzIGFsd2F5cyBpbiB0aGUgdW5pZmllZCBkYXRhIGZvcm1hdC5cbiAqIEluaXRpYWxseSB0aGUgdW5pZmllZCBkYXRhIGlzIGNyZWF0ZWQgYnkgdGhlIGV4dHJhY3RTZXJpZXMgbWV0aG9kXG4gKiBAY29uc3RydWN0b3JcbiAqL1xudmFyIER5Z3JhcGhEYXRhSGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcbn07XG5cbnZhciBoYW5kbGVyID0gRHlncmFwaERhdGFIYW5kbGVyO1xuXG4vKipcbiAqIFgtdmFsdWUgYXJyYXkgaW5kZXggY29uc3RhbnQgZm9yIHVuaWZpZWQgZGF0YSBzYW1wbGVzLlxuICogQGNvbnN0XG4gKiBAdHlwZSB7bnVtYmVyfVxuICovXG5oYW5kbGVyLlggPSAwO1xuXG4vKipcbiAqIFktdmFsdWUgYXJyYXkgaW5kZXggY29uc3RhbnQgZm9yIHVuaWZpZWQgZGF0YSBzYW1wbGVzLlxuICogQGNvbnN0XG4gKiBAdHlwZSB7bnVtYmVyfVxuICovXG5oYW5kbGVyLlkgPSAxO1xuXG4vKipcbiAqIEV4dHJhcy12YWx1ZSBhcnJheSBpbmRleCBjb25zdGFudCBmb3IgdW5pZmllZCBkYXRhIHNhbXBsZXMuXG4gKiBAY29uc3RcbiAqIEB0eXBlIHtudW1iZXJ9XG4gKi9cbmhhbmRsZXIuRVhUUkFTID0gMjtcblxuLyoqXG4gKiBFeHRyYWN0cyBvbmUgc2VyaWVzIGZyb20gdGhlIHJhdyBkYXRhIChhIDJEIGFycmF5KSBpbnRvIGFuIGFycmF5IG9mIHRoZVxuICogdW5pZmllZCBkYXRhIGZvcm1hdC5cbiAqIFRoaXMgaXMgd2hlcmUgdW5kZXNpcmFibGUgcG9pbnRzIChpLmUuIG5lZ2F0aXZlIHZhbHVlcyBvbiBsb2cgc2NhbGVzIGFuZFxuICogbWlzc2luZyB2YWx1ZXMgdGhyb3VnaCB3aGljaCB3ZSB3aXNoIHRvIGNvbm5lY3QgbGluZXMpIGFyZSBkcm9wcGVkLlxuICogVE9ETyhkYW52ayk6IHRoZSBcIm1pc3NpbmcgdmFsdWVzXCIgYml0IGFib3ZlIGRvZXNuJ3Qgc2VlbSByaWdodC5cbiAqXG4gKiBAcGFyYW0geyFBcnJheS48QXJyYXk+fSByYXdEYXRhIFRoZSByYXcgZGF0YSBwYXNzZWQgaW50byBkeWdyYXBocyB3aGVyZVxuICogICAgIHJhd0RhdGFbaV0gPSBbeCx5U2VyaWVzMSwuLi4seVNlcmllc05dLlxuICogQHBhcmFtIHshbnVtYmVyfSBzZXJpZXNJbmRleCBJbmRleCBvZiB0aGUgc2VyaWVzIHRvIGV4dHJhY3QuIEFsbCBvdGhlclxuICogICAgIHNlcmllcyBzaG91bGQgYmUgaWdub3JlZC5cbiAqIEBwYXJhbSB7IUR5Z3JhcGhPcHRpb25zfSBvcHRpb25zIER5Z3JhcGggb3B0aW9ucy5cbiAqIEByZXR1cm4ge0FycmF5LjxbIW51bWJlciw/bnVtYmVyLD9dPn0gVGhlIHNlcmllcyBpbiB0aGUgdW5pZmllZCBkYXRhIGZvcm1hdFxuICogICAgIHdoZXJlIHNlcmllc1tpXSA9IFt4LHkse2V4dHJhc31dLlxuICovXG5oYW5kbGVyLnByb3RvdHlwZS5leHRyYWN0U2VyaWVzID0gZnVuY3Rpb24ocmF3RGF0YSwgc2VyaWVzSW5kZXgsIG9wdGlvbnMpIHtcbn07XG5cbi8qKlxuICogQ29udmVydHMgYSBzZXJpZXMgdG8gYSBQb2ludCBhcnJheS4gIFRoZSByZXN1bHRpbmcgcG9pbnQgYXJyYXkgbXVzdCBiZVxuICogcmV0dXJuZWQgaW4gaW5jcmVhc2luZyBvcmRlciBvZiBpZHggcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHshQXJyYXkuPFshbnVtYmVyLD9udW1iZXIsP10+fSBzZXJpZXMgVGhlIHNlcmllcyBpbiB0aGUgdW5pZmllZFxuICogICAgICAgICAgZGF0YSBmb3JtYXQgd2hlcmUgc2VyaWVzW2ldID0gW3gseSx7ZXh0cmFzfV0uXG4gKiBAcGFyYW0geyFzdHJpbmd9IHNldE5hbWUgTmFtZSBvZiB0aGUgc2VyaWVzLlxuICogQHBhcmFtIHshbnVtYmVyfSBib3VuZGFyeUlkU3RhcnQgSW5kZXggb2Zmc2V0IG9mIHRoZSBmaXJzdCBwb2ludCwgZXF1YWwgdG8gdGhlXG4gKiAgICAgICAgICBudW1iZXIgb2Ygc2tpcHBlZCBwb2ludHMgbGVmdCBvZiB0aGUgZGF0ZSB3aW5kb3cgbWluaW11bSAoaWYgYW55KS5cbiAqIEByZXR1cm4geyFBcnJheS48RHlncmFwaC5Qb2ludFR5cGU+fSBMaXN0IG9mIHBvaW50cyBmb3IgdGhpcyBzZXJpZXMuXG4gKi9cbmhhbmRsZXIucHJvdG90eXBlLnNlcmllc1RvUG9pbnRzID0gZnVuY3Rpb24oc2VyaWVzLCBzZXROYW1lLCBib3VuZGFyeUlkU3RhcnQpIHtcbiAgLy8gVE9ETyhiaHMpOiB0aGVzZSBsb29wcyBhcmUgYSBob3Qtc3BvdCBmb3IgaGlnaC1wb2ludC1jb3VudCBjaGFydHMuIEluXG4gIC8vIGZhY3QsXG4gIC8vIG9uIGNocm9tZStsaW51eCwgdGhleSBhcmUgNiB0aW1lcyBtb3JlIGV4cGVuc2l2ZSB0aGFuIGl0ZXJhdGluZyB0aHJvdWdoXG4gIC8vIHRoZVxuICAvLyBwb2ludHMgYW5kIGRyYXdpbmcgdGhlIGxpbmVzLiBUaGUgYnJ1bnQgb2YgdGhlIGNvc3QgY29tZXMgZnJvbSBhbGxvY2F0aW5nXG4gIC8vIHRoZSB8cG9pbnR8IHN0cnVjdHVyZXMuXG4gIHZhciBwb2ludHMgPSBbXTtcbiAgZm9yICggdmFyIGkgPSAwOyBpIDwgc2VyaWVzLmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGl0ZW0gPSBzZXJpZXNbaV07XG4gICAgdmFyIHlyYXcgPSBpdGVtWzFdO1xuICAgIHZhciB5dmFsID0geXJhdyA9PT0gbnVsbCA/IG51bGwgOiBoYW5kbGVyLnBhcnNlRmxvYXQoeXJhdyk7XG4gICAgdmFyIHBvaW50ID0ge1xuICAgICAgeCA6IE5hTixcbiAgICAgIHkgOiBOYU4sXG4gICAgICB4dmFsIDogaGFuZGxlci5wYXJzZUZsb2F0KGl0ZW1bMF0pLFxuICAgICAgeXZhbCA6IHl2YWwsXG4gICAgICBuYW1lIDogc2V0TmFtZSwgLy8gVE9ETyhkYW52ayk6IGlzIHRoaXMgcmVhbGx5IG5lY2Vzc2FyeT9cbiAgICAgIGlkeCA6IGkgKyBib3VuZGFyeUlkU3RhcnQsXG4gICAgICBjYW52YXN4OiBOYU4sIC8vIGFkZCB0aGVzZSBzbyB3ZSBkbyBub3QgYWx0ZXIgdGhlIHN0cnVjdHVyZSBsYXRlciwgd2hpY2ggc2xvd3MgQ2hyb21lXG4gICAgICBjYW52YXN5OiBOYU4sXG4gICAgfTtcbiAgICBwb2ludHMucHVzaChwb2ludCk7XG4gIH1cbiAgdGhpcy5vblBvaW50c0NyZWF0ZWRfKHNlcmllcywgcG9pbnRzKTtcbiAgcmV0dXJuIHBvaW50cztcbn07XG5cbi8qKlxuICogQ2FsbGJhY2sgY2FsbGVkIGZvciBlYWNoIHNlcmllcyBhZnRlciB0aGUgc2VyaWVzIHBvaW50cyBoYXZlIGJlZW4gZ2VuZXJhdGVkXG4gKiB3aGljaCB3aWxsIGxhdGVyIGJlIHVzZWQgYnkgdGhlIHBsb3R0ZXJzIHRvIGRyYXcgdGhlIGdyYXBoLlxuICogSGVyZSBkYXRhIG1heSBiZSBhZGRlZCB0byB0aGUgc2VyaWVzUG9pbnRzIHdoaWNoIGlzIG5lZWRlZCBieSB0aGUgcGxvdHRlcnMuXG4gKiBUaGUgaW5kZXhlcyBvZiBzZXJpZXMgYW5kIHBvaW50cyBhcmUgaW4gc3luYyBtZWFuaW5nIHRoZSBvcmlnaW5hbCBkYXRhXG4gKiBzYW1wbGUgZm9yIHNlcmllc1tpXSBpcyBwb2ludHNbaV0uXG4gKlxuICogQHBhcmFtIHshQXJyYXkuPFshbnVtYmVyLD9udW1iZXIsP10+fSBzZXJpZXMgVGhlIHNlcmllcyBpbiB0aGUgdW5pZmllZFxuICogICAgIGRhdGEgZm9ybWF0IHdoZXJlIHNlcmllc1tpXSA9IFt4LHkse2V4dHJhc31dLlxuICogQHBhcmFtIHshQXJyYXkuPER5Z3JhcGguUG9pbnRUeXBlPn0gcG9pbnRzIFRoZSBjb3JyZXNwb25kaW5nIHBvaW50cyBwYXNzZWRcbiAqICAgICB0byB0aGUgcGxvdHRlci5cbiAqIEBwcm90ZWN0ZWRcbiAqL1xuaGFuZGxlci5wcm90b3R5cGUub25Qb2ludHNDcmVhdGVkXyA9IGZ1bmN0aW9uKHNlcmllcywgcG9pbnRzKSB7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHJvbGxpbmcgYXZlcmFnZSBvZiBhIGRhdGEgc2V0LlxuICpcbiAqIEBwYXJhbSB7IUFycmF5LjxbIW51bWJlciw/bnVtYmVyLD9dPn0gc2VyaWVzIFRoZSBzZXJpZXMgaW4gdGhlIHVuaWZpZWRcbiAqICAgICAgICAgIGRhdGEgZm9ybWF0IHdoZXJlIHNlcmllc1tpXSA9IFt4LHkse2V4dHJhc31dLlxuICogQHBhcmFtIHshbnVtYmVyfSByb2xsUGVyaW9kIFRoZSBudW1iZXIgb2YgcG9pbnRzIG92ZXIgd2hpY2ggdG8gYXZlcmFnZSB0aGUgZGF0YVxuICogQHBhcmFtIHshRHlncmFwaE9wdGlvbnN9IG9wdGlvbnMgVGhlIGR5Z3JhcGggb3B0aW9ucy5cbiAqIEBwYXJhbSB7IW51bWJlcn0gc2VyaWVzSW5kZXggSW5kZXggb2YgdGhlIHNlcmllcyB0aGlzIHdhcyBleHRyYWN0ZWQgZnJvbS5cbiAqIEByZXR1cm4geyFBcnJheS48WyFudW1iZXIsP251bWJlciw/XT59IHRoZSByb2xsZWQgc2VyaWVzLlxuICovXG5oYW5kbGVyLnByb3RvdHlwZS5yb2xsaW5nQXZlcmFnZSA9IGZ1bmN0aW9uKHNlcmllcywgcm9sbFBlcmlvZCwgb3B0aW9ucywgc2VyaWVzSW5kZXgpIHtcbn07XG5cbi8qKlxuICogQ29tcHV0ZXMgdGhlIHJhbmdlIG9mIHRoZSBkYXRhIHNlcmllcyAoaW5jbHVkaW5nIGNvbmZpZGVuY2UgaW50ZXJ2YWxzKS5cbiAqXG4gKiBAcGFyYW0geyFBcnJheS48WyFudW1iZXIsP251bWJlciw/XT59IHNlcmllcyBUaGUgc2VyaWVzIGluIHRoZSB1bmlmaWVkXG4gKiAgICAgZGF0YSBmb3JtYXQgd2hlcmUgc2VyaWVzW2ldID0gW3gsIHksIHtleHRyYXN9XS5cbiAqIEBwYXJhbSB7IUFycmF5LjxudW1iZXI+fSBkYXRlV2luZG93IFRoZSB4LXZhbHVlIHJhbmdlIHRvIGRpc3BsYXkgd2l0aFxuICogICAgIHRoZSBmb3JtYXQ6IFttaW4sIG1heF0uXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHN0ZXBQbG90IFdoZXRoZXIgdGhlIHN0ZXBQbG90IG9wdGlvbiBpcyBzZXQuXG4gKiBAcmV0dXJuIHtBcnJheS48bnVtYmVyPn0gVGhlIGxvdyBhbmQgaGlnaCBleHRyZW1lcyBvZiB0aGUgc2VyaWVzIGluIHRoZVxuICogICAgIGdpdmVuIHdpbmRvdyB3aXRoIHRoZSBmb3JtYXQ6IFtsb3csIGhpZ2hdLlxuICovXG5oYW5kbGVyLnByb3RvdHlwZS5nZXRFeHRyZW1lWVZhbHVlcyA9IGZ1bmN0aW9uKHNlcmllcywgZGF0ZVdpbmRvdywgc3RlcFBsb3QpIHtcbn07XG5cbi8qKlxuICogQ2FsbGJhY2sgY2FsbGVkIGZvciBlYWNoIHNlcmllcyBhZnRlciB0aGUgbGF5b3V0aW5nIGRhdGEgaGFzIGJlZW5cbiAqIGNhbGN1bGF0ZWQgYmVmb3JlIHRoZSBzZXJpZXMgaXMgZHJhd24uIEhlcmUgbm9ybWFsaXplZCBwb3NpdGlvbmluZyBkYXRhXG4gKiBzaG91bGQgYmUgY2FsY3VsYXRlZCBmb3IgdGhlIGV4dHJhcyBvZiBlYWNoIHBvaW50LlxuICpcbiAqIEBwYXJhbSB7IUFycmF5LjxEeWdyYXBoLlBvaW50VHlwZT59IHBvaW50cyBUaGUgcG9pbnRzIHBhc3NlZCB0b1xuICogICAgICAgICAgdGhlIHBsb3R0ZXIuXG4gKiBAcGFyYW0geyFPYmplY3R9IGF4aXMgVGhlIGF4aXMgb24gd2hpY2ggdGhlIHNlcmllcyB3aWxsIGJlIHBsb3R0ZWQuXG4gKiBAcGFyYW0geyFib29sZWFufSBsb2dzY2FsZSBXaGV0aGVyIG9yIG5vdCB0byB1c2UgYSBsb2dzY2FsZS5cbiAqL1xuaGFuZGxlci5wcm90b3R5cGUub25MaW5lRXZhbHVhdGVkID0gZnVuY3Rpb24ocG9pbnRzLCBheGlzLCBsb2dzY2FsZSkge1xufTtcblxuLyoqXG4gKiBPcHRpbWl6ZWQgcmVwbGFjZW1lbnQgZm9yIHBhcnNlRmxvYXQsIHdoaWNoIHdhcyB3YXkgdG9vIHNsb3cgd2hlbiBhbG1vc3RcbiAqIGFsbCB2YWx1ZXMgd2VyZSB0eXBlIG51bWJlciwgd2l0aCBmZXcgZWRnZSBjYXNlcywgbm9uZSBvZiB3aGljaCB3ZXJlIHN0cmluZ3MuXG4gKiBAcGFyYW0gez9udW1iZXJ9IHZhbFxuICogQHJldHVybiB7bnVtYmVyfVxuICogQHByb3RlY3RlZFxuICovXG5oYW5kbGVyLnBhcnNlRmxvYXQgPSBmdW5jdGlvbih2YWwpIHtcbiAgLy8gcGFyc2VGbG9hdChudWxsKSBpcyBOYU5cbiAgaWYgKHZhbCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBOYU47XG4gIH1cblxuICAvLyBBc3N1bWUgaXQncyBhIG51bWJlciBvciBOYU4uIElmIGl0J3Mgc29tZXRoaW5nIGVsc2UsIEknbGwgYmUgc2hvY2tlZC5cbiAgcmV0dXJuIHZhbDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IER5Z3JhcGhEYXRhSGFuZGxlcjtcbiJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsWUFBWTs7QUFFWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQU5BO0VBQUE7QUFBQTtBQUFBO0FBT0EsSUFBSUEsa0JBQWtCLEdBQUcsU0FBckJBLGtCQUFrQixHQUFlLENBQ3JDLENBQUM7QUFFRCxJQUFJQyxPQUFPLEdBQUdELGtCQUFrQjs7QUFFaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBQyxPQUFPLENBQUNDLENBQUMsR0FBRyxDQUFDOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQUQsT0FBTyxDQUFDRSxDQUFDLEdBQUcsQ0FBQzs7QUFFYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FGLE9BQU8sQ0FBQ0csTUFBTSxHQUFHLENBQUM7O0FBRWxCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBSCxPQUFPLENBQUNJLFNBQVMsQ0FBQ0MsYUFBYSxHQUFHLFVBQVNDLE9BQU8sRUFBRUMsV0FBVyxFQUFFQyxPQUFPLEVBQUUsQ0FDMUUsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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