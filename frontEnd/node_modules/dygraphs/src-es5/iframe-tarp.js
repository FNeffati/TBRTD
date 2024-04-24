"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var utils = _interopRequireWildcard(require("./dygraph-utils"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * To create a "drag" interaction, you typically register a mousedown event
 * handler on the element where the drag begins. In that handler, you register a
 * mouseup handler on the window to determine when the mouse is released,
 * wherever that release happens. This works well, except when the user releases
 * the mouse over an off-domain iframe. In that case, the mouseup event is
 * handled by the iframe and never bubbles up to the window handler.
 *
 * To deal with this issue, we cover iframes with high z-index divs to make sure
 * they don't capture mouseup.
 *
 * Usage:
 * element.addEventListener('mousedown', function() {
 *   var tarper = new IFrameTarp();
 *   tarper.cover();
 *   var mouseUpHandler = function() {
 *     ...
 *     window.removeEventListener(mouseUpHandler);
 *     tarper.uncover();
 *   };
 *   window.addEventListener('mouseup', mouseUpHandler);
 * });
 *
 * @constructor
 */

function IFrameTarp() {
  /** @type {Array.<!HTMLDivElement>} */
  this.tarps = [];
}

/**
 * Find all the iframes in the document and cover them with high z-index
 * transparent divs.
 */
IFrameTarp.prototype.cover = function () {
  var iframes = document.getElementsByTagName("iframe");
  for (var i = 0; i < iframes.length; i++) {
    var iframe = iframes[i];
    var pos = utils.findPos(iframe),
      x = pos.x,
      y = pos.y,
      width = iframe.offsetWidth,
      height = iframe.offsetHeight;
    var div = document.createElement("div");
    div.style.position = "absolute";
    div.style.left = x + 'px';
    div.style.top = y + 'px';
    div.style.width = width + 'px';
    div.style.height = height + 'px';
    div.style.zIndex = 999;
    document.body.appendChild(div);
    this.tarps.push(div);
  }
};

/**
 * Remove all the iframe covers. You should call this in a mouseup handler.
 */
