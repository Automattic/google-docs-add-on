var GasPlugin = require( 'gas-webpack-plugin' ),
	WrapperPlugin = require( 'wrapper-webpack-plugin' );


module.exports = [
	{
		entry: './server/code.js',
		output: {
			libraryTarget: 'this',
			filename: 'Code.js',
			path: './src'
		},
		module: {
			loaders: [ {
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			}],
			resolveLoader: {
				modulesDirectories: [ "server" ]
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
			path: './src'
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
