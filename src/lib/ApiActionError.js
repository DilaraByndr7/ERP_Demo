export class ApiActionError extends Error {
  constructor(message, details = []) {
    super(message)
    this.name = 'ApiActionError'
    this.details = details
  }
}
