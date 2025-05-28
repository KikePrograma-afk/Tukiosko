import React from 'react';
import { Product } from '../types';
import { AlertTriangle, Package } from 'lucide-react';

interface InventoryListProps {
  products: Product[];
}

export const InventoryList: React.FC<InventoryListProps> = ({ products }) => {
  const getStockStatus = (product: Product) => {
    const percentage = (product.stock / (product.stockMinimo || 100)) * 100;
    if (percentage < 25) return { color: 'text-red-600 bg-red-100', label: 'Bajo' };
    if (percentage < 50) return { color: 'text-yellow-600 bg-yellow-100', label: 'Medio' };
    return { color: 'text-green-600 bg-green-100', label: 'Alto' };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map(product => {
              const stockStatus = getStockStatus(product);
              
              return (
                <tr key={product.codigo} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {product.imagen ? (
                          <img
                            src={product.imagen}
                            alt={product.nombre}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <Package size={20} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.nombre}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.codigo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.categoria}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    ${product.precio.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-full text-sm ${stockStatus.color}`}>
                        {product.stock} unidades
                      </span>
                      {product.stock < (product.stockMinimo || 10) && (
                        <AlertTriangle size={16} className="ml-2 text-red-500" />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};