const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
    mode: "development",
    entry: {
        index: './assets/js/index.js',
        home: './assets/js/home.js'
    },
    output: {
        path: path.resolve(__dirname, './dist/'),
        filename: '[name].bundle.js',
    },
    plugins:[
        //extract css
        new MiniCssExtractPlugin({
        filename: "[name].css",
        chunkFilename: "[id].css",
      }),
    ],
    module: {
      rules: [
        {
            test: /\.css$/,
            use: [
                MiniCssExtractPlugin.loader,
                'css-loader'
            ],
        },
        {
          test: /\.scss$/,
          use: [
            'style-loader',
            'css-loader',
            'sass-loader'
          ]
        },
        {
            test: /\.m?js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', { targets: "defaults" }]
                ]
              }
            }
        },
      ],
    },
    optimization: {
      // minimizer: [
      //   new CssMinimizerPlugin(),
      //   //new TerserPlugin(),
      //   new MiniCssExtractPlugin({
      //     filename: "[name].css",
      //     chunkFilename: "[id].css"
      //   }),
      // ],
    }
  };