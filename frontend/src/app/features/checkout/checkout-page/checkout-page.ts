import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { PaymentMethod } from '../../../core/models/order.models';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { QuoteService } from '../../../core/services/quote.service';
import { apiErrorMessage } from '../../../core/utils/api-errors';
import { OrderTotals } from '../../../shared/order-totals/order-totals';

interface ViaCep {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
}

@Component({
  selector: 'app-checkout-page',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, OrderTotals],
  templateUrl: './checkout-page.html',
})
export class CheckoutPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly orders = inject(OrderService);
  private readonly quoteService = inject(QuoteService);
  private readonly cart = inject(CartService);

  protected readonly submitting = signal(false);
  protected readonly error = signal('');

  protected readonly methods: { value: PaymentMethod; label: string; hint: string }[] = [
    { value: 'pix', label: 'Pix', hint: 'Aprovação imediata' },
    { value: 'card', label: 'Cartão', hint: 'Simulado, sem dados de cartão' },
    { value: 'boleto', label: 'Boleto', hint: 'Compensação em até 3 dias úteis' },
  ];

  protected readonly form = this.fb.group({
    customer_name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\D*(\d\D*){10,11}$/)]],
    cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
    street: ['', Validators.required],
    number: ['', Validators.required],
    complement: [''],
    neighborhood: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{2}$/)]],
    payment_method: ['pix' as PaymentMethod, Validators.required],
  });

  protected readonly q = computed(() => {
    const s = this.quoteService.state();
    return s.status === 'ok' ? s.quote : null;
  });

  protected readonly stateError = computed(() => {
    const s = this.quoteService.state();
    return s.status === 'error' ? s.message : '';
  });

  protected cls(name: string) {
    const base =
      'mt-1 h-11 w-full rounded-xl border bg-white px-4 text-sm outline-none focus:border-brand ';
    return base + (this.showError(name) ? 'border-red-500' : 'border-stone-300');
  }

  protected err(name: string) {
    if (!this.showError(name)) return '';
    return this.form.get(name)!.hasError('required') ? 'Campo obrigatório.' : 'Valor inválido.';
  }

  private showError(name: string) {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  /** Preenche o endereço a partir do CEP (serviço público ViaCEP). */
  protected lookupCep() {
    const digits = this.form.controls.cep.value.replace(/\D/g, '');
    if (digits.length !== 8) return;

    this.http.get<ViaCep>(`https://viacep.com.br/ws/${digits}/json/`).subscribe({
      next: (d) => {
        if (d.erro) return;
        this.form.patchValue({
          street: d.logradouro ?? '',
          neighborhood: d.bairro ?? '',
          city: d.localidade ?? '',
          state: d.uf ?? '',
        });
      },
      error: () => {}, // sem problema: a pessoa preenche manualmente
    });
  }

  protected submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.submitting()) return;

    this.submitting.set(true);
    this.error.set('');

    this.orders
      .create({
        ...this.form.getRawValue(),
        items: this.cart.toRequestItems(),
        coupon_code: this.cart.coupon(),
      })
      .subscribe({
        next: (order) => {
          this.cart.clear();
          this.router.navigate(['/pedido/confirmado'], { state: { order } });
        },
        error: (err) => {
          this.error.set(apiErrorMessage(err));
          this.submitting.set(false);
        },
      });
  }
}