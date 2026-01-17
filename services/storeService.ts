import { Product, Order, AppConfig, OrderStatus, Category } from '../types';
import { DEFAULT_CONFIG } from '../constants';

const DB_KEYS = {
  PRODUCTS: 'electrotech_products_v2',
  CATEGORIES: 'electrotech_categories_v2',
  ORDERS: 'electrotech_orders_v2',
  CONFIG: 'electrotech_config_v2',
  INITIALIZED: 'electrotech_initialized'
};

export class StoreService {
  private static initialized = false;

  static async init(): Promise<void> {
    if (this.initialized) return;
    
    const isInitialized = localStorage.getItem(DB_KEYS.INITIALIZED);
    
    if (!isInitialized) {
      try {
        const products = [
          {
            "id": "1",
            "name": "iPhone 15 Pro Max",
            "price": 1299,
            "image": "https://picsum.photos/seed/iphone15/600/400",
            "categoryId": "cat1",
            "description": "El iPhone más potente hasta la fecha con chip A17 Pro y cámara de 48MP.",
            "stock": 10,
            "available": true
          },
          {
            "id": "2",
            "name": "Sony WH-1000XM5",
            "price": 349,
            "image": "https://picsum.photos/seed/sony-xm5/600/400",
            "categoryId": "cat3",
            "description": "Audífonos con la mejor cancelación de ruido de la industria y sonido de alta fidelidad.",
            "stock": 15,
            "available": true
          }
        ];
        const categories = [
          { "id": "cat1", "name": "Celulares" },
          { "id": "cat2", "name": "Accesorios" },
          { "id": "cat3", "name": "Audio" }
        ];
        
        this.setStored(DB_KEYS.PRODUCTS, products);
        this.setStored(DB_KEYS.CATEGORIES, categories);
        localStorage.setItem(DB_KEYS.INITIALIZED, 'true');
      } catch (error) {
        console.error("Error cargando datos iniciales:", error);
      }
    }
    this.initialized = true;
  }

  private static getStored<T>(key: string, defaultValue: T): T {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  }

  private static setStored<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  static getCategories(): Category[] {
    return this.getStored<Category[]>(DB_KEYS.CATEGORIES, []);
  }

  static saveCategory(category: Category): void {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === category.id);
    if (index >= 0) categories[index] = category;
    else categories.push(category);
    this.setStored(DB_KEYS.CATEGORIES, categories);
  }

  static deleteCategory(id: string): void {
    const categories = this.getCategories().filter(c => c.id !== id);
    this.setStored(DB_KEYS.CATEGORIES, categories);
  }

  static getProducts(): Product[] {
    return this.getStored<Product[]>(DB_KEYS.PRODUCTS, []);
  }

  static saveProduct(product: Product): void {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) products[index] = product;
    else products.push(product);
    this.setStored(DB_KEYS.PRODUCTS, products);
  }

  static deleteProduct(id: string): void {
    const products = this.getProducts().filter(p => p.id !== id);
    this.setStored(DB_KEYS.PRODUCTS, products);
  }

  static getOrders(): Order[] {
    return this.getStored<Order[]>(DB_KEYS.ORDERS, []);
  }

  static getOrderById(id: string): Order | undefined {
    return this.getOrders().find(o => o.id === id);
  }

  static createOrder(order: Omit<Order, 'orderNumber' | 'id' | 'date' | 'status'>): Order {
    const orders = this.getOrders();
    const nextNum = (orders.length + 1).toString().padStart(3, '0');
    
    const newOrder: Order = {
      ...order,
      id: crypto.randomUUID(),
      orderNumber: `#${nextNum}`,
      date: new Date().toISOString(),
      status: OrderStatus.Pending
    };
    
    orders.push(newOrder);
    this.setStored(DB_KEYS.ORDERS, orders);
    return newOrder;
  }

  static updateOrderStatus(id: string, status: OrderStatus): void {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index >= 0) {
      orders[index].status = status;
      this.setStored(DB_KEYS.ORDERS, orders);
    }
  }

  static getConfig(): AppConfig {
    return this.getStored<AppConfig>(DB_KEYS.CONFIG, DEFAULT_CONFIG);
  }

  static saveConfig(config: AppConfig): void {
    this.setStored(DB_KEYS.CONFIG, config);
  }
}