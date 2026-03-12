import jwt from 'jsonwebtoken'
import { createUnauthorizedError, createForbiddenError } from '../utils/AppError.js'
import { config } from '../config.js'

// Token verification middleware
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] 

  if (!token) {
    return next(createUnauthorizedError('Token bulunamadı'))
  }

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      return next(createUnauthorizedError('Geçersiz veya süresi dolmuş token'))
    }
    req.user = user
    next()
  })
}

// Rolebased authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createUnauthorizedError('Kullanıcı bilgisi bulunamadı'))
    }

    if (!roles.includes(req.user.role)) {
      return next(createForbiddenError('Bu işlem için yetkiniz yok'))
    }

    next()
  }
}
