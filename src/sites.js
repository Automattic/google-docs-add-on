const PERSISTANCE_KEY = 'SITES'

export function Sites( propertieService ) {
	const props = () => propertieService.getUserProperties();
	let sitesCache;

	function list() {
		if ( sitesCache ) {
			return sitesCache;
		}

		const jsonSites = props().getProperty( PERSISTANCE_KEY )
		try {
			sitesCache = JSON.parse( jsonSites )
		} catch ( e ) {
			sitesCache = []
		}
		return sitesCache || [];
	}

	const find = site_id => {
		const sites = list()
		for ( let i = 0; i < sites.length; i++ ) {
			if ( sites[ i ].blog_id === site_id ) {
				return sites[ i ];
			}
		}
	}

	function add( site ) {
		if ( find( site.blog_id ) ) {
			return;
		}
		const sites = list()
		sitesCache = sites.concat( siteIdentity( site ) );
		props().setProperty( PERSISTANCE_KEY, JSON.stringify( sitesCache ) )
	}

	function siteIdentity( site ) {
		const { access_token, blog_id, blog_url, info: { name } } = site;
		return { access_token, blog_id, blog_url, info: { name } };
	}

	return {
		add,
		list,
		find
	}
}