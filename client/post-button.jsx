/* global React, window */
import { postToWordPress } from './services';

const TIMEOUT_MS = 20000

const withTimeout = ( prom ) => {
	const timeoutPromise = new Promise( ( resolve, reject ) => {
		const fail = () => reject( { message: 'Saving has timed out.' } )
		window.setTimeout( fail, TIMEOUT_MS )
	} )

	return Promise.race( [prom, timeoutPromise] )
}

export default class PostButton extends React.Component {
	constructor( props ) {
		super( props );
		this.state = { disabled: false };
		this.savePost = this.savePost.bind( this )
	}

	savePost() {
		this.setState( { disabled: true } )
		withTimeout( postToWordPress( this.props.site.blog_id, {
			categories: this.props.postCategories,
			tags: this.props.postTags
		} ) )
			.then( ( post ) => {
				this.setState( { disabled: false } )
				this.props.onPostSave( post )
			} )
			.catch( ( e ) => {
				this.props.errorHandler( e )
				this.setState( { disabled: false } )
			} )
	}

	render() {
		const buttonLabel = ( this.props.site.post ) ? 'Update' : 'Save';

		return <button className="sites-list__save-draft" disabled={ this.state.disabled } onClick={ this.savePost }>{ buttonLabel }</button>
	}
}
