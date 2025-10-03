export class HttpError extends Error {
  status: number
  code?: string
  details?: any
  constructor(status: number, message: string, codeOrDetails?: string | Record<string, any>) {
    super(message)
    this.status = status
    if (typeof codeOrDetails === 'string') {
      this.code = codeOrDetails
    } else {
      this.details = codeOrDetails
    }
  }
}

export function isHttpError(err: unknown): err is HttpError {
  return typeof err === 'object' && err !== null && 'status' in err && typeof (err as any).status === 'number'
}
