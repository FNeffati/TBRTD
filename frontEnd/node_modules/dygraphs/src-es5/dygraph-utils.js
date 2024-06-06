/**
 * @license
 * Copyright 2011 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licenced: https://opensource.org/licenses/MIT
 */

/**
 * @fileoverview This file contains utility functions used by dygraphs. These
 * are typically static (i.e. not related to any particular dygraph). Examples
 * include date/time formatting functions, basic algorithms (e.g. binary
 * search) and generic DOM-manipulation functions.
 */

/*global Dygraph:false, Node:false */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HORIZONTAL = exports.DateAccessorsUTC = exports.DateAccessorsLocal = exports.DOT_DASH_LINE = exports.DOTTED_LINE = exports.DASHED_LINE = exports.Circles = void 0;
exports.Iterator = Iterator;
exports.addEvent = exports.VERTICAL = exports.LOG_SCALE = exports.LN_TEN = void 0;
exports.binarySearch = binarySearch;
exports.cancelEvent = cancelEvent;
exports.clone = clone;
exports.createCanvas = createCanvas;
exports.createIterator = createIterator;
exports.dateAxisLabelFormatter = dateAxisLabelFormatter;
exports.dateParser = dateParser;
exports.dateStrToMillis = dateStrToMillis;
exports.dateString_ = dateString_;
exports.dateValueFormatter = dateValueFormatter;
exports.detectLineDelimiter = detectLineDelimiter;
exports.dragGetX_ = dragGetX_;
exports.dragGetY_ = dragGetY_;
exports.findPos = findPos;
exports.floatFormat = floatFormat;
exports.getContext = void 0;
exports.getContextPixelRatio = getContextPixelRatio;
exports.hmsString_ = hmsString_;
exports.hsvToRGB = hsvToRGB;
exports.isArrayLike = isArrayLike;
exports.isCanvasSupported = isCanvasSupported;
exports.isDateLike = isDateLike;
exports.isNodeContainedBy = isNodeContainedBy;
exports.isOK = isOK;
exports.isPixelChangingOptionList = isPixelChangingOptionList;
exports.isValidPoint = isValidPoint;
exports.logRangeFraction = exports.log10 = void 0;
exports.numberAxisLabelFormatter = numberAxisLabelFormatter;
exports.numberValueFormatter = numberValueFormatter;
exports.pageX = pageX;
exports.pageY = pageY;
exports.parseFloat_ = parseFloat_;
exports.pow = pow;
exports.removeEvent = removeEvent;
exports.repeatAndCleanup = repeatAndCleanup;
exports.requestAnimFrame = void 0;
exports.round_ = round_;
exports.setupDOMready_ = setupDOMready_;
exports.toRGB_ = toRGB_;
exports.type = type;
exports.typeArrayLike = typeArrayLike;
exports.update = update;
exports.updateDeep = updateDeep;
exports.zeropad = zeropad;
var DygraphTickers = _interopRequireWildcard(require("./dygraph-tickers"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @param {*} o
 * @return {string}
 * @private
 */
function type(o) {
  return o === null ? 'null' : typeof o;
}
var LOG_SCALE = 10;
exports.LOG_SCALE = LOG_SCALE;
var LN_TEN = Math.log(LOG_SCALE);

/**
 * @private
 * @param {number} x
 * @return {number}
 */
exports.LN_TEN = LN_TEN;
var log10 = function log10(x) {
  return Math.log(x) / LN_TEN;
};

/**
 * @private
 * @param {number} r0
 * @param {number} r1
 * @param {number} pct
 * @return {number}
 */
exports.log10 = log10;
var logRangeFraction = function logRangeFraction(r0, r1, pct) {
  // Computing the inverse of toPercentXCoord. The function was arrived at with
  // the following steps:
  //
  // Original calcuation:
  // pct = (log(x) - log(xRange[0])) / (log(xRange[1]) - log(xRange[0]));
  //
  // Multiply both sides by the right-side denominator.
  // pct * (log(xRange[1] - log(xRange[0]))) = log(x) - log(xRange[0])
  //
  // add log(xRange[0]) to both sides
  // log(xRange[0]) + (pct * (log(xRange[1]) - log(xRange[0]))) = log(x);
  //
  // Swap both sides of the equation,
  // log(x) = log(xRange[0]) + (pct * (log(xRange[1]) - log(xRange[0])))
  //
  // Use both sides as the exponent in 10^exp and we're done.
  // x = 10 ^ (log(xRange[0]) + (pct * (log(xRange[1]) - log(xRange[0]))))

  var logr0 = log10(r0);
  var logr1 = log10(r1);
  var exponent = logr0 + pct * (logr1 - logr0);
  var value = Math.pow(LOG_SCALE, exponent);
  return value;
};

/** A dotted line stroke pattern. */
exports.logRangeFraction = logRangeFraction;
var DOTTED_LINE = [2, 2];
/** A dashed line stroke pattern. */
exports.DOTTED_LINE = DOTTED_LINE;
var DASHED_LINE = [7, 3];
/** A dot dash stroke pattern. */
exports.DASHED_LINE = DASHED_LINE;
var DOT_DASH_LINE = [7, 2, 2, 2];

// Directions for panning and zooming. Use bit operations when combined
// values are possible.
exports.DOT_DASH_LINE = DOT_DASH_LINE;
var HORIZONTAL = 1;
exports.HORIZONTAL = HORIZONTAL;
var VERTICAL = 2;

/**
 * Return the 2d context for a dygraph canvas.
 *
 * This method is only exposed for the sake of replacing the function in
 * automated tests.
 *
 * @param {!HTMLCanvasElement} canvas
 * @return {!CanvasRenderingContext2D}
 * @private
 */
exports.VERTICAL = VERTICAL;
var getContext = function getContext(canvas) {
  return (/** @type{!CanvasRenderingContext2D}*/canvas.getContext("2d")
  );
};

/**
 * Add an event handler.
 * @param {!Node} elem The element to add the event to.
 * @param {string} type The type of the event, e.g. 'click' or 'mousemove'.
 * @param {function(Event):(boolean|undefined)} fn The function to call
 *     on the event. The function takes one parameter: the event object.
 * @private
 */
exports.getContext = getContext;
var addEvent = function addEvent(elem, type, fn) {
  elem.addEventListener(type, fn, false);
};

/**
 * Remove an event handler.
 * @param {!Node} elem The element to remove the event from.
 * @param {string} type The type of the event, e.g. 'click' or 'mousemove'.
 * @param {function(Event):(boolean|undefined)} fn The function to call
 *     on the event. The function takes one parameter: the event object.
 */
exports.addEvent = addEvent;
function removeEvent(elem, type, fn) {
  elem.removeEventListener(type, fn, false);
}

/**
 * Cancels further processing of an event. This is useful to prevent default
 * browser actions, e.g. highlighting text on a double-click.
 * Based on the article at
 * http://www.switchonthecode.com/tutorials/javascript-tutorial-the-scroll-wheel
 * @param {!Event} e The event whose normal behavior should be canceled.
 * @private
 */
function cancelEvent(e) {
  e = e ? e : window.event;
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.cancelBubble = true;
  e.cancel = true;
  e.returnValue = false;
  return false;
}

/**
 * Convert hsv values to an rgb(r,g,b) string. Taken from MochiKit.Color. This
 * is used to generate default series colors which are evenly spaced on the
 * color wheel.
 * @param {number} hue Range is 0.0-1.0.
 * @param {number} saturation Range is 0.0-1.0.
 * @param {number} value Range is 0.0-1.0.
 * @return {string} "rgb(r,g,b)" where r, g and b range from 0-255.
 * @private
 */
function hsvToRGB(hue, saturation, value) {
  var red;
  var green;
  var blue;
  if (saturation === 0) {
    red = value;
    green = value;
    blue = value;
  } else {
    var i = Math.floor(hue * 6);
    var f = hue * 6 - i;
    var p = value * (1 - saturation);
    var q = value * (1 - saturation * f);
    var t = value * (1 - saturation * (1 - f));
    switch (i) {
      case 1:
        red = q;
        green = value;
        blue = p;
        break;
      case 2:
        red = p;
        green = value;
        blue = t;
        break;
      case 3:
        red = p;
        green = q;
        blue = value;
        break;
      case 4:
        red = t;
        green = p;
        blue = value;
        break;
      case 5:
        red = value;
        green = p;
        blue = q;
        break;
      case 6: // fall through
      case 0:
        red = value;
        green = t;
        blue = p;
        break;
    }
  }
  red = Math.floor(255 * red + 0.5);
  green = Math.floor(255 * green + 0.5);
  blue = Math.floor(255 * blue + 0.5);
  return 'rgb(' + red + ',' + green + ',' + blue + ')';
}

/**
 * Find the coordinates of an object relative to the top left of the page.
 *
 * @param {Node} obj
 * @return {{x:number,y:number}}
 * @private
 */
function findPos(obj) {
  var p = obj.getBoundingClientRect(),
    w = window,
    d = document.documentElement;
  return {
    x: p.left + (w.pageXOffset || d.scrollLeft),
    y: p.top + (w.pageYOffset || d.scrollTop)
  };
}

/**
 * Returns the x-coordinate of the event in a coordinate system where the
 * top-left corner of the page (not the window) is (0,0).
 * Taken from MochiKit.Signal
 * @param {!Event} e
 * @return {number}
 * @private
 */
function pageX(e) {
  return !e.pageX || e.pageX < 0 ? 0 : e.pageX;
}

/**
 * Returns the y-coordinate of the event in a coordinate system where the
 * top-left corner of the page (not the window) is (0,0).
 * Taken from MochiKit.Signal
 * @param {!Event} e
 * @return {number}
 * @private
 */
function pageY(e) {
  return !e.pageY || e.pageY < 0 ? 0 : e.pageY;
}

/**
 * Converts page the x-coordinate of the event to pixel x-coordinates on the
 * canvas (i.e. DOM Coords).
 * @param {!Event} e Drag event.
 * @param {!DygraphInteractionContext} context Interaction context object.
 * @return {number} The amount by which the drag has moved to the right.
 */
function dragGetX_(e, context) {
  return pageX(e) - context.px;
}

/**
 * Converts page the y-coordinate of the event to pixel y-coordinates on the
 * canvas (i.e. DOM Coords).
 * @param {!Event} e Drag event.
 * @param {!DygraphInteractionContext} context Interaction context object.
 * @return {number} The amount by which the drag has moved down.
 */
function dragGetY_(e, context) {
  return pageY(e) - context.py;
}

/**
 * This returns true unless the parameter is 0, null, undefined or NaN.
 * TODO(danvk): rename this function to something like 'isNonZeroNan'.
 *
 * @param {number} x The number to consider.
 * @return {boolean} Whether the number is zero or NaN.
 * @private
 */
function isOK(x) {
  return !!x && !isNaN(x);
}

/**
 * @param {{x:?number,y:?number,yval:?number}} p The point to consider, valid
 *     points are {x, y} objects
 * @param {boolean=} opt_allowNaNY Treat point with y=NaN as valid
 * @return {boolean} Whether the point has numeric x and y.
 * @private
 */
function isValidPoint(p, opt_allowNaNY) {
  if (!p) return false; // null or undefined object
  if (p.yval === null) return false; // missing point
  if (p.x === null || p.x === undefined) return false;
  if (p.y === null || p.y === undefined) return false;
  if (isNaN(p.x) || !opt_allowNaNY && isNaN(p.y)) return false;
  return true;
}

/**
 * Number formatting function which mimics the behavior of %g in printf, i.e.
 * either exponential or fixed format (without trailing 0s) is used depending on
 * the length of the generated string.  The advantage of this format is that
 * there is a predictable upper bound on the resulting string length,
 * significant figures are not dropped, and normal numbers are not displayed in
 * exponential notation.
 *
 * NOTE: JavaScript's native toPrecision() is NOT a drop-in replacement for %g.
 * It creates strings which are too long for absolute values between 10^-4 and
 * 10^-6, e.g. '0.00001' instead of '1e-5'. See tests/number-format.html for
 * output examples.
 *
 * @param {number} x The number to format
 * @param {number=} opt_precision The precision to use, default 2.
 * @return {string} A string formatted like %g in printf.  The max generated
 *                  string length should be precision + 6 (e.g 1.123e+300).
 */
function floatFormat(x, opt_precision) {
  // Avoid invalid precision values; [1, 21] is the valid range.
  var p = Math.min(Math.max(1, opt_precision || 2), 21);

  // This is deceptively simple.  The actual algorithm comes from:
  //
  // Max allowed length = p + 4
  // where 4 comes from 'e+n' and '.'.
  //
  // Length of fixed format = 2 + y + p
  // where 2 comes from '0.' and y = # of leading zeroes.
  //
  // Equating the two and solving for y yields y = 2, or 0.00xxxx which is
  // 1.0e-3.
  //
  // Since the behavior of toPrecision() is identical for larger numbers, we
  // don't have to worry about the other bound.
  //
  // Finally, the argument for toExponential() is the number of trailing digits,
  // so we take off 1 for the value before the '.'.
  return Math.abs(x) < 1.0e-3 && x !== 0.0 ? x.toExponential(p - 1) : x.toPrecision(p);
}

/**
 * Converts '9' to '09' (useful for dates)
 * @param {number} x
 * @return {string}
 * @private
 */
function zeropad(x) {
  if (x < 10) return "0" + x;else return "" + x;
}

/**
 * Date accessors to get the parts of a calendar date (year, month,
 * day, hour, minute, second and millisecond) according to local time,
 * and factory method to call the Date constructor with an array of arguments.
 */
var DateAccessorsLocal = {
  getFullYear: function getFullYear(d) {
    return d.getFullYear();
  },
  getMonth: function getMonth(d) {
    return d.getMonth();
  },
  getDate: function getDate(d) {
    return d.getDate();
  },
  getHours: function getHours(d) {
    return d.getHours();
  },
  getMinutes: function getMinutes(d) {
    return d.getMinutes();
  },
  getSeconds: function getSeconds(d) {
    return d.getSeconds();
  },
  getMilliseconds: function getMilliseconds(d) {
    return d.getMilliseconds();
  },
  getDay: function getDay(d) {
    return d.getDay();
  },
  makeDate: function makeDate(y, m, d, hh, mm, ss, ms) {
    return new Date(y, m, d, hh, mm, ss, ms);
  }
};

/**
 * Date accessors to get the parts of a calendar date (year, month,
 * day of month, hour, minute, second and millisecond) according to UTC time,
 * and factory method to call the Date constructor with an array of arguments.
 */
exports.DateAccessorsLocal = DateAccessorsLocal;
var DateAccessorsUTC = {
  getFullYear: function getFullYear(d) {
    return d.getUTCFullYear();
  },
  getMonth: function getMonth(d) {
    return d.getUTCMonth();
  },
  getDate: function getDate(d) {
    return d.getUTCDate();
  },
  getHours: function getHours(d) {
    return d.getUTCHours();
  },
  getMinutes: function getMinutes(d) {
    return d.getUTCMinutes();
  },
  getSeconds: function getSeconds(d) {
    return d.getUTCSeconds();
  },
  getMilliseconds: function getMilliseconds(d) {
    return d.getUTCMilliseconds();
  },
  getDay: function getDay(d) {
    return d.getUTCDay();
  },
  makeDate: function makeDate(y, m, d, hh, mm, ss, ms) {
    return new Date(Date.UTC(y, m, d, hh, mm, ss, ms));
  }
};

/**
 * Return a string version of the hours, minutes and seconds portion of a date.
 * @param {number} hh The hours (from 0-23)
 * @param {number} mm The minutes (from 0-59)
 * @param {number} ss The seconds (from 0-59)
 * @return {string} A time of the form "HH:MM" or "HH:MM:SS"
 * @private
 */
exports.DateAccessorsUTC = DateAccessorsUTC;
function hmsString_(hh, mm, ss, ms) {
  var ret = zeropad(hh) + ":" + zeropad(mm);
  if (ss) {
    ret += ":" + zeropad(ss);
    if (ms) {
      var str = "" + ms;
      ret += "." + ('000' + str).substring(str.length);
    }
  }
  return ret;
}

/**
 * Convert a JS date (millis since epoch) to a formatted string.
 * @param {number} time The JavaScript time value (ms since epoch)
 * @param {boolean} utc Whether output UTC or local time
 * @return {string} A date of one of these forms:
 *     "YYYY/MM/DD", "YYYY/MM/DD HH:MM" or "YYYY/MM/DD HH:MM:SS"
 * @private
 */
function dateString_(time, utc) {
  var accessors = utc ? DateAccessorsUTC : DateAccessorsLocal;
  var date = new Date(time);
  var y = accessors.getFullYear(date);
  var m = accessors.getMonth(date);
  var d = accessors.getDate(date);
  var hh = accessors.getHours(date);
  var mm = accessors.getMinutes(date);
  var ss = accessors.getSeconds(date);
  var ms = accessors.getMilliseconds(date);
  // Get a year string:
  var year = "" + y;
  // Get a 0 padded month string
  var month = zeropad(m + 1); //months are 0-offset, sigh
  // Get a 0 padded day string
  var day = zeropad(d);
  var frac = hh * 3600 + mm * 60 + ss + 1e-3 * ms;
  var ret = year + "/" + month + "/" + day;
  if (frac) {
    ret += " " + hmsString_(hh, mm, ss, ms);
  }
  return ret;
}

/**
 * Round a number to the specified number of digits past the decimal point.
 * @param {number} num The number to round
 * @param {number} places The number of decimals to which to round
 * @return {number} The rounded number
 * @private
 */
function round_(num, places) {
  var shift = Math.pow(10, places);
  return Math.round(num * shift) / shift;
}

/**
 * Implementation of binary search over an array.
 * Currently does not work when val is outside the range of arry's values.
 * @param {number} val the value to search for
 * @param {Array.<number>} arry is the value over which to search
 * @param {number} abs If abs > 0, find the lowest entry greater than val
 *     If abs < 0, find the highest entry less than val.
 *     If abs == 0, find the entry that equals val.
 * @param {number=} low The first index in arry to consider (optional)
 * @param {number=} high The last index in arry to consider (optional)
 * @return {number} Index of the element, or -1 if it isn't found.
 * @private
 */
function binarySearch(val, arry, abs, low, high) {
  if (low === null || low === undefined || high === null || high === undefined) {
    low = 0;
    high = arry.length - 1;
  }
  if (low > high) {
    return -1;
  }
  if (abs === null || abs === undefined) {
    abs = 0;
  }
  var validIndex = function validIndex(idx) {
    return idx >= 0 && idx < arry.length;
  };
  var mid = parseInt((low + high) / 2, 10);
  var element = arry[mid];
  var idx;
  if (element == val) {
    return mid;
  } else if (element > val) {
    if (abs > 0) {
      // Accept if element > val, but also if prior element < val.
      idx = mid - 1;
      if (validIndex(idx) && arry[idx] < val) {
        return mid;
      }
    }
    return binarySearch(val, arry, abs, low, mid - 1);
  } else if (element < val) {
    if (abs < 0) {
      // Accept if element < val, but also if prior element > val.
      idx = mid + 1;
      if (validIndex(idx) && arry[idx] > val) {
        return mid;
      }
    }
    return binarySearch(val, arry, abs, mid + 1, high);
  }
  return -1; // can't actually happen, but makes closure compiler happy
}

/**
 * Parses a date, returning the number of milliseconds since epoch. This can be
 * passed in as an xValueParser in the Dygraph constructor.
 * TODO(danvk): enumerate formats that this understands.
 *
 * @param {string} dateStr A date in a variety of possible string formats.
 * @return {number} Milliseconds since epoch.
 * @private
 */
function dateParser(dateStr) {
  var dateStrSlashed;
  var d;

  // Let the system try the format first, with one caveat:
  // YYYY-MM-DD[ HH:MM:SS] is interpreted as UTC by a variety of browsers.
  // dygraphs displays dates in local time, so this will result in surprising
  // inconsistencies. But if you specify "T" or "Z" (i.e. YYYY-MM-DDTHH:MM:SS),
  // then you probably know what you're doing, so we'll let you go ahead.
  // Issue: http://code.google.com/p/dygraphs/issues/detail?id=255
  if (dateStr.search("-") == -1 || dateStr.search("T") != -1 || dateStr.search("Z") != -1) {
    d = dateStrToMillis(dateStr);
    if (d && !isNaN(d)) return d;
  }
  if (dateStr.search("-") != -1) {
    // e.g. '2009-7-12' or '2009-07-12'
    dateStrSlashed = dateStr.replace("-", "/", "g");
    while (dateStrSlashed.search("-") != -1) {
      dateStrSlashed = dateStrSlashed.replace("-", "/");
    }
    d = dateStrToMillis(dateStrSlashed);
  } else {
    // Any format that Date.parse will accept, e.g. "2009/07/12" or
    // "2009/07/12 12:34:56"
    d = dateStrToMillis(dateStr);
  }
  if (!d || isNaN(d)) {
    console.error("Couldn't parse " + dateStr + " as a date");
  }
  return d;
}

/**
 * This is identical to JavaScript's built-in Date.parse() method, except that
 * it doesn't get replaced with an incompatible method by aggressive JS
 * libraries like MooTools or Joomla.
 * @param {string} str The date string, e.g. "2011/05/06"
 * @return {number} millis since epoch
 * @private
 */
function dateStrToMillis(str) {
  return new Date(str).getTime();
}

// These functions are all based on MochiKit.
/**
 * Copies all the properties from o to self.
 *
 * @param {!Object} self
 * @param {!Object} o
 * @return {!Object}
 */
function update(self, o) {
  if (typeof o != 'undefined' && o !== null) {
    for (var k in o) {
      if (o.hasOwnProperty(k)) {
        self[k] = o[k];
      }
    }
  }
  return self;
}

// internal: check if o is a DOM node, and we know it’s not null
var _isNode = typeof Node !== 'undefined' && Node !== null && typeof Node === 'object' ? function _isNode(o) {
  return o instanceof Node;
} : function _isNode(o) {
  return typeof o === 'object' && typeof o.nodeType === 'number' && typeof o.nodeName === 'string';
};

/**
 * Copies all the properties from o to self.
 *
 * @param {!Object} self
 * @param {!Object} o
 * @return {!Object}
 * @private
 */
function updateDeep(self, o) {
  if (typeof o != 'undefined' && o !== null) {
    for (var k in o) {
      if (o.hasOwnProperty(k)) {
        var v = o[k];
        if (v === null) {
          self[k] = null;
        } else if (isArrayLike(v)) {
          self[k] = v.slice();
        } else if (_isNode(v)) {
          // DOM objects are shallowly-copied.
          self[k] = v;
        } else if (typeof v == 'object') {
          if (typeof self[k] != 'object' || self[k] === null) {
            self[k] = {};
          }
          updateDeep(self[k], v);
        } else {
          self[k] = v;
        }
      }
    }
  }
  return self;
}

/**
 * @param {*} o
 * @return {string}
 * @private
 */
function typeArrayLike(o) {
  if (o === null) return 'null';
  var t = typeof o;
  if ((t === 'object' || t === 'function' && typeof o.item === 'function') && typeof o.length === 'number' && o.nodeType !== 3 && o.nodeType !== 4) return 'array';
  return t;
}

/**
 * @param {*} o
 * @return {boolean}
 * @private
 */
function isArrayLike(o) {
  var t = typeof o;
  return o !== null && (t === 'object' || t === 'function' && typeof o.item === 'function') && typeof o.length === 'number' && o.nodeType !== 3 && o.nodeType !== 4;
}

/**
 * @param {Object} o
 * @return {boolean}
 * @private
 */
function isDateLike(o) {
  return o !== null && typeof o === 'object' && typeof o.getTime === 'function';
}

/**
 * Note: this only seems to work for arrays.
 * @param {!Array} o
 * @return {!Array}
 * @private
 */
function clone(o) {
  // TODO(danvk): figure out how MochiKit's version works
  var r = [];
  for (var i = 0; i < o.length; i++) {
    if (isArrayLike(o[i])) {
      r.push(clone(o[i]));
    } else {
      r.push(o[i]);
    }
  }
  return r;
}

/**
 * Create a new canvas element.
 *
 * @return {!HTMLCanvasElement}
 * @private
 */
function createCanvas() {
  return document.createElement('canvas');
}

/**
 * Returns the context's pixel ratio, which is the ratio between the device
 * pixel ratio and the backing store ratio. Typically this is 1 for conventional
 * displays, and > 1 for HiDPI displays (such as the Retina MBP).
 * See http://www.html5rocks.com/en/tutorials/canvas/hidpi/ for more details.
 *
 * @param {!CanvasRenderingContext2D} context The canvas's 2d context.
 * @return {number} The ratio of the device pixel ratio and the backing store
 * ratio for the specified context.
 */
function getContextPixelRatio(context) {
  try {
    var devicePixelRatio = window.devicePixelRatio;
    var backingStoreRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
    if (devicePixelRatio !== undefined) {
      return devicePixelRatio / backingStoreRatio;
    } else {
      // At least devicePixelRatio must be defined for this ratio to make sense.
      // We default backingStoreRatio to 1: this does not exist on some browsers
      // (i.e. desktop Chrome).
      return 1;
    }
  } catch (e) {
    return 1;
  }
}

/**
 * TODO(danvk): use @template here when it's better supported for classes.
 * @param {!Array} array
 * @param {number} start
 * @param {number} length
 * @param {function(!Array,?):boolean=} predicate
 * @constructor
 */
function Iterator(array, start, length, predicate) {
  start = start || 0;
  length = length || array.length;
  this.hasNext = true; // Use to identify if there's another element.
  this.peek = null; // Use for look-ahead
  this.start_ = start;
  this.array_ = array;
  this.predicate_ = predicate;
  this.end_ = Math.min(array.length, start + length);
  this.nextIdx_ = start - 1; // use -1 so initial advance works.
  this.next(); // ignoring result.
}

/**
 * @return {Object}
 */
Iterator.prototype.next = function () {
  if (!this.hasNext) {
    return null;
  }
  var obj = this.peek;
  var nextIdx = this.nextIdx_ + 1;
  var found = false;
  while (nextIdx < this.end_) {
    if (!this.predicate_ || this.predicate_(this.array_, nextIdx)) {
      this.peek = this.array_[nextIdx];
      found = true;
      break;
    }
    nextIdx++;
  }
  this.nextIdx_ = nextIdx;
  if (!found) {
    this.hasNext = false;
    this.peek = null;
  }
  return obj;
};

/**
 * Returns a new iterator over array, between indexes start and
 * start + length, and only returns entries that pass the accept function
 *
 * @param {!Array} array the array to iterate over.
 * @param {number} start the first index to iterate over, 0 if absent.
 * @param {number} length the number of elements in the array to iterate over.
 *     This, along with start, defines a slice of the array, and so length
 *     doesn't imply the number of elements in the iterator when accept doesn't
 *     always accept all values. array.length when absent.
 * @param {function(?):boolean=} opt_predicate a function that takes
 *     parameters array and idx, which returns true when the element should be
 *     returned.  If omitted, all elements are accepted.
 * @private
 */
function createIterator(array, start, length, opt_predicate) {
  return new Iterator(array, start, length, opt_predicate);
}

// Shim layer with setTimeout fallback.
// From: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// Should be called with the window context:
//   Dygraph.requestAnimFrame.call(window, function() {})
var requestAnimFrame = function () {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
    window.setTimeout(callback, 1000 / 60);
  };
}();

/**
 * Call a function at most maxFrames times at an attempted interval of
 * framePeriodInMillis, then call a cleanup function once. repeatFn is called
 * once immediately, then at most (maxFrames - 1) times asynchronously. If
 * maxFrames==1, then cleanup_fn() is also called synchronously.  This function
 * is used to sequence animation.
 * @param {function(number)} repeatFn Called repeatedly -- takes the frame
 *     number (from 0 to maxFrames-1) as an argument.
 * @param {number} maxFrames The max number of times to call repeatFn
 * @param {number} framePeriodInMillis Max requested time between frames.
 * @param {function()} cleanupFn A function to call after all repeatFn calls.
 * @private
 */
exports.requestAnimFrame = requestAnimFrame;
function repeatAndCleanup(repeatFn, maxFrames, framePeriodInMillis, cleanupFn) {
  var frameNumber = 0;
  var previousFrameNumber;
  var startTime = new Date().getTime();
  repeatFn(frameNumber);
  if (maxFrames == 1) {
    cleanupFn();
    return;
  }
  var maxFrameArg = maxFrames - 1;
  (function loop() {
    if (frameNumber >= maxFrames) return;
    requestAnimFrame.call(window, function () {
      // Determine which frame to draw based on the delay so far.  Will skip
      // frames if necessary.
      var currentTime = new Date().getTime();
      var delayInMillis = currentTime - startTime;
      previousFrameNumber = frameNumber;
      frameNumber = Math.floor(delayInMillis / framePeriodInMillis);
      var frameDelta = frameNumber - previousFrameNumber;
      // If we predict that the subsequent repeatFn call will overshoot our
      // total frame target, so our last call will cause a stutter, then jump to
      // the last call immediately.  If we're going to cause a stutter, better
      // to do it faster than slower.
      var predictOvershootStutter = frameNumber + frameDelta > maxFrameArg;
      if (predictOvershootStutter || frameNumber >= maxFrameArg) {
        repeatFn(maxFrameArg); // Ensure final call with maxFrameArg.
        cleanupFn();
      } else {
        if (frameDelta !== 0) {
          // Don't call repeatFn with duplicate frames.
          repeatFn(frameNumber);
        }
        loop();
      }
    });
  })();
}

// A whitelist of options that do not change pixel positions.
var pixelSafeOptions = {
  'annotationClickHandler': true,
  'annotationDblClickHandler': true,
  'annotationMouseOutHandler': true,
  'annotationMouseOverHandler': true,
  'axisLineColor': true,
  'axisLineWidth': true,
  'clickCallback': true,
  'drawCallback': true,
  'drawHighlightPointCallback': true,
  'drawPoints': true,
  'drawPointCallback': true,
  'drawGrid': true,
  'fillAlpha': true,
  'gridLineColor': true,
  'gridLineWidth': true,
  'hideOverlayOnMouseOut': true,
  'highlightCallback': true,
  'highlightCircleSize': true,
  'interactionModel': true,
  'labelsDiv': true,
  'labelsKMB': true,
  'labelsKMG2': true,
  'labelsSeparateLines': true,
  'labelsShowZeroValues': true,
  'legend': true,
  'panEdgeFraction': true,
  'pixelsPerYLabel': true,
  'pointClickCallback': true,
  'pointSize': true,
  'rangeSelectorPlotFillColor': true,
  'rangeSelectorPlotFillGradientColor': true,
  'rangeSelectorPlotStrokeColor': true,
  'rangeSelectorBackgroundStrokeColor': true,
  'rangeSelectorBackgroundLineWidth': true,
  'rangeSelectorPlotLineWidth': true,
  'rangeSelectorForegroundStrokeColor': true,
  'rangeSelectorForegroundLineWidth': true,
  'rangeSelectorAlpha': true,
  'showLabelsOnHighlight': true,
  'showRoller': true,
  'strokeWidth': true,
  'underlayCallback': true,
  'unhighlightCallback': true,
  'zoomCallback': true
};

/**
 * This function will scan the option list and determine if they
 * require us to recalculate the pixel positions of each point.
 * TODO: move this into dygraph-options.js
 * @param {!Array.<string>} labels a list of options to check.
 * @param {!Object} attrs
 * @return {boolean} true if the graph needs new points else false.
 * @private
 */
function isPixelChangingOptionList(labels, attrs) {
  // Assume that we do not require new points.
  // This will change to true if we actually do need new points.

  // Create a dictionary of series names for faster lookup.
  // If there are no labels, then the dictionary stays empty.
  var seriesNamesDictionary = {};
  if (labels) {
    for (var i = 1; i < labels.length; i++) {
      seriesNamesDictionary[labels[i]] = true;
    }
  }

  // Scan through a flat (i.e. non-nested) object of options.
  // Returns true/false depending on whether new points are needed.
  var scanFlatOptions = function scanFlatOptions(options) {
    for (var property in options) {
      if (options.hasOwnProperty(property) && !pixelSafeOptions[property]) {
        return true;
      }
    }
    return false;
  };

  // Iterate through the list of updated options.
  for (var property in attrs) {
    if (!attrs.hasOwnProperty(property)) continue;

    // Find out of this field is actually a series specific options list.
    if (property == 'highlightSeriesOpts' || seriesNamesDictionary[property] && !attrs.series) {
      // This property value is a list of options for this series.
      if (scanFlatOptions(attrs[property])) return true;
    } else if (property == 'series' || property == 'axes') {
      // This is twice-nested options list.
      var perSeries = attrs[property];
      for (var series in perSeries) {
        if (perSeries.hasOwnProperty(series) && scanFlatOptions(perSeries[series])) {
          return true;
        }
      }
    } else {
      // If this was not a series specific option list,
      // check if it's a pixel-changing property.
      if (!pixelSafeOptions[property]) return true;
    }
  }
  return false;
}
var Circles = {
  DEFAULT: function DEFAULT(g, name, ctx, canvasx, canvasy, color, radius) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(canvasx, canvasy, radius, 0, 2 * Math.PI, false);
    ctx.fill();
  }
  // For more shapes, include extras/shapes.js
};

