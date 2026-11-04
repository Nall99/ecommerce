import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Category, Page, Product, ProductFull, ProductQuery } from '../models/catalog.models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  list(query: ProductQuery = {}) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<Page<Product>>(`${this.api}/products/`, { params });
  }

  get(slug: string) {
    return this.http.get<ProductFull>(`${this.api}/products/${slug}/`);
  }

  categories() {
    return this.http.get<Category[]>(`${this.api}/categories/`);
  }
}
