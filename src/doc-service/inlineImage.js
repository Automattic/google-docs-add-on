export function InlineImage( imageLinker ) {
	return function renderInlineImage( element ) {
		const url = imageLinker( element );
		if ( ! url ) {
			return '';
		}

		const imgWidth = element.getWidth(),
		      imgHeight = element.getHeight(),
		      title = element.getAltTitle(), // TODO ESCAPE THESE
		      alt = element.getAltDescription(); // TODO ESCAPE THESE
		return `<img src="${ url }" width="${ imgWidth }" height="${ imgHeight }" alt="${ alt }" title="${ title }">`
	}
}