import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Product, CartItem, Category, Order, OrderStatus } from './types';
import { StoreService } from './services/storeService';
import { CartDrawer } from './components/CartDrawer';
import { AdminPanel } from './components/AdminPanel';

const StoreHome: React.FC<{ addToCart: (p: Product) => void }> = ({ addToCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await StoreService.init();
      setProducts(StoreService.getProducts());
      setCategories(StoreService.getCategories());
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = activeCategoryId === 'all' || p.categoryId === activeCategoryId;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch && p.available;
    });
  }, [products, activeCategoryId, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto hide-scrollbar">
          <button 
            onClick={() => setActiveCategoryId('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${activeCategoryId === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${activeCategoryId === cat.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
            >
              {cat.name}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.map(product => (
          <div key={product.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col">
            <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(product)}>
              <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm">
                ${product.price}
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                {categories.find(c => c.id === product.categoryId)?.name || 'General'}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-2 truncate">{product.name}</h3>
              <p className="text-sm text-slate-500 mb-6 line-clamp-2 flex-1">{product.description}</p>
              <button 
                onClick={() => addToCart(product)}
                className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold transition-all hover:bg-slate-800"
              >
                Agregar al Carrito
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-slate-500 hover:text-slate-900">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <div className="w-full md:w-1/2 aspect-square">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
            </div>
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
              <span className="inline-block bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold mb-6 self-start">
                {categories.find(c => c.id === selectedProduct.categoryId)?.name || 'General'}
              </span>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">{selectedProduct.name}</h2>
              <div className="text-2xl font-bold text-slate-900 mb-6">${selectedProduct.price}</div>
              <p className="text-slate-600 mb-10 leading-relaxed flex-1 whitespace-pre-wrap">{selectedProduct.description}</p>
              <button 
                onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition"
              >
                Añadir al Carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CheckoutPage: React.FC<{ items: CartItem[], clearCart: () => void }> = ({ items, clearCart }) => {
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

  if (orderComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <i className="fa-solid fa-check text-3xl"></i>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">¡Pedido Realizado!</h1>
        <p className="text-slate-600 mb-8">Número: <span className="font-bold">{orderComplete.orderNumber}</span></p>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
          <h2 className="font-bold mb-4 uppercase text-xs tracking-widest text-slate-400">Escanea para pagar</h2>
          <img src={config.qrCodeUrl} alt="Pago QR" className="w-64 h-64 mx-auto rounded-xl border p-2 mb-8 object-contain" />
          <button 
            onClick={() => {
              const text = encodeURIComponent(`Hola, envío comprobante para el pedido ${orderComplete.orderNumber}`);
              window.open(`https://wa.me/${config.whatsappNumber}?text=${text}`, '_blank');
            }}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
          >
            <i className="fa-brands fa-whatsapp text-xl"></i>
            Enviar Comprobante
          </button>
        </div>
        <Link to="/" className="text-slate-500 hover:text-slate-900 font-medium">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold mb-8">Datos de Entrega</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input required type="text" placeholder="Tu nombre" className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-slate-900" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input required type="tel" placeholder="Tu WhatsApp" className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-slate-900" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          <textarea required placeholder="Dirección de envío" className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-slate-900" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          <button type="submit" disabled={items.length === 0} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl">Confirmar Pedido</button>
        </form>
      </div>
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-fit sticky top-24">
        <h2 className="text-xl font-bold mb-6">Resumen</h2>
        <div className="space-y-4 mb-6">
          {items.map(item => (
            <div key={item.product.id} className="flex justify-between text-sm">
              <span>{item.quantity}x {item.product.name}</span>
              <span className="font-bold">${(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-4 flex justify-between">
          <span className="font-bold">Total</span>
          <span className="text-2xl font-bold">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

const AdminAuth: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const config = StoreService.getConfig();
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === config.adminPassword) setIsLoggedIn(true);
    else alert('Error');
  };
  if (isLoggedIn) return <AdminPanel />;
  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-lg space-y-4">
        <h2 className="text-xl font-bold text-center mb-6">Acceso Admin</h2>
        <input type="password" placeholder="Contraseña" className="w-full p-4 rounded-2xl bg-slate-50 border-none" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl">Entrar</button>
      </form>
    </div>
  );
};

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => item.product.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.product.id !== id));
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 h-20">
          <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 font-black text-xl italic tracking-tighter">ELECTROTECH</Link>
            <div className="flex gap-4 items-center">
              <Link to="/admin" className="text-sm font-bold text-slate-400 hover:text-slate-900 transition">ADMIN</Link>
              <button onClick={() => setIsCartOpen(true)} className="relative p-3 bg-slate-100 rounded-xl">
                <i className="fa-solid fa-bag-shopping"></i>
                {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">{cartCount}</span>}
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
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} onCheckout={() => { setIsCartOpen(false); window.location.hash = '#/checkout'; }} />
      </div>
    </HashRouter>
  );
};

export default App;