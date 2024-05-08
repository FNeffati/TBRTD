/**
 * @license
 * Copyright 2011 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licenced: https://opensource.org/licenses/MIT
 */

/**
 * @fileoverview DygraphOptions is responsible for parsing and returning
 * information about options.
 */

// TODO: remove this jshint directive & fix the warnings.
/*jshint sub:true */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var utils = _interopRequireWildcard(require("./dygraph-utils"));
var _dygraphDefaultAttrs = _interopRequireDefault(require("./dygraph-default-attrs"));
var _dygraphOptionsReference = _interopRequireDefault(require("./dygraph-options-reference"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/*
 * Interesting member variables: (REMOVING THIS LIST AS I CLOSURIZE)
 * global_ - global attributes (common among all graphs, AIUI)
 * user - attributes set by the user
 * series_ - { seriesName -> { idx, yAxis, options }}
 */

/**
 * This parses attributes into an object that can be easily queried.
 *
 * It doesn't necessarily mean that all options are available, specifically
 * if labels are not yet available, since those drive details of the per-series
 * and per-axis options.
 *
 * @param {Dygraph} dygraph The chart to which these options belong.
 * @constructor
 */
var DygraphOptions = function DygraphOptions(dygraph) {
  /**
   * The dygraph.
   * @type {!Dygraph}
   */
  this.dygraph_ = dygraph;

  /**
   * Array of axis index to { series : [ series names ] , options : { axis-specific options. } }
   * @type {Array.<{series : Array.<string>, options : Object}>} @private
   */
  this.yAxes_ = [];

  /**
   * Contains x-axis specific options, which are stored in the options key.
   * This matches the yAxes_ object structure (by being a dictionary with an
   * options element) allowing for shared code.
   * @type {options: Object} @private
   */
  this.xAxis_ = {};
  this.series_ = {};

  // Once these two objects are initialized, you can call get();
  this.global_ = this.dygraph_.attrs_;
  this.user_ = this.dygraph_.user_attrs_ || {};

  /**
   * A list of series in columnar order.
   * @type {Array.<string>}
   */
  this.labels_ = [];
  this.highlightSeries_ = this.get("highlightSeriesOpts") || {};
  this.reparseSeries();
};

/**
 * Not optimal, but does the trick when you're only using two axes.
 * If we move to more axes, this can just become a function.
 *
 * @type {Object.<number>}
 * @private
 */
DygraphOptions.AXIS_STRING_MAPPINGS_ = {
  'y': 0,
  'Y': 0,
  'y1': 0,
  'Y1': 0,
  'y2': 1,
  'Y2': 1
};

/**
 * @param {string|number} axis
 * @private
 */
DygraphOptions.axisToIndex_ = function (axis) {
  if (typeof axis == "string") {
    if (DygraphOptions.AXIS_STRING_MAPPINGS_.hasOwnProperty(axis)) {
      return DygraphOptions.AXIS_STRING_MAPPINGS_[axis];
    }
    throw "Unknown axis : " + axis;
  }
  if (typeof axis == "number") {
    if (axis === 0 || axis === 1) {
      return axis;
    }
    throw "Dygraphs only supports two y-axes, indexed from 0-1.";
  }
  if (axis) {
    throw "Unknown axis : " + axis;
  }
  // No axis specification means axis 0.
  return 0;
};

/**
 * Reparses options that are all related to series. This typically occurs when
 * options are either updated, or source data has been made available.
 *
 * TODO(konigsberg): The method name is kind of weak; fix.
 */
DygraphOptions.prototype.reparseSeries = function () {
  var labels = this.get("labels");
  if (!labels) {
    return; // -- can't do more for now, will parse after getting the labels.
  }

  this.labels_ = labels.slice(1);
  this.yAxes_ = [{
    series: [],
    options: {}
  }]; // Always one axis at least.
  this.xAxis_ = {
    options: {}
  };
  this.series_ = {};

  // Series are specified in the series element:
  //
  // {
  //   labels: [ "X", "foo", "bar" ],
  //   pointSize: 3,
  //   series : {
  //     foo : {}, // options for foo
  //     bar : {} // options for bar
  //   }
  // }
  //
  // So, if series is found, it's expected to contain per-series data,
  // otherwise set a default.
  var seriesDict = this.user_.series || {};
  for (var idx = 0; idx < this.labels_.length; idx++) {
    var seriesName = this.labels_[idx];
    var optionsForSeries = seriesDict[seriesName] || {};
    var yAxis = DygraphOptions.axisToIndex_(optionsForSeries["axis"]);
    this.series_[seriesName] = {
      idx: idx,
      yAxis: yAxis,
      options: optionsForSeries
    };
    if (!this.yAxes_[yAxis]) {
      this.yAxes_[yAxis] = {
        series: [seriesName],
        options: {}
      };
    } else {
      this.yAxes_[yAxis].series.push(seriesName);
    }
  }
  var axis_opts = this.user_["axes"] || {};
  utils.update(this.yAxes_[0].options, axis_opts["y"] || {});
  if (this.yAxes_.length > 1) {
    utils.update(this.yAxes_[1].options, axis_opts["y2"] || {});
  }
  utils.update(this.xAxis_.options, axis_opts["x"] || {});
  if (typeof process !== 'undefined' && process.env.NODE_ENV != 'production') {
    // For "production" code, this gets removed by uglifyjs.
    this.validateOptions_();
  }
};

/**
 * Get a global value.
 *
 * @param {string} name the name of the option.
 */
DygraphOptions.prototype.get = function (name) {
  var result = this.getGlobalUser_(name);
  if (result !== null) {
    return result;
  }
  return this.getGlobalDefault_(name);
};
DygraphOptions.prototype.getGlobalUser_ = function (name) {
  if (this.user_.hasOwnProperty(name)) {
    return this.user_[name];
  }
  return null;
};
DygraphOptions.prototype.getGlobalDefault_ = function (name) {
  if (this.global_.hasOwnProperty(name)) {
    return this.global_[name];
  }
  if (_dygraphDefaultAttrs["default"].hasOwnProperty(name)) {
    return _dygraphDefaultAttrs["default"][name];
  }
  return null;
};

/**
 * Get a value for a specific axis. If there is no specific value for the axis,
 * the global value is returned.
 *
 * @param {string} name the name of the option.
 * @param {string|number} axis the axis to search. Can be the string representation
 * ("y", "y2") or the axis number (0, 1).
 */
DygraphOptions.prototype.getForAxis = function (name, axis) {
  var axisIdx;
  var axisString;

  // Since axis can be a number or a string, straighten everything out here.
  if (typeof axis == 'number') {
    axisIdx = axis;
    axisString = axisIdx === 0 ? "y" : "y2";
  } else {
    if (axis == "y1") {
      axis = "y";
    } // Standardize on 'y'. Is this bad? I think so.
    if (axis == "y") {
      axisIdx = 0;
    } else if (axis == "y2") {
      axisIdx = 1;
    } else if (axis == "x") {
      axisIdx = -1; // simply a placeholder for below.
    } else {
      throw "Unknown axis " + axis;
    }
    axisString = axis;
  }
  var userAxis = axisIdx == -1 ? this.xAxis_ : this.yAxes_[axisIdx];

  // Search the user-specified axis option first.
  if (userAxis) {
    // This condition could be removed if we always set up this.yAxes_ for y2.
    var axisOptions = userAxis.options;
    if (axisOptions.hasOwnProperty(name)) {
      return axisOptions[name];
    }
  }

  // User-specified global options second.
  // But, hack, ignore globally-specified 'logscale' for 'x' axis declaration.
  if (!(axis === 'x' && name === 'logscale')) {
    var result = this.getGlobalUser_(name);
    if (result !== null) {
      return result;
    }
  }
  // Default axis options third.
  var defaultAxisOptions = _dygraphDefaultAttrs["default"].axes[axisString];
  if (defaultAxisOptions.hasOwnProperty(name)) {
    return defaultAxisOptions[name];
  }

  // Default global options last.
  return this.getGlobalDefault_(name);
};

/**
 * Get a value for a specific series. If there is no specific value for the series,
 * the value for the axis is returned (and afterwards, the global value.)
 *
 * @param {string} name the name of the option.
 * @param {string} series the series to search.
 */
DygraphOptions.prototype.getForSeries = function (name, series) {
  // Honors indexes as series.
  if (series === this.dygraph_.getHighlightSeries()) {
    if (this.highlightSeries_.hasOwnProperty(name)) {
      return this.highlightSeries_[name];
    }
  }
  if (!this.series_.hasOwnProperty(series)) {
    throw "Unknown series: " + series;
  }
  var seriesObj = this.series_[series];
  var seriesOptions = seriesObj["options"];
  if (seriesOptions.hasOwnProperty(name)) {
    return seriesOptions[name];
  }
  return this.getForAxis(name, seriesObj["yAxis"]);
};

/**
 * Returns the number of y-axes on the chart.
 * @return {number} the number of axes.
 */
DygraphOptions.prototype.numAxes = function () {
  return this.yAxes_.length;
};

/**
 * Return the y-axis for a given series, specified by name.
 */
DygraphOptions.prototype.axisForSeries = function (series) {
  return this.series_[series].yAxis;
};

/**
 * Returns the options for the specified axis.
 */
// TODO(konigsberg): this is y-axis specific. Support the x axis.
DygraphOptions.prototype.axisOptions = function (yAxis) {
  return this.yAxes_[yAxis].options;
};

/**
 * Return the series associated with an axis.
 */
DygraphOptions.prototype.seriesForAxis = function (yAxis) {
  return this.yAxes_[yAxis].series;
};

/**
 * Return the list of all series, in their columnar order.
 */
DygraphOptions.prototype.seriesNames = function () {
  return this.labels_;
};
if (typeof process !== 'undefined' && process.env.NODE_ENV != 'production') {
  // For "production" code, this gets removed by uglifyjs.

  /**
   * Validate all options.
   * This requires OPTIONS_REFERENCE, which is only available in debug builds.
   * @private
   */
  DygraphOptions.prototype.validateOptions_ = function () {
    if (typeof _dygraphOptionsReference["default"] === 'undefined') {
      throw 'Called validateOptions_ in prod build.';
    }
    var that = this;
    var validateOption = function validateOption(optionName) {
      if (!_dygraphOptionsReference["default"][optionName]) {
        that.warnInvalidOption_(optionName);
      }
    };
    var optionsDicts = [this.xAxis_.options, this.yAxes_[0].options, this.yAxes_[1] && this.yAxes_[1].options, this.global_, this.user_, this.highlightSeries_];
    var names = this.seriesNames();
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      if (this.series_.hasOwnProperty(name)) {
        optionsDicts.push(this.series_[name].options);
      }
    }
    for (var i = 0; i < optionsDicts.length; i++) {
      var dict = optionsDicts[i];
      if (!dict) continue;
      for (var optionName in dict) {
        if (dict.hasOwnProperty(optionName)) {
          validateOption(optionName);
        }
      }
    }
  };
  var WARNINGS = {}; // Only show any particular warning once.

  /**
   * Logs a warning about invalid options.
   * TODO: make this throw for testing
   * @private
   */
  DygraphOptions.prototype.warnInvalidOption_ = function (optionName) {
    if (!WARNINGS[optionName]) {
      WARNINGS[optionName] = true;
      var isSeries = this.labels_.indexOf(optionName) >= 0;
      if (isSeries) {
        console.warn('Use new-style per-series options (saw ' + optionName + ' as top-level options key). See http://blog.dygraphs.com/2012/12/the-new-and-better-way-to-specify.html (The New and Better Way to Specify Series and Axis Options).');
      } else {
        console.warn('Unknown option ' + optionName + ' (see https://dygraphs.com/options.html for the full list of options)');
      }
      throw "invalid option " + optionName;
    }
  };

  // Reset list of previously-shown warnings. Used for testing.
  DygraphOptions.resetWarnings_ = function () {
    WARNINGS = {};
  };
}
var _default = DygraphOptions;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEeWdyYXBoT3B0aW9ucyIsImR5Z3JhcGgiLCJkeWdyYXBoXyIsInlBeGVzXyIsInhBeGlzXyIsInNlcmllc18iLCJnbG9iYWxfIiwiYXR0cnNfIiwidXNlcl8iLCJ1c2VyX2F0dHJzXyIsImxhYmVsc18iLCJoaWdobGlnaHRTZXJpZXNfIiwiZ2V0IiwicmVwYXJzZVNlcmllcyIsIkFYSVNfU1RSSU5HX01BUFBJTkdTXyIsImF4aXNUb0luZGV4XyIsImF4aXMiLCJoYXNPd25Qcm9wZXJ0eSIsInByb3RvdHlwZSIsImxhYmVscyIsInNsaWNlIiwic2VyaWVzIiwib3B0aW9ucyIsInNlcmllc0RpY3QiLCJpZHgiLCJsZW5ndGgiLCJzZXJpZXNOYW1lIiwib3B0aW9uc0ZvclNlcmllcyIsInlBeGlzIiwicHVzaCIsImF4aXNfb3B0cyIsInV0aWxzIiwidXBkYXRlIiwicHJvY2VzcyIsImVudiIsIk5PREVfRU5WIiwidmFsaWRhdGVPcHRpb25zXyIsIm5hbWUiLCJyZXN1bHQiLCJnZXRHbG9iYWxVc2VyXyIsImdldEdsb2JhbERlZmF1bHRfIiwiREVGQVVMVF9BVFRSUyIsImdldEZvckF4aXMiLCJheGlzSWR4IiwiYXhpc1N0cmluZyIsInVzZXJBeGlzIiwiYXhpc09wdGlvbnMiLCJkZWZhdWx0QXhpc09wdGlvbnMiLCJheGVzIiwiZ2V0Rm9yU2VyaWVzIiwiZ2V0SGlnaGxpZ2h0U2VyaWVzIiwic2VyaWVzT2JqIiwic2VyaWVzT3B0aW9ucyIsIm51bUF4ZXMiLCJheGlzRm9yU2VyaWVzIiwic2VyaWVzRm9yQXhpcyIsInNlcmllc05hbWVzIiwiT1BUSU9OU19SRUZFUkVOQ0UiLCJ0aGF0IiwidmFsaWRhdGVPcHRpb24iLCJvcHRpb25OYW1lIiwid2FybkludmFsaWRPcHRpb25fIiwib3B0aW9uc0RpY3RzIiwibmFtZXMiLCJpIiwiZGljdCIsIldBUk5JTkdTIiwiaXNTZXJpZXMiLCJpbmRleE9mIiwiY29uc29sZSIsIndhcm4iLCJyZXNldFdhcm5pbmdzXyJdLCJzb3VyY2VzIjpbIi4uL3NyYy9keWdyYXBoLW9wdGlvbnMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMTEgRGFuIFZhbmRlcmthbSAoZGFudmRrQGdtYWlsLmNvbSlcbiAqIE1JVC1saWNlbmNlZDogaHR0cHM6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgRHlncmFwaE9wdGlvbnMgaXMgcmVzcG9uc2libGUgZm9yIHBhcnNpbmcgYW5kIHJldHVybmluZ1xuICogaW5mb3JtYXRpb24gYWJvdXQgb3B0aW9ucy5cbiAqL1xuXG4vLyBUT0RPOiByZW1vdmUgdGhpcyBqc2hpbnQgZGlyZWN0aXZlICYgZml4IHRoZSB3YXJuaW5ncy5cbi8qanNoaW50IHN1Yjp0cnVlICovXG5cInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi9keWdyYXBoLXV0aWxzJztcbmltcG9ydCBERUZBVUxUX0FUVFJTIGZyb20gJy4vZHlncmFwaC1kZWZhdWx0LWF0dHJzJztcbmltcG9ydCBPUFRJT05TX1JFRkVSRU5DRSBmcm9tICcuL2R5Z3JhcGgtb3B0aW9ucy1yZWZlcmVuY2UnO1xuXG4vKlxuICogSW50ZXJlc3RpbmcgbWVtYmVyIHZhcmlhYmxlczogKFJFTU9WSU5HIFRISVMgTElTVCBBUyBJIENMT1NVUklaRSlcbiAqIGdsb2JhbF8gLSBnbG9iYWwgYXR0cmlidXRlcyAoY29tbW9uIGFtb25nIGFsbCBncmFwaHMsIEFJVUkpXG4gKiB1c2VyIC0gYXR0cmlidXRlcyBzZXQgYnkgdGhlIHVzZXJcbiAqIHNlcmllc18gLSB7IHNlcmllc05hbWUgLT4geyBpZHgsIHlBeGlzLCBvcHRpb25zIH19XG4gKi9cblxuLyoqXG4gKiBUaGlzIHBhcnNlcyBhdHRyaWJ1dGVzIGludG8gYW4gb2JqZWN0IHRoYXQgY2FuIGJlIGVhc2lseSBxdWVyaWVkLlxuICpcbiAqIEl0IGRvZXNuJ3QgbmVjZXNzYXJpbHkgbWVhbiB0aGF0IGFsbCBvcHRpb25zIGFyZSBhdmFpbGFibGUsIHNwZWNpZmljYWxseVxuICogaWYgbGFiZWxzIGFyZSBub3QgeWV0IGF2YWlsYWJsZSwgc2luY2UgdGhvc2UgZHJpdmUgZGV0YWlscyBvZiB0aGUgcGVyLXNlcmllc1xuICogYW5kIHBlci1heGlzIG9wdGlvbnMuXG4gKlxuICogQHBhcmFtIHtEeWdyYXBofSBkeWdyYXBoIFRoZSBjaGFydCB0byB3aGljaCB0aGVzZSBvcHRpb25zIGJlbG9uZy5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG52YXIgRHlncmFwaE9wdGlvbnMgPSBmdW5jdGlvbihkeWdyYXBoKSB7XG4gIC8qKlxuICAgKiBUaGUgZHlncmFwaC5cbiAgICogQHR5cGUgeyFEeWdyYXBofVxuICAgKi9cbiAgdGhpcy5keWdyYXBoXyA9IGR5Z3JhcGg7XG5cbiAgLyoqXG4gICAqIEFycmF5IG9mIGF4aXMgaW5kZXggdG8geyBzZXJpZXMgOiBbIHNlcmllcyBuYW1lcyBdICwgb3B0aW9ucyA6IHsgYXhpcy1zcGVjaWZpYyBvcHRpb25zLiB9IH1cbiAgICogQHR5cGUge0FycmF5Ljx7c2VyaWVzIDogQXJyYXkuPHN0cmluZz4sIG9wdGlvbnMgOiBPYmplY3R9Pn0gQHByaXZhdGVcbiAgICovXG4gIHRoaXMueUF4ZXNfID0gW107XG5cbiAgLyoqXG4gICAqIENvbnRhaW5zIHgtYXhpcyBzcGVjaWZpYyBvcHRpb25zLCB3aGljaCBhcmUgc3RvcmVkIGluIHRoZSBvcHRpb25zIGtleS5cbiAgICogVGhpcyBtYXRjaGVzIHRoZSB5QXhlc18gb2JqZWN0IHN0cnVjdHVyZSAoYnkgYmVpbmcgYSBkaWN0aW9uYXJ5IHdpdGggYW5cbiAgICogb3B0aW9ucyBlbGVtZW50KSBhbGxvd2luZyBmb3Igc2hhcmVkIGNvZGUuXG4gICAqIEB0eXBlIHtvcHRpb25zOiBPYmplY3R9IEBwcml2YXRlXG4gICAqL1xuICB0aGlzLnhBeGlzXyA9IHt9O1xuICB0aGlzLnNlcmllc18gPSB7fTtcblxuICAvLyBPbmNlIHRoZXNlIHR3byBvYmplY3RzIGFyZSBpbml0aWFsaXplZCwgeW91IGNhbiBjYWxsIGdldCgpO1xuICB0aGlzLmdsb2JhbF8gPSB0aGlzLmR5Z3JhcGhfLmF0dHJzXztcbiAgdGhpcy51c2VyXyA9IHRoaXMuZHlncmFwaF8udXNlcl9hdHRyc18gfHwge307XG5cbiAgLyoqXG4gICAqIEEgbGlzdCBvZiBzZXJpZXMgaW4gY29sdW1uYXIgb3JkZXIuXG4gICAqIEB0eXBlIHtBcnJheS48c3RyaW5nPn1cbiAgICovXG4gIHRoaXMubGFiZWxzXyA9IFtdO1xuXG4gIHRoaXMuaGlnaGxpZ2h0U2VyaWVzXyA9IHRoaXMuZ2V0KFwiaGlnaGxpZ2h0U2VyaWVzT3B0c1wiKSB8fCB7fTtcbiAgdGhpcy5yZXBhcnNlU2VyaWVzKCk7XG59O1xuXG4vKipcbiAqIE5vdCBvcHRpbWFsLCBidXQgZG9lcyB0aGUgdHJpY2sgd2hlbiB5b3UncmUgb25seSB1c2luZyB0d28gYXhlcy5cbiAqIElmIHdlIG1vdmUgdG8gbW9yZSBheGVzLCB0aGlzIGNhbiBqdXN0IGJlY29tZSBhIGZ1bmN0aW9uLlxuICpcbiAqIEB0eXBlIHtPYmplY3QuPG51bWJlcj59XG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoT3B0aW9ucy5BWElTX1NUUklOR19NQVBQSU5HU18gPSB7XG4gICd5JyA6IDAsXG4gICdZJyA6IDAsXG4gICd5MScgOiAwLFxuICAnWTEnIDogMCxcbiAgJ3kyJyA6IDEsXG4gICdZMicgOiAxXG59O1xuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gYXhpc1xuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaE9wdGlvbnMuYXhpc1RvSW5kZXhfID0gZnVuY3Rpb24oYXhpcykge1xuICBpZiAodHlwZW9mKGF4aXMpID09IFwic3RyaW5nXCIpIHtcbiAgICBpZiAoRHlncmFwaE9wdGlvbnMuQVhJU19TVFJJTkdfTUFQUElOR1NfLmhhc093blByb3BlcnR5KGF4aXMpKSB7XG4gICAgICByZXR1cm4gRHlncmFwaE9wdGlvbnMuQVhJU19TVFJJTkdfTUFQUElOR1NfW2F4aXNdO1xuICAgIH1cbiAgICB0aHJvdyBcIlVua25vd24gYXhpcyA6IFwiICsgYXhpcztcbiAgfVxuICBpZiAodHlwZW9mKGF4aXMpID09IFwibnVtYmVyXCIpIHtcbiAgICBpZiAoYXhpcyA9PT0gMCB8fCBheGlzID09PSAxKSB7XG4gICAgICByZXR1cm4gYXhpcztcbiAgICB9XG4gICAgdGhyb3cgXCJEeWdyYXBocyBvbmx5IHN1cHBvcnRzIHR3byB5LWF4ZXMsIGluZGV4ZWQgZnJvbSAwLTEuXCI7XG4gIH1cbiAgaWYgKGF4aXMpIHtcbiAgICB0aHJvdyBcIlVua25vd24gYXhpcyA6IFwiICsgYXhpcztcbiAgfVxuICAvLyBObyBheGlzIHNwZWNpZmljYXRpb24gbWVhbnMgYXhpcyAwLlxuICByZXR1cm4gMDtcbn07XG5cbi8qKlxuICogUmVwYXJzZXMgb3B0aW9ucyB0aGF0IGFyZSBhbGwgcmVsYXRlZCB0byBzZXJpZXMuIFRoaXMgdHlwaWNhbGx5IG9jY3VycyB3aGVuXG4gKiBvcHRpb25zIGFyZSBlaXRoZXIgdXBkYXRlZCwgb3Igc291cmNlIGRhdGEgaGFzIGJlZW4gbWFkZSBhdmFpbGFibGUuXG4gKlxuICogVE9ETyhrb25pZ3NiZXJnKTogVGhlIG1ldGhvZCBuYW1lIGlzIGtpbmQgb2Ygd2VhazsgZml4LlxuICovXG5EeWdyYXBoT3B0aW9ucy5wcm90b3R5cGUucmVwYXJzZVNlcmllcyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbGFiZWxzID0gdGhpcy5nZXQoXCJsYWJlbHNcIik7XG4gIGlmICghbGFiZWxzKSB7XG4gICAgcmV0dXJuOyAvLyAtLSBjYW4ndCBkbyBtb3JlIGZvciBub3csIHdpbGwgcGFyc2UgYWZ0ZXIgZ2V0dGluZyB0aGUgbGFiZWxzLlxuICB9XG5cbiAgdGhpcy5sYWJlbHNfID0gbGFiZWxzLnNsaWNlKDEpO1xuXG4gIHRoaXMueUF4ZXNfID0gWyB7IHNlcmllcyA6IFtdLCBvcHRpb25zIDoge319IF07IC8vIEFsd2F5cyBvbmUgYXhpcyBhdCBsZWFzdC5cbiAgdGhpcy54QXhpc18gPSB7IG9wdGlvbnMgOiB7fSB9O1xuICB0aGlzLnNlcmllc18gPSB7fTtcblxuICAvLyBTZXJpZXMgYXJlIHNwZWNpZmllZCBpbiB0aGUgc2VyaWVzIGVsZW1lbnQ6XG4gIC8vXG4gIC8vIHtcbiAgLy8gICBsYWJlbHM6IFsgXCJYXCIsIFwiZm9vXCIsIFwiYmFyXCIgXSxcbiAgLy8gICBwb2ludFNpemU6IDMsXG4gIC8vICAgc2VyaWVzIDoge1xuICAvLyAgICAgZm9vIDoge30sIC8vIG9wdGlvbnMgZm9yIGZvb1xuICAvLyAgICAgYmFyIDoge30gLy8gb3B0aW9ucyBmb3IgYmFyXG4gIC8vICAgfVxuICAvLyB9XG4gIC8vXG4gIC8vIFNvLCBpZiBzZXJpZXMgaXMgZm91bmQsIGl0J3MgZXhwZWN0ZWQgdG8gY29udGFpbiBwZXItc2VyaWVzIGRhdGEsXG4gIC8vIG90aGVyd2lzZSBzZXQgYSBkZWZhdWx0LlxuICB2YXIgc2VyaWVzRGljdCA9IHRoaXMudXNlcl8uc2VyaWVzIHx8IHt9O1xuICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCB0aGlzLmxhYmVsc18ubGVuZ3RoOyBpZHgrKykge1xuICAgIHZhciBzZXJpZXNOYW1lID0gdGhpcy5sYWJlbHNfW2lkeF07XG4gICAgdmFyIG9wdGlvbnNGb3JTZXJpZXMgPSBzZXJpZXNEaWN0W3Nlcmllc05hbWVdIHx8IHt9O1xuICAgIHZhciB5QXhpcyA9IER5Z3JhcGhPcHRpb25zLmF4aXNUb0luZGV4XyhvcHRpb25zRm9yU2VyaWVzW1wiYXhpc1wiXSk7XG5cbiAgICB0aGlzLnNlcmllc19bc2VyaWVzTmFtZV0gPSB7XG4gICAgICBpZHg6IGlkeCxcbiAgICAgIHlBeGlzOiB5QXhpcyxcbiAgICAgIG9wdGlvbnMgOiBvcHRpb25zRm9yU2VyaWVzIH07XG5cbiAgICBpZiAoIXRoaXMueUF4ZXNfW3lBeGlzXSkge1xuICAgICAgdGhpcy55QXhlc19beUF4aXNdID0gIHsgc2VyaWVzIDogWyBzZXJpZXNOYW1lIF0sIG9wdGlvbnMgOiB7fSB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnlBeGVzX1t5QXhpc10uc2VyaWVzLnB1c2goc2VyaWVzTmFtZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGF4aXNfb3B0cyA9IHRoaXMudXNlcl9bXCJheGVzXCJdIHx8IHt9O1xuICB1dGlscy51cGRhdGUodGhpcy55QXhlc19bMF0ub3B0aW9ucywgYXhpc19vcHRzW1wieVwiXSB8fCB7fSk7XG4gIGlmICh0aGlzLnlBeGVzXy5sZW5ndGggPiAxKSB7XG4gICAgdXRpbHMudXBkYXRlKHRoaXMueUF4ZXNfWzFdLm9wdGlvbnMsIGF4aXNfb3B0c1tcInkyXCJdIHx8IHt9KTtcbiAgfVxuICB1dGlscy51cGRhdGUodGhpcy54QXhpc18ub3B0aW9ucywgYXhpc19vcHRzW1wieFwiXSB8fCB7fSk7XG5cbiAgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBwcm9jZXNzLmVudi5OT0RFX0VOViAhPSAncHJvZHVjdGlvbicpIHtcbiAgLy8gRm9yIFwicHJvZHVjdGlvblwiIGNvZGUsIHRoaXMgZ2V0cyByZW1vdmVkIGJ5IHVnbGlmeWpzLlxuICAgIHRoaXMudmFsaWRhdGVPcHRpb25zXygpO1xuICB9XG59O1xuXG4vKipcbiAqIEdldCBhIGdsb2JhbCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSB0aGUgbmFtZSBvZiB0aGUgb3B0aW9uLlxuICovXG5EeWdyYXBoT3B0aW9ucy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICB2YXIgcmVzdWx0ID0gdGhpcy5nZXRHbG9iYWxVc2VyXyhuYW1lKTtcbiAgaWYgKHJlc3VsdCAhPT0gbnVsbCkge1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgcmV0dXJuIHRoaXMuZ2V0R2xvYmFsRGVmYXVsdF8obmFtZSk7XG59O1xuXG5EeWdyYXBoT3B0aW9ucy5wcm90b3R5cGUuZ2V0R2xvYmFsVXNlcl8gPSBmdW5jdGlvbihuYW1lKSB7XG4gIGlmICh0aGlzLnVzZXJfLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgcmV0dXJuIHRoaXMudXNlcl9bbmFtZV07XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuXG5EeWdyYXBoT3B0aW9ucy5wcm90b3R5cGUuZ2V0R2xvYmFsRGVmYXVsdF8gPSBmdW5jdGlvbihuYW1lKSB7XG4gIGlmICh0aGlzLmdsb2JhbF8uaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICByZXR1cm4gdGhpcy5nbG9iYWxfW25hbWVdO1xuICB9XG4gIGlmIChERUZBVUxUX0FUVFJTLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgcmV0dXJuIERFRkFVTFRfQVRUUlNbbmFtZV07XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuXG4vKipcbiAqIEdldCBhIHZhbHVlIGZvciBhIHNwZWNpZmljIGF4aXMuIElmIHRoZXJlIGlzIG5vIHNwZWNpZmljIHZhbHVlIGZvciB0aGUgYXhpcyxcbiAqIHRoZSBnbG9iYWwgdmFsdWUgaXMgcmV0dXJuZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgdGhlIG5hbWUgb2YgdGhlIG9wdGlvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gYXhpcyB0aGUgYXhpcyB0byBzZWFyY2guIENhbiBiZSB0aGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uXG4gKiAoXCJ5XCIsIFwieTJcIikgb3IgdGhlIGF4aXMgbnVtYmVyICgwLCAxKS5cbiAqL1xuRHlncmFwaE9wdGlvbnMucHJvdG90eXBlLmdldEZvckF4aXMgPSBmdW5jdGlvbihuYW1lLCBheGlzKSB7XG4gIHZhciBheGlzSWR4O1xuICB2YXIgYXhpc1N0cmluZztcblxuICAvLyBTaW5jZSBheGlzIGNhbiBiZSBhIG51bWJlciBvciBhIHN0cmluZywgc3RyYWlnaHRlbiBldmVyeXRoaW5nIG91dCBoZXJlLlxuICBpZiAodHlwZW9mKGF4aXMpID09ICdudW1iZXInKSB7XG4gICAgYXhpc0lkeCA9IGF4aXM7XG4gICAgYXhpc1N0cmluZyA9IGF4aXNJZHggPT09IDAgPyBcInlcIiA6IFwieTJcIjtcbiAgfSBlbHNlIHtcbiAgICBpZiAoYXhpcyA9PSBcInkxXCIpIHsgYXhpcyA9IFwieVwiOyB9IC8vIFN0YW5kYXJkaXplIG9uICd5Jy4gSXMgdGhpcyBiYWQ/IEkgdGhpbmsgc28uXG4gICAgaWYgKGF4aXMgPT0gXCJ5XCIpIHtcbiAgICAgIGF4aXNJZHggPSAwO1xuICAgIH0gZWxzZSBpZiAoYXhpcyA9PSBcInkyXCIpIHtcbiAgICAgIGF4aXNJZHggPSAxO1xuICAgIH0gZWxzZSBpZiAoYXhpcyA9PSBcInhcIikge1xuICAgICAgYXhpc0lkeCA9IC0xOyAvLyBzaW1wbHkgYSBwbGFjZWhvbGRlciBmb3IgYmVsb3cuXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IFwiVW5rbm93biBheGlzIFwiICsgYXhpcztcbiAgICB9XG4gICAgYXhpc1N0cmluZyA9IGF4aXM7XG4gIH1cblxuICB2YXIgdXNlckF4aXMgPSAoYXhpc0lkeCA9PSAtMSkgPyB0aGlzLnhBeGlzXyA6IHRoaXMueUF4ZXNfW2F4aXNJZHhdO1xuXG4gIC8vIFNlYXJjaCB0aGUgdXNlci1zcGVjaWZpZWQgYXhpcyBvcHRpb24gZmlyc3QuXG4gIGlmICh1c2VyQXhpcykgeyAvLyBUaGlzIGNvbmRpdGlvbiBjb3VsZCBiZSByZW1vdmVkIGlmIHdlIGFsd2F5cyBzZXQgdXAgdGhpcy55QXhlc18gZm9yIHkyLlxuICAgIHZhciBheGlzT3B0aW9ucyA9IHVzZXJBeGlzLm9wdGlvbnM7XG4gICAgaWYgKGF4aXNPcHRpb25zLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICByZXR1cm4gYXhpc09wdGlvbnNbbmFtZV07XG4gICAgfVxuICB9XG5cbiAgLy8gVXNlci1zcGVjaWZpZWQgZ2xvYmFsIG9wdGlvbnMgc2Vjb25kLlxuICAvLyBCdXQsIGhhY2ssIGlnbm9yZSBnbG9iYWxseS1zcGVjaWZpZWQgJ2xvZ3NjYWxlJyBmb3IgJ3gnIGF4aXMgZGVjbGFyYXRpb24uXG4gIGlmICghKGF4aXMgPT09ICd4JyAmJiBuYW1lID09PSAnbG9nc2NhbGUnKSkge1xuICAgIHZhciByZXN1bHQgPSB0aGlzLmdldEdsb2JhbFVzZXJfKG5hbWUpO1xuICAgIGlmIChyZXN1bHQgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9XG4gIC8vIERlZmF1bHQgYXhpcyBvcHRpb25zIHRoaXJkLlxuICB2YXIgZGVmYXVsdEF4aXNPcHRpb25zID0gREVGQVVMVF9BVFRSUy5heGVzW2F4aXNTdHJpbmddO1xuICBpZiAoZGVmYXVsdEF4aXNPcHRpb25zLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRBeGlzT3B0aW9uc1tuYW1lXTtcbiAgfVxuXG4gIC8vIERlZmF1bHQgZ2xvYmFsIG9wdGlvbnMgbGFzdC5cbiAgcmV0dXJuIHRoaXMuZ2V0R2xvYmFsRGVmYXVsdF8obmFtZSk7XG59O1xuXG4vKipcbiAqIEdldCBhIHZhbHVlIGZvciBhIHNwZWNpZmljIHNlcmllcy4gSWYgdGhlcmUgaXMgbm8gc3BlY2lmaWMgdmFsdWUgZm9yIHRoZSBzZXJpZXMsXG4gKiB0aGUgdmFsdWUgZm9yIHRoZSBheGlzIGlzIHJldHVybmVkIChhbmQgYWZ0ZXJ3YXJkcywgdGhlIGdsb2JhbCB2YWx1ZS4pXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgdGhlIG5hbWUgb2YgdGhlIG9wdGlvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSBzZXJpZXMgdGhlIHNlcmllcyB0byBzZWFyY2guXG4gKi9cbkR5Z3JhcGhPcHRpb25zLnByb3RvdHlwZS5nZXRGb3JTZXJpZXMgPSBmdW5jdGlvbihuYW1lLCBzZXJpZXMpIHtcbiAgLy8gSG9ub3JzIGluZGV4ZXMgYXMgc2VyaWVzLlxuICBpZiAoc2VyaWVzID09PSB0aGlzLmR5Z3JhcGhfLmdldEhpZ2hsaWdodFNlcmllcygpKSB7XG4gICAgaWYgKHRoaXMuaGlnaGxpZ2h0U2VyaWVzXy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgcmV0dXJuIHRoaXMuaGlnaGxpZ2h0U2VyaWVzX1tuYW1lXTtcbiAgICB9XG4gIH1cblxuICBpZiAoIXRoaXMuc2VyaWVzXy5oYXNPd25Qcm9wZXJ0eShzZXJpZXMpKSB7XG4gICAgdGhyb3cgXCJVbmtub3duIHNlcmllczogXCIgKyBzZXJpZXM7XG4gIH1cblxuICB2YXIgc2VyaWVzT2JqID0gdGhpcy5zZXJpZXNfW3Nlcmllc107XG4gIHZhciBzZXJpZXNPcHRpb25zID0gc2VyaWVzT2JqW1wib3B0aW9uc1wiXTtcbiAgaWYgKHNlcmllc09wdGlvbnMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICByZXR1cm4gc2VyaWVzT3B0aW9uc1tuYW1lXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmdldEZvckF4aXMobmFtZSwgc2VyaWVzT2JqW1wieUF4aXNcIl0pO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgeS1heGVzIG9uIHRoZSBjaGFydC5cbiAqIEByZXR1cm4ge251bWJlcn0gdGhlIG51bWJlciBvZiBheGVzLlxuICovXG5EeWdyYXBoT3B0aW9ucy5wcm90b3R5cGUubnVtQXhlcyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy55QXhlc18ubGVuZ3RoO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIHktYXhpcyBmb3IgYSBnaXZlbiBzZXJpZXMsIHNwZWNpZmllZCBieSBuYW1lLlxuICovXG5EeWdyYXBoT3B0aW9ucy5wcm90b3R5cGUuYXhpc0ZvclNlcmllcyA9IGZ1bmN0aW9uKHNlcmllcykge1xuICByZXR1cm4gdGhpcy5zZXJpZXNfW3Nlcmllc10ueUF4aXM7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG9wdGlvbnMgZm9yIHRoZSBzcGVjaWZpZWQgYXhpcy5cbiAqL1xuLy8gVE9ETyhrb25pZ3NiZXJnKTogdGhpcyBpcyB5LWF4aXMgc3BlY2lmaWMuIFN1cHBvcnQgdGhlIHggYXhpcy5cbkR5Z3JhcGhPcHRpb25zLnByb3RvdHlwZS5heGlzT3B0aW9ucyA9IGZ1bmN0aW9uKHlBeGlzKSB7XG4gIHJldHVybiB0aGlzLnlBeGVzX1t5QXhpc10ub3B0aW9ucztcbn07XG5cbi8qKlxuICogUmV0dXJuIHRoZSBzZXJpZXMgYXNzb2NpYXRlZCB3aXRoIGFuIGF4aXMuXG4gKi9cbkR5Z3JhcGhPcHRpb25zLnByb3RvdHlwZS5zZXJpZXNGb3JBeGlzID0gZnVuY3Rpb24oeUF4aXMpIHtcbiAgcmV0dXJuIHRoaXMueUF4ZXNfW3lBeGlzXS5zZXJpZXM7XG59O1xuXG4vKipcbiAqIFJldHVybiB0aGUgbGlzdCBvZiBhbGwgc2VyaWVzLCBpbiB0aGVpciBjb2x1bW5hciBvcmRlci5cbiAqL1xuRHlncmFwaE9wdGlvbnMucHJvdG90eXBlLnNlcmllc05hbWVzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmxhYmVsc187XG59O1xuXG5pZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9ICdwcm9kdWN0aW9uJykge1xuLy8gRm9yIFwicHJvZHVjdGlvblwiIGNvZGUsIHRoaXMgZ2V0cyByZW1vdmVkIGJ5IHVnbGlmeWpzLlxuXG4vKipcbiAqIFZhbGlkYXRlIGFsbCBvcHRpb25zLlxuICogVGhpcyByZXF1aXJlcyBPUFRJT05TX1JFRkVSRU5DRSwgd2hpY2ggaXMgb25seSBhdmFpbGFibGUgaW4gZGVidWcgYnVpbGRzLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaE9wdGlvbnMucHJvdG90eXBlLnZhbGlkYXRlT3B0aW9uc18gPSBmdW5jdGlvbigpIHtcbiAgaWYgKHR5cGVvZiBPUFRJT05TX1JFRkVSRU5DRSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB0aHJvdyAnQ2FsbGVkIHZhbGlkYXRlT3B0aW9uc18gaW4gcHJvZCBidWlsZC4nO1xuICB9XG5cbiAgdmFyIHRoYXQgPSB0aGlzO1xuICB2YXIgdmFsaWRhdGVPcHRpb24gPSBmdW5jdGlvbihvcHRpb25OYW1lKSB7XG4gICAgaWYgKCFPUFRJT05TX1JFRkVSRU5DRVtvcHRpb25OYW1lXSkge1xuICAgICAgdGhhdC53YXJuSW52YWxpZE9wdGlvbl8ob3B0aW9uTmFtZSk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBvcHRpb25zRGljdHMgPSBbdGhpcy54QXhpc18ub3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLnlBeGVzX1swXS5vcHRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMueUF4ZXNfWzFdICYmIHRoaXMueUF4ZXNfWzFdLm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5nbG9iYWxfLFxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMudXNlcl8sXG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRTZXJpZXNfXTtcbiAgdmFyIG5hbWVzID0gdGhpcy5zZXJpZXNOYW1lcygpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIG5hbWUgPSBuYW1lc1tpXTtcbiAgICBpZiAodGhpcy5zZXJpZXNfLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICBvcHRpb25zRGljdHMucHVzaCh0aGlzLnNlcmllc19bbmFtZV0ub3B0aW9ucyk7XG4gICAgfVxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgb3B0aW9uc0RpY3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGRpY3QgPSBvcHRpb25zRGljdHNbaV07XG4gICAgaWYgKCFkaWN0KSBjb250aW51ZTtcbiAgICBmb3IgKHZhciBvcHRpb25OYW1lIGluIGRpY3QpIHtcbiAgICAgIGlmIChkaWN0Lmhhc093blByb3BlcnR5KG9wdGlvbk5hbWUpKSB7XG4gICAgICAgIHZhbGlkYXRlT3B0aW9uKG9wdGlvbk5hbWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxudmFyIFdBUk5JTkdTID0ge307ICAvLyBPbmx5IHNob3cgYW55IHBhcnRpY3VsYXIgd2FybmluZyBvbmNlLlxuXG4vKipcbiAqIExvZ3MgYSB3YXJuaW5nIGFib3V0IGludmFsaWQgb3B0aW9ucy5cbiAqIFRPRE86IG1ha2UgdGhpcyB0aHJvdyBmb3IgdGVzdGluZ1xuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaE9wdGlvbnMucHJvdG90eXBlLndhcm5JbnZhbGlkT3B0aW9uXyA9IGZ1bmN0aW9uKG9wdGlvbk5hbWUpIHtcbiAgaWYgKCFXQVJOSU5HU1tvcHRpb25OYW1lXSkge1xuICAgIFdBUk5JTkdTW29wdGlvbk5hbWVdID0gdHJ1ZTtcbiAgICB2YXIgaXNTZXJpZXMgPSAodGhpcy5sYWJlbHNfLmluZGV4T2Yob3B0aW9uTmFtZSkgPj0gMCk7XG4gICAgaWYgKGlzU2VyaWVzKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1VzZSBuZXctc3R5bGUgcGVyLXNlcmllcyBvcHRpb25zIChzYXcgJyArIG9wdGlvbk5hbWUgKyAnIGFzIHRvcC1sZXZlbCBvcHRpb25zIGtleSkuIFNlZSBodHRwOi8vYmxvZy5keWdyYXBocy5jb20vMjAxMi8xMi90aGUtbmV3LWFuZC1iZXR0ZXItd2F5LXRvLXNwZWNpZnkuaHRtbCAoVGhlIE5ldyBhbmQgQmV0dGVyIFdheSB0byBTcGVjaWZ5IFNlcmllcyBhbmQgQXhpcyBPcHRpb25zKS4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKCdVbmtub3duIG9wdGlvbiAnICsgb3B0aW9uTmFtZSArICcgKHNlZSBodHRwczovL2R5Z3JhcGhzLmNvbS9vcHRpb25zLmh0bWwgZm9yIHRoZSBmdWxsIGxpc3Qgb2Ygb3B0aW9ucyknKTtcbiAgICB9XG4gICAgdGhyb3cgXCJpbnZhbGlkIG9wdGlvbiBcIiArIG9wdGlvbk5hbWU7XG4gIH1cbn07XG5cbi8vIFJlc2V0IGxpc3Qgb2YgcHJldmlvdXNseS1zaG93biB3YXJuaW5ncy4gVXNlZCBmb3IgdGVzdGluZy5cbkR5Z3JhcGhPcHRpb25zLnJlc2V0V2FybmluZ3NfID0gZnVuY3Rpb24oKSB7XG4gIFdBUk5JTkdTID0ge307XG59O1xuXG59XG5cbmV4cG9ydCBkZWZhdWx0IER5Z3JhcGhPcHRpb25zO1xuIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxZQUFZOztBQUFDO0VBQUE7QUFBQTtBQUFBO0FBRWI7QUFDQTtBQUNBO0FBQTREO0FBQUE7QUFBQTtBQUU1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJQSxjQUFjLEdBQUcsU0FBakJBLGNBQWMsQ0FBWUMsT0FBTyxFQUFFO0VBQ3JDO0FBQ0Y7QUFDQTtBQUNBO0VBQ0UsSUFBSSxDQUFDQyxRQUFRLEdBQUdELE9BQU87O0VBRXZCO0FBQ0Y7QUFDQTtBQUNBO0VBQ0UsSUFBSSxDQUFDRSxNQUFNLEdBQUcsRUFBRTs7RUFFaEI7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UsSUFBSSxDQUFDQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0VBQ2hCLElBQUksQ0FBQ0MsT0FBTyxHQUFHLENBQUMsQ0FBQzs7RUFFakI7RUFDQSxJQUFJLENBQUNDLE9BQU8sR0FBRyxJQUFJLENBQUNKLFFBQVEsQ0FBQ0ssTUFBTTtFQUNuQyxJQUFJLENBQUNDLEtBQUssR0FBRyxJQUFJLENBQUNOLFFBQVEsQ0FBQ08sV0FBVyxJQUFJLENBQUMsQ0FBQzs7RUFFNUM7QUFDRjtBQUNBO0FBQ0E7RUFDRSxJQUFJLENBQUNDLE9BQU8sR0FBRyxFQUFFO0VBRWpCLElBQUksQ0FBQ0MsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDQyxHQUFHLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDN0QsSUFBSSxDQUFDQyxhQUFhLEVBQUU7QUFDdEIsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBYixjQUFjLENBQUNjLHFCQUFx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