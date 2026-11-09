import { Component, input, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../core/models/catalog.models';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

@Component({
  imports: [CurrencyPipe, RouterLink],
  selector: 'app-product-card',
  styleUrl: './product-card.css',
  templateUrl: './product-card.html',
})
export class ProductCard {
  private readonly cart = inject(CartService);

  readonly product = input.required<Product>();
  protected readonly added = signal(false);

  private readonly atLimit = computed(
    () => this.cart.quantityOf(this.product().id) >= this.product().stock,
  );

  protected readonly disabled = computed(() => !this.product().in_stock || this.atLimit());

  protected readonly label = computed(() => {
    if (!this.product().in_stock) return 'Indisponível';
    if (this.added()) return 'Adicionado ✓';
    if (this.atLimit()) return 'Máximo no carrinho';
    return 'Adicionar ao carrinho';
  });

  protected addToCart() {
    if (this.cart.add(this.product())) {
      this.added.set(true);
      setTimeout(() => this.added.set(false), 1500);
    }
  }
}
