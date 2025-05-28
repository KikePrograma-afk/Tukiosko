import React from 'react';
import { Product } from '../types';
import { Package, AlertTriangle } from 'lucide-react';

interface InventoryGridProps {
  products: Product[];
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({ products }) => {
  const getStockStatus = (product: Product) => {
    const percentage = (product.stock / (product.stockMinimo || 100)) * 100;
    if (percentage < 25) return { color: 'text-red-600 bg-red-100', label: 'Bajo' };
    if (percentage < 50) return { color: 'text-yellow-600 bg-yellow-100', label: 'Medio' };
    return { color: 'text-green-600 bg-green-100', label: 'Alto' };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(product => {
        const stockStatus = getStockStatus(product);
        
        return (
          <div
            key={product.codigo}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div className="aspect-square relative overflow-hidden bg-gray-100">
              {product.imagen ? (
                <img
                  src={product.imagen}
                  alt={product.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={48} className="text-gray-400" />
                </div>
              )}
              
              {product.stock < (product.stockMinimo || 10) && (
                <div className="absolute top-2 right-2 bg-red-100 text-red-600 p-1 rounded-full">
                  <AlertTriangle size={20} />
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-1 truncate">
                {product.nombre}
              </h3>
              
              <div className="text-sm text-gray-500 mb-2">
                Código: {product.codigo}
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold">
                  ${product.precio.toFixed(2)}
                </span>
                <span className={`px-2 py-1 rounded-full text-sm ${stockStatus.color}`}>
                  {product.stock} unidades
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                Categoría: {product.categoria}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};