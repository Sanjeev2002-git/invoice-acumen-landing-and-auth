import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getDashboardSummary } from "../services/api";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboardSummary()
      .then((res) => setSummary(res.data))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!summary) return null;

  const chartData = (summary.topProducts || []).map((p) => ({
    name: p.productName,
    unitsSold: p.unitsSold,
  }));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Revenue" value={`₹${Number(summary.totalRevenue).toLocaleString("en-IN")}`} />
        <SummaryCard label="Total Orders" value={summary.totalOrders} />
        <SummaryCard label="Low Stock Items" value={summary.lowStockCount} alert={summary.lowStockCount > 0} />
        <SummaryCard label="Expiring Soon" value={summary.expiringCount} alert={summary.expiringCount > 0} />
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-medium mb-4">Top Selling Products</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="unitsSold" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, alert }) {
  return (
    <div className={`rounded-lg shadow p-4 ${alert ? "bg-red-50 border border-red-200" : "bg-white"}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-semibold ${alert ? "text-red-600" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}
