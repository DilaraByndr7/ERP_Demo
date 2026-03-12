import {
  AppError,
  ERROR_CODES,
  createDuplicateError,
  createNotFoundError,
} from '../utils/AppError.js'
import logger from '../logger.js'
import {
  listCariAccounts,
  getCariAccountById,
  getCariAccountRowById,
  findCariByCode,
  createCariAccount,
  updateCariAccount,
  deleteCariAccount,
} from '../db/repository.js'
import { removeDocumentFiles } from '../utils/fileHelpers.js'

export const list = async (req, res, next) => {
  try {
    const result = await listCariAccounts({
      filters: req.query,
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 50),
      sort: req.query.sort || 'createdAt',
      order: req.query.order || 'desc',
    })

    res.json(result)
  } catch (error) {
    logger.error('Cari listesi hatası', { error: error.message, stack: error.stack })
    next(new AppError('Cari listesi çekilirken bir hata oluştu', 500, ERROR_CODES.INTERNAL_ERROR))
  }
}

export const getById = async (req, res, next) => {
  try {
    const cari = await getCariAccountById(req.params.id)

    if (!cari) {
      return next(createNotFoundError('Cari'))
    }

    res.json(cari)
  } catch (error) {
    next(error)
  }
}

export const create = async (req, res, next) => {
  try {
    const existingCari = await findCariByCode(req.body.code)
    if (existingCari) {
      return next(createDuplicateError('Kod'))
    }

    const newCari = await createCariAccount({
      id: Date.now().toString(),
      payload: req.body,
    })

    res.status(201).json(newCari)
  } catch (error) {
    if (error.code === '23505') {
      return next(createDuplicateError('Kod'))
    }

    logger.error('Cari oluşturma hatası', { error: error.message, stack: error.stack })
    next(new AppError('Cari oluşturulurken bir hata oluştu', 500, ERROR_CODES.INTERNAL_ERROR))
  }
}

export const update = async (req, res, next) => {
  try {
    const currentCari = await getCariAccountRowById(req.params.id)
    if (!currentCari) {
      return next(createNotFoundError('Cari'))
    }

    if (req.body.code && req.body.code !== currentCari.code) {
      const existingCari = await findCariByCode(req.body.code)
      if (existingCari && existingCari.id !== req.params.id) {
        return next(createDuplicateError('Kod'))
      }
    }

    const updatedCari = await updateCariAccount(req.params.id, req.body)
    res.json(updatedCari)
  } catch (error) {
    if (error.code === '23505') {
      return next(createDuplicateError('Kod'))
    }

    logger.error('Cari güncelleme hatası', { error: error.message, stack: error.stack })
    next(new AppError('Cari güncellenirken bir hata oluştu', 500, ERROR_CODES.INTERNAL_ERROR))
  }
}

export const remove = async (req, res, next) => {
  try {
    const cari = await getCariAccountById(req.params.id)
    if (!cari) {
      return next(createNotFoundError('Cari'))
    }

    const deleted = await deleteCariAccount(req.params.id)
    if (!deleted) {
      return next(createNotFoundError('Cari'))
    }

    await removeDocumentFiles(cari.documents)
    res.json({ message: 'Cari silindi' })
  } catch (error) {
    logger.error('Cari silme hatası', { error: error.message, stack: error.stack })
    next(new AppError('Cari silinirken bir hata oluştu', 500, ERROR_CODES.INTERNAL_ERROR))
  }
}
