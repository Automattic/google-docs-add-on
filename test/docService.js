import { assert } from 'chai';
import td from 'testdouble';
import { renderText } from '../src/docService'

describe( 'renderText', function() {
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

	// Returns a test double for a Google Apps Script Text object of this HTML
	// More <a href="https://en.wikipedia.org/wiki/Test">test</a> <b>test</b>s
	const mockText = () => {
		const text = {
			getTextAttributeIndices: () => [ 0, 5, 9, 10, 14 ],
			getText: () => 'More test tests',
			getAttributes: td.function( 'getAttributes' )
		}

		const linkAttrs = Object.assign( blankAttributes(), {
			LINK_URL: 'https://en.wikipedia.org/wiki/Test',
			FOREGROUND_COLOR: '#1155cc',
			UNDERLINE: true
		} )
		const boldAttrs = Object.assign( blankAttributes(), { BOLD: true} )

		td.when( text.getAttributes() ).thenReturn( blankAttributes() );
		td.when( text.getAttributes( 0 ) ).thenReturn( blankAttributes() );
		td.when( text.getAttributes( 5 ) ).thenReturn( linkAttrs );
		td.when( text.getAttributes( 9 ) ).thenReturn( blankAttributes() );
		td.when( text.getAttributes( 10 ) ).thenReturn( boldAttrs );
		td.when( text.getAttributes( 14 ) ).thenReturn( blankAttributes() );

		return text;
	}

	it( 'converts Text object to HTML', function() {
		const expected = 'More <a href="https://en.wikipedia.org/wiki/Test">test</a> <b>test</b>s'
		const actual = renderText( mockText() );
		assert.equal( actual, expected )
	} )

	afterEach( function() {
		td.reset()
	} )
} )



