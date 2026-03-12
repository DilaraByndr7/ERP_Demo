import express from 'express'
import cors from 'cors'
import fs from 'fs-extra'
import path from 'path'
import helmet from 'helmet'
import morgan from 'morgan'
import multer from 'multer'
import rateLimit from 'express-rate-limit'
import swaggerUi from 'swagger-ui-express'
import { AppError, ERROR_CODES, createNotFoundError } from './utils/AppError.js'
import logger from './logger.js'
import { config } from './config.js'
import { testConnection } from './db/connection.js'
import { swaggerSpec } from './swagger.js'
import { uploadsDir } from './utils/fileHelpers.js'

import { authenticateToken } from './middleware/auth.js'
import authRoutes from './routes/auth.js'
import cariRoutes from './routes/cari.js'
import transactionRoutes from './routes/transaction.js'

const app = express()

//Security, Parsing Middleware 
const allowedOrigins = new Set(config.corsOrigins)

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
)

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true)
      }

      return callback(
        new AppError('CORS hatası: bu origin için erişim izni yok', 403, ERROR_CODES.FORBIDDEN),
      )
    },
  }),
)

const morganStream = {
  write: (message) => {
    logger.info(message.trim())
  },
}

app.use(morgan('combined', { stream: morganStream }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

//Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Çok fazla dosya yükleme isteği. Lütfen daha sonra tekrar deneyin.' },
})

app.use((req, res, next) => {
  if (req.path === '/' || req.path.startsWith('/api-docs') || req.path.startsWith('/auth')) {
    return next()
  }

  return apiLimiter(req, res, next)
})

app.use('/cari-accounts/:id/documents', uploadLimiter)

//Routes
app.use('/auth', authRoutes)
app.use('/cari-accounts', cariRoutes)
app.use('/transactions', transactionRoutes)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.get('/', (req, res) => {
  res.json({
    message: 'ERP Backend API çalışıyor',
    version: '2.0.0',
    database: 'PostgreSQL',
    endpoints: {
      cari: {
        list: 'GET /cari-accounts',
        get: 'GET /cari-accounts/:id',
        create: 'POST /cari-accounts',
        update: 'PUT /cari-accounts/:id',
        delete: 'DELETE /cari-accounts/:id',
      },
      documents: {
        upload: 'POST /cari-accounts/:id/documents',
        delete: 'DELETE /cari-accounts/:id/documents/:docId',
        view: 'GET /uploads/:filename',
      },
      transactions: {
        list: 'GET /transactions',
        create: 'POST /cari-accounts/:id/transactions',
        update: 'PUT /cari-accounts/:id/transactions/:transId',
        delete: 'DELETE /cari-accounts/:id/transactions/:transId',
      },
    },
  })
})


app.get('/uploads/', authenticateToken, (req, res) => {
  res.status(400).json({ error: 'Dosya adı gerekli. Kullanım: /uploads/:filename' })
})

app.get('/uploads/:filename', authenticateToken, (req, res) => {
  const filename = req.params.filename

  if (!filename || filename.trim() === '' || filename === 'undefined') {
    return res.status(400).json({ error: 'Dosya adı gerekli' })
  }

  const safeFilename = path.basename(filename)
  const filePath = path.resolve(uploadsDir, safeFilename)
  const resolvedUploadsDir = path.resolve(uploadsDir)

  if (!filePath.startsWith(resolvedUploadsDir)) {
    logger.error('Güvenlik hatası: uploadsDir dışına çıkma denemesi', {
      filePath,
      resolvedUploadsDir,
    })
    return res.status(403).json({ error: 'Yetkisiz erişim' })
  }

  if (!(fs.existsSync(filePath))) {
    return res.status(404).json({ error: 'Dosya bulunamadı', filename: safeFilename })
  }

  const ext = path.extname(filename).toLowerCase()
  const contentTypeMap = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
  }

  const contentType = contentTypeMap[ext] || 'application/octet-stream'
  const disposition =
    ext === '.pdf' || ext === '.jpg' || ext === '.jpeg' || ext === '.png' ? 'inline' : 'attachment'

  res.setHeader('Content-Type', contentType)
  res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`)
  res.sendFile(path.resolve(filePath))
})

//404 Handler
app.use((req, res, next) => {
  if (req.path.startsWith('/uploads')) {
    return next()
  }

  next(createNotFoundError(`Endpoint (${req.method} ${req.path})`))
})

//Global error handler 
app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    logger.error('AppError', {
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    })

    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      ...(err.details && err.details.length > 0 && { details: err.details }),
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    })
  }

  if (err instanceof multer.MulterError) {
    logger.warn('Multer error', { error: err.message, path: req.path })

    return res.status(400).json({
      error: err.code === 'LIMIT_FILE_SIZE' ? "Dosya boyutu 10MB'dan büyük olamaz" : err.message,
      code: ERROR_CODES.BAD_REQUEST,
    })
  }

  logger.error('Unknown error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  })

  res.status(err.statusCode || 500).json({
    error: err.message || 'Sunucu hatası',
    code: ERROR_CODES.INTERNAL_ERROR,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  })
})

//Server Startup 
const startServer = async () => {
  try {
    await testConnection()

    app.listen(config.port, () => {
      logger.info(`Backend sunucusu http://localhost:${config.port} adresinde çalışıyor`)
      logger.info(`Yüklenen dosyalar: ${uploadsDir}`)
      logger.info(`API Dokümantasyonu: http://localhost:${config.port}/api-docs`)
      console.log(`Backend sunucusu http://localhost:${config.port} adresinde çalışıyor`)
      console.log(`Yüklenen dosyalar: ${uploadsDir}`)
      console.log(`API Dokümantasyonu: http://localhost:${config.port}/api-docs`)
    })
  } catch (error) {
    logger.error('PostgreSQL bağlantısı kurulamadı', { error: error.message })
    console.error('PostgreSQL bağlantısı kurulamadı:', error.message)
    process.exit(1)
  }
}

startServer()
