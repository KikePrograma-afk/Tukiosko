import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer
} from 'recharts';
import { useData } from '../context/DataContext';
import { TrendingUp, Package, AlertTriangle, DollarSign, ShoppingCart } from 'lucide-react';

const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  pink: '#EC4899',
  indigo: '#6366F1',
  teal: '#14B8A6'
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.warning, COLORS.danger, COLORS.purple, COLORS.pink];

export const Dashboard: React.FC = () => {
  const { products, sales } = useData();

  // 📈 Métrica 1: Productos con Stock Bajo (Crítico para el kiosko)
  const stockCritico = useMemo(() => {
    const productArray = Object.values(products);
    const bajo = productArray.filter(p => p.stock <= 5).length;
    const medio = productArray.filter(p => p.stock > 5 && p.stock <= 15).length;
    const alto = productArray.filter(p => p.stock > 15).length;
    
    return [
      { name: 'Stock Crítico (≤5)', value: bajo, color: COLORS.danger },
      { name: 'Stock Medio (6-15)', value: medio, color: COLORS.warning },
      { name: 'Stock Alto (>15)', value: alto, color: COLORS.secondary }
    ];
  }, [products]);

  // 💰 Métrica 2: Valor Total del Inventario por Categoría
  const valorInventario = useMemo(() => {
    const categorias: Record<string, number> = {};
    Object.values(products).forEach(product => {
      const categoria = product.categoria || 'Sin Categoría';
      const valor = product.stock * product.precio;
      categorias[categoria] = (categorias[categoria] || 0) + valor;
    });
    
    return Object.entries(categorias).map(([categoria, valor]) => ({
      categoria,
      valor: Math.round(valor * 100) / 100
    }));
  }, [products]);

  // 📊 Métrica 3: Ventas por Día (Últimos 7 días)
  const ventasPorDia = useMemo(() => {
    const hoy = new Date();
    const ultimosSieteDias = Array.from({ length: 7 }, (_, i) => {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() - i);
      return fecha.toISOString().split('T')[0];
    }).reverse();

    const ventasAgrupadas = ultimosSieteDias.map(fecha => {
      const ventasDelDia = sales.filter(sale => 
        sale.fecha_hora.startsWith(fecha)
      );
      const totalVentas = ventasDelDia.reduce((sum, sale) => sum + sale.cantidad_vendida, 0);
      const ingresos = ventasDelDia.reduce((sum, sale) => {
        const producto = Object.values(products).find(p => p.codigo === sale.codigo_barra);
        return sum + (producto ? producto.precio * sale.cantidad_vendida : 0);
      }, 0);

      return {
        fecha: new Date(fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
        ventas: totalVentas,
        ingresos: Math.round(ingresos * 100) / 100
      };
    });

    return ventasAgrupadas;
  }, [sales, products]);

  // 🏆 Métrica 4: Top 5 Productos Más Vendidos
  const topProductos = useMemo(() => {
    const ventasPorProducto: Record<string, { nombre: string; cantidad: number; ingresos: number }> = {};
    
    sales.forEach(sale => {
      const producto = Object.values(products).find(p => p.codigo === sale.codigo_barra);
      if (producto) {
        if (!ventasPorProducto[sale.codigo_barra]) {
          ventasPorProducto[sale.codigo_barra] = {
            nombre: producto.nombre,
            cantidad: 0,
            ingresos: 0
          };
        }
        ventasPorProducto[sale.codigo_barra].cantidad += sale.cantidad_vendida;
        ventasPorProducto[sale.codigo_barra].ingresos += producto.precio * sale.cantidad_vendida;
      }
    });

    return Object.values(ventasPorProducto)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5)
      .map(item => ({
        ...item,
        ingresos: Math.round(item.ingresos * 100) / 100
      }));
  }, [sales, products]);

  // ⚡ Métrica 5: Resumen de KPIs
  const kpis = useMemo(() => {
    const totalProductos = Object.keys(products).length;
    const totalVentas = sales.reduce((sum, sale) => sum + sale.cantidad_vendida, 0);
    const ingresosTotales = sales.reduce((sum, sale) => {
      const producto = Object.values(products).find(p => p.codigo === sale.codigo_barra);
      return sum + (producto ? producto.precio * sale.cantidad_vendida : 0);
    }, 0);
    const productosStockBajo = Object.values(products).filter(p => p.stock <= 5).length;

    return {
      totalProductos,
      totalVentas,
      ingresosTotales: Math.round(ingresosTotales * 100) / 100,
      productosStockBajo
    };
  }, [products, sales]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Dashboard del Kiosko</h2>
      
      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Productos</p>
              <p className="text-2xl font-bold">{kpis.totalProductos}</p>
            </div>
            <Package className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Ventas</p>
              <p className="text-2xl font-bold">{kpis.totalVentas}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Ingresos Totales</p>
              <p className="text-2xl font-bold">${kpis.ingresosTotales}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Stock Crítico</p>
              <p className="text-2xl font-bold">{kpis.productosStockBajo}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Stock por Nivel */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" size={20} />
            Estado del Stock
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stockCritico}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stockCritico.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico 2: Valor del Inventario */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="text-green-500" size={20} />
            Valor por Categoría
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={valorInventario}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categoria" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Valor']} />
              <Bar dataKey="valor" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico 3: Ventas por Día */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-500" size={20} />
            Ventas Últimos 7 Días
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={ventasPorDia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="ventas"
                stackId="1"
                stroke={COLORS.primary}
                fill={COLORS.primary}
                fillOpacity={0.6}
                name="Cantidad Vendida"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="ingresos"
                stroke={COLORS.secondary}
                strokeWidth={3}
                name="Ingresos ($)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico 4: Top Productos */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ShoppingCart className="text-purple-500" size={20} />
            Top 5 Productos Más Vendidos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProductos} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="nombre" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="cantidad" fill={COLORS.purple} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};