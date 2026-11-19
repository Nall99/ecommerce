import { Injectable, computed, effect, signal } from '@angular/core';
import { Product } from '../models/catalog.models';
import { RequestItem } from '../models/order.models';

export interface CartItem {
  id: number;
  slug: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  stock: number;
}

const CART_KEY = 'shop.cart.v1';
const COUPON_KEY = 'shop.coupon.v1';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>(this.loadItems());
  private readonly _coupon = signal<string | null>(this.loadCoupon());

  readonly items = this._items.asReadonly();
  readonly coupon = this._coupon.asReadonly();
  readonly count = computed(() => this._items().reduce((sum, i) => sum + i.quantity, 0));
  readonly subtotal = computed(() =>
    this._items().reduce((sum, i) => sum + i.price * i.quantity, 0),
  );

  constructor() {
    effect(() => this.write(CART_KEY, JSON.stringify(this._items())));
    effect(() => {
      const code = this._coupon();
      code ? this.write(COUPON_KEY, code) : this.remove_(COUPON_KEY);
    });
  }

  quantityOf(productId: number): number {
    return this._items().find((i) => i.id === productId)?.quantity ?? 0;
  }

  /** Itens no formato que a API espera (só id e quantidade). */
  toRequestItems(): RequestItem[] {
    return this._items().map((i) => ({ product_id: i.id, quantity: i.quantity }));
  }

  /** Retorna false quando nada foi adicionado (estoque já atingido). */
  add(product: Product, quantity = 1): boolean {
    const inCart = this.quantityOf(product.id);
    const next = Math.min(inCart + quantity, product.stock);
    if (next <= inCart) return false;

    const item: CartItem = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url,
      quantity: next,
      stock: product.stock,
    };

    this._items.update((items) =>
      inCart > 0 ? items.map((i) => (i.id === product.id ? item : i)) : [...items, item],
    );
    return true;
  }

  setQuantity(productId: number, quantity: number) {
    if (quantity <= 0) return this.remove(productId);
    this._items.update((items) =>
      items.map((i) => (i.id === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i)),
    );
  }

  remove(productId: number) {
    this._items.update((items) => items.filter((i) => i.id !== productId));
  }

  setCoupon(code: string) {
    this._coupon.set(code.trim().toUpperCase() || null);
  }

  clearCoupon() {
    this._coupon.set(null);
  }

  clear() {
    this._items.set([]);
    this._coupon.set(null);
  }

  private loadItems(): CartItem[] {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const data = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(data)) return [];
      return data.filter(
        (i) =>
          Number.isFinite(i?.price) &&
          Number.isFinite(i?.stock) &&
          Number.isFinite(i?.quantity) &&
          i.quantity > 0,
      );
    } catch {
      return [];
    }
  }

  private loadCoupon(): string | null {
    try {
      return localStorage.getItem(COUPON_KEY);
    } catch {
      return null;
    }
  }

  private write(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // armazenamento indisponível: segue em memória
    }
  }

  private remove_(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {
      // idem
    }
  }
}