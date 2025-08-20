module.exports = {
  webpack: {
    configure: (webpackConfig) => {

      // Remove the 'source-map-loader' rule for 'react-datepicker'
      // to prevent issues with source maps in the development environment
      const sourceMapRule = webpackConfig.module.rules.find((rule) =>
        rule.oneOf
      ).oneOf.find((r) => r.enforce === "pre" && r.loader && r.loader.includes("source-map-loader"));

      if (sourceMapRule) {
        sourceMapRule.exclude = [
          ...(sourceMapRule.exclude || []),
          /node_modules\/react-datepicker/
        ];
      }

      // Remove the 'onAfterSetupMiddleware' and 'onBeforeSetupMiddleware' hooks
      // from the devServer configuration if they exist
      if (webpackConfig.devServer) {
        delete webpackConfig.devServer.onAfterSetupMiddleware;
        delete webpackConfig.devServer.onBeforeSetupMiddleware;
        webpackConfig.devServer.setupMiddlewares = (middlewares, devServer) => {
          console.log('Middlewares setup complete');
          return middlewares;
        };
      }

      return webpackConfig;
    },
  },
};