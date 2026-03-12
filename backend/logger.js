import winston from 'winston'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs-extra'
import { config } from './config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


const logsDir = path.join(__dirname, 'logs')
fs.ensureDirSync(logsDir)

const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: 'erp-backend' },
  transports: [
    
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, 
      maxFiles: 5,
    }),
    
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, 
      maxFiles: 5,
    }),
  ],
})

if (config.nodeEnv !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          let msg = `${timestamp} [${level}]: ${message}`
          if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`
          }
          return msg
        }),
      ),
    }),
  )
}

export default logger
