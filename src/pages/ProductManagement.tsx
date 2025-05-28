import React, { useState } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Save, Plus } from 'lucide-react';

interface FormErrors {
  codigo?: string;
  nombre?: string;
  stock?: string;
}

const ProductManagement: React.FC = () => {
  const { products, addProduct, updateProduct } = useData();
  const { showToast } = useToast();

  const [codigo, setCodigo] = useState<string>('');
  const [nombre, setNombre] = useState<string>('');
  const [stock, setStock] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isUpdating, setIsUpdating] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!codigo) {
      newErrors.codigo = 'El código de barras es obligatorio';
    } else if (!/^\d{13}$/.test(codigo)) {
      newErrors.codigo = 'El código debe tener 13 dígitos numéricos';
    }
    
    if (!nombre) {
      newErrors.nombre = 'El nombre del producto es obligatorio';
    } else if (nombre.length > 50) {
      newErrors.nombre = 'El nombre no puede exceder los 50 caracteres';
    }
    
    if (!stock) {
      newErrors.stock = 'El stock inicial es obligatorio';
    } else {
      const stockNum = parseInt(stock);
      if (isNaN(stockNum) || stockNum <= 0) {
        newErrors.stock = 'El stock debe ser un número entero positivo';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const productData = {
      codigo,
      nombre,
      stock: parseInt(stock)
    };
    
    const productExists = !!products[codigo];
    
    if (productExists && !isUpdating) {
      setIsUpdating(true);
      showToast('Este producto ya existe. Modifique los datos para actualizarlo.', 'info');
      return;
    }
    
    if (isUpdating) {
      updateProduct(productData);
      showToast('Producto actualizado exitosamente', 'success');
    } else {
      addProduct(productData);
      showToast('Producto registrado exitosamente', 'success');
    }
    
    // Reset form
    setCodigo('');
    setNombre('');
    setStock('');
    setIsUpdating(false);
  };

  const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCodigo(value);
    
    // Auto-fill product data if exists
    if (value.length === 13 && products[value]) {
      setNombre(products[value].nombre);
      setStock(products[value].stock.toString());
      setIsUpdating(true);
      showToast('Producto encontrado. Los campos han sido actualizados.', 'info');
    } else if (isUpdating) {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Gestión de Productos</h2>
      
      <form onSubmit={handleSubmit} className="max-w-lg">
        <Input
          label="Código de Barras"
          id="codigo"
          type="text"
          value={codigo}
          onChange={handleCodigoChange}
          placeholder="Ingrese código de 13 dígitos"
          required
          error={errors.codigo}
          maxLength={13}
        />
        
        <Input
          label="Nombre del Producto"
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ingrese nombre del producto"
          required
          error={errors.nombre}
          maxLength={50}
        />
        
        <Input
          label={isUpdating ? "Stock a Añadir" : "Stock Inicial"}
          id="stock"
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="Ingrese cantidad"
          required
          error={errors.stock}
        />
        
        <Button 
          type="submit" 
          variant={isUpdating ? "success" : "primary"}
          className="mt-4"
        >
          {isUpdating ? (
            <>
              <Save size={18} />
              Actualizar Producto
            </>
          ) : (
            <>
              <Plus size={18} />
              Registrar Producto
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default ProductManagement;