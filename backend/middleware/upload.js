import multer from 'multer'
import path from 'path'
import { AppError, ERROR_CODES } from '../utils/AppError.js'
import { uploadsDir } from '../utils/fileHelpers.js'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname)
    cb(null, `doc-${uniqueSuffix}${ext}`)
  },
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/jpg',
  ]

  if (allowedTypes.includes(file.mimetype)) {
    return cb(null, true)
  }

  return cb(
    new AppError(
      `Desteklenmeyen dosya tipi: ${file.mimetype}`,
      400,
      ERROR_CODES.BAD_REQUEST,
    ),
    false,
  )
}

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
})

export const uploadMiddleware = upload.single('file')
