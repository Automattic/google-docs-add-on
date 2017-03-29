import { blankAttributes } from './attributes';
import { changedTags } from './tags';

export function Paragraph( DocumentApp, renderContainer ) {
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

	function stylesForTag( paragraph ) {
		const styles = {}
		const alignment = paragraph.getAlignment();

		switch ( alignment ) {
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

	function renderStyles( styles ) {
		const cssReducer = ( css, prop ) => css + `${prop}: ${styles[prop]};`;
		return Object.keys( styles ).reduce( cssReducer, '' )
	}

	function renderParagraph( paragraph ) {
		const tag = tagForParagraph( paragraph ),
			styles = renderStyles( stylesForTag( paragraph ) ),
			openTags = changedTags( paragraph.getAttributes(), blankAttributes ),
			closedTags = changedTags( blankAttributes, paragraph.getAttributes() ),
			contents = renderContainer( paragraph );

		let styleAttr = '';
		if ( styles ) {
			styleAttr = ` style="${styles}"`
		}
		return `<${ tag }${styleAttr}>` + openTags + contents + closedTags + `</${ tag }>\n`
	}

	return renderParagraph;
}
