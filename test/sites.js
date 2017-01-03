import { expect } from 'chai';
import td from 'testdouble';
import { Sites } from '../src/sites'

describe( 'Sites', function() {
	let sites, props

	const site = {
		access_token: 'abcdef',
		blog_id: 12345,
		blog_url: 'http://example.com/',
		token_type: 'bearer'
	}

	beforeEach( function() {
		props = td.object( [ 'getProperty', 'setProperty' ] )
		const propService = { getUserProperties: () => props }

		sites = Sites( propService )
	} )

	describe( 'list', function() {
		it( 'retrieves the list of all sites', function() {
			td.when( props.getProperty( 'SITES' ) ).thenReturn( JSON.stringify( [ site, site ] ) )

			const actual = sites.list()

			expect( actual ).to.have.length( 2 )
			expect( actual[0] ).to.eql( site )
		} )
	} )

	describe( 'add', function() {
		it( 'stores the site in the properties', function() {

			sites.add( site )

			td.verify( props.setProperty( 'SITES', JSON.stringify( [site] ) ) )
		} )
	} )




} )
