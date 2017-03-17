import { quoteattr } from './tags'

export function InlineImage( imageLinker ) {
	return function renderInlineImage( image ) {
		const url = imageLinker( image );
		if ( !url ) {
			return '';
		}

		const imgWidth = image.getWidth(),
		      imgHeight = image.getHeight();

		let title = '',
		    alt = '';

		if ( image.getAltTitle ) {
			title = quoteattr( image.getAltTitle() )
		}

		if ( image.getAltDescription ) {
			alt = quoteattr( image.getAltDescription() )
		}

		return `<img src="${ url }" width="${ imgWidth }" height="${ imgHeight }" alt="${ alt }" title="${ title }">`
	}
}
