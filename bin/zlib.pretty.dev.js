/** @license zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */(function() {'use strict';var COMPILED = false;
var goog = goog || {};
goog.global = this;
goog.DEBUG = true;
goog.LOCALE = "en";
goog.provide = function(name) {
  if(!COMPILED) {
    if(goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    delete goog.implicitNamespaces_[name];
    var namespace = name;
    while(namespace = namespace.substring(0, namespace.lastIndexOf("."))) {
      if(goog.getObjectByName(namespace)) {
        break
      }
      goog.implicitNamespaces_[namespace] = true
    }
  }
  goog.exportPath_(name)
};
goog.setTestOnly = function(opt_message) {
  if(COMPILED && !goog.DEBUG) {
    opt_message = opt_message || "";
    throw Error("Importing test-only code into non-debug environment" + opt_message ? ": " + opt_message : ".");
  }
};
if(!COMPILED) {
  goog.isProvided_ = function(name) {
    return!goog.implicitNamespaces_[name] && !!goog.getObjectByName(name)
  };
  goog.implicitNamespaces_ = {}
}
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split(".");
  var cur = opt_objectToExportTo || goog.global;
  if(!(parts[0] in cur) && cur.execScript) {
    cur.execScript("var " + parts[0])
  }
  for(var part;parts.length && (part = parts.shift());) {
    if(!parts.length && goog.isDef(opt_object)) {
      cur[part] = opt_object
    }else {
      if(cur[part]) {
        cur = cur[part]
      }else {
        cur = cur[part] = {}
      }
    }
  }
};
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split(".");
  var cur = opt_obj || goog.global;
  for(var part;part = parts.shift();) {
    if(goog.isDefAndNotNull(cur[part])) {
      cur = cur[part]
    }else {
      return null
    }
  }
  return cur
};
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for(var x in obj) {
    global[x] = obj[x]
  }
};
goog.addDependency = function(relPath, provides, requires) {
  if(!COMPILED) {
    var provide, require;
    var path = relPath.replace(/\\/g, "/");
    var deps = goog.dependencies_;
    for(var i = 0;provide = provides[i];i++) {
      deps.nameToPath[provide] = path;
      if(!(path in deps.pathToNames)) {
        deps.pathToNames[path] = {}
      }
      deps.pathToNames[path][provide] = true
    }
    for(var j = 0;require = requires[j];j++) {
      if(!(path in deps.requires)) {
        deps.requires[path] = {}
      }
      deps.requires[path][require] = true
    }
  }
};
goog.ENABLE_DEBUG_LOADER = true;
goog.require = function(name) {
  if(!COMPILED) {
    if(goog.isProvided_(name)) {
      return
    }
    if(goog.ENABLE_DEBUG_LOADER) {
      var path = goog.getPathFromDeps_(name);
      if(path) {
        goog.included_[path] = true;
        goog.writeScripts_();
        return
      }
    }
    var errorMessage = "goog.require could not find: " + name;
    if(goog.global.console) {
      goog.global.console["error"](errorMessage)
    }
    throw Error(errorMessage);
  }
};
goog.basePath = "";
goog.global.CLOSURE_BASE_PATH;
goog.global.CLOSURE_NO_DEPS;
goog.global.CLOSURE_IMPORT_SCRIPT;
goog.nullFunction = function() {
};
goog.identityFunction = function(opt_returnValue, var_args) {
  return opt_returnValue
};
goog.abstractMethod = function() {
  throw Error("unimplemented abstract method");
};
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    if(ctor.instance_) {
      return ctor.instance_
    }
    if(goog.DEBUG) {
      goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor
    }
    return ctor.instance_ = new ctor
  }
};
goog.instantiatedSingletons_ = [];
if(!COMPILED && goog.ENABLE_DEBUG_LOADER) {
  goog.included_ = {};
  goog.dependencies_ = {pathToNames:{}, nameToPath:{}, requires:{}, visited:{}, written:{}};
  goog.inHtmlDocument_ = function() {
    var doc = goog.global.document;
    return typeof doc != "undefined" && "write" in doc
  };
  goog.findBasePath_ = function() {
    if(goog.global.CLOSURE_BASE_PATH) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return
    }else {
      if(!goog.inHtmlDocument_()) {
        return
      }
    }
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName("script");
    for(var i = scripts.length - 1;i >= 0;--i) {
      var src = scripts[i].src;
      var qmark = src.lastIndexOf("?");
      var l = qmark == -1 ? src.length : qmark;
      if(src.substr(l - 7, 7) == "base.js") {
        goog.basePath = src.substr(0, l - 7);
        return
      }
    }
  };
  goog.importScript_ = function(src) {
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_;
    if(!goog.dependencies_.written[src] && importScript(src)) {
      goog.dependencies_.written[src] = true
    }
  };
  goog.writeScriptTag_ = function(src) {
    if(goog.inHtmlDocument_()) {
      var doc = goog.global.document;
      doc.write('<script type="text/javascript" src="' + src + '"></' + "script>");
      return true
    }else {
      return false
    }
  };
  goog.writeScripts_ = function() {
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;
    function visitNode(path) {
      if(path in deps.written) {
        return
      }
      if(path in deps.visited) {
        if(!(path in seenScript)) {
          seenScript[path] = true;
          scripts.push(path)
        }
        return
      }
      deps.visited[path] = true;
      if(path in deps.requires) {
        for(var requireName in deps.requires[path]) {
          if(!goog.isProvided_(requireName)) {
            if(requireName in deps.nameToPath) {
              visitNode(deps.nameToPath[requireName])
            }else {
              throw Error("Undefined nameToPath for " + requireName);
            }
          }
        }
      }
      if(!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path)
      }
    }
    for(var path in goog.included_) {
      if(!deps.written[path]) {
        visitNode(path)
      }
    }
    for(var i = 0;i < scripts.length;i++) {
      if(scripts[i]) {
        goog.importScript_(goog.basePath + scripts[i])
      }else {
        throw Error("Undefined script input");
      }
    }
  };
  goog.getPathFromDeps_ = function(rule) {
    if(rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule]
    }else {
      return null
    }
  };
  goog.findBasePath_();
  if(!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + "deps.js")
  }
}
goog.typeOf = function(value) {
  var s = typeof value;
  if(s == "object") {
    if(value) {
      if(value instanceof Array) {
        return"array"
      }else {
        if(value instanceof Object) {
          return s
        }
      }
      var className = Object.prototype.toString.call((value));
      if(className == "[object Window]") {
        return"object"
      }
      if(className == "[object Array]" || typeof value.length == "number" && typeof value.splice != "undefined" && typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("splice")) {
        return"array"
      }
      if(className == "[object Function]" || typeof value.call != "undefined" && typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("call")) {
        return"function"
      }
    }else {
      return"null"
    }
  }else {
    if(s == "function" && typeof value.call == "undefined") {
      return"object"
    }
  }
  return s
};
goog.isDef = function(val) {
  return val !== undefined
};
goog.isNull = function(val) {
  return val === null
};
goog.isDefAndNotNull = function(val) {
  return val != null
};
goog.isArray = function(val) {
  return goog.typeOf(val) == "array"
};
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type == "array" || type == "object" && typeof val.length == "number"
};
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == "function"
};
goog.isString = function(val) {
  return typeof val == "string"
};
goog.isBoolean = function(val) {
  return typeof val == "boolean"
};
goog.isNumber = function(val) {
  return typeof val == "number"
};
goog.isFunction = function(val) {
  return goog.typeOf(val) == "function"
};
goog.isObject = function(val) {
  var type = typeof val;
  return type == "object" && val != null || type == "function"
};
goog.getUid = function(obj) {
  return obj[goog.UID_PROPERTY_] || (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_)
};
goog.removeUid = function(obj) {
  if("removeAttribute" in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_)
  }
  try {
    delete obj[goog.UID_PROPERTY_]
  }catch(ex) {
  }
};
goog.UID_PROPERTY_ = "closure_uid_" + Math.floor(Math.random() * 2147483648).toString(36);
goog.uidCounter_ = 0;
goog.getHashCode = goog.getUid;
goog.removeHashCode = goog.removeUid;
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if(type == "object" || type == "array") {
    if(obj.clone) {
      return obj.clone()
    }
    var clone = type == "array" ? [] : {};
    for(var key in obj) {
      clone[key] = goog.cloneObject(obj[key])
    }
    return clone
  }
  return obj
};
Object.prototype.clone;
goog.bindNative_ = function(fn, selfObj, var_args) {
  return(fn.call.apply(fn.bind, arguments))
};
goog.bindJs_ = function(fn, selfObj, var_args) {
  if(!fn) {
    throw new Error;
  }
  if(arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs)
    }
  }else {
    return function() {
      return fn.apply(selfObj, arguments)
    }
  }
};
goog.bind = function(fn, selfObj, var_args) {
  if(Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1) {
    goog.bind = goog.bindNative_
  }else {
    goog.bind = goog.bindJs_
  }
  return goog.bind.apply(null, arguments)
};
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return fn.apply(this, newArgs)
  }
};
goog.mixin = function(target, source) {
  for(var x in source) {
    target[x] = source[x]
  }
};
goog.now = Date.now || function() {
  return+new Date
};
goog.globalEval = function(script) {
  if(goog.global.execScript) {
    goog.global.execScript(script, "JavaScript")
  }else {
    if(goog.global.eval) {
      if(goog.evalWorksForGlobals_ == null) {
        goog.global.eval("var _et_ = 1;");
        if(typeof goog.global["_et_"] != "undefined") {
          delete goog.global["_et_"];
          goog.evalWorksForGlobals_ = true
        }else {
          goog.evalWorksForGlobals_ = false
        }
      }
      if(goog.evalWorksForGlobals_) {
        goog.global.eval(script)
      }else {
        var doc = goog.global.document;
        var scriptElt = doc.createElement("script");
        scriptElt.type = "text/javascript";
        scriptElt.defer = false;
        scriptElt.appendChild(doc.createTextNode(script));
        doc.body.appendChild(scriptElt);
        doc.body.removeChild(scriptElt)
      }
    }else {
      throw Error("goog.globalEval not available");
    }
  }
};
goog.evalWorksForGlobals_ = null;
goog.cssNameMapping_;
goog.cssNameMappingStyle_;
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName
  };
  var renameByParts = function(cssName) {
    var parts = cssName.split("-");
    var mapped = [];
    for(var i = 0;i < parts.length;i++) {
      mapped.push(getMapping(parts[i]))
    }
    return mapped.join("-")
  };
  var rename;
  if(goog.cssNameMapping_) {
    rename = goog.cssNameMappingStyle_ == "BY_WHOLE" ? getMapping : renameByParts
  }else {
    rename = function(a) {
      return a
    }
  }
  if(opt_modifier) {
    return className + "-" + rename(opt_modifier)
  }else {
    return rename(className)
  }
};
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style
};
goog.global.CLOSURE_CSS_NAME_MAPPING;
if(!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
  goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING
}
goog.getMsg = function(str, opt_values) {
  var values = opt_values || {};
  for(var key in values) {
    var value = ("" + values[key]).replace(/\$/g, "$$$$");
    str = str.replace(new RegExp("\\{\\$" + key + "\\}", "gi"), value)
  }
  return str
};
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo)
};
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol
};
goog.inherits = function(childCtor, parentCtor) {
  function tempCtor() {
  }
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor;
  childCtor.prototype.constructor = childCtor
};
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if(caller.superClass_) {
    return caller.superClass_.constructor.apply(me, Array.prototype.slice.call(arguments, 1))
  }
  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for(var ctor = me.constructor;ctor;ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if(ctor.prototype[opt_methodName] === caller) {
      foundCaller = true
    }else {
      if(foundCaller) {
        return ctor.prototype[opt_methodName].apply(me, args)
      }
    }
  }
  if(me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args)
  }else {
    throw Error("goog.base called from a method of one name " + "to a method of a different name");
  }
};
goog.scope = function(fn) {
  fn.call(goog.global)
};
goog.provide("USE_TYPEDARRAY");
var USE_TYPEDARRAY = typeof Uint8Array !== "undefined" && typeof Uint16Array !== "undefined" && typeof Uint32Array !== "undefined" && typeof DataView !== "undefined";
goog.provide("Zlib.BitStream");
goog.require("USE_TYPEDARRAY");
goog.scope(function() {
  Zlib.BitStream = function(buffer, bufferPosition) {
    this.index = typeof bufferPosition === "number" ? bufferPosition : 0;
    this.bitindex = 0;
    this.buffer = buffer instanceof (USE_TYPEDARRAY ? Uint8Array : Array) ? buffer : new (USE_TYPEDARRAY ? Uint8Array : Array)(Zlib.BitStream.DefaultBlockSize);
    if(this.buffer.length * 2 <= this.index) {
      throw new Error("invalid index");
    }else {
      if(this.buffer.length <= this.index) {
        this.expandBuffer()
      }
    }
  };
  Zlib.BitStream.DefaultBlockSize = 32768;
  Zlib.BitStream.prototype.expandBuffer = function() {
    var oldbuf = this.buffer;
    var i;
    var il = oldbuf.length;
    var buffer = new (USE_TYPEDARRAY ? Uint8Array : Array)(il << 1);
    if(USE_TYPEDARRAY) {
      buffer.set(oldbuf)
    }else {
      for(i = 0;i < il;++i) {
        buffer[i] = oldbuf[i]
      }
    }
    return this.buffer = buffer
  };
  Zlib.BitStream.prototype.writeBits = function(number, n, reverse) {
    var buffer = this.buffer;
    var index = this.index;
    var bitindex = this.bitindex;
    var current = buffer[index];
    var i;
    function rev32_(n) {
      return Zlib.BitStream.ReverseTable[n & 255] << 24 | Zlib.BitStream.ReverseTable[n >>> 8 & 255] << 16 | Zlib.BitStream.ReverseTable[n >>> 16 & 255] << 8 | Zlib.BitStream.ReverseTable[n >>> 24 & 255]
    }
    if(reverse && n > 1) {
      number = n > 8 ? rev32_(number) >> 32 - n : Zlib.BitStream.ReverseTable[number] >> 8 - n
    }
    if(n + bitindex < 8) {
      current = current << n | number;
      bitindex += n
    }else {
      for(i = 0;i < n;++i) {
        current = current << 1 | number >> n - i - 1 & 1;
        if(++bitindex === 8) {
          bitindex = 0;
          buffer[index++] = Zlib.BitStream.ReverseTable[current];
          current = 0;
          if(index === buffer.length) {
            buffer = this.expandBuffer()
          }
        }
      }
    }
    buffer[index] = current;
    this.buffer = buffer;
    this.bitindex = bitindex;
    this.index = index
  };
  Zlib.BitStream.prototype.finish = function() {
    var buffer = this.buffer;
    var index = this.index;
    var output;
    if(this.bitindex > 0) {
      buffer[index] <<= 8 - this.bitindex;
      buffer[index] = Zlib.BitStream.ReverseTable[buffer[index]];
      index++
    }
    if(USE_TYPEDARRAY) {
      output = buffer.subarray(0, index)
    }else {
      buffer.length = index;
      output = buffer
    }
    return output
  };
  Zlib.BitStream.ReverseTable = function(table) {
    return table
  }(function() {
    var table = new (USE_TYPEDARRAY ? Uint8Array : Array)(256);
    var i;
    for(i = 0;i < 256;++i) {
      table[i] = function(n) {
        var r = n;
        var s = 7;
        for(n >>>= 1;n;n >>>= 1) {
          r <<= 1;
          r |= n & 1;
          --s
        }
        return(r << s & 255) >>> 0
      }(i)
    }
    return table
  }())
});
goog.provide("Zlib.CRC32");
goog.require("USE_TYPEDARRAY");
var ZLIB_CRC32_COMPACT = false;
goog.scope(function() {
  Zlib.CRC32.calc = function(data, pos, length) {
    return Zlib.CRC32.update(data, 0, pos, length)
  };
  Zlib.CRC32.update = function(data, crc, pos, length) {
    var table = Zlib.CRC32.Table;
    var i = typeof pos === "number" ? pos : pos = 0;
    var il = typeof length === "number" ? length : data.length;
    crc ^= 4294967295;
    for(i = il & 7;i--;++pos) {
      crc = crc >>> 8 ^ table[(crc ^ data[pos]) & 255]
    }
    for(i = il >> 3;i--;pos += 8) {
      crc = crc >>> 8 ^ table[(crc ^ data[pos]) & 255];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 1]) & 255];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 2]) & 255];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 3]) & 255];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 4]) & 255];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 5]) & 255];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 6]) & 255];
      crc = crc >>> 8 ^ table[(crc ^ data[pos + 7]) & 255]
    }
    return(crc ^ 4294967295) >>> 0
  };
  Zlib.CRC32.single = function(num, crc) {
    return(Zlib.CRC32.Table[(num ^ crc) & 255] ^ num >>> 8) >>> 0
  };
  Zlib.CRC32.Table_ = [0, 1996959894, 3993919788, 2567524794, 124634137, 1886057615, 3915621685, 2657392035, 249268274, 2044508324, 3772115230, 2547177864, 162941995, 2125561021, 3887607047, 2428444049, 498536548, 1789927666, 4089016648, 2227061214, 450548861, 1843258603, 4107580753, 2211677639, 325883990, 1684777152, 4251122042, 2321926636, 335633487, 1661365465, 4195302755, 2366115317, 997073096, 1281953886, 3579855332, 2724688242, 1006888145, 1258607687, 3524101629, 2768942443, 901097722, 1119000684, 
  3686517206, 2898065728, 853044451, 1172266101, 3705015759, 2882616665, 651767980, 1373503546, 3369554304, 3218104598, 565507253, 1454621731, 3485111705, 3099436303, 671266974, 1594198024, 3322730930, 2970347812, 795835527, 1483230225, 3244367275, 3060149565, 1994146192, 31158534, 2563907772, 4023717930, 1907459465, 112637215, 2680153253, 3904427059, 2013776290, 251722036, 2517215374, 3775830040, 2137656763, 141376813, 2439277719, 3865271297, 1802195444, 476864866, 2238001368, 4066508878, 1812370925, 
  453092731, 2181625025, 4111451223, 1706088902, 314042704, 2344532202, 4240017532, 1658658271, 366619977, 2362670323, 4224994405, 1303535960, 984961486, 2747007092, 3569037538, 1256170817, 1037604311, 2765210733, 3554079995, 1131014506, 879679996, 2909243462, 3663771856, 1141124467, 855842277, 2852801631, 3708648649, 1342533948, 654459306, 3188396048, 3373015174, 1466479909, 544179635, 3110523913, 3462522015, 1591671054, 702138776, 2966460450, 3352799412, 1504918807, 783551873, 3082640443, 3233442989, 
  3988292384, 2596254646, 62317068, 1957810842, 3939845945, 2647816111, 81470997, 1943803523, 3814918930, 2489596804, 225274430, 2053790376, 3826175755, 2466906013, 167816743, 2097651377, 4027552580, 2265490386, 503444072, 1762050814, 4150417245, 2154129355, 426522225, 1852507879, 4275313526, 2312317920, 282753626, 1742555852, 4189708143, 2394877945, 397917763, 1622183637, 3604390888, 2714866558, 953729732, 1340076626, 3518719985, 2797360999, 1068828381, 1219638859, 3624741850, 2936675148, 906185462, 
  1090812512, 3747672003, 2825379669, 829329135, 1181335161, 3412177804, 3160834842, 628085408, 1382605366, 3423369109, 3138078467, 570562233, 1426400815, 3317316542, 2998733608, 733239954, 1555261956, 3268935591, 3050360625, 752459403, 1541320221, 2607071920, 3965973030, 1969922972, 40735498, 2617837225, 3943577151, 1913087877, 83908371, 2512341634, 3803740692, 2075208622, 213261112, 2463272603, 3855990285, 2094854071, 198958881, 2262029012, 4057260610, 1759359992, 534414190, 2176718541, 4139329115, 
  1873836001, 414664567, 2282248934, 4279200368, 1711684554, 285281116, 2405801727, 4167216745, 1634467795, 376229701, 2685067896, 3608007406, 1308918612, 956543938, 2808555105, 3495958263, 1231636301, 1047427035, 2932959818, 3654703836, 1088359270, 936918E3, 2847714899, 3736837829, 1202900863, 817233897, 3183342108, 3401237130, 1404277552, 615818150, 3134207493, 3453421203, 1423857449, 601450431, 3009837614, 3294710456, 1567103746, 711928724, 3020668471, 3272380065, 1510334235, 755167117];
  Zlib.CRC32.Table = ZLIB_CRC32_COMPACT ? function() {
    var table = new (USE_TYPEDARRAY ? Uint32Array : Array)(256);
    var c;
    var i;
    var j;
    for(i = 0;i < 256;++i) {
      c = i;
      for(j = 0;j < 8;++j) {
        c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1
      }
      table[i] = c >>> 0
    }
    return table
  }() : USE_TYPEDARRAY ? new Uint32Array(Zlib.CRC32.Table_) : Zlib.CRC32.Table_
});
goog.provide("FixPhantomJSFunctionApplyBug_StringFromCharCode");
if(window.Uint8Array !== void 0) {
  try {
    String.fromCharCode.apply(null, new Uint8Array([0]))
  }catch(e) {
    String.fromCharCode.apply = function(fromCharCodeApply) {
      return function(thisobj, args) {
        return fromCharCodeApply.call(String.fromCharCode, thisobj, Array.prototype.slice.call(args))
      }
    }(String.fromCharCode.apply)
  }
}
;goog.provide("Zlib.GunzipMember");
goog.scope(function() {
  Zlib.GunzipMember = function() {
    this.id1;
    this.id2;
    this.cm;
    this.flg;
    this.mtime;
    this.xfl;
    this.os;
    this.crc16;
    this.xlen;
    this.crc32;
    this.isize;
    this.name;
    this.comment;
    this.data
  };
  Zlib.GunzipMember.prototype.getName = function() {
    return this.name
  };
  Zlib.GunzipMember.prototype.getData = function() {
    return this.data
  };
  Zlib.GunzipMember.prototype.getMtime = function() {
    return this.mtime
  }
});
goog.provide("Zlib.Heap");
goog.require("USE_TYPEDARRAY");
goog.scope(function() {
  Zlib.Heap = function(length) {
    this.buffer = new (USE_TYPEDARRAY ? Uint16Array : Array)(length * 2);
    this.length = 0
  };
  Zlib.Heap.prototype.getParent = function(index) {
    return((index - 2) / 4 | 0) * 2
  };
  Zlib.Heap.prototype.getChild = function(index) {
    return 2 * index + 2
  };
  Zlib.Heap.prototype.push = function(index, value) {
    var current, parent, heap = this.buffer, swap;
    current = this.length;
    heap[this.length++] = value;
    heap[this.length++] = index;
    while(current > 0) {
      parent = this.getParent(current);
      if(heap[current] > heap[parent]) {
        swap = heap[current];
        heap[current] = heap[parent];
        heap[parent] = swap;
        swap = heap[current + 1];
        heap[current + 1] = heap[parent + 1];
        heap[parent + 1] = swap;
        current = parent
      }else {
        break
      }
    }
    return this.length
  };
  Zlib.Heap.prototype.pop = function() {
    var index, value, heap = this.buffer, swap, current, parent;
    value = heap[0];
    index = heap[1];
    this.length -= 2;
    heap[0] = heap[this.length];
    heap[1] = heap[this.length + 1];
    parent = 0;
    while(true) {
      current = this.getChild(parent);
      if(current >= this.length) {
        break
      }
      if(current + 2 < this.length && heap[current + 2] > heap[current]) {
        current += 2
      }
      if(heap[current] > heap[parent]) {
        swap = heap[parent];
        heap[parent] = heap[current];
        heap[current] = swap;
        swap = heap[parent + 1];
        heap[parent + 1] = heap[current + 1];
        heap[current + 1] = swap
      }else {
        break
      }
      parent = current
    }
    return{index:index, value:value, length:this.length}
  }
});
goog.provide("Zlib.Huffman");
goog.require("USE_TYPEDARRAY");
goog.scope(function() {
  Zlib.Huffman.buildHuffmanTable = function(lengths) {
    var listSize = lengths.length;
    var maxCodeLength = 0;
    var minCodeLength = Number.POSITIVE_INFINITY;
    var size;
    var table;
    var bitLength;
    var code;
    var skip;
    var reversed;
    var rtemp;
    var i;
    var il;
    var j;
    var value;
    for(i = 0, il = listSize;i < il;++i) {
      if(lengths[i] > maxCodeLength) {
        maxCodeLength = lengths[i]
      }
      if(lengths[i] < minCodeLength) {
        minCodeLength = lengths[i]
      }
    }
    size = 1 << maxCodeLength;
    table = new (USE_TYPEDARRAY ? Uint32Array : Array)(size);
    for(bitLength = 1, code = 0, skip = 2;bitLength <= maxCodeLength;) {
      for(i = 0;i < listSize;++i) {
        if(lengths[i] === bitLength) {
          for(reversed = 0, rtemp = code, j = 0;j < bitLength;++j) {
            reversed = reversed << 1 | rtemp & 1;
            rtemp >>= 1
          }
          value = bitLength << 16 | i;
          for(j = reversed;j < size;j += skip) {
            table[j] = value
          }
          ++code
        }
      }
      ++bitLength;
      code <<= 1;
      skip <<= 1
    }
    return[table, maxCodeLength, minCodeLength]
  }
});
goog.provide("Zlib.RawDeflate");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib.BitStream");
goog.require("Zlib.Heap");
goog.scope(function() {
  Zlib.RawDeflate = function(input, opt_params) {
    this.compressionType = Zlib.RawDeflate.CompressionType.DYNAMIC;
    this.lazy = 0;
    this.freqsLitLen;
    this.freqsDist;
    this.input = USE_TYPEDARRAY && input instanceof Array ? new Uint8Array(input) : input;
    this.output;
    this.op = 0;
    if(opt_params) {
      if(opt_params["lazy"]) {
        this.lazy = opt_params["lazy"]
      }
      if(typeof opt_params["compressionType"] === "number") {
        this.compressionType = opt_params["compressionType"]
      }
      if(opt_params["outputBuffer"]) {
        this.output = USE_TYPEDARRAY && opt_params["outputBuffer"] instanceof Array ? new Uint8Array(opt_params["outputBuffer"]) : opt_params["outputBuffer"]
      }
      if(typeof opt_params["outputIndex"] === "number") {
        this.op = opt_params["outputIndex"]
      }
    }
    if(!this.output) {
      this.output = new (USE_TYPEDARRAY ? Uint8Array : Array)(32768)
    }
  };
  Zlib.RawDeflate.CompressionType = {NONE:0, FIXED:1, DYNAMIC:2, RESERVED:3};
  Zlib.RawDeflate.Lz77MinLength = 3;
  Zlib.RawDeflate.Lz77MaxLength = 258;
  Zlib.RawDeflate.WindowSize = 32768;
  Zlib.RawDeflate.MaxCodeLength = 16;
  Zlib.RawDeflate.HUFMAX = 286;
  Zlib.RawDeflate.FixedHuffmanTable = function() {
    var table = [], i;
    for(i = 0;i < 288;i++) {
      switch(true) {
        case i <= 143:
          table.push([i + 48, 8]);
          break;
        case i <= 255:
          table.push([i - 144 + 400, 9]);
          break;
        case i <= 279:
          table.push([i - 256 + 0, 7]);
          break;
        case i <= 287:
          table.push([i - 280 + 192, 8]);
          break;
        default:
          throw"invalid literal: " + i;
      }
    }
    return table
  }();
  Zlib.RawDeflate.prototype.compress = function() {
    var blockArray;
    var position;
    var length;
    var input = this.input;
    switch(this.compressionType) {
      case Zlib.RawDeflate.CompressionType.NONE:
        for(position = 0, length = input.length;position < length;) {
          blockArray = USE_TYPEDARRAY ? input.subarray(position, position + 65535) : input.slice(position, position + 65535);
          position += blockArray.length;
          this.makeNocompressBlock(blockArray, position === length)
        }
        break;
      case Zlib.RawDeflate.CompressionType.FIXED:
        this.output = this.makeFixedHuffmanBlock(input, true);
        this.op = this.output.length;
        break;
      case Zlib.RawDeflate.CompressionType.DYNAMIC:
        this.output = this.makeDynamicHuffmanBlock(input, true);
        this.op = this.output.length;
        break;
      default:
        throw"invalid compression type";
    }
    return this.output
  };
  Zlib.RawDeflate.prototype.makeNocompressBlock = function(blockArray, isFinalBlock) {
    var bfinal;
    var btype;
    var len;
    var nlen;
    var i;
    var il;
    var output = this.output;
    var op = this.op;
    if(USE_TYPEDARRAY) {
      output = new Uint8Array(this.output.buffer);
      while(output.length <= op + blockArray.length + 5) {
        output = new Uint8Array(output.length << 1)
      }
      output.set(this.output)
    }
    bfinal = isFinalBlock ? 1 : 0;
    btype = Zlib.RawDeflate.CompressionType.NONE;
    output[op++] = bfinal | btype << 1;
    len = blockArray.length;
    nlen = ~len + 65536 & 65535;
    output[op++] = len & 255;
    output[op++] = len >>> 8 & 255;
    output[op++] = nlen & 255;
    output[op++] = nlen >>> 8 & 255;
    if(USE_TYPEDARRAY) {
      output.set(blockArray, op);
      op += blockArray.length;
      output = output.subarray(0, op)
    }else {
      for(i = 0, il = blockArray.length;i < il;++i) {
        output[op++] = blockArray[i]
      }
      output.length = op
    }
    this.op = op;
    this.output = output;
    return output
  };
  Zlib.RawDeflate.prototype.makeFixedHuffmanBlock = function(blockArray, isFinalBlock) {
    var stream = new Zlib.BitStream(USE_TYPEDARRAY ? new Uint8Array(this.output.buffer) : this.output, this.op);
    var bfinal;
    var btype;
    var data;
    bfinal = isFinalBlock ? 1 : 0;
    btype = Zlib.RawDeflate.CompressionType.FIXED;
    stream.writeBits(bfinal, 1, true);
    stream.writeBits(btype, 2, true);
    data = this.lz77(blockArray);
    this.fixedHuffman(data, stream);
    return stream.finish()
  };
  Zlib.RawDeflate.prototype.makeDynamicHuffmanBlock = function(blockArray, isFinalBlock) {
    var stream = new Zlib.BitStream(USE_TYPEDARRAY ? new Uint8Array(this.output.buffer) : this.output, this.op);
    var bfinal;
    var btype;
    var data;
    var hlit;
    var hdist;
    var hclen;
    var hclenOrder = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
    var litLenLengths;
    var litLenCodes;
    var distLengths;
    var distCodes;
    var treeSymbols;
    var treeLengths;
    var transLengths = new Array(19);
    var treeCodes;
    var code;
    var bitlen;
    var i;
    var il;
    bfinal = isFinalBlock ? 1 : 0;
    btype = Zlib.RawDeflate.CompressionType.DYNAMIC;
    stream.writeBits(bfinal, 1, true);
    stream.writeBits(btype, 2, true);
    data = this.lz77(blockArray);
    litLenLengths = this.getLengths_(this.freqsLitLen, 15);
    litLenCodes = this.getCodesFromLengths_(litLenLengths);
    distLengths = this.getLengths_(this.freqsDist, 7);
    distCodes = this.getCodesFromLengths_(distLengths);
    for(hlit = 286;hlit > 257 && litLenLengths[hlit - 1] === 0;hlit--) {
    }
    for(hdist = 30;hdist > 1 && distLengths[hdist - 1] === 0;hdist--) {
    }
    treeSymbols = this.getTreeSymbols_(hlit, litLenLengths, hdist, distLengths);
    treeLengths = this.getLengths_(treeSymbols.freqs, 7);
    for(i = 0;i < 19;i++) {
      transLengths[i] = treeLengths[hclenOrder[i]]
    }
    for(hclen = 19;hclen > 4 && transLengths[hclen - 1] === 0;hclen--) {
    }
    treeCodes = this.getCodesFromLengths_(treeLengths);
    stream.writeBits(hlit - 257, 5, true);
    stream.writeBits(hdist - 1, 5, true);
    stream.writeBits(hclen - 4, 4, true);
    for(i = 0;i < hclen;i++) {
      stream.writeBits(transLengths[i], 3, true)
    }
    for(i = 0, il = treeSymbols.codes.length;i < il;i++) {
      code = treeSymbols.codes[i];
      stream.writeBits(treeCodes[code], treeLengths[code], true);
      if(code >= 16) {
        i++;
        switch(code) {
          case 16:
            bitlen = 2;
            break;
          case 17:
            bitlen = 3;
            break;
          case 18:
            bitlen = 7;
            break;
          default:
            throw"invalid code: " + code;
        }
        stream.writeBits(treeSymbols.codes[i], bitlen, true)
      }
    }
    this.dynamicHuffman(data, [litLenCodes, litLenLengths], [distCodes, distLengths], stream);
    return stream.finish()
  };
  Zlib.RawDeflate.prototype.dynamicHuffman = function(dataArray, litLen, dist, stream) {
    var index;
    var length;
    var literal;
    var code;
    var litLenCodes;
    var litLenLengths;
    var distCodes;
    var distLengths;
    litLenCodes = litLen[0];
    litLenLengths = litLen[1];
    distCodes = dist[0];
    distLengths = dist[1];
    for(index = 0, length = dataArray.length;index < length;++index) {
      literal = dataArray[index];
      stream.writeBits(litLenCodes[literal], litLenLengths[literal], true);
      if(literal > 256) {
        stream.writeBits(dataArray[++index], dataArray[++index], true);
        code = dataArray[++index];
        stream.writeBits(distCodes[code], distLengths[code], true);
        stream.writeBits(dataArray[++index], dataArray[++index], true)
      }else {
        if(literal === 256) {
          break
        }
      }
    }
    return stream
  };
  Zlib.RawDeflate.prototype.fixedHuffman = function(dataArray, stream) {
    var index;
    var length;
    var literal;
    for(index = 0, length = dataArray.length;index < length;index++) {
      literal = dataArray[index];
      Zlib.BitStream.prototype.writeBits.apply(stream, Zlib.RawDeflate.FixedHuffmanTable[literal]);
      if(literal > 256) {
        stream.writeBits(dataArray[++index], dataArray[++index], true);
        stream.writeBits(dataArray[++index], 5);
        stream.writeBits(dataArray[++index], dataArray[++index], true)
      }else {
        if(literal === 256) {
          break
        }
      }
    }
    return stream
  };
  Zlib.RawDeflate.Lz77Match = function(length, backwardDistance) {
    this.length = length;
    this.backwardDistance = backwardDistance
  };
  Zlib.RawDeflate.Lz77Match.LengthCodeTable = function(table) {
    return USE_TYPEDARRAY ? new Uint32Array(table) : table
  }(function() {
    var table = [];
    var i;
    var c;
    for(i = 3;i <= 258;i++) {
      c = code(i);
      table[i] = c[2] << 24 | c[1] << 16 | c[0]
    }
    function code(length) {
      switch(true) {
        case length === 3:
          return[257, length - 3, 0];
          break;
        case length === 4:
          return[258, length - 4, 0];
          break;
        case length === 5:
          return[259, length - 5, 0];
          break;
        case length === 6:
          return[260, length - 6, 0];
          break;
        case length === 7:
          return[261, length - 7, 0];
          break;
        case length === 8:
          return[262, length - 8, 0];
          break;
        case length === 9:
          return[263, length - 9, 0];
          break;
        case length === 10:
          return[264, length - 10, 0];
          break;
        case length <= 12:
          return[265, length - 11, 1];
          break;
        case length <= 14:
          return[266, length - 13, 1];
          break;
        case length <= 16:
          return[267, length - 15, 1];
          break;
        case length <= 18:
          return[268, length - 17, 1];
          break;
        case length <= 22:
          return[269, length - 19, 2];
          break;
        case length <= 26:
          return[270, length - 23, 2];
          break;
        case length <= 30:
          return[271, length - 27, 2];
          break;
        case length <= 34:
          return[272, length - 31, 2];
          break;
        case length <= 42:
          return[273, length - 35, 3];
          break;
        case length <= 50:
          return[274, length - 43, 3];
          break;
        case length <= 58:
          return[275, length - 51, 3];
          break;
        case length <= 66:
          return[276, length - 59, 3];
          break;
        case length <= 82:
          return[277, length - 67, 4];
          break;
        case length <= 98:
          return[278, length - 83, 4];
          break;
        case length <= 114:
          return[279, length - 99, 4];
          break;
        case length <= 130:
          return[280, length - 115, 4];
          break;
        case length <= 162:
          return[281, length - 131, 5];
          break;
        case length <= 194:
          return[282, length - 163, 5];
          break;
        case length <= 226:
          return[283, length - 195, 5];
          break;
        case length <= 257:
          return[284, length - 227, 5];
          break;
        case length === 258:
          return[285, length - 258, 0];
          break;
        default:
          throw"invalid length: " + length;
      }
    }
    return table
  }());
  Zlib.RawDeflate.Lz77Match.prototype.getDistanceCode_ = function(dist) {
    var r;
    switch(true) {
      case dist === 1:
        r = [0, dist - 1, 0];
        break;
      case dist === 2:
        r = [1, dist - 2, 0];
        break;
      case dist === 3:
        r = [2, dist - 3, 0];
        break;
      case dist === 4:
        r = [3, dist - 4, 0];
        break;
      case dist <= 6:
        r = [4, dist - 5, 1];
        break;
      case dist <= 8:
        r = [5, dist - 7, 1];
        break;
      case dist <= 12:
        r = [6, dist - 9, 2];
        break;
      case dist <= 16:
        r = [7, dist - 13, 2];
        break;
      case dist <= 24:
        r = [8, dist - 17, 3];
        break;
      case dist <= 32:
        r = [9, dist - 25, 3];
        break;
      case dist <= 48:
        r = [10, dist - 33, 4];
        break;
      case dist <= 64:
        r = [11, dist - 49, 4];
        break;
      case dist <= 96:
        r = [12, dist - 65, 5];
        break;
      case dist <= 128:
        r = [13, dist - 97, 5];
        break;
      case dist <= 192:
        r = [14, dist - 129, 6];
        break;
      case dist <= 256:
        r = [15, dist - 193, 6];
        break;
      case dist <= 384:
        r = [16, dist - 257, 7];
        break;
      case dist <= 512:
        r = [17, dist - 385, 7];
        break;
      case dist <= 768:
        r = [18, dist - 513, 8];
        break;
      case dist <= 1024:
        r = [19, dist - 769, 8];
        break;
      case dist <= 1536:
        r = [20, dist - 1025, 9];
        break;
      case dist <= 2048:
        r = [21, dist - 1537, 9];
        break;
      case dist <= 3072:
        r = [22, dist - 2049, 10];
        break;
      case dist <= 4096:
        r = [23, dist - 3073, 10];
        break;
      case dist <= 6144:
        r = [24, dist - 4097, 11];
        break;
      case dist <= 8192:
        r = [25, dist - 6145, 11];
        break;
      case dist <= 12288:
        r = [26, dist - 8193, 12];
        break;
      case dist <= 16384:
        r = [27, dist - 12289, 12];
        break;
      case dist <= 24576:
        r = [28, dist - 16385, 13];
        break;
      case dist <= 32768:
        r = [29, dist - 24577, 13];
        break;
      default:
        throw"invalid distance";
    }
    return r
  };
  Zlib.RawDeflate.Lz77Match.prototype.toLz77Array = function() {
    var length = this.length;
    var dist = this.backwardDistance;
    var codeArray = [];
    var pos = 0;
    var code;
    code = Zlib.RawDeflate.Lz77Match.LengthCodeTable[length];
    codeArray[pos++] = code & 65535;
    codeArray[pos++] = code >> 16 & 255;
    codeArray[pos++] = code >> 24;
    code = this.getDistanceCode_(dist);
    codeArray[pos++] = code[0];
    codeArray[pos++] = code[1];
    codeArray[pos++] = code[2];
    return codeArray
  };
  Zlib.RawDeflate.prototype.lz77 = function(dataArray) {
    var position;
    var length;
    var i;
    var il;
    var matchKey;
    var table = {};
    var windowSize = Zlib.RawDeflate.WindowSize;
    var matchList;
    var longestMatch;
    var prevMatch;
    var lz77buf = USE_TYPEDARRAY ? new Uint16Array(dataArray.length * 2) : [];
    var pos = 0;
    var skipLength = 0;
    var freqsLitLen = new (USE_TYPEDARRAY ? Uint32Array : Array)(286);
    var freqsDist = new (USE_TYPEDARRAY ? Uint32Array : Array)(30);
    var lazy = this.lazy;
    var tmp;
    if(!USE_TYPEDARRAY) {
      for(i = 0;i <= 285;) {
        freqsLitLen[i++] = 0
      }
      for(i = 0;i <= 29;) {
        freqsDist[i++] = 0
      }
    }
    freqsLitLen[256] = 1;
    function writeMatch(match, offset) {
      var lz77Array = match.toLz77Array();
      var i;
      var il;
      for(i = 0, il = lz77Array.length;i < il;++i) {
        lz77buf[pos++] = lz77Array[i]
      }
      freqsLitLen[lz77Array[0]]++;
      freqsDist[lz77Array[3]]++;
      skipLength = match.length + offset - 1;
      prevMatch = null
    }
    for(position = 0, length = dataArray.length;position < length;++position) {
      for(matchKey = 0, i = 0, il = Zlib.RawDeflate.Lz77MinLength;i < il;++i) {
        if(position + i === length) {
          break
        }
        matchKey = matchKey << 8 | dataArray[position + i]
      }
      if(table[matchKey] === void 0) {
        table[matchKey] = []
      }
      matchList = table[matchKey];
      if(skipLength-- > 0) {
        matchList.push(position);
        continue
      }
      while(matchList.length > 0 && position - matchList[0] > windowSize) {
        matchList.shift()
      }
      if(position + Zlib.RawDeflate.Lz77MinLength >= length) {
        if(prevMatch) {
          writeMatch(prevMatch, -1)
        }
        for(i = 0, il = length - position;i < il;++i) {
          tmp = dataArray[position + i];
          lz77buf[pos++] = tmp;
          ++freqsLitLen[tmp]
        }
        break
      }
      if(matchList.length > 0) {
        longestMatch = this.searchLongestMatch_(dataArray, position, matchList);
        if(prevMatch) {
          if(prevMatch.length < longestMatch.length) {
            tmp = dataArray[position - 1];
            lz77buf[pos++] = tmp;
            ++freqsLitLen[tmp];
            writeMatch(longestMatch, 0)
          }else {
            writeMatch(prevMatch, -1)
          }
        }else {
          if(longestMatch.length < lazy) {
            prevMatch = longestMatch
          }else {
            writeMatch(longestMatch, 0)
          }
        }
      }else {
        if(prevMatch) {
          writeMatch(prevMatch, -1)
        }else {
          tmp = dataArray[position];
          lz77buf[pos++] = tmp;
          ++freqsLitLen[tmp]
        }
      }
      matchList.push(position)
    }
    lz77buf[pos++] = 256;
    freqsLitLen[256]++;
    this.freqsLitLen = freqsLitLen;
    this.freqsDist = freqsDist;
    return(USE_TYPEDARRAY ? lz77buf.subarray(0, pos) : lz77buf)
  };
  Zlib.RawDeflate.prototype.searchLongestMatch_ = function(data, position, matchList) {
    var match, currentMatch, matchMax = 0, matchLength, i, j, l, dl = data.length;
    permatch:for(i = 0, l = matchList.length;i < l;i++) {
      match = matchList[l - i - 1];
      matchLength = Zlib.RawDeflate.Lz77MinLength;
      if(matchMax > Zlib.RawDeflate.Lz77MinLength) {
        for(j = matchMax;j > Zlib.RawDeflate.Lz77MinLength;j--) {
          if(data[match + j - 1] !== data[position + j - 1]) {
            continue permatch
          }
        }
        matchLength = matchMax
      }
      while(matchLength < Zlib.RawDeflate.Lz77MaxLength && position + matchLength < dl && data[match + matchLength] === data[position + matchLength]) {
        ++matchLength
      }
      if(matchLength > matchMax) {
        currentMatch = match;
        matchMax = matchLength
      }
      if(matchLength === Zlib.RawDeflate.Lz77MaxLength) {
        break
      }
    }
    return new Zlib.RawDeflate.Lz77Match(matchMax, position - currentMatch)
  };
  Zlib.RawDeflate.prototype.getTreeSymbols_ = function(hlit, litlenLengths, hdist, distLengths) {
    var src = new (USE_TYPEDARRAY ? Uint32Array : Array)(hlit + hdist), i, j, runLength, l, result = new (USE_TYPEDARRAY ? Uint32Array : Array)(286 + 30), nResult, rpt, freqs = new (USE_TYPEDARRAY ? Uint8Array : Array)(19);
    j = 0;
    for(i = 0;i < hlit;i++) {
      src[j++] = litlenLengths[i]
    }
    for(i = 0;i < hdist;i++) {
      src[j++] = distLengths[i]
    }
    if(!USE_TYPEDARRAY) {
      for(i = 0, l = freqs.length;i < l;++i) {
        freqs[i] = 0
      }
    }
    nResult = 0;
    for(i = 0, l = src.length;i < l;i += j) {
      for(j = 1;i + j < l && src[i + j] === src[i];++j) {
      }
      runLength = j;
      if(src[i] === 0) {
        if(runLength < 3) {
          while(runLength-- > 0) {
            result[nResult++] = 0;
            freqs[0]++
          }
        }else {
          while(runLength > 0) {
            rpt = runLength < 138 ? runLength : 138;
            if(rpt > runLength - 3 && rpt < runLength) {
              rpt = runLength - 3
            }
            if(rpt <= 10) {
              result[nResult++] = 17;
              result[nResult++] = rpt - 3;
              freqs[17]++
            }else {
              result[nResult++] = 18;
              result[nResult++] = rpt - 11;
              freqs[18]++
            }
            runLength -= rpt
          }
        }
      }else {
        result[nResult++] = src[i];
        freqs[src[i]]++;
        runLength--;
        if(runLength < 3) {
          while(runLength-- > 0) {
            result[nResult++] = src[i];
            freqs[src[i]]++
          }
        }else {
          while(runLength > 0) {
            rpt = runLength < 6 ? runLength : 6;
            if(rpt > runLength - 3 && rpt < runLength) {
              rpt = runLength - 3
            }
            result[nResult++] = 16;
            result[nResult++] = rpt - 3;
            freqs[16]++;
            runLength -= rpt
          }
        }
      }
    }
    return{codes:USE_TYPEDARRAY ? result.subarray(0, nResult) : result.slice(0, nResult), freqs:freqs}
  };
  Zlib.RawDeflate.prototype.getLengths_ = function(freqs, limit) {
    var nSymbols = freqs.length;
    var heap = new Zlib.Heap(2 * Zlib.RawDeflate.HUFMAX);
    var length = new (USE_TYPEDARRAY ? Uint8Array : Array)(nSymbols);
    var nodes;
    var values;
    var codeLength;
    var i;
    var il;
    if(!USE_TYPEDARRAY) {
      for(i = 0;i < nSymbols;i++) {
        length[i] = 0
      }
    }
    for(i = 0;i < nSymbols;++i) {
      if(freqs[i] > 0) {
        heap.push(i, freqs[i])
      }
    }
    nodes = new Array(heap.length / 2);
    values = new (USE_TYPEDARRAY ? Uint32Array : Array)(heap.length / 2);
    if(nodes.length === 1) {
      length[heap.pop().index] = 1;
      return length
    }
    for(i = 0, il = heap.length / 2;i < il;++i) {
      nodes[i] = heap.pop();
      values[i] = nodes[i].value
    }
    codeLength = this.reversePackageMerge_(values, values.length, limit);
    for(i = 0, il = nodes.length;i < il;++i) {
      length[nodes[i].index] = codeLength[i]
    }
    return length
  };
  Zlib.RawDeflate.prototype.reversePackageMerge_ = function(freqs, symbols, limit) {
    var minimumCost = new (USE_TYPEDARRAY ? Uint16Array : Array)(limit);
    var flag = new (USE_TYPEDARRAY ? Uint8Array : Array)(limit);
    var codeLength = new (USE_TYPEDARRAY ? Uint8Array : Array)(symbols);
    var value = new Array(limit);
    var type = new Array(limit);
    var currentPosition = new Array(limit);
    var excess = (1 << limit) - symbols;
    var half = 1 << limit - 1;
    var i;
    var j;
    var t;
    var weight;
    var next;
    function takePackage(j) {
      var x = type[j][currentPosition[j]];
      if(x === symbols) {
        takePackage(j + 1);
        takePackage(j + 1)
      }else {
        --codeLength[x]
      }
      ++currentPosition[j]
    }
    minimumCost[limit - 1] = symbols;
    for(j = 0;j < limit;++j) {
      if(excess < half) {
        flag[j] = 0
      }else {
        flag[j] = 1;
        excess -= half
      }
      excess <<= 1;
      minimumCost[limit - 2 - j] = (minimumCost[limit - 1 - j] / 2 | 0) + symbols
    }
    minimumCost[0] = flag[0];
    value[0] = new Array(minimumCost[0]);
    type[0] = new Array(minimumCost[0]);
    for(j = 1;j < limit;++j) {
      if(minimumCost[j] > 2 * minimumCost[j - 1] + flag[j]) {
        minimumCost[j] = 2 * minimumCost[j - 1] + flag[j]
      }
      value[j] = new Array(minimumCost[j]);
      type[j] = new Array(minimumCost[j])
    }
    for(i = 0;i < symbols;++i) {
      codeLength[i] = limit
    }
    for(t = 0;t < minimumCost[limit - 1];++t) {
      value[limit - 1][t] = freqs[t];
      type[limit - 1][t] = t
    }
    for(i = 0;i < limit;++i) {
      currentPosition[i] = 0
    }
    if(flag[limit - 1] === 1) {
      --codeLength[0];
      ++currentPosition[limit - 1]
    }
    for(j = limit - 2;j >= 0;--j) {
      i = 0;
      weight = 0;
      next = currentPosition[j + 1];
      for(t = 0;t < minimumCost[j];t++) {
        weight = value[j + 1][next] + value[j + 1][next + 1];
        if(weight > freqs[i]) {
          value[j][t] = weight;
          type[j][t] = symbols;
          next += 2
        }else {
          value[j][t] = freqs[i];
          type[j][t] = i;
          ++i
        }
      }
      currentPosition[j] = 0;
      if(flag[j] === 1) {
        takePackage(j)
      }
    }
    return codeLength
  };
  Zlib.RawDeflate.prototype.getCodesFromLengths_ = function(lengths) {
    var codes = new (USE_TYPEDARRAY ? Uint16Array : Array)(lengths.length), count = [], startCode = [], code = 0, i, il, j, m;
    for(i = 0, il = lengths.length;i < il;i++) {
      count[lengths[i]] = (count[lengths[i]] | 0) + 1
    }
    for(i = 1, il = Zlib.RawDeflate.MaxCodeLength;i <= il;i++) {
      startCode[i] = code;
      code += count[i] | 0;
      code <<= 1
    }
    for(i = 0, il = lengths.length;i < il;i++) {
      code = startCode[lengths[i]];
      startCode[lengths[i]] += 1;
      codes[i] = 0;
      for(j = 0, m = lengths[i];j < m;j++) {
        codes[i] = codes[i] << 1 | code & 1;
        code >>>= 1
      }
    }
    return codes
  }
});
goog.provide("Zlib.Gzip");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib.CRC32");
goog.require("Zlib.RawDeflate");
goog.scope(function() {
  Zlib.Gzip = function(input, opt_params) {
    this.input = input;
    this.ip = 0;
    this.output;
    this.op = 0;
    this.flags = {};
    this.filename;
    this.comment;
    this.deflateOptions;
    if(opt_params) {
      if(opt_params["flags"]) {
        this.flags = opt_params["flags"]
      }
      if(typeof opt_params["filename"] === "string") {
        this.filename = opt_params["filename"]
      }
      if(typeof opt_params["comment"] === "string") {
        this.comment = opt_params["comment"]
      }
      if(opt_params["deflateOptions"]) {
        this.deflateOptions = opt_params["deflateOptions"]
      }
    }
    if(!this.deflateOptions) {
      this.deflateOptions = {}
    }
  };
  Zlib.Gzip.DefaultBufferSize = 32768;
  Zlib.Gzip.prototype.compress = function() {
    var flg;
    var mtime;
    var crc16;
    var crc32;
    var rawdeflate;
    var c;
    var i;
    var il;
    var output = new (USE_TYPEDARRAY ? Uint8Array : Array)(Zlib.Gzip.DefaultBufferSize);
    var op = 0;
    var input = this.input;
    var ip = this.ip;
    var filename = this.filename;
    var comment = this.comment;
    output[op++] = 31;
    output[op++] = 139;
    output[op++] = 8;
    flg = 0;
    if(this.flags["fname"]) {
      flg |= Zlib.Gzip.FlagsMask.FNAME
    }
    if(this.flags["fcomment"]) {
      flg |= Zlib.Gzip.FlagsMask.FCOMMENT
    }
    if(this.flags["fhcrc"]) {
      flg |= Zlib.Gzip.FlagsMask.FHCRC
    }
    output[op++] = flg;
    mtime = (Date.now ? Date.now() : +new Date) / 1E3 | 0;
    output[op++] = mtime & 255;
    output[op++] = mtime >>> 8 & 255;
    output[op++] = mtime >>> 16 & 255;
    output[op++] = mtime >>> 24 & 255;
    output[op++] = 0;
    output[op++] = Zlib.Gzip.OperatingSystem.UNKNOWN;
    if(this.flags["fname"] !== void 0) {
      for(i = 0, il = filename.length;i < il;++i) {
        c = filename.charCodeAt(i);
        if(c > 255) {
          output[op++] = c >>> 8 & 255
        }
        output[op++] = c & 255
      }
      output[op++] = 0
    }
    if(this.flags["comment"]) {
      for(i = 0, il = comment.length;i < il;++i) {
        c = comment.charCodeAt(i);
        if(c > 255) {
          output[op++] = c >>> 8 & 255
        }
        output[op++] = c & 255
      }
      output[op++] = 0
    }
    if(this.flags["fhcrc"]) {
      crc16 = Zlib.CRC32.calc(output, 0, op) & 65535;
      output[op++] = crc16 & 255;
      output[op++] = crc16 >>> 8 & 255
    }
    this.deflateOptions["outputBuffer"] = output;
    this.deflateOptions["outputIndex"] = op;
    rawdeflate = new Zlib.RawDeflate(input, this.deflateOptions);
    output = rawdeflate.compress();
    op = rawdeflate.op;
    if(USE_TYPEDARRAY) {
      if(op + 8 > output.buffer.byteLength) {
        this.output = new Uint8Array(op + 8);
        this.output.set(new Uint8Array(output.buffer));
        output = this.output
      }else {
        output = new Uint8Array(output.buffer)
      }
    }
    crc32 = Zlib.CRC32.calc(input);
    output[op++] = crc32 & 255;
    output[op++] = crc32 >>> 8 & 255;
    output[op++] = crc32 >>> 16 & 255;
    output[op++] = crc32 >>> 24 & 255;
    il = input.length;
    output[op++] = il & 255;
    output[op++] = il >>> 8 & 255;
    output[op++] = il >>> 16 & 255;
    output[op++] = il >>> 24 & 255;
    this.ip = ip;
    if(USE_TYPEDARRAY && op < output.length) {
      this.output = output = output.subarray(0, op)
    }
    return output
  };
  Zlib.Gzip.OperatingSystem = {FAT:0, AMIGA:1, VMS:2, UNIX:3, VM_CMS:4, ATARI_TOS:5, HPFS:6, MACINTOSH:7, Z_SYSTEM:8, CP_M:9, TOPS_20:10, NTFS:11, QDOS:12, ACORN_RISCOS:13, UNKNOWN:255};
  Zlib.Gzip.FlagsMask = {FTEXT:1, FHCRC:2, FEXTRA:4, FNAME:8, FCOMMENT:16}
});
goog.provide("Zlib.RawInflate");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib.Huffman");
var ZLIB_RAW_INFLATE_BUFFER_SIZE = 32768;
goog.scope(function() {
  var buildHuffmanTable = Zlib.Huffman.buildHuffmanTable;
  Zlib.RawInflate = function(input, opt_params) {
    this.buffer;
    this.blocks = [];
    this.bufferSize = ZLIB_RAW_INFLATE_BUFFER_SIZE;
    this.totalpos = 0;
    this.ip = 0;
    this.bitsbuf = 0;
    this.bitsbuflen = 0;
    this.input = USE_TYPEDARRAY ? new Uint8Array(input) : input;
    this.output;
    this.op;
    this.bfinal = false;
    this.bufferType = Zlib.RawInflate.BufferType.ADAPTIVE;
    this.resize = false;
    this.prev;
    if(opt_params || !(opt_params = {})) {
      if(opt_params["index"]) {
        this.ip = opt_params["index"]
      }
      if(opt_params["bufferSize"]) {
        this.bufferSize = opt_params["bufferSize"]
      }
      if(opt_params["bufferType"]) {
        this.bufferType = opt_params["bufferType"]
      }
      if(opt_params["resize"]) {
        this.resize = opt_params["resize"]
      }
    }
    switch(this.bufferType) {
      case Zlib.RawInflate.BufferType.BLOCK:
        this.op = Zlib.RawInflate.MaxBackwardLength;
        this.output = new (USE_TYPEDARRAY ? Uint8Array : Array)(Zlib.RawInflate.MaxBackwardLength + this.bufferSize + Zlib.RawInflate.MaxCopyLength);
        break;
      case Zlib.RawInflate.BufferType.ADAPTIVE:
        this.op = 0;
        this.output = new (USE_TYPEDARRAY ? Uint8Array : Array)(this.bufferSize);
        this.expandBuffer = this.expandBufferAdaptive;
        this.concatBuffer = this.concatBufferDynamic;
        this.decodeHuffman = this.decodeHuffmanAdaptive;
        break;
      default:
        throw new Error("invalid inflate mode");
    }
  };
  Zlib.RawInflate.BufferType = {BLOCK:0, ADAPTIVE:1};
  Zlib.RawInflate.prototype.decompress = function() {
    while(!this.bfinal) {
      this.parseBlock()
    }
    return this.concatBuffer()
  };
  Zlib.RawInflate.MaxBackwardLength = 32768;
  Zlib.RawInflate.MaxCopyLength = 258;
  Zlib.RawInflate.Order = function(table) {
    return USE_TYPEDARRAY ? new Uint16Array(table) : table
  }([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
  Zlib.RawInflate.LengthCodeTable = function(table) {
    return USE_TYPEDARRAY ? new Uint16Array(table) : table
  }([3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 258, 258]);
  Zlib.RawInflate.LengthExtraTable = function(table) {
    return USE_TYPEDARRAY ? new Uint8Array(table) : table
  }([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0]);
  Zlib.RawInflate.DistCodeTable = function(table) {
    return USE_TYPEDARRAY ? new Uint16Array(table) : table
  }([1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577]);
  Zlib.RawInflate.DistExtraTable = function(table) {
    return USE_TYPEDARRAY ? new Uint8Array(table) : table
  }([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]);
  Zlib.RawInflate.FixedLiteralLengthTable = function(table) {
    return table
  }(function() {
    var lengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(288);
    var i, il;
    for(i = 0, il = lengths.length;i < il;++i) {
      lengths[i] = i <= 143 ? 8 : i <= 255 ? 9 : i <= 279 ? 7 : 8
    }
    return buildHuffmanTable(lengths)
  }());
  Zlib.RawInflate.FixedDistanceTable = function(table) {
    return table
  }(function() {
    var lengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(30);
    var i, il;
    for(i = 0, il = lengths.length;i < il;++i) {
      lengths[i] = 5
    }
    return buildHuffmanTable(lengths)
  }());
  Zlib.RawInflate.prototype.parseBlock = function() {
    var hdr = this.readBits(3);
    if(hdr & 1) {
      this.bfinal = true
    }
    hdr >>>= 1;
    switch(hdr) {
      case 0:
        this.parseUncompressedBlock();
        break;
      case 1:
        this.parseFixedHuffmanBlock();
        break;
      case 2:
        this.parseDynamicHuffmanBlock();
        break;
      default:
        throw new Error("unknown BTYPE: " + hdr);
    }
  };
  Zlib.RawInflate.prototype.readBits = function(length) {
    var bitsbuf = this.bitsbuf;
    var bitsbuflen = this.bitsbuflen;
    var input = this.input;
    var ip = this.ip;
    var inputLength = input.length;
    var octet;
    while(bitsbuflen < length) {
      if(ip >= inputLength) {
        throw new Error("input buffer is broken");
      }
      bitsbuf |= input[ip++] << bitsbuflen;
      bitsbuflen += 8
    }
    octet = bitsbuf & (1 << length) - 1;
    bitsbuf >>>= length;
    bitsbuflen -= length;
    this.bitsbuf = bitsbuf;
    this.bitsbuflen = bitsbuflen;
    this.ip = ip;
    return octet
  };
  Zlib.RawInflate.prototype.readCodeByTable = function(table) {
    var bitsbuf = this.bitsbuf;
    var bitsbuflen = this.bitsbuflen;
    var input = this.input;
    var ip = this.ip;
    var inputLength = input.length;
    var codeTable = table[0];
    var maxCodeLength = table[1];
    var codeWithLength;
    var codeLength;
    while(bitsbuflen < maxCodeLength) {
      if(ip >= inputLength) {
        break
      }
      bitsbuf |= input[ip++] << bitsbuflen;
      bitsbuflen += 8
    }
    codeWithLength = codeTable[bitsbuf & (1 << maxCodeLength) - 1];
    codeLength = codeWithLength >>> 16;
    this.bitsbuf = bitsbuf >> codeLength;
    this.bitsbuflen = bitsbuflen - codeLength;
    this.ip = ip;
    return codeWithLength & 65535
  };
  Zlib.RawInflate.prototype.parseUncompressedBlock = function() {
    var input = this.input;
    var ip = this.ip;
    var output = this.output;
    var op = this.op;
    var inputLength = input.length;
    var len;
    var nlen;
    var olength = output.length;
    var preCopy;
    this.bitsbuf = 0;
    this.bitsbuflen = 0;
    if(ip + 1 >= inputLength) {
      throw new Error("invalid uncompressed block header: LEN");
    }
    len = input[ip++] | input[ip++] << 8;
    if(ip + 1 >= inputLength) {
      throw new Error("invalid uncompressed block header: NLEN");
    }
    nlen = input[ip++] | input[ip++] << 8;
    if(len === ~nlen) {
      throw new Error("invalid uncompressed block header: length verify");
    }
    if(ip + len > input.length) {
      throw new Error("input buffer is broken");
    }
    switch(this.bufferType) {
      case Zlib.RawInflate.BufferType.BLOCK:
        while(op + len > output.length) {
          preCopy = olength - op;
          len -= preCopy;
          if(USE_TYPEDARRAY) {
            output.set(input.subarray(ip, ip + preCopy), op);
            op += preCopy;
            ip += preCopy
          }else {
            while(preCopy--) {
              output[op++] = input[ip++]
            }
          }
          this.op = op;
          output = this.expandBuffer();
          op = this.op
        }
        break;
      case Zlib.RawInflate.BufferType.ADAPTIVE:
        while(op + len > output.length) {
          output = this.expandBuffer({fixRatio:2})
        }
        break;
      default:
        throw new Error("invalid inflate mode");
    }
    if(USE_TYPEDARRAY) {
      output.set(input.subarray(ip, ip + len), op);
      op += len;
      ip += len
    }else {
      while(len--) {
        output[op++] = input[ip++]
      }
    }
    this.ip = ip;
    this.op = op;
    this.output = output
  };
  Zlib.RawInflate.prototype.parseFixedHuffmanBlock = function() {
    this.decodeHuffman(Zlib.RawInflate.FixedLiteralLengthTable, Zlib.RawInflate.FixedDistanceTable)
  };
  Zlib.RawInflate.prototype.parseDynamicHuffmanBlock = function() {
    var hlit = this.readBits(5) + 257;
    var hdist = this.readBits(5) + 1;
    var hclen = this.readBits(4) + 4;
    var codeLengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(Zlib.RawInflate.Order.length);
    var codeLengthsTable;
    var litlenLengths;
    var distLengths;
    var i;
    for(i = 0;i < hclen;++i) {
      codeLengths[Zlib.RawInflate.Order[i]] = this.readBits(3)
    }
    if(!USE_TYPEDARRAY) {
      for(i = hclen, hclen = codeLengths.length;i < hclen;++i) {
        codeLengths[Zlib.RawInflate.Order[i]] = 0
      }
    }
    codeLengthsTable = buildHuffmanTable(codeLengths);
    function decode(num, table, lengths) {
      var code;
      var prev = this.prev;
      var repeat;
      var i;
      for(i = 0;i < num;) {
        code = this.readCodeByTable(table);
        switch(code) {
          case 16:
            repeat = 3 + this.readBits(2);
            while(repeat--) {
              lengths[i++] = prev
            }
            break;
          case 17:
            repeat = 3 + this.readBits(3);
            while(repeat--) {
              lengths[i++] = 0
            }
            prev = 0;
            break;
          case 18:
            repeat = 11 + this.readBits(7);
            while(repeat--) {
              lengths[i++] = 0
            }
            prev = 0;
            break;
          default:
            lengths[i++] = code;
            prev = code;
            break
        }
      }
      this.prev = prev;
      return lengths
    }
    litlenLengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(hlit);
    distLengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(hdist);
    this.prev = 0;
    this.decodeHuffman(buildHuffmanTable(decode.call(this, hlit, codeLengthsTable, litlenLengths)), buildHuffmanTable(decode.call(this, hdist, codeLengthsTable, distLengths)))
  };
  Zlib.RawInflate.prototype.decodeHuffman = function(litlen, dist) {
    var output = this.output;
    var op = this.op;
    this.currentLitlenTable = litlen;
    var olength = output.length - Zlib.RawInflate.MaxCopyLength;
    var code;
    var ti;
    var codeDist;
    var codeLength;
    while((code = this.readCodeByTable(litlen)) !== 256) {
      if(code < 256) {
        if(op >= olength) {
          this.op = op;
          output = this.expandBuffer();
          op = this.op
        }
        output[op++] = code;
        continue
      }
      ti = code - 257;
      codeLength = Zlib.RawInflate.LengthCodeTable[ti];
      if(Zlib.RawInflate.LengthExtraTable[ti] > 0) {
        codeLength += this.readBits(Zlib.RawInflate.LengthExtraTable[ti])
      }
      code = this.readCodeByTable(dist);
      codeDist = Zlib.RawInflate.DistCodeTable[code];
      if(Zlib.RawInflate.DistExtraTable[code] > 0) {
        codeDist += this.readBits(Zlib.RawInflate.DistExtraTable[code])
      }
      if(op >= olength) {
        this.op = op;
        output = this.expandBuffer();
        op = this.op
      }
      while(codeLength--) {
        output[op] = output[op++ - codeDist]
      }
    }
    while(this.bitsbuflen >= 8) {
      this.bitsbuflen -= 8;
      this.ip--
    }
    this.op = op
  };
  Zlib.RawInflate.prototype.decodeHuffmanAdaptive = function(litlen, dist) {
    var output = this.output;
    var op = this.op;
    this.currentLitlenTable = litlen;
    var olength = output.length;
    var code;
    var ti;
    var codeDist;
    var codeLength;
    while((code = this.readCodeByTable(litlen)) !== 256) {
      if(code < 256) {
        if(op >= olength) {
          output = this.expandBuffer();
          olength = output.length
        }
        output[op++] = code;
        continue
      }
      ti = code - 257;
      codeLength = Zlib.RawInflate.LengthCodeTable[ti];
      if(Zlib.RawInflate.LengthExtraTable[ti] > 0) {
        codeLength += this.readBits(Zlib.RawInflate.LengthExtraTable[ti])
      }
      code = this.readCodeByTable(dist);
      codeDist = Zlib.RawInflate.DistCodeTable[code];
      if(Zlib.RawInflate.DistExtraTable[code] > 0) {
        codeDist += this.readBits(Zlib.RawInflate.DistExtraTable[code])
      }
      if(op + codeLength > olength) {
        output = this.expandBuffer();
        olength = output.length
      }
      while(codeLength--) {
        output[op] = output[op++ - codeDist]
      }
    }
    while(this.bitsbuflen >= 8) {
      this.bitsbuflen -= 8;
      this.ip--
    }
    this.op = op
  };
  Zlib.RawInflate.prototype.expandBuffer = function(opt_param) {
    var buffer = new (USE_TYPEDARRAY ? Uint8Array : Array)(this.op - Zlib.RawInflate.MaxBackwardLength);
    var backward = this.op - Zlib.RawInflate.MaxBackwardLength;
    var i;
    var il;
    var output = this.output;
    if(USE_TYPEDARRAY) {
      buffer.set(output.subarray(Zlib.RawInflate.MaxBackwardLength, buffer.length))
    }else {
      for(i = 0, il = buffer.length;i < il;++i) {
        buffer[i] = output[i + Zlib.RawInflate.MaxBackwardLength]
      }
    }
    this.blocks.push(buffer);
    this.totalpos += buffer.length;
    if(USE_TYPEDARRAY) {
      output.set(output.subarray(backward, backward + Zlib.RawInflate.MaxBackwardLength))
    }else {
      for(i = 0;i < Zlib.RawInflate.MaxBackwardLength;++i) {
        output[i] = output[backward + i]
      }
    }
    this.op = Zlib.RawInflate.MaxBackwardLength;
    return output
  };
  Zlib.RawInflate.prototype.expandBufferAdaptive = function(opt_param) {
    var buffer;
    var ratio = this.input.length / this.ip + 1 | 0;
    var maxHuffCode;
    var newSize;
    var maxInflateSize;
    var input = this.input;
    var output = this.output;
    if(opt_param) {
      if(typeof opt_param.fixRatio === "number") {
        ratio = opt_param.fixRatio
      }
      if(typeof opt_param.addRatio === "number") {
        ratio += opt_param.addRatio
      }
    }
    if(ratio < 2) {
      maxHuffCode = (input.length - this.ip) / this.currentLitlenTable[2];
      maxInflateSize = maxHuffCode / 2 * 258 | 0;
      newSize = maxInflateSize < output.length ? output.length + maxInflateSize : output.length << 1
    }else {
      newSize = output.length * ratio
    }
    if(USE_TYPEDARRAY) {
      buffer = new Uint8Array(newSize);
      buffer.set(output)
    }else {
      buffer = output
    }
    this.output = buffer;
    return this.output
  };
  Zlib.RawInflate.prototype.concatBuffer = function() {
    var pos = 0;
    var limit = this.totalpos + (this.op - Zlib.RawInflate.MaxBackwardLength);
    var output = this.output;
    var blocks = this.blocks;
    var block;
    var buffer = new (USE_TYPEDARRAY ? Uint8Array : Array)(limit);
    var i;
    var il;
    var j;
    var jl;
    if(blocks.length === 0) {
      return USE_TYPEDARRAY ? this.output.subarray(Zlib.RawInflate.MaxBackwardLength, this.op) : this.output.slice(Zlib.RawInflate.MaxBackwardLength, this.op)
    }
    for(i = 0, il = blocks.length;i < il;++i) {
      block = blocks[i];
      for(j = 0, jl = block.length;j < jl;++j) {
        buffer[pos++] = block[j]
      }
    }
    for(i = Zlib.RawInflate.MaxBackwardLength, il = this.op;i < il;++i) {
      buffer[pos++] = output[i]
    }
    this.blocks = [];
    this.buffer = buffer;
    return this.buffer
  };
  Zlib.RawInflate.prototype.concatBufferDynamic = function() {
    var buffer;
    var op = this.op;
    if(USE_TYPEDARRAY) {
      if(this.resize) {
        buffer = new Uint8Array(op);
        buffer.set(this.output.subarray(0, op))
      }else {
        buffer = this.output.subarray(0, op)
      }
    }else {
      if(this.output.length > op) {
        this.output.length = op
      }
      buffer = this.output
    }
    this.buffer = buffer;
    return this.buffer
  }
});
goog.provide("Zlib.Gunzip");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib.CRC32");
goog.require("Zlib.Gzip");
goog.require("Zlib.RawInflate");
goog.require("Zlib.GunzipMember");
goog.scope(function() {
  Zlib.Gunzip = function(input, opt_params) {
    this.input = input;
    this.ip = 0;
    this.member = [];
    this.decompressed = false
  };
  Zlib.Gunzip.prototype.getMembers = function() {
    if(!this.decompressed) {
      this.decompress()
    }
    return this.member.slice()
  };
  Zlib.Gunzip.prototype.decompress = function() {
    var il = this.input.length;
    while(this.ip < il) {
      this.decodeMember()
    }
    this.decompressed = true;
    return this.concatMember()
  };
  Zlib.Gunzip.prototype.decodeMember = function() {
    var member = new Zlib.GunzipMember;
    var isize;
    var rawinflate;
    var inflated;
    var inflen;
    var c;
    var ci;
    var str;
    var mtime;
    var crc32;
    var input = this.input;
    var ip = this.ip;
    member.id1 = input[ip++];
    member.id2 = input[ip++];
    if(member.id1 !== 31 || member.id2 !== 139) {
      throw new Error("invalid file signature:" + member.id1 + "," + member.id2);
    }
    member.cm = input[ip++];
    switch(member.cm) {
      case 8:
        break;
      default:
        throw new Error("unknown compression method: " + member.cm);
    }
    member.flg = input[ip++];
    mtime = input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24;
    member.mtime = new Date(mtime * 1E3);
    member.xfl = input[ip++];
    member.os = input[ip++];
    if((member.flg & Zlib.Gzip.FlagsMask.FEXTRA) > 0) {
      member.xlen = input[ip++] | input[ip++] << 8;
      ip = this.decodeSubField(ip, member.xlen)
    }
    if((member.flg & Zlib.Gzip.FlagsMask.FNAME) > 0) {
      for(str = [], ci = 0;(c = input[ip++]) > 0;) {
        str[ci++] = String.fromCharCode(c)
      }
      member.name = str.join("")
    }
    if((member.flg & Zlib.Gzip.FlagsMask.FCOMMENT) > 0) {
      for(str = [], ci = 0;(c = input[ip++]) > 0;) {
        str[ci++] = String.fromCharCode(c)
      }
      member.comment = str.join("")
    }
    if((member.flg & Zlib.Gzip.FlagsMask.FHCRC) > 0) {
      member.crc16 = Zlib.CRC32.calc(input, 0, ip) & 65535;
      if(member.crc16 !== (input[ip++] | input[ip++] << 8)) {
        throw new Error("invalid header crc16");
      }
    }
    isize = input[input.length - 4] | input[input.length - 3] << 8 | input[input.length - 2] << 16 | input[input.length - 1] << 24;
    if(input.length - ip - 4 - 4 < isize * 512) {
      inflen = isize
    }
    rawinflate = new Zlib.RawInflate(input, {"index":ip, "bufferSize":inflen});
    member.data = inflated = rawinflate.decompress();
    ip = rawinflate.ip;
    member.crc32 = crc32 = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    if(Zlib.CRC32.calc(inflated) !== crc32) {
      throw new Error("invalid CRC-32 checksum: 0x" + Zlib.CRC32.calc(inflated).toString(16) + " / 0x" + crc32.toString(16));
    }
    member.isize = isize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    if((inflated.length & 4294967295) !== isize) {
      throw new Error("invalid input size: " + (inflated.length & 4294967295) + " / " + isize);
    }
    this.member.push(member);
    this.ip = ip
  };
  Zlib.Gunzip.prototype.decodeSubField = function(ip, length) {
    return ip + length
  };
  Zlib.Gunzip.prototype.concatMember = function() {
    var member = this.member;
    var i;
    var il;
    var p = 0;
    var size = 0;
    var buffer;
    for(i = 0, il = member.length;i < il;++i) {
      size += member[i].data.length
    }
    if(USE_TYPEDARRAY) {
      buffer = new Uint8Array(size);
      for(i = 0;i < il;++i) {
        buffer.set(member[i].data, p);
        p += member[i].data.length
      }
    }else {
      buffer = [];
      for(i = 0;i < il;++i) {
        buffer[i] = member[i].data
      }
      buffer = Array.prototype.concat.apply([], buffer)
    }
    return buffer
  }
});
goog.provide("Zlib.RawInflateStream");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib.Huffman");
var ZLIB_STREAM_RAW_INFLATE_BUFFER_SIZE = 32768;
goog.scope(function() {
  var buildHuffmanTable = Zlib.Huffman.buildHuffmanTable;
  Zlib.RawInflateStream = function(input, ip, opt_buffersize) {
    this.buffer;
    this.blocks = [];
    this.bufferSize = opt_buffersize ? opt_buffersize : ZLIB_STREAM_RAW_INFLATE_BUFFER_SIZE;
    this.totalpos = 0;
    this.ip = ip === void 0 ? 0 : ip;
    this.bitsbuf = 0;
    this.bitsbuflen = 0;
    this.input = USE_TYPEDARRAY ? new Uint8Array(input) : input;
    this.output = new (USE_TYPEDARRAY ? Uint8Array : Array)(this.bufferSize);
    this.op = 0;
    this.bfinal = false;
    this.blockLength;
    this.resize = false;
    this.litlenTable;
    this.distTable;
    this.sp = 0;
    this.status = Zlib.RawInflateStream.Status.INITIALIZED;
    this.prev;
    this.ip_;
    this.bitsbuflen_;
    this.bitsbuf_
  };
  Zlib.RawInflateStream.BlockType = {UNCOMPRESSED:0, FIXED:1, DYNAMIC:2};
  Zlib.RawInflateStream.Status = {INITIALIZED:0, BLOCK_HEADER_START:1, BLOCK_HEADER_END:2, BLOCK_BODY_START:3, BLOCK_BODY_END:4, DECODE_BLOCK_START:5, DECODE_BLOCK_END:6};
  Zlib.RawInflateStream.prototype.decompress = function(newInput, ip) {
    var stop = false;
    if(newInput !== void 0) {
      this.input = newInput
    }
    if(ip !== void 0) {
      this.ip = ip
    }
    while(!stop) {
      switch(this.status) {
        case Zlib.RawInflateStream.Status.INITIALIZED:
        ;
        case Zlib.RawInflateStream.Status.BLOCK_HEADER_START:
          if(this.readBlockHeader() < 0) {
            stop = true
          }
          break;
        case Zlib.RawInflateStream.Status.BLOCK_HEADER_END:
        ;
        case Zlib.RawInflateStream.Status.BLOCK_BODY_START:
          switch(this.currentBlockType) {
            case Zlib.RawInflateStream.BlockType.UNCOMPRESSED:
              if(this.readUncompressedBlockHeader() < 0) {
                stop = true
              }
              break;
            case Zlib.RawInflateStream.BlockType.FIXED:
              if(this.parseFixedHuffmanBlock() < 0) {
                stop = true
              }
              break;
            case Zlib.RawInflateStream.BlockType.DYNAMIC:
              if(this.parseDynamicHuffmanBlock() < 0) {
                stop = true
              }
              break
          }
          break;
        case Zlib.RawInflateStream.Status.BLOCK_BODY_END:
        ;
        case Zlib.RawInflateStream.Status.DECODE_BLOCK_START:
          switch(this.currentBlockType) {
            case Zlib.RawInflateStream.BlockType.UNCOMPRESSED:
              if(this.parseUncompressedBlock() < 0) {
                stop = true
              }
              break;
            case Zlib.RawInflateStream.BlockType.FIXED:
            ;
            case Zlib.RawInflateStream.BlockType.DYNAMIC:
              if(this.decodeHuffman() < 0) {
                stop = true
              }
              break
          }
          break;
        case Zlib.RawInflateStream.Status.DECODE_BLOCK_END:
          if(this.bfinal) {
            stop = true
          }else {
            this.status = Zlib.RawInflateStream.Status.INITIALIZED
          }
          break
      }
    }
    return this.concatBuffer()
  };
  Zlib.RawInflateStream.MaxBackwardLength = 32768;
  Zlib.RawInflateStream.MaxCopyLength = 258;
  Zlib.RawInflateStream.Order = function(table) {
    return USE_TYPEDARRAY ? new Uint16Array(table) : table
  }([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
  Zlib.RawInflateStream.LengthCodeTable = function(table) {
    return USE_TYPEDARRAY ? new Uint16Array(table) : table
  }([3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 258, 258]);
  Zlib.RawInflateStream.LengthExtraTable = function(table) {
    return USE_TYPEDARRAY ? new Uint8Array(table) : table
  }([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0]);
  Zlib.RawInflateStream.DistCodeTable = function(table) {
    return USE_TYPEDARRAY ? new Uint16Array(table) : table
  }([1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577]);
  Zlib.RawInflateStream.DistExtraTable = function(table) {
    return USE_TYPEDARRAY ? new Uint8Array(table) : table
  }([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]);
  Zlib.RawInflateStream.FixedLiteralLengthTable = function(table) {
    return table
  }(function() {
    var lengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(288);
    var i, il;
    for(i = 0, il = lengths.length;i < il;++i) {
      lengths[i] = i <= 143 ? 8 : i <= 255 ? 9 : i <= 279 ? 7 : 8
    }
    return buildHuffmanTable(lengths)
  }());
  Zlib.RawInflateStream.FixedDistanceTable = function(table) {
    return table
  }(function() {
    var lengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(30);
    var i, il;
    for(i = 0, il = lengths.length;i < il;++i) {
      lengths[i] = 5
    }
    return buildHuffmanTable(lengths)
  }());
  Zlib.RawInflateStream.prototype.readBlockHeader = function() {
    var hdr;
    this.status = Zlib.RawInflateStream.Status.BLOCK_HEADER_START;
    this.save_();
    if((hdr = this.readBits(3)) < 0) {
      this.restore_();
      return-1
    }
    if(hdr & 1) {
      this.bfinal = true
    }
    hdr >>>= 1;
    switch(hdr) {
      case 0:
        this.currentBlockType = Zlib.RawInflateStream.BlockType.UNCOMPRESSED;
        break;
      case 1:
        this.currentBlockType = Zlib.RawInflateStream.BlockType.FIXED;
        break;
      case 2:
        this.currentBlockType = Zlib.RawInflateStream.BlockType.DYNAMIC;
        break;
      default:
        throw new Error("unknown BTYPE: " + hdr);
    }
    this.status = Zlib.RawInflateStream.Status.BLOCK_HEADER_END
  };
  Zlib.RawInflateStream.prototype.readBits = function(length) {
    var bitsbuf = this.bitsbuf;
    var bitsbuflen = this.bitsbuflen;
    var input = this.input;
    var ip = this.ip;
    var octet;
    while(bitsbuflen < length) {
      if(input.length <= ip) {
        return-1
      }
      octet = input[ip++];
      bitsbuf |= octet << bitsbuflen;
      bitsbuflen += 8
    }
    octet = bitsbuf & (1 << length) - 1;
    bitsbuf >>>= length;
    bitsbuflen -= length;
    this.bitsbuf = bitsbuf;
    this.bitsbuflen = bitsbuflen;
    this.ip = ip;
    return octet
  };
  Zlib.RawInflateStream.prototype.readCodeByTable = function(table) {
    var bitsbuf = this.bitsbuf;
    var bitsbuflen = this.bitsbuflen;
    var input = this.input;
    var ip = this.ip;
    var codeTable = table[0];
    var maxCodeLength = table[1];
    var octet;
    var codeWithLength;
    var codeLength;
    while(bitsbuflen < maxCodeLength) {
      if(input.length <= ip) {
        return-1
      }
      octet = input[ip++];
      bitsbuf |= octet << bitsbuflen;
      bitsbuflen += 8
    }
    codeWithLength = codeTable[bitsbuf & (1 << maxCodeLength) - 1];
    codeLength = codeWithLength >>> 16;
    this.bitsbuf = bitsbuf >> codeLength;
    this.bitsbuflen = bitsbuflen - codeLength;
    this.ip = ip;
    return codeWithLength & 65535
  };
  Zlib.RawInflateStream.prototype.readUncompressedBlockHeader = function() {
    var len;
    var nlen;
    var input = this.input;
    var ip = this.ip;
    this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_START;
    if(ip + 4 >= input.length) {
      return-1
    }
    len = input[ip++] | input[ip++] << 8;
    nlen = input[ip++] | input[ip++] << 8;
    if(len === ~nlen) {
      throw new Error("invalid uncompressed block header: length verify");
    }
    this.bitsbuf = 0;
    this.bitsbuflen = 0;
    this.ip = ip;
    this.blockLength = len;
    this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_END
  };
  Zlib.RawInflateStream.prototype.parseUncompressedBlock = function() {
    var input = this.input;
    var ip = this.ip;
    var output = this.output;
    var op = this.op;
    var len = this.blockLength;
    this.status = Zlib.RawInflateStream.Status.DECODE_BLOCK_START;
    while(len--) {
      if(op === output.length) {
        output = this.expandBuffer({fixRatio:2})
      }
      if(ip >= input.length) {
        this.ip = ip;
        this.op = op;
        this.blockLength = len + 1;
        return-1
      }
      output[op++] = input[ip++]
    }
    if(len < 0) {
      this.status = Zlib.RawInflateStream.Status.DECODE_BLOCK_END
    }
    this.ip = ip;
    this.op = op;
    return 0
  };
  Zlib.RawInflateStream.prototype.parseFixedHuffmanBlock = function() {
    this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_START;
    this.litlenTable = Zlib.RawInflateStream.FixedLiteralLengthTable;
    this.distTable = Zlib.RawInflateStream.FixedDistanceTable;
    this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_END;
    return 0
  };
  Zlib.RawInflateStream.prototype.save_ = function() {
    this.ip_ = this.ip;
    this.bitsbuflen_ = this.bitsbuflen;
    this.bitsbuf_ = this.bitsbuf
  };
  Zlib.RawInflateStream.prototype.restore_ = function() {
    this.ip = this.ip_;
    this.bitsbuflen = this.bitsbuflen_;
    this.bitsbuf = this.bitsbuf_
  };
  Zlib.RawInflateStream.prototype.parseDynamicHuffmanBlock = function() {
    var hlit;
    var hdist;
    var hclen;
    var codeLengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(Zlib.RawInflateStream.Order.length);
    var codeLengthsTable;
    var litlenLengths;
    var distLengths;
    var i = 0;
    this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_START;
    this.save_();
    hlit = this.readBits(5) + 257;
    hdist = this.readBits(5) + 1;
    hclen = this.readBits(4) + 4;
    if(hlit < 0 || hdist < 0 || hclen < 0) {
      this.restore_();
      return-1
    }
    try {
      parseDynamicHuffmanBlockImpl.call(this)
    }catch(e) {
      this.restore_();
      return-1
    }
    function parseDynamicHuffmanBlockImpl() {
      var bits;
      for(i = 0;i < hclen;++i) {
        if((bits = this.readBits(3)) < 0) {
          throw new Error("not enough input");
        }
        codeLengths[Zlib.RawInflateStream.Order[i]] = bits
      }
      codeLengthsTable = buildHuffmanTable(codeLengths);
      function decode(num, table, lengths) {
        var code;
        var prev = this.prev;
        var repeat;
        var i;
        var bits;
        for(i = 0;i < num;) {
          code = this.readCodeByTable(table);
          if(code < 0) {
            throw new Error("not enough input");
          }
          switch(code) {
            case 16:
              if((bits = this.readBits(2)) < 0) {
                throw new Error("not enough input");
              }
              repeat = 3 + bits;
              while(repeat--) {
                lengths[i++] = prev
              }
              break;
            case 17:
              if((bits = this.readBits(3)) < 0) {
                throw new Error("not enough input");
              }
              repeat = 3 + bits;
              while(repeat--) {
                lengths[i++] = 0
              }
              prev = 0;
              break;
            case 18:
              if((bits = this.readBits(7)) < 0) {
                throw new Error("not enough input");
              }
              repeat = 11 + bits;
              while(repeat--) {
                lengths[i++] = 0
              }
              prev = 0;
              break;
            default:
              lengths[i++] = code;
              prev = code;
              break
          }
        }
        this.prev = prev;
        return lengths
      }
      litlenLengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(hlit);
      distLengths = new (USE_TYPEDARRAY ? Uint8Array : Array)(hdist);
      this.prev = 0;
      this.litlenTable = buildHuffmanTable(decode.call(this, hlit, codeLengthsTable, litlenLengths));
      this.distTable = buildHuffmanTable(decode.call(this, hdist, codeLengthsTable, distLengths))
    }
    this.status = Zlib.RawInflateStream.Status.BLOCK_BODY_END;
    return 0
  };
  Zlib.RawInflateStream.prototype.decodeHuffman = function() {
    var output = this.output;
    var op = this.op;
    var code;
    var ti;
    var codeDist;
    var codeLength;
    var litlen = this.litlenTable;
    var dist = this.distTable;
    var olength = output.length;
    var bits;
    this.status = Zlib.RawInflateStream.Status.DECODE_BLOCK_START;
    while(true) {
      this.save_();
      code = this.readCodeByTable(litlen);
      if(code < 0) {
        this.op = op;
        this.restore_();
        return-1
      }
      if(code === 256) {
        break
      }
      if(code < 256) {
        if(op === olength) {
          output = this.expandBuffer();
          olength = output.length
        }
        output[op++] = code;
        continue
      }
      ti = code - 257;
      codeLength = Zlib.RawInflateStream.LengthCodeTable[ti];
      if(Zlib.RawInflateStream.LengthExtraTable[ti] > 0) {
        bits = this.readBits(Zlib.RawInflateStream.LengthExtraTable[ti]);
        if(bits < 0) {
          this.op = op;
          this.restore_();
          return-1
        }
        codeLength += bits
      }
      code = this.readCodeByTable(dist);
      if(code < 0) {
        this.op = op;
        this.restore_();
        return-1
      }
      codeDist = Zlib.RawInflateStream.DistCodeTable[code];
      if(Zlib.RawInflateStream.DistExtraTable[code] > 0) {
        bits = this.readBits(Zlib.RawInflateStream.DistExtraTable[code]);
        if(bits < 0) {
          this.op = op;
          this.restore_();
          return-1
        }
        codeDist += bits
      }
      if(op + codeLength >= olength) {
        output = this.expandBuffer();
        olength = output.length
      }
      while(codeLength--) {
        output[op] = output[op++ - codeDist]
      }
      if(this.ip === this.input.length) {
        this.op = op;
        return-1
      }
    }
    while(this.bitsbuflen >= 8) {
      this.bitsbuflen -= 8;
      this.ip--
    }
    this.op = op;
    this.status = Zlib.RawInflateStream.Status.DECODE_BLOCK_END
  };
  Zlib.RawInflateStream.prototype.expandBuffer = function(opt_param) {
    var buffer;
    var ratio = this.input.length / this.ip + 1 | 0;
    var maxHuffCode;
    var newSize;
    var maxInflateSize;
    var input = this.input;
    var output = this.output;
    if(opt_param) {
      if(typeof opt_param.fixRatio === "number") {
        ratio = opt_param.fixRatio
      }
      if(typeof opt_param.addRatio === "number") {
        ratio += opt_param.addRatio
      }
    }
    if(ratio < 2) {
      maxHuffCode = (input.length - this.ip) / this.litlenTable[2];
      maxInflateSize = maxHuffCode / 2 * 258 | 0;
      newSize = maxInflateSize < output.length ? output.length + maxInflateSize : output.length << 1
    }else {
      newSize = output.length * ratio
    }
    if(USE_TYPEDARRAY) {
      buffer = new Uint8Array(newSize);
      buffer.set(output)
    }else {
      buffer = output
    }
    this.output = buffer;
    return this.output
  };
  Zlib.RawInflateStream.prototype.concatBuffer = function() {
    var buffer;
    var resize = this.resize;
    var op = this.op;
    if(resize) {
      if(USE_TYPEDARRAY) {
        buffer = new Uint8Array(op);
        buffer.set(this.output.subarray(this.sp, op))
      }else {
        buffer = this.output.slice(this.sp, op)
      }
    }else {
      buffer = USE_TYPEDARRAY ? this.output.subarray(this.sp, op) : this.output.slice(this.sp, op)
    }
    this.buffer = buffer;
    this.sp = op;
    return this.buffer
  };
  Zlib.RawInflateStream.prototype.getBytes = function() {
    return USE_TYPEDARRAY ? this.output.subarray(0, this.op) : this.output.slice(0, this.op)
  }
});
goog.provide("Zlib.Util");
goog.scope(function() {
  Zlib.Util.stringToByteArray = function(str) {
    var tmp = str.split("");
    var i;
    var il;
    for(i = 0, il = tmp.length;i < il;i++) {
      tmp[i] = (tmp[i].charCodeAt(0) & 255) >>> 0
    }
    return tmp
  }
});
goog.provide("Zlib.Adler32");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib.Util");
goog.scope(function() {
  Zlib.Adler32 = function(array) {
    if(typeof array === "string") {
      array = Zlib.Util.stringToByteArray(array)
    }
    return Zlib.Adler32.update(1, array)
  };
  Zlib.Adler32.update = function(adler, array) {
    var s1 = adler & 65535;
    var s2 = adler >>> 16 & 65535;
    var len = array.length;
    var tlen;
    var i = 0;
    while(len > 0) {
      tlen = len > Zlib.Adler32.OptimizationParameter ? Zlib.Adler32.OptimizationParameter : len;
      len -= tlen;
      do {
        s1 += array[i++];
        s2 += s1
      }while(--tlen);
      s1 %= 65521;
      s2 %= 65521
    }
    return(s2 << 16 | s1) >>> 0
  };
  Zlib.Adler32.OptimizationParameter = 1024
});
goog.provide("Zlib.Inflate");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib.Adler32");
goog.require("Zlib.RawInflate");
goog.scope(function() {
  Zlib.Inflate = function(input, opt_params) {
    var bufferSize;
    var bufferType;
    var cmf;
    var flg;
    this.input = input;
    this.ip = 0;
    this.rawinflate;
    this.verify;
    if(opt_params || !(opt_params = {})) {
      if(opt_params["index"]) {
        this.ip = opt_params["index"]
      }
      if(opt_params["verify"]) {
        this.verify = opt_params["verify"]
      }
    }
    cmf = input[this.ip++];
    flg = input[this.ip++];
    switch(cmf & 15) {
      case Zlib.CompressionMethod.DEFLATE:
        this.method = Zlib.CompressionMethod.DEFLATE;
        break;
      default:
        throw new Error("unsupported compression method");
    }
    if(((cmf << 8) + flg) % 31 !== 0) {
      throw new Error("invalid fcheck flag:" + ((cmf << 8) + flg) % 31);
    }
    if(flg & 32) {
      throw new Error("fdict flag is not supported");
    }
    this.rawinflate = new Zlib.RawInflate(input, {"index":this.ip, "bufferSize":opt_params["bufferSize"], "bufferType":opt_params["bufferType"], "resize":opt_params["resize"]})
  };
  Zlib.Inflate.BufferType = Zlib.RawInflate.BufferType;
  Zlib.Inflate.prototype.decompress = function() {
    var input = this.input;
    var buffer;
    var adler32;
    buffer = this.rawinflate.decompress();
    this.ip = this.rawinflate.ip;
    if(this.verify) {
      adler32 = (input[this.ip++] << 24 | input[this.ip++] << 16 | input[this.ip++] << 8 | input[this.ip++]) >>> 0;
      if(adler32 !== Zlib.Adler32(buffer)) {
        throw new Error("invalid adler-32 checksum");
      }
    }
    return buffer
  }
});
goog.provide("Zlib.Zip");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib.RawDeflate");
goog.require("Zlib.CRC32");
goog.scope(function() {
  Zlib.Zip = function(opt_params) {
    opt_params = opt_params || {};
    this.files = [];
    this.comment = opt_params["comment"];
    this.password
  };
  Zlib.Zip.CompressionMethod = {STORE:0, DEFLATE:8};
  Zlib.Zip.OperatingSystem = {MSDOS:0, UNIX:3, MACINTOSH:7};
  Zlib.Zip.Flags = {ENCRYPT:1, DESCRIPTOR:8, UTF8:2048};
  Zlib.Zip.FileHeaderSignature = [80, 75, 1, 2];
  Zlib.Zip.LocalFileHeaderSignature = [80, 75, 3, 4];
  Zlib.Zip.CentralDirectorySignature = [80, 75, 5, 6];
  Zlib.Zip.prototype.addFile = function(input, opt_params) {
    opt_params = opt_params || {};
    var filename = "" || opt_params["filename"];
    var compressed;
    var size = input.length;
    var crc32 = 0;
    if(USE_TYPEDARRAY && input instanceof Array) {
      input = new Uint8Array(input)
    }
    if(typeof opt_params["compressionMethod"] !== "number") {
      opt_params["compressionMethod"] = Zlib.Zip.CompressionMethod.DEFLATE
    }
    if(opt_params["compress"]) {
      switch(opt_params["compressionMethod"]) {
        case Zlib.Zip.CompressionMethod.STORE:
          break;
        case Zlib.Zip.CompressionMethod.DEFLATE:
          crc32 = Zlib.CRC32.calc(input);
          input = this.deflateWithOption(input, opt_params);
          compressed = true;
          break;
        default:
          throw new Error("unknown compression method:" + opt_params["compressionMethod"]);
      }
    }
    this.files.push({buffer:input, option:opt_params, compressed:compressed, encrypted:false, size:size, crc32:crc32})
  };
  Zlib.Zip.prototype.setPassword = function(password) {
    this.password = password
  };
  Zlib.Zip.prototype.compress = function() {
    var files = this.files;
    var file;
    var output;
    var op1;
    var op2;
    var op3;
    var localFileSize = 0;
    var centralDirectorySize = 0;
    var endOfCentralDirectorySize;
    var offset;
    var needVersion;
    var flags;
    var compressionMethod;
    var date;
    var crc32;
    var size;
    var plainSize;
    var filenameLength;
    var extraFieldLength;
    var commentLength;
    var filename;
    var extraField;
    var comment;
    var buffer;
    var tmp;
    var key;
    var i;
    var il;
    var j;
    var jl;
    for(i = 0, il = files.length;i < il;++i) {
      file = files[i];
      filenameLength = file.option["filename"] ? file.option["filename"].length : 0;
      extraFieldLength = file.option["extraField"] ? file.option["extraField"].length : 0;
      commentLength = file.option["comment"] ? file.option["comment"].length : 0;
      if(!file.compressed) {
        file.crc32 = Zlib.CRC32.calc(file.buffer);
        switch(file.option["compressionMethod"]) {
          case Zlib.Zip.CompressionMethod.STORE:
            break;
          case Zlib.Zip.CompressionMethod.DEFLATE:
            file.buffer = this.deflateWithOption(file.buffer, file.option);
            file.compressed = true;
            break;
          default:
            throw new Error("unknown compression method:" + file.option["compressionMethod"]);
        }
      }
      if(file.option["password"] !== void 0 || this.password !== void 0) {
        key = this.createEncryptionKey(file.option["password"] || this.password);
        buffer = file.buffer;
        if(USE_TYPEDARRAY) {
          tmp = new Uint8Array(buffer.length + 12);
          tmp.set(buffer, 12);
          buffer = tmp
        }else {
          buffer.unshift(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
        }
        for(j = 0;j < 12;++j) {
          buffer[j] = this.encode(key, i === 11 ? file.crc32 & 255 : Math.random() * 256 | 0)
        }
        for(jl = buffer.length;j < jl;++j) {
          buffer[j] = this.encode(key, buffer[j])
        }
        file.buffer = buffer
      }
      localFileSize += 30 + filenameLength + file.buffer.length;
      centralDirectorySize += 46 + filenameLength + commentLength
    }
    endOfCentralDirectorySize = 46 + (this.comment ? this.comment.length : 0);
    output = new (USE_TYPEDARRAY ? Uint8Array : Array)(localFileSize + centralDirectorySize + endOfCentralDirectorySize);
    op1 = 0;
    op2 = localFileSize;
    op3 = op2 + centralDirectorySize;
    for(i = 0, il = files.length;i < il;++i) {
      file = files[i];
      filenameLength = file.option["filename"] ? file.option["filename"].length : 0;
      extraFieldLength = 0;
      commentLength = file.option["comment"] ? file.option["comment"].length : 0;
      offset = op1;
      output[op1++] = Zlib.Zip.LocalFileHeaderSignature[0];
      output[op1++] = Zlib.Zip.LocalFileHeaderSignature[1];
      output[op1++] = Zlib.Zip.LocalFileHeaderSignature[2];
      output[op1++] = Zlib.Zip.LocalFileHeaderSignature[3];
      output[op2++] = Zlib.Zip.FileHeaderSignature[0];
      output[op2++] = Zlib.Zip.FileHeaderSignature[1];
      output[op2++] = Zlib.Zip.FileHeaderSignature[2];
      output[op2++] = Zlib.Zip.FileHeaderSignature[3];
      needVersion = 20;
      output[op2++] = needVersion & 255;
      output[op2++] = (file.option["os"]) || Zlib.Zip.OperatingSystem.MSDOS;
      output[op1++] = output[op2++] = needVersion & 255;
      output[op1++] = output[op2++] = needVersion >> 8 & 255;
      flags = 0;
      if(file.option["password"] || this.password) {
        flags |= Zlib.Zip.Flags.ENCRYPT
      }
      output[op1++] = output[op2++] = flags & 255;
      output[op1++] = output[op2++] = flags >> 8 & 255;
      compressionMethod = (file.option["compressionMethod"]);
      output[op1++] = output[op2++] = compressionMethod & 255;
      output[op1++] = output[op2++] = compressionMethod >> 8 & 255;
      date = (file.option["date"]) || new Date;
      output[op1++] = output[op2++] = (date.getMinutes() & 7) << 5 | date.getSeconds() / 2 | 0;
      output[op1++] = output[op2++] = date.getHours() << 3 | date.getMinutes() >> 3;
      output[op1++] = output[op2++] = (date.getMonth() + 1 & 7) << 5 | date.getDate();
      output[op1++] = output[op2++] = (date.getFullYear() - 1980 & 127) << 1 | date.getMonth() + 1 >> 3;
      crc32 = file.crc32;
      output[op1++] = output[op2++] = crc32 & 255;
      output[op1++] = output[op2++] = crc32 >> 8 & 255;
      output[op1++] = output[op2++] = crc32 >> 16 & 255;
      output[op1++] = output[op2++] = crc32 >> 24 & 255;
      size = file.buffer.length;
      output[op1++] = output[op2++] = size & 255;
      output[op1++] = output[op2++] = size >> 8 & 255;
      output[op1++] = output[op2++] = size >> 16 & 255;
      output[op1++] = output[op2++] = size >> 24 & 255;
      plainSize = file.size;
      output[op1++] = output[op2++] = plainSize & 255;
      output[op1++] = output[op2++] = plainSize >> 8 & 255;
      output[op1++] = output[op2++] = plainSize >> 16 & 255;
      output[op1++] = output[op2++] = plainSize >> 24 & 255;
      output[op1++] = output[op2++] = filenameLength & 255;
      output[op1++] = output[op2++] = filenameLength >> 8 & 255;
      output[op1++] = output[op2++] = extraFieldLength & 255;
      output[op1++] = output[op2++] = extraFieldLength >> 8 & 255;
      output[op2++] = commentLength & 255;
      output[op2++] = commentLength >> 8 & 255;
      output[op2++] = 0;
      output[op2++] = 0;
      output[op2++] = 0;
      output[op2++] = 0;
      output[op2++] = 0;
      output[op2++] = 0;
      output[op2++] = 0;
      output[op2++] = 0;
      output[op2++] = offset & 255;
      output[op2++] = offset >> 8 & 255;
      output[op2++] = offset >> 16 & 255;
      output[op2++] = offset >> 24 & 255;
      filename = file.option["filename"];
      if(filename) {
        if(USE_TYPEDARRAY) {
          output.set(filename, op1);
          output.set(filename, op2);
          op1 += filenameLength;
          op2 += filenameLength
        }else {
          for(j = 0;j < filenameLength;++j) {
            output[op1++] = output[op2++] = filename[j]
          }
        }
      }
      extraField = file.option["extraField"];
      if(extraField) {
        if(USE_TYPEDARRAY) {
          output.set(extraField, op1);
          output.set(extraField, op2);
          op1 += extraFieldLength;
          op2 += extraFieldLength
        }else {
          for(j = 0;j < commentLength;++j) {
            output[op1++] = output[op2++] = extraField[j]
          }
        }
      }
      comment = file.option["comment"];
      if(comment) {
        if(USE_TYPEDARRAY) {
          output.set(comment, op2);
          op2 += commentLength
        }else {
          for(j = 0;j < commentLength;++j) {
            output[op2++] = comment[j]
          }
        }
      }
      if(USE_TYPEDARRAY) {
        output.set(file.buffer, op1);
        op1 += file.buffer.length
      }else {
        for(j = 0, jl = file.buffer.length;j < jl;++j) {
          output[op1++] = file.buffer[j]
        }
      }
    }
    output[op3++] = Zlib.Zip.CentralDirectorySignature[0];
    output[op3++] = Zlib.Zip.CentralDirectorySignature[1];
    output[op3++] = Zlib.Zip.CentralDirectorySignature[2];
    output[op3++] = Zlib.Zip.CentralDirectorySignature[3];
    output[op3++] = 0;
    output[op3++] = 0;
    output[op3++] = 0;
    output[op3++] = 0;
    output[op3++] = il & 255;
    output[op3++] = il >> 8 & 255;
    output[op3++] = il & 255;
    output[op3++] = il >> 8 & 255;
    output[op3++] = centralDirectorySize & 255;
    output[op3++] = centralDirectorySize >> 8 & 255;
    output[op3++] = centralDirectorySize >> 16 & 255;
    output[op3++] = centralDirectorySize >> 24 & 255;
    output[op3++] = localFileSize & 255;
    output[op3++] = localFileSize >> 8 & 255;
    output[op3++] = localFileSize >> 16 & 255;
    output[op3++] = localFileSize >> 24 & 255;
    commentLength = this.comment ? this.comment.length : 0;
    output[op3++] = commentLength & 255;
    output[op3++] = commentLength >> 8 & 255;
    if(this.comment) {
      if(USE_TYPEDARRAY) {
        output.set(this.comment, op3);
        op3 += commentLength
      }else {
        for(j = 0, jl = commentLength;j < jl;++j) {
          output[op3++] = this.comment[j]
        }
      }
    }
    return output
  };
  Zlib.Zip.prototype.deflateWithOption = function(input, opt_params) {
    var deflator = new Zlib.RawDeflate(input, opt_params["deflateOption"]);
    return deflator.compress()
  };
  Zlib.Zip.prototype.getByte = function(key) {
    var tmp = key[2] & 65535 | 2;
    return tmp * (tmp ^ 1) >> 8 & 255
  };
  Zlib.Zip.prototype.encode = function(key, n) {
    var tmp = this.getByte((key));
    this.updateKeys((key), n);
    return tmp ^ n
  };
  Zlib.Zip.prototype.updateKeys = function(key, n) {
    key[0] = Zlib.CRC32.single(key[0], n);
    key[1] = (((key[1] + (key[0] & 255)) * 20173 >>> 0) * 6681 >>> 0) + 1 >>> 0;
    key[2] = Zlib.CRC32.single(key[2], key[1] >>> 24)
  };
  Zlib.Zip.prototype.createEncryptionKey = function(password) {
    var key = [305419896, 591751049, 878082192];
    var i;
    var il;
    if(USE_TYPEDARRAY) {
      key = new Uint32Array(key)
    }
    for(i = 0, il = password.length;i < il;++i) {
      this.updateKeys(key, password[i] & 255)
    }
    return key
  }
});
goog.provide("Zlib.Unzip");
goog.require("USE_TYPEDARRAY");
goog.require("FixPhantomJSFunctionApplyBug_StringFromCharCode");
goog.require("Zlib.RawInflate");
goog.require("Zlib.CRC32");
goog.require("Zlib.Zip");
goog.scope(function() {
  Zlib.Unzip = function(input, opt_params) {
    opt_params = opt_params || {};
    this.input = USE_TYPEDARRAY && input instanceof Array ? new Uint8Array(input) : input;
    this.ip = 0;
    this.eocdrOffset;
    this.numberOfThisDisk;
    this.startDisk;
    this.totalEntriesThisDisk;
    this.totalEntries;
    this.centralDirectorySize;
    this.centralDirectoryOffset;
    this.commentLength;
    this.comment;
    this.fileHeaderList;
    this.filenameToIndex;
    this.verify = opt_params["verify"] || false;
    this.password = opt_params["password"]
  };
  Zlib.Unzip.CompressionMethod = Zlib.Zip.CompressionMethod;
  Zlib.Unzip.FileHeaderSignature = Zlib.Zip.FileHeaderSignature;
  Zlib.Unzip.LocalFileHeaderSignature = Zlib.Zip.LocalFileHeaderSignature;
  Zlib.Unzip.CentralDirectorySignature = Zlib.Zip.CentralDirectorySignature;
  Zlib.Unzip.FileHeader = function(input, ip) {
    this.input = input;
    this.offset = ip;
    this.length;
    this.version;
    this.os;
    this.needVersion;
    this.flags;
    this.compression;
    this.time;
    this.date;
    this.crc32;
    this.compressedSize;
    this.plainSize;
    this.fileNameLength;
    this.extraFieldLength;
    this.fileCommentLength;
    this.diskNumberStart;
    this.internalFileAttributes;
    this.externalFileAttributes;
    this.relativeOffset;
    this.filename;
    this.extraField;
    this.comment
  };
  Zlib.Unzip.FileHeader.prototype.parse = function() {
    var input = this.input;
    var ip = this.offset;
    if(input[ip++] !== Zlib.Unzip.FileHeaderSignature[0] || input[ip++] !== Zlib.Unzip.FileHeaderSignature[1] || input[ip++] !== Zlib.Unzip.FileHeaderSignature[2] || input[ip++] !== Zlib.Unzip.FileHeaderSignature[3]) {
      throw new Error("invalid file header signature");
    }
    this.version = input[ip++];
    this.os = input[ip++];
    this.needVersion = input[ip++] | input[ip++] << 8;
    this.flags = input[ip++] | input[ip++] << 8;
    this.compression = input[ip++] | input[ip++] << 8;
    this.time = input[ip++] | input[ip++] << 8;
    this.date = input[ip++] | input[ip++] << 8;
    this.crc32 = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.compressedSize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.plainSize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.fileNameLength = input[ip++] | input[ip++] << 8;
    this.extraFieldLength = input[ip++] | input[ip++] << 8;
    this.fileCommentLength = input[ip++] | input[ip++] << 8;
    this.diskNumberStart = input[ip++] | input[ip++] << 8;
    this.internalFileAttributes = input[ip++] | input[ip++] << 8;
    this.externalFileAttributes = input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24;
    this.relativeOffset = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.filename = String.fromCharCode.apply(null, USE_TYPEDARRAY ? input.subarray(ip, ip += this.fileNameLength) : input.slice(ip, ip += this.fileNameLength));
    this.extraField = USE_TYPEDARRAY ? input.subarray(ip, ip += this.extraFieldLength) : input.slice(ip, ip += this.extraFieldLength);
    this.comment = USE_TYPEDARRAY ? input.subarray(ip, ip + this.fileCommentLength) : input.slice(ip, ip + this.fileCommentLength);
    this.length = ip - this.offset
  };
  Zlib.Unzip.LocalFileHeader = function(input, ip) {
    this.input = input;
    this.offset = ip;
    this.length;
    this.needVersion;
    this.flags;
    this.compression;
    this.time;
    this.date;
    this.crc32;
    this.compressedSize;
    this.plainSize;
    this.fileNameLength;
    this.extraFieldLength;
    this.filename;
    this.extraField
  };
  Zlib.Unzip.LocalFileHeader.Flags = Zlib.Zip.Flags;
  Zlib.Unzip.LocalFileHeader.prototype.parse = function() {
    var input = this.input;
    var ip = this.offset;
    if(input[ip++] !== Zlib.Unzip.LocalFileHeaderSignature[0] || input[ip++] !== Zlib.Unzip.LocalFileHeaderSignature[1] || input[ip++] !== Zlib.Unzip.LocalFileHeaderSignature[2] || input[ip++] !== Zlib.Unzip.LocalFileHeaderSignature[3]) {
      throw new Error("invalid local file header signature");
    }
    this.needVersion = input[ip++] | input[ip++] << 8;
    this.flags = input[ip++] | input[ip++] << 8;
    this.compression = input[ip++] | input[ip++] << 8;
    this.time = input[ip++] | input[ip++] << 8;
    this.date = input[ip++] | input[ip++] << 8;
    this.crc32 = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.compressedSize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.plainSize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.fileNameLength = input[ip++] | input[ip++] << 8;
    this.extraFieldLength = input[ip++] | input[ip++] << 8;
    this.filename = String.fromCharCode.apply(null, USE_TYPEDARRAY ? input.subarray(ip, ip += this.fileNameLength) : input.slice(ip, ip += this.fileNameLength));
    this.extraField = USE_TYPEDARRAY ? input.subarray(ip, ip += this.extraFieldLength) : input.slice(ip, ip += this.extraFieldLength);
    this.length = ip - this.offset
  };
  Zlib.Unzip.prototype.searchEndOfCentralDirectoryRecord = function() {
    var input = this.input;
    var ip;
    for(ip = input.length - 12;ip > 0;--ip) {
      if(input[ip] === Zlib.Unzip.CentralDirectorySignature[0] && input[ip + 1] === Zlib.Unzip.CentralDirectorySignature[1] && input[ip + 2] === Zlib.Unzip.CentralDirectorySignature[2] && input[ip + 3] === Zlib.Unzip.CentralDirectorySignature[3]) {
        this.eocdrOffset = ip;
        return
      }
    }
    throw new Error("End of Central Directory Record not found");
  };
  Zlib.Unzip.prototype.parseEndOfCentralDirectoryRecord = function() {
    var input = this.input;
    var ip;
    if(!this.eocdrOffset) {
      this.searchEndOfCentralDirectoryRecord()
    }
    ip = this.eocdrOffset;
    if(input[ip++] !== Zlib.Unzip.CentralDirectorySignature[0] || input[ip++] !== Zlib.Unzip.CentralDirectorySignature[1] || input[ip++] !== Zlib.Unzip.CentralDirectorySignature[2] || input[ip++] !== Zlib.Unzip.CentralDirectorySignature[3]) {
      throw new Error("invalid signature");
    }
    this.numberOfThisDisk = input[ip++] | input[ip++] << 8;
    this.startDisk = input[ip++] | input[ip++] << 8;
    this.totalEntriesThisDisk = input[ip++] | input[ip++] << 8;
    this.totalEntries = input[ip++] | input[ip++] << 8;
    this.centralDirectorySize = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.centralDirectoryOffset = (input[ip++] | input[ip++] << 8 | input[ip++] << 16 | input[ip++] << 24) >>> 0;
    this.commentLength = input[ip++] | input[ip++] << 8;
    this.comment = USE_TYPEDARRAY ? input.subarray(ip, ip + this.commentLength) : input.slice(ip, ip + this.commentLength)
  };
  Zlib.Unzip.prototype.parseFileHeader = function() {
    var filelist = [];
    var filetable = {};
    var ip;
    var fileHeader;
    var i;
    var il;
    if(this.fileHeaderList) {
      return
    }
    if(this.centralDirectoryOffset === void 0) {
      this.parseEndOfCentralDirectoryRecord()
    }
    ip = this.centralDirectoryOffset;
    for(i = 0, il = this.totalEntries;i < il;++i) {
      fileHeader = new Zlib.Unzip.FileHeader(this.input, ip);
      fileHeader.parse();
      ip += fileHeader.length;
      filelist[i] = fileHeader;
      filetable[fileHeader.filename] = i
    }
    if(this.centralDirectorySize < ip - this.centralDirectoryOffset) {
      throw new Error("invalid file header size");
    }
    this.fileHeaderList = filelist;
    this.filenameToIndex = filetable
  };
  Zlib.Unzip.prototype.getFileData = function(index, opt_params) {
    opt_params = opt_params || {};
    var input = this.input;
    var fileHeaderList = this.fileHeaderList;
    var localFileHeader;
    var offset;
    var length;
    var buffer;
    var crc32;
    var key;
    var i;
    var il;
    if(!fileHeaderList) {
      this.parseFileHeader()
    }
    if(fileHeaderList[index] === void 0) {
      throw new Error("wrong index");
    }
    offset = fileHeaderList[index].relativeOffset;
    localFileHeader = new Zlib.Unzip.LocalFileHeader(this.input, offset);
    localFileHeader.parse();
    offset += localFileHeader.length;
    length = localFileHeader.compressedSize;
    if((localFileHeader.flags & Zlib.Unzip.LocalFileHeader.Flags.ENCRYPT) !== 0) {
      if(!(opt_params["password"] || this.password)) {
        throw new Error("please set password");
      }
      key = this.createDecryptionKey(opt_params["password"] || this.password);
      for(i = offset, il = offset + 12;i < il;++i) {
        this.decode(key, input[i])
      }
      offset += 12;
      length -= 12;
      for(i = offset, il = offset + length;i < il;++i) {
        input[i] = this.decode(key, input[i])
      }
    }
    switch(localFileHeader.compression) {
      case Zlib.Unzip.CompressionMethod.STORE:
        buffer = USE_TYPEDARRAY ? this.input.subarray(offset, offset + length) : this.input.slice(offset, offset + length);
        break;
      case Zlib.Unzip.CompressionMethod.DEFLATE:
        buffer = (new Zlib.RawInflate(this.input, {"index":offset, "bufferSize":localFileHeader.plainSize})).decompress();
        break;
      default:
        throw new Error("unknown compression type");
    }
    if(this.verify) {
      crc32 = Zlib.CRC32.calc(buffer);
      if(localFileHeader.crc32 !== crc32) {
        throw new Error("wrong crc: file=0x" + localFileHeader.crc32.toString(16) + ", data=0x" + crc32.toString(16));
      }
    }
    return buffer
  };
  Zlib.Unzip.prototype.getFilenames = function() {
    var filenameList = [];
    var i;
    var il;
    var fileHeaderList;
    if(!this.fileHeaderList) {
      this.parseFileHeader()
    }
    fileHeaderList = this.fileHeaderList;
    for(i = 0, il = fileHeaderList.length;i < il;++i) {
      filenameList[i] = fileHeaderList[i].filename
    }
    return filenameList
  };
  Zlib.Unzip.prototype.decompress = function(filename, opt_params) {
    var index;
    if(!this.filenameToIndex) {
      this.parseFileHeader()
    }
    index = this.filenameToIndex[filename];
    if(index === void 0) {
      throw new Error(filename + " not found");
    }
    return this.getFileData(index, opt_params)
  };
  Zlib.Unzip.prototype.setPassword = function(password) {
    this.password = password
  };
  Zlib.Unzip.prototype.decode = function(key, n) {
    n ^= this.getByte((key));
    this.updateKeys((key), n);
    return n
  };
  Zlib.Unzip.prototype.updateKeys = Zlib.Zip.prototype.updateKeys;
  Zlib.Unzip.prototype.createDecryptionKey = Zlib.Zip.prototype.createEncryptionKey;
  Zlib.Unzip.prototype.getByte = Zlib.Zip.prototype.getByte
});
goog.provide("Zlib");
goog.scope(function() {
  Zlib.CompressionMethod = {DEFLATE:8, RESERVED:15}
});
goog.provide("Zlib.Deflate");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib");
goog.require("Zlib.Adler32");
goog.require("Zlib.RawDeflate");
goog.scope(function() {
  Zlib.Deflate = function(input, opt_params) {
    this.input = input;
    this.output = new (USE_TYPEDARRAY ? Uint8Array : Array)(Zlib.Deflate.DefaultBufferSize);
    this.compressionType = Zlib.Deflate.CompressionType.DYNAMIC;
    this.rawDeflate;
    var rawDeflateOption = {};
    var prop;
    if(opt_params || !(opt_params = {})) {
      if(typeof opt_params["compressionType"] === "number") {
        this.compressionType = opt_params["compressionType"]
      }
    }
    for(prop in opt_params) {
      rawDeflateOption[prop] = opt_params[prop]
    }
    rawDeflateOption["outputBuffer"] = this.output;
    this.rawDeflate = new Zlib.RawDeflate(this.input, rawDeflateOption)
  };
  Zlib.Deflate.DefaultBufferSize = 32768;
  Zlib.Deflate.CompressionType = Zlib.RawDeflate.CompressionType;
  Zlib.Deflate.compress = function(input, opt_params) {
    return(new Zlib.Deflate(input, opt_params)).compress()
  };
  Zlib.Deflate.prototype.compress = function() {
    var cm;
    var cinfo;
    var cmf;
    var flg;
    var fcheck;
    var fdict;
    var flevel;
    var clevel;
    var adler;
    var error = false;
    var output;
    var pos = 0;
    output = this.output;
    cm = Zlib.CompressionMethod.DEFLATE;
    switch(cm) {
      case Zlib.CompressionMethod.DEFLATE:
        cinfo = Math.LOG2E * Math.log(Zlib.RawDeflate.WindowSize) - 8;
        break;
      default:
        throw new Error("invalid compression method");
    }
    cmf = cinfo << 4 | cm;
    output[pos++] = cmf;
    fdict = 0;
    switch(cm) {
      case Zlib.CompressionMethod.DEFLATE:
        switch(this.compressionType) {
          case Zlib.Deflate.CompressionType.NONE:
            flevel = 0;
            break;
          case Zlib.Deflate.CompressionType.FIXED:
            flevel = 1;
            break;
          case Zlib.Deflate.CompressionType.DYNAMIC:
            flevel = 2;
            break;
          default:
            throw new Error("unsupported compression type");
        }
        break;
      default:
        throw new Error("invalid compression method");
    }
    flg = flevel << 6 | fdict << 5;
    fcheck = 31 - (cmf * 256 + flg) % 31;
    flg |= fcheck;
    output[pos++] = flg;
    adler = Zlib.Adler32(this.input);
    this.rawDeflate.op = pos;
    output = this.rawDeflate.compress();
    pos = output.length;
    if(USE_TYPEDARRAY) {
      output = new Uint8Array(output.buffer);
      if(output.length <= pos + 4) {
        this.output = new Uint8Array(output.length + 4);
        this.output.set(output);
        output = this.output
      }
      output = output.subarray(0, pos + 4)
    }
    output[pos++] = adler >> 24 & 255;
    output[pos++] = adler >> 16 & 255;
    output[pos++] = adler >> 8 & 255;
    output[pos++] = adler & 255;
    return output
  }
});
goog.provide("Zlib.exportObject");
goog.require("Zlib");
goog.scope(function() {
  Zlib.exportObject = function(enumString, exportKeyValue) {
    var keys;
    var key;
    var i;
    var il;
    if(Object.keys) {
      keys = Object.keys(exportKeyValue)
    }else {
      keys = [];
      i = 0;
      for(key in exportKeyValue) {
        keys[i++] = key
      }
    }
    for(i = 0, il = keys.length;i < il;++i) {
      key = keys[i];
      goog.exportSymbol(enumString + "." + key, exportKeyValue[key])
    }
  }
});
goog.provide("Zlib.InflateStream");
goog.require("USE_TYPEDARRAY");
goog.require("Zlib");
goog.require("Zlib.RawInflateStream");
goog.scope(function() {
  Zlib.InflateStream = function(input) {
    this.input = input === void 0 ? new (USE_TYPEDARRAY ? Uint8Array : Array) : input;
    this.ip = 0;
    this.rawinflate = new Zlib.RawInflateStream(this.input, this.ip);
    this.method;
    this.output = this.rawinflate.output
  };
  Zlib.InflateStream.prototype.decompress = function(input) {
    var buffer;
    var adler32;
    if(input !== void 0) {
      if(USE_TYPEDARRAY) {
        var tmp = new Uint8Array(this.input.length + input.length);
        tmp.set(this.input, 0);
        tmp.set(input, this.input.length);
        this.input = tmp
      }else {
        this.input = this.input.concat(input)
      }
    }
    if(this.method === void 0) {
      if(this.readHeader() < 0) {
        return new (USE_TYPEDARRAY ? Uint8Array : Array)
      }
    }
    buffer = this.rawinflate.decompress(this.input, this.ip);
    if(this.rawinflate.ip !== 0) {
      this.input = USE_TYPEDARRAY ? this.input.subarray(this.rawinflate.ip) : this.input.slice(this.rawinflate.ip);
      this.ip = 0
    }
    return buffer
  };
  Zlib.InflateStream.prototype.getBytes = function() {
    return this.rawinflate.getBytes()
  };
  Zlib.InflateStream.prototype.readHeader = function() {
    var ip = this.ip;
    var input = this.input;
    var cmf = input[ip++];
    var flg = input[ip++];
    if(cmf === void 0 || flg === void 0) {
      return-1
    }
    switch(cmf & 15) {
      case Zlib.CompressionMethod.DEFLATE:
        this.method = Zlib.CompressionMethod.DEFLATE;
        break;
      default:
        throw new Error("unsupported compression method");
    }
    if(((cmf << 8) + flg) % 31 !== 0) {
      throw new Error("invalid fcheck flag:" + ((cmf << 8) + flg) % 31);
    }
    if(flg & 32) {
      throw new Error("fdict flag is not supported");
    }
    this.ip = ip
  }
});
goog.require("Zlib.Adler32");
goog.exportSymbol("Zlib.Adler32", Zlib.Adler32);
goog.exportSymbol("Zlib.Adler32.update", Zlib.Adler32.update);
goog.require("Zlib.CRC32");
goog.exportSymbol("Zlib.CRC32", Zlib.CRC32);
goog.exportSymbol("Zlib.CRC32.calc", Zlib.CRC32.calc);
goog.exportSymbol("Zlib.CRC32.update", Zlib.CRC32.update);
goog.require("Zlib.Deflate");
goog.require("Zlib.exportObject");
goog.exportSymbol("Zlib.Deflate", Zlib.Deflate);
goog.exportSymbol("Zlib.Deflate.compress", Zlib.Deflate.compress);
goog.exportSymbol("Zlib.Deflate.prototype.compress", Zlib.Deflate.prototype.compress);
Zlib.exportObject("Zlib.Deflate.CompressionType", {"NONE":Zlib.Deflate.CompressionType.NONE, "FIXED":Zlib.Deflate.CompressionType.FIXED, "DYNAMIC":Zlib.Deflate.CompressionType.DYNAMIC});
goog.require("Zlib.Gunzip");
goog.exportSymbol("Zlib.Gunzip", Zlib.Gunzip);
goog.exportSymbol("Zlib.Gunzip.prototype.decompress", Zlib.Gunzip.prototype.decompress);
goog.exportSymbol("Zlib.Gunzip.prototype.getMembers", Zlib.Gunzip.prototype.getMembers);
goog.require("Zlib.GunzipMember");
goog.exportSymbol("Zlib.GunzipMember", Zlib.GunzipMember);
goog.exportSymbol("Zlib.GunzipMember.prototype.getName", Zlib.GunzipMember.prototype.getName);
goog.exportSymbol("Zlib.GunzipMember.prototype.getData", Zlib.GunzipMember.prototype.getData);
goog.exportSymbol("Zlib.GunzipMember.prototype.getMtime", Zlib.GunzipMember.prototype.getMtime);
goog.require("Zlib.Gzip");
goog.exportSymbol("Zlib.Gzip", Zlib.Gzip);
goog.exportSymbol("Zlib.Gzip.prototype.compress", Zlib.Gzip.prototype.compress);
goog.require("Zlib.Inflate");
goog.require("Zlib.exportObject");
goog.exportSymbol("Zlib.Inflate", Zlib.Inflate);
goog.exportSymbol("Zlib.Inflate.prototype.decompress", Zlib.Inflate.prototype.decompress);
Zlib.exportObject("Zlib.Inflate.BufferType", {"ADAPTIVE":Zlib.Inflate.BufferType.ADAPTIVE, "BLOCK":Zlib.Inflate.BufferType.BLOCK});
goog.require("Zlib.InflateStream");
goog.exportSymbol("Zlib.InflateStream", Zlib.InflateStream);
goog.exportSymbol("Zlib.InflateStream.prototype.decompress", Zlib.InflateStream.prototype.decompress);
goog.exportSymbol("Zlib.InflateStream.prototype.getBytes", Zlib.InflateStream.prototype.getBytes);
goog.require("Zlib.RawDeflate");
goog.require("Zlib.exportObject");
goog.exportSymbol("Zlib.RawDeflate", Zlib.RawDeflate);
goog.exportSymbol("Zlib.RawDeflate.prototype.compress", Zlib.RawDeflate.prototype.compress);
Zlib.exportObject("Zlib.RawDeflate.CompressionType", {"NONE":Zlib.RawDeflate.CompressionType.NONE, "FIXED":Zlib.RawDeflate.CompressionType.FIXED, "DYNAMIC":Zlib.RawDeflate.CompressionType.DYNAMIC});
goog.require("Zlib.RawInflate");
goog.require("Zlib.exportObject");
goog.exportSymbol("Zlib.RawInflate", Zlib.RawInflate);
goog.exportSymbol("Zlib.RawInflate.prototype.decompress", Zlib.RawInflate.prototype.decompress);
Zlib.exportObject("Zlib.RawInflate.BufferType", {"ADAPTIVE":Zlib.RawInflate.BufferType.ADAPTIVE, "BLOCK":Zlib.RawInflate.BufferType.BLOCK});
goog.require("Zlib.RawInflateStream");
goog.exportSymbol("Zlib.RawInflateStream", Zlib.RawInflateStream);
goog.exportSymbol("Zlib.RawInflateStream.prototype.decompress", Zlib.RawInflateStream.prototype.decompress);
goog.exportSymbol("Zlib.RawInflateStream.prototype.getBytes", Zlib.RawInflateStream.prototype.getBytes);
goog.require("Zlib.Unzip");
goog.exportSymbol("Zlib.Unzip", Zlib.Unzip);
goog.exportSymbol("Zlib.Unzip.prototype.decompress", Zlib.Unzip.prototype.decompress);
goog.exportSymbol("Zlib.Unzip.prototype.getFilenames", Zlib.Unzip.prototype.getFilenames);
goog.exportSymbol("Zlib.Unzip.prototype.setPassword", Zlib.Unzip.prototype.setPassword);
goog.require("Zlib.Zip");
goog.require("Zlib.exportObject");
goog.exportSymbol("Zlib.Zip", Zlib.Zip);
goog.exportSymbol("Zlib.Zip.prototype.addFile", Zlib.Zip.prototype.addFile);
goog.exportSymbol("Zlib.Zip.prototype.compress", Zlib.Zip.prototype.compress);
goog.exportSymbol("Zlib.Zip.prototype.setPassword", Zlib.Zip.prototype.setPassword);
Zlib.exportObject("Zlib.Zip.CompressionMethod", {"STORE":Zlib.Zip.CompressionMethod.STORE, "DEFLATE":Zlib.Zip.CompressionMethod.DEFLATE});
Zlib.exportObject("Zlib.Zip.OperatingSystem", {"MSDOS":Zlib.Zip.OperatingSystem.MSDOS, "UNIX":Zlib.Zip.OperatingSystem.UNIX, "MACINTOSH":Zlib.Zip.OperatingSystem.MACINTOSH});
}).call(this);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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TUEsTUFBTixLQUFpQixDQUFqQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLENBQWYsRUFBa0IsQ0FBbEIsQ0FBc0I7ZUFDbEQ7YUFBTUEsTUFBTixLQUFpQixFQUFqQjtBQUFzQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDcEQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixFQUFoQjtBQUFxQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDbkQ7YUFBTUEsTUFBTixJQUFnQixHQUFoQjtBQUFzQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEVBQWYsRUFBbUIsQ0FBbkIsQ0FBdUI7ZUFDcEQ7YUFBTUEsTUFBTixJQUFnQixHQUFoQjtBQUFzQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEdBQWYsRUFBb0IsQ0FBcEIsQ0FBd0I7ZUFDckQ7YUFBTUEsTUFBTixJQUFnQixHQUFoQjtBQUFzQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEdBQWYsRUFBb0IsQ0FBcEIsQ0FBd0I7ZUFDckQ7YUFBTUEsTUFBTixJQUFnQixHQUFoQjtBQUFzQixnQkFBTyxDQUFDLEdBQUQsRUFBTUEsTUFBTixHQUFlLEdBQWYsRUFBb0IsQ0FBcEIsQ0FBd0I7ZUFDckQ7YUFB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QUE2UixVQUhhLENBRDlCOyIsInNvdXJjZXMiOlsiY2xvc3VyZS1wcmltaXRpdmVzL2Jhc2UuanMiLCJkZWZpbmUvdHlwZWRhcnJheS9oeWJyaWQuanMiLCJzcmMvYml0c3RyZWFtLmpzIiwic3JjL2NyYzMyLmpzIiwic3JjL2ZpeF9waGFudG9tanNfZnVuY3Rpb25fYXBwbHlfYnVnLmpzIiwic3JjL2d1bnppcF9tZW1iZXIuanMiLCJzcmMvaGVhcC5qcyIsInNyYy9odWZmbWFuLmpzIiwic3JjL3Jhd2RlZmxhdGUuanMiLCJzcmMvZ3ppcC5qcyIsInNyYy9yYXdpbmZsYXRlLmpzIiwic3JjL2d1bnppcC5qcyIsInNyYy9yYXdpbmZsYXRlX3N0cmVhbS5qcyIsInNyYy91dGlsLmpzIiwic3JjL2FkbGVyMzIuanMiLCJzcmMvaW5mbGF0ZS5qcyIsInNyYy96aXAuanMiLCJzcmMvdW56aXAuanMiLCJzcmMvemxpYi5qcyIsInNyYy9kZWZsYXRlLmpzIiwic3JjL2V4cG9ydF9vYmplY3QuanMiLCJzcmMvaW5mbGF0ZV9zdHJlYW0uanMiLCJleHBvcnQvYWRsZXIzMi5qcyIsImV4cG9ydC9jcmMzMi5qcyIsImV4cG9ydC9kZWZsYXRlLmpzIiwiZXhwb3J0L2d1bnppcC5qcyIsImV4cG9ydC9ndW56aXBfbWVtYmVyLmpzIiwiZXhwb3J0L2d6aXAuanMiLCJleHBvcnQvaW5mbGF0ZS5qcyIsImV4cG9ydC9pbmZsYXRlX3N0cmVhbS5qcyIsImV4cG9ydC9yYXdkZWZsYXRlLmpzIiwiZXhwb3J0L3Jhd2luZmxhdGUuanMiLCJleHBvcnQvcmF3aW5mbGF0ZV9zdHJlYW0uanMiLCJleHBvcnQvdW56aXAuanMiLCJleHBvcnQvemlwLmpzIl0sIm5hbWVzIjpbIkNPTVBJTEVEIiwiZ29vZyIsImdsb2JhbCIsIkRFQlVHIiwiTE9DQUxFIiwicHJvdmlkZSIsImdvb2cucHJvdmlkZSIsIm5hbWUiLCJpc1Byb3ZpZGVkXyIsIkVycm9yIiwiaW1wbGljaXROYW1lc3BhY2VzXyIsIm5hbWVzcGFjZSIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIiwiZ2V0T2JqZWN0QnlOYW1lIiwiZXhwb3J0UGF0aF8iLCJzZXRUZXN0T25seSIsImdvb2cuc2V0VGVzdE9ubHkiLCJvcHRfbWVzc2FnZSIsImdvb2cuaXNQcm92aWRlZF8iLCJnb29nLmV4cG9ydFBhdGhfIiwib3B0X29iamVjdCIsIm9wdF9vYmplY3RUb0V4cG9ydFRvIiwicGFydHMiLCJzcGxpdCIsImN1ciIsImV4ZWNTY3JpcHQiLCJwYXJ0IiwibGVuZ3RoIiwic2hpZnQiLCJpc0RlZiIsImdvb2cuZ2V0T2JqZWN0QnlOYW1lIiwib3B0X29iaiIsImlzRGVmQW5kTm90TnVsbCIsImdsb2JhbGl6ZSIsImdvb2cuZ2xvYmFsaXplIiwib2JqIiwib3B0X2dsb2JhbCIsIngiLCJhZGREZXBlbmRlbmN5IiwiZ29vZy5hZGREZXBlbmRlbmN5IiwicmVsUGF0aCIsInByb3ZpZGVzIiwicmVxdWlyZXMiLCJyZXF1aXJlIiwicGF0aCIsInJlcGxhY2UiLCJkZXBzIiwiZGVwZW5kZW5jaWVzXyIsImkiLCJuYW1lVG9QYXRoIiwicGF0aFRvTmFtZXMiLCJqIiwiRU5BQkxFX0RFQlVHX0xPQURFUiIsImdvb2cucmVxdWlyZSIsImdldFBhdGhGcm9tRGVwc18iLCJpbmNsdWRlZF8iLCJ3cml0ZVNjcmlwdHNfIiwiZXJyb3JNZXNzYWdlIiwiY29uc29sZSIsImJhc2VQYXRoIiwiQ0xPU1VSRV9CQVNFX1BBVEgiLCJDTE9TVVJFX05PX0RFUFMiLCJDTE9TVVJFX0lNUE9SVF9TQ1JJUFQiLCJudWxsRnVuY3Rpb24iLCJnb29nLm51bGxGdW5jdGlvbiIsImlkZW50aXR5RnVuY3Rpb24iLCJnb29nLmlkZW50aXR5RnVuY3Rpb24iLCJvcHRfcmV0dXJuVmFsdWUiLCJ2YXJfYXJncyIsImFic3RyYWN0TWV0aG9kIiwiZ29vZy5hYnN0cmFjdE1ldGhvZCIsImFkZFNpbmdsZXRvbkdldHRlciIsImdvb2cuYWRkU2luZ2xldG9uR2V0dGVyIiwiY3RvciIsImdldEluc3RhbmNlIiwiY3Rvci5nZXRJbnN0YW5jZSIsImluc3RhbmNlXyIsImluc3RhbnRpYXRlZFNpbmdsZXRvbnNfIiwiaW5IdG1sRG9jdW1lbnRfIiwiZ29vZy5pbkh0bWxEb2N1bWVudF8iLCJkb2MiLCJkb2N1bWVudCIsImZpbmRCYXNlUGF0aF8iLCJnb29nLmZpbmRCYXNlUGF0aF8iLCJzY3JpcHRzIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJzcmMiLCJxbWFyayIsImwiLCJzdWJzdHIiLCJpbXBvcnRTY3JpcHRfIiwiZ29vZy5pbXBvcnRTY3JpcHRfIiwiaW1wb3J0U2NyaXB0Iiwid3JpdGVTY3JpcHRUYWdfIiwid3JpdHRlbiIsImdvb2cud3JpdGVTY3JpcHRUYWdfIiwid3JpdGUiLCJnb29nLndyaXRlU2NyaXB0c18iLCJzZWVuU2NyaXB0IiwidmlzaXROb2RlIiwidmlzaXRlZCIsInB1c2giLCJyZXF1aXJlTmFtZSIsImdvb2cuZ2V0UGF0aEZyb21EZXBzXyIsInJ1bGUiLCJ0eXBlT2YiLCJnb29nLnR5cGVPZiIsInZhbHVlIiwicyIsIkFycmF5IiwiT2JqZWN0IiwiY2xhc3NOYW1lIiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJjYWxsIiwic3BsaWNlIiwicHJvcGVydHlJc0VudW1lcmFibGUiLCJnb29nLmlzRGVmIiwidmFsIiwidW5kZWZpbmVkIiwiaXNOdWxsIiwiZ29vZy5pc051bGwiLCJnb29nLmlzRGVmQW5kTm90TnVsbCIsImlzQXJyYXkiLCJnb29nLmlzQXJyYXkiLCJpc0FycmF5TGlrZSIsImdvb2cuaXNBcnJheUxpa2UiLCJ0eXBlIiwiaXNEYXRlTGlrZSIsImdvb2cuaXNEYXRlTGlrZSIsImlzT2JqZWN0IiwiZ2V0RnVsbFllYXIiLCJpc1N0cmluZyIsImdvb2cuaXNTdHJpbmciLCJpc0Jvb2xlYW4iLCJnb29nLmlzQm9vbGVhbiIsImlzTnVtYmVyIiwiZ29vZy5pc051bWJlciIsImlzRnVuY3Rpb24iLCJnb29nLmlzRnVuY3Rpb24iLCJnb29nLmlzT2JqZWN0IiwiZ2V0VWlkIiwiZ29vZy5nZXRVaWQiLCJVSURfUFJPUEVSVFlfIiwidWlkQ291bnRlcl8iLCJyZW1vdmVVaWQiLCJnb29nLnJlbW92ZVVpZCIsInJlbW92ZUF0dHJpYnV0ZSIsImV4IiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwiZ2V0SGFzaENvZGUiLCJyZW1vdmVIYXNoQ29kZSIsImNsb25lT2JqZWN0IiwiZ29vZy5jbG9uZU9iamVjdCIsImNsb25lIiwia2V5IiwiYmluZE5hdGl2ZV8iLCJnb29nLmJpbmROYXRpdmVfIiwiZm4iLCJzZWxmT2JqIiwiYXBwbHkiLCJiaW5kIiwiYXJndW1lbnRzIiwiYmluZEpzXyIsImdvb2cuYmluZEpzXyIsImJvdW5kQXJncyIsInNsaWNlIiwibmV3QXJncyIsInVuc2hpZnQiLCJnb29nLmJpbmQiLCJGdW5jdGlvbiIsImluZGV4T2YiLCJwYXJ0aWFsIiwiZ29vZy5wYXJ0aWFsIiwiYXJncyIsIm1peGluIiwiZ29vZy5taXhpbiIsInRhcmdldCIsInNvdXJjZSIsIm5vdyIsIkRhdGUiLCJnbG9iYWxFdmFsIiwiZ29vZy5nbG9iYWxFdmFsIiwic2NyaXB0IiwiZXZhbCIsImV2YWxXb3Jrc0Zvckdsb2JhbHNfIiwic2NyaXB0RWx0IiwiY3JlYXRlRWxlbWVudCIsImRlZmVyIiwiYXBwZW5kQ2hpbGQiLCJjcmVhdGVUZXh0Tm9kZSIsImJvZHkiLCJyZW1vdmVDaGlsZCIsImNzc05hbWVNYXBwaW5nXyIsImNzc05hbWVNYXBwaW5nU3R5bGVfIiwiZ2V0Q3NzTmFtZSIsImdvb2cuZ2V0Q3NzTmFtZSIsIm9wdF9tb2RpZmllciIsImdldE1hcHBpbmciLCJjc3NOYW1lIiwicmVuYW1lQnlQYXJ0cyIsIm1hcHBlZCIsImpvaW4iLCJyZW5hbWUiLCJhIiwic2V0Q3NzTmFtZU1hcHBpbmciLCJnb29nLnNldENzc05hbWVNYXBwaW5nIiwibWFwcGluZyIsIm9wdF9zdHlsZSIsIkNMT1NVUkVfQ1NTX05BTUVfTUFQUElORyIsImdldE1zZyIsImdvb2cuZ2V0TXNnIiwic3RyIiwib3B0X3ZhbHVlcyIsInZhbHVlcyIsIlJlZ0V4cCIsImV4cG9ydFN5bWJvbCIsImdvb2cuZXhwb3J0U3ltYm9sIiwicHVibGljUGF0aCIsIm9iamVjdCIsImV4cG9ydFByb3BlcnR5IiwiZ29vZy5leHBvcnRQcm9wZXJ0eSIsInB1YmxpY05hbWUiLCJzeW1ib2wiLCJpbmhlcml0cyIsImdvb2cuaW5oZXJpdHMiLCJjaGlsZEN0b3IiLCJwYXJlbnRDdG9yIiwidGVtcEN0b3IiLCJzdXBlckNsYXNzXyIsImNvbnN0cnVjdG9yIiwiYmFzZSIsImdvb2cuYmFzZSIsIm1lIiwib3B0X21ldGhvZE5hbWUiLCJjYWxsZXIiLCJjYWxsZWUiLCJmb3VuZENhbGxlciIsInNjb3BlIiwiZ29vZy5zY29wZSIsIlVTRV9UWVBFREFSUkFZIiwiVWludDhBcnJheSIsIlVpbnQxNkFycmF5IiwiVWludDMyQXJyYXkiLCJEYXRhVmlldyIsIlpsaWIiLCJCaXRTdHJlYW0iLCJabGliLkJpdFN0cmVhbSIsImJ1ZmZlciIsImJ1ZmZlclBvc2l0aW9uIiwiaW5kZXgiLCJiaXRpbmRleCIsIkRlZmF1bHRCbG9ja1NpemUiLCJleHBhbmRCdWZmZXIiLCJabGliLkJpdFN0cmVhbS5wcm90b3R5cGUuZXhwYW5kQnVmZmVyIiwib2xkYnVmIiwiaWwiLCJzZXQiLCJ3cml0ZUJpdHMiLCJabGliLkJpdFN0cmVhbS5wcm90b3R5cGUud3JpdGVCaXRzIiwibnVtYmVyIiwibiIsInJldmVyc2UiLCJjdXJyZW50IiwicmV2MzJfIiwiUmV2ZXJzZVRhYmxlIiwiZmluaXNoIiwiWmxpYi5CaXRTdHJlYW0ucHJvdG90eXBlLmZpbmlzaCIsIm91dHB1dCIsInN1YmFycmF5IiwidGFibGUiLCJyIiwiWkxJQl9DUkMzMl9DT01QQUNUIiwiQ1JDMzIiLCJjYWxjIiwiWmxpYi5DUkMzMi5jYWxjIiwiZGF0YSIsInBvcyIsInVwZGF0ZSIsIlpsaWIuQ1JDMzIudXBkYXRlIiwiY3JjIiwiVGFibGUiLCJzaW5nbGUiLCJabGliLkNSQzMyLnNpbmdsZSIsIm51bSIsIlRhYmxlXyIsImMiLCJ3aW5kb3ciLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJlIiwiZnJvbUNoYXJDb2RlQXBwbHkiLCJ0aGlzb2JqIiwiR3VuemlwTWVtYmVyIiwiWmxpYi5HdW56aXBNZW1iZXIiLCJpZDEiLCJpZDIiLCJjbSIsImZsZyIsIm10aW1lIiwieGZsIiwib3MiLCJjcmMxNiIsInhsZW4iLCJjcmMzMiIsImlzaXplIiwiY29tbWVudCIsImdldE5hbWUiLCJabGliLkd1bnppcE1lbWJlci5wcm90b3R5cGUuZ2V0TmFtZSIsImdldERhdGEiLCJabGliLkd1bnppcE1lbWJlci5wcm90b3R5cGUuZ2V0RGF0YSIsImdldE10aW1lIiwiWmxpYi5HdW56aXBNZW1iZXIucHJvdG90eXBlLmdldE10aW1lIiwiSGVhcCIsIlpsaWIuSGVhcCIsImdldFBhcmVudCIsIlpsaWIuSGVhcC5wcm90b3R5cGUuZ2V0UGFyZW50IiwiZ2V0Q2hpbGQiLCJabGliLkhlYXAucHJvdG90eXBlLmdldENoaWxkIiwiWmxpYi5IZWFwLnByb3RvdHlwZS5wdXNoIiwicGFyZW50IiwiaGVhcCIsInN3YXAiLCJwb3AiLCJabGliLkhlYXAucHJvdG90eXBlLnBvcCIsIkh1ZmZtYW4iLCJidWlsZEh1ZmZtYW5UYWJsZSIsIlpsaWIuSHVmZm1hbi5idWlsZEh1ZmZtYW5UYWJsZSIsImxlbmd0aHMiLCJsaXN0U2l6ZSIsIm1heENvZGVMZW5ndGgiLCJtaW5Db2RlTGVuZ3RoIiwiTnVtYmVyIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJzaXplIiwiYml0TGVuZ3RoIiwiY29kZSIsInNraXAiLCJyZXZlcnNlZCIsInJ0ZW1wIiwiUmF3RGVmbGF0ZSIsIlpsaWIuUmF3RGVmbGF0ZSIsImlucHV0Iiwib3B0X3BhcmFtcyIsImNvbXByZXNzaW9uVHlwZSIsIkNvbXByZXNzaW9uVHlwZSIsIkRZTkFNSUMiLCJsYXp5IiwiZnJlcXNMaXRMZW4iLCJmcmVxc0Rpc3QiLCJvcCIsIkx6NzdNaW5MZW5ndGgiLCJMejc3TWF4TGVuZ3RoIiwiV2luZG93U2l6ZSIsIk1heENvZGVMZW5ndGgiLCJIVUZNQVgiLCJGaXhlZEh1ZmZtYW5UYWJsZSIsImNvbXByZXNzIiwiWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5jb21wcmVzcyIsImJsb2NrQXJyYXkiLCJwb3NpdGlvbiIsIk5PTkUiLCJtYWtlTm9jb21wcmVzc0Jsb2NrIiwiRklYRUQiLCJtYWtlRml4ZWRIdWZmbWFuQmxvY2siLCJtYWtlRHluYW1pY0h1ZmZtYW5CbG9jayIsIlpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUubWFrZU5vY29tcHJlc3NCbG9jayIsImlzRmluYWxCbG9jayIsImJmaW5hbCIsImJ0eXBlIiwibGVuIiwibmxlbiIsIlpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUubWFrZUZpeGVkSHVmZm1hbkJsb2NrIiwic3RyZWFtIiwibHo3NyIsImZpeGVkSHVmZm1hbiIsIlpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUubWFrZUR5bmFtaWNIdWZmbWFuQmxvY2siLCJobGl0IiwiaGRpc3QiLCJoY2xlbiIsImhjbGVuT3JkZXIiLCJsaXRMZW5MZW5ndGhzIiwibGl0TGVuQ29kZXMiLCJkaXN0TGVuZ3RocyIsImRpc3RDb2RlcyIsInRyZWVTeW1ib2xzIiwidHJlZUxlbmd0aHMiLCJ0cmFuc0xlbmd0aHMiLCJ0cmVlQ29kZXMiLCJiaXRsZW4iLCJnZXRMZW5ndGhzXyIsImdldENvZGVzRnJvbUxlbmd0aHNfIiwiZ2V0VHJlZVN5bWJvbHNfIiwiZnJlcXMiLCJjb2RlcyIsImR5bmFtaWNIdWZmbWFuIiwiWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5keW5hbWljSHVmZm1hbiIsImRhdGFBcnJheSIsImxpdExlbiIsImRpc3QiLCJsaXRlcmFsIiwiWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5maXhlZEh1ZmZtYW4iLCJMejc3TWF0Y2giLCJabGliLlJhd0RlZmxhdGUuTHo3N01hdGNoIiwiYmFja3dhcmREaXN0YW5jZSIsIkxlbmd0aENvZGVUYWJsZSIsImdldERpc3RhbmNlQ29kZV8iLCJabGliLlJhd0RlZmxhdGUuTHo3N01hdGNoLnByb3RvdHlwZS5nZXREaXN0YW5jZUNvZGVfIiwidG9Mejc3QXJyYXkiLCJabGliLlJhd0RlZmxhdGUuTHo3N01hdGNoLnByb3RvdHlwZS50b0x6NzdBcnJheSIsImNvZGVBcnJheSIsIlpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUubHo3NyIsIm1hdGNoS2V5Iiwid2luZG93U2l6ZSIsIm1hdGNoTGlzdCIsImxvbmdlc3RNYXRjaCIsInByZXZNYXRjaCIsImx6NzdidWYiLCJza2lwTGVuZ3RoIiwidG1wIiwid3JpdGVNYXRjaCIsIm1hdGNoIiwib2Zmc2V0IiwibHo3N0FycmF5Iiwic2VhcmNoTG9uZ2VzdE1hdGNoXyIsIlpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUuc2VhcmNoTG9uZ2VzdE1hdGNoXyIsImN1cnJlbnRNYXRjaCIsIm1hdGNoTWF4IiwibWF0Y2hMZW5ndGgiLCJkbCIsIlpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUuZ2V0VHJlZVN5bWJvbHNfIiwibGl0bGVuTGVuZ3RocyIsInJ1bkxlbmd0aCIsInJlc3VsdCIsIm5SZXN1bHQiLCJycHQiLCJabGliLlJhd0RlZmxhdGUucHJvdG90eXBlLmdldExlbmd0aHNfIiwibGltaXQiLCJuU3ltYm9scyIsIm5vZGVzIiwiY29kZUxlbmd0aCIsInJldmVyc2VQYWNrYWdlTWVyZ2VfIiwiWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5yZXZlcnNlUGFja2FnZU1lcmdlXyIsInN5bWJvbHMiLCJtaW5pbXVtQ29zdCIsImZsYWciLCJjdXJyZW50UG9zaXRpb24iLCJleGNlc3MiLCJoYWxmIiwidCIsIndlaWdodCIsIm5leHQiLCJ0YWtlUGFja2FnZSIsIlpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUuZ2V0Q29kZXNGcm9tTGVuZ3Roc18iLCJjb3VudCIsInN0YXJ0Q29kZSIsIm0iLCJHemlwIiwiWmxpYi5HemlwIiwiaXAiLCJmbGFncyIsImZpbGVuYW1lIiwiZGVmbGF0ZU9wdGlvbnMiLCJEZWZhdWx0QnVmZmVyU2l6ZSIsIlpsaWIuR3ppcC5wcm90b3R5cGUuY29tcHJlc3MiLCJyYXdkZWZsYXRlIiwiRmxhZ3NNYXNrIiwiRk5BTUUiLCJGQ09NTUVOVCIsIkZIQ1JDIiwiT3BlcmF0aW5nU3lzdGVtIiwiVU5LTk9XTiIsImNoYXJDb2RlQXQiLCJieXRlTGVuZ3RoIiwiWkxJQl9SQVdfSU5GTEFURV9CVUZGRVJfU0laRSIsIlJhd0luZmxhdGUiLCJabGliLlJhd0luZmxhdGUiLCJibG9ja3MiLCJidWZmZXJTaXplIiwidG90YWxwb3MiLCJiaXRzYnVmIiwiYml0c2J1ZmxlbiIsImJ1ZmZlclR5cGUiLCJCdWZmZXJUeXBlIiwiQURBUFRJVkUiLCJyZXNpemUiLCJwcmV2IiwiQkxPQ0siLCJNYXhCYWNrd2FyZExlbmd0aCIsIk1heENvcHlMZW5ndGgiLCJleHBhbmRCdWZmZXJBZGFwdGl2ZSIsImNvbmNhdEJ1ZmZlciIsImNvbmNhdEJ1ZmZlckR5bmFtaWMiLCJkZWNvZGVIdWZmbWFuIiwiZGVjb2RlSHVmZm1hbkFkYXB0aXZlIiwiZGVjb21wcmVzcyIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuZGVjb21wcmVzcyIsInBhcnNlQmxvY2siLCJPcmRlciIsIkxlbmd0aEV4dHJhVGFibGUiLCJEaXN0Q29kZVRhYmxlIiwiRGlzdEV4dHJhVGFibGUiLCJGaXhlZExpdGVyYWxMZW5ndGhUYWJsZSIsIkZpeGVkRGlzdGFuY2VUYWJsZSIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUucGFyc2VCbG9jayIsImhkciIsInJlYWRCaXRzIiwicGFyc2VVbmNvbXByZXNzZWRCbG9jayIsInBhcnNlRml4ZWRIdWZmbWFuQmxvY2siLCJwYXJzZUR5bmFtaWNIdWZmbWFuQmxvY2siLCJabGliLlJhd0luZmxhdGUucHJvdG90eXBlLnJlYWRCaXRzIiwiaW5wdXRMZW5ndGgiLCJvY3RldCIsInJlYWRDb2RlQnlUYWJsZSIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUucmVhZENvZGVCeVRhYmxlIiwiY29kZVRhYmxlIiwiY29kZVdpdGhMZW5ndGgiLCJabGliLlJhd0luZmxhdGUucHJvdG90eXBlLnBhcnNlVW5jb21wcmVzc2VkQmxvY2siLCJvbGVuZ3RoIiwicHJlQ29weSIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUucGFyc2VGaXhlZEh1ZmZtYW5CbG9jayIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUucGFyc2VEeW5hbWljSHVmZm1hbkJsb2NrIiwiY29kZUxlbmd0aHMiLCJjb2RlTGVuZ3Roc1RhYmxlIiwiZGVjb2RlIiwicmVwZWF0IiwiWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5kZWNvZGVIdWZmbWFuIiwibGl0bGVuIiwiY3VycmVudExpdGxlblRhYmxlIiwidGkiLCJjb2RlRGlzdCIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuZGVjb2RlSHVmZm1hbkFkYXB0aXZlIiwiWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5leHBhbmRCdWZmZXIiLCJvcHRfcGFyYW0iLCJiYWNrd2FyZCIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuZXhwYW5kQnVmZmVyQWRhcHRpdmUiLCJyYXRpbyIsIm1heEh1ZmZDb2RlIiwibmV3U2l6ZSIsIm1heEluZmxhdGVTaXplIiwiZml4UmF0aW8iLCJhZGRSYXRpbyIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuY29uY2F0QnVmZmVyIiwiYmxvY2siLCJqbCIsIlpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuY29uY2F0QnVmZmVyRHluYW1pYyIsIkd1bnppcCIsIlpsaWIuR3VuemlwIiwibWVtYmVyIiwiZGVjb21wcmVzc2VkIiwiZ2V0TWVtYmVycyIsIlpsaWIuR3VuemlwLnByb3RvdHlwZS5nZXRNZW1iZXJzIiwiWmxpYi5HdW56aXAucHJvdG90eXBlLmRlY29tcHJlc3MiLCJkZWNvZGVNZW1iZXIiLCJjb25jYXRNZW1iZXIiLCJabGliLkd1bnppcC5wcm90b3R5cGUuZGVjb2RlTWVtYmVyIiwicmF3aW5mbGF0ZSIsImluZmxhdGVkIiwiaW5mbGVuIiwiY2kiLCJGRVhUUkEiLCJkZWNvZGVTdWJGaWVsZCIsIlpsaWIuR3VuemlwLnByb3RvdHlwZS5kZWNvZGVTdWJGaWVsZCIsIlpsaWIuR3VuemlwLnByb3RvdHlwZS5jb25jYXRNZW1iZXIiLCJwIiwiY29uY2F0IiwiWkxJQl9TVFJFQU1fUkFXX0lORkxBVEVfQlVGRkVSX1NJWkUiLCJSYXdJbmZsYXRlU3RyZWFtIiwiWmxpYi5SYXdJbmZsYXRlU3RyZWFtIiwib3B0X2J1ZmZlcnNpemUiLCJibG9ja0xlbmd0aCIsImxpdGxlblRhYmxlIiwiZGlzdFRhYmxlIiwic3AiLCJzdGF0dXMiLCJTdGF0dXMiLCJJTklUSUFMSVpFRCIsImlwXyIsImJpdHNidWZsZW5fIiwiYml0c2J1Zl8iLCJCbG9ja1R5cGUiLCJabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLmRlY29tcHJlc3MiLCJuZXdJbnB1dCIsInN0b3AiLCJCTE9DS19IRUFERVJfU1RBUlQiLCJyZWFkQmxvY2tIZWFkZXIiLCJCTE9DS19IRUFERVJfRU5EIiwiQkxPQ0tfQk9EWV9TVEFSVCIsImN1cnJlbnRCbG9ja1R5cGUiLCJVTkNPTVBSRVNTRUQiLCJyZWFkVW5jb21wcmVzc2VkQmxvY2tIZWFkZXIiLCJCTE9DS19CT0RZX0VORCIsIkRFQ09ERV9CTE9DS19TVEFSVCIsIkRFQ09ERV9CTE9DS19FTkQiLCJabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnJlYWRCbG9ja0hlYWRlciIsInNhdmVfIiwicmVzdG9yZV8iLCJabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnJlYWRCaXRzIiwiWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5yZWFkQ29kZUJ5VGFibGUiLCJabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnJlYWRVbmNvbXByZXNzZWRCbG9ja0hlYWRlciIsIlpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUucGFyc2VVbmNvbXByZXNzZWRCbG9jayIsIlpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUucGFyc2VGaXhlZEh1ZmZtYW5CbG9jayIsIlpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuc2F2ZV8iLCJabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnJlc3RvcmVfIiwiWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5wYXJzZUR5bmFtaWNIdWZmbWFuQmxvY2siLCJwYXJzZUR5bmFtaWNIdWZmbWFuQmxvY2tJbXBsIiwiYml0cyIsIlpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZGVjb2RlSHVmZm1hbiIsIlpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZXhwYW5kQnVmZmVyIiwiWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5jb25jYXRCdWZmZXIiLCJnZXRCeXRlcyIsIlpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZ2V0Qnl0ZXMiLCJVdGlsIiwic3RyaW5nVG9CeXRlQXJyYXkiLCJabGliLlV0aWwuc3RyaW5nVG9CeXRlQXJyYXkiLCJBZGxlcjMyIiwiWmxpYi5BZGxlcjMyIiwiYXJyYXkiLCJabGliLkFkbGVyMzIudXBkYXRlIiwiYWRsZXIiLCJzMSIsInMyIiwidGxlbiIsIk9wdGltaXphdGlvblBhcmFtZXRlciIsIkluZmxhdGUiLCJabGliLkluZmxhdGUiLCJjbWYiLCJ2ZXJpZnkiLCJDb21wcmVzc2lvbk1ldGhvZCIsIkRFRkxBVEUiLCJtZXRob2QiLCJabGliLkluZmxhdGUucHJvdG90eXBlLmRlY29tcHJlc3MiLCJhZGxlcjMyIiwiWmlwIiwiWmxpYi5aaXAiLCJmaWxlcyIsInBhc3N3b3JkIiwiRmxhZ3MiLCJGaWxlSGVhZGVyU2lnbmF0dXJlIiwiTG9jYWxGaWxlSGVhZGVyU2lnbmF0dXJlIiwiQ2VudHJhbERpcmVjdG9yeVNpZ25hdHVyZSIsImFkZEZpbGUiLCJabGliLlppcC5wcm90b3R5cGUuYWRkRmlsZSIsImNvbXByZXNzZWQiLCJTVE9SRSIsImRlZmxhdGVXaXRoT3B0aW9uIiwic2V0UGFzc3dvcmQiLCJabGliLlppcC5wcm90b3R5cGUuc2V0UGFzc3dvcmQiLCJabGliLlppcC5wcm90b3R5cGUuY29tcHJlc3MiLCJmaWxlIiwib3AxIiwib3AyIiwib3AzIiwibG9jYWxGaWxlU2l6ZSIsImNlbnRyYWxEaXJlY3RvcnlTaXplIiwiZW5kT2ZDZW50cmFsRGlyZWN0b3J5U2l6ZSIsIm5lZWRWZXJzaW9uIiwiY29tcHJlc3Npb25NZXRob2QiLCJkYXRlIiwicGxhaW5TaXplIiwiZmlsZW5hbWVMZW5ndGgiLCJleHRyYUZpZWxkTGVuZ3RoIiwiY29tbWVudExlbmd0aCIsImV4dHJhRmllbGQiLCJvcHRpb24iLCJjcmVhdGVFbmNyeXB0aW9uS2V5IiwiZW5jb2RlIiwiTVNET1MiLCJFTkNSWVBUIiwiZ2V0TWludXRlcyIsImdldFNlY29uZHMiLCJnZXRIb3VycyIsImdldE1vbnRoIiwiZ2V0RGF0ZSIsIlpsaWIuWmlwLnByb3RvdHlwZS5kZWZsYXRlV2l0aE9wdGlvbiIsImRlZmxhdG9yIiwiZ2V0Qnl0ZSIsIlpsaWIuWmlwLnByb3RvdHlwZS5nZXRCeXRlIiwiWmxpYi5aaXAucHJvdG90eXBlLmVuY29kZSIsInVwZGF0ZUtleXMiLCJabGliLlppcC5wcm90b3R5cGUudXBkYXRlS2V5cyIsIlpsaWIuWmlwLnByb3RvdHlwZS5jcmVhdGVFbmNyeXB0aW9uS2V5IiwiVW56aXAiLCJabGliLlVuemlwIiwiZW9jZHJPZmZzZXQiLCJudW1iZXJPZlRoaXNEaXNrIiwic3RhcnREaXNrIiwidG90YWxFbnRyaWVzVGhpc0Rpc2siLCJ0b3RhbEVudHJpZXMiLCJjZW50cmFsRGlyZWN0b3J5T2Zmc2V0IiwiZmlsZUhlYWRlckxpc3QiLCJmaWxlbmFtZVRvSW5kZXgiLCJGaWxlSGVhZGVyIiwiWmxpYi5VbnppcC5GaWxlSGVhZGVyIiwidmVyc2lvbiIsImNvbXByZXNzaW9uIiwidGltZSIsImNvbXByZXNzZWRTaXplIiwiZmlsZU5hbWVMZW5ndGgiLCJmaWxlQ29tbWVudExlbmd0aCIsImRpc2tOdW1iZXJTdGFydCIsImludGVybmFsRmlsZUF0dHJpYnV0ZXMiLCJleHRlcm5hbEZpbGVBdHRyaWJ1dGVzIiwicmVsYXRpdmVPZmZzZXQiLCJwYXJzZSIsIlpsaWIuVW56aXAuRmlsZUhlYWRlci5wcm90b3R5cGUucGFyc2UiLCJMb2NhbEZpbGVIZWFkZXIiLCJabGliLlVuemlwLkxvY2FsRmlsZUhlYWRlciIsIlpsaWIuVW56aXAuTG9jYWxGaWxlSGVhZGVyLnByb3RvdHlwZS5wYXJzZSIsInNlYXJjaEVuZE9mQ2VudHJhbERpcmVjdG9yeVJlY29yZCIsIlpsaWIuVW56aXAucHJvdG90eXBlLnNlYXJjaEVuZE9mQ2VudHJhbERpcmVjdG9yeVJlY29yZCIsInBhcnNlRW5kT2ZDZW50cmFsRGlyZWN0b3J5UmVjb3JkIiwiWmxpYi5VbnppcC5wcm90b3R5cGUucGFyc2VFbmRPZkNlbnRyYWxEaXJlY3RvcnlSZWNvcmQiLCJwYXJzZUZpbGVIZWFkZXIiLCJabGliLlVuemlwLnByb3RvdHlwZS5wYXJzZUZpbGVIZWFkZXIiLCJmaWxlbGlzdCIsImZpbGV0YWJsZSIsImZpbGVIZWFkZXIiLCJnZXRGaWxlRGF0YSIsIlpsaWIuVW56aXAucHJvdG90eXBlLmdldEZpbGVEYXRhIiwibG9jYWxGaWxlSGVhZGVyIiwiY3JlYXRlRGVjcnlwdGlvbktleSIsImdldEZpbGVuYW1lcyIsIlpsaWIuVW56aXAucHJvdG90eXBlLmdldEZpbGVuYW1lcyIsImZpbGVuYW1lTGlzdCIsIlpsaWIuVW56aXAucHJvdG90eXBlLmRlY29tcHJlc3MiLCJabGliLlVuemlwLnByb3RvdHlwZS5zZXRQYXNzd29yZCIsIlpsaWIuVW56aXAucHJvdG90eXBlLmRlY29kZSIsIkRlZmxhdGUiLCJabGliLkRlZmxhdGUiLCJyYXdEZWZsYXRlIiwicmF3RGVmbGF0ZU9wdGlvbiIsInByb3AiLCJabGliLkRlZmxhdGUuY29tcHJlc3MiLCJabGliLkRlZmxhdGUucHJvdG90eXBlLmNvbXByZXNzIiwiY2luZm8iLCJmY2hlY2siLCJmZGljdCIsImZsZXZlbCIsImNsZXZlbCIsImVycm9yIiwiTE9HMkUiLCJsb2ciLCJleHBvcnRPYmplY3QiLCJabGliLmV4cG9ydE9iamVjdCIsImVudW1TdHJpbmciLCJleHBvcnRLZXlWYWx1ZSIsImtleXMiLCJJbmZsYXRlU3RyZWFtIiwiWmxpYi5JbmZsYXRlU3RyZWFtIiwiWmxpYi5JbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5kZWNvbXByZXNzIiwicmVhZEhlYWRlciIsIlpsaWIuSW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZ2V0Qnl0ZXMiLCJabGliLkluZmxhdGVTdHJlYW0ucHJvdG90eXBlLnJlYWRIZWFkZXIiLCJVTklYIiwiTUFDSU5UT1NIIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDA2IFRoZSBDbG9zdXJlIExpYnJhcnkgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbi8vXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vL1xuLy8gICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbi8vXG4vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgQm9vdHN0cmFwIGZvciB0aGUgR29vZ2xlIEpTIExpYnJhcnkgKENsb3N1cmUpLlxuICpcbiAqIEluIHVuY29tcGlsZWQgbW9kZSBiYXNlLmpzIHdpbGwgd3JpdGUgb3V0IENsb3N1cmUncyBkZXBzIGZpbGUsIHVubGVzcyB0aGVcbiAqIGdsb2JhbCA8Y29kZT5DTE9TVVJFX05PX0RFUFM8L2NvZGU+IGlzIHNldCB0byB0cnVlLiAgVGhpcyBhbGxvd3MgcHJvamVjdHMgdG9cbiAqIGluY2x1ZGUgdGhlaXIgb3duIGRlcHMgZmlsZShzKSBmcm9tIGRpZmZlcmVudCBsb2NhdGlvbnMuXG4gKlxuICovXG5cblxuLyoqXG4gKiBAZGVmaW5lIHtib29sZWFufSBPdmVycmlkZGVuIHRvIHRydWUgYnkgdGhlIGNvbXBpbGVyIHdoZW4gLS1jbG9zdXJlX3Bhc3NcbiAqICAgICBvciAtLW1hcmtfYXNfY29tcGlsZWQgaXMgc3BlY2lmaWVkLlxuICovXG52YXIgQ09NUElMRUQgPSBmYWxzZTtcblxuXG4vKipcbiAqIEJhc2UgbmFtZXNwYWNlIGZvciB0aGUgQ2xvc3VyZSBsaWJyYXJ5LiAgQ2hlY2tzIHRvIHNlZSBnb29nIGlzXG4gKiBhbHJlYWR5IGRlZmluZWQgaW4gdGhlIGN1cnJlbnQgc2NvcGUgYmVmb3JlIGFzc2lnbmluZyB0byBwcmV2ZW50XG4gKiBjbG9iYmVyaW5nIGlmIGJhc2UuanMgaXMgbG9hZGVkIG1vcmUgdGhhbiBvbmNlLlxuICpcbiAqIEBjb25zdFxuICovXG52YXIgZ29vZyA9IGdvb2cgfHwge307IC8vIElkZW50aWZpZXMgdGhpcyBmaWxlIGFzIHRoZSBDbG9zdXJlIGJhc2UuXG5cblxuLyoqXG4gKiBSZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBjb250ZXh0LiAgSW4gbW9zdCBjYXNlcyB0aGlzIHdpbGwgYmUgJ3dpbmRvdycuXG4gKi9cbmdvb2cuZ2xvYmFsID0gdGhpcztcblxuXG4vKipcbiAqIEBkZWZpbmUge2Jvb2xlYW59IERFQlVHIGlzIHByb3ZpZGVkIGFzIGEgY29udmVuaWVuY2Ugc28gdGhhdCBkZWJ1Z2dpbmcgY29kZVxuICogdGhhdCBzaG91bGQgbm90IGJlIGluY2x1ZGVkIGluIGEgcHJvZHVjdGlvbiBqc19iaW5hcnkgY2FuIGJlIGVhc2lseSBzdHJpcHBlZFxuICogYnkgc3BlY2lmeWluZyAtLWRlZmluZSBnb29nLkRFQlVHPWZhbHNlIHRvIHRoZSBKU0NvbXBpbGVyLiBGb3IgZXhhbXBsZSwgbW9zdFxuICogdG9TdHJpbmcoKSBtZXRob2RzIHNob3VsZCBiZSBkZWNsYXJlZCBpbnNpZGUgYW4gXCJpZiAoZ29vZy5ERUJVRylcIiBjb25kaXRpb25hbFxuICogYmVjYXVzZSB0aGV5IGFyZSBnZW5lcmFsbHkgdXNlZCBmb3IgZGVidWdnaW5nIHB1cnBvc2VzIGFuZCBpdCBpcyBkaWZmaWN1bHRcbiAqIGZvciB0aGUgSlNDb21waWxlciB0byBzdGF0aWNhbGx5IGRldGVybWluZSB3aGV0aGVyIHRoZXkgYXJlIHVzZWQuXG4gKi9cbmdvb2cuREVCVUcgPSB0cnVlO1xuXG5cbi8qKlxuICogQGRlZmluZSB7c3RyaW5nfSBMT0NBTEUgZGVmaW5lcyB0aGUgbG9jYWxlIGJlaW5nIHVzZWQgZm9yIGNvbXBpbGF0aW9uLiBJdCBpc1xuICogdXNlZCB0byBzZWxlY3QgbG9jYWxlIHNwZWNpZmljIGRhdGEgdG8gYmUgY29tcGlsZWQgaW4ganMgYmluYXJ5LiBCVUlMRCBydWxlXG4gKiBjYW4gc3BlY2lmeSB0aGlzIHZhbHVlIGJ5IFwiLS1kZWZpbmUgZ29vZy5MT0NBTEU9PGxvY2FsZV9uYW1lPlwiIGFzIEpTQ29tcGlsZXJcbiAqIG9wdGlvbi5cbiAqXG4gKiBUYWtlIGludG8gYWNjb3VudCB0aGF0IHRoZSBsb2NhbGUgY29kZSBmb3JtYXQgaXMgaW1wb3J0YW50LiBZb3Ugc2hvdWxkIHVzZVxuICogdGhlIGNhbm9uaWNhbCBVbmljb2RlIGZvcm1hdCB3aXRoIGh5cGhlbiBhcyBhIGRlbGltaXRlci4gTGFuZ3VhZ2UgbXVzdCBiZVxuICogbG93ZXJjYXNlLCBMYW5ndWFnZSBTY3JpcHQgLSBDYXBpdGFsaXplZCwgUmVnaW9uIC0gVVBQRVJDQVNFLlxuICogVGhlcmUgYXJlIGZldyBleGFtcGxlczogcHQtQlIsIGVuLCBlbi1VUywgc3ItTGF0aW4tQk8sIHpoLUhhbnMtQ04uXG4gKlxuICogU2VlIG1vcmUgaW5mbyBhYm91dCBsb2NhbGUgY29kZXMgaGVyZTpcbiAqIGh0dHA6Ly93d3cudW5pY29kZS5vcmcvcmVwb3J0cy90cjM1LyNVbmljb2RlX0xhbmd1YWdlX2FuZF9Mb2NhbGVfSWRlbnRpZmllcnNcbiAqXG4gKiBGb3IgbGFuZ3VhZ2UgY29kZXMgeW91IHNob3VsZCB1c2UgdmFsdWVzIGRlZmluZWQgYnkgSVNPIDY5My0xLiBTZWUgaXQgaGVyZVxuICogaHR0cDovL3d3dy53My5vcmcvV0FJL0VSL0lHL2VydC9pc282MzkuaHRtLiBUaGVyZSBpcyBvbmx5IG9uZSBleGNlcHRpb24gZnJvbVxuICogdGhpcyBydWxlOiB0aGUgSGVicmV3IGxhbmd1YWdlLiBGb3IgbGVnYWN5IHJlYXNvbnMgdGhlIG9sZCBjb2RlIChpdykgc2hvdWxkXG4gKiBiZSB1c2VkIGluc3RlYWQgb2YgdGhlIG5ldyBjb2RlIChoZSksIHNlZSBodHRwOi8vd2lraS9NYWluL0lJSVN5bm9ueW1zLlxuICovXG5nb29nLkxPQ0FMRSA9ICdlbic7ICAvLyBkZWZhdWx0IHRvIGVuXG5cblxuLyoqXG4gKiBDcmVhdGVzIG9iamVjdCBzdHVicyBmb3IgYSBuYW1lc3BhY2UuICBUaGUgcHJlc2VuY2Ugb2Ygb25lIG9yIG1vcmVcbiAqIGdvb2cucHJvdmlkZSgpIGNhbGxzIGluZGljYXRlIHRoYXQgdGhlIGZpbGUgZGVmaW5lcyB0aGUgZ2l2ZW5cbiAqIG9iamVjdHMvbmFtZXNwYWNlcy4gIEJ1aWxkIHRvb2xzIGFsc28gc2NhbiBmb3IgcHJvdmlkZS9yZXF1aXJlIHN0YXRlbWVudHNcbiAqIHRvIGRpc2Nlcm4gZGVwZW5kZW5jaWVzLCBidWlsZCBkZXBlbmRlbmN5IGZpbGVzIChzZWUgZGVwcy5qcyksIGV0Yy5cbiAqIEBzZWUgZ29vZy5yZXF1aXJlXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBOYW1lc3BhY2UgcHJvdmlkZWQgYnkgdGhpcyBmaWxlIGluIHRoZSBmb3JtXG4gKiAgICAgXCJnb29nLnBhY2thZ2UucGFydFwiLlxuICovXG5nb29nLnByb3ZpZGUgPSBmdW5jdGlvbihuYW1lKSB7XG4gIGlmICghQ09NUElMRUQpIHtcbiAgICAvLyBFbnN1cmUgdGhhdCB0aGUgc2FtZSBuYW1lc3BhY2UgaXNuJ3QgcHJvdmlkZWQgdHdpY2UuIFRoaXMgaXMgaW50ZW5kZWRcbiAgICAvLyB0byB0ZWFjaCBuZXcgZGV2ZWxvcGVycyB0aGF0ICdnb29nLnByb3ZpZGUnIGlzIGVmZmVjdGl2ZWx5IGEgdmFyaWFibGVcbiAgICAvLyBkZWNsYXJhdGlvbi4gQW5kIHdoZW4gSlNDb21waWxlciB0cmFuc2Zvcm1zIGdvb2cucHJvdmlkZSBpbnRvIGEgcmVhbFxuICAgIC8vIHZhcmlhYmxlIGRlY2xhcmF0aW9uLCB0aGUgY29tcGlsZWQgSlMgc2hvdWxkIHdvcmsgdGhlIHNhbWUgYXMgdGhlIHJhd1xuICAgIC8vIEpTLS1ldmVuIHdoZW4gdGhlIHJhdyBKUyB1c2VzIGdvb2cucHJvdmlkZSBpbmNvcnJlY3RseS5cbiAgICBpZiAoZ29vZy5pc1Byb3ZpZGVkXyhuYW1lKSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ05hbWVzcGFjZSBcIicgKyBuYW1lICsgJ1wiIGFscmVhZHkgZGVjbGFyZWQuJyk7XG4gICAgfVxuICAgIGRlbGV0ZSBnb29nLmltcGxpY2l0TmFtZXNwYWNlc19bbmFtZV07XG5cbiAgICB2YXIgbmFtZXNwYWNlID0gbmFtZTtcbiAgICB3aGlsZSAoKG5hbWVzcGFjZSA9IG5hbWVzcGFjZS5zdWJzdHJpbmcoMCwgbmFtZXNwYWNlLmxhc3RJbmRleE9mKCcuJykpKSkge1xuICAgICAgaWYgKGdvb2cuZ2V0T2JqZWN0QnlOYW1lKG5hbWVzcGFjZSkpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBnb29nLmltcGxpY2l0TmFtZXNwYWNlc19bbmFtZXNwYWNlXSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgZ29vZy5leHBvcnRQYXRoXyhuYW1lKTtcbn07XG5cblxuLyoqXG4gKiBNYXJrcyB0aGF0IHRoZSBjdXJyZW50IGZpbGUgc2hvdWxkIG9ubHkgYmUgdXNlZCBmb3IgdGVzdGluZywgYW5kIG5ldmVyIGZvclxuICogbGl2ZSBjb2RlIGluIHByb2R1Y3Rpb24uXG4gKiBAcGFyYW0ge3N0cmluZz19IG9wdF9tZXNzYWdlIE9wdGlvbmFsIG1lc3NhZ2UgdG8gYWRkIHRvIHRoZSBlcnJvciB0aGF0J3NcbiAqICAgICByYWlzZWQgd2hlbiB1c2VkIGluIHByb2R1Y3Rpb24gY29kZS5cbiAqL1xuZ29vZy5zZXRUZXN0T25seSA9IGZ1bmN0aW9uKG9wdF9tZXNzYWdlKSB7XG4gIGlmIChDT01QSUxFRCAmJiAhZ29vZy5ERUJVRykge1xuICAgIG9wdF9tZXNzYWdlID0gb3B0X21lc3NhZ2UgfHwgJyc7XG4gICAgdGhyb3cgRXJyb3IoJ0ltcG9ydGluZyB0ZXN0LW9ubHkgY29kZSBpbnRvIG5vbi1kZWJ1ZyBlbnZpcm9ubWVudCcgK1xuICAgICAgICAgICAgICAgIG9wdF9tZXNzYWdlID8gJzogJyArIG9wdF9tZXNzYWdlIDogJy4nKTtcbiAgfVxufTtcblxuXG5pZiAoIUNPTVBJTEVEKSB7XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBnaXZlbiBuYW1lIGhhcyBiZWVuIGdvb2cucHJvdmlkZWQuIFRoaXMgd2lsbCByZXR1cm4gZmFsc2UgZm9yXG4gICAqIG5hbWVzIHRoYXQgYXJlIGF2YWlsYWJsZSBvbmx5IGFzIGltcGxpY2l0IG5hbWVzcGFjZXMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG5hbWUgb2YgdGhlIG9iamVjdCB0byBsb29rIGZvci5cbiAgICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB0aGUgbmFtZSBoYXMgYmVlbiBwcm92aWRlZC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdvb2cuaXNQcm92aWRlZF8gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuICFnb29nLmltcGxpY2l0TmFtZXNwYWNlc19bbmFtZV0gJiYgISFnb29nLmdldE9iamVjdEJ5TmFtZShuYW1lKTtcbiAgfTtcblxuICAvKipcbiAgICogTmFtZXNwYWNlcyBpbXBsaWNpdGx5IGRlZmluZWQgYnkgZ29vZy5wcm92aWRlLiBGb3IgZXhhbXBsZSxcbiAgICogZ29vZy5wcm92aWRlKCdnb29nLmV2ZW50cy5FdmVudCcpIGltcGxpY2l0bHkgZGVjbGFyZXNcbiAgICogdGhhdCAnZ29vZycgYW5kICdnb29nLmV2ZW50cycgbXVzdCBiZSBuYW1lc3BhY2VzLlxuICAgKlxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ29vZy5pbXBsaWNpdE5hbWVzcGFjZXNfID0ge307XG59XG5cblxuLyoqXG4gKiBCdWlsZHMgYW4gb2JqZWN0IHN0cnVjdHVyZSBmb3IgdGhlIHByb3ZpZGVkIG5hbWVzcGFjZSBwYXRoLFxuICogZW5zdXJpbmcgdGhhdCBuYW1lcyB0aGF0IGFscmVhZHkgZXhpc3QgYXJlIG5vdCBvdmVyd3JpdHRlbi4gRm9yXG4gKiBleGFtcGxlOlxuICogXCJhLmIuY1wiIC0+IGEgPSB7fTthLmI9e307YS5iLmM9e307XG4gKiBVc2VkIGJ5IGdvb2cucHJvdmlkZSBhbmQgZ29vZy5leHBvcnRTeW1ib2wuXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBuYW1lIG9mIHRoZSBvYmplY3QgdGhhdCB0aGlzIGZpbGUgZGVmaW5lcy5cbiAqIEBwYXJhbSB7Kj19IG9wdF9vYmplY3QgdGhlIG9iamVjdCB0byBleHBvc2UgYXQgdGhlIGVuZCBvZiB0aGUgcGF0aC5cbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0X29iamVjdFRvRXhwb3J0VG8gVGhlIG9iamVjdCB0byBhZGQgdGhlIHBhdGggdG87IGRlZmF1bHRcbiAqICAgICBpcyB8Z29vZy5nbG9iYWx8LlxuICogQHByaXZhdGVcbiAqL1xuZ29vZy5leHBvcnRQYXRoXyA9IGZ1bmN0aW9uKG5hbWUsIG9wdF9vYmplY3QsIG9wdF9vYmplY3RUb0V4cG9ydFRvKSB7XG4gIHZhciBwYXJ0cyA9IG5hbWUuc3BsaXQoJy4nKTtcbiAgdmFyIGN1ciA9IG9wdF9vYmplY3RUb0V4cG9ydFRvIHx8IGdvb2cuZ2xvYmFsO1xuXG4gIC8vIEludGVybmV0IEV4cGxvcmVyIGV4aGliaXRzIHN0cmFuZ2UgYmVoYXZpb3Igd2hlbiB0aHJvd2luZyBlcnJvcnMgZnJvbVxuICAvLyBtZXRob2RzIGV4dGVybmVkIGluIHRoaXMgbWFubmVyLiAgU2VlIHRoZSB0ZXN0RXhwb3J0U3ltYm9sRXhjZXB0aW9ucyBpblxuICAvLyBiYXNlX3Rlc3QuaHRtbCBmb3IgYW4gZXhhbXBsZS5cbiAgaWYgKCEocGFydHNbMF0gaW4gY3VyKSAmJiBjdXIuZXhlY1NjcmlwdCkge1xuICAgIGN1ci5leGVjU2NyaXB0KCd2YXIgJyArIHBhcnRzWzBdKTtcbiAgfVxuXG4gIC8vIENlcnRhaW4gYnJvd3NlcnMgY2Fubm90IHBhcnNlIGNvZGUgaW4gdGhlIGZvcm0gZm9yKChhIGluIGIpOyBjOyk7XG4gIC8vIFRoaXMgcGF0dGVybiBpcyBwcm9kdWNlZCBieSB0aGUgSlNDb21waWxlciB3aGVuIGl0IGNvbGxhcHNlcyB0aGVcbiAgLy8gc3RhdGVtZW50IGFib3ZlIGludG8gdGhlIGNvbmRpdGlvbmFsIGxvb3AgYmVsb3cuIFRvIHByZXZlbnQgdGhpcyBmcm9tXG4gIC8vIGhhcHBlbmluZywgdXNlIGEgZm9yLWxvb3AgYW5kIHJlc2VydmUgdGhlIGluaXQgbG9naWMgYXMgYmVsb3cuXG5cbiAgLy8gUGFyZW50aGVzZXMgYWRkZWQgdG8gZWxpbWluYXRlIHN0cmljdCBKUyB3YXJuaW5nIGluIEZpcmVmb3guXG4gIGZvciAodmFyIHBhcnQ7IHBhcnRzLmxlbmd0aCAmJiAocGFydCA9IHBhcnRzLnNoaWZ0KCkpOykge1xuICAgIGlmICghcGFydHMubGVuZ3RoICYmIGdvb2cuaXNEZWYob3B0X29iamVjdCkpIHtcbiAgICAgIC8vIGxhc3QgcGFydCBhbmQgd2UgaGF2ZSBhbiBvYmplY3Q7IHVzZSBpdFxuICAgICAgY3VyW3BhcnRdID0gb3B0X29iamVjdDtcbiAgICB9IGVsc2UgaWYgKGN1cltwYXJ0XSkge1xuICAgICAgY3VyID0gY3VyW3BhcnRdO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdXIgPSBjdXJbcGFydF0gPSB7fTtcbiAgICB9XG4gIH1cbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCBiYXNlZCBvbiBpdHMgZnVsbHkgcXVhbGlmaWVkIGV4dGVybmFsIG5hbWUuICBJZiB5b3UgYXJlXG4gKiB1c2luZyBhIGNvbXBpbGF0aW9uIHBhc3MgdGhhdCByZW5hbWVzIHByb3BlcnR5IG5hbWVzIGJld2FyZSB0aGF0IHVzaW5nIHRoaXNcbiAqIGZ1bmN0aW9uIHdpbGwgbm90IGZpbmQgcmVuYW1lZCBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBmdWxseSBxdWFsaWZpZWQgbmFtZS5cbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0X29iaiBUaGUgb2JqZWN0IHdpdGhpbiB3aGljaCB0byBsb29rOyBkZWZhdWx0IGlzXG4gKiAgICAgfGdvb2cuZ2xvYmFsfC5cbiAqIEByZXR1cm4gez99IFRoZSB2YWx1ZSAob2JqZWN0IG9yIHByaW1pdGl2ZSkgb3IsIGlmIG5vdCBmb3VuZCwgbnVsbC5cbiAqL1xuZ29vZy5nZXRPYmplY3RCeU5hbWUgPSBmdW5jdGlvbihuYW1lLCBvcHRfb2JqKSB7XG4gIHZhciBwYXJ0cyA9IG5hbWUuc3BsaXQoJy4nKTtcbiAgdmFyIGN1ciA9IG9wdF9vYmogfHwgZ29vZy5nbG9iYWw7XG4gIGZvciAodmFyIHBhcnQ7IHBhcnQgPSBwYXJ0cy5zaGlmdCgpOyApIHtcbiAgICBpZiAoZ29vZy5pc0RlZkFuZE5vdE51bGwoY3VyW3BhcnRdKSkge1xuICAgICAgY3VyID0gY3VyW3BhcnRdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGN1cjtcbn07XG5cblxuLyoqXG4gKiBHbG9iYWxpemVzIGEgd2hvbGUgbmFtZXNwYWNlLCBzdWNoIGFzIGdvb2cgb3IgZ29vZy5sYW5nLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG5hbWVzcGFjZSB0byBnbG9iYWxpemUuXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF9nbG9iYWwgVGhlIG9iamVjdCB0byBhZGQgdGhlIHByb3BlcnRpZXMgdG8uXG4gKiBAZGVwcmVjYXRlZCBQcm9wZXJ0aWVzIG1heSBiZSBleHBsaWNpdGx5IGV4cG9ydGVkIHRvIHRoZSBnbG9iYWwgc2NvcGUsIGJ1dFxuICogICAgIHRoaXMgc2hvdWxkIG5vIGxvbmdlciBiZSBkb25lIGluIGJ1bGsuXG4gKi9cbmdvb2cuZ2xvYmFsaXplID0gZnVuY3Rpb24ob2JqLCBvcHRfZ2xvYmFsKSB7XG4gIHZhciBnbG9iYWwgPSBvcHRfZ2xvYmFsIHx8IGdvb2cuZ2xvYmFsO1xuICBmb3IgKHZhciB4IGluIG9iaikge1xuICAgIGdsb2JhbFt4XSA9IG9ialt4XTtcbiAgfVxufTtcblxuXG4vKipcbiAqIEFkZHMgYSBkZXBlbmRlbmN5IGZyb20gYSBmaWxlIHRvIHRoZSBmaWxlcyBpdCByZXF1aXJlcy5cbiAqIEBwYXJhbSB7c3RyaW5nfSByZWxQYXRoIFRoZSBwYXRoIHRvIHRoZSBqcyBmaWxlLlxuICogQHBhcmFtIHtBcnJheX0gcHJvdmlkZXMgQW4gYXJyYXkgb2Ygc3RyaW5ncyB3aXRoIHRoZSBuYW1lcyBvZiB0aGUgb2JqZWN0c1xuICogICAgICAgICAgICAgICAgICAgICAgICAgdGhpcyBmaWxlIHByb3ZpZGVzLlxuICogQHBhcmFtIHtBcnJheX0gcmVxdWlyZXMgQW4gYXJyYXkgb2Ygc3RyaW5ncyB3aXRoIHRoZSBuYW1lcyBvZiB0aGUgb2JqZWN0c1xuICogICAgICAgICAgICAgICAgICAgICAgICAgdGhpcyBmaWxlIHJlcXVpcmVzLlxuICovXG5nb29nLmFkZERlcGVuZGVuY3kgPSBmdW5jdGlvbihyZWxQYXRoLCBwcm92aWRlcywgcmVxdWlyZXMpIHtcbiAgaWYgKCFDT01QSUxFRCkge1xuICAgIHZhciBwcm92aWRlLCByZXF1aXJlO1xuICAgIHZhciBwYXRoID0gcmVsUGF0aC5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG4gICAgdmFyIGRlcHMgPSBnb29nLmRlcGVuZGVuY2llc187XG4gICAgZm9yICh2YXIgaSA9IDA7IHByb3ZpZGUgPSBwcm92aWRlc1tpXTsgaSsrKSB7XG4gICAgICBkZXBzLm5hbWVUb1BhdGhbcHJvdmlkZV0gPSBwYXRoO1xuICAgICAgaWYgKCEocGF0aCBpbiBkZXBzLnBhdGhUb05hbWVzKSkge1xuICAgICAgICBkZXBzLnBhdGhUb05hbWVzW3BhdGhdID0ge307XG4gICAgICB9XG4gICAgICBkZXBzLnBhdGhUb05hbWVzW3BhdGhdW3Byb3ZpZGVdID0gdHJ1ZTtcbiAgICB9XG4gICAgZm9yICh2YXIgaiA9IDA7IHJlcXVpcmUgPSByZXF1aXJlc1tqXTsgaisrKSB7XG4gICAgICBpZiAoIShwYXRoIGluIGRlcHMucmVxdWlyZXMpKSB7XG4gICAgICAgIGRlcHMucmVxdWlyZXNbcGF0aF0gPSB7fTtcbiAgICAgIH1cbiAgICAgIGRlcHMucmVxdWlyZXNbcGF0aF1bcmVxdWlyZV0gPSB0cnVlO1xuICAgIH1cbiAgfVxufTtcblxuXG5cblxuLy8gTk9URShubmF6ZSk6IFRoZSBkZWJ1ZyBET00gbG9hZGVyIHdhcyBpbmNsdWRlZCBpbiBiYXNlLmpzIGFzIGFuIG9yaWduYWxcbi8vIHdheSB0byBkbyBcImRlYnVnLW1vZGVcIiBkZXZlbG9wbWVudC4gIFRoZSBkZXBlbmRlbmN5IHN5c3RlbSBjYW4gc29tZXRpbWVzXG4vLyBiZSBjb25mdXNpbmcsIGFzIGNhbiB0aGUgZGVidWcgRE9NIGxvYWRlcidzIGFzeW5jcm9ub3VzIG5hdHVyZS5cbi8vXG4vLyBXaXRoIHRoZSBET00gbG9hZGVyLCBhIGNhbGwgdG8gZ29vZy5yZXF1aXJlKCkgaXMgbm90IGJsb2NraW5nIC0tIHRoZVxuLy8gc2NyaXB0IHdpbGwgbm90IGxvYWQgdW50aWwgc29tZSBwb2ludCBhZnRlciB0aGUgY3VycmVudCBzY3JpcHQuICBJZiBhXG4vLyBuYW1lc3BhY2UgaXMgbmVlZGVkIGF0IHJ1bnRpbWUsIGl0IG5lZWRzIHRvIGJlIGRlZmluZWQgaW4gYSBwcmV2aW91c1xuLy8gc2NyaXB0LCBvciBsb2FkZWQgdmlhIHJlcXVpcmUoKSB3aXRoIGl0cyByZWdpc3RlcmVkIGRlcGVuZGVuY2llcy5cbi8vIFVzZXItZGVmaW5lZCBuYW1lc3BhY2VzIG1heSBuZWVkIHRoZWlyIG93biBkZXBzIGZpbGUuICBTZWUgaHR0cDovL2dvL2pzX2RlcHMsXG4vLyBodHRwOi8vZ28vZ2VuanNkZXBzLCBvciwgZXh0ZXJuYWxseSwgRGVwc1dyaXRlci5cbi8vIGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vY2xvc3VyZS9saWJyYXJ5L2RvY3MvZGVwc3dyaXRlci5odG1sXG4vL1xuLy8gQmVjYXVzZSBvZiBsZWdhY3kgY2xpZW50cywgdGhlIERPTSBsb2FkZXIgY2FuJ3QgYmUgZWFzaWx5IHJlbW92ZWQgZnJvbVxuLy8gYmFzZS5qcy4gIFdvcmsgaXMgYmVpbmcgZG9uZSB0byBtYWtlIGl0IGRpc2FibGVhYmxlIG9yIHJlcGxhY2VhYmxlIGZvclxuLy8gZGlmZmVyZW50IGVudmlyb25tZW50cyAoRE9NLWxlc3MgSmF2YVNjcmlwdCBpbnRlcnByZXRlcnMgbGlrZSBSaGlubyBvciBWOCxcbi8vIGZvciBleGFtcGxlKS4gU2VlIGJvb3RzdHJhcC8gZm9yIG1vcmUgaW5mb3JtYXRpb24uXG5cblxuLyoqXG4gKiBAZGVmaW5lIHtib29sZWFufSBXaGV0aGVyIHRvIGVuYWJsZSB0aGUgZGVidWcgbG9hZGVyLlxuICpcbiAqIElmIGVuYWJsZWQsIGEgY2FsbCB0byBnb29nLnJlcXVpcmUoKSB3aWxsIGF0dGVtcHQgdG8gbG9hZCB0aGUgbmFtZXNwYWNlIGJ5XG4gKiBhcHBlbmRpbmcgYSBzY3JpcHQgdGFnIHRvIHRoZSBET00gKGlmIHRoZSBuYW1lc3BhY2UgaGFzIGJlZW4gcmVnaXN0ZXJlZCkuXG4gKlxuICogSWYgZGlzYWJsZWQsIGdvb2cucmVxdWlyZSgpIHdpbGwgc2ltcGx5IGFzc2VydCB0aGF0IHRoZSBuYW1lc3BhY2UgaGFzIGJlZW5cbiAqIHByb3ZpZGVkIChhbmQgZGVwZW5kIG9uIHRoZSBmYWN0IHRoYXQgc29tZSBvdXRzaWRlIHRvb2wgY29ycmVjdGx5IG9yZGVyZWRcbiAqIHRoZSBzY3JpcHQpLlxuICovXG5nb29nLkVOQUJMRV9ERUJVR19MT0FERVIgPSB0cnVlO1xuXG5cbi8qKlxuICogSW1wbGVtZW50cyBhIHN5c3RlbSBmb3IgdGhlIGR5bmFtaWMgcmVzb2x1dGlvbiBvZiBkZXBlbmRlbmNpZXNcbiAqIHRoYXQgd29ya3MgaW4gcGFyYWxsZWwgd2l0aCB0aGUgQlVJTEQgc3lzdGVtLiBOb3RlIHRoYXQgYWxsIGNhbGxzXG4gKiB0byBnb29nLnJlcXVpcmUgd2lsbCBiZSBzdHJpcHBlZCBieSB0aGUgSlNDb21waWxlciB3aGVuIHRoZVxuICogLS1jbG9zdXJlX3Bhc3Mgb3B0aW9uIGlzIHVzZWQuXG4gKiBAc2VlIGdvb2cucHJvdmlkZVxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgTmFtZXNwYWNlIHRvIGluY2x1ZGUgKGFzIHdhcyBnaXZlbiBpbiBnb29nLnByb3ZpZGUoKSlcbiAqICAgICBpbiB0aGUgZm9ybSBcImdvb2cucGFja2FnZS5wYXJ0XCIuXG4gKi9cbmdvb2cucmVxdWlyZSA9IGZ1bmN0aW9uKG5hbWUpIHtcblxuICAvLyBpZiB0aGUgb2JqZWN0IGFscmVhZHkgZXhpc3RzIHdlIGRvIG5vdCBuZWVkIGRvIGRvIGFueXRoaW5nXG4gIC8vIFRPRE8oYXJ2KTogSWYgd2Ugc3RhcnQgdG8gc3VwcG9ydCByZXF1aXJlIGJhc2VkIG9uIGZpbGUgbmFtZSB0aGlzIGhhc1xuICAvLyAgICAgICAgICAgIHRvIGNoYW5nZVxuICAvLyBUT0RPKGFydik6IElmIHdlIGFsbG93IGdvb2cuZm9vLiogdGhpcyBoYXMgdG8gY2hhbmdlXG4gIC8vIFRPRE8oYXJ2KTogSWYgd2UgaW1wbGVtZW50IGR5bmFtaWMgbG9hZCBhZnRlciBwYWdlIGxvYWQgd2Ugc2hvdWxkIHByb2JhYmx5XG4gIC8vICAgICAgICAgICAgbm90IHJlbW92ZSB0aGlzIGNvZGUgZm9yIHRoZSBjb21waWxlZCBvdXRwdXRcbiAgaWYgKCFDT01QSUxFRCkge1xuICAgIGlmIChnb29nLmlzUHJvdmlkZWRfKG5hbWUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGdvb2cuRU5BQkxFX0RFQlVHX0xPQURFUikge1xuICAgICAgdmFyIHBhdGggPSBnb29nLmdldFBhdGhGcm9tRGVwc18obmFtZSk7XG4gICAgICBpZiAocGF0aCkge1xuICAgICAgICBnb29nLmluY2x1ZGVkX1twYXRoXSA9IHRydWU7XG4gICAgICAgIGdvb2cud3JpdGVTY3JpcHRzXygpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGVycm9yTWVzc2FnZSA9ICdnb29nLnJlcXVpcmUgY291bGQgbm90IGZpbmQ6ICcgKyBuYW1lO1xuICAgIGlmIChnb29nLmdsb2JhbC5jb25zb2xlKSB7XG4gICAgICBnb29nLmdsb2JhbC5jb25zb2xlWydlcnJvciddKGVycm9yTWVzc2FnZSk7XG4gICAgfVxuXG5cbiAgICAgIHRocm93IEVycm9yKGVycm9yTWVzc2FnZSk7XG5cbiAgfVxufTtcblxuXG4vKipcbiAqIFBhdGggZm9yIGluY2x1ZGVkIHNjcmlwdHNcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmdvb2cuYmFzZVBhdGggPSAnJztcblxuXG4vKipcbiAqIEEgaG9vayBmb3Igb3ZlcnJpZGluZyB0aGUgYmFzZSBwYXRoLlxuICogQHR5cGUge3N0cmluZ3x1bmRlZmluZWR9XG4gKi9cbmdvb2cuZ2xvYmFsLkNMT1NVUkVfQkFTRV9QQVRIO1xuXG5cbi8qKlxuICogV2hldGhlciB0byB3cml0ZSBvdXQgQ2xvc3VyZSdzIGRlcHMgZmlsZS4gQnkgZGVmYXVsdCxcbiAqIHRoZSBkZXBzIGFyZSB3cml0dGVuLlxuICogQHR5cGUge2Jvb2xlYW58dW5kZWZpbmVkfVxuICovXG5nb29nLmdsb2JhbC5DTE9TVVJFX05PX0RFUFM7XG5cblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRvIGltcG9ydCBhIHNpbmdsZSBzY3JpcHQuIFRoaXMgaXMgbWVhbnQgdG8gYmUgb3ZlcnJpZGRlbiB3aGVuXG4gKiBDbG9zdXJlIGlzIGJlaW5nIHJ1biBpbiBub24tSFRNTCBjb250ZXh0cywgc3VjaCBhcyB3ZWIgd29ya2Vycy4gSXQncyBkZWZpbmVkXG4gKiBpbiB0aGUgZ2xvYmFsIHNjb3BlIHNvIHRoYXQgaXQgY2FuIGJlIHNldCBiZWZvcmUgYmFzZS5qcyBpcyBsb2FkZWQsIHdoaWNoXG4gKiBhbGxvd3MgZGVwcy5qcyB0byBiZSBpbXBvcnRlZCBwcm9wZXJseS5cbiAqXG4gKiBUaGUgZnVuY3Rpb24gaXMgcGFzc2VkIHRoZSBzY3JpcHQgc291cmNlLCB3aGljaCBpcyBhIHJlbGF0aXZlIFVSSS4gSXQgc2hvdWxkXG4gKiByZXR1cm4gdHJ1ZSBpZiB0aGUgc2NyaXB0IHdhcyBpbXBvcnRlZCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5nb29nLmdsb2JhbC5DTE9TVVJFX0lNUE9SVF9TQ1JJUFQ7XG5cblxuLyoqXG4gKiBOdWxsIGZ1bmN0aW9uIHVzZWQgZm9yIGRlZmF1bHQgdmFsdWVzIG9mIGNhbGxiYWNrcywgZXRjLlxuICogQHJldHVybiB7dm9pZH0gTm90aGluZy5cbiAqL1xuZ29vZy5udWxsRnVuY3Rpb24gPSBmdW5jdGlvbigpIHt9O1xuXG5cbi8qKlxuICogVGhlIGlkZW50aXR5IGZ1bmN0aW9uLiBSZXR1cm5zIGl0cyBmaXJzdCBhcmd1bWVudC5cbiAqXG4gKiBAcGFyYW0geyo9fSBvcHRfcmV0dXJuVmFsdWUgVGhlIHNpbmdsZSB2YWx1ZSB0aGF0IHdpbGwgYmUgcmV0dXJuZWQuXG4gKiBAcGFyYW0gey4uLip9IHZhcl9hcmdzIE9wdGlvbmFsIHRyYWlsaW5nIGFyZ3VtZW50cy4gVGhlc2UgYXJlIGlnbm9yZWQuXG4gKiBAcmV0dXJuIHs/fSBUaGUgZmlyc3QgYXJndW1lbnQuIFdlIGNhbid0IGtub3cgdGhlIHR5cGUgLS0ganVzdCBwYXNzIGl0IGFsb25nXG4gKiAgICAgIHdpdGhvdXQgdHlwZS5cbiAqIEBkZXByZWNhdGVkIFVzZSBnb29nLmZ1bmN0aW9ucy5pZGVudGl0eSBpbnN0ZWFkLlxuICovXG5nb29nLmlkZW50aXR5RnVuY3Rpb24gPSBmdW5jdGlvbihvcHRfcmV0dXJuVmFsdWUsIHZhcl9hcmdzKSB7XG4gIHJldHVybiBvcHRfcmV0dXJuVmFsdWU7XG59O1xuXG5cbi8qKlxuICogV2hlbiBkZWZpbmluZyBhIGNsYXNzIEZvbyB3aXRoIGFuIGFic3RyYWN0IG1ldGhvZCBiYXIoKSwgeW91IGNhbiBkbzpcbiAqXG4gKiBGb28ucHJvdG90eXBlLmJhciA9IGdvb2cuYWJzdHJhY3RNZXRob2RcbiAqXG4gKiBOb3cgaWYgYSBzdWJjbGFzcyBvZiBGb28gZmFpbHMgdG8gb3ZlcnJpZGUgYmFyKCksIGFuIGVycm9yXG4gKiB3aWxsIGJlIHRocm93biB3aGVuIGJhcigpIGlzIGludm9rZWQuXG4gKlxuICogTm90ZTogVGhpcyBkb2VzIG5vdCB0YWtlIHRoZSBuYW1lIG9mIHRoZSBmdW5jdGlvbiB0byBvdmVycmlkZSBhc1xuICogYW4gYXJndW1lbnQgYmVjYXVzZSB0aGF0IHdvdWxkIG1ha2UgaXQgbW9yZSBkaWZmaWN1bHQgdG8gb2JmdXNjYXRlXG4gKiBvdXIgSmF2YVNjcmlwdCBjb2RlLlxuICpcbiAqIEB0eXBlIHshRnVuY3Rpb259XG4gKiBAdGhyb3dzIHtFcnJvcn0gd2hlbiBpbnZva2VkIHRvIGluZGljYXRlIHRoZSBtZXRob2Qgc2hvdWxkIGJlXG4gKiAgIG92ZXJyaWRkZW4uXG4gKi9cbmdvb2cuYWJzdHJhY3RNZXRob2QgPSBmdW5jdGlvbigpIHtcbiAgdGhyb3cgRXJyb3IoJ3VuaW1wbGVtZW50ZWQgYWJzdHJhY3QgbWV0aG9kJyk7XG59O1xuXG5cbi8qKlxuICogQWRkcyBhIHtAY29kZSBnZXRJbnN0YW5jZX0gc3RhdGljIG1ldGhvZCB0aGF0IGFsd2F5cyByZXR1cm4gdGhlIHNhbWUgaW5zdGFuY2VcbiAqIG9iamVjdC5cbiAqIEBwYXJhbSB7IUZ1bmN0aW9ufSBjdG9yIFRoZSBjb25zdHJ1Y3RvciBmb3IgdGhlIGNsYXNzIHRvIGFkZCB0aGUgc3RhdGljXG4gKiAgICAgbWV0aG9kIHRvLlxuICovXG5nb29nLmFkZFNpbmdsZXRvbkdldHRlciA9IGZ1bmN0aW9uKGN0b3IpIHtcbiAgY3Rvci5nZXRJbnN0YW5jZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChjdG9yLmluc3RhbmNlXykge1xuICAgICAgcmV0dXJuIGN0b3IuaW5zdGFuY2VfO1xuICAgIH1cbiAgICBpZiAoZ29vZy5ERUJVRykge1xuICAgICAgLy8gTk9URTogSlNDb21waWxlciBjYW4ndCBvcHRpbWl6ZSBhd2F5IEFycmF5I3B1c2guXG4gICAgICBnb29nLmluc3RhbnRpYXRlZFNpbmdsZXRvbnNfW2dvb2cuaW5zdGFudGlhdGVkU2luZ2xldG9uc18ubGVuZ3RoXSA9IGN0b3I7XG4gICAgfVxuICAgIHJldHVybiBjdG9yLmluc3RhbmNlXyA9IG5ldyBjdG9yO1xuICB9O1xufTtcblxuXG4vKipcbiAqIEFsbCBzaW5nbGV0b24gY2xhc3NlcyB0aGF0IGhhdmUgYmVlbiBpbnN0YW50aWF0ZWQsIGZvciB0ZXN0aW5nLiBEb24ndCByZWFkXG4gKiBpdCBkaXJlY3RseSwgdXNlIHRoZSB7QGNvZGUgZ29vZy50ZXN0aW5nLnNpbmdsZXRvbn0gbW9kdWxlLiBUaGUgY29tcGlsZXJcbiAqIHJlbW92ZXMgdGhpcyB2YXJpYWJsZSBpZiB1bnVzZWQuXG4gKiBAdHlwZSB7IUFycmF5LjwhRnVuY3Rpb24+fVxuICogQHByaXZhdGVcbiAqL1xuZ29vZy5pbnN0YW50aWF0ZWRTaW5nbGV0b25zXyA9IFtdO1xuXG5cbmlmICghQ09NUElMRUQgJiYgZ29vZy5FTkFCTEVfREVCVUdfTE9BREVSKSB7XG4gIC8qKlxuICAgKiBPYmplY3QgdXNlZCB0byBrZWVwIHRyYWNrIG9mIHVybHMgdGhhdCBoYXZlIGFscmVhZHkgYmVlbiBhZGRlZC4gVGhpc1xuICAgKiByZWNvcmQgYWxsb3dzIHRoZSBwcmV2ZW50aW9uIG9mIGNpcmN1bGFyIGRlcGVuZGVuY2llcy5cbiAgICogQHR5cGUge09iamVjdH1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdvb2cuaW5jbHVkZWRfID0ge307XG5cblxuICAvKipcbiAgICogVGhpcyBvYmplY3QgaXMgdXNlZCB0byBrZWVwIHRyYWNrIG9mIGRlcGVuZGVuY2llcyBhbmQgb3RoZXIgZGF0YSB0aGF0IGlzXG4gICAqIHVzZWQgZm9yIGxvYWRpbmcgc2NyaXB0c1xuICAgKiBAcHJpdmF0ZVxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgZ29vZy5kZXBlbmRlbmNpZXNfID0ge1xuICAgIHBhdGhUb05hbWVzOiB7fSwgLy8gMSB0byBtYW55XG4gICAgbmFtZVRvUGF0aDoge30sIC8vIDEgdG8gMVxuICAgIHJlcXVpcmVzOiB7fSwgLy8gMSB0byBtYW55XG4gICAgLy8gdXNlZCB3aGVuIHJlc29sdmluZyBkZXBlbmRlbmNpZXMgdG8gcHJldmVudCB1cyBmcm9tXG4gICAgLy8gdmlzaXRpbmcgdGhlIGZpbGUgdHdpY2VcbiAgICB2aXNpdGVkOiB7fSxcbiAgICB3cml0dGVuOiB7fSAvLyB1c2VkIHRvIGtlZXAgdHJhY2sgb2Ygc2NyaXB0IGZpbGVzIHdlIGhhdmUgd3JpdHRlblxuICB9O1xuXG5cbiAgLyoqXG4gICAqIFRyaWVzIHRvIGRldGVjdCB3aGV0aGVyIGlzIGluIHRoZSBjb250ZXh0IG9mIGFuIEhUTUwgZG9jdW1lbnQuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgaXQgbG9va3MgbGlrZSBIVE1MIGRvY3VtZW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ29vZy5pbkh0bWxEb2N1bWVudF8gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZG9jID0gZ29vZy5nbG9iYWwuZG9jdW1lbnQ7XG4gICAgcmV0dXJuIHR5cGVvZiBkb2MgIT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgICAgJ3dyaXRlJyBpbiBkb2M7ICAvLyBYVUxEb2N1bWVudCBtaXNzZXMgd3JpdGUuXG4gIH07XG5cblxuICAvKipcbiAgICogVHJpZXMgdG8gZGV0ZWN0IHRoZSBiYXNlIHBhdGggb2YgdGhlIGJhc2UuanMgc2NyaXB0IHRoYXQgYm9vdHN0cmFwcyBDbG9zdXJlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnb29nLmZpbmRCYXNlUGF0aF8gPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoZ29vZy5nbG9iYWwuQ0xPU1VSRV9CQVNFX1BBVEgpIHtcbiAgICAgIGdvb2cuYmFzZVBhdGggPSBnb29nLmdsb2JhbC5DTE9TVVJFX0JBU0VfUEFUSDtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKCFnb29nLmluSHRtbERvY3VtZW50XygpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBkb2MgPSBnb29nLmdsb2JhbC5kb2N1bWVudDtcbiAgICB2YXIgc2NyaXB0cyA9IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0Jyk7XG4gICAgLy8gU2VhcmNoIGJhY2t3YXJkcyBzaW5jZSB0aGUgY3VycmVudCBzY3JpcHQgaXMgaW4gYWxtb3N0IGFsbCBjYXNlcyB0aGUgb25lXG4gICAgLy8gdGhhdCBoYXMgYmFzZS5qcy5cbiAgICBmb3IgKHZhciBpID0gc2NyaXB0cy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgdmFyIHNyYyA9IHNjcmlwdHNbaV0uc3JjO1xuICAgICAgdmFyIHFtYXJrID0gc3JjLmxhc3RJbmRleE9mKCc/Jyk7XG4gICAgICB2YXIgbCA9IHFtYXJrID09IC0xID8gc3JjLmxlbmd0aCA6IHFtYXJrO1xuICAgICAgaWYgKHNyYy5zdWJzdHIobCAtIDcsIDcpID09ICdiYXNlLmpzJykge1xuICAgICAgICBnb29nLmJhc2VQYXRoID0gc3JjLnN1YnN0cigwLCBsIC0gNyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cblxuICAvKipcbiAgICogSW1wb3J0cyBhIHNjcmlwdCBpZiwgYW5kIG9ubHkgaWYsIHRoYXQgc2NyaXB0IGhhc24ndCBhbHJlYWR5IGJlZW4gaW1wb3J0ZWQuXG4gICAqIChNdXN0IGJlIGNhbGxlZCBhdCBleGVjdXRpb24gdGltZSlcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNyYyBTY3JpcHQgc291cmNlLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ29vZy5pbXBvcnRTY3JpcHRfID0gZnVuY3Rpb24oc3JjKSB7XG4gICAgdmFyIGltcG9ydFNjcmlwdCA9IGdvb2cuZ2xvYmFsLkNMT1NVUkVfSU1QT1JUX1NDUklQVCB8fFxuICAgICAgICBnb29nLndyaXRlU2NyaXB0VGFnXztcbiAgICBpZiAoIWdvb2cuZGVwZW5kZW5jaWVzXy53cml0dGVuW3NyY10gJiYgaW1wb3J0U2NyaXB0KHNyYykpIHtcbiAgICAgIGdvb2cuZGVwZW5kZW5jaWVzXy53cml0dGVuW3NyY10gPSB0cnVlO1xuICAgIH1cbiAgfTtcblxuXG4gIC8qKlxuICAgKiBUaGUgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgaW1wb3J0IGZ1bmN0aW9uLiBXcml0ZXMgYSBzY3JpcHQgdGFnIHRvXG4gICAqIGltcG9ydCB0aGUgc2NyaXB0LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3JjIFRoZSBzY3JpcHQgc291cmNlLlxuICAgKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHRoZSBzY3JpcHQgd2FzIGltcG9ydGVkLCBmYWxzZSBvdGhlcndpc2UuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnb29nLndyaXRlU2NyaXB0VGFnXyA9IGZ1bmN0aW9uKHNyYykge1xuICAgIGlmIChnb29nLmluSHRtbERvY3VtZW50XygpKSB7XG4gICAgICB2YXIgZG9jID0gZ29vZy5nbG9iYWwuZG9jdW1lbnQ7XG4gICAgICBkb2Mud3JpdGUoXG4gICAgICAgICAgJzxzY3JpcHQgdHlwZT1cInRleHQvamF2YXNjcmlwdFwiIHNyYz1cIicgKyBzcmMgKyAnXCI+PC8nICsgJ3NjcmlwdD4nKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9O1xuXG5cbiAgLyoqXG4gICAqIFJlc29sdmVzIGRlcGVuZGVuY2llcyBiYXNlZCBvbiB0aGUgZGVwZW5kZW5jaWVzIGFkZGVkIHVzaW5nIGFkZERlcGVuZGVuY3lcbiAgICogYW5kIGNhbGxzIGltcG9ydFNjcmlwdF8gaW4gdGhlIGNvcnJlY3Qgb3JkZXIuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnb29nLndyaXRlU2NyaXB0c18gPSBmdW5jdGlvbigpIHtcbiAgICAvLyB0aGUgc2NyaXB0cyB3ZSBuZWVkIHRvIHdyaXRlIHRoaXMgdGltZVxuICAgIHZhciBzY3JpcHRzID0gW107XG4gICAgdmFyIHNlZW5TY3JpcHQgPSB7fTtcbiAgICB2YXIgZGVwcyA9IGdvb2cuZGVwZW5kZW5jaWVzXztcblxuICAgIGZ1bmN0aW9uIHZpc2l0Tm9kZShwYXRoKSB7XG4gICAgICBpZiAocGF0aCBpbiBkZXBzLndyaXR0ZW4pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyB3ZSBoYXZlIGFscmVhZHkgdmlzaXRlZCB0aGlzIG9uZS4gV2UgY2FuIGdldCBoZXJlIGlmIHdlIGhhdmUgY3ljbGljXG4gICAgICAvLyBkZXBlbmRlbmNpZXNcbiAgICAgIGlmIChwYXRoIGluIGRlcHMudmlzaXRlZCkge1xuICAgICAgICBpZiAoIShwYXRoIGluIHNlZW5TY3JpcHQpKSB7XG4gICAgICAgICAgc2VlblNjcmlwdFtwYXRoXSA9IHRydWU7XG4gICAgICAgICAgc2NyaXB0cy5wdXNoKHBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZGVwcy52aXNpdGVkW3BhdGhdID0gdHJ1ZTtcblxuICAgICAgaWYgKHBhdGggaW4gZGVwcy5yZXF1aXJlcykge1xuICAgICAgICBmb3IgKHZhciByZXF1aXJlTmFtZSBpbiBkZXBzLnJlcXVpcmVzW3BhdGhdKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIHJlcXVpcmVkIG5hbWUgaXMgZGVmaW5lZCwgd2UgYXNzdW1lIHRoYXQgaXQgd2FzIGFscmVhZHlcbiAgICAgICAgICAvLyBib290c3RyYXBwZWQgYnkgb3RoZXIgbWVhbnMuXG4gICAgICAgICAgaWYgKCFnb29nLmlzUHJvdmlkZWRfKHJlcXVpcmVOYW1lKSkge1xuICAgICAgICAgICAgaWYgKHJlcXVpcmVOYW1lIGluIGRlcHMubmFtZVRvUGF0aCkge1xuICAgICAgICAgICAgICB2aXNpdE5vZGUoZGVwcy5uYW1lVG9QYXRoW3JlcXVpcmVOYW1lXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aHJvdyBFcnJvcignVW5kZWZpbmVkIG5hbWVUb1BhdGggZm9yICcgKyByZXF1aXJlTmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghKHBhdGggaW4gc2VlblNjcmlwdCkpIHtcbiAgICAgICAgc2VlblNjcmlwdFtwYXRoXSA9IHRydWU7XG4gICAgICAgIHNjcmlwdHMucHVzaChwYXRoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBwYXRoIGluIGdvb2cuaW5jbHVkZWRfKSB7XG4gICAgICBpZiAoIWRlcHMud3JpdHRlbltwYXRoXSkge1xuICAgICAgICB2aXNpdE5vZGUocGF0aCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzY3JpcHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoc2NyaXB0c1tpXSkge1xuICAgICAgICBnb29nLmltcG9ydFNjcmlwdF8oZ29vZy5iYXNlUGF0aCArIHNjcmlwdHNbaV0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ1VuZGVmaW5lZCBzY3JpcHQgaW5wdXQnKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cblxuICAvKipcbiAgICogTG9va3MgYXQgdGhlIGRlcGVuZGVuY3kgcnVsZXMgYW5kIHRyaWVzIHRvIGRldGVybWluZSB0aGUgc2NyaXB0IGZpbGUgdGhhdFxuICAgKiBmdWxmaWxscyBhIHBhcnRpY3VsYXIgcnVsZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHJ1bGUgSW4gdGhlIGZvcm0gZ29vZy5uYW1lc3BhY2UuQ2xhc3Mgb3IgcHJvamVjdC5zY3JpcHQuXG4gICAqIEByZXR1cm4gez9zdHJpbmd9IFVybCBjb3JyZXNwb25kaW5nIHRvIHRoZSBydWxlLCBvciBudWxsLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ29vZy5nZXRQYXRoRnJvbURlcHNfID0gZnVuY3Rpb24ocnVsZSkge1xuICAgIGlmIChydWxlIGluIGdvb2cuZGVwZW5kZW5jaWVzXy5uYW1lVG9QYXRoKSB7XG4gICAgICByZXR1cm4gZ29vZy5kZXBlbmRlbmNpZXNfLm5hbWVUb1BhdGhbcnVsZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfTtcblxuICBnb29nLmZpbmRCYXNlUGF0aF8oKTtcblxuICAvLyBBbGxvdyBwcm9qZWN0cyB0byBtYW5hZ2UgdGhlIGRlcHMgZmlsZXMgdGhlbXNlbHZlcy5cbiAgaWYgKCFnb29nLmdsb2JhbC5DTE9TVVJFX05PX0RFUFMpIHtcbiAgICBnb29nLmltcG9ydFNjcmlwdF8oZ29vZy5iYXNlUGF0aCArICdkZXBzLmpzJyk7XG4gIH1cbn1cblxuXG5cbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBMYW5ndWFnZSBFbmhhbmNlbWVudHNcbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cblxuLyoqXG4gKiBUaGlzIGlzIGEgXCJmaXhlZFwiIHZlcnNpb24gb2YgdGhlIHR5cGVvZiBvcGVyYXRvci4gIEl0IGRpZmZlcnMgZnJvbSB0aGUgdHlwZW9mXG4gKiBvcGVyYXRvciBpbiBzdWNoIGEgd2F5IHRoYXQgbnVsbCByZXR1cm5zICdudWxsJyBhbmQgYXJyYXlzIHJldHVybiAnYXJyYXknLlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gZ2V0IHRoZSB0eXBlIG9mLlxuICogQHJldHVybiB7c3RyaW5nfSBUaGUgbmFtZSBvZiB0aGUgdHlwZS5cbiAqL1xuZ29vZy50eXBlT2YgPSBmdW5jdGlvbih2YWx1ZSkge1xuICB2YXIgcyA9IHR5cGVvZiB2YWx1ZTtcbiAgaWYgKHMgPT0gJ29iamVjdCcpIHtcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIC8vIENoZWNrIHRoZXNlIGZpcnN0LCBzbyB3ZSBjYW4gYXZvaWQgY2FsbGluZyBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nIGlmXG4gICAgICAvLyBwb3NzaWJsZS5cbiAgICAgIC8vXG4gICAgICAvLyBJRSBpbXByb3Blcmx5IG1hcnNoYWxzIHR5ZXBvZiBhY3Jvc3MgZXhlY3V0aW9uIGNvbnRleHRzLCBidXQgYVxuICAgICAgLy8gY3Jvc3MtY29udGV4dCBvYmplY3Qgd2lsbCBzdGlsbCByZXR1cm4gZmFsc2UgZm9yIFwiaW5zdGFuY2VvZiBPYmplY3RcIi5cbiAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIHJldHVybiAnYXJyYXknO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICByZXR1cm4gcztcbiAgICAgIH1cblxuICAgICAgLy8gSEFDSzogSW4gb3JkZXIgdG8gdXNlIGFuIE9iamVjdCBwcm90b3R5cGUgbWV0aG9kIG9uIHRoZSBhcmJpdHJhcnlcbiAgICAgIC8vICAgdmFsdWUsIHRoZSBjb21waWxlciByZXF1aXJlcyB0aGUgdmFsdWUgYmUgY2FzdCB0byB0eXBlIE9iamVjdCxcbiAgICAgIC8vICAgZXZlbiB0aG91Z2ggdGhlIEVDTUEgc3BlYyBleHBsaWNpdGx5IGFsbG93cyBpdC5cbiAgICAgIHZhciBjbGFzc05hbWUgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoXG4gICAgICAgICAgLyoqIEB0eXBlIHtPYmplY3R9ICovICh2YWx1ZSkpO1xuICAgICAgLy8gSW4gRmlyZWZveCAzLjYsIGF0dGVtcHRpbmcgdG8gYWNjZXNzIGlmcmFtZSB3aW5kb3cgb2JqZWN0cycgbGVuZ3RoXG4gICAgICAvLyBwcm9wZXJ0eSB0aHJvd3MgYW4gTlNfRVJST1JfRkFJTFVSRSwgc28gd2UgbmVlZCB0byBzcGVjaWFsLWNhc2UgaXRcbiAgICAgIC8vIGhlcmUuXG4gICAgICBpZiAoY2xhc3NOYW1lID09ICdbb2JqZWN0IFdpbmRvd10nKSB7XG4gICAgICAgIHJldHVybiAnb2JqZWN0JztcbiAgICAgIH1cblxuICAgICAgLy8gV2UgY2Fubm90IGFsd2F5cyB1c2UgY29uc3RydWN0b3IgPT0gQXJyYXkgb3IgaW5zdGFuY2VvZiBBcnJheSBiZWNhdXNlXG4gICAgICAvLyBkaWZmZXJlbnQgZnJhbWVzIGhhdmUgZGlmZmVyZW50IEFycmF5IG9iamVjdHMuIEluIElFNiwgaWYgdGhlIGlmcmFtZVxuICAgICAgLy8gd2hlcmUgdGhlIGFycmF5IHdhcyBjcmVhdGVkIGlzIGRlc3Ryb3llZCwgdGhlIGFycmF5IGxvc2VzIGl0c1xuICAgICAgLy8gcHJvdG90eXBlLiBUaGVuIGRlcmVmZXJlbmNpbmcgdmFsLnNwbGljZSBoZXJlIHRocm93cyBhbiBleGNlcHRpb24sIHNvXG4gICAgICAvLyB3ZSBjYW4ndCB1c2UgZ29vZy5pc0Z1bmN0aW9uLiBDYWxsaW5nIHR5cGVvZiBkaXJlY3RseSByZXR1cm5zICd1bmtub3duJ1xuICAgICAgLy8gc28gdGhhdCB3aWxsIHdvcmsuIEluIHRoaXMgY2FzZSwgdGhpcyBmdW5jdGlvbiB3aWxsIHJldHVybiBmYWxzZSBhbmRcbiAgICAgIC8vIG1vc3QgYXJyYXkgZnVuY3Rpb25zIHdpbGwgc3RpbGwgd29yayBiZWNhdXNlIHRoZSBhcnJheSBpcyBzdGlsbFxuICAgICAgLy8gYXJyYXktbGlrZSAoc3VwcG9ydHMgbGVuZ3RoIGFuZCBbXSkgZXZlbiB0aG91Z2ggaXQgaGFzIGxvc3QgaXRzXG4gICAgICAvLyBwcm90b3R5cGUuXG4gICAgICAvLyBNYXJrIE1pbGxlciBub3RpY2VkIHRoYXQgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ1xuICAgICAgLy8gYWxsb3dzIGFjY2VzcyB0byB0aGUgdW5mb3JnZWFibGUgW1tDbGFzc11dIHByb3BlcnR5LlxuICAgICAgLy8gIDE1LjIuNC4yIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcgKCApXG4gICAgICAvLyAgV2hlbiB0aGUgdG9TdHJpbmcgbWV0aG9kIGlzIGNhbGxlZCwgdGhlIGZvbGxvd2luZyBzdGVwcyBhcmUgdGFrZW46XG4gICAgICAvLyAgICAgIDEuIEdldCB0aGUgW1tDbGFzc11dIHByb3BlcnR5IG9mIHRoaXMgb2JqZWN0LlxuICAgICAgLy8gICAgICAyLiBDb21wdXRlIGEgc3RyaW5nIHZhbHVlIGJ5IGNvbmNhdGVuYXRpbmcgdGhlIHRocmVlIHN0cmluZ3NcbiAgICAgIC8vICAgICAgICAgXCJbb2JqZWN0IFwiLCBSZXN1bHQoMSksIGFuZCBcIl1cIi5cbiAgICAgIC8vICAgICAgMy4gUmV0dXJuIFJlc3VsdCgyKS5cbiAgICAgIC8vIGFuZCB0aGlzIGJlaGF2aW9yIHN1cnZpdmVzIHRoZSBkZXN0cnVjdGlvbiBvZiB0aGUgZXhlY3V0aW9uIGNvbnRleHQuXG4gICAgICBpZiAoKGNsYXNzTmFtZSA9PSAnW29iamVjdCBBcnJheV0nIHx8XG4gICAgICAgICAgIC8vIEluIElFIGFsbCBub24gdmFsdWUgdHlwZXMgYXJlIHdyYXBwZWQgYXMgb2JqZWN0cyBhY3Jvc3Mgd2luZG93XG4gICAgICAgICAgIC8vIGJvdW5kYXJpZXMgKG5vdCBpZnJhbWUgdGhvdWdoKSBzbyB3ZSBoYXZlIHRvIGRvIG9iamVjdCBkZXRlY3Rpb25cbiAgICAgICAgICAgLy8gZm9yIHRoaXMgZWRnZSBjYXNlXG4gICAgICAgICAgIHR5cGVvZiB2YWx1ZS5sZW5ndGggPT0gJ251bWJlcicgJiZcbiAgICAgICAgICAgdHlwZW9mIHZhbHVlLnNwbGljZSAhPSAndW5kZWZpbmVkJyAmJlxuICAgICAgICAgICB0eXBlb2YgdmFsdWUucHJvcGVydHlJc0VudW1lcmFibGUgIT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgICAgIXZhbHVlLnByb3BlcnR5SXNFbnVtZXJhYmxlKCdzcGxpY2UnKVxuXG4gICAgICAgICAgKSkge1xuICAgICAgICByZXR1cm4gJ2FycmF5JztcbiAgICAgIH1cbiAgICAgIC8vIEhBQ0s6IFRoZXJlIGlzIHN0aWxsIGFuIGFycmF5IGNhc2UgdGhhdCBmYWlscy5cbiAgICAgIC8vICAgICBmdW5jdGlvbiBBcnJheUltcG9zdG9yKCkge31cbiAgICAgIC8vICAgICBBcnJheUltcG9zdG9yLnByb3RvdHlwZSA9IFtdO1xuICAgICAgLy8gICAgIHZhciBpbXBvc3RvciA9IG5ldyBBcnJheUltcG9zdG9yO1xuICAgICAgLy8gdGhpcyBjYW4gYmUgZml4ZWQgYnkgZ2V0dGluZyByaWQgb2YgdGhlIGZhc3QgcGF0aFxuICAgICAgLy8gKHZhbHVlIGluc3RhbmNlb2YgQXJyYXkpIGFuZCBzb2xlbHkgcmVseWluZyBvblxuICAgICAgLy8gKHZhbHVlICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcudmFsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEFycmF5XScpXG4gICAgICAvLyBidXQgdGhhdCB3b3VsZCByZXF1aXJlIG1hbnkgbW9yZSBmdW5jdGlvbiBjYWxscyBhbmQgaXMgbm90IHdhcnJhbnRlZFxuICAgICAgLy8gdW5sZXNzIGNsb3N1cmUgY29kZSBpcyByZWNlaXZpbmcgb2JqZWN0cyBmcm9tIHVudHJ1c3RlZCBzb3VyY2VzLlxuXG4gICAgICAvLyBJRSBpbiBjcm9zcy13aW5kb3cgY2FsbHMgZG9lcyBub3QgY29ycmVjdGx5IG1hcnNoYWwgdGhlIGZ1bmN0aW9uIHR5cGVcbiAgICAgIC8vIChpdCBhcHBlYXJzIGp1c3QgYXMgYW4gb2JqZWN0KSBzbyB3ZSBjYW5ub3QgdXNlIGp1c3QgdHlwZW9mIHZhbCA9PVxuICAgICAgLy8gJ2Z1bmN0aW9uJy4gSG93ZXZlciwgaWYgdGhlIG9iamVjdCBoYXMgYSBjYWxsIHByb3BlcnR5LCBpdCBpcyBhXG4gICAgICAvLyBmdW5jdGlvbi5cbiAgICAgIGlmICgoY2xhc3NOYW1lID09ICdbb2JqZWN0IEZ1bmN0aW9uXScgfHxcbiAgICAgICAgICB0eXBlb2YgdmFsdWUuY2FsbCAhPSAndW5kZWZpbmVkJyAmJlxuICAgICAgICAgIHR5cGVvZiB2YWx1ZS5wcm9wZXJ0eUlzRW51bWVyYWJsZSAhPSAndW5kZWZpbmVkJyAmJlxuICAgICAgICAgICF2YWx1ZS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgnY2FsbCcpKSkge1xuICAgICAgICByZXR1cm4gJ2Z1bmN0aW9uJztcbiAgICAgIH1cblxuXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnbnVsbCc7XG4gICAgfVxuXG4gIH0gZWxzZSBpZiAocyA9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiB2YWx1ZS5jYWxsID09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gSW4gU2FmYXJpIHR5cGVvZiBub2RlTGlzdCByZXR1cm5zICdmdW5jdGlvbicsIGFuZCBvbiBGaXJlZm94XG4gICAgLy8gdHlwZW9mIGJlaGF2ZXMgc2ltaWxhcmx5IGZvciBIVE1Me0FwcGxldCxFbWJlZCxPYmplY3R9RWxlbWVudHNcbiAgICAvLyBhbmQgUmVnRXhwcy4gIFdlIHdvdWxkIGxpa2UgdG8gcmV0dXJuIG9iamVjdCBmb3IgdGhvc2UgYW5kIHdlIGNhblxuICAgIC8vIGRldGVjdCBhbiBpbnZhbGlkIGZ1bmN0aW9uIGJ5IG1ha2luZyBzdXJlIHRoYXQgdGhlIGZ1bmN0aW9uXG4gICAgLy8gb2JqZWN0IGhhcyBhIGNhbGwgbWV0aG9kLlxuICAgIHJldHVybiAnb2JqZWN0JztcbiAgfVxuICByZXR1cm4gcztcbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHNwZWNpZmllZCB2YWx1ZSBpcyBub3QgfHVuZGVmaW5lZHwuXG4gKiBXQVJOSU5HOiBEbyBub3QgdXNlIHRoaXMgdG8gdGVzdCBpZiBhbiBvYmplY3QgaGFzIGEgcHJvcGVydHkuIFVzZSB0aGUgaW5cbiAqIG9wZXJhdG9yIGluc3RlYWQuICBBZGRpdGlvbmFsbHksIHRoaXMgZnVuY3Rpb24gYXNzdW1lcyB0aGF0IHRoZSBnbG9iYWxcbiAqIHVuZGVmaW5lZCB2YXJpYWJsZSBoYXMgbm90IGJlZW4gcmVkZWZpbmVkLlxuICogQHBhcmFtIHsqfSB2YWwgVmFyaWFibGUgdG8gdGVzdC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdmFyaWFibGUgaXMgZGVmaW5lZC5cbiAqL1xuZ29vZy5pc0RlZiA9IGZ1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdmFsICE9PSB1bmRlZmluZWQ7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBzcGVjaWZpZWQgdmFsdWUgaXMgfG51bGx8XG4gKiBAcGFyYW0geyp9IHZhbCBWYXJpYWJsZSB0byB0ZXN0LlxuICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB2YXJpYWJsZSBpcyBudWxsLlxuICovXG5nb29nLmlzTnVsbCA9IGZ1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdmFsID09PSBudWxsO1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIGRlZmluZWQgYW5kIG5vdCBudWxsXG4gKiBAcGFyYW0geyp9IHZhbCBWYXJpYWJsZSB0byB0ZXN0LlxuICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB2YXJpYWJsZSBpcyBkZWZpbmVkIGFuZCBub3QgbnVsbC5cbiAqL1xuZ29vZy5pc0RlZkFuZE5vdE51bGwgPSBmdW5jdGlvbih2YWwpIHtcbiAgLy8gTm90ZSB0aGF0IHVuZGVmaW5lZCA9PSBudWxsLlxuICByZXR1cm4gdmFsICE9IG51bGw7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBzcGVjaWZpZWQgdmFsdWUgaXMgYW4gYXJyYXlcbiAqIEBwYXJhbSB7Kn0gdmFsIFZhcmlhYmxlIHRvIHRlc3QuXG4gKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHZhcmlhYmxlIGlzIGFuIGFycmF5LlxuICovXG5nb29nLmlzQXJyYXkgPSBmdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIGdvb2cudHlwZU9mKHZhbCkgPT0gJ2FycmF5Jztcbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIG9iamVjdCBsb29rcyBsaWtlIGFuIGFycmF5LiBUbyBxdWFsaWZ5IGFzIGFycmF5IGxpa2VcbiAqIHRoZSB2YWx1ZSBuZWVkcyB0byBiZSBlaXRoZXIgYSBOb2RlTGlzdCBvciBhbiBvYmplY3Qgd2l0aCBhIE51bWJlciBsZW5ndGhcbiAqIHByb3BlcnR5LlxuICogQHBhcmFtIHsqfSB2YWwgVmFyaWFibGUgdG8gdGVzdC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdmFyaWFibGUgaXMgYW4gYXJyYXkuXG4gKi9cbmdvb2cuaXNBcnJheUxpa2UgPSBmdW5jdGlvbih2YWwpIHtcbiAgdmFyIHR5cGUgPSBnb29nLnR5cGVPZih2YWwpO1xuICByZXR1cm4gdHlwZSA9PSAnYXJyYXknIHx8IHR5cGUgPT0gJ29iamVjdCcgJiYgdHlwZW9mIHZhbC5sZW5ndGggPT0gJ251bWJlcic7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBvYmplY3QgbG9va3MgbGlrZSBhIERhdGUuIFRvIHF1YWxpZnkgYXMgRGF0ZS1saWtlXG4gKiB0aGUgdmFsdWUgbmVlZHMgdG8gYmUgYW4gb2JqZWN0IGFuZCBoYXZlIGEgZ2V0RnVsbFllYXIoKSBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7Kn0gdmFsIFZhcmlhYmxlIHRvIHRlc3QuXG4gKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHZhcmlhYmxlIGlzIGEgbGlrZSBhIERhdGUuXG4gKi9cbmdvb2cuaXNEYXRlTGlrZSA9IGZ1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gZ29vZy5pc09iamVjdCh2YWwpICYmIHR5cGVvZiB2YWwuZ2V0RnVsbFllYXIgPT0gJ2Z1bmN0aW9uJztcbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHNwZWNpZmllZCB2YWx1ZSBpcyBhIHN0cmluZ1xuICogQHBhcmFtIHsqfSB2YWwgVmFyaWFibGUgdG8gdGVzdC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdmFyaWFibGUgaXMgYSBzdHJpbmcuXG4gKi9cbmdvb2cuaXNTdHJpbmcgPSBmdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT0gJ3N0cmluZyc7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBzcGVjaWZpZWQgdmFsdWUgaXMgYSBib29sZWFuXG4gKiBAcGFyYW0geyp9IHZhbCBWYXJpYWJsZSB0byB0ZXN0LlxuICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciB2YXJpYWJsZSBpcyBib29sZWFuLlxuICovXG5nb29nLmlzQm9vbGVhbiA9IGZ1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PSAnYm9vbGVhbic7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBzcGVjaWZpZWQgdmFsdWUgaXMgYSBudW1iZXJcbiAqIEBwYXJhbSB7Kn0gdmFsIFZhcmlhYmxlIHRvIHRlc3QuXG4gKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHZhcmlhYmxlIGlzIGEgbnVtYmVyLlxuICovXG5nb29nLmlzTnVtYmVyID0gZnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09ICdudW1iZXInO1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIGEgZnVuY3Rpb25cbiAqIEBwYXJhbSB7Kn0gdmFsIFZhcmlhYmxlIHRvIHRlc3QuXG4gKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHZhcmlhYmxlIGlzIGEgZnVuY3Rpb24uXG4gKi9cbmdvb2cuaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gZ29vZy50eXBlT2YodmFsKSA9PSAnZnVuY3Rpb24nO1xufTtcblxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIGFuIG9iamVjdC4gIFRoaXMgaW5jbHVkZXMgYXJyYXlzXG4gKiBhbmQgZnVuY3Rpb25zLlxuICogQHBhcmFtIHsqfSB2YWwgVmFyaWFibGUgdG8gdGVzdC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFdoZXRoZXIgdmFyaWFibGUgaXMgYW4gb2JqZWN0LlxuICovXG5nb29nLmlzT2JqZWN0ID0gZnVuY3Rpb24odmFsKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbDtcbiAgcmV0dXJuIHR5cGUgPT0gJ29iamVjdCcgJiYgdmFsICE9IG51bGwgfHwgdHlwZSA9PSAnZnVuY3Rpb24nO1xuICAvLyByZXR1cm4gT2JqZWN0KHZhbCkgPT09IHZhbCBhbHNvIHdvcmtzLCBidXQgaXMgc2xvd2VyLCBlc3BlY2lhbGx5IGlmIHZhbCBpc1xuICAvLyBub3QgYW4gb2JqZWN0LlxufTtcblxuXG4vKipcbiAqIEdldHMgYSB1bmlxdWUgSUQgZm9yIGFuIG9iamVjdC4gVGhpcyBtdXRhdGVzIHRoZSBvYmplY3Qgc28gdGhhdCBmdXJ0aGVyXG4gKiBjYWxscyB3aXRoIHRoZSBzYW1lIG9iamVjdCBhcyBhIHBhcmFtZXRlciByZXR1cm5zIHRoZSBzYW1lIHZhbHVlLiBUaGUgdW5pcXVlXG4gKiBJRCBpcyBndWFyYW50ZWVkIHRvIGJlIHVuaXF1ZSBhY3Jvc3MgdGhlIGN1cnJlbnQgc2Vzc2lvbiBhbW9uZ3N0IG9iamVjdHMgdGhhdFxuICogYXJlIHBhc3NlZCBpbnRvIHtAY29kZSBnZXRVaWR9LiBUaGVyZSBpcyBubyBndWFyYW50ZWUgdGhhdCB0aGUgSUQgaXMgdW5pcXVlXG4gKiBvciBjb25zaXN0ZW50IGFjcm9zcyBzZXNzaW9ucy4gSXQgaXMgdW5zYWZlIHRvIGdlbmVyYXRlIHVuaXF1ZSBJRCBmb3JcbiAqIGZ1bmN0aW9uIHByb3RvdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIGdldCB0aGUgdW5pcXVlIElEIGZvci5cbiAqIEByZXR1cm4ge251bWJlcn0gVGhlIHVuaXF1ZSBJRCBmb3IgdGhlIG9iamVjdC5cbiAqL1xuZ29vZy5nZXRVaWQgPSBmdW5jdGlvbihvYmopIHtcbiAgLy8gVE9ETyhhcnYpOiBNYWtlIHRoZSB0eXBlIHN0cmljdGVyLCBkbyBub3QgYWNjZXB0IG51bGwuXG5cbiAgLy8gSW4gT3BlcmEgd2luZG93Lmhhc093blByb3BlcnR5IGV4aXN0cyBidXQgYWx3YXlzIHJldHVybnMgZmFsc2Ugc28gd2UgYXZvaWRcbiAgLy8gdXNpbmcgaXQuIEFzIGEgY29uc2VxdWVuY2UgdGhlIHVuaXF1ZSBJRCBnZW5lcmF0ZWQgZm9yIEJhc2VDbGFzcy5wcm90b3R5cGVcbiAgLy8gYW5kIFN1YkNsYXNzLnByb3RvdHlwZSB3aWxsIGJlIHRoZSBzYW1lLlxuICByZXR1cm4gb2JqW2dvb2cuVUlEX1BST1BFUlRZX10gfHxcbiAgICAgIChvYmpbZ29vZy5VSURfUFJPUEVSVFlfXSA9ICsrZ29vZy51aWRDb3VudGVyXyk7XG59O1xuXG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgdW5pcXVlIElEIGZyb20gYW4gb2JqZWN0LiBUaGlzIGlzIHVzZWZ1bCBpZiB0aGUgb2JqZWN0IHdhc1xuICogcHJldmlvdXNseSBtdXRhdGVkIHVzaW5nIHtAY29kZSBnb29nLmdldFVpZH0gaW4gd2hpY2ggY2FzZSB0aGUgbXV0YXRpb24gaXNcbiAqIHVuZG9uZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byByZW1vdmUgdGhlIHVuaXF1ZSBJRCBmaWVsZCBmcm9tLlxuICovXG5nb29nLnJlbW92ZVVpZCA9IGZ1bmN0aW9uKG9iaikge1xuICAvLyBUT0RPKGFydik6IE1ha2UgdGhlIHR5cGUgc3RyaWN0ZXIsIGRvIG5vdCBhY2NlcHQgbnVsbC5cblxuICAvLyBET00gbm9kZXMgaW4gSUUgYXJlIG5vdCBpbnN0YW5jZSBvZiBPYmplY3QgYW5kIHRocm93cyBleGNlcHRpb25cbiAgLy8gZm9yIGRlbGV0ZS4gSW5zdGVhZCB3ZSB0cnkgdG8gdXNlIHJlbW92ZUF0dHJpYnV0ZVxuICBpZiAoJ3JlbW92ZUF0dHJpYnV0ZScgaW4gb2JqKSB7XG4gICAgb2JqLnJlbW92ZUF0dHJpYnV0ZShnb29nLlVJRF9QUk9QRVJUWV8pO1xuICB9XG4gIC8qKiBAcHJlc2VydmVUcnkgKi9cbiAgdHJ5IHtcbiAgICBkZWxldGUgb2JqW2dvb2cuVUlEX1BST1BFUlRZX107XG4gIH0gY2F0Y2ggKGV4KSB7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBOYW1lIGZvciB1bmlxdWUgSUQgcHJvcGVydHkuIEluaXRpYWxpemVkIGluIGEgd2F5IHRvIGhlbHAgYXZvaWQgY29sbGlzaW9uc1xuICogd2l0aCBvdGhlciBjbG9zdXJlIGphdmFzY3JpcHQgb24gdGhlIHNhbWUgcGFnZS5cbiAqIEB0eXBlIHtzdHJpbmd9XG4gKiBAcHJpdmF0ZVxuICovXG5nb29nLlVJRF9QUk9QRVJUWV8gPSAnY2xvc3VyZV91aWRfJyArXG4gICAgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjE0NzQ4MzY0OCkudG9TdHJpbmcoMzYpO1xuXG5cbi8qKlxuICogQ291bnRlciBmb3IgVUlELlxuICogQHR5cGUge251bWJlcn1cbiAqIEBwcml2YXRlXG4gKi9cbmdvb2cudWlkQ291bnRlcl8gPSAwO1xuXG5cbi8qKlxuICogQWRkcyBhIGhhc2ggY29kZSBmaWVsZCB0byBhbiBvYmplY3QuIFRoZSBoYXNoIGNvZGUgaXMgdW5pcXVlIGZvciB0aGVcbiAqIGdpdmVuIG9iamVjdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBnZXQgdGhlIGhhc2ggY29kZSBmb3IuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBoYXNoIGNvZGUgZm9yIHRoZSBvYmplY3QuXG4gKiBAZGVwcmVjYXRlZCBVc2UgZ29vZy5nZXRVaWQgaW5zdGVhZC5cbiAqL1xuZ29vZy5nZXRIYXNoQ29kZSA9IGdvb2cuZ2V0VWlkO1xuXG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgaGFzaCBjb2RlIGZpZWxkIGZyb20gYW4gb2JqZWN0LlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHJlbW92ZSB0aGUgZmllbGQgZnJvbS5cbiAqIEBkZXByZWNhdGVkIFVzZSBnb29nLnJlbW92ZVVpZCBpbnN0ZWFkLlxuICovXG5nb29nLnJlbW92ZUhhc2hDb2RlID0gZ29vZy5yZW1vdmVVaWQ7XG5cblxuLyoqXG4gKiBDbG9uZXMgYSB2YWx1ZS4gVGhlIGlucHV0IG1heSBiZSBhbiBPYmplY3QsIEFycmF5LCBvciBiYXNpYyB0eXBlLiBPYmplY3RzIGFuZFxuICogYXJyYXlzIHdpbGwgYmUgY2xvbmVkIHJlY3Vyc2l2ZWx5LlxuICpcbiAqIFdBUk5JTkdTOlxuICogPGNvZGU+Z29vZy5jbG9uZU9iamVjdDwvY29kZT4gZG9lcyBub3QgZGV0ZWN0IHJlZmVyZW5jZSBsb29wcy4gT2JqZWN0cyB0aGF0XG4gKiByZWZlciB0byB0aGVtc2VsdmVzIHdpbGwgY2F1c2UgaW5maW5pdGUgcmVjdXJzaW9uLlxuICpcbiAqIDxjb2RlPmdvb2cuY2xvbmVPYmplY3Q8L2NvZGU+IGlzIHVuYXdhcmUgb2YgdW5pcXVlIGlkZW50aWZpZXJzLCBhbmQgY29waWVzXG4gKiBVSURzIGNyZWF0ZWQgYnkgPGNvZGU+Z2V0VWlkPC9jb2RlPiBpbnRvIGNsb25lZCByZXN1bHRzLlxuICpcbiAqIEBwYXJhbSB7Kn0gb2JqIFRoZSB2YWx1ZSB0byBjbG9uZS5cbiAqIEByZXR1cm4geyp9IEEgY2xvbmUgb2YgdGhlIGlucHV0IHZhbHVlLlxuICogQGRlcHJlY2F0ZWQgZ29vZy5jbG9uZU9iamVjdCBpcyB1bnNhZmUuIFByZWZlciB0aGUgZ29vZy5vYmplY3QgbWV0aG9kcy5cbiAqL1xuZ29vZy5jbG9uZU9iamVjdCA9IGZ1bmN0aW9uKG9iaikge1xuICB2YXIgdHlwZSA9IGdvb2cudHlwZU9mKG9iaik7XG4gIGlmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2FycmF5Jykge1xuICAgIGlmIChvYmouY2xvbmUpIHtcbiAgICAgIHJldHVybiBvYmouY2xvbmUoKTtcbiAgICB9XG4gICAgdmFyIGNsb25lID0gdHlwZSA9PSAnYXJyYXknID8gW10gOiB7fTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBjbG9uZVtrZXldID0gZ29vZy5jbG9uZU9iamVjdChvYmpba2V5XSk7XG4gICAgfVxuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59O1xuXG5cbi8qKlxuICogRm9yd2FyZCBkZWNsYXJhdGlvbiBmb3IgdGhlIGNsb25lIG1ldGhvZC4gVGhpcyBpcyBuZWNlc3NhcnkgdW50aWwgdGhlXG4gKiBjb21waWxlciBjYW4gYmV0dGVyIHN1cHBvcnQgZHVjay10eXBpbmcgY29uc3RydWN0cyBhcyB1c2VkIGluXG4gKiBnb29nLmNsb25lT2JqZWN0LlxuICpcbiAqIFRPRE8oYnJlbm5lbWFuKTogUmVtb3ZlIG9uY2UgdGhlIEpTQ29tcGlsZXIgY2FuIGluZmVyIHRoYXQgdGhlIGNoZWNrIGZvclxuICogcHJvdG8uY2xvbmUgaXMgc2FmZSBpbiBnb29nLmNsb25lT2JqZWN0LlxuICpcbiAqIEB0eXBlIHtGdW5jdGlvbn1cbiAqL1xuT2JqZWN0LnByb3RvdHlwZS5jbG9uZTtcblxuXG4vKipcbiAqIEEgbmF0aXZlIGltcGxlbWVudGF0aW9uIG9mIGdvb2cuYmluZC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEEgZnVuY3Rpb24gdG8gcGFydGlhbGx5IGFwcGx5LlxuICogQHBhcmFtIHtPYmplY3R8dW5kZWZpbmVkfSBzZWxmT2JqIFNwZWNpZmllcyB0aGUgb2JqZWN0IHdoaWNoIHx0aGlzfCBzaG91bGRcbiAqICAgICBwb2ludCB0byB3aGVuIHRoZSBmdW5jdGlvbiBpcyBydW4uXG4gKiBAcGFyYW0gey4uLip9IHZhcl9hcmdzIEFkZGl0aW9uYWwgYXJndW1lbnRzIHRoYXQgYXJlIHBhcnRpYWxseVxuICogICAgIGFwcGxpZWQgdG8gdGhlIGZ1bmN0aW9uLlxuICogQHJldHVybiB7IUZ1bmN0aW9ufSBBIHBhcnRpYWxseS1hcHBsaWVkIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGJpbmQoKSB3YXNcbiAqICAgICBpbnZva2VkIGFzIGEgbWV0aG9kIG9mLlxuICogQHByaXZhdGVcbiAqIEBzdXBwcmVzcyB7ZGVwcmVjYXRlZH0gVGhlIGNvbXBpbGVyIHRoaW5rcyB0aGF0IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kXG4gKiAgICAgaXMgZGVwcmVjYXRlZCBiZWNhdXNlIHNvbWUgcGVvcGxlIGhhdmUgZGVjbGFyZWQgYSBwdXJlLUpTIHZlcnNpb24uXG4gKiAgICAgT25seSB0aGUgcHVyZS1KUyB2ZXJzaW9uIGlzIHRydWx5IGRlcHJlY2F0ZWQuXG4gKi9cbmdvb2cuYmluZE5hdGl2ZV8gPSBmdW5jdGlvbihmbiwgc2VsZk9iaiwgdmFyX2FyZ3MpIHtcbiAgcmV0dXJuIC8qKiBAdHlwZSB7IUZ1bmN0aW9ufSAqLyAoZm4uY2FsbC5hcHBseShmbi5iaW5kLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBBIHB1cmUtSlMgaW1wbGVtZW50YXRpb24gb2YgZ29vZy5iaW5kLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gQSBmdW5jdGlvbiB0byBwYXJ0aWFsbHkgYXBwbHkuXG4gKiBAcGFyYW0ge09iamVjdHx1bmRlZmluZWR9IHNlbGZPYmogU3BlY2lmaWVzIHRoZSBvYmplY3Qgd2hpY2ggfHRoaXN8IHNob3VsZFxuICogICAgIHBvaW50IHRvIHdoZW4gdGhlIGZ1bmN0aW9uIGlzIHJ1bi5cbiAqIEBwYXJhbSB7Li4uKn0gdmFyX2FyZ3MgQWRkaXRpb25hbCBhcmd1bWVudHMgdGhhdCBhcmUgcGFydGlhbGx5XG4gKiAgICAgYXBwbGllZCB0byB0aGUgZnVuY3Rpb24uXG4gKiBAcmV0dXJuIHshRnVuY3Rpb259IEEgcGFydGlhbGx5LWFwcGxpZWQgZm9ybSBvZiB0aGUgZnVuY3Rpb24gYmluZCgpIHdhc1xuICogICAgIGludm9rZWQgYXMgYSBtZXRob2Qgb2YuXG4gKiBAcHJpdmF0ZVxuICovXG5nb29nLmJpbmRKc18gPSBmdW5jdGlvbihmbiwgc2VsZk9iaiwgdmFyX2FyZ3MpIHtcbiAgaWYgKCFmbikge1xuICAgIHRocm93IG5ldyBFcnJvcigpO1xuICB9XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAyKSB7XG4gICAgdmFyIGJvdW5kQXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgLy8gUHJlcGVuZCB0aGUgYm91bmQgYXJndW1lbnRzIHRvIHRoZSBjdXJyZW50IGFyZ3VtZW50cy5cbiAgICAgIHZhciBuZXdBcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgIEFycmF5LnByb3RvdHlwZS51bnNoaWZ0LmFwcGx5KG5ld0FyZ3MsIGJvdW5kQXJncyk7XG4gICAgICByZXR1cm4gZm4uYXBwbHkoc2VsZk9iaiwgbmV3QXJncyk7XG4gICAgfTtcblxuICB9IGVsc2Uge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmbi5hcHBseShzZWxmT2JqLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cbn07XG5cblxuLyoqXG4gKiBQYXJ0aWFsbHkgYXBwbGllcyB0aGlzIGZ1bmN0aW9uIHRvIGEgcGFydGljdWxhciAndGhpcyBvYmplY3QnIGFuZCB6ZXJvIG9yXG4gKiBtb3JlIGFyZ3VtZW50cy4gVGhlIHJlc3VsdCBpcyBhIG5ldyBmdW5jdGlvbiB3aXRoIHNvbWUgYXJndW1lbnRzIG9mIHRoZSBmaXJzdFxuICogZnVuY3Rpb24gcHJlLWZpbGxlZCBhbmQgdGhlIHZhbHVlIG9mIHx0aGlzfCAncHJlLXNwZWNpZmllZCcuPGJyPjxicj5cbiAqXG4gKiBSZW1haW5pbmcgYXJndW1lbnRzIHNwZWNpZmllZCBhdCBjYWxsLXRpbWUgYXJlIGFwcGVuZGVkIHRvIHRoZSBwcmUtXG4gKiBzcGVjaWZpZWQgb25lcy48YnI+PGJyPlxuICpcbiAqIEFsc28gc2VlOiB7QGxpbmsgI3BhcnRpYWx9Ljxicj48YnI+XG4gKlxuICogVXNhZ2U6XG4gKiA8cHJlPnZhciBiYXJNZXRoQm91bmQgPSBiaW5kKG15RnVuY3Rpb24sIG15T2JqLCAnYXJnMScsICdhcmcyJyk7XG4gKiBiYXJNZXRoQm91bmQoJ2FyZzMnLCAnYXJnNCcpOzwvcHJlPlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEEgZnVuY3Rpb24gdG8gcGFydGlhbGx5IGFwcGx5LlxuICogQHBhcmFtIHtPYmplY3R8dW5kZWZpbmVkfSBzZWxmT2JqIFNwZWNpZmllcyB0aGUgb2JqZWN0IHdoaWNoIHx0aGlzfCBzaG91bGRcbiAqICAgICBwb2ludCB0byB3aGVuIHRoZSBmdW5jdGlvbiBpcyBydW4uXG4gKiBAcGFyYW0gey4uLip9IHZhcl9hcmdzIEFkZGl0aW9uYWwgYXJndW1lbnRzIHRoYXQgYXJlIHBhcnRpYWxseVxuICogICAgIGFwcGxpZWQgdG8gdGhlIGZ1bmN0aW9uLlxuICogQHJldHVybiB7IUZ1bmN0aW9ufSBBIHBhcnRpYWxseS1hcHBsaWVkIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGJpbmQoKSB3YXNcbiAqICAgICBpbnZva2VkIGFzIGEgbWV0aG9kIG9mLlxuICogQHN1cHByZXNzIHtkZXByZWNhdGVkfSBTZWUgYWJvdmUuXG4gKi9cbmdvb2cuYmluZCA9IGZ1bmN0aW9uKGZuLCBzZWxmT2JqLCB2YXJfYXJncykge1xuICAvLyBUT0RPKG5pY2tzYW50b3MpOiBuYXJyb3cgdGhlIHR5cGUgc2lnbmF0dXJlLlxuICBpZiAoRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgJiZcbiAgICAgIC8vIE5PVEUobmlja3NhbnRvcyk6IFNvbWVib2R5IHB1bGxlZCBiYXNlLmpzIGludG8gdGhlIGRlZmF1bHRcbiAgICAgIC8vIENocm9tZSBleHRlbnNpb24gZW52aXJvbm1lbnQuIFRoaXMgbWVhbnMgdGhhdCBmb3IgQ2hyb21lIGV4dGVuc2lvbnMsXG4gICAgICAvLyB0aGV5IGdldCB0aGUgaW1wbGVtZW50YXRpb24gb2YgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgdGhhdFxuICAgICAgLy8gY2FsbHMgZ29vZy5iaW5kIGluc3RlYWQgb2YgdGhlIG5hdGl2ZSBvbmUuIEV2ZW4gd29yc2UsIHdlIGRvbid0IHdhbnRcbiAgICAgIC8vIHRvIGludHJvZHVjZSBhIGNpcmN1bGFyIGRlcGVuZGVuY3kgYmV0d2VlbiBnb29nLmJpbmQgYW5kXG4gICAgICAvLyBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCwgc28gd2UgaGF2ZSB0byBoYWNrIHRoaXMgdG8gbWFrZSBzdXJlIGl0XG4gICAgICAvLyB3b3JrcyBjb3JyZWN0bHkuXG4gICAgICBGdW5jdGlvbi5wcm90b3R5cGUuYmluZC50b1N0cmluZygpLmluZGV4T2YoJ25hdGl2ZSBjb2RlJykgIT0gLTEpIHtcbiAgICBnb29nLmJpbmQgPSBnb29nLmJpbmROYXRpdmVfO1xuICB9IGVsc2Uge1xuICAgIGdvb2cuYmluZCA9IGdvb2cuYmluZEpzXztcbiAgfVxuICByZXR1cm4gZ29vZy5iaW5kLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG59O1xuXG5cbi8qKlxuICogTGlrZSBiaW5kKCksIGV4Y2VwdCB0aGF0IGEgJ3RoaXMgb2JqZWN0JyBpcyBub3QgcmVxdWlyZWQuIFVzZWZ1bCB3aGVuIHRoZVxuICogdGFyZ2V0IGZ1bmN0aW9uIGlzIGFscmVhZHkgYm91bmQuXG4gKlxuICogVXNhZ2U6XG4gKiB2YXIgZyA9IHBhcnRpYWwoZiwgYXJnMSwgYXJnMik7XG4gKiBnKGFyZzMsIGFyZzQpO1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEEgZnVuY3Rpb24gdG8gcGFydGlhbGx5IGFwcGx5LlxuICogQHBhcmFtIHsuLi4qfSB2YXJfYXJncyBBZGRpdGlvbmFsIGFyZ3VtZW50cyB0aGF0IGFyZSBwYXJ0aWFsbHlcbiAqICAgICBhcHBsaWVkIHRvIGZuLlxuICogQHJldHVybiB7IUZ1bmN0aW9ufSBBIHBhcnRpYWxseS1hcHBsaWVkIGZvcm0gb2YgdGhlIGZ1bmN0aW9uIGJpbmQoKSB3YXNcbiAqICAgICBpbnZva2VkIGFzIGEgbWV0aG9kIG9mLlxuICovXG5nb29nLnBhcnRpYWwgPSBmdW5jdGlvbihmbiwgdmFyX2FyZ3MpIHtcbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgLy8gUHJlcGVuZCB0aGUgYm91bmQgYXJndW1lbnRzIHRvIHRoZSBjdXJyZW50IGFyZ3VtZW50cy5cbiAgICB2YXIgbmV3QXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgbmV3QXJncy51bnNoaWZ0LmFwcGx5KG5ld0FyZ3MsIGFyZ3MpO1xuICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBuZXdBcmdzKTtcbiAgfTtcbn07XG5cblxuLyoqXG4gKiBDb3BpZXMgYWxsIHRoZSBtZW1iZXJzIG9mIGEgc291cmNlIG9iamVjdCB0byBhIHRhcmdldCBvYmplY3QuIFRoaXMgbWV0aG9kXG4gKiBkb2VzIG5vdCB3b3JrIG9uIGFsbCBicm93c2VycyBmb3IgYWxsIG9iamVjdHMgdGhhdCBjb250YWluIGtleXMgc3VjaCBhc1xuICogdG9TdHJpbmcgb3IgaGFzT3duUHJvcGVydHkuIFVzZSBnb29nLm9iamVjdC5leHRlbmQgZm9yIHRoaXMgcHVycG9zZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSB0YXJnZXQgVGFyZ2V0LlxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBTb3VyY2UuXG4gKi9cbmdvb2cubWl4aW4gPSBmdW5jdGlvbih0YXJnZXQsIHNvdXJjZSkge1xuICBmb3IgKHZhciB4IGluIHNvdXJjZSkge1xuICAgIHRhcmdldFt4XSA9IHNvdXJjZVt4XTtcbiAgfVxuXG4gIC8vIEZvciBJRTcgb3IgbG93ZXIsIHRoZSBmb3ItaW4tbG9vcCBkb2VzIG5vdCBjb250YWluIGFueSBwcm9wZXJ0aWVzIHRoYXQgYXJlXG4gIC8vIG5vdCBlbnVtZXJhYmxlIG9uIHRoZSBwcm90b3R5cGUgb2JqZWN0IChmb3IgZXhhbXBsZSwgaXNQcm90b3R5cGVPZiBmcm9tXG4gIC8vIE9iamVjdC5wcm90b3R5cGUpIGJ1dCBhbHNvIGl0IHdpbGwgbm90IGluY2x1ZGUgJ3JlcGxhY2UnIG9uIG9iamVjdHMgdGhhdFxuICAvLyBleHRlbmQgU3RyaW5nIGFuZCBjaGFuZ2UgJ3JlcGxhY2UnIChub3QgdGhhdCBpdCBpcyBjb21tb24gZm9yIGFueW9uZSB0b1xuICAvLyBleHRlbmQgYW55dGhpbmcgZXhjZXB0IE9iamVjdCkuXG59O1xuXG5cbi8qKlxuICogQHJldHVybiB7bnVtYmVyfSBBbiBpbnRlZ2VyIHZhbHVlIHJlcHJlc2VudGluZyB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kc1xuICogICAgIGJldHdlZW4gbWlkbmlnaHQsIEphbnVhcnkgMSwgMTk3MCBhbmQgdGhlIGN1cnJlbnQgdGltZS5cbiAqL1xuZ29vZy5ub3cgPSBEYXRlLm5vdyB8fCAoZnVuY3Rpb24oKSB7XG4gIC8vIFVuYXJ5IHBsdXMgb3BlcmF0b3IgY29udmVydHMgaXRzIG9wZXJhbmQgdG8gYSBudW1iZXIgd2hpY2ggaW4gdGhlIGNhc2Ugb2ZcbiAgLy8gYSBkYXRlIGlzIGRvbmUgYnkgY2FsbGluZyBnZXRUaW1lKCkuXG4gIHJldHVybiArbmV3IERhdGUoKTtcbn0pO1xuXG5cbi8qKlxuICogRXZhbHMgamF2YXNjcmlwdCBpbiB0aGUgZ2xvYmFsIHNjb3BlLiAgSW4gSUUgdGhpcyB1c2VzIGV4ZWNTY3JpcHQsIG90aGVyXG4gKiBicm93c2VycyB1c2UgZ29vZy5nbG9iYWwuZXZhbC4gSWYgZ29vZy5nbG9iYWwuZXZhbCBkb2VzIG5vdCBldmFsdWF0ZSBpbiB0aGVcbiAqIGdsb2JhbCBzY29wZSAoZm9yIGV4YW1wbGUsIGluIFNhZmFyaSksIGFwcGVuZHMgYSBzY3JpcHQgdGFnIGluc3RlYWQuXG4gKiBUaHJvd3MgYW4gZXhjZXB0aW9uIGlmIG5laXRoZXIgZXhlY1NjcmlwdCBvciBldmFsIGlzIGRlZmluZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gc2NyaXB0IEphdmFTY3JpcHQgc3RyaW5nLlxuICovXG5nb29nLmdsb2JhbEV2YWwgPSBmdW5jdGlvbihzY3JpcHQpIHtcbiAgaWYgKGdvb2cuZ2xvYmFsLmV4ZWNTY3JpcHQpIHtcbiAgICBnb29nLmdsb2JhbC5leGVjU2NyaXB0KHNjcmlwdCwgJ0phdmFTY3JpcHQnKTtcbiAgfSBlbHNlIGlmIChnb29nLmdsb2JhbC5ldmFsKSB7XG4gICAgLy8gVGVzdCB0byBzZWUgaWYgZXZhbCB3b3Jrc1xuICAgIGlmIChnb29nLmV2YWxXb3Jrc0Zvckdsb2JhbHNfID09IG51bGwpIHtcbiAgICAgIGdvb2cuZ2xvYmFsLmV2YWwoJ3ZhciBfZXRfID0gMTsnKTtcbiAgICAgIGlmICh0eXBlb2YgZ29vZy5nbG9iYWxbJ19ldF8nXSAhPSAndW5kZWZpbmVkJykge1xuICAgICAgICBkZWxldGUgZ29vZy5nbG9iYWxbJ19ldF8nXTtcbiAgICAgICAgZ29vZy5ldmFsV29ya3NGb3JHbG9iYWxzXyA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBnb29nLmV2YWxXb3Jrc0Zvckdsb2JhbHNfID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGdvb2cuZXZhbFdvcmtzRm9yR2xvYmFsc18pIHtcbiAgICAgIGdvb2cuZ2xvYmFsLmV2YWwoc2NyaXB0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGRvYyA9IGdvb2cuZ2xvYmFsLmRvY3VtZW50O1xuICAgICAgdmFyIHNjcmlwdEVsdCA9IGRvYy5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgIHNjcmlwdEVsdC50eXBlID0gJ3RleHQvamF2YXNjcmlwdCc7XG4gICAgICBzY3JpcHRFbHQuZGVmZXIgPSBmYWxzZTtcbiAgICAgIC8vIE5vdGUodXNlcik6IGNhbid0IHVzZSAuaW5uZXJIVE1MIHNpbmNlIFwidCgnPHRlc3Q+JylcIiB3aWxsIGZhaWwgYW5kXG4gICAgICAvLyAudGV4dCBkb2Vzbid0IHdvcmsgaW4gU2FmYXJpIDIuICBUaGVyZWZvcmUgd2UgYXBwZW5kIGEgdGV4dCBub2RlLlxuICAgICAgc2NyaXB0RWx0LmFwcGVuZENoaWxkKGRvYy5jcmVhdGVUZXh0Tm9kZShzY3JpcHQpKTtcbiAgICAgIGRvYy5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdEVsdCk7XG4gICAgICBkb2MuYm9keS5yZW1vdmVDaGlsZChzY3JpcHRFbHQpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBFcnJvcignZ29vZy5nbG9iYWxFdmFsIG5vdCBhdmFpbGFibGUnKTtcbiAgfVxufTtcblxuXG4vKipcbiAqIEluZGljYXRlcyB3aGV0aGVyIG9yIG5vdCB3ZSBjYW4gY2FsbCAnZXZhbCcgZGlyZWN0bHkgdG8gZXZhbCBjb2RlIGluIHRoZVxuICogZ2xvYmFsIHNjb3BlLiBTZXQgdG8gYSBCb29sZWFuIGJ5IHRoZSBmaXJzdCBjYWxsIHRvIGdvb2cuZ2xvYmFsRXZhbCAod2hpY2hcbiAqIGVtcGlyaWNhbGx5IHRlc3RzIHdoZXRoZXIgZXZhbCB3b3JrcyBmb3IgZ2xvYmFscykuIEBzZWUgZ29vZy5nbG9iYWxFdmFsXG4gKiBAdHlwZSB7P2Jvb2xlYW59XG4gKiBAcHJpdmF0ZVxuICovXG5nb29nLmV2YWxXb3Jrc0Zvckdsb2JhbHNfID0gbnVsbDtcblxuXG4vKipcbiAqIE9wdGlvbmFsIG1hcCBvZiBDU1MgY2xhc3MgbmFtZXMgdG8gb2JmdXNjYXRlZCBuYW1lcyB1c2VkIHdpdGhcbiAqIGdvb2cuZ2V0Q3NzTmFtZSgpLlxuICogQHR5cGUge09iamVjdHx1bmRlZmluZWR9XG4gKiBAcHJpdmF0ZVxuICogQHNlZSBnb29nLnNldENzc05hbWVNYXBwaW5nXG4gKi9cbmdvb2cuY3NzTmFtZU1hcHBpbmdfO1xuXG5cbi8qKlxuICogT3B0aW9uYWwgb2JmdXNjYXRpb24gc3R5bGUgZm9yIENTUyBjbGFzcyBuYW1lcy4gU2hvdWxkIGJlIHNldCB0byBlaXRoZXJcbiAqICdCWV9XSE9MRScgb3IgJ0JZX1BBUlQnIGlmIGRlZmluZWQuXG4gKiBAdHlwZSB7c3RyaW5nfHVuZGVmaW5lZH1cbiAqIEBwcml2YXRlXG4gKiBAc2VlIGdvb2cuc2V0Q3NzTmFtZU1hcHBpbmdcbiAqL1xuZ29vZy5jc3NOYW1lTWFwcGluZ1N0eWxlXztcblxuXG4vKipcbiAqIEhhbmRsZXMgc3RyaW5ncyB0aGF0IGFyZSBpbnRlbmRlZCB0byBiZSB1c2VkIGFzIENTUyBjbGFzcyBuYW1lcy5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHdvcmtzIGluIHRhbmRlbSB3aXRoIEBzZWUgZ29vZy5zZXRDc3NOYW1lTWFwcGluZy5cbiAqXG4gKiBXaXRob3V0IGFueSBtYXBwaW5nIHNldCwgdGhlIGFyZ3VtZW50cyBhcmUgc2ltcGxlIGpvaW5lZCB3aXRoIGFcbiAqIGh5cGhlbiBhbmQgcGFzc2VkIHRocm91Z2ggdW5hbHRlcmVkLlxuICpcbiAqIFdoZW4gdGhlcmUgaXMgYSBtYXBwaW5nLCB0aGVyZSBhcmUgdHdvIHBvc3NpYmxlIHN0eWxlcyBpbiB3aGljaFxuICogdGhlc2UgbWFwcGluZ3MgYXJlIHVzZWQuIEluIHRoZSBCWV9QQVJUIHN0eWxlLCBlYWNoIHBhcnQgKGkuZS4gaW5cbiAqIGJldHdlZW4gaHlwaGVucykgb2YgdGhlIHBhc3NlZCBpbiBjc3MgbmFtZSBpcyByZXdyaXR0ZW4gYWNjb3JkaW5nXG4gKiB0byB0aGUgbWFwLiBJbiB0aGUgQllfV0hPTEUgc3R5bGUsIHRoZSBmdWxsIGNzcyBuYW1lIGlzIGxvb2tlZCB1cCBpblxuICogdGhlIG1hcCBkaXJlY3RseS4gSWYgYSByZXdyaXRlIGlzIG5vdCBzcGVjaWZpZWQgYnkgdGhlIG1hcCwgdGhlXG4gKiBjb21waWxlciB3aWxsIG91dHB1dCBhIHdhcm5pbmcuXG4gKlxuICogV2hlbiB0aGUgbWFwcGluZyBpcyBwYXNzZWQgdG8gdGhlIGNvbXBpbGVyLCBpdCB3aWxsIHJlcGxhY2UgY2FsbHNcbiAqIHRvIGdvb2cuZ2V0Q3NzTmFtZSB3aXRoIHRoZSBzdHJpbmdzIGZyb20gdGhlIG1hcHBpbmcsIGUuZy5cbiAqICAgICB2YXIgeCA9IGdvb2cuZ2V0Q3NzTmFtZSgnZm9vJyk7XG4gKiAgICAgdmFyIHkgPSBnb29nLmdldENzc05hbWUodGhpcy5iYXNlQ2xhc3MsICdhY3RpdmUnKTtcbiAqICBiZWNvbWVzOlxuICogICAgIHZhciB4PSAnZm9vJztcbiAqICAgICB2YXIgeSA9IHRoaXMuYmFzZUNsYXNzICsgJy1hY3RpdmUnO1xuICpcbiAqIElmIG9uZSBhcmd1bWVudCBpcyBwYXNzZWQgaXQgd2lsbCBiZSBwcm9jZXNzZWQsIGlmIHR3byBhcmUgcGFzc2VkXG4gKiBvbmx5IHRoZSBtb2RpZmllciB3aWxsIGJlIHByb2Nlc3NlZCwgYXMgaXQgaXMgYXNzdW1lZCB0aGUgZmlyc3RcbiAqIGFyZ3VtZW50IHdhcyBnZW5lcmF0ZWQgYXMgYSByZXN1bHQgb2YgY2FsbGluZyBnb29nLmdldENzc05hbWUuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGNsYXNzTmFtZSBUaGUgY2xhc3MgbmFtZS5cbiAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X21vZGlmaWVyIEEgbW9kaWZpZXIgdG8gYmUgYXBwZW5kZWQgdG8gdGhlIGNsYXNzIG5hbWUuXG4gKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBjbGFzcyBuYW1lIG9yIHRoZSBjb25jYXRlbmF0aW9uIG9mIHRoZSBjbGFzcyBuYW1lIGFuZFxuICogICAgIHRoZSBtb2RpZmllci5cbiAqL1xuZ29vZy5nZXRDc3NOYW1lID0gZnVuY3Rpb24oY2xhc3NOYW1lLCBvcHRfbW9kaWZpZXIpIHtcbiAgdmFyIGdldE1hcHBpbmcgPSBmdW5jdGlvbihjc3NOYW1lKSB7XG4gICAgcmV0dXJuIGdvb2cuY3NzTmFtZU1hcHBpbmdfW2Nzc05hbWVdIHx8IGNzc05hbWU7XG4gIH07XG5cbiAgdmFyIHJlbmFtZUJ5UGFydHMgPSBmdW5jdGlvbihjc3NOYW1lKSB7XG4gICAgLy8gUmVtYXAgYWxsIHRoZSBwYXJ0cyBpbmRpdmlkdWFsbHkuXG4gICAgdmFyIHBhcnRzID0gY3NzTmFtZS5zcGxpdCgnLScpO1xuICAgIHZhciBtYXBwZWQgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBtYXBwZWQucHVzaChnZXRNYXBwaW5nKHBhcnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBtYXBwZWQuam9pbignLScpO1xuICB9O1xuXG4gIHZhciByZW5hbWU7XG4gIGlmIChnb29nLmNzc05hbWVNYXBwaW5nXykge1xuICAgIHJlbmFtZSA9IGdvb2cuY3NzTmFtZU1hcHBpbmdTdHlsZV8gPT0gJ0JZX1dIT0xFJyA/XG4gICAgICAgIGdldE1hcHBpbmcgOiByZW5hbWVCeVBhcnRzO1xuICB9IGVsc2Uge1xuICAgIHJlbmFtZSA9IGZ1bmN0aW9uKGEpIHtcbiAgICAgIHJldHVybiBhO1xuICAgIH07XG4gIH1cblxuICBpZiAob3B0X21vZGlmaWVyKSB7XG4gICAgcmV0dXJuIGNsYXNzTmFtZSArICctJyArIHJlbmFtZShvcHRfbW9kaWZpZXIpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiByZW5hbWUoY2xhc3NOYW1lKTtcbiAgfVxufTtcblxuXG4vKipcbiAqIFNldHMgdGhlIG1hcCB0byBjaGVjayB3aGVuIHJldHVybmluZyBhIHZhbHVlIGZyb20gZ29vZy5nZXRDc3NOYW1lKCkuIEV4YW1wbGU6XG4gKiA8cHJlPlxuICogZ29vZy5zZXRDc3NOYW1lTWFwcGluZyh7XG4gKiAgIFwiZ29vZ1wiOiBcImFcIixcbiAqICAgXCJkaXNhYmxlZFwiOiBcImJcIixcbiAqIH0pO1xuICpcbiAqIHZhciB4ID0gZ29vZy5nZXRDc3NOYW1lKCdnb29nJyk7XG4gKiAvLyBUaGUgZm9sbG93aW5nIGV2YWx1YXRlcyB0bzogXCJhIGEtYlwiLlxuICogZ29vZy5nZXRDc3NOYW1lKCdnb29nJykgKyAnICcgKyBnb29nLmdldENzc05hbWUoeCwgJ2Rpc2FibGVkJylcbiAqIDwvcHJlPlxuICogV2hlbiBkZWNsYXJlZCBhcyBhIG1hcCBvZiBzdHJpbmcgbGl0ZXJhbHMgdG8gc3RyaW5nIGxpdGVyYWxzLCB0aGUgSlNDb21waWxlclxuICogd2lsbCByZXBsYWNlIGFsbCBjYWxscyB0byBnb29nLmdldENzc05hbWUoKSB1c2luZyB0aGUgc3VwcGxpZWQgbWFwIGlmIHRoZVxuICogLS1jbG9zdXJlX3Bhc3MgZmxhZyBpcyBzZXQuXG4gKlxuICogQHBhcmFtIHshT2JqZWN0fSBtYXBwaW5nIEEgbWFwIG9mIHN0cmluZ3MgdG8gc3RyaW5ncyB3aGVyZSBrZXlzIGFyZSBwb3NzaWJsZVxuICogICAgIGFyZ3VtZW50cyB0byBnb29nLmdldENzc05hbWUoKSBhbmQgdmFsdWVzIGFyZSB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXNcbiAqICAgICB0aGF0IHNob3VsZCBiZSByZXR1cm5lZC5cbiAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X3N0eWxlIFRoZSBzdHlsZSBvZiBjc3MgbmFtZSBtYXBwaW5nLiBUaGVyZSBhcmUgdHdvIHZhbGlkXG4gKiAgICAgb3B0aW9uczogJ0JZX1BBUlQnLCBhbmQgJ0JZX1dIT0xFJy5cbiAqIEBzZWUgZ29vZy5nZXRDc3NOYW1lIGZvciBhIGRlc2NyaXB0aW9uLlxuICovXG5nb29nLnNldENzc05hbWVNYXBwaW5nID0gZnVuY3Rpb24obWFwcGluZywgb3B0X3N0eWxlKSB7XG4gIGdvb2cuY3NzTmFtZU1hcHBpbmdfID0gbWFwcGluZztcbiAgZ29vZy5jc3NOYW1lTWFwcGluZ1N0eWxlXyA9IG9wdF9zdHlsZTtcbn07XG5cblxuLyoqXG4gKiBUbyB1c2UgQ1NTIHJlbmFtaW5nIGluIGNvbXBpbGVkIG1vZGUsIG9uZSBvZiB0aGUgaW5wdXQgZmlsZXMgc2hvdWxkIGhhdmUgYVxuICogY2FsbCB0byBnb29nLnNldENzc05hbWVNYXBwaW5nKCkgd2l0aCBhbiBvYmplY3QgbGl0ZXJhbCB0aGF0IHRoZSBKU0NvbXBpbGVyXG4gKiBjYW4gZXh0cmFjdCBhbmQgdXNlIHRvIHJlcGxhY2UgYWxsIGNhbGxzIHRvIGdvb2cuZ2V0Q3NzTmFtZSgpLiBJbiB1bmNvbXBpbGVkXG4gKiBtb2RlLCBKYXZhU2NyaXB0IGNvZGUgc2hvdWxkIGJlIGxvYWRlZCBiZWZvcmUgdGhpcyBiYXNlLmpzIGZpbGUgdGhhdCBkZWNsYXJlc1xuICogYSBnbG9iYWwgdmFyaWFibGUsIENMT1NVUkVfQ1NTX05BTUVfTUFQUElORywgd2hpY2ggaXMgdXNlZCBiZWxvdy4gVGhpcyBpc1xuICogdG8gZW5zdXJlIHRoYXQgdGhlIG1hcHBpbmcgaXMgbG9hZGVkIGJlZm9yZSBhbnkgY2FsbHMgdG8gZ29vZy5nZXRDc3NOYW1lKClcbiAqIGFyZSBtYWRlIGluIHVuY29tcGlsZWQgbW9kZS5cbiAqXG4gKiBBIGhvb2sgZm9yIG92ZXJyaWRpbmcgdGhlIENTUyBuYW1lIG1hcHBpbmcuXG4gKiBAdHlwZSB7T2JqZWN0fHVuZGVmaW5lZH1cbiAqL1xuZ29vZy5nbG9iYWwuQ0xPU1VSRV9DU1NfTkFNRV9NQVBQSU5HO1xuXG5cbmlmICghQ09NUElMRUQgJiYgZ29vZy5nbG9iYWwuQ0xPU1VSRV9DU1NfTkFNRV9NQVBQSU5HKSB7XG4gIC8vIFRoaXMgZG9lcyBub3QgY2FsbCBnb29nLnNldENzc05hbWVNYXBwaW5nKCkgYmVjYXVzZSB0aGUgSlNDb21waWxlclxuICAvLyByZXF1aXJlcyB0aGF0IGdvb2cuc2V0Q3NzTmFtZU1hcHBpbmcoKSBiZSBjYWxsZWQgd2l0aCBhbiBvYmplY3QgbGl0ZXJhbC5cbiAgZ29vZy5jc3NOYW1lTWFwcGluZ18gPSBnb29nLmdsb2JhbC5DTE9TVVJFX0NTU19OQU1FX01BUFBJTkc7XG59XG5cblxuLyoqXG4gKiBBYnN0cmFjdCBpbXBsZW1lbnRhdGlvbiBvZiBnb29nLmdldE1zZyBmb3IgdXNlIHdpdGggbG9jYWxpemVkIG1lc3NhZ2VzLlxuICogQHBhcmFtIHtzdHJpbmd9IHN0ciBUcmFuc2xhdGFibGUgc3RyaW5nLCBwbGFjZXMgaG9sZGVycyBpbiB0aGUgZm9ybSB7JGZvb30uXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF92YWx1ZXMgTWFwIG9mIHBsYWNlIGhvbGRlciBuYW1lIHRvIHZhbHVlLlxuICogQHJldHVybiB7c3RyaW5nfSBtZXNzYWdlIHdpdGggcGxhY2Vob2xkZXJzIGZpbGxlZC5cbiAqL1xuZ29vZy5nZXRNc2cgPSBmdW5jdGlvbihzdHIsIG9wdF92YWx1ZXMpIHtcbiAgdmFyIHZhbHVlcyA9IG9wdF92YWx1ZXMgfHwge307XG4gIGZvciAodmFyIGtleSBpbiB2YWx1ZXMpIHtcbiAgICB2YXIgdmFsdWUgPSAoJycgKyB2YWx1ZXNba2V5XSkucmVwbGFjZSgvXFwkL2csICckJCQkJyk7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UobmV3IFJlZ0V4cCgnXFxcXHtcXFxcJCcgKyBrZXkgKyAnXFxcXH0nLCAnZ2knKSwgdmFsdWUpO1xuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG5cbi8qKlxuICogRXhwb3NlcyBhbiB1bm9iZnVzY2F0ZWQgZ2xvYmFsIG5hbWVzcGFjZSBwYXRoIGZvciB0aGUgZ2l2ZW4gb2JqZWN0LlxuICogTm90ZSB0aGF0IGZpZWxkcyBvZiB0aGUgZXhwb3J0ZWQgb2JqZWN0ICp3aWxsKiBiZSBvYmZ1c2NhdGVkLFxuICogdW5sZXNzIHRoZXkgYXJlIGV4cG9ydGVkIGluIHR1cm4gdmlhIHRoaXMgZnVuY3Rpb24gb3JcbiAqIGdvb2cuZXhwb3J0UHJvcGVydHlcbiAqXG4gKiA8cD5BbHNvIGhhbmR5IGZvciBtYWtpbmcgcHVibGljIGl0ZW1zIHRoYXQgYXJlIGRlZmluZWQgaW4gYW5vbnltb3VzXG4gKiBjbG9zdXJlcy5cbiAqXG4gKiBleC4gZ29vZy5leHBvcnRTeW1ib2woJ3B1YmxpYy5wYXRoLkZvbycsIEZvbyk7XG4gKlxuICogZXguIGdvb2cuZXhwb3J0U3ltYm9sKCdwdWJsaWMucGF0aC5Gb28uc3RhdGljRnVuY3Rpb24nLFxuICogICAgICAgICAgICAgICAgICAgICAgIEZvby5zdGF0aWNGdW5jdGlvbik7XG4gKiAgICAgcHVibGljLnBhdGguRm9vLnN0YXRpY0Z1bmN0aW9uKCk7XG4gKlxuICogZXguIGdvb2cuZXhwb3J0U3ltYm9sKCdwdWJsaWMucGF0aC5Gb28ucHJvdG90eXBlLm15TWV0aG9kJyxcbiAqICAgICAgICAgICAgICAgICAgICAgICBGb28ucHJvdG90eXBlLm15TWV0aG9kKTtcbiAqICAgICBuZXcgcHVibGljLnBhdGguRm9vKCkubXlNZXRob2QoKTtcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcHVibGljUGF0aCBVbm9iZnVzY2F0ZWQgbmFtZSB0byBleHBvcnQuXG4gKiBAcGFyYW0geyp9IG9iamVjdCBPYmplY3QgdGhlIG5hbWUgc2hvdWxkIHBvaW50IHRvLlxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfb2JqZWN0VG9FeHBvcnRUbyBUaGUgb2JqZWN0IHRvIGFkZCB0aGUgcGF0aCB0bzsgZGVmYXVsdFxuICogICAgIGlzIHxnb29nLmdsb2JhbHwuXG4gKi9cbmdvb2cuZXhwb3J0U3ltYm9sID0gZnVuY3Rpb24ocHVibGljUGF0aCwgb2JqZWN0LCBvcHRfb2JqZWN0VG9FeHBvcnRUbykge1xuICBnb29nLmV4cG9ydFBhdGhfKHB1YmxpY1BhdGgsIG9iamVjdCwgb3B0X29iamVjdFRvRXhwb3J0VG8pO1xufTtcblxuXG4vKipcbiAqIEV4cG9ydHMgYSBwcm9wZXJ0eSB1bm9iZnVzY2F0ZWQgaW50byB0aGUgb2JqZWN0J3MgbmFtZXNwYWNlLlxuICogZXguIGdvb2cuZXhwb3J0UHJvcGVydHkoRm9vLCAnc3RhdGljRnVuY3Rpb24nLCBGb28uc3RhdGljRnVuY3Rpb24pO1xuICogZXguIGdvb2cuZXhwb3J0UHJvcGVydHkoRm9vLnByb3RvdHlwZSwgJ215TWV0aG9kJywgRm9vLnByb3RvdHlwZS5teU1ldGhvZCk7XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IE9iamVjdCB3aG9zZSBzdGF0aWMgcHJvcGVydHkgaXMgYmVpbmcgZXhwb3J0ZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gcHVibGljTmFtZSBVbm9iZnVzY2F0ZWQgbmFtZSB0byBleHBvcnQuXG4gKiBAcGFyYW0geyp9IHN5bWJvbCBPYmplY3QgdGhlIG5hbWUgc2hvdWxkIHBvaW50IHRvLlxuICovXG5nb29nLmV4cG9ydFByb3BlcnR5ID0gZnVuY3Rpb24ob2JqZWN0LCBwdWJsaWNOYW1lLCBzeW1ib2wpIHtcbiAgb2JqZWN0W3B1YmxpY05hbWVdID0gc3ltYm9sO1xufTtcblxuXG4vKipcbiAqIEluaGVyaXQgdGhlIHByb3RvdHlwZSBtZXRob2RzIGZyb20gb25lIGNvbnN0cnVjdG9yIGludG8gYW5vdGhlci5cbiAqXG4gKiBVc2FnZTpcbiAqIDxwcmU+XG4gKiBmdW5jdGlvbiBQYXJlbnRDbGFzcyhhLCBiKSB7IH1cbiAqIFBhcmVudENsYXNzLnByb3RvdHlwZS5mb28gPSBmdW5jdGlvbihhKSB7IH1cbiAqXG4gKiBmdW5jdGlvbiBDaGlsZENsYXNzKGEsIGIsIGMpIHtcbiAqICAgZ29vZy5iYXNlKHRoaXMsIGEsIGIpO1xuICogfVxuICogZ29vZy5pbmhlcml0cyhDaGlsZENsYXNzLCBQYXJlbnRDbGFzcyk7XG4gKlxuICogdmFyIGNoaWxkID0gbmV3IENoaWxkQ2xhc3MoJ2EnLCAnYicsICdzZWUnKTtcbiAqIGNoaWxkLmZvbygpOyAvLyB3b3Jrc1xuICogPC9wcmU+XG4gKlxuICogSW4gYWRkaXRpb24sIGEgc3VwZXJjbGFzcycgaW1wbGVtZW50YXRpb24gb2YgYSBtZXRob2QgY2FuIGJlIGludm9rZWRcbiAqIGFzIGZvbGxvd3M6XG4gKlxuICogPHByZT5cbiAqIENoaWxkQ2xhc3MucHJvdG90eXBlLmZvbyA9IGZ1bmN0aW9uKGEpIHtcbiAqICAgQ2hpbGRDbGFzcy5zdXBlckNsYXNzXy5mb28uY2FsbCh0aGlzLCBhKTtcbiAqICAgLy8gb3RoZXIgY29kZVxuICogfTtcbiAqIDwvcHJlPlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNoaWxkQ3RvciBDaGlsZCBjbGFzcy5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHBhcmVudEN0b3IgUGFyZW50IGNsYXNzLlxuICovXG5nb29nLmluaGVyaXRzID0gZnVuY3Rpb24oY2hpbGRDdG9yLCBwYXJlbnRDdG9yKSB7XG4gIC8qKiBAY29uc3RydWN0b3IgKi9cbiAgZnVuY3Rpb24gdGVtcEN0b3IoKSB7fTtcbiAgdGVtcEN0b3IucHJvdG90eXBlID0gcGFyZW50Q3Rvci5wcm90b3R5cGU7XG4gIGNoaWxkQ3Rvci5zdXBlckNsYXNzXyA9IHBhcmVudEN0b3IucHJvdG90eXBlO1xuICBjaGlsZEN0b3IucHJvdG90eXBlID0gbmV3IHRlbXBDdG9yKCk7XG4gIGNoaWxkQ3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjaGlsZEN0b3I7XG59O1xuXG5cbi8qKlxuICogQ2FsbCB1cCB0byB0aGUgc3VwZXJjbGFzcy5cbiAqXG4gKiBJZiB0aGlzIGlzIGNhbGxlZCBmcm9tIGEgY29uc3RydWN0b3IsIHRoZW4gdGhpcyBjYWxscyB0aGUgc3VwZXJjbGFzc1xuICogY29udHJ1Y3RvciB3aXRoIGFyZ3VtZW50cyAxLU4uXG4gKlxuICogSWYgdGhpcyBpcyBjYWxsZWQgZnJvbSBhIHByb3RvdHlwZSBtZXRob2QsIHRoZW4geW91IG11c3QgcGFzc1xuICogdGhlIG5hbWUgb2YgdGhlIG1ldGhvZCBhcyB0aGUgc2Vjb25kIGFyZ3VtZW50IHRvIHRoaXMgZnVuY3Rpb24uIElmXG4gKiB5b3UgZG8gbm90LCB5b3Ugd2lsbCBnZXQgYSBydW50aW1lIGVycm9yLiBUaGlzIGNhbGxzIHRoZSBzdXBlcmNsYXNzJ1xuICogbWV0aG9kIHdpdGggYXJndW1lbnRzIDItTi5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIG9ubHkgd29ya3MgaWYgeW91IHVzZSBnb29nLmluaGVyaXRzIHRvIGV4cHJlc3NcbiAqIGluaGVyaXRhbmNlIHJlbGF0aW9uc2hpcHMgYmV0d2VlbiB5b3VyIGNsYXNzZXMuXG4gKlxuICogVGhpcyBmdW5jdGlvbiBpcyBhIGNvbXBpbGVyIHByaW1pdGl2ZS4gQXQgY29tcGlsZS10aW1lLCB0aGVcbiAqIGNvbXBpbGVyIHdpbGwgZG8gbWFjcm8gZXhwYW5zaW9uIHRvIHJlbW92ZSBhIGxvdCBvZlxuICogdGhlIGV4dHJhIG92ZXJoZWFkIHRoYXQgdGhpcyBmdW5jdGlvbiBpbnRyb2R1Y2VzLiBUaGUgY29tcGlsZXJcbiAqIHdpbGwgYWxzbyBlbmZvcmNlIGEgbG90IG9mIHRoZSBhc3N1bXB0aW9ucyB0aGF0IHRoaXMgZnVuY3Rpb25cbiAqIG1ha2VzLCBhbmQgdHJlYXQgaXQgYXMgYSBjb21waWxlciBlcnJvciBpZiB5b3UgYnJlYWsgdGhlbS5cbiAqXG4gKiBAcGFyYW0geyFPYmplY3R9IG1lIFNob3VsZCBhbHdheXMgYmUgXCJ0aGlzXCIuXG4gKiBAcGFyYW0geyo9fSBvcHRfbWV0aG9kTmFtZSBUaGUgbWV0aG9kIG5hbWUgaWYgY2FsbGluZyBhIHN1cGVyIG1ldGhvZC5cbiAqIEBwYXJhbSB7Li4uKn0gdmFyX2FyZ3MgVGhlIHJlc3Qgb2YgdGhlIGFyZ3VtZW50cy5cbiAqIEByZXR1cm4geyp9IFRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIHN1cGVyY2xhc3MgbWV0aG9kLlxuICovXG5nb29nLmJhc2UgPSBmdW5jdGlvbihtZSwgb3B0X21ldGhvZE5hbWUsIHZhcl9hcmdzKSB7XG4gIHZhciBjYWxsZXIgPSBhcmd1bWVudHMuY2FsbGVlLmNhbGxlcjtcbiAgaWYgKGNhbGxlci5zdXBlckNsYXNzXykge1xuICAgIC8vIFRoaXMgaXMgYSBjb25zdHJ1Y3Rvci4gQ2FsbCB0aGUgc3VwZXJjbGFzcyBjb25zdHJ1Y3Rvci5cbiAgICByZXR1cm4gY2FsbGVyLnN1cGVyQ2xhc3NfLmNvbnN0cnVjdG9yLmFwcGx5KFxuICAgICAgICBtZSwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gIH1cblxuICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gIHZhciBmb3VuZENhbGxlciA9IGZhbHNlO1xuICBmb3IgKHZhciBjdG9yID0gbWUuY29uc3RydWN0b3I7XG4gICAgICAgY3RvcjsgY3RvciA9IGN0b3Iuc3VwZXJDbGFzc18gJiYgY3Rvci5zdXBlckNsYXNzXy5jb25zdHJ1Y3Rvcikge1xuICAgIGlmIChjdG9yLnByb3RvdHlwZVtvcHRfbWV0aG9kTmFtZV0gPT09IGNhbGxlcikge1xuICAgICAgZm91bmRDYWxsZXIgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoZm91bmRDYWxsZXIpIHtcbiAgICAgIHJldHVybiBjdG9yLnByb3RvdHlwZVtvcHRfbWV0aG9kTmFtZV0uYXBwbHkobWUsIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIC8vIElmIHdlIGRpZCBub3QgZmluZCB0aGUgY2FsbGVyIGluIHRoZSBwcm90b3R5cGUgY2hhaW4sXG4gIC8vIHRoZW4gb25lIG9mIHR3byB0aGluZ3MgaGFwcGVuZWQ6XG4gIC8vIDEpIFRoZSBjYWxsZXIgaXMgYW4gaW5zdGFuY2UgbWV0aG9kLlxuICAvLyAyKSBUaGlzIG1ldGhvZCB3YXMgbm90IGNhbGxlZCBieSB0aGUgcmlnaHQgY2FsbGVyLlxuICBpZiAobWVbb3B0X21ldGhvZE5hbWVdID09PSBjYWxsZXIpIHtcbiAgICByZXR1cm4gbWUuY29uc3RydWN0b3IucHJvdG90eXBlW29wdF9tZXRob2ROYW1lXS5hcHBseShtZSwgYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgRXJyb3IoXG4gICAgICAgICdnb29nLmJhc2UgY2FsbGVkIGZyb20gYSBtZXRob2Qgb2Ygb25lIG5hbWUgJyArXG4gICAgICAgICd0byBhIG1ldGhvZCBvZiBhIGRpZmZlcmVudCBuYW1lJyk7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBBbGxvdyBmb3IgYWxpYXNpbmcgd2l0aGluIHNjb3BlIGZ1bmN0aW9ucy4gIFRoaXMgZnVuY3Rpb24gZXhpc3RzIGZvclxuICogdW5jb21waWxlZCBjb2RlIC0gaW4gY29tcGlsZWQgY29kZSB0aGUgY2FsbHMgd2lsbCBiZSBpbmxpbmVkIGFuZCB0aGVcbiAqIGFsaWFzZXMgYXBwbGllZC4gIEluIHVuY29tcGlsZWQgY29kZSB0aGUgZnVuY3Rpb24gaXMgc2ltcGx5IHJ1biBzaW5jZSB0aGVcbiAqIGFsaWFzZXMgYXMgd3JpdHRlbiBhcmUgdmFsaWQgSmF2YVNjcmlwdC5cbiAqIEBwYXJhbSB7ZnVuY3Rpb24oKX0gZm4gRnVuY3Rpb24gdG8gY2FsbC4gIFRoaXMgZnVuY3Rpb24gY2FuIGNvbnRhaW4gYWxpYXNlc1xuICogICAgIHRvIG5hbWVzcGFjZXMgKGUuZy4gXCJ2YXIgZG9tID0gZ29vZy5kb21cIikgb3IgY2xhc3Nlc1xuICogICAgKGUuZy4gXCJ2YXIgVGltZXIgPSBnb29nLlRpbWVyXCIpLlxuICovXG5nb29nLnNjb3BlID0gZnVuY3Rpb24oZm4pIHtcbiAgZm4uY2FsbChnb29nLmdsb2JhbCk7XG59O1xuXG5cbiIsIi8qKlxuICogZGVmaW5lc1xuICovXG5cbmdvb2cucHJvdmlkZSgnVVNFX1RZUEVEQVJSQVknKTtcblxuLy8gU2FmYXJpIOOBjCB0eXBlb2YgVWludDhBcnJheSA9PT0gJ29iamVjdCcg44Gr44Gq44KL44Gf44KB44CBXG4vLyDmnKrlrprnvqnjgYvlkKbjgYvjgacgVHlwZWQgQXJyYXkg44Gu5L2/55So44KS5rG65a6a44GZ44KLXG5cbi8qKiBAY29uc3Qge2Jvb2xlYW59IHVzZSB0eXBlZCBhcnJheSBmbGFnLiAqL1xudmFyIFVTRV9UWVBFREFSUkFZID1cbiAgKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJykgJiZcbiAgKHR5cGVvZiBVaW50MTZBcnJheSAhPT0gJ3VuZGVmaW5lZCcpICYmXG4gICh0eXBlb2YgVWludDMyQXJyYXkgIT09ICd1bmRlZmluZWQnKSAmJlxuICAodHlwZW9mIERhdGFWaWV3ICE9PSAndW5kZWZpbmVkJyk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgYml0IOWNmOS9jeOBp+OBruabuOOBjei+vOOBv+Wun+ijhS5cbiAqL1xuZ29vZy5wcm92aWRlKCdabGliLkJpdFN0cmVhbScpO1xuXG5nb29nLnJlcXVpcmUoJ1VTRV9UWVBFREFSUkFZJyk7XG5cbmdvb2cuc2NvcGUoZnVuY3Rpb24oKSB7XG5cbi8qKlxuICog44OT44OD44OI44K544OI44Oq44O844OgXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7IShBcnJheXxVaW50OEFycmF5KT19IGJ1ZmZlciBvdXRwdXQgYnVmZmVyLlxuICogQHBhcmFtIHtudW1iZXI9fSBidWZmZXJQb3NpdGlvbiBzdGFydCBidWZmZXIgcG9pbnRlci5cbiAqL1xuWmxpYi5CaXRTdHJlYW0gPSBmdW5jdGlvbihidWZmZXIsIGJ1ZmZlclBvc2l0aW9uKSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBidWZmZXIgaW5kZXguICovXG4gIHRoaXMuaW5kZXggPSB0eXBlb2YgYnVmZmVyUG9zaXRpb24gPT09ICdudW1iZXInID8gYnVmZmVyUG9zaXRpb24gOiAwO1xuICAvKiogQHR5cGUge251bWJlcn0gYml0IGluZGV4LiAqL1xuICB0aGlzLmJpdGluZGV4ID0gMDtcbiAgLyoqIEB0eXBlIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBiaXQtc3RyZWFtIG91dHB1dCBidWZmZXIuICovXG4gIHRoaXMuYnVmZmVyID0gYnVmZmVyIGluc3RhbmNlb2YgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KSA/XG4gICAgYnVmZmVyIDpcbiAgICBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KShabGliLkJpdFN0cmVhbS5EZWZhdWx0QmxvY2tTaXplKTtcblxuICAvLyDlhaXlipvjgZXjgozjgZ8gaW5kZXgg44GM6Laz44KK44Gq44GL44Gj44Gf44KJ5ouh5by144GZ44KL44GM44CB5YCN44Gr44GX44Gm44KC44OA44Oh44Gq44KJ5LiN5q2j44Go44GZ44KLXG4gIGlmICh0aGlzLmJ1ZmZlci5sZW5ndGggKiAyIDw9IHRoaXMuaW5kZXgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGluZGV4XCIpO1xuICB9IGVsc2UgaWYgKHRoaXMuYnVmZmVyLmxlbmd0aCA8PSB0aGlzLmluZGV4KSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIoKTtcbiAgfVxufTtcblxuLyoqXG4gKiDjg4fjg5Xjgqnjg6vjg4jjg5bjg63jg4Pjgq/jgrXjgqTjgrouXG4gKiBAY29uc3RcbiAqIEB0eXBlIHtudW1iZXJ9XG4gKi9cblpsaWIuQml0U3RyZWFtLkRlZmF1bHRCbG9ja1NpemUgPSAweDgwMDA7XG5cbi8qKlxuICogZXhwYW5kIGJ1ZmZlci5cbiAqIEByZXR1cm4geyEoQXJyYXl8VWludDhBcnJheSl9IG5ldyBidWZmZXIuXG4gKi9cblpsaWIuQml0U3RyZWFtLnByb3RvdHlwZS5leHBhbmRCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBvbGQgYnVmZmVyLiAqL1xuICB2YXIgb2xkYnVmID0gdGhpcy5idWZmZXI7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGNvdW50ZXIuICovXG4gIHZhciBpO1xuICAvKiogQHR5cGUge251bWJlcn0gbG9vcCBsaW1pdGVyLiAqL1xuICB2YXIgaWwgPSBvbGRidWYubGVuZ3RoO1xuICAvKiogQHR5cGUgeyEoQXJyYXl8VWludDhBcnJheSl9IG5ldyBidWZmZXIuICovXG4gIHZhciBidWZmZXIgPVxuICAgIG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKGlsIDw8IDEpO1xuXG4gIC8vIGNvcHkgYnVmZmVyXG4gIGlmIChVU0VfVFlQRURBUlJBWSkge1xuICAgIGJ1ZmZlci5zZXQob2xkYnVmKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBYWFg6IGxvb3AgdW5yb2xsaW5nXG4gICAgZm9yIChpID0gMDsgaSA8IGlsOyArK2kpIHtcbiAgICAgIGJ1ZmZlcltpXSA9IG9sZGJ1ZltpXTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gKHRoaXMuYnVmZmVyID0gYnVmZmVyKTtcbn07XG5cblxuLyoqXG4gKiDmlbDlgKTjgpLjg5Pjg4Pjg4jjgafmjIflrprjgZfjgZ/mlbDjgaDjgZHmm7jjgY3ovrzjgoAuXG4gKiBAcGFyYW0ge251bWJlcn0gbnVtYmVyIOabuOOBjei+vOOCgOaVsOWApC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBuIOabuOOBjei+vOOCgOODk+ODg+ODiOaVsC5cbiAqIEBwYXJhbSB7Ym9vbGVhbj19IHJldmVyc2Ug6YCG6aCG44Gr5pu444GN6L6844KA44Gq44KJ44GwIHRydWUuXG4gKi9cblpsaWIuQml0U3RyZWFtLnByb3RvdHlwZS53cml0ZUJpdHMgPSBmdW5jdGlvbihudW1iZXIsIG4sIHJldmVyc2UpIHtcbiAgdmFyIGJ1ZmZlciA9IHRoaXMuYnVmZmVyO1xuICB2YXIgaW5kZXggPSB0aGlzLmluZGV4O1xuICB2YXIgYml0aW5kZXggPSB0aGlzLmJpdGluZGV4O1xuXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBjdXJyZW50IG9jdGV0LiAqL1xuICB2YXIgY3VycmVudCA9IGJ1ZmZlcltpbmRleF07XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGNvdW50ZXIuICovXG4gIHZhciBpO1xuXG4gIC8qKlxuICAgKiAzMi1iaXQg5pW05pWw44Gu44OT44OD44OI6aCG44KS6YCG44Gr44GZ44KLXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuIDMyLWJpdCBpbnRlZ2VyLlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IHJldmVyc2VkIDMyLWJpdCBpbnRlZ2VyLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZnVuY3Rpb24gcmV2MzJfKG4pIHtcbiAgICByZXR1cm4gKFpsaWIuQml0U3RyZWFtLlJldmVyc2VUYWJsZVtuICYgMHhGRl0gPDwgMjQpIHxcbiAgICAgIChabGliLkJpdFN0cmVhbS5SZXZlcnNlVGFibGVbbiA+Pj4gOCAmIDB4RkZdIDw8IDE2KSB8XG4gICAgICAoWmxpYi5CaXRTdHJlYW0uUmV2ZXJzZVRhYmxlW24gPj4+IDE2ICYgMHhGRl0gPDwgOCkgfFxuICAgICAgWmxpYi5CaXRTdHJlYW0uUmV2ZXJzZVRhYmxlW24gPj4+IDI0ICYgMHhGRl07XG4gIH1cblxuICBpZiAocmV2ZXJzZSAmJiBuID4gMSkge1xuICAgIG51bWJlciA9IG4gPiA4ID9cbiAgICAgIHJldjMyXyhudW1iZXIpID4+ICgzMiAtIG4pIDpcbiAgICAgIFpsaWIuQml0U3RyZWFtLlJldmVyc2VUYWJsZVtudW1iZXJdID4+ICg4IC0gbik7XG4gIH1cblxuICAvLyBCeXRlIOWig+eVjOOCkui2heOBiOOBquOBhOOBqOOBjVxuICBpZiAobiArIGJpdGluZGV4IDwgOCkge1xuICAgIGN1cnJlbnQgPSAoY3VycmVudCA8PCBuKSB8IG51bWJlcjtcbiAgICBiaXRpbmRleCArPSBuO1xuICAvLyBCeXRlIOWig+eVjOOCkui2heOBiOOCi+OBqOOBjVxuICB9IGVsc2Uge1xuICAgIGZvciAoaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGN1cnJlbnQgPSAoY3VycmVudCA8PCAxKSB8ICgobnVtYmVyID4+IG4gLSBpIC0gMSkgJiAxKTtcblxuICAgICAgLy8gbmV4dCBieXRlXG4gICAgICBpZiAoKytiaXRpbmRleCA9PT0gOCkge1xuICAgICAgICBiaXRpbmRleCA9IDA7XG4gICAgICAgIGJ1ZmZlcltpbmRleCsrXSA9IFpsaWIuQml0U3RyZWFtLlJldmVyc2VUYWJsZVtjdXJyZW50XTtcbiAgICAgICAgY3VycmVudCA9IDA7XG5cbiAgICAgICAgLy8gZXhwYW5kXG4gICAgICAgIGlmIChpbmRleCA9PT0gYnVmZmVyLmxlbmd0aCkge1xuICAgICAgICAgIGJ1ZmZlciA9IHRoaXMuZXhwYW5kQnVmZmVyKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgYnVmZmVyW2luZGV4XSA9IGN1cnJlbnQ7XG5cbiAgdGhpcy5idWZmZXIgPSBidWZmZXI7XG4gIHRoaXMuYml0aW5kZXggPSBiaXRpbmRleDtcbiAgdGhpcy5pbmRleCA9IGluZGV4O1xufTtcblxuXG4vKipcbiAqIOOCueODiOODquODvOODoOOBrue1guerr+WHpueQhuOCkuihjOOBhlxuICogQHJldHVybiB7IShBcnJheXxVaW50OEFycmF5KX0g57WC56uv5Yem55CG5b6M44Gu44OQ44OD44OV44Kh44KSIGJ5dGUgYXJyYXkg44Gn6L+U44GZLlxuICovXG5abGliLkJpdFN0cmVhbS5wcm90b3R5cGUuZmluaXNoID0gZnVuY3Rpb24oKSB7XG4gIHZhciBidWZmZXIgPSB0aGlzLmJ1ZmZlcjtcbiAgdmFyIGluZGV4ID0gdGhpcy5pbmRleDtcblxuICAvKiogQHR5cGUgeyEoQXJyYXl8VWludDhBcnJheSl9IG91dHB1dCBidWZmZXIuICovXG4gIHZhciBvdXRwdXQ7XG5cbiAgLy8gYml0aW5kZXgg44GMIDAg44Gu5pmC44Gv5L2Z5YiG44GrIGluZGV4IOOBjOmAsuOCk+OBp+OBhOOCi+eKtuaFi1xuICBpZiAodGhpcy5iaXRpbmRleCA+IDApIHtcbiAgICBidWZmZXJbaW5kZXhdIDw8PSA4IC0gdGhpcy5iaXRpbmRleDtcbiAgICBidWZmZXJbaW5kZXhdID0gWmxpYi5CaXRTdHJlYW0uUmV2ZXJzZVRhYmxlW2J1ZmZlcltpbmRleF1dO1xuICAgIGluZGV4Kys7XG4gIH1cblxuICAvLyBhcnJheSB0cnVuY2F0aW9uXG4gIGlmIChVU0VfVFlQRURBUlJBWSkge1xuICAgIG91dHB1dCA9IGJ1ZmZlci5zdWJhcnJheSgwLCBpbmRleCk7XG4gIH0gZWxzZSB7XG4gICAgYnVmZmVyLmxlbmd0aCA9IGluZGV4O1xuICAgIG91dHB1dCA9IGJ1ZmZlcjtcbiAgfVxuXG4gIHJldHVybiBvdXRwdXQ7XG59O1xuXG4vKipcbiAqIDAtMjU1IOOBruODk+ODg+ODiOmghuOCkuWPjei7ouOBl+OBn+ODhuODvOODluODq1xuICogQGNvbnN0XG4gKiBAdHlwZSB7IShVaW50OEFycmF5fEFycmF5LjxudW1iZXI+KX1cbiAqL1xuWmxpYi5CaXRTdHJlYW0uUmV2ZXJzZVRhYmxlID0gKGZ1bmN0aW9uKHRhYmxlKSB7XG4gIHJldHVybiB0YWJsZTtcbn0pKChmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHshKEFycmF5fFVpbnQ4QXJyYXkpfSByZXZlcnNlIHRhYmxlLiAqL1xuICB2YXIgdGFibGUgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KSgyNTYpO1xuICAvKiogQHR5cGUge251bWJlcn0gbG9vcCBjb3VudGVyLiAqL1xuICB2YXIgaTtcblxuICAvLyBnZW5lcmF0ZVxuICBmb3IgKGkgPSAwOyBpIDwgMjU2OyArK2kpIHtcbiAgICB0YWJsZVtpXSA9IChmdW5jdGlvbihuKSB7XG4gICAgICB2YXIgciA9IG47XG4gICAgICB2YXIgcyA9IDc7XG5cbiAgICAgIGZvciAobiA+Pj49IDE7IG47IG4gPj4+PSAxKSB7XG4gICAgICAgIHIgPDw9IDE7XG4gICAgICAgIHIgfD0gbiAmIDE7XG4gICAgICAgIC0tcztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIChyIDw8IHMgJiAweGZmKSA+Pj4gMDtcbiAgICB9KShpKTtcbiAgfVxuXG4gIHJldHVybiB0YWJsZTtcbn0pKCkpO1xuXG5cbi8vIGVuZCBvZiBzY29wZVxufSk7XG5cbi8qIHZpbTpzZXQgZXhwYW5kdGFiIHRzPTIgc3c9MiB0dz04MDogKi9cbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDUkMzMiDlrp/oo4UuXG4gKi9cbmdvb2cucHJvdmlkZSgnWmxpYi5DUkMzMicpO1xuXG5nb29nLnJlcXVpcmUoJ1VTRV9UWVBFREFSUkFZJyk7XG5cbi8qKiBAZGVmaW5lIHtib29sZWFufSAqL1xudmFyIFpMSUJfQ1JDMzJfQ09NUEFDVCA9IGZhbHNlO1xuXG5nb29nLnNjb3BlKGZ1bmN0aW9uKCkge1xuXG4vKipcbiAqIENSQzMyIOODj+ODg+OCt+ODpeWApOOCkuWPluW+l1xuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBkYXRhIGRhdGEgYnl0ZSBhcnJheS5cbiAqIEBwYXJhbSB7bnVtYmVyPX0gcG9zIGRhdGEgcG9zaXRpb24uXG4gKiBAcGFyYW0ge251bWJlcj19IGxlbmd0aCBkYXRhIGxlbmd0aC5cbiAqIEByZXR1cm4ge251bWJlcn0gQ1JDMzIuXG4gKi9cblpsaWIuQ1JDMzIuY2FsYyA9IGZ1bmN0aW9uKGRhdGEsIHBvcywgbGVuZ3RoKSB7XG4gIHJldHVybiBabGliLkNSQzMyLnVwZGF0ZShkYXRhLCAwLCBwb3MsIGxlbmd0aCk7XG59O1xuXG4vKipcbiAqIENSQzMy44OP44OD44K344Ol5YCk44KS5pu05pawXG4gKiBAcGFyYW0geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGRhdGEgZGF0YSBieXRlIGFycmF5LlxuICogQHBhcmFtIHtudW1iZXJ9IGNyYyBDUkMzMi5cbiAqIEBwYXJhbSB7bnVtYmVyPX0gcG9zIGRhdGEgcG9zaXRpb24uXG4gKiBAcGFyYW0ge251bWJlcj19IGxlbmd0aCBkYXRhIGxlbmd0aC5cbiAqIEByZXR1cm4ge251bWJlcn0gQ1JDMzIuXG4gKi9cblpsaWIuQ1JDMzIudXBkYXRlID0gZnVuY3Rpb24oZGF0YSwgY3JjLCBwb3MsIGxlbmd0aCkge1xuICB2YXIgdGFibGUgPSBabGliLkNSQzMyLlRhYmxlO1xuICB2YXIgaSA9ICh0eXBlb2YgcG9zID09PSAnbnVtYmVyJykgPyBwb3MgOiAocG9zID0gMCk7XG4gIHZhciBpbCA9ICh0eXBlb2YgbGVuZ3RoID09PSAnbnVtYmVyJykgPyBsZW5ndGggOiBkYXRhLmxlbmd0aDtcblxuICBjcmMgXj0gMHhmZmZmZmZmZjtcblxuICAvLyBsb29wIHVucm9sbGluZyBmb3IgcGVyZm9ybWFuY2VcbiAgZm9yIChpID0gaWwgJiA3OyBpLS07ICsrcG9zKSB7XG4gICAgY3JjID0gKGNyYyA+Pj4gOCkgXiB0YWJsZVsoY3JjIF4gZGF0YVtwb3NdKSAmIDB4ZmZdO1xuICB9XG4gIGZvciAoaSA9IGlsID4+IDM7IGktLTsgcG9zICs9IDgpIHtcbiAgICBjcmMgPSAoY3JjID4+PiA4KSBeIHRhYmxlWyhjcmMgXiBkYXRhW3BvcyAgICBdKSAmIDB4ZmZdO1xuICAgIGNyYyA9IChjcmMgPj4+IDgpIF4gdGFibGVbKGNyYyBeIGRhdGFbcG9zICsgMV0pICYgMHhmZl07XG4gICAgY3JjID0gKGNyYyA+Pj4gOCkgXiB0YWJsZVsoY3JjIF4gZGF0YVtwb3MgKyAyXSkgJiAweGZmXTtcbiAgICBjcmMgPSAoY3JjID4+PiA4KSBeIHRhYmxlWyhjcmMgXiBkYXRhW3BvcyArIDNdKSAmIDB4ZmZdO1xuICAgIGNyYyA9IChjcmMgPj4+IDgpIF4gdGFibGVbKGNyYyBeIGRhdGFbcG9zICsgNF0pICYgMHhmZl07XG4gICAgY3JjID0gKGNyYyA+Pj4gOCkgXiB0YWJsZVsoY3JjIF4gZGF0YVtwb3MgKyA1XSkgJiAweGZmXTtcbiAgICBjcmMgPSAoY3JjID4+PiA4KSBeIHRhYmxlWyhjcmMgXiBkYXRhW3BvcyArIDZdKSAmIDB4ZmZdO1xuICAgIGNyYyA9IChjcmMgPj4+IDgpIF4gdGFibGVbKGNyYyBeIGRhdGFbcG9zICsgN10pICYgMHhmZl07XG4gIH1cblxuICByZXR1cm4gKGNyYyBeIDB4ZmZmZmZmZmYpID4+PiAwO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge251bWJlcn0gbnVtXG4gKiBAcGFyYW0ge251bWJlcn0gY3JjXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxuICovXG5abGliLkNSQzMyLnNpbmdsZSA9IGZ1bmN0aW9uKG51bSwgY3JjKSB7XG4gIHJldHVybiAoWmxpYi5DUkMzMi5UYWJsZVsobnVtIF4gY3JjKSAmIDB4ZmZdIF4gKG51bSA+Pj4gOCkpID4+PiAwO1xufTtcblxuLyoqXG4gKiBAdHlwZSB7QXJyYXkuPG51bWJlcj59XG4gKiBAY29uc3RcbiAqIEBwcml2YXRlXG4gKi9cblpsaWIuQ1JDMzIuVGFibGVfID0gW1xuICAweDAwMDAwMDAwLCAweDc3MDczMDk2LCAweGVlMGU2MTJjLCAweDk5MDk1MWJhLCAweDA3NmRjNDE5LCAweDcwNmFmNDhmLFxuICAweGU5NjNhNTM1LCAweDllNjQ5NWEzLCAweDBlZGI4ODMyLCAweDc5ZGNiOGE0LCAweGUwZDVlOTFlLCAweDk3ZDJkOTg4LFxuICAweDA5YjY0YzJiLCAweDdlYjE3Y2JkLCAweGU3YjgyZDA3LCAweDkwYmYxZDkxLCAweDFkYjcxMDY0LCAweDZhYjAyMGYyLFxuICAweGYzYjk3MTQ4LCAweDg0YmU0MWRlLCAweDFhZGFkNDdkLCAweDZkZGRlNGViLCAweGY0ZDRiNTUxLCAweDgzZDM4NWM3LFxuICAweDEzNmM5ODU2LCAweDY0NmJhOGMwLCAweGZkNjJmOTdhLCAweDhhNjVjOWVjLCAweDE0MDE1YzRmLCAweDYzMDY2Y2Q5LFxuICAweGZhMGYzZDYzLCAweDhkMDgwZGY1LCAweDNiNmUyMGM4LCAweDRjNjkxMDVlLCAweGQ1NjA0MWU0LCAweGEyNjc3MTcyLFxuICAweDNjMDNlNGQxLCAweDRiMDRkNDQ3LCAweGQyMGQ4NWZkLCAweGE1MGFiNTZiLCAweDM1YjVhOGZhLCAweDQyYjI5ODZjLFxuICAweGRiYmJjOWQ2LCAweGFjYmNmOTQwLCAweDMyZDg2Y2UzLCAweDQ1ZGY1Yzc1LCAweGRjZDYwZGNmLCAweGFiZDEzZDU5LFxuICAweDI2ZDkzMGFjLCAweDUxZGUwMDNhLCAweGM4ZDc1MTgwLCAweGJmZDA2MTE2LCAweDIxYjRmNGI1LCAweDU2YjNjNDIzLFxuICAweGNmYmE5NTk5LCAweGI4YmRhNTBmLCAweDI4MDJiODllLCAweDVmMDU4ODA4LCAweGM2MGNkOWIyLCAweGIxMGJlOTI0LFxuICAweDJmNmY3Yzg3LCAweDU4Njg0YzExLCAweGMxNjExZGFiLCAweGI2NjYyZDNkLCAweDc2ZGM0MTkwLCAweDAxZGI3MTA2LFxuICAweDk4ZDIyMGJjLCAweGVmZDUxMDJhLCAweDcxYjE4NTg5LCAweDA2YjZiNTFmLCAweDlmYmZlNGE1LCAweGU4YjhkNDMzLFxuICAweDc4MDdjOWEyLCAweDBmMDBmOTM0LCAweDk2MDlhODhlLCAweGUxMGU5ODE4LCAweDdmNmEwZGJiLCAweDA4NmQzZDJkLFxuICAweDkxNjQ2Yzk3LCAweGU2NjM1YzAxLCAweDZiNmI1MWY0LCAweDFjNmM2MTYyLCAweDg1NjUzMGQ4LCAweGYyNjIwMDRlLFxuICAweDZjMDY5NWVkLCAweDFiMDFhNTdiLCAweDgyMDhmNGMxLCAweGY1MGZjNDU3LCAweDY1YjBkOWM2LCAweDEyYjdlOTUwLFxuICAweDhiYmViOGVhLCAweGZjYjk4ODdjLCAweDYyZGQxZGRmLCAweDE1ZGEyZDQ5LCAweDhjZDM3Y2YzLCAweGZiZDQ0YzY1LFxuICAweDRkYjI2MTU4LCAweDNhYjU1MWNlLCAweGEzYmMwMDc0LCAweGQ0YmIzMGUyLCAweDRhZGZhNTQxLCAweDNkZDg5NWQ3LFxuICAweGE0ZDFjNDZkLCAweGQzZDZmNGZiLCAweDQzNjllOTZhLCAweDM0NmVkOWZjLCAweGFkNjc4ODQ2LCAweGRhNjBiOGQwLFxuICAweDQ0MDQyZDczLCAweDMzMDMxZGU1LCAweGFhMGE0YzVmLCAweGRkMGQ3Y2M5LCAweDUwMDU3MTNjLCAweDI3MDI0MWFhLFxuICAweGJlMGIxMDEwLCAweGM5MGMyMDg2LCAweDU3NjhiNTI1LCAweDIwNmY4NWIzLCAweGI5NjZkNDA5LCAweGNlNjFlNDlmLFxuICAweDVlZGVmOTBlLCAweDI5ZDljOTk4LCAweGIwZDA5ODIyLCAweGM3ZDdhOGI0LCAweDU5YjMzZDE3LCAweDJlYjQwZDgxLFxuICAweGI3YmQ1YzNiLCAweGMwYmE2Y2FkLCAweGVkYjg4MzIwLCAweDlhYmZiM2I2LCAweDAzYjZlMjBjLCAweDc0YjFkMjlhLFxuICAweGVhZDU0NzM5LCAweDlkZDI3N2FmLCAweDA0ZGIyNjE1LCAweDczZGMxNjgzLCAweGUzNjMwYjEyLCAweDk0NjQzYjg0LFxuICAweDBkNmQ2YTNlLCAweDdhNmE1YWE4LCAweGU0MGVjZjBiLCAweDkzMDlmZjlkLCAweDBhMDBhZTI3LCAweDdkMDc5ZWIxLFxuICAweGYwMGY5MzQ0LCAweDg3MDhhM2QyLCAweDFlMDFmMjY4LCAweDY5MDZjMmZlLCAweGY3NjI1NzVkLCAweDgwNjU2N2NiLFxuICAweDE5NmMzNjcxLCAweDZlNmIwNmU3LCAweGZlZDQxYjc2LCAweDg5ZDMyYmUwLCAweDEwZGE3YTVhLCAweDY3ZGQ0YWNjLFxuICAweGY5YjlkZjZmLCAweDhlYmVlZmY5LCAweDE3YjdiZTQzLCAweDYwYjA4ZWQ1LCAweGQ2ZDZhM2U4LCAweGExZDE5MzdlLFxuICAweDM4ZDhjMmM0LCAweDRmZGZmMjUyLCAweGQxYmI2N2YxLCAweGE2YmM1NzY3LCAweDNmYjUwNmRkLCAweDQ4YjIzNjRiLFxuICAweGQ4MGQyYmRhLCAweGFmMGExYjRjLCAweDM2MDM0YWY2LCAweDQxMDQ3YTYwLCAweGRmNjBlZmMzLCAweGE4NjdkZjU1LFxuICAweDMxNmU4ZWVmLCAweDQ2NjliZTc5LCAweGNiNjFiMzhjLCAweGJjNjY4MzFhLCAweDI1NmZkMmEwLCAweDUyNjhlMjM2LFxuICAweGNjMGM3Nzk1LCAweGJiMGI0NzAzLCAweDIyMDIxNmI5LCAweDU1MDUyNjJmLCAweGM1YmEzYmJlLCAweGIyYmQwYjI4LFxuICAweDJiYjQ1YTkyLCAweDVjYjM2YTA0LCAweGMyZDdmZmE3LCAweGI1ZDBjZjMxLCAweDJjZDk5ZThiLCAweDViZGVhZTFkLFxuICAweDliNjRjMmIwLCAweGVjNjNmMjI2LCAweDc1NmFhMzljLCAweDAyNmQ5MzBhLCAweDljMDkwNmE5LCAweGViMGUzNjNmLFxuICAweDcyMDc2Nzg1LCAweDA1MDA1NzEzLCAweDk1YmY0YTgyLCAweGUyYjg3YTE0LCAweDdiYjEyYmFlLCAweDBjYjYxYjM4LFxuICAweDkyZDI4ZTliLCAweGU1ZDViZTBkLCAweDdjZGNlZmI3LCAweDBiZGJkZjIxLCAweDg2ZDNkMmQ0LCAweGYxZDRlMjQyLFxuICAweDY4ZGRiM2Y4LCAweDFmZGE4MzZlLCAweDgxYmUxNmNkLCAweGY2YjkyNjViLCAweDZmYjA3N2UxLCAweDE4Yjc0Nzc3LFxuICAweDg4MDg1YWU2LCAweGZmMGY2YTcwLCAweDY2MDYzYmNhLCAweDExMDEwYjVjLCAweDhmNjU5ZWZmLCAweGY4NjJhZTY5LFxuICAweDYxNmJmZmQzLCAweDE2NmNjZjQ1LCAweGEwMGFlMjc4LCAweGQ3MGRkMmVlLCAweDRlMDQ4MzU0LCAweDM5MDNiM2MyLFxuICAweGE3NjcyNjYxLCAweGQwNjAxNmY3LCAweDQ5Njk0NzRkLCAweDNlNmU3N2RiLCAweGFlZDE2YTRhLCAweGQ5ZDY1YWRjLFxuICAweDQwZGYwYjY2LCAweDM3ZDgzYmYwLCAweGE5YmNhZTUzLCAweGRlYmI5ZWM1LCAweDQ3YjJjZjdmLCAweDMwYjVmZmU5LFxuICAweGJkYmRmMjFjLCAweGNhYmFjMjhhLCAweDUzYjM5MzMwLCAweDI0YjRhM2E2LCAweGJhZDAzNjA1LCAweGNkZDcwNjkzLFxuICAweDU0ZGU1NzI5LCAweDIzZDk2N2JmLCAweGIzNjY3YTJlLCAweGM0NjE0YWI4LCAweDVkNjgxYjAyLCAweDJhNmYyYjk0LFxuICAweGI0MGJiZTM3LCAweGMzMGM4ZWExLCAweDVhMDVkZjFiLCAweDJkMDJlZjhkXG5dO1xuXG4vKipcbiAqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX0gQ1JDLTMyIFRhYmxlLlxuICogQGNvbnN0XG4gKi9cblpsaWIuQ1JDMzIuVGFibGUgPSBaTElCX0NSQzMyX0NPTVBBQ1QgPyAoZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50MzJBcnJheSl9ICovXG4gIHZhciB0YWJsZSA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50MzJBcnJheSA6IEFycmF5KSgyNTYpO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGM7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBqO1xuXG4gIGZvciAoaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICAgIGMgPSBpO1xuICAgIGZvciAoaiA9IDA7IGogPCA4OyArK2opIHtcbiAgICAgIGMgPSAoYyAmIDEpID8gKDB4ZWRCODgzMjAgXiAoYyA+Pj4gMSkpIDogKGMgPj4+IDEpO1xuICAgIH1cbiAgICB0YWJsZVtpXSA9IGMgPj4+IDA7XG4gIH1cblxuICByZXR1cm4gdGFibGU7XG59KSgpIDogVVNFX1RZUEVEQVJSQVkgPyBuZXcgVWludDMyQXJyYXkoWmxpYi5DUkMzMi5UYWJsZV8pIDogWmxpYi5DUkMzMi5UYWJsZV87XG5cbn0pO1xuIiwiZ29vZy5wcm92aWRlKCdGaXhQaGFudG9tSlNGdW5jdGlvbkFwcGx5QnVnX1N0cmluZ0Zyb21DaGFyQ29kZScpO1xuXG5pZiAod2luZG93LlVpbnQ4QXJyYXkgIT09IHZvaWQgMCkge1xuICB0cnkge1xuICAgIC8vIGFudGktb3B0aW1pemF0aW9uXG4gICAgU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBuZXcgVWludDhBcnJheShbMF0pKTtcbiAgICAvKlxuICAgIGlmIChTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIG5ldyBVaW50OEFycmF5KFswXSkpID09PSBudWxsKSB7XG4gICAgICBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5ID0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseTtcbiAgICB9XG4gICAgKi9cbiAgfSBjYXRjaChlKSB7XG4gICAgU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseSA9IChmdW5jdGlvbihmcm9tQ2hhckNvZGVBcHBseSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKHRoaXNvYmosIGFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIGZyb21DaGFyQ29kZUFwcGx5LmNhbGwoU3RyaW5nLmZyb21DaGFyQ29kZSwgdGhpc29iaiwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJncykpO1xuICAgICAgfVxuICAgIH0pKFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkpO1xuICB9XG59IiwiZ29vZy5wcm92aWRlKCdabGliLkd1bnppcE1lbWJlcicpO1xuXG5nb29nLnNjb3BlKGZ1bmN0aW9uKCkge1xuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5abGliLkd1bnppcE1lbWJlciA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUge251bWJlcn0gc2lnbmF0dXJlIGZpcnN0IGJ5dGUuICovXG4gIHRoaXMuaWQxO1xuICAvKiogQHR5cGUge251bWJlcn0gc2lnbmF0dXJlIHNlY29uZCBieXRlLiAqL1xuICB0aGlzLmlkMjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGNvbXByZXNzaW9uIG1ldGhvZC4gKi9cbiAgdGhpcy5jbTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGZsYWdzLiAqL1xuICB0aGlzLmZsZztcbiAgLyoqIEB0eXBlIHtEYXRlfSBtb2RpZmljYXRpb24gdGltZS4gKi9cbiAgdGhpcy5tdGltZTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGV4dHJhIGZsYWdzLiAqL1xuICB0aGlzLnhmbDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IG9wZXJhdGluZyBzeXN0ZW0gbnVtYmVyLiAqL1xuICB0aGlzLm9zO1xuICAvKiogQHR5cGUge251bWJlcn0gQ1JDLTE2IHZhbHVlIGZvciBGSENSQyBmbGFnLiAqL1xuICB0aGlzLmNyYzE2O1xuICAvKiogQHR5cGUge251bWJlcn0gZXh0cmEgbGVuZ3RoLiAqL1xuICB0aGlzLnhsZW47XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBDUkMtMzIgdmFsdWUgZm9yIHZlcmlmaWNhdGlvbi4gKi9cbiAgdGhpcy5jcmMzMjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGlucHV0IHNpemUgbW9kdWxvIDMyIHZhbHVlLiAqL1xuICB0aGlzLmlzaXplO1xuICAvKiogQHR5cGUge3N0cmluZ30gZmlsZW5hbWUuICovXG4gIHRoaXMubmFtZTtcbiAgLyoqIEB0eXBlIHtzdHJpbmd9IGNvbW1lbnQuICovXG4gIHRoaXMuY29tbWVudDtcbiAgLyoqIEB0eXBlIHshKFVpbnQ4QXJyYXl8QXJyYXkuPG51bWJlcj4pfSAqL1xuICB0aGlzLmRhdGE7XG59O1xuXG5abGliLkd1bnppcE1lbWJlci5wcm90b3R5cGUuZ2V0TmFtZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5uYW1lO1xufTtcblxuWmxpYi5HdW56aXBNZW1iZXIucHJvdG90eXBlLmdldERhdGEgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuZGF0YTtcbn07XG5cblpsaWIuR3VuemlwTWVtYmVyLnByb3RvdHlwZS5nZXRNdGltZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5tdGltZTtcbn1cblxufSk7IiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEhlYXAgU29ydCDlrp/oo4UuIOODj+ODleODnuODs+espuWPt+WMluOBp+S9v+eUqOOBmeOCiy5cbiAqL1xuXG5nb29nLnByb3ZpZGUoJ1psaWIuSGVhcCcpO1xuXG5nb29nLnJlcXVpcmUoJ1VTRV9UWVBFREFSUkFZJyk7XG5cbmdvb2cuc2NvcGUoZnVuY3Rpb24oKSB7XG5cbi8qKlxuICog44Kr44K544K/44Og44OP44OV44Oe44Oz56ym5Y+344Gn5L2/55So44GZ44KL44OS44O844OX5a6f6KOFXG4gKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoIOODkuODvOODl+OCteOCpOOCui5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5abGliLkhlYXAgPSBmdW5jdGlvbihsZW5ndGgpIHtcbiAgdGhpcy5idWZmZXIgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDE2QXJyYXkgOiBBcnJheSkobGVuZ3RoICogMik7XG4gIHRoaXMubGVuZ3RoID0gMDtcbn07XG5cbi8qKlxuICog6Kaq44OO44O844OJ44GuIGluZGV4IOWPluW+l1xuICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IOWtkOODjuODvOODieOBriBpbmRleC5cbiAqIEByZXR1cm4ge251bWJlcn0g6Kaq44OO44O844OJ44GuIGluZGV4LlxuICpcbiAqL1xuWmxpYi5IZWFwLnByb3RvdHlwZS5nZXRQYXJlbnQgPSBmdW5jdGlvbihpbmRleCkge1xuICByZXR1cm4gKChpbmRleCAtIDIpIC8gNCB8IDApICogMjtcbn07XG5cbi8qKlxuICog5a2Q44OO44O844OJ44GuIGluZGV4IOWPluW+l1xuICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IOimquODjuODvOODieOBriBpbmRleC5cbiAqIEByZXR1cm4ge251bWJlcn0g5a2Q44OO44O844OJ44GuIGluZGV4LlxuICovXG5abGliLkhlYXAucHJvdG90eXBlLmdldENoaWxkID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgcmV0dXJuIDIgKiBpbmRleCArIDI7XG59O1xuXG4vKipcbiAqIEhlYXAg44Gr5YCk44KS6L+95Yqg44GZ44KLXG4gKiBAcGFyYW0ge251bWJlcn0gaW5kZXgg44Kt44O8IGluZGV4LlxuICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIOWApC5cbiAqIEByZXR1cm4ge251bWJlcn0g54++5Zyo44Gu44OS44O844OX6ZW3LlxuICovXG5abGliLkhlYXAucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbihpbmRleCwgdmFsdWUpIHtcbiAgdmFyIGN1cnJlbnQsIHBhcmVudCxcbiAgICAgIGhlYXAgPSB0aGlzLmJ1ZmZlcixcbiAgICAgIHN3YXA7XG5cbiAgY3VycmVudCA9IHRoaXMubGVuZ3RoO1xuICBoZWFwW3RoaXMubGVuZ3RoKytdID0gdmFsdWU7XG4gIGhlYXBbdGhpcy5sZW5ndGgrK10gPSBpbmRleDtcblxuICAvLyDjg6vjg7zjg4jjg47jg7zjg4njgavjgZ/jganjgornnYDjgY/jgb7jgaflhaXjgozmm7/jgYjjgpLoqabjgb/jgotcbiAgd2hpbGUgKGN1cnJlbnQgPiAwKSB7XG4gICAgcGFyZW50ID0gdGhpcy5nZXRQYXJlbnQoY3VycmVudCk7XG5cbiAgICAvLyDopqrjg47jg7zjg4njgajmr5TovIPjgZfjgabopqrjga7mlrnjgYzlsI/jgZXjgZHjgozjgbDlhaXjgozmm7/jgYjjgotcbiAgICBpZiAoaGVhcFtjdXJyZW50XSA+IGhlYXBbcGFyZW50XSkge1xuICAgICAgc3dhcCA9IGhlYXBbY3VycmVudF07XG4gICAgICBoZWFwW2N1cnJlbnRdID0gaGVhcFtwYXJlbnRdO1xuICAgICAgaGVhcFtwYXJlbnRdID0gc3dhcDtcblxuICAgICAgc3dhcCA9IGhlYXBbY3VycmVudCArIDFdO1xuICAgICAgaGVhcFtjdXJyZW50ICsgMV0gPSBoZWFwW3BhcmVudCArIDFdO1xuICAgICAgaGVhcFtwYXJlbnQgKyAxXSA9IHN3YXA7XG5cbiAgICAgIGN1cnJlbnQgPSBwYXJlbnQ7XG4gICAgLy8g5YWl44KM5pu/44GI44GM5b+F6KaB44Gq44GP44Gq44Gj44Gf44KJ44Gd44GT44Gn5oqc44GR44KLXG4gICAgfSBlbHNlIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzLmxlbmd0aDtcbn07XG5cbi8qKlxuICogSGVhcOOBi+OCieS4gOeVquWkp+OBjeOBhOWApOOCkui/lOOBmVxuICogQHJldHVybiB7e2luZGV4OiBudW1iZXIsIHZhbHVlOiBudW1iZXIsIGxlbmd0aDogbnVtYmVyfX0ge2luZGV4OiDjgq3jg7xpbmRleCxcbiAqICAgICB2YWx1ZTog5YCkLCBsZW5ndGg6IOODkuODvOODl+mVt30g44GuIE9iamVjdC5cbiAqL1xuWmxpYi5IZWFwLnByb3RvdHlwZS5wb3AgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGluZGV4LCB2YWx1ZSxcbiAgICAgIGhlYXAgPSB0aGlzLmJ1ZmZlciwgc3dhcCxcbiAgICAgIGN1cnJlbnQsIHBhcmVudDtcblxuICB2YWx1ZSA9IGhlYXBbMF07XG4gIGluZGV4ID0gaGVhcFsxXTtcblxuICAvLyDlvozjgo3jgYvjgonlgKTjgpLlj5bjgotcbiAgdGhpcy5sZW5ndGggLT0gMjtcbiAgaGVhcFswXSA9IGhlYXBbdGhpcy5sZW5ndGhdO1xuICBoZWFwWzFdID0gaGVhcFt0aGlzLmxlbmd0aCArIDFdO1xuXG4gIHBhcmVudCA9IDA7XG4gIC8vIOODq+ODvOODiOODjuODvOODieOBi+OCieS4i+OBjOOBo+OBpuOBhOOBj1xuICB3aGlsZSAodHJ1ZSkge1xuICAgIGN1cnJlbnQgPSB0aGlzLmdldENoaWxkKHBhcmVudCk7XG5cbiAgICAvLyDnr4Tlm7Ljg4Hjgqfjg4Pjgq9cbiAgICBpZiAoY3VycmVudCA+PSB0aGlzLmxlbmd0aCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8g6Zqj44Gu44OO44O844OJ44Go5q+U6LyD44GX44Gm44CB6Zqj44Gu5pa544GM5YCk44GM5aSn44GN44GR44KM44Gw6Zqj44KS54++5Zyo44OO44O844OJ44Go44GX44Gm6YG45oqeXG4gICAgaWYgKGN1cnJlbnQgKyAyIDwgdGhpcy5sZW5ndGggJiYgaGVhcFtjdXJyZW50ICsgMl0gPiBoZWFwW2N1cnJlbnRdKSB7XG4gICAgICBjdXJyZW50ICs9IDI7XG4gICAgfVxuXG4gICAgLy8g6Kaq44OO44O844OJ44Go5q+U6LyD44GX44Gm6Kaq44Gu5pa544GM5bCP44GV44GE5aC05ZCI44Gv5YWl44KM5pu/44GI44KLXG4gICAgaWYgKGhlYXBbY3VycmVudF0gPiBoZWFwW3BhcmVudF0pIHtcbiAgICAgIHN3YXAgPSBoZWFwW3BhcmVudF07XG4gICAgICBoZWFwW3BhcmVudF0gPSBoZWFwW2N1cnJlbnRdO1xuICAgICAgaGVhcFtjdXJyZW50XSA9IHN3YXA7XG5cbiAgICAgIHN3YXAgPSBoZWFwW3BhcmVudCArIDFdO1xuICAgICAgaGVhcFtwYXJlbnQgKyAxXSA9IGhlYXBbY3VycmVudCArIDFdO1xuICAgICAgaGVhcFtjdXJyZW50ICsgMV0gPSBzd2FwO1xuICAgIH0gZWxzZSB7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBwYXJlbnQgPSBjdXJyZW50O1xuICB9XG5cbiAgcmV0dXJuIHtpbmRleDogaW5kZXgsIHZhbHVlOiB2YWx1ZSwgbGVuZ3RoOiB0aGlzLmxlbmd0aH07XG59O1xuXG5cbi8vIGVuZCBvZiBzY29wZVxufSk7XG5cbi8qIHZpbTpzZXQgZXhwYW5kdGFiIHRzPTIgc3c9MiB0dz04MDogKi9cbiIsImdvb2cucHJvdmlkZSgnWmxpYi5IdWZmbWFuJyk7XG5cbmdvb2cucmVxdWlyZSgnVVNFX1RZUEVEQVJSQVknKTtcblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxuLyoqXG4gKiBidWlsZCBodWZmbWFuIHRhYmxlIGZyb20gbGVuZ3RoIGxpc3QuXG4gKiBAcGFyYW0geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGxlbmd0aHMgbGVuZ3RoIGxpc3QuXG4gKiBAcmV0dXJuIHshQXJyYXl9IGh1ZmZtYW4gdGFibGUuXG4gKi9cblpsaWIuSHVmZm1hbi5idWlsZEh1ZmZtYW5UYWJsZSA9IGZ1bmN0aW9uKGxlbmd0aHMpIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGxlbmd0aCBsaXN0IHNpemUuICovXG4gIHZhciBsaXN0U2l6ZSA9IGxlbmd0aHMubGVuZ3RoO1xuICAvKiogQHR5cGUge251bWJlcn0gbWF4IGNvZGUgbGVuZ3RoIGZvciB0YWJsZSBzaXplLiAqL1xuICB2YXIgbWF4Q29kZUxlbmd0aCA9IDA7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBtaW4gY29kZSBsZW5ndGggZm9yIHRhYmxlIHNpemUuICovXG4gIHZhciBtaW5Db2RlTGVuZ3RoID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICAvKiogQHR5cGUge251bWJlcn0gdGFibGUgc2l6ZS4gKi9cbiAgdmFyIHNpemU7XG4gIC8qKiBAdHlwZSB7IShBcnJheXxVaW50OEFycmF5KX0gaHVmZm1hbiBjb2RlIHRhYmxlLiAqL1xuICB2YXIgdGFibGU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBiaXQgbGVuZ3RoLiAqL1xuICB2YXIgYml0TGVuZ3RoO1xuICAvKiogQHR5cGUge251bWJlcn0gaHVmZm1hbiBjb2RlLiAqL1xuICB2YXIgY29kZTtcbiAgLyoqXG4gICAqIOOCteOCpOOCuuOBjCAyXm1heGxlbmd0aCDlgIvjga7jg4bjg7zjg5bjg6vjgpLln4vjgoHjgovjgZ/jgoHjga7jgrnjgq3jg4Pjg5fplbcuXG4gICAqIEB0eXBlIHtudW1iZXJ9IHNraXAgbGVuZ3RoIGZvciB0YWJsZSBmaWxsaW5nLlxuICAgKi9cbiAgdmFyIHNraXA7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSByZXZlcnNlZCBjb2RlLiAqL1xuICB2YXIgcmV2ZXJzZWQ7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSByZXZlcnNlIHRlbXAuICovXG4gIHZhciBydGVtcDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGxvb3AgY291bnRlci4gKi9cbiAgdmFyIGk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGxpbWl0LiAqL1xuICB2YXIgaWw7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGNvdW50ZXIuICovXG4gIHZhciBqO1xuICAvKiogQHR5cGUge251bWJlcn0gdGFibGUgdmFsdWUuICovXG4gIHZhciB2YWx1ZTtcblxuICAvLyBNYXRoLm1heCDjga/pgYXjgYTjga7jgafmnIDplbfjga7lgKTjga8gZm9yLWxvb3Ag44Gn5Y+W5b6X44GZ44KLXG4gIGZvciAoaSA9IDAsIGlsID0gbGlzdFNpemU7IGkgPCBpbDsgKytpKSB7XG4gICAgaWYgKGxlbmd0aHNbaV0gPiBtYXhDb2RlTGVuZ3RoKSB7XG4gICAgICBtYXhDb2RlTGVuZ3RoID0gbGVuZ3Roc1tpXTtcbiAgICB9XG4gICAgaWYgKGxlbmd0aHNbaV0gPCBtaW5Db2RlTGVuZ3RoKSB7XG4gICAgICBtaW5Db2RlTGVuZ3RoID0gbGVuZ3Roc1tpXTtcbiAgICB9XG4gIH1cblxuICBzaXplID0gMSA8PCBtYXhDb2RlTGVuZ3RoO1xuICB0YWJsZSA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50MzJBcnJheSA6IEFycmF5KShzaXplKTtcblxuICAvLyDjg5Pjg4Pjg4jplbfjga7nn63jgYTpoIbjgYvjgonjg4/jg5Xjg57jg7PnrKblj7fjgpLlibLjgorlvZPjgabjgotcbiAgZm9yIChiaXRMZW5ndGggPSAxLCBjb2RlID0gMCwgc2tpcCA9IDI7IGJpdExlbmd0aCA8PSBtYXhDb2RlTGVuZ3RoOykge1xuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0U2l6ZTsgKytpKSB7XG4gICAgICBpZiAobGVuZ3Roc1tpXSA9PT0gYml0TGVuZ3RoKSB7XG4gICAgICAgIC8vIOODk+ODg+ODiOOCquODvOODgOODvOOBjOmAhuOBq+OBquOCi+OBn+OCgeODk+ODg+ODiOmVt+WIhuS4puOBs+OCkuWPjei7ouOBmeOCi1xuICAgICAgICBmb3IgKHJldmVyc2VkID0gMCwgcnRlbXAgPSBjb2RlLCBqID0gMDsgaiA8IGJpdExlbmd0aDsgKytqKSB7XG4gICAgICAgICAgcmV2ZXJzZWQgPSAocmV2ZXJzZWQgPDwgMSkgfCAocnRlbXAgJiAxKTtcbiAgICAgICAgICBydGVtcCA+Pj0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOacgOWkp+ODk+ODg+ODiOmVt+OCkuOCguOBqOOBq+ODhuODvOODluODq+OCkuS9nOOCi+OBn+OCgeOAgVxuICAgICAgICAvLyDmnIDlpKfjg5Pjg4Pjg4jplbfku6XlpJbjgafjga8gMCAvIDEg44Gp44Gh44KJ44Gn44KC6Imv44GE566H5omA44GM44Gn44GN44KLXG4gICAgICAgIC8vIOOBneOBruOBqeOBoeOCieOBp+OCguiJr+OBhOWgtOaJgOOBr+WQjOOBmOWApOOBp+Wfi+OCgeOCi+OBk+OBqOOBp1xuICAgICAgICAvLyDmnKzmnaXjga7jg5Pjg4Pjg4jplbfku6XkuIrjga7jg5Pjg4Pjg4jmlbDlj5blvpfjgZfjgabjgoLllY/poYzjgYzotbfjgZPjgonjgarjgYTjgojjgYbjgavjgZnjgotcbiAgICAgICAgdmFsdWUgPSAoYml0TGVuZ3RoIDw8IDE2KSB8IGk7XG4gICAgICAgIGZvciAoaiA9IHJldmVyc2VkOyBqIDwgc2l6ZTsgaiArPSBza2lwKSB7XG4gICAgICAgICAgdGFibGVbal0gPSB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgICsrY29kZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDmrKHjga7jg5Pjg4Pjg4jplbfjgbhcbiAgICArK2JpdExlbmd0aDtcbiAgICBjb2RlIDw8PSAxO1xuICAgIHNraXAgPDw9IDE7XG4gIH1cblxuICByZXR1cm4gW3RhYmxlLCBtYXhDb2RlTGVuZ3RoLCBtaW5Db2RlTGVuZ3RoXTtcbn07XG5cblxuLy8gZW5kIG9mIHNjb3BlXG59KTtcblxuLyogdmltOnNldCBleHBhbmR0YWIgdHM9MiBzdz0yIHR3PTgwOiAqL1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IERlZmxhdGUgKFJGQzE5NTEpIOespuWPt+WMluOCouODq+OCtOODquOCuuODoOWun+ijhS5cbiAqL1xuXG5nb29nLnByb3ZpZGUoJ1psaWIuUmF3RGVmbGF0ZScpO1xuXG5nb29nLnJlcXVpcmUoJ1VTRV9UWVBFREFSUkFZJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuQml0U3RyZWFtJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuSGVhcCcpO1xuXG5nb29nLnNjb3BlKGZ1bmN0aW9uKCkge1xuXG4vKipcbiAqIFJhdyBEZWZsYXRlIOWun+ijhVxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBpbnB1dCDnrKblj7fljJbjgZnjgovlr77osaHjga7jg5Djg4Pjg5XjgqEuXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF9wYXJhbXMgb3B0aW9uIHBhcmFtZXRlcnMuXG4gKlxuICogdHlwZWQgYXJyYXkg44GM5L2/55So5Y+v6IO944Gq44Go44GN44CBb3V0cHV0QnVmZmVyIOOBjCBBcnJheSDjga/oh6rli5XnmoTjgasgVWludDhBcnJheSDjgatcbiAqIOWkieaPm+OBleOCjOOBvuOBmS5cbiAqIOWIpeOBruOCquODluOCuOOCp+OCr+ODiOOBq+OBquOCi+OBn+OCgeWHuuWKm+ODkOODg+ODleOCoeOCkuWPgueFp+OBl+OBpuOBhOOCi+WkieaVsOOBquOBqeOBr1xuICog5pu05paw44GZ44KL5b+F6KaB44GM44GC44KK44G+44GZLlxuICovXG5abGliLlJhd0RlZmxhdGUgPSBmdW5jdGlvbihpbnB1dCwgb3B0X3BhcmFtcykge1xuICAvKiogQHR5cGUge1psaWIuUmF3RGVmbGF0ZS5Db21wcmVzc2lvblR5cGV9ICovXG4gIHRoaXMuY29tcHJlc3Npb25UeXBlID0gWmxpYi5SYXdEZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5EWU5BTUlDO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdGhpcy5sYXp5ID0gMDtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX0gKi9cbiAgdGhpcy5mcmVxc0xpdExlbjtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX0gKi9cbiAgdGhpcy5mcmVxc0Rpc3Q7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cbiAgdGhpcy5pbnB1dCA9XG4gICAgKFVTRV9UWVBFREFSUkFZICYmIGlucHV0IGluc3RhbmNlb2YgQXJyYXkpID8gbmV3IFVpbnQ4QXJyYXkoaW5wdXQpIDogaW5wdXQ7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gb3V0cHV0IG91dHB1dCBidWZmZXIuICovXG4gIHRoaXMub3V0cHV0O1xuICAvKiogQHR5cGUge251bWJlcn0gcG9zIG91dHB1dCBidWZmZXIgcG9zaXRpb24uICovXG4gIHRoaXMub3AgPSAwO1xuXG4gIC8vIG9wdGlvbiBwYXJhbWV0ZXJzXG4gIGlmIChvcHRfcGFyYW1zKSB7XG4gICAgaWYgKG9wdF9wYXJhbXNbJ2xhenknXSkge1xuICAgICAgdGhpcy5sYXp5ID0gb3B0X3BhcmFtc1snbGF6eSddO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIG9wdF9wYXJhbXNbJ2NvbXByZXNzaW9uVHlwZSddID09PSAnbnVtYmVyJykge1xuICAgICAgdGhpcy5jb21wcmVzc2lvblR5cGUgPSBvcHRfcGFyYW1zWydjb21wcmVzc2lvblR5cGUnXTtcbiAgICB9XG4gICAgaWYgKG9wdF9wYXJhbXNbJ291dHB1dEJ1ZmZlciddKSB7XG4gICAgICB0aGlzLm91dHB1dCA9XG4gICAgICAgIChVU0VfVFlQRURBUlJBWSAmJiBvcHRfcGFyYW1zWydvdXRwdXRCdWZmZXInXSBpbnN0YW5jZW9mIEFycmF5KSA/XG4gICAgICAgIG5ldyBVaW50OEFycmF5KG9wdF9wYXJhbXNbJ291dHB1dEJ1ZmZlciddKSA6IG9wdF9wYXJhbXNbJ291dHB1dEJ1ZmZlciddO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIG9wdF9wYXJhbXNbJ291dHB1dEluZGV4J10gPT09ICdudW1iZXInKSB7XG4gICAgICB0aGlzLm9wID0gb3B0X3BhcmFtc1snb3V0cHV0SW5kZXgnXTtcbiAgICB9XG4gIH1cblxuICBpZiAoIXRoaXMub3V0cHV0KSB7XG4gICAgdGhpcy5vdXRwdXQgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KSgweDgwMDApO1xuICB9XG59O1xuXG4vKipcbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5Db21wcmVzc2lvblR5cGUgPSB7XG4gIE5PTkU6IDAsXG4gIEZJWEVEOiAxLFxuICBEWU5BTUlDOiAyLFxuICBSRVNFUlZFRDogM1xufTtcblxuXG4vKipcbiAqIExaNzcg44Gu5pyA5bCP44Oe44OD44OB6ZW3XG4gKiBAY29uc3RcbiAqIEB0eXBlIHtudW1iZXJ9XG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5Mejc3TWluTGVuZ3RoID0gMztcblxuLyoqXG4gKiBMWjc3IOOBruacgOWkp+ODnuODg+ODgemVt1xuICogQGNvbnN0XG4gKiBAdHlwZSB7bnVtYmVyfVxuICovXG5abGliLlJhd0RlZmxhdGUuTHo3N01heExlbmd0aCA9IDI1ODtcblxuLyoqXG4gKiBMWjc3IOOBruOCpuOCo+ODs+ODieOCpuOCteOCpOOCulxuICogQGNvbnN0XG4gKiBAdHlwZSB7bnVtYmVyfVxuICovXG5abGliLlJhd0RlZmxhdGUuV2luZG93U2l6ZSA9IDB4ODAwMDtcblxuLyoqXG4gKiDmnIDplbfjga7nrKblj7fplbdcbiAqIEBjb25zdFxuICogQHR5cGUge251bWJlcn1cbiAqL1xuWmxpYi5SYXdEZWZsYXRlLk1heENvZGVMZW5ndGggPSAxNjtcblxuLyoqXG4gKiDjg4/jg5Xjg57jg7PnrKblj7fjga7mnIDlpKfmlbDlgKRcbiAqIEBjb25zdFxuICogQHR5cGUge251bWJlcn1cbiAqL1xuWmxpYi5SYXdEZWZsYXRlLkhVRk1BWCA9IDI4NjtcblxuLyoqXG4gKiDlm7rlrprjg4/jg5Xjg57jg7PnrKblj7fjga7nrKblj7fljJbjg4bjg7zjg5bjg6tcbiAqIEBjb25zdFxuICogQHR5cGUge0FycmF5LjxBcnJheS48bnVtYmVyLCBudW1iZXI+Pn1cbiAqL1xuWmxpYi5SYXdEZWZsYXRlLkZpeGVkSHVmZm1hblRhYmxlID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdGFibGUgPSBbXSwgaTtcblxuICBmb3IgKGkgPSAwOyBpIDwgMjg4OyBpKyspIHtcbiAgICBzd2l0Y2ggKHRydWUpIHtcbiAgICAgIGNhc2UgKGkgPD0gMTQzKTogdGFibGUucHVzaChbaSAgICAgICArIDB4MDMwLCA4XSk7IGJyZWFrO1xuICAgICAgY2FzZSAoaSA8PSAyNTUpOiB0YWJsZS5wdXNoKFtpIC0gMTQ0ICsgMHgxOTAsIDldKTsgYnJlYWs7XG4gICAgICBjYXNlIChpIDw9IDI3OSk6IHRhYmxlLnB1c2goW2kgLSAyNTYgKyAweDAwMCwgN10pOyBicmVhaztcbiAgICAgIGNhc2UgKGkgPD0gMjg3KTogdGFibGUucHVzaChbaSAtIDI4MCArIDB4MEMwLCA4XSk7IGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgJ2ludmFsaWQgbGl0ZXJhbDogJyArIGk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRhYmxlO1xufSkoKTtcblxuLyoqXG4gKiBERUZMQVRFIOODluODreODg+OCr+OBruS9nOaIkFxuICogQHJldHVybiB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0g5Zyn57iu5riI44G/IGJ5dGUgYXJyYXkuXG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUuY29tcHJlc3MgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xuICB2YXIgYmxvY2tBcnJheTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBwb3NpdGlvbjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBsZW5ndGg7XG5cbiAgdmFyIGlucHV0ID0gdGhpcy5pbnB1dDtcblxuICAvLyBjb21wcmVzc2lvblxuICBzd2l0Y2ggKHRoaXMuY29tcHJlc3Npb25UeXBlKSB7XG4gICAgY2FzZSBabGliLlJhd0RlZmxhdGUuQ29tcHJlc3Npb25UeXBlLk5PTkU6XG4gICAgICAvLyBlYWNoIDY1NTM1LUJ5dGUgKGxlbmd0aCBoZWFkZXI6IDE2LWJpdClcbiAgICAgIGZvciAocG9zaXRpb24gPSAwLCBsZW5ndGggPSBpbnB1dC5sZW5ndGg7IHBvc2l0aW9uIDwgbGVuZ3RoOykge1xuICAgICAgICBibG9ja0FycmF5ID0gVVNFX1RZUEVEQVJSQVkgP1xuICAgICAgICAgIGlucHV0LnN1YmFycmF5KHBvc2l0aW9uLCBwb3NpdGlvbiArIDB4ZmZmZikgOlxuICAgICAgICAgIGlucHV0LnNsaWNlKHBvc2l0aW9uLCBwb3NpdGlvbiArIDB4ZmZmZik7XG4gICAgICAgIHBvc2l0aW9uICs9IGJsb2NrQXJyYXkubGVuZ3RoO1xuICAgICAgICB0aGlzLm1ha2VOb2NvbXByZXNzQmxvY2soYmxvY2tBcnJheSwgKHBvc2l0aW9uID09PSBsZW5ndGgpKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgWmxpYi5SYXdEZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5GSVhFRDpcbiAgICAgIHRoaXMub3V0cHV0ID0gdGhpcy5tYWtlRml4ZWRIdWZmbWFuQmxvY2soaW5wdXQsIHRydWUpO1xuICAgICAgdGhpcy5vcCA9IHRoaXMub3V0cHV0Lmxlbmd0aDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgWmxpYi5SYXdEZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5EWU5BTUlDOlxuICAgICAgdGhpcy5vdXRwdXQgPSB0aGlzLm1ha2VEeW5hbWljSHVmZm1hbkJsb2NrKGlucHV0LCB0cnVlKTtcbiAgICAgIHRoaXMub3AgPSB0aGlzLm91dHB1dC5sZW5ndGg7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgJ2ludmFsaWQgY29tcHJlc3Npb24gdHlwZSc7XG4gIH1cblxuICByZXR1cm4gdGhpcy5vdXRwdXQ7XG59O1xuXG4vKipcbiAqIOmdnuWcp+e4ruODluODreODg+OCr+OBruS9nOaIkFxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBibG9ja0FycmF5IOODluODreODg+OCr+ODh+ODvOOCvyBieXRlIGFycmF5LlxuICogQHBhcmFtIHshYm9vbGVhbn0gaXNGaW5hbEJsb2NrIOacgOW+jOOBruODluODreODg+OCr+OBquOCieOBsHRydWUuXG4gKiBAcmV0dXJuIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSDpnZ7lnKfnuK7jg5bjg63jg4Pjgq8gYnl0ZSBhcnJheS5cbiAqL1xuWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5tYWtlTm9jb21wcmVzc0Jsb2NrID1cbmZ1bmN0aW9uKGJsb2NrQXJyYXksIGlzRmluYWxCbG9jaykge1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGJmaW5hbDtcbiAgLyoqIEB0eXBlIHtabGliLlJhd0RlZmxhdGUuQ29tcHJlc3Npb25UeXBlfSAqL1xuICB2YXIgYnR5cGU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgbGVuO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIG5sZW47XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpbDtcblxuICB2YXIgb3V0cHV0ID0gdGhpcy5vdXRwdXQ7XG4gIHZhciBvcCA9IHRoaXMub3A7XG5cbiAgLy8gZXhwYW5kIGJ1ZmZlclxuICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcbiAgICBvdXRwdXQgPSBuZXcgVWludDhBcnJheSh0aGlzLm91dHB1dC5idWZmZXIpO1xuICAgIHdoaWxlIChvdXRwdXQubGVuZ3RoIDw9IG9wICsgYmxvY2tBcnJheS5sZW5ndGggKyA1KSB7XG4gICAgICBvdXRwdXQgPSBuZXcgVWludDhBcnJheShvdXRwdXQubGVuZ3RoIDw8IDEpO1xuICAgIH1cbiAgICBvdXRwdXQuc2V0KHRoaXMub3V0cHV0KTtcbiAgfVxuXG4gIC8vIGhlYWRlclxuICBiZmluYWwgPSBpc0ZpbmFsQmxvY2sgPyAxIDogMDtcbiAgYnR5cGUgPSBabGliLlJhd0RlZmxhdGUuQ29tcHJlc3Npb25UeXBlLk5PTkU7XG4gIG91dHB1dFtvcCsrXSA9IChiZmluYWwpIHwgKGJ0eXBlIDw8IDEpO1xuXG4gIC8vIGxlbmd0aFxuICBsZW4gPSBibG9ja0FycmF5Lmxlbmd0aDtcbiAgbmxlbiA9ICh+bGVuICsgMHgxMDAwMCkgJiAweGZmZmY7XG4gIG91dHB1dFtvcCsrXSA9ICAgICAgICAgIGxlbiAmIDB4ZmY7XG4gIG91dHB1dFtvcCsrXSA9ICAobGVuID4+PiA4KSAmIDB4ZmY7XG4gIG91dHB1dFtvcCsrXSA9ICAgICAgICAgbmxlbiAmIDB4ZmY7XG4gIG91dHB1dFtvcCsrXSA9IChubGVuID4+PiA4KSAmIDB4ZmY7XG5cbiAgLy8gY29weSBidWZmZXJcbiAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XG4gICAgIG91dHB1dC5zZXQoYmxvY2tBcnJheSwgb3ApO1xuICAgICBvcCArPSBibG9ja0FycmF5Lmxlbmd0aDtcbiAgICAgb3V0cHV0ID0gb3V0cHV0LnN1YmFycmF5KDAsIG9wKTtcbiAgfSBlbHNlIHtcbiAgICBmb3IgKGkgPSAwLCBpbCA9IGJsb2NrQXJyYXkubGVuZ3RoOyBpIDwgaWw7ICsraSkge1xuICAgICAgb3V0cHV0W29wKytdID0gYmxvY2tBcnJheVtpXTtcbiAgICB9XG4gICAgb3V0cHV0Lmxlbmd0aCA9IG9wO1xuICB9XG5cbiAgdGhpcy5vcCA9IG9wO1xuICB0aGlzLm91dHB1dCA9IG91dHB1dDtcblxuICByZXR1cm4gb3V0cHV0O1xufTtcblxuLyoqXG4gKiDlm7rlrprjg4/jg5Xjg57jg7Pjg5bjg63jg4Pjgq/jga7kvZzmiJBcbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gYmxvY2tBcnJheSDjg5bjg63jg4Pjgq/jg4fjg7zjgr8gYnl0ZSBhcnJheS5cbiAqIEBwYXJhbSB7IWJvb2xlYW59IGlzRmluYWxCbG9jayDmnIDlvozjga7jg5bjg63jg4Pjgq/jgarjgonjgbB0cnVlLlxuICogQHJldHVybiB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0g5Zu65a6a44OP44OV44Oe44Oz56ym5Y+35YyW44OW44Ot44OD44KvIGJ5dGUgYXJyYXkuXG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUubWFrZUZpeGVkSHVmZm1hbkJsb2NrID1cbmZ1bmN0aW9uKGJsb2NrQXJyYXksIGlzRmluYWxCbG9jaykge1xuICAvKiogQHR5cGUge1psaWIuQml0U3RyZWFtfSAqL1xuICB2YXIgc3RyZWFtID0gbmV3IFpsaWIuQml0U3RyZWFtKFVTRV9UWVBFREFSUkFZID9cbiAgICBuZXcgVWludDhBcnJheSh0aGlzLm91dHB1dC5idWZmZXIpIDogdGhpcy5vdXRwdXQsIHRoaXMub3ApO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGJmaW5hbDtcbiAgLyoqIEB0eXBlIHtabGliLlJhd0RlZmxhdGUuQ29tcHJlc3Npb25UeXBlfSAqL1xuICB2YXIgYnR5cGU7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50MTZBcnJheSl9ICovXG4gIHZhciBkYXRhO1xuXG4gIC8vIGhlYWRlclxuICBiZmluYWwgPSBpc0ZpbmFsQmxvY2sgPyAxIDogMDtcbiAgYnR5cGUgPSBabGliLlJhd0RlZmxhdGUuQ29tcHJlc3Npb25UeXBlLkZJWEVEO1xuXG4gIHN0cmVhbS53cml0ZUJpdHMoYmZpbmFsLCAxLCB0cnVlKTtcbiAgc3RyZWFtLndyaXRlQml0cyhidHlwZSwgMiwgdHJ1ZSk7XG5cbiAgZGF0YSA9IHRoaXMubHo3NyhibG9ja0FycmF5KTtcbiAgdGhpcy5maXhlZEh1ZmZtYW4oZGF0YSwgc3RyZWFtKTtcblxuICByZXR1cm4gc3RyZWFtLmZpbmlzaCgpO1xufTtcblxuLyoqXG4gKiDli5XnmoTjg4/jg5Xjg57jg7Pjg5bjg63jg4Pjgq/jga7kvZzmiJBcbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gYmxvY2tBcnJheSDjg5bjg63jg4Pjgq/jg4fjg7zjgr8gYnl0ZSBhcnJheS5cbiAqIEBwYXJhbSB7IWJvb2xlYW59IGlzRmluYWxCbG9jayDmnIDlvozjga7jg5bjg63jg4Pjgq/jgarjgonjgbB0cnVlLlxuICogQHJldHVybiB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0g5YuV55qE44OP44OV44Oe44Oz56ym5Y+344OW44Ot44OD44KvIGJ5dGUgYXJyYXkuXG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUubWFrZUR5bmFtaWNIdWZmbWFuQmxvY2sgPVxuZnVuY3Rpb24oYmxvY2tBcnJheSwgaXNGaW5hbEJsb2NrKSB7XG4gIC8qKiBAdHlwZSB7WmxpYi5CaXRTdHJlYW19ICovXG4gIHZhciBzdHJlYW0gPSBuZXcgWmxpYi5CaXRTdHJlYW0oVVNFX1RZUEVEQVJSQVkgP1xuICAgIG5ldyBVaW50OEFycmF5KHRoaXMub3V0cHV0LmJ1ZmZlcikgOiB0aGlzLm91dHB1dCwgdGhpcy5vcCk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgYmZpbmFsO1xuICAvKiogQHR5cGUge1psaWIuUmF3RGVmbGF0ZS5Db21wcmVzc2lvblR5cGV9ICovXG4gIHZhciBidHlwZTtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQxNkFycmF5KX0gKi9cbiAgdmFyIGRhdGE7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaGxpdDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBoZGlzdDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBoY2xlbjtcbiAgLyoqIEBjb25zdCBAdHlwZSB7QXJyYXkuPG51bWJlcj59ICovXG4gIHZhciBoY2xlbk9yZGVyID1cbiAgICAgICAgWzE2LCAxNywgMTgsIDAsIDgsIDcsIDksIDYsIDEwLCA1LCAxMSwgNCwgMTIsIDMsIDEzLCAyLCAxNCwgMSwgMTVdO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXG4gIHZhciBsaXRMZW5MZW5ndGhzO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDE2QXJyYXkpfSAqL1xuICB2YXIgbGl0TGVuQ29kZXM7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cbiAgdmFyIGRpc3RMZW5ndGhzO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDE2QXJyYXkpfSAqL1xuICB2YXIgZGlzdENvZGVzO1xuICAvKiogQHR5cGUge3tcbiAgICogICBjb2RlczogIShBcnJheS48bnVtYmVyPnxVaW50MzJBcnJheSksXG4gICAqICAgZnJlcXM6ICEoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXkpXG4gICAqIH19ICovXG4gIHZhciB0cmVlU3ltYm9scztcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xuICB2YXIgdHJlZUxlbmd0aHM7XG4gIC8qKiBAdHlwZSB7QXJyYXl9ICovXG4gIHZhciB0cmFuc0xlbmd0aHMgPSBuZXcgQXJyYXkoMTkpO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDE2QXJyYXkpfSAqL1xuICB2YXIgdHJlZUNvZGVzO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGNvZGU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgYml0bGVuO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaWw7XG5cbiAgLy8gaGVhZGVyXG4gIGJmaW5hbCA9IGlzRmluYWxCbG9jayA/IDEgOiAwO1xuICBidHlwZSA9IFpsaWIuUmF3RGVmbGF0ZS5Db21wcmVzc2lvblR5cGUuRFlOQU1JQztcblxuICBzdHJlYW0ud3JpdGVCaXRzKGJmaW5hbCwgMSwgdHJ1ZSk7XG4gIHN0cmVhbS53cml0ZUJpdHMoYnR5cGUsIDIsIHRydWUpO1xuXG4gIGRhdGEgPSB0aGlzLmx6NzcoYmxvY2tBcnJheSk7XG5cbiAgLy8g44Oq44OG44Op44Or44O76ZW344GVLCDot53pm6Ljga7jg4/jg5Xjg57jg7PnrKblj7fjgajnrKblj7fplbfjga7nrpflh7pcbiAgbGl0TGVuTGVuZ3RocyA9IHRoaXMuZ2V0TGVuZ3Roc18odGhpcy5mcmVxc0xpdExlbiwgMTUpO1xuICBsaXRMZW5Db2RlcyA9IHRoaXMuZ2V0Q29kZXNGcm9tTGVuZ3Roc18obGl0TGVuTGVuZ3Rocyk7XG4gIGRpc3RMZW5ndGhzID0gdGhpcy5nZXRMZW5ndGhzXyh0aGlzLmZyZXFzRGlzdCwgNyk7XG4gIGRpc3RDb2RlcyA9IHRoaXMuZ2V0Q29kZXNGcm9tTGVuZ3Roc18oZGlzdExlbmd0aHMpO1xuXG4gIC8vIEhMSVQsIEhESVNUIOOBruaxuuWumlxuICBmb3IgKGhsaXQgPSAyODY7IGhsaXQgPiAyNTcgJiYgbGl0TGVuTGVuZ3Roc1tobGl0IC0gMV0gPT09IDA7IGhsaXQtLSkge31cbiAgZm9yIChoZGlzdCA9IDMwOyBoZGlzdCA+IDEgJiYgZGlzdExlbmd0aHNbaGRpc3QgLSAxXSA9PT0gMDsgaGRpc3QtLSkge31cblxuICAvLyBIQ0xFTlxuICB0cmVlU3ltYm9scyA9XG4gICAgdGhpcy5nZXRUcmVlU3ltYm9sc18oaGxpdCwgbGl0TGVuTGVuZ3RocywgaGRpc3QsIGRpc3RMZW5ndGhzKTtcbiAgdHJlZUxlbmd0aHMgPSB0aGlzLmdldExlbmd0aHNfKHRyZWVTeW1ib2xzLmZyZXFzLCA3KTtcbiAgZm9yIChpID0gMDsgaSA8IDE5OyBpKyspIHtcbiAgICB0cmFuc0xlbmd0aHNbaV0gPSB0cmVlTGVuZ3Roc1toY2xlbk9yZGVyW2ldXTtcbiAgfVxuICBmb3IgKGhjbGVuID0gMTk7IGhjbGVuID4gNCAmJiB0cmFuc0xlbmd0aHNbaGNsZW4gLSAxXSA9PT0gMDsgaGNsZW4tLSkge31cblxuICB0cmVlQ29kZXMgPSB0aGlzLmdldENvZGVzRnJvbUxlbmd0aHNfKHRyZWVMZW5ndGhzKTtcblxuICAvLyDlh7rliptcbiAgc3RyZWFtLndyaXRlQml0cyhobGl0IC0gMjU3LCA1LCB0cnVlKTtcbiAgc3RyZWFtLndyaXRlQml0cyhoZGlzdCAtIDEsIDUsIHRydWUpO1xuICBzdHJlYW0ud3JpdGVCaXRzKGhjbGVuIC0gNCwgNCwgdHJ1ZSk7XG4gIGZvciAoaSA9IDA7IGkgPCBoY2xlbjsgaSsrKSB7XG4gICAgc3RyZWFtLndyaXRlQml0cyh0cmFuc0xlbmd0aHNbaV0sIDMsIHRydWUpO1xuICB9XG5cbiAgLy8g44OE44Oq44O844Gu5Ye65YqbXG4gIGZvciAoaSA9IDAsIGlsID0gdHJlZVN5bWJvbHMuY29kZXMubGVuZ3RoOyBpIDwgaWw7IGkrKykge1xuICAgIGNvZGUgPSB0cmVlU3ltYm9scy5jb2Rlc1tpXTtcblxuICAgIHN0cmVhbS53cml0ZUJpdHModHJlZUNvZGVzW2NvZGVdLCB0cmVlTGVuZ3Roc1tjb2RlXSwgdHJ1ZSk7XG5cbiAgICAvLyBleHRyYSBiaXRzXG4gICAgaWYgKGNvZGUgPj0gMTYpIHtcbiAgICAgIGkrKztcbiAgICAgIHN3aXRjaCAoY29kZSkge1xuICAgICAgICBjYXNlIDE2OiBiaXRsZW4gPSAyOyBicmVhaztcbiAgICAgICAgY2FzZSAxNzogYml0bGVuID0gMzsgYnJlYWs7XG4gICAgICAgIGNhc2UgMTg6IGJpdGxlbiA9IDc7IGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93ICdpbnZhbGlkIGNvZGU6ICcgKyBjb2RlO1xuICAgICAgfVxuXG4gICAgICBzdHJlYW0ud3JpdGVCaXRzKHRyZWVTeW1ib2xzLmNvZGVzW2ldLCBiaXRsZW4sIHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIHRoaXMuZHluYW1pY0h1ZmZtYW4oXG4gICAgZGF0YSxcbiAgICBbbGl0TGVuQ29kZXMsIGxpdExlbkxlbmd0aHNdLFxuICAgIFtkaXN0Q29kZXMsIGRpc3RMZW5ndGhzXSxcbiAgICBzdHJlYW1cbiAgKTtcblxuICByZXR1cm4gc3RyZWFtLmZpbmlzaCgpO1xufTtcblxuXG4vKipcbiAqIOWLleeahOODj+ODleODnuODs+espuWPt+WMlijjgqvjgrnjgr/jg6Djg4/jg5Xjg57jg7Pjg4bjg7zjg5bjg6spXG4gKiBAcGFyYW0geyEoQXJyYXkuPG51bWJlcj58VWludDE2QXJyYXkpfSBkYXRhQXJyYXkgTFo3NyDnrKblj7fljJbmuIjjgb8gYnl0ZSBhcnJheS5cbiAqIEBwYXJhbSB7IVpsaWIuQml0U3RyZWFtfSBzdHJlYW0g5pu444GN6L6844G/55So44OT44OD44OI44K544OI44Oq44O844OgLlxuICogQHJldHVybiB7IVpsaWIuQml0U3RyZWFtfSDjg4/jg5Xjg57jg7PnrKblj7fljJbmuIjjgb/jg5Pjg4Pjg4jjgrnjg4jjg6rjg7zjg6Djgqrjg5bjgrjjgqfjgq/jg4guXG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUuZHluYW1pY0h1ZmZtYW4gPVxuZnVuY3Rpb24oZGF0YUFycmF5LCBsaXRMZW4sIGRpc3QsIHN0cmVhbSkge1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGluZGV4O1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGxlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBsaXRlcmFsO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGNvZGU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgbGl0TGVuQ29kZXM7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgbGl0TGVuTGVuZ3RocztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBkaXN0Q29kZXM7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgZGlzdExlbmd0aHM7XG5cbiAgbGl0TGVuQ29kZXMgPSBsaXRMZW5bMF07XG4gIGxpdExlbkxlbmd0aHMgPSBsaXRMZW5bMV07XG4gIGRpc3RDb2RlcyA9IGRpc3RbMF07XG4gIGRpc3RMZW5ndGhzID0gZGlzdFsxXTtcblxuICAvLyDnrKblj7fjgpIgQml0U3RyZWFtIOOBq+abuOOBjei+vOOCk+OBp+OBhOOBj1xuICBmb3IgKGluZGV4ID0gMCwgbGVuZ3RoID0gZGF0YUFycmF5Lmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7ICsraW5kZXgpIHtcbiAgICBsaXRlcmFsID0gZGF0YUFycmF5W2luZGV4XTtcblxuICAgIC8vIGxpdGVyYWwgb3IgbGVuZ3RoXG4gICAgc3RyZWFtLndyaXRlQml0cyhsaXRMZW5Db2Rlc1tsaXRlcmFsXSwgbGl0TGVuTGVuZ3Roc1tsaXRlcmFsXSwgdHJ1ZSk7XG5cbiAgICAvLyDplbfjgZXjg7vot53pm6LnrKblj7dcbiAgICBpZiAobGl0ZXJhbCA+IDI1Nikge1xuICAgICAgLy8gbGVuZ3RoIGV4dHJhXG4gICAgICBzdHJlYW0ud3JpdGVCaXRzKGRhdGFBcnJheVsrK2luZGV4XSwgZGF0YUFycmF5WysraW5kZXhdLCB0cnVlKTtcbiAgICAgIC8vIGRpc3RhbmNlXG4gICAgICBjb2RlID0gZGF0YUFycmF5WysraW5kZXhdO1xuICAgICAgc3RyZWFtLndyaXRlQml0cyhkaXN0Q29kZXNbY29kZV0sIGRpc3RMZW5ndGhzW2NvZGVdLCB0cnVlKTtcbiAgICAgIC8vIGRpc3RhbmNlIGV4dHJhXG4gICAgICBzdHJlYW0ud3JpdGVCaXRzKGRhdGFBcnJheVsrK2luZGV4XSwgZGF0YUFycmF5WysraW5kZXhdLCB0cnVlKTtcbiAgICAvLyDntYLnq69cbiAgICB9IGVsc2UgaWYgKGxpdGVyYWwgPT09IDI1Nikge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHN0cmVhbTtcbn07XG5cbi8qKlxuICog5Zu65a6a44OP44OV44Oe44Oz56ym5Y+35YyWXG4gKiBAcGFyYW0geyEoQXJyYXkuPG51bWJlcj58VWludDE2QXJyYXkpfSBkYXRhQXJyYXkgTFo3NyDnrKblj7fljJbmuIjjgb8gYnl0ZSBhcnJheS5cbiAqIEBwYXJhbSB7IVpsaWIuQml0U3RyZWFtfSBzdHJlYW0g5pu444GN6L6844G/55So44OT44OD44OI44K544OI44Oq44O844OgLlxuICogQHJldHVybiB7IVpsaWIuQml0U3RyZWFtfSDjg4/jg5Xjg57jg7PnrKblj7fljJbmuIjjgb/jg5Pjg4Pjg4jjgrnjg4jjg6rjg7zjg6Djgqrjg5bjgrjjgqfjgq/jg4guXG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUuZml4ZWRIdWZmbWFuID0gZnVuY3Rpb24oZGF0YUFycmF5LCBzdHJlYW0pIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpbmRleDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBsZW5ndGg7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgbGl0ZXJhbDtcblxuICAvLyDnrKblj7fjgpIgQml0U3RyZWFtIOOBq+abuOOBjei+vOOCk+OBp+OBhOOBj1xuICBmb3IgKGluZGV4ID0gMCwgbGVuZ3RoID0gZGF0YUFycmF5Lmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICBsaXRlcmFsID0gZGF0YUFycmF5W2luZGV4XTtcblxuICAgIC8vIOespuWPt+OBruabuOOBjei+vOOBv1xuICAgIFpsaWIuQml0U3RyZWFtLnByb3RvdHlwZS53cml0ZUJpdHMuYXBwbHkoXG4gICAgICBzdHJlYW0sXG4gICAgICBabGliLlJhd0RlZmxhdGUuRml4ZWRIdWZmbWFuVGFibGVbbGl0ZXJhbF1cbiAgICApO1xuXG4gICAgLy8g6ZW344GV44O76Led6Zui56ym5Y+3XG4gICAgaWYgKGxpdGVyYWwgPiAweDEwMCkge1xuICAgICAgLy8gbGVuZ3RoIGV4dHJhXG4gICAgICBzdHJlYW0ud3JpdGVCaXRzKGRhdGFBcnJheVsrK2luZGV4XSwgZGF0YUFycmF5WysraW5kZXhdLCB0cnVlKTtcbiAgICAgIC8vIGRpc3RhbmNlXG4gICAgICBzdHJlYW0ud3JpdGVCaXRzKGRhdGFBcnJheVsrK2luZGV4XSwgNSk7XG4gICAgICAvLyBkaXN0YW5jZSBleHRyYVxuICAgICAgc3RyZWFtLndyaXRlQml0cyhkYXRhQXJyYXlbKytpbmRleF0sIGRhdGFBcnJheVsrK2luZGV4XSwgdHJ1ZSk7XG4gICAgLy8g57WC56uvXG4gICAgfSBlbHNlIGlmIChsaXRlcmFsID09PSAweDEwMCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHN0cmVhbTtcbn07XG5cbi8qKlxuICog44Oe44OD44OB5oOF5aCxXG4gKiBAcGFyYW0geyFudW1iZXJ9IGxlbmd0aCDjg57jg4Pjg4HjgZfjgZ/plbfjgZUuXG4gKiBAcGFyYW0geyFudW1iZXJ9IGJhY2t3YXJkRGlzdGFuY2Ug44Oe44OD44OB5L2N572u44Go44Gu6Led6ZuiLlxuICogQGNvbnN0cnVjdG9yXG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5Mejc3TWF0Y2ggPSBmdW5jdGlvbihsZW5ndGgsIGJhY2t3YXJkRGlzdGFuY2UpIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IG1hdGNoIGxlbmd0aC4gKi9cbiAgdGhpcy5sZW5ndGggPSBsZW5ndGg7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBiYWNrd2FyZCBkaXN0YW5jZS4gKi9cbiAgdGhpcy5iYWNrd2FyZERpc3RhbmNlID0gYmFja3dhcmREaXN0YW5jZTtcbn07XG5cbi8qKlxuICog6ZW344GV56ym5Y+344OG44O844OW44OrLlxuICogW+OCs+ODvOODiSwg5ouh5by144OT44OD44OILCDmi6HlvLXjg5Pjg4Pjg4jplbddIOOBrumFjeWIl+OBqOOBquOBo+OBpuOBhOOCiy5cbiAqIEBjb25zdFxuICogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXkpfVxuICovXG5abGliLlJhd0RlZmxhdGUuTHo3N01hdGNoLkxlbmd0aENvZGVUYWJsZSA9IChmdW5jdGlvbih0YWJsZSkge1xuICByZXR1cm4gVVNFX1RZUEVEQVJSQVkgPyBuZXcgVWludDMyQXJyYXkodGFibGUpIDogdGFibGU7XG59KSgoZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7IUFycmF5fSAqL1xuICB2YXIgdGFibGUgPSBbXTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpO1xuICAvKiogQHR5cGUgeyFBcnJheS48bnVtYmVyPn0gKi9cbiAgdmFyIGM7XG5cbiAgZm9yIChpID0gMzsgaSA8PSAyNTg7IGkrKykge1xuICAgIGMgPSBjb2RlKGkpO1xuICAgIHRhYmxlW2ldID0gKGNbMl0gPDwgMjQpIHwgKGNbMV0gPDwgMTYpIHwgY1swXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoIGx6NzcgbGVuZ3RoLlxuICAgKiBAcmV0dXJuIHshQXJyYXkuPG51bWJlcj59IGx6NzcgY29kZXMuXG4gICAqL1xuICBmdW5jdGlvbiBjb2RlKGxlbmd0aCkge1xuICAgIHN3aXRjaCAodHJ1ZSkge1xuICAgICAgY2FzZSAobGVuZ3RoID09PSAzKTogcmV0dXJuIFsyNTcsIGxlbmd0aCAtIDMsIDBdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA9PT0gNCk6IHJldHVybiBbMjU4LCBsZW5ndGggLSA0LCAwXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPT09IDUpOiByZXR1cm4gWzI1OSwgbGVuZ3RoIC0gNSwgMF07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoID09PSA2KTogcmV0dXJuIFsyNjAsIGxlbmd0aCAtIDYsIDBdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA9PT0gNyk6IHJldHVybiBbMjYxLCBsZW5ndGggLSA3LCAwXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPT09IDgpOiByZXR1cm4gWzI2MiwgbGVuZ3RoIC0gOCwgMF07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoID09PSA5KTogcmV0dXJuIFsyNjMsIGxlbmd0aCAtIDksIDBdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA9PT0gMTApOiByZXR1cm4gWzI2NCwgbGVuZ3RoIC0gMTAsIDBdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSAxMik6IHJldHVybiBbMjY1LCBsZW5ndGggLSAxMSwgMV07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDE0KTogcmV0dXJuIFsyNjYsIGxlbmd0aCAtIDEzLCAxXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPD0gMTYpOiByZXR1cm4gWzI2NywgbGVuZ3RoIC0gMTUsIDFdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSAxOCk6IHJldHVybiBbMjY4LCBsZW5ndGggLSAxNywgMV07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDIyKTogcmV0dXJuIFsyNjksIGxlbmd0aCAtIDE5LCAyXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPD0gMjYpOiByZXR1cm4gWzI3MCwgbGVuZ3RoIC0gMjMsIDJdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSAzMCk6IHJldHVybiBbMjcxLCBsZW5ndGggLSAyNywgMl07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDM0KTogcmV0dXJuIFsyNzIsIGxlbmd0aCAtIDMxLCAyXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPD0gNDIpOiByZXR1cm4gWzI3MywgbGVuZ3RoIC0gMzUsIDNdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSA1MCk6IHJldHVybiBbMjc0LCBsZW5ndGggLSA0MywgM107IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDU4KTogcmV0dXJuIFsyNzUsIGxlbmd0aCAtIDUxLCAzXTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPD0gNjYpOiByZXR1cm4gWzI3NiwgbGVuZ3RoIC0gNTksIDNdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSA4Mik6IHJldHVybiBbMjc3LCBsZW5ndGggLSA2NywgNF07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDk4KTogcmV0dXJuIFsyNzgsIGxlbmd0aCAtIDgzLCA0XTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPD0gMTE0KTogcmV0dXJuIFsyNzksIGxlbmd0aCAtIDk5LCA0XTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPD0gMTMwKTogcmV0dXJuIFsyODAsIGxlbmd0aCAtIDExNSwgNF07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDE2Mik6IHJldHVybiBbMjgxLCBsZW5ndGggLSAxMzEsIDVdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA8PSAxOTQpOiByZXR1cm4gWzI4MiwgbGVuZ3RoIC0gMTYzLCA1XTsgYnJlYWs7XG4gICAgICBjYXNlIChsZW5ndGggPD0gMjI2KTogcmV0dXJuIFsyODMsIGxlbmd0aCAtIDE5NSwgNV07IGJyZWFrO1xuICAgICAgY2FzZSAobGVuZ3RoIDw9IDI1Nyk6IHJldHVybiBbMjg0LCBsZW5ndGggLSAyMjcsIDVdOyBicmVhaztcbiAgICAgIGNhc2UgKGxlbmd0aCA9PT0gMjU4KTogcmV0dXJuIFsyODUsIGxlbmd0aCAtIDI1OCwgMF07IGJyZWFrO1xuICAgICAgZGVmYXVsdDogdGhyb3cgJ2ludmFsaWQgbGVuZ3RoOiAnICsgbGVuZ3RoO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0YWJsZTtcbn0pKCkpO1xuXG4vKipcbiAqIOi3nembouespuWPt+ODhuODvOODluODq1xuICogQHBhcmFtIHshbnVtYmVyfSBkaXN0IOi3nemboi5cbiAqIEByZXR1cm4geyFBcnJheS48bnVtYmVyPn0g44Kz44O844OJ44CB5ouh5by144OT44OD44OI44CB5ouh5by144OT44OD44OI6ZW344Gu6YWN5YiXLlxuICogQHByaXZhdGVcbiAqL1xuWmxpYi5SYXdEZWZsYXRlLkx6NzdNYXRjaC5wcm90b3R5cGUuZ2V0RGlzdGFuY2VDb2RlXyA9IGZ1bmN0aW9uKGRpc3QpIHtcbiAgLyoqIEB0eXBlIHshQXJyYXkuPG51bWJlcj59IGRpc3RhbmNlIGNvZGUgdGFibGUuICovXG4gIHZhciByO1xuXG4gIHN3aXRjaCAodHJ1ZSkge1xuICAgIGNhc2UgKGRpc3QgPT09IDEpOiByID0gWzAsIGRpc3QgLSAxLCAwXTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA9PT0gMik6IHIgPSBbMSwgZGlzdCAtIDIsIDBdOyBicmVhaztcbiAgICBjYXNlIChkaXN0ID09PSAzKTogciA9IFsyLCBkaXN0IC0gMywgMF07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPT09IDQpOiByID0gWzMsIGRpc3QgLSA0LCAwXTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSA2KTogciA9IFs0LCBkaXN0IC0gNSwgMV07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gOCk6IHIgPSBbNSwgZGlzdCAtIDcsIDFdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDEyKTogciA9IFs2LCBkaXN0IC0gOSwgMl07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gMTYpOiByID0gWzcsIGRpc3QgLSAxMywgMl07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gMjQpOiByID0gWzgsIGRpc3QgLSAxNywgM107IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gMzIpOiByID0gWzksIGRpc3QgLSAyNSwgM107IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gNDgpOiByID0gWzEwLCBkaXN0IC0gMzMsIDRdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDY0KTogciA9IFsxMSwgZGlzdCAtIDQ5LCA0XTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSA5Nik6IHIgPSBbMTIsIGRpc3QgLSA2NSwgNV07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gMTI4KTogciA9IFsxMywgZGlzdCAtIDk3LCA1XTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSAxOTIpOiByID0gWzE0LCBkaXN0IC0gMTI5LCA2XTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSAyNTYpOiByID0gWzE1LCBkaXN0IC0gMTkzLCA2XTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSAzODQpOiByID0gWzE2LCBkaXN0IC0gMjU3LCA3XTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSA1MTIpOiByID0gWzE3LCBkaXN0IC0gMzg1LCA3XTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSA3NjgpOiByID0gWzE4LCBkaXN0IC0gNTEzLCA4XTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSAxMDI0KTogciA9IFsxOSwgZGlzdCAtIDc2OSwgOF07IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gMTUzNik6IHIgPSBbMjAsIGRpc3QgLSAxMDI1LCA5XTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSAyMDQ4KTogciA9IFsyMSwgZGlzdCAtIDE1MzcsIDldOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDMwNzIpOiByID0gWzIyLCBkaXN0IC0gMjA0OSwgMTBdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDQwOTYpOiByID0gWzIzLCBkaXN0IC0gMzA3MywgMTBdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDYxNDQpOiByID0gWzI0LCBkaXN0IC0gNDA5NywgMTFdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDgxOTIpOiByID0gWzI1LCBkaXN0IC0gNjE0NSwgMTFdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDEyMjg4KTogciA9IFsyNiwgZGlzdCAtIDgxOTMsIDEyXTsgYnJlYWs7XG4gICAgY2FzZSAoZGlzdCA8PSAxNjM4NCk6IHIgPSBbMjcsIGRpc3QgLSAxMjI4OSwgMTJdOyBicmVhaztcbiAgICBjYXNlIChkaXN0IDw9IDI0NTc2KTogciA9IFsyOCwgZGlzdCAtIDE2Mzg1LCAxM107IGJyZWFrO1xuICAgIGNhc2UgKGRpc3QgPD0gMzI3NjgpOiByID0gWzI5LCBkaXN0IC0gMjQ1NzcsIDEzXTsgYnJlYWs7XG4gICAgZGVmYXVsdDogdGhyb3cgJ2ludmFsaWQgZGlzdGFuY2UnO1xuICB9XG5cbiAgcmV0dXJuIHI7XG59O1xuXG4vKipcbiAqIOODnuODg+ODgeaDheWgseOCkiBMWjc3IOespuWPt+WMlumFjeWIl+OBp+i/lOOBmS5cbiAqIOOBquOBiuOAgeOBk+OBk+OBp+OBr+S7peS4i+OBruWGhemDqOS7leanmOOBp+espuWPt+WMluOBl+OBpuOBhOOCi1xuICogWyBDT0RFLCBFWFRSQS1CSVQtTEVOLCBFWFRSQSwgQ09ERSwgRVhUUkEtQklULUxFTiwgRVhUUkEgXVxuICogQHJldHVybiB7IUFycmF5LjxudW1iZXI+fSBMWjc3IOespuWPt+WMliBieXRlIGFycmF5LlxuICovXG5abGliLlJhd0RlZmxhdGUuTHo3N01hdGNoLnByb3RvdHlwZS50b0x6NzdBcnJheSA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGxlbmd0aCA9IHRoaXMubGVuZ3RoO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGRpc3QgPSB0aGlzLmJhY2t3YXJkRGlzdGFuY2U7XG4gIC8qKiBAdHlwZSB7QXJyYXl9ICovXG4gIHZhciBjb2RlQXJyYXkgPSBbXTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBwb3MgPSAwO1xuICAvKiogQHR5cGUgeyFBcnJheS48bnVtYmVyPn0gKi9cbiAgdmFyIGNvZGU7XG5cbiAgLy8gbGVuZ3RoXG4gIGNvZGUgPSBabGliLlJhd0RlZmxhdGUuTHo3N01hdGNoLkxlbmd0aENvZGVUYWJsZVtsZW5ndGhdO1xuICBjb2RlQXJyYXlbcG9zKytdID0gY29kZSAmIDB4ZmZmZjtcbiAgY29kZUFycmF5W3BvcysrXSA9IChjb2RlID4+IDE2KSAmIDB4ZmY7XG4gIGNvZGVBcnJheVtwb3MrK10gPSBjb2RlID4+IDI0O1xuXG4gIC8vIGRpc3RhbmNlXG4gIGNvZGUgPSB0aGlzLmdldERpc3RhbmNlQ29kZV8oZGlzdCk7XG4gIGNvZGVBcnJheVtwb3MrK10gPSBjb2RlWzBdO1xuICBjb2RlQXJyYXlbcG9zKytdID0gY29kZVsxXTtcbiAgY29kZUFycmF5W3BvcysrXSA9IGNvZGVbMl07XG5cbiAgcmV0dXJuIGNvZGVBcnJheTtcbn07XG5cbi8qKlxuICogTFo3NyDlrp/oo4VcbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gZGF0YUFycmF5IExaNzcg56ym5Y+35YyW44GZ44KL44OQ44Kk44OI6YWN5YiXLlxuICogQHJldHVybiB7IShBcnJheS48bnVtYmVyPnxVaW50MTZBcnJheSl9IExaNzcg56ym5Y+35YyW44GX44Gf6YWN5YiXLlxuICovXG5abGliLlJhd0RlZmxhdGUucHJvdG90eXBlLmx6NzcgPSBmdW5jdGlvbihkYXRhQXJyYXkpIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGlucHV0IHBvc2l0aW9uICovXG4gIHZhciBwb3NpdGlvbjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGlucHV0IGxlbmd0aCAqL1xuICB2YXIgbGVuZ3RoO1xuICAvKiogQHR5cGUge251bWJlcn0gbG9vcCBjb3VudGVyICovXG4gIHZhciBpO1xuICAvKiogQHR5cGUge251bWJlcn0gbG9vcCBsaW1pdGVyICovXG4gIHZhciBpbDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGNoYWluZWQtaGFzaC10YWJsZSBrZXkgKi9cbiAgdmFyIG1hdGNoS2V5O1xuICAvKiogQHR5cGUge09iamVjdC48bnVtYmVyLCBBcnJheS48bnVtYmVyPj59IGNoYWluZWQtaGFzaC10YWJsZSAqL1xuICB2YXIgdGFibGUgPSB7fTtcbiAgLyoqIEBjb25zdCBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgd2luZG93U2l6ZSA9IFpsaWIuUmF3RGVmbGF0ZS5XaW5kb3dTaXplO1xuICAvKiogQHR5cGUge0FycmF5LjxudW1iZXI+fSBtYXRjaCBsaXN0ICovXG4gIHZhciBtYXRjaExpc3Q7XG4gIC8qKiBAdHlwZSB7WmxpYi5SYXdEZWZsYXRlLkx6NzdNYXRjaH0gbG9uZ2VzdCBtYXRjaCAqL1xuICB2YXIgbG9uZ2VzdE1hdGNoO1xuICAvKiogQHR5cGUge1psaWIuUmF3RGVmbGF0ZS5Mejc3TWF0Y2h9IHByZXZpb3VzIGxvbmdlc3QgbWF0Y2ggKi9cbiAgdmFyIHByZXZNYXRjaDtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQxNkFycmF5KX0gbHo3NyBidWZmZXIgKi9cbiAgdmFyIGx6NzdidWYgPSBVU0VfVFlQRURBUlJBWSA/XG4gICAgbmV3IFVpbnQxNkFycmF5KGRhdGFBcnJheS5sZW5ndGggKiAyKSA6IFtdO1xuICAvKiogQHR5cGUge251bWJlcn0gbHo3NyBvdXRwdXQgYnVmZmVyIHBvaW50ZXIgKi9cbiAgdmFyIHBvcyA9IDA7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsejc3IHNraXAgbGVuZ3RoICovXG4gIHZhciBza2lwTGVuZ3RoID0gMDtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX0gKi9cbiAgdmFyIGZyZXFzTGl0TGVuID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQzMkFycmF5IDogQXJyYXkpKDI4Nik7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50MzJBcnJheSl9ICovXG4gIHZhciBmcmVxc0Rpc3QgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDMyQXJyYXkgOiBBcnJheSkoMzApO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGxhenkgPSB0aGlzLmxhenk7XG4gIC8qKiBAdHlwZSB7Kn0gdGVtcG9yYXJ5IHZhcmlhYmxlICovXG4gIHZhciB0bXA7XG5cbiAgLy8g5Yid5pyf5YyWXG4gIGlmICghVVNFX1RZUEVEQVJSQVkpIHtcbiAgICBmb3IgKGkgPSAwOyBpIDw9IDI4NTspIHsgZnJlcXNMaXRMZW5baSsrXSA9IDA7IH1cbiAgICBmb3IgKGkgPSAwOyBpIDw9IDI5OykgeyBmcmVxc0Rpc3RbaSsrXSA9IDA7IH1cbiAgfVxuICBmcmVxc0xpdExlblsyNTZdID0gMTsgLy8gRU9CIOOBruacgOS9juWHuuePvuWbnuaVsOOBryAxXG5cbiAgLyoqXG4gICAqIOODnuODg+ODgeODh+ODvOOCv+OBruabuOOBjei+vOOBv1xuICAgKiBAcGFyYW0ge1psaWIuUmF3RGVmbGF0ZS5Mejc3TWF0Y2h9IG1hdGNoIExaNzcgTWF0Y2ggZGF0YS5cbiAgICogQHBhcmFtIHshbnVtYmVyfSBvZmZzZXQg44K544Kt44OD44OX6ZaL5aeL5L2N572uKOebuOWvvuaMh+WumikuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBmdW5jdGlvbiB3cml0ZU1hdGNoKG1hdGNoLCBvZmZzZXQpIHtcbiAgICAvKiogQHR5cGUge0FycmF5LjxudW1iZXI+fSAqL1xuICAgIHZhciBsejc3QXJyYXkgPSBtYXRjaC50b0x6NzdBcnJheSgpO1xuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgIHZhciBpO1xuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgIHZhciBpbDtcblxuICAgIGZvciAoaSA9IDAsIGlsID0gbHo3N0FycmF5Lmxlbmd0aDsgaSA8IGlsOyArK2kpIHtcbiAgICAgIGx6NzdidWZbcG9zKytdID0gbHo3N0FycmF5W2ldO1xuICAgIH1cbiAgICBmcmVxc0xpdExlbltsejc3QXJyYXlbMF1dKys7XG4gICAgZnJlcXNEaXN0W2x6NzdBcnJheVszXV0rKztcbiAgICBza2lwTGVuZ3RoID0gbWF0Y2gubGVuZ3RoICsgb2Zmc2V0IC0gMTtcbiAgICBwcmV2TWF0Y2ggPSBudWxsO1xuICB9XG5cbiAgLy8gTFo3NyDnrKblj7fljJZcbiAgZm9yIChwb3NpdGlvbiA9IDAsIGxlbmd0aCA9IGRhdGFBcnJheS5sZW5ndGg7IHBvc2l0aW9uIDwgbGVuZ3RoOyArK3Bvc2l0aW9uKSB7XG4gICAgLy8g44OP44OD44K344Ol44Kt44O844Gu5L2c5oiQXG4gICAgZm9yIChtYXRjaEtleSA9IDAsIGkgPSAwLCBpbCA9IFpsaWIuUmF3RGVmbGF0ZS5Mejc3TWluTGVuZ3RoOyBpIDwgaWw7ICsraSkge1xuICAgICAgaWYgKHBvc2l0aW9uICsgaSA9PT0gbGVuZ3RoKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgbWF0Y2hLZXkgPSAobWF0Y2hLZXkgPDwgOCkgfCBkYXRhQXJyYXlbcG9zaXRpb24gKyBpXTtcbiAgICB9XG5cbiAgICAvLyDjg4bjg7zjg5bjg6vjgYzmnKrlrprnvqnjgaDjgaPjgZ/jgonkvZzmiJDjgZnjgotcbiAgICBpZiAodGFibGVbbWF0Y2hLZXldID09PSB2b2lkIDApIHsgdGFibGVbbWF0Y2hLZXldID0gW107IH1cbiAgICBtYXRjaExpc3QgPSB0YWJsZVttYXRjaEtleV07XG5cbiAgICAvLyBza2lwXG4gICAgaWYgKHNraXBMZW5ndGgtLSA+IDApIHtcbiAgICAgIG1hdGNoTGlzdC5wdXNoKHBvc2l0aW9uKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIOODnuODg+ODgeODhuODvOODluODq+OBruabtOaWsCAo5pyA5aSn5oi744KK6Led6Zui44KS6LaF44GI44Gm44GE44KL44KC44Gu44KS5YmK6Zmk44GZ44KLKVxuICAgIHdoaWxlIChtYXRjaExpc3QubGVuZ3RoID4gMCAmJiBwb3NpdGlvbiAtIG1hdGNoTGlzdFswXSA+IHdpbmRvd1NpemUpIHtcbiAgICAgIG1hdGNoTGlzdC5zaGlmdCgpO1xuICAgIH1cblxuICAgIC8vIOODh+ODvOOCv+acq+WwvuOBp+ODnuODg+ODgeOBl+OCiOOBhuOBjOOBquOBhOWgtOWQiOOBr+OBneOBruOBvuOBvua1geOBl+OBk+OCgFxuICAgIGlmIChwb3NpdGlvbiArIFpsaWIuUmF3RGVmbGF0ZS5Mejc3TWluTGVuZ3RoID49IGxlbmd0aCkge1xuICAgICAgaWYgKHByZXZNYXRjaCkge1xuICAgICAgICB3cml0ZU1hdGNoKHByZXZNYXRjaCwgLTEpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGkgPSAwLCBpbCA9IGxlbmd0aCAtIHBvc2l0aW9uOyBpIDwgaWw7ICsraSkge1xuICAgICAgICB0bXAgPSBkYXRhQXJyYXlbcG9zaXRpb24gKyBpXTtcbiAgICAgICAgbHo3N2J1Zltwb3MrK10gPSB0bXA7XG4gICAgICAgICsrZnJlcXNMaXRMZW5bdG1wXTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIOODnuODg+ODgeWAmeijnOOBi+OCieacgOmVt+OBruOCguOBruOCkuaOouOBmVxuICAgIGlmIChtYXRjaExpc3QubGVuZ3RoID4gMCkge1xuICAgICAgbG9uZ2VzdE1hdGNoID0gdGhpcy5zZWFyY2hMb25nZXN0TWF0Y2hfKGRhdGFBcnJheSwgcG9zaXRpb24sIG1hdGNoTGlzdCk7XG5cbiAgICAgIGlmIChwcmV2TWF0Y2gpIHtcbiAgICAgICAgLy8g54++5Zyo44Gu44Oe44OD44OB44Gu5pa544GM5YmN5Zue44Gu44Oe44OD44OB44KI44KK44KC6ZW344GEXG4gICAgICAgIGlmIChwcmV2TWF0Y2gubGVuZ3RoIDwgbG9uZ2VzdE1hdGNoLmxlbmd0aCkge1xuICAgICAgICAgIC8vIHdyaXRlIHByZXZpb3VzIGxpdGVyYWxcbiAgICAgICAgICB0bXAgPSBkYXRhQXJyYXlbcG9zaXRpb24gLSAxXTtcbiAgICAgICAgICBsejc3YnVmW3BvcysrXSA9IHRtcDtcbiAgICAgICAgICArK2ZyZXFzTGl0TGVuW3RtcF07XG5cbiAgICAgICAgICAvLyB3cml0ZSBjdXJyZW50IG1hdGNoXG4gICAgICAgICAgd3JpdGVNYXRjaChsb25nZXN0TWF0Y2gsIDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHdyaXRlIHByZXZpb3VzIG1hdGNoXG4gICAgICAgICAgd3JpdGVNYXRjaChwcmV2TWF0Y2gsIC0xKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChsb25nZXN0TWF0Y2gubGVuZ3RoIDwgbGF6eSkge1xuICAgICAgICBwcmV2TWF0Y2ggPSBsb25nZXN0TWF0Y2g7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3cml0ZU1hdGNoKGxvbmdlc3RNYXRjaCwgMCk7XG4gICAgICB9XG4gICAgLy8g5YmN5Zue44Oe44OD44OB44GX44Gm44GE44Gm5LuK5Zue44Oe44OD44OB44GM44Gq44GL44Gj44Gf44KJ5YmN5Zue44Gu44KS5o6h55SoXG4gICAgfSBlbHNlIGlmIChwcmV2TWF0Y2gpIHtcbiAgICAgIHdyaXRlTWF0Y2gocHJldk1hdGNoLCAtMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRtcCA9IGRhdGFBcnJheVtwb3NpdGlvbl07XG4gICAgICBsejc3YnVmW3BvcysrXSA9IHRtcDtcbiAgICAgICsrZnJlcXNMaXRMZW5bdG1wXTtcbiAgICB9XG5cbiAgICBtYXRjaExpc3QucHVzaChwb3NpdGlvbik7IC8vIOODnuODg+ODgeODhuODvOODluODq+OBq+ePvuWcqOOBruS9jee9ruOCkuS/neWtmFxuICB9XG5cbiAgLy8g57WC56uv5Yem55CGXG4gIGx6NzdidWZbcG9zKytdID0gMjU2O1xuICBmcmVxc0xpdExlblsyNTZdKys7XG4gIHRoaXMuZnJlcXNMaXRMZW4gPSBmcmVxc0xpdExlbjtcbiAgdGhpcy5mcmVxc0Rpc3QgPSBmcmVxc0Rpc3Q7XG5cbiAgcmV0dXJuIC8qKiBAdHlwZSB7IShVaW50MTZBcnJheXxBcnJheS48bnVtYmVyPil9ICovIChcbiAgICBVU0VfVFlQRURBUlJBWSA/ICBsejc3YnVmLnN1YmFycmF5KDAsIHBvcykgOiBsejc3YnVmXG4gICk7XG59O1xuXG4vKipcbiAqIOODnuODg+ODgeOBl+OBn+WAmeijnOOBruS4reOBi+OCieacgOmVt+S4gOiHtOOCkuaOouOBmVxuICogQHBhcmFtIHshT2JqZWN0fSBkYXRhIHBsYWluIGRhdGEgYnl0ZSBhcnJheS5cbiAqIEBwYXJhbSB7IW51bWJlcn0gcG9zaXRpb24gcGxhaW4gZGF0YSBieXRlIGFycmF5IHBvc2l0aW9uLlxuICogQHBhcmFtIHshQXJyYXkuPG51bWJlcj59IG1hdGNoTGlzdCDlgJnoo5zjgajjgarjgovkvY3nva7jga7phY3liJcuXG4gKiBAcmV0dXJuIHshWmxpYi5SYXdEZWZsYXRlLkx6NzdNYXRjaH0g5pyA6ZW344GL44Gk5pyA55+t6Led6Zui44Gu44Oe44OD44OB44Kq44OW44K444Kn44Kv44OILlxuICogQHByaXZhdGVcbiAqL1xuWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5zZWFyY2hMb25nZXN0TWF0Y2hfID1cbmZ1bmN0aW9uKGRhdGEsIHBvc2l0aW9uLCBtYXRjaExpc3QpIHtcbiAgdmFyIG1hdGNoLFxuICAgICAgY3VycmVudE1hdGNoLFxuICAgICAgbWF0Y2hNYXggPSAwLCBtYXRjaExlbmd0aCxcbiAgICAgIGksIGosIGwsIGRsID0gZGF0YS5sZW5ndGg7XG5cbiAgLy8g5YCZ6KOc44KS5b6M44KN44GL44KJIDEg44Gk44Ga44Gk57We44KK6L6844KT44Gn44KG44GPXG4gIHBlcm1hdGNoOlxuICBmb3IgKGkgPSAwLCBsID0gbWF0Y2hMaXN0Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIG1hdGNoID0gbWF0Y2hMaXN0W2wgLSBpIC0gMV07XG4gICAgbWF0Y2hMZW5ndGggPSBabGliLlJhd0RlZmxhdGUuTHo3N01pbkxlbmd0aDtcblxuICAgIC8vIOWJjeWbnuOBvuOBp+OBruacgOmVt+S4gOiHtOOCkuacq+WwvuOBi+OCieS4gOiHtOaknOe0ouOBmeOCi1xuICAgIGlmIChtYXRjaE1heCA+IFpsaWIuUmF3RGVmbGF0ZS5Mejc3TWluTGVuZ3RoKSB7XG4gICAgICBmb3IgKGogPSBtYXRjaE1heDsgaiA+IFpsaWIuUmF3RGVmbGF0ZS5Mejc3TWluTGVuZ3RoOyBqLS0pIHtcbiAgICAgICAgaWYgKGRhdGFbbWF0Y2ggKyBqIC0gMV0gIT09IGRhdGFbcG9zaXRpb24gKyBqIC0gMV0pIHtcbiAgICAgICAgICBjb250aW51ZSBwZXJtYXRjaDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbWF0Y2hMZW5ndGggPSBtYXRjaE1heDtcbiAgICB9XG5cbiAgICAvLyDmnIDplbfkuIDoh7TmjqLntKJcbiAgICB3aGlsZSAobWF0Y2hMZW5ndGggPCBabGliLlJhd0RlZmxhdGUuTHo3N01heExlbmd0aCAmJlxuICAgICAgICAgICBwb3NpdGlvbiArIG1hdGNoTGVuZ3RoIDwgZGwgJiZcbiAgICAgICAgICAgZGF0YVttYXRjaCArIG1hdGNoTGVuZ3RoXSA9PT0gZGF0YVtwb3NpdGlvbiArIG1hdGNoTGVuZ3RoXSkge1xuICAgICAgKyttYXRjaExlbmd0aDtcbiAgICB9XG5cbiAgICAvLyDjg57jg4Pjg4HplbfjgYzlkIzjgZjloLTlkIjjga/lvozmlrnjgpLlhKrlhYhcbiAgICBpZiAobWF0Y2hMZW5ndGggPiBtYXRjaE1heCkge1xuICAgICAgY3VycmVudE1hdGNoID0gbWF0Y2g7XG4gICAgICBtYXRjaE1heCA9IG1hdGNoTGVuZ3RoO1xuICAgIH1cblxuICAgIC8vIOacgOmVt+OBjOeiuuWumuOBl+OBn+OCieW+jOOBruWHpueQhuOBr+ecgeeVpVxuICAgIGlmIChtYXRjaExlbmd0aCA9PT0gWmxpYi5SYXdEZWZsYXRlLkx6NzdNYXhMZW5ndGgpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgWmxpYi5SYXdEZWZsYXRlLkx6NzdNYXRjaChtYXRjaE1heCwgcG9zaXRpb24gLSBjdXJyZW50TWF0Y2gpO1xufTtcblxuLyoqXG4gKiBUcmVlLVRyYW5zbWl0IFN5bWJvbHMg44Gu566X5Ye6XG4gKiByZWZlcmVuY2U6IFB1VFRZIERlZmxhdGUgaW1wbGVtZW50YXRpb25cbiAqIEBwYXJhbSB7bnVtYmVyfSBobGl0IEhMSVQuXG4gKiBAcGFyYW0geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGxpdGxlbkxlbmd0aHMg44Oq44OG44Op44Or44Go6ZW344GV56ym5Y+344Gu56ym5Y+36ZW36YWN5YiXLlxuICogQHBhcmFtIHtudW1iZXJ9IGhkaXN0IEhESVNULlxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBkaXN0TGVuZ3RocyDot53pm6LnrKblj7fjga7nrKblj7fplbfphY3liJcuXG4gKiBAcmV0dXJuIHt7XG4gKiAgIGNvZGVzOiAhKEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KSxcbiAqICAgZnJlcXM6ICEoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXkpXG4gKiB9fSBUcmVlLVRyYW5zbWl0IFN5bWJvbHMuXG4gKi9cblpsaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUuZ2V0VHJlZVN5bWJvbHNfID1cbmZ1bmN0aW9uKGhsaXQsIGxpdGxlbkxlbmd0aHMsIGhkaXN0LCBkaXN0TGVuZ3Rocykge1xuICB2YXIgc3JjID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQzMkFycmF5IDogQXJyYXkpKGhsaXQgKyBoZGlzdCksXG4gICAgICBpLCBqLCBydW5MZW5ndGgsIGwsXG4gICAgICByZXN1bHQgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDMyQXJyYXkgOiBBcnJheSkoMjg2ICsgMzApLFxuICAgICAgblJlc3VsdCxcbiAgICAgIHJwdCxcbiAgICAgIGZyZXFzID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoMTkpO1xuXG4gIGogPSAwO1xuICBmb3IgKGkgPSAwOyBpIDwgaGxpdDsgaSsrKSB7XG4gICAgc3JjW2orK10gPSBsaXRsZW5MZW5ndGhzW2ldO1xuICB9XG4gIGZvciAoaSA9IDA7IGkgPCBoZGlzdDsgaSsrKSB7XG4gICAgc3JjW2orK10gPSBkaXN0TGVuZ3Roc1tpXTtcbiAgfVxuXG4gIC8vIOWIneacn+WMllxuICBpZiAoIVVTRV9UWVBFREFSUkFZKSB7XG4gICAgZm9yIChpID0gMCwgbCA9IGZyZXFzLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgICAgZnJlcXNbaV0gPSAwO1xuICAgIH1cbiAgfVxuXG4gIC8vIOespuWPt+WMllxuICBuUmVzdWx0ID0gMDtcbiAgZm9yIChpID0gMCwgbCA9IHNyYy5sZW5ndGg7IGkgPCBsOyBpICs9IGopIHtcbiAgICAvLyBSdW4gTGVuZ3RoIEVuY29kaW5nXG4gICAgZm9yIChqID0gMTsgaSArIGogPCBsICYmIHNyY1tpICsgal0gPT09IHNyY1tpXTsgKytqKSB7fVxuXG4gICAgcnVuTGVuZ3RoID0gajtcblxuICAgIGlmIChzcmNbaV0gPT09IDApIHtcbiAgICAgIC8vIDAg44Gu57mw44KK6L+U44GX44GMIDMg5Zue5pyq5rqA44Gq44KJ44Gw44Gd44Gu44G+44G+XG4gICAgICBpZiAocnVuTGVuZ3RoIDwgMykge1xuICAgICAgICB3aGlsZSAocnVuTGVuZ3RoLS0gPiAwKSB7XG4gICAgICAgICAgcmVzdWx0W25SZXN1bHQrK10gPSAwO1xuICAgICAgICAgIGZyZXFzWzBdKys7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdoaWxlIChydW5MZW5ndGggPiAwKSB7XG4gICAgICAgICAgLy8g57mw44KK6L+U44GX44Gv5pyA5aSnIDEzOCDjgb7jgafjgarjga7jgafliIfjgoroqbDjgoHjgotcbiAgICAgICAgICBycHQgPSAocnVuTGVuZ3RoIDwgMTM4ID8gcnVuTGVuZ3RoIDogMTM4KTtcblxuICAgICAgICAgIGlmIChycHQgPiBydW5MZW5ndGggLSAzICYmIHJwdCA8IHJ1bkxlbmd0aCkge1xuICAgICAgICAgICAgcnB0ID0gcnVuTGVuZ3RoIC0gMztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyAzLTEwIOWbniAtPiAxN1xuICAgICAgICAgIGlmIChycHQgPD0gMTApIHtcbiAgICAgICAgICAgIHJlc3VsdFtuUmVzdWx0KytdID0gMTc7XG4gICAgICAgICAgICByZXN1bHRbblJlc3VsdCsrXSA9IHJwdCAtIDM7XG4gICAgICAgICAgICBmcmVxc1sxN10rKztcbiAgICAgICAgICAvLyAxMS0xMzgg5ZueIC0+IDE4XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdFtuUmVzdWx0KytdID0gMTg7XG4gICAgICAgICAgICByZXN1bHRbblJlc3VsdCsrXSA9IHJwdCAtIDExO1xuICAgICAgICAgICAgZnJlcXNbMThdKys7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcnVuTGVuZ3RoIC09IHJwdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRbblJlc3VsdCsrXSA9IHNyY1tpXTtcbiAgICAgIGZyZXFzW3NyY1tpXV0rKztcbiAgICAgIHJ1bkxlbmd0aC0tO1xuXG4gICAgICAvLyDnubDjgorov5TjgZflm57mlbDjgYwz5Zue5pyq5rqA44Gq44KJ44Gw44Op44Oz44Os44Oz44Kw44K556ym5Y+344Gv6KaB44KJ44Gq44GEXG4gICAgICBpZiAocnVuTGVuZ3RoIDwgMykge1xuICAgICAgICB3aGlsZSAocnVuTGVuZ3RoLS0gPiAwKSB7XG4gICAgICAgICAgcmVzdWx0W25SZXN1bHQrK10gPSBzcmNbaV07XG4gICAgICAgICAgZnJlcXNbc3JjW2ldXSsrO1xuICAgICAgICB9XG4gICAgICAvLyAzIOWbnuS7peS4iuOBquOCieOBsOODqeODs+ODrOODs+OCsOOCueespuWPt+WMllxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2hpbGUgKHJ1bkxlbmd0aCA+IDApIHtcbiAgICAgICAgICAvLyBydW5MZW5ndGjjgpIgMy02IOOBp+WIhuWJslxuICAgICAgICAgIHJwdCA9IChydW5MZW5ndGggPCA2ID8gcnVuTGVuZ3RoIDogNik7XG5cbiAgICAgICAgICBpZiAocnB0ID4gcnVuTGVuZ3RoIC0gMyAmJiBycHQgPCBydW5MZW5ndGgpIHtcbiAgICAgICAgICAgIHJwdCA9IHJ1bkxlbmd0aCAtIDM7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVzdWx0W25SZXN1bHQrK10gPSAxNjtcbiAgICAgICAgICByZXN1bHRbblJlc3VsdCsrXSA9IHJwdCAtIDM7XG4gICAgICAgICAgZnJlcXNbMTZdKys7XG5cbiAgICAgICAgICBydW5MZW5ndGggLT0gcnB0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjb2RlczpcbiAgICAgIFVTRV9UWVBFREFSUkFZID8gcmVzdWx0LnN1YmFycmF5KDAsIG5SZXN1bHQpIDogcmVzdWx0LnNsaWNlKDAsIG5SZXN1bHQpLFxuICAgIGZyZXFzOiBmcmVxc1xuICB9O1xufTtcblxuLyoqXG4gKiDjg4/jg5Xjg57jg7PnrKblj7fjga7plbfjgZXjgpLlj5blvpfjgZnjgotcbiAqIEBwYXJhbSB7IShBcnJheS48bnVtYmVyPnxVaW50MzJBcnJheSl9IGZyZXFzIOWHuuePvuOCq+OCpuODs+ODiC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBsaW1pdCDnrKblj7fplbfjga7liLbpmZAuXG4gKiBAcmV0dXJuIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSDnrKblj7fplbfphY3liJcuXG4gKiBAcHJpdmF0ZVxuICovXG5abGliLlJhd0RlZmxhdGUucHJvdG90eXBlLmdldExlbmd0aHNfID0gZnVuY3Rpb24oZnJlcXMsIGxpbWl0KSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgblN5bWJvbHMgPSBmcmVxcy5sZW5ndGg7XG4gIC8qKiBAdHlwZSB7WmxpYi5IZWFwfSAqL1xuICB2YXIgaGVhcCA9IG5ldyBabGliLkhlYXAoMiAqIFpsaWIuUmF3RGVmbGF0ZS5IVUZNQVgpO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXG4gIHZhciBsZW5ndGggPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KShuU3ltYm9scyk7XG4gIC8qKiBAdHlwZSB7QXJyYXl9ICovXG4gIHZhciBub2RlcztcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xuICB2YXIgdmFsdWVzO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXG4gIHZhciBjb2RlTGVuZ3RoO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaWw7XG5cbiAgLy8g6YWN5YiX44Gu5Yid5pyf5YyWXG4gIGlmICghVVNFX1RZUEVEQVJSQVkpIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgblN5bWJvbHM7IGkrKykge1xuICAgICAgbGVuZ3RoW2ldID0gMDtcbiAgICB9XG4gIH1cblxuICAvLyDjg5Ljg7zjg5fjga7mp4vnr4lcbiAgZm9yIChpID0gMDsgaSA8IG5TeW1ib2xzOyArK2kpIHtcbiAgICBpZiAoZnJlcXNbaV0gPiAwKSB7XG4gICAgICBoZWFwLnB1c2goaSwgZnJlcXNbaV0pO1xuICAgIH1cbiAgfVxuICBub2RlcyA9IG5ldyBBcnJheShoZWFwLmxlbmd0aCAvIDIpO1xuICB2YWx1ZXMgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDMyQXJyYXkgOiBBcnJheSkoaGVhcC5sZW5ndGggLyAyKTtcblxuICAvLyDpnZ4gMCDjga7opoHntKDjgYzkuIDjgaTjgaDjgZHjgaDjgaPjgZ/loLTlkIjjga/jgIHjgZ3jga7jgrfjg7Pjg5zjg6vjgavnrKblj7fplbcgMSDjgpLlibLjgorlvZPjgabjgabntYLkuoZcbiAgaWYgKG5vZGVzLmxlbmd0aCA9PT0gMSkge1xuICAgIGxlbmd0aFtoZWFwLnBvcCgpLmluZGV4XSA9IDE7XG4gICAgcmV0dXJuIGxlbmd0aDtcbiAgfVxuXG4gIC8vIFJldmVyc2UgUGFja2FnZSBNZXJnZSBBbGdvcml0aG0g44Gr44KI44KLIENhbm9uaWNhbCBIdWZmbWFuIENvZGUg44Gu56ym5Y+36ZW35rG65a6aXG4gIGZvciAoaSA9IDAsIGlsID0gaGVhcC5sZW5ndGggLyAyOyBpIDwgaWw7ICsraSkge1xuICAgIG5vZGVzW2ldID0gaGVhcC5wb3AoKTtcbiAgICB2YWx1ZXNbaV0gPSBub2Rlc1tpXS52YWx1ZTtcbiAgfVxuICBjb2RlTGVuZ3RoID0gdGhpcy5yZXZlcnNlUGFja2FnZU1lcmdlXyh2YWx1ZXMsIHZhbHVlcy5sZW5ndGgsIGxpbWl0KTtcblxuICBmb3IgKGkgPSAwLCBpbCA9IG5vZGVzLmxlbmd0aDsgaSA8IGlsOyArK2kpIHtcbiAgICBsZW5ndGhbbm9kZXNbaV0uaW5kZXhdID0gY29kZUxlbmd0aFtpXTtcbiAgfVxuXG4gIHJldHVybiBsZW5ndGg7XG59O1xuXG4vKipcbiAqIFJldmVyc2UgUGFja2FnZSBNZXJnZSBBbGdvcml0aG0uXG4gKiBAcGFyYW0geyEoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXkpfSBmcmVxcyBzb3J0ZWQgcHJvYmFiaWxpdHkuXG4gKiBAcGFyYW0ge251bWJlcn0gc3ltYm9scyBudW1iZXIgb2Ygc3ltYm9scy5cbiAqIEBwYXJhbSB7bnVtYmVyfSBsaW1pdCBjb2RlIGxlbmd0aCBsaW1pdC5cbiAqIEByZXR1cm4geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGNvZGUgbGVuZ3Rocy5cbiAqL1xuWmxpYi5SYXdEZWZsYXRlLnByb3RvdHlwZS5yZXZlcnNlUGFja2FnZU1lcmdlXyA9IGZ1bmN0aW9uKGZyZXFzLCBzeW1ib2xzLCBsaW1pdCkge1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDE2QXJyYXkpfSAqL1xuICB2YXIgbWluaW11bUNvc3QgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDE2QXJyYXkgOiBBcnJheSkobGltaXQpO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXG4gIHZhciBmbGFnID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkobGltaXQpO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXG4gIHZhciBjb2RlTGVuZ3RoID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoc3ltYm9scyk7XG4gIC8qKiBAdHlwZSB7QXJyYXl9ICovXG4gIHZhciB2YWx1ZSA9IG5ldyBBcnJheShsaW1pdCk7XG4gIC8qKiBAdHlwZSB7QXJyYXl9ICovXG4gIHZhciB0eXBlICA9IG5ldyBBcnJheShsaW1pdCk7XG4gIC8qKiBAdHlwZSB7QXJyYXkuPG51bWJlcj59ICovXG4gIHZhciBjdXJyZW50UG9zaXRpb24gPSBuZXcgQXJyYXkobGltaXQpO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGV4Y2VzcyA9ICgxIDw8IGxpbWl0KSAtIHN5bWJvbHM7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaGFsZiA9ICgxIDw8IChsaW1pdCAtIDEpKTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGo7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgdDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciB3ZWlnaHQ7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgbmV4dDtcblxuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IGpcbiAgICovXG4gIGZ1bmN0aW9uIHRha2VQYWNrYWdlKGopIHtcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICB2YXIgeCA9IHR5cGVbal1bY3VycmVudFBvc2l0aW9uW2pdXTtcblxuICAgIGlmICh4ID09PSBzeW1ib2xzKSB7XG4gICAgICB0YWtlUGFja2FnZShqKzEpO1xuICAgICAgdGFrZVBhY2thZ2UoaisxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLS1jb2RlTGVuZ3RoW3hdO1xuICAgIH1cblxuICAgICsrY3VycmVudFBvc2l0aW9uW2pdO1xuICB9XG5cbiAgbWluaW11bUNvc3RbbGltaXQtMV0gPSBzeW1ib2xzO1xuXG4gIGZvciAoaiA9IDA7IGogPCBsaW1pdDsgKytqKSB7XG4gICAgaWYgKGV4Y2VzcyA8IGhhbGYpIHtcbiAgICAgIGZsYWdbal0gPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBmbGFnW2pdID0gMTtcbiAgICAgIGV4Y2VzcyAtPSBoYWxmO1xuICAgIH1cbiAgICBleGNlc3MgPDw9IDE7XG4gICAgbWluaW11bUNvc3RbbGltaXQtMi1qXSA9IChtaW5pbXVtQ29zdFtsaW1pdC0xLWpdIC8gMiB8IDApICsgc3ltYm9scztcbiAgfVxuICBtaW5pbXVtQ29zdFswXSA9IGZsYWdbMF07XG5cbiAgdmFsdWVbMF0gPSBuZXcgQXJyYXkobWluaW11bUNvc3RbMF0pO1xuICB0eXBlWzBdICA9IG5ldyBBcnJheShtaW5pbXVtQ29zdFswXSk7XG4gIGZvciAoaiA9IDE7IGogPCBsaW1pdDsgKytqKSB7XG4gICAgaWYgKG1pbmltdW1Db3N0W2pdID4gMiAqIG1pbmltdW1Db3N0W2otMV0gKyBmbGFnW2pdKSB7XG4gICAgICBtaW5pbXVtQ29zdFtqXSA9IDIgKiBtaW5pbXVtQ29zdFtqLTFdICsgZmxhZ1tqXTtcbiAgICB9XG4gICAgdmFsdWVbal0gPSBuZXcgQXJyYXkobWluaW11bUNvc3Rbal0pO1xuICAgIHR5cGVbal0gID0gbmV3IEFycmF5KG1pbmltdW1Db3N0W2pdKTtcbiAgfVxuXG4gIGZvciAoaSA9IDA7IGkgPCBzeW1ib2xzOyArK2kpIHtcbiAgICBjb2RlTGVuZ3RoW2ldID0gbGltaXQ7XG4gIH1cblxuICBmb3IgKHQgPSAwOyB0IDwgbWluaW11bUNvc3RbbGltaXQtMV07ICsrdCkge1xuICAgIHZhbHVlW2xpbWl0LTFdW3RdID0gZnJlcXNbdF07XG4gICAgdHlwZVtsaW1pdC0xXVt0XSAgPSB0O1xuICB9XG5cbiAgZm9yIChpID0gMDsgaSA8IGxpbWl0OyArK2kpIHtcbiAgICBjdXJyZW50UG9zaXRpb25baV0gPSAwO1xuICB9XG4gIGlmIChmbGFnW2xpbWl0LTFdID09PSAxKSB7XG4gICAgLS1jb2RlTGVuZ3RoWzBdO1xuICAgICsrY3VycmVudFBvc2l0aW9uW2xpbWl0LTFdO1xuICB9XG5cbiAgZm9yIChqID0gbGltaXQtMjsgaiA+PSAwOyAtLWopIHtcbiAgICBpID0gMDtcbiAgICB3ZWlnaHQgPSAwO1xuICAgIG5leHQgPSBjdXJyZW50UG9zaXRpb25baisxXTtcblxuICAgIGZvciAodCA9IDA7IHQgPCBtaW5pbXVtQ29zdFtqXTsgdCsrKSB7XG4gICAgICB3ZWlnaHQgPSB2YWx1ZVtqKzFdW25leHRdICsgdmFsdWVbaisxXVtuZXh0KzFdO1xuXG4gICAgICBpZiAod2VpZ2h0ID4gZnJlcXNbaV0pIHtcbiAgICAgICAgdmFsdWVbal1bdF0gPSB3ZWlnaHQ7XG4gICAgICAgIHR5cGVbal1bdF0gPSBzeW1ib2xzO1xuICAgICAgICBuZXh0ICs9IDI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZVtqXVt0XSA9IGZyZXFzW2ldO1xuICAgICAgICB0eXBlW2pdW3RdID0gaTtcbiAgICAgICAgKytpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGN1cnJlbnRQb3NpdGlvbltqXSA9IDA7XG4gICAgaWYgKGZsYWdbal0gPT09IDEpIHtcbiAgICAgIHRha2VQYWNrYWdlKGopO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjb2RlTGVuZ3RoO1xufTtcblxuLyoqXG4gKiDnrKblj7fplbfphY3liJfjgYvjgonjg4/jg5Xjg57jg7PnrKblj7fjgpLlj5blvpfjgZnjgotcbiAqIHJlZmVyZW5jZTogUHVUVFkgRGVmbGF0ZSBpbXBsZW1lbnRhdGlvblxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBsZW5ndGhzIOespuWPt+mVt+mFjeWIly5cbiAqIEByZXR1cm4geyEoQXJyYXkuPG51bWJlcj58VWludDE2QXJyYXkpfSDjg4/jg5Xjg57jg7PnrKblj7fphY3liJcuXG4gKiBAcHJpdmF0ZVxuICovXG5abGliLlJhd0RlZmxhdGUucHJvdG90eXBlLmdldENvZGVzRnJvbUxlbmd0aHNfID0gZnVuY3Rpb24obGVuZ3Rocykge1xuICB2YXIgY29kZXMgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDE2QXJyYXkgOiBBcnJheSkobGVuZ3Rocy5sZW5ndGgpLFxuICAgICAgY291bnQgPSBbXSxcbiAgICAgIHN0YXJ0Q29kZSA9IFtdLFxuICAgICAgY29kZSA9IDAsIGksIGlsLCBqLCBtO1xuXG4gIC8vIENvdW50IHRoZSBjb2RlcyBvZiBlYWNoIGxlbmd0aC5cbiAgZm9yIChpID0gMCwgaWwgPSBsZW5ndGhzLmxlbmd0aDsgaSA8IGlsOyBpKyspIHtcbiAgICBjb3VudFtsZW5ndGhzW2ldXSA9IChjb3VudFtsZW5ndGhzW2ldXSB8IDApICsgMTtcbiAgfVxuXG4gIC8vIERldGVybWluZSB0aGUgc3RhcnRpbmcgY29kZSBmb3IgZWFjaCBsZW5ndGggYmxvY2suXG4gIGZvciAoaSA9IDEsIGlsID0gWmxpYi5SYXdEZWZsYXRlLk1heENvZGVMZW5ndGg7IGkgPD0gaWw7IGkrKykge1xuICAgIHN0YXJ0Q29kZVtpXSA9IGNvZGU7XG4gICAgY29kZSArPSBjb3VudFtpXSB8IDA7XG4gICAgY29kZSA8PD0gMTtcbiAgfVxuXG4gIC8vIERldGVybWluZSB0aGUgY29kZSBmb3IgZWFjaCBzeW1ib2wuIE1pcnJvcmVkLCBvZiBjb3Vyc2UuXG4gIGZvciAoaSA9IDAsIGlsID0gbGVuZ3Rocy5sZW5ndGg7IGkgPCBpbDsgaSsrKSB7XG4gICAgY29kZSA9IHN0YXJ0Q29kZVtsZW5ndGhzW2ldXTtcbiAgICBzdGFydENvZGVbbGVuZ3Roc1tpXV0gKz0gMTtcbiAgICBjb2Rlc1tpXSA9IDA7XG5cbiAgICBmb3IgKGogPSAwLCBtID0gbGVuZ3Roc1tpXTsgaiA8IG07IGorKykge1xuICAgICAgY29kZXNbaV0gPSAoY29kZXNbaV0gPDwgMSkgfCAoY29kZSAmIDEpO1xuICAgICAgY29kZSA+Pj49IDE7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNvZGVzO1xufTtcblxuLy8gZW5kIG9mIHNjb3BlXG59KTtcblxuLyogdmltOnNldCBleHBhbmR0YWIgdHM9MiBzdz0yIHR3PTgwOiAqL1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEdaSVAgKFJGQzE5NTIpIOWun+ijhS5cbiAqL1xuZ29vZy5wcm92aWRlKCdabGliLkd6aXAnKTtcblxuZ29vZy5yZXF1aXJlKCdVU0VfVFlQRURBUlJBWScpO1xuZ29vZy5yZXF1aXJlKCdabGliLkNSQzMyJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuUmF3RGVmbGF0ZScpO1xuXG5nb29nLnNjb3BlKGZ1bmN0aW9uKCkge1xuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBpbnB1dCBpbnB1dCBidWZmZXIuXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF9wYXJhbXMgb3B0aW9uIHBhcmFtZXRlcnMuXG4gKi9cblpsaWIuR3ppcCA9IGZ1bmN0aW9uKGlucHV0LCBvcHRfcGFyYW1zKSB7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gaW5wdXQgYnVmZmVyLiAqL1xuICB0aGlzLmlucHV0ID0gaW5wdXQ7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBpbnB1dCBidWZmZXIgcG9pbnRlci4gKi9cbiAgdGhpcy5pcCA9IDA7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gb3V0cHV0IGJ1ZmZlci4gKi9cbiAgdGhpcy5vdXRwdXQ7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBvdXRwdXQgYnVmZmVyLiAqL1xuICB0aGlzLm9wID0gMDtcbiAgLyoqIEB0eXBlIHshT2JqZWN0fSBmbGFncyBvcHRpb24gZmxhZ3MuICovXG4gIHRoaXMuZmxhZ3MgPSB7fTtcbiAgLyoqIEB0eXBlIHshc3RyaW5nfSBmaWxlbmFtZS4gKi9cbiAgdGhpcy5maWxlbmFtZTtcbiAgLyoqIEB0eXBlIHshc3RyaW5nfSBjb21tZW50LiAqL1xuICB0aGlzLmNvbW1lbnQ7XG4gIC8qKiBAdHlwZSB7IU9iamVjdH0gZGVmbGF0ZSBvcHRpb25zLiAqL1xuICB0aGlzLmRlZmxhdGVPcHRpb25zO1xuXG4gIC8vIG9wdGlvbiBwYXJhbWV0ZXJzXG4gIGlmIChvcHRfcGFyYW1zKSB7XG4gICAgaWYgKG9wdF9wYXJhbXNbJ2ZsYWdzJ10pIHtcbiAgICAgIHRoaXMuZmxhZ3MgPSBvcHRfcGFyYW1zWydmbGFncyddO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIG9wdF9wYXJhbXNbJ2ZpbGVuYW1lJ10gPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLmZpbGVuYW1lID0gb3B0X3BhcmFtc1snZmlsZW5hbWUnXTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvcHRfcGFyYW1zWydjb21tZW50J10gPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLmNvbW1lbnQgPSBvcHRfcGFyYW1zWydjb21tZW50J107XG4gICAgfVxuICAgIGlmIChvcHRfcGFyYW1zWydkZWZsYXRlT3B0aW9ucyddKSB7XG4gICAgICB0aGlzLmRlZmxhdGVPcHRpb25zID0gb3B0X3BhcmFtc1snZGVmbGF0ZU9wdGlvbnMnXTtcbiAgICB9XG4gIH1cblxuICBpZiAoIXRoaXMuZGVmbGF0ZU9wdGlvbnMpIHtcbiAgICB0aGlzLmRlZmxhdGVPcHRpb25zID0ge307XG4gIH1cbn07XG5cbi8qKlxuICogQHR5cGUge251bWJlcn1cbiAqIEBjb25zdFxuICovXG5abGliLkd6aXAuRGVmYXVsdEJ1ZmZlclNpemUgPSAweDgwMDA7XG5cbi8qKlxuICogZW5jb2RlIGd6aXAgbWVtYmVycy5cbiAqIEByZXR1cm4geyEoQXJyYXl8VWludDhBcnJheSl9IGd6aXAgYmluYXJ5IGFycmF5LlxuICovXG5abGliLkd6aXAucHJvdG90eXBlLmNvbXByZXNzID0gZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBmbGFncy4gKi9cbiAgdmFyIGZsZztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IG1vZGlmaWNhdGlvbiB0aW1lLiAqL1xuICB2YXIgbXRpbWU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBDUkMtMTYgdmFsdWUgZm9yIEZIQ1JDIGZsYWcuICovXG4gIHZhciBjcmMxNjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IENSQy0zMiB2YWx1ZSBmb3IgdmVyaWZpY2F0aW9uLiAqL1xuICB2YXIgY3JjMzI7XG4gIC8qKiBAdHlwZSB7IVpsaWIuUmF3RGVmbGF0ZX0gcmF3IGRlZmxhdGUgb2JqZWN0LiAqL1xuICB2YXIgcmF3ZGVmbGF0ZTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGNoYXJhY3RlciBjb2RlICovXG4gIHZhciBjO1xuICAvKiogQHR5cGUge251bWJlcn0gbG9vcCBjb3VudGVyLiAqL1xuICB2YXIgaTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGxvb3AgbGltaXRlci4gKi9cbiAgdmFyIGlsO1xuICAvKiogQHR5cGUgeyEoQXJyYXl8VWludDhBcnJheSl9IG91dHB1dCBidWZmZXIuICovXG4gIHZhciBvdXRwdXQgPVxuICAgIG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKFpsaWIuR3ppcC5EZWZhdWx0QnVmZmVyU2l6ZSk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBvdXRwdXQgYnVmZmVyIHBvaW50ZXIuICovXG4gIHZhciBvcCA9IDA7XG5cbiAgdmFyIGlucHV0ID0gdGhpcy5pbnB1dDtcbiAgdmFyIGlwID0gdGhpcy5pcDtcbiAgdmFyIGZpbGVuYW1lID0gdGhpcy5maWxlbmFtZTtcbiAgdmFyIGNvbW1lbnQgPSB0aGlzLmNvbW1lbnQ7XG5cbiAgLy8gY2hlY2sgc2lnbmF0dXJlXG4gIG91dHB1dFtvcCsrXSA9IDB4MWY7XG4gIG91dHB1dFtvcCsrXSA9IDB4OGI7XG5cbiAgLy8gY2hlY2sgY29tcHJlc3Npb24gbWV0aG9kXG4gIG91dHB1dFtvcCsrXSA9IDg7IC8qIFhYWDogdXNlIFpsaWIgY29uc3QgKi9cblxuICAvLyBmbGFnc1xuICBmbGcgPSAwO1xuICBpZiAodGhpcy5mbGFnc1snZm5hbWUnXSkgICAgZmxnIHw9IFpsaWIuR3ppcC5GbGFnc01hc2suRk5BTUU7XG4gIGlmICh0aGlzLmZsYWdzWydmY29tbWVudCddKSBmbGcgfD0gWmxpYi5HemlwLkZsYWdzTWFzay5GQ09NTUVOVDtcbiAgaWYgKHRoaXMuZmxhZ3NbJ2ZoY3JjJ10pICAgIGZsZyB8PSBabGliLkd6aXAuRmxhZ3NNYXNrLkZIQ1JDO1xuICAvLyBYWFg6IEZURVhUXG4gIC8vIFhYWDogRkVYVFJBXG4gIG91dHB1dFtvcCsrXSA9IGZsZztcblxuICAvLyBtb2RpZmljYXRpb24gdGltZVxuICBtdGltZSA9IChEYXRlLm5vdyA/IERhdGUubm93KCkgOiArbmV3IERhdGUoKSkgLyAxMDAwIHwgMDtcbiAgb3V0cHV0W29wKytdID0gbXRpbWUgICAgICAgICYgMHhmZjtcbiAgb3V0cHV0W29wKytdID0gbXRpbWUgPj4+ICA4ICYgMHhmZjtcbiAgb3V0cHV0W29wKytdID0gbXRpbWUgPj4+IDE2ICYgMHhmZjtcbiAgb3V0cHV0W29wKytdID0gbXRpbWUgPj4+IDI0ICYgMHhmZjtcblxuICAvLyBleHRyYSBmbGFnc1xuICBvdXRwdXRbb3ArK10gPSAwO1xuXG4gIC8vIG9wZXJhdGluZyBzeXN0ZW1cbiAgb3V0cHV0W29wKytdID0gWmxpYi5HemlwLk9wZXJhdGluZ1N5c3RlbS5VTktOT1dOO1xuXG4gIC8vIGV4dHJhXG4gIC8qIE5PUCAqL1xuXG4gIC8vIGZuYW1lXG4gIGlmICh0aGlzLmZsYWdzWydmbmFtZSddICE9PSB2b2lkIDApIHtcbiAgICBmb3IgKGkgPSAwLCBpbCA9IGZpbGVuYW1lLmxlbmd0aDsgaSA8IGlsOyArK2kpIHtcbiAgICAgIGMgPSBmaWxlbmFtZS5jaGFyQ29kZUF0KGkpO1xuICAgICAgaWYgKGMgPiAweGZmKSB7IG91dHB1dFtvcCsrXSA9IChjID4+PiA4KSAmIDB4ZmY7IH1cbiAgICAgIG91dHB1dFtvcCsrXSA9IGMgJiAweGZmO1xuICAgIH1cbiAgICBvdXRwdXRbb3ArK10gPSAwOyAvLyBudWxsIHRlcm1pbmF0aW9uXG4gIH1cblxuICAvLyBmY29tbWVudFxuICBpZiAodGhpcy5mbGFnc1snY29tbWVudCddKSB7XG4gICAgZm9yIChpID0gMCwgaWwgPSBjb21tZW50Lmxlbmd0aDsgaSA8IGlsOyArK2kpIHtcbiAgICAgIGMgPSBjb21tZW50LmNoYXJDb2RlQXQoaSk7XG4gICAgICBpZiAoYyA+IDB4ZmYpIHsgb3V0cHV0W29wKytdID0gKGMgPj4+IDgpICYgMHhmZjsgfVxuICAgICAgb3V0cHV0W29wKytdID0gYyAmIDB4ZmY7XG4gICAgfVxuICAgIG91dHB1dFtvcCsrXSA9IDA7IC8vIG51bGwgdGVybWluYXRpb25cbiAgfVxuXG4gIC8vIGZoY3JjXG4gIGlmICh0aGlzLmZsYWdzWydmaGNyYyddKSB7XG4gICAgY3JjMTYgPSBabGliLkNSQzMyLmNhbGMob3V0cHV0LCAwLCBvcCkgJiAweGZmZmY7XG4gICAgb3V0cHV0W29wKytdID0gKGNyYzE2ICAgICAgKSAmIDB4ZmY7XG4gICAgb3V0cHV0W29wKytdID0gKGNyYzE2ID4+PiA4KSAmIDB4ZmY7XG4gIH1cblxuICAvLyBhZGQgY29tcHJlc3Mgb3B0aW9uXG4gIHRoaXMuZGVmbGF0ZU9wdGlvbnNbJ291dHB1dEJ1ZmZlciddID0gb3V0cHV0O1xuICB0aGlzLmRlZmxhdGVPcHRpb25zWydvdXRwdXRJbmRleCddID0gb3A7XG5cbiAgLy8gY29tcHJlc3NcbiAgcmF3ZGVmbGF0ZSA9IG5ldyBabGliLlJhd0RlZmxhdGUoaW5wdXQsIHRoaXMuZGVmbGF0ZU9wdGlvbnMpO1xuICBvdXRwdXQgPSByYXdkZWZsYXRlLmNvbXByZXNzKCk7XG4gIG9wID0gcmF3ZGVmbGF0ZS5vcDtcblxuICAvLyBleHBhbmQgYnVmZmVyXG4gIGlmIChVU0VfVFlQRURBUlJBWSkge1xuICAgIGlmIChvcCArIDggPiBvdXRwdXQuYnVmZmVyLmJ5dGVMZW5ndGgpIHtcbiAgICAgIHRoaXMub3V0cHV0ID0gbmV3IFVpbnQ4QXJyYXkob3AgKyA4KTtcbiAgICAgIHRoaXMub3V0cHV0LnNldChuZXcgVWludDhBcnJheShvdXRwdXQuYnVmZmVyKSk7XG4gICAgICBvdXRwdXQgPSB0aGlzLm91dHB1dDtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0LmJ1ZmZlcik7XG4gICAgfVxuICB9XG5cbiAgLy8gY3JjMzJcbiAgY3JjMzIgPSBabGliLkNSQzMyLmNhbGMoaW5wdXQpO1xuICBvdXRwdXRbb3ArK10gPSAoY3JjMzIgICAgICAgKSAmIDB4ZmY7XG4gIG91dHB1dFtvcCsrXSA9IChjcmMzMiA+Pj4gIDgpICYgMHhmZjtcbiAgb3V0cHV0W29wKytdID0gKGNyYzMyID4+PiAxNikgJiAweGZmO1xuICBvdXRwdXRbb3ArK10gPSAoY3JjMzIgPj4+IDI0KSAmIDB4ZmY7XG5cbiAgLy8gaW5wdXQgc2l6ZVxuICBpbCA9IGlucHV0Lmxlbmd0aDtcbiAgb3V0cHV0W29wKytdID0gKGlsICAgICAgICkgJiAweGZmO1xuICBvdXRwdXRbb3ArK10gPSAoaWwgPj4+ICA4KSAmIDB4ZmY7XG4gIG91dHB1dFtvcCsrXSA9IChpbCA+Pj4gMTYpICYgMHhmZjtcbiAgb3V0cHV0W29wKytdID0gKGlsID4+PiAyNCkgJiAweGZmO1xuXG4gIHRoaXMuaXAgPSBpcDtcblxuICBpZiAoVVNFX1RZUEVEQVJSQVkgJiYgb3AgPCBvdXRwdXQubGVuZ3RoKSB7XG4gICAgdGhpcy5vdXRwdXQgPSBvdXRwdXQgPSBvdXRwdXQuc3ViYXJyYXkoMCwgb3ApO1xuICB9XG5cbiAgcmV0dXJuIG91dHB1dDtcbn07XG5cbi8qKiBAZW51bSB7bnVtYmVyfSAqL1xuWmxpYi5HemlwLk9wZXJhdGluZ1N5c3RlbSA9IHtcbiAgRkFUOiAwLFxuICBBTUlHQTogMSxcbiAgVk1TOiAyLFxuICBVTklYOiAzLFxuICBWTV9DTVM6IDQsXG4gIEFUQVJJX1RPUzogNSxcbiAgSFBGUzogNixcbiAgTUFDSU5UT1NIOiA3LFxuICBaX1NZU1RFTTogOCxcbiAgQ1BfTTogOSxcbiAgVE9QU18yMDogMTAsXG4gIE5URlM6IDExLFxuICBRRE9TOiAxMixcbiAgQUNPUk5fUklTQ09TOiAxMyxcbiAgVU5LTk9XTjogMjU1XG59O1xuXG4vKiogQGVudW0ge251bWJlcn0gKi9cblpsaWIuR3ppcC5GbGFnc01hc2sgPSB7XG4gIEZURVhUOiAweDAxLFxuICBGSENSQzogMHgwMixcbiAgRkVYVFJBOiAweDA0LFxuICBGTkFNRTogMHgwOCxcbiAgRkNPTU1FTlQ6IDB4MTBcbn07XG5cbn0pO1xuLyogdmltOnNldCBleHBhbmR0YWIgdHM9MiBzdz0yIHR3PTgwOiAqL1xuIiwiZ29vZy5wcm92aWRlKCdabGliLlJhd0luZmxhdGUnKTtcblxuZ29vZy5yZXF1aXJlKCdVU0VfVFlQRURBUlJBWScpO1xuZ29vZy5yZXF1aXJlKCdabGliLkh1ZmZtYW4nKTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKiogQGRlZmluZSB7bnVtYmVyfSBidWZmZXIgYmxvY2sgc2l6ZS4gKi9cbnZhciBaTElCX1JBV19JTkZMQVRFX0JVRkZFUl9TSVpFID0gMHg4MDAwOyAvLyBbIDB4ODAwMCA+PSBaTElCX0JVRkZFUl9CTE9DS19TSVpFIF1cblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5nb29nLnNjb3BlKGZ1bmN0aW9uKCkge1xuXG52YXIgYnVpbGRIdWZmbWFuVGFibGUgPSBabGliLkh1ZmZtYW4uYnVpbGRIdWZmbWFuVGFibGU7XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0geyEoVWludDhBcnJheXxBcnJheS48bnVtYmVyPil9IGlucHV0IGlucHV0IGJ1ZmZlci5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRfcGFyYW1zIG9wdGlvbiBwYXJhbWV0ZXIuXG4gKlxuICogb3B0X3BhcmFtcyDjga/ku6XkuIvjga7jg5fjg63jg5Hjg4bjgqPjgpLmjIflrprjgZnjgovkuovjgYzjgafjgY3jgb7jgZnjgIJcbiAqICAgLSBpbmRleDogaW5wdXQgYnVmZmVyIOOBriBkZWZsYXRlIOOCs+ODs+ODhuODiuOBrumWi+Wni+S9jee9ri5cbiAqICAgLSBibG9ja1NpemU6IOODkOODg+ODleOCoeOBruODluODreODg+OCr+OCteOCpOOCui5cbiAqICAgLSBidWZmZXJUeXBlOiBabGliLlJhd0luZmxhdGUuQnVmZmVyVHlwZSDjga7lgKTjgavjgojjgaPjgabjg5Djg4Pjg5XjgqHjga7nrqHnkIbmlrnms5XjgpLmjIflrprjgZnjgosuXG4gKiAgIC0gcmVzaXplOiDnorrkv53jgZfjgZ/jg5Djg4Pjg5XjgqHjgYzlrp/pmpvjga7lpKfjgY3jgZXjgojjgorlpKfjgY3jgYvjgaPjgZ/loLTlkIjjgavliIfjgoroqbDjgoHjgosuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZSA9IGZ1bmN0aW9uKGlucHV0LCBvcHRfcGFyYW1zKSB7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gaW5mbGF0ZWQgYnVmZmVyICovXG4gIHRoaXMuYnVmZmVyO1xuICAvKiogQHR5cGUgeyFBcnJheS48KEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpPn0gKi9cbiAgdGhpcy5ibG9ja3MgPSBbXTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGJsb2NrIHNpemUuICovXG4gIHRoaXMuYnVmZmVyU2l6ZSA9IFpMSUJfUkFXX0lORkxBVEVfQlVGRkVSX1NJWkU7XG4gIC8qKiBAdHlwZSB7IW51bWJlcn0gdG90YWwgb3V0cHV0IGJ1ZmZlciBwb2ludGVyLiAqL1xuICB0aGlzLnRvdGFscG9zID0gMDtcbiAgLyoqIEB0eXBlIHshbnVtYmVyfSBpbnB1dCBidWZmZXIgcG9pbnRlci4gKi9cbiAgdGhpcy5pcCA9IDA7XG4gIC8qKiBAdHlwZSB7IW51bWJlcn0gYml0IHN0cmVhbSByZWFkZXIgYnVmZmVyLiAqL1xuICB0aGlzLmJpdHNidWYgPSAwO1xuICAvKiogQHR5cGUgeyFudW1iZXJ9IGJpdCBzdHJlYW0gcmVhZGVyIGJ1ZmZlciBzaXplLiAqL1xuICB0aGlzLmJpdHNidWZsZW4gPSAwO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGlucHV0IGJ1ZmZlci4gKi9cbiAgdGhpcy5pbnB1dCA9IFVTRV9UWVBFREFSUkFZID8gbmV3IFVpbnQ4QXJyYXkoaW5wdXQpIDogaW5wdXQ7XG4gIC8qKiBAdHlwZSB7IShVaW50OEFycmF5fEFycmF5LjxudW1iZXI+KX0gb3V0cHV0IGJ1ZmZlci4gKi9cbiAgdGhpcy5vdXRwdXQ7XG4gIC8qKiBAdHlwZSB7IW51bWJlcn0gb3V0cHV0IGJ1ZmZlciBwb2ludGVyLiAqL1xuICB0aGlzLm9wO1xuICAvKiogQHR5cGUge2Jvb2xlYW59IGlzIGZpbmFsIGJsb2NrIGZsYWcuICovXG4gIHRoaXMuYmZpbmFsID0gZmFsc2U7XG4gIC8qKiBAdHlwZSB7WmxpYi5SYXdJbmZsYXRlLkJ1ZmZlclR5cGV9IGJ1ZmZlciBtYW5hZ2VtZW50LiAqL1xuICB0aGlzLmJ1ZmZlclR5cGUgPSBabGliLlJhd0luZmxhdGUuQnVmZmVyVHlwZS5BREFQVElWRTtcbiAgLyoqIEB0eXBlIHtib29sZWFufSByZXNpemUgZmxhZyBmb3IgbWVtb3J5IHNpemUgb3B0aW1pemF0aW9uLiAqL1xuICB0aGlzLnJlc2l6ZSA9IGZhbHNlO1xuICAvKiogQHR5cGUge251bWJlcn0gcHJldmlvdXMgUkxFIHZhbHVlICovXG4gIHRoaXMucHJldjtcblxuICAvLyBvcHRpb24gcGFyYW1ldGVyc1xuICBpZiAob3B0X3BhcmFtcyB8fCAhKG9wdF9wYXJhbXMgPSB7fSkpIHtcbiAgICBpZiAob3B0X3BhcmFtc1snaW5kZXgnXSkge1xuICAgICAgdGhpcy5pcCA9IG9wdF9wYXJhbXNbJ2luZGV4J107XG4gICAgfVxuICAgIGlmIChvcHRfcGFyYW1zWydidWZmZXJTaXplJ10pIHtcbiAgICAgIHRoaXMuYnVmZmVyU2l6ZSA9IG9wdF9wYXJhbXNbJ2J1ZmZlclNpemUnXTtcbiAgICB9XG4gICAgaWYgKG9wdF9wYXJhbXNbJ2J1ZmZlclR5cGUnXSkge1xuICAgICAgdGhpcy5idWZmZXJUeXBlID0gb3B0X3BhcmFtc1snYnVmZmVyVHlwZSddO1xuICAgIH1cbiAgICBpZiAob3B0X3BhcmFtc1sncmVzaXplJ10pIHtcbiAgICAgIHRoaXMucmVzaXplID0gb3B0X3BhcmFtc1sncmVzaXplJ107XG4gICAgfVxuICB9XG5cbiAgLy8gaW5pdGlhbGl6ZVxuICBzd2l0Y2ggKHRoaXMuYnVmZmVyVHlwZSkge1xuICAgIGNhc2UgWmxpYi5SYXdJbmZsYXRlLkJ1ZmZlclR5cGUuQkxPQ0s6XG4gICAgICB0aGlzLm9wID0gWmxpYi5SYXdJbmZsYXRlLk1heEJhY2t3YXJkTGVuZ3RoO1xuICAgICAgdGhpcy5vdXRwdXQgPVxuICAgICAgICBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KShcbiAgICAgICAgICBabGliLlJhd0luZmxhdGUuTWF4QmFja3dhcmRMZW5ndGggK1xuICAgICAgICAgIHRoaXMuYnVmZmVyU2l6ZSArXG4gICAgICAgICAgWmxpYi5SYXdJbmZsYXRlLk1heENvcHlMZW5ndGhcbiAgICAgICAgKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgWmxpYi5SYXdJbmZsYXRlLkJ1ZmZlclR5cGUuQURBUFRJVkU6XG4gICAgICB0aGlzLm9wID0gMDtcbiAgICAgIHRoaXMub3V0cHV0ID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkodGhpcy5idWZmZXJTaXplKTtcbiAgICAgIHRoaXMuZXhwYW5kQnVmZmVyID0gdGhpcy5leHBhbmRCdWZmZXJBZGFwdGl2ZTtcbiAgICAgIHRoaXMuY29uY2F0QnVmZmVyID0gdGhpcy5jb25jYXRCdWZmZXJEeW5hbWljO1xuICAgICAgdGhpcy5kZWNvZGVIdWZmbWFuID0gdGhpcy5kZWNvZGVIdWZmbWFuQWRhcHRpdmU7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGluZmxhdGUgbW9kZScpO1xuICB9XG59O1xuXG4vKipcbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5CdWZmZXJUeXBlID0ge1xuICBCTE9DSzogMCxcbiAgQURBUFRJVkU6IDFcbn07XG5cbi8qKlxuICogZGVjb21wcmVzcy5cbiAqIEByZXR1cm4geyEoVWludDhBcnJheXxBcnJheS48bnVtYmVyPil9IGluZmxhdGVkIGJ1ZmZlci5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5kZWNvbXByZXNzID0gZnVuY3Rpb24oKSB7XG4gIHdoaWxlICghdGhpcy5iZmluYWwpIHtcbiAgICB0aGlzLnBhcnNlQmxvY2soKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmNvbmNhdEJ1ZmZlcigpO1xufTtcblxuLyoqXG4gKiBAY29uc3RcbiAqIEB0eXBlIHtudW1iZXJ9IG1heCBiYWNrd2FyZCBsZW5ndGggZm9yIExaNzcuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5NYXhCYWNrd2FyZExlbmd0aCA9IDMyNzY4O1xuXG4vKipcbiAqIEBjb25zdFxuICogQHR5cGUge251bWJlcn0gbWF4IGNvcHkgbGVuZ3RoIGZvciBMWjc3LlxuICovXG5abGliLlJhd0luZmxhdGUuTWF4Q29weUxlbmd0aCA9IDI1ODtcblxuLyoqXG4gKiBodWZmbWFuIG9yZGVyXG4gKiBAY29uc3RcbiAqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfVxuICovXG5abGliLlJhd0luZmxhdGUuT3JkZXIgPSAoZnVuY3Rpb24odGFibGUpIHtcbiAgcmV0dXJuIFVTRV9UWVBFREFSUkFZID8gbmV3IFVpbnQxNkFycmF5KHRhYmxlKSA6IHRhYmxlO1xufSkoWzE2LCAxNywgMTgsIDAsIDgsIDcsIDksIDYsIDEwLCA1LCAxMSwgNCwgMTIsIDMsIDEzLCAyLCAxNCwgMSwgMTVdKTtcblxuLyoqXG4gKiBodWZmbWFuIGxlbmd0aCBjb2RlIHRhYmxlLlxuICogQGNvbnN0XG4gKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50MTZBcnJheSl9XG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5MZW5ndGhDb2RlVGFibGUgPSAoZnVuY3Rpb24odGFibGUpIHtcbiAgcmV0dXJuIFVTRV9UWVBFREFSUkFZID8gbmV3IFVpbnQxNkFycmF5KHRhYmxlKSA6IHRhYmxlO1xufSkoW1xuICAweDAwMDMsIDB4MDAwNCwgMHgwMDA1LCAweDAwMDYsIDB4MDAwNywgMHgwMDA4LCAweDAwMDksIDB4MDAwYSwgMHgwMDBiLFxuICAweDAwMGQsIDB4MDAwZiwgMHgwMDExLCAweDAwMTMsIDB4MDAxNywgMHgwMDFiLCAweDAwMWYsIDB4MDAyMywgMHgwMDJiLFxuICAweDAwMzMsIDB4MDAzYiwgMHgwMDQzLCAweDAwNTMsIDB4MDA2MywgMHgwMDczLCAweDAwODMsIDB4MDBhMywgMHgwMGMzLFxuICAweDAwZTMsIDB4MDEwMiwgMHgwMTAyLCAweDAxMDJcbl0pO1xuXG4vKipcbiAqIGh1ZmZtYW4gbGVuZ3RoIGV4dHJhLWJpdHMgdGFibGUuXG4gKiBAY29uc3RcbiAqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfVxuICovXG5abGliLlJhd0luZmxhdGUuTGVuZ3RoRXh0cmFUYWJsZSA9IChmdW5jdGlvbih0YWJsZSkge1xuICByZXR1cm4gVVNFX1RZUEVEQVJSQVkgPyBuZXcgVWludDhBcnJheSh0YWJsZSkgOiB0YWJsZTtcbn0pKFtcbiAgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMSwgMSwgMSwgMSwgMiwgMiwgMiwgMiwgMywgMywgMywgMywgNCwgNCwgNCwgNCwgNSwgNSxcbiAgNSwgNSwgMCwgMCwgMFxuXSk7XG5cbi8qKlxuICogaHVmZm1hbiBkaXN0IGNvZGUgdGFibGUuXG4gKiBAY29uc3RcbiAqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQxNkFycmF5KX1cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLkRpc3RDb2RlVGFibGUgPSAoZnVuY3Rpb24odGFibGUpIHtcbiAgcmV0dXJuIFVTRV9UWVBFREFSUkFZID8gbmV3IFVpbnQxNkFycmF5KHRhYmxlKSA6IHRhYmxlO1xufSkoW1xuICAweDAwMDEsIDB4MDAwMiwgMHgwMDAzLCAweDAwMDQsIDB4MDAwNSwgMHgwMDA3LCAweDAwMDksIDB4MDAwZCwgMHgwMDExLFxuICAweDAwMTksIDB4MDAyMSwgMHgwMDMxLCAweDAwNDEsIDB4MDA2MSwgMHgwMDgxLCAweDAwYzEsIDB4MDEwMSwgMHgwMTgxLFxuICAweDAyMDEsIDB4MDMwMSwgMHgwNDAxLCAweDA2MDEsIDB4MDgwMSwgMHgwYzAxLCAweDEwMDEsIDB4MTgwMSwgMHgyMDAxLFxuICAweDMwMDEsIDB4NDAwMSwgMHg2MDAxXG5dKTtcblxuLyoqXG4gKiBodWZmbWFuIGRpc3QgZXh0cmEtYml0cyB0YWJsZS5cbiAqIEBjb25zdFxuICogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9XG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5EaXN0RXh0cmFUYWJsZSA9IChmdW5jdGlvbih0YWJsZSkge1xuICByZXR1cm4gVVNFX1RZUEVEQVJSQVkgPyBuZXcgVWludDhBcnJheSh0YWJsZSkgOiB0YWJsZTtcbn0pKFtcbiAgMCwgMCwgMCwgMCwgMSwgMSwgMiwgMiwgMywgMywgNCwgNCwgNSwgNSwgNiwgNiwgNywgNywgOCwgOCwgOSwgOSwgMTAsIDEwLCAxMSxcbiAgMTEsIDEyLCAxMiwgMTMsIDEzXG5dKTtcblxuLyoqXG4gKiBmaXhlZCBodWZmbWFuIGxlbmd0aCBjb2RlIHRhYmxlXG4gKiBAY29uc3RcbiAqIEB0eXBlIHshQXJyYXl9XG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5GaXhlZExpdGVyYWxMZW5ndGhUYWJsZSA9IChmdW5jdGlvbih0YWJsZSkge1xuICByZXR1cm4gdGFibGU7XG59KSgoZnVuY3Rpb24oKSB7XG4gIHZhciBsZW5ndGhzID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoMjg4KTtcbiAgdmFyIGksIGlsO1xuXG4gIGZvciAoaSA9IDAsIGlsID0gbGVuZ3Rocy5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XG4gICAgbGVuZ3Roc1tpXSA9XG4gICAgICAoaSA8PSAxNDMpID8gOCA6XG4gICAgICAoaSA8PSAyNTUpID8gOSA6XG4gICAgICAoaSA8PSAyNzkpID8gNyA6XG4gICAgICA4O1xuICB9XG5cbiAgcmV0dXJuIGJ1aWxkSHVmZm1hblRhYmxlKGxlbmd0aHMpO1xufSkoKSk7XG5cbi8qKlxuICogZml4ZWQgaHVmZm1hbiBkaXN0YW5jZSBjb2RlIHRhYmxlXG4gKiBAY29uc3RcbiAqIEB0eXBlIHshQXJyYXl9XG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5GaXhlZERpc3RhbmNlVGFibGUgPSAoZnVuY3Rpb24odGFibGUpIHtcbiAgcmV0dXJuIHRhYmxlO1xufSkoKGZ1bmN0aW9uKCkge1xuICB2YXIgbGVuZ3RocyA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKDMwKTtcbiAgdmFyIGksIGlsO1xuXG4gIGZvciAoaSA9IDAsIGlsID0gbGVuZ3Rocy5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XG4gICAgbGVuZ3Roc1tpXSA9IDU7XG4gIH1cblxuICByZXR1cm4gYnVpbGRIdWZmbWFuVGFibGUobGVuZ3Rocyk7XG59KSgpKTtcblxuLyoqXG4gKiBwYXJzZSBkZWZsYXRlZCBibG9jay5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5wYXJzZUJsb2NrID0gZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBoZWFkZXIgKi9cbiAgdmFyIGhkciA9IHRoaXMucmVhZEJpdHMoMyk7XG5cbiAgLy8gQkZJTkFMXG4gIGlmIChoZHIgJiAweDEpIHtcbiAgICB0aGlzLmJmaW5hbCA9IHRydWU7XG4gIH1cblxuICAvLyBCVFlQRVxuICBoZHIgPj4+PSAxO1xuICBzd2l0Y2ggKGhkcikge1xuICAgIC8vIHVuY29tcHJlc3NlZFxuICAgIGNhc2UgMDpcbiAgICAgIHRoaXMucGFyc2VVbmNvbXByZXNzZWRCbG9jaygpO1xuICAgICAgYnJlYWs7XG4gICAgLy8gZml4ZWQgaHVmZm1hblxuICAgIGNhc2UgMTpcbiAgICAgIHRoaXMucGFyc2VGaXhlZEh1ZmZtYW5CbG9jaygpO1xuICAgICAgYnJlYWs7XG4gICAgLy8gZHluYW1pYyBodWZmbWFuXG4gICAgY2FzZSAyOlxuICAgICAgdGhpcy5wYXJzZUR5bmFtaWNIdWZmbWFuQmxvY2soKTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIHJlc2VydmVkIG9yIG90aGVyXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcigndW5rbm93biBCVFlQRTogJyArIGhkcik7XG4gIH1cbn07XG5cbi8qKlxuICogcmVhZCBpbmZsYXRlIGJpdHNcbiAqIEBwYXJhbSB7bnVtYmVyfSBsZW5ndGggYml0cyBsZW5ndGguXG4gKiBAcmV0dXJuIHtudW1iZXJ9IHJlYWQgYml0cy5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5yZWFkQml0cyA9IGZ1bmN0aW9uKGxlbmd0aCkge1xuICB2YXIgYml0c2J1ZiA9IHRoaXMuYml0c2J1ZjtcbiAgdmFyIGJpdHNidWZsZW4gPSB0aGlzLmJpdHNidWZsZW47XG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG4gIHZhciBpcCA9IHRoaXMuaXA7XG5cbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGlucHV0IGFuZCBvdXRwdXQgYnl0ZS4gKi9cbiAgdmFyIG9jdGV0O1xuXG4gIC8vIG5vdCBlbm91Z2ggYnVmZmVyXG4gIHdoaWxlIChiaXRzYnVmbGVuIDwgbGVuZ3RoKSB7XG4gICAgLy8gaW5wdXQgYnl0ZVxuICAgIGlmIChpcCA+PSBpbnB1dExlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnB1dCBidWZmZXIgaXMgYnJva2VuJyk7XG4gICAgfVxuXG4gICAgLy8gY29uY2F0IG9jdGV0XG4gICAgYml0c2J1ZiB8PSBpbnB1dFtpcCsrXSA8PCBiaXRzYnVmbGVuO1xuICAgIGJpdHNidWZsZW4gKz0gODtcbiAgfVxuXG4gIC8vIG91dHB1dCBieXRlXG4gIG9jdGV0ID0gYml0c2J1ZiAmIC8qIE1BU0sgKi8gKCgxIDw8IGxlbmd0aCkgLSAxKTtcbiAgYml0c2J1ZiA+Pj49IGxlbmd0aDtcbiAgYml0c2J1ZmxlbiAtPSBsZW5ndGg7XG5cbiAgdGhpcy5iaXRzYnVmID0gYml0c2J1ZjtcbiAgdGhpcy5iaXRzYnVmbGVuID0gYml0c2J1ZmxlbjtcbiAgdGhpcy5pcCA9IGlwO1xuXG4gIHJldHVybiBvY3RldDtcbn07XG5cbi8qKlxuICogcmVhZCBodWZmbWFuIGNvZGUgdXNpbmcgdGFibGVcbiAqIEBwYXJhbSB7QXJyYXl9IHRhYmxlIGh1ZmZtYW4gY29kZSB0YWJsZS5cbiAqIEByZXR1cm4ge251bWJlcn0gaHVmZm1hbiBjb2RlLlxuICovXG5abGliLlJhd0luZmxhdGUucHJvdG90eXBlLnJlYWRDb2RlQnlUYWJsZSA9IGZ1bmN0aW9uKHRhYmxlKSB7XG4gIHZhciBiaXRzYnVmID0gdGhpcy5iaXRzYnVmO1xuICB2YXIgYml0c2J1ZmxlbiA9IHRoaXMuYml0c2J1ZmxlbjtcbiAgdmFyIGlucHV0ID0gdGhpcy5pbnB1dDtcbiAgdmFyIGlwID0gdGhpcy5pcDtcblxuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGlucHV0TGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGh1ZmZtYW4gY29kZSB0YWJsZSAqL1xuICB2YXIgY29kZVRhYmxlID0gdGFibGVbMF07XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgbWF4Q29kZUxlbmd0aCA9IHRhYmxlWzFdO1xuICAvKiogQHR5cGUge251bWJlcn0gY29kZSBsZW5ndGggJiBjb2RlICgxNmJpdCwgMTZiaXQpICovXG4gIHZhciBjb2RlV2l0aExlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGNvZGUgYml0cyBsZW5ndGggKi9cbiAgdmFyIGNvZGVMZW5ndGg7XG5cbiAgLy8gbm90IGVub3VnaCBidWZmZXJcbiAgd2hpbGUgKGJpdHNidWZsZW4gPCBtYXhDb2RlTGVuZ3RoKSB7XG4gICAgaWYgKGlwID49IGlucHV0TGVuZ3RoKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgYml0c2J1ZiB8PSBpbnB1dFtpcCsrXSA8PCBiaXRzYnVmbGVuO1xuICAgIGJpdHNidWZsZW4gKz0gODtcbiAgfVxuXG4gIC8vIHJlYWQgbWF4IGxlbmd0aFxuICBjb2RlV2l0aExlbmd0aCA9IGNvZGVUYWJsZVtiaXRzYnVmICYgKCgxIDw8IG1heENvZGVMZW5ndGgpIC0gMSldO1xuICBjb2RlTGVuZ3RoID0gY29kZVdpdGhMZW5ndGggPj4+IDE2O1xuXG4gIHRoaXMuYml0c2J1ZiA9IGJpdHNidWYgPj4gY29kZUxlbmd0aDtcbiAgdGhpcy5iaXRzYnVmbGVuID0gYml0c2J1ZmxlbiAtIGNvZGVMZW5ndGg7XG4gIHRoaXMuaXAgPSBpcDtcblxuICByZXR1cm4gY29kZVdpdGhMZW5ndGggJiAweGZmZmY7XG59O1xuXG4vKipcbiAqIHBhcnNlIHVuY29tcHJlc3NlZCBibG9jay5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5wYXJzZVVuY29tcHJlc3NlZEJsb2NrID0gZnVuY3Rpb24oKSB7XG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG4gIHZhciBpcCA9IHRoaXMuaXA7XG4gIHZhciBvdXRwdXQgPSB0aGlzLm91dHB1dDtcbiAgdmFyIG9wID0gdGhpcy5vcDtcblxuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGlucHV0TGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuICAvKiogQHR5cGUge251bWJlcn0gYmxvY2sgbGVuZ3RoICovXG4gIHZhciBsZW47XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBudW1iZXIgZm9yIGNoZWNrIGJsb2NrIGxlbmd0aCAqL1xuICB2YXIgbmxlbjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IG91dHB1dCBidWZmZXIgbGVuZ3RoICovXG4gIHZhciBvbGVuZ3RoID0gb3V0cHV0Lmxlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGNvcHkgY291bnRlciAqL1xuICB2YXIgcHJlQ29weTtcblxuICAvLyBza2lwIGJ1ZmZlcmVkIGhlYWRlciBiaXRzXG4gIHRoaXMuYml0c2J1ZiA9IDA7XG4gIHRoaXMuYml0c2J1ZmxlbiA9IDA7XG5cbiAgLy8gbGVuXG4gIGlmIChpcCArIDEgPj0gaW5wdXRMZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgdW5jb21wcmVzc2VkIGJsb2NrIGhlYWRlcjogTEVOJyk7XG4gIH1cbiAgbGVuID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XG5cbiAgLy8gbmxlblxuICBpZiAoaXAgKyAxID49IGlucHV0TGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHVuY29tcHJlc3NlZCBibG9jayBoZWFkZXI6IE5MRU4nKTtcbiAgfVxuICBubGVuID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XG5cbiAgLy8gY2hlY2sgbGVuICYgbmxlblxuICBpZiAobGVuID09PSB+bmxlbikge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCB1bmNvbXByZXNzZWQgYmxvY2sgaGVhZGVyOiBsZW5ndGggdmVyaWZ5Jyk7XG4gIH1cblxuICAvLyBjaGVjayBzaXplXG4gIGlmIChpcCArIGxlbiA+IGlucHV0Lmxlbmd0aCkgeyB0aHJvdyBuZXcgRXJyb3IoJ2lucHV0IGJ1ZmZlciBpcyBicm9rZW4nKTsgfVxuXG4gIC8vIGV4cGFuZCBidWZmZXJcbiAgc3dpdGNoICh0aGlzLmJ1ZmZlclR5cGUpIHtcbiAgICBjYXNlIFpsaWIuUmF3SW5mbGF0ZS5CdWZmZXJUeXBlLkJMT0NLOlxuICAgICAgLy8gcHJlIGNvcHlcbiAgICAgIHdoaWxlIChvcCArIGxlbiA+IG91dHB1dC5sZW5ndGgpIHtcbiAgICAgICAgcHJlQ29weSA9IG9sZW5ndGggLSBvcDtcbiAgICAgICAgbGVuIC09IHByZUNvcHk7XG4gICAgICAgIGlmIChVU0VfVFlQRURBUlJBWSkge1xuICAgICAgICAgIG91dHB1dC5zZXQoaW5wdXQuc3ViYXJyYXkoaXAsIGlwICsgcHJlQ29weSksIG9wKTtcbiAgICAgICAgICBvcCArPSBwcmVDb3B5O1xuICAgICAgICAgIGlwICs9IHByZUNvcHk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd2hpbGUgKHByZUNvcHktLSkge1xuICAgICAgICAgICAgb3V0cHV0W29wKytdID0gaW5wdXRbaXArK107XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMub3AgPSBvcDtcbiAgICAgICAgb3V0cHV0ID0gdGhpcy5leHBhbmRCdWZmZXIoKTtcbiAgICAgICAgb3AgPSB0aGlzLm9wO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBabGliLlJhd0luZmxhdGUuQnVmZmVyVHlwZS5BREFQVElWRTpcbiAgICAgIHdoaWxlIChvcCArIGxlbiA+IG91dHB1dC5sZW5ndGgpIHtcbiAgICAgICAgb3V0cHV0ID0gdGhpcy5leHBhbmRCdWZmZXIoe2ZpeFJhdGlvOiAyfSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGluZmxhdGUgbW9kZScpO1xuICB9XG5cbiAgLy8gY29weVxuICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcbiAgICBvdXRwdXQuc2V0KGlucHV0LnN1YmFycmF5KGlwLCBpcCArIGxlbiksIG9wKTtcbiAgICBvcCArPSBsZW47XG4gICAgaXAgKz0gbGVuO1xuICB9IGVsc2Uge1xuICAgIHdoaWxlIChsZW4tLSkge1xuICAgICAgb3V0cHV0W29wKytdID0gaW5wdXRbaXArK107XG4gICAgfVxuICB9XG5cbiAgdGhpcy5pcCA9IGlwO1xuICB0aGlzLm9wID0gb3A7XG4gIHRoaXMub3V0cHV0ID0gb3V0cHV0O1xufTtcblxuLyoqXG4gKiBwYXJzZSBmaXhlZCBodWZmbWFuIGJsb2NrLlxuICovXG5abGliLlJhd0luZmxhdGUucHJvdG90eXBlLnBhcnNlRml4ZWRIdWZmbWFuQmxvY2sgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5kZWNvZGVIdWZmbWFuKFxuICAgIFpsaWIuUmF3SW5mbGF0ZS5GaXhlZExpdGVyYWxMZW5ndGhUYWJsZSxcbiAgICBabGliLlJhd0luZmxhdGUuRml4ZWREaXN0YW5jZVRhYmxlXG4gICk7XG59O1xuXG4vKipcbiAqIHBhcnNlIGR5bmFtaWMgaHVmZm1hbiBibG9jay5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5wYXJzZUR5bmFtaWNIdWZmbWFuQmxvY2sgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IG51bWJlciBvZiBsaXRlcmFsIGFuZCBsZW5ndGggY29kZXMuICovXG4gIHZhciBobGl0ID0gdGhpcy5yZWFkQml0cyg1KSArIDI1NztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IG51bWJlciBvZiBkaXN0YW5jZSBjb2Rlcy4gKi9cbiAgdmFyIGhkaXN0ID0gdGhpcy5yZWFkQml0cyg1KSArIDE7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBudW1iZXIgb2YgY29kZSBsZW5ndGhzLiAqL1xuICB2YXIgaGNsZW4gPSB0aGlzLnJlYWRCaXRzKDQpICsgNDtcbiAgLyoqIEB0eXBlIHshKFVpbnQ4QXJyYXl8QXJyYXkuPG51bWJlcj4pfSBjb2RlIGxlbmd0aHMuICovXG4gIHZhciBjb2RlTGVuZ3RocyA9XG4gICAgbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoWmxpYi5SYXdJbmZsYXRlLk9yZGVyLmxlbmd0aCk7XG4gIC8qKiBAdHlwZSB7IUFycmF5fSBjb2RlIGxlbmd0aHMgdGFibGUuICovXG4gIHZhciBjb2RlTGVuZ3Roc1RhYmxlO1xuICAvKiogQHR5cGUgeyEoVWludDhBcnJheXxBcnJheS48bnVtYmVyPil9IGxpdGVyYWwgYW5kIGxlbmd0aCBjb2RlIGxlbmd0aHMuICovXG4gIHZhciBsaXRsZW5MZW5ndGhzO1xuICAvKiogQHR5cGUgeyEoVWludDhBcnJheXxBcnJheS48bnVtYmVyPil9IGRpc3RhbmNlIGNvZGUgbGVuZ3Rocy4gKi9cbiAgdmFyIGRpc3RMZW5ndGhzO1xuICAvKiogQHR5cGUge251bWJlcn0gbG9vcCBjb3VudGVyLiAqL1xuICB2YXIgaTtcblxuICAvLyBkZWNvZGUgY29kZSBsZW5ndGhzXG4gIGZvciAoaSA9IDA7IGkgPCBoY2xlbjsgKytpKSB7XG4gICAgY29kZUxlbmd0aHNbWmxpYi5SYXdJbmZsYXRlLk9yZGVyW2ldXSA9IHRoaXMucmVhZEJpdHMoMyk7XG4gIH1cbiAgaWYgKCFVU0VfVFlQRURBUlJBWSkge1xuICAgIGZvciAoaSA9IGhjbGVuLCBoY2xlbiA9IGNvZGVMZW5ndGhzLmxlbmd0aDsgaSA8IGhjbGVuOyArK2kpIHtcbiAgICAgIGNvZGVMZW5ndGhzW1psaWIuUmF3SW5mbGF0ZS5PcmRlcltpXV0gPSAwO1xuICAgIH1cbiAgfVxuICBjb2RlTGVuZ3Roc1RhYmxlID0gYnVpbGRIdWZmbWFuVGFibGUoY29kZUxlbmd0aHMpO1xuXG4gIC8qKlxuICAgKiBkZWNvZGUgZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ9IG51bSBudW1iZXIgb2YgbGVuZ3Rocy5cbiAgICogQHBhcmFtIHshQXJyYXl9IHRhYmxlIGNvZGUgbGVuZ3RocyB0YWJsZS5cbiAgICogQHBhcmFtIHshKFVpbnQ4QXJyYXl8QXJyYXkuPG51bWJlcj4pfSBsZW5ndGhzIGNvZGUgbGVuZ3RocyBidWZmZXIuXG4gICAqIEByZXR1cm4geyEoVWludDhBcnJheXxBcnJheS48bnVtYmVyPil9IGNvZGUgbGVuZ3RocyBidWZmZXIuXG4gICAqL1xuICBmdW5jdGlvbiBkZWNvZGUobnVtLCB0YWJsZSwgbGVuZ3Rocykge1xuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgIHZhciBjb2RlO1xuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgIHZhciBwcmV2ID0gdGhpcy5wcmV2O1xuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgIHZhciByZXBlYXQ7XG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gICAgdmFyIGk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbnVtOykge1xuICAgICAgY29kZSA9IHRoaXMucmVhZENvZGVCeVRhYmxlKHRhYmxlKTtcbiAgICAgIHN3aXRjaCAoY29kZSkge1xuICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgIHJlcGVhdCA9IDMgKyB0aGlzLnJlYWRCaXRzKDIpO1xuICAgICAgICAgIHdoaWxlIChyZXBlYXQtLSkgeyBsZW5ndGhzW2krK10gPSBwcmV2OyB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTc6XG4gICAgICAgICAgcmVwZWF0ID0gMyArIHRoaXMucmVhZEJpdHMoMyk7XG4gICAgICAgICAgd2hpbGUgKHJlcGVhdC0tKSB7IGxlbmd0aHNbaSsrXSA9IDA7IH1cbiAgICAgICAgICBwcmV2ID0gMDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxODpcbiAgICAgICAgICByZXBlYXQgPSAxMSArIHRoaXMucmVhZEJpdHMoNyk7XG4gICAgICAgICAgd2hpbGUgKHJlcGVhdC0tKSB7IGxlbmd0aHNbaSsrXSA9IDA7IH1cbiAgICAgICAgICBwcmV2ID0gMDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBsZW5ndGhzW2krK10gPSBjb2RlO1xuICAgICAgICAgIHByZXYgPSBjb2RlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucHJldiA9IHByZXY7XG5cbiAgICByZXR1cm4gbGVuZ3RocztcbiAgfVxuXG4gIC8vIGxpdGVyYWwgYW5kIGxlbmd0aCBjb2RlXG4gIGxpdGxlbkxlbmd0aHMgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KShobGl0KTtcblxuICAvLyBkaXN0YW5jZSBjb2RlXG4gIGRpc3RMZW5ndGhzID0gbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoaGRpc3QpO1xuXG4gIHRoaXMucHJldiA9IDA7XG4gIHRoaXMuZGVjb2RlSHVmZm1hbihcbiAgICBidWlsZEh1ZmZtYW5UYWJsZShkZWNvZGUuY2FsbCh0aGlzLCBobGl0LCBjb2RlTGVuZ3Roc1RhYmxlLCBsaXRsZW5MZW5ndGhzKSksXG4gICAgYnVpbGRIdWZmbWFuVGFibGUoZGVjb2RlLmNhbGwodGhpcywgaGRpc3QsIGNvZGVMZW5ndGhzVGFibGUsIGRpc3RMZW5ndGhzKSlcbiAgKTtcbn07XG5cbi8qKlxuICogZGVjb2RlIGh1ZmZtYW4gY29kZVxuICogQHBhcmFtIHshQXJyYXl9IGxpdGxlbiBsaXRlcmFsIGFuZCBsZW5ndGggY29kZSB0YWJsZS5cbiAqIEBwYXJhbSB7IUFycmF5fSBkaXN0IGRpc3RpbmF0aW9uIGNvZGUgdGFibGUuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuZGVjb2RlSHVmZm1hbiA9IGZ1bmN0aW9uKGxpdGxlbiwgZGlzdCkge1xuICB2YXIgb3V0cHV0ID0gdGhpcy5vdXRwdXQ7XG4gIHZhciBvcCA9IHRoaXMub3A7XG5cbiAgdGhpcy5jdXJyZW50TGl0bGVuVGFibGUgPSBsaXRsZW47XG5cbiAgLyoqIEB0eXBlIHtudW1iZXJ9IG91dHB1dCBwb3NpdGlvbiBsaW1pdC4gKi9cbiAgdmFyIG9sZW5ndGggPSBvdXRwdXQubGVuZ3RoIC0gWmxpYi5SYXdJbmZsYXRlLk1heENvcHlMZW5ndGg7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBodWZmbWFuIGNvZGUuICovXG4gIHZhciBjb2RlO1xuICAvKiogQHR5cGUge251bWJlcn0gdGFibGUgaW5kZXguICovXG4gIHZhciB0aTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGh1ZmZtYW4gY29kZSBkaXN0aW5hdGlvbi4gKi9cbiAgdmFyIGNvZGVEaXN0O1xuICAvKiogQHR5cGUge251bWJlcn0gaHVmZm1hbiBjb2RlIGxlbmd0aC4gKi9cbiAgdmFyIGNvZGVMZW5ndGg7XG5cbiAgd2hpbGUgKChjb2RlID0gdGhpcy5yZWFkQ29kZUJ5VGFibGUobGl0bGVuKSkgIT09IDI1Nikge1xuICAgIC8vIGxpdGVyYWxcbiAgICBpZiAoY29kZSA8IDI1Nikge1xuICAgICAgaWYgKG9wID49IG9sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5vcCA9IG9wO1xuICAgICAgICBvdXRwdXQgPSB0aGlzLmV4cGFuZEJ1ZmZlcigpO1xuICAgICAgICBvcCA9IHRoaXMub3A7XG4gICAgICB9XG4gICAgICBvdXRwdXRbb3ArK10gPSBjb2RlO1xuXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBsZW5ndGggY29kZVxuICAgIHRpID0gY29kZSAtIDI1NztcbiAgICBjb2RlTGVuZ3RoID0gWmxpYi5SYXdJbmZsYXRlLkxlbmd0aENvZGVUYWJsZVt0aV07XG4gICAgaWYgKFpsaWIuUmF3SW5mbGF0ZS5MZW5ndGhFeHRyYVRhYmxlW3RpXSA+IDApIHtcbiAgICAgIGNvZGVMZW5ndGggKz0gdGhpcy5yZWFkQml0cyhabGliLlJhd0luZmxhdGUuTGVuZ3RoRXh0cmFUYWJsZVt0aV0pO1xuICAgIH1cblxuICAgIC8vIGRpc3QgY29kZVxuICAgIGNvZGUgPSB0aGlzLnJlYWRDb2RlQnlUYWJsZShkaXN0KTtcbiAgICBjb2RlRGlzdCA9IFpsaWIuUmF3SW5mbGF0ZS5EaXN0Q29kZVRhYmxlW2NvZGVdO1xuICAgIGlmIChabGliLlJhd0luZmxhdGUuRGlzdEV4dHJhVGFibGVbY29kZV0gPiAwKSB7XG4gICAgICBjb2RlRGlzdCArPSB0aGlzLnJlYWRCaXRzKFpsaWIuUmF3SW5mbGF0ZS5EaXN0RXh0cmFUYWJsZVtjb2RlXSk7XG4gICAgfVxuXG4gICAgLy8gbHo3NyBkZWNvZGVcbiAgICBpZiAob3AgPj0gb2xlbmd0aCkge1xuICAgICAgdGhpcy5vcCA9IG9wO1xuICAgICAgb3V0cHV0ID0gdGhpcy5leHBhbmRCdWZmZXIoKTtcbiAgICAgIG9wID0gdGhpcy5vcDtcbiAgICB9XG4gICAgd2hpbGUgKGNvZGVMZW5ndGgtLSkge1xuICAgICAgb3V0cHV0W29wXSA9IG91dHB1dFsob3ArKykgLSBjb2RlRGlzdF07XG4gICAgfVxuICB9XG5cbiAgd2hpbGUgKHRoaXMuYml0c2J1ZmxlbiA+PSA4KSB7XG4gICAgdGhpcy5iaXRzYnVmbGVuIC09IDg7XG4gICAgdGhpcy5pcC0tO1xuICB9XG4gIHRoaXMub3AgPSBvcDtcbn07XG5cbi8qKlxuICogZGVjb2RlIGh1ZmZtYW4gY29kZSAoYWRhcHRpdmUpXG4gKiBAcGFyYW0geyFBcnJheX0gbGl0bGVuIGxpdGVyYWwgYW5kIGxlbmd0aCBjb2RlIHRhYmxlLlxuICogQHBhcmFtIHshQXJyYXl9IGRpc3QgZGlzdGluYXRpb24gY29kZSB0YWJsZS5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5kZWNvZGVIdWZmbWFuQWRhcHRpdmUgPSBmdW5jdGlvbihsaXRsZW4sIGRpc3QpIHtcbiAgdmFyIG91dHB1dCA9IHRoaXMub3V0cHV0O1xuICB2YXIgb3AgPSB0aGlzLm9wO1xuXG4gIHRoaXMuY3VycmVudExpdGxlblRhYmxlID0gbGl0bGVuO1xuXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBvdXRwdXQgcG9zaXRpb24gbGltaXQuICovXG4gIHZhciBvbGVuZ3RoID0gb3V0cHV0Lmxlbmd0aDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGh1ZmZtYW4gY29kZS4gKi9cbiAgdmFyIGNvZGU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSB0YWJsZSBpbmRleC4gKi9cbiAgdmFyIHRpO1xuICAvKiogQHR5cGUge251bWJlcn0gaHVmZm1hbiBjb2RlIGRpc3RpbmF0aW9uLiAqL1xuICB2YXIgY29kZURpc3Q7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBodWZmbWFuIGNvZGUgbGVuZ3RoLiAqL1xuICB2YXIgY29kZUxlbmd0aDtcblxuICB3aGlsZSAoKGNvZGUgPSB0aGlzLnJlYWRDb2RlQnlUYWJsZShsaXRsZW4pKSAhPT0gMjU2KSB7XG4gICAgLy8gbGl0ZXJhbFxuICAgIGlmIChjb2RlIDwgMjU2KSB7XG4gICAgICBpZiAob3AgPj0gb2xlbmd0aCkge1xuICAgICAgICBvdXRwdXQgPSB0aGlzLmV4cGFuZEJ1ZmZlcigpO1xuICAgICAgICBvbGVuZ3RoID0gb3V0cHV0Lmxlbmd0aDtcbiAgICAgIH1cbiAgICAgIG91dHB1dFtvcCsrXSA9IGNvZGU7XG5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIGxlbmd0aCBjb2RlXG4gICAgdGkgPSBjb2RlIC0gMjU3O1xuICAgIGNvZGVMZW5ndGggPSBabGliLlJhd0luZmxhdGUuTGVuZ3RoQ29kZVRhYmxlW3RpXTtcbiAgICBpZiAoWmxpYi5SYXdJbmZsYXRlLkxlbmd0aEV4dHJhVGFibGVbdGldID4gMCkge1xuICAgICAgY29kZUxlbmd0aCArPSB0aGlzLnJlYWRCaXRzKFpsaWIuUmF3SW5mbGF0ZS5MZW5ndGhFeHRyYVRhYmxlW3RpXSk7XG4gICAgfVxuXG4gICAgLy8gZGlzdCBjb2RlXG4gICAgY29kZSA9IHRoaXMucmVhZENvZGVCeVRhYmxlKGRpc3QpO1xuICAgIGNvZGVEaXN0ID0gWmxpYi5SYXdJbmZsYXRlLkRpc3RDb2RlVGFibGVbY29kZV07XG4gICAgaWYgKFpsaWIuUmF3SW5mbGF0ZS5EaXN0RXh0cmFUYWJsZVtjb2RlXSA+IDApIHtcbiAgICAgIGNvZGVEaXN0ICs9IHRoaXMucmVhZEJpdHMoWmxpYi5SYXdJbmZsYXRlLkRpc3RFeHRyYVRhYmxlW2NvZGVdKTtcbiAgICB9XG5cbiAgICAvLyBsejc3IGRlY29kZVxuICAgIGlmIChvcCArIGNvZGVMZW5ndGggPiBvbGVuZ3RoKSB7XG4gICAgICBvdXRwdXQgPSB0aGlzLmV4cGFuZEJ1ZmZlcigpO1xuICAgICAgb2xlbmd0aCA9IG91dHB1dC5sZW5ndGg7XG4gICAgfVxuICAgIHdoaWxlIChjb2RlTGVuZ3RoLS0pIHtcbiAgICAgIG91dHB1dFtvcF0gPSBvdXRwdXRbKG9wKyspIC0gY29kZURpc3RdO1xuICAgIH1cbiAgfVxuXG4gIHdoaWxlICh0aGlzLmJpdHNidWZsZW4gPj0gOCkge1xuICAgIHRoaXMuYml0c2J1ZmxlbiAtPSA4O1xuICAgIHRoaXMuaXAtLTtcbiAgfVxuICB0aGlzLm9wID0gb3A7XG59O1xuXG4vKipcbiAqIGV4cGFuZCBvdXRwdXQgYnVmZmVyLlxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfcGFyYW0gb3B0aW9uIHBhcmFtZXRlcnMuXG4gKiBAcmV0dXJuIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBvdXRwdXQgYnVmZmVyLlxuICovXG5abGliLlJhd0luZmxhdGUucHJvdG90eXBlLmV4cGFuZEJ1ZmZlciA9IGZ1bmN0aW9uKG9wdF9wYXJhbSkge1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IHN0b3JlIGJ1ZmZlci4gKi9cbiAgdmFyIGJ1ZmZlciA9XG4gICAgbmV3IChVU0VfVFlQRURBUlJBWSA/IFVpbnQ4QXJyYXkgOiBBcnJheSkoXG4gICAgICAgIHRoaXMub3AgLSBabGliLlJhd0luZmxhdGUuTWF4QmFja3dhcmRMZW5ndGhcbiAgICApO1xuICAvKiogQHR5cGUge251bWJlcn0gYmFja3dhcmQgYmFzZSBwb2ludCAqL1xuICB2YXIgYmFja3dhcmQgPSB0aGlzLm9wIC0gWmxpYi5SYXdJbmZsYXRlLk1heEJhY2t3YXJkTGVuZ3RoO1xuICAvKiogQHR5cGUge251bWJlcn0gY29weSBpbmRleC4gKi9cbiAgdmFyIGk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBjb3B5IGxpbWl0ICovXG4gIHZhciBpbDtcblxuICB2YXIgb3V0cHV0ID0gdGhpcy5vdXRwdXQ7XG5cbiAgLy8gY29weSB0byBvdXRwdXQgYnVmZmVyXG4gIGlmIChVU0VfVFlQRURBUlJBWSkge1xuICAgIGJ1ZmZlci5zZXQob3V0cHV0LnN1YmFycmF5KFpsaWIuUmF3SW5mbGF0ZS5NYXhCYWNrd2FyZExlbmd0aCwgYnVmZmVyLmxlbmd0aCkpO1xuICB9IGVsc2Uge1xuICAgIGZvciAoaSA9IDAsIGlsID0gYnVmZmVyLmxlbmd0aDsgaSA8IGlsOyArK2kpIHtcbiAgICAgIGJ1ZmZlcltpXSA9IG91dHB1dFtpICsgWmxpYi5SYXdJbmZsYXRlLk1heEJhY2t3YXJkTGVuZ3RoXTtcbiAgICB9XG4gIH1cblxuICB0aGlzLmJsb2Nrcy5wdXNoKGJ1ZmZlcik7XG4gIHRoaXMudG90YWxwb3MgKz0gYnVmZmVyLmxlbmd0aDtcblxuICAvLyBjb3B5IHRvIGJhY2t3YXJkIGJ1ZmZlclxuICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcbiAgICBvdXRwdXQuc2V0KFxuICAgICAgb3V0cHV0LnN1YmFycmF5KGJhY2t3YXJkLCBiYWNrd2FyZCArIFpsaWIuUmF3SW5mbGF0ZS5NYXhCYWNrd2FyZExlbmd0aClcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIGZvciAoaSA9IDA7IGkgPCBabGliLlJhd0luZmxhdGUuTWF4QmFja3dhcmRMZW5ndGg7ICsraSkge1xuICAgICAgb3V0cHV0W2ldID0gb3V0cHV0W2JhY2t3YXJkICsgaV07XG4gICAgfVxuICB9XG5cbiAgdGhpcy5vcCA9IFpsaWIuUmF3SW5mbGF0ZS5NYXhCYWNrd2FyZExlbmd0aDtcblxuICByZXR1cm4gb3V0cHV0O1xufTtcblxuLyoqXG4gKiBleHBhbmQgb3V0cHV0IGJ1ZmZlci4gKGFkYXB0aXZlKVxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfcGFyYW0gb3B0aW9uIHBhcmFtZXRlcnMuXG4gKiBAcmV0dXJuIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBvdXRwdXQgYnVmZmVyIHBvaW50ZXIuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuZXhwYW5kQnVmZmVyQWRhcHRpdmUgPSBmdW5jdGlvbihvcHRfcGFyYW0pIHtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBzdG9yZSBidWZmZXIuICovXG4gIHZhciBidWZmZXI7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBleHBhbnRpb24gcmF0aW8uICovXG4gIHZhciByYXRpbyA9ICh0aGlzLmlucHV0Lmxlbmd0aCAvIHRoaXMuaXAgKyAxKSB8IDA7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBtYXhpbXVtIG51bWJlciBvZiBodWZmbWFuIGNvZGUuICovXG4gIHZhciBtYXhIdWZmQ29kZTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IG5ldyBvdXRwdXQgYnVmZmVyIHNpemUuICovXG4gIHZhciBuZXdTaXplO1xuICAvKiogQHR5cGUge251bWJlcn0gbWF4IGluZmxhdGUgc2l6ZS4gKi9cbiAgdmFyIG1heEluZmxhdGVTaXplO1xuXG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG4gIHZhciBvdXRwdXQgPSB0aGlzLm91dHB1dDtcblxuICBpZiAob3B0X3BhcmFtKSB7XG4gICAgaWYgKHR5cGVvZiBvcHRfcGFyYW0uZml4UmF0aW8gPT09ICdudW1iZXInKSB7XG4gICAgICByYXRpbyA9IG9wdF9wYXJhbS5maXhSYXRpbztcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvcHRfcGFyYW0uYWRkUmF0aW8gPT09ICdudW1iZXInKSB7XG4gICAgICByYXRpbyArPSBvcHRfcGFyYW0uYWRkUmF0aW87XG4gICAgfVxuICB9XG5cbiAgLy8gY2FsY3VsYXRlIG5ldyBidWZmZXIgc2l6ZVxuICBpZiAocmF0aW8gPCAyKSB7XG4gICAgbWF4SHVmZkNvZGUgPVxuICAgICAgKGlucHV0Lmxlbmd0aCAtIHRoaXMuaXApIC8gdGhpcy5jdXJyZW50TGl0bGVuVGFibGVbMl07XG4gICAgbWF4SW5mbGF0ZVNpemUgPSAobWF4SHVmZkNvZGUgLyAyICogMjU4KSB8IDA7XG4gICAgbmV3U2l6ZSA9IG1heEluZmxhdGVTaXplIDwgb3V0cHV0Lmxlbmd0aCA/XG4gICAgICBvdXRwdXQubGVuZ3RoICsgbWF4SW5mbGF0ZVNpemUgOlxuICAgICAgb3V0cHV0Lmxlbmd0aCA8PCAxO1xuICB9IGVsc2Uge1xuICAgIG5ld1NpemUgPSBvdXRwdXQubGVuZ3RoICogcmF0aW87XG4gIH1cblxuICAvLyBidWZmZXIgZXhwYW50aW9uXG4gIGlmIChVU0VfVFlQRURBUlJBWSkge1xuICAgIGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KG5ld1NpemUpO1xuICAgIGJ1ZmZlci5zZXQob3V0cHV0KTtcbiAgfSBlbHNlIHtcbiAgICBidWZmZXIgPSBvdXRwdXQ7XG4gIH1cblxuICB0aGlzLm91dHB1dCA9IGJ1ZmZlcjtcblxuICByZXR1cm4gdGhpcy5vdXRwdXQ7XG59O1xuXG4vKipcbiAqIGNvbmNhdCBvdXRwdXQgYnVmZmVyLlxuICogQHJldHVybiB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gb3V0cHV0IGJ1ZmZlci5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlLnByb3RvdHlwZS5jb25jYXRCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGJ1ZmZlciBwb2ludGVyLiAqL1xuICB2YXIgcG9zID0gMDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGJ1ZmZlciBwb2ludGVyLiAqL1xuICB2YXIgbGltaXQgPSB0aGlzLnRvdGFscG9zICsgKHRoaXMub3AgLSBabGliLlJhd0luZmxhdGUuTWF4QmFja3dhcmRMZW5ndGgpO1xuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IG91dHB1dCBibG9jayBhcnJheS4gKi9cbiAgdmFyIG91dHB1dCA9IHRoaXMub3V0cHV0O1xuICAvKiogQHR5cGUgeyFBcnJheX0gYmxvY2tzIGFycmF5LiAqL1xuICB2YXIgYmxvY2tzID0gdGhpcy5ibG9ja3M7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gb3V0cHV0IGJsb2NrIGFycmF5LiAqL1xuICB2YXIgYmxvY2s7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gb3V0cHV0IGJ1ZmZlci4gKi9cbiAgdmFyIGJ1ZmZlciA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKGxpbWl0KTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGxvb3AgY291bnRlci4gKi9cbiAgdmFyIGk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGxpbWl0ZXIuICovXG4gIHZhciBpbDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGxvb3AgY291bnRlci4gKi9cbiAgdmFyIGo7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBsb29wIGxpbWl0ZXIuICovXG4gIHZhciBqbDtcblxuICAvLyBzaW5nbGUgYnVmZmVyXG4gIGlmIChibG9ja3MubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIFVTRV9UWVBFREFSUkFZID9cbiAgICAgIHRoaXMub3V0cHV0LnN1YmFycmF5KFpsaWIuUmF3SW5mbGF0ZS5NYXhCYWNrd2FyZExlbmd0aCwgdGhpcy5vcCkgOlxuICAgICAgdGhpcy5vdXRwdXQuc2xpY2UoWmxpYi5SYXdJbmZsYXRlLk1heEJhY2t3YXJkTGVuZ3RoLCB0aGlzLm9wKTtcbiAgfVxuXG4gIC8vIGNvcHkgdG8gYnVmZmVyXG4gIGZvciAoaSA9IDAsIGlsID0gYmxvY2tzLmxlbmd0aDsgaSA8IGlsOyArK2kpIHtcbiAgICBibG9jayA9IGJsb2Nrc1tpXTtcbiAgICBmb3IgKGogPSAwLCBqbCA9IGJsb2NrLmxlbmd0aDsgaiA8IGpsOyArK2opIHtcbiAgICAgIGJ1ZmZlcltwb3MrK10gPSBibG9ja1tqXTtcbiAgICB9XG4gIH1cblxuICAvLyBjdXJyZW50IGJ1ZmZlclxuICBmb3IgKGkgPSBabGliLlJhd0luZmxhdGUuTWF4QmFja3dhcmRMZW5ndGgsIGlsID0gdGhpcy5vcDsgaSA8IGlsOyArK2kpIHtcbiAgICBidWZmZXJbcG9zKytdID0gb3V0cHV0W2ldO1xuICB9XG5cbiAgdGhpcy5ibG9ja3MgPSBbXTtcbiAgdGhpcy5idWZmZXIgPSBidWZmZXI7XG5cbiAgcmV0dXJuIHRoaXMuYnVmZmVyO1xufTtcblxuLyoqXG4gKiBjb25jYXQgb3V0cHV0IGJ1ZmZlci4gKGR5bmFtaWMpXG4gKiBAcmV0dXJuIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBvdXRwdXQgYnVmZmVyLlxuICovXG5abGliLlJhd0luZmxhdGUucHJvdG90eXBlLmNvbmNhdEJ1ZmZlckR5bmFtaWMgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHtBcnJheS48bnVtYmVyPnxVaW50OEFycmF5fSBvdXRwdXQgYnVmZmVyLiAqL1xuICB2YXIgYnVmZmVyO1xuICB2YXIgb3AgPSB0aGlzLm9wO1xuXG4gIGlmIChVU0VfVFlQRURBUlJBWSkge1xuICAgIGlmICh0aGlzLnJlc2l6ZSkge1xuICAgICAgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkob3ApO1xuICAgICAgYnVmZmVyLnNldCh0aGlzLm91dHB1dC5zdWJhcnJheSgwLCBvcCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBidWZmZXIgPSB0aGlzLm91dHB1dC5zdWJhcnJheSgwLCBvcCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmICh0aGlzLm91dHB1dC5sZW5ndGggPiBvcCkge1xuICAgICAgdGhpcy5vdXRwdXQubGVuZ3RoID0gb3A7XG4gICAgfVxuICAgIGJ1ZmZlciA9IHRoaXMub3V0cHV0O1xuICB9XG5cbiAgdGhpcy5idWZmZXIgPSBidWZmZXI7XG5cbiAgcmV0dXJuIHRoaXMuYnVmZmVyO1xufTtcblxuLy8gZW5kIG9mIHNjb3BlXG59KTtcblxuLyogdmltOnNldCBleHBhbmR0YWIgdHM9MiBzdz0yIHR3PTgwOiAqL1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEdaSVAgKFJGQzE5NTIpIOWxlemWi+OCs+ODs+ODhuODiuWun+ijhS5cbiAqL1xuZ29vZy5wcm92aWRlKCdabGliLkd1bnppcCcpO1xuXG5nb29nLnJlcXVpcmUoJ1VTRV9UWVBFREFSUkFZJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuQ1JDMzInKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5HemlwJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuUmF3SW5mbGF0ZScpO1xuZ29vZy5yZXF1aXJlKCdabGliLkd1bnppcE1lbWJlcicpO1xuXG5nb29nLnNjb3BlKGZ1bmN0aW9uKCkge1xuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBpbnB1dCBpbnB1dCBidWZmZXIuXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF9wYXJhbXMgb3B0aW9uIHBhcmFtZXRlcnMuXG4gKi9cblpsaWIuR3VuemlwID0gZnVuY3Rpb24oaW5wdXQsIG9wdF9wYXJhbXMpIHtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBpbnB1dCBidWZmZXIuICovXG4gIHRoaXMuaW5wdXQgPSBpbnB1dDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGlucHV0IGJ1ZmZlciBwb2ludGVyLiAqL1xuICB0aGlzLmlwID0gMDtcbiAgLyoqIEB0eXBlIHtBcnJheS48WmxpYi5HdW56aXBNZW1iZXI+fSAqL1xuICB0aGlzLm1lbWJlciA9IFtdO1xuICAvKiogQHR5cGUge2Jvb2xlYW59ICovXG4gIHRoaXMuZGVjb21wcmVzc2VkID0gZmFsc2U7XG59O1xuXG4vKipcbiAqIEByZXR1cm4ge0FycmF5LjxabGliLkd1bnppcE1lbWJlcj59XG4gKi9cblpsaWIuR3VuemlwLnByb3RvdHlwZS5nZXRNZW1iZXJzID0gZnVuY3Rpb24oKSB7XG4gIGlmICghdGhpcy5kZWNvbXByZXNzZWQpIHtcbiAgICB0aGlzLmRlY29tcHJlc3MoKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLm1lbWJlci5zbGljZSgpO1xufTtcblxuLyoqXG4gKiBpbmZsYXRlIGd6aXAgZGF0YS5cbiAqIEByZXR1cm4geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGluZmxhdGVkIGJ1ZmZlci5cbiAqL1xuWmxpYi5HdW56aXAucHJvdG90eXBlLmRlY29tcHJlc3MgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGlucHV0IGxlbmd0aC4gKi9cbiAgdmFyIGlsID0gdGhpcy5pbnB1dC5sZW5ndGg7XG5cbiAgd2hpbGUgKHRoaXMuaXAgPCBpbCkge1xuICAgIHRoaXMuZGVjb2RlTWVtYmVyKCk7XG4gIH1cblxuICB0aGlzLmRlY29tcHJlc3NlZCA9IHRydWU7XG5cbiAgcmV0dXJuIHRoaXMuY29uY2F0TWVtYmVyKCk7XG59O1xuXG4vKipcbiAqIGRlY29kZSBnemlwIG1lbWJlci5cbiAqL1xuWmxpYi5HdW56aXAucHJvdG90eXBlLmRlY29kZU1lbWJlciA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUge1psaWIuR3VuemlwTWVtYmVyfSAqL1xuICB2YXIgbWVtYmVyID0gbmV3IFpsaWIuR3VuemlwTWVtYmVyKCk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaXNpemU7XG4gIC8qKiBAdHlwZSB7WmxpYi5SYXdJbmZsYXRlfSBSYXdJbmZsYXRlIGltcGxlbWVudGF0aW9uLiAqL1xuICB2YXIgcmF3aW5mbGF0ZTtcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBpbmZsYXRlZCBkYXRhLiAqL1xuICB2YXIgaW5mbGF0ZWQ7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBpbmZsYXRlIHNpemUgKi9cbiAgdmFyIGluZmxlbjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGNoYXJhY3RlciBjb2RlICovXG4gIHZhciBjO1xuICAvKiogQHR5cGUge251bWJlcn0gY2hhcmFjdGVyIGluZGV4IGluIHN0cmluZy4gKi9cbiAgdmFyIGNpO1xuICAvKiogQHR5cGUge0FycmF5LjxzdHJpbmc+fSBjaGFyYWN0ZXIgYXJyYXkuICovXG4gIHZhciBzdHI7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBtb2RpZmljYXRpb24gdGltZS4gKi9cbiAgdmFyIG10aW1lO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGNyYzMyO1xuXG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG4gIHZhciBpcCA9IHRoaXMuaXA7XG5cbiAgbWVtYmVyLmlkMSA9IGlucHV0W2lwKytdO1xuICBtZW1iZXIuaWQyID0gaW5wdXRbaXArK107XG5cbiAgLy8gY2hlY2sgc2lnbmF0dXJlXG4gIGlmIChtZW1iZXIuaWQxICE9PSAweDFmIHx8IG1lbWJlci5pZDIgIT09IDB4OGIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZmlsZSBzaWduYXR1cmU6JyArIG1lbWJlci5pZDEgKyAnLCcgKyBtZW1iZXIuaWQyKTtcbiAgfVxuXG4gIC8vIGNoZWNrIGNvbXByZXNzaW9uIG1ldGhvZFxuICBtZW1iZXIuY20gPSBpbnB1dFtpcCsrXTtcbiAgc3dpdGNoIChtZW1iZXIuY20pIHtcbiAgICBjYXNlIDg6IC8qIFhYWDogdXNlIFpsaWIgY29uc3QgKi9cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vua25vd24gY29tcHJlc3Npb24gbWV0aG9kOiAnICsgbWVtYmVyLmNtKTtcbiAgfVxuXG4gIC8vIGZsYWdzXG4gIG1lbWJlci5mbGcgPSBpbnB1dFtpcCsrXTtcblxuICAvLyBtb2RpZmljYXRpb24gdGltZVxuICBtdGltZSA9IChpbnB1dFtpcCsrXSkgICAgICAgfFxuICAgICAgICAgIChpbnB1dFtpcCsrXSA8PCA4KSAgfFxuICAgICAgICAgIChpbnB1dFtpcCsrXSA8PCAxNikgfFxuICAgICAgICAgIChpbnB1dFtpcCsrXSA8PCAyNCk7XG4gIG1lbWJlci5tdGltZSA9IG5ldyBEYXRlKG10aW1lICogMTAwMCk7XG5cbiAgLy8gZXh0cmEgZmxhZ3NcbiAgbWVtYmVyLnhmbCA9IGlucHV0W2lwKytdO1xuXG4gIC8vIG9wZXJhdGluZyBzeXN0ZW1cbiAgbWVtYmVyLm9zID0gaW5wdXRbaXArK107XG5cbiAgLy8gZXh0cmFcbiAgaWYgKChtZW1iZXIuZmxnICYgWmxpYi5HemlwLkZsYWdzTWFzay5GRVhUUkEpID4gMCkge1xuICAgIG1lbWJlci54bGVuID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XG4gICAgaXAgPSB0aGlzLmRlY29kZVN1YkZpZWxkKGlwLCBtZW1iZXIueGxlbik7XG4gIH1cblxuICAvLyBmbmFtZVxuICBpZiAoKG1lbWJlci5mbGcgJiBabGliLkd6aXAuRmxhZ3NNYXNrLkZOQU1FKSA+IDApIHtcbiAgICBmb3Ioc3RyID0gW10sIGNpID0gMDsgKGMgPSBpbnB1dFtpcCsrXSkgPiAwOykge1xuICAgICAgc3RyW2NpKytdID0gU3RyaW5nLmZyb21DaGFyQ29kZShjKTtcbiAgICB9XG4gICAgbWVtYmVyLm5hbWUgPSBzdHIuam9pbignJyk7XG4gIH1cblxuICAvLyBmY29tbWVudFxuICBpZiAoKG1lbWJlci5mbGcgJiBabGliLkd6aXAuRmxhZ3NNYXNrLkZDT01NRU5UKSA+IDApIHtcbiAgICBmb3Ioc3RyID0gW10sIGNpID0gMDsgKGMgPSBpbnB1dFtpcCsrXSkgPiAwOykge1xuICAgICAgc3RyW2NpKytdID0gU3RyaW5nLmZyb21DaGFyQ29kZShjKTtcbiAgICB9XG4gICAgbWVtYmVyLmNvbW1lbnQgPSBzdHIuam9pbignJyk7XG4gIH1cblxuICAvLyBmaGNyY1xuICBpZiAoKG1lbWJlci5mbGcgJiBabGliLkd6aXAuRmxhZ3NNYXNrLkZIQ1JDKSA+IDApIHtcbiAgICBtZW1iZXIuY3JjMTYgPSBabGliLkNSQzMyLmNhbGMoaW5wdXQsIDAsIGlwKSAmIDB4ZmZmZjtcbiAgICBpZiAobWVtYmVyLmNyYzE2ICE9PSAoaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgaGVhZGVyIGNyYzE2Jyk7XG4gICAgfVxuICB9XG5cbiAgLy8gaXNpemUg44KS5LqL5YmN44Gr5Y+W5b6X44GZ44KL44Go5bGV6ZaL5b6M44Gu44K144Kk44K644GM5YiG44GL44KL44Gf44KB44CBXG4gIC8vIGluZmxhdGXlh6bnkIbjga7jg5Djg4Pjg5XjgqHjgrXjgqTjgrrjgYzkuovliY3jgavliIbjgYvjgorjgIHpq5jpgJ/jgavjgarjgotcbiAgaXNpemUgPSAoaW5wdXRbaW5wdXQubGVuZ3RoIC0gNF0pICAgICAgIHwgKGlucHV0W2lucHV0Lmxlbmd0aCAtIDNdIDw8IDgpIHxcbiAgICAgICAgICAoaW5wdXRbaW5wdXQubGVuZ3RoIC0gMl0gPDwgMTYpIHwgKGlucHV0W2lucHV0Lmxlbmd0aCAtIDFdIDw8IDI0KTtcblxuICAvLyBpc2l6ZSDjga7lpqXlvZPmgKfjg4Hjgqfjg4Pjgq9cbiAgLy8g44OP44OV44Oe44Oz56ym5Y+344Gn44Gv5pyA5bCPIDItYml0IOOBruOBn+OCgeOAgeacgOWkp+OBpyAxLzQg44Gr44Gq44KLXG4gIC8vIExaNzcg56ym5Y+344Gn44GvIOmVt+OBleOBqOi3nemboiAyLUJ5dGUg44Gn5pyA5aSnIDI1OC1CeXRlIOOCkuihqOePvuOBp+OBjeOCi+OBn+OCgeOAgVxuICAvLyAxLzEyOCDjgavjgarjgovjgajjgZnjgotcbiAgLy8g44GT44GT44GL44KJ5YWl5Yqb44OQ44OD44OV44Kh44Gu5q6L44KK44GMIGlzaXplIOOBriA1MTIg5YCN5Lul5LiK44Gg44Gj44Gf44KJXG4gIC8vIOOCteOCpOOCuuaMh+WumuOBruODkOODg+ODleOCoeeiuuS/neOBr+ihjOOCj+OBquOBhOS6i+OBqOOBmeOCi1xuICBpZiAoaW5wdXQubGVuZ3RoIC0gaXAgLSAvKiBDUkMtMzIgKi80IC0gLyogSVNJWkUgKi80IDwgaXNpemUgKiA1MTIpIHtcbiAgICBpbmZsZW4gPSBpc2l6ZTtcbiAgfVxuXG4gIC8vIGNvbXByZXNzZWQgYmxvY2tcbiAgcmF3aW5mbGF0ZSA9IG5ldyBabGliLlJhd0luZmxhdGUoaW5wdXQsIHsnaW5kZXgnOiBpcCwgJ2J1ZmZlclNpemUnOiBpbmZsZW59KTtcbiAgbWVtYmVyLmRhdGEgPSBpbmZsYXRlZCA9IHJhd2luZmxhdGUuZGVjb21wcmVzcygpO1xuICBpcCA9IHJhd2luZmxhdGUuaXA7XG5cbiAgLy8gY3JjMzJcbiAgbWVtYmVyLmNyYzMyID0gY3JjMzIgPVxuICAgICgoaW5wdXRbaXArK10pICAgICAgIHwgKGlucHV0W2lwKytdIDw8IDgpIHxcbiAgICAgKGlucHV0W2lwKytdIDw8IDE2KSB8IChpbnB1dFtpcCsrXSA8PCAyNCkpID4+PiAwO1xuICBpZiAoWmxpYi5DUkMzMi5jYWxjKGluZmxhdGVkKSAhPT0gY3JjMzIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgQ1JDLTMyIGNoZWNrc3VtOiAweCcgK1xuICAgICAgICBabGliLkNSQzMyLmNhbGMoaW5mbGF0ZWQpLnRvU3RyaW5nKDE2KSArICcgLyAweCcgKyBjcmMzMi50b1N0cmluZygxNikpO1xuICB9XG5cbiAgLy8gaW5wdXQgc2l6ZVxuICBtZW1iZXIuaXNpemUgPSBpc2l6ZSA9XG4gICAgKChpbnB1dFtpcCsrXSkgICAgICAgfCAoaW5wdXRbaXArK10gPDwgOCkgfFxuICAgICAoaW5wdXRbaXArK10gPDwgMTYpIHwgKGlucHV0W2lwKytdIDw8IDI0KSkgPj4+IDA7XG4gIGlmICgoaW5mbGF0ZWQubGVuZ3RoICYgMHhmZmZmZmZmZikgIT09IGlzaXplKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGlucHV0IHNpemU6ICcgK1xuICAgICAgICAoaW5mbGF0ZWQubGVuZ3RoICYgMHhmZmZmZmZmZikgKyAnIC8gJyArIGlzaXplKTtcbiAgfVxuXG4gIHRoaXMubWVtYmVyLnB1c2gobWVtYmVyKTtcbiAgdGhpcy5pcCA9IGlwO1xufTtcblxuLyoqXG4gKiDjgrXjg5bjg5XjgqPjg7zjg6vjg4njga7jg4fjgrPjg7zjg4lcbiAqIFhYWDog54++5Zyo44Gv5L2V44KC44Gb44Ga44K544Kt44OD44OX44GZ44KLXG4gKi9cblpsaWIuR3VuemlwLnByb3RvdHlwZS5kZWNvZGVTdWJGaWVsZCA9IGZ1bmN0aW9uKGlwLCBsZW5ndGgpIHtcbiAgcmV0dXJuIGlwICsgbGVuZ3RoO1xufTtcblxuLyoqXG4gKiBAcmV0dXJuIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfVxuICovXG5abGliLkd1bnppcC5wcm90b3R5cGUuY29uY2F0TWVtYmVyID0gZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7QXJyYXkuPFpsaWIuR3VuemlwTWVtYmVyPn0gKi9cbiAgdmFyIG1lbWJlciA9IHRoaXMubWVtYmVyO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaWw7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgcCA9IDA7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgc2l6ZSA9IDA7XG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cbiAgdmFyIGJ1ZmZlcjtcblxuICBmb3IgKGkgPSAwLCBpbCA9IG1lbWJlci5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XG4gICAgc2l6ZSArPSBtZW1iZXJbaV0uZGF0YS5sZW5ndGg7XG4gIH1cblxuICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcbiAgICBidWZmZXIgPSBuZXcgVWludDhBcnJheShzaXplKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgaWw7ICsraSkge1xuICAgICAgYnVmZmVyLnNldChtZW1iZXJbaV0uZGF0YSwgcCk7XG4gICAgICBwICs9IG1lbWJlcltpXS5kYXRhLmxlbmd0aDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgYnVmZmVyID0gW107XG4gICAgZm9yIChpID0gMDsgaSA8IGlsOyArK2kpIHtcbiAgICAgIGJ1ZmZlcltpXSA9IG1lbWJlcltpXS5kYXRhO1xuICAgIH1cbiAgICBidWZmZXIgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCBidWZmZXIpO1xuICB9XG5cbiAgcmV0dXJuIGJ1ZmZlcjtcbn07XG5cbn0pO1xuLyogdmltOnNldCBleHBhbmR0YWIgdHM9MiBzdz0yIHR3PTgwOiAqL1xuIiwiZ29vZy5wcm92aWRlKCdabGliLlJhd0luZmxhdGVTdHJlYW0nKTtcblxuZ29vZy5yZXF1aXJlKCdVU0VfVFlQRURBUlJBWScpO1xuZ29vZy5yZXF1aXJlKCdabGliLkh1ZmZtYW4nKTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKiogQGRlZmluZSB7bnVtYmVyfSBidWZmZXIgYmxvY2sgc2l6ZS4gKi9cbnZhciBaTElCX1NUUkVBTV9SQVdfSU5GTEFURV9CVUZGRVJfU0laRSA9IDB4ODAwMDtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5nb29nLnNjb3BlKGZ1bmN0aW9uKCkge1xuXG52YXIgYnVpbGRIdWZmbWFuVGFibGUgPSBabGliLkh1ZmZtYW4uYnVpbGRIdWZmbWFuVGFibGU7XG5cbi8qKlxuICogQHBhcmFtIHshKFVpbnQ4QXJyYXl8QXJyYXkuPG51bWJlcj4pfSBpbnB1dCBpbnB1dCBidWZmZXIuXG4gKiBAcGFyYW0ge251bWJlcn0gaXAgaW5wdXQgYnVmZmVyIHBvaW50ZXIuXG4gKiBAcGFyYW0ge251bWJlcj19IG9wdF9idWZmZXJzaXplIGJ1ZmZlciBibG9jayBzaXplLlxuICogQGNvbnN0cnVjdG9yXG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbSA9IGZ1bmN0aW9uKGlucHV0LCBpcCwgb3B0X2J1ZmZlcnNpemUpIHtcbiAgLyoqIEB0eXBlIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBpbmZsYXRlZCBidWZmZXIgKi9cbiAgdGhpcy5idWZmZXI7XG4gIC8qKiBAdHlwZSB7IUFycmF5LjwoQXJyYXl8VWludDhBcnJheSk+fSAqL1xuICB0aGlzLmJsb2NrcyA9IFtdO1xuICAvKiogQHR5cGUge251bWJlcn0gYmxvY2sgc2l6ZS4gKi9cbiAgdGhpcy5idWZmZXJTaXplID1cbiAgICBvcHRfYnVmZmVyc2l6ZSA/IG9wdF9idWZmZXJzaXplIDogWkxJQl9TVFJFQU1fUkFXX0lORkxBVEVfQlVGRkVSX1NJWkU7XG4gIC8qKiBAdHlwZSB7IW51bWJlcn0gdG90YWwgb3V0cHV0IGJ1ZmZlciBwb2ludGVyLiAqL1xuICB0aGlzLnRvdGFscG9zID0gMDtcbiAgLyoqIEB0eXBlIHshbnVtYmVyfSBpbnB1dCBidWZmZXIgcG9pbnRlci4gKi9cbiAgdGhpcy5pcCA9IGlwID09PSB2b2lkIDAgPyAwIDogaXA7XG4gIC8qKiBAdHlwZSB7IW51bWJlcn0gYml0IHN0cmVhbSByZWFkZXIgYnVmZmVyLiAqL1xuICB0aGlzLmJpdHNidWYgPSAwO1xuICAvKiogQHR5cGUgeyFudW1iZXJ9IGJpdCBzdHJlYW0gcmVhZGVyIGJ1ZmZlciBzaXplLiAqL1xuICB0aGlzLmJpdHNidWZsZW4gPSAwO1xuICAvKiogQHR5cGUgeyEoQXJyYXl8VWludDhBcnJheSl9IGlucHV0IGJ1ZmZlci4gKi9cbiAgdGhpcy5pbnB1dCA9IFVTRV9UWVBFREFSUkFZID8gbmV3IFVpbnQ4QXJyYXkoaW5wdXQpIDogaW5wdXQ7XG4gIC8qKiBAdHlwZSB7IShVaW50OEFycmF5fEFycmF5KX0gb3V0cHV0IGJ1ZmZlci4gKi9cbiAgdGhpcy5vdXRwdXQgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KSh0aGlzLmJ1ZmZlclNpemUpO1xuICAvKiogQHR5cGUgeyFudW1iZXJ9IG91dHB1dCBidWZmZXIgcG9pbnRlci4gKi9cbiAgdGhpcy5vcCA9IDA7XG4gIC8qKiBAdHlwZSB7Ym9vbGVhbn0gaXMgZmluYWwgYmxvY2sgZmxhZy4gKi9cbiAgdGhpcy5iZmluYWwgPSBmYWxzZTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IHVuY29tcHJlc3NlZCBibG9jayBsZW5ndGguICovXG4gIHRoaXMuYmxvY2tMZW5ndGg7XG4gIC8qKiBAdHlwZSB7Ym9vbGVhbn0gcmVzaXplIGZsYWcgZm9yIG1lbW9yeSBzaXplIG9wdGltaXphdGlvbi4gKi9cbiAgdGhpcy5yZXNpemUgPSBmYWxzZTtcbiAgLyoqIEB0eXBlIHtBcnJheX0gKi9cbiAgdGhpcy5saXRsZW5UYWJsZTtcbiAgLyoqIEB0eXBlIHtBcnJheX0gKi9cbiAgdGhpcy5kaXN0VGFibGU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB0aGlzLnNwID0gMDsgLy8gc3RyZWFtIHBvaW50ZXJcbiAgLyoqIEB0eXBlIHtabGliLlJhd0luZmxhdGVTdHJlYW0uU3RhdHVzfSAqL1xuICB0aGlzLnN0YXR1cyA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuSU5JVElBTElaRUQ7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBwcmV2aW91cyBSTEUgdmFsdWUgKi9cbiAgdGhpcy5wcmV2O1xuXG4gIC8vXG4gIC8vIGJhY2t1cFxuICAvL1xuICAvKiogQHR5cGUgeyFudW1iZXJ9ICovXG4gIHRoaXMuaXBfO1xuICAvKiogQHR5cGUgeyFudW1iZXJ9ICovXG4gIHRoaXMuYml0c2J1Zmxlbl87XG4gIC8qKiBAdHlwZSB7IW51bWJlcn0gKi9cbiAgdGhpcy5iaXRzYnVmXztcbn07XG5cbi8qKlxuICogQGVudW0ge251bWJlcn1cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkJsb2NrVHlwZSA9IHtcbiAgVU5DT01QUkVTU0VEOiAwLFxuICBGSVhFRDogMSxcbiAgRFlOQU1JQzogMlxufTtcblxuLyoqXG4gKiBAZW51bSB7bnVtYmVyfVxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0uU3RhdHVzID0ge1xuICBJTklUSUFMSVpFRDogMCxcbiAgQkxPQ0tfSEVBREVSX1NUQVJUOiAxLFxuICBCTE9DS19IRUFERVJfRU5EOiAyLFxuICBCTE9DS19CT0RZX1NUQVJUOiAzLFxuICBCTE9DS19CT0RZX0VORDogNCxcbiAgREVDT0RFX0JMT0NLX1NUQVJUOiA1LFxuICBERUNPREVfQkxPQ0tfRU5EOiA2XG59O1xuXG4vKipcbiAqIGRlY29tcHJlc3MuXG4gKiBAcmV0dXJuIHshKFVpbnQ4QXJyYXl8QXJyYXkpfSBpbmZsYXRlZCBidWZmZXIuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZGVjb21wcmVzcyA9IGZ1bmN0aW9uKG5ld0lucHV0LCBpcCkge1xuICAvKiogQHR5cGUge2Jvb2xlYW59ICovXG4gIHZhciBzdG9wID0gZmFsc2U7XG5cbiAgaWYgKG5ld0lucHV0ICE9PSB2b2lkIDApIHtcbiAgICB0aGlzLmlucHV0ID0gbmV3SW5wdXQ7XG4gIH1cblxuICBpZiAoaXAgIT09IHZvaWQgMCkge1xuICAgIHRoaXMuaXAgPSBpcDtcbiAgfVxuXG4gIC8vIGRlY29tcHJlc3NcbiAgd2hpbGUgKCFzdG9wKSB7XG4gICAgc3dpdGNoICh0aGlzLnN0YXR1cykge1xuICAgICAgLy8gYmxvY2sgaGVhZGVyXG4gICAgICBjYXNlIFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuSU5JVElBTElaRUQ6XG4gICAgICBjYXNlIFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuQkxPQ0tfSEVBREVSX1NUQVJUOlxuICAgICAgICBpZiAodGhpcy5yZWFkQmxvY2tIZWFkZXIoKSA8IDApIHtcbiAgICAgICAgICBzdG9wID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIC8vIGJsb2NrIGJvZHlcbiAgICAgIGNhc2UgWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5CTE9DS19IRUFERVJfRU5EOiAvKiBGQUxMVEhST1VHSCAqL1xuICAgICAgY2FzZSBabGliLlJhd0luZmxhdGVTdHJlYW0uU3RhdHVzLkJMT0NLX0JPRFlfU1RBUlQ6XG4gICAgICAgIHN3aXRjaCh0aGlzLmN1cnJlbnRCbG9ja1R5cGUpIHtcbiAgICAgICAgICBjYXNlIFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5CbG9ja1R5cGUuVU5DT01QUkVTU0VEOlxuICAgICAgICAgICAgaWYgKHRoaXMucmVhZFVuY29tcHJlc3NlZEJsb2NrSGVhZGVyKCkgPCAwKSB7XG4gICAgICAgICAgICAgIHN0b3AgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBabGliLlJhd0luZmxhdGVTdHJlYW0uQmxvY2tUeXBlLkZJWEVEOlxuICAgICAgICAgICAgaWYgKHRoaXMucGFyc2VGaXhlZEh1ZmZtYW5CbG9jaygpIDwgMCkge1xuICAgICAgICAgICAgICBzdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkJsb2NrVHlwZS5EWU5BTUlDOlxuICAgICAgICAgICAgaWYgKHRoaXMucGFyc2VEeW5hbWljSHVmZm1hbkJsb2NrKCkgPCAwKSB7XG4gICAgICAgICAgICAgIHN0b3AgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBkZWNvZGUgZGF0YVxuICAgICAgY2FzZSBabGliLlJhd0luZmxhdGVTdHJlYW0uU3RhdHVzLkJMT0NLX0JPRFlfRU5EOlxuICAgICAgY2FzZSBabGliLlJhd0luZmxhdGVTdHJlYW0uU3RhdHVzLkRFQ09ERV9CTE9DS19TVEFSVDpcbiAgICAgICAgc3dpdGNoKHRoaXMuY3VycmVudEJsb2NrVHlwZSkge1xuICAgICAgICAgIGNhc2UgWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkJsb2NrVHlwZS5VTkNPTVBSRVNTRUQ6XG4gICAgICAgICAgICBpZiAodGhpcy5wYXJzZVVuY29tcHJlc3NlZEJsb2NrKCkgPCAwKSB7XG4gICAgICAgICAgICAgIHN0b3AgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBabGliLlJhd0luZmxhdGVTdHJlYW0uQmxvY2tUeXBlLkZJWEVEOiAvKiBGQUxMVEhST1VHSCAqL1xuICAgICAgICAgIGNhc2UgWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkJsb2NrVHlwZS5EWU5BTUlDOlxuICAgICAgICAgICAgaWYgKHRoaXMuZGVjb2RlSHVmZm1hbigpIDwgMCkge1xuICAgICAgICAgICAgICBzdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBabGliLlJhd0luZmxhdGVTdHJlYW0uU3RhdHVzLkRFQ09ERV9CTE9DS19FTkQ6XG4gICAgICAgIGlmICh0aGlzLmJmaW5hbCkge1xuICAgICAgICAgIHN0b3AgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuc3RhdHVzID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5JTklUSUFMSVpFRDtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcy5jb25jYXRCdWZmZXIoKTtcbn07XG5cbi8qKlxuICogQGNvbnN0XG4gKiBAdHlwZSB7bnVtYmVyfSBtYXggYmFja3dhcmQgbGVuZ3RoIGZvciBMWjc3LlxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0uTWF4QmFja3dhcmRMZW5ndGggPSAzMjc2ODtcblxuLyoqXG4gKiBAY29uc3RcbiAqIEB0eXBlIHtudW1iZXJ9IG1heCBjb3B5IGxlbmd0aCBmb3IgTFo3Ny5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLk1heENvcHlMZW5ndGggPSAyNTg7XG5cbi8qKlxuICogaHVmZm1hbiBvcmRlclxuICogQGNvbnN0XG4gKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX1cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLk9yZGVyID0gKGZ1bmN0aW9uKHRhYmxlKSB7XG4gIHJldHVybiBVU0VfVFlQRURBUlJBWSA/IG5ldyBVaW50MTZBcnJheSh0YWJsZSkgOiB0YWJsZTtcbn0pKFsxNiwgMTcsIDE4LCAwLCA4LCA3LCA5LCA2LCAxMCwgNSwgMTEsIDQsIDEyLCAzLCAxMywgMiwgMTQsIDEsIDE1XSk7XG5cbi8qKlxuICogaHVmZm1hbiBsZW5ndGggY29kZSB0YWJsZS5cbiAqIEBjb25zdFxuICogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDE2QXJyYXkpfVxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0uTGVuZ3RoQ29kZVRhYmxlID0gKGZ1bmN0aW9uKHRhYmxlKSB7XG4gIHJldHVybiBVU0VfVFlQRURBUlJBWSA/IG5ldyBVaW50MTZBcnJheSh0YWJsZSkgOiB0YWJsZTtcbn0pKFtcbiAgMHgwMDAzLCAweDAwMDQsIDB4MDAwNSwgMHgwMDA2LCAweDAwMDcsIDB4MDAwOCwgMHgwMDA5LCAweDAwMGEsIDB4MDAwYixcbiAgMHgwMDBkLCAweDAwMGYsIDB4MDAxMSwgMHgwMDEzLCAweDAwMTcsIDB4MDAxYiwgMHgwMDFmLCAweDAwMjMsIDB4MDAyYixcbiAgMHgwMDMzLCAweDAwM2IsIDB4MDA0MywgMHgwMDUzLCAweDAwNjMsIDB4MDA3MywgMHgwMDgzLCAweDAwYTMsIDB4MDBjMyxcbiAgMHgwMGUzLCAweDAxMDIsIDB4MDEwMiwgMHgwMTAyXG5dKTtcblxuLyoqXG4gKiBodWZmbWFuIGxlbmd0aCBleHRyYS1iaXRzIHRhYmxlLlxuICogQGNvbnN0XG4gKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX1cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkxlbmd0aEV4dHJhVGFibGUgPSAoZnVuY3Rpb24odGFibGUpIHtcbiAgcmV0dXJuIFVTRV9UWVBFREFSUkFZID8gbmV3IFVpbnQ4QXJyYXkodGFibGUpIDogdGFibGU7XG59KShbXG4gIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDEsIDEsIDEsIDEsIDIsIDIsIDIsIDIsIDMsIDMsIDMsIDMsIDQsIDQsIDQsIDQsIDUsIDUsXG4gIDUsIDUsIDAsIDAsIDBcbl0pO1xuXG4vKipcbiAqIGh1ZmZtYW4gZGlzdCBjb2RlIHRhYmxlLlxuICogQGNvbnN0XG4gKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50MTZBcnJheSl9XG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5EaXN0Q29kZVRhYmxlID0gKGZ1bmN0aW9uKHRhYmxlKSB7XG4gIHJldHVybiBVU0VfVFlQRURBUlJBWSA/IG5ldyBVaW50MTZBcnJheSh0YWJsZSkgOiB0YWJsZTtcbn0pKFtcbiAgMHgwMDAxLCAweDAwMDIsIDB4MDAwMywgMHgwMDA0LCAweDAwMDUsIDB4MDAwNywgMHgwMDA5LCAweDAwMGQsIDB4MDAxMSxcbiAgMHgwMDE5LCAweDAwMjEsIDB4MDAzMSwgMHgwMDQxLCAweDAwNjEsIDB4MDA4MSwgMHgwMGMxLCAweDAxMDEsIDB4MDE4MSxcbiAgMHgwMjAxLCAweDAzMDEsIDB4MDQwMSwgMHgwNjAxLCAweDA4MDEsIDB4MGMwMSwgMHgxMDAxLCAweDE4MDEsIDB4MjAwMSxcbiAgMHgzMDAxLCAweDQwMDEsIDB4NjAwMVxuXSk7XG5cbi8qKlxuICogaHVmZm1hbiBkaXN0IGV4dHJhLWJpdHMgdGFibGUuXG4gKiBAY29uc3RcbiAqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfVxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0uRGlzdEV4dHJhVGFibGUgPSAoZnVuY3Rpb24odGFibGUpIHtcbiAgcmV0dXJuIFVTRV9UWVBFREFSUkFZID8gbmV3IFVpbnQ4QXJyYXkodGFibGUpIDogdGFibGU7XG59KShbXG4gIDAsIDAsIDAsIDAsIDEsIDEsIDIsIDIsIDMsIDMsIDQsIDQsIDUsIDUsIDYsIDYsIDcsIDcsIDgsIDgsIDksIDksIDEwLCAxMCwgMTEsXG4gIDExLCAxMiwgMTIsIDEzLCAxM1xuXSk7XG5cbi8qKlxuICogZml4ZWQgaHVmZm1hbiBsZW5ndGggY29kZSB0YWJsZVxuICogQGNvbnN0XG4gKiBAdHlwZSB7IUFycmF5fVxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0uRml4ZWRMaXRlcmFsTGVuZ3RoVGFibGUgPSAoZnVuY3Rpb24odGFibGUpIHtcbiAgcmV0dXJuIHRhYmxlO1xufSkoKGZ1bmN0aW9uKCkge1xuICB2YXIgbGVuZ3RocyA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKDI4OCk7XG4gIHZhciBpLCBpbDtcblxuICBmb3IgKGkgPSAwLCBpbCA9IGxlbmd0aHMubGVuZ3RoOyBpIDwgaWw7ICsraSkge1xuICAgIGxlbmd0aHNbaV0gPVxuICAgICAgKGkgPD0gMTQzKSA/IDggOlxuICAgICAgKGkgPD0gMjU1KSA/IDkgOlxuICAgICAgKGkgPD0gMjc5KSA/IDcgOlxuICAgICAgODtcbiAgfVxuXG4gIHJldHVybiBidWlsZEh1ZmZtYW5UYWJsZShsZW5ndGhzKTtcbn0pKCkpO1xuXG4vKipcbiAqIGZpeGVkIGh1ZmZtYW4gZGlzdGFuY2UgY29kZSB0YWJsZVxuICogQGNvbnN0XG4gKiBAdHlwZSB7IUFycmF5fVxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0uRml4ZWREaXN0YW5jZVRhYmxlID0gKGZ1bmN0aW9uKHRhYmxlKSB7XG4gIHJldHVybiB0YWJsZTtcbn0pKChmdW5jdGlvbigpIHtcbiAgdmFyIGxlbmd0aHMgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KSgzMCk7XG4gIHZhciBpLCBpbDtcblxuICBmb3IgKGkgPSAwLCBpbCA9IGxlbmd0aHMubGVuZ3RoOyBpIDwgaWw7ICsraSkge1xuICAgIGxlbmd0aHNbaV0gPSA1O1xuICB9XG5cbiAgcmV0dXJuIGJ1aWxkSHVmZm1hblRhYmxlKGxlbmd0aHMpO1xufSkoKSk7XG5cbi8qKlxuICogcGFyc2UgZGVmbGF0ZWQgYmxvY2suXG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUucmVhZEJsb2NrSGVhZGVyID0gZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBoZWFkZXIgKi9cbiAgdmFyIGhkcjtcblxuICB0aGlzLnN0YXR1cyA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuQkxPQ0tfSEVBREVSX1NUQVJUO1xuXG4gIHRoaXMuc2F2ZV8oKTtcbiAgaWYgKChoZHIgPSB0aGlzLnJlYWRCaXRzKDMpKSA8IDApIHtcbiAgICB0aGlzLnJlc3RvcmVfKCk7XG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgLy8gQkZJTkFMXG4gIGlmIChoZHIgJiAweDEpIHtcbiAgICB0aGlzLmJmaW5hbCA9IHRydWU7XG4gIH1cblxuICAvLyBCVFlQRVxuICBoZHIgPj4+PSAxO1xuICBzd2l0Y2ggKGhkcikge1xuICAgIGNhc2UgMDogLy8gdW5jb21wcmVzc2VkXG4gICAgICB0aGlzLmN1cnJlbnRCbG9ja1R5cGUgPSBabGliLlJhd0luZmxhdGVTdHJlYW0uQmxvY2tUeXBlLlVOQ09NUFJFU1NFRDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMTogLy8gZml4ZWQgaHVmZm1hblxuICAgICAgdGhpcy5jdXJyZW50QmxvY2tUeXBlID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLkJsb2NrVHlwZS5GSVhFRDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMjogLy8gZHluYW1pYyBodWZmbWFuXG4gICAgICB0aGlzLmN1cnJlbnRCbG9ja1R5cGUgPSBabGliLlJhd0luZmxhdGVTdHJlYW0uQmxvY2tUeXBlLkRZTkFNSUM7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OiAvLyByZXNlcnZlZCBvciBvdGhlclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmtub3duIEJUWVBFOiAnICsgaGRyKTtcbiAgfVxuXG4gIHRoaXMuc3RhdHVzID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5CTE9DS19IRUFERVJfRU5EO1xufTtcblxuLyoqXG4gKiByZWFkIGluZmxhdGUgYml0c1xuICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aCBiaXRzIGxlbmd0aC5cbiAqIEByZXR1cm4ge251bWJlcn0gcmVhZCBiaXRzLlxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnJlYWRCaXRzID0gZnVuY3Rpb24obGVuZ3RoKSB7XG4gIHZhciBiaXRzYnVmID0gdGhpcy5iaXRzYnVmO1xuICB2YXIgYml0c2J1ZmxlbiA9IHRoaXMuYml0c2J1ZmxlbjtcbiAgdmFyIGlucHV0ID0gdGhpcy5pbnB1dDtcbiAgdmFyIGlwID0gdGhpcy5pcDtcblxuICAvKiogQHR5cGUge251bWJlcn0gaW5wdXQgYW5kIG91dHB1dCBieXRlLiAqL1xuICB2YXIgb2N0ZXQ7XG5cbiAgLy8gbm90IGVub3VnaCBidWZmZXJcbiAgd2hpbGUgKGJpdHNidWZsZW4gPCBsZW5ndGgpIHtcbiAgICAvLyBpbnB1dCBieXRlXG4gICAgaWYgKGlucHV0Lmxlbmd0aCA8PSBpcCkge1xuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbiAgICBvY3RldCA9IGlucHV0W2lwKytdO1xuXG4gICAgLy8gY29uY2F0IG9jdGV0XG4gICAgYml0c2J1ZiB8PSBvY3RldCA8PCBiaXRzYnVmbGVuO1xuICAgIGJpdHNidWZsZW4gKz0gODtcbiAgfVxuXG4gIC8vIG91dHB1dCBieXRlXG4gIG9jdGV0ID0gYml0c2J1ZiAmIC8qIE1BU0sgKi8gKCgxIDw8IGxlbmd0aCkgLSAxKTtcbiAgYml0c2J1ZiA+Pj49IGxlbmd0aDtcbiAgYml0c2J1ZmxlbiAtPSBsZW5ndGg7XG5cbiAgdGhpcy5iaXRzYnVmID0gYml0c2J1ZjtcbiAgdGhpcy5iaXRzYnVmbGVuID0gYml0c2J1ZmxlbjtcbiAgdGhpcy5pcCA9IGlwO1xuXG4gIHJldHVybiBvY3RldDtcbn07XG5cbi8qKlxuICogcmVhZCBodWZmbWFuIGNvZGUgdXNpbmcgdGFibGVcbiAqIEBwYXJhbSB7QXJyYXl9IHRhYmxlIGh1ZmZtYW4gY29kZSB0YWJsZS5cbiAqIEByZXR1cm4ge251bWJlcn0gaHVmZm1hbiBjb2RlLlxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnJlYWRDb2RlQnlUYWJsZSA9IGZ1bmN0aW9uKHRhYmxlKSB7XG4gIHZhciBiaXRzYnVmID0gdGhpcy5iaXRzYnVmO1xuICB2YXIgYml0c2J1ZmxlbiA9IHRoaXMuYml0c2J1ZmxlbjtcbiAgdmFyIGlucHV0ID0gdGhpcy5pbnB1dDtcbiAgdmFyIGlwID0gdGhpcy5pcDtcblxuICAvKiogQHR5cGUgeyEoQXJyYXl8VWludDhBcnJheSl9IGh1ZmZtYW4gY29kZSB0YWJsZSAqL1xuICB2YXIgY29kZVRhYmxlID0gdGFibGVbMF07XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgbWF4Q29kZUxlbmd0aCA9IHRhYmxlWzFdO1xuICAvKiogQHR5cGUge251bWJlcn0gaW5wdXQgYnl0ZSAqL1xuICB2YXIgb2N0ZXQ7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBjb2RlIGxlbmd0aCAmIGNvZGUgKDE2Yml0LCAxNmJpdCkgKi9cbiAgdmFyIGNvZGVXaXRoTGVuZ3RoO1xuICAvKiogQHR5cGUge251bWJlcn0gY29kZSBiaXRzIGxlbmd0aCAqL1xuICB2YXIgY29kZUxlbmd0aDtcblxuICAvLyBub3QgZW5vdWdoIGJ1ZmZlclxuICB3aGlsZSAoYml0c2J1ZmxlbiA8IG1heENvZGVMZW5ndGgpIHtcbiAgICBpZiAoaW5wdXQubGVuZ3RoIDw9IGlwKSB7XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuICAgIG9jdGV0ID0gaW5wdXRbaXArK107XG4gICAgYml0c2J1ZiB8PSBvY3RldCA8PCBiaXRzYnVmbGVuO1xuICAgIGJpdHNidWZsZW4gKz0gODtcbiAgfVxuXG4gIC8vIHJlYWQgbWF4IGxlbmd0aFxuICBjb2RlV2l0aExlbmd0aCA9IGNvZGVUYWJsZVtiaXRzYnVmICYgKCgxIDw8IG1heENvZGVMZW5ndGgpIC0gMSldO1xuICBjb2RlTGVuZ3RoID0gY29kZVdpdGhMZW5ndGggPj4+IDE2O1xuXG4gIHRoaXMuYml0c2J1ZiA9IGJpdHNidWYgPj4gY29kZUxlbmd0aDtcbiAgdGhpcy5iaXRzYnVmbGVuID0gYml0c2J1ZmxlbiAtIGNvZGVMZW5ndGg7XG4gIHRoaXMuaXAgPSBpcDtcblxuICByZXR1cm4gY29kZVdpdGhMZW5ndGggJiAweGZmZmY7XG59O1xuXG4vKipcbiAqIHJlYWQgdW5jb21wcmVzc2VkIGJsb2NrIGhlYWRlclxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnJlYWRVbmNvbXByZXNzZWRCbG9ja0hlYWRlciA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUge251bWJlcn0gYmxvY2sgbGVuZ3RoICovXG4gIHZhciBsZW47XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBudW1iZXIgZm9yIGNoZWNrIGJsb2NrIGxlbmd0aCAqL1xuICB2YXIgbmxlbjtcblxuICB2YXIgaW5wdXQgPSB0aGlzLmlucHV0O1xuICB2YXIgaXAgPSB0aGlzLmlwO1xuXG4gIHRoaXMuc3RhdHVzID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5CTE9DS19CT0RZX1NUQVJUO1xuXG4gIGlmIChpcCArIDQgPj0gaW5wdXQubGVuZ3RoKSB7XG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgbGVuID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XG4gIG5sZW4gPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcblxuICAvLyBjaGVjayBsZW4gJiBubGVuXG4gIGlmIChsZW4gPT09IH5ubGVuKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHVuY29tcHJlc3NlZCBibG9jayBoZWFkZXI6IGxlbmd0aCB2ZXJpZnknKTtcbiAgfVxuXG4gIC8vIHNraXAgYnVmZmVyZWQgaGVhZGVyIGJpdHNcbiAgdGhpcy5iaXRzYnVmID0gMDtcbiAgdGhpcy5iaXRzYnVmbGVuID0gMDtcblxuICB0aGlzLmlwID0gaXA7XG4gIHRoaXMuYmxvY2tMZW5ndGggPSBsZW47XG4gIHRoaXMuc3RhdHVzID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5CTE9DS19CT0RZX0VORDtcbn1cblxuLyoqXG4gKiBwYXJzZSB1bmNvbXByZXNzZWQgYmxvY2suXG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUucGFyc2VVbmNvbXByZXNzZWRCbG9jayA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaW5wdXQgPSB0aGlzLmlucHV0O1xuICB2YXIgaXAgPSB0aGlzLmlwO1xuICB2YXIgb3V0cHV0ID0gdGhpcy5vdXRwdXQ7XG4gIHZhciBvcCA9IHRoaXMub3A7XG4gIHZhciBsZW4gPSB0aGlzLmJsb2NrTGVuZ3RoO1xuXG4gIHRoaXMuc3RhdHVzID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5ERUNPREVfQkxPQ0tfU1RBUlQ7XG5cbiAgLy8gY29weVxuICAvLyBYWFg6IOOBqOOCiuOBguOBiOOBmue0oOebtOOBq+OCs+ODlOODvFxuICB3aGlsZSAobGVuLS0pIHtcbiAgICBpZiAob3AgPT09IG91dHB1dC5sZW5ndGgpIHtcbiAgICAgIG91dHB1dCA9IHRoaXMuZXhwYW5kQnVmZmVyKHtmaXhSYXRpbzogMn0pO1xuICAgIH1cblxuICAgIC8vIG5vdCBlbm91Z2ggaW5wdXQgYnVmZmVyXG4gICAgaWYgKGlwID49IGlucHV0Lmxlbmd0aCkge1xuICAgICAgdGhpcy5pcCA9IGlwO1xuICAgICAgdGhpcy5vcCA9IG9wO1xuICAgICAgdGhpcy5ibG9ja0xlbmd0aCA9IGxlbiArIDE7IC8vIOOCs+ODlOODvOOBl+OBpuOBquOBhOOBruOBp+aIu+OBmVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIG91dHB1dFtvcCsrXSA9IGlucHV0W2lwKytdO1xuICB9XG5cbiAgaWYgKGxlbiA8IDApIHtcbiAgICB0aGlzLnN0YXR1cyA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5TdGF0dXMuREVDT0RFX0JMT0NLX0VORDtcbiAgfVxuXG4gIHRoaXMuaXAgPSBpcDtcbiAgdGhpcy5vcCA9IG9wO1xuXG4gIHJldHVybiAwO1xufTtcblxuLyoqXG4gKiBwYXJzZSBmaXhlZCBodWZmbWFuIGJsb2NrLlxuICovXG5abGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLnBhcnNlRml4ZWRIdWZmbWFuQmxvY2sgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5zdGF0dXMgPSBabGliLlJhd0luZmxhdGVTdHJlYW0uU3RhdHVzLkJMT0NLX0JPRFlfU1RBUlQ7XG5cbiAgdGhpcy5saXRsZW5UYWJsZSA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5GaXhlZExpdGVyYWxMZW5ndGhUYWJsZTtcbiAgdGhpcy5kaXN0VGFibGUgPSBabGliLlJhd0luZmxhdGVTdHJlYW0uRml4ZWREaXN0YW5jZVRhYmxlO1xuXG4gIHRoaXMuc3RhdHVzID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5CTE9DS19CT0RZX0VORDtcblxuICByZXR1cm4gMDtcbn07XG5cbi8qKlxuICog44Kq44OW44K444Kn44Kv44OI44Gu44Kz44Oz44OG44Kt44K544OI44KS5Yil44Gu44OX44Ot44OR44OG44Kj44Gr6YCA6YG/44GZ44KLLlxuICogQHByaXZhdGVcbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5zYXZlXyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmlwXyA9IHRoaXMuaXA7XG4gIHRoaXMuYml0c2J1Zmxlbl8gPSB0aGlzLmJpdHNidWZsZW47XG4gIHRoaXMuYml0c2J1Zl8gPSB0aGlzLmJpdHNidWY7XG59O1xuXG4vKipcbiAqIOWIpeOBruODl+ODreODkeODhuOCo+OBq+mAgOmBv+OBl+OBn+OCs+ODs+ODhuOCreOCueODiOOCkuW+qeWFg+OBmeOCiy5cbiAqIEBwcml2YXRlXG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUucmVzdG9yZV8gPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pcCA9IHRoaXMuaXBfO1xuICB0aGlzLmJpdHNidWZsZW4gPSB0aGlzLmJpdHNidWZsZW5fO1xuICB0aGlzLmJpdHNidWYgPSB0aGlzLmJpdHNidWZfO1xufTtcblxuLyoqXG4gKiBwYXJzZSBkeW5hbWljIGh1ZmZtYW4gYmxvY2suXG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUucGFyc2VEeW5hbWljSHVmZm1hbkJsb2NrID0gZnVuY3Rpb24oKSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBudW1iZXIgb2YgbGl0ZXJhbCBhbmQgbGVuZ3RoIGNvZGVzLiAqL1xuICB2YXIgaGxpdDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IG51bWJlciBvZiBkaXN0YW5jZSBjb2Rlcy4gKi9cbiAgdmFyIGhkaXN0O1xuICAvKiogQHR5cGUge251bWJlcn0gbnVtYmVyIG9mIGNvZGUgbGVuZ3Rocy4gKi9cbiAgdmFyIGhjbGVuO1xuICAvKiogQHR5cGUgeyEoVWludDhBcnJheXxBcnJheSl9IGNvZGUgbGVuZ3Rocy4gKi9cbiAgdmFyIGNvZGVMZW5ndGhzID1cbiAgICBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KShabGliLlJhd0luZmxhdGVTdHJlYW0uT3JkZXIubGVuZ3RoKTtcbiAgLyoqIEB0eXBlIHshQXJyYXl9IGNvZGUgbGVuZ3RocyB0YWJsZS4gKi9cbiAgdmFyIGNvZGVMZW5ndGhzVGFibGU7XG4gIC8qKiBAdHlwZSB7IShVaW50MzJBcnJheXxBcnJheSl9IGxpdGVyYWwgYW5kIGxlbmd0aCBjb2RlIGxlbmd0aHMuICovXG4gIHZhciBsaXRsZW5MZW5ndGhzO1xuICAvKiogQHR5cGUgeyEoVWludDMyQXJyYXl8QXJyYXkpfSBkaXN0YW5jZSBjb2RlIGxlbmd0aHMuICovXG4gIHZhciBkaXN0TGVuZ3RocztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGxvb3AgY291bnRlci4gKi9cbiAgdmFyIGkgPSAwO1xuXG4gIHRoaXMuc3RhdHVzID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5CTE9DS19CT0RZX1NUQVJUO1xuXG4gIHRoaXMuc2F2ZV8oKTtcbiAgaGxpdCA9IHRoaXMucmVhZEJpdHMoNSkgKyAyNTc7XG4gIGhkaXN0ID0gdGhpcy5yZWFkQml0cyg1KSArIDE7XG4gIGhjbGVuID0gdGhpcy5yZWFkQml0cyg0KSArIDQ7XG4gIGlmIChobGl0IDwgMCB8fCBoZGlzdCA8IDAgfHwgaGNsZW4gPCAwKSB7XG4gICAgdGhpcy5yZXN0b3JlXygpO1xuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgcGFyc2VEeW5hbWljSHVmZm1hbkJsb2NrSW1wbC5jYWxsKHRoaXMpO1xuICB9IGNhdGNoKGUpIHtcbiAgICB0aGlzLnJlc3RvcmVfKCk7XG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VEeW5hbWljSHVmZm1hbkJsb2NrSW1wbCgpIHtcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICB2YXIgYml0cztcblxuICAgIC8vIGRlY29kZSBjb2RlIGxlbmd0aHNcbiAgICBmb3IgKGkgPSAwOyBpIDwgaGNsZW47ICsraSkge1xuICAgICAgaWYgKChiaXRzID0gdGhpcy5yZWFkQml0cygzKSkgPCAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbm90IGVub3VnaCBpbnB1dCcpO1xuICAgICAgfVxuICAgICAgY29kZUxlbmd0aHNbWmxpYi5SYXdJbmZsYXRlU3RyZWFtLk9yZGVyW2ldXSA9IGJpdHM7XG4gICAgfVxuICAgIGNvZGVMZW5ndGhzVGFibGUgPSBidWlsZEh1ZmZtYW5UYWJsZShjb2RlTGVuZ3Rocyk7XG5cbiAgICAvLyBkZWNvZGUgZnVuY3Rpb25cbiAgICBmdW5jdGlvbiBkZWNvZGUobnVtLCB0YWJsZSwgbGVuZ3Rocykge1xuICAgICAgdmFyIGNvZGU7XG4gICAgICB2YXIgcHJldiA9IHRoaXMucHJldjtcbiAgICAgIHZhciByZXBlYXQ7XG4gICAgICB2YXIgaTtcbiAgICAgIHZhciBiaXRzO1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbnVtOykge1xuICAgICAgICBjb2RlID0gdGhpcy5yZWFkQ29kZUJ5VGFibGUodGFibGUpO1xuICAgICAgICBpZiAoY29kZSA8IDApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vdCBlbm91Z2ggaW5wdXQnKTtcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2ggKGNvZGUpIHtcbiAgICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgICAgaWYgKChiaXRzID0gdGhpcy5yZWFkQml0cygyKSkgPCAwKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignbm90IGVub3VnaCBpbnB1dCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVwZWF0ID0gMyArIGJpdHM7XG4gICAgICAgICAgICB3aGlsZSAocmVwZWF0LS0pIHsgbGVuZ3Roc1tpKytdID0gcHJldjsgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxNzpcbiAgICAgICAgICAgIGlmICgoYml0cyA9IHRoaXMucmVhZEJpdHMoMykpIDwgMCkge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vdCBlbm91Z2ggaW5wdXQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcGVhdCA9IDMgKyBiaXRzO1xuICAgICAgICAgICAgd2hpbGUgKHJlcGVhdC0tKSB7IGxlbmd0aHNbaSsrXSA9IDA7IH1cbiAgICAgICAgICAgIHByZXYgPSAwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxODpcbiAgICAgICAgICAgIGlmICgoYml0cyA9IHRoaXMucmVhZEJpdHMoNykpIDwgMCkge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vdCBlbm91Z2ggaW5wdXQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcGVhdCA9IDExICsgYml0cztcbiAgICAgICAgICAgIHdoaWxlIChyZXBlYXQtLSkgeyBsZW5ndGhzW2krK10gPSAwOyB9XG4gICAgICAgICAgICBwcmV2ID0gMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBsZW5ndGhzW2krK10gPSBjb2RlO1xuICAgICAgICAgICAgcHJldiA9IGNvZGU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnByZXYgPSBwcmV2O1xuXG4gICAgICByZXR1cm4gbGVuZ3RocztcbiAgICB9XG5cbiAgICAvLyBsaXRlcmFsIGFuZCBsZW5ndGggY29kZVxuICAgIGxpdGxlbkxlbmd0aHMgPSBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KShobGl0KTtcblxuICAgIC8vIGRpc3RhbmNlIGNvZGVcbiAgICBkaXN0TGVuZ3RocyA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKGhkaXN0KTtcblxuICAgIHRoaXMucHJldiA9IDA7XG4gICAgdGhpcy5saXRsZW5UYWJsZSA9IGJ1aWxkSHVmZm1hblRhYmxlKGRlY29kZS5jYWxsKHRoaXMsIGhsaXQsIGNvZGVMZW5ndGhzVGFibGUsIGxpdGxlbkxlbmd0aHMpKTtcbiAgICB0aGlzLmRpc3RUYWJsZSA9IGJ1aWxkSHVmZm1hblRhYmxlKGRlY29kZS5jYWxsKHRoaXMsIGhkaXN0LCBjb2RlTGVuZ3Roc1RhYmxlLCBkaXN0TGVuZ3RocykpO1xuICB9XG5cbiAgdGhpcy5zdGF0dXMgPSBabGliLlJhd0luZmxhdGVTdHJlYW0uU3RhdHVzLkJMT0NLX0JPRFlfRU5EO1xuXG4gIHJldHVybiAwO1xufTtcblxuLyoqXG4gKiBkZWNvZGUgaHVmZm1hbiBjb2RlIChkeW5hbWljKVxuICogQHJldHVybiB7KG51bWJlcnx1bmRlZmluZWQpfSAtMSBpcyBlcnJvci5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5kZWNvZGVIdWZmbWFuID0gZnVuY3Rpb24oKSB7XG4gIHZhciBvdXRwdXQgPSB0aGlzLm91dHB1dDtcbiAgdmFyIG9wID0gdGhpcy5vcDtcblxuICAvKiogQHR5cGUge251bWJlcn0gaHVmZm1hbiBjb2RlLiAqL1xuICB2YXIgY29kZTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IHRhYmxlIGluZGV4LiAqL1xuICB2YXIgdGk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBodWZmbWFuIGNvZGUgZGlzdGluYXRpb24uICovXG4gIHZhciBjb2RlRGlzdDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGh1ZmZtYW4gY29kZSBsZW5ndGguICovXG4gIHZhciBjb2RlTGVuZ3RoO1xuXG4gIHZhciBsaXRsZW4gPSB0aGlzLmxpdGxlblRhYmxlO1xuICB2YXIgZGlzdCA9IHRoaXMuZGlzdFRhYmxlO1xuXG4gIHZhciBvbGVuZ3RoID0gb3V0cHV0Lmxlbmd0aDtcbiAgdmFyIGJpdHM7XG5cbiAgdGhpcy5zdGF0dXMgPSBabGliLlJhd0luZmxhdGVTdHJlYW0uU3RhdHVzLkRFQ09ERV9CTE9DS19TVEFSVDtcblxuICB3aGlsZSAodHJ1ZSkge1xuICAgIHRoaXMuc2F2ZV8oKTtcblxuICAgIGNvZGUgPSB0aGlzLnJlYWRDb2RlQnlUYWJsZShsaXRsZW4pO1xuICAgIGlmIChjb2RlIDwgMCkge1xuICAgICAgdGhpcy5vcCA9IG9wO1xuICAgICAgdGhpcy5yZXN0b3JlXygpO1xuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIGlmIChjb2RlID09PSAyNTYpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIGxpdGVyYWxcbiAgICBpZiAoY29kZSA8IDI1Nikge1xuICAgICAgaWYgKG9wID09PSBvbGVuZ3RoKSB7XG4gICAgICAgIG91dHB1dCA9IHRoaXMuZXhwYW5kQnVmZmVyKCk7XG4gICAgICAgIG9sZW5ndGggPSBvdXRwdXQubGVuZ3RoO1xuICAgICAgfVxuICAgICAgb3V0cHV0W29wKytdID0gY29kZTtcblxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gbGVuZ3RoIGNvZGVcbiAgICB0aSA9IGNvZGUgLSAyNTc7XG4gICAgY29kZUxlbmd0aCA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5MZW5ndGhDb2RlVGFibGVbdGldO1xuICAgIGlmIChabGliLlJhd0luZmxhdGVTdHJlYW0uTGVuZ3RoRXh0cmFUYWJsZVt0aV0gPiAwKSB7XG4gICAgICBiaXRzID0gdGhpcy5yZWFkQml0cyhabGliLlJhd0luZmxhdGVTdHJlYW0uTGVuZ3RoRXh0cmFUYWJsZVt0aV0pO1xuICAgICAgaWYgKGJpdHMgPCAwKSB7XG4gICAgICAgIHRoaXMub3AgPSBvcDtcbiAgICAgICAgdGhpcy5yZXN0b3JlXygpO1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgICBjb2RlTGVuZ3RoICs9IGJpdHM7XG4gICAgfVxuXG4gICAgLy8gZGlzdCBjb2RlXG4gICAgY29kZSA9IHRoaXMucmVhZENvZGVCeVRhYmxlKGRpc3QpO1xuICAgIGlmIChjb2RlIDwgMCkge1xuICAgICAgdGhpcy5vcCA9IG9wO1xuICAgICAgdGhpcy5yZXN0b3JlXygpO1xuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbiAgICBjb2RlRGlzdCA9IFpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5EaXN0Q29kZVRhYmxlW2NvZGVdO1xuICAgIGlmIChabGliLlJhd0luZmxhdGVTdHJlYW0uRGlzdEV4dHJhVGFibGVbY29kZV0gPiAwKSB7XG4gICAgICBiaXRzID0gdGhpcy5yZWFkQml0cyhabGliLlJhd0luZmxhdGVTdHJlYW0uRGlzdEV4dHJhVGFibGVbY29kZV0pO1xuICAgICAgaWYgKGJpdHMgPCAwKSB7XG4gICAgICAgIHRoaXMub3AgPSBvcDtcbiAgICAgICAgdGhpcy5yZXN0b3JlXygpO1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgICBjb2RlRGlzdCArPSBiaXRzO1xuICAgIH1cblxuICAgIC8vIGx6NzcgZGVjb2RlXG4gICAgaWYgKG9wICsgY29kZUxlbmd0aCA+PSBvbGVuZ3RoKSB7XG4gICAgICBvdXRwdXQgPSB0aGlzLmV4cGFuZEJ1ZmZlcigpO1xuICAgICAgb2xlbmd0aCA9IG91dHB1dC5sZW5ndGg7XG4gICAgfVxuXG4gICAgd2hpbGUgKGNvZGVMZW5ndGgtLSkge1xuICAgICAgb3V0cHV0W29wXSA9IG91dHB1dFsob3ArKykgLSBjb2RlRGlzdF07XG4gICAgfVxuXG4gICAgLy8gYnJlYWtcbiAgICBpZiAodGhpcy5pcCA9PT0gdGhpcy5pbnB1dC5sZW5ndGgpIHtcbiAgICAgIHRoaXMub3AgPSBvcDtcbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG4gIH1cblxuICB3aGlsZSAodGhpcy5iaXRzYnVmbGVuID49IDgpIHtcbiAgICB0aGlzLmJpdHNidWZsZW4gLT0gODtcbiAgICB0aGlzLmlwLS07XG4gIH1cblxuICB0aGlzLm9wID0gb3A7XG4gIHRoaXMuc3RhdHVzID0gWmxpYi5SYXdJbmZsYXRlU3RyZWFtLlN0YXR1cy5ERUNPREVfQkxPQ0tfRU5EO1xufTtcblxuLyoqXG4gKiBleHBhbmQgb3V0cHV0IGJ1ZmZlci4gKGR5bmFtaWMpXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF9wYXJhbSBvcHRpb24gcGFyYW1ldGVycy5cbiAqIEByZXR1cm4geyEoQXJyYXl8VWludDhBcnJheSl9IG91dHB1dCBidWZmZXIgcG9pbnRlci5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5leHBhbmRCdWZmZXIgPSBmdW5jdGlvbihvcHRfcGFyYW0pIHtcbiAgLyoqIEB0eXBlIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBzdG9yZSBidWZmZXIuICovXG4gIHZhciBidWZmZXI7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBleHBhbnRpb24gcmF0aW8uICovXG4gIHZhciByYXRpbyA9ICh0aGlzLmlucHV0Lmxlbmd0aCAvIHRoaXMuaXAgKyAxKSB8IDA7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBtYXhpbXVtIG51bWJlciBvZiBodWZmbWFuIGNvZGUuICovXG4gIHZhciBtYXhIdWZmQ29kZTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IG5ldyBvdXRwdXQgYnVmZmVyIHNpemUuICovXG4gIHZhciBuZXdTaXplO1xuICAvKiogQHR5cGUge251bWJlcn0gbWF4IGluZmxhdGUgc2l6ZS4gKi9cbiAgdmFyIG1heEluZmxhdGVTaXplO1xuXG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG4gIHZhciBvdXRwdXQgPSB0aGlzLm91dHB1dDtcblxuICBpZiAob3B0X3BhcmFtKSB7XG4gICAgaWYgKHR5cGVvZiBvcHRfcGFyYW0uZml4UmF0aW8gPT09ICdudW1iZXInKSB7XG4gICAgICByYXRpbyA9IG9wdF9wYXJhbS5maXhSYXRpbztcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvcHRfcGFyYW0uYWRkUmF0aW8gPT09ICdudW1iZXInKSB7XG4gICAgICByYXRpbyArPSBvcHRfcGFyYW0uYWRkUmF0aW87XG4gICAgfVxuICB9XG5cbiAgLy8gY2FsY3VsYXRlIG5ldyBidWZmZXIgc2l6ZVxuICBpZiAocmF0aW8gPCAyKSB7XG4gICAgbWF4SHVmZkNvZGUgPVxuICAgICAgKGlucHV0Lmxlbmd0aCAtIHRoaXMuaXApIC8gdGhpcy5saXRsZW5UYWJsZVsyXTtcbiAgICBtYXhJbmZsYXRlU2l6ZSA9IChtYXhIdWZmQ29kZSAvIDIgKiAyNTgpIHwgMDtcbiAgICBuZXdTaXplID0gbWF4SW5mbGF0ZVNpemUgPCBvdXRwdXQubGVuZ3RoID9cbiAgICAgIG91dHB1dC5sZW5ndGggKyBtYXhJbmZsYXRlU2l6ZSA6XG4gICAgICBvdXRwdXQubGVuZ3RoIDw8IDE7XG4gIH0gZWxzZSB7XG4gICAgbmV3U2l6ZSA9IG91dHB1dC5sZW5ndGggKiByYXRpbztcbiAgfVxuXG4gIC8vIGJ1ZmZlciBleHBhbnRpb25cbiAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XG4gICAgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkobmV3U2l6ZSk7XG4gICAgYnVmZmVyLnNldChvdXRwdXQpO1xuICB9IGVsc2Uge1xuICAgIGJ1ZmZlciA9IG91dHB1dDtcbiAgfVxuXG4gIHRoaXMub3V0cHV0ID0gYnVmZmVyO1xuXG4gIHJldHVybiB0aGlzLm91dHB1dDtcbn07XG5cbi8qKlxuICogY29uY2F0IG91dHB1dCBidWZmZXIuIChkeW5hbWljKVxuICogQHJldHVybiB7IShBcnJheXxVaW50OEFycmF5KX0gb3V0cHV0IGJ1ZmZlci5cbiAqL1xuWmxpYi5SYXdJbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5jb25jYXRCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBvdXRwdXQgYnVmZmVyLiAqL1xuICB2YXIgYnVmZmVyO1xuXG4gIHZhciByZXNpemUgPSB0aGlzLnJlc2l6ZTtcblxuICB2YXIgb3AgPSB0aGlzLm9wO1xuXG4gIGlmIChyZXNpemUpIHtcbiAgICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcbiAgICAgIGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KG9wKTtcbiAgICAgIGJ1ZmZlci5zZXQodGhpcy5vdXRwdXQuc3ViYXJyYXkodGhpcy5zcCwgb3ApKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYnVmZmVyID0gdGhpcy5vdXRwdXQuc2xpY2UodGhpcy5zcCwgb3ApO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBidWZmZXIgPVxuICAgICAgVVNFX1RZUEVEQVJSQVkgPyB0aGlzLm91dHB1dC5zdWJhcnJheSh0aGlzLnNwLCBvcCkgOiB0aGlzLm91dHB1dC5zbGljZSh0aGlzLnNwLCBvcCk7XG4gIH1cblxuXG4gIHRoaXMuYnVmZmVyID0gYnVmZmVyO1xuICB0aGlzLnNwID0gb3A7XG5cbiAgcmV0dXJuIHRoaXMuYnVmZmVyO1xufTtcblxuLyoqXG4gKiBAcmV0dXJuIHshKEFycmF5fFVpbnQ4QXJyYXkpfSBjdXJyZW50IG91dHB1dCBidWZmZXIuXG4gKi9cblpsaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZ2V0Qnl0ZXMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIFVTRV9UWVBFREFSUkFZID9cbiAgICB0aGlzLm91dHB1dC5zdWJhcnJheSgwLCB0aGlzLm9wKSA6IHRoaXMub3V0cHV0LnNsaWNlKDAsIHRoaXMub3ApO1xufTtcblxuLy8gZW5kIG9mIHNjb3BlXG59KTtcblxuLyogdmltOnNldCBleHBhbmR0YWIgdHM9MiBzdz0yIHR3PTgwOiAqL1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IOmbkeWkmuOBqumWouaVsOe+pOOCkuOBvuOBqOOCgeOBn+ODouOCuOODpeODvOODq+Wun+ijhS5cbiAqL1xuZ29vZy5wcm92aWRlKCdabGliLlV0aWwnKTtcblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxuLyoqXG4gKiBCeXRlIFN0cmluZyDjgYvjgokgQnl0ZSBBcnJheSDjgavlpInmj5suXG4gKiBAcGFyYW0geyFzdHJpbmd9IHN0ciBieXRlIHN0cmluZy5cbiAqIEByZXR1cm4geyFBcnJheS48bnVtYmVyPn0gYnl0ZSBhcnJheS5cbiAqL1xuWmxpYi5VdGlsLnN0cmluZ1RvQnl0ZUFycmF5ID0gZnVuY3Rpb24oc3RyKSB7XG4gIC8qKiBAdHlwZSB7IUFycmF5Ljwoc3RyaW5nfG51bWJlcik+fSAqL1xuICB2YXIgdG1wID0gc3RyLnNwbGl0KCcnKTtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBpO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGlsO1xuXG4gIGZvciAoaSA9IDAsIGlsID0gdG1wLmxlbmd0aDsgaSA8IGlsOyBpKyspIHtcbiAgICB0bXBbaV0gPSAodG1wW2ldLmNoYXJDb2RlQXQoMCkgJiAweGZmKSA+Pj4gMDtcbiAgfVxuXG4gIHJldHVybiB0bXA7XG59O1xuXG4vLyBlbmQgb2Ygc2NvcGVcbn0pO1xuXG4vKiB2aW06c2V0IGV4cGFuZHRhYiB0cz0yIHN3PTIgdHc9ODA6ICovXG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgQWRsZXIzMiBjaGVja3N1bSDlrp/oo4UuXG4gKi9cbmdvb2cucHJvdmlkZSgnWmxpYi5BZGxlcjMyJyk7XG5cbmdvb2cucmVxdWlyZSgnVVNFX1RZUEVEQVJSQVknKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5VdGlsJyk7XG5cbmdvb2cuc2NvcGUoZnVuY3Rpb24oKSB7XG5cbi8qKlxuICogQWRsZXIzMiDjg4/jg4Pjgrfjg6XlgKTjga7kvZzmiJBcbiAqIEBwYXJhbSB7IShBcnJheXxVaW50OEFycmF5fHN0cmluZyl9IGFycmF5IOeul+WHuuOBq+S9v+eUqOOBmeOCiyBieXRlIGFycmF5LlxuICogQHJldHVybiB7bnVtYmVyfSBBZGxlcjMyIOODj+ODg+OCt+ODpeWApC5cbiAqL1xuWmxpYi5BZGxlcjMyID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgaWYgKHR5cGVvZihhcnJheSkgPT09ICdzdHJpbmcnKSB7XG4gICAgYXJyYXkgPSBabGliLlV0aWwuc3RyaW5nVG9CeXRlQXJyYXkoYXJyYXkpO1xuICB9XG4gIHJldHVybiBabGliLkFkbGVyMzIudXBkYXRlKDEsIGFycmF5KTtcbn07XG5cbi8qKlxuICogQWRsZXIzMiDjg4/jg4Pjgrfjg6XlgKTjga7mm7TmlrBcbiAqIEBwYXJhbSB7bnVtYmVyfSBhZGxlciDnj77lnKjjga7jg4/jg4Pjgrfjg6XlgKQuXG4gKiBAcGFyYW0geyEoQXJyYXl8VWludDhBcnJheSl9IGFycmF5IOabtOaWsOOBq+S9v+eUqOOBmeOCiyBieXRlIGFycmF5LlxuICogQHJldHVybiB7bnVtYmVyfSBBZGxlcjMyIOODj+ODg+OCt+ODpeWApC5cbiAqL1xuWmxpYi5BZGxlcjMyLnVwZGF0ZSA9IGZ1bmN0aW9uKGFkbGVyLCBhcnJheSkge1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIHMxID0gYWRsZXIgJiAweGZmZmY7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgczIgPSAoYWRsZXIgPj4+IDE2KSAmIDB4ZmZmZjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGFycmF5IGxlbmd0aCAqL1xuICB2YXIgbGVuID0gYXJyYXkubGVuZ3RoO1xuICAvKiogQHR5cGUge251bWJlcn0gbG9vcCBsZW5ndGggKGRvbid0IG92ZXJmbG93KSAqL1xuICB2YXIgdGxlbjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGFycmF5IGluZGV4ICovXG4gIHZhciBpID0gMDtcblxuICB3aGlsZSAobGVuID4gMCkge1xuICAgIHRsZW4gPSBsZW4gPiBabGliLkFkbGVyMzIuT3B0aW1pemF0aW9uUGFyYW1ldGVyID9cbiAgICAgIFpsaWIuQWRsZXIzMi5PcHRpbWl6YXRpb25QYXJhbWV0ZXIgOiBsZW47XG4gICAgbGVuIC09IHRsZW47XG4gICAgZG8ge1xuICAgICAgczEgKz0gYXJyYXlbaSsrXTtcbiAgICAgIHMyICs9IHMxO1xuICAgIH0gd2hpbGUgKC0tdGxlbik7XG5cbiAgICBzMSAlPSA2NTUyMTtcbiAgICBzMiAlPSA2NTUyMTtcbiAgfVxuXG4gIHJldHVybiAoKHMyIDw8IDE2KSB8IHMxKSA+Pj4gMDtcbn07XG5cbi8qKlxuICogQWRsZXIzMiDmnIDpganljJbjg5Hjg6njg6Hjg7zjgr9cbiAqIOePvueKtuOBp+OBryAxMDI0IOeoi+W6puOBjOacgOmBqS5cbiAqIEBzZWUgaHR0cDovL2pzcGVyZi5jb20vYWRsZXItMzItc2ltcGxlLXZzLW9wdGltaXplZC8zXG4gKiBAZGVmaW5lIHtudW1iZXJ9XG4gKi9cblpsaWIuQWRsZXIzMi5PcHRpbWl6YXRpb25QYXJhbWV0ZXIgPSAxMDI0O1xuXG4vLyBlbmQgb2Ygc2NvcGVcbn0pO1xuXG4vKiB2aW06c2V0IGV4cGFuZHRhYiB0cz0yIHN3PTIgdHc9ODA6ICovXG4iLCJnb29nLnByb3ZpZGUoJ1psaWIuSW5mbGF0ZScpO1xuXG5nb29nLnJlcXVpcmUoJ1VTRV9UWVBFREFSUkFZJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuQWRsZXIzMicpO1xuZ29vZy5yZXF1aXJlKCdabGliLlJhd0luZmxhdGUnKTtcblxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7IShVaW50OEFycmF5fEFycmF5KX0gaW5wdXQgZGVmbGF0ZWQgYnVmZmVyLlxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfcGFyYW1zIG9wdGlvbiBwYXJhbWV0ZXJzLlxuICpcbiAqIG9wdF9wYXJhbXMg44Gv5Lul5LiL44Gu44OX44Ot44OR44OG44Kj44KS5oyH5a6a44GZ44KL5LqL44GM44Gn44GN44G+44GZ44CCXG4gKiAgIC0gaW5kZXg6IGlucHV0IGJ1ZmZlciDjga4gZGVmbGF0ZSDjgrPjg7Pjg4bjg4rjga7plovlp4vkvY3nva4uXG4gKiAgIC0gYmxvY2tTaXplOiDjg5Djg4Pjg5XjgqHjga7jg5bjg63jg4Pjgq/jgrXjgqTjgrouXG4gKiAgIC0gdmVyaWZ5OiDkvLjlvLXjgYzntYLjgo/jgaPjgZ/lvowgYWRsZXItMzIgY2hlY2tzdW0g44Gu5qSc6Ki844KS6KGM44GG44GLLlxuICogICAtIGJ1ZmZlclR5cGU6IFpsaWIuSW5mbGF0ZS5CdWZmZXJUeXBlIOOBruWApOOBq+OCiOOBo+OBpuODkOODg+ODleOCoeOBrueuoeeQhuaWueazleOCkuaMh+WumuOBmeOCiy5cbiAqICAgICAgIFpsaWIuSW5mbGF0ZS5CdWZmZXJUeXBlIOOBryBabGliLlJhd0luZmxhdGUuQnVmZmVyVHlwZSDjga7jgqjjgqTjg6rjgqLjgrkuXG4gKi9cblpsaWIuSW5mbGF0ZSA9IGZ1bmN0aW9uKGlucHV0LCBvcHRfcGFyYW1zKSB7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgYnVmZmVyU2l6ZTtcbiAgLyoqIEB0eXBlIHtabGliLkluZmxhdGUuQnVmZmVyVHlwZX0gKi9cbiAgdmFyIGJ1ZmZlclR5cGU7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgY21mO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGZsZztcblxuICAvKiogQHR5cGUgeyEoVWludDhBcnJheXxBcnJheSl9ICovXG4gIHRoaXMuaW5wdXQgPSBpbnB1dDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHRoaXMuaXAgPSAwO1xuICAvKiogQHR5cGUge1psaWIuUmF3SW5mbGF0ZX0gKi9cbiAgdGhpcy5yYXdpbmZsYXRlO1xuICAvKiogQHR5cGUgeyhib29sZWFufHVuZGVmaW5lZCl9IHZlcmlmeSBmbGFnLiAqL1xuICB0aGlzLnZlcmlmeTtcblxuICAvLyBvcHRpb24gcGFyYW1ldGVyc1xuICBpZiAob3B0X3BhcmFtcyB8fCAhKG9wdF9wYXJhbXMgPSB7fSkpIHtcbiAgICBpZiAob3B0X3BhcmFtc1snaW5kZXgnXSkge1xuICAgICAgdGhpcy5pcCA9IG9wdF9wYXJhbXNbJ2luZGV4J107XG4gICAgfVxuICAgIGlmIChvcHRfcGFyYW1zWyd2ZXJpZnknXSkge1xuICAgICAgdGhpcy52ZXJpZnkgPSBvcHRfcGFyYW1zWyd2ZXJpZnknXTtcbiAgICB9XG4gIH1cblxuICAvLyBDb21wcmVzc2lvbiBNZXRob2QgYW5kIEZsYWdzXG4gIGNtZiA9IGlucHV0W3RoaXMuaXArK107XG4gIGZsZyA9IGlucHV0W3RoaXMuaXArK107XG5cbiAgLy8gY29tcHJlc3Npb24gbWV0aG9kXG4gIHN3aXRjaCAoY21mICYgMHgwZikge1xuICAgIGNhc2UgWmxpYi5Db21wcmVzc2lvbk1ldGhvZC5ERUZMQVRFOlxuICAgICAgdGhpcy5tZXRob2QgPSBabGliLkNvbXByZXNzaW9uTWV0aG9kLkRFRkxBVEU7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bnN1cHBvcnRlZCBjb21wcmVzc2lvbiBtZXRob2QnKTtcbiAgfVxuXG4gIC8vIGZjaGVja1xuICBpZiAoKChjbWYgPDwgOCkgKyBmbGcpICUgMzEgIT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZmNoZWNrIGZsYWc6JyArICgoY21mIDw8IDgpICsgZmxnKSAlIDMxKTtcbiAgfVxuXG4gIC8vIGZkaWN0IChub3Qgc3VwcG9ydGVkKVxuICBpZiAoZmxnICYgMHgyMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignZmRpY3QgZmxhZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG4gIH1cblxuICAvLyBSYXdJbmZsYXRlXG4gIHRoaXMucmF3aW5mbGF0ZSA9IG5ldyBabGliLlJhd0luZmxhdGUoaW5wdXQsIHtcbiAgICAnaW5kZXgnOiB0aGlzLmlwLFxuICAgICdidWZmZXJTaXplJzogb3B0X3BhcmFtc1snYnVmZmVyU2l6ZSddLFxuICAgICdidWZmZXJUeXBlJzogb3B0X3BhcmFtc1snYnVmZmVyVHlwZSddLFxuICAgICdyZXNpemUnOiBvcHRfcGFyYW1zWydyZXNpemUnXVxuICB9KTtcbn1cblxuLyoqXG4gKiBAZW51bSB7bnVtYmVyfVxuICovXG5abGliLkluZmxhdGUuQnVmZmVyVHlwZSA9IFpsaWIuUmF3SW5mbGF0ZS5CdWZmZXJUeXBlO1xuXG4vKipcbiAqIGRlY29tcHJlc3MuXG4gKiBAcmV0dXJuIHshKFVpbnQ4QXJyYXl8QXJyYXkpfSBpbmZsYXRlZCBidWZmZXIuXG4gKi9cblpsaWIuSW5mbGF0ZS5wcm90b3R5cGUuZGVjb21wcmVzcyA9IGZ1bmN0aW9uKCkge1xuICAvKiogQHR5cGUgeyEoQXJyYXl8VWludDhBcnJheSl9IGlucHV0IGJ1ZmZlci4gKi9cbiAgdmFyIGlucHV0ID0gdGhpcy5pbnB1dDtcbiAgLyoqIEB0eXBlIHshKFVpbnQ4QXJyYXl8QXJyYXkpfSBpbmZsYXRlZCBidWZmZXIuICovXG4gIHZhciBidWZmZXI7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSBhZGxlci0zMiBjaGVja3N1bSAqL1xuICB2YXIgYWRsZXIzMjtcblxuICBidWZmZXIgPSB0aGlzLnJhd2luZmxhdGUuZGVjb21wcmVzcygpO1xuICB0aGlzLmlwID0gdGhpcy5yYXdpbmZsYXRlLmlwO1xuXG4gIC8vIHZlcmlmeSBhZGxlci0zMlxuICBpZiAodGhpcy52ZXJpZnkpIHtcbiAgICBhZGxlcjMyID0gKFxuICAgICAgaW5wdXRbdGhpcy5pcCsrXSA8PCAyNCB8IGlucHV0W3RoaXMuaXArK10gPDwgMTYgfFxuICAgICAgaW5wdXRbdGhpcy5pcCsrXSA8PCA4IHwgaW5wdXRbdGhpcy5pcCsrXVxuICAgICkgPj4+IDA7XG5cbiAgICBpZiAoYWRsZXIzMiAhPT0gWmxpYi5BZGxlcjMyKGJ1ZmZlcikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBhZGxlci0zMiBjaGVja3N1bScpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWZmZXI7XG59O1xuXG4vLyBlbmQgb2Ygc2NvcGVcbn0pO1xuXG4vKiB2aW06c2V0IGV4cGFuZHRhYiB0cz0yIHN3PTIgdHc9ODA6ICovXG4iLCJnb29nLnByb3ZpZGUoJ1psaWIuWmlwJyk7XHJcblxyXG5nb29nLnJlcXVpcmUoJ1VTRV9UWVBFREFSUkFZJyk7XHJcbmdvb2cucmVxdWlyZSgnWmxpYi5SYXdEZWZsYXRlJyk7XHJcbmdvb2cucmVxdWlyZSgnWmxpYi5DUkMzMicpO1xyXG5cclxuZ29vZy5zY29wZShmdW5jdGlvbigpIHtcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF9wYXJhbXMgb3B0aW9ucy5cclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5abGliLlppcCA9IGZ1bmN0aW9uKG9wdF9wYXJhbXMpIHtcclxuICBvcHRfcGFyYW1zID0gb3B0X3BhcmFtcyB8fCB7fTtcclxuICAvKiogQHR5cGUge0FycmF5Ljx7XHJcbiAgICogICBidWZmZXI6ICEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSksXHJcbiAgICogICBvcHRpb246IE9iamVjdCxcclxuICAgKiAgIGNvbXByZXNzZWQ6IGJvb2xlYW4sXHJcbiAgICogICBlbmNyeXB0ZWQ6IGJvb2xlYW4sXHJcbiAgICogICBzaXplOiBudW1iZXIsXHJcbiAgICogICBjcmMzMjogbnVtYmVyXHJcbiAgICogfT59ICovXHJcbiAgdGhpcy5maWxlcyA9IFtdO1xyXG4gIC8qKiBAdHlwZSB7KEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xyXG4gIHRoaXMuY29tbWVudCA9IG9wdF9wYXJhbXNbJ2NvbW1lbnQnXTtcclxuICAvKiogQHR5cGUgeyhBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cclxuICB0aGlzLnBhc3N3b3JkO1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBAZW51bSB7bnVtYmVyfVxyXG4gKi9cclxuWmxpYi5aaXAuQ29tcHJlc3Npb25NZXRob2QgPSB7XHJcbiAgU1RPUkU6IDAsXHJcbiAgREVGTEFURTogOFxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBlbnVtIHtudW1iZXJ9XHJcbiAqL1xyXG5abGliLlppcC5PcGVyYXRpbmdTeXN0ZW0gPSB7XHJcbiAgTVNET1M6IDAsXHJcbiAgVU5JWDogMyxcclxuICBNQUNJTlRPU0g6IDdcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAZW51bSB7bnVtYmVyfVxyXG4gKi9cclxuWmxpYi5aaXAuRmxhZ3MgPSB7XHJcbiAgRU5DUllQVDogICAgMHgwMDAxLFxyXG4gIERFU0NSSVBUT1I6IDB4MDAwOCxcclxuICBVVEY4OiAgICAgICAweDA4MDBcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAdHlwZSB7QXJyYXkuPG51bWJlcj59XHJcbiAqIEBjb25zdFxyXG4gKi9cclxuWmxpYi5aaXAuRmlsZUhlYWRlclNpZ25hdHVyZSA9IFsweDUwLCAweDRiLCAweDAxLCAweDAyXTtcclxuXHJcbi8qKlxyXG4gKiBAdHlwZSB7QXJyYXkuPG51bWJlcj59XHJcbiAqIEBjb25zdFxyXG4gKi9cclxuWmxpYi5aaXAuTG9jYWxGaWxlSGVhZGVyU2lnbmF0dXJlID0gWzB4NTAsIDB4NGIsIDB4MDMsIDB4MDRdO1xyXG5cclxuLyoqXHJcbiAqIEB0eXBlIHtBcnJheS48bnVtYmVyPn1cclxuICogQGNvbnN0XHJcbiAqL1xyXG5abGliLlppcC5DZW50cmFsRGlyZWN0b3J5U2lnbmF0dXJlID0gWzB4NTAsIDB4NGIsIDB4MDUsIDB4MDZdO1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7QXJyYXkuPG51bWJlcj58VWludDhBcnJheX0gaW5wdXRcclxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfcGFyYW1zIG9wdGlvbnMuXHJcbiAqL1xyXG5abGliLlppcC5wcm90b3R5cGUuYWRkRmlsZSA9IGZ1bmN0aW9uKGlucHV0LCBvcHRfcGFyYW1zKSB7XHJcbiAgb3B0X3BhcmFtcyA9IG9wdF9wYXJhbXMgfHwge307XHJcbiAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXHJcbiAgdmFyIGZpbGVuYW1lID0gJycgfHwgb3B0X3BhcmFtc1snZmlsZW5hbWUnXTtcclxuICAvKiogQHR5cGUge2Jvb2xlYW59ICovXHJcbiAgdmFyIGNvbXByZXNzZWQ7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIHNpemUgPSBpbnB1dC5sZW5ndGg7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIGNyYzMyID0gMDtcclxuXHJcbiAgaWYgKFVTRV9UWVBFREFSUkFZICYmIGlucHV0IGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgIGlucHV0ID0gbmV3IFVpbnQ4QXJyYXkoaW5wdXQpO1xyXG4gIH1cclxuXHJcbiAgLy8gZGVmYXVsdFxyXG4gIGlmICh0eXBlb2Ygb3B0X3BhcmFtc1snY29tcHJlc3Npb25NZXRob2QnXSAhPT0gJ251bWJlcicpIHtcclxuICAgIG9wdF9wYXJhbXNbJ2NvbXByZXNzaW9uTWV0aG9kJ10gPSBabGliLlppcC5Db21wcmVzc2lvbk1ldGhvZC5ERUZMQVRFO1xyXG4gIH1cclxuXHJcbiAgLy8g44Gd44Gu5aC044Gn5Zyn57iu44GZ44KL5aC05ZCIXHJcbiAgaWYgKG9wdF9wYXJhbXNbJ2NvbXByZXNzJ10pIHtcclxuICAgIHN3aXRjaCAob3B0X3BhcmFtc1snY29tcHJlc3Npb25NZXRob2QnXSkge1xyXG4gICAgICBjYXNlIFpsaWIuWmlwLkNvbXByZXNzaW9uTWV0aG9kLlNUT1JFOlxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFpsaWIuWmlwLkNvbXByZXNzaW9uTWV0aG9kLkRFRkxBVEU6XHJcbiAgICAgICAgY3JjMzIgPSBabGliLkNSQzMyLmNhbGMoaW5wdXQpO1xyXG4gICAgICAgIGlucHV0ID0gdGhpcy5kZWZsYXRlV2l0aE9wdGlvbihpbnB1dCwgb3B0X3BhcmFtcyk7XHJcbiAgICAgICAgY29tcHJlc3NlZCA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmtub3duIGNvbXByZXNzaW9uIG1ldGhvZDonICsgb3B0X3BhcmFtc1snY29tcHJlc3Npb25NZXRob2QnXSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB0aGlzLmZpbGVzLnB1c2goe1xyXG4gICAgYnVmZmVyOiBpbnB1dCxcclxuICAgIG9wdGlvbjogb3B0X3BhcmFtcyxcclxuICAgIGNvbXByZXNzZWQ6IGNvbXByZXNzZWQsXHJcbiAgICBlbmNyeXB0ZWQ6IGZhbHNlLFxyXG4gICAgc2l6ZTogc2l6ZSxcclxuICAgIGNyYzMyOiBjcmMzMlxyXG4gIH0pO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7KEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBwYXNzd29yZFxyXG4gKi9cclxuWmxpYi5aaXAucHJvdG90eXBlLnNldFBhc3N3b3JkID0gZnVuY3Rpb24ocGFzc3dvcmQpIHtcclxuICB0aGlzLnBhc3N3b3JkID0gcGFzc3dvcmQ7XHJcbn07XHJcblxyXG5abGliLlppcC5wcm90b3R5cGUuY29tcHJlc3MgPSBmdW5jdGlvbigpIHtcclxuICAvKiogQHR5cGUge0FycmF5Ljx7XHJcbiAgICogICBidWZmZXI6ICEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSksXHJcbiAgICogICBvcHRpb246IE9iamVjdCxcclxuICAgKiAgIGNvbXByZXNzZWQ6IGJvb2xlYW4sXHJcbiAgICogICBlbmNyeXB0ZWQ6IGJvb2xlYW4sXHJcbiAgICogICBzaXplOiBudW1iZXIsXHJcbiAgICogICBjcmMzMjogbnVtYmVyXHJcbiAgICogfT59ICovXHJcbiAgdmFyIGZpbGVzID0gdGhpcy5maWxlcztcclxuICAvKiogQHR5cGUge3tcclxuICAgKiAgIGJ1ZmZlcjogIShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KSxcclxuICAgKiAgIG9wdGlvbjogT2JqZWN0LFxyXG4gICAqICAgY29tcHJlc3NlZDogYm9vbGVhbixcclxuICAgKiAgIGVuY3J5cHRlZDogYm9vbGVhbixcclxuICAgKiAgIHNpemU6IG51bWJlcixcclxuICAgKiAgIGNyYzMyOiBudW1iZXJcclxuICAgKiB9fSAqL1xyXG4gIHZhciBmaWxlO1xyXG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cclxuICB2YXIgb3V0cHV0O1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBvcDE7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIG9wMjtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgb3AzO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBsb2NhbEZpbGVTaXplID0gMDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgY2VudHJhbERpcmVjdG9yeVNpemUgPSAwO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBlbmRPZkNlbnRyYWxEaXJlY3RvcnlTaXplO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBvZmZzZXQ7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIG5lZWRWZXJzaW9uO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBmbGFncztcclxuICAvKiogQHR5cGUge1psaWIuWmlwLkNvbXByZXNzaW9uTWV0aG9kfSAqL1xyXG4gIHZhciBjb21wcmVzc2lvbk1ldGhvZDtcclxuICAvKiogQHR5cGUge0RhdGV9ICovXHJcbiAgdmFyIGRhdGU7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIGNyYzMyO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBzaXplO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBwbGFpblNpemU7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIGZpbGVuYW1lTGVuZ3RoO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBleHRyYUZpZWxkTGVuZ3RoO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBjb21tZW50TGVuZ3RoO1xyXG4gIC8qKiBAdHlwZSB7KEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xyXG4gIHZhciBmaWxlbmFtZTtcclxuICAvKiogQHR5cGUgeyhBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cclxuICB2YXIgZXh0cmFGaWVsZDtcclxuICAvKiogQHR5cGUgeyhBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cclxuICB2YXIgY29tbWVudDtcclxuICAvKiogQHR5cGUgeyhBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cclxuICB2YXIgYnVmZmVyO1xyXG4gIC8qKiBAdHlwZSB7Kn0gKi9cclxuICB2YXIgdG1wO1xyXG4gIC8qKiBAdHlwZSB7QXJyYXkuPG51bWJlcj58VWludDMyQXJyYXl8T2JqZWN0fSAqL1xyXG4gIHZhciBrZXk7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIGk7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIGlsO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBqO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBqbDtcclxuXHJcbiAgLy8g44OV44Kh44Kk44Or44Gu5Zyn57iuXHJcbiAgZm9yIChpID0gMCwgaWwgPSBmaWxlcy5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XHJcbiAgICBmaWxlID0gZmlsZXNbaV07XHJcbiAgICBmaWxlbmFtZUxlbmd0aCA9XHJcbiAgICAgIChmaWxlLm9wdGlvblsnZmlsZW5hbWUnXSkgPyBmaWxlLm9wdGlvblsnZmlsZW5hbWUnXS5sZW5ndGggOiAwO1xyXG4gICAgZXh0cmFGaWVsZExlbmd0aCA9XHJcbiAgICAgIChmaWxlLm9wdGlvblsnZXh0cmFGaWVsZCddKSA/IGZpbGUub3B0aW9uWydleHRyYUZpZWxkJ10ubGVuZ3RoIDogMDtcclxuICAgIGNvbW1lbnRMZW5ndGggPVxyXG4gICAgICAoZmlsZS5vcHRpb25bJ2NvbW1lbnQnXSkgPyBmaWxlLm9wdGlvblsnY29tbWVudCddLmxlbmd0aCA6IDA7XHJcblxyXG4gICAgLy8g5Zyn57iu44GV44KM44Gm44GE44Gq44GL44Gj44Gf44KJ5Zyn57iuXHJcbiAgICBpZiAoIWZpbGUuY29tcHJlc3NlZCkge1xyXG4gICAgICAvLyDlnKfnuK7liY3jgasgQ1JDMzIg44Gu6KiI566X44KS44GX44Gm44GK44GPXHJcbiAgICAgIGZpbGUuY3JjMzIgPSBabGliLkNSQzMyLmNhbGMoZmlsZS5idWZmZXIpO1xyXG5cclxuICAgICAgc3dpdGNoIChmaWxlLm9wdGlvblsnY29tcHJlc3Npb25NZXRob2QnXSkge1xyXG4gICAgICAgIGNhc2UgWmxpYi5aaXAuQ29tcHJlc3Npb25NZXRob2QuU1RPUkU6XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFpsaWIuWmlwLkNvbXByZXNzaW9uTWV0aG9kLkRFRkxBVEU6XHJcbiAgICAgICAgICBmaWxlLmJ1ZmZlciA9IHRoaXMuZGVmbGF0ZVdpdGhPcHRpb24oZmlsZS5idWZmZXIsIGZpbGUub3B0aW9uKTtcclxuICAgICAgICAgIGZpbGUuY29tcHJlc3NlZCA9IHRydWU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmtub3duIGNvbXByZXNzaW9uIG1ldGhvZDonICsgZmlsZS5vcHRpb25bJ2NvbXByZXNzaW9uTWV0aG9kJ10pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZW5jcnlwdGlvblxyXG4gICAgaWYgKGZpbGUub3B0aW9uWydwYXNzd29yZCddICE9PSB2b2lkIDB8fCB0aGlzLnBhc3N3b3JkICE9PSB2b2lkIDApIHtcclxuICAgICAgLy8gaW5pdCBlbmNyeXB0aW9uXHJcbiAgICAgIGtleSA9IHRoaXMuY3JlYXRlRW5jcnlwdGlvbktleShmaWxlLm9wdGlvblsncGFzc3dvcmQnXSB8fCB0aGlzLnBhc3N3b3JkKTtcclxuXHJcbiAgICAgIC8vIGFkZCBoZWFkZXJcclxuICAgICAgYnVmZmVyID0gZmlsZS5idWZmZXI7XHJcbiAgICAgIGlmIChVU0VfVFlQRURBUlJBWSkge1xyXG4gICAgICAgIHRtcCA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlci5sZW5ndGggKyAxMik7XHJcbiAgICAgICAgdG1wLnNldChidWZmZXIsIDEyKTtcclxuICAgICAgICBidWZmZXIgPSB0bXA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYnVmZmVyLnVuc2hpZnQoMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAoaiA9IDA7IGogPCAxMjsgKytqKSB7XHJcbiAgICAgICAgYnVmZmVyW2pdID0gdGhpcy5lbmNvZGUoXHJcbiAgICAgICAgICBrZXksXHJcbiAgICAgICAgICBpID09PSAxMSA/IChmaWxlLmNyYzMyICYgMHhmZikgOiAoTWF0aC5yYW5kb20oKSAqIDI1NiB8IDApXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gZGF0YSBlbmNyeXB0aW9uXHJcbiAgICAgIGZvciAoamwgPSBidWZmZXIubGVuZ3RoOyBqIDwgamw7ICsraikge1xyXG4gICAgICAgIGJ1ZmZlcltqXSA9IHRoaXMuZW5jb2RlKGtleSwgYnVmZmVyW2pdKTtcclxuICAgICAgfVxyXG4gICAgICBmaWxlLmJ1ZmZlciA9IGJ1ZmZlcjtcclxuICAgIH1cclxuXHJcbiAgICAvLyDlv4XopoHjg5Djg4Pjg5XjgqHjgrXjgqTjgrrjga7oqIjnrpdcclxuICAgIGxvY2FsRmlsZVNpemUgKz1cclxuICAgICAgLy8gbG9jYWwgZmlsZSBoZWFkZXJcclxuICAgICAgMzAgKyBmaWxlbmFtZUxlbmd0aCArXHJcbiAgICAgIC8vIGZpbGUgZGF0YVxyXG4gICAgICBmaWxlLmJ1ZmZlci5sZW5ndGg7XHJcblxyXG4gICAgY2VudHJhbERpcmVjdG9yeVNpemUgKz1cclxuICAgICAgLy8gZmlsZSBoZWFkZXJcclxuICAgICAgNDYgKyBmaWxlbmFtZUxlbmd0aCArIGNvbW1lbnRMZW5ndGg7XHJcbiAgfVxyXG5cclxuICAvLyBlbmQgb2YgY2VudHJhbCBkaXJlY3RvcnlcclxuICBlbmRPZkNlbnRyYWxEaXJlY3RvcnlTaXplID0gNDYgKyAodGhpcy5jb21tZW50ID8gdGhpcy5jb21tZW50Lmxlbmd0aCA6IDApO1xyXG4gIG91dHB1dCA9IG5ldyAoVVNFX1RZUEVEQVJSQVkgPyBVaW50OEFycmF5IDogQXJyYXkpKFxyXG4gICAgbG9jYWxGaWxlU2l6ZSArIGNlbnRyYWxEaXJlY3RvcnlTaXplICsgZW5kT2ZDZW50cmFsRGlyZWN0b3J5U2l6ZVxyXG4gICk7XHJcbiAgb3AxID0gMDtcclxuICBvcDIgPSBsb2NhbEZpbGVTaXplO1xyXG4gIG9wMyA9IG9wMiArIGNlbnRyYWxEaXJlY3RvcnlTaXplO1xyXG5cclxuICAvLyDjg5XjgqHjgqTjg6vjga7lnKfnuK5cclxuICBmb3IgKGkgPSAwLCBpbCA9IGZpbGVzLmxlbmd0aDsgaSA8IGlsOyArK2kpIHtcclxuICAgIGZpbGUgPSBmaWxlc1tpXTtcclxuICAgIGZpbGVuYW1lTGVuZ3RoID1cclxuICAgICAgZmlsZS5vcHRpb25bJ2ZpbGVuYW1lJ10gPyBmaWxlLm9wdGlvblsnZmlsZW5hbWUnXS5sZW5ndGggOiAgMDtcclxuICAgIGV4dHJhRmllbGRMZW5ndGggPSAwOyAvLyBUT0RPXHJcbiAgICBjb21tZW50TGVuZ3RoID1cclxuICAgICAgZmlsZS5vcHRpb25bJ2NvbW1lbnQnXSA/IGZpbGUub3B0aW9uWydjb21tZW50J10ubGVuZ3RoIDogMDtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIGxvY2FsIGZpbGUgaGVhZGVyICYgZmlsZSBoZWFkZXJcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG9mZnNldCA9IG9wMTtcclxuXHJcbiAgICAvLyBzaWduYXR1cmVcclxuICAgIC8vIGxvY2FsIGZpbGUgaGVhZGVyXHJcbiAgICBvdXRwdXRbb3AxKytdID0gWmxpYi5aaXAuTG9jYWxGaWxlSGVhZGVyU2lnbmF0dXJlWzBdO1xyXG4gICAgb3V0cHV0W29wMSsrXSA9IFpsaWIuWmlwLkxvY2FsRmlsZUhlYWRlclNpZ25hdHVyZVsxXTtcclxuICAgIG91dHB1dFtvcDErK10gPSBabGliLlppcC5Mb2NhbEZpbGVIZWFkZXJTaWduYXR1cmVbMl07XHJcbiAgICBvdXRwdXRbb3AxKytdID0gWmxpYi5aaXAuTG9jYWxGaWxlSGVhZGVyU2lnbmF0dXJlWzNdO1xyXG4gICAgLy8gZmlsZSBoZWFkZXJcclxuICAgIG91dHB1dFtvcDIrK10gPSBabGliLlppcC5GaWxlSGVhZGVyU2lnbmF0dXJlWzBdO1xyXG4gICAgb3V0cHV0W29wMisrXSA9IFpsaWIuWmlwLkZpbGVIZWFkZXJTaWduYXR1cmVbMV07XHJcbiAgICBvdXRwdXRbb3AyKytdID0gWmxpYi5aaXAuRmlsZUhlYWRlclNpZ25hdHVyZVsyXTtcclxuICAgIG91dHB1dFtvcDIrK10gPSBabGliLlppcC5GaWxlSGVhZGVyU2lnbmF0dXJlWzNdO1xyXG5cclxuICAgIC8vIGNvbXByZXNzb3IgaW5mb1xyXG4gICAgbmVlZFZlcnNpb24gPSAyMDtcclxuICAgIG91dHB1dFtvcDIrK10gPSBuZWVkVmVyc2lvbiAmIDB4ZmY7XHJcbiAgICBvdXRwdXRbb3AyKytdID1cclxuICAgICAgLyoqIEB0eXBlIHtabGliLlppcC5PcGVyYXRpbmdTeXN0ZW19ICovXHJcbiAgICAgIChmaWxlLm9wdGlvblsnb3MnXSkgfHxcclxuICAgICAgWmxpYi5aaXAuT3BlcmF0aW5nU3lzdGVtLk1TRE9TO1xyXG5cclxuICAgIC8vIG5lZWQgdmVyc2lvblxyXG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAgbmVlZFZlcnNpb24gICAgICAgJiAweGZmO1xyXG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAobmVlZFZlcnNpb24gPj4gOCkgJiAweGZmO1xyXG5cclxuICAgIC8vIGdlbmVyYWwgcHVycG9zZSBiaXQgZmxhZ1xyXG4gICAgZmxhZ3MgPSAwO1xyXG4gICAgaWYgKGZpbGUub3B0aW9uWydwYXNzd29yZCddIHx8IHRoaXMucGFzc3dvcmQpIHtcclxuICAgICAgZmxhZ3MgfD0gWmxpYi5aaXAuRmxhZ3MuRU5DUllQVDtcclxuICAgIH1cclxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gIGZsYWdzICAgICAgICYgMHhmZjtcclxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gKGZsYWdzID4+IDgpICYgMHhmZjtcclxuXHJcbiAgICAvLyBjb21wcmVzc2lvbiBtZXRob2RcclxuICAgIGNvbXByZXNzaW9uTWV0aG9kID1cclxuICAgICAgLyoqIEB0eXBlIHtabGliLlppcC5Db21wcmVzc2lvbk1ldGhvZH0gKi9cclxuICAgICAgKGZpbGUub3B0aW9uWydjb21wcmVzc2lvbk1ldGhvZCddKTtcclxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gIGNvbXByZXNzaW9uTWV0aG9kICAgICAgICYgMHhmZjtcclxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gKGNvbXByZXNzaW9uTWV0aG9kID4+IDgpICYgMHhmZjtcclxuXHJcbiAgICAvLyBkYXRlXHJcbiAgICBkYXRlID0gLyoqIEB0eXBlIHsoRGF0ZXx1bmRlZmluZWQpfSAqLyhmaWxlLm9wdGlvblsnZGF0ZSddKSB8fCBuZXcgRGF0ZSgpO1xyXG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPVxyXG4gICAgICAoKGRhdGUuZ2V0TWludXRlcygpICYgMHg3KSA8PCA1KSB8XHJcbiAgICAgIChkYXRlLmdldFNlY29uZHMoKSAvIDIgfCAwKTtcclxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID1cclxuICAgICAgKGRhdGUuZ2V0SG91cnMoKSAgIDw8IDMpIHxcclxuICAgICAgKGRhdGUuZ2V0TWludXRlcygpID4+IDMpO1xyXG4gICAgLy9cclxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID1cclxuICAgICAgKChkYXRlLmdldE1vbnRoKCkgKyAxICYgMHg3KSA8PCA1KSB8XHJcbiAgICAgIChkYXRlLmdldERhdGUoKSk7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9XHJcbiAgICAgICgoZGF0ZS5nZXRGdWxsWWVhcigpIC0gMTk4MCAmIDB4N2YpIDw8IDEpIHxcclxuICAgICAgKGRhdGUuZ2V0TW9udGgoKSArIDEgPj4gMyk7XHJcblxyXG4gICAgLy8gQ1JDLTMyXHJcbiAgICBjcmMzMiA9IGZpbGUuY3JjMzI7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9ICBjcmMzMiAgICAgICAgJiAweGZmO1xyXG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAoY3JjMzIgPj4gIDgpICYgMHhmZjtcclxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gKGNyYzMyID4+IDE2KSAmIDB4ZmY7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9IChjcmMzMiA+PiAyNCkgJiAweGZmO1xyXG5cclxuICAgIC8vIGNvbXByZXNzZWQgc2l6ZVxyXG4gICAgc2l6ZSA9IGZpbGUuYnVmZmVyLmxlbmd0aDtcclxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gIHNpemUgICAgICAgICYgMHhmZjtcclxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gKHNpemUgPj4gIDgpICYgMHhmZjtcclxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gKHNpemUgPj4gMTYpICYgMHhmZjtcclxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gKHNpemUgPj4gMjQpICYgMHhmZjtcclxuXHJcbiAgICAvLyB1bmNvbXByZXNzZWQgc2l6ZVxyXG4gICAgcGxhaW5TaXplID0gZmlsZS5zaXplO1xyXG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAgcGxhaW5TaXplICAgICAgICAmIDB4ZmY7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9IChwbGFpblNpemUgPj4gIDgpICYgMHhmZjtcclxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gKHBsYWluU2l6ZSA+PiAxNikgJiAweGZmO1xyXG4gICAgb3V0cHV0W29wMSsrXSA9IG91dHB1dFtvcDIrK10gPSAocGxhaW5TaXplID4+IDI0KSAmIDB4ZmY7XHJcblxyXG4gICAgLy8gZmlsZW5hbWUgbGVuZ3RoXHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9ICBmaWxlbmFtZUxlbmd0aCAgICAgICAmIDB4ZmY7XHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9IChmaWxlbmFtZUxlbmd0aCA+PiA4KSAmIDB4ZmY7XHJcblxyXG4gICAgLy8gZXh0cmEgZmllbGQgbGVuZ3RoXHJcbiAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9ICBleHRyYUZpZWxkTGVuZ3RoICAgICAgICYgMHhmZjtcclxuICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gKGV4dHJhRmllbGRMZW5ndGggPj4gOCkgJiAweGZmO1xyXG5cclxuICAgIC8vIGZpbGUgY29tbWVudCBsZW5ndGhcclxuICAgIG91dHB1dFtvcDIrK10gPSAgY29tbWVudExlbmd0aCAgICAgICAmIDB4ZmY7XHJcbiAgICBvdXRwdXRbb3AyKytdID0gKGNvbW1lbnRMZW5ndGggPj4gOCkgJiAweGZmO1xyXG5cclxuICAgIC8vIGRpc2sgbnVtYmVyIHN0YXJ0XHJcbiAgICBvdXRwdXRbb3AyKytdID0gMDtcclxuICAgIG91dHB1dFtvcDIrK10gPSAwO1xyXG5cclxuICAgIC8vIGludGVybmFsIGZpbGUgYXR0cmlidXRlc1xyXG4gICAgb3V0cHV0W29wMisrXSA9IDA7XHJcbiAgICBvdXRwdXRbb3AyKytdID0gMDtcclxuXHJcbiAgICAvLyBleHRlcm5hbCBmaWxlIGF0dHJpYnV0ZXNcclxuICAgIG91dHB1dFtvcDIrK10gPSAwO1xyXG4gICAgb3V0cHV0W29wMisrXSA9IDA7XHJcbiAgICBvdXRwdXRbb3AyKytdID0gMDtcclxuICAgIG91dHB1dFtvcDIrK10gPSAwO1xyXG5cclxuICAgIC8vIHJlbGF0aXZlIG9mZnNldCBvZiBsb2NhbCBoZWFkZXJcclxuICAgIG91dHB1dFtvcDIrK10gPSAgb2Zmc2V0ICAgICAgICAmIDB4ZmY7XHJcbiAgICBvdXRwdXRbb3AyKytdID0gKG9mZnNldCA+PiAgOCkgJiAweGZmO1xyXG4gICAgb3V0cHV0W29wMisrXSA9IChvZmZzZXQgPj4gMTYpICYgMHhmZjtcclxuICAgIG91dHB1dFtvcDIrK10gPSAob2Zmc2V0ID4+IDI0KSAmIDB4ZmY7XHJcblxyXG4gICAgLy8gZmlsZW5hbWVcclxuICAgIGZpbGVuYW1lID0gZmlsZS5vcHRpb25bJ2ZpbGVuYW1lJ107XHJcbiAgICBpZiAoZmlsZW5hbWUpIHtcclxuICAgICAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XHJcbiAgICAgICAgb3V0cHV0LnNldChmaWxlbmFtZSwgb3AxKTtcclxuICAgICAgICBvdXRwdXQuc2V0KGZpbGVuYW1lLCBvcDIpO1xyXG4gICAgICAgIG9wMSArPSBmaWxlbmFtZUxlbmd0aDtcclxuICAgICAgICBvcDIgKz0gZmlsZW5hbWVMZW5ndGg7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IGZpbGVuYW1lTGVuZ3RoOyArK2opIHtcclxuICAgICAgICAgIG91dHB1dFtvcDErK10gPSBvdXRwdXRbb3AyKytdID0gZmlsZW5hbWVbal07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZXh0cmEgZmllbGRcclxuICAgIGV4dHJhRmllbGQgPSBmaWxlLm9wdGlvblsnZXh0cmFGaWVsZCddO1xyXG4gICAgaWYgKGV4dHJhRmllbGQpIHtcclxuICAgICAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XHJcbiAgICAgICAgb3V0cHV0LnNldChleHRyYUZpZWxkLCBvcDEpO1xyXG4gICAgICAgIG91dHB1dC5zZXQoZXh0cmFGaWVsZCwgb3AyKTtcclxuICAgICAgICBvcDEgKz0gZXh0cmFGaWVsZExlbmd0aDtcclxuICAgICAgICBvcDIgKz0gZXh0cmFGaWVsZExlbmd0aDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBmb3IgKGogPSAwOyBqIDwgY29tbWVudExlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgICBvdXRwdXRbb3AxKytdID0gb3V0cHV0W29wMisrXSA9IGV4dHJhRmllbGRbal07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY29tbWVudFxyXG4gICAgY29tbWVudCA9IGZpbGUub3B0aW9uWydjb21tZW50J107XHJcbiAgICBpZiAoY29tbWVudCkge1xyXG4gICAgICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcclxuICAgICAgICBvdXRwdXQuc2V0KGNvbW1lbnQsIG9wMik7XHJcbiAgICAgICAgb3AyICs9IGNvbW1lbnRMZW5ndGg7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IGNvbW1lbnRMZW5ndGg7ICsraikge1xyXG4gICAgICAgICAgb3V0cHV0W29wMisrXSA9IGNvbW1lbnRbal07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBmaWxlIGRhdGFcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGlmIChVU0VfVFlQRURBUlJBWSkge1xyXG4gICAgICBvdXRwdXQuc2V0KGZpbGUuYnVmZmVyLCBvcDEpO1xyXG4gICAgICBvcDEgKz0gZmlsZS5idWZmZXIubGVuZ3RoO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZm9yIChqID0gMCwgamwgPSBmaWxlLmJ1ZmZlci5sZW5ndGg7IGogPCBqbDsgKytqKSB7XHJcbiAgICAgICAgb3V0cHV0W29wMSsrXSA9IGZpbGUuYnVmZmVyW2pdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBlbmQgb2YgY2VudHJhbCBkaXJlY3RvcnlcclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgLy8gc2lnbmF0dXJlXHJcbiAgb3V0cHV0W29wMysrXSA9IFpsaWIuWmlwLkNlbnRyYWxEaXJlY3RvcnlTaWduYXR1cmVbMF07XHJcbiAgb3V0cHV0W29wMysrXSA9IFpsaWIuWmlwLkNlbnRyYWxEaXJlY3RvcnlTaWduYXR1cmVbMV07XHJcbiAgb3V0cHV0W29wMysrXSA9IFpsaWIuWmlwLkNlbnRyYWxEaXJlY3RvcnlTaWduYXR1cmVbMl07XHJcbiAgb3V0cHV0W29wMysrXSA9IFpsaWIuWmlwLkNlbnRyYWxEaXJlY3RvcnlTaWduYXR1cmVbM107XHJcblxyXG4gIC8vIG51bWJlciBvZiB0aGlzIGRpc2tcclxuICBvdXRwdXRbb3AzKytdID0gMDtcclxuICBvdXRwdXRbb3AzKytdID0gMDtcclxuXHJcbiAgLy8gbnVtYmVyIG9mIHRoZSBkaXNrIHdpdGggdGhlIHN0YXJ0IG9mIHRoZSBjZW50cmFsIGRpcmVjdG9yeVxyXG4gIG91dHB1dFtvcDMrK10gPSAwO1xyXG4gIG91dHB1dFtvcDMrK10gPSAwO1xyXG5cclxuICAvLyB0b3RhbCBudW1iZXIgb2YgZW50cmllcyBpbiB0aGUgY2VudHJhbCBkaXJlY3Rvcnkgb24gdGhpcyBkaXNrXHJcbiAgb3V0cHV0W29wMysrXSA9ICBpbCAgICAgICAmIDB4ZmY7XHJcbiAgb3V0cHV0W29wMysrXSA9IChpbCA+PiA4KSAmIDB4ZmY7XHJcblxyXG4gIC8vIHRvdGFsIG51bWJlciBvZiBlbnRyaWVzIGluIHRoZSBjZW50cmFsIGRpcmVjdG9yeVxyXG4gIG91dHB1dFtvcDMrK10gPSAgaWwgICAgICAgJiAweGZmO1xyXG4gIG91dHB1dFtvcDMrK10gPSAoaWwgPj4gOCkgJiAweGZmO1xyXG5cclxuICAvLyBzaXplIG9mIHRoZSBjZW50cmFsIGRpcmVjdG9yeVxyXG4gIG91dHB1dFtvcDMrK10gPSAgY2VudHJhbERpcmVjdG9yeVNpemUgICAgICAgICYgMHhmZjtcclxuICBvdXRwdXRbb3AzKytdID0gKGNlbnRyYWxEaXJlY3RvcnlTaXplID4+ICA4KSAmIDB4ZmY7XHJcbiAgb3V0cHV0W29wMysrXSA9IChjZW50cmFsRGlyZWN0b3J5U2l6ZSA+PiAxNikgJiAweGZmO1xyXG4gIG91dHB1dFtvcDMrK10gPSAoY2VudHJhbERpcmVjdG9yeVNpemUgPj4gMjQpICYgMHhmZjtcclxuXHJcbiAgLy8gb2Zmc2V0IG9mIHN0YXJ0IG9mIGNlbnRyYWwgZGlyZWN0b3J5IHdpdGggcmVzcGVjdCB0byB0aGUgc3RhcnRpbmcgZGlzayBudW1iZXJcclxuICBvdXRwdXRbb3AzKytdID0gIGxvY2FsRmlsZVNpemUgICAgICAgICYgMHhmZjtcclxuICBvdXRwdXRbb3AzKytdID0gKGxvY2FsRmlsZVNpemUgPj4gIDgpICYgMHhmZjtcclxuICBvdXRwdXRbb3AzKytdID0gKGxvY2FsRmlsZVNpemUgPj4gMTYpICYgMHhmZjtcclxuICBvdXRwdXRbb3AzKytdID0gKGxvY2FsRmlsZVNpemUgPj4gMjQpICYgMHhmZjtcclxuXHJcbiAgLy8gLlpJUCBmaWxlIGNvbW1lbnQgbGVuZ3RoXHJcbiAgY29tbWVudExlbmd0aCA9IHRoaXMuY29tbWVudCA/IHRoaXMuY29tbWVudC5sZW5ndGggOiAwO1xyXG4gIG91dHB1dFtvcDMrK10gPSAgY29tbWVudExlbmd0aCAgICAgICAmIDB4ZmY7XHJcbiAgb3V0cHV0W29wMysrXSA9IChjb21tZW50TGVuZ3RoID4+IDgpICYgMHhmZjtcclxuXHJcbiAgLy8gLlpJUCBmaWxlIGNvbW1lbnRcclxuICBpZiAodGhpcy5jb21tZW50KSB7XHJcbiAgICBpZiAoVVNFX1RZUEVEQVJSQVkpIHtcclxuICAgICAgb3V0cHV0LnNldCh0aGlzLmNvbW1lbnQsIG9wMyk7XHJcbiAgICAgIG9wMyArPSBjb21tZW50TGVuZ3RoO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZm9yIChqID0gMCwgamwgPSBjb21tZW50TGVuZ3RoOyBqIDwgamw7ICsraikge1xyXG4gICAgICAgIG91dHB1dFtvcDMrK10gPSB0aGlzLmNvbW1lbnRbal07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBvdXRwdXQ7XHJcbn07XHJcblxyXG4vKipcclxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBpbnB1dFxyXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF9wYXJhbXMgb3B0aW9ucy5cclxuICogQHJldHVybiB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX1cclxuICovXHJcblpsaWIuWmlwLnByb3RvdHlwZS5kZWZsYXRlV2l0aE9wdGlvbiA9IGZ1bmN0aW9uKGlucHV0LCBvcHRfcGFyYW1zKSB7XHJcbiAgLyoqIEB0eXBlIHtabGliLlJhd0RlZmxhdGV9ICovXHJcbiAgdmFyIGRlZmxhdG9yID0gbmV3IFpsaWIuUmF3RGVmbGF0ZShpbnB1dCwgb3B0X3BhcmFtc1snZGVmbGF0ZU9wdGlvbiddKTtcclxuXHJcbiAgcmV0dXJuIGRlZmxhdG9yLmNvbXByZXNzKCk7XHJcbn07XHJcblxyXG4vKipcclxuICogQHBhcmFtIHsoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXkpfSBrZXlcclxuICogQHJldHVybiB7bnVtYmVyfVxyXG4gKi9cclxuWmxpYi5aaXAucHJvdG90eXBlLmdldEJ5dGUgPSBmdW5jdGlvbihrZXkpIHtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgdG1wID0gKChrZXlbMl0gJiAweGZmZmYpIHwgMik7XHJcblxyXG4gIHJldHVybiAoKHRtcCAqICh0bXAgXiAxKSkgPj4gOCkgJiAweGZmO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7KEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5fE9iamVjdCl9IGtleVxyXG4gKiBAcGFyYW0ge251bWJlcn0gblxyXG4gKiBAcmV0dXJuIHtudW1iZXJ9XHJcbiAqL1xyXG5abGliLlppcC5wcm90b3R5cGUuZW5jb2RlID0gZnVuY3Rpb24oa2V5LCBuKSB7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIHRtcCA9IHRoaXMuZ2V0Qnl0ZSgvKiogQHR5cGUgeyhBcnJheS48bnVtYmVyPnxVaW50MzJBcnJheSl9ICovKGtleSkpO1xyXG5cclxuICB0aGlzLnVwZGF0ZUtleXMoLyoqIEB0eXBlIHsoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXkpfSAqLyhrZXkpLCBuKTtcclxuXHJcbiAgcmV0dXJuIHRtcCBeIG47XHJcbn07XHJcblxyXG4vKipcclxuICogQHBhcmFtIHsoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXkpfSBrZXlcclxuICogQHBhcmFtIHtudW1iZXJ9IG5cclxuICovXHJcblpsaWIuWmlwLnByb3RvdHlwZS51cGRhdGVLZXlzID0gZnVuY3Rpb24oa2V5LCBuKSB7XHJcbiAga2V5WzBdID0gWmxpYi5DUkMzMi5zaW5nbGUoa2V5WzBdLCBuKTtcclxuICBrZXlbMV0gPVxyXG4gICAgKCgoKChrZXlbMV0gKyAoa2V5WzBdICYgMHhmZikpICogMjAxNzMgPj4+IDApICogNjY4MSkgPj4+IDApICsgMSkgPj4+IDA7XHJcbiAga2V5WzJdID0gWmxpYi5DUkMzMi5zaW5nbGUoa2V5WzJdLCBrZXlbMV0gPj4+IDI0KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0geyhBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gcGFzc3dvcmRcclxuICogQHJldHVybiB7IShBcnJheS48bnVtYmVyPnxVaW50MzJBcnJheXxPYmplY3QpfVxyXG4gKi9cclxuWmxpYi5aaXAucHJvdG90eXBlLmNyZWF0ZUVuY3J5cHRpb25LZXkgPSBmdW5jdGlvbihwYXNzd29yZCkge1xyXG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50MzJBcnJheSl9ICovXHJcbiAgdmFyIGtleSA9IFszMDU0MTk4OTYsIDU5MTc1MTA0OSwgODc4MDgyMTkyXTtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgaTtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgaWw7XHJcblxyXG4gIGlmIChVU0VfVFlQRURBUlJBWSkge1xyXG4gICAga2V5ID0gbmV3IFVpbnQzMkFycmF5KGtleSk7XHJcbiAgfVxyXG5cclxuICBmb3IgKGkgPSAwLCBpbCA9IHBhc3N3b3JkLmxlbmd0aDsgaSA8IGlsOyArK2kpIHtcclxuICAgIHRoaXMudXBkYXRlS2V5cyhrZXksIHBhc3N3b3JkW2ldICYgMHhmZik7XHJcbiAgfVxyXG5cclxuICByZXR1cm4ga2V5O1xyXG59O1xyXG5cclxufSk7IiwiZ29vZy5wcm92aWRlKCdabGliLlVuemlwJyk7XHJcblxyXG5nb29nLnJlcXVpcmUoJ1VTRV9UWVBFREFSUkFZJyk7XHJcbmdvb2cucmVxdWlyZSgnRml4UGhhbnRvbUpTRnVuY3Rpb25BcHBseUJ1Z19TdHJpbmdGcm9tQ2hhckNvZGUnKTtcclxuZ29vZy5yZXF1aXJlKCdabGliLlJhd0luZmxhdGUnKTtcclxuZ29vZy5yZXF1aXJlKCdabGliLkNSQzMyJyk7XHJcbmdvb2cucmVxdWlyZSgnWmxpYi5aaXAnKTtcclxuXHJcbmdvb2cuc2NvcGUoZnVuY3Rpb24oKSB7XHJcblxyXG4vKipcclxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBpbnB1dCBpbnB1dCBidWZmZXIuXHJcbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0X3BhcmFtcyBvcHRpb25zLlxyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcblpsaWIuVW56aXAgPSBmdW5jdGlvbihpbnB1dCwgb3B0X3BhcmFtcykge1xyXG4gIG9wdF9wYXJhbXMgPSBvcHRfcGFyYW1zIHx8IHt9O1xyXG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cclxuICB0aGlzLmlucHV0ID1cclxuICAgIChVU0VfVFlQRURBUlJBWSAmJiAoaW5wdXQgaW5zdGFuY2VvZiBBcnJheSkpID9cclxuICAgIG5ldyBVaW50OEFycmF5KGlucHV0KSA6IGlucHV0O1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMuaXAgPSAwO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMuZW9jZHJPZmZzZXQ7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5udW1iZXJPZlRoaXNEaXNrO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMuc3RhcnREaXNrO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMudG90YWxFbnRyaWVzVGhpc0Rpc2s7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy50b3RhbEVudHJpZXM7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5jZW50cmFsRGlyZWN0b3J5U2l6ZTtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLmNlbnRyYWxEaXJlY3RvcnlPZmZzZXQ7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5jb21tZW50TGVuZ3RoO1xyXG4gIC8qKiBAdHlwZSB7KEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xyXG4gIHRoaXMuY29tbWVudDtcclxuICAvKiogQHR5cGUge0FycmF5LjxabGliLlVuemlwLkZpbGVIZWFkZXI+fSAqL1xyXG4gIHRoaXMuZmlsZUhlYWRlckxpc3Q7XHJcbiAgLyoqIEB0eXBlIHtPYmplY3QuPHN0cmluZywgbnVtYmVyPn0gKi9cclxuICB0aGlzLmZpbGVuYW1lVG9JbmRleDtcclxuICAvKiogQHR5cGUge2Jvb2xlYW59ICovXHJcbiAgdGhpcy52ZXJpZnkgPSBvcHRfcGFyYW1zWyd2ZXJpZnknXSB8fCBmYWxzZTtcclxuICAvKiogQHR5cGUgeyhBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cclxuICB0aGlzLnBhc3N3b3JkID0gb3B0X3BhcmFtc1sncGFzc3dvcmQnXTtcclxufTtcclxuXHJcblpsaWIuVW56aXAuQ29tcHJlc3Npb25NZXRob2QgPSBabGliLlppcC5Db21wcmVzc2lvbk1ldGhvZDtcclxuXHJcbi8qKlxyXG4gKiBAdHlwZSB7QXJyYXkuPG51bWJlcj59XHJcbiAqIEBjb25zdFxyXG4gKi9cclxuWmxpYi5VbnppcC5GaWxlSGVhZGVyU2lnbmF0dXJlID0gWmxpYi5aaXAuRmlsZUhlYWRlclNpZ25hdHVyZTtcclxuXHJcbi8qKlxyXG4gKiBAdHlwZSB7QXJyYXkuPG51bWJlcj59XHJcbiAqIEBjb25zdFxyXG4gKi9cclxuWmxpYi5VbnppcC5Mb2NhbEZpbGVIZWFkZXJTaWduYXR1cmUgPSBabGliLlppcC5Mb2NhbEZpbGVIZWFkZXJTaWduYXR1cmU7XHJcblxyXG4vKipcclxuICogQHR5cGUge0FycmF5LjxudW1iZXI+fVxyXG4gKiBAY29uc3RcclxuICovXHJcblpsaWIuVW56aXAuQ2VudHJhbERpcmVjdG9yeVNpZ25hdHVyZSA9IFpsaWIuWmlwLkNlbnRyYWxEaXJlY3RvcnlTaWduYXR1cmU7XHJcblxyXG4vKipcclxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBpbnB1dCBpbnB1dCBidWZmZXIuXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBpcCBpbnB1dCBwb3NpdGlvbi5cclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5abGliLlVuemlwLkZpbGVIZWFkZXIgPSBmdW5jdGlvbihpbnB1dCwgaXApIHtcclxuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXHJcbiAgdGhpcy5pbnB1dCA9IGlucHV0O1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMub2Zmc2V0ID0gaXA7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5sZW5ndGg7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy52ZXJzaW9uO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMub3M7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5uZWVkVmVyc2lvbjtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLmZsYWdzO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMuY29tcHJlc3Npb247XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy50aW1lO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMuZGF0ZTtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLmNyYzMyO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMuY29tcHJlc3NlZFNpemU7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5wbGFpblNpemU7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5maWxlTmFtZUxlbmd0aDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLmV4dHJhRmllbGRMZW5ndGg7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5maWxlQ29tbWVudExlbmd0aDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLmRpc2tOdW1iZXJTdGFydDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLmludGVybmFsRmlsZUF0dHJpYnV0ZXM7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5leHRlcm5hbEZpbGVBdHRyaWJ1dGVzO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMucmVsYXRpdmVPZmZzZXQ7XHJcbiAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXHJcbiAgdGhpcy5maWxlbmFtZTtcclxuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXHJcbiAgdGhpcy5leHRyYUZpZWxkO1xyXG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cclxuICB0aGlzLmNvbW1lbnQ7XHJcbn07XHJcblxyXG5abGliLlVuemlwLkZpbGVIZWFkZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oKSB7XHJcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xyXG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIGlwID0gdGhpcy5vZmZzZXQ7XHJcblxyXG4gIC8vIGNlbnRyYWwgZmlsZSBoZWFkZXIgc2lnbmF0dXJlXHJcbiAgaWYgKGlucHV0W2lwKytdICE9PSBabGliLlVuemlwLkZpbGVIZWFkZXJTaWduYXR1cmVbMF0gfHxcclxuICAgICAgaW5wdXRbaXArK10gIT09IFpsaWIuVW56aXAuRmlsZUhlYWRlclNpZ25hdHVyZVsxXSB8fFxyXG4gICAgICBpbnB1dFtpcCsrXSAhPT0gWmxpYi5VbnppcC5GaWxlSGVhZGVyU2lnbmF0dXJlWzJdIHx8XHJcbiAgICAgIGlucHV0W2lwKytdICE9PSBabGliLlVuemlwLkZpbGVIZWFkZXJTaWduYXR1cmVbM10pIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBmaWxlIGhlYWRlciBzaWduYXR1cmUnKTtcclxuICB9XHJcblxyXG4gIC8vIHZlcnNpb24gbWFkZSBieVxyXG4gIHRoaXMudmVyc2lvbiA9IGlucHV0W2lwKytdO1xyXG4gIHRoaXMub3MgPSBpbnB1dFtpcCsrXTtcclxuXHJcbiAgLy8gdmVyc2lvbiBuZWVkZWQgdG8gZXh0cmFjdFxyXG4gIHRoaXMubmVlZFZlcnNpb24gPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcclxuXHJcbiAgLy8gZ2VuZXJhbCBwdXJwb3NlIGJpdCBmbGFnXHJcbiAgdGhpcy5mbGFncyA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xyXG5cclxuICAvLyBjb21wcmVzc2lvbiBtZXRob2RcclxuICB0aGlzLmNvbXByZXNzaW9uID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XHJcblxyXG4gIC8vIGxhc3QgbW9kIGZpbGUgdGltZVxyXG4gIHRoaXMudGltZSA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xyXG5cclxuICAvL2xhc3QgbW9kIGZpbGUgZGF0ZVxyXG4gIHRoaXMuZGF0ZSA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xyXG5cclxuICAvLyBjcmMtMzJcclxuICB0aGlzLmNyYzMyID0gKFxyXG4gICAgKGlucHV0W2lwKytdICAgICAgKSB8IChpbnB1dFtpcCsrXSA8PCAgOCkgfFxyXG4gICAgKGlucHV0W2lwKytdIDw8IDE2KSB8IChpbnB1dFtpcCsrXSA8PCAyNClcclxuICApID4+PiAwO1xyXG5cclxuICAvLyBjb21wcmVzc2VkIHNpemVcclxuICB0aGlzLmNvbXByZXNzZWRTaXplID0gKFxyXG4gICAgKGlucHV0W2lwKytdICAgICAgKSB8IChpbnB1dFtpcCsrXSA8PCAgOCkgfFxyXG4gICAgKGlucHV0W2lwKytdIDw8IDE2KSB8IChpbnB1dFtpcCsrXSA8PCAyNClcclxuICApID4+PiAwO1xyXG5cclxuICAvLyB1bmNvbXByZXNzZWQgc2l6ZVxyXG4gIHRoaXMucGxhaW5TaXplID0gKFxyXG4gICAgKGlucHV0W2lwKytdICAgICAgKSB8IChpbnB1dFtpcCsrXSA8PCAgOCkgfFxyXG4gICAgKGlucHV0W2lwKytdIDw8IDE2KSB8IChpbnB1dFtpcCsrXSA8PCAyNClcclxuICApID4+PiAwO1xyXG5cclxuICAvLyBmaWxlIG5hbWUgbGVuZ3RoXHJcbiAgdGhpcy5maWxlTmFtZUxlbmd0aCA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xyXG5cclxuICAvLyBleHRyYSBmaWVsZCBsZW5ndGhcclxuICB0aGlzLmV4dHJhRmllbGRMZW5ndGggPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcclxuXHJcbiAgLy8gZmlsZSBjb21tZW50IGxlbmd0aFxyXG4gIHRoaXMuZmlsZUNvbW1lbnRMZW5ndGggPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcclxuXHJcbiAgLy8gZGlzayBudW1iZXIgc3RhcnRcclxuICB0aGlzLmRpc2tOdW1iZXJTdGFydCA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xyXG5cclxuICAvLyBpbnRlcm5hbCBmaWxlIGF0dHJpYnV0ZXNcclxuICB0aGlzLmludGVybmFsRmlsZUF0dHJpYnV0ZXMgPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcclxuXHJcbiAgLy8gZXh0ZXJuYWwgZmlsZSBhdHRyaWJ1dGVzXHJcbiAgdGhpcy5leHRlcm5hbEZpbGVBdHRyaWJ1dGVzID1cclxuICAgIChpbnB1dFtpcCsrXSAgICAgICkgfCAoaW5wdXRbaXArK10gPDwgIDgpIHxcclxuICAgIChpbnB1dFtpcCsrXSA8PCAxNikgfCAoaW5wdXRbaXArK10gPDwgMjQpO1xyXG5cclxuICAvLyByZWxhdGl2ZSBvZmZzZXQgb2YgbG9jYWwgaGVhZGVyXHJcbiAgdGhpcy5yZWxhdGl2ZU9mZnNldCA9IChcclxuICAgIChpbnB1dFtpcCsrXSAgICAgICkgfCAoaW5wdXRbaXArK10gPDwgIDgpIHxcclxuICAgIChpbnB1dFtpcCsrXSA8PCAxNikgfCAoaW5wdXRbaXArK10gPDwgMjQpXHJcbiAgKSA+Pj4gMDtcclxuXHJcbiAgLy8gZmlsZSBuYW1lXHJcbiAgdGhpcy5maWxlbmFtZSA9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgVVNFX1RZUEVEQVJSQVkgP1xyXG4gICAgaW5wdXQuc3ViYXJyYXkoaXAsIGlwICs9IHRoaXMuZmlsZU5hbWVMZW5ndGgpIDpcclxuICAgIGlucHV0LnNsaWNlKGlwLCBpcCArPSB0aGlzLmZpbGVOYW1lTGVuZ3RoKVxyXG4gICk7XHJcblxyXG4gIC8vIGV4dHJhIGZpZWxkXHJcbiAgdGhpcy5leHRyYUZpZWxkID0gVVNFX1RZUEVEQVJSQVkgP1xyXG4gICAgaW5wdXQuc3ViYXJyYXkoaXAsIGlwICs9IHRoaXMuZXh0cmFGaWVsZExlbmd0aCkgOlxyXG4gICAgaW5wdXQuc2xpY2UoaXAsIGlwICs9IHRoaXMuZXh0cmFGaWVsZExlbmd0aCk7XHJcblxyXG4gIC8vIGZpbGUgY29tbWVudFxyXG4gIHRoaXMuY29tbWVudCA9IFVTRV9UWVBFREFSUkFZID9cclxuICAgIGlucHV0LnN1YmFycmF5KGlwLCBpcCArIHRoaXMuZmlsZUNvbW1lbnRMZW5ndGgpIDpcclxuICAgIGlucHV0LnNsaWNlKGlwLCBpcCArIHRoaXMuZmlsZUNvbW1lbnRMZW5ndGgpO1xyXG5cclxuICB0aGlzLmxlbmd0aCA9IGlwIC0gdGhpcy5vZmZzZXQ7XHJcbn07XHJcblxyXG4vKipcclxuICogQHBhcmFtIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSBpbnB1dCBpbnB1dCBidWZmZXIuXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBpcCBpbnB1dCBwb3NpdGlvbi5cclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5abGliLlVuemlwLkxvY2FsRmlsZUhlYWRlciA9IGZ1bmN0aW9uKGlucHV0LCBpcCkge1xyXG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cclxuICB0aGlzLmlucHV0ID0gaW5wdXQ7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5vZmZzZXQgPSBpcDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLmxlbmd0aDtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLm5lZWRWZXJzaW9uO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMuZmxhZ3M7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5jb21wcmVzc2lvbjtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLnRpbWU7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5kYXRlO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMuY3JjMzI7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdGhpcy5jb21wcmVzc2VkU2l6ZTtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLnBsYWluU2l6ZTtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB0aGlzLmZpbGVOYW1lTGVuZ3RoO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHRoaXMuZXh0cmFGaWVsZExlbmd0aDtcclxuICAvKiogQHR5cGUge3N0cmluZ30gKi9cclxuICB0aGlzLmZpbGVuYW1lO1xyXG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cclxuICB0aGlzLmV4dHJhRmllbGQ7XHJcbn07XHJcblxyXG5abGliLlVuemlwLkxvY2FsRmlsZUhlYWRlci5GbGFncyA9IFpsaWIuWmlwLkZsYWdzO1xyXG5cclxuWmxpYi5VbnppcC5Mb2NhbEZpbGVIZWFkZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oKSB7XHJcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xyXG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIGlwID0gdGhpcy5vZmZzZXQ7XHJcblxyXG4gIC8vIGxvY2FsIGZpbGUgaGVhZGVyIHNpZ25hdHVyZVxyXG4gIGlmIChpbnB1dFtpcCsrXSAhPT0gWmxpYi5VbnppcC5Mb2NhbEZpbGVIZWFkZXJTaWduYXR1cmVbMF0gfHxcclxuICAgICAgaW5wdXRbaXArK10gIT09IFpsaWIuVW56aXAuTG9jYWxGaWxlSGVhZGVyU2lnbmF0dXJlWzFdIHx8XHJcbiAgICAgIGlucHV0W2lwKytdICE9PSBabGliLlVuemlwLkxvY2FsRmlsZUhlYWRlclNpZ25hdHVyZVsyXSB8fFxyXG4gICAgICBpbnB1dFtpcCsrXSAhPT0gWmxpYi5VbnppcC5Mb2NhbEZpbGVIZWFkZXJTaWduYXR1cmVbM10pIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBsb2NhbCBmaWxlIGhlYWRlciBzaWduYXR1cmUnKTtcclxuICB9XHJcblxyXG4gIC8vIHZlcnNpb24gbmVlZGVkIHRvIGV4dHJhY3RcclxuICB0aGlzLm5lZWRWZXJzaW9uID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XHJcblxyXG4gIC8vIGdlbmVyYWwgcHVycG9zZSBiaXQgZmxhZ1xyXG4gIHRoaXMuZmxhZ3MgPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcclxuXHJcbiAgLy8gY29tcHJlc3Npb24gbWV0aG9kXHJcbiAgdGhpcy5jb21wcmVzc2lvbiA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xyXG5cclxuICAvLyBsYXN0IG1vZCBmaWxlIHRpbWVcclxuICB0aGlzLnRpbWUgPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcclxuXHJcbiAgLy9sYXN0IG1vZCBmaWxlIGRhdGVcclxuICB0aGlzLmRhdGUgPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcclxuXHJcbiAgLy8gY3JjLTMyXHJcbiAgdGhpcy5jcmMzMiA9IChcclxuICAgIChpbnB1dFtpcCsrXSAgICAgICkgfCAoaW5wdXRbaXArK10gPDwgIDgpIHxcclxuICAgIChpbnB1dFtpcCsrXSA8PCAxNikgfCAoaW5wdXRbaXArK10gPDwgMjQpXHJcbiAgKSA+Pj4gMDtcclxuXHJcbiAgLy8gY29tcHJlc3NlZCBzaXplXHJcbiAgdGhpcy5jb21wcmVzc2VkU2l6ZSA9IChcclxuICAgIChpbnB1dFtpcCsrXSAgICAgICkgfCAoaW5wdXRbaXArK10gPDwgIDgpIHxcclxuICAgIChpbnB1dFtpcCsrXSA8PCAxNikgfCAoaW5wdXRbaXArK10gPDwgMjQpXHJcbiAgKSA+Pj4gMDtcclxuXHJcbiAgLy8gdW5jb21wcmVzc2VkIHNpemVcclxuICB0aGlzLnBsYWluU2l6ZSA9IChcclxuICAgIChpbnB1dFtpcCsrXSAgICAgICkgfCAoaW5wdXRbaXArK10gPDwgIDgpIHxcclxuICAgIChpbnB1dFtpcCsrXSA8PCAxNikgfCAoaW5wdXRbaXArK10gPDwgMjQpXHJcbiAgKSA+Pj4gMDtcclxuXHJcbiAgLy8gZmlsZSBuYW1lIGxlbmd0aFxyXG4gIHRoaXMuZmlsZU5hbWVMZW5ndGggPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcclxuXHJcbiAgLy8gZXh0cmEgZmllbGQgbGVuZ3RoXHJcbiAgdGhpcy5leHRyYUZpZWxkTGVuZ3RoID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XHJcblxyXG4gIC8vIGZpbGUgbmFtZVxyXG4gIHRoaXMuZmlsZW5hbWUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIFVTRV9UWVBFREFSUkFZID9cclxuICAgIGlucHV0LnN1YmFycmF5KGlwLCBpcCArPSB0aGlzLmZpbGVOYW1lTGVuZ3RoKSA6XHJcbiAgICBpbnB1dC5zbGljZShpcCwgaXAgKz0gdGhpcy5maWxlTmFtZUxlbmd0aClcclxuICApO1xyXG5cclxuICAvLyBleHRyYSBmaWVsZFxyXG4gIHRoaXMuZXh0cmFGaWVsZCA9IFVTRV9UWVBFREFSUkFZID9cclxuICAgIGlucHV0LnN1YmFycmF5KGlwLCBpcCArPSB0aGlzLmV4dHJhRmllbGRMZW5ndGgpIDpcclxuICAgIGlucHV0LnNsaWNlKGlwLCBpcCArPSB0aGlzLmV4dHJhRmllbGRMZW5ndGgpO1xyXG5cclxuICB0aGlzLmxlbmd0aCA9IGlwIC0gdGhpcy5vZmZzZXQ7XHJcbn07XHJcblxyXG5cclxuWmxpYi5VbnppcC5wcm90b3R5cGUuc2VhcmNoRW5kT2ZDZW50cmFsRGlyZWN0b3J5UmVjb3JkID0gZnVuY3Rpb24oKSB7XHJcbiAgLyoqIEB0eXBlIHshKEFycmF5LjxudW1iZXI+fFVpbnQ4QXJyYXkpfSAqL1xyXG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIGlwO1xyXG5cclxuICBmb3IgKGlwID0gaW5wdXQubGVuZ3RoIC0gMTI7IGlwID4gMDsgLS1pcCkge1xyXG4gICAgaWYgKGlucHV0W2lwICBdID09PSBabGliLlVuemlwLkNlbnRyYWxEaXJlY3RvcnlTaWduYXR1cmVbMF0gJiZcclxuICAgICAgICBpbnB1dFtpcCsxXSA9PT0gWmxpYi5VbnppcC5DZW50cmFsRGlyZWN0b3J5U2lnbmF0dXJlWzFdICYmXHJcbiAgICAgICAgaW5wdXRbaXArMl0gPT09IFpsaWIuVW56aXAuQ2VudHJhbERpcmVjdG9yeVNpZ25hdHVyZVsyXSAmJlxyXG4gICAgICAgIGlucHV0W2lwKzNdID09PSBabGliLlVuemlwLkNlbnRyYWxEaXJlY3RvcnlTaWduYXR1cmVbM10pIHtcclxuICAgICAgdGhpcy5lb2Nkck9mZnNldCA9IGlwO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB0aHJvdyBuZXcgRXJyb3IoJ0VuZCBvZiBDZW50cmFsIERpcmVjdG9yeSBSZWNvcmQgbm90IGZvdW5kJyk7XHJcbn07XHJcblxyXG5abGliLlVuemlwLnByb3RvdHlwZS5wYXJzZUVuZE9mQ2VudHJhbERpcmVjdG9yeVJlY29yZCA9IGZ1bmN0aW9uKCkge1xyXG4gIC8qKiBAdHlwZSB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gKi9cclxuICB2YXIgaW5wdXQgPSB0aGlzLmlucHV0O1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBpcDtcclxuXHJcbiAgaWYgKCF0aGlzLmVvY2RyT2Zmc2V0KSB7XHJcbiAgICB0aGlzLnNlYXJjaEVuZE9mQ2VudHJhbERpcmVjdG9yeVJlY29yZCgpO1xyXG4gIH1cclxuICBpcCA9IHRoaXMuZW9jZHJPZmZzZXQ7XHJcblxyXG4gIC8vIHNpZ25hdHVyZVxyXG4gIGlmIChpbnB1dFtpcCsrXSAhPT0gWmxpYi5VbnppcC5DZW50cmFsRGlyZWN0b3J5U2lnbmF0dXJlWzBdIHx8XHJcbiAgICAgIGlucHV0W2lwKytdICE9PSBabGliLlVuemlwLkNlbnRyYWxEaXJlY3RvcnlTaWduYXR1cmVbMV0gfHxcclxuICAgICAgaW5wdXRbaXArK10gIT09IFpsaWIuVW56aXAuQ2VudHJhbERpcmVjdG9yeVNpZ25hdHVyZVsyXSB8fFxyXG4gICAgICBpbnB1dFtpcCsrXSAhPT0gWmxpYi5VbnppcC5DZW50cmFsRGlyZWN0b3J5U2lnbmF0dXJlWzNdKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgc2lnbmF0dXJlJyk7XHJcbiAgfVxyXG5cclxuICAvLyBudW1iZXIgb2YgdGhpcyBkaXNrXHJcbiAgdGhpcy5udW1iZXJPZlRoaXNEaXNrID0gaW5wdXRbaXArK10gfCAoaW5wdXRbaXArK10gPDwgOCk7XHJcblxyXG4gIC8vIG51bWJlciBvZiB0aGUgZGlzayB3aXRoIHRoZSBzdGFydCBvZiB0aGUgY2VudHJhbCBkaXJlY3RvcnlcclxuICB0aGlzLnN0YXJ0RGlzayA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xyXG5cclxuICAvLyB0b3RhbCBudW1iZXIgb2YgZW50cmllcyBpbiB0aGUgY2VudHJhbCBkaXJlY3Rvcnkgb24gdGhpcyBkaXNrXHJcbiAgdGhpcy50b3RhbEVudHJpZXNUaGlzRGlzayA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xyXG5cclxuICAvLyB0b3RhbCBudW1iZXIgb2YgZW50cmllcyBpbiB0aGUgY2VudHJhbCBkaXJlY3RvcnlcclxuICB0aGlzLnRvdGFsRW50cmllcyA9IGlucHV0W2lwKytdIHwgKGlucHV0W2lwKytdIDw8IDgpO1xyXG5cclxuICAvLyBzaXplIG9mIHRoZSBjZW50cmFsIGRpcmVjdG9yeVxyXG4gIHRoaXMuY2VudHJhbERpcmVjdG9yeVNpemUgPSAoXHJcbiAgICAoaW5wdXRbaXArK10gICAgICApIHwgKGlucHV0W2lwKytdIDw8ICA4KSB8XHJcbiAgICAoaW5wdXRbaXArK10gPDwgMTYpIHwgKGlucHV0W2lwKytdIDw8IDI0KVxyXG4gICkgPj4+IDA7XHJcblxyXG4gIC8vIG9mZnNldCBvZiBzdGFydCBvZiBjZW50cmFsIGRpcmVjdG9yeSB3aXRoIHJlc3BlY3QgdG8gdGhlIHN0YXJ0aW5nIGRpc2sgbnVtYmVyXHJcbiAgdGhpcy5jZW50cmFsRGlyZWN0b3J5T2Zmc2V0ID0gKFxyXG4gICAgKGlucHV0W2lwKytdICAgICAgKSB8IChpbnB1dFtpcCsrXSA8PCAgOCkgfFxyXG4gICAgKGlucHV0W2lwKytdIDw8IDE2KSB8IChpbnB1dFtpcCsrXSA8PCAyNClcclxuICApID4+PiAwO1xyXG5cclxuICAvLyAuWklQIGZpbGUgY29tbWVudCBsZW5ndGhcclxuICB0aGlzLmNvbW1lbnRMZW5ndGggPSBpbnB1dFtpcCsrXSB8IChpbnB1dFtpcCsrXSA8PCA4KTtcclxuXHJcbiAgLy8gLlpJUCBmaWxlIGNvbW1lbnRcclxuICB0aGlzLmNvbW1lbnQgPSBVU0VfVFlQRURBUlJBWSA/XHJcbiAgICBpbnB1dC5zdWJhcnJheShpcCwgaXAgKyB0aGlzLmNvbW1lbnRMZW5ndGgpIDpcclxuICAgIGlucHV0LnNsaWNlKGlwLCBpcCArIHRoaXMuY29tbWVudExlbmd0aCk7XHJcbn07XHJcblxyXG5abGliLlVuemlwLnByb3RvdHlwZS5wYXJzZUZpbGVIZWFkZXIgPSBmdW5jdGlvbigpIHtcclxuICAvKiogQHR5cGUge0FycmF5LjxabGliLlVuemlwLkZpbGVIZWFkZXI+fSAqL1xyXG4gIHZhciBmaWxlbGlzdCA9IFtdO1xyXG4gIC8qKiBAdHlwZSB7T2JqZWN0LjxzdHJpbmcsIG51bWJlcj59ICovXHJcbiAgdmFyIGZpbGV0YWJsZSA9IHt9O1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBpcDtcclxuICAvKiogQHR5cGUge1psaWIuVW56aXAuRmlsZUhlYWRlcn0gKi9cclxuICB2YXIgZmlsZUhlYWRlcjtcclxuICAvKjogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgaTtcclxuICAvKjogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgaWw7XHJcblxyXG4gIGlmICh0aGlzLmZpbGVIZWFkZXJMaXN0KSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBpZiAodGhpcy5jZW50cmFsRGlyZWN0b3J5T2Zmc2V0ID09PSB2b2lkIDApIHtcclxuICAgIHRoaXMucGFyc2VFbmRPZkNlbnRyYWxEaXJlY3RvcnlSZWNvcmQoKTtcclxuICB9XHJcbiAgaXAgPSB0aGlzLmNlbnRyYWxEaXJlY3RvcnlPZmZzZXQ7XHJcblxyXG4gIGZvciAoaSA9IDAsIGlsID0gdGhpcy50b3RhbEVudHJpZXM7IGkgPCBpbDsgKytpKSB7XHJcbiAgICBmaWxlSGVhZGVyID0gbmV3IFpsaWIuVW56aXAuRmlsZUhlYWRlcih0aGlzLmlucHV0LCBpcCk7XHJcbiAgICBmaWxlSGVhZGVyLnBhcnNlKCk7XHJcbiAgICBpcCArPSBmaWxlSGVhZGVyLmxlbmd0aDtcclxuICAgIGZpbGVsaXN0W2ldID0gZmlsZUhlYWRlcjtcclxuICAgIGZpbGV0YWJsZVtmaWxlSGVhZGVyLmZpbGVuYW1lXSA9IGk7XHJcbiAgfVxyXG5cclxuICBpZiAodGhpcy5jZW50cmFsRGlyZWN0b3J5U2l6ZSA8IGlwIC0gdGhpcy5jZW50cmFsRGlyZWN0b3J5T2Zmc2V0KSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgZmlsZSBoZWFkZXIgc2l6ZScpO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5maWxlSGVhZGVyTGlzdCA9IGZpbGVsaXN0O1xyXG4gIHRoaXMuZmlsZW5hbWVUb0luZGV4ID0gZmlsZXRhYmxlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBmaWxlIGhlYWRlciBpbmRleC5cclxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRfcGFyYW1zXHJcbiAqIEByZXR1cm4geyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9IGZpbGUgZGF0YS5cclxuICovXHJcblpsaWIuVW56aXAucHJvdG90eXBlLmdldEZpbGVEYXRhID0gZnVuY3Rpb24oaW5kZXgsIG9wdF9wYXJhbXMpIHtcclxuICBvcHRfcGFyYW1zID0gb3B0X3BhcmFtcyB8fCB7fTtcclxuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXHJcbiAgdmFyIGlucHV0ID0gdGhpcy5pbnB1dDtcclxuICAvKiogQHR5cGUge0FycmF5LjxabGliLlVuemlwLkZpbGVIZWFkZXI+fSAqL1xyXG4gIHZhciBmaWxlSGVhZGVyTGlzdCA9IHRoaXMuZmlsZUhlYWRlckxpc3Q7XHJcbiAgLyoqIEB0eXBlIHtabGliLlVuemlwLkxvY2FsRmlsZUhlYWRlcn0gKi9cclxuICB2YXIgbG9jYWxGaWxlSGVhZGVyO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBvZmZzZXQ7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgdmFyIGxlbmd0aDtcclxuICAvKiogQHR5cGUgeyEoQXJyYXkuPG51bWJlcj58VWludDhBcnJheSl9ICovXHJcbiAgdmFyIGJ1ZmZlcjtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgY3JjMzI7XHJcbiAgLyoqIEB0eXBlIHtBcnJheS48bnVtYmVyPnxVaW50MzJBcnJheXxPYmplY3R9ICovXHJcbiAgdmFyIGtleTtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgaTtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgaWw7XHJcblxyXG4gIGlmICghZmlsZUhlYWRlckxpc3QpIHtcclxuICAgIHRoaXMucGFyc2VGaWxlSGVhZGVyKCk7XHJcbiAgfVxyXG5cclxuICBpZiAoZmlsZUhlYWRlckxpc3RbaW5kZXhdID09PSB2b2lkIDApIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignd3JvbmcgaW5kZXgnKTtcclxuICB9XHJcblxyXG4gIG9mZnNldCA9IGZpbGVIZWFkZXJMaXN0W2luZGV4XS5yZWxhdGl2ZU9mZnNldDtcclxuICBsb2NhbEZpbGVIZWFkZXIgPSBuZXcgWmxpYi5VbnppcC5Mb2NhbEZpbGVIZWFkZXIodGhpcy5pbnB1dCwgb2Zmc2V0KTtcclxuICBsb2NhbEZpbGVIZWFkZXIucGFyc2UoKTtcclxuICBvZmZzZXQgKz0gbG9jYWxGaWxlSGVhZGVyLmxlbmd0aDtcclxuICBsZW5ndGggPSBsb2NhbEZpbGVIZWFkZXIuY29tcHJlc3NlZFNpemU7XHJcblxyXG4gIC8vIGRlY3J5cHRpb25cclxuICBpZiAoKGxvY2FsRmlsZUhlYWRlci5mbGFncyAmIFpsaWIuVW56aXAuTG9jYWxGaWxlSGVhZGVyLkZsYWdzLkVOQ1JZUFQpICE9PSAwKSB7XHJcbiAgICBpZiAoIShvcHRfcGFyYW1zWydwYXNzd29yZCddIHx8IHRoaXMucGFzc3dvcmQpKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcigncGxlYXNlIHNldCBwYXNzd29yZCcpO1xyXG4gICAgfVxyXG4gICAga2V5ID0gIHRoaXMuY3JlYXRlRGVjcnlwdGlvbktleShvcHRfcGFyYW1zWydwYXNzd29yZCddIHx8IHRoaXMucGFzc3dvcmQpO1xyXG5cclxuICAgIC8vIGVuY3J5cHRpb24gaGVhZGVyXHJcbiAgICBmb3IoaSA9IG9mZnNldCwgaWwgPSBvZmZzZXQgKyAxMjsgaSA8IGlsOyArK2kpIHtcclxuICAgICAgdGhpcy5kZWNvZGUoa2V5LCBpbnB1dFtpXSk7XHJcbiAgICB9XHJcbiAgICBvZmZzZXQgKz0gMTI7XHJcbiAgICBsZW5ndGggLT0gMTI7XHJcblxyXG4gICAgLy8gZGVjcnlwdGlvblxyXG4gICAgZm9yIChpID0gb2Zmc2V0LCBpbCA9IG9mZnNldCArIGxlbmd0aDsgaSA8IGlsOyArK2kpIHtcclxuICAgICAgaW5wdXRbaV0gPSB0aGlzLmRlY29kZShrZXksIGlucHV0W2ldKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHN3aXRjaCAobG9jYWxGaWxlSGVhZGVyLmNvbXByZXNzaW9uKSB7XHJcbiAgICBjYXNlIFpsaWIuVW56aXAuQ29tcHJlc3Npb25NZXRob2QuU1RPUkU6XHJcbiAgICAgIGJ1ZmZlciA9IFVTRV9UWVBFREFSUkFZID9cclxuICAgICAgICB0aGlzLmlucHV0LnN1YmFycmF5KG9mZnNldCwgb2Zmc2V0ICsgbGVuZ3RoKSA6XHJcbiAgICAgICAgdGhpcy5pbnB1dC5zbGljZShvZmZzZXQsIG9mZnNldCArIGxlbmd0aCk7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSBabGliLlVuemlwLkNvbXByZXNzaW9uTWV0aG9kLkRFRkxBVEU6XHJcbiAgICAgIGJ1ZmZlciA9IG5ldyBabGliLlJhd0luZmxhdGUodGhpcy5pbnB1dCwge1xyXG4gICAgICAgICdpbmRleCc6IG9mZnNldCxcclxuICAgICAgICAnYnVmZmVyU2l6ZSc6IGxvY2FsRmlsZUhlYWRlci5wbGFpblNpemVcclxuICAgICAgfSkuZGVjb21wcmVzcygpO1xyXG4gICAgICBicmVhaztcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcigndW5rbm93biBjb21wcmVzc2lvbiB0eXBlJyk7XHJcbiAgfVxyXG5cclxuICBpZiAodGhpcy52ZXJpZnkpIHtcclxuICAgIGNyYzMyID0gWmxpYi5DUkMzMi5jYWxjKGJ1ZmZlcik7XHJcbiAgICBpZiAobG9jYWxGaWxlSGVhZGVyLmNyYzMyICE9PSBjcmMzMikge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgJ3dyb25nIGNyYzogZmlsZT0weCcgKyBsb2NhbEZpbGVIZWFkZXIuY3JjMzIudG9TdHJpbmcoMTYpICtcclxuICAgICAgICAnLCBkYXRhPTB4JyArIGNyYzMyLnRvU3RyaW5nKDE2KVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGJ1ZmZlcjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAcmV0dXJuIHtBcnJheS48c3RyaW5nPn1cclxuICovXHJcblpsaWIuVW56aXAucHJvdG90eXBlLmdldEZpbGVuYW1lcyA9IGZ1bmN0aW9uKCkge1xyXG4gIC8qKiBAdHlwZSB7QXJyYXkuPHN0cmluZz59ICovXHJcbiAgdmFyIGZpbGVuYW1lTGlzdCA9IFtdO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBpO1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIHZhciBpbDtcclxuICAvKiogQHR5cGUge0FycmF5LjxabGliLlVuemlwLkZpbGVIZWFkZXI+fSAqL1xyXG4gIHZhciBmaWxlSGVhZGVyTGlzdDtcclxuXHJcbiAgaWYgKCF0aGlzLmZpbGVIZWFkZXJMaXN0KSB7XHJcbiAgICB0aGlzLnBhcnNlRmlsZUhlYWRlcigpO1xyXG4gIH1cclxuICBmaWxlSGVhZGVyTGlzdCA9IHRoaXMuZmlsZUhlYWRlckxpc3Q7XHJcblxyXG4gIGZvciAoaSA9IDAsIGlsID0gZmlsZUhlYWRlckxpc3QubGVuZ3RoOyBpIDwgaWw7ICsraSkge1xyXG4gICAgZmlsZW5hbWVMaXN0W2ldID0gZmlsZUhlYWRlckxpc3RbaV0uZmlsZW5hbWU7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZmlsZW5hbWVMaXN0O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlbmFtZSBleHRyYWN0IGZpbGVuYW1lLlxyXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF9wYXJhbXNcclxuICogQHJldHVybiB7IShBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gZGVjb21wcmVzc2VkIGRhdGEuXHJcbiAqL1xyXG5abGliLlVuemlwLnByb3RvdHlwZS5kZWNvbXByZXNzID0gZnVuY3Rpb24oZmlsZW5hbWUsIG9wdF9wYXJhbXMpIHtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICB2YXIgaW5kZXg7XHJcblxyXG4gIGlmICghdGhpcy5maWxlbmFtZVRvSW5kZXgpIHtcclxuICAgIHRoaXMucGFyc2VGaWxlSGVhZGVyKCk7XHJcbiAgfVxyXG4gIGluZGV4ID0gdGhpcy5maWxlbmFtZVRvSW5kZXhbZmlsZW5hbWVdO1xyXG5cclxuICBpZiAoaW5kZXggPT09IHZvaWQgMCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGZpbGVuYW1lICsgJyBub3QgZm91bmQnKTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzLmdldEZpbGVEYXRhKGluZGV4LCBvcHRfcGFyYW1zKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0geyhBcnJheS48bnVtYmVyPnxVaW50OEFycmF5KX0gcGFzc3dvcmRcclxuICovXHJcblpsaWIuVW56aXAucHJvdG90eXBlLnNldFBhc3N3b3JkID0gZnVuY3Rpb24ocGFzc3dvcmQpIHtcclxuICB0aGlzLnBhc3N3b3JkID0gcGFzc3dvcmQ7XHJcbn07XHJcblxyXG4vKipcclxuICogQHBhcmFtIHsoQXJyYXkuPG51bWJlcj58VWludDMyQXJyYXl8T2JqZWN0KX0ga2V5XHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBuXHJcbiAqIEByZXR1cm4ge251bWJlcn1cclxuICovXHJcblpsaWIuVW56aXAucHJvdG90eXBlLmRlY29kZSA9IGZ1bmN0aW9uKGtleSwgbikge1xyXG4gIG4gXj0gdGhpcy5nZXRCeXRlKC8qKiBAdHlwZSB7KEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX0gKi8oa2V5KSk7XHJcbiAgdGhpcy51cGRhdGVLZXlzKC8qKiBAdHlwZSB7KEFycmF5LjxudW1iZXI+fFVpbnQzMkFycmF5KX0gKi8oa2V5KSwgbik7XHJcblxyXG4gIHJldHVybiBuO1xyXG59O1xyXG5cclxuLy8gY29tbW9uIG1ldGhvZFxyXG5abGliLlVuemlwLnByb3RvdHlwZS51cGRhdGVLZXlzID0gWmxpYi5aaXAucHJvdG90eXBlLnVwZGF0ZUtleXM7XHJcblpsaWIuVW56aXAucHJvdG90eXBlLmNyZWF0ZURlY3J5cHRpb25LZXkgPSBabGliLlppcC5wcm90b3R5cGUuY3JlYXRlRW5jcnlwdGlvbktleTtcclxuWmxpYi5VbnppcC5wcm90b3R5cGUuZ2V0Qnl0ZSA9IFpsaWIuWmlwLnByb3RvdHlwZS5nZXRCeXRlO1xyXG5cclxuLy8gZW5kIG9mIHNjb3BlXHJcbn0pO1xyXG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgWmxpYiBuYW1lc3BhY2UuIFpsaWIg44Gu5LuV5qeY44Gr5rqW5oug44GX44Gf5Zyn57iu44GvIFpsaWIuRGVmbGF0ZSDjgaflrp/oo4VcbiAqIOOBleOCjOOBpuOBhOOCiy4g44GT44KM44GvIEluZmxhdGUg44Go44Gu5YWx5a2Y44KS6ICD5oWu44GX44Gm44GE44KL54K6LlxuICovXG5cbmdvb2cucHJvdmlkZSgnWmxpYicpO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmdvb2cuc2NvcGUoZnVuY3Rpb24oKSB7XG5cbi8qKlxuICogQ29tcHJlc3Npb24gTWV0aG9kXG4gKiBAZW51bSB7bnVtYmVyfVxuICovXG5abGliLkNvbXByZXNzaW9uTWV0aG9kID0ge1xuICBERUZMQVRFOiA4LFxuICBSRVNFUlZFRDogMTVcbn07XG5cbi8vIGVuZCBvZiBzY29wZVxufSk7XG5cbi8qIHZpbTpzZXQgZXhwYW5kdGFiIHRzPTIgc3c9MiB0dz04MDogKi9cbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBEZWZsYXRlIChSRkMxOTUxKSDlrp/oo4UuXG4gKiBEZWZsYXRl44Ki44Or44K044Oq44K644Og5pys5L2T44GvIFpsaWIuUmF3RGVmbGF0ZSDjgaflrp/oo4XjgZXjgozjgabjgYTjgosuXG4gKi9cbmdvb2cucHJvdmlkZSgnWmxpYi5EZWZsYXRlJyk7XG5cbmdvb2cucmVxdWlyZSgnVVNFX1RZUEVEQVJSQVknKTtcbmdvb2cucmVxdWlyZSgnWmxpYicpO1xuZ29vZy5yZXF1aXJlKCdabGliLkFkbGVyMzInKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5SYXdEZWZsYXRlJyk7XG5cbmdvb2cuc2NvcGUoZnVuY3Rpb24oKSB7XG5cbi8qKlxuICogWmxpYiBEZWZsYXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7IShBcnJheXxVaW50OEFycmF5KX0gaW5wdXQg56ym5Y+35YyW44GZ44KL5a++6LGh44GuIGJ5dGUgYXJyYXkuXG4gKiBAcGFyYW0ge09iamVjdD19IG9wdF9wYXJhbXMgb3B0aW9uIHBhcmFtZXRlcnMuXG4gKi9cblpsaWIuRGVmbGF0ZSA9IGZ1bmN0aW9uKGlucHV0LCBvcHRfcGFyYW1zKSB7XG4gIC8qKiBAdHlwZSB7IShBcnJheXxVaW50OEFycmF5KX0gKi9cbiAgdGhpcy5pbnB1dCA9IGlucHV0O1xuICAvKiogQHR5cGUgeyEoQXJyYXl8VWludDhBcnJheSl9ICovXG4gIHRoaXMub3V0cHV0ID1cbiAgICBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KShabGliLkRlZmxhdGUuRGVmYXVsdEJ1ZmZlclNpemUpO1xuICAvKiogQHR5cGUge1psaWIuRGVmbGF0ZS5Db21wcmVzc2lvblR5cGV9ICovXG4gIHRoaXMuY29tcHJlc3Npb25UeXBlID0gWmxpYi5EZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5EWU5BTUlDO1xuICAvKiogQHR5cGUge1psaWIuUmF3RGVmbGF0ZX0gKi9cbiAgdGhpcy5yYXdEZWZsYXRlO1xuICAvKiogQHR5cGUge09iamVjdH0gKi9cbiAgdmFyIHJhd0RlZmxhdGVPcHRpb24gPSB7fTtcbiAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gIHZhciBwcm9wO1xuXG4gIC8vIG9wdGlvbiBwYXJhbWV0ZXJzXG4gIGlmIChvcHRfcGFyYW1zIHx8ICEob3B0X3BhcmFtcyA9IHt9KSkge1xuICAgIGlmICh0eXBlb2Ygb3B0X3BhcmFtc1snY29tcHJlc3Npb25UeXBlJ10gPT09ICdudW1iZXInKSB7XG4gICAgICB0aGlzLmNvbXByZXNzaW9uVHlwZSA9IG9wdF9wYXJhbXNbJ2NvbXByZXNzaW9uVHlwZSddO1xuICAgIH1cbiAgfVxuXG4gIC8vIGNvcHkgb3B0aW9uc1xuICBmb3IgKHByb3AgaW4gb3B0X3BhcmFtcykge1xuICAgIHJhd0RlZmxhdGVPcHRpb25bcHJvcF0gPSBvcHRfcGFyYW1zW3Byb3BdO1xuICB9XG5cbiAgLy8gc2V0IHJhdy1kZWZsYXRlIG91dHB1dCBidWZmZXJcbiAgcmF3RGVmbGF0ZU9wdGlvblsnb3V0cHV0QnVmZmVyJ10gPSB0aGlzLm91dHB1dDtcblxuICB0aGlzLnJhd0RlZmxhdGUgPSBuZXcgWmxpYi5SYXdEZWZsYXRlKHRoaXMuaW5wdXQsIHJhd0RlZmxhdGVPcHRpb24pO1xufTtcblxuLyoqXG4gKiBAY29uc3RcbiAqIEB0eXBlIHtudW1iZXJ9IOODh+ODleOCqeODq+ODiOODkOODg+ODleOCoeOCteOCpOOCui5cbiAqL1xuWmxpYi5EZWZsYXRlLkRlZmF1bHRCdWZmZXJTaXplID0gMHg4MDAwO1xuXG4vKipcbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cblpsaWIuRGVmbGF0ZS5Db21wcmVzc2lvblR5cGUgPSBabGliLlJhd0RlZmxhdGUuQ29tcHJlc3Npb25UeXBlO1xuXG4vKipcbiAqIOebtOaOpeWcp+e4ruOBq+aOm+OBkeOCiy5cbiAqIEBwYXJhbSB7IShBcnJheXxVaW50OEFycmF5KX0gaW5wdXQgdGFyZ2V0IGJ1ZmZlci5cbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0X3BhcmFtcyBvcHRpb24gcGFyYW1ldGVycy5cbiAqIEByZXR1cm4geyEoQXJyYXl8VWludDhBcnJheSl9IGNvbXByZXNzZWQgZGF0YSBieXRlIGFycmF5LlxuICovXG5abGliLkRlZmxhdGUuY29tcHJlc3MgPSBmdW5jdGlvbihpbnB1dCwgb3B0X3BhcmFtcykge1xuICByZXR1cm4gKG5ldyBabGliLkRlZmxhdGUoaW5wdXQsIG9wdF9wYXJhbXMpKS5jb21wcmVzcygpO1xufTtcblxuLyoqXG4gKiBEZWZsYXRlIENvbXByZXNzaW9uLlxuICogQHJldHVybiB7IShBcnJheXxVaW50OEFycmF5KX0gY29tcHJlc3NlZCBkYXRhIGJ5dGUgYXJyYXkuXG4gKi9cblpsaWIuRGVmbGF0ZS5wcm90b3R5cGUuY29tcHJlc3MgPSBmdW5jdGlvbigpIHtcbiAgLyoqIEB0eXBlIHtabGliLkNvbXByZXNzaW9uTWV0aG9kfSAqL1xuICB2YXIgY207XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgY2luZm87XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgY21mO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGZsZztcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBmY2hlY2s7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgZmRpY3Q7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgZmxldmVsO1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGNsZXZlbDtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXG4gIHZhciBhZGxlcjtcbiAgLyoqIEB0eXBlIHtib29sZWFufSAqL1xuICB2YXIgZXJyb3IgPSBmYWxzZTtcbiAgLyoqIEB0eXBlIHshKEFycmF5fFVpbnQ4QXJyYXkpfSAqL1xuICB2YXIgb3V0cHV0O1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIHBvcyA9IDA7XG5cbiAgb3V0cHV0ID0gdGhpcy5vdXRwdXQ7XG5cbiAgLy8gQ29tcHJlc3Npb24gTWV0aG9kIGFuZCBGbGFnc1xuICBjbSA9IFpsaWIuQ29tcHJlc3Npb25NZXRob2QuREVGTEFURTtcbiAgc3dpdGNoIChjbSkge1xuICAgIGNhc2UgWmxpYi5Db21wcmVzc2lvbk1ldGhvZC5ERUZMQVRFOlxuICAgICAgY2luZm8gPSBNYXRoLkxPRzJFICogTWF0aC5sb2coWmxpYi5SYXdEZWZsYXRlLldpbmRvd1NpemUpIC0gODtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgY29tcHJlc3Npb24gbWV0aG9kJyk7XG4gIH1cbiAgY21mID0gKGNpbmZvIDw8IDQpIHwgY207XG4gIG91dHB1dFtwb3MrK10gPSBjbWY7XG5cbiAgLy8gRmxhZ3NcbiAgZmRpY3QgPSAwO1xuICBzd2l0Y2ggKGNtKSB7XG4gICAgY2FzZSBabGliLkNvbXByZXNzaW9uTWV0aG9kLkRFRkxBVEU6XG4gICAgICBzd2l0Y2ggKHRoaXMuY29tcHJlc3Npb25UeXBlKSB7XG4gICAgICAgIGNhc2UgWmxpYi5EZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5OT05FOiBmbGV2ZWwgPSAwOyBicmVhaztcbiAgICAgICAgY2FzZSBabGliLkRlZmxhdGUuQ29tcHJlc3Npb25UeXBlLkZJWEVEOiBmbGV2ZWwgPSAxOyBicmVhaztcbiAgICAgICAgY2FzZSBabGliLkRlZmxhdGUuQ29tcHJlc3Npb25UeXBlLkRZTkFNSUM6IGZsZXZlbCA9IDI7IGJyZWFrO1xuICAgICAgICBkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoJ3Vuc3VwcG9ydGVkIGNvbXByZXNzaW9uIHR5cGUnKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgY29tcHJlc3Npb24gbWV0aG9kJyk7XG4gIH1cbiAgZmxnID0gKGZsZXZlbCA8PCA2KSB8IChmZGljdCA8PCA1KTtcbiAgZmNoZWNrID0gMzEgLSAoY21mICogMjU2ICsgZmxnKSAlIDMxO1xuICBmbGcgfD0gZmNoZWNrO1xuICBvdXRwdXRbcG9zKytdID0gZmxnO1xuXG4gIC8vIEFkbGVyLTMyIGNoZWNrc3VtXG4gIGFkbGVyID0gWmxpYi5BZGxlcjMyKHRoaXMuaW5wdXQpO1xuXG4gIHRoaXMucmF3RGVmbGF0ZS5vcCA9IHBvcztcbiAgb3V0cHV0ID0gdGhpcy5yYXdEZWZsYXRlLmNvbXByZXNzKCk7XG4gIHBvcyA9IG91dHB1dC5sZW5ndGg7XG5cbiAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XG4gICAgLy8gc3ViYXJyYXkg5YiG44KS5YWD44Gr44KC44Gp44GZXG4gICAgb3V0cHV0ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0LmJ1ZmZlcik7XG4gICAgLy8gZXhwYW5kIGJ1ZmZlclxuICAgIGlmIChvdXRwdXQubGVuZ3RoIDw9IHBvcyArIDQpIHtcbiAgICAgIHRoaXMub3V0cHV0ID0gbmV3IFVpbnQ4QXJyYXkob3V0cHV0Lmxlbmd0aCArIDQpO1xuICAgICAgdGhpcy5vdXRwdXQuc2V0KG91dHB1dCk7XG4gICAgICBvdXRwdXQgPSB0aGlzLm91dHB1dDtcbiAgICB9XG4gICAgb3V0cHV0ID0gb3V0cHV0LnN1YmFycmF5KDAsIHBvcyArIDQpO1xuICB9XG5cbiAgLy8gYWRsZXIzMlxuICBvdXRwdXRbcG9zKytdID0gKGFkbGVyID4+IDI0KSAmIDB4ZmY7XG4gIG91dHB1dFtwb3MrK10gPSAoYWRsZXIgPj4gMTYpICYgMHhmZjtcbiAgb3V0cHV0W3BvcysrXSA9IChhZGxlciA+PiAgOCkgJiAweGZmO1xuICBvdXRwdXRbcG9zKytdID0gKGFkbGVyICAgICAgKSAmIDB4ZmY7XG5cbiAgcmV0dXJuIG91dHB1dDtcbn07XG5cbi8vIGVuZCBvZiBzY29wZVxufSk7XG5cbi8qIHZpbTpzZXQgZXhwYW5kdGFiIHRzPTIgc3c9MiB0dz04MDogKi9cbiIsImdvb2cucHJvdmlkZSgnWmxpYi5leHBvcnRPYmplY3QnKTtcblxuZ29vZy5yZXF1aXJlKCdabGliJyk7XG5cbmdvb2cuc2NvcGUoZnVuY3Rpb24oKSB7XG5cblpsaWIuZXhwb3J0T2JqZWN0ID0gZnVuY3Rpb24oZW51bVN0cmluZywgZXhwb3J0S2V5VmFsdWUpIHtcbiAgLyoqIEB0eXBlIHtBcnJheS48c3RyaW5nPn0gKi9cbiAgdmFyIGtleXM7XG4gIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuICB2YXIga2V5O1xuICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgdmFyIGk7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB2YXIgaWw7XG5cbiAgaWYgKE9iamVjdC5rZXlzKSB7XG4gICAga2V5cyA9IE9iamVjdC5rZXlzKGV4cG9ydEtleVZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICBrZXlzID0gW107XG4gICAgaSA9IDA7XG4gICAgZm9yIChrZXkgaW4gZXhwb3J0S2V5VmFsdWUpIHtcbiAgICAgIGtleXNbaSsrXSA9IGtleTtcbiAgICB9XG4gIH1cblxuICBmb3IgKGkgPSAwLCBpbCA9IGtleXMubGVuZ3RoOyBpIDwgaWw7ICsraSkge1xuICAgIGtleSA9IGtleXNbaV07XG4gICAgZ29vZy5leHBvcnRTeW1ib2woZW51bVN0cmluZyArICcuJyArIGtleSwgZXhwb3J0S2V5VmFsdWVba2V5XSlcbiAgfVxufTtcblxufSk7IiwiZ29vZy5wcm92aWRlKCdabGliLkluZmxhdGVTdHJlYW0nKTtcblxuZ29vZy5yZXF1aXJlKCdVU0VfVFlQRURBUlJBWScpO1xuZ29vZy5yZXF1aXJlKCdabGliJyk7XG4vL2dvb2cucmVxdWlyZSgnWmxpYi5BZGxlcjMyJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuUmF3SW5mbGF0ZVN0cmVhbScpO1xuXG5nb29nLnNjb3BlKGZ1bmN0aW9uKCkge1xuXG4vKipcbiAqIEBwYXJhbSB7IShVaW50OEFycmF5fEFycmF5KX0gaW5wdXQgZGVmbGF0ZWQgYnVmZmVyLlxuICogQGNvbnN0cnVjdG9yXG4gKi9cblpsaWIuSW5mbGF0ZVN0cmVhbSA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gIC8qKiBAdHlwZSB7IShVaW50OEFycmF5fEFycmF5KX0gKi9cbiAgdGhpcy5pbnB1dCA9IGlucHV0ID09PSB2b2lkIDAgPyBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KSgpIDogaW5wdXQ7XG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICB0aGlzLmlwID0gMDtcbiAgLyoqIEB0eXBlIHtabGliLlJhd0luZmxhdGVTdHJlYW19ICovXG4gIHRoaXMucmF3aW5mbGF0ZSA9IG5ldyBabGliLlJhd0luZmxhdGVTdHJlYW0odGhpcy5pbnB1dCwgdGhpcy5pcCk7XG4gIC8qKiBAdHlwZSB7WmxpYi5Db21wcmVzc2lvbk1ldGhvZH0gKi9cbiAgdGhpcy5tZXRob2Q7XG4gIC8qKiBAdHlwZSB7IShBcnJheXxVaW50OEFycmF5KX0gKi9cbiAgdGhpcy5vdXRwdXQgPSB0aGlzLnJhd2luZmxhdGUub3V0cHV0O1xufTtcblxuLyoqXG4gKiBkZWNvbXByZXNzLlxuICogQHJldHVybiB7IShVaW50OEFycmF5fEFycmF5KX0gaW5mbGF0ZWQgYnVmZmVyLlxuICovXG5abGliLkluZmxhdGVTdHJlYW0ucHJvdG90eXBlLmRlY29tcHJlc3MgPSBmdW5jdGlvbihpbnB1dCkge1xuICAvKiogQHR5cGUgeyEoVWludDhBcnJheXxBcnJheSl9IGluZmxhdGVkIGJ1ZmZlci4gKi9cbiAgdmFyIGJ1ZmZlcjtcbiAgLyoqIEB0eXBlIHtudW1iZXJ9IGFkbGVyLTMyIGNoZWNrc3VtICovXG4gIHZhciBhZGxlcjMyO1xuXG4gIC8vIOaWsOOBl+OBhOWFpeWKm+OCkuWFpeWKm+ODkOODg+ODleOCoeOBq+e1kOWQiOOBmeOCi1xuICAvLyBYWFggQXJyYXksIFVpbnQ4QXJyYXkg44Gu44OB44Kn44OD44Kv44KS6KGM44GG44GL56K66KqN44GZ44KLXG4gIGlmIChpbnB1dCAhPT0gdm9pZCAwKSB7XG4gICAgaWYgKFVTRV9UWVBFREFSUkFZKSB7XG4gICAgICB2YXIgdG1wID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5pbnB1dC5sZW5ndGggKyBpbnB1dC5sZW5ndGgpO1xuICAgICAgdG1wLnNldCh0aGlzLmlucHV0LCAwKTtcbiAgICAgIHRtcC5zZXQoaW5wdXQsIHRoaXMuaW5wdXQubGVuZ3RoKTtcbiAgICAgIHRoaXMuaW5wdXQgPSB0bXA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaW5wdXQgPSB0aGlzLmlucHV0LmNvbmNhdChpbnB1dCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHRoaXMubWV0aG9kID09PSB2b2lkIDApIHtcbiAgICBpZih0aGlzLnJlYWRIZWFkZXIoKSA8IDApIHtcbiAgICAgIHJldHVybiBuZXcgKFVTRV9UWVBFREFSUkFZID8gVWludDhBcnJheSA6IEFycmF5KSgpO1xuICAgIH1cbiAgfVxuXG4gIGJ1ZmZlciA9IHRoaXMucmF3aW5mbGF0ZS5kZWNvbXByZXNzKHRoaXMuaW5wdXQsIHRoaXMuaXApO1xuICBpZiAodGhpcy5yYXdpbmZsYXRlLmlwICE9PSAwKSB7XG4gICAgdGhpcy5pbnB1dCA9IFVTRV9UWVBFREFSUkFZID9cbiAgICAgIHRoaXMuaW5wdXQuc3ViYXJyYXkodGhpcy5yYXdpbmZsYXRlLmlwKSA6XG4gICAgICB0aGlzLmlucHV0LnNsaWNlKHRoaXMucmF3aW5mbGF0ZS5pcCk7XG4gICAgdGhpcy5pcCA9IDA7XG4gIH1cblxuICAvLyB2ZXJpZnkgYWRsZXItMzJcbiAgLypcbiAgaWYgKHRoaXMudmVyaWZ5KSB7XG4gICAgYWRsZXIzMiA9XG4gICAgICBpbnB1dFt0aGlzLmlwKytdIDw8IDI0IHwgaW5wdXRbdGhpcy5pcCsrXSA8PCAxNiB8XG4gICAgICBpbnB1dFt0aGlzLmlwKytdIDw8IDggfCBpbnB1dFt0aGlzLmlwKytdO1xuXG4gICAgaWYgKGFkbGVyMzIgIT09IFpsaWIuQWRsZXIzMihidWZmZXIpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgYWRsZXItMzIgY2hlY2tzdW0nKTtcbiAgICB9XG4gIH1cbiAgKi9cblxuICByZXR1cm4gYnVmZmVyO1xufTtcblxuLyoqXG4gKiBAcmV0dXJuIHshKFVpbnQ4QXJyYXl8QXJyYXkpfSBjdXJyZW50IG91dHB1dCBidWZmZXIuXG4gKi9cblpsaWIuSW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZ2V0Qnl0ZXMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMucmF3aW5mbGF0ZS5nZXRCeXRlcygpO1xufTtcblxuWmxpYi5JbmZsYXRlU3RyZWFtLnByb3RvdHlwZS5yZWFkSGVhZGVyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBpcCA9IHRoaXMuaXA7XG4gIHZhciBpbnB1dCA9IHRoaXMuaW5wdXQ7XG5cbiAgLy8gQ29tcHJlc3Npb24gTWV0aG9kIGFuZCBGbGFnc1xuICB2YXIgY21mID0gaW5wdXRbaXArK107XG4gIHZhciBmbGcgPSBpbnB1dFtpcCsrXTtcblxuICBpZiAoY21mID09PSB2b2lkIDAgfHwgZmxnID09PSB2b2lkIDApIHtcbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICAvLyBjb21wcmVzc2lvbiBtZXRob2RcbiAgc3dpdGNoIChjbWYgJiAweDBmKSB7XG4gICAgY2FzZSBabGliLkNvbXByZXNzaW9uTWV0aG9kLkRFRkxBVEU6XG4gICAgICB0aGlzLm1ldGhvZCA9IFpsaWIuQ29tcHJlc3Npb25NZXRob2QuREVGTEFURTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vuc3VwcG9ydGVkIGNvbXByZXNzaW9uIG1ldGhvZCcpO1xuICB9XG5cbiAgLy8gZmNoZWNrXG4gIGlmICgoKGNtZiA8PCA4KSArIGZsZykgJSAzMSAhPT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBmY2hlY2sgZmxhZzonICsgKChjbWYgPDwgOCkgKyBmbGcpICUgMzEpO1xuICB9XG5cbiAgLy8gZmRpY3QgKG5vdCBzdXBwb3J0ZWQpXG4gIGlmIChmbGcgJiAweDIwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdmZGljdCBmbGFnIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbiAgfVxuXG4gIHRoaXMuaXAgPSBpcDtcbn07XG5cbi8vIGVuZCBvZiBzY29wZVxufSk7XG5cbi8qIHZpbTpzZXQgZXhwYW5kdGFiIHRzPTIgc3c9MiB0dz04MDogKi9cbiIsImdvb2cucmVxdWlyZSgnWmxpYi5BZGxlcjMyJyk7XG5cbmdvb2cuZXhwb3J0U3ltYm9sKCdabGliLkFkbGVyMzInLCBabGliLkFkbGVyMzIpO1xuZ29vZy5leHBvcnRTeW1ib2woJ1psaWIuQWRsZXIzMi51cGRhdGUnLCBabGliLkFkbGVyMzIudXBkYXRlKTtcbiIsImdvb2cucmVxdWlyZSgnWmxpYi5DUkMzMicpO1xuXG5nb29nLmV4cG9ydFN5bWJvbCgnWmxpYi5DUkMzMicsIFpsaWIuQ1JDMzIpO1xuZ29vZy5leHBvcnRTeW1ib2woJ1psaWIuQ1JDMzIuY2FsYycsIFpsaWIuQ1JDMzIuY2FsYyk7XG5nb29nLmV4cG9ydFN5bWJvbCgnWmxpYi5DUkMzMi51cGRhdGUnLCBabGliLkNSQzMyLnVwZGF0ZSk7IiwiZ29vZy5yZXF1aXJlKCdabGliLkRlZmxhdGUnKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5leHBvcnRPYmplY3QnKTtcblxuZ29vZy5leHBvcnRTeW1ib2woJ1psaWIuRGVmbGF0ZScsIFpsaWIuRGVmbGF0ZSk7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuRGVmbGF0ZS5jb21wcmVzcycsXG4gIFpsaWIuRGVmbGF0ZS5jb21wcmVzc1xuKTtcbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5EZWZsYXRlLnByb3RvdHlwZS5jb21wcmVzcycsXG4gIFpsaWIuRGVmbGF0ZS5wcm90b3R5cGUuY29tcHJlc3Ncbik7XG5abGliLmV4cG9ydE9iamVjdCgnWmxpYi5EZWZsYXRlLkNvbXByZXNzaW9uVHlwZScsIHtcbiAgJ05PTkUnOiBabGliLkRlZmxhdGUuQ29tcHJlc3Npb25UeXBlLk5PTkUsXG4gICdGSVhFRCc6IFpsaWIuRGVmbGF0ZS5Db21wcmVzc2lvblR5cGUuRklYRUQsXG4gICdEWU5BTUlDJzogWmxpYi5EZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5EWU5BTUlDXG59KTtcbiIsImdvb2cucmVxdWlyZSgnWmxpYi5HdW56aXAnKTtcblxuZ29vZy5leHBvcnRTeW1ib2woJ1psaWIuR3VuemlwJywgWmxpYi5HdW56aXApO1xuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLkd1bnppcC5wcm90b3R5cGUuZGVjb21wcmVzcycsXG4gIFpsaWIuR3VuemlwLnByb3RvdHlwZS5kZWNvbXByZXNzXG4pO1xuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLkd1bnppcC5wcm90b3R5cGUuZ2V0TWVtYmVycycsXG4gIFpsaWIuR3VuemlwLnByb3RvdHlwZS5nZXRNZW1iZXJzXG4pO1xuIiwiZ29vZy5yZXF1aXJlKCdabGliLkd1bnppcE1lbWJlcicpO1xuXG5nb29nLmV4cG9ydFN5bWJvbCgnWmxpYi5HdW56aXBNZW1iZXInLCBabGliLkd1bnppcE1lbWJlcik7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuR3VuemlwTWVtYmVyLnByb3RvdHlwZS5nZXROYW1lJyxcbiAgWmxpYi5HdW56aXBNZW1iZXIucHJvdG90eXBlLmdldE5hbWVcbik7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuR3VuemlwTWVtYmVyLnByb3RvdHlwZS5nZXREYXRhJyxcbiAgWmxpYi5HdW56aXBNZW1iZXIucHJvdG90eXBlLmdldERhdGFcbik7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuR3VuemlwTWVtYmVyLnByb3RvdHlwZS5nZXRNdGltZScsXG4gIFpsaWIuR3VuemlwTWVtYmVyLnByb3RvdHlwZS5nZXRNdGltZVxuKTsiLCJnb29nLnJlcXVpcmUoJ1psaWIuR3ppcCcpO1xuXG5nb29nLmV4cG9ydFN5bWJvbCgnWmxpYi5HemlwJywgWmxpYi5HemlwKTtcbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5HemlwLnByb3RvdHlwZS5jb21wcmVzcycsXG4gIFpsaWIuR3ppcC5wcm90b3R5cGUuY29tcHJlc3Ncbik7IiwiZ29vZy5yZXF1aXJlKCdabGliLkluZmxhdGUnKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5leHBvcnRPYmplY3QnKTtcblxuZ29vZy5leHBvcnRTeW1ib2woJ1psaWIuSW5mbGF0ZScsIFpsaWIuSW5mbGF0ZSk7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuSW5mbGF0ZS5wcm90b3R5cGUuZGVjb21wcmVzcycsXG4gIFpsaWIuSW5mbGF0ZS5wcm90b3R5cGUuZGVjb21wcmVzc1xuKTtcblpsaWIuZXhwb3J0T2JqZWN0KCdabGliLkluZmxhdGUuQnVmZmVyVHlwZScsIHtcbiAgJ0FEQVBUSVZFJzogWmxpYi5JbmZsYXRlLkJ1ZmZlclR5cGUuQURBUFRJVkUsXG4gICdCTE9DSyc6IFpsaWIuSW5mbGF0ZS5CdWZmZXJUeXBlLkJMT0NLXG59KTtcbiIsImdvb2cucmVxdWlyZSgnWmxpYi5JbmZsYXRlU3RyZWFtJyk7XG5cbmdvb2cuZXhwb3J0U3ltYm9sKCdabGliLkluZmxhdGVTdHJlYW0nLCBabGliLkluZmxhdGVTdHJlYW0pO1xuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLkluZmxhdGVTdHJlYW0ucHJvdG90eXBlLmRlY29tcHJlc3MnLFxuICBabGliLkluZmxhdGVTdHJlYW0ucHJvdG90eXBlLmRlY29tcHJlc3Ncbik7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuSW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZ2V0Qnl0ZXMnLFxuICBabGliLkluZmxhdGVTdHJlYW0ucHJvdG90eXBlLmdldEJ5dGVzXG4pOyIsImdvb2cucmVxdWlyZSgnWmxpYi5SYXdEZWZsYXRlJyk7XG5nb29nLnJlcXVpcmUoJ1psaWIuZXhwb3J0T2JqZWN0Jyk7XG5cbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5SYXdEZWZsYXRlJyxcbiAgWmxpYi5SYXdEZWZsYXRlXG4pO1xuXG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuUmF3RGVmbGF0ZS5wcm90b3R5cGUuY29tcHJlc3MnLFxuICBabGliLlJhd0RlZmxhdGUucHJvdG90eXBlLmNvbXByZXNzXG4pO1xuXG5abGliLmV4cG9ydE9iamVjdChcbiAgJ1psaWIuUmF3RGVmbGF0ZS5Db21wcmVzc2lvblR5cGUnLFxuICB7XG4gICAgJ05PTkUnOiBabGliLlJhd0RlZmxhdGUuQ29tcHJlc3Npb25UeXBlLk5PTkUsXG4gICAgJ0ZJWEVEJzogWmxpYi5SYXdEZWZsYXRlLkNvbXByZXNzaW9uVHlwZS5GSVhFRCxcbiAgICAnRFlOQU1JQyc6IFpsaWIuUmF3RGVmbGF0ZS5Db21wcmVzc2lvblR5cGUuRFlOQU1JQ1xuICB9XG4pO1xuIiwiZ29vZy5yZXF1aXJlKCdabGliLlJhd0luZmxhdGUnKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5leHBvcnRPYmplY3QnKTtcblxuZ29vZy5leHBvcnRTeW1ib2woJ1psaWIuUmF3SW5mbGF0ZScsIFpsaWIuUmF3SW5mbGF0ZSk7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuZGVjb21wcmVzcycsXG4gIFpsaWIuUmF3SW5mbGF0ZS5wcm90b3R5cGUuZGVjb21wcmVzc1xuKTtcblpsaWIuZXhwb3J0T2JqZWN0KCdabGliLlJhd0luZmxhdGUuQnVmZmVyVHlwZScsIHtcbiAgJ0FEQVBUSVZFJzogWmxpYi5SYXdJbmZsYXRlLkJ1ZmZlclR5cGUuQURBUFRJVkUsXG4gICdCTE9DSyc6IFpsaWIuUmF3SW5mbGF0ZS5CdWZmZXJUeXBlLkJMT0NLXG59KTtcbiIsImdvb2cucmVxdWlyZSgnWmxpYi5SYXdJbmZsYXRlU3RyZWFtJyk7XG5cbmdvb2cuZXhwb3J0U3ltYm9sKCdabGliLlJhd0luZmxhdGVTdHJlYW0nLCBabGliLlJhd0luZmxhdGVTdHJlYW0pO1xuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLmRlY29tcHJlc3MnLFxuICBabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLmRlY29tcHJlc3Ncbik7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuUmF3SW5mbGF0ZVN0cmVhbS5wcm90b3R5cGUuZ2V0Qnl0ZXMnLFxuICBabGliLlJhd0luZmxhdGVTdHJlYW0ucHJvdG90eXBlLmdldEJ5dGVzXG4pOyIsImdvb2cucmVxdWlyZSgnWmxpYi5VbnppcCcpO1xuXG5nb29nLmV4cG9ydFN5bWJvbCgnWmxpYi5VbnppcCcsIFpsaWIuVW56aXApO1xuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLlVuemlwLnByb3RvdHlwZS5kZWNvbXByZXNzJyxcbiAgWmxpYi5VbnppcC5wcm90b3R5cGUuZGVjb21wcmVzc1xuKTtcbmdvb2cuZXhwb3J0U3ltYm9sKFxuICAnWmxpYi5VbnppcC5wcm90b3R5cGUuZ2V0RmlsZW5hbWVzJyxcbiAgWmxpYi5VbnppcC5wcm90b3R5cGUuZ2V0RmlsZW5hbWVzXG4pO1xuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLlVuemlwLnByb3RvdHlwZS5zZXRQYXNzd29yZCcsXG4gIFpsaWIuVW56aXAucHJvdG90eXBlLnNldFBhc3N3b3JkXG4pOyIsImdvb2cucmVxdWlyZSgnWmxpYi5aaXAnKTtcbmdvb2cucmVxdWlyZSgnWmxpYi5leHBvcnRPYmplY3QnKTtcblxuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLlppcCcsXG4gIFpsaWIuWmlwXG4pO1xuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLlppcC5wcm90b3R5cGUuYWRkRmlsZScsXG4gIFpsaWIuWmlwLnByb3RvdHlwZS5hZGRGaWxlXG4pO1xuZ29vZy5leHBvcnRTeW1ib2woXG4gICdabGliLlppcC5wcm90b3R5cGUuY29tcHJlc3MnLFxuICBabGliLlppcC5wcm90b3R5cGUuY29tcHJlc3Ncbik7XG5nb29nLmV4cG9ydFN5bWJvbChcbiAgJ1psaWIuWmlwLnByb3RvdHlwZS5zZXRQYXNzd29yZCcsXG4gIFpsaWIuWmlwLnByb3RvdHlwZS5zZXRQYXNzd29yZFxuKTtcblpsaWIuZXhwb3J0T2JqZWN0KFxuICdabGliLlppcC5Db21wcmVzc2lvbk1ldGhvZCcsIHtcbiAgICAnU1RPUkUnOiBabGliLlppcC5Db21wcmVzc2lvbk1ldGhvZC5TVE9SRSxcbiAgICAnREVGTEFURSc6IFpsaWIuWmlwLkNvbXByZXNzaW9uTWV0aG9kLkRFRkxBVEVcbiAgfVxuKTtcblpsaWIuZXhwb3J0T2JqZWN0KFxuICAnWmxpYi5aaXAuT3BlcmF0aW5nU3lzdGVtJywge1xuICAgICdNU0RPUyc6IFpsaWIuWmlwLk9wZXJhdGluZ1N5c3RlbS5NU0RPUyxcbiAgICAnVU5JWCc6IFpsaWIuWmlwLk9wZXJhdGluZ1N5c3RlbS5VTklYLFxuICAgICdNQUNJTlRPU0gnOiBabGliLlppcC5PcGVyYXRpbmdTeXN0ZW0uTUFDSU5UT1NIXG4gIH1cbik7XG4vLyBUT0RPOiBEZWZsYXRlIE9wdGlvbiJdfQ==