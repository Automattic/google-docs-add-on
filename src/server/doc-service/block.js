const { isEmpty, startsWith } = require( 'lodash' );

/**
 * Returns attributes which are to be saved and serialized into the block
 * comment delimiter.
 *
 * When a block exists in memory it contains as its attributes both those
 * parsed the block comment delimiter _and_ those which matched from the
 * contents of the block.
 *
 * This function returns only those attributes which are needed to persist and
 * which cannot be matched from the block content.
 *
 * @param {Object<string,*>} blockType     Block type.
 * @param {Object<string,*>} attributes Attributes from in-memory block data.
 *
 * @return {Object<string,*>} Subset of attributes for comment serialization.
 */
function getCommentAttributes( blockType, attributes ) {
	return reduce( blockType.attributes, ( result, attributeSchema, key ) => {
		const value = attributes[ key ];

		// Ignore undefined values.
		if ( undefined === value ) {
			return result;
		}

		// Ignore all attributes but the ones with an "undefined" source
		// "undefined" source refers to attributes saved in the block comment.
		if ( attributeSchema.source !== undefined ) {
			return result;
		}

		// Ignore default value.
		if ( 'default' in attributeSchema && attributeSchema.default === value ) {
			return result;
		}

		// Otherwise, include in comment set.
		result[ key ] = value;
		return result;
	}, {} );
}

/**
 * Given an attributes object, returns a string in the serialized attributes
 * format prepared for post content.
 *
 * @param {Object} attributes Attributes object.
 *
 * @return {string} Serialized attributes.
 */
function serializeAttributes( attributes ) {
	return JSON.stringify( attributes )
		// Don't break HTML comments.
		.replace( /--/g, '\\u002d\\u002d' )

		// Don't break non-standard-compliant tools.
		.replace( /</g, '\\u003c' )
		.replace( />/g, '\\u003e' )
		.replace( /&/g, '\\u0026' )

		// Bypass server stripslashes behavior which would unescape stringify's
		// escaping of quotation mark.
		//
		// See: https://developer.wordpress.org/reference/functions/wp_kses_stripslashes/
		.replace( /\\"/g, '\\u0022' );
}

/**
 * Given a block object, returns the Block's Inner HTML markup.
 *
 * @param {Object} block Block instance.
 *
 * @return {string} HTML.
 */
function getBlockContent( block ) {
	// @todo why not getBlockInnerHtml?

	// If block was parsed as invalid or encounters an error while generating
	// save content, use original content instead to avoid content loss. If a
	// block contains nested content, exempt it from this condition because we
	// otherwise have no access to its original content and content loss would
	// still occur.
	let saveContent = block.originalContent;
	if ( block.isValid || block.innerBlocks.length ) {
		try {
			saveContent = getSaveContent( block.name, block.attributes, block.innerBlocks );
		} catch ( error ) {}
	}

	return saveContent;
}

/**
 * Returns the content of a block, including comment delimiters.
 *
 * @param {string} rawBlockName Block name.
 * @param {Object} attributes   Block attributes.
 * @param {string} content      Block save content.
 *
 * @return {string} Comment-delimited block content.
 */
export function getCommentDelimitedContent( rawBlockName, attributes, content ) {
	const serializedAttributes = ! isEmpty( attributes ) ?
		serializeAttributes( attributes ) + ' ' :
		'';

	// Strip core blocks of their namespace prefix.
	const blockName = startsWith( rawBlockName, 'core/' ) ?
		rawBlockName.slice( 5 ) :
		rawBlockName;

	// @todo make the `wp:` prefix potentially configurable.

	if ( ! content ) {
		return `<!-- wp:${ blockName } ${ serializedAttributes }/-->`;
	}

	return (
		`<!-- wp:${ blockName } ${ serializedAttributes }-->\n` +
		content +
		`\n<!-- /wp:${ blockName } -->`
	);
}