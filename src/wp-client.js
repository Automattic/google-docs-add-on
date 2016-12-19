/* globals Utilities, Logger */

const API_BASE = 'https://public-api.wordpress.com/rest/v1.1';
const CRLF = '\r\n';
const DEFAULT_FILENAME = 'overpass';

const contentTypeToExtension = {
	'image/png': 'png',
	'image/jpeg': 'jpeg',
	'image/bmp': 'bmp',
	'image/gif': 'gif'
}

function fileNameForBlob( blob ) {
	if ( blob.getName() ) {
		return blob.getName();
	}

	const contentType = blob.getContentType();
	if ( contentTypeToExtension[ contentType ] ) {
		return DEFAULT_FILENAME + '.' + contentTypeToExtension[ contentType ]
	}

	throw new Error( 'Unsupported content type: ' + contentType )
}

function makeMultipartBody( payload, boundary ) {
	var body = Utilities.newBlob( '' ).getBytes()

	for ( let k in payload ) {
		let v = payload[ k ]

		if ( v.toString() === 'Blob' ) {
			// attachment
			body = body.concat(
				Utilities.newBlob(
					'--' + boundary + CRLF
					+ 'Content-Disposition: form-data; name="' + k + '"; filename="' + fileNameForBlob( v ) + '"' + CRLF
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

export function WPClient( PropertiesService, OAuth2, UrlFetchApp ) {
	let client = undefined;

	// Needs to be lazy-instantiated because we don't have permissions to access
	// properties until the script is actually open
	function getClient() {
		if ( client ) {
			return client;
		}
		const { OauthClientId, OauthClientSecret } = PropertiesService.getScriptProperties().getProperties();

		client = OAuth2.createService( 'wordpress' )
			.setAuthorizationBaseUrl( 'https://public-api.wordpress.com/oauth2/authorize' )
			.setTokenUrl( 'https://public-api.wordpress.com/oauth2/token' )
			.setClientId( OauthClientId )
			.setClientSecret( OauthClientSecret )
			.setCallbackFunction( 'authCallback' )
			.setPropertyStore( PropertiesService.getUserProperties() )
		return client;
	}

	function request( path, options ) {
		const wpService = getClient();
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

	function postToWordPress( title, content, postIdParam ) {
		const wpService = getClient();
		const postId = postIdParam || 'new';
		const { blog_id } = wpService.getToken_();
		const path = `/sites/${ blog_id }/posts/${ postId }`

		const response = post( path, { payload: {
			status: 'draft',
			title,
			content
		} } );

		return response
	}

	/**
	 * @param {Blob} image a Google InlineImage
	 * @return {object} response
	 */
	function uploadImage( image ) {
		const wpService = getClient();
		const { blog_id } = wpService.getToken_();
		const path = `/sites/${ blog_id }/media/new`
		const imageBlob = image.getBlob()
		Logger.log( JSON.stringify( {
			image: {
				attributes: image.getAttributes(),
				altDescription: image.getAltDescription(),
				altTitle: image.getAltTitle()
			},
			imageBlob: {
				contentType: imageBlob.getContentType(),
				name: imageBlob.getName()
			}
		} ) )
		if ( ! imageBlob.getName() ) {
			imageBlob.setName( image.getAltDescription() );
		}
		const boundary = '-----CUTHEREelH7faHNSXWNi72OTh08zH29D28Zhr3Rif3oupOaDrj'

		const options = {
			method: 'post',
			contentType: `multipart/form-data; boundary=${ boundary }`,
			payload: makeMultipartBody( { 'media[]': imageBlob }, boundary )
		}

		const response = post( path, options )

		return response
	}

	function getSiteInfo() {
		const wpService = getClient();
		const { blog_id } = wpService.getToken_();
		return get( `/sites/${ blog_id }` )
	}

	return {
		getOauthClient: getClient,
		postToWordPress,
		getSiteInfo,
		uploadImage
	}
}
