export default ( props ) => {
	if ( ! props.msg ) {
		return null;
	}

	const errorMatch = props.msg.message.match( /"message":"(.*?)"}/ );
	let errorBody = <div>
		<p><code style={ { fontSize: '12px', wordWrap: 'break-word' } }>{ props.msg.message }</code></p>
		<p><a href="https://support.wordpress.com" target="_blank">Please report this error</a></p>
	</div>

	const errorHasMessage = ( msg ) => ( props.msg.message.indexOf( msg ) !== -1 )

	// Bit of sniffing
	if ( errorHasMessage( 'API calls to this blog have been disabled' ) ) {
		errorBody = <p>Jetpack JSON API has been disabled - please <a href="https://apps.wordpress.com/google-docs/support/#json-api" target="_blank">re-enable it</a> to continue posting.</p>
	} else if ( errorHasMessage( 'cURL error 28:' ) || errorHasMessage( 'Saving has timed out.' ) ) {
		errorBody = <p>Connection to your site timed out. Try again and/or investigate server load.</p>
	} else if ( errorHasMessage( '[-32700]' ) ) {
		errorBody = <p>Your site returned an unexpected response - are you <a href="https://apps.wordpress.com/google-docs/support/#other-plugins">running plugins</a> that may be causing a problem?</p>
	} else if ( errorHasMessage( 'HTTP status code was not 200' ) ) {
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
