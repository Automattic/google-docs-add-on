import { quoteattr } from './tags'

export function InlineImage( imageLinker ) {
	return function renderInlineImage( image ) {
		const url = imageLinker( image );
		if ( !url ) {
			return '';
		}

		const imgWidth = image.getWidth()
		const imgHeight = image.getHeight()
		const title = ( image.getAltTitle && image.getAltTitle() )
			? quoteattr( image.getAltTitle() )
			: ''
		const alt = ( image.getAltDescription && image.getAltDescription() )
			? quoteattr( image.getAltDescription() )
			: ''

		return `<img src="${ url }" width="${ imgWidth }" height="${ imgHeight }" alt="${ alt }" title="${ title }">`
	}
}
