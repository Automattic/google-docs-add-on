import { quoteattr } from './tags'
import { getCommentDelimitedContent } from './block';

export function InlineImage( imageLinker, renderBlock = true ) {
	return function renderInlineImage( image ) {
		const url = imageLinker( image );
		if ( !url ) {
			return '';
		}

		const width = image.getWidth()
		const height = image.getHeight()
		const title = ( image.getAltTitle && image.getAltTitle() )
			? quoteattr( image.getAltTitle() )
			: ''
		const alt = ( image.getAltDescription && image.getAltDescription() )
			? quoteattr( image.getAltDescription() )
			: ''

		const content = `<figure><img src="${ url }" width="${ width }" height="${ height }" alt="${ alt }" title="${ title }"></figure>`;
		if ( renderBlock ) {
			const attributes = {
				url,
				alt,
				width,
				height
			}
			return getCommentDelimitedContent( 'core/image', attributes, content ) + '\n';
		}

		return content;
	}
}
