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
function refreshSite() {
}
function clearSiteData() {
}
function include() {
}
function getAuthUrl() {
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
/***/ (function(module, exports, __webpack_require__) {

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
	global.refreshSite = _index.refreshSite;
	global.clearSiteData = _index.clearSiteData;
	global.include = _index.include;
	global.getAuthUrl = _index.getAuthUrl;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.getAuthUrl = undefined;
	exports.onOpen = onOpen;
	exports.onInstall = onInstall;
	exports.include = include;
	exports.showSidebar = showSidebar;
	exports.authCallback = authCallback;
	exports.refreshSite = refreshSite;
	exports.postToWordPress = postToWordPress;
	exports.listSites = listSites;
	exports.deleteSite = deleteSite;
	exports.devTest = devTest;
	exports.clearSiteData = clearSiteData;

	var _wpClient = __webpack_require__(2);

	var _docService = __webpack_require__(3);

	var _imageUploadLinker = __webpack_require__(11);

	var _imageCache = __webpack_require__(12);

	var _persistance = __webpack_require__(13);

	var _dateUtils = __webpack_require__(14);

	/**
	 * @OnlyCurrentDoc
	 *
	 * The above comment directs Apps Script to limit the scope of file
	 * access for this add-on. It specifies that this add-on will only
	 * attempt to read or modify the files in which the add-on is used,
	 * and not all of the user's files. The authorization request message
	 * presented to users will reflect this limited scope.
	 */

	/* globals PropertiesService, DocumentApp, UrlFetchApp, Utilities, HtmlService, Logger, OAuth2 */
	// import { OAuth2 } from 'imports-loader?_=./Underscore.gs!apps-script-oauth2/dist/OAuth2.gs'

	var wpClient = (0, _wpClient.WPClient)(PropertiesService, UrlFetchApp);
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
		// .addItem( 'Dev Testing', 'devTest' )
		.addToUi();
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
	 * Allow the HTML template to include files
	 *
	 * @param {string} filename file to include
	 * @returns {string} rendered content
	 */
	function include(filename) {
		return HtmlService.createHtmlOutputFromFile(filename).getContent();
	}

	/**
	 * Opens a sidebar in the document containing the add-on's user interface.
	 * This method is only used by the regular add-on, and is never called by
	 * the mobile add-on version.
	 */
	function showSidebar() {
		var page = HtmlService.createTemplateFromFile('sidebar').evaluate();

		page.setTitle('WordPress');
		DocumentApp.getUi().showSidebar(page);
	}

	var getAuthUrl = exports.getAuthUrl = function getAuthUrl() {
		return oauthClient().getAuthorizationUrl();
	};

	function wpDie() {
		var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

		var out = HtmlService.createTemplateFromFile('wp-die');
		out.message = message;
		return out.evaluate();
	}

	function wpDieTemplate(template, error) {
		var out = HtmlService.createTemplateFromFile('wp-die-' + template);

		out.error = '';
		if (error) {
			out.error = error.message;
		}

		return out.evaluate();
	}

	var updateSiteInfo = function updateSiteInfo(site) {
		var postTypes = wpClient.getPostTypes(site).map(function (postType) {
			var taxonomies = wpClient.getTaxonomiesForPostType(site, postType).map(function (t) {
				return t.name;
			});
			return Object.assign({}, postType, { taxonomies: taxonomies });
		});

		return Object.assign({}, site, {
			info: wpClient.getSiteInfo(site),
			categories: wpClient.getCategories(site),
			postTypes: postTypes
		});
	};

	function authCallback(request) {
		var isAuthorized = void 0;
		try {
			isAuthorized = oauthClient().handleCallback(request);
		} catch (e) {
			return wpDie('There was a problem getting access to your site. Please try re-adding it, or <a href="https://support.wordpress.com/">contact support</a>.<pre>' + e);
		}

		if (isAuthorized) {
			var site = oauthClient().getToken();
			try {
				site = updateSiteInfo(site);
			} catch (e) {
				return wpDieTemplate('json-api', e);
			}
			store.addSite(site);
			var template = HtmlService.createTemplateFromFile('oauth-success');
			showSidebar(); // reload
			return template.evaluate();
		}

		return wpDieTemplate('deny');
	}

	function refreshSite(site_id) {
		var site = store.findSite(site_id);
		var updatedSite = updateSiteInfo(site);
		var filteredSite = store.updateSite(updatedSite);
		var cachedPostData = store.getPostStatus();
		filteredSite.post = cachedPostData[site_id];
		return filteredSite;
	}

	function postToWordPress(site_id, _ref) {
		var _ref$categories = _ref.categories,
		    categories = _ref$categories === undefined ? [] : _ref$categories,
		    _ref$tags = _ref.tags,
		    tags = _ref$tags === undefined ? [] : _ref$tags,
		    _ref$type = _ref.type,
		    type = _ref$type === undefined ? 'post' : _ref$type;

		var doc = DocumentApp.getActiveDocument();
		var docProps = PropertiesService.getDocumentProperties();
		var site = store.findSite(site_id);
		var title = doc.getName();

		var cachedPostData = store.getPostStatus();
		var postId = void 0,
		    cachedPost = void 0;
		if (cachedPostData[site_id]) {
			cachedPost = cachedPostData[site_id];
			postId = cachedPost.ID;

			if (postOnServerIsNewer(site, cachedPost) && !confirmOverwrite()) {
				return cachedPost;
			}
		} else {
			var _postParams = { title: title, categories: categories, tags: tags, type: type, status: 'draft' };
			var _response = wpClient.postToWordPress(site, 'new', _postParams);
			store.savePostToSite(_response, site);
			postId = _response.ID;
		}

		var upload = function upload(image) {
			return wpClient.uploadImage(site, image, postId);
		};
		var imageCache = (0, _imageCache.ImageCache)(site, docProps, md5);
		var imageUrlMapper = (0, _imageUploadLinker.imageUploadLinker)(upload, imageCache);
		var renderContainer = (0, _docService.DocService)(DocumentApp, imageUrlMapper);
		var content = renderContainer(doc.getBody());
		var postParams = { title: title, content: content, categories: categories, tags: tags, type: type };
		var response = wpClient.postToWordPress(site, postId, postParams);
		return store.savePostToSite(response, site);
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

	function confirmOverwrite() {
		var ui = DocumentApp.getUi();
		var promptResponse = ui.alert('The post has been modified on the site', 'If you continue, any changes you made to the post on the site will be overwritten with this document.\n\nDo you want to overwrite the changes on the site?', ui.ButtonSet.YES_NO);

		return promptResponse === ui.Button.YES;
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
		// DocumentApp.getUi().alert( JSON.stringify( Object.keys( _ ) ) )
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

		oauthService = OAuth2.createService('overpass').setAuthorizationBaseUrl('https://public-api.wordpress.com/oauth2/authorize').setTokenUrl('https://public-api.wordpress.com/oauth2/token').setClientId(OauthClientId).setClientSecret(OauthClientSecret).setCallbackFunction('authCallback').setPropertyStore(PropertiesService.getUserProperties());
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

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.WPClient = WPClient;
	/* globals Utilities */

	var API_BASE = 'https://public-api.wordpress.com/rest/v1.1';
	var CRLF = '\r\n';
	var DEFAULT_FILENAME = 'image';

	var contentTypeToExtension = {
		'image/png': 'png',
		'image/jpeg': 'jpeg',
		'image/bmp': 'bmp',
		'image/gif': 'gif'
	};

	function filenameForBlob(blob) {
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
				body = body.concat(Utilities.newBlob('--' + boundary + CRLF + 'Content-Disposition: form-data; name="' + k + '"; filename="' + encodeURIComponent(filenameForBlob(v)) + '"' + CRLF + 'Content-Type: ' + v.getContentType() + CRLF
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
			var url = API_BASE + path;
			var headers = { Authorization: 'Bearer ' + access_token };
			if (options.headers) {
				headers = Object.assign(headers, options.headers);
			}

			return JSON.parse(UrlFetchApp.fetch(url, Object.assign(options, { headers: headers })));
		}

		function get(access_token, path) {
			var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

			return request(access_token, path, Object.assign({ method: 'get' }, options));
		}

		function post(access_token, path) {
			var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

			var payload = options.payload ? JSON.stringify(options.payload) : null;
			return request(access_token, path, Object.assign({ method: 'post' }, options, { payload: payload }));
		}

		function postToWordPress(site, postIdParam) {
			var payload = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

			var postId = postIdParam || 'new';
			var blog_id = site.blog_id,
			    access_token = site.access_token;

			var path = '/sites/' + blog_id + '/posts/' + postId;

			return post(access_token, path, { payload: payload });
		}

		function getPostStatus(site, postId) {
			var blog_id = site.blog_id,
			    access_token = site.access_token;

			var path = '/sites/' + blog_id + '/posts/' + postId;

			return get(access_token, path);
		}

		var hasImageFileExtension = function hasImageFileExtension(filename) {
			var extension = filename && filename.split('.').pop();
			return extension && extension.match(/\.(png|gif|jpeg|jpg)$/i);
		};

		/**
	  * @param {Site} site { blog_id, access_token }
	  * @param {InlineImage} image a Google InlineImage
	  * @param {Number} parentId blog post id to attach to
	  * @return {object} response
	  */
		function uploadImage(site, image) {
			var parentId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
			var blog_id = site.blog_id,
			    access_token = site.access_token;

			var path = '/sites/' + blog_id + '/media/new';
			var imageBlob = image.getBlob();

			if (!imageBlob.getName() && image.getAltDescription) {
				// WP needs a valid file extension
				var extension = '';
				if (!hasImageFileExtension(image.getAltDescription())) {
					var mimeType = imageBlob.getContentType();
					extension = contentTypeToExtension[mimeType] ? '.' + contentTypeToExtension[mimeType] : '';
				}
				imageBlob.setName(image.getAltDescription() + extension);
			}
			var boundary = '-----CUTHEREelH7faHNSXWNi72OTh08zH29D28Zhr3Rif3oupOaDrj';

			var options = {
				method: 'post',
				contentType: 'multipart/form-data; boundary=' + boundary,
				payload: makeMultipartBody({ 'media[0]': imageBlob, 'attrs[0][parent_id]': parentId }, boundary)
			};

			return request(access_token, path, options);
		}

		function getSiteInfo(site) {
			var blog_id = site.blog_id,
			    access_token = site.access_token;

			return get(access_token, '/sites/' + blog_id);
		}

		function getPostTypes(site) {
			var blog_id = site.blog_id,
			    access_token = site.access_token;

			var response = get(access_token, '/sites/' + blog_id + '/post-types');
			return response.post_types || [];
		}

		function getCategories(site) {
			var blog_id = site.blog_id,
			    access_token = site.access_token;

			var response = get(access_token, '/sites/' + blog_id + '/categories');
			return response.categories || [];
		}

		function getTaxonomiesForPostType(site, postType) {
			var blog_id = site.blog_id,
			    access_token = site.access_token;
			var name = postType.name;

			var response = get(access_token, '/sites/' + blog_id + '/post-types/' + name + '/taxonomies');
			return response.taxonomies || [];
		}

		return {
			postToWordPress: postToWordPress,
			getSiteInfo: getSiteInfo,
			uploadImage: uploadImage,
			getPostStatus: getPostStatus,
			getPostTypes: getPostTypes,
			getCategories: getCategories,
			getTaxonomiesForPostType: getTaxonomiesForPostType
		};
	}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.DocService = DocService;

	var _paragraph = __webpack_require__(4);

	var _table = __webpack_require__(7);

	var _inlineImage = __webpack_require__(8);

	var _listItem = __webpack_require__(9);

	var _text = __webpack_require__(10);

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
			return childrenOf(element).map(renderElement).concat(renderPositionedImages(element)).map(removeAutolinkedUrls).join('');
		};

		var renderParagraph = (0, _paragraph.Paragraph)(DocumentApp, renderContainer);
		var renderTable = (0, _table.Table)(renderContainer);
		var renderImage = (0, _inlineImage.InlineImage)(imageLinker);
		var renderListItem = (0, _listItem.ListItem)(DocumentApp, renderContainer);
		var renderHorizontalRule = function renderHorizontalRule() {
			return '<hr>';
		};

		function renderElement(element) {
			switch (element.getType()) {
				case DocumentApp.ElementType.PARAGRAPH:
					return renderParagraph(element);
				case DocumentApp.ElementType.TEXT:
					return (0, _text.renderText)(element);
				case DocumentApp.ElementType.INLINE_IMAGE:
					return renderImage(element);
				case DocumentApp.ElementType.LIST_ITEM:
					return renderListItem(element);
				case DocumentApp.ElementType.TABLE:
					return renderTable(element);
				case DocumentApp.ElementType.HORIZONTAL_RULE:
					return renderHorizontalRule(element);
				default:
					return element.getType() + ': ' + element.toString();
			}
		}

		function renderPositionedImages(container) {
			if (!container.getPositionedImages) {
				return [];
			}

			return container.getPositionedImages().map(renderImage);
		}

		/**
	  * Remove auto-linked URLs from markup
	  *
	  * Google Docs links URLs it sees. Which is helpful, WordPress does it too.
	  * But it also interferes with oEmbeds, which is not helpful. So we identify
	  * those auto-linked URLs and send them to WordPress as text.
	  *
	  * @param {string} markup Generated HTML
	  * @return {string} markup without a tags around auto-linked URLs
	  */
		function removeAutolinkedUrls(markup) {
			if (!markup || !markup.replace) {
				return markup;
			}

			// http://stackoverflow.com/a/1732454
			return markup.replace(/<a href="([^"]+)">\1<\/a>/g, '$1');
		}

		return renderContainer;
	}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.Paragraph = Paragraph;

	var _attributes = __webpack_require__(5);

	var _tags = __webpack_require__(6);

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

		function stylesForTag(paragraph) {
			var styles = {};
			var alignment = paragraph.getAlignment();

			switch (alignment) {
				case DocumentApp.HorizontalAlignment.CENTER:
					styles['text-align'] = 'center';
					break;
				case DocumentApp.HorizontalAlignment.RIGHT:
					styles['text-align'] = 'right';
					break;
				case DocumentApp.HorizontalAlignment.JUSTIFY:
					styles['text-align'] = 'justify';
					break;
			}
			return styles;
		}

		function renderStyles(styles) {
			var cssReducer = function cssReducer(css, prop) {
				return css + (prop + ': ' + styles[prop] + ';');
			};
			return Object.keys(styles).reduce(cssReducer, '');
		}

		function renderParagraph(paragraph) {
			var tag = tagForParagraph(paragraph),
			    styles = renderStyles(stylesForTag(paragraph)),
			    openTags = (0, _tags.changedTags)(paragraph.getAttributes(), _attributes.blankAttributes),
			    closedTags = (0, _tags.changedTags)(_attributes.blankAttributes, paragraph.getAttributes()),
			    contents = renderContainer(paragraph);

			var styleAttr = '';
			if (styles) {
				styleAttr = ' style="' + styles + '"';
			}
			return '<' + tag + styleAttr + '>' + openTags + contents + closedTags + ('</' + tag + '>\n');
		}

		return renderParagraph;
	}

/***/ }),
/* 5 */
/***/ (function(module, exports) {

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

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.changedTags = changedTags;
	exports.quoteattr = quoteattr;
	var simpleTagMap = {
		ITALIC: 'i',
		STRIKETHROUGH: 's',
		BOLD: 'b',
		UNDERLINE: 'u'

		/**
	  * Return an object with the unique values from the second object
	  *
	  * @param {object} obj1 Any old object
	  * @param {object} obj2 An object similar to obj1
	  * @returns {object} unique values from obj2
	  */
	};function objectDiff(obj1, obj2) {
		if (!obj1 || !obj2) {
			return {};
		}
		return Object.keys(obj2).reduce(function (acc, key) {
			if (obj1[key] !== obj2[key]) {
				acc[key] = obj2[key];
			}
			return acc;
		}, {});
	}

	function changedTags(elAttributes, prevAttributes) {
		var diff = objectDiff(prevAttributes, elAttributes);
		var tags = '';

		if (diff.LINK_URL) {
			tags += '<a href="' + quoteattr(diff.LINK_URL) + '">';
		}

		for (var prop in simpleTagMap) {
			// Ignore underlines in links
			if ('UNDERLINE' === prop) {
				if (elAttributes.LINK_URL || diff.LINK_URL === null) {
					continue;
				}
			}

			if (diff[prop]) {
				tags += '<' + simpleTagMap[prop] + '>';
			} else if (diff[prop] === null) {
				tags += '</' + simpleTagMap[prop] + '>';
			}
		}

		if (diff.LINK_URL === null) {
			tags += '</a>';
		}

		return tags;
	}

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

/***/ }),
/* 7 */
/***/ (function(module, exports) {

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

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.InlineImage = InlineImage;

	var _tags = __webpack_require__(6);

	function InlineImage(imageLinker) {
		return function renderInlineImage(image) {
			var url = imageLinker(image);
			if (!url) {
				return '';
			}

			var imgWidth = image.getWidth();
			var imgHeight = image.getHeight();
			var title = image.getAltTitle && image.getAltTitle() ? (0, _tags.quoteattr)(image.getAltTitle()) : '';
			var alt = image.getAltDescription && image.getAltDescription() ? (0, _tags.quoteattr)(image.getAltDescription()) : '';

			return '<img src="' + url + '" width="' + imgWidth + '" height="' + imgHeight + '" alt="' + alt + '" title="' + title + '">';
		};
	}

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.ListItem = ListItem;

	var _attributes = __webpack_require__(5);

	var _tags = __webpack_require__(6);

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

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.renderText = renderText;

	var _tags = __webpack_require__(6);

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

/***/ }),
/* 11 */
/***/ (function(module, exports) {

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


		/* globals Logger, DocumentApp */

	};function imageUploadLinker(uploadImage, imageCache) {
		return function (image) {
			var cachedUrl = imageCache.get(image);
			if (cachedUrl) {
				return cachedUrl;
			}

			var imageBlob = image.getBlob();
			if (!imageBlob.getName()) {
				var contentType = imageBlob.getContentType();
				if (contentTypeToExtension[contentType]) {
					Logger.log('Setting name to image.' + contentTypeToExtension[contentType]);
					imageBlob.setName('image.' + contentTypeToExtension[contentType]);
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
				DocumentApp.getUi().alert(JSON.stringify(e));
				Logger.log(e);
				return;
			}
		};
	}

/***/ }),
/* 12 */
/***/ (function(module, exports) {

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

/***/ }),
/* 13 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.Persistance = Persistance;
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

		function updateSite(siteArg) {
			var siteToPersist = undefined;
			persisitSites(listSites().map(function (site) {
				if (site.blog_id === siteArg.blog_id) {
					siteToPersist = siteIdentity(siteArg);
					return siteToPersist;
				}

				return site;
			}));

			return siteToPersist || {};
		}

		function categoryIdentity(category) {
			var ID = category.ID,
			    name = category.name;

			return { ID: ID, name: name };
		}

		function postTypeIdentity(postType) {
			return {
				name: postType.name,
				labels: { singular_name: postType.labels.singular_name },
				supports: {
					editor: postType.supports.editor,
					exclude_from_external_editors: postType.supports.exclude_from_external_editors
				},
				taxonomies: postType.taxonomies
			};
		}

		function siteIdentity(site) {
			var img = '';
			var access_token = site.access_token,
			    blog_id = site.blog_id,
			    blog_url = site.blog_url,
			    name = site.info.name,
			    categories = site.categories,
			    postTypes = site.postTypes;


			if (site.info.icon && site.info.icon.img) {
				img = site.info.icon.img;
			}
			var persistCategories = categories.map(categoryIdentity);
			var persistPostTypes = postTypes.map(postTypeIdentity).filter(function (t) {
				return t.supports.editor;
			}).filter(function (t) {
				return !t.supports.exclude_from_external_editors;
			});

			return {
				access_token: access_token,
				blog_id: blog_id,
				blog_url: blog_url,
				info: { name: name, icon: { img: img } },
				categories: persistCategories,
				postTypes: persistPostTypes
			};
		}

		function deleteSite(site_id) {
			persisitSites(listSites().filter(function (site) {
				return site.blog_id !== site_id;
			}));
		}

		function persisitSites(sites) {
			sitesCache = sites;
			userProps().setProperty(SITE_PERSISTANCE_KEY, JSON.stringify(sites));
		}

		function savePostToSite(post, site) {
			var blog_id = site.blog_id;

			var postData = getPostStatus();
			postData[blog_id] = postIdentity(post);
			docProps().setProperty(POST_PERSISTANCE_KEY, JSON.stringify(postData));
			return postData[blog_id];
		}

		function postIdentity(post) {
			var date = post.date,
			    URL = post.URL,
			    ID = post.ID,
			    modified = post.modified,
			    type = post.type,
			    categories = post.categories,
			    tags = post.tags;

			var postCategories = Object.keys(categories);
			var postTags = Object.keys(tags);
			return { date: date, URL: URL, ID: ID, modified: modified, type: type, categories: postCategories, tags: postTags };
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
			updateSite: updateSite,
			listSites: listSites,
			findSite: findSite,
			deleteSite: deleteSite,
			savePostToSite: savePostToSite,
			getPostStatus: getPostStatus
		};
	}

/***/ }),
/* 14 */
/***/ (function(module, exports) {

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

/***/ })
/******/ ])));