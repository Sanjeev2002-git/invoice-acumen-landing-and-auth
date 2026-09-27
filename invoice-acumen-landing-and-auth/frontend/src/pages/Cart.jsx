import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  // Cart is persisted locally; no API calls here.
  // Still keep the same evo styling and UI.
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  const navigate = useNavigate();

  const updateQty = (productId, qty) => {
    const updated = cart.map((c) =>
      c.productId === productId ? { ...c, quantity: Math.max(1, qty) } : c
    );
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeItem = (productId) => {
    const updated = cart.filter((c) => c.productId !== productId);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const total = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  return (
    <div className="evo-page relative min-h-screen">
      <div className="evo-glow" />
      <div className="relative z-10 max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4 text-white">Your Cart</h2>

        {cart.length === 0 ? (
          <p className="text-evo-muted">Your cart is empty.</p>
        ) : (
          <>
            <div className="evo-card divide-y divide-white/10">
              {cart.map((c) => (
                <div key={c.productId} className="flex justify-between items-center p-4">
                  <div>
                    <p className="font-medium text-white">{c.name}</p>
                    <p className="text-sm text-evo-muted">₹{c.price} x {c.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={c.quantity}
                      onChange={(e) => updateQty(c.productId, parseInt(e.target.value) || 1)}
                      className="evo-input evo-focus-ring w-16 rounded px-2 py-1 text-sm"
                    />
                    <button
                      onClick={() => removeItem(c.productId)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 evo-card p-4 flex justify-between items-center">
              <span className="text-lg font-bold text-white">Subtotal: ₹{total.toFixed(2)}</span>
              <button
                onClick={() => navigate('/checkout')}
                className="evo-btn-primary evo-focus-ring px-6 py-2 rounded-full"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

