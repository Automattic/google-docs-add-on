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
function listSites() {
}
function deleteSite() {
}
function clearSiteData() {
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
	global.listSites = _index.listSites;
	global.deleteSite = _index.deleteSite;
	global.clearSiteData = _index.clearSiteData;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _keys = __webpack_require__(2);

	var _keys2 = _interopRequireDefault(_keys);

	var _stringify = __webpack_require__(37);

	var _stringify2 = _interopRequireDefault(_stringify);

	exports.onOpen = onOpen;
	exports.onInstall = onInstall;
	exports.showSidebar = showSidebar;
	exports.authCallback = authCallback;
	exports.postToWordPress = postToWordPress;
	exports.listSites = listSites;
	exports.deleteSite = deleteSite;
	exports.devTest = devTest;
	exports.clearSiteData = clearSiteData;

	var _OAuth = __webpack_require__(39);

	var _wpClient = __webpack_require__(41);

	var _docService = __webpack_require__(48);

	var _imageUploadLinker = __webpack_require__(56);

	var _imageCache = __webpack_require__(57);

	var _persistance = __webpack_require__(58);

	var _dateUtils = __webpack_require__(59);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var wpClient = (0, _wpClient.WPClient)(PropertiesService, UrlFetchApp); /**
	                                                                         * @OnlyCurrentDoc
	                                                                         *
	                                                                         * The above comment directs Apps Script to limit the scope of file
	                                                                         * access for this add-on. It specifies that this add-on will only
	                                                                         * attempt to read or modify the files in which the add-on is used,
	                                                                         * and not all of the user's files. The authorization request message
	                                                                         * presented to users will reflect this limited scope.
	                                                                         */

	/* globals PropertiesService, DocumentApp, UrlFetchApp, Utilities, HtmlService, Logger */

	var store = (0, _persistance.Persistance)(PropertiesService);

	/**
	 * Creates a menu entry in the Google Docs UI when the document is opened.
	 * This method is only used by the regular add-on, and is never called by
	 * the mobile add-on version.
	 *
	 * @param {object} e The event parameter for a simple onOpen trigger. To
	 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
	 *     running in, inspect e.authMode.
	 */
	function onOpen() {
		DocumentApp.getUi().createAddonMenu().addItem('Open', 'showSidebar')
		// .addItem( 'Clear All Site Data', 'clearSiteData' )
		.addItem('Dev Testing', 'devTest').addToUi();
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
		var siteList = store.listSites();

		if (siteList.length !== 0) {
			template = HtmlService.createTemplateFromFile('Sidebar');
			template.siteList = siteList;
		} else {
			template = HtmlService.createTemplateFromFile('needsOauth');
		}

		var authorizationUrl = oauthClient().getAuthorizationUrl();
		template.authorizationUrl = authorizationUrl;
		var page = template.evaluate();

		page.setTitle('WordPress');
		DocumentApp.getUi().showSidebar(page);
	}

	function authCallback(request) {
		var isAuthorized = void 0;
		try {
			isAuthorized = oauthClient().handleCallback(request);
		} catch (e) {
			return HtmlService.createHtmlOutput('There was a problem getting access to your site. Please try re-adding it, or <a href="https://support.wordpress.com/">contact support</a>.');
		}

		if (isAuthorized) {
			var site = oauthClient().getToken_();
			try {
				site.info = wpClient.getSiteInfo(site);
			} catch (e) {
				return HtmlService.createHtmlOutput('There was a problem getting your site\'s information. Please try re-adding it, or <a href="https://support.wordpress.com/">contact support</a>.');
			}
			store.addSite(site);
			var template = HtmlService.createTemplateFromFile('oauthSuccess');
			showSidebar(); // reload
			return template.evaluate();
		}

		return HtmlService.createHtmlOutput('There was a problem adding your site. Please try re-adding it, or <a href="https://support.wordpress.com/">contact support</a>.');
	}

	function postToWordPress(site_id) {
		var doc = DocumentApp.getActiveDocument();
		var docProps = PropertiesService.getDocumentProperties();
		var site = store.findSite(site_id);
		var upload = function upload(image) {
			return wpClient.uploadImage(site, image);
		};
		var imageCache = (0, _imageCache.ImageCache)(site, docProps, md5);
		var imageUrlMapper = (0, _imageUploadLinker.imageUploadLinker)(upload, imageCache);
		var renderContainer = (0, _docService.DocService)(DocumentApp, imageUrlMapper);
		var body = renderContainer(doc.getBody());
		var cachedPostData = store.getPostStatus();
		var postId = void 0,
		    cachedPost = void 0;
		if (cachedPostData[site_id]) {
			cachedPost = cachedPostData[site_id];
			postId = cachedPost.ID;
		}

		if (cachedPost && postOnServerIsNewer(site, cachedPost)) {
			var ui = DocumentApp.getUi();
			var promptResponse = ui.alert('The post has been modified on the site', 'If you continue, any changes you made to the post on the site will be overwritten with this document.\n\nDo you want to overwrite the changes on the site?', ui.ButtonSet.YES_NO);

			if (promptResponse !== ui.Button.YES) {
				return {};
			}
		}

		var response = wpClient.postToWordPress(site, doc.getName(), body, postId);

		store.savePostToSite(response, site);
		return response;
	}

	function postOnServerIsNewer(site, cachedPost) {
		var serverPost = void 0;
		try {
			serverPost = wpClient.getPostStatus(site, cachedPost.ID);
		} catch (e) {
			Logger.log('Cannot get post status:' + e);
			return false;
		}

		var localDate = (0, _dateUtils.getDateFromIso)(cachedPost.modified);
		var serverDate = (0, _dateUtils.getDateFromIso)(serverPost.modified);

		return localDate < serverDate;
	}

	function listSites() {
		var sites = store.listSites();
		var posts = store.getPostStatus();
		sites.forEach(function (site) {
			return site.post = posts[site.blog_id];
		});
		return sites;
	}

	function deleteSite(site_id) {
		var site = store.findSite(site_id);
		if (!site) {
			return;
		}

		var ui = DocumentApp.getUi();
		var promptResponse = ui.alert('Are you sure you want to remove ' + site.info.name + '?', ui.ButtonSet.YES_NO);

		if (promptResponse === ui.Button.YES) {
			store.deleteSite(site_id);
		}

		return;
	}

	function devTest() {
		// const doc = DocumentApp.getActiveDocument();
		// const body = doc.getBody();
		// const images = [];
		// let imageRange = body.findElement( DocumentApp.ElementType.INLINE_IMAGE );
		// while ( imageRange ) {
		// 	const image = imageRange.getElement();
		// 	const blob = image.getBlob();
		// 	images.push( {
		// 		attributes: image.getAttributes(),
		// 		altTitle: image.getAltTitle(),
		// 		altDescription: image.getAltDescription(),
		// 		blob: {
		// 			name: blob.getName(),
		// 		}
		// 	} )
		// 	imageRange = body.findElement( DocumentApp.ElementType.INLINE_IMAGE, imageRange );
		// }
		DocumentApp.getUi().alert((0, _stringify2['default'])((0, _keys2['default'])(_)));
	}

	function clearSiteData() {
		var ui = DocumentApp.getUi();
		var promptResponse = ui.alert('Are you sure you want to clear all sites?', ui.ButtonSet.YES_NO);

		if (promptResponse === ui.Button.YES) {
			oauthClient().reset();
			PropertiesService.getUserProperties().deleteAllProperties();
			PropertiesService.getDocumentProperties().deleteAllProperties();
		}

		showSidebar();
	}

	var oauthService = undefined;
	// Needs to be lazy-instantiated because we don't have permissions to access
	// properties until the app is actually open
	function oauthClient() {
		if (oauthService) {
			return oauthService;
		}

		var _PropertiesService$ge = PropertiesService.getScriptProperties().getProperties(),
		    OauthClientId = _PropertiesService$ge.OauthClientId,
		    OauthClientSecret = _PropertiesService$ge.OauthClientSecret;

		oauthService = _OAuth.OAuth2.createService('overpass').setAuthorizationBaseUrl('https://public-api.wordpress.com/oauth2/authorize').setTokenUrl('https://public-api.wordpress.com/oauth2/token').setClientId(OauthClientId).setClientSecret(OauthClientSecret).setCallbackFunction('authCallback').setPropertyStore(PropertiesService.getUserProperties());
		return oauthService;
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

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(3), __esModule: true };

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(4);
	module.exports = __webpack_require__(24).Object.keys;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 Object.keys(O)
	var toObject = __webpack_require__(5)
	  , $keys    = __webpack_require__(7);

	__webpack_require__(22)('keys', function(){
	  return function keys(it){
	    return $keys(toObject(it));
	  };
	});

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(6);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)
	var $keys       = __webpack_require__(8)
	  , enumBugKeys = __webpack_require__(21);

	module.exports = Object.keys || function keys(O){
	  return $keys(O, enumBugKeys);
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var has          = __webpack_require__(9)
	  , toIObject    = __webpack_require__(10)
	  , arrayIndexOf = __webpack_require__(13)(false)
	  , IE_PROTO     = __webpack_require__(17)('IE_PROTO');

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
/* 9 */
/***/ function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(11)
	  , defined = __webpack_require__(6);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(12);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 12 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	// false -> Array#indexOf
	// true  -> Array#includes
	var toIObject = __webpack_require__(10)
	  , toLength  = __webpack_require__(14)
	  , toIndex   = __webpack_require__(16);
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
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(15)
	  , min       = Math.min;
	module.exports = function(it){
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ },
/* 15 */
/***/ function(module, exports) {

	// 7.1.4 ToInteger
	var ceil  = Math.ceil
	  , floor = Math.floor;
	module.exports = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(15)
	  , max       = Math.max
	  , min       = Math.min;
	module.exports = function(index, length){
	  index = toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var shared = __webpack_require__(18)('keys')
	  , uid    = __webpack_require__(20);
	module.exports = function(key){
	  return shared[key] || (shared[key] = uid(key));
	};

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(19)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 19 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 20 */
/***/ function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ },
/* 21 */
/***/ function(module, exports) {

	// IE 8- don't enum bug keys
	module.exports = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	// most Object methods by ES6 should accept primitives
	var $export = __webpack_require__(23)
	  , core    = __webpack_require__(24)
	  , fails   = __webpack_require__(33);
	module.exports = function(KEY, exec){
	  var fn  = (core.Object || {})[KEY] || Object[KEY]
	    , exp = {};
	  exp[KEY] = exec(fn);
	  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
	};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(19)
	  , core      = __webpack_require__(24)
	  , ctx       = __webpack_require__(25)
	  , hide      = __webpack_require__(27)
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
/* 24 */
/***/ function(module, exports) {

	var core = module.exports = {version: '2.4.0'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(26);
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
/* 26 */
/***/ function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var dP         = __webpack_require__(28)
	  , createDesc = __webpack_require__(36);
	module.exports = __webpack_require__(32) ? function(object, key, value){
	  return dP.f(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var anObject       = __webpack_require__(29)
	  , IE8_DOM_DEFINE = __webpack_require__(31)
	  , toPrimitive    = __webpack_require__(35)
	  , dP             = Object.defineProperty;

	exports.f = __webpack_require__(32) ? Object.defineProperty : function defineProperty(O, P, Attributes){
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
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(30);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 30 */
/***/ function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = !__webpack_require__(32) && !__webpack_require__(33)(function(){
	  return Object.defineProperty(__webpack_require__(34)('div'), 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(33)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 33 */
/***/ function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(30)
	  , document = __webpack_require__(19).document
	  // in old IE typeof document.createElement is 'object'
	  , is = isObject(document) && isObject(document.createElement);
	module.exports = function(it){
	  return is ? document.createElement(it) : {};
	};

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.1 ToPrimitive(input [, PreferredType])
	var isObject = __webpack_require__(30);
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
/* 36 */
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
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(38), __esModule: true };

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var core  = __webpack_require__(24)
	  , $JSON = core.JSON || (core.JSON = {stringify: JSON.stringify});
	module.exports = function stringify(it){ // eslint-disable-line no-unused-vars
	  return $JSON.stringify.apply($JSON, arguments);
	};

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var _ = __webpack_require__(40);

	(function (host, expose) {
	   var module = { exports: {} };
	   var exports = module.exports;
	   /****** code begin *********/
	// Copyright 2014 Google Inc. All Rights Reserved.
	//
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	//     http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.

	/**
	 * @fileoverview Contains the methods exposed by the library, and performs
	 * any required setup.
	 */

	// Load the Underscore.js library. This library was added using the script
	// ID "1I21uLOwDKdyF3_W_hvh6WXiIKWJWno8yG9lB8lf1VBnZFQ6jAAhyNTRG".


	/**
	 * The supported formats for the returned OAuth2 token.
	 * @type {Object.<string, string>
	 */
	var TOKEN_FORMAT = {
	  JSON: 'application/json',
	  FORM_URL_ENCODED: 'application/x-www-form-urlencoded'
	};

	/**
	 * The supported locations for passing the state parameter.
	 * @type {Object.<string, string>}
	 */
	var STATE_PARAMETER_LOCATION = {
	  AUTHORIZATION_URL: 'authorization-url',
	  REDIRECT_URL: 'redirect-url'
	};

	/**
	 * Creates a new OAuth2 service with the name specified. It's usually best to create and
	 * configure your service once at the start of your script, and then reference them during
	 * the different phases of the authorization flow.
	 * @param {string} serviceName The name of the service.
	 * @return {Service_} The service object.
	 */
	function createService(serviceName) {
	  return new Service_(serviceName);
	}

	/**
	 * Returns the redirect URI that will be used for a given script. Often this URI
	 * needs to be entered into a configuration screen of your OAuth provider.
	 * @param {string} scriptID The script ID of your script, which can be found in
	 *     the Script Editor UI under "File > Project properties".
	 * @return {string} The redirect URI.
	 */
	function getRedirectUri(scriptId) {
	  return Utilities.formatString('https://script.google.com/macros/d/%s/usercallback', scriptId);
	}

	if (module) {
	  module.exports = {
	    createService: createService,
	    getRedirectUri: getRedirectUri
	  };
	}

	// Copyright 2014 Google Inc. All Rights Reserved.
	//
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	//     http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.

	/**
	 * @fileoverview Contains the Service_ class.
	 */

	// Disable JSHint warnings for the use of eval(), since it's required to prevent
	// scope issues in Apps Script.
	// jshint evil:true

	/**
	 * Creates a new OAuth2 service.
	 * @param {string} serviceName The name of the service.
	 * @constructor
	 */
	var Service_ = function(serviceName) {
	  validate_({
	    'Service name': serviceName
	  });
	  this.serviceName_ = serviceName;
	  this.params_ = {};
	  this.tokenFormat_ = TOKEN_FORMAT.JSON;
	  this.tokenHeaders_ = null;
	  this.scriptId_ = eval('Script' + 'App').getScriptId();
	  this.expirationMinutes_ = 60;
	};

	/**
	 * The number of seconds before a token actually expires to consider it expired and refresh it.
	 * @type {number}
	 * @private
	 */
	Service_.EXPIRATION_BUFFER_SECONDS_ = 60;

	/**
	 * Sets the service's authorization base URL (required). For Google services this URL should be
	 * https://accounts.google.com/o/oauth2/auth.
	 * @param {string} authorizationBaseUrl The authorization endpoint base URL.
	 * @return {Service_} This service, for chaining.
	 */
	Service_.prototype.setAuthorizationBaseUrl = function(authorizationBaseUrl) {
	  this.authorizationBaseUrl_ = authorizationBaseUrl;
	  return this;
	};

	/**
	 * Sets the service's token URL (required). For Google services this URL should be
	 * https://accounts.google.com/o/oauth2/token.
	 * @param {string} tokenUrl The token endpoint URL.
	 * @return {Service_} This service, for chaining.
	 */
	Service_.prototype.setTokenUrl = function(tokenUrl) {
	  this.tokenUrl_ = tokenUrl;
	  return this;
	};

	/**
	 * Sets the format of the returned token. Default: OAuth2.TOKEN_FORMAT.JSON.
	 * @param {OAuth2.TOKEN_FORMAT} tokenFormat The format of the returned token.
	 * @return {Service_} This service, for chaining.
	 */
	Service_.prototype.setTokenFormat = function(tokenFormat) {
	  this.tokenFormat_ = tokenFormat;
	  return this;
	};

	/**
	 * Sets the additional HTTP headers that should be sent when retrieving or
	 * refreshing the access token.
	 * @param Object.<string,string> tokenHeaders A map of header names to values.
	 * @return {Service_} This service, for chaining.
	 */
	Service_.prototype.setTokenHeaders = function(tokenHeaders) {
	  this.tokenHeaders_ = tokenHeaders;
	  return this;
	};

	/**
	 * Sets an additional function to invoke on the payload of the access token request.
	 * @param Object tokenHandler A function to invoke on the payload of the request for an access token.
	 * @return {Service_} This service, for chaining.
	 */
	Service_.prototype.setTokenPayloadHandler = function(tokenHandler) {
	  this.tokenPayloadHandler_ = tokenHandler;
	  return this;
	};

	/**
	 * Sets the name of the authorization callback function (required). This is the function that will be
	 * called when the user completes the authorization flow on the service provider's website.
	 * The callback accepts a request parameter, which should be passed to this service's
	 * <code>handleCallback()</code> method to complete the process.
	 * @param {string} callbackFunctionName The name of the callback function.
	 * @return {Service_} This service, for chaining.
	 */
	Service_.prototype.setCallbackFunction = function(callbackFunctionName) {
	  this.callbackFunctionName_ = callbackFunctionName;
	  return this;
	};

	/**
	 * Sets the client ID to use for the OAuth flow (required). You can create client IDs in the
	 * "Credentials" section of a Google Developers Console project. Although you can
	 * use any project with this library, it may be convinient to use the project that
	 * was created for your script. These projects are not visible if you visit the
	 * console directly, but you can access it by click on the menu item
	 * "Resources > Advanced Google services" in the Script Editor, and then click on the link
	 * "Google Developers Console" in the resulting dialog.
	 * @param {string} clientId The client ID to use for the OAuth flow.
	 * @return {Service_} This service, for chaining.
	 */
	Service_.prototype.setClientId = function(clientId) {
	  this.clientId_ = clientId;
	  return this;
	};

	/**
	 * Sets the client secret to use for the OAuth flow (required). See the documentation for
	 * <code>setClientId()</code> for more information on how to create client IDs
	 * and secrets.
	 * @param {string} clientSecret The client secret to use for the OAuth flow.
	 * @return {Service_} This service, for chaining.
	 */
	Service_.prototype.setClientSecret = function(clientSecret) {
	  this.clientSecret_ = clientSecret;
	  return this;
	};

	/**
	 * Sets the property store to use when persisting credentials (required). In most cases this should
	 * be user properties, but document or script properties may be appropriate if you want
	 * to share access across users.
	 * @param {PropertiesService.Properties} propertyStore The property store to use when persisting credentials.
	 * @return {Service_} This service, for chaining.
	 */
	Service_.prototype.setPropertyStore = function(propertyStore) {
	  this.propertyStore_ = propertyStore;
	  return this;
	};

	/**
	 * Sets the cache to use when persisting credentials (optional). Using a cache will reduce the need to
	 * read from the property store and may increase performance. In most cases this should be a private cache,
	 * but a public cache may be appropriate if you want to share access across users.
	 * @param {CacheService.Cache} cache The cache to use when persisting credentials.
	 * @return {Service_} This service, for chaining.
	 */
	Service_.prototype.setCache = function(cache) {
	  this.cache_ = cache;
	  return this;
	};

	/**
	 * Sets the scope or scopes to request during the authorization flow (optional). If the scope value
	 * is an array it will be joined using the separator before being sent to the server, which is
	 * is a space character by default.
	 * @param {string|Array.<string>} scope The scope or scopes to request.
	 * @param {string} opt_separator The optional separator to use when joining multiple scopes. Default: space.
	 * @return {Service_} This service, for chaining.
	 */
	Service_.prototype.setScope = function(scope, opt_separator) {
	  var separator = opt_separator || ' ';
	  this.params_.scope = _.isArray(scope) ? scope.join(separator) : scope;
	  return this;
	};

	/**
	 * Sets an additional parameter to use when constructing the authorization URL (optional). See the documentation
	 * for your service provider for information on what parameter values they support.
	 * @param {string} name The parameter name.
	 * @param {string} value The parameter value.
	 * @return {Service_} This service, for chaining.
	 */
	Service_.prototype.setParam = function(name, value) {
	  this.params_[name] = value;
	  return this;
	};

	/**
	 * Sets the private key to use for Service Account authorization.
	 * @param {string} privateKey The private key.
	 * @return {Service_} This service, for chaining.
	 */
	Service_.prototype.setPrivateKey = function(privateKey) {
	  this.privateKey_ = privateKey;
	  return this;
	};

	/**
	 * Sets the issuer (iss) value to use for Service Account authorization.
	 * If not set the client ID will be used instead.
	 * @param {string} issuer This issuer value
	 * @return {Service_} This service, for chaining.
	 */
	Service_.prototype.setIssuer = function(issuer) {
	  this.issuer_ = issuer;
	  return this;
	};

	/**
	 * Sets the subject (sub) value to use for Service Account authorization.
	 * @param {string} subject This subject value
	 * @return {Service_} This service, for chaining.
	 */
	Service_.prototype.setSubject = function(subject) {
	  this.subject_ = subject;
	  return this;
	};

	/**
	 * Sets number of minutes that a token obtained through Service Account authorization should be valid.
	 * Default: 60 minutes.
	 * @param {string} expirationMinutes The expiration duration in minutes.
	 * @return {Service_} This service, for chaining.
	 */
	Service_.prototype.setExpirationMinutes = function(expirationMinutes) {
	  this.expirationMinutes_ = expirationMinutes;
	  return this;
	};

	/**
	 * Gets the authorization URL. The first step in getting an OAuth2 token is to
	 * have the user visit this URL and approve the authorization request. The
	 * user will then be redirected back to your application using callback function
	 * name specified, so that the flow may continue.
	 * @returns {string} The authorization URL.
	 */
	Service_.prototype.getAuthorizationUrl = function() {
	  validate_({
	    'Client ID': this.clientId_,
	    'Script ID': this.scriptId_,
	    'Callback function name': this.callbackFunctionName_,
	    'Authorization base URL': this.authorizationBaseUrl_
	  });

	  var redirectUri = getRedirectUri(this.scriptId_);
	  var state = eval('Script' + 'App').newStateToken()
	      .withMethod(this.callbackFunctionName_)
	      .withArgument('serviceName', this.serviceName_)
	      .withTimeout(3600)
	      .createToken();
	  var params = {
	    client_id: this.clientId_,
	    response_type: 'code',
	    redirect_uri: redirectUri,
	    state: state
	  };
	  params = _.extend(params, this.params_);
	  return buildUrl_(this.authorizationBaseUrl_, params);
	};

	/**
	 * Completes the OAuth2 flow using the request data passed in to the callback function.
	 * @param {Object} callbackRequest The request data recieved from the callback function.
	 * @return {boolean} True if authorization was granted, false if it was denied.
	 */
	Service_.prototype.handleCallback = function(callbackRequest) {
	  var code = callbackRequest.parameter.code;
	  var error = callbackRequest.parameter.error;
	  if (error) {
	    if (error == 'access_denied') {
	      return false;
	    } else {
	      throw 'Error authorizing token: ' + error;
	    }
	  }
	  validate_({
	    'Client ID': this.clientId_,
	    'Client Secret': this.clientSecret_,
	    'Script ID': this.scriptId_,
	    'Token URL': this.tokenUrl_
	  });
	  var redirectUri = getRedirectUri(this.scriptId_);
	  var headers = {
	    'Accept': this.tokenFormat_
	  };
	  if (this.tokenHeaders_) {
	    headers = _.extend(headers, this.tokenHeaders_);
	  }
	  var tokenPayload = {
	    code: code,
	    client_id: this.clientId_,
	    client_secret: this.clientSecret_,
	    redirect_uri: redirectUri,
	    grant_type: 'authorization_code'
	  };
	  if (this.tokenPayloadHandler_) {
	    tokenPayload = this.tokenPayloadHandler_(tokenPayload);
	    Logger.log('Token payload from tokenPayloadHandler: %s', JSON.stringify(tokenPayload));
	  }
	  var response = UrlFetchApp.fetch(this.tokenUrl_, {
	    method: 'post',
	    headers: headers,
	    payload: tokenPayload,
	    muteHttpExceptions: true
	  });
	  var token = this.getTokenFromResponse_(response);
	  this.saveToken_(token);
	  return true;
	};

	/**
	 * Determines if the service has access (has been authorized and hasn't expired).
	 * If offline access was granted and the previous token has expired this method attempts to
	 * generate a new token.
	 * @return {boolean} true if the user has access to the service, false otherwise.
	 */
	Service_.prototype.hasAccess = function() {
	  var token = this.getToken_();
	  if (!token || this.isExpired_(token)) {
	    if (token && token.refresh_token) {
	      try {
	        this.refresh();
	      } catch (e) {
	        this.lastError_ = e;
	        return false;
	      }
	    } else if (this.privateKey_) {
	      try {
	        this.exchangeJwt_();
	      } catch (e) {
	        this.lastError_ = e;
	        return false;
	      }
	    } else {
	      return false;
	    }
	  }
	  return true;
	};

	/**
	 * Gets an access token for this service. This token can be used in HTTP requests
	 * to the service's endpoint. This method will throw an error if the user's
	 * access was not granted or has expired.
	 * @return {string} An access token.
	 */
	Service_.prototype.getAccessToken = function() {
	  if (!this.hasAccess()) {
	    throw 'Access not granted or expired.';
	  }
	  var token = this.getToken_();
	  return token.access_token;
	};

	/**
	 * Resets the service, removing access and requiring the service to be re-authorized.
	 */
	Service_.prototype.reset = function() {
	  validate_({
	    'Property store': this.propertyStore_
	  });
	  this.propertyStore_.deleteProperty(this.getPropertyKey_(this.serviceName_));
	};

	/**
	 * Gets the last error that occurred this execution when trying to automatically refresh
	 * or generate an access token.
	 * @return {Exception} An error, if any.
	 */
	Service_.prototype.getLastError = function() {
	  return this.lastError_;
	};

	/**
	 * Gets the last error that occurred this execution when trying to automatically refresh
	 * or generate an access token.
	 * @return {Exception} An error, if any.
	 */
	Service_.prototype.getRedirectUri = function() {
	  return getRedirectUri(this.scriptId_);
	};

	/**
	 * Gets the token from a UrlFetchApp response.
	 * @param {UrlFetchApp.HTTPResponse} response The response object.
	 * @return {Object} The parsed token.
	 * @throws If the token cannot be parsed or the response contained an error.
	 * @private
	 */
	Service_.prototype.getTokenFromResponse_ = function(response) {
	  var token = this.parseToken_(response.getContentText());
	  if (response.getResponseCode() != 200 || token.error) {
	    var reason = [
	      token.error,
	      token.message,
	      token.error_description,
	      token.error_uri
	    ].filter(Boolean).map(function(part) {
	      return typeof(part) == 'string' ? part : JSON.stringify(part);
	    }).join(', ');
	    if (!reason) {
	      reason = response.getResponseCode() + ': ' + JSON.stringify(token);
	    }
	    throw 'Error retrieving token: ' + reason;
	  }
	  return token;
	};

	/**
	 * Parses the token using the service's token format.
	 * @param {string} content The serialized token content.
	 * @return {Object} The parsed token.
	 * @private
	 */
	Service_.prototype.parseToken_ = function(content) {
	  var token;
	  if (this.tokenFormat_ == TOKEN_FORMAT.JSON) {
	    try {
	      token = JSON.parse(content);
	    } catch (e) {
	      throw 'Token response not valid JSON: ' + e;
	    }
	  } else if (this.tokenFormat_ == TOKEN_FORMAT.FORM_URL_ENCODED) {
	    token = content.split('&').reduce(function(result, pair) {
	      var parts = pair.split('=');
	      result[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
	      return result;
	    }, {});
	  } else {
	    throw 'Unknown token format: ' + this.tokenFormat_;
	  }
	  token.granted_time = getTimeInSeconds_(new Date());
	  return token;
	};

	/**
	 * Refreshes a token that has expired. This is only possible if offline access was
	 * requested when the token was authorized.
	 */
	Service_.prototype.refresh = function() {
	  validate_({
	    'Client ID': this.clientId_,
	    'Client Secret': this.clientSecret_,
	    'Token URL': this.tokenUrl_
	  });
	  var token = this.getToken_();
	  if (!token.refresh_token) {
	    throw 'Offline access is required.';
	  }
	  var headers = {
	    'Accept': this.tokenFormat_
	  };
	  if (this.tokenHeaders_) {
	    headers = _.extend(headers, this.tokenHeaders_);
	  }
	  var tokenPayload = {
	      refresh_token: token.refresh_token,
	      client_id: this.clientId_,
	      client_secret: this.clientSecret_,
	      grant_type: 'refresh_token'
	  };
	  if (this.tokenPayloadHandler_) {
	    tokenPayload = this.tokenPayloadHandler_(tokenPayload);
	    Logger.log('Token payload from tokenPayloadHandler (refresh): %s', JSON.stringify(tokenPayload));
	  }
	  var response = UrlFetchApp.fetch(this.tokenUrl_, {
	    method: 'post',
	    headers: headers,
	    payload: tokenPayload,
	    muteHttpExceptions: true
	  });
	  var newToken = this.getTokenFromResponse_(response);
	  if (!newToken.refresh_token) {
	    newToken.refresh_token = token.refresh_token;
	  }
	  this.saveToken_(newToken);
	};

	/**
	 * Saves a token to the service's property store and cache.
	 * @param {Object} token The token to save.
	 * @private
	 */
	Service_.prototype.saveToken_ = function(token) {
	  validate_({
	    'Property store': this.propertyStore_
	  });
	  var key = this.getPropertyKey_(this.serviceName_);
	  var value = JSON.stringify(token);
	  this.propertyStore_.setProperty(key, value);
	  if (this.cache_) {
	    this.cache_.put(key, value, 21600);
	  }
	};

	/**
	 * Gets the token from the service's property store or cache.
	 * @return {Object} The token, or null if no token was found.
	 * @private
	 */
	Service_.prototype.getToken_ = function() {
	  validate_({
	    'Property store': this.propertyStore_
	  });
	  var key = this.getPropertyKey_(this.serviceName_);
	  var token;
	  if (this.cache_) {
	    token = this.cache_.get(key);
	  }
	  if (!token) {
	    token = this.propertyStore_.getProperty(key);
	  }
	  if (token) {
	    if (this.cache_) {
	      this.cache_.put(key, token, 21600);
	    }
	    return JSON.parse(token);
	  } else {
	    return null;
	  }
	};

	/**
	 * Generates the property key for a given service name.
	 * @param {string} serviceName The name of the service.
	 * @return {string} The property key.
	 * @private
	 */
	Service_.prototype.getPropertyKey_ = function(serviceName) {
	  return 'oauth2.' + serviceName;
	};

	/**
	 * Determines if a retrieved token is still valid.
	 * @param {Object} token The token to validate.
	 * @return {boolean} True if it has expired, false otherwise.
	 * @private
	 */
	Service_.prototype.isExpired_ = function(token) {
	  var expires_in = token.expires_in || token.expires;
	  if (!expires_in) {
	    return false;
	  } else {
	    var expires_time = token.granted_time + Number(expires_in);
	    var now = getTimeInSeconds_(new Date());
	    return expires_time - now < Service_.EXPIRATION_BUFFER_SECONDS_;
	  }
	};

	/**
	 * Uses the service account flow to exchange a signed JSON Web Token (JWT) for an
	 * access token.
	 */
	Service_.prototype.exchangeJwt_ = function() {
	  validate_({
	    'Token URL': this.tokenUrl_
	  });
	  var jwt = this.createJwt_();
	  var headers = {
	    'Accept': this.tokenFormat_
	  };
	  if (this.tokenHeaders_) {
	    headers = _.extend(headers, this.tokenHeaders_);
	  }
	  var response = UrlFetchApp.fetch(this.tokenUrl_, {
	    method: 'post',
	    headers: headers,
	    payload: {
	      assertion: jwt,
	      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer'
	    },
	    muteHttpExceptions: true
	  });
	  var token = this.getTokenFromResponse_(response);
	  this.saveToken_(token);
	};

	/**
	 * Creates a signed JSON Web Token (JWT) for use with Service Account authorization.
	 * @return {string} The signed JWT.
	 * @private
	 */
	Service_.prototype.createJwt_ = function() {
	  validate_({
	    'Private key': this.privateKey_,
	    'Token URL': this.tokenUrl_,
	    'Issuer or Client ID': this.issuer_ || this.clientId_
	  });
	  var header = {
	    alg: 'RS256',
	    typ: 'JWT'
	  };
	  var now = new Date();
	  var expires = new Date(now.getTime());
	  expires.setMinutes(expires.getMinutes() + this.expirationMinutes_);
	  var claimSet = {
	    iss: this.issuer_ || this.clientId_,
	    aud: this.tokenUrl_,
	    exp: Math.round(expires.getTime() / 1000),
	    iat: Math.round(now.getTime() / 1000)
	  };
	  if (this.subject_) {
	    claimSet.sub = this.subject_;
	  }
	  if (this.params_.scope) {
	   claimSet.scope =  this.params_.scope;
	  }
	  var toSign = Utilities.base64EncodeWebSafe(JSON.stringify(header)) + '.' + Utilities.base64EncodeWebSafe(JSON.stringify(claimSet));
	  var signatureBytes = Utilities.computeRsaSha256Signature(toSign, this.privateKey_);
	  var signature = Utilities.base64EncodeWebSafe(signatureBytes);
	  return toSign + '.' + signature;
	};

	// Copyright 2014 Google Inc. All Rights Reserved.
	//
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	// You may obtain a copy of the License at
	//
	//     http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	// See the License for the specific language governing permissions and
	// limitations under the License.

	/**
	 * @fileoverview Contains utility methods used by the library.
	 */

	/**
	 * Builds a complete URL from a base URL and a map of URL parameters.
	 * @param {string} url The base URL.
	 * @param {Object.<string, string>} params The URL parameters and values.
	 * @returns {string} The complete URL.
	 * @private
	 */
	function buildUrl_(url, params) {
	  var paramString = Object.keys(params).map(function(key) {
	    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
	  }).join('&');
	  return url + (url.indexOf('?') >= 0 ? '&' : '?') + paramString;
	}

	/**
	 * Validates that all of the values in the object are non-empty. If an empty value is found,
	 * and error is thrown using the key as the name.
	 * @param {Object.<string, string>} params The values to validate.
	 * @private
	 */
	function validate_(params) {
	  Object.keys(params).forEach(function(name) {
	    var value = params[name];
	    if (isEmpty_(value)) {
	      throw Utilities.formatString('%s is required.', name);
	    }
	  });
	}

	/**
	 * Returns true if the given value is empty, false otherwise. An empty value is one of
	 * null, undefined, a zero-length string, a zero-length array or an object with no keys.
	 * @param {?} value The value to test.
	 * @returns {boolean} True if the value is empty, false otherwise.
	 * @private
	 */
	function isEmpty_(value) {
	  return value === null || value === undefined ||
	      ((_.isObject(value) || _.isString(value)) && _.isEmpty(value));
	}

	/**
	 * Gets the time in seconds, rounded down to the nearest second.
	 * @param {Date} date The Date object to convert.
	 * @returns {Number} The number of seconds since the epoch.
	 * @private
	 */
	function getTimeInSeconds_(date) {
	  return Math.floor(date.getTime() / 1000);
	}

	   /****** code end *********/
	   ;(
	function copy(src, target, obj) {
	    obj[target] = obj[target] || {};
	    if (src && typeof src === 'object') {
	        for (var k in src) {
	            if (src.hasOwnProperty(k)) {
	                obj[target][k] = src[k];
	            }
	        }
	    } else {
	        obj[target] = src;
	    }
	}
	   ).call(null, module.exports, expose, host);
	}).call(this, this, "OAuth2");


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Underscore.js 1.8.3
	//     http://underscorejs.org
	//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Underscore may be freely distributed under the MIT license.

	(function() {

	  // Baseline setup
	  // --------------

	  // Establish the root object, `window` in the browser, or `exports` on the server.
	  var root = this;

	  // Save the previous value of the `_` variable.
	  var previousUnderscore = root._;

	  // Save bytes in the minified (but not gzipped) version:
	  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	  // Create quick reference variables for speed access to core prototypes.
	  var
	    push             = ArrayProto.push,
	    slice            = ArrayProto.slice,
	    toString         = ObjProto.toString,
	    hasOwnProperty   = ObjProto.hasOwnProperty;

	  // All **ECMAScript 5** native function implementations that we hope to use
	  // are declared here.
	  var
	    nativeIsArray      = Array.isArray,
	    nativeKeys         = Object.keys,
	    nativeBind         = FuncProto.bind,
	    nativeCreate       = Object.create;

	  // Naked function reference for surrogate-prototype-swapping.
	  var Ctor = function(){};

	  // Create a safe reference to the Underscore object for use below.
	  var _ = function(obj) {
	    if (obj instanceof _) return obj;
	    if (!(this instanceof _)) return new _(obj);
	    this._wrapped = obj;
	  };

	  // Export the Underscore object for **Node.js**, with
	  // backwards-compatibility for the old `require()` API. If we're in
	  // the browser, add `_` as a global object.
	  if (true) {
	    if (typeof module !== 'undefined' && module.exports) {
	      exports = module.exports = _;
	    }
	    exports._ = _;
	  } else {
	    root._ = _;
	  }

	  // Current version.
	  _.VERSION = '1.8.3';

	  // Internal function that returns an efficient (for current engines) version
	  // of the passed-in callback, to be repeatedly applied in other Underscore
	  // functions.
	  var optimizeCb = function(func, context, argCount) {
	    if (context === void 0) return func;
	    switch (argCount == null ? 3 : argCount) {
	      case 1: return function(value) {
	        return func.call(context, value);
	      };
	      case 2: return function(value, other) {
	        return func.call(context, value, other);
	      };
	      case 3: return function(value, index, collection) {
	        return func.call(context, value, index, collection);
	      };
	      case 4: return function(accumulator, value, index, collection) {
	        return func.call(context, accumulator, value, index, collection);
	      };
	    }
	    return function() {
	      return func.apply(context, arguments);
	    };
	  };

	  // A mostly-internal function to generate callbacks that can be applied
	  // to each element in a collection, returning the desired result — either
	  // identity, an arbitrary callback, a property matcher, or a property accessor.
	  var cb = function(value, context, argCount) {
	    if (value == null) return _.identity;
	    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
	    if (_.isObject(value)) return _.matcher(value);
	    return _.property(value);
	  };
	  _.iteratee = function(value, context) {
	    return cb(value, context, Infinity);
	  };

	  // An internal function for creating assigner functions.
	  var createAssigner = function(keysFunc, undefinedOnly) {
	    return function(obj) {
	      var length = arguments.length;
	      if (length < 2 || obj == null) return obj;
	      for (var index = 1; index < length; index++) {
	        var source = arguments[index],
	            keys = keysFunc(source),
	            l = keys.length;
	        for (var i = 0; i < l; i++) {
	          var key = keys[i];
	          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
	        }
	      }
	      return obj;
	    };
	  };

	  // An internal function for creating a new object that inherits from another.
	  var baseCreate = function(prototype) {
	    if (!_.isObject(prototype)) return {};
	    if (nativeCreate) return nativeCreate(prototype);
	    Ctor.prototype = prototype;
	    var result = new Ctor;
	    Ctor.prototype = null;
	    return result;
	  };

	  var property = function(key) {
	    return function(obj) {
	      return obj == null ? void 0 : obj[key];
	    };
	  };

	  // Helper for collection methods to determine whether a collection
	  // should be iterated as an array or as an object
	  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
	  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	  var getLength = property('length');
	  var isArrayLike = function(collection) {
	    var length = getLength(collection);
	    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
	  };

	  // Collection Functions
	  // --------------------

	  // The cornerstone, an `each` implementation, aka `forEach`.
	  // Handles raw objects in addition to array-likes. Treats all
	  // sparse array-likes as if they were dense.
	  _.each = _.forEach = function(obj, iteratee, context) {
	    iteratee = optimizeCb(iteratee, context);
	    var i, length;
	    if (isArrayLike(obj)) {
	      for (i = 0, length = obj.length; i < length; i++) {
	        iteratee(obj[i], i, obj);
	      }
	    } else {
	      var keys = _.keys(obj);
	      for (i = 0, length = keys.length; i < length; i++) {
	        iteratee(obj[keys[i]], keys[i], obj);
	      }
	    }
	    return obj;
	  };

	  // Return the results of applying the iteratee to each element.
	  _.map = _.collect = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length,
	        results = Array(length);
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      results[index] = iteratee(obj[currentKey], currentKey, obj);
	    }
	    return results;
	  };

	  // Create a reducing function iterating left or right.
	  function createReduce(dir) {
	    // Optimized iterator function as using arguments.length
	    // in the main function will deoptimize the, see #1991.
	    function iterator(obj, iteratee, memo, keys, index, length) {
	      for (; index >= 0 && index < length; index += dir) {
	        var currentKey = keys ? keys[index] : index;
	        memo = iteratee(memo, obj[currentKey], currentKey, obj);
	      }
	      return memo;
	    }

	    return function(obj, iteratee, memo, context) {
	      iteratee = optimizeCb(iteratee, context, 4);
	      var keys = !isArrayLike(obj) && _.keys(obj),
	          length = (keys || obj).length,
	          index = dir > 0 ? 0 : length - 1;
	      // Determine the initial value if none is provided.
	      if (arguments.length < 3) {
	        memo = obj[keys ? keys[index] : index];
	        index += dir;
	      }
	      return iterator(obj, iteratee, memo, keys, index, length);
	    };
	  }

	  // **Reduce** builds up a single result from a list of values, aka `inject`,
	  // or `foldl`.
	  _.reduce = _.foldl = _.inject = createReduce(1);

	  // The right-associative version of reduce, also known as `foldr`.
	  _.reduceRight = _.foldr = createReduce(-1);

	  // Return the first value which passes a truth test. Aliased as `detect`.
	  _.find = _.detect = function(obj, predicate, context) {
	    var key;
	    if (isArrayLike(obj)) {
	      key = _.findIndex(obj, predicate, context);
	    } else {
	      key = _.findKey(obj, predicate, context);
	    }
	    if (key !== void 0 && key !== -1) return obj[key];
	  };

	  // Return all the elements that pass a truth test.
	  // Aliased as `select`.
	  _.filter = _.select = function(obj, predicate, context) {
	    var results = [];
	    predicate = cb(predicate, context);
	    _.each(obj, function(value, index, list) {
	      if (predicate(value, index, list)) results.push(value);
	    });
	    return results;
	  };

	  // Return all the elements for which a truth test fails.
	  _.reject = function(obj, predicate, context) {
	    return _.filter(obj, _.negate(cb(predicate)), context);
	  };

	  // Determine whether all of the elements match a truth test.
	  // Aliased as `all`.
	  _.every = _.all = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (!predicate(obj[currentKey], currentKey, obj)) return false;
	    }
	    return true;
	  };

	  // Determine if at least one element in the object matches a truth test.
	  // Aliased as `any`.
	  _.some = _.any = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (predicate(obj[currentKey], currentKey, obj)) return true;
	    }
	    return false;
	  };

	  // Determine if the array or object contains a given item (using `===`).
	  // Aliased as `includes` and `include`.
	  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
	    if (!isArrayLike(obj)) obj = _.values(obj);
	    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
	    return _.indexOf(obj, item, fromIndex) >= 0;
	  };

	  // Invoke a method (with arguments) on every item in a collection.
	  _.invoke = function(obj, method) {
	    var args = slice.call(arguments, 2);
	    var isFunc = _.isFunction(method);
	    return _.map(obj, function(value) {
	      var func = isFunc ? method : value[method];
	      return func == null ? func : func.apply(value, args);
	    });
	  };

	  // Convenience version of a common use case of `map`: fetching a property.
	  _.pluck = function(obj, key) {
	    return _.map(obj, _.property(key));
	  };

	  // Convenience version of a common use case of `filter`: selecting only objects
	  // containing specific `key:value` pairs.
	  _.where = function(obj, attrs) {
	    return _.filter(obj, _.matcher(attrs));
	  };

	  // Convenience version of a common use case of `find`: getting the first object
	  // containing specific `key:value` pairs.
	  _.findWhere = function(obj, attrs) {
	    return _.find(obj, _.matcher(attrs));
	  };

	  // Return the maximum element (or element-based computation).
	  _.max = function(obj, iteratee, context) {
	    var result = -Infinity, lastComputed = -Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value > result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Return the minimum element (or element-based computation).
	  _.min = function(obj, iteratee, context) {
	    var result = Infinity, lastComputed = Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value < result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed < lastComputed || computed === Infinity && result === Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Shuffle a collection, using the modern version of the
	  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
	  _.shuffle = function(obj) {
	    var set = isArrayLike(obj) ? obj : _.values(obj);
	    var length = set.length;
	    var shuffled = Array(length);
	    for (var index = 0, rand; index < length; index++) {
	      rand = _.random(0, index);
	      if (rand !== index) shuffled[index] = shuffled[rand];
	      shuffled[rand] = set[index];
	    }
	    return shuffled;
	  };

	  // Sample **n** random values from a collection.
	  // If **n** is not specified, returns a single random element.
	  // The internal `guard` argument allows it to work with `map`.
	  _.sample = function(obj, n, guard) {
	    if (n == null || guard) {
	      if (!isArrayLike(obj)) obj = _.values(obj);
	      return obj[_.random(obj.length - 1)];
	    }
	    return _.shuffle(obj).slice(0, Math.max(0, n));
	  };

	  // Sort the object's values by a criterion produced by an iteratee.
	  _.sortBy = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    return _.pluck(_.map(obj, function(value, index, list) {
	      return {
	        value: value,
	        index: index,
	        criteria: iteratee(value, index, list)
	      };
	    }).sort(function(left, right) {
	      var a = left.criteria;
	      var b = right.criteria;
	      if (a !== b) {
	        if (a > b || a === void 0) return 1;
	        if (a < b || b === void 0) return -1;
	      }
	      return left.index - right.index;
	    }), 'value');
	  };

	  // An internal function used for aggregate "group by" operations.
	  var group = function(behavior) {
	    return function(obj, iteratee, context) {
	      var result = {};
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index) {
	        var key = iteratee(value, index, obj);
	        behavior(result, value, key);
	      });
	      return result;
	    };
	  };

	  // Groups the object's values by a criterion. Pass either a string attribute
	  // to group by, or a function that returns the criterion.
	  _.groupBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
	  });

	  // Indexes the object's values by a criterion, similar to `groupBy`, but for
	  // when you know that your index values will be unique.
	  _.indexBy = group(function(result, value, key) {
	    result[key] = value;
	  });

	  // Counts instances of an object that group by a certain criterion. Pass
	  // either a string attribute to count by, or a function that returns the
	  // criterion.
	  _.countBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key]++; else result[key] = 1;
	  });

	  // Safely create a real, live array from anything iterable.
	  _.toArray = function(obj) {
	    if (!obj) return [];
	    if (_.isArray(obj)) return slice.call(obj);
	    if (isArrayLike(obj)) return _.map(obj, _.identity);
	    return _.values(obj);
	  };

	  // Return the number of elements in an object.
	  _.size = function(obj) {
	    if (obj == null) return 0;
	    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
	  };

	  // Split a collection into two arrays: one whose elements all satisfy the given
	  // predicate, and one whose elements all do not satisfy the predicate.
	  _.partition = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var pass = [], fail = [];
	    _.each(obj, function(value, key, obj) {
	      (predicate(value, key, obj) ? pass : fail).push(value);
	    });
	    return [pass, fail];
	  };

	  // Array Functions
	  // ---------------

	  // Get the first element of an array. Passing **n** will return the first N
	  // values in the array. Aliased as `head` and `take`. The **guard** check
	  // allows it to work with `_.map`.
	  _.first = _.head = _.take = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[0];
	    return _.initial(array, array.length - n);
	  };

	  // Returns everything but the last entry of the array. Especially useful on
	  // the arguments object. Passing **n** will return all the values in
	  // the array, excluding the last N.
	  _.initial = function(array, n, guard) {
	    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
	  };

	  // Get the last element of an array. Passing **n** will return the last N
	  // values in the array.
	  _.last = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[array.length - 1];
	    return _.rest(array, Math.max(0, array.length - n));
	  };

	  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	  // Especially useful on the arguments object. Passing an **n** will return
	  // the rest N values in the array.
	  _.rest = _.tail = _.drop = function(array, n, guard) {
	    return slice.call(array, n == null || guard ? 1 : n);
	  };

	  // Trim out all falsy values from an array.
	  _.compact = function(array) {
	    return _.filter(array, _.identity);
	  };

	  // Internal implementation of a recursive `flatten` function.
	  var flatten = function(input, shallow, strict, startIndex) {
	    var output = [], idx = 0;
	    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
	      var value = input[i];
	      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
	        //flatten current level of array or arguments object
	        if (!shallow) value = flatten(value, shallow, strict);
	        var j = 0, len = value.length;
	        output.length += len;
	        while (j < len) {
	          output[idx++] = value[j++];
	        }
	      } else if (!strict) {
	        output[idx++] = value;
	      }
	    }
	    return output;
	  };

	  // Flatten out an array, either recursively (by default), or just one level.
	  _.flatten = function(array, shallow) {
	    return flatten(array, shallow, false);
	  };

	  // Return a version of the array that does not contain the specified value(s).
	  _.without = function(array) {
	    return _.difference(array, slice.call(arguments, 1));
	  };

	  // Produce a duplicate-free version of the array. If the array has already
	  // been sorted, you have the option of using a faster algorithm.
	  // Aliased as `unique`.
	  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
	    if (!_.isBoolean(isSorted)) {
	      context = iteratee;
	      iteratee = isSorted;
	      isSorted = false;
	    }
	    if (iteratee != null) iteratee = cb(iteratee, context);
	    var result = [];
	    var seen = [];
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var value = array[i],
	          computed = iteratee ? iteratee(value, i, array) : value;
	      if (isSorted) {
	        if (!i || seen !== computed) result.push(value);
	        seen = computed;
	      } else if (iteratee) {
	        if (!_.contains(seen, computed)) {
	          seen.push(computed);
	          result.push(value);
	        }
	      } else if (!_.contains(result, value)) {
	        result.push(value);
	      }
	    }
	    return result;
	  };

	  // Produce an array that contains the union: each distinct element from all of
	  // the passed-in arrays.
	  _.union = function() {
	    return _.uniq(flatten(arguments, true, true));
	  };

	  // Produce an array that contains every item shared between all the
	  // passed-in arrays.
	  _.intersection = function(array) {
	    var result = [];
	    var argsLength = arguments.length;
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var item = array[i];
	      if (_.contains(result, item)) continue;
	      for (var j = 1; j < argsLength; j++) {
	        if (!_.contains(arguments[j], item)) break;
	      }
	      if (j === argsLength) result.push(item);
	    }
	    return result;
	  };

	  // Take the difference between one array and a number of other arrays.
	  // Only the elements present in just the first array will remain.
	  _.difference = function(array) {
	    var rest = flatten(arguments, true, true, 1);
	    return _.filter(array, function(value){
	      return !_.contains(rest, value);
	    });
	  };

	  // Zip together multiple lists into a single array -- elements that share
	  // an index go together.
	  _.zip = function() {
	    return _.unzip(arguments);
	  };

	  // Complement of _.zip. Unzip accepts an array of arrays and groups
	  // each array's elements on shared indices
	  _.unzip = function(array) {
	    var length = array && _.max(array, getLength).length || 0;
	    var result = Array(length);

	    for (var index = 0; index < length; index++) {
	      result[index] = _.pluck(array, index);
	    }
	    return result;
	  };

	  // Converts lists into objects. Pass either a single array of `[key, value]`
	  // pairs, or two parallel arrays of the same length -- one of keys, and one of
	  // the corresponding values.
	  _.object = function(list, values) {
	    var result = {};
	    for (var i = 0, length = getLength(list); i < length; i++) {
	      if (values) {
	        result[list[i]] = values[i];
	      } else {
	        result[list[i][0]] = list[i][1];
	      }
	    }
	    return result;
	  };

	  // Generator function to create the findIndex and findLastIndex functions
	  function createPredicateIndexFinder(dir) {
	    return function(array, predicate, context) {
	      predicate = cb(predicate, context);
	      var length = getLength(array);
	      var index = dir > 0 ? 0 : length - 1;
	      for (; index >= 0 && index < length; index += dir) {
	        if (predicate(array[index], index, array)) return index;
	      }
	      return -1;
	    };
	  }

	  // Returns the first index on an array-like that passes a predicate test
	  _.findIndex = createPredicateIndexFinder(1);
	  _.findLastIndex = createPredicateIndexFinder(-1);

	  // Use a comparator function to figure out the smallest index at which
	  // an object should be inserted so as to maintain order. Uses binary search.
	  _.sortedIndex = function(array, obj, iteratee, context) {
	    iteratee = cb(iteratee, context, 1);
	    var value = iteratee(obj);
	    var low = 0, high = getLength(array);
	    while (low < high) {
	      var mid = Math.floor((low + high) / 2);
	      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
	    }
	    return low;
	  };

	  // Generator function to create the indexOf and lastIndexOf functions
	  function createIndexFinder(dir, predicateFind, sortedIndex) {
	    return function(array, item, idx) {
	      var i = 0, length = getLength(array);
	      if (typeof idx == 'number') {
	        if (dir > 0) {
	            i = idx >= 0 ? idx : Math.max(idx + length, i);
	        } else {
	            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
	        }
	      } else if (sortedIndex && idx && length) {
	        idx = sortedIndex(array, item);
	        return array[idx] === item ? idx : -1;
	      }
	      if (item !== item) {
	        idx = predicateFind(slice.call(array, i, length), _.isNaN);
	        return idx >= 0 ? idx + i : -1;
	      }
	      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
	        if (array[idx] === item) return idx;
	      }
	      return -1;
	    };
	  }

	  // Return the position of the first occurrence of an item in an array,
	  // or -1 if the item is not included in the array.
	  // If the array is large and already in sort order, pass `true`
	  // for **isSorted** to use binary search.
	  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
	  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

	  // Generate an integer Array containing an arithmetic progression. A port of
	  // the native Python `range()` function. See
	  // [the Python documentation](http://docs.python.org/library/functions.html#range).
	  _.range = function(start, stop, step) {
	    if (stop == null) {
	      stop = start || 0;
	      start = 0;
	    }
	    step = step || 1;

	    var length = Math.max(Math.ceil((stop - start) / step), 0);
	    var range = Array(length);

	    for (var idx = 0; idx < length; idx++, start += step) {
	      range[idx] = start;
	    }

	    return range;
	  };

	  // Function (ahem) Functions
	  // ------------------

	  // Determines whether to execute a function as a constructor
	  // or a normal function with the provided arguments
	  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
	    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
	    var self = baseCreate(sourceFunc.prototype);
	    var result = sourceFunc.apply(self, args);
	    if (_.isObject(result)) return result;
	    return self;
	  };

	  // Create a function bound to a given object (assigning `this`, and arguments,
	  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	  // available.
	  _.bind = function(func, context) {
	    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
	    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
	    var args = slice.call(arguments, 2);
	    var bound = function() {
	      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
	    };
	    return bound;
	  };

	  // Partially apply a function by creating a version that has had some of its
	  // arguments pre-filled, without changing its dynamic `this` context. _ acts
	  // as a placeholder, allowing any combination of arguments to be pre-filled.
	  _.partial = function(func) {
	    var boundArgs = slice.call(arguments, 1);
	    var bound = function() {
	      var position = 0, length = boundArgs.length;
	      var args = Array(length);
	      for (var i = 0; i < length; i++) {
	        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
	      }
	      while (position < arguments.length) args.push(arguments[position++]);
	      return executeBound(func, bound, this, this, args);
	    };
	    return bound;
	  };

	  // Bind a number of an object's methods to that object. Remaining arguments
	  // are the method names to be bound. Useful for ensuring that all callbacks
	  // defined on an object belong to it.
	  _.bindAll = function(obj) {
	    var i, length = arguments.length, key;
	    if (length <= 1) throw new Error('bindAll must be passed function names');
	    for (i = 1; i < length; i++) {
	      key = arguments[i];
	      obj[key] = _.bind(obj[key], obj);
	    }
	    return obj;
	  };

	  // Memoize an expensive function by storing its results.
	  _.memoize = function(func, hasher) {
	    var memoize = function(key) {
	      var cache = memoize.cache;
	      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
	      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
	      return cache[address];
	    };
	    memoize.cache = {};
	    return memoize;
	  };

	  // Delays a function for the given number of milliseconds, and then calls
	  // it with the arguments supplied.
	  _.delay = function(func, wait) {
	    var args = slice.call(arguments, 2);
	    return setTimeout(function(){
	      return func.apply(null, args);
	    }, wait);
	  };

	  // Defers a function, scheduling it to run after the current call stack has
	  // cleared.
	  _.defer = _.partial(_.delay, _, 1);

	  // Returns a function, that, when invoked, will only be triggered at most once
	  // during a given window of time. Normally, the throttled function will run
	  // as much as it can, without ever going more than once per `wait` duration;
	  // but if you'd like to disable the execution on the leading edge, pass
	  // `{leading: false}`. To disable execution on the trailing edge, ditto.
	  _.throttle = function(func, wait, options) {
	    var context, args, result;
	    var timeout = null;
	    var previous = 0;
	    if (!options) options = {};
	    var later = function() {
	      previous = options.leading === false ? 0 : _.now();
	      timeout = null;
	      result = func.apply(context, args);
	      if (!timeout) context = args = null;
	    };
	    return function() {
	      var now = _.now();
	      if (!previous && options.leading === false) previous = now;
	      var remaining = wait - (now - previous);
	      context = this;
	      args = arguments;
	      if (remaining <= 0 || remaining > wait) {
	        if (timeout) {
	          clearTimeout(timeout);
	          timeout = null;
	        }
	        previous = now;
	        result = func.apply(context, args);
	        if (!timeout) context = args = null;
	      } else if (!timeout && options.trailing !== false) {
	        timeout = setTimeout(later, remaining);
	      }
	      return result;
	    };
	  };

	  // Returns a function, that, as long as it continues to be invoked, will not
	  // be triggered. The function will be called after it stops being called for
	  // N milliseconds. If `immediate` is passed, trigger the function on the
	  // leading edge, instead of the trailing.
	  _.debounce = function(func, wait, immediate) {
	    var timeout, args, context, timestamp, result;

	    var later = function() {
	      var last = _.now() - timestamp;

	      if (last < wait && last >= 0) {
	        timeout = setTimeout(later, wait - last);
	      } else {
	        timeout = null;
	        if (!immediate) {
	          result = func.apply(context, args);
	          if (!timeout) context = args = null;
	        }
	      }
	    };

	    return function() {
	      context = this;
	      args = arguments;
	      timestamp = _.now();
	      var callNow = immediate && !timeout;
	      if (!timeout) timeout = setTimeout(later, wait);
	      if (callNow) {
	        result = func.apply(context, args);
	        context = args = null;
	      }

	      return result;
	    };
	  };

	  // Returns the first function passed as an argument to the second,
	  // allowing you to adjust arguments, run code before and after, and
	  // conditionally execute the original function.
	  _.wrap = function(func, wrapper) {
	    return _.partial(wrapper, func);
	  };

	  // Returns a negated version of the passed-in predicate.
	  _.negate = function(predicate) {
	    return function() {
	      return !predicate.apply(this, arguments);
	    };
	  };

	  // Returns a function that is the composition of a list of functions, each
	  // consuming the return value of the function that follows.
	  _.compose = function() {
	    var args = arguments;
	    var start = args.length - 1;
	    return function() {
	      var i = start;
	      var result = args[start].apply(this, arguments);
	      while (i--) result = args[i].call(this, result);
	      return result;
	    };
	  };

	  // Returns a function that will only be executed on and after the Nth call.
	  _.after = function(times, func) {
	    return function() {
	      if (--times < 1) {
	        return func.apply(this, arguments);
	      }
	    };
	  };

	  // Returns a function that will only be executed up to (but not including) the Nth call.
	  _.before = function(times, func) {
	    var memo;
	    return function() {
	      if (--times > 0) {
	        memo = func.apply(this, arguments);
	      }
	      if (times <= 1) func = null;
	      return memo;
	    };
	  };

	  // Returns a function that will be executed at most one time, no matter how
	  // often you call it. Useful for lazy initialization.
	  _.once = _.partial(_.before, 2);

	  // Object Functions
	  // ----------------

	  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
	  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
	  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
	                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

	  function collectNonEnumProps(obj, keys) {
	    var nonEnumIdx = nonEnumerableProps.length;
	    var constructor = obj.constructor;
	    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

	    // Constructor is a special case.
	    var prop = 'constructor';
	    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

	    while (nonEnumIdx--) {
	      prop = nonEnumerableProps[nonEnumIdx];
	      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
	        keys.push(prop);
	      }
	    }
	  }

	  // Retrieve the names of an object's own properties.
	  // Delegates to **ECMAScript 5**'s native `Object.keys`
	  _.keys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    if (nativeKeys) return nativeKeys(obj);
	    var keys = [];
	    for (var key in obj) if (_.has(obj, key)) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve all the property names of an object.
	  _.allKeys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    var keys = [];
	    for (var key in obj) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve the values of an object's properties.
	  _.values = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var values = Array(length);
	    for (var i = 0; i < length; i++) {
	      values[i] = obj[keys[i]];
	    }
	    return values;
	  };

	  // Returns the results of applying the iteratee to each element of the object
	  // In contrast to _.map it returns an object
	  _.mapObject = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys =  _.keys(obj),
	          length = keys.length,
	          results = {},
	          currentKey;
	      for (var index = 0; index < length; index++) {
	        currentKey = keys[index];
	        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
	      }
	      return results;
	  };

	  // Convert an object into a list of `[key, value]` pairs.
	  _.pairs = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var pairs = Array(length);
	    for (var i = 0; i < length; i++) {
	      pairs[i] = [keys[i], obj[keys[i]]];
	    }
	    return pairs;
	  };

	  // Invert the keys and values of an object. The values must be serializable.
	  _.invert = function(obj) {
	    var result = {};
	    var keys = _.keys(obj);
	    for (var i = 0, length = keys.length; i < length; i++) {
	      result[obj[keys[i]]] = keys[i];
	    }
	    return result;
	  };

	  // Return a sorted list of the function names available on the object.
	  // Aliased as `methods`
	  _.functions = _.methods = function(obj) {
	    var names = [];
	    for (var key in obj) {
	      if (_.isFunction(obj[key])) names.push(key);
	    }
	    return names.sort();
	  };

	  // Extend a given object with all the properties in passed-in object(s).
	  _.extend = createAssigner(_.allKeys);

	  // Assigns a given object with all the own properties in the passed-in object(s)
	  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
	  _.extendOwn = _.assign = createAssigner(_.keys);

	  // Returns the first key on an object that passes a predicate test
	  _.findKey = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = _.keys(obj), key;
	    for (var i = 0, length = keys.length; i < length; i++) {
	      key = keys[i];
	      if (predicate(obj[key], key, obj)) return key;
	    }
	  };

	  // Return a copy of the object only containing the whitelisted properties.
	  _.pick = function(object, oiteratee, context) {
	    var result = {}, obj = object, iteratee, keys;
	    if (obj == null) return result;
	    if (_.isFunction(oiteratee)) {
	      keys = _.allKeys(obj);
	      iteratee = optimizeCb(oiteratee, context);
	    } else {
	      keys = flatten(arguments, false, false, 1);
	      iteratee = function(value, key, obj) { return key in obj; };
	      obj = Object(obj);
	    }
	    for (var i = 0, length = keys.length; i < length; i++) {
	      var key = keys[i];
	      var value = obj[key];
	      if (iteratee(value, key, obj)) result[key] = value;
	    }
	    return result;
	  };

	   // Return a copy of the object without the blacklisted properties.
	  _.omit = function(obj, iteratee, context) {
	    if (_.isFunction(iteratee)) {
	      iteratee = _.negate(iteratee);
	    } else {
	      var keys = _.map(flatten(arguments, false, false, 1), String);
	      iteratee = function(value, key) {
	        return !_.contains(keys, key);
	      };
	    }
	    return _.pick(obj, iteratee, context);
	  };

	  // Fill in a given object with default properties.
	  _.defaults = createAssigner(_.allKeys, true);

	  // Creates an object that inherits from the given prototype object.
	  // If additional properties are provided then they will be added to the
	  // created object.
	  _.create = function(prototype, props) {
	    var result = baseCreate(prototype);
	    if (props) _.extendOwn(result, props);
	    return result;
	  };

	  // Create a (shallow-cloned) duplicate of an object.
	  _.clone = function(obj) {
	    if (!_.isObject(obj)) return obj;
	    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	  };

	  // Invokes interceptor with the obj, and then returns obj.
	  // The primary purpose of this method is to "tap into" a method chain, in
	  // order to perform operations on intermediate results within the chain.
	  _.tap = function(obj, interceptor) {
	    interceptor(obj);
	    return obj;
	  };

	  // Returns whether an object has a given set of `key:value` pairs.
	  _.isMatch = function(object, attrs) {
	    var keys = _.keys(attrs), length = keys.length;
	    if (object == null) return !length;
	    var obj = Object(object);
	    for (var i = 0; i < length; i++) {
	      var key = keys[i];
	      if (attrs[key] !== obj[key] || !(key in obj)) return false;
	    }
	    return true;
	  };


	  // Internal recursive comparison function for `isEqual`.
	  var eq = function(a, b, aStack, bStack) {
	    // Identical objects are equal. `0 === -0`, but they aren't identical.
	    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	    if (a === b) return a !== 0 || 1 / a === 1 / b;
	    // A strict comparison is necessary because `null == undefined`.
	    if (a == null || b == null) return a === b;
	    // Unwrap any wrapped objects.
	    if (a instanceof _) a = a._wrapped;
	    if (b instanceof _) b = b._wrapped;
	    // Compare `[[Class]]` names.
	    var className = toString.call(a);
	    if (className !== toString.call(b)) return false;
	    switch (className) {
	      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
	      case '[object RegExp]':
	      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
	      case '[object String]':
	        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	        // equivalent to `new String("5")`.
	        return '' + a === '' + b;
	      case '[object Number]':
	        // `NaN`s are equivalent, but non-reflexive.
	        // Object(NaN) is equivalent to NaN
	        if (+a !== +a) return +b !== +b;
	        // An `egal` comparison is performed for other numeric values.
	        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
	      case '[object Date]':
	      case '[object Boolean]':
	        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	        // millisecond representations. Note that invalid dates with millisecond representations
	        // of `NaN` are not equivalent.
	        return +a === +b;
	    }

	    var areArrays = className === '[object Array]';
	    if (!areArrays) {
	      if (typeof a != 'object' || typeof b != 'object') return false;

	      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
	      // from different frames are.
	      var aCtor = a.constructor, bCtor = b.constructor;
	      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
	                               _.isFunction(bCtor) && bCtor instanceof bCtor)
	                          && ('constructor' in a && 'constructor' in b)) {
	        return false;
	      }
	    }
	    // Assume equality for cyclic structures. The algorithm for detecting cyclic
	    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

	    // Initializing stack of traversed objects.
	    // It's done here since we only need them for objects and arrays comparison.
	    aStack = aStack || [];
	    bStack = bStack || [];
	    var length = aStack.length;
	    while (length--) {
	      // Linear search. Performance is inversely proportional to the number of
	      // unique nested structures.
	      if (aStack[length] === a) return bStack[length] === b;
	    }

	    // Add the first object to the stack of traversed objects.
	    aStack.push(a);
	    bStack.push(b);

	    // Recursively compare objects and arrays.
	    if (areArrays) {
	      // Compare array lengths to determine if a deep comparison is necessary.
	      length = a.length;
	      if (length !== b.length) return false;
	      // Deep compare the contents, ignoring non-numeric properties.
	      while (length--) {
	        if (!eq(a[length], b[length], aStack, bStack)) return false;
	      }
	    } else {
	      // Deep compare objects.
	      var keys = _.keys(a), key;
	      length = keys.length;
	      // Ensure that both objects contain the same number of properties before comparing deep equality.
	      if (_.keys(b).length !== length) return false;
	      while (length--) {
	        // Deep compare each member
	        key = keys[length];
	        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
	      }
	    }
	    // Remove the first object from the stack of traversed objects.
	    aStack.pop();
	    bStack.pop();
	    return true;
	  };

	  // Perform a deep comparison to check if two objects are equal.
	  _.isEqual = function(a, b) {
	    return eq(a, b);
	  };

	  // Is a given array, string, or object empty?
	  // An "empty" object has no enumerable own-properties.
	  _.isEmpty = function(obj) {
	    if (obj == null) return true;
	    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
	    return _.keys(obj).length === 0;
	  };

	  // Is a given value a DOM element?
	  _.isElement = function(obj) {
	    return !!(obj && obj.nodeType === 1);
	  };

	  // Is a given value an array?
	  // Delegates to ECMA5's native Array.isArray
	  _.isArray = nativeIsArray || function(obj) {
	    return toString.call(obj) === '[object Array]';
	  };

	  // Is a given variable an object?
	  _.isObject = function(obj) {
	    var type = typeof obj;
	    return type === 'function' || type === 'object' && !!obj;
	  };

	  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
	  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
	    _['is' + name] = function(obj) {
	      return toString.call(obj) === '[object ' + name + ']';
	    };
	  });

	  // Define a fallback version of the method in browsers (ahem, IE < 9), where
	  // there isn't any inspectable "Arguments" type.
	  if (!_.isArguments(arguments)) {
	    _.isArguments = function(obj) {
	      return _.has(obj, 'callee');
	    };
	  }

	  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
	  // IE 11 (#1621), and in Safari 8 (#1929).
	  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
	    _.isFunction = function(obj) {
	      return typeof obj == 'function' || false;
	    };
	  }

	  // Is a given object a finite number?
	  _.isFinite = function(obj) {
	    return isFinite(obj) && !isNaN(parseFloat(obj));
	  };

	  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
	  _.isNaN = function(obj) {
	    return _.isNumber(obj) && obj !== +obj;
	  };

	  // Is a given value a boolean?
	  _.isBoolean = function(obj) {
	    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
	  };

	  // Is a given value equal to null?
	  _.isNull = function(obj) {
	    return obj === null;
	  };

	  // Is a given variable undefined?
	  _.isUndefined = function(obj) {
	    return obj === void 0;
	  };

	  // Shortcut function for checking if an object has a given property directly
	  // on itself (in other words, not on a prototype).
	  _.has = function(obj, key) {
	    return obj != null && hasOwnProperty.call(obj, key);
	  };

	  // Utility Functions
	  // -----------------

	  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
	  // previous owner. Returns a reference to the Underscore object.
	  _.noConflict = function() {
	    root._ = previousUnderscore;
	    return this;
	  };

	  // Keep the identity function around for default iteratees.
	  _.identity = function(value) {
	    return value;
	  };

	  // Predicate-generating functions. Often useful outside of Underscore.
	  _.constant = function(value) {
	    return function() {
	      return value;
	    };
	  };

	  _.noop = function(){};

	  _.property = property;

	  // Generates a function for a given object that returns a given property.
	  _.propertyOf = function(obj) {
	    return obj == null ? function(){} : function(key) {
	      return obj[key];
	    };
	  };

	  // Returns a predicate for checking whether an object has a given set of
	  // `key:value` pairs.
	  _.matcher = _.matches = function(attrs) {
	    attrs = _.extendOwn({}, attrs);
	    return function(obj) {
	      return _.isMatch(obj, attrs);
	    };
	  };

	  // Run a function **n** times.
	  _.times = function(n, iteratee, context) {
	    var accum = Array(Math.max(0, n));
	    iteratee = optimizeCb(iteratee, context, 1);
	    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
	    return accum;
	  };

	  // Return a random integer between min and max (inclusive).
	  _.random = function(min, max) {
	    if (max == null) {
	      max = min;
	      min = 0;
	    }
	    return min + Math.floor(Math.random() * (max - min + 1));
	  };

	  // A (possibly faster) way to get the current timestamp as an integer.
	  _.now = Date.now || function() {
	    return new Date().getTime();
	  };

	   // List of HTML entities for escaping.
	  var escapeMap = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    "'": '&#x27;',
	    '`': '&#x60;'
	  };
	  var unescapeMap = _.invert(escapeMap);

	  // Functions for escaping and unescaping strings to/from HTML interpolation.
	  var createEscaper = function(map) {
	    var escaper = function(match) {
	      return map[match];
	    };
	    // Regexes for identifying a key that needs to be escaped
	    var source = '(?:' + _.keys(map).join('|') + ')';
	    var testRegexp = RegExp(source);
	    var replaceRegexp = RegExp(source, 'g');
	    return function(string) {
	      string = string == null ? '' : '' + string;
	      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
	    };
	  };
	  _.escape = createEscaper(escapeMap);
	  _.unescape = createEscaper(unescapeMap);

	  // If the value of the named `property` is a function then invoke it with the
	  // `object` as context; otherwise, return it.
	  _.result = function(object, property, fallback) {
	    var value = object == null ? void 0 : object[property];
	    if (value === void 0) {
	      value = fallback;
	    }
	    return _.isFunction(value) ? value.call(object) : value;
	  };

	  // Generate a unique integer id (unique within the entire client session).
	  // Useful for temporary DOM ids.
	  var idCounter = 0;
	  _.uniqueId = function(prefix) {
	    var id = ++idCounter + '';
	    return prefix ? prefix + id : id;
	  };

	  // By default, Underscore uses ERB-style template delimiters, change the
	  // following template settings to use alternative delimiters.
	  _.templateSettings = {
	    evaluate    : /<%([\s\S]+?)%>/g,
	    interpolate : /<%=([\s\S]+?)%>/g,
	    escape      : /<%-([\s\S]+?)%>/g
	  };

	  // When customizing `templateSettings`, if you don't want to define an
	  // interpolation, evaluation or escaping regex, we need one that is
	  // guaranteed not to match.
	  var noMatch = /(.)^/;

	  // Certain characters need to be escaped so that they can be put into a
	  // string literal.
	  var escapes = {
	    "'":      "'",
	    '\\':     '\\',
	    '\r':     'r',
	    '\n':     'n',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	  };

	  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

	  var escapeChar = function(match) {
	    return '\\' + escapes[match];
	  };

	  // JavaScript micro-templating, similar to John Resig's implementation.
	  // Underscore templating handles arbitrary delimiters, preserves whitespace,
	  // and correctly escapes quotes within interpolated code.
	  // NB: `oldSettings` only exists for backwards compatibility.
	  _.template = function(text, settings, oldSettings) {
	    if (!settings && oldSettings) settings = oldSettings;
	    settings = _.defaults({}, settings, _.templateSettings);

	    // Combine delimiters into one regular expression via alternation.
	    var matcher = RegExp([
	      (settings.escape || noMatch).source,
	      (settings.interpolate || noMatch).source,
	      (settings.evaluate || noMatch).source
	    ].join('|') + '|$', 'g');

	    // Compile the template source, escaping string literals appropriately.
	    var index = 0;
	    var source = "__p+='";
	    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
	      source += text.slice(index, offset).replace(escaper, escapeChar);
	      index = offset + match.length;

	      if (escape) {
	        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
	      } else if (interpolate) {
	        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
	      } else if (evaluate) {
	        source += "';\n" + evaluate + "\n__p+='";
	      }

	      // Adobe VMs need the match returned to produce the correct offest.
	      return match;
	    });
	    source += "';\n";

	    // If a variable is not specified, place data values in local scope.
	    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

	    source = "var __t,__p='',__j=Array.prototype.join," +
	      "print=function(){__p+=__j.call(arguments,'');};\n" +
	      source + 'return __p;\n';

	    try {
	      var render = new Function(settings.variable || 'obj', '_', source);
	    } catch (e) {
	      e.source = source;
	      throw e;
	    }

	    var template = function(data) {
	      return render.call(this, data, _);
	    };

	    // Provide the compiled source as a convenience for precompilation.
	    var argument = settings.variable || 'obj';
	    template.source = 'function(' + argument + '){\n' + source + '}';

	    return template;
	  };

	  // Add a "chain" function. Start chaining a wrapped Underscore object.
	  _.chain = function(obj) {
	    var instance = _(obj);
	    instance._chain = true;
	    return instance;
	  };

	  // OOP
	  // ---------------
	  // If Underscore is called as a function, it returns a wrapped object that
	  // can be used OO-style. This wrapper holds altered versions of all the
	  // underscore functions. Wrapped objects may be chained.

	  // Helper function to continue chaining intermediate results.
	  var result = function(instance, obj) {
	    return instance._chain ? _(obj).chain() : obj;
	  };

	  // Add your own custom functions to the Underscore object.
	  _.mixin = function(obj) {
	    _.each(_.functions(obj), function(name) {
	      var func = _[name] = obj[name];
	      _.prototype[name] = function() {
	        var args = [this._wrapped];
	        push.apply(args, arguments);
	        return result(this, func.apply(_, args));
	      };
	    });
	  };

	  // Add all of the Underscore functions to the wrapper object.
	  _.mixin(_);

	  // Add all mutator Array functions to the wrapper.
	  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      var obj = this._wrapped;
	      method.apply(obj, arguments);
	      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
	      return result(this, obj);
	    };
	  });

	  // Add all accessor Array functions to the wrapper.
	  _.each(['concat', 'join', 'slice'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      return result(this, method.apply(this._wrapped, arguments));
	    };
	  });

	  // Extracts the result from a wrapped and chained object.
	  _.prototype.value = function() {
	    return this._wrapped;
	  };

	  // Provide unwrapping proxy for some methods used in engine operations
	  // such as arithmetic and JSON stringification.
	  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

	  _.prototype.toString = function() {
	    return '' + this._wrapped;
	  };

	  // AMD registration happens at the end for compatibility with AMD loaders
	  // that may not enforce next-turn semantics on modules. Even though general
	  // practice for AMD registration is to be anonymous, underscore registers
	  // as a named module because, like jQuery, it is a base library that is
	  // popular enough to be bundled in a third party lib, but not be part of
	  // an AMD load request. Those cases could generate an error when an
	  // anonymous define() is called outside of a loader request.
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return _;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	}.call(this));


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _stringify = __webpack_require__(37);

	var _stringify2 = _interopRequireDefault(_stringify);

	var _assign = __webpack_require__(42);

	var _assign2 = _interopRequireDefault(_assign);

	exports.WPClient = WPClient;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	/* globals Utilities, Logger */

	var API_BASE = 'https://public-api.wordpress.com/rest/v1.1';
	var CRLF = '\r\n';
	var DEFAULT_FILENAME = 'image';

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

	function WPClient(PropertiesService, UrlFetchApp) {
		function request(access_token, path, options) {
			var defaultOptions = {
				headers: {
					Authorization: 'Bearer ' + access_token
				}
			};
			var url = API_BASE + path;

			return JSON.parse(UrlFetchApp.fetch(url, (0, _assign2['default'])(defaultOptions, options)));
		}

		function get(access_token, path) {
			var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

			return request(access_token, path, (0, _assign2['default'])({ method: 'get' }, options));
		}

		function post(access_token, path) {
			var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

			return request(access_token, path, (0, _assign2['default'])({ method: 'post' }, options));
		}

		function postToWordPress(site, title, content, postIdParam) {
			var postId = postIdParam || 'new';
			var blog_id = site.blog_id,
			    access_token = site.access_token;

			var path = '/sites/' + blog_id + '/posts/' + postId;

			var response = post(access_token, path, { payload: {
					status: 'draft',
					title: title,
					content: content
				} });

			return response;
		}

		function getPostStatus(site, postId) {
			var blog_id = site.blog_id,
			    access_token = site.access_token;

			var path = '/sites/' + blog_id + '/posts/' + postId;

			var response = get(access_token, path);

			return response;
		}

		/**
	  * @param {Blob} image a Google InlineImage
	  * @return {object} response
	  */
		function uploadImage(site, image) {
			var blog_id = site.blog_id,
			    access_token = site.access_token;

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

			var response = post(access_token, path, options);

			return response;
		}

		function getSiteInfo(site) {
			var blog_id = site.blog_id,
			    access_token = site.access_token;

			return get(access_token, '/sites/' + blog_id);
		}

		return {
			postToWordPress: postToWordPress,
			getSiteInfo: getSiteInfo,
			uploadImage: uploadImage,
			getPostStatus: getPostStatus
		};
	}

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(43), __esModule: true };

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(44);
	module.exports = __webpack_require__(24).Object.assign;

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.1 Object.assign(target, source)
	var $export = __webpack_require__(23);

	$export($export.S + $export.F, 'Object', {assign: __webpack_require__(45)});

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// 19.1.2.1 Object.assign(target, source, ...)
	var getKeys  = __webpack_require__(7)
	  , gOPS     = __webpack_require__(46)
	  , pIE      = __webpack_require__(47)
	  , toObject = __webpack_require__(5)
	  , IObject  = __webpack_require__(11)
	  , $assign  = Object.assign;

	// should work with symbols and should have deterministic property order (V8 bug)
	module.exports = !$assign || __webpack_require__(33)(function(){
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
/* 46 */
/***/ function(module, exports) {

	exports.f = Object.getOwnPropertySymbols;

/***/ },
/* 47 */
/***/ function(module, exports) {

	exports.f = {}.propertyIsEnumerable;

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.DocService = DocService;

	var _paragraph = __webpack_require__(49);

	var _table = __webpack_require__(52);

	var _inlineImage = __webpack_require__(53);

	var _listItem = __webpack_require__(54);

	var _text = __webpack_require__(55);

	// http://stackoverflow.com/a/10050831
	var range = function range(n) {
		if (!n) {
			return [];
		}

		return Array.apply(null, Array(n)).map(function (_, i) {
			return i;
		});
	};

	function DocService(DocumentApp, imageLinker) {
		var childrenOf = function childrenOf(element) {
			return range(element.getNumChildren()).map(function (i) {
				return element.getChild(i);
			});
		};

		var renderContainer = function renderContainer(element) {
			return childrenOf(element).map(renderElement).join('');
		};

		var renderParagraph = (0, _paragraph.Paragraph)(DocumentApp, renderContainer);
		var renderTable = (0, _table.Table)(renderContainer);
		var renderInlineImage = (0, _inlineImage.InlineImage)(imageLinker);
		var renderListItem = (0, _listItem.ListItem)(DocumentApp, renderContainer);

		function renderElement(element) {
			switch (element.getType()) {
				case DocumentApp.ElementType.PARAGRAPH:
					return renderParagraph(element);
				case DocumentApp.ElementType.TEXT:
					return (0, _text.renderText)(element);
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

		return renderContainer;
	}

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.Paragraph = Paragraph;

	var _attributes = __webpack_require__(50);

	var _tags = __webpack_require__(51);

	function Paragraph(DocumentApp, renderContainer) {
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
	}

/***/ },
/* 50 */
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
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.changedTags = undefined;

	var _assign = __webpack_require__(42);

	var _assign2 = _interopRequireDefault(_assign);

	var _keys = __webpack_require__(2);

	var _keys2 = _interopRequireDefault(_keys);

	exports.quoteattr = quoteattr;

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
			tags += '<a href="' + quoteattr(diff.LINK_URL) + '">';
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

	/*
	 * From StackOverflow - http://stackoverflow.com/a/9756789
	 * (cc) by-sa 3.0 verdy-p http://stackoverflow.com/users/407132/verdy-p
	 */
	function quoteattr(s, preserveCR) {
		if (!s) {
			return s;
		}

		preserveCR = preserveCR ? '&#13;' : '\n';
		return ('' + s). /* Forces the conversion to string. */
		replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
		.replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
		.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
		/*
	 You may add other replacements here for HTML only
	 (but it's not necessary).
	 Or for XML, only if the named entities are defined in its DTD.
	 */
		.replace(/\r\n/g, preserveCR) /* Must be before the next replacement. */
		.replace(/[\r\n]/g, preserveCR);
		;
	}

/***/ },
/* 52 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.Table = Table;
	function Table(renderContainer) {
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
	}

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.InlineImage = InlineImage;

	var _tags = __webpack_require__(51);

	function InlineImage(imageLinker) {
		return function renderInlineImage(element) {
			var url = imageLinker(element);
			if (!url) {
				return '';
			}

			var imgWidth = element.getWidth(),
			    imgHeight = element.getHeight(),
			    title = (0, _tags.quoteattr)(element.getAltTitle()),
			    alt = (0, _tags.quoteattr)(element.getAltDescription());
			return '<img src="' + url + '" width="' + imgWidth + '" height="' + imgHeight + '" alt="' + alt + '" title="' + title + '">';
		};
	}

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.ListItem = ListItem;

	var _attributes = __webpack_require__(50);

	var _tags = __webpack_require__(51);

	function ListItem(DocumentApp, renderContainer) {
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

		var nestedListTags = [];

		return function renderListItem(listItem) {
			var rendered = '';

			var type = typeForList(listItem),
			    typeAttr = type ? ' type="' + type + '"' : '';

			var prevSibling = listItem.getPreviousSibling();
			var previousIsListItem = prevSibling && prevSibling.getType() === DocumentApp.ElementType.LIST_ITEM;
			var previousIsLessNested = previousIsListItem && prevSibling.getNestingLevel() < listItem.getNestingLevel();
			var previousIsMoreNested = previousIsListItem && prevSibling.getNestingLevel() > listItem.getNestingLevel();

			// Open list tags
			if (!previousIsListItem) {
				rendered += '<' + tagForList(listItem) + typeAttr + '>\n';
			} else if (previousIsLessNested) {
				var tag = tagForList(listItem);
				rendered += '<' + tag + typeAttr + '>\n';
				nestedListTags.push(tag);
			}

			if (previousIsMoreNested) {
				var nestingLevel = prevSibling.getNestingLevel();
				var targetLevel = listItem.getNestingLevel();
				while (nestingLevel > targetLevel) {
					var _tag = nestedListTags.pop();
					rendered += '</' + _tag + '>\n</li>\n';
					nestingLevel--;
				}
			}

			var openTags = (0, _tags.changedTags)(listItem.getAttributes(), _attributes.blankAttributes),
			    closedTags = (0, _tags.changedTags)(_attributes.blankAttributes, listItem.getAttributes());

			rendered += '<li>' + openTags + renderContainer(listItem) + closedTags;

			var nextSibling = listItem.getNextSibling();
			var nextIsListItem = nextSibling && nextSibling.getType() === DocumentApp.ElementType.LIST_ITEM;
			var nextListItemIsNested = nextIsListItem && nextSibling.getNestingLevel() > listItem.getNestingLevel();

			if (!nextIsListItem) {
				var _tag2 = tagForList(listItem);
				while (_tag2) {
					rendered += '</li>\n</' + _tag2 + '>\n';
					_tag2 = nestedListTags.pop();
				}
			} else if (!nextListItemIsNested) {
				rendered += '</li>\n';
			}

			return rendered;
		};
	}

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.renderText = renderText;

	var _tags = __webpack_require__(51);

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
/* 56 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.imageUploadLinker = imageUploadLinker;
	var contentTypeToExtension = {
		'image/png': 'png',
		'image/jpeg': 'jpeg',
		'image/jpg': 'jpg',
		'image/gif': 'gif' // pronounced "GIF"
	};

	/* globals Logger */

	function imageUploadLinker(uploadImage, imageCache) {
		return function (image) {
			var cachedUrl = imageCache.get(image);
			if (cachedUrl) {
				return cachedUrl;
			}

			var imageBlob = image.getBlob();
			if (!imageBlob.getName()) {
				var contentType = imageBlob.getContentType();
				if (contentTypeToExtension[contentType]) {
					Logger.log('Setting name to overpass.' + contentTypeToExtension[contentType]);
					imageBlob.setName('overpass.' + contentTypeToExtension[contentType]);
				} else {
					Logger.log('No content type for ' + contentType);
				}
			} else {
				Logger.log('image has name ' + imageBlob.getBlob());
			}

			try {
				var response = uploadImage(image);
				var url = response.media[0].URL;
				imageCache.set(image, url);
				return url;
			} catch (e) {
				Logger.log(e);
				return;
			}
		};
	}

/***/ },
/* 57 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.ImageCache = ImageCache;
	function ImageCache(site, docProps, hasher) {

		function pathForImage(image) {
			var blog_id = site.blog_id;

			var imageHash = hasher(image.getBlob().getBytes());
			return 'image:' + blog_id + ':' + imageHash;
		}

		var get = function get(image) {
			return docProps.getProperty(pathForImage(image));
		};

		var set = function set(image, url) {
			return docProps.setProperty(pathForImage(image), url);
		};

		return { get: get, set: set };
	}

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _stringify = __webpack_require__(37);

	var _stringify2 = _interopRequireDefault(_stringify);

	exports.Persistance = Persistance;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var SITE_PERSISTANCE_KEY = 'SITES';
	var POST_PERSISTANCE_KEY = 'POST_DATA';

	function Persistance(propertieService) {
		var userProps = function userProps() {
			return propertieService.getUserProperties();
		};
		var docProps = function docProps() {
			return propertieService.getDocumentProperties();
		};
		var sitesCache = void 0;

		function listSites() {
			if (sitesCache) {
				return sitesCache;
			}

			var jsonSites = userProps().getProperty(SITE_PERSISTANCE_KEY);
			try {
				sitesCache = JSON.parse(jsonSites);
			} catch (e) {
				sitesCache = [];
			}
			return sitesCache || [];
		}

		var findSite = function findSite(site_id) {
			var sites = listSites();
			for (var i = 0; i < sites.length; i++) {
				if (sites[i].blog_id === site_id) {
					return sites[i];
				}
			}
		};

		function addSite(site) {
			if (findSite(site.blog_id)) {
				return;
			}

			persisitSites(listSites().concat(siteIdentity(site)));
		}

		function siteIdentity(site) {
			var img = void 0;
			var access_token = site.access_token,
			    blog_id = site.blog_id,
			    blog_url = site.blog_url,
			    name = site.info.name;

			if (site.info.icon && site.info.icon.img) {
				img = site.info.icon.img;
			}
			return { access_token: access_token, blog_id: blog_id, blog_url: blog_url, info: { name: name, icon: { img: img } } };
		}

		function deleteSite(site_id) {
			persisitSites(listSites().filter(function (site) {
				return site.blog_id !== site_id;
			}));
		}

		function persisitSites(sites) {
			sitesCache = sites;
			userProps().setProperty(SITE_PERSISTANCE_KEY, (0, _stringify2['default'])(sites));
		}

		function savePostToSite(post, site) {
			var blog_id = site.blog_id;

			var postData = getPostStatus();
			postData[blog_id] = postIdentity(post);
			docProps().setProperty(POST_PERSISTANCE_KEY, (0, _stringify2['default'])(postData));
		}

		function postIdentity(post) {
			var date = post.date,
			    URL = post.URL,
			    ID = post.ID,
			    modified = post.modified;

			return { date: date, URL: URL, ID: ID, modified: modified };
		}

		function getPostStatus() {
			var postStatus = docProps().getProperty(POST_PERSISTANCE_KEY);

			if (!postStatus) {
				return {};
			}

			try {
				postStatus = JSON.parse(postStatus);
			} catch (e) {
				postStatus = {};
			}

			return postStatus;
		}

		return {
			addSite: addSite,
			listSites: listSites,
			findSite: findSite,
			deleteSite: deleteSite,
			savePostToSite: savePostToSite,
			getPostStatus: getPostStatus
		};
	}

/***/ },
/* 59 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.getDateFromIso = getDateFromIso;
	/*
	 * From StackOverflow - http://stackoverflow.com/a/11820304
	 * (cc) by-sa 3.0 mhawksey http://stackoverflow.com/users/1027723/mhawksey
	 */
	function getDateFromIso(string) {
		try {
			var aDate = new Date();
			var regexp = '([0-9]{4})(-([0-9]{2})(-([0-9]{2})' + '(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?' + '(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?';
			var d = string.match(new RegExp(regexp));

			var offset = 0;
			var date = new Date(d[1], 0, 1);

			if (d[3]) {
				date.setMonth(d[3] - 1);
			}
			if (d[5]) {
				date.setDate(d[5]);
			}
			if (d[7]) {
				date.setHours(d[7]);
			}
			if (d[8]) {
				date.setMinutes(d[8]);
			}
			if (d[10]) {
				date.setSeconds(d[10]);
			}
			if (d[12]) {
				date.setMilliseconds(Number('0.' + d[12]) * 1000);
			}
			if (d[14]) {
				offset = Number(d[16]) * 60 + Number(d[17]);
				offset *= d[15] === '-' ? 1 : -1;
			}

			offset -= date.getTimezoneOffset();
			var time = Number(date) + offset * 60 * 1000;
			return aDate.setTime(Number(time));
		} catch (e) {
			return;
		}
	}

/***/ }
/******/ ])));