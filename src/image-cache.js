export function ImageCache( site, docProps, hasher ) {

	function get( image ) {
		const { blog_id } = site
		const imageHash = hasher( image.getBlob().getBytes() )

		return docProps.getProperty( 'image:' + blog_id + ':' + imageHash )
	}

	return { get }
}
