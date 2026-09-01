/**
 * Standartlaştırılmış uygulama hataları.
 * Kullanıcıya domain'e uygun mesajlar, log tarafında teknik context.
 */

export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "INSUFFICIENT_BALANCE"
  | "INSUFFICIENT_LIMIT"
  | "PRICE_NOT_FOUND"
  | "PROVIDER_ERROR"
  | "PROVIDER_UNCONFIGURED"
  | "PROVIDER_UNAVAILABLE"
  | "PROVIDER_AUTH_FAILED"
  | "PROVIDER_REQUEST_FAILED"
  | "SMS_PROVIDER_UNCONFIGURED"
  | "SMS_SEND_FAILED"
  | "PENDING_PROVIDER_DOCUMENTATION"
  | "DUPLICATE_SHIPMENT"
  | "DUPLICATE_REQUEST"
  | "CONFLICT"
  | "TOO_MANY_REQUESTS"
  | "INTERNAL";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: Record<string, unknown>;

  constructor(code: ErrorCode, message: string, status: number, details?: Record<string, unknown>) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

/** Kullanıcıya güvenli biçimde sunulabilecek tek mesajı döndürür. */
export function toUserMessage(err: unknown): string {
  if (isAppError(err)) {
    return err.message;
  }
  return "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.";
}
