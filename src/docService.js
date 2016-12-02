/* globals DriveApp, DocumentApp, UrlFetchApp, ScriptApp */

// HACK HACK HACK but it's either this or write a custom HTML generator?
export function exportAsHtml() {
	DriveApp.getStorageUsed(); //needed to get Drive Scope requested
	const docID = DocumentApp.getActiveDocument().getId();
	const url = `https://docs.google.com/feeds/download/documents/export/Export?id=${ docID }&exportFormat=html`;
	const param = {
		method: 'get',
		headers: { Authorization: `Bearer ${ ScriptApp.getOAuthToken() }` },
		muteHttpExceptions: true,
	};
	return UrlFetchApp.fetch( url, param ).getContentText();
}

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
		if ( ! chunks ) console.log( arguments )
		const nextIdx = attributeIndices[ i + 1 ] || undefined;
		chunks.push( asString.substring( attrIdx, nextIdx ) )
		return chunks;
	}, [] )
}

export function renderText( text ) {
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

const childToHtml = ( element ) => {
	switch ( element.getType() ) {
		case DocumentApp.ElementType.PARAGRAPH:
			return `<p>${ childrenToHtml( element ) }</p>\n`
		case DocumentApp.ElementType.TEXT:
			return renderText( element )
		case DocumentApp.ElementType.INLINE_IMAGE:
			const imgWidth = element.getWidth(), imgHeight = element.getHeight()
			return `<img src="//placekitten.com/${ imgWidth }/${ imgHeight }" width="${ imgWidth }" height="${ imgHeight }">`
		case DocumentApp.ElementType.LIST_ITEM:
			let listItem = '';
			if ( element.getPreviousSibling().getType() !== DocumentApp.ElementType.LIST_ITEM ) {
				listItem += '<ul>\n'
			}
			listItem += `<li>${ childrenToHtml( element ) }</li>\n`
			if ( element.getNextSibling().getType() !== DocumentApp.ElementType.LIST_ITEM ) {
				listItem += '</ul>\n'
			}
			return listItem;
		default:
			return element.getType() + ': ' + element.toString()
	}
}

const range = ( n ) => {
	if ( ! n ) {
		return []
	}

	return Array.apply( null, Array( n ) ).map( ( _, i ) => i )
}

export function childrenToHtml( element ) {
	const numOfChildren = element.getNumChildren();
	return range( numOfChildren )
		.map( i => element.getChild( i ) )
		.map( childToHtml )
		.join( '' );
}
