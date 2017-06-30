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

export function postToWordPress( blogId, extraFields = {} ) {
	return new Promise( ( resolve, reject ) => {
		google.script.run
			.withSuccessHandler( resolve )
			.withFailureHandler( reject )
			.postToWordPress( blogId, extraFields );
	} )
}

export function refreshSite( blogId ) {
	return new Promise( ( resolve, reject ) => {
		google.script.run
			.withSuccessHandler( resolve )
			.withFailureHandler( reject )
			.refreshSite( blogId );
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

export function unlinkPost( blogId ) {
	return new Promise( ( resolve, reject ) => {
		google.script.run
			.withSuccessHandler( resolve )
			.withFailureHandler( reject )
			.unlinkPost( blogId );
	} )
}