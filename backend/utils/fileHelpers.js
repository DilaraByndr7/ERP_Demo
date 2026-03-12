import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import logger from '../logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const uploadsDir = path.join(__dirname, '..', 'uploads')

fs.ensureDirSync(uploadsDir)

export const removeUploadedFile = async (filePath) => {
  if (!filePath) return

  try {
    if (await fs.pathExists(filePath)) {
      await fs.unlink(filePath)
    }
  } catch (error) {
    logger.error('Dosya silme hatası', { error: error.message, filePath })
  }
}

export const removeDocumentFiles = async (documents = []) => {
  await Promise.all(
    documents.map(async (doc) => {
      if (!doc.fileUrl || doc.fileUrl === '#') return
      const filePath = path.join(uploadsDir, path.basename(doc.fileUrl))
      await removeUploadedFile(filePath)
    }),
  )
}
