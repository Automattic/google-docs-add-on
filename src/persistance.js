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

	function siteIdentity( site ) {
		let img;
		const { access_token, blog_id, blog_url, info: { name } } = site;
		if ( site.info.icon && site.info.icon.img ) {
			img = site.info.icon.img;
		}
		return { access_token, blog_id, blog_url, info: { name, icon: { img } } };
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
	}

	function postIdentity( post ) {
		const { date, URL, ID, modified } = post;
		return { date, URL, ID, modified };
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
		listSites,
		findSite,
		deleteSite,
		savePostToSite,
		getPostStatus
	}
}
