import { CurrencyPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { ProductFull } from '../../../core/models/catalog.models';
import { ProductService } from '../../../core/services/product.service';

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

  // Vem de /produtos/:slug graças ao withComponentInputBinding()
  readonly slug = input.required<string>();

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
}
