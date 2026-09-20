const webpack = require('webpack');

module.exports = function override(config) {

    const fallback = config.resolve.fallback || {};

    Object.assign(fallback, {
        fs: false,
        path: require.resolve("path-browserify"),
        util: require.resolve("util/"),
        child_process: false,
        os: require.resolve("os-browserify/browser"),
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer"),
        process: require.resolve("process/browser.js")
    });

    config.resolve.fallback = fallback;

    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: "process/browser.js",
            Buffer: ["buffer", "Buffer"]
        })
    ]);

    config.resolve.extensions = [
        ...config.resolve.extensions,
        ".js",
        ".jsx",
        ".ts",
        ".tsx"
    ];

    return config;
};