/**
 * Determine whether |data| is delimited by CR, CRLF, LF, LFCR.
 * @param {string} data
 * @return {?string} the delimiter that was detected (or null on failure).
 */
exports.Circles = Circles;
function detectLineDelimiter(data) {
  for (var i = 0; i < data.length; i++) {
    var code = data.charAt(i);
    if (code === '\r') {
      // Might actually be "\r\n".
      if (i + 1 < data.length && data.charAt(i + 1) === '\n') {
        return '\r\n';
      }
      return code;
    }
    if (code === '\n') {
      // Might actually be "\n\r".
      if (i + 1 < data.length && data.charAt(i + 1) === '\r') {
        return '\n\r';
      }
      return code;
    }
  }
  return null;
}

/**
 * Is one node contained by another?
 * @param {Node} containee The contained node.
 * @param {Node} container The container node.
 * @return {boolean} Whether containee is inside (or equal to) container.
 * @private
 */
function isNodeContainedBy(containee, container) {
  if (container === null || containee === null) {
    return false;
  }
  var containeeNode = /** @type {Node} */containee;
  while (containeeNode && containeeNode !== container) {
    containeeNode = containeeNode.parentNode;
  }
  return containeeNode === container;
}

// This masks some numeric issues in older versions of Firefox,
// where 1.0/Math.pow(10,2) != Math.pow(10,-2).
/** @type {function(number,number):number} */
function pow(base, exp) {
  if (exp < 0) {
    return 1.0 / Math.pow(base, -exp);
  }
  return Math.pow(base, exp);
}
var RGBAxRE = /^#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})?$/;
var RGBA_RE = /^rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(?:,\s*([01](?:\.\d+)?))?\)$/;

/**
 * Helper for toRGB_ which parses strings of the form:
 * #RRGGBB (hex)
 * #RRGGBBAA (hex)
 * rgb(123, 45, 67)
 * rgba(123, 45, 67, 0.5)
 * @return parsed {r,g,b,a?} tuple or null.
 */
function parseRGBA(rgbStr) {
  var bits,
    r,
    g,
    b,
    a = null;
  if (bits = RGBAxRE.exec(rgbStr)) {
    r = parseInt(bits[1], 16);
    g = parseInt(bits[2], 16);
    b = parseInt(bits[3], 16);
    if (bits[4]) a = parseInt(bits[4], 16);
  } else if (bits = RGBA_RE.exec(rgbStr)) {
    r = parseInt(bits[1], 10);
    g = parseInt(bits[2], 10);
    b = parseInt(bits[3], 10);
    if (bits[4]) a = parseFloat(bits[4]);
  } else return null;
  if (a !== null) return {
    "r": r,
    "g": g,
    "b": b,
    "a": a
  };
  return {
    "r": r,
    "g": g,
    "b": b
  };
}

/**
 * Converts any valid CSS color (hex, rgb(), named color) to an RGB tuple.
 *
 * @param {!string} colorStr Any valid CSS color string.
 * @return {{r:number,g:number,b:number,a:number?}} Parsed RGB tuple.
 * @private
 */
function toRGB_(colorStr) {
  // Strategy: First try to parse colorStr directly. This is fast & avoids DOM
  // manipulation.  If that fails (e.g. for named colors like 'red'), then
  // create a hidden DOM element and parse its computed color.
  var rgb = parseRGBA(colorStr);
  if (rgb) return rgb;
  var div = document.createElement('div');
  div.style.backgroundColor = colorStr;
  div.style.visibility = 'hidden';
  document.body.appendChild(div);
  var rgbStr = window.getComputedStyle(div, null).backgroundColor;
  document.body.removeChild(div);
  return parseRGBA(rgbStr);
}

/**
 * Checks whether the browser supports the &lt;canvas&gt; tag.
 * @param {HTMLCanvasElement=} opt_canvasElement Pass a canvas element as an
 *     optimization if you have one.
 * @return {boolean} Whether the browser supports canvas.
 */
function isCanvasSupported(opt_canvasElement) {
  try {
    var canvas = opt_canvasElement || document.createElement("canvas");
    canvas.getContext("2d");
  } catch (e) {
    return false;
  }
  return true;
}

/**
 * Parses the value as a floating point number. This is like the parseFloat()
 * built-in, but with a few differences:
 * - the empty string is parsed as null, rather than NaN.
 * - if the string cannot be parsed at all, an error is logged.
 * If the string can't be parsed, this method returns null.
 * @param {string} x The string to be parsed
 * @param {number=} opt_line_no The line number from which the string comes.
 * @param {string=} opt_line The text of the line from which the string comes.
 */
function parseFloat_(x, opt_line_no, opt_line) {
  var val = parseFloat(x);
  if (!isNaN(val)) return val;

  // Try to figure out what happeend.
  // If the value is the empty string, parse it as null.
  if (/^ *$/.test(x)) return null;

  // If it was actually "NaN", return it as NaN.
  if (/^ *nan *$/i.test(x)) return NaN;

  // Looks like a parsing error.
  var msg = "Unable to parse '" + x + "' as a number";
  if (opt_line !== undefined && opt_line_no !== undefined) {
    msg += " on line " + (1 + (opt_line_no || 0)) + " ('" + opt_line + "') of CSV.";
  }
  console.error(msg);
  return null;
}

