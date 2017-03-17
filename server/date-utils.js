/*
 * From StackOverflow - http://stackoverflow.com/a/11820304
 * (cc) by-sa 3.0 mhawksey http://stackoverflow.com/users/1027723/mhawksey
 */
export function getDateFromIso( string ) {
	try {
		const aDate = new Date();
		const regexp = '([0-9]{4})(-([0-9]{2})(-([0-9]{2})' +
			'(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?' +
			'(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?';
		const d = string.match( new RegExp( regexp ) );

		let offset = 0;
		const date = new Date( d[ 1 ], 0, 1 );

		if ( d[ 3 ] ) {
			date.setMonth( d[ 3 ] - 1 );
		}
		if ( d[ 5 ] ) {
			date.setDate( d[ 5 ] );
		}
		if ( d[ 7 ] ) {
			date.setHours( d[ 7 ] );
		}
		if ( d[ 8 ] ) {
			date.setMinutes( d[ 8 ] );
		}
		if ( d[ 10 ] ) {
			date.setSeconds( d[ 10 ] );
		}
		if ( d[ 12 ] ) {
			date.setMilliseconds( Number( '0.' + d[ 12 ] ) * 1000 );
		}
		if ( d[ 14 ] ) {
			offset = ( Number( d[ 16 ] ) * 60 ) + Number( d[ 17 ] );
			offset *= ( ( d[ 15 ] === '-' ) ? 1 : -1 );
		}

		offset -= date.getTimezoneOffset();
		const time = ( Number( date ) + ( offset * 60 * 1000 ) );
		return aDate.setTime( Number( time ) );
	} catch ( e ) {
		return;
	}
}
