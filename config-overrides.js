const { override, addWebpackAlias  } = require('customize-cra');
const { alias, configPaths} = require('react-app-rewire-alias');
const path = require('path')
const resolve = dir => path.join(__dirname, '.', dir)

const supportMjs = () => (webpackConfig) => {
  webpackConfig.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
  });
  return webpackConfig;
};

module.exports = override(
  supportMjs(),
  // alias(
  //   // {
  //   //   "@shared": './shared',
  //   //   "@shared/*": './shared/*',
  //   // }
  //   configPaths('./tsconfig.path.json')
  // ),
  // addWebpackAlias({
  //   "@shared": resolve('src/shared')
  // })
  // (config) => {
  //   config.resolve.alias = {
  //     ...config.resolve.alias,
  //     '@shared': resolve('src/shared')
  //   };
  //   return config;
  // }
);

