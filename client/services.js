/* global google, window */
import Promise from 'promise-polyfill';

if ( ! window.Promise ) {
	window.Promise = Promise;
}

export function loadSites() {
	return new Promise( ( resolve, reject ) => {
		google.script.run
			.withSuccessHandler( resolve )
			.withFailureHandler( reject )
			.listSites();
	} )
}

export function postToWordPress( blogId ) {
	return new Promise( ( resolve, reject ) => {
		google.script.run
			.withSuccessHandler( resolve )
			.withFailureHandler( reject )
			.postToWordPress( blogId );
	} )
}

export function deleteSite( blogId ) {
	return new Promise( ( resolve, reject ) => {
		google.script.run
			.withSuccessHandler( resolve )
			.withFailureHandler( reject )
			.deleteSite( blogId );
	} )
}

export function getAuthUrl() {
	return new Promise( ( resolve, reject ) => {
		google.script.run
			.withSuccessHandler( resolve )
			.withFailureHandler( reject )
			.getAuthUrl();
	} )
}
