
import { Product, Order, AppConfig, OrderStatus, Category } from '../types';
import { INITIAL_PRODUCTS, DEFAULT_CONFIG, INITIAL_CATEGORIES } from '../constants';

const DB_KEYS = {
  PRODUCTS: 'electrotech_products_v2',
  CATEGORIES: 'electrotech_categories_v2',
  ORDERS: 'electrotech_orders_v2',
  CONFIG: 'electrotech_config_v2'
};

export class StoreService {
  private static getStored<T>(key: string, defaultValue: T): T {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  }

  private static setStored<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Categories
  static getCategories(): Category[] {
    return this.getStored<Category[]>(DB_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }

  static saveCategory(category: Category): void {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === category.id);
    if (index >= 0) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    this.setStored(DB_KEYS.CATEGORIES, categories);
  }

  static deleteCategory(id: string): void {
    const categories = this.getCategories().filter(c => c.id !== id);
    this.setStored(DB_KEYS.CATEGORIES, categories);
    // Opcional: Manejar productos huérfanos si se elimina una categoría
  }

  // Products
  static getProducts(): Product[] {
    return this.getStored<Product[]>(DB_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }

  static saveProduct(product: Product): void {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    this.setStored(DB_KEYS.PRODUCTS, products);
  }

  static deleteProduct(id: string): void {
    const products = this.getProducts().filter(p => p.id !== id);
    this.setStored(DB_KEYS.PRODUCTS, products);
  }

  // Orders
  static getOrders(): Order[] {
    return this.getStored<Order[]>(DB_KEYS.ORDERS, []);
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

  // Config
  static getConfig(): AppConfig {
    return this.getStored<AppConfig>(DB_KEYS.CONFIG, DEFAULT_CONFIG);
  }

  static saveConfig(config: AppConfig): void {
    this.setStored(DB_KEYS.CONFIG, config);
  }
}
