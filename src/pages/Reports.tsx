import React, { useState, useMemo } from 'react';
import { Table } from '../components/Table';
import { useData, Product, Sale } from '../context/DataContext';
import { Button } from '../components/Button';
import { FileDown, BarChart } from 'lucide-react';

const Reports: React.FC = () => {
  const { products, sales } = useData();
  const [activeReport, setActiveReport] = useState<'stock' | 'sales'>('stock');

  const formattedProducts = useMemo(() => {
    return Object.values(products).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [products]);

  const formattedSales = useMemo(() => {
    return [...sales].sort((a, b) => 
      new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime()
    );
  }, [sales]);

  const productColumns = [
    { header: 'Código', accessor: 'codigo' as keyof Product },
    { header: 'Producto', accessor: 'nombre' as keyof Product },
    { 
      header: 'Stock Actual', 
      accessor: 'stock' as keyof Product,
      render: (item: Product) => (
        <span className={`font-medium ${item.stock <= 5 ? 'text-red-600' : ''}`}>
          {item.stock}
        </span>
      )
    }
  ];

  const saleColumns = [
    { 
      header: 'Fecha y Hora', 
      accessor: 'fecha_hora' as keyof Sale,
      render: (item: Sale) => {
        const date = new Date(item.fecha_hora);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      }
    },
    { header: 'Cajero', accessor: 'cajero' as keyof Sale },
    { header: 'Producto', accessor: 'nombre_producto' as keyof Sale },
    { 
      header: 'Cantidad', 
      accessor: 'cantidad_vendida' as keyof Sale 
    },
    { header: 'Código', accessor: 'codigo_barra' as keyof Sale }
  ];

  const exportToCSV = (data: any[], filename: string) => {
    // Convert data to CSV format
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map(item => Object.values(item).join(','));
    const csv = [headers, ...rows].join('\n');
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Reportes</h2>
      
      <div className="mb-6 flex gap-4">
        <Button 
          variant={activeReport === 'stock' ? 'primary' : 'secondary'}
          onClick={() => setActiveReport('stock')}
        >
          <BarChart size={18} />
          Inventario Actual
        </Button>
        
        <Button 
          variant={activeReport === 'sales' ? 'primary' : 'secondary'}
          onClick={() => setActiveReport('sales')}
        >
          <BarChart size={18} />
          Historial de Ventas
        </Button>
      </div>
      
      {activeReport === 'stock' ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Inventario de Productos</h3>
            <Button 
              variant="secondary" 
              onClick={() => exportToCSV(formattedProducts, 'inventario')}
              disabled={formattedProducts.length === 0}
            >
              <FileDown size={18} />
              Exportar a CSV
            </Button>
          </div>
          
          <Table
            columns={productColumns}
            data={formattedProducts}
            keyExtractor={(item) => item.codigo}
            emptyMessage="No hay productos registrados"
          />
          
          {formattedProducts.length > 0 && (
            <div className="mt-4 text-right text-sm text-gray-600">
              Total de productos: {formattedProducts.length} | 
              Stock total: {formattedProducts.reduce((sum, p) => sum + p.stock, 0)} unidades
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Historial de Ventas</h3>
            <Button 
              variant="secondary" 
              onClick={() => exportToCSV(formattedSales, 'ventas')}
              disabled={formattedSales.length === 0}
            >
              <FileDown size={18} />
              Exportar a CSV
            </Button>
          </div>
          
          <Table
            columns={saleColumns}
            data={formattedSales}
            keyExtractor={(item) => item.fecha_hora + item.codigo_barra}
            emptyMessage="No hay ventas registradas"
          />
          
          {formattedSales.length > 0 && (
            <div className="mt-4 text-right text-sm text-gray-600">
              Total de ventas: {formattedSales.length} | 
              Unidades vendidas: {formattedSales.reduce((sum, s) => sum + s.cantidad_vendida, 0)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;