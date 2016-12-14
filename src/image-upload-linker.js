const DOCUMENT_PROPERTY = 'imageUrlCache'

const contentTypeToExtension = {
	'image/png': 'png',
	'image/jpeg': 'jpeg',
	'image/jpg': 'jpg',
	'image/gif': 'gif' // pronounced "GIF"
}

export function imageUploadLinker( wpClient, docProps, Utilities ) {
	const imageUrlCache = JSON.parse( docProps.getProperty( DOCUMENT_PROPERTY ) ) || {}

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

	const linker = ( image ) => {
		const imageBlob = image.getBlob();
		const hash = md5( imageBlob.getBytes() )
		if ( imageUrlCache[ hash ] ) {
			return imageUrlCache[ hash ]
		}

		if ( ! imageBlob.getName() ) {
			const contentType = imageBlob.getContentType()
			if ( contentTypeToExtension[ contentType ] ) {
				Logger.log( 'Setting name to ' + hash + '.' + contentTypeToExtension[ contentType ] )
				imageBlob.setName( hash + '.' + contentTypeToExtension[ contentType ] );
			} else {
				Logger.log( 'No content type for ' + contentType );
			}
		} else {
			Logger.log( 'image has name ' + imageBlob.getBlob() )
		}

		const response = wpClient.uploadImage( image );
		const url = response.media[ 0 ].URL;
		imageUrlCache[ hash ] = url;
		docProps.setProperty( DOCUMENT_PROPERTY, JSON.stringify( imageUrlCache ) )
		return url
	}

	linker.cache = imageUrlCache;
	return linker
}