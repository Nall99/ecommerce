import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Order, OrderRequest, Quote, QuoteRequest } from '../models/order.models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  quote(body: QuoteRequest) {
    return this.http.post<Quote>(`${this.api}/cart/quote/`, body);
  }

  create(body: OrderRequest) {
    return this.http.post<Order>(`${this.api}/orders/`, body);
  }
}