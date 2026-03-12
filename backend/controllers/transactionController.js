import logger from '../logger.js'
import { AppError, ERROR_CODES, createNotFoundError } from '../utils/AppError.js'
import {
  getCariAccountRowById,
  createTransaction,
  updateTransaction,
  deleteTransactionById,
  listTransactions,
} from '../db/repository.js'

export const list = async (req, res, next) => {
  try {
    const result = await listTransactions({
      filters: req.query,
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 50),
      sort: req.query.sort || 'date',
      order: req.query.order || 'desc',
    })

    res.json(result)
  } catch (error) {
    logger.error('İşlem listesi hatası', { error: error.message, stack: error.stack })
    next(new AppError('İşlem listesi çekilirken bir hata oluştu', 500, ERROR_CODES.INTERNAL_ERROR))
  }
}

export const create = async (req, res, next) => {
  try {
    const cari = await getCariAccountRowById(req.params.id)
    if (!cari) {
      return next(createNotFoundError('Cari'))
    }

    const newTransaction = await createTransaction({
      cariId: req.params.id,
      transaction: {
        id: `trans_${Date.now()}`,
        type: req.body.type || 'Sipariş',
        date: req.body.date || new Date().toISOString().split('T')[0],
        amount: Number(req.body.amount) || 0,
        status: req.body.status || 'Beklemede',
        description: req.body.description || '',
        reference: req.body.reference || '',
      },
    })

    res.status(201).json(newTransaction)
  } catch (error) {
    logger.error('İşlem ekleme hatası', { error: error.message, stack: error.stack })
    next(new AppError('İşlem eklenirken bir hata oluştu', 500, ERROR_CODES.INTERNAL_ERROR))
  }
}

export const update = async (req, res, next) => {
  try {
    const cari = await getCariAccountRowById(req.params.id)
    if (!cari) {
      return next(createNotFoundError('Cari'))
    }

    const transaction = await updateTransaction(req.params.id, req.params.transId, req.body)
    if (!transaction) {
      return next(createNotFoundError('İşlem'))
    }

    res.json(transaction)
  } catch (error) {
    logger.error('İşlem güncelleme hatası', { error: error.message, stack: error.stack })
    next(new AppError('İşlem güncellenirken bir hata oluştu', 500, ERROR_CODES.INTERNAL_ERROR))
  }
}

export const remove = async (req, res, next) => {
  try {
    const cari = await getCariAccountRowById(req.params.id)
    if (!cari) {
      return next(createNotFoundError('Cari'))
    }

    const deleted = await deleteTransactionById(req.params.id, req.params.transId)
    if (!deleted) {
      return next(createNotFoundError('İşlem'))
    }

    res.json({ message: 'İşlem silindi' })
  } catch (error) {
    logger.error('İşlem silme hatası', { error: error.message, stack: error.stack })
    next(new AppError('İşlem silinirken bir hata oluştu', 500, ERROR_CODES.INTERNAL_ERROR))
  }
}
