/* global React */
import { deleteSite } from './services';
import PostButton from './post-button.jsx';
import CategoryInput from './category-input.jsx';

export default class Site extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			post: props.site.post,
			optionsExpanded: !! props.site.post,
			postCategories: ( props.site.post && props.site.post.categories ) ? props.site.post.categories : [],
			postTags: ( props.site.post && props.site.post.tags ) ? props.site.post.tags : [],
		}
		this.addCategory = this.addCategory.bind( this )
		this.removeCategory = this.removeCategory.bind( this )
		this.setPost = this.setPost.bind( this )
		this.toggleOptions = this.toggleOptions.bind( this )
	}

	/**
	 * @param {String} category name of the category
	 */
	addCategory( category ) {
		if ( -1 === this.state.postCategories.indexOf( category ) ) {
			this.setState( {
				postCategories: [ ...this.state.postCategories, category ]
			} )
		}
	}

	/**
	 * @param {String} category name of the category
	 */
	removeCategory( category ) {
		const index = this.state.postCategories.indexOf( category );
		if ( -1 !== index ) {
			const postCategories = [
				...this.state.postCategories.slice( 0, index ),
				...this.state.postCategories.slice( index + 1 )
			];
			this.setState( { postCategories } )
		}
	}

	setPost( post ) {
		this.setState( { post } )
	}

	toggleOptions() {
		this.setState( { optionsExpanded: ! this.state.optionsExpanded } )
	}

	render() {
		const site = this.props.site
		const categories = site.categories || []
		const blavatar = ( site.info.icon && site.info.icon.img ) ? site.info.icon.img : 'https://secure.gravatar.com/blavatar/e6392390e3bcfadff3671c5a5653d95b'
		const previewLink = ( this.state.post ) ? <span className="sites-list__post-link"><a href={ this.state.post.URL }>Preview on { site.info.name }</a></span> : null;
		const removeSite = () => deleteSite( site.blog_id ).then( this.props.updateSiteList ).catch( this.props.errorHandler )
		const extendedStyle = ( ! this.state.optionsExpanded ) ? { display: 'none' } : {}
		const extendedToggled = ( ! this.state.optionsExpanded ) ? 'sites-list__extended-toggle' : 'sites-list__extended-toggle is-toggled'

		return <li>
			<div className="sites-list__basic">
				<div className="sites-list__blavatar">
					<img src={ blavatar } alt="" />
				</div>
				<div className="sites-list__sitename">
					<a className="sites-list__title" href={ site.blog_url }>{ site.info.name }<br />
					<em>{ site.blog_url }</em></a>
				</div>
				<PostButton site={ site } { ...this.state } onPostSave={ this.setPost } errorHandler={ this.props.errorHandler } />
				<a className={ extendedToggled } onClick={ this.toggleOptions }><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>Dropdown</title><rect x="0" fill="none" width="24" height="24"/><g><path d="M7 10l5 5 5-5"/></g></svg></a>
			</div>
			<div className="sites-list__preview">
				{ previewLink }
			</div>
			<div className="sites-list__extended" style={ extendedStyle }>
				<h4>Post Settings</h4>
				<div><label>
					<p><label>Tags<br />
					<input placeholder="Add tags, separate with commas…" /></label></p>
				</label></div>
				<div>
					<p>Categories</p>
					<ul>
						{ categories.map( c => <CategoryInput key={ c.ID } category={ c } postCategories={ this.state.postCategories } addCategory={ this.addCategory } removeCategory={ this.removeCategory } /> ) }
					</ul>
				</div>
				<div>
					<a title="Remove site from this list" className="sites-list__delete-site" onClick={ removeSite }>Remove { site.info.name } <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>Trash</title><rect x="0" fill="none" width="24" height="24"/><g><path d="M6.187 8h11.625l-.695 11.125C17.05 20.18 16.177 21 15.12 21H8.88c-1.057 0-1.93-.82-1.997-1.875L6.187 8zM19 5v2H5V5h3V4c0-1.105.895-2 2-2h4c1.105 0 2 .895 2 2v1h3zm-9 0h4V4h-4v1z"/></g></svg></a>
				</div>
			</div>
		</li>
	}
}
