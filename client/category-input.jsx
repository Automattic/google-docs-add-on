export default class CategoryInput extends React.Component {
	constructor( props ) {
		super( props )
		this.state = {
			checked: props.postCategories.includes( props.category )
		}
		this.changeHandler = this.changeHandler.bind( this )
	}

	changeHandler( { target } ) {
		if ( target.checked ) {
			this.props.addCategory()
			this.setState( { checked: true } )
		} else {
			this.props.removeCategory()
			this.setState( { checked: false } )
		}
	}

	render() {
		const { checked } = this.state
		const { category } = this.props

		return <li><label><input type="checkbox" checked={ checked } onChange={ this.changeHandler } /> { category.name }</label></li>
	}
}