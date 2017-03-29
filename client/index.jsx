/* global document, React, ReactDOM */
import { loadSites, deleteSite, postToWordPress, getAuthUrl } from './services';

class PostButton extends React.Component {
	constructor( props ) {
		super( props );
		this.state = {
			disabled: false,
			post: props.site.post
		};
		this.savePost = this.savePost.bind( this )
	}

	savePost() {
		this.setState( { disabled: true } )
		postToWordPress( this.props.site.blog_id )
			.then( ( post ) => {
				this.setState( { disabled: null } )
				this.setState( { post } )
			} )
			.catch( ( e ) => {
				this.props.errorHandler( e )
				this.setState( { disabled: null } )
			} )
	}

	render() {
		const buttonLabel = ( this.state.post ) ? 'Update' : 'Save';

		return <button className="sites-list__save-draft" disabled={ this.state.disabled } onClick={ this.savePost }>{ buttonLabel }</button>
	}
}

const CategoryInput = ( props ) => {
	return <li><input type="checkbox" /> { props.name }</li>
}

class Site extends React.Component {
	constructor( props ) {
		super( props );
		this.state = {
			postCategories: ( props.site.post && props.site.post.categories ) ? props.site.post.categories : {},
			postTags: ( props.site.post && props.site.post.tags ) ? props.site.post.tags : {},
		}
	}

	addCategory( category ) {
		this.setState( {
			postCategories: Object.assign( this.state.postCategories, {
				[category.name]: category
			} )
		} )
	}

	removeCategory( category ) {
		if ( this.state.postCategories[ category.name ] ) {
			const categories = Object.assign( {}, this.state.postCategories )
			delete categories[ category.name ]
			this.setState( { postCategories: categories } )
		}
	}

	render() {
		const site = this.props.site
		const previewLink = ( site.post ) ? <span className="sites-list__post-link"><a href={ site.post.URL }>Preview on { site.info.name }</a></span> : null;
		const blavatar = ( site.info.icon && site.info.icon.img ) ? site.info.icon.img : 'https://secure.gravatar.com/blavatar/e6392390e3bcfadff3671c5a5653d95b'
		const removeSite = () => deleteSite( site.blog_id ).then( this.props.updateSiteList ).catch( this.props.errorHandler )

		return <li>
			<div className="sites-list__basic">
				<div className="sites-list__blavatar">
					<img src={ blavatar } alt="" />
				</div>
				<div className="sites-list__sitename">
					<a className="sites-list__title" href={ site.blog_url }>{ site.info.name }<br />
					<em>{ site.blog_url }</em></a>
				</div>
				<PostButton site={ site } errorHandler={ this.props.errorHandler } />
				<a className="sites-list__extended-toggle" href=""><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>Dropdown</title><rect x="0" fill="none" width="24" height="24"/><g><path d="M7 10l5 5 5-5"/></g></svg></a>
			</div>
			<div className="sites-list__extended">
				{ previewLink }
			</div>
			<div className="sites-extended">
				<div><label>
					<strong>Tags:</strong><br />
					<input placeholder="Add tags, separate with commas…" style={ { width: '100%' } } />
				</label></div>
				<div>
					<strong>Categories:</strong>
					<ul>
						{ site.categories.map( c => <CategoryInput key={ c.ID } postCategories={ this.state.postCategories } addCategory={ this.addCategory.bind( this, c ) } removeCategory={ this.removeCategory.bind( this, c ) } {...c} /> ) }
					</ul>
				</div>
				<div>
					<a title="Remove site from this list" className="sites-list__delete-site" onClick={ removeSite }>Remove { props.site.info.name }<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="0" fill="none" width="24" height="24"/><g><path d="M17.705 7.705l-1.41-1.41L12 10.59 7.705 6.295l-1.41 1.41L10.59 12l-4.295 4.295 1.41 1.41L12 13.41l4.295 4.295 1.41-1.41L13.41 12l4.295-4.295z"/></g></svg></a>
				</div>
			</div>
		</li>
	}
}

const ErrorMessage = ( props ) => {
	if ( ! props.msg ) {
		return null;
	}

	const errorMatch = props.msg.message.match( /"message":"(.*?)"}/ );
	let errorBody = <div>
		<p><code style="font-size: 12px; word-wrap: break-word">{ props.msg.message }</code></p>
		<p><a href="https://support.wordpress.com" target="_blank">Please report this error</a></p>
	</div>

	// Bit of sniffing
	if ( props.msg.message.indexOf( 'API calls to this blog have been disabled' ) !== -1 ) {
		errorBody = <p>Jetpack JSON API has been disabled - please <a href="https://apps.wordpress.com/google-docs/support/#json-api" target="_blank">re-enable it</a> to continue posting.</p>
	} else if ( props.msg.message.indexOf( 'cURL error 28:' ) !== -1 ) {
		errorBody = <p>Connection to your site timed out. Try again and/or investigate server load.</p>
	} else if ( props.msg.message.indexOf( '[-32700]' ) !== -1 ) {
		errorBody = <p>Your site returned an unexpected response - are you <a href="https://apps.wordpress.com/google-docs/support/#other-plugins">running plugins</a> that may be causing a problem?</p>
	} else if ( props.msg.message.indexOf( 'HTTP status code was not 200' ) !== -1 ) {
		errorBody = <p>Your server returned an unexpected response. This could be a misconfiguration, a bad plugin, or something may be broken. <a href="https://apps.wordpress.com/google-docs/support/#unexpected-response">Don't panic yet though!</a></p>
	} else if ( errorMatch && errorMatch.length > 0 ) {
		errorBody = <p>{ errorMatch[ 1 ] }</p>
	}

	return <div className="error" style={ {margin: '0px 6px', position: 'relative' } }>
		<p style={ { width: '100%' } } ><svg onClick={ props.clearError } style={ { cursor: 'pointer', position: 'absolute', right: '5px', top: '12px' } } width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="0" fill="none" width="24" height="24"/><g><path d="M17.705 7.705l-1.41-1.41L12 10.59 7.705 6.295l-1.41 1.41L10.59 12l-4.295 4.295 1.41 1.41L12 13.41l4.295 4.295 1.41-1.41L13.41 12l4.295-4.295z"/></g></svg>
		<strong>Error { props.errorTitle }</strong></p>
		{ errorBody }
	</div>
}

class App extends React.Component {
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
					<a title="Help" href="https://apps.wordpress.com/google-docs/support/#add-site"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="0" fill="none" width="24" height="24"/><g><path d="M12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8m0-2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4 8c0-2.21-1.79-4-4-4s-4 1.79-4 4h2c0-1.103.897-2 2-2s2 .897 2 2-.897 2-2 2c-.552 0-1 .448-1 1v2h2v-1.14c1.722-.447 3-1.998 3-3.86zm-3 6h-2v2h2v-2z"/></g></svg></a>
				</div>
			</div>
		</div>
	}
}

ReactDOM.render( <App />, document.getElementById( 'container' ) );
