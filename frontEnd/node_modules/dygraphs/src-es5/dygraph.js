"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _dygraphLayout = _interopRequireDefault(require("./dygraph-layout"));
var _dygraphCanvas = _interopRequireDefault(require("./dygraph-canvas"));
var _dygraphOptions = _interopRequireDefault(require("./dygraph-options"));
var _dygraphInteractionModel = _interopRequireDefault(require("./dygraph-interaction-model"));
var DygraphTickers = _interopRequireWildcard(require("./dygraph-tickers"));
var utils = _interopRequireWildcard(require("./dygraph-utils"));
var _dygraphDefaultAttrs = _interopRequireDefault(require("./dygraph-default-attrs"));
var _dygraphOptionsReference = _interopRequireDefault(require("./dygraph-options-reference"));
var _iframeTarp = _interopRequireDefault(require("./iframe-tarp"));
var _default2 = _interopRequireDefault(require("./datahandler/default"));
var _barsError = _interopRequireDefault(require("./datahandler/bars-error"));
var _barsCustom = _interopRequireDefault(require("./datahandler/bars-custom"));
var _defaultFractions = _interopRequireDefault(require("./datahandler/default-fractions"));
var _barsFractions = _interopRequireDefault(require("./datahandler/bars-fractions"));
var _bars = _interopRequireDefault(require("./datahandler/bars"));
var _annotations = _interopRequireDefault(require("./plugins/annotations"));
var _axes = _interopRequireDefault(require("./plugins/axes"));
var _chartLabels = _interopRequireDefault(require("./plugins/chart-labels"));
var _grid = _interopRequireDefault(require("./plugins/grid"));
var _legend = _interopRequireDefault(require("./plugins/legend"));
var _rangeSelector = _interopRequireDefault(require("./plugins/range-selector"));
var _dygraphGviz = _interopRequireDefault(require("./dygraph-gviz"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
"use strict";

/**
 * @class Creates an interactive, zoomable chart.
 * @name Dygraph
 *
 * @constructor
 * @param {div | String} div A div or the id of a div into which to construct
 * the chart. Must not have any padding.
 * @param {String | Function} file A file containing CSV data or a function
 * that returns this data. The most basic expected format for each line is
 * "YYYY/MM/DD,val1,val2,...". For more information, see
 * http://dygraphs.com/data.html.
 * @param {Object} attrs Various other attributes, e.g. errorBars determines
 * whether the input data contains error ranges. For a complete list of
 * options, see http://dygraphs.com/options.html.
 */
var Dygraph = function Dygraph(div, data, opts) {
  this.__init__(div, data, opts);
};
Dygraph.NAME = "Dygraph";
Dygraph.VERSION = "2.2.1";

// internal autoloader workaround
var _addrequire = {};
Dygraph._require = function require(what) {
  return what in _addrequire ? _addrequire[what] : Dygraph._require._b(what);
};
Dygraph._require._b = null; // set by xfrmmodmap-dy.js
Dygraph._require.add = function add(what, towhat) {
  _addrequire[what] = towhat;
};

// Various default values
Dygraph.DEFAULT_ROLL_PERIOD = 1;
Dygraph.DEFAULT_WIDTH = 480;
Dygraph.DEFAULT_HEIGHT = 320;

// For max 60 Hz. animation:
Dygraph.ANIMATION_STEPS = 12;
Dygraph.ANIMATION_DURATION = 200;

/**
 * Standard plotters. These may be used by clients.
 * Available plotters are:
 * - Dygraph.Plotters.linePlotter: draws central lines (most common)
 * - Dygraph.Plotters.errorPlotter: draws high/low bands
 * - Dygraph.Plotters.fillPlotter: draws fills under lines (used with fillGraph)
 *
 * By default, the plotter is [fillPlotter, errorPlotter, linePlotter].
 * This causes all the lines to be drawn over all the fills/bands.
 */
Dygraph.Plotters = _dygraphCanvas["default"]._Plotters;

// Used for initializing annotation CSS rules only once.
Dygraph.addedAnnotationCSS = false;

/**
 * Initializes the Dygraph. This creates a new DIV and constructs the PlotKit
 * and context &lt;canvas&gt; inside of it. See the constructor for details.
 * on the parameters.
 * @param {Element} div the Element to render the graph into.
 * @param {string | Function} file Source data
 * @param {Object} attrs Miscellaneous other options
 * @private
 */
Dygraph.prototype.__init__ = function (div, file, attrs) {
  this.is_initial_draw_ = true;
  this.readyFns_ = [];

  // Support two-argument constructor
  if (attrs === null || attrs === undefined) {
    attrs = {};
  }
  attrs = Dygraph.copyUserAttrs_(attrs);
  if (typeof div == 'string') {
    div = document.getElementById(div);
  }
  if (!div) {
    throw new Error('Constructing dygraph with a non-existent div!');
  }

  // Copy the important bits into the object
  // TODO(danvk): most of these should just stay in the attrs_ dictionary.
  this.maindiv_ = div;
  this.file_ = file;
  this.rollPeriod_ = attrs.rollPeriod || Dygraph.DEFAULT_ROLL_PERIOD;
  this.previousVerticalX_ = -1;
  this.fractions_ = attrs.fractions || false;
  this.dateWindow_ = attrs.dateWindow || null;
  this.annotations_ = [];

  // Clear the div. This ensure that, if multiple dygraphs are passed the same
  // div, then only one will be drawn.
  div.innerHTML = "";
  var resolved = window.getComputedStyle(div, null);
  if (resolved.paddingLeft !== "0px" || resolved.paddingRight !== "0px" || resolved.paddingTop !== "0px" || resolved.paddingBottom !== "0px") console.error('Main div contains padding; graph will misbehave');

  // For historical reasons, the 'width' and 'height' options trump all CSS
  // rules _except_ for an explicit 'width' or 'height' on the div.
  // As an added convenience, if the div has zero height (like <div></div> does
  // without any styles), then we use a default height/width.
  if (div.style.width === '' && attrs.width) {
    div.style.width = attrs.width + "px";
  }
  if (div.style.height === '' && attrs.height) {
    div.style.height = attrs.height + "px";
  }
  if (div.style.height === '' && div.clientHeight === 0) {
    div.style.height = Dygraph.DEFAULT_HEIGHT + "px";
    if (div.style.width === '') {
      div.style.width = Dygraph.DEFAULT_WIDTH + "px";
    }
  }
  // These will be zero if the dygraph's div is hidden. In that case,
  // use the user-specified attributes if present. If not, use zero
  // and assume the user will call resize to fix things later.
  this.width_ = div.clientWidth || attrs.width || 0;
  this.height_ = div.clientHeight || attrs.height || 0;

  // TODO(danvk): set fillGraph to be part of attrs_ here, not user_attrs_.
  if (attrs.stackedGraph) {
    attrs.fillGraph = true;
    // TODO(nikhilk): Add any other stackedGraph checks here.
  }

  // DEPRECATION WARNING: All option processing should be moved from
  // attrs_ and user_attrs_ to options_, which holds all this information.
  //
  // Dygraphs has many options, some of which interact with one another.
  // To keep track of everything, we maintain two sets of options:
  //
  //  this.user_attrs_   only options explicitly set by the user.
  //  this.attrs_        defaults, options derived from user_attrs_, data.
  //
  // Options are then accessed this.attr_('attr'), which first looks at
  // user_attrs_ and then computed attrs_. This way Dygraphs can set intelligent
  // defaults without overriding behavior that the user specifically asks for.
  this.user_attrs_ = {};
  utils.update(this.user_attrs_, attrs);

  // This sequence ensures that Dygraph.DEFAULT_ATTRS is never modified.
  this.attrs_ = {};
  utils.updateDeep(this.attrs_, _dygraphDefaultAttrs["default"]);
  this.boundaryIds_ = [];
  this.setIndexByName_ = {};
  this.datasetIndex_ = [];
  this.registeredEvents_ = [];
  this.eventListeners_ = {};
  this.attributes_ = new _dygraphOptions["default"](this);

  // Create the containing DIV and other interactive elements
  this.createInterface_();

  // Activate plugins.
  this.plugins_ = [];
  var plugins = Dygraph.PLUGINS.concat(this.getOption('plugins'));
  for (var i = 0; i < plugins.length; i++) {
    // the plugins option may contain either plugin classes or instances.
    // Plugin instances contain an activate method.
    var Plugin = plugins[i]; // either a constructor or an instance.
    var pluginInstance;
    if (typeof Plugin.activate !== 'undefined') {
      pluginInstance = Plugin;
    } else {
      pluginInstance = new Plugin();
    }
    var pluginDict = {
      plugin: pluginInstance,
      events: {},
      options: {},
      pluginOptions: {}
    };
    var handlers = pluginInstance.activate(this);
    for (var eventName in handlers) {
      if (!handlers.hasOwnProperty(eventName)) continue;
      // TODO(danvk): validate eventName.
      pluginDict.events[eventName] = handlers[eventName];
    }
    this.plugins_.push(pluginDict);
  }

  // At this point, plugins can no longer register event handlers.
  // Construct a map from event -> ordered list of [callback, plugin].
  for (var i = 0; i < this.plugins_.length; i++) {
    var plugin_dict = this.plugins_[i];
    for (var eventName in plugin_dict.events) {
      if (!plugin_dict.events.hasOwnProperty(eventName)) continue;
      var callback = plugin_dict.events[eventName];
      var pair = [plugin_dict.plugin, callback];
      if (!(eventName in this.eventListeners_)) {
        this.eventListeners_[eventName] = [pair];
      } else {
        this.eventListeners_[eventName].push(pair);
      }
    }
  }
  this.createDragInterface_();
  this.start_();
};

/**
 * Triggers a cascade of events to the various plugins which are interested in them.
 * Returns true if the "default behavior" should be prevented, i.e. if one
 * of the event listeners called event.preventDefault().
 * @private
 */
Dygraph.prototype.cascadeEvents_ = function (name, extra_props) {
  if (!(name in this.eventListeners_)) return false;

  // QUESTION: can we use objects & prototypes to speed this up?
  var e = {
    dygraph: this,
    cancelable: false,
    defaultPrevented: false,
    preventDefault: function preventDefault() {
      if (!e.cancelable) throw "Cannot call preventDefault on non-cancelable event.";
      e.defaultPrevented = true;
    },
    propagationStopped: false,
    stopPropagation: function stopPropagation() {
      e.propagationStopped = true;
    }
  };
  utils.update(e, extra_props);
  var callback_plugin_pairs = this.eventListeners_[name];
  if (callback_plugin_pairs) {
    for (var i = callback_plugin_pairs.length - 1; i >= 0; i--) {
      var plugin = callback_plugin_pairs[i][0];
      var callback = callback_plugin_pairs[i][1];
      callback.call(plugin, e);
      if (e.propagationStopped) break;
    }
  }
  return e.defaultPrevented;
};

/**
 * Fetch a plugin instance of a particular class. Only for testing.
 * @private
 * @param {!Class} type The type of the plugin.
 * @return {Object} Instance of the plugin, or null if there is none.
 */
Dygraph.prototype.getPluginInstance_ = function (type) {
  for (var i = 0; i < this.plugins_.length; i++) {
    var p = this.plugins_[i];
    if (p.plugin instanceof type) {
      return p.plugin;
    }
  }
  return null;
};

/**
 * Returns the zoomed status of the chart for one or both axes.
 *
 * Axis is an optional parameter. Can be set to 'x' or 'y'.
 *
 * The zoomed status for an axis is set whenever a user zooms using the mouse
 * or when the dateWindow or valueRange are updated. Double-clicking or calling
 * resetZoom() resets the zoom status for the chart.
 */
Dygraph.prototype.isZoomed = function (axis) {
  var isZoomedX = !!this.dateWindow_;
  if (axis === 'x') return isZoomedX;
  var isZoomedY = this.axes_.map(function (axis) {
    return !!axis.valueRange;
  }).indexOf(true) >= 0;
  if (axis === null || axis === undefined) {
    return isZoomedX || isZoomedY;
  }
  if (axis === 'y') return isZoomedY;
  throw new Error("axis parameter is [".concat(axis, "] must be null, 'x' or 'y'."));
};

/**
 * Returns information about the Dygraph object, including its containing ID.
 */
Dygraph.prototype.toString = function () {
  var maindiv = this.maindiv_;
  var id = maindiv && maindiv.id ? maindiv.id : maindiv;
  return "[Dygraph " + id + "]";
};

/**
 * @private
 * Returns the value of an option. This may be set by the user (either in the
 * constructor or by calling updateOptions) or by dygraphs, and may be set to a
 * per-series value.
 * @param {string} name The name of the option, e.g. 'rollPeriod'.
 * @param {string} [seriesName] The name of the series to which the option
 * will be applied. If no per-series value of this option is available, then
 * the global value is returned. This is optional.
 * @return {...} The value of the option.
 */
Dygraph.prototype.attr_ = function (name, seriesName) {
  if (typeof process !== 'undefined' && process.env.NODE_ENV != 'production') {
    // For "production" code, this gets removed by uglifyjs.
    if (typeof _dygraphOptionsReference["default"] === 'undefined') {
      console.error('Must include options reference JS for testing');
    } else if (!_dygraphOptionsReference["default"].hasOwnProperty(name)) {
      console.error('Dygraphs is using property ' + name + ', which has no ' + 'entry in the Dygraphs.OPTIONS_REFERENCE listing.');
      // Only log this error once.
      _dygraphOptionsReference["default"][name] = true;
    }
  }
  return seriesName ? this.attributes_.getForSeries(name, seriesName) : this.attributes_.get(name);
};

/**
 * Returns the current value for an option, as set in the constructor or via
 * updateOptions. You may pass in an (optional) series name to get per-series
 * values for the option.
 *
 * All values returned by this method should be considered immutable. If you
 * modify them, there is no guarantee that the changes will be honored or that
 * dygraphs will remain in a consistent state. If you want to modify an option,
 * use updateOptions() instead.
 *
 * @param {string} name The name of the option (e.g. 'strokeWidth')
 * @param {string=} opt_seriesName Series name to get per-series values.
 * @return {*} The value of the option.
 */
Dygraph.prototype.getOption = function (name, opt_seriesName) {
  return this.attr_(name, opt_seriesName);
};

/**
 * Like getOption(), but specifically returns a number.
 * This is a convenience function for working with the Closure Compiler.
 * @param {string} name The name of the option (e.g. 'strokeWidth')
 * @param {string=} opt_seriesName Series name to get per-series values.
 * @return {number} The value of the option.
 * @private
 */
Dygraph.prototype.getNumericOption = function (name, opt_seriesName) {
  return (/** @type{number} */this.getOption(name, opt_seriesName)
  );
};

/**
 * Like getOption(), but specifically returns a string.
 * This is a convenience function for working with the Closure Compiler.
 * @param {string} name The name of the option (e.g. 'strokeWidth')
 * @param {string=} opt_seriesName Series name to get per-series values.
 * @return {string} The value of the option.
 * @private
 */
Dygraph.prototype.getStringOption = function (name, opt_seriesName) {
  return (/** @type{string} */this.getOption(name, opt_seriesName)
  );
};

/**
 * Like getOption(), but specifically returns a boolean.
 * This is a convenience function for working with the Closure Compiler.
 * @param {string} name The name of the option (e.g. 'strokeWidth')
 * @param {string=} opt_seriesName Series name to get per-series values.
 * @return {boolean} The value of the option.
 * @private
 */
Dygraph.prototype.getBooleanOption = function (name, opt_seriesName) {
  return (/** @type{boolean} */this.getOption(name, opt_seriesName)
  );
};

/**
 * Like getOption(), but specifically returns a function.
 * This is a convenience function for working with the Closure Compiler.
 * @param {string} name The name of the option (e.g. 'strokeWidth')
 * @param {string=} opt_seriesName Series name to get per-series values.
 * @return {function(...)} The value of the option.
 * @private
 */
Dygraph.prototype.getFunctionOption = function (name, opt_seriesName) {
  return (/** @type{function(...)} */this.getOption(name, opt_seriesName)
  );
};
Dygraph.prototype.getOptionForAxis = function (name, axis) {
  return this.attributes_.getForAxis(name, axis);
};

/**
 * @private
 * @param {string} axis The name of the axis (i.e. 'x', 'y' or 'y2')
 * @return {...} A function mapping string -> option value
 */
Dygraph.prototype.optionsViewForAxis_ = function (axis) {
  var self = this;
  return function (opt) {
    var axis_opts = self.user_attrs_.axes;
    if (axis_opts && axis_opts[axis] && axis_opts[axis].hasOwnProperty(opt)) {
      return axis_opts[axis][opt];
    }

    // I don't like that this is in a second spot.
    if (axis === 'x' && opt === 'logscale') {
      // return the default value.
      // TODO(konigsberg): pull the default from a global default.
      return false;
    }

    // user-specified attributes always trump defaults, even if they're less
    // specific.
    if (typeof self.user_attrs_[opt] != 'undefined') {
      return self.user_attrs_[opt];
    }
    axis_opts = self.attrs_.axes;
    if (axis_opts && axis_opts[axis] && axis_opts[axis].hasOwnProperty(opt)) {
      return axis_opts[axis][opt];
    }
    // check old-style axis options
    // TODO(danvk): add a deprecation warning if either of these match.
    if (axis == 'y' && self.axes_[0].hasOwnProperty(opt)) {
      return self.axes_[0][opt];
    } else if (axis == 'y2' && self.axes_[1].hasOwnProperty(opt)) {
      return self.axes_[1][opt];
    }
    return self.attr_(opt);
  };
};

/**
 * Returns the current rolling period, as set by the user or an option.
 * @return {number} The number of points in the rolling window
 */
Dygraph.prototype.rollPeriod = function () {
  return this.rollPeriod_;
};

/**
 * Returns the currently-visible x-range. This can be affected by zooming,
 * panning or a call to updateOptions.
 * Returns a two-element array: [left, right].
 * If the Dygraph has dates on the x-axis, these will be millis since epoch.
 */
Dygraph.prototype.xAxisRange = function () {
  return this.dateWindow_ ? this.dateWindow_ : this.xAxisExtremes();
};

/**
 * Returns the lower- and upper-bound x-axis values of the data set.
 */
Dygraph.prototype.xAxisExtremes = function () {
  var pad = this.getNumericOption('xRangePad') / this.plotter_.area.w;
  if (this.numRows() === 0) {
    return [0 - pad, 1 + pad];
  }
  var left = this.rawData_[0][0];
  var right = this.rawData_[this.rawData_.length - 1][0];
  if (pad) {
    // Must keep this in sync with dygraph-layout _evaluateLimits()
    var range = right - left;
    left -= range * pad;
    right += range * pad;
  }
  return [left, right];
};

/**
 * Returns the lower- and upper-bound y-axis values for each axis. These are
 * the ranges you'll get if you double-click to zoom out or call resetZoom().
 * The return value is an array of [low, high] tuples, one for each y-axis.
 */
Dygraph.prototype.yAxisExtremes = function () {
  // TODO(danvk): this is pretty inefficient
  var packed = this.gatherDatasets_(this.rolledSeries_, null);
  var extremes = packed.extremes;
  var saveAxes = this.axes_;
  this.computeYAxisRanges_(extremes);
  var newAxes = this.axes_;
  this.axes_ = saveAxes;
  return newAxes.map(function (axis) {
    return axis.extremeRange;
  });
};

/**
 * Returns the currently-visible y-range for an axis. This can be affected by
 * zooming, panning or a call to updateOptions. Axis indices are zero-based. If
 * called with no arguments, returns the range of the first axis.
 * Returns a two-element array: [bottom, top].
 */
Dygraph.prototype.yAxisRange = function (idx) {
  if (typeof idx == "undefined") idx = 0;
  if (idx < 0 || idx >= this.axes_.length) {
    return null;
  }
  var axis = this.axes_[idx];
  return [axis.computedValueRange[0], axis.computedValueRange[1]];
};

/**
 * Returns the currently-visible y-ranges for each axis. This can be affected by
 * zooming, panning, calls to updateOptions, etc.
 * Returns an array of [bottom, top] pairs, one for each y-axis.
 */
Dygraph.prototype.yAxisRanges = function () {
  var ret = [];
  for (var i = 0; i < this.axes_.length; i++) {
    ret.push(this.yAxisRange(i));
  }
  return ret;
};

// TODO(danvk): use these functions throughout dygraphs.
/**
 * Convert from data coordinates to canvas/div X/Y coordinates.
 * If specified, do this conversion for the coordinate system of a particular
 * axis. Uses the first axis by default.
 * Returns a two-element array: [X, Y]
 *
 * Note: use toDomXCoord instead of toDomCoords(x, null) and use toDomYCoord
 * instead of toDomCoords(null, y, axis).
 */
Dygraph.prototype.toDomCoords = function (x, y, axis) {
  return [this.toDomXCoord(x), this.toDomYCoord(y, axis)];
};

/**
 * Convert from data x coordinates to canvas/div X coordinate.
 * If specified, do this conversion for the coordinate system of a particular
 * axis.
 * Returns a single value or null if x is null.
 */
Dygraph.prototype.toDomXCoord = function (x) {
  if (x === null) {
    return null;
  }
  var area = this.plotter_.area;
  var xRange = this.xAxisRange();
  return area.x + (x - xRange[0]) / (xRange[1] - xRange[0]) * area.w;
};

/**
 * Convert from data x coordinates to canvas/div Y coordinate and optional
 * axis. Uses the first axis by default.
 *
 * returns a single value or null if y is null.
 */
Dygraph.prototype.toDomYCoord = function (y, axis) {
  var pct = this.toPercentYCoord(y, axis);
  if (pct === null) {
    return null;
  }
  var area = this.plotter_.area;
  return area.y + pct * area.h;
};

/**
 * Convert from canvas/div coords to data coordinates.
 * If specified, do this conversion for the coordinate system of a particular
 * axis. Uses the first axis by default.
 * Returns a two-element array: [X, Y].
 *
 * Note: use toDataXCoord instead of toDataCoords(x, null) and use toDataYCoord
 * instead of toDataCoords(null, y, axis).
 */
Dygraph.prototype.toDataCoords = function (x, y, axis) {
  return [this.toDataXCoord(x), this.toDataYCoord(y, axis)];
};

/**
 * Convert from canvas/div x coordinate to data coordinate.
 *
 * If x is null, this returns null.
 */
Dygraph.prototype.toDataXCoord = function (x) {
  if (x === null) {
    return null;
  }
  var area = this.plotter_.area;
  var xRange = this.xAxisRange();
  if (!this.attributes_.getForAxis("logscale", 'x')) {
    return xRange[0] + (x - area.x) / area.w * (xRange[1] - xRange[0]);
  } else {
    var pct = (x - area.x) / area.w;
    return utils.logRangeFraction(xRange[0], xRange[1], pct);
  }
};

/**
 * Convert from canvas/div y coord to value.
 *
 * If y is null, this returns null.
 * if axis is null, this uses the first axis.
 */
Dygraph.prototype.toDataYCoord = function (y, axis) {
  if (y === null) {
    return null;
  }
  var area = this.plotter_.area;
  var yRange = this.yAxisRange(axis);
  if (typeof axis == "undefined") axis = 0;
  if (!this.attributes_.getForAxis("logscale", axis)) {
    return yRange[0] + (area.y + area.h - y) / area.h * (yRange[1] - yRange[0]);
  } else {
    // Computing the inverse of toDomCoord.
    var pct = (y - area.y) / area.h;
    // Note reversed yRange, y1 is on top with pct==0.
    return utils.logRangeFraction(yRange[1], yRange[0], pct);
  }
};

/**
 * Converts a y for an axis to a percentage from the top to the
 * bottom of the drawing area.
 *
 * If the coordinate represents a value visible on the canvas, then
 * the value will be between 0 and 1, where 0 is the top of the canvas.
 * However, this method will return values outside the range, as
 * values can fall outside the canvas.
 *
 * If y is null, this returns null.
 * if axis is null, this uses the first axis.
 *
 * @param {number} y The data y-coordinate.
 * @param {number} [axis] The axis number on which the data coordinate lives.
 * @return {number} A fraction in [0, 1] where 0 = the top edge.
 */
Dygraph.prototype.toPercentYCoord = function (y, axis) {
  if (y === null) {
    return null;
  }
  if (typeof axis == "undefined") axis = 0;
  var yRange = this.yAxisRange(axis);
  var pct;
  var logscale = this.attributes_.getForAxis("logscale", axis);
  if (logscale) {
    var logr0 = utils.log10(yRange[0]);
    var logr1 = utils.log10(yRange[1]);
    pct = (logr1 - utils.log10(y)) / (logr1 - logr0);
  } else {
    // yRange[1] - y is unit distance from the bottom.
    // yRange[1] - yRange[0] is the scale of the range.
    // (yRange[1] - y) / (yRange[1] - yRange[0]) is the % from the bottom.
    pct = (yRange[1] - y) / (yRange[1] - yRange[0]);
  }
  return pct;
};

/**
 * Converts an x value to a percentage from the left to the right of
 * the drawing area.
 *
 * If the coordinate represents a value visible on the canvas, then
 * the value will be between 0 and 1, where 0 is the left of the canvas.
 * However, this method will return values outside the range, as
 * values can fall outside the canvas.
 *
 * If x is null, this returns null.
 * @param {number} x The data x-coordinate.
 * @return {number} A fraction in [0, 1] where 0 = the left edge.
 */
Dygraph.prototype.toPercentXCoord = function (x) {
  if (x === null) {
    return null;
  }
  var xRange = this.xAxisRange();
  var pct;
  var logscale = this.attributes_.getForAxis("logscale", 'x');
  if (logscale === true) {
    // logscale can be null so we test for true explicitly.
    var logr0 = utils.log10(xRange[0]);
    var logr1 = utils.log10(xRange[1]);
    pct = (utils.log10(x) - logr0) / (logr1 - logr0);
  } else {
    // x - xRange[0] is unit distance from the left.
    // xRange[1] - xRange[0] is the scale of the range.
    // The full expression below is the % from the left.
    pct = (x - xRange[0]) / (xRange[1] - xRange[0]);
  }
  return pct;
};

/**
 * Returns the number of columns (including the independent variable).
 * @return {number} The number of columns.
 */
Dygraph.prototype.numColumns = function () {
  if (!this.rawData_) return 0;
  return this.rawData_[0] ? this.rawData_[0].length : this.attr_("labels").length;
};

/**
 * Returns the number of rows (excluding any header/label row).
 * @return {number} The number of rows, less any header.
 */
Dygraph.prototype.numRows = function () {
  if (!this.rawData_) return 0;
  return this.rawData_.length;
};

/**
 * Returns the value in the given row and column. If the row and column exceed
 * the bounds on the data, returns null. Also returns null if the value is
 * missing.
 * @param {number} row The row number of the data (0-based). Row 0 is the
 *     first row of data, not a header row.
 * @param {number} col The column number of the data (0-based)
 * @return {number} The value in the specified cell or null if the row/col
 *     were out of range.
 */
Dygraph.prototype.getValue = function (row, col) {
  if (row < 0 || row >= this.rawData_.length) return null;
  if (col < 0 || col >= this.rawData_[row].length) return null;
  return this.rawData_[row][col];
};

/**
 * Generates interface elements for the Dygraph: a containing div, a div to
 * display the current point, and a textbox to adjust the rolling average
 * period. Also creates the Renderer/Layout elements.
 * @private
 */
Dygraph.prototype.createInterface_ = function () {
  // Create the all-enclosing graph div
  var enclosing = this.maindiv_;
  this.graphDiv = document.createElement("div");

  // TODO(danvk): any other styles that are useful to set here?
  this.graphDiv.style.textAlign = 'left'; // This is a CSS "reset"
  this.graphDiv.style.position = 'relative';
  enclosing.appendChild(this.graphDiv);

  // Create the canvas for interactive parts of the chart.
  this.canvas_ = utils.createCanvas();
  this.canvas_.style.position = "absolute";
  this.canvas_.style.top = 0;
  this.canvas_.style.left = 0;

  // ... and for static parts of the chart.
  this.hidden_ = this.createPlotKitCanvas_(this.canvas_);
  this.canvas_ctx_ = utils.getContext(this.canvas_);
  this.hidden_ctx_ = utils.getContext(this.hidden_);
  this.resizeElements_();

  // The interactive parts of the graph are drawn on top of the chart.
  this.graphDiv.appendChild(this.hidden_);
  this.graphDiv.appendChild(this.canvas_);
  this.mouseEventElement_ = this.createMouseEventElement_();

  // Create the grapher
  this.layout_ = new _dygraphLayout["default"](this);
  var dygraph = this;
  this.mouseMoveHandler_ = function (e) {
    dygraph.mouseMove_(e);
  };
  this.mouseOutHandler_ = function (e) {
    // The mouse has left the chart if:
    // 1. e.target is inside the chart
    // 2. e.relatedTarget is outside the chart
    var target = e.target || e.fromElement;
    var relatedTarget = e.relatedTarget || e.toElement;
    if (utils.isNodeContainedBy(target, dygraph.graphDiv) && !utils.isNodeContainedBy(relatedTarget, dygraph.graphDiv)) {
      dygraph.mouseOut_(e);
    }
  };
  this.addAndTrackEvent(window, 'mouseout', this.mouseOutHandler_);
  this.addAndTrackEvent(this.mouseEventElement_, 'mousemove', this.mouseMoveHandler_);

  // Don't recreate and register the resize handler on subsequent calls.
  // This happens when the graph is resized.
  if (!this.resizeHandler_) {
    this.resizeHandler_ = function (e) {
      dygraph.resize();
    };

    // Update when the window is resized.
    // TODO(danvk): drop frames depending on complexity of the chart.
    this.addAndTrackEvent(window, 'resize', this.resizeHandler_);
    this.resizeObserver_ = null;
    var resizeMode = this.getStringOption('resizable');
    if (typeof ResizeObserver === 'undefined' && resizeMode !== "no") {
      console.error('ResizeObserver unavailable; ignoring resizable property');
      resizeMode = "no";
    }
    if (resizeMode === "horizontal" || resizeMode === "vertical" || resizeMode === "both") {
      enclosing.style.resize = resizeMode;
    } else if (resizeMode !== "passive") {
      resizeMode = "no";
    }
    if (resizeMode !== "no") {
      var maindivOverflow = window.getComputedStyle(enclosing).overflow;
      if (window.getComputedStyle(enclosing).overflow === 'visible') enclosing.style.overflow = 'hidden';
      this.resizeObserver_ = new ResizeObserver(this.resizeHandler_);
      this.resizeObserver_.observe(enclosing);
    }
  }
};
Dygraph.prototype.resizeElements_ = function () {
  this.graphDiv.style.width = this.width_ + "px";
  this.graphDiv.style.height = this.height_ + "px";
  var pixelRatioOption = this.getNumericOption('pixelRatio');
  var canvasScale = pixelRatioOption || utils.getContextPixelRatio(this.canvas_ctx_);
  this.canvas_.width = this.width_ * canvasScale;
  this.canvas_.height = this.height_ * canvasScale;
  this.canvas_.style.width = this.width_ + "px"; // for IE
  this.canvas_.style.height = this.height_ + "px"; // for IE
  if (canvasScale !== 1) {
    this.canvas_ctx_.scale(canvasScale, canvasScale);
  }
  var hiddenScale = pixelRatioOption || utils.getContextPixelRatio(this.hidden_ctx_);
  this.hidden_.width = this.width_ * hiddenScale;
  this.hidden_.height = this.height_ * hiddenScale;
  this.hidden_.style.width = this.width_ + "px"; // for IE
  this.hidden_.style.height = this.height_ + "px"; // for IE
  if (hiddenScale !== 1) {
    this.hidden_ctx_.scale(hiddenScale, hiddenScale);
  }
};

/**
 * Detach DOM elements in the dygraph and null out all data references.
 * Calling this when you're done with a dygraph can dramatically reduce memory
 * usage. See, e.g., the tests/perf.html example.
 */
Dygraph.prototype.destroy = function () {
  this.canvas_ctx_.restore();
  this.hidden_ctx_.restore();

  // Destroy any plugins, in the reverse order that they were registered.
  for (var i = this.plugins_.length - 1; i >= 0; i--) {
    var p = this.plugins_.pop();
    if (p.plugin.destroy) p.plugin.destroy();
  }
  var removeRecursive = function removeRecursive(node) {
    while (node.hasChildNodes()) {
      removeRecursive(node.firstChild);
      node.removeChild(node.firstChild);
    }
  };
  this.removeTrackedEvents_();

  // remove mouse event handlers (This may not be necessary anymore)
  utils.removeEvent(window, 'mouseout', this.mouseOutHandler_);
  utils.removeEvent(this.mouseEventElement_, 'mousemove', this.mouseMoveHandler_);

  // dispose of resizing handlers
  if (this.resizeObserver_) {
    this.resizeObserver_.disconnect();
    this.resizeObserver_ = null;
  }
  utils.removeEvent(window, 'resize', this.resizeHandler_);
  this.resizeHandler_ = null;
  removeRecursive(this.maindiv_);
  var nullOut = function nullOut(obj) {
    for (var n in obj) {
      if (typeof obj[n] === 'object') {
        obj[n] = null;
      }
    }
  };
  // These may not all be necessary, but it can't hurt...
  nullOut(this.layout_);
  nullOut(this.plotter_);
  nullOut(this);
};

/**
 * Creates the canvas on which the chart will be drawn. Only the Renderer ever
 * draws on this particular canvas. All Dygraph work (i.e. drawing hover dots
 * or the zoom rectangles) is done on this.canvas_.
 * @param {Object} canvas The Dygraph canvas over which to overlay the plot
 * @return {Object} The newly-created canvas
 * @private
 */
Dygraph.prototype.createPlotKitCanvas_ = function (canvas) {
  var h = utils.createCanvas();
  h.style.position = "absolute";
  // TODO(danvk): h should be offset from canvas. canvas needs to include
  // some extra area to make it easier to zoom in on the far left and far
  // right. h needs to be precisely the plot area, so that clipping occurs.
  h.style.top = canvas.style.top;
  h.style.left = canvas.style.left;
  h.width = this.width_;
  h.height = this.height_;
  h.style.width = this.width_ + "px"; // for IE
  h.style.height = this.height_ + "px"; // for IE
  return h;
};

/**
 * Creates an overlay element used to handle mouse events.
 * @return {Object} The mouse event element.
 * @private
 */
Dygraph.prototype.createMouseEventElement_ = function () {
  return this.canvas_;
};

/**
 * Generate a set of distinct colors for the data series. This is done with a
 * color wheel. Saturation/Value are customizable, and the hue is
 * equally-spaced around the color wheel. If a custom set of colors is
 * specified, that is used instead.
 * @private
 */
Dygraph.prototype.setColors_ = function () {
  var labels = this.getLabels();
  var num = labels.length - 1;
  this.colors_ = [];
  this.colorsMap_ = {};

  // These are used for when no custom colors are specified.
  var sat = this.getNumericOption('colorSaturation') || 1.0;
  var val = this.getNumericOption('colorValue') || 0.5;
  var half = Math.ceil(num / 2);
  var colors = this.getOption('colors');
  var visibility = this.visibility();
  for (var i = 0; i < num; i++) {
    if (!visibility[i]) {
      continue;
    }
    var label = labels[i + 1];
    var colorStr = this.attributes_.getForSeries('color', label);
    if (!colorStr) {
      if (colors) {
        colorStr = colors[i % colors.length];
      } else {
        // alternate colors for high contrast.
        var idx = i % 2 ? half + (i + 1) / 2 : Math.ceil((i + 1) / 2);
        var hue = 1.0 * idx / (1 + num);
        colorStr = utils.hsvToRGB(hue, sat, val);
      }
    }
    this.colors_.push(colorStr);
    this.colorsMap_[label] = colorStr;
  }
};

/**
 * Return the list of colors. This is either the list of colors passed in the
 * attributes or the autogenerated list of rgb(r,g,b) strings.
 * This does not return colors for invisible series.
 * @return {Array.<string>} The list of colors.
 */
Dygraph.prototype.getColors = function () {
  return this.colors_;
};

/**
 * Returns a few attributes of a series, i.e. its color, its visibility, which
 * axis it's assigned to, and its column in the original data.
 * Returns null if the series does not exist.
 * Otherwise, returns an object with column, visibility, color and axis properties.
 * The "axis" property will be set to 1 for y1 and 2 for y2.
 * The "column" property can be fed back into getValue(row, column) to get
 * values for this series.
 */
Dygraph.prototype.getPropertiesForSeries = function (series_name) {
  var idx = -1;
  var labels = this.getLabels();
  for (var i = 1; i < labels.length; i++) {
    if (labels[i] == series_name) {
      idx = i;
      break;
    }
  }
  if (idx == -1) return null;
  return {
    name: series_name,
    column: idx,
    visible: this.visibility()[idx - 1],
    color: this.colorsMap_[series_name],
    axis: 1 + this.attributes_.axisForSeries(series_name)
  };
};

/**
 * Create the text box to adjust the averaging period
 * @private
 */
Dygraph.prototype.createRollInterface_ = function () {
  // Create a roller if one doesn't exist already.
  var roller = this.roller_;
  if (!roller) {
    this.roller_ = roller = document.createElement("input");
    roller.type = "text";
    roller.style.display = "none";
    roller.className = 'dygraph-roller';
    this.graphDiv.appendChild(roller);
  }
  var display = this.getBooleanOption('showRoller') ? 'block' : 'none';
  var area = this.getArea();
  var textAttr = {
    "top": area.y + area.h - 25 + "px",
    "left": area.x + 1 + "px",
    "display": display
  };
  roller.size = "2";
  roller.value = this.rollPeriod_;
  utils.update(roller.style, textAttr);
  var that = this;
  roller.onchange = function onchange() {
    return that.adjustRoll(roller.value);
  };
};

/**
 * Set up all the mouse handlers needed to capture dragging behavior for zoom
 * events.
 * @private
 */
Dygraph.prototype.createDragInterface_ = function () {
  var context = {
    // Tracks whether the mouse is down right now
    isZooming: false,
    isPanning: false,
    // is this drag part of a pan?
    is2DPan: false,
    // if so, is that pan 1- or 2-dimensional?
    dragStartX: null,
    // pixel coordinates
    dragStartY: null,
    // pixel coordinates
    dragEndX: null,
    // pixel coordinates
    dragEndY: null,
    // pixel coordinates
    dragDirection: null,
    prevEndX: null,
    // pixel coordinates
    prevEndY: null,
    // pixel coordinates
    prevDragDirection: null,
    cancelNextDblclick: false,
    // see comment in dygraph-interaction-model.js

    // The value on the left side of the graph when a pan operation starts.
    initialLeftmostDate: null,
    // The number of units each pixel spans. (This won't be valid for log
    // scales)
    xUnitsPerPixel: null,
    // TODO(danvk): update this comment
    // The range in second/value units that the viewport encompasses during a
    // panning operation.
    dateRange: null,
    // Top-left corner of the canvas, in DOM coords
    // TODO(konigsberg): Rename topLeftCanvasX, topLeftCanvasY.
    px: 0,
    py: 0,
    // Values for use with panEdgeFraction, which limit how far outside the
    // graph's data boundaries it can be panned.
    boundedDates: null,
    // [minDate, maxDate]
    boundedValues: null,
    // [[minValue, maxValue] ...]

    // We cover iframes during mouse interactions. See comments in
    // dygraph-utils.js for more info on why this is a good idea.
    tarp: new _iframeTarp["default"](),
    // contextB is the same thing as this context object but renamed.
    initializeMouseDown: function initializeMouseDown(event, g, contextB) {
      // prevents mouse drags from selecting page text.
      if (event.preventDefault) {
        event.preventDefault(); // Firefox, Chrome, etc.
      } else {
        event.returnValue = false; // IE
        event.cancelBubble = true;
      }
      var canvasPos = utils.findPos(g.canvas_);
      contextB.px = canvasPos.x;
      contextB.py = canvasPos.y;
      contextB.dragStartX = utils.dragGetX_(event, contextB);
      contextB.dragStartY = utils.dragGetY_(event, contextB);
      contextB.cancelNextDblclick = false;
      contextB.tarp.cover();
    },
    destroy: function destroy() {
      var context = this;
      if (context.isZooming || context.isPanning) {
        context.isZooming = false;
        context.dragStartX = null;
        context.dragStartY = null;
      }
      if (context.isPanning) {
        context.isPanning = false;
        context.draggingDate = null;
        context.dateRange = null;
        for (var i = 0; i < self.axes_.length; i++) {
          delete self.axes_[i].draggingValue;
          delete self.axes_[i].dragValueRange;
        }
      }
      context.tarp.uncover();
    }
  };
  var interactionModel = this.getOption("interactionModel");

  // Self is the graph.
  var self = this;

  // Function that binds the graph and context to the handler.
  var bindHandler = function bindHandler(handler) {
    return function (event) {
      handler(event, self, context);
    };
  };
  for (var eventName in interactionModel) {
    if (!interactionModel.hasOwnProperty(eventName)) continue;
    this.addAndTrackEvent(this.mouseEventElement_, eventName, bindHandler(interactionModel[eventName]));
  }

  // If the user releases the mouse button during a drag, but not over the
  // canvas, then it doesn't count as a zooming action.
  if (!interactionModel.willDestroyContextMyself) {
    var mouseUpHandler = function mouseUpHandler(event) {
      context.destroy();
    };
    this.addAndTrackEvent(document, 'mouseup', mouseUpHandler);
  }
};

/**
 * Draw a gray zoom rectangle over the desired area of the canvas. Also clears
 * up any previous zoom rectangles that were drawn. This could be optimized to
 * avoid extra redrawing, but it's tricky to avoid interactions with the status
 * dots.
 *
 * @param {number} direction the direction of the zoom rectangle. Acceptable
 *     values are utils.HORIZONTAL and utils.VERTICAL.
 * @param {number} startX The X position where the drag started, in canvas
 *     coordinates.
 * @param {number} endX The current X position of the drag, in canvas coords.
 * @param {number} startY The Y position where the drag started, in canvas
 *     coordinates.
 * @param {number} endY The current Y position of the drag, in canvas coords.
 * @param {number} prevDirection the value of direction on the previous call to
 *     this function. Used to avoid excess redrawing
 * @param {number} prevEndX The value of endX on the previous call to this
 *     function. Used to avoid excess redrawing
 * @param {number} prevEndY The value of endY on the previous call to this
 *     function. Used to avoid excess redrawing
 * @private
 */
Dygraph.prototype.drawZoomRect_ = function (direction, startX, endX, startY, endY, prevDirection, prevEndX, prevEndY) {
  var ctx = this.canvas_ctx_;

  // Clean up from the previous rect if necessary
  if (prevDirection == utils.HORIZONTAL) {
    ctx.clearRect(Math.min(startX, prevEndX), this.layout_.getPlotArea().y, Math.abs(startX - prevEndX), this.layout_.getPlotArea().h);
  } else if (prevDirection == utils.VERTICAL) {
    ctx.clearRect(this.layout_.getPlotArea().x, Math.min(startY, prevEndY), this.layout_.getPlotArea().w, Math.abs(startY - prevEndY));
  }

  // Draw a light-grey rectangle to show the new viewing area
  if (direction == utils.HORIZONTAL) {
    if (endX && startX) {
      ctx.fillStyle = "rgba(128,128,128,0.33)";
      ctx.fillRect(Math.min(startX, endX), this.layout_.getPlotArea().y, Math.abs(endX - startX), this.layout_.getPlotArea().h);
    }
  } else if (direction == utils.VERTICAL) {
    if (endY && startY) {
      ctx.fillStyle = "rgba(128,128,128,0.33)";
      ctx.fillRect(this.layout_.getPlotArea().x, Math.min(startY, endY), this.layout_.getPlotArea().w, Math.abs(endY - startY));
    }
  }
};

/**
 * Clear the zoom rectangle (and perform no zoom).
 * @private
 */
Dygraph.prototype.clearZoomRect_ = function () {
  this.currentZoomRectArgs_ = null;
  this.canvas_ctx_.clearRect(0, 0, this.width_, this.height_);
};

/**
 * Zoom to something containing [lowX, highX]. These are pixel coordinates in
 * the canvas. The exact zoom window may be slightly larger if there are no data
 * points near lowX or highX. Don't confuse this function with doZoomXDates,
 * which accepts dates that match the raw data. This function redraws the graph.
 *
 * @param {number} lowX The leftmost pixel value that should be visible.
 * @param {number} highX The rightmost pixel value that should be visible.
 * @private
 */
Dygraph.prototype.doZoomX_ = function (lowX, highX) {
  this.currentZoomRectArgs_ = null;
  // Find the earliest and latest dates contained in this canvasx range.
  // Convert the call to date ranges of the raw data.
  var minDate = this.toDataXCoord(lowX);
  var maxDate = this.toDataXCoord(highX);
  this.doZoomXDates_(minDate, maxDate);
};

/**
 * Zoom to something containing [minDate, maxDate] values. Don't confuse this
 * method with doZoomX which accepts pixel coordinates. This function redraws
 * the graph.
 *
 * @param {number} minDate The minimum date that should be visible.
 * @param {number} maxDate The maximum date that should be visible.
 * @private
 */
Dygraph.prototype.doZoomXDates_ = function (minDate, maxDate) {
  // TODO(danvk): when xAxisRange is null (i.e. "fit to data", the animation
  // can produce strange effects. Rather than the x-axis transitioning slowly
  // between values, it can jerk around.)
  var old_window = this.xAxisRange();
  var new_window = [minDate, maxDate];
  var zoomCallback = this.getFunctionOption('zoomCallback');
  var that = this;
  this.doAnimatedZoom(old_window, new_window, null, null, function animatedZoomCallback() {
    if (zoomCallback) {
      zoomCallback.call(that, minDate, maxDate, that.yAxisRanges());
    }
  });
};

/**
 * Zoom to something containing [lowY, highY]. These are pixel coordinates in
 * the canvas. This function redraws the graph.
 *
 * @param {number} lowY The topmost pixel value that should be visible.
 * @param {number} highY The lowest pixel value that should be visible.
 * @private
 */
Dygraph.prototype.doZoomY_ = function (lowY, highY) {
  this.currentZoomRectArgs_ = null;
  // Find the highest and lowest values in pixel range for each axis.
  // Note that lowY (in pixels) corresponds to the max Value (in data coords).
  // This is because pixels increase as you go down on the screen, whereas data
  // coordinates increase as you go up the screen.
  var oldValueRanges = this.yAxisRanges();
  var newValueRanges = [];
  for (var i = 0; i < this.axes_.length; i++) {
    var hi = this.toDataYCoord(lowY, i);
    var low = this.toDataYCoord(highY, i);
    newValueRanges.push([low, hi]);
  }
  var zoomCallback = this.getFunctionOption('zoomCallback');
  var that = this;
  this.doAnimatedZoom(null, null, oldValueRanges, newValueRanges, function animatedZoomCallback() {
    if (zoomCallback) {
      var _that$xAxisRange = that.xAxisRange(),
        _that$xAxisRange2 = _slicedToArray(_that$xAxisRange, 2),
        minX = _that$xAxisRange2[0],
        maxX = _that$xAxisRange2[1];
      zoomCallback.call(that, minX, maxX, that.yAxisRanges());
    }
  });
};

/**
 * Transition function to use in animations. Returns values between 0.0
 * (totally old values) and 1.0 (totally new values) for each frame.
 * @private
 */
Dygraph.zoomAnimationFunction = function (frame, numFrames) {
  var k = 1.5;
  return (1.0 - Math.pow(k, -frame)) / (1.0 - Math.pow(k, -numFrames));
};

/**
 * Reset the zoom to the original view coordinates. This is the same as
 * double-clicking on the graph.
 */
Dygraph.prototype.resetZoom = function () {
  var dirtyX = this.isZoomed('x');
  var dirtyY = this.isZoomed('y');
  var dirty = dirtyX || dirtyY;

  // Clear any selection, since it's likely to be drawn in the wrong place.
  this.clearSelection();
  if (!dirty) return;

  // Calculate extremes to avoid lack of padding on reset.
  var _this$xAxisExtremes = this.xAxisExtremes(),
    _this$xAxisExtremes2 = _slicedToArray(_this$xAxisExtremes, 2),
    minDate = _this$xAxisExtremes2[0],
    maxDate = _this$xAxisExtremes2[1];
  var animatedZooms = this.getBooleanOption('animatedZooms');
  var zoomCallback = this.getFunctionOption('zoomCallback');

  // TODO(danvk): merge this block w/ the code below.
  // TODO(danvk): factor out a generic, public zoomTo method.
  if (!animatedZooms) {
    this.dateWindow_ = null;
    this.axes_.forEach(function (axis) {
      if (axis.valueRange) delete axis.valueRange;
    });
    this.drawGraph_();
    if (zoomCallback) {
      zoomCallback.call(this, minDate, maxDate, this.yAxisRanges());
    }
    return;
  }
  var oldWindow = null,
    newWindow = null,
    oldValueRanges = null,
    newValueRanges = null;
  if (dirtyX) {
    oldWindow = this.xAxisRange();
    newWindow = [minDate, maxDate];
  }
  if (dirtyY) {
    oldValueRanges = this.yAxisRanges();
    newValueRanges = this.yAxisExtremes();
  }
  var that = this;
  this.doAnimatedZoom(oldWindow, newWindow, oldValueRanges, newValueRanges, function animatedZoomCallback() {
    that.dateWindow_ = null;
    that.axes_.forEach(function (axis) {
      if (axis.valueRange) delete axis.valueRange;
    });
    if (zoomCallback) {
      zoomCallback.call(that, minDate, maxDate, that.yAxisRanges());
    }
  });
};

/**
 * Combined animation logic for all zoom functions.
 * either the x parameters or y parameters may be null.
 * @private
 */
Dygraph.prototype.doAnimatedZoom = function (oldXRange, newXRange, oldYRanges, newYRanges, callback) {
  var steps = this.getBooleanOption("animatedZooms") ? Dygraph.ANIMATION_STEPS : 1;
  var windows = [];
  var valueRanges = [];
  var step, frac;
  if (oldXRange !== null && newXRange !== null) {
    for (step = 1; step <= steps; step++) {
      frac = Dygraph.zoomAnimationFunction(step, steps);
      windows[step - 1] = [oldXRange[0] * (1 - frac) + frac * newXRange[0], oldXRange[1] * (1 - frac) + frac * newXRange[1]];
    }
  }
  if (oldYRanges !== null && newYRanges !== null) {
    for (step = 1; step <= steps; step++) {
      frac = Dygraph.zoomAnimationFunction(step, steps);
      var thisRange = [];
      for (var j = 0; j < this.axes_.length; j++) {
        thisRange.push([oldYRanges[j][0] * (1 - frac) + frac * newYRanges[j][0], oldYRanges[j][1] * (1 - frac) + frac * newYRanges[j][1]]);
      }
      valueRanges[step - 1] = thisRange;
    }
  }
  var that = this;
  utils.repeatAndCleanup(function (step) {
    if (valueRanges.length) {
      for (var i = 0; i < that.axes_.length; i++) {
        var w = valueRanges[step][i];
        that.axes_[i].valueRange = [w[0], w[1]];
      }
    }
    if (windows.length) {
      that.dateWindow_ = windows[step];
    }
    that.drawGraph_();
  }, steps, Dygraph.ANIMATION_DURATION / steps, callback);
};

/**
 * Get the current graph's area object.
 *
 * Returns: {x, y, w, h}
 */
Dygraph.prototype.getArea = function () {
  return this.plotter_.area;
};

/**
 * Convert a mouse event to DOM coordinates relative to the graph origin.
 *
 * Returns a two-element array: [X, Y].
 */
Dygraph.prototype.eventToDomCoords = function (event) {
  if (event.offsetX && event.offsetY) {
    return [event.offsetX, event.offsetY];
  } else {
    var eventElementPos = utils.findPos(this.mouseEventElement_);
    var canvasx = utils.pageX(event) - eventElementPos.x;
    var canvasy = utils.pageY(event) - eventElementPos.y;
    return [canvasx, canvasy];
  }
};

/**
 * Given a canvas X coordinate, find the closest row.
 * @param {number} domX graph-relative DOM X coordinate
 * Returns {number} row number.
 * @private
 */
Dygraph.prototype.findClosestRow = function (domX) {
  var minDistX = Infinity;
  var closestRow = -1;
  var sets = this.layout_.points;
  for (var i = 0; i < sets.length; i++) {
    var points = sets[i];
    var len = points.length;
    for (var j = 0; j < len; j++) {
      var point = points[j];
      if (!utils.isValidPoint(point, true)) continue;
      var dist = Math.abs(point.canvasx - domX);
      if (dist < minDistX) {
        minDistX = dist;
        closestRow = point.idx;
      }
    }
  }
  return closestRow;
};

/**
 * Given canvas X,Y coordinates, find the closest point.
 *
 * This finds the individual data point across all visible series
 * that's closest to the supplied DOM coordinates using the standard
 * Euclidean X,Y distance.
 *
 * @param {number} domX graph-relative DOM X coordinate
 * @param {number} domY graph-relative DOM Y coordinate
 * Returns: {row, seriesName, point}
 * @private
 */
Dygraph.prototype.findClosestPoint = function (domX, domY) {
  var minDist = Infinity;
  var dist, dx, dy, point, closestPoint, closestSeries, closestRow;
  for (var setIdx = this.layout_.points.length - 1; setIdx >= 0; --setIdx) {
    var points = this.layout_.points[setIdx];
    for (var i = 0; i < points.length; ++i) {
      point = points[i];
      if (!utils.isValidPoint(point)) continue;
      dx = point.canvasx - domX;
      dy = point.canvasy - domY;
      dist = dx * dx + dy * dy;
      if (dist < minDist) {
        minDist = dist;
        closestPoint = point;
        closestSeries = setIdx;
        closestRow = point.idx;
      }
    }
  }
  var name = this.layout_.setNames[closestSeries];
  return {
    row: closestRow,
    seriesName: name,
    point: closestPoint
  };
};

/**
 * Given canvas X,Y coordinates, find the touched area in a stacked graph.
 *
 * This first finds the X data point closest to the supplied DOM X coordinate,
 * then finds the series which puts the Y coordinate on top of its filled area,
 * using linear interpolation between adjacent point pairs.
 *
 * @param {number} domX graph-relative DOM X coordinate
 * @param {number} domY graph-relative DOM Y coordinate
 * Returns: {row, seriesName, point}
 * @private
 */
Dygraph.prototype.findStackedPoint = function (domX, domY) {
  var row = this.findClosestRow(domX);
  var closestPoint, closestSeries;
  for (var setIdx = 0; setIdx < this.layout_.points.length; ++setIdx) {
    var boundary = this.getLeftBoundary_(setIdx);
    var rowIdx = row - boundary;
    var points = this.layout_.points[setIdx];
    if (rowIdx >= points.length) continue;
    var p1 = points[rowIdx];
    if (!utils.isValidPoint(p1)) continue;
    var py = p1.canvasy;
    if (domX > p1.canvasx && rowIdx + 1 < points.length) {
      // interpolate series Y value using next point
      var p2 = points[rowIdx + 1];
      if (utils.isValidPoint(p2)) {
        var dx = p2.canvasx - p1.canvasx;
        if (dx > 0) {
          var r = (domX - p1.canvasx) / dx;
          py += r * (p2.canvasy - p1.canvasy);
        }
      }
    } else if (domX < p1.canvasx && rowIdx > 0) {
      // interpolate series Y value using previous point
      var p0 = points[rowIdx - 1];
      if (utils.isValidPoint(p0)) {
        var dx = p1.canvasx - p0.canvasx;
        if (dx > 0) {
          var r = (p1.canvasx - domX) / dx;
          py += r * (p0.canvasy - p1.canvasy);
        }
      }
    }
    // Stop if the point (domX, py) is above this series' upper edge
    if (setIdx === 0 || py < domY) {
      closestPoint = p1;
      closestSeries = setIdx;
    }
  }
  var name = this.layout_.setNames[closestSeries];
  return {
    row: row,
    seriesName: name,
    point: closestPoint
  };
};

/**
 * When the mouse moves in the canvas, display information about a nearby data
 * point and draw dots over those points in the data series. This function
 * takes care of cleanup of previously-drawn dots.
 * @param {Object} event The mousemove event from the browser.
 * @private
 */
Dygraph.prototype.mouseMove_ = function (event) {
  // This prevents JS errors when mousing over the canvas before data loads.
  var points = this.layout_.points;
  if (points === undefined || points === null) return;
  var canvasCoords = this.eventToDomCoords(event);
  var canvasx = canvasCoords[0];
  var canvasy = canvasCoords[1];
  var highlightSeriesOpts = this.getOption("highlightSeriesOpts");
  var selectionChanged = false;
  if (highlightSeriesOpts && !this.isSeriesLocked()) {
    var closest;
    if (this.getBooleanOption("stackedGraph")) {
      closest = this.findStackedPoint(canvasx, canvasy);
    } else {
      closest = this.findClosestPoint(canvasx, canvasy);
    }
    selectionChanged = this.setSelection(closest.row, closest.seriesName);
  } else {
    var idx = this.findClosestRow(canvasx);
    selectionChanged = this.setSelection(idx);
  }
  var callback = this.getFunctionOption("highlightCallback");
  if (callback && selectionChanged) {
    callback.call(this, event, this.lastx_, this.selPoints_, this.lastRow_, this.highlightSet_);
  }
};

/**
 * Fetch left offset from the specified set index or if not passed, the
 * first defined boundaryIds record (see bug #236).
 * @private
 */
Dygraph.prototype.getLeftBoundary_ = function (setIdx) {
  if (this.boundaryIds_[setIdx]) {
    return this.boundaryIds_[setIdx][0];
  } else {
    for (var i = 0; i < this.boundaryIds_.length; i++) {
      if (this.boundaryIds_[i] !== undefined) {
        return this.boundaryIds_[i][0];
      }
    }
    return 0;
  }
};
Dygraph.prototype.animateSelection_ = function (direction) {
  var totalSteps = 10;
  var millis = 30;
  if (this.fadeLevel === undefined) this.fadeLevel = 0;
  if (this.animateId === undefined) this.animateId = 0;
  var start = this.fadeLevel;
  var steps = direction < 0 ? start : totalSteps - start;
  if (steps <= 0) {
    if (this.fadeLevel) {
      this.updateSelection_(1.0);
    }
    return;
  }
  var thisId = ++this.animateId;
  var that = this;
  var cleanupIfClearing = function cleanupIfClearing() {
    // if we haven't reached fadeLevel 0 in the max frame time,
    // ensure that the clear happens and just go to 0
    if (that.fadeLevel !== 0 && direction < 0) {
      that.fadeLevel = 0;
      that.clearSelection();
    }
  };
  utils.repeatAndCleanup(function (n) {
    // ignore simultaneous animations
    if (that.animateId != thisId) return;
    that.fadeLevel += direction;
    if (that.fadeLevel === 0) {
      that.clearSelection();
    } else {
      that.updateSelection_(that.fadeLevel / totalSteps);
    }
  }, steps, millis, cleanupIfClearing);
};

/**
 * Draw dots over the selectied points in the data series. This function
 * takes care of cleanup of previously-drawn dots.
 * @private
 */
Dygraph.prototype.updateSelection_ = function (opt_animFraction) {
  /*var defaultPrevented = */
  this.cascadeEvents_('select', {
    selectedRow: this.lastRow_ === -1 ? undefined : this.lastRow_,
    selectedX: this.lastx_ === null ? undefined : this.lastx_,
    selectedPoints: this.selPoints_
  });
  // TODO(danvk): use defaultPrevented here?

  // Clear the previously drawn vertical, if there is one
  var i;
  var ctx = this.canvas_ctx_;
  if (this.getOption('highlightSeriesOpts')) {
    ctx.clearRect(0, 0, this.width_, this.height_);
    var alpha = 1.0 - this.getNumericOption('highlightSeriesBackgroundAlpha');
    var backgroundColor = utils.toRGB_(this.getOption('highlightSeriesBackgroundColor'));
    if (alpha) {
      // Activating background fade includes an animation effect for a gradual
      // fade. TODO(klausw): make this independently configurable if it causes
      // issues? Use a shared preference to control animations?
      var animateBackgroundFade = this.getBooleanOption('animateBackgroundFade');
      if (animateBackgroundFade) {
        if (opt_animFraction === undefined) {
          // start a new animation
          this.animateSelection_(1);
          return;
        }
        alpha *= opt_animFraction;
      }
      ctx.fillStyle = 'rgba(' + backgroundColor.r + ',' + backgroundColor.g + ',' + backgroundColor.b + ',' + alpha + ')';
      ctx.fillRect(0, 0, this.width_, this.height_);
    }

    // Redraw only the highlighted series in the interactive canvas (not the
    // static plot canvas, which is where series are usually drawn).
    this.plotter_._renderLineChart(this.highlightSet_, ctx);
  } else if (this.previousVerticalX_ >= 0) {
    // Determine the maximum highlight circle size.
    var maxCircleSize = 0;
    var labels = this.attr_('labels');
    for (i = 1; i < labels.length; i++) {
      var r = this.getNumericOption('highlightCircleSize', labels[i]);
      if (r > maxCircleSize) maxCircleSize = r;
    }
    var px = this.previousVerticalX_;
    ctx.clearRect(px - maxCircleSize - 1, 0, 2 * maxCircleSize + 2, this.height_);
  }
  if (this.selPoints_.length > 0) {
    // Draw colored circles over the center of each selected point
    var canvasx = this.selPoints_[0].canvasx;
    ctx.save();
    for (i = 0; i < this.selPoints_.length; i++) {
      var pt = this.selPoints_[i];
      if (isNaN(pt.canvasy)) continue;
      var circleSize = this.getNumericOption('highlightCircleSize', pt.name);
      var callback = this.getFunctionOption("drawHighlightPointCallback", pt.name);
      var color = this.plotter_.colors[pt.name];
      if (!callback) {
        callback = utils.Circles.DEFAULT;
      }
      ctx.lineWidth = this.getNumericOption('strokeWidth', pt.name);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      callback.call(this, this, pt.name, ctx, canvasx, pt.canvasy, color, circleSize, pt.idx);
    }
    ctx.restore();
    this.previousVerticalX_ = canvasx;
  }
};

/**
 * Manually set the selected points and display information about them in the
 * legend. The selection can be cleared using clearSelection() and queried
 * using getSelection().
 *
 * To set a selected series but not a selected point, call setSelection with
 * row=false and the selected series name.
 *
 * @param {number} row Row number that should be highlighted (i.e. appear with
 * hover dots on the chart).
 * @param {seriesName} optional series name to highlight that series with the
 * the highlightSeriesOpts setting.
 * @param {locked} optional If true, keep seriesName selected when mousing
 * over the graph, disabling closest-series highlighting. Call clearSelection()
 * to unlock it.
 * @param {trigger_highlight_callback} optional If true, trigger any
 * user-defined highlightCallback if highlightCallback has been set.
 */
Dygraph.prototype.setSelection = function setSelection(row, opt_seriesName, opt_locked, opt_trigger_highlight_callback) {
  // Extract the points we've selected
  this.selPoints_ = [];
  var changed = false;
  if (row !== false && row >= 0) {
    if (row != this.lastRow_) changed = true;
    this.lastRow_ = row;
    for (var setIdx = 0; setIdx < this.layout_.points.length; ++setIdx) {
      var points = this.layout_.points[setIdx];
      // Check if the point at the appropriate index is the point we're looking
      // for.  If it is, just use it, otherwise search the array for a point
      // in the proper place.
      var setRow = row - this.getLeftBoundary_(setIdx);
      if (setRow >= 0 && setRow < points.length && points[setRow].idx == row) {
        var point = points[setRow];
        if (point.yval !== null) this.selPoints_.push(point);
      } else {
        for (var pointIdx = 0; pointIdx < points.length; ++pointIdx) {
          var point = points[pointIdx];
          if (point.idx == row) {
            if (point.yval !== null) {
              this.selPoints_.push(point);
            }
            break;
          }
        }
      }
    }
  } else {
    if (this.lastRow_ >= 0) changed = true;
    this.lastRow_ = -1;
  }
  if (this.selPoints_.length) {
    this.lastx_ = this.selPoints_[0].xval;
  } else {
    this.lastx_ = null;
  }
  if (opt_seriesName !== undefined) {
    if (this.highlightSet_ !== opt_seriesName) changed = true;
    this.highlightSet_ = opt_seriesName;
  }
  if (opt_locked !== undefined) {
    this.lockedSet_ = opt_locked;
  }
  if (changed) {
    this.updateSelection_(undefined);
    if (opt_trigger_highlight_callback) {
      var callback = this.getFunctionOption("highlightCallback");
      if (callback) {
        var event = {};
        callback.call(this, event, this.lastx_, this.selPoints_, this.lastRow_, this.highlightSet_);
      }
    }
  }
  return changed;
};

/**
 * The mouse has left the canvas. Clear out whatever artifacts remain
 * @param {Object} event the mouseout event from the browser.
 * @private
 */
Dygraph.prototype.mouseOut_ = function (event) {
  if (this.getFunctionOption("unhighlightCallback")) {
    this.getFunctionOption("unhighlightCallback").call(this, event);
  }
  if (this.getBooleanOption("hideOverlayOnMouseOut") && !this.lockedSet_) {
    this.clearSelection();
  }
};

/**
 * Clears the current selection (i.e. points that were highlighted by moving
 * the mouse over the chart).
 */
Dygraph.prototype.clearSelection = function () {
  this.cascadeEvents_('deselect', {});
  this.lockedSet_ = false;
  // Get rid of the overlay data
  if (this.fadeLevel) {
    this.animateSelection_(-1);
    return;
  }
  this.canvas_ctx_.clearRect(0, 0, this.width_, this.height_);
  this.fadeLevel = 0;
  this.selPoints_ = [];
  this.lastx_ = null;
  this.lastRow_ = -1;
  this.highlightSet_ = null;
};

/**
 * Returns the number of the currently selected row. To get data for this row,
 * you can use the getValue method.
 * @return {number} row number, or -1 if nothing is selected
 */
Dygraph.prototype.getSelection = function () {
  if (!this.selPoints_ || this.selPoints_.length < 1) {
    return -1;
  }
  for (var setIdx = 0; setIdx < this.layout_.points.length; setIdx++) {
    var points = this.layout_.points[setIdx];
    for (var row = 0; row < points.length; row++) {
      if (points[row].x == this.selPoints_[0].x) {
        return points[row].idx;
      }
    }
  }
  return -1;
};

/**
 * Returns the name of the currently-highlighted series.
 * Only available when the highlightSeriesOpts option is in use.
 */
Dygraph.prototype.getHighlightSeries = function () {
  return this.highlightSet_;
};

/**
 * Returns true if the currently-highlighted series was locked
 * via setSelection(..., seriesName, true).
 */
Dygraph.prototype.isSeriesLocked = function () {
  return this.lockedSet_;
};

/**
 * Fires when there's data available to be graphed.
 * @param {string} data Raw CSV data to be plotted
 * @private
 */
Dygraph.prototype.loadedEvent_ = function (data) {
  this.rawData_ = this.parseCSV_(data);
  this.cascadeDataDidUpdateEvent_();
  this.predraw_();
};

/**
 * Add ticks on the x-axis representing years, months, quarters, weeks, or days
 * @private
 */
Dygraph.prototype.addXTicks_ = function () {
  // Determine the correct ticks scale on the x-axis: quarterly, monthly, ...
  var range;
  if (this.dateWindow_) {
    range = [this.dateWindow_[0], this.dateWindow_[1]];
  } else {
    range = this.xAxisExtremes();
  }
  var xAxisOptionsView = this.optionsViewForAxis_('x');
  var xTicks = xAxisOptionsView('ticker')(range[0], range[1], this.plotter_.area.w,
  // TODO(danvk): should be area.width
  xAxisOptionsView, this);
  // var msg = 'ticker(' + range[0] + ', ' + range[1] + ', ' + this.width_ + ', ' + this.attr_('pixelsPerXLabel') + ') -> ' + JSON.stringify(xTicks);
  // console.log(msg);
  this.layout_.setXTicks(xTicks);
};

/**
 * Returns the correct handler class for the currently set options.
 * @private
 */
Dygraph.prototype.getHandlerClass_ = function () {
  var handlerClass;
  if (this.attr_('dataHandler')) {
    handlerClass = this.attr_('dataHandler');
  } else if (this.fractions_) {
    if (this.getBooleanOption('errorBars')) {
      handlerClass = _barsFractions["default"];
    } else {
      handlerClass = _defaultFractions["default"];
    }
  } else if (this.getBooleanOption('customBars')) {
    handlerClass = _barsCustom["default"];
  } else if (this.getBooleanOption('errorBars')) {
    handlerClass = _barsError["default"];
  } else {
    handlerClass = _default2["default"];
  }
  return handlerClass;
};

/**
 * @private
 * This function is called once when the chart's data is changed or the options
 * dictionary is updated. It is _not_ called when the user pans or zooms. The
 * idea is that values derived from the chart's data can be computed here,
 * rather than every time the chart is drawn. This includes things like the
 * number of axes, rolling averages, etc.
 */
Dygraph.prototype.predraw_ = function () {
  var start = new Date();

  // Create the correct dataHandler
  this.dataHandler_ = new (this.getHandlerClass_())();
  this.layout_.computePlotArea();

  // TODO(danvk): move more computations out of drawGraph_ and into here.
  this.computeYAxes_();
  if (!this.is_initial_draw_) {
    this.canvas_ctx_.restore();
    this.hidden_ctx_.restore();
  }
  this.canvas_ctx_.save();
  this.hidden_ctx_.save();

  // Create a new plotter.
  this.plotter_ = new _dygraphCanvas["default"](this, this.hidden_, this.hidden_ctx_, this.layout_);

  // The roller sits in the bottom left corner of the chart. We don't know where
  // this will be until the options are available, so it's positioned here.
  this.createRollInterface_();
  this.cascadeEvents_('predraw');

  // Convert the raw data (a 2D array) into the internal format and compute
  // rolling averages.
  this.rolledSeries_ = [null]; // x-axis is the first series and it's special
  for (var i = 1; i < this.numColumns(); i++) {
    // var logScale = this.attr_('logscale', i); // TODO(klausw): this looks wrong // konigsberg thinks so too.
    var series = this.dataHandler_.extractSeries(this.rawData_, i, this.attributes_);
    if (this.rollPeriod_ > 1) {
      series = this.dataHandler_.rollingAverage(series, this.rollPeriod_, this.attributes_, i);
    }
    this.rolledSeries_.push(series);
  }

  // If the data or options have changed, then we'd better redraw.
  this.drawGraph_();

  // This is used to determine whether to do various animations.
  var end = new Date();
  this.drawingTimeMs_ = end - start;
};

/**
 * Point structure.
 *
 * xval_* and yval_* are the original unscaled data values,
 * while x_* and y_* are scaled to the range (0.0-1.0) for plotting.
 * yval_stacked is the cumulative Y value used for stacking graphs,
 * and bottom/top/minus/plus are used for high/low band graphs.
 *
 * @typedef {{
 *     idx: number,
 *     name: string,
 *     x: ?number,
 *     xval: ?number,
 *     y_bottom: ?number,
 *     y: ?number,
 *     y_stacked: ?number,
 *     y_top: ?number,
 *     yval_minus: ?number,
 *     yval: ?number,
 *     yval_plus: ?number,
 *     yval_stacked
 * }}
 */
Dygraph.PointType = undefined;

/**
 * Calculates point stacking for stackedGraph=true.
 *
 * For stacking purposes, interpolate or extend neighboring data across
 * NaN values based on stackedGraphNaNFill settings. This is for display
 * only, the underlying data value as shown in the legend remains NaN.
 *
 * @param {Array.<Dygraph.PointType>} points Point array for a single series.
 *     Updates each Point's yval_stacked property.
 * @param {Array.<number>} cumulativeYval Accumulated top-of-graph stacked Y
 *     values for the series seen so far. Index is the row number. Updated
 *     based on the current series's values.
 * @param {Array.<number>} seriesExtremes Min and max values, updated
 *     to reflect the stacked values.
 * @param {string} fillMethod Interpolation method, one of 'all', 'inside', or
 *     'none'.
 * @private
 */
Dygraph.stackPoints_ = function (points, cumulativeYval, seriesExtremes, fillMethod) {
  var lastXval = null;
  var prevPoint = null;
  var nextPoint = null;
  var nextPointIdx = -1;

  // Find the next stackable point starting from the given index.
  var updateNextPoint = function updateNextPoint(idx) {
    // If we've previously found a non-NaN point and haven't gone past it yet,
    // just use that.
    if (nextPointIdx >= idx) return;

    // We haven't found a non-NaN point yet or have moved past it,
    // look towards the right to find a non-NaN point.
    for (var j = idx; j < points.length; ++j) {
      // Clear out a previously-found point (if any) since it's no longer
      // valid, we shouldn't use it for interpolation anymore.
      nextPoint = null;
      if (!isNaN(points[j].yval) && points[j].yval !== null) {
        nextPointIdx = j;
        nextPoint = points[j];
        break;
      }
    }
  };
  for (var i = 0; i < points.length; ++i) {
    var point = points[i];
    var xval = point.xval;
    if (cumulativeYval[xval] === undefined) {
      cumulativeYval[xval] = 0;
    }
    var actualYval = point.yval;
    if (isNaN(actualYval) || actualYval === null) {
      if (fillMethod == 'none') {
        actualYval = 0;
      } else {
        // Interpolate/extend for stacking purposes if possible.
        updateNextPoint(i);
        if (prevPoint && nextPoint && fillMethod != 'none') {
          // Use linear interpolation between prevPoint and nextPoint.
          actualYval = prevPoint.yval + (nextPoint.yval - prevPoint.yval) * ((xval - prevPoint.xval) / (nextPoint.xval - prevPoint.xval));
        } else if (prevPoint && fillMethod == 'all') {
          actualYval = prevPoint.yval;
        } else if (nextPoint && fillMethod == 'all') {
          actualYval = nextPoint.yval;
        } else {
          actualYval = 0;
        }
      }
    } else {
      prevPoint = point;
    }
    var stackedYval = cumulativeYval[xval];
    if (lastXval != xval) {
      // If an x-value is repeated, we ignore the duplicates.
      stackedYval += actualYval;
      cumulativeYval[xval] = stackedYval;
    }
    lastXval = xval;
    point.yval_stacked = stackedYval;
    if (stackedYval > seriesExtremes[1]) {
      seriesExtremes[1] = stackedYval;
    }
    if (stackedYval < seriesExtremes[0]) {
      seriesExtremes[0] = stackedYval;
    }
  }
};

/**
 * Loop over all fields and create datasets, calculating extreme y-values for
 * each series and extreme x-indices as we go.
 *
 * dateWindow is passed in as an explicit parameter so that we can compute
 * extreme values "speculatively", i.e. without actually setting state on the
 * dygraph.
 *
 * @param {Array.<Array.<Array.<(number|Array<number>)>>} rolledSeries, where
 *     rolledSeries[seriesIndex][row] = raw point, where
 *     seriesIndex is the column number starting with 1, and
 *     rawPoint is [x,y] or [x, [y, err]] or [x, [y, yminus, yplus]].
 * @param {?Array.<number>} dateWindow [xmin, xmax] pair, or null.
 * @return {{
 *     points: Array.<Array.<Dygraph.PointType>>,
 *     seriesExtremes: Array.<Array.<number>>,
 *     boundaryIds: Array.<number>}}
 * @private
 */
Dygraph.prototype.gatherDatasets_ = function (rolledSeries, dateWindow) {
  var boundaryIds = [];
  var points = [];
  var cumulativeYval = []; // For stacked series.
  var extremes = {}; // series name -> [low, high]
  var seriesIdx, sampleIdx;
  var firstIdx, lastIdx;
  var axisIdx;

  // Loop over the fields (series).  Go from the last to the first,
  // because if they're stacked that's how we accumulate the values.
  var num_series = rolledSeries.length - 1;
  var series;
  for (seriesIdx = num_series; seriesIdx >= 1; seriesIdx--) {
    if (!this.visibility()[seriesIdx - 1]) continue;

    // Prune down to the desired range, if necessary (for zooming)
    // Because there can be lines going to points outside of the visible area,
    // we actually prune to visible points, plus one on either side.
    if (dateWindow) {
      series = rolledSeries[seriesIdx];
      var low = dateWindow[0];
      var high = dateWindow[1];

      // TODO(danvk): do binary search instead of linear search.
      // TODO(danvk): pass firstIdx and lastIdx directly to the renderer.
      firstIdx = null;
      lastIdx = null;
      for (sampleIdx = 0; sampleIdx < series.length; sampleIdx++) {
        if (series[sampleIdx][0] >= low && firstIdx === null) {
          firstIdx = sampleIdx;
        }
        if (series[sampleIdx][0] <= high) {
          lastIdx = sampleIdx;
        }
      }
      if (firstIdx === null) firstIdx = 0;
      var correctedFirstIdx = firstIdx;
      var isInvalidValue = true;
      while (isInvalidValue && correctedFirstIdx > 0) {
        correctedFirstIdx--;
        // check if the y value is null.
        isInvalidValue = series[correctedFirstIdx][1] === null;
      }
      if (lastIdx === null) lastIdx = series.length - 1;
      var correctedLastIdx = lastIdx;
      isInvalidValue = true;
      while (isInvalidValue && correctedLastIdx < series.length - 1) {
        correctedLastIdx++;
        isInvalidValue = series[correctedLastIdx][1] === null;
      }
      if (correctedFirstIdx !== firstIdx) {
        firstIdx = correctedFirstIdx;
      }
      if (correctedLastIdx !== lastIdx) {
        lastIdx = correctedLastIdx;
      }
      boundaryIds[seriesIdx - 1] = [firstIdx, lastIdx];

      // .slice's end is exclusive, we want to include lastIdx.
      series = series.slice(firstIdx, lastIdx + 1);
    } else {
      series = rolledSeries[seriesIdx];
      boundaryIds[seriesIdx - 1] = [0, series.length - 1];
    }
    var seriesName = this.attr_("labels")[seriesIdx];
    var seriesExtremes = this.dataHandler_.getExtremeYValues(series, dateWindow, this.getBooleanOption("stepPlot", seriesName));
    var seriesPoints = this.dataHandler_.seriesToPoints(series, seriesName, boundaryIds[seriesIdx - 1][0]);
    if (this.getBooleanOption("stackedGraph")) {
      axisIdx = this.attributes_.axisForSeries(seriesName);
      if (cumulativeYval[axisIdx] === undefined) {
        cumulativeYval[axisIdx] = [];
      }
      Dygraph.stackPoints_(seriesPoints, cumulativeYval[axisIdx], seriesExtremes, this.getBooleanOption("stackedGraphNaNFill"));
    }
    extremes[seriesName] = seriesExtremes;
    points[seriesIdx] = seriesPoints;
  }
  return {
    points: points,
    extremes: extremes,
    boundaryIds: boundaryIds
  };
};

/**
 * Update the graph with new data. This method is called when the viewing area
 * has changed. If the underlying data or options have changed, predraw_ will
 * be called before drawGraph_ is called.
 *
 * @private
 */
Dygraph.prototype.drawGraph_ = function () {
  var start = new Date();

  // This is used to set the second parameter to drawCallback, below.
  var is_initial_draw = this.is_initial_draw_;
  this.is_initial_draw_ = false;
  this.layout_.removeAllDatasets();
  this.setColors_();
  this.attrs_.pointSize = 0.5 * this.getNumericOption('highlightCircleSize');
  var packed = this.gatherDatasets_(this.rolledSeries_, this.dateWindow_);
  var points = packed.points;
  var extremes = packed.extremes;
  this.boundaryIds_ = packed.boundaryIds;
  this.setIndexByName_ = {};
  var labels = this.attr_("labels");
  var dataIdx = 0;
  for (var i = 1; i < points.length; i++) {
    if (!this.visibility()[i - 1]) continue;
    this.layout_.addDataset(labels[i], points[i]);
    this.datasetIndex_[i] = dataIdx++;
  }
  for (var i = 0; i < labels.length; i++) {
    this.setIndexByName_[labels[i]] = i;
  }
  this.computeYAxisRanges_(extremes);
  this.layout_.setYAxes(this.axes_);
  this.addXTicks_();

  // Tell PlotKit to use this new data and render itself
  this.layout_.evaluate();
  this.renderGraph_(is_initial_draw);
  if (this.getStringOption("timingName")) {
    var end = new Date();
    console.log(this.getStringOption("timingName") + " - drawGraph: " + (end - start) + "ms");
  }
};

/**
 * This does the work of drawing the chart. It assumes that the layout and axis
 * scales have already been set (e.g. by predraw_).
 *
 * @private
 */
Dygraph.prototype.renderGraph_ = function (is_initial_draw) {
  this.cascadeEvents_('clearChart');
  this.plotter_.clear();
  var underlayCallback = this.getFunctionOption('underlayCallback');
  if (underlayCallback) {
    // NOTE: we pass the dygraph object to this callback twice to avoid breaking
    // users who expect a deprecated form of this callback.
    underlayCallback.call(this, this.hidden_ctx_, this.layout_.getPlotArea(), this, this);
  }
  var e = {
    canvas: this.hidden_,
    drawingContext: this.hidden_ctx_
  };
  this.cascadeEvents_('willDrawChart', e);
  this.plotter_.render();
  this.cascadeEvents_('didDrawChart', e);
  this.lastRow_ = -1; // because plugins/legend.js clears the legend

  // TODO(danvk): is this a performance bottleneck when panning?
  // The interaction canvas should already be empty in that situation.
  this.canvas_.getContext('2d').clearRect(0, 0, this.width_, this.height_);
  var drawCallback = this.getFunctionOption("drawCallback");
  if (drawCallback !== null) {
    drawCallback.call(this, this, is_initial_draw);
  }
  if (is_initial_draw) {
    this.readyFired_ = true;
    while (this.readyFns_.length > 0) {
      var fn = this.readyFns_.pop();
      fn(this);
    }
  }
};

/**
 * @private
 * Determine properties of the y-axes which are independent of the data
 * currently being displayed. This includes things like the number of axes and
 * the style of the axes. It does not include the range of each axis and its
 * tick marks.
 * This fills in this.axes_.
 * axes_ = [ { options } ]
 *   indices are into the axes_ array.
 */
Dygraph.prototype.computeYAxes_ = function () {
  var axis, index, opts, v;

  // this.axes_ doesn't match this.attributes_.axes_.options. It's used for
  // data computation as well as options storage.
  // Go through once and add all the axes.
  this.axes_ = [];
  for (axis = 0; axis < this.attributes_.numAxes(); axis++) {
    // Add a new axis, making a copy of its per-axis options.
    opts = {
      g: this
    };
    utils.update(opts, this.attributes_.axisOptions(axis));
    this.axes_[axis] = opts;
  }
  for (axis = 0; axis < this.axes_.length; axis++) {
    if (axis === 0) {
      opts = this.optionsViewForAxis_('y' + (axis ? '2' : ''));
      v = opts("valueRange");
      if (v) this.axes_[axis].valueRange = v;
    } else {
      // To keep old behavior
      var axes = this.user_attrs_.axes;
      if (axes && axes.y2) {
        v = axes.y2.valueRange;
        if (v) this.axes_[axis].valueRange = v;
      }
    }
  }
};

/**
 * Returns the number of y-axes on the chart.
 * @return {number} the number of axes.
 */
Dygraph.prototype.numAxes = function () {
  return this.attributes_.numAxes();
};

/**
 * @private
 * Returns axis properties for the given series.
 * @param {string} setName The name of the series for which to get axis
 * properties, e.g. 'Y1'.
 * @return {Object} The axis properties.
 */
Dygraph.prototype.axisPropertiesForSeries = function (series) {
  // TODO(danvk): handle errors.
  return this.axes_[this.attributes_.axisForSeries(series)];
};

/**
 * @private
 * Determine the value range and tick marks for each axis.
 * @param {Object} extremes A mapping from seriesName -> [low, high]
 * This fills in the valueRange and ticks fields in each entry of this.axes_.
 */
Dygraph.prototype.computeYAxisRanges_ = function (extremes) {
  var isNullUndefinedOrNaN = function isNullUndefinedOrNaN(num) {
    return isNaN(parseFloat(num));
  };
  var numAxes = this.attributes_.numAxes();
  var ypadCompat, span, series, ypad;
  var p_axis;

  // Compute extreme values, a span and tick marks for each axis.
  for (var i = 0; i < numAxes; i++) {
    var axis = this.axes_[i];
    var logscale = this.attributes_.getForAxis("logscale", i);
    var includeZero = this.attributes_.getForAxis("includeZero", i);
    var independentTicks = this.attributes_.getForAxis("independentTicks", i);
    series = this.attributes_.seriesForAxis(i);

    // Add some padding. This supports two Y padding operation modes:
    //
    // - backwards compatible (yRangePad not set):
    //   10% padding for automatic Y ranges, but not for user-supplied
    //   ranges, and move a close-to-zero edge to zero, since drawing at the edge
    //   results in invisible lines. Unfortunately lines drawn at the edge of a
    //   user-supplied range will still be invisible. If logscale is
    //   set, add a variable amount of padding at the top but
    //   none at the bottom.
    //
    // - new-style (yRangePad set by the user):
    //   always add the specified Y padding.
    //
    ypadCompat = true;
    ypad = 0.1; // add 10%
    var yRangePad = this.getNumericOption('yRangePad');
    if (yRangePad !== null) {
      ypadCompat = false;
      // Convert pixel padding to ratio
      ypad = yRangePad / this.plotter_.area.h;
    }
    if (series.length === 0) {
      // If no series are defined or visible then use a reasonable default
      axis.extremeRange = [0, 1];
    } else {
      // Calculate the extremes of extremes.
      var minY = Infinity; // extremes[series[0]][0];
      var maxY = -Infinity; // extremes[series[0]][1];
      var extremeMinY, extremeMaxY;
      for (var j = 0; j < series.length; j++) {
        // this skips invisible series
        if (!extremes.hasOwnProperty(series[j])) continue;

        // Only use valid extremes to stop null data series' from corrupting the scale.
        extremeMinY = extremes[series[j]][0];
        if (extremeMinY !== null) {
          minY = Math.min(extremeMinY, minY);
        }
        extremeMaxY = extremes[series[j]][1];
        if (extremeMaxY !== null) {
          maxY = Math.max(extremeMaxY, maxY);
        }
      }

      // Include zero if requested by the user.
      if (includeZero && !logscale) {
        if (minY > 0) minY = 0;
        if (maxY < 0) maxY = 0;
      }

      // Ensure we have a valid scale, otherwise default to [0, 1] for safety.
      if (minY == Infinity) minY = 0;
      if (maxY == -Infinity) maxY = 1;
      span = maxY - minY;
      // special case: if we have no sense of scale, center on the sole value.
      if (span === 0) {
        if (maxY !== 0) {
          span = Math.abs(maxY);
        } else {
          // ... and if the sole value is zero, use range 0-1.
          maxY = 1;
          span = 1;
        }
      }
      var maxAxisY = maxY,
        minAxisY = minY;
      if (ypadCompat) {
        if (logscale) {
          maxAxisY = maxY + ypad * span;
          minAxisY = minY;
        } else {
          maxAxisY = maxY + ypad * span;
          minAxisY = minY - ypad * span;

          // Backwards-compatible behavior: Move the span to start or end at zero if it's
          // close to zero.
          if (minAxisY < 0 && minY >= 0) minAxisY = 0;
          if (maxAxisY > 0 && maxY <= 0) maxAxisY = 0;
        }
      }
      axis.extremeRange = [minAxisY, maxAxisY];
    }
    if (axis.valueRange) {
      // This is a user-set value range for this axis.
      var y0 = isNullUndefinedOrNaN(axis.valueRange[0]) ? axis.extremeRange[0] : axis.valueRange[0];
      var y1 = isNullUndefinedOrNaN(axis.valueRange[1]) ? axis.extremeRange[1] : axis.valueRange[1];
      axis.computedValueRange = [y0, y1];
    } else {
      axis.computedValueRange = axis.extremeRange;
    }
    if (!ypadCompat) {
      // When using yRangePad, adjust the upper/lower bounds to add
      // padding unless the user has zoomed/panned the Y axis range.

      y0 = axis.computedValueRange[0];
      y1 = axis.computedValueRange[1];

      // special case #781: if we have no sense of scale, center on the sole value.
      if (y0 === y1) {
        if (y0 === 0) {
          y1 = 1;
        } else {
          var delta = Math.abs(y0 / 10);
          y0 -= delta;
          y1 += delta;
        }
      }
      if (logscale) {
        var y0pct = ypad / (2 * ypad - 1);
        var y1pct = (ypad - 1) / (2 * ypad - 1);
        axis.computedValueRange[0] = utils.logRangeFraction(y0, y1, y0pct);
        axis.computedValueRange[1] = utils.logRangeFraction(y0, y1, y1pct);
      } else {
        span = y1 - y0;
        axis.computedValueRange[0] = y0 - span * ypad;
        axis.computedValueRange[1] = y1 + span * ypad;
      }
    }
    if (independentTicks) {
      axis.independentTicks = independentTicks;
      var opts = this.optionsViewForAxis_('y' + (i ? '2' : ''));
      var ticker = opts('ticker');
      axis.ticks = ticker(axis.computedValueRange[0], axis.computedValueRange[1], this.plotter_.area.h, opts, this);
      // Define the first independent axis as primary axis.
      if (!p_axis) p_axis = axis;
    }
  }
  if (p_axis === undefined) {
    throw "Configuration Error: At least one axis has to have the \"independentTicks\" option activated.";
  }
  // Add ticks. By default, all axes inherit the tick positions of the
  // primary axis. However, if an axis is specifically marked as having
  // independent ticks, then that is permissible as well.
  for (var i = 0; i < numAxes; i++) {
    var axis = this.axes_[i];
    if (!axis.independentTicks) {
      var opts = this.optionsViewForAxis_('y' + (i ? '2' : ''));
      var ticker = opts('ticker');
      var p_ticks = p_axis.ticks;
      var p_scale = p_axis.computedValueRange[1] - p_axis.computedValueRange[0];
      var scale = axis.computedValueRange[1] - axis.computedValueRange[0];
      var tick_values = [];
      for (var k = 0; k < p_ticks.length; k++) {
        var y_frac = (p_ticks[k].v - p_axis.computedValueRange[0]) / p_scale;
        var y_val = axis.computedValueRange[0] + y_frac * scale;
        tick_values.push(y_val);
      }
      axis.ticks = ticker(axis.computedValueRange[0], axis.computedValueRange[1], this.plotter_.area.h, opts, this, tick_values);
    }
  }
};

/**
 * Detects the type of the str (date or numeric) and sets the various
 * formatting attributes in this.attrs_ based on this type.
 * @param {string} str An x value.
 * @private
 */
Dygraph.prototype.detectTypeFromString_ = function (str) {
  var isDate = false;
  var dashPos = str.indexOf('-'); // could be 2006-01-01 _or_ 1.0e-2
  if (dashPos > 0 && str[dashPos - 1] != 'e' && str[dashPos - 1] != 'E' || str.indexOf('/') >= 0 || isNaN(parseFloat(str))) {
    isDate = true;
  }
  this.setXAxisOptions_(isDate);
};
Dygraph.prototype.setXAxisOptions_ = function (isDate) {
  if (isDate) {
    this.attrs_.xValueParser = utils.dateParser;
    this.attrs_.axes.x.valueFormatter = utils.dateValueFormatter;
    this.attrs_.axes.x.ticker = DygraphTickers.dateTicker;
    this.attrs_.axes.x.axisLabelFormatter = utils.dateAxisLabelFormatter;
  } else {
    /** @private (shut up, jsdoc!) */
    this.attrs_.xValueParser = function (x) {
      return parseFloat(x);
    };
    // TODO(danvk): use Dygraph.numberValueFormatter here?
    /** @private (shut up, jsdoc!) */
    this.attrs_.axes.x.valueFormatter = function (x) {
      return x;
    };
    this.attrs_.axes.x.ticker = DygraphTickers.numericTicks;
    this.attrs_.axes.x.axisLabelFormatter = this.attrs_.axes.x.valueFormatter;
  }
};

/**
 * @private
 * Parses a string in a special csv format.  We expect a csv file where each
 * line is a date point, and the first field in each line is the date string.
 * We also expect that all remaining fields represent series.
 * if the errorBars attribute is set, then interpret the fields as:
 * date, series1, stddev1, series2, stddev2, ...
 * @param {[Object]} data See above.
 *
 * @return [Object] An array with one entry for each row. These entries
 * are an array of cells in that row. The first entry is the parsed x-value for
 * the row. The second, third, etc. are the y-values. These can take on one of
 * three forms, depending on the CSV and constructor parameters:
 * 1. numeric value
 * 2. [ value, stddev ]
 * 3. [ low value, center value, high value ]
 */
Dygraph.prototype.parseCSV_ = function (data) {
  var ret = [];
  var line_delimiter = utils.detectLineDelimiter(data);
  var lines = data.split(line_delimiter || "\n");
  var vals, j;

  // Use the default delimiter or fall back to a tab if that makes sense.
  var delim = this.getStringOption('delimiter');
  if (lines[0].indexOf(delim) == -1 && lines[0].indexOf('\t') >= 0) {
    delim = '\t';
  }
  var start = 0;
  if (!('labels' in this.user_attrs_)) {
    // User hasn't explicitly set labels, so they're (presumably) in the CSV.
    start = 1;
    this.attrs_.labels = lines[0].split(delim); // NOTE: _not_ user_attrs_.
    this.attributes_.reparseSeries();
  }
  var line_no = 0;
  var xParser;
  var defaultParserSet = false; // attempt to auto-detect x value type
  var expectedCols = this.attr_("labels").length;
  var outOfOrder = false;
  for (var i = start; i < lines.length; i++) {
    var line = lines[i];
    line_no = i;
    if (line.length === 0) continue; // skip blank lines
    if (line[0] == '#') continue; // skip comment lines
    var inFields = line.split(delim);
    if (inFields.length < 2) continue;
    var fields = [];
    if (!defaultParserSet) {
      this.detectTypeFromString_(inFields[0]);
      xParser = this.getFunctionOption("xValueParser");
      defaultParserSet = true;
    }
    fields[0] = xParser(inFields[0], this);

    // If fractions are expected, parse the numbers as "A/B"
    if (this.fractions_) {
      for (j = 1; j < inFields.length; j++) {
        // TODO(danvk): figure out an appropriate way to flag parse errors.
        vals = inFields[j].split("/");
        if (vals.length != 2) {
          console.error('Expected fractional "num/den" values in CSV data ' + "but found a value '" + inFields[j] + "' on line " + (1 + i) + " ('" + line + "') which is not of this form.");
          fields[j] = [0, 0];
        } else {
          fields[j] = [utils.parseFloat_(vals[0], i, line), utils.parseFloat_(vals[1], i, line)];
        }
      }
    } else if (this.getBooleanOption("errorBars")) {
      // If there are sigma-based high/low bands, values are (value, stddev) pairs
      if (inFields.length % 2 != 1) {
        console.error('Expected alternating (value, stdev.) pairs in CSV data ' + 'but line ' + (1 + i) + ' has an odd number of values (' + (inFields.length - 1) + "): '" + line + "'");
      }
      for (j = 1; j < inFields.length; j += 2) {
        fields[(j + 1) / 2] = [utils.parseFloat_(inFields[j], i, line), utils.parseFloat_(inFields[j + 1], i, line)];
      }
    } else if (this.getBooleanOption("customBars")) {
      // Custom high/low bands are a low;centre;high tuple
      for (j = 1; j < inFields.length; j++) {
        var val = inFields[j];
        if (/^ *$/.test(val)) {
          fields[j] = [null, null, null];
        } else {
          vals = val.split(";");
          if (vals.length == 3) {
            fields[j] = [utils.parseFloat_(vals[0], i, line), utils.parseFloat_(vals[1], i, line), utils.parseFloat_(vals[2], i, line)];
          } else {
            console.warn('When using customBars, values must be either blank ' + 'or "low;center;high" tuples (got "' + val + '" on line ' + (1 + i) + ')');
          }
        }
      }
    } else {
      // Values are just numbers
      for (j = 1; j < inFields.length; j++) {
        fields[j] = utils.parseFloat_(inFields[j], i, line);
      }
    }
    if (ret.length > 0 && fields[0] < ret[ret.length - 1][0]) {
      outOfOrder = true;
    }
    if (fields.length != expectedCols) {
      console.error("Number of columns in line " + i + " (" + fields.length + ") does not agree with number of labels (" + expectedCols + ") " + line);
    }

    // If the user specified the 'labels' option and none of the cells of the
    // first row parsed correctly, then they probably double-specified the
    // labels. We go with the values set in the option, discard this row and
    // log a warning to the JS console.
    if (i === 0 && this.attr_('labels')) {
      var all_null = true;
      for (j = 0; all_null && j < fields.length; j++) {
        if (fields[j]) all_null = false;
      }
      if (all_null) {
        console.warn("The dygraphs 'labels' option is set, but the first row " + "of CSV data ('" + line + "') appears to also contain " + "labels. Will drop the CSV labels and use the option " + "labels.");
        continue;
      }
    }
    ret.push(fields);
  }
  if (outOfOrder) {
    console.warn("CSV is out of order; order it correctly to speed loading.");
    ret.sort(function (a, b) {
      return a[0] - b[0];
    });
  }
  return ret;
};

// In native format, all values must be dates or numbers.
// This check isn't perfect but will catch most mistaken uses of strings.
function validateNativeFormat(data) {
  var firstRow = data[0];
  var firstX = firstRow[0];
  if (typeof firstX !== 'number' && !utils.isDateLike(firstX)) {
    throw new Error("Expected number or date but got ".concat(typeof firstX, ": ").concat(firstX, "."));
  }
  for (var i = 1; i < firstRow.length; i++) {
    var val = firstRow[i];
    if (val === null || val === undefined) continue;
    if (typeof val === 'number') continue;
    if (utils.isArrayLike(val)) continue; // e.g. errorBars or customBars
    throw new Error("Expected number or array but got ".concat(typeof val, ": ").concat(val, "."));
  }
}

/**
 * The user has provided their data as a pre-packaged JS array. If the x values
 * are numeric, this is the same as dygraphs' internal format. If the x values
 * are dates, we need to convert them from Date objects to ms since epoch.
 * @param {!Array} data
 * @return {Object} data with numeric x values.
 * @private
 */
Dygraph.prototype.parseArray_ = function (data) {
  // Peek at the first x value to see if it's numeric.
  if (data.length === 0) {
    data = [[0]];
  }
  if (data[0].length === 0) {
    console.error("Data set cannot contain an empty row");
    return null;
  }
  validateNativeFormat(data);
  var i;
  if (this.attr_("labels") === null) {
    console.warn("Using default labels. Set labels explicitly via 'labels' " + "in the options parameter");
    this.attrs_.labels = ["X"];
    for (i = 1; i < data[0].length; i++) {
      this.attrs_.labels.push("Y" + i); // Not user_attrs_.
    }

    this.attributes_.reparseSeries();
  } else {
    var num_labels = this.attr_("labels");
    if (num_labels.length != data[0].length) {
      console.error("Mismatch between number of labels (" + num_labels + ")" + " and number of columns in array (" + data[0].length + ")");
      return null;
    }
  }
  if (utils.isDateLike(data[0][0])) {
    // Some intelligent defaults for a date x-axis.
    this.attrs_.axes.x.valueFormatter = utils.dateValueFormatter;
    this.attrs_.axes.x.ticker = DygraphTickers.dateTicker;
    this.attrs_.axes.x.axisLabelFormatter = utils.dateAxisLabelFormatter;

    // Assume they're all dates.
    var parsedData = utils.clone(data);
    for (i = 0; i < data.length; i++) {
      if (parsedData[i].length === 0) {
        console.error("Row " + (1 + i) + " of data is empty");
        return null;
      }
      if (parsedData[i][0] === null || typeof parsedData[i][0].getTime != 'function' || isNaN(parsedData[i][0].getTime())) {
        console.error("x value in row " + (1 + i) + " is not a Date");
        return null;
      }
      parsedData[i][0] = parsedData[i][0].getTime();
    }
    return parsedData;
  } else {
    // Some intelligent defaults for a numeric x-axis.
    /** @private (shut up, jsdoc!) */
    this.attrs_.axes.x.valueFormatter = function (x) {
      return x;
    };
    this.attrs_.axes.x.ticker = DygraphTickers.numericTicks;
    this.attrs_.axes.x.axisLabelFormatter = utils.numberAxisLabelFormatter;
    return data;
  }
};

/**
 * Parses a DataTable object from gviz.
 * The data is expected to have a first column that is either a date or a
 * number. All subsequent columns must be numbers. If there is a clear mismatch
 * between this.xValueParser_ and the type of the first column, it will be
 * fixed. Fills out rawData_.
 * @param {!google.visualization.DataTable} data See above.
 * @private
 */
Dygraph.prototype.parseDataTable_ = function (data) {
  var shortTextForAnnotationNum = function shortTextForAnnotationNum(num) {
    // converts [0-9]+ [A-Z][a-z]*
    // example: 0=A, 1=B, 25=Z, 26=Aa, 27=Ab
    // and continues like.. Ba Bb .. Za .. Zz..Aaa...Zzz Aaaa Zzzz
    var shortText = String.fromCharCode(65 /* A */ + num % 26);
    num = Math.floor(num / 26);
    while (num > 0) {
      shortText = String.fromCharCode(65 /* A */ + (num - 1) % 26) + shortText.toLowerCase();
      num = Math.floor((num - 1) / 26);
    }
    return shortText;
  };
  var cols = data.getNumberOfColumns();
  var rows = data.getNumberOfRows();
  var indepType = data.getColumnType(0);
  if (indepType == 'date' || indepType == 'datetime') {
    this.attrs_.xValueParser = utils.dateParser;
    this.attrs_.axes.x.valueFormatter = utils.dateValueFormatter;
    this.attrs_.axes.x.ticker = DygraphTickers.dateTicker;
    this.attrs_.axes.x.axisLabelFormatter = utils.dateAxisLabelFormatter;
  } else if (indepType == 'number') {
    this.attrs_.xValueParser = function (x) {
      return parseFloat(x);
    };
    this.attrs_.axes.x.valueFormatter = function (x) {
      return x;
    };
    this.attrs_.axes.x.ticker = DygraphTickers.numericTicks;
    this.attrs_.axes.x.axisLabelFormatter = this.attrs_.axes.x.valueFormatter;
  } else {
    throw new Error("only 'date', 'datetime' and 'number' types are supported " + "for column 1 of DataTable input (Got '" + indepType + "')");
  }

  // Array of the column indices which contain data (and not annotations).
  var colIdx = [];
  var annotationCols = {}; // data index -> [annotation cols]
  var hasAnnotations = false;
  var i, j;
  for (i = 1; i < cols; i++) {
    var type = data.getColumnType(i);
    if (type == 'number') {
      colIdx.push(i);
    } else if (type == 'string' && this.getBooleanOption('displayAnnotations')) {
      // This is OK -- it's an annotation column.
      var dataIdx = colIdx[colIdx.length - 1];
      if (!annotationCols.hasOwnProperty(dataIdx)) {
        annotationCols[dataIdx] = [i];
      } else {
        annotationCols[dataIdx].push(i);
      }
      hasAnnotations = true;
    } else {
      throw new Error("Only 'number' is supported as a dependent type with Gviz." + " 'string' is only supported if displayAnnotations is true");
    }
  }

  // Read column labels
  // TODO(danvk): add support back for errorBars
  var labels = [data.getColumnLabel(0)];
  for (i = 0; i < colIdx.length; i++) {
    labels.push(data.getColumnLabel(colIdx[i]));
    if (this.getBooleanOption("errorBars")) i += 1;
  }
  this.attrs_.labels = labels;
  cols = labels.length;
  var ret = [];
  var outOfOrder = false;
  var annotations = [];
  for (i = 0; i < rows; i++) {
    var row = [];
    if (typeof data.getValue(i, 0) === 'undefined' || data.getValue(i, 0) === null) {
      console.warn("Ignoring row " + i + " of DataTable because of undefined or null first column.");
      continue;
    }
    if (indepType == 'date' || indepType == 'datetime') {
      row.push(data.getValue(i, 0).getTime());
    } else {
      row.push(data.getValue(i, 0));
    }
    if (!this.getBooleanOption("errorBars")) {
      for (j = 0; j < colIdx.length; j++) {
        var col = colIdx[j];
        row.push(data.getValue(i, col));
        if (hasAnnotations && annotationCols.hasOwnProperty(col) && data.getValue(i, annotationCols[col][0]) !== null) {
          var ann = {};
          ann.series = data.getColumnLabel(col);
          ann.xval = row[0];
          ann.shortText = shortTextForAnnotationNum(annotations.length);
          ann.text = '';
          for (var k = 0; k < annotationCols[col].length; k++) {
            if (k) ann.text += "\n";
            ann.text += data.getValue(i, annotationCols[col][k]);
          }
          annotations.push(ann);
        }
      }

      // Strip out infinities, which give dygraphs problems later on.
      for (j = 0; j < row.length; j++) {
        if (!isFinite(row[j])) row[j] = null;
      }
    } else {
      for (j = 0; j < cols - 1; j++) {
        row.push([data.getValue(i, 1 + 2 * j), data.getValue(i, 2 + 2 * j)]);
      }
    }
    if (ret.length > 0 && row[0] < ret[ret.length - 1][0]) {
      outOfOrder = true;
    }
    ret.push(row);
  }
  if (outOfOrder) {
    console.warn("DataTable is out of order; order it correctly to speed loading.");
    ret.sort(function (a, b) {
      return a[0] - b[0];
    });
  }
  this.rawData_ = ret;
  if (annotations.length > 0) {
    this.setAnnotations(annotations, true);
  }
  this.attributes_.reparseSeries();
};

/**
 * Signals to plugins that the chart data has updated.
 * This happens after the data has updated but before the chart has redrawn.
 * @private
 */
Dygraph.prototype.cascadeDataDidUpdateEvent_ = function () {
  // TODO(danvk): there are some issues checking xAxisRange() and using
  // toDomCoords from handlers of this event. The visible range should be set
  // when the chart is drawn, not derived from the data.
  this.cascadeEvents_('dataDidUpdate', {});
};

/**
 * Get the CSV data. If it's in a function, call that function. If it's in a
 * file, do an XMLHttpRequest to get it.
 * @private
 */
Dygraph.prototype.start_ = function () {
  var data = this.file_;

  // Functions can return references of all other types.
  if (typeof data == 'function') {
    data = data();
  }
  var datatype = utils.typeArrayLike(data);
  if (datatype == 'array') {
    this.rawData_ = this.parseArray_(data);
    this.cascadeDataDidUpdateEvent_();
    this.predraw_();
  } else if (datatype == 'object' && typeof data.getColumnRange == 'function') {
    // must be a DataTable from gviz.
    this.parseDataTable_(data);
    this.cascadeDataDidUpdateEvent_();
    this.predraw_();
  } else if (datatype == 'string') {
    // Heuristic: a newline means it's CSV data. Otherwise it's an URL.
    var line_delimiter = utils.detectLineDelimiter(data);
    if (line_delimiter) {
      this.loadedEvent_(data);
    } else {
      // REMOVE_FOR_IE
      var req;
      if (window.XMLHttpRequest) {
        // Firefox, Opera, IE7, and other browsers will use the native object
        req = new XMLHttpRequest();
      } else {
        // IE 5 and 6 will use the ActiveX control
        req = new ActiveXObject("Microsoft.XMLHTTP");
      }
      var caller = this;
      req.onreadystatechange = function () {
        if (req.readyState == 4) {
          if (req.status === 200 ||
          // Normal http
          req.status === 0) {
            // Chrome w/ --allow-file-access-from-files
            caller.loadedEvent_(req.responseText);
          }
        }
      };
      req.open("GET", data, true);
      req.send(null);
    }
  } else {
    console.error("Unknown data format: " + datatype);
  }
};

/**
 * Changes various properties of the graph. These can include:
 * <ul>
 * <li>file: changes the source data for the graph</li>
 * <li>errorBars: changes whether the data contains stddev</li>
 * </ul>
 *
 * There's a huge variety of options that can be passed to this method. For a
 * full list, see http://dygraphs.com/options.html.
 *
 * @param {Object} input_attrs The new properties and values
 * @param {boolean} block_redraw Usually the chart is redrawn after every
 *     call to updateOptions(). If you know better, you can pass true to
 *     explicitly block the redraw. This can be useful for chaining
 *     updateOptions() calls, avoiding the occasional infinite loop and
 *     preventing redraws when it's not necessary (e.g. when updating a
 *     callback).
 */
Dygraph.prototype.updateOptions = function (input_attrs, block_redraw) {
  if (typeof block_redraw == 'undefined') block_redraw = false;

  // copyUserAttrs_ drops the "file" parameter as a convenience to us.
  var file = input_attrs.file;
  var attrs = Dygraph.copyUserAttrs_(input_attrs);
  var prevNumAxes = this.attributes_.numAxes();

  // TODO(danvk): this is a mess. Move these options into attr_.
  if ('rollPeriod' in attrs) {
    this.rollPeriod_ = attrs.rollPeriod;
  }
  if ('dateWindow' in attrs) {
    this.dateWindow_ = attrs.dateWindow;
  }

  // TODO(danvk): validate per-series options.
  // Supported:
  // strokeWidth
  // pointSize
  // drawPoints
  // highlightCircleSize

  // Check if this set options will require new points.
  var requiresNewPoints = utils.isPixelChangingOptionList(this.attr_("labels"), attrs);
  utils.updateDeep(this.user_attrs_, attrs);
  this.attributes_.reparseSeries();
  if (prevNumAxes < this.attributes_.numAxes()) this.plotter_.clear();
  if (file) {
    // This event indicates that the data is about to change, but hasn't yet.
    // TODO(danvk): support cancellation of the update via this event.
    this.cascadeEvents_('dataWillUpdate', {});
    this.file_ = file;
    if (!block_redraw) this.start_();
  } else {
    if (!block_redraw) {
      if (requiresNewPoints) {
        this.predraw_();
      } else {
        this.renderGraph_(false);
      }
    }
  }
};

/**
 * Make a copy of input attributes, removing file as a convenience.
 * @private
 */
Dygraph.copyUserAttrs_ = function (attrs) {
  var my_attrs = {};
  for (var k in attrs) {
    if (!attrs.hasOwnProperty(k)) continue;
    if (k == 'file') continue;
    if (attrs.hasOwnProperty(k)) my_attrs[k] = attrs[k];
  }
  return my_attrs;
};

/**
 * Resizes the dygraph. If no parameters are specified, resizes to fill the
 * containing div (which has presumably changed size since the dygraph was
 * instantiated). If the width/height are specified, the div will be resized.
 *
 * This is far more efficient than destroying and re-instantiating a
 * Dygraph, since it doesn't have to reparse the underlying data.
 *
 * @param {number} width Width (in pixels)
 * @param {number} height Height (in pixels)
 */
Dygraph.prototype.resize = function (width, height) {
  if (this.resize_lock) {
    return;
  }
  this.resize_lock = true;
  if (width === null != (height === null)) {
    console.warn("Dygraph.resize() should be called with zero parameters or " + "two non-NULL parameters. Pretending it was zero.");
    width = height = null;
  }
  var old_width = this.width_;
  var old_height = this.height_;
  if (width) {
    this.maindiv_.style.width = width + "px";
    this.maindiv_.style.height = height + "px";
    this.width_ = width;
    this.height_ = height;
  } else {
    this.width_ = this.maindiv_.clientWidth;
    this.height_ = this.maindiv_.clientHeight;
  }
  if (old_width != this.width_ || old_height != this.height_) {
    // Resizing a canvas erases it, even when the size doesn't change, so
    // any resize needs to be followed by a redraw.
    this.resizeElements_();
    this.predraw_();
  }
  this.resize_lock = false;
};

/**
 * Adjusts the number of points in the rolling average. Updates the graph to
 * reflect the new averaging period.
 * @param {number} length Number of points over which to average the data.
 */
Dygraph.prototype.adjustRoll = function (length) {
  this.rollPeriod_ = length;
  this.predraw_();
};

/**
 * Returns a boolean array of visibility statuses.
 */
Dygraph.prototype.visibility = function () {
  // Do lazy-initialization, so that this happens after we know the number of
  // data series.
  if (!this.getOption("visibility")) {
    this.attrs_.visibility = [];
  }
  // TODO(danvk): it looks like this could go into an infinite loop w/ user_attrs.
  while (this.getOption("visibility").length < this.numColumns() - 1) {
    this.attrs_.visibility.push(true);
  }
  return this.getOption("visibility");
};

/**
 * Changes the visibility of one or more series.
 *
 * @param {number|number[]|object} num the series index or an array of series indices
 *                                     or a boolean array of visibility states by index
 *                                     or an object mapping series numbers, as keys, to
 *                                     visibility state (boolean values)
 * @param {boolean} value the visibility state expressed as a boolean
 */
Dygraph.prototype.setVisibility = function (num, value) {
  var x = this.visibility();
  var numIsObject = false;
  if (!Array.isArray(num)) {
    if (num !== null && typeof num === 'object') {
      numIsObject = true;
    } else {
      num = [num];
    }
  }
  if (numIsObject) {
    for (var i in num) {
      if (num.hasOwnProperty(i)) {
        if (i < 0 || i >= x.length) {
          console.warn("Invalid series number in setVisibility: " + i);
        } else {
          x[i] = num[i];
        }
      }
    }
  } else {
    for (var i = 0; i < num.length; i++) {
      if (typeof num[i] === 'boolean') {
        if (i >= x.length) {
          console.warn("Invalid series number in setVisibility: " + i);
        } else {
          x[i] = num[i];
        }
      } else {
        if (num[i] < 0 || num[i] >= x.length) {
          console.warn("Invalid series number in setVisibility: " + num[i]);
        } else {
          x[num[i]] = value;
        }
      }
    }
  }
  this.predraw_();
};

/**
 * How large of an area will the dygraph render itself in?
 * This is used for testing.
 * @return A {width: w, height: h} object.
 * @private
 */
Dygraph.prototype.size = function () {
  return {
    width: this.width_,
    height: this.height_
  };
};

/**
 * Update the list of annotations and redraw the chart.
 * See dygraphs.com/annotations.html for more info on how to use annotations.
 * @param ann {Array} An array of annotation objects.
 * @param suppressDraw {Boolean} Set to "true" to block chart redraw (optional).
 */
Dygraph.prototype.setAnnotations = function (ann, suppressDraw) {
  // Only add the annotation CSS rule once we know it will be used.
  this.annotations_ = ann;
  if (!this.layout_) {
    console.warn("Tried to setAnnotations before dygraph was ready. " + "Try setting them in a ready() block. See " + "dygraphs.com/tests/annotation.html");
    return;
  }
  this.layout_.setAnnotations(this.annotations_);
  if (!suppressDraw) {
    this.predraw_();
  }
};

/**
 * Return the list of annotations.
 */
Dygraph.prototype.annotations = function () {
  return this.annotations_;
};

/**
 * Get the list of label names for this graph. The first column is the
 * x-axis, so the data series names start at index 1.
 *
 * Returns null when labels have not yet been defined.
 */
Dygraph.prototype.getLabels = function () {
  var labels = this.attr_("labels");
  return labels ? labels.slice() : null;
};

/**
 * Get the index of a series (column) given its name. The first column is the
 * x-axis, so the data series start with index 1.
 */
Dygraph.prototype.indexFromSetName = function (name) {
  return this.setIndexByName_[name];
};

/**
 * Find the row number corresponding to the given x-value.
 * Returns null if there is no such x-value in the data.
 * If there are multiple rows with the same x-value, this will return the
 * first one.
 * @param {number} xVal The x-value to look for (e.g. millis since epoch).
 * @return {?number} The row number, which you can pass to getValue(), or null.
 */
Dygraph.prototype.getRowForX = function (xVal) {
  var low = 0,
    high = this.numRows() - 1;
  while (low <= high) {
    var idx = high + low >> 1;
    var x = this.getValue(idx, 0);
    if (x < xVal) {
      low = idx + 1;
    } else if (x > xVal) {
      high = idx - 1;
    } else if (low != idx) {
      // equal, but there may be an earlier match.
      high = idx;
    } else {
      return idx;
    }
  }
  return null;
};

/**
 * Trigger a callback when the dygraph has drawn itself and is ready to be
 * manipulated. This is primarily useful when dygraphs has to do an XHR for the
 * data (i.e. a URL is passed as the data source) and the chart is drawn
 * asynchronously. If the chart has already drawn, the callback will fire
 * immediately.
 *
 * This is a good place to call setAnnotation().
 *
 * @param {function(!Dygraph)} callback The callback to trigger when the chart
 *     is ready.
 */
Dygraph.prototype.ready = function (callback) {
  if (this.is_initial_draw_) {
    this.readyFns_.push(callback);
  } else {
    callback.call(this, this);
  }
};

/**
 * Add an event handler. This event handler is kept until the graph is
 * destroyed with a call to graph.destroy().
 *
 * @param {!Node} elem The element to add the event to.
 * @param {string} type The type of the event, e.g. 'click' or 'mousemove'.
 * @param {function(Event):(boolean|undefined)} fn The function to call
 *     on the event. The function takes one parameter: the event object.
 * @private
 */
Dygraph.prototype.addAndTrackEvent = function (elem, type, fn) {
  utils.addEvent(elem, type, fn);
  this.registeredEvents_.push({
    elem: elem,
    type: type,
    fn: fn
  });
};
Dygraph.prototype.removeTrackedEvents_ = function () {
  if (this.registeredEvents_) {
    for (var idx = 0; idx < this.registeredEvents_.length; idx++) {
      var reg = this.registeredEvents_[idx];
      utils.removeEvent(reg.elem, reg.type, reg.fn);
    }
  }
  this.registeredEvents_ = [];
};

// Installed plugins, in order of precedence (most-general to most-specific).
Dygraph.PLUGINS = [_legend["default"], _axes["default"], _rangeSelector["default"],
// Has to be before ChartLabels so that its callbacks are called after ChartLabels' callbacks.
_chartLabels["default"], _annotations["default"], _grid["default"]];

// There are many symbols which have historically been available through the
// Dygraph class. These are exported here for backwards compatibility.
Dygraph.GVizChart = _dygraphGviz["default"];
Dygraph.DASHED_LINE = utils.DASHED_LINE;
Dygraph.DOT_DASH_LINE = utils.DOT_DASH_LINE;
Dygraph.dateAxisLabelFormatter = utils.dateAxisLabelFormatter;
Dygraph.toRGB_ = utils.toRGB_;
Dygraph.findPos = utils.findPos;
Dygraph.pageX = utils.pageX;
Dygraph.pageY = utils.pageY;
Dygraph.dateString_ = utils.dateString_;
Dygraph.defaultInteractionModel = _dygraphInteractionModel["default"].defaultModel;
Dygraph.nonInteractiveModel = Dygraph.nonInteractiveModel_ = _dygraphInteractionModel["default"].nonInteractiveModel_;
Dygraph.Circles = utils.Circles;
Dygraph.Plugins = {
  Legend: _legend["default"],
  Axes: _axes["default"],
  Annotations: _annotations["default"],
  ChartLabels: _chartLabels["default"],
  Grid: _grid["default"],
  RangeSelector: _rangeSelector["default"]
};
Dygraph.DataHandlers = {
  DefaultHandler: _default2["default"],
  BarsHandler: _bars["default"],
  CustomBarsHandler: _barsCustom["default"],
  DefaultFractionHandler: _defaultFractions["default"],
  ErrorBarsHandler: _barsError["default"],
  FractionsBarsHandler: _barsFractions["default"]
};
Dygraph.startPan = _dygraphInteractionModel["default"].startPan;
Dygraph.startZoom = _dygraphInteractionModel["default"].startZoom;
Dygraph.movePan = _dygraphInteractionModel["default"].movePan;
Dygraph.moveZoom = _dygraphInteractionModel["default"].moveZoom;
Dygraph.endPan = _dygraphInteractionModel["default"].endPan;
Dygraph.endZoom = _dygraphInteractionModel["default"].endZoom;
Dygraph.numericLinearTicks = DygraphTickers.numericLinearTicks;
Dygraph.numericTicks = DygraphTickers.numericTicks;
Dygraph.dateTicker = DygraphTickers.dateTicker;
Dygraph.Granularity = DygraphTickers.Granularity;
Dygraph.getDateAxis = DygraphTickers.getDateAxis;
Dygraph.floatFormat = utils.floatFormat;
utils.setupDOMready_(Dygraph);
var _default = Dygraph;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEeWdyYXBoIiwiZGl2IiwiZGF0YSIsIm9wdHMiLCJfX2luaXRfXyIsIk5BTUUiLCJWRVJTSU9OIiwiX2FkZHJlcXVpcmUiLCJfcmVxdWlyZSIsInJlcXVpcmUiLCJ3aGF0IiwiX2IiLCJhZGQiLCJ0b3doYXQiLCJERUZBVUxUX1JPTExfUEVSSU9EIiwiREVGQVVMVF9XSURUSCIsIkRFRkFVTFRfSEVJR0hUIiwiQU5JTUFUSU9OX1NURVBTIiwiQU5JTUFUSU9OX0RVUkFUSU9OIiwiUGxvdHRlcnMiLCJEeWdyYXBoQ2FudmFzUmVuZGVyZXIiLCJfUGxvdHRlcnMiLCJhZGRlZEFubm90YXRpb25DU1MiLCJwcm90b3R5cGUiLCJmaWxlIiwiYXR0cnMiLCJpc19pbml0aWFsX2RyYXdfIiwicmVhZHlGbnNfIiwidW5kZWZpbmVkIiwiY29weVVzZXJBdHRyc18iLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwiRXJyb3IiLCJtYWluZGl2XyIsImZpbGVfIiwicm9sbFBlcmlvZF8iLCJyb2xsUGVyaW9kIiwicHJldmlvdXNWZXJ0aWNhbFhfIiwiZnJhY3Rpb25zXyIsImZyYWN0aW9ucyIsImRhdGVXaW5kb3dfIiwiZGF0ZVdpbmRvdyIsImFubm90YXRpb25zXyIsImlubmVySFRNTCIsInJlc29sdmVkIiwid2luZG93IiwiZ2V0Q29tcHV0ZWRTdHlsZSIsInBhZGRpbmdMZWZ0IiwicGFkZGluZ1JpZ2h0IiwicGFkZGluZ1RvcCIsInBhZGRpbmdCb3R0b20iLCJjb25zb2xlIiwiZXJyb3IiLCJzdHlsZSIsIndpZHRoIiwiaGVpZ2h0IiwiY2xpZW50SGVpZ2h0Iiwid2lkdGhfIiwiY2xpZW50V2lkdGgiLCJoZWlnaHRfIiwic3RhY2tlZEdyYXBoIiwiZmlsbEdyYXBoIiwidXNlcl9hdHRyc18iLCJ1dGlscyIsInVwZGF0ZSIsImF0dHJzXyIsInVwZGF0ZURlZXAiLCJERUZBVUxUX0FUVFJTIiwiYm91bmRhcnlJZHNfIiwic2V0SW5kZXhCeU5hbWVfIiwiZGF0YXNldEluZGV4XyIsInJlZ2lzdGVyZWRFdmVudHNfIiwiZXZlbnRMaXN0ZW5lcnNfIiwiYXR0cmlidXRlc18iLCJEeWdyYXBoT3B0aW9ucyIsImNyZWF0ZUludGVyZmFjZV8iLCJwbHVnaW5zXyIsInBsdWdpbnMiLCJQTFVHSU5TIiwiY29uY2F0IiwiZ2V0T3B0aW9uIiwiaSIsImxlbmd0aCIsIlBsdWdpbiIsInBsdWdpbkluc3RhbmNlIiwiYWN0aXZhdGUiLCJwbHVnaW5EaWN0IiwicGx1Z2luIiwiZXZlbnRzIiwib3B0aW9ucyIsInBsdWdpbk9wdGlvbnMiLCJoYW5kbGVycyIsImV2ZW50TmFtZSIsImhhc093blByb3BlcnR5IiwicHVzaCIsInBsdWdpbl9kaWN0IiwiY2FsbGJhY2siLCJwYWlyIiwiY3JlYXRlRHJhZ0ludGVyZmFjZV8iLCJzdGFydF8iLCJjYXNjYWRlRXZlbnRzXyIsIm5hbWUiLCJleHRyYV9wcm9wcyIsImUiLCJkeWdyYXBoIiwiY2FuY2VsYWJsZSIsImRlZmF1bHRQcmV2ZW50ZWQiLCJwcmV2ZW50RGVmYXVsdCIsInByb3BhZ2F0aW9uU3RvcHBlZCIsInN0b3BQcm9wYWdhdGlvbiIsImNhbGxiYWNrX3BsdWdpbl9wYWlycyIsImNhbGwiLCJnZXRQbHVnaW5JbnN0YW5jZV8iLCJ0eXBlIiwicCIsImlzWm9vbWVkIiwiYXhpcyIsImlzWm9vbWVkWCIsImlzWm9vbWVkWSIsImF4ZXNfIiwibWFwIiwidmFsdWVSYW5nZSIsImluZGV4T2YiLCJ0b1N0cmluZyIsIm1haW5kaXYiLCJpZCIsImF0dHJfIiwic2VyaWVzTmFtZSIsInByb2Nlc3MiLCJlbnYiLCJOT0RFX0VOViIsIk9QVElPTlNfUkVGRVJFTkNFIiwiZ2V0Rm9yU2VyaWVzIiwiZ2V0Iiwib3B0X3Nlcmllc05hbWUiLCJnZXROdW1lcmljT3B0aW9uIiwiZ2V0U3RyaW5nT3B0aW9uIiwiZ2V0Qm9vbGVhbk9wdGlvbiIsImdldEZ1bmN0aW9uT3B0aW9uIiwiZ2V0T3B0aW9uRm9yQXhpcyIsImdldEZvckF4aXMiLCJvcHRpb25zVmlld0ZvckF4aXNfIiwic2VsZiIsIm9wdCIsImF4aXNfb3B0cyIsImF4ZXMiLCJ4QXhpc1JhbmdlIiwieEF4aXNFeHRyZW1lcyIsInBhZCIsInBsb3R0ZXJfIiwiYXJlYSIsInciLCJudW1Sb3dzIiwibGVmdCIsInJhd0RhdGFfIiwicmlnaHQiLCJyYW5nZSIsInlBeGlzRXh0cmVtZXMiLCJwYWNrZWQiLCJnYXRoZXJEYXRhc2V0c18iLCJyb2xsZWRTZXJpZXNfIiwiZXh0cmVtZXMiLCJzYXZlQXhlcyIsImNvbXB1dGVZQXhpc1Jhbmdlc18iLCJuZXdBeGVzIiwiZXh0cmVtZVJhbmdlIiwieUF4aXNSYW5nZSIsImlkeCIsImNvbXB1dGVkVmFsdWVSYW5nZSIsInlBeGlzUmFuZ2VzIiwicmV0IiwidG9Eb21Db29yZHMiLCJ4IiwieSIsInRvRG9tWENvb3JkIiwidG9Eb21ZQ29vcmQiLCJ4UmFuZ2UiLCJwY3QiLCJ0b1BlcmNlbnRZQ29vcmQiLCJoIiwidG9EYXRhQ29vcmRzIiwidG9EYXRhWENvb3JkIiwidG9EYXRhWUNvb3JkIiwibG9nUmFuZ2VGcmFjdGlvbiIsInlSYW5nZSIsImxvZ3NjYWxlIiwibG9ncjAiLCJsb2cxMCIsImxvZ3IxIiwidG9QZXJjZW50WENvb3JkIiwibnVtQ29sdW1ucyIsImdldFZhbHVlIiwicm93IiwiY29sIiwiZW5jbG9zaW5nIiwiZ3JhcGhEaXYiLCJjcmVhdGVFbGVtZW50IiwidGV4dEFsaWduIiwicG9zaXRpb24iLCJhcHBlbmRDaGlsZCIsImNhbnZhc18iLCJjcmVhdGVDYW52YXMiLCJ0b3AiLCJoaWRkZW5fIiwiY3JlYXRlUGxvdEtpdENhbnZhc18iLCJjYW52YXNfY3R4XyIsImdldENvbnRleHQiLCJoaWRkZW5fY3R4XyIsInJlc2l6ZUVsZW1lbnRzXyIsIm1vdXNlRXZlbnRFbGVtZW50XyIsImNyZWF0ZU1vdXNlRXZlbnRFbGVtZW50XyIsImxheW91dF8iLCJEeWdyYXBoTGF5b3V0IiwibW91c2VNb3ZlSGFuZGxlcl8iLCJtb3VzZU1vdmVfIiwibW91c2VPdXRIYW5kbGVyXyIsInRhcmdldCIsImZyb21FbGVtZW50IiwicmVsYXRlZFRhcmdldCIsInRvRWxlbWVudCIsImlzTm9kZUNvbnRhaW5lZEJ5IiwibW91c2VPdXRfIiwiYWRkQW5kVHJhY2tFdmVudCIsInJlc2l6ZUhhbmRsZXJfIiwicmVzaXplIiwicmVzaXplT2JzZXJ2ZXJfIiwicmVzaXplTW9kZSIsIlJlc2l6ZU9ic2VydmVyIiwibWFpbmRpdk92ZXJmbG93Iiwib3ZlcmZsb3ciLCJvYnNlcnZlIiwicGl4ZWxSYXRpb09wdGlvbiIsImNhbnZhc1NjYWxlIiwiZ2V0Q29udGV4dFBpeGVsUmF0aW8iLCJzY2FsZSIsImhpZGRlblNjYWxlIiwiZGVzdHJveSIsInJlc3RvcmUiLCJwb3AiLCJyZW1vdmVSZWN1cnNpdmUiLCJub2RlIiwiaGFzQ2hpbGROb2RlcyIsImZpcnN0Q2hpbGQiLCJyZW1vdmVDaGlsZCIsInJlbW92ZVRyYWNrZWRFdmVudHNfIiwicmVtb3ZlRXZlbnQiLCJkaXNjb25uZWN0IiwibnVsbE91dCIsIm9iaiIsIm4iLCJjYW52YXMiLCJzZXRDb2xvcnNfIiwibGFiZWxzIiwiZ2V0TGFiZWxzIiwibnVtIiwiY29sb3JzXyIsImNvbG9yc01hcF8iLCJzYXQiLCJ2YWwiLCJoYWxmIiwiTWF0aCIsImNlaWwiLCJjb2xvcnMiLCJ2aXNpYmlsaXR5IiwibGFiZWwiLCJjb2xvclN0ciIsImh1ZSIsImhzdlRvUkdCIiwiZ2V0Q29sb3JzIiwiZ2V0UHJvcGVydGllc0ZvclNlcmllcyIsInNlcmllc19uYW1lIiwiY29sdW1uIiwidmlzaWJsZSIsImNvbG9yIiwiYXhpc0ZvclNlcmllcyIsImNyZWF0ZVJvbGxJbnRlcmZhY2VfIiwicm9sbGVyIiwicm9sbGVyXyIsImRpc3BsYXkiLCJjbGFzc05hbWUiLCJnZXRBcmVhIiwidGV4dEF0dHIiLCJzaXplIiwidmFsdWUiLCJ0aGF0Iiwib25jaGFuZ2UiLCJhZGp1c3RSb2xsIiwiY29udGV4dCIsImlzWm9vbWluZyIsImlzUGFubmluZyIsImlzMkRQYW4iLCJkcmFnU3RhcnRYIiwiZHJhZ1N0YXJ0WSIsImRyYWdFbmRYIiwiZHJhZ0VuZFkiLCJkcmFnRGlyZWN0aW9uIiwicHJldkVuZFgiLCJwcmV2RW5kWSIsInByZXZEcmFnRGlyZWN0aW9uIiwiY2FuY2VsTmV4dERibGNsaWNrIiwiaW5pdGlhbExlZnRtb3N0RGF0ZSIsInhVbml0c1BlclBpeGVsIiwiZGF0ZVJhbmdlIiwicHgiLCJweSIsImJvdW5kZWREYXRlcyIsImJvdW5kZWRWYWx1ZXMiLCJ0YXJwIiwiSUZyYW1lVGFycCIsImluaXRpYWxpemVNb3VzZURvd24iLCJldmVudCIsImciLCJjb250ZXh0QiIsInJldHVyblZhbHVlIiwiY2FuY2VsQnViYmxlIiwiY2FudmFzUG9zIiwiZmluZFBvcyIsImRyYWdHZXRYXyIsImRyYWdHZXRZXyIsImNvdmVyIiwiZHJhZ2dpbmdEYXRlIiwiZHJhZ2dpbmdWYWx1ZSIsImRyYWdWYWx1ZVJhbmdlIiwidW5jb3ZlciIsImludGVyYWN0aW9uTW9kZWwiLCJiaW5kSGFuZGxlciIsImhhbmRsZXIiLCJ3aWxsRGVzdHJveUNvbnRleHRNeXNlbGYiLCJtb3VzZVVwSGFuZGxlciIsImRyYXdab29tUmVjdF8iLCJkaXJlY3Rpb24iLCJzdGFydFgiLCJlbmRYIiwic3RhcnRZIiwiZW5kWSIsInByZXZEaXJlY3Rpb24iLCJjdHgiLCJIT1JJWk9OVEFMIiwiY2xlYXJSZWN0IiwibWluIiwiZ2V0UGxvdEFyZWEiLCJhYnMiLCJWRVJUSUNBTCIsImZpbGxTdHlsZSIsImZpbGxSZWN0IiwiY2xlYXJab29tUmVjdF8iLCJjdXJyZW50Wm9vbVJlY3RBcmdzXyIsImRvWm9vbVhfIiwibG93WCIsImhpZ2hYIiwibWluRGF0ZSIsIm1heERhdGUiLCJkb1pvb21YRGF0ZXNfIiwib2xkX3dpbmRvdyIsIm5ld193aW5kb3ciLCJ6b29tQ2FsbGJhY2siLCJkb0FuaW1hdGVkWm9vbSIsImFuaW1hdGVkWm9vbUNhbGxiYWNrIiwiZG9ab29tWV8iLCJsb3dZIiwiaGlnaFkiLCJvbGRWYWx1ZVJhbmdlcyIsIm5ld1ZhbHVlUmFuZ2VzIiwiaGkiLCJsb3ciLCJtaW5YIiwibWF4WCIsInpvb21BbmltYXRpb25GdW5jdGlvbiIsImZyYW1lIiwibnVtRnJhbWVzIiwiayIsInBvdyIsInJlc2V0Wm9vbSIsImRpcnR5WCIsImRpcnR5WSIsImRpcnR5IiwiY2xlYXJTZWxlY3Rpb24iLCJhbmltYXRlZFpvb21zIiwiZm9yRWFjaCIsImRyYXdHcmFwaF8iLCJvbGRXaW5kb3ciLCJuZXdXaW5kb3ciLCJvbGRYUmFuZ2UiLCJuZXdYUmFuZ2UiLCJvbGRZUmFuZ2VzIiwibmV3WVJhbmdlcyIsInN0ZXBzIiwid2luZG93cyIsInZhbHVlUmFuZ2VzIiwic3RlcCIsImZyYWMiLCJ0aGlzUmFuZ2UiLCJqIiwicmVwZWF0QW5kQ2xlYW51cCIsImV2ZW50VG9Eb21Db29yZHMiLCJvZmZzZXRYIiwib2Zmc2V0WSIsImV2ZW50RWxlbWVudFBvcyIsImNhbnZhc3giLCJwYWdlWCIsImNhbnZhc3kiLCJwYWdlWSIsImZpbmRDbG9zZXN0Um93IiwiZG9tWCIsIm1pbkRpc3RYIiwiSW5maW5pdHkiLCJjbG9zZXN0Um93Iiwic2V0cyIsInBvaW50cyIsImxlbiIsInBvaW50IiwiaXNWYWxpZFBvaW50IiwiZGlzdCIsImZpbmRDbG9zZXN0UG9pbnQiLCJkb21ZIiwibWluRGlzdCIsImR4IiwiZHkiLCJjbG9zZXN0UG9pbnQiLCJjbG9zZXN0U2VyaWVzIiwic2V0SWR4Iiwic2V0TmFtZXMiLCJmaW5kU3RhY2tlZFBvaW50IiwiYm91bmRhcnkiLCJnZXRMZWZ0Qm91bmRhcnlfIiwicm93SWR4IiwicDEiLCJwMiIsInIiLCJwMCIsImNhbnZhc0Nvb3JkcyIsImhpZ2hsaWdodFNlcmllc09wdHMiLCJzZWxlY3Rpb25DaGFuZ2VkIiwiaXNTZXJpZXNMb2NrZWQiLCJjbG9zZXN0Iiwic2V0U2VsZWN0aW9uIiwibGFzdHhfIiwic2VsUG9pbnRzXyIsImxhc3RSb3dfIiwiaGlnaGxpZ2h0U2V0XyIsImFuaW1hdGVTZWxlY3Rpb25fIiwidG90YWxTdGVwcyIsIm1pbGxpcyIsImZhZGVMZXZlbCIsImFuaW1hdGVJZCIsInN0YXJ0IiwidXBkYXRlU2VsZWN0aW9uXyIsInRoaXNJZCIsImNsZWFudXBJZkNsZWFyaW5nIiwib3B0X2FuaW1GcmFjdGlvbiIsInNlbGVjdGVkUm93Iiwic2VsZWN0ZWRYIiwic2VsZWN0ZWRQb2ludHMiLCJhbHBoYSIsImJhY2tncm91bmRDb2xvciIsInRvUkdCXyIsImFuaW1hdGVCYWNrZ3JvdW5kRmFkZSIsImIiLCJfcmVuZGVyTGluZUNoYXJ0IiwibWF4Q2lyY2xlU2l6ZSIsInNhdmUiLCJwdCIsImlzTmFOIiwiY2lyY2xlU2l6ZSIsIkNpcmNsZXMiLCJERUZBVUxUIiwibGluZVdpZHRoIiwic3Ryb2tlU3R5bGUiLCJvcHRfbG9ja2VkIiwib3B0X3RyaWdnZXJfaGlnaGxpZ2h0X2NhbGxiYWNrIiwiY2hhbmdlZCIsInNldFJvdyIsInl2YWwiLCJwb2ludElkeCIsInh2YWwiLCJsb2NrZWRTZXRfIiwiZ2V0U2VsZWN0aW9uIiwiZ2V0SGlnaGxpZ2h0U2VyaWVzIiwibG9hZGVkRXZlbnRfIiwicGFyc2VDU1ZfIiwiY2FzY2FkZURhdGFEaWRVcGRhdGVFdmVudF8iLCJwcmVkcmF3XyIsImFkZFhUaWNrc18iLCJ4QXhpc09wdGlvbnNWaWV3IiwieFRpY2tzIiwic2V0WFRpY2tzIiwiZ2V0SGFuZGxlckNsYXNzXyIsImhhbmRsZXJDbGFzcyIsIkZyYWN0aW9uc0JhcnNIYW5kbGVyIiwiRGVmYXVsdEZyYWN0aW9uSGFuZGxlciIsIkN1c3RvbUJhcnNIYW5kbGVyIiwiRXJyb3JCYXJzSGFuZGxlciIsIkRlZmF1bHRIYW5kbGVyIiwiRGF0ZSIsImRhdGFIYW5kbGVyXyIsImNvbXB1dGVQbG90QXJlYSIsImNvbXB1dGVZQXhlc18iLCJzZXJpZXMiLCJleHRyYWN0U2VyaWVzIiwicm9sbGluZ0F2ZXJhZ2UiLCJlbmQiLCJkcmF3aW5nVGltZU1zXyIsIlBvaW50VHlwZSIsInN0YWNrUG9pbnRzXyIsImN1bXVsYXRpdmVZdmFsIiwic2VyaWVzRXh0cmVtZXMiLCJmaWxsTWV0aG9kIiwibGFzdFh2YWwiLCJwcmV2UG9pbnQiLCJuZXh0UG9pbnQiLCJuZXh0UG9pbnRJZHgiLCJ1cGRhdGVOZXh0UG9pbnQiLCJhY3R1YWxZdmFsIiwic3RhY2tlZFl2YWwiLCJ5dmFsX3N0YWNrZWQiLCJyb2xsZWRTZXJpZXMiLCJib3VuZGFyeUlkcyIsInNlcmllc0lkeCIsInNhbXBsZUlkeCIsImZpcnN0SWR4IiwibGFzdElkeCIsImF4aXNJZHgiLCJudW1fc2VyaWVzIiwiaGlnaCIsImNvcnJlY3RlZEZpcnN0SWR4IiwiaXNJbnZhbGlkVmFsdWUiLCJjb3JyZWN0ZWRMYXN0SWR4Iiwic2xpY2UiLCJnZXRFeHRyZW1lWVZhbHVlcyIsInNlcmllc1BvaW50cyIsInNlcmllc1RvUG9pbnRzIiwiaXNfaW5pdGlhbF9kcmF3IiwicmVtb3ZlQWxsRGF0YXNldHMiLCJwb2ludFNpemUiLCJkYXRhSWR4IiwiYWRkRGF0YXNldCIsInNldFlBeGVzIiwiZXZhbHVhdGUiLCJyZW5kZXJHcmFwaF8iLCJsb2ciLCJjbGVhciIsInVuZGVybGF5Q2FsbGJhY2siLCJkcmF3aW5nQ29udGV4dCIsInJlbmRlciIsImRyYXdDYWxsYmFjayIsInJlYWR5RmlyZWRfIiwiZm4iLCJpbmRleCIsInYiLCJudW1BeGVzIiwiYXhpc09wdGlvbnMiLCJ5MiIsImF4aXNQcm9wZXJ0aWVzRm9yU2VyaWVzIiwiaXNOdWxsVW5kZWZpbmVkT3JOYU4iLCJwYXJzZUZsb2F0IiwieXBhZENvbXBhdCIsInNwYW4iLCJ5cGFkIiwicF9heGlzIiwiaW5jbHVkZVplcm8iLCJpbmRlcGVuZGVudFRpY2tzIiwic2VyaWVzRm9yQXhpcyIsInlSYW5nZVBhZCIsIm1pblkiLCJtYXhZIiwiZXh0cmVtZU1pblkiLCJleHRyZW1lTWF4WSIsIm1heCIsIm1heEF4aXNZIiwibWluQXhpc1kiLCJ5MCIsInkxIiwiZGVsdGEiLCJ5MHBjdCIsInkxcGN0IiwidGlja2VyIiwidGlja3MiLCJwX3RpY2tzIiwicF9zY2FsZSIsInRpY2tfdmFsdWVzIiwieV9mcmFjIiwieV92YWwiLCJkZXRlY3RUeXBlRnJvbVN0cmluZ18iLCJzdHIiLCJpc0RhdGUiLCJkYXNoUG9zIiwic2V0WEF4aXNPcHRpb25zXyIsInhWYWx1ZVBhcnNlciIsImRhdGVQYXJzZXIiLCJ2YWx1ZUZvcm1hdHRlciIsImRhdGVWYWx1ZUZvcm1hdHRlciIsIkR5Z3JhcGhUaWNrZXJzIiwiZGF0ZVRpY2tlciIsImF4aXNMYWJlbEZvcm1hdHRlciIsImRhdGVBeGlzTGFiZWxGb3JtYXR0ZXIiLCJudW1lcmljVGlja3MiLCJsaW5lX2RlbGltaXRlciIsImRldGVjdExpbmVEZWxpbWl0ZXIiLCJsaW5lcyIsInNwbGl0IiwidmFscyIsImRlbGltIiwicmVwYXJzZVNlcmllcyIsImxpbmVfbm8iLCJ4UGFyc2VyIiwiZGVmYXVsdFBhcnNlclNldCIsImV4cGVjdGVkQ29scyIsIm91dE9mT3JkZXIiLCJsaW5lIiwiaW5GaWVsZHMiLCJmaWVsZHMiLCJwYXJzZUZsb2F0XyIsInRlc3QiLCJ3YXJuIiwiYWxsX251bGwiLCJzb3J0IiwiYSIsInZhbGlkYXRlTmF0aXZlRm9ybWF0IiwiZmlyc3RSb3ciLCJmaXJzdFgiLCJpc0RhdGVMaWtlIiwiaXNBcnJheUxpa2UiLCJwYXJzZUFycmF5XyIsIm51bV9sYWJlbHMiLCJwYXJzZWREYXRhIiwiY2xvbmUiLCJnZXRUaW1lIiwibnVtYmVyQXhpc0xhYmVsRm9ybWF0dGVyIiwicGFyc2VEYXRhVGFibGVfIiwic2hvcnRUZXh0Rm9yQW5ub3RhdGlvbk51bSIsInNob3J0VGV4dCIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsImZsb29yIiwidG9Mb3dlckNhc2UiLCJjb2xzIiwiZ2V0TnVtYmVyT2ZDb2x1bW5zIiwicm93cyIsImdldE51bWJlck9mUm93cyIsImluZGVwVHlwZSIsImdldENvbHVtblR5cGUiLCJjb2xJZHgiLCJhbm5vdGF0aW9uQ29scyIsImhhc0Fubm90YXRpb25zIiwiZ2V0Q29sdW1uTGFiZWwiLCJhbm5vdGF0aW9ucyIsImFubiIsInRleHQiLCJpc0Zpbml0ZSIsInNldEFubm90YXRpb25zIiwiZGF0YXR5cGUiLCJ0eXBlQXJyYXlMaWtlIiwiZ2V0Q29sdW1uUmFuZ2UiLCJyZXEiLCJYTUxIdHRwUmVxdWVzdCIsIkFjdGl2ZVhPYmplY3QiLCJjYWxsZXIiLCJvbnJlYWR5c3RhdGVjaGFuZ2UiLCJyZWFkeVN0YXRlIiwic3RhdHVzIiwicmVzcG9uc2VUZXh0Iiwib3BlbiIsInNlbmQiLCJ1cGRhdGVPcHRpb25zIiwiaW5wdXRfYXR0cnMiLCJibG9ja19yZWRyYXciLCJwcmV2TnVtQXhlcyIsInJlcXVpcmVzTmV3UG9pbnRzIiwiaXNQaXhlbENoYW5naW5nT3B0aW9uTGlzdCIsIm15X2F0dHJzIiwicmVzaXplX2xvY2siLCJvbGRfd2lkdGgiLCJvbGRfaGVpZ2h0Iiwic2V0VmlzaWJpbGl0eSIsIm51bUlzT2JqZWN0IiwiQXJyYXkiLCJpc0FycmF5Iiwic3VwcHJlc3NEcmF3IiwiaW5kZXhGcm9tU2V0TmFtZSIsImdldFJvd0ZvclgiLCJ4VmFsIiwicmVhZHkiLCJlbGVtIiwiYWRkRXZlbnQiLCJyZWciLCJMZWdlbmRQbHVnaW4iLCJBeGVzUGx1Z2luIiwiUmFuZ2VTZWxlY3RvclBsdWdpbiIsIkNoYXJ0TGFiZWxzUGx1Z2luIiwiQW5ub3RhdGlvbnNQbHVnaW4iLCJHcmlkUGx1Z2luIiwiR1ZpekNoYXJ0IiwiREFTSEVEX0xJTkUiLCJET1RfREFTSF9MSU5FIiwiZGF0ZVN0cmluZ18iLCJkZWZhdWx0SW50ZXJhY3Rpb25Nb2RlbCIsIkR5Z3JhcGhJbnRlcmFjdGlvbiIsImRlZmF1bHRNb2RlbCIsIm5vbkludGVyYWN0aXZlTW9kZWwiLCJub25JbnRlcmFjdGl2ZU1vZGVsXyIsIlBsdWdpbnMiLCJMZWdlbmQiLCJBeGVzIiwiQW5ub3RhdGlvbnMiLCJDaGFydExhYmVscyIsIkdyaWQiLCJSYW5nZVNlbGVjdG9yIiwiRGF0YUhhbmRsZXJzIiwiQmFyc0hhbmRsZXIiLCJzdGFydFBhbiIsInN0YXJ0Wm9vbSIsIm1vdmVQYW4iLCJtb3ZlWm9vbSIsImVuZFBhbiIsImVuZFpvb20iLCJudW1lcmljTGluZWFyVGlja3MiLCJHcmFudWxhcml0eSIsImdldERhdGVBeGlzIiwiZmxvYXRGb3JtYXQiLCJzZXR1cERPTXJlYWR5XyJdLCJzb3VyY2VzIjpbIi4uL3NyYy9keWdyYXBoLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDA2IERhbiBWYW5kZXJrYW0gKGRhbnZka0BnbWFpbC5jb20pXG4gKiBNSVQtbGljZW5jZWQ6IGh0dHBzOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IENyZWF0ZXMgYW4gaW50ZXJhY3RpdmUsIHpvb21hYmxlIGdyYXBoIGJhc2VkIG9uIGEgQ1NWIGZpbGUgb3JcbiAqIHN0cmluZy4gRHlncmFwaCBjYW4gaGFuZGxlIG11bHRpcGxlIHNlcmllcyB3aXRoIG9yIHdpdGhvdXQgaGlnaC9sb3cgYmFuZHMuXG4gKiBUaGUgZGF0ZS92YWx1ZSByYW5nZXMgd2lsbCBiZSBhdXRvbWF0aWNhbGx5IHNldC4gRHlncmFwaCB1c2VzIHRoZVxuICogJmx0O2NhbnZhcyZndDsgdGFnLCBzbyBpdCBvbmx5IHdvcmtzIGluIEZGMS41Ky5cbiAqIFNlZSB0aGUgc291cmNlIG9yIGh0dHBzOi8vZHlncmFwaHMuY29tLyBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAqIEBhdXRob3IgZGFudmRrQGdtYWlsLmNvbSAoRGFuIFZhbmRlcmthbSlcbiAqL1xuXG4vKlxuICBVc2FnZTpcbiAgIDxkaXYgaWQ9XCJncmFwaGRpdlwiIHN0eWxlPVwid2lkdGg6ODAwcHg7IGhlaWdodDo1MDBweDtcIj48L2Rpdj5cbiAgIDxzY3JpcHQgdHlwZT1cInRleHQvamF2YXNjcmlwdFwiPjwhLS0vLy0tPjwhW0NEQVRBWy8vPjwhLS1cbiAgICQoZnVuY3Rpb24gb25ET01yZWFkeSgpIHtcbiAgICAgbmV3IER5Z3JhcGgoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJncmFwaGRpdlwiKSxcbiAgICAgICAgICAgICAgICAgXCJkYXRhZmlsZS5jc3ZcIiwgIC8vIENTViBmaWxlIHdpdGggaGVhZGVyc1xuICAgICAgICAgICAgICAgICB7IH0pOyAvLyBvcHRpb25zXG4gICB9KTtcbiAgIC8vLS0+PCFdXT48L3NjcmlwdD5cblxuIFRoZSBDU1YgZmlsZSBpcyBvZiB0aGUgZm9ybVxuXG4gICBEYXRlLFNlcmllc0EsU2VyaWVzQixTZXJpZXNDXG4gICBZWVlZLU1NLURELEExLEIxLEMxXG4gICBZWVlZLU1NLURELEEyLEIyLEMyXG5cbiBJZiB0aGUgJ2Vycm9yQmFycycgb3B0aW9uIGlzIHNldCBpbiB0aGUgY29uc3RydWN0b3IsIHRoZSBpbnB1dCBzaG91bGQgYmUgb2ZcbiB0aGUgZm9ybVxuICAgRGF0ZSxTZXJpZXNBLFNlcmllc0IsLi4uXG4gICBZWVlZLU1NLURELEExLHNpZ21hQTEsQjEsc2lnbWFCMSwuLi5cbiAgIFlZWVktTU0tREQsQTIsc2lnbWFBMixCMixzaWdtYUIyLC4uLlxuXG4gSWYgdGhlICdmcmFjdGlvbnMnIG9wdGlvbiBpcyBzZXQsIHRoZSBpbnB1dCBzaG91bGQgYmUgb2YgdGhlIGZvcm06XG5cbiAgIERhdGUsU2VyaWVzQSxTZXJpZXNCLC4uLlxuICAgWVlZWS1NTS1ERCxBMS9CMSxBMi9CMiwuLi5cbiAgIFlZWVktTU0tREQsQTEvQjEsQTIvQjIsLi4uXG5cbiBBbmQgaGlnaC9sb3cgYmFuZHMgd2lsbCBiZSBjYWxjdWxhdGVkIGF1dG9tYXRpY2FsbHkgdXNpbmcgYSBiaW5vbWlhbCBkaXN0cmlidXRpb24uXG5cbiBGb3IgZnVydGhlciBkb2N1bWVudGF0aW9uIGFuZCBleGFtcGxlcywgc2VlIGh0dHA6Ly9keWdyYXBocy5jb20vXG4gKi9cblxuaW1wb3J0IER5Z3JhcGhMYXlvdXQgZnJvbSAnLi9keWdyYXBoLWxheW91dCc7XG5pbXBvcnQgRHlncmFwaENhbnZhc1JlbmRlcmVyIGZyb20gJy4vZHlncmFwaC1jYW52YXMnO1xuaW1wb3J0IER5Z3JhcGhPcHRpb25zIGZyb20gJy4vZHlncmFwaC1vcHRpb25zJztcbmltcG9ydCBEeWdyYXBoSW50ZXJhY3Rpb24gZnJvbSAnLi9keWdyYXBoLWludGVyYWN0aW9uLW1vZGVsJztcbmltcG9ydCAqIGFzIER5Z3JhcGhUaWNrZXJzIGZyb20gJy4vZHlncmFwaC10aWNrZXJzJztcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gJy4vZHlncmFwaC11dGlscyc7XG5pbXBvcnQgREVGQVVMVF9BVFRSUyBmcm9tICcuL2R5Z3JhcGgtZGVmYXVsdC1hdHRycyc7XG5pbXBvcnQgT1BUSU9OU19SRUZFUkVOQ0UgZnJvbSAnLi9keWdyYXBoLW9wdGlvbnMtcmVmZXJlbmNlJztcbmltcG9ydCBJRnJhbWVUYXJwIGZyb20gJy4vaWZyYW1lLXRhcnAnO1xuXG5pbXBvcnQgRGVmYXVsdEhhbmRsZXIgZnJvbSAnLi9kYXRhaGFuZGxlci9kZWZhdWx0JztcbmltcG9ydCBFcnJvckJhcnNIYW5kbGVyIGZyb20gJy4vZGF0YWhhbmRsZXIvYmFycy1lcnJvcic7XG5pbXBvcnQgQ3VzdG9tQmFyc0hhbmRsZXIgZnJvbSAnLi9kYXRhaGFuZGxlci9iYXJzLWN1c3RvbSc7XG5pbXBvcnQgRGVmYXVsdEZyYWN0aW9uSGFuZGxlciBmcm9tICcuL2RhdGFoYW5kbGVyL2RlZmF1bHQtZnJhY3Rpb25zJztcbmltcG9ydCBGcmFjdGlvbnNCYXJzSGFuZGxlciBmcm9tICcuL2RhdGFoYW5kbGVyL2JhcnMtZnJhY3Rpb25zJztcbmltcG9ydCBCYXJzSGFuZGxlciBmcm9tICcuL2RhdGFoYW5kbGVyL2JhcnMnO1xuXG5pbXBvcnQgQW5ub3RhdGlvbnNQbHVnaW4gZnJvbSAnLi9wbHVnaW5zL2Fubm90YXRpb25zJztcbmltcG9ydCBBeGVzUGx1Z2luIGZyb20gJy4vcGx1Z2lucy9heGVzJztcbmltcG9ydCBDaGFydExhYmVsc1BsdWdpbiBmcm9tICcuL3BsdWdpbnMvY2hhcnQtbGFiZWxzJztcbmltcG9ydCBHcmlkUGx1Z2luIGZyb20gJy4vcGx1Z2lucy9ncmlkJztcbmltcG9ydCBMZWdlbmRQbHVnaW4gZnJvbSAnLi9wbHVnaW5zL2xlZ2VuZCc7XG5pbXBvcnQgUmFuZ2VTZWxlY3RvclBsdWdpbiBmcm9tICcuL3BsdWdpbnMvcmFuZ2Utc2VsZWN0b3InO1xuXG5pbXBvcnQgR1ZpekNoYXJ0IGZyb20gJy4vZHlncmFwaC1ndml6JztcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogQGNsYXNzIENyZWF0ZXMgYW4gaW50ZXJhY3RpdmUsIHpvb21hYmxlIGNoYXJ0LlxuICogQG5hbWUgRHlncmFwaFxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtkaXYgfCBTdHJpbmd9IGRpdiBBIGRpdiBvciB0aGUgaWQgb2YgYSBkaXYgaW50byB3aGljaCB0byBjb25zdHJ1Y3RcbiAqIHRoZSBjaGFydC4gTXVzdCBub3QgaGF2ZSBhbnkgcGFkZGluZy5cbiAqIEBwYXJhbSB7U3RyaW5nIHwgRnVuY3Rpb259IGZpbGUgQSBmaWxlIGNvbnRhaW5pbmcgQ1NWIGRhdGEgb3IgYSBmdW5jdGlvblxuICogdGhhdCByZXR1cm5zIHRoaXMgZGF0YS4gVGhlIG1vc3QgYmFzaWMgZXhwZWN0ZWQgZm9ybWF0IGZvciBlYWNoIGxpbmUgaXNcbiAqIFwiWVlZWS9NTS9ERCx2YWwxLHZhbDIsLi4uXCIuIEZvciBtb3JlIGluZm9ybWF0aW9uLCBzZWVcbiAqIGh0dHA6Ly9keWdyYXBocy5jb20vZGF0YS5odG1sLlxuICogQHBhcmFtIHtPYmplY3R9IGF0dHJzIFZhcmlvdXMgb3RoZXIgYXR0cmlidXRlcywgZS5nLiBlcnJvckJhcnMgZGV0ZXJtaW5lc1xuICogd2hldGhlciB0aGUgaW5wdXQgZGF0YSBjb250YWlucyBlcnJvciByYW5nZXMuIEZvciBhIGNvbXBsZXRlIGxpc3Qgb2ZcbiAqIG9wdGlvbnMsIHNlZSBodHRwOi8vZHlncmFwaHMuY29tL29wdGlvbnMuaHRtbC5cbiAqL1xudmFyIER5Z3JhcGggPSBmdW5jdGlvbiBEeWdyYXBoKGRpdiwgZGF0YSwgb3B0cykge1xuICB0aGlzLl9faW5pdF9fKGRpdiwgZGF0YSwgb3B0cyk7XG59O1xuXG5EeWdyYXBoLk5BTUUgPSBcIkR5Z3JhcGhcIjtcbkR5Z3JhcGguVkVSU0lPTiA9IFwiMi4yLjFcIjtcblxuLy8gaW50ZXJuYWwgYXV0b2xvYWRlciB3b3JrYXJvdW5kXG52YXIgX2FkZHJlcXVpcmUgPSB7fTtcbkR5Z3JhcGguX3JlcXVpcmUgPSBmdW5jdGlvbiByZXF1aXJlKHdoYXQpIHtcbiAgcmV0dXJuICh3aGF0IGluIF9hZGRyZXF1aXJlID8gX2FkZHJlcXVpcmVbd2hhdF0gOiBEeWdyYXBoLl9yZXF1aXJlLl9iKHdoYXQpKTtcbn07XG5EeWdyYXBoLl9yZXF1aXJlLl9iID0gbnVsbDsgLy8gc2V0IGJ5IHhmcm1tb2RtYXAtZHkuanNcbkR5Z3JhcGguX3JlcXVpcmUuYWRkID0gZnVuY3Rpb24gYWRkKHdoYXQsIHRvd2hhdCkge1xuICBfYWRkcmVxdWlyZVt3aGF0XSA9IHRvd2hhdDtcbn07XG5cbi8vIFZhcmlvdXMgZGVmYXVsdCB2YWx1ZXNcbkR5Z3JhcGguREVGQVVMVF9ST0xMX1BFUklPRCA9IDE7XG5EeWdyYXBoLkRFRkFVTFRfV0lEVEggPSA0ODA7XG5EeWdyYXBoLkRFRkFVTFRfSEVJR0hUID0gMzIwO1xuXG4vLyBGb3IgbWF4IDYwIEh6LiBhbmltYXRpb246XG5EeWdyYXBoLkFOSU1BVElPTl9TVEVQUyA9IDEyO1xuRHlncmFwaC5BTklNQVRJT05fRFVSQVRJT04gPSAyMDA7XG5cbi8qKlxuICogU3RhbmRhcmQgcGxvdHRlcnMuIFRoZXNlIG1heSBiZSB1c2VkIGJ5IGNsaWVudHMuXG4gKiBBdmFpbGFibGUgcGxvdHRlcnMgYXJlOlxuICogLSBEeWdyYXBoLlBsb3R0ZXJzLmxpbmVQbG90dGVyOiBkcmF3cyBjZW50cmFsIGxpbmVzIChtb3N0IGNvbW1vbilcbiAqIC0gRHlncmFwaC5QbG90dGVycy5lcnJvclBsb3R0ZXI6IGRyYXdzIGhpZ2gvbG93IGJhbmRzXG4gKiAtIER5Z3JhcGguUGxvdHRlcnMuZmlsbFBsb3R0ZXI6IGRyYXdzIGZpbGxzIHVuZGVyIGxpbmVzICh1c2VkIHdpdGggZmlsbEdyYXBoKVxuICpcbiAqIEJ5IGRlZmF1bHQsIHRoZSBwbG90dGVyIGlzIFtmaWxsUGxvdHRlciwgZXJyb3JQbG90dGVyLCBsaW5lUGxvdHRlcl0uXG4gKiBUaGlzIGNhdXNlcyBhbGwgdGhlIGxpbmVzIHRvIGJlIGRyYXduIG92ZXIgYWxsIHRoZSBmaWxscy9iYW5kcy5cbiAqL1xuRHlncmFwaC5QbG90dGVycyA9IER5Z3JhcGhDYW52YXNSZW5kZXJlci5fUGxvdHRlcnM7XG5cbi8vIFVzZWQgZm9yIGluaXRpYWxpemluZyBhbm5vdGF0aW9uIENTUyBydWxlcyBvbmx5IG9uY2UuXG5EeWdyYXBoLmFkZGVkQW5ub3RhdGlvbkNTUyA9IGZhbHNlO1xuXG4vKipcbiAqIEluaXRpYWxpemVzIHRoZSBEeWdyYXBoLiBUaGlzIGNyZWF0ZXMgYSBuZXcgRElWIGFuZCBjb25zdHJ1Y3RzIHRoZSBQbG90S2l0XG4gKiBhbmQgY29udGV4dCAmbHQ7Y2FudmFzJmd0OyBpbnNpZGUgb2YgaXQuIFNlZSB0aGUgY29uc3RydWN0b3IgZm9yIGRldGFpbHMuXG4gKiBvbiB0aGUgcGFyYW1ldGVycy5cbiAqIEBwYXJhbSB7RWxlbWVudH0gZGl2IHRoZSBFbGVtZW50IHRvIHJlbmRlciB0aGUgZ3JhcGggaW50by5cbiAqIEBwYXJhbSB7c3RyaW5nIHwgRnVuY3Rpb259IGZpbGUgU291cmNlIGRhdGFcbiAqIEBwYXJhbSB7T2JqZWN0fSBhdHRycyBNaXNjZWxsYW5lb3VzIG90aGVyIG9wdGlvbnNcbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLl9faW5pdF9fID0gZnVuY3Rpb24oZGl2LCBmaWxlLCBhdHRycykge1xuICB0aGlzLmlzX2luaXRpYWxfZHJhd18gPSB0cnVlO1xuICB0aGlzLnJlYWR5Rm5zXyA9IFtdO1xuXG4gIC8vIFN1cHBvcnQgdHdvLWFyZ3VtZW50IGNvbnN0cnVjdG9yXG4gIGlmIChhdHRycyA9PT0gbnVsbCB8fCBhdHRycyA9PT0gdW5kZWZpbmVkKSB7IGF0dHJzID0ge307IH1cblxuICBhdHRycyA9IER5Z3JhcGguY29weVVzZXJBdHRyc18oYXR0cnMpO1xuXG4gIGlmICh0eXBlb2YoZGl2KSA9PSAnc3RyaW5nJykge1xuICAgIGRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRpdik7XG4gIH1cblxuICBpZiAoIWRpdikge1xuICAgIHRocm93IG5ldyBFcnJvcignQ29uc3RydWN0aW5nIGR5Z3JhcGggd2l0aCBhIG5vbi1leGlzdGVudCBkaXYhJyk7XG4gIH1cblxuICAvLyBDb3B5IHRoZSBpbXBvcnRhbnQgYml0cyBpbnRvIHRoZSBvYmplY3RcbiAgLy8gVE9ETyhkYW52ayk6IG1vc3Qgb2YgdGhlc2Ugc2hvdWxkIGp1c3Qgc3RheSBpbiB0aGUgYXR0cnNfIGRpY3Rpb25hcnkuXG4gIHRoaXMubWFpbmRpdl8gPSBkaXY7XG4gIHRoaXMuZmlsZV8gPSBmaWxlO1xuICB0aGlzLnJvbGxQZXJpb2RfID0gYXR0cnMucm9sbFBlcmlvZCB8fCBEeWdyYXBoLkRFRkFVTFRfUk9MTF9QRVJJT0Q7XG4gIHRoaXMucHJldmlvdXNWZXJ0aWNhbFhfID0gLTE7XG4gIHRoaXMuZnJhY3Rpb25zXyA9IGF0dHJzLmZyYWN0aW9ucyB8fCBmYWxzZTtcbiAgdGhpcy5kYXRlV2luZG93XyA9IGF0dHJzLmRhdGVXaW5kb3cgfHwgbnVsbDtcblxuICB0aGlzLmFubm90YXRpb25zXyA9IFtdO1xuXG4gIC8vIENsZWFyIHRoZSBkaXYuIFRoaXMgZW5zdXJlIHRoYXQsIGlmIG11bHRpcGxlIGR5Z3JhcGhzIGFyZSBwYXNzZWQgdGhlIHNhbWVcbiAgLy8gZGl2LCB0aGVuIG9ubHkgb25lIHdpbGwgYmUgZHJhd24uXG4gIGRpdi5pbm5lckhUTUwgPSBcIlwiO1xuXG4gIGNvbnN0IHJlc29sdmVkID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZGl2LCBudWxsKTtcbiAgaWYgKHJlc29sdmVkLnBhZGRpbmdMZWZ0ICE9PSBcIjBweFwiIHx8XG4gICAgICByZXNvbHZlZC5wYWRkaW5nUmlnaHQgIT09IFwiMHB4XCIgfHxcbiAgICAgIHJlc29sdmVkLnBhZGRpbmdUb3AgIT09IFwiMHB4XCIgfHxcbiAgICAgIHJlc29sdmVkLnBhZGRpbmdCb3R0b20gIT09IFwiMHB4XCIpXG4gICAgY29uc29sZS5lcnJvcignTWFpbiBkaXYgY29udGFpbnMgcGFkZGluZzsgZ3JhcGggd2lsbCBtaXNiZWhhdmUnKTtcblxuICAvLyBGb3IgaGlzdG9yaWNhbCByZWFzb25zLCB0aGUgJ3dpZHRoJyBhbmQgJ2hlaWdodCcgb3B0aW9ucyB0cnVtcCBhbGwgQ1NTXG4gIC8vIHJ1bGVzIF9leGNlcHRfIGZvciBhbiBleHBsaWNpdCAnd2lkdGgnIG9yICdoZWlnaHQnIG9uIHRoZSBkaXYuXG4gIC8vIEFzIGFuIGFkZGVkIGNvbnZlbmllbmNlLCBpZiB0aGUgZGl2IGhhcyB6ZXJvIGhlaWdodCAobGlrZSA8ZGl2PjwvZGl2PiBkb2VzXG4gIC8vIHdpdGhvdXQgYW55IHN0eWxlcyksIHRoZW4gd2UgdXNlIGEgZGVmYXVsdCBoZWlnaHQvd2lkdGguXG4gIGlmIChkaXYuc3R5bGUud2lkdGggPT09ICcnICYmIGF0dHJzLndpZHRoKSB7XG4gICAgZGl2LnN0eWxlLndpZHRoID0gYXR0cnMud2lkdGggKyBcInB4XCI7XG4gIH1cbiAgaWYgKGRpdi5zdHlsZS5oZWlnaHQgPT09ICcnICYmIGF0dHJzLmhlaWdodCkge1xuICAgIGRpdi5zdHlsZS5oZWlnaHQgPSBhdHRycy5oZWlnaHQgKyBcInB4XCI7XG4gIH1cbiAgaWYgKGRpdi5zdHlsZS5oZWlnaHQgPT09ICcnICYmIGRpdi5jbGllbnRIZWlnaHQgPT09IDApIHtcbiAgICBkaXYuc3R5bGUuaGVpZ2h0ID0gRHlncmFwaC5ERUZBVUxUX0hFSUdIVCArIFwicHhcIjtcbiAgICBpZiAoZGl2LnN0eWxlLndpZHRoID09PSAnJykge1xuICAgICAgZGl2LnN0eWxlLndpZHRoID0gRHlncmFwaC5ERUZBVUxUX1dJRFRIICsgXCJweFwiO1xuICAgIH1cbiAgfVxuICAvLyBUaGVzZSB3aWxsIGJlIHplcm8gaWYgdGhlIGR5Z3JhcGgncyBkaXYgaXMgaGlkZGVuLiBJbiB0aGF0IGNhc2UsXG4gIC8vIHVzZSB0aGUgdXNlci1zcGVjaWZpZWQgYXR0cmlidXRlcyBpZiBwcmVzZW50LiBJZiBub3QsIHVzZSB6ZXJvXG4gIC8vIGFuZCBhc3N1bWUgdGhlIHVzZXIgd2lsbCBjYWxsIHJlc2l6ZSB0byBmaXggdGhpbmdzIGxhdGVyLlxuICB0aGlzLndpZHRoXyA9IGRpdi5jbGllbnRXaWR0aCB8fCBhdHRycy53aWR0aCB8fCAwO1xuICB0aGlzLmhlaWdodF8gPSBkaXYuY2xpZW50SGVpZ2h0IHx8IGF0dHJzLmhlaWdodCB8fCAwO1xuXG4gIC8vIFRPRE8oZGFudmspOiBzZXQgZmlsbEdyYXBoIHRvIGJlIHBhcnQgb2YgYXR0cnNfIGhlcmUsIG5vdCB1c2VyX2F0dHJzXy5cbiAgaWYgKGF0dHJzLnN0YWNrZWRHcmFwaCkge1xuICAgIGF0dHJzLmZpbGxHcmFwaCA9IHRydWU7XG4gICAgLy8gVE9ETyhuaWtoaWxrKTogQWRkIGFueSBvdGhlciBzdGFja2VkR3JhcGggY2hlY2tzIGhlcmUuXG4gIH1cblxuICAvLyBERVBSRUNBVElPTiBXQVJOSU5HOiBBbGwgb3B0aW9uIHByb2Nlc3Npbmcgc2hvdWxkIGJlIG1vdmVkIGZyb21cbiAgLy8gYXR0cnNfIGFuZCB1c2VyX2F0dHJzXyB0byBvcHRpb25zXywgd2hpY2ggaG9sZHMgYWxsIHRoaXMgaW5mb3JtYXRpb24uXG4gIC8vXG4gIC8vIER5Z3JhcGhzIGhhcyBtYW55IG9wdGlvbnMsIHNvbWUgb2Ygd2hpY2ggaW50ZXJhY3Qgd2l0aCBvbmUgYW5vdGhlci5cbiAgLy8gVG8ga2VlcCB0cmFjayBvZiBldmVyeXRoaW5nLCB3ZSBtYWludGFpbiB0d28gc2V0cyBvZiBvcHRpb25zOlxuICAvL1xuICAvLyAgdGhpcy51c2VyX2F0dHJzXyAgIG9ubHkgb3B0aW9ucyBleHBsaWNpdGx5IHNldCBieSB0aGUgdXNlci5cbiAgLy8gIHRoaXMuYXR0cnNfICAgICAgICBkZWZhdWx0cywgb3B0aW9ucyBkZXJpdmVkIGZyb20gdXNlcl9hdHRyc18sIGRhdGEuXG4gIC8vXG4gIC8vIE9wdGlvbnMgYXJlIHRoZW4gYWNjZXNzZWQgdGhpcy5hdHRyXygnYXR0cicpLCB3aGljaCBmaXJzdCBsb29rcyBhdFxuICAvLyB1c2VyX2F0dHJzXyBhbmQgdGhlbiBjb21wdXRlZCBhdHRyc18uIFRoaXMgd2F5IER5Z3JhcGhzIGNhbiBzZXQgaW50ZWxsaWdlbnRcbiAgLy8gZGVmYXVsdHMgd2l0aG91dCBvdmVycmlkaW5nIGJlaGF2aW9yIHRoYXQgdGhlIHVzZXIgc3BlY2lmaWNhbGx5IGFza3MgZm9yLlxuICB0aGlzLnVzZXJfYXR0cnNfID0ge307XG4gIHV0aWxzLnVwZGF0ZSh0aGlzLnVzZXJfYXR0cnNfLCBhdHRycyk7XG5cbiAgLy8gVGhpcyBzZXF1ZW5jZSBlbnN1cmVzIHRoYXQgRHlncmFwaC5ERUZBVUxUX0FUVFJTIGlzIG5ldmVyIG1vZGlmaWVkLlxuICB0aGlzLmF0dHJzXyA9IHt9O1xuICB1dGlscy51cGRhdGVEZWVwKHRoaXMuYXR0cnNfLCBERUZBVUxUX0FUVFJTKTtcblxuICB0aGlzLmJvdW5kYXJ5SWRzXyA9IFtdO1xuICB0aGlzLnNldEluZGV4QnlOYW1lXyA9IHt9O1xuICB0aGlzLmRhdGFzZXRJbmRleF8gPSBbXTtcblxuICB0aGlzLnJlZ2lzdGVyZWRFdmVudHNfID0gW107XG4gIHRoaXMuZXZlbnRMaXN0ZW5lcnNfID0ge307XG5cbiAgdGhpcy5hdHRyaWJ1dGVzXyA9IG5ldyBEeWdyYXBoT3B0aW9ucyh0aGlzKTtcblxuICAvLyBDcmVhdGUgdGhlIGNvbnRhaW5pbmcgRElWIGFuZCBvdGhlciBpbnRlcmFjdGl2ZSBlbGVtZW50c1xuICB0aGlzLmNyZWF0ZUludGVyZmFjZV8oKTtcblxuICAvLyBBY3RpdmF0ZSBwbHVnaW5zLlxuICB0aGlzLnBsdWdpbnNfID0gW107XG4gIHZhciBwbHVnaW5zID0gRHlncmFwaC5QTFVHSU5TLmNvbmNhdCh0aGlzLmdldE9wdGlvbigncGx1Z2lucycpKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwbHVnaW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gdGhlIHBsdWdpbnMgb3B0aW9uIG1heSBjb250YWluIGVpdGhlciBwbHVnaW4gY2xhc3NlcyBvciBpbnN0YW5jZXMuXG4gICAgLy8gUGx1Z2luIGluc3RhbmNlcyBjb250YWluIGFuIGFjdGl2YXRlIG1ldGhvZC5cbiAgICB2YXIgUGx1Z2luID0gcGx1Z2luc1tpXTsgIC8vIGVpdGhlciBhIGNvbnN0cnVjdG9yIG9yIGFuIGluc3RhbmNlLlxuICAgIHZhciBwbHVnaW5JbnN0YW5jZTtcbiAgICBpZiAodHlwZW9mKFBsdWdpbi5hY3RpdmF0ZSkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBwbHVnaW5JbnN0YW5jZSA9IFBsdWdpbjtcbiAgICB9IGVsc2Uge1xuICAgICAgcGx1Z2luSW5zdGFuY2UgPSBuZXcgUGx1Z2luKCk7XG4gICAgfVxuXG4gICAgdmFyIHBsdWdpbkRpY3QgPSB7XG4gICAgICBwbHVnaW46IHBsdWdpbkluc3RhbmNlLFxuICAgICAgZXZlbnRzOiB7fSxcbiAgICAgIG9wdGlvbnM6IHt9LFxuICAgICAgcGx1Z2luT3B0aW9uczoge31cbiAgICB9O1xuXG4gICAgdmFyIGhhbmRsZXJzID0gcGx1Z2luSW5zdGFuY2UuYWN0aXZhdGUodGhpcyk7XG4gICAgZm9yICh2YXIgZXZlbnROYW1lIGluIGhhbmRsZXJzKSB7XG4gICAgICBpZiAoIWhhbmRsZXJzLmhhc093blByb3BlcnR5KGV2ZW50TmFtZSkpIGNvbnRpbnVlO1xuICAgICAgLy8gVE9ETyhkYW52ayk6IHZhbGlkYXRlIGV2ZW50TmFtZS5cbiAgICAgIHBsdWdpbkRpY3QuZXZlbnRzW2V2ZW50TmFtZV0gPSBoYW5kbGVyc1tldmVudE5hbWVdO1xuICAgIH1cblxuICAgIHRoaXMucGx1Z2luc18ucHVzaChwbHVnaW5EaWN0KTtcbiAgfVxuXG4gIC8vIEF0IHRoaXMgcG9pbnQsIHBsdWdpbnMgY2FuIG5vIGxvbmdlciByZWdpc3RlciBldmVudCBoYW5kbGVycy5cbiAgLy8gQ29uc3RydWN0IGEgbWFwIGZyb20gZXZlbnQgLT4gb3JkZXJlZCBsaXN0IG9mIFtjYWxsYmFjaywgcGx1Z2luXS5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBsdWdpbnNfLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHBsdWdpbl9kaWN0ID0gdGhpcy5wbHVnaW5zX1tpXTtcbiAgICBmb3IgKHZhciBldmVudE5hbWUgaW4gcGx1Z2luX2RpY3QuZXZlbnRzKSB7XG4gICAgICBpZiAoIXBsdWdpbl9kaWN0LmV2ZW50cy5oYXNPd25Qcm9wZXJ0eShldmVudE5hbWUpKSBjb250aW51ZTtcbiAgICAgIHZhciBjYWxsYmFjayA9IHBsdWdpbl9kaWN0LmV2ZW50c1tldmVudE5hbWVdO1xuXG4gICAgICB2YXIgcGFpciA9IFtwbHVnaW5fZGljdC5wbHVnaW4sIGNhbGxiYWNrXTtcbiAgICAgIGlmICghKGV2ZW50TmFtZSBpbiB0aGlzLmV2ZW50TGlzdGVuZXJzXykpIHtcbiAgICAgICAgdGhpcy5ldmVudExpc3RlbmVyc19bZXZlbnROYW1lXSA9IFtwYWlyXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZXZlbnRMaXN0ZW5lcnNfW2V2ZW50TmFtZV0ucHVzaChwYWlyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB0aGlzLmNyZWF0ZURyYWdJbnRlcmZhY2VfKCk7XG5cbiAgdGhpcy5zdGFydF8oKTtcbn07XG5cbi8qKlxuICogVHJpZ2dlcnMgYSBjYXNjYWRlIG9mIGV2ZW50cyB0byB0aGUgdmFyaW91cyBwbHVnaW5zIHdoaWNoIGFyZSBpbnRlcmVzdGVkIGluIHRoZW0uXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIFwiZGVmYXVsdCBiZWhhdmlvclwiIHNob3VsZCBiZSBwcmV2ZW50ZWQsIGkuZS4gaWYgb25lXG4gKiBvZiB0aGUgZXZlbnQgbGlzdGVuZXJzIGNhbGxlZCBldmVudC5wcmV2ZW50RGVmYXVsdCgpLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuY2FzY2FkZUV2ZW50c18gPSBmdW5jdGlvbihuYW1lLCBleHRyYV9wcm9wcykge1xuICBpZiAoIShuYW1lIGluIHRoaXMuZXZlbnRMaXN0ZW5lcnNfKSkgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIFFVRVNUSU9OOiBjYW4gd2UgdXNlIG9iamVjdHMgJiBwcm90b3R5cGVzIHRvIHNwZWVkIHRoaXMgdXA/XG4gIHZhciBlID0ge1xuICAgIGR5Z3JhcGg6IHRoaXMsXG4gICAgY2FuY2VsYWJsZTogZmFsc2UsXG4gICAgZGVmYXVsdFByZXZlbnRlZDogZmFsc2UsXG4gICAgcHJldmVudERlZmF1bHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFlLmNhbmNlbGFibGUpIHRocm93IFwiQ2Fubm90IGNhbGwgcHJldmVudERlZmF1bHQgb24gbm9uLWNhbmNlbGFibGUgZXZlbnQuXCI7XG4gICAgICBlLmRlZmF1bHRQcmV2ZW50ZWQgPSB0cnVlO1xuICAgIH0sXG4gICAgcHJvcGFnYXRpb25TdG9wcGVkOiBmYWxzZSxcbiAgICBzdG9wUHJvcGFnYXRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgZS5wcm9wYWdhdGlvblN0b3BwZWQgPSB0cnVlO1xuICAgIH1cbiAgfTtcbiAgdXRpbHMudXBkYXRlKGUsIGV4dHJhX3Byb3BzKTtcblxuICB2YXIgY2FsbGJhY2tfcGx1Z2luX3BhaXJzID0gdGhpcy5ldmVudExpc3RlbmVyc19bbmFtZV07XG4gIGlmIChjYWxsYmFja19wbHVnaW5fcGFpcnMpIHtcbiAgICBmb3IgKHZhciBpID0gY2FsbGJhY2tfcGx1Z2luX3BhaXJzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB2YXIgcGx1Z2luID0gY2FsbGJhY2tfcGx1Z2luX3BhaXJzW2ldWzBdO1xuICAgICAgdmFyIGNhbGxiYWNrID0gY2FsbGJhY2tfcGx1Z2luX3BhaXJzW2ldWzFdO1xuICAgICAgY2FsbGJhY2suY2FsbChwbHVnaW4sIGUpO1xuICAgICAgaWYgKGUucHJvcGFnYXRpb25TdG9wcGVkKSBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGUuZGVmYXVsdFByZXZlbnRlZDtcbn07XG5cbi8qKlxuICogRmV0Y2ggYSBwbHVnaW4gaW5zdGFuY2Ugb2YgYSBwYXJ0aWN1bGFyIGNsYXNzLiBPbmx5IGZvciB0ZXN0aW5nLlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7IUNsYXNzfSB0eXBlIFRoZSB0eXBlIG9mIHRoZSBwbHVnaW4uXG4gKiBAcmV0dXJuIHtPYmplY3R9IEluc3RhbmNlIG9mIHRoZSBwbHVnaW4sIG9yIG51bGwgaWYgdGhlcmUgaXMgbm9uZS5cbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuZ2V0UGx1Z2luSW5zdGFuY2VfID0gZnVuY3Rpb24odHlwZSkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGx1Z2luc18ubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcCA9IHRoaXMucGx1Z2luc19baV07XG4gICAgaWYgKHAucGx1Z2luIGluc3RhbmNlb2YgdHlwZSkge1xuICAgICAgcmV0dXJuIHAucGx1Z2luO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgem9vbWVkIHN0YXR1cyBvZiB0aGUgY2hhcnQgZm9yIG9uZSBvciBib3RoIGF4ZXMuXG4gKlxuICogQXhpcyBpcyBhbiBvcHRpb25hbCBwYXJhbWV0ZXIuIENhbiBiZSBzZXQgdG8gJ3gnIG9yICd5Jy5cbiAqXG4gKiBUaGUgem9vbWVkIHN0YXR1cyBmb3IgYW4gYXhpcyBpcyBzZXQgd2hlbmV2ZXIgYSB1c2VyIHpvb21zIHVzaW5nIHRoZSBtb3VzZVxuICogb3Igd2hlbiB0aGUgZGF0ZVdpbmRvdyBvciB2YWx1ZVJhbmdlIGFyZSB1cGRhdGVkLiBEb3VibGUtY2xpY2tpbmcgb3IgY2FsbGluZ1xuICogcmVzZXRab29tKCkgcmVzZXRzIHRoZSB6b29tIHN0YXR1cyBmb3IgdGhlIGNoYXJ0LlxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5pc1pvb21lZCA9IGZ1bmN0aW9uKGF4aXMpIHtcbiAgY29uc3QgaXNab29tZWRYID0gISF0aGlzLmRhdGVXaW5kb3dfO1xuICBpZiAoYXhpcyA9PT0gJ3gnKSByZXR1cm4gaXNab29tZWRYO1xuXG4gIGNvbnN0IGlzWm9vbWVkWSA9IHRoaXMuYXhlc18ubWFwKGF4aXMgPT4gISFheGlzLnZhbHVlUmFuZ2UpLmluZGV4T2YodHJ1ZSkgPj0gMDtcbiAgaWYgKGF4aXMgPT09IG51bGwgfHwgYXhpcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGlzWm9vbWVkWCB8fCBpc1pvb21lZFk7XG4gIH1cbiAgaWYgKGF4aXMgPT09ICd5JykgcmV0dXJuIGlzWm9vbWVkWTtcblxuICB0aHJvdyBuZXcgRXJyb3IoYGF4aXMgcGFyYW1ldGVyIGlzIFske2F4aXN9XSBtdXN0IGJlIG51bGwsICd4JyBvciAneScuYCk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIER5Z3JhcGggb2JqZWN0LCBpbmNsdWRpbmcgaXRzIGNvbnRhaW5pbmcgSUQuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHZhciBtYWluZGl2ID0gdGhpcy5tYWluZGl2XztcbiAgdmFyIGlkID0gKG1haW5kaXYgJiYgbWFpbmRpdi5pZCkgPyBtYWluZGl2LmlkIDogbWFpbmRpdjtcbiAgcmV0dXJuIFwiW0R5Z3JhcGggXCIgKyBpZCArIFwiXVwiO1xufTtcblxuLyoqXG4gKiBAcHJpdmF0ZVxuICogUmV0dXJucyB0aGUgdmFsdWUgb2YgYW4gb3B0aW9uLiBUaGlzIG1heSBiZSBzZXQgYnkgdGhlIHVzZXIgKGVpdGhlciBpbiB0aGVcbiAqIGNvbnN0cnVjdG9yIG9yIGJ5IGNhbGxpbmcgdXBkYXRlT3B0aW9ucykgb3IgYnkgZHlncmFwaHMsIGFuZCBtYXkgYmUgc2V0IHRvIGFcbiAqIHBlci1zZXJpZXMgdmFsdWUuXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgb3B0aW9uLCBlLmcuICdyb2xsUGVyaW9kJy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbc2VyaWVzTmFtZV0gVGhlIG5hbWUgb2YgdGhlIHNlcmllcyB0byB3aGljaCB0aGUgb3B0aW9uXG4gKiB3aWxsIGJlIGFwcGxpZWQuIElmIG5vIHBlci1zZXJpZXMgdmFsdWUgb2YgdGhpcyBvcHRpb24gaXMgYXZhaWxhYmxlLCB0aGVuXG4gKiB0aGUgZ2xvYmFsIHZhbHVlIGlzIHJldHVybmVkLiBUaGlzIGlzIG9wdGlvbmFsLlxuICogQHJldHVybiB7Li4ufSBUaGUgdmFsdWUgb2YgdGhlIG9wdGlvbi5cbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuYXR0cl8gPSBmdW5jdGlvbihuYW1lLCBzZXJpZXNOYW1lKSB7XG4gIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgLy8gRm9yIFwicHJvZHVjdGlvblwiIGNvZGUsIHRoaXMgZ2V0cyByZW1vdmVkIGJ5IHVnbGlmeWpzLlxuICAgIGlmICh0eXBlb2YoT1BUSU9OU19SRUZFUkVOQ0UpID09PSAndW5kZWZpbmVkJykge1xuICAgICAgY29uc29sZS5lcnJvcignTXVzdCBpbmNsdWRlIG9wdGlvbnMgcmVmZXJlbmNlIEpTIGZvciB0ZXN0aW5nJyk7XG4gICAgfSBlbHNlIGlmICghT1BUSU9OU19SRUZFUkVOQ0UuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0R5Z3JhcGhzIGlzIHVzaW5nIHByb3BlcnR5ICcgKyBuYW1lICsgJywgd2hpY2ggaGFzIG5vICcgK1xuICAgICAgICAgICAgICAgICAgICAnZW50cnkgaW4gdGhlIER5Z3JhcGhzLk9QVElPTlNfUkVGRVJFTkNFIGxpc3RpbmcuJyk7XG4gICAgICAvLyBPbmx5IGxvZyB0aGlzIGVycm9yIG9uY2UuXG4gICAgICBPUFRJT05TX1JFRkVSRU5DRVtuYW1lXSA9IHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBzZXJpZXNOYW1lID8gdGhpcy5hdHRyaWJ1dGVzXy5nZXRGb3JTZXJpZXMobmFtZSwgc2VyaWVzTmFtZSkgOiB0aGlzLmF0dHJpYnV0ZXNfLmdldChuYW1lKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY3VycmVudCB2YWx1ZSBmb3IgYW4gb3B0aW9uLCBhcyBzZXQgaW4gdGhlIGNvbnN0cnVjdG9yIG9yIHZpYVxuICogdXBkYXRlT3B0aW9ucy4gWW91IG1heSBwYXNzIGluIGFuIChvcHRpb25hbCkgc2VyaWVzIG5hbWUgdG8gZ2V0IHBlci1zZXJpZXNcbiAqIHZhbHVlcyBmb3IgdGhlIG9wdGlvbi5cbiAqXG4gKiBBbGwgdmFsdWVzIHJldHVybmVkIGJ5IHRoaXMgbWV0aG9kIHNob3VsZCBiZSBjb25zaWRlcmVkIGltbXV0YWJsZS4gSWYgeW91XG4gKiBtb2RpZnkgdGhlbSwgdGhlcmUgaXMgbm8gZ3VhcmFudGVlIHRoYXQgdGhlIGNoYW5nZXMgd2lsbCBiZSBob25vcmVkIG9yIHRoYXRcbiAqIGR5Z3JhcGhzIHdpbGwgcmVtYWluIGluIGEgY29uc2lzdGVudCBzdGF0ZS4gSWYgeW91IHdhbnQgdG8gbW9kaWZ5IGFuIG9wdGlvbixcbiAqIHVzZSB1cGRhdGVPcHRpb25zKCkgaW5zdGVhZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgb3B0aW9uIChlLmcuICdzdHJva2VXaWR0aCcpXG4gKiBAcGFyYW0ge3N0cmluZz19IG9wdF9zZXJpZXNOYW1lIFNlcmllcyBuYW1lIHRvIGdldCBwZXItc2VyaWVzIHZhbHVlcy5cbiAqIEByZXR1cm4geyp9IFRoZSB2YWx1ZSBvZiB0aGUgb3B0aW9uLlxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5nZXRPcHRpb24gPSBmdW5jdGlvbihuYW1lLCBvcHRfc2VyaWVzTmFtZSkge1xuICByZXR1cm4gdGhpcy5hdHRyXyhuYW1lLCBvcHRfc2VyaWVzTmFtZSk7XG59O1xuXG4vKipcbiAqIExpa2UgZ2V0T3B0aW9uKCksIGJ1dCBzcGVjaWZpY2FsbHkgcmV0dXJucyBhIG51bWJlci5cbiAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBmdW5jdGlvbiBmb3Igd29ya2luZyB3aXRoIHRoZSBDbG9zdXJlIENvbXBpbGVyLlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIG9wdGlvbiAoZS5nLiAnc3Ryb2tlV2lkdGgnKVxuICogQHBhcmFtIHtzdHJpbmc9fSBvcHRfc2VyaWVzTmFtZSBTZXJpZXMgbmFtZSB0byBnZXQgcGVyLXNlcmllcyB2YWx1ZXMuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSB2YWx1ZSBvZiB0aGUgb3B0aW9uLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuZ2V0TnVtZXJpY09wdGlvbiA9IGZ1bmN0aW9uKG5hbWUsIG9wdF9zZXJpZXNOYW1lKSB7XG4gIHJldHVybiAvKiogQHR5cGV7bnVtYmVyfSAqLyh0aGlzLmdldE9wdGlvbihuYW1lLCBvcHRfc2VyaWVzTmFtZSkpO1xufTtcblxuLyoqXG4gKiBMaWtlIGdldE9wdGlvbigpLCBidXQgc3BlY2lmaWNhbGx5IHJldHVybnMgYSBzdHJpbmcuXG4gKiBUaGlzIGlzIGEgY29udmVuaWVuY2UgZnVuY3Rpb24gZm9yIHdvcmtpbmcgd2l0aCB0aGUgQ2xvc3VyZSBDb21waWxlci5cbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBvcHRpb24gKGUuZy4gJ3N0cm9rZVdpZHRoJylcbiAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X3Nlcmllc05hbWUgU2VyaWVzIG5hbWUgdG8gZ2V0IHBlci1zZXJpZXMgdmFsdWVzLlxuICogQHJldHVybiB7c3RyaW5nfSBUaGUgdmFsdWUgb2YgdGhlIG9wdGlvbi5cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmdldFN0cmluZ09wdGlvbiA9IGZ1bmN0aW9uKG5hbWUsIG9wdF9zZXJpZXNOYW1lKSB7XG4gIHJldHVybiAvKiogQHR5cGV7c3RyaW5nfSAqLyh0aGlzLmdldE9wdGlvbihuYW1lLCBvcHRfc2VyaWVzTmFtZSkpO1xufTtcblxuLyoqXG4gKiBMaWtlIGdldE9wdGlvbigpLCBidXQgc3BlY2lmaWNhbGx5IHJldHVybnMgYSBib29sZWFuLlxuICogVGhpcyBpcyBhIGNvbnZlbmllbmNlIGZ1bmN0aW9uIGZvciB3b3JraW5nIHdpdGggdGhlIENsb3N1cmUgQ29tcGlsZXIuXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgb3B0aW9uIChlLmcuICdzdHJva2VXaWR0aCcpXG4gKiBAcGFyYW0ge3N0cmluZz19IG9wdF9zZXJpZXNOYW1lIFNlcmllcyBuYW1lIHRvIGdldCBwZXItc2VyaWVzIHZhbHVlcy5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRoZSB2YWx1ZSBvZiB0aGUgb3B0aW9uLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuZ2V0Qm9vbGVhbk9wdGlvbiA9IGZ1bmN0aW9uKG5hbWUsIG9wdF9zZXJpZXNOYW1lKSB7XG4gIHJldHVybiAvKiogQHR5cGV7Ym9vbGVhbn0gKi8odGhpcy5nZXRPcHRpb24obmFtZSwgb3B0X3Nlcmllc05hbWUpKTtcbn07XG5cbi8qKlxuICogTGlrZSBnZXRPcHRpb24oKSwgYnV0IHNwZWNpZmljYWxseSByZXR1cm5zIGEgZnVuY3Rpb24uXG4gKiBUaGlzIGlzIGEgY29udmVuaWVuY2UgZnVuY3Rpb24gZm9yIHdvcmtpbmcgd2l0aCB0aGUgQ2xvc3VyZSBDb21waWxlci5cbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBvcHRpb24gKGUuZy4gJ3N0cm9rZVdpZHRoJylcbiAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X3Nlcmllc05hbWUgU2VyaWVzIG5hbWUgdG8gZ2V0IHBlci1zZXJpZXMgdmFsdWVzLlxuICogQHJldHVybiB7ZnVuY3Rpb24oLi4uKX0gVGhlIHZhbHVlIG9mIHRoZSBvcHRpb24uXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5nZXRGdW5jdGlvbk9wdGlvbiA9IGZ1bmN0aW9uKG5hbWUsIG9wdF9zZXJpZXNOYW1lKSB7XG4gIHJldHVybiAvKiogQHR5cGV7ZnVuY3Rpb24oLi4uKX0gKi8odGhpcy5nZXRPcHRpb24obmFtZSwgb3B0X3Nlcmllc05hbWUpKTtcbn07XG5cbkR5Z3JhcGgucHJvdG90eXBlLmdldE9wdGlvbkZvckF4aXMgPSBmdW5jdGlvbihuYW1lLCBheGlzKSB7XG4gIHJldHVybiB0aGlzLmF0dHJpYnV0ZXNfLmdldEZvckF4aXMobmFtZSwgYXhpcyk7XG59O1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gYXhpcyBUaGUgbmFtZSBvZiB0aGUgYXhpcyAoaS5lLiAneCcsICd5JyBvciAneTInKVxuICogQHJldHVybiB7Li4ufSBBIGZ1bmN0aW9uIG1hcHBpbmcgc3RyaW5nIC0+IG9wdGlvbiB2YWx1ZVxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5vcHRpb25zVmlld0ZvckF4aXNfID0gZnVuY3Rpb24oYXhpcykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHJldHVybiBmdW5jdGlvbihvcHQpIHtcbiAgICB2YXIgYXhpc19vcHRzID0gc2VsZi51c2VyX2F0dHJzXy5heGVzO1xuICAgIGlmIChheGlzX29wdHMgJiYgYXhpc19vcHRzW2F4aXNdICYmIGF4aXNfb3B0c1theGlzXS5oYXNPd25Qcm9wZXJ0eShvcHQpKSB7XG4gICAgICByZXR1cm4gYXhpc19vcHRzW2F4aXNdW29wdF07XG4gICAgfVxuXG4gICAgLy8gSSBkb24ndCBsaWtlIHRoYXQgdGhpcyBpcyBpbiBhIHNlY29uZCBzcG90LlxuICAgIGlmIChheGlzID09PSAneCcgJiYgb3B0ID09PSAnbG9nc2NhbGUnKSB7XG4gICAgICAvLyByZXR1cm4gdGhlIGRlZmF1bHQgdmFsdWUuXG4gICAgICAvLyBUT0RPKGtvbmlnc2JlcmcpOiBwdWxsIHRoZSBkZWZhdWx0IGZyb20gYSBnbG9iYWwgZGVmYXVsdC5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyB1c2VyLXNwZWNpZmllZCBhdHRyaWJ1dGVzIGFsd2F5cyB0cnVtcCBkZWZhdWx0cywgZXZlbiBpZiB0aGV5J3JlIGxlc3NcbiAgICAvLyBzcGVjaWZpYy5cbiAgICBpZiAodHlwZW9mKHNlbGYudXNlcl9hdHRyc19bb3B0XSkgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiBzZWxmLnVzZXJfYXR0cnNfW29wdF07XG4gICAgfVxuXG4gICAgYXhpc19vcHRzID0gc2VsZi5hdHRyc18uYXhlcztcbiAgICBpZiAoYXhpc19vcHRzICYmIGF4aXNfb3B0c1theGlzXSAmJiBheGlzX29wdHNbYXhpc10uaGFzT3duUHJvcGVydHkob3B0KSkge1xuICAgICAgcmV0dXJuIGF4aXNfb3B0c1theGlzXVtvcHRdO1xuICAgIH1cbiAgICAvLyBjaGVjayBvbGQtc3R5bGUgYXhpcyBvcHRpb25zXG4gICAgLy8gVE9ETyhkYW52ayk6IGFkZCBhIGRlcHJlY2F0aW9uIHdhcm5pbmcgaWYgZWl0aGVyIG9mIHRoZXNlIG1hdGNoLlxuICAgIGlmIChheGlzID09ICd5JyAmJiBzZWxmLmF4ZXNfWzBdLmhhc093blByb3BlcnR5KG9wdCkpIHtcbiAgICAgIHJldHVybiBzZWxmLmF4ZXNfWzBdW29wdF07XG4gICAgfSBlbHNlIGlmIChheGlzID09ICd5MicgJiYgc2VsZi5heGVzX1sxXS5oYXNPd25Qcm9wZXJ0eShvcHQpKSB7XG4gICAgICByZXR1cm4gc2VsZi5heGVzX1sxXVtvcHRdO1xuICAgIH1cbiAgICByZXR1cm4gc2VsZi5hdHRyXyhvcHQpO1xuICB9O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBjdXJyZW50IHJvbGxpbmcgcGVyaW9kLCBhcyBzZXQgYnkgdGhlIHVzZXIgb3IgYW4gb3B0aW9uLlxuICogQHJldHVybiB7bnVtYmVyfSBUaGUgbnVtYmVyIG9mIHBvaW50cyBpbiB0aGUgcm9sbGluZyB3aW5kb3dcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUucm9sbFBlcmlvZCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5yb2xsUGVyaW9kXztcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY3VycmVudGx5LXZpc2libGUgeC1yYW5nZS4gVGhpcyBjYW4gYmUgYWZmZWN0ZWQgYnkgem9vbWluZyxcbiAqIHBhbm5pbmcgb3IgYSBjYWxsIHRvIHVwZGF0ZU9wdGlvbnMuXG4gKiBSZXR1cm5zIGEgdHdvLWVsZW1lbnQgYXJyYXk6IFtsZWZ0LCByaWdodF0uXG4gKiBJZiB0aGUgRHlncmFwaCBoYXMgZGF0ZXMgb24gdGhlIHgtYXhpcywgdGhlc2Ugd2lsbCBiZSBtaWxsaXMgc2luY2UgZXBvY2guXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnhBeGlzUmFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuZGF0ZVdpbmRvd18gPyB0aGlzLmRhdGVXaW5kb3dfIDogdGhpcy54QXhpc0V4dHJlbWVzKCk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGxvd2VyLSBhbmQgdXBwZXItYm91bmQgeC1heGlzIHZhbHVlcyBvZiB0aGUgZGF0YSBzZXQuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnhBeGlzRXh0cmVtZXMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHBhZCA9IHRoaXMuZ2V0TnVtZXJpY09wdGlvbigneFJhbmdlUGFkJykgLyB0aGlzLnBsb3R0ZXJfLmFyZWEudztcbiAgaWYgKHRoaXMubnVtUm93cygpID09PSAwKSB7XG4gICAgcmV0dXJuIFswIC0gcGFkLCAxICsgcGFkXTtcbiAgfVxuICB2YXIgbGVmdCA9IHRoaXMucmF3RGF0YV9bMF1bMF07XG4gIHZhciByaWdodCA9IHRoaXMucmF3RGF0YV9bdGhpcy5yYXdEYXRhXy5sZW5ndGggLSAxXVswXTtcbiAgaWYgKHBhZCkge1xuICAgIC8vIE11c3Qga2VlcCB0aGlzIGluIHN5bmMgd2l0aCBkeWdyYXBoLWxheW91dCBfZXZhbHVhdGVMaW1pdHMoKVxuICAgIHZhciByYW5nZSA9IHJpZ2h0IC0gbGVmdDtcbiAgICBsZWZ0IC09IHJhbmdlICogcGFkO1xuICAgIHJpZ2h0ICs9IHJhbmdlICogcGFkO1xuICB9XG4gIHJldHVybiBbbGVmdCwgcmlnaHRdO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBsb3dlci0gYW5kIHVwcGVyLWJvdW5kIHktYXhpcyB2YWx1ZXMgZm9yIGVhY2ggYXhpcy4gVGhlc2UgYXJlXG4gKiB0aGUgcmFuZ2VzIHlvdSdsbCBnZXQgaWYgeW91IGRvdWJsZS1jbGljayB0byB6b29tIG91dCBvciBjYWxsIHJlc2V0Wm9vbSgpLlxuICogVGhlIHJldHVybiB2YWx1ZSBpcyBhbiBhcnJheSBvZiBbbG93LCBoaWdoXSB0dXBsZXMsIG9uZSBmb3IgZWFjaCB5LWF4aXMuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnlBeGlzRXh0cmVtZXMgPSBmdW5jdGlvbigpIHtcbiAgLy8gVE9ETyhkYW52ayk6IHRoaXMgaXMgcHJldHR5IGluZWZmaWNpZW50XG4gIGNvbnN0IHBhY2tlZCA9IHRoaXMuZ2F0aGVyRGF0YXNldHNfKHRoaXMucm9sbGVkU2VyaWVzXywgbnVsbCk7XG4gIGNvbnN0IHsgZXh0cmVtZXMgfSA9IHBhY2tlZDtcbiAgY29uc3Qgc2F2ZUF4ZXMgPSB0aGlzLmF4ZXNfO1xuICB0aGlzLmNvbXB1dGVZQXhpc1Jhbmdlc18oZXh0cmVtZXMpO1xuICBjb25zdCBuZXdBeGVzID0gdGhpcy5heGVzXztcbiAgdGhpcy5heGVzXyA9IHNhdmVBeGVzO1xuICByZXR1cm4gbmV3QXhlcy5tYXAoYXhpcyA9PiBheGlzLmV4dHJlbWVSYW5nZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY3VycmVudGx5LXZpc2libGUgeS1yYW5nZSBmb3IgYW4gYXhpcy4gVGhpcyBjYW4gYmUgYWZmZWN0ZWQgYnlcbiAqIHpvb21pbmcsIHBhbm5pbmcgb3IgYSBjYWxsIHRvIHVwZGF0ZU9wdGlvbnMuIEF4aXMgaW5kaWNlcyBhcmUgemVyby1iYXNlZC4gSWZcbiAqIGNhbGxlZCB3aXRoIG5vIGFyZ3VtZW50cywgcmV0dXJucyB0aGUgcmFuZ2Ugb2YgdGhlIGZpcnN0IGF4aXMuXG4gKiBSZXR1cm5zIGEgdHdvLWVsZW1lbnQgYXJyYXk6IFtib3R0b20sIHRvcF0uXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnlBeGlzUmFuZ2UgPSBmdW5jdGlvbihpZHgpIHtcbiAgaWYgKHR5cGVvZihpZHgpID09IFwidW5kZWZpbmVkXCIpIGlkeCA9IDA7XG4gIGlmIChpZHggPCAwIHx8IGlkeCA+PSB0aGlzLmF4ZXNfLmxlbmd0aCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZhciBheGlzID0gdGhpcy5heGVzX1tpZHhdO1xuICByZXR1cm4gWyBheGlzLmNvbXB1dGVkVmFsdWVSYW5nZVswXSwgYXhpcy5jb21wdXRlZFZhbHVlUmFuZ2VbMV0gXTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY3VycmVudGx5LXZpc2libGUgeS1yYW5nZXMgZm9yIGVhY2ggYXhpcy4gVGhpcyBjYW4gYmUgYWZmZWN0ZWQgYnlcbiAqIHpvb21pbmcsIHBhbm5pbmcsIGNhbGxzIHRvIHVwZGF0ZU9wdGlvbnMsIGV0Yy5cbiAqIFJldHVybnMgYW4gYXJyYXkgb2YgW2JvdHRvbSwgdG9wXSBwYWlycywgb25lIGZvciBlYWNoIHktYXhpcy5cbiAqL1xuRHlncmFwaC5wcm90b3R5cGUueUF4aXNSYW5nZXMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJldCA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYXhlc18ubGVuZ3RoOyBpKyspIHtcbiAgICByZXQucHVzaCh0aGlzLnlBeGlzUmFuZ2UoaSkpO1xuICB9XG4gIHJldHVybiByZXQ7XG59O1xuXG4vLyBUT0RPKGRhbnZrKTogdXNlIHRoZXNlIGZ1bmN0aW9ucyB0aHJvdWdob3V0IGR5Z3JhcGhzLlxuLyoqXG4gKiBDb252ZXJ0IGZyb20gZGF0YSBjb29yZGluYXRlcyB0byBjYW52YXMvZGl2IFgvWSBjb29yZGluYXRlcy5cbiAqIElmIHNwZWNpZmllZCwgZG8gdGhpcyBjb252ZXJzaW9uIGZvciB0aGUgY29vcmRpbmF0ZSBzeXN0ZW0gb2YgYSBwYXJ0aWN1bGFyXG4gKiBheGlzLiBVc2VzIHRoZSBmaXJzdCBheGlzIGJ5IGRlZmF1bHQuXG4gKiBSZXR1cm5zIGEgdHdvLWVsZW1lbnQgYXJyYXk6IFtYLCBZXVxuICpcbiAqIE5vdGU6IHVzZSB0b0RvbVhDb29yZCBpbnN0ZWFkIG9mIHRvRG9tQ29vcmRzKHgsIG51bGwpIGFuZCB1c2UgdG9Eb21ZQ29vcmRcbiAqIGluc3RlYWQgb2YgdG9Eb21Db29yZHMobnVsbCwgeSwgYXhpcykuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnRvRG9tQ29vcmRzID0gZnVuY3Rpb24oeCwgeSwgYXhpcykge1xuICByZXR1cm4gWyB0aGlzLnRvRG9tWENvb3JkKHgpLCB0aGlzLnRvRG9tWUNvb3JkKHksIGF4aXMpIF07XG59O1xuXG4vKipcbiAqIENvbnZlcnQgZnJvbSBkYXRhIHggY29vcmRpbmF0ZXMgdG8gY2FudmFzL2RpdiBYIGNvb3JkaW5hdGUuXG4gKiBJZiBzcGVjaWZpZWQsIGRvIHRoaXMgY29udmVyc2lvbiBmb3IgdGhlIGNvb3JkaW5hdGUgc3lzdGVtIG9mIGEgcGFydGljdWxhclxuICogYXhpcy5cbiAqIFJldHVybnMgYSBzaW5nbGUgdmFsdWUgb3IgbnVsbCBpZiB4IGlzIG51bGwuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnRvRG9tWENvb3JkID0gZnVuY3Rpb24oeCkge1xuICBpZiAoeCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmFyIGFyZWEgPSB0aGlzLnBsb3R0ZXJfLmFyZWE7XG4gIHZhciB4UmFuZ2UgPSB0aGlzLnhBeGlzUmFuZ2UoKTtcbiAgcmV0dXJuIGFyZWEueCArICh4IC0geFJhbmdlWzBdKSAvICh4UmFuZ2VbMV0gLSB4UmFuZ2VbMF0pICogYXJlYS53O1xufTtcblxuLyoqXG4gKiBDb252ZXJ0IGZyb20gZGF0YSB4IGNvb3JkaW5hdGVzIHRvIGNhbnZhcy9kaXYgWSBjb29yZGluYXRlIGFuZCBvcHRpb25hbFxuICogYXhpcy4gVXNlcyB0aGUgZmlyc3QgYXhpcyBieSBkZWZhdWx0LlxuICpcbiAqIHJldHVybnMgYSBzaW5nbGUgdmFsdWUgb3IgbnVsbCBpZiB5IGlzIG51bGwuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnRvRG9tWUNvb3JkID0gZnVuY3Rpb24oeSwgYXhpcykge1xuICB2YXIgcGN0ID0gdGhpcy50b1BlcmNlbnRZQ29vcmQoeSwgYXhpcyk7XG5cbiAgaWYgKHBjdCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZhciBhcmVhID0gdGhpcy5wbG90dGVyXy5hcmVhO1xuICByZXR1cm4gYXJlYS55ICsgcGN0ICogYXJlYS5oO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0IGZyb20gY2FudmFzL2RpdiBjb29yZHMgdG8gZGF0YSBjb29yZGluYXRlcy5cbiAqIElmIHNwZWNpZmllZCwgZG8gdGhpcyBjb252ZXJzaW9uIGZvciB0aGUgY29vcmRpbmF0ZSBzeXN0ZW0gb2YgYSBwYXJ0aWN1bGFyXG4gKiBheGlzLiBVc2VzIHRoZSBmaXJzdCBheGlzIGJ5IGRlZmF1bHQuXG4gKiBSZXR1cm5zIGEgdHdvLWVsZW1lbnQgYXJyYXk6IFtYLCBZXS5cbiAqXG4gKiBOb3RlOiB1c2UgdG9EYXRhWENvb3JkIGluc3RlYWQgb2YgdG9EYXRhQ29vcmRzKHgsIG51bGwpIGFuZCB1c2UgdG9EYXRhWUNvb3JkXG4gKiBpbnN0ZWFkIG9mIHRvRGF0YUNvb3JkcyhudWxsLCB5LCBheGlzKS5cbiAqL1xuRHlncmFwaC5wcm90b3R5cGUudG9EYXRhQ29vcmRzID0gZnVuY3Rpb24oeCwgeSwgYXhpcykge1xuICByZXR1cm4gWyB0aGlzLnRvRGF0YVhDb29yZCh4KSwgdGhpcy50b0RhdGFZQ29vcmQoeSwgYXhpcykgXTtcbn07XG5cbi8qKlxuICogQ29udmVydCBmcm9tIGNhbnZhcy9kaXYgeCBjb29yZGluYXRlIHRvIGRhdGEgY29vcmRpbmF0ZS5cbiAqXG4gKiBJZiB4IGlzIG51bGwsIHRoaXMgcmV0dXJucyBudWxsLlxuICovXG5EeWdyYXBoLnByb3RvdHlwZS50b0RhdGFYQ29vcmQgPSBmdW5jdGlvbih4KSB7XG4gIGlmICh4ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2YXIgYXJlYSA9IHRoaXMucGxvdHRlcl8uYXJlYTtcbiAgdmFyIHhSYW5nZSA9IHRoaXMueEF4aXNSYW5nZSgpO1xuXG4gIGlmICghdGhpcy5hdHRyaWJ1dGVzXy5nZXRGb3JBeGlzKFwibG9nc2NhbGVcIiwgJ3gnKSkge1xuICAgIHJldHVybiB4UmFuZ2VbMF0gKyAoeCAtIGFyZWEueCkgLyBhcmVhLncgKiAoeFJhbmdlWzFdIC0geFJhbmdlWzBdKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgcGN0ID0gKHggLSBhcmVhLngpIC8gYXJlYS53O1xuICAgIHJldHVybiB1dGlscy5sb2dSYW5nZUZyYWN0aW9uKHhSYW5nZVswXSwgeFJhbmdlWzFdLCBwY3QpO1xuICB9XG59O1xuXG4vKipcbiAqIENvbnZlcnQgZnJvbSBjYW52YXMvZGl2IHkgY29vcmQgdG8gdmFsdWUuXG4gKlxuICogSWYgeSBpcyBudWxsLCB0aGlzIHJldHVybnMgbnVsbC5cbiAqIGlmIGF4aXMgaXMgbnVsbCwgdGhpcyB1c2VzIHRoZSBmaXJzdCBheGlzLlxuICovXG5EeWdyYXBoLnByb3RvdHlwZS50b0RhdGFZQ29vcmQgPSBmdW5jdGlvbih5LCBheGlzKSB7XG4gIGlmICh5ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2YXIgYXJlYSA9IHRoaXMucGxvdHRlcl8uYXJlYTtcbiAgdmFyIHlSYW5nZSA9IHRoaXMueUF4aXNSYW5nZShheGlzKTtcblxuICBpZiAodHlwZW9mKGF4aXMpID09IFwidW5kZWZpbmVkXCIpIGF4aXMgPSAwO1xuICBpZiAoIXRoaXMuYXR0cmlidXRlc18uZ2V0Rm9yQXhpcyhcImxvZ3NjYWxlXCIsIGF4aXMpKSB7XG4gICAgcmV0dXJuIHlSYW5nZVswXSArIChhcmVhLnkgKyBhcmVhLmggLSB5KSAvIGFyZWEuaCAqICh5UmFuZ2VbMV0gLSB5UmFuZ2VbMF0pO1xuICB9IGVsc2Uge1xuICAgIC8vIENvbXB1dGluZyB0aGUgaW52ZXJzZSBvZiB0b0RvbUNvb3JkLlxuICAgIHZhciBwY3QgPSAoeSAtIGFyZWEueSkgLyBhcmVhLmg7XG4gICAgLy8gTm90ZSByZXZlcnNlZCB5UmFuZ2UsIHkxIGlzIG9uIHRvcCB3aXRoIHBjdD09MC5cbiAgICByZXR1cm4gdXRpbHMubG9nUmFuZ2VGcmFjdGlvbih5UmFuZ2VbMV0sIHlSYW5nZVswXSwgcGN0KTtcbiAgfVxufTtcblxuLyoqXG4gKiBDb252ZXJ0cyBhIHkgZm9yIGFuIGF4aXMgdG8gYSBwZXJjZW50YWdlIGZyb20gdGhlIHRvcCB0byB0aGVcbiAqIGJvdHRvbSBvZiB0aGUgZHJhd2luZyBhcmVhLlxuICpcbiAqIElmIHRoZSBjb29yZGluYXRlIHJlcHJlc2VudHMgYSB2YWx1ZSB2aXNpYmxlIG9uIHRoZSBjYW52YXMsIHRoZW5cbiAqIHRoZSB2YWx1ZSB3aWxsIGJlIGJldHdlZW4gMCBhbmQgMSwgd2hlcmUgMCBpcyB0aGUgdG9wIG9mIHRoZSBjYW52YXMuXG4gKiBIb3dldmVyLCB0aGlzIG1ldGhvZCB3aWxsIHJldHVybiB2YWx1ZXMgb3V0c2lkZSB0aGUgcmFuZ2UsIGFzXG4gKiB2YWx1ZXMgY2FuIGZhbGwgb3V0c2lkZSB0aGUgY2FudmFzLlxuICpcbiAqIElmIHkgaXMgbnVsbCwgdGhpcyByZXR1cm5zIG51bGwuXG4gKiBpZiBheGlzIGlzIG51bGwsIHRoaXMgdXNlcyB0aGUgZmlyc3QgYXhpcy5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0geSBUaGUgZGF0YSB5LWNvb3JkaW5hdGUuXG4gKiBAcGFyYW0ge251bWJlcn0gW2F4aXNdIFRoZSBheGlzIG51bWJlciBvbiB3aGljaCB0aGUgZGF0YSBjb29yZGluYXRlIGxpdmVzLlxuICogQHJldHVybiB7bnVtYmVyfSBBIGZyYWN0aW9uIGluIFswLCAxXSB3aGVyZSAwID0gdGhlIHRvcCBlZGdlLlxuICovXG5EeWdyYXBoLnByb3RvdHlwZS50b1BlcmNlbnRZQ29vcmQgPSBmdW5jdGlvbih5LCBheGlzKSB7XG4gIGlmICh5ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKHR5cGVvZihheGlzKSA9PSBcInVuZGVmaW5lZFwiKSBheGlzID0gMDtcblxuICB2YXIgeVJhbmdlID0gdGhpcy55QXhpc1JhbmdlKGF4aXMpO1xuXG4gIHZhciBwY3Q7XG4gIHZhciBsb2dzY2FsZSA9IHRoaXMuYXR0cmlidXRlc18uZ2V0Rm9yQXhpcyhcImxvZ3NjYWxlXCIsIGF4aXMpO1xuICBpZiAobG9nc2NhbGUpIHtcbiAgICB2YXIgbG9ncjAgPSB1dGlscy5sb2cxMCh5UmFuZ2VbMF0pO1xuICAgIHZhciBsb2dyMSA9IHV0aWxzLmxvZzEwKHlSYW5nZVsxXSk7XG4gICAgcGN0ID0gKGxvZ3IxIC0gdXRpbHMubG9nMTAoeSkpIC8gKGxvZ3IxIC0gbG9ncjApO1xuICB9IGVsc2Uge1xuICAgIC8vIHlSYW5nZVsxXSAtIHkgaXMgdW5pdCBkaXN0YW5jZSBmcm9tIHRoZSBib3R0b20uXG4gICAgLy8geVJhbmdlWzFdIC0geVJhbmdlWzBdIGlzIHRoZSBzY2FsZSBvZiB0aGUgcmFuZ2UuXG4gICAgLy8gKHlSYW5nZVsxXSAtIHkpIC8gKHlSYW5nZVsxXSAtIHlSYW5nZVswXSkgaXMgdGhlICUgZnJvbSB0aGUgYm90dG9tLlxuICAgIHBjdCA9ICh5UmFuZ2VbMV0gLSB5KSAvICh5UmFuZ2VbMV0gLSB5UmFuZ2VbMF0pO1xuICB9XG4gIHJldHVybiBwY3Q7XG59O1xuXG4vKipcbiAqIENvbnZlcnRzIGFuIHggdmFsdWUgdG8gYSBwZXJjZW50YWdlIGZyb20gdGhlIGxlZnQgdG8gdGhlIHJpZ2h0IG9mXG4gKiB0aGUgZHJhd2luZyBhcmVhLlxuICpcbiAqIElmIHRoZSBjb29yZGluYXRlIHJlcHJlc2VudHMgYSB2YWx1ZSB2aXNpYmxlIG9uIHRoZSBjYW52YXMsIHRoZW5cbiAqIHRoZSB2YWx1ZSB3aWxsIGJlIGJldHdlZW4gMCBhbmQgMSwgd2hlcmUgMCBpcyB0aGUgbGVmdCBvZiB0aGUgY2FudmFzLlxuICogSG93ZXZlciwgdGhpcyBtZXRob2Qgd2lsbCByZXR1cm4gdmFsdWVzIG91dHNpZGUgdGhlIHJhbmdlLCBhc1xuICogdmFsdWVzIGNhbiBmYWxsIG91dHNpZGUgdGhlIGNhbnZhcy5cbiAqXG4gKiBJZiB4IGlzIG51bGwsIHRoaXMgcmV0dXJucyBudWxsLlxuICogQHBhcmFtIHtudW1iZXJ9IHggVGhlIGRhdGEgeC1jb29yZGluYXRlLlxuICogQHJldHVybiB7bnVtYmVyfSBBIGZyYWN0aW9uIGluIFswLCAxXSB3aGVyZSAwID0gdGhlIGxlZnQgZWRnZS5cbiAqL1xuRHlncmFwaC5wcm90b3R5cGUudG9QZXJjZW50WENvb3JkID0gZnVuY3Rpb24oeCkge1xuICBpZiAoeCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmFyIHhSYW5nZSA9IHRoaXMueEF4aXNSYW5nZSgpO1xuICB2YXIgcGN0O1xuICB2YXIgbG9nc2NhbGUgPSB0aGlzLmF0dHJpYnV0ZXNfLmdldEZvckF4aXMoXCJsb2dzY2FsZVwiLCAneCcpIDtcbiAgaWYgKGxvZ3NjYWxlID09PSB0cnVlKSB7ICAvLyBsb2dzY2FsZSBjYW4gYmUgbnVsbCBzbyB3ZSB0ZXN0IGZvciB0cnVlIGV4cGxpY2l0bHkuXG4gICAgdmFyIGxvZ3IwID0gdXRpbHMubG9nMTAoeFJhbmdlWzBdKTtcbiAgICB2YXIgbG9ncjEgPSB1dGlscy5sb2cxMCh4UmFuZ2VbMV0pO1xuICAgIHBjdCA9ICh1dGlscy5sb2cxMCh4KSAtIGxvZ3IwKSAvIChsb2dyMSAtIGxvZ3IwKTtcbiAgfSBlbHNlIHtcbiAgICAvLyB4IC0geFJhbmdlWzBdIGlzIHVuaXQgZGlzdGFuY2UgZnJvbSB0aGUgbGVmdC5cbiAgICAvLyB4UmFuZ2VbMV0gLSB4UmFuZ2VbMF0gaXMgdGhlIHNjYWxlIG9mIHRoZSByYW5nZS5cbiAgICAvLyBUaGUgZnVsbCBleHByZXNzaW9uIGJlbG93IGlzIHRoZSAlIGZyb20gdGhlIGxlZnQuXG4gICAgcGN0ID0gKHggLSB4UmFuZ2VbMF0pIC8gKHhSYW5nZVsxXSAtIHhSYW5nZVswXSk7XG4gIH1cbiAgcmV0dXJuIHBjdDtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGNvbHVtbnMgKGluY2x1ZGluZyB0aGUgaW5kZXBlbmRlbnQgdmFyaWFibGUpLlxuICogQHJldHVybiB7bnVtYmVyfSBUaGUgbnVtYmVyIG9mIGNvbHVtbnMuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLm51bUNvbHVtbnMgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCF0aGlzLnJhd0RhdGFfKSByZXR1cm4gMDtcbiAgcmV0dXJuIHRoaXMucmF3RGF0YV9bMF0gPyB0aGlzLnJhd0RhdGFfWzBdLmxlbmd0aCA6IHRoaXMuYXR0cl8oXCJsYWJlbHNcIikubGVuZ3RoO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Ygcm93cyAoZXhjbHVkaW5nIGFueSBoZWFkZXIvbGFiZWwgcm93KS5cbiAqIEByZXR1cm4ge251bWJlcn0gVGhlIG51bWJlciBvZiByb3dzLCBsZXNzIGFueSBoZWFkZXIuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLm51bVJvd3MgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCF0aGlzLnJhd0RhdGFfKSByZXR1cm4gMDtcbiAgcmV0dXJuIHRoaXMucmF3RGF0YV8ubGVuZ3RoO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSB2YWx1ZSBpbiB0aGUgZ2l2ZW4gcm93IGFuZCBjb2x1bW4uIElmIHRoZSByb3cgYW5kIGNvbHVtbiBleGNlZWRcbiAqIHRoZSBib3VuZHMgb24gdGhlIGRhdGEsIHJldHVybnMgbnVsbC4gQWxzbyByZXR1cm5zIG51bGwgaWYgdGhlIHZhbHVlIGlzXG4gKiBtaXNzaW5nLlxuICogQHBhcmFtIHtudW1iZXJ9IHJvdyBUaGUgcm93IG51bWJlciBvZiB0aGUgZGF0YSAoMC1iYXNlZCkuIFJvdyAwIGlzIHRoZVxuICogICAgIGZpcnN0IHJvdyBvZiBkYXRhLCBub3QgYSBoZWFkZXIgcm93LlxuICogQHBhcmFtIHtudW1iZXJ9IGNvbCBUaGUgY29sdW1uIG51bWJlciBvZiB0aGUgZGF0YSAoMC1iYXNlZClcbiAqIEByZXR1cm4ge251bWJlcn0gVGhlIHZhbHVlIGluIHRoZSBzcGVjaWZpZWQgY2VsbCBvciBudWxsIGlmIHRoZSByb3cvY29sXG4gKiAgICAgd2VyZSBvdXQgb2YgcmFuZ2UuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmdldFZhbHVlID0gZnVuY3Rpb24ocm93LCBjb2wpIHtcbiAgaWYgKHJvdyA8IDAgfHwgcm93ID49IHRoaXMucmF3RGF0YV8ubGVuZ3RoKSByZXR1cm4gbnVsbDtcbiAgaWYgKGNvbCA8IDAgfHwgY29sID49IHRoaXMucmF3RGF0YV9bcm93XS5sZW5ndGgpIHJldHVybiBudWxsO1xuXG4gIHJldHVybiB0aGlzLnJhd0RhdGFfW3Jvd11bY29sXTtcbn07XG5cbi8qKlxuICogR2VuZXJhdGVzIGludGVyZmFjZSBlbGVtZW50cyBmb3IgdGhlIER5Z3JhcGg6IGEgY29udGFpbmluZyBkaXYsIGEgZGl2IHRvXG4gKiBkaXNwbGF5IHRoZSBjdXJyZW50IHBvaW50LCBhbmQgYSB0ZXh0Ym94IHRvIGFkanVzdCB0aGUgcm9sbGluZyBhdmVyYWdlXG4gKiBwZXJpb2QuIEFsc28gY3JlYXRlcyB0aGUgUmVuZGVyZXIvTGF5b3V0IGVsZW1lbnRzLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuY3JlYXRlSW50ZXJmYWNlXyA9IGZ1bmN0aW9uKCkge1xuICAvLyBDcmVhdGUgdGhlIGFsbC1lbmNsb3NpbmcgZ3JhcGggZGl2XG4gIHZhciBlbmNsb3NpbmcgPSB0aGlzLm1haW5kaXZfO1xuXG4gIHRoaXMuZ3JhcGhEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXG4gIC8vIFRPRE8oZGFudmspOiBhbnkgb3RoZXIgc3R5bGVzIHRoYXQgYXJlIHVzZWZ1bCB0byBzZXQgaGVyZT9cbiAgdGhpcy5ncmFwaERpdi5zdHlsZS50ZXh0QWxpZ24gPSAnbGVmdCc7ICAvLyBUaGlzIGlzIGEgQ1NTIFwicmVzZXRcIlxuICB0aGlzLmdyYXBoRGl2LnN0eWxlLnBvc2l0aW9uID0gJ3JlbGF0aXZlJztcbiAgZW5jbG9zaW5nLmFwcGVuZENoaWxkKHRoaXMuZ3JhcGhEaXYpO1xuXG4gIC8vIENyZWF0ZSB0aGUgY2FudmFzIGZvciBpbnRlcmFjdGl2ZSBwYXJ0cyBvZiB0aGUgY2hhcnQuXG4gIHRoaXMuY2FudmFzXyA9IHV0aWxzLmNyZWF0ZUNhbnZhcygpO1xuICB0aGlzLmNhbnZhc18uc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gIHRoaXMuY2FudmFzXy5zdHlsZS50b3AgPSAwO1xuICB0aGlzLmNhbnZhc18uc3R5bGUubGVmdCA9IDA7XG5cbiAgLy8gLi4uIGFuZCBmb3Igc3RhdGljIHBhcnRzIG9mIHRoZSBjaGFydC5cbiAgdGhpcy5oaWRkZW5fID0gdGhpcy5jcmVhdGVQbG90S2l0Q2FudmFzXyh0aGlzLmNhbnZhc18pO1xuXG4gIHRoaXMuY2FudmFzX2N0eF8gPSB1dGlscy5nZXRDb250ZXh0KHRoaXMuY2FudmFzXyk7XG4gIHRoaXMuaGlkZGVuX2N0eF8gPSB1dGlscy5nZXRDb250ZXh0KHRoaXMuaGlkZGVuXyk7XG5cbiAgdGhpcy5yZXNpemVFbGVtZW50c18oKTtcblxuICAvLyBUaGUgaW50ZXJhY3RpdmUgcGFydHMgb2YgdGhlIGdyYXBoIGFyZSBkcmF3biBvbiB0b3Agb2YgdGhlIGNoYXJ0LlxuICB0aGlzLmdyYXBoRGl2LmFwcGVuZENoaWxkKHRoaXMuaGlkZGVuXyk7XG4gIHRoaXMuZ3JhcGhEaXYuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXNfKTtcbiAgdGhpcy5tb3VzZUV2ZW50RWxlbWVudF8gPSB0aGlzLmNyZWF0ZU1vdXNlRXZlbnRFbGVtZW50XygpO1xuXG4gIC8vIENyZWF0ZSB0aGUgZ3JhcGhlclxuICB0aGlzLmxheW91dF8gPSBuZXcgRHlncmFwaExheW91dCh0aGlzKTtcblxuICB2YXIgZHlncmFwaCA9IHRoaXM7XG5cbiAgdGhpcy5tb3VzZU1vdmVIYW5kbGVyXyA9IGZ1bmN0aW9uKGUpIHtcbiAgICBkeWdyYXBoLm1vdXNlTW92ZV8oZSk7XG4gIH07XG5cbiAgdGhpcy5tb3VzZU91dEhhbmRsZXJfID0gZnVuY3Rpb24oZSkge1xuICAgIC8vIFRoZSBtb3VzZSBoYXMgbGVmdCB0aGUgY2hhcnQgaWY6XG4gICAgLy8gMS4gZS50YXJnZXQgaXMgaW5zaWRlIHRoZSBjaGFydFxuICAgIC8vIDIuIGUucmVsYXRlZFRhcmdldCBpcyBvdXRzaWRlIHRoZSBjaGFydFxuICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldCB8fCBlLmZyb21FbGVtZW50O1xuICAgIHZhciByZWxhdGVkVGFyZ2V0ID0gZS5yZWxhdGVkVGFyZ2V0IHx8IGUudG9FbGVtZW50O1xuICAgIGlmICh1dGlscy5pc05vZGVDb250YWluZWRCeSh0YXJnZXQsIGR5Z3JhcGguZ3JhcGhEaXYpICYmXG4gICAgICAgICF1dGlscy5pc05vZGVDb250YWluZWRCeShyZWxhdGVkVGFyZ2V0LCBkeWdyYXBoLmdyYXBoRGl2KSkge1xuICAgICAgZHlncmFwaC5tb3VzZU91dF8oZSk7XG4gICAgfVxuICB9O1xuXG4gIHRoaXMuYWRkQW5kVHJhY2tFdmVudCh3aW5kb3csICdtb3VzZW91dCcsIHRoaXMubW91c2VPdXRIYW5kbGVyXyk7XG4gIHRoaXMuYWRkQW5kVHJhY2tFdmVudCh0aGlzLm1vdXNlRXZlbnRFbGVtZW50XywgJ21vdXNlbW92ZScsIHRoaXMubW91c2VNb3ZlSGFuZGxlcl8pO1xuXG4gIC8vIERvbid0IHJlY3JlYXRlIGFuZCByZWdpc3RlciB0aGUgcmVzaXplIGhhbmRsZXIgb24gc3Vic2VxdWVudCBjYWxscy5cbiAgLy8gVGhpcyBoYXBwZW5zIHdoZW4gdGhlIGdyYXBoIGlzIHJlc2l6ZWQuXG4gIGlmICghdGhpcy5yZXNpemVIYW5kbGVyXykge1xuICAgIHRoaXMucmVzaXplSGFuZGxlcl8gPSBmdW5jdGlvbihlKSB7XG4gICAgICBkeWdyYXBoLnJlc2l6ZSgpO1xuICAgIH07XG5cbiAgICAvLyBVcGRhdGUgd2hlbiB0aGUgd2luZG93IGlzIHJlc2l6ZWQuXG4gICAgLy8gVE9ETyhkYW52ayk6IGRyb3AgZnJhbWVzIGRlcGVuZGluZyBvbiBjb21wbGV4aXR5IG9mIHRoZSBjaGFydC5cbiAgICB0aGlzLmFkZEFuZFRyYWNrRXZlbnQod2luZG93LCAncmVzaXplJywgdGhpcy5yZXNpemVIYW5kbGVyXyk7XG5cbiAgICB0aGlzLnJlc2l6ZU9ic2VydmVyXyA9IG51bGw7XG4gICAgdmFyIHJlc2l6ZU1vZGUgPSB0aGlzLmdldFN0cmluZ09wdGlvbigncmVzaXphYmxlJyk7XG4gICAgaWYgKCh0eXBlb2YoUmVzaXplT2JzZXJ2ZXIpID09PSAndW5kZWZpbmVkJykgJiZcbiAgICAgICAgKHJlc2l6ZU1vZGUgIT09IFwibm9cIikpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1Jlc2l6ZU9ic2VydmVyIHVuYXZhaWxhYmxlOyBpZ25vcmluZyByZXNpemFibGUgcHJvcGVydHknKTtcbiAgICAgIHJlc2l6ZU1vZGUgPSBcIm5vXCI7XG4gICAgfVxuICAgIGlmIChyZXNpemVNb2RlID09PSBcImhvcml6b250YWxcIiB8fFxuICAgICAgICByZXNpemVNb2RlID09PSBcInZlcnRpY2FsXCIgfHxcbiAgICAgICAgcmVzaXplTW9kZSA9PT0gXCJib3RoXCIpIHtcbiAgICAgIGVuY2xvc2luZy5zdHlsZS5yZXNpemUgPSByZXNpemVNb2RlO1xuICAgIH0gZWxzZSBpZiAocmVzaXplTW9kZSAhPT0gXCJwYXNzaXZlXCIpIHtcbiAgICAgIHJlc2l6ZU1vZGUgPSBcIm5vXCI7XG4gICAgfVxuICAgIGlmIChyZXNpemVNb2RlICE9PSBcIm5vXCIpIHtcbiAgICAgIGNvbnN0IG1haW5kaXZPdmVyZmxvdyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVuY2xvc2luZykub3ZlcmZsb3c7XG4gICAgICBpZiAod2luZG93LmdldENvbXB1dGVkU3R5bGUoZW5jbG9zaW5nKS5vdmVyZmxvdyA9PT0gJ3Zpc2libGUnKVxuICAgICAgICBlbmNsb3Npbmcuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcbiAgICAgIHRoaXMucmVzaXplT2JzZXJ2ZXJfID0gbmV3IFJlc2l6ZU9ic2VydmVyKHRoaXMucmVzaXplSGFuZGxlcl8pO1xuICAgICAgdGhpcy5yZXNpemVPYnNlcnZlcl8ub2JzZXJ2ZShlbmNsb3NpbmcpO1xuICAgIH1cbiAgfVxufTtcblxuRHlncmFwaC5wcm90b3R5cGUucmVzaXplRWxlbWVudHNfID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZ3JhcGhEaXYuc3R5bGUud2lkdGggPSB0aGlzLndpZHRoXyArIFwicHhcIjtcbiAgdGhpcy5ncmFwaERpdi5zdHlsZS5oZWlnaHQgPSB0aGlzLmhlaWdodF8gKyBcInB4XCI7XG5cbiAgdmFyIHBpeGVsUmF0aW9PcHRpb24gPSB0aGlzLmdldE51bWVyaWNPcHRpb24oJ3BpeGVsUmF0aW8nKVxuXG4gIHZhciBjYW52YXNTY2FsZSA9IHBpeGVsUmF0aW9PcHRpb24gfHwgdXRpbHMuZ2V0Q29udGV4dFBpeGVsUmF0aW8odGhpcy5jYW52YXNfY3R4Xyk7XG4gIHRoaXMuY2FudmFzXy53aWR0aCA9IHRoaXMud2lkdGhfICogY2FudmFzU2NhbGU7XG4gIHRoaXMuY2FudmFzXy5oZWlnaHQgPSB0aGlzLmhlaWdodF8gKiBjYW52YXNTY2FsZTtcbiAgdGhpcy5jYW52YXNfLnN0eWxlLndpZHRoID0gdGhpcy53aWR0aF8gKyBcInB4XCI7ICAgIC8vIGZvciBJRVxuICB0aGlzLmNhbnZhc18uc3R5bGUuaGVpZ2h0ID0gdGhpcy5oZWlnaHRfICsgXCJweFwiOyAgLy8gZm9yIElFXG4gIGlmIChjYW52YXNTY2FsZSAhPT0gMSkge1xuICAgIHRoaXMuY2FudmFzX2N0eF8uc2NhbGUoY2FudmFzU2NhbGUsIGNhbnZhc1NjYWxlKTtcbiAgfVxuXG4gIHZhciBoaWRkZW5TY2FsZSA9IHBpeGVsUmF0aW9PcHRpb24gfHwgdXRpbHMuZ2V0Q29udGV4dFBpeGVsUmF0aW8odGhpcy5oaWRkZW5fY3R4Xyk7XG4gIHRoaXMuaGlkZGVuXy53aWR0aCA9IHRoaXMud2lkdGhfICogaGlkZGVuU2NhbGU7XG4gIHRoaXMuaGlkZGVuXy5oZWlnaHQgPSB0aGlzLmhlaWdodF8gKiBoaWRkZW5TY2FsZTtcbiAgdGhpcy5oaWRkZW5fLnN0eWxlLndpZHRoID0gdGhpcy53aWR0aF8gKyBcInB4XCI7ICAgIC8vIGZvciBJRVxuICB0aGlzLmhpZGRlbl8uc3R5bGUuaGVpZ2h0ID0gdGhpcy5oZWlnaHRfICsgXCJweFwiOyAgLy8gZm9yIElFXG4gIGlmIChoaWRkZW5TY2FsZSAhPT0gMSkge1xuICAgIHRoaXMuaGlkZGVuX2N0eF8uc2NhbGUoaGlkZGVuU2NhbGUsIGhpZGRlblNjYWxlKTtcbiAgfVxufTtcblxuLyoqXG4gKiBEZXRhY2ggRE9NIGVsZW1lbnRzIGluIHRoZSBkeWdyYXBoIGFuZCBudWxsIG91dCBhbGwgZGF0YSByZWZlcmVuY2VzLlxuICogQ2FsbGluZyB0aGlzIHdoZW4geW91J3JlIGRvbmUgd2l0aCBhIGR5Z3JhcGggY2FuIGRyYW1hdGljYWxseSByZWR1Y2UgbWVtb3J5XG4gKiB1c2FnZS4gU2VlLCBlLmcuLCB0aGUgdGVzdHMvcGVyZi5odG1sIGV4YW1wbGUuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jYW52YXNfY3R4Xy5yZXN0b3JlKCk7XG4gIHRoaXMuaGlkZGVuX2N0eF8ucmVzdG9yZSgpO1xuXG4gIC8vIERlc3Ryb3kgYW55IHBsdWdpbnMsIGluIHRoZSByZXZlcnNlIG9yZGVyIHRoYXQgdGhleSB3ZXJlIHJlZ2lzdGVyZWQuXG4gIGZvciAodmFyIGkgPSB0aGlzLnBsdWdpbnNfLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgdmFyIHAgPSB0aGlzLnBsdWdpbnNfLnBvcCgpO1xuICAgIGlmIChwLnBsdWdpbi5kZXN0cm95KSBwLnBsdWdpbi5kZXN0cm95KCk7XG4gIH1cblxuICB2YXIgcmVtb3ZlUmVjdXJzaXZlID0gZnVuY3Rpb24obm9kZSkge1xuICAgIHdoaWxlIChub2RlLmhhc0NoaWxkTm9kZXMoKSkge1xuICAgICAgcmVtb3ZlUmVjdXJzaXZlKG5vZGUuZmlyc3RDaGlsZCk7XG4gICAgICBub2RlLnJlbW92ZUNoaWxkKG5vZGUuZmlyc3RDaGlsZCk7XG4gICAgfVxuICB9O1xuXG4gIHRoaXMucmVtb3ZlVHJhY2tlZEV2ZW50c18oKTtcblxuICAvLyByZW1vdmUgbW91c2UgZXZlbnQgaGFuZGxlcnMgKFRoaXMgbWF5IG5vdCBiZSBuZWNlc3NhcnkgYW55bW9yZSlcbiAgdXRpbHMucmVtb3ZlRXZlbnQod2luZG93LCAnbW91c2VvdXQnLCB0aGlzLm1vdXNlT3V0SGFuZGxlcl8pO1xuICB1dGlscy5yZW1vdmVFdmVudCh0aGlzLm1vdXNlRXZlbnRFbGVtZW50XywgJ21vdXNlbW92ZScsIHRoaXMubW91c2VNb3ZlSGFuZGxlcl8pO1xuXG4gIC8vIGRpc3Bvc2Ugb2YgcmVzaXppbmcgaGFuZGxlcnNcbiAgaWYgKHRoaXMucmVzaXplT2JzZXJ2ZXJfKSB7XG4gICAgdGhpcy5yZXNpemVPYnNlcnZlcl8uZGlzY29ubmVjdCgpO1xuICAgIHRoaXMucmVzaXplT2JzZXJ2ZXJfID0gbnVsbDtcbiAgfVxuICB1dGlscy5yZW1vdmVFdmVudCh3aW5kb3csICdyZXNpemUnLCB0aGlzLnJlc2l6ZUhhbmRsZXJfKTtcbiAgdGhpcy5yZXNpemVIYW5kbGVyXyA9IG51bGw7XG5cbiAgcmVtb3ZlUmVjdXJzaXZlKHRoaXMubWFpbmRpdl8pO1xuXG4gIHZhciBudWxsT3V0ID0gZnVuY3Rpb24gbnVsbE91dChvYmopIHtcbiAgICBmb3IgKHZhciBuIGluIG9iaikge1xuICAgICAgaWYgKHR5cGVvZihvYmpbbl0pID09PSAnb2JqZWN0Jykge1xuICAgICAgICBvYmpbbl0gPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgLy8gVGhlc2UgbWF5IG5vdCBhbGwgYmUgbmVjZXNzYXJ5LCBidXQgaXQgY2FuJ3QgaHVydC4uLlxuICBudWxsT3V0KHRoaXMubGF5b3V0Xyk7XG4gIG51bGxPdXQodGhpcy5wbG90dGVyXyk7XG4gIG51bGxPdXQodGhpcyk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgdGhlIGNhbnZhcyBvbiB3aGljaCB0aGUgY2hhcnQgd2lsbCBiZSBkcmF3bi4gT25seSB0aGUgUmVuZGVyZXIgZXZlclxuICogZHJhd3Mgb24gdGhpcyBwYXJ0aWN1bGFyIGNhbnZhcy4gQWxsIER5Z3JhcGggd29yayAoaS5lLiBkcmF3aW5nIGhvdmVyIGRvdHNcbiAqIG9yIHRoZSB6b29tIHJlY3RhbmdsZXMpIGlzIGRvbmUgb24gdGhpcy5jYW52YXNfLlxuICogQHBhcmFtIHtPYmplY3R9IGNhbnZhcyBUaGUgRHlncmFwaCBjYW52YXMgb3ZlciB3aGljaCB0byBvdmVybGF5IHRoZSBwbG90XG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBuZXdseS1jcmVhdGVkIGNhbnZhc1xuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuY3JlYXRlUGxvdEtpdENhbnZhc18gPSBmdW5jdGlvbihjYW52YXMpIHtcbiAgdmFyIGggPSB1dGlscy5jcmVhdGVDYW52YXMoKTtcbiAgaC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcbiAgLy8gVE9ETyhkYW52ayk6IGggc2hvdWxkIGJlIG9mZnNldCBmcm9tIGNhbnZhcy4gY2FudmFzIG5lZWRzIHRvIGluY2x1ZGVcbiAgLy8gc29tZSBleHRyYSBhcmVhIHRvIG1ha2UgaXQgZWFzaWVyIHRvIHpvb20gaW4gb24gdGhlIGZhciBsZWZ0IGFuZCBmYXJcbiAgLy8gcmlnaHQuIGggbmVlZHMgdG8gYmUgcHJlY2lzZWx5IHRoZSBwbG90IGFyZWEsIHNvIHRoYXQgY2xpcHBpbmcgb2NjdXJzLlxuICBoLnN0eWxlLnRvcCA9IGNhbnZhcy5zdHlsZS50b3A7XG4gIGguc3R5bGUubGVmdCA9IGNhbnZhcy5zdHlsZS5sZWZ0O1xuICBoLndpZHRoID0gdGhpcy53aWR0aF87XG4gIGguaGVpZ2h0ID0gdGhpcy5oZWlnaHRfO1xuICBoLnN0eWxlLndpZHRoID0gdGhpcy53aWR0aF8gKyBcInB4XCI7ICAgIC8vIGZvciBJRVxuICBoLnN0eWxlLmhlaWdodCA9IHRoaXMuaGVpZ2h0XyArIFwicHhcIjsgIC8vIGZvciBJRVxuICByZXR1cm4gaDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBvdmVybGF5IGVsZW1lbnQgdXNlZCB0byBoYW5kbGUgbW91c2UgZXZlbnRzLlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgbW91c2UgZXZlbnQgZWxlbWVudC5cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmNyZWF0ZU1vdXNlRXZlbnRFbGVtZW50XyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5jYW52YXNfO1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZSBhIHNldCBvZiBkaXN0aW5jdCBjb2xvcnMgZm9yIHRoZSBkYXRhIHNlcmllcy4gVGhpcyBpcyBkb25lIHdpdGggYVxuICogY29sb3Igd2hlZWwuIFNhdHVyYXRpb24vVmFsdWUgYXJlIGN1c3RvbWl6YWJsZSwgYW5kIHRoZSBodWUgaXNcbiAqIGVxdWFsbHktc3BhY2VkIGFyb3VuZCB0aGUgY29sb3Igd2hlZWwuIElmIGEgY3VzdG9tIHNldCBvZiBjb2xvcnMgaXNcbiAqIHNwZWNpZmllZCwgdGhhdCBpcyB1c2VkIGluc3RlYWQuXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5zZXRDb2xvcnNfID0gZnVuY3Rpb24oKSB7XG4gIHZhciBsYWJlbHMgPSB0aGlzLmdldExhYmVscygpO1xuICB2YXIgbnVtID0gbGFiZWxzLmxlbmd0aCAtIDE7XG4gIHRoaXMuY29sb3JzXyA9IFtdO1xuICB0aGlzLmNvbG9yc01hcF8gPSB7fTtcblxuICAvLyBUaGVzZSBhcmUgdXNlZCBmb3Igd2hlbiBubyBjdXN0b20gY29sb3JzIGFyZSBzcGVjaWZpZWQuXG4gIHZhciBzYXQgPSB0aGlzLmdldE51bWVyaWNPcHRpb24oJ2NvbG9yU2F0dXJhdGlvbicpIHx8IDEuMDtcbiAgdmFyIHZhbCA9IHRoaXMuZ2V0TnVtZXJpY09wdGlvbignY29sb3JWYWx1ZScpIHx8IDAuNTtcbiAgdmFyIGhhbGYgPSBNYXRoLmNlaWwobnVtIC8gMik7XG5cbiAgdmFyIGNvbG9ycyA9IHRoaXMuZ2V0T3B0aW9uKCdjb2xvcnMnKTtcbiAgdmFyIHZpc2liaWxpdHkgPSB0aGlzLnZpc2liaWxpdHkoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW07IGkrKykge1xuICAgIGlmICghdmlzaWJpbGl0eVtpXSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIHZhciBsYWJlbCA9IGxhYmVsc1tpICsgMV07XG4gICAgdmFyIGNvbG9yU3RyID0gdGhpcy5hdHRyaWJ1dGVzXy5nZXRGb3JTZXJpZXMoJ2NvbG9yJywgbGFiZWwpO1xuICAgIGlmICghY29sb3JTdHIpIHtcbiAgICAgIGlmIChjb2xvcnMpIHtcbiAgICAgICAgY29sb3JTdHIgPSBjb2xvcnNbaSAlIGNvbG9ycy5sZW5ndGhdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gYWx0ZXJuYXRlIGNvbG9ycyBmb3IgaGlnaCBjb250cmFzdC5cbiAgICAgICAgdmFyIGlkeCA9IGkgJSAyID8gKGhhbGYgKyAoaSArIDEpLyAyKSA6IE1hdGguY2VpbCgoaSArIDEpIC8gMik7XG4gICAgICAgIHZhciBodWUgPSAoMS4wICogaWR4IC8gKDEgKyBudW0pKTtcbiAgICAgICAgY29sb3JTdHIgPSB1dGlscy5oc3ZUb1JHQihodWUsIHNhdCwgdmFsKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5jb2xvcnNfLnB1c2goY29sb3JTdHIpO1xuICAgIHRoaXMuY29sb3JzTWFwX1tsYWJlbF0gPSBjb2xvclN0cjtcbiAgfVxufTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIGxpc3Qgb2YgY29sb3JzLiBUaGlzIGlzIGVpdGhlciB0aGUgbGlzdCBvZiBjb2xvcnMgcGFzc2VkIGluIHRoZVxuICogYXR0cmlidXRlcyBvciB0aGUgYXV0b2dlbmVyYXRlZCBsaXN0IG9mIHJnYihyLGcsYikgc3RyaW5ncy5cbiAqIFRoaXMgZG9lcyBub3QgcmV0dXJuIGNvbG9ycyBmb3IgaW52aXNpYmxlIHNlcmllcy5cbiAqIEByZXR1cm4ge0FycmF5LjxzdHJpbmc+fSBUaGUgbGlzdCBvZiBjb2xvcnMuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmdldENvbG9ycyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5jb2xvcnNfO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgZmV3IGF0dHJpYnV0ZXMgb2YgYSBzZXJpZXMsIGkuZS4gaXRzIGNvbG9yLCBpdHMgdmlzaWJpbGl0eSwgd2hpY2hcbiAqIGF4aXMgaXQncyBhc3NpZ25lZCB0bywgYW5kIGl0cyBjb2x1bW4gaW4gdGhlIG9yaWdpbmFsIGRhdGEuXG4gKiBSZXR1cm5zIG51bGwgaWYgdGhlIHNlcmllcyBkb2VzIG5vdCBleGlzdC5cbiAqIE90aGVyd2lzZSwgcmV0dXJucyBhbiBvYmplY3Qgd2l0aCBjb2x1bW4sIHZpc2liaWxpdHksIGNvbG9yIGFuZCBheGlzIHByb3BlcnRpZXMuXG4gKiBUaGUgXCJheGlzXCIgcHJvcGVydHkgd2lsbCBiZSBzZXQgdG8gMSBmb3IgeTEgYW5kIDIgZm9yIHkyLlxuICogVGhlIFwiY29sdW1uXCIgcHJvcGVydHkgY2FuIGJlIGZlZCBiYWNrIGludG8gZ2V0VmFsdWUocm93LCBjb2x1bW4pIHRvIGdldFxuICogdmFsdWVzIGZvciB0aGlzIHNlcmllcy5cbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuZ2V0UHJvcGVydGllc0ZvclNlcmllcyA9IGZ1bmN0aW9uKHNlcmllc19uYW1lKSB7XG4gIHZhciBpZHggPSAtMTtcbiAgdmFyIGxhYmVscyA9IHRoaXMuZ2V0TGFiZWxzKCk7XG4gIGZvciAodmFyIGkgPSAxOyBpIDwgbGFiZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGxhYmVsc1tpXSA9PSBzZXJpZXNfbmFtZSkge1xuICAgICAgaWR4ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBpZiAoaWR4ID09IC0xKSByZXR1cm4gbnVsbDtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6IHNlcmllc19uYW1lLFxuICAgIGNvbHVtbjogaWR4LFxuICAgIHZpc2libGU6IHRoaXMudmlzaWJpbGl0eSgpW2lkeCAtIDFdLFxuICAgIGNvbG9yOiB0aGlzLmNvbG9yc01hcF9bc2VyaWVzX25hbWVdLFxuICAgIGF4aXM6IDEgKyB0aGlzLmF0dHJpYnV0ZXNfLmF4aXNGb3JTZXJpZXMoc2VyaWVzX25hbWUpXG4gIH07XG59O1xuXG4vKipcbiAqIENyZWF0ZSB0aGUgdGV4dCBib3ggdG8gYWRqdXN0IHRoZSBhdmVyYWdpbmcgcGVyaW9kXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5jcmVhdGVSb2xsSW50ZXJmYWNlXyA9IGZ1bmN0aW9uKCkge1xuICAvLyBDcmVhdGUgYSByb2xsZXIgaWYgb25lIGRvZXNuJ3QgZXhpc3QgYWxyZWFkeS5cbiAgdmFyIHJvbGxlciA9IHRoaXMucm9sbGVyXztcbiAgaWYgKCFyb2xsZXIpIHtcbiAgICB0aGlzLnJvbGxlcl8gPSByb2xsZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gICAgcm9sbGVyLnR5cGUgPSBcInRleHRcIjtcbiAgICByb2xsZXIuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIHJvbGxlci5jbGFzc05hbWUgPSAnZHlncmFwaC1yb2xsZXInO1xuICAgIHRoaXMuZ3JhcGhEaXYuYXBwZW5kQ2hpbGQocm9sbGVyKTtcbiAgfVxuXG4gIHZhciBkaXNwbGF5ID0gdGhpcy5nZXRCb29sZWFuT3B0aW9uKCdzaG93Um9sbGVyJykgPyAnYmxvY2snIDogJ25vbmUnO1xuXG4gIHZhciBhcmVhID0gdGhpcy5nZXRBcmVhKCk7XG4gIHZhciB0ZXh0QXR0ciA9IHtcbiAgICAgICAgICAgICAgICAgICBcInRvcFwiOiAoYXJlYS55ICsgYXJlYS5oIC0gMjUpICsgXCJweFwiLFxuICAgICAgICAgICAgICAgICAgIFwibGVmdFwiOiAoYXJlYS54ICsgMSkgKyBcInB4XCIsXG4gICAgICAgICAgICAgICAgICAgXCJkaXNwbGF5XCI6IGRpc3BsYXlcbiAgICAgICAgICAgICAgICAgfTtcbiAgcm9sbGVyLnNpemUgPSBcIjJcIjtcbiAgcm9sbGVyLnZhbHVlID0gdGhpcy5yb2xsUGVyaW9kXztcbiAgdXRpbHMudXBkYXRlKHJvbGxlci5zdHlsZSwgdGV4dEF0dHIpO1xuXG4gIGNvbnN0IHRoYXQgPSB0aGlzO1xuICByb2xsZXIub25jaGFuZ2UgPSBmdW5jdGlvbiBvbmNoYW5nZSgpIHtcbiAgICByZXR1cm4gdGhhdC5hZGp1c3RSb2xsKHJvbGxlci52YWx1ZSk7XG4gIH07XG59O1xuXG4vKipcbiAqIFNldCB1cCBhbGwgdGhlIG1vdXNlIGhhbmRsZXJzIG5lZWRlZCB0byBjYXB0dXJlIGRyYWdnaW5nIGJlaGF2aW9yIGZvciB6b29tXG4gKiBldmVudHMuXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5jcmVhdGVEcmFnSW50ZXJmYWNlXyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgY29udGV4dCA9IHtcbiAgICAvLyBUcmFja3Mgd2hldGhlciB0aGUgbW91c2UgaXMgZG93biByaWdodCBub3dcbiAgICBpc1pvb21pbmc6IGZhbHNlLFxuICAgIGlzUGFubmluZzogZmFsc2UsICAvLyBpcyB0aGlzIGRyYWcgcGFydCBvZiBhIHBhbj9cbiAgICBpczJEUGFuOiBmYWxzZSwgICAgLy8gaWYgc28sIGlzIHRoYXQgcGFuIDEtIG9yIDItZGltZW5zaW9uYWw/XG4gICAgZHJhZ1N0YXJ0WDogbnVsbCwgLy8gcGl4ZWwgY29vcmRpbmF0ZXNcbiAgICBkcmFnU3RhcnRZOiBudWxsLCAvLyBwaXhlbCBjb29yZGluYXRlc1xuICAgIGRyYWdFbmRYOiBudWxsLCAvLyBwaXhlbCBjb29yZGluYXRlc1xuICAgIGRyYWdFbmRZOiBudWxsLCAvLyBwaXhlbCBjb29yZGluYXRlc1xuICAgIGRyYWdEaXJlY3Rpb246IG51bGwsXG4gICAgcHJldkVuZFg6IG51bGwsIC8vIHBpeGVsIGNvb3JkaW5hdGVzXG4gICAgcHJldkVuZFk6IG51bGwsIC8vIHBpeGVsIGNvb3JkaW5hdGVzXG4gICAgcHJldkRyYWdEaXJlY3Rpb246IG51bGwsXG4gICAgY2FuY2VsTmV4dERibGNsaWNrOiBmYWxzZSwgIC8vIHNlZSBjb21tZW50IGluIGR5Z3JhcGgtaW50ZXJhY3Rpb24tbW9kZWwuanNcblxuICAgIC8vIFRoZSB2YWx1ZSBvbiB0aGUgbGVmdCBzaWRlIG9mIHRoZSBncmFwaCB3aGVuIGEgcGFuIG9wZXJhdGlvbiBzdGFydHMuXG4gICAgaW5pdGlhbExlZnRtb3N0RGF0ZTogbnVsbCxcblxuICAgIC8vIFRoZSBudW1iZXIgb2YgdW5pdHMgZWFjaCBwaXhlbCBzcGFucy4gKFRoaXMgd29uJ3QgYmUgdmFsaWQgZm9yIGxvZ1xuICAgIC8vIHNjYWxlcylcbiAgICB4VW5pdHNQZXJQaXhlbDogbnVsbCxcblxuICAgIC8vIFRPRE8oZGFudmspOiB1cGRhdGUgdGhpcyBjb21tZW50XG4gICAgLy8gVGhlIHJhbmdlIGluIHNlY29uZC92YWx1ZSB1bml0cyB0aGF0IHRoZSB2aWV3cG9ydCBlbmNvbXBhc3NlcyBkdXJpbmcgYVxuICAgIC8vIHBhbm5pbmcgb3BlcmF0aW9uLlxuICAgIGRhdGVSYW5nZTogbnVsbCxcblxuICAgIC8vIFRvcC1sZWZ0IGNvcm5lciBvZiB0aGUgY2FudmFzLCBpbiBET00gY29vcmRzXG4gICAgLy8gVE9ETyhrb25pZ3NiZXJnKTogUmVuYW1lIHRvcExlZnRDYW52YXNYLCB0b3BMZWZ0Q2FudmFzWS5cbiAgICBweDogMCxcbiAgICBweTogMCxcblxuICAgIC8vIFZhbHVlcyBmb3IgdXNlIHdpdGggcGFuRWRnZUZyYWN0aW9uLCB3aGljaCBsaW1pdCBob3cgZmFyIG91dHNpZGUgdGhlXG4gICAgLy8gZ3JhcGgncyBkYXRhIGJvdW5kYXJpZXMgaXQgY2FuIGJlIHBhbm5lZC5cbiAgICBib3VuZGVkRGF0ZXM6IG51bGwsIC8vIFttaW5EYXRlLCBtYXhEYXRlXVxuICAgIGJvdW5kZWRWYWx1ZXM6IG51bGwsIC8vIFtbbWluVmFsdWUsIG1heFZhbHVlXSAuLi5dXG5cbiAgICAvLyBXZSBjb3ZlciBpZnJhbWVzIGR1cmluZyBtb3VzZSBpbnRlcmFjdGlvbnMuIFNlZSBjb21tZW50cyBpblxuICAgIC8vIGR5Z3JhcGgtdXRpbHMuanMgZm9yIG1vcmUgaW5mbyBvbiB3aHkgdGhpcyBpcyBhIGdvb2QgaWRlYS5cbiAgICB0YXJwOiBuZXcgSUZyYW1lVGFycCgpLFxuXG4gICAgLy8gY29udGV4dEIgaXMgdGhlIHNhbWUgdGhpbmcgYXMgdGhpcyBjb250ZXh0IG9iamVjdCBidXQgcmVuYW1lZC5cbiAgICBpbml0aWFsaXplTW91c2VEb3duOiBmdW5jdGlvbihldmVudCwgZywgY29udGV4dEIpIHtcbiAgICAgIC8vIHByZXZlbnRzIG1vdXNlIGRyYWdzIGZyb20gc2VsZWN0aW5nIHBhZ2UgdGV4dC5cbiAgICAgIGlmIChldmVudC5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyAgLy8gRmlyZWZveCwgQ2hyb21lLCBldGMuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlOyAgLy8gSUVcbiAgICAgICAgZXZlbnQuY2FuY2VsQnViYmxlID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIGNhbnZhc1BvcyA9IHV0aWxzLmZpbmRQb3MoZy5jYW52YXNfKTtcbiAgICAgIGNvbnRleHRCLnB4ID0gY2FudmFzUG9zLng7XG4gICAgICBjb250ZXh0Qi5weSA9IGNhbnZhc1Bvcy55O1xuICAgICAgY29udGV4dEIuZHJhZ1N0YXJ0WCA9IHV0aWxzLmRyYWdHZXRYXyhldmVudCwgY29udGV4dEIpO1xuICAgICAgY29udGV4dEIuZHJhZ1N0YXJ0WSA9IHV0aWxzLmRyYWdHZXRZXyhldmVudCwgY29udGV4dEIpO1xuICAgICAgY29udGV4dEIuY2FuY2VsTmV4dERibGNsaWNrID0gZmFsc2U7XG4gICAgICBjb250ZXh0Qi50YXJwLmNvdmVyKCk7XG4gICAgfSxcbiAgICBkZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgIGlmIChjb250ZXh0LmlzWm9vbWluZyB8fCBjb250ZXh0LmlzUGFubmluZykge1xuICAgICAgICBjb250ZXh0LmlzWm9vbWluZyA9IGZhbHNlO1xuICAgICAgICBjb250ZXh0LmRyYWdTdGFydFggPSBudWxsO1xuICAgICAgICBjb250ZXh0LmRyYWdTdGFydFkgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAoY29udGV4dC5pc1Bhbm5pbmcpIHtcbiAgICAgICAgY29udGV4dC5pc1Bhbm5pbmcgPSBmYWxzZTtcbiAgICAgICAgY29udGV4dC5kcmFnZ2luZ0RhdGUgPSBudWxsO1xuICAgICAgICBjb250ZXh0LmRhdGVSYW5nZSA9IG51bGw7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZi5heGVzXy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGRlbGV0ZSBzZWxmLmF4ZXNfW2ldLmRyYWdnaW5nVmFsdWU7XG4gICAgICAgICAgZGVsZXRlIHNlbGYuYXhlc19baV0uZHJhZ1ZhbHVlUmFuZ2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29udGV4dC50YXJwLnVuY292ZXIoKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGludGVyYWN0aW9uTW9kZWwgPSB0aGlzLmdldE9wdGlvbihcImludGVyYWN0aW9uTW9kZWxcIik7XG5cbiAgLy8gU2VsZiBpcyB0aGUgZ3JhcGguXG4gIHZhciBzZWxmID0gdGhpcztcblxuICAvLyBGdW5jdGlvbiB0aGF0IGJpbmRzIHRoZSBncmFwaCBhbmQgY29udGV4dCB0byB0aGUgaGFuZGxlci5cbiAgdmFyIGJpbmRIYW5kbGVyID0gZnVuY3Rpb24oaGFuZGxlcikge1xuICAgIHJldHVybiBmdW5jdGlvbihldmVudCkge1xuICAgICAgaGFuZGxlcihldmVudCwgc2VsZiwgY29udGV4dCk7XG4gICAgfTtcbiAgfTtcblxuICBmb3IgKHZhciBldmVudE5hbWUgaW4gaW50ZXJhY3Rpb25Nb2RlbCkge1xuICAgIGlmICghaW50ZXJhY3Rpb25Nb2RlbC5oYXNPd25Qcm9wZXJ0eShldmVudE5hbWUpKSBjb250aW51ZTtcbiAgICB0aGlzLmFkZEFuZFRyYWNrRXZlbnQodGhpcy5tb3VzZUV2ZW50RWxlbWVudF8sIGV2ZW50TmFtZSxcbiAgICAgICAgYmluZEhhbmRsZXIoaW50ZXJhY3Rpb25Nb2RlbFtldmVudE5hbWVdKSk7XG4gIH1cblxuICAvLyBJZiB0aGUgdXNlciByZWxlYXNlcyB0aGUgbW91c2UgYnV0dG9uIGR1cmluZyBhIGRyYWcsIGJ1dCBub3Qgb3ZlciB0aGVcbiAgLy8gY2FudmFzLCB0aGVuIGl0IGRvZXNuJ3QgY291bnQgYXMgYSB6b29taW5nIGFjdGlvbi5cbiAgaWYgKCFpbnRlcmFjdGlvbk1vZGVsLndpbGxEZXN0cm95Q29udGV4dE15c2VsZikge1xuICAgIHZhciBtb3VzZVVwSGFuZGxlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBjb250ZXh0LmRlc3Ryb3koKTtcbiAgICB9O1xuXG4gICAgdGhpcy5hZGRBbmRUcmFja0V2ZW50KGRvY3VtZW50LCAnbW91c2V1cCcsIG1vdXNlVXBIYW5kbGVyKTtcbiAgfVxufTtcblxuLyoqXG4gKiBEcmF3IGEgZ3JheSB6b29tIHJlY3RhbmdsZSBvdmVyIHRoZSBkZXNpcmVkIGFyZWEgb2YgdGhlIGNhbnZhcy4gQWxzbyBjbGVhcnNcbiAqIHVwIGFueSBwcmV2aW91cyB6b29tIHJlY3RhbmdsZXMgdGhhdCB3ZXJlIGRyYXduLiBUaGlzIGNvdWxkIGJlIG9wdGltaXplZCB0b1xuICogYXZvaWQgZXh0cmEgcmVkcmF3aW5nLCBidXQgaXQncyB0cmlja3kgdG8gYXZvaWQgaW50ZXJhY3Rpb25zIHdpdGggdGhlIHN0YXR1c1xuICogZG90cy5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gZGlyZWN0aW9uIHRoZSBkaXJlY3Rpb24gb2YgdGhlIHpvb20gcmVjdGFuZ2xlLiBBY2NlcHRhYmxlXG4gKiAgICAgdmFsdWVzIGFyZSB1dGlscy5IT1JJWk9OVEFMIGFuZCB1dGlscy5WRVJUSUNBTC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydFggVGhlIFggcG9zaXRpb24gd2hlcmUgdGhlIGRyYWcgc3RhcnRlZCwgaW4gY2FudmFzXG4gKiAgICAgY29vcmRpbmF0ZXMuXG4gKiBAcGFyYW0ge251bWJlcn0gZW5kWCBUaGUgY3VycmVudCBYIHBvc2l0aW9uIG9mIHRoZSBkcmFnLCBpbiBjYW52YXMgY29vcmRzLlxuICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0WSBUaGUgWSBwb3NpdGlvbiB3aGVyZSB0aGUgZHJhZyBzdGFydGVkLCBpbiBjYW52YXNcbiAqICAgICBjb29yZGluYXRlcy5cbiAqIEBwYXJhbSB7bnVtYmVyfSBlbmRZIFRoZSBjdXJyZW50IFkgcG9zaXRpb24gb2YgdGhlIGRyYWcsIGluIGNhbnZhcyBjb29yZHMuXG4gKiBAcGFyYW0ge251bWJlcn0gcHJldkRpcmVjdGlvbiB0aGUgdmFsdWUgb2YgZGlyZWN0aW9uIG9uIHRoZSBwcmV2aW91cyBjYWxsIHRvXG4gKiAgICAgdGhpcyBmdW5jdGlvbi4gVXNlZCB0byBhdm9pZCBleGNlc3MgcmVkcmF3aW5nXG4gKiBAcGFyYW0ge251bWJlcn0gcHJldkVuZFggVGhlIHZhbHVlIG9mIGVuZFggb24gdGhlIHByZXZpb3VzIGNhbGwgdG8gdGhpc1xuICogICAgIGZ1bmN0aW9uLiBVc2VkIHRvIGF2b2lkIGV4Y2VzcyByZWRyYXdpbmdcbiAqIEBwYXJhbSB7bnVtYmVyfSBwcmV2RW5kWSBUaGUgdmFsdWUgb2YgZW5kWSBvbiB0aGUgcHJldmlvdXMgY2FsbCB0byB0aGlzXG4gKiAgICAgZnVuY3Rpb24uIFVzZWQgdG8gYXZvaWQgZXhjZXNzIHJlZHJhd2luZ1xuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuZHJhd1pvb21SZWN0XyA9IGZ1bmN0aW9uKGRpcmVjdGlvbiwgc3RhcnRYLCBlbmRYLCBzdGFydFksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kWSwgcHJldkRpcmVjdGlvbiwgcHJldkVuZFgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldkVuZFkpIHtcbiAgdmFyIGN0eCA9IHRoaXMuY2FudmFzX2N0eF87XG5cbiAgLy8gQ2xlYW4gdXAgZnJvbSB0aGUgcHJldmlvdXMgcmVjdCBpZiBuZWNlc3NhcnlcbiAgaWYgKHByZXZEaXJlY3Rpb24gPT0gdXRpbHMuSE9SSVpPTlRBTCkge1xuICAgIGN0eC5jbGVhclJlY3QoTWF0aC5taW4oc3RhcnRYLCBwcmV2RW5kWCksIHRoaXMubGF5b3V0Xy5nZXRQbG90QXJlYSgpLnksXG4gICAgICAgICAgICAgICAgICBNYXRoLmFicyhzdGFydFggLSBwcmV2RW5kWCksIHRoaXMubGF5b3V0Xy5nZXRQbG90QXJlYSgpLmgpO1xuICB9IGVsc2UgaWYgKHByZXZEaXJlY3Rpb24gPT0gdXRpbHMuVkVSVElDQUwpIHtcbiAgICBjdHguY2xlYXJSZWN0KHRoaXMubGF5b3V0Xy5nZXRQbG90QXJlYSgpLngsIE1hdGgubWluKHN0YXJ0WSwgcHJldkVuZFkpLFxuICAgICAgICAgICAgICAgICAgdGhpcy5sYXlvdXRfLmdldFBsb3RBcmVhKCkudywgTWF0aC5hYnMoc3RhcnRZIC0gcHJldkVuZFkpKTtcbiAgfVxuXG4gIC8vIERyYXcgYSBsaWdodC1ncmV5IHJlY3RhbmdsZSB0byBzaG93IHRoZSBuZXcgdmlld2luZyBhcmVhXG4gIGlmIChkaXJlY3Rpb24gPT0gdXRpbHMuSE9SSVpPTlRBTCkge1xuICAgIGlmIChlbmRYICYmIHN0YXJ0WCkge1xuICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgxMjgsMTI4LDEyOCwwLjMzKVwiO1xuICAgICAgY3R4LmZpbGxSZWN0KE1hdGgubWluKHN0YXJ0WCwgZW5kWCksIHRoaXMubGF5b3V0Xy5nZXRQbG90QXJlYSgpLnksXG4gICAgICAgICAgICAgICAgICAgTWF0aC5hYnMoZW5kWCAtIHN0YXJ0WCksIHRoaXMubGF5b3V0Xy5nZXRQbG90QXJlYSgpLmgpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT0gdXRpbHMuVkVSVElDQUwpIHtcbiAgICBpZiAoZW5kWSAmJiBzdGFydFkpIHtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMTI4LDEyOCwxMjgsMC4zMylcIjtcbiAgICAgIGN0eC5maWxsUmVjdCh0aGlzLmxheW91dF8uZ2V0UGxvdEFyZWEoKS54LCBNYXRoLm1pbihzdGFydFksIGVuZFkpLFxuICAgICAgICAgICAgICAgICAgIHRoaXMubGF5b3V0Xy5nZXRQbG90QXJlYSgpLncsIE1hdGguYWJzKGVuZFkgLSBzdGFydFkpKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogQ2xlYXIgdGhlIHpvb20gcmVjdGFuZ2xlIChhbmQgcGVyZm9ybSBubyB6b29tKS5cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmNsZWFyWm9vbVJlY3RfID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY3VycmVudFpvb21SZWN0QXJnc18gPSBudWxsO1xuICB0aGlzLmNhbnZhc19jdHhfLmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoXywgdGhpcy5oZWlnaHRfKTtcbn07XG5cbi8qKlxuICogWm9vbSB0byBzb21ldGhpbmcgY29udGFpbmluZyBbbG93WCwgaGlnaFhdLiBUaGVzZSBhcmUgcGl4ZWwgY29vcmRpbmF0ZXMgaW5cbiAqIHRoZSBjYW52YXMuIFRoZSBleGFjdCB6b29tIHdpbmRvdyBtYXkgYmUgc2xpZ2h0bHkgbGFyZ2VyIGlmIHRoZXJlIGFyZSBubyBkYXRhXG4gKiBwb2ludHMgbmVhciBsb3dYIG9yIGhpZ2hYLiBEb24ndCBjb25mdXNlIHRoaXMgZnVuY3Rpb24gd2l0aCBkb1pvb21YRGF0ZXMsXG4gKiB3aGljaCBhY2NlcHRzIGRhdGVzIHRoYXQgbWF0Y2ggdGhlIHJhdyBkYXRhLiBUaGlzIGZ1bmN0aW9uIHJlZHJhd3MgdGhlIGdyYXBoLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBsb3dYIFRoZSBsZWZ0bW9zdCBwaXhlbCB2YWx1ZSB0aGF0IHNob3VsZCBiZSB2aXNpYmxlLlxuICogQHBhcmFtIHtudW1iZXJ9IGhpZ2hYIFRoZSByaWdodG1vc3QgcGl4ZWwgdmFsdWUgdGhhdCBzaG91bGQgYmUgdmlzaWJsZS5cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmRvWm9vbVhfID0gZnVuY3Rpb24obG93WCwgaGlnaFgpIHtcbiAgdGhpcy5jdXJyZW50Wm9vbVJlY3RBcmdzXyA9IG51bGw7XG4gIC8vIEZpbmQgdGhlIGVhcmxpZXN0IGFuZCBsYXRlc3QgZGF0ZXMgY29udGFpbmVkIGluIHRoaXMgY2FudmFzeCByYW5nZS5cbiAgLy8gQ29udmVydCB0aGUgY2FsbCB0byBkYXRlIHJhbmdlcyBvZiB0aGUgcmF3IGRhdGEuXG4gIHZhciBtaW5EYXRlID0gdGhpcy50b0RhdGFYQ29vcmQobG93WCk7XG4gIHZhciBtYXhEYXRlID0gdGhpcy50b0RhdGFYQ29vcmQoaGlnaFgpO1xuICB0aGlzLmRvWm9vbVhEYXRlc18obWluRGF0ZSwgbWF4RGF0ZSk7XG59O1xuXG4vKipcbiAqIFpvb20gdG8gc29tZXRoaW5nIGNvbnRhaW5pbmcgW21pbkRhdGUsIG1heERhdGVdIHZhbHVlcy4gRG9uJ3QgY29uZnVzZSB0aGlzXG4gKiBtZXRob2Qgd2l0aCBkb1pvb21YIHdoaWNoIGFjY2VwdHMgcGl4ZWwgY29vcmRpbmF0ZXMuIFRoaXMgZnVuY3Rpb24gcmVkcmF3c1xuICogdGhlIGdyYXBoLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBtaW5EYXRlIFRoZSBtaW5pbXVtIGRhdGUgdGhhdCBzaG91bGQgYmUgdmlzaWJsZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBtYXhEYXRlIFRoZSBtYXhpbXVtIGRhdGUgdGhhdCBzaG91bGQgYmUgdmlzaWJsZS5cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmRvWm9vbVhEYXRlc18gPSBmdW5jdGlvbihtaW5EYXRlLCBtYXhEYXRlKSB7XG4gIC8vIFRPRE8oZGFudmspOiB3aGVuIHhBeGlzUmFuZ2UgaXMgbnVsbCAoaS5lLiBcImZpdCB0byBkYXRhXCIsIHRoZSBhbmltYXRpb25cbiAgLy8gY2FuIHByb2R1Y2Ugc3RyYW5nZSBlZmZlY3RzLiBSYXRoZXIgdGhhbiB0aGUgeC1heGlzIHRyYW5zaXRpb25pbmcgc2xvd2x5XG4gIC8vIGJldHdlZW4gdmFsdWVzLCBpdCBjYW4gamVyayBhcm91bmQuKVxuICB2YXIgb2xkX3dpbmRvdyA9IHRoaXMueEF4aXNSYW5nZSgpO1xuICB2YXIgbmV3X3dpbmRvdyA9IFttaW5EYXRlLCBtYXhEYXRlXTtcbiAgY29uc3Qgem9vbUNhbGxiYWNrID0gdGhpcy5nZXRGdW5jdGlvbk9wdGlvbignem9vbUNhbGxiYWNrJyk7XG4gIGNvbnN0IHRoYXQgPSB0aGlzO1xuICB0aGlzLmRvQW5pbWF0ZWRab29tKG9sZF93aW5kb3csIG5ld193aW5kb3csIG51bGwsIG51bGwsIGZ1bmN0aW9uIGFuaW1hdGVkWm9vbUNhbGxiYWNrKCkge1xuICAgIGlmICh6b29tQ2FsbGJhY2spIHtcbiAgICAgIHpvb21DYWxsYmFjay5jYWxsKHRoYXQsIG1pbkRhdGUsIG1heERhdGUsIHRoYXQueUF4aXNSYW5nZXMoKSk7XG4gICAgfVxuICB9KTtcbn07XG5cbi8qKlxuICogWm9vbSB0byBzb21ldGhpbmcgY29udGFpbmluZyBbbG93WSwgaGlnaFldLiBUaGVzZSBhcmUgcGl4ZWwgY29vcmRpbmF0ZXMgaW5cbiAqIHRoZSBjYW52YXMuIFRoaXMgZnVuY3Rpb24gcmVkcmF3cyB0aGUgZ3JhcGguXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IGxvd1kgVGhlIHRvcG1vc3QgcGl4ZWwgdmFsdWUgdGhhdCBzaG91bGQgYmUgdmlzaWJsZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBoaWdoWSBUaGUgbG93ZXN0IHBpeGVsIHZhbHVlIHRoYXQgc2hvdWxkIGJlIHZpc2libGUuXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5kb1pvb21ZXyA9IGZ1bmN0aW9uKGxvd1ksIGhpZ2hZKSB7XG4gIHRoaXMuY3VycmVudFpvb21SZWN0QXJnc18gPSBudWxsO1xuICAvLyBGaW5kIHRoZSBoaWdoZXN0IGFuZCBsb3dlc3QgdmFsdWVzIGluIHBpeGVsIHJhbmdlIGZvciBlYWNoIGF4aXMuXG4gIC8vIE5vdGUgdGhhdCBsb3dZIChpbiBwaXhlbHMpIGNvcnJlc3BvbmRzIHRvIHRoZSBtYXggVmFsdWUgKGluIGRhdGEgY29vcmRzKS5cbiAgLy8gVGhpcyBpcyBiZWNhdXNlIHBpeGVscyBpbmNyZWFzZSBhcyB5b3UgZ28gZG93biBvbiB0aGUgc2NyZWVuLCB3aGVyZWFzIGRhdGFcbiAgLy8gY29vcmRpbmF0ZXMgaW5jcmVhc2UgYXMgeW91IGdvIHVwIHRoZSBzY3JlZW4uXG4gIHZhciBvbGRWYWx1ZVJhbmdlcyA9IHRoaXMueUF4aXNSYW5nZXMoKTtcbiAgdmFyIG5ld1ZhbHVlUmFuZ2VzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5heGVzXy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBoaSA9IHRoaXMudG9EYXRhWUNvb3JkKGxvd1ksIGkpO1xuICAgIHZhciBsb3cgPSB0aGlzLnRvRGF0YVlDb29yZChoaWdoWSwgaSk7XG4gICAgbmV3VmFsdWVSYW5nZXMucHVzaChbbG93LCBoaV0pO1xuICB9XG5cbiAgY29uc3Qgem9vbUNhbGxiYWNrID0gdGhpcy5nZXRGdW5jdGlvbk9wdGlvbignem9vbUNhbGxiYWNrJyk7XG4gIGNvbnN0IHRoYXQgPSB0aGlzO1xuICB0aGlzLmRvQW5pbWF0ZWRab29tKG51bGwsIG51bGwsIG9sZFZhbHVlUmFuZ2VzLCBuZXdWYWx1ZVJhbmdlcywgZnVuY3Rpb24gYW5pbWF0ZWRab29tQ2FsbGJhY2soKSB7XG4gICAgaWYgKHpvb21DYWxsYmFjaykge1xuICAgICAgY29uc3QgW21pblgsIG1heFhdID0gdGhhdC54QXhpc1JhbmdlKCk7XG4gICAgICB6b29tQ2FsbGJhY2suY2FsbCh0aGF0LCBtaW5YLCBtYXhYLCB0aGF0LnlBeGlzUmFuZ2VzKCkpO1xuICAgIH1cbiAgfSk7XG59O1xuXG4vKipcbiAqIFRyYW5zaXRpb24gZnVuY3Rpb24gdG8gdXNlIGluIGFuaW1hdGlvbnMuIFJldHVybnMgdmFsdWVzIGJldHdlZW4gMC4wXG4gKiAodG90YWxseSBvbGQgdmFsdWVzKSBhbmQgMS4wICh0b3RhbGx5IG5ldyB2YWx1ZXMpIGZvciBlYWNoIGZyYW1lLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC56b29tQW5pbWF0aW9uRnVuY3Rpb24gPSBmdW5jdGlvbihmcmFtZSwgbnVtRnJhbWVzKSB7XG4gIHZhciBrID0gMS41O1xuICByZXR1cm4gKDEuMCAtIE1hdGgucG93KGssIC1mcmFtZSkpIC8gKDEuMCAtIE1hdGgucG93KGssIC1udW1GcmFtZXMpKTtcbn07XG5cbi8qKlxuICogUmVzZXQgdGhlIHpvb20gdG8gdGhlIG9yaWdpbmFsIHZpZXcgY29vcmRpbmF0ZXMuIFRoaXMgaXMgdGhlIHNhbWUgYXNcbiAqIGRvdWJsZS1jbGlja2luZyBvbiB0aGUgZ3JhcGguXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnJlc2V0Wm9vbSA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCBkaXJ0eVggPSB0aGlzLmlzWm9vbWVkKCd4Jyk7XG4gIGNvbnN0IGRpcnR5WSA9IHRoaXMuaXNab29tZWQoJ3knKTtcbiAgY29uc3QgZGlydHkgPSBkaXJ0eVggfHwgZGlydHlZO1xuXG4gIC8vIENsZWFyIGFueSBzZWxlY3Rpb24sIHNpbmNlIGl0J3MgbGlrZWx5IHRvIGJlIGRyYXduIGluIHRoZSB3cm9uZyBwbGFjZS5cbiAgdGhpcy5jbGVhclNlbGVjdGlvbigpO1xuXG4gIGlmICghZGlydHkpIHJldHVybjtcblxuICAvLyBDYWxjdWxhdGUgZXh0cmVtZXMgdG8gYXZvaWQgbGFjayBvZiBwYWRkaW5nIG9uIHJlc2V0LlxuICBjb25zdCBbbWluRGF0ZSwgbWF4RGF0ZV0gPSB0aGlzLnhBeGlzRXh0cmVtZXMoKTtcblxuICBjb25zdCBhbmltYXRlZFpvb21zID0gdGhpcy5nZXRCb29sZWFuT3B0aW9uKCdhbmltYXRlZFpvb21zJyk7XG4gIGNvbnN0IHpvb21DYWxsYmFjayA9IHRoaXMuZ2V0RnVuY3Rpb25PcHRpb24oJ3pvb21DYWxsYmFjaycpO1xuXG4gIC8vIFRPRE8oZGFudmspOiBtZXJnZSB0aGlzIGJsb2NrIHcvIHRoZSBjb2RlIGJlbG93LlxuICAvLyBUT0RPKGRhbnZrKTogZmFjdG9yIG91dCBhIGdlbmVyaWMsIHB1YmxpYyB6b29tVG8gbWV0aG9kLlxuICBpZiAoIWFuaW1hdGVkWm9vbXMpIHtcbiAgICB0aGlzLmRhdGVXaW5kb3dfID0gbnVsbDtcbiAgICB0aGlzLmF4ZXNfLmZvckVhY2goYXhpcyA9PiB7XG4gICAgICBpZiAoYXhpcy52YWx1ZVJhbmdlKSBkZWxldGUgYXhpcy52YWx1ZVJhbmdlO1xuICAgIH0pO1xuXG4gICAgdGhpcy5kcmF3R3JhcGhfKCk7XG4gICAgaWYgKHpvb21DYWxsYmFjaykge1xuICAgICAgem9vbUNhbGxiYWNrLmNhbGwodGhpcywgbWluRGF0ZSwgbWF4RGF0ZSwgdGhpcy55QXhpc1JhbmdlcygpKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIG9sZFdpbmRvdz1udWxsLCBuZXdXaW5kb3c9bnVsbCwgb2xkVmFsdWVSYW5nZXM9bnVsbCwgbmV3VmFsdWVSYW5nZXM9bnVsbDtcbiAgaWYgKGRpcnR5WCkge1xuICAgIG9sZFdpbmRvdyA9IHRoaXMueEF4aXNSYW5nZSgpO1xuICAgIG5ld1dpbmRvdyA9IFttaW5EYXRlLCBtYXhEYXRlXTtcbiAgfVxuXG4gIGlmIChkaXJ0eVkpIHtcbiAgICBvbGRWYWx1ZVJhbmdlcyA9IHRoaXMueUF4aXNSYW5nZXMoKTtcbiAgICBuZXdWYWx1ZVJhbmdlcyA9IHRoaXMueUF4aXNFeHRyZW1lcygpO1xuICB9XG5cbiAgY29uc3QgdGhhdCA9IHRoaXM7XG4gIHRoaXMuZG9BbmltYXRlZFpvb20ob2xkV2luZG93LCBuZXdXaW5kb3csIG9sZFZhbHVlUmFuZ2VzLCBuZXdWYWx1ZVJhbmdlcyxcbiAgICAgIGZ1bmN0aW9uIGFuaW1hdGVkWm9vbUNhbGxiYWNrKCkge1xuICAgICAgICB0aGF0LmRhdGVXaW5kb3dfID0gbnVsbDtcbiAgICAgICAgdGhhdC5heGVzXy5mb3JFYWNoKGF4aXMgPT4ge1xuICAgICAgICAgIGlmIChheGlzLnZhbHVlUmFuZ2UpIGRlbGV0ZSBheGlzLnZhbHVlUmFuZ2U7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoem9vbUNhbGxiYWNrKSB7XG4gICAgICAgICAgem9vbUNhbGxiYWNrLmNhbGwodGhhdCwgbWluRGF0ZSwgbWF4RGF0ZSwgdGhhdC55QXhpc1JhbmdlcygpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG59O1xuXG4vKipcbiAqIENvbWJpbmVkIGFuaW1hdGlvbiBsb2dpYyBmb3IgYWxsIHpvb20gZnVuY3Rpb25zLlxuICogZWl0aGVyIHRoZSB4IHBhcmFtZXRlcnMgb3IgeSBwYXJhbWV0ZXJzIG1heSBiZSBudWxsLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuZG9BbmltYXRlZFpvb20gPSBmdW5jdGlvbihvbGRYUmFuZ2UsIG5ld1hSYW5nZSwgb2xkWVJhbmdlcywgbmV3WVJhbmdlcywgY2FsbGJhY2spIHtcbiAgdmFyIHN0ZXBzID0gdGhpcy5nZXRCb29sZWFuT3B0aW9uKFwiYW5pbWF0ZWRab29tc1wiKSA/XG4gICAgICBEeWdyYXBoLkFOSU1BVElPTl9TVEVQUyA6IDE7XG5cbiAgdmFyIHdpbmRvd3MgPSBbXTtcbiAgdmFyIHZhbHVlUmFuZ2VzID0gW107XG4gIHZhciBzdGVwLCBmcmFjO1xuXG4gIGlmIChvbGRYUmFuZ2UgIT09IG51bGwgJiYgbmV3WFJhbmdlICE9PSBudWxsKSB7XG4gICAgZm9yIChzdGVwID0gMTsgc3RlcCA8PSBzdGVwczsgc3RlcCsrKSB7XG4gICAgICBmcmFjID0gRHlncmFwaC56b29tQW5pbWF0aW9uRnVuY3Rpb24oc3RlcCwgc3RlcHMpO1xuICAgICAgd2luZG93c1tzdGVwLTFdID0gW29sZFhSYW5nZVswXSooMS1mcmFjKSArIGZyYWMqbmV3WFJhbmdlWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgIG9sZFhSYW5nZVsxXSooMS1mcmFjKSArIGZyYWMqbmV3WFJhbmdlWzFdXTtcbiAgICB9XG4gIH1cblxuICBpZiAob2xkWVJhbmdlcyAhPT0gbnVsbCAmJiBuZXdZUmFuZ2VzICE9PSBudWxsKSB7XG4gICAgZm9yIChzdGVwID0gMTsgc3RlcCA8PSBzdGVwczsgc3RlcCsrKSB7XG4gICAgICBmcmFjID0gRHlncmFwaC56b29tQW5pbWF0aW9uRnVuY3Rpb24oc3RlcCwgc3RlcHMpO1xuICAgICAgdmFyIHRoaXNSYW5nZSA9IFtdO1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLmF4ZXNfLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHRoaXNSYW5nZS5wdXNoKFtvbGRZUmFuZ2VzW2pdWzBdKigxLWZyYWMpICsgZnJhYypuZXdZUmFuZ2VzW2pdWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2xkWVJhbmdlc1tqXVsxXSooMS1mcmFjKSArIGZyYWMqbmV3WVJhbmdlc1tqXVsxXV0pO1xuICAgICAgfVxuICAgICAgdmFsdWVSYW5nZXNbc3RlcC0xXSA9IHRoaXNSYW5nZTtcbiAgICB9XG4gIH1cblxuICBjb25zdCB0aGF0ID0gdGhpcztcbiAgdXRpbHMucmVwZWF0QW5kQ2xlYW51cChmdW5jdGlvbiAoc3RlcCkge1xuICAgIGlmICh2YWx1ZVJhbmdlcy5sZW5ndGgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhhdC5heGVzXy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgdyA9IHZhbHVlUmFuZ2VzW3N0ZXBdW2ldO1xuICAgICAgICB0aGF0LmF4ZXNfW2ldLnZhbHVlUmFuZ2UgPSBbd1swXSwgd1sxXV07XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh3aW5kb3dzLmxlbmd0aCkge1xuICAgICAgdGhhdC5kYXRlV2luZG93XyA9IHdpbmRvd3Nbc3RlcF07XG4gICAgfVxuICAgIHRoYXQuZHJhd0dyYXBoXygpO1xuICB9LCBzdGVwcywgRHlncmFwaC5BTklNQVRJT05fRFVSQVRJT04gLyBzdGVwcywgY2FsbGJhY2spO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIGN1cnJlbnQgZ3JhcGgncyBhcmVhIG9iamVjdC5cbiAqXG4gKiBSZXR1cm5zOiB7eCwgeSwgdywgaH1cbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuZ2V0QXJlYSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5wbG90dGVyXy5hcmVhO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0IGEgbW91c2UgZXZlbnQgdG8gRE9NIGNvb3JkaW5hdGVzIHJlbGF0aXZlIHRvIHRoZSBncmFwaCBvcmlnaW4uXG4gKlxuICogUmV0dXJucyBhIHR3by1lbGVtZW50IGFycmF5OiBbWCwgWV0uXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmV2ZW50VG9Eb21Db29yZHMgPSBmdW5jdGlvbihldmVudCkge1xuICBpZiAoZXZlbnQub2Zmc2V0WCAmJiBldmVudC5vZmZzZXRZKSB7XG4gICAgcmV0dXJuIFsgZXZlbnQub2Zmc2V0WCwgZXZlbnQub2Zmc2V0WSBdO1xuICB9IGVsc2Uge1xuICAgIHZhciBldmVudEVsZW1lbnRQb3MgPSB1dGlscy5maW5kUG9zKHRoaXMubW91c2VFdmVudEVsZW1lbnRfKTtcbiAgICB2YXIgY2FudmFzeCA9IHV0aWxzLnBhZ2VYKGV2ZW50KSAtIGV2ZW50RWxlbWVudFBvcy54O1xuICAgIHZhciBjYW52YXN5ID0gdXRpbHMucGFnZVkoZXZlbnQpIC0gZXZlbnRFbGVtZW50UG9zLnk7XG4gICAgcmV0dXJuIFtjYW52YXN4LCBjYW52YXN5XTtcbiAgfVxufTtcblxuLyoqXG4gKiBHaXZlbiBhIGNhbnZhcyBYIGNvb3JkaW5hdGUsIGZpbmQgdGhlIGNsb3Nlc3Qgcm93LlxuICogQHBhcmFtIHtudW1iZXJ9IGRvbVggZ3JhcGgtcmVsYXRpdmUgRE9NIFggY29vcmRpbmF0ZVxuICogUmV0dXJucyB7bnVtYmVyfSByb3cgbnVtYmVyLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuZmluZENsb3Nlc3RSb3cgPSBmdW5jdGlvbihkb21YKSB7XG4gIHZhciBtaW5EaXN0WCA9IEluZmluaXR5O1xuICB2YXIgY2xvc2VzdFJvdyA9IC0xO1xuICB2YXIgc2V0cyA9IHRoaXMubGF5b3V0Xy5wb2ludHM7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc2V0cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBwb2ludHMgPSBzZXRzW2ldO1xuICAgIHZhciBsZW4gPSBwb2ludHMubGVuZ3RoO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIHZhciBwb2ludCA9IHBvaW50c1tqXTtcbiAgICAgIGlmICghdXRpbHMuaXNWYWxpZFBvaW50KHBvaW50LCB0cnVlKSkgY29udGludWU7XG4gICAgICB2YXIgZGlzdCA9IE1hdGguYWJzKHBvaW50LmNhbnZhc3ggLSBkb21YKTtcbiAgICAgIGlmIChkaXN0IDwgbWluRGlzdFgpIHtcbiAgICAgICAgbWluRGlzdFggPSBkaXN0O1xuICAgICAgICBjbG9zZXN0Um93ID0gcG9pbnQuaWR4O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjbG9zZXN0Um93O1xufTtcblxuLyoqXG4gKiBHaXZlbiBjYW52YXMgWCxZIGNvb3JkaW5hdGVzLCBmaW5kIHRoZSBjbG9zZXN0IHBvaW50LlxuICpcbiAqIFRoaXMgZmluZHMgdGhlIGluZGl2aWR1YWwgZGF0YSBwb2ludCBhY3Jvc3MgYWxsIHZpc2libGUgc2VyaWVzXG4gKiB0aGF0J3MgY2xvc2VzdCB0byB0aGUgc3VwcGxpZWQgRE9NIGNvb3JkaW5hdGVzIHVzaW5nIHRoZSBzdGFuZGFyZFxuICogRXVjbGlkZWFuIFgsWSBkaXN0YW5jZS5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gZG9tWCBncmFwaC1yZWxhdGl2ZSBET00gWCBjb29yZGluYXRlXG4gKiBAcGFyYW0ge251bWJlcn0gZG9tWSBncmFwaC1yZWxhdGl2ZSBET00gWSBjb29yZGluYXRlXG4gKiBSZXR1cm5zOiB7cm93LCBzZXJpZXNOYW1lLCBwb2ludH1cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmZpbmRDbG9zZXN0UG9pbnQgPSBmdW5jdGlvbihkb21YLCBkb21ZKSB7XG4gIHZhciBtaW5EaXN0ID0gSW5maW5pdHk7XG4gIHZhciBkaXN0LCBkeCwgZHksIHBvaW50LCBjbG9zZXN0UG9pbnQsIGNsb3Nlc3RTZXJpZXMsIGNsb3Nlc3RSb3c7XG4gIGZvciAoIHZhciBzZXRJZHggPSB0aGlzLmxheW91dF8ucG9pbnRzLmxlbmd0aCAtIDEgOyBzZXRJZHggPj0gMCA7IC0tc2V0SWR4ICkge1xuICAgIHZhciBwb2ludHMgPSB0aGlzLmxheW91dF8ucG9pbnRzW3NldElkeF07XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHBvaW50ID0gcG9pbnRzW2ldO1xuICAgICAgaWYgKCF1dGlscy5pc1ZhbGlkUG9pbnQocG9pbnQpKSBjb250aW51ZTtcbiAgICAgIGR4ID0gcG9pbnQuY2FudmFzeCAtIGRvbVg7XG4gICAgICBkeSA9IHBvaW50LmNhbnZhc3kgLSBkb21ZO1xuICAgICAgZGlzdCA9IGR4ICogZHggKyBkeSAqIGR5O1xuICAgICAgaWYgKGRpc3QgPCBtaW5EaXN0KSB7XG4gICAgICAgIG1pbkRpc3QgPSBkaXN0O1xuICAgICAgICBjbG9zZXN0UG9pbnQgPSBwb2ludDtcbiAgICAgICAgY2xvc2VzdFNlcmllcyA9IHNldElkeDtcbiAgICAgICAgY2xvc2VzdFJvdyA9IHBvaW50LmlkeDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgdmFyIG5hbWUgPSB0aGlzLmxheW91dF8uc2V0TmFtZXNbY2xvc2VzdFNlcmllc107XG4gIHJldHVybiB7XG4gICAgcm93OiBjbG9zZXN0Um93LFxuICAgIHNlcmllc05hbWU6IG5hbWUsXG4gICAgcG9pbnQ6IGNsb3Nlc3RQb2ludFxuICB9O1xufTtcblxuLyoqXG4gKiBHaXZlbiBjYW52YXMgWCxZIGNvb3JkaW5hdGVzLCBmaW5kIHRoZSB0b3VjaGVkIGFyZWEgaW4gYSBzdGFja2VkIGdyYXBoLlxuICpcbiAqIFRoaXMgZmlyc3QgZmluZHMgdGhlIFggZGF0YSBwb2ludCBjbG9zZXN0IHRvIHRoZSBzdXBwbGllZCBET00gWCBjb29yZGluYXRlLFxuICogdGhlbiBmaW5kcyB0aGUgc2VyaWVzIHdoaWNoIHB1dHMgdGhlIFkgY29vcmRpbmF0ZSBvbiB0b3Agb2YgaXRzIGZpbGxlZCBhcmVhLFxuICogdXNpbmcgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiBhZGphY2VudCBwb2ludCBwYWlycy5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gZG9tWCBncmFwaC1yZWxhdGl2ZSBET00gWCBjb29yZGluYXRlXG4gKiBAcGFyYW0ge251bWJlcn0gZG9tWSBncmFwaC1yZWxhdGl2ZSBET00gWSBjb29yZGluYXRlXG4gKiBSZXR1cm5zOiB7cm93LCBzZXJpZXNOYW1lLCBwb2ludH1cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmZpbmRTdGFja2VkUG9pbnQgPSBmdW5jdGlvbihkb21YLCBkb21ZKSB7XG4gIHZhciByb3cgPSB0aGlzLmZpbmRDbG9zZXN0Um93KGRvbVgpO1xuICB2YXIgY2xvc2VzdFBvaW50LCBjbG9zZXN0U2VyaWVzO1xuICBmb3IgKHZhciBzZXRJZHggPSAwOyBzZXRJZHggPCB0aGlzLmxheW91dF8ucG9pbnRzLmxlbmd0aDsgKytzZXRJZHgpIHtcbiAgICB2YXIgYm91bmRhcnkgPSB0aGlzLmdldExlZnRCb3VuZGFyeV8oc2V0SWR4KTtcbiAgICB2YXIgcm93SWR4ID0gcm93IC0gYm91bmRhcnk7XG4gICAgdmFyIHBvaW50cyA9IHRoaXMubGF5b3V0Xy5wb2ludHNbc2V0SWR4XTtcbiAgICBpZiAocm93SWR4ID49IHBvaW50cy5sZW5ndGgpIGNvbnRpbnVlO1xuICAgIHZhciBwMSA9IHBvaW50c1tyb3dJZHhdO1xuICAgIGlmICghdXRpbHMuaXNWYWxpZFBvaW50KHAxKSkgY29udGludWU7XG4gICAgdmFyIHB5ID0gcDEuY2FudmFzeTtcbiAgICBpZiAoZG9tWCA+IHAxLmNhbnZhc3ggJiYgcm93SWR4ICsgMSA8IHBvaW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGludGVycG9sYXRlIHNlcmllcyBZIHZhbHVlIHVzaW5nIG5leHQgcG9pbnRcbiAgICAgIHZhciBwMiA9IHBvaW50c1tyb3dJZHggKyAxXTtcbiAgICAgIGlmICh1dGlscy5pc1ZhbGlkUG9pbnQocDIpKSB7XG4gICAgICAgIHZhciBkeCA9IHAyLmNhbnZhc3ggLSBwMS5jYW52YXN4O1xuICAgICAgICBpZiAoZHggPiAwKSB7XG4gICAgICAgICAgdmFyIHIgPSAoZG9tWCAtIHAxLmNhbnZhc3gpIC8gZHg7XG4gICAgICAgICAgcHkgKz0gciAqIChwMi5jYW52YXN5IC0gcDEuY2FudmFzeSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGRvbVggPCBwMS5jYW52YXN4ICYmIHJvd0lkeCA+IDApIHtcbiAgICAgIC8vIGludGVycG9sYXRlIHNlcmllcyBZIHZhbHVlIHVzaW5nIHByZXZpb3VzIHBvaW50XG4gICAgICB2YXIgcDAgPSBwb2ludHNbcm93SWR4IC0gMV07XG4gICAgICBpZiAodXRpbHMuaXNWYWxpZFBvaW50KHAwKSkge1xuICAgICAgICB2YXIgZHggPSBwMS5jYW52YXN4IC0gcDAuY2FudmFzeDtcbiAgICAgICAgaWYgKGR4ID4gMCkge1xuICAgICAgICAgIHZhciByID0gKHAxLmNhbnZhc3ggLSBkb21YKSAvIGR4O1xuICAgICAgICAgIHB5ICs9IHIgKiAocDAuY2FudmFzeSAtIHAxLmNhbnZhc3kpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFN0b3AgaWYgdGhlIHBvaW50IChkb21YLCBweSkgaXMgYWJvdmUgdGhpcyBzZXJpZXMnIHVwcGVyIGVkZ2VcbiAgICBpZiAoc2V0SWR4ID09PSAwIHx8IHB5IDwgZG9tWSkge1xuICAgICAgY2xvc2VzdFBvaW50ID0gcDE7XG4gICAgICBjbG9zZXN0U2VyaWVzID0gc2V0SWR4O1xuICAgIH1cbiAgfVxuICB2YXIgbmFtZSA9IHRoaXMubGF5b3V0Xy5zZXROYW1lc1tjbG9zZXN0U2VyaWVzXTtcbiAgcmV0dXJuIHtcbiAgICByb3c6IHJvdyxcbiAgICBzZXJpZXNOYW1lOiBuYW1lLFxuICAgIHBvaW50OiBjbG9zZXN0UG9pbnRcbiAgfTtcbn07XG5cbi8qKlxuICogV2hlbiB0aGUgbW91c2UgbW92ZXMgaW4gdGhlIGNhbnZhcywgZGlzcGxheSBpbmZvcm1hdGlvbiBhYm91dCBhIG5lYXJieSBkYXRhXG4gKiBwb2ludCBhbmQgZHJhdyBkb3RzIG92ZXIgdGhvc2UgcG9pbnRzIGluIHRoZSBkYXRhIHNlcmllcy4gVGhpcyBmdW5jdGlvblxuICogdGFrZXMgY2FyZSBvZiBjbGVhbnVwIG9mIHByZXZpb3VzbHktZHJhd24gZG90cy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCBUaGUgbW91c2Vtb3ZlIGV2ZW50IGZyb20gdGhlIGJyb3dzZXIuXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5tb3VzZU1vdmVfID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgLy8gVGhpcyBwcmV2ZW50cyBKUyBlcnJvcnMgd2hlbiBtb3VzaW5nIG92ZXIgdGhlIGNhbnZhcyBiZWZvcmUgZGF0YSBsb2Fkcy5cbiAgdmFyIHBvaW50cyA9IHRoaXMubGF5b3V0Xy5wb2ludHM7XG4gIGlmIChwb2ludHMgPT09IHVuZGVmaW5lZCB8fCBwb2ludHMgPT09IG51bGwpIHJldHVybjtcblxuICB2YXIgY2FudmFzQ29vcmRzID0gdGhpcy5ldmVudFRvRG9tQ29vcmRzKGV2ZW50KTtcbiAgdmFyIGNhbnZhc3ggPSBjYW52YXNDb29yZHNbMF07XG4gIHZhciBjYW52YXN5ID0gY2FudmFzQ29vcmRzWzFdO1xuXG4gIHZhciBoaWdobGlnaHRTZXJpZXNPcHRzID0gdGhpcy5nZXRPcHRpb24oXCJoaWdobGlnaHRTZXJpZXNPcHRzXCIpO1xuICB2YXIgc2VsZWN0aW9uQ2hhbmdlZCA9IGZhbHNlO1xuICBpZiAoaGlnaGxpZ2h0U2VyaWVzT3B0cyAmJiAhdGhpcy5pc1Nlcmllc0xvY2tlZCgpKSB7XG4gICAgdmFyIGNsb3Nlc3Q7XG4gICAgaWYgKHRoaXMuZ2V0Qm9vbGVhbk9wdGlvbihcInN0YWNrZWRHcmFwaFwiKSkge1xuICAgICAgY2xvc2VzdCA9IHRoaXMuZmluZFN0YWNrZWRQb2ludChjYW52YXN4LCBjYW52YXN5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2xvc2VzdCA9IHRoaXMuZmluZENsb3Nlc3RQb2ludChjYW52YXN4LCBjYW52YXN5KTtcbiAgICB9XG4gICAgc2VsZWN0aW9uQ2hhbmdlZCA9IHRoaXMuc2V0U2VsZWN0aW9uKGNsb3Nlc3Qucm93LCBjbG9zZXN0LnNlcmllc05hbWUpO1xuICB9IGVsc2Uge1xuICAgIHZhciBpZHggPSB0aGlzLmZpbmRDbG9zZXN0Um93KGNhbnZhc3gpO1xuICAgIHNlbGVjdGlvbkNoYW5nZWQgPSB0aGlzLnNldFNlbGVjdGlvbihpZHgpO1xuICB9XG5cbiAgdmFyIGNhbGxiYWNrID0gdGhpcy5nZXRGdW5jdGlvbk9wdGlvbihcImhpZ2hsaWdodENhbGxiYWNrXCIpO1xuICBpZiAoY2FsbGJhY2sgJiYgc2VsZWN0aW9uQ2hhbmdlZCkge1xuICAgIGNhbGxiYWNrLmNhbGwodGhpcywgZXZlbnQsXG4gICAgICAgIHRoaXMubGFzdHhfLFxuICAgICAgICB0aGlzLnNlbFBvaW50c18sXG4gICAgICAgIHRoaXMubGFzdFJvd18sXG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0U2V0Xyk7XG4gIH1cbn07XG5cbi8qKlxuICogRmV0Y2ggbGVmdCBvZmZzZXQgZnJvbSB0aGUgc3BlY2lmaWVkIHNldCBpbmRleCBvciBpZiBub3QgcGFzc2VkLCB0aGVcbiAqIGZpcnN0IGRlZmluZWQgYm91bmRhcnlJZHMgcmVjb3JkIChzZWUgYnVnICMyMzYpLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuZ2V0TGVmdEJvdW5kYXJ5XyA9IGZ1bmN0aW9uKHNldElkeCkge1xuICBpZiAodGhpcy5ib3VuZGFyeUlkc19bc2V0SWR4XSkge1xuICAgICAgcmV0dXJuIHRoaXMuYm91bmRhcnlJZHNfW3NldElkeF1bMF07XG4gIH0gZWxzZSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmJvdW5kYXJ5SWRzXy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMuYm91bmRhcnlJZHNfW2ldICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYm91bmRhcnlJZHNfW2ldWzBdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gMDtcbiAgfVxufTtcblxuRHlncmFwaC5wcm90b3R5cGUuYW5pbWF0ZVNlbGVjdGlvbl8gPSBmdW5jdGlvbihkaXJlY3Rpb24pIHtcbiAgdmFyIHRvdGFsU3RlcHMgPSAxMDtcbiAgdmFyIG1pbGxpcyA9IDMwO1xuICBpZiAodGhpcy5mYWRlTGV2ZWwgPT09IHVuZGVmaW5lZCkgdGhpcy5mYWRlTGV2ZWwgPSAwO1xuICBpZiAodGhpcy5hbmltYXRlSWQgPT09IHVuZGVmaW5lZCkgdGhpcy5hbmltYXRlSWQgPSAwO1xuICB2YXIgc3RhcnQgPSB0aGlzLmZhZGVMZXZlbDtcbiAgdmFyIHN0ZXBzID0gZGlyZWN0aW9uIDwgMCA/IHN0YXJ0IDogdG90YWxTdGVwcyAtIHN0YXJ0O1xuICBpZiAoc3RlcHMgPD0gMCkge1xuICAgIGlmICh0aGlzLmZhZGVMZXZlbCkge1xuICAgICAgdGhpcy51cGRhdGVTZWxlY3Rpb25fKDEuMCk7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciB0aGlzSWQgPSArK3RoaXMuYW5pbWF0ZUlkO1xuICB2YXIgdGhhdCA9IHRoaXM7XG4gIHZhciBjbGVhbnVwSWZDbGVhcmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIGlmIHdlIGhhdmVuJ3QgcmVhY2hlZCBmYWRlTGV2ZWwgMCBpbiB0aGUgbWF4IGZyYW1lIHRpbWUsXG4gICAgLy8gZW5zdXJlIHRoYXQgdGhlIGNsZWFyIGhhcHBlbnMgYW5kIGp1c3QgZ28gdG8gMFxuICAgIGlmICh0aGF0LmZhZGVMZXZlbCAhPT0gMCAmJiBkaXJlY3Rpb24gPCAwKSB7XG4gICAgICB0aGF0LmZhZGVMZXZlbCA9IDA7XG4gICAgICB0aGF0LmNsZWFyU2VsZWN0aW9uKCk7XG4gICAgfVxuICB9O1xuICB1dGlscy5yZXBlYXRBbmRDbGVhbnVwKFxuICAgIGZ1bmN0aW9uKG4pIHtcbiAgICAgIC8vIGlnbm9yZSBzaW11bHRhbmVvdXMgYW5pbWF0aW9uc1xuICAgICAgaWYgKHRoYXQuYW5pbWF0ZUlkICE9IHRoaXNJZCkgcmV0dXJuO1xuXG4gICAgICB0aGF0LmZhZGVMZXZlbCArPSBkaXJlY3Rpb247XG4gICAgICBpZiAodGhhdC5mYWRlTGV2ZWwgPT09IDApIHtcbiAgICAgICAgdGhhdC5jbGVhclNlbGVjdGlvbigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhhdC51cGRhdGVTZWxlY3Rpb25fKHRoYXQuZmFkZUxldmVsIC8gdG90YWxTdGVwcyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBzdGVwcywgbWlsbGlzLCBjbGVhbnVwSWZDbGVhcmluZyk7XG59O1xuXG4vKipcbiAqIERyYXcgZG90cyBvdmVyIHRoZSBzZWxlY3RpZWQgcG9pbnRzIGluIHRoZSBkYXRhIHNlcmllcy4gVGhpcyBmdW5jdGlvblxuICogdGFrZXMgY2FyZSBvZiBjbGVhbnVwIG9mIHByZXZpb3VzbHktZHJhd24gZG90cy5cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnVwZGF0ZVNlbGVjdGlvbl8gPSBmdW5jdGlvbihvcHRfYW5pbUZyYWN0aW9uKSB7XG4gIC8qdmFyIGRlZmF1bHRQcmV2ZW50ZWQgPSAqL1xuICB0aGlzLmNhc2NhZGVFdmVudHNfKCdzZWxlY3QnLCB7XG4gICAgc2VsZWN0ZWRSb3c6IHRoaXMubGFzdFJvd18gPT09IC0xID8gdW5kZWZpbmVkIDogdGhpcy5sYXN0Um93XyxcbiAgICBzZWxlY3RlZFg6IHRoaXMubGFzdHhfID09PSBudWxsID8gdW5kZWZpbmVkIDogdGhpcy5sYXN0eF8sXG4gICAgc2VsZWN0ZWRQb2ludHM6IHRoaXMuc2VsUG9pbnRzX1xuICB9KTtcbiAgLy8gVE9ETyhkYW52ayk6IHVzZSBkZWZhdWx0UHJldmVudGVkIGhlcmU/XG5cbiAgLy8gQ2xlYXIgdGhlIHByZXZpb3VzbHkgZHJhd24gdmVydGljYWwsIGlmIHRoZXJlIGlzIG9uZVxuICB2YXIgaTtcbiAgdmFyIGN0eCA9IHRoaXMuY2FudmFzX2N0eF87XG4gIGlmICh0aGlzLmdldE9wdGlvbignaGlnaGxpZ2h0U2VyaWVzT3B0cycpKSB7XG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoXywgdGhpcy5oZWlnaHRfKTtcbiAgICB2YXIgYWxwaGEgPSAxLjAgLSB0aGlzLmdldE51bWVyaWNPcHRpb24oJ2hpZ2hsaWdodFNlcmllc0JhY2tncm91bmRBbHBoYScpO1xuICAgIHZhciBiYWNrZ3JvdW5kQ29sb3IgPSB1dGlscy50b1JHQl8odGhpcy5nZXRPcHRpb24oJ2hpZ2hsaWdodFNlcmllc0JhY2tncm91bmRDb2xvcicpKTtcblxuICAgIGlmIChhbHBoYSkge1xuICAgICAgLy8gQWN0aXZhdGluZyBiYWNrZ3JvdW5kIGZhZGUgaW5jbHVkZXMgYW4gYW5pbWF0aW9uIGVmZmVjdCBmb3IgYSBncmFkdWFsXG4gICAgICAvLyBmYWRlLiBUT0RPKGtsYXVzdyk6IG1ha2UgdGhpcyBpbmRlcGVuZGVudGx5IGNvbmZpZ3VyYWJsZSBpZiBpdCBjYXVzZXNcbiAgICAgIC8vIGlzc3Vlcz8gVXNlIGEgc2hhcmVkIHByZWZlcmVuY2UgdG8gY29udHJvbCBhbmltYXRpb25zP1xuICAgICAgdmFyIGFuaW1hdGVCYWNrZ3JvdW5kRmFkZSA9IHRoaXMuZ2V0Qm9vbGVhbk9wdGlvbignYW5pbWF0ZUJhY2tncm91bmRGYWRlJyk7XG4gICAgICBpZiAoYW5pbWF0ZUJhY2tncm91bmRGYWRlKSB7XG4gICAgICAgIGlmIChvcHRfYW5pbUZyYWN0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBzdGFydCBhIG5ldyBhbmltYXRpb25cbiAgICAgICAgICB0aGlzLmFuaW1hdGVTZWxlY3Rpb25fKDEpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBhbHBoYSAqPSBvcHRfYW5pbUZyYWN0aW9uO1xuICAgICAgfVxuICAgICAgY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKCcgKyBiYWNrZ3JvdW5kQ29sb3IuciArICcsJyArIGJhY2tncm91bmRDb2xvci5nICsgJywnICsgYmFja2dyb3VuZENvbG9yLmIgKyAnLCcgKyBhbHBoYSArICcpJztcbiAgICAgIGN0eC5maWxsUmVjdCgwLCAwLCB0aGlzLndpZHRoXywgdGhpcy5oZWlnaHRfKTtcbiAgICB9XG5cbiAgICAvLyBSZWRyYXcgb25seSB0aGUgaGlnaGxpZ2h0ZWQgc2VyaWVzIGluIHRoZSBpbnRlcmFjdGl2ZSBjYW52YXMgKG5vdCB0aGVcbiAgICAvLyBzdGF0aWMgcGxvdCBjYW52YXMsIHdoaWNoIGlzIHdoZXJlIHNlcmllcyBhcmUgdXN1YWxseSBkcmF3bikuXG4gICAgdGhpcy5wbG90dGVyXy5fcmVuZGVyTGluZUNoYXJ0KHRoaXMuaGlnaGxpZ2h0U2V0XywgY3R4KTtcbiAgfSBlbHNlIGlmICh0aGlzLnByZXZpb3VzVmVydGljYWxYXyA+PSAwKSB7XG4gICAgLy8gRGV0ZXJtaW5lIHRoZSBtYXhpbXVtIGhpZ2hsaWdodCBjaXJjbGUgc2l6ZS5cbiAgICB2YXIgbWF4Q2lyY2xlU2l6ZSA9IDA7XG4gICAgdmFyIGxhYmVscyA9IHRoaXMuYXR0cl8oJ2xhYmVscycpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsYWJlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciByID0gdGhpcy5nZXROdW1lcmljT3B0aW9uKCdoaWdobGlnaHRDaXJjbGVTaXplJywgbGFiZWxzW2ldKTtcbiAgICAgIGlmIChyID4gbWF4Q2lyY2xlU2l6ZSkgbWF4Q2lyY2xlU2l6ZSA9IHI7XG4gICAgfVxuICAgIHZhciBweCA9IHRoaXMucHJldmlvdXNWZXJ0aWNhbFhfO1xuICAgIGN0eC5jbGVhclJlY3QocHggLSBtYXhDaXJjbGVTaXplIC0gMSwgMCxcbiAgICAgICAgICAgICAgICAgIDIgKiBtYXhDaXJjbGVTaXplICsgMiwgdGhpcy5oZWlnaHRfKTtcbiAgfVxuXG4gIGlmICh0aGlzLnNlbFBvaW50c18ubGVuZ3RoID4gMCkge1xuICAgIC8vIERyYXcgY29sb3JlZCBjaXJjbGVzIG92ZXIgdGhlIGNlbnRlciBvZiBlYWNoIHNlbGVjdGVkIHBvaW50XG4gICAgdmFyIGNhbnZhc3ggPSB0aGlzLnNlbFBvaW50c19bMF0uY2FudmFzeDtcbiAgICBjdHguc2F2ZSgpO1xuICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnNlbFBvaW50c18ubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwdCA9IHRoaXMuc2VsUG9pbnRzX1tpXTtcbiAgICAgIGlmIChpc05hTihwdC5jYW52YXN5KSkgY29udGludWU7XG5cbiAgICAgIHZhciBjaXJjbGVTaXplID0gdGhpcy5nZXROdW1lcmljT3B0aW9uKCdoaWdobGlnaHRDaXJjbGVTaXplJywgcHQubmFtZSk7XG4gICAgICB2YXIgY2FsbGJhY2sgPSB0aGlzLmdldEZ1bmN0aW9uT3B0aW9uKFwiZHJhd0hpZ2hsaWdodFBvaW50Q2FsbGJhY2tcIiwgcHQubmFtZSk7XG4gICAgICB2YXIgY29sb3IgPSB0aGlzLnBsb3R0ZXJfLmNvbG9yc1twdC5uYW1lXTtcbiAgICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSB1dGlscy5DaXJjbGVzLkRFRkFVTFQ7XG4gICAgICB9XG4gICAgICBjdHgubGluZVdpZHRoID0gdGhpcy5nZXROdW1lcmljT3B0aW9uKCdzdHJva2VXaWR0aCcsIHB0Lm5hbWUpO1xuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gY29sb3I7XG4gICAgICBjdHguZmlsbFN0eWxlID0gY29sb3I7XG4gICAgICBjYWxsYmFjay5jYWxsKHRoaXMsIHRoaXMsIHB0Lm5hbWUsIGN0eCwgY2FudmFzeCwgcHQuY2FudmFzeSxcbiAgICAgICAgICBjb2xvciwgY2lyY2xlU2l6ZSwgcHQuaWR4KTtcbiAgICB9XG4gICAgY3R4LnJlc3RvcmUoKTtcblxuICAgIHRoaXMucHJldmlvdXNWZXJ0aWNhbFhfID0gY2FudmFzeDtcbiAgfVxufTtcblxuLyoqXG4gKiBNYW51YWxseSBzZXQgdGhlIHNlbGVjdGVkIHBvaW50cyBhbmQgZGlzcGxheSBpbmZvcm1hdGlvbiBhYm91dCB0aGVtIGluIHRoZVxuICogbGVnZW5kLiBUaGUgc2VsZWN0aW9uIGNhbiBiZSBjbGVhcmVkIHVzaW5nIGNsZWFyU2VsZWN0aW9uKCkgYW5kIHF1ZXJpZWRcbiAqIHVzaW5nIGdldFNlbGVjdGlvbigpLlxuICpcbiAqIFRvIHNldCBhIHNlbGVjdGVkIHNlcmllcyBidXQgbm90IGEgc2VsZWN0ZWQgcG9pbnQsIGNhbGwgc2V0U2VsZWN0aW9uIHdpdGhcbiAqIHJvdz1mYWxzZSBhbmQgdGhlIHNlbGVjdGVkIHNlcmllcyBuYW1lLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSByb3cgUm93IG51bWJlciB0aGF0IHNob3VsZCBiZSBoaWdobGlnaHRlZCAoaS5lLiBhcHBlYXIgd2l0aFxuICogaG92ZXIgZG90cyBvbiB0aGUgY2hhcnQpLlxuICogQHBhcmFtIHtzZXJpZXNOYW1lfSBvcHRpb25hbCBzZXJpZXMgbmFtZSB0byBoaWdobGlnaHQgdGhhdCBzZXJpZXMgd2l0aCB0aGVcbiAqIHRoZSBoaWdobGlnaHRTZXJpZXNPcHRzIHNldHRpbmcuXG4gKiBAcGFyYW0ge2xvY2tlZH0gb3B0aW9uYWwgSWYgdHJ1ZSwga2VlcCBzZXJpZXNOYW1lIHNlbGVjdGVkIHdoZW4gbW91c2luZ1xuICogb3ZlciB0aGUgZ3JhcGgsIGRpc2FibGluZyBjbG9zZXN0LXNlcmllcyBoaWdobGlnaHRpbmcuIENhbGwgY2xlYXJTZWxlY3Rpb24oKVxuICogdG8gdW5sb2NrIGl0LlxuICogQHBhcmFtIHt0cmlnZ2VyX2hpZ2hsaWdodF9jYWxsYmFja30gb3B0aW9uYWwgSWYgdHJ1ZSwgdHJpZ2dlciBhbnlcbiAqIHVzZXItZGVmaW5lZCBoaWdobGlnaHRDYWxsYmFjayBpZiBoaWdobGlnaHRDYWxsYmFjayBoYXMgYmVlbiBzZXQuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnNldFNlbGVjdGlvbiA9IGZ1bmN0aW9uIHNldFNlbGVjdGlvbihyb3csIG9wdF9zZXJpZXNOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdF9sb2NrZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0X3RyaWdnZXJfaGlnaGxpZ2h0X2NhbGxiYWNrKSB7XG4gIC8vIEV4dHJhY3QgdGhlIHBvaW50cyB3ZSd2ZSBzZWxlY3RlZFxuICB0aGlzLnNlbFBvaW50c18gPSBbXTtcblxuICB2YXIgY2hhbmdlZCA9IGZhbHNlO1xuICBpZiAocm93ICE9PSBmYWxzZSAmJiByb3cgPj0gMCkge1xuICAgIGlmIChyb3cgIT0gdGhpcy5sYXN0Um93XykgY2hhbmdlZCA9IHRydWU7XG4gICAgdGhpcy5sYXN0Um93XyA9IHJvdztcbiAgICBmb3IgKHZhciBzZXRJZHggPSAwOyBzZXRJZHggPCB0aGlzLmxheW91dF8ucG9pbnRzLmxlbmd0aDsgKytzZXRJZHgpIHtcbiAgICAgIHZhciBwb2ludHMgPSB0aGlzLmxheW91dF8ucG9pbnRzW3NldElkeF07XG4gICAgICAvLyBDaGVjayBpZiB0aGUgcG9pbnQgYXQgdGhlIGFwcHJvcHJpYXRlIGluZGV4IGlzIHRoZSBwb2ludCB3ZSdyZSBsb29raW5nXG4gICAgICAvLyBmb3IuICBJZiBpdCBpcywganVzdCB1c2UgaXQsIG90aGVyd2lzZSBzZWFyY2ggdGhlIGFycmF5IGZvciBhIHBvaW50XG4gICAgICAvLyBpbiB0aGUgcHJvcGVyIHBsYWNlLlxuICAgICAgdmFyIHNldFJvdyA9IHJvdyAtIHRoaXMuZ2V0TGVmdEJvdW5kYXJ5XyhzZXRJZHgpO1xuICAgICAgaWYgKHNldFJvdyA+PSAwICYmIHNldFJvdyA8IHBvaW50cy5sZW5ndGggJiYgcG9pbnRzW3NldFJvd10uaWR4ID09IHJvdykge1xuICAgICAgICB2YXIgcG9pbnQgPSBwb2ludHNbc2V0Um93XTtcbiAgICAgICAgaWYgKHBvaW50Lnl2YWwgIT09IG51bGwpIHRoaXMuc2VsUG9pbnRzXy5wdXNoKHBvaW50KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAodmFyIHBvaW50SWR4ID0gMDsgcG9pbnRJZHggPCBwb2ludHMubGVuZ3RoOyArK3BvaW50SWR4KSB7XG4gICAgICAgICAgdmFyIHBvaW50ID0gcG9pbnRzW3BvaW50SWR4XTtcbiAgICAgICAgICBpZiAocG9pbnQuaWR4ID09IHJvdykge1xuICAgICAgICAgICAgaWYgKHBvaW50Lnl2YWwgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgdGhpcy5zZWxQb2ludHNfLnB1c2gocG9pbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmICh0aGlzLmxhc3RSb3dfID49IDApIGNoYW5nZWQgPSB0cnVlO1xuICAgIHRoaXMubGFzdFJvd18gPSAtMTtcbiAgfVxuXG4gIGlmICh0aGlzLnNlbFBvaW50c18ubGVuZ3RoKSB7XG4gICAgdGhpcy5sYXN0eF8gPSB0aGlzLnNlbFBvaW50c19bMF0ueHZhbDtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmxhc3R4XyA9IG51bGw7XG4gIH1cblxuICBpZiAob3B0X3Nlcmllc05hbWUgIT09IHVuZGVmaW5lZCkge1xuICAgIGlmICh0aGlzLmhpZ2hsaWdodFNldF8gIT09IG9wdF9zZXJpZXNOYW1lKSBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB0aGlzLmhpZ2hsaWdodFNldF8gPSBvcHRfc2VyaWVzTmFtZTtcbiAgfVxuXG4gIGlmIChvcHRfbG9ja2VkICE9PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzLmxvY2tlZFNldF8gPSBvcHRfbG9ja2VkO1xuICB9XG5cbiAgaWYgKGNoYW5nZWQpIHtcbiAgICB0aGlzLnVwZGF0ZVNlbGVjdGlvbl8odW5kZWZpbmVkKTtcblxuICAgIGlmIChvcHRfdHJpZ2dlcl9oaWdobGlnaHRfY2FsbGJhY2spIHtcbiAgICAgIHZhciBjYWxsYmFjayA9IHRoaXMuZ2V0RnVuY3Rpb25PcHRpb24oXCJoaWdobGlnaHRDYWxsYmFja1wiKTtcbiAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICB2YXIgZXZlbnQgPSB7fTtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCBldmVudCxcbiAgICAgICAgICB0aGlzLmxhc3R4XyxcbiAgICAgICAgICB0aGlzLnNlbFBvaW50c18sXG4gICAgICAgICAgdGhpcy5sYXN0Um93XyxcbiAgICAgICAgICB0aGlzLmhpZ2hsaWdodFNldF8pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gY2hhbmdlZDtcbn07XG5cbi8qKlxuICogVGhlIG1vdXNlIGhhcyBsZWZ0IHRoZSBjYW52YXMuIENsZWFyIG91dCB3aGF0ZXZlciBhcnRpZmFjdHMgcmVtYWluXG4gKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgdGhlIG1vdXNlb3V0IGV2ZW50IGZyb20gdGhlIGJyb3dzZXIuXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5tb3VzZU91dF8gPSBmdW5jdGlvbihldmVudCkge1xuICBpZiAodGhpcy5nZXRGdW5jdGlvbk9wdGlvbihcInVuaGlnaGxpZ2h0Q2FsbGJhY2tcIikpIHtcbiAgICB0aGlzLmdldEZ1bmN0aW9uT3B0aW9uKFwidW5oaWdobGlnaHRDYWxsYmFja1wiKS5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgfVxuXG4gIGlmICh0aGlzLmdldEJvb2xlYW5PcHRpb24oXCJoaWRlT3ZlcmxheU9uTW91c2VPdXRcIikgJiYgIXRoaXMubG9ja2VkU2V0Xykge1xuICAgIHRoaXMuY2xlYXJTZWxlY3Rpb24oKTtcbiAgfVxufTtcblxuLyoqXG4gKiBDbGVhcnMgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIChpLmUuIHBvaW50cyB0aGF0IHdlcmUgaGlnaGxpZ2h0ZWQgYnkgbW92aW5nXG4gKiB0aGUgbW91c2Ugb3ZlciB0aGUgY2hhcnQpLlxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5jbGVhclNlbGVjdGlvbiA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmNhc2NhZGVFdmVudHNfKCdkZXNlbGVjdCcsIHt9KTtcblxuICB0aGlzLmxvY2tlZFNldF8gPSBmYWxzZTtcbiAgLy8gR2V0IHJpZCBvZiB0aGUgb3ZlcmxheSBkYXRhXG4gIGlmICh0aGlzLmZhZGVMZXZlbCkge1xuICAgIHRoaXMuYW5pbWF0ZVNlbGVjdGlvbl8oLTEpO1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLmNhbnZhc19jdHhfLmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoXywgdGhpcy5oZWlnaHRfKTtcbiAgdGhpcy5mYWRlTGV2ZWwgPSAwO1xuICB0aGlzLnNlbFBvaW50c18gPSBbXTtcbiAgdGhpcy5sYXN0eF8gPSBudWxsO1xuICB0aGlzLmxhc3RSb3dfID0gLTE7XG4gIHRoaXMuaGlnaGxpZ2h0U2V0XyA9IG51bGw7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG51bWJlciBvZiB0aGUgY3VycmVudGx5IHNlbGVjdGVkIHJvdy4gVG8gZ2V0IGRhdGEgZm9yIHRoaXMgcm93LFxuICogeW91IGNhbiB1c2UgdGhlIGdldFZhbHVlIG1ldGhvZC5cbiAqIEByZXR1cm4ge251bWJlcn0gcm93IG51bWJlciwgb3IgLTEgaWYgbm90aGluZyBpcyBzZWxlY3RlZFxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5nZXRTZWxlY3Rpb24gPSBmdW5jdGlvbigpIHtcbiAgaWYgKCF0aGlzLnNlbFBvaW50c18gfHwgdGhpcy5zZWxQb2ludHNfLmxlbmd0aCA8IDEpIHtcbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICBmb3IgKHZhciBzZXRJZHggPSAwOyBzZXRJZHggPCB0aGlzLmxheW91dF8ucG9pbnRzLmxlbmd0aDsgc2V0SWR4KyspIHtcbiAgICB2YXIgcG9pbnRzID0gdGhpcy5sYXlvdXRfLnBvaW50c1tzZXRJZHhdO1xuICAgIGZvciAodmFyIHJvdyA9IDA7IHJvdyA8IHBvaW50cy5sZW5ndGg7IHJvdysrKSB7XG4gICAgICBpZiAocG9pbnRzW3Jvd10ueCA9PSB0aGlzLnNlbFBvaW50c19bMF0ueCkge1xuICAgICAgICByZXR1cm4gcG9pbnRzW3Jvd10uaWR4O1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG5hbWUgb2YgdGhlIGN1cnJlbnRseS1oaWdobGlnaHRlZCBzZXJpZXMuXG4gKiBPbmx5IGF2YWlsYWJsZSB3aGVuIHRoZSBoaWdobGlnaHRTZXJpZXNPcHRzIG9wdGlvbiBpcyBpbiB1c2UuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmdldEhpZ2hsaWdodFNlcmllcyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5oaWdobGlnaHRTZXRfO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGN1cnJlbnRseS1oaWdobGlnaHRlZCBzZXJpZXMgd2FzIGxvY2tlZFxuICogdmlhIHNldFNlbGVjdGlvbiguLi4sIHNlcmllc05hbWUsIHRydWUpLlxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5pc1Nlcmllc0xvY2tlZCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5sb2NrZWRTZXRfO1xufTtcblxuLyoqXG4gKiBGaXJlcyB3aGVuIHRoZXJlJ3MgZGF0YSBhdmFpbGFibGUgdG8gYmUgZ3JhcGhlZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBkYXRhIFJhdyBDU1YgZGF0YSB0byBiZSBwbG90dGVkXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5sb2FkZWRFdmVudF8gPSBmdW5jdGlvbihkYXRhKSB7XG4gIHRoaXMucmF3RGF0YV8gPSB0aGlzLnBhcnNlQ1NWXyhkYXRhKTtcbiAgdGhpcy5jYXNjYWRlRGF0YURpZFVwZGF0ZUV2ZW50XygpO1xuICB0aGlzLnByZWRyYXdfKCk7XG59O1xuXG4vKipcbiAqIEFkZCB0aWNrcyBvbiB0aGUgeC1heGlzIHJlcHJlc2VudGluZyB5ZWFycywgbW9udGhzLCBxdWFydGVycywgd2Vla3MsIG9yIGRheXNcbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmFkZFhUaWNrc18gPSBmdW5jdGlvbigpIHtcbiAgLy8gRGV0ZXJtaW5lIHRoZSBjb3JyZWN0IHRpY2tzIHNjYWxlIG9uIHRoZSB4LWF4aXM6IHF1YXJ0ZXJseSwgbW9udGhseSwgLi4uXG4gIHZhciByYW5nZTtcbiAgaWYgKHRoaXMuZGF0ZVdpbmRvd18pIHtcbiAgICByYW5nZSA9IFt0aGlzLmRhdGVXaW5kb3dfWzBdLCB0aGlzLmRhdGVXaW5kb3dfWzFdXTtcbiAgfSBlbHNlIHtcbiAgICByYW5nZSA9IHRoaXMueEF4aXNFeHRyZW1lcygpO1xuICB9XG5cbiAgdmFyIHhBeGlzT3B0aW9uc1ZpZXcgPSB0aGlzLm9wdGlvbnNWaWV3Rm9yQXhpc18oJ3gnKTtcbiAgdmFyIHhUaWNrcyA9IHhBeGlzT3B0aW9uc1ZpZXcoJ3RpY2tlcicpKFxuICAgICAgcmFuZ2VbMF0sXG4gICAgICByYW5nZVsxXSxcbiAgICAgIHRoaXMucGxvdHRlcl8uYXJlYS53LCAgLy8gVE9ETyhkYW52ayk6IHNob3VsZCBiZSBhcmVhLndpZHRoXG4gICAgICB4QXhpc09wdGlvbnNWaWV3LFxuICAgICAgdGhpcyk7XG4gIC8vIHZhciBtc2cgPSAndGlja2VyKCcgKyByYW5nZVswXSArICcsICcgKyByYW5nZVsxXSArICcsICcgKyB0aGlzLndpZHRoXyArICcsICcgKyB0aGlzLmF0dHJfKCdwaXhlbHNQZXJYTGFiZWwnKSArICcpIC0+ICcgKyBKU09OLnN0cmluZ2lmeSh4VGlja3MpO1xuICAvLyBjb25zb2xlLmxvZyhtc2cpO1xuICB0aGlzLmxheW91dF8uc2V0WFRpY2tzKHhUaWNrcyk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGNvcnJlY3QgaGFuZGxlciBjbGFzcyBmb3IgdGhlIGN1cnJlbnRseSBzZXQgb3B0aW9ucy5cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmdldEhhbmRsZXJDbGFzc18gPSBmdW5jdGlvbigpIHtcbiAgdmFyIGhhbmRsZXJDbGFzcztcbiAgaWYgKHRoaXMuYXR0cl8oJ2RhdGFIYW5kbGVyJykpIHtcbiAgICBoYW5kbGVyQ2xhc3MgPSAgdGhpcy5hdHRyXygnZGF0YUhhbmRsZXInKTtcbiAgfSBlbHNlIGlmICh0aGlzLmZyYWN0aW9uc18pIHtcbiAgICBpZiAodGhpcy5nZXRCb29sZWFuT3B0aW9uKCdlcnJvckJhcnMnKSkge1xuICAgICAgaGFuZGxlckNsYXNzID0gRnJhY3Rpb25zQmFyc0hhbmRsZXI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhhbmRsZXJDbGFzcyA9IERlZmF1bHRGcmFjdGlvbkhhbmRsZXI7XG4gICAgfVxuICB9IGVsc2UgaWYgKHRoaXMuZ2V0Qm9vbGVhbk9wdGlvbignY3VzdG9tQmFycycpKSB7XG4gICAgaGFuZGxlckNsYXNzID0gQ3VzdG9tQmFyc0hhbmRsZXI7XG4gIH0gZWxzZSBpZiAodGhpcy5nZXRCb29sZWFuT3B0aW9uKCdlcnJvckJhcnMnKSkge1xuICAgIGhhbmRsZXJDbGFzcyA9IEVycm9yQmFyc0hhbmRsZXI7XG4gIH0gZWxzZSB7XG4gICAgaGFuZGxlckNsYXNzID0gRGVmYXVsdEhhbmRsZXI7XG4gIH1cbiAgcmV0dXJuIGhhbmRsZXJDbGFzcztcbn07XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIG9uY2Ugd2hlbiB0aGUgY2hhcnQncyBkYXRhIGlzIGNoYW5nZWQgb3IgdGhlIG9wdGlvbnNcbiAqIGRpY3Rpb25hcnkgaXMgdXBkYXRlZC4gSXQgaXMgX25vdF8gY2FsbGVkIHdoZW4gdGhlIHVzZXIgcGFucyBvciB6b29tcy4gVGhlXG4gKiBpZGVhIGlzIHRoYXQgdmFsdWVzIGRlcml2ZWQgZnJvbSB0aGUgY2hhcnQncyBkYXRhIGNhbiBiZSBjb21wdXRlZCBoZXJlLFxuICogcmF0aGVyIHRoYW4gZXZlcnkgdGltZSB0aGUgY2hhcnQgaXMgZHJhd24uIFRoaXMgaW5jbHVkZXMgdGhpbmdzIGxpa2UgdGhlXG4gKiBudW1iZXIgb2YgYXhlcywgcm9sbGluZyBhdmVyYWdlcywgZXRjLlxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5wcmVkcmF3XyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc3RhcnQgPSBuZXcgRGF0ZSgpO1xuXG4gIC8vIENyZWF0ZSB0aGUgY29ycmVjdCBkYXRhSGFuZGxlclxuICB0aGlzLmRhdGFIYW5kbGVyXyA9IG5ldyAodGhpcy5nZXRIYW5kbGVyQ2xhc3NfKCkpKCk7XG5cbiAgdGhpcy5sYXlvdXRfLmNvbXB1dGVQbG90QXJlYSgpO1xuXG4gIC8vIFRPRE8oZGFudmspOiBtb3ZlIG1vcmUgY29tcHV0YXRpb25zIG91dCBvZiBkcmF3R3JhcGhfIGFuZCBpbnRvIGhlcmUuXG4gIHRoaXMuY29tcHV0ZVlBeGVzXygpO1xuXG4gIGlmICghdGhpcy5pc19pbml0aWFsX2RyYXdfKSB7XG4gICAgdGhpcy5jYW52YXNfY3R4Xy5yZXN0b3JlKCk7XG4gICAgdGhpcy5oaWRkZW5fY3R4Xy5yZXN0b3JlKCk7XG4gIH1cblxuICB0aGlzLmNhbnZhc19jdHhfLnNhdmUoKTtcbiAgdGhpcy5oaWRkZW5fY3R4Xy5zYXZlKCk7XG5cbiAgLy8gQ3JlYXRlIGEgbmV3IHBsb3R0ZXIuXG4gIHRoaXMucGxvdHRlcl8gPSBuZXcgRHlncmFwaENhbnZhc1JlbmRlcmVyKHRoaXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaGlkZGVuXyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWRkZW5fY3R4XyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXlvdXRfKTtcblxuICAvLyBUaGUgcm9sbGVyIHNpdHMgaW4gdGhlIGJvdHRvbSBsZWZ0IGNvcm5lciBvZiB0aGUgY2hhcnQuIFdlIGRvbid0IGtub3cgd2hlcmVcbiAgLy8gdGhpcyB3aWxsIGJlIHVudGlsIHRoZSBvcHRpb25zIGFyZSBhdmFpbGFibGUsIHNvIGl0J3MgcG9zaXRpb25lZCBoZXJlLlxuICB0aGlzLmNyZWF0ZVJvbGxJbnRlcmZhY2VfKCk7XG5cbiAgdGhpcy5jYXNjYWRlRXZlbnRzXygncHJlZHJhdycpO1xuXG4gIC8vIENvbnZlcnQgdGhlIHJhdyBkYXRhIChhIDJEIGFycmF5KSBpbnRvIHRoZSBpbnRlcm5hbCBmb3JtYXQgYW5kIGNvbXB1dGVcbiAgLy8gcm9sbGluZyBhdmVyYWdlcy5cbiAgdGhpcy5yb2xsZWRTZXJpZXNfID0gW251bGxdOyAgLy8geC1heGlzIGlzIHRoZSBmaXJzdCBzZXJpZXMgYW5kIGl0J3Mgc3BlY2lhbFxuICBmb3IgKHZhciBpID0gMTsgaSA8IHRoaXMubnVtQ29sdW1ucygpOyBpKyspIHtcbiAgICAvLyB2YXIgbG9nU2NhbGUgPSB0aGlzLmF0dHJfKCdsb2dzY2FsZScsIGkpOyAvLyBUT0RPKGtsYXVzdyk6IHRoaXMgbG9va3Mgd3JvbmcgLy8ga29uaWdzYmVyZyB0aGlua3Mgc28gdG9vLlxuICAgIHZhciBzZXJpZXMgPSB0aGlzLmRhdGFIYW5kbGVyXy5leHRyYWN0U2VyaWVzKHRoaXMucmF3RGF0YV8sIGksIHRoaXMuYXR0cmlidXRlc18pO1xuICAgIGlmICh0aGlzLnJvbGxQZXJpb2RfID4gMSkge1xuICAgICAgc2VyaWVzID0gdGhpcy5kYXRhSGFuZGxlcl8ucm9sbGluZ0F2ZXJhZ2Uoc2VyaWVzLCB0aGlzLnJvbGxQZXJpb2RfLCB0aGlzLmF0dHJpYnV0ZXNfLCBpKTtcbiAgICB9XG5cbiAgICB0aGlzLnJvbGxlZFNlcmllc18ucHVzaChzZXJpZXMpO1xuICB9XG5cbiAgLy8gSWYgdGhlIGRhdGEgb3Igb3B0aW9ucyBoYXZlIGNoYW5nZWQsIHRoZW4gd2UnZCBiZXR0ZXIgcmVkcmF3LlxuICB0aGlzLmRyYXdHcmFwaF8oKTtcblxuICAvLyBUaGlzIGlzIHVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdG8gZG8gdmFyaW91cyBhbmltYXRpb25zLlxuICB2YXIgZW5kID0gbmV3IERhdGUoKTtcbiAgdGhpcy5kcmF3aW5nVGltZU1zXyA9IChlbmQgLSBzdGFydCk7XG59O1xuXG4vKipcbiAqIFBvaW50IHN0cnVjdHVyZS5cbiAqXG4gKiB4dmFsXyogYW5kIHl2YWxfKiBhcmUgdGhlIG9yaWdpbmFsIHVuc2NhbGVkIGRhdGEgdmFsdWVzLFxuICogd2hpbGUgeF8qIGFuZCB5XyogYXJlIHNjYWxlZCB0byB0aGUgcmFuZ2UgKDAuMC0xLjApIGZvciBwbG90dGluZy5cbiAqIHl2YWxfc3RhY2tlZCBpcyB0aGUgY3VtdWxhdGl2ZSBZIHZhbHVlIHVzZWQgZm9yIHN0YWNraW5nIGdyYXBocyxcbiAqIGFuZCBib3R0b20vdG9wL21pbnVzL3BsdXMgYXJlIHVzZWQgZm9yIGhpZ2gvbG93IGJhbmQgZ3JhcGhzLlxuICpcbiAqIEB0eXBlZGVmIHt7XG4gKiAgICAgaWR4OiBudW1iZXIsXG4gKiAgICAgbmFtZTogc3RyaW5nLFxuICogICAgIHg6ID9udW1iZXIsXG4gKiAgICAgeHZhbDogP251bWJlcixcbiAqICAgICB5X2JvdHRvbTogP251bWJlcixcbiAqICAgICB5OiA/bnVtYmVyLFxuICogICAgIHlfc3RhY2tlZDogP251bWJlcixcbiAqICAgICB5X3RvcDogP251bWJlcixcbiAqICAgICB5dmFsX21pbnVzOiA/bnVtYmVyLFxuICogICAgIHl2YWw6ID9udW1iZXIsXG4gKiAgICAgeXZhbF9wbHVzOiA/bnVtYmVyLFxuICogICAgIHl2YWxfc3RhY2tlZFxuICogfX1cbiAqL1xuRHlncmFwaC5Qb2ludFR5cGUgPSB1bmRlZmluZWQ7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyBwb2ludCBzdGFja2luZyBmb3Igc3RhY2tlZEdyYXBoPXRydWUuXG4gKlxuICogRm9yIHN0YWNraW5nIHB1cnBvc2VzLCBpbnRlcnBvbGF0ZSBvciBleHRlbmQgbmVpZ2hib3JpbmcgZGF0YSBhY3Jvc3NcbiAqIE5hTiB2YWx1ZXMgYmFzZWQgb24gc3RhY2tlZEdyYXBoTmFORmlsbCBzZXR0aW5ncy4gVGhpcyBpcyBmb3IgZGlzcGxheVxuICogb25seSwgdGhlIHVuZGVybHlpbmcgZGF0YSB2YWx1ZSBhcyBzaG93biBpbiB0aGUgbGVnZW5kIHJlbWFpbnMgTmFOLlxuICpcbiAqIEBwYXJhbSB7QXJyYXkuPER5Z3JhcGguUG9pbnRUeXBlPn0gcG9pbnRzIFBvaW50IGFycmF5IGZvciBhIHNpbmdsZSBzZXJpZXMuXG4gKiAgICAgVXBkYXRlcyBlYWNoIFBvaW50J3MgeXZhbF9zdGFja2VkIHByb3BlcnR5LlxuICogQHBhcmFtIHtBcnJheS48bnVtYmVyPn0gY3VtdWxhdGl2ZVl2YWwgQWNjdW11bGF0ZWQgdG9wLW9mLWdyYXBoIHN0YWNrZWQgWVxuICogICAgIHZhbHVlcyBmb3IgdGhlIHNlcmllcyBzZWVuIHNvIGZhci4gSW5kZXggaXMgdGhlIHJvdyBudW1iZXIuIFVwZGF0ZWRcbiAqICAgICBiYXNlZCBvbiB0aGUgY3VycmVudCBzZXJpZXMncyB2YWx1ZXMuXG4gKiBAcGFyYW0ge0FycmF5LjxudW1iZXI+fSBzZXJpZXNFeHRyZW1lcyBNaW4gYW5kIG1heCB2YWx1ZXMsIHVwZGF0ZWRcbiAqICAgICB0byByZWZsZWN0IHRoZSBzdGFja2VkIHZhbHVlcy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxsTWV0aG9kIEludGVycG9sYXRpb24gbWV0aG9kLCBvbmUgb2YgJ2FsbCcsICdpbnNpZGUnLCBvclxuICogICAgICdub25lJy5cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGguc3RhY2tQb2ludHNfID0gZnVuY3Rpb24oXG4gICAgcG9pbnRzLCBjdW11bGF0aXZlWXZhbCwgc2VyaWVzRXh0cmVtZXMsIGZpbGxNZXRob2QpIHtcbiAgdmFyIGxhc3RYdmFsID0gbnVsbDtcbiAgdmFyIHByZXZQb2ludCA9IG51bGw7XG4gIHZhciBuZXh0UG9pbnQgPSBudWxsO1xuICB2YXIgbmV4dFBvaW50SWR4ID0gLTE7XG5cbiAgLy8gRmluZCB0aGUgbmV4dCBzdGFja2FibGUgcG9pbnQgc3RhcnRpbmcgZnJvbSB0aGUgZ2l2ZW4gaW5kZXguXG4gIHZhciB1cGRhdGVOZXh0UG9pbnQgPSBmdW5jdGlvbihpZHgpIHtcbiAgICAvLyBJZiB3ZSd2ZSBwcmV2aW91c2x5IGZvdW5kIGEgbm9uLU5hTiBwb2ludCBhbmQgaGF2ZW4ndCBnb25lIHBhc3QgaXQgeWV0LFxuICAgIC8vIGp1c3QgdXNlIHRoYXQuXG4gICAgaWYgKG5leHRQb2ludElkeCA+PSBpZHgpIHJldHVybjtcblxuICAgIC8vIFdlIGhhdmVuJ3QgZm91bmQgYSBub24tTmFOIHBvaW50IHlldCBvciBoYXZlIG1vdmVkIHBhc3QgaXQsXG4gICAgLy8gbG9vayB0b3dhcmRzIHRoZSByaWdodCB0byBmaW5kIGEgbm9uLU5hTiBwb2ludC5cbiAgICBmb3IgKHZhciBqID0gaWR4OyBqIDwgcG9pbnRzLmxlbmd0aDsgKytqKSB7XG4gICAgICAvLyBDbGVhciBvdXQgYSBwcmV2aW91c2x5LWZvdW5kIHBvaW50IChpZiBhbnkpIHNpbmNlIGl0J3Mgbm8gbG9uZ2VyXG4gICAgICAvLyB2YWxpZCwgd2Ugc2hvdWxkbid0IHVzZSBpdCBmb3IgaW50ZXJwb2xhdGlvbiBhbnltb3JlLlxuICAgICAgbmV4dFBvaW50ID0gbnVsbDtcbiAgICAgIGlmICghaXNOYU4ocG9pbnRzW2pdLnl2YWwpICYmIHBvaW50c1tqXS55dmFsICE9PSBudWxsKSB7XG4gICAgICAgIG5leHRQb2ludElkeCA9IGo7XG4gICAgICAgIG5leHRQb2ludCA9IHBvaW50c1tqXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcG9pbnRzLmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIHBvaW50ID0gcG9pbnRzW2ldO1xuICAgIHZhciB4dmFsID0gcG9pbnQueHZhbDtcbiAgICBpZiAoY3VtdWxhdGl2ZVl2YWxbeHZhbF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgY3VtdWxhdGl2ZVl2YWxbeHZhbF0gPSAwO1xuICAgIH1cblxuICAgIHZhciBhY3R1YWxZdmFsID0gcG9pbnQueXZhbDtcbiAgICBpZiAoaXNOYU4oYWN0dWFsWXZhbCkgfHwgYWN0dWFsWXZhbCA9PT0gbnVsbCkge1xuICAgICAgaWYoZmlsbE1ldGhvZCA9PSAnbm9uZScpIHtcbiAgICAgICAgYWN0dWFsWXZhbCA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJbnRlcnBvbGF0ZS9leHRlbmQgZm9yIHN0YWNraW5nIHB1cnBvc2VzIGlmIHBvc3NpYmxlLlxuICAgICAgICB1cGRhdGVOZXh0UG9pbnQoaSk7XG4gICAgICAgIGlmIChwcmV2UG9pbnQgJiYgbmV4dFBvaW50ICYmIGZpbGxNZXRob2QgIT0gJ25vbmUnKSB7XG4gICAgICAgICAgLy8gVXNlIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gcHJldlBvaW50IGFuZCBuZXh0UG9pbnQuXG4gICAgICAgICAgYWN0dWFsWXZhbCA9IHByZXZQb2ludC55dmFsICsgKG5leHRQb2ludC55dmFsIC0gcHJldlBvaW50Lnl2YWwpICpcbiAgICAgICAgICAgICAgKCh4dmFsIC0gcHJldlBvaW50Lnh2YWwpIC8gKG5leHRQb2ludC54dmFsIC0gcHJldlBvaW50Lnh2YWwpKTtcbiAgICAgICAgfSBlbHNlIGlmIChwcmV2UG9pbnQgJiYgZmlsbE1ldGhvZCA9PSAnYWxsJykge1xuICAgICAgICAgIGFjdHVhbFl2YWwgPSBwcmV2UG9pbnQueXZhbDtcbiAgICAgICAgfSBlbHNlIGlmIChuZXh0UG9pbnQgJiYgZmlsbE1ldGhvZCA9PSAnYWxsJykge1xuICAgICAgICAgIGFjdHVhbFl2YWwgPSBuZXh0UG9pbnQueXZhbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhY3R1YWxZdmFsID0gMDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBwcmV2UG9pbnQgPSBwb2ludDtcbiAgICB9XG5cbiAgICB2YXIgc3RhY2tlZFl2YWwgPSBjdW11bGF0aXZlWXZhbFt4dmFsXTtcbiAgICBpZiAobGFzdFh2YWwgIT0geHZhbCkge1xuICAgICAgLy8gSWYgYW4geC12YWx1ZSBpcyByZXBlYXRlZCwgd2UgaWdub3JlIHRoZSBkdXBsaWNhdGVzLlxuICAgICAgc3RhY2tlZFl2YWwgKz0gYWN0dWFsWXZhbDtcbiAgICAgIGN1bXVsYXRpdmVZdmFsW3h2YWxdID0gc3RhY2tlZFl2YWw7XG4gICAgfVxuICAgIGxhc3RYdmFsID0geHZhbDtcblxuICAgIHBvaW50Lnl2YWxfc3RhY2tlZCA9IHN0YWNrZWRZdmFsO1xuXG4gICAgaWYgKHN0YWNrZWRZdmFsID4gc2VyaWVzRXh0cmVtZXNbMV0pIHtcbiAgICAgIHNlcmllc0V4dHJlbWVzWzFdID0gc3RhY2tlZFl2YWw7XG4gICAgfVxuICAgIGlmIChzdGFja2VkWXZhbCA8IHNlcmllc0V4dHJlbWVzWzBdKSB7XG4gICAgICBzZXJpZXNFeHRyZW1lc1swXSA9IHN0YWNrZWRZdmFsO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBMb29wIG92ZXIgYWxsIGZpZWxkcyBhbmQgY3JlYXRlIGRhdGFzZXRzLCBjYWxjdWxhdGluZyBleHRyZW1lIHktdmFsdWVzIGZvclxuICogZWFjaCBzZXJpZXMgYW5kIGV4dHJlbWUgeC1pbmRpY2VzIGFzIHdlIGdvLlxuICpcbiAqIGRhdGVXaW5kb3cgaXMgcGFzc2VkIGluIGFzIGFuIGV4cGxpY2l0IHBhcmFtZXRlciBzbyB0aGF0IHdlIGNhbiBjb21wdXRlXG4gKiBleHRyZW1lIHZhbHVlcyBcInNwZWN1bGF0aXZlbHlcIiwgaS5lLiB3aXRob3V0IGFjdHVhbGx5IHNldHRpbmcgc3RhdGUgb24gdGhlXG4gKiBkeWdyYXBoLlxuICpcbiAqIEBwYXJhbSB7QXJyYXkuPEFycmF5LjxBcnJheS48KG51bWJlcnxBcnJheTxudW1iZXI+KT4+fSByb2xsZWRTZXJpZXMsIHdoZXJlXG4gKiAgICAgcm9sbGVkU2VyaWVzW3Nlcmllc0luZGV4XVtyb3ddID0gcmF3IHBvaW50LCB3aGVyZVxuICogICAgIHNlcmllc0luZGV4IGlzIHRoZSBjb2x1bW4gbnVtYmVyIHN0YXJ0aW5nIHdpdGggMSwgYW5kXG4gKiAgICAgcmF3UG9pbnQgaXMgW3gseV0gb3IgW3gsIFt5LCBlcnJdXSBvciBbeCwgW3ksIHltaW51cywgeXBsdXNdXS5cbiAqIEBwYXJhbSB7P0FycmF5LjxudW1iZXI+fSBkYXRlV2luZG93IFt4bWluLCB4bWF4XSBwYWlyLCBvciBudWxsLlxuICogQHJldHVybiB7e1xuICogICAgIHBvaW50czogQXJyYXkuPEFycmF5LjxEeWdyYXBoLlBvaW50VHlwZT4+LFxuICogICAgIHNlcmllc0V4dHJlbWVzOiBBcnJheS48QXJyYXkuPG51bWJlcj4+LFxuICogICAgIGJvdW5kYXJ5SWRzOiBBcnJheS48bnVtYmVyPn19XG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5nYXRoZXJEYXRhc2V0c18gPSBmdW5jdGlvbihyb2xsZWRTZXJpZXMsIGRhdGVXaW5kb3cpIHtcbiAgdmFyIGJvdW5kYXJ5SWRzID0gW107XG4gIHZhciBwb2ludHMgPSBbXTtcbiAgdmFyIGN1bXVsYXRpdmVZdmFsID0gW107ICAvLyBGb3Igc3RhY2tlZCBzZXJpZXMuXG4gIHZhciBleHRyZW1lcyA9IHt9OyAgLy8gc2VyaWVzIG5hbWUgLT4gW2xvdywgaGlnaF1cbiAgdmFyIHNlcmllc0lkeCwgc2FtcGxlSWR4O1xuICB2YXIgZmlyc3RJZHgsIGxhc3RJZHg7XG4gIHZhciBheGlzSWR4O1xuXG4gIC8vIExvb3Agb3ZlciB0aGUgZmllbGRzIChzZXJpZXMpLiAgR28gZnJvbSB0aGUgbGFzdCB0byB0aGUgZmlyc3QsXG4gIC8vIGJlY2F1c2UgaWYgdGhleSdyZSBzdGFja2VkIHRoYXQncyBob3cgd2UgYWNjdW11bGF0ZSB0aGUgdmFsdWVzLlxuICB2YXIgbnVtX3NlcmllcyA9IHJvbGxlZFNlcmllcy5sZW5ndGggLSAxO1xuICB2YXIgc2VyaWVzO1xuICBmb3IgKHNlcmllc0lkeCA9IG51bV9zZXJpZXM7IHNlcmllc0lkeCA+PSAxOyBzZXJpZXNJZHgtLSkge1xuICAgIGlmICghdGhpcy52aXNpYmlsaXR5KClbc2VyaWVzSWR4IC0gMV0pIGNvbnRpbnVlO1xuXG4gICAgLy8gUHJ1bmUgZG93biB0byB0aGUgZGVzaXJlZCByYW5nZSwgaWYgbmVjZXNzYXJ5IChmb3Igem9vbWluZylcbiAgICAvLyBCZWNhdXNlIHRoZXJlIGNhbiBiZSBsaW5lcyBnb2luZyB0byBwb2ludHMgb3V0c2lkZSBvZiB0aGUgdmlzaWJsZSBhcmVhLFxuICAgIC8vIHdlIGFjdHVhbGx5IHBydW5lIHRvIHZpc2libGUgcG9pbnRzLCBwbHVzIG9uZSBvbiBlaXRoZXIgc2lkZS5cbiAgICBpZiAoZGF0ZVdpbmRvdykge1xuICAgICAgc2VyaWVzID0gcm9sbGVkU2VyaWVzW3Nlcmllc0lkeF07XG4gICAgICB2YXIgbG93ID0gZGF0ZVdpbmRvd1swXTtcbiAgICAgIHZhciBoaWdoID0gZGF0ZVdpbmRvd1sxXTtcblxuICAgICAgLy8gVE9ETyhkYW52ayk6IGRvIGJpbmFyeSBzZWFyY2ggaW5zdGVhZCBvZiBsaW5lYXIgc2VhcmNoLlxuICAgICAgLy8gVE9ETyhkYW52ayk6IHBhc3MgZmlyc3RJZHggYW5kIGxhc3RJZHggZGlyZWN0bHkgdG8gdGhlIHJlbmRlcmVyLlxuICAgICAgZmlyc3RJZHggPSBudWxsO1xuICAgICAgbGFzdElkeCA9IG51bGw7XG4gICAgICBmb3IgKHNhbXBsZUlkeCA9IDA7IHNhbXBsZUlkeCA8IHNlcmllcy5sZW5ndGg7IHNhbXBsZUlkeCsrKSB7XG4gICAgICAgIGlmIChzZXJpZXNbc2FtcGxlSWR4XVswXSA+PSBsb3cgJiYgZmlyc3RJZHggPT09IG51bGwpIHtcbiAgICAgICAgICBmaXJzdElkeCA9IHNhbXBsZUlkeDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2VyaWVzW3NhbXBsZUlkeF1bMF0gPD0gaGlnaCkge1xuICAgICAgICAgIGxhc3RJZHggPSBzYW1wbGVJZHg7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpcnN0SWR4ID09PSBudWxsKSBmaXJzdElkeCA9IDA7XG4gICAgICB2YXIgY29ycmVjdGVkRmlyc3RJZHggPSBmaXJzdElkeDtcbiAgICAgIHZhciBpc0ludmFsaWRWYWx1ZSA9IHRydWU7XG4gICAgICB3aGlsZSAoaXNJbnZhbGlkVmFsdWUgJiYgY29ycmVjdGVkRmlyc3RJZHggPiAwKSB7XG4gICAgICAgIGNvcnJlY3RlZEZpcnN0SWR4LS07XG4gICAgICAgIC8vIGNoZWNrIGlmIHRoZSB5IHZhbHVlIGlzIG51bGwuXG4gICAgICAgIGlzSW52YWxpZFZhbHVlID0gc2VyaWVzW2NvcnJlY3RlZEZpcnN0SWR4XVsxXSA9PT0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKGxhc3RJZHggPT09IG51bGwpIGxhc3RJZHggPSBzZXJpZXMubGVuZ3RoIC0gMTtcbiAgICAgIHZhciBjb3JyZWN0ZWRMYXN0SWR4ID0gbGFzdElkeDtcbiAgICAgIGlzSW52YWxpZFZhbHVlID0gdHJ1ZTtcbiAgICAgIHdoaWxlIChpc0ludmFsaWRWYWx1ZSAmJiBjb3JyZWN0ZWRMYXN0SWR4IDwgc2VyaWVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgY29ycmVjdGVkTGFzdElkeCsrO1xuICAgICAgICBpc0ludmFsaWRWYWx1ZSA9IHNlcmllc1tjb3JyZWN0ZWRMYXN0SWR4XVsxXSA9PT0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKGNvcnJlY3RlZEZpcnN0SWR4IT09Zmlyc3RJZHgpIHtcbiAgICAgICAgZmlyc3RJZHggPSBjb3JyZWN0ZWRGaXJzdElkeDtcbiAgICAgIH1cbiAgICAgIGlmIChjb3JyZWN0ZWRMYXN0SWR4ICE9PSBsYXN0SWR4KSB7XG4gICAgICAgIGxhc3RJZHggPSBjb3JyZWN0ZWRMYXN0SWR4O1xuICAgICAgfVxuXG4gICAgICBib3VuZGFyeUlkc1tzZXJpZXNJZHgtMV0gPSBbZmlyc3RJZHgsIGxhc3RJZHhdO1xuXG4gICAgICAvLyAuc2xpY2UncyBlbmQgaXMgZXhjbHVzaXZlLCB3ZSB3YW50IHRvIGluY2x1ZGUgbGFzdElkeC5cbiAgICAgIHNlcmllcyA9IHNlcmllcy5zbGljZShmaXJzdElkeCwgbGFzdElkeCArIDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXJpZXMgPSByb2xsZWRTZXJpZXNbc2VyaWVzSWR4XTtcbiAgICAgIGJvdW5kYXJ5SWRzW3Nlcmllc0lkeC0xXSA9IFswLCBzZXJpZXMubGVuZ3RoLTFdO1xuICAgIH1cblxuICAgIHZhciBzZXJpZXNOYW1lID0gdGhpcy5hdHRyXyhcImxhYmVsc1wiKVtzZXJpZXNJZHhdO1xuICAgIHZhciBzZXJpZXNFeHRyZW1lcyA9IHRoaXMuZGF0YUhhbmRsZXJfLmdldEV4dHJlbWVZVmFsdWVzKHNlcmllcyxcbiAgICAgICAgZGF0ZVdpbmRvdywgdGhpcy5nZXRCb29sZWFuT3B0aW9uKFwic3RlcFBsb3RcIiwgc2VyaWVzTmFtZSkpO1xuXG4gICAgdmFyIHNlcmllc1BvaW50cyA9IHRoaXMuZGF0YUhhbmRsZXJfLnNlcmllc1RvUG9pbnRzKHNlcmllcyxcbiAgICAgICAgc2VyaWVzTmFtZSwgYm91bmRhcnlJZHNbc2VyaWVzSWR4LTFdWzBdKTtcblxuICAgIGlmICh0aGlzLmdldEJvb2xlYW5PcHRpb24oXCJzdGFja2VkR3JhcGhcIikpIHtcbiAgICAgIGF4aXNJZHggPSB0aGlzLmF0dHJpYnV0ZXNfLmF4aXNGb3JTZXJpZXMoc2VyaWVzTmFtZSk7XG4gICAgICBpZiAoY3VtdWxhdGl2ZVl2YWxbYXhpc0lkeF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjdW11bGF0aXZlWXZhbFtheGlzSWR4XSA9IFtdO1xuICAgICAgfVxuICAgICAgRHlncmFwaC5zdGFja1BvaW50c18oc2VyaWVzUG9pbnRzLCBjdW11bGF0aXZlWXZhbFtheGlzSWR4XSwgc2VyaWVzRXh0cmVtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdldEJvb2xlYW5PcHRpb24oXCJzdGFja2VkR3JhcGhOYU5GaWxsXCIpKTtcbiAgICB9XG5cbiAgICBleHRyZW1lc1tzZXJpZXNOYW1lXSA9IHNlcmllc0V4dHJlbWVzO1xuICAgIHBvaW50c1tzZXJpZXNJZHhdID0gc2VyaWVzUG9pbnRzO1xuICB9XG5cbiAgcmV0dXJuIHsgcG9pbnRzOiBwb2ludHMsIGV4dHJlbWVzOiBleHRyZW1lcywgYm91bmRhcnlJZHM6IGJvdW5kYXJ5SWRzIH07XG59O1xuXG4vKipcbiAqIFVwZGF0ZSB0aGUgZ3JhcGggd2l0aCBuZXcgZGF0YS4gVGhpcyBtZXRob2QgaXMgY2FsbGVkIHdoZW4gdGhlIHZpZXdpbmcgYXJlYVxuICogaGFzIGNoYW5nZWQuIElmIHRoZSB1bmRlcmx5aW5nIGRhdGEgb3Igb3B0aW9ucyBoYXZlIGNoYW5nZWQsIHByZWRyYXdfIHdpbGxcbiAqIGJlIGNhbGxlZCBiZWZvcmUgZHJhd0dyYXBoXyBpcyBjYWxsZWQuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuZHJhd0dyYXBoXyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc3RhcnQgPSBuZXcgRGF0ZSgpO1xuXG4gIC8vIFRoaXMgaXMgdXNlZCB0byBzZXQgdGhlIHNlY29uZCBwYXJhbWV0ZXIgdG8gZHJhd0NhbGxiYWNrLCBiZWxvdy5cbiAgdmFyIGlzX2luaXRpYWxfZHJhdyA9IHRoaXMuaXNfaW5pdGlhbF9kcmF3XztcbiAgdGhpcy5pc19pbml0aWFsX2RyYXdfID0gZmFsc2U7XG5cbiAgdGhpcy5sYXlvdXRfLnJlbW92ZUFsbERhdGFzZXRzKCk7XG4gIHRoaXMuc2V0Q29sb3JzXygpO1xuICB0aGlzLmF0dHJzXy5wb2ludFNpemUgPSAwLjUgKiB0aGlzLmdldE51bWVyaWNPcHRpb24oJ2hpZ2hsaWdodENpcmNsZVNpemUnKTtcblxuICB2YXIgcGFja2VkID0gdGhpcy5nYXRoZXJEYXRhc2V0c18odGhpcy5yb2xsZWRTZXJpZXNfLCB0aGlzLmRhdGVXaW5kb3dfKTtcbiAgdmFyIHBvaW50cyA9IHBhY2tlZC5wb2ludHM7XG4gIHZhciBleHRyZW1lcyA9IHBhY2tlZC5leHRyZW1lcztcbiAgdGhpcy5ib3VuZGFyeUlkc18gPSBwYWNrZWQuYm91bmRhcnlJZHM7XG5cbiAgdGhpcy5zZXRJbmRleEJ5TmFtZV8gPSB7fTtcbiAgdmFyIGxhYmVscyA9IHRoaXMuYXR0cl8oXCJsYWJlbHNcIik7XG4gIHZhciBkYXRhSWR4ID0gMDtcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBwb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoIXRoaXMudmlzaWJpbGl0eSgpW2kgLSAxXSkgY29udGludWU7XG4gICAgdGhpcy5sYXlvdXRfLmFkZERhdGFzZXQobGFiZWxzW2ldLCBwb2ludHNbaV0pO1xuICAgIHRoaXMuZGF0YXNldEluZGV4X1tpXSA9IGRhdGFJZHgrKztcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxhYmVscy5sZW5ndGg7IGkrKykge1xuICAgIHRoaXMuc2V0SW5kZXhCeU5hbWVfW2xhYmVsc1tpXV0gPSBpO1xuICB9XG5cbiAgdGhpcy5jb21wdXRlWUF4aXNSYW5nZXNfKGV4dHJlbWVzKTtcbiAgdGhpcy5sYXlvdXRfLnNldFlBeGVzKHRoaXMuYXhlc18pO1xuXG4gIHRoaXMuYWRkWFRpY2tzXygpO1xuXG4gIC8vIFRlbGwgUGxvdEtpdCB0byB1c2UgdGhpcyBuZXcgZGF0YSBhbmQgcmVuZGVyIGl0c2VsZlxuICB0aGlzLmxheW91dF8uZXZhbHVhdGUoKTtcbiAgdGhpcy5yZW5kZXJHcmFwaF8oaXNfaW5pdGlhbF9kcmF3KTtcblxuICBpZiAodGhpcy5nZXRTdHJpbmdPcHRpb24oXCJ0aW1pbmdOYW1lXCIpKSB7XG4gICAgdmFyIGVuZCA9IG5ldyBEYXRlKCk7XG4gICAgY29uc29sZS5sb2codGhpcy5nZXRTdHJpbmdPcHRpb24oXCJ0aW1pbmdOYW1lXCIpICsgXCIgLSBkcmF3R3JhcGg6IFwiICsgKGVuZCAtIHN0YXJ0KSArIFwibXNcIik7XG4gIH1cbn07XG5cbi8qKlxuICogVGhpcyBkb2VzIHRoZSB3b3JrIG9mIGRyYXdpbmcgdGhlIGNoYXJ0LiBJdCBhc3N1bWVzIHRoYXQgdGhlIGxheW91dCBhbmQgYXhpc1xuICogc2NhbGVzIGhhdmUgYWxyZWFkeSBiZWVuIHNldCAoZS5nLiBieSBwcmVkcmF3XykuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUucmVuZGVyR3JhcGhfID0gZnVuY3Rpb24oaXNfaW5pdGlhbF9kcmF3KSB7XG4gIHRoaXMuY2FzY2FkZUV2ZW50c18oJ2NsZWFyQ2hhcnQnKTtcbiAgdGhpcy5wbG90dGVyXy5jbGVhcigpO1xuXG4gIGNvbnN0IHVuZGVybGF5Q2FsbGJhY2sgPSB0aGlzLmdldEZ1bmN0aW9uT3B0aW9uKCd1bmRlcmxheUNhbGxiYWNrJyk7XG4gIGlmICh1bmRlcmxheUNhbGxiYWNrKSB7XG4gICAgLy8gTk9URTogd2UgcGFzcyB0aGUgZHlncmFwaCBvYmplY3QgdG8gdGhpcyBjYWxsYmFjayB0d2ljZSB0byBhdm9pZCBicmVha2luZ1xuICAgIC8vIHVzZXJzIHdobyBleHBlY3QgYSBkZXByZWNhdGVkIGZvcm0gb2YgdGhpcyBjYWxsYmFjay5cbiAgICB1bmRlcmxheUNhbGxiYWNrLmNhbGwodGhpcyxcbiAgICAgICAgdGhpcy5oaWRkZW5fY3R4XywgdGhpcy5sYXlvdXRfLmdldFBsb3RBcmVhKCksIHRoaXMsIHRoaXMpO1xuICB9XG5cbiAgdmFyIGUgPSB7XG4gICAgY2FudmFzOiB0aGlzLmhpZGRlbl8sXG4gICAgZHJhd2luZ0NvbnRleHQ6IHRoaXMuaGlkZGVuX2N0eF9cbiAgfTtcbiAgdGhpcy5jYXNjYWRlRXZlbnRzXygnd2lsbERyYXdDaGFydCcsIGUpO1xuICB0aGlzLnBsb3R0ZXJfLnJlbmRlcigpO1xuICB0aGlzLmNhc2NhZGVFdmVudHNfKCdkaWREcmF3Q2hhcnQnLCBlKTtcbiAgdGhpcy5sYXN0Um93XyA9IC0xOyAgLy8gYmVjYXVzZSBwbHVnaW5zL2xlZ2VuZC5qcyBjbGVhcnMgdGhlIGxlZ2VuZFxuXG4gIC8vIFRPRE8oZGFudmspOiBpcyB0aGlzIGEgcGVyZm9ybWFuY2UgYm90dGxlbmVjayB3aGVuIHBhbm5pbmc/XG4gIC8vIFRoZSBpbnRlcmFjdGlvbiBjYW52YXMgc2hvdWxkIGFscmVhZHkgYmUgZW1wdHkgaW4gdGhhdCBzaXR1YXRpb24uXG4gIHRoaXMuY2FudmFzXy5nZXRDb250ZXh0KCcyZCcpLmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoXywgdGhpcy5oZWlnaHRfKTtcblxuICBjb25zdCBkcmF3Q2FsbGJhY2sgPSB0aGlzLmdldEZ1bmN0aW9uT3B0aW9uKFwiZHJhd0NhbGxiYWNrXCIpO1xuICBpZiAoZHJhd0NhbGxiYWNrICE9PSBudWxsKSB7XG4gICAgZHJhd0NhbGxiYWNrLmNhbGwodGhpcywgdGhpcywgaXNfaW5pdGlhbF9kcmF3KTtcbiAgfVxuICBpZiAoaXNfaW5pdGlhbF9kcmF3KSB7XG4gICAgdGhpcy5yZWFkeUZpcmVkXyA9IHRydWU7XG4gICAgd2hpbGUgKHRoaXMucmVhZHlGbnNfLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBmbiA9IHRoaXMucmVhZHlGbnNfLnBvcCgpO1xuICAgICAgZm4odGhpcyk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKiBEZXRlcm1pbmUgcHJvcGVydGllcyBvZiB0aGUgeS1heGVzIHdoaWNoIGFyZSBpbmRlcGVuZGVudCBvZiB0aGUgZGF0YVxuICogY3VycmVudGx5IGJlaW5nIGRpc3BsYXllZC4gVGhpcyBpbmNsdWRlcyB0aGluZ3MgbGlrZSB0aGUgbnVtYmVyIG9mIGF4ZXMgYW5kXG4gKiB0aGUgc3R5bGUgb2YgdGhlIGF4ZXMuIEl0IGRvZXMgbm90IGluY2x1ZGUgdGhlIHJhbmdlIG9mIGVhY2ggYXhpcyBhbmQgaXRzXG4gKiB0aWNrIG1hcmtzLlxuICogVGhpcyBmaWxscyBpbiB0aGlzLmF4ZXNfLlxuICogYXhlc18gPSBbIHsgb3B0aW9ucyB9IF1cbiAqICAgaW5kaWNlcyBhcmUgaW50byB0aGUgYXhlc18gYXJyYXkuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmNvbXB1dGVZQXhlc18gPSBmdW5jdGlvbigpIHtcbiAgdmFyIGF4aXMsIGluZGV4LCBvcHRzLCB2O1xuXG4gIC8vIHRoaXMuYXhlc18gZG9lc24ndCBtYXRjaCB0aGlzLmF0dHJpYnV0ZXNfLmF4ZXNfLm9wdGlvbnMuIEl0J3MgdXNlZCBmb3JcbiAgLy8gZGF0YSBjb21wdXRhdGlvbiBhcyB3ZWxsIGFzIG9wdGlvbnMgc3RvcmFnZS5cbiAgLy8gR28gdGhyb3VnaCBvbmNlIGFuZCBhZGQgYWxsIHRoZSBheGVzLlxuICB0aGlzLmF4ZXNfID0gW107XG5cbiAgZm9yIChheGlzID0gMDsgYXhpcyA8IHRoaXMuYXR0cmlidXRlc18ubnVtQXhlcygpOyBheGlzKyspIHtcbiAgICAvLyBBZGQgYSBuZXcgYXhpcywgbWFraW5nIGEgY29weSBvZiBpdHMgcGVyLWF4aXMgb3B0aW9ucy5cbiAgICBvcHRzID0geyBnIDogdGhpcyB9O1xuICAgIHV0aWxzLnVwZGF0ZShvcHRzLCB0aGlzLmF0dHJpYnV0ZXNfLmF4aXNPcHRpb25zKGF4aXMpKTtcbiAgICB0aGlzLmF4ZXNfW2F4aXNdID0gb3B0cztcbiAgfVxuXG4gIGZvciAoYXhpcyA9IDA7IGF4aXMgPCB0aGlzLmF4ZXNfLmxlbmd0aDsgYXhpcysrKSB7XG4gICAgaWYgKGF4aXMgPT09IDApIHtcbiAgICAgIG9wdHMgPSB0aGlzLm9wdGlvbnNWaWV3Rm9yQXhpc18oJ3knICsgKGF4aXMgPyAnMicgOiAnJykpO1xuICAgICAgdiA9IG9wdHMoXCJ2YWx1ZVJhbmdlXCIpO1xuICAgICAgaWYgKHYpIHRoaXMuYXhlc19bYXhpc10udmFsdWVSYW5nZSA9IHY7XG4gICAgfSBlbHNlIHsgIC8vIFRvIGtlZXAgb2xkIGJlaGF2aW9yXG4gICAgICB2YXIgYXhlcyA9IHRoaXMudXNlcl9hdHRyc18uYXhlcztcbiAgICAgIGlmIChheGVzICYmIGF4ZXMueTIpIHtcbiAgICAgICAgdiA9IGF4ZXMueTIudmFsdWVSYW5nZTtcbiAgICAgICAgaWYgKHYpIHRoaXMuYXhlc19bYXhpc10udmFsdWVSYW5nZSA9IHY7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG51bWJlciBvZiB5LWF4ZXMgb24gdGhlIGNoYXJ0LlxuICogQHJldHVybiB7bnVtYmVyfSB0aGUgbnVtYmVyIG9mIGF4ZXMuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLm51bUF4ZXMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuYXR0cmlidXRlc18ubnVtQXhlcygpO1xufTtcblxuLyoqXG4gKiBAcHJpdmF0ZVxuICogUmV0dXJucyBheGlzIHByb3BlcnRpZXMgZm9yIHRoZSBnaXZlbiBzZXJpZXMuXG4gKiBAcGFyYW0ge3N0cmluZ30gc2V0TmFtZSBUaGUgbmFtZSBvZiB0aGUgc2VyaWVzIGZvciB3aGljaCB0byBnZXQgYXhpc1xuICogcHJvcGVydGllcywgZS5nLiAnWTEnLlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgYXhpcyBwcm9wZXJ0aWVzLlxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5heGlzUHJvcGVydGllc0ZvclNlcmllcyA9IGZ1bmN0aW9uKHNlcmllcykge1xuICAvLyBUT0RPKGRhbnZrKTogaGFuZGxlIGVycm9ycy5cbiAgcmV0dXJuIHRoaXMuYXhlc19bdGhpcy5hdHRyaWJ1dGVzXy5heGlzRm9yU2VyaWVzKHNlcmllcyldO1xufTtcblxuLyoqXG4gKiBAcHJpdmF0ZVxuICogRGV0ZXJtaW5lIHRoZSB2YWx1ZSByYW5nZSBhbmQgdGljayBtYXJrcyBmb3IgZWFjaCBheGlzLlxuICogQHBhcmFtIHtPYmplY3R9IGV4dHJlbWVzIEEgbWFwcGluZyBmcm9tIHNlcmllc05hbWUgLT4gW2xvdywgaGlnaF1cbiAqIFRoaXMgZmlsbHMgaW4gdGhlIHZhbHVlUmFuZ2UgYW5kIHRpY2tzIGZpZWxkcyBpbiBlYWNoIGVudHJ5IG9mIHRoaXMuYXhlc18uXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmNvbXB1dGVZQXhpc1Jhbmdlc18gPSBmdW5jdGlvbihleHRyZW1lcykge1xuICB2YXIgaXNOdWxsVW5kZWZpbmVkT3JOYU4gPSBmdW5jdGlvbihudW0pIHtcbiAgICByZXR1cm4gaXNOYU4ocGFyc2VGbG9hdChudW0pKTtcbiAgfTtcbiAgdmFyIG51bUF4ZXMgPSB0aGlzLmF0dHJpYnV0ZXNfLm51bUF4ZXMoKTtcbiAgdmFyIHlwYWRDb21wYXQsIHNwYW4sIHNlcmllcywgeXBhZDtcblxuICB2YXIgcF9heGlzO1xuXG4gIC8vIENvbXB1dGUgZXh0cmVtZSB2YWx1ZXMsIGEgc3BhbiBhbmQgdGljayBtYXJrcyBmb3IgZWFjaCBheGlzLlxuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bUF4ZXM7IGkrKykge1xuICAgIHZhciBheGlzID0gdGhpcy5heGVzX1tpXTtcbiAgICB2YXIgbG9nc2NhbGUgPSB0aGlzLmF0dHJpYnV0ZXNfLmdldEZvckF4aXMoXCJsb2dzY2FsZVwiLCBpKTtcbiAgICB2YXIgaW5jbHVkZVplcm8gPSB0aGlzLmF0dHJpYnV0ZXNfLmdldEZvckF4aXMoXCJpbmNsdWRlWmVyb1wiLCBpKTtcbiAgICB2YXIgaW5kZXBlbmRlbnRUaWNrcyA9IHRoaXMuYXR0cmlidXRlc18uZ2V0Rm9yQXhpcyhcImluZGVwZW5kZW50VGlja3NcIiwgaSk7XG4gICAgc2VyaWVzID0gdGhpcy5hdHRyaWJ1dGVzXy5zZXJpZXNGb3JBeGlzKGkpO1xuXG4gICAgLy8gQWRkIHNvbWUgcGFkZGluZy4gVGhpcyBzdXBwb3J0cyB0d28gWSBwYWRkaW5nIG9wZXJhdGlvbiBtb2RlczpcbiAgICAvL1xuICAgIC8vIC0gYmFja3dhcmRzIGNvbXBhdGlibGUgKHlSYW5nZVBhZCBub3Qgc2V0KTpcbiAgICAvLyAgIDEwJSBwYWRkaW5nIGZvciBhdXRvbWF0aWMgWSByYW5nZXMsIGJ1dCBub3QgZm9yIHVzZXItc3VwcGxpZWRcbiAgICAvLyAgIHJhbmdlcywgYW5kIG1vdmUgYSBjbG9zZS10by16ZXJvIGVkZ2UgdG8gemVybywgc2luY2UgZHJhd2luZyBhdCB0aGUgZWRnZVxuICAgIC8vICAgcmVzdWx0cyBpbiBpbnZpc2libGUgbGluZXMuIFVuZm9ydHVuYXRlbHkgbGluZXMgZHJhd24gYXQgdGhlIGVkZ2Ugb2YgYVxuICAgIC8vICAgdXNlci1zdXBwbGllZCByYW5nZSB3aWxsIHN0aWxsIGJlIGludmlzaWJsZS4gSWYgbG9nc2NhbGUgaXNcbiAgICAvLyAgIHNldCwgYWRkIGEgdmFyaWFibGUgYW1vdW50IG9mIHBhZGRpbmcgYXQgdGhlIHRvcCBidXRcbiAgICAvLyAgIG5vbmUgYXQgdGhlIGJvdHRvbS5cbiAgICAvL1xuICAgIC8vIC0gbmV3LXN0eWxlICh5UmFuZ2VQYWQgc2V0IGJ5IHRoZSB1c2VyKTpcbiAgICAvLyAgIGFsd2F5cyBhZGQgdGhlIHNwZWNpZmllZCBZIHBhZGRpbmcuXG4gICAgLy9cbiAgICB5cGFkQ29tcGF0ID0gdHJ1ZTtcbiAgICB5cGFkID0gMC4xOyAvLyBhZGQgMTAlXG4gICAgY29uc3QgeVJhbmdlUGFkID0gdGhpcy5nZXROdW1lcmljT3B0aW9uKCd5UmFuZ2VQYWQnKTtcbiAgICBpZiAoeVJhbmdlUGFkICE9PSBudWxsKSB7XG4gICAgICB5cGFkQ29tcGF0ID0gZmFsc2U7XG4gICAgICAvLyBDb252ZXJ0IHBpeGVsIHBhZGRpbmcgdG8gcmF0aW9cbiAgICAgIHlwYWQgPSB5UmFuZ2VQYWQgLyB0aGlzLnBsb3R0ZXJfLmFyZWEuaDtcbiAgICB9XG5cbiAgICBpZiAoc2VyaWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgLy8gSWYgbm8gc2VyaWVzIGFyZSBkZWZpbmVkIG9yIHZpc2libGUgdGhlbiB1c2UgYSByZWFzb25hYmxlIGRlZmF1bHRcbiAgICAgIGF4aXMuZXh0cmVtZVJhbmdlID0gWzAsIDFdO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBDYWxjdWxhdGUgdGhlIGV4dHJlbWVzIG9mIGV4dHJlbWVzLlxuICAgICAgdmFyIG1pblkgPSBJbmZpbml0eTsgIC8vIGV4dHJlbWVzW3Nlcmllc1swXV1bMF07XG4gICAgICB2YXIgbWF4WSA9IC1JbmZpbml0eTsgIC8vIGV4dHJlbWVzW3Nlcmllc1swXV1bMV07XG4gICAgICB2YXIgZXh0cmVtZU1pblksIGV4dHJlbWVNYXhZO1xuXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHNlcmllcy5sZW5ndGg7IGorKykge1xuICAgICAgICAvLyB0aGlzIHNraXBzIGludmlzaWJsZSBzZXJpZXNcbiAgICAgICAgaWYgKCFleHRyZW1lcy5oYXNPd25Qcm9wZXJ0eShzZXJpZXNbal0pKSBjb250aW51ZTtcblxuICAgICAgICAvLyBPbmx5IHVzZSB2YWxpZCBleHRyZW1lcyB0byBzdG9wIG51bGwgZGF0YSBzZXJpZXMnIGZyb20gY29ycnVwdGluZyB0aGUgc2NhbGUuXG4gICAgICAgIGV4dHJlbWVNaW5ZID0gZXh0cmVtZXNbc2VyaWVzW2pdXVswXTtcbiAgICAgICAgaWYgKGV4dHJlbWVNaW5ZICE9PSBudWxsKSB7XG4gICAgICAgICAgbWluWSA9IE1hdGgubWluKGV4dHJlbWVNaW5ZLCBtaW5ZKTtcbiAgICAgICAgfVxuICAgICAgICBleHRyZW1lTWF4WSA9IGV4dHJlbWVzW3Nlcmllc1tqXV1bMV07XG4gICAgICAgIGlmIChleHRyZW1lTWF4WSAhPT0gbnVsbCkge1xuICAgICAgICAgIG1heFkgPSBNYXRoLm1heChleHRyZW1lTWF4WSwgbWF4WSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSW5jbHVkZSB6ZXJvIGlmIHJlcXVlc3RlZCBieSB0aGUgdXNlci5cbiAgICAgIGlmIChpbmNsdWRlWmVybyAmJiAhbG9nc2NhbGUpIHtcbiAgICAgICAgaWYgKG1pblkgPiAwKSBtaW5ZID0gMDtcbiAgICAgICAgaWYgKG1heFkgPCAwKSBtYXhZID0gMDtcbiAgICAgIH1cblxuICAgICAgLy8gRW5zdXJlIHdlIGhhdmUgYSB2YWxpZCBzY2FsZSwgb3RoZXJ3aXNlIGRlZmF1bHQgdG8gWzAsIDFdIGZvciBzYWZldHkuXG4gICAgICBpZiAobWluWSA9PSBJbmZpbml0eSkgbWluWSA9IDA7XG4gICAgICBpZiAobWF4WSA9PSAtSW5maW5pdHkpIG1heFkgPSAxO1xuXG4gICAgICBzcGFuID0gbWF4WSAtIG1pblk7XG4gICAgICAvLyBzcGVjaWFsIGNhc2U6IGlmIHdlIGhhdmUgbm8gc2Vuc2Ugb2Ygc2NhbGUsIGNlbnRlciBvbiB0aGUgc29sZSB2YWx1ZS5cbiAgICAgIGlmIChzcGFuID09PSAwKSB7XG4gICAgICAgIGlmIChtYXhZICE9PSAwKSB7XG4gICAgICAgICAgc3BhbiA9IE1hdGguYWJzKG1heFkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIC4uLiBhbmQgaWYgdGhlIHNvbGUgdmFsdWUgaXMgemVybywgdXNlIHJhbmdlIDAtMS5cbiAgICAgICAgICBtYXhZID0gMTtcbiAgICAgICAgICBzcGFuID0gMTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgbWF4QXhpc1kgPSBtYXhZLCBtaW5BeGlzWSA9IG1pblk7XG4gICAgICBpZiAoeXBhZENvbXBhdCkge1xuICAgICAgICBpZiAobG9nc2NhbGUpIHtcbiAgICAgICAgICBtYXhBeGlzWSA9IG1heFkgKyB5cGFkICogc3BhbjtcbiAgICAgICAgICBtaW5BeGlzWSA9IG1pblk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWF4QXhpc1kgPSBtYXhZICsgeXBhZCAqIHNwYW47XG4gICAgICAgICAgbWluQXhpc1kgPSBtaW5ZIC0geXBhZCAqIHNwYW47XG5cbiAgICAgICAgICAvLyBCYWNrd2FyZHMtY29tcGF0aWJsZSBiZWhhdmlvcjogTW92ZSB0aGUgc3BhbiB0byBzdGFydCBvciBlbmQgYXQgemVybyBpZiBpdCdzXG4gICAgICAgICAgLy8gY2xvc2UgdG8gemVyby5cbiAgICAgICAgICBpZiAobWluQXhpc1kgPCAwICYmIG1pblkgPj0gMCkgbWluQXhpc1kgPSAwO1xuICAgICAgICAgIGlmIChtYXhBeGlzWSA+IDAgJiYgbWF4WSA8PSAwKSBtYXhBeGlzWSA9IDA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGF4aXMuZXh0cmVtZVJhbmdlID0gW21pbkF4aXNZLCBtYXhBeGlzWV07XG4gICAgfVxuICAgIGlmIChheGlzLnZhbHVlUmFuZ2UpIHtcbiAgICAgIC8vIFRoaXMgaXMgYSB1c2VyLXNldCB2YWx1ZSByYW5nZSBmb3IgdGhpcyBheGlzLlxuICAgICAgdmFyIHkwID0gaXNOdWxsVW5kZWZpbmVkT3JOYU4oYXhpcy52YWx1ZVJhbmdlWzBdKSA/IGF4aXMuZXh0cmVtZVJhbmdlWzBdIDogYXhpcy52YWx1ZVJhbmdlWzBdO1xuICAgICAgdmFyIHkxID0gaXNOdWxsVW5kZWZpbmVkT3JOYU4oYXhpcy52YWx1ZVJhbmdlWzFdKSA/IGF4aXMuZXh0cmVtZVJhbmdlWzFdIDogYXhpcy52YWx1ZVJhbmdlWzFdO1xuICAgICAgYXhpcy5jb21wdXRlZFZhbHVlUmFuZ2UgPSBbeTAsIHkxXTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXhpcy5jb21wdXRlZFZhbHVlUmFuZ2UgPSBheGlzLmV4dHJlbWVSYW5nZTtcbiAgICB9XG4gICAgaWYgKCF5cGFkQ29tcGF0KSB7XG4gICAgICAvLyBXaGVuIHVzaW5nIHlSYW5nZVBhZCwgYWRqdXN0IHRoZSB1cHBlci9sb3dlciBib3VuZHMgdG8gYWRkXG4gICAgICAvLyBwYWRkaW5nIHVubGVzcyB0aGUgdXNlciBoYXMgem9vbWVkL3Bhbm5lZCB0aGUgWSBheGlzIHJhbmdlLlxuXG4gICAgICB5MCA9IGF4aXMuY29tcHV0ZWRWYWx1ZVJhbmdlWzBdO1xuICAgICAgeTEgPSBheGlzLmNvbXB1dGVkVmFsdWVSYW5nZVsxXTtcblxuICAgICAgLy8gc3BlY2lhbCBjYXNlICM3ODE6IGlmIHdlIGhhdmUgbm8gc2Vuc2Ugb2Ygc2NhbGUsIGNlbnRlciBvbiB0aGUgc29sZSB2YWx1ZS5cbiAgICAgIGlmICh5MCA9PT0geTEpIHtcbiAgICAgICAgaWYoeTAgPT09IDApIHtcbiAgICAgICAgICB5MSA9IDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIGRlbHRhID0gTWF0aC5hYnMoeTAgLyAxMCk7XG4gICAgICAgICAgeTAgLT0gZGVsdGE7XG4gICAgICAgICAgeTEgKz0gZGVsdGE7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGxvZ3NjYWxlKSB7XG4gICAgICAgIHZhciB5MHBjdCA9IHlwYWQgLyAoMiAqIHlwYWQgLSAxKTtcbiAgICAgICAgdmFyIHkxcGN0ID0gKHlwYWQgLSAxKSAvICgyICogeXBhZCAtIDEpO1xuICAgICAgICBheGlzLmNvbXB1dGVkVmFsdWVSYW5nZVswXSA9IHV0aWxzLmxvZ1JhbmdlRnJhY3Rpb24oeTAsIHkxLCB5MHBjdCk7XG4gICAgICAgIGF4aXMuY29tcHV0ZWRWYWx1ZVJhbmdlWzFdID0gdXRpbHMubG9nUmFuZ2VGcmFjdGlvbih5MCwgeTEsIHkxcGN0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNwYW4gPSB5MSAtIHkwO1xuICAgICAgICBheGlzLmNvbXB1dGVkVmFsdWVSYW5nZVswXSA9IHkwIC0gc3BhbiAqIHlwYWQ7XG4gICAgICAgIGF4aXMuY29tcHV0ZWRWYWx1ZVJhbmdlWzFdID0geTEgKyBzcGFuICogeXBhZDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaW5kZXBlbmRlbnRUaWNrcykge1xuICAgICAgYXhpcy5pbmRlcGVuZGVudFRpY2tzID0gaW5kZXBlbmRlbnRUaWNrcztcbiAgICAgIHZhciBvcHRzID0gdGhpcy5vcHRpb25zVmlld0ZvckF4aXNfKCd5JyArIChpID8gJzInIDogJycpKTtcbiAgICAgIHZhciB0aWNrZXIgPSBvcHRzKCd0aWNrZXInKTtcbiAgICAgIGF4aXMudGlja3MgPSB0aWNrZXIoYXhpcy5jb21wdXRlZFZhbHVlUmFuZ2VbMF0sXG4gICAgICAgICAgICAgIGF4aXMuY29tcHV0ZWRWYWx1ZVJhbmdlWzFdLFxuICAgICAgICAgICAgICB0aGlzLnBsb3R0ZXJfLmFyZWEuaCxcbiAgICAgICAgICAgICAgb3B0cyxcbiAgICAgICAgICAgICAgdGhpcyk7XG4gICAgICAvLyBEZWZpbmUgdGhlIGZpcnN0IGluZGVwZW5kZW50IGF4aXMgYXMgcHJpbWFyeSBheGlzLlxuICAgICAgaWYgKCFwX2F4aXMpIHBfYXhpcyA9IGF4aXM7XG4gICAgfVxuICB9XG4gIGlmIChwX2F4aXMgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IChcIkNvbmZpZ3VyYXRpb24gRXJyb3I6IEF0IGxlYXN0IG9uZSBheGlzIGhhcyB0byBoYXZlIHRoZSBcXFwiaW5kZXBlbmRlbnRUaWNrc1xcXCIgb3B0aW9uIGFjdGl2YXRlZC5cIik7XG4gIH1cbiAgLy8gQWRkIHRpY2tzLiBCeSBkZWZhdWx0LCBhbGwgYXhlcyBpbmhlcml0IHRoZSB0aWNrIHBvc2l0aW9ucyBvZiB0aGVcbiAgLy8gcHJpbWFyeSBheGlzLiBIb3dldmVyLCBpZiBhbiBheGlzIGlzIHNwZWNpZmljYWxseSBtYXJrZWQgYXMgaGF2aW5nXG4gIC8vIGluZGVwZW5kZW50IHRpY2tzLCB0aGVuIHRoYXQgaXMgcGVybWlzc2libGUgYXMgd2VsbC5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW1BeGVzOyBpKyspIHtcbiAgICB2YXIgYXhpcyA9IHRoaXMuYXhlc19baV07XG5cbiAgICBpZiAoIWF4aXMuaW5kZXBlbmRlbnRUaWNrcykge1xuICAgICAgdmFyIG9wdHMgPSB0aGlzLm9wdGlvbnNWaWV3Rm9yQXhpc18oJ3knICsgKGkgPyAnMicgOiAnJykpO1xuICAgICAgdmFyIHRpY2tlciA9IG9wdHMoJ3RpY2tlcicpO1xuICAgICAgdmFyIHBfdGlja3MgPSBwX2F4aXMudGlja3M7XG4gICAgICB2YXIgcF9zY2FsZSA9IHBfYXhpcy5jb21wdXRlZFZhbHVlUmFuZ2VbMV0gLSBwX2F4aXMuY29tcHV0ZWRWYWx1ZVJhbmdlWzBdO1xuICAgICAgdmFyIHNjYWxlID0gYXhpcy5jb21wdXRlZFZhbHVlUmFuZ2VbMV0gLSBheGlzLmNvbXB1dGVkVmFsdWVSYW5nZVswXTtcbiAgICAgIHZhciB0aWNrX3ZhbHVlcyA9IFtdO1xuICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBwX3RpY2tzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIHZhciB5X2ZyYWMgPSAocF90aWNrc1trXS52IC0gcF9heGlzLmNvbXB1dGVkVmFsdWVSYW5nZVswXSkgLyBwX3NjYWxlO1xuICAgICAgICB2YXIgeV92YWwgPSBheGlzLmNvbXB1dGVkVmFsdWVSYW5nZVswXSArIHlfZnJhYyAqIHNjYWxlO1xuICAgICAgICB0aWNrX3ZhbHVlcy5wdXNoKHlfdmFsKTtcbiAgICAgIH1cblxuICAgICAgYXhpcy50aWNrcyA9IHRpY2tlcihheGlzLmNvbXB1dGVkVmFsdWVSYW5nZVswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXhpcy5jb21wdXRlZFZhbHVlUmFuZ2VbMV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxvdHRlcl8uYXJlYS5oLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aWNrX3ZhbHVlcyk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIERldGVjdHMgdGhlIHR5cGUgb2YgdGhlIHN0ciAoZGF0ZSBvciBudW1lcmljKSBhbmQgc2V0cyB0aGUgdmFyaW91c1xuICogZm9ybWF0dGluZyBhdHRyaWJ1dGVzIGluIHRoaXMuYXR0cnNfIGJhc2VkIG9uIHRoaXMgdHlwZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHIgQW4geCB2YWx1ZS5cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmRldGVjdFR5cGVGcm9tU3RyaW5nXyA9IGZ1bmN0aW9uKHN0cikge1xuICB2YXIgaXNEYXRlID0gZmFsc2U7XG4gIHZhciBkYXNoUG9zID0gc3RyLmluZGV4T2YoJy0nKTsgIC8vIGNvdWxkIGJlIDIwMDYtMDEtMDEgX29yXyAxLjBlLTJcbiAgaWYgKChkYXNoUG9zID4gMCAmJiAoc3RyW2Rhc2hQb3MtMV0gIT0gJ2UnICYmIHN0cltkYXNoUG9zLTFdICE9ICdFJykpIHx8XG4gICAgICBzdHIuaW5kZXhPZignLycpID49IDAgfHxcbiAgICAgIGlzTmFOKHBhcnNlRmxvYXQoc3RyKSkpIHtcbiAgICBpc0RhdGUgPSB0cnVlO1xuICB9XG5cbiAgdGhpcy5zZXRYQXhpc09wdGlvbnNfKGlzRGF0ZSk7XG59O1xuXG5EeWdyYXBoLnByb3RvdHlwZS5zZXRYQXhpc09wdGlvbnNfID0gZnVuY3Rpb24oaXNEYXRlKSB7XG4gIGlmIChpc0RhdGUpIHtcbiAgICB0aGlzLmF0dHJzXy54VmFsdWVQYXJzZXIgPSB1dGlscy5kYXRlUGFyc2VyO1xuICAgIHRoaXMuYXR0cnNfLmF4ZXMueC52YWx1ZUZvcm1hdHRlciA9IHV0aWxzLmRhdGVWYWx1ZUZvcm1hdHRlcjtcbiAgICB0aGlzLmF0dHJzXy5heGVzLngudGlja2VyID0gRHlncmFwaFRpY2tlcnMuZGF0ZVRpY2tlcjtcbiAgICB0aGlzLmF0dHJzXy5heGVzLnguYXhpc0xhYmVsRm9ybWF0dGVyID0gdXRpbHMuZGF0ZUF4aXNMYWJlbEZvcm1hdHRlcjtcbiAgfSBlbHNlIHtcbiAgICAvKiogQHByaXZhdGUgKHNodXQgdXAsIGpzZG9jISkgKi9cbiAgICB0aGlzLmF0dHJzXy54VmFsdWVQYXJzZXIgPSBmdW5jdGlvbih4KSB7IHJldHVybiBwYXJzZUZsb2F0KHgpOyB9O1xuICAgIC8vIFRPRE8oZGFudmspOiB1c2UgRHlncmFwaC5udW1iZXJWYWx1ZUZvcm1hdHRlciBoZXJlP1xuICAgIC8qKiBAcHJpdmF0ZSAoc2h1dCB1cCwganNkb2MhKSAqL1xuICAgIHRoaXMuYXR0cnNfLmF4ZXMueC52YWx1ZUZvcm1hdHRlciA9IGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHg7IH07XG4gICAgdGhpcy5hdHRyc18uYXhlcy54LnRpY2tlciA9IER5Z3JhcGhUaWNrZXJzLm51bWVyaWNUaWNrcztcbiAgICB0aGlzLmF0dHJzXy5heGVzLnguYXhpc0xhYmVsRm9ybWF0dGVyID0gdGhpcy5hdHRyc18uYXhlcy54LnZhbHVlRm9ybWF0dGVyO1xuICB9XG59O1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKiBQYXJzZXMgYSBzdHJpbmcgaW4gYSBzcGVjaWFsIGNzdiBmb3JtYXQuICBXZSBleHBlY3QgYSBjc3YgZmlsZSB3aGVyZSBlYWNoXG4gKiBsaW5lIGlzIGEgZGF0ZSBwb2ludCwgYW5kIHRoZSBmaXJzdCBmaWVsZCBpbiBlYWNoIGxpbmUgaXMgdGhlIGRhdGUgc3RyaW5nLlxuICogV2UgYWxzbyBleHBlY3QgdGhhdCBhbGwgcmVtYWluaW5nIGZpZWxkcyByZXByZXNlbnQgc2VyaWVzLlxuICogaWYgdGhlIGVycm9yQmFycyBhdHRyaWJ1dGUgaXMgc2V0LCB0aGVuIGludGVycHJldCB0aGUgZmllbGRzIGFzOlxuICogZGF0ZSwgc2VyaWVzMSwgc3RkZGV2MSwgc2VyaWVzMiwgc3RkZGV2MiwgLi4uXG4gKiBAcGFyYW0ge1tPYmplY3RdfSBkYXRhIFNlZSBhYm92ZS5cbiAqXG4gKiBAcmV0dXJuIFtPYmplY3RdIEFuIGFycmF5IHdpdGggb25lIGVudHJ5IGZvciBlYWNoIHJvdy4gVGhlc2UgZW50cmllc1xuICogYXJlIGFuIGFycmF5IG9mIGNlbGxzIGluIHRoYXQgcm93LiBUaGUgZmlyc3QgZW50cnkgaXMgdGhlIHBhcnNlZCB4LXZhbHVlIGZvclxuICogdGhlIHJvdy4gVGhlIHNlY29uZCwgdGhpcmQsIGV0Yy4gYXJlIHRoZSB5LXZhbHVlcy4gVGhlc2UgY2FuIHRha2Ugb24gb25lIG9mXG4gKiB0aHJlZSBmb3JtcywgZGVwZW5kaW5nIG9uIHRoZSBDU1YgYW5kIGNvbnN0cnVjdG9yIHBhcmFtZXRlcnM6XG4gKiAxLiBudW1lcmljIHZhbHVlXG4gKiAyLiBbIHZhbHVlLCBzdGRkZXYgXVxuICogMy4gWyBsb3cgdmFsdWUsIGNlbnRlciB2YWx1ZSwgaGlnaCB2YWx1ZSBdXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnBhcnNlQ1NWXyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgdmFyIHJldCA9IFtdO1xuICB2YXIgbGluZV9kZWxpbWl0ZXIgPSB1dGlscy5kZXRlY3RMaW5lRGVsaW1pdGVyKGRhdGEpO1xuICB2YXIgbGluZXMgPSBkYXRhLnNwbGl0KGxpbmVfZGVsaW1pdGVyIHx8IFwiXFxuXCIpO1xuICB2YXIgdmFscywgajtcblxuICAvLyBVc2UgdGhlIGRlZmF1bHQgZGVsaW1pdGVyIG9yIGZhbGwgYmFjayB0byBhIHRhYiBpZiB0aGF0IG1ha2VzIHNlbnNlLlxuICB2YXIgZGVsaW0gPSB0aGlzLmdldFN0cmluZ09wdGlvbignZGVsaW1pdGVyJyk7XG4gIGlmIChsaW5lc1swXS5pbmRleE9mKGRlbGltKSA9PSAtMSAmJiBsaW5lc1swXS5pbmRleE9mKCdcXHQnKSA+PSAwKSB7XG4gICAgZGVsaW0gPSAnXFx0JztcbiAgfVxuXG4gIHZhciBzdGFydCA9IDA7XG4gIGlmICghKCdsYWJlbHMnIGluIHRoaXMudXNlcl9hdHRyc18pKSB7XG4gICAgLy8gVXNlciBoYXNuJ3QgZXhwbGljaXRseSBzZXQgbGFiZWxzLCBzbyB0aGV5J3JlIChwcmVzdW1hYmx5KSBpbiB0aGUgQ1NWLlxuICAgIHN0YXJ0ID0gMTtcbiAgICB0aGlzLmF0dHJzXy5sYWJlbHMgPSBsaW5lc1swXS5zcGxpdChkZWxpbSk7ICAvLyBOT1RFOiBfbm90XyB1c2VyX2F0dHJzXy5cbiAgICB0aGlzLmF0dHJpYnV0ZXNfLnJlcGFyc2VTZXJpZXMoKTtcbiAgfVxuICB2YXIgbGluZV9ubyA9IDA7XG5cbiAgdmFyIHhQYXJzZXI7XG4gIHZhciBkZWZhdWx0UGFyc2VyU2V0ID0gZmFsc2U7ICAvLyBhdHRlbXB0IHRvIGF1dG8tZGV0ZWN0IHggdmFsdWUgdHlwZVxuICB2YXIgZXhwZWN0ZWRDb2xzID0gdGhpcy5hdHRyXyhcImxhYmVsc1wiKS5sZW5ndGg7XG4gIHZhciBvdXRPZk9yZGVyID0gZmFsc2U7XG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGxpbmUgPSBsaW5lc1tpXTtcbiAgICBsaW5lX25vID0gaTtcbiAgICBpZiAobGluZS5sZW5ndGggPT09IDApIGNvbnRpbnVlOyAgLy8gc2tpcCBibGFuayBsaW5lc1xuICAgIGlmIChsaW5lWzBdID09ICcjJykgY29udGludWU7ICAgIC8vIHNraXAgY29tbWVudCBsaW5lc1xuICAgIHZhciBpbkZpZWxkcyA9IGxpbmUuc3BsaXQoZGVsaW0pO1xuICAgIGlmIChpbkZpZWxkcy5sZW5ndGggPCAyKSBjb250aW51ZTtcblxuICAgIHZhciBmaWVsZHMgPSBbXTtcbiAgICBpZiAoIWRlZmF1bHRQYXJzZXJTZXQpIHtcbiAgICAgIHRoaXMuZGV0ZWN0VHlwZUZyb21TdHJpbmdfKGluRmllbGRzWzBdKTtcbiAgICAgIHhQYXJzZXIgPSB0aGlzLmdldEZ1bmN0aW9uT3B0aW9uKFwieFZhbHVlUGFyc2VyXCIpO1xuICAgICAgZGVmYXVsdFBhcnNlclNldCA9IHRydWU7XG4gICAgfVxuICAgIGZpZWxkc1swXSA9IHhQYXJzZXIoaW5GaWVsZHNbMF0sIHRoaXMpO1xuXG4gICAgLy8gSWYgZnJhY3Rpb25zIGFyZSBleHBlY3RlZCwgcGFyc2UgdGhlIG51bWJlcnMgYXMgXCJBL0JcIlxuICAgIGlmICh0aGlzLmZyYWN0aW9uc18pIHtcbiAgICAgIGZvciAoaiA9IDE7IGogPCBpbkZpZWxkcy5sZW5ndGg7IGorKykge1xuICAgICAgICAvLyBUT0RPKGRhbnZrKTogZmlndXJlIG91dCBhbiBhcHByb3ByaWF0ZSB3YXkgdG8gZmxhZyBwYXJzZSBlcnJvcnMuXG4gICAgICAgIHZhbHMgPSBpbkZpZWxkc1tqXS5zcGxpdChcIi9cIik7XG4gICAgICAgIGlmICh2YWxzLmxlbmd0aCAhPSAyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXhwZWN0ZWQgZnJhY3Rpb25hbCBcIm51bS9kZW5cIiB2YWx1ZXMgaW4gQ1NWIGRhdGEgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICBcImJ1dCBmb3VuZCBhIHZhbHVlICdcIiArIGluRmllbGRzW2pdICsgXCInIG9uIGxpbmUgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgKDEgKyBpKSArIFwiICgnXCIgKyBsaW5lICsgXCInKSB3aGljaCBpcyBub3Qgb2YgdGhpcyBmb3JtLlwiKTtcbiAgICAgICAgICBmaWVsZHNbal0gPSBbMCwgMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZmllbGRzW2pdID0gW3V0aWxzLnBhcnNlRmxvYXRfKHZhbHNbMF0sIGksIGxpbmUpLFxuICAgICAgICAgICAgICAgICAgICAgICB1dGlscy5wYXJzZUZsb2F0Xyh2YWxzWzFdLCBpLCBsaW5lKV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0Qm9vbGVhbk9wdGlvbihcImVycm9yQmFyc1wiKSkge1xuICAgICAgLy8gSWYgdGhlcmUgYXJlIHNpZ21hLWJhc2VkIGhpZ2gvbG93IGJhbmRzLCB2YWx1ZXMgYXJlICh2YWx1ZSwgc3RkZGV2KSBwYWlyc1xuICAgICAgaWYgKGluRmllbGRzLmxlbmd0aCAlIDIgIT0gMSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFeHBlY3RlZCBhbHRlcm5hdGluZyAodmFsdWUsIHN0ZGV2LikgcGFpcnMgaW4gQ1NWIGRhdGEgJyArXG4gICAgICAgICAgICAgICAgICAgICAgJ2J1dCBsaW5lICcgKyAoMSArIGkpICsgJyBoYXMgYW4gb2RkIG51bWJlciBvZiB2YWx1ZXMgKCcgK1xuICAgICAgICAgICAgICAgICAgICAgIChpbkZpZWxkcy5sZW5ndGggLSAxKSArIFwiKTogJ1wiICsgbGluZSArIFwiJ1wiKTtcbiAgICAgIH1cbiAgICAgIGZvciAoaiA9IDE7IGogPCBpbkZpZWxkcy5sZW5ndGg7IGogKz0gMikge1xuICAgICAgICBmaWVsZHNbKGogKyAxKSAvIDJdID0gW3V0aWxzLnBhcnNlRmxvYXRfKGluRmllbGRzW2pdLCBpLCBsaW5lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dGlscy5wYXJzZUZsb2F0XyhpbkZpZWxkc1tqICsgMV0sIGksIGxpbmUpXTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0Qm9vbGVhbk9wdGlvbihcImN1c3RvbUJhcnNcIikpIHtcbiAgICAgIC8vIEN1c3RvbSBoaWdoL2xvdyBiYW5kcyBhcmUgYSBsb3c7Y2VudHJlO2hpZ2ggdHVwbGVcbiAgICAgIGZvciAoaiA9IDE7IGogPCBpbkZpZWxkcy5sZW5ndGg7IGorKykge1xuICAgICAgICB2YXIgdmFsID0gaW5GaWVsZHNbal07XG4gICAgICAgIGlmICgvXiAqJC8udGVzdCh2YWwpKSB7XG4gICAgICAgICAgZmllbGRzW2pdID0gW251bGwsIG51bGwsIG51bGxdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHMgPSB2YWwuc3BsaXQoXCI7XCIpO1xuICAgICAgICAgIGlmICh2YWxzLmxlbmd0aCA9PSAzKSB7XG4gICAgICAgICAgICBmaWVsZHNbal0gPSBbIHV0aWxzLnBhcnNlRmxvYXRfKHZhbHNbMF0sIGksIGxpbmUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB1dGlscy5wYXJzZUZsb2F0Xyh2YWxzWzFdLCBpLCBsaW5lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdXRpbHMucGFyc2VGbG9hdF8odmFsc1syXSwgaSwgbGluZSkgXTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdXaGVuIHVzaW5nIGN1c3RvbUJhcnMsIHZhbHVlcyBtdXN0IGJlIGVpdGhlciBibGFuayAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAnb3IgXCJsb3c7Y2VudGVyO2hpZ2hcIiB0dXBsZXMgKGdvdCBcIicgKyB2YWwgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICdcIiBvbiBsaW5lICcgKyAoMStpKSArICcpJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFZhbHVlcyBhcmUganVzdCBudW1iZXJzXG4gICAgICBmb3IgKGogPSAxOyBqIDwgaW5GaWVsZHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgZmllbGRzW2pdID0gdXRpbHMucGFyc2VGbG9hdF8oaW5GaWVsZHNbal0sIGksIGxpbmUpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAocmV0Lmxlbmd0aCA+IDAgJiYgZmllbGRzWzBdIDwgcmV0W3JldC5sZW5ndGggLSAxXVswXSkge1xuICAgICAgb3V0T2ZPcmRlciA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKGZpZWxkcy5sZW5ndGggIT0gZXhwZWN0ZWRDb2xzKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiTnVtYmVyIG9mIGNvbHVtbnMgaW4gbGluZSBcIiArIGkgKyBcIiAoXCIgKyBmaWVsZHMubGVuZ3RoICtcbiAgICAgICAgICAgICAgICAgICAgXCIpIGRvZXMgbm90IGFncmVlIHdpdGggbnVtYmVyIG9mIGxhYmVscyAoXCIgKyBleHBlY3RlZENvbHMgK1xuICAgICAgICAgICAgICAgICAgICBcIikgXCIgKyBsaW5lKTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgdXNlciBzcGVjaWZpZWQgdGhlICdsYWJlbHMnIG9wdGlvbiBhbmQgbm9uZSBvZiB0aGUgY2VsbHMgb2YgdGhlXG4gICAgLy8gZmlyc3Qgcm93IHBhcnNlZCBjb3JyZWN0bHksIHRoZW4gdGhleSBwcm9iYWJseSBkb3VibGUtc3BlY2lmaWVkIHRoZVxuICAgIC8vIGxhYmVscy4gV2UgZ28gd2l0aCB0aGUgdmFsdWVzIHNldCBpbiB0aGUgb3B0aW9uLCBkaXNjYXJkIHRoaXMgcm93IGFuZFxuICAgIC8vIGxvZyBhIHdhcm5pbmcgdG8gdGhlIEpTIGNvbnNvbGUuXG4gICAgaWYgKGkgPT09IDAgJiYgdGhpcy5hdHRyXygnbGFiZWxzJykpIHtcbiAgICAgIHZhciBhbGxfbnVsbCA9IHRydWU7XG4gICAgICBmb3IgKGogPSAwOyBhbGxfbnVsbCAmJiBqIDwgZmllbGRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGlmIChmaWVsZHNbal0pIGFsbF9udWxsID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoYWxsX251bGwpIHtcbiAgICAgICAgY29uc29sZS53YXJuKFwiVGhlIGR5Z3JhcGhzICdsYWJlbHMnIG9wdGlvbiBpcyBzZXQsIGJ1dCB0aGUgZmlyc3Qgcm93IFwiICtcbiAgICAgICAgICAgICAgICAgICAgIFwib2YgQ1NWIGRhdGEgKCdcIiArIGxpbmUgKyBcIicpIGFwcGVhcnMgdG8gYWxzbyBjb250YWluIFwiICtcbiAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxzLiBXaWxsIGRyb3AgdGhlIENTViBsYWJlbHMgYW5kIHVzZSB0aGUgb3B0aW9uIFwiICtcbiAgICAgICAgICAgICAgICAgICAgIFwibGFiZWxzLlwiKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldC5wdXNoKGZpZWxkcyk7XG4gIH1cblxuICBpZiAob3V0T2ZPcmRlcikge1xuICAgIGNvbnNvbGUud2FybihcIkNTViBpcyBvdXQgb2Ygb3JkZXI7IG9yZGVyIGl0IGNvcnJlY3RseSB0byBzcGVlZCBsb2FkaW5nLlwiKTtcbiAgICByZXQuc29ydChmdW5jdGlvbihhLGIpIHsgcmV0dXJuIGFbMF0gLSBiWzBdOyB9KTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59O1xuXG4vLyBJbiBuYXRpdmUgZm9ybWF0LCBhbGwgdmFsdWVzIG11c3QgYmUgZGF0ZXMgb3IgbnVtYmVycy5cbi8vIFRoaXMgY2hlY2sgaXNuJ3QgcGVyZmVjdCBidXQgd2lsbCBjYXRjaCBtb3N0IG1pc3Rha2VuIHVzZXMgb2Ygc3RyaW5ncy5cbmZ1bmN0aW9uIHZhbGlkYXRlTmF0aXZlRm9ybWF0KGRhdGEpIHtcbiAgY29uc3QgZmlyc3RSb3cgPSBkYXRhWzBdO1xuICBjb25zdCBmaXJzdFggPSBmaXJzdFJvd1swXTtcbiAgaWYgKHR5cGVvZiBmaXJzdFggIT09ICdudW1iZXInICYmICF1dGlscy5pc0RhdGVMaWtlKGZpcnN0WCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIG51bWJlciBvciBkYXRlIGJ1dCBnb3QgJHt0eXBlb2YgZmlyc3RYfTogJHtmaXJzdFh9LmApO1xuICB9XG4gIGZvciAobGV0IGkgPSAxOyBpIDwgZmlyc3RSb3cubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCB2YWwgPSBmaXJzdFJvd1tpXTtcbiAgICBpZiAodmFsID09PSBudWxsIHx8IHZhbCA9PT0gdW5kZWZpbmVkKSBjb250aW51ZTtcbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIGNvbnRpbnVlO1xuICAgIGlmICh1dGlscy5pc0FycmF5TGlrZSh2YWwpKSBjb250aW51ZTsgIC8vIGUuZy4gZXJyb3JCYXJzIG9yIGN1c3RvbUJhcnNcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIG51bWJlciBvciBhcnJheSBidXQgZ290ICR7dHlwZW9mIHZhbH06ICR7dmFsfS5gKTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSB1c2VyIGhhcyBwcm92aWRlZCB0aGVpciBkYXRhIGFzIGEgcHJlLXBhY2thZ2VkIEpTIGFycmF5LiBJZiB0aGUgeCB2YWx1ZXNcbiAqIGFyZSBudW1lcmljLCB0aGlzIGlzIHRoZSBzYW1lIGFzIGR5Z3JhcGhzJyBpbnRlcm5hbCBmb3JtYXQuIElmIHRoZSB4IHZhbHVlc1xuICogYXJlIGRhdGVzLCB3ZSBuZWVkIHRvIGNvbnZlcnQgdGhlbSBmcm9tIERhdGUgb2JqZWN0cyB0byBtcyBzaW5jZSBlcG9jaC5cbiAqIEBwYXJhbSB7IUFycmF5fSBkYXRhXG4gKiBAcmV0dXJuIHtPYmplY3R9IGRhdGEgd2l0aCBudW1lcmljIHggdmFsdWVzLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUucGFyc2VBcnJheV8gPSBmdW5jdGlvbihkYXRhKSB7XG4gIC8vIFBlZWsgYXQgdGhlIGZpcnN0IHggdmFsdWUgdG8gc2VlIGlmIGl0J3MgbnVtZXJpYy5cbiAgaWYgKGRhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgZGF0YSA9IFtbMF1dO1xuICB9XG4gIGlmIChkYXRhWzBdLmxlbmd0aCA9PT0gMCkge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJEYXRhIHNldCBjYW5ub3QgY29udGFpbiBhbiBlbXB0eSByb3dcIik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2YWxpZGF0ZU5hdGl2ZUZvcm1hdChkYXRhKTtcblxuICB2YXIgaTtcbiAgaWYgKHRoaXMuYXR0cl8oXCJsYWJlbHNcIikgPT09IG51bGwpIHtcbiAgICBjb25zb2xlLndhcm4oXCJVc2luZyBkZWZhdWx0IGxhYmVscy4gU2V0IGxhYmVscyBleHBsaWNpdGx5IHZpYSAnbGFiZWxzJyBcIiArXG4gICAgICAgICAgICAgICAgIFwiaW4gdGhlIG9wdGlvbnMgcGFyYW1ldGVyXCIpO1xuICAgIHRoaXMuYXR0cnNfLmxhYmVscyA9IFsgXCJYXCIgXTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgZGF0YVswXS5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5hdHRyc18ubGFiZWxzLnB1c2goXCJZXCIgKyBpKTsgLy8gTm90IHVzZXJfYXR0cnNfLlxuICAgIH1cbiAgICB0aGlzLmF0dHJpYnV0ZXNfLnJlcGFyc2VTZXJpZXMoKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbnVtX2xhYmVscyA9IHRoaXMuYXR0cl8oXCJsYWJlbHNcIik7XG4gICAgaWYgKG51bV9sYWJlbHMubGVuZ3RoICE9IGRhdGFbMF0ubGVuZ3RoKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiTWlzbWF0Y2ggYmV0d2VlbiBudW1iZXIgb2YgbGFiZWxzIChcIiArIG51bV9sYWJlbHMgKyBcIilcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiIGFuZCBudW1iZXIgb2YgY29sdW1ucyBpbiBhcnJheSAoXCIgKyBkYXRhWzBdLmxlbmd0aCArIFwiKVwiKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGlmICh1dGlscy5pc0RhdGVMaWtlKGRhdGFbMF1bMF0pKSB7XG4gICAgLy8gU29tZSBpbnRlbGxpZ2VudCBkZWZhdWx0cyBmb3IgYSBkYXRlIHgtYXhpcy5cbiAgICB0aGlzLmF0dHJzXy5heGVzLngudmFsdWVGb3JtYXR0ZXIgPSB1dGlscy5kYXRlVmFsdWVGb3JtYXR0ZXI7XG4gICAgdGhpcy5hdHRyc18uYXhlcy54LnRpY2tlciA9IER5Z3JhcGhUaWNrZXJzLmRhdGVUaWNrZXI7XG4gICAgdGhpcy5hdHRyc18uYXhlcy54LmF4aXNMYWJlbEZvcm1hdHRlciA9IHV0aWxzLmRhdGVBeGlzTGFiZWxGb3JtYXR0ZXI7XG5cbiAgICAvLyBBc3N1bWUgdGhleSdyZSBhbGwgZGF0ZXMuXG4gICAgdmFyIHBhcnNlZERhdGEgPSB1dGlscy5jbG9uZShkYXRhKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHBhcnNlZERhdGFbaV0ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJSb3cgXCIgKyAoMSArIGkpICsgXCIgb2YgZGF0YSBpcyBlbXB0eVwiKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBpZiAocGFyc2VkRGF0YVtpXVswXSA9PT0gbnVsbCB8fFxuICAgICAgICAgIHR5cGVvZihwYXJzZWREYXRhW2ldWzBdLmdldFRpbWUpICE9ICdmdW5jdGlvbicgfHxcbiAgICAgICAgICBpc05hTihwYXJzZWREYXRhW2ldWzBdLmdldFRpbWUoKSkpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcInggdmFsdWUgaW4gcm93IFwiICsgKDEgKyBpKSArIFwiIGlzIG5vdCBhIERhdGVcIik7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcGFyc2VkRGF0YVtpXVswXSA9IHBhcnNlZERhdGFbaV1bMF0uZ2V0VGltZSgpO1xuICAgIH1cbiAgICByZXR1cm4gcGFyc2VkRGF0YTtcbiAgfSBlbHNlIHtcbiAgICAvLyBTb21lIGludGVsbGlnZW50IGRlZmF1bHRzIGZvciBhIG51bWVyaWMgeC1heGlzLlxuICAgIC8qKiBAcHJpdmF0ZSAoc2h1dCB1cCwganNkb2MhKSAqL1xuICAgIHRoaXMuYXR0cnNfLmF4ZXMueC52YWx1ZUZvcm1hdHRlciA9IGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHg7IH07XG4gICAgdGhpcy5hdHRyc18uYXhlcy54LnRpY2tlciA9IER5Z3JhcGhUaWNrZXJzLm51bWVyaWNUaWNrcztcbiAgICB0aGlzLmF0dHJzXy5heGVzLnguYXhpc0xhYmVsRm9ybWF0dGVyID0gdXRpbHMubnVtYmVyQXhpc0xhYmVsRm9ybWF0dGVyO1xuICAgIHJldHVybiBkYXRhO1xuICB9XG59O1xuXG4vKipcbiAqIFBhcnNlcyBhIERhdGFUYWJsZSBvYmplY3QgZnJvbSBndml6LlxuICogVGhlIGRhdGEgaXMgZXhwZWN0ZWQgdG8gaGF2ZSBhIGZpcnN0IGNvbHVtbiB0aGF0IGlzIGVpdGhlciBhIGRhdGUgb3IgYVxuICogbnVtYmVyLiBBbGwgc3Vic2VxdWVudCBjb2x1bW5zIG11c3QgYmUgbnVtYmVycy4gSWYgdGhlcmUgaXMgYSBjbGVhciBtaXNtYXRjaFxuICogYmV0d2VlbiB0aGlzLnhWYWx1ZVBhcnNlcl8gYW5kIHRoZSB0eXBlIG9mIHRoZSBmaXJzdCBjb2x1bW4sIGl0IHdpbGwgYmVcbiAqIGZpeGVkLiBGaWxscyBvdXQgcmF3RGF0YV8uXG4gKiBAcGFyYW0geyFnb29nbGUudmlzdWFsaXphdGlvbi5EYXRhVGFibGV9IGRhdGEgU2VlIGFib3ZlLlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUucGFyc2VEYXRhVGFibGVfID0gZnVuY3Rpb24oZGF0YSkge1xuICB2YXIgc2hvcnRUZXh0Rm9yQW5ub3RhdGlvbk51bSA9IGZ1bmN0aW9uKG51bSkge1xuICAgIC8vIGNvbnZlcnRzIFswLTldKyBbQS1aXVthLXpdKlxuICAgIC8vIGV4YW1wbGU6IDA9QSwgMT1CLCAyNT1aLCAyNj1BYSwgMjc9QWJcbiAgICAvLyBhbmQgY29udGludWVzIGxpa2UuLiBCYSBCYiAuLiBaYSAuLiBaei4uQWFhLi4uWnp6IEFhYWEgWnp6elxuICAgIHZhciBzaG9ydFRleHQgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDY1IC8qIEEgKi8gKyBudW0gJSAyNik7XG4gICAgbnVtID0gTWF0aC5mbG9vcihudW0gLyAyNik7XG4gICAgd2hpbGUgKCBudW0gPiAwICkge1xuICAgICAgc2hvcnRUZXh0ID0gU3RyaW5nLmZyb21DaGFyQ29kZSg2NSAvKiBBICovICsgKG51bSAtIDEpICUgMjYgKSArIHNob3J0VGV4dC50b0xvd2VyQ2FzZSgpO1xuICAgICAgbnVtID0gTWF0aC5mbG9vcigobnVtIC0gMSkgLyAyNik7XG4gICAgfVxuICAgIHJldHVybiBzaG9ydFRleHQ7XG4gIH07XG5cbiAgdmFyIGNvbHMgPSBkYXRhLmdldE51bWJlck9mQ29sdW1ucygpO1xuICB2YXIgcm93cyA9IGRhdGEuZ2V0TnVtYmVyT2ZSb3dzKCk7XG5cbiAgdmFyIGluZGVwVHlwZSA9IGRhdGEuZ2V0Q29sdW1uVHlwZSgwKTtcbiAgaWYgKGluZGVwVHlwZSA9PSAnZGF0ZScgfHwgaW5kZXBUeXBlID09ICdkYXRldGltZScpIHtcbiAgICB0aGlzLmF0dHJzXy54VmFsdWVQYXJzZXIgPSB1dGlscy5kYXRlUGFyc2VyO1xuICAgIHRoaXMuYXR0cnNfLmF4ZXMueC52YWx1ZUZvcm1hdHRlciA9IHV0aWxzLmRhdGVWYWx1ZUZvcm1hdHRlcjtcbiAgICB0aGlzLmF0dHJzXy5heGVzLngudGlja2VyID0gRHlncmFwaFRpY2tlcnMuZGF0ZVRpY2tlcjtcbiAgICB0aGlzLmF0dHJzXy5heGVzLnguYXhpc0xhYmVsRm9ybWF0dGVyID0gdXRpbHMuZGF0ZUF4aXNMYWJlbEZvcm1hdHRlcjtcbiAgfSBlbHNlIGlmIChpbmRlcFR5cGUgPT0gJ251bWJlcicpIHtcbiAgICB0aGlzLmF0dHJzXy54VmFsdWVQYXJzZXIgPSBmdW5jdGlvbih4KSB7IHJldHVybiBwYXJzZUZsb2F0KHgpOyB9O1xuICAgIHRoaXMuYXR0cnNfLmF4ZXMueC52YWx1ZUZvcm1hdHRlciA9IGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHg7IH07XG4gICAgdGhpcy5hdHRyc18uYXhlcy54LnRpY2tlciA9IER5Z3JhcGhUaWNrZXJzLm51bWVyaWNUaWNrcztcbiAgICB0aGlzLmF0dHJzXy5heGVzLnguYXhpc0xhYmVsRm9ybWF0dGVyID0gdGhpcy5hdHRyc18uYXhlcy54LnZhbHVlRm9ybWF0dGVyO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBcIm9ubHkgJ2RhdGUnLCAnZGF0ZXRpbWUnIGFuZCAnbnVtYmVyJyB0eXBlcyBhcmUgc3VwcG9ydGVkIFwiICtcbiAgICAgICAgICBcImZvciBjb2x1bW4gMSBvZiBEYXRhVGFibGUgaW5wdXQgKEdvdCAnXCIgKyBpbmRlcFR5cGUgKyBcIicpXCIpO1xuICB9XG5cbiAgLy8gQXJyYXkgb2YgdGhlIGNvbHVtbiBpbmRpY2VzIHdoaWNoIGNvbnRhaW4gZGF0YSAoYW5kIG5vdCBhbm5vdGF0aW9ucykuXG4gIHZhciBjb2xJZHggPSBbXTtcbiAgdmFyIGFubm90YXRpb25Db2xzID0ge307ICAvLyBkYXRhIGluZGV4IC0+IFthbm5vdGF0aW9uIGNvbHNdXG4gIHZhciBoYXNBbm5vdGF0aW9ucyA9IGZhbHNlO1xuICB2YXIgaSwgajtcbiAgZm9yIChpID0gMTsgaSA8IGNvbHM7IGkrKykge1xuICAgIHZhciB0eXBlID0gZGF0YS5nZXRDb2x1bW5UeXBlKGkpO1xuICAgIGlmICh0eXBlID09ICdudW1iZXInKSB7XG4gICAgICBjb2xJZHgucHVzaChpKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT0gJ3N0cmluZycgJiYgdGhpcy5nZXRCb29sZWFuT3B0aW9uKCdkaXNwbGF5QW5ub3RhdGlvbnMnKSkge1xuICAgICAgLy8gVGhpcyBpcyBPSyAtLSBpdCdzIGFuIGFubm90YXRpb24gY29sdW1uLlxuICAgICAgdmFyIGRhdGFJZHggPSBjb2xJZHhbY29sSWR4Lmxlbmd0aCAtIDFdO1xuICAgICAgaWYgKCFhbm5vdGF0aW9uQ29scy5oYXNPd25Qcm9wZXJ0eShkYXRhSWR4KSkge1xuICAgICAgICBhbm5vdGF0aW9uQ29sc1tkYXRhSWR4XSA9IFtpXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFubm90YXRpb25Db2xzW2RhdGFJZHhdLnB1c2goaSk7XG4gICAgICB9XG4gICAgICBoYXNBbm5vdGF0aW9ucyA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBcIk9ubHkgJ251bWJlcicgaXMgc3VwcG9ydGVkIGFzIGEgZGVwZW5kZW50IHR5cGUgd2l0aCBHdml6LlwiICtcbiAgICAgICAgICBcIiAnc3RyaW5nJyBpcyBvbmx5IHN1cHBvcnRlZCBpZiBkaXNwbGF5QW5ub3RhdGlvbnMgaXMgdHJ1ZVwiKTtcbiAgICB9XG4gIH1cblxuICAvLyBSZWFkIGNvbHVtbiBsYWJlbHNcbiAgLy8gVE9ETyhkYW52ayk6IGFkZCBzdXBwb3J0IGJhY2sgZm9yIGVycm9yQmFyc1xuICB2YXIgbGFiZWxzID0gW2RhdGEuZ2V0Q29sdW1uTGFiZWwoMCldO1xuICBmb3IgKGkgPSAwOyBpIDwgY29sSWR4Lmxlbmd0aDsgaSsrKSB7XG4gICAgbGFiZWxzLnB1c2goZGF0YS5nZXRDb2x1bW5MYWJlbChjb2xJZHhbaV0pKTtcbiAgICBpZiAodGhpcy5nZXRCb29sZWFuT3B0aW9uKFwiZXJyb3JCYXJzXCIpKSBpICs9IDE7XG4gIH1cbiAgdGhpcy5hdHRyc18ubGFiZWxzID0gbGFiZWxzO1xuICBjb2xzID0gbGFiZWxzLmxlbmd0aDtcblxuICB2YXIgcmV0ID0gW107XG4gIHZhciBvdXRPZk9yZGVyID0gZmFsc2U7XG4gIHZhciBhbm5vdGF0aW9ucyA9IFtdO1xuICBmb3IgKGkgPSAwOyBpIDwgcm93czsgaSsrKSB7XG4gICAgdmFyIHJvdyA9IFtdO1xuICAgIGlmICh0eXBlb2YoZGF0YS5nZXRWYWx1ZShpLCAwKSkgPT09ICd1bmRlZmluZWQnIHx8XG4gICAgICAgIGRhdGEuZ2V0VmFsdWUoaSwgMCkgPT09IG51bGwpIHtcbiAgICAgIGNvbnNvbGUud2FybihcIklnbm9yaW5nIHJvdyBcIiArIGkgK1xuICAgICAgICAgICAgICAgICAgIFwiIG9mIERhdGFUYWJsZSBiZWNhdXNlIG9mIHVuZGVmaW5lZCBvciBudWxsIGZpcnN0IGNvbHVtbi5cIik7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAoaW5kZXBUeXBlID09ICdkYXRlJyB8fCBpbmRlcFR5cGUgPT0gJ2RhdGV0aW1lJykge1xuICAgICAgcm93LnB1c2goZGF0YS5nZXRWYWx1ZShpLCAwKS5nZXRUaW1lKCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByb3cucHVzaChkYXRhLmdldFZhbHVlKGksIDApKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmdldEJvb2xlYW5PcHRpb24oXCJlcnJvckJhcnNcIikpIHtcbiAgICAgIGZvciAoaiA9IDA7IGogPCBjb2xJZHgubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdmFyIGNvbCA9IGNvbElkeFtqXTtcbiAgICAgICAgcm93LnB1c2goZGF0YS5nZXRWYWx1ZShpLCBjb2wpKTtcbiAgICAgICAgaWYgKGhhc0Fubm90YXRpb25zICYmXG4gICAgICAgICAgICBhbm5vdGF0aW9uQ29scy5oYXNPd25Qcm9wZXJ0eShjb2wpICYmXG4gICAgICAgICAgICBkYXRhLmdldFZhbHVlKGksIGFubm90YXRpb25Db2xzW2NvbF1bMF0pICE9PSBudWxsKSB7XG4gICAgICAgICAgdmFyIGFubiA9IHt9O1xuICAgICAgICAgIGFubi5zZXJpZXMgPSBkYXRhLmdldENvbHVtbkxhYmVsKGNvbCk7XG4gICAgICAgICAgYW5uLnh2YWwgPSByb3dbMF07XG4gICAgICAgICAgYW5uLnNob3J0VGV4dCA9IHNob3J0VGV4dEZvckFubm90YXRpb25OdW0oYW5ub3RhdGlvbnMubGVuZ3RoKTtcbiAgICAgICAgICBhbm4udGV4dCA9ICcnO1xuICAgICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgYW5ub3RhdGlvbkNvbHNbY29sXS5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgaWYgKGspIGFubi50ZXh0ICs9IFwiXFxuXCI7XG4gICAgICAgICAgICBhbm4udGV4dCArPSBkYXRhLmdldFZhbHVlKGksIGFubm90YXRpb25Db2xzW2NvbF1ba10pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhbm5vdGF0aW9ucy5wdXNoKGFubik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gU3RyaXAgb3V0IGluZmluaXRpZXMsIHdoaWNoIGdpdmUgZHlncmFwaHMgcHJvYmxlbXMgbGF0ZXIgb24uXG4gICAgICBmb3IgKGogPSAwOyBqIDwgcm93Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGlmICghaXNGaW5pdGUocm93W2pdKSkgcm93W2pdID0gbnVsbDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChqID0gMDsgaiA8IGNvbHMgLSAxOyBqKyspIHtcbiAgICAgICAgcm93LnB1c2goWyBkYXRhLmdldFZhbHVlKGksIDEgKyAyICogaiksIGRhdGEuZ2V0VmFsdWUoaSwgMiArIDIgKiBqKSBdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHJldC5sZW5ndGggPiAwICYmIHJvd1swXSA8IHJldFtyZXQubGVuZ3RoIC0gMV1bMF0pIHtcbiAgICAgIG91dE9mT3JkZXIgPSB0cnVlO1xuICAgIH1cbiAgICByZXQucHVzaChyb3cpO1xuICB9XG5cbiAgaWYgKG91dE9mT3JkZXIpIHtcbiAgICBjb25zb2xlLndhcm4oXCJEYXRhVGFibGUgaXMgb3V0IG9mIG9yZGVyOyBvcmRlciBpdCBjb3JyZWN0bHkgdG8gc3BlZWQgbG9hZGluZy5cIik7XG4gICAgcmV0LnNvcnQoZnVuY3Rpb24oYSxiKSB7IHJldHVybiBhWzBdIC0gYlswXTsgfSk7XG4gIH1cbiAgdGhpcy5yYXdEYXRhXyA9IHJldDtcblxuICBpZiAoYW5ub3RhdGlvbnMubGVuZ3RoID4gMCkge1xuICAgIHRoaXMuc2V0QW5ub3RhdGlvbnMoYW5ub3RhdGlvbnMsIHRydWUpO1xuICB9XG4gIHRoaXMuYXR0cmlidXRlc18ucmVwYXJzZVNlcmllcygpO1xufTtcblxuLyoqXG4gKiBTaWduYWxzIHRvIHBsdWdpbnMgdGhhdCB0aGUgY2hhcnQgZGF0YSBoYXMgdXBkYXRlZC5cbiAqIFRoaXMgaGFwcGVucyBhZnRlciB0aGUgZGF0YSBoYXMgdXBkYXRlZCBidXQgYmVmb3JlIHRoZSBjaGFydCBoYXMgcmVkcmF3bi5cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmNhc2NhZGVEYXRhRGlkVXBkYXRlRXZlbnRfID0gZnVuY3Rpb24oKSB7XG4gIC8vIFRPRE8oZGFudmspOiB0aGVyZSBhcmUgc29tZSBpc3N1ZXMgY2hlY2tpbmcgeEF4aXNSYW5nZSgpIGFuZCB1c2luZ1xuICAvLyB0b0RvbUNvb3JkcyBmcm9tIGhhbmRsZXJzIG9mIHRoaXMgZXZlbnQuIFRoZSB2aXNpYmxlIHJhbmdlIHNob3VsZCBiZSBzZXRcbiAgLy8gd2hlbiB0aGUgY2hhcnQgaXMgZHJhd24sIG5vdCBkZXJpdmVkIGZyb20gdGhlIGRhdGEuXG4gIHRoaXMuY2FzY2FkZUV2ZW50c18oJ2RhdGFEaWRVcGRhdGUnLCB7fSk7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgQ1NWIGRhdGEuIElmIGl0J3MgaW4gYSBmdW5jdGlvbiwgY2FsbCB0aGF0IGZ1bmN0aW9uLiBJZiBpdCdzIGluIGFcbiAqIGZpbGUsIGRvIGFuIFhNTEh0dHBSZXF1ZXN0IHRvIGdldCBpdC5cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnN0YXJ0XyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZGF0YSA9IHRoaXMuZmlsZV87XG5cbiAgLy8gRnVuY3Rpb25zIGNhbiByZXR1cm4gcmVmZXJlbmNlcyBvZiBhbGwgb3RoZXIgdHlwZXMuXG4gIGlmICh0eXBlb2YgZGF0YSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgZGF0YSA9IGRhdGEoKTtcbiAgfVxuXG4gIGNvbnN0IGRhdGF0eXBlID0gdXRpbHMudHlwZUFycmF5TGlrZShkYXRhKTtcbiAgaWYgKGRhdGF0eXBlID09ICdhcnJheScpIHtcbiAgICB0aGlzLnJhd0RhdGFfID0gdGhpcy5wYXJzZUFycmF5XyhkYXRhKTtcbiAgICB0aGlzLmNhc2NhZGVEYXRhRGlkVXBkYXRlRXZlbnRfKCk7XG4gICAgdGhpcy5wcmVkcmF3XygpO1xuICB9IGVsc2UgaWYgKGRhdGF0eXBlID09ICdvYmplY3QnICYmXG4gICAgICAgICAgICAgdHlwZW9mIGRhdGEuZ2V0Q29sdW1uUmFuZ2UgPT0gJ2Z1bmN0aW9uJykge1xuICAgIC8vIG11c3QgYmUgYSBEYXRhVGFibGUgZnJvbSBndml6LlxuICAgIHRoaXMucGFyc2VEYXRhVGFibGVfKGRhdGEpO1xuICAgIHRoaXMuY2FzY2FkZURhdGFEaWRVcGRhdGVFdmVudF8oKTtcbiAgICB0aGlzLnByZWRyYXdfKCk7XG4gIH0gZWxzZSBpZiAoZGF0YXR5cGUgPT0gJ3N0cmluZycpIHtcbiAgICAvLyBIZXVyaXN0aWM6IGEgbmV3bGluZSBtZWFucyBpdCdzIENTViBkYXRhLiBPdGhlcndpc2UgaXQncyBhbiBVUkwuXG4gICAgdmFyIGxpbmVfZGVsaW1pdGVyID0gdXRpbHMuZGV0ZWN0TGluZURlbGltaXRlcihkYXRhKTtcbiAgICBpZiAobGluZV9kZWxpbWl0ZXIpIHtcbiAgICAgIHRoaXMubG9hZGVkRXZlbnRfKGRhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSRU1PVkVfRk9SX0lFXG4gICAgICB2YXIgcmVxO1xuICAgICAgaWYgKHdpbmRvdy5YTUxIdHRwUmVxdWVzdCkge1xuICAgICAgICAvLyBGaXJlZm94LCBPcGVyYSwgSUU3LCBhbmQgb3RoZXIgYnJvd3NlcnMgd2lsbCB1c2UgdGhlIG5hdGl2ZSBvYmplY3RcbiAgICAgICAgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJRSA1IGFuZCA2IHdpbGwgdXNlIHRoZSBBY3RpdmVYIGNvbnRyb2xcbiAgICAgICAgcmVxID0gbmV3IEFjdGl2ZVhPYmplY3QoXCJNaWNyb3NvZnQuWE1MSFRUUFwiKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGNhbGxlciA9IHRoaXM7XG4gICAgICByZXEub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAocmVxLnJlYWR5U3RhdGUgPT0gNCkge1xuICAgICAgICAgIGlmIChyZXEuc3RhdHVzID09PSAyMDAgfHwgIC8vIE5vcm1hbCBodHRwXG4gICAgICAgICAgICAgIHJlcS5zdGF0dXMgPT09IDApIHsgICAgLy8gQ2hyb21lIHcvIC0tYWxsb3ctZmlsZS1hY2Nlc3MtZnJvbS1maWxlc1xuICAgICAgICAgICAgY2FsbGVyLmxvYWRlZEV2ZW50XyhyZXEucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHJlcS5vcGVuKFwiR0VUXCIsIGRhdGEsIHRydWUpO1xuICAgICAgcmVxLnNlbmQobnVsbCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJVbmtub3duIGRhdGEgZm9ybWF0OiBcIiArIGRhdGF0eXBlKTtcbiAgfVxufTtcblxuLyoqXG4gKiBDaGFuZ2VzIHZhcmlvdXMgcHJvcGVydGllcyBvZiB0aGUgZ3JhcGguIFRoZXNlIGNhbiBpbmNsdWRlOlxuICogPHVsPlxuICogPGxpPmZpbGU6IGNoYW5nZXMgdGhlIHNvdXJjZSBkYXRhIGZvciB0aGUgZ3JhcGg8L2xpPlxuICogPGxpPmVycm9yQmFyczogY2hhbmdlcyB3aGV0aGVyIHRoZSBkYXRhIGNvbnRhaW5zIHN0ZGRldjwvbGk+XG4gKiA8L3VsPlxuICpcbiAqIFRoZXJlJ3MgYSBodWdlIHZhcmlldHkgb2Ygb3B0aW9ucyB0aGF0IGNhbiBiZSBwYXNzZWQgdG8gdGhpcyBtZXRob2QuIEZvciBhXG4gKiBmdWxsIGxpc3QsIHNlZSBodHRwOi8vZHlncmFwaHMuY29tL29wdGlvbnMuaHRtbC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaW5wdXRfYXR0cnMgVGhlIG5ldyBwcm9wZXJ0aWVzIGFuZCB2YWx1ZXNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYmxvY2tfcmVkcmF3IFVzdWFsbHkgdGhlIGNoYXJ0IGlzIHJlZHJhd24gYWZ0ZXIgZXZlcnlcbiAqICAgICBjYWxsIHRvIHVwZGF0ZU9wdGlvbnMoKS4gSWYgeW91IGtub3cgYmV0dGVyLCB5b3UgY2FuIHBhc3MgdHJ1ZSB0b1xuICogICAgIGV4cGxpY2l0bHkgYmxvY2sgdGhlIHJlZHJhdy4gVGhpcyBjYW4gYmUgdXNlZnVsIGZvciBjaGFpbmluZ1xuICogICAgIHVwZGF0ZU9wdGlvbnMoKSBjYWxscywgYXZvaWRpbmcgdGhlIG9jY2FzaW9uYWwgaW5maW5pdGUgbG9vcCBhbmRcbiAqICAgICBwcmV2ZW50aW5nIHJlZHJhd3Mgd2hlbiBpdCdzIG5vdCBuZWNlc3NhcnkgKGUuZy4gd2hlbiB1cGRhdGluZyBhXG4gKiAgICAgY2FsbGJhY2spLlxuICovXG5EeWdyYXBoLnByb3RvdHlwZS51cGRhdGVPcHRpb25zID0gZnVuY3Rpb24oaW5wdXRfYXR0cnMsIGJsb2NrX3JlZHJhdykge1xuICBpZiAodHlwZW9mKGJsb2NrX3JlZHJhdykgPT0gJ3VuZGVmaW5lZCcpIGJsb2NrX3JlZHJhdyA9IGZhbHNlO1xuXG4gIC8vIGNvcHlVc2VyQXR0cnNfIGRyb3BzIHRoZSBcImZpbGVcIiBwYXJhbWV0ZXIgYXMgYSBjb252ZW5pZW5jZSB0byB1cy5cbiAgdmFyIGZpbGUgPSBpbnB1dF9hdHRycy5maWxlO1xuICB2YXIgYXR0cnMgPSBEeWdyYXBoLmNvcHlVc2VyQXR0cnNfKGlucHV0X2F0dHJzKTtcbiAgdmFyIHByZXZOdW1BeGVzID0gdGhpcy5hdHRyaWJ1dGVzXy5udW1BeGVzKCk7XG5cbiAgLy8gVE9ETyhkYW52ayk6IHRoaXMgaXMgYSBtZXNzLiBNb3ZlIHRoZXNlIG9wdGlvbnMgaW50byBhdHRyXy5cbiAgaWYgKCdyb2xsUGVyaW9kJyBpbiBhdHRycykge1xuICAgIHRoaXMucm9sbFBlcmlvZF8gPSBhdHRycy5yb2xsUGVyaW9kO1xuICB9XG4gIGlmICgnZGF0ZVdpbmRvdycgaW4gYXR0cnMpIHtcbiAgICB0aGlzLmRhdGVXaW5kb3dfID0gYXR0cnMuZGF0ZVdpbmRvdztcbiAgfVxuXG4gIC8vIFRPRE8oZGFudmspOiB2YWxpZGF0ZSBwZXItc2VyaWVzIG9wdGlvbnMuXG4gIC8vIFN1cHBvcnRlZDpcbiAgLy8gc3Ryb2tlV2lkdGhcbiAgLy8gcG9pbnRTaXplXG4gIC8vIGRyYXdQb2ludHNcbiAgLy8gaGlnaGxpZ2h0Q2lyY2xlU2l6ZVxuXG4gIC8vIENoZWNrIGlmIHRoaXMgc2V0IG9wdGlvbnMgd2lsbCByZXF1aXJlIG5ldyBwb2ludHMuXG4gIHZhciByZXF1aXJlc05ld1BvaW50cyA9IHV0aWxzLmlzUGl4ZWxDaGFuZ2luZ09wdGlvbkxpc3QodGhpcy5hdHRyXyhcImxhYmVsc1wiKSwgYXR0cnMpO1xuXG4gIHV0aWxzLnVwZGF0ZURlZXAodGhpcy51c2VyX2F0dHJzXywgYXR0cnMpO1xuXG4gIHRoaXMuYXR0cmlidXRlc18ucmVwYXJzZVNlcmllcygpO1xuXG4gIGlmIChwcmV2TnVtQXhlcyA8IHRoaXMuYXR0cmlidXRlc18ubnVtQXhlcygpKSB0aGlzLnBsb3R0ZXJfLmNsZWFyKCk7XG4gIGlmIChmaWxlKSB7XG4gICAgLy8gVGhpcyBldmVudCBpbmRpY2F0ZXMgdGhhdCB0aGUgZGF0YSBpcyBhYm91dCB0byBjaGFuZ2UsIGJ1dCBoYXNuJ3QgeWV0LlxuICAgIC8vIFRPRE8oZGFudmspOiBzdXBwb3J0IGNhbmNlbGxhdGlvbiBvZiB0aGUgdXBkYXRlIHZpYSB0aGlzIGV2ZW50LlxuICAgIHRoaXMuY2FzY2FkZUV2ZW50c18oJ2RhdGFXaWxsVXBkYXRlJywge30pO1xuXG4gICAgdGhpcy5maWxlXyA9IGZpbGU7XG4gICAgaWYgKCFibG9ja19yZWRyYXcpIHRoaXMuc3RhcnRfKCk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKCFibG9ja19yZWRyYXcpIHtcbiAgICAgIGlmIChyZXF1aXJlc05ld1BvaW50cykge1xuICAgICAgICB0aGlzLnByZWRyYXdfKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlbmRlckdyYXBoXyhmYWxzZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIE1ha2UgYSBjb3B5IG9mIGlucHV0IGF0dHJpYnV0ZXMsIHJlbW92aW5nIGZpbGUgYXMgYSBjb252ZW5pZW5jZS5cbiAqIEBwcml2YXRlXG4gKi9cbkR5Z3JhcGguY29weVVzZXJBdHRyc18gPSBmdW5jdGlvbihhdHRycykge1xuICB2YXIgbXlfYXR0cnMgPSB7fTtcbiAgZm9yICh2YXIgayBpbiBhdHRycykge1xuICAgIGlmICghYXR0cnMuaGFzT3duUHJvcGVydHkoaykpIGNvbnRpbnVlO1xuICAgIGlmIChrID09ICdmaWxlJykgY29udGludWU7XG4gICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGspKSBteV9hdHRyc1trXSA9IGF0dHJzW2tdO1xuICB9XG4gIHJldHVybiBteV9hdHRycztcbn07XG5cbi8qKlxuICogUmVzaXplcyB0aGUgZHlncmFwaC4gSWYgbm8gcGFyYW1ldGVycyBhcmUgc3BlY2lmaWVkLCByZXNpemVzIHRvIGZpbGwgdGhlXG4gKiBjb250YWluaW5nIGRpdiAod2hpY2ggaGFzIHByZXN1bWFibHkgY2hhbmdlZCBzaXplIHNpbmNlIHRoZSBkeWdyYXBoIHdhc1xuICogaW5zdGFudGlhdGVkKS4gSWYgdGhlIHdpZHRoL2hlaWdodCBhcmUgc3BlY2lmaWVkLCB0aGUgZGl2IHdpbGwgYmUgcmVzaXplZC5cbiAqXG4gKiBUaGlzIGlzIGZhciBtb3JlIGVmZmljaWVudCB0aGFuIGRlc3Ryb3lpbmcgYW5kIHJlLWluc3RhbnRpYXRpbmcgYVxuICogRHlncmFwaCwgc2luY2UgaXQgZG9lc24ndCBoYXZlIHRvIHJlcGFyc2UgdGhlIHVuZGVybHlpbmcgZGF0YS5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gd2lkdGggV2lkdGggKGluIHBpeGVscylcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgSGVpZ2h0IChpbiBwaXhlbHMpXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcbiAgaWYgKHRoaXMucmVzaXplX2xvY2spIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5yZXNpemVfbG9jayA9IHRydWU7XG5cbiAgaWYgKCh3aWR0aCA9PT0gbnVsbCkgIT0gKGhlaWdodCA9PT0gbnVsbCkpIHtcbiAgICBjb25zb2xlLndhcm4oXCJEeWdyYXBoLnJlc2l6ZSgpIHNob3VsZCBiZSBjYWxsZWQgd2l0aCB6ZXJvIHBhcmFtZXRlcnMgb3IgXCIgK1xuICAgICAgICAgICAgICAgICBcInR3byBub24tTlVMTCBwYXJhbWV0ZXJzLiBQcmV0ZW5kaW5nIGl0IHdhcyB6ZXJvLlwiKTtcbiAgICB3aWR0aCA9IGhlaWdodCA9IG51bGw7XG4gIH1cblxuICB2YXIgb2xkX3dpZHRoID0gdGhpcy53aWR0aF87XG4gIHZhciBvbGRfaGVpZ2h0ID0gdGhpcy5oZWlnaHRfO1xuXG4gIGlmICh3aWR0aCkge1xuICAgIHRoaXMubWFpbmRpdl8uc3R5bGUud2lkdGggPSB3aWR0aCArIFwicHhcIjtcbiAgICB0aGlzLm1haW5kaXZfLnN0eWxlLmhlaWdodCA9IGhlaWdodCArIFwicHhcIjtcbiAgICB0aGlzLndpZHRoXyA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0XyA9IGhlaWdodDtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLndpZHRoXyA9IHRoaXMubWFpbmRpdl8uY2xpZW50V2lkdGg7XG4gICAgdGhpcy5oZWlnaHRfID0gdGhpcy5tYWluZGl2Xy5jbGllbnRIZWlnaHQ7XG4gIH1cblxuICBpZiAob2xkX3dpZHRoICE9IHRoaXMud2lkdGhfIHx8IG9sZF9oZWlnaHQgIT0gdGhpcy5oZWlnaHRfKSB7XG4gICAgLy8gUmVzaXppbmcgYSBjYW52YXMgZXJhc2VzIGl0LCBldmVuIHdoZW4gdGhlIHNpemUgZG9lc24ndCBjaGFuZ2UsIHNvXG4gICAgLy8gYW55IHJlc2l6ZSBuZWVkcyB0byBiZSBmb2xsb3dlZCBieSBhIHJlZHJhdy5cbiAgICB0aGlzLnJlc2l6ZUVsZW1lbnRzXygpO1xuICAgIHRoaXMucHJlZHJhd18oKTtcbiAgfVxuXG4gIHRoaXMucmVzaXplX2xvY2sgPSBmYWxzZTtcbn07XG5cbi8qKlxuICogQWRqdXN0cyB0aGUgbnVtYmVyIG9mIHBvaW50cyBpbiB0aGUgcm9sbGluZyBhdmVyYWdlLiBVcGRhdGVzIHRoZSBncmFwaCB0b1xuICogcmVmbGVjdCB0aGUgbmV3IGF2ZXJhZ2luZyBwZXJpb2QuXG4gKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoIE51bWJlciBvZiBwb2ludHMgb3ZlciB3aGljaCB0byBhdmVyYWdlIHRoZSBkYXRhLlxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5hZGp1c3RSb2xsID0gZnVuY3Rpb24obGVuZ3RoKSB7XG4gIHRoaXMucm9sbFBlcmlvZF8gPSBsZW5ndGg7XG4gIHRoaXMucHJlZHJhd18oKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIGJvb2xlYW4gYXJyYXkgb2YgdmlzaWJpbGl0eSBzdGF0dXNlcy5cbiAqL1xuRHlncmFwaC5wcm90b3R5cGUudmlzaWJpbGl0eSA9IGZ1bmN0aW9uKCkge1xuICAvLyBEbyBsYXp5LWluaXRpYWxpemF0aW9uLCBzbyB0aGF0IHRoaXMgaGFwcGVucyBhZnRlciB3ZSBrbm93IHRoZSBudW1iZXIgb2ZcbiAgLy8gZGF0YSBzZXJpZXMuXG4gIGlmICghdGhpcy5nZXRPcHRpb24oXCJ2aXNpYmlsaXR5XCIpKSB7XG4gICAgdGhpcy5hdHRyc18udmlzaWJpbGl0eSA9IFtdO1xuICB9XG4gIC8vIFRPRE8oZGFudmspOiBpdCBsb29rcyBsaWtlIHRoaXMgY291bGQgZ28gaW50byBhbiBpbmZpbml0ZSBsb29wIHcvIHVzZXJfYXR0cnMuXG4gIHdoaWxlICh0aGlzLmdldE9wdGlvbihcInZpc2liaWxpdHlcIikubGVuZ3RoIDwgdGhpcy5udW1Db2x1bW5zKCkgLSAxKSB7XG4gICAgdGhpcy5hdHRyc18udmlzaWJpbGl0eS5wdXNoKHRydWUpO1xuICB9XG4gIHJldHVybiB0aGlzLmdldE9wdGlvbihcInZpc2liaWxpdHlcIik7XG59O1xuXG4vKipcbiAqIENoYW5nZXMgdGhlIHZpc2liaWxpdHkgb2Ygb25lIG9yIG1vcmUgc2VyaWVzLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfG51bWJlcltdfG9iamVjdH0gbnVtIHRoZSBzZXJpZXMgaW5kZXggb3IgYW4gYXJyYXkgb2Ygc2VyaWVzIGluZGljZXNcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yIGEgYm9vbGVhbiBhcnJheSBvZiB2aXNpYmlsaXR5IHN0YXRlcyBieSBpbmRleFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3IgYW4gb2JqZWN0IG1hcHBpbmcgc2VyaWVzIG51bWJlcnMsIGFzIGtleXMsIHRvXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmlsaXR5IHN0YXRlIChib29sZWFuIHZhbHVlcylcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gdmFsdWUgdGhlIHZpc2liaWxpdHkgc3RhdGUgZXhwcmVzc2VkIGFzIGEgYm9vbGVhblxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5zZXRWaXNpYmlsaXR5ID0gZnVuY3Rpb24obnVtLCB2YWx1ZSkge1xuICB2YXIgeCA9IHRoaXMudmlzaWJpbGl0eSgpO1xuICB2YXIgbnVtSXNPYmplY3QgPSBmYWxzZTtcblxuICBpZiAoIUFycmF5LmlzQXJyYXkobnVtKSkge1xuICAgIGlmIChudW0gIT09IG51bGwgJiYgdHlwZW9mIG51bSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIG51bUlzT2JqZWN0ID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgbnVtID0gW251bV07XG4gICAgfVxuICB9XG5cbiAgaWYgKG51bUlzT2JqZWN0KSB7XG4gICAgZm9yICh2YXIgaSBpbiBudW0pIHtcbiAgICAgIGlmIChudW0uaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgaWYgKGkgPCAwIHx8IGkgPj0geC5sZW5ndGgpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oXCJJbnZhbGlkIHNlcmllcyBudW1iZXIgaW4gc2V0VmlzaWJpbGl0eTogXCIgKyBpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB4W2ldID0gbnVtW2ldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodHlwZW9mIG51bVtpXSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgIGlmIChpID49IHgubGVuZ3RoKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFwiSW52YWxpZCBzZXJpZXMgbnVtYmVyIGluIHNldFZpc2liaWxpdHk6IFwiICsgaSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgeFtpXSA9IG51bVtpXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG51bVtpXSA8IDAgfHwgbnVtW2ldID49IHgubGVuZ3RoKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFwiSW52YWxpZCBzZXJpZXMgbnVtYmVyIGluIHNldFZpc2liaWxpdHk6IFwiICsgbnVtW2ldKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB4W251bVtpXV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRoaXMucHJlZHJhd18oKTtcbn07XG5cbi8qKlxuICogSG93IGxhcmdlIG9mIGFuIGFyZWEgd2lsbCB0aGUgZHlncmFwaCByZW5kZXIgaXRzZWxmIGluP1xuICogVGhpcyBpcyB1c2VkIGZvciB0ZXN0aW5nLlxuICogQHJldHVybiBBIHt3aWR0aDogdywgaGVpZ2h0OiBofSBvYmplY3QuXG4gKiBAcHJpdmF0ZVxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5zaXplID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7IHdpZHRoOiB0aGlzLndpZHRoXywgaGVpZ2h0OiB0aGlzLmhlaWdodF8gfTtcbn07XG5cbi8qKlxuICogVXBkYXRlIHRoZSBsaXN0IG9mIGFubm90YXRpb25zIGFuZCByZWRyYXcgdGhlIGNoYXJ0LlxuICogU2VlIGR5Z3JhcGhzLmNvbS9hbm5vdGF0aW9ucy5odG1sIGZvciBtb3JlIGluZm8gb24gaG93IHRvIHVzZSBhbm5vdGF0aW9ucy5cbiAqIEBwYXJhbSBhbm4ge0FycmF5fSBBbiBhcnJheSBvZiBhbm5vdGF0aW9uIG9iamVjdHMuXG4gKiBAcGFyYW0gc3VwcHJlc3NEcmF3IHtCb29sZWFufSBTZXQgdG8gXCJ0cnVlXCIgdG8gYmxvY2sgY2hhcnQgcmVkcmF3IChvcHRpb25hbCkuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLnNldEFubm90YXRpb25zID0gZnVuY3Rpb24oYW5uLCBzdXBwcmVzc0RyYXcpIHtcbiAgLy8gT25seSBhZGQgdGhlIGFubm90YXRpb24gQ1NTIHJ1bGUgb25jZSB3ZSBrbm93IGl0IHdpbGwgYmUgdXNlZC5cbiAgdGhpcy5hbm5vdGF0aW9uc18gPSBhbm47XG4gIGlmICghdGhpcy5sYXlvdXRfKSB7XG4gICAgY29uc29sZS53YXJuKFwiVHJpZWQgdG8gc2V0QW5ub3RhdGlvbnMgYmVmb3JlIGR5Z3JhcGggd2FzIHJlYWR5LiBcIiArXG4gICAgICAgICAgICAgICAgIFwiVHJ5IHNldHRpbmcgdGhlbSBpbiBhIHJlYWR5KCkgYmxvY2suIFNlZSBcIiArXG4gICAgICAgICAgICAgICAgIFwiZHlncmFwaHMuY29tL3Rlc3RzL2Fubm90YXRpb24uaHRtbFwiKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLmxheW91dF8uc2V0QW5ub3RhdGlvbnModGhpcy5hbm5vdGF0aW9uc18pO1xuICBpZiAoIXN1cHByZXNzRHJhdykge1xuICAgIHRoaXMucHJlZHJhd18oKTtcbiAgfVxufTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIGxpc3Qgb2YgYW5ub3RhdGlvbnMuXG4gKi9cbkR5Z3JhcGgucHJvdG90eXBlLmFubm90YXRpb25zID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmFubm90YXRpb25zXztcbn07XG5cbi8qKlxuICogR2V0IHRoZSBsaXN0IG9mIGxhYmVsIG5hbWVzIGZvciB0aGlzIGdyYXBoLiBUaGUgZmlyc3QgY29sdW1uIGlzIHRoZVxuICogeC1heGlzLCBzbyB0aGUgZGF0YSBzZXJpZXMgbmFtZXMgc3RhcnQgYXQgaW5kZXggMS5cbiAqXG4gKiBSZXR1cm5zIG51bGwgd2hlbiBsYWJlbHMgaGF2ZSBub3QgeWV0IGJlZW4gZGVmaW5lZC5cbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuZ2V0TGFiZWxzID0gZnVuY3Rpb24oKSB7XG4gIHZhciBsYWJlbHMgPSB0aGlzLmF0dHJfKFwibGFiZWxzXCIpO1xuICByZXR1cm4gbGFiZWxzID8gbGFiZWxzLnNsaWNlKCkgOiBudWxsO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIGluZGV4IG9mIGEgc2VyaWVzIChjb2x1bW4pIGdpdmVuIGl0cyBuYW1lLiBUaGUgZmlyc3QgY29sdW1uIGlzIHRoZVxuICogeC1heGlzLCBzbyB0aGUgZGF0YSBzZXJpZXMgc3RhcnQgd2l0aCBpbmRleCAxLlxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5pbmRleEZyb21TZXROYW1lID0gZnVuY3Rpb24obmFtZSkge1xuICByZXR1cm4gdGhpcy5zZXRJbmRleEJ5TmFtZV9bbmFtZV07XG59O1xuXG4vKipcbiAqIEZpbmQgdGhlIHJvdyBudW1iZXIgY29ycmVzcG9uZGluZyB0byB0aGUgZ2l2ZW4geC12YWx1ZS5cbiAqIFJldHVybnMgbnVsbCBpZiB0aGVyZSBpcyBubyBzdWNoIHgtdmFsdWUgaW4gdGhlIGRhdGEuXG4gKiBJZiB0aGVyZSBhcmUgbXVsdGlwbGUgcm93cyB3aXRoIHRoZSBzYW1lIHgtdmFsdWUsIHRoaXMgd2lsbCByZXR1cm4gdGhlXG4gKiBmaXJzdCBvbmUuXG4gKiBAcGFyYW0ge251bWJlcn0geFZhbCBUaGUgeC12YWx1ZSB0byBsb29rIGZvciAoZS5nLiBtaWxsaXMgc2luY2UgZXBvY2gpLlxuICogQHJldHVybiB7P251bWJlcn0gVGhlIHJvdyBudW1iZXIsIHdoaWNoIHlvdSBjYW4gcGFzcyB0byBnZXRWYWx1ZSgpLCBvciBudWxsLlxuICovXG5EeWdyYXBoLnByb3RvdHlwZS5nZXRSb3dGb3JYID0gZnVuY3Rpb24oeFZhbCkge1xuICB2YXIgbG93ID0gMCxcbiAgICAgIGhpZ2ggPSB0aGlzLm51bVJvd3MoKSAtIDE7XG5cbiAgd2hpbGUgKGxvdyA8PSBoaWdoKSB7XG4gICAgdmFyIGlkeCA9IChoaWdoICsgbG93KSA+PiAxO1xuICAgIHZhciB4ID0gdGhpcy5nZXRWYWx1ZShpZHgsIDApO1xuICAgIGlmICh4IDwgeFZhbCkge1xuICAgICAgbG93ID0gaWR4ICsgMTtcbiAgICB9IGVsc2UgaWYgKHggPiB4VmFsKSB7XG4gICAgICBoaWdoID0gaWR4IC0gMTtcbiAgICB9IGVsc2UgaWYgKGxvdyAhPSBpZHgpIHsgIC8vIGVxdWFsLCBidXQgdGhlcmUgbWF5IGJlIGFuIGVhcmxpZXIgbWF0Y2guXG4gICAgICBoaWdoID0gaWR4O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gaWR4O1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufTtcblxuLyoqXG4gKiBUcmlnZ2VyIGEgY2FsbGJhY2sgd2hlbiB0aGUgZHlncmFwaCBoYXMgZHJhd24gaXRzZWxmIGFuZCBpcyByZWFkeSB0byBiZVxuICogbWFuaXB1bGF0ZWQuIFRoaXMgaXMgcHJpbWFyaWx5IHVzZWZ1bCB3aGVuIGR5Z3JhcGhzIGhhcyB0byBkbyBhbiBYSFIgZm9yIHRoZVxuICogZGF0YSAoaS5lLiBhIFVSTCBpcyBwYXNzZWQgYXMgdGhlIGRhdGEgc291cmNlKSBhbmQgdGhlIGNoYXJ0IGlzIGRyYXduXG4gKiBhc3luY2hyb25vdXNseS4gSWYgdGhlIGNoYXJ0IGhhcyBhbHJlYWR5IGRyYXduLCB0aGUgY2FsbGJhY2sgd2lsbCBmaXJlXG4gKiBpbW1lZGlhdGVseS5cbiAqXG4gKiBUaGlzIGlzIGEgZ29vZCBwbGFjZSB0byBjYWxsIHNldEFubm90YXRpb24oKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKCFEeWdyYXBoKX0gY2FsbGJhY2sgVGhlIGNhbGxiYWNrIHRvIHRyaWdnZXIgd2hlbiB0aGUgY2hhcnRcbiAqICAgICBpcyByZWFkeS5cbiAqL1xuRHlncmFwaC5wcm90b3R5cGUucmVhZHkgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICBpZiAodGhpcy5pc19pbml0aWFsX2RyYXdfKSB7XG4gICAgdGhpcy5yZWFkeUZuc18ucHVzaChjYWxsYmFjayk7XG4gIH0gZWxzZSB7XG4gICAgY2FsbGJhY2suY2FsbCh0aGlzLCB0aGlzKTtcbiAgfVxufTtcblxuLyoqXG4gKiBBZGQgYW4gZXZlbnQgaGFuZGxlci4gVGhpcyBldmVudCBoYW5kbGVyIGlzIGtlcHQgdW50aWwgdGhlIGdyYXBoIGlzXG4gKiBkZXN0cm95ZWQgd2l0aCBhIGNhbGwgdG8gZ3JhcGguZGVzdHJveSgpLlxuICpcbiAqIEBwYXJhbSB7IU5vZGV9IGVsZW0gVGhlIGVsZW1lbnQgdG8gYWRkIHRoZSBldmVudCB0by5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIFRoZSB0eXBlIG9mIHRoZSBldmVudCwgZS5nLiAnY2xpY2snIG9yICdtb3VzZW1vdmUnLlxuICogQHBhcmFtIHtmdW5jdGlvbihFdmVudCk6KGJvb2xlYW58dW5kZWZpbmVkKX0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGxcbiAqICAgICBvbiB0aGUgZXZlbnQuIFRoZSBmdW5jdGlvbiB0YWtlcyBvbmUgcGFyYW1ldGVyOiB0aGUgZXZlbnQgb2JqZWN0LlxuICogQHByaXZhdGVcbiAqL1xuRHlncmFwaC5wcm90b3R5cGUuYWRkQW5kVHJhY2tFdmVudCA9IGZ1bmN0aW9uKGVsZW0sIHR5cGUsIGZuKSB7XG4gIHV0aWxzLmFkZEV2ZW50KGVsZW0sIHR5cGUsIGZuKTtcbiAgdGhpcy5yZWdpc3RlcmVkRXZlbnRzXy5wdXNoKHtlbGVtLCB0eXBlLCBmbn0pO1xufTtcblxuRHlncmFwaC5wcm90b3R5cGUucmVtb3ZlVHJhY2tlZEV2ZW50c18gPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMucmVnaXN0ZXJlZEV2ZW50c18pIHtcbiAgICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCB0aGlzLnJlZ2lzdGVyZWRFdmVudHNfLmxlbmd0aDsgaWR4KyspIHtcbiAgICAgIHZhciByZWcgPSB0aGlzLnJlZ2lzdGVyZWRFdmVudHNfW2lkeF07XG4gICAgICB1dGlscy5yZW1vdmVFdmVudChyZWcuZWxlbSwgcmVnLnR5cGUsIHJlZy5mbik7XG4gICAgfVxuICB9XG5cbiAgdGhpcy5yZWdpc3RlcmVkRXZlbnRzXyA9IFtdO1xufTtcblxuLy8gSW5zdGFsbGVkIHBsdWdpbnMsIGluIG9yZGVyIG9mIHByZWNlZGVuY2UgKG1vc3QtZ2VuZXJhbCB0byBtb3N0LXNwZWNpZmljKS5cbkR5Z3JhcGguUExVR0lOUyA9IFtcbiAgTGVnZW5kUGx1Z2luLFxuICBBeGVzUGx1Z2luLFxuICBSYW5nZVNlbGVjdG9yUGx1Z2luLCAvLyBIYXMgdG8gYmUgYmVmb3JlIENoYXJ0TGFiZWxzIHNvIHRoYXQgaXRzIGNhbGxiYWNrcyBhcmUgY2FsbGVkIGFmdGVyIENoYXJ0TGFiZWxzJyBjYWxsYmFja3MuXG4gIENoYXJ0TGFiZWxzUGx1Z2luLFxuICBBbm5vdGF0aW9uc1BsdWdpbixcbiAgR3JpZFBsdWdpblxuXTtcblxuLy8gVGhlcmUgYXJlIG1hbnkgc3ltYm9scyB3aGljaCBoYXZlIGhpc3RvcmljYWxseSBiZWVuIGF2YWlsYWJsZSB0aHJvdWdoIHRoZVxuLy8gRHlncmFwaCBjbGFzcy4gVGhlc2UgYXJlIGV4cG9ydGVkIGhlcmUgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LlxuRHlncmFwaC5HVml6Q2hhcnQgPSBHVml6Q2hhcnQ7XG5EeWdyYXBoLkRBU0hFRF9MSU5FID0gdXRpbHMuREFTSEVEX0xJTkU7XG5EeWdyYXBoLkRPVF9EQVNIX0xJTkUgPSB1dGlscy5ET1RfREFTSF9MSU5FO1xuRHlncmFwaC5kYXRlQXhpc0xhYmVsRm9ybWF0dGVyID0gdXRpbHMuZGF0ZUF4aXNMYWJlbEZvcm1hdHRlcjtcbkR5Z3JhcGgudG9SR0JfID0gdXRpbHMudG9SR0JfO1xuRHlncmFwaC5maW5kUG9zID0gdXRpbHMuZmluZFBvcztcbkR5Z3JhcGgucGFnZVggPSB1dGlscy5wYWdlWDtcbkR5Z3JhcGgucGFnZVkgPSB1dGlscy5wYWdlWTtcbkR5Z3JhcGguZGF0ZVN0cmluZ18gPSB1dGlscy5kYXRlU3RyaW5nXztcbkR5Z3JhcGguZGVmYXVsdEludGVyYWN0aW9uTW9kZWwgPSBEeWdyYXBoSW50ZXJhY3Rpb24uZGVmYXVsdE1vZGVsO1xuRHlncmFwaC5ub25JbnRlcmFjdGl2ZU1vZGVsID0gRHlncmFwaC5ub25JbnRlcmFjdGl2ZU1vZGVsXyA9IER5Z3JhcGhJbnRlcmFjdGlvbi5ub25JbnRlcmFjdGl2ZU1vZGVsXztcbkR5Z3JhcGguQ2lyY2xlcyA9IHV0aWxzLkNpcmNsZXM7XG5cbkR5Z3JhcGguUGx1Z2lucyA9IHtcbiAgTGVnZW5kOiBMZWdlbmRQbHVnaW4sXG4gIEF4ZXM6IEF4ZXNQbHVnaW4sXG4gIEFubm90YXRpb25zOiBBbm5vdGF0aW9uc1BsdWdpbixcbiAgQ2hhcnRMYWJlbHM6IENoYXJ0TGFiZWxzUGx1Z2luLFxuICBHcmlkOiBHcmlkUGx1Z2luLFxuICBSYW5nZVNlbGVjdG9yOiBSYW5nZVNlbGVjdG9yUGx1Z2luXG59O1xuXG5EeWdyYXBoLkRhdGFIYW5kbGVycyA9IHtcbiAgRGVmYXVsdEhhbmRsZXIsXG4gIEJhcnNIYW5kbGVyLFxuICBDdXN0b21CYXJzSGFuZGxlcixcbiAgRGVmYXVsdEZyYWN0aW9uSGFuZGxlcixcbiAgRXJyb3JCYXJzSGFuZGxlcixcbiAgRnJhY3Rpb25zQmFyc0hhbmRsZXJcbn07XG5cbkR5Z3JhcGguc3RhcnRQYW4gPSBEeWdyYXBoSW50ZXJhY3Rpb24uc3RhcnRQYW47XG5EeWdyYXBoLnN0YXJ0Wm9vbSA9IER5Z3JhcGhJbnRlcmFjdGlvbi5zdGFydFpvb207XG5EeWdyYXBoLm1vdmVQYW4gPSBEeWdyYXBoSW50ZXJhY3Rpb24ubW92ZVBhbjtcbkR5Z3JhcGgubW92ZVpvb20gPSBEeWdyYXBoSW50ZXJhY3Rpb24ubW92ZVpvb207XG5EeWdyYXBoLmVuZFBhbiA9IER5Z3JhcGhJbnRlcmFjdGlvbi5lbmRQYW47XG5EeWdyYXBoLmVuZFpvb20gPSBEeWdyYXBoSW50ZXJhY3Rpb24uZW5kWm9vbTtcblxuRHlncmFwaC5udW1lcmljTGluZWFyVGlja3MgPSBEeWdyYXBoVGlja2Vycy5udW1lcmljTGluZWFyVGlja3M7XG5EeWdyYXBoLm51bWVyaWNUaWNrcyA9IER5Z3JhcGhUaWNrZXJzLm51bWVyaWNUaWNrcztcbkR5Z3JhcGguZGF0ZVRpY2tlciA9IER5Z3JhcGhUaWNrZXJzLmRhdGVUaWNrZXI7XG5EeWdyYXBoLkdyYW51bGFyaXR5ID0gRHlncmFwaFRpY2tlcnMuR3JhbnVsYXJpdHk7XG5EeWdyYXBoLmdldERhdGVBeGlzID0gRHlncmFwaFRpY2tlcnMuZ2V0RGF0ZUF4aXM7XG5EeWdyYXBoLmZsb2F0Rm9ybWF0ID0gdXRpbHMuZmxvYXRGb3JtYXQ7XG5cbnV0aWxzLnNldHVwRE9NcmVhZHlfKER5Z3JhcGgpO1xuXG5leHBvcnQgZGVmYXVsdCBEeWdyYXBoO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFpREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFBdUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBRXZDLFlBQVk7O0FBRVo7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSUEsT0FBTyxHQUFHLFNBQVNBLE9BQU8sQ0FBQ0MsR0FBRyxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRTtFQUM5QyxJQUFJLENBQUNDLFFBQVEsQ0FBQ0gsR0FBRyxFQUFFQyxJQUFJLEVBQUVDLElBQUksQ0FBQztBQUNoQyxDQUFDO0FBRURILE9BQU8sQ0FBQ0ssSUFBSSxHQUFHLFNBQVM7QUFDeEJMLE9BQU8sQ0FBQ00sT0FBTyxHQUFHLE9BQU87O0FBRXpCO0FBQ0EsSUFBSUMsV0FBVyxHQUFHLENBQUMsQ0FBQztBQUNwQlAsT0FBTyxDQUFDUSxRQUFRLEdBQUcsU0FBU0MsT0FBTyxDQUFDQyxJQUFJLEVBQUU7RUFDeEMsT0FBUUEsSUFBSSxJQUFJSCxXQUFXLEdBQUdBLFdBQVcsQ0FBQ0csSUFBSSxDQUFDLEdBQUdWLE9BQU8sQ0FBQ1EsUUFBUSxDQUFDRyxFQUFFLENBQUNELElBQUksQ0FBQztBQUM3RSxDQUFDO0FBQ0RWLE9BQU8sQ0FBQ1EsUUFBUSxD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