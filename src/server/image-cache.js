export function ImageCache( site, docProps, hasher ) {

	function pathForImage( image ) {
		const { blog_id } = site
		const imageHash = hasher( image.getBlob().getBytes() )
		return 'image:' + blog_id + ':' + imageHash
	}

	const get = ( image ) => docProps.getProperty( pathForImage( image ) )

	const set = ( image, url ) => docProps.setProperty( pathForImage( image ), url )

	return { get, set }
}
