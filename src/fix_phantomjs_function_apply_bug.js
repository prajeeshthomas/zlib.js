goog.provide('FixPhantomJSFunctionApplyBug_StringFromCharCode');

if (window.Uint8Array !== void 0) {
  try {
    // anti-optimization
    String.fromCharCode.apply(null, new Uint8Array([0]));
    /*
    if (String.fromCharCode.apply(null, new Uint8Array([0])) === null) {
      String.fromCharCode.apply = String.fromCharCode.apply;
    }
    */
  } catch(e) {
    String.fromCharCode.apply = (function(fromCharCodeApply) {
      return function(thisobj, args) {
        return fromCharCodeApply.call(String.fromCharCode, thisobj, Array.prototype.slice.call(args));
      }
    })(String.fromCharCode.apply);
  }
}