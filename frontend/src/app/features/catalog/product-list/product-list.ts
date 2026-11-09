import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { Page, Product } from '../../../core/models/catalog.models';
import { ProductService } from '../../../core/services/product.service';
import { ProductCard } from '../../../shared/product-card/product-card';

interface ListState {
  loading: boolean;
  error: boolean;
  page: Page<Product> | null;
}

@Component({
  imports: [RouterLink, ProductCard],
  selector: 'app-product-list',
  styleUrl: './product-list.css',
  templateUrl: './product-list.html',
})
export class ProductList {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly products = inject(ProductService);

  private readonly pageSize = 12;
  protected readonly skeletons = Array.from({ length: 8 }, (_, i) => i);

  private readonly params = toSignal(this.route.queryParamMap, { requireSync: true });

  protected readonly currentCategory = computed(() => this.params().get('category'));
  protected readonly currentSearch = computed(() => this.params().get('search'));
  protected readonly currentOrdering = computed(() => this.params().get('ordering'));
  protected readonly currentPage = computed(() => Number(this.params().get('page') ?? 1));

  protected readonly categories = toSignal(this.products.categories(), { initialValue: [] });

  protected readonly state = toSignal(
    this.route.queryParamMap.pipe(
      switchMap((p) =>
        this.products
          .list({
            search: p.get('search'),
            category: p.get('category'),
            ordering: p.get('ordering'),
            page: p.get('page'),
          })
          .pipe(
            map((page): ListState => ({ loading: false, error: false, page })),
            startWith<ListState>({ loading: true, error: false, page: null }),
            catchError(() => of<ListState>({ loading: false, error: true, page: null })),
          ),
      ),
    ),
    { initialValue: { loading: true, error: false, page: null } as ListState },
  );

  protected readonly totalPages = computed(() =>
    Math.ceil((this.state().page?.count ?? 0) / this.pageSize),
  );

  protected chip(active: boolean) {
    return (
      'rounded-full px-4 py-2 text-sm font-semibold transition-colors ' +
      (active ? 'bg-brand text-white' : 'bg-white hover:bg-sand')
    );
  }

  protected setOrdering(value: string) {
    this.navigate({ ordering: value || null, page: null });
  }

  protected goToPage(page: number) {
    this.navigate({ page: page > 1 ? page : null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private navigate(queryParams: Params) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }
}
