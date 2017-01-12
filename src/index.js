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

import { WPClient } from './wp-client';
import { DocService } from './doc-service';
import { imageUploadLinker } from './image-upload-linker';
import { ImageCache } from './image-cache';
import { Persistance } from './persistance';
import { getDateFromIso } from './date-utils';

const wpClient = WPClient( PropertiesService, UrlFetchApp )
const store = Persistance( PropertiesService )

/**
 * Creates a menu entry in the Google Docs UI when the document is opened.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onOpen trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode.
 */
export function onOpen() {
	DocumentApp.getUi().createAddonMenu()
		.addItem( 'Open', 'showSidebar' )
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
export function onInstall( e ) {
	onOpen( e );
}

/**
 * Opens a sidebar in the document containing the add-on's user interface.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 */
export function showSidebar() {
	var template;
	const siteList = store.listSites();

	if ( siteList.length !== 0 ) {
		template = HtmlService.createTemplateFromFile( 'Sidebar' )
		template.siteList = siteList
	} else {
		template = HtmlService.createTemplateFromFile( 'needsOauth' );
	}

	const authorizationUrl = oauthClient().getAuthorizationUrl();
	template.authorizationUrl = authorizationUrl;
	const page = template.evaluate();

	page.setTitle( 'WordPress' )
	DocumentApp.getUi().showSidebar( page );
}

export function authCallback( request ) {
	let isAuthorized;
	try {
		isAuthorized = oauthClient().handleCallback( request );
	} catch ( e ) {
		Logger.log( e )
		return HtmlService.createHtmlOutput( 'Denied 3. You can close this tab' + JSON.stringify( request ) );
	}

	if ( isAuthorized ) {
		const site = oauthClient().getToken_()
		try {
			site.info = wpClient.getSiteInfo( site )
		} catch ( e ) {
			Logger.log( e )
			return HtmlService.createHtmlOutput( 'Denied 1. You can close this tab' + JSON.stringify( site ) );
		}
		store.addSite( site )
		const template = HtmlService.createTemplateFromFile( 'oauthSuccess' );
		showSidebar(); // reload
		return template.evaluate();
	}

	return HtmlService.createHtmlOutput( 'Denied 2. You can close this tab' );
}

export function postToWordPress( site_id, overwriteServer ) {
	const doc = DocumentApp.getActiveDocument();
	const docProps = PropertiesService.getDocumentProperties();
	const site = store.findSite( site_id );
	const upload = image => wpClient.uploadImage( site, image );
	const imageCache = ImageCache( site, docProps, md5 )
	const imageUrlMapper = imageUploadLinker( upload, imageCache )
	const renderContainer = DocService( DocumentApp, imageUrlMapper )
	const body = renderContainer( doc.getBody() );
	const cachedPostData = store.getPostStatus();
	let postId, cachedPost;
	if ( cachedPostData[site_id] ) {
		cachedPost = cachedPostData[site_id]
		postId = cachedPost.ID;
	}

	if ( cachedPost && ! overwriteServer && postOnServerIsNewer( site, cachedPost ) ) {
		throw 'PostOnServerIsNewer';
	}

	const response = wpClient.postToWordPress( site, doc.getName(), body, postId );

	store.savePostToSite( response, site );
	return response;
}

function postOnServerIsNewer( site, cachedPost ) {
	let serverPost;
	try {
		serverPost = wpClient.getPostStatus( site, cachedPost.ID );
	} catch ( e ) {
		Logger.log( 'Cannot get post status:' + e )
		return false;
	}

	const localDate = getDateFromIso( cachedPost.modified );
	const serverDate = getDateFromIso( serverPost.modified );

	return ( localDate < serverDate );
}

export function listSites() {
	const sites = store.listSites();
	const posts = store.getPostStatus();
	sites.forEach( site => site.post = posts[ site.blog_id ] )
	return sites;
}

export function deleteSite( site_id ) {
	return store.deleteSite( site_id )
}

export function devTest() { }

let oauthService = undefined;
// Needs to be lazy-instantiated because we don't have permissions to access
// properties until the app is actually open
function oauthClient() {
	if ( oauthService ) {
		return oauthService;
	}
	const { OauthClientId, OauthClientSecret } = PropertiesService.getScriptProperties().getProperties();

	oauthService = OAuth2.createService( 'overpass' )
		.setAuthorizationBaseUrl( 'https://public-api.wordpress.com/oauth2/authorize' )
		.setTokenUrl( 'https://public-api.wordpress.com/oauth2/token' )
		.setClientId( OauthClientId )
		.setClientSecret( OauthClientSecret )
		.setCallbackFunction( 'authCallback' )
		.setPropertyStore( PropertiesService.getUserProperties() )
	return oauthService;
}

function md5( message ) {
	return Utilities.computeDigest( Utilities.DigestAlgorithm.MD5, message, Utilities.Charset.US_ASCII )
	.map( ( byte ) => {
		let char = '';
		if ( byte < 0 ) {
			byte += 255;
		}
		char = byte.toString( 16 );
		if ( char.length === 1 ) {
			char = '0' + char;
		}
		return char;
	} )
	.join( '' )
}
