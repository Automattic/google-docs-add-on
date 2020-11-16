import { expect } from 'chai';
import td from 'testdouble';
import { DocService } from '../src/server/doc-service';

const noop = () => {};

const DocumentApp = {
	ElementType: {
		PARAGRAPH: 'PARAGRAPH',
		TEXT: 'TEXT',
		INLINE_IMAGE: 'INLINE_IMAGE',
		LIST_ITEM: 'LIST_ITEM',
		TABLE: 'TABLE',
		TABLE_ROW: 'TABLE_ROW',
		TABLE_CELL: 'TABLE_CELL',
		HORIZONTAL_RULE: 'HORIZONTAL_RULE',
	},
	ParagraphHeading: {
		HEADING1: 'HEADING1',
		HEADING2: 'HEADING2',
		HEADING3: 'HEADING3',
		HEADING4: 'HEADING4',
		HEADING5: 'HEADING5',
		HEADING6: 'HEADING6',
		TITLE: 'TITLE',
		SUBTITLE: 'SUBTITLE',
	},
	GlyphType: {
		BULLET: 'BULLET',
		HOLLOW_BULLET: 'HOLLOW_BULLET',
		SQUARE_BULLET: 'SQUARE_BULLET',
		NUMBER: 'NUMBER',
		LATIN_UPPER: 'LATIN_UPPER',
		LATIN_LOWER: 'LATIN_LOWER',
		ROMAN_UPPER: 'ROMAN_UPPER',
		ROMAN_LOWER: 'ROMAN_LOWER',
	},
	HorizontalAlignment: {
		LEFT: 'LEFT',
		CENTER: 'CENTER',
		RIGHT: 'RIGHT',
		JUSTIFY: 'JUSTIFY',
	},
};

const blankAttributes = () => ({
	FONT_SIZE: null,
	ITALIC: null,
	STRIKETHROUGH: null,
	FOREGROUND_COLOR: null,
	BOLD: null,
	LINK_URL: null,
	UNDERLINE: null,
	FONT_FAMILY: null,
	BACKGROUND_COLOR: null,
});

function mockElement() {
	return td.object([
		'getType',
		'getAttributes',
		'getPreviousSibling',
		'getNextSibling',
	]);
}

const MOCK_TEXT = 'Lorem ipsum dolor sit amet';
function mockText(text = MOCK_TEXT) {
	const textEl = td.object(
		Object.assign(mockElement(), {
			getTextAttributeIndices: noop,
			getText: noop,
			getAttributes: noop,
			getType: noop,
		})
	);

	td.when(textEl.getTextAttributeIndices()).thenReturn([0]);
	td.when(textEl.getText()).thenReturn(text);
	td.when(textEl.getAttributes()).thenReturn(blankAttributes());
	td.when(textEl.getAttributes(0)).thenReturn(blankAttributes());
	td.when(textEl.getType()).thenReturn(DocumentApp.ElementType.TEXT);

	return textEl;
}

function containerOf(...elements) {
	const container = td.object([
		'getNumChildren',
		'getChild',
		'getType',
		'getPreviousSibling',
		'getNextSibling',
		'getAttributes',
		'getPositionedImages',
		'getText',
	]);

	elements.forEach((el, i) => {
		td.when(container.getChild(i)).thenReturn(el);
		td.when(el.getPreviousSibling()).thenReturn(elements[i - 1]);
		td.when(el.getNextSibling()).thenReturn(elements[i + 1]);
	});
	td.when(container.getNumChildren()).thenReturn(elements.length);
	td.when(container.getPositionedImages()).thenReturn([]);

	return container;
}

function paragraphOf(...elements) {
	const paragraph = containerOf(...elements);
	paragraph.getHeading = td.function('getHeading');
	paragraph.getAlignment = td.function('getAlignment');
	td.when(paragraph.getType()).thenReturn(DocumentApp.ElementType.PARAGRAPH);
	td.when(paragraph.getAlignment()).thenReturn(
		DocumentApp.HorizontalAlignment.LEFT
	);
	td.when(paragraph.getAttributes()).thenReturn(blankAttributes());
	return paragraph;
}

