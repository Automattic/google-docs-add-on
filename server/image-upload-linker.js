const contentTypeToExtension = {
	'image/png': 'png',
	'image/jpeg': 'jpeg',
	'image/jpg': 'jpg',
	'image/gif': 'gif' // pronounced "GIF"
}

/* globals Logger, DocumentApp */

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
				Logger.log( 'Setting name to image.' + contentTypeToExtension[ contentType ] )
				imageBlob.setName( 'image.' + contentTypeToExtension[ contentType ] );
			} else {
				Logger.log( 'No content type for ' + contentType );
			}
		} else {
			Logger.log( 'image has name ' + imageBlob.getBlob() )
		}

		try {
			const response = uploadImage( image );
			const url = response.media[ 0 ].URL;
			imageCache.set( image, url );
			return url
		} catch ( e ) {
			DocumentApp.getUi().alert( JSON.stringify( e ) )
			Logger.log( e )
			return;
		}
	}
}
