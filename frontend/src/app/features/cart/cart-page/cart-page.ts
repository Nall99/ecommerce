import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { QuoteService } from '../../../core/services/quote.service';
import { apiErrorMessage, couponErrorMessage } from '../../../core/utils/api-errors';
import { OrderTotals } from '../../../shared/order-totals/order-totals';

@Component({
  selector: 'app-cart-page',
  imports: [RouterLink, CurrencyPipe, OrderTotals],
  templateUrl: './cart-page.html',
})
export class CartPage {
  protected readonly cart = inject(CartService);
  private readonly quoteService = inject(QuoteService);
  private readonly orders = inject(OrderService);

  protected readonly codeInput = signal('');
  protected readonly applying = signal(false);
  protected readonly couponError = signal('');

  protected readonly q = computed(() => {
    const s = this.quoteService.state();
    return s.status === 'ok' ? s.quote : null;
  });

  protected readonly stateError = computed(() => {
    const s = this.quoteService.state();
    return s.status === 'error' ? s.message : '';
  });

  protected readonly couponMessage = computed(
    () => this.couponError() || this.quoteService.couponNotice(),
  );

  protected applyCoupon(event: Event) {
    event.preventDefault();
    const code = this.codeInput().trim().toUpperCase();
    if (!code || this.applying()) return;

    this.applying.set(true);
    this.couponError.set('');
    this.quoteService.couponNotice.set('');

    // Valida antes de guardar: se for inválido, mostra o motivo sem mexer no carrinho
    this.orders.quote({ items: this.cart.toRequestItems(), coupon_code: code }).subscribe({
      next: () => {
        this.cart.setCoupon(code);
        this.codeInput.set('');
        this.applying.set(false);
      },
      error: (err) => {
        this.couponError.set(couponErrorMessage(err) ?? apiErrorMessage(err));
        this.applying.set(false);
      },
    });
  }

  protected removeCoupon() {
    this.cart.clearCoupon();
    this.couponError.set('');
    this.quoteService.couponNotice.set('');
  }
}