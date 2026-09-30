import { useEffect, useState } from "react";
import { getExpiringProducts, getLowStockProducts } from "../services/api";

export default function InventoryAlerts() {
  const [expiring, setExpiring] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getExpiringProducts(), getLowStockProducts()])
      .then(([expRes, stockRes]) => {
        setExpiring(expRes.data);
        setLowStock(stockRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading alerts...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Inventory Alerts</h1>

      <AlertSection
        title={`Expiring Within 30 Days (${expiring.length})`}
        items={expiring}
        renderItem={(p) => (
          <span>
            {p.name} — batch {p.batchNumber || "N/A"} — expires {p.expiryDate}
          </span>
        )}
        emptyMessage="Nothing expiring soon."
      />

      <AlertSection
        title={`Low Stock (${lowStock.length})`}
        items={lowStock}
        renderItem={(p) => (
          <span>
            {p.name} — {p.stockQuantity} left (threshold: {p.reorderThreshold})
          </span>
        )}
        emptyMessage="All stock levels healthy."
      />
    </div>
  );
}

function AlertSection({ title, items, renderItem, emptyMessage }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-medium mb-3">{title}</h2>
      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {items.map((item) => (
            <li key={item.id} className="py-2 text-sm text-gray-700">
              {renderItem(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
