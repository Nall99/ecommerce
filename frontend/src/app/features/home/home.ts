import { Component, inject } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { Category, Product } from '../../core/models/catalog.models';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ProductCard } from '../../shared/product-card/product-card';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink, ProductCard],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  private readonly products = inject(ProductService);

  readonly categories = toSignal(this.products.categories(),{
    initialValue: [] as Category[]
  });

  readonly featured = toSignal(
    this.products.list({ ordering: '-created_at'}).pipe(map((page) => page.results.slice(0, 4))),
    { initialValue: [] as Product[]}
  )
}
