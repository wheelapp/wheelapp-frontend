const ElasticAPMSourceMapPlugin = require('@hypo808/elastic-apm-sourcemap-webpack-plugin');
const TTagPlugin = require('babel-plugin-ttag');
const withSass = require('@zeit/next-sass');
const withCss = require('@zeit/next-css');
const withTranspileModules = require('next-transpile-modules');
const webpack = require('webpack');
const env = require('./src/lib/env');
const withSourceMaps = require('@zeit/next-source-maps');

module.exports = withSourceMaps(
  withCss(
    withSass(
      withTranspileModules({
        // Next.js doesn't transpile node_modules content by default.
        // We have to do this manually to make IE 11 users happy.
        transpileModules: [
          '@sozialhelden/twelve-factor-dotenv',
          '@elastic/apm-rum-core',
          '@elastic/apm-rum',
          'dotenv',
        ],
        webpack: config => {
          config.node = {
            fs: 'empty',
            dgram: 'empty',
            net: 'empty',
            tls: 'empty',
            child_process: 'empty',
            async_hooks: 'mock',
            'elastic-apm-node': 'empty',
          };
          return config;
        },
      })
    )
  )
);
