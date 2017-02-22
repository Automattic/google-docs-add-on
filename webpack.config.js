var GasPlugin = require( 'gas-webpack-plugin' ),
	WrapperPlugin = require( 'wrapper-webpack-plugin' );


module.exports = [
	{
		entry: './src/code.js',
		output: {
			libraryTarget: 'this',
			filename: 'Code.js',
			path: './dist'
		},
		module: {
			loaders: [ {
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			}],
			resolveLoader: {
				modulesDirectories: [ "src" ]
			}
		},
		plugins: [
			new GasPlugin()
		]
	},
	{
		entry: './client/index.js',
		output: {
			filename: 'javascript.html',
			path: './dist'
		},
		plugins: [
			new WrapperPlugin( {
				header: '<script>',
				footer: '</script>'
			} )
		],
		externals: {
			// require("jquery") is external and available
			//  on the global var jQuery
			jquery: 'jQuery'
		}
	}
]
