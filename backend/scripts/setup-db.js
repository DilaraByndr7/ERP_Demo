import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const runScript = (scriptPath) =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    })

    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${path.basename(scriptPath)} başarısız oldu (exit code: ${code})`))
      }
    })

    child.on('error', reject)
  })

const run = async () => {
  try {
    await runScript(path.join(__dirname, 'init-db.js'))
    await runScript(path.join(__dirname, 'seed.js'))
    console.log('Veritabanı kurulumu tamamlandı.')
  } catch (error) {
    console.error('Veritabanı kurulumu başarısız oldu:', error.message)
    process.exitCode = 1
  }
}

run()
