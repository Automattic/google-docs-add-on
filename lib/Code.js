/**
 * @OnlyCurrentDoc
 *
 * The above comment directs Apps Script to limit the scope of file
 * access for this add-on. It specifies that this add-on will only
 * attempt to read or modify the files in which the add-on is used,
 * and not all of the user's files. The authorization request message
 * presented to users will reflect this limited scope.
 */

/**
 * Creates a menu entry in the Google Docs UI when the document is opened.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onOpen trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode.
 */
function onOpen(e) {
	DocumentApp.getUi().createAddonMenu()
		.addItem('Start', 'showSidebar')
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
 * Opens a sidebar in the document containing the add-on's user interface.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 */
function showSidebar() {
	var wpService = getWordPressService();
	if (!wpService.hasAccess()) {
		var authorizationUrl = wpService.getAuthorizationUrl();
		var template = HtmlService.createTemplate(
			'<a href="<?= authorizationUrl ?>" target="_blank">Authorize</a>. ' +
			'Reopen the sidebar when the authorization is complete.'
		);
		template.authorizationUrl = authorizationUrl;
		var page = template.evaluate();
		DocumentApp.getUi().showSidebar(page);
	} else {
		var ui = HtmlService.createHtmlOutputFromFile('Sidebar')
			.setTitle('WordPress');
		DocumentApp.getUi().showSidebar(ui);
	}
}

// HACK HACK HACK but it's either this or write a custom HTML generator?
function exportAsHtml() {
	var forDriveScope = DriveApp.getStorageUsed(); //needed to get Drive Scope requested
	var docID = DocumentApp.getActiveDocument().getId();
	var url = "https://docs.google.com/feeds/download/documents/export/Export?id=" + docID + "&exportFormat=html";
	var param = {
		method: "get",
		headers: { "Authorization": "Bearer " + ScriptApp.getOAuthToken() },
		muteHttpExceptions: true,
	};
	var html = UrlFetchApp.fetch(url, param).getContentText();
	return html;
}

function getWordPressService() {
	var props = PropertiesService.getScriptProperties().getProperties();

	return OAuth2.createService('wordpress')
		.setAuthorizationBaseUrl('https://public-api.wordpress.com/oauth2/authorize')
		.setTokenUrl('https://public-api.wordpress.com/oauth2/token')
		.setClientId( props.OauthClientId )
		.setClientSecret( props.OauthClientSecret )
		.setCallbackFunction('authCallback')
		.setPropertyStore(PropertiesService.getUserProperties())
}

function authCallback(request) {
	var wpService = getWordPressService();
	var isAuthorized = wpService.handleCallback(request);
	if (isAuthorized) {
		return HtmlService.createHtmlOutput('Success! You can close this tab.');
	} else {
		return HtmlService.createHtmlOutput('Denied. You can close this tab');
	}
}

function postToWordPress() {
	var html = exportAsHtml();
	var body = /<body[^>]*>(.*?)<\/body>/.exec(html)[1]; // http://stackoverflow.com/a/1732454
	var doc = DocumentApp.getActiveDocument();

	var wpService = getWordPressService();
	var urlBase = 'https://public-api.wordpress.com/rest/v1.1';
	var response = UrlFetchApp.fetch( urlBase + '/sites/georgehtest2.wordpress.com/posts/new', {
		headers: {
			Authorization: 'Bearer ' + wpService.getAccessToken()
		},
		method: 'post',
		payload: {
			title: doc.getName(),
			content: body
		}
	});
	delete response.content;
	Logger.log( response );
	return JSON.stringify( response );
}