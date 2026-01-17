import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import { Product, CartItem, Category, Order, OrderStatus } from './types';
import { StoreService } from './services/storeService';
import { CartDrawer } from './components/CartDrawer';
import { AdminPanel } from './components/AdminPanel';

// --- PÁGINA DE SEGUIMIENTO ---
const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const found = StoreService.getOrderById(id);
      if (found) setOrder(found);
    }
    setLoading(false);
  }, [id]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] font-bold text-slate-400 uppercase tracking-widest">Cargando Seguimiento...</div>;
  if (!order) return <div className="p-20 text-center font-bold text-red-500">PEDIDO NO ENCONTRADO</div>;

  const statuses = Object.values(OrderStatus);
  const currentStep = statuses.indexOf(order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[5rem] -z-0 opacity-50"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter mb-2 text-slate-900">MI PEDIDO</h1>
              <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">NÚMERO: {order.orderNumber}</p>
            </div>
            <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
              order.status === OrderStatus.Delivered ? 'bg-green-500 text-white' : 'bg-slate-900 text-white'
            }`}>
              {order.status}
            </div>
          </div>

          {/* Línea de tiempo visual minimalista */}
          <div className="relative flex justify-between mb-20 px-4">
            <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 -z-0 rounded-full"></div>
            <div className="absolute top-5 left-0 h-1 bg-slate-900 transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(15,23,42,0.3)]" 
                 style={{ width: `${(currentStep / (statuses.length - 1)) * 100}%` }}></div>
            
            {statuses.map((s, i) => (
              <div key={s} className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center bg-white transition-all duration-500 ${
                  i <= currentStep ? 'border-slate-900 text-slate-900 scale-110' : 'border-slate-100 text-slate-300'
                }`}>
                  <i className={`fa-solid ${
                    s === OrderStatus.Pending ? 'fa-clock' :
                    s === OrderStatus.Accepted ? 'fa-thumbs-up' :
                    s === OrderStatus.Shipping ? 'fa-truck-fast' : 'fa-house-circle-check'
                  } text-sm`}></i>
                </div>
                <span className={`text-[9px] font-black mt-4 absolute -bottom-8 whitespace-nowrap uppercase tracking-tighter transition-colors duration-500 ${
                  i <= currentStep ? 'text-slate-900' : 'text-slate-300'
                }`}>{s}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16 pt-10 border-t border-slate-100">
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase text-slate-900 mb-6 tracking-[0.2em] flex items-center gap-2">
                <span className="w-2 h-2 bg-slate-900 rounded-full"></span> RESUMEN DE COMPRA
              </h3>
              <div className="space-y-4">
                {order.items.map(item => (
                  <div key={item.product.id} className="flex justify-between items-center text-sm group">
                    <span className="text-slate-500 flex items-center gap-2">
                      <span className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-900">{item.quantity}</span>
                      {item.product.name}
                    </span>
                    <span className="font-bold text-slate-900 tracking-tighter">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-slate-100 pt-5 flex justify-between items-end">
                  <span className="font-black text-slate-400 text-xs tracking-widest">TOTAL PAGADO</span>
                  <span className="font-black text-3xl text-slate-900 tracking-tighter">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
              <h3 className="text-xs font-black uppercase text-slate-400 mb-6 tracking-[0.2em] flex items-center gap-2">
                 DATOS DE ENVÍO
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cliente</p>
                  <p className="font-bold text-slate-900">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contacto</p>
                  <p className="text-sm text-slate-600">{order.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dirección</p>
                  <p className="text-sm text-slate-600 leading-relaxed italic">"{order.address}"</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-6">
            <Link to="/" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition shadow-xl active:scale-95">
              ← Volver al Catálogo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

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
            className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition whitespace-nowrap ${activeCategoryId === 'all' ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 hover:bg-slate-100'}`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition whitespace-nowrap ${activeCategoryId === cat.id ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 hover:bg-slate-100'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text"
            placeholder="BUSCAR PRODUCTOS..."
            className="w-full pl-14 pr-6 py-4 bg-white border-none rounded-[1.5rem] shadow-sm focus:ring-2 focus:ring-slate-900 outline-none transition uppercase text-xs font-bold tracking-widest"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.map(product => (
          <div key={product.id} className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col">
            <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={() => setSelectedProduct(product)}>
              <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black text-slate-900 shadow-md">
                ${product.price}
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3">
                {categories.find(c => c.id === product.categoryId)?.name || 'GENERAL'}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mb-3 truncate italic tracking-tighter">{product.name}</h3>
              <p className="text-sm text-slate-500 mb-8 line-clamp-2 flex-1 leading-relaxed">{product.description}</p>
              <button 
                onClick={() => addToCart(product)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-800 active:scale-95 shadow-lg"
              >
                Añadir
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden relative flex flex-col md:flex-row animate-in fade-in zoom-in duration-500" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedProduct(null)} 
              className="absolute top-6 right-6 z-20 w-12 h-12 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-slate-700 transition-all active:scale-90"
              title="Cerrar imagen completa"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <div className="w-full md:w-1/2 aspect-square">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
            </div>
            <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col">
              <span className="inline-block bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-8 self-start">
                {categories.find(c => c.id === selectedProduct.categoryId)?.name || 'General'}
              </span>
              <h2 className="text-5xl font-black text-slate-900 mb-6 italic tracking-tighter uppercase">{selectedProduct.name}</h2>
              <div className="text-3xl font-black text-slate-900 mb-8 tracking-tighter">${selectedProduct.price}</div>
              <p className="text-slate-500 mb-12 leading-relaxed flex-1 whitespace-pre-wrap text-lg">{selectedProduct.description}</p>
              <button 
                onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-800 transition shadow-2xl active:scale-95"
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

  const copyTrackingLink = (id: string) => {
    const link = `${window.location.origin}${window.location.pathname}#/track/${id}`;
    navigator.clipboard.writeText(link);
    alert('¡Link de seguimiento copiado!');
  };

  if (orderComplete) {
    const trackingLink = `${window.location.origin}${window.location.pathname}#/track/${orderComplete.id}`;
    
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
          <i className="fa-solid fa-check text-4xl"></i>
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 mb-4 uppercase">¡Pedido Recibido!</h1>
        <p className="text-slate-400 font-bold mb-10 uppercase tracking-widest text-xs">CÓDIGO: <span className="text-slate-900">{orderComplete.orderNumber}</span></p>
        
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 mb-10 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
          
          <h2 className="font-black mb-8 uppercase text-xs tracking-[0.3em] text-slate-400">PASO 1: REALIZAR PAGO</h2>
          <img src={config.qrCodeUrl} alt="Pago QR" className="w-64 h-64 mx-auto rounded-3xl border-4 border-slate-50 p-4 mb-10 object-contain shadow-sm" />
          
          <h2 className="font-black mb-8 uppercase text-xs tracking-[0.3em] text-slate-400 border-t pt-8">PASO 2: CONFIRMAR</h2>
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => {
                const text = encodeURIComponent(`Hola, envío comprobante para el pedido ${orderComplete.orderNumber}. Puedes seguir mi pedido aquí: ${trackingLink}`);
                const cleanNumber = config.whatsappNumber.replace(/\D/g, '');
                window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-black uppercase tracking-widest py-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95 text-xs"
            >
              <i className="fa-brands fa-whatsapp text-xl"></i>
              Enviar Comprobante por WhatsApp
            </button>
            
            <button 
              onClick={() => copyTrackingLink(orderComplete.id)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest py-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95 text-xs"
            >
              <i className="fa-solid fa-link"></i>
              Copiar Link de Seguimiento
            </button>
          </div>
        </div>
        
        <Link to={`/track/${orderComplete.id}`} className="text-slate-900 font-black uppercase text-[10px] tracking-widest border-b-2 border-slate-900 pb-1">Ir a mi Panel de Seguimiento</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-7 bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
        <h1 className="text-3xl font-black italic tracking-tighter text-slate-900 mb-10 uppercase">Datos de Envío</h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="group">
            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 block tracking-widest">Nombre Completo</label>
            <input required type="text" placeholder="EJ. JUAN PÉREZ" className="w-full p-5 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-slate-900 font-bold uppercase text-xs tracking-widest transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="group">
            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 block tracking-widest">WhatsApp de Contacto</label>
            <input required type="tel" placeholder="EJ. +59175307751" className="w-full p-5 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-slate-900 font-bold text-xs tracking-widest transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="group">
            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 block tracking-widest">Dirección Detallada</label>
            <textarea required rows={4} placeholder="CALLE, NÚMERO, BARRIO, REFERENCIAS..." className="w-full p-5 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-slate-900 font-bold uppercase text-xs tracking-widest transition-all resize-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>
          <button type="submit" disabled={items.length === 0} className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl shadow-2xl hover:bg-slate-800 transition active:scale-95 uppercase tracking-[0.3em] text-sm">
            Confirmar Compra
          </button>
        </form>
      </div>
      
      <div className="lg:col-span-5 flex flex-col gap-8">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 h-fit sticky top-28">
          <h2 className="text-xl font-black italic tracking-tighter text-slate-900 mb-8 uppercase">Resumen</h2>
          <div className="space-y-5 mb-8 max-h-[40vh] overflow-y-auto pr-2 hide-scrollbar">
            {items.map(item => (
              <div key={item.product.id} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <img src={item.product.image} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 tracking-tighter leading-none mb-1">{item.product.name}</span>
                    <span className="text-[10px] font-black text-slate-400">CANT: {item.quantity}</span>
                  </div>
                </div>
                <span className="font-black text-slate-900 tracking-tighter">${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 pt-6 flex justify-between items-end">
            <span className="font-black text-slate-400 text-xs tracking-[0.2em] uppercase">Total</span>
            <span className="text-4xl font-black text-slate-900 tracking-tighter">${total.toFixed(2)}</span>
          </div>
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
    else alert('Acceso Denegado');
  };
  if (isLoggedIn) return <AdminPanel />;
  return (
    <div className="max-w-md mx-auto py-24 px-4">
      <form onSubmit={handleLogin} className="bg-white p-10 rounded-[2.5rem] shadow-2xl space-y-6 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-900"></div>
        <div className="w-16 h-16 bg-slate-100 text-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <i className="fa-solid fa-fingerprint text-2xl"></i>
        </div>
        <h2 className="text-2xl font-black italic tracking-tighter text-center mb-8 uppercase">Acceso Admin</h2>
        <input type="password" placeholder="PASSWORD" className="w-full p-5 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-slate-900 text-center font-black tracking-[0.5em]" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-slate-800 transition active:scale-95 uppercase tracking-widest text-xs">Desbloquear</button>
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
      <div className="min-h-screen flex flex-col selection:bg-slate-900 selection:text-white">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 h-24">
          <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 font-black text-3xl italic tracking-tighter text-slate-900 group">
              <span className="bg-slate-900 text-white px-3 py-1 rounded-xl not-italic shadow-xl group-hover:rotate-12 transition-transform">E</span>LECTROTECH
            </Link>
            <div className="flex gap-6 items-center">
              <Link to="/admin" className="text-[10px] font-black text-slate-300 hover:text-slate-900 transition uppercase tracking-widest hidden sm:block">Admin Panel</Link>
              <button onClick={() => setIsCartOpen(true)} className="relative p-4 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all active:scale-90 shadow-sm">
                <i className="fa-solid fa-cart-flatbed text-slate-900"></i>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-4 border-white font-black shadow-lg">
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
            <Route path="/track/:id" element={<OrderTrackingPage />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-slate-100 py-16">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-8">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">ELECTROTECH &copy; 2025 // FUTURE OF TECH</p>
            <div className="flex gap-10 text-slate-300">
              <i className="fa-brands fa-instagram hover:text-slate-900 cursor-pointer transition text-2xl"></i>
              <i className="fa-brands fa-whatsapp hover:text-slate-900 cursor-pointer transition text-2xl"></i>
              <i className="fa-brands fa-facebook hover:text-slate-900 cursor-pointer transition text-2xl"></i>
            </div>
          </div>
        </footer>
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} onCheckout={() => { setIsCartOpen(false); window.location.hash = '#/checkout'; }} />
      </div>
    </HashRouter>
  );
};

export default App;