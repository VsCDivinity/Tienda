
import React from 'react';
import { Product, Category, AppConfig } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    price: 1299,
    image: 'https://picsum.photos/seed/iphone/600/400',
    category: Category.Celulares,
    description: 'El iPhone más potente hasta la fecha con chip A17 Pro y cámara de 48MP.',
    stock: 10,
    available: true
  },
  {
    id: '2',
    name: 'Sony WH-1000XM5',
    price: 349,
    image: 'https://picsum.photos/seed/headphones/600/400',
    category: Category.Audio,
    description: 'Audífonos con la mejor cancelación de ruido de la industria.',
    stock: 15,
    available: true
  },
  {
    id: '3',
    name: 'MacBook Air M2',
    price: 1099,
    image: 'https://picsum.photos/seed/macbook/600/400',
    category: Category.Computacion,
    description: 'Increíblemente delgada y rápida con el nuevo chip M2 de Apple.',
    stock: 5,
    available: true
  },
  {
    id: '4',
    name: 'Apple Watch Series 9',
    price: 399,
    image: 'https://picsum.photos/seed/watch/600/400',
    category: Category.Accesorios,
    description: 'Más capaz, más brillante, más potente.',
    stock: 20,
    available: true
  },
  {
    id: '5',
    name: 'Google Nest Hub (2nd Gen)',
    price: 99,
    image: 'https://picsum.photos/seed/nest/600/400',
    category: Category.SmartHome,
    description: 'El centro de tu hogar inteligente con asistente de Google integrado.',
    stock: 30,
    available: true
  }
];

export const DEFAULT_CONFIG: AppConfig = {
  qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PagoElectroTech',
  whatsappNumber: '5491122334455',
  adminPassword: 'admin'
};
