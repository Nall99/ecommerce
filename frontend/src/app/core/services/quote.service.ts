import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, catchError, debounceTime, map, of, startWith, switchMap } from 'rxjs';
import { Quote, QuoteRequest } from '../models/order.models';
import { apiErrorMessage, couponErrorMessage } from '../utils/api-errors';
import { CartService } from './cart.service';
import { OrderService } from './order.service';

export type QuoteState =
  | { status: 'empty' }
  | { status: 'loading' }
  | { status: 'ok'; quote: Quote }
  | { status: 'error'; message: string };

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private readonly cart = inject(CartService);
  private readonly orders = inject(OrderService);

  /** Aviso quando um cupom salvo deixou de valer (expirou, esgotou...). */
  readonly couponNotice = signal('');

  private readonly request = computed<QuoteRequest>(() => ({
    items: this.cart.toRequestItems(),
    coupon_code: this.cart.coupon(),
  }));

  readonly state = toSignal(
    toObservable(this.request).pipe(
      debounceTime(150),
      switchMap((req): Observable<QuoteState> => {
        if (!req.items.length) return of<QuoteState>({ status: 'empty' });

        return this.orders.quote(req).pipe(
          map((quote): QuoteState => ({ status: 'ok', quote })),
          startWith<QuoteState>({ status: 'loading' }),
          catchError((err) => {
            const couponMessage = couponErrorMessage(err);
            if (couponMessage && req.coupon_code) {
              this.couponNotice.set(couponMessage);
              this.cart.clearCoupon(); // dispara uma nova cotação sem o cupom
              return of<QuoteState>({ status: 'loading' });
            }
            return of<QuoteState>({ status: 'error', message: apiErrorMessage(err) });
          }),
        );
      }),
    ),
    { initialValue: { status: 'loading' } as QuoteState },
  );
}