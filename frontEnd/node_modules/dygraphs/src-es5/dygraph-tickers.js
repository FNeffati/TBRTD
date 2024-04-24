/**
 * @license
 * Copyright 2011 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licenced: https://opensource.org/licenses/MIT
 */

/**
 * @fileoverview Description of this file.
 * @author danvk@google.com (Dan Vanderkam)
 */

/*
 * A ticker is a function with the following interface:
 *
 * function(a, b, pixels, options_view, dygraph, forced_values);
 * -> [ { v: tick1_v, label: tick1_label[, label_v: label_v1] },
 *      { v: tick2_v, label: tick2_label[, label_v: label_v2] },
 *      ...
 *    ]
 *
 * The returned value is called a "tick list".
 *
 * Arguments
 * ---------
 *
 * [a, b] is the range of the axis for which ticks are being generated. For a
 * numeric axis, these will simply be numbers. For a date axis, these will be
 * millis since epoch (convertable to Date objects using "new Date(a)" and "new
 * Date(b)").
 *
 * opts provides access to chart- and axis-specific options. It can be used to
 * access number/date formatting code/options, check for a log scale, etc.
 *
 * pixels is the length of the axis in pixels. opts('pixelsPerLabel') is the
 * minimum amount of space to be allotted to each label. For instance, if
 * pixels=400 and opts('pixelsPerLabel')=40 then the ticker should return
 * between zero and ten (400/40) ticks.
 *
 * dygraph is the Dygraph object for which an axis is being constructed.
 *
 * forced_values is used for secondary y-axes. The tick positions are typically
 * set by the primary y-axis, so the secondary y-axis has no choice in where to
 * put these. It simply has to generate labels for these data values.
 *
 * Tick lists
 * ----------
 * Typically a tick will have both a grid/tick line and a label at one end of
 * that line (at the bottom for an x-axis, at left or right for the y-axis).
 *
 * A tick may be missing one of these two components:
 * - If "label_v" is specified instead of "v", then there will be no tick or
 *   gridline, just a label.
 * - Similarly, if "label" is not specified, then there will be a gridline
 *   without a label.
 *
 * This flexibility is useful in a few situations:
 * - For log scales, some of the tick lines may be too close to all have labels.
 * - For date scales where years are being displayed, it is desirable to display
 *   tick marks at the beginnings of years but labels (e.g. "2006") in the
 *   middle of the years.
 */

