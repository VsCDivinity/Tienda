
import React, { useState, useEffect } from 'react';
import { StoreService } from '../services/storeService';
import { Product, Order, OrderStatus, Category, AppConfig } from '../types';
import { GeminiService } from '../services/geminiService';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'config'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<AppConfig>(StoreService.getConfig());
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setOrders(StoreService.getOrders().reverse());
    setProducts(StoreService.getProducts());
    setConfig(StoreService.getConfig());
  };

  const handleUpdateStatus = (id: string, status: OrderStatus) => {
    StoreService.updateOrderStatus(id, status);
    refreshData();
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct && editingProduct.name && editingProduct.price) {
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

  const handleDeleteProduct = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      StoreService.deleteProduct(id);
      refreshData();
    }
  };

  const generateAiDescription = async () => {
    if (!editingProduct?.name || !editingProduct?.category) {
      alert("Por favor indica el nombre y categoría primero.");
      return;
    }
    setIsAiLoading(true);
    const desc = await GeminiService.generateProductDescription(editingProduct.name, editingProduct.category);
    setEditingProduct({ ...editingProduct, description: desc });
    setIsAiLoading(false);
  };

  const saveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    StoreService.saveConfig(config);
    alert('Configuración guardada');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <h1 className="text-3xl font-bold text-slate-900">Panel de Control</h1>
        <div className="flex bg-white rounded-lg shadow p-1">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'orders' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Pedidos
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'products' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Productos
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'config' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Configuración
          </button>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha</th>
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
                      <div className="text-xs text-slate-500">{order.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-semibold">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === OrderStatus.Pending ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${order.status === OrderStatus.Accepted ? 'bg-blue-100 text-blue-800' : ''}
                        ${order.status === OrderStatus.Shipping ? 'bg-purple-100 text-purple-800' : ''}
                        ${order.status === OrderStatus.Delivered ? 'bg-green-100 text-green-800' : ''}
                      `}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <select 
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                        className="bg-white border border-slate-300 rounded text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      >
                        {Object.values(OrderStatus).map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <i className="fa-solid fa-box-open text-4xl mb-4"></i>
              <p>No hay pedidos registrados todavía</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button 
              onClick={() => setEditingProduct({})}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition flex items-center gap-2"
            >
              <i className="fa-solid fa-plus"></i> Nuevo Producto
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4">
                <img src={product.image} className="w-24 h-24 rounded-lg object-cover" alt={product.name} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{product.name}</h3>
                  <p className="text-sm text-slate-500">${product.price}</p>
                  <p className="text-xs text-slate-400 mt-1">{product.category}</p>
                  <div className="mt-3 flex gap-2">
                    <button 
                      onClick={() => setEditingProduct(product)}
                      className="text-slate-600 hover:text-slate-900 text-sm"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="bg-white max-w-2xl rounded-xl shadow-sm border border-slate-100 p-6">
          <form onSubmit={saveConfig} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp de Ventas</label>
              <input 
                type="text" 
                value={config.whatsappNumber}
                onChange={(e) => setConfig({...config, whatsappNumber: e.target.value})}
                placeholder="Ej: 5491100000000"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">URL Código QR (Mercado Pago / Transferencia)</label>
              <input 
                type="text" 
                value={config.qrCodeUrl}
                onChange={(e) => setConfig({...config, qrCodeUrl: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
              />
              <div className="mt-2 h-32 w-32 border p-2 bg-slate-50 rounded">
                <img src={config.qrCodeUrl} className="w-full h-full object-contain" alt="QR Preview" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña de Admin</label>
              <input 
                type="password" 
                value={config.adminPassword}
                onChange={(e) => setConfig({...config, adminPassword: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
              />
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 transition font-medium">
              Guardar Configuración
            </button>
          </form>
        </div>
      )}

      {/* Product Editor Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
            <button onClick={() => setEditingProduct(null)} className="absolute top-4 right-4 text-slate-400">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <h2 className="text-xl font-bold mb-6">{editingProduct.id ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input 
                    type="text" required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Precio ($)</label>
                  <input 
                    type="number" required
                    value={editingProduct.price || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Categoría</label>
                  <select 
                    value={editingProduct.category || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value as Category})}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">Seleccionar...</option>
                    {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <div className="relative">
                  <textarea 
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                    className="w-full p-2 border rounded-lg h-24"
                  />
                  <button 
                    type="button"
                    onClick={generateAiDescription}
                    disabled={isAiLoading}
                    className="absolute bottom-2 right-2 bg-slate-100 text-slate-600 px-3 py-1 rounded text-xs hover:bg-slate-200 transition flex items-center gap-1"
                  >
                    {isAiLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                    Mejorar con IA
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL Imagen</label>
                <input 
                  type="text"
                  value={editingProduct.image || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                  placeholder="https://..."
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="flex items-center gap-4">
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={editingProduct.available ?? true}
                      onChange={(e) => setEditingProduct({...editingProduct, available: e.target.checked})}
                      className="w-4 h-4 rounded text-slate-900"
                    />
                    <span className="text-sm font-medium">Disponible para la venta</span>
                 </label>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 transition mt-4 font-semibold">
                Guardar Producto
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
