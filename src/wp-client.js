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

export function WPClient( PropertiesService, UrlFetchApp ) {
	function request( access_token, path, options ) {
		const defaultOptions = {
			headers: {
				Authorization: `Bearer ${ access_token }`
			}
		};
		const url = API_BASE + path;

		return JSON.parse( UrlFetchApp.fetch( url, Object.assign( defaultOptions, options ) ) )
	}

	function get( access_token, path, options = {} ) {
		return request( access_token, path, Object.assign( { method: 'get' }, options ) )
	}

	function post( access_token, path, options = {} ) {
		return request( access_token, path, Object.assign( { method: 'post' }, options ) )
	}

	function postToWordPress( site, title, content, postIdParam ) {
		const postId = postIdParam || 'new';
		const { blog_id, access_token } = site;
		const path = `/sites/${ blog_id }/posts/${ postId }`

		const response = post( access_token, path, { payload: {
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
	function uploadImage( site, image ) {
		const { blog_id, access_token } = site;
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

		const response = post( access_token, path, options )

		return response
	}

	function getSiteInfo( site ) {
		const { blog_id, access_token } = site;
		return get( access_token, `/sites/${ blog_id }` )
	}

	return {
		postToWordPress,
		getSiteInfo,
		uploadImage,
	}
}
