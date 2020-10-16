import { Paragraph } from './paragraph';
import { Table } from './table';
import { InlineImage } from './inlineImage';
import { ListItem } from './listItem'
import { renderText } from './text';

// http://stackoverflow.com/a/10050831
const range = ( n ) => {
	if ( ! n ) {
		return []
	}

	return Array.apply( null, Array( n ) ).map( ( _, i ) => i )
}

export function DocService( DocumentApp, imageLinker ) {
	const childrenOf = ( element ) => range( element.getNumChildren() ).map( i => element.getChild( i ) )

	const renderContainer = ( element ) => childrenOf( element )
		.map( renderElement )
		.concat( renderPositionedImages( element ) )
		.map( removeAutolinkedUrls )
		.join( '' )

	const renderParagraph = Paragraph( DocumentApp, renderContainer );
	const renderTable = Table( renderContainer );
	const renderImage = InlineImage( imageLinker );
	const renderListItem = ListItem( DocumentApp, renderContainer );
	const renderHorizontalRule = () => '<hr>';

	function renderElement( element ) {
		switch ( element.getType() ) {
			case DocumentApp.ElementType.PARAGRAPH:
				return renderParagraph( element )
			case DocumentApp.ElementType.TEXT:
				return renderText( element )
			case DocumentApp.ElementType.INLINE_IMAGE:
				return renderImage( element )
			case DocumentApp.ElementType.LIST_ITEM:
				return renderListItem( element )
			case DocumentApp.ElementType.TABLE:
				return renderTable( element )
			case DocumentApp.ElementType.HORIZONTAL_RULE:
				return renderHorizontalRule( element )
			default:
				return element.getType() + ': ' + element.toString()
		}
	}

	function renderPositionedImages( container ) {
		if ( ! container.getPositionedImages ) {
			return [];
		}

		return container.getPositionedImages().map( renderImage )
	}

	/**
	 * Remove auto-linked URLs from markup
	 *
	 * Google Docs links URLs it sees. Which is helpful, WordPress does it too.
	 * But it also interferes with oEmbeds, which is not helpful. So we identify
	 * those auto-linked URLs and send them to WordPress as text.
	 *
	 * @param {string} markup Generated HTML
	 * @return {string} markup without a tags around auto-linked URLs
	 */
	function removeAutolinkedUrls( markup ) {
		if ( ! markup || ! markup.replace ) {
			return markup
		}

		// http://stackoverflow.com/a/1732454
		return markup.replace( /<a href="([^"]+)">\1<\/a>/g, '$1' )
	}

	return renderContainer
}
