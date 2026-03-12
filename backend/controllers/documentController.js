import path from 'path'
import { AppError, ERROR_CODES, createNotFoundError } from '../utils/AppError.js'
import logger from '../logger.js'
import {
  getCariAccountRowById,
  createDocument,
  getDocumentById,
  deleteDocumentById,
} from '../db/repository.js'
import { removeUploadedFile, uploadsDir } from '../utils/fileHelpers.js'

export const upload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Dosya yüklenmedi' })
    }

    const cari = await getCariAccountRowById(req.params.id)
    if (!cari) {
      await removeUploadedFile(req.file.path)
      return next(createNotFoundError('Cari'))
    }

    const newDocument = await createDocument({
      cariId: req.params.id,
      document: {
        id: `doc_${Date.now()}`,
        name: req.body.name || req.file.originalname,
        type: req.body.type || 'Diğer',
        uploadDate: new Date().toISOString().split('T')[0],
        fileUrl: `/uploads/${req.file.filename}`,
        fileSize: req.file.size,
        originalName: req.file.originalname,
      },
    })

    logger.info('Doküman başarıyla eklendi', {
      documentId: newDocument.id,
      cariId: req.params.id,
    })

    res.status(201).json(newDocument)
  } catch (error) {
    if (req.file?.path) {
      await removeUploadedFile(req.file.path)
    }

    logger.error('Doküman yükleme hatası', {
      error: error.message,
      stack: error.stack,
      cariId: req.params.id,
    })
    next(error)
  }
}

export const remove = async (req, res, next) => {
  try {
    const cari = await getCariAccountRowById(req.params.id)
    if (!cari) {
      return next(createNotFoundError('Cari'))
    }

    const document = await getDocumentById(req.params.id, req.params.docId)
    if (!document) {
      return next(createNotFoundError('Doküman'))
    }

    await deleteDocumentById(req.params.id, req.params.docId)
    if (document.fileUrl && document.fileUrl !== '#') {
      await removeUploadedFile(path.join(uploadsDir, path.basename(document.fileUrl)))
    }

    logger.info('Doküman silindi', {
      documentId: req.params.docId,
      cariId: req.params.id,
    })
    res.json({ message: 'Doküman silindi' })
  } catch (error) {
    logger.error('Doküman silme hatası', { error: error.message, stack: error.stack })
    next(new AppError('Doküman silinirken bir hata oluştu', 500, ERROR_CODES.INTERNAL_ERROR))
  }
}
