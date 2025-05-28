import React from 'react';
import { Input } from './Input';
import { FilterState } from '../types';
import { Search, Filter } from 'lucide-react';

interface InventoryFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  categorias: string[];
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  filters,
  setFilters,
  categorias,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={20} className="text-gray-500" />
        <h3 className="text-lg font-medium">Filtros</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative">
          <Input
            label="Buscar"
            id="busqueda"
            value={filters.busqueda}
            onChange={(e) => setFilters(prev => ({ ...prev, busqueda: e.target.value }))}
            placeholder="Nombre o código..."
          />
          <Search size={18} className="absolute right-3 top-9 text-gray-400" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.categoria}
            onChange={(e) => setFilters(prev => ({ ...prev, categoria: e.target.value }))}
          >
            <option value="">Todas</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nivel de Stock
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.nivelStock}
            onChange={(e) => setFilters(prev => ({ ...prev, nivelStock: e.target.value }))}
          >
            <option value="">Todos</option>
            <option value="bajo">Bajo (&lt;25%)</option>
            <option value="medio">Medio (25-50%)</option>
            <option value="alto">Alto (&gt;50%)</option>
          </select>
        </div>

        <Input
          label="Precio Mínimo"
          id="precioMin"
          type="number"
          value={filters.precioMin}
          onChange={(e) => setFilters(prev => ({ ...prev, precioMin: e.target.value }))}
          placeholder="0"
        />

        <Input
          label="Precio Máximo"
          id="precioMax"
          type="number"
          value={filters.precioMax}
          onChange={(e) => setFilters(prev => ({ ...prev, precioMax: e.target.value }))}
          placeholder="99999"
        />
      </div>
    </div>
  );
};