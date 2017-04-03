/* global React */
import { postToWordPress } from './services';

export default class PostButton extends React.Component {
	constructor( props ) {
		super( props );
		this.state = {
			disabled: false,
			post: props.post
		};
		this.savePost = this.savePost.bind( this )
	}

	savePost() {
		this.setState( { disabled: true } )
		postToWordPress( this.props.site.blog_id )
			.then( ( post ) => {
				this.setState( { disabled: false } )
				this.setState( { post} )
				this.props.onPostSave( post )
			} )
			.catch( ( e ) => {
				this.props.errorHandler( e )
				this.setState( { disabled: false } )
			} )
	}

	render() {
		const buttonLabel = ( this.state.post ) ? 'Update' : 'Save';

		return <button className="sites-list__save-draft" disabled={ this.state.disabled } onClick={ this.savePost }>{ buttonLabel }</button>
	}
}
