export default ( { site, postType, onChoose } ) => {
	const postTypes = site.postTypes || []
	const postTypeObj = postTypes.find( ( t ) => t.name === postType )
	const postTypeName = postTypeObj && postTypeObj.labels && postTypeObj.labels.singular_name

	let field = postTypeName
	if ( ! site.post ) {
		field = <select value={ postType } onChange={ onChoose }>
			{ postTypes.map( t => <option key={t.name} value={t.name}>{t.labels.singular_name}</option> ) }
		</select>
	}

	return <label>Post Type: { field }</label>
}
