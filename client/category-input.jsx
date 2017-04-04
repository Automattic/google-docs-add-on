export default ( props ) => {
	const { category } = props
	const { checked } = ( -1 !== props.postCategories.indexOf( category.name ) )
	const changeHandler = ( { target } ) => {
		if ( target.checked ) {
			props.addCategory( props.category.name )
		} else {
			props.removeCategory( props.category.name )
		}
	}

	return <li><label><input type="checkbox" checked={ checked } onChange={ changeHandler } /> { category.name }</label></li>
}
