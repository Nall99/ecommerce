import { CurrencyPipe } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { ProductFull } from '../../../core/models/catalog.models';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/catalog.models';
import { CartPrompt } from '../../../core/services/cart-prompt.service';

interface DetailState {
  status: 'loading' | 'ok' | 'error';
  product: ProductFull | null;
}

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-detail.html',
})
export class ProductDetail {
  private readonly products = inject(ProductService);
  private readonly cart = inject(CartService)
  private readonly prompt = inject(CartPrompt);

  readonly slug = input.required<string>();

  protected readonly qty = signal(1);
  protected readonly feedback = signal<'' | 'added' | 'limit'>('');

  protected readonly state = toSignal(
    toObservable(this.slug).pipe(
      switchMap((slug) =>
        this.products.get(slug).pipe(
          map((product): DetailState => ({ status: 'ok', product })),
          startWith<DetailState>({ status: 'loading', product: null }),
          catchError(() => of<DetailState>({ status: 'error', product: null })),
        ),
      ),
    ),
    { initialValue: { status: 'loading', product: null } as DetailState },
  );
  protected inCart(p: Product) {
    return this.cart.quantityOf(p.id);
  }

  protected changeQty(delta: number, p: Product) {
    this.qty.update((q) => Math.min(Math.max(1, q + delta), p.stock));
  }

  protected addToCart(p: Product) {
    const ok = this.cart.add(p, this.qty());
    this.qty.set(1);

    if (ok) {
      this.feedback.set('');
      this.prompt.itemAdded(p.name);
    } else {
      this.feedback.set('limit');
    }
  }

}
