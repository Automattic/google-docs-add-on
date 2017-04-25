export default ( { postType, postTypes, onChoose } ) => {
	return <label>
		Post Type:
		<select value={ postType } onChange={ onChoose }>
			{ postTypes.map( t => <option key={t.name} value={t.name}>{t.labels.singular_name}</option> ) }
		</select>
	</label>
}
