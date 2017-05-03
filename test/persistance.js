import { expect } from 'chai';
import td from 'testdouble';
import { Persistance } from '../server/persistance'

describe( 'Sites', function() {
	let store, userProps, docProps;

	const site = {
		access_token: 'abcdef',
		blog_id: 12345,
		blog_url: 'http://example.com/',
		info: {
			name: "George's awesome blog",
			icon: {
				img: 'http://placekitten.com/90/90'
			}
		},
		categories: [
			{ name: 'foo' },
			{ name: 'bar' }
		],
		postTypes: [ {
			name: 'post',
			labels: { singular_name: 'Post' },
			supports: { editor: true },
			taxonomies: [ 'category', 'post_tag' ]
		}, {
			name: 'page',
			labels: { singular_name: 'Page' },
			supports: { editor: true },
			taxonomies: [ 'category', 'post_tag' ]
		} ]
	}

	const post = {
		date: '2017-01-10T14:57:52+00:00',
		URL: 'https://georgehtest2.wordpress.com/?p=184',
		ID: 184,
		categories: [ 'foo' ],
		tags: [ 'baz' ]
	}

	beforeEach( function() {
		userProps = td.object( [ 'getProperty', 'setProperty' ] )
		docProps = td.object( [ 'getProperty', 'setProperty' ] )

		const propService = {
			getUserProperties: () => userProps,
			getDocumentProperties: () => docProps
		}

		store = Persistance( propService )
	} )

	describe( 'listSites', function() {
		it( 'retrieves the list of all sites', function() {
			td.when( userProps.getProperty( 'SITES' ) ).thenReturn( JSON.stringify( [ site, site ] ) )

			const actual = store.listSites()

			expect( actual ).to.have.length( 2 )
			expect( actual[0] ).to.eql( site )
		} )
	} )

	describe( 'addSite', function() {
		it( 'stores the site in the properties', function() {
			store.addSite( site )

			td.verify( userProps.setProperty( 'SITES', JSON.stringify( [site] ) ) )
		} )

		it( "does't add duplicate sites", function() {
			td.when( userProps.getProperty( 'SITES' ) ).thenReturn( JSON.stringify( [ site ] ) )
			store.addSite( site )

			td.verify( userProps.setProperty( 'SITES' ), { times: 0, ignoreExtraArgs: true } )
		} )

		it( 'only stores the properties we need', function() {
			const extendedSite = Object.assign( {}, site, { foo: 'bar', baz: 'bing' } )
			store.addSite( extendedSite )

			td.verify( userProps.setProperty( 'SITES', JSON.stringify( [site] ) ) )
		} )

		it( 'ignores post types without editor support', function() {
			const extendedSite = Object.assign( {}, site, {
				postTypes: [
					...site.postTypes,
					{
						name: 'attachment',
						labels: { singular_name: 'Media' },
						supports: { title: true }
					}
				]
			} )
			store.addSite( extendedSite )

			td.verify( userProps.setProperty( 'SITES', JSON.stringify( [site] ) ) )
		} )
	} )

	describe( 'deleteSite()', function() {
		it( 'removes the site', function() {
			const siteToDelete = Object.assign( {}, site, { blog_id: 54321 } )
			td.when( userProps.getProperty( 'SITES' ) ).thenReturn( JSON.stringify( [ site, siteToDelete ] ) )

			store.deleteSite( siteToDelete.blog_id )

			td.verify( userProps.setProperty( 'SITES', JSON.stringify( [site] ) ) )
		} )
	} )

	describe( 'savePost()', function() {
		it( 'stores the post info', function() {
			const categories = { foo: {} }
			const tags = { baz: {} }
			const postResponse = Object.assign( {}, post, { categories, tags } )
			store.savePostToSite( postResponse, site )

			const expected = JSON.stringify( {
				[ site.blog_id ]: post
			} )
			td.verify( docProps.setProperty( 'POST_DATA', expected ) )
		} )
	} )
} )
