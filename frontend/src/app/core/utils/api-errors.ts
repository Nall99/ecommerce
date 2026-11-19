import { HttpErrorResponse } from '@angular/common/http';

export function apiErrorMessage(err: unknown, fallback = 'Algo deu errado. Tente novamente.') {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'Não foi possível conectar ao servidor. A API pode estar iniciando, tente de novo em instantes.';
    }
    if (err.error && typeof err.error === 'object') {
      const first = (Object.values(err.error) as unknown[])
        .flat()
        .find((m): m is string => typeof m === 'string');
      if (first) return first;
    }
  }
  return fallback;
}

/** Mensagem do cupom quando o erro 400 veio do campo coupon_code. */
export function couponErrorMessage(err: unknown): string | null {
  if (err instanceof HttpErrorResponse && err.status === 400) {
    const field = (err.error as { coupon_code?: unknown } | null)?.coupon_code;
    const first = Array.isArray(field) ? field[0] : field;
    return typeof first === 'string' ? first : null;
  }
  return null;
}