// Label constants for the labelsKMB and labelsKMG2 options.
// (i.e. '100000' -> '100k')
var KMB_LABELS_LARGE = ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
var KMB_LABELS_SMALL = ['m', 'µ', 'n', 'p', 'f', 'a', 'z', 'y'];
var KMG2_LABELS_LARGE = ['Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi', 'Yi'];
var KMG2_LABELS_SMALL = ['p-10', 'p-20', 'p-30', 'p-40', 'p-50', 'p-60', 'p-70', 'p-80'];
/* if both are given (legacy/deprecated use only) */
var KMB2_LABELS_LARGE = ['K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
var KMB2_LABELS_SMALL = KMB_LABELS_SMALL;

/**
 * @private
 * Return a string version of a number. This respects the digitsAfterDecimal
 * and maxNumberWidth options.
 * @param {number} x The number to be formatted
 * @param {Dygraph} opts An options view
 */
function numberValueFormatter(x, opts) {
  var sigFigs = opts('sigFigs');
  if (sigFigs !== null) {
    // User has opted for a fixed number of significant figures.
    return floatFormat(x, sigFigs);
  }

  // shortcut 0 so later code does not need to worry about it
  if (x === 0.0) return '0';
  var digits = opts('digitsAfterDecimal');
  var maxNumberWidth = opts('maxNumberWidth');
  var kmb = opts('labelsKMB');
  var kmg2 = opts('labelsKMG2');
  var label;
  var absx = Math.abs(x);
  if (kmb || kmg2) {
    var k;
    var k_labels = [];
    var m_labels = [];
    if (kmb) {
      k = 1000;
      k_labels = KMB_LABELS_LARGE;
      m_labels = KMB_LABELS_SMALL;
    }
    if (kmg2) {
      k = 1024;
      k_labels = KMG2_LABELS_LARGE;
      m_labels = KMG2_LABELS_SMALL;
      if (kmb) {
        k_labels = KMB2_LABELS_LARGE;
        m_labels = KMB2_LABELS_SMALL;
      }
    }
    var n;
    var j;
    if (absx >= k) {
      j = k_labels.length;
      while (j > 0) {
        n = pow(k, j);
        --j;
        if (absx >= n) {
          // guaranteed to hit because absx >= k (pow(k, 1))
          // if immensely large still switch to scientific notation
          if (absx / n >= Math.pow(10, maxNumberWidth)) label = x.toExponential(digits);else label = round_(x / n, digits) + k_labels[j];
          return label;
        }
      }
      // not reached, fall through safely though should it ever be
    } else if (absx < 1 /* && (m_labels.length > 0) */) {
      j = 0;
      while (j < m_labels.length) {
        ++j;
        n = pow(k, j);
        if (absx * n >= 1) break;
      }
      // if _still_ too small, switch to scientific notation instead
      if (absx * n < Math.pow(10, -digits)) label = x.toExponential(digits);else label = round_(x * n, digits) + m_labels[j - 1];
      return label;
    }
    // else fall through
  }

  if (absx >= Math.pow(10, maxNumberWidth) || absx < Math.pow(10, -digits)) {
    // switch to scientific notation if we underflow or overflow fixed display
    label = x.toExponential(digits);
  } else {
    label = '' + round_(x, digits);
  }
  return label;
}

/**
 * variant for use as an axisLabelFormatter.
 * @private
 */
function numberAxisLabelFormatter(x, granularity, opts) {
  return numberValueFormatter.call(this, x, opts);
}

/**
 * @type {!Array.<string>}
 * @private
 * @constant
 */
var SHORT_MONTH_NAMES_ = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Convert a JS date to a string appropriate to display on an axis that
 * is displaying values at the stated granularity. This respects the
 * labelsUTC option.
 * @param {Date} date The date to format
 * @param {number} granularity One of the Dygraph granularity constants
 * @param {Dygraph} opts An options view
 * @return {string} The date formatted as local time
 * @private
 */
function dateAxisLabelFormatter(date, granularity, opts) {
  var utc = opts('labelsUTC');
  var accessors = utc ? DateAccessorsUTC : DateAccessorsLocal;
  var year = accessors.getFullYear(date),
    month = accessors.getMonth(date),
    day = accessors.getDate(date),
    hours = accessors.getHours(date),
    mins = accessors.getMinutes(date),
    secs = accessors.getSeconds(date),
    millis = accessors.getMilliseconds(date);
  if (granularity >= DygraphTickers.Granularity.DECADAL) {
    return '' + year;
  } else if (granularity >= DygraphTickers.Granularity.MONTHLY) {
    return SHORT_MONTH_NAMES_[month] + '&#160;' + year;
  } else {
    var frac = hours * 3600 + mins * 60 + secs + 1e-3 * millis;
    if (frac === 0 || granularity >= DygraphTickers.Granularity.DAILY) {
      // e.g. '21 Jan' (%d%b)
      return zeropad(day) + '&#160;' + SHORT_MONTH_NAMES_[month];
    } else if (granularity < DygraphTickers.Granularity.SECONDLY) {
      // e.g. 40.310 (meaning 40 seconds and 310 milliseconds)
      var str = "" + millis;
      return zeropad(secs) + "." + ('000' + str).substring(str.length);
    } else if (granularity > DygraphTickers.Granularity.MINUTELY) {
      return hmsString_(hours, mins, secs, 0);
    } else {
      return hmsString_(hours, mins, secs, millis);
    }
  }
}

/**
 * Return a string version of a JS date for a value label. This respects the
 * labelsUTC option.
 * @param {Date} date The date to be formatted
 * @param {Dygraph} opts An options view
 * @private
 */
function dateValueFormatter(d, opts) {
  return dateString_(d, opts('labelsUTC'));
}

// stuff for simple onDOMready implementation
var deferDOM_callbacks = [];
var deferDOM_handlerCalled = false;

// onDOMready once DOM is ready
/**
 * Simple onDOMready implementation
 * @param {function()} cb The callback to run once the DOM is ready.
 * @return {boolean} whether the DOM is currently ready
 */
function deferDOM_ready(cb) {
  if (typeof cb === "function") cb();
  return true;
}

/**
 * Setup a simple onDOMready implementation on the given objct.
 * @param {*} self the object to update .onDOMready on
 * @private
 */
function setupDOMready_(self) {
  // only attach if there’s a DOM
  if (typeof document !== "undefined") {
    // called by browser
    var handler = function deferDOM_handler() {
      /* execute only once */
      if (deferDOM_handlerCalled) return;
      deferDOM_handlerCalled = true;
      /* subsequent calls must not enqueue */
      self.onDOMready = deferDOM_ready;
      /* clear event handlers */
      document.removeEventListener("DOMContentLoaded", handler, false);
      window.removeEventListener("load", handler, false);
      /* run user callbacks */
      for (var i = 0; i < deferDOM_callbacks.length; ++i) deferDOM_callbacks[i]();
      deferDOM_callbacks = null; //gc
    };

    // make callable (mutating, do not copy)
    self.onDOMready = function deferDOM_initial(cb) {
      /* if possible, skip all that */
      if (document.readyState === "complete") {
        self.onDOMready = deferDOM_ready;
        return deferDOM_ready(cb);
      }
      // onDOMready, after setup, before DOM is ready
      var enqfn = function deferDOM_enqueue(cb) {
        if (typeof cb === "function") deferDOM_callbacks.push(cb);
        return false;
      };
      /* subsequent calls will enqueue */
      self.onDOMready = enqfn;
      /* set up handler */
      document.addEventListener("DOMContentLoaded", handler, false);
      /* last resort: always works, but later than possible */
      window.addEventListener("load", handler, false);
      /* except if DOM got ready in the meantime */
      if (document.readyState === "complete") {
        /* undo all that attaching */
        handler();
        /* goto finish */
        self.onDOMready = deferDOM_ready;
        return deferDOM_ready(cb);
      }
      /* just enqueue that */
      return enqfn(cb);
    };
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0eXBlIiwibyIsIkxPR19TQ0FMRSIsIkxOX1RFTiIsIk1hdGgiLCJsb2ciLCJsb2cxMCIsIngiLCJsb2dSYW5nZUZyYWN0aW9uIiwicjAiLCJyMSIsInBjdCIsImxvZ3IwIiwibG9ncjEiLCJleHBvbmVudCIsInZhbHVlIiwicG93IiwiRE9UVEVEX0xJTkUiLCJEQVNIRURfTElORSIsIkRPVF9EQVNIX0xJTkUiLCJIT1JJWk9OVEFMIiwiVkVSVElDQUwiLCJnZXRDb250ZXh0IiwiY2FudmFzIiwiYWRkRXZlbnQiLCJlbGVtIiwiZm4iLCJhZGRFdmVudExpc3RlbmVyIiwicmVtb3ZlRXZlbnQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiY2FuY2VsRXZlbnQiLCJlIiwid2luZG93IiwiZXZlbnQiLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsImNhbmNlbEJ1YmJsZSIsImNhbmNlbCIsInJldHVyblZhbHVlIiwiaHN2VG9SR0IiLCJodWUiLCJzYXR1cmF0aW9uIiwicmVkIiwiZ3JlZW4iLCJibHVlIiwiaSIsImZsb29yIiwiZiIsInAiLCJxIiwidCIsImZpbmRQb3MiLCJvYmoiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJ3IiwiZCIsImRvY3VtZW50IiwiZG9jdW1lbnRFbGVtZW50IiwibGVmdCIsInBhZ2VYT2Zmc2V0Iiwic2Nyb2xsTGVmdCIsInkiLCJ0b3AiLCJwYWdlWU9mZnNldCIsInNjcm9sbFRvcCIsInBhZ2VYIiwicGFnZVkiLCJkcmFnR2V0WF8iLCJjb250ZXh0IiwicHgiLCJkcmFnR2V0WV8iLCJweSIsImlzT0siLCJpc05hTiIsImlzVmFsaWRQb2ludCIsIm9wdF9hbGxvd05hTlkiLCJ5dmFsIiwidW5kZWZpbmVkIiwiZmxvYXRGb3JtYXQiLCJvcHRfcHJlY2lzaW9uIiwibWluIiwibWF4IiwiYWJzIiwidG9FeHBvbmVudGlhbCIsInRvUHJlY2lzaW9uIiwiemVyb3BhZCIsIkRhdGVBY2Nlc3NvcnNMb2NhbCIsImdldEZ1bGxZZWFyIiwiZ2V0TW9udGgiLCJnZXREYXRlIiwiZ2V0SG91cnMiLCJnZXRNaW51dGVzIiwiZ2V0U2Vjb25kcyIsImdldE1pbGxpc2Vjb25kcyIsImdldERheSIsIm1ha2VEYXRlIiwibSIsImhoIiwibW0iLCJzcyIsIm1zIiwiRGF0ZSIsIkRhdGVBY2Nlc3NvcnNVVEMiLCJnZXRVVENGdWxsWWVhciIsImdldFVUQ01vbnRoIiwiZ2V0VVRDRGF0ZSIsImdldFVUQ0hvdXJzIiwiZ2V0VVRDTWludXRlcyIsImdldFVUQ1NlY29uZHMiLCJnZXRVVENNaWxsaXNlY29uZHMiLCJnZXRVVENEYXkiLCJVVEMiLCJobXNTdHJpbmdfIiwicmV0Iiwic3RyIiwic3Vic3RyaW5nIiwibGVuZ3RoIiwiZGF0ZVN0cmluZ18iLCJ0aW1lIiwidXRjIiwiYWNjZXNzb3JzIiwiZGF0ZSIsInllYXIiLCJtb250aCIsImRheSIsImZyYWMiLCJyb3VuZF8iLCJudW0iLCJwbGFjZXMiLCJzaGlmdCIsInJvdW5kIiwiYmluYXJ5U2VhcmNoIiwidmFsIiwiYXJyeSIsImxvdyIsImhpZ2giLCJ2YWxpZEluZGV4IiwiaWR4IiwibWlkIiwicGFyc2VJbnQiLCJlbGVtZW50IiwiZGF0ZVBhcnNlciIsImRhdGVTdHIiLCJkYXRlU3RyU2xhc2hlZCIsInNlYXJjaCIsImRhdGVTdHJUb01pbGxpcyIsInJlcGxhY2UiLCJjb25zb2xlIiwiZXJyb3IiLCJnZXRUaW1lIiwidXBkYXRlIiwic2VsZiIsImsiLCJoYXNPd25Qcm9wZXJ0eSIsIl9pc05vZGUiLCJOb2RlIiwibm9kZVR5cGUiLCJub2RlTmFtZSIsInVwZGF0ZURlZXAiLCJ2IiwiaXNBcnJheUxpa2UiLCJzbGljZSIsInR5cGVBcnJheUxpa2UiLCJpdGVtIiwiaXNEYXRlTGlrZSIsImNsb25lIiwiciIsInB1c2giLCJjcmVhdGVDYW52YXMiLCJjcmVhdGVFbGVtZW50IiwiZ2V0Q29udGV4dFBpeGVsUmF0aW8iLCJkZXZpY2VQaXhlbFJhdGlvIiwiYmFja2luZ1N0b3JlUmF0aW8iLCJ3ZWJraXRCYWNraW5nU3RvcmVQaXhlbFJhdGlvIiwibW96QmFja2luZ1N0b3JlUGl4ZWxSYXRpbyIsIm1zQmFja2luZ1N0b3JlUGl4ZWxSYXRpbyIsIm9CYWNraW5nU3RvcmVQaXhlbFJhdGlvIiwiYmFja2luZ1N0b3JlUGl4ZWxSYXRpbyIsIkl0ZXJhdG9yIiwiYXJyYXkiLCJzdGFydCIsInByZWRpY2F0ZSIsImhhc05leHQiLCJwZWVrIiwic3RhcnRfIiwiYXJyYXlfIiwicHJlZGljYXRlXyIsImVuZF8iLCJuZXh0SWR4XyIsIm5leHQiLCJwcm90b3R5cGUiLCJuZXh0SWR4IiwiZm91bmQiLCJjcmVhdGVJdGVyYXRvciIsIm9wdF9wcmVkaWNhdGUiLCJyZXF1ZXN0QW5pbUZyYW1lIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwid2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwibW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwib1JlcXVlc3RBbmltYXRpb25GcmFtZSIsIm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwiY2FsbGJhY2siLCJzZXRUaW1lb3V0IiwicmVwZWF0QW5kQ2xlYW51cCIsInJlcGVhdEZuIiwibWF4RnJhbWVzIiwiZnJhbWVQZXJpb2RJbk1pbGxpcyIsImNsZWFudXBGbiIsImZyYW1lTnVtYmVyIiwicHJldmlvdXNGcmFtZU51bWJlciIsInN0YXJ0VGltZSIsIm1heEZyYW1lQXJnIiwibG9vcCIsImNhbGwiLCJjdXJyZW50VGltZSIsImRlbGF5SW5NaWxsaXMiLCJmcmFtZURlbHRhIiwicHJlZGljdE92ZXJzaG9vdFN0dXR0ZXIiLCJwaXhlbFNhZmVPcHRpb25zIiwiaXNQaXhlbENoYW5naW5nT3B0aW9uTGlzdCIsImxhYmVscyIsImF0dHJzIiwic2VyaWVzTmFtZXNEaWN0aW9uYXJ5Iiwic2NhbkZsYXRPcHRpb25zIiwib3B0aW9ucyIsInByb3BlcnR5Iiwic2VyaWVzIiwicGVyU2VyaWVzIiwiQ2lyY2xlcyIsIkRFRkFVTFQiLCJnIiwibmFtZSIsImN0eCIsImNhbnZhc3giLCJjYW52YXN5IiwiY29sb3IiLCJyYWRpdXMiLCJiZWdpblBhdGgiLCJmaWxsU3R5bGUiLCJhcmMiLCJQSSIsImZpbGwiLCJkZXRlY3RMaW5lRGVsaW1pdGVyIiwiZGF0YSIsImNvZGUiLCJjaGFyQXQiLCJpc05vZGVDb250YWluZWRCeSIsImNvbnRhaW5lZSIsImNvbnRhaW5lciIsImNvbnRhaW5lZU5vZGUiLCJwYXJlbnROb2RlIiwiYmFzZSIsImV4cCIsIlJHQkF4UkUiLCJSR0JBX1JFIiwicGFyc2VSR0JBIiwicmdiU3RyIiwiYml0cyIsImIiLCJhIiwiZXhlYyIsInBhcnNlRmxvYXQiLCJ0b1JHQl8iLCJjb2xvclN0ciIsInJnYiIsImRpdiIsInN0eWxlIiwiYmFja2dyb3VuZENvbG9yIiwidmlzaWJpbGl0eSIsImJvZHkiLCJhcHBlbmRDaGlsZCIsImdldENvbXB1dGVkU3R5bGUiLCJyZW1vdmVDaGlsZCIsImlzQ2FudmFzU3VwcG9ydGVkIiwib3B0X2NhbnZhc0VsZW1lbnQiLCJwYXJzZUZsb2F0XyIsIm9wdF9saW5lX25vIiwib3B0X2xpbmUiLCJ0ZXN0IiwiTmFOIiwibXNnIiwiS01CX0xBQkVMU19MQVJHRSIsIktNQl9MQUJFTFNfU01BTEwiLCJLTUcyX0xBQkVMU19MQVJHRSIsIktNRzJfTEFCRUxTX1NNQUxMIiwiS01CMl9MQUJFTFNfTEFSR0UiLCJLTUIyX0xBQkVMU19TTUFMTCIsIm51bWJlclZhbHVlRm9ybWF0dGVyIiwib3B0cyIsInNpZ0ZpZ3MiLCJkaWdpdHMiLCJtYXhOdW1iZXJXaWR0aCIsImttYiIsImttZzIiLCJsYWJlbCIsImFic3giLCJrX2xhYmVscyIsIm1fbGFiZWxzIiwibiIsImoiLCJudW1iZXJBeGlzTGFiZWxGb3JtYXR0ZXIiLCJncmFudWxhcml0eSIsIlNIT1JUX01PTlRIX05BTUVTXyIsImRhdGVBeGlzTGFiZWxGb3JtYXR0ZXIiLCJob3VycyIsIm1pbnMiLCJzZWNzIiwibWlsbGlzIiwiRHlncmFwaFRpY2tlcnMiLCJHcmFudWxhcml0eSIsIkRFQ0FEQUwiLCJNT05USExZIiwiREFJTFkiLCJTRUNPTkRMWSIsIk1JTlVURUxZIiwiZGF0ZVZhbHVlRm9ybWF0dGVyIiwiZGVmZXJET01fY2FsbGJhY2tzIiwiZGVmZXJET01faGFuZGxlckNhbGxlZCIsImRlZmVyRE9NX3JlYWR5IiwiY2IiLCJzZXR1cERPTXJlYWR5XyIsImhhbmRsZXIiLCJkZWZlckRPTV9oYW5kbGVyIiwib25ET01yZWFkeSIsImRlZmVyRE9NX2luaXRpYWwiLCJyZWFkeVN0YXRlIiwiZW5xZm4iLCJkZWZlckRPTV9lbnF1ZXVlIl0sInNvdXJjZXMiOlsiLi4vc3JjL2R5Z3JhcGgtdXRpbHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMTEgRGFuIFZhbmRlcmthbSAoZGFudmRrQGdtYWlsLmNvbSlcbiAqIE1JVC1saWNlbmNlZDogaHR0cHM6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgVGhpcyBmaWxlIGNvbnRhaW5zIHV0aWxpdHkgZnVuY3Rpb25zIHVzZWQgYnkgZHlncmFwaHMuIFRoZXNlXG4gKiBhcmUgdHlwaWNhbGx5IHN0YXRpYyAoaS5lLiBub3QgcmVsYXRlZCB0byBhbnkgcGFydGljdWxhciBkeWdyYXBoKS4gRXhhbXBsZXNcbiAqIGluY2x1ZGUgZGF0ZS90aW1lIGZvcm1hdHRpbmcgZnVuY3Rpb25zLCBiYXNpYyBhbGdvcml0aG1zIChlLmcuIGJpbmFyeVxuICogc2VhcmNoKSBhbmQgZ2VuZXJpYyBET00tbWFuaXB1bGF0aW9uIGZ1bmN0aW9ucy5cbiAqL1xuXG4vKmdsb2JhbCBEeWdyYXBoOmZhbHNlLCBOb2RlOmZhbHNlICovXG5cInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0ICogYXMgRHlncmFwaFRpY2tlcnMgZnJvbSAnLi9keWdyYXBoLXRpY2tlcnMnO1xuXG4vKipcbiAqIEBwYXJhbSB7Kn0gb1xuICogQHJldHVybiB7c3RyaW5nfVxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHR5cGUobykge1xuICByZXR1cm4gKG8gPT09IG51bGwgPyAnbnVsbCcgOiB0eXBlb2YobykpO1xufVxuXG5leHBvcnQgdmFyIExPR19TQ0FMRSA9IDEwO1xuZXhwb3J0IHZhciBMTl9URU4gPSBNYXRoLmxvZyhMT0dfU0NBTEUpO1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge251bWJlcn0geFxuICogQHJldHVybiB7bnVtYmVyfVxuICovXG5leHBvcnQgdmFyIGxvZzEwID0gZnVuY3Rpb24oeCkge1xuICByZXR1cm4gTWF0aC5sb2coeCkgLyBMTl9URU47XG59O1xuXG4vKipcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gcjBcbiAqIEBwYXJhbSB7bnVtYmVyfSByMVxuICogQHBhcmFtIHtudW1iZXJ9IHBjdFxuICogQHJldHVybiB7bnVtYmVyfVxuICovXG5leHBvcnQgdmFyIGxvZ1JhbmdlRnJhY3Rpb24gPSBmdW5jdGlvbihyMCwgcjEsIHBjdCkge1xuICAvLyBDb21wdXRpbmcgdGhlIGludmVyc2Ugb2YgdG9QZXJjZW50WENvb3JkLiBUaGUgZnVuY3Rpb24gd2FzIGFycml2ZWQgYXQgd2l0aFxuICAvLyB0aGUgZm9sbG93aW5nIHN0ZXBzOlxuICAvL1xuICAvLyBPcmlnaW5hbCBjYWxjdWF0aW9uOlxuICAvLyBwY3QgPSAobG9nKHgpIC0gbG9nKHhSYW5nZVswXSkpIC8gKGxvZyh4UmFuZ2VbMV0pIC0gbG9nKHhSYW5nZVswXSkpO1xuICAvL1xuICAvLyBNdWx0aXBseSBib3RoIHNpZGVzIGJ5IHRoZSByaWdodC1zaWRlIGRlbm9taW5hdG9yLlxuICAvLyBwY3QgKiAobG9nKHhSYW5nZVsxXSAtIGxvZyh4UmFuZ2VbMF0pKSkgPSBsb2coeCkgLSBsb2coeFJhbmdlWzBdKVxuICAvL1xuICAvLyBhZGQgbG9nKHhSYW5nZVswXSkgdG8gYm90aCBzaWRlc1xuICAvLyBsb2coeFJhbmdlWzBdKSArIChwY3QgKiAobG9nKHhSYW5nZVsxXSkgLSBsb2coeFJhbmdlWzBdKSkpID0gbG9nKHgpO1xuICAvL1xuICAvLyBTd2FwIGJvdGggc2lkZXMgb2YgdGhlIGVxdWF0aW9uLFxuICAvLyBsb2coeCkgPSBsb2coeFJhbmdlWzBdKSArIChwY3QgKiAobG9nKHhSYW5nZVsxXSkgLSBsb2coeFJhbmdlWzBdKSkpXG4gIC8vXG4gIC8vIFVzZSBib3RoIHNpZGVzIGFzIHRoZSBleHBvbmVudCBpbiAxMF5leHAgYW5kIHdlJ3JlIGRvbmUuXG4gIC8vIHggPSAxMCBeIChsb2coeFJhbmdlWzBdKSArIChwY3QgKiAobG9nKHhSYW5nZVsxXSkgLSBsb2coeFJhbmdlWzBdKSkpKVxuXG4gIHZhciBsb2dyMCA9IGxvZzEwKHIwKTtcbiAgdmFyIGxvZ3IxID0gbG9nMTAocjEpO1xuICB2YXIgZXhwb25lbnQgPSBsb2dyMCArIChwY3QgKiAobG9ncjEgLSBsb2dyMCkpO1xuICB2YXIgdmFsdWUgPSBNYXRoLnBvdyhMT0dfU0NBTEUsIGV4cG9uZW50KTtcbiAgcmV0dXJuIHZhbHVlO1xufTtcblxuLyoqIEEgZG90dGVkIGxpbmUgc3Ryb2tlIHBhdHRlcm4uICovXG5leHBvcnQgdmFyIERPVFRFRF9MSU5FID0gWzIsIDJdO1xuLyoqIEEgZGFzaGVkIGxpbmUgc3Ryb2tlIHBhdHRlcm4uICovXG5leHBvcnQgdmFyIERBU0hFRF9MSU5FID0gWzcsIDNdO1xuLyoqIEEgZG90IGRhc2ggc3Ryb2tlIHBhdHRlcm4uICovXG5leHBvcnQgdmFyIERPVF9EQVNIX0xJTkUgPSBbNywgMiwgMiwgMl07XG5cbi8vIERpcmVjdGlvbnMgZm9yIHBhbm5pbmcgYW5kIHpvb21pbmcuIFVzZSBiaXQgb3BlcmF0aW9ucyB3aGVuIGNvbWJpbmVkXG4vLyB2YWx1ZXMgYXJlIHBvc3NpYmxlLlxuZXhwb3J0IHZhciBIT1JJWk9OVEFMID0gMTtcbmV4cG9ydCB2YXIgVkVSVElDQUwgPSAyO1xuXG4vKipcbiAqIFJldHVybiB0aGUgMmQgY29udGV4dCBmb3IgYSBkeWdyYXBoIGNhbnZhcy5cbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBvbmx5IGV4cG9zZWQgZm9yIHRoZSBzYWtlIG9mIHJlcGxhY2luZyB0aGUgZnVuY3Rpb24gaW5cbiAqIGF1dG9tYXRlZCB0ZXN0cy5cbiAqXG4gKiBAcGFyYW0geyFIVE1MQ2FudmFzRWxlbWVudH0gY2FudmFzXG4gKiBAcmV0dXJuIHshQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfVxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IHZhciBnZXRDb250ZXh0ID0gZnVuY3Rpb24oY2FudmFzKSB7XG4gIHJldHVybiAvKiogQHR5cGV7IUNhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0qLyhjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpKTtcbn07XG5cbi8qKlxuICogQWRkIGFuIGV2ZW50IGhhbmRsZXIuXG4gKiBAcGFyYW0geyFOb2RlfSBlbGVtIFRoZSBlbGVtZW50IHRvIGFkZCB0aGUgZXZlbnQgdG8uXG4gKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBUaGUgdHlwZSBvZiB0aGUgZXZlbnQsIGUuZy4gJ2NsaWNrJyBvciAnbW91c2Vtb3ZlJy5cbiAqIEBwYXJhbSB7ZnVuY3Rpb24oRXZlbnQpOihib29sZWFufHVuZGVmaW5lZCl9IGZuIFRoZSBmdW5jdGlvbiB0byBjYWxsXG4gKiAgICAgb24gdGhlIGV2ZW50LiBUaGUgZnVuY3Rpb24gdGFrZXMgb25lIHBhcmFtZXRlcjogdGhlIGV2ZW50IG9iamVjdC5cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCB2YXIgYWRkRXZlbnQgPSBmdW5jdGlvbiBhZGRFdmVudChlbGVtLCB0eXBlLCBmbikge1xuICBlbGVtLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgZm4sIGZhbHNlKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFuIGV2ZW50IGhhbmRsZXIuXG4gKiBAcGFyYW0geyFOb2RlfSBlbGVtIFRoZSBlbGVtZW50IHRvIHJlbW92ZSB0aGUgZXZlbnQgZnJvbS5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIFRoZSB0eXBlIG9mIHRoZSBldmVudCwgZS5nLiAnY2xpY2snIG9yICdtb3VzZW1vdmUnLlxuICogQHBhcmFtIHtmdW5jdGlvbihFdmVudCk6KGJvb2xlYW58dW5kZWZpbmVkKX0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGxcbiAqICAgICBvbiB0aGUgZXZlbnQuIFRoZSBmdW5jdGlvbiB0YWtlcyBvbmUgcGFyYW1ldGVyOiB0aGUgZXZlbnQgb2JqZWN0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlRXZlbnQoZWxlbSwgdHlwZSwgZm4pIHtcbiAgZWxlbS5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGZuLCBmYWxzZSk7XG59XG5cbi8qKlxuICogQ2FuY2VscyBmdXJ0aGVyIHByb2Nlc3Npbmcgb2YgYW4gZXZlbnQuIFRoaXMgaXMgdXNlZnVsIHRvIHByZXZlbnQgZGVmYXVsdFxuICogYnJvd3NlciBhY3Rpb25zLCBlLmcuIGhpZ2hsaWdodGluZyB0ZXh0IG9uIGEgZG91YmxlLWNsaWNrLlxuICogQmFzZWQgb24gdGhlIGFydGljbGUgYXRcbiAqIGh0dHA6Ly93d3cuc3dpdGNob250aGVjb2RlLmNvbS90dXRvcmlhbHMvamF2YXNjcmlwdC10dXRvcmlhbC10aGUtc2Nyb2xsLXdoZWVsXG4gKiBAcGFyYW0geyFFdmVudH0gZSBUaGUgZXZlbnQgd2hvc2Ugbm9ybWFsIGJlaGF2aW9yIHNob3VsZCBiZSBjYW5jZWxlZC5cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWxFdmVudChlKSB7XG4gIGUgPSBlID8gZSA6IHdpbmRvdy5ldmVudDtcbiAgaWYgKGUuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfVxuICBpZiAoZS5wcmV2ZW50RGVmYXVsdCkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgfVxuICBlLmNhbmNlbEJ1YmJsZSA9IHRydWU7XG4gIGUuY2FuY2VsID0gdHJ1ZTtcbiAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogQ29udmVydCBoc3YgdmFsdWVzIHRvIGFuIHJnYihyLGcsYikgc3RyaW5nLiBUYWtlbiBmcm9tIE1vY2hpS2l0LkNvbG9yLiBUaGlzXG4gKiBpcyB1c2VkIHRvIGdlbmVyYXRlIGRlZmF1bHQgc2VyaWVzIGNvbG9ycyB3aGljaCBhcmUgZXZlbmx5IHNwYWNlZCBvbiB0aGVcbiAqIGNvbG9yIHdoZWVsLlxuICogQHBhcmFtIHtudW1iZXJ9IGh1ZSBSYW5nZSBpcyAwLjAtMS4wLlxuICogQHBhcmFtIHtudW1iZXJ9IHNhdHVyYXRpb24gUmFuZ2UgaXMgMC4wLTEuMC5cbiAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSBSYW5nZSBpcyAwLjAtMS4wLlxuICogQHJldHVybiB7c3RyaW5nfSBcInJnYihyLGcsYilcIiB3aGVyZSByLCBnIGFuZCBiIHJhbmdlIGZyb20gMC0yNTUuXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaHN2VG9SR0IoaHVlLCBzYXR1cmF0aW9uLCB2YWx1ZSkge1xuICB2YXIgcmVkO1xuICB2YXIgZ3JlZW47XG4gIHZhciBibHVlO1xuICBpZiAoc2F0dXJhdGlvbiA9PT0gMCkge1xuICAgIHJlZCA9IHZhbHVlO1xuICAgIGdyZWVuID0gdmFsdWU7XG4gICAgYmx1ZSA9IHZhbHVlO1xuICB9IGVsc2Uge1xuICAgIHZhciBpID0gTWF0aC5mbG9vcihodWUgKiA2KTtcbiAgICB2YXIgZiA9IChodWUgKiA2KSAtIGk7XG4gICAgdmFyIHAgPSB2YWx1ZSAqICgxIC0gc2F0dXJhdGlvbik7XG4gICAgdmFyIHEgPSB2YWx1ZSAqICgxIC0gKHNhdHVyYXRpb24gKiBmKSk7XG4gICAgdmFyIHQgPSB2YWx1ZSAqICgxIC0gKHNhdHVyYXRpb24gKiAoMSAtIGYpKSk7XG4gICAgc3dpdGNoIChpKSB7XG4gICAgICBjYXNlIDE6IHJlZCA9IHE7IGdyZWVuID0gdmFsdWU7IGJsdWUgPSBwOyBicmVhaztcbiAgICAgIGNhc2UgMjogcmVkID0gcDsgZ3JlZW4gPSB2YWx1ZTsgYmx1ZSA9IHQ7IGJyZWFrO1xuICAgICAgY2FzZSAzOiByZWQgPSBwOyBncmVlbiA9IHE7IGJsdWUgPSB2YWx1ZTsgYnJlYWs7XG4gICAgICBjYXNlIDQ6IHJlZCA9IHQ7IGdyZWVuID0gcDsgYmx1ZSA9IHZhbHVlOyBicmVhaztcbiAgICAgIGNhc2UgNTogcmVkID0gdmFsdWU7IGdyZWVuID0gcDsgYmx1ZSA9IHE7IGJyZWFrO1xuICAgICAgY2FzZSA2OiAvLyBmYWxsIHRocm91Z2hcbiAgICAgIGNhc2UgMDogcmVkID0gdmFsdWU7IGdyZWVuID0gdDsgYmx1ZSA9IHA7IGJyZWFrO1xuICAgIH1cbiAgfVxuICByZWQgPSBNYXRoLmZsb29yKDI1NSAqIHJlZCArIDAuNSk7XG4gIGdyZWVuID0gTWF0aC5mbG9vcigyNTUgKiBncmVlbiArIDAuNSk7XG4gIGJsdWUgPSBNYXRoLmZsb29yKDI1NSAqIGJsdWUgKyAwLjUpO1xuICByZXR1cm4gJ3JnYignICsgcmVkICsgJywnICsgZ3JlZW4gKyAnLCcgKyBibHVlICsgJyknO1xufVxuXG4vKipcbiAqIEZpbmQgdGhlIGNvb3JkaW5hdGVzIG9mIGFuIG9iamVjdCByZWxhdGl2ZSB0byB0aGUgdG9wIGxlZnQgb2YgdGhlIHBhZ2UuXG4gKlxuICogQHBhcmFtIHtOb2RlfSBvYmpcbiAqIEByZXR1cm4ge3t4Om51bWJlcix5Om51bWJlcn19XG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZmluZFBvcyhvYmopIHtcbiAgdmFyIHAgPSBvYmouZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICB3ID0gd2luZG93LFxuICAgICAgZCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcblxuICByZXR1cm4ge1xuICAgIHg6IHAubGVmdCArICh3LnBhZ2VYT2Zmc2V0IHx8IGQuc2Nyb2xsTGVmdCksXG4gICAgeTogcC50b3AgICsgKHcucGFnZVlPZmZzZXQgfHwgZC5zY3JvbGxUb3ApXG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSB4LWNvb3JkaW5hdGUgb2YgdGhlIGV2ZW50IGluIGEgY29vcmRpbmF0ZSBzeXN0ZW0gd2hlcmUgdGhlXG4gKiB0b3AtbGVmdCBjb3JuZXIgb2YgdGhlIHBhZ2UgKG5vdCB0aGUgd2luZG93KSBpcyAoMCwwKS5cbiAqIFRha2VuIGZyb20gTW9jaGlLaXQuU2lnbmFsXG4gKiBAcGFyYW0geyFFdmVudH0gZVxuICogQHJldHVybiB7bnVtYmVyfVxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhZ2VYKGUpIHtcbiAgcmV0dXJuICghZS5wYWdlWCB8fCBlLnBhZ2VYIDwgMCkgPyAwIDogZS5wYWdlWDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSB5LWNvb3JkaW5hdGUgb2YgdGhlIGV2ZW50IGluIGEgY29vcmRpbmF0ZSBzeXN0ZW0gd2hlcmUgdGhlXG4gKiB0b3AtbGVmdCBjb3JuZXIgb2YgdGhlIHBhZ2UgKG5vdCB0aGUgd2luZG93KSBpcyAoMCwwKS5cbiAqIFRha2VuIGZyb20gTW9jaGlLaXQuU2lnbmFsXG4gKiBAcGFyYW0geyFFdmVudH0gZVxuICogQHJldHVybiB7bnVtYmVyfVxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhZ2VZKGUpIHtcbiAgcmV0dXJuICghZS5wYWdlWSB8fCBlLnBhZ2VZIDwgMCkgPyAwIDogZS5wYWdlWTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBwYWdlIHRoZSB4LWNvb3JkaW5hdGUgb2YgdGhlIGV2ZW50IHRvIHBpeGVsIHgtY29vcmRpbmF0ZXMgb24gdGhlXG4gKiBjYW52YXMgKGkuZS4gRE9NIENvb3JkcykuXG4gKiBAcGFyYW0geyFFdmVudH0gZSBEcmFnIGV2ZW50LlxuICogQHBhcmFtIHshRHlncmFwaEludGVyYWN0aW9uQ29udGV4dH0gY29udGV4dCBJbnRlcmFjdGlvbiBjb250ZXh0IG9iamVjdC5cbiAqIEByZXR1cm4ge251bWJlcn0gVGhlIGFtb3VudCBieSB3aGljaCB0aGUgZHJhZyBoYXMgbW92ZWQgdG8gdGhlIHJpZ2h0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZHJhZ0dldFhfKGUsIGNvbnRleHQpIHtcbiAgcmV0dXJuIHBhZ2VYKGUpIC0gY29udGV4dC5weDtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBwYWdlIHRoZSB5LWNvb3JkaW5hdGUgb2YgdGhlIGV2ZW50IHRvIHBpeGVsIHktY29vcmRpbmF0ZXMgb24gdGhlXG4gKiBjYW52YXMgKGkuZS4gRE9NIENvb3JkcykuXG4gKiBAcGFyYW0geyFFdmVudH0gZSBEcmFnIGV2ZW50LlxuICogQHBhcmFtIHshRHlncmFwaEludGVyYWN0aW9uQ29udGV4dH0gY29udGV4dCBJbnRlcmFjdGlvbiBjb250ZXh0IG9iamVjdC5cbiAqIEByZXR1cm4ge251bWJlcn0gVGhlIGFtb3VudCBieSB3aGljaCB0aGUgZHJhZyBoYXMgbW92ZWQgZG93bi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRyYWdHZXRZXyhlLCBjb250ZXh0KSB7XG4gIHJldHVybiBwYWdlWShlKSAtIGNvbnRleHQucHk7XG59XG5cbi8qKlxuICogVGhpcyByZXR1cm5zIHRydWUgdW5sZXNzIHRoZSBwYXJhbWV0ZXIgaXMgMCwgbnVsbCwgdW5kZWZpbmVkIG9yIE5hTi5cbiAqIFRPRE8oZGFudmspOiByZW5hbWUgdGhpcyBmdW5jdGlvbiB0byBzb21ldGhpbmcgbGlrZSAnaXNOb25aZXJvTmFuJy5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0geCBUaGUgbnVtYmVyIHRvIGNvbnNpZGVyLlxuICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB0aGUgbnVtYmVyIGlzIHplcm8gb3IgTmFOLlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzT0soeCkge1xuICByZXR1cm4gISF4ICYmICFpc05hTih4KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3t4Oj9udW1iZXIseTo/bnVtYmVyLHl2YWw6P251bWJlcn19IHAgVGhlIHBvaW50IHRvIGNvbnNpZGVyLCB2YWxpZFxuICogICAgIHBvaW50cyBhcmUge3gsIHl9IG9iamVjdHNcbiAqIEBwYXJhbSB7Ym9vbGVhbj19IG9wdF9hbGxvd05hTlkgVHJlYXQgcG9pbnQgd2l0aCB5PU5hTiBhcyB2YWxpZFxuICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB0aGUgcG9pbnQgaGFzIG51bWVyaWMgeCBhbmQgeS5cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1ZhbGlkUG9pbnQocCwgb3B0X2FsbG93TmFOWSkge1xuICBpZiAoIXApIHJldHVybiBmYWxzZTsgIC8vIG51bGwgb3IgdW5kZWZpbmVkIG9iamVjdFxuICBpZiAocC55dmFsID09PSBudWxsKSByZXR1cm4gZmFsc2U7ICAvLyBtaXNzaW5nIHBvaW50XG4gIGlmIChwLnggPT09IG51bGwgfHwgcC54ID09PSB1bmRlZmluZWQpIHJldHVybiBmYWxzZTtcbiAgaWYgKHAueSA9PT0gbnVsbCB8fCBwLnkgPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZhbHNlO1xuICBpZiAoaXNOYU4ocC54KSB8fCAoIW9wdF9hbGxvd05hTlkgJiYgaXNOYU4ocC55KSkpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogTnVtYmVyIGZvcm1hdHRpbmcgZnVuY3Rpb24gd2hpY2ggbWltaWNzIHRoZSBiZWhhdmlvciBvZiAlZyBpbiBwcmludGYsIGkuZS5cbiAqIGVpdGhlciBleHBvbmVudGlhbCBvciBmaXhlZCBmb3JtYXQgKHdpdGhvdXQgdHJhaWxpbmcgMHMpIGlzIHVzZWQgZGVwZW5kaW5nIG9uXG4gKiB0aGUgbGVuZ3RoIG9mIHRoZSBnZW5lcmF0ZWQgc3RyaW5nLiAgVGhlIGFkdmFudGFnZSBvZiB0aGlzIGZvcm1hdCBpcyB0aGF0XG4gKiB0aGVyZSBpcyBhIHByZWRpY3RhYmxlIHVwcGVyIGJvdW5kIG9uIHRoZSByZXN1bHRpbmcgc3RyaW5nIGxlbmd0aCxcbiAqIHNpZ25pZmljYW50IGZpZ3VyZXMgYXJlIG5vdCBkcm9wcGVkLCBhbmQgbm9ybWFsIG51bWJlcnMgYXJlIG5vdCBkaXNwbGF5ZWQgaW5cbiAqIGV4cG9uZW50aWFsIG5vdGF0aW9uLlxuICpcbiAqIE5PVEU6IEphdmFTY3JpcHQncyBuYXRpdmUgdG9QcmVjaXNpb24oKSBpcyBOT1QgYSBkcm9wLWluIHJlcGxhY2VtZW50IGZvciAlZy5cbiAqIEl0IGNyZWF0ZXMgc3RyaW5ncyB3aGljaCBhcmUgdG9vIGxvbmcgZm9yIGFic29sdXRlIHZhbHVlcyBiZXR3ZWVuIDEwXi00IGFuZFxuICogMTBeLTYsIGUuZy4gJzAuMDAwMDEnIGluc3RlYWQgb2YgJzFlLTUnLiBTZWUgdGVzdHMvbnVtYmVyLWZvcm1hdC5odG1sIGZvclxuICogb3V0cHV0IGV4YW1wbGVzLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSB4IFRoZSBudW1iZXIgdG8gZm9ybWF0XG4gKiBAcGFyYW0ge251bWJlcj19IG9wdF9wcmVjaXNpb24gVGhlIHByZWNpc2lvbiB0byB1c2UsIGRlZmF1bHQgMi5cbiAqIEByZXR1cm4ge3N0cmluZ30gQSBzdHJpbmcgZm9ybWF0dGVkIGxpa2UgJWcgaW4gcHJpbnRmLiAgVGhlIG1heCBnZW5lcmF0ZWRcbiAqICAgICAgICAgICAgICAgICAgc3RyaW5nIGxlbmd0aCBzaG91bGQgYmUgcHJlY2lzaW9uICsgNiAoZS5nIDEuMTIzZSszMDApLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmxvYXRGb3JtYXQoeCwgb3B0X3ByZWNpc2lvbikge1xuICAvLyBBdm9pZCBpbnZhbGlkIHByZWNpc2lvbiB2YWx1ZXM7IFsxLCAyMV0gaXMgdGhlIHZhbGlkIHJhbmdlLlxuICB2YXIgcCA9IE1hdGgubWluKE1hdGgubWF4KDEsIG9wdF9wcmVjaXNpb24gfHwgMiksIDIxKTtcblxuICAvLyBUaGlzIGlzIGRlY2VwdGl2ZWx5IHNpbXBsZS4gIFRoZSBhY3R1YWwgYWxnb3JpdGhtIGNvbWVzIGZyb206XG4gIC8vXG4gIC8vIE1heCBhbGxvd2VkIGxlbmd0aCA9IHAgKyA0XG4gIC8vIHdoZXJlIDQgY29tZXMgZnJvbSAnZStuJyBhbmQgJy4nLlxuICAvL1xuICAvLyBMZW5ndGggb2YgZml4ZWQgZm9ybWF0ID0gMiArIHkgKyBwXG4gIC8vIHdoZXJlIDIgY29tZXMgZnJvbSAnMC4nIGFuZCB5ID0gIyBvZiBsZWFkaW5nIHplcm9lcy5cbiAgLy9cbiAgLy8gRXF1YXRpbmcgdGhlIHR3byBhbmQgc29sdmluZyBmb3IgeSB5aWVsZHMgeSA9IDIsIG9yIDAuMDB4eHh4IHdoaWNoIGlzXG4gIC8vIDEuMGUtMy5cbiAgLy9cbiAgLy8gU2luY2UgdGhlIGJlaGF2aW9yIG9mIHRvUHJlY2lzaW9uKCkgaXMgaWRlbnRpY2FsIGZvciBsYXJnZXIgbnVtYmVycywgd2VcbiAgLy8gZG9uJ3QgaGF2ZSB0byB3b3JyeSBhYm91dCB0aGUgb3RoZXIgYm91bmQuXG4gIC8vXG4gIC8vIEZpbmFsbHksIHRoZSBhcmd1bWVudCBmb3IgdG9FeHBvbmVudGlhbCgpIGlzIHRoZSBudW1iZXIgb2YgdHJhaWxpbmcgZGlnaXRzLFxuICAvLyBzbyB3ZSB0YWtlIG9mZiAxIGZvciB0aGUgdmFsdWUgYmVmb3JlIHRoZSAnLicuXG4gIHJldHVybiAoTWF0aC5hYnMoeCkgPCAxLjBlLTMgJiYgeCAhPT0gMC4wKSA/XG4gICAgICB4LnRvRXhwb25lbnRpYWwocCAtIDEpIDogeC50b1ByZWNpc2lvbihwKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyAnOScgdG8gJzA5JyAodXNlZnVsIGZvciBkYXRlcylcbiAqIEBwYXJhbSB7bnVtYmVyfSB4XG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gemVyb3BhZCh4KSB7XG4gIGlmICh4IDwgMTApIHJldHVybiBcIjBcIiArIHg7IGVsc2UgcmV0dXJuIFwiXCIgKyB4O1xufVxuXG4vKipcbiAqIERhdGUgYWNjZXNzb3JzIHRvIGdldCB0aGUgcGFydHMgb2YgYSBjYWxlbmRhciBkYXRlICh5ZWFyLCBtb250aCxcbiAqIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQgYW5kIG1pbGxpc2Vjb25kKSBhY2NvcmRpbmcgdG8gbG9jYWwgdGltZSxcbiAqIGFuZCBmYWN0b3J5IG1ldGhvZCB0byBjYWxsIHRoZSBEYXRlIGNvbnN0cnVjdG9yIHdpdGggYW4gYXJyYXkgb2YgYXJndW1lbnRzLlxuICovXG5leHBvcnQgdmFyIERhdGVBY2Nlc3NvcnNMb2NhbCA9IHtcbiAgZ2V0RnVsbFllYXI6ICAgICBkID0+IGQuZ2V0RnVsbFllYXIoKSxcbiAgZ2V0TW9udGg6ICAgICAgICBkID0+IGQuZ2V0TW9udGgoKSxcbiAgZ2V0RGF0ZTogICAgICAgICBkID0+IGQuZ2V0RGF0ZSgpLFxuICBnZXRIb3VyczogICAgICAgIGQgPT4gZC5nZXRIb3VycygpLFxuICBnZXRNaW51dGVzOiAgICAgIGQgPT4gZC5nZXRNaW51dGVzKCksXG4gIGdldFNlY29uZHM6ICAgICAgZCA9PiBkLmdldFNlY29uZHMoKSxcbiAgZ2V0TWlsbGlzZWNvbmRzOiBkID0+IGQuZ2V0TWlsbGlzZWNvbmRzKCksXG4gIGdldERheTogICAgICAgICAgZCA9PiBkLmdldERheSgpLFxuICBtYWtlRGF0ZTogICAgICAgIGZ1bmN0aW9uKHksIG0sIGQsIGhoLCBtbSwgc3MsIG1zKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKHksIG0sIGQsIGhoLCBtbSwgc3MsIG1zKTtcbiAgfVxufTtcblxuLyoqXG4gKiBEYXRlIGFjY2Vzc29ycyB0byBnZXQgdGhlIHBhcnRzIG9mIGEgY2FsZW5kYXIgZGF0ZSAoeWVhciwgbW9udGgsXG4gKiBkYXkgb2YgbW9udGgsIGhvdXIsIG1pbnV0ZSwgc2Vjb25kIGFuZCBtaWxsaXNlY29uZCkgYWNjb3JkaW5nIHRvIFVUQyB0aW1lLFxuICogYW5kIGZhY3RvcnkgbWV0aG9kIHRvIGNhbGwgdGhlIERhdGUgY29uc3RydWN0b3Igd2l0aCBhbiBhcnJheSBvZiBhcmd1bWVudHMuXG4gKi9cbmV4cG9ydCB2YXIgRGF0ZUFjY2Vzc29yc1VUQyA9IHtcbiAgZ2V0RnVsbFllYXI6ICAgICBkID0+IGQuZ2V0VVRDRnVsbFllYXIoKSxcbiAgZ2V0TW9udGg6ICAgICAgICBkID0+IGQuZ2V0VVRDTW9udGgoKSxcbiAgZ2V0RGF0ZTogICAgICAgICBkID0+IGQuZ2V0VVRDRGF0ZSgpLFxuICBnZXRIb3VyczogICAgICAgIGQgPT4gZC5nZXRVVENIb3VycygpLFxuICBnZXRNaW51dGVzOiAgICAgIGQgPT4gZC5nZXRVVENNaW51dGVzKCksXG4gIGdldFNlY29uZHM6ICAgICAgZCA9PiBkLmdldFVUQ1NlY29uZHMoKSxcbiAgZ2V0TWlsbGlzZWNvbmRzOiBkID0+IGQuZ2V0VVRDTWlsbGlzZWNvbmRzKCksXG4gIGdldERheTogICAgICAgICAgZCA9PiBkLmdldFVUQ0RheSgpLFxuICBtYWtlRGF0ZTogICAgICAgIGZ1bmN0aW9uKHksIG0sIGQsIGhoLCBtbSwgc3MsIG1zKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKERhdGUuVVRDKHksIG0sIGQsIGhoLCBtbSwgc3MsIG1zKSk7XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJuIGEgc3RyaW5nIHZlcnNpb24gb2YgdGhlIGhvdXJzLCBtaW51dGVzIGFuZCBzZWNvbmRzIHBvcnRpb24gb2YgYSBkYXRlLlxuICogQHBhcmFtIHtudW1iZXJ9IGhoIFRoZSBob3VycyAoZnJvbSAwLTIzKVxuICogQHBhcmFtIHtudW1iZXJ9IG1tIFRoZSBtaW51dGVzIChmcm9tIDAtNTkpXG4gKiBAcGFyYW0ge251bWJlcn0gc3MgVGhlIHNlY29uZHMgKGZyb20gMC01OSlcbiAqIEByZXR1cm4ge3N0cmluZ30gQSB0aW1lIG9mIHRoZSBmb3JtIFwiSEg6TU1cIiBvciBcIkhIOk1NOlNTXCJcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBobXNTdHJpbmdfKGhoLCBtbSwgc3MsIG1zKSB7XG4gIHZhciByZXQgPSB6ZXJvcGFkKGhoKSArIFwiOlwiICsgemVyb3BhZChtbSk7XG4gIGlmIChzcykge1xuICAgIHJldCArPSBcIjpcIiArIHplcm9wYWQoc3MpO1xuICAgIGlmIChtcykge1xuICAgICAgdmFyIHN0ciA9IFwiXCIgKyBtcztcbiAgICAgIHJldCArPSBcIi5cIiArICgnMDAwJytzdHIpLnN1YnN0cmluZyhzdHIubGVuZ3RoKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgSlMgZGF0ZSAobWlsbGlzIHNpbmNlIGVwb2NoKSB0byBhIGZvcm1hdHRlZCBzdHJpbmcuXG4gKiBAcGFyYW0ge251bWJlcn0gdGltZSBUaGUgSmF2YVNjcmlwdCB0aW1lIHZhbHVlIChtcyBzaW5jZSBlcG9jaClcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gdXRjIFdoZXRoZXIgb3V0cHV0IFVUQyBvciBsb2NhbCB0aW1lXG4gKiBAcmV0dXJuIHtzdHJpbmd9IEEgZGF0ZSBvZiBvbmUgb2YgdGhlc2UgZm9ybXM6XG4gKiAgICAgXCJZWVlZL01NL0REXCIsIFwiWVlZWS9NTS9ERCBISDpNTVwiIG9yIFwiWVlZWS9NTS9ERCBISDpNTTpTU1wiXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGF0ZVN0cmluZ18odGltZSwgdXRjKSB7XG4gIHZhciBhY2Nlc3NvcnMgPSB1dGMgPyBEYXRlQWNjZXNzb3JzVVRDIDogRGF0ZUFjY2Vzc29yc0xvY2FsO1xuICB2YXIgZGF0ZSA9IG5ldyBEYXRlKHRpbWUpO1xuICB2YXIgeSA9IGFjY2Vzc29ycy5nZXRGdWxsWWVhcihkYXRlKTtcbiAgdmFyIG0gPSBhY2Nlc3NvcnMuZ2V0TW9udGgoZGF0ZSk7XG4gIHZhciBkID0gYWNjZXNzb3JzLmdldERhdGUoZGF0ZSk7XG4gIHZhciBoaCA9IGFjY2Vzc29ycy5nZXRIb3VycyhkYXRlKTtcbiAgdmFyIG1tID0gYWNjZXNzb3JzLmdldE1pbnV0ZXMoZGF0ZSk7XG4gIHZhciBzcyA9IGFjY2Vzc29ycy5nZXRTZWNvbmRzKGRhdGUpO1xuICB2YXIgbXMgPSBhY2Nlc3NvcnMuZ2V0TWlsbGlzZWNvbmRzKGRhdGUpO1xuICAvLyBHZXQgYSB5ZWFyIHN0cmluZzpcbiAgdmFyIHllYXIgPSBcIlwiICsgeTtcbiAgLy8gR2V0IGEgMCBwYWRkZWQgbW9udGggc3RyaW5nXG4gIHZhciBtb250aCA9IHplcm9wYWQobSArIDEpOyAgLy9tb250aHMgYXJlIDAtb2Zmc2V0LCBzaWdoXG4gIC8vIEdldCBhIDAgcGFkZGVkIGRheSBzdHJpbmdcbiAgdmFyIGRheSA9IHplcm9wYWQoZCk7XG4gIHZhciBmcmFjID0gaGggKiAzNjAwICsgbW0gKiA2MCArIHNzICsgMWUtMyAqIG1zO1xuICB2YXIgcmV0ID0geWVhciArIFwiL1wiICsgbW9udGggKyBcIi9cIiArIGRheTtcbiAgaWYgKGZyYWMpIHtcbiAgICByZXQgKz0gXCIgXCIgKyBobXNTdHJpbmdfKGhoLCBtbSwgc3MsIG1zKTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG4vKipcbiAqIFJvdW5kIGEgbnVtYmVyIHRvIHRoZSBzcGVjaWZpZWQgbnVtYmVyIG9mIGRpZ2l0cyBwYXN0IHRoZSBkZWNpbWFsIHBvaW50LlxuICogQHBhcmFtIHtudW1iZXJ9IG51bSBUaGUgbnVtYmVyIHRvIHJvdW5kXG4gKiBAcGFyYW0ge251bWJlcn0gcGxhY2VzIFRoZSBudW1iZXIgb2YgZGVjaW1hbHMgdG8gd2hpY2ggdG8gcm91bmRcbiAqIEByZXR1cm4ge251bWJlcn0gVGhlIHJvdW5kZWQgbnVtYmVyXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcm91bmRfKG51bSwgcGxhY2VzKSB7XG4gIHZhciBzaGlmdCA9IE1hdGgucG93KDEwLCBwbGFjZXMpO1xuICByZXR1cm4gTWF0aC5yb3VuZChudW0gKiBzaGlmdCkvc2hpZnQ7XG59XG5cbi8qKlxuICogSW1wbGVtZW50YXRpb24gb2YgYmluYXJ5IHNlYXJjaCBvdmVyIGFuIGFycmF5LlxuICogQ3VycmVudGx5IGRvZXMgbm90IHdvcmsgd2hlbiB2YWwgaXMgb3V0c2lkZSB0aGUgcmFuZ2Ugb2YgYXJyeSdzIHZhbHVlcy5cbiAqIEBwYXJhbSB7bnVtYmVyfSB2YWwgdGhlIHZhbHVlIHRvIHNlYXJjaCBmb3JcbiAqIEBwYXJhbSB7QXJyYXkuPG51bWJlcj59IGFycnkgaXMgdGhlIHZhbHVlIG92ZXIgd2hpY2ggdG8gc2VhcmNoXG4gKiBAcGFyYW0ge251bWJlcn0gYWJzIElmIGFicyA+IDAsIGZpbmQgdGhlIGxvd2VzdCBlbnRyeSBncmVhdGVyIHRoYW4gdmFsXG4gKiAgICAgSWYgYWJzIDwgMCwgZmluZCB0aGUgaGlnaGVzdCBlbnRyeSBsZXNzIHRoYW4gdmFsLlxuICogICAgIElmIGFicyA9PSAwLCBmaW5kIHRoZSBlbnRyeSB0aGF0IGVxdWFscyB2YWwuXG4gKiBAcGFyYW0ge251bWJlcj19IGxvdyBUaGUgZmlyc3QgaW5kZXggaW4gYXJyeSB0byBjb25zaWRlciAob3B0aW9uYWwpXG4gKiBAcGFyYW0ge251bWJlcj19IGhpZ2ggVGhlIGxhc3QgaW5kZXggaW4gYXJyeSB0byBjb25zaWRlciAob3B0aW9uYWwpXG4gKiBAcmV0dXJuIHtudW1iZXJ9IEluZGV4IG9mIHRoZSBlbGVtZW50LCBvciAtMSBpZiBpdCBpc24ndCBmb3VuZC5cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiaW5hcnlTZWFyY2godmFsLCBhcnJ5LCBhYnMsIGxvdywgaGlnaCkge1xuICBpZiAobG93ID09PSBudWxsIHx8IGxvdyA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICBoaWdoID09PSBudWxsIHx8IGhpZ2ggPT09IHVuZGVmaW5lZCkge1xuICAgIGxvdyA9IDA7XG4gICAgaGlnaCA9IGFycnkubGVuZ3RoIC0gMTtcbiAgfVxuICBpZiAobG93ID4gaGlnaCkge1xuICAgIHJldHVybiAtMTtcbiAgfVxuICBpZiAoYWJzID09PSBudWxsIHx8IGFicyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYWJzID0gMDtcbiAgfVxuICB2YXIgdmFsaWRJbmRleCA9IGZ1bmN0aW9uKGlkeCkge1xuICAgIHJldHVybiBpZHggPj0gMCAmJiBpZHggPCBhcnJ5Lmxlbmd0aDtcbiAgfTtcbiAgdmFyIG1pZCA9IHBhcnNlSW50KChsb3cgKyBoaWdoKSAvIDIsIDEwKTtcbiAgdmFyIGVsZW1lbnQgPSBhcnJ5W21pZF07XG4gIHZhciBpZHg7XG4gIGlmIChlbGVtZW50ID09IHZhbCkge1xuICAgIHJldHVybiBtaWQ7XG4gIH0gZWxzZSBpZiAoZWxlbWVudCA+IHZhbCkge1xuICAgIGlmIChhYnMgPiAwKSB7XG4gICAgICAvLyBBY2NlcHQgaWYgZWxlbWVudCA+IHZhbCwgYnV0IGFsc28gaWYgcHJpb3IgZWxlbWVudCA8IHZhbC5cbiAgICAgIGlkeCA9IG1pZCAtIDE7XG4gICAgICBpZiAodmFsaWRJbmRleChpZHgpICYmIGFycnlbaWR4XSA8IHZhbCkge1xuICAgICAgICByZXR1cm4gbWlkO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYmluYXJ5U2VhcmNoKHZhbCwgYXJyeSwgYWJzLCBsb3csIG1pZCAtIDEpO1xuICB9IGVsc2UgaWYgKGVsZW1lbnQgPCB2YWwpIHtcbiAgICBpZiAoYWJzIDwgMCkge1xuICAgICAgLy8gQWNjZXB0IGlmIGVsZW1lbnQgPCB2YWwsIGJ1dCBhbHNvIGlmIHByaW9yIGVsZW1lbnQgPiB2YWwuXG4gICAgICBpZHggPSBtaWQgKyAxO1xuICAgICAgaWYgKHZhbGlkSW5kZXgoaWR4KSAmJiBhcnJ5W2lkeF0gPiB2YWwpIHtcbiAgICAgICAgcmV0dXJuIG1pZDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGJpbmFyeVNlYXJjaCh2YWwsIGFycnksIGFicywgbWlkICsgMSwgaGlnaCk7XG4gIH1cbiAgcmV0dXJuIC0xOyAgLy8gY2FuJ3QgYWN0dWFsbHkgaGFwcGVuLCBidXQgbWFrZXMgY2xvc3VyZSBjb21waWxlciBoYXBweVxufVxuXG4vKipcbiAqIFBhcnNlcyBhIGRhdGUsIHJldHVybmluZyB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBzaW5jZSBlcG9jaC4gVGhpcyBjYW4gYmVcbiAqIHBhc3NlZCBpbiBhcyBhbiB4VmFsdWVQYXJzZXIgaW4gdGhlIER5Z3JhcGggY29uc3RydWN0b3IuXG4gKiBUT0RPKGRhbnZrKTogZW51bWVyYXRlIGZvcm1hdHMgdGhhdCB0aGlzIHVuZGVyc3RhbmRzLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBkYXRlU3RyIEEgZGF0ZSBpbiBhIHZhcmlldHkgb2YgcG9zc2libGUgc3RyaW5nIGZvcm1hdHMuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IE1pbGxpc2Vjb25kcyBzaW5jZSBlcG9jaC5cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkYXRlUGFyc2VyKGRhdGVTdHIpIHtcbiAgdmFyIGRhdGVTdHJTbGFzaGVkO1xuICB2YXIgZDtcblxuICAvLyBMZXQgdGhlIHN5c3RlbSB0cnkgdGhlIGZvcm1hdCBmaXJzdCwgd2l0aCBvbmUgY2F2ZWF0OlxuICAvLyBZWVlZLU1NLUREWyBISDpNTTpTU10gaXMgaW50ZXJwcmV0ZWQgYXMgVVRDIGJ5IGEgdmFyaWV0eSBvZiBicm93c2Vycy5cbiAgLy8gZHlncmFwaHMgZGlzcGxheXMgZGF0ZXMgaW4gbG9jYWwgdGltZSwgc28gdGhpcyB3aWxsIHJlc3VsdCBpbiBzdXJwcmlzaW5nXG4gIC8vIGluY29uc2lzdGVuY2llcy4gQnV0IGlmIHlvdSBzcGVjaWZ5IFwiVFwiIG9yIFwiWlwiIChpLmUuIFlZWVktTU0tRERUSEg6TU06U1MpLFxuICAvLyB0aGVuIHlvdSBwcm9iYWJseSBrbm93IHdoYXQgeW91J3JlIGRvaW5nLCBzbyB3ZSdsbCBsZXQgeW91IGdvIGFoZWFkLlxuICAvLyBJc3N1ZTogaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL2R5Z3JhcGhzL2lzc3Vlcy9kZXRhaWw/aWQ9MjU1XG4gIGlmIChkYXRlU3RyLnNlYXJjaChcIi1cIikgPT0gLTEgfHxcbiAgICAgIGRhdGVTdHIuc2VhcmNoKFwiVFwiKSAhPSAtMSB8fCBkYXRlU3RyLnNlYXJjaChcIlpcIikgIT0gLTEpIHtcbiAgICBkID0gZGF0ZVN0clRvTWlsbGlzKGRhdGVTdHIpO1xuICAgIGlmIChkICYmICFpc05hTihkKSkgcmV0dXJuIGQ7XG4gIH1cblxuICBpZiAoZGF0ZVN0ci5zZWFyY2goXCItXCIpICE9IC0xKSB7ICAvLyBlLmcuICcyMDA5LTctMTInIG9yICcyMDA5LTA3LTEyJ1xuICAgIGRhdGVTdHJTbGFzaGVkID0gZGF0ZVN0ci5yZXBsYWNlKFwiLVwiLCBcIi9cIiwgXCJnXCIpO1xuICAgIHdoaWxlIChkYXRlU3RyU2xhc2hlZC5zZWFyY2goXCItXCIpICE9IC0xKSB7XG4gICAgICBkYXRlU3RyU2xhc2hlZCA9IGRhdGVTdHJTbGFzaGVkLnJlcGxhY2UoXCItXCIsIFwiL1wiKTtcbiAgICB9XG4gICAgZCA9IGRhdGVTdHJUb01pbGxpcyhkYXRlU3RyU2xhc2hlZCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQW55IGZvcm1hdCB0aGF0IERhdGUucGFyc2Ugd2lsbCBhY2NlcHQsIGUuZy4gXCIyMDA5LzA3LzEyXCIgb3JcbiAgICAvLyBcIjIwMDkvMDcvMTIgMTI6MzQ6NTZcIlxuICAgIGQgPSBkYXRlU3RyVG9NaWxsaXMoZGF0ZVN0cik7XG4gIH1cblxuICBpZiAoIWQgfHwgaXNOYU4oZCkpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiQ291bGRuJ3QgcGFyc2UgXCIgKyBkYXRlU3RyICsgXCIgYXMgYSBkYXRlXCIpO1xuICB9XG4gIHJldHVybiBkO1xufVxuXG4vKipcbiAqIFRoaXMgaXMgaWRlbnRpY2FsIHRvIEphdmFTY3JpcHQncyBidWlsdC1pbiBEYXRlLnBhcnNlKCkgbWV0aG9kLCBleGNlcHQgdGhhdFxuICogaXQgZG9lc24ndCBnZXQgcmVwbGFjZWQgd2l0aCBhbiBpbmNvbXBhdGlibGUgbWV0aG9kIGJ5IGFnZ3Jlc3NpdmUgSlNcbiAqIGxpYnJhcmllcyBsaWtlIE1vb1Rvb2xzIG9yIEpvb21sYS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHIgVGhlIGRhdGUgc3RyaW5nLCBlLmcuIFwiMjAxMS8wNS8wNlwiXG4gKiBAcmV0dXJuIHtudW1iZXJ9IG1pbGxpcyBzaW5jZSBlcG9jaFxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRhdGVTdHJUb01pbGxpcyhzdHIpIHtcbiAgcmV0dXJuIG5ldyBEYXRlKHN0cikuZ2V0VGltZSgpO1xufVxuXG4vLyBUaGVzZSBmdW5jdGlvbnMgYXJlIGFsbCBiYXNlZCBvbiBNb2NoaUtpdC5cbi8qKlxuICogQ29waWVzIGFsbCB0aGUgcHJvcGVydGllcyBmcm9tIG8gdG8gc2VsZi5cbiAqXG4gKiBAcGFyYW0geyFPYmplY3R9IHNlbGZcbiAqIEBwYXJhbSB7IU9iamVjdH0gb1xuICogQHJldHVybiB7IU9iamVjdH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZShzZWxmLCBvKSB7XG4gIGlmICh0eXBlb2YobykgIT0gJ3VuZGVmaW5lZCcgJiYgbyAhPT0gbnVsbCkge1xuICAgIGZvciAodmFyIGsgaW4gbykge1xuICAgICAgaWYgKG8uaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgc2VsZltrXSA9IG9ba107XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBzZWxmO1xufVxuXG4vLyBpbnRlcm5hbDogY2hlY2sgaWYgbyBpcyBhIERPTSBub2RlLCBhbmQgd2Uga25vdyBpdOKAmXMgbm90IG51bGxcbnZhciBfaXNOb2RlID0gKHR5cGVvZihOb2RlKSAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgICAgICAgIE5vZGUgIT09IG51bGwgJiYgdHlwZW9mKE5vZGUpID09PSAnb2JqZWN0JykgP1xuICBmdW5jdGlvbiBfaXNOb2RlKG8pIHtcbiAgICByZXR1cm4gKG8gaW5zdGFuY2VvZiBOb2RlKTtcbiAgfSA6IGZ1bmN0aW9uIF9pc05vZGUobykge1xuICAgIHJldHVybiAodHlwZW9mKG8pID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgICAgdHlwZW9mKG8ubm9kZVR5cGUpID09PSAnbnVtYmVyJyAmJlxuICAgICAgICAgICAgdHlwZW9mKG8ubm9kZU5hbWUpID09PSAnc3RyaW5nJyk7XG59O1xuXG4vKipcbiAqIENvcGllcyBhbGwgdGhlIHByb3BlcnRpZXMgZnJvbSBvIHRvIHNlbGYuXG4gKlxuICogQHBhcmFtIHshT2JqZWN0fSBzZWxmXG4gKiBAcGFyYW0geyFPYmplY3R9IG9cbiAqIEByZXR1cm4geyFPYmplY3R9XG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlRGVlcChzZWxmLCBvKSB7XG4gIGlmICh0eXBlb2YobykgIT0gJ3VuZGVmaW5lZCcgJiYgbyAhPT0gbnVsbCkge1xuICAgIGZvciAodmFyIGsgaW4gbykge1xuICAgICAgaWYgKG8uaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgY29uc3QgdiA9IG9ba107XG4gICAgICAgIGlmICh2ID09PSBudWxsKSB7XG4gICAgICAgICAgc2VsZltrXSA9IG51bGw7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheUxpa2UodikpIHtcbiAgICAgICAgICBzZWxmW2tdID0gdi5zbGljZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKF9pc05vZGUodikpIHtcbiAgICAgICAgICAvLyBET00gb2JqZWN0cyBhcmUgc2hhbGxvd2x5LWNvcGllZC5cbiAgICAgICAgICBzZWxmW2tdID0gdjtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YodikgPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICBpZiAodHlwZW9mKHNlbGZba10pICE9ICdvYmplY3QnIHx8IHNlbGZba10gPT09IG51bGwpIHtcbiAgICAgICAgICAgIHNlbGZba10gPSB7fTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdXBkYXRlRGVlcChzZWxmW2tdLCB2KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWxmW2tdID0gdjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gc2VsZjtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyp9IG9cbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0eXBlQXJyYXlMaWtlKG8pIHtcbiAgaWYgKG8gPT09IG51bGwpXG4gICAgcmV0dXJuICdudWxsJztcbiAgY29uc3QgdCA9IHR5cGVvZihvKTtcbiAgaWYgKCh0ID09PSAnb2JqZWN0JyB8fFxuICAgICAgICh0ID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZihvLml0ZW0pID09PSAnZnVuY3Rpb24nKSkgJiZcbiAgICAgIHR5cGVvZihvLmxlbmd0aCkgPT09ICdudW1iZXInICYmXG4gICAgICBvLm5vZGVUeXBlICE9PSAzICYmIG8ubm9kZVR5cGUgIT09IDQpXG4gICAgcmV0dXJuICdhcnJheSc7XG4gIHJldHVybiB0O1xufVxuXG4vKipcbiAqIEBwYXJhbSB7Kn0gb1xuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0FycmF5TGlrZShvKSB7XG4gIGNvbnN0IHQgPSB0eXBlb2Yobyk7XG4gIHJldHVybiAobyAhPT0gbnVsbCAmJlxuICAgICAgICAgICh0ID09PSAnb2JqZWN0JyB8fFxuICAgICAgICAgICAodCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2Yoby5pdGVtKSA9PT0gJ2Z1bmN0aW9uJykpICYmXG4gICAgICAgICAgdHlwZW9mKG8ubGVuZ3RoKSA9PT0gJ251bWJlcicgJiZcbiAgICAgICAgICBvLm5vZGVUeXBlICE9PSAzICYmIG8ubm9kZVR5cGUgIT09IDQpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7T2JqZWN0fSBvXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRGF0ZUxpa2Uobykge1xuICByZXR1cm4gKG8gIT09IG51bGwgJiYgdHlwZW9mKG8pID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgIHR5cGVvZihvLmdldFRpbWUpID09PSAnZnVuY3Rpb24nKTtcbn1cblxuLyoqXG4gKiBOb3RlOiB0aGlzIG9ubHkgc2VlbXMgdG8gd29yayBmb3IgYXJyYXlzLlxuICogQHBhcmFtIHshQXJyYXl9IG9cbiAqIEByZXR1cm4geyFBcnJheX1cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZShvKSB7XG4gIC8vIFRPRE8oZGFudmspOiBmaWd1cmUgb3V0IGhvdyBNb2NoaUtpdCdzIHZlcnNpb24gd29ya3NcbiAgdmFyIHIgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBvLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGlzQXJyYXlMaWtlKG9baV0pKSB7XG4gICAgICByLnB1c2goY2xvbmUob1tpXSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByLnB1c2gob1tpXSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBjYW52YXMgZWxlbWVudC5cbiAqXG4gKiBAcmV0dXJuIHshSFRNTENhbnZhc0VsZW1lbnR9XG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ2FudmFzKCkge1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY29udGV4dCdzIHBpeGVsIHJhdGlvLCB3aGljaCBpcyB0aGUgcmF0aW8gYmV0d2VlbiB0aGUgZGV2aWNlXG4gKiBwaXhlbCByYXRpbyBhbmQgdGhlIGJhY2tpbmcgc3RvcmUgcmF0aW8uIFR5cGljYWxseSB0aGlzIGlzIDEgZm9yIGNvbnZlbnRpb25hbFxuICogZGlzcGxheXMsIGFuZCA+IDEgZm9yIEhpRFBJIGRpc3BsYXlzIChzdWNoIGFzIHRoZSBSZXRpbmEgTUJQKS5cbiAqIFNlZSBodHRwOi8vd3d3Lmh0bWw1cm9ja3MuY29tL2VuL3R1dG9yaWFscy9jYW52YXMvaGlkcGkvIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogQHBhcmFtIHshQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjb250ZXh0IFRoZSBjYW52YXMncyAyZCBjb250ZXh0LlxuICogQHJldHVybiB7bnVtYmVyfSBUaGUgcmF0aW8gb2YgdGhlIGRldmljZSBwaXhlbCByYXRpbyBhbmQgdGhlIGJhY2tpbmcgc3RvcmVcbiAqIHJhdGlvIGZvciB0aGUgc3BlY2lmaWVkIGNvbnRleHQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb250ZXh0UGl4ZWxSYXRpbyhjb250ZXh0KSB7XG4gIHRyeSB7XG4gICAgdmFyIGRldmljZVBpeGVsUmF0aW8gPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbztcbiAgICB2YXIgYmFja2luZ1N0b3JlUmF0aW8gPSBjb250ZXh0LndlYmtpdEJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0Lm1vekJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0Lm1zQmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQub0JhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHwgMTtcbiAgICBpZiAoZGV2aWNlUGl4ZWxSYXRpbyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZGV2aWNlUGl4ZWxSYXRpbyAvIGJhY2tpbmdTdG9yZVJhdGlvO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBBdCBsZWFzdCBkZXZpY2VQaXhlbFJhdGlvIG11c3QgYmUgZGVmaW5lZCBmb3IgdGhpcyByYXRpbyB0byBtYWtlIHNlbnNlLlxuICAgICAgLy8gV2UgZGVmYXVsdCBiYWNraW5nU3RvcmVSYXRpbyB0byAxOiB0aGlzIGRvZXMgbm90IGV4aXN0IG9uIHNvbWUgYnJvd3NlcnNcbiAgICAgIC8vIChpLmUuIGRlc2t0b3AgQ2hyb21lKS5cbiAgICAgIHJldHVybiAxO1xuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiAxO1xuICB9XG59XG5cbi8qKlxuICogVE9ETyhkYW52ayk6IHVzZSBAdGVtcGxhdGUgaGVyZSB3aGVuIGl0J3MgYmV0dGVyIHN1cHBvcnRlZCBmb3IgY2xhc3Nlcy5cbiAqIEBwYXJhbSB7IUFycmF5fSBhcnJheVxuICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0XG4gKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKCFBcnJheSw/KTpib29sZWFuPX0gcHJlZGljYXRlXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEl0ZXJhdG9yKGFycmF5LCBzdGFydCwgbGVuZ3RoLCBwcmVkaWNhdGUpIHtcbiAgc3RhcnQgPSBzdGFydCB8fCAwO1xuICBsZW5ndGggPSBsZW5ndGggfHwgYXJyYXkubGVuZ3RoO1xuICB0aGlzLmhhc05leHQgPSB0cnVlOyAvLyBVc2UgdG8gaWRlbnRpZnkgaWYgdGhlcmUncyBhbm90aGVyIGVsZW1lbnQuXG4gIHRoaXMucGVlayA9IG51bGw7IC8vIFVzZSBmb3IgbG9vay1haGVhZFxuICB0aGlzLnN0YXJ0XyA9IHN0YXJ0O1xuICB0aGlzLmFycmF5XyA9IGFycmF5O1xuICB0aGlzLnByZWRpY2F0ZV8gPSBwcmVkaWNhdGU7XG4gIHRoaXMuZW5kXyA9IE1hdGgubWluKGFycmF5Lmxlbmd0aCwgc3RhcnQgKyBsZW5ndGgpO1xuICB0aGlzLm5leHRJZHhfID0gc3RhcnQgLSAxOyAvLyB1c2UgLTEgc28gaW5pdGlhbCBhZHZhbmNlIHdvcmtzLlxuICB0aGlzLm5leHQoKTsgLy8gaWdub3JpbmcgcmVzdWx0LlxufVxuXG4vKipcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuSXRlcmF0b3IucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCF0aGlzLmhhc05leHQpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIgb2JqID0gdGhpcy5wZWVrO1xuXG4gIHZhciBuZXh0SWR4ID0gdGhpcy5uZXh0SWR4XyArIDE7XG4gIHZhciBmb3VuZCA9IGZhbHNlO1xuICB3aGlsZSAobmV4dElkeCA8IHRoaXMuZW5kXykge1xuICAgIGlmICghdGhpcy5wcmVkaWNhdGVfIHx8IHRoaXMucHJlZGljYXRlXyh0aGlzLmFycmF5XywgbmV4dElkeCkpIHtcbiAgICAgIHRoaXMucGVlayA9IHRoaXMuYXJyYXlfW25leHRJZHhdO1xuICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIG5leHRJZHgrKztcbiAgfVxuICB0aGlzLm5leHRJZHhfID0gbmV4dElkeDtcbiAgaWYgKCFmb3VuZCkge1xuICAgIHRoaXMuaGFzTmV4dCA9IGZhbHNlO1xuICAgIHRoaXMucGVlayA9IG51bGw7XG4gIH1cbiAgcmV0dXJuIG9iajtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIG5ldyBpdGVyYXRvciBvdmVyIGFycmF5LCBiZXR3ZWVuIGluZGV4ZXMgc3RhcnQgYW5kXG4gKiBzdGFydCArIGxlbmd0aCwgYW5kIG9ubHkgcmV0dXJucyBlbnRyaWVzIHRoYXQgcGFzcyB0aGUgYWNjZXB0IGZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHshQXJyYXl9IGFycmF5IHRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge251bWJlcn0gc3RhcnQgdGhlIGZpcnN0IGluZGV4IHRvIGl0ZXJhdGUgb3ZlciwgMCBpZiBhYnNlbnQuXG4gKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAqICAgICBUaGlzLCBhbG9uZyB3aXRoIHN0YXJ0LCBkZWZpbmVzIGEgc2xpY2Ugb2YgdGhlIGFycmF5LCBhbmQgc28gbGVuZ3RoXG4gKiAgICAgZG9lc24ndCBpbXBseSB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoZSBpdGVyYXRvciB3aGVuIGFjY2VwdCBkb2Vzbid0XG4gKiAgICAgYWx3YXlzIGFjY2VwdCBhbGwgdmFsdWVzLiBhcnJheS5sZW5ndGggd2hlbiBhYnNlbnQuXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKD8pOmJvb2xlYW49fSBvcHRfcHJlZGljYXRlIGEgZnVuY3Rpb24gdGhhdCB0YWtlc1xuICogICAgIHBhcmFtZXRlcnMgYXJyYXkgYW5kIGlkeCwgd2hpY2ggcmV0dXJucyB0cnVlIHdoZW4gdGhlIGVsZW1lbnQgc2hvdWxkIGJlXG4gKiAgICAgcmV0dXJuZWQuICBJZiBvbWl0dGVkLCBhbGwgZWxlbWVudHMgYXJlIGFjY2VwdGVkLlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUl0ZXJhdG9yKGFycmF5LCBzdGFydCwgbGVuZ3RoLCBvcHRfcHJlZGljYXRlKSB7XG4gIHJldHVybiBuZXcgSXRlcmF0b3IoYXJyYXksIHN0YXJ0LCBsZW5ndGgsIG9wdF9wcmVkaWNhdGUpO1xufVxuXG4vLyBTaGltIGxheWVyIHdpdGggc2V0VGltZW91dCBmYWxsYmFjay5cbi8vIEZyb206IGh0dHA6Ly9wYXVsaXJpc2guY29tLzIwMTEvcmVxdWVzdGFuaW1hdGlvbmZyYW1lLWZvci1zbWFydC1hbmltYXRpbmcvXG4vLyBTaG91bGQgYmUgY2FsbGVkIHdpdGggdGhlIHdpbmRvdyBjb250ZXh0OlxuLy8gICBEeWdyYXBoLnJlcXVlc3RBbmltRnJhbWUuY2FsbCh3aW5kb3csIGZ1bmN0aW9uKCkge30pXG5leHBvcnQgdmFyIHJlcXVlc3RBbmltRnJhbWUgPSAoZnVuY3Rpb24oKSB7XG4gIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICAgIHx8XG4gICAgICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgICAgfHxcbiAgICAgICAgICB3aW5kb3cub1JlcXVlc3RBbmltYXRpb25GcmFtZSAgICAgIHx8XG4gICAgICAgICAgd2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICB8fFxuICAgICAgICAgIGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MCk7XG4gICAgICAgICAgfTtcbn0pKCk7XG5cbi8qKlxuICogQ2FsbCBhIGZ1bmN0aW9uIGF0IG1vc3QgbWF4RnJhbWVzIHRpbWVzIGF0IGFuIGF0dGVtcHRlZCBpbnRlcnZhbCBvZlxuICogZnJhbWVQZXJpb2RJbk1pbGxpcywgdGhlbiBjYWxsIGEgY2xlYW51cCBmdW5jdGlvbiBvbmNlLiByZXBlYXRGbiBpcyBjYWxsZWRcbiAqIG9uY2UgaW1tZWRpYXRlbHksIHRoZW4gYXQgbW9zdCAobWF4RnJhbWVzIC0gMSkgdGltZXMgYXN5bmNocm9ub3VzbHkuIElmXG4gKiBtYXhGcmFtZXM9PTEsIHRoZW4gY2xlYW51cF9mbigpIGlzIGFsc28gY2FsbGVkIHN5bmNocm9ub3VzbHkuICBUaGlzIGZ1bmN0aW9uXG4gKiBpcyB1c2VkIHRvIHNlcXVlbmNlIGFuaW1hdGlvbi5cbiAqIEBwYXJhbSB7ZnVuY3Rpb24obnVtYmVyKX0gcmVwZWF0Rm4gQ2FsbGVkIHJlcGVhdGVkbHkgLS0gdGFrZXMgdGhlIGZyYW1lXG4gKiAgICAgbnVtYmVyIChmcm9tIDAgdG8gbWF4RnJhbWVzLTEpIGFzIGFuIGFyZ3VtZW50LlxuICogQHBhcmFtIHtudW1iZXJ9IG1heEZyYW1lcyBUaGUgbWF4IG51bWJlciBvZiB0aW1lcyB0byBjYWxsIHJlcGVhdEZuXG4gKiBAcGFyYW0ge251bWJlcn0gZnJhbWVQZXJpb2RJbk1pbGxpcyBNYXggcmVxdWVzdGVkIHRpbWUgYmV0d2VlbiBmcmFtZXMuXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKCl9IGNsZWFudXBGbiBBIGZ1bmN0aW9uIHRvIGNhbGwgYWZ0ZXIgYWxsIHJlcGVhdEZuIGNhbGxzLlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlcGVhdEFuZENsZWFudXAocmVwZWF0Rm4sIG1heEZyYW1lcywgZnJhbWVQZXJpb2RJbk1pbGxpcyxcbiAgICBjbGVhbnVwRm4pIHtcbiAgdmFyIGZyYW1lTnVtYmVyID0gMDtcbiAgdmFyIHByZXZpb3VzRnJhbWVOdW1iZXI7XG4gIHZhciBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgcmVwZWF0Rm4oZnJhbWVOdW1iZXIpO1xuICBpZiAobWF4RnJhbWVzID09IDEpIHtcbiAgICBjbGVhbnVwRm4oKTtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG1heEZyYW1lQXJnID0gbWF4RnJhbWVzIC0gMTtcblxuICAoZnVuY3Rpb24gbG9vcCgpIHtcbiAgICBpZiAoZnJhbWVOdW1iZXIgPj0gbWF4RnJhbWVzKSByZXR1cm47XG4gICAgcmVxdWVzdEFuaW1GcmFtZS5jYWxsKHdpbmRvdywgZnVuY3Rpb24oKSB7XG4gICAgICAvLyBEZXRlcm1pbmUgd2hpY2ggZnJhbWUgdG8gZHJhdyBiYXNlZCBvbiB0aGUgZGVsYXkgc28gZmFyLiAgV2lsbCBza2lwXG4gICAgICAvLyBmcmFtZXMgaWYgbmVjZXNzYXJ5LlxuICAgICAgdmFyIGN1cnJlbnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICB2YXIgZGVsYXlJbk1pbGxpcyA9IGN1cnJlbnRUaW1lIC0gc3RhcnRUaW1lO1xuICAgICAgcHJldmlvdXNGcmFtZU51bWJlciA9IGZyYW1lTnVtYmVyO1xuICAgICAgZnJhbWVOdW1iZXIgPSBNYXRoLmZsb29yKGRlbGF5SW5NaWxsaXMgLyBmcmFtZVBlcmlvZEluTWlsbGlzKTtcbiAgICAgIHZhciBmcmFtZURlbHRhID0gZnJhbWVOdW1iZXIgLSBwcmV2aW91c0ZyYW1lTnVtYmVyO1xuICAgICAgLy8gSWYgd2UgcHJlZGljdCB0aGF0IHRoZSBzdWJzZXF1ZW50IHJlcGVhdEZuIGNhbGwgd2lsbCBvdmVyc2hvb3Qgb3VyXG4gICAgICAvLyB0b3RhbCBmcmFtZSB0YXJnZXQsIHNvIG91ciBsYXN0IGNhbGwgd2lsbCBjYXVzZSBhIHN0dXR0ZXIsIHRoZW4ganVtcCB0b1xuICAgICAgLy8gdGhlIGxhc3QgY2FsbCBpbW1lZGlhdGVseS4gIElmIHdlJ3JlIGdvaW5nIHRvIGNhdXNlIGEgc3R1dHRlciwgYmV0dGVyXG4gICAgICAvLyB0byBkbyBpdCBmYXN0ZXIgdGhhbiBzbG93ZXIuXG4gICAgICB2YXIgcHJlZGljdE92ZXJzaG9vdFN0dXR0ZXIgPSAoZnJhbWVOdW1iZXIgKyBmcmFtZURlbHRhKSA+IG1heEZyYW1lQXJnO1xuICAgICAgaWYgKHByZWRpY3RPdmVyc2hvb3RTdHV0dGVyIHx8IChmcmFtZU51bWJlciA+PSBtYXhGcmFtZUFyZykpIHtcbiAgICAgICAgcmVwZWF0Rm4obWF4RnJhbWVBcmcpOyAgLy8gRW5zdXJlIGZpbmFsIGNhbGwgd2l0aCBtYXhGcmFtZUFyZy5cbiAgICAgICAgY2xlYW51cEZuKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZnJhbWVEZWx0YSAhPT0gMCkgeyAgLy8gRG9uJ3QgY2FsbCByZXBlYXRGbiB3aXRoIGR1cGxpY2F0ZSBmcmFtZXMuXG4gICAgICAgICAgcmVwZWF0Rm4oZnJhbWVOdW1iZXIpO1xuICAgICAgICB9XG4gICAgICAgIGxvb3AoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSkoKTtcbn1cblxuLy8gQSB3aGl0ZWxpc3Qgb2Ygb3B0aW9ucyB0aGF0IGRvIG5vdCBjaGFuZ2UgcGl4ZWwgcG9zaXRpb25zLlxudmFyIHBpeGVsU2FmZU9wdGlvbnMgPSB7XG4gICdhbm5vdGF0aW9uQ2xpY2tIYW5kbGVyJzogdHJ1ZSxcbiAgJ2Fubm90YXRpb25EYmxDbGlja0hhbmRsZXInOiB0cnVlLFxuICAnYW5ub3RhdGlvbk1vdXNlT3V0SGFuZGxlcic6IHRydWUsXG4gICdhbm5vdGF0aW9uTW91c2VPdmVySGFuZGxlcic6IHRydWUsXG4gICdheGlzTGluZUNvbG9yJzogdHJ1ZSxcbiAgJ2F4aXNMaW5lV2lkdGgnOiB0cnVlLFxuICAnY2xpY2tDYWxsYmFjayc6IHRydWUsXG4gICdkcmF3Q2FsbGJhY2snOiB0cnVlLFxuICAnZHJhd0hpZ2hsaWdodFBvaW50Q2FsbGJhY2snOiB0cnVlLFxuICAnZHJhd1BvaW50cyc6IHRydWUsXG4gICdkcmF3UG9pbnRDYWxsYmFjayc6IHRydWUsXG4gICdkcmF3R3JpZCc6IHRydWUsXG4gICdmaWxsQWxwaGEnOiB0cnVlLFxuICAnZ3JpZExpbmVDb2xvcic6IHRydWUsXG4gICdncmlkTGluZVdpZHRoJzogdHJ1ZSxcbiAgJ2hpZGVPdmVybGF5T25Nb3VzZU91dCc6IHRydWUsXG4gICdoaWdobGlnaHRDYWxsYmFjayc6IHRydWUsXG4gICdoaWdobGlnaHRDaXJjbGVTaXplJzogdHJ1ZSxcbiAgJ2ludGVyYWN0aW9uTW9kZWwnOiB0cnVlLFxuICAnbGFiZWxzRGl2JzogdHJ1ZSxcbiAgJ2xhYmVsc0tNQic6IHRydWUsXG4gICdsYWJlbHNLTUcyJzogdHJ1ZSxcbiAgJ2xhYmVsc1NlcGFyYXRlTGluZXMnOiB0cnVlLFxuICAnbGFiZWxzU2hvd1plcm9WYWx1ZXMnOiB0cnVlLFxuICAnbGVnZW5kJzogdHJ1ZSxcbiAgJ3BhbkVkZ2VGcmFjdGlvbic6IHRydWUsXG4gICdwaXhlbHNQZXJZTGFiZWwnOiB0cnVlLFxuICAncG9pbnRDbGlja0NhbGxiYWNrJzogdHJ1ZSxcbiAgJ3BvaW50U2l6ZSc6IHRydWUsXG4gICdyYW5nZVNlbGVjdG9yUGxvdEZpbGxDb2xvcic6IHRydWUsXG4gICdyYW5nZVNlbGVjdG9yUGxvdEZpbGxHcmFkaWVudENvbG9yJzogdHJ1ZSxcbiAgJ3JhbmdlU2VsZWN0b3JQbG90U3Ryb2tlQ29sb3InOiB0cnVlLFxuICAncmFuZ2VTZWxlY3RvckJhY2tncm91bmRTdHJva2VDb2xvcic6IHRydWUsXG4gICdyYW5nZVNlbGVjdG9yQmFja2dyb3VuZExpbmVXaWR0aCc6IHRydWUsXG4gICdyYW5nZVNlbGVjdG9yUGxvdExpbmVXaWR0aCc6IHRydWUsXG4gICdyYW5nZVNlbGVjdG9yRm9yZWdyb3VuZFN0cm9rZUNvbG9yJzogdHJ1ZSxcbiAgJ3JhbmdlU2VsZWN0b3JGb3JlZ3JvdW5kTGluZVdpZHRoJzogdHJ1ZSxcbiAgJ3JhbmdlU2VsZWN0b3JBbHBoYSc6IHRydWUsXG4gICdzaG93TGFiZWxzT25IaWdobGlnaHQnOiB0cnVlLFxuICAnc2hvd1JvbGxlcic6IHRydWUsXG4gICdzdHJva2VXaWR0aCc6IHRydWUsXG4gICd1bmRlcmxheUNhbGxiYWNrJzogdHJ1ZSxcbiAgJ3VuaGlnaGxpZ2h0Q2FsbGJhY2snOiB0cnVlLFxuICAnem9vbUNhbGxiYWNrJzogdHJ1ZVxufTtcblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHdpbGwgc2NhbiB0aGUgb3B0aW9uIGxpc3QgYW5kIGRldGVybWluZSBpZiB0aGV5XG4gKiByZXF1aXJlIHVzIHRvIHJlY2FsY3VsYXRlIHRoZSBwaXhlbCBwb3NpdGlvbnMgb2YgZWFjaCBwb2ludC5cbiAqIFRPRE86IG1vdmUgdGhpcyBpbnRvIGR5Z3JhcGgtb3B0aW9ucy5qc1xuICogQHBhcmFtIHshQXJyYXkuPHN0cmluZz59IGxhYmVscyBhIGxpc3Qgb2Ygb3B0aW9ucyB0byBjaGVjay5cbiAqIEBwYXJhbSB7IU9iamVjdH0gYXR0cnNcbiAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIGdyYXBoIG5lZWRzIG5ldyBwb2ludHMgZWxzZSBmYWxzZS5cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1BpeGVsQ2hhbmdpbmdPcHRpb25MaXN0KGxhYmVscywgYXR0cnMpIHtcbiAgLy8gQXNzdW1lIHRoYXQgd2UgZG8gbm90IHJlcXVpcmUgbmV3IHBvaW50cy5cbiAgLy8gVGhpcyB3aWxsIGNoYW5nZSB0byB0cnVlIGlmIHdlIGFjdHVhbGx5IGRvIG5lZWQgbmV3IHBvaW50cy5cblxuICAvLyBDcmVhdGUgYSBkaWN0aW9uYXJ5IG9mIHNlcmllcyBuYW1lcyBmb3IgZmFzdGVyIGxvb2t1cC5cbiAgLy8gSWYgdGhlcmUgYXJlIG5vIGxhYmVscywgdGhlbiB0aGUgZGljdGlvbmFyeSBzdGF5cyBlbXB0eS5cbiAgdmFyIHNlcmllc05hbWVzRGljdGlvbmFyeSA9IHsgfTtcbiAgaWYgKGxhYmVscykge1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbGFiZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBzZXJpZXNOYW1lc0RpY3Rpb25hcnlbbGFiZWxzW2ldXSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLy8gU2NhbiB0aHJvdWdoIGEgZmxhdCAoaS5lLiBub24tbmVzdGVkKSBvYmplY3Qgb2Ygb3B0aW9ucy5cbiAgLy8gUmV0dXJucyB0cnVlL2ZhbHNlIGRlcGVuZGluZyBvbiB3aGV0aGVyIG5ldyBwb2ludHMgYXJlIG5lZWRlZC5cbiAgdmFyIHNjYW5GbGF0T3B0aW9ucyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiBvcHRpb25zKSB7XG4gICAgICBpZiAob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSkgJiZcbiAgICAgICAgICAhcGl4ZWxTYWZlT3B0aW9uc1twcm9wZXJ0eV0pIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICAvLyBJdGVyYXRlIHRocm91Z2ggdGhlIGxpc3Qgb2YgdXBkYXRlZCBvcHRpb25zLlxuICBmb3IgKHZhciBwcm9wZXJ0eSBpbiBhdHRycykge1xuICAgIGlmICghYXR0cnMuaGFzT3duUHJvcGVydHkocHJvcGVydHkpKSBjb250aW51ZTtcblxuICAgIC8vIEZpbmQgb3V0IG9mIHRoaXMgZmllbGQgaXMgYWN0dWFsbHkgYSBzZXJpZXMgc3BlY2lmaWMgb3B0aW9ucyBsaXN0LlxuICAgIGlmIChwcm9wZXJ0eSA9PSAnaGlnaGxpZ2h0U2VyaWVzT3B0cycgfHxcbiAgICAgICAgKHNlcmllc05hbWVzRGljdGlvbmFyeVtwcm9wZXJ0eV0gJiYgIWF0dHJzLnNlcmllcykpIHtcbiAgICAgIC8vIFRoaXMgcHJvcGVydHkgdmFsdWUgaXMgYSBsaXN0IG9mIG9wdGlvbnMgZm9yIHRoaXMgc2VyaWVzLlxuICAgICAgaWYgKHNjYW5GbGF0T3B0aW9ucyhhdHRyc1twcm9wZXJ0eV0pKSByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKHByb3BlcnR5ID09ICdzZXJpZXMnIHx8IHByb3BlcnR5ID09ICdheGVzJykge1xuICAgICAgLy8gVGhpcyBpcyB0d2ljZS1uZXN0ZWQgb3B0aW9ucyBsaXN0LlxuICAgICAgdmFyIHBlclNlcmllcyA9IGF0dHJzW3Byb3BlcnR5XTtcbiAgICAgIGZvciAodmFyIHNlcmllcyBpbiBwZXJTZXJpZXMpIHtcbiAgICAgICAgaWYgKHBlclNlcmllcy5oYXNPd25Qcm9wZXJ0eShzZXJpZXMpICYmXG4gICAgICAgICAgICBzY2FuRmxhdE9wdGlvbnMocGVyU2VyaWVzW3Nlcmllc10pKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgdGhpcyB3YXMgbm90IGEgc2VyaWVzIHNwZWNpZmljIG9wdGlvbiBsaXN0LFxuICAgICAgLy8gY2hlY2sgaWYgaXQncyBhIHBpeGVsLWNoYW5naW5nIHByb3BlcnR5LlxuICAgICAgaWYgKCFwaXhlbFNhZmVPcHRpb25zW3Byb3BlcnR5XSkgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgdmFyIENpcmNsZXMgPSB7XG4gIERFRkFVTFQgOiBmdW5jdGlvbihnLCBuYW1lLCBjdHgsIGNhbnZhc3gsIGNhbnZhc3ksIGNvbG9yLCByYWRpdXMpIHtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xuICAgIGN0eC5hcmMoY2FudmFzeCwgY2FudmFzeSwgcmFkaXVzLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xuICAgIGN0eC5maWxsKCk7XG4gIH1cbiAgLy8gRm9yIG1vcmUgc2hhcGVzLCBpbmNsdWRlIGV4dHJhcy9zaGFwZXMuanNcbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lIHdoZXRoZXIgfGRhdGF8IGlzIGRlbGltaXRlZCBieSBDUiwgQ1JMRiwgTEYsIExGQ1IuXG4gKiBAcGFyYW0ge3N0cmluZ30gZGF0YVxuICogQHJldHVybiB7P3N0cmluZ30gdGhlIGRlbGltaXRlciB0aGF0IHdhcyBkZXRlY3RlZCAob3IgbnVsbCBvbiBmYWlsdXJlKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRldGVjdExpbmVEZWxpbWl0ZXIoZGF0YSkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgY29kZSA9IGRhdGEuY2hhckF0KGkpO1xuICAgIGlmIChjb2RlID09PSAnXFxyJykge1xuICAgICAgLy8gTWlnaHQgYWN0dWFsbHkgYmUgXCJcXHJcXG5cIi5cbiAgICAgIGlmICgoKGkgKyAxKSA8IGRhdGEubGVuZ3RoKSAmJiAoZGF0YS5jaGFyQXQoaSArIDEpID09PSAnXFxuJykpIHtcbiAgICAgICAgcmV0dXJuICdcXHJcXG4nO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvZGU7XG4gICAgfVxuICAgIGlmIChjb2RlID09PSAnXFxuJykge1xuICAgICAgLy8gTWlnaHQgYWN0dWFsbHkgYmUgXCJcXG5cXHJcIi5cbiAgICAgIGlmICgoKGkgKyAxKSA8IGRhdGEubGVuZ3RoKSAmJiAoZGF0YS5jaGFyQXQoaSArIDEpID09PSAnXFxyJykpIHtcbiAgICAgICAgcmV0dXJuICdcXG5cXHInO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvZGU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogSXMgb25lIG5vZGUgY29udGFpbmVkIGJ5IGFub3RoZXI/XG4gKiBAcGFyYW0ge05vZGV9IGNvbnRhaW5lZSBUaGUgY29udGFpbmVkIG5vZGUuXG4gKiBAcGFyYW0ge05vZGV9IGNvbnRhaW5lciBUaGUgY29udGFpbmVyIG5vZGUuXG4gKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIGNvbnRhaW5lZSBpcyBpbnNpZGUgKG9yIGVxdWFsIHRvKSBjb250YWluZXIuXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNOb2RlQ29udGFpbmVkQnkoY29udGFpbmVlLCBjb250YWluZXIpIHtcbiAgaWYgKGNvbnRhaW5lciA9PT0gbnVsbCB8fCBjb250YWluZWUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIGNvbnRhaW5lZU5vZGUgPSAvKiogQHR5cGUge05vZGV9ICovIChjb250YWluZWUpO1xuICB3aGlsZSAoY29udGFpbmVlTm9kZSAmJiBjb250YWluZWVOb2RlICE9PSBjb250YWluZXIpIHtcbiAgICBjb250YWluZWVOb2RlID0gY29udGFpbmVlTm9kZS5wYXJlbnROb2RlO1xuICB9XG4gIHJldHVybiAoY29udGFpbmVlTm9kZSA9PT0gY29udGFpbmVyKTtcbn1cblxuLy8gVGhpcyBtYXNrcyBzb21lIG51bWVyaWMgaXNzdWVzIGluIG9sZGVyIHZlcnNpb25zIG9mIEZpcmVmb3gsXG4vLyB3aGVyZSAxLjAvTWF0aC5wb3coMTAsMikgIT0gTWF0aC5wb3coMTAsLTIpLlxuLyoqIEB0eXBlIHtmdW5jdGlvbihudW1iZXIsbnVtYmVyKTpudW1iZXJ9ICovXG5leHBvcnQgZnVuY3Rpb24gcG93KGJhc2UsIGV4cCkge1xuICBpZiAoZXhwIDwgMCkge1xuICAgIHJldHVybiAxLjAgLyBNYXRoLnBvdyhiYXNlLCAtZXhwKTtcbiAgfVxuICByZXR1cm4gTWF0aC5wb3coYmFzZSwgZXhwKTtcbn1cblxudmFyIFJHQkF4UkUgPSAvXiMoWzAtOUEtRmEtZl17Mn0pKFswLTlBLUZhLWZdezJ9KShbMC05QS1GYS1mXXsyfSkoWzAtOUEtRmEtZl17Mn0pPyQvO1xudmFyIFJHQkFfUkUgPSAvXnJnYmE/XFwoKFxcZHsxLDN9KSxcXHMqKFxcZHsxLDN9KSxcXHMqKFxcZHsxLDN9KSg/OixcXHMqKFswMV0oPzpcXC5cXGQrKT8pKT9cXCkkLztcblxuLyoqXG4gKiBIZWxwZXIgZm9yIHRvUkdCXyB3aGljaCBwYXJzZXMgc3RyaW5ncyBvZiB0aGUgZm9ybTpcbiAqICNSUkdHQkIgKGhleClcbiAqICNSUkdHQkJBQSAoaGV4KVxuICogcmdiKDEyMywgNDUsIDY3KVxuICogcmdiYSgxMjMsIDQ1LCA2NywgMC41KVxuICogQHJldHVybiBwYXJzZWQge3IsZyxiLGE/fSB0dXBsZSBvciBudWxsLlxuICovXG5mdW5jdGlvbiBwYXJzZVJHQkEocmdiU3RyKSB7XG4gIHZhciBiaXRzLCByLCBnLCBiLCBhID0gbnVsbDtcbiAgaWYgKChiaXRzID0gUkdCQXhSRS5leGVjKHJnYlN0cikpKSB7XG4gICAgciA9IHBhcnNlSW50KGJpdHNbMV0sIDE2KTtcbiAgICBnID0gcGFyc2VJbnQoYml0c1syXSwgMTYpO1xuICAgIGIgPSBwYXJzZUludChiaXRzWzNdLCAxNik7XG4gICAgaWYgKGJpdHNbNF0pXG4gICAgICBhID0gcGFyc2VJbnQoYml0c1s0XSwgMTYpO1xuICB9IGVsc2UgaWYgKChiaXRzID0gUkdCQV9SRS5leGVjKHJnYlN0cikpKSB7XG4gICAgciA9IHBhcnNlSW50KGJpdHNbMV0sIDEwKTtcbiAgICBnID0gcGFyc2VJbnQoYml0c1syXSwgMTApO1xuICAgIGIgPSBwYXJzZUludChiaXRzWzNdLCAxMCk7XG4gICAgaWYgKGJpdHNbNF0pXG4gICAgICBhID0gcGFyc2VGbG9hdChiaXRzWzRdKTtcbiAgfSBlbHNlXG4gICAgcmV0dXJuIG51bGw7XG4gIGlmIChhICE9PSBudWxsKVxuICAgIHJldHVybiB7IFwiclwiOiByLCBcImdcIjogZywgXCJiXCI6IGIsIFwiYVwiOiBhIH07XG4gIHJldHVybiB7IFwiclwiOiByLCBcImdcIjogZywgXCJiXCI6IGIgfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhbnkgdmFsaWQgQ1NTIGNvbG9yIChoZXgsIHJnYigpLCBuYW1lZCBjb2xvcikgdG8gYW4gUkdCIHR1cGxlLlxuICpcbiAqIEBwYXJhbSB7IXN0cmluZ30gY29sb3JTdHIgQW55IHZhbGlkIENTUyBjb2xvciBzdHJpbmcuXG4gKiBAcmV0dXJuIHt7cjpudW1iZXIsZzpudW1iZXIsYjpudW1iZXIsYTpudW1iZXI/fX0gUGFyc2VkIFJHQiB0dXBsZS5cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b1JHQl8oY29sb3JTdHIpIHtcbiAgLy8gU3RyYXRlZ3k6IEZpcnN0IHRyeSB0byBwYXJzZSBjb2xvclN0ciBkaXJlY3RseS4gVGhpcyBpcyBmYXN0ICYgYXZvaWRzIERPTVxuICAvLyBtYW5pcHVsYXRpb24uICBJZiB0aGF0IGZhaWxzIChlLmcuIGZvciBuYW1lZCBjb2xvcnMgbGlrZSAncmVkJyksIHRoZW5cbiAgLy8gY3JlYXRlIGEgaGlkZGVuIERPTSBlbGVtZW50IGFuZCBwYXJzZSBpdHMgY29tcHV0ZWQgY29sb3IuXG4gIHZhciByZ2IgPSBwYXJzZVJHQkEoY29sb3JTdHIpO1xuICBpZiAocmdiKSByZXR1cm4gcmdiO1xuXG4gIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGNvbG9yU3RyO1xuICBkaXYuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdik7XG4gIHZhciByZ2JTdHIgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShkaXYsIG51bGwpLmJhY2tncm91bmRDb2xvcjtcbiAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChkaXYpO1xuICByZXR1cm4gcGFyc2VSR0JBKHJnYlN0cik7XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIGJyb3dzZXIgc3VwcG9ydHMgdGhlICZsdDtjYW52YXMmZ3Q7IHRhZy5cbiAqIEBwYXJhbSB7SFRNTENhbnZhc0VsZW1lbnQ9fSBvcHRfY2FudmFzRWxlbWVudCBQYXNzIGEgY2FudmFzIGVsZW1lbnQgYXMgYW5cbiAqICAgICBvcHRpbWl6YXRpb24gaWYgeW91IGhhdmUgb25lLlxuICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB0aGUgYnJvd3NlciBzdXBwb3J0cyBjYW52YXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0NhbnZhc1N1cHBvcnRlZChvcHRfY2FudmFzRWxlbWVudCkge1xuICB0cnkge1xuICAgIHZhciBjYW52YXMgPSBvcHRfY2FudmFzRWxlbWVudCB8fCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgIGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogUGFyc2VzIHRoZSB2YWx1ZSBhcyBhIGZsb2F0aW5nIHBvaW50IG51bWJlci4gVGhpcyBpcyBsaWtlIHRoZSBwYXJzZUZsb2F0KClcbiAqIGJ1aWx0LWluLCBidXQgd2l0aCBhIGZldyBkaWZmZXJlbmNlczpcbiAqIC0gdGhlIGVtcHR5IHN0cmluZyBpcyBwYXJzZWQgYXMgbnVsbCwgcmF0aGVyIHRoYW4gTmFOLlxuICogLSBpZiB0aGUgc3RyaW5nIGNhbm5vdCBiZSBwYXJzZWQgYXQgYWxsLCBhbiBlcnJvciBpcyBsb2dnZWQuXG4gKiBJZiB0aGUgc3RyaW5nIGNhbid0IGJlIHBhcnNlZCwgdGhpcyBtZXRob2QgcmV0dXJucyBudWxsLlxuICogQHBhcmFtIHtzdHJpbmd9IHggVGhlIHN0cmluZyB0byBiZSBwYXJzZWRcbiAqIEBwYXJhbSB7bnVtYmVyPX0gb3B0X2xpbmVfbm8gVGhlIGxpbmUgbnVtYmVyIGZyb20gd2hpY2ggdGhlIHN0cmluZyBjb21lcy5cbiAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X2xpbmUgVGhlIHRleHQgb2YgdGhlIGxpbmUgZnJvbSB3aGljaCB0aGUgc3RyaW5nIGNvbWVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VGbG9hdF8oeCwgb3B0X2xpbmVfbm8sIG9wdF9saW5lKSB7XG4gIHZhciB2YWwgPSBwYXJzZUZsb2F0KHgpO1xuICBpZiAoIWlzTmFOKHZhbCkpIHJldHVybiB2YWw7XG5cbiAgLy8gVHJ5IHRvIGZpZ3VyZSBvdXQgd2hhdCBoYXBwZWVuZC5cbiAgLy8gSWYgdGhlIHZhbHVlIGlzIHRoZSBlbXB0eSBzdHJpbmcsIHBhcnNlIGl0IGFzIG51bGwuXG4gIGlmICgvXiAqJC8udGVzdCh4KSkgcmV0dXJuIG51bGw7XG5cbiAgLy8gSWYgaXQgd2FzIGFjdHVhbGx5IFwiTmFOXCIsIHJldHVybiBpdCBhcyBOYU4uXG4gIGlmICgvXiAqbmFuICokL2kudGVzdCh4KSkgcmV0dXJuIE5hTjtcblxuICAvLyBMb29rcyBsaWtlIGEgcGFyc2luZyBlcnJvci5cbiAgdmFyIG1zZyA9IFwiVW5hYmxlIHRvIHBhcnNlICdcIiArIHggKyBcIicgYXMgYSBudW1iZXJcIjtcbiAgaWYgKG9wdF9saW5lICE9PSB1bmRlZmluZWQgJiYgb3B0X2xpbmVfbm8gIT09IHVuZGVmaW5lZCkge1xuICAgIG1zZyArPSBcIiBvbiBsaW5lIFwiICsgKDErKG9wdF9saW5lX25vfHwwKSkgKyBcIiAoJ1wiICsgb3B0X2xpbmUgKyBcIicpIG9mIENTVi5cIjtcbiAgfVxuICBjb25zb2xlLmVycm9yKG1zZyk7XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8vIExhYmVsIGNvbnN0YW50cyBmb3IgdGhlIGxhYmVsc0tNQiBhbmQgbGFiZWxzS01HMiBvcHRpb25zLlxuLy8gKGkuZS4gJzEwMDAwMCcgLT4gJzEwMGsnKVxudmFyIEtNQl9MQUJFTFNfTEFSR0UgPSBbICdrJywgJ00nLCAnRycsICdUJywgJ1AnLCAnRScsICdaJywgJ1knIF07XG52YXIgS01CX0xBQkVMU19TTUFMTCA9IFsgJ20nLCAnwrUnLCAnbicsICdwJywgJ2YnLCAnYScsICd6JywgJ3knIF07XG52YXIgS01HMl9MQUJFTFNfTEFSR0UgPSBbICdLaScsICdNaScsICdHaScsICdUaScsICdQaScsICdFaScsICdaaScsICdZaScgXTtcbnZhciBLTUcyX0xBQkVMU19TTUFMTCA9IFsgJ3AtMTAnLCAncC0yMCcsICdwLTMwJywgJ3AtNDAnLCAncC01MCcsICdwLTYwJywgJ3AtNzAnLCAncC04MCcgXTtcbi8qIGlmIGJvdGggYXJlIGdpdmVuIChsZWdhY3kvZGVwcmVjYXRlZCB1c2Ugb25seSkgKi9cbnZhciBLTUIyX0xBQkVMU19MQVJHRSA9IFsgJ0snLCAnTScsICdHJywgJ1QnLCAnUCcsICdFJywgJ1onLCAnWScgXTtcbnZhciBLTUIyX0xBQkVMU19TTUFMTCA9IEtNQl9MQUJFTFNfU01BTEw7XG5cbi8qKlxuICogQHByaXZhdGVcbiAqIFJldHVybiBhIHN0cmluZyB2ZXJzaW9uIG9mIGEgbnVtYmVyLiBUaGlzIHJlc3BlY3RzIHRoZSBkaWdpdHNBZnRlckRlY2ltYWxcbiAqIGFuZCBtYXhOdW1iZXJXaWR0aCBvcHRpb25zLlxuICogQHBhcmFtIHtudW1iZXJ9IHggVGhlIG51bWJlciB0byBiZSBmb3JtYXR0ZWRcbiAqIEBwYXJhbSB7RHlncmFwaH0gb3B0cyBBbiBvcHRpb25zIHZpZXdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG51bWJlclZhbHVlRm9ybWF0dGVyKHgsIG9wdHMpIHtcbiAgdmFyIHNpZ0ZpZ3MgPSBvcHRzKCdzaWdGaWdzJyk7XG5cbiAgaWYgKHNpZ0ZpZ3MgIT09IG51bGwpIHtcbiAgICAvLyBVc2VyIGhhcyBvcHRlZCBmb3IgYSBmaXhlZCBudW1iZXIgb2Ygc2lnbmlmaWNhbnQgZmlndXJlcy5cbiAgICByZXR1cm4gZmxvYXRGb3JtYXQoeCwgc2lnRmlncyk7XG4gIH1cblxuICAvLyBzaG9ydGN1dCAwIHNvIGxhdGVyIGNvZGUgZG9lcyBub3QgbmVlZCB0byB3b3JyeSBhYm91dCBpdFxuICBpZiAoeCA9PT0gMC4wKVxuICAgIHJldHVybiAnMCc7XG5cbiAgdmFyIGRpZ2l0cyA9IG9wdHMoJ2RpZ2l0c0FmdGVyRGVjaW1hbCcpO1xuICB2YXIgbWF4TnVtYmVyV2lkdGggPSBvcHRzKCdtYXhOdW1iZXJXaWR0aCcpO1xuXG4gIHZhciBrbWIgPSBvcHRzKCdsYWJlbHNLTUInKTtcbiAgdmFyIGttZzIgPSBvcHRzKCdsYWJlbHNLTUcyJyk7XG5cbiAgdmFyIGxhYmVsO1xuICB2YXIgYWJzeCA9IE1hdGguYWJzKHgpO1xuXG4gIGlmIChrbWIgfHwga21nMikge1xuICAgIHZhciBrO1xuICAgIHZhciBrX2xhYmVscyA9IFtdO1xuICAgIHZhciBtX2xhYmVscyA9IFtdO1xuICAgIGlmIChrbWIpIHtcbiAgICAgIGsgPSAxMDAwO1xuICAgICAga19sYWJlbHMgPSBLTUJfTEFCRUxTX0xBUkdFO1xuICAgICAgbV9sYWJlbHMgPSBLTUJfTEFCRUxTX1NNQUxMO1xuICAgIH1cbiAgICBpZiAoa21nMikge1xuICAgICAgayA9IDEwMjQ7XG4gICAgICBrX2xhYmVscyA9IEtNRzJfTEFCRUxTX0xBUkdFO1xuICAgICAgbV9sYWJlbHMgPSBLTUcyX0xBQkVMU19TTUFMTDtcbiAgICAgIGlmIChrbWIpIHtcbiAgICAgICAga19sYWJlbHMgPSBLTUIyX0xBQkVMU19MQVJHRTtcbiAgICAgICAgbV9sYWJlbHMgPSBLTUIyX0xBQkVMU19TTUFMTDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbjtcbiAgICB2YXIgajtcbiAgICBpZiAoYWJzeCA+PSBrKSB7XG4gICAgICBqID0ga19sYWJlbHMubGVuZ3RoO1xuICAgICAgd2hpbGUgKGogPiAwKSB7XG4gICAgICAgIG4gPSBwb3coaywgaik7XG4gICAgICAgIC0tajtcbiAgICAgICAgaWYgKGFic3ggPj0gbikge1xuICAgICAgICAgIC8vIGd1YXJhbnRlZWQgdG8gaGl0IGJlY2F1c2UgYWJzeCA+PSBrIChwb3coaywgMSkpXG4gICAgICAgICAgLy8gaWYgaW1tZW5zZWx5IGxhcmdlIHN0aWxsIHN3aXRjaCB0byBzY2llbnRpZmljIG5vdGF0aW9uXG4gICAgICAgICAgaWYgKChhYnN4IC8gbikgPj0gTWF0aC5wb3coMTAsIG1heE51bWJlcldpZHRoKSlcbiAgICAgICAgICAgIGxhYmVsID0geC50b0V4cG9uZW50aWFsKGRpZ2l0cyk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgbGFiZWwgPSByb3VuZF8oeCAvIG4sIGRpZ2l0cykgKyBrX2xhYmVsc1tqXTtcbiAgICAgICAgICByZXR1cm4gbGFiZWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIG5vdCByZWFjaGVkLCBmYWxsIHRocm91Z2ggc2FmZWx5IHRob3VnaCBzaG91bGQgaXQgZXZlciBiZVxuICAgIH0gZWxzZSBpZiAoKGFic3ggPCAxKSAvKiAmJiAobV9sYWJlbHMubGVuZ3RoID4gMCkgKi8pIHtcbiAgICAgIGogPSAwO1xuICAgICAgd2hpbGUgKGogPCBtX2xhYmVscy5sZW5ndGgpIHtcbiAgICAgICAgKytqO1xuICAgICAgICBuID0gcG93KGssIGopO1xuICAgICAgICBpZiAoKGFic3ggKiBuKSA+PSAxKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgLy8gaWYgX3N0aWxsXyB0b28gc21hbGwsIHN3aXRjaCB0byBzY2llbnRpZmljIG5vdGF0aW9uIGluc3RlYWRcbiAgICAgIGlmICgoYWJzeCAqIG4pIDwgTWF0aC5wb3coMTAsIC1kaWdpdHMpKVxuICAgICAgICBsYWJlbCA9IHgudG9FeHBvbmVudGlhbChkaWdpdHMpO1xuICAgICAgZWxzZVxuICAgICAgICBsYWJlbCA9IHJvdW5kXyh4ICogbiwgZGlnaXRzKSArIG1fbGFiZWxzW2ogLSAxXTtcbiAgICAgIHJldHVybiBsYWJlbDtcbiAgICB9XG4gICAgLy8gZWxzZSBmYWxsIHRocm91Z2hcbiAgfVxuXG4gIGlmIChhYnN4ID49IE1hdGgucG93KDEwLCBtYXhOdW1iZXJXaWR0aCkgfHxcbiAgICAgIGFic3ggPCBNYXRoLnBvdygxMCwgLWRpZ2l0cykpIHtcbiAgICAvLyBzd2l0Y2ggdG8gc2NpZW50aWZpYyBub3RhdGlvbiBpZiB3ZSB1bmRlcmZsb3cgb3Igb3ZlcmZsb3cgZml4ZWQgZGlzcGxheVxuICAgIGxhYmVsID0geC50b0V4cG9uZW50aWFsKGRpZ2l0cyk7XG4gIH0gZWxzZSB7XG4gICAgbGFiZWwgPSAnJyArIHJvdW5kXyh4LCBkaWdpdHMpO1xuICB9XG5cbiAgcmV0dXJuIGxhYmVsO1xufVxuXG4vKipcbiAqIHZhcmlhbnQgZm9yIHVzZSBhcyBhbiBheGlzTGFiZWxGb3JtYXR0ZXIuXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbnVtYmVyQXhpc0xhYmVsRm9ybWF0dGVyKHgsIGdyYW51bGFyaXR5LCBvcHRzKSB7XG4gIHJldHVybiBudW1iZXJWYWx1ZUZvcm1hdHRlci5jYWxsKHRoaXMsIHgsIG9wdHMpO1xufVxuXG4vKipcbiAqIEB0eXBlIHshQXJyYXkuPHN0cmluZz59XG4gKiBAcHJpdmF0ZVxuICogQGNvbnN0YW50XG4gKi9cbnZhciBTSE9SVF9NT05USF9OQU1FU18gPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJywgJ09jdCcsICdOb3YnLCAnRGVjJ107XG5cbi8qKlxuICogQ29udmVydCBhIEpTIGRhdGUgdG8gYSBzdHJpbmcgYXBwcm9wcmlhdGUgdG8gZGlzcGxheSBvbiBhbiBheGlzIHRoYXRcbiAqIGlzIGRpc3BsYXlpbmcgdmFsdWVzIGF0IHRoZSBzdGF0ZWQgZ3JhbnVsYXJpdHkuIFRoaXMgcmVzcGVjdHMgdGhlXG4gKiBsYWJlbHNVVEMgb3B0aW9uLlxuICogQHBhcmFtIHtEYXRlfSBkYXRlIFRoZSBkYXRlIHRvIGZvcm1hdFxuICogQHBhcmFtIHtudW1iZXJ9IGdyYW51bGFyaXR5IE9uZSBvZiB0aGUgRHlncmFwaCBncmFudWxhcml0eSBjb25zdGFudHNcbiAqIEBwYXJhbSB7RHlncmFwaH0gb3B0cyBBbiBvcHRpb25zIHZpZXdcbiAqIEByZXR1cm4ge3N0cmluZ30gVGhlIGRhdGUgZm9ybWF0dGVkIGFzIGxvY2FsIHRpbWVcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkYXRlQXhpc0xhYmVsRm9ybWF0dGVyKGRhdGUsIGdyYW51bGFyaXR5LCBvcHRzKSB7XG4gIHZhciB1dGMgPSBvcHRzKCdsYWJlbHNVVEMnKTtcbiAgdmFyIGFjY2Vzc29ycyA9IHV0YyA/IERhdGVBY2Nlc3NvcnNVVEMgOiBEYXRlQWNjZXNzb3JzTG9jYWw7XG5cbiAgdmFyIHllYXIgPSBhY2Nlc3NvcnMuZ2V0RnVsbFllYXIoZGF0ZSksXG4gICAgICBtb250aCA9IGFjY2Vzc29ycy5nZXRNb250aChkYXRlKSxcbiAgICAgIGRheSA9IGFjY2Vzc29ycy5nZXREYXRlKGRhdGUpLFxuICAgICAgaG91cnMgPSBhY2Nlc3NvcnMuZ2V0SG91cnMoZGF0ZSksXG4gICAgICBtaW5zID0gYWNjZXNzb3JzLmdldE1pbnV0ZXMoZGF0ZSksXG4gICAgICBzZWNzID0gYWNjZXNzb3JzLmdldFNlY29uZHMoZGF0ZSksXG4gICAgICBtaWxsaXMgPSBhY2Nlc3NvcnMuZ2V0TWlsbGlzZWNvbmRzKGRhdGUpO1xuXG4gIGlmIChncmFudWxhcml0eSA+PSBEeWdyYXBoVGlja2Vycy5HcmFudWxhcml0eS5ERUNBREFMKSB7XG4gICAgcmV0dXJuICcnICsgeWVhcjtcbiAgfSBlbHNlIGlmIChncmFudWxhcml0eSA+PSBEeWdyYXBoVGlja2Vycy5HcmFudWxhcml0eS5NT05USExZKSB7XG4gICAgcmV0dXJuIFNIT1JUX01PTlRIX05BTUVTX1ttb250aF0gKyAnJiMxNjA7JyArIHllYXI7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGZyYWMgPSBob3VycyAqIDM2MDAgKyBtaW5zICogNjAgKyBzZWNzICsgMWUtMyAqIG1pbGxpcztcbiAgICBpZiAoZnJhYyA9PT0gMCB8fCBncmFudWxhcml0eSA+PSBEeWdyYXBoVGlja2Vycy5HcmFudWxhcml0eS5EQUlMWSkge1xuICAgICAgLy8gZS5nLiAnMjEgSmFuJyAoJWQlYilcbiAgICAgIHJldHVybiB6ZXJvcGFkKGRheSkgKyAnJiMxNjA7JyArIFNIT1JUX01PTlRIX05BTUVTX1ttb250aF07XG4gICAgfSBlbHNlIGlmIChncmFudWxhcml0eSA8IER5Z3JhcGhUaWNrZXJzLkdyYW51bGFyaXR5LlNFQ09ORExZKSB7XG4gICAgICAvLyBlLmcuIDQwLjMxMCAobWVhbmluZyA0MCBzZWNvbmRzIGFuZCAzMTAgbWlsbGlzZWNvbmRzKVxuICAgICAgdmFyIHN0ciA9IFwiXCIgKyBtaWxsaXM7XG4gICAgICByZXR1cm4gemVyb3BhZChzZWNzKSArIFwiLlwiICsgKCcwMDAnK3N0cikuc3Vic3RyaW5nKHN0ci5sZW5ndGgpO1xuICAgIH0gZWxzZSBpZiAoZ3JhbnVsYXJpdHkgPiBEeWdyYXBoVGlja2Vycy5HcmFudWxhcml0eS5NSU5VVEVMWSkge1xuICAgICAgcmV0dXJuIGhtc1N0cmluZ18oaG91cnMsIG1pbnMsIHNlY3MsIDApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gaG1zU3RyaW5nXyhob3VycywgbWlucywgc2VjcywgbWlsbGlzKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm4gYSBzdHJpbmcgdmVyc2lvbiBvZiBhIEpTIGRhdGUgZm9yIGEgdmFsdWUgbGFiZWwuIFRoaXMgcmVzcGVjdHMgdGhlXG4gKiBsYWJlbHNVVEMgb3B0aW9uLlxuICogQHBhcmFtIHtEYXRlfSBkYXRlIFRoZSBkYXRlIHRvIGJlIGZvcm1hdHRlZFxuICogQHBhcmFtIHtEeWdyYXBofSBvcHRzIEFuIG9wdGlvbnMgdmlld1xuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRhdGVWYWx1ZUZvcm1hdHRlcihkLCBvcHRzKSB7XG4gIHJldHVybiBkYXRlU3RyaW5nXyhkLCBvcHRzKCdsYWJlbHNVVEMnKSk7XG59XG5cbi8vIHN0dWZmIGZvciBzaW1wbGUgb25ET01yZWFkeSBpbXBsZW1lbnRhdGlvblxudmFyIGRlZmVyRE9NX2NhbGxiYWNrcyA9IFtdO1xudmFyIGRlZmVyRE9NX2hhbmRsZXJDYWxsZWQgPSBmYWxzZTtcblxuLy8gb25ET01yZWFkeSBvbmNlIERPTSBpcyByZWFkeVxuLyoqXG4gKiBTaW1wbGUgb25ET01yZWFkeSBpbXBsZW1lbnRhdGlvblxuICogQHBhcmFtIHtmdW5jdGlvbigpfSBjYiBUaGUgY2FsbGJhY2sgdG8gcnVuIG9uY2UgdGhlIERPTSBpcyByZWFkeS5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IHdoZXRoZXIgdGhlIERPTSBpcyBjdXJyZW50bHkgcmVhZHlcbiAqL1xuZnVuY3Rpb24gZGVmZXJET01fcmVhZHkoY2IpIHtcbiAgaWYgKHR5cGVvZihjYikgPT09IFwiZnVuY3Rpb25cIilcbiAgICBjYigpO1xuICByZXR1cm4gKHRydWUpO1xufVxuXG4vKipcbiAqIFNldHVwIGEgc2ltcGxlIG9uRE9NcmVhZHkgaW1wbGVtZW50YXRpb24gb24gdGhlIGdpdmVuIG9iamN0LlxuICogQHBhcmFtIHsqfSBzZWxmIHRoZSBvYmplY3QgdG8gdXBkYXRlIC5vbkRPTXJlYWR5IG9uXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBET01yZWFkeV8oc2VsZikge1xuICAvLyBvbmx5IGF0dGFjaCBpZiB0aGVyZeKAmXMgYSBET01cbiAgaWYgKHR5cGVvZihkb2N1bWVudCkgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAvLyBjYWxsZWQgYnkgYnJvd3NlclxuICAgIGNvbnN0IGhhbmRsZXIgPSBmdW5jdGlvbiBkZWZlckRPTV9oYW5kbGVyKCkge1xuICAgICAgLyogZXhlY3V0ZSBvbmx5IG9uY2UgKi9cbiAgICAgIGlmIChkZWZlckRPTV9oYW5kbGVyQ2FsbGVkKVxuICAgICAgICByZXR1cm47XG4gICAgICBkZWZlckRPTV9oYW5kbGVyQ2FsbGVkID0gdHJ1ZTtcbiAgICAgIC8qIHN1YnNlcXVlbnQgY2FsbHMgbXVzdCBub3QgZW5xdWV1ZSAqL1xuICAgICAgc2VsZi5vbkRPTXJlYWR5ID0gZGVmZXJET01fcmVhZHk7XG4gICAgICAvKiBjbGVhciBldmVudCBoYW5kbGVycyAqL1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgaGFuZGxlciwgZmFsc2UpO1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGhhbmRsZXIsIGZhbHNlKTtcbiAgICAgIC8qIHJ1biB1c2VyIGNhbGxiYWNrcyAqL1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZWZlckRPTV9jYWxsYmFja3MubGVuZ3RoOyArK2kpXG4gICAgICAgIGRlZmVyRE9NX2NhbGxiYWNrc1tpXSgpO1xuICAgICAgZGVmZXJET01fY2FsbGJhY2tzID0gbnVsbDsgLy9nY1xuICAgIH07XG5cbiAgICAvLyBtYWtlIGNhbGxhYmxlIChtdXRhdGluZywgZG8gbm90IGNvcHkpXG4gICAgc2VsZi5vbkRPTXJlYWR5ID0gZnVuY3Rpb24gZGVmZXJET01faW5pdGlhbChjYikge1xuICAgICAgLyogaWYgcG9zc2libGUsIHNraXAgYWxsIHRoYXQgKi9cbiAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIpIHtcbiAgICAgICAgc2VsZi5vbkRPTXJlYWR5ID0gZGVmZXJET01fcmVhZHk7XG4gICAgICAgIHJldHVybiAoZGVmZXJET01fcmVhZHkoY2IpKTtcbiAgICAgIH1cbiAgICAgIC8vIG9uRE9NcmVhZHksIGFmdGVyIHNldHVwLCBiZWZvcmUgRE9NIGlzIHJlYWR5XG4gICAgICBjb25zdCBlbnFmbiA9IGZ1bmN0aW9uIGRlZmVyRE9NX2VucXVldWUoY2IpIHtcbiAgICAgICAgaWYgKHR5cGVvZihjYikgPT09IFwiZnVuY3Rpb25cIilcbiAgICAgICAgICBkZWZlckRPTV9jYWxsYmFja3MucHVzaChjYik7XG4gICAgICAgIHJldHVybiAoZmFsc2UpO1xuICAgICAgfTtcbiAgICAgIC8qIHN1YnNlcXVlbnQgY2FsbHMgd2lsbCBlbnF1ZXVlICovXG4gICAgICBzZWxmLm9uRE9NcmVhZHkgPSBlbnFmbjtcbiAgICAgIC8qIHNldCB1cCBoYW5kbGVyICovXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBoYW5kbGVyLCBmYWxzZSk7XG4gICAgICAvKiBsYXN0IHJlc29ydDogYWx3YXlzIHdvcmtzLCBidXQgbGF0ZXIgdGhhbiBwb3NzaWJsZSAqL1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGhhbmRsZXIsIGZhbHNlKTtcbiAgICAgIC8qIGV4Y2VwdCBpZiBET00gZ290IHJlYWR5IGluIHRoZSBtZWFudGltZSAqL1xuICAgICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIikge1xuICAgICAgICAvKiB1bmRvIGFsbCB0aGF0IGF0dGFjaGluZyAqL1xuICAgICAgICBoYW5kbGVyKCk7XG4gICAgICAgIC8qIGdvdG8gZmluaXNoICovXG4gICAgICAgIHNlbGYub25ET01yZWFkeSA9IGRlZmVyRE9NX3JlYWR5O1xuICAgICAgICByZXR1cm4gKGRlZmVyRE9NX3JlYWR5KGNiKSk7XG4gICAgICB9XG4gICAgICAvKiBqdXN0IGVucXVldWUgdGhhdCAqL1xuICAgICAgcmV0dXJuIChlbnFmbihjYikpO1xuICAgIH07XG4gIH1cbn1cbiJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxZQUFZOztBQUFDO0VBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFFYjtBQUFvRDtBQUFBO0FBRXBEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTyxTQUFTQSxJQUFJLENBQUNDLENBQUMsRUFBRTtFQUN0QixPQUFRQSxDQUFDLEtBQUssSUFBSSxHQUFHLE1BQU0sR0FBRyxPQUFPQSxDQUFFO0FBQ3pDO0FBRU8s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