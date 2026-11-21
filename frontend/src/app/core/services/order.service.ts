import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Order, OrderRequest, Quote, QuoteRequest } from '../models/order.models';
import { SKIP_LOADING } from '../interceptors/loading.interceptor';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  quote(body: QuoteRequest) {
    return this.http.post<Quote>(`${this.api}/cart/quote/`, body);
  }

  create(body: OrderRequest) {
  return this.http.post<Order>(`${this.api}/orders/`, body, {
    context: new HttpContext().set(SKIP_LOADING, true),
  });
}
}