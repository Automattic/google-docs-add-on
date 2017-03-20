/* global window, document, google */
import React from 'react';
import ReactDOM from 'react-dom';

const Site = ( props ) => {
	let blavatar = 'https://secure.gravatar.com/blavatar/e6392390e3bcfadff3671c5a5653d95b'
	if ( props.info.icon && props.info.icon.img ) {
		blavatar = props.info.icon.img;
	}

	return <li>
		<div class="sites-list__blavatar">
			<img src={ blavatar } alt="" />
		</div>
		<div class="sites-list__sitename">
			<a class="sites-list__title" href={ props.blog_url }>{ props.info.name }<br />
			<em>{ props.blog_url }</em></a>
			<a title="Remove site from this list" class="sites-list__delete-site" data-blogid={ props.blog_id }><svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="0" fill="none" width="24" height="24"/><g><path d="M17.705 7.705l-1.41-1.41L12 10.59 7.705 6.295l-1.41 1.41L10.59 12l-4.295 4.295 1.41 1.41L12 13.41l4.295 4.295 1.41-1.41L13.41 12l4.295-4.295z"/></g></svg></a>
		</div>
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

render()
loadSites()
// let $ = require( 'jquery' );

// /**
//  * On document load, assign click handlers to each button and try to load the
//  * user's origin and destination language preferences if previously set.
//  */
// $( function() {
// 	loadSites();
// } );

// // reload every half hour to refresh the auth url
// window.setTimeout( function() { google.script.run.showSidebar() }, 1000 * 60 * 30 );

// function postToWordPress( el, forceOverwrite ) {
// 	var site_id = $( this ).attr( 'data-blogid' )
// 	this.disabled = true;
// 	google.script.run
// 		.withSuccessHandler( function( html, element ) {
// 			loadSites();
// 		} )
// 		.withFailureHandler( function( msg, element ) {
// 			showError( msg, '.sites-list', 'posting to WordPress' );
// 			element.disabled = false;
// 		} )
// 		.withUserObject( this )
// 		.postToWordPress( site_id, forceOverwrite );
// }

function loadSites() {
	google.script.run
		.withSuccessHandler( function( sites ) {
			if ( ! ( sites.length > 0 ) ) {
				google.script.run.showSidebar();
			}
			// var siteElements = sites.map( siteListItem ).join( '' )
			// var $siteList = $( '.sites-list ul' )
			// $siteList.html( siteElements )
			// $siteList.find( '.sites-list__save-draft' ).click( postToWordPress )
			// $siteList.find( '.sites-list__delete-site' ).click( deleteSite )
			render( sites )
		} )
		.withFailureHandler( function( msg, element ) {
			// showError( msg, $( '.sites-list' ), 'loading sites' );
		} )
		.withUserObject( this )
		.listSites();
}

// function deleteSite() {
// 	var site_id = $( this ).attr( 'data-blogid' )
// 	google.script.run
// 		.withSuccessHandler( function( html, element ) {
// 			loadSites();
// 		})
// 		.withFailureHandler( function( msg, element ) {
// 			showError( msg, $( '.sites-list' ), 'deleting a site' );
// 		})
// 		.withUserObject( this )
// 		.deleteSite( site_id );
// }

// function siteListItem( site ) {
// 	var blavatar = 'https://secure.gravatar.com/blavatar/e6392390e3bcfadff3671c5a5653d95b'
// 	if ( site.info.icon && site.info.icon.img ) {
// 		var blavatar = site.info.icon.img;
// 	}
// 	let template = '<li>' +
// 		'<div class="sites-list__blavatar">' +
// 			'<img src="' + blavatar + '" alt="" />' +
// 		'</div>' +
// 		'<div class="sites-list__sitename">' +
// 			'<a class="sites-list__title" href="' + site.blog_url + '">' + site.info.name +
// 			'<br><em>' + site.blog_url + '</em></a>' +
// 			'<a title="Remove site from this list" class="sites-list__delete-site" data-blogid="' + site.blog_id + '"><svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="0" fill="none" width="24" height="24"/><g><path d="M17.705 7.705l-1.41-1.41L12 10.59 7.705 6.295l-1.41 1.41L10.59 12l-4.295 4.295 1.41 1.41L12 13.41l4.295 4.295 1.41-1.41L13.41 12l4.295-4.295z"/></g></svg></a>' +
// 		'</div>';

// 	if ( site.post ) {
// 		template += '<button class="sites-list__save-draft" data-blogid="' + site.blog_id + '">Update Draft</button>';
// 	} else {
// 		template += '<button class="sites-list__save-draft" data-blogid="' + site.blog_id + '">Save Draft</button>';
// 	}

// 	if ( site.post ) {
// 		template += '<span class="sites-list__post-link"><a href="' + site.post.URL + '">Preview on ' + site.info.name + '</a></span>';
// 	}

// 	template += '</li>';
// 	return template;
// }

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
