const path = require('path');

const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';

module.exports = {
    entry: {
        bundle: ['./src/main.js'],
    },
    resolve: {
        alias: {
            svelte: path.resolve('node_modules', 'svelte'),
        },
        extensions: ['.mjs', '.js', '.svelte'],
        mainFields: ['svelte', 'browser', 'module', 'main'],
    },
    output: {
        path: __dirname + '/docs',
        filename: '[name].js',
        chunkFilename: '[name].[id].js',
    },
    module: {
        rules: [
            {
                test: /\.svelte$/,
                use: {
                    loader: 'svelte-loader',
                    options: {
                        emitCss: true,
                        hotReload: true,
                    },
                },
            },
            {
                test: /\.css$/,
                use: [
                    /**
                     * MiniCssExtractPlugin doesn't support HMR.
                     * For developing, use 'style-loader' instead.
                     * */
                    'style-loader',
                    'css-loader',
                ],
            },
        ],
    },
    mode,
    plugins: [],
    devtool: prod ? false : 'source-map',
    devServer: {
        contentBase: path.join(__dirname, 'docs'),

        inline: true,
        port: 8016,
    },
    target: 'web',
    externals: [
        (context, request, callback) => {
            if (request.startsWith('_webpack_ignored_')) {
                return callback(null, 'commonjs2 ' + request);
            }
            callback();
        },
    ],
};
