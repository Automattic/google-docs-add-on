/**
 * Return an object with the unique values from the second object
 */
function objectDiff( obj1, obj2 ) {
	if ( ! obj1 || ! obj2 ) {
		return {}
	}
	return Object.keys( obj2 ).reduce( ( acc, key ) => {
		if ( obj1[ key ] !== obj2[ key ] ) {
			acc[ key ] = obj2[ key ];
		}
		return acc;
	}, {} )
}

const blankAttributes = Object.freeze( {
	FONT_SIZE: null, // TODO
	ITALIC: null, // TODO
	STRIKETHROUGH: null, // TODO
	FOREGROUND_COLOR: null, // TODO
	BOLD: null,
	LINK_URL: null,
	UNDERLINE: null, // TODO
	FONT_FAMILY: null, // TODO
	BACKGROUND_COLOR: null // TODO
} )

/**
 * Convert an object diff into HTML tags
 *
 * @param {object} diff An object with changed attributes (e.g. `{ BOLD: true }`)
 * @returns {string} HTML tags that open or close
 */
function tagsForAttrDiff( diff ) {
	let tags = '';

	if ( diff.LINK_URL ) {
		tags += `<a href="${ diff.LINK_URL }">`
	}

	if ( diff.LINK_URL === null ) {
		tags += '</a>'
	}

	if ( diff.BOLD === true ) {
		tags += '<b>'
	}

	if ( diff.BOLD === null ) {
		tags += '</b>'
	}

	return tags
}

function chunkTextByAttribute( text ) {
	const asString = text.getText()
	const attributeIndices = text.getTextAttributeIndices();
	return attributeIndices.reduce( ( chunks, attrIdx, i ) => {
		const nextIdx = attributeIndices[ i + 1 ] || undefined;
		chunks.push( asString.substring( attrIdx, nextIdx ) )
		return chunks;
	}, [] )
}

// http://stackoverflow.com/a/10050831
const range = ( n ) => {
	if ( ! n ) {
		return []
	}

	return Array.apply( null, Array( n ) ).map( ( _, i ) => i )
}

const changedTags = ( elAttributes, prevAttributes ) => tagsForAttrDiff( objectDiff( prevAttributes, elAttributes ) )

export function docServiceFactory( DocumentApp, imageLinker ) {
	function renderText( text ) {
		if ( 'string' === typeof text ) {
			return text;
		}

		const attributeIndices = text.getTextAttributeIndices();
		const chunks = chunkTextByAttribute( text )

		let lastAttributes = text.getAttributes();

		return attributeIndices.reduce( ( markup, attrIdx, chunkIdx ) => {
			const attrs = text.getAttributes( attrIdx )
			const newTags = changedTags( attrs, lastAttributes )
			lastAttributes = attrs
			return markup + newTags + chunks[ chunkIdx ]
		}, '' )
	}

	function renderListItem( element ) {
		let listItem = ''
		const prevSibling = element.getPreviousSibling(),
			nextSibling = element.getNextSibling();

		if ( ! prevSibling || prevSibling.getType() !== DocumentApp.ElementType.LIST_ITEM ) {
			listItem += '<ul>\n'
		}
		listItem += `<li>${ renderContainer( element ) }</li>\n`
		if ( ! nextSibling || nextSibling.getType() !== DocumentApp.ElementType.LIST_ITEM ) {
			listItem += '</ul>\n'
		}
		return listItem;
	}

	function renderInlineImage( element ) {
		const url = imageLinker( element ),
		      imgWidth = element.getWidth(),
		      imgHeight = element.getHeight(),
		      title = element.getAltTitle(), // TODO ESCAPE THESE
		      alt = element.getAltDescription(); // TODO ESCAPE THESE
		return `<img src="${ url }" width="${ imgWidth }" height="${ imgHeight }" alt="${ alt }" title="${ title }">`
	}

	function renderTableRow( row ) {
		let tRow = '<tr>';
		const numCells = row.getNumCells();
		for ( let i = 0; i < numCells; i++ ) {
			tRow += '<td>'
			     + renderContainer( row.getCell( i ) )
			     + '</td>';
		}
		return tRow + '</tr>'
	}

	function renderTable( table ) {
		const numRows = table.getNumRows();
		let tBody = '<table><tbody>'
		for ( let i = 0; i < numRows; i++ ) {
			tBody += renderTableRow( table.getRow( i ) )
		}
		return tBody + '</tbody></table>'
	}

	function renderParagraph( paragraph ) {
		const openTags = changedTags( paragraph.getAttributes(), blankAttributes ),
		      closedTags = changedTags( blankAttributes, paragraph.getAttributes() ),
			  contents = renderContainer( paragraph );
		return '<p>' + openTags + contents + closedTags + '</p>\n'
	}

	function renderElement( element ) {
		switch ( element.getType() ) {
			case DocumentApp.ElementType.PARAGRAPH:
				return renderParagraph( element )
			case DocumentApp.ElementType.TEXT:
				return renderText( element )
			case DocumentApp.ElementType.INLINE_IMAGE:
				return renderInlineImage( element )
			case DocumentApp.ElementType.LIST_ITEM:
				return renderListItem( element )
			case DocumentApp.ElementType.TABLE:
				return renderTable( element )
			default:
				return element.getType() + ': ' + element.toString()
		}
	}

	function renderContainer( element ) {
		const numOfChildren = element.getNumChildren();
		const contents = range( numOfChildren )
			.map( i => element.getChild( i ) )
			.map( renderElement )
			.join( '' );

		return contents;
	}

	return renderContainer
}
