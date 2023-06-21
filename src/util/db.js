import Lowdb from 'lowdb'
import LocalStorage from 'lowdb/adapters/LocalStorage'

const db = new Lowdb(new LocalStorage('ewan_db'))

db.defaults({
  favorite: [],
  config: {}
}).write()

export default db
