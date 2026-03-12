import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import { handleValidationErrors, transactionListValidators } from '../middleware/validators.js'
import * as transactionController from '../controllers/transactionController.js'

const router = express.Router()

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: İşlem listesi (sayfalı, cari/tarih/tip filtreli)
 *     tags: [Transactions]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: cariId
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [alis, satis, odeme, tahsilat] }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: İşlem listesi
 *       401:
 *         description: Yetkisiz
 */
router.get('/', authenticateToken, transactionListValidators, handleValidationErrors, transactionController.list)

export default router
