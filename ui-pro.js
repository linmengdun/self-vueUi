const shortid = require('shortid')
const server = require('vue-cli-plugin-apollo/graphql-server')

// Config
process.env.VUE_APP_CLI_UI_URL = ''

// Optimize express
// const nodeEnv = process.env.NODE_ENV
// process.env.NODE_ENV = 'development'

if (!process.env.VUE_CLI_IPC) {
  // Prevent IPC id conflicts
  process.env.VUE_CLI_IPC = `vue-cli-${shortid()}`
}

const opts = {
  port: 4000,
  graphqlPath: '/graphql',
  subscriptionsPath: '/graphql',
  enableMocks: false,
  enableEngine: false,
  cors: '*',
  timeout: 1000000,
  quiet: true,
  paths: {
    typeDefs: require.resolve('../gui/apollo-server/type-defs.js'),
    resolvers: require.resolve('../gui/apollo-server/resolvers.js'),
    context: require.resolve('../gui/apollo-server/context.js'),
    pubsub: require.resolve('../gui/apollo-server/pubsub.js'),
    server: require.resolve('../gui/apollo-server/server.js'),
    directives: require.resolve('../gui/apollo-server/directives.js')
  }
}

server(opts, () => {
  console.log('Server is running!')
})
