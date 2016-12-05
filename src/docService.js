/**
 * Return an object with the unique values from the second object
 */
function objectDiff( obj1, obj2 ) {
	return Object.keys( obj2 ).reduce( ( acc, key ) => {
		if ( obj1[ key ] !== obj2[ key ] ) {
			acc[ key ] = obj2[ key ];
		}
		return acc;
	}, {} )
}

/**
 * Convert an object diff into HTML tags
 *
 * @param diff object
 * @returns string
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

const range = ( n ) => {
	if ( ! n ) {
		return []
	}

	return Array.apply( null, Array( n ) ).map( ( _, i ) => i )
}

export default ( DocumentApp, imageLinker ) => {
	function renderText( text ) {
		if ( 'string' === typeof text ) {
			return text;
		}

		const attributeIndices = text.getTextAttributeIndices();
		const chunks = chunkTextByAttribute( text )

		let lastAttributes = text.getAttributes();

		return attributeIndices.reduce( ( markup, attrIdx, chunkIdx ) => {
			const attrs = text.getAttributes( attrIdx )
			const diff = objectDiff( lastAttributes, attrs )
			lastAttributes = attrs
			return markup + tagsForAttrDiff( diff ) + chunks[ chunkIdx ]
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

	function renderElement( element ) {
		switch ( element.getType() ) {
			case DocumentApp.ElementType.PARAGRAPH:
				return `<p>${ renderContainer( element ) }</p>\n`
			case DocumentApp.ElementType.TEXT:
				return renderText( element )
			case DocumentApp.ElementType.INLINE_IMAGE:
				return renderInlineImage( element )
			case DocumentApp.ElementType.LIST_ITEM:
				return renderListItem( element )
			default:
				return element.getType() + ': ' + element.toString()
		}
	}

	function renderContainer( element ) {
		const numOfChildren = element.getNumChildren();
		return range( numOfChildren )
			.map( i => element.getChild( i ) )
			.map( renderElement )
			.join( '' );
	}

	return renderContainer
}
