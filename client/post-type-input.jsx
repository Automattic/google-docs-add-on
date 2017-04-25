export default PostTypeInput = ( { postType, postTypes, onChoose } ) => {
	const selectedValue = postTypes.find( t => t.name === postType )
	return <div>
		<label>
			Post Type:
			<select value={ selectedValue } onChange={ onChoose }>
				{ postTypes.map( t => <option key={t.name}>{t.labels.singular_name}</option> ) }
			</select>
		</label>
	</div>
}