import { query } from './connection.js'
import { mapUserRow } from './helpers.js'

export const findUserByUsername = async (username) => {
  const result = await query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username])
  return result.rows[0] ? mapUserRow(result.rows[0]) : null
}

export const findUserByEmail = async (email) => {
  const result = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email])
  return result.rows[0] ? mapUserRow(result.rows[0]) : null
}

export const createUser = async ({ id, username, passwordHash, email, role = 'user' }) => {
  const result = await query(
    `INSERT INTO users (id, username, password_hash, email, role, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING *`,
    [id, username, passwordHash, email, role],
  )

  return mapUserRow(result.rows[0])
}
