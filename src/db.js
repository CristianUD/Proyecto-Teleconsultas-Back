const { Pool } = require('pg')

const pool = new Pool({
    user: 'postgres',
    password: 'Postgre',
    host: 'localhost',
    port: 5432,
    database: 'Teleconsultas'
})

module.exports = pool