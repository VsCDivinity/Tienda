
import { Product, Category, AppConfig } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Celulares' },
  { id: 'cat2', name: 'Accesorios' },
  { id: 'cat3', name: 'Audio' },
  { id: 'cat4', name: 'Computación' },
  { id: 'cat5', name: 'Smart Home' }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    price: 1299,
    image: 'https://picsum.photos/seed/iphone/600/400',
    categoryId: 'cat1',
    description: 'El iPhone más potente hasta la fecha con chip A17 Pro y cámara de 48MP.',
    stock: 10,
    available: true
  },
  {
    id: '2',
    name: 'Sony WH-1000XM5',
    price: 349,
    image: 'https://picsum.photos/seed/headphones/600/400',
    categoryId: 'cat3',
    description: 'Audífonos con la mejor cancelación de ruido de la industria.',
    stock: 15,
    available: true
  }
];

export const DEFAULT_CONFIG: AppConfig = {
  qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PagoElectroTech',
  whatsappNumber: '5491122334455',
  adminPassword: 'admin'
};
