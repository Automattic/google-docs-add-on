/* global React */
import { deleteSite } from './services';
import PostButton from './post-button.jsx';
import CategoryInput from './category-input.jsx';

export default class Site extends React.Component {
	constructor( props ) {
		super( props );

		let postCategories = []
		if ( props.site.post && props.site.post.categories ) {
			postCategories = props.site.post.categories.map( ( c ) => c.name )
		}

		this.state = {
			post: props.site.post,
			postCategories: postCategories,
			postTags: ( props.site.post && props.site.post.tags ) ? props.site.post.tags : [],
		}
		this.addCategory = this.addCategory.bind( this )
		this.removeCategory = this.removeCategory.bind( this )
		this.setPost = this.setPost.bind( this )
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

	render() {
		const site = this.props.site
		const categories = site.categories || []
		const blavatar = ( site.info.icon && site.info.icon.img ) ? site.info.icon.img : 'https://secure.gravatar.com/blavatar/e6392390e3bcfadff3671c5a5653d95b'
		const previewLink = ( this.state.post ) ? <span className="sites-list__post-link"><a href={ this.state.post.URL }>Preview on { site.info.name }</a></span> : null;
		const removeSite = () => deleteSite( site.blog_id ).then( this.props.updateSiteList ).catch( this.props.errorHandler )

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
				<a className="sites-list__extended-toggle" href=""><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>Dropdown</title><rect x="0" fill="none" width="24" height="24"/><g><path d="M7 10l5 5 5-5"/></g></svg></a>
			</div>
			<div className="sites-list__extended">
				{ previewLink }
			</div>
			<div className="sites-extended">
				<div><label>
					<strong>Tags:</strong><br />
					<input placeholder="Add tags, separate with commas…" style={ { width: '100%' } } />
				</label></div>
				<div>
					<strong>Categories:</strong>
					<ul>
						{ categories.map( c => <CategoryInput key={ c.ID } category={ c } postCategories={ this.state.postCategories } addCategory={ this.addCategory } removeCategory={ this.removeCategory } /> ) }
					</ul>
				</div>
				<div>
					<a title="Remove site from this list" className="sites-list__delete-site" onClick={ removeSite }>Remove { site.info.name }<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="0" fill="none" width="24" height="24"/><g><path d="M17.705 7.705l-1.41-1.41L12 10.59 7.705 6.295l-1.41 1.41L10.59 12l-4.295 4.295 1.41 1.41L12 13.41l4.295 4.295 1.41-1.41L13.41 12l4.295-4.295z"/></g></svg></a>
				</div>
			</div>
		</li>
	}
}
