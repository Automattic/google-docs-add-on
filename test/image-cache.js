import { expect } from 'chai';
import td from 'testdouble';
import { ImageCache } from '../src/server/image-cache'

describe( 'ImageCache', function() {
	let imageCache, docProps, hasher, site

	beforeEach( function() {
		site = { blog_id: 12345 }
		docProps = td.object( ['getProperty', 'setProperty'] )
		hasher = td.function( 'hasher' )
		imageCache = ImageCache( site, docProps, hasher )
	} )

	describe( 'get()', function() {
		it( 'returns the image url if found', function() {
			const image = td.object( ['getBlob'] );
			const imageBlob = td.object( ['getBytes'] );
			td.when( image.getBlob() ).thenReturn( imageBlob )
			td.when( imageBlob.getBytes() ).thenReturn( [9,8,7,6,5] );
			td.when( hasher( [9,8,7,6,5] ) ).thenReturn( 'abcdef0123456789' )
			td.when( docProps.getProperty( 'image:12345:abcdef0123456789' ) ).thenReturn( 'http://placekitten.com/640/480' )

			const actual = imageCache.get( image )

			expect( actual ).to.equal( 'http://placekitten.com/640/480' )
		} )
	} )

	describe( 'set()', function() {
		it( 'adds an image url', function() {
			const image = td.object( ['getBlob'] );
			const imageBlob = td.object( ['getBytes'] );
			td.when( image.getBlob() ).thenReturn( imageBlob )
			td.when( imageBlob.getBytes() ).thenReturn( [9,8,7,6,5] );
			td.when( hasher( [9,8,7,6,5] ) ).thenReturn( 'abcdef0123456789' )

			imageCache.set( image, 'http://placekitten.com/640/480' )

			td.verify( docProps.setProperty( 'image:12345:abcdef0123456789', 'http://placekitten.com/640/480' ) )
		} )
	} )
} )
