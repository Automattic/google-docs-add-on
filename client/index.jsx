/* global window, document, google, React, ReactDOM,  */
import { loadSites, deleteSite, postToWordPress } from './services';

class PostButton extends React.Component {
	constructor( props ) {
		super( props );
		this.state = {
			disabled: props.disabled,
			post: props.post
		};
		this.savePost = this.savePost.bind( this )
	}

	savePost() {
		this.setState( { disabled: true } )
		postToWordPress( this.props.blog_id )
			.then( ( post ) => {
				this.setState( { disabled: null } )
				this.setState( { post } )
			} )
			.catch( () => {
				// TODO error handling
				this.setState( { disabled: null } )
			} )
	}

	render() {
		const buttonLabel = ( this.props.post ) ? 'Update Draft' : 'Save Draft';

		return <button className="sites-list__save-draft" disabled={ this.state.disabled } onClick={ this.savePost }>{ buttonLabel }</button>
	}
}

const Site = ( site ) => {
	const blavatar = ( site.info.icon && site.info.icon.img ) ? site.info.icon.img : 'https://secure.gravatar.com/blavatar/e6392390e3bcfadff3671c5a5653d95b'
	const previewLink = ( site.post ) ? <span className="sites-list__post-link"><a href={ site.post.URL }>Preview on { site.info.name }</a></span> : null;
	const removeSite = () => deleteSite( site.blog_id ).then( reloadSites )


	return <li key={ site.blog_id }>
		<div className="sites-list__blavatar">
			<img src={ blavatar } alt="" />
		</div>
		<div className="sites-list__sitename">
			<a className="sites-list__title" href={ site.blog_url }>{ site.info.name }<br />
			<em>{ site.blog_url }</em></a>
			<a title="Remove site from this list" className="sites-list__delete-site" onClick={ removeSite }><svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="0" fill="none" width="24" height="24"/><g><path d="M17.705 7.705l-1.41-1.41L12 10.59 7.705 6.295l-1.41 1.41L10.59 12l-4.295 4.295 1.41 1.41L12 13.41l4.295 4.295 1.41-1.41L13.41 12l4.295-4.295z"/></g></svg></a>
		</div>
		<PostButton {...site} />

		{ previewLink }
	</li>
}

const SiteList = ( props ) => {
	if ( ! props.sites ) {
		return <h1>Loading…</h1>
	}

	return <ul>
		{ props.sites.map( Site ) }
	</ul>
}

function render( sites ) {
	ReactDOM.render(
		<SiteList sites={sites} />,
		document.getElementById( 'sites-list' )
	);
}

function reloadSites() {
	return loadSites()
	.then( ( sites ) => {
		// TODO merge needsOauth.html with this
		if ( ! ( sites.length > 0 ) ) {
			google.script.run.showSidebar();
		}
		render( sites )
	} )
}

render()
reloadSites()

// reload every half hour to refresh the auth url
const reload = google.script.run.showSidebar.bind( google.script.run );
window.setTimeout( reload, 1000 * 60 * 30 );

// /**
//  * Inserts a div that contains an error message after a given element.
//  *
//  * @param msg The error message to display.
//  * @param element The element after which to display the error.
//  */
// function showError( msg, element, errorTitle ) {
// 	var error = '<strong>Error ' + errorTitle + '</strong></p>';
// 	var errorMatch = msg.message.match( /"message":"(.*?)"}/ );

// 	// Bit of sniffing
// 	if ( msg.message.indexOf( 'API calls to this blog have been disabled' ) !== -1 ) {
// 		error += '<p>Jetpack JSON API has been disabled - please <a href="https://apps.wordpress.com/google-docs/support/#json-api" target="_blank">re-enable it</a> to continue posting.</p>';
// 	} else if ( msg.message.indexOf( 'cURL error 28:' ) !== -1 ) {
// 		error += '<p>Connection to your site timed out. Try again and/or investigate server load.</p>';
// 	} else if ( msg.message.indexOf( '[-32700]' ) !== -1 ) {
// 		error += '<p>Your site returned an unexpected response - are you <a href="https://apps.wordpress.com/google-docs/support/#other-plugins">running plugins</a> that may be causing a problem?</p>';
// 	} else if ( msg.message.indexOf( 'HTTP status code was not 200' ) !== -1 ) {
// 		error += '<p>Your server returned an unexpected response. This could be a misconfiguration, a bad plugin, or something may be broken. <a href="https://apps.wordpress.com/google-docs/support/#unexpected-response">Don\'t panic yet though!</a></p>';
// 	} else if ( errorMatch && errorMatch.length > 0 ) {
// 		error += '<p>' + errorMatch[ 1 ] + '</p>';
// 	} else {
// 		error += '<p><code style="font-size: 12px; word-wrap: break-word">' + msg.message + '</code></p>';
// 		error += '<p><a href="https://support.wordpress.com" target="_blank">Please report this error</p>';
// 	}

// 	console.error( msg );
// 	var div = $( '<div class="error" style="margin: 0px 6px; position: relative"><p><svg style="cursor: pointer; position: absolute; right: 5px; top: 12px" width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="0" fill="none" width="24" height="24"/><g><path d="M17.705 7.705l-1.41-1.41L12 10.59 7.705 6.295l-1.41 1.41L10.59 12l-4.295 4.295 1.41 1.41L12 13.41l4.295 4.295 1.41-1.41L13.41 12l4.295-4.295z"/></g></svg>' + error + '</div>' );
// 	$( div ).find( 'svg' ).click( function() {
// 		$( this ).closest( 'div.error' ).remove();
// 	} )
// 	$( element ).after( div );
// }
