const PERSISTANCE_KEY = 'SITES'

export function Sites( propertieService ) {
	const props = () => propertieService.getUserProperties();

	function add( site ) {
		const sites = list()
		props().setProperty( PERSISTANCE_KEY, JSON.stringify( sites.concat( site ) ) )
	}

	function list() {
		let sites;
		const jsonSites = props().getProperty( PERSISTANCE_KEY )
		try {
			sites = JSON.parse( jsonSites )
		} catch ( e ) {
			sites = []
		}
		return sites || [];
	}

	const find = site_id => list.find( site => site.site_id === site_id )

	return {
		add,
		list,
		find
	}
}