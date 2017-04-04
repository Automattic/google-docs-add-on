/* globals Utilities */

const API_BASE = 'https://public-api.wordpress.com/rest/v1.1';
const CRLF = '\r\n';
const DEFAULT_FILENAME = 'image';

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

	function postToWordPress( site, postIdParam, postContentParams = {} ) {
		const postId = postIdParam || 'new';
		const { blog_id, access_token } = site;
		const path = `/sites/${ blog_id }/posts/${ postId }`
		const payload = Object.assign( {}, postContentParams, { status: 'draft' } )
		DocumentApp.getUi().alert( JSON.stringify( payload ) )

		const response = post( access_token, path, { payload } );

		return response
	}

	function getPostStatus( site, postId ) {
		const { blog_id, access_token } = site;
		const path = `/sites/${ blog_id }/posts/${ postId }`

		const response = get( access_token, path );

		return response;
	}

	/**
	 * @param {Site} site { blog_id, access_token }
	 * @param {Blob} image a Google InlineImage
	 * @param {Number} parentId blog post id to attach to
	 * @return {object} response
	 */
	function uploadImage( site, image, parentId = 0 ) {
		const { blog_id, access_token } = site;
		const path = `/sites/${ blog_id }/media/new`
		const imageBlob = image.getBlob()

		if ( ! imageBlob.getName() && image.getAltDescription ) {
			imageBlob.setName( image.getAltDescription() );
		}
		const boundary = '-----CUTHEREelH7faHNSXWNi72OTh08zH29D28Zhr3Rif3oupOaDrj'

		const options = {
			method: 'post',
			contentType: `multipart/form-data; boundary=${ boundary }`,
			payload: makeMultipartBody( { 'media[0]': imageBlob, 'attrs[0][parent_id]': parentId }, boundary )
		}

		const response = post( access_token, path, options )

		return response
	}

	function getSiteInfo( site ) {
		const { blog_id, access_token } = site;
		return get( access_token, `/sites/${ blog_id }` )
	}

	function getPostTypes( site ) {
		const { blog_id, access_token } = site;
		const response = get( access_token, `/sites/${ blog_id }/post-types` )
		if ( response.post_types ) {
			return response.post_types;
		} else {
			return []
		}
	}

	function getCategories( site ) {
		const { blog_id, access_token } = site;
		const response = get( access_token, `/sites/${ blog_id }/categories` )
		if ( response.categories ) {
			return response.categories;
		} else {
			return []
		}
	}

	return {
		postToWordPress,
		getSiteInfo,
		uploadImage,
		getPostStatus,
		getPostTypes,
		getCategories
	}
}
