const contentTypeToExtension = {
	'image/png': 'png',
	'image/jpeg': 'jpeg',
	'image/jpg': 'jpg',
	'image/gif': 'gif' // pronounced "GIF"
}

/* globals Logger */

export function imageUploadLinker( uploadImage, imageCache ) {
	return ( image ) => {
		const cachedUrl = imageCache.get( image )
		if ( cachedUrl ) {
			return cachedUrl
		}

		const imageBlob = image.getBlob()
		if ( ! imageBlob.getName() ) {
			const contentType = imageBlob.getContentType()
			if ( contentTypeToExtension[ contentType ] ) {
				Logger.log( 'Setting name to overpass.' + contentTypeToExtension[ contentType ] )
				imageBlob.setName( 'overpass.' + contentTypeToExtension[ contentType ] );
			} else {
				Logger.log( 'No content type for ' + contentType );
			}
		} else {
			Logger.log( 'image has name ' + imageBlob.getBlob() )
		}

		const response = uploadImage( image );
		const url = response.media[ 0 ].URL;
		imageCache.set( image, url );
		return url
	}
}