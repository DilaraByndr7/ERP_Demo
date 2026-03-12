// Custom Error Class for standardized error handling
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = []) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = details
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

// Error codes enum
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
}

// Helper functions to create common errors
export const createValidationError = (message, details = []) => {
  return new AppError(message, 400, ERROR_CODES.VALIDATION_ERROR, details)
}

export const createNotFoundError = (resource = 'Kayıt') => {
  return new AppError(`${resource} bulunamadı`, 404, ERROR_CODES.NOT_FOUND)
}

export const createDuplicateError = (field = 'Kod') => {
  return new AppError(`Bu ${field.toLowerCase()} zaten kullanılıyor`, 400, ERROR_CODES.DUPLICATE_ENTRY)
}

export const createUnauthorizedError = (message = 'Yetkisiz erişim') => {
  return new AppError(message, 401, ERROR_CODES.UNAUTHORIZED)
}

export const createForbiddenError = (message = 'Erişim reddedildi') => {
  return new AppError(message, 403, ERROR_CODES.FORBIDDEN)
}
