import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CartService } from '../services/cart.service';

export const cartNotEmptyGuard: CanActivateFn = () => {
  const hasItems = inject(CartService).items().length > 0;
  return hasItems ? true : inject(Router).createUrlTree(['/carrinho']);
};