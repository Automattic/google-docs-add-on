/* global React */
import PostButton from './post-button.jsx'
import CategoryInput from './category-input.jsx'
import PostTypeInput from './post-type-input.jsx'
import TagInput from './tag-input.jsx'

export default class Site extends React.Component {
	constructor( props ) {
		super( props );
		const { post } = props.site
		const postTags = ( post && post.tags ) ? post.tags : []

		const defaultPostType = ( props.site.postTypes && props.site.postTypes.length > 0 )
			? props.site.postTypes[0].name
			: 'post'

		this.state = {
			optionsExpanded: !! post,
			siteRefreshing: false,
			postCategories: ( post && post.categories ) ? post.categories : [],
			postTags,
			postTagsStr: postTags.join( ', ' ),
			postType: ( post && post.type ) ? post.type : defaultPostType
		}
		this.toggleOptions = this.toggleOptions.bind( this )
		this.updateSite = this.updateSite.bind( this )
		this.categorizePost = this.categorizePost.bind( this )
		this.uncategorizePost = this.uncategorizePost.bind( this )
		this.tagChangeHandler = this.tagChangeHandler.bind( this )
		this.postTypeChangeHandler = this.postTypeChangeHandler.bind( this )
	}

	componentDidMount() {
		if ( ! this.props.site.categories || this.props.site.categories.length < 1 ) {
			this.updateSite()
		}
		if ( ! this.props.site.postTypes || this.props.site.postTypes.length < 1 ) {
			this.updateSite()
		}
	}

	toggleOptions() {
		this.setState( { optionsExpanded: ! this.state.optionsExpanded } )
	}

	updateSite() {
		this.setState( { siteRefreshing: true } )
		return this.props.refreshSite()
			.then( () => this.setState( { siteRefreshing: false } ) )
			.catch( () => this.setState( { siteRefreshing: false } ) )
	}

	/**
	 * @param {String} category name of the category
	 */
	categorizePost( category ) {
		if ( -1 === this.state.postCategories.indexOf( category ) ) {
			this.setState( {
				postCategories: [ ...this.state.postCategories, category ]
			} )
		}
	}

	/**
	 * @param {String} category name of the category
	 */
	uncategorizePost( category ) {
		const index = this.state.postCategories.indexOf( category );
		if ( -1 !== index ) {
			const postCategories = [
				...this.state.postCategories.slice( 0, index ),
				...this.state.postCategories.slice( index + 1 )
			];
			this.setState( { postCategories } )
		}
	}

	tagChangeHandler( event ) {
		const postTagsStr = event.target.value
		this.setState( {
			postTags: postTagsStr.split( /\s*,\s*/ ),
			postTagsStr
		} )
	}

	postTypeChangeHandler( event ) {
		this.setState( { postType: event.target.value } )
	}

	render() {
		const site = this.props.site
		const { post } = site
		const hasBeenPosted = !! post
		const categories = site.categories || []
		const postTypes = site.postTypes || []
		const blavatar = ( site.info.icon && site.info.icon.img ) ? site.info.icon.img : 'https://secure.gravatar.com/blavatar/e6392390e3bcfadff3671c5a5653d95b'
		const previewLink = ( hasBeenPosted ) ? <span className="sites-list__post-link"><a href={ post.URL }>Preview on { site.info.name }</a></span> : null;
		const extendedStyle = ( ! this.state.optionsExpanded ) ? { display: 'none' } : {}
		const extendedToggled = ( ! this.state.optionsExpanded ) ? 'sites-list__extended-toggle' : 'sites-list__extended-toggle is-toggled'
		const refreshClasses = 'sites-list__update-site' + ( this.state.siteRefreshing ? ' sites-list__update-site--updating' : '' )
		const selectedPostType = postTypes.find( ( t => t.name === this.state.postType ) )
		const taxonomies = ( selectedPostType && selectedPostType.taxonomies ) || []

		return <li>
			<div className="sites-list__basic">
				<div className="sites-list__blavatar">
					<img src={ blavatar } alt="" />
				</div>
				<div className="sites-list__sitename">
					<a className="sites-list__title" href={ site.blog_url }>{ site.info.name }<br />
					<em>{ site.blog_url }</em></a>
				</div>
				<PostButton site={ site } onPostSave={ this.props.setPost } postTags={ this.state.postTags} postCategories={ this.state.postCategories } postType={ this.state.postType } errorHandler={ this.props.errorHandler } />
				<a className={ extendedToggled } onClick={ this.toggleOptions }><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>Dropdown</title><rect x="0" fill="none" width="24" height="24"/><g><path d="M7 10l5 5 5-5"/></g></svg></a>
			</div>
			<div className="sites-list__preview">
				{ previewLink }
				<PostTypeInput site={ site } postType={ this.state.postType } onChoose={ this.postTypeChangeHandler } />
			</div>
			<div className="sites-list__extended" style={ extendedStyle }>
				<h4>Post Settings <span>(<a title="Update site information" className={ refreshClasses } onClick={ this.updateSite }><svg height="24" width="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M17.91 14c-.478 2.833-2.943 5-5.91 5-3.308 0-6-2.692-6-6s2.692-6 6-6h2.172l-2.086 2.086L13.5 10.5 18 6l-4.5-4.5-1.414 1.414L14.172 5H12c-4.418 0-8 3.582-8 8s3.582 8 8 8c4.08 0 7.438-3.055 7.93-7h-2.02z"></path></g></svg> Refresh</a>)</span></h4>
				<TagInput tagChangeHandler={ this.tagChangeHandler } postTagsStr={ this.state.postTagsStr } taxonomies={ taxonomies } />
				<CategoryInput categories={ categories } postCategories={ this.state.postCategories } onAddCategory={ this.categorizePost } onRemoveCategory={ this.uncategorizePost } taxonomies={ taxonomies } />
				<div>
					<a href="#" title="Remove site from this list" className="sites-list__delete-site" onClick={ this.props.removeSite }>Remove { site.info.name } <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>Trash</title><rect x="0" fill="none" width="24" height="24"/><g><path d="M6.187 8h11.625l-.695 11.125C17.05 20.18 16.177 21 15.12 21H8.88c-1.057 0-1.93-.82-1.997-1.875L6.187 8zM19 5v2H5V5h3V4c0-1.105.895-2 2-2h4c1.105 0 2 .895 2 2v1h3zm-9 0h4V4h-4v1z"/></g></svg></a>
				</div>
			</div>
		</li>
	}
}
