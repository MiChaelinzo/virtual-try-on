const webpack = require('webpack');

module.exports = {
  // your existing webpack configuration goes here
  
  resolve: {
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "fs": false
    }
  },
  
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
};
