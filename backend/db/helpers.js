

export const formatDate = (value) => {
  if (!value) return null
  if (value instanceof Date) return value.toISOString().split('T')[0]
  return String(value).split('T')[0]
}

export const formatDateTime = (value) => {
  if (!value) return null
  if (value instanceof Date) return value.toISOString()
  return new Date(value).toISOString()
}

export const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === '') {
    return fallback
  }
  const parsed = Number(value)
  return Number.isNaN(parsed) ? fallback : parsed
}

export const normalizeBalance = (value) => Math.abs(toNumber(value))

export const mapCariRow = (row) => ({
  id: row.id,
  code: row.code,
  name: row.name,
  type: row.type,
  taxNo: row.tax_no,
  taxOffice: row.tax_office,
  balance: normalizeBalance(row.balance),
  balanceType: row.balance_type || (toNumber(row.balance) < 0 ? 'Borç' : 'Alacak'),
  isRisky: row.is_risky,
  phone: row.phone,
  email: row.email,
  address: row.address,
  dueDate: formatDate(row.due_date),
  nextPaymentDate: formatDate(row.next_payment_date),
  nextPaymentAmount:
    row.next_payment_amount === null || row.next_payment_amount === undefined
      ? null
      : Math.abs(toNumber(row.next_payment_amount)),
  notes: row.notes,
  createdAt: formatDateTime(row.created_at),
  updatedAt: formatDateTime(row.updated_at),
  documents: [],
  transactions: [],
})

export const mapDocumentRow = (row) => ({
  id: row.id,
  name: row.name,
  type: row.type,
  uploadDate: formatDate(row.upload_date),
  fileUrl: row.file_url,
  fileSize:
    row.file_size === null || row.file_size === undefined ? null : toNumber(row.file_size, null),
  originalName: row.original_name,
})

export const mapTransactionRow = (row) => ({
  id: row.id,
  type: row.type,
  date: formatDate(row.date),
  amount: toNumber(row.amount),
  status: row.status,
  description: row.description,
  reference: row.reference,
})

export const mapUserRow = (row) => ({
  id: row.id,
  username: row.username,
  passwordHash: row.password_hash,
  role: row.role,
  email: row.email,
  createdAt: formatDateTime(row.created_at),
  updatedAt: formatDateTime(row.updated_at),
})
