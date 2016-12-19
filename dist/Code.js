function onOpen() {
}
function onInstall() {
}
function showSidebar() {
}
function authCallback() {
}
function postToWordPress() {
}
function devTest() {
}
function SHARED() {
}(function(e, a) { for(var i in a) e[i] = a[i]; }(this, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	var _index = __webpack_require__(1);

	global.onOpen = _index.onOpen; /**
	                                * This is for the gas-webpack-plugin to explicitly expose functions to GAS
	                                */

	global.onInstall = _index.onInstall;
	global.showSidebar = _index.showSidebar;
	global.authCallback = _index.authCallback;
	global.postToWordPress = _index.postToWordPress;
	global.devTest = _index.devTest;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.onOpen = onOpen;
	exports.onInstall = onInstall;
	exports.showSidebar = showSidebar;
	exports.authCallback = authCallback;
	exports.postToWordPress = postToWordPress;
	exports.devTest = devTest;

	var _wpClient = __webpack_require__(2);

	var _docService = __webpack_require__(42);

	var _imageUploadLinker = __webpack_require__(54);

	var wpClient = (0, _wpClient.wpClientFactory)(PropertiesService, OAuth2, UrlFetchApp);

	/**
	 * Creates a menu entry in the Google Docs UI when the document is opened.
	 * This method is only used by the regular add-on, and is never called by
	 * the mobile add-on version.
	 *
	 * @param {object} e The event parameter for a simple onOpen trigger. To
	 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
	 *     running in, inspect e.authMode.
	 */
	/**
	 * @OnlyCurrentDoc
	 *
	 * The above comment directs Apps Script to limit the scope of file
	 * access for this add-on. It specifies that this add-on will only
	 * attempt to read or modify the files in which the add-on is used,
	 * and not all of the user's files. The authorization request message
	 * presented to users will reflect this limited scope.
	 */

	/* globals PropertiesService, DocumentApp, UrlFetchApp, Utilities, HtmlService, OAuth2, Logger */

	function onOpen() {
		DocumentApp.getUi().createAddonMenu().addItem('Open', 'showSidebar').addItem('Dev Testing', 'devTest').addToUi();
	}

	/**
	 * Runs when the add-on is installed.
	 * This method is only used by the regular add-on, and is never called by
	 * the mobile add-on version.
	 *
	 * @param {object} e The event parameter for a simple onInstall trigger. To
	 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
	 *     running in, inspect e.authMode. (In practice, onInstall triggers always
	 *     run in AuthMode.FULL, but onOpen triggers may be AuthMode.LIMITED or
	 *     AuthMode.NONE.)
	 */
	function onInstall(e) {
		onOpen(e);
	}

	/**
	 * Opens a sidebar in the document containing the add-on's user interface.
	 * This method is only used by the regular add-on, and is never called by
	 * the mobile add-on version.
	 */
	function showSidebar() {
		var template;

		if (wpClient.getOauthClient().hasAccess()) {
			template = HtmlService.createTemplateFromFile('Sidebar');
			try {
				template.siteInfo = wpClient.getSiteInfo();
			} catch (e) {
				template = HtmlService.createTemplateFromFile('needsOauth');
			}
		} else {
			template = HtmlService.createTemplateFromFile('needsOauth');
		}

		var authorizationUrl = wpClient.getOauthClient().getAuthorizationUrl();
		template.authorizationUrl = authorizationUrl;
		var page = template.evaluate();

		page.setTitle('WordPress');
		DocumentApp.getUi().showSidebar(page);
	}

	function authCallback(request) {
		var isAuthorized = wpClient.getOauthClient().handleCallback(request);

		if (isAuthorized) {
			var template = HtmlService.createTemplateFromFile('oauthSuccess');
			return template.evaluate();
		}

		return HtmlService.createHtmlOutput('Denied. You can close this tab');
	}

	function postToWordPress() {
		var doc = DocumentApp.getActiveDocument();
		var docProps = PropertiesService.getDocumentProperties();
		var imageUrlMapper = (0, _imageUploadLinker.imageUploadLinker)(wpClient, docProps, Utilities);
		var renderContainer = (0, _docService.docServiceFactory)(DocumentApp, imageUrlMapper);

		var body = renderContainer(doc.getBody());
		var postId = docProps.getProperty('postId');

		var response = wpClient.postToWordPress(doc.getName(), body, postId);
		docProps.setProperty('postId', response.ID.toString());
		return response;
	}

	function devTest() {}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _stringify = __webpack_require__(3);

	var _stringify2 = _interopRequireDefault(_stringify);

	var _assign = __webpack_require__(6);

	var _assign2 = _interopRequireDefault(_assign);

	exports.wpClientFactory = wpClientFactory;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	/* globals Utilities, Logger */

	var API_BASE = 'https://public-api.wordpress.com/rest/v1.1';
	var CRLF = '\r\n';
	var DEFAULT_FILENAME = 'overpass';

	var contentTypeToExtension = {
		'image/png': 'png',
		'image/jpeg': 'jpeg',
		'image/bmp': 'bmp',
		'image/gif': 'gif'
	};

	function fileNameForBlob(blob) {
		if (blob.getName()) {
			return blob.getName();
		}

		var contentType = blob.getContentType();
		if (contentTypeToExtension[contentType]) {
			return DEFAULT_FILENAME + '.' + contentTypeToExtension[contentType];
		}

		throw new Error('Unsupported content type: ' + contentType);
	}

	function makeMultipartBody(payload, boundary) {
		var body = Utilities.newBlob('').getBytes();

		for (var k in payload) {
			var v = payload[k];

			if (v.toString() === 'Blob') {
				// attachment
				body = body.concat(Utilities.newBlob('--' + boundary + CRLF + 'Content-Disposition: form-data; name="' + k + '"; filename="' + fileNameForBlob(v) + '"' + CRLF + 'Content-Type: ' + v.getContentType() + CRLF
				// + 'Content-Transfer-Encoding: base64' + CRLF
				+ CRLF).getBytes());

				body = body.concat(v.getBytes()).concat(Utilities.newBlob(CRLF).getBytes());
			} else {
				// string
				body = body.concat(Utilities.newBlob('--' + boundary + CRLF + 'Content-Disposition: form-data; name="' + k + '"' + CRLF + CRLF + v + CRLF).getBytes());
			}
		}

		body = body.concat(Utilities.newBlob(CRLF + '--' + boundary + '--' + CRLF).getBytes());

		return body;
	}

	function wpClientFactory(PropertiesService, OAuth2, UrlFetchApp) {
		var client = undefined;

		// Needs to be lazy-instantiated because we don't have permissions to access
		// properties until the script is actually open
		function getClient() {
			if (client) {
				return client;
			}

			var _PropertiesService$ge = PropertiesService.getScriptProperties().getProperties(),
			    OauthClientId = _PropertiesService$ge.OauthClientId,
			    OauthClientSecret = _PropertiesService$ge.OauthClientSecret;

			client = OAuth2.createService('wordpress').setAuthorizationBaseUrl('https://public-api.wordpress.com/oauth2/authorize').setTokenUrl('https://public-api.wordpress.com/oauth2/token').setClientId(OauthClientId).setClientSecret(OauthClientSecret).setCallbackFunction('authCallback').setPropertyStore(PropertiesService.getUserProperties());
			return client;
		}

		function request(path, options) {
			var wpService = getClient();
			var defaultOptions = {
				headers: {
					Authorization: 'Bearer ' + wpService.getAccessToken()
				}
			};
			var url = API_BASE + path;

			return JSON.parse(UrlFetchApp.fetch(url, (0, _assign2['default'])(defaultOptions, options)));
		}

		function get(path) {
			var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			return request(path, (0, _assign2['default'])({ method: 'get' }, options));
		}

		function post(path) {
			var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			return request(path, (0, _assign2['default'])({ method: 'post' }, options));
		}

		function postToWordPress(title, content, postIdParam) {
			var wpService = getClient();
			var postId = postIdParam || 'new';

			var _wpService$getToken_ = wpService.getToken_(),
			    blog_id = _wpService$getToken_.blog_id;

			var path = '/sites/' + blog_id + '/posts/' + postId;

			var response = post(path, { payload: {
					status: 'draft',
					title: title,
					content: content
				} });

			return response;
		}

		/**
	  * @param {Blob} image
	  * @return {object} response
	  */
		function uploadImage(image) {
			var wpService = getClient();

			var _wpService$getToken_2 = wpService.getToken_(),
			    blog_id = _wpService$getToken_2.blog_id;

			var path = '/sites/' + blog_id + '/media/new';
			var imageBlob = image.getBlob();
			Logger.log((0, _stringify2['default'])({
				image: {
					attributes: image.getAttributes(),
					altDescription: image.getAltDescription(),
					altTitle: image.getAltTitle()
				},
				imageBlob: {
					contentType: imageBlob.getContentType(),
					name: imageBlob.getName()
				}
			}));
			if (!imageBlob.getName()) {
				imageBlob.setName(image.getAltDescription());
			}
			var boundary = '-----CUTHEREelH7faHNSXWNi72OTh08zH29D28Zhr3Rif3oupOaDrj';

			var options = {
				method: 'post',
				contentType: 'multipart/form-data; boundary=' + boundary,
				payload: makeMultipartBody({ 'media[]': imageBlob }, boundary)
			};

			var response = post(path, options);

			return response;
		}

		function getSiteInfo() {
			var wpService = getClient();

			var _wpService$getToken_3 = wpService.getToken_(),
			    blog_id = _wpService$getToken_3.blog_id;

			return get('/sites/' + blog_id);
		}

		return {
			getOauthClient: getClient,
			postToWordPress: postToWordPress,
			getSiteInfo: getSiteInfo,
			uploadImage: uploadImage
		};
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(4), __esModule: true };

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var core  = __webpack_require__(5)
	  , $JSON = core.JSON || (core.JSON = {stringify: JSON.stringify});
	module.exports = function stringify(it){ // eslint-disable-line no-unused-vars
	  return $JSON.stringify.apply($JSON, arguments);
	};

/***/ },
/* 5 */
/***/ function(module, exports) {

	var core = module.exports = {version: '2.4.0'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(7), __esModule: true };

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(8);
	module.exports = __webpack_require__(5).Object.assign;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.1 Object.assign(target, source)
	var $export = __webpack_require__(9);

	$export($export.S + $export.F, 'Object', {assign: __webpack_require__(23)});

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(10)
	  , core      = __webpack_require__(5)
	  , ctx       = __webpack_require__(11)
	  , hide      = __webpack_require__(13)
	  , PROTOTYPE = 'prototype';

	var $export = function(type, name, source){
	  var IS_FORCED = type & $export.F
	    , IS_GLOBAL = type & $export.G
	    , IS_STATIC = type & $export.S
	    , IS_PROTO  = type & $export.P
	    , IS_BIND   = type & $export.B
	    , IS_WRAP   = type & $export.W
	    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
	    , expProto  = exports[PROTOTYPE]
	    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
	    , key, own, out;
	  if(IS_GLOBAL)source = name;
	  for(key in source){
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? ctx(out, global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function(C){
	      var F = function(a, b, c){
	        if(this instanceof C){
	          switch(arguments.length){
	            case 0: return new C;
	            case 1: return new C(a);
	            case 2: return new C(a, b);
	          } return new C(a, b, c);
	        } return C.apply(this, arguments);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
	    if(IS_PROTO){
	      (exports.virtual || (exports.virtual = {}))[key] = out;
	      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
	      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
	    }
	  }
	};
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library` 
	module.exports = $export;

/***/ },
/* 10 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(12);
	module.exports = function(fn, that, length){
	  aFunction(fn);
	  if(that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function(/* ...args */){
	    return fn.apply(that, arguments);
	  };
	};

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var dP         = __webpack_require__(14)
	  , createDesc = __webpack_require__(22);
	module.exports = __webpack_require__(18) ? function(object, key, value){
	  return dP.f(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var anObject       = __webpack_require__(15)
	  , IE8_DOM_DEFINE = __webpack_require__(17)
	  , toPrimitive    = __webpack_require__(21)
	  , dP             = Object.defineProperty;

	exports.f = __webpack_require__(18) ? Object.defineProperty : function defineProperty(O, P, Attributes){
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if(IE8_DOM_DEFINE)try {
	    return dP(O, P, Attributes);
	  } catch(e){ /* empty */ }
	  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
	  if('value' in Attributes)O[P] = Attributes.value;
	  return O;
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(16);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = !__webpack_require__(18) && !__webpack_require__(19)(function(){
	  return Object.defineProperty(__webpack_require__(20)('div'), 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(19)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 19 */
/***/ function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(16)
	  , document = __webpack_require__(10).document
	  // in old IE typeof document.createElement is 'object'
	  , is = isObject(document) && isObject(document.createElement);
	module.exports = function(it){
	  return is ? document.createElement(it) : {};
	};

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.1 ToPrimitive(input [, PreferredType])
	var isObject = __webpack_require__(16);
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	module.exports = function(it, S){
	  if(!isObject(it))return it;
	  var fn, val;
	  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  throw TypeError("Can't convert object to primitive value");
	};

/***/ },
/* 22 */
/***/ function(module, exports) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// 19.1.2.1 Object.assign(target, source, ...)
	var getKeys  = __webpack_require__(24)
	  , gOPS     = __webpack_require__(39)
	  , pIE      = __webpack_require__(40)
	  , toObject = __webpack_require__(41)
	  , IObject  = __webpack_require__(28)
	  , $assign  = Object.assign;

	// should work with symbols and should have deterministic property order (V8 bug)
	module.exports = !$assign || __webpack_require__(19)(function(){
	  var A = {}
	    , B = {}
	    , S = Symbol()
	    , K = 'abcdefghijklmnopqrst';
	  A[S] = 7;
	  K.split('').forEach(function(k){ B[k] = k; });
	  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
	}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
	  var T     = toObject(target)
	    , aLen  = arguments.length
	    , index = 1
	    , getSymbols = gOPS.f
	    , isEnum     = pIE.f;
	  while(aLen > index){
	    var S      = IObject(arguments[index++])
	      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
	      , length = keys.length
	      , j      = 0
	      , key;
	    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
	  } return T;
	} : $assign;

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)
	var $keys       = __webpack_require__(25)
	  , enumBugKeys = __webpack_require__(38);

	module.exports = Object.keys || function keys(O){
	  return $keys(O, enumBugKeys);
	};

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var has          = __webpack_require__(26)
	  , toIObject    = __webpack_require__(27)
	  , arrayIndexOf = __webpack_require__(31)(false)
	  , IE_PROTO     = __webpack_require__(35)('IE_PROTO');

	module.exports = function(object, names){
	  var O      = toIObject(object)
	    , i      = 0
	    , result = []
	    , key;
	  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while(names.length > i)if(has(O, key = names[i++])){
	    ~arrayIndexOf(result, key) || result.push(key);
	  }
	  return result;
	};

/***/ },
/* 26 */
/***/ function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(28)
	  , defined = __webpack_require__(30);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(29);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 29 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 30 */
/***/ function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	// false -> Array#indexOf
	// true  -> Array#includes
	var toIObject = __webpack_require__(27)
	  , toLength  = __webpack_require__(32)
	  , toIndex   = __webpack_require__(34);
	module.exports = function(IS_INCLUDES){
	  return function($this, el, fromIndex){
	    var O      = toIObject($this)
	      , length = toLength(O.length)
	      , index  = toIndex(fromIndex, length)
	      , value;
	    // Array#includes uses SameValueZero equality algorithm
	    if(IS_INCLUDES && el != el)while(length > index){
	      value = O[index++];
	      if(value != value)return true;
	    // Array#toIndex ignores holes, Array#includes - not
	    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
	      if(O[index] === el)return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(33)
	  , min       = Math.min;
	module.exports = function(it){
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ },
/* 33 */
/***/ function(module, exports) {

	// 7.1.4 ToInteger
	var ceil  = Math.ceil
	  , floor = Math.floor;
	module.exports = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(33)
	  , max       = Math.max
	  , min       = Math.min;
	module.exports = function(index, length){
	  index = toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var shared = __webpack_require__(36)('keys')
	  , uid    = __webpack_require__(37);
	module.exports = function(key){
	  return shared[key] || (shared[key] = uid(key));
	};

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(10)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 37 */
/***/ function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ },
/* 38 */
/***/ function(module, exports) {

	// IE 8- don't enum bug keys
	module.exports = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

/***/ },
/* 39 */
/***/ function(module, exports) {

	exports.f = Object.getOwnPropertySymbols;

/***/ },
/* 40 */
/***/ function(module, exports) {

	exports.f = {}.propertyIsEnumerable;

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(30);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.docServiceFactory = docServiceFactory;

	var _paragraph = __webpack_require__(43);

	var _paragraph2 = _interopRequireDefault(_paragraph);

	var _table = __webpack_require__(50);

	var _table2 = _interopRequireDefault(_table);

	var _inlineImage = __webpack_require__(51);

	var _inlineImage2 = _interopRequireDefault(_inlineImage);

	var _listItem = __webpack_require__(52);

	var _listItem2 = _interopRequireDefault(_listItem);

	var _text = __webpack_require__(53);

	var _text2 = _interopRequireDefault(_text);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	// http://stackoverflow.com/a/10050831
	var range = function range(n) {
		if (!n) {
			return [];
		}

		return Array.apply(null, Array(n)).map(function (_, i) {
			return i;
		});
	};

	function docServiceFactory(DocumentApp, imageLinker) {
		var renderParagraph = (0, _paragraph2['default'])(DocumentApp, renderContainer);
		var renderTable = (0, _table2['default'])(renderContainer);
		var renderInlineImage = (0, _inlineImage2['default'])(imageLinker);
		var renderListItem = (0, _listItem2['default'])(DocumentApp, renderContainer);

		function renderElement(element) {
			switch (element.getType()) {
				case DocumentApp.ElementType.PARAGRAPH:
					return renderParagraph(element);
				case DocumentApp.ElementType.TEXT:
					return (0, _text2['default'])(element);
				case DocumentApp.ElementType.INLINE_IMAGE:
					return renderInlineImage(element);
				case DocumentApp.ElementType.LIST_ITEM:
					return renderListItem(element);
				case DocumentApp.ElementType.TABLE:
					return renderTable(element);
				default:
					return element.getType() + ': ' + element.toString();
			}
		}

		function renderContainer(element) {
			var numOfChildren = element.getNumChildren();
			var contents = range(numOfChildren).map(function (i) {
				return element.getChild(i);
			}).map(renderElement).join('');

			return contents;
		}

		return renderContainer;
	}

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _attributes = __webpack_require__(44);

	var _tags = __webpack_require__(45);

	exports['default'] = function (DocumentApp, renderContainer) {
		function tagForParagraph(paragraph) {
			switch (paragraph.getHeading()) {
				case DocumentApp.ParagraphHeading.HEADING1:
				case DocumentApp.ParagraphHeading.TITLE:
					return 'h1';
				case DocumentApp.ParagraphHeading.HEADING2:
				case DocumentApp.ParagraphHeading.SUBTITLE:
					return 'h2';
				case DocumentApp.ParagraphHeading.HEADING3:
					return 'h3';
				case DocumentApp.ParagraphHeading.HEADING4:
					return 'h4';
				case DocumentApp.ParagraphHeading.HEADING5:
					return 'h5';
				case DocumentApp.ParagraphHeading.HEADING6:
					return 'h6';
				case DocumentApp.ParagraphHeading.NORMAL:
				default:
					return 'p';
			}
		}

		function renderParagraph(paragraph) {
			var tag = tagForParagraph(paragraph),
			    openTags = (0, _tags.changedTags)(paragraph.getAttributes(), _attributes.blankAttributes),
			    closedTags = (0, _tags.changedTags)(_attributes.blankAttributes, paragraph.getAttributes()),
			    contents = renderContainer(paragraph);
			return '<' + tag + '>' + openTags + contents + closedTags + ('</' + tag + '>\n');
		}

		return renderParagraph;
	};

/***/ },
/* 44 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	var blankAttributes = exports.blankAttributes = {
		FONT_SIZE: null, // TODO
		ITALIC: null,
		STRIKETHROUGH: null,
		FOREGROUND_COLOR: null, // TODO
		BOLD: null,
		LINK_URL: null,
		UNDERLINE: null,
		FONT_FAMILY: null, // TODO
		BACKGROUND_COLOR: null // TODO
	};

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.changedTags = undefined;

	var _assign = __webpack_require__(6);

	var _assign2 = _interopRequireDefault(_assign);

	var _keys = __webpack_require__(46);

	var _keys2 = _interopRequireDefault(_keys);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var simpleTagMap = {
		ITALIC: 'i',
		STRIKETHROUGH: 's',
		BOLD: 'b',
		UNDERLINE: 'u'
	};

	/**
	 * Return an object with the unique values from the second object
	 *
	 * @param {object} obj1 Any old object
	 * @param {object} obj2 An object similar to obj1
	 * @returns {object} unique values from obj2
	 */
	function objectDiff(obj1, obj2) {
		if (!obj1 || !obj2) {
			return {};
		}
		return (0, _keys2['default'])(obj2).reduce(function (acc, key) {
			if (obj1[key] !== obj2[key]) {
				acc[key] = obj2[key];
			}
			return acc;
		}, {});
	}

	/**
	 * Convert an object diff into HTML tags
	 *
	 * @param {object} diffParam An object with changed attributes (e.g. `{ BOLD: true }`)
	 * @returns {string} HTML tags that open or close
	 */
	function tagsForAttrDiff(diffParam) {
		var diff = (0, _assign2['default'])({}, diffParam);
		var tags = '';

		if (diff.LINK_URL) {
			tags += '<a href="' + diff.LINK_URL + '">';
			delete diff.UNDERLINE;
			delete diff.FOREGROUND_COLOR;
		}

		if (diff.LINK_URL === null) {
			tags += '</a>';
			delete diff.UNDERLINE;
			delete diff.FOREGROUND_COLOR;
		}

		for (var prop in simpleTagMap) {
			if (diff[prop]) {
				tags += '<' + simpleTagMap[prop] + '>';
			} else if (diff[prop] === null) {
				tags += '</' + simpleTagMap[prop] + '>';
			}
		}

		return tags;
	}

	var changedTags = exports.changedTags = function changedTags(elAttributes, prevAttributes) {
		return tagsForAttrDiff(objectDiff(prevAttributes, elAttributes));
	};

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(47), __esModule: true };

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(48);
	module.exports = __webpack_require__(5).Object.keys;

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 Object.keys(O)
	var toObject = __webpack_require__(41)
	  , $keys    = __webpack_require__(24);

	__webpack_require__(49)('keys', function(){
	  return function keys(it){
	    return $keys(toObject(it));
	  };
	});

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	// most Object methods by ES6 should accept primitives
	var $export = __webpack_require__(9)
	  , core    = __webpack_require__(5)
	  , fails   = __webpack_require__(19);
	module.exports = function(KEY, exec){
	  var fn  = (core.Object || {})[KEY] || Object[KEY]
	    , exp = {};
	  exp[KEY] = exec(fn);
	  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
	};

/***/ },
/* 50 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	exports['default'] = function (renderContainer) {
		function renderTableRow(row) {
			var tRow = '<tr>';
			var numCells = row.getNumCells();
			for (var i = 0; i < numCells; i++) {
				tRow += '<td>' + renderContainer(row.getCell(i)) + '</td>';
			}
			return tRow + '</tr>';
		}

		return function renderTable(table) {
			var numRows = table.getNumRows();
			var tBody = '<table><tbody>';
			for (var i = 0; i < numRows; i++) {
				tBody += renderTableRow(table.getRow(i));
			}
			return tBody + '</tbody></table>';
		};
	};

/***/ },
/* 51 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	exports["default"] = function (imageLinker) {
		return function renderInlineImage(element) {
			var url = imageLinker(element),
			    imgWidth = element.getWidth(),
			    imgHeight = element.getHeight(),
			    title = element.getAltTitle(),
			    // TODO ESCAPE THESE
			alt = element.getAltDescription(); // TODO ESCAPE THESE
			return "<img src=\"" + url + "\" width=\"" + imgWidth + "\" height=\"" + imgHeight + "\" alt=\"" + alt + "\" title=\"" + title + "\">";
		};
	};

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _attributes = __webpack_require__(44);

	var _tags = __webpack_require__(45);

	exports['default'] = function (DocumentApp, renderContainer) {
		function tagForList(listItem) {
			switch (listItem.getGlyphType()) {
				case DocumentApp.GlyphType.NUMBER:
				case DocumentApp.GlyphType.LATIN_UPPER:
				case DocumentApp.GlyphType.LATIN_LOWER:
				case DocumentApp.GlyphType.ROMAN_UPPER:
				case DocumentApp.GlyphType.ROMAN_LOWER:
					return 'ol';
				case DocumentApp.GlyphType.BULLET:
				default:
					return 'ul';
			}
		}

		function typeForList(listItem) {
			switch (listItem.getGlyphType()) {
				case DocumentApp.GlyphType.LATIN_UPPER:
					return 'A';
				case DocumentApp.GlyphType.LATIN_LOWER:
					return 'a';
				case DocumentApp.GlyphType.ROMAN_UPPER:
					return 'I';
				case DocumentApp.GlyphType.ROMAN_LOWER:
					return 'i';
				case DocumentApp.GlyphType.NUMBER:
				case DocumentApp.GlyphType.BULLET:
				default:
					return null;
			}
		}

		return function renderListItem(element) {
			var listItem = '',
			    typeAttr = '';

			var tag = tagForList(element),
			    openTags = (0, _tags.changedTags)(element.getAttributes(), _attributes.blankAttributes),
			    closedTags = (0, _tags.changedTags)(_attributes.blankAttributes, element.getAttributes()),
			    type = typeForList(element),
			    prevSibling = element.getPreviousSibling(),
			    nextSibling = element.getNextSibling();

			if (type) {
				typeAttr = ' type="' + type + '"';
			}

			if (!prevSibling || prevSibling.getType() !== DocumentApp.ElementType.LIST_ITEM) {
				listItem += '<' + tag + typeAttr + '>\n';
			}
			listItem += '<li>' + openTags + renderContainer(element) + closedTags + '</li>\n';
			if (!nextSibling || nextSibling.getType() !== DocumentApp.ElementType.LIST_ITEM) {
				listItem += '</' + tag + '>\n';
			}
			return listItem;
		};
	};

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports['default'] = renderText;

	var _tags = __webpack_require__(45);

	function chunkTextByAttribute(text) {
		var asString = text.getText();
		var attributeIndices = text.getTextAttributeIndices();
		return attributeIndices.reduce(function (chunks, attrIdx, i) {
			var nextIdx = attributeIndices[i + 1] || undefined;
			chunks.push(asString.substring(attrIdx, nextIdx));
			return chunks;
		}, []);
	}

	function renderText(text) {
		if ('string' === typeof text) {
			return text;
		}

		var attributeIndices = text.getTextAttributeIndices();
		var chunks = chunkTextByAttribute(text);

		var lastAttributes = text.getAttributes();

		return attributeIndices.reduce(function (markup, attrIdx, chunkIdx) {
			var attrs = text.getAttributes(attrIdx);
			var newTags = (0, _tags.changedTags)(attrs, lastAttributes);
			lastAttributes = attrs;
			return markup + newTags + chunks[chunkIdx];
		}, '');
	}

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _stringify = __webpack_require__(3);

	var _stringify2 = _interopRequireDefault(_stringify);

	exports.imageUploadLinker = imageUploadLinker;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var DOCUMENT_PROPERTY = 'imageUrlCache';

	var contentTypeToExtension = {
		'image/png': 'png',
		'image/jpeg': 'jpeg',
		'image/jpg': 'jpg',
		'image/gif': 'gif' // pronounced "GIF"
	};

	function imageUploadLinker(wpClient, docProps, Utilities) {
		var imageUrlCache = {};
		try {
			imageUrlCache = JSON.parse(docProps.getProperty(DOCUMENT_PROPERTY)) || {};
		} catch (e) {
			Logger.log(e.toString());
		}

		function md5(message) {
			return Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, message, Utilities.Charset.US_ASCII).map(function (byte) {
				var char = '';
				if (byte < 0) {
					byte += 255;
				}
				char = byte.toString(16);
				if (char.length === 1) {
					char = '0' + char;
				}
				return char;
			}).join('');
		}

		var linker = function linker(image) {
			var imageBlob = image.getBlob();
			var hash = md5(imageBlob.getBytes());
			if (imageUrlCache[hash]) {
				return imageUrlCache[hash];
			}

			if (!imageBlob.getName()) {
				var contentType = imageBlob.getContentType();
				if (contentTypeToExtension[contentType]) {
					Logger.log('Setting name to ' + hash + '.' + contentTypeToExtension[contentType]);
					imageBlob.setName(hash + '.' + contentTypeToExtension[contentType]);
				} else {
					Logger.log('No content type for ' + contentType);
				}
			} else {
				Logger.log('image has name ' + imageBlob.getBlob());
			}

			var response = wpClient.uploadImage(image);
			var url = response.media[0].URL;
			imageUrlCache[hash] = url;
			docProps.setProperty(DOCUMENT_PROPERTY, (0, _stringify2['default'])(imageUrlCache));
			return url;
		};

		linker.cache = imageUrlCache;
		return linker;
	}

/***/ }
/******/ ])));