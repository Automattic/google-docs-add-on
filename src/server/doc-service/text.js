import { changedTags } from './tags';

function chunkTextByAttribute( text ) {
	const asString = text.getText()
	const attributeIndices = text.getTextAttributeIndices();
	return attributeIndices.reduce( ( chunks, attrIdx, i ) => {
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
		const newTags = changedTags( attrs, lastAttributes )
		lastAttributes = attrs
		return markup + newTags + chunks[ chunkIdx ]
	}, '' )
}