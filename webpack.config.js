module.exports = {
  entry: ['./handler.js' ],
  target: 'node',
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      include: __dirname,
      exclude: /node_modules/,
      query: {
        plugins: ['transform-runtime'],
        presets: ['es2015', 'stage-0']
      }
    }],
    devtool: 'source-map'
  },
  externals: {
    'aws-sdk': 'aws-sdk'
  }
};