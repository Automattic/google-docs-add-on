const SITE_PERSISTANCE_KEY = 'SITES'
const POST_PERSISTANCE_KEY = 'POST_DATA'

export function Persistance( propertieService ) {
	const userProps = () => propertieService.getUserProperties();
	const docProps = () => propertieService.getDocumentProperties();
	let sitesCache;

	function listSites() {
		if ( sitesCache ) {
			return sitesCache;
		}

		const jsonSites = userProps().getProperty( SITE_PERSISTANCE_KEY )
		try {
			sitesCache = JSON.parse( jsonSites )
		} catch ( e ) {
			sitesCache = []
		}
		return sitesCache || [];
	}

	const findSite = site_id => {
		const sites = listSites()
		for ( let i = 0; i < sites.length; i++ ) {
			if ( sites[ i ].blog_id === site_id ) {
				return sites[ i ];
			}
		}
	}

	function addSite( site ) {
		if ( findSite( site.blog_id ) ) {
			return;
		}

		persisitSites( listSites().concat( siteIdentity( site ) ) );
	}

	function updateSite( siteArg ) {
		let siteToPersist = undefined
		persisitSites( listSites().map( site => {
			if ( site.blog_id === siteArg.blog_id ) {
				siteToPersist = siteIdentity( siteArg )
				return siteToPersist
			}

			return site
		} ) )

		return siteToPersist || {}
	}

	function categoryIdentity( category ) {
		const { ID, name } = category;
		return { ID, name }
	}

	function postTypeIdentity( postType ) {
		return {
			name: postType.name,
			labels: { singular_name: postType.labels.singular_name },
			supports: {
				editor: postType.supports.editor,
				exclude_from_external_editors: postType.supports.exclude_from_external_editors
			},
			taxonomies: postType.taxonomies
		}
	}

	function siteIdentity( site ) {
		let img = '';
		const {
			access_token,
			blog_id,
			blog_url,
			info: { name },
			categories,
			postTypes
		} = site;

		if ( site.info.icon && site.info.icon.img ) {
			img = site.info.icon.img;
		}
		const persistCategories = categories.map( categoryIdentity )
		const persistPostTypes = postTypes
			.map( postTypeIdentity )
			.filter( ( t ) => t.supports.editor )
			.filter( ( t ) => ! t.supports.exclude_from_external_editors )

		return {
			access_token,
			blog_id,
			blog_url,
			info: { name, icon: { img } },
			categories: persistCategories,
			postTypes: persistPostTypes
		};
	}

	function deleteSite( site_id ) {
		persisitSites( listSites().filter( site => site.blog_id !== site_id ) )
	}

	function persisitSites( sites ) {
		sitesCache = sites;
		userProps().setProperty( SITE_PERSISTANCE_KEY, JSON.stringify( sites ) )
	}

	function savePostToSite( post, site ) {
		const { blog_id } = site;
		const postData = getPostStatus();
		postData[ blog_id ] = postIdentity( post );
		docProps().setProperty( POST_PERSISTANCE_KEY, JSON.stringify( postData ) )
		return postData[ blog_id ]
	}

	function postIdentity( post ) {
		const { date, URL, ID, modified, type, categories, tags } = post
		const postCategories = Object.keys( categories )
		const postTags = Object.keys( tags )
		return { date, URL, ID, modified, type, categories: postCategories, tags: postTags }
	}

	function getPostStatus() {
		let postStatus = docProps().getProperty( POST_PERSISTANCE_KEY );

		if ( ! postStatus ) {
			return {}
		}

		try {
			postStatus = JSON.parse( postStatus )
		} catch ( e ) {
			postStatus = {}
		}

		return postStatus;
	}

	return {
		addSite,
		updateSite,
		listSites,
		findSite,
		deleteSite,
		savePostToSite,
		getPostStatus
	}
}
