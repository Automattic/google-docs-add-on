export default ( { tagChangeHandler, postTagsStr, taxonomies } ) => {
	if ( ! taxonomies.includes( 'post_tag' ) ) {
		return null;
	}

	return <div>
		<label>Tags<br />
		<input type="text" placeholder="Add tags, separate with commas…" onChange={ tagChangeHandler } value={ postTagsStr } /></label>
	</div>
}
