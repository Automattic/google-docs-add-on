var GasPlugin = require("gas-webpack-plugin");

module.exports = {
	entry: './src/code.js',
	output: {
		libraryTarget: 'this',
		filename: 'Code.js',
		path: './dist'
	},
	module: {
		loaders: [{
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
}
