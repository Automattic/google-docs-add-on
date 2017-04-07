/* global React */

export default class TagInput extends React.Component {
	constructor( props ) {
		super( props )
		this.state = {
			value: ''
		}
		this.changeHandler = this.changeHandler.bind( this )
	}

	changeHandler( event ) {
		const matches = event.target.value.match( /^(.*)\s?,$/ )
		if ( matches ) {
			this.props.addTagToPost( this.state.value )
			this.setState( { value: '' } )
		} else {
			this.setState( { value: event.target.value } );
		}
	}

	render() {
		return <span>
			<input type="text" placeholder="Add tags, separate with commas…" onChange={ this.changeHandler } value={ this.state.value } />
		</span>
	}
}
