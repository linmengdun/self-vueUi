const os = require('os')
const { join } = require('path')
const { db } = require('./util/db')
const pubsub = require('./pubsub')
const cwd = require('./connectors/cwd')

// Context passed to all resolvers (third argument)
// eslint-disable-next-line no-unused-vars
module.exports = ({ req } = {}) => {
  return {
    db,
    pubsub,
    cwd: cwd.get(),
    auth: req ? req.session.auth : {},
    homedir: join(os.homedir(), '.ewan-home')
  }
}
