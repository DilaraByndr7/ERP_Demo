import { query } from './connection.js'
import { formatDate, mapTransactionRow } from './helpers.js'

const transactionSortFieldMap = {
  date: 't.date',
  amount: 't.amount',
  type: 't.type',
  status: 't.status',
  cariName: 'c.name',
}

export const createTransaction = async ({ cariId, transaction }) => {
  const result = await query(
    `INSERT INTO transactions (
      id, cari_account_id, type, date, amount, status, description, reference, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    RETURNING *`,
    [
      transaction.id,
      cariId,
      transaction.type,
      transaction.date,
      transaction.amount,
      transaction.status,
      transaction.description,
      transaction.reference,
    ],
  )

  return mapTransactionRow(result.rows[0])
}

export const updateTransaction = async (cariId, transactionId, payload) => {
  const existingResult = await query(
    'SELECT * FROM transactions WHERE cari_account_id = $1 AND id = $2',
    [cariId, transactionId],
  )
  const existing = existingResult.rows[0]
  if (!existing) return null

  const result = await query(
    `UPDATE transactions
     SET type = $3,
         date = $4,
         amount = $5,
         status = $6,
         description = $7,
         reference = $8,
         updated_at = NOW()
     WHERE cari_account_id = $1 AND id = $2
     RETURNING *`,
    [
      cariId,
      transactionId,
      payload.type ?? existing.type,
      payload.date ?? formatDate(existing.date),
      payload.amount ?? existing.amount,
      payload.status ?? existing.status,
      payload.description ?? existing.description,
      payload.reference ?? existing.reference,
    ],
  )

  return mapTransactionRow(result.rows[0])
}

export const deleteTransactionById = async (cariId, transactionId) => {
  const result = await query(
    'DELETE FROM transactions WHERE cari_account_id = $1 AND id = $2 RETURNING *',
    [cariId, transactionId],
  )
  return result.rows[0] ? mapTransactionRow(result.rows[0]) : null
}

export const listTransactions = async ({
  filters = {},
  page = 1,
  limit = 50,
  sort = 'date',
  order = 'desc',
} = {}) => {
  const clauses = []
  const params = []

  if (filters.search) {
    params.push(`%${filters.search}%`)
    const index = params.length
    clauses.push(
      `(t.reference ILIKE $${index} OR t.description ILIKE $${index} OR c.name ILIKE $${index} OR c.code ILIKE $${index})`,
    )
  }

  if (filters.type) {
    params.push(filters.type)
    clauses.push(`t.type = $${params.length}`)
  }

  if (filters.status) {
    params.push(filters.status)
    clauses.push(`t.status = $${params.length}`)
  }

  if (filters.cariId) {
    params.push(filters.cariId)
    clauses.push(`t.cari_account_id = $${params.length}`)
  }

  if (filters.startDate) {
    params.push(filters.startDate)
    clauses.push(`t.date >= $${params.length}`)
  }

  if (filters.endDate) {
    params.push(filters.endDate)
    clauses.push(`t.date <= $${params.length}`)
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : ''
  const sortField = transactionSortFieldMap[sort] || transactionSortFieldMap.date
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC'

  const countResult = await query(
    `SELECT COUNT(*)::int AS total
     FROM transactions t
     JOIN cari_accounts c ON c.id = t.cari_account_id
     ${whereClause}`,
    params,
  )

  const offset = (page - 1) * limit
  const listParams = [...params, limit, offset]
  const rowsResult = await query(
    `SELECT
        t.*,
        c.id AS cari_id,
        c.name AS cari_name,
        c.code AS cari_code
     FROM transactions t
     JOIN cari_accounts c ON c.id = t.cari_account_id
     ${whereClause}
     ORDER BY ${sortField} ${sortOrder}, t.created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    listParams,
  )

  const data = rowsResult.rows.map((row) => ({
    ...mapTransactionRow(row),
    cariId: row.cari_id,
    cariName: row.cari_name,
    cariCode: row.cari_code,
  }))

  const total = countResult.rows[0]?.total || 0

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  }
}
