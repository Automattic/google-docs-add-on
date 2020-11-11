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
	const removeUselessParagraphs = (el) => {
		if (
			el.getType() === DocumentApp.ElementType.PARAGRAPH &&
			el.getNumChildren() == 1
		) {
			const child = el.getChild(0);
			if (child.getType() !== DocumentApp.ElementType.TEXT) {
				return child;
			}
		}

		return el;
	};

	/**
	 * We want to group list items into a pseudo-element called a List so that
	 * we can render it as a Gutenberg block. To do this, we pre-process the
	 * elements to put consecutive list elements into a list (or nested list) if
	 * the nesting level changes
	 */
	const groupListItems = (elements) => {
		const { LIST_ITEM } = DocumentApp.ElementType;
		const listItemsToList = new Map();
		const lists = new Map();

		return elements.reduce((processedElements, el) => {
			if (el.getType() !== LIST_ITEM) {
				return [...processedElements, el];
			}

			const listId = el.getListId();
			if ( lists.has( listId ) ) {
				lists.get( listId ).addListItem( el );
				return processedElements;
			}

			const list = new ListElement( listId );
			list.addListItem( el );
			lists.set( listId, list );
			return [...processedElements, list];
		}, []);
	};

	const renderPositionedImages = (container) =>
		container.getPositionedImages
			? container.getPositionedImages().map(renderImage)
			: [];

	/**
	 * renderContainer will render a container element like a paragraph or list
	 * item by rendering all of its children
	 */
	const renderContainer = (element, renderBlocks = true) => {
		const groupedChildren = groupListItems(
			childrenOf(element).map(removeUselessParagraphs)
		);
		return groupedChildren
			.map((el) => renderElement(el, renderBlocks))
			.concat(renderPositionedImages(element))
			.map(removeAutolinkedUrls)
			.join('');
	};

	const renderParagraph = Paragraph(DocumentApp, renderContainer);
	const renderTable = Table(renderContainer);
	const renderImage = InlineImage(imageLinker);
	const renderList = List(DocumentApp, renderContainer);
	const renderHorizontalRule = () => '<hr>';

	function renderElement(element, renderBlocks = true) {
		switch (element.getType()) {
			case DocumentApp.ElementType.PARAGRAPH:
				return renderParagraph(element, renderBlocks);
			case DocumentApp.ElementType.TEXT:
				return renderText(element, renderBlocks);
			case DocumentApp.ElementType.INLINE_IMAGE:
				return renderImage(element, renderBlocks);
			case DocumentApp.ElementType.LIST_ITEM:
				return renderListItem(element, renderBlocks);
			case DocumentApp.ElementType.TABLE:
				return renderTable(element, renderBlocks);
			case DocumentApp.ElementType.HORIZONTAL_RULE:
				return renderHorizontalRule(element, renderBlocks);
			case LIST_ELEMENT:
				return renderList(element, renderBlocks);
			default:
				return element.getType() + ': ' + element.getText();
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
