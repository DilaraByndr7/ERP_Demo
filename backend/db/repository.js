/**
 * Tek giriş noktası: Tüm repository fonksiyonlarını buradan re-export ediyoruz.
 * Controller'lar ve script'ler `from './db/repository.js'` ile import etmeye devam edebilir.
 */

export {
  listCariAccounts,
  getCariAccountById,
  getCariAccountRowById,
  findCariByCode,
  createCariAccount,
  updateCariAccount,
  deleteCariAccount,
} from './cariRepository.js'

export {
  createDocument,
  getDocumentById,
  deleteDocumentById,
} from './documentRepository.js'

export {
  createTransaction,
  updateTransaction,
  deleteTransactionById,
  listTransactions,
} from './transactionRepository.js'

export {
  findUserByUsername,
  findUserByEmail,
  createUser,
} from './userRepository.js'
