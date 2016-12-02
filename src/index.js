/**
 * @OnlyCurrentDoc
 *
 * The above comment directs Apps Script to limit the scope of file
 * access for this add-on. It specifies that this add-on will only
 * attempt to read or modify the files in which the add-on is used,
 * and not all of the user's files. The authorization request message
 * presented to users will reflect this limited scope.
 */

/* globals PropertiesService */

import "babel-polyfill";

import { getWordPressService, get } from './wpService';
import { exportAsHtml, childrenToHtml } from './docService';

/**
 * Creates a menu entry in the Google Docs UI when the document is opened.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onOpen trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode.
 */
export function onOpen(e) {
	DocumentApp.getUi().createAddonMenu()
		.addItem("Start", "showSidebar")
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
export function onInstall(e) {
	onOpen(e);
}

/**
 * Opens a sidebar in the document containing the add-on's user interface.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 */
export function showSidebar() {
	 const wpService = getWordPressService();
	if ( ! wpService.hasAccess() ) {
		var authorizationUrl = wpService.getAuthorizationUrl();
		var template = HtmlService.createTemplate(
			'<a href="<?= authorizationUrl ?>" target="_blank">Authorize</a>. ' +
			'Reopen the sidebar when the authorization is complete.'
		);
		template.authorizationUrl = authorizationUrl;
		var page = template.evaluate();
		DocumentApp.getUi().showSidebar(page);
	} else {
		const { blog_id } = wpService.getToken_();
		const siteInfo = get( `/sites/${ blog_id }` )
		Logger.log( JSON.stringify( siteInfo ) )
		var ui = HtmlService.createTemplateFromFile('Sidebar')
		Object.assign( ui, siteInfo );
		const output = ui.evaluate()
		output.setTitle('WordPress')
		DocumentApp.getUi().showSidebar(output)
	}
}


export function authCallback(request) {
	const wpService = getWordPressService();
	var isAuthorized = wpService.handleCallback( request );

	if (isAuthorized) {
		return HtmlService.createHtmlOutput( 'Success! You can close this tab.' );
	} else {
		return HtmlService.createHtmlOutput('Denied. You can close this tab');
	}
}

export function postToWordPress() {
	var doc = DocumentApp.getActiveDocument();
	return childrenToHtml( doc.getBody() );

	const wpService = getWordPressService();
	var docProps = PropertiesService.getDocumentProperties();
	var postId = docProps.getProperty('postId');
	var html = exportAsHtml();
	var body = /<body[^>]*>(.*?)<\/body>/.exec(html)[1]; // http://stackoverflow.com/a/1732454


	var urlBase = 'https://public-api.wordpress.com/rest/v1.1';
	const { blog_id } = wpService.getToken_();
	var path = `/sites/${ blog_id }/posts/new`
	if (postId) {
		path = `/sites/${ blog_id }/posts/${ postId }`
	}

	var response = UrlFetchApp.fetch(urlBase + path, {
		headers: {
			Authorization: 'Bearer ' + wpService.getAccessToken()
		},
		method: 'post',
		payload: {
			title: doc.getName(),
			content: body
		}
	});

	response = JSON.parse( response );
	docProps.setProperty( 'postId', response.ID.toString() );
	delete response.content;
	return JSON.stringify( response )
}