/* global React */
import { loadSites, getAuthUrl } from './services';
import Site from './site.jsx';
import ErrorMessage from './error-message.jsx'

export default class App extends React.Component {
	constructor( props ) {
		super( props )
		this.state = {
			sitesLoaded: false,
			sites: [],
			error: null,
			authorizationUrl: null
		};
		this.updateAuthUrl = this.updateAuthUrl.bind( this )
		this.updateSiteList = this.updateSiteList.bind( this )
		this.errorHandler = this.errorHandler.bind( this )
		this.clearError = this.clearError.bind( this )
	}

	componentDidMount() {
		this.updateSiteList()
		this.updateAuthUrl()
		this.authTimer = setInterval( () => this.updateAuthUrl(), 1000 * 60 * 3 )
	}

	componentWillUnmount() {
		clearInterval( this.authTimer )
	}

	updateSiteList() {
		loadSites()
			.then( ( sites ) => this.setState( { sites, sitesLoaded: true } ) )
			.catch( ( e ) => this.setState( { error: e } ) )
	}

	updateAuthUrl() {
		getAuthUrl()
			.then( ( authorizationUrl ) => this.setState( { authorizationUrl } ) )
			.catch( ( e ) => this.setState( { error: e } ) )
	}

	errorHandler( e ) {
		this.setState( { error: e } )
	}

	clearError() {
		this.setState( { error: null } )
	}

	render() {
		const hasSites = this.state.sitesLoaded && ( this.state.sites.length > 0 )
		const headerCopy = hasSites
			? 'Pick a site to copy this document to below. It will be saved on your site as a draft.'
			: 'Welcome! To get started, add your first WordPress.com or Jetpack-connected site by clicking the button at the bottom.'
		const loadingMessage = ( ! this.state.sitesLoaded ) ? <p className="loading">Loading…</p> : null

		return <div className="container">
			<div className="header">
				<h1><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="0" fill="none" width="24" height="24"/><g><path d="M21 11v8c0 1.105-.895 2-2 2H5c-1.105 0-2-.895-2-2V5c0-1.105.895-2 2-2h8l-2 2H5v14h14v-6l2-2zM7 17h3l7.5-7.5-3-3L7 14v3zm9.94-12.94L15.5 5.5l3 3 1.44-1.44c.585-.585.585-1.535 0-2.12l-.88-.88c-.585-.585-1.535-.585-2.12 0z"/></g></svg> Draft to WordPress</h1>

				<div className="header__help-text">
					<p>{ headerCopy }</p>
				</div>
			</div>

			<div className="sites-list" id="sites-list">
				{ loadingMessage }
				<ul>
					{ this.state.sites.map( site => <Site key={ site.blog_id } site={ site } errorHandler={ this.errorHandler } updateSiteList={ this.updateSiteList } /> ) }
					<li><a className="button button-secondary" href={ this.state.authorizationUrl } target="_blank">Add WordPress Site</a></li>
				</ul>
			</div>

			<ErrorMessage msg={ this.state.error } clearError={ this.clearError } />

			<div className="footer">
				<div className="footer__help-link">
					<a title="Help" href="https://apps.wordpress.com/google-docs/support/"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="0" fill="none" width="24" height="24"/><g><path d="M12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8m0-2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4 8c0-2.21-1.79-4-4-4s-4 1.79-4 4h2c0-1.103.897-2 2-2s2 .897 2 2-.897 2-2 2c-.552 0-1 .448-1 1v2h2v-1.14c1.722-.447 3-1.998 3-3.86zm-3 6h-2v2h2v-2z"/></g></svg></a>
				</div>
			</div>
		</div>
	}
}
