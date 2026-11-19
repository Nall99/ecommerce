export type PaymentMethod = 'pix' | 'card' | 'boleto';

export interface RequestItem {
  product_id: number;
  quantity: number;
}

export interface QuoteRequest {
  items: RequestItem[];
  coupon_code?: string | null;
}

export interface Quote {
  items: { product_id: number; name: string; unit_price: string; quantity: number; line_total: string }[];
  subtotal: string;
  discount: string;
  shipping: string;
  total: string;
  coupon: { code: string; description: string } | null;
  free_shipping_from: string;
}

export interface CustomerData {
  customer_name: string;
  email: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  payment_method: PaymentMethod;
}

export type OrderRequest = QuoteRequest & CustomerData;

export interface Order {
  id: number;
  number: string;
  customer_name: string;
  email: string;
  payment_method: PaymentMethod;
  status: string;
  subtotal: string;
  discount: string;
  shipping: string;
  total: string;
  coupon_code: string;
  created_at: string;
  items: { product_name: string; unit_price: string; quantity: number; line_total: string }[];
}