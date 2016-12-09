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

import { wpClientFactory } from './wp-client';
import { docServiceFactory } from './doc-service';
import { imageUploadLinker } from './image-upload-linker';

const wpClient = wpClientFactory( PropertiesService, OAuth2, UrlFetchApp )

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
		.addItem( 'Start', 'showSidebar' )
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
	if ( !wpClient.oauthClient.hasAccess() ) {
		const authorizationUrl = wpClient.oauthClient.getAuthorizationUrl();
		const template = HtmlService.createTemplate(
			'<a href="<?= authorizationUrl ?>" target="_blank">Authorize</a>. ' +
			'Reopen the sidebar when the authorization is complete.'
		);
		template.authorizationUrl = authorizationUrl;
		const page = template.evaluate();
		DocumentApp.getUi().showSidebar( page );
	} else {
		const siteInfo = wpClient.getSiteInfo();
		const ui = HtmlService.createTemplateFromFile( 'Sidebar' )
		Object.assign( ui, siteInfo );
		const output = ui.evaluate()
		output.setTitle( 'WordPress' )
		DocumentApp.getUi().showSidebar( output )
	}
}

export function authCallback( request ) {
	var isAuthorized = wpClient.oauthClient.handleCallback( request );

	if ( isAuthorized ) {
		// TODO auto-closing tab with JavaScript
		return HtmlService.createHtmlOutput( 'Success! You can close this tab.' );
	}

	return HtmlService.createHtmlOutput( 'Denied. You can close this tab' );
}

export function postToWordPress() {
	const doc = DocumentApp.getActiveDocument();
	const docProps = PropertiesService.getDocumentProperties();
	const imageUrlMapper = imageUploadLinker( wpClient, docProps, Utilities )
	const renderContainer = docServiceFactory( DocumentApp, imageUrlMapper )

	const body = renderContainer( doc.getBody() );
	const postId = docProps.getProperty( 'postId' );

	const response = wpClient.postToWordPress( doc.getName(), body, postId );
	docProps.setProperty( 'postId', response.ID.toString() );
	return response;
}