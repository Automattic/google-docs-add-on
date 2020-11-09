import { blankAttributes } from './attributes';
import { changedTags } from './tags'

export const LIST_ELEMENT = 'A8c.List';
export class ListElement {
	constructor(parent) {
		this.items = [];
		this.parent = parent;
		this._id = Math.floor( (Math.random() * 100000) );
	}

	getType() {
		return LIST_ELEMENT;
	}

	addListItem(listItem) {
		let item = listItem;
		this.items.push(item);
	}
}

export function List(DocumentApp, renderContainer) {
	const tagForList = (listItem) => {
		switch (listItem.getGlyphType()) {
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

	const typeForList = (listItem) => {
		switch (listItem.getGlyphType()) {
			case DocumentApp.GlyphType.LATIN_UPPER:
				return ' type="A"';
			case DocumentApp.GlyphType.LATIN_LOWER:
				return ' type="a"';
			case DocumentApp.GlyphType.ROMAN_UPPER:
				return ' type="I"';
			case DocumentApp.GlyphType.ROMAN_LOWER:
				return ' type="i"';
			case DocumentApp.GlyphType.NUMBER:
			case DocumentApp.GlyphType.BULLET:
			default:
				return '';
		}
	}

	const renderList = (list) => {
		const openTag =
			'<' +
			tagForList(list.items[0]) +
			typeForList(list.items[0]) +
			'>\n';
		const body = list.items.map( renderListItem );
		const closeTag = '</' + tagForList(list.items[0]) + '>\n';

		return openTag + body.join('\n') + '\n' + closeTag;
	};

	function renderListItem( li ) {
		let output = '<li>';
		if ( li.getType() === LIST_ELEMENT ) {
			output += renderList( li );
		} else {
			const openTags = changedTags( li.getAttributes(), blankAttributes ),
			closedTags = changedTags( blankAttributes, li.getAttributes() );
			output += openTags + renderContainer( li ) + closedTags;
		}
		return output + '</li>';
	}

	return renderList;
}
