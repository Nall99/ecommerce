import { CurrencyPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Quote } from '../../core/models/order.models';

@Component({
  selector: 'app-order-totals',
  imports: [CurrencyPipe],
  templateUrl: './order-totals.html',
})
export class OrderTotals {
  readonly quote = input.required<Quote>();

  protected readonly hasDiscount = computed(() => Number(this.quote().discount) > 0);
  protected readonly freeShipping = computed(() => Number(this.quote().shipping) === 0);
  protected readonly missingForFree = computed(() => {
    const q = this.quote();
    const afterDiscount = Number(q.subtotal) - Number(q.discount);
    return Math.max(0, Number(q.free_shipping_from) - afterDiscount);
  });
}