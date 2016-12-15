import { expect } from 'chai';
import td from 'testdouble';
import { docServiceFactory } from '../src/doc-service'

const noop = () => {};

const DocumentApp = {
	ElementType: {
		PARAGRAPH: 'PARAGRAPH',
		TEXT: 'TEXT',
		INLINE_IMAGE: 'INLINE_IMAGE',
		LIST_ITEM: 'LIST_ITEM',
		TABLE: 'TABLE',
		TABLE_ROW: 'TABLE_ROW',
		TABLE_CELL: 'TABLE_CELL'
	},
	ParagraphHeading: {
		HEADING1: 'HEADING1',
		HEADING2: 'HEADING2',
		HEADING3: 'HEADING3',
		HEADING4: 'HEADING4',
		HEADING5: 'HEADING5',
		HEADING6: 'HEADING6',
		TITLE: 'TITLE',
		SUBTITLE: 'SUBTITLE'
	},
	GlyphType: {
		BULLET: 'BULLET',
		HOLLOW_BULLET: 'HOLLOW_BULLET',
		SQUARE_BULLET: 'SQUARE_BULLET',
		NUMBER: 'NUMBER',
		LATIN_UPPER: 'LATIN_UPPER',
		LATIN_LOWER: 'LATIN_LOWER',
		ROMAN_UPPER: 'ROMAN_UPPER',
		ROMAN_LOWER: 'ROMAN_LOWER'
	}
}

const blankAttributes = () => ( {
	FONT_SIZE: null,
	ITALIC: null,
	STRIKETHROUGH: null,
	FOREGROUND_COLOR: null,
	BOLD: null,
	LINK_URL: null,
	UNDERLINE: null,
	FONT_FAMILY: null,
	BACKGROUND_COLOR: null
} )

function mockElement() {
	return td.object( [ 'getType', 'getAttributes', 'getPreviousSibling', 'getNextSibling'] )
}

const MOCK_TEXT = 'Lorem ipsum dolor sit amet'
function mockText( text = MOCK_TEXT ) {
	const textEl = td.object( Object.assign( mockElement(), {
		getTextAttributeIndices: noop,
		getText: noop,
		getAttributes: noop,
		getType: noop
	} ) )

	td.when( textEl.getTextAttributeIndices() ).thenReturn( [ 0 ] )
	td.when( textEl.getText() ).thenReturn( text )
	td.when( textEl.getAttributes() ).thenReturn( blankAttributes() )
	td.when( textEl.getAttributes( 0 ) ).thenReturn( blankAttributes() )
	td.when( textEl.getType() ).thenReturn( DocumentApp.ElementType.TEXT )

	return textEl;
}

function containerOf( ...elements ) {
	const container = td.object( ['getNumChildren', 'getChild', 'getType', 'getPreviousSibling', 'getNextSibling', 'getAttributes'] )

	elements.forEach( ( el, i ) => {
		td.when( container.getChild( i ) ).thenReturn( el )

		if ( i > 0 ) {
			td.when( el.getPreviousSibling() ).thenReturn( elements[i - 1] )
		}

		if ( i < ( elements.length - 2 ) ) {
			td.when( el.getNextSibling() ).thenReturn( elements[i + 1] )
		}
	} )
	td.when( container.getNumChildren() ).thenReturn( elements.length )
	return container
}

function paragraphOf( ...elements ) {
	const paragraph = containerOf( ...elements )
	paragraph.getHeading = td.function( 'getHeading' )
	td.when( paragraph.getType() ).thenReturn( DocumentApp.ElementType.PARAGRAPH )
	return paragraph
}

