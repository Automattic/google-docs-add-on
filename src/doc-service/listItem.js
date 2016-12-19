import { blankAttributes } from './attributes';
import { changedTags } from './tags';

export default ( DocumentApp, renderContainer ) => {
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

	return function renderListItem( element ) {
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
}
