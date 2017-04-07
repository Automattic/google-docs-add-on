/* global React */

export default class TagInput extends React.Component {
	constructor( props ) {
		super( props )
		this.state = {
			value: ''
		}
		this.changeHandler = this.changeHandler.bind( this )
		this.addTag = this.addTag.bind( this )
	}

	changeHandler( event ) {
		this.setState( { value: event.target.value } );
	}

	addTag() {
		this.props.addTagToPost( this.state.value )
		this.setState( { value: '' } )
	}

	render() {
		return <span>
			<input type="text" placeholder="Add tags, separate with commas…" onChange={ this.changeHandler } value={ this.state.value } />
			<input type="button" onClick={ this.addTag } value="Add Tag" />
		</span>
	}
}