describe('renderContainer()', function () {
	let renderContainer, imageLinker;

	beforeEach(function () {
		imageLinker = td.function('imageLinker');
		renderContainer = DocService(DocumentApp, imageLinker);
	});

	it('renders each child of a container', function () {
		const container = containerOf(mockText('foo'), mockText('bar'));

		const actual = renderContainer(container);

		expect(actual).to.equal('foobar');
	});

	describe('Text', function () {
		it('renders simple Text elements', function () {
			const container = containerOf(mockText());

			const actual = renderContainer(container);

			expect(actual).to.equal(MOCK_TEXT);
		});

		it('renders complex Text elements', function () {
			const text = mockText();
			const linkAttrs = Object.assign(blankAttributes(), {
				LINK_URL: 'https://en.wikipedia.org/wiki/Test',
				FOREGROUND_COLOR: '#1155cc',
				UNDERLINE: true, // Gdocs does this automagically for links
			});
			const boldAttrs = Object.assign(blankAttributes(), { BOLD: true });

			td.when(text.getTextAttributeIndices()).thenReturn([
				0,
				5,
				9,
				10,
				14,
			]);
			td.when(text.getText()).thenReturn('More test tests');
			td.when(text.getAttributes()).thenReturn(blankAttributes());
			td.when(text.getAttributes(0)).thenReturn(blankAttributes());
			td.when(text.getAttributes(5)).thenReturn(linkAttrs);
			td.when(text.getAttributes(9)).thenReturn(blankAttributes());
			td.when(text.getAttributes(10)).thenReturn(boldAttrs);
			td.when(text.getAttributes(14)).thenReturn(blankAttributes());
			const container = containerOf(text);

			const actual = renderContainer(container);

			expect(actual).to.equal(
				'More <a href="https://en.wikipedia.org/wiki/Test">test</a> <b>test</b>s'
			);
		});

		it('closes tags at the end', function() {
			const text = mockText();
			const boldAttrs = Object.assign(blankAttributes(), { BOLD: true });

			td.when(text.getTextAttributeIndices()).thenReturn([
				0,
				10,
			]);
			td.when(text.getText()).thenReturn('More test tests');
			td.when(text.getAttributes()).thenReturn(blankAttributes());
			td.when(text.getAttributes(0)).thenReturn(blankAttributes());
			td.when(text.getAttributes(10)).thenReturn(boldAttrs);
			const container = containerOf(text);

			const actual = renderContainer(container);
			expect(actual).to.equal(
				'More test <b>tests</b>'
			)
		})

		it('does not link an auto-linked URL', function () {
			const link = 'http://stackoverflow.com/a/1732454';
			const linkAttrs = Object.assign(blankAttributes(), {
				LINK_URL: link,
				FOREGROUND_COLOR: '#1155cc',
				UNDERLINE: true, // Gdocs does this automagically for links
			});

			const text = mockText(link);
			const endPoint = link.length;
			td.when(text.getTextAttributeIndices()).thenReturn([0, endPoint]);
			td.when(text.getAttributes()).thenReturn(blankAttributes());
			td.when(text.getAttributes(0)).thenReturn(linkAttrs);
			td.when(text.getAttributes(endPoint)).thenReturn(blankAttributes());
			const container = containerOf(text);

			const actual = renderContainer(container);

			expect(actual).to.equal(link);
		});

		it('ignores underlines in links', function () {
			const link = 'http://stackoverflow.com/a/1732454';
			const linkAttrs = Object.assign(blankAttributes(), {
				LINK_URL: link,
				FOREGROUND_COLOR: '#1155cc',
			});
			const underlineStart = Object.assign(linkAttrs, {
				UNDERLINE: true,
			});

			const text = mockText(link);
			const endPoint = link.length;
			td.when(text.getTextAttributeIndices()).thenReturn([
				0,
				1,
				endPoint,
			]);
			td.when(text.getAttributes()).thenReturn(blankAttributes());
			td.when(text.getAttributes(0)).thenReturn(linkAttrs);
			td.when(text.getAttributes(1)).thenReturn(underlineStart);
			td.when(text.getAttributes(endPoint)).thenReturn(blankAttributes());
			const container = containerOf(text);

			const actual = renderContainer(container);

			expect(actual).to.equal(link);
		});
	});

	describe('ListItem', function () {
		let listItems;

		beforeEach(function () {
			listItems = [0, 1, 2, 3].map((i) => {
				const listItem = containerOf(mockText('Example ' + i));
				listItem.getGlyphType = td.function('getGlyphType');
				listItem.getNestingLevel = td.function('getNestingLevel');
				listItem.getListId = td.function('getListId');
				td.when(listItem.getType()).thenReturn(
					DocumentApp.ElementType.LIST_ITEM
				);
				td.when(listItem.getGlyphType()).thenReturn(
					DocumentApp.GlyphType.BULLET
				);
				td.when(listItem.getListId()).thenReturn('kix.8qdf1wb1kj56');
				td.when(listItem.getNestingLevel()).thenReturn(0);
				td.when(listItem.getAttributes()).thenReturn(blankAttributes());
				td.when(listItem.getText()).thenReturn('Example ' + i);
				return listItem;
			});
		});

		it('renders a list of items', function () {
			const body = containerOf(...listItems);

			const actual = renderContainer(body);

			expect(actual).to.match(/^<!-- wp:list -->\n<ul>/);
			expect(actual.match(/<li>/g)).to.have.length(4);
			expect(actual.match(/<\/li>/g)).to.have.length(4);
			expect(actual).to.match(/<\/ul>\n\n<!-- \/wp:list -->$/);
		});

		it('can render an ordered list', function () {
			listItems.forEach((li) => {
				td.when(li.getGlyphType()).thenReturn(
					DocumentApp.GlyphType.NUMBER
				);
			});
			const body = containerOf(...listItems);

			const actual = renderContainer(body);

			expect(actual).to.match(/^<!-- wp:list -->\n<ol>/);
			expect(actual).to.match(/<\/ol>\n\n<!-- \/wp:list -->$/);
		});

		it('can render an ordered list with different glyphs', function () {
			listItems.forEach((li) => {
				td.when(li.getGlyphType()).thenReturn(
					DocumentApp.GlyphType.ROMAN_UPPER
				);
			});
			const body = containerOf(...listItems);

			const actual = renderContainer(body);

			expect(actual).to.match(/^<!-- wp:list -->\n<ol type="I">/);
			expect(actual).to.match(/<\/ol>\n\n<!-- \/wp:list -->$/);
		});

		it('renders links inside lists', function () {
			const listItem = listItems[0];
			const attributes = Object.assign(blankAttributes(), {
				LINK_URL: 'http://www.example.com/',
			});
			td.when(listItem.getAttributes()).thenReturn(attributes);

			const actual = renderContainer(containerOf(listItem));

			expect(actual).to.equal(
`<!-- wp:list -->
<ul>
<li><a href="http://www.example.com/">Example 0</a></li>
</ul>

<!-- /wp:list -->`
			);
		});

		it('renders nested lists', function () {
			td.when(listItems[1].getNestingLevel()).thenReturn(1);
			td.when(listItems[2].getNestingLevel()).thenReturn(1);
			td.when(listItems[1].getGlyphType()).thenReturn(
				DocumentApp.GlyphType.NUMBER
			);
			td.when(listItems[2].getGlyphType()).thenReturn(
				DocumentApp.GlyphType.NUMBER
			);

			const actual = renderContainer(containerOf(...listItems));
			const expected = `<!-- wp:list -->
<ul>
<li>Example 0<ol>
<li>Example 1</li>
<li>Example 2</li>
</ol>
</li>
<li>Example 3</li>
</ul>

<!-- /wp:list -->`;
			expect(actual).to.equal(expected);
		});
	});

	describe('Paragraph', function () {
		it('should render everything inside a <p> tag', function () {
			const paragraph = paragraphOf(mockText());

			const actual = renderContainer(containerOf(paragraph));

			expect(actual).to.equal(
`<!-- wp:paragraph -->
<p>${MOCK_TEXT}</p>
<!-- /wp:paragraph -->
`
			);
		});

		it('should render a paragraph that is entirely bold', function () {
			const paragraph = paragraphOf(mockText('this should be bold'));
			const attrs = Object.assign(blankAttributes(), { BOLD: true });
			td.when(paragraph.getAttributes(0)).thenReturn(attrs);
			td.when(paragraph.getAttributes()).thenReturn(attrs);

			const actual = renderContainer(containerOf(paragraph));

			expect(actual).to.equal(
`<!-- wp:paragraph -->
<p><b>this should be bold</b></p>
<!-- /wp:paragraph -->
`
			);
		});

		it('should render headings', function () {
			const h1 = paragraphOf(
				mockText('theres no earthly way of knowing')
			);
			const h2 = paragraphOf(mockText('which direction we are going'));
			const title = paragraphOf(mockText('is it raining'));
			const subtitle = paragraphOf(mockText('is it snowing'));
			td.when(h1.getHeading()).thenReturn(
				DocumentApp.ParagraphHeading.HEADING1
			);
			td.when(h2.getHeading()).thenReturn(
				DocumentApp.ParagraphHeading.HEADING2
			);
			td.when(title.getHeading()).thenReturn(
				DocumentApp.ParagraphHeading.TITLE
			);
			td.when(subtitle.getHeading()).thenReturn(
				DocumentApp.ParagraphHeading.SUBTITLE
			);

			const actual = renderContainer(
				containerOf(h1, h2, title, subtitle)
			);

			expect(actual).to.equal(
`<!-- wp:heading {"level":1} -->
<h1>theres no earthly way of knowing</h1>
<!-- /wp:heading -->
<!-- wp:heading {"level":2} -->
<h2>which direction we are going</h2>
<!-- /wp:heading -->
<!-- wp:heading {"level":1} -->
<h1>is it raining</h1>
<!-- /wp:heading -->
<!-- wp:heading {"level":2} -->
<h2>is it snowing</h2>
<!-- /wp:heading -->
`
			);
		});

		it('should align paragraphs', function () {
			const center = paragraphOf(
				mockText('Out there theres a world outside of Yonkers')
			);
			td.when(center.getAlignment()).thenReturn(
				DocumentApp.HorizontalAlignment.CENTER
			);
			const justified = paragraphOf(
				mockText(
					'Way out there beyond this hick town Barnaby theres a slick town Barnaby'
				)
			);
			td.when(justified.getAlignment()).thenReturn(
				DocumentApp.HorizontalAlignment.JUSTIFY
			);
			const right = paragraphOf(
				mockText(
					'Put on your Sunday clothes theres lots of world out there'
				)
			);
			td.when(right.getAlignment()).thenReturn(
				DocumentApp.HorizontalAlignment.RIGHT
			);

			const actual = renderContainer(
				containerOf(center, justified, right)
			);

			expect(actual).to.equal(
`<!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center">Out there theres a world outside of Yonkers</p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"align":"justify"} -->
<p class="has-text-align-justify">Way out there beyond this hick town Barnaby theres a slick town Barnaby</p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"align":"right"} -->
<p class="has-text-align-right">Put on your Sunday clothes theres lots of world out there</p>
<!-- /wp:paragraph -->
`
			);
		});
	});

	describe('InlineImage', function () {
		it('renders with the URL from the ImageLinker', function () {
			const image = td.object(
				Object.assign(
					{
						getWidth: noop,
						getHeight: noop,
						getName: noop,
						getAltTitle: noop,
						getAltDescription: noop,
					},
					mockElement()
				)
			);

			td.when(imageLinker(image)).thenReturn(
				'https://cldup.com/E0CqGcUcow.gif'
			);
			td.when(image.getType()).thenReturn(
				DocumentApp.ElementType.INLINE_IMAGE
			);
			td.when(image.getWidth()).thenReturn(640);
			td.when(image.getHeight()).thenReturn(480);
			td.when(image.getAltTitle()).thenReturn('Wapuu');
			td.when(image.getAltDescription()).thenReturn(
				'Wapuu in a winter outfit'
			);

			const actual = renderContainer(containerOf(image));

			expect(actual).to.equal(
`<!-- wp:image {"url":"https://cldup.com/E0CqGcUcow.gif","alt":"Wapuu in a winter outfit","width":640,"height":480} -->
<figure><img src="https://cldup.com/E0CqGcUcow.gif" width="640" height="480" alt="Wapuu in a winter outfit" title="Wapuu"></figure>
<!-- /wp:image -->
`
			);
		});
	});

	describe('PositionedImage', function () {
		it('should render in a paragraph', function () {
			const p = paragraphOf(
				mockText('Who knew we owned 8000 salad plates')
			);
			const positionedImage = td.object(['getHeight', 'getWidth']);
			td.when(positionedImage.getHeight()).thenReturn(716);
			td.when(positionedImage.getWidth()).thenReturn(717);
			td.when(p.getPositionedImages()).thenReturn([positionedImage]);
			td.when(imageLinker(positionedImage)).thenReturn(
				'https://cdn.wapuu.jp/wp-content/uploads/2015/12/wapuu_mcfly.png'
			);

			const actual = renderContainer(p);
			expect(actual).to.equal(
				'Who knew we owned 8000 salad plates<figure><img src="https://cdn.wapuu.jp/wp-content/uploads/2015/12/wapuu_mcfly.png" width="717" height="716" alt="" title=""></figure>'
			);
		});
	});

	describe('Table', function () {
		it('renders a simple table', function () {
			const table = Object.assign(
				{},
				td.object(['getNumRows', 'getRow']),
				mockElement()
			);
			const row0 = Object.assign(
				{},
				td.object(['getNumCells', 'getCell']),
				mockElement()
			);
			const row1 = Object.assign(
				{},
				td.object(['getNumCells', 'getCell']),
				mockElement()
			);

			td.when(table.getNumRows()).thenReturn(2);
			td.when(table.getRow(0)).thenReturn(row0);
			td.when(table.getRow(1)).thenReturn(row1);
			td.when(table.getType()).thenReturn(DocumentApp.ElementType.TABLE);
			td.when(row0.getNumCells()).thenReturn(3);
			td.when(row0.getCell(0)).thenReturn(paragraphOf(mockText('Homer')));
			td.when(row0.getCell(1)).thenReturn(paragraphOf(mockText('Marge')));
			td.when(row0.getCell(2)).thenReturn(paragraphOf(mockText('Bart')));
			td.when(row1.getNumCells()).thenReturn(3);
			td.when(row1.getCell(0)).thenReturn(paragraphOf(mockText('Lisa')));
			td.when(row1.getCell(1)).thenReturn(
				paragraphOf(mockText('Maggie'))
			);
			td.when(row1.getCell(2)).thenReturn(
				paragraphOf(mockText('Grandpa'))
			);

			const actual = renderContainer(containerOf(table));

			expect(actual).to.equal(
`<!-- wp:table {"body":[["Homer","Marge","Bart"],["Lisa","Maggie","Grandpa"]]} -->
<table><tbody><tr><td>Homer</td><td>Marge</td><td>Bart</td></tr><tr><td>Lisa</td><td>Maggie</td><td>Grandpa</td></tr></tbody></table>
<!-- /wp:table -->
`
			);
		});
	});

	describe('HorizontalRule', function () {
		it('renders', function () {
			const hr = mockElement();
			td.when(hr.getType()).thenReturn(
				DocumentApp.ElementType.HORIZONTAL_RULE
			);

			const actual = renderContainer(containerOf(hr));

			expect(actual).to.equal(
`<!-- wp:separator -->
<hr>
<!-- /wp:separator -->`
			);
		});
	});

	afterEach(td.reset);
});
