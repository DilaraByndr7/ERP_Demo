import express from 'express'
import { handleValidationErrors, loginValidators, registerValidators } from '../middleware/validators.js'
import * as authController from '../controllers/authController.js'

const router = express.Router()

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Kullanıcı girişi
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Başarılı giriş
 *       401:
 *         description: Geçersiz kullanıcı adı veya şifre
 */
router.post('/login', loginValidators, handleValidationErrors, authController.login)

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, user]
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla oluşturuldu
 *       400:
 *         description: Validation hatası
 */
router.post('/register', registerValidators, handleValidationErrors, authController.register)

export default router
