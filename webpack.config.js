var webpack = require( 'webpack' ),
	GasPlugin = require( 'gas-webpack-plugin' ),
	WrapperPlugin = require( 'wrapper-webpack-plugin' );

module.exports = [
	{
		entry: './src/server/code.js',
		output: {
			libraryTarget: 'this',
			filename: 'Code.js',
			path: './dist'
		},
		module: {
			loaders: [ {
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				query: {
					presets: [ 'es2015' ],
					plugins: [
						'transform-runtime',
						'transform-es3-property-literals',
						'transform-es3-member-expression-literals'
					]
				}
			}],
			resolveLoader: { modulesDirectories: [ 'server' ] }
		},
		plugins: [ new GasPlugin() ]
	},
	{
		entry: './src/client/index.jsx',
		output: {
			filename: 'javascript.html',
			path: './dist'
		},
		module: {
			loaders: [ {
				test: /\.js[x]?$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				query: {
					presets: [ 'react', 'es2015' ]
				}
			} ],
			resolveLoader: { modulesDirectories: [ 'client' ] }
		},
		plugins: [
			new webpack.optimize.UglifyJsPlugin( { test: [ /\.js($|\?)/i, /\.html$/i ] } ),
			new WrapperPlugin( { header: '<script>', footer: '</script>' } ),
		]
	}
]
