export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: string; // o DRF serializa Decimal como string
  image_url: string;
  category: Category;
  in_stock: boolean;
}

export interface ProductFull extends Product {
  description: string;
  stock: number;
}

export interface Page<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ProductQuery {
  search?: string | null;
  category?: string | null;
  ordering?: string | null;
  page?: number | string | null;
}
