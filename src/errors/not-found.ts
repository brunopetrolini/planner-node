export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NOT_FOUND_ERROR'
  }
}
