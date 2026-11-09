import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Início',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'produtos',
    title: 'Produtos',
    loadComponent: () =>
      import('./features/catalog/product-list/product-list').then((m) => m.ProductList),
  },
  {
    path: 'produtos/:slug',
    title: 'Produto',
    loadComponent: () =>
      import('./features/catalog/product-detail/product-detail').then((m) => m.ProductDetail),
  },
  {
    path: 'carrinho',
    title: 'Carrinho',
    loadComponent: () => import('./features/cart/cart-page/cart-page').then((m) => m.CartPage),
  },
  { path: '**', redirectTo: '' },
];
