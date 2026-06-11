var figmaToCodeAdapter = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __objRest = (source, exclude) => {
    var target = {};
    for (var prop in source)
      if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
        target[prop] = source[prop];
    if (source != null && __getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(source)) {
        if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
          target[prop] = source[prop];
      }
    return target;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/claude_mcp_plugin/figma-to-code-adapter.js
  var figma_to_code_adapter_exports = {};
  __export(figma_to_code_adapter_exports, {
    convertFigmaToCode: () => convertFigmaToCode
  });

  // FigmaToCode/packages/backend/src/common/commonConversionWarnings.ts
  var warnings = /* @__PURE__ */ new Set();
  var addWarning = (warning) => {
    if (warnings.has(warning) === false) {
      console.warn(warning);
    }
    warnings.add(warning);
  };
  var clearWarnings = () => warnings.clear();

  // FigmaToCode/packages/backend/src/nearest-color/nearestColor.ts
  function nearestColor(needle, colors) {
    needle = parseColor(needle);
    let distanceSq;
    let minDistanceSq = Infinity;
    let rgb;
    let value;
    for (let i = 0; i < colors.length; ++i) {
      rgb = colors[i].rgb;
      distanceSq = (needle.r - rgb.r) ** 2 + (needle.g - rgb.g) ** 2 + (needle.b - rgb.b) ** 2;
      if (distanceSq < minDistanceSq) {
        minDistanceSq = distanceSq;
        value = colors[i];
      }
    }
    return value.source;
  }
  function mapColors(colors) {
    return colors.map((color2) => createColorSpec(color2));
  }
  var nearestColorFrom = (availableColors) => {
    const colors = mapColors(availableColors);
    return (hex) => nearestColor(hex, colors);
  };
  function parseColor(source) {
    let red, green, blue;
    if (typeof source === "object") {
      return source;
    }
    let hexMatchArr = source.match(/^#?((?:[0-9a-f]{3}){1,2})$/i);
    if (hexMatchArr) {
      const hexMatch = hexMatchArr[1];
      if (hexMatch.length === 3) {
        hexMatchArr = [
          hexMatch.charAt(0) + hexMatch.charAt(0),
          hexMatch.charAt(1) + hexMatch.charAt(1),
          hexMatch.charAt(2) + hexMatch.charAt(2)
        ];
      } else {
        hexMatchArr = [
          hexMatch.substring(0, 2),
          hexMatch.substring(2, 4),
          hexMatch.substring(4, 6)
        ];
      }
      red = parseInt(hexMatchArr[0], 16);
      green = parseInt(hexMatchArr[1], 16);
      blue = parseInt(hexMatchArr[2], 16);
      return { r: red, g: green, b: blue };
    }
    throw Error(`"${source}" is not a valid color`);
  }
  function createColorSpec(input) {
    return {
      source: input,
      rgb: parseColor(input)
    };
  }

  // FigmaToCode/packages/backend/src/common/indentString.ts
  var indentString = (str, indentLevel = 2) => {
    const regex = /^(?!\s*$)/gm;
    return str.replace(regex, " ".repeat(indentLevel));
  };
  var indentStringFlutter = (str, indentLevel = 2) => {
    const regex = /^(?!\s*$)/gm;
    return str.replace(regex, " ".repeat(indentLevel));
  };

  // FigmaToCode/packages/backend/src/common/numToAutoFixed.ts
  var numberToFixedString = (num) => {
    return num.toFixed(2).replace(/\.00$/, "");
  };
  var roundToNearestDecimal = (decimal) => (n) => Math.round(n * 10 ** decimal) / 10 ** decimal;
  var roundToNearestHundreth = roundToNearestDecimal(2);
  var skipDefaultProperty = (propertyValue, defaultProperty) => {
    if (propertyValue === defaultProperty) {
      return "";
    }
    return propertyValue;
  };
  var generateWidgetCode = (className, properties, positionedValues) => {
    const propertiesArray = Object.entries(properties).filter(([, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== "";
    }).map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}: [
${indentStringFlutter(value.join(",\n"))},
],`;
      } else {
        return `${key}: ${typeof value === "number" ? numberToFixedString(value) : value},`;
      }
    });
    const positionedValuesString = (positionedValues || []).map((value) => {
      return typeof value === "number" ? numberToFixedString(value) : value;
    }).join(", ");
    const compactPropertiesArray = propertiesArray.join(" ");
    if (compactPropertiesArray.length < 40 && !positionedValues) {
      return `${className}(${compactPropertiesArray.slice(0, -1)})`;
    }
    const joined = `${positionedValuesString}${positionedValuesString ? ",\n" : ""}${propertiesArray.join("\n")}`;
    return `${className}(
${indentStringFlutter(joined.trim())}
)`;
  };
  function stringToClassName(name) {
    const words = name.split(/[^a-zA-Z0-9]+/);
    const camelCaseWords = words.map((word, index) => {
      if (index === 0) {
        const cleanedWord = word.replace(/^[^a-zA-Z]+/g, "");
        return cleanedWord.charAt(0).toUpperCase() + cleanedWord.slice(1).toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    return camelCaseWords.join("");
  }

  // FigmaToCode/packages/backend/src/common/retrieveFill.ts
  var retrieveTopFill = (fills) => {
    if (fills && Array.isArray(fills) && fills.length > 0) {
      return [...fills].reverse().find((d) => d.visible !== false);
    }
    return void 0;
  };

  // FigmaToCode/packages/backend/src/common/nodeVisibility.ts
  var getVisibleNodes = (nodes) => nodes.filter((d) => {
    var _a;
    return (_a = d.visible) != null ? _a : true;
  });

  // node_modules/js-base64/base64.mjs
  var _hasBuffer = typeof Buffer === "function";
  var _TD = typeof TextDecoder === "function" ? new TextDecoder() : void 0;
  var _TE = typeof TextEncoder === "function" ? new TextEncoder() : void 0;
  var b64ch = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var b64chs = Array.prototype.slice.call(b64ch);
  var b64tab = ((a) => {
    let tab = {};
    a.forEach((c, i) => tab[c] = i);
    return tab;
  })(b64chs);
  var _fromCC = String.fromCharCode.bind(String);
  var _U8Afrom = typeof Uint8Array.from === "function" ? Uint8Array.from.bind(Uint8Array) : (it) => new Uint8Array(Array.prototype.slice.call(it, 0));
  var btoaPolyfill = (bin) => {
    let u32, c0, c1, c2, asc = "";
    const pad = bin.length % 3;
    for (let i = 0; i < bin.length; ) {
      if ((c0 = bin.charCodeAt(i++)) > 255 || (c1 = bin.charCodeAt(i++)) > 255 || (c2 = bin.charCodeAt(i++)) > 255)
        throw new TypeError("invalid character found");
      u32 = c0 << 16 | c1 << 8 | c2;
      asc += b64chs[u32 >> 18 & 63] + b64chs[u32 >> 12 & 63] + b64chs[u32 >> 6 & 63] + b64chs[u32 & 63];
    }
    return pad ? asc.slice(0, pad - 3) + "===".substring(pad) : asc;
  };
  var _btoa = typeof btoa === "function" ? (bin) => btoa(bin) : _hasBuffer ? (bin) => Buffer.from(bin, "binary").toString("base64") : btoaPolyfill;

  // FigmaToCode/packages/backend/src/messaging.ts
  var safePostMessage = (message) => {
    try {
      figma.ui.postMessage(message);
    } catch (error) {
      console.warn("[backend] postMessage failed (no UI?)");
    }
  };
  var postBackendMessage = safePostMessage;
  var postConversionStart = () => postBackendMessage({ type: "conversionStart" });

  // FigmaToCode/packages/backend/src/common/exportAsyncProxy.ts
  var isRunning = false;
  var exportAsyncProxy = async (node, settings) => {
    if (isRunning === false) {
      isRunning = true;
      postConversionStart();
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
    const figmaNode = await figma.getNodeByIdAsync(node.id);
    if (figmaNode.exportAsync === void 0) {
      throw new TypeError(
        "Something went wrong. This node doesn't have an exportAsync() function. Maybe check the type before calling this function."
      );
    }
    let result;
    if (settings.format === "SVG_STRING") {
      result = await figmaNode.exportAsync(settings);
    } else {
      result = await figmaNode.exportAsync(settings);
    }
    isRunning = false;
    return result;
  };

  // FigmaToCode/packages/backend/src/common/images.ts
  var PLACEHOLDER_IMAGE_DOMAIN = "https://placehold.co";
  var getPlaceholderImage = (w, h = -1) => {
    const _w = w.toFixed(0);
    const _h = (h < 0 ? w : h).toFixed(0);
    return `${PLACEHOLDER_IMAGE_DOMAIN}/${_w}x${_h}`;
  };
  var fillIsImage = ({ type }) => type === "IMAGE";
  var getImageFills = (node) => {
    try {
      return node.fills.filter(fillIsImage);
    } catch (e) {
      return [];
    }
  };
  var nodeHasImageFill = (node) => getImageFills(node).length > 0;
  var imageBytesToBase64 = (bytes) => {
    const binaryString = bytes.reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, "");
    const b64 = _btoa(binaryString);
    return `data:image/png;base64,${b64}`;
  };
  var exportNodeAsBase64PNG = async (node, excludeChildren) => {
    if (node.base64 !== void 0 && node.base64 !== "") {
      return node.base64;
    }
    const n = node;
    const temporarilyHideChildren = excludeChildren && "children" in n && n.children.length > 0;
    const parent = n;
    const originalVisibility = /* @__PURE__ */ new Map();
    if (temporarilyHideChildren) {
      parent.children.map(
        (child) => originalVisibility.set(child, child.visible)
      ), // Temporarily hide all children
      parent.children.forEach((child) => {
        child.visible = false;
      });
    }
    const exportSettings = {
      format: "PNG",
      constraint: { type: "SCALE", value: 1 }
    };
    const bytes = await exportAsyncProxy(n, exportSettings);
    if (temporarilyHideChildren) {
      parent.children.forEach((child) => {
        var _a;
        child.visible = (_a = originalVisibility.get(child)) != null ? _a : false;
      });
    }
    addWarning("Some images exported as Base64 PNG");
    const base64 = imageBytesToBase64(bytes);
    node.base64 = base64;
    return base64;
  };

  // FigmaToCode/packages/backend/src/common/commonTextHeightSpacing.ts
  var commonLineHeight = (lineHeight2, fontSize2) => {
    switch (lineHeight2.unit) {
      case "AUTO":
        return 0;
      case "PIXELS":
        return lineHeight2.value;
      case "PERCENT":
        return fontSize2 * lineHeight2.value / 100;
    }
  };
  var commonLetterSpacing = (letterSpacing2, fontSize2) => {
    switch (letterSpacing2.unit) {
      case "PIXELS":
        return letterSpacing2.value;
      case "PERCENT":
        return fontSize2 * letterSpacing2.value / 100;
    }
  };

  // node_modules/html-entities/dist/esm/named-references.js
  var __assign = function() {
    __assign = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
      }
      return t;
    };
    return __assign.apply(this, arguments);
  };
  var pairDivider = "~";
  var blockDivider = "~~";
  function generateNamedReferences(input, prev) {
    var entities = {};
    var characters = {};
    var blocks = input.split(blockDivider);
    var isOptionalBlock = false;
    for (var i = 0; blocks.length > i; i++) {
      var entries = blocks[i].split(pairDivider);
      for (var j = 0; j < entries.length; j += 2) {
        var entity = entries[j];
        var character = entries[j + 1];
        var fullEntity = "&" + entity + ";";
        entities[fullEntity] = character;
        if (isOptionalBlock) {
          entities["&" + entity] = character;
        }
        characters[character] = fullEntity;
      }
      isOptionalBlock = true;
    }
    return prev ? { entities: __assign(__assign({}, entities), prev.entities), characters: __assign(__assign({}, characters), prev.characters) } : { entities, characters };
  }
  var bodyRegExps = {
    xml: /&(?:#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+);?/g,
    html4: /&notin;|&(?:nbsp|iexcl|cent|pound|curren|yen|brvbar|sect|uml|copy|ordf|laquo|not|shy|reg|macr|deg|plusmn|sup2|sup3|acute|micro|para|middot|cedil|sup1|ordm|raquo|frac14|frac12|frac34|iquest|Agrave|Aacute|Acirc|Atilde|Auml|Aring|AElig|Ccedil|Egrave|Eacute|Ecirc|Euml|Igrave|Iacute|Icirc|Iuml|ETH|Ntilde|Ograve|Oacute|Ocirc|Otilde|Ouml|times|Oslash|Ugrave|Uacute|Ucirc|Uuml|Yacute|THORN|szlig|agrave|aacute|acirc|atilde|auml|aring|aelig|ccedil|egrave|eacute|ecirc|euml|igrave|iacute|icirc|iuml|eth|ntilde|ograve|oacute|ocirc|otilde|ouml|divide|oslash|ugrave|uacute|ucirc|uuml|yacute|thorn|yuml|quot|amp|lt|gt|#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+);?/g,
    html5: /&centerdot;|&copysr;|&divideontimes;|&gtcc;|&gtcir;|&gtdot;|&gtlPar;|&gtquest;|&gtrapprox;|&gtrarr;|&gtrdot;|&gtreqless;|&gtreqqless;|&gtrless;|&gtrsim;|&ltcc;|&ltcir;|&ltdot;|&lthree;|&ltimes;|&ltlarr;|&ltquest;|&ltrPar;|&ltri;|&ltrie;|&ltrif;|&notin;|&notinE;|&notindot;|&notinva;|&notinvb;|&notinvc;|&notni;|&notniva;|&notnivb;|&notnivc;|&parallel;|&timesb;|&timesbar;|&timesd;|&(?:AElig|AMP|Aacute|Acirc|Agrave|Aring|Atilde|Auml|COPY|Ccedil|ETH|Eacute|Ecirc|Egrave|Euml|GT|Iacute|Icirc|Igrave|Iuml|LT|Ntilde|Oacute|Ocirc|Ograve|Oslash|Otilde|Ouml|QUOT|REG|THORN|Uacute|Ucirc|Ugrave|Uuml|Yacute|aacute|acirc|acute|aelig|agrave|amp|aring|atilde|auml|brvbar|ccedil|cedil|cent|copy|curren|deg|divide|eacute|ecirc|egrave|eth|euml|frac12|frac14|frac34|gt|iacute|icirc|iexcl|igrave|iquest|iuml|laquo|lt|macr|micro|middot|nbsp|not|ntilde|oacute|ocirc|ograve|ordf|ordm|oslash|otilde|ouml|para|plusmn|pound|quot|raquo|reg|sect|shy|sup1|sup2|sup3|szlig|thorn|times|uacute|ucirc|ugrave|uml|uuml|yacute|yen|yuml|#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+);?/g
  };
  var namedReferences = {};
  namedReferences["xml"] = generateNamedReferences(`lt~<~gt~>~quot~"~apos~'~amp~&`);
  namedReferences["html4"] = generateNamedReferences(`apos~'~OElig~\u0152~oelig~\u0153~Scaron~\u0160~scaron~\u0161~Yuml~\u0178~circ~\u02C6~tilde~\u02DC~ensp~\u2002~emsp~\u2003~thinsp~\u2009~zwnj~\u200C~zwj~\u200D~lrm~\u200E~rlm~\u200F~ndash~\u2013~mdash~\u2014~lsquo~\u2018~rsquo~\u2019~sbquo~\u201A~ldquo~\u201C~rdquo~\u201D~bdquo~\u201E~dagger~\u2020~Dagger~\u2021~permil~\u2030~lsaquo~\u2039~rsaquo~\u203A~euro~\u20AC~fnof~\u0192~Alpha~\u0391~Beta~\u0392~Gamma~\u0393~Delta~\u0394~Epsilon~\u0395~Zeta~\u0396~Eta~\u0397~Theta~\u0398~Iota~\u0399~Kappa~\u039A~Lambda~\u039B~Mu~\u039C~Nu~\u039D~Xi~\u039E~Omicron~\u039F~Pi~\u03A0~Rho~\u03A1~Sigma~\u03A3~Tau~\u03A4~Upsilon~\u03A5~Phi~\u03A6~Chi~\u03A7~Psi~\u03A8~Omega~\u03A9~alpha~\u03B1~beta~\u03B2~gamma~\u03B3~delta~\u03B4~epsilon~\u03B5~zeta~\u03B6~eta~\u03B7~theta~\u03B8~iota~\u03B9~kappa~\u03BA~lambda~\u03BB~mu~\u03BC~nu~\u03BD~xi~\u03BE~omicron~\u03BF~pi~\u03C0~rho~\u03C1~sigmaf~\u03C2~sigma~\u03C3~tau~\u03C4~upsilon~\u03C5~phi~\u03C6~chi~\u03C7~psi~\u03C8~omega~\u03C9~thetasym~\u03D1~upsih~\u03D2~piv~\u03D6~bull~\u2022~hellip~\u2026~prime~\u2032~Prime~\u2033~oline~\u203E~frasl~\u2044~weierp~\u2118~image~\u2111~real~\u211C~trade~\u2122~alefsym~\u2135~larr~\u2190~uarr~\u2191~rarr~\u2192~darr~\u2193~harr~\u2194~crarr~\u21B5~lArr~\u21D0~uArr~\u21D1~rArr~\u21D2~dArr~\u21D3~hArr~\u21D4~forall~\u2200~part~\u2202~exist~\u2203~empty~\u2205~nabla~\u2207~isin~\u2208~notin~\u2209~ni~\u220B~prod~\u220F~sum~\u2211~minus~\u2212~lowast~\u2217~radic~\u221A~prop~\u221D~infin~\u221E~ang~\u2220~and~\u2227~or~\u2228~cap~\u2229~cup~\u222A~int~\u222B~there4~\u2234~sim~\u223C~cong~\u2245~asymp~\u2248~ne~\u2260~equiv~\u2261~le~\u2264~ge~\u2265~sub~\u2282~sup~\u2283~nsub~\u2284~sube~\u2286~supe~\u2287~oplus~\u2295~otimes~\u2297~perp~\u22A5~sdot~\u22C5~lceil~\u2308~rceil~\u2309~lfloor~\u230A~rfloor~\u230B~lang~\u2329~rang~\u232A~loz~\u25CA~spades~\u2660~clubs~\u2663~hearts~\u2665~diams~\u2666~~nbsp~\xA0~iexcl~\xA1~cent~\xA2~pound~\xA3~curren~\xA4~yen~\xA5~brvbar~\xA6~sect~\xA7~uml~\xA8~copy~\xA9~ordf~\xAA~laquo~\xAB~not~\xAC~shy~\xAD~reg~\xAE~macr~\xAF~deg~\xB0~plusmn~\xB1~sup2~\xB2~sup3~\xB3~acute~\xB4~micro~\xB5~para~\xB6~middot~\xB7~cedil~\xB8~sup1~\xB9~ordm~\xBA~raquo~\xBB~frac14~\xBC~frac12~\xBD~frac34~\xBE~iquest~\xBF~Agrave~\xC0~Aacute~\xC1~Acirc~\xC2~Atilde~\xC3~Auml~\xC4~Aring~\xC5~AElig~\xC6~Ccedil~\xC7~Egrave~\xC8~Eacute~\xC9~Ecirc~\xCA~Euml~\xCB~Igrave~\xCC~Iacute~\xCD~Icirc~\xCE~Iuml~\xCF~ETH~\xD0~Ntilde~\xD1~Ograve~\xD2~Oacute~\xD3~Ocirc~\xD4~Otilde~\xD5~Ouml~\xD6~times~\xD7~Oslash~\xD8~Ugrave~\xD9~Uacute~\xDA~Ucirc~\xDB~Uuml~\xDC~Yacute~\xDD~THORN~\xDE~szlig~\xDF~agrave~\xE0~aacute~\xE1~acirc~\xE2~atilde~\xE3~auml~\xE4~aring~\xE5~aelig~\xE6~ccedil~\xE7~egrave~\xE8~eacute~\xE9~ecirc~\xEA~euml~\xEB~igrave~\xEC~iacute~\xED~icirc~\xEE~iuml~\xEF~eth~\xF0~ntilde~\xF1~ograve~\xF2~oacute~\xF3~ocirc~\xF4~otilde~\xF5~ouml~\xF6~divide~\xF7~oslash~\xF8~ugrave~\xF9~uacute~\xFA~ucirc~\xFB~uuml~\xFC~yacute~\xFD~thorn~\xFE~yuml~\xFF~quot~"~amp~&~lt~<~gt~>`);
  namedReferences["html5"] = generateNamedReferences('Abreve~\u0102~Acy~\u0410~Afr~\u{1D504}~Amacr~\u0100~And~\u2A53~Aogon~\u0104~Aopf~\u{1D538}~ApplyFunction~\u2061~Ascr~\u{1D49C}~Assign~\u2254~Backslash~\u2216~Barv~\u2AE7~Barwed~\u2306~Bcy~\u0411~Because~\u2235~Bernoullis~\u212C~Bfr~\u{1D505}~Bopf~\u{1D539}~Breve~\u02D8~Bscr~\u212C~Bumpeq~\u224E~CHcy~\u0427~Cacute~\u0106~Cap~\u22D2~CapitalDifferentialD~\u2145~Cayleys~\u212D~Ccaron~\u010C~Ccirc~\u0108~Cconint~\u2230~Cdot~\u010A~Cedilla~\xB8~CenterDot~\xB7~Cfr~\u212D~CircleDot~\u2299~CircleMinus~\u2296~CirclePlus~\u2295~CircleTimes~\u2297~ClockwiseContourIntegral~\u2232~CloseCurlyDoubleQuote~\u201D~CloseCurlyQuote~\u2019~Colon~\u2237~Colone~\u2A74~Congruent~\u2261~Conint~\u222F~ContourIntegral~\u222E~Copf~\u2102~Coproduct~\u2210~CounterClockwiseContourIntegral~\u2233~Cross~\u2A2F~Cscr~\u{1D49E}~Cup~\u22D3~CupCap~\u224D~DD~\u2145~DDotrahd~\u2911~DJcy~\u0402~DScy~\u0405~DZcy~\u040F~Darr~\u21A1~Dashv~\u2AE4~Dcaron~\u010E~Dcy~\u0414~Del~\u2207~Dfr~\u{1D507}~DiacriticalAcute~\xB4~DiacriticalDot~\u02D9~DiacriticalDoubleAcute~\u02DD~DiacriticalGrave~`~DiacriticalTilde~\u02DC~Diamond~\u22C4~DifferentialD~\u2146~Dopf~\u{1D53B}~Dot~\xA8~DotDot~\u20DC~DotEqual~\u2250~DoubleContourIntegral~\u222F~DoubleDot~\xA8~DoubleDownArrow~\u21D3~DoubleLeftArrow~\u21D0~DoubleLeftRightArrow~\u21D4~DoubleLeftTee~\u2AE4~DoubleLongLeftArrow~\u27F8~DoubleLongLeftRightArrow~\u27FA~DoubleLongRightArrow~\u27F9~DoubleRightArrow~\u21D2~DoubleRightTee~\u22A8~DoubleUpArrow~\u21D1~DoubleUpDownArrow~\u21D5~DoubleVerticalBar~\u2225~DownArrow~\u2193~DownArrowBar~\u2913~DownArrowUpArrow~\u21F5~DownBreve~\u0311~DownLeftRightVector~\u2950~DownLeftTeeVector~\u295E~DownLeftVector~\u21BD~DownLeftVectorBar~\u2956~DownRightTeeVector~\u295F~DownRightVector~\u21C1~DownRightVectorBar~\u2957~DownTee~\u22A4~DownTeeArrow~\u21A7~Downarrow~\u21D3~Dscr~\u{1D49F}~Dstrok~\u0110~ENG~\u014A~Ecaron~\u011A~Ecy~\u042D~Edot~\u0116~Efr~\u{1D508}~Element~\u2208~Emacr~\u0112~EmptySmallSquare~\u25FB~EmptyVerySmallSquare~\u25AB~Eogon~\u0118~Eopf~\u{1D53C}~Equal~\u2A75~EqualTilde~\u2242~Equilibrium~\u21CC~Escr~\u2130~Esim~\u2A73~Exists~\u2203~ExponentialE~\u2147~Fcy~\u0424~Ffr~\u{1D509}~FilledSmallSquare~\u25FC~FilledVerySmallSquare~\u25AA~Fopf~\u{1D53D}~ForAll~\u2200~Fouriertrf~\u2131~Fscr~\u2131~GJcy~\u0403~Gammad~\u03DC~Gbreve~\u011E~Gcedil~\u0122~Gcirc~\u011C~Gcy~\u0413~Gdot~\u0120~Gfr~\u{1D50A}~Gg~\u22D9~Gopf~\u{1D53E}~GreaterEqual~\u2265~GreaterEqualLess~\u22DB~GreaterFullEqual~\u2267~GreaterGreater~\u2AA2~GreaterLess~\u2277~GreaterSlantEqual~\u2A7E~GreaterTilde~\u2273~Gscr~\u{1D4A2}~Gt~\u226B~HARDcy~\u042A~Hacek~\u02C7~Hat~^~Hcirc~\u0124~Hfr~\u210C~HilbertSpace~\u210B~Hopf~\u210D~HorizontalLine~\u2500~Hscr~\u210B~Hstrok~\u0126~HumpDownHump~\u224E~HumpEqual~\u224F~IEcy~\u0415~IJlig~\u0132~IOcy~\u0401~Icy~\u0418~Idot~\u0130~Ifr~\u2111~Im~\u2111~Imacr~\u012A~ImaginaryI~\u2148~Implies~\u21D2~Int~\u222C~Integral~\u222B~Intersection~\u22C2~InvisibleComma~\u2063~InvisibleTimes~\u2062~Iogon~\u012E~Iopf~\u{1D540}~Iscr~\u2110~Itilde~\u0128~Iukcy~\u0406~Jcirc~\u0134~Jcy~\u0419~Jfr~\u{1D50D}~Jopf~\u{1D541}~Jscr~\u{1D4A5}~Jsercy~\u0408~Jukcy~\u0404~KHcy~\u0425~KJcy~\u040C~Kcedil~\u0136~Kcy~\u041A~Kfr~\u{1D50E}~Kopf~\u{1D542}~Kscr~\u{1D4A6}~LJcy~\u0409~Lacute~\u0139~Lang~\u27EA~Laplacetrf~\u2112~Larr~\u219E~Lcaron~\u013D~Lcedil~\u013B~Lcy~\u041B~LeftAngleBracket~\u27E8~LeftArrow~\u2190~LeftArrowBar~\u21E4~LeftArrowRightArrow~\u21C6~LeftCeiling~\u2308~LeftDoubleBracket~\u27E6~LeftDownTeeVector~\u2961~LeftDownVector~\u21C3~LeftDownVectorBar~\u2959~LeftFloor~\u230A~LeftRightArrow~\u2194~LeftRightVector~\u294E~LeftTee~\u22A3~LeftTeeArrow~\u21A4~LeftTeeVector~\u295A~LeftTriangle~\u22B2~LeftTriangleBar~\u29CF~LeftTriangleEqual~\u22B4~LeftUpDownVector~\u2951~LeftUpTeeVector~\u2960~LeftUpVector~\u21BF~LeftUpVectorBar~\u2958~LeftVector~\u21BC~LeftVectorBar~\u2952~Leftarrow~\u21D0~Leftrightarrow~\u21D4~LessEqualGreater~\u22DA~LessFullEqual~\u2266~LessGreater~\u2276~LessLess~\u2AA1~LessSlantEqual~\u2A7D~LessTilde~\u2272~Lfr~\u{1D50F}~Ll~\u22D8~Lleftarrow~\u21DA~Lmidot~\u013F~LongLeftArrow~\u27F5~LongLeftRightArrow~\u27F7~LongRightArrow~\u27F6~Longleftarrow~\u27F8~Longleftrightarrow~\u27FA~Longrightarrow~\u27F9~Lopf~\u{1D543}~LowerLeftArrow~\u2199~LowerRightArrow~\u2198~Lscr~\u2112~Lsh~\u21B0~Lstrok~\u0141~Lt~\u226A~Map~\u2905~Mcy~\u041C~MediumSpace~\u205F~Mellintrf~\u2133~Mfr~\u{1D510}~MinusPlus~\u2213~Mopf~\u{1D544}~Mscr~\u2133~NJcy~\u040A~Nacute~\u0143~Ncaron~\u0147~Ncedil~\u0145~Ncy~\u041D~NegativeMediumSpace~\u200B~NegativeThickSpace~\u200B~NegativeThinSpace~\u200B~NegativeVeryThinSpace~\u200B~NestedGreaterGreater~\u226B~NestedLessLess~\u226A~NewLine~\n~Nfr~\u{1D511}~NoBreak~\u2060~NonBreakingSpace~\xA0~Nopf~\u2115~Not~\u2AEC~NotCongruent~\u2262~NotCupCap~\u226D~NotDoubleVerticalBar~\u2226~NotElement~\u2209~NotEqual~\u2260~NotEqualTilde~\u2242\u0338~NotExists~\u2204~NotGreater~\u226F~NotGreaterEqual~\u2271~NotGreaterFullEqual~\u2267\u0338~NotGreaterGreater~\u226B\u0338~NotGreaterLess~\u2279~NotGreaterSlantEqual~\u2A7E\u0338~NotGreaterTilde~\u2275~NotHumpDownHump~\u224E\u0338~NotHumpEqual~\u224F\u0338~NotLeftTriangle~\u22EA~NotLeftTriangleBar~\u29CF\u0338~NotLeftTriangleEqual~\u22EC~NotLess~\u226E~NotLessEqual~\u2270~NotLessGreater~\u2278~NotLessLess~\u226A\u0338~NotLessSlantEqual~\u2A7D\u0338~NotLessTilde~\u2274~NotNestedGreaterGreater~\u2AA2\u0338~NotNestedLessLess~\u2AA1\u0338~NotPrecedes~\u2280~NotPrecedesEqual~\u2AAF\u0338~NotPrecedesSlantEqual~\u22E0~NotReverseElement~\u220C~NotRightTriangle~\u22EB~NotRightTriangleBar~\u29D0\u0338~NotRightTriangleEqual~\u22ED~NotSquareSubset~\u228F\u0338~NotSquareSubsetEqual~\u22E2~NotSquareSuperset~\u2290\u0338~NotSquareSupersetEqual~\u22E3~NotSubset~\u2282\u20D2~NotSubsetEqual~\u2288~NotSucceeds~\u2281~NotSucceedsEqual~\u2AB0\u0338~NotSucceedsSlantEqual~\u22E1~NotSucceedsTilde~\u227F\u0338~NotSuperset~\u2283\u20D2~NotSupersetEqual~\u2289~NotTilde~\u2241~NotTildeEqual~\u2244~NotTildeFullEqual~\u2247~NotTildeTilde~\u2249~NotVerticalBar~\u2224~Nscr~\u{1D4A9}~Ocy~\u041E~Odblac~\u0150~Ofr~\u{1D512}~Omacr~\u014C~Oopf~\u{1D546}~OpenCurlyDoubleQuote~\u201C~OpenCurlyQuote~\u2018~Or~\u2A54~Oscr~\u{1D4AA}~Otimes~\u2A37~OverBar~\u203E~OverBrace~\u23DE~OverBracket~\u23B4~OverParenthesis~\u23DC~PartialD~\u2202~Pcy~\u041F~Pfr~\u{1D513}~PlusMinus~\xB1~Poincareplane~\u210C~Popf~\u2119~Pr~\u2ABB~Precedes~\u227A~PrecedesEqual~\u2AAF~PrecedesSlantEqual~\u227C~PrecedesTilde~\u227E~Product~\u220F~Proportion~\u2237~Proportional~\u221D~Pscr~\u{1D4AB}~Qfr~\u{1D514}~Qopf~\u211A~Qscr~\u{1D4AC}~RBarr~\u2910~Racute~\u0154~Rang~\u27EB~Rarr~\u21A0~Rarrtl~\u2916~Rcaron~\u0158~Rcedil~\u0156~Rcy~\u0420~Re~\u211C~ReverseElement~\u220B~ReverseEquilibrium~\u21CB~ReverseUpEquilibrium~\u296F~Rfr~\u211C~RightAngleBracket~\u27E9~RightArrow~\u2192~RightArrowBar~\u21E5~RightArrowLeftArrow~\u21C4~RightCeiling~\u2309~RightDoubleBracket~\u27E7~RightDownTeeVector~\u295D~RightDownVector~\u21C2~RightDownVectorBar~\u2955~RightFloor~\u230B~RightTee~\u22A2~RightTeeArrow~\u21A6~RightTeeVector~\u295B~RightTriangle~\u22B3~RightTriangleBar~\u29D0~RightTriangleEqual~\u22B5~RightUpDownVector~\u294F~RightUpTeeVector~\u295C~RightUpVector~\u21BE~RightUpVectorBar~\u2954~RightVector~\u21C0~RightVectorBar~\u2953~Rightarrow~\u21D2~Ropf~\u211D~RoundImplies~\u2970~Rrightarrow~\u21DB~Rscr~\u211B~Rsh~\u21B1~RuleDelayed~\u29F4~SHCHcy~\u0429~SHcy~\u0428~SOFTcy~\u042C~Sacute~\u015A~Sc~\u2ABC~Scedil~\u015E~Scirc~\u015C~Scy~\u0421~Sfr~\u{1D516}~ShortDownArrow~\u2193~ShortLeftArrow~\u2190~ShortRightArrow~\u2192~ShortUpArrow~\u2191~SmallCircle~\u2218~Sopf~\u{1D54A}~Sqrt~\u221A~Square~\u25A1~SquareIntersection~\u2293~SquareSubset~\u228F~SquareSubsetEqual~\u2291~SquareSuperset~\u2290~SquareSupersetEqual~\u2292~SquareUnion~\u2294~Sscr~\u{1D4AE}~Star~\u22C6~Sub~\u22D0~Subset~\u22D0~SubsetEqual~\u2286~Succeeds~\u227B~SucceedsEqual~\u2AB0~SucceedsSlantEqual~\u227D~SucceedsTilde~\u227F~SuchThat~\u220B~Sum~\u2211~Sup~\u22D1~Superset~\u2283~SupersetEqual~\u2287~Supset~\u22D1~TRADE~\u2122~TSHcy~\u040B~TScy~\u0426~Tab~	~Tcaron~\u0164~Tcedil~\u0162~Tcy~\u0422~Tfr~\u{1D517}~Therefore~\u2234~ThickSpace~\u205F\u200A~ThinSpace~\u2009~Tilde~\u223C~TildeEqual~\u2243~TildeFullEqual~\u2245~TildeTilde~\u2248~Topf~\u{1D54B}~TripleDot~\u20DB~Tscr~\u{1D4AF}~Tstrok~\u0166~Uarr~\u219F~Uarrocir~\u2949~Ubrcy~\u040E~Ubreve~\u016C~Ucy~\u0423~Udblac~\u0170~Ufr~\u{1D518}~Umacr~\u016A~UnderBar~_~UnderBrace~\u23DF~UnderBracket~\u23B5~UnderParenthesis~\u23DD~Union~\u22C3~UnionPlus~\u228E~Uogon~\u0172~Uopf~\u{1D54C}~UpArrow~\u2191~UpArrowBar~\u2912~UpArrowDownArrow~\u21C5~UpDownArrow~\u2195~UpEquilibrium~\u296E~UpTee~\u22A5~UpTeeArrow~\u21A5~Uparrow~\u21D1~Updownarrow~\u21D5~UpperLeftArrow~\u2196~UpperRightArrow~\u2197~Upsi~\u03D2~Uring~\u016E~Uscr~\u{1D4B0}~Utilde~\u0168~VDash~\u22AB~Vbar~\u2AEB~Vcy~\u0412~Vdash~\u22A9~Vdashl~\u2AE6~Vee~\u22C1~Verbar~\u2016~Vert~\u2016~VerticalBar~\u2223~VerticalLine~|~VerticalSeparator~\u2758~VerticalTilde~\u2240~VeryThinSpace~\u200A~Vfr~\u{1D519}~Vopf~\u{1D54D}~Vscr~\u{1D4B1}~Vvdash~\u22AA~Wcirc~\u0174~Wedge~\u22C0~Wfr~\u{1D51A}~Wopf~\u{1D54E}~Wscr~\u{1D4B2}~Xfr~\u{1D51B}~Xopf~\u{1D54F}~Xscr~\u{1D4B3}~YAcy~\u042F~YIcy~\u0407~YUcy~\u042E~Ycirc~\u0176~Ycy~\u042B~Yfr~\u{1D51C}~Yopf~\u{1D550}~Yscr~\u{1D4B4}~ZHcy~\u0416~Zacute~\u0179~Zcaron~\u017D~Zcy~\u0417~Zdot~\u017B~ZeroWidthSpace~\u200B~Zfr~\u2128~Zopf~\u2124~Zscr~\u{1D4B5}~abreve~\u0103~ac~\u223E~acE~\u223E\u0333~acd~\u223F~acy~\u0430~af~\u2061~afr~\u{1D51E}~aleph~\u2135~amacr~\u0101~amalg~\u2A3F~andand~\u2A55~andd~\u2A5C~andslope~\u2A58~andv~\u2A5A~ange~\u29A4~angle~\u2220~angmsd~\u2221~angmsdaa~\u29A8~angmsdab~\u29A9~angmsdac~\u29AA~angmsdad~\u29AB~angmsdae~\u29AC~angmsdaf~\u29AD~angmsdag~\u29AE~angmsdah~\u29AF~angrt~\u221F~angrtvb~\u22BE~angrtvbd~\u299D~angsph~\u2222~angst~\xC5~angzarr~\u237C~aogon~\u0105~aopf~\u{1D552}~ap~\u2248~apE~\u2A70~apacir~\u2A6F~ape~\u224A~apid~\u224B~approx~\u2248~approxeq~\u224A~ascr~\u{1D4B6}~ast~*~asympeq~\u224D~awconint~\u2233~awint~\u2A11~bNot~\u2AED~backcong~\u224C~backepsilon~\u03F6~backprime~\u2035~backsim~\u223D~backsimeq~\u22CD~barvee~\u22BD~barwed~\u2305~barwedge~\u2305~bbrk~\u23B5~bbrktbrk~\u23B6~bcong~\u224C~bcy~\u0431~becaus~\u2235~because~\u2235~bemptyv~\u29B0~bepsi~\u03F6~bernou~\u212C~beth~\u2136~between~\u226C~bfr~\u{1D51F}~bigcap~\u22C2~bigcirc~\u25EF~bigcup~\u22C3~bigodot~\u2A00~bigoplus~\u2A01~bigotimes~\u2A02~bigsqcup~\u2A06~bigstar~\u2605~bigtriangledown~\u25BD~bigtriangleup~\u25B3~biguplus~\u2A04~bigvee~\u22C1~bigwedge~\u22C0~bkarow~\u290D~blacklozenge~\u29EB~blacksquare~\u25AA~blacktriangle~\u25B4~blacktriangledown~\u25BE~blacktriangleleft~\u25C2~blacktriangleright~\u25B8~blank~\u2423~blk12~\u2592~blk14~\u2591~blk34~\u2593~block~\u2588~bne~=\u20E5~bnequiv~\u2261\u20E5~bnot~\u2310~bopf~\u{1D553}~bot~\u22A5~bottom~\u22A5~bowtie~\u22C8~boxDL~\u2557~boxDR~\u2554~boxDl~\u2556~boxDr~\u2553~boxH~\u2550~boxHD~\u2566~boxHU~\u2569~boxHd~\u2564~boxHu~\u2567~boxUL~\u255D~boxUR~\u255A~boxUl~\u255C~boxUr~\u2559~boxV~\u2551~boxVH~\u256C~boxVL~\u2563~boxVR~\u2560~boxVh~\u256B~boxVl~\u2562~boxVr~\u255F~boxbox~\u29C9~boxdL~\u2555~boxdR~\u2552~boxdl~\u2510~boxdr~\u250C~boxh~\u2500~boxhD~\u2565~boxhU~\u2568~boxhd~\u252C~boxhu~\u2534~boxminus~\u229F~boxplus~\u229E~boxtimes~\u22A0~boxuL~\u255B~boxuR~\u2558~boxul~\u2518~boxur~\u2514~boxv~\u2502~boxvH~\u256A~boxvL~\u2561~boxvR~\u255E~boxvh~\u253C~boxvl~\u2524~boxvr~\u251C~bprime~\u2035~breve~\u02D8~bscr~\u{1D4B7}~bsemi~\u204F~bsim~\u223D~bsime~\u22CD~bsol~\\~bsolb~\u29C5~bsolhsub~\u27C8~bullet~\u2022~bump~\u224E~bumpE~\u2AAE~bumpe~\u224F~bumpeq~\u224F~cacute~\u0107~capand~\u2A44~capbrcup~\u2A49~capcap~\u2A4B~capcup~\u2A47~capdot~\u2A40~caps~\u2229\uFE00~caret~\u2041~caron~\u02C7~ccaps~\u2A4D~ccaron~\u010D~ccirc~\u0109~ccups~\u2A4C~ccupssm~\u2A50~cdot~\u010B~cemptyv~\u29B2~centerdot~\xB7~cfr~\u{1D520}~chcy~\u0447~check~\u2713~checkmark~\u2713~cir~\u25CB~cirE~\u29C3~circeq~\u2257~circlearrowleft~\u21BA~circlearrowright~\u21BB~circledR~\xAE~circledS~\u24C8~circledast~\u229B~circledcirc~\u229A~circleddash~\u229D~cire~\u2257~cirfnint~\u2A10~cirmid~\u2AEF~cirscir~\u29C2~clubsuit~\u2663~colon~:~colone~\u2254~coloneq~\u2254~comma~,~commat~@~comp~\u2201~compfn~\u2218~complement~\u2201~complexes~\u2102~congdot~\u2A6D~conint~\u222E~copf~\u{1D554}~coprod~\u2210~copysr~\u2117~cross~\u2717~cscr~\u{1D4B8}~csub~\u2ACF~csube~\u2AD1~csup~\u2AD0~csupe~\u2AD2~ctdot~\u22EF~cudarrl~\u2938~cudarrr~\u2935~cuepr~\u22DE~cuesc~\u22DF~cularr~\u21B6~cularrp~\u293D~cupbrcap~\u2A48~cupcap~\u2A46~cupcup~\u2A4A~cupdot~\u228D~cupor~\u2A45~cups~\u222A\uFE00~curarr~\u21B7~curarrm~\u293C~curlyeqprec~\u22DE~curlyeqsucc~\u22DF~curlyvee~\u22CE~curlywedge~\u22CF~curvearrowleft~\u21B6~curvearrowright~\u21B7~cuvee~\u22CE~cuwed~\u22CF~cwconint~\u2232~cwint~\u2231~cylcty~\u232D~dHar~\u2965~daleth~\u2138~dash~\u2010~dashv~\u22A3~dbkarow~\u290F~dblac~\u02DD~dcaron~\u010F~dcy~\u0434~dd~\u2146~ddagger~\u2021~ddarr~\u21CA~ddotseq~\u2A77~demptyv~\u29B1~dfisht~\u297F~dfr~\u{1D521}~dharl~\u21C3~dharr~\u21C2~diam~\u22C4~diamond~\u22C4~diamondsuit~\u2666~die~\xA8~digamma~\u03DD~disin~\u22F2~div~\xF7~divideontimes~\u22C7~divonx~\u22C7~djcy~\u0452~dlcorn~\u231E~dlcrop~\u230D~dollar~$~dopf~\u{1D555}~dot~\u02D9~doteq~\u2250~doteqdot~\u2251~dotminus~\u2238~dotplus~\u2214~dotsquare~\u22A1~doublebarwedge~\u2306~downarrow~\u2193~downdownarrows~\u21CA~downharpoonleft~\u21C3~downharpoonright~\u21C2~drbkarow~\u2910~drcorn~\u231F~drcrop~\u230C~dscr~\u{1D4B9}~dscy~\u0455~dsol~\u29F6~dstrok~\u0111~dtdot~\u22F1~dtri~\u25BF~dtrif~\u25BE~duarr~\u21F5~duhar~\u296F~dwangle~\u29A6~dzcy~\u045F~dzigrarr~\u27FF~eDDot~\u2A77~eDot~\u2251~easter~\u2A6E~ecaron~\u011B~ecir~\u2256~ecolon~\u2255~ecy~\u044D~edot~\u0117~ee~\u2147~efDot~\u2252~efr~\u{1D522}~eg~\u2A9A~egs~\u2A96~egsdot~\u2A98~el~\u2A99~elinters~\u23E7~ell~\u2113~els~\u2A95~elsdot~\u2A97~emacr~\u0113~emptyset~\u2205~emptyv~\u2205~emsp13~\u2004~emsp14~\u2005~eng~\u014B~eogon~\u0119~eopf~\u{1D556}~epar~\u22D5~eparsl~\u29E3~eplus~\u2A71~epsi~\u03B5~epsiv~\u03F5~eqcirc~\u2256~eqcolon~\u2255~eqsim~\u2242~eqslantgtr~\u2A96~eqslantless~\u2A95~equals~=~equest~\u225F~equivDD~\u2A78~eqvparsl~\u29E5~erDot~\u2253~erarr~\u2971~escr~\u212F~esdot~\u2250~esim~\u2242~excl~!~expectation~\u2130~exponentiale~\u2147~fallingdotseq~\u2252~fcy~\u0444~female~\u2640~ffilig~\uFB03~fflig~\uFB00~ffllig~\uFB04~ffr~\u{1D523}~filig~\uFB01~fjlig~fj~flat~\u266D~fllig~\uFB02~fltns~\u25B1~fopf~\u{1D557}~fork~\u22D4~forkv~\u2AD9~fpartint~\u2A0D~frac13~\u2153~frac15~\u2155~frac16~\u2159~frac18~\u215B~frac23~\u2154~frac25~\u2156~frac35~\u2157~frac38~\u215C~frac45~\u2158~frac56~\u215A~frac58~\u215D~frac78~\u215E~frown~\u2322~fscr~\u{1D4BB}~gE~\u2267~gEl~\u2A8C~gacute~\u01F5~gammad~\u03DD~gap~\u2A86~gbreve~\u011F~gcirc~\u011D~gcy~\u0433~gdot~\u0121~gel~\u22DB~geq~\u2265~geqq~\u2267~geqslant~\u2A7E~ges~\u2A7E~gescc~\u2AA9~gesdot~\u2A80~gesdoto~\u2A82~gesdotol~\u2A84~gesl~\u22DB\uFE00~gesles~\u2A94~gfr~\u{1D524}~gg~\u226B~ggg~\u22D9~gimel~\u2137~gjcy~\u0453~gl~\u2277~glE~\u2A92~gla~\u2AA5~glj~\u2AA4~gnE~\u2269~gnap~\u2A8A~gnapprox~\u2A8A~gne~\u2A88~gneq~\u2A88~gneqq~\u2269~gnsim~\u22E7~gopf~\u{1D558}~grave~`~gscr~\u210A~gsim~\u2273~gsime~\u2A8E~gsiml~\u2A90~gtcc~\u2AA7~gtcir~\u2A7A~gtdot~\u22D7~gtlPar~\u2995~gtquest~\u2A7C~gtrapprox~\u2A86~gtrarr~\u2978~gtrdot~\u22D7~gtreqless~\u22DB~gtreqqless~\u2A8C~gtrless~\u2277~gtrsim~\u2273~gvertneqq~\u2269\uFE00~gvnE~\u2269\uFE00~hairsp~\u200A~half~\xBD~hamilt~\u210B~hardcy~\u044A~harrcir~\u2948~harrw~\u21AD~hbar~\u210F~hcirc~\u0125~heartsuit~\u2665~hercon~\u22B9~hfr~\u{1D525}~hksearow~\u2925~hkswarow~\u2926~hoarr~\u21FF~homtht~\u223B~hookleftarrow~\u21A9~hookrightarrow~\u21AA~hopf~\u{1D559}~horbar~\u2015~hscr~\u{1D4BD}~hslash~\u210F~hstrok~\u0127~hybull~\u2043~hyphen~\u2010~ic~\u2063~icy~\u0438~iecy~\u0435~iff~\u21D4~ifr~\u{1D526}~ii~\u2148~iiiint~\u2A0C~iiint~\u222D~iinfin~\u29DC~iiota~\u2129~ijlig~\u0133~imacr~\u012B~imagline~\u2110~imagpart~\u2111~imath~\u0131~imof~\u22B7~imped~\u01B5~in~\u2208~incare~\u2105~infintie~\u29DD~inodot~\u0131~intcal~\u22BA~integers~\u2124~intercal~\u22BA~intlarhk~\u2A17~intprod~\u2A3C~iocy~\u0451~iogon~\u012F~iopf~\u{1D55A}~iprod~\u2A3C~iscr~\u{1D4BE}~isinE~\u22F9~isindot~\u22F5~isins~\u22F4~isinsv~\u22F3~isinv~\u2208~it~\u2062~itilde~\u0129~iukcy~\u0456~jcirc~\u0135~jcy~\u0439~jfr~\u{1D527}~jmath~\u0237~jopf~\u{1D55B}~jscr~\u{1D4BF}~jsercy~\u0458~jukcy~\u0454~kappav~\u03F0~kcedil~\u0137~kcy~\u043A~kfr~\u{1D528}~kgreen~\u0138~khcy~\u0445~kjcy~\u045C~kopf~\u{1D55C}~kscr~\u{1D4C0}~lAarr~\u21DA~lAtail~\u291B~lBarr~\u290E~lE~\u2266~lEg~\u2A8B~lHar~\u2962~lacute~\u013A~laemptyv~\u29B4~lagran~\u2112~langd~\u2991~langle~\u27E8~lap~\u2A85~larrb~\u21E4~larrbfs~\u291F~larrfs~\u291D~larrhk~\u21A9~larrlp~\u21AB~larrpl~\u2939~larrsim~\u2973~larrtl~\u21A2~lat~\u2AAB~latail~\u2919~late~\u2AAD~lates~\u2AAD\uFE00~lbarr~\u290C~lbbrk~\u2772~lbrace~{~lbrack~[~lbrke~\u298B~lbrksld~\u298F~lbrkslu~\u298D~lcaron~\u013E~lcedil~\u013C~lcub~{~lcy~\u043B~ldca~\u2936~ldquor~\u201E~ldrdhar~\u2967~ldrushar~\u294B~ldsh~\u21B2~leftarrow~\u2190~leftarrowtail~\u21A2~leftharpoondown~\u21BD~leftharpoonup~\u21BC~leftleftarrows~\u21C7~leftrightarrow~\u2194~leftrightarrows~\u21C6~leftrightharpoons~\u21CB~leftrightsquigarrow~\u21AD~leftthreetimes~\u22CB~leg~\u22DA~leq~\u2264~leqq~\u2266~leqslant~\u2A7D~les~\u2A7D~lescc~\u2AA8~lesdot~\u2A7F~lesdoto~\u2A81~lesdotor~\u2A83~lesg~\u22DA\uFE00~lesges~\u2A93~lessapprox~\u2A85~lessdot~\u22D6~lesseqgtr~\u22DA~lesseqqgtr~\u2A8B~lessgtr~\u2276~lesssim~\u2272~lfisht~\u297C~lfr~\u{1D529}~lg~\u2276~lgE~\u2A91~lhard~\u21BD~lharu~\u21BC~lharul~\u296A~lhblk~\u2584~ljcy~\u0459~ll~\u226A~llarr~\u21C7~llcorner~\u231E~llhard~\u296B~lltri~\u25FA~lmidot~\u0140~lmoust~\u23B0~lmoustache~\u23B0~lnE~\u2268~lnap~\u2A89~lnapprox~\u2A89~lne~\u2A87~lneq~\u2A87~lneqq~\u2268~lnsim~\u22E6~loang~\u27EC~loarr~\u21FD~lobrk~\u27E6~longleftarrow~\u27F5~longleftrightarrow~\u27F7~longmapsto~\u27FC~longrightarrow~\u27F6~looparrowleft~\u21AB~looparrowright~\u21AC~lopar~\u2985~lopf~\u{1D55D}~loplus~\u2A2D~lotimes~\u2A34~lowbar~_~lozenge~\u25CA~lozf~\u29EB~lpar~(~lparlt~\u2993~lrarr~\u21C6~lrcorner~\u231F~lrhar~\u21CB~lrhard~\u296D~lrtri~\u22BF~lscr~\u{1D4C1}~lsh~\u21B0~lsim~\u2272~lsime~\u2A8D~lsimg~\u2A8F~lsqb~[~lsquor~\u201A~lstrok~\u0142~ltcc~\u2AA6~ltcir~\u2A79~ltdot~\u22D6~lthree~\u22CB~ltimes~\u22C9~ltlarr~\u2976~ltquest~\u2A7B~ltrPar~\u2996~ltri~\u25C3~ltrie~\u22B4~ltrif~\u25C2~lurdshar~\u294A~luruhar~\u2966~lvertneqq~\u2268\uFE00~lvnE~\u2268\uFE00~mDDot~\u223A~male~\u2642~malt~\u2720~maltese~\u2720~map~\u21A6~mapsto~\u21A6~mapstodown~\u21A7~mapstoleft~\u21A4~mapstoup~\u21A5~marker~\u25AE~mcomma~\u2A29~mcy~\u043C~measuredangle~\u2221~mfr~\u{1D52A}~mho~\u2127~mid~\u2223~midast~*~midcir~\u2AF0~minusb~\u229F~minusd~\u2238~minusdu~\u2A2A~mlcp~\u2ADB~mldr~\u2026~mnplus~\u2213~models~\u22A7~mopf~\u{1D55E}~mp~\u2213~mscr~\u{1D4C2}~mstpos~\u223E~multimap~\u22B8~mumap~\u22B8~nGg~\u22D9\u0338~nGt~\u226B\u20D2~nGtv~\u226B\u0338~nLeftarrow~\u21CD~nLeftrightarrow~\u21CE~nLl~\u22D8\u0338~nLt~\u226A\u20D2~nLtv~\u226A\u0338~nRightarrow~\u21CF~nVDash~\u22AF~nVdash~\u22AE~nacute~\u0144~nang~\u2220\u20D2~nap~\u2249~napE~\u2A70\u0338~napid~\u224B\u0338~napos~\u0149~napprox~\u2249~natur~\u266E~natural~\u266E~naturals~\u2115~nbump~\u224E\u0338~nbumpe~\u224F\u0338~ncap~\u2A43~ncaron~\u0148~ncedil~\u0146~ncong~\u2247~ncongdot~\u2A6D\u0338~ncup~\u2A42~ncy~\u043D~neArr~\u21D7~nearhk~\u2924~nearr~\u2197~nearrow~\u2197~nedot~\u2250\u0338~nequiv~\u2262~nesear~\u2928~nesim~\u2242\u0338~nexist~\u2204~nexists~\u2204~nfr~\u{1D52B}~ngE~\u2267\u0338~nge~\u2271~ngeq~\u2271~ngeqq~\u2267\u0338~ngeqslant~\u2A7E\u0338~nges~\u2A7E\u0338~ngsim~\u2275~ngt~\u226F~ngtr~\u226F~nhArr~\u21CE~nharr~\u21AE~nhpar~\u2AF2~nis~\u22FC~nisd~\u22FA~niv~\u220B~njcy~\u045A~nlArr~\u21CD~nlE~\u2266\u0338~nlarr~\u219A~nldr~\u2025~nle~\u2270~nleftarrow~\u219A~nleftrightarrow~\u21AE~nleq~\u2270~nleqq~\u2266\u0338~nleqslant~\u2A7D\u0338~nles~\u2A7D\u0338~nless~\u226E~nlsim~\u2274~nlt~\u226E~nltri~\u22EA~nltrie~\u22EC~nmid~\u2224~nopf~\u{1D55F}~notinE~\u22F9\u0338~notindot~\u22F5\u0338~notinva~\u2209~notinvb~\u22F7~notinvc~\u22F6~notni~\u220C~notniva~\u220C~notnivb~\u22FE~notnivc~\u22FD~npar~\u2226~nparallel~\u2226~nparsl~\u2AFD\u20E5~npart~\u2202\u0338~npolint~\u2A14~npr~\u2280~nprcue~\u22E0~npre~\u2AAF\u0338~nprec~\u2280~npreceq~\u2AAF\u0338~nrArr~\u21CF~nrarr~\u219B~nrarrc~\u2933\u0338~nrarrw~\u219D\u0338~nrightarrow~\u219B~nrtri~\u22EB~nrtrie~\u22ED~nsc~\u2281~nsccue~\u22E1~nsce~\u2AB0\u0338~nscr~\u{1D4C3}~nshortmid~\u2224~nshortparallel~\u2226~nsim~\u2241~nsime~\u2244~nsimeq~\u2244~nsmid~\u2224~nspar~\u2226~nsqsube~\u22E2~nsqsupe~\u22E3~nsubE~\u2AC5\u0338~nsube~\u2288~nsubset~\u2282\u20D2~nsubseteq~\u2288~nsubseteqq~\u2AC5\u0338~nsucc~\u2281~nsucceq~\u2AB0\u0338~nsup~\u2285~nsupE~\u2AC6\u0338~nsupe~\u2289~nsupset~\u2283\u20D2~nsupseteq~\u2289~nsupseteqq~\u2AC6\u0338~ntgl~\u2279~ntlg~\u2278~ntriangleleft~\u22EA~ntrianglelefteq~\u22EC~ntriangleright~\u22EB~ntrianglerighteq~\u22ED~num~#~numero~\u2116~numsp~\u2007~nvDash~\u22AD~nvHarr~\u2904~nvap~\u224D\u20D2~nvdash~\u22AC~nvge~\u2265\u20D2~nvgt~>\u20D2~nvinfin~\u29DE~nvlArr~\u2902~nvle~\u2264\u20D2~nvlt~<\u20D2~nvltrie~\u22B4\u20D2~nvrArr~\u2903~nvrtrie~\u22B5\u20D2~nvsim~\u223C\u20D2~nwArr~\u21D6~nwarhk~\u2923~nwarr~\u2196~nwarrow~\u2196~nwnear~\u2927~oS~\u24C8~oast~\u229B~ocir~\u229A~ocy~\u043E~odash~\u229D~odblac~\u0151~odiv~\u2A38~odot~\u2299~odsold~\u29BC~ofcir~\u29BF~ofr~\u{1D52C}~ogon~\u02DB~ogt~\u29C1~ohbar~\u29B5~ohm~\u03A9~oint~\u222E~olarr~\u21BA~olcir~\u29BE~olcross~\u29BB~olt~\u29C0~omacr~\u014D~omid~\u29B6~ominus~\u2296~oopf~\u{1D560}~opar~\u29B7~operp~\u29B9~orarr~\u21BB~ord~\u2A5D~order~\u2134~orderof~\u2134~origof~\u22B6~oror~\u2A56~orslope~\u2A57~orv~\u2A5B~oscr~\u2134~osol~\u2298~otimesas~\u2A36~ovbar~\u233D~par~\u2225~parallel~\u2225~parsim~\u2AF3~parsl~\u2AFD~pcy~\u043F~percnt~%~period~.~pertenk~\u2031~pfr~\u{1D52D}~phiv~\u03D5~phmmat~\u2133~phone~\u260E~pitchfork~\u22D4~planck~\u210F~planckh~\u210E~plankv~\u210F~plus~+~plusacir~\u2A23~plusb~\u229E~pluscir~\u2A22~plusdo~\u2214~plusdu~\u2A25~pluse~\u2A72~plussim~\u2A26~plustwo~\u2A27~pm~\xB1~pointint~\u2A15~popf~\u{1D561}~pr~\u227A~prE~\u2AB3~prap~\u2AB7~prcue~\u227C~pre~\u2AAF~prec~\u227A~precapprox~\u2AB7~preccurlyeq~\u227C~preceq~\u2AAF~precnapprox~\u2AB9~precneqq~\u2AB5~precnsim~\u22E8~precsim~\u227E~primes~\u2119~prnE~\u2AB5~prnap~\u2AB9~prnsim~\u22E8~profalar~\u232E~profline~\u2312~profsurf~\u2313~propto~\u221D~prsim~\u227E~prurel~\u22B0~pscr~\u{1D4C5}~puncsp~\u2008~qfr~\u{1D52E}~qint~\u2A0C~qopf~\u{1D562}~qprime~\u2057~qscr~\u{1D4C6}~quaternions~\u210D~quatint~\u2A16~quest~?~questeq~\u225F~rAarr~\u21DB~rAtail~\u291C~rBarr~\u290F~rHar~\u2964~race~\u223D\u0331~racute~\u0155~raemptyv~\u29B3~rangd~\u2992~range~\u29A5~rangle~\u27E9~rarrap~\u2975~rarrb~\u21E5~rarrbfs~\u2920~rarrc~\u2933~rarrfs~\u291E~rarrhk~\u21AA~rarrlp~\u21AC~rarrpl~\u2945~rarrsim~\u2974~rarrtl~\u21A3~rarrw~\u219D~ratail~\u291A~ratio~\u2236~rationals~\u211A~rbarr~\u290D~rbbrk~\u2773~rbrace~}~rbrack~]~rbrke~\u298C~rbrksld~\u298E~rbrkslu~\u2990~rcaron~\u0159~rcedil~\u0157~rcub~}~rcy~\u0440~rdca~\u2937~rdldhar~\u2969~rdquor~\u201D~rdsh~\u21B3~realine~\u211B~realpart~\u211C~reals~\u211D~rect~\u25AD~rfisht~\u297D~rfr~\u{1D52F}~rhard~\u21C1~rharu~\u21C0~rharul~\u296C~rhov~\u03F1~rightarrow~\u2192~rightarrowtail~\u21A3~rightharpoondown~\u21C1~rightharpoonup~\u21C0~rightleftarrows~\u21C4~rightleftharpoons~\u21CC~rightrightarrows~\u21C9~rightsquigarrow~\u219D~rightthreetimes~\u22CC~ring~\u02DA~risingdotseq~\u2253~rlarr~\u21C4~rlhar~\u21CC~rmoust~\u23B1~rmoustache~\u23B1~rnmid~\u2AEE~roang~\u27ED~roarr~\u21FE~robrk~\u27E7~ropar~\u2986~ropf~\u{1D563}~roplus~\u2A2E~rotimes~\u2A35~rpar~)~rpargt~\u2994~rppolint~\u2A12~rrarr~\u21C9~rscr~\u{1D4C7}~rsh~\u21B1~rsqb~]~rsquor~\u2019~rthree~\u22CC~rtimes~\u22CA~rtri~\u25B9~rtrie~\u22B5~rtrif~\u25B8~rtriltri~\u29CE~ruluhar~\u2968~rx~\u211E~sacute~\u015B~sc~\u227B~scE~\u2AB4~scap~\u2AB8~sccue~\u227D~sce~\u2AB0~scedil~\u015F~scirc~\u015D~scnE~\u2AB6~scnap~\u2ABA~scnsim~\u22E9~scpolint~\u2A13~scsim~\u227F~scy~\u0441~sdotb~\u22A1~sdote~\u2A66~seArr~\u21D8~searhk~\u2925~searr~\u2198~searrow~\u2198~semi~;~seswar~\u2929~setminus~\u2216~setmn~\u2216~sext~\u2736~sfr~\u{1D530}~sfrown~\u2322~sharp~\u266F~shchcy~\u0449~shcy~\u0448~shortmid~\u2223~shortparallel~\u2225~sigmav~\u03C2~simdot~\u2A6A~sime~\u2243~simeq~\u2243~simg~\u2A9E~simgE~\u2AA0~siml~\u2A9D~simlE~\u2A9F~simne~\u2246~simplus~\u2A24~simrarr~\u2972~slarr~\u2190~smallsetminus~\u2216~smashp~\u2A33~smeparsl~\u29E4~smid~\u2223~smile~\u2323~smt~\u2AAA~smte~\u2AAC~smtes~\u2AAC\uFE00~softcy~\u044C~sol~/~solb~\u29C4~solbar~\u233F~sopf~\u{1D564}~spadesuit~\u2660~spar~\u2225~sqcap~\u2293~sqcaps~\u2293\uFE00~sqcup~\u2294~sqcups~\u2294\uFE00~sqsub~\u228F~sqsube~\u2291~sqsubset~\u228F~sqsubseteq~\u2291~sqsup~\u2290~sqsupe~\u2292~sqsupset~\u2290~sqsupseteq~\u2292~squ~\u25A1~square~\u25A1~squarf~\u25AA~squf~\u25AA~srarr~\u2192~sscr~\u{1D4C8}~ssetmn~\u2216~ssmile~\u2323~sstarf~\u22C6~star~\u2606~starf~\u2605~straightepsilon~\u03F5~straightphi~\u03D5~strns~\xAF~subE~\u2AC5~subdot~\u2ABD~subedot~\u2AC3~submult~\u2AC1~subnE~\u2ACB~subne~\u228A~subplus~\u2ABF~subrarr~\u2979~subset~\u2282~subseteq~\u2286~subseteqq~\u2AC5~subsetneq~\u228A~subsetneqq~\u2ACB~subsim~\u2AC7~subsub~\u2AD5~subsup~\u2AD3~succ~\u227B~succapprox~\u2AB8~succcurlyeq~\u227D~succeq~\u2AB0~succnapprox~\u2ABA~succneqq~\u2AB6~succnsim~\u22E9~succsim~\u227F~sung~\u266A~supE~\u2AC6~supdot~\u2ABE~supdsub~\u2AD8~supedot~\u2AC4~suphsol~\u27C9~suphsub~\u2AD7~suplarr~\u297B~supmult~\u2AC2~supnE~\u2ACC~supne~\u228B~supplus~\u2AC0~supset~\u2283~supseteq~\u2287~supseteqq~\u2AC6~supsetneq~\u228B~supsetneqq~\u2ACC~supsim~\u2AC8~supsub~\u2AD4~supsup~\u2AD6~swArr~\u21D9~swarhk~\u2926~swarr~\u2199~swarrow~\u2199~swnwar~\u292A~target~\u2316~tbrk~\u23B4~tcaron~\u0165~tcedil~\u0163~tcy~\u0442~tdot~\u20DB~telrec~\u2315~tfr~\u{1D531}~therefore~\u2234~thetav~\u03D1~thickapprox~\u2248~thicksim~\u223C~thkap~\u2248~thksim~\u223C~timesb~\u22A0~timesbar~\u2A31~timesd~\u2A30~tint~\u222D~toea~\u2928~top~\u22A4~topbot~\u2336~topcir~\u2AF1~topf~\u{1D565}~topfork~\u2ADA~tosa~\u2929~tprime~\u2034~triangle~\u25B5~triangledown~\u25BF~triangleleft~\u25C3~trianglelefteq~\u22B4~triangleq~\u225C~triangleright~\u25B9~trianglerighteq~\u22B5~tridot~\u25EC~trie~\u225C~triminus~\u2A3A~triplus~\u2A39~trisb~\u29CD~tritime~\u2A3B~trpezium~\u23E2~tscr~\u{1D4C9}~tscy~\u0446~tshcy~\u045B~tstrok~\u0167~twixt~\u226C~twoheadleftarrow~\u219E~twoheadrightarrow~\u21A0~uHar~\u2963~ubrcy~\u045E~ubreve~\u016D~ucy~\u0443~udarr~\u21C5~udblac~\u0171~udhar~\u296E~ufisht~\u297E~ufr~\u{1D532}~uharl~\u21BF~uharr~\u21BE~uhblk~\u2580~ulcorn~\u231C~ulcorner~\u231C~ulcrop~\u230F~ultri~\u25F8~umacr~\u016B~uogon~\u0173~uopf~\u{1D566}~uparrow~\u2191~updownarrow~\u2195~upharpoonleft~\u21BF~upharpoonright~\u21BE~uplus~\u228E~upsi~\u03C5~upuparrows~\u21C8~urcorn~\u231D~urcorner~\u231D~urcrop~\u230E~uring~\u016F~urtri~\u25F9~uscr~\u{1D4CA}~utdot~\u22F0~utilde~\u0169~utri~\u25B5~utrif~\u25B4~uuarr~\u21C8~uwangle~\u29A7~vArr~\u21D5~vBar~\u2AE8~vBarv~\u2AE9~vDash~\u22A8~vangrt~\u299C~varepsilon~\u03F5~varkappa~\u03F0~varnothing~\u2205~varphi~\u03D5~varpi~\u03D6~varpropto~\u221D~varr~\u2195~varrho~\u03F1~varsigma~\u03C2~varsubsetneq~\u228A\uFE00~varsubsetneqq~\u2ACB\uFE00~varsupsetneq~\u228B\uFE00~varsupsetneqq~\u2ACC\uFE00~vartheta~\u03D1~vartriangleleft~\u22B2~vartriangleright~\u22B3~vcy~\u0432~vdash~\u22A2~vee~\u2228~veebar~\u22BB~veeeq~\u225A~vellip~\u22EE~verbar~|~vert~|~vfr~\u{1D533}~vltri~\u22B2~vnsub~\u2282\u20D2~vnsup~\u2283\u20D2~vopf~\u{1D567}~vprop~\u221D~vrtri~\u22B3~vscr~\u{1D4CB}~vsubnE~\u2ACB\uFE00~vsubne~\u228A\uFE00~vsupnE~\u2ACC\uFE00~vsupne~\u228B\uFE00~vzigzag~\u299A~wcirc~\u0175~wedbar~\u2A5F~wedge~\u2227~wedgeq~\u2259~wfr~\u{1D534}~wopf~\u{1D568}~wp~\u2118~wr~\u2240~wreath~\u2240~wscr~\u{1D4CC}~xcap~\u22C2~xcirc~\u25EF~xcup~\u22C3~xdtri~\u25BD~xfr~\u{1D535}~xhArr~\u27FA~xharr~\u27F7~xlArr~\u27F8~xlarr~\u27F5~xmap~\u27FC~xnis~\u22FB~xodot~\u2A00~xopf~\u{1D569}~xoplus~\u2A01~xotime~\u2A02~xrArr~\u27F9~xrarr~\u27F6~xscr~\u{1D4CD}~xsqcup~\u2A06~xuplus~\u2A04~xutri~\u25B3~xvee~\u22C1~xwedge~\u22C0~yacy~\u044F~ycirc~\u0177~ycy~\u044B~yfr~\u{1D536}~yicy~\u0457~yopf~\u{1D56A}~yscr~\u{1D4CE}~yucy~\u044E~zacute~\u017A~zcaron~\u017E~zcy~\u0437~zdot~\u017C~zeetrf~\u2128~zfr~\u{1D537}~zhcy~\u0436~zigrarr~\u21DD~zopf~\u{1D56B}~zscr~\u{1D4CF}~~AMP~&~COPY~\xA9~GT~>~LT~<~QUOT~"~REG~\xAE', namedReferences["html4"]);

  // node_modules/html-entities/dist/esm/surrogate-pairs.js
  var fromCodePoint = String.fromCodePoint || function(astralCodePoint) {
    return String.fromCharCode(Math.floor((astralCodePoint - 65536) / 1024) + 55296, (astralCodePoint - 65536) % 1024 + 56320);
  };
  var getCodePoint = String.prototype.codePointAt ? function(input, position) {
    return input.codePointAt(position);
  } : function(input, position) {
    return (input.charCodeAt(position) - 55296) * 1024 + input.charCodeAt(position + 1) - 56320 + 65536;
  };

  // node_modules/html-entities/dist/esm/index.js
  var __assign2 = function() {
    __assign2 = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
      }
      return t;
    };
    return __assign2.apply(this, arguments);
  };
  var allNamedReferences = __assign2(__assign2({}, namedReferences), { all: namedReferences.html5 });
  var encodeRegExps = {
    specialChars: /[<>'"&]/g,
    nonAscii: /[<>'"&\u0080-\uD7FF\uE000-\uFFFF\uDC00-\uDFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]?/g,
    nonAsciiPrintable: /[<>'"&\x01-\x08\x11-\x15\x17-\x1F\x7f-\uD7FF\uE000-\uFFFF\uDC00-\uDFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]?/g,
    nonAsciiPrintableOnly: /[\x01-\x08\x11-\x15\x17-\x1F\x7f-\uD7FF\uE000-\uFFFF\uDC00-\uDFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]?/g,
    extensive: /[\x01-\x0c\x0e-\x1f\x21-\x2c\x2e-\x2f\x3a-\x40\x5b-\x60\x7b-\x7d\x7f-\uD7FF\uE000-\uFFFF\uDC00-\uDFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]?/g
  };
  var defaultEncodeOptions = {
    mode: "specialChars",
    level: "all",
    numeric: "decimal"
  };
  function encode(text, _a) {
    var _b = _a === void 0 ? defaultEncodeOptions : _a, _c = _b.mode, mode = _c === void 0 ? "specialChars" : _c, _d = _b.numeric, numeric = _d === void 0 ? "decimal" : _d, _e = _b.level, level = _e === void 0 ? "all" : _e;
    if (!text) {
      return "";
    }
    var encodeRegExp = encodeRegExps[mode];
    var references = allNamedReferences[level].characters;
    var isHex = numeric === "hexadecimal";
    return String.prototype.replace.call(text, encodeRegExp, function(input) {
      var result = references[input];
      if (!result) {
        var code = input.length > 1 ? getCodePoint(input, 0) : input.charCodeAt(0);
        result = (isHex ? "&#x" + code.toString(16) : "&#" + code) + ";";
      }
      return result;
    });
  }
  var strict = /&(?:#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+);/g;
  var attribute = /&(?:#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+)[;=]?/g;
  var baseDecodeRegExps = {
    xml: {
      strict,
      attribute,
      body: bodyRegExps.xml
    },
    html4: {
      strict,
      attribute,
      body: bodyRegExps.html4
    },
    html5: {
      strict,
      attribute,
      body: bodyRegExps.html5
    }
  };
  var decodeRegExps = __assign2(__assign2({}, baseDecodeRegExps), { all: baseDecodeRegExps.html5 });
  var fromCharCode = String.fromCharCode;
  var outOfBoundsChar = fromCharCode(65533);

  // FigmaToCode/packages/backend/src/common/parseJSX.ts
  var formatWithJSX = (property, isJsx, value) => {
    const jsx_property = property.split("-").map((d, i) => i > 0 ? d.charAt(0).toUpperCase() + d.slice(1) : d).join("");
    if (typeof value === "number") {
      if (isJsx) {
        return `${jsx_property}: ${numberToFixedString(value)}`;
      } else {
        return `${property}: ${numberToFixedString(value)}px`;
      }
    } else if (isJsx) {
      return `${jsx_property}: '${value}'`;
    } else {
      return `${property}: ${value}`;
    }
  };
  var formatMultipleJSXArray = (styles, isJsx) => Object.entries(styles).filter(([key, value]) => value !== "").map(([key, value]) => formatWithJSX(key, isJsx, value));
  var formatMultipleJSX = (styles, isJsx) => Object.entries(styles).filter(([key, value]) => value).map(([key, value]) => formatWithJSX(key, isJsx, value)).join(isJsx ? ", " : "; ");
  var escapeJSXText = (text) => {
    return encode(text, { level: "html5" }).replace(/\{/g, "&#123;").replace(/\}/g, "&#125;");
  };

  // FigmaToCode/packages/backend/src/common/color.ts
  var rgbTo6hex = (color2) => {
    const hex = (color2.r * 255 | 1 << 8).toString(16).slice(1) + (color2.g * 255 | 1 << 8).toString(16).slice(1) + (color2.b * 255 | 1 << 8).toString(16).slice(1);
    return hex;
  };
  var rgbTo8hex = (color2, alpha) => {
    const hex = (alpha * 255 | 1 << 8).toString(16).slice(1) + (color2.r * 255 | 1 << 8).toString(16).slice(1) + (color2.g * 255 | 1 << 8).toString(16).slice(1) + (color2.b * 255 | 1 << 8).toString(16).slice(1);
    return hex;
  };
  var gradientAngle = (fill) => {
    const [start, end] = fill.gradientHandlePositions;
    return calculateAngle(start, end);
  };
  var calculateAngle = (start, end) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return (angle + 360) % 360;
  };

  // FigmaToCode/packages/backend/src/html/builderImpl/htmlColor.ts
  var processColorWithVariable = (fill) => {
    var _a;
    const opacity2 = (_a = fill.opacity) != null ? _a : 1;
    if (fill.variableColorName) {
      const varName = fill.variableColorName;
      const fallbackColor = htmlColor(fill.color, opacity2);
      return `var(--${varName}, ${fallbackColor})`;
    }
    return htmlColor(fill.color, opacity2);
  };
  var getColorAndVariable = (fill) => {
    var _a, _b;
    if (fill.type === "SOLID") {
      return {
        color: fill.color,
        opacity: (_a = fill.opacity) != null ? _a : 1,
        variableColorName: fill.variableColorName
      };
    } else if ((fill.type === "GRADIENT_LINEAR" || fill.type === "GRADIENT_RADIAL" || fill.type === "GRADIENT_ANGULAR" || fill.type === "GRADIENT_DIAMOND") && fill.gradientStops.length > 0) {
      const firstStop = fill.gradientStops[0];
      return {
        color: firstStop.color,
        opacity: (_b = fill.opacity) != null ? _b : 1,
        variableColorName: firstStop.variableColorName
      };
    }
    return { color: { r: 0, g: 0, b: 0 }, opacity: 0 };
  };
  var htmlColorFromFills = (fills) => {
    const fill = retrieveTopFill(fills);
    if (fill) {
      const colorInfo = getColorAndVariable(fill);
      return processColorWithVariable(colorInfo);
    }
    return "";
  };
  var htmlColor = (color2, alpha = 1) => {
    if (color2.r === 1 && color2.g === 1 && color2.b === 1 && alpha === 1) {
      return "white";
    }
    if (color2.r === 0 && color2.g === 0 && color2.b === 0 && alpha === 1) {
      return "black";
    }
    if (alpha === 1) {
      const r2 = Math.round(color2.r * 255);
      const g2 = Math.round(color2.g * 255);
      const b2 = Math.round(color2.b * 255);
      const toHex = (num) => num.toString(16).padStart(2, "0");
      return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`.toUpperCase();
    }
    const r = numberToFixedString(color2.r * 255);
    const g = numberToFixedString(color2.g * 255);
    const b = numberToFixedString(color2.b * 255);
    const a = numberToFixedString(alpha);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };
  var processGradientStop = (stop, fillOpacity = 1, positionMultiplier = 100, unit = "%") => {
    const fillInfo = {
      color: stop.color,
      opacity: stop.color.a * fillOpacity,
      boundVariables: stop.boundVariables,
      variableColorName: stop.variableColorName
    };
    const color2 = processColorWithVariable(fillInfo);
    const position = `${(stop.position * positionMultiplier).toFixed(0)}${unit}`;
    return `${color2} ${position}`;
  };
  var processGradientStops = (stops, fillOpacity = 1, positionMultiplier = 100, unit = "%") => {
    return stops.map(
      (stop) => processGradientStop(stop, fillOpacity, positionMultiplier, unit)
    ).join(", ");
  };
  var htmlGradientFromFills = (fill) => {
    if (!fill) return "";
    switch (fill.type) {
      case "GRADIENT_LINEAR":
        return htmlLinearGradient(fill);
      case "GRADIENT_ANGULAR":
        return htmlAngularGradient(fill);
      case "GRADIENT_RADIAL":
        return htmlRadialGradient(fill);
      case "GRADIENT_DIAMOND":
        return htmlDiamondGradient(fill);
      default:
        return "";
    }
  };
  var htmlLinearGradient = (fill) => {
    var _a;
    const [start, end] = fill.gradientHandlePositions;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    angle = (angle + 360) % 360;
    const cssAngle = (angle + 90) % 360;
    const mappedFill = processGradientStops(
      fill.gradientStops,
      (_a = fill.opacity) != null ? _a : 1
    );
    return `linear-gradient(${cssAngle.toFixed(0)}deg, ${mappedFill})`;
  };
  var htmlRadialGradient = (fill) => {
    var _a;
    const [center, h1, h2] = fill.gradientHandlePositions;
    const cx = center.x * 100;
    const cy = center.y * 100;
    const rx = Math.sqrt((h1.x - center.x) ** 2 + (h1.y - center.y) ** 2) * 100;
    const ry = Math.sqrt((h2.x - center.x) ** 2 + (h2.y - center.y) ** 2) * 100;
    const mappedStops = processGradientStops(
      fill.gradientStops,
      (_a = fill.opacity) != null ? _a : 1
    );
    return `radial-gradient(ellipse ${rx.toFixed(2)}% ${ry.toFixed(2)}% at ${cx.toFixed(2)}% ${cy.toFixed(2)}%, ${mappedStops})`;
  };
  var htmlAngularGradient = (fill) => {
    var _a;
    const [center, _, startDirection] = fill.gradientHandlePositions;
    const cx = center.x * 100;
    const cy = center.y * 100;
    const dx = startDirection.x - center.x;
    const dy = startDirection.y - center.y;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    angle = (angle + 360) % 360;
    const mappedFill = processGradientStops(
      fill.gradientStops,
      (_a = fill.opacity) != null ? _a : 1,
      360,
      "deg"
    );
    return `conic-gradient(from ${angle.toFixed(0)}deg at ${cx.toFixed(2)}% ${cy.toFixed(2)}%, ${mappedFill})`;
  };
  var htmlDiamondGradient = (fill) => {
    var _a;
    const stops = processGradientStops(
      fill.gradientStops,
      (_a = fill.opacity) != null ? _a : 1,
      50,
      "%"
    );
    const gradientConfigs = [
      { direction: "to bottom right", position: "bottom right" },
      { direction: "to bottom left", position: "bottom left" },
      { direction: "to top left", position: "top left" },
      { direction: "to top right", position: "top right" }
    ];
    return gradientConfigs.map(
      ({ direction, position }) => `linear-gradient(${direction}, ${stops}) ${position} / 50% 50% no-repeat`
    ).join(", ");
  };
  var buildBackgroundValues = (paintArray) => {
    if (paintArray === figma.mixed) {
      return "";
    }
    if (paintArray.length === 1) {
      const paint = paintArray[0];
      if (paint.type === "SOLID") {
        return htmlColorFromFills(paintArray);
      } else if (paint.type === "GRADIENT_LINEAR" || paint.type === "GRADIENT_RADIAL" || paint.type === "GRADIENT_ANGULAR" || paint.type === "GRADIENT_DIAMOND") {
        return htmlGradientFromFills(paint);
      }
      return "";
    }
    const styles = [...paintArray].reverse().map((paint, index) => {
      if (paint.type === "SOLID") {
        const color2 = htmlColorFromFills([paint]);
        if (index === 0) {
          return `linear-gradient(0deg, ${color2} 0%, ${color2} 100%)`;
        }
        return color2;
      } else if (paint.type === "GRADIENT_LINEAR" || paint.type === "GRADIENT_RADIAL" || paint.type === "GRADIENT_ANGULAR" || paint.type === "GRADIENT_DIAMOND") {
        return htmlGradientFromFills(paint);
      }
      return "";
    });
    return styles.filter((value) => value !== "").join(", ");
  };

  // FigmaToCode/packages/backend/src/tailwind/builderImpl/tailwindColor.ts
  function calculateEffectiveOpacity(fill, parentOpacity) {
    let effectiveOpacity = typeof parentOpacity === "number" ? parentOpacity : 1;
    if ("opacity" in fill && typeof fill.opacity === "number") {
      effectiveOpacity *= fill.opacity;
    }
    if ("color" in fill && "a" in fill.color) {
      effectiveOpacity *= fill.color.a;
    }
    return effectiveOpacity;
  }
  var tailwindSolidColor = (fill, kind, useVarSyntax = false) => {
    if (useVarSyntax && fill.variableColorName) {
      const varName = fill.variableColorName;
      const { hex } = getColorInfo(fill);
      return `${kind}-[var(--${varName},${hex})]`;
    }
    const { colorName, colorType } = getColorInfo(fill);
    if (colorType === "variable") {
      return `${kind}-${colorName}`;
    }
    const effectiveOpacity = calculateEffectiveOpacity(fill);
    const opacity2 = effectiveOpacity !== 1 ? `/${nearestOpacity(effectiveOpacity)}` : "";
    return `${kind}-${colorName}${opacity2}`;
  };
  var tailwindGradientStop = (stop, parentOpacity = 1) => {
    const { colorName, colorType } = getColorInfo(stop);
    if (colorType === "variable") {
      return colorName;
    }
    const effectiveOpacity = calculateEffectiveOpacity(stop, parentOpacity);
    const opacity2 = effectiveOpacity !== 1 ? `/${nearestOpacity(effectiveOpacity)}` : "";
    return `${colorName}${opacity2}`;
  };
  var tailwindColorFromFills = (fills, kind) => {
    const fill = retrieveTopFill(fills);
    if (fill && fill.type === "SOLID") {
      return tailwindSolidColor(fill, kind);
    } else if (fill && (fill.type === "GRADIENT_LINEAR" || fill.type === "GRADIENT_ANGULAR" || fill.type === "GRADIENT_RADIAL" || fill.type === "GRADIENT_DIAMOND")) {
      if (fill.gradientStops.length > 0) {
        return tailwindSolidColor(fill.gradientStops[0], kind);
      }
    }
    return "";
  };
  var tailwindGradientFromFills = (fills) => {
    const fill = retrieveTopFill(fills);
    if (!fill) {
      return "";
    }
    if (fill.type === "GRADIENT_LINEAR") {
      return tailwindGradient(fill);
    }
    if (localTailwindSettings.useTailwind4) {
      if (fill.type === "GRADIENT_RADIAL") {
        return tailwindRadialGradient(fill);
      }
      if (fill.type === "GRADIENT_ANGULAR") {
        return tailwindConicGradient(fill);
      }
      if (fill.type === "GRADIENT_DIAMOND") {
        return "";
      }
    } else {
      if (fill.type === "GRADIENT_ANGULAR") {
        return tailwindArbitraryGradient(htmlAngularGradient(fill));
      }
      if (fill.type === "GRADIENT_RADIAL") {
        return tailwindArbitraryGradient(htmlRadialGradient(fill));
      }
      if (fill.type === "GRADIENT_DIAMOND") {
        return "";
      }
    }
    return "";
  };
  var tailwindArbitraryGradient = (cssGradient) => {
    const tailwindValue = cssGradient.replace(/\s+/g, "_");
    return `bg-[${tailwindValue}]`;
  };
  var directionMap = {
    0: "bg-gradient-to-r",
    45: "bg-gradient-to-br",
    90: "bg-gradient-to-b",
    135: "bg-gradient-to-bl",
    "-45": "bg-gradient-to-tr",
    "-90": "bg-gradient-to-t",
    "-135": "bg-gradient-to-tl",
    180: "bg-gradient-to-l"
  };
  function getGradientDirectionClass(angle, useTailwind4) {
    const angleValues = [0, 45, 90, 135, 180, -45, -90, -135, -180];
    if (useTailwind4) {
      const roundedAngle = Math.round(angle);
      if (angleValues.includes(roundedAngle)) {
        return directionMap[roundedAngle];
      }
      const exactAngle = Math.round((angle % 360 + 360) % 360);
      return `bg-linear-${exactAngle}`;
    }
    let snappedAngle = nearestValue(angle, angleValues);
    if (snappedAngle === -180) snappedAngle = 180;
    const entry = directionMap[snappedAngle];
    if (entry) {
      return entry;
    }
    return "bg-gradient-to-r";
  }
  var needsPositionOverride = (actual, expected) => {
    return Math.abs(actual - expected) > 0.05;
  };
  var getStopPositionModifier = (stopPosition, expectedPosition, unit = "%", multiplier = 100) => {
    if (needsPositionOverride(stopPosition, expectedPosition)) {
      const position = Math.round(stopPosition * multiplier);
      return ` ${position}${unit}`;
    }
    return "";
  };
  function generateGradientStop(prefix, stop, globalOpacity = 1, expectedPosition, unit = "%", multiplier = 100) {
    const colorValue = tailwindGradientStop(stop, globalOpacity);
    const colorPart = `${prefix}-${colorValue}`;
    if (!localTailwindSettings.useTailwind4) {
      return colorPart;
    }
    const positionModifier = getStopPositionModifier(
      stop.position,
      expectedPosition,
      unit,
      multiplier
    );
    return positionModifier ? `${colorPart} ${prefix}${positionModifier}` : colorPart;
  }
  var tailwindGradient = (fill) => {
    var _a;
    const globalOpacity = (_a = fill.opacity) != null ? _a : 1;
    const direction = getGradientDirectionClass(
      gradientAngle(fill),
      localTailwindSettings.useTailwind4
    );
    if (fill.gradientStops.length === 1) {
      const fromStop = generateGradientStop(
        "from",
        fill.gradientStops[0],
        globalOpacity,
        0
      );
      return [direction, fromStop].filter(Boolean).join(" ");
    } else if (fill.gradientStops.length === 2) {
      const firstStop = generateGradientStop(
        "from",
        fill.gradientStops[0],
        globalOpacity,
        0
      );
      const lastStop = generateGradientStop(
        "to",
        fill.gradientStops[1],
        globalOpacity,
        1
      );
      return [direction, firstStop, lastStop].filter(Boolean).join(" ");
    } else {
      const firstStop = generateGradientStop(
        "from",
        fill.gradientStops[0],
        globalOpacity,
        0
      );
      const viaStop = generateGradientStop(
        "via",
        fill.gradientStops[1],
        globalOpacity,
        0.5
      );
      const lastStop = generateGradientStop(
        "to",
        fill.gradientStops[fill.gradientStops.length - 1],
        globalOpacity,
        1
      );
      return [direction, firstStop, viaStop, lastStop].filter(Boolean).join(" ");
    }
  };
  var tailwindRadialGradient = (fill) => {
    var _a;
    const globalOpacity = (_a = fill.opacity) != null ? _a : 1;
    const [center] = fill.gradientHandlePositions;
    const cx = Math.round(center.x * 100);
    const cy = Math.round(center.y * 100);
    const isCustomPosition = Math.abs(cx - 50) > 5 || Math.abs(cy - 50) > 5;
    const baseClass = isCustomPosition ? `bg-radial-[at_${cx}%_${cy}%]` : "bg-radial";
    if (fill.gradientStops.length === 1) {
      const fromStop = generateGradientStop(
        "from",
        fill.gradientStops[0],
        globalOpacity,
        0
      );
      return [baseClass, fromStop].filter(Boolean).join(" ");
    } else if (fill.gradientStops.length === 2) {
      const firstStop = generateGradientStop(
        "from",
        fill.gradientStops[0],
        globalOpacity,
        0
      );
      const lastStop = generateGradientStop(
        "to",
        fill.gradientStops[1],
        globalOpacity,
        1
      );
      return [baseClass, firstStop, lastStop].filter(Boolean).join(" ");
    } else {
      const firstStop = generateGradientStop(
        "from",
        fill.gradientStops[0],
        globalOpacity,
        0
      );
      const viaStop = generateGradientStop(
        "via",
        fill.gradientStops[1],
        globalOpacity,
        0.5
      );
      const lastStop = generateGradientStop(
        "to",
        fill.gradientStops[fill.gradientStops.length - 1],
        globalOpacity,
        1
      );
      return [baseClass, firstStop, viaStop, lastStop].filter(Boolean).join(" ");
    }
  };
  var tailwindConicGradient = (fill) => {
    var _a;
    const [center, , startDirection] = fill.gradientHandlePositions;
    const globalOpacity = (_a = fill.opacity) != null ? _a : 1;
    const dx = startDirection.x - center.x;
    const dy = startDirection.y - center.y;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    angle = (angle + 360) % 360;
    const normalizedAngle = Math.round(angle);
    const cx = Math.round(center.x * 100);
    const cy = Math.round(center.y * 100);
    const isCustomPosition = Math.abs(cx - 50) > 5 || Math.abs(cy - 50) > 5;
    let baseClass = `bg-conic-${normalizedAngle}`;
    if (isCustomPosition) {
      baseClass = `bg-conic-[from_${normalizedAngle}deg_at_${cx}%_${cy}%]`;
    }
    if (fill.gradientStops.length === 1) {
      const fromStop = generateGradientStop(
        "from",
        fill.gradientStops[0],
        globalOpacity,
        0,
        "deg",
        360
      );
      return [baseClass, fromStop].filter(Boolean).join(" ");
    } else if (fill.gradientStops.length === 2) {
      const firstStop = generateGradientStop(
        "from",
        fill.gradientStops[0],
        globalOpacity,
        0,
        "deg",
        360
      );
      const lastStop = generateGradientStop(
        "to",
        fill.gradientStops[1],
        globalOpacity,
        1,
        "deg",
        360
      );
      return [baseClass, firstStop, lastStop].filter(Boolean).join(" ");
    } else {
      const firstStop = generateGradientStop(
        "from",
        fill.gradientStops[0],
        globalOpacity,
        0,
        "deg",
        360
      );
      const viaStop = generateGradientStop(
        "via",
        fill.gradientStops[1],
        globalOpacity,
        0.5,
        "deg",
        360
      );
      const lastStop = generateGradientStop(
        "to",
        fill.gradientStops[fill.gradientStops.length - 1],
        globalOpacity,
        1,
        "deg",
        360
      );
      return [baseClass, firstStop, viaStop, lastStop].filter(Boolean).join(" ");
    }
  };

  // FigmaToCode/packages/backend/src/tailwind/builderImpl/tailwindShadow.ts
  var tailwindShadow = (node) => {
    if (node.effects && node.effects.length > 0) {
      const EPSILON = 1e-4;
      const dropShadow = node.effects.map((d) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L, _M, _N, _O, _P;
        if (d.type === "DROP_SHADOW") {
          if (((_a = d.offset) == null ? void 0 : _a.x) === 0 && ((_b = d.offset) == null ? void 0 : _b.y) === 1 && d.radius === 2 && d.spread === 0 && ((_c = d.color) == null ? void 0 : _c.r) === 0 && ((_d = d.color) == null ? void 0 : _d.g) === 0 && ((_e = d.color) == null ? void 0 : _e.b) === 0 && Math.abs(((_f = d.color) == null ? void 0 : _f.a) - 0.05) < EPSILON) {
            return localTailwindSettings.useTailwind4 ? "shadow-xs" : "shadow-sm";
          } else if (((_g = d.offset) == null ? void 0 : _g.x) === 0 && ((_h = d.offset) == null ? void 0 : _h.y) === 1 && d.radius === 3 && d.spread === 0 && ((_i = d.color) == null ? void 0 : _i.r) === 0 && ((_j = d.color) == null ? void 0 : _j.g) === 0 && ((_k = d.color) == null ? void 0 : _k.b) === 0 && Math.abs(((_l = d.color) == null ? void 0 : _l.a) - 0.1) < EPSILON) {
            return localTailwindSettings.useTailwind4 ? "shadow-sm" : "shadow";
          } else if (((_m = d.offset) == null ? void 0 : _m.x) === 0 && ((_n = d.offset) == null ? void 0 : _n.y) === 4 && d.radius === 6 && d.spread === -1 && ((_o = d.color) == null ? void 0 : _o.r) === 0 && ((_p = d.color) == null ? void 0 : _p.g) === 0 && ((_q = d.color) == null ? void 0 : _q.b) === 0 && Math.abs(((_r = d.color) == null ? void 0 : _r.a) - 0.1) < EPSILON) {
            return "shadow-md";
          } else if (((_s = d.offset) == null ? void 0 : _s.x) === 0 && ((_t = d.offset) == null ? void 0 : _t.y) === 10 && d.radius === 15 && d.spread === -3 && ((_u = d.color) == null ? void 0 : _u.r) === 0 && ((_v = d.color) == null ? void 0 : _v.g) === 0 && ((_w = d.color) == null ? void 0 : _w.b) === 0 && Math.abs(((_x = d.color) == null ? void 0 : _x.a) - 0.1) < EPSILON) {
            return "shadow-lg";
          } else if (((_y = d.offset) == null ? void 0 : _y.x) === 0 && ((_z = d.offset) == null ? void 0 : _z.y) === 20 && d.radius === 25 && d.spread === -5 && ((_A = d.color) == null ? void 0 : _A.r) === 0 && ((_B = d.color) == null ? void 0 : _B.g) === 0 && ((_C = d.color) == null ? void 0 : _C.b) === 0 && Math.abs(((_D = d.color) == null ? void 0 : _D.a) - 0.1) < EPSILON) {
            return "shadow-xl";
          } else if (((_E = d.offset) == null ? void 0 : _E.x) === 0 && ((_F = d.offset) == null ? void 0 : _F.y) === 25 && d.radius === 50 && d.spread === -12 && ((_G = d.color) == null ? void 0 : _G.r) === 0 && ((_H = d.color) == null ? void 0 : _H.g) === 0 && ((_I = d.color) == null ? void 0 : _I.b) === 0 && Math.abs(((_J = d.color) == null ? void 0 : _J.a) - 0.25) < EPSILON) {
            return "shadow-2xl";
          } else {
            const offsetX = ((_K = d.offset) == null ? void 0 : _K.x) || 0;
            const offsetY = ((_L = d.offset) == null ? void 0 : _L.y) || 0;
            const radius = d.radius || 0;
            const spread = d.spread || 0;
            const r = Math.round((((_M = d.color) == null ? void 0 : _M.r) || 0) * 255);
            const g = Math.round((((_N = d.color) == null ? void 0 : _N.g) || 0) * 255);
            const b = Math.round((((_O = d.color) == null ? void 0 : _O.b) || 0) * 255);
            const a = (((_P = d.color) == null ? void 0 : _P.a) || 0).toFixed(2);
            return `shadow-[${offsetX}px_${offsetY}px_${radius}px_${spread}px_rgba(${r},${g},${b},${a})]`;
          }
        }
        return "";
      }).filter(Boolean);
      const innerShadow = node.effects.map((d) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
        if (d.type === "INNER_SHADOW") {
          if (((_a = d.offset) == null ? void 0 : _a.x) === 0 && ((_b = d.offset) == null ? void 0 : _b.y) === 2 && d.radius === 4 && d.spread === 0 && ((_c = d.color) == null ? void 0 : _c.r) === 0 && ((_d = d.color) == null ? void 0 : _d.g) === 0 && ((_e = d.color) == null ? void 0 : _e.b) === 0 && Math.abs(((_f = d.color) == null ? void 0 : _f.a) - 0.05) < EPSILON) {
            return "shadow-inner";
          } else {
            const offsetX = ((_g = d.offset) == null ? void 0 : _g.x) || 0;
            const offsetY = ((_h = d.offset) == null ? void 0 : _h.y) || 0;
            const radius = d.radius || 0;
            const spread = d.spread || 0;
            const r = Math.round((((_i = d.color) == null ? void 0 : _i.r) || 0) * 255);
            const g = Math.round((((_j = d.color) == null ? void 0 : _j.g) || 0) * 255);
            const b = Math.round((((_k = d.color) == null ? void 0 : _k.b) || 0) * 255);
            const a = (((_l = d.color) == null ? void 0 : _l.a) || 0).toFixed(2);
            return `shadow-[inset_${offsetX}px_${offsetY}px_${radius}px_${spread}px_rgba(${r},${g},${b},${a})]`;
          }
        }
        return "";
      }).filter(Boolean);
      return [...dropShadow, ...innerShadow];
    }
    return [];
  };

  // FigmaToCode/packages/backend/src/tailwind/builderImpl/tailwindBlend.ts
  var tailwindOpacity = (node) => {
    if (node.opacity !== void 0 && node.opacity !== 1) {
      return `opacity-${nearestOpacity(node.opacity)}`;
    }
    return "";
  };
  var tailwindBlendMode = (node) => {
    if (node.blendMode !== "NORMAL" && node.blendMode !== "PASS_THROUGH") {
      switch (node.blendMode) {
        case "MULTIPLY":
          return "mix-blend-multiply";
        case "SCREEN":
          return "mix-blend-screen";
        case "OVERLAY":
          return "mix-blend-overlay";
        case "DARKEN":
          return "mix-blend-darken";
        case "LIGHTEN":
          return "mix-blend-lighten";
        case "COLOR_DODGE":
          return "mix-blend-color-dodge";
        case "COLOR_BURN":
          return "mix-blend-color-burn";
        case "HARD_LIGHT":
          return "mix-blend-hard-light";
        case "SOFT_LIGHT":
          return "mix-blend-soft-light";
        case "DIFFERENCE":
          return "mix-blend-difference";
        case "EXCLUSION":
          return "mix-blend-exclusion";
        case "HUE":
          return "mix-blend-hue";
        case "SATURATION":
          return "mix-blend-saturation";
        case "COLOR":
          return "mix-blend-color";
        case "LUMINOSITY":
          return "mix-blend-luminosity";
      }
      return "";
    }
    return "";
  };
  var tailwindBackgroundBlendMode = (paintArray) => {
    var _a, _b;
    if (paintArray.length === 0 || paintArray.every(
      (d) => d.blendMode === "NORMAL" || d.blendMode === "PASS_THROUGH"
    )) {
      return "";
    }
    const topFill = paintArray[paintArray.length - 1];
    if (topFill.blendMode === "NORMAL" || topFill.blendMode === "PASS_THROUGH") {
      return "";
    }
    const blendMode = ((_b = (_a = topFill.blendMode) == null ? void 0 : _a.toLowerCase()) == null ? void 0 : _b.replaceAll("_", "-")) || "normal";
    return `bg-blend-${blendMode}`;
  };
  var tailwindVisibility = (node) => {
    if (node.visible !== void 0 && !node.visible) {
      return "invisible";
    }
    return "";
  };
  var tailwindRotation = (node) => {
    if (node.rotation !== void 0 && Math.round(node.rotation) !== 0) {
      const allowedValues = [
        -180,
        -90,
        -45,
        -12,
        -6,
        -3,
        -2,
        -1,
        1,
        2,
        3,
        6,
        12,
        45,
        90,
        180
      ];
      let nearest = exactValue(-node.rotation, allowedValues);
      if (nearest) {
        let minusIfNegative = "";
        if (nearest < 0) {
          minusIfNegative = "-";
          nearest = -nearest;
        }
        return `origin-top-left ${minusIfNegative}rotate-${nearest}`;
      } else {
        return `origin-top-left rotate-[${numberToFixedString(-node.rotation)}deg]`;
      }
    }
    return "";
  };

  // FigmaToCode/packages/backend/src/common/commonRadius.ts
  var getCommonRadius = (node) => {
    if ("rectangleCornerRadii" in node) {
      const [topLeft, topRight, bottomRight, bottomLeft] = node.rectangleCornerRadii;
      if (topLeft === topRight && topLeft === bottomRight && topLeft === bottomLeft) {
        return { all: topLeft };
      }
      return {
        topLeft,
        topRight,
        bottomRight,
        bottomLeft
      };
    }
    if ("cornerRadius" in node && node.cornerRadius !== figma.mixed && node.cornerRadius) {
      return { all: node.cornerRadius };
    }
    if ("topLeftRadius" in node) {
      if (node.topLeftRadius === node.topRightRadius && node.topLeftRadius === node.bottomRightRadius && node.topLeftRadius === node.bottomLeftRadius) {
        return { all: node.topLeftRadius };
      }
      return {
        topLeft: node.topLeftRadius,
        topRight: node.topRightRadius,
        bottomRight: node.bottomRightRadius,
        bottomLeft: node.bottomLeftRadius
      };
    }
    return { all: 0 };
  };

  // FigmaToCode/packages/backend/src/common/commonStroke.ts
  var commonStroke = (node, divideBy = 1) => {
    if (!("strokes" in node) || !node.strokes || node.strokes.length === 0) {
      return null;
    }
    if ("strokeTopWeight" in node) {
      if (node.strokeTopWeight === node.strokeBottomWeight && node.strokeTopWeight === node.strokeLeftWeight && node.strokeTopWeight === node.strokeRightWeight) {
        return { all: node.strokeTopWeight / divideBy };
      }
      return {
        left: node.strokeLeftWeight / divideBy,
        top: node.strokeTopWeight / divideBy,
        right: node.strokeRightWeight / divideBy,
        bottom: node.strokeBottomWeight / divideBy
      };
    } else if (node.strokeWeight !== figma.mixed && node.strokeWeight !== 0) {
      return { all: node.strokeWeight / divideBy };
    }
    return null;
  };

  // FigmaToCode/packages/backend/src/tailwind/builderImpl/tailwindBorder.ts
  var getBorder = (weight, kind, useOutline = false, isBoxShadow = false) => {
    if (isBoxShadow) {
      return "";
    }
    if (useOutline) {
      const outlineWidth = pxToOutline(weight);
      if (outlineWidth === null) {
        return `outline outline-[${numberToFixedString(weight)}px]`;
      } else {
        return `outline outline-${outlineWidth}`;
      }
    }
    if (weight === 1) {
      return `border${kind}`;
    }
    const borderWidth = pxToBorderWidth(weight);
    if (borderWidth === null) {
      return `border${kind}-[${numberToFixedString(weight)}px]`;
    } else if (borderWidth === "DEFAULT") {
      return `border${kind}`;
    } else {
      return `border${kind}-${borderWidth}`;
    }
  };
  var tailwindBorderWidth = (node) => {
    const commonBorder = commonStroke(node);
    if (!commonBorder) {
      return {
        isOutline: false,
        property: ""
      };
    }
    const strokeAlign = "strokeAlign" in node ? node.strokeAlign : "INSIDE";
    if ("all" in commonBorder) {
      if (commonBorder.all === 0) {
        return {
          isOutline: false,
          property: ""
        };
      }
      const weight = commonBorder.all;
      if (strokeAlign === "CENTER" || strokeAlign === "OUTSIDE" || node.type === "FRAME" || node.type === "INSTANCE" || node.type === "COMPONENT") {
        const property = getBorder(weight, "", true);
        let offsetProperty = "";
        if (strokeAlign === "CENTER") {
          offsetProperty = `outline-offset-[-${numberToFixedString(weight / 2)}px]`;
        } else if (strokeAlign === "INSIDE") {
          offsetProperty = `outline-offset-[-${numberToFixedString(weight)}px]`;
        }
        return {
          isOutline: true,
          property: offsetProperty ? `${property} ${offsetProperty}` : property
        };
      } else {
        return {
          isOutline: false,
          property: getBorder(weight, "", false)
        };
      }
    } else {
      addWarning(
        'Non-uniform borders are only supported with strokeAlign set to "inside". Will paint inside.'
      );
    }
    const comp = [];
    if (commonBorder.left !== 0) {
      comp.push(getBorder(commonBorder.left, "-l"));
    }
    if (commonBorder.right !== 0) {
      comp.push(getBorder(commonBorder.right, "-r"));
    }
    if (commonBorder.top !== 0) {
      comp.push(getBorder(commonBorder.top, "-t"));
    }
    if (commonBorder.bottom !== 0) {
      comp.push(getBorder(commonBorder.bottom, "-b"));
    }
    return {
      isOutline: false,
      property: comp.join(" ")
    };
  };
  var tailwindBorderRadius = (node) => {
    if (node.type === "ELLIPSE") {
      return "rounded-full";
    }
    const getRadius = (radius2) => {
      const r = pxToBorderRadius(radius2);
      if (r) {
        return `-${r}`;
      }
      return "";
    };
    const radius = getCommonRadius(node);
    if ("all" in radius) {
      if (radius.all === 0) {
        return "";
      } else if (radius.all > 999 && node.width < 1e3 && node.height < 1e3) {
        return "rounded-full";
      }
      return `rounded${getRadius(radius.all)}`;
    }
    let comp = [];
    if (radius.topLeft !== 0) {
      comp.push(`rounded-tl${getRadius(radius.topLeft)}`);
    }
    if (radius.topRight !== 0) {
      comp.push(`rounded-tr${getRadius(radius.topRight)}`);
    }
    if (radius.bottomLeft !== 0) {
      comp.push(`rounded-bl${getRadius(radius.bottomLeft)}`);
    }
    if (radius.bottomRight !== 0) {
      comp.push(`rounded-br${getRadius(radius.bottomRight)}`);
    }
    return comp.join(" ");
  };

  // FigmaToCode/packages/backend/src/common/nodeWidthHeight.ts
  var nodeSize = (node) => {
    if ("layoutSizingHorizontal" in node && "layoutSizingVertical" in node) {
      const width = node.layoutSizingHorizontal === "FILL" ? "fill" : node.layoutSizingHorizontal === "HUG" ? null : node.width;
      const height = node.layoutSizingVertical === "FILL" ? "fill" : node.layoutSizingVertical === "HUG" ? null : node.height;
      return { width, height };
    }
    return { width: node.width, height: node.height };
  };

  // FigmaToCode/packages/backend/src/tailwind/builderImpl/tailwindSize.ts
  var formatTailwindSizeValue = (size, prefix, settings) => {
    const tailwindSize = pxToLayoutSize(size);
    if (!tailwindSize.startsWith("[")) {
      return `${prefix}-${tailwindSize}`;
    }
    const sizeFixed = numberToFixedString(size);
    if (sizeFixed === "0") {
      return `${prefix}-0`;
    } else {
      return `${prefix}-[${sizeFixed}px]`;
    }
  };
  var tailwindSizePartial = (node, settings) => {
    const size = nodeSize(node);
    const nodeParent = node.parent;
    let w = "";
    if (typeof size.width === "number") {
      w = formatTailwindSizeValue(size.width, "w", settings);
    } else if (size.width === "fill") {
      if (nodeParent && "layoutMode" in nodeParent && nodeParent.layoutMode === "HORIZONTAL") {
        w = "flex-1";
      } else {
        if (node.maxWidth) {
          w = "w-full";
        } else {
          w = "self-stretch";
        }
      }
    }
    let h = "";
    if (typeof size.height === "number") {
      h = formatTailwindSizeValue(size.height, "h", settings);
    } else if (size.height === "fill") {
      if (nodeParent && "layoutMode" in nodeParent && nodeParent.layoutMode === "VERTICAL") {
        h = "flex-1";
      } else {
        if (node.maxHeight) {
          h = "h-full";
        } else {
          h = "self-stretch";
        }
      }
    }
    const constraints = [];
    if (node.maxWidth !== void 0 && node.maxWidth !== null) {
      constraints.push(formatTailwindSizeValue(node.maxWidth, "max-w", settings));
    }
    if (node.minWidth !== void 0 && node.minWidth !== null) {
      constraints.push(formatTailwindSizeValue(node.minWidth, "min-w", settings));
    }
    if (node.maxHeight !== void 0 && node.maxHeight !== null) {
      constraints.push(
        formatTailwindSizeValue(node.maxHeight, "max-h", settings)
      );
    }
    if (node.minHeight !== void 0 && node.minHeight !== null) {
      constraints.push(
        formatTailwindSizeValue(node.minHeight, "min-h", settings)
      );
    }
    if (localTailwindSettings.useTailwind4) {
      const wValue = w.substring(2);
      const hValue = h.substring(2);
      if (wValue === hValue) {
        w = `size-${wValue}`;
        h = "";
      }
    }
    return {
      width: w,
      height: h,
      constraints: constraints.join(" ")
    };
  };

  // FigmaToCode/packages/backend/src/common/commonPadding.ts
  var commonPadding = (node) => {
    var _a, _b, _c, _d;
    if ("layoutMode" in node && node.layoutMode !== "NONE") {
      const paddingLeft = parseFloat(((_a = node.paddingLeft) != null ? _a : 0).toFixed(2));
      const paddingRight = parseFloat(((_b = node.paddingRight) != null ? _b : 0).toFixed(2));
      const paddingTop = parseFloat(((_c = node.paddingTop) != null ? _c : 0).toFixed(2));
      const paddingBottom = parseFloat(((_d = node.paddingBottom) != null ? _d : 0).toFixed(2));
      if (paddingLeft === paddingRight && paddingLeft === paddingBottom && paddingTop === paddingBottom) {
        return { all: paddingLeft };
      } else if (paddingLeft === paddingRight && paddingTop === paddingBottom) {
        return {
          horizontal: paddingLeft,
          vertical: paddingTop
        };
      } else {
        return {
          left: paddingLeft,
          right: paddingRight,
          top: paddingTop,
          bottom: paddingBottom
        };
      }
    }
    return null;
  };

  // FigmaToCode/packages/backend/src/tailwind/builderImpl/tailwindPadding.ts
  var tailwindPadding = (node) => {
    const padding = commonPadding(node);
    if (!padding) {
      return [];
    }
    if ("all" in padding) {
      if (padding.all === 0) {
        return [];
      }
      return [`p-${pxToLayoutSize(padding.all)}`];
    }
    let comp = [];
    if ("horizontal" in padding) {
      if (padding.horizontal && padding.horizontal !== 0) {
        comp.push(`px-${pxToLayoutSize(padding.horizontal)}`);
      }
      if (padding.vertical && padding.vertical !== 0) {
        comp.push(`py-${pxToLayoutSize(padding.vertical)}`);
      }
      return comp;
    }
    const { left, right, top, bottom } = padding;
    if (left || right) {
      const pl = left ? `pl-${pxToLayoutSize(left)}` : "";
      const pr = right ? `pr-${pxToLayoutSize(right)}` : "";
      comp.push(
        ...left && right && pxToLayoutSize(left) === pxToLayoutSize(right) ? [`px-${pxToLayoutSize(left)}`] : [pl, pr]
      );
    }
    if (top || bottom) {
      const pt = top ? `pt-${pxToLayoutSize(top)}` : "";
      const pb = bottom ? `pb-${pxToLayoutSize(bottom)}` : "";
      comp.push(
        ...top && bottom && pxToLayoutSize(top) === pxToLayoutSize(bottom) ? [`py-${pxToLayoutSize(top)}`] : [pt, pb]
      );
    }
    return comp;
  };

  // FigmaToCode/packages/backend/src/common/commonPosition.ts
  var getCommonPositionValue = (node, settings) => {
    if (node.parent && node.parent.absoluteBoundingBox) {
      if ((settings == null ? void 0 : settings.embedVectors) && node.svg) {
        return {
          x: node.absoluteBoundingBox.x - node.parent.absoluteBoundingBox.x,
          y: node.absoluteBoundingBox.y - node.parent.absoluteBoundingBox.y
        };
      }
      return { x: node.x, y: node.y };
    }
    if (node.parent && node.parent.type === "GROUP") {
      return {
        x: node.x - node.parent.x,
        y: node.y - node.parent.y
      };
    }
    return {
      x: node.x,
      y: node.y
    };
  };
  function calculateRectangleFromBoundingBox(boundingBox, figmaRotationDegrees) {
    const cssRotationDegrees = -figmaRotationDegrees;
    const theta = cssRotationDegrees * Math.PI / 180;
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);
    const absCosTheta = Math.abs(cosTheta);
    const absSinTheta = Math.abs(sinTheta);
    const { width: w_b, height: h_b, x: x_b, y: y_b } = boundingBox;
    const denominator = absCosTheta * absCosTheta - absSinTheta * absSinTheta;
    const h = (w_b * absSinTheta - h_b * absCosTheta) / -denominator;
    const w = (w_b - h * absSinTheta) / absCosTheta;
    const corners = [
      { x: 0, y: 0 },
      { x: w, y: 0 },
      { x: w, y: h },
      { x: 0, y: h }
    ];
    const rotatedCorners = corners.map(({ x, y }) => ({
      x: x * cosTheta + y * sinTheta,
      y: -x * sinTheta + y * cosTheta
    }));
    const minX = Math.min(...rotatedCorners.map((c) => c.x));
    const minY = Math.min(...rotatedCorners.map((c) => c.y));
    const left = x_b - minX;
    const top = y_b - minY;
    return {
      width: parseFloat(w.toFixed(2)),
      height: parseFloat(h.toFixed(2)),
      left: parseFloat(left.toFixed(2)),
      top: parseFloat(top.toFixed(2)),
      rotation: cssRotationDegrees
    };
  }
  var commonIsAbsolutePosition = (node) => {
    if ("layoutPositioning" in node && node.layoutPositioning === "ABSOLUTE") {
      return true;
    }
    if (!node.parent || node.parent === void 0) {
      return false;
    }
    if ("layoutMode" in node.parent && node.parent.layoutMode === "NONE" || !("layoutMode" in node.parent)) {
      return true;
    }
    return false;
  };

  // FigmaToCode/packages/backend/src/common/lowercaseFirstLetter.ts
  function lowercaseFirstLetter(str) {
    if (!str || str.length === 0) {
      return str;
    }
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  // FigmaToCode/packages/backend/src/common/commonFormatAttributes.ts
  var getClassLabel = (isJSX = false) => isJSX ? "className" : "class";
  var joinStyles = (styles, isJSX) => styles.map((s) => s.trim()).join(isJSX ? ", " : "; ");
  var formatStyleAttribute = (styles, isJSX) => {
    const trimmedStyles = joinStyles(styles, isJSX);
    if (trimmedStyles === "") return "";
    return ` style=${isJSX ? `{{${trimmedStyles}}}` : `"${trimmedStyles}"`}`;
  };
  var formatDataAttribute = (label, value) => ` data-${lowercaseFirstLetter(label).replace(" ", "-")}${value === void 0 ? `` : `="${value}"`}`;
  var formatTwigAttribute = (label, value) => [".", "_"].includes(label.charAt(0)) ? "" : ` ${lowercaseFirstLetter(label).replace(" ", "-")}${value === void 0 ? `` : `="${value}"`}`;
  var formatClassAttribute = (classes, isJSX) => classes.length === 0 ? "" : ` ${getClassLabel(isJSX)}="${classes.join(" ")}"`;

  // FigmaToCode/packages/backend/src/tailwind/tailwindDefaultBuilder.ts
  var isNotEmpty = (s) => s !== "" && s !== null && s !== void 0;
  var dropEmptyStrings = (strings) => strings.filter(isNotEmpty);
  var TailwindDefaultBuilder = class {
    constructor(node, settings) {
      this.attributes = [];
      this.styleSeparator = "";
      this.addAttributes = (...newStyles) => {
        const cleanedStyles = dropEmptyStrings(newStyles).map((s) => s.trim());
        this.attributes.push(...cleanedStyles);
      };
      this.prependAttributes = (...newStyles) => {
        const cleanedStyles = dropEmptyStrings(newStyles).map((s) => s.trim());
        this.attributes.unshift(...cleanedStyles);
      };
      this.node = node;
      this.settings = settings;
      this.styleSeparator = this.isJSX ? "," : ";";
      this.style = "";
      this.data = [];
    }
    get name() {
      return this.settings.showLayerNames ? this.node.name : "";
    }
    get visible() {
      var _a;
      return (_a = this.node.visible) != null ? _a : true;
    }
    get isJSX() {
      return this.settings.tailwindGenerationMode === "jsx";
    }
    get needsJSXTextEscaping() {
      return this.isJSX;
    }
    get isTwigComponent() {
      return this.settings.tailwindGenerationMode === "twig" && this.node.type === "INSTANCE";
    }
    blend() {
      this.addAttributes(
        tailwindVisibility(this.node),
        tailwindRotation(this.node),
        tailwindOpacity(this.node),
        tailwindBlendMode(this.node)
      );
      return this;
    }
    commonPositionStyles() {
      this.size();
      this.autoLayoutPadding();
      this.position();
      this.blend();
      return this;
    }
    commonShapeStyles() {
      this.customColor(this.node.fills, "bg");
      this.radius();
      this.shadow();
      this.border();
      this.blur();
      return this;
    }
    radius() {
      if (this.node.type === "ELLIPSE") {
        this.addAttributes("rounded-full");
      } else {
        this.addAttributes(tailwindBorderRadius(this.node));
      }
      return this;
    }
    border() {
      if ("strokes" in this.node) {
        const { isOutline, property } = tailwindBorderWidth(this.node);
        this.addAttributes(property);
        this.customColor(
          this.node.strokes,
          isOutline ? "outline" : "border"
        );
      }
      return this;
    }
    position() {
      const { node } = this;
      if (commonIsAbsolutePosition(node)) {
        const { x, y } = getCommonPositionValue(node, this.settings);
        const parsedX = numberToFixedString(x);
        const parsedY = numberToFixedString(y);
        if (parsedX === "0") {
          this.addAttributes(`left-0`);
        } else {
          this.addAttributes(`left-[${parsedX}px]`);
        }
        if (parsedY === "0") {
          this.addAttributes(`top-0`);
        } else {
          this.addAttributes(`top-[${parsedY}px]`);
        }
        this.addAttributes(`absolute`);
      } else if (node.type === "GROUP" || node.isRelative) {
        this.addAttributes("relative");
      }
      return this;
    }
    /**
     * https://tailwindcss.com/docs/text-color/
     * example: text-blue-500
     * example: text-opacity-25
     * example: bg-blue-500
     */
    customColor(paint, kind) {
      if (this.visible) {
        let gradient = "";
        if (kind === "bg") {
          gradient = tailwindGradientFromFills(paint);
          const blendModeClass = tailwindBackgroundBlendMode(paint);
          if (blendModeClass) {
            this.addAttributes(blendModeClass);
          }
        }
        if (gradient) {
          this.addAttributes(gradient);
        } else {
          this.addAttributes(tailwindColorFromFills(paint, kind));
        }
      }
      return this;
    }
    /**
     * https://tailwindcss.com/docs/box-shadow/
     * example: shadow
     */
    shadow() {
      this.addAttributes(...tailwindShadow(this.node));
      return this;
    }
    // must be called before Position, because of the hasFixedSize attribute.
    size() {
      const { node, settings } = this;
      const { width, height, constraints } = tailwindSizePartial(node, settings);
      if (node.type === "TEXT") {
        switch (node.textAutoResize) {
          case "WIDTH_AND_HEIGHT":
            break;
          case "HEIGHT":
            this.addAttributes(width);
            break;
          case "NONE":
          case "TRUNCATE":
            this.addAttributes(width, height);
            break;
        }
      } else {
        this.addAttributes(width, height);
      }
      if (constraints) {
        this.addAttributes(constraints);
      }
      return this;
    }
    autoLayoutPadding() {
      if ("paddingLeft" in this.node) {
        this.addAttributes(...tailwindPadding(this.node));
      }
      return this;
    }
    blur() {
      const { node } = this;
      if ("effects" in node && node.effects.length > 0) {
        const blur2 = node.effects.find(
          (e) => e.type === "LAYER_BLUR" && e.visible
        );
        if (blur2) {
          const blurValue = pxToBlur(blur2.radius / 2);
          if (blurValue) {
            this.addAttributes(
              blurValue === "blur" ? "blur" : `blur-${blurValue}`
            );
          }
        }
        const backgroundBlur = node.effects.find(
          (e) => e.type === "BACKGROUND_BLUR" && e.visible
        );
        if (backgroundBlur) {
          const backgroundBlurValue = pxToBlur(backgroundBlur.radius / 2);
          if (backgroundBlurValue) {
            this.addAttributes(
              `backdrop-blur${backgroundBlurValue ? `-${backgroundBlurValue}` : ""}`
            );
          }
        }
      }
    }
    addData(label, value) {
      const attribute2 = formatDataAttribute(label, value);
      this.data.push(attribute2);
      return this;
    }
    build(additionalAttr = "") {
      var _a;
      if (additionalAttr) {
        this.addAttributes(additionalAttr);
      }
      if (this.name !== "") {
        this.prependAttributes(stringToClassName(this.name));
      }
      if (this.name) {
        this.addData("layer", this.name.trim());
      }
      if ("componentProperties" in this.node && this.node.componentProperties) {
        (_a = Object.entries(this.node.componentProperties)) == null ? void 0 : _a.map((prop) => {
          if (prop[1].type === "VARIANT" || prop[1].type === "BOOLEAN" || this.isTwigComponent && prop[1].type === "TEXT") {
            const cleanName = prop[0].split("#")[0].replace(/\s+/g, "-").toLowerCase();
            return this.isTwigComponent ? formatTwigAttribute(cleanName, String(prop[1].value)) : formatDataAttribute(cleanName, String(prop[1].value));
          }
          return "";
        }).filter(Boolean).sort().forEach((d) => this.data.push(d));
      }
      const classLabel = getClassLabel(this.isJSX);
      const classNames = this.attributes.length > 0 ? ` ${classLabel}="${this.attributes.filter(Boolean).join(" ")}"` : "";
      const styles = this.style.length > 0 ? ` style="${this.style}"` : "";
      const dataAttributes = this.data.join("");
      return `${dataAttributes}${classNames}${styles}`;
    }
    reset() {
      this.attributes = [];
      this.data = [];
      this.style = "";
    }
  };

  // FigmaToCode/packages/backend/src/tailwind/tailwindConfig.ts
  var layoutSize = {
    "0": "0",
    1: "px",
    2: "0.5",
    4: "1",
    6: "1.5",
    8: "2",
    10: "2.5",
    12: "3",
    14: "3.5",
    16: "4",
    20: "5",
    24: "6",
    28: "7",
    32: "8",
    36: "9",
    40: "10",
    44: "11",
    48: "12",
    56: "14",
    64: "16",
    80: "20",
    96: "24",
    112: "28",
    128: "32",
    144: "36",
    160: "40",
    176: "44",
    192: "48",
    208: "52",
    224: "56",
    240: "60",
    256: "64",
    288: "72",
    320: "80",
    384: "96"
  };
  var borderRadius = {
    0: "none",
    0.125: "sm",
    0.25: "",
    0.375: "md",
    0.5: "lg",
    0.75: "xl",
    1: "2xl",
    1.5: "3xl",
    10: "full"
  };
  var borderRadiusV4 = {
    0: "none",
    0.125: "xs",
    // sm -> xs
    0.25: "sm",
    // (default) -> sm
    0.375: "md",
    // unchanged
    0.5: "lg",
    // unchanged
    0.75: "xl",
    // unchanged
    1: "2xl",
    // unchanged
    1.5: "3xl",
    // unchanged
    10: "full"
    // unchanged
  };
  var fontSize = {
    0.75: "xs",
    0.875: "sm",
    1: "base",
    1.125: "lg",
    1.25: "xl",
    1.5: "2xl",
    1.875: "3xl",
    2.25: "4xl",
    3: "5xl",
    3.75: "6xl",
    4.5: "7xl",
    6: "8xl",
    8: "9xl"
  };
  var lineHeight = {
    0.75: "3",
    // 0.75rem
    1: "4",
    // 1rem  
    1.25: "5",
    // 1.25rem
    1.5: "6",
    // 1.5rem
    1.75: "7",
    // 1.75rem
    2: "8",
    // 2rem
    2.25: "9",
    // 2.25rem
    2.5: "10"
    // 2.5rem
  };
  var letterSpacing = {
    "-0.05": "tighter",
    "-0.025": "tight",
    // 0: "normal",
    0.025: "wide",
    0.05: "wider",
    0.1: "widest"
  };
  var blur = {
    0: "none",
    4: "sm",
    8: "blur",
    // This is not the official Tailwind class name suffix, but currently needed for the blurValue variable to work.
    12: "md",
    16: "lg",
    24: "xl",
    40: "2xl",
    64: "3xl"
  };
  var blurV4 = {
    0: "none",
    4: "xs",
    // sm -> xs
    8: "sm",
    // blur -> sm
    12: "md",
    // unchanged
    16: "lg",
    // unchanged
    24: "xl",
    // unchanged
    40: "2xl",
    // unchanged
    64: "3xl"
    // unchanged
  };
  var opacity = [0, 5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95];
  var color = {
    "#000000": "black",
    "#ffffff": "white",
    "#f8fafc": "slate-50",
    "#f1f5f9": "slate-100",
    "#e2e8f0": "slate-200",
    "#cbd5e1": "slate-300",
    "#94a3b8": "slate-400",
    "#64748b": "slate-500",
    "#475569": "slate-600",
    "#334155": "slate-700",
    "#1e293b": "slate-800",
    "#0f172a": "slate-900",
    "#020617": "slate-950",
    "#f9fafb": "gray-50",
    "#f3f4f6": "gray-100",
    "#e5e7eb": "gray-200",
    "#d1d5db": "gray-300",
    "#9ca3af": "gray-400",
    "#6b7280": "gray-500",
    "#4b5563": "gray-600",
    "#374151": "gray-700",
    "#1f2937": "gray-800",
    "#111827": "gray-900",
    "#030712": "gray-950",
    "#f4f4f5": "zinc-100",
    "#e4e4e7": "zinc-200",
    "#d4d4d8": "zinc-300",
    "#a1a1aa": "zinc-400",
    "#71717a": "zinc-500",
    "#52525b": "zinc-600",
    "#3f3f46": "zinc-700",
    "#27272a": "zinc-800",
    "#18181b": "zinc-900",
    "#09090b": "zinc-950",
    "#fafafa": "neutral-50",
    "#f5f5f5": "neutral-100",
    "#e5e5e5": "neutral-200",
    "#d4d4d4": "neutral-300",
    "#a3a3a3": "neutral-400",
    "#737373": "neutral-500",
    "#525252": "neutral-600",
    "#404040": "neutral-700",
    "#262626": "neutral-800",
    "#171717": "neutral-900",
    "#0a0a0a": "neutral-950",
    "#fafaf9": "stone-50",
    "#f5f5f4": "stone-100",
    "#e7e5e4": "stone-200",
    "#d6d3d1": "stone-300",
    "#a8a29e": "stone-400",
    "#78716c": "stone-500",
    "#57534e": "stone-600",
    "#44403c": "stone-700",
    "#292524": "stone-800",
    "#1c1917": "stone-900",
    "#0c0a09": "stone-950",
    "#fef2f2": "red-50",
    "#fee2e2": "red-100",
    "#fecaca": "red-200",
    "#fca5a5": "red-300",
    "#f87171": "red-400",
    "#ef4444": "red-500",
    "#dc2626": "red-600",
    "#b91c1c": "red-700",
    "#991b1b": "red-800",
    "#7f1d1d": "red-900",
    "#450a0a": "red-950",
    "#fff7ed": "orange-50",
    "#ffedd5": "orange-100",
    "#fed7aa": "orange-200",
    "#fdba74": "orange-300",
    "#fb923c": "orange-400",
    "#f97316": "orange-500",
    "#ea580c": "orange-600",
    "#c2410c": "orange-700",
    "#9a3412": "orange-800",
    "#7c2d12": "orange-900",
    "#431407": "orange-950",
    "#fffbeb": "amber-50",
    "#fef3c7": "amber-100",
    "#fde68a": "amber-200",
    "#fcd34d": "amber-300",
    "#fbbf24": "amber-400",
    "#f59e0b": "amber-500",
    "#d97706": "amber-600",
    "#b45309": "amber-700",
    "#92400e": "amber-800",
    "#78350f": "amber-900",
    "#451a03": "amber-950",
    "#fefce8": "yellow-50",
    "#fef9c3": "yellow-100",
    "#fef08a": "yellow-200",
    "#fde047": "yellow-300",
    "#facc15": "yellow-400",
    "#eab308": "yellow-500",
    "#ca8a04": "yellow-600",
    "#a16207": "yellow-700",
    "#854d0e": "yellow-800",
    "#713f12": "yellow-900",
    "#422006": "yellow-950",
    "#f7fee7": "lime-50",
    "#ecfccb": "lime-100",
    "#d9f99d": "lime-200",
    "#bef264": "lime-300",
    "#a3e635": "lime-400",
    "#84cc16": "lime-500",
    "#65a30d": "lime-600",
    "#4d7c0f": "lime-700",
    "#3f6212": "lime-800",
    "#365314": "lime-900",
    "#1a2e05": "lime-950",
    "#f0fdf4": "green-50",
    "#dcfce7": "green-100",
    "#bbf7d0": "green-200",
    "#86efac": "green-300",
    "#4ade80": "green-400",
    "#22c55e": "green-500",
    "#16a34a": "green-600",
    "#15803d": "green-700",
    "#166534": "green-800",
    "#14532d": "green-900",
    "#052e16": "green-950",
    "#ecfdf5": "emerald-50",
    "#d1fae5": "emerald-100",
    "#a7f3d0": "emerald-200",
    "#6ee7b7": "emerald-300",
    "#34d399": "emerald-400",
    "#10b981": "emerald-500",
    "#059669": "emerald-600",
    "#047857": "emerald-700",
    "#065f46": "emerald-800",
    "#064e3b": "emerald-900",
    "#022c22": "emerald-950",
    "#f0fdfa": "teal-50",
    "#ccfbf1": "teal-100",
    "#99f6e4": "teal-200",
    "#5eead4": "teal-300",
    "#2dd4bf": "teal-400",
    "#14b8a6": "teal-500",
    "#0d9488": "teal-600",
    "#0f766e": "teal-700",
    "#115e59": "teal-800",
    "#134e4a": "teal-900",
    "#042f2e": "teal-950",
    "#ecfeff": "cyan-50",
    "#cffafe": "cyan-100",
    "#a5f3fc": "cyan-200",
    "#67e8f9": "cyan-300",
    "#22d3ee": "cyan-400",
    "#06b6d4": "cyan-500",
    "#0891b2": "cyan-600",
    "#0e7490": "cyan-700",
    "#155e75": "cyan-800",
    "#164e63": "cyan-900",
    "#083344": "cyan-950",
    "#f0f9ff": "sky-50",
    "#e0f2fe": "sky-100",
    "#bae6fd": "sky-200",
    "#7dd3fc": "sky-300",
    "#38bdf8": "sky-400",
    "#0ea5e9": "sky-500",
    "#0284c7": "sky-600",
    "#0369a1": "sky-700",
    "#075985": "sky-800",
    "#0c4a6e": "sky-900",
    "#082f49": "sky-950",
    "#eff6ff": "blue-50",
    "#dbeafe": "blue-100",
    "#bfdbfe": "blue-200",
    "#93c5fd": "blue-300",
    "#60a5fa": "blue-400",
    "#3b82f6": "blue-500",
    "#2563eb": "blue-600",
    "#1d4ed8": "blue-700",
    "#1e40af": "blue-800",
    "#1e3a8a": "blue-900",
    "#172554": "blue-950",
    "#eef2ff": "indigo-50",
    "#e0e7ff": "indigo-100",
    "#c7d2fe": "indigo-200",
    "#a5b4fc": "indigo-300",
    "#818cf8": "indigo-400",
    "#6366f1": "indigo-500",
    "#4f46e5": "indigo-600",
    "#4338ca": "indigo-700",
    "#3730a3": "indigo-800",
    "#312e81": "indigo-900",
    "#1e1b4b": "indigo-950",
    "#f5f3ff": "violet-50",
    "#ede9fe": "violet-100",
    "#ddd6fe": "violet-200",
    "#c4b5fd": "violet-300",
    "#a78bfa": "violet-400",
    "#8b5cf6": "violet-500",
    "#7c3aed": "violet-600",
    "#6d28d9": "violet-700",
    "#5b21b6": "violet-800",
    "#4c1d95": "violet-900",
    "#2e1065": "violet-950",
    "#faf5ff": "purple-50",
    "#f3e8ff": "purple-100",
    "#e9d5ff": "purple-200",
    "#d8b4fe": "purple-300",
    "#c084fc": "purple-400",
    "#a855f7": "purple-500",
    "#9333ea": "purple-600",
    "#7e22ce": "purple-700",
    "#6b21a8": "purple-800",
    "#581c87": "purple-900",
    "#3b0764": "purple-950",
    "#fdf4ff": "fuchsia-50",
    "#fae8ff": "fuchsia-100",
    "#f5d0fe": "fuchsia-200",
    "#f0abfc": "fuchsia-300",
    "#e879f9": "fuchsia-400",
    "#d946ef": "fuchsia-500",
    "#c026d3": "fuchsia-600",
    "#a21caf": "fuchsia-700",
    "#86198f": "fuchsia-800",
    "#701a75": "fuchsia-900",
    "#4a044e": "fuchsia-950",
    "#fdf2f8": "pink-50",
    "#fce7f3": "pink-100",
    "#fbcfe8": "pink-200",
    "#f9a8d4": "pink-300",
    "#f472b6": "pink-400",
    "#ec4899": "pink-500",
    "#db2777": "pink-600",
    "#be185d": "pink-700",
    "#9d174d": "pink-800",
    "#831843": "pink-900",
    "#500724": "pink-950",
    "#fff1f2": "rose-50",
    "#ffe4e6": "rose-100",
    "#fecdd3": "rose-200",
    "#fda4af": "rose-300",
    "#fb7185": "rose-400",
    "#f43f5e": "rose-500",
    "#e11d48": "rose-600",
    "#be123c": "rose-700",
    "#9f1239": "rose-800",
    "#881337": "rose-900",
    "#4c0519": "rose-950"
  };
  var fontWeight = {
    100: "thin",
    200: "extralight",
    300: "light",
    400: "normal",
    500: "medium",
    600: "semibold",
    700: "bold",
    800: "extrabold",
    900: "black"
  };
  var fontFamily = {
    sans: [
      "ui-sans-serif",
      "system-ui",
      "sans-serif",
      "Apple Color Emoji",
      "Segoe UI Emoji",
      "Segoe UI Symbol",
      "Noto Color Emoji"
    ],
    serif: [
      "ui-serif",
      "Georgia",
      "Cambria",
      "Times New Roman",
      "Times",
      "serif"
    ],
    mono: [
      "ui-monospace",
      "SFMono-Regular",
      "Menlo",
      "Monaco",
      "Consolas",
      "Liberation Mono",
      "Courier New",
      "monospace"
    ]
  };
  var border = {
    0: "0",
    1: "1",
    2: "2",
    4: "4",
    8: "8"
  };
  var outline = {
    0: "0",
    1: "1",
    2: "2",
    4: "4",
    8: "8"
  };
  var shadowV4 = {
    sm: "xs",
    // sm -> xs
    DEFAULT: "sm",
    // (default) -> sm
    md: "md",
    // unchanged
    lg: "lg",
    // unchanged
    xl: "xl",
    // unchanged
    "2xl": "2xl"
    // unchanged
  };
  var config = {
    layoutSize,
    borderRadius,
    borderRadiusV4,
    fontSize,
    lineHeight,
    letterSpacing,
    blur,
    blurV4,
    shadowV4,
    opacity,
    color,
    fontWeight,
    fontFamily,
    border,
    outline
  };

  // FigmaToCode/packages/backend/src/tailwind/tailwindTextBuilder.ts
  var TailwindTextBuilder = class extends TailwindDefaultBuilder {
    constructor() {
      super(...arguments);
      this.truncateText = (node) => {
        if (node.textTruncation !== "DISABLED" && node.maxLines) {
          if (node.maxLines > 0 && node.maxLines < 7) {
            return `line-clamp-${node.maxLines}`;
          } else {
            return `line-clamp-[${node.maxLines}]`;
          }
        }
        return "";
      };
      this.getTailwindColorFromFills = (fills) => {
        return tailwindColorFromFills(fills, "text");
      };
      this.fontSize = (fontSize2) => {
        return `text-${pxToFontSize(fontSize2)}`;
      };
      this.fontWeight = (fontWeight2) => {
        const weight = config.fontWeight[fontWeight2];
        return weight ? `font-${weight}` : "";
      };
      this.indentStyle = (indentation) => {
        return `pl-${Math.round(indentation)}`;
      };
      this.fontFamily = (fontName) => {
        const baseFontFamily = localTailwindSettings.baseFontFamily;
        if (baseFontFamily && fontName.family.toLowerCase() === baseFontFamily.toLowerCase()) {
          return "";
        }
        const fontFamilyCustomConfig = localTailwindSettings.fontFamilyCustomConfig;
        if (fontFamilyCustomConfig) {
          for (const family in fontFamilyCustomConfig) {
            if (fontFamilyCustomConfig[family].includes(fontName.family)) {
              return `font-${family}`;
            }
          }
        } else {
          if (config.fontFamily.sans.includes(fontName.family)) {
            return "font-sans";
          }
          if (config.fontFamily.serif.includes(fontName.family)) {
            return "font-serif";
          }
          if (config.fontFamily.mono.includes(fontName.family)) {
            return "font-mono";
          }
        }
        const underscoreFontName = fontName.family.replace(/\s/g, "_");
        return "font-['" + underscoreFontName + "']";
      };
      /**
       * https://v3.tailwindcss.com/docs/blur
       */
      this.layerBlur = () => {
        if (this.node && this.node.effects) {
          const effects = this.node.effects;
          const blurEffect = effects.find(
            (effect) => effect.type === "LAYER_BLUR" && effect.visible !== false
          );
          if (blurEffect && blurEffect.radius && blurEffect.radius > 0) {
            const blurSuffix = pxToBlur(blurEffect.radius);
            if (blurSuffix) {
              return `blur-${blurSuffix}`;
            }
          }
        }
        return "";
      };
      /**
       * New method to handle text shadow.
       * When a drop shadow is applied to a text element,
       * this method returns an arbitrary Tailwind utility class
       * in the following format:
       *
       * [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.50)]
       */
      this.textShadow = () => {
        if (this.node && this.node.effects) {
          const effects = this.node.effects;
          const dropShadow = effects.find(
            (effect) => effect.type === "DROP_SHADOW" && effect.visible !== false
          );
          if (dropShadow) {
            const ds = dropShadow;
            const offsetX = Math.round(ds.offset.x);
            const offsetY = Math.round(ds.offset.y);
            const blurRadius = Math.round(ds.radius);
            const r = Math.round(ds.color.r * 255);
            const g = Math.round(ds.color.g * 255);
            const b = Math.round(ds.color.b * 255);
            const aFixed = ds.color.a.toFixed(2);
            return `[text-shadow:_${offsetX}px_${offsetY}px_${blurRadius}px_rgb(${r}_${g}_${b}_/_${aFixed})]`;
          }
        }
        return "";
      };
    }
    getTextSegments(node) {
      const segments = node.styledTextSegments;
      if (!segments) {
        return [];
      }
      return segments.map((segment) => {
        const color2 = this.getTailwindColorFromFills(segment.fills);
        const textDecoration = this.textDecoration(segment.textDecoration);
        const textTransform = this.textTransform(segment.textCase);
        const lineHeightStyle = this.lineHeight(
          segment.lineHeight,
          segment.fontSize
        );
        const letterSpacingStyle = this.letterSpacing(
          segment.letterSpacing,
          segment.fontSize
        );
        const blurStyle = this.layerBlur();
        const shadowStyle = this.textShadow();
        const styleClasses = [
          color2,
          this.fontSize(segment.fontSize),
          this.fontWeight(segment.fontWeight),
          this.fontFamily(segment.fontName),
          textDecoration,
          textTransform,
          lineHeightStyle,
          letterSpacingStyle,
          // textIndentStyle,
          blurStyle,
          shadowStyle,
          this.truncateText(node)
        ].filter(Boolean).join(" ");
        let chars = segment.characters;
        if (this.needsJSXTextEscaping) {
          chars = escapeJSXText(chars);
        }
        const charsWithLineBreak = chars.split("\n").join("<br/>");
        return {
          style: styleClasses,
          text: charsWithLineBreak,
          openTypeFeatures: segment.openTypeFeatures
        };
      });
    }
    /**
     * https://tailwindcss.com/docs/font-size/
     * example: text-md
     */
    // fontSize(fontSize: number): this {
    //   // example: text-md
    //   const value = pxToFontSize(fontSize);
    //   this.addAttributes(`text-${value}`);
    //   return this;
    // }
    /**
     * https://tailwindcss.com/docs/font-style/
     * example: font-extrabold
     * example: italic
     */
    fontStyle(node) {
      if (node.fontName !== figma.mixed) {
        const lowercaseStyle = node.fontName.style.toLowerCase();
        if (lowercaseStyle.match("italic")) {
          this.addAttributes("italic");
        }
        if (lowercaseStyle.match("regular")) {
          return this;
        }
        const value = node.fontName.style.replaceAll("italic", "").replaceAll(" ", "").toLowerCase();
        this.addAttributes(`font-${value}`);
      }
      return this;
    }
    /**
     * https://tailwindcss.com/docs/letter-spacing/
     * example: tracking-widest
     */
    letterSpacing(letterSpacing2, fontSize2) {
      const letterSpacingProp = commonLetterSpacing(letterSpacing2, fontSize2);
      if (letterSpacingProp > 0) {
        const value = pxToLetterSpacing(letterSpacingProp);
        return `tracking-${value}`;
      }
      return "";
    }
    /**
     * https://tailwindcss.com/docs/line-height/
     * example: leading-3
     */
    lineHeight(lineHeight2, fontSize2) {
      const lineHeightProp = commonLineHeight(lineHeight2, fontSize2);
      if (lineHeightProp > 0) {
        const value = pxToLineHeight(lineHeightProp);
        return `leading-${value}`;
      }
      return "";
    }
    /**
     * https://tailwindcss.com/docs/text-align/
     * example: text-justify
     */
    textAlignHorizontal() {
      const node = this.node;
      if (node.textAlignHorizontal && node.textAlignHorizontal !== "LEFT") {
        switch (node.textAlignHorizontal) {
          case "CENTER":
            this.addAttributes(`text-center`);
            break;
          case "RIGHT":
            this.addAttributes(`text-right`);
            break;
          case "JUSTIFIED":
            this.addAttributes(`text-justify`);
            break;
          default:
            break;
        }
      }
      return this;
    }
    /**
     * https://tailwindcss.com/docs/vertical-align/
     * example: align-top, align-middle, align-bottom
     */
    textAlignVertical() {
      const node = this.node;
      switch (node.textAlignVertical) {
        case "TOP":
          this.addAttributes("justify-start");
          break;
        case "CENTER":
          this.addAttributes("justify-center");
          break;
        case "BOTTOM":
          this.addAttributes("justify-end");
          break;
        default:
          break;
      }
      return this;
    }
    /**
     * https://tailwindcss.com/docs/text-transform/
     * example: uppercase
     */
    textTransform(textCase) {
      switch (textCase) {
        case "UPPER":
          return "uppercase";
        case "LOWER":
          return "lowercase";
        case "TITLE":
          return "capitalize";
        case "ORIGINAL":
        case "SMALL_CAPS":
        case "SMALL_CAPS_FORCED":
        default:
          return "";
      }
    }
    /**
     * https://tailwindcss.com/docs/text-decoration/
     * example: underline
     */
    textDecoration(textDecoration) {
      switch (textDecoration) {
        case "STRIKETHROUGH":
          return "line-through";
        case "UNDERLINE":
          return "underline";
        case "NONE":
          return "";
      }
    }
    reset() {
      this.attributes = [];
    }
  };

  // FigmaToCode/packages/backend/src/tailwind/builderImpl/tailwindAutoLayout.ts
  var getFlexDirection = (node) => node.layoutMode === "HORIZONTAL" ? "" : "flex-col";
  var getJustifyContent = (node) => {
    switch (node.primaryAxisAlignItems) {
      case void 0:
      case "MIN":
        return "justify-start";
      case "CENTER":
        return "justify-center";
      case "MAX":
        return "justify-end";
      case "SPACE_BETWEEN":
        return "justify-between";
    }
  };
  var getAlignItems = (node) => {
    switch (node.counterAxisAlignItems) {
      case void 0:
      case "MIN":
        return "items-start";
      case "CENTER":
        return "items-center";
      case "MAX":
        return "items-end";
      case "BASELINE":
        return "items-baseline";
    }
  };
  var getGap = (node) => node.itemSpacing > 0 && node.primaryAxisAlignItems !== "SPACE_BETWEEN" ? `gap-${pxToLayoutSize(node.itemSpacing)}` : "";
  var getFlexWrap = (node) => node.layoutWrap === "WRAP" ? "flex-wrap" : "";
  var getAlignContent = (node) => {
    if (node.layoutWrap !== "WRAP") return "";
    switch (node.counterAxisAlignItems) {
      case void 0:
      case "MIN":
        return "content-start";
      case "CENTER":
        return "content-center";
      case "MAX":
        return "content-end";
      case "BASELINE":
        return "content-baseline";
      default:
        return "content-normal";
    }
  };
  var getFlex = (node, autoLayout) => node.parent && "layoutMode" in node.parent && node.parent.layoutMode === autoLayout.layoutMode ? "flex" : "inline-flex";
  var tailwindAutoLayoutProps = (node, autoLayout) => {
    const classes = [
      getFlex(node, autoLayout),
      getFlexDirection(autoLayout),
      getJustifyContent(autoLayout),
      getAlignItems(autoLayout),
      getGap(autoLayout),
      getFlexWrap(autoLayout),
      getAlignContent(autoLayout)
    ].filter(Boolean);
    return classes.join(" ");
  };

  // FigmaToCode/packages/backend/src/common/curry.ts
  function curry(fn, arity = fn.length) {
    return function curried(...args) {
      if (args.length >= arity) {
        return fn(...args);
      }
      return function(...moreArgs) {
        return curried(...args, ...moreArgs);
      };
    };
  }

  // FigmaToCode/packages/backend/src/altNodes/altNodeUtils.ts
  var overrideReadonlyProperty = curry(
    (prop, value, obj) => Object.defineProperty(obj, prop, {
      value,
      writable: true,
      configurable: true
    })
  );
  var assignParent = overrideReadonlyProperty("parent");
  var assignChildren = overrideReadonlyProperty("children");
  var assignType = overrideReadonlyProperty("type");
  var assignRectangleType = assignType("RECTANGLE");
  function isNotEmpty2(value) {
    return value !== null && value !== void 0;
  }
  var isTypeOrGroupOfTypes = curry(
    (matchTypes, node) => {
      if (matchTypes.includes(node.type)) return true;
      if ("children" in node) {
        for (let i = 0; i < node.children.length; i++) {
          const childNode = node.children[i];
          const result = isTypeOrGroupOfTypes(matchTypes, childNode);
          if (!result) {
            return false;
          }
        }
        return node.children.length > 0;
      }
      return false;
    }
  );
  var renderAndAttachSVG = async (node) => {
    if (node.canBeFlattened) {
      if (node.svg) {
        return node;
      }
      try {
        const svg = await exportAsyncProxy(node, {
          format: "SVG_STRING"
        });
        if (node.colorVariableMappings && node.colorVariableMappings.size > 0) {
          let processedSvg = svg;
          const colorAttributeRegex = /(fill|stroke)="([^"]*)"/g;
          processedSvg = processedSvg.replace(colorAttributeRegex, (match, attribute2, colorValue) => {
            const normalizedColor = colorValue.toLowerCase().trim();
            const mapping = node.colorVariableMappings.get(normalizedColor);
            if (mapping) {
              return `${attribute2}="var(--${mapping.variableName}, ${colorValue})"`;
            }
            return match;
          });
          const styleRegex = /style="([^"]*)(?:(fill|stroke):\s*([^;"]*))(;|\s|")([^"]*)"/g;
          processedSvg = processedSvg.replace(styleRegex, (match, prefix, property, colorValue, separator, suffix) => {
            const normalizedColor = colorValue.toLowerCase().trim();
            const mapping = node.colorVariableMappings.get(normalizedColor);
            if (mapping) {
              return `style="${prefix}${property}: var(--${mapping.variableName}, ${colorValue})${separator}${suffix}"`;
            }
            return match;
          });
          node.svg = processedSvg;
        } else {
          node.svg = svg;
        }
      } catch (error) {
        addWarning(`Failed rendering SVG for ${node.name}`);
        console.error(`Error rendering SVG for ${node.type}:${node.id}`);
        console.error(error);
      }
    }
    return node;
  };

  // FigmaToCode/packages/backend/src/tailwind/tailwindMain.ts
  var localTailwindSettings;
  var previousExecutionCache = [];
  var SELF_CLOSING_TAGS = ["img"];
  var tailwindMain = async (sceneNode, settings) => {
    localTailwindSettings = settings;
    previousExecutionCache = [];
    let result = await tailwindWidgetGenerator(sceneNode, settings);
    if (result.startsWith("\n")) {
      result = result.slice(1);
    }
    return result;
  };
  var tailwindWidgetGenerator = async (sceneNode, settings) => {
    const visibleNodes = getVisibleNodes(sceneNode);
    const promiseOfConvertedCode = visibleNodes.map(convertNode(settings));
    const code = (await Promise.all(promiseOfConvertedCode)).join("");
    return code;
  };
  var convertNode = (settings) => async (node) => {
    if (settings.embedVectors && node.canBeFlattened) {
      const altNode = await renderAndAttachSVG(node);
      if (altNode.svg) {
        return tailwindWrapSVG(altNode, settings);
      }
    }
    switch (node.type) {
      case "RECTANGLE":
      case "ELLIPSE":
        return tailwindContainer(node, "", "", settings);
      case "GROUP":
        return tailwindGroup(node, settings);
      case "FRAME":
      case "COMPONENT":
      case "INSTANCE":
      case "COMPONENT_SET":
      case "SLOT":
        return tailwindFrame(node, settings);
      case "TEXT":
        return tailwindText(node, settings);
      case "LINE":
        return tailwindLine(node, settings);
      case "SECTION":
        return tailwindSection(node, settings);
      case "VECTOR":
        if (!settings.embedVectors) {
          addWarning("Vector is not supported");
        }
        return tailwindContainer(
          __spreadProps(__spreadValues({}, node), { type: "RECTANGLE" }),
          "",
          "",
          settings
        );
      default:
        addWarning(`${node.type} node is not supported`);
    }
    return "";
  };
  var tailwindWrapSVG = (node, settings) => {
    var _a;
    if (!node.svg) return "";
    const builder = new TailwindDefaultBuilder(node, settings).addData("svg-wrapper").position();
    return `
<div${builder.build()}>
${indentString((_a = node.svg) != null ? _a : "")}</div>`;
  };
  var tailwindGroup = async (node, settings) => {
    if (node.width < 0 || node.height <= 0 || node.children.length === 0) {
      return "";
    }
    const builder = new TailwindDefaultBuilder(node, settings).blend().size().position();
    if (builder.attributes || builder.style) {
      const attr = builder.build("");
      const generator = await tailwindWidgetGenerator(node.children, settings);
      return `
<div${attr}>${indentString(generator)}
</div>`;
    }
    return await tailwindWidgetGenerator(node.children, settings);
  };
  var tailwindText = (node, settings) => {
    const layoutBuilder = new TailwindTextBuilder(node, settings).commonPositionStyles().textAlignHorizontal().textAlignVertical();
    const styledHtml = layoutBuilder.getTextSegments(node);
    previousExecutionCache.push(...styledHtml);
    let content = "";
    if (styledHtml.length === 1) {
      const segment = styledHtml[0];
      layoutBuilder.addAttributes(segment.style);
      const getFeatureTag = (features) => {
        if (features.SUBS === true) return "sub";
        if (features.SUPS === true) return "sup";
        return "";
      };
      const additionalTag = getFeatureTag(segment.openTypeFeatures);
      content = additionalTag ? `<${additionalTag}>${segment.text}</${additionalTag}>` : segment.text;
    } else {
      content = styledHtml.map((style) => {
        const tag = style.openTypeFeatures.SUBS === true ? "sub" : style.openTypeFeatures.SUPS === true ? "sup" : "span";
        return `<${tag} class="${style.style}">${style.text}</${tag}>`;
      }).join("");
    }
    return `
<div${layoutBuilder.build()}>${content}</div>`;
  };
  var tailwindFrame = async (node, settings) => {
    if (node.type === "INSTANCE" && isTwigComponentNode(node)) {
      return tailwindTwigComponentInstance(node, settings);
    }
    const childrenStr = await tailwindWidgetGenerator(node.children, settings);
    const clipsContentClass = node.clipsContent && "children" in node && node.children.length > 0 ? "overflow-hidden" : "";
    let layoutProps = "";
    if (node.layoutMode !== "NONE") {
      layoutProps = tailwindAutoLayoutProps(node, node);
    }
    const combinedProps = [layoutProps, clipsContentClass].filter(Boolean).join(" ");
    return tailwindContainer(node, childrenStr, combinedProps, settings);
  };
  var tailwindTwigComponentInstance = async (node, settings) => {
    const componentName = extractComponentName(node);
    const builder = new TailwindDefaultBuilder(node, settings);
    const attributes = builder.build();
    let childrenStr = "";
    const embeddableChildren = node.children ? node.children.filter((n) => isTwigContentNode(n)) : [];
    if (embeddableChildren.length > 0) {
      childrenStr = await tailwindWidgetGenerator(embeddableChildren, settings);
      return `
<twig:${componentName}${attributes}>${indentString(childrenStr)}
</twig:${componentName}>`;
    } else {
      return `
<twig:${componentName}${attributes} />`;
    }
  };
  var isTwigComponentNode = (node) => {
    return localTailwindSettings.tailwindGenerationMode === "twig" && node.type === "INSTANCE" && !extractComponentName(node).startsWith("HTML:") && !isTwigContentNode(node);
  };
  var isTwigContentNode = (node) => {
    return node.type === "INSTANCE" && node.name.startsWith("TwigContent");
  };
  var extractComponentName = (node) => {
    if (node.mainComponent) {
      return node.mainComponent.name;
    }
    return node.name;
  };
  var tailwindContainer = (node, children, additionalAttr, settings) => {
    if (node.width < 0 || node.height < 0) {
      return children;
    }
    const builder = new TailwindDefaultBuilder(node, settings).commonPositionStyles().commonShapeStyles();
    if (!builder.attributes && !additionalAttr) {
      return children;
    }
    const build = builder.build(additionalAttr);
    let tag = "div";
    let src = "";
    const topFill = retrieveTopFill(node.fills);
    if ((topFill == null ? void 0 : topFill.type) === "IMAGE") {
      addWarning("Image fills are replaced with placeholders");
      const imageURL = getPlaceholderImage(node.width, node.height);
      if (!("children" in node) || node.children.length === 0) {
        tag = "img";
        src = ` src="${imageURL}"`;
      } else {
        builder.addAttributes(`bg-[url(${imageURL})]`);
      }
    }
    if (children) {
      return `
<${tag}${build}${src}>${indentString(children)}
</${tag}>`;
    } else if (SELF_CLOSING_TAGS.includes(tag) || settings.tailwindGenerationMode === "jsx") {
      return `
<${tag}${build}${src} />`;
    } else {
      return `
<${tag}${build}${src}></${tag}>`;
    }
  };
  var tailwindLine = (node, settings) => {
    const builder = new TailwindDefaultBuilder(node, settings).commonPositionStyles().commonShapeStyles();
    return `
<div${builder.build()}></div>`;
  };
  var tailwindSection = async (node, settings) => {
    const childrenStr = await tailwindWidgetGenerator(node.children, settings);
    const builder = new TailwindDefaultBuilder(node, settings).size().position().customColor(node.fills, "bg");
    const build = builder.build();
    return childrenStr ? `
<div${build}>${indentString(childrenStr)}
</div>` : `
<div${build}></div>`;
  };

  // FigmaToCode/packages/backend/src/tailwind/conversionTables.ts
  var nearestValue = (goal, array) => {
    return array.reduce((prev, curr) => {
      return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
    });
  };
  var nearestValueWithThreshold = (goal, array, thresholdPercent = localTailwindSettings.thresholdPercent) => {
    const nearest = nearestValue(goal, array);
    const diff = Math.abs(nearest - goal);
    const percentDiff = diff / goal * 100;
    if (percentDiff <= thresholdPercent) {
      return nearest;
    }
    return null;
  };
  var exactValue = (goal, array) => {
    for (let i = 0; i < array.length; i++) {
      const diff = Math.abs(goal - array[i]);
      if (diff <= 0.05) {
        return array[i];
      }
    }
    return null;
  };
  var pxToRemToTailwind = (value, conversionMap) => {
    const keys = Object.keys(conversionMap).map((d) => +d);
    const baseFontSize = localTailwindSettings.baseFontSize || 16;
    const remValue = value / baseFontSize;
    const convertedValue = exactValue(remValue, keys);
    if (convertedValue) {
      return conversionMap[convertedValue];
    } else if (localTailwindSettings.roundTailwindValues) {
      const thresholdValue = nearestValueWithThreshold(remValue, keys);
      if (thresholdValue !== null) {
        return conversionMap[thresholdValue];
      }
    }
    return `[${numberToFixedString(value)}px]`;
  };
  var pxToTailwind = (value, conversionMap) => {
    const keys = Object.keys(conversionMap).map((d) => +d);
    const convertedValue = exactValue(value, keys);
    if (convertedValue) {
      return conversionMap[convertedValue];
    } else if (localTailwindSettings.roundTailwindValues) {
      const thresholdValue = nearestValueWithThreshold(value, keys);
      if (thresholdValue !== null) {
        return conversionMap[thresholdValue];
      }
    }
    return `[${numberToFixedString(value)}px]`;
  };
  var pxToLetterSpacing = (value) => {
    return pxToRemToTailwind(value, config.letterSpacing);
  };
  var pxToLineHeight = (value) => {
    return pxToRemToTailwind(value, config.lineHeight);
  };
  var pxToFontSize = (value) => {
    return pxToRemToTailwind(value, config.fontSize);
  };
  var pxToBorderRadius = (value) => {
    const conversionMap = localTailwindSettings.useTailwind4 ? config.borderRadiusV4 : config.borderRadius;
    return pxToRemToTailwind(value, conversionMap);
  };
  var pxToBorderWidth = (value) => {
    return pxToTailwind(value, config.border);
  };
  var pxToOutline = (value) => {
    return pxToTailwind(value, config.outline);
  };
  var pxToBlur = (value) => {
    const conversionMap = localTailwindSettings.useTailwind4 ? config.blurV4 : config.blur;
    return pxToTailwind(value, conversionMap);
  };
  var pxToLayoutSize = (value) => {
    const baseFontSize = localTailwindSettings.baseFontSize || 16;
    const scaledValue = value * 16 / baseFontSize;
    const result = pxToTailwind(scaledValue, config.layoutSize);
    return result !== null ? result : `[${numberToFixedString(value)}px]`;
  };
  var nearestOpacity = (nodeOpacity) => {
    return nearestValue(nodeOpacity * 100, config.opacity);
  };
  var nearestColor2 = nearestColorFrom(Object.keys(config.color));
  var nearestColorFromRgb = (color2) => {
    const colorMultiplied = {
      r: color2.r * 255,
      g: color2.g * 255,
      b: color2.b * 255
    };
    const value = nearestColor2(colorMultiplied);
    const name = config.color[value];
    return { name, value };
  };
  var variableToColorName = async (id) => {
    var _a;
    return ((_a = await figma.variables.getVariableByIdAsync(id)) == null ? void 0 : _a.name.replaceAll("/", "-").replaceAll(" ", "-")) || id.toLowerCase().replaceAll(":", "-");
  };
  function getColorInfo(fill) {
    let colorName;
    let colorType;
    let hex = "#" + rgbTo6hex(fill.color);
    let meta = "";
    if (fill.variableColorName) {
      colorName = fill.variableColorName;
      colorType = "variable";
      meta = "custom";
      return {
        colorType,
        colorName,
        hex,
        meta
      };
    }
    if (fill.color.r === 0 && fill.color.g === 0 && fill.color.b === 0) {
      return {
        colorType: "tailwind",
        colorName: "black",
        hex: "#000000",
        meta: ""
      };
    } else if (fill.color.r === 1 && fill.color.g === 1 && fill.color.b === 1) {
      return {
        colorType: "tailwind",
        colorName: "white",
        hex: "#ffffff",
        meta: ""
      };
    } else {
      const { name, value } = nearestColorFromRgb(fill.color);
      if (localTailwindSettings.roundTailwindColors || hex === value) {
        colorName = name;
        colorType = "tailwind";
        if (hex !== value) {
          meta = "rounded";
        }
        hex = value;
      } else {
        colorName = `[${hex}]`;
        colorType = "arbitrary";
      }
    }
    return {
      colorType,
      colorName,
      hex,
      meta
    };
  }

  // FigmaToCode/packages/backend/src/altNodes/iconDetection.ts
  var ICON_PRIMITIVE_TYPES = /* @__PURE__ */ new Set([
    "ELLIPSE",
    "RECTANGLE",
    "STAR",
    "POLYGON",
    "LINE"
  ]);
  var ICON_COMPLEX_VECTOR_TYPES = /* @__PURE__ */ new Set([
    "VECTOR",
    "BOOLEAN_OPERATION"
  ]);
  var ICON_TYPES_IGNORE_SIZE = /* @__PURE__ */ new Set([
    "VECTOR",
    "BOOLEAN_OPERATION",
    "POLYGON",
    "STAR"
  ]);
  var ICON_CONTAINER_TYPES = /* @__PURE__ */ new Set([
    "FRAME",
    "GROUP",
    "COMPONENT",
    "INSTANCE"
  ]);
  var DISALLOWED_ICON_TYPES = /* @__PURE__ */ new Set([
    "SLICE",
    "CONNECTOR",
    "STICKY",
    "SHAPE_WITH_TEXT",
    "CODE_BLOCK",
    "WIDGET",
    "TEXT",
    "COMPONENT_SET"
    // Component sets are containers for components, not icons themselves
  ]);
  var DISALLOWED_CHILD_TYPES = /* @__PURE__ */ new Set([
    "FRAME",
    // No nested frames
    "COMPONENT",
    // No nested components
    "INSTANCE",
    // No nested instances
    "TEXT",
    // No text
    "SLICE",
    "CONNECTOR",
    "STICKY",
    "SHAPE_WITH_TEXT",
    "CODE_BLOCK",
    "WIDGET",
    "COMPONENT_SET"
  ]);
  function isTypicalIconSize(node, maxSize = 64) {
    if (!("width" in node && "height" in node && node.width > 0 && node.height > 0)) {
      return false;
    }
    return node.width <= maxSize && node.height <= maxSize;
  }
  function hasSvgExportSettings(node) {
    const settingsToCheck = node.exportSettings || [];
    return settingsToCheck.some((setting) => setting.format === "SVG");
  }
  function checkChildrenRecursively(children) {
    let hasDisallowedChild = false;
    let hasValidContent = false;
    for (const child of children) {
      if (child.visible === false) {
        continue;
      }
      if (DISALLOWED_CHILD_TYPES.has(child.type)) {
        hasDisallowedChild = true;
        break;
      }
      if (ICON_COMPLEX_VECTOR_TYPES.has(child.type) || ICON_PRIMITIVE_TYPES.has(child.type)) {
        hasValidContent = true;
      } else if (child.type === "GROUP" && "children" in child) {
        const groupResult = checkChildrenRecursively(child.children);
        if (groupResult.hasDisallowedChild) {
          hasDisallowedChild = true;
          break;
        }
        if (groupResult.hasValidContent) {
          hasValidContent = true;
        }
      }
    }
    return { hasDisallowedChild, hasValidContent };
  }
  function isLikelyIcon(node, logDetails = false) {
    const info = [`Node: ${node.name} (${node.type}, ID: ${node.id})`];
    let result = false;
    let reason = "";
    if (DISALLOWED_ICON_TYPES.has(node.type)) {
      reason = `Disallowed Type: ${node.type}`;
      result = false;
    } else if (hasSvgExportSettings(node)) {
      reason = "Has SVG export settings";
      result = true;
    } else if (!("width" in node && "height" in node && node.width > 0 && node.height > 0)) {
      if (ICON_TYPES_IGNORE_SIZE.has(node.type)) {
        reason = `Direct ${node.type} type (no dimensions check needed)`;
        result = true;
      } else {
        reason = "No dimensions";
        result = false;
      }
    } else {
      if (ICON_TYPES_IGNORE_SIZE.has(node.type)) {
        reason = `Direct ${node.type} type (size ignored)`;
        result = true;
      } else if (ICON_PRIMITIVE_TYPES.has(node.type)) {
        if (isTypicalIconSize(node)) {
          reason = `Direct ${node.type} with typical size`;
          result = true;
        } else {
          reason = `Direct ${node.type} but too large (${Math.round(node.width)}x${Math.round(node.height)})`;
          result = false;
        }
      } else if (ICON_CONTAINER_TYPES.has(node.type) && "children" in node) {
        if (!isTypicalIconSize(node)) {
          reason = `Container but too large (${Math.round(node.width)}x${Math.round(node.height)})`;
          result = false;
        } else {
          const visibleChildren = node.children.filter(
            (child) => child.visible !== false
          );
          if (visibleChildren.length === 0) {
            const hasVisibleFill = "fills" in node && Array.isArray(node.fills) && node.fills.some(
              (f) => {
                var _a;
                return typeof f === "object" && f !== null && f.visible !== false && ("opacity" in f ? (_a = f.opacity) != null ? _a : 1 : 1) > 0;
              }
            );
            const hasVisibleStroke = "strokes" in node && Array.isArray(node.strokes) && node.strokes.some((s) => s.visible !== false);
            if (hasVisibleFill || hasVisibleStroke) {
              reason = "Empty container with visible fill/stroke and typical size";
              result = true;
            } else {
              reason = "Empty container with no visible style";
              result = false;
            }
          } else {
            const checkResult = checkChildrenRecursively(visibleChildren);
            if (checkResult.hasDisallowedChild) {
              reason = "Container has disallowed child type (Text, Frame, Component, Instance, etc.)";
              result = false;
            } else if (!checkResult.hasValidContent) {
              reason = "Container has no vector or primitive content";
              result = false;
            } else {
              reason = "Container with valid children and typical size";
              result = true;
            }
          }
        }
      } else {
        reason = "Not a recognized icon structure (Vector, Primitive, or valid Container)";
        result = false;
      }
    }
    info.push(`Result: ${result ? "YES" : "NO"} (${reason})`);
    if (logDetails) console.log(info.join(" | "));
    return result;
  }

  // FigmaToCode/packages/backend/src/altNodes/jsonNodeConversion.ts
  var getNodeByIdAsyncTime = 0;
  var getNodeByIdAsyncCalls = 0;
  var getStyledTextSegmentsTime = 0;
  var getStyledTextSegmentsCalls = 0;
  var processColorVariablesTime = 0;
  var processColorVariablesCalls = 0;
  var resetPerformanceCounters = () => {
    getNodeByIdAsyncTime = 0;
    getNodeByIdAsyncCalls = 0;
    getStyledTextSegmentsTime = 0;
    getStyledTextSegmentsCalls = 0;
    processColorVariablesTime = 0;
    processColorVariablesCalls = 0;
  };
  var nodeNameCounters = /* @__PURE__ */ new Map();
  var variableCache = /* @__PURE__ */ new Map();
  var memoizedVariableToColorName = async (variableId) => {
    if (!variableCache.has(variableId)) {
      const colorName = (await variableToColorName(variableId)).replaceAll(
        ",",
        ""
      );
      variableCache.set(variableId, colorName);
      return colorName;
    }
    return variableCache.get(variableId);
  };
  var collectNodeColorVariables = async (node) => {
    const colorMappings = /* @__PURE__ */ new Map();
    const addMappingFromPaint = (paint) => {
      var _a;
      if (paint.type === "SOLID" && paint.variableColorName && paint.color && ((_a = paint.boundVariables) == null ? void 0 : _a.color)) {
        const variableName = paint.boundVariables.color.name || paint.variableColorName;
        if (variableName) {
          const sanitizedVarName = variableName.replace(/[^a-zA-Z0-9_-]/g, "-");
          const colorInfo = {
            variableId: paint.boundVariables.color.id,
            variableName: sanitizedVarName
          };
          const r = Math.round(paint.color.r * 255);
          const g = Math.round(paint.color.g * 255);
          const b = Math.round(paint.color.b * 255);
          const hexColor = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toLowerCase();
          colorMappings.set(hexColor, colorInfo);
          if (r === 255 && g === 255 && b === 255) {
            colorMappings.set("white", colorInfo);
            colorMappings.set("rgb(255,255,255)", colorInfo);
          } else if (r === 0 && g === 0 && b === 0) {
            colorMappings.set("black", colorInfo);
            colorMappings.set("rgb(0,0,0)", colorInfo);
          }
        }
      }
    };
    if (node.fills && Array.isArray(node.fills)) {
      node.fills.forEach(addMappingFromPaint);
    }
    if (node.strokes && Array.isArray(node.strokes)) {
      node.strokes.forEach(addMappingFromPaint);
    }
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        const childMappings = await collectNodeColorVariables(child);
        childMappings.forEach((value, key) => {
          colorMappings.set(key, value);
        });
      }
    }
    return colorMappings;
  };
  var processColorVariables = async (paint) => {
    var _a;
    const start = Date.now();
    processColorVariablesCalls++;
    if (paint.type === "GRADIENT_ANGULAR" || paint.type === "GRADIENT_DIAMOND" || paint.type === "GRADIENT_LINEAR" || paint.type === "GRADIENT_RADIAL") {
      const stopsWithVariables = paint.gradientStops.filter(
        (stop) => {
          var _a2;
          return (_a2 = stop.boundVariables) == null ? void 0 : _a2.color;
        }
      );
      if (stopsWithVariables.length > 0) {
        await Promise.all(
          stopsWithVariables.map(async (stop) => {
            stop.variableColorName = await memoizedVariableToColorName(
              stop.boundVariables.color.id
            );
          })
        );
      }
    } else if (paint.type === "SOLID" && ((_a = paint.boundVariables) == null ? void 0 : _a.color)) {
      paint.variableColorName = await memoizedVariableToColorName(
        paint.boundVariables.color.id
      );
    }
    processColorVariablesTime += Date.now() - start;
  };
  var processEffectVariables = async (paint) => {
    var _a;
    const start = Date.now();
    processColorVariablesCalls++;
    if ((_a = paint.boundVariables) == null ? void 0 : _a.color) {
      paint.variableColorName = await memoizedVariableToColorName(
        paint.boundVariables.color.id
      );
    }
    processColorVariablesTime += Date.now() - start;
  };
  var getColorVariables = async (node, settings) => {
    if (settings.useColorVariables) {
      if (node.fills && Array.isArray(node.fills)) {
        await Promise.all(
          node.fills.map((fill) => processColorVariables(fill))
        );
      }
      if (node.strokes && Array.isArray(node.strokes)) {
        await Promise.all(
          node.strokes.map((stroke) => processColorVariables(stroke))
        );
      }
      if ("effects" in node && node.effects && Array.isArray(node.effects)) {
        await Promise.all(
          node.effects.filter(
            (effect) => effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW"
          ).map(
            (effect) => processEffectVariables(effect)
          )
        );
      }
    }
  };
  function adjustChildrenOrder(node) {
    if (!node.itemReverseZIndex || !node.children || node.layoutMode === "NONE") {
      return;
    }
    const children = node.children;
    const absoluteChildren = [];
    const fixedChildren = [];
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      if (child.layoutPositioning === "ABSOLUTE") {
        absoluteChildren.push(child);
      } else {
        fixedChildren.unshift(child);
      }
    }
    node.children = [...absoluteChildren, ...fixedChildren];
  }
  var processNodePair = async (jsonNode, figmaNode, settings, parentNode, parentCumulativeRotation = 0) => {
    var _a, _b;
    if (!jsonNode.id) return null;
    if (jsonNode.visible === false) return null;
    const nodeType = jsonNode.type;
    if (parentNode) {
      jsonNode.cumulativeRotation = parentCumulativeRotation;
    }
    if ((nodeType === "FRAME" || nodeType === "INSTANCE" || nodeType === "COMPONENT" || nodeType === "COMPONENT_SET") && (!jsonNode.children || jsonNode.children.length === 0)) {
      jsonNode.type = "RECTANGLE";
      return processNodePair(
        jsonNode,
        figmaNode,
        settings,
        parentNode,
        parentCumulativeRotation
      );
    }
    if ("rotation" in jsonNode && jsonNode.rotation) {
      jsonNode.rotation = -jsonNode.rotation * (180 / Math.PI);
    }
    if (nodeType === "GROUP" && jsonNode.children) {
      const processedChildren = [];
      if (Array.isArray(jsonNode.children) && figmaNode && "children" in figmaNode) {
        const visibleJsonChildren = jsonNode.children.filter(
          (child) => child.visible !== false
        );
        const figmaChildrenById = /* @__PURE__ */ new Map();
        figmaNode.children.forEach((child) => {
          figmaChildrenById.set(child.id, child);
        });
        for (const child of visibleJsonChildren) {
          const figmaChild = figmaChildrenById.get(child.id);
          if (!figmaChild) continue;
          const processedChild = await processNodePair(
            child,
            figmaChild,
            settings,
            parentNode,
            // The group's parent
            parentCumulativeRotation + (jsonNode.rotation || 0)
          );
          if (processedChild !== null) {
            if (Array.isArray(processedChild)) {
              processedChildren.push(...processedChild);
            } else {
              processedChildren.push(processedChild);
            }
          }
        }
      }
      return processedChildren;
    }
    if (nodeType === "SLICE") {
      return null;
    }
    if (parentNode) {
      jsonNode.parent = parentNode;
    }
    const cleanName = jsonNode.name.trim();
    const count = nodeNameCounters.get(cleanName) || 0;
    nodeNameCounters.set(cleanName, count + 1);
    jsonNode.uniqueName = count === 0 ? cleanName : `${cleanName}_${count.toString().padStart(2, "0")}`;
    if (figmaNode.type === "TEXT") {
      const getSegmentsStart = Date.now();
      getStyledTextSegmentsCalls++;
      let styledTextSegments = figmaNode.getStyledTextSegments([
        "fontName",
        "fills",
        "fontSize",
        "fontWeight",
        "hyperlink",
        "indentation",
        "letterSpacing",
        "lineHeight",
        "listOptions",
        "textCase",
        "textDecoration",
        "textStyleId",
        "fillStyleId",
        "openTypeFeatures"
      ]);
      getStyledTextSegmentsTime += Date.now() - getSegmentsStart;
      if (styledTextSegments.length > 0) {
        const baseSegmentName = (jsonNode.uniqueName || jsonNode.name).replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase();
        styledTextSegments = await Promise.all(
          styledTextSegments.map(async (segment, index) => {
            const mutableSegment = Object.assign({}, segment);
            if (settings.useColorVariables && segment.fills) {
              mutableSegment.fills = await Promise.all(
                segment.fills.map(async (d) => {
                  if (d.blendMode !== "PASS_THROUGH" && d.blendMode !== "NORMAL") {
                    addWarning("BlendMode is not supported in Text colors");
                  }
                  const fill = __spreadValues({}, d);
                  await processColorVariables(fill);
                  return fill;
                })
              );
            }
            if (styledTextSegments.length === 1) {
              mutableSegment.uniqueId = `${baseSegmentName}_span`;
            } else {
              mutableSegment.uniqueId = `${baseSegmentName}_span_${(index + 1).toString().padStart(2, "0")}`;
            }
            return mutableSegment;
          })
        );
        jsonNode.styledTextSegments = styledTextSegments;
      }
      Object.assign(jsonNode, jsonNode.style);
      if (!jsonNode.textAutoResize) {
        jsonNode.textAutoResize = "NONE";
      }
    }
    if ("absoluteBoundingBox" in jsonNode && jsonNode.absoluteBoundingBox) {
      if (jsonNode.parent) {
        const rect = calculateRectangleFromBoundingBox(
          {
            width: jsonNode.absoluteBoundingBox.width,
            height: jsonNode.absoluteBoundingBox.height,
            x: jsonNode.absoluteBoundingBox.x - (((_a = jsonNode.parent) == null ? void 0 : _a.absoluteBoundingBox.x) || 0),
            y: jsonNode.absoluteBoundingBox.y - (((_b = jsonNode.parent) == null ? void 0 : _b.absoluteBoundingBox.y) || 0)
          },
          -((jsonNode.rotation || 0) + (jsonNode.cumulativeRotation || 0))
        );
        jsonNode.width = rect.width;
        jsonNode.height = rect.height;
        jsonNode.x = rect.left;
        jsonNode.y = rect.top;
      } else {
        jsonNode.width = jsonNode.absoluteBoundingBox.width;
        jsonNode.height = jsonNode.absoluteBoundingBox.height;
        jsonNode.x = 0;
        jsonNode.y = 0;
      }
    }
    if (settings.embedVectors && !(parentNode == null ? void 0 : parentNode.canBeFlattened)) {
      const isIcon = isLikelyIcon(jsonNode);
      jsonNode.canBeFlattened = isIcon;
      if (isIcon && settings.useColorVariables) {
        jsonNode._collectColorMappings = true;
      }
    } else {
      jsonNode.canBeFlattened = false;
    }
    if ("individualStrokeWeights" in jsonNode && jsonNode.individualStrokeWeights) {
      jsonNode.strokeTopWeight = jsonNode.individualStrokeWeights.top;
      jsonNode.strokeBottomWeight = jsonNode.individualStrokeWeights.bottom;
      jsonNode.strokeLeftWeight = jsonNode.individualStrokeWeights.left;
      jsonNode.strokeRightWeight = jsonNode.individualStrokeWeights.right;
    }
    await getColorVariables(jsonNode, settings);
    if ("layoutMode" in jsonNode && jsonNode.layoutMode) {
      if (jsonNode.paddingLeft === void 0) {
        jsonNode.paddingLeft = 0;
      }
      if (jsonNode.paddingRight === void 0) {
        jsonNode.paddingRight = 0;
      }
      if (jsonNode.paddingTop === void 0) {
        jsonNode.paddingTop = 0;
      }
      if (jsonNode.paddingBottom === void 0) {
        jsonNode.paddingBottom = 0;
      }
    }
    if (!jsonNode.layoutMode) jsonNode.layoutMode = "NONE";
    if (!jsonNode.layoutGrow) jsonNode.layoutGrow = 0;
    if (!jsonNode.layoutSizingHorizontal)
      jsonNode.layoutSizingHorizontal = "FIXED";
    if (!jsonNode.layoutSizingVertical) jsonNode.layoutSizingVertical = "FIXED";
    if (!jsonNode.primaryAxisAlignItems) {
      jsonNode.primaryAxisAlignItems = "MIN";
    }
    if (!jsonNode.counterAxisAlignItems) {
      jsonNode.counterAxisAlignItems = "MIN";
    }
    const hasChildren = "children" in jsonNode && jsonNode.children && Array.isArray(jsonNode.children) && jsonNode.children.length > 0;
    if (jsonNode.layoutSizingHorizontal === "HUG" && !hasChildren) {
      jsonNode.layoutSizingHorizontal = "FIXED";
    }
    if (jsonNode.layoutSizingVertical === "HUG" && !hasChildren) {
      jsonNode.layoutSizingVertical = "FIXED";
    }
    if ("children" in jsonNode && jsonNode.children && Array.isArray(jsonNode.children) && "children" in figmaNode) {
      const visibleJsonChildren = jsonNode.children.filter(
        (child) => child.visible !== false
      );
      const figmaChildrenById = /* @__PURE__ */ new Map();
      figmaNode.children.forEach((child) => {
        figmaChildrenById.set(child.id, child);
      });
      const cumulative = parentCumulativeRotation + (jsonNode.type === "GROUP" ? jsonNode.rotation || 0 : 0);
      const processedChildren = [];
      for (const child of visibleJsonChildren) {
        const figmaChild = figmaChildrenById.get(child.id);
        if (!figmaChild) continue;
        const processedChild = await processNodePair(
          child,
          figmaChild,
          settings,
          jsonNode,
          cumulative
        );
        if (processedChild !== null) {
          if (Array.isArray(processedChild)) {
            processedChildren.push(...processedChild);
          } else {
            processedChildren.push(processedChild);
          }
        }
      }
      jsonNode.children = processedChildren;
      if (jsonNode.layoutMode === "NONE" || jsonNode.children.some(
        (d) => "layoutPositioning" in d && d.layoutPositioning === "ABSOLUTE"
      )) {
        jsonNode.isRelative = true;
      }
      adjustChildrenOrder(jsonNode);
    }
    if (jsonNode._collectColorMappings) {
      jsonNode.colorVariableMappings = await collectNodeColorVariables(jsonNode);
      delete jsonNode._collectColorMappings;
    }
    return jsonNode;
  };
  var nodesToJSON = async (nodes, settings) => {
    nodeNameCounters.clear();
    const exportJsonStart = Date.now();
    const nodeResults = await Promise.all(
      nodes.map(async (node) => {
        const nodeDoc = (await node.exportAsync({
          format: "JSON_REST_V1"
        })).document;
        let nodeCumulativeRotation = 0;
        if (node.type === "GROUP") {
          nodeDoc.type = "FRAME";
          if ("rotation" in nodeDoc && nodeDoc.rotation) {
            nodeCumulativeRotation = -nodeDoc.rotation * (180 / Math.PI);
            nodeDoc.rotation = 0;
          }
        }
        return {
          nodeDoc,
          nodeCumulativeRotation
        };
      })
    );
    if (nodes.length > 0) {
      console.log("[debug] initial node summary", {
        id: nodes[0].id,
        type: nodes[0].type,
        name: nodes[0].name
      });
    }
    console.log(
      `[benchmark][inside nodesToJSON] JSON_REST_V1 export: ${Date.now() - exportJsonStart}ms`
    );
    const processNodesStart = Date.now();
    const result = [];
    for (let i = 0; i < nodes.length; i++) {
      const processedNode = await processNodePair(
        nodeResults[i].nodeDoc,
        nodes[i],
        settings,
        void 0,
        nodeResults[i].nodeCumulativeRotation
      );
      if (processedNode !== null) {
        if (Array.isArray(processedNode)) {
          result.push(...processedNode);
        } else {
          result.push(processedNode);
        }
      }
    }
    console.log(
      `[benchmark][inside nodesToJSON] Process node pairs: ${Date.now() - processNodesStart}ms`
    );
    return result;
  };

  // FigmaToCode/packages/backend/src/altNodes/oldAltConversion.ts
  var isTypeOrGroupOfTypes2 = curry(
    (matchTypes, node) => {
      if (node.visible === false || matchTypes.includes(node.type)) return true;
      if ("children" in node) {
        for (let i = 0; i < node.children.length; i++) {
          const childNode = node.children[i];
          const result = isTypeOrGroupOfTypes2(matchTypes, childNode);
          if (result) continue;
          return false;
        }
        return true;
      }
      return false;
    }
  );
  var globalTextStyleSegments = {};
  var canBeFlattened = isTypeOrGroupOfTypes2([
    "VECTOR",
    "STAR",
    "POLYGON",
    "BOOLEAN_OPERATION"
  ]);
  var convertNodeToAltNode = (parent) => (node) => {
    if (node.type === "SLOT") {
      const slotNode = node;
      const group = cloneNode(slotNode, parent);
      const groupChildren = oldConvertNodesToAltNodes(slotNode.children, group);
      return assignChildren(groupChildren, group);
    }
    const type = node.type;
    switch (type) {
      // Standard nodes
      case "RECTANGLE":
      case "ELLIPSE":
      case "LINE":
      case "STAR":
      case "POLYGON":
      case "VECTOR":
      case "BOOLEAN_OPERATION":
        return cloneNode(node, parent);
      // Group nodes
      case "FRAME":
      case "INSTANCE":
      case "COMPONENT":
      case "COMPONENT_SET":
        if (node.children.length === 0)
          return cloneAsRectangleNode(node, parent);
      // goto SECTION
      case "GROUP":
        if (type === "GROUP" && node.children.length === 1 && node.visible)
          return convertNodeToAltNode(parent)(node.children[0]);
      // goto SECTION
      case "SECTION":
        const group = cloneNode(node, parent);
        const groupChildren = oldConvertNodesToAltNodes(node.children, group);
        return assignChildren(groupChildren, group);
      // Text Nodes
      case "TEXT":
        globalTextStyleSegments[node.id] = extractStyledTextSegments(node);
        return cloneNode(node, parent);
      // Unsupported Nodes
      case "SLICE":
        throw new Error(
          `Sorry, Slices are not supported. Type:${node.type} id:${node.id}`
        );
      default:
        throw new Error(
          `Sorry, an unsupported node type was selected. Type:${node.type} id:${node.id}`
        );
    }
  };
  var oldConvertNodesToAltNodes = (sceneNode, parent) => sceneNode.map(convertNodeToAltNode(parent)).filter(isNotEmpty2);
  var cloneNode = (node, parent) => {
    const cloned = {};
    for (const prop in node) {
      if (prop !== "parent" && prop !== "children" && prop !== "horizontalPadding" && prop !== "verticalPadding" && prop !== "mainComponent" && prop !== "masterComponent" && prop !== "variantProperties" && prop !== "get_annotations" && prop !== "componentPropertyDefinitions" && prop !== "exposedInstances" && prop !== "instances" && prop !== "componentProperties" && prop !== "componenPropertyReferences" && prop !== "constrainProportions") {
        cloned[prop] = node[prop];
      }
    }
    assignParent(parent, cloned);
    const altNode = __spreadProps(__spreadValues({}, cloned), {
      parent: cloned.parent,
      originalNode: node,
      canBeFlattened: canBeFlattened(node)
    });
    if (globalTextStyleSegments[node.id]) {
      altNode.styledTextSegments = globalTextStyleSegments[node.id];
    }
    return altNode;
  };
  var cloneAsRectangleNode = (node, parent) => {
    const clonedNode = cloneNode(node, parent);
    assignRectangleType(clonedNode);
    return clonedNode;
  };
  var extractStyledTextSegments = (node) => node.getStyledTextSegments([
    "fontName",
    "fills",
    "fontSize",
    "fontWeight",
    "hyperlink",
    "indentation",
    "letterSpacing",
    "lineHeight",
    "listOptions",
    "textCase",
    "textDecoration",
    "textStyleId",
    "fillStyleId",
    "openTypeFeatures"
  ]);

  // FigmaToCode/packages/backend/src/compose/builderImpl/composeBlend.ts
  var composeOpacity = (node, child) => {
    if (node.opacity !== void 0 && node.opacity !== 1 && child !== "") {
      const opacity2 = numberToFixedString(node.opacity);
      return `Box(
    modifier = Modifier.alpha(${opacity2}f)
) {
    ${child}
}`;
    }
    return child;
  };
  var composeVisibility = (node, child) => {
    if (node.visible !== void 0 && !node.visible && child !== "") {
      return `Box(
    modifier = Modifier.alpha(0f)
) {
    ${child}
}`;
    }
    return child;
  };
  var composeRotation = (node, child) => {
    if (node.rotation !== void 0 && child !== "" && Math.round(node.rotation) !== 0) {
      const totalRotation = (node.rotation || 0) + (node.cumulativeRotation || 0);
      if (Math.round(totalRotation) === 0) {
        return child;
      }
      const rotationDegrees = numberToFixedString(totalRotation);
      return `Box(
    modifier = Modifier.rotate(${rotationDegrees}f)
) {
    ${child}
}`;
    }
    return child;
  };

  // FigmaToCode/packages/backend/src/compose/builderImpl/composeSize.ts
  var composeSize = (node) => {
    const modifiers = [];
    if ("width" in node && "height" in node) {
      const width = numberToFixedString(node.width);
      const height = numberToFixedString(node.height);
      if ("layoutSizingHorizontal" in node && node.layoutSizingHorizontal === "FILL") {
        modifiers.push("fillMaxWidth()");
      } else if (width > 0) {
        modifiers.push(`width(${width}.dp)`);
      }
      if ("layoutSizingVertical" in node && node.layoutSizingVertical === "FILL") {
        modifiers.push("fillMaxHeight()");
      } else if (height > 0) {
        modifiers.push(`height(${height}.dp)`);
      }
      if ("constraints" in node) {
        const constraints = node.constraints;
        if (constraints.horizontal === "STRETCH") {
          modifiers.push("fillMaxWidth()");
        } else if (constraints.horizontal === "SCALE") {
          modifiers.push("wrapContentWidth()");
        }
        if (constraints.vertical === "STRETCH") {
          modifiers.push("fillMaxHeight()");
        } else if (constraints.vertical === "SCALE") {
          modifiers.push("wrapContentHeight()");
        }
      }
    }
    return modifiers.length > 0 ? modifiers.join(".") : null;
  };

  // FigmaToCode/packages/backend/src/compose/builderImpl/composeBorder.ts
  var rgbaToHex = (fill) => {
    if (fill.type === "SOLID") {
      return rgbTo6hex(fill.color);
    }
    return "000000";
  };
  var getStrokeAlignment = (node) => {
    if ("strokeAlign" in node) {
      switch (node.strokeAlign) {
        case "INSIDE":
          return "inside";
        case "CENTER":
          return "center";
        case "OUTSIDE":
          return "outside";
        default:
          return "inside";
      }
    }
    return "inside";
  };
  var composeBorder = (node, shape) => {
    if (!("strokes" in node)) {
      return "";
    }
    const stroke = commonStroke(node);
    if (!stroke) {
      return "";
    }
    const strokeFill = retrieveTopFill(node.strokes);
    if (!strokeFill) {
      return "";
    }
    const strokeAlignment = getStrokeAlignment(node);
    if ("all" in stroke) {
      if (stroke.all === 0) {
        return "";
      }
      return generateBorderModifier(stroke.all, strokeFill, strokeAlignment, shape);
    } else {
      const maxWidth = Math.max(
        stroke.left,
        stroke.top,
        stroke.right,
        stroke.bottom
      );
      if (maxWidth === 0) {
        return "";
      }
      return generateBorderModifier(maxWidth, strokeFill, strokeAlignment, shape);
    }
  };
  var generateBorderModifier = (width, fill, alignment, shape) => {
    var _a;
    const widthDp = `${numberToFixedString(width)}.dp`;
    if (fill.type === "SOLID") {
      const color2 = rgbaToHex(fill);
      const opacity2 = (_a = fill.opacity) != null ? _a : 1;
      let colorValue;
      if (opacity2 < 1) {
        const alpha = Math.round(opacity2 * 255).toString(16).padStart(2, "0").toUpperCase();
        colorValue = `Color(0x${alpha}${color2.toUpperCase()})`;
      } else {
        colorValue = `Color(0xFF${color2.toUpperCase()})`;
      }
      const shapeParam = shape ? `, shape = ${shape}` : "";
      if (alignment === "outside") {
        return `border(width = ${widthDp}, color = ${colorValue}${shapeParam}) // Note: Compose borders are always inside`;
      } else {
        return `border(width = ${widthDp}, color = ${colorValue}${shapeParam})`;
      }
    } else if (fill.type === "GRADIENT_LINEAR") {
      const stops = fill.gradientStops.map((stop) => {
        var _a2;
        const stopColor = rgbTo6hex(stop.color);
        const stopOpacity = (_a2 = stop.color.a) != null ? _a2 : 1;
        let colorValue;
        if (stopOpacity < 1) {
          const alpha = Math.round(stopOpacity * 255).toString(16).padStart(2, "0").toUpperCase();
          colorValue = `Color(0x${alpha}${stopColor.toUpperCase()})`;
        } else {
          colorValue = `Color(0xFF${stopColor.toUpperCase()})`;
        }
        return `${numberToFixedString(stop.position)}f to ${colorValue}`;
      }).join(", ");
      const brush = `Brush.linearGradient(
        listOf(${stops})
    )`;
      const shapeParam = shape ? `, shape = ${shape}` : "";
      if (alignment === "outside") {
        return `border(width = ${widthDp}, brush = ${brush}${shapeParam}) // Note: Compose borders are always inside`;
      } else {
        return `border(width = ${widthDp}, brush = ${brush}${shapeParam})`;
      }
    } else if (fill.type === "GRADIENT_RADIAL") {
      const stops = fill.gradientStops.map((stop) => {
        var _a2;
        const stopColor = rgbTo6hex(stop.color);
        const stopOpacity = (_a2 = stop.color.a) != null ? _a2 : 1;
        let colorValue;
        if (stopOpacity < 1) {
          const alpha = Math.round(stopOpacity * 255).toString(16).padStart(2, "0").toUpperCase();
          colorValue = `Color(0x${alpha}${stopColor.toUpperCase()})`;
        } else {
          colorValue = `Color(0xFF${stopColor.toUpperCase()})`;
        }
        return `${numberToFixedString(stop.position)}f to ${colorValue}`;
      }).join(", ");
      const brush = `Brush.radialGradient(
        listOf(${stops})
    )`;
      const shapeParam = shape ? `, shape = ${shape}` : "";
      if (alignment === "outside") {
        return `border(width = ${widthDp}, brush = ${brush}${shapeParam}) // Note: Compose borders are always inside`;
      } else {
        return `border(width = ${widthDp}, brush = ${brush}${shapeParam})`;
      }
    }
    return "";
  };

  // FigmaToCode/packages/backend/src/compose/builderImpl/composeColor.ts
  var composeColor = (fill) => {
    if (fill.type === "SOLID") {
      const color2 = rgbTo6hex(fill.color);
      if (fill.opacity !== void 0 && fill.opacity < 1) {
        const alpha = Math.round(fill.opacity * 255).toString(16).padStart(2, "0").toUpperCase();
        return `background(Color(0x${alpha}${color2.toUpperCase()}))`;
      }
      return `background(Color(0xFF${color2.toUpperCase()}))`;
    } else if (fill.type === "GRADIENT_LINEAR") {
      const stops = fill.gradientStops.map((stop) => {
        const color2 = rgbTo6hex(stop.color);
        return `${stop.position}f to Color(0xFF${color2.toUpperCase()})`;
      }).join(", ");
      return `background(Brush.linearGradient(
        listOf(${stops})
    ))`;
    } else if (fill.type === "GRADIENT_RADIAL") {
      const stops = fill.gradientStops.map((stop) => {
        const color2 = rgbTo6hex(stop.color);
        return `${stop.position}f to Color(0xFF${color2.toUpperCase()})`;
      }).join(", ");
      return `background(Brush.radialGradient(
        listOf(${stops})
    ))`;
    }
    return null;
  };

  // FigmaToCode/packages/backend/src/compose/builderImpl/composeShadow.ts
  var composeShadow = (effects) => {
    if (!effects || effects.length === 0) {
      return "";
    }
    const shadowEffects = effects.filter(
      (effect) => (effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW") && effect.visible !== false
    );
    if (shadowEffects.length === 0) {
      return "";
    }
    const shadowModifiers = [];
    shadowEffects.forEach((effect) => {
      if (effect.type === "DROP_SHADOW") {
        const offsetX = numberToFixedString(effect.offset.x);
        const offsetY = numberToFixedString(effect.offset.y);
        const blurRadius = numberToFixedString(effect.radius);
        const spreadRadius = effect.spread ? numberToFixedString(effect.spread) : "0";
        const color2 = rgbTo8hex(effect.color, effect.color.a);
        if (effect.spread === 0 && effect.radius <= 8 && effect.offset.x === 0) {
          const elevation = Math.abs(effect.offset.y);
          if (elevation > 0 && elevation <= 24) {
            shadowModifiers.push(`shadow(${numberToFixedString(elevation)}.dp)`);
            return;
          }
        }
        if (effect.offset.x !== 0 || effect.offset.y !== 0 || effect.spread !== 0) {
          shadowModifiers.push(`drawBehind {
    drawRect(
        color = Color(0x${color2.toUpperCase()}),
        topLeft = Offset(${offsetX}.dp.toPx(), ${offsetY}.dp.toPx()),
        size = size.copy(
            width = size.width + ${spreadRadius}.dp.toPx(),
            height = size.height + ${spreadRadius}.dp.toPx()
        ),
        blendMode = BlendMode.Multiply
    )
}`);
        } else {
          shadowModifiers.push(`shadow(${blurRadius}.dp, shape = RectangleShape)`);
        }
      } else if (effect.type === "INNER_SHADOW") {
        const offsetX = numberToFixedString(effect.offset.x);
        const offsetY = numberToFixedString(effect.offset.y);
        const blurRadius = numberToFixedString(effect.radius);
        const color2 = rgbTo8hex(effect.color, effect.color.a);
        shadowModifiers.push(`drawWithContent {
    drawContent()
    drawRect(
        color = Color(0x${color2.toUpperCase()}),
        topLeft = Offset(${offsetX}.dp.toPx(), ${offsetY}.dp.toPx()),
        size = size,
        blendMode = BlendMode.Multiply
    )
}`);
      }
    });
    return shadowModifiers.join("\n.");
  };

  // FigmaToCode/packages/backend/src/compose/builderImpl/composePadding.ts
  var composePadding = (node) => {
    if (!("layoutMode" in node)) {
      return "";
    }
    const padding = commonPadding(node);
    if (!padding) {
      return "";
    }
    if ("all" in padding) {
      if (padding.all === 0) {
        return "";
      }
      return `padding(${numberToFixedString(padding.all)}.dp)`;
    }
    if ("horizontal" in padding) {
      const modifiers2 = [];
      if (padding.horizontal !== 0) {
        modifiers2.push(`horizontal = ${numberToFixedString(padding.horizontal)}.dp`);
      }
      if (padding.vertical !== 0) {
        modifiers2.push(`vertical = ${numberToFixedString(padding.vertical)}.dp`);
      }
      if (modifiers2.length === 0) {
        return "";
      }
      return `padding(${modifiers2.join(", ")})`;
    }
    const modifiers = [];
    if (padding.left !== 0) {
      modifiers.push(`start = ${numberToFixedString(padding.left)}.dp`);
    }
    if (padding.right !== 0) {
      modifiers.push(`end = ${numberToFixedString(padding.right)}.dp`);
    }
    if (padding.top !== 0) {
      modifiers.push(`top = ${numberToFixedString(padding.top)}.dp`);
    }
    if (padding.bottom !== 0) {
      modifiers.push(`bottom = ${numberToFixedString(padding.bottom)}.dp`);
    }
    if (modifiers.length === 0) {
      return "";
    }
    return `padding(${modifiers.join(", ")})`;
  };

  // FigmaToCode/packages/backend/src/compose/composeContainer.ts
  var composeContainer = (node, child) => {
    if ("width" in node && "height" in node) {
      if ((node.width <= 0 || node.height <= 0) && !child) {
        return "// Invalid node dimensions";
      }
    }
    const modifiers = [];
    let containerType = "Box";
    if ("fills" in node) {
      const topFill = retrieveTopFill(node.fills);
      if (topFill) {
        const backgroundModifier = composeColor(topFill);
        if (backgroundModifier) {
          modifiers.push(backgroundModifier);
        }
      }
    }
    const sizeModifier = composeSize(node);
    if (sizeModifier) {
      modifiers.push(sizeModifier);
    }
    let shape = null;
    if ("cornerRadius" in node || "topLeftRadius" in node) {
      const radius = getCommonRadius(node);
      if ("all" in radius && radius.all > 0) {
        shape = `RoundedCornerShape(${radius.all}.dp)`;
        modifiers.push(`clip(${shape})`);
      } else if ("topLeft" in radius) {
        shape = `RoundedCornerShape(
        topStart = ${radius.topLeft}.dp,
        topEnd = ${radius.topRight}.dp,
        bottomEnd = ${radius.bottomRight}.dp,
        bottomStart = ${radius.bottomLeft}.dp
    )`;
        modifiers.push(`clip(${shape})`);
      }
    }
    if ("strokes" in node && node.strokes.length > 0) {
      const borderModifier = composeBorder(node, shape);
      if (borderModifier) {
        modifiers.push(borderModifier);
      }
    }
    if ("effects" in node && node.effects.length > 0) {
      const shadowModifier = composeShadow(node.effects);
      if (shadowModifier) {
        modifiers.push(shadowModifier);
      }
    }
    if ("paddingLeft" in node) {
      const paddingModifier = composePadding(node);
      if (paddingModifier) {
        modifiers.push(paddingModifier);
      }
    }
    const modifierChain = modifiers.length > 0 ? `modifier = Modifier${modifiers.map((m) => `.${m}`).join("")}` : "";
    if (child) {
      if (modifierChain) {
        return `${containerType}(
    ${modifierChain}
) {
    ${child}
}`;
      } else {
        return `${containerType} {
    ${child}
}`;
      }
    } else {
      if (modifierChain) {
        return `Spacer(${modifierChain})`;
      } else {
        return `Spacer(modifier = Modifier.size(0.dp))`;
      }
    }
  };

  // FigmaToCode/packages/backend/src/compose/composeDefaultBuilder.ts
  var ComposeDefaultBuilder = class {
    constructor(optChild) {
      this.rotationApplied = false;
      this.child = optChild;
    }
    createContainer(node) {
      this.child = composeContainer(node, this.child);
      this.rotationApplied = true;
      return this;
    }
    blendAttr(node) {
      if ("rotation" in node && !this.rotationApplied) {
        this.child = composeRotation(node, this.child);
      }
      if ("visible" in node) {
        this.child = composeVisibility(node, this.child);
      } else if ("opacity" in node) {
        this.child = composeOpacity(node, this.child);
      }
      return this;
    }
    position(node) {
      if (commonIsAbsolutePosition(node)) {
        const { x, y } = getCommonPositionValue(node);
        this.child = `Box(
    modifier = Modifier.offset(x = ${x}.dp, y = ${y}.dp)
) {
    ${this.child}
}`;
      }
      return this;
    }
  };

  // FigmaToCode/packages/backend/src/compose/composeTextBuilder.ts
  var FONT_WEIGHT_MAP = {
    100: "Thin",
    200: "ExtraLight",
    300: "Light",
    400: "Normal",
    500: "Medium",
    600: "SemiBold",
    700: "Bold",
    800: "ExtraBold",
    900: "Black"
  };
  var TEXT_ALIGN_MAP = {
    "LEFT": "Left",
    "CENTER": "Center",
    "RIGHT": "Right",
    "JUSTIFIED": "Justify"
  };
  var TEXT_ESCAPE_MAP = {
    "\\": "\\\\",
    '"': '\\"',
    "\n": "\\n",
    "\r": "\\r",
    "	": "\\t"
  };
  var TEXT_ESCAPE_REGEX = /[\\"\n\r\t]/g;
  var ComposeTextBuilder = class extends ComposeDefaultBuilder {
    constructor() {
      super("");
    }
    createText(node) {
      this.child = this.getText(node);
      return this;
    }
    getText(node) {
      const text = node.characters || "";
      const textStyles = this.getTextStyles(node);
      const escapedText = text.replace(TEXT_ESCAPE_REGEX, (char) => TEXT_ESCAPE_MAP[char]);
      if (text.includes("\n")) {
        return `Text(
    text = """${text}""",
    ${textStyles}
)`;
      }
      return `Text(
    text = "${escapedText}",
    ${textStyles}
)`;
    }
    getTextStyles(node) {
      const styles = [];
      if (node.fontSize !== figma.mixed && typeof node.fontSize === "number" && node.fontSize > 0) {
        styles.push(`fontSize = ${numberToFixedString(node.fontSize)}.sp`);
      }
      if (node.fontWeight !== figma.mixed && typeof node.fontWeight === "number") {
        const weight = this.mapFontWeight(node.fontWeight);
        if (weight) {
          styles.push(`fontWeight = FontWeight.${weight}`);
        }
      }
      const fill = retrieveTopFill(node.fills);
      if ((fill == null ? void 0 : fill.type) === "SOLID") {
        const color2 = rgbTo6hex(fill.color);
        styles.push(`color = Color(0xFF${color2.toUpperCase()})`);
      }
      if (node.letterSpacing !== figma.mixed && node.letterSpacing !== 0) {
        const spacing = commonLetterSpacing(node.letterSpacing, node.fontSize);
        styles.push(`letterSpacing = ${spacing}.sp`);
      }
      if (node.lineHeight !== figma.mixed && typeof node.lineHeight === "object" && node.lineHeight.unit === "PIXELS") {
        styles.push(`lineHeight = ${node.lineHeight.value}.sp`);
      }
      if (node.textAlignHorizontal !== "LEFT") {
        const alignment = this.mapTextAlign(node.textAlignHorizontal);
        if (alignment) {
          styles.push(`textAlign = TextAlign.${alignment}`);
        }
      }
      if (node.textDecoration === "UNDERLINE") {
        styles.push(`textDecoration = TextDecoration.Underline`);
      } else if (node.textDecoration === "STRIKETHROUGH") {
        styles.push(`textDecoration = TextDecoration.LineThrough`);
      }
      return styles.join(",\n    ");
    }
    mapFontWeight(weight) {
      return FONT_WEIGHT_MAP[weight] || null;
    }
    mapTextAlign(align) {
      return TEXT_ALIGN_MAP[align] || null;
    }
    textAutoSize(node) {
      if (node.textAutoResize === "NONE") {
        this.child = this.child.replace(
          /Text\(/,
          `Text(
    maxLines = 1,
    overflow = TextOverflow.Ellipsis,`
        );
      }
      return this;
    }
  };

  // FigmaToCode/packages/backend/src/compose/builderImpl/composeAutoLayout.ts
  var getMainAxisAlignment = (node) => {
    switch (node.primaryAxisAlignItems) {
      case void 0:
      case "MIN":
        return "Arrangement.Start";
      case "CENTER":
        return "Arrangement.Center";
      case "MAX":
        return "Arrangement.End";
      case "SPACE_BETWEEN":
        return "Arrangement.SpaceBetween";
      default:
        return "Arrangement.Start";
    }
  };
  var getCrossAxisAlignment = (node) => {
    if (node.layoutMode === "HORIZONTAL") {
      switch (node.counterAxisAlignItems) {
        case void 0:
        case "MIN":
          return "Alignment.Top";
        case "CENTER":
          return "Alignment.CenterVertically";
        case "MAX":
          return "Alignment.Bottom";
        case "BASELINE":
          return "Alignment.CenterVertically";
        // Compose doesn't have baseline alignment for Row
        default:
          return "Alignment.Top";
      }
    } else {
      switch (node.counterAxisAlignItems) {
        case void 0:
        case "MIN":
          return "Alignment.Start";
        case "CENTER":
          return "Alignment.CenterHorizontally";
        case "MAX":
          return "Alignment.End";
        case "BASELINE":
          return "Alignment.CenterHorizontally";
        // Baseline not applicable for Column
        default:
          return "Alignment.Start";
      }
    }
  };

  // FigmaToCode/packages/backend/src/compose/composeMain.ts
  var localSettings;
  var previousExecutionCache2;
  var COMPOSE_IMPORTS = `import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.*
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.graphics.BlendMode
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*`;
  var getFullScreenTemplate = (name, injectCode) => `${COMPOSE_IMPORTS}

// Generated by: https://www.figma.com/community/plugin/842128343887142055/
@Composable
fun ${name}Screen() {
    Surface(
        modifier = Modifier.fillMaxSize(),
        color = Color(0xFF1A2034)
    ) {
        ${name}()
    }
}

@Composable
fun ${name}() {
${indentString(injectCode, 4)}
}

@Preview(showBackground = true)
@Composable
fun ${name}Preview() {
    ${name}()
}`;
  var getComposableTemplate = (name, injectCode) => `@Composable
fun ${name}() {
${indentString(injectCode, 4)}
}`;
  var composeMain = (sceneNode, settings) => {
    var _a, _b;
    localSettings = settings;
    previousExecutionCache2 = [];
    if (!sceneNode || sceneNode.length === 0) {
      return "// No nodes to convert";
    }
    let result = composeWidgetGenerator(sceneNode);
    if (!result || result.trim() === "") {
      result = "// No visible content generated";
    }
    switch (localSettings.composeGenerationMode) {
      case "snippet":
        return result;
      case "composable":
        if (!result.startsWith("Column") && !result.startsWith("//")) {
          result = generateComposeWidget("Column", { content: [result] });
        }
        return getComposableTemplate(
          stringToClassName(((_a = sceneNode[0]) == null ? void 0 : _a.name) || "Component"),
          result
        );
      case "screen":
        if (!result.startsWith("Column") && !result.startsWith("//")) {
          result = generateComposeWidget("Column", { content: [result] });
        }
        return getFullScreenTemplate(
          stringToClassName(((_b = sceneNode[0]) == null ? void 0 : _b.name) || "Component"),
          result
        );
      default:
        return result;
    }
  };
  var generateComposeWidget = (widget, props) => {
    const _a = props, { content } = _a, modifiers = __objRest(_a, ["content"]);
    let modifierChain = "";
    if (Object.keys(modifiers).length > 0) {
      modifierChain = `modifier = Modifier`;
      Object.entries(modifiers).forEach(([key, value]) => {
        if (value !== void 0 && value !== null) {
          modifierChain += `.${key}(${value})`;
        }
      });
    }
    if (content && content.length > 0) {
      const contentStr = content.join(",\n");
      if (modifierChain) {
        return `${widget}(
    ${modifierChain}
) {
${indentString(contentStr, 4)}
}`;
      } else {
        return `${widget}() {
${indentString(contentStr, 4)}
}`;
      }
    } else {
      return modifierChain ? `${widget}(${modifierChain})` : `${widget}()`;
    }
  };
  var composeWidgetGenerator = (sceneNode) => {
    let comp = [];
    const visibleSceneNode = getVisibleNodes(sceneNode);
    visibleSceneNode.forEach((node) => {
      switch (node.type) {
        case "RECTANGLE":
        case "ELLIPSE":
        case "STAR":
        case "POLYGON":
        case "LINE":
          comp.push(composeContainer2(node, ""));
          break;
        case "GROUP":
          comp.push(composeGroup(node));
          break;
        case "FRAME":
        case "INSTANCE":
        case "COMPONENT":
        case "COMPONENT_SET":
        case "SLOT":
          comp.push(composeFrame(node));
          break;
        case "SECTION":
          comp.push(composeContainer2(node, ""));
          break;
        case "TEXT":
          comp.push(composeText(node));
          break;
        case "VECTOR":
          addWarning("VectorNodes are not fully supported in Compose");
          break;
        case "SLICE":
        default:
      }
    });
    return comp.join(",\n");
  };
  var composeGroup = (node) => {
    const widget = composeWidgetGenerator(node.children);
    return composeContainer2(
      node,
      generateComposeWidget("Box", {
        content: widget ? [widget] : []
      })
    );
  };
  var composeContainer2 = (node, child) => {
    var _a;
    let propChild = "";
    if ("fills" in node && node.fills !== figma.mixed && ((_a = retrieveTopFill(node.fills)) == null ? void 0 : _a.type) === "IMAGE") {
      addWarning("Image fills are replaced with placeholders in Compose");
    }
    if (child.length > 0) {
      propChild = child;
    }
    const builder = new ComposeDefaultBuilder(propChild).createContainer(node).blendAttr(node).position(node);
    return builder.child;
  };
  var composeText = (node) => {
    const builder = new ComposeTextBuilder().createText(node);
    previousExecutionCache2.push(builder.child);
    return builder.blendAttr(node).textAutoSize(node).position(node).child;
  };
  var composeFrame = (node) => {
    const hasAbsoluteChildren = node.children.some(
      (child) => child.layoutPositioning === "ABSOLUTE"
    );
    if (hasAbsoluteChildren && node.layoutMode !== "NONE") {
      addWarning(
        `Frame "${node.name}" has absolute positioned children. Using Box instead of ${node.layoutMode === "HORIZONTAL" ? "Row" : "Column"}.`
      );
    }
    const children = composeWidgetGenerator(node.children);
    if (hasAbsoluteChildren) {
      return composeContainer2(
        node,
        generateComposeWidget("Box", {
          content: children !== "" ? [children] : []
        })
      );
    }
    if (node.layoutMode !== "NONE") {
      const rowColumnWrap = makeRowColumnWrap(node, children);
      return composeContainer2(node, rowColumnWrap);
    } else {
      if (node.inferredAutoLayout) {
        const rowColumnWrap = makeRowColumnWrap(
          node.inferredAutoLayout,
          children
        );
        return composeContainer2(node, rowColumnWrap);
      }
      if (node.isAsset) {
        return composeContainer2(
          node,
          "Icon(Icons.Default.Home, contentDescription = null)"
        );
      }
      return composeContainer2(
        node,
        generateComposeWidget("Box", {
          content: children !== "" ? [children] : []
        })
      );
    }
  };
  var makeRowColumnWrap = (autoLayout, children) => {
    const isRow = autoLayout.layoutMode === "HORIZONTAL";
    const composable = isRow ? "Row" : "Column";
    const widgetProps = {};
    if (isRow) {
      widgetProps.horizontalArrangement = getMainAxisAlignment(autoLayout);
      widgetProps.verticalAlignment = getCrossAxisAlignment(autoLayout);
    } else {
      widgetProps.verticalArrangement = getMainAxisAlignment(autoLayout);
      widgetProps.horizontalAlignment = getCrossAxisAlignment(autoLayout);
    }
    if (autoLayout.itemSpacing > 0) {
      const arrangement = isRow ? "horizontalArrangement" : "verticalArrangement";
      const currentArrangement = widgetProps[arrangement];
      if (currentArrangement && currentArrangement.includes("Arrangement.")) {
        widgetProps[arrangement] = `Arrangement.spacedBy(${autoLayout.itemSpacing}.dp, ${currentArrangement})`;
      } else {
        widgetProps[arrangement] = `Arrangement.spacedBy(${autoLayout.itemSpacing}.dp)`;
      }
    } else if (autoLayout.itemSpacing < 0) {
      addWarning("Compose doesn't support negative itemSpacing");
    }
    widgetProps.content = [children];
    return generateComposeWidget(composable, widgetProps);
  };

  // FigmaToCode/packages/backend/src/flutter/builderImpl/flutterBlend.ts
  var flutterOpacity = (node, child) => {
    if (node.opacity !== void 0 && node.opacity !== 1 && child !== "") {
      return generateWidgetCode("Opacity", {
        opacity: numberToFixedString(node.opacity),
        child
      });
    }
    return child;
  };
  var flutterVisibility = (node, child) => {
    if (node.visible !== void 0 && !node.visible && child !== "") {
      return generateWidgetCode("Visibility", {
        visible: `${node.visible}`,
        child
      });
    }
    return child;
  };
  var flutterRotation = (node, child) => {
    if (node.rotation !== void 0 && child !== "" && Math.round(node.rotation) !== 0) {
      const matrix = generateRotationMatrix(node);
      if (matrix) {
        return generateWidgetCode("Transform", {
          transform: matrix,
          child
        });
      }
    }
    return child;
  };
  var generateRotationMatrix = (node) => {
    const rotation = (node.rotation || 0) + (node.cumulativeRotation || 0);
    if (Math.round(rotation) === 0) {
      return "";
    }
    return `Matrix4.identity()..translate(0.0, 0.0)..rotateZ(${numberToFixedString(
      rotation * (-Math.PI / 180)
    )})`;
  };

  // FigmaToCode/packages/backend/src/flutter/builderImpl/flutterColor.ts
  var flutterColorFromFills = (node, propertyPath) => {
    let fills = node[propertyPath];
    return flutterColorFromDirectFills(fills);
  };
  var flutterColorFromDirectFills = (fills) => {
    var _a, _b;
    const fill = retrieveTopFill(fills);
    if (fill && fill.type === "SOLID") {
      return flutterColor(
        fill.color,
        (_a = fill.opacity) != null ? _a : 1,
        fill.variableColorName
      );
    } else if (fill && (fill.type === "GRADIENT_LINEAR" || fill.type === "GRADIENT_ANGULAR" || fill.type === "GRADIENT_RADIAL")) {
      if (fill.gradientStops.length > 0) {
        const stop = fill.gradientStops[0];
        return flutterColor(
          stop.color,
          (_b = fill.opacity) != null ? _b : 1,
          stop.variableColorName
        );
      }
    }
    return "";
  };
  var flutterBoxDecorationColor = (node, propertyPath) => {
    var _a;
    let fills;
    fills = node[propertyPath];
    const fill = retrieveTopFill(fills);
    if (fill && fill.type === "SOLID") {
      const opacity2 = (_a = fill.opacity) != null ? _a : 1;
      return {
        color: flutterColor(fill.color, opacity2, fill.variableColorName)
      };
    } else if ((fill == null ? void 0 : fill.type) === "GRADIENT_LINEAR" || (fill == null ? void 0 : fill.type) === "GRADIENT_RADIAL" || (fill == null ? void 0 : fill.type) === "GRADIENT_ANGULAR") {
      return { gradient: flutterGradient(fill) };
    } else if ((fill == null ? void 0 : fill.type) === "IMAGE") {
      return { image: flutterDecorationImage(node, fill) };
    }
    return {};
  };
  var flutterDecorationImage = (node, fill) => {
    addWarning("Image fills are replaced with placeholders");
    return generateWidgetCode("DecorationImage", {
      image: `NetworkImage("${getPlaceholderImage(node.width, node.height)}")`,
      fit: fitToBoxFit(fill)
    });
  };
  var fitToBoxFit = (fill) => {
    switch (fill.scaleMode) {
      case "FILL":
        return "BoxFit.cover";
      // FILL in Figma covers the entire area, similar to BoxFit.cover
      case "FIT":
        return "BoxFit.contain";
      // FIT in Figma fits the image while maintaining aspect ratio, like BoxFit.contain
      case "STRETCH":
        return "BoxFit.fill";
      // STRETCH in Figma stretches the image, like BoxFit.fill
      case "TILE":
        return "BoxFit.none";
      // TILE doesn't have a direct equivalent, but BoxFit.none is closest
      default:
        return "BoxFit.cover";
    }
  };
  var flutterGradient = (fill) => {
    switch (fill.type) {
      case "GRADIENT_LINEAR":
        return flutterLinearGradient(fill);
      case "GRADIENT_RADIAL":
        return flutterRadialGradient(fill);
      case "GRADIENT_ANGULAR":
        return flutterAngularGradient(fill);
      default:
        addWarning("Diamond dradients are not supported in Flutter");
        return "";
    }
  };
  var flutterLinearGradient = (fill) => {
    const [start, end] = fill.gradientHandlePositions;
    const colors = fill.gradientStops.map((d) => flutterColor(d.color, d.color.a, d.variableColorName)).join(", ");
    return generateWidgetCode("LinearGradient", {
      begin: `Alignment(${start.x.toFixed(2)}, ${start.y.toFixed(2)})`,
      end: `Alignment(${end.x.toFixed(2)}, ${end.y.toFixed(2)})`,
      colors: `[${colors}]`
    });
  };
  var flutterRadialGradient = (fill) => {
    const [center, h1, h2] = fill.gradientHandlePositions;
    const radius1 = Math.sqrt((h1.x - center.x) ** 2 + (h1.y - center.y) ** 2);
    const radius2 = Math.sqrt((h2.x - center.x) ** 2 + (h2.y - center.y) ** 2);
    const radius = Math.max(radius1, radius2);
    const colors = fill.gradientStops.map((d) => flutterColor(d.color, d.color.a, d.variableColorName)).join(", ");
    return generateWidgetCode("RadialGradient", {
      center: `Alignment(${center.x.toFixed(2)}, ${center.y.toFixed(2)})`,
      radius: radius.toFixed(2),
      colors: `[${colors}]`
    });
  };
  var figmaToFlutterAlignment = (x, y) => {
    const alignmentX = x * 2 - 1;
    const alignmentY = y * 2 - 1;
    return `Alignment(${numberToFixedString(alignmentX)}, ${numberToFixedString(alignmentY)})`;
  };
  var flutterAngularGradient = (fill) => {
    const [center, _, startDirection] = fill.gradientHandlePositions;
    const centerAlignment = figmaToFlutterAlignment(center.x, center.y);
    const dx = startDirection.x - center.x;
    const dy = startDirection.y - center.y;
    const startAngle = -(90 * Math.PI) / 180 + Math.atan2(dy, dx);
    const colors = fill.gradientStops.map((stop) => flutterColor(stop.color, stop.color.a)).join(", ");
    const stops = fill.gradientStops.map((stop) => numberToFixedString(stop.position)).join(", ");
    return generateWidgetCode("SweepGradient", {
      center: centerAlignment,
      startAngle: numberToFixedString(startAngle),
      endAngle: numberToFixedString(startAngle + 2 * Math.PI),
      colors: `[${colors}]`,
      stops: `[${stops}]`,
      transform: `GradientRotation(${numberToFixedString(startAngle)})`
    });
  };
  var opacityToAlpha = (opacity2) => {
    return numberToFixedString(opacity2);
  };
  var flutterColor = (color2, opacity2, variableColorName) => {
    const sum = color2.r + color2.g + color2.b;
    let colorCode = "";
    if (sum === 0) {
      colorCode = opacity2 === 1 ? "Colors.black" : `Colors.black.withValues(alpha: ${opacityToAlpha(opacity2)})`;
    } else if (sum === 3) {
      colorCode = opacity2 === 1 ? "Colors.white" : `Colors.white.withValues(alpha: ${opacityToAlpha(opacity2)})`;
    } else {
      colorCode = `const Color(0x${rgbTo8hex(color2, opacity2).toUpperCase()})`;
    }
    if (variableColorName) {
      return `${colorCode} /* ${variableColorName} */`;
    }
    return colorCode;
  };

  // FigmaToCode/packages/backend/src/flutter/builderImpl/flutterBorder.ts
  var flutterBorder = (node) => {
    if (!("strokes" in node)) {
      return "";
    }
    const stroke = commonStroke(node);
    if (!stroke) {
      return "";
    }
    const color2 = skipDefaultProperty(
      flutterColorFromFills(node, "strokes"),
      "Colors.black"
    );
    const strokeAlign = skipDefaultProperty(
      getStrokeAlign(node, 2),
      "BorderSide.strokeAlignInside"
    );
    if ("all" in stroke) {
      if (stroke.all === 0) {
        return "";
      }
      return generateWidgetCode("Border.all", {
        width: stroke.all,
        strokeAlign,
        color: color2
      });
    } else {
      return generateWidgetCode("Border.only", {
        left: generateBorderSideCode(stroke.left, strokeAlign, color2),
        top: generateBorderSideCode(stroke.top, strokeAlign, color2),
        right: generateBorderSideCode(stroke.right, strokeAlign, color2),
        bottom: generateBorderSideCode(stroke.bottom, strokeAlign, color2)
      });
    }
  };
  var generateBorderSideCode = (width, strokeAlign, color2) => {
    return generateWidgetCode("BorderSide", {
      width: skipDefaultProperty(width, 0),
      strokeAlign,
      color: color2
    });
  };

  // FigmaToCode/packages/backend/src/flutter/builderImpl/flutterSize.ts
  var flutterSize = (node) => {
    const size = nodeSize(node);
    let isExpanded = false;
    const nodeParent = node.parent;
    let propWidth = "";
    if (typeof size.width === "number") {
      propWidth = numberToFixedString(size.width);
    } else if (size.width === "fill") {
      if (nodeParent && "layoutMode" in nodeParent && nodeParent.layoutMode === "HORIZONTAL") {
        isExpanded = true;
      } else {
        propWidth = `double.infinity`;
      }
    }
    let propHeight = "";
    if (typeof size.height === "number") {
      propHeight = numberToFixedString(size.height);
    } else if (size.height === "fill") {
      if (nodeParent && "layoutMode" in nodeParent && nodeParent.layoutMode === "VERTICAL") {
        isExpanded = true;
      } else {
        propHeight = `double.infinity`;
      }
    }
    const constraints = {};
    if (node.minWidth !== void 0 && node.minWidth !== null) {
      constraints.minWidth = numberToFixedString(node.minWidth);
    }
    if (node.maxWidth !== void 0 && node.maxWidth !== null) {
      constraints.maxWidth = numberToFixedString(node.maxWidth);
    }
    if (node.minHeight !== void 0 && node.minHeight !== null) {
      constraints.minHeight = numberToFixedString(node.minHeight);
    }
    if (node.maxHeight !== void 0 && node.maxHeight !== null) {
      constraints.maxHeight = numberToFixedString(node.maxHeight);
    }
    return { width: propWidth, height: propHeight, isExpanded, constraints };
  };

  // FigmaToCode/packages/backend/src/flutter/builderImpl/flutterPadding.ts
  var flutterPadding = (node) => {
    if (!("layoutMode" in node)) {
      return "";
    }
    const padding = commonPadding(node);
    if (!padding) {
      return "";
    }
    if ("all" in padding) {
      return skipDefaultProperty(
        `const EdgeInsets.all(${numberToFixedString(padding.all)})`,
        "const EdgeInsets.all(0)"
      );
    }
    if ("horizontal" in padding) {
      return generateWidgetCode("const EdgeInsets.symmetric", {
        horizontal: skipDefaultProperty(
          numberToFixedString(padding.horizontal),
          "0"
        ),
        vertical: skipDefaultProperty(numberToFixedString(padding.vertical), "0")
      });
    }
    return generateWidgetCode("const EdgeInsets.only", {
      top: skipDefaultProperty(numberToFixedString(padding.top), "0"),
      left: skipDefaultProperty(numberToFixedString(padding.left), "0"),
      right: skipDefaultProperty(numberToFixedString(padding.right), "0"),
      bottom: skipDefaultProperty(numberToFixedString(padding.bottom), "0")
    });
  };

  // FigmaToCode/packages/backend/src/flutter/builderImpl/flutterShadow.ts
  var flutterShadow = (node) => {
    var _a;
    let propBoxShadow = "";
    if ("effects" in node && ((_a = node.effects) == null ? void 0 : _a.length) > 0) {
      const visibleEffects = node.effects.filter((d) => d.visible);
      if (visibleEffects.length > 0) {
        let boxShadow = "";
        visibleEffects.forEach((effect) => {
          if (effect.type === "DROP_SHADOW") {
            boxShadow += generateWidgetCode("BoxShadow", {
              color: `Color(0x${rgbTo8hex(
                effect.color,
                effect.color.a
              ).toUpperCase()})`,
              blurRadius: numberToFixedString(effect.radius),
              offset: `Offset(${numberToFixedString(effect.offset.x)}, ${numberToFixedString(
                effect.offset.y
              )})`,
              spreadRadius: effect.spread ? numberToFixedString(effect.spread) : "0"
            });
          }
        });
        if (boxShadow) {
          propBoxShadow = `[
${indentStringFlutter(boxShadow)}
]`;
        }
      }
    }
    return propBoxShadow;
  };

  // FigmaToCode/packages/backend/src/flutter/flutterContainer.ts
  var flutterContainer = (node, child) => {
    if (node.width < 0 || node.height < 0) {
      return child;
    }
    const propBoxDecoration = getDecoration(node);
    const { width, height, isExpanded, constraints } = flutterSize(node);
    const clipBehavior = "clipsContent" in node && node.clipsContent === true ? "Clip.antiAlias" : "";
    let propPadding = "";
    if ("paddingLeft" in node) {
      propPadding = flutterPadding(node);
    }
    let result;
    const hasConstraints = constraints && Object.keys(constraints).length > 0;
    const properties = {};
    if ("rotation" in node) {
      const matrix = generateRotationMatrix(node);
      if (matrix) {
        properties.transform = matrix;
      }
    }
    if (width || height || propBoxDecoration || clipBehavior) {
      properties.width = skipDefaultProperty(width, "0");
      properties.height = skipDefaultProperty(height, "0");
      properties.padding = propPadding;
      properties.clipBehavior = clipBehavior;
      const parsedDecoration = skipDefaultProperty(
        propBoxDecoration,
        "BoxDecoration()"
      );
      properties.decoration = clipBehavior ? propBoxDecoration : parsedDecoration;
      const isEmptyProps = hasEmptyProps(properties);
      if (isEmptyProps) {
        result = child;
      } else {
        properties.child = child;
        result = generateWidgetCode("Container", __spreadValues({}, properties));
      }
    } else if (propPadding) {
      result = generateWidgetCode("Padding", {
        padding: propPadding,
        child
      });
    } else {
      result = child;
    }
    if (hasConstraints) {
      result = generateWidgetCode("ConstrainedBox", {
        constraints: generateWidgetCode("BoxConstraints", constraints),
        child: result
      });
    }
    if (isExpanded) {
      result = generateWidgetCode("Expanded", {
        child: result
      });
    }
    return result;
  };
  var hasEmptyProps = (props) => {
    let isEmpty = true;
    for (const key in props) {
      const value = props[key];
      const defValue = value.length > 0 ? "0" : "";
      isEmpty = isEmpty && skipDefaultProperty(value, defValue).length == 0;
    }
    return isEmpty;
  };
  var getDecoration = (node) => {
    if (!("fills" in node)) {
      return "";
    }
    const propBoxShadow = flutterShadow(node);
    const decorationBackground = flutterBoxDecorationColor(node, "fills");
    let shapeDecorationBorder = "";
    if (node.type === "STAR") {
      shapeDecorationBorder = generateStarBorder(node);
    } else if (node.type === "POLYGON") {
      shapeDecorationBorder = generatePolygonBorder(node);
    } else if (node.type === "ELLIPSE") {
      shapeDecorationBorder = generateOvalBorder(node);
    } else if ("strokeWeight" in node && node.strokeWeight !== figma.mixed) {
      shapeDecorationBorder = skipDefaultProperty(
        generateRoundedRectangleBorder(node),
        "RoundedRectangleBorder()"
      );
    }
    if (shapeDecorationBorder) {
      return generateWidgetCode("ShapeDecoration", __spreadProps(__spreadValues({}, decorationBackground), {
        shape: shapeDecorationBorder,
        shadows: propBoxShadow
      }));
    }
    return generateWidgetCode("BoxDecoration", __spreadProps(__spreadValues({}, decorationBackground), {
      borderRadius: generateBorderRadius(node),
      border: flutterBorder(node),
      boxShadow: propBoxShadow
    }));
  };
  var generateRoundedRectangleBorder = (node) => {
    return generateWidgetCode("RoundedRectangleBorder", {
      side: generateBorderSideCode2(node),
      borderRadius: generateBorderRadius(node)
    });
  };
  var generateBorderSideCode2 = (node) => {
    const strokeWidth = getSingleStrokeWidth(node);
    return skipDefaultProperty(
      generateWidgetCode("BorderSide", {
        width: skipDefaultProperty(strokeWidth, 0),
        strokeAlign: skipDefaultProperty(
          getStrokeAlign(node, strokeWidth),
          "BorderSide.strokeAlignInside"
        ),
        color: skipDefaultProperty(
          flutterColorFromFills(node, "strokes"),
          "Colors.black"
        )
      }),
      "BorderSide()"
    );
  };
  var getSingleStrokeWidth = (node) => {
    if ("strokes" in node && (node.strokes.length === 0 || node.strokes.every((d) => d.visible === false))) {
      return 0;
    }
    const stroke = commonStroke(node);
    if (stroke === null) {
      return 0;
    }
    if ("all" in stroke) {
      return stroke.all;
    }
    return Math.max(stroke == null ? void 0 : stroke.bottom, stroke == null ? void 0 : stroke.top, stroke == null ? void 0 : stroke.left, stroke == null ? void 0 : stroke.right);
  };
  var generateStarBorder = (node) => {
    const points = node.pointCount;
    const innerRadiusRatio = node.innerRadius;
    const cornerRadius = node.cornerRadius;
    const pointRounding = cornerRadius === figma.mixed ? 0 : cornerRadius;
    const valleyRounding = 0;
    const rotation = 0;
    const squash = 0;
    return generateWidgetCode("StarBorder", {
      side: generateBorderSideCode2(node),
      points: numberToFixedString(points),
      innerRadiusRatio: numberToFixedString(innerRadiusRatio),
      pointRounding: numberToFixedString(pointRounding),
      valleyRounding: numberToFixedString(valleyRounding),
      rotation: numberToFixedString(rotation),
      squash: numberToFixedString(squash)
    });
  };
  var getStrokeAlign = (node, strokeWeight) => {
    if (strokeWeight === 0) {
      return "";
    }
    switch (node.strokeAlign) {
      case "CENTER":
        return "BorderSide.strokeAlignCenter";
      case "OUTSIDE":
        return "BorderSide.strokeAlignOutside";
      case "INSIDE":
        return "BorderSide.strokeAlignInside";
      default:
        return "";
    }
  };
  var generateOvalBorder = (node) => {
    return generateWidgetCode("OvalBorder", {
      side: generateBorderSideCode2(node)
    });
  };
  var generatePolygonBorder = (node) => {
    const points = node.pointCount;
    return generateWidgetCode("StarBorder.polygon", {
      side: generateBorderSideCode2(node),
      sides: numberToFixedString(points),
      borderRadius: generateBorderRadius(node)
    });
  };
  var generateBorderRadius = (node) => {
    const radius = getCommonRadius(node);
    if ("all" in radius) {
      if (radius.all === 0) {
        return "";
      }
      return `BorderRadius.circular(${numberToFixedString(radius.all)})`;
    }
    return generateWidgetCode("BorderRadius.only", {
      topLeft: skipDefaultProperty(
        `Radius.circular(${numberToFixedString(radius.topLeft)})`,
        "Radius.circular(0)"
      ),
      topRight: skipDefaultProperty(
        `Radius.circular(${numberToFixedString(radius.topRight)})`,
        "Radius.circular(0)"
      ),
      bottomLeft: skipDefaultProperty(
        `Radius.circular(${numberToFixedString(radius.bottomLeft)})`,
        "Radius.circular(0)"
      ),
      bottomRight: skipDefaultProperty(
        `Radius.circular(${numberToFixedString(radius.bottomRight)})`,
        "Radius.circular(0)"
      )
    });
  };

  // FigmaToCode/packages/backend/src/flutter/flutterDefaultBuilder.ts
  var FlutterDefaultBuilder = class {
    constructor(optChild) {
      this.rotationApplied = false;
      this.child = optChild;
    }
    createContainer(node) {
      this.child = flutterContainer(node, this.child);
      this.rotationApplied = true;
      return this;
    }
    blendAttr(node) {
      if ("rotation" in node && !this.rotationApplied) {
        this.child = flutterRotation(node, this.child);
      }
      if ("visible" in node) {
        this.child = flutterVisibility(node, this.child);
      } else if ("opacity" in node) {
        this.child = flutterOpacity(node, this.child);
      }
      return this;
    }
    position(node) {
      if (commonIsAbsolutePosition(node)) {
        const { x, y } = getCommonPositionValue(node);
        this.child = generateWidgetCode("Positioned", {
          left: x,
          top: y,
          child: this.child
        });
      }
      return this;
    }
  };

  // FigmaToCode/packages/backend/src/flutter/flutterTextBuilder.ts
  var FlutterTextBuilder = class extends FlutterDefaultBuilder {
    constructor(optChild = "") {
      super(optChild);
      this.fontStyle = (fontName) => {
        const lowercaseStyle = fontName.style.toLowerCase();
        if (lowercaseStyle.match("italic")) {
          return "FontStyle.italic";
        }
        return "";
      };
    }
    reset() {
      this.child = "";
    }
    createText(node) {
      var _a, _b, _c;
      this.node = node;
      let alignHorizontal = (_c = (_b = (_a = node.textAlignHorizontal) == null ? void 0 : _a.toString()) == null ? void 0 : _b.toLowerCase()) != null ? _c : "left";
      alignHorizontal = alignHorizontal === "justified" ? "justify" : alignHorizontal;
      const basicTextStyle = {
        textAlign: alignHorizontal !== "left" ? `TextAlign.${alignHorizontal}` : ""
      };
      const segments = this.getTextSegments(node);
      if (segments.length === 1) {
        this.child = generateWidgetCode(
          "Text",
          __spreadProps(__spreadValues({}, basicTextStyle), {
            style: segments[0].style
          }),
          [`'${segments[0].text}'`]
        );
      } else {
        this.child = generateWidgetCode("Text.rich", basicTextStyle, [
          generateWidgetCode("TextSpan", {
            children: segments.map(
              (segment) => generateWidgetCode("TextSpan", {
                text: `'${segment.text}'`,
                style: segment.style
              })
            )
          })
        ]);
      }
      return this;
    }
    getTextSegments(node) {
      const segments = node.styledTextSegments;
      if (!segments) {
        return [];
      }
      return segments.map((segment) => {
        const color2 = flutterColorFromDirectFills(segment.fills);
        const fontSize2 = `${numberToFixedString(segment.fontSize)}`;
        const fontStyle = this.fontStyle(segment.fontName);
        const fontFamily2 = `'${segment.fontName.family}'`;
        const fontWeight2 = `FontWeight.w${segment.fontWeight}`;
        const lineHeight2 = this.lineHeight(segment.lineHeight, segment.fontSize);
        const letterSpacing2 = this.letterSpacing(
          segment.letterSpacing,
          segment.fontSize
        );
        const styleProperties = {
          color: color2,
          fontSize: fontSize2,
          fontStyle,
          fontFamily: fontFamily2,
          fontWeight: fontWeight2,
          textDecoration: skipDefaultProperty(
            this.getFlutterTextDecoration(segment.textDecoration),
            "TextDecoration.none"
          ),
          // textTransform: textTransform,
          height: lineHeight2,
          letterSpacing: letterSpacing2
        };
        if (segment.openTypeFeatures.SUBS === true) {
          styleProperties.fontFeatures = `[FontFeature.enable("subs")]`;
        } else if (segment.openTypeFeatures.SUPS === true) {
          styleProperties.fontFeatures = `[FontFeature.enable("sups")]`;
        }
        const shadow = this.textShadow();
        if (shadow) {
          styleProperties.shadows = shadow;
        }
        const style = generateWidgetCode("TextStyle", styleProperties);
        let text = segment.characters;
        if (segment.textCase === "LOWER") {
          text = text.toLowerCase();
        } else if (segment.textCase === "UPPER") {
          text = text.toUpperCase();
        }
        return {
          style,
          text: parseTextAsCode(text).replace(/\$/g, "\\$"),
          openTypeFeatures: segment.openTypeFeatures
        };
      });
    }
    getFlutterTextDecoration(decoration) {
      switch (decoration) {
        case "UNDERLINE":
          return "TextDecoration.underline";
        case "STRIKETHROUGH":
          return "TextDecoration.lineThrough";
        default:
          return "TextDecoration.none";
      }
    }
    lineHeight(lineHeight2, fontSize2) {
      switch (lineHeight2.unit) {
        case "AUTO":
          return "";
        case "PIXELS":
          return numberToFixedString(lineHeight2.value / fontSize2);
        case "PERCENT":
          return numberToFixedString(lineHeight2.value / 100);
      }
    }
    letterSpacing(letterSpacing2, fontSize2) {
      const value = commonLetterSpacing(letterSpacing2, fontSize2);
      if (value) {
        return numberToFixedString(value);
      }
      return "";
    }
    textAutoSize(node) {
      let result = this.child;
      const constraints = {};
      if (node.minWidth !== void 0 && node.minWidth !== null) {
        constraints.minWidth = numberToFixedString(node.minWidth);
      }
      if (node.maxWidth !== void 0 && node.maxWidth !== null) {
        constraints.maxWidth = numberToFixedString(node.maxWidth);
      }
      if (node.minHeight !== void 0 && node.minHeight !== null) {
        constraints.minHeight = numberToFixedString(node.minHeight);
      }
      if (node.maxHeight !== void 0 && node.maxHeight !== null) {
        constraints.maxHeight = numberToFixedString(node.maxHeight);
      }
      const hasConstraints = Object.keys(constraints).length > 0;
      if (hasConstraints) {
        result = generateWidgetCode("ConstrainedBox", {
          constraints: generateWidgetCode("BoxConstraints", constraints),
          child: result
        });
      }
      switch (node.textAutoResize) {
        case "WIDTH_AND_HEIGHT":
          break;
        case "HEIGHT":
          result = generateWidgetCode("SizedBox", {
            width: node.width,
            child: result
          });
          break;
        case "NONE":
        case "TRUNCATE":
          result = generateWidgetCode("SizedBox", {
            width: node.width,
            height: node.height,
            child: result
          });
          break;
      }
      result = wrapTextWithLayerBlur(node, result);
      this.child = result;
      return this;
    }
    /**
     * New method to handle text shadow.
     * Checks if a drop shadow effect is applied to the node and
     * returns Flutter code for the TextStyle "shadows" property.
     */
    textShadow() {
      if (this.node && this.node.effects) {
        const effects = this.node.effects;
        const dropShadow = effects.find(
          (effect) => effect.type === "DROP_SHADOW" && effect.visible !== false
        );
        if (dropShadow) {
          const ds = dropShadow;
          const offsetX = Math.round(ds.offset.x);
          const offsetY = Math.round(ds.offset.y);
          const blurRadius = Math.round(ds.radius);
          const r = Math.round(ds.color.r * 255);
          const g = Math.round(ds.color.g * 255);
          const b = Math.round(ds.color.b * 255);
          const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
          return `[Shadow(offset: Offset(${offsetX}, ${offsetY}), blurRadius: ${blurRadius}, color: Color(0xFF${hex}).withOpacity(${ds.color.a.toFixed(
            2
          )}))]`;
        }
      }
      return "";
    }
  };
  var wrapTextWithLayerBlur = (node, child) => {
    if (node.effects) {
      const blurEffect = node.effects.find(
        (effect) => effect.type === "LAYER_BLUR" && effect.visible !== false && effect.radius > 0
      );
      if (blurEffect) {
        return generateWidgetCode("ImageFiltered", {
          imageFilter: `ImageFilter.blur(sigmaX: ${blurEffect.radius}, sigmaY: ${blurEffect.radius})`,
          child
        });
      }
    }
    return child;
  };
  var parseTextAsCode = (originalText) => originalText.replace(/\n/g, "\\n");

  // FigmaToCode/packages/backend/src/flutter/builderImpl/flutterAutoLayout.ts
  var getMainAxisAlignment2 = (node) => {
    switch (node.primaryAxisAlignItems) {
      case void 0:
      case "MIN":
        return "MainAxisAlignment.start";
      case "CENTER":
        return "MainAxisAlignment.center";
      case "MAX":
        return "MainAxisAlignment.end";
      case "SPACE_BETWEEN":
        return "MainAxisAlignment.spaceBetween";
    }
  };
  var getCrossAxisAlignment2 = (node) => {
    switch (node.counterAxisAlignItems) {
      case void 0:
      case "MIN":
        return "CrossAxisAlignment.start";
      case "CENTER":
        return "CrossAxisAlignment.center";
      case "MAX":
        return "CrossAxisAlignment.end";
      case "BASELINE":
        return "CrossAxisAlignment.baseline";
    }
  };
  var getWrapAlignment = (node) => {
    switch (node.primaryAxisAlignItems) {
      case void 0:
      case "MIN":
        return "WrapAlignment.start";
      case "CENTER":
        return "WrapAlignment.center";
      case "MAX":
        return "WrapAlignment.end";
      case "SPACE_BETWEEN":
        return "WrapAlignment.spaceBetween";
    }
  };
  var getWrapRunAlignment = (node) => {
    if (node.counterAxisAlignContent == "SPACE_BETWEEN") {
      return "WrapAlignment.spaceBetween";
    }
    switch (node.counterAxisAlignItems) {
      case void 0:
      case "MIN":
        return "WrapAlignment.start";
      case "CENTER":
      case "BASELINE":
        return "WrapAlignment.center";
      case "MAX":
        return "WrapAlignment.end";
    }
  };

  // FigmaToCode/packages/backend/src/flutter/flutterMain.ts
  var localSettings2;
  var previousExecutionCache3;
  var getFullAppTemplate = (name, injectCode) => `import 'package:flutter/material.dart';

void main() {
  runApp(const FigmaToCodeApp());
}

// Generated by: https://www.figma.com/community/plugin/842128343887142055/
class FigmaToCodeApp extends StatelessWidget {
  const FigmaToCodeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color.fromARGB(255, 18, 32, 47),
      ),
      home: Scaffold(
        body: ListView(children: [
          ${name}(),
        ]),
      ),
    );
  }
}

class ${name} extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ${indentString(injectCode, 4).trimStart()};
  }
}`;
  var getStatelessTemplate = (name, injectCode) => `class ${name} extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ${indentString(injectCode, 4).trimStart()};
  }
}`;
  var flutterMain = (sceneNode, settings) => {
    localSettings2 = settings;
    previousExecutionCache3 = [];
    let result = flutterWidgetGenerator(sceneNode);
    switch (localSettings2.flutterGenerationMode) {
      case "snippet":
        return result;
      case "stateless":
        if (!result.startsWith("Column")) {
          result = generateWidgetCode("Column", { children: [result] });
        }
        return getStatelessTemplate(stringToClassName(sceneNode[0].name), result);
      case "fullApp":
        if (!result.startsWith("Column")) {
          result = generateWidgetCode("Column", { children: [result] });
        }
        return getFullAppTemplate(stringToClassName(sceneNode[0].name), result);
    }
    return result;
  };
  var flutterWidgetGenerator = (sceneNode) => {
    let comp = [];
    const visibleSceneNode = getVisibleNodes(sceneNode);
    visibleSceneNode.forEach((node) => {
      switch (node.type) {
        case "RECTANGLE":
        case "ELLIPSE":
        case "STAR":
        case "POLYGON":
        case "LINE":
          comp.push(flutterContainer2(node, ""));
          break;
        case "GROUP":
          comp.push(flutterGroup(node));
          break;
        case "FRAME":
        case "INSTANCE":
        case "COMPONENT":
        case "COMPONENT_SET":
        case "SLOT":
          comp.push(flutterFrame(node));
          break;
        case "SECTION":
          comp.push(flutterContainer2(node, ""));
          break;
        case "TEXT":
          comp.push(flutterText(node));
          break;
        case "VECTOR":
          addWarning("VectorNodes are not supported in Flutter");
          break;
        case "SLICE":
        default:
      }
    });
    return comp.join(",\n");
  };
  var flutterGroup = (node) => {
    const widget = flutterWidgetGenerator(node.children);
    return flutterContainer2(
      node,
      generateWidgetCode("Stack", {
        children: widget ? [widget] : []
      })
    );
  };
  var flutterContainer2 = (node, child) => {
    var _a;
    let propChild = "";
    if ("fills" in node && ((_a = retrieveTopFill(node.fills)) == null ? void 0 : _a.type) === "IMAGE") {
      addWarning("Image fills are replaced with placeholders");
    }
    if (child.length > 0) {
      propChild = child;
    }
    const builder = new FlutterDefaultBuilder(propChild).createContainer(node).blendAttr(node).position(node);
    return builder.child;
  };
  var flutterText = (node) => {
    const builder = new FlutterTextBuilder().createText(node);
    previousExecutionCache3.push(builder.child);
    return builder.blendAttr(node).textAutoSize(node).position(node).child;
  };
  var flutterFrame = (node) => {
    const hasAbsoluteChildren = node.children.some(
      (child) => child.layoutPositioning === "ABSOLUTE"
    );
    if (hasAbsoluteChildren && node.layoutMode !== "NONE") {
      addWarning(
        `Frame "${node.name}" has absolute positioned children. Using Stack instead of ${node.layoutMode === "HORIZONTAL" ? "Row" : "Column"}.`
      );
    }
    const children = flutterWidgetGenerator(node.children);
    if (hasAbsoluteChildren) {
      return flutterContainer2(
        node,
        generateWidgetCode("Stack", {
          children: children !== "" ? [children] : []
        })
      );
    }
    if (node.layoutMode !== "NONE") {
      const rowColumnWrap = makeRowColumnWrap2(node, children);
      return flutterContainer2(node, rowColumnWrap);
    } else {
      if (node.inferredAutoLayout) {
        const rowColumnWrap = makeRowColumnWrap2(node.inferredAutoLayout, children);
        return flutterContainer2(node, rowColumnWrap);
      }
      if (node.isAsset) {
        return flutterContainer2(node, generateWidgetCode("FlutterLogo", {}));
      }
      return flutterContainer2(
        node,
        generateWidgetCode("Stack", {
          children: children !== "" ? [children] : []
        })
      );
    }
  };
  var makeRowColumnWrap2 = (autoLayout, children) => {
    const rowOrColumn = autoLayout.layoutWrap == "WRAP" && autoLayout.primaryAxisSizingMode == "FIXED" ? "Wrap" : autoLayout.layoutMode === "HORIZONTAL" ? "Row" : "Column";
    const widgetProps = autoLayout.layoutWrap == "WRAP" ? {
      alignment: getWrapAlignment(autoLayout),
      runAlignment: getWrapRunAlignment(autoLayout)
    } : {
      mainAxisSize: "MainAxisSize.min",
      // mainAxisSize: getFlex(node, autoLayout),
      mainAxisAlignment: getMainAxisAlignment2(autoLayout),
      crossAxisAlignment: getCrossAxisAlignment2(autoLayout)
    };
    if (autoLayout.layoutWrap == "WRAP") {
      if (autoLayout.primaryAxisAlignItems != "SPACE_BETWEEN" && autoLayout.itemSpacing != void 0) {
        widgetProps.spacing = autoLayout.itemSpacing;
      }
      if (autoLayout.counterAxisAlignContent != "SPACE_BETWEEN" && autoLayout.counterAxisSpacing != void 0) {
        widgetProps.runSpacing = autoLayout.counterAxisSpacing;
      }
    } else if (autoLayout.itemSpacing > 0) {
      widgetProps.spacing = autoLayout.itemSpacing;
    } else if (autoLayout.itemSpacing < 0) {
      addWarning("Flutter doesn't support negative itemSpacing");
    }
    widgetProps.children = [children];
    return generateWidgetCode(rowOrColumn, widgetProps);
  };

  // FigmaToCode/packages/backend/src/html/builderImpl/htmlShadow.ts
  var htmlShadow = (node) => {
    if (node.effects && node.effects.length > 0) {
      const shadowEffects = node.effects.filter(
        (d) => (d.type === "DROP_SHADOW" || d.type === "INNER_SHADOW" || d.type === "LAYER_BLUR") && d.visible
      );
      if (shadowEffects.length > 0) {
        const shadows = [];
        shadowEffects.forEach((shadow) => {
          let x = 0;
          let y = 0;
          let blur2 = 0;
          let spread = "";
          let inner = "";
          let color2 = "";
          if (shadow.type === "DROP_SHADOW" || shadow.type === "INNER_SHADOW") {
            x = shadow.offset.x;
            y = shadow.offset.y;
            blur2 = shadow.radius;
            spread = shadow.spread ? `${shadow.spread}px ` : "";
            inner = shadow.type === "INNER_SHADOW" ? " inset" : "";
            color2 = htmlColor(shadow.color, shadow.color.a);
          } else if (shadow.type === "LAYER_BLUR") {
            x = shadow.radius;
            y = shadow.radius;
            blur2 = shadow.radius;
          }
          shadows.push(`${x}px ${y}px ${blur2}px ${spread}${color2}${inner}`);
        });
        return shadows.join(", ");
      }
    }
    return "";
  };

  // FigmaToCode/packages/backend/src/html/builderImpl/htmlBlend.ts
  var htmlOpacity = (node, isJsx) => {
    if (node.opacity !== void 0 && node.opacity !== 1) {
      if (isJsx) {
        return `opacity: ${numberToFixedString(node.opacity)}`;
      } else {
        return `opacity: ${numberToFixedString(node.opacity)}`;
      }
    }
    return "";
  };
  var htmlBlendMode = (node, isJsx) => {
    if (node.blendMode !== "NORMAL" && node.blendMode !== "PASS_THROUGH") {
      let blendMode = "";
      switch (node.blendMode) {
        case "MULTIPLY":
          blendMode = "multiply";
          break;
        case "SCREEN":
          blendMode = "screen";
          break;
        case "OVERLAY":
          blendMode = "overlay";
          break;
        case "DARKEN":
          blendMode = "darken";
          break;
        case "LIGHTEN":
          blendMode = "lighten";
          break;
        case "COLOR_DODGE":
          blendMode = "color-dodge";
          break;
        case "COLOR_BURN":
          blendMode = "color-burn";
          break;
        case "HARD_LIGHT":
          blendMode = "hard-light";
          break;
        case "SOFT_LIGHT":
          blendMode = "soft-light";
          break;
        case "DIFFERENCE":
          blendMode = "difference";
          break;
        case "EXCLUSION":
          blendMode = "exclusion";
          break;
        case "HUE":
          blendMode = "hue";
          break;
        case "SATURATION":
          blendMode = "saturation";
          break;
        case "COLOR":
          blendMode = "color";
          break;
        case "LUMINOSITY":
          blendMode = "luminosity";
          break;
      }
      if (blendMode) {
        return formatWithJSX("mix-blend-mode", isJsx, blendMode);
      }
    }
    return "";
  };
  var htmlVisibility = (node, isJsx) => {
    if (node.visible !== void 0 && !node.visible) {
      return formatWithJSX("visibility", isJsx, "hidden");
    }
    return "";
  };
  var htmlRotation = (node, isJsx) => {
    const rotation = -Math.round((node.rotation || 0) + (node.cumulativeRotation || 0)) || 0;
    if (rotation !== 0) {
      return [
        formatWithJSX(
          "transform",
          isJsx,
          `rotate(${numberToFixedString(rotation)}deg)`
        ),
        formatWithJSX("transform-origin", isJsx, "top left")
      ];
    }
    return [];
  };

  // FigmaToCode/packages/backend/src/html/builderImpl/htmlPadding.ts
  var htmlPadding = (node, isJsx) => {
    const padding = commonPadding(node);
    if (padding === null) {
      return [];
    }
    if ("all" in padding) {
      if (padding.all !== 0) {
        return [formatWithJSX("padding", isJsx, padding.all)];
      } else {
        return [];
      }
    }
    let comp = [];
    if ("horizontal" in padding) {
      if (padding.horizontal !== 0) {
        comp.push(formatWithJSX("padding-left", isJsx, padding.horizontal));
        comp.push(formatWithJSX("padding-right", isJsx, padding.horizontal));
      }
      if (padding.vertical !== 0) {
        comp.push(formatWithJSX("padding-top", isJsx, padding.vertical));
        comp.push(formatWithJSX("padding-bottom", isJsx, padding.vertical));
      }
      return comp;
    }
    if (padding.top !== 0) {
      comp.push(formatWithJSX("padding-top", isJsx, padding.top));
    }
    if (padding.bottom !== 0) {
      comp.push(formatWithJSX("padding-bottom", isJsx, padding.bottom));
    }
    if (padding.left !== 0) {
      comp.push(formatWithJSX("padding-left", isJsx, padding.left));
    }
    if (padding.right !== 0) {
      comp.push(formatWithJSX("padding-right", isJsx, padding.right));
    }
    return comp;
  };

  // FigmaToCode/packages/backend/src/html/builderImpl/htmlSize.ts
  var htmlSizePartial = (node, isJsx) => {
    if (isPreviewGlobal && node.parent === void 0) {
      return {
        width: formatWithJSX("width", isJsx, "100%"),
        height: formatWithJSX("height", isJsx, "100%"),
        constraints: []
      };
    }
    const size = nodeSize(node);
    const nodeParent = node.parent;
    let w = "";
    if (typeof size.width === "number") {
      w = formatWithJSX("width", isJsx, size.width);
    } else if (size.width === "fill") {
      if (nodeParent && "layoutMode" in nodeParent && nodeParent.layoutMode === "HORIZONTAL") {
        w = formatWithJSX("flex", isJsx, "1 1 0");
      } else {
        if (node.maxWidth) {
          w = formatWithJSX("width", isJsx, "100%");
        } else {
          w = formatWithJSX("align-self", isJsx, "stretch");
        }
      }
    }
    let h = "";
    if (typeof size.height === "number") {
      h = formatWithJSX("height", isJsx, size.height);
    } else if (typeof size.height === "string") {
      if (nodeParent && "layoutMode" in nodeParent && nodeParent.layoutMode === "VERTICAL") {
        h = formatWithJSX("flex", isJsx, "1 1 0");
      } else {
        if (node.maxHeight) {
          h = formatWithJSX("height", isJsx, "100%");
        } else {
          h = formatWithJSX("align-self", isJsx, "stretch");
        }
      }
    }
    const constraints = [];
    if (node.maxWidth !== void 0 && node.maxWidth !== null) {
      constraints.push(formatWithJSX("max-width", isJsx, node.maxWidth));
    }
    if (node.minWidth !== void 0 && node.minWidth !== null) {
      constraints.push(formatWithJSX("min-width", isJsx, node.minWidth));
    }
    if (node.maxHeight !== void 0 && node.maxHeight !== null) {
      constraints.push(formatWithJSX("max-height", isJsx, node.maxHeight));
    }
    if (node.minHeight !== void 0 && node.minHeight !== null) {
      constraints.push(formatWithJSX("min-height", isJsx, node.minHeight));
    }
    return {
      width: w,
      height: h,
      constraints
    };
  };

  // FigmaToCode/packages/backend/src/html/builderImpl/htmlBorderRadius.ts
  var htmlBorderRadius = (node, isJsx) => {
    let comp = [];
    if ("children" in node && node.children.length > 0 && "clipsContent" in node && node.clipsContent === true) {
      comp.push(formatWithJSX("overflow", isJsx, "hidden"));
    }
    if (node.type === "ELLIPSE") {
      comp.push(formatWithJSX("border-radius", isJsx, 9999));
      return comp;
    }
    const radius = getCommonRadius(node);
    let singleCorner = 0;
    if ("all" in radius) {
      if (radius.all === 0) {
        return comp;
      }
      singleCorner = radius.all;
      comp.push(formatWithJSX("border-radius", isJsx, radius.all));
    } else {
      const cornerValues = [
        radius.topLeft,
        radius.topRight,
        radius.bottomRight,
        radius.bottomLeft
      ];
      const cornerProperties = [
        "border-top-left-radius",
        "border-top-right-radius",
        "border-bottom-right-radius",
        "border-bottom-left-radius"
      ];
      for (let i = 0; i < 4; i++) {
        if (cornerValues[i] > 0) {
          comp.push(formatWithJSX(cornerProperties[i], isJsx, cornerValues[i]));
        }
      }
    }
    return comp;
  };

  // FigmaToCode/packages/backend/src/html/htmlDefaultBuilder.ts
  var HtmlDefaultBuilder = class {
    constructor(node, settings) {
      this.cssClassName = null;
      this.addStyles = (...newStyles) => {
        this.styles.push(...newStyles.filter((style) => style));
      };
      this.node = node;
      this.settings = settings;
      this.styles = [];
      this.data = [];
      if (this.settings.htmlGenerationMode === "svelte" || this.settings.htmlGenerationMode === "styled-components") {
        let baseClassName = this.node.uniqueName || this.node.name || this.node.type.toLowerCase();
        baseClassName = baseClassName.replace(/[^a-zA-Z0-9\s_-]/g, "").replace(/\s+/g, "-").toLowerCase();
        if (!/^[a-z]/i.test(baseClassName)) {
          baseClassName = `${this.node.type.toLowerCase()}-${baseClassName}`;
        }
        this.cssClassName = generateUniqueClassName(baseClassName);
      }
    }
    get name() {
      if (this.settings.htmlGenerationMode === "styled-components") {
        return this.settings.showLayerNames ? this.node.uniqueName || this.node.name : "";
      }
      return this.settings.showLayerNames ? this.node.name : "";
    }
    get visible() {
      return this.node.visible;
    }
    get isJSX() {
      return this.settings.htmlGenerationMode === "jsx";
    }
    get exportCSS() {
      return this.settings.htmlGenerationMode === "svelte";
    }
    get needsJSXTextEscaping() {
      const mode = this.settings.htmlGenerationMode;
      return mode === "jsx" || mode === "styled-components" || mode === "svelte";
    }
    get useStyledComponents() {
      return this.settings.htmlGenerationMode === "styled-components";
    }
    get useInlineStyles() {
      return this.settings.htmlGenerationMode === "html" || this.settings.htmlGenerationMode === "jsx";
    }
    // Get the appropriate HTML element based on node type
    get htmlElement() {
      if (this.node.type === "TEXT") return "p";
      return "div";
    }
    commonPositionStyles() {
      this.size();
      this.autoLayoutPadding();
      this.position();
      this.blend();
      return this;
    }
    commonShapeStyles() {
      if ("fills" in this.node) {
        this.applyFillsToStyle(
          this.node.fills,
          this.node.type === "TEXT" ? "text" : "background"
        );
      }
      this.shadow();
      this.border(this.settings);
      this.blur();
      return this;
    }
    blend() {
      const { node, isJSX } = this;
      this.addStyles(
        htmlVisibility(node, isJSX),
        ...htmlRotation(node, isJSX),
        htmlOpacity(node, isJSX),
        htmlBlendMode(node, isJSX)
      );
      return this;
    }
    border(settings) {
      const { node } = this;
      this.addStyles(...htmlBorderRadius(node, this.isJSX));
      const commonBorder = commonStroke(node);
      if (!commonBorder) {
        return this;
      }
      const strokes = "strokes" in node && node.strokes || void 0;
      const color2 = htmlColorFromFills(strokes);
      if (!color2) {
        return this;
      }
      const borderStyle = "dashPattern" in node && node.dashPattern.length > 0 ? "dotted" : "solid";
      const strokeAlign = "strokeAlign" in node ? node.strokeAlign : "INSIDE";
      const consolidateBorders = (border2) => [`${numberToFixedString(border2)}px`, color2, borderStyle].filter((d) => d).join(" ");
      if ("all" in commonBorder) {
        if (commonBorder.all === 0) {
          return this;
        }
        const weight = commonBorder.all;
        if (strokeAlign === "CENTER" || strokeAlign === "OUTSIDE" || node.type === "FRAME" || node.type === "INSTANCE" || node.type === "COMPONENT") {
          this.addStyles(
            formatWithJSX("outline", this.isJSX, consolidateBorders(weight))
          );
          if (strokeAlign === "CENTER") {
            this.addStyles(
              formatWithJSX(
                "outline-offset",
                this.isJSX,
                `${numberToFixedString(-weight / 2)}px`
              )
            );
          } else if (strokeAlign === "INSIDE") {
            this.addStyles(
              formatWithJSX(
                "outline-offset",
                this.isJSX,
                `${numberToFixedString(-weight)}px`
              )
            );
          }
        } else {
          this.addStyles(
            formatWithJSX("border", this.isJSX, consolidateBorders(weight))
          );
        }
      } else {
        if (commonBorder.left !== 0) {
          this.addStyles(
            formatWithJSX(
              "border-left",
              this.isJSX,
              consolidateBorders(commonBorder.left)
            )
          );
        }
        if (commonBorder.top !== 0) {
          this.addStyles(
            formatWithJSX(
              "border-top",
              this.isJSX,
              consolidateBorders(commonBorder.top)
            )
          );
        }
        if (commonBorder.right !== 0) {
          this.addStyles(
            formatWithJSX(
              "border-right",
              this.isJSX,
              consolidateBorders(commonBorder.right)
            )
          );
        }
        if (commonBorder.bottom !== 0) {
          this.addStyles(
            formatWithJSX(
              "border-bottom",
              this.isJSX,
              consolidateBorders(commonBorder.bottom)
            )
          );
        }
      }
      return this;
    }
    position() {
      const { node, isJSX } = this;
      const isAbsolutePosition = commonIsAbsolutePosition(node);
      if (isAbsolutePosition) {
        const { x, y } = getCommonPositionValue(node, this.settings);
        this.addStyles(
          formatWithJSX("left", isJSX, x),
          formatWithJSX("top", isJSX, y),
          formatWithJSX("position", isJSX, "absolute")
        );
      } else {
        if (node.type === "GROUP" || node.isRelative) {
          this.addStyles(formatWithJSX("position", isJSX, "relative"));
        }
      }
      return this;
    }
    applyFillsToStyle(paintArray, property) {
      if (property === "text") {
        this.addStyles(
          formatWithJSX(
            "text",
            this.isJSX,
            htmlColorFromFills(paintArray)
          )
        );
        return this;
      }
      const backgroundValues = buildBackgroundValues(paintArray);
      if (backgroundValues) {
        this.addStyles(formatWithJSX("background", this.isJSX, backgroundValues));
        if (paintArray !== figma.mixed) {
          const blendModes = this.buildBackgroundBlendModes(paintArray);
          if (blendModes) {
            this.addStyles(
              formatWithJSX("background-blend-mode", this.isJSX, blendModes)
            );
          }
        }
      }
      return this;
    }
    buildBackgroundBlendModes(paintArray) {
      if (paintArray.length === 0 || paintArray.every(
        (d) => d.blendMode === "NORMAL" || d.blendMode === "PASS_THROUGH"
      )) {
        return "";
      }
      const blendModes = [...paintArray].reverse().map((paint) => {
        var _a;
        if (paint.blendMode === "PASS_THROUGH") {
          return "normal";
        }
        return (_a = paint.blendMode) == null ? void 0 : _a.toLowerCase();
      });
      return blendModes.join(", ");
    }
    shadow() {
      const { node, isJSX } = this;
      if ("effects" in node) {
        const shadow = htmlShadow(node);
        if (shadow) {
          this.addStyles(formatWithJSX("box-shadow", isJSX, htmlShadow(node)));
        }
      }
      return this;
    }
    size() {
      const { node, settings } = this;
      const { width, height, constraints } = htmlSizePartial(
        node,
        settings.htmlGenerationMode === "jsx"
      );
      if (node.type === "TEXT") {
        switch (node.textAutoResize) {
          case "WIDTH_AND_HEIGHT":
            break;
          case "HEIGHT":
            this.addStyles(width);
            break;
          case "NONE":
          case "TRUNCATE":
            this.addStyles(width, height);
            break;
        }
      } else {
        this.addStyles(width, height);
      }
      if (constraints.length > 0) {
        this.addStyles(...constraints);
      }
      return this;
    }
    autoLayoutPadding() {
      const { node, isJSX } = this;
      if ("paddingLeft" in node) {
        this.addStyles(...htmlPadding(node, isJSX));
      }
      return this;
    }
    blur() {
      const { node } = this;
      if ("effects" in node && node.effects.length > 0) {
        const blur2 = node.effects.find(
          (e) => e.type === "LAYER_BLUR" && e.visible
        );
        if (blur2) {
          this.addStyles(
            formatWithJSX(
              "filter",
              this.isJSX,
              `blur(${numberToFixedString(blur2.radius / 2)}px)`
            )
          );
        }
        const backgroundBlur = node.effects.find(
          (e) => e.type === "BACKGROUND_BLUR" && e.visible
        );
        if (backgroundBlur) {
          this.addStyles(
            formatWithJSX(
              "backdrop-filter",
              this.isJSX,
              `blur(${numberToFixedString(backgroundBlur.radius / 2)}px)`
            )
          );
        }
      }
    }
    addData(label, value) {
      const attribute2 = formatDataAttribute(label, value);
      this.data.push(attribute2);
      return this;
    }
    build(additionalStyle = []) {
      var _a;
      this.addStyles(...additionalStyle);
      const mode = this.settings.htmlGenerationMode || "html";
      if (mode === "styled-components" && !this.data.length && this.styles.length > 0 && this.cssClassName) {
        this.storeStyles();
        return "";
      }
      let classNames = [];
      if (this.name) {
        this.addData("layer", this.name.trim());
        if (mode !== "svelte" && mode !== "styled-components") {
          const layerNameClass = stringToClassName(this.name.trim());
          if (layerNameClass !== "") {
            classNames.push(layerNameClass);
          }
        }
      }
      if ("componentProperties" in this.node && this.node.componentProperties) {
        (_a = Object.entries(this.node.componentProperties)) == null ? void 0 : _a.map((prop) => {
          if (prop[1].type === "VARIANT" || prop[1].type === "BOOLEAN") {
            const cleanName = prop[0].split("#")[0].replace(/\s+/g, "-").toLowerCase();
            return formatDataAttribute(cleanName, String(prop[1].value));
          }
          return "";
        }).filter(Boolean).sort().forEach((d) => this.data.push(d));
      }
      if (mode === "svelte" && this.styles.length > 0 && this.cssClassName) {
        classNames.push(this.cssClassName);
        this.storeStyles();
        this.styles = [];
      } else if (mode === "styled-components" && this.styles.length > 0 && this.cssClassName) {
        classNames.push(this.cssClassName);
        this.storeStyles();
      }
      const dataAttributes = this.data.join("");
      const classAttribute = mode === "styled-components" ? formatClassAttribute(
        classNames.filter((c) => c !== this.cssClassName),
        this.isJSX
      ) : formatClassAttribute(classNames, this.isJSX);
      const styleAttribute = formatStyleAttribute(this.styles, this.isJSX);
      return `${dataAttributes}${classAttribute}${styleAttribute}`;
    }
    // Extract style storage into a method to avoid duplication
    storeStyles() {
      var _a, _b, _c;
      if (!this.cssClassName || this.styles.length === 0) return;
      const cssStyles = stylesToCSS(this.styles, this.isJSX);
      let element = this.node.type === "TEXT" ? "p" : "div";
      if ((_a = this.node.name) == null ? void 0 : _a.toLowerCase().includes("button")) {
        element = "button";
      } else if (((_b = this.node.name) == null ? void 0 : _b.toLowerCase().includes("img")) || ((_c = this.node.name) == null ? void 0 : _c.toLowerCase().includes("image"))) {
        element = "img";
      }
      const nodeName = this.node.uniqueName || this.node.name;
      const componentName = getComponentName(nodeName, this.cssClassName, element);
      cssCollection[this.cssClassName] = {
        styles: cssStyles,
        nodeType: this.node.type,
        element,
        componentName
      };
    }
  };

  // FigmaToCode/packages/backend/src/html/htmlTextBuilder.ts
  var HtmlTextBuilder = class extends HtmlDefaultBuilder {
    constructor(node, settings) {
      super(node, settings);
    }
    // Override htmlElement to ensure text nodes use paragraph elements
    get htmlElement() {
      return "p";
    }
    getTextSegments(node) {
      const segments = node.styledTextSegments;
      if (!segments) {
        return [];
      }
      return segments.map((segment, index) => {
        const additionalStyles = {};
        const layerBlurStyle = this.getLayerBlurStyle();
        if (layerBlurStyle) {
          additionalStyles.filter = layerBlurStyle;
        }
        const textShadowStyle = this.getTextShadowStyle();
        if (textShadowStyle) {
          additionalStyles["text-shadow"] = textShadowStyle;
        }
        const styleAttributes = formatMultipleJSX(
          __spreadValues({
            color: htmlColorFromFills(segment.fills),
            "font-size": segment.fontSize,
            "font-family": segment.fontName.family,
            "font-style": this.getFontStyle(segment.fontName.style),
            "font-weight": `${segment.fontWeight}`,
            "text-decoration": this.textDecoration(segment.textDecoration),
            "text-transform": this.textTransform(segment.textCase),
            "line-height": this.lineHeight(segment.lineHeight, segment.fontSize),
            "letter-spacing": this.letterSpacing(
              segment.letterSpacing,
              segment.fontSize
            ),
            // "text-indent": segment.indentation,
            "word-wrap": "break-word"
          }, additionalStyles),
          this.isJSX
        );
        let chars = segment.characters;
        if (this.needsJSXTextEscaping) {
          chars = escapeJSXText(chars);
        }
        const charsWithLineBreak = chars.split("\n").join("<br/>");
        const result = {
          style: styleAttributes,
          text: charsWithLineBreak,
          openTypeFeatures: segment.openTypeFeatures
        };
        const mode = this.settings.htmlGenerationMode;
        if ((mode === "svelte" || mode === "styled-components") && styleAttributes) {
          const segmentName = segment.uniqueId || `${(node.uniqueName || node.name || "text").replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase()}_text_${(index + 1).toString().padStart(2, "0")}`;
          const className = generateUniqueClassName(segmentName);
          result.className = className;
          const cssStyles = stylesToCSS(
            styleAttributes.split(this.isJSX ? "," : ";").map((style) => style.trim()).filter((style) => style),
            this.isJSX
          );
          const elementTag = "span";
          const componentName = getComponentName(segmentName, className, elementTag);
          cssCollection[className] = {
            styles: cssStyles,
            nodeType: "TEXT",
            element: elementTag,
            componentName
          };
          if (mode === "styled-components") {
            result.componentName = componentName;
          }
        }
        return result;
      });
    }
    fontSize(node, isUI = false) {
      if (node.fontSize !== figma.mixed) {
        const value = isUI ? Math.min(node.fontSize, 24) : node.fontSize;
        this.addStyles(formatWithJSX("font-size", this.isJSX, value));
      }
      return this;
    }
    textTrim() {
      if ("leadingTrim" in this.node && this.node.leadingTrim === "CAP_HEIGHT") {
        this.addStyles(formatWithJSX("text-box-trim", this.isJSX, "trim-both"));
        this.addStyles(
          formatWithJSX("text-box-edge", this.isJSX, "cap alphabetic")
        );
      }
      return this;
    }
    textDecoration(textDecoration) {
      switch (textDecoration) {
        case "STRIKETHROUGH":
          return "line-through";
        case "UNDERLINE":
          return "underline";
        case "NONE":
          return "";
      }
    }
    textTransform(textCase) {
      switch (textCase) {
        case "UPPER":
          return "uppercase";
        case "LOWER":
          return "lowercase";
        case "TITLE":
          return "capitalize";
        case "ORIGINAL":
        case "SMALL_CAPS":
        case "SMALL_CAPS_FORCED":
        default:
          return "";
      }
    }
    letterSpacing(letterSpacing2, fontSize2) {
      const letterSpacingProp = commonLetterSpacing(letterSpacing2, fontSize2);
      if (letterSpacingProp > 0) {
        return letterSpacingProp;
      }
      return null;
    }
    lineHeight(lineHeight2, fontSize2) {
      const lineHeightProp = commonLineHeight(lineHeight2, fontSize2);
      if (lineHeightProp > 0) {
        return lineHeightProp;
      }
      return null;
    }
    /**
     * https://tailwindcss.com/docs/font-style/
     * example: font-extrabold
     * example: italic
     */
    getFontStyle(style) {
      if (style.toLowerCase().match("italic")) {
        return "italic";
      }
      return "";
    }
    textAlignHorizontal() {
      const node = this.node;
      if (node.textAlignHorizontal && node.textAlignHorizontal !== "LEFT") {
        let textAlign = "";
        switch (node.textAlignHorizontal) {
          case "CENTER":
            textAlign = "center";
            break;
          case "RIGHT":
            textAlign = "right";
            break;
          case "JUSTIFIED":
            textAlign = "justify";
            break;
        }
        this.addStyles(formatWithJSX("text-align", this.isJSX, textAlign));
      }
      return this;
    }
    textAlignVertical() {
      const node = this.node;
      if (node.textAlignVertical && node.textAlignVertical !== "TOP") {
        let alignItems = "";
        switch (node.textAlignVertical) {
          case "CENTER":
            alignItems = "center";
            break;
          case "BOTTOM":
            alignItems = "flex-end";
            break;
        }
        if (alignItems) {
          this.addStyles(
            formatWithJSX("justify-content", this.isJSX, alignItems)
          );
          this.addStyles(formatWithJSX("display", this.isJSX, "flex"));
          this.addStyles(formatWithJSX("flex-direction", this.isJSX, "column"));
        }
      }
      return this;
    }
    /**
     * Returns a CSS filter value for layer blur.
     */
    getLayerBlurStyle() {
      if (this.node && this.node.effects) {
        const effects = this.node.effects;
        const blurEffect = effects.find(
          (effect) => effect.type === "LAYER_BLUR" && effect.visible !== false && effect.radius > 0
        );
        if (blurEffect && blurEffect.radius) {
          return `blur(${blurEffect.radius}px)`;
        }
      }
      return "";
    }
    /**
     * Returns a CSS text-shadow value if a drop shadow effect is applied.
     */
    getTextShadowStyle() {
      if (this.node && this.node.effects) {
        const effects = this.node.effects;
        const dropShadow = effects.find(
          (effect) => effect.type === "DROP_SHADOW" && effect.visible !== false
        );
        if (dropShadow) {
          const ds = dropShadow;
          const offsetX = Math.round(ds.offset.x);
          const offsetY = Math.round(ds.offset.y);
          const blurRadius = Math.round(ds.radius);
          const r = Math.round(ds.color.r * 255);
          const g = Math.round(ds.color.g * 255);
          const b = Math.round(ds.color.b * 255);
          const a = ds.color.a;
          return `${offsetX}px ${offsetY}px ${blurRadius}px rgba(${r}, ${g}, ${b}, ${a.toFixed(
            2
          )})`;
        }
      }
      return "";
    }
  };

  // FigmaToCode/packages/backend/src/html/builderImpl/htmlAutoLayout.ts
  var getFlexDirection2 = (node) => node.layoutMode === "HORIZONTAL" ? "" : "column";
  var getJustifyContent2 = (node) => {
    switch (node.primaryAxisAlignItems) {
      case void 0:
      case "MIN":
        return "flex-start";
      case "CENTER":
        return "center";
      case "MAX":
        return "flex-end";
      case "SPACE_BETWEEN":
        return "space-between";
    }
  };
  var getAlignItems2 = (node) => {
    switch (node.counterAxisAlignItems) {
      case void 0:
      case "MIN":
        return "flex-start";
      case "CENTER":
        return "center";
      case "MAX":
        return "flex-end";
      case "BASELINE":
        return "baseline";
    }
  };
  var getGap2 = (node) => node.itemSpacing > 0 && node.primaryAxisAlignItems !== "SPACE_BETWEEN" ? node.itemSpacing : "";
  var getFlexWrap2 = (node) => node.layoutWrap === "WRAP" ? "wrap" : "";
  var getAlignContent2 = (node) => {
    if (node.layoutWrap !== "WRAP") return "";
    switch (node.counterAxisAlignItems) {
      case void 0:
      case "MIN":
        return "flex-start";
      case "CENTER":
        return "center";
      case "MAX":
        return "flex-end";
      case "BASELINE":
        return "baseline";
      default:
        return "normal";
    }
  };
  var getFlex2 = (node, autoLayout) => node.parent && "layoutMode" in node.parent && node.parent.layoutMode === autoLayout.layoutMode ? "flex" : "inline-flex";
  var htmlAutoLayoutProps = (node, settings) => formatMultipleJSXArray(
    {
      "flex-direction": getFlexDirection2(node),
      "justify-content": getJustifyContent2(node),
      "align-items": getAlignItems2(node),
      gap: getGap2(node),
      display: getFlex2(node, node),
      "flex-wrap": getFlexWrap2(node),
      "align-content": getAlignContent2(node)
    },
    settings.htmlGenerationMode === "jsx"
  );

  // FigmaToCode/packages/backend/src/html/htmlMain.ts
  var selfClosingTags = ["img"];
  var isPreviewGlobal = false;
  var previousExecutionCache4;
  var cssCollection = {};
  var classNameCounters = /* @__PURE__ */ new Map();
  function generateUniqueClassName(prefix = "figma") {
    const sanitizedPrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, "").replace(/^[0-9_-]/, "f") || // Ensure it doesn't start with a number or special char
    "figma";
    const count = classNameCounters.get(sanitizedPrefix) || 0;
    classNameCounters.set(sanitizedPrefix, count + 1);
    return count === 0 ? sanitizedPrefix : `${sanitizedPrefix}_${count.toString().padStart(2, "0")}`;
  }
  function resetClassNameCounters() {
    classNameCounters.clear();
  }
  function stylesToCSS(styles, isJSX) {
    return styles.map((style) => {
      if (!style.trim()) return "";
      if (isJSX) {
        return style.replace(/^([a-zA-Z0-9]+):/, (match, prop) => {
          return prop.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase() + ":";
        });
      }
      return style;
    }).filter(Boolean);
  }
  function getComponentName(nodeName, className, nodeType) {
    let name = "Styled";
    if (nodeName && nodeName.length > 0) {
      const cleanName = nodeName.replace(/[^a-zA-Z0-9]/g, "").replace(/^[a-z]/, (match) => match.toUpperCase());
      name += cleanName || nodeType.charAt(0).toUpperCase() + nodeType.slice(1);
    } else if (className) {
      const parts = className.split("-");
      if (parts.length > 0 && parts[0]) {
        name += parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      } else {
        name += nodeType.charAt(0).toUpperCase() + nodeType.slice(1);
      }
    } else {
      name += nodeType.charAt(0).toUpperCase() + nodeType.slice(1);
    }
    return name;
  }
  function getCollectedCSS() {
    if (Object.keys(cssCollection).length === 0) {
      return "";
    }
    return Object.entries(cssCollection).map(([className, { styles }]) => {
      if (!styles.length) return "";
      return `.${className} {
  ${styles.join(";\n  ")}${styles.length ? ";" : ""}
}`;
    }).filter(Boolean).join("\n\n");
  }
  function generateStyledComponents() {
    const components = [];
    Object.entries(cssCollection).forEach(
      ([className, { styles, componentName, element, nodeType }]) => {
        if (!styles.length) return;
        const baseElement = element || (nodeType === "TEXT" ? "p" : "div");
        const styledComponent = `const ${componentName} = styled.${baseElement}\`
  ${styles.join(";\n  ")}${styles.length ? ";" : ""}
\`;`;
        components.push(styledComponent);
      }
    );
    if (components.length === 0) {
      return "";
    }
    return `${components.join("\n\n")}`;
  }
  function getReactComponentName(node) {
    const name = (node == null ? void 0 : node.uniqueName) || (node == null ? void 0 : node.name);
    if (!name || name.trim() === "") {
      return "App";
    }
    let componentName = name.replace(/[^a-zA-Z0-9_]/g, " ").split(/\s+/).map(
      (part) => part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : ""
    ).join("");
    componentName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
    if (/^[0-9]/.test(componentName)) {
      componentName = "Component" + componentName;
    }
    return componentName || "App";
  }
  function generateComponentCode(html, sceneNode, mode) {
    switch (mode) {
      case "styled-components":
        return generateReactComponent(html, sceneNode);
      case "svelte":
        return generateSvelteComponent(html);
      case "html":
      case "jsx":
      default:
        return html;
    }
  }
  function generateReactComponent(html, sceneNode) {
    const styledComponentsCode = generateStyledComponents();
    const componentName = getReactComponentName(sceneNode[0]);
    const imports = [
      'import React from "react";',
      'import styled from "styled-components";'
    ];
    return `${imports.join("\n")}
${styledComponentsCode ? `
${styledComponentsCode}` : ""}

export const ${componentName} = () => {
  return (
${indentString(html, 4)}
  );
};`;
  }
  function generateSvelteComponent(html) {
    const cssRules = [];
    Object.entries(cssCollection).forEach(([className, { styles }]) => {
      if (!styles.length) return;
      cssRules.push(
        `.${className} {
  ${styles.join(";\n  ")}${styles.length ? ";" : ""}
}`
      );
    });
    return `${html}

<style>
${cssRules.join("\n\n")}
</style>`;
  }
  var htmlMain = async (sceneNode, settings, isPreview = false) => {
    isPreviewGlobal = isPreview;
    previousExecutionCache4 = [];
    cssCollection = {};
    resetClassNameCounters();
    let htmlContent = await htmlWidgetGenerator(sceneNode, settings);
    if (htmlContent.length > 0 && htmlContent.startsWith("\n")) {
      htmlContent = htmlContent.slice(1, htmlContent.length);
    }
    const output = { html: htmlContent };
    const mode = settings.htmlGenerationMode || "html";
    if (mode !== "html") {
      output.html = generateComponentCode(htmlContent, sceneNode, mode);
      if (mode === "svelte" && Object.keys(cssCollection).length > 0) {
      }
    } else if (Object.keys(cssCollection).length > 0) {
      output.css = getCollectedCSS();
    }
    return output;
  };
  var htmlWidgetGenerator = async (sceneNode, settings) => {
    const promiseOfConvertedCode = getVisibleNodes(sceneNode).map(
      convertNode2(settings)
    );
    const code = (await Promise.all(promiseOfConvertedCode)).join("");
    return code;
  };
  var convertNode2 = (settings) => async (node) => {
    if (settings.embedVectors && node.canBeFlattened) {
      const altNode = await renderAndAttachSVG(node);
      if (altNode.svg) {
        return htmlWrapSVG(altNode, settings);
      }
    }
    switch (node.type) {
      case "RECTANGLE":
      case "ELLIPSE":
        return await htmlContainer(node, "", [], settings);
      case "GROUP":
        return await htmlGroup(node, settings);
      case "FRAME":
      case "COMPONENT":
      case "INSTANCE":
      case "COMPONENT_SET":
      case "SLOT":
        return await htmlFrame(node, settings);
      case "SECTION":
        return await htmlSection(node, settings);
      case "TEXT":
        return htmlText(node, settings);
      case "LINE":
        return htmlLine(node, settings);
      case "VECTOR":
        if (!settings.embedVectors && !isPreviewGlobal) {
          addWarning("Vector is not supported");
        }
        return await htmlContainer(
          __spreadProps(__spreadValues({}, node), { type: "RECTANGLE" }),
          "",
          [],
          settings
        );
      default:
        addWarning(`${node.type} node is not supported`);
        return "";
    }
  };
  var htmlWrapSVG = (node, settings) => {
    var _a;
    if (node.svg === "") return "";
    const builder = new HtmlDefaultBuilder(node, settings).addData("svg-wrapper").position();
    return `
<div${builder.build()}>
${indentString((_a = node.svg) != null ? _a : "")}</div>`;
  };
  var htmlGroup = async (node, settings) => {
    if (node.width < 0 || node.height <= 0 || node.children.length === 0) {
      return "";
    }
    const builder = new HtmlDefaultBuilder(node, settings).commonPositionStyles();
    if (builder.styles) {
      const attr = builder.build();
      const generator = await htmlWidgetGenerator(node.children, settings);
      return `
<div${attr}>${indentString(generator)}
</div>`;
    }
    return await htmlWidgetGenerator(node.children, settings);
  };
  var htmlText = (node, settings) => {
    var _a;
    let layoutBuilder = new HtmlTextBuilder(node, settings).commonPositionStyles().textTrim().textAlignHorizontal().textAlignVertical();
    const styledHtml = layoutBuilder.getTextSegments(node);
    previousExecutionCache4.push(...styledHtml);
    const mode = settings.htmlGenerationMode || "html";
    if (mode === "styled-components") {
      layoutBuilder.build();
      const wrapperComponentName = ((_a = cssCollection[layoutBuilder.cssClassName]) == null ? void 0 : _a.componentName) || "div";
      const content2 = styledHtml.map((style) => {
        const tag = style.openTypeFeatures.SUBS === true ? "sub" : style.openTypeFeatures.SUPS === true ? "sup" : "span";
        if (style.componentName) {
          return `<${style.componentName}>${style.text}</${style.componentName}>`;
        }
        return `<${tag}>${style.text}</${tag}>`;
      }).join("");
      return `
<${wrapperComponentName}>${content2}</${wrapperComponentName}>`;
    }
    let content = "";
    if (styledHtml.length === 1) {
      if (mode === "html" || mode === "jsx") {
        layoutBuilder.addStyles(styledHtml[0].style);
      }
      content = styledHtml[0].text;
      const additionalTag = styledHtml[0].openTypeFeatures.SUBS === true ? "sub" : styledHtml[0].openTypeFeatures.SUPS === true ? "sup" : "";
      if (additionalTag) {
        content = `<${additionalTag}>${content}</${additionalTag}>`;
      } else if (mode === "svelte" && styledHtml[0].className) {
        content = `<span class="${styledHtml[0].className}">${content}</span>`;
      }
    } else {
      content = styledHtml.map((style) => {
        const tag = style.openTypeFeatures.SUBS === true ? "sub" : style.openTypeFeatures.SUPS === true ? "sup" : "span";
        if (mode === "svelte" && style.className) {
          return `<span class="${style.className}">${style.text}</span>`;
        }
        return `<${tag} style="${style.style}">${style.text}</${tag}>`;
      }).join("");
    }
    return `
<div${layoutBuilder.build()}>${content}</div>`;
  };
  var htmlFrame = async (node, settings) => {
    const childrenStr = await htmlWidgetGenerator(node.children, settings);
    if (node.layoutMode !== "NONE") {
      const rowColumn = htmlAutoLayoutProps(node, settings);
      return await htmlContainer(node, childrenStr, rowColumn, settings);
    }
    return await htmlContainer(node, childrenStr, [], settings);
  };
  var htmlContainer = async (node, children, additionalStyles = [], settings) => {
    var _a;
    if (node.width <= 0 || node.height <= 0) {
      return children;
    }
    const builder = new HtmlDefaultBuilder(node, settings).commonPositionStyles().commonShapeStyles();
    if (builder.styles || additionalStyles) {
      let tag = "div";
      let src = "";
      if (nodeHasImageFill(node)) {
        const altNode = node;
        const hasChildren = "children" in node && node.children.length > 0;
        let imgUrl = "";
        if (settings.embedImages && settings.framework === "HTML") {
          imgUrl = (_a = await exportNodeAsBase64PNG(altNode, hasChildren)) != null ? _a : "";
        } else {
          imgUrl = getPlaceholderImage(node.width, node.height);
        }
        if (hasChildren) {
          builder.addStyles(
            formatWithJSX(
              "background-image",
              settings.htmlGenerationMode === "jsx",
              `url(${imgUrl})`
            )
          );
        } else {
          tag = "img";
          src = ` src="${imgUrl}"`;
        }
      }
      const build = builder.build(additionalStyles);
      const mode = settings.htmlGenerationMode || "html";
      if (mode === "styled-components" && builder.cssClassName) {
        const componentName = cssCollection[builder.cssClassName].componentName;
        if (componentName) {
          if (children) {
            return `
<${componentName}>${indentString(children)}
</${componentName}>`;
          } else {
            return `
<${componentName} ${src}/>`;
          }
        }
      }
      if (children) {
        return `
<${tag}${build}${src}>${indentString(children)}
</${tag}>`;
      } else if (selfClosingTags.includes(tag) || settings.htmlGenerationMode === "jsx") {
        return `
<${tag}${build}${src} />`;
      } else {
        return `
<${tag}${build}${src}></${tag}>`;
      }
    }
    return children;
  };
  var htmlSection = async (node, settings) => {
    const childrenStr = await htmlWidgetGenerator(node.children, settings);
    const builder = new HtmlDefaultBuilder(node, settings).size().position().applyFillsToStyle(node.fills, "background");
    if (childrenStr) {
      return `
<div${builder.build()}>${indentString(childrenStr)}
</div>`;
    } else {
      return `
<div${builder.build()}></div>`;
    }
  };
  var htmlLine = (node, settings) => {
    const builder = new HtmlDefaultBuilder(node, settings).commonPositionStyles().commonShapeStyles();
    return `
<div${builder.build()}></div>`;
  };

  // FigmaToCode/packages/backend/src/swiftui/builderImpl/swiftuiEffects.ts
  var swiftuiShadow = (node) => {
    if (!("effects" in node) || node.effects.length === 0) {
      return null;
    }
    const dropShadow = node.effects.filter(
      (d) => d.type === "DROP_SHADOW" && d.visible
    );
    if (dropShadow.length === 0) {
      return null;
    }
    const shadow = dropShadow[0];
    let comp = [];
    const color2 = shadow.color;
    const a = numberToFixedString(color2.a);
    const r = numberToFixedString(color2.r);
    const g = numberToFixedString(color2.g);
    const b = numberToFixedString(color2.b);
    comp.push(`color: Color(red: ${r}, green: ${g}, blue: ${b}, opacity: ${a})`);
    comp.push(`radius: ${numberToFixedString(shadow.radius)}`);
    const x = shadow.offset.x > 0 ? `x: ${numberToFixedString(shadow.offset.x)}` : "";
    const y = shadow.offset.y > 0 ? `y: ${numberToFixedString(shadow.offset.y)}` : "";
    if (x && y) {
      comp.push(x, y);
    } else {
      if (x) {
        comp.push(x);
      } else if (y) {
        comp.push(y);
      }
    }
    return ["shadow", comp.join(", ")];
  };
  var swiftuiBlur = (node) => {
    if (!("effects" in node) || node.effects.length === 0) {
      return null;
    }
    const layerBlur = node.effects.filter(
      (d) => d.type === "LAYER_BLUR" && d.visible
    );
    if (layerBlur.length === 0) {
      return null;
    }
    const blur2 = layerBlur[0].radius;
    return ["blur", `radius: ${numberToFixedString(blur2)})`];
  };

  // FigmaToCode/packages/backend/src/swiftui/builderImpl/swiftuiColor.ts
  var swiftUISolidColor = (fill) => {
    var _a, _b;
    if (fill && fill.type === "SOLID") {
      return swiftuiColor(fill.color, (_a = fill.opacity) != null ? _a : 1);
    } else if (fill && (fill.type === "GRADIENT_LINEAR" || fill.type === "GRADIENT_ANGULAR" || fill.type === "GRADIENT_RADIAL")) {
      if (fill.gradientStops.length > 0) {
        return swiftuiColor(fill.gradientStops[0].color, (_b = fill.opacity) != null ? _b : 1);
      }
    }
    return "";
  };
  var swiftuiSolidColor = (node, propertyPath) => {
    let fills;
    fills = node[propertyPath];
    return swiftuiSolidColorFromDirectFills(fills);
  };
  var swiftuiSolidColorFromDirectFills = (fills) => {
    var _a;
    const fill = retrieveTopFill(fills);
    if (fill && fill.type === "SOLID") {
      const opacity2 = (_a = fill.opacity) != null ? _a : 1;
      return swiftuiColor(fill.color, opacity2);
    } else if ((fill == null ? void 0 : fill.type) === "GRADIENT_LINEAR") {
      return swiftuiRGBAColor(fill.gradientStops[0].color);
    } else if ((fill == null ? void 0 : fill.type) === "IMAGE") {
      return swiftuiColor(
        {
          r: 0.5,
          g: 0.23,
          b: 0.27
        },
        0.5
      );
    }
    return "";
  };
  var swiftuiRGBAColor = (color2) => swiftuiColor(color2, color2.a);
  var swiftuiColor = (color2, opacity2) => {
    if (color2.r + color2.g + color2.b === 0 && opacity2 === 1) {
      return ".black";
    }
    if (color2.r + color2.g + color2.b === 3 && opacity2 === 1) {
      return ".white";
    }
    const r = `red: ${numberToFixedString(color2.r)}`;
    const g = `green: ${numberToFixedString(color2.g)}`;
    const b = `blue: ${numberToFixedString(color2.b)}`;
    const opacityAttr = opacity2 !== 1 ? `.opacity(${numberToFixedString(opacity2)})` : "";
    return `Color(${r}, ${g}, ${b})${opacityAttr}`;
  };

  // FigmaToCode/packages/backend/src/swiftui/builderImpl/swiftuiParser.ts
  var SwiftUIElement = class _SwiftUIElement {
    constructor(element = "", modifiers = []) {
      this.element = element;
      this.modifiers = modifiers;
    }
    addModifierMixed(property, value) {
      this.modifiers.push([property, value]);
      return this;
    }
    addModifier(modifier) {
      if (modifier && modifier[0] !== null && modifier[1] !== null) {
        this.modifiers.push([modifier[0], modifier[1]]);
      }
      return this;
    }
    addChildElement(element, ...modifiers) {
      const childModifiers = modifiers.length === 1 ? modifiers[0] : modifiers;
      return this.addModifierMixed(element, childModifiers);
    }
    buildModifierLines(indentLevel) {
      const indent = " ".repeat(indentLevel);
      return this.modifiers.map(
        ([property, value]) => Array.isArray(value) ? `${indent}.${property}(${new _SwiftUIElement(
          property,
          value
        ).toString().trim()})` : value.length > 60 ? `${indent}.${property}(
${indentString(
          value,
          indentLevel + 2
        )}
${indent})` : `${indent}.${property}(${value})`
      ).join("\n");
    }
    toString(indentLevel = 0) {
      if (this.modifiers.length === 0) {
        return this.element;
      }
      const modifierLines = this.buildModifierLines(indentLevel + 2);
      return indentString(`${this.element}
${modifierLines}`, 0);
    }
  };

  // FigmaToCode/packages/backend/src/swiftui/builderImpl/swiftuiBorder.ts
  var swiftUIStroke = (node) => {
    if (!("strokes" in node) || !node.strokes || node.strokes.length === 0) {
      return 0;
    }
    const stroke = commonStroke(node, 2);
    if (!stroke) {
      return 0;
    }
    if ("all" in stroke) {
      return stroke.all;
    }
    return Math.max(stroke.left, stroke.top, stroke.right, stroke.bottom);
  };
  var swiftuiBorder = (node) => {
    if (!("strokes" in node) || !node.strokes || node.strokes.length === 0) {
      return null;
    }
    const width = swiftUIStroke(node);
    const inset = strokeInset(node, width);
    if (!width) {
      return null;
    }
    return node.strokes.map((stroke) => {
      const strokeColor = swiftUISolidColor(stroke);
      const strokeModifier = [
        "stroke",
        `${strokeColor}, lineWidth: ${numberToFixedString(width)}`
      ];
      if (strokeColor) {
        return new SwiftUIElement(getViewType(node)).addModifier(inset).addModifier(strokeModifier).toString();
      }
      return null;
    }).filter((d) => d !== null);
  };
  var getViewType = (node) => {
    if (node.type === "ELLIPSE") {
      return "Ellipse()";
    }
    const corner = swiftuiCornerRadius(node);
    if (corner) {
      return `RoundedRectangle(cornerRadius: ${corner})`;
    } else {
      return "Rectangle()";
    }
  };
  var strokeInset = (node, width) => {
    switch (node.strokeAlign) {
      case "INSIDE":
        return ["inset", `by: ${numberToFixedString(width)}`];
      case "OUTSIDE":
        return ["inset", `by: -${numberToFixedString(width)}`];
      case "CENTER":
        return ["inset", null];
    }
  };
  var swiftuiCornerRadius = (node) => {
    const radius = getCommonRadius(node);
    if ("all" in radius) {
      if (radius.all > 0) {
        return numberToFixedString(radius.all);
      } else {
        return "";
      }
    }
    const maxBorder = Math.max(
      radius.topLeft,
      radius.topRight,
      radius.bottomLeft,
      radius.bottomRight
    );
    if (maxBorder > 0) {
      return numberToFixedString(maxBorder);
    }
    return "";
  };

  // FigmaToCode/packages/backend/src/swiftui/builderImpl/swiftuiPadding.ts
  var swiftuiPadding = (node) => {
    if (!("layoutMode" in node)) {
      return null;
    }
    const padding = commonPadding(node);
    if (!padding) {
      return null;
    }
    if ("all" in padding) {
      if (padding.all === 0) {
        return null;
      }
      return ["padding", numberToFixedString(padding.all)];
    }
    if ("horizontal" in padding) {
      const vertical = numberToFixedString(padding.vertical);
      const horizontal = numberToFixedString(padding.horizontal);
      return [
        "padding",
        `EdgeInsets(top: ${vertical}, leading: ${horizontal}, bottom: ${vertical}, trailing: ${horizontal})`
      ];
    }
    const top = numberToFixedString(padding.top);
    const left = numberToFixedString(padding.left);
    const bottom = numberToFixedString(padding.bottom);
    const right = numberToFixedString(padding.right);
    return [
      "padding",
      `EdgeInsets(top: ${top}, leading: ${left}, bottom: ${bottom}, trailing: ${right})`
    ];
  };

  // FigmaToCode/packages/backend/src/swiftui/builderImpl/swiftuiSize.ts
  var swiftuiSize = (node) => {
    const size = nodeSize(node);
    const constraintProps = [];
    let width = "";
    let height = "";
    if (typeof size.width === "number") {
      width = `width: ${numberToFixedString(size.width)}`;
    }
    if (typeof size.height === "number") {
      height = `height: ${numberToFixedString(size.height)}`;
    }
    if (node.minWidth !== void 0 && node.minWidth !== null) {
      constraintProps.push(`minWidth: ${numberToFixedString(node.minWidth)}`);
    }
    if (node.maxWidth !== void 0 && node.maxWidth !== null) {
      constraintProps.push(`maxWidth: ${numberToFixedString(node.maxWidth)}`);
    }
    if (node.minHeight !== void 0 && node.minHeight !== null) {
      constraintProps.push(`minHeight: ${numberToFixedString(node.minHeight)}`);
    }
    if (node.maxHeight !== void 0 && node.maxHeight !== null) {
      constraintProps.push(`maxHeight: ${numberToFixedString(node.maxHeight)}`);
    }
    return {
      width,
      height,
      constraints: constraintProps
    };
  };

  // FigmaToCode/packages/backend/src/swiftui/builderImpl/swiftuiBlend.ts
  var swiftuiOpacity = (node) => {
    if (node.opacity !== void 0 && node.opacity !== 1) {
      return ["opacity", numberToFixedString(node.opacity)];
    }
    return null;
  };
  var swiftuiVisibility = (node) => {
    if (node.visible !== void 0 && !node.visible) {
      return ["hidden", ""];
    }
    return null;
  };
  var swiftuiRotation = (node) => {
    const rotation = (node.rotation || 0) + (node.cumulativeRotation || 0);
    if (Math.round(rotation) !== 0) {
      return ["rotationEffect", `.degrees(${numberToFixedString(rotation)})`];
    }
    return null;
  };
  var swiftuiBlendMode = (node) => {
    const fromBlendEnum = blendModeEnum(node);
    if (fromBlendEnum) {
      return ["blendMode", fromBlendEnum];
    }
    return null;
  };
  var blendModeEnum = (node) => {
    switch (node.blendMode) {
      case "COLOR":
        return ".color";
      case "COLOR_BURN":
        return ".colorBurn";
      case "COLOR_DODGE":
        return ".colorDodge";
      case "DIFFERENCE":
        return ".difference";
      case "EXCLUSION":
        return ".exclusion";
      case "HARD_LIGHT":
        return ".hardLight";
      case "HUE":
        return ".hue";
      case "LIGHTEN":
        return ".lighten";
      case "LUMINOSITY":
        return ".luminosity";
      case "MULTIPLY":
        return ".multiply";
      case "OVERLAY":
        return ".overlay";
      case "SATURATION":
        return ".saturation";
      case "SCREEN":
        return ".screen";
      case "SOFT_LIGHT":
        return ".softLight";
      default:
        return "";
    }
  };

  // FigmaToCode/packages/backend/src/swiftui/swiftuiDefaultBuilder.ts
  var SwiftuiDefaultBuilder = class {
    constructor(kind = "") {
      this.element = new SwiftUIElement(kind);
    }
    pushModifier(...args) {
      args.forEach((modifier) => {
        if (modifier) {
          this.element.addModifier(modifier);
        }
      });
    }
    commonPositionStyles(node) {
      this.position(node);
      if ("layoutAlign" in node && "opacity" in node) {
        this.blend(node);
      }
      return this;
    }
    blend(node) {
      this.pushModifier(
        swiftuiVisibility(node),
        swiftuiRotation(node),
        swiftuiOpacity(node),
        swiftuiBlendMode(node)
      );
      return this;
    }
    topLeftToCenterOffset(x, y, node, parent) {
      if (!parent || !("width" in parent)) {
        return { centerX: 0, centerY: 0 };
      }
      const centerX = x + node.width / 2;
      const centerY = y + node.height / 2;
      const centerBasedX = centerX - parent.width / 2;
      const centerBasedY = centerY - parent.height / 2;
      return { centerX: centerBasedX, centerY: centerBasedY };
    }
    position(node) {
      if (commonIsAbsolutePosition(node)) {
        const { x, y } = getCommonPositionValue(node);
        const { centerX, centerY } = this.topLeftToCenterOffset(
          x,
          y,
          node,
          node.parent
        );
        this.pushModifier([
          `offset`,
          `x: ${numberToFixedString(centerX)}, y: ${numberToFixedString(centerY)}`
        ]);
      }
      return this;
    }
    shapeBorder(node) {
      const borders = swiftuiBorder(node);
      if (borders) {
        borders.forEach((border2) => {
          this.element.addModifierMixed("overlay", border2);
        });
      }
      return this;
    }
    shapeBackground(node) {
      if ("fills" in node) {
        const background = swiftuiSolidColor(node, "fills");
        if (background) {
          this.pushModifier([`background`, background]);
        }
      }
      return this;
    }
    shapeForeground(node) {
      if (!("children" in node) || node.children.length === 0) {
        this.pushModifier([`foregroundColor`, ".clear"]);
      }
      return this;
    }
    cornerRadius(node) {
      const corner = swiftuiCornerRadius(node);
      if (corner) {
        this.pushModifier([`cornerRadius`, corner]);
      }
      return this;
    }
    effects(node) {
      if (node.type === "GROUP") {
        return this;
      }
      this.pushModifier(swiftuiBlur(node), swiftuiShadow(node));
      return this;
    }
    size(node) {
      const { width, height, constraints } = swiftuiSize(node);
      if (width || height) {
        this.pushModifier([`frame`, [width, height].filter(Boolean).join(", ")]);
      }
      if (constraints.length > 0) {
        this.pushModifier([`frame`, constraints.join(", ")]);
      }
      return this;
    }
    autoLayoutPadding(node) {
      if ("paddingLeft" in node) {
        this.pushModifier(swiftuiPadding(node));
      }
      return this;
    }
    build(indentLevel = 0) {
      return this.element.toString(indentLevel);
    }
  };

  // FigmaToCode/packages/backend/src/swiftui/builderImpl/swiftuiTextWeight.ts
  var swiftuiWeightMatcher = (weight) => {
    switch (weight) {
      case 100:
        return ".ultraLight";
      case 200:
        return ".thin";
      case 300:
        return ".light";
      case 400:
        return ".regular";
      case 500:
        return ".medium";
      case 600:
        return ".semibold";
      case 700:
        return ".bold";
      case 800:
        return ".heavy";
      case 900:
        return ".black";
      default:
        return "";
    }
  };

  // FigmaToCode/packages/backend/src/swiftui/swiftuiTextBuilder.ts
  var SwiftuiTextBuilder = class extends SwiftuiDefaultBuilder {
    constructor(kind = "Text") {
      super(kind);
      this.modifiers = [];
      this.textStyle2 = (node) => {
        if (node.textAutoResize !== "WIDTH_AND_HEIGHT") {
          if (node.textAlignHorizontal === "CENTER") {
            this.modifiers.push(".multilineTextAlignment(.center)");
          } else if (node.textAlignHorizontal === "RIGHT") {
            this.modifiers.push(".multilineTextAlignment(.trailing)");
          }
        }
        return this;
      };
      this.letterSpacing = (letterSpacing2, fontSize2) => {
        const value = commonLetterSpacing(letterSpacing2, fontSize2);
        if (value > 0) {
          return numberToFixedString(value);
        }
        return null;
      };
      // the difference between kerning and tracking is that tracking spaces everything, kerning keeps lignatures,
      // Figma spaces everything, so we are going to use tracking.
      this.lineHeight = (lineHeight2, fontSize2) => {
        const value = commonLineHeight(lineHeight2, fontSize2);
        if (value > 0) {
          return numberToFixedString(value);
        }
        return null;
      };
      this.wrapTextAutoResize = (node) => {
        const { width, height, constraints } = swiftuiSize(node);
        let comp = [];
        switch (node.textAutoResize) {
          case "WIDTH_AND_HEIGHT":
            break;
          case "HEIGHT":
            comp.push(width);
            break;
          case "NONE":
          case "TRUNCATE":
            comp.push(width, height);
            break;
        }
        comp.push(...constraints);
        if (comp.length > 0) {
          const align = this.textAlignment(node);
          return `.frame(${comp.join(", ")}${align})`;
        }
        return "";
      };
      // SwiftUI has two alignments for Text, when it is a single line and when it is multiline. This one is for single line.
      this.textAlignment = (node) => {
        let hAlign = "";
        if (node.textAlignHorizontal === "LEFT") {
          hAlign = "leading";
        } else if (node.textAlignHorizontal === "RIGHT") {
          hAlign = "trailing";
        }
        let vAlign = "";
        if (node.textAlignVertical === "TOP") {
          vAlign = "top";
        } else if (node.textAlignVertical === "BOTTOM") {
          vAlign = "bottom";
        }
        if (hAlign && !vAlign) {
          return `, alignment: .${hAlign}`;
        } else if (!hAlign && vAlign) {
          return `, alignment: .${vAlign}`;
        } else if (hAlign && vAlign) {
          const hAlignUpper = hAlign.charAt(0).toUpperCase() + hAlign.slice(1);
          return `, alignment: .${vAlign}${hAlignUpper}`;
        }
        return "";
      };
      this.textBlur = () => {
        if (this.node && this.node.effects) {
          const blurEffect = this.node.effects.find(
            (effect) => effect.type === "LAYER_BLUR" && effect.visible !== false && effect.radius > 0
          );
          if (blurEffect) {
            return `.blur(radius: ${blurEffect.radius})`;
          }
        }
        return "";
      };
      this.textShadow = () => {
        if (this.node && this.node.effects) {
          const dropShadow = this.node.effects.find(
            (effect) => effect.type === "DROP_SHADOW" && effect.visible !== false
          );
          if (dropShadow) {
            const ds = dropShadow;
            const offsetX = Math.round(ds.offset.x);
            const offsetY = Math.round(ds.offset.y);
            const blurRadius = Math.round(ds.radius);
            return `.shadow(color: Color(red: ${ds.color.r.toFixed(
              2
            )}, green: ${ds.color.g.toFixed(2)}, blue: ${ds.color.b.toFixed(
              2
            )}, opacity: ${ds.color.a.toFixed(
              2
            )}), radius: ${blurRadius}, x: ${offsetX}, y: ${offsetY})`;
          }
        }
        return "";
      };
    }
    reset() {
      this.modifiers = [];
    }
    textAutoSize(node) {
      this.modifiers.push(this.wrapTextAutoResize(node));
      return this;
    }
    textDecoration(textDecoration) {
      switch (textDecoration) {
        case "UNDERLINE":
          return "underline";
        case "STRIKETHROUGH":
          return "strikethrough";
        case "NONE":
          return null;
      }
    }
    textColor(fills) {
      const fillColor = swiftuiSolidColorFromDirectFills(fills);
      if (fillColor) {
        return fillColor;
      }
      return "";
    }
    textStyle(style) {
      if (style.toLowerCase().match("italic")) {
        return "italic";
      }
      return null;
    }
    fontWeight(fontWeight2) {
      if (fontWeight2 !== 400) {
        const weight = swiftuiWeightMatcher(fontWeight2);
        return `.weight(${weight})`;
      }
      return "";
    }
    createText(node) {
      var _a, _b, _c;
      this.node = node;
      let alignHorizontal = (_c = (_b = (_a = node.textAlignHorizontal) == null ? void 0 : _a.toString()) == null ? void 0 : _b.toLowerCase()) != null ? _c : "left";
      alignHorizontal = alignHorizontal === "justified" ? "justify" : alignHorizontal;
      const segments = this.getTextSegments(node, node.characters);
      if (segments) {
        this.element = segments;
      } else {
        this.element = new SwiftUIElement("Text()");
      }
      return this;
    }
    getTextSegments(node, characters) {
      const segments = node.styledTextSegments;
      if (!segments) {
        return null;
      }
      const segment = segments[0];
      const fontSize2 = numberToFixedString(segment.fontSize);
      const fontFamily2 = segment.fontName.family;
      const fontWeight2 = this.fontWeight(segment.fontWeight);
      const lineHeight2 = this.lineHeight(segment.lineHeight, segment.fontSize);
      const letterSpacing2 = this.letterSpacing(
        segment.letterSpacing,
        segment.fontSize
      );
      let updatedText = parseTextAsCode(characters);
      if (segment.textCase === "LOWER") {
        updatedText = characters.toLowerCase();
      } else if (segment.textCase === "UPPER") {
        updatedText = characters.toUpperCase();
      }
      const element = new SwiftUIElement(
        `Text(${parseTextAsCode(`"${characters}"`)})`
      ).addModifier([
        "font",
        `Font.custom("${fontFamily2}", size: ${fontSize2})${fontWeight2 ? `${fontWeight2}` : ""}`
      ]).addModifier(["tracking", letterSpacing2]).addModifier(["lineSpacing", lineHeight2]).addModifier([this.textDecoration(segment.textDecoration), ""]).addModifier([this.textStyle(segment.fontName.style), ""]).addModifier(["foregroundColor", this.textColor(segment.fills)]);
      const blurMod = this.textBlur();
      if (blurMod !== "") {
        element.addModifier([blurMod, ""]);
      }
      const shadowMod = this.textShadow();
      if (shadowMod !== "") {
        element.addModifier([shadowMod, ""]);
      }
      return element;
    }
  };

  // FigmaToCode/packages/backend/src/swiftui/swiftuiMain.ts
  var localSettings3;
  var previousExecutionCache5;
  var getStructTemplate = (name, injectCode) => `struct ${name}: View {
  var body: some View {
    ${indentString(injectCode, 4).trimStart()};
  }
}`;
  var getPreviewTemplate = (name, injectCode) => `import SwiftUI

struct ContentView: View {
  var body: some View {
    ${indentString(injectCode, 4).trimStart()};
  }
}

struct ContentView_Previews: PreviewProvider {
  static var previews: some View {
    ContentView()
  }
}`;
  var swiftuiMain = (sceneNode, settings) => {
    localSettings3 = settings;
    previousExecutionCache5 = [];
    let result = swiftuiWidgetGenerator(sceneNode, 0);
    switch (localSettings3.swiftUIGenerationMode) {
      case "snippet":
        return result;
      case "struct":
        return getStructTemplate(stringToClassName(sceneNode[0].name), result);
      case "preview":
        return getPreviewTemplate(stringToClassName(sceneNode[0].name), result);
    }
    if (result.length > 0 && result.startsWith("\n")) {
      result = result.slice(1, result.length);
    }
    return result;
  };
  var swiftuiWidgetGenerator = (sceneNode, indentLevel) => {
    const visibleSceneNode = getVisibleNodes(sceneNode);
    let comp = [];
    visibleSceneNode.forEach((node) => {
      switch (node.type) {
        case "RECTANGLE":
        case "ELLIPSE":
        case "LINE":
          comp.push(swiftuiContainer(node));
          break;
        case "GROUP":
        case "SECTION":
          comp.push(swiftuiGroup(node, indentLevel));
          break;
        case "FRAME":
        case "INSTANCE":
        case "COMPONENT":
        case "COMPONENT_SET":
        case "SLOT":
          comp.push(swiftuiFrame(node, indentLevel));
          break;
        case "TEXT":
          comp.push(swiftuiText(node));
          break;
        case "VECTOR":
          addWarning("VectorNodes are not supported in SwiftUI");
          break;
        case "SLICE":
        default:
          break;
      }
    });
    return comp.join("\n");
  };
  var swiftuiContainer = (node, stack = "") => {
    if (node.width < 0 || node.height < 0) {
      return stack;
    }
    let kind = "";
    if (node.type === "RECTANGLE" || node.type === "LINE") {
      kind = "Rectangle()";
    } else if (node.type === "ELLIPSE") {
      kind = "Ellipse()";
    } else {
      kind = stack;
    }
    const result = new SwiftuiDefaultBuilder(kind).shapeForeground(node).autoLayoutPadding(node).size(node).shapeBackground(node).cornerRadius(node).shapeBorder(node).commonPositionStyles(node).effects(node).build(kind === stack ? -2 : 0);
    return result;
  };
  var swiftuiGroup = (node, indentLevel) => {
    const children = widgetGeneratorWithLimits(node, indentLevel);
    return swiftuiContainer(
      node,
      children ? generateSwiftViewCode("ZStack", {}, children) : `ZStack() { }`
    );
  };
  var swiftuiText = (node) => {
    const result = new SwiftuiTextBuilder().createText(node);
    previousExecutionCache5.push(result.build());
    return result.commonPositionStyles(node).build();
  };
  var swiftuiFrame = (node, indentLevel) => {
    const children = widgetGeneratorWithLimits(
      node,
      node.children.length > 1 ? indentLevel + 1 : indentLevel
    );
    const anyStack = createDirectionalStack(children, node);
    return swiftuiContainer(node, anyStack);
  };
  var createDirectionalStack = (children, inferredAutoLayout) => {
    if (inferredAutoLayout.layoutMode !== "NONE") {
      return generateSwiftViewCode(
        inferredAutoLayout.layoutMode === "HORIZONTAL" ? "HStack" : "VStack",
        {
          alignment: getLayoutAlignment(inferredAutoLayout),
          spacing: getSpacing(inferredAutoLayout)
        },
        children
      );
    } else {
      return generateSwiftViewCode("ZStack", {}, children);
    }
  };
  var getLayoutAlignment = (inferredAutoLayout) => {
    switch (inferredAutoLayout.counterAxisAlignItems) {
      case "MIN":
        return inferredAutoLayout.layoutMode === "VERTICAL" ? ".leading" : ".top";
      case "MAX":
        return inferredAutoLayout.layoutMode === "VERTICAL" ? ".trailing" : ".bottom";
      case "BASELINE":
        return ".firstTextBaseline";
      case "CENTER":
        return "";
    }
  };
  var getSpacing = (inferredAutoLayout) => {
    const defaultSpacing = 10;
    return Math.round(inferredAutoLayout.itemSpacing) !== defaultSpacing ? inferredAutoLayout.itemSpacing : defaultSpacing;
  };
  var generateSwiftViewCode = (className, properties, children) => {
    const propertiesArray = Object.entries(properties).filter(([, value]) => value !== "").map(
      ([key, value]) => `${key}: ${typeof value === "number" ? numberToFixedString(value) : value}`
    );
    const compactPropertiesArray = propertiesArray.join(", ");
    if (compactPropertiesArray.length > 60) {
      const formattedProperties = propertiesArray.join(",\n");
      return `${className}(
${formattedProperties}
) {${indentString(
        children
      )}
}`;
    }
    return `${className}(${compactPropertiesArray}) {
${indentString(
      children
    )}
}`;
  };
  var widgetGeneratorWithLimits = (node, indentLevel) => {
    if (node.children.length < 10) {
      return swiftuiWidgetGenerator(node.children, indentLevel);
    }
    const chunk = 10;
    let strBuilder = "";
    const slicedChildren = node.children.slice(0, 100);
    if (node.children.length > 100) {
      strBuilder += `
// SwiftUI has a 10 item limit in Stacks. By grouping them, it can grow even more. 
// It seems, however, that you have more than 100 items at the same level. Wow!
// This is not yet supported; Limiting to the first 100 items...`;
    }
    for (let i = 0, j = slicedChildren.length; i < j; i += chunk) {
      const chunkChildren = slicedChildren.slice(i, i + chunk);
      const strChildren = swiftuiWidgetGenerator(chunkChildren, indentLevel);
      strBuilder += `Group {
${indentString(strChildren)}
}`;
    }
    return strBuilder;
  };

  // FigmaToCode/packages/backend/src/common/retrieveUI/convertToCode.ts
  var convertToCode = async (nodes, settings) => {
    switch (settings.framework) {
      case "Tailwind":
        return await tailwindMain(nodes, settings);
      case "Flutter":
        return await flutterMain(nodes, settings);
      case "SwiftUI":
        return await swiftuiMain(nodes, settings);
      case "Compose":
        return composeMain(nodes, settings);
      case "HTML":
      default:
        return (await htmlMain(nodes, settings)).html;
    }
  };

  // src/claude_mcp_plugin/figma-to-code-adapter.js
  var DEFAULT_SETTINGS = {
    framework: "HTML",
    showLayerNames: false,
    useOldPluginVersion2025: false,
    responsiveRoot: false,
    flutterGenerationMode: "snippet",
    swiftUIGenerationMode: "snippet",
    composeGenerationMode: "snippet",
    roundTailwindValues: true,
    roundTailwindColors: true,
    useColorVariables: true,
    customTailwindPrefix: "",
    embedImages: false,
    embedVectors: false,
    htmlGenerationMode: "html",
    tailwindGenerationMode: "jsx",
    baseFontSize: 16,
    useTailwind4: true,
    thresholdPercent: 15,
    baseFontFamily: "",
    fontFamilyCustomConfig: {}
  };
  var FRAMEWORKS = {
    html: "HTML",
    tailwind: "Tailwind",
    flutter: "Flutter",
    swiftui: "SwiftUI",
    swift_ui: "SwiftUI",
    compose: "Compose"
  };
  function normalizeFramework(value) {
    if (!value) return DEFAULT_SETTINGS.framework;
    const key = String(value).replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const normalized = FRAMEWORKS[key] || FRAMEWORKS[key.replace(/_/g, "")];
    if (!normalized) {
      throw new Error(`Unsupported framework: ${value}`);
    }
    return normalized;
  }
  function countNodes(nodes) {
    let count = 0;
    const stack = [...nodes];
    while (stack.length > 0) {
      const node = stack.pop();
      count += 1;
      if ("children" in node && Array.isArray(node.children)) {
        for (const child of node.children) {
          stack.push(child);
        }
      }
    }
    return count;
  }
  function nodeSummary(nodes) {
    return nodes.map((node) => ({
      id: node.id,
      name: node.name,
      type: node.type
    }));
  }
  async function resolveNodes(params) {
    if (Array.isArray(params == null ? void 0 : params.nodeIds) && params.nodeIds.length > 0) {
      const nodes = [];
      for (const nodeId of params.nodeIds) {
        const node = await figma.getNodeByIdAsync(nodeId);
        if (!node) {
          throw new Error(`Node not found with ID: ${nodeId}`);
        }
        if (!("visible" in node)) {
          throw new Error(`Node is not a scene node: ${nodeId}`);
        }
        nodes.push(node);
      }
      return nodes;
    }
    await figma.currentPage.loadAsync();
    return [...figma.currentPage.selection];
  }
  function buildSettings(params) {
    const overrides = (params == null ? void 0 : params.settings) && typeof params.settings === "object" ? params.settings : {};
    return __spreadProps(__spreadValues(__spreadValues({}, DEFAULT_SETTINGS), overrides), {
      framework: normalizeFramework((params == null ? void 0 : params.framework) || overrides.framework)
    });
  }
  async function convertFigmaToCode(params = {}) {
    resetPerformanceCounters();
    clearWarnings();
    const nodes = await resolveNodes(params);
    if (nodes.length === 0) {
      throw new Error("No Figma nodes selected. Select a node or pass nodeIds.");
    }
    const maxNodeCount = Number.isFinite(params.maxNodeCount) ? params.maxNodeCount : 4e3;
    const nodeCount = countNodes(nodes);
    if (nodeCount > maxNodeCount) {
      throw new Error(`Selection too large (${nodeCount} nodes). Maximum is ${maxNodeCount}.`);
    }
    const settings = buildSettings(params);
    const convertedSelection = settings.useOldPluginVersion2025 ? oldConvertNodesToAltNodes(nodes, null) : await nodesToJSON(nodes, settings);
    if (!convertedSelection.length) {
      throw new Error("FigmaToCode could not convert the selected nodes.");
    }
    const code = await convertToCode(convertedSelection, settings);
    return {
      framework: settings.framework,
      nodeCount,
      nodes: nodeSummary(nodes),
      code,
      warnings: [...warnings],
      settings
    };
  }
  return __toCommonJS(figma_to_code_adapter_exports);
})();


// This is the main code file for the Claude MCP Figma plugin
// It handles Figma API commands

// Safe color channel parser: returns a valid 0-1 number or NaN.
// Unlike `parseFloat(x) || 0`, this does NOT silently fall back to 0 (black).
function safeChannel(value) {
  if (value === undefined || value === null) return NaN;
  var n = typeof value === "number" ? value : parseFloat(value);
  return isNaN(n) ? NaN : Math.max(0, Math.min(1, n));
}

// Build a Figma paint from an {r, g, b, a?} color object.
function safePaint(color) {
  if (!color || typeof color !== "object") return null;
  var r = safeChannel(color.r);
  var g = safeChannel(color.g);
  var b = safeChannel(color.b);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  var a = safeChannel(color.a);
  return {
    type: "SOLID",
    color: { r: r, g: g, b: b },
    opacity: isNaN(a) ? 1 : a,
  };
}

// Plugin state
const state = {
  serverPort: 3055, // Default port
};

// Helper function for progress updates
function sendProgressUpdate(commandId, commandType, status, progress, totalItems, processedItems, message, payload = null) {
  const update = {
    type: 'command_progress',
    commandId,
    commandType,
    status,
    progress,
    totalItems,
    processedItems,
    message,
    timestamp: Date.now()
  };

  // Add optional chunk information if present
  if (payload) {
    if (payload.currentChunk !== undefined && payload.totalChunks !== undefined) {
      update.currentChunk = payload.currentChunk;
      update.totalChunks = payload.totalChunks;
      update.chunkSize = payload.chunkSize;
    }
    update.payload = payload;
  }

  // Send to UI
  figma.ui.postMessage(update);
  console.log(`Progress update: ${status} - ${progress}% - ${message}`);

  return update;
}

// Show UI
figma.showUI(__html__, { width: 300, height: 220 });

// Plugin commands from UI
figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case "update-settings":
      updateSettings(msg);
      break;
    case "notify":
      figma.notify(msg.message);
      break;
    case "close-plugin":
      figma.closePlugin();
      break;
    case "execute-command":
      // Execute commands received from UI (which gets them from WebSocket)
      console.log("[execute-command] Received:", msg.command, msg.id);
      try {
        const result = await handleCommand(msg.command, msg.params);
        console.log("[execute-command] Success:", msg.command, msg.id);
        // Send result back to UI
        figma.ui.postMessage({
          type: "command-result",
          id: msg.id,
          result,
        });
      } catch (error) {
        console.log("[execute-command] Error:", msg.command, error.message);
        figma.ui.postMessage({
          type: "command-error",
          id: msg.id,
          error: error.message || "Error executing command",
        });
      }
      break;
  }
};

// Listen for plugin commands from menu
figma.on("run", ({ command }) => {
  figma.ui.postMessage({ type: "auto-connect" });
});

// Update plugin settings
function updateSettings(settings) {
  if (settings.serverPort) {
    state.serverPort = settings.serverPort;
  }

  figma.clientStorage.setAsync("settings", {
    serverPort: state.serverPort,
  });
}

// Helper: safe node lookup using figma.getNodeByIdAsync.
// The original getNodeByIdAsync works fine — the bug was in ui.html's
// sendErrorResponse which dropped error messages (no type/channel fields).
// With that fixed, errors propagate correctly and timeouts are eliminated.
async function getNodeByIdSafe(nodeId) {
  if (!nodeId) return null;
  return await figma.getNodeByIdAsync(nodeId);
}

// Handle commands from UI
async function handleCommand(command, params) {
  switch (command) {
    case "ping":
      return { status: "ok" };
    case "get_document_info":
      return await getDocumentInfo();
    case "get_selection":
      return await getSelection();
    case "get_node_info":
      if (!params || !params.nodeId) {
        throw new Error("Missing nodeId parameter");
      }
      return await getNodeInfo(params.nodeId);
    case "get_nodes_info":
      if (!params || !params.nodeIds || !Array.isArray(params.nodeIds)) {
        throw new Error("Missing or invalid nodeIds parameter");
      }
      return await getNodesInfo(params.nodeIds);
    case "figma_to_code":
      return await figmaToCodeAdapter.convertFigmaToCode(params);
    case "create_rectangle":
      return await createRectangle(params);
    case "create_frame":
      return await createFrame(params);
    case "create_text":
      return await createText(params);
    case "set_fill_color":
      return await setFillColor(params);
    case "set_stroke_color":
      return await setStrokeColor(params);
    case "set_selection_colors":
      return await setSelectionColors(params);
    case "move_node":
      return await moveNode(params);
    case "resize_node":
      return await resizeNode(params);
    case "delete_node":
      return await deleteNode(params);
    case "get_styles":
      return await getStyles();
    case "get_local_components":
      return await getLocalComponents();
    // case "get_team_components":
    //   return await getTeamComponents();
    case "create_component_instance":
      return await createComponentInstance(params);
    case "export_node_as_image":
      return await exportNodeAsImage(params);
    case "set_corner_radius":
      return await setCornerRadius(params);
    case "set_text_content":
      return await setTextContent(params);
    case "clone_node":
      return await cloneNode(params);
    case "scan_text_nodes":
      return await scanTextNodes(params);
    case "set_multiple_text_contents":
      return await setMultipleTextContents(params);
    case "set_auto_layout":
      return await setAutoLayout(params);
    // Nuevos comandos para propiedades de texto
    case "set_font_name":
      return await setFontName(params);
    case "set_font_size":
      return await setFontSize(params);
    case "set_font_weight":
      return await setFontWeight(params);
    case "set_letter_spacing":
      return await setLetterSpacing(params);
    case "set_line_height":
      return await setLineHeight(params);
    case "set_paragraph_spacing":
      return await setParagraphSpacing(params);
    case "set_text_case":
      return await setTextCase(params);
    case "set_text_decoration":
      return await setTextDecoration(params);
    case "set_text_align":
      return await setTextAlign(params);
    case "get_styled_text_segments":
      return await getStyledTextSegments(params);
    case "load_font_async":
      return await loadFontAsyncWrapper(params);
    case "get_remote_components":
      return await getRemoteComponents(params);
    case "set_effects":
      return await setEffects(params);
    case "set_effect_style_id":
      return await setEffectStyleId(params);
    case "set_text_style_id":
      return await setTextStyleId(params);
    case "group_nodes":
      return await groupNodes(params);
    case "ungroup_nodes":
      return await ungroupNodes(params);
    case "flatten_node":
      return await flattenNode(params);
    case "insert_child":
      return await insertChild(params);
    case "create_ellipse":
      return await createEllipse(params);
    case "create_polygon":
      return await createPolygon(params);
    case "create_star":
      return await createStar(params);
    case "create_vector":
      return await createVector(params);
    case "create_line":
      return await createLine(params);
    case "create_component_from_node":
      return await createComponentFromNode(params);
    case "create_component_set":
      return await createComponentSet(params);
    case "set_instance_variant":
      return await setInstanceVariant(params);
    case "create_page":
      return await createPage(params);
    case "delete_page":
      return await deletePage(params);
    case "rename_page":
      return await renamePage(params);
    case "get_pages":
      return await getPages();
    case "set_current_page":
      return await setCurrentPage(params);
    case "rename_node":
      return await renameNode(params);
    case "set_image_fill":
      return await setImageFill(params);
    case "get_image_from_node":
      return await getImageFromNode(params);
    case "replace_image_fill":
      return await replaceImageFill(params);
    // COMMENTED OUT: get_image_bytes - Issues pending investigation
    // case "get_image_bytes":
    //   return await getImageBytes(params);
    case "apply_image_transform":
      return await applyImageTransform(params);
    case "set_image_filters":
      return await setImageFilters(params);
    case "rotate_node":
      return await rotateNode(params);
    case "set_node_properties":
      return await setNodeProperties(params);
    case "reorder_node":
      return await reorderNode(params);
    case "duplicate_page":
      return await duplicatePage(params);
    case "convert_to_frame":
      return await convertToFrame(params);
    case "set_gradient":
      return await setGradient(params);
    case "boolean_operation":
      return await booleanOperation(params);
    case "set_svg":
      return await setSvg(params);
    case "get_svg":
      return await getSvg(params);
    case "set_image":
      return await setImage(params);
    case "set_grid":
      return await setGrid(params);
    case "get_grid":
      return await getGrid(params);
    case "set_guide":
      return await setGuide(params);
    case "get_guide":
      return await getGuide(params);
    case "set_annotation":
      return await setAnnotation(params);
    case "get_annotation":
      return await getAnnotation(params);
    case "get_variables":
      return await getVariables(params);
    case "set_variable":
      return await setVariable(params);
    case "apply_variable_to_node":
      return await applyVariableToNode(params);
    case "switch_variable_mode":
      return await switchVariableMode(params);
    // Variable system commands (P1)
    case "create_variable_collection":
      return await createVariableCollection(params);
    case "create_variable":
      return await createVariable(params);
    case "get_variable_by_id":
      return await getVariableById(params);
    case "get_local_variable_collections":
      return await getLocalVariableCollections();
    case "get_local_variables":
      return await getLocalVariables(params);
    case "set_bound_variable":
      return await setBoundVariable(params);
    // ── FigJam commands ──────────────────────────────────────────────────
    case "get_figjam_elements":
      return await getFigJamElements();
    case "create_sticky":
      return await createSticky(params);
    case "set_sticky_text":
      return await setStickyText(params);
    case "create_shape_with_text":
      return await createShapeWithText(params);
    case "create_connector":
      return await createConnector(params);
    case "create_section":
      return await createSection(params);
    case "set_reactions":
      return await setReactions(params);
    case "get_reactions":
      return await getReactions(params);
    case "detach_instance":
      return await detachInstance(params);
    case "create_text_style":
      return await createTextStyle(params);
    case "create_paint_style":
      return await createPaintStyle(params);
    case "set_fill_style_id":
      return await setFillStyleId(params);
    case "create_effect_style":
      return await createEffectStyle(params);
    default:
      throw new Error(`Unknown command: ${command}`);
  }
};

// Command implementations

async function getDocumentInfo() {
  await figma.currentPage.loadAsync();
  const page = figma.currentPage;
  return {
    name: page.name,
    id: page.id,
    type: page.type,
    children: page.children.map((node) => ({
      id: node.id,
      name: node.name,
      type: node.type,
    })),
    currentPage: {
      id: page.id,
      name: page.name,
      childCount: page.children.length,
    },
    pages: [
      {
        id: page.id,
        name: page.name,
        childCount: page.children.length,
      },
    ],
  };
}

async function getSelection() {
  return {
    selectionCount: figma.currentPage.selection.length,
    selection: figma.currentPage.selection.map((node) => ({
      id: node.id,
      name: node.name,
      type: node.type,
      visible: node.visible,
    })),
  };
}

async function getNodeInfo(nodeId) {
  const node = await getNodeByIdSafe(nodeId);

  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  const response = await node.exportAsync({
    format: "JSON_REST_V1",
  });

  const result = response.document;

  // Add local coordinates if node supports positioning
  if ("x" in node && "y" in node) {
    result.localPosition = {
      x: node.x,
      y: node.y
    };
  }

  // Add componentProperties for INSTANCE nodes
  if (node.type === "INSTANCE") {
    result.componentProperties = node.componentProperties;
    const mainComponent = await node.getMainComponentAsync();
    result.mainComponentId = mainComponent ? mainComponent.id : null;
  }

  // Add componentPropertyDefinitions for COMPONENT nodes
  if (node.type === "COMPONENT" || node.type === "COMPONENT_SET") {
    result.componentPropertyDefinitions = node.componentPropertyDefinitions;
  }

  return result;
}

async function getNodesInfo(nodeIds) {
  try {
    // Load all nodes in parallel
    const nodes = await Promise.all(
      nodeIds.map((id) => getNodeByIdSafe(id))
    );

    // Filter out any null values (nodes that weren't found)
    const validNodes = nodes.filter((node) => node !== null);

    // Export all valid nodes in parallel
    const responses = await Promise.all(
      validNodes.map(async (node) => {
        const response = await node.exportAsync({
          format: "JSON_REST_V1",
        });
        const doc = response.document;
        // Add local coordinates if node supports positioning
        if ("x" in node && "y" in node) {
          doc.localPosition = {
            x: node.x,
            y: node.y
          };
        }
        return {
          nodeId: node.id,
          document: doc,
        };
      })
    );

    return responses;
  } catch (error) {
    throw new Error(`Error getting nodes info: ${error.message}`);
  }
}

async function createRectangle(params) {
  const {
    x = 0,
    y = 0,
    width = 100,
    height = 100,
    name = "Rectangle",
    parentId,
    fillColor,
    strokeColor,
    strokeWeight,
  } = params || {};

  const rect = figma.createRectangle();
  rect.x = x;
  rect.y = y;
  rect.resize(width, height);
  rect.name = name;

  // Set fill color if provided
  if (fillColor) {
    var fillPaint = safePaint(fillColor);
    if (fillPaint) rect.fills = [fillPaint];
  }

  // Set stroke color and weight if provided
  if (strokeColor) {
    var strokePaint = safePaint(strokeColor);
    if (strokePaint) rect.strokes = [strokePaint];
  }

  // Set stroke weight if provided
  if (strokeWeight !== undefined) {
    rect.strokeWeight = strokeWeight;
  }

  // If parentId is provided, append to that node, otherwise append to current page
  if (parentId) {
    const parentNode = await getNodeByIdSafe(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    parentNode.appendChild(rect);
  } else {
    figma.currentPage.appendChild(rect);
  }

  return {
    id: rect.id,
    name: rect.name,
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    parentId: rect.parent ? rect.parent.id : undefined,
  };
}

async function createFrame(params) {
  const {
    x = 0,
    y = 0,
    width = 100,
    height = 100,
    name = "Frame",
    parentId,
    fillColor,
    strokeColor,
    strokeWeight,
  } = params || {};

  const frame = figma.createFrame();
  frame.x = x;
  frame.y = y;
  frame.resize(width, height);
  frame.name = name;

  // Set fill color if provided (invalid color → skip, keeping Figma default)
  if (fillColor) {
    var fillPaint = safePaint(fillColor);
    if (fillPaint) frame.fills = [fillPaint];
  }

  // Set stroke color and weight if provided (invalid color → skip)
  if (strokeColor) {
    var strokePaint = safePaint(strokeColor);
    if (strokePaint) frame.strokes = [strokePaint];
  }

  // Set stroke weight if provided
  if (strokeWeight !== undefined) {
    frame.strokeWeight = strokeWeight;
  }

  // If parentId is provided, append to that node, otherwise append to current page
  var targetParent = figma.currentPage;
  if (parentId) {
    const parentNode = await getNodeByIdSafe(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    targetParent = parentNode;
  }
  targetParent.appendChild(frame);

  // Auto-Grid logic: if parent is a PAGE, add a standard column grid (hidden by default)
  if (targetParent.type === "PAGE") {
    var colCount = 4; // Mobile
    if (width >= 1024) colCount = 12; // Desktop
    else if (width >= 768) colCount = 8; // Tablet

    frame.layoutGrids = [
      {
        pattern: "COLUMNS",
        alignment: "STRETCH",
        count: colCount,
        gutterSize: 20,
        offset: 20,
        visible: false,
        color: { r: 1, g: 0, b: 0, a: 0.1 },
      },
    ];
  }

  return {
    id: frame.id,
    name: frame.name,
    x: frame.x,
    y: frame.y,
    width: frame.width,
    height: frame.height,
    fills: frame.fills,
    strokes: frame.strokes,
    strokeWeight: frame.strokeWeight,
    parentId: frame.parent ? frame.parent.id : undefined,
  };
}

async function createText(params) {
  const {
    x = 0,
    y = 0,
    text = "Text",
    fontSize = 14,
    fontWeight = 400,
    fontColor = { r: 0, g: 0, b: 0, a: 1 }, // Default to black
    name = "Text",
    parentId,
    textAlignHorizontal,
    textAutoResize,
    width,
  } = params || {};

  // Map common font weights to Figma font styles
  const getFontStyle = (weight) => {
    switch (weight) {
      case 100:
        return "Thin";
      case 200:
        return "Extra Light";
      case 300:
        return "Light";
      case 400:
        return "Regular";
      case 500:
        return "Medium";
      case 600:
        return "Semi Bold";
      case 700:
        return "Bold";
      case 800:
        return "Extra Bold";
      case 900:
        return "Black";
      default:
        return "Regular";
    }
  };

  const textNode = figma.createText();
  textNode.x = x;
  textNode.y = y;
  textNode.name = name;
  try {
    await figma.loadFontAsync({
      family: "Inter",
      style: getFontStyle(fontWeight),
    });
    textNode.fontName = { family: "Inter", style: getFontStyle(fontWeight) };
    textNode.fontSize = parseInt(fontSize);
  } catch (error) {
    console.error("Error setting font size", error);
  }
  await setCharacters(textNode, text);

  // Set text color
  const paintStyle = {
    type: "SOLID",
    color: {
      r: parseFloat(fontColor.r) || 0,
      g: parseFloat(fontColor.g) || 0,
      b: parseFloat(fontColor.b) || 0,
    },
    opacity: parseFloat(fontColor.a) || 1,
  };
  textNode.fills = [paintStyle];

  // Set text alignment if provided
  if (textAlignHorizontal && ["LEFT", "CENTER", "RIGHT", "JUSTIFIED"].includes(textAlignHorizontal)) {
    textNode.textAlignHorizontal = textAlignHorizontal;
  }

  // Set text auto resize if provided (WIDTH_AND_HEIGHT, HEIGHT, NONE, TRUNCATE)
  if (textAutoResize && ["WIDTH_AND_HEIGHT", "HEIGHT", "NONE", "TRUNCATE"].includes(textAutoResize)) {
    textNode.textAutoResize = textAutoResize;
  }

  // Set width if provided (useful with textAutoResize "HEIGHT" for fixed-width wrapping text)
  if (width && typeof width === "number" && width > 0) {
    textNode.resize(width, textNode.height);
  }

  // If parentId is provided, append to that node, otherwise append to current page
  if (parentId) {
    const parentNode = await getNodeByIdSafe(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    parentNode.appendChild(textNode);
  } else {
    figma.currentPage.appendChild(textNode);
  }

  return {
    id: textNode.id,
    name: textNode.name,
    x: textNode.x,
    y: textNode.y,
    width: textNode.width,
    height: textNode.height,
    characters: textNode.characters,
    fontSize: textNode.fontSize,
    fontWeight: fontWeight,
    fontColor: fontColor,
    fontName: textNode.fontName,
    fills: textNode.fills,
    parentId: textNode.parent ? textNode.parent.id : undefined,
  };
}

async function setFillColor(params) {
  const {
    nodeId,
    color,
  } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (!("fills" in node)) {
    throw new Error(`Node does not support fills: ${nodeId}`);
  }

  const fillPaint = safePaint(color);
  if (!fillPaint) {
    throw new Error("Invalid color data received from MCP layer.");
  }

  node.fills = [fillPaint];

  return {
    id: node.id,
    name: node.name,
    fills: [fillPaint],
  };
}

async function setStrokeColor(params) {
  const {
    nodeId,
    color,
    strokeWeight,
  } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (!("strokes" in node)) {
    throw new Error(`Node does not support strokes: ${nodeId}`);
  }

  const strokePaint = safePaint(color);
  if (!strokePaint) {
    throw new Error("Invalid color data received from MCP layer.");
  }

  node.strokes = [strokePaint];

  if (strokeWeight !== undefined) {
    node.strokeWeight = parseFloat(strokeWeight);
  }

  return {
    id: node.id,
    name: node.name,
    strokes: node.strokes,
    strokeWeight: "strokeWeight" in node ? node.strokeWeight : undefined,
  };
}

async function setSelectionColors(params) {
  const { nodeId, r, g, b, a, commandId } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (r === undefined || g === undefined || b === undefined) {
    throw new Error("RGB components (r, g, b) are required");
  }

  const newColor = {
    r: parseFloat(r),
    g: parseFloat(g),
    b: parseFloat(b),
  };
  const opacity = a !== undefined ? parseFloat(a) : 1;

  // Get all descendant nodes + the target node itself
  let targets = [];
  if ("findAll" in node) {
    targets = [node].concat(node.findAll(() => true));
  } else {
    targets = [node];
  }

  let changedCount = 0;
  const totalNodes = targets.length;
  const chunkSize = 200; // Process 200 nodes at a time

  sendProgressUpdate(commandId, "set_selection_colors", "started", 0, totalNodes, 0, `Starting color update for ${totalNodes} nodes...`);

  for (let i = 0; i < totalNodes; i += chunkSize) {
    const chunk = targets.slice(i, i + chunkSize);
    
    for (const n of chunk) {
      let nodeModified = false;

      // Update strokes
      if ("strokes" in n && Array.isArray(n.strokes) && n.strokes.length > 0) {
        let strokesChanged = false;
        const newStrokes = n.strokes.map(s => {
          if (s.type === "SOLID") {
            // Only update if color or opacity is different
            if (s.color.r !== newColor.r || s.color.g !== newColor.g || s.color.b !== newColor.b || s.opacity !== opacity) {
              strokesChanged = true;
              return Object.assign({}, s, { color: newColor, opacity: opacity });
            }
          }
          return s;
        });
        
        if (strokesChanged) {
          n.strokes = newStrokes;
          nodeModified = true;
        }
      }

      // Update fills
      if ("fills" in n && Array.isArray(n.fills) && n.fills.length > 0) {
        let fillsChanged = false;
        const newFills = n.fills.map(f => {
          if (f.type === "SOLID" && f.visible !== false) {
            // Only update if color or opacity is different
            if (f.color.r !== newColor.r || f.color.g !== newColor.g || f.color.b !== newColor.b || f.opacity !== opacity) {
              fillsChanged = true;
              return Object.assign({}, f, { color: newColor, opacity: opacity, visible: true });
            }
          }
          return f;
        });

        if (fillsChanged) {
          n.fills = newFills;
          nodeModified = true;
        }
      }

      if (nodeModified) {
        changedCount++;
      }
    }

    // After each chunk, yield to main thread and send progress
    const processedCount = Math.min(i + chunkSize, totalNodes);
    const progress = Math.round((processedCount / totalNodes) * 100);
    
    sendProgressUpdate(commandId, "set_selection_colors", "in_progress", progress, totalNodes, processedCount, `Processed ${processedCount}/${totalNodes} nodes...`);
    
    // Tiny delay to breathe
    await new Promise(resolve => setTimeout(resolve, 1));
  }

  return {
    id: node.id,
    name: node.name,
    nodesChanged: changedCount,
    totalProcessed: totalNodes
  };
}

async function moveNode(params) {
  const { nodeId, x, y } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  if (x === undefined || y === undefined) {
    throw new Error("Missing x or y parameters");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (!("x" in node) || !("y" in node)) {
    throw new Error(`Node does not support position: ${nodeId}`);
  }

  node.x = x;
  node.y = y;

  return {
    id: node.id,
    name: node.name,
    x: node.x,
    y: node.y,
  };
}

async function resizeNode(params) {
  const { nodeId, width, height } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  if (width === undefined || height === undefined) {
    throw new Error("Missing width or height parameters");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (!("resize" in node)) {
    throw new Error(`Node does not support resizing: ${nodeId}`);
  }

  node.resize(width, height);

  return {
    id: node.id,
    name: node.name,
    width: node.width,
    height: node.height,
  };
}

async function deleteNode(params) {
  const { nodeId } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  // Save node info before deleting
  const nodeInfo = {
    id: node.id,
    name: node.name,
    type: node.type,
  };

  node.remove();

  return nodeInfo;
}

async function getStyles() {
  const styles = {
    colors: await figma.getLocalPaintStylesAsync(),
    texts: await figma.getLocalTextStylesAsync(),
    effects: await figma.getLocalEffectStylesAsync(),
    grids: await figma.getLocalGridStylesAsync(),
  };

  return {
    colors: styles.colors.map((style) => ({
      id: style.id,
      name: style.name,
      key: style.key,
      paint: style.paints[0],
    })),
    texts: styles.texts.map((style) => ({
      id: style.id,
      name: style.name,
      key: style.key,
      fontSize: style.fontSize,
      fontName: style.fontName,
    })),
    effects: styles.effects.map((style) => ({
      id: style.id,
      name: style.name,
      key: style.key,
    })),
    grids: styles.grids.map((style) => ({
      id: style.id,
      name: style.name,
      key: style.key,
    })),
  };
}

async function getLocalComponents() {
  await figma.loadAllPagesAsync();

  const components = figma.root.findAllWithCriteria({
    types: ["COMPONENT"],
  });

  return {
    count: components.length,
    components: components.map((component) => ({
      id: component.id,
      name: component.name,
      key: "key" in component ? component.key : null,
    })),
  };
}

// async function getTeamComponents() {
//   try {
//     const teamComponents =
//       await figma.teamLibrary.getAvailableComponentsAsync();

//     return {
//       count: teamComponents.length,
//       components: teamComponents.map((component) => ({
//         key: component.key,
//         name: component.name,
//         description: component.description,
//         libraryName: component.libraryName,
//       })),
//     };
//   } catch (error) {
//     throw new Error(`Error getting team components: ${error.message}`);
//   }
// }

async function createComponentInstance(params) {
  const { componentKey, x = 0, y = 0, parentId } = params || {};

  if (!componentKey) {
    throw new Error("Missing componentKey parameter");
  }

  try {
    console.log(`Looking for component with key: ${componentKey}...`);

    let component = null;

    // Try to find the component locally first (faster than import)
    try {
      // First check current page (fastest)
      const currentPageComponents = figma.currentPage.findAllWithCriteria({
        types: ["COMPONENT"]
      });
      component = currentPageComponents.find(c => c.key === componentKey);

      if (!component) {
        // Load all pages and search entire document
        console.log(`Not on current page, searching all pages...`);
        await figma.loadAllPagesAsync();
        const allComponents = figma.root.findAllWithCriteria({
          types: ["COMPONENT"]
        });
        component = allComponents.find(c => c.key === componentKey);
      }

      if (component) {
        console.log(`Found component locally: ${component.name}`);
      }
    } catch (findError) {
      console.log(`Error searching locally: ${findError.message}`);
    }

    // If not found locally, try importing (for remote/team library components)
    if (!component) {
      console.log(`Component not found locally, trying import...`);

      let timeoutId;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("Timeout while importing component (10s). The component may be in a team library you don't have access to."));
        }, 10000);
      });

      const importPromise = figma.importComponentByKeyAsync(componentKey);

      component = await Promise.race([importPromise, timeoutPromise])
        .finally(() => {
          clearTimeout(timeoutId);
        });
    }

    console.log(`Component ready, creating instance...`);

    // Create instance and set properties in a separate try block to handle errors specifically from this step
    try {
      const instance = component.createInstance();
      instance.x = x;
      instance.y = y;

      // Add to parent (explicit parentId or currentPage fallback)
      if (parentId) {
        const parentNode = await getNodeByIdSafe(parentId);
        if (!parentNode) {
          throw new Error(`Parent node not found with ID: ${parentId}`);
        }
        if (!("appendChild" in parentNode)) {
          throw new Error(`Parent node does not support children: ${parentId}`);
        }
        parentNode.appendChild(instance);
      } else {
        figma.currentPage.appendChild(instance);
      }

      console.log(`Component instance created and added to ${parentId ? 'parent ' + parentId : 'page'} successfully`);

      return {
        id: instance.id,
        name: instance.name,
        x: instance.x,
        y: instance.y,
        width: instance.width,
        height: instance.height,
        componentId: instance.componentId,
      };
    } catch (instanceError) {
      console.error(`Error creating component instance: ${instanceError.message}`);
      throw new Error(`Error creating component instance: ${instanceError.message}`);
    }
  } catch (error) {
    console.error(`Detailed error creating component instance: ${error.message || "Unknown error"}`);
    console.error(`Stack trace: ${error.stack || "Not available"}`);

    // Provide more helpful error messages for common failure scenarios
    if (error.message.includes("timeout") || error.message.includes("Timeout")) {
      throw new Error(`The component import timed out after 10 seconds. This usually happens with complex remote components or network issues. Try again later or use a simpler component.`);
    } else if (error.message.includes("not found") || error.message.includes("Not found")) {
      throw new Error(`Component with key "${componentKey}" not found. Make sure the component exists and is accessible in your document or team libraries.`);
    } else if (error.message.includes("permission") || error.message.includes("Permission")) {
      throw new Error(`You don't have permission to use this component. Make sure you have access to the team library containing this component.`);
    } else {
      throw new Error(`Error creating component instance: ${error.message}`);
    }
  }
}

async function exportNodeAsImage(params) {
  const { nodeId, scale = 1, format = "PNG" } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  console.log(`[exportNodeAsImage] Starting export for node ${nodeId}, scale: ${scale}, format: ${format}`);
  const startTime = Date.now();

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  console.log(`[exportNodeAsImage] Node found: ${node.name}, type: ${node.type}, size: ${node.width}x${node.height}`);

  if (!("exportAsync" in node)) {
    throw new Error(`Node does not support exporting: ${nodeId}`);
  }

  try {
    const settings = {
      format: format,
      constraint: { type: "SCALE", value: scale },
    };

    // Set up a timeout for large exports
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Export timed out after 60s for node ${nodeId} (${node.name}, ${node.width}x${node.height})`));
      }, 60000); // 60 seconds timeout
    });

    const exportPromise = node.exportAsync(settings);

    const bytes = await Promise.race([exportPromise, timeoutPromise])
      .finally(() => {
        clearTimeout(timeoutId);
      });

    console.log(`[exportNodeAsImage] Export completed in ${Date.now() - startTime}ms, bytes: ${bytes.length}`);

    let mimeType;
    switch (format) {
      case "PNG":
        mimeType = "image/png";
        break;
      case "JPG":
        mimeType = "image/jpeg";
        break;
      case "SVG":
        mimeType = "image/svg+xml";
        break;
      case "PDF":
        mimeType = "application/pdf";
        break;
      default:
        mimeType = "application/octet-stream";
    }

    // Proper way to convert Uint8Array to base64
    const base64 = customBase64Encode(bytes);
    // const imageData = `data:${mimeType};base64,${base64}`;

    return {
      nodeId,
      format,
      scale,
      mimeType,
      imageData: base64,
    };
  } catch (error) {
    throw new Error(`Error exporting node as image: ${error.message}`);
  }
}
function customBase64Encode(bytes) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let base64 = "";

  const byteLength = bytes.byteLength;
  const byteRemainder = byteLength % 3;
  const mainLength = byteLength - byteRemainder;

  let a, b, c, d;
  let chunk;

  // Main loop deals with bytes in chunks of 3
  for (let i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048) >> 12; // 258048 = (2^6 - 1) << 12
    c = (chunk & 4032) >> 6; // 4032 = (2^6 - 1) << 6
    d = chunk & 63; // 63 = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += chars[a] + chars[b] + chars[c] + chars[d];
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder === 1) {
    chunk = bytes[mainLength];

    a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3) << 4; // 3 = 2^2 - 1

    base64 += chars[a] + chars[b] + "==";
  } else if (byteRemainder === 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

    a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008) >> 4; // 1008 = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15) << 2; // 15 = 2^4 - 1

    base64 += chars[a] + chars[b] + chars[c] + "=";
  }

  return base64;
}

// Decode base64 string to Uint8Array (mirror of customBase64Encode)
function customBase64Decode(base64) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  // Remove padding and calculate output length
  let padding = 0;
  if (base64.length > 0 && base64[base64.length - 1] === "=") padding++;
  if (base64.length > 1 && base64[base64.length - 2] === "=") padding++;
  const byteLength = (base64.length * 3) / 4 - padding;
  const bytes = new Uint8Array(byteLength);

  let p = 0;
  for (let i = 0; i < base64.length; i += 4) {
    const a = lookup[base64.charCodeAt(i)];
    const b = lookup[base64.charCodeAt(i + 1)];
    const c = lookup[base64.charCodeAt(i + 2)];
    const d = lookup[base64.charCodeAt(i + 3)];

    bytes[p++] = (a << 2) | (b >> 4);
    if (p < byteLength) bytes[p++] = ((b & 15) << 4) | (c >> 2);
    if (p < byteLength) bytes[p++] = ((c & 3) << 6) | d;
  }

  return bytes;
}

async function setCornerRadius(params) {
  const { nodeId, radius, corners } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  if (radius === undefined) {
    throw new Error("Missing radius parameter");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  // Check if node supports corner radius
  if (!("cornerRadius" in node)) {
    throw new Error(`Node does not support corner radius: ${nodeId}`);
  }

  // If corners array is provided, set individual corner radii
  if (corners && Array.isArray(corners) && corners.length === 4) {
    if ("topLeftRadius" in node) {
      // Node supports individual corner radii
      if (corners[0]) node.topLeftRadius = radius;
      if (corners[1]) node.topRightRadius = radius;
      if (corners[2]) node.bottomRightRadius = radius;
      if (corners[3]) node.bottomLeftRadius = radius;
    } else {
      // Node only supports uniform corner radius
      node.cornerRadius = radius;
    }
  } else {
    // Set uniform corner radius
    node.cornerRadius = radius;
  }

  return {
    id: node.id,
    name: node.name,
    cornerRadius: "cornerRadius" in node ? node.cornerRadius : undefined,
    topLeftRadius: "topLeftRadius" in node ? node.topLeftRadius : undefined,
    topRightRadius: "topRightRadius" in node ? node.topRightRadius : undefined,
    bottomRightRadius:
      "bottomRightRadius" in node ? node.bottomRightRadius : undefined,
    bottomLeftRadius:
      "bottomLeftRadius" in node ? node.bottomLeftRadius : undefined,
  };
}

async function setTextContent(params) {
  const { nodeId, text } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  if (text === undefined) {
    throw new Error("Missing text parameter");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (node.type !== "TEXT") {
    throw new Error(`Node is not a text node: ${nodeId}`);
  }

  try {
    await figma.loadFontAsync(node.fontName);

    await setCharacters(node, text);

    return {
      id: node.id,
      name: node.name,
      characters: node.characters,
      fontName: node.fontName,
    };
  } catch (error) {
    throw new Error(`Error setting text content: ${error.message}`);
  }
}

// Initialize settings on load
(async function initializePlugin() {
  try {
    const savedSettings = await figma.clientStorage.getAsync("settings");
    if (savedSettings) {
      if (savedSettings.serverPort) {
        state.serverPort = savedSettings.serverPort;
      }
    }

    // Send initial settings to UI
    figma.ui.postMessage({
      type: "init-settings",
      settings: {
        serverPort: state.serverPort,
      },
    });
  } catch (error) {
    console.error("Error loading settings:", error);
  }
})();

function uniqBy(arr, predicate) {
  const cb = typeof predicate === "function" ? predicate : (o) => o[predicate];
  return [
    ...arr
      .reduce((map, item) => {
        const key = item === null || item === undefined ? item : cb(item);

        map.has(key) || map.set(key, item);

        return map;
      }, new Map())
      .values(),
  ];
}
const setCharacters = async (node, characters, options) => {
  const fallbackFont = (options && options.fallbackFont) || {
    family: "Inter",
    style: "Regular",
  };
  try {
    if (node.fontName === figma.mixed) {
      if (options && options.smartStrategy === "prevail") {
        const fontHashTree = {};
        for (let i = 1; i < node.characters.length; i++) {
          const charFont = node.getRangeFontName(i - 1, i);
          const key = `${charFont.family}::${charFont.style}`;
          fontHashTree[key] = fontHashTree[key] ? fontHashTree[key] + 1 : 1;
        }
        const prevailedTreeItem = Object.entries(fontHashTree).sort(
          (a, b) => b[1] - a[1]
        )[0];
        const [family, style] = prevailedTreeItem[0].split("::");
        const prevailedFont = {
          family,
          style,
        };
        await figma.loadFontAsync(prevailedFont);
        node.fontName = prevailedFont;
      } else if (options && options.smartStrategy === "strict") {
        return setCharactersWithStrictMatchFont(node, characters, fallbackFont);
      } else if (options && options.smartStrategy === "experimental") {
        return setCharactersWithSmartMatchFont(node, characters, fallbackFont);
      } else {
        const firstCharFont = node.getRangeFontName(0, 1);
        await figma.loadFontAsync(firstCharFont);
        node.fontName = firstCharFont;
      }
    } else {
      await figma.loadFontAsync({
        family: node.fontName.family,
        style: node.fontName.style,
      });
    }
  } catch (err) {
    console.warn(
      `Failed to load "${node.fontName["family"]} ${node.fontName["style"]}" font and replaced with fallback "${fallbackFont.family} ${fallbackFont.style}"`,
      err
    );
    await figma.loadFontAsync(fallbackFont);
    node.fontName = fallbackFont;
  }
  try {
    node.characters = characters;
    return true;
  } catch (err) {
    console.warn(`Failed to set characters. Skipped.`, err);
    return false;
  }
};

const setCharactersWithStrictMatchFont = async (
  node,
  characters,
  fallbackFont
) => {
  const fontHashTree = {};
  for (let i = 1; i < node.characters.length; i++) {
    const startIdx = i - 1;
    const startCharFont = node.getRangeFontName(startIdx, i);
    const startCharFontVal = `${startCharFont.family}::${startCharFont.style}`;
    while (i < node.characters.length) {
      i++;
      const charFont = node.getRangeFontName(i - 1, i);
      if (startCharFontVal !== `${charFont.family}::${charFont.style}`) {
        break;
      }
    }
    fontHashTree[`${startIdx}_${i}`] = startCharFontVal;
  }
  await figma.loadFontAsync(fallbackFont);
  node.fontName = fallbackFont;
  node.characters = characters;
  console.log(fontHashTree);
  await Promise.all(
    Object.keys(fontHashTree).map(async (range) => {
      console.log(range, fontHashTree[range]);
      const [start, end] = range.split("_");
      const [family, style] = fontHashTree[range].split("::");
      const matchedFont = {
        family,
        style,
      };
      await figma.loadFontAsync(matchedFont);
      return node.setRangeFontName(Number(start), Number(end), matchedFont);
    })
  );
  return true;
};

const getDelimiterPos = (str, delimiter, startIdx = 0, endIdx = str.length) => {
  const indices = [];
  let temp = startIdx;
  for (let i = 0; i < endIdx; i++) {
    if (
      str[i] === delimiter &&
      i + startIdx !== endIdx &&
      temp !== i + startIdx
    ) {
      indices.push([temp, i + startIdx]);
      temp = i + startIdx + 1;
    }
  }
  temp !== endIdx && indices.push([temp, endIdx]);
  return indices.filter(Boolean);
};

const buildLinearOrder = (node) => {
  const fontTree = [];
  const newLinesPos = getDelimiterPos(node.characters, "\n");
  newLinesPos.forEach(([newLinesRangeStart, newLinesRangeEnd], n) => {
    const newLinesRangeFont = node.getRangeFontName(
      newLinesRangeStart,
      newLinesRangeEnd
    );
    if (newLinesRangeFont === figma.mixed) {
      const spacesPos = getDelimiterPos(
        node.characters,
        " ",
        newLinesRangeStart,
        newLinesRangeEnd
      );
      spacesPos.forEach(([spacesRangeStart, spacesRangeEnd], s) => {
        const spacesRangeFont = node.getRangeFontName(
          spacesRangeStart,
          spacesRangeEnd
        );
        if (spacesRangeFont === figma.mixed) {
          const spacesRangeFont = node.getRangeFontName(
            spacesRangeStart,
            spacesRangeStart[0]
          );
          fontTree.push({
            start: spacesRangeStart,
            delimiter: " ",
            family: spacesRangeFont.family,
            style: spacesRangeFont.style,
          });
        } else {
          fontTree.push({
            start: spacesRangeStart,
            delimiter: " ",
            family: spacesRangeFont.family,
            style: spacesRangeFont.style,
          });
        }
      });
    } else {
      fontTree.push({
        start: newLinesRangeStart,
        delimiter: "\n",
        family: newLinesRangeFont.family,
        style: newLinesRangeFont.style,
      });
    }
  });
  return fontTree
    .sort((a, b) => +a.start - +b.start)
    .map(({ family, style, delimiter }) => ({ family, style, delimiter }));
};

const setCharactersWithSmartMatchFont = async (
  node,
  characters,
  fallbackFont
) => {
  const rangeTree = buildLinearOrder(node);
  const fontsToLoad = uniqBy(
    rangeTree,
    ({ family, style }) => `${family}::${style}`
  ).map(({ family, style }) => ({
    family,
    style,
  }));

  await Promise.all([...fontsToLoad, fallbackFont].map(figma.loadFontAsync));

  node.fontName = fallbackFont;
  node.characters = characters;

  let prevPos = 0;
  rangeTree.forEach(({ family, style, delimiter }) => {
    if (prevPos < node.characters.length) {
      const delimeterPos = node.characters.indexOf(delimiter, prevPos);
      const endPos =
        delimeterPos > prevPos ? delimeterPos : node.characters.length;
      const matchedFont = {
        family,
        style,
      };
      node.setRangeFontName(prevPos, endPos, matchedFont);
      prevPos = endPos + 1;
    }
  });
  return true;
};

// Add the cloneNode function implementation
async function cloneNode(params) {
  const { nodeId, x, y, parentId } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  // Clone the node
  const clone = node.clone();

  // If x and y are provided, move the clone to that position
  if (x !== undefined && y !== undefined) {
    if (!("x" in clone) || !("y" in clone)) {
      throw new Error(`Cloned node does not support position: ${nodeId}`);
    }
    clone.x = x;
    clone.y = y;
  }

  // Add the clone to the target parent, or fall back to the original node's parent
  if (parentId) {
    const parentNode = await getNodeByIdSafe(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    parentNode.appendChild(clone);
  } else if (node.parent) {
    node.parent.appendChild(clone);
  } else {
    figma.currentPage.appendChild(clone);
  }

  return {
    id: clone.id,
    name: clone.name,
    x: "x" in clone ? clone.x : undefined,
    y: "y" in clone ? clone.y : undefined,
    width: "width" in clone ? clone.width : undefined,
    height: "height" in clone ? clone.height : undefined,
  };
}

async function scanTextNodes(params) {
  console.log(`Starting to scan text nodes from node ID: ${params.nodeId}`);
  const { nodeId, useChunking = true, chunkSize = 10, commandId = generateCommandId() } = params || {};

  const node = await getNodeByIdSafe(nodeId);

  if (!node) {
    console.error(`Node with ID ${nodeId} not found`);
    // Send error progress update
    sendProgressUpdate(
      commandId,
      'scan_text_nodes',
      'error',
      0,
      0,
      0,
      `Node with ID ${nodeId} not found`,
      { error: `Node not found: ${nodeId}` }
    );
    throw new Error(`Node with ID ${nodeId} not found`);
  }

  // If chunking is not enabled, use the original implementation
  if (!useChunking) {
    const textNodes = [];
    try {
      // Send started progress update
      sendProgressUpdate(
        commandId,
        'scan_text_nodes',
        'started',
        0,
        1, // Not known yet how many nodes there are
        0,
        `Starting scan of node "${node.name || nodeId}" without chunking`,
        null
      );

      await findTextNodes(node, [], 0, textNodes);

      // Send completed progress update
      sendProgressUpdate(
        commandId,
        'scan_text_nodes',
        'completed',
        100,
        textNodes.length,
        textNodes.length,
        `Scan complete. Found ${textNodes.length} text nodes.`,
        { textNodes }
      );

      return {
        success: true,
        message: `Scanned ${textNodes.length} text nodes.`,
        count: textNodes.length,
        textNodes: textNodes,
        commandId
      };
    } catch (error) {
      console.error("Error scanning text nodes:", error);

      // Send error progress update
      sendProgressUpdate(
        commandId,
        'scan_text_nodes',
        'error',
        0,
        0,
        0,
        `Error scanning text nodes: ${error.message}`,
        { error: error.message }
      );

      throw new Error(`Error scanning text nodes: ${error.message}`);
    }
  }

  // Chunked implementation
  console.log(`Using chunked scanning with chunk size: ${chunkSize}`);

  // First, collect all nodes to process (without processing them yet)
  const nodesToProcess = [];

  // Send started progress update
  sendProgressUpdate(
    commandId,
    'scan_text_nodes',
    'started',
    0,
    0, // Not known yet how many nodes there are
    0,
    `Starting chunked scan of node "${node.name || nodeId}"`,
    { chunkSize }
  );

  await collectNodesToProcess(node, [], 0, nodesToProcess);

  const totalNodes = nodesToProcess.length;
  console.log(`Found ${totalNodes} total nodes to process`);

  // Calculate number of chunks needed
  const totalChunks = Math.ceil(totalNodes / chunkSize);
  console.log(`Will process in ${totalChunks} chunks`);

  // Send update after node collection
  sendProgressUpdate(
    commandId,
    'scan_text_nodes',
    'in_progress',
    5, // 5% progress for collection phase
    totalNodes,
    0,
    `Found ${totalNodes} nodes to scan. Will process in ${totalChunks} chunks.`,
    {
      totalNodes,
      totalChunks,
      chunkSize
    }
  );

  // Process nodes in chunks
  const allTextNodes = [];
  let processedNodes = 0;
  let chunksProcessed = 0;

  for (let i = 0; i < totalNodes; i += chunkSize) {
    const chunkEnd = Math.min(i + chunkSize, totalNodes);
    console.log(`Processing chunk ${chunksProcessed + 1}/${totalChunks} (nodes ${i} to ${chunkEnd - 1})`);

    // Send update before processing chunk
    sendProgressUpdate(
      commandId,
      'scan_text_nodes',
      'in_progress',
      Math.round(5 + ((chunksProcessed / totalChunks) * 90)), // 5-95% for processing
      totalNodes,
      processedNodes,
      `Processing chunk ${chunksProcessed + 1}/${totalChunks}`,
      {
        currentChunk: chunksProcessed + 1,
        totalChunks,
        textNodesFound: allTextNodes.length
      }
    );

    const chunkNodes = nodesToProcess.slice(i, chunkEnd);
    const chunkTextNodes = [];

    // Process each node in this chunk
    for (const nodeInfo of chunkNodes) {
      if (nodeInfo.node.type === "TEXT") {
        try {
          const textNodeInfo = await processTextNode(nodeInfo.node, nodeInfo.parentPath, nodeInfo.depth);
          if (textNodeInfo) {
            chunkTextNodes.push(textNodeInfo);
          }
        } catch (error) {
          console.error(`Error processing text node: ${error.message}`);
          // Continue with other nodes
        }
      }

      // Brief delay to allow UI updates and prevent freezing
      await delay(5);
    }

    // Add results from this chunk
    allTextNodes.push(...chunkTextNodes);
    processedNodes += chunkNodes.length;
    chunksProcessed++;

    // Send update after processing chunk
    sendProgressUpdate(
      commandId,
      'scan_text_nodes',
      'in_progress',
      Math.round(5 + ((chunksProcessed / totalChunks) * 90)), // 5-95% for processing
      totalNodes,
      processedNodes,
      `Processed chunk ${chunksProcessed}/${totalChunks}. Found ${allTextNodes.length} text nodes so far.`,
      {
        currentChunk: chunksProcessed,
        totalChunks,
        processedNodes,
        textNodesFound: allTextNodes.length,
        chunkResult: chunkTextNodes
      }
    );

    // Small delay between chunks to prevent UI freezing
    if (i + chunkSize < totalNodes) {
      await delay(50);
    }
  }

  // Send completed progress update
  sendProgressUpdate(
    commandId,
    'scan_text_nodes',
    'completed',
    100,
    totalNodes,
    processedNodes,
    `Scan complete. Found ${allTextNodes.length} text nodes.`,
    {
      textNodes: allTextNodes,
      processedNodes,
      chunks: chunksProcessed
    }
  );

  return {
    success: true,
    message: `Chunked scan complete. Found ${allTextNodes.length} text nodes.`,
    totalNodes: allTextNodes.length,
    processedNodes: processedNodes,
    chunks: chunksProcessed,
    textNodes: allTextNodes,
    commandId
  };
}

// Helper function to collect all nodes that need to be processed
async function collectNodesToProcess(node, parentPath = [], depth = 0, nodesToProcess = []) {
  // Skip invisible nodes
  if (node.visible === false) return;

  // Get the path to this node
  const nodePath = [...parentPath, node.name || `Unnamed ${node.type}`];

  // Add this node to the processing list
  nodesToProcess.push({
    node: node,
    parentPath: nodePath,
    depth: depth
  });

  // Recursively add children
  if ("children" in node) {
    for (const child of node.children) {
      await collectNodesToProcess(child, nodePath, depth + 1, nodesToProcess);
    }
  }
}

// Process a single text node
async function processTextNode(node, parentPath, depth) {
  if (node.type !== "TEXT") return null;

  try {
    // Safely extract font information
    let fontFamily = "";
    let fontStyle = "";

    if (node.fontName) {
      if (typeof node.fontName === "object") {
        if ("family" in node.fontName) fontFamily = node.fontName.family;
        if ("style" in node.fontName) fontStyle = node.fontName.style;
      }
    }

    // Create a safe representation of the text node
    const safeTextNode = {
      id: node.id,
      name: node.name || "Text",
      type: node.type,
      characters: node.characters,
      fontSize: typeof node.fontSize === "number" ? node.fontSize : 0,
      fontFamily: fontFamily,
      fontStyle: fontStyle,
      x: typeof node.x === "number" ? node.x : 0,
      y: typeof node.y === "number" ? node.y : 0,
      width: typeof node.width === "number" ? node.width : 0,
      height: typeof node.height === "number" ? node.height : 0,
      path: parentPath.join(" > "),
      depth: depth,
    };

    // Highlight the node briefly (optional visual feedback)
    try {
      const originalFills = JSON.parse(JSON.stringify(node.fills));
      node.fills = [
        {
          type: "SOLID",
          color: { r: 1, g: 0.5, b: 0 },
          opacity: 0.3,
        },
      ];

      // Brief delay for the highlight to be visible
      await delay(100);

      try {
        node.fills = originalFills;
      } catch (err) {
        console.error("Error resetting fills:", err);
      }
    } catch (highlightErr) {
      console.error("Error highlighting text node:", highlightErr);
      // Continue anyway, highlighting is just visual feedback
    }

    return safeTextNode;
  } catch (nodeErr) {
    console.error("Error processing text node:", nodeErr);
    return null;
  }
}

// A delay function that returns a promise
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Keep the original findTextNodes for backward compatibility
async function findTextNodes(node, parentPath = [], depth = 0, textNodes = []) {
  // Skip invisible nodes
  if (node.visible === false) return;

  // Get the path to this node including its name
  const nodePath = [...parentPath, node.name || `Unnamed ${node.type}`];

  if (node.type === "TEXT") {
    try {
      // Safely extract font information to avoid Symbol serialization issues
      let fontFamily = "";
      let fontStyle = "";

      if (node.fontName) {
        if (typeof node.fontName === "object") {
          if ("family" in node.fontName) fontFamily = node.fontName.family;
          if ("style" in node.fontName) fontStyle = node.fontName.style;
        }
      }

      // Create a safe representation of the text node with only serializable properties
      const safeTextNode = {
        id: node.id,
        name: node.name || "Text",
        type: node.type,
        characters: node.characters,
        fontSize: typeof node.fontSize === "number" ? node.fontSize : 0,
        fontFamily: fontFamily,
        fontStyle: fontStyle,
        x: typeof node.x === "number" ? node.x : 0,
        y: typeof node.y === "number" ? node.y : 0,
        width: typeof node.width === "number" ? node.width : 0,
        height: typeof node.height === "number" ? node.height : 0,
        path: nodePath.join(" > "),
        depth: depth,
      };

      // Only highlight the node if it's not being done via API
      try {
        // Safe way to create a temporary highlight without causing serialization issues
        const originalFills = JSON.parse(JSON.stringify(node.fills));
        node.fills = [
          {
            type: "SOLID",
            color: { r: 1, g: 0.5, b: 0 },
            opacity: 0.3,
          },
        ];

        // Promise-based delay instead of setTimeout
        await delay(500);

        try {
          node.fills = originalFills;
        } catch (err) {
          console.error("Error resetting fills:", err);
        }
      } catch (highlightErr) {
        console.error("Error highlighting text node:", highlightErr);
        // Continue anyway, highlighting is just visual feedback
      }

      textNodes.push(safeTextNode);
    } catch (nodeErr) {
      console.error("Error processing text node:", nodeErr);
      // Skip this node but continue with others
    }
  }

  // Recursively process children of container nodes
  if ("children" in node) {
    for (const child of node.children) {
      await findTextNodes(child, nodePath, depth + 1, textNodes);
    }
  }
}

// Replace text in a specific node
async function setMultipleTextContents(params) {
  const { nodeId, text } = params || {};
  const commandId = params.commandId || generateCommandId();

  if (!nodeId || !text || !Array.isArray(text)) {
    const errorMsg = "Missing required parameters: nodeId and text array";

    // Send error progress update
    sendProgressUpdate(
      commandId,
      'set_multiple_text_contents',
      'error',
      0,
      0,
      0,
      errorMsg,
      { error: errorMsg }
    );

    throw new Error(errorMsg);
  }

  console.log(
    `Starting text replacement for node: ${nodeId} with ${text.length} text replacements`
  );

  // Send started progress update
  sendProgressUpdate(
    commandId,
    'set_multiple_text_contents',
    'started',
    0,
    text.length,
    0,
    `Starting text replacement for ${text.length} nodes`,
    { totalReplacements: text.length }
  );

  // Define the results array and counters
  const results = [];
  let successCount = 0;
  let failureCount = 0;

  // Split text replacements into chunks of 5
  const CHUNK_SIZE = 5;
  const chunks = [];

  for (let i = 0; i < text.length; i += CHUNK_SIZE) {
    chunks.push(text.slice(i, i + CHUNK_SIZE));
  }

  console.log(`Split ${text.length} replacements into ${chunks.length} chunks`);

  // Send chunking info update
  sendProgressUpdate(
    commandId,
    'set_multiple_text_contents',
    'in_progress',
    5, // 5% progress for planning phase
    text.length,
    0,
    `Preparing to replace text in ${text.length} nodes using ${chunks.length} chunks`,
    {
      totalReplacements: text.length,
      chunks: chunks.length,
      chunkSize: CHUNK_SIZE
    }
  );

  // Process each chunk sequentially
  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex];
    console.log(`Processing chunk ${chunkIndex + 1}/${chunks.length} with ${chunk.length} replacements`);

    // Send chunk processing start update
    sendProgressUpdate(
      commandId,
      'set_multiple_text_contents',
      'in_progress',
      Math.round(5 + ((chunkIndex / chunks.length) * 90)), // 5-95% for processing
      text.length,
      successCount + failureCount,
      `Processing text replacements chunk ${chunkIndex + 1}/${chunks.length}`,
      {
        currentChunk: chunkIndex + 1,
        totalChunks: chunks.length,
        successCount,
        failureCount
      }
    );

    // Process replacements within a chunk in parallel
    const chunkPromises = chunk.map(async (replacement) => {
      if (!replacement.nodeId || replacement.text === undefined) {
        console.error(`Missing nodeId or text for replacement`);
        return {
          success: false,
          nodeId: replacement.nodeId || "unknown",
          error: "Missing nodeId or text in replacement entry"
        };
      }

      try {
        console.log(`Attempting to replace text in node: ${replacement.nodeId}`);

        // Get the text node to update (just to check it exists and get original text)
        const textNode = await getNodeByIdSafe(replacement.nodeId);

        if (!textNode) {
          console.error(`Text node not found: ${replacement.nodeId}`);
          return {
            success: false,
            nodeId: replacement.nodeId,
            error: `Node not found: ${replacement.nodeId}`
          };
        }

        if (textNode.type !== "TEXT") {
          console.error(`Node is not a text node: ${replacement.nodeId} (type: ${textNode.type})`);
          return {
            success: false,
            nodeId: replacement.nodeId,
            error: `Node is not a text node: ${replacement.nodeId} (type: ${textNode.type})`
          };
        }

        // Save original text for the result
        const originalText = textNode.characters;
        console.log(`Original text: "${originalText}"`);
        console.log(`Will translate to: "${replacement.text}"`);

        // Highlight the node before changing text
        let originalFills;
        try {
          // Save original fills for restoration later
          originalFills = JSON.parse(JSON.stringify(textNode.fills));
          // Apply highlight color (orange with 30% opacity)
          textNode.fills = [
            {
              type: "SOLID",
              color: { r: 1, g: 0.5, b: 0 },
              opacity: 0.3,
            },
          ];
        } catch (highlightErr) {
          console.error(`Error highlighting text node: ${highlightErr.message}`);
          // Continue anyway, highlighting is just visual feedback
        }

        // Use the existing setTextContent function to handle font loading and text setting
        await setTextContent({
          nodeId: replacement.nodeId,
          text: replacement.text
        });

        // Keep highlight for a moment after text change, then restore original fills
        if (originalFills) {
          try {
            // Use delay function for consistent timing
            await delay(500);
            textNode.fills = originalFills;
          } catch (restoreErr) {
            console.error(`Error restoring fills: ${restoreErr.message}`);
          }
        }

        console.log(`Successfully replaced text in node: ${replacement.nodeId}`);
        return {
          success: true,
          nodeId: replacement.nodeId,
          originalText: originalText,
          translatedText: replacement.text
        };
      } catch (error) {
        console.error(`Error replacing text in node ${replacement.nodeId}: ${error.message}`);
        return {
          success: false,
          nodeId: replacement.nodeId,
          error: `Error applying replacement: ${error.message}`
        };
      }
    });

    // Wait for all replacements in this chunk to complete
    const chunkResults = await Promise.all(chunkPromises);

    // Process results for this chunk
    chunkResults.forEach(result => {
      if (result.success) {
        successCount++;
      } else {
        failureCount++;
      }
      results.push(result);
    });

    // Send chunk processing complete update with partial results
    sendProgressUpdate(
      commandId,
      'set_multiple_text_contents',
      'in_progress',
      Math.round(5 + (((chunkIndex + 1) / chunks.length) * 90)), // 5-95% for processing
      text.length,
      successCount + failureCount,
      `Completed chunk ${chunkIndex + 1}/${chunks.length}. ${successCount} successful, ${failureCount} failed so far.`,
      {
        currentChunk: chunkIndex + 1,
        totalChunks: chunks.length,
        successCount,
        failureCount,
        chunkResults: chunkResults
      }
    );

    // Add a small delay between chunks to avoid overloading Figma
    if (chunkIndex < chunks.length - 1) {
      console.log('Pausing between chunks to avoid overloading Figma...');
      await delay(1000); // 1 second delay between chunks
    }
  }

  console.log(
    `Replacement complete: ${successCount} successful, ${failureCount} failed`
  );

  // Send completed progress update
  sendProgressUpdate(
    commandId,
    'set_multiple_text_contents',
    'completed',
    100,
    text.length,
    successCount + failureCount,
    `Text replacement complete: ${successCount} successful, ${failureCount} failed`,
    {
      totalReplacements: text.length,
      replacementsApplied: successCount,
      replacementsFailed: failureCount,
      completedInChunks: chunks.length,
      results: results
    }
  );

  return {
    success: successCount > 0,
    nodeId: nodeId,
    replacementsApplied: successCount,
    replacementsFailed: failureCount,
    totalReplacements: text.length,
    results: results,
    completedInChunks: chunks.length,
    commandId
  };
}

// Function to generate simple UUIDs for command IDs
function generateCommandId() {
  return 'cmd_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

async function setAutoLayout(params) {
  const {
    nodeId,
    layoutMode,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    itemSpacing,
    primaryAxisAlignItems,
    counterAxisAlignItems,
    layoutWrap,
    strokesIncludedInLayout
  } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  if (!layoutMode) {
    throw new Error("Missing layoutMode parameter");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  // Check if the node is a frame or group
  if (!("layoutMode" in node)) {
    throw new Error(`Node does not support auto layout: ${nodeId}`);
  }

  // Configure layout mode
  if (layoutMode === "NONE") {
    node.layoutMode = "NONE";
  } else {
    // Set auto layout properties
    node.layoutMode = layoutMode;

    // Configure padding if provided
    if (paddingTop !== undefined) node.paddingTop = paddingTop;
    if (paddingBottom !== undefined) node.paddingBottom = paddingBottom;
    if (paddingLeft !== undefined) node.paddingLeft = paddingLeft;
    if (paddingRight !== undefined) node.paddingRight = paddingRight;

    // Configure item spacing
    if (itemSpacing !== undefined) node.itemSpacing = itemSpacing;

    // Configure alignment
    if (primaryAxisAlignItems !== undefined) {
      node.primaryAxisAlignItems = primaryAxisAlignItems;
    }

    if (counterAxisAlignItems !== undefined) {
      node.counterAxisAlignItems = counterAxisAlignItems;
    }

    // Configure wrap
    if (layoutWrap !== undefined) {
      node.layoutWrap = layoutWrap;
    }

    // Configure stroke inclusion
    if (strokesIncludedInLayout !== undefined) {
      node.strokesIncludedInLayout = strokesIncludedInLayout;
    }
  }

  return {
    id: node.id,
    name: node.name,
    layoutMode: node.layoutMode,
    paddingTop: node.paddingTop,
    paddingBottom: node.paddingBottom,
    paddingLeft: node.paddingLeft,
    paddingRight: node.paddingRight,
    itemSpacing: node.itemSpacing,
    primaryAxisAlignItems: node.primaryAxisAlignItems,
    counterAxisAlignItems: node.counterAxisAlignItems,
    layoutWrap: node.layoutWrap,
    strokesIncludedInLayout: node.strokesIncludedInLayout
  };
}

async function setLocked(params) {
  const { nodeId, locked } = params || {};
  if (!nodeId || locked === undefined) {
    throw new Error("Missing nodeId or locked");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (!("locked" in node)) {
    throw new Error(`Node does not support locking: ${nodeId}`);
  }

  node.locked = locked;
  return { id: node.id, name: node.name, locked: node.locked };
}

async function setVisible(params) {
  const { nodeId, visible } = params || {};
  if (!nodeId || visible === undefined) {
    throw new Error("Missing nodeId or visible");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  node.visible = visible;
  return { id: node.id, name: node.name, visible: node.visible };
}

async function reorderNode(params) {
  const { nodeId, newIndex } = params || {};
  if (!nodeId || newIndex === undefined) {
    throw new Error("Missing nodeId or newIndex");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  const parent = node.parent;
  if (!parent || !("insertChild" in parent) || !("children" in parent)) {
    throw new Error(`Node ${nodeId} does not have a reorderable parent`);
  }

  const clampedIndex = Math.max(0, Math.min(newIndex, parent.children.length - 1));
  parent.insertChild(clampedIndex, node);

  return {
    id: node.id,
    name: node.name,
    newIndex: parent.children.indexOf(node),
    parentId: parent.id,
  };
}

async function alignNodes(params) {
  const { nodeIds, alignment } = params || {};
  if (!nodeIds || !Array.isArray(nodeIds) || nodeIds.length < 2) {
    throw new Error("At least two nodeIds are required");
  }
  if (!alignment) {
    throw new Error("Missing alignment parameter");
  }

  const nodes = [];
  for (const nodeId of nodeIds) {
    const node = await figma.getNodeByIdAsync(nodeId);
    if (!node) throw new Error(`Node not found with ID: ${nodeId}`);
    if (!("x" in node) || !("y" in node) || !("width" in node) || !("height" in node)) {
      throw new Error(`Node ${nodeId} is not positionable`);
    }
    nodes.push(node);
  }

  const minX = Math.min(...nodes.map((n) => n.x));
  const maxX = Math.max(...nodes.map((n) => n.x + n.width));
  const minY = Math.min(...nodes.map((n) => n.y));
  const maxY = Math.max(...nodes.map((n) => n.y + n.height));
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  for (const node of nodes) {
    switch (alignment) {
      case "left":
        node.x = minX;
        break;
      case "center":
        node.x = centerX - node.width / 2;
        break;
      case "right":
        node.x = maxX - node.width;
        break;
      case "top":
        node.y = minY;
        break;
      case "middle":
        node.y = centerY - node.height / 2;
        break;
      case "bottom":
        node.y = maxY - node.height;
        break;
      default:
        throw new Error(`Unsupported alignment: ${alignment}`);
    }
  }

  return { alignment, alignedCount: nodes.length };
}

async function distributeNodes(params) {
  const { nodeIds, direction, spacing } = params || {};
  if (!nodeIds || !Array.isArray(nodeIds) || nodeIds.length < 3) {
    throw new Error("At least three nodeIds are required");
  }
  if (!direction) {
    throw new Error("Missing direction parameter");
  }

  const nodes = [];
  for (const nodeId of nodeIds) {
    const node = await figma.getNodeByIdAsync(nodeId);
    if (!node) throw new Error(`Node not found with ID: ${nodeId}`);
    if (!("x" in node) || !("y" in node) || !("width" in node) || !("height" in node)) {
      throw new Error(`Node ${nodeId} is not positionable`);
    }
    nodes.push(node);
  }

  const sorted = [...nodes].sort((a, b) =>
    direction === "horizontal" ? a.x - b.x : a.y - b.y
  );

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  let resolvedSpacing = spacing;
  if (resolvedSpacing === undefined) {
    if (direction === "horizontal") {
      const totalWidth = sorted.reduce((sum, n) => sum + n.width, 0);
      resolvedSpacing = ((last.x + last.width) - first.x - totalWidth) / (sorted.length - 1);
    } else {
      const totalHeight = sorted.reduce((sum, n) => sum + n.height, 0);
      resolvedSpacing = ((last.y + last.height) - first.y - totalHeight) / (sorted.length - 1);
    }
  }

  if (direction === "horizontal") {
    let cursor = first.x;
    for (const node of sorted) {
      node.x = cursor;
      cursor += node.width + resolvedSpacing;
    }
  } else {
    let cursor = first.y;
    for (const node of sorted) {
      node.y = cursor;
      cursor += node.height + resolvedSpacing;
    }
  }

  return {
    direction,
    distributedCount: sorted.length,
    spacing: resolvedSpacing,
  };
}

async function setConstraints(params) {
  const { nodeId, horizontal, vertical } = params || {};
  if (!nodeId || !horizontal || !vertical) {
    throw new Error("Missing nodeId or constraints");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (!("constraints" in node)) {
    throw new Error(`Node does not support constraints: ${nodeId}`);
  }

  node.constraints = { horizontal, vertical };
  return { id: node.id, name: node.name, constraints: node.constraints };
}

async function setBlendMode(params) {
  const { nodeId, blendMode } = params || {};
  if (!nodeId || !blendMode) {
    throw new Error("Missing nodeId or blendMode");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (!("blendMode" in node)) {
    throw new Error(`Node does not support blend mode: ${nodeId}`);
  }

  node.blendMode = blendMode;
  return { id: node.id, name: node.name, blendMode: node.blendMode };
}

async function setGradientFill(params) {
  const { nodeId, gradientType, stops } = params || {};
  if (!nodeId || !gradientType || !stops || stops.length < 2) {
    throw new Error("Missing nodeId, gradientType, or at least two stops");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (!("fills" in node)) {
    throw new Error(`Node does not support fills: ${nodeId}`);
  }

  // gradientTransform is a 2x3 matrix [[a, c, tx], [b, d, ty]]
  // Default: identity-like transform for a horizontal gradient
  const defaultTransformByType = {
    GRADIENT_LINEAR: [[1, 0, 0], [0, 1, 0]],
    GRADIENT_RADIAL: [[0.5, 0, 0.5], [0, 0.5, 0.5]],
    GRADIENT_ANGULAR: [[0.5, 0, 0.5], [0, 0.5, 0.5]],
    GRADIENT_DIAMOND: [[0.5, 0, 0.5], [0, 0.5, 0.5]],
  };

  node.fills = [
    {
      type: gradientType,
      gradientTransform: defaultTransformByType[gradientType],
      gradientStops: stops.map((stop) => ({
        position: stop.position,
        color: {
          r: stop.r,
          g: stop.g,
          b: stop.b,
          a: stop.a !== undefined ? stop.a : 1,
        },
      })),
    },
  ];

  return {
    id: node.id,
    name: node.name,
    gradientType,
    stopCount: stops.length,
  };
}

// Nuevas funciones para propiedades de texto

async function setFontName(params) {
  const { nodeId, family, style } = params || {};
  if (!nodeId || !family) {
    throw new Error("Missing nodeId or font family");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (node.type !== "TEXT") {
    throw new Error(`Node is not a text node: ${nodeId}`);
  }

  try {
    await figma.loadFontAsync({ family, style: style || "Regular" });
    node.fontName = { family, style: style || "Regular" };
    return {
      id: node.id,
      name: node.name,
      fontName: node.fontName
    };
  } catch (error) {
    throw new Error(`Error setting font name: ${error.message}`);
  }
}

async function setFontSize(params) {
  const { nodeId, fontSize } = params || {};
  if (!nodeId || fontSize === undefined) {
    throw new Error("Missing nodeId or fontSize");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (node.type !== "TEXT") {
    throw new Error(`Node is not a text node: ${nodeId}`);
  }

  try {
    await figma.loadFontAsync(node.fontName);
    node.fontSize = fontSize;
    return {
      id: node.id,
      name: node.name,
      fontSize: node.fontSize
    };
  } catch (error) {
    throw new Error(`Error setting font size: ${error.message}`);
  }
}

async function setFontWeight(params) {
  const { nodeId, weight } = params || {};
  if (!nodeId || weight === undefined) {
    throw new Error("Missing nodeId or weight");
  }

  // Map weight to font style
  const getFontStyle = (weight) => {
    switch (weight) {
      case 100: return "Thin";
      case 200: return "Extra Light";
      case 300: return "Light";
      case 400: return "Regular";
      case 500: return "Medium";
      case 600: return "Semi Bold";
      case 700: return "Bold";
      case 800: return "Extra Bold";
      case 900: return "Black";
      default: return "Regular";
    }
  };

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (node.type !== "TEXT") {
    throw new Error(`Node is not a text node: ${nodeId}`);
  }

  try {
    const family = node.fontName.family;
    const style = getFontStyle(weight);
    await figma.loadFontAsync({ family, style });
    node.fontName = { family, style };
    return {
      id: node.id,
      name: node.name,
      fontName: node.fontName,
      weight: weight
    };
  } catch (error) {
    throw new Error(`Error setting font weight: ${error.message}`);
  }
}

async function setLetterSpacing(params) {
  const { nodeId, letterSpacing, unit = "PIXELS" } = params || {};
  if (!nodeId || letterSpacing === undefined) {
    throw new Error("Missing nodeId or letterSpacing");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (node.type !== "TEXT") {
    throw new Error(`Node is not a text node: ${nodeId}`);
  }

  try {
    await figma.loadFontAsync(node.fontName);
    node.letterSpacing = { value: letterSpacing, unit };
    return {
      id: node.id,
      name: node.name,
      letterSpacing: node.letterSpacing
    };
  } catch (error) {
    throw new Error(`Error setting letter spacing: ${error.message}`);
  }
}

async function setLineHeight(params) {
  const { nodeId, lineHeight, unit = "PIXELS" } = params || {};
  if (!nodeId || lineHeight === undefined) {
    throw new Error("Missing nodeId or lineHeight");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (node.type !== "TEXT") {
    throw new Error(`Node is not a text node: ${nodeId}`);
  }

  try {
    await figma.loadFontAsync(node.fontName);
    node.lineHeight = { value: lineHeight, unit };
    return {
      id: node.id,
      name: node.name,
      lineHeight: node.lineHeight
    };
  } catch (error) {
    throw new Error(`Error setting line height: ${error.message}`);
  }
}

async function setParagraphSpacing(params) {
  const { nodeId, paragraphSpacing } = params || {};
  if (!nodeId || paragraphSpacing === undefined) {
    throw new Error("Missing nodeId or paragraphSpacing");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (node.type !== "TEXT") {
    throw new Error(`Node is not a text node: ${nodeId}`);
  }

  try {
    await figma.loadFontAsync(node.fontName);
    node.paragraphSpacing = paragraphSpacing;
    return {
      id: node.id,
      name: node.name,
      paragraphSpacing: node.paragraphSpacing
    };
  } catch (error) {
    throw new Error(`Error setting paragraph spacing: ${error.message}`);
  }
}

async function setTextCase(params) {
  const { nodeId, textCase } = params || {};
  if (!nodeId || textCase === undefined) {
    throw new Error("Missing nodeId or textCase");
  }

  // Valid textCase values: "ORIGINAL", "UPPER", "LOWER", "TITLE"
  if (!["ORIGINAL", "UPPER", "LOWER", "TITLE"].includes(textCase)) {
    throw new Error("Invalid textCase value. Must be one of: ORIGINAL, UPPER, LOWER, TITLE");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (node.type !== "TEXT") {
    throw new Error(`Node is not a text node: ${nodeId}`);
  }

  try {
    await figma.loadFontAsync(node.fontName);
    node.textCase = textCase;
    return {
      id: node.id,
      name: node.name,
      textCase: node.textCase
    };
  } catch (error) {
    throw new Error(`Error setting text case: ${error.message}`);
  }
}

async function setTextDecoration(params) {
  const { nodeId, textDecoration } = params || {};
  if (!nodeId || textDecoration === undefined) {
    throw new Error("Missing nodeId or textDecoration");
  }

  // Valid textDecoration values: "NONE", "UNDERLINE", "STRIKETHROUGH"
  if (!["NONE", "UNDERLINE", "STRIKETHROUGH"].includes(textDecoration)) {
    throw new Error("Invalid textDecoration value. Must be one of: NONE, UNDERLINE, STRIKETHROUGH");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (node.type !== "TEXT") {
    throw new Error(`Node is not a text node: ${nodeId}`);
  }

  try {
    await figma.loadFontAsync(node.fontName);
    node.textDecoration = textDecoration;
    return {
      id: node.id,
      name: node.name,
      textDecoration: node.textDecoration
    };
  } catch (error) {
    throw new Error(`Error setting text decoration: ${error.message}`);
  }
}

async function setTextAlign(params) {
  const { nodeId, textAlignHorizontal, textAlignVertical } = params || {};
  if (!nodeId) {
    throw new Error("Missing nodeId");
  }

  const validHorizontal = ["LEFT", "CENTER", "RIGHT", "JUSTIFIED"];
  const validVertical = ["TOP", "CENTER", "BOTTOM"];

  if (textAlignHorizontal && !validHorizontal.includes(textAlignHorizontal)) {
    throw new Error("Invalid textAlignHorizontal value. Must be one of: LEFT, CENTER, RIGHT, JUSTIFIED");
  }

  if (textAlignVertical && !validVertical.includes(textAlignVertical)) {
    throw new Error("Invalid textAlignVertical value. Must be one of: TOP, CENTER, BOTTOM");
  }

  if (!textAlignHorizontal && !textAlignVertical) {
    throw new Error("Must provide textAlignHorizontal or textAlignVertical");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (node.type !== "TEXT") {
    throw new Error(`Node is not a text node: ${nodeId}`);
  }

  try {
    await figma.loadFontAsync(node.fontName);
    if (textAlignHorizontal) {
      node.textAlignHorizontal = textAlignHorizontal;
    }
    if (textAlignVertical) {
      node.textAlignVertical = textAlignVertical;
    }
    return {
      id: node.id,
      name: node.name,
      textAlignHorizontal: node.textAlignHorizontal,
      textAlignVertical: node.textAlignVertical
    };
  } catch (error) {
    throw new Error(`Error setting text alignment: ${error.message}`);
  }
}

async function getStyledTextSegments(params) {
  const { nodeId, property } = params || {};
  if (!nodeId || !property) {
    throw new Error("Missing nodeId or property");
  }

  // Valid properties: "fillStyleId", "fontName", "fontSize", "textCase", 
  // "textDecoration", "textStyleId", "fills", "letterSpacing", "lineHeight", "fontWeight"
  const validProperties = [
    "fillStyleId", "fontName", "fontSize", "textCase",
    "textDecoration", "textStyleId", "fills", "letterSpacing",
    "lineHeight", "fontWeight"
  ];

  if (!validProperties.includes(property)) {
    throw new Error(`Invalid property. Must be one of: ${validProperties.join(", ")}`);
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (node.type !== "TEXT") {
    throw new Error(`Node is not a text node: ${nodeId}`);
  }

  try {
    const segments = node.getStyledTextSegments([property]);

    // Prepare segments data in a format safe for serialization
    const safeSegments = segments.map(segment => {
      const safeSegment = {
        characters: segment.characters,
        start: segment.start,
        end: segment.end
      };

      // Handle different property types for safe serialization
      if (property === "fontName") {
        if (segment[property] && typeof segment[property] === "object") {
          safeSegment[property] = {
            family: segment[property].family || "",
            style: segment[property].style || ""
          };
        } else {
          safeSegment[property] = { family: "", style: "" };
        }
      } else if (property === "letterSpacing" || property === "lineHeight") {
        // Handle spacing properties which have a value and unit
        if (segment[property] && typeof segment[property] === "object") {
          safeSegment[property] = {
            value: segment[property].value || 0,
            unit: segment[property].unit || "PIXELS"
          };
        } else {
          safeSegment[property] = { value: 0, unit: "PIXELS" };
        }
      } else if (property === "fills") {
        // Handle fills which can be complex
        safeSegment[property] = segment[property] ? JSON.parse(JSON.stringify(segment[property])) : [];
      } else {
        // Handle simple properties
        safeSegment[property] = segment[property];
      }

      return safeSegment;
    });

    return {
      id: node.id,
      name: node.name,
      property: property,
      segments: safeSegments
    };
  } catch (error) {
    throw new Error(`Error getting styled text segments: ${error.message}`);
  }
}

async function loadFontAsyncWrapper(params) {
  const { family, style = "Regular" } = params || {};
  if (!family) {
    throw new Error("Missing font family");
  }

  try {
    await figma.loadFontAsync({ family, style });
    return {
      success: true,
      family: family,
      style: style,
      message: `Successfully loaded ${family} ${style}`
    };
  } catch (error) {
    throw new Error(`Error loading font: ${error.message}`);
  }
}

async function getRemoteComponents() {
  try {
    // Check if figma.teamLibrary is available
    if (!figma.teamLibrary) {
      console.error("Error: figma.teamLibrary API is not available");
      throw new Error("The figma.teamLibrary API is not available in this context");
    }

    // Check if figma.teamLibrary.getAvailableComponentsAsync exists
    if (!figma.teamLibrary.getAvailableComponentsAsync) {
      console.error("Error: figma.teamLibrary.getAvailableComponentsAsync is not available");
      throw new Error("The getAvailableComponentsAsync method is not available");
    }

    console.log("Starting remote components retrieval...");

    // Set up a manual timeout to detect deadlocks
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Internal timeout while retrieving remote components (45s)"));
      }, 45000); // 45 seconds internal timeout
    });

    // Execute the request with a manual timeout
    const fetchPromise = figma.teamLibrary.getAvailableComponentsAsync();

    // Use Promise.race to implement the timeout
    const teamComponents = await Promise.race([fetchPromise, timeoutPromise])
      .finally(() => {
        clearTimeout(timeoutId); // Clear the timeout
      });

    console.log(`Retrieved ${teamComponents.length} remote components`);

    return {
      success: true,
      count: teamComponents.length,
      components: teamComponents.map(component => ({
        key: component.key,
        name: component.name,
        description: component.description || "",
        libraryName: component.libraryName
      }))
    };
  } catch (error) {
    console.error(`Detailed error retrieving remote components: ${error.message || "Unknown error"}`);
    console.error(`Stack trace: ${error.stack || "Not available"}`);

    // Instead of returning an error object, throw an exception with the error message
    throw new Error(`Error retrieving remote components: ${error.message}`);
  }
}

// Set Effects Tool
async function setEffects(params) {
  const { nodeId, effects } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  if (!effects || !Array.isArray(effects)) {
    throw new Error("Missing or invalid effects parameter. Must be an array.");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (!("effects" in node)) {
    throw new Error(`Node does not support effects: ${nodeId}`);
  }

  try {
    // Convert incoming effects to valid Figma effects
    const validEffects = effects.map(effect => {
      // Ensure all effects have the required properties
      if (!effect.type) {
        throw new Error("Each effect must have a type property");
      }

      // Create a clean effect object based on type
      switch (effect.type) {
        case "DROP_SHADOW":
        case "INNER_SHADOW":
          return {
            type: effect.type,
            color: effect.color || { r: 0, g: 0, b: 0, a: 0.5 },
            offset: effect.offset || { x: 0, y: 0 },
            radius: effect.radius || 5,
            spread: effect.spread || 0,
            visible: effect.visible !== undefined ? effect.visible : true,
            blendMode: effect.blendMode || "NORMAL"
          };
        case "LAYER_BLUR":
        case "BACKGROUND_BLUR":
          return {
            type: effect.type,
            radius: effect.radius || 5,
            visible: effect.visible !== undefined ? effect.visible : true
          };
        default:
          throw new Error(`Unsupported effect type: ${effect.type}`);
      }
    });

    // Apply the effects to the node
    node.effects = validEffects;

    return {
      id: node.id,
      name: node.name,
      effects: node.effects
    };
  } catch (error) {
    throw new Error(`Error setting effects: ${error.message}`);
  }
}

// Set Effect Style ID Tool
async function setEffectStyleId(params) {
  const { nodeId, effectStyleId } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  if (!effectStyleId) {
    throw new Error("Missing effectStyleId parameter");
  }

  try {
    // Set up a manual timeout to detect long operations
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Timeout while setting effect style ID (20s). The operation took too long to complete."));
      }, 20000); // 20 seconds timeout
    });

    console.log(`Starting to set effect style ID ${effectStyleId} on node ${nodeId}...`);

    // Get node and validate in a promise
    const nodePromise = (async () => {
      const node = await getNodeByIdSafe(nodeId);
      if (!node) {
        throw new Error(`Node not found with ID: ${nodeId}`);
      }

      if (!("effectStyleId" in node)) {
        throw new Error(`Node with ID ${nodeId} does not support effect styles`);
      }

      // Try to validate the effect style exists before applying
      console.log(`Fetching effect styles to validate style ID: ${effectStyleId}`);
      const effectStyles = await figma.getLocalEffectStylesAsync();
      const foundStyle = effectStyles.find(style => style.id === effectStyleId);

      if (!foundStyle) {
        throw new Error(`Effect style not found with ID: ${effectStyleId}. Available styles: ${effectStyles.length}`);
      }

      console.log(`Effect style found, applying to node...`);

      // Apply the effect style to the node
      node.effectStyleId = effectStyleId;

      return {
        id: node.id,
        name: node.name,
        effectStyleId: node.effectStyleId,
        appliedEffects: node.effects
      };
    })();

    // Race between the node operation and the timeout
    const result = await Promise.race([nodePromise, timeoutPromise])
      .finally(() => {
        // Clear the timeout to prevent memory leaks
        clearTimeout(timeoutId);
      });

    console.log(`Successfully set effect style ID on node ${nodeId}`);
    return result;
  } catch (error) {
    console.error(`Error setting effect style ID: ${error.message || "Unknown error"}`);
    console.error(`Stack trace: ${error.stack || "Not available"}`);

    // Proporcionar mensajes de error específicos para diferentes casos
    if (error.message.includes("timeout") || error.message.includes("Timeout")) {
      throw new Error(`The operation timed out after 8 seconds. This could happen with complex nodes or effects. Try with a simpler node or effect style.`);
    } else if (error.message.includes("not found") && error.message.includes("Node")) {
      throw new Error(`Node with ID "${nodeId}" not found. Make sure the node exists in the current document.`);
    } else if (error.message.includes("not found") && error.message.includes("style")) {
      throw new Error(`Effect style with ID "${effectStyleId}" not found. Make sure the style exists in your local styles.`);
    } else if (error.message.includes("does not support")) {
      throw new Error(`The selected node type does not support effect styles. Only certain node types like frames, components, and instances can have effect styles.`);
    } else {
      throw new Error(`Error setting effect style ID: ${error.message}`);
    }
  }
}

// Set Text Style ID Tool
async function setTextStyleId(params) {
  const { nodeId, textStyleId } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  if (!textStyleId) {
    throw new Error("Missing textStyleId parameter");
  }

  try {
    // Set up a manual timeout to detect long operations
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Timeout while setting text style ID (8s). The operation took too long to complete."));
      }, 8000); // 8 seconds timeout
    });

    console.log(`Starting to set text style ID ${textStyleId} on node ${nodeId}...`);

    // Get node and validate in a promise
    const nodePromise = (async () => {
      const node = await getNodeByIdSafe(nodeId);
      if (!node) {
        throw new Error(`Node not found with ID: ${nodeId}`);
      }

      if (node.type !== "TEXT") {
        throw new Error(`Node with ID ${nodeId} is not a text node (type: ${node.type})`);
      }

      // Try to validate the text style exists before applying
      console.log(`Fetching text styles to validate style ID: ${textStyleId}`);
      const textStyles = await figma.getLocalTextStylesAsync();
      // Look for the style by ID or by Key (LLMs often pass the key which is a cleaner hex string)
      const foundStyle = textStyles.find(style => style.id === textStyleId || style.key === textStyleId);

      if (!foundStyle) {
        throw new Error(`Text style with ID "${textStyleId}" not found. Make sure the style exists in your local styles.`);
      }

      // Ensure we use the full Figma ID for applying the style
      const actualStyleId = foundStyle.id;

      console.log(`Text style "${foundStyle.name}" found, applying to node...`);

      // Load the font from the style before applying
      await figma.loadFontAsync(foundStyle.fontName);

      // Apply the text style to the node
      await node.setTextStyleIdAsync(actualStyleId);

      return {
        id: node.id,
        name: node.name,
        textStyleId: node.textStyleId,
        styleName: foundStyle.name
      };
    })();

    // Race between the node operation and the timeout
    const result = await Promise.race([nodePromise, timeoutPromise])
      .finally(() => {
        // Clear the timeout to prevent memory leaks
        clearTimeout(timeoutId);
      });

    console.log(`Successfully set text style ID on node ${nodeId}`);
    return result;
  } catch (error) {
    console.error(`Error setting text style ID: ${error.message || "Unknown error"}`);
    console.error(`Stack trace: ${error.stack || "Not available"}`);

    // Provide specific error messages for different cases
    if (error.message.includes("timeout") || error.message.includes("Timeout")) {
      throw new Error(`The operation timed out after 8 seconds. This could happen with complex nodes. Try with a simpler node.`);
    } else if (error.message.includes("not found") && error.message.includes("Node")) {
      throw new Error(`Node with ID "${nodeId}" not found. Make sure the node exists in the current document.`);
    } else if (error.message.includes("not found") && error.message.includes("style")) {
      throw new Error(`Text style with ID "${textStyleId}" not found. Make sure the style exists in your local styles.`);
    } else if (error.message.includes("not a text node")) {
      throw new Error(`The selected node is not a text node. Only text nodes can have text styles applied.`);
    } else {
      throw new Error(`Error setting text style ID: ${error.message}`);
    }
  }
}

// Create Paint Style Tool
async function createPaintStyle(params) {
  const { name, color, description } = params || {};

  if (!name) {
    throw new Error("Missing name parameter");
  }

  if (!color || typeof color !== "object") {
    throw new Error("Missing color parameter");
  }

  const { r, g, b, a } = color;
  if (r === undefined || g === undefined || b === undefined) {
    throw new Error("Color must include r, g, and b components");
  }

  const style = figma.createPaintStyle();
  style.name = name;
  if (description !== undefined) {
    style.description = description;
  }

  style.paints = [
    {
      type: "SOLID",
      color: { r, g, b },
      opacity: a !== undefined ? a : 1,
    },
  ];

  return {
    id: style.id,
    name: style.name,
    key: style.key,
    paint: style.paints[0],
  };
}

// Create Text Style Tool
async function createTextStyle(params) {
  const {
    name,
    fontFamily = "Inter",
    fontStyle = "Regular",
    fontSize = 16,
    lineHeightPx,
    letterSpacingPx,
    description,
  } = params || {};

  if (!name) {
    throw new Error("Missing name parameter");
  }

  await figma.loadFontAsync({ family: fontFamily, style: fontStyle });

  const style = figma.createTextStyle();
  style.name = name;
  if (description !== undefined) {
    style.description = description;
  }

  style.fontName = { family: fontFamily, style: fontStyle };
  style.fontSize = fontSize;

  if (lineHeightPx !== undefined) {
    style.lineHeight = { unit: "PIXELS", value: lineHeightPx };
  }

  if (letterSpacingPx !== undefined) {
    style.letterSpacing = { unit: "PIXELS", value: letterSpacingPx };
  }

  return {
    id: style.id,
    name: style.name,
    key: style.key,
    fontName: style.fontName,
    fontSize: style.fontSize,
  };
}

// Set Fill Style ID Tool
async function setFillStyleId(params) {
  console.log("[setFillStyleId] params:", JSON.stringify(params));
  const { nodeId, fillStyleId } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  if (!fillStyleId) {
    throw new Error("Missing fillStyleId parameter");
  }

  console.log("[setFillStyleId] Getting node:", nodeId);
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }
  console.log("[setFillStyleId] Node found:", node.name, node.type);

  if (!("fillStyleId" in node)) {
    throw new Error(`Node with ID ${nodeId} does not support fill styles`);
  }

  console.log("[setFillStyleId] Getting paint styles...");
  const paintStyles = await figma.getLocalPaintStylesAsync();
  console.log("[setFillStyleId] Found paint styles:", paintStyles.length);
  paintStyles.forEach((s) => console.log(`  - ${s.name}: id=${s.id}, key=${s.key}`));

  const foundStyle = paintStyles.find(
    (style) => style.id === fillStyleId || style.key === fillStyleId
  );

  if (!foundStyle) {
    throw new Error(`Paint style with ID "${fillStyleId}" not found. Make sure the style exists in your local styles.`);
  }

  console.log("[setFillStyleId] Applying style:", foundStyle.name);
  await node.setFillStyleIdAsync(foundStyle.id);
  console.log("[setFillStyleId] Style applied successfully");

  return {
    id: node.id,
    name: node.name,
    fillStyleId: foundStyle.id,
    styleName: foundStyle.name,
  };
}

// Function to group nodes
async function groupNodes(params) {
  const { nodeIds, name } = params || {};

  if (!nodeIds || !Array.isArray(nodeIds) || nodeIds.length < 2) {
    throw new Error("Must provide at least two nodeIds to group");
  }

  try {
    // Get all nodes to be grouped
    const nodesToGroup = [];
    for (const nodeId of nodeIds) {
      const node = await getNodeByIdSafe(nodeId);
      if (!node) {
        throw new Error(`Node not found with ID: ${nodeId}`);
      }
      nodesToGroup.push(node);
    }

    // Verify that all nodes have the same parent
    const parent = nodesToGroup[0].parent;
    for (const node of nodesToGroup) {
      if (node.parent !== parent) {
        throw new Error("All nodes must have the same parent to be grouped");
      }
    }

    // Create a group and add the nodes to it
    const group = figma.group(nodesToGroup, parent);

    // Optionally set a name for the group
    if (name) {
      group.name = name;
    }

    return {
      id: group.id,
      name: group.name,
      type: group.type,
      children: group.children.map(child => ({ id: child.id, name: child.name, type: child.type }))
    };
  } catch (error) {
    throw new Error(`Error grouping nodes: ${error.message}`);
  }
}

// Function to ungroup nodes
async function ungroupNodes(params) {
  const { nodeId } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  try {
    const node = await getNodeByIdSafe(nodeId);
    if (!node) {
      throw new Error(`Node not found with ID: ${nodeId}`);
    }

    // Verify that the node is a group or a frame
    if (node.type !== "GROUP" && node.type !== "FRAME") {
      throw new Error(`Node with ID ${nodeId} is not a GROUP or FRAME`);
    }

    // Get the parent and children before ungrouping
    const parent = node.parent;
    const children = [...node.children];

    // Ungroup the node
    const ungroupedItems = figma.ungroup(node);

    return {
      success: true,
      ungroupedCount: ungroupedItems.length,
      items: ungroupedItems.map(item => ({ id: item.id, name: item.name, type: item.type }))
    };
  } catch (error) {
    throw new Error(`Error ungrouping node: ${error.message}`);
  }
}

// Function to flatten nodes (e.g., boolean operations, convert to path)
async function flattenNode(params) {
  const { nodeId } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  try {
    const node = await getNodeByIdSafe(nodeId);
    if (!node) {
      throw new Error(`Node not found with ID: ${nodeId}`);
    }

    // Check for specific node types that can be flattened
    const flattenableTypes = ["VECTOR", "BOOLEAN_OPERATION", "STAR", "POLYGON", "ELLIPSE", "RECTANGLE"];

    if (!flattenableTypes.includes(node.type)) {
      throw new Error(`Node with ID ${nodeId} and type ${node.type} cannot be flattened. Only vector-based nodes can be flattened.`);
    }

    // Verify the node has the flatten method before calling it
    if (typeof node.flatten !== 'function') {
      throw new Error(`Node with ID ${nodeId} does not support the flatten operation.`);
    }

    // Implement a timeout mechanism
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Flatten operation timed out after 20 seconds. The node may be too complex."));
      }, 20000); // 20 seconds timeout
    });

    // Execute the flatten operation in a promise
    const flattenPromise = new Promise((resolve, reject) => {
      // Execute in the next tick to allow UI updates
      setTimeout(() => {
        try {
          console.log(`Starting flatten operation for node ID ${nodeId}...`);
          const flattened = node.flatten();
          console.log(`Flatten operation completed successfully for node ID ${nodeId}`);
          resolve(flattened);
        } catch (err) {
          console.error(`Error during flatten operation: ${err.message}`);
          reject(err);
        }
      }, 0);
    });

    // Race between the timeout and the operation
    const flattened = await Promise.race([flattenPromise, timeoutPromise])
      .finally(() => {
        // Clear the timeout to prevent memory leaks
        clearTimeout(timeoutId);
      });

    return {
      id: flattened.id,
      name: flattened.name,
      type: flattened.type
    };
  } catch (error) {
    console.error(`Error in flattenNode: ${error.message}`);
    if (error.message.includes("timed out")) {
      // Provide a more helpful message for timeout errors
      throw new Error(`The flatten operation timed out. This usually happens with complex nodes. Try simplifying the node first or breaking it into smaller parts.`);
    } else {
      throw new Error(`Error flattening node: ${error.message}`);
    }
  }
}

// Function to insert a child into a parent node
async function insertChild(params) {
  const { parentId, childId, index } = params || {};

  if (!parentId) {
    throw new Error("Missing parentId parameter");
  }

  if (!childId) {
    throw new Error("Missing childId parameter");
  }

  try {
    // Get the parent and child nodes
    const parent = await getNodeByIdSafe(parentId);
    if (!parent) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }

    const child = await getNodeByIdSafe(childId);
    if (!child) {
      throw new Error(`Child node not found with ID: ${childId}`);
    }

    // Check if the parent can have children
    if (!("appendChild" in parent)) {
      throw new Error(`Parent node with ID ${parentId} cannot have children`);
    }

    // Save child's current parent for proper handling
    const originalParent = child.parent;

    // Insert the child at the specified index or append it
    if (index !== undefined && index >= 0 && index <= parent.children.length) {
      parent.insertChild(index, child);
    } else {
      parent.appendChild(child);
    }

    // Verify that the insertion worked
    const newIndex = parent.children.indexOf(child);

    return {
      parentId: parent.id,
      childId: child.id,
      index: newIndex,
      success: newIndex !== -1,
      previousParentId: originalParent ? originalParent.id : null
    };
  } catch (error) {
    console.error(`Error inserting child: ${error.message}`, error);
    throw new Error(`Error inserting child: ${error.message}`);
  }
}

async function createEllipse(params) {
  const {
    x = 0,
    y = 0,
    width = 100,
    height = 100,
    name = "Ellipse",
    parentId,
    fillColor = { r: 0.8, g: 0.8, b: 0.8, a: 1 },
    strokeColor,
    strokeWeight
  } = params || {};

  // Create a new ellipse node
  const ellipse = figma.createEllipse();
  ellipse.name = name;

  // Position and size the ellipse
  ellipse.x = x;
  ellipse.y = y;
  ellipse.resize(width, height);

  // Set fill color if provided
  if (fillColor) {
    var fillPaint = safePaint(fillColor);
    if (fillPaint) ellipse.fills = [fillPaint];
  }

  // Set stroke color and weight if provided
  if (strokeColor) {
    var strokePaint = safePaint(strokeColor);
    if (strokePaint) ellipse.strokes = [strokePaint];
  }

  if (strokeWeight !== undefined) {
    ellipse.strokeWeight = strokeWeight;
  }

  // If parentId is provided, append to that node, otherwise append to current page
  if (parentId) {
    const parentNode = await getNodeByIdSafe(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    parentNode.appendChild(ellipse);
  } else {
    figma.currentPage.appendChild(ellipse);
  }

  return {
    id: ellipse.id,
    name: ellipse.name,
    type: ellipse.type,
    x: ellipse.x,
    y: ellipse.y,
    width: ellipse.width,
    height: ellipse.height
  };
}

async function createPolygon(params) {
  const {
    x = 0,
    y = 0,
    width = 100,
    height = 100,
    sides = 6,
    name = "Polygon",
    parentId,
    fillColor,
    strokeColor,
    strokeWeight
  } = params || {};

  // Create the polygon
  const polygon = figma.createPolygon();
  polygon.x = x;
  polygon.y = y;
  polygon.resize(width, height);
  polygon.name = name;

  // Set the number of sides
  if (sides >= 3) {
    polygon.pointCount = sides;
  }

  // Set fill color if provided
  if (fillColor) {
    var fillPaint = safePaint(fillColor);
    if (fillPaint) polygon.fills = [fillPaint];
  }

  // Set stroke color and weight if provided
  if (strokeColor) {
    var strokePaint = safePaint(strokeColor);
    if (strokePaint) polygon.strokes = [strokePaint];
  }

  if (strokeWeight !== undefined) {
    polygon.strokeWeight = strokeWeight;
  }

  // If parentId is provided, append to that node, otherwise append to current page
  if (parentId) {
    const parentNode = await getNodeByIdSafe(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    parentNode.appendChild(polygon);
  } else {
    figma.currentPage.appendChild(polygon);
  }

  return {
    id: polygon.id,
    name: polygon.name,
    type: polygon.type,
    x: polygon.x,
    y: polygon.y,
    width: polygon.width,
    height: polygon.height,
    pointCount: polygon.pointCount,
    fills: polygon.fills,
    strokes: polygon.strokes,
    strokeWeight: polygon.strokeWeight,
    parentId: polygon.parent ? polygon.parent.id : undefined,
  };
}

async function createStar(params) {
  const {
    x = 0,
    y = 0,
    width = 100,
    height = 100,
    points = 5,
    innerRadius = 0.5, // As a proportion of the outer radius
    name = "Star",
    parentId,
    fillColor,
    strokeColor,
    strokeWeight
  } = params || {};

  // Create the star
  const star = figma.createStar();
  star.x = x;
  star.y = y;
  star.resize(width, height);
  star.name = name;

  // Set the number of points
  if (points >= 3) {
    star.pointCount = points;
  }

  // Set the inner radius ratio
  if (innerRadius > 0 && innerRadius < 1) {
    star.innerRadius = innerRadius;
  }

  // Set fill color if provided
  if (fillColor) {
    var fillPaint = safePaint(fillColor);
    if (fillPaint) star.fills = [fillPaint];
  }

  // Set stroke color and weight if provided
  if (strokeColor) {
    var strokePaint = safePaint(strokeColor);
    if (strokePaint) star.strokes = [strokePaint];
  }

  if (strokeWeight !== undefined) {
    star.strokeWeight = strokeWeight;
  }

  // If parentId is provided, append to that node, otherwise append to current page
  if (parentId) {
    const parentNode = await getNodeByIdSafe(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    parentNode.appendChild(star);
  } else {
    figma.currentPage.appendChild(star);
  }

  return {
    id: star.id,
    name: star.name,
    type: star.type,
    x: star.x,
    y: star.y,
    width: star.width,
    height: star.height,
    pointCount: star.pointCount,
    innerRadius: star.innerRadius,
    fills: star.fills,
    strokes: star.strokes,
    strokeWeight: star.strokeWeight,
    parentId: star.parent ? star.parent.id : undefined,
  };
}

async function createVector(params) {
  const {
    x = 0,
    y = 0,
    width = 100,
    height = 100,
    name = "Vector",
    parentId,
    vectorPaths = [],
    fillColor,
    strokeColor,
    strokeWeight
  } = params || {};

  // Create the vector
  const vector = figma.createVector();
  vector.x = x;
  vector.y = y;
  vector.resize(width, height);
  vector.name = name;

  // Set vector paths if provided
  if (vectorPaths && vectorPaths.length > 0) {
    vector.vectorPaths = vectorPaths.map(path => {
      return {
        windingRule: path.windingRule || "EVENODD",
        data: path.data || ""
      };
    });
  }

  // Set fill color if provided
  if (fillColor) {
    const paintStyle = {
      type: "SOLID",
      color: {
        r: parseFloat(fillColor.r) || 0,
        g: parseFloat(fillColor.g) || 0,
        b: parseFloat(fillColor.b) || 0,
      },
      opacity: parseFloat(fillColor.a) || 1,
    };
    vector.fills = [paintStyle];
  }

  // Set stroke color and weight if provided
  if (strokeColor) {
    const strokeStyle = {
      type: "SOLID",
      color: {
        r: parseFloat(strokeColor.r) || 0,
        g: parseFloat(strokeColor.g) || 0,
        b: parseFloat(strokeColor.b) || 0,
      },
      opacity: parseFloat(strokeColor.a) || 1,
    };
    vector.strokes = [strokeStyle];
  }

  // Set stroke weight if provided
  if (strokeWeight !== undefined) {
    vector.strokeWeight = strokeWeight;
  }

  // If parentId is provided, append to that node, otherwise append to current page
  if (parentId) {
    const parentNode = await getNodeByIdSafe(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    parentNode.appendChild(vector);
  } else {
    figma.currentPage.appendChild(vector);
  }

  return {
    id: vector.id,
    name: vector.name,
    type: vector.type,
    x: vector.x,
    y: vector.y,
    width: vector.width,
    height: vector.height,
    vectorNetwork: vector.vectorNetwork,
    fills: vector.fills,
    strokes: vector.strokes,
    strokeWeight: vector.strokeWeight,
    parentId: vector.parent ? vector.parent.id : undefined,
  };
}

async function createLine(params) {
  const {
    x1 = 0,
    y1 = 0,
    x2 = 100,
    y2 = 0,
    name = "Line",
    parentId,
    strokeColor = { r: 0, g: 0, b: 0, a: 1 },
    strokeWeight = 1,
    strokeCap = "NONE" // Can be "NONE", "ROUND", "SQUARE", "ARROW_LINES", or "ARROW_EQUILATERAL"
  } = params || {};

  // Create a vector node to represent the line
  const line = figma.createVector();
  line.name = name;

  // Position the line at the starting point
  line.x = x1;
  line.y = y1;

  // Calculate the vector size
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  line.resize(width > 0 ? width : 1, height > 0 ? height : 1);

  // Create vector path data for a straight line
  // SVG path data format: M (move to) starting point, L (line to) ending point
  const dx = x2 - x1;
  const dy = y2 - y1;

  // Calculate relative endpoint coordinates in the vector's local coordinate system
  const endX = dx > 0 ? width : 0;
  const endY = dy > 0 ? height : 0;
  const startX = dx > 0 ? 0 : width;
  const startY = dy > 0 ? 0 : height;

  // Generate SVG path data for the line
  const pathData = `M ${startX} ${startY} L ${endX} ${endY}`;

  // Set vector paths
  line.vectorPaths = [{
    windingRule: "NONZERO",
    data: pathData
  }];

  // Set stroke color
  const strokeStyle = {
    type: "SOLID",
    color: {
      r: parseFloat(strokeColor.r) || 0,
      g: parseFloat(strokeColor.g) || 0,
      b: parseFloat(strokeColor.b) || 0,
    },
    opacity: parseFloat(strokeColor.a) || 1
  };
  line.strokes = [strokeStyle];

  // Set stroke weight
  line.strokeWeight = strokeWeight;

  // Set stroke cap style if supported
  if (["NONE", "ROUND", "SQUARE", "ARROW_LINES", "ARROW_EQUILATERAL"].includes(strokeCap)) {
    line.strokeCap = strokeCap;
  }

  // Set fill to none (transparent) as lines typically don't have fills
  line.fills = [];

  // If parentId is provided, append to that node, otherwise append to current page
  if (parentId) {
    const parentNode = await getNodeByIdSafe(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    parentNode.appendChild(line);
  } else {
    figma.currentPage.appendChild(line);
  }

  return {
    id: line.id,
    name: line.name,
    type: line.type,
    x: line.x,
    y: line.y,
    width: line.width,
    height: line.height,
    strokeWeight: line.strokeWeight,
    strokeCap: line.strokeCap,
    strokes: line.strokes,
    vectorPaths: line.vectorPaths,
    parentId: line.parent ? line.parent.id : undefined
  };
}

// Rename a node (frame, component, group, etc.)
async function renameNode(params) {
  const { nodeId, name } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  if (!name) {
    throw new Error("Missing name parameter");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (node.type === "DOCUMENT") {
    throw new Error("Cannot rename the document node");
  }

  const oldName = node.name;
  node.name = name;

  return {
    id: node.id,
    name: node.name,
    oldName: oldName,
    type: node.type
  };
}

// Create component from an existing node
async function createComponentFromNode(params) {
  const { nodeId, name, parentId } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  // Check if the node can be converted to a component
  if (node.type === "DOCUMENT" || node.type === "PAGE") {
    throw new Error(`Cannot create component from ${node.type}`);
  }

  // If already a component, return its info
  if (node.type === "COMPONENT") {
    return {
      id: node.id,
      name: node.name,
      key: node.key,
      alreadyComponent: true
    };
  }

  let component;

  // For frames, groups, and other container nodes, we can use createComponentFromNode
  if ("createComponentFromNode" in figma && (node.type === "FRAME" || node.type === "GROUP" || node.type === "INSTANCE")) {
    // Use Figma's built-in createComponentFromNode API
    component = figma.createComponentFromNode(node);
  } else {
    // For other node types, we need a different approach
    // Create a new component and copy properties from the original node
    const parent = node.parent;
    const index = parent ? parent.children.indexOf(node) : 0;

    // Create frame first if it's not a frame-like node
    if (node.type === "RECTANGLE" || node.type === "ELLIPSE" || node.type === "POLYGON" ||
      node.type === "STAR" || node.type === "VECTOR" || node.type === "TEXT" || node.type === "LINE") {
      // Create a component and add the node as a child
      component = figma.createComponent();
      component.x = node.x;
      component.y = node.y;
      component.resize(node.width, node.height);

      // Clone the node and add it to the component
      const clone = node.clone();
      clone.x = 0;
      clone.y = 0;

      // If parentId is provided, append to that node, otherwise append to current page
      if (parentId) {
        const parentNode = await getNodeByIdSafe(parentId);
        if (!parentNode) {
          throw new Error(`Parent node not found with ID: ${parentId}`);
        }
        if (!("appendChild" in parentNode)) {
          throw new Error(`Parent node does not support children: ${parentId}`);
        }
        parentNode.appendChild(component);
      } else {
        figma.currentPage.appendChild(component);
      }
      component.appendChild(clone);

      // Add component to the same parent at the same position
      if (parent && "insertChild" in parent) {
        parent.insertChild(index, component);
      } else {
        figma.currentPage.appendChild(component);
      }

      // Remove the original node
      node.remove();
    } else if (node.type === "FRAME" || node.type === "GROUP") {
      // Fallback for frames/groups if createComponentFromNode is not available
      component = figma.createComponent();
      component.x = node.x;
      component.y = node.y;
      component.resize(node.width, node.height);

      // Copy children
      for (const child of [...node.children]) {
        component.appendChild(child);
      }

      // Copy visual properties if available
      if ("fills" in node && "fills" in component) {
        component.fills = node.fills;
      }
      if ("strokes" in node && "strokes" in component) {
        component.strokes = node.strokes;
      }
      if ("effects" in node && "effects" in component) {
        component.effects = node.effects;
      }
      if ("cornerRadius" in node && "cornerRadius" in component) {
        component.cornerRadius = node.cornerRadius;
      }

      // Add component to the same parent
      if (parent && "insertChild" in parent) {
        parent.insertChild(index, component);
      } else {
        figma.currentPage.appendChild(component);
      }

      // Remove the original node
      node.remove();
    } else {
      throw new Error(`Cannot create component from node type: ${node.type}`);
    }
  }

  // Set the name if provided
  if (name) {
    component.name = name;
  }

  return {
    id: component.id,
    name: component.name,
    key: component.key,
    width: component.width,
    height: component.height,
    x: component.x,
    y: component.y
  };
}

// Create component set from multiple components
async function createComponentSet(params) {
  const { componentIds, name } = params || {};

  if (!componentIds || !Array.isArray(componentIds) || componentIds.length === 0) {
    throw new Error("Missing or empty componentIds parameter");
  }

  const components = [];
  for (const id of componentIds) {
    const node = await getNodeByIdSafe(id);
    if (!node) {
      throw new Error(`Node not found with ID: ${id}`);
    }
    if (node.type !== "COMPONENT") {
      throw new Error(`Node with ID ${id} is not a component (type: ${node.type})`);
    }
    components.push(node);
  }

  // Determine parent container
  let container = figma.currentPage;
  if (params.parentId) {
    const parentNode = await getNodeByIdSafe(params.parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${params.parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${params.parentId}`);
    }
    container = parentNode;
  }

  // Combine components into a component set
  const componentSet = figma.combineAsVariants(components, container);

  if (name) {
    componentSet.name = name;
  }

  return {
    id: componentSet.id,
    name: componentSet.name,
    key: componentSet.key,
    variantCount: componentSet.children.length,
    width: componentSet.width,
    height: componentSet.height
  };
}

// Set variant properties of a component instance
async function setInstanceVariant(params) {
  const { nodeId, properties } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  if (!properties || typeof properties !== "object") {
    throw new Error("Missing or invalid properties parameter");
  }

  if (Object.keys(properties).length === 0) {
    throw new Error("Properties object cannot be empty");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (node.type !== "INSTANCE") {
    throw new Error(`Node with ID ${nodeId} is not a component instance (type: ${node.type})`);
  }

  if (!("setProperties" in node)) {
    throw new Error(`Node does not support variant properties`);
  }

  node.setProperties(properties);

  return {
    id: node.id,
    name: node.name,
    properties: node.componentProperties
  };
}

// Create a new page
async function createPage(params) {
  const { name } = params || {};

  if (!name) {
    throw new Error("Missing name parameter");
  }

  const page = figma.createPage();
  page.name = name;

  return {
    id: page.id,
    name: page.name
  };
}

// Delete a page
async function deletePage(params) {
  const { pageId } = params || {};

  if (!pageId) {
    throw new Error("Missing pageId parameter");
  }

  // Cannot delete the only page or the current page if it's the only one
  if (figma.root.children.length <= 1) {
    throw new Error("Cannot delete the only page in the document");
  }

  const page = figma.root.children.find(p => p.id === pageId);
  if (!page) {
    throw new Error(`Page not found with ID: ${pageId}`);
  }

  const pageName = page.name;

  // If deleting current page, switch to another page first
  if (figma.currentPage.id === pageId) {
    const otherPage = figma.root.children.find(p => p.id !== pageId);
    if (otherPage) {
      await figma.setCurrentPageAsync(otherPage);
    }
  }

  page.remove();

  return {
    success: true,
    name: pageName
  };
}

// Rename a page
async function renamePage(params) {
  const { pageId, name } = params || {};

  if (!pageId) {
    throw new Error("Missing pageId parameter");
  }
  if (!name) {
    throw new Error("Missing name parameter");
  }

  const page = figma.root.children.find(p => p.id === pageId);
  if (!page) {
    throw new Error(`Page not found with ID: ${pageId}`);
  }

  const oldName = page.name;
  page.name = name;

  return {
    id: page.id,
    name: page.name,
    oldName: oldName
  };
}

// Get all pages in the document
async function getPages() {
  await figma.loadAllPagesAsync();

  return {
    pages: figma.root.children.map(page => ({
      id: page.id,
      name: page.name,
      childCount: page.children.length,
      isCurrent: page.id === figma.currentPage.id
    })),
    currentPageId: figma.currentPage.id
  };
}

// Set the current page
async function setCurrentPage(params) {
  const { pageId } = params || {};

  if (!pageId) {
    throw new Error("Missing pageId parameter");
  }

  const page = figma.root.children.find(p => p.id === pageId);
  if (!page) {
    throw new Error(`Page not found with ID: ${pageId}`);
  }

  await figma.setCurrentPageAsync(page);

  return {
    id: page.id,
    name: page.name
  };
}

// Helper function: base64 to Uint8Array decoder
function base64ToUint8Array(base64) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  const paddingLength = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  const cleanBase64 = base64.replace(/[^A-Za-z0-9+/]/g, '');
  const len = cleanBase64.length;
  const byteLength = (len * 3 / 4) - paddingLength;
  const bytes = new Uint8Array(byteLength);

  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const encoded1 = lookup[cleanBase64.charCodeAt(i)];
    const encoded2 = lookup[cleanBase64.charCodeAt(i + 1)];
    const encoded3 = lookup[cleanBase64.charCodeAt(i + 2)];
    const encoded4 = lookup[cleanBase64.charCodeAt(i + 3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (i + 2 < len && cleanBase64[i + 2] !== '=') {
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    }
    if (i + 3 < len && cleanBase64[i + 3] !== '=') {
      bytes[p++] = ((encoded3 & 3) << 6) | encoded4;
    }
  }

  return bytes;
}

// Image manipulation commands

async function setImageFill(params) {
  try {
    const { nodeId, imageSource, sourceType, scaleMode } = params || {};

    if (!nodeId || !imageSource || !sourceType) {
      throw new Error("Missing required parameters: nodeId, imageSource, sourceType");
    }

    const node = await figma.getNodeByIdAsync(nodeId);
    if (!node) {
      throw new Error(`Node not found with ID: ${nodeId}`);
    }

    if (!("fills" in node)) {
      throw new Error(`Node type ${node.type} does not support fills`);
    }
    let image;

    if (sourceType === "url") {
      image = await figma.createImageAsync(imageSource);
    } else if (sourceType === "base64") {
      const imageBytes = base64ToUint8Array(imageSource);
      image = figma.createImage(imageBytes);
    } else {
      throw new Error(`Invalid sourceType: ${sourceType}. Must be 'url' or 'base64'`);
    }

    const imageSize = await image.getSizeAsync();
    if (imageSize.width > 4096 || imageSize.height > 4096) {
      throw new Error(`Image size ${imageSize.width}x${imageSize.height} exceeds Figma limit of 4096x4096`);
    }

    const imageFill = {
      type: "IMAGE",
      scaleMode: scaleMode || "FILL",
      imageHash: image.hash,
    };

    node.fills = [imageFill];

    return {
      name: node.name,
      scaleMode: imageFill.scaleMode,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Error setting image fill: ${errorMsg}`);
  }
}

async function getImageFromNode(params) {
  try {
    const { nodeId } = params || {};

    if (!nodeId) {
      throw new Error("Missing nodeId parameter");
    }
    const node = await figma.getNodeByIdAsync(nodeId);
    if (!node) {
      throw new Error(`Node not found with ID: ${nodeId}`);
    }

    if (!("fills" in node)) {
      throw new Error(`Node type ${node.type} does not support fills`);
    }

    const fills = Array.isArray(node.fills) ? node.fills : [];
    const imageFill = fills.find(fill => fill.type === "IMAGE");

    if (!imageFill) {
      return {
        name: node.name,
        hasImage: false,
      };
    }

    const image = figma.getImageByHash(imageFill.imageHash);
    const imageSize = image ? await image.getSizeAsync() : null;

    return {
      name: node.name,
      hasImage: true,
      imageHash: imageFill.imageHash,
      scaleMode: imageFill.scaleMode,
      imageSize: imageSize,
      rotation: imageFill.rotation || 0,
      filters: imageFill.filters || null,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Error getting image from node: ${errorMsg}`);
  }
}

async function replaceImageFill(params) {
  try {
    const { nodeId, newImageSource, sourceType, preserveTransform } = params || {};

    if (!nodeId || !newImageSource || !sourceType) {
      throw new Error("Missing required parameters: nodeId, newImageSource, sourceType");
    }

    const node = await figma.getNodeByIdAsync(nodeId);
    if (!node) {
      throw new Error(`Node not found with ID: ${nodeId}`);
    }

    if (!("fills" in node)) {
      throw new Error(`Node type ${node.type} does not support fills`);
    }

    const fills = Array.isArray(node.fills) ? node.fills : [];
    const imageFillIndex = fills.findIndex(fill => fill.type === "IMAGE");

    if (imageFillIndex === -1) {
      throw new Error(`Node does not have an existing image fill to replace`);
    }

    const existingImageFill = fills[imageFillIndex];
    let newImage;

    if (sourceType === "url") {
      newImage = await figma.createImageAsync(newImageSource);
    } else if (sourceType === "base64") {
      const imageBytes = base64ToUint8Array(newImageSource);
      newImage = figma.createImage(imageBytes);
    } else {
      throw new Error(`Invalid sourceType: ${sourceType}`);
    }

    const newImageFill = {
      type: "IMAGE",
      imageHash: newImage.hash,
    };

    if (preserveTransform !== false) {
      if (existingImageFill.scaleMode) newImageFill.scaleMode = existingImageFill.scaleMode;
      if (existingImageFill.imageTransform) newImageFill.imageTransform = existingImageFill.imageTransform;
      if (existingImageFill.rotation) newImageFill.rotation = existingImageFill.rotation;
      if (existingImageFill.scalingFactor) newImageFill.scalingFactor = existingImageFill.scalingFactor;
      if (existingImageFill.filters) newImageFill.filters = existingImageFill.filters;
    } else {
      newImageFill.scaleMode = "FILL";
    }

    const newFills = fills.slice();
    newFills[imageFillIndex] = newImageFill;
    node.fills = newFills;

    return {
      name: node.name,
      preserved: preserveTransform !== false,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Error replacing image fill: ${errorMsg}`);
  }
}

// COMMENTED OUT: getImageBytes - Issues pending investigation
// Known issues: 400 errors, inconsistent behavior (black images), file save path needs discussion
/*
async function getImageBytes(params) {
  try {
    const { imageHash, nodeId } = params || {};

    if (!imageHash && !nodeId) {
      throw new Error("Either imageHash or nodeId must be provided");
    }
    let image;

    if (imageHash) {
      image = figma.getImageByHash(imageHash);
      if (!image) {
        throw new Error(`Image not found with hash: ${imageHash}`);
      }
    } else {
      const node = await figma.getNodeByIdAsync(nodeId);
      if (!node) {
        throw new Error(`Node not found with ID: ${nodeId}`);
      }

      if (!("fills" in node)) {
        throw new Error(`Node type ${node.type} does not support fills`);
      }

      const fills = Array.isArray(node.fills) ? node.fills : [];
      const imageFill = fills.find(fill => fill.type === "IMAGE");

      if (!imageFill) {
        throw new Error(`Node does not have an image fill`);
      }

      image = figma.getImageByHash(imageFill.imageHash);
      if (!image) {
        throw new Error(`Image not found for node`);
      }
    }

    const bytes = await image.getBytesAsync();
    const base64 = customBase64Encode(bytes);

    return {
      imageData: base64,
      mimeType: "image/png",
      size: bytes.length,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Error getting image bytes: ${errorMsg}`);
  }
}
*/

async function applyImageTransform(params) {
  try {
    const { nodeId, scaleMode, rotation, translateX, translateY, scale } = params || {};

    if (!nodeId) {
      throw new Error("Missing nodeId parameter");
    }
    const node = await figma.getNodeByIdAsync(nodeId);
    if (!node) {
      throw new Error(`Node not found with ID: ${nodeId}`);
    }

    if (!("fills" in node)) {
      throw new Error(`Node type ${node.type} does not support fills`);
    }

    const fills = Array.isArray(node.fills) ? node.fills : [];
    const imageFillIndex = fills.findIndex(fill => fill.type === "IMAGE");

    if (imageFillIndex === -1) {
      throw new Error(`Node does not have an image fill`);
    }

    const imageFill = Object.assign({}, fills[imageFillIndex]);
    const transformApplied = [];

    if (scaleMode !== undefined) {
      imageFill.scaleMode = scaleMode;
      transformApplied.push(`scaleMode: ${scaleMode}`);
    }

    if (rotation !== undefined) {
      if (![0, 90, 180, 270].includes(rotation)) {
        throw new Error("Rotation must be 0, 90, 180, or 270 degrees");
      }
      imageFill.rotation = rotation;
      transformApplied.push(`rotation: ${rotation}°`);
    }

    if (translateX !== undefined || translateY !== undefined || scale !== undefined) {
      const currentTransform = imageFill.imageTransform || [[1, 0, 0], [0, 1, 0]];
      const newTransform = [
        [currentTransform[0][0], currentTransform[0][1], currentTransform[0][2]],
        [currentTransform[1][0], currentTransform[1][1], currentTransform[1][2]]
      ];

      if (scale !== undefined) {
        newTransform[0][0] = scale;
        newTransform[1][1] = scale;
        transformApplied.push(`scale: ${scale}`);
      }

      if (translateX !== undefined) {
        newTransform[0][2] = translateX;
        transformApplied.push(`translateX: ${translateX}`);
      }

      if (translateY !== undefined) {
        newTransform[1][2] = translateY;
        transformApplied.push(`translateY: ${translateY}`);
      }

      imageFill.imageTransform = newTransform;
    }

    const newFills = fills.slice();
    newFills[imageFillIndex] = imageFill;
    node.fills = newFills;

    return {
      name: node.name,
      transformApplied: transformApplied.length > 0 ? transformApplied : ["no changes"],
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Error applying image transform: ${errorMsg}`);
  }
}

async function setImageFilters(params) {
  try {
    const nodeId = params.nodeId;
    const filters = params.filters;

    if (!nodeId || !filters) {
      throw new Error("Missing required parameters: nodeId, filters");
    }

    const node = await figma.getNodeByIdAsync(nodeId);
    if (!node) {
      throw new Error("Node not found with ID: " + nodeId);
    }

    if (!("fills" in node)) {
      throw new Error("Node type " + node.type + " does not support fills");
    }

    const fills = Array.isArray(node.fills) ? node.fills : [];
    const imageFillIndex = fills.findIndex(function(f) { return f.type === "IMAGE"; });

    if (imageFillIndex === -1) {
      throw new Error("Node does not have an image fill");
    }

    const imageFill = Object.assign({}, fills[imageFillIndex]);

    const currentFilters = imageFill.filters || {};
    const newFilters = Object.assign({}, currentFilters);

    if (filters.exposure !== undefined) newFilters.exposure = filters.exposure;
    if (filters.contrast !== undefined) newFilters.contrast = filters.contrast;
    if (filters.saturation !== undefined) newFilters.saturation = filters.saturation;
    if (filters.temperature !== undefined) newFilters.temperature = filters.temperature;
    if (filters.tint !== undefined) newFilters.tint = filters.tint;
    if (filters.highlights !== undefined) newFilters.highlights = filters.highlights;
    if (filters.shadows !== undefined) newFilters.shadows = filters.shadows;

    imageFill.filters = newFilters;

    const newFills = fills.slice();
    newFills[imageFillIndex] = imageFill;
    node.fills = newFills;

    return {
      name: node.name,
      appliedFilters: newFilters
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error("Error setting image filters: " + errorMsg);
  }
}

// Rotate a node
async function rotateNode(params) {
  const { nodeId, angle, relative } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  if (angle === undefined) {
    throw new Error("Missing angle parameter");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (!("rotation" in node)) {
    throw new Error(`Node type ${node.type} does not support rotation`);
  }

  if (relative) {
    node.rotation = node.rotation + angle;
  } else {
    node.rotation = angle;
  }

  return {
    id: node.id,
    name: node.name,
    rotation: node.rotation
  };
}

// Set node properties (visibility, lock, opacity)
async function setNodeProperties(params) {
  const { nodeId, visible, locked, opacity } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (visible !== undefined) {
    node.visible = visible;
  }

  if (locked !== undefined) {
    node.locked = locked;
  }

  if (opacity !== undefined) {
    if (!("opacity" in node)) {
      throw new Error(`Node type ${node.type} does not support opacity`);
    }
    node.opacity = opacity;
  }

  return {
    id: node.id,
    name: node.name,
    visible: node.visible,
    locked: node.locked,
    opacity: "opacity" in node ? node.opacity : undefined
  };
}

// Reorder node within its parent (z-order)
async function reorderNode(params) {
  const { nodeId, position, index } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  const parent = node.parent;
  if (!parent || !("children" in parent)) {
    throw new Error("Node has no parent container or parent does not support children");
  }

  const siblings = parent.children;
  const currentIndex = siblings.indexOf(node);

  let targetIndex;

  if (index !== undefined) {
    targetIndex = Math.max(0, Math.min(index, siblings.length - 1));
  } else if (position) {
    switch (position) {
      case "front":
        targetIndex = siblings.length - 1;
        break;
      case "back":
        targetIndex = 0;
        break;
      case "forward":
        targetIndex = Math.min(currentIndex + 1, siblings.length - 1);
        break;
      case "backward":
        targetIndex = Math.max(currentIndex - 1, 0);
        break;
      default:
        throw new Error(`Invalid position: ${position}. Use front, back, forward, or backward.`);
    }
  } else {
    throw new Error("Either position or index must be provided");
  }

  parent.insertChild(targetIndex, node);

  return {
    id: node.id,
    name: node.name,
    newIndex: targetIndex,
    parentChildCount: siblings.length
  };
}

// Duplicate a page
async function duplicatePage(params) {
  const { pageId, name } = params || {};

  if (!pageId) {
    throw new Error("Missing pageId parameter");
  }

  const page = figma.root.children.find(p => p.id === pageId);
  if (!page) {
    throw new Error(`Page not found with ID: ${pageId}`);
  }

  const originalName = page.name;
  const clonedPage = page.clone();

  if (name) {
    clonedPage.name = name;
  } else {
    clonedPage.name = `${originalName} (Copy)`;
  }

  return {
    id: clonedPage.id,
    name: clonedPage.name,
    originalName: originalName,
    childCount: clonedPage.children.length
  };
}

// Convert a group or shape to a frame
async function convertToFrame(params) {
  const { nodeId } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (node.type === "FRAME" || node.type === "COMPONENT" || node.type === "COMPONENT_SET") {
    throw new Error(`Node is already a ${node.type}. No conversion needed.`);
  }

  if (node.type === "PAGE" || node.type === "DOCUMENT") {
    throw new Error(`Cannot convert ${node.type} to a frame`);
  }

  const parent = node.parent;
  if (!parent || !("children" in parent)) {
    throw new Error("Node has no parent container");
  }

  const originalType = node.type;
  const originalName = node.name;
  const siblings = parent.children;
  const originalIndex = siblings.indexOf(node);

  // Create new frame
  const frame = figma.createFrame();
  frame.name = originalName;
  frame.x = node.x;
  frame.y = node.y;
  frame.resize(node.width, node.height);

  // Copy visual properties if available
  if ("fills" in node) frame.fills = JSON.parse(JSON.stringify(node.fills));
  if ("strokes" in node) frame.strokes = JSON.parse(JSON.stringify(node.strokes));
  if ("strokeWeight" in node) frame.strokeWeight = node.strokeWeight;
  if ("effects" in node) frame.effects = JSON.parse(JSON.stringify(node.effects));
  if ("cornerRadius" in node) frame.cornerRadius = node.cornerRadius;
  if ("opacity" in node) frame.opacity = node.opacity;
  if ("rotation" in node) frame.rotation = node.rotation;
  if ("clipsContent" in node) frame.clipsContent = node.clipsContent;

  // Transfer children if the node has them (e.g., groups)
  let childCount = 0;
  const isGroup = node.type === "GROUP";
  if ("children" in node) {
    const children = [...node.children];
    childCount = children.length;
    for (const child of children) {
      frame.appendChild(child);
    }
  }

  // Groups auto-delete when all children are moved out, so check if node still exists
  // Accessing .parent on a deleted node throws in Figma, so use try/catch
  let nodeStillExists = true;
  if (isGroup) {
    try {
      nodeStillExists = node.parent !== null;
    } catch (e) {
      nodeStillExists = false;
    }
  }

  // Insert frame at the correct position in parent
  // If the group was auto-deleted, originalIndex may be stale — recalculate
  const insertIndex = nodeStillExists ? originalIndex : Math.min(originalIndex, parent.children.length);
  parent.insertChild(insertIndex, frame);

  // Remove the original node if it still exists
  if (nodeStillExists) {
    try { node.remove(); } catch (e) { /* already removed */ }
  }

  return {
    id: frame.id,
    name: frame.name,
    originalType: originalType,
    childCount: childCount
  };
}

// Set gradient fill on a node
async function setGradient(params) {
  const { nodeId, type, stops, gradientTransform } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (!("fills" in node)) {
    throw new Error(`Node type ${node.type} does not support fills`);
  }

  if (!stops || !Array.isArray(stops) || stops.length < 2) {
    throw new Error("Gradient requires at least 2 color stops");
  }

  const gradientStops = stops.map(stop => ({
    position: stop.position,
    color: {
      r: stop.color.r,
      g: stop.color.g,
      b: stop.color.b,
      a: stop.color.a !== undefined ? stop.color.a : 1,
    },
  }));

  const gradientFill = {
    type: type,
    gradientStops: gradientStops,
    gradientTransform: gradientTransform || [[1, 0, 0], [0, 1, 0]],
  };

  node.fills = [gradientFill];

  return {
    id: node.id,
    name: node.name,
    fills: node.fills
  };
}

// Boolean operation (union, subtract, intersect, exclude)
async function booleanOperation(params) {
  const { nodeIds, operation, name } = params || {};

  if (!nodeIds || !Array.isArray(nodeIds) || nodeIds.length < 2) {
    throw new Error("At least 2 node IDs are required for boolean operations");
  }

  if (!operation) {
    throw new Error("Missing operation parameter");
  }

  // Resolve all nodes
  const nodes = [];
  for (const id of nodeIds) {
    const node = await getNodeByIdSafe(id);
    if (!node) {
      throw new Error(`Node not found with ID: ${id}`);
    }
    nodes.push(node);
  }

  // Validate all nodes share the same parent
  const parents = new Set(nodes.map(n => n.parent ? n.parent.id : null));
  if (parents.size > 1) {
    throw new Error(
      `All nodes must share the same parent. Found ${parents.size} different parents. ` +
      `Move nodes into the same frame before performing boolean operations.`
    );
  }

  const parent = nodes[0].parent;
  if (!parent) {
    throw new Error("Nodes have no parent container");
  }

  let result;
  switch (operation) {
    case "UNION":
      result = figma.union(nodes, parent);
      break;
    case "SUBTRACT":
      result = figma.subtract(nodes, parent);
      break;
    case "INTERSECT":
      result = figma.intersect(nodes, parent);
      break;
    case "EXCLUDE":
      result = figma.exclude(nodes, parent);
      break;
    default:
      throw new Error(`Invalid operation: ${operation}. Use UNION, SUBTRACT, INTERSECT, or EXCLUDE.`);
  }

  if (name) {
    result.name = name;
  }

  return {
    id: result.id,
    name: result.name,
    type: result.type
  };
}

// SVG sanitization - strip scripts, event handlers, external resources
function sanitizeSvg(svgString) {
  let clean = svgString;
  // Strip <script> tags
  clean = clean.replace(/<script[\s\S]*?<\/script>/gi, '');
  // Strip event handlers (onclick, onload, etc.) — separate regexes per quote type to handle mixed quotes
  clean = clean.replace(/\bon\w+\s*=\s*"[^"]*"/gi, '');
  clean = clean.replace(/\bon\w+\s*=\s*'[^']*'/gi, '');
  // Strip external resource references
  clean = clean.replace(/xlink:href\s*=\s*["']https?:\/\/[^"']*["']/gi, '');
  clean = clean.replace(/href\s*=\s*["']https?:\/\/[^"']*["']/gi, '');
  // Strip data URIs that could be injection vectors
  clean = clean.replace(/href\s*=\s*["']data:text\/html[^"']*["']/gi, '');
  return clean;
}

// Import SVG string as vector node
async function setSvg(params) {
  const { svgString, x, y, name, parentId } = params || {};

  if (!svgString) {
    throw new Error("Missing svgString parameter");
  }

  // Validate SVG content
  if (!svgString.includes('<svg') && !svgString.includes('<?xml')) {
    throw new Error("Invalid SVG: string must contain an <svg> element");
  }

  // Sanitize the SVG
  const cleanSvg = sanitizeSvg(svgString);

  const node = figma.createNodeFromSvg(cleanSvg);

  if (x !== undefined) node.x = x;
  if (y !== undefined) node.y = y;
  if (name) node.name = name;

  // If parentId is provided, move into that parent
  if (parentId) {
    const parentNode = await getNodeByIdSafe(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    parentNode.appendChild(node);
  }

  return {
    id: node.id,
    name: node.name,
    width: node.width,
    height: node.height,
    type: node.type
  };
}

// Export a node as SVG string
async function getSvg(params) {
  const { nodeId } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (!("exportAsync" in node)) {
    throw new Error(`Node type ${node.type} does not support export`);
  }

  const svgString = await node.exportAsync({ format: "SVG_STRING" });

  return {
    svgString: svgString,
    name: node.name,
    id: node.id
  };
}

// Set image fill on a node from base64-encoded image data
async function setImage(params) {
  const { nodeId, imageData, scaleMode } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }
  if (!imageData) {
    throw new Error("Missing imageData parameter");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }
  if (!("fills" in node)) {
    throw new Error(`Node type ${node.type} does not support fills`);
  }

  // Validate base64 charset
  if (!/^[A-Za-z0-9+/=]+$/.test(imageData)) {
    throw new Error("Invalid base64 encoding. Ensure the string contains only valid base64 characters (no data URI prefix).");
  }

  // Decode base64 to Uint8Array (atob is not available in Figma plugin sandbox)
  const bytes = customBase64Decode(imageData);

  // Check decoded size limit (5MB)
  if (bytes.length > 5 * 1024 * 1024) {
    throw new Error("Image exceeds 5MB limit. Use a smaller image or compress it first.");
  }

  // Create image in Figma and set as fill
  const image = figma.createImage(bytes);
  node.fills = [{
    type: "IMAGE",
    imageHash: image.hash,
    scaleMode: scaleMode || "FILL",
    visible: true,
    opacity: 1
  }];

  return {
    id: node.id,
    name: node.name,
    imageHash: image.hash,
    scaleMode: scaleMode || "FILL"
  };
}

// Set layout grids on a frame node
async function setGrid(params) {
  const { nodeId, grids } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }
  if (!grids || !Array.isArray(grids)) {
    throw new Error("Missing or invalid grids parameter");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }
  if (!("layoutGrids" in node)) {
    throw new Error(`Node type ${node.type} does not support layout grids. Use a frame node.`);
  }

  const layoutGrids = grids.map(grid => {
    const layoutGrid = {
      pattern: grid.pattern,
      visible: grid.visible !== undefined ? grid.visible : true
    };

    // Ensure required fields have defaults per pattern type to prevent Figma from hanging
    if (grid.pattern === "GRID") {
      layoutGrid.sectionSize = grid.sectionSize !== undefined ? grid.sectionSize : 10;
    } else {
      // COLUMNS and ROWS: alignment determines the variant
      // STRETCH: uses count, gutterSize, offset (evenly divided)
      // MIN/CENTER/MAX: uses sectionSize, count, offset (fixed-size cells)
      layoutGrid.alignment = grid.alignment !== undefined ? grid.alignment : "STRETCH";

      if (layoutGrid.alignment === "STRETCH") {
        layoutGrid.count = grid.count !== undefined ? grid.count : 5;
        layoutGrid.gutterSize = grid.gutterSize !== undefined ? grid.gutterSize : 10;
        layoutGrid.offset = grid.offset !== undefined ? grid.offset : 0;
      } else {
        // MIN/CENTER/MAX: fixed-size cells
        layoutGrid.sectionSize = grid.sectionSize !== undefined ? grid.sectionSize : 10;
        layoutGrid.count = grid.count !== undefined ? grid.count : 1;
        layoutGrid.gutterSize = grid.gutterSize !== undefined ? grid.gutterSize : 0;
        layoutGrid.offset = grid.offset !== undefined ? grid.offset : 0;
      }
    }

    if (grid.color) {
      layoutGrid.color = {
        r: grid.color.r,
        g: grid.color.g,
        b: grid.color.b,
        a: grid.color.a !== undefined ? grid.color.a : 0.1
      };
    }

    return layoutGrid;
  });

  node.layoutGrids = layoutGrids;

  return {
    id: node.id,
    name: node.name,
    gridCount: layoutGrids.length
  };
}

// Get layout grids from a frame node
async function getGrid(params) {
  const { nodeId } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }
  if (!("layoutGrids" in node)) {
    throw new Error(`Node type ${node.type} does not support layout grids. Use a frame node.`);
  }

  return {
    id: node.id,
    name: node.name,
    grids: node.layoutGrids.map(grid => ({
      pattern: grid.pattern,
      visible: grid.visible,
      sectionSize: grid.sectionSize,
      count: grid.count,
      gutterSize: grid.gutterSize,
      offset: grid.offset,
      alignment: grid.alignment,
      color: grid.color
    }))
  };
}

// Set guides on a page
async function setGuide(params) {
  const { pageId, guides } = params || {};

  if (!pageId) {
    throw new Error("Missing pageId parameter");
  }
  if (!guides || !Array.isArray(guides)) {
    throw new Error("Missing or invalid guides parameter");
  }

  const page = figma.root.children.find(p => p.id === pageId);
  if (!page) {
    throw new Error(`Page not found with ID: ${pageId}`);
  }

  page.guides = guides.map(guide => ({
    axis: guide.axis,
    offset: guide.offset
  }));

  return {
    id: page.id,
    name: page.name,
    guideCount: guides.length
  };
}

// Get guides from a page
async function getGuide(params) {
  const { pageId } = params || {};

  if (!pageId) {
    throw new Error("Missing pageId parameter");
  }

  const page = figma.root.children.find(p => p.id === pageId);
  if (!page) {
    throw new Error(`Page not found with ID: ${pageId}`);
  }

  return {
    id: page.id,
    name: page.name,
    guides: (page.guides || []).map(guide => ({
      axis: guide.axis,
      offset: guide.offset
    }))
  };
}

// Set annotation on a node (proposed API)
async function setAnnotation(params) {
  const { nodeId, label } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }
  if (!label) {
    throw new Error("Missing label parameter");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  // Feature detection for annotations API
  if (!("annotations" in node)) {
    throw new Error(
      "Annotations API is not available on this node type (" + node.type + "). " +
      "Supported types: Frame, Rectangle, Ellipse, Text, Component, Instance, etc."
    );
  }

  // node.annotations is ReadonlyArray — must create a new array with deep copies
  // Strip labelMarkdown from copies since Figma auto-generates it from label
  // and rejects annotations that have both label + labelMarkdown
  const existing = node.annotations
    ? node.annotations.map(a => {
        const copy = JSON.parse(JSON.stringify(a));
        if (copy.label && copy.labelMarkdown) {
          delete copy.labelMarkdown;
        }
        return copy;
      })
    : [];
  existing.push({ label: label, properties: [] });
  node.annotations = existing;

  return {
    id: node.id,
    name: node.name,
    annotationCount: existing.length
  };
}

// Get annotations from a node (proposed API)
async function getAnnotation(params) {
  const { nodeId } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  // Feature detection for proposed API
  if (!("annotations" in node)) {
    throw new Error(
      "Annotations API is not available in this Figma version. " +
      "Please update Figma Desktop to the latest version. " +
      "This feature requires the proposed API (enableProposedApi: true in manifest)."
    );
  }

  return {
    id: node.id,
    name: node.name,
    annotations: node.annotations || []
  };
}

// Get all variable collections and their variables
async function getVariables() {
  // Check if Variables API is available
  if (!figma.variables) {
    throw new Error(
      "Variables API is not available. This feature requires Figma with Variables support. " +
      "Ensure enableProposedApi is true in the plugin manifest."
    );
  }

  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const result = [];

  for (const collection of collections) {
    const variables = [];
    for (const variableId of collection.variableIds) {
      const variable = await figma.variables.getVariableByIdAsync(variableId);
      if (variable) {
        variables.push({
          id: variable.id,
          name: variable.name,
          resolvedType: variable.resolvedType,
          valuesByMode: variable.valuesByMode
        });
      }
    }

    result.push({
      id: collection.id,
      name: collection.name,
      modes: collection.modes,
      variableIds: collection.variableIds,
      variables: variables
    });
  }

  return { collections: result };
}

// Create or update a variable
async function setVariable(params) {
  const { collectionId, collectionName, name, resolvedType, value, modeId } = params || {};

  if (!figma.variables) {
    throw new Error(
      "Variables API is not available. This feature requires Figma with Variables support."
    );
  }

  if (!name) {
    throw new Error("Missing name parameter");
  }
  if (!resolvedType) {
    throw new Error("Missing resolvedType parameter");
  }
  if (value === undefined || value === null) {
    throw new Error("Missing value parameter");
  }

  let collection;

  // Find or create collection
  if (collectionId) {
    collection = await figma.variables.getVariableCollectionByIdAsync(collectionId);
    if (!collection) {
      throw new Error(`Variable collection not found: ${collectionId}`);
    }
  } else if (collectionName) {
    // Search existing collections first
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    collection = collections.find(c => c.name === collectionName);
    if (!collection) {
      // Create new collection
      collection = figma.variables.createVariableCollection(collectionName);
    }
  } else {
    throw new Error("Either collectionId or collectionName must be provided");
  }

  // Find existing variable by name in collection, or create new one
  let variable = null;
  for (const varId of collection.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(varId);
    if (v && v.name === name) {
      variable = v;
      break;
    }
  }

  if (!variable) {
    variable = figma.variables.createVariable(name, collection, resolvedType);
  }

  // Determine mode
  const targetModeId = modeId || collection.modes[0].modeId;

  // Attempt to parse value based on resolvedType if it's a string (MCP/WS serialization fix)
  let finalValue = value;
  if (typeof value === "string") {
    if (resolvedType === "FLOAT") {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) finalValue = parsed;
    } else if (resolvedType === "BOOLEAN") {
      if (value.toLowerCase() === "true") finalValue = true;
      if (value.toLowerCase() === "false") finalValue = false;
    } else if (resolvedType === "COLOR") {
      try {
        // Try to parse JSON if it's a stringified object
        if (value.startsWith("{")) {
          finalValue = JSON.parse(value);
        }
      } catch (e) {
        // Fallback to original value if parsing fails
      }
    }
  }

  // Validate value type matches resolvedType
  if (resolvedType === "COLOR") {
    if (typeof finalValue !== "object" || finalValue === null || finalValue.r === undefined) {
      throw new Error("Value does not match resolvedType. Expected COLOR object {r, g, b, a}, got " + typeof finalValue);
    }
  } else if (resolvedType === "FLOAT") {
    if (typeof finalValue !== "number") {
      throw new Error("Value does not match resolvedType. Expected FLOAT (number), got " + typeof finalValue);
    }
  } else if (resolvedType === "STRING") {
    if (typeof finalValue !== "string") {
      throw new Error("Value does not match resolvedType. Expected STRING, got " + typeof finalValue);
    }
  } else if (resolvedType === "BOOLEAN") {
    if (typeof finalValue !== "boolean") {
      throw new Error("Value does not match resolvedType. Expected BOOLEAN, got " + typeof finalValue);
    }
  }

  // Set value for mode
  variable.setValueForMode(targetModeId, finalValue);

  return {
    variableId: variable.id,
    variableName: variable.name,
    collectionId: collection.id,
    collectionName: collection.name,
    resolvedType: variable.resolvedType,
    value: finalValue
  };
}

// Apply a variable binding to a node property
async function applyVariableToNode(params) {
  const { nodeId, variableId, field } = params || {};

  if (!figma.variables) {
    throw new Error(
      "Variables API is not available. This feature requires Figma with Variables support."
    );
  }

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }
  if (!variableId) {
    throw new Error("Missing variableId parameter");
  }
  if (!field) {
    throw new Error("Missing field parameter");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  const variable = await figma.variables.getVariableByIdAsync(variableId);
  if (!variable) {
    throw new Error(`Variable not found with ID: ${variableId}`);
  }

  // Apply the variable binding
  if (!("setBoundVariable" in node)) {
    throw new Error(`Node type ${node.type} does not support variable bindings`);
  }

  // Handle paint-level bindings (fills/N/color, strokes/N/color)
  const paintMatch = field.match(/^(fills|strokes)\/(\d+)\/color$/);
  if (paintMatch) {
    const paintProp = paintMatch[1];
    const paintIndex = parseInt(paintMatch[2], 10);

    if (!(paintProp in node)) {
      throw new Error(`Node does not have ${paintProp} property`);
    }
    const paints = [...node[paintProp]];
    if (paintIndex >= paints.length) {
      throw new Error(`${paintProp} index ${paintIndex} out of range (node has ${paints.length} ${paintProp})`);
    }
    const paint = Object.assign({}, paints[paintIndex]);
    paint.boundVariables = Object.assign({}, paint.boundVariables || {});
    paint.boundVariables.color = { type: "VARIABLE_ALIAS", id: variable.id };
    paints[paintIndex] = paint;
    node[paintProp] = paints;
  } else {
    node.setBoundVariable(field, variable);
  }

  return {
    nodeId: node.id,
    nodeName: node.name,
    variableId: variable.id,
    variableName: variable.name,
    field: field
  };
}

// Switch variable mode on a node for a collection
async function switchVariableMode(params) {
  const { nodeId, collectionId, modeId } = params || {};

  if (!figma.variables) {
    throw new Error(
      "Variables API is not available. This feature requires Figma with Variables support."
    );
  }

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }
  if (!collectionId) {
    throw new Error("Missing collectionId parameter");
  }
  if (!modeId) {
    throw new Error("Missing modeId parameter");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (!("setExplicitVariableModeForCollection" in node)) {
    throw new Error(`Node type ${node.type} does not support variable mode switching`);
  }

  const collection = await figma.variables.getVariableCollectionByIdAsync(collectionId);
  if (!collection) {
    throw new Error(`Variable collection not found: ${collectionId}`);
  }

  const mode = collection.modes.find(m => m.modeId === modeId);
  if (!mode) {
    throw new Error(`Mode not found with ID: ${modeId} in collection "${collection.name}"`);
  }

  node.setExplicitVariableModeForCollection(collection, mode.modeId);

  return {
    nodeId: node.id,
    nodeName: node.name,
    collectionId: collection.id,
    collectionName: collection.name,
    modeId: mode.modeId,
    modeName: mode.name
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// FigJam-specific command implementations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map a colour name to an RGBA fill paint object.
 * These match the default colour palette shown in FigJam.
 */
function stickyColorToFill(color) {
  // Values stored as arrays to avoid passing const-object references into
  // Figma's paint normaliser, which may try to extend the color object and
  // throw "object is not extensible" in the plugin sandbox.
  // Values sampled from native FigJam stickies via the plugin API.
  var palette = {
    yellow:  [1.000, 0.886, 0.600],
    pink:    [1.000, 0.659, 0.859],
    green:   [0.702, 0.937, 0.741],
    blue:    [0.659, 0.855, 1.000],
    purple:  [0.827, 0.741, 1.000],
    red:     [1.000, 0.686, 0.639],
    orange:  [1.000, 0.827, 0.659],
    teal:    [0.702, 0.957, 0.937],
    gray:    [0.902, 0.902, 0.902],
    white:   [1.000, 1.000, 1.000],
  };

  var rgb = palette[color] || palette["yellow"];
  // Always construct a fresh color object so Figma can freely extend it.
  return [{ type: "SOLID", color: { r: rgb[0], g: rgb[1], b: rgb[2] }, opacity: 1, visible: true, blendMode: "NORMAL" }];
}

/**
 * Collect all FigJam-specific nodes on the current page.
 * Walks the full node tree and returns stickies, connectors,
 * shapes-with-text, sections and stamps.
 */
async function getFigJamElements() {
  await figma.currentPage.loadAsync();

  const figjamTypes = new Set(["STICKY", "CONNECTOR", "SHAPE_WITH_TEXT", "SECTION", "STAMP"]);
  const results = { stickies: [], connectors: [], shapesWithText: [], sections: [], stamps: [] };

  function walk(node) {
    if (figjamTypes.has(node.type)) {
      const base = { id: node.id, name: node.name, type: node.type, x: node.x, y: node.y };

      switch (node.type) {
        case "STICKY":
          results.stickies.push(Object.assign({}, base, {
            width: node.width,
            height: node.height,
            text: node.text ? node.text.characters : "",
            fills: node.fills,
            isWide: node.isWide,
            authorName: node.authorName,
          }));
          break;

        case "CONNECTOR":
          results.connectors.push(Object.assign({}, base, {
            connectorStart: node.connectorStart,
            connectorEnd: node.connectorEnd,
            connectorLineType: node.connectorLineType,
            connectorStartStrokeCap: node.connectorStartStrokeCap,
            connectorEndStrokeCap: node.connectorEndStrokeCap,
            strokeWeight: node.strokeWeight,
            strokes: node.strokes,
          }));
          break;

        case "SHAPE_WITH_TEXT":
          results.shapesWithText.push(Object.assign({}, base, {
            width: node.width,
            height: node.height,
            shapeType: node.shapeType,
            text: node.text ? node.text.characters : "",
            fills: node.fills,
          }));
          break;

        case "SECTION":
          results.sections.push(Object.assign({}, base, {
            width: node.width,
            height: node.height,
            fills: node.fills,
            childCount: "children" in node ? node.children.length : 0,
          }));
          break;

        case "STAMP":
          results.stamps.push(Object.assign({}, base, {
            width: node.width,
            height: node.height,
            authorName: node.authorName,
          }));
          break;
      }
    }

    // Recurse into children (sections, frames, groups, etc.)
    if ("children" in node) {
      for (const child of node.children) {
        walk(child);
      }
    }
  }

  for (const child of figma.currentPage.children) {
    walk(child);
  }

  return {
    pageId: figma.currentPage.id,
    pageName: figma.currentPage.name,
    totalElements:
      results.stickies.length +
      results.connectors.length +
      results.shapesWithText.length +
      results.sections.length +
      results.stamps.length,
    stickies: results.stickies,
    connectors: results.connectors,
    shapesWithText: results.shapesWithText,
    sections: results.sections,
    stamps: results.stamps,
  };
}

/**
 * Create a sticky note in FigJam.
 */
async function createSticky(params) {
  const {
    x = 0,
    y = 0,
    text = "",
    color = "yellow",
    isWide = false,
    name,
    parentId,
  } = params || {};

  if (!figma.createSticky) {
    throw new Error("createSticky is not available. This command requires a FigJam document.");
  }

  const sticky = figma.createSticky();
  // figma.createSticky() auto-appends to figma.currentPage — no explicit
  // appendChild needed for the default case.  If a specific parent was
  // requested, move the sticky into it (this re-parents, not double-appends).
  if (parentId) {
    const parentNode = await getNodeByIdSafe(parentId);
    if (!parentNode) {
      throw new Error("Parent node not found with ID: " + parentId);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error("Parent node does not support children: " + parentId);
    }
    parentNode.appendChild(sticky);
  }

  try {
    sticky.x = x;
    sticky.y = y;
    try { sticky.isWide = isWide; } catch (e) { /* isWide may not be settable in all FigJam versions */ }
    if (name) { sticky.name = name; }
    try {
      // Prefer the native NodeColor API (uses FigJam's exact palette colours).
      // Fall back to manual fills if the property isn't settable.
      sticky.color = color.toUpperCase();
    } catch (e) {
      try {
        sticky.fills = stickyColorToFill(color);
      } catch (fillErr) {
        console.warn("create_sticky: could not apply color '" + color + "':", fillErr);
      }
    }
    if (text) {
      await figma.loadFontAsync(sticky.text.fontName);
      sticky.text.characters = text;
    }
  } catch (propErr) {
    throw new Error("create_sticky failed: " + propErr.message);
  }

  var resultFills;
  try { resultFills = sticky.fills; } catch (e) { resultFills = []; }

  return {
    id: sticky.id,
    name: sticky.name,
    type: sticky.type,
    x: sticky.x,
    y: sticky.y,
    width: sticky.width,
    height: sticky.height,
    text: sticky.text ? sticky.text.characters : "",
    isWide: sticky.isWide,
    fills: resultFills,
    parentId: sticky.parent ? sticky.parent.id : undefined,
  };
}

/**
 * Update the text on an existing sticky note.
 */
async function setStickyText(params) {
  const { nodeId, text } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }
  if (text === undefined || text === null) {
    throw new Error("Missing text parameter");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }
  if (node.type !== "STICKY") {
    throw new Error(`Node ${nodeId} is not a sticky note (type: ${node.type})`);
  }

  await figma.loadFontAsync(node.text.fontName);
  node.text.characters = text;

  return {
    id: node.id,
    name: node.name,
    type: node.type,
    text: node.text.characters,
  };
}

/**
 * Create a FigJam shape with text.
 */
async function createShapeWithText(params) {
  const {
    x = 0,
    y = 0,
    width = 200,
    height = 200,
    shapeType = "ROUNDED_RECTANGLE",
    text = "",
    fillColor,
    name,
    parentId,
  } = params || {};

  if (!figma.createShapeWithText) {
    throw new Error("createShapeWithText is not available. This command requires a FigJam document.");
  }

  const shape = figma.createShapeWithText();
  shape.x = x;
  shape.y = y;
  shape.resize(width, height);
  shape.shapeType = shapeType;

  if (name) {
    shape.name = name;
  }

  // Set fill color if provided
  if (fillColor) {
    shape.fills = [
      {
        type: "SOLID",
        color: {
          r: parseFloat(fillColor.r) || 0,
          g: parseFloat(fillColor.g) || 0,
          b: parseFloat(fillColor.b) || 0,
        },
        opacity: fillColor.a !== undefined ? parseFloat(fillColor.a) : 1,
      },
    ];
  }

  // Set text via the text sub-layer
  if (text) {
    await figma.loadFontAsync(shape.text.fontName);
    shape.text.characters = text;
  }

  if (parentId) {
    const parentNode = await getNodeByIdSafe(parentId);
    if (!parentNode) {
      throw new Error(`Parent node not found with ID: ${parentId}`);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error(`Parent node does not support children: ${parentId}`);
    }
    parentNode.appendChild(shape);
  } else {
    figma.currentPage.appendChild(shape);
  }

  return {
    id: shape.id,
    name: shape.name,
    type: shape.type,
    shapeType: shape.shapeType,
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height,
    text: shape.text.characters,
    fills: shape.fills,
    parentId: shape.parent ? shape.parent.id : undefined,
  };
}

/**
 * Create a connector (arrow/line) between two nodes or canvas positions.
 *
 * The Figma plugin API requires connectorStart / connectorEnd to be one of:
 *   - { endpointNodeId, magnet } when connecting to an existing node
 *   - { position: { x, y } }   when connecting to a canvas position
 */
async function createConnector(params) {
  const {
    startNodeId,
    startX,
    startY,
    endNodeId,
    endX,
    endY,
    connectorLineType = "ELBOWED",
    startStrokeCap = "NONE",
    endStrokeCap = "ARROW",
    strokeColor,
    strokeWeight,
    name,
    parentId,
  } = params || {};

  if (!figma.createConnector) {
    throw new Error("createConnector is not available. This command requires a FigJam document.");
  }

  const connector = figma.createConnector();

  // ── Start endpoint ────────────────────────────────────────────────────────
  if (startNodeId) {
    const startNode = await getNodeByIdSafe(startNodeId);
    if (!startNode) {
      throw new Error(`Start node not found with ID: ${startNodeId}`);
    }
    connector.connectorStart = { endpointNodeId: startNodeId, magnet: "AUTO" };
  } else if (startX !== undefined && startY !== undefined) {
    connector.connectorStart = { position: { x: startX, y: startY } };
  } else {
    throw new Error("Either startNodeId or both startX and startY must be provided");
  }

  // ── End endpoint ──────────────────────────────────────────────────────────
  if (endNodeId) {
    const endNode = await getNodeByIdSafe(endNodeId);
    if (!endNode) {
      throw new Error(`End node not found with ID: ${endNodeId}`);
    }
    connector.connectorEnd = { endpointNodeId: endNodeId, magnet: "AUTO" };
  } else if (endX !== undefined && endY !== undefined) {
    connector.connectorEnd = { position: { x: endX, y: endY } };
  } else {
    throw new Error("Either endNodeId or both endX and endY must be provided");
  }

  connector.connectorLineType = connectorLineType;
  connector.connectorStartStrokeCap = startStrokeCap;
  connector.connectorEndStrokeCap = endStrokeCap;

  if (strokeColor) {
    connector.strokes = [
      {
        type: "SOLID",
        color: {
          r: parseFloat(strokeColor.r) || 0,
          g: parseFloat(strokeColor.g) || 0,
          b: parseFloat(strokeColor.b) || 0,
        },
        opacity: strokeColor.a !== undefined ? parseFloat(strokeColor.a) : 1,
      },
    ];
  }

  if (strokeWeight !== undefined) {
    connector.strokeWeight = strokeWeight;
  }

  if (name) {
    connector.name = name;
  }

  if (parentId) {
    const parentNode = await getNodeByIdSafe(parentId);
    if (!parentNode) {
      throw new Error("Parent node not found with ID: " + parentId);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error("Parent node does not support children: " + parentId);
    }
    parentNode.appendChild(connector);
  } else {
    figma.currentPage.appendChild(connector);
  }

  return {
    id: connector.id,
    name: connector.name,
    type: connector.type,
    connectorStart: connector.connectorStart,
    connectorEnd: connector.connectorEnd,
    connectorLineType: connector.connectorLineType,
    connectorStartStrokeCap: connector.connectorStartStrokeCap,
    connectorEndStrokeCap: connector.connectorEndStrokeCap,
    strokeWeight: connector.strokeWeight,
    strokes: connector.strokes,
  };
}

/**
 * Create a FigJam section.
 */
async function createSection(params) {
  const {
    x = 0,
    y = 0,
    width = 800,
    height = 600,
    name = "Section",
    fillColor,
    parentId,
  } = params || {};

  if (!figma.createSection) {
    throw new Error("createSection is not available. This command requires a FigJam document.");
  }

  const section = figma.createSection();
  section.x = x;
  section.y = y;
  section.resizeWithoutConstraints(width, height);
  section.name = name;

  if (fillColor) {
    section.fills = [
      {
        type: "SOLID",
        color: {
          r: parseFloat(fillColor.r) || 0,
          g: parseFloat(fillColor.g) || 0,
          b: parseFloat(fillColor.b) || 0,
        },
        opacity: fillColor.a !== undefined ? parseFloat(fillColor.a) : 1,
      },
    ];
  }

  if (parentId) {
    const parentNode = await getNodeByIdSafe(parentId);
    if (!parentNode) {
      throw new Error("Parent node not found with ID: " + parentId);
    }
    if (!("appendChild" in parentNode)) {
      throw new Error("Parent node does not support children: " + parentId);
    }
    parentNode.appendChild(section);
  } else {
    figma.currentPage.appendChild(section);
  }

  return {
    id: section.id,
    name: section.name,
    type: section.type,
    x: section.x,
    y: section.y,
    width: section.width,
    height: section.height,
    fills: section.fills,
  };
}

// Set prototype reactions (interactions) on a node
async function setReactions(params) {
  if (!params || !params.nodeId) {
    throw new Error("Missing nodeId parameter");
  }
  if (!params.reactions || !Array.isArray(params.reactions)) {
    throw new Error("Missing or invalid reactions parameter");
  }

  const node = await getNodeByIdSafe(params.nodeId);
  if (!node) {
    throw new Error(`Node not found: ${params.nodeId}`);
  }

  // Set overlayPositionType on destination nodes for OVERLAY actions
  const overlayDebug = [];
  for (const r of params.reactions) {
    if (r.actions && Array.isArray(r.actions)) {
      for (const a of r.actions) {
        if (a.type === "NODE" && a.navigation === "OVERLAY" && a.destinationId) {
          try {
            const destNode = await figma.getNodeByIdAsync(a.destinationId);
            const info = { destId: a.destinationId, type: destNode ? destNode.type : "not found" };
            if (destNode) {
              // For instances, set overlay properties on the main component
              let targetNode = destNode;
              if (destNode.type === "INSTANCE") {
                const mainComp = await destNode.getMainComponentAsync();
                if (mainComp) {
                  targetNode = mainComp;
                  info.usingMainComponent = targetNode.id;
                }
              }
              info.targetType = targetNode.type;
              info.hasOverlayPositionType = "overlayPositionType" in targetNode;
              info.beforePositionType = targetNode.overlayPositionType;
              info.beforeBgInteraction = targetNode.overlayBackgroundInteraction;
              try {
                targetNode.overlayPositionType = a.overlayPositionType || "CENTER";
                info.afterPositionType = targetNode.overlayPositionType;
              } catch (e) {
                info.positionTypeError = e.message || String(e);
              }
              try {
                targetNode.overlayBackgroundInteraction = a.overlayBackgroundInteraction || "CLOSE_ON_CLICK_OUTSIDE";
                info.afterBgInteraction = targetNode.overlayBackgroundInteraction;
              } catch (e) {
                info.bgInteractionError = e.message || String(e);
              }
            }
            overlayDebug.push(info);
          } catch (e) {
            overlayDebug.push({ destId: a.destinationId, error: e.message || String(e) });
          }
        }
      }
    }
  }

  // Build reactions array for the Figma API
  const reactions = params.reactions.map((r) => {
    const reaction = {};

    // Set trigger
    if (r.trigger) {
      reaction.trigger = { type: r.trigger.type };
      if (r.trigger.delay !== undefined) {
        reaction.trigger.delay = r.trigger.delay;
      }
    }

    // Build transition object helper
    const buildTransition = (t) => {
      if (!t) return null;
      return {
        type: t.type || "DISSOLVE",
        easing: t.easing || { type: "EASE_IN_AND_OUT" },
        duration: t.duration !== undefined ? t.duration : 0.2,
      };
    };

    // Set actions - support both "actions" (array, new API) and "action" (single, old API)
    if (r.actions && Array.isArray(r.actions)) {
      const mappedActions = r.actions.map((a) => {
        if (a.type === "NODE") {
          const nav = a.navigation || "NAVIGATE";
          const nodeAction = {
            type: "NODE",
            destinationId: a.destinationId || null,
            navigation: nav,
            transition: buildTransition(a.transition),
            preserveScrollPosition: a.preserveScrollPosition || false,
            resetVideoPosition: a.resetVideoPosition || false,
            resetScrollPosition: a.resetScrollPosition || false,
            resetInteractiveComponents: a.resetInteractiveComponents || false,
          };
          if (nav === "OVERLAY" && a.overlayRelativePosition) {
            nodeAction.overlayRelativePosition = a.overlayRelativePosition;
          }
          return nodeAction;
        } else if (a.type === "BACK") {
          return { type: "BACK", transition: buildTransition(a.transition) };
        } else if (a.type === "CLOSE") {
          return { type: "CLOSE" };
        } else if (a.type === "URL") {
          return { type: "URL", url: a.url || "" };
        }
        return { type: a.type };
      });

      reaction.actions = mappedActions;
    }

    return reaction;
  });

  // Debug: log the exact reactions being set
  const debugJson = JSON.stringify(reactions, null, 2);
  console.log("setReactionsAsync input:", debugJson);

  try {
    await node.setReactionsAsync(reactions);
  } catch (e) {
    // Try with singular "action" format (older Figma API)
    try {
      const reactionsOldFormat = reactions.map((r) => ({
        trigger: r.trigger,
        action: r.actions ? r.actions[0] : r.action,
      }));
      await node.setReactionsAsync(reactionsOldFormat);
    } catch (e2) {
      const errStr = e ? (e.message || e.toString() || JSON.stringify(e)) : "unknown";
      const errStr2 = e2 ? (e2.message || e2.toString() || JSON.stringify(e2)) : "unknown";
      throw new Error(`setReactionsAsync failed.\nNew API error: ${errStr}\nOld API error: ${errStr2}\nInput: ${debugJson}`);
    }
  }

  // Verify what was actually set by reading back
  const actualReactions = node.reactions;
  const actualCount = actualReactions ? actualReactions.length : 0;
  const actualJson = JSON.stringify(actualReactions, null, 2);

  return {
    id: node.id,
    name: node.name,
    reactionsCount: reactions.length,
    actualReactionsCount: actualCount,
    sentToFigma: debugJson,
    readBackFromFigma: actualJson,
    overlayDebug: overlayDebug.length > 0 ? overlayDebug : undefined,
    message: `Set ${reactions.length} reaction(s) on node "${node.name}" (verified: ${actualCount} persisted)`,
  };
}

async function getReactions(params) {
  if (!params || !params.nodeId) {
    throw new Error("Missing nodeId parameter");
  }
  const node = await getNodeByIdSafe(params.nodeId);
  if (!node) {
    throw new Error(`Node not found: ${params.nodeId}`);
  }
  const reactions = node.reactions;
  return {
    id: node.id,
    name: node.name,
    type: node.type,
    reactionsCount: reactions ? reactions.length : 0,
    reactions: reactions ? JSON.parse(JSON.stringify(reactions)) : [],
  };
}

/**
 * Detach a component instance
 */
async function detachInstance(params) {
  const { nodeId } = params || {};
  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  const node = await getNodeByIdSafe(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (node.type !== "INSTANCE") {
    throw new Error(`Node with ID ${nodeId} is not a component INSTANCE`);
  }

  const detachedFrame = node.detachInstance();

  return {
    success: true,
    frameId: detachedFrame.id,
    frameName: detachedFrame.name,
    frameType: detachedFrame.type,
  };
}

/**
 * Create a reusable text style in Figma
 */
async function createTextStyle(params) {
  const {
    name,
    fontFamily = "Inter",
    fontStyle = "Regular",
    fontSize = 16,
    lineHeightPx,
    letterSpacingPx,
    description,
    letterSpacing,
    letterSpacingUnit = "PIXELS",
    lineHeight,
    lineHeightUnit = "PIXELS",
    textCase = "ORIGINAL",
    textDecoration = "NONE",
  } = params || {};

  if (!name) {
    throw new Error("Missing name parameter");
  }

  const style = figma.createTextStyle();
  style.name = name;
  if (description !== undefined) {
    style.description = description;
  }

  // Load and apply font
  await figma.loadFontAsync({ family: fontFamily, style: fontStyle });
  style.fontName = { family: fontFamily, style: fontStyle };
  style.fontSize = fontSize;

  const resolvedLetterSpacing = letterSpacing !== undefined ? letterSpacing : letterSpacingPx;
  if (resolvedLetterSpacing !== undefined) {
    style.letterSpacing = {
      value: resolvedLetterSpacing,
      unit: letterSpacing !== undefined ? letterSpacingUnit : "PIXELS",
    };
  }

  const resolvedLineHeight = lineHeight !== undefined ? lineHeight : lineHeightPx;
  if (resolvedLineHeight !== undefined || lineHeightUnit === "AUTO") {
    if (lineHeightUnit === "AUTO") {
      style.lineHeight = { unit: "AUTO" };
    } else {
      style.lineHeight = {
        value: resolvedLineHeight,
        unit: lineHeight !== undefined ? lineHeightUnit : "PIXELS",
      };
    }
  }

  style.textCase = textCase;
  style.textDecoration = textDecoration;

  return { id: style.id, name: style.name, key: style.key };
}

/**
 * Create a reusable solid paint style in Figma
 */
async function createPaintStyle(params) {
  const { name, color, r, g, b, a = 1, description } = params || {};

  if (!name) {
    throw new Error("Missing name parameter");
  }

  const paintColor = color || { r, g, b, a };
  if (!paintColor || paintColor.r === undefined || paintColor.g === undefined || paintColor.b === undefined) {
    throw new Error("Color must include r, g, and b components");
  }

  const style = figma.createPaintStyle();
  style.name = name;
  if (description !== undefined) {
    style.description = description;
  }
  style.paints = [
    {
      type: "SOLID",
      color: { r: paintColor.r, g: paintColor.g, b: paintColor.b },
      opacity: paintColor.a !== undefined ? paintColor.a : a,
    },
  ];

  return { id: style.id, name: style.name, key: style.key, paint: style.paints[0] };
}

// Set Fill Style ID Tool
async function setFillStyleId(params) {
  const { nodeId, fillStyleId } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }

  if (!fillStyleId) {
    throw new Error("Missing fillStyleId parameter");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  if (!("fillStyleId" in node)) {
    throw new Error(`Node with ID ${nodeId} does not support fill styles`);
  }

  const paintStyles = await figma.getLocalPaintStylesAsync();
  const foundStyle = paintStyles.find(
    (style) => style.id === fillStyleId || style.key === fillStyleId
  );

  if (!foundStyle) {
    throw new Error(`Paint style with ID "${fillStyleId}" not found. Make sure the style exists in your local styles.`);
  }

  await node.setFillStyleIdAsync(foundStyle.id);

  return {
    id: node.id,
    name: node.name,
    fillStyleId: foundStyle.id,
    styleName: foundStyle.name,
  };
}

/**
 * Create a reusable effect style in Figma
 */
async function createEffectStyle(params) {
  const { name, effects } = params || {};

  const style = figma.createEffectStyle();
  style.name = name;

  style.effects = (effects || []).map((effect) => ({
    type: effect.type,
    radius: effect.radius || 0,
    visible: effect.visible !== false,
    color: effect.color
      ? { r: effect.color.r, g: effect.color.g, b: effect.color.b, a: effect.color.a !== undefined ? effect.color.a : 1 }
      : { r: 0, g: 0, b: 0, a: 0.25 },
    offset: effect.offset ? { x: effect.offset.x, y: effect.offset.y } : { x: 0, y: 0 },
    spread: effect.spread || 0,
    blendMode: effect.blendMode || "NORMAL",
  }));

  return {
    id: style.id,
    name: style.name,
    key: style.key,
    effectCount: style.effects.length,
  };
}

// ============================================
// Variable System Functions (P1 - Design Tokens)
// ============================================

async function createVariableCollection(params) {
  const { name } = params || {};

  if (!name) {
    throw new Error("Missing name parameter");
  }

  // createVariableCollection is synchronous
  const collection = figma.variables.createVariableCollection(name);

  return {
    id: collection.id,
    name: collection.name,
    modes: collection.modes.map(mode => ({
      modeId: mode.modeId,
      name: mode.name
    })),
    defaultModeId: collection.defaultModeId
  };
}

// Create a new variable in a collection
async function createVariable(params) {
  console.log("[createVariable] START with params:", JSON.stringify(params));

  const { name, collectionId, resolvedType, value, modeId } = params || {};

  if (!name) {
    throw new Error("Missing name parameter");
  }
  if (!collectionId) {
    throw new Error("Missing collectionId parameter");
  }
  if (!resolvedType) {
    throw new Error("Missing resolvedType parameter");
  }

  const validTypes = ["BOOLEAN", "COLOR", "FLOAT", "STRING"];
  if (!validTypes.includes(resolvedType)) {
    throw new Error(`Invalid resolvedType: ${resolvedType}. Must be one of: ${validTypes.join(", ")}`);
  }

  console.log("[createVariable] Getting collection by ID:", collectionId);

  // Get the collection object first (passing collection ID is deprecated)
  const collection = await figma.variables.getVariableCollectionByIdAsync(collectionId);
  console.log("[createVariable] Collection result:", collection ? collection.name : "null");

  if (!collection) {
    throw new Error(`Variable collection not found with ID: ${collectionId}`);
  }

  console.log("[createVariable] Creating variable:", name, resolvedType);

  // createVariable is synchronous and requires collection object, not ID
  const variable = figma.variables.createVariable(name, collection, resolvedType);
  console.log("[createVariable] Variable created:", variable.id);

  // Set initial value if provided
  if (value !== undefined) {
    const targetModeId = modeId || collection.defaultModeId;
    console.log("[createVariable] Setting value for mode:", targetModeId);

    let processedValue = value;

    // For COLOR type, ensure proper format
    if (resolvedType === "COLOR" && typeof value === "object") {
      processedValue = {
        r: value.r,
        g: value.g,
        b: value.b,
        a: value.a !== undefined ? value.a : 1
      };
    }

    variable.setValueForMode(targetModeId, processedValue);
    console.log("[createVariable] Value set successfully");
  }

  console.log("[createVariable] DONE, returning result");

  return {
    id: variable.id,
    name: variable.name,
    resolvedType: variable.resolvedType,
    collectionId: variable.variableCollectionId
  };
}

// Get a variable by its ID
async function getVariableById(params) {
  const { variableId } = params || {};

  if (!variableId) {
    throw new Error("Missing variableId parameter");
  }

  const variable = await figma.variables.getVariableByIdAsync(variableId);

  if (!variable) {
    throw new Error(`Variable not found with ID: ${variableId}`);
  }

  return {
    id: variable.id,
    name: variable.name,
    resolvedType: variable.resolvedType,
    collectionId: variable.variableCollectionId,
    valuesByMode: variable.valuesByMode,
    scopes: variable.scopes,
    hiddenFromPublishing: variable.hiddenFromPublishing
  };
}

// Get all local variable collections
async function getLocalVariableCollections() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();

  return collections.map(collection => ({
    id: collection.id,
    name: collection.name,
    modes: collection.modes.map(mode => ({
      modeId: mode.modeId,
      name: mode.name
    })),
    defaultModeId: collection.defaultModeId,
    variableIds: collection.variableIds,
    hiddenFromPublishing: collection.hiddenFromPublishing
  }));
}

// Get all local variables, optionally filtered by collection
async function getLocalVariables(params) {
  const { collectionId } = params || {};

  const variables = await figma.variables.getLocalVariablesAsync();

  const filteredVariables = collectionId
    ? variables.filter(v => v.variableCollectionId === collectionId)
    : variables;

  return filteredVariables.map(variable => ({
    id: variable.id,
    name: variable.name,
    resolvedType: variable.resolvedType,
    collectionId: variable.variableCollectionId,
    valuesByMode: variable.valuesByMode,
    scopes: variable.scopes
  }));
}

// Bind a variable to a node property
async function setBoundVariable(params) {
  const { nodeId, field, variableId } = params || {};

  if (!nodeId) {
    throw new Error("Missing nodeId parameter");
  }
  if (!field) {
    throw new Error("Missing field parameter");
  }
  if (!variableId) {
    throw new Error("Missing variableId parameter");
  }

  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) {
    throw new Error(`Node not found with ID: ${nodeId}`);
  }

  const variable = await figma.variables.getVariableByIdAsync(variableId);
  if (!variable) {
    throw new Error(`Variable not found with ID: ${variableId}`);
  }

  // Map field names to Figma's expected format
  const fieldMapping = {
    "fill": "fills",
    "stroke": "strokes",
    "opacity": "opacity",
    "width": "width",
    "height": "height",
    "paddingTop": "paddingTop",
    "paddingRight": "paddingRight",
    "paddingBottom": "paddingBottom",
    "paddingLeft": "paddingLeft",
    "itemSpacing": "itemSpacing",
    "counterAxisSpacing": "counterAxisSpacing",
    "cornerRadius": "cornerRadius",
    "topLeftRadius": "topLeftRadius",
    "topRightRadius": "topRightRadius",
    "bottomLeftRadius": "bottomLeftRadius",
    "bottomRightRadius": "bottomRightRadius"
  };

  const figmaField = fieldMapping[field] || field;

  // Check if the node supports setBoundVariable
  if (typeof node.setBoundVariable !== "function") {
    throw new Error(`Node type ${node.type} does not support variable binding`);
  }

  // For fill and stroke, we need to set the variable binding on the paint directly
  if (field === "fill" || field === "stroke") {
    const paintProperty = field === "fill" ? "fills" : "strokes";
    const paints = node[paintProperty];

    if (!paints || paints.length === 0) {
      // Create a default solid paint if none exists
      const defaultPaint = {
        type: "SOLID",
        color: { r: 0, g: 0, b: 0 }
      };
      node[paintProperty] = [defaultPaint];
    }

    // Clone the paints array and set the variable binding on the first paint
    const newPaints = JSON.parse(JSON.stringify(node[paintProperty]));
    const paint = newPaints[0];

    // Set the bound variable on the paint's color
    paint.boundVariables = paint.boundVariables || {};
    paint.boundVariables.color = {
      type: "VARIABLE_ALIAS",
      id: variable.id
    };

    node[paintProperty] = newPaints;
  } else {
    await node.setBoundVariableAsync(figmaField, variable);
  }

  return {
    success: true,
    nodeId: node.id,
    field: field
  };
}
