const path = require('path')

module.exports = {
  entry: './app/packages/preload/index.js',
  module: {
    /* rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ] */
  },
  resolve: {
    extensions: ['.js']
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build')
  }
}
