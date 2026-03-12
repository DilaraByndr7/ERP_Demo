import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { pool, testConnection } from '../db/connection.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const run = async () => {
  try {
    await testConnection()

    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql')
    const schemaSql = await fs.readFile(schemaPath, 'utf8')

    await pool.query(schemaSql)
    console.log('PostgreSQL schema hazır.')
  } catch (error) {
    console.error('Schema oluşturulamadı:', error)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

run()
