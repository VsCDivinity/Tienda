
import React from 'react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemove,
  onCheckout
}) => {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md transform transition ease-in-out duration-500">
          <div className="flex flex-col h-full bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-medium text-slate-900">Carrito de Compras</h2>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-500">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <i className="fa-solid fa-cart-shopping text-4xl mb-4"></i>
                  <p>Tu carrito está vacío</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.product.id} className="flex items-center space-x-4 border-b pb-4">
                    <img src={item.product.image} alt={item.product.name} className="h-16 w-16 rounded object-cover" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-slate-900">{item.product.name}</h3>
                      <p className="text-sm text-slate-500">${item.product.price}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                      >
                        <i className="fa-solid fa-minus text-xs"></i>
                      </button>
                      <span className="text-sm font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                      >
                        <i className="fa-solid fa-plus text-xs"></i>
                      </button>
                    </div>
                    <button onClick={() => onRemove(item.product.id)} className="text-red-500 hover:text-red-600">
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-4 border-t bg-slate-50">
                <div className="flex justify-between text-base font-medium text-slate-900 mb-4">
                  <p>Subtotal</p>
                  <p>${total.toFixed(2)}</p>
                </div>
                <button
                  onClick={onCheckout}
                  className="w-full flex items-center justify-center rounded-lg border border-transparent bg-slate-900 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-slate-800"
                >
                  Finalizar Pedido
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
