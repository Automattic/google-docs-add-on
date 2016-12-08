module.exports = {
	entry: './src/index.js',
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
	}
}
