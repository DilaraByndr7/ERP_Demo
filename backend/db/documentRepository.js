import { query } from './connection.js'
import { mapDocumentRow } from './helpers.js'

export const createDocument = async ({ cariId, document }) => {
  const result = await query(
    `INSERT INTO documents (
      id, cari_account_id, name, type, upload_date, file_url, file_size, original_name, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    RETURNING *`,
    [
      document.id,
      cariId,
      document.name,
      document.type,
      document.uploadDate,
      document.fileUrl,
      document.fileSize,
      document.originalName,
    ],
  )

  return mapDocumentRow(result.rows[0])
}

export const getDocumentById = async (cariId, documentId) => {
  const result = await query(
    'SELECT * FROM documents WHERE cari_account_id = $1 AND id = $2',
    [cariId, documentId],
  )
  return result.rows[0] ? mapDocumentRow(result.rows[0]) : null
}

export const deleteDocumentById = async (cariId, documentId) => {
  const result = await query(
    'DELETE FROM documents WHERE cari_account_id = $1 AND id = $2 RETURNING *',
    [cariId, documentId],
  )
  return result.rows[0] ? mapDocumentRow(result.rows[0]) : null
}
