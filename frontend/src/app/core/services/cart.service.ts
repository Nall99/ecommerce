import { Injectable, computed, effect, signal } from '@angular/core';
import { Product } from '../models/catalog.models';

export interface CartItem {
  id: number;
  slug: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  stock: number;
}

const STORAGE_KEY = 'shop.cart.v1';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>(this.load());

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((sum, i) => sum + i.quantity, 0));
  readonly subtotal = computed(() =>
    this._items().reduce((sum, i) => sum + i.price * i.quantity, 0),
  );

  constructor() {
    effect(() => this.save(this._items()));
  }

  quantityOf(productId: number): number {
    return this._items().find((i) => i.id === productId)?.quantity ?? 0;
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
      inCart > 0
        ? items.map((i) => (i.id === product.id ? item : i))
        : [...items, item],
    );
    return true;
  }

  setQuantity(productId: number, quantity: number) {
    if (quantity <= 0) return this.remove(productId);
    this._items.update((items) =>
      items.map((i) =>
        i.id === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i,
      ),
    );
  }

  remove(productId: number) {
    this._items.update((items) => items.filter((i) => i.id !== productId));
  }

  clear() {
    this._items.set([]);
  }

  private load(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  private save(items: CartItem[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // armazenamento indisponível (modo privado, cota cheia): segue em memória
    }
  }
}
