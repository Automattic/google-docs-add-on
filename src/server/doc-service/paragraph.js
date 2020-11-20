import { blankAttributes } from './attributes';
import { changedTags } from './tags';
import { getCommentDelimitedContent } from './block';

export function Paragraph(DocumentApp, renderContainer) {
	function tagForParagraph(paragraph) {
		switch (paragraph.getHeading()) {
			case DocumentApp.ParagraphHeading.HEADING1:
			case DocumentApp.ParagraphHeading.TITLE:
				return 'h1';
			case DocumentApp.ParagraphHeading.HEADING2:
			case DocumentApp.ParagraphHeading.SUBTITLE:
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

	function classesForTag(paragraph) {
		switch (paragraph.getAlignment()) {
			// This is the default, right?
			// case DocumentApp.HorizontalAlignment.LEFT:
			// 	return 'has-text-align-left';
			case DocumentApp.HorizontalAlignment.CENTER:
				return 'has-text-align-center';
			case DocumentApp.HorizontalAlignment.RIGHT:
				return 'has-text-align-right';
			case DocumentApp.HorizontalAlignment.JUSTIFY:
				return 'has-text-align-justify';
			default:
				return;
		}
	}

	function googleAttributesToGutenberg(paragraph) {
		const attributes = {};
		switch (paragraph.getAlignment()) {
			// This is the default, right?
			// case DocumentApp.HorizontalAlignment.LEFT:
			// 	attributes.align = 'left';
			// 	break;
			case DocumentApp.HorizontalAlignment.CENTER:
				attributes.align = 'center';
				break;
			case DocumentApp.HorizontalAlignment.RIGHT:
				attributes.align = 'right';
				break;
			case DocumentApp.HorizontalAlignment.JUSTIFY:
				attributes.align = 'justify';
				break;
			default:
				break;
		}

		switch (paragraph.getHeading()) {
			case DocumentApp.ParagraphHeading.HEADING1:
			case DocumentApp.ParagraphHeading.TITLE:
				attributes.level = 1;
				break;
			case DocumentApp.ParagraphHeading.HEADING2:
			case DocumentApp.ParagraphHeading.SUBTITLE:
				attributes.level = 2;
				break;
			case DocumentApp.ParagraphHeading.HEADING3:
				attributes.level = 3;
				break;
			case DocumentApp.ParagraphHeading.HEADING4:
				attributes.level = 4;
				break;
			case DocumentApp.ParagraphHeading.HEADING5:
				attributes.level = 5;
				break;
			case DocumentApp.ParagraphHeading.HEADING6:
				attributes.level = 6;
				break;
		}

		return attributes;
	}

	function renderParagraph(paragraph, renderBlock = true) {
		const tag = tagForParagraph(paragraph),
			blockName = tag === 'p' ? 'core/paragraph' : 'core/heading',
			classes = classesForTag(paragraph),
			openTags = changedTags(paragraph.getAttributes(), blankAttributes),
			closedTags = changedTags(
				blankAttributes,
				paragraph.getAttributes()
			),
			contents = renderContainer(paragraph, false);

		const classAttr = classes ? ` class="${classes}"` : '';

		const content =
			`<${tag}${classAttr}>` +
			openTags +
			contents +
			closedTags +
			`</${tag}>`;
		return (
			(renderBlock
				? getCommentDelimitedContent(
						blockName,
						googleAttributesToGutenberg(paragraph),
						content
				  )
				: content) + '\n'
		);
	}

	return renderParagraph;
}
