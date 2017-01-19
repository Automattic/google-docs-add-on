import { quoteattr } from './tags'

export function InlineImage( imageLinker ) {
	return function renderInlineImage( element ) {
		const url = imageLinker( element );
		if ( !url ) {
			return '';
		}

		const imgWidth = element.getWidth(),
			imgHeight = element.getHeight(),
			title = quoteattr( element.getAltTitle() ),
			alt = quoteattr( element.getAltDescription() );
		return `<img src="${ url }" width="${ imgWidth }" height="${ imgHeight }" alt="${ alt }" title="${ title }">`
	}
}