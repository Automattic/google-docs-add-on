/* globals Utilities, Logger */

const API_BASE = 'https://public-api.wordpress.com/rest/v1.1';
const CRLF = '\r\n';

function makeMultipartBody( payload, boundary ) {
	var body = Utilities.newBlob( '' ).getBytes()

	for ( let k in payload ) {
		let v = payload[ k ]

		if ( v.toString() === 'Blob' ) {
			// attachment
			let filename = v.getName() || 'foo.jpg'
			body = body.concat(
				Utilities.newBlob(
					'--' + boundary + CRLF
					+ 'Content-Disposition: form-data; name="' + k + '"; filename="' + filename + '"' + CRLF
					+ 'Content-Type: ' + v.getContentType() + CRLF
					// + 'Content-Transfer-Encoding: base64' + CRLF
					+ CRLF
				).getBytes() )

			body = body
				.concat( v.getBytes() )
				.concat( Utilities.newBlob( CRLF ).getBytes() )
		} else {
			// string
			body = body.concat(
				Utilities.newBlob(
					'--' + boundary + CRLF
					+ 'Content-Disposition: form-data; name="' + k + '"' + CRLF + CRLF
					+ v + CRLF
				).getBytes()
			)
		}
	}

	body = body.concat( Utilities.newBlob( CRLF + '--' + boundary + '--' + CRLF ).getBytes() )

	return body
}

export function wpClientFactory( PropertiesService, OAuth2, UrlFetchApp ) {
	const { OauthClientId, OauthClientSecret } = PropertiesService.getScriptProperties().getProperties();

	const wpService = OAuth2.createService( 'wordpress' )
		.setAuthorizationBaseUrl( 'https://public-api.wordpress.com/oauth2/authorize' )
		.setTokenUrl( 'https://public-api.wordpress.com/oauth2/token' )
		.setClientId( OauthClientId )
		.setClientSecret( OauthClientSecret )
		.setCallbackFunction( 'authCallback' )
		.setPropertyStore( PropertiesService.getUserProperties() )

	function request( path, options ) {
		const defaultOptions = {
			headers: {
				Authorization: `Bearer ${ wpService.getAccessToken() }`
			}
		};
		const url = API_BASE + path;

		return JSON.parse( UrlFetchApp.fetch( url, Object.assign( defaultOptions, options ) ) )
	}

	function get( path, options = {} ) {
		return request( path, Object.assign( { method: 'get' }, options ) )
	}

	function post( path, options = {} ) {
		return request( path, Object.assign( { method: 'post' }, options ) )
	}

	function postToWordPress( title, content, postId = 'new' ) {
		const { blog_id } = wpService.getToken_();
		const path = `/sites/${ blog_id }/posts/${ postId }`

		const response = post( path, { payload: { title, content } });

		return response
	}

	function uploadImage( image ) {
		const { blog_id } = wpService.getToken_();
		const path = `/sites/${ blog_id }/media/new`
		const imageBlob = image.getBlob()
		var boundary = '-----CUTHEREelH7faHNSXWNi72OTh08zH29D28Zhr3Rif3oupOaDrj'

		const options = {
			method: 'post',
			contentType: `multipart/form-data; boundary=${ boundary }`,
			payload: makeMultipartBody( { 'media[]': imageBlob }, boundary )
		}

		const response = post( path, options )

		return response
	}

	function getSiteInfo() {
		const { blog_id } = wpService.getToken_();
		return get( `/sites/${ blog_id }` )
	}

	return {
		oauthClient: wpService,
		postToWordPress,
		getSiteInfo,
		uploadImage
	}
}
