export default ( { site, postType, onChoose } ) => {
	const postTypes = site.postTypes || []
	const postTypeName = postTypes.find( ( t ) => t.name === postType ).labels.singular_name

	let field = postTypeName
	if ( ! site.post ) {
		field = <select value={ postType } onChange={ onChoose }>
			{ postTypes.map( t => <option key={t.name} value={t.name}>{t.labels.singular_name}</option> ) }
		</select>
	}

	return <label>Post Type: { field }</label>
}
