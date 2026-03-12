import express from 'express'
import { authenticateToken, authorize } from '../middleware/auth.js'
import {
  handleValidationErrors,
  cariCreateValidators,
  cariUpdateValidators,
  cariListValidators,
  cariDeleteValidators,
} from '../middleware/validators.js'
import * as cariController from '../controllers/cariController.js'
import * as documentController from '../controllers/documentController.js'
import * as transactionController from '../controllers/transactionController.js'
import { uploadMiddleware } from '../middleware/upload.js'

const router = express.Router()

/**
 * @swagger
 * /cari:
 *   get:
 *     summary: Cari listesi (sayfalı, filtrelenebilir)
 *     tags: [Cari]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [musteri, tedarikci, diger] }
 *     responses:
 *       200:
 *         description: Cari listesi
 *       401:
 *         description: Yetkisiz
 */
router.get('/', authenticateToken, cariListValidators, handleValidationErrors, cariController.list)

/**
 * @swagger
 * /cari/{id}:
 *   get:
 *     summary: Tek cari detayı
 *     tags: [Cari]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Cari detayı
 *       404:
 *         description: Cari bulunamadı
 *       401:
 *         description: Yetkisiz
 */
router.get('/:id', authenticateToken, cariController.getById)

/**
 * @swagger
 * /cari:
 *   post:
 *     summary: Yeni cari oluştur (admin)
 *     tags: [Cari]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [unvan, type]
 *             properties:
 *               unvan: { type: string }
 *               type: { type: string, enum: [musteri, tedarikci, diger] }
 *               vergiNo: { type: string }
 *               vergiDairesi: { type: string }
 *               adres: { type: string }
 *               telefon: { type: string }
 *               email: { type: string }
 *     responses:
 *       201:
 *         description: Cari oluşturuldu
 *       400:
 *         description: Validation hatası
 *       401:
 *         description: Yetkisiz
 */
router.post('/', authenticateToken, authorize('admin'), cariCreateValidators, handleValidationErrors, cariController.create)

/**
 * @swagger
 * /cari/{id}:
 *   put:
 *     summary: Cari güncelle (admin)
 *     tags: [Cari]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               unvan: { type: string }
 *               type: { type: string, enum: [musteri, tedarikci, diger] }
 *               vergiNo: { type: string }
 *               vergiDairesi: { type: string }
 *               adres: { type: string }
 *               telefon: { type: string }
 *               email: { type: string }
 *     responses:
 *       200:
 *         description: Cari güncellendi
 *       404:
 *         description: Cari bulunamadı
 *       401:
 *         description: Yetkisiz
 */
router.put('/:id', authenticateToken, authorize('admin'), cariUpdateValidators, handleValidationErrors, cariController.update)

/**
 * @swagger
 * /cari/{id}:
 *   delete:
 *     summary: Cari sil (admin)
 *     tags: [Cari]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Cari silindi
 *       404:
 *         description: Cari bulunamadı
 *       401:
 *         description: Yetkisiz
 */
router.delete('/:id', authenticateToken, authorize('admin'), cariDeleteValidators, handleValidationErrors, cariController.remove)

/**
 * @swagger
 * /cari/{id}/documents:
 *   post:
 *     summary: Cariye belge yükle (admin, multipart/form-data)
 *     tags: [Cari]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Belge yüklendi
 *       400:
 *         description: Dosya veya validation hatası
 *       401:
 *         description: Yetkisiz
 */
router.post('/:id/documents', authenticateToken, authorize('admin'), uploadMiddleware, documentController.upload)

/**
 * @swagger
 * /cari/{id}/documents/{docId}:
 *   delete:
 *     summary: Cari belgesi sil (admin)
 *     tags: [Cari]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: docId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Belge silindi
 *       404:
 *         description: Belge veya cari bulunamadı
 *       401:
 *         description: Yetkisiz
 */
router.delete('/:id/documents/:docId', authenticateToken, authorize('admin'), documentController.remove)

/**
 * @swagger
 * /cari/{id}/transactions:
 *   post:
 *     summary: Cariye işlem ekle (admin)
 *     tags: [Cari]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, amount]
 *             properties:
 *               type: { type: string, enum: [alis, satis, odeme, tahsilat] }
 *               amount: { type: number }
 *               date: { type: string, format: date }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: İşlem oluşturuldu
 *       400:
 *         description: Validation hatası
 *       401:
 *         description: Yetkisiz
 */
router.post('/:id/transactions', authenticateToken, authorize('admin'), transactionController.create)

/**
 * @swagger
 * /cari/{id}/transactions/{transId}:
 *   put:
 *     summary: Cari işlemi güncelle (admin)
 *     tags: [Cari]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: transId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type: { type: string, enum: [alis, satis, odeme, tahsilat] }
 *               amount: { type: number }
 *               date: { type: string, format: date }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: İşlem güncellendi
 *       404:
 *         description: İşlem veya cari bulunamadı
 *       401:
 *         description: Yetkisiz
 */
router.put('/:id/transactions/:transId', authenticateToken, authorize('admin'), transactionController.update)

/**
 * @swagger
 * /cari/{id}/transactions/{transId}:
 *   delete:
 *     summary: Cari işlemi sil (admin)
 *     tags: [Cari]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: transId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: İşlem silindi
 *       404:
 *         description: İşlem veya cari bulunamadı
 *       401:
 *         description: Yetkisiz
 */
router.delete('/:id/transactions/:transId', authenticateToken, authorize('admin'), transactionController.remove)

export default router
