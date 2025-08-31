module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Ensure module.rules exists
      if (!webpackConfig.module) {
        webpackConfig.module = { rules: [] };
      }

      // Find or create the source-map-loader rule
      let sourceMapRule = webpackConfig.module.rules.find(
        (rule) =>
          rule.enforce === 'pre' &&
          rule.loader &&
          rule.loader.includes('source-map-loader')
      );

      if (!sourceMapRule) {
        // Create a new rule with node_modules excluded
        sourceMapRule = {
          enforce: 'pre',
          test: /\.js$/,
          loader: 'source-map-loader',
          exclude: [/node_modules/],
        };
        webpackConfig.module.rules.push(sourceMapRule);
      } else {
        // Set exclude to node_modules
        sourceMapRule.exclude = [/node_modules/];
      }

      // Log for debugging
      console.log('Updated source-map-loader exclude:', sourceMapRule.exclude);

      // Remove deprecated devServer hooks and use setupMiddlewares
      if (webpackConfig.devServer) {
        delete webpackConfig.devServer.onAfterSetupMiddleware;
        delete webpackConfig.devServer.onBeforeSetupMiddleware;
        webpackConfig.devServer.setupMiddlewares = (middlewares, devServer) => {
          console.log('Middlewares setup complete');
          return middlewares;
        };
      }

      // Global warning filter
      webpackConfig.ignoreWarnings = [
        (warning) =>
          warning.message.includes('onAfterSetupMiddleware') ||
          warning.message.includes('onBeforeSetupMiddleware'),
      ];

      return webpackConfig;
    },
  },
};