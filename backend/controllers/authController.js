import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'
import { createValidationError, createUnauthorizedError } from '../utils/AppError.js'
import logger from '../logger.js'
import { config } from '../config.js'
import { createUser, findUserByEmail, findUserByUsername } from '../db/repository.js'

const hashPassword = async (password) => bcrypt.hash(password, 10)
const comparePassword = async (password, hash) => bcrypt.compare(password, hash)

export const login = async (req, res, next) => {
  try {
    const normalizedUsername = req.body.username?.trim().toLowerCase()
    const normalizedPassword = req.body.password?.trim()
    const user = await findUserByUsername(normalizedUsername)

    if (!user) {
      logger.warn('Login attempt failed: User not found', { username: normalizedUsername })
      return next(createUnauthorizedError('Geçersiz kullanıcı adı veya şifre'))
    }

    const isValidPassword = await comparePassword(normalizedPassword, user.passwordHash)
    if (!isValidPassword) {
      logger.warn('Login attempt failed: Invalid password', {
        username: normalizedUsername,
        passwordLength: normalizedPassword?.length,
      })
      return next(createUnauthorizedError('Geçersiz kullanıcı adı veya şifre'))
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn },
    )

    logger.info('User logged in', { username: user.username, role: user.role })

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
    })
  } catch (error) {
    logger.error('Login error:', { error: error.message })
    next(error)
  }
}

export const register = async (req, res, next) => {
  try {
    const { username, password, email, role = 'user' } = req.body

    const existingUser = await findUserByUsername(username)
    if (existingUser) {
      return next(createValidationError('Bu kullanıcı adı zaten kullanılıyor'))
    }

    const existingEmail = await findUserByEmail(email)
    if (existingEmail) {
      return next(createValidationError('Bu email adresi zaten kullanılıyor'))
    }

    const newUser = await createUser({
      id: randomUUID(),
      username: username.trim(),
      passwordHash: await hashPassword(password),
      email: email.trim().toLowerCase(),
      role,
    })

    logger.info('New user registered', {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    })

    res.status(201).json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    })
  } catch (error) {
    logger.error('Register error:', { error: error.message })
    next(error)
  }
}