IFrameTarp.prototype.uncover = function () {
  for (var i = 0; i < this.tarps.length; i++) {
    this.tarps[i].parentNode.removeChild(this.tarps[i]);
  }
  this.tarps = [];
};
var _default = IFrameTarp;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJRnJhbWVUYXJwIiwidGFycHMiLCJwcm90b3R5cGUiLCJjb3ZlciIsImlmcmFtZXMiLCJkb2N1bWVudCIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwiaSIsImxlbmd0aCIsImlmcmFtZSIsInBvcyIsInV0aWxzIiwiZmluZFBvcyIsIngiLCJ5Iiwid2lkdGgiLCJvZmZzZXRXaWR0aCIsImhlaWdodCIsIm9mZnNldEhlaWdodCIsImRpdiIsImNyZWF0ZUVsZW1lbnQiLCJzdHlsZSIsInBvc2l0aW9uIiwibGVmdCIsInRvcCIsInpJbmRleCIsImJvZHkiLCJhcHBlbmRDaGlsZCIsInB1c2giLCJ1bmNvdmVyIiwicGFyZW50Tm9kZSIsInJlbW92ZUNoaWxkIl0sInNvdXJjZXMiOlsiLi4vc3JjL2lmcmFtZS10YXJwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVG8gY3JlYXRlIGEgXCJkcmFnXCIgaW50ZXJhY3Rpb24sIHlvdSB0eXBpY2FsbHkgcmVnaXN0ZXIgYSBtb3VzZWRvd24gZXZlbnRcbiAqIGhhbmRsZXIgb24gdGhlIGVsZW1lbnQgd2hlcmUgdGhlIGRyYWcgYmVnaW5zLiBJbiB0aGF0IGhhbmRsZXIsIHlvdSByZWdpc3RlciBhXG4gKiBtb3VzZXVwIGhhbmRsZXIgb24gdGhlIHdpbmRvdyB0byBkZXRlcm1pbmUgd2hlbiB0aGUgbW91c2UgaXMgcmVsZWFzZWQsXG4gKiB3aGVyZXZlciB0aGF0IHJlbGVhc2UgaGFwcGVucy4gVGhpcyB3b3JrcyB3ZWxsLCBleGNlcHQgd2hlbiB0aGUgdXNlciByZWxlYXNlc1xuICogdGhlIG1vdXNlIG92ZXIgYW4gb2ZmLWRvbWFpbiBpZnJhbWUuIEluIHRoYXQgY2FzZSwgdGhlIG1vdXNldXAgZXZlbnQgaXNcbiAqIGhhbmRsZWQgYnkgdGhlIGlmcmFtZSBhbmQgbmV2ZXIgYnViYmxlcyB1cCB0byB0aGUgd2luZG93IGhhbmRsZXIuXG4gKlxuICogVG8gZGVhbCB3aXRoIHRoaXMgaXNzdWUsIHdlIGNvdmVyIGlmcmFtZXMgd2l0aCBoaWdoIHotaW5kZXggZGl2cyB0byBtYWtlIHN1cmVcbiAqIHRoZXkgZG9uJ3QgY2FwdHVyZSBtb3VzZXVwLlxuICpcbiAqIFVzYWdlOlxuICogZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbigpIHtcbiAqICAgdmFyIHRhcnBlciA9IG5ldyBJRnJhbWVUYXJwKCk7XG4gKiAgIHRhcnBlci5jb3ZlcigpO1xuICogICB2YXIgbW91c2VVcEhhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAqICAgICAuLi5cbiAqICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihtb3VzZVVwSGFuZGxlcik7XG4gKiAgICAgdGFycGVyLnVuY292ZXIoKTtcbiAqICAgfTtcbiAqICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBtb3VzZVVwSGFuZGxlcik7XG4gKiB9KTtcbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi9keWdyYXBoLXV0aWxzJztcblxuZnVuY3Rpb24gSUZyYW1lVGFycCgpIHtcbiAgLyoqIEB0eXBlIHtBcnJheS48IUhUTUxEaXZFbGVtZW50Pn0gKi9cbiAgdGhpcy50YXJwcyA9IFtdO1xufVxuXG4vKipcbiAqIEZpbmQgYWxsIHRoZSBpZnJhbWVzIGluIHRoZSBkb2N1bWVudCBhbmQgY292ZXIgdGhlbSB3aXRoIGhpZ2ggei1pbmRleFxuICogdHJhbnNwYXJlbnQgZGl2cy5cbiAqL1xuSUZyYW1lVGFycC5wcm90b3R5cGUuY292ZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGlmcmFtZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImlmcmFtZVwiKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBpZnJhbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGlmcmFtZSA9IGlmcmFtZXNbaV07XG4gICAgdmFyIHBvcyA9IHV0aWxzLmZpbmRQb3MoaWZyYW1lKSxcbiAgICAgICAgeCA9IHBvcy54LFxuICAgICAgICB5ID0gcG9zLnksXG4gICAgICAgIHdpZHRoID0gaWZyYW1lLm9mZnNldFdpZHRoLFxuICAgICAgICBoZWlnaHQgPSBpZnJhbWUub2Zmc2V0SGVpZ2h0O1xuXG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgZGl2LnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuICAgIGRpdi5zdHlsZS5sZWZ0ID0geCArICdweCc7XG4gICAgZGl2LnN0eWxlLnRvcCA9IHkgKyAncHgnO1xuICAgIGRpdi5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4JztcbiAgICBkaXYuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgJ3B4JztcbiAgICBkaXYuc3R5bGUuekluZGV4ID0gOTk5O1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICB0aGlzLnRhcnBzLnB1c2goZGl2KTtcbiAgfVxufTtcblxuLyoqXG4gKiBSZW1vdmUgYWxsIHRoZSBpZnJhbWUgY292ZXJzLiBZb3Ugc2hvdWxkIGNhbGwgdGhpcyBpbiBhIG1vdXNldXAgaGFuZGxlci5cbiAqL1xuSUZyYW1lVGFycC5wcm90b3R5cGUudW5jb3ZlciA9IGZ1bmN0aW9uKCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudGFycHMubGVuZ3RoOyBpKyspIHtcbiAgICB0aGlzLnRhcnBzW2ldLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy50YXJwc1tpXSk7XG4gIH1cbiAgdGhpcy50YXJwcyA9IFtdO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgSUZyYW1lVGFycDtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBeUJBO0FBQXlDO0FBQUE7QUF6QnpDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLFNBQVNBLFVBQVUsR0FBRztFQUNwQjtFQUNBLElBQUksQ0FBQ0MsS0FBSyxHQUFHLEVBQUU7QUFDakI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQUQsVUFBVSxDQUFDRSxTQUFTLENBQUNDLEtBQUssR0FBRyxZQUFXO0VBQ3RDLElBQUlDLE9BQU8sR0FBR0MsUUFBUSxDQUFDQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUM7RUFDckQsS0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdILE9BQU8sQ0FBQ0ksTUFBTSxFQUFFRCxDQUFDLEVBQUUsRUFBRTtJQUN2QyxJQUFJRSxNQUFNLEdBQUdMLE9BQU8sQ0FBQ0csQ0FBQyxDQUFDO0lBQ3ZCLElBQUlHLEdBQUcsR0FBR0MsS0FBSyxDQUFDQyxPQUFPLENBQUNILE1BQU0sQ0FBQztNQUMzQkksQ0FBQyxHQUFHSCxHQUFHLENBQUNHLENBQUM7TUFDVEMsQ0FBQyxHQUFHSixHQUFHLENBQUNJLENBQUM7TUFDVEMsS0FBSyxHQUFHTixNQUFNLENBQUNPLFdBQVc7TUFDMUJDLE1BQU0sR0FBR1IsTUFBTSxDQUFDUyxZQUFZO0lBRWhDLElBQUlDLEdBQUcsR0FBR2QsUUFBUSxDQUFDZSxhQUFhLENBQUMsS0FBSyxDQUFDO0lBQ3ZDRCxHQUFHLENBQUNFLEtBQUssQ0FBQ0MsUUFBUSxHQUFHLFVBQVU7SUFDL0JILEdBQUcsQ0FBQ0UsS0FBSyxDQUFDRSxJQUFJLEdBQUdWLENBQUMsR0FBRyxJQUFJO0lBQ3pCTSxHQUFHLENBQUNFLEtBQUssQ0FBQ0csR0FBRyxHQUFHVixDQUFDLEdBQUcsSUFBSTtJQUN4QkssR0FBRyxDQUFDRSxLQUFLLENBQUNOLEtBQUssR0FBR0EsS0FBSyxHQUFHLElBQUk7SUFDOUJJLEdBQUcsQ0FBQ0UsS0FBSyxDQUFDSixNQUFNLEdBQUdBLE1BQU0sR0FBRyxJQUFJO0lBQ2hDRSxHQUFHLENBQUNFLEtBQUssQ0FBQ0ksTUFBTSxHQUFHLEdBQUc7SUFDdEJwQixRQUFRLENBQUNxQixJQUFJLENBQUNDLFdBQVcsQ0FBQ1IsR0FBRyxDQUFDO0lBQzlCLElBQUksQ0FBQ2xCLEtBQUssQ0FBQzJCLElBQUksQ0FBQ1QsR0FBRyxDQUFDO0VBQ3RCO0FBQ0YsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQW5CLFVBQVUsQ0FBQ0UsU0FBUyxDQUFDMkIsT0FBTyxHQUFHLFlBQVc7RUFDeEMsS0FBSyxJQUFJdEIsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ04sS0FBSyxDQUFDTyxNQUFNLEVBQUVELENBQUMsRUFBRSxFQUFFO0lBQzFDLElBQUksQ0FBQ04sS0FBSyxDQUFDTSxDQUFDLENBQUMsQ0FBQ3VCLFVBQVUsQ0FBQ0MsV0FBVyxDQUFDLElBQUksQ0FBQzlCLEtBQUssQ0FBQ00sQ0FBQyxDQUFDLENBQUM7RUFDckQ7RUFDQSxJQUFJLENBQUNOLEtBQUssR0FBRyxFQUFFO0FBQ2pCLENBQUM7QUFBQyxlQUVhRCxVQUFVO0FBQUE7QUFBQSJ9