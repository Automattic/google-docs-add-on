import { Paragraph } from './paragraph';
import { Table } from './table';
import { InlineImage } from './inlineImage';
import { List, LIST_ELEMENT, ListElement } from './list';
import { renderText } from './text';

// http://stackoverflow.com/a/10050831
const range = (size) => [...Array(size).keys()];

const childrenOf = (element) =>
	range(element.getNumChildren()).map((i) => element.getChild(i));

export function DocService(DocumentApp, imageLinker) {
	/**
	 * We want to group list items into a pseudo-element called a List so that
	 * we can render it as a Gutenberg block. To do this, we pre-process the
	 * elements to put consecutive list elements into a list (or nested list) if
	 * the nesting level changes
	 */
	function groupListItems(elements) {
		const { LIST_ITEM } = DocumentApp.ElementType;
		const listItemsToList = new Map();

		return elements.reduce((processedElements, el) => {
			const type = el.getType();
			if (type !== LIST_ITEM) {
				return [...processedElements, el];
			}

			const prevSibling = el.getPreviousSibling();
			const previousIsListItem =
				prevSibling && prevSibling.getType() === LIST_ITEM;

			let list,
				returnValue = [...processedElements];

			if (previousIsListItem) {
				const previousNestingWasShallower =
					prevSibling.getNestingLevel() < el.getNestingLevel();
				const previousNestingWasDeeper =
					prevSibling.getNestingLevel() > el.getNestingLevel();

				const previousListContainer = listItemsToList.get(prevSibling);

				if (previousNestingWasDeeper) {
					// no this won't work because if there are 3 nesting levels this will only get the top one, need a while loop
					list = previousListContainer.parent;
				} else if (previousNestingWasShallower) {
					list = new ListElement(previousListContainer);
					previousListContainer.addListItem(list);
				} else {
					list = previousListContainer;
				}
			} else {
				list = new ListElement();
				returnValue = [...processedElements, list];
			}

			list.addListItem(el);
			listItemsToList.set(el, list);

			return returnValue;
		}, []);
	}

	const renderPositionedImages = (container) =>
		container.getPositionedImages
			? container.getPositionedImages().map(renderImage)
			: [];

	/**
	 * renderContainer will render a container element like a paragraph or list
	 * item by rendering all of its children
	 */
	const renderContainer = (element) => {
		const groupedChildren = groupListItems(childrenOf(element));
		return groupedChildren
			.map(renderElement)
			.concat(renderPositionedImages(element))
			.map(removeAutolinkedUrls)
			.join('');
	};

	const renderParagraph = Paragraph(DocumentApp, renderContainer);
	const renderTable = Table(renderContainer);
	const renderImage = InlineImage(imageLinker);
	const renderList = List(DocumentApp, renderContainer);
	const renderHorizontalRule = () => '<hr>';

	function renderElement(element) {
		switch (element.getType()) {
			case DocumentApp.ElementType.PARAGRAPH:
				return renderParagraph(element);
			case DocumentApp.ElementType.TEXT:
				return renderText(element);
			case DocumentApp.ElementType.INLINE_IMAGE:
				return renderImage(element);
			case DocumentApp.ElementType.LIST_ITEM:
				return renderListItem(element);
			case DocumentApp.ElementType.TABLE:
				return renderTable(element);
			case DocumentApp.ElementType.HORIZONTAL_RULE:
				return renderHorizontalRule(element);
			case LIST_ELEMENT:
				return renderList(element);
			default:
				return element.getType() + ': ' + element.toString();
		}
	}

	/**
	 * Remove auto-linked URLs from markup
	 *
	 * Google Docs links URLs it sees. Which is helpful, WordPress does it too.
	 * But it also interferes with oEmbeds, which is not helpful. So we identify
	 * those auto-linked URLs and send them to WordPress as text.
	 *
	 * @param {string} markup Generated HTML
	 * @return {string} markup without a tags around auto-linked URLs
	 */
	function removeAutolinkedUrls(markup) {
		if (!markup || !markup.replace) {
			return markup;
		}

		// http://stackoverflow.com/a/1732454
		return markup.replace(/<a href="([^"]+)">\1<\/a>/g, '$1');
	}

	return renderContainer;
}
