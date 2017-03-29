/**
 * @OnlyCurrentDoc
 *
 * The above comment directs Apps Script to limit the scope of file
 * access for this add-on. It specifies that this add-on will only
 * attempt to read or modify the files in which the add-on is used,
 * and not all of the user's files. The authorization request message
 * presented to users will reflect this limited scope.
 */

/* globals PropertiesService, DocumentApp, UrlFetchApp, Utilities, HtmlService, Logger */
import { OAuth2 } from 'imports-loader?_=./Underscore.gs!apps-script-oauth2/dist/OAuth2.gs'

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
export function onInstall( e ) {
	onOpen( e );
}

/**
 * Allow the HTML template to include files
 *
 * @param {string} filename file to include
 * @returns {string} rendered content
 */
export function include( filename ) {
	return HtmlService.createHtmlOutputFromFile( filename )
		.getContent();
}

/**
 * Opens a sidebar in the document containing the add-on's user interface.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 */
export function showSidebar() {
	const page = HtmlService.createTemplateFromFile( 'sidebar' ).evaluate();

	page.setTitle( 'WordPress' );
	DocumentApp.getUi().showSidebar( page );
}

export const getAuthUrl = () => oauthClient().getAuthorizationUrl()

function wpDie( message = '' ) {
	const out = HtmlService.createTemplateFromFile( 'wp-die' );
	out.message = message;
	return out.evaluate();
}

function wpDieTemplate( template, error ) {
	const out = HtmlService.createTemplateFromFile( 'wp-die-' + template );

	out.error = '';
	if ( error ) {
		out.error = error.message;
	}

	return out.evaluate();
}

export function authCallback( request ) {
	let isAuthorized;
	try {
		isAuthorized = oauthClient().handleCallback( request );
	} catch ( e ) {
		return wpDie( 'There was a problem getting access to your site. Please try re-adding it, or <a href="https://support.wordpress.com/">contact support</a>.<pre>' + e );
	}

	if ( isAuthorized ) {
		const site = oauthClient().getToken_()
		try {
			site.info = wpClient.getSiteInfo( site )
		} catch ( e ) {
			return wpDieTemplate( 'json-api', e );
		}
		store.addSite( site )
		const template = HtmlService.createTemplateFromFile( 'oauth-success' );
		showSidebar(); // reload
		return template.evaluate();
	}

	return wpDieTemplate( 'deny' );
}

export function postToWordPress( site_id ) {
	const doc = DocumentApp.getActiveDocument();
	const docProps = PropertiesService.getDocumentProperties();
	const site = store.findSite( site_id );

	const cachedPostData = store.getPostStatus();
	let postId, cachedPost;
	if ( cachedPostData[ site_id ] ) {
		cachedPost = cachedPostData[ site_id ]
		postId = cachedPost.ID;

		if ( postOnServerIsNewer( site, cachedPost ) && ! confirmOverwrite() ) {
			return cachedPost;
		}
	} else {
		const response = wpClient.postToWordPress( site, doc.getName(), '', 'new' );
		postId = response.ID;
	}

	const upload = image => wpClient.uploadImage( site, image, postId );
	const imageCache = ImageCache( site, docProps, md5 )
	const imageUrlMapper = imageUploadLinker( upload, imageCache )
	const renderContainer = DocService( DocumentApp, imageUrlMapper )
	const body = renderContainer( doc.getBody() );

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

function confirmOverwrite() {
	const ui = DocumentApp.getUi();
	const promptResponse = ui.alert(
		'The post has been modified on the site',
		'If you continue, any changes you made to the post on the site will be overwritten with this document. This will also unpublish the post if it has been published.\n\nDo you want to overwrite the changes on the site?',
		ui.ButtonSet.YES_NO
	);

	return ( promptResponse === ui.Button.YES )
}

export function listSites() {
	const sites = store.listSites();
	const posts = store.getPostStatus();
	sites.forEach( site => site.post = posts[ site.blog_id ] )
	return sites;
}

export function deleteSite( site_id ) {
	const site = store.findSite( site_id );
	if ( !site ) {
		return;
	}

	const ui = DocumentApp.getUi();
	const promptResponse = ui.alert(
		'Are you sure you want to remove ' + site.info.name + '?',
		ui.ButtonSet.YES_NO
	);

	if ( promptResponse === ui.Button.YES ) {
		store.deleteSite( site_id );
	}

	return;
}

export function devTest() {
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
	DocumentApp.getUi().alert( JSON.stringify( Object.keys( _ ) ) )
}

export function clearSiteData() {
	const ui = DocumentApp.getUi();
	const promptResponse = ui.alert(
		'Are you sure you want to clear all sites?',
		ui.ButtonSet.YES_NO
	);

	if ( promptResponse === ui.Button.YES ) {
		oauthClient().reset();
		PropertiesService.getUserProperties().deleteAllProperties();
		PropertiesService.getDocumentProperties().deleteAllProperties();
	}

	showSidebar();
}

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
		.map(( byte ) => {
			let char = '';
			if ( byte < 0 ) {
				byte += 255;
			}
			char = byte.toString( 16 );
			if ( char.length === 1 ) {
				char = '0' + char;
			}
			return char;
		})
		.join( '' )
}
