const { Pool, Client } = require('pg')
const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'examen',
  password: 'postgres',
  port: 5432,
})
pool.query('SELECT NOW()', (err, res) => {
  console.log(err, res)
  pool.end()
})
