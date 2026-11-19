import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models/catalog.models';
import { CartPrompt } from '../../core/services/cart-prompt.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  imports: [RouterLink, CurrencyPipe],
  selector: 'app-product-card',
  styleUrl: './product-card.css',
  templateUrl: './product-card.html',
})
export class ProductCard {
  private readonly cart = inject(CartService);
  private readonly prompt = inject(CartPrompt);

  readonly product = input.required<Product>();

  private readonly atLimit = computed(
    () => this.cart.quantityOf(this.product().id) >= this.product().stock,
  );

  protected readonly disabled = computed(() => !this.product().in_stock || this.atLimit());

  protected readonly label = computed(() => {
    if (!this.product().in_stock) return 'Indisponível';
    if (this.atLimit()) return 'Máximo no carrinho';
    return 'Adicionar ao carrinho';
  });

  protected addToCart() {
    if (this.cart.add(this.product())) {
      this.prompt.itemAdded(this.product().name);
    }
  }
}