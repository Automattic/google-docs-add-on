const DOCUMENT_PROPERTY = 'imageUrlCache'

export function imageUploadLinker( wpClient, docProps, Utilities ) {
	const imageUrlCache = docProps.getProperty( DOCUMENT_PROPERTY ) || {}

	return ( image ) => {
		const imageBlob = image.getBlob();
		const md5 = Utilities.computeDigest( Utilities.DigestAlgorithm.MD5, imageBlob.getBytes() )
		if ( imageUrlCache[ md5 ] ) {
			return imageUrlCache[ md5 ]
		}

		const response = wpClient.uploadImage( image );
		const url = response.media[ 0 ].URL;
		imageUrlCache[ md5 ] = url;
		docProps.setProperty( DOCUMENT_PROPERTY, imageUrlCache )
		return url
	}
}