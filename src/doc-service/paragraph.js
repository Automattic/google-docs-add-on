import { blankAttributes } from './attributes';
import { changedTags } from './tags';

export default ( DocumentApp, renderContainer ) => {
	function tagForParagraph( paragraph ) {
		switch ( paragraph.getHeading() ) {
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

	function renderParagraph( paragraph ) {
		const tag = tagForParagraph( paragraph ),
			openTags = changedTags( paragraph.getAttributes(), blankAttributes ),
			closedTags = changedTags( blankAttributes, paragraph.getAttributes() ),
			contents = renderContainer( paragraph );
		return `<${ tag }>` + openTags + contents + closedTags + `</${ tag }>\n`
	}

	return renderParagraph;
}
