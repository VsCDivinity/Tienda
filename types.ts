
export interface Category {
  id: string;
  name: string;
}

export enum OrderStatus {
  Pending = 'En cola',
  Accepted = 'Aceptado',
  Shipping = 'En camino',
  Delivered = 'Entregado'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string; // Puede ser URL o Base64
  categoryId: string; // Referencia al ID de la categoría
  description: string;
  stock: number;
  available: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  items: CartItem[];
  status: OrderStatus;
  total: number;
  date: string;
}

export interface AppConfig {
  qrCodeUrl: string;
  whatsappNumber: string;
  adminPassword: string;
}