describe( 'renderContainer()', function() {
	let renderContainer, imageLinker;

	beforeEach( function() {
		imageLinker = td.function( 'imageLinker' )
		renderContainer = docServiceFactory( DocumentApp, imageLinker )
	} )

	it( 'renders each child of a container', function() {
		const container = containerOf( mockText( 'foo' ), mockText( 'bar' ) )

		const actual = renderContainer( container )

		expect( actual ).to.equal( 'foobar' )
	} )

	describe( 'Text', function() {
		it( 'renders simple Text elements', function() {
			const container = containerOf( mockText() )

			const actual = renderContainer( container )

			expect( actual ).to.equal( MOCK_TEXT )
		} )

		it( 'renders complex Text elements', function() {
			const text = mockText();
			const linkAttrs = Object.assign( blankAttributes(), {
				LINK_URL: 'https://en.wikipedia.org/wiki/Test',
				FOREGROUND_COLOR: '#1155cc',
				UNDERLINE: true // Gdocs does this automagically for links
			} )
			const boldAttrs = Object.assign( blankAttributes(), { BOLD: true} )

			td.when( text.getTextAttributeIndices() ).thenReturn( [ 0, 5, 9, 10, 14 ] )
			td.when( text.getText() ).thenReturn( 'More test tests' )
			td.when( text.getAttributes() ).thenReturn( blankAttributes() );
			td.when( text.getAttributes( 0 ) ).thenReturn( blankAttributes() );
			td.when( text.getAttributes( 5 ) ).thenReturn( linkAttrs );
			td.when( text.getAttributes( 9 ) ).thenReturn( blankAttributes() );
			td.when( text.getAttributes( 10 ) ).thenReturn( boldAttrs );
			td.when( text.getAttributes( 14 ) ).thenReturn( blankAttributes() );
			const container = containerOf( text )

			const actual = renderContainer( container )

			expect( actual ).to.equal( 'More <a href="https://en.wikipedia.org/wiki/Test">test</a> <b>test</b>s' )
		} )
	} )

	describe( 'ListItem', function() {
		let listItems;

		beforeEach( function() {
			listItems = [ 0, 1, 2 ].map( ( ) => {
				const listItem = containerOf( mockText() )
				listItem.getGlyphType = td.function( 'getGlyphType' )
				td.when( listItem.getType() ).thenReturn( DocumentApp.ElementType.LIST_ITEM )
				td.when( listItem.getGlyphType() ).thenReturn( DocumentApp.GlyphType.BULLET )
				return listItem
			} );
		} )

		it( 'renders a list of items', function() {
			const body = containerOf( ...listItems );

			const actual = renderContainer( body )

			expect( actual.startsWith( '<ul>' ) ).to.equal( true )
			expect( actual.match( /<li>/g ) ).to.have.length( 3 )
			expect( actual.match( /<\/li>/g ) ).to.have.length( 3 )
			expect( actual.endsWith( '</ul>\n' ) ).to.equal( true )
		} )

		it( 'can render an ordered list', function() {
			listItems.forEach( ( li ) => {
				td.when( li.getGlyphType() ).thenReturn( DocumentApp.GlyphType.NUMBER )
			} )
			const body = containerOf( ...listItems );

			const actual = renderContainer( body );

			expect( actual.startsWith( '<ol>' ) ).to.equal( true )
			expect( actual.endsWith( '</ol>\n' ) ).to.equal( true )
		} )

		it( 'can render an ordered list with different glyphs', function() {
			listItems.forEach( ( li ) => {
				td.when( li.getGlyphType() ).thenReturn( DocumentApp.GlyphType.ROMAN_UPPER )
			} )
			const body = containerOf( ...listItems );

			const actual = renderContainer( body );

			expect( actual.startsWith( '<ol type="I">' ) ).to.equal( true )
			expect( actual.endsWith( '</ol>\n' ) ).to.equal( true )
		} )

		it( 'renders links inside lists', function() {
			const listItem = containerOf( mockText( 'Example' ) )
			listItem.getGlyphType = td.function( 'getGlyphType' )
			td.when( listItem.getType() ).thenReturn( DocumentApp.ElementType.LIST_ITEM )
			td.when( listItem.getGlyphType() ).thenReturn( DocumentApp.GlyphType.BULLET )
			const attributes = Object.assign( blankAttributes(), { LINK_URL: 'http://www.example.com/' } )
			td.when( listItem.getAttributes() ).thenReturn( attributes )

			const actual = renderContainer( containerOf( listItem ) )

			expect( actual ).to.equal( '<ul>\n<li><a href="http://www.example.com/">Example</a></li>\n</ul>\n' )
		} )
	} )

	describe( 'Paragraph', function() {
		it( 'should render everything inside a <p> tag', function() {
			const paragraph = paragraphOf( mockText() )

			const actual = renderContainer( containerOf( paragraph ) )

			expect( actual ).to.equal( `<p>${ MOCK_TEXT }</p>\n` )
		} )

		it( 'should render a paragraph that is entirely bold', function() {
			const paragraph = paragraphOf( mockText( 'this should be bold' ) )
			const attrs = Object.assign( blankAttributes(), { BOLD: true} )
			td.when( paragraph.getAttributes( 0 ) ).thenReturn( attrs )
			td.when( paragraph.getAttributes() ).thenReturn( attrs )

			const actual = renderContainer( containerOf( paragraph ) )

			expect( actual ).to.equal( '<p><b>this should be bold</b></p>\n' )
		} )

		it( 'should render headings', function() {
			const h1 = paragraphOf( mockText( 'theres no earthly way of knowing' ) )
			const h2 = paragraphOf( mockText( 'which direction we are going' ) )
			td.when( h1.getHeading() ).thenReturn( DocumentApp.ParagraphHeading.HEADING1 )
			td.when( h2.getHeading() ).thenReturn( DocumentApp.ParagraphHeading.HEADING2 )

			const actual = renderContainer( containerOf( h1, h2 ) )

			expect( actual ).to.equal( '<h1>theres no earthly way of knowing</h1>\n<h2>which direction we are going</h2>\n' )
		} )
	} )

	describe( 'InlineImage', function() {
		it( 'renders with the URL from the ImageLinker', function() {
			const image = td.object( Object.assign( {
				getWidth: noop,
				getHeight: noop,
				getName: noop,
				getAltTitle: noop,
				getAltDescription: noop
			}, mockElement() ) )

			td.when( imageLinker( image ) ).thenReturn( 'https://cldup.com/E0CqGcUcow.gif' )
			td.when( image.getType() ).thenReturn( DocumentApp.ElementType.INLINE_IMAGE )
			td.when( image.getWidth() ).thenReturn( 640 )
			td.when( image.getHeight() ).thenReturn( 480 )
			td.when( image.getAltTitle() ).thenReturn( 'Wapuu' )
			td.when( image.getAltDescription() ).thenReturn( 'Wapuu in a winter outfit' )

			const actual = renderContainer( containerOf( image ) )

			expect( actual ).to.equal( '<img src="https://cldup.com/E0CqGcUcow.gif" width="640" height="480" alt="Wapuu in a winter outfit" title="Wapuu">' )
		} )
	} )

	describe( 'Table', function() {
		it( 'renders a simple table', function() {
			const table = Object.assign( {}, td.object( [ 'getNumRows', 'getRow' ] ), mockElement() )
			const row0 = Object.assign( {}, td.object( [ 'getNumCells', 'getCell' ] ), mockElement() )
			const row1 = Object.assign( {}, td.object( [ 'getNumCells', 'getCell' ] ), mockElement() )

			td.when( table.getNumRows() ).thenReturn( 2 )
			td.when( table.getRow( 0 ) ).thenReturn( row0 )
			td.when( table.getRow( 1 ) ).thenReturn( row1 )
			td.when( table.getType() ).thenReturn( DocumentApp.ElementType.TABLE )
			td.when( row0.getNumCells() ).thenReturn( 3 )
			td.when( row0.getCell( 0 ) ).thenReturn( paragraphOf( mockText( 'Homer' ) ) )
			td.when( row0.getCell( 1 ) ).thenReturn( paragraphOf( mockText( 'Marge' ) ) )
			td.when( row0.getCell( 2 ) ).thenReturn( paragraphOf( mockText( 'Bart' ) ) )
			td.when( row1.getNumCells() ).thenReturn( 3 )
			td.when( row1.getCell( 0 ) ).thenReturn( paragraphOf( mockText( 'Lisa' ) ) )
			td.when( row1.getCell( 1 ) ).thenReturn( paragraphOf( mockText( 'Maggie' ) ) )
			td.when( row1.getCell( 2 ) ).thenReturn( paragraphOf( mockText( 'Grandpa' ) ) )

			const actual = renderContainer( containerOf( table ) )

			expect( actual ).to.equal( '<table><tbody><tr><td>Homer</td><td>Marge</td><td>Bart</td></tr><tr><td>Lisa</td><td>Maggie</td><td>Grandpa</td></tr></tbody></table>' )
		} )
	} )

	afterEach( td.reset )
} )

