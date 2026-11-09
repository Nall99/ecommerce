export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  image_url: string;
  category: Category;
  in_stock: boolean;
  stock: number;
}

export interface ProductFull extends Product {
  description: string;
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
