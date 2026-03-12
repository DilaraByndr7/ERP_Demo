import { body, param, query, validationResult } from 'express-validator'
import { promisify } from 'util'
import dns from 'dns'
import { createValidationError } from '../utils/AppError.js'
import logger from '../logger.js'

const resolveMx = promisify(dns.resolveMx)

const validateEmailFormat = (email) => {
  if (!email) return true
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateEmailDomain = async (email) => {
  if (!email) return { valid: true }

  if (!validateEmailFormat(email)) {
    return { valid: false, error: 'Email geçersiz' }
  }

  try {
    const domain = email.split('@')[1]

    if (!domain) {
      return { valid: false, error: 'Email geçersiz' }
    }

    const mxRecords = await Promise.race([
      resolveMx(domain),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('DNS timeout')), 5000)
      }),
    ])

    if (mxRecords?.length > 0) {
      return { valid: true }
    }

    return {
      valid: false,
      error: "Email domain'i geçerli bir email sunucusuna sahip değil",
    }
  } catch (error) {
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA' || error.message === 'DNS timeout') {
      return {
        valid: false,
        error: "Email domain'i bulunamadı veya geçerli bir email sunucusuna sahip değil",
      }
    }

    logger.warn('DNS kontrolü başarısız, sadece format kontrolü yapılıyor', {
      error: error.message,
    })

    return { valid: true }
  }
}

const validatePhone = (phone) => {
  if (!phone) return true
  const phoneRegex = /^(\+90|0)?[5][0-9]{9}$|^(\+90|0)?[1-9][0-9]{9}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(createValidationError('Validation hatası', errors.array()))
  }
  next()
}

const emailValidator = () =>
  body('email').optional().custom(async (value) => {
    if (!value) return true
    const validation = await validateEmailDomain(value)
    if (!validation.valid) {
      throw new Error(validation.error || 'Email geçersiz')
    }
    return true
  })

const phoneValidator = () =>
  body('phone').optional().custom((value) => {
    if (value && !validatePhone(value)) {
      throw new Error('Geçersiz telefon formatı')
    }
    return true
  })

export const cariCreateValidators = [
  body('code').notEmpty().withMessage('Kod zorunludur').trim(),
  body('name').notEmpty().withMessage('İsim zorunludur').trim(),
  body('type').isIn(['İşveren', 'Taşeron', 'Tedarikçi']).withMessage('Geçersiz cari tipi'),
  emailValidator(),
  phoneValidator(),
  body('balance').optional().isFloat({ min: 0 }).withMessage('Bakiye negatif olamaz'),
  body('nextPaymentAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Ödeme tutarı negatif olamaz'),
  body('dueDate').optional().isISO8601().withMessage('Geçersiz tarih formatı (ISO 8601 bekleniyor)'),
  body('nextPaymentDate')
    .optional()
    .isISO8601()
    .withMessage('Geçersiz tarih formatı (ISO 8601 bekleniyor)'),
  body('taxNo').optional().isString().trim(),
  body('taxOffice').optional().isString().trim(),
]

export const cariUpdateValidators = [
  param('id').notEmpty().withMessage('ID zorunludur'),
  body('code').optional().notEmpty().withMessage('Kod boş olamaz').trim(),
  body('name').optional().notEmpty().withMessage('İsim boş olamaz').trim(),
  body('type').optional().isIn(['İşveren', 'Taşeron', 'Tedarikçi']).withMessage('Geçersiz cari tipi'),
  emailValidator(),
  phoneValidator(),
  body('balance').optional().isNumeric().withMessage('Bakiye sayısal olmalıdır'),
]

export const cariListValidators = [
  query('search').optional().isString().trim(),
  query('type').optional().isIn(['İşveren', 'Taşeron', 'Tedarikçi']),
  query('onlyRisky').optional().isIn(['true', 'false']),
  query('balanceType').optional().isIn(['Borç', 'Alacak']),
  query('page').optional().isInt({ min: 1 }).withMessage('Sayfa numarası 1 veya daha büyük olmalıdır'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit 1-100 arasında olmalıdır'),
  query('sort')
    .optional()
    .isIn(['code', 'name', 'Ad', 'balance', 'createdAt', 'updatedAt'])
    .withMessage('Geçersiz sıralama alanı'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Sıralama yönü asc veya desc olmalıdır'),
]

export const cariDeleteValidators = [
  param('id').notEmpty().withMessage('ID zorunludur'),
]

export const loginValidators = [
  body('username').notEmpty().withMessage('Kullanıcı adı zorunludur'),
  body('password').notEmpty().withMessage('Şifre zorunludur'),
]

export const registerValidators = [
  body('username').notEmpty().withMessage('Kullanıcı adı zorunludur'),
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır'),
  body('email').isEmail().withMessage('Geçerli bir email adresi girin'),
  body('role').optional().isIn(['admin', 'user']).withMessage('Geçersiz rol'),
]

export const transactionListValidators = [
  query('search').optional().isString().trim(),
  query('type').optional().isString(),
  query('status').optional().isString(),
  query('cariId').optional().isString(),
  query('startDate').optional().isISO8601().withMessage('Geçersiz başlangıç tarihi'),
  query('endDate').optional().isISO8601().withMessage('Geçersiz bitiş tarihi'),
  query('page').optional().isInt({ min: 1 }).withMessage('Sayfa numarası 1 veya daha büyük olmalıdır'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit 1-100 arasında olmalıdır'),
  query('sort')
    .optional()
    .isIn(['date', 'amount', 'type', 'status', 'cariName'])
    .withMessage('Geçersiz sıralama alanı'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Sıralama yönü asc veya desc olmalıdır'),
]
