import { Component, inject } from '@angular/core';
import { CartService } from '../../../core/services/cart.service';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';

@Component({
  imports: [RouterLink, CurrencyPipe],
  selector: 'app-cart-page',
  styleUrl: './cart-page.css',
  templateUrl: './cart-page.html',
})
export class CartPage {
  protected readonly cart = inject(CartService);
}
