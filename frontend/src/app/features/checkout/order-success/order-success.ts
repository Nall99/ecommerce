import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Order, PaymentMethod } from '../../../core/models/order.models';

@Component({
  selector: 'app-order-success',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './order-success.html',
})
export class OrderSuccess {
  private readonly router = inject(Router);

  // O pedido chega pelo state da navegação (sobrevive ao F5, mas não a abrir a URL direto)
  protected readonly order: Order | null = history.state?.order ?? null;

  protected readonly paymentLabels: Record<PaymentMethod, string> = {
    pix: 'Pix',
    card: 'Cartão de crédito',
    boleto: 'Boleto bancário',
  };

  constructor() {
    if (!this.order) this.router.navigate(['/'], { replaceUrl: true });
  }
}