/*jshint sub:true */
/*global Dygraph:false */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pickDateTickGranularity = exports.numericTicks = exports.numericLinearTicks = exports.getDateAxis = exports.dateTicker = exports.Granularity = void 0;
var utils = _interopRequireWildcard(require("./dygraph-utils"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/** @typedef {Array.<{v:number, label:string, label_v:(string|undefined)}>} */
var TickList = undefined; // the ' = undefined' keeps jshint happy.

/** @typedef {function(
 *    number,
 *    number,
 *    number,
 *    function(string):*,
 *    Dygraph=,
 *    Array.<number>=
 *  ): TickList}
 */
var Ticker = undefined; // the ' = undefined' keeps jshint happy.

/** @type {Ticker} */
var numericLinearTicks = function numericLinearTicks(a, b, pixels, opts, dygraph, vals) {
  var nonLogscaleOpts = function nonLogscaleOpts(opt) {
    if (opt === 'logscale') return false;
    return opts(opt);
  };
  return numericTicks(a, b, pixels, nonLogscaleOpts, dygraph, vals);
};

/** @type {Ticker} */
exports.numericLinearTicks = numericLinearTicks;
var numericTicks = function numericTicks(a, b, pixels, opts, dygraph, vals) {
  var pixels_per_tick = /** @type{number} */opts('pixelsPerLabel');
  var ticks = [];
  var i, j, tickV, nTicks;
  if (vals) {
    for (i = 0; i < vals.length; i++) {
      ticks.push({
        v: vals[i]
      });
    }
  } else {
    // TODO(danvk): factor this log-scale block out into a separate function.
    if (opts("logscale")) {
      nTicks = Math.floor(pixels / pixels_per_tick);
      var minIdx = utils.binarySearch(a, PREFERRED_LOG_TICK_VALUES, 1);
      var maxIdx = utils.binarySearch(b, PREFERRED_LOG_TICK_VALUES, -1);
      if (minIdx == -1) {
        minIdx = 0;
      }
      if (maxIdx == -1) {
        maxIdx = PREFERRED_LOG_TICK_VALUES.length - 1;
      }
      // Count the number of tick values would appear, if we can get at least
      // nTicks / 4 accept them.
      var lastDisplayed = null;
      if (maxIdx - minIdx >= nTicks / 4) {
        for (var idx = maxIdx; idx >= minIdx; idx--) {
          var tickValue = PREFERRED_LOG_TICK_VALUES[idx];
          var pixel_coord = Math.log(tickValue / a) / Math.log(b / a) * pixels;
          var tick = {
            v: tickValue
          };
          if (lastDisplayed === null) {
            lastDisplayed = {
              tickValue: tickValue,
              pixel_coord: pixel_coord
            };
          } else {
            if (Math.abs(pixel_coord - lastDisplayed.pixel_coord) >= pixels_per_tick) {
              lastDisplayed = {
                tickValue: tickValue,
                pixel_coord: pixel_coord
              };
            } else {
              tick.label = "";
            }
          }
          ticks.push(tick);
        }
        // Since we went in backwards order.
        ticks.reverse();
      }
    }

    // ticks.length won't be 0 if the log scale function finds values to insert.
    if (ticks.length === 0) {
      // Basic idea:
      // Try labels every 1, 2, 5, 10, 20, 50, 100, etc.
      // Calculate the resulting tick spacing (i.e. this.height_ / nTicks).
      // The first spacing greater than pixelsPerYLabel is what we use.
      // TODO(danvk): version that works on a log scale.
      var kmg2 = opts("labelsKMG2");
      var mults, base;
      if (kmg2) {
        mults = [1, 2, 4, 8, 16, 32, 64, 128, 256];
        base = 16;
      } else {
        mults = [1, 2, 5, 10, 20, 50, 100];
        base = 10;
      }

      // Get the maximum number of permitted ticks based on the
      // graph's pixel size and pixels_per_tick setting.
      var max_ticks = Math.ceil(pixels / pixels_per_tick);

      // Now calculate the data unit equivalent of this tick spacing.
      // Use abs() since graphs may have a reversed Y axis.
      var units_per_tick = Math.abs(b - a) / max_ticks;

      // Based on this, get a starting scale which is the largest
      // integer power of the chosen base (10 or 16) that still remains
      // below the requested pixels_per_tick spacing.
      var base_power = Math.floor(Math.log(units_per_tick) / Math.log(base));
      var base_scale = Math.pow(base, base_power);

      // Now try multiples of the starting scale until we find one
      // that results in tick marks spaced sufficiently far apart.
      // The "mults" array should cover the range 1 .. base^2 to
      // adjust for rounding and edge effects.
      var scale, low_val, high_val, spacing;
      for (j = 0; j < mults.length; j++) {
        scale = base_scale * mults[j];
        low_val = Math.floor(a / scale) * scale;
        high_val = Math.ceil(b / scale) * scale;
        nTicks = Math.abs(high_val - low_val) / scale;
        spacing = pixels / nTicks;
        if (spacing > pixels_per_tick) break;
      }

      // Construct the set of ticks.
      // Allow reverse y-axis if it's explicitly requested.
      if (low_val > high_val) scale *= -1;
      for (i = 0; i <= nTicks; i++) {
        tickV = low_val + i * scale;
        ticks.push({
          v: tickV
        });
      }
    }
  }
  var formatter = /**@type{AxisLabelFormatter}*/opts('axisLabelFormatter');

  // Add labels to the ticks.
  for (i = 0; i < ticks.length; i++) {
    if (ticks[i].label !== undefined) continue; // Use current label.
    // TODO(danvk): set granularity to something appropriate here.
    ticks[i].label = formatter.call(dygraph, ticks[i].v, 0, opts, dygraph);
  }
  return ticks;
};

/** @type {Ticker} */
exports.numericTicks = numericTicks;
var dateTicker = function dateTicker(a, b, pixels, opts, dygraph, vals) {
  var chosen = pickDateTickGranularity(a, b, pixels, opts);
  if (chosen >= 0) {
    return getDateAxis(a, b, chosen, opts, dygraph);
  } else {
    // this can happen if self.width_ is zero.
    return [];
  }
};

// Time granularity enumeration
exports.dateTicker = dateTicker;
var Granularity = {
  MILLISECONDLY: 0,
  TWO_MILLISECONDLY: 1,
  FIVE_MILLISECONDLY: 2,
  TEN_MILLISECONDLY: 3,
  FIFTY_MILLISECONDLY: 4,
  HUNDRED_MILLISECONDLY: 5,
  FIVE_HUNDRED_MILLISECONDLY: 6,
  SECONDLY: 7,
  TWO_SECONDLY: 8,
  FIVE_SECONDLY: 9,
  TEN_SECONDLY: 10,
  THIRTY_SECONDLY: 11,
  MINUTELY: 12,
  TWO_MINUTELY: 13,
  FIVE_MINUTELY: 14,
  TEN_MINUTELY: 15,
  THIRTY_MINUTELY: 16,
  HOURLY: 17,
  TWO_HOURLY: 18,
  SIX_HOURLY: 19,
  DAILY: 20,
  TWO_DAILY: 21,
  WEEKLY: 22,
  MONTHLY: 23,
  QUARTERLY: 24,
  BIANNUAL: 25,
  ANNUAL: 26,
  DECADAL: 27,
  CENTENNIAL: 28,
  NUM_GRANULARITIES: 29
};

// Date components enumeration (in the order of the arguments in Date)
// TODO: make this an @enum
exports.Granularity = Granularity;
var DateField = {
  DATEFIELD_Y: 0,
  DATEFIELD_M: 1,
  DATEFIELD_D: 2,
  DATEFIELD_HH: 3,
  DATEFIELD_MM: 4,
  DATEFIELD_SS: 5,
  DATEFIELD_MS: 6,
  NUM_DATEFIELDS: 7
};

/**
 * The value of datefield will start at an even multiple of "step", i.e.
 *   if datefield=SS and step=5 then the first tick will be on a multiple of 5s.
 *
 * For granularities <= HOURLY, ticks are generated every `spacing` ms.
 *
 * At coarser granularities, ticks are generated by incrementing `datefield` by
 *   `step`. In this case, the `spacing` value is only used to estimate the
 *   number of ticks. It should roughly correspond to the spacing between
 *   adjacent ticks.
 *
 * @type {Array.<{datefield:number, step:number, spacing:number}>}
 */
var TICK_PLACEMENT = [];
TICK_PLACEMENT[Granularity.MILLISECONDLY] = {
  datefield: DateField.DATEFIELD_MS,
  step: 1,
  spacing: 1
};
TICK_PLACEMENT[Granularity.TWO_MILLISECONDLY] = {
  datefield: DateField.DATEFIELD_MS,
  step: 2,
  spacing: 2
};
TICK_PLACEMENT[Granularity.FIVE_MILLISECONDLY] = {
  datefield: DateField.DATEFIELD_MS,
  step: 5,
  spacing: 5
};
TICK_PLACEMENT[Granularity.TEN_MILLISECONDLY] = {
  datefield: DateField.DATEFIELD_MS,
  step: 10,
  spacing: 10
};
TICK_PLACEMENT[Granularity.FIFTY_MILLISECONDLY] = {
  datefield: DateField.DATEFIELD_MS,
  step: 50,
  spacing: 50
};
TICK_PLACEMENT[Granularity.HUNDRED_MILLISECONDLY] = {
  datefield: DateField.DATEFIELD_MS,
  step: 100,
  spacing: 100
};
TICK_PLACEMENT[Granularity.FIVE_HUNDRED_MILLISECONDLY] = {
  datefield: DateField.DATEFIELD_MS,
  step: 500,
  spacing: 500
};
TICK_PLACEMENT[Granularity.SECONDLY] = {
  datefield: DateField.DATEFIELD_SS,
  step: 1,
  spacing: 1000 * 1
};
TICK_PLACEMENT[Granularity.TWO_SECONDLY] = {
  datefield: DateField.DATEFIELD_SS,
  step: 2,
  spacing: 1000 * 2
};
TICK_PLACEMENT[Granularity.FIVE_SECONDLY] = {
  datefield: DateField.DATEFIELD_SS,
  step: 5,
  spacing: 1000 * 5
};
TICK_PLACEMENT[Granularity.TEN_SECONDLY] = {
  datefield: DateField.DATEFIELD_SS,
  step: 10,
  spacing: 1000 * 10
};
TICK_PLACEMENT[Granularity.THIRTY_SECONDLY] = {
  datefield: DateField.DATEFIELD_SS,
  step: 30,
  spacing: 1000 * 30
};
TICK_PLACEMENT[Granularity.MINUTELY] = {
  datefield: DateField.DATEFIELD_MM,
  step: 1,
  spacing: 1000 * 60
};
TICK_PLACEMENT[Granularity.TWO_MINUTELY] = {
  datefield: DateField.DATEFIELD_MM,
  step: 2,
  spacing: 1000 * 60 * 2
};
TICK_PLACEMENT[Granularity.FIVE_MINUTELY] = {
  datefield: DateField.DATEFIELD_MM,
  step: 5,
  spacing: 1000 * 60 * 5
};
TICK_PLACEMENT[Granularity.TEN_MINUTELY] = {
  datefield: DateField.DATEFIELD_MM,
  step: 10,
  spacing: 1000 * 60 * 10
};
TICK_PLACEMENT[Granularity.THIRTY_MINUTELY] = {
  datefield: DateField.DATEFIELD_MM,
  step: 30,
  spacing: 1000 * 60 * 30
};
TICK_PLACEMENT[Granularity.HOURLY] = {
  datefield: DateField.DATEFIELD_HH,
  step: 1,
  spacing: 1000 * 3600
};
TICK_PLACEMENT[Granularity.TWO_HOURLY] = {
  datefield: DateField.DATEFIELD_HH,
  step: 2,
  spacing: 1000 * 3600 * 2
};
TICK_PLACEMENT[Granularity.SIX_HOURLY] = {
  datefield: DateField.DATEFIELD_HH,
  step: 6,
  spacing: 1000 * 3600 * 6
};
TICK_PLACEMENT[Granularity.DAILY] = {
  datefield: DateField.DATEFIELD_D,
  step: 1,
  spacing: 1000 * 86400
};
TICK_PLACEMENT[Granularity.TWO_DAILY] = {
  datefield: DateField.DATEFIELD_D,
  step: 2,
  spacing: 1000 * 86400 * 2
};
TICK_PLACEMENT[Granularity.WEEKLY] = {
  datefield: DateField.DATEFIELD_D,
  step: 7,
  spacing: 1000 * 604800
};
TICK_PLACEMENT[Granularity.MONTHLY] = {
  datefield: DateField.DATEFIELD_M,
  step: 1,
  spacing: 1000 * 7200 * 365.2425
}; // 1e3 * 60 * 60 * 24 * 365.2425 / 12
TICK_PLACEMENT[Granularity.QUARTERLY] = {
  datefield: DateField.DATEFIELD_M,
  step: 3,
  spacing: 1000 * 21600 * 365.2425
}; // 1e3 * 60 * 60 * 24 * 365.2425 / 4
TICK_PLACEMENT[Granularity.BIANNUAL] = {
  datefield: DateField.DATEFIELD_M,
  step: 6,
  spacing: 1000 * 43200 * 365.2425
}; // 1e3 * 60 * 60 * 24 * 365.2425 / 2
TICK_PLACEMENT[Granularity.ANNUAL] = {
  datefield: DateField.DATEFIELD_Y,
  step: 1,
  spacing: 1000 * 86400 * 365.2425
}; // 1e3 * 60 * 60 * 24 * 365.2425 * 1
TICK_PLACEMENT[Granularity.DECADAL] = {
  datefield: DateField.DATEFIELD_Y,
  step: 10,
  spacing: 1000 * 864000 * 365.2425
}; // 1e3 * 60 * 60 * 24 * 365.2425 * 10
TICK_PLACEMENT[Granularity.CENTENNIAL] = {
  datefield: DateField.DATEFIELD_Y,
  step: 100,
  spacing: 1000 * 8640000 * 365.2425
}; // 1e3 * 60 * 60 * 24 * 365.2425 * 100

/**
 * This is a list of human-friendly values at which to show tick marks on a log
 * scale. It is k * 10^n, where k=1..9 and n=-39..+39, so:
 * ..., 1, 2, 3, 4, 5, ..., 9, 10, 20, 30, ..., 90, 100, 200, 300, ...
 * NOTE: this assumes that utils.LOG_SCALE = 10.
 * @type {Array.<number>}
 */
var PREFERRED_LOG_TICK_VALUES = function () {
  var vals = [];
  for (var power = -39; power <= 39; power++) {
    var range = Math.pow(10, power);
    for (var mult = 1; mult <= 9; mult++) {
      var val = range * mult;
      vals.push(val);
    }
  }
  return vals;
}();

/**
 * Determine the correct granularity of ticks on a date axis.
 *
 * @param {number} a Left edge of the chart (ms)
 * @param {number} b Right edge of the chart (ms)
 * @param {number} pixels Size of the chart in the relevant dimension (width).
 * @param {function(string):*} opts Function mapping from option name -&gt; value.
 * @return {number} The appropriate axis granularity for this chart. See the
 *     enumeration of possible values in dygraph-tickers.js.
 */
var pickDateTickGranularity = function pickDateTickGranularity(a, b, pixels, opts) {
  var pixels_per_tick = /** @type{number} */opts('pixelsPerLabel');
  for (var i = 0; i < Granularity.NUM_GRANULARITIES; i++) {
    var num_ticks = numDateTicks(a, b, i);
    if (pixels / num_ticks >= pixels_per_tick) {
      return i;
    }
  }
  return -1;
};

/**
 * Compute the number of ticks on a date axis for a given granularity.
 * @param {number} start_time
 * @param {number} end_time
 * @param {number} granularity (one of the granularities enumerated above)
 * @return {number} (Approximate) number of ticks that would result.
 */
exports.pickDateTickGranularity = pickDateTickGranularity;
var numDateTicks = function numDateTicks(start_time, end_time, granularity) {
  var spacing = TICK_PLACEMENT[granularity].spacing;
  return Math.round(1.0 * (end_time - start_time) / spacing);
};

/**
 * Compute the positions and labels of ticks on a date axis for a given granularity.
 * @param {number} start_time
 * @param {number} end_time
 * @param {number} granularity (one of the granularities enumerated above)
 * @param {function(string):*} opts Function mapping from option name -&gt; value.
 * @param {Dygraph=} dg
 * @return {!TickList}
 */
var getDateAxis = function getDateAxis(start_time, end_time, granularity, opts, dg) {
  var formatter = /** @type{AxisLabelFormatter} */
  opts("axisLabelFormatter");
  var utc = opts("labelsUTC");
  var accessors = utc ? utils.DateAccessorsUTC : utils.DateAccessorsLocal;
  var datefield = TICK_PLACEMENT[granularity].datefield;
  var step = TICK_PLACEMENT[granularity].step;
  var spacing = TICK_PLACEMENT[granularity].spacing;

  // Choose a nice tick position before the initial instant.
  // Currently, this code deals properly with the existent daily granularities:
  // DAILY (with step of 1) and WEEKLY (with step of 7 but specially handled).
  // Other daily granularities (say TWO_DAILY) should also be handled specially
  // by setting the start_date_offset to 0.
  var start_date = new Date(start_time);
  var date_array = [];
  date_array[DateField.DATEFIELD_Y] = accessors.getFullYear(start_date);
  date_array[DateField.DATEFIELD_M] = accessors.getMonth(start_date);
  date_array[DateField.DATEFIELD_D] = accessors.getDate(start_date);
  date_array[DateField.DATEFIELD_HH] = accessors.getHours(start_date);
  date_array[DateField.DATEFIELD_MM] = accessors.getMinutes(start_date);
  date_array[DateField.DATEFIELD_SS] = accessors.getSeconds(start_date);
  date_array[DateField.DATEFIELD_MS] = accessors.getMilliseconds(start_date);
  var start_date_offset = date_array[datefield] % step;
  if (granularity == Granularity.WEEKLY) {
    // This will put the ticks on Sundays.
    start_date_offset = accessors.getDay(start_date);
  }
  date_array[datefield] -= start_date_offset;
  for (var df = datefield + 1; df < DateField.NUM_DATEFIELDS; df++) {
    // The minimum value is 1 for the day of month, and 0 for all other fields.
    date_array[df] = df === DateField.DATEFIELD_D ? 1 : 0;
  }

  // Generate the ticks.
  // For granularities not coarser than HOURLY we use the fact that:
  //   the number of milliseconds between ticks is constant
  //   and equal to the defined spacing.
  // Otherwise we rely on the 'roll over' property of the Date functions:
  //   when some date field is set to a value outside of its logical range,
  //   the excess 'rolls over' the next (more significant) field.
  // However, when using local time with DST transitions,
  // there are dates that do not represent any time value at all
  // (those in the hour skipped at the 'spring forward'),
  // and the JavaScript engines usually return an equivalent value.
  // Hence we have to check that the date is properly increased at each step,
  // returning a date at a nice tick position.
  var ticks = [];
  var tick_date = accessors.makeDate.apply(null, date_array);
  var tick_time = tick_date.getTime();
  if (granularity <= Granularity.HOURLY) {
    if (tick_time < start_time) {
      tick_time += spacing;
      tick_date = new Date(tick_time);
    }
    while (tick_time <= end_time) {
      ticks.push({
        v: tick_time,
        label: formatter.call(dg, tick_date, granularity, opts, dg)
      });
      tick_time += spacing;
      tick_date = new Date(tick_time);
    }
  } else {
    if (tick_time < start_time) {
      date_array[datefield] += step;
      tick_date = accessors.makeDate.apply(null, date_array);
      tick_time = tick_date.getTime();
    }
    while (tick_time <= end_time) {
      if (granularity >= Granularity.DAILY || accessors.getHours(tick_date) % step === 0) {
        ticks.push({
          v: tick_time,
          label: formatter.call(dg, tick_date, granularity, opts, dg)
        });
      }
      date_array[datefield] += step;
      tick_date = accessors.makeDate.apply(null, date_array);
      tick_time = tick_date.getTime();
    }
  }
  return ticks;
};
exports.getDateAxis = getDateAxis;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUaWNrTGlzdCIsInVuZGVmaW5lZCIsIlRpY2tlciIsIm51bWVyaWNMaW5lYXJUaWNrcyIsImEiLCJiIiwicGl4ZWxzIiwib3B0cyIsImR5Z3JhcGgiLCJ2YWxzIiwibm9uTG9nc2NhbGVPcHRzIiwib3B0IiwibnVtZXJpY1RpY2tzIiwicGl4ZWxzX3Blcl90aWNrIiwidGlja3MiLCJpIiwiaiIsInRpY2tWIiwiblRpY2tzIiwibGVuZ3RoIiwicHVzaCIsInYiLCJNYXRoIiwiZmxvb3IiLCJtaW5JZHgiLCJ1dGlscyIsImJpbmFyeVNlYXJjaCIsIlBSRUZFUlJFRF9MT0dfVElDS19WQUxVRVMiLCJtYXhJZHgiLCJsYXN0RGlzcGxheWVkIiwiaWR4IiwidGlja1ZhbHVlIiwicGl4ZWxfY29vcmQiLCJsb2ciLCJ0aWNrIiwiYWJzIiwibGFiZWwiLCJyZXZlcnNlIiwia21nMiIsIm11bHRzIiwiYmFzZSIsIm1heF90aWNrcyIsImNlaWwiLCJ1bml0c19wZXJfdGljayIsImJhc2VfcG93ZXIiLCJiYXNlX3NjYWxlIiwicG93Iiwic2NhbGUiLCJsb3dfdmFsIiwiaGlnaF92YWwiLCJzcGFjaW5nIiwiZm9ybWF0dGVyIiwiY2FsbCIsImRhdGVUaWNrZXIiLCJjaG9zZW4iLCJwaWNrRGF0ZVRpY2tHcmFudWxhcml0eSIsImdldERhdGVBeGlzIiwiR3JhbnVsYXJpdHkiLCJNSUxMSVNFQ09ORExZIiwiVFdPX01JTExJU0VDT05ETFkiLCJGSVZFX01JTExJU0VDT05ETFkiLCJURU5fTUlMTElTRUNPTkRMWSIsIkZJRlRZX01JTExJU0VDT05ETFkiLCJIVU5EUkVEX01JTExJU0VDT05ETFkiLCJGSVZFX0hVTkRSRURfTUlMTElTRUNPTkRMWSIsIlNFQ09ORExZIiwiVFdPX1NFQ09ORExZIiwiRklWRV9TRUNPTkRMWSIsIlRFTl9TRUNPTkRMWSIsIlRISVJUWV9TRUNPTkRMWSIsIk1JTlVURUxZIiwiVFdPX01JTlVURUxZIiwiRklWRV9NSU5VVEVMWSIsIlRFTl9NSU5VVEVMWSIsIlRISVJUWV9NSU5VVEVMWSIsIkhPVVJMWSIsIlRXT19IT1VSTFkiLCJTSVhfSE9VUkxZIiwiREFJTFkiLCJUV09fREFJTFkiLCJXRUVLTFkiLCJNT05USExZIiwiUVVBUlRFUkxZIiwiQklBTk5VQUwiLCJBTk5VQUwiLCJERUNBREFMIiwiQ0VOVEVOTklBTCIsIk5VTV9HUkFOVUxBUklUSUVTIiwiRGF0ZUZpZWxkIiwiREFURUZJRUxEX1kiLCJEQVRFRklFTERfTSIsIkRBVEVGSUVMRF9EIiwiREFURUZJRUxEX0hIIiwiREFURUZJRUxEX01NIiwiREFURUZJRUxEX1NTIiwiREFURUZJRUxEX01TIiwiTlVNX0RBVEVGSUVMRFMiLCJUSUNLX1BMQUNFTUVOVCIsImRhdGVmaWVsZCIsInN0ZXAiLCJwb3dlciIsInJhbmdlIiwibXVsdCIsInZhbCIsIm51bV90aWNrcyIsIm51bURhdGVUaWNrcyIsInN0YXJ0X3RpbWUiLCJlbmRfdGltZSIsImdyYW51bGFyaXR5Iiwicm91bmQiLCJkZyIsInV0YyIsImFjY2Vzc29ycyIsIkRhdGVBY2Nlc3NvcnNVVEMiLCJEYXRlQWNjZXNzb3JzTG9jYWwiLCJzdGFydF9kYXRlIiwiRGF0ZSIsImRhdGVfYXJyYXkiLCJnZXRGdWxsWWVhciIsImdldE1vbnRoIiwiZ2V0RGF0ZSIsImdldEhvdXJzIiwiZ2V0TWludXRlcyIsImdldFNlY29uZHMiLCJnZXRNaWxsaXNlY29uZHMiLCJzdGFydF9kYXRlX29mZnNldCIsImdldERheSIsImRmIiwidGlja19kYXRlIiwibWFrZURhdGUiLCJhcHBseSIsInRpY2tfdGltZSIsImdldFRpbWUiXSwic291cmNlcyI6WyIuLi9zcmMvZHlncmFwaC10aWNrZXJzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDExIERhbiBWYW5kZXJrYW0gKGRhbnZka0BnbWFpbC5jb20pXG4gKiBNSVQtbGljZW5jZWQ6IGh0dHBzOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IERlc2NyaXB0aW9uIG9mIHRoaXMgZmlsZS5cbiAqIEBhdXRob3IgZGFudmtAZ29vZ2xlLmNvbSAoRGFuIFZhbmRlcmthbSlcbiAqL1xuXG4vKlxuICogQSB0aWNrZXIgaXMgYSBmdW5jdGlvbiB3aXRoIHRoZSBmb2xsb3dpbmcgaW50ZXJmYWNlOlxuICpcbiAqIGZ1bmN0aW9uKGEsIGIsIHBpeGVscywgb3B0aW9uc192aWV3LCBkeWdyYXBoLCBmb3JjZWRfdmFsdWVzKTtcbiAqIC0+IFsgeyB2OiB0aWNrMV92LCBsYWJlbDogdGljazFfbGFiZWxbLCBsYWJlbF92OiBsYWJlbF92MV0gfSxcbiAqICAgICAgeyB2OiB0aWNrMl92LCBsYWJlbDogdGljazJfbGFiZWxbLCBsYWJlbF92OiBsYWJlbF92Ml0gfSxcbiAqICAgICAgLi4uXG4gKiAgICBdXG4gKlxuICogVGhlIHJldHVybmVkIHZhbHVlIGlzIGNhbGxlZCBhIFwidGljayBsaXN0XCIuXG4gKlxuICogQXJndW1lbnRzXG4gKiAtLS0tLS0tLS1cbiAqXG4gKiBbYSwgYl0gaXMgdGhlIHJhbmdlIG9mIHRoZSBheGlzIGZvciB3aGljaCB0aWNrcyBhcmUgYmVpbmcgZ2VuZXJhdGVkLiBGb3IgYVxuICogbnVtZXJpYyBheGlzLCB0aGVzZSB3aWxsIHNpbXBseSBiZSBudW1iZXJzLiBGb3IgYSBkYXRlIGF4aXMsIHRoZXNlIHdpbGwgYmVcbiAqIG1pbGxpcyBzaW5jZSBlcG9jaCAoY29udmVydGFibGUgdG8gRGF0ZSBvYmplY3RzIHVzaW5nIFwibmV3IERhdGUoYSlcIiBhbmQgXCJuZXdcbiAqIERhdGUoYilcIikuXG4gKlxuICogb3B0cyBwcm92aWRlcyBhY2Nlc3MgdG8gY2hhcnQtIGFuZCBheGlzLXNwZWNpZmljIG9wdGlvbnMuIEl0IGNhbiBiZSB1c2VkIHRvXG4gKiBhY2Nlc3MgbnVtYmVyL2RhdGUgZm9ybWF0dGluZyBjb2RlL29wdGlvbnMsIGNoZWNrIGZvciBhIGxvZyBzY2FsZSwgZXRjLlxuICpcbiAqIHBpeGVscyBpcyB0aGUgbGVuZ3RoIG9mIHRoZSBheGlzIGluIHBpeGVscy4gb3B0cygncGl4ZWxzUGVyTGFiZWwnKSBpcyB0aGVcbiAqIG1pbmltdW0gYW1vdW50IG9mIHNwYWNlIHRvIGJlIGFsbG90dGVkIHRvIGVhY2ggbGFiZWwuIEZvciBpbnN0YW5jZSwgaWZcbiAqIHBpeGVscz00MDAgYW5kIG9wdHMoJ3BpeGVsc1BlckxhYmVsJyk9NDAgdGhlbiB0aGUgdGlja2VyIHNob3VsZCByZXR1cm5cbiAqIGJldHdlZW4gemVybyBhbmQgdGVuICg0MDAvNDApIHRpY2tzLlxuICpcbiAqIGR5Z3JhcGggaXMgdGhlIER5Z3JhcGggb2JqZWN0IGZvciB3aGljaCBhbiBheGlzIGlzIGJlaW5nIGNvbnN0cnVjdGVkLlxuICpcbiAqIGZvcmNlZF92YWx1ZXMgaXMgdXNlZCBmb3Igc2Vjb25kYXJ5IHktYXhlcy4gVGhlIHRpY2sgcG9zaXRpb25zIGFyZSB0eXBpY2FsbHlcbiAqIHNldCBieSB0aGUgcHJpbWFyeSB5LWF4aXMsIHNvIHRoZSBzZWNvbmRhcnkgeS1heGlzIGhhcyBubyBjaG9pY2UgaW4gd2hlcmUgdG9cbiAqIHB1dCB0aGVzZS4gSXQgc2ltcGx5IGhhcyB0byBnZW5lcmF0ZSBsYWJlbHMgZm9yIHRoZXNlIGRhdGEgdmFsdWVzLlxuICpcbiAqIFRpY2sgbGlzdHNcbiAqIC0tLS0tLS0tLS1cbiAqIFR5cGljYWxseSBhIHRpY2sgd2lsbCBoYXZlIGJvdGggYSBncmlkL3RpY2sgbGluZSBhbmQgYSBsYWJlbCBhdCBvbmUgZW5kIG9mXG4gKiB0aGF0IGxpbmUgKGF0IHRoZSBib3R0b20gZm9yIGFuIHgtYXhpcywgYXQgbGVmdCBvciByaWdodCBmb3IgdGhlIHktYXhpcykuXG4gKlxuICogQSB0aWNrIG1heSBiZSBtaXNzaW5nIG9uZSBvZiB0aGVzZSB0d28gY29tcG9uZW50czpcbiAqIC0gSWYgXCJsYWJlbF92XCIgaXMgc3BlY2lmaWVkIGluc3RlYWQgb2YgXCJ2XCIsIHRoZW4gdGhlcmUgd2lsbCBiZSBubyB0aWNrIG9yXG4gKiAgIGdyaWRsaW5lLCBqdXN0IGEgbGFiZWwuXG4gKiAtIFNpbWlsYXJseSwgaWYgXCJsYWJlbFwiIGlzIG5vdCBzcGVjaWZpZWQsIHRoZW4gdGhlcmUgd2lsbCBiZSBhIGdyaWRsaW5lXG4gKiAgIHdpdGhvdXQgYSBsYWJlbC5cbiAqXG4gKiBUaGlzIGZsZXhpYmlsaXR5IGlzIHVzZWZ1bCBpbiBhIGZldyBzaXR1YXRpb25zOlxuICogLSBGb3IgbG9nIHNjYWxlcywgc29tZSBvZiB0aGUgdGljayBsaW5lcyBtYXkgYmUgdG9vIGNsb3NlIHRvIGFsbCBoYXZlIGxhYmVscy5cbiAqIC0gRm9yIGRhdGUgc2NhbGVzIHdoZXJlIHllYXJzIGFyZSBiZWluZyBkaXNwbGF5ZWQsIGl0IGlzIGRlc2lyYWJsZSB0byBkaXNwbGF5XG4gKiAgIHRpY2sgbWFya3MgYXQgdGhlIGJlZ2lubmluZ3Mgb2YgeWVhcnMgYnV0IGxhYmVscyAoZS5nLiBcIjIwMDZcIikgaW4gdGhlXG4gKiAgIG1pZGRsZSBvZiB0aGUgeWVhcnMuXG4gKi9cblxuLypqc2hpbnQgc3ViOnRydWUgKi9cbi8qZ2xvYmFsIER5Z3JhcGg6ZmFsc2UgKi9cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tICcuL2R5Z3JhcGgtdXRpbHMnO1xuXG4vKiogQHR5cGVkZWYge0FycmF5Ljx7djpudW1iZXIsIGxhYmVsOnN0cmluZywgbGFiZWxfdjooc3RyaW5nfHVuZGVmaW5lZCl9Pn0gKi9cbnZhciBUaWNrTGlzdCA9IHVuZGVmaW5lZDsgIC8vIHRoZSAnID0gdW5kZWZpbmVkJyBrZWVwcyBqc2hpbnQgaGFwcHkuXG5cbi8qKiBAdHlwZWRlZiB7ZnVuY3Rpb24oXG4gKiAgICBudW1iZXIsXG4gKiAgICBudW1iZXIsXG4gKiAgICBudW1iZXIsXG4gKiAgICBmdW5jdGlvbihzdHJpbmcpOiosXG4gKiAgICBEeWdyYXBoPSxcbiAqICAgIEFycmF5LjxudW1iZXI+PVxuICogICk6IFRpY2tMaXN0fVxuICovXG52YXIgVGlja2VyID0gdW5kZWZpbmVkOyAgLy8gdGhlICcgPSB1bmRlZmluZWQnIGtlZXBzIGpzaGludCBoYXBweS5cblxuLyoqIEB0eXBlIHtUaWNrZXJ9ICovXG5leHBvcnQgdmFyIG51bWVyaWNMaW5lYXJUaWNrcyA9IGZ1bmN0aW9uKGEsIGIsIHBpeGVscywgb3B0cywgZHlncmFwaCwgdmFscykge1xuICB2YXIgbm9uTG9nc2NhbGVPcHRzID0gZnVuY3Rpb24ob3B0KSB7XG4gICAgaWYgKG9wdCA9PT0gJ2xvZ3NjYWxlJykgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiBvcHRzKG9wdCk7XG4gIH07XG4gIHJldHVybiBudW1lcmljVGlja3MoYSwgYiwgcGl4ZWxzLCBub25Mb2dzY2FsZU9wdHMsIGR5Z3JhcGgsIHZhbHMpO1xufTtcblxuLyoqIEB0eXBlIHtUaWNrZXJ9ICovXG5leHBvcnQgdmFyIG51bWVyaWNUaWNrcyA9IGZ1bmN0aW9uKGEsIGIsIHBpeGVscywgb3B0cywgZHlncmFwaCwgdmFscykge1xuICB2YXIgcGl4ZWxzX3Blcl90aWNrID0gLyoqIEB0eXBle251bWJlcn0gKi8ob3B0cygncGl4ZWxzUGVyTGFiZWwnKSk7XG4gIHZhciB0aWNrcyA9IFtdO1xuICB2YXIgaSwgaiwgdGlja1YsIG5UaWNrcztcbiAgaWYgKHZhbHMpIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgdmFscy5sZW5ndGg7IGkrKykge1xuICAgICAgdGlja3MucHVzaCh7djogdmFsc1tpXX0pO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBUT0RPKGRhbnZrKTogZmFjdG9yIHRoaXMgbG9nLXNjYWxlIGJsb2NrIG91dCBpbnRvIGEgc2VwYXJhdGUgZnVuY3Rpb24uXG4gICAgaWYgKG9wdHMoXCJsb2dzY2FsZVwiKSkge1xuICAgICAgblRpY2tzICA9IE1hdGguZmxvb3IocGl4ZWxzIC8gcGl4ZWxzX3Blcl90aWNrKTtcbiAgICAgIHZhciBtaW5JZHggPSB1dGlscy5iaW5hcnlTZWFyY2goYSwgUFJFRkVSUkVEX0xPR19USUNLX1ZBTFVFUywgMSk7XG4gICAgICB2YXIgbWF4SWR4ID0gdXRpbHMuYmluYXJ5U2VhcmNoKGIsIFBSRUZFUlJFRF9MT0dfVElDS19WQUxVRVMsIC0xKTtcbiAgICAgIGlmIChtaW5JZHggPT0gLTEpIHtcbiAgICAgICAgbWluSWR4ID0gMDtcbiAgICAgIH1cbiAgICAgIGlmIChtYXhJZHggPT0gLTEpIHtcbiAgICAgICAgbWF4SWR4ID0gUFJFRkVSUkVEX0xPR19USUNLX1ZBTFVFUy5sZW5ndGggLSAxO1xuICAgICAgfVxuICAgICAgLy8gQ291bnQgdGhlIG51bWJlciBvZiB0aWNrIHZhbHVlcyB3b3VsZCBhcHBlYXIsIGlmIHdlIGNhbiBnZXQgYXQgbGVhc3RcbiAgICAgIC8vIG5UaWNrcyAvIDQgYWNjZXB0IHRoZW0uXG4gICAgICB2YXIgbGFzdERpc3BsYXllZCA9IG51bGw7XG4gICAgICBpZiAobWF4SWR4IC0gbWluSWR4ID49IG5UaWNrcyAvIDQpIHtcbiAgICAgICAgZm9yICh2YXIgaWR4ID0gbWF4SWR4OyBpZHggPj0gbWluSWR4OyBpZHgtLSkge1xuICAgICAgICAgIHZhciB0aWNrVmFsdWUgPSBQUkVGRVJSRURfTE9HX1RJQ0tfVkFMVUVTW2lkeF07XG4gICAgICAgICAgdmFyIHBpeGVsX2Nvb3JkID0gTWF0aC5sb2codGlja1ZhbHVlIC8gYSkgLyBNYXRoLmxvZyhiIC8gYSkgKiBwaXhlbHM7XG4gICAgICAgICAgdmFyIHRpY2sgPSB7IHY6IHRpY2tWYWx1ZSB9O1xuICAgICAgICAgIGlmIChsYXN0RGlzcGxheWVkID09PSBudWxsKSB7XG4gICAgICAgICAgICBsYXN0RGlzcGxheWVkID0ge1xuICAgICAgICAgICAgICB0aWNrVmFsdWUgOiB0aWNrVmFsdWUsXG4gICAgICAgICAgICAgIHBpeGVsX2Nvb3JkIDogcGl4ZWxfY29vcmRcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhwaXhlbF9jb29yZCAtIGxhc3REaXNwbGF5ZWQucGl4ZWxfY29vcmQpID49IHBpeGVsc19wZXJfdGljaykge1xuICAgICAgICAgICAgICBsYXN0RGlzcGxheWVkID0ge1xuICAgICAgICAgICAgICAgIHRpY2tWYWx1ZSA6IHRpY2tWYWx1ZSxcbiAgICAgICAgICAgICAgICBwaXhlbF9jb29yZCA6IHBpeGVsX2Nvb3JkXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aWNrLmxhYmVsID0gXCJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgdGlja3MucHVzaCh0aWNrKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBTaW5jZSB3ZSB3ZW50IGluIGJhY2t3YXJkcyBvcmRlci5cbiAgICAgICAgdGlja3MucmV2ZXJzZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHRpY2tzLmxlbmd0aCB3b24ndCBiZSAwIGlmIHRoZSBsb2cgc2NhbGUgZnVuY3Rpb24gZmluZHMgdmFsdWVzIHRvIGluc2VydC5cbiAgICBpZiAodGlja3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAvLyBCYXNpYyBpZGVhOlxuICAgICAgLy8gVHJ5IGxhYmVscyBldmVyeSAxLCAyLCA1LCAxMCwgMjAsIDUwLCAxMDAsIGV0Yy5cbiAgICAgIC8vIENhbGN1bGF0ZSB0aGUgcmVzdWx0aW5nIHRpY2sgc3BhY2luZyAoaS5lLiB0aGlzLmhlaWdodF8gLyBuVGlja3MpLlxuICAgICAgLy8gVGhlIGZpcnN0IHNwYWNpbmcgZ3JlYXRlciB0aGFuIHBpeGVsc1BlcllMYWJlbCBpcyB3aGF0IHdlIHVzZS5cbiAgICAgIC8vIFRPRE8oZGFudmspOiB2ZXJzaW9uIHRoYXQgd29ya3Mgb24gYSBsb2cgc2NhbGUuXG4gICAgICB2YXIga21nMiA9IG9wdHMoXCJsYWJlbHNLTUcyXCIpO1xuICAgICAgdmFyIG11bHRzLCBiYXNlO1xuICAgICAgaWYgKGttZzIpIHtcbiAgICAgICAgbXVsdHMgPSBbMSwgMiwgNCwgOCwgMTYsIDMyLCA2NCwgMTI4LCAyNTZdO1xuICAgICAgICBiYXNlID0gMTY7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtdWx0cyA9IFsxLCAyLCA1LCAxMCwgMjAsIDUwLCAxMDBdO1xuICAgICAgICBiYXNlID0gMTA7XG4gICAgICB9XG5cbiAgICAgIC8vIEdldCB0aGUgbWF4aW11bSBudW1iZXIgb2YgcGVybWl0dGVkIHRpY2tzIGJhc2VkIG9uIHRoZVxuICAgICAgLy8gZ3JhcGgncyBwaXhlbCBzaXplIGFuZCBwaXhlbHNfcGVyX3RpY2sgc2V0dGluZy5cbiAgICAgIHZhciBtYXhfdGlja3MgPSBNYXRoLmNlaWwocGl4ZWxzIC8gcGl4ZWxzX3Blcl90aWNrKTtcblxuICAgICAgLy8gTm93IGNhbGN1bGF0ZSB0aGUgZGF0YSB1bml0IGVxdWl2YWxlbnQgb2YgdGhpcyB0aWNrIHNwYWNpbmcuXG4gICAgICAvLyBVc2UgYWJzKCkgc2luY2UgZ3JhcGhzIG1heSBoYXZlIGEgcmV2ZXJzZWQgWSBheGlzLlxuICAgICAgdmFyIHVuaXRzX3Blcl90aWNrID0gTWF0aC5hYnMoYiAtIGEpIC8gbWF4X3RpY2tzO1xuXG4gICAgICAvLyBCYXNlZCBvbiB0aGlzLCBnZXQgYSBzdGFydGluZyBzY2FsZSB3aGljaCBpcyB0aGUgbGFyZ2VzdFxuICAgICAgLy8gaW50ZWdlciBwb3dlciBvZiB0aGUgY2hvc2VuIGJhc2UgKDEwIG9yIDE2KSB0aGF0IHN0aWxsIHJlbWFpbnNcbiAgICAgIC8vIGJlbG93IHRoZSByZXF1ZXN0ZWQgcGl4ZWxzX3Blcl90aWNrIHNwYWNpbmcuXG4gICAgICB2YXIgYmFzZV9wb3dlciA9IE1hdGguZmxvb3IoTWF0aC5sb2codW5pdHNfcGVyX3RpY2spIC8gTWF0aC5sb2coYmFzZSkpO1xuICAgICAgdmFyIGJhc2Vfc2NhbGUgPSBNYXRoLnBvdyhiYXNlLCBiYXNlX3Bvd2VyKTtcblxuICAgICAgLy8gTm93IHRyeSBtdWx0aXBsZXMgb2YgdGhlIHN0YXJ0aW5nIHNjYWxlIHVudGlsIHdlIGZpbmQgb25lXG4gICAgICAvLyB0aGF0IHJlc3VsdHMgaW4gdGljayBtYXJrcyBzcGFjZWQgc3VmZmljaWVudGx5IGZhciBhcGFydC5cbiAgICAgIC8vIFRoZSBcIm11bHRzXCIgYXJyYXkgc2hvdWxkIGNvdmVyIHRoZSByYW5nZSAxIC4uIGJhc2VeMiB0b1xuICAgICAgLy8gYWRqdXN0IGZvciByb3VuZGluZyBhbmQgZWRnZSBlZmZlY3RzLlxuICAgICAgdmFyIHNjYWxlLCBsb3dfdmFsLCBoaWdoX3ZhbCwgc3BhY2luZztcbiAgICAgIGZvciAoaiA9IDA7IGogPCBtdWx0cy5sZW5ndGg7IGorKykge1xuICAgICAgICBzY2FsZSA9IGJhc2Vfc2NhbGUgKiBtdWx0c1tqXTtcbiAgICAgICAgbG93X3ZhbCA9IE1hdGguZmxvb3IoYSAvIHNjYWxlKSAqIHNjYWxlO1xuICAgICAgICBoaWdoX3ZhbCA9IE1hdGguY2VpbChiIC8gc2NhbGUpICogc2NhbGU7XG4gICAgICAgIG5UaWNrcyA9IE1hdGguYWJzKGhpZ2hfdmFsIC0gbG93X3ZhbCkgLyBzY2FsZTtcbiAgICAgICAgc3BhY2luZyA9IHBpeGVscyAvIG5UaWNrcztcbiAgICAgICAgaWYgKHNwYWNpbmcgPiBwaXhlbHNfcGVyX3RpY2spIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICAvLyBDb25zdHJ1Y3QgdGhlIHNldCBvZiB0aWNrcy5cbiAgICAgIC8vIEFsbG93IHJldmVyc2UgeS1heGlzIGlmIGl0J3MgZXhwbGljaXRseSByZXF1ZXN0ZWQuXG4gICAgICBpZiAobG93X3ZhbCA+IGhpZ2hfdmFsKSBzY2FsZSAqPSAtMTtcbiAgICAgIGZvciAoaSA9IDA7IGkgPD0gblRpY2tzOyBpKyspIHtcbiAgICAgICAgdGlja1YgPSBsb3dfdmFsICsgaSAqIHNjYWxlO1xuICAgICAgICB0aWNrcy5wdXNoKCB7djogdGlja1Z9ICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmFyIGZvcm1hdHRlciA9IC8qKkB0eXBle0F4aXNMYWJlbEZvcm1hdHRlcn0qLyhvcHRzKCdheGlzTGFiZWxGb3JtYXR0ZXInKSk7XG5cbiAgLy8gQWRkIGxhYmVscyB0byB0aGUgdGlja3MuXG4gIGZvciAoaSA9IDA7IGkgPCB0aWNrcy5sZW5ndGg7IGkrKykge1xuICAgIGlmICh0aWNrc1tpXS5sYWJlbCAhPT0gdW5kZWZpbmVkKSBjb250aW51ZTsgIC8vIFVzZSBjdXJyZW50IGxhYmVsLlxuICAgIC8vIFRPRE8oZGFudmspOiBzZXQgZ3JhbnVsYXJpdHkgdG8gc29tZXRoaW5nIGFwcHJvcHJpYXRlIGhlcmUuXG4gICAgdGlja3NbaV0ubGFiZWwgPSBmb3JtYXR0ZXIuY2FsbChkeWdyYXBoLCB0aWNrc1tpXS52LCAwLCBvcHRzLCBkeWdyYXBoKTtcbiAgfVxuXG4gIHJldHVybiB0aWNrcztcbn07XG5cbi8qKiBAdHlwZSB7VGlja2VyfSAqL1xuZXhwb3J0IHZhciBkYXRlVGlja2VyID0gZnVuY3Rpb24oYSwgYiwgcGl4ZWxzLCBvcHRzLCBkeWdyYXBoLCB2YWxzKSB7XG4gIHZhciBjaG9zZW4gPSBwaWNrRGF0ZVRpY2tHcmFudWxhcml0eShhLCBiLCBwaXhlbHMsIG9wdHMpO1xuXG4gIGlmIChjaG9zZW4gPj0gMCkge1xuICAgIHJldHVybiBnZXREYXRlQXhpcyhhLCBiLCBjaG9zZW4sIG9wdHMsIGR5Z3JhcGgpO1xuICB9IGVsc2Uge1xuICAgIC8vIHRoaXMgY2FuIGhhcHBlbiBpZiBzZWxmLndpZHRoXyBpcyB6ZXJvLlxuICAgIHJldHVybiBbXTtcbiAgfVxufTtcblxuLy8gVGltZSBncmFudWxhcml0eSBlbnVtZXJhdGlvblxuZXhwb3J0IHZhciBHcmFudWxhcml0eSA9IHtcbiAgTUlMTElTRUNPTkRMWTogMCxcbiAgVFdPX01JTExJU0VDT05ETFk6IDEsXG4gIEZJVkVfTUlMTElTRUNPTkRMWTogMixcbiAgVEVOX01JTExJU0VDT05ETFk6IDMsXG4gIEZJRlRZX01JTExJU0VDT05ETFk6IDQsXG4gIEhVTkRSRURfTUlMTElTRUNPTkRMWTogNSxcbiAgRklWRV9IVU5EUkVEX01JTExJU0VDT05ETFk6IDYsXG4gIFNFQ09ORExZOiA3LFxuICBUV09fU0VDT05ETFk6IDgsXG4gIEZJVkVfU0VDT05ETFk6IDksXG4gIFRFTl9TRUNPTkRMWTogMTAsXG4gIFRISVJUWV9TRUNPTkRMWTogMTEsXG4gIE1JTlVURUxZOiAxMixcbiAgVFdPX01JTlVURUxZOiAxMyxcbiAgRklWRV9NSU5VVEVMWTogMTQsXG4gIFRFTl9NSU5VVEVMWTogMTUsXG4gIFRISVJUWV9NSU5VVEVMWTogMTYsXG4gIEhPVVJMWTogMTcsXG4gIFRXT19IT1VSTFk6IDE4LFxuICBTSVhfSE9VUkxZOiAxOSxcbiAgREFJTFk6IDIwLFxuICBUV09fREFJTFk6IDIxLFxuICBXRUVLTFk6IDIyLFxuICBNT05USExZOiAyMyxcbiAgUVVBUlRFUkxZOiAyNCxcbiAgQklBTk5VQUw6IDI1LFxuICBBTk5VQUw6IDI2LFxuICBERUNBREFMOiAyNyxcbiAgQ0VOVEVOTklBTDogMjgsXG4gIE5VTV9HUkFOVUxBUklUSUVTOiAyOVxufVxuXG4vLyBEYXRlIGNvbXBvbmVudHMgZW51bWVyYXRpb24gKGluIHRoZSBvcmRlciBvZiB0aGUgYXJndW1lbnRzIGluIERhdGUpXG4vLyBUT0RPOiBtYWtlIHRoaXMgYW4gQGVudW1cbnZhciBEYXRlRmllbGQgPSB7XG4gIERBVEVGSUVMRF9ZOiAwLFxuICBEQVRFRklFTERfTTogMSxcbiAgREFURUZJRUxEX0Q6IDIsXG4gIERBVEVGSUVMRF9ISDogMyxcbiAgREFURUZJRUxEX01NOiA0LFxuICBEQVRFRklFTERfU1M6IDUsXG4gIERBVEVGSUVMRF9NUzogNixcbiAgTlVNX0RBVEVGSUVMRFM6IDdcbn07XG5cbi8qKlxuICogVGhlIHZhbHVlIG9mIGRhdGVmaWVsZCB3aWxsIHN0YXJ0IGF0IGFuIGV2ZW4gbXVsdGlwbGUgb2YgXCJzdGVwXCIsIGkuZS5cbiAqICAgaWYgZGF0ZWZpZWxkPVNTIGFuZCBzdGVwPTUgdGhlbiB0aGUgZmlyc3QgdGljayB3aWxsIGJlIG9uIGEgbXVsdGlwbGUgb2YgNXMuXG4gKlxuICogRm9yIGdyYW51bGFyaXRpZXMgPD0gSE9VUkxZLCB0aWNrcyBhcmUgZ2VuZXJhdGVkIGV2ZXJ5IGBzcGFjaW5nYCBtcy5cbiAqXG4gKiBBdCBjb2Fyc2VyIGdyYW51bGFyaXRpZXMsIHRpY2tzIGFyZSBnZW5lcmF0ZWQgYnkgaW5jcmVtZW50aW5nIGBkYXRlZmllbGRgIGJ5XG4gKiAgIGBzdGVwYC4gSW4gdGhpcyBjYXNlLCB0aGUgYHNwYWNpbmdgIHZhbHVlIGlzIG9ubHkgdXNlZCB0byBlc3RpbWF0ZSB0aGVcbiAqICAgbnVtYmVyIG9mIHRpY2tzLiBJdCBzaG91bGQgcm91Z2hseSBjb3JyZXNwb25kIHRvIHRoZSBzcGFjaW5nIGJldHdlZW5cbiAqICAgYWRqYWNlbnQgdGlja3MuXG4gKlxuICogQHR5cGUge0FycmF5Ljx7ZGF0ZWZpZWxkOm51bWJlciwgc3RlcDpudW1iZXIsIHNwYWNpbmc6bnVtYmVyfT59XG4gKi9cbnZhciBUSUNLX1BMQUNFTUVOVCA9IFtdO1xuVElDS19QTEFDRU1FTlRbR3JhbnVsYXJpdHkuTUlMTElTRUNPTkRMWV0gICAgICAgICAgICAgICA9IHtkYXRlZmllbGQ6IERhdGVGaWVsZC5EQVRFRklFTERfTVMsIHN0ZXA6ICAgMSwgc3BhY2luZzogMX07XG5USUNLX1BMQUNFTUVOVFtHcmFudWxhcml0eS5UV09fTUlMTElTRUNPTkRMWV0gICAgICAgICAgID0ge2RhdGVmaWVsZDogRGF0ZUZpZWxkLkRBVEVGSUVMRF9NUywgc3RlcDogICAyLCBzcGFjaW5nOiAyfTtcblRJQ0tfUExBQ0VNRU5UW0dyYW51bGFyaXR5LkZJVkVfTUlMTElTRUNPTkRMWV0gICAgICAgICAgPSB7ZGF0ZWZpZWxkOiBEYXRlRmllbGQuREFURUZJRUxEX01TLCBzdGVwOiAgIDUsIHNwYWNpbmc6IDV9O1xuVElDS19QTEFDRU1FTlRbR3JhbnVsYXJpdHkuVEVOX01JTExJU0VDT05ETFldICAgICAgICAgICA9IHtkYXRlZmllbGQ6IERhdGVGaWVsZC5EQVRFRklFTERfTVMsIHN0ZXA6ICAxMCwgc3BhY2luZzogMTB9O1xuVElDS19QTEFDRU1FTlRbR3JhbnVsYXJpdHkuRklGVFlfTUlMTElTRUNPTkRMWV0gICAgICAgICA9IHtkYXRlZmllbGQ6IERhdGVGaWVsZC5EQVRFRklFTERfTVMsIHN0ZXA6ICA1MCwgc3BhY2luZzogNTB9O1xuVElDS19QTEFDRU1FTlRbR3JhbnVsYXJpdHkuSFVORFJFRF9NSUxMSVNFQ09ORExZXSAgICAgICA9IHtkYXRlZmllbGQ6IERhdGVGaWVsZC5EQVRFRklFTERfTVMsIHN0ZXA6IDEwMCwgc3BhY2luZzogMTAwfTtcblRJQ0tfUExBQ0VNRU5UW0dyYW51bGFyaXR5LkZJVkVfSFVORFJFRF9NSUxMSVNFQ09ORExZXSAgPSB7ZGF0ZWZpZWxkOiBEYXRlRmllbGQuREFURUZJRUxEX01TLCBzdGVwOiA1MDAsIHNwYWNpbmc6IDUwMH07XG5USUNLX1BMQUNFTUVOVFtHcmFudWxhcml0eS5TRUNPTkRMWV0gICAgICAgID0ge2RhdGVmaWVsZDogRGF0ZUZpZWxkLkRBVEVGSUVMRF9TUywgc3RlcDogICAxLCBzcGFjaW5nOiAxMDAwICogMX07XG5USUNLX1BMQUNFTUVOVFtHcmFudWxhcml0eS5UV09fU0VDT05ETFldICAgID0ge2RhdGVmaWVsZDogRGF0ZUZpZWxkLkRBVEVGSUVMRF9TUywgc3RlcDogICAyLCBzcGFjaW5nOiAxMDAwICogMn07XG5USUNLX1BMQUNFTUVOVFtHcmFudWxhcml0eS5GSVZFX1NFQ09ORExZXSAgID0ge2RhdGVmaWVsZDogRGF0ZUZpZWxkLkRBVEVGSUVMRF9TUywgc3RlcDogICA1LCBzcGFjaW5nOiAxMDAwICogNX07XG5USUNLX1BMQUNFTUVOVFtHcmFudWxhcml0eS5URU5fU0VDT05ETFldICAgID0ge2RhdGVmaWVsZDogRGF0ZUZpZWxkLkRBVEVGSUVMRF9TUywgc3RlcDogIDEwLCBzcGFjaW5nOiAxMDAwICogMTB9O1xuVElDS19QTEFDRU1FTlRbR3JhbnVsYXJpdHkuVEhJUlRZX1NFQ09ORExZXSA9IHtkYXRlZmllbGQ6IERhdGVGaWVsZC5EQVRFRklFTERfU1MsIHN0ZXA6ICAzMCwgc3BhY2luZzogMTAwMCAqIDMwfTtcblRJQ0tfUExBQ0VNRU5UW0dyYW51bGFyaXR5Lk1JTlVURUxZXSAgICAgICAgPSB7ZGF0ZWZpZWxkOiBEYXRlRmllbGQuREFURUZJRUxEX01NLCBzdGVwOiAgIDEsIHNwYWNpbmc6IDEwMDAgKiA2MH07XG5USUNLX1BMQUNFTUVOVFtHcmFudWxhcml0eS5UV09fTUlOVVRFTFldICAgID0ge2RhdGVmaWVsZDogRGF0ZUZpZWxkLkRBVEVGSUVMRF9NTSwgc3RlcDogICAyLCBzcGFjaW5nOiAxMDAwICogNjAgKiAyfTtcblRJQ0tfUExBQ0VNRU5UW0dyYW51bGFyaXR5LkZJVkVfTUlOVVRFTFldICAgPSB7ZGF0ZWZpZWxkOiBEYXRlRmllbGQuREFURUZJRUxEX01NLCBzdGVwOiAgIDUsIHNwYWNpbmc6IDEwMDAgKiA2MCAqIDV9O1xuVElDS19QTEFDRU1FTlRbR3JhbnVsYXJpdHkuVEVOX01JTlVURUxZXSAgICA9IHtkYXRlZmllbGQ6IERhdGVGaWVsZC5EQVRFRklFTERfTU0sIHN0ZXA6ICAxMCwgc3BhY2luZzogMTAwMCAqIDYwICogMTB9O1xuVElDS19QTEFDRU1FTlRbR3JhbnVsYXJpdHkuVEhJUlRZX01JTlVURUxZXSA9IHtkYXRlZmllbGQ6IERhdGVGaWVsZC5EQVRFRklFTERfTU0sIHN0ZXA6ICAzMCwgc3BhY2luZzogMTAwMCAqIDYwICogMzB9O1xuVElDS19QTEFDRU1FTlRbR3JhbnVsYXJpdHkuSE9VUkxZXSAgICAgICAgICA9IHtkYXRlZmllbGQ6IERhdGVGaWVsZC5EQVRFRklFTERfSEgsIHN0ZXA6ICAgMSwgc3BhY2luZzogMTAwMCAqIDM2MDB9O1xuVElDS19QTEFDRU1FTlRbR3JhbnVsYXJpdHkuVFdPX0hPVVJMWV0gICAgICA9IHtkYXRlZmllbGQ6IERhdGVGaWVsZC5EQVRFRklFTERfSEgsIHN0ZXA6ICAgMiwgc3BhY2luZzogMTAwMCAqIDM2MDAgKiAyfTtcblRJQ0tfUExBQ0VNRU5UW0dyYW51bGFyaXR5LlNJWF9IT1VSTFldICAgICAgPSB7ZGF0ZWZpZWxkOiBEYXRlRmllbGQuREFURUZJRUxEX0hILCBzdGVwOiAgIDYsIHNwYWNpbmc6IDEwMDAgKiAzNjAwICogNn07XG5USUNLX1BMQUNFTUVOVFtHcmFudWxhcml0eS5EQUlMWV0gICAgICAgICAgID0ge2RhdGVmaWVsZDogRGF0ZUZpZWxkLkRBVEVGSUVMRF9ELCAgc3RlcDogICAxLCBzcGFjaW5nOiAxMDAwICogODY0MDB9O1xuVElDS19QTEFDRU1FTlRbR3JhbnVsYXJpdHkuVFdPX0RBSUxZXSAgICAgICA9IHtkYXRlZmllbGQ6IERhdGVGaWVsZC5EQVRFRklFTERfRCwgIHN0ZXA6ICAgMiwgc3BhY2luZzogMTAwMCAqIDg2NDAwICogMn07XG5USUNLX1BMQUNFTUVOVFtHcmFudWxhcml0eS5XRUVLTFldICAgICAgICAgID0ge2RhdGVmaWVsZDogRGF0ZUZpZWxkLkRBVEVGSUVMRF9ELCAgc3RlcDogICA3LCBzcGFjaW5nOiAxMDAwICogNjA0ODAwfTtcblRJQ0tfUExBQ0VNRU5UW0dyYW51bGFyaXR5Lk1PTlRITFldICAgICAgICAgPSB7ZGF0ZWZpZWxkOiBEYXRlRmllbGQuREFURUZJRUxEX00sICBzdGVwOiAgIDEsIHNwYWNpbmc6IDEwMDAgKiA3MjAwICAqIDM2NS4yNDI1fTsgLy8gMWUzICogNjAgKiA2MCAqIDI0ICogMzY1LjI0MjUgLyAxMlxuVElDS19QTEFDRU1FTlRbR3JhbnVsYXJpdHkuUVVBUlRFUkxZXSAgICAgICA9IHtkYXRlZmllbGQ6IERhdGVGaWVsZC5EQVRFRklFTERfTSwgIHN0ZXA6ICAgMywgc3BhY2luZzogMTAwMCAqIDIxNjAwICogMzY1LjI0MjV9OyAvLyAxZTMgKiA2MCAqIDYwICogMjQgKiAzNjUuMjQyNSAvIDRcblRJQ0tfUExBQ0VNRU5UW0dyYW51bGFyaXR5LkJJQU5OVUFMXSAgICAgICAgPSB7ZGF0ZWZpZWxkOiBEYXRlRmllbGQuREFURUZJRUxEX00sICBzdGVwOiAgIDYsIHNwYWNpbmc6IDEwMDAgKiA0MzIwMCAqIDM2NS4yNDI1fTsgLy8gMWUzICogNjAgKiA2MCAqIDI0ICogMzY1LjI0MjUgLyAyXG5USUNLX1BMQUNFTUVOVFtHcmFudWxhcml0eS5BTk5VQUxdICAgICAgICAgID0ge2RhdGVmaWVsZDogRGF0ZUZpZWxkLkRBVEVGSUVMRF9ZLCAgc3RlcDogICAxLCBzcGFjaW5nOiAxMDAwICogODY0MDAgICAqIDM2NS4yNDI1fTsgLy8gMWUzICogNjAgKiA2MCAqIDI0ICogMzY1LjI0MjUgKiAxXG5USUNLX1BMQUNFTUVOVFtHcmFudWxhcml0eS5ERUNBREFMXSAgICAgICAgID0ge2RhdGVmaWVsZDogRGF0ZUZpZWxkLkRBVEVGSUVMRF9ZLCAgc3RlcDogIDEwLCBzcGFjaW5nOiAxMDAwICogODY0MDAwICAqIDM2NS4yNDI1fTsgLy8gMWUzICogNjAgKiA2MCAqIDI0ICogMzY1LjI0MjUgKiAxMFxuVElDS19QTEFDRU1FTlRbR3JhbnVsYXJpdHkuQ0VOVEVOTklBTF0gICAgICA9IHtkYXRlZmllbGQ6IERhdGVGaWVsZC5EQVRFRklFTERfWSwgIHN0ZXA6IDEwMCwgc3BhY2luZzogMTAwMCAqIDg2NDAwMDAgKiAzNjUuMjQyNX07IC8vIDFlMyAqIDYwICogNjAgKiAyNCAqIDM2NS4yNDI1ICogMTAwXG5cbi8qKlxuICogVGhpcyBpcyBhIGxpc3Qgb2YgaHVtYW4tZnJpZW5kbHkgdmFsdWVzIGF0IHdoaWNoIHRvIHNob3cgdGljayBtYXJrcyBvbiBhIGxvZ1xuICogc2NhbGUuIEl0IGlzIGsgKiAxMF5uLCB3aGVyZSBrPTEuLjkgYW5kIG49LTM5Li4rMzksIHNvOlxuICogLi4uLCAxLCAyLCAzLCA0LCA1LCAuLi4sIDksIDEwLCAyMCwgMzAsIC4uLiwgOTAsIDEwMCwgMjAwLCAzMDAsIC4uLlxuICogTk9URTogdGhpcyBhc3N1bWVzIHRoYXQgdXRpbHMuTE9HX1NDQUxFID0gMTAuXG4gKiBAdHlwZSB7QXJyYXkuPG51bWJlcj59XG4gKi9cbnZhciBQUkVGRVJSRURfTE9HX1RJQ0tfVkFMVUVTID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdmFscyA9IFtdO1xuICBmb3IgKHZhciBwb3dlciA9IC0zOTsgcG93ZXIgPD0gMzk7IHBvd2VyKyspIHtcbiAgICB2YXIgcmFuZ2UgPSBNYXRoLnBvdygxMCwgcG93ZXIpO1xuICAgIGZvciAodmFyIG11bHQgPSAxOyBtdWx0IDw9IDk7IG11bHQrKykge1xuICAgICAgdmFyIHZhbCA9IHJhbmdlICogbXVsdDtcbiAgICAgIHZhbHMucHVzaCh2YWwpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdmFscztcbn0pKCk7XG5cbi8qKlxuICogRGV0ZXJtaW5lIHRoZSBjb3JyZWN0IGdyYW51bGFyaXR5IG9mIHRpY2tzIG9uIGEgZGF0ZSBheGlzLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBhIExlZnQgZWRnZSBvZiB0aGUgY2hhcnQgKG1zKVxuICogQHBhcmFtIHtudW1iZXJ9IGIgUmlnaHQgZWRnZSBvZiB0aGUgY2hhcnQgKG1zKVxuICogQHBhcmFtIHtudW1iZXJ9IHBpeGVscyBTaXplIG9mIHRoZSBjaGFydCBpbiB0aGUgcmVsZXZhbnQgZGltZW5zaW9uICh3aWR0aCkuXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKHN0cmluZyk6Kn0gb3B0cyBGdW5jdGlvbiBtYXBwaW5nIGZyb20gb3B0aW9uIG5hbWUgLSZndDsgdmFsdWUuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBhcHByb3ByaWF0ZSBheGlzIGdyYW51bGFyaXR5IGZvciB0aGlzIGNoYXJ0LiBTZWUgdGhlXG4gKiAgICAgZW51bWVyYXRpb24gb2YgcG9zc2libGUgdmFsdWVzIGluIGR5Z3JhcGgtdGlja2Vycy5qcy5cbiAqL1xuZXhwb3J0IHZhciBwaWNrRGF0ZVRpY2tHcmFudWxhcml0eSA9IGZ1bmN0aW9uKGEsIGIsIHBpeGVscywgb3B0cykge1xuICB2YXIgcGl4ZWxzX3Blcl90aWNrID0gLyoqIEB0eXBle251bWJlcn0gKi8ob3B0cygncGl4ZWxzUGVyTGFiZWwnKSk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgR3JhbnVsYXJpdHkuTlVNX0dSQU5VTEFSSVRJRVM7IGkrKykge1xuICAgIHZhciBudW1fdGlja3MgPSBudW1EYXRlVGlja3MoYSwgYiwgaSk7XG4gICAgaWYgKHBpeGVscyAvIG51bV90aWNrcyA+PSBwaXhlbHNfcGVyX3RpY2spIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59O1xuXG4vKipcbiAqIENvbXB1dGUgdGhlIG51bWJlciBvZiB0aWNrcyBvbiBhIGRhdGUgYXhpcyBmb3IgYSBnaXZlbiBncmFudWxhcml0eS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydF90aW1lXG4gKiBAcGFyYW0ge251bWJlcn0gZW5kX3RpbWVcbiAqIEBwYXJhbSB7bnVtYmVyfSBncmFudWxhcml0eSAob25lIG9mIHRoZSBncmFudWxhcml0aWVzIGVudW1lcmF0ZWQgYWJvdmUpXG4gKiBAcmV0dXJuIHtudW1iZXJ9IChBcHByb3hpbWF0ZSkgbnVtYmVyIG9mIHRpY2tzIHRoYXQgd291bGQgcmVzdWx0LlxuICovXG52YXIgbnVtRGF0ZVRpY2tzID0gZnVuY3Rpb24oc3RhcnRfdGltZSwgZW5kX3RpbWUsIGdyYW51bGFyaXR5KSB7XG4gIHZhciBzcGFjaW5nID0gVElDS19QTEFDRU1FTlRbZ3JhbnVsYXJpdHldLnNwYWNpbmc7XG4gIHJldHVybiBNYXRoLnJvdW5kKDEuMCAqIChlbmRfdGltZSAtIHN0YXJ0X3RpbWUpIC8gc3BhY2luZyk7XG59O1xuXG4vKipcbiAqIENvbXB1dGUgdGhlIHBvc2l0aW9ucyBhbmQgbGFiZWxzIG9mIHRpY2tzIG9uIGEgZGF0ZSBheGlzIGZvciBhIGdpdmVuIGdyYW51bGFyaXR5LlxuICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0X3RpbWVcbiAqIEBwYXJhbSB7bnVtYmVyfSBlbmRfdGltZVxuICogQHBhcmFtIHtudW1iZXJ9IGdyYW51bGFyaXR5IChvbmUgb2YgdGhlIGdyYW51bGFyaXRpZXMgZW51bWVyYXRlZCBhYm92ZSlcbiAqIEBwYXJhbSB7ZnVuY3Rpb24oc3RyaW5nKToqfSBvcHRzIEZ1bmN0aW9uIG1hcHBpbmcgZnJvbSBvcHRpb24gbmFtZSAtJmd0OyB2YWx1ZS5cbiAqIEBwYXJhbSB7RHlncmFwaD19IGRnXG4gKiBAcmV0dXJuIHshVGlja0xpc3R9XG4gKi9cbmV4cG9ydCB2YXIgZ2V0RGF0ZUF4aXMgPSBmdW5jdGlvbihzdGFydF90aW1lLCBlbmRfdGltZSwgZ3JhbnVsYXJpdHksIG9wdHMsIGRnKSB7XG4gIHZhciBmb3JtYXR0ZXIgPSAvKiogQHR5cGV7QXhpc0xhYmVsRm9ybWF0dGVyfSAqLyhcbiAgICAgIG9wdHMoXCJheGlzTGFiZWxGb3JtYXR0ZXJcIikpO1xuICB2YXIgdXRjID0gb3B0cyhcImxhYmVsc1VUQ1wiKTtcbiAgdmFyIGFjY2Vzc29ycyA9IHV0YyA/IHV0aWxzLkRhdGVBY2Nlc3NvcnNVVEMgOiB1dGlscy5EYXRlQWNjZXNzb3JzTG9jYWw7XG5cbiAgdmFyIGRhdGVmaWVsZCA9IFRJQ0tfUExBQ0VNRU5UW2dyYW51bGFyaXR5XS5kYXRlZmllbGQ7XG4gIHZhciBzdGVwID0gVElDS19QTEFDRU1FTlRbZ3JhbnVsYXJpdHldLnN0ZXA7XG4gIHZhciBzcGFjaW5nID0gVElDS19QTEFDRU1FTlRbZ3JhbnVsYXJpdHldLnNwYWNpbmc7XG5cbiAgLy8gQ2hvb3NlIGEgbmljZSB0aWNrIHBvc2l0aW9uIGJlZm9yZSB0aGUgaW5pdGlhbCBpbnN0YW50LlxuICAvLyBDdXJyZW50bHksIHRoaXMgY29kZSBkZWFscyBwcm9wZXJseSB3aXRoIHRoZSBleGlzdGVudCBkYWlseSBncmFudWxhcml0aWVzOlxuICAvLyBEQUlMWSAod2l0aCBzdGVwIG9mIDEpIGFuZCBXRUVLTFkgKHdpdGggc3RlcCBvZiA3IGJ1dCBzcGVjaWFsbHkgaGFuZGxlZCkuXG4gIC8vIE90aGVyIGRhaWx5IGdyYW51bGFyaXRpZXMgKHNheSBUV09fREFJTFkpIHNob3VsZCBhbHNvIGJlIGhhbmRsZWQgc3BlY2lhbGx5XG4gIC8vIGJ5IHNldHRpbmcgdGhlIHN0YXJ0X2RhdGVfb2Zmc2V0IHRvIDAuXG4gIHZhciBzdGFydF9kYXRlID0gbmV3IERhdGUoc3RhcnRfdGltZSk7XG4gIHZhciBkYXRlX2FycmF5ID0gW107XG4gIGRhdGVfYXJyYXlbRGF0ZUZpZWxkLkRBVEVGSUVMRF9ZXSAgPSBhY2Nlc3NvcnMuZ2V0RnVsbFllYXIoc3RhcnRfZGF0ZSk7XG4gIGRhdGVfYXJyYXlbRGF0ZUZpZWxkLkRBVEVGSUVMRF9NXSAgPSBhY2Nlc3NvcnMuZ2V0TW9udGgoc3RhcnRfZGF0ZSk7XG4gIGRhdGVfYXJyYXlbRGF0ZUZpZWxkLkRBVEVGSUVMRF9EXSAgPSBhY2Nlc3NvcnMuZ2V0RGF0ZShzdGFydF9kYXRlKTtcbiAgZGF0ZV9hcnJheVtEYXRlRmllbGQuREFURUZJRUxEX0hIXSA9IGFjY2Vzc29ycy5nZXRIb3VycyhzdGFydF9kYXRlKTtcbiAgZGF0ZV9hcnJheVtEYXRlRmllbGQuREFURUZJRUxEX01NXSA9IGFjY2Vzc29ycy5nZXRNaW51dGVzKHN0YXJ0X2RhdGUpO1xuICBkYXRlX2FycmF5W0RhdGVGaWVsZC5EQVRFRklFTERfU1NdID0gYWNjZXNzb3JzLmdldFNlY29uZHMoc3RhcnRfZGF0ZSk7XG4gIGRhdGVfYXJyYXlbRGF0ZUZpZWxkLkRBVEVGSUVMRF9NU10gPSBhY2Nlc3NvcnMuZ2V0TWlsbGlzZWNvbmRzKHN0YXJ0X2RhdGUpO1xuXG4gIHZhciBzdGFydF9kYXRlX29mZnNldCA9IGRhdGVfYXJyYXlbZGF0ZWZpZWxkXSAlIHN0ZXA7XG4gIGlmIChncmFudWxhcml0eSA9PSBHcmFudWxhcml0eS5XRUVLTFkpIHtcbiAgICAvLyBUaGlzIHdpbGwgcHV0IHRoZSB0aWNrcyBvbiBTdW5kYXlzLlxuICAgIHN0YXJ0X2RhdGVfb2Zmc2V0ID0gYWNjZXNzb3JzLmdldERheShzdGFydF9kYXRlKTtcbiAgfVxuXG4gIGRhdGVfYXJyYXlbZGF0ZWZpZWxkXSAtPSBzdGFydF9kYXRlX29mZnNldDtcbiAgZm9yICh2YXIgZGYgPSBkYXRlZmllbGQgKyAxOyBkZiA8IERhdGVGaWVsZC5OVU1fREFURUZJRUxEUzsgZGYrKykge1xuICAgIC8vIFRoZSBtaW5pbXVtIHZhbHVlIGlzIDEgZm9yIHRoZSBkYXkgb2YgbW9udGgsIGFuZCAwIGZvciBhbGwgb3RoZXIgZmllbGRzLlxuICAgIGRhdGVfYXJyYXlbZGZdID0gKGRmID09PSBEYXRlRmllbGQuREFURUZJRUxEX0QpID8gMSA6IDA7XG4gIH1cblxuICAvLyBHZW5lcmF0ZSB0aGUgdGlja3MuXG4gIC8vIEZvciBncmFudWxhcml0aWVzIG5vdCBjb2Fyc2VyIHRoYW4gSE9VUkxZIHdlIHVzZSB0aGUgZmFjdCB0aGF0OlxuICAvLyAgIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGJldHdlZW4gdGlja3MgaXMgY29uc3RhbnRcbiAgLy8gICBhbmQgZXF1YWwgdG8gdGhlIGRlZmluZWQgc3BhY2luZy5cbiAgLy8gT3RoZXJ3aXNlIHdlIHJlbHkgb24gdGhlICdyb2xsIG92ZXInIHByb3BlcnR5IG9mIHRoZSBEYXRlIGZ1bmN0aW9uczpcbiAgLy8gICB3aGVuIHNvbWUgZGF0ZSBmaWVsZCBpcyBzZXQgdG8gYSB2YWx1ZSBvdXRzaWRlIG9mIGl0cyBsb2dpY2FsIHJhbmdlLFxuICAvLyAgIHRoZSBleGNlc3MgJ3JvbGxzIG92ZXInIHRoZSBuZXh0IChtb3JlIHNpZ25pZmljYW50KSBmaWVsZC5cbiAgLy8gSG93ZXZlciwgd2hlbiB1c2luZyBsb2NhbCB0aW1lIHdpdGggRFNUIHRyYW5zaXRpb25zLFxuICAvLyB0aGVyZSBhcmUgZGF0ZXMgdGhhdCBkbyBub3QgcmVwcmVzZW50IGFueSB0aW1lIHZhbHVlIGF0IGFsbFxuICAvLyAodGhvc2UgaW4gdGhlIGhvdXIgc2tpcHBlZCBhdCB0aGUgJ3NwcmluZyBmb3J3YXJkJyksXG4gIC8vIGFuZCB0aGUgSmF2YVNjcmlwdCBlbmdpbmVzIHVzdWFsbHkgcmV0dXJuIGFuIGVxdWl2YWxlbnQgdmFsdWUuXG4gIC8vIEhlbmNlIHdlIGhhdmUgdG8gY2hlY2sgdGhhdCB0aGUgZGF0ZSBpcyBwcm9wZXJseSBpbmNyZWFzZWQgYXQgZWFjaCBzdGVwLFxuICAvLyByZXR1cm5pbmcgYSBkYXRlIGF0IGEgbmljZSB0aWNrIHBvc2l0aW9uLlxuICB2YXIgdGlja3MgPSBbXTtcbiAgdmFyIHRpY2tfZGF0ZSA9IGFjY2Vzc29ycy5tYWtlRGF0ZS5hcHBseShudWxsLCBkYXRlX2FycmF5KTtcbiAgdmFyIHRpY2tfdGltZSA9IHRpY2tfZGF0ZS5nZXRUaW1lKCk7XG4gIGlmIChncmFudWxhcml0eSA8PSBHcmFudWxhcml0eS5IT1VSTFkpIHtcbiAgICBpZiAodGlja190aW1lIDwgc3RhcnRfdGltZSkge1xuICAgICAgdGlja190aW1lICs9IHNwYWNpbmc7XG4gICAgICB0aWNrX2RhdGUgPSBuZXcgRGF0ZSh0aWNrX3RpbWUpO1xuICAgIH1cbiAgICB3aGlsZSAodGlja190aW1lIDw9IGVuZF90aW1lKSB7XG4gICAgICB0aWNrcy5wdXNoKHsgdjogdGlja190aW1lLFxuICAgICAgICAgICAgICAgICAgIGxhYmVsOiBmb3JtYXR0ZXIuY2FsbChkZywgdGlja19kYXRlLCBncmFudWxhcml0eSwgb3B0cywgZGcpXG4gICAgICAgICAgICAgICAgIH0pO1xuICAgICAgdGlja190aW1lICs9IHNwYWNpbmc7XG4gICAgICB0aWNrX2RhdGUgPSBuZXcgRGF0ZSh0aWNrX3RpbWUpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAodGlja190aW1lIDwgc3RhcnRfdGltZSkge1xuICAgICAgZGF0ZV9hcnJheVtkYXRlZmllbGRdICs9IHN0ZXA7XG4gICAgICB0aWNrX2RhdGUgPSBhY2Nlc3NvcnMubWFrZURhdGUuYXBwbHkobnVsbCwgZGF0ZV9hcnJheSk7XG4gICAgICB0aWNrX3RpbWUgPSB0aWNrX2RhdGUuZ2V0VGltZSgpO1xuICAgIH1cbiAgICB3aGlsZSAodGlja190aW1lIDw9IGVuZF90aW1lKSB7XG4gICAgICBpZiAoZ3JhbnVsYXJpdHkgPj0gR3JhbnVsYXJpdHkuREFJTFkgfHxcbiAgICAgICAgICBhY2Nlc3NvcnMuZ2V0SG91cnModGlja19kYXRlKSAlIHN0ZXAgPT09IDApIHtcbiAgICAgICAgdGlja3MucHVzaCh7IHY6IHRpY2tfdGltZSxcbiAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBmb3JtYXR0ZXIuY2FsbChkZywgdGlja19kYXRlLCBncmFudWxhcml0eSwgb3B0cywgZGcpXG4gICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBkYXRlX2FycmF5W2RhdGVmaWVsZF0gKz0gc3RlcDtcbiAgICAgIHRpY2tfZGF0ZSA9IGFjY2Vzc29ycy5tYWtlRGF0ZS5hcHBseShudWxsLCBkYXRlX2FycmF5KTtcbiAgICAgIHRpY2tfdGltZSA9IHRpY2tfZGF0ZS5nZXRUaW1lKCk7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aWNrcztcbn07XG4iXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsWUFBWTs7QUFBQztFQUFBO0FBQUE7QUFBQTtBQUViO0FBQXlDO0FBQUE7QUFFekM7QUFDQSxJQUFJQSxRQUFRLEdBQUdDLFNBQVMsQ0FBQyxDQUFFOztBQUUzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJQyxNQUFNLEdBQUdELFNBQVMsQ0FBQyxDQUFFOztBQUV6QjtBQUNPLElBQUlFLGtCQUFr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