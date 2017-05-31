export default ( { site, postType, onChoose } ) => {
	// Do not show anything if the post has been created
	if ( site.post ) {
		return null
	}

	const postTypes = site.postTypes || []

	if ( 1 === postTypes.length ) {
		onChoose( { target: { value: postTypes[0].name } } )
		return null
	}

	const postTypeObj = postTypes.find( ( t ) => t.name === postType )
	const postTypeName = postTypeObj && postTypeObj.labels && postTypeObj.labels.singular_name

	let field = postTypeName
	if ( ! site.post ) {
		field = <select value={ postType } onChange={ onChoose }>
			{ postTypes.map( t => <option key={t.name} value={t.name}>{t.labels.singular_name}</option> ) }
		</select>
	}

	return <div className="sites-list__post-type"><label>Post Type: { field }</label></div>
}
