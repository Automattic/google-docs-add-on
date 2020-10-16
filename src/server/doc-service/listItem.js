import { blankAttributes } from './attributes';
import { changedTags } from './tags';

export function ListItem( DocumentApp, renderContainer ) {
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

	const nestedListTags = [];

	return function renderListItem( listItem ) {
		let rendered = '';

		const type = typeForList( listItem ),
			typeAttr = ( type ) ? ` type="${ type }"` : '';

		const prevSibling = listItem.getPreviousSibling();
		const previousIsListItem = ( prevSibling && prevSibling.getType() === DocumentApp.ElementType.LIST_ITEM );
		const previousIsLessNested = ( previousIsListItem && prevSibling.getNestingLevel() < listItem.getNestingLevel() );
		const previousIsMoreNested = ( previousIsListItem && prevSibling.getNestingLevel() > listItem.getNestingLevel() );

		// Open list tags
		if ( ! previousIsListItem ) {
			rendered += '<' + tagForList( listItem ) + typeAttr + '>\n'
		} else if ( previousIsLessNested ) {
			const tag = tagForList( listItem );
			rendered += '<' + tag + typeAttr + '>\n'
			nestedListTags.push( tag );
		}

		if ( previousIsMoreNested ) {
			let nestingLevel = prevSibling.getNestingLevel();
			const targetLevel = listItem.getNestingLevel();
			while ( nestingLevel > targetLevel ) {
				const tag = nestedListTags.pop();
				rendered += `</${ tag }>\n</li>\n`
				nestingLevel--;
			}
		}

		const openTags = changedTags( listItem.getAttributes(), blankAttributes ),
			closedTags = changedTags( blankAttributes, listItem.getAttributes() );

		rendered += `<li>${openTags}${ renderContainer( listItem ) }${closedTags}`

		const nextSibling = listItem.getNextSibling();
		const nextIsListItem = ( nextSibling && nextSibling.getType() === DocumentApp.ElementType.LIST_ITEM )
		const nextListItemIsNested = ( nextIsListItem && nextSibling.getNestingLevel() > listItem.getNestingLevel() );

		if ( ! nextIsListItem ) {
			let tag = tagForList( listItem );
			while ( tag ) {
				rendered += `</li>\n</${ tag }>\n`
				tag = nestedListTags.pop();
			}
		} else if ( ! nextListItemIsNested ) {
			rendered += '</li>\n'
		}

		return rendered;
	}
}
