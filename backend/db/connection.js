import { Pool } from 'pg'
import { config } from '../config.js'

const isLocalDatabase =
  config.databaseUrl.includes('localhost') || config.databaseUrl.includes('127.0.0.1')

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.nodeEnv === 'production' && !isLocalDatabase ? { rejectUnauthorized: false } : false,
})

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error)
})

export const query = (text, params = []) => pool.query(text, params)

export const withTransaction = async (callback) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const testConnection = async () => {
  await query('SELECT 1')
}
