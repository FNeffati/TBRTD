"use strict";

// This file:
// - declares symbols that are provided outisde of dygraphs
// - defines custom types used internally

/**
 * @typedef {function(
 *   (number|Date),
 *   number,
 *   function(string):*,
 *   (Dygraph|undefined)
 * ):string}
 */
var AxisLabelFormatter;

/**
 * @typedef {function(number,function(string),Dygraph):string}
 */
var ValueFormatter;

/**
 * @typedef {Array.<Array.<string|number|Array.<number>>>}
 */
var DygraphDataArray;

/**
 * @constructor
 */
function GVizDataTable() {}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBeGlzTGFiZWxGb3JtYXR0ZXIiLCJWYWx1ZUZvcm1hdHRlciIsIkR5Z3JhcGhEYXRhQXJyYXkiLCJHVml6RGF0YVRhYmxlIl0sInNvdXJjZXMiOlsiLi4vc3JjL2R5Z3JhcGgtaW50ZXJuYWwuZXh0ZXJucy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGlzIGZpbGU6XG4vLyAtIGRlY2xhcmVzIHN5bWJvbHMgdGhhdCBhcmUgcHJvdmlkZWQgb3V0aXNkZSBvZiBkeWdyYXBoc1xuLy8gLSBkZWZpbmVzIGN1c3RvbSB0eXBlcyB1c2VkIGludGVybmFsbHlcblxuLyoqXG4gKiBAdHlwZWRlZiB7ZnVuY3Rpb24oXG4gKiAgIChudW1iZXJ8RGF0ZSksXG4gKiAgIG51bWJlcixcbiAqICAgZnVuY3Rpb24oc3RyaW5nKToqLFxuICogICAoRHlncmFwaHx1bmRlZmluZWQpXG4gKiApOnN0cmluZ31cbiAqL1xudmFyIEF4aXNMYWJlbEZvcm1hdHRlcjtcblxuLyoqXG4gKiBAdHlwZWRlZiB7ZnVuY3Rpb24obnVtYmVyLGZ1bmN0aW9uKHN0cmluZyksRHlncmFwaCk6c3RyaW5nfVxuICovXG52YXIgVmFsdWVGb3JtYXR0ZXI7XG5cbi8qKlxuICogQHR5cGVkZWYge0FycmF5LjxBcnJheS48c3RyaW5nfG51bWJlcnxBcnJheS48bnVtYmVyPj4+fVxuICovXG52YXIgRHlncmFwaERhdGFBcnJheTtcblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gR1ZpekRhdGFUYWJsZSgpIHt9XG4iXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJQSxrQkFBa0I7O0FBRXRCO0FBQ0E7QUFDQTtBQUNBLElBQUlDLGNBQWM7O0FBRWxCO0FBQ0E7QUFDQTtBQUNBLElBQUlDLGdCQUFnQjs7QUFFcEI7QUFDQTtBQUNBO0FBQ0EsU0FBU0MsYUFBYSxHQUFHLENBQUMifQ==