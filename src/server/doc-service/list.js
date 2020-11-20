import { blankAttributes } from './attributes';
import { changedTags } from './tags';
import { getCommentDelimitedContent } from './block';

export const LIST_ELEMENT = 'A8c.List';
export class ListElement {
	constructor(parent) {
		this.items = [];
		this.parent = parent;
		this._id = Math.floor(Math.random() * 100000);
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
	};

	function typeForList(listItem) {
		switch (listItem.getGlyphType()) {
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

	const renderList = (list, renderBlock = true) => {
		const nestedListTags = [];
		const content = list.items
			.map((li) => renderListItem(li, nestedListTags))
			.join('');

		return renderBlock
			? getCommentDelimitedContent('core/list', {}, content)
			: content;
	};

	function renderListItem(listItem, nestedListTags) {
		let rendered = '';

		const type = typeForList(listItem),
			typeAttr = type ? ` type="${type}"` : '';

		const prevSibling = listItem.getPreviousSibling();
		const previousIsListItem =
			prevSibling &&
			prevSibling.getType() === DocumentApp.ElementType.LIST_ITEM;
		const previousIsLessNested =
			previousIsListItem &&
			prevSibling.getNestingLevel() < listItem.getNestingLevel();
		const previousIsMoreNested =
			previousIsListItem &&
			prevSibling.getNestingLevel() > listItem.getNestingLevel();

		// Open list tags
		if (!previousIsListItem) {
			rendered += '<' + tagForList(listItem) + typeAttr + '>\n';
		} else if (previousIsLessNested) {
			const tag = tagForList(listItem);
			rendered += '<' + tag + typeAttr + '>\n';
			nestedListTags.push(tag);
		}

		if (previousIsMoreNested) {
			let nestingLevel = prevSibling.getNestingLevel();
			const targetLevel = listItem.getNestingLevel();
			while (nestingLevel > targetLevel) {
				const tag = nestedListTags.pop();
				rendered += `</${tag}>\n</li>\n`;
				nestingLevel--;
			}
		}

		const openTags = changedTags(listItem.getAttributes(), blankAttributes),
			closedTags = changedTags(blankAttributes, listItem.getAttributes());

		rendered += `<li>${openTags}${renderContainer(listItem)}${closedTags}`;

		const nextSibling = listItem.getNextSibling();
		const nextIsListItem =
			nextSibling &&
			nextSibling.getType() === DocumentApp.ElementType.LIST_ITEM;
		const nextListItemIsNested =
			nextIsListItem &&
			nextSibling.getNestingLevel() > listItem.getNestingLevel();

		if (!nextIsListItem) {
			let tag = tagForList(listItem);
			while (tag) {
				rendered += `</li>\n</${tag}>\n`;
				tag = nestedListTags.pop();
			}
		} else if (!nextListItemIsNested) {
			rendered += '</li>\n';
		}

		return rendered;
	}

	return renderList;
}
