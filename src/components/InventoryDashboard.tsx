import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { InventoryGrid } from './InventoryGrid';
import { InventoryList } from './InventoryList';
import { InventoryFilters } from './InventoryFilters';
import { InventoryCharts } from './InventoryCharts';
import { ViewMode, FilterState, SortField, SortOrder } from '../types';
import { LayoutGrid, List, ArrowUpDown } from 'lucide-react';
import { Button } from './Button';

const InventoryDashboard: React.FC = () => {
  const { products } = useData();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<FilterState>({
    categoria: '',
    nivelStock: '',
    precioMin: '',
    precioMax: '',
    busqueda: '',
  });
  const [sortField, setSortField] = useState<SortField>('nombre');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const categorias = useMemo(() => {
    return [...new Set(Object.values(products).map(p => p.categoria))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return Object.values(products).filter(product => {
      const matchesCategoria = !filters.categoria || product.categoria === filters.categoria;
      const matchesNivelStock = !filters.nivelStock || (() => {
        const stockPercentage = (product.stock / (product.stockMinimo || 100)) * 100;
        switch (filters.nivelStock) {
          case 'bajo': return stockPercentage < 25;
          case 'medio': return stockPercentage >= 25 && stockPercentage < 50;
          case 'alto': return stockPercentage >= 50;
          default: return true;
        }
      })();
      const matchesPrecio = (!filters.precioMin || product.precio >= Number(filters.precioMin)) &&
                           (!filters.precioMax || product.precio <= Number(filters.precioMax));
      const matchesBusqueda = !filters.busqueda || 
                             product.nombre.toLowerCase().includes(filters.busqueda.toLowerCase()) ||
                             product.codigo.includes(filters.busqueda);
      
      return matchesCategoria && matchesNivelStock && matchesPrecio && matchesBusqueda;
    }).sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'nombre': return order * a.nombre.localeCompare(b.nombre);
        case 'stock': return order * (a.stock - b.stock);
        case 'precio': return order * (a.precio - b.precio);
        default: return 0;
      }
    });
  }, [products, filters, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid size={18} />
            Cuadrícula
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('list')}
          >
            <List size={18} />
            Lista
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => handleSort('nombre')}
          >
            <ArrowUpDown size={18} />
            Nombre {sortField === 'nombre' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleSort('stock')}
          >
            <ArrowUpDown size={18} />
            Stock {sortField === 'stock' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleSort('precio')}
          >
            <ArrowUpDown size={18} />
            Precio {sortField === 'precio' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Button>
        </div>
      </div>

      <InventoryFilters
        filters={filters}
        setFilters={setFilters}
        categorias={categorias}
      />

      <InventoryCharts products={Object.values(products)} />

      {viewMode === 'grid' ? (
        <InventoryGrid products={filteredProducts} />
      ) : (
        <InventoryList products={filteredProducts} />
      )}
    </div>
  );
};

export default InventoryDashboard;