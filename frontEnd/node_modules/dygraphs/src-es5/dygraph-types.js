"use strict";

/**
 * @license
 * Copyright 2006 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licenced: https://opensource.org/licenses/MIT
 */

// This file contains typedefs and externs that are needed by the Closure Compiler.

/**
 * @typedef {{
 *   px: number,
 *   py: number,
 *   isZooming: boolean,
 *   isPanning: boolean,
 *   is2DPan: boolean,
 *   cancelNextDblclick: boolean,
 *   initializeMouseDown:
 *       function(!Event, !Dygraph, !DygraphInteractionContext)
 * }}
 */
var DygraphInteractionContext;

/**
 * Point structure.
 *
 * xval_* and yval_* are the original unscaled data values,
 * while x_* and y_* are scaled to the range (0.0-1.0) for plotting.
 * yval_stacked is the cumulative Y value used for stacking graphs,
 * and bottom/top/minus/plus are used for error bar graphs.
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
Dygraph.PointType;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEeWdyYXBoSW50ZXJhY3Rpb25Db250ZXh0IiwiRHlncmFwaCIsIlBvaW50VHlwZSJdLCJzb3VyY2VzIjpbIi4uL3NyYy9keWdyYXBoLXR5cGVzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAyMDA2IERhbiBWYW5kZXJrYW0gKGRhbnZka0BnbWFpbC5jb20pXG4gKiBNSVQtbGljZW5jZWQ6IGh0dHBzOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXG4gKi9cblxuLy8gVGhpcyBmaWxlIGNvbnRhaW5zIHR5cGVkZWZzIGFuZCBleHRlcm5zIHRoYXQgYXJlIG5lZWRlZCBieSB0aGUgQ2xvc3VyZSBDb21waWxlci5cblxuLyoqXG4gKiBAdHlwZWRlZiB7e1xuICogICBweDogbnVtYmVyLFxuICogICBweTogbnVtYmVyLFxuICogICBpc1pvb21pbmc6IGJvb2xlYW4sXG4gKiAgIGlzUGFubmluZzogYm9vbGVhbixcbiAqICAgaXMyRFBhbjogYm9vbGVhbixcbiAqICAgY2FuY2VsTmV4dERibGNsaWNrOiBib29sZWFuLFxuICogICBpbml0aWFsaXplTW91c2VEb3duOlxuICogICAgICAgZnVuY3Rpb24oIUV2ZW50LCAhRHlncmFwaCwgIUR5Z3JhcGhJbnRlcmFjdGlvbkNvbnRleHQpXG4gKiB9fVxuICovXG52YXIgRHlncmFwaEludGVyYWN0aW9uQ29udGV4dDtcblxuLyoqXG4gKiBQb2ludCBzdHJ1Y3R1cmUuXG4gKlxuICogeHZhbF8qIGFuZCB5dmFsXyogYXJlIHRoZSBvcmlnaW5hbCB1bnNjYWxlZCBkYXRhIHZhbHVlcyxcbiAqIHdoaWxlIHhfKiBhbmQgeV8qIGFyZSBzY2FsZWQgdG8gdGhlIHJhbmdlICgwLjAtMS4wKSBmb3IgcGxvdHRpbmcuXG4gKiB5dmFsX3N0YWNrZWQgaXMgdGhlIGN1bXVsYXRpdmUgWSB2YWx1ZSB1c2VkIGZvciBzdGFja2luZyBncmFwaHMsXG4gKiBhbmQgYm90dG9tL3RvcC9taW51cy9wbHVzIGFyZSB1c2VkIGZvciBlcnJvciBiYXIgZ3JhcGhzLlxuICpcbiAqIEB0eXBlZGVmIHt7XG4gKiAgICAgaWR4OiBudW1iZXIsXG4gKiAgICAgbmFtZTogc3RyaW5nLFxuICogICAgIHg6ID9udW1iZXIsXG4gKiAgICAgeHZhbDogP251bWJlcixcbiAqICAgICB5X2JvdHRvbTogP251bWJlcixcbiAqICAgICB5OiA/bnVtYmVyLFxuICogICAgIHlfc3RhY2tlZDogP251bWJlcixcbiAqICAgICB5X3RvcDogP251bWJlcixcbiAqICAgICB5dmFsX21pbnVzOiA/bnVtYmVyLFxuICogICAgIHl2YWw6ID9udW1iZXIsXG4gKiAgICAgeXZhbF9wbHVzOiA/bnVtYmVyLFxuICogICAgIHl2YWxfc3RhY2tlZFxuICogfX1cbiAqL1xuRHlncmFwaC5Qb2ludFR5cGU7XG4iXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJQSx5QkFBeUI7O0FBRTdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQUMsT0FBTyxDQUFDQyxTQUFTIn0=