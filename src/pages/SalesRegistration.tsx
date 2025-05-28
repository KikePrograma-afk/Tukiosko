import React, { useState } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Table } from '../components/Table';
import { useData, Product, Sale } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { ShoppingCart, Plus, Trash2, CheckCircle } from 'lucide-react';

interface CartItem {
  id: string;
  codigo: string;
  nombre: string;
  cantidad: number;
}

interface FormErrors {
  codigo?: string;
  cantidad?: string;
  cajero?: string;
}

const SalesRegistration: React.FC = () => {
  const { getProduct, decreaseStock, addSale } = useData();
  const { showToast } = useToast();

  const [cajero, setCajero] = useState('');
  const [codigo, setCodigo] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateProductForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!codigo) {
      newErrors.codigo = 'El código de barras es obligatorio';
    }
    
    if (!cantidad) {
      newErrors.cantidad = 'La cantidad es obligatoria';
    } else {
      const cantidadNum = parseInt(cantidad);
      if (isNaN(cantidadNum) || cantidadNum <= 0) {
        newErrors.cantidad = 'La cantidad debe ser un número entero positivo';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCashier = (): boolean => {
    if (!cajero.trim()) {
      setErrors(prev => ({ ...prev, cajero: 'El nombre del cajero es obligatorio' }));
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!validateProductForm()) {
      return;
    }
    
    const product = getProduct(codigo);
    if (!product) {
      showToast('Producto no encontrado', 'error');
      return;
    }
    
    const cantidadNum = parseInt(cantidad);
    if (product.stock < cantidadNum) {
      showToast(`Stock insuficiente. Stock actual: ${product.stock}`, 'warning');
      return;
    }
    
    // Add to cart
    const cartItemId = Date.now().toString();
    setCart(prev => [
      ...prev,
      {
        id: cartItemId,
        codigo: product.codigo,
        nombre: product.nombre,
        cantidad: cantidadNum
      }
    ]);
    
    // Reset form
    setCodigo('');
    setCantidad('1');
    showToast(`${product.nombre} agregado a la venta`, 'success');
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleFinishSale = () => {
    if (!validateCashier()) {
      return;
    }
    
    if (cart.length === 0) {
      showToast('No hay productos en la venta actual', 'warning');
      return;
    }
    
    // Process each item in cart
    let allSuccess = true;
    const currentDate = new Date().toISOString();
    
    cart.forEach(item => {
      const success = decreaseStock(item.codigo, item.cantidad);
      if (success) {
        const sale: Sale = {
          fecha_hora: currentDate,
          codigo_barra: item.codigo,
          nombre_producto: item.nombre,
          cantidad_vendida: item.cantidad,
          cajero
        };
        addSale(sale);
      } else {
        allSuccess = false;
        showToast(`Error al procesar ${item.nombre}. Verifique el stock.`, 'error');
      }
    });
    
    if (allSuccess) {
      showToast('Venta finalizada exitosamente', 'success');
      setCart([]);
    }
  };

  const cartColumns = [
    { header: 'Código', accessor: 'codigo' as keyof CartItem },
    { header: 'Producto', accessor: 'nombre' as keyof CartItem },
    { header: 'Cantidad', accessor: 'cantidad' as keyof CartItem },
    { 
      header: 'Acciones', 
      accessor: 'id' as keyof CartItem, 
      render: (item: CartItem) => (
        <Button 
          variant="danger" 
          onClick={() => handleRemoveFromCart(item.id)}
        >
          <Trash2 size={16} />
        </Button>
      )
    }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Registro de Ventas</h2>
      
      <div className="mb-6">
        <Input
          label="Nombre del Cajero"
          id="cajero"
          value={cajero}
          onChange={(e) => setCajero(e.target.value)}
          placeholder="Ingrese nombre del cajero"
          required
          error={errors.cajero}
        />
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <ShoppingCart size={20} />
          Venta Actual
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            label="Código de Barras"
            id="codigo"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Escanee o ingrese código"
            required
            error={errors.codigo}
          />
          
          <Input
            label="Cantidad"
            id="cantidad"
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            placeholder="1"
            required
            error={errors.cantidad}
          />
        </div>
        
        <Button 
          onClick={handleAddToCart} 
          className="mb-4"
        >
          <Plus size={18} />
          Añadir a Venta
        </Button>
        
        <div className="mt-4">
          <h4 className="text-md font-medium mb-2">Productos en esta venta:</h4>
          <Table
            columns={cartColumns}
            data={cart}
            keyExtractor={(item) => item.id}
            emptyMessage="No hay productos en la venta actual"
          />
        </div>
        
        {cart.length > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <div className="text-lg font-semibold">
              Total de productos: {cart.reduce((sum, item) => sum + item.cantidad, 0)}
            </div>
            <Button 
              variant="success" 
              onClick={handleFinishSale}
            >
              <CheckCircle size={18} />
              Finalizar Venta
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesRegistration;