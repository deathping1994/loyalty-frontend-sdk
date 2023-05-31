const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
    watch: true,
    entry: './src/index.js', // Entry point of your JavaScript code
    output: {
        path: path.resolve(__dirname, 'dist'), // Output directory
        filename: 'bundle.js' // Output filename
    },
    module: {
        rules: [
            {
                test: /\.html$/, // Match HTML files
                use: ['html-loader'] // Use html-loader to handle HTML files
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html', // Entry HTML file
            filename: 'index.html' // Output HTML filename
        }),
        new Dotenv()
    ]
};
