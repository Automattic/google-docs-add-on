/* globals PropertiesService, OAuth2, UrlFetchApp */

const API_BASE = 'https://public-api.wordpress.com/rest/v1.1';

let wpService = null;

export function getWordPressService() {
	if ( ! wpService ) {
		wpService = createWordPressService();
	}
	return wpService;
}

export function createWordPressService() {
	var props = PropertiesService.getScriptProperties().getProperties();

	return OAuth2.createService('wordpress')
		.setAuthorizationBaseUrl('https://public-api.wordpress.com/oauth2/authorize')
		.setTokenUrl('https://public-api.wordpress.com/oauth2/token')
		.setClientId(props.OauthClientId)
		.setClientSecret(props.OauthClientSecret)
		.setCallbackFunction('authCallback')
		.setPropertyStore(PropertiesService.getUserProperties())
}

export function get( path, options = {} ) {
	const defaultOptions = {
		headers: {
			Authorization: `Bearer ${getWordPressService().getAccessToken()}`
		},
		method: 'get'
	};

	return JSON.parse( UrlFetchApp.fetch( API_BASE + path, Object.assign( defaultOptions, options ) ) )
}