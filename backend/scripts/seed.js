import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import { pool, withTransaction } from '../db/connection.js'
import { config } from '../config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const defaultUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    email: 'admin@erp.com',
  },
  {
    id: '2',
    username: 'user',
    password: 'user123',
    role: 'user',
    email: 'user@erp.com',
  },
]

const toNullableNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return null
  }

  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

const normalizeBalance = (value) => Math.abs(Number(value || 0))
const normalizeNullableAmount = (value) => {
  if (value === undefined || value === null || value === '') {
    return null
  }

  return Math.abs(Number(value || 0))
}

const assertSeedIsSafe = () => {
  if (config.allowDestructiveSeed) {
    return
  }

  if (config.nodeEnv !== 'development' || !config.isLocalDatabase) {
    throw new Error(
      'Destructive seed only development/local ortamda çalışır. Gerekirse ALLOW_DESTRUCTIVE_SEED=true kullanın.',
    )
  }
}

const run = async () => {
  const dbJsonPath = path.join(__dirname, '..', '..', 'db.json')

  try {
    assertSeedIsSafe()

    const rawData = await fs.readFile(dbJsonPath, 'utf8')
    const jsonData = JSON.parse(rawData)
    const caris = jsonData['cari-accounts'] || []

    await withTransaction(async (client) => {
      await client.query('TRUNCATE TABLE documents, transactions, users, cari_accounts RESTART IDENTITY CASCADE')

      for (const user of defaultUsers) {
        const passwordHash = await bcrypt.hash(user.password, 10)
        await client.query(
          `INSERT INTO users (id, username, password_hash, role, email, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
          [user.id, user.username, passwordHash, user.role, user.email],
        )
      }

      for (const cari of caris) {
        await client.query(
          `INSERT INTO cari_accounts (
            id, code, name, type, tax_no, tax_office, balance, balance_type,
            is_risky, phone, email, address, due_date, next_payment_date,
            next_payment_amount, notes, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8,
            $9, $10, $11, $12, $13, $14,
            $15, $16, $17, $18
          )`,
          [
            String(cari.id),
            cari.code,
            cari.name,
            cari.type,
            cari.taxNo || null,
            cari.taxOffice || null,
            normalizeBalance(cari.balance),
            cari.balanceType || (Number(cari.balance || 0) < 0 ? 'Borç' : 'Alacak'),
            Boolean(cari.isRisky),
            cari.phone || null,
            cari.email || null,
            cari.address || null,
            cari.dueDate || null,
            cari.nextPaymentDate || null,
            normalizeNullableAmount(cari.nextPaymentAmount),
            cari.notes || null,
            cari.createdAt || new Date().toISOString(),
            cari.updatedAt || cari.createdAt || new Date().toISOString(),
          ],
        )

        for (const document of cari.documents || []) {
          await client.query(
            `INSERT INTO documents (
              id, cari_account_id, name, type, upload_date, file_url, file_size, original_name, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
            [
              document.id,
              String(cari.id),
              document.name || document.originalName || 'İsimsiz Doküman',
              document.type || 'Diğer',
              document.uploadDate || new Date().toISOString().split('T')[0],
              document.fileUrl || '#',
              toNullableNumber(document.fileSize),
              document.originalName || document.name || null,
            ],
          )
        }

        for (const transaction of cari.transactions || []) {
          await client.query(
            `INSERT INTO transactions (
              id, cari_account_id, type, date, amount, status, description, reference, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
            [
              transaction.id,
              String(cari.id),
              transaction.type || 'Sipariş',
              transaction.date || new Date().toISOString().split('T')[0],
              Number(transaction.amount || 0),
              transaction.status || 'Beklemede',
              transaction.description || '',
              transaction.reference || '',
            ],
          )
        }
      }
    })

    console.log('PostgreSQL seed tamamlandı.')
  } catch (error) {
    console.error('Seed işlemi başarısız oldu:', error)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

run()
