module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? 'static/'
    : '/',
  pluginOptions: {
    apollo: {
      enableMocks: false,
      enableEngine: false,
      lintGQL: false
    },
    graphqlMock: false,
    apolloEngine: false,
    graphqlTimeout: 1000000
  },

  configureWebpack: {
    resolve: {
      symlinks: false
    }
  },

  css: {
    loaderOptions: {
      stylus: {
        stylusOptions: {
          import: ['~@/style/imports']
        }
      }
    }
  },
  parallel: !process.env.CIRCLECI
}
