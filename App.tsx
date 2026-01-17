
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Product, CartItem, Category, Order, OrderStatus } from './types';
import { StoreService } from './services/storeService';
import { CartDrawer } from './components/CartDrawer';
import { AdminPanel } from './components/AdminPanel';

// --- Home Component ---
const StoreHome: React.FC<{ addToCart: (p: Product) => void }> = ({ addToCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    setProducts(StoreService.getProducts());
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch && p.available;
    });
  }, [products, activeCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto hide-scrollbar">
          <button 
            onClick={() => setActiveCategory('Todos')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${activeCategory === 'Todos' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            Todos
          </button>
          {Object.values(Category).map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${activeCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text"
            placeholder="Buscar productos..."
            className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-slate-400 outline-none transition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.map(product => (
          <div 
            key={product.id} 
            className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col"
          >
            <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(product)}>
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm">
                ${product.price}
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{product.category}</span>
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => setSelectedProduct(product)}>
                {product.name}
              </h3>
              <p className="text-sm text-slate-500 mb-6 line-clamp-2 flex-1">{product.description}</p>
              <button 
                onClick={() => addToCart(product)}
                className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-cart-plus"></i>
                Agregar
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <i className="fa-solid fa-magnifying-glass text-5xl text-slate-200 mb-6"></i>
          <h2 className="text-xl font-medium text-slate-500">No encontramos productos en esta búsqueda</h2>
        </div>
      )}

      {/* Quick View Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-slate-500 hover:text-slate-900">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <div className="w-full md:w-1/2 aspect-square">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
            </div>
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
              <span className="inline-block bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold mb-6 self-start">
                {selectedProduct.category}
              </span>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">{selectedProduct.name}</h2>
              <div className="text-2xl font-bold text-slate-900 mb-6">${selectedProduct.price}</div>
              <p className="text-slate-600 mb-10 leading-relaxed flex-1">{selectedProduct.description}</p>
              <button 
                onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition"
              >
                Agregar al Carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Checkout Component ---
const CheckoutPage: React.FC<{ items: CartItem[], clearCart: () => void }> = ({ items, clearCart }) => {
  const navigate = useNavigate();
  const config = StoreService.getConfig();
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [orderComplete, setOrderComplete] = useState<Order | null>(null);

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    const order = StoreService.createOrder({
      customerName: formData.name,
      phone: formData.phone,
      address: formData.address,
      items: [...items],
      total: total
    });

    setOrderComplete(order);
    clearCart();
  };

  const handleWhatsApp = () => {
    if (!orderComplete) return;
    
    const itemStrings = orderComplete.items.map(i => `${i.quantity}x ${i.product.name}`).join('\n');
    const text = encodeURIComponent(
      `🛒 *NUEVO PEDIDO DE ELECTROTECH*\n\n` +
      `*Número de Pedido:* ${orderComplete.orderNumber}\n` +
      `*Cliente:* ${orderComplete.customerName}\n` +
      `*Dirección:* ${orderComplete.address}\n\n` +
      `*Productos:*\n${itemStrings}\n\n` +
      `*Total:* $${orderComplete.total.toFixed(2)}\n\n` +
      `_Adjunto comprobante de pago y ubicación exacta por aquí._`
    );
    
    window.open(`https://wa.me/${config.whatsappNumber}?text=${text}`, '_blank');
  };

  if (orderComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <i className="fa-solid fa-check text-3xl"></i>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">¡Pedido Realizado con Éxito!</h1>
        <p className="text-slate-600 mb-8">Tu número de pedido es <span className="font-bold text-slate-900">{orderComplete.orderNumber}</span></p>
        
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
          <h2 className="font-bold mb-4">Paso Final: Realizar Pago</h2>
          <p className="text-sm text-slate-500 mb-6">Escanea el código QR para realizar la transferencia de <strong>${orderComplete.total.toFixed(2)}</strong></p>
          <img src={config.qrCodeUrl} alt="Pago QR" className="w-64 h-64 mx-auto rounded-xl border p-2 mb-6" />
          <button 
            onClick={handleWhatsApp}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition"
          >
            <i className="fa-brands fa-whatsapp text-xl"></i>
            Enviar Confirmación por WhatsApp
          </button>
        </div>
        
        <Link to="/" className="text-slate-500 hover:text-slate-900 font-medium">Volver a la tienda</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div>
        <h1 className="text-3xl font-bold mb-8">Finalizar Pedido</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Nombre Completo</label>
            <input 
              required
              type="text"
              className="w-full px-4 py-3 rounded-2xl bg-white border-none shadow-sm focus:ring-2 focus:ring-slate-900 outline-none transition"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono de Contacto</label>
            <input 
              required
              type="tel"
              className="w-full px-4 py-3 rounded-2xl bg-white border-none shadow-sm focus:ring-2 focus:ring-slate-900 outline-none transition"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Dirección de Entrega / Ubicación</label>
            <textarea 
              required
              rows={3}
              className="w-full px-4 py-3 rounded-2xl bg-white border-none shadow-sm focus:ring-2 focus:ring-slate-900 outline-none transition"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>
          <button 
            type="submit" 
            disabled={items.length === 0}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 disabled:bg-slate-300 transition"
          >
            Confirmar Pedido (${total.toFixed(2)})
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-fit sticky top-24">
        <h2 className="text-xl font-bold mb-6">Resumen del Pedido</h2>
        <div className="space-y-4 mb-8">
          {items.map(item => (
            <div key={item.product.id} className="flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <img src={item.product.image} className="w-12 h-12 rounded-lg object-cover" />
                <span className="text-sm font-medium">{item.quantity}x {item.product.name}</span>
              </div>
              <span className="font-semibold text-sm">${(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-4 flex justify-between items-center">
          <span className="text-lg font-bold">Total a Pagar</span>
          <span className="text-2xl font-bold text-slate-900">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

// --- Admin Login Wrapper ---
const AdminAuth: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const config = StoreService.getConfig();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === config.adminPassword) {
      setIsLoggedIn(true);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  if (isLoggedIn) return <AdminPanel />;

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-lg text-center">
        <i className="fa-solid fa-lock text-4xl text-slate-200 mb-6"></i>
        <h2 className="text-2xl font-bold mb-6">Acceso Administrador</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="password" 
            placeholder="Introduce la contraseña"
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-none shadow-inner focus:ring-2 focus:ring-slate-900 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-2xl hover:bg-slate-800 transition">
            Entrar al Panel
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Main App ---
const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [newOrderNotify, setNewOrderNotify] = useState(false);

  // Sync cart count with favicon/title or notification
  useEffect(() => {
    const checkOrders = setInterval(() => {
       const orders = StoreService.getOrders();
       const hasNew = orders.some(o => o.status === OrderStatus.Pending);
       setNewOrderNotify(hasNew);
    }, 5000);
    return () => clearInterval(checkOrders);
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white transition group-hover:rotate-12">
                <i className="fa-solid fa-bolt-lightning text-xl"></i>
              </div>
              <span className="text-xl font-black tracking-tighter text-slate-900">ELECTROTECH</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link to="/admin" className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition relative">
                <i className="fa-solid fa-user-shield"></i>
                Admin
                {newOrderNotify && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
              </Link>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-3 bg-slate-50 text-slate-900 rounded-2xl hover:bg-slate-100 transition"
              >
                <i className="fa-solid fa-cart-shopping text-lg"></i>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 bg-slate-50">
          <Routes>
            <Route path="/" element={<StoreHome addToCart={addToCart} />} />
            <Route path="/checkout" element={<CheckoutPage items={cart} clearCart={() => setCart([])} />} />
            <Route path="/admin" element={<AdminAuth />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-slate-100 py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center gap-8 mb-8 text-slate-400">
              <i className="fa-brands fa-instagram text-2xl hover:text-slate-900 cursor-pointer"></i>
              <i className="fa-brands fa-facebook text-2xl hover:text-slate-900 cursor-pointer"></i>
              <i className="fa-brands fa-twitter text-2xl hover:text-slate-900 cursor-pointer"></i>
            </div>
            <p className="text-slate-500 text-sm">© 2024 ElectroTech. Todos los derechos reservados.</p>
          </div>
        </footer>

        <CartDrawer 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onCheckout={() => { setIsCartOpen(false); window.location.hash = '#/checkout'; }}
        />
      </div>
    </HashRouter>
  );
};

export default App;
