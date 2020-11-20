const CategoryInput = ( { categoryName, postCategories, addCategory, removeCategory } ) => {
	const checked = ( -1 !== postCategories.indexOf( categoryName ) )
	const changeHandler = ( { target } ) => {
		if ( target.checked ) {
			addCategory( categoryName )
		} else {
			removeCategory( categoryName )
		}
	}

	return <li><label><input type="checkbox" checked={ checked } onChange={ changeHandler } /> { categoryName }</label></li>
}

export default ( { categories, postCategories, onAddCategory, onRemoveCategory, taxonomies } ) => {
	if ( ! taxonomies.includes( 'category' ) ) {
		return null;
	}

	return <div>
		<span>Categories</span><br />
		<ul>
			{ categories.map( c => <CategoryInput
				key={ c.ID }
				categoryName={ c.name }
				postCategories={ postCategories }
				addCategory={ onAddCategory }
				removeCategory={ onRemoveCategory } /> ) }
		</ul>
	</div>
}
