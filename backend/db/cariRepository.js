import { query } from './connection.js'
import {
  mapCariRow,
  mapDocumentRow,
  mapTransactionRow,
  formatDate,
  toNumber,
  normalizeBalance,
} from './helpers.js'

const cariSortFieldMap = {
  code: 'code',
  name: 'name',
  Ad: 'name',
  balance: 'balance',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
}

const attachRelations = async (cariRows) => {
  const caris = cariRows.map(mapCariRow)
  if (caris.length === 0) return caris

  const ids = caris.map((cari) => cari.id)
  const [documentsResult, transactionsResult] = await Promise.all([
    query(
      `SELECT * FROM documents
       WHERE cari_account_id = ANY($1::text[])
       ORDER BY upload_date DESC, created_at DESC`,
      [ids],
    ),
    query(
      `SELECT * FROM transactions
       WHERE cari_account_id = ANY($1::text[])
       ORDER BY date DESC, created_at DESC`,
      [ids],
    ),
  ])

  const cariMap = new Map(caris.map((cari) => [cari.id, cari]))

  documentsResult.rows.forEach((row) => {
    const cari = cariMap.get(row.cari_account_id)
    if (cari) {
      cari.documents.push(mapDocumentRow(row))
    }
  })

  transactionsResult.rows.forEach((row) => {
    const cari = cariMap.get(row.cari_account_id)
    if (cari) {
      cari.transactions.push(mapTransactionRow(row))
    }
  })

  return caris
}

const buildCariFilters = (filters = {}) => {
  const clauses = []
  const params = []

  if (filters.search) {
    params.push(`%${filters.search}%`)
    const index = params.length
    clauses.push(`(code ILIKE $${index} OR name ILIKE $${index})`)
  }

  if (filters.type) {
    params.push(filters.type)
    clauses.push(`type = $${params.length}`)
  }

  if (filters.balanceType) {
    params.push(filters.balanceType)
    clauses.push(`balance_type = $${params.length}`)
  }

  if (filters.onlyRisky === 'true' || filters.onlyRisky === true) {
    params.push(true)
    clauses.push(`is_risky = $${params.length}`)
  } else if (filters.onlyRisky === 'false' || filters.onlyRisky === false) {
    params.push(false)
    clauses.push(`is_risky = $${params.length}`)
  }

  return {
    whereClause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    params,
  }
}

const buildCariMutationValues = (payload) => ({
  code: payload.code,
  name: payload.name,
  type: payload.type,
  taxNo: payload.taxNo ?? null,
  taxOffice: payload.taxOffice ?? null,
  balance: normalizeBalance(payload.balance ?? 0),
  balanceType: payload.balanceType ?? 'Alacak',
  isRisky: payload.isRisky ?? false,
  phone: payload.phone ?? null,
  email: payload.email ?? null,
  address: payload.address ?? null,
  dueDate: payload.dueDate || null,
  nextPaymentDate: payload.nextPaymentDate || null,
  nextPaymentAmount:
    payload.nextPaymentAmount === undefined || payload.nextPaymentAmount === ''
      ? null
      : Math.abs(toNumber(payload.nextPaymentAmount, 0)),
  notes: payload.notes ?? null,
})

export const listCariAccounts = async ({
  filters = {},
  page = 1,
  limit = 50,
  sort = 'createdAt',
  order = 'desc',
} = {}) => {
  const { whereClause, params } = buildCariFilters(filters)
  const sortField = cariSortFieldMap[sort] || cariSortFieldMap.createdAt
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC'

  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM cari_accounts ${whereClause}`,
    params,
  )

  const offset = (page - 1) * limit
  const listParams = [...params, limit, offset]
  const rowsResult = await query(
    `SELECT * FROM cari_accounts
     ${whereClause}
     ORDER BY ${sortField} ${sortOrder}, code ASC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    listParams,
  )

  const items = await attachRelations(rowsResult.rows)
  const total = countResult.rows[0]?.total || 0

  return {
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  }
}

export const getCariAccountById = async (id) => {
  const cariResult = await query('SELECT * FROM cari_accounts WHERE id = $1', [id])
  const row = cariResult.rows[0]
  if (!row) return null

  const [cari] = await attachRelations([row])
  return cari
}

export const getCariAccountRowById = async (id) => {
  const result = await query('SELECT * FROM cari_accounts WHERE id = $1', [id])
  return result.rows[0] || null
}

export const findCariByCode = async (code) => {
  const result = await query('SELECT * FROM cari_accounts WHERE code = $1', [code])
  return result.rows[0] || null
}

export const createCariAccount = async ({ id, payload }) => {
  const values = buildCariMutationValues(payload)

  await query(
    `INSERT INTO cari_accounts (
      id, code, name, type, tax_no, tax_office, balance, balance_type,
      is_risky, phone, email, address, due_date, next_payment_date,
      next_payment_amount, notes, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8,
      $9, $10, $11, $12, $13, $14,
      $15, $16, NOW(), NOW()
    )`,
    [
      id,
      values.code,
      values.name,
      values.type,
      values.taxNo,
      values.taxOffice,
      values.balance,
      values.balanceType,
      values.isRisky,
      values.phone,
      values.email,
      values.address,
      values.dueDate,
      values.nextPaymentDate,
      values.nextPaymentAmount,
      values.notes,
    ],
  )

  return getCariAccountById(id)
}

export const updateCariAccount = async (id, payload) => {
  const existing = await getCariAccountRowById(id)
  if (!existing) return null

  const values = buildCariMutationValues({
    code: payload.code ?? existing.code,
    name: payload.name ?? existing.name,
    type: payload.type ?? existing.type,
    taxNo: payload.taxNo ?? existing.tax_no,
    taxOffice: payload.taxOffice ?? existing.tax_office,
    balance: normalizeBalance(payload.balance ?? existing.balance),
    balanceType: payload.balanceType ?? existing.balance_type,
    isRisky: payload.isRisky ?? existing.is_risky,
    phone: payload.phone ?? existing.phone,
    email: payload.email ?? existing.email,
    address: payload.address ?? existing.address,
    dueDate: payload.dueDate ?? formatDate(existing.due_date),
    nextPaymentDate: payload.nextPaymentDate ?? formatDate(existing.next_payment_date),
    nextPaymentAmount:
      payload.nextPaymentAmount !== undefined
        ? Math.abs(toNumber(payload.nextPaymentAmount, 0))
        : existing.next_payment_amount,
    notes: payload.notes ?? existing.notes,
  })

  await query(
    `UPDATE cari_accounts
     SET code = $2,
         name = $3,
         type = $4,
         tax_no = $5,
         tax_office = $6,
         balance = $7,
         balance_type = $8,
         is_risky = $9,
         phone = $10,
         email = $11,
         address = $12,
         due_date = $13,
         next_payment_date = $14,
         next_payment_amount = $15,
         notes = $16,
         updated_at = NOW()
     WHERE id = $1`,
    [
      id,
      values.code,
      values.name,
      values.type,
      values.taxNo,
      values.taxOffice,
      values.balance,
      values.balanceType,
      values.isRisky,
      values.phone,
      values.email,
      values.address,
      values.dueDate,
      values.nextPaymentDate,
      values.nextPaymentAmount,
      values.notes,
    ],
  )

  return getCariAccountById(id)
}

export const deleteCariAccount = async (id) => {
  const result = await query('DELETE FROM cari_accounts WHERE id = $1', [id])
  return result.rowCount > 0
}
