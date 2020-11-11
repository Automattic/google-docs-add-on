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

	function levelForHeading(heading) {
		switch (heading.getHeading()) {
			case DocumentApp.ParagraphHeading.HEADING1:
			case DocumentApp.ParagraphHeading.TITLE:
				return 1;
			case DocumentApp.ParagraphHeading.HEADING2:
			case DocumentApp.ParagraphHeading.SUBTITLE:
				return 2;
			case DocumentApp.ParagraphHeading.HEADING3:
				return 3;
			case DocumentApp.ParagraphHeading.HEADING4:
				return 4;
			case DocumentApp.ParagraphHeading.HEADING5:
				return 5;
			case DocumentApp.ParagraphHeading.HEADING6:
				return 6;
			case DocumentApp.ParagraphHeading.NORMAL:
			default:
				return undefined;
		}
	}

	function stylesForTag(paragraph) {
		const styles = {};
		const alignment = paragraph.getAlignment();

		switch (alignment) {
			case DocumentApp.HorizontalAlignment.CENTER:
				styles['text-align'] = 'center';
				break;
			case DocumentApp.HorizontalAlignment.RIGHT:
				styles['text-align'] = 'right';
				break;
			case DocumentApp.HorizontalAlignment.JUSTIFY:
				styles['text-align'] = 'justify';
				break;
		}
		return styles;
	}

	function renderStyles(styles) {
		const cssReducer = (css, prop) => css + `${prop}: ${styles[prop]};`;
		return Object.keys(styles).reduce(cssReducer, '');
	}

	function renderParagraph(paragraph, renderBlock = true) {
		const tag = tagForParagraph(paragraph),
			blockName = tag === 'p' ? 'core/paragraph' : 'core/heading',
			attributes = {},
			styles = renderStyles(stylesForTag(paragraph)),
			openTags = changedTags(paragraph.getAttributes(), blankAttributes),
			closedTags = changedTags(
				blankAttributes,
				paragraph.getAttributes()
			),
			contents = renderContainer(paragraph, false);

		let styleAttr = '';
		if (styles) {
			styleAttr = ` style="${styles}"`;
		}

		if (tag !== 'p') {
			attributes.level = levelForHeading(paragraph);
		}
		const content =
			`<${tag}${styleAttr}>` +
			openTags +
			contents +
			closedTags +
			`</${tag}>`;
		return (renderBlock ? getCommentDelimitedContent(blockName, attributes, content) : content) + '\n';
	}

	return renderParagraph;
}
