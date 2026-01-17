
import React, { useState, useEffect, useRef } from 'react';
import { StoreService } from '../services/storeService';
import { Product, Order, OrderStatus, Category, AppConfig } from '../types';
import { GeminiService } from '../services/geminiService';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'categories' | 'config'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [config, setConfig] = useState<AppConfig>(StoreService.getConfig());
  
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setOrders(StoreService.getOrders().reverse());
    setProducts(StoreService.getProducts());
    setCategories(StoreService.getCategories());
    setConfig(StoreService.getConfig());
  };

  const handleUpdateStatus = (id: string, status: OrderStatus) => {
    StoreService.updateOrderStatus(id, status);
    refreshData();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct(prev => prev ? { ...prev, image: reader.result as string } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct && editingProduct.name && editingProduct.price && editingProduct.categoryId) {
      StoreService.saveProduct({
        ...editingProduct as Product,
        id: editingProduct.id || crypto.randomUUID(),
        available: editingProduct.available ?? true,
        stock: editingProduct.stock ?? 0,
        image: editingProduct.image || 'https://picsum.photos/seed/default/600/400'
      });
      setEditingProduct(null);
      refreshData();
    }
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory && editingCategory.name) {
      StoreService.saveCategory({
        id: editingCategory.id || crypto.randomUUID(),
        name: editingCategory.name
      });
      setEditingCategory(null);
      refreshData();
    }
  };

  const generateAiDescription = async () => {
    if (!editingProduct?.name || !editingProduct?.categoryId) {
      alert("Por favor indica el nombre y categoría primero.");
      return;
    }
    const catName = categories.find(c => c.id === editingProduct.categoryId)?.name || '';
    setIsAiLoading(true);
    const desc = await GeminiService.generateProductDescription(editingProduct.name, catName);
    setEditingProduct({ ...editingProduct, description: desc });
    setIsAiLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <h1 className="text-3xl font-bold text-slate-900">Panel de Control</h1>
        <div className="flex bg-white rounded-lg shadow p-1 overflow-x-auto hide-scrollbar">
          {['orders', 'products', 'categories', 'config'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap ${activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {tab === 'orders' ? 'Pedidos' : tab === 'products' ? 'Productos' : tab === 'categories' ? 'Categorías' : 'Config'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{order.orderNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{order.customerName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-semibold">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 rounded-full bg-slate-100 text-xs">{order.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <select 
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                        className="bg-white border rounded p-1 text-xs"
                      >
                        {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => setEditingProduct({})} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
              <i className="fa-solid fa-plus"></i> Nuevo Producto
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4">
                <img src={product.image} className="w-20 h-20 rounded-lg object-cover bg-slate-50" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{product.name}</h3>
                  <p className="text-sm text-slate-500">${product.price}</p>
                  <p className="text-xs text-slate-400">{categories.find(c => c.id === product.categoryId)?.name || 'Sin Categoría'}</p>
                  <div className="mt-2 flex gap-3">
                    <button onClick={() => setEditingProduct(product)} className="text-xs text-slate-600 font-bold hover:underline">Editar</button>
                    <button onClick={() => { if(confirm('¿Eliminar?')) { StoreService.deleteProduct(product.id); refreshData(); } }} className="text-xs text-red-500 font-bold hover:underline">Eliminar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => setEditingCategory({})} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
              <i className="fa-solid fa-layer-group"></i> Nueva Categoría
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center group relative">
                <p className="font-bold text-slate-800">{cat.name}</p>
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => setEditingCategory(cat)} className="p-1 text-slate-400 hover:text-slate-900"><i className="fa-solid fa-pen text-[10px]"></i></button>
                   <button onClick={() => { if(confirm('¿Eliminar categoría?')) { StoreService.deleteCategory(cat.id); refreshData(); } }} className="p-1 text-slate-400 hover:text-red-500"><i className="fa-solid fa-trash text-[10px]"></i></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="bg-white max-w-xl p-6 rounded-2xl border border-slate-100 shadow-sm mx-auto">
          <h2 className="text-lg font-bold mb-6">Ajustes de la Tienda</h2>
          <form onSubmit={(e) => { e.preventDefault(); StoreService.saveConfig(config); alert('Guardado'); }} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">WhatsApp de Ventas</label>
              <input type="text" value={config.whatsappNumber} onChange={(e) => setConfig({...config, whatsappNumber: e.target.value})} className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">URL QR de Pago</label>
              <input type="text" value={config.qrCodeUrl} onChange={(e) => setConfig({...config, qrCodeUrl: e.target.value})} className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" />
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition">Guardar Cambios</button>
          </form>
        </div>
      )}

      {/* Modal Categoría */}
      {editingCategory && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Gestionar Categoría</h2>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <input 
                type="text" required placeholder="Nombre de la categoría"
                value={editingCategory.name || ''}
                onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditingCategory(null)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl">Cancelar</button>
                <button type="submit" className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Producto */}
      {editingProduct && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold">{editingProduct.id ? 'Editar' : 'Nuevo'} Producto</h2>
               <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-900"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <form onSubmit={handleSaveProduct} className="space-y-5">
              <div className="flex justify-center">
                 <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="w-32 h-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition overflow-hidden group relative"
                 >
                   {editingProduct.image ? (
                     <>
                       <img src={editingProduct.image} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition">Cambiar</div>
                     </>
                   ) : (
                     <>
                       <i className="fa-solid fa-camera text-slate-300 text-2xl mb-2"></i>
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Subir Imagen</span>
                     </>
                   )}
                 </div>
                 <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold uppercase text-slate-400 ml-1">Nombre</label>
                  <input type="text" required value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 ml-1">Precio ($)</label>
                  <input type="number" required value={editingProduct.price || ''} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-slate-900 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 ml-1">Categoría</label>
                  <select required value={editingProduct.categoryId || ''} onChange={e => setEditingProduct({...editingProduct, categoryId: e.target.value})} className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-slate-900 outline-none">
                    <option value="">Seleccionar...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-400 ml-1">Descripción</label>
                <div className="relative">
                  <textarea rows={3} value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-slate-900 outline-none resize-none" />
                  <button type="button" onClick={generateAiDescription} disabled={isAiLoading} className="absolute bottom-2 right-2 text-[10px] bg-white shadow-sm border px-2 py-1 rounded-lg font-bold text-slate-600 hover:bg-slate-50">
                    {isAiLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : <><i className="fa-solid fa-wand-magic-sparkles mr-1"></i>IA</>}
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition">Guardar Producto</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
