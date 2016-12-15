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

const blankAttributes = {
	FONT_SIZE: null, // TODO
	ITALIC: null,
	STRIKETHROUGH: null,
	FOREGROUND_COLOR: null, // TODO
	BOLD: null,
	LINK_URL: null,
	UNDERLINE: null,
	FONT_FAMILY: null, // TODO
	BACKGROUND_COLOR: null // TODO
}

const simpleTagMap = {
	ITALIC: 'i',
	STRIKETHROUGH: 's',
	BOLD: 'b',
	UNDERLINE: 'u'
}

/**
 * Convert an object diff into HTML tags
 *
 * @param {object} diffParam An object with changed attributes (e.g. `{ BOLD: true }`)
 * @returns {string} HTML tags that open or close
 */
function tagsForAttrDiff( diffParam ) {
	const diff = Object.assign( {}, diffParam )
	let tags = '';

	if ( diff.LINK_URL ) {
		tags += `<a href="${ diff.LINK_URL }">`
		delete diff.UNDERLINE;
		delete diff.FOREGROUND_COLOR;
	}

	if ( diff.LINK_URL === null ) {
		tags += '</a>'
		delete diff.UNDERLINE;
		delete diff.FOREGROUND_COLOR;
	}

	for ( let prop in simpleTagMap ) {
		if ( diff[ prop ] ) {
			tags += '<' + simpleTagMap[ prop ] + '>';
		} else if ( diff[ prop ] === null ) {
			tags += '</' + simpleTagMap[ prop ] + '>';
		}
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

	function tagForList( listItem ) {
		switch ( listItem.getGlyphType() ) {
			case DocumentApp.GlyphType.NUMBER:
			case DocumentApp.GlyphType.LATIN_UPPER:
			case DocumentApp.GlyphType.LATIN_LOWER:
			case DocumentApp.GlyphType.ROMAN_UPPER:
			case DocumentApp.GlyphType.ROMAN_LOWER:
				return 'ol';
			case DocumentApp.GlyphType.BULLET:
			default:
				return 'ul';
		}
	}

	function typeForList( listItem ) {
		switch ( listItem.getGlyphType() ) {
			case DocumentApp.GlyphType.LATIN_UPPER:
				return 'A';
			case DocumentApp.GlyphType.LATIN_LOWER:
				return 'a';
			case DocumentApp.GlyphType.ROMAN_UPPER:
				return 'I';
			case DocumentApp.GlyphType.ROMAN_LOWER:
				return 'i';
			case DocumentApp.GlyphType.NUMBER:
			case DocumentApp.GlyphType.BULLET:
			default:
				return null;
		}
	}

	function renderListItem( element ) {
		let listItem = '',
		    typeAttr = '';

		const tag = tagForList( element ),
		      openTags = changedTags( element.getAttributes(), blankAttributes ),
		      closedTags = changedTags( blankAttributes, element.getAttributes() ),
		      type = typeForList( element ),
		      prevSibling = element.getPreviousSibling(),
		      nextSibling = element.getNextSibling();

		if ( type ) {
			typeAttr = ` type="${ type }"`
		}

		if ( ! prevSibling || prevSibling.getType() !== DocumentApp.ElementType.LIST_ITEM ) {
			listItem += '<' + tag + typeAttr + '>\n'
		}
		listItem += `<li>${openTags}${ renderContainer( element ) }${closedTags}</li>\n`
		if ( ! nextSibling || nextSibling.getType() !== DocumentApp.ElementType.LIST_ITEM ) {
			listItem += '</' + tag + '>\n'
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

	function tagForParagraph( paragraph ) {
		switch ( paragraph.getHeading() ) {
			case DocumentApp.ParagraphHeading.HEADING1:
				return 'h1';
			case DocumentApp.ParagraphHeading.HEADING2:
				return 'h2';
			case DocumentApp.ParagraphHeading.HEADING3:
				return 'h3';
			case DocumentApp.ParagraphHeading.HEADING4:
				return 'h4';
			case DocumentApp.ParagraphHeading.HEADING5:
				return 'h5';
			case DocumentApp.ParagraphHeading.HEADING6:
				return 'h6';
			case DocumentApp.ParagraphHeading.NORMAL:
			default:
				return 'p';
		}
	}

	function renderParagraph( paragraph ) {
		const tag = tagForParagraph( paragraph ),
		      openTags = changedTags( paragraph.getAttributes(), blankAttributes ),
		      closedTags = changedTags( blankAttributes, paragraph.getAttributes() ),
		      contents = renderContainer( paragraph );
		return `<${ tag }>` + openTags + contents + closedTags + `</${ tag }>\n`
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
