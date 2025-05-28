import React, { useMemo } from 'react';
import { Product } from '../types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface InventoryChartsProps {
  products: Product[];
}

export const InventoryCharts: React.FC<InventoryChartsProps> = ({ products }) => {
  const categoryData = useMemo(() => {
    const categories = products.reduce((acc, product) => {
      acc[product.categoria] = (acc[product.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [products]);

  const stockData = useMemo(() => {
    return products
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 10)
      .map(product => ({
        name: product.nombre.length > 15 ? product.nombre.slice(0, 15) + '...' : product.nombre,
        stock: product.stock
      }));
  }, [products]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium mb-4">Distribución por Categorías</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium mb-4">Top 10 Productos por Stock</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="stock" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};