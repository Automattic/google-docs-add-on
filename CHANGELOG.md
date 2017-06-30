1.4.5
=====

* Fix a bug with Google Docs auto-inserted underline styling.
* Change posting timeout to 60 seconds

1.4.4
=====

* Fix a bug when an image doesn't have an alt description that was preventing images from uploading ([#80]https://github.com/Automattic/google-docs-add-on/issues/80))

1.4.3
=====

* Fix an issue that prevented uploading images that had funky alt descriptions (where "funky" means "lacking a file extension")
* Clean up the saving button so it looks nicer

1.4.2
=====

* Hide post types with `supports.exclude_from_external_editors`

1.4.1
=====

* Fix bug showing unsupported post types the first time existing sites are shown

1.4.0
=====

* Add support for post types on new posts

1.3.1
=====

* Use minified production bundles for React

1.3.0
=====

* Add support for categories and tags
* Fix bug when image URLs had non-alpha-numeric names ([#68](https://github.com/Automattic/google-docs-add-on/issues/68))

1.2.0
=====

* Rewrite UI in React
* Allow fully justified paragraphs
* Point support links to new support page

1.1.0
=====

* Add initial support for PositionedImages
* Fix bug stopping MS Edge users from adding sites
* Update help URLs
* Nicer error page when JSON API disabled
* Nicer errors on the add-on sidebar
* Nicer error page when someone denies permissions
* Support for HR element and paragraph alignment
* Change directory layout
* Attach images to blog posts