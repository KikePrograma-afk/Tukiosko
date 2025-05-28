import React, { createContext, useState, useContext, useEffect, ReactNode, useRef } from 'react';
import { Product, Sale } from '../types';

interface DataContextProps {
  products: Record<string, Product>;
  sales: Sale[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  addSale: (sale: Sale) => void;
  decreaseStock: (codigo: string, cantidad: number) => boolean;
  getProduct: (codigo: string) => Product | null;
  isLoading: boolean;
  lastSaved: Date | null;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

// Utility function to escape CSV values properly
const escapeCSV = (value: any): string => {
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const saveToCSV = (data: any[], headers: string[], filePath: string) => {
  try {
    // Create CSV content with proper escaping
    const csvContent = [
      headers.join(','),
      ...data.map(item => 
        headers.map(header => escapeCSV(item[header])).join(',')
      )
    ].join('\n');

    // Save to localStorage as primary storage in WebContainer
    localStorage.setItem(filePath, csvContent);

    // Create a backup with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    localStorage.setItem(`${filePath}.${timestamp}.backup`, csvContent);

    return true;
  } catch (error) {
    console.error(`Error saving CSV at ${filePath}:`, error);
    return false;
  }
};

const loadCSV = (filePath: string): string => {
  try {
    // Try to load from localStorage
    const data = localStorage.getItem(filePath);
    if (data) return data;

    // If no data in localStorage, return empty CSV with headers
    if (filePath.includes('products')) {
      return 'codigo,nombre,stock,precio,categoria,imagen,stockMinimo\n';
    }
    if (filePath.includes('sales')) {
      return 'fecha_hora,codigo_barra,nombre_producto,cantidad_vendida,cajero\n';
    }
    
    return '';
  } catch (error) {
    console.error(`Error loading CSV from ${filePath}:`, error);
    return '';
  }
};

const parseCSVToProducts = (csv: string): Record<string, Product> => {
  try {
    const lines = csv.split('\n');
    if (lines.length <= 1) return {};

    const headers = lines[0].split(',');
    const products: Record<string, Product> = {};

    const parseValue = (value: string): string => {
      // Remove surrounding quotes and unescape double quotes
      if (value.startsWith('"') && value.endsWith('"')) {
        return value.slice(1, -1).replace(/""/g, '"');
      }
      return value;
    };

    lines.slice(1).forEach(line => {
      if (!line.trim()) return;

      // Handle quoted values properly
      const values: string[] = [];
      let currentValue = '';
      let insideQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(parseValue(currentValue));
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(parseValue(currentValue));

      const product: any = {};
      headers.forEach((header, index) => {
        const value = values[index];
        if (header === 'stock' || header === 'precio' || header === 'stockMinimo') {
          product[header] = parseFloat(value) || 0;
        } else {
          product[header] = value || '';
        }
      });

      if (product.codigo) {
        products[product.codigo] = product as Product;
      }
    });

    return products;
  } catch (error) {
    console.error('Error parsing products CSV:', error);
    return {};
  }
};

const parseCSVToSales = (csv: string): Sale[] => {
  try {
    const lines = csv.split('\n');
    if (lines.length <= 1) return [];

    const parseValue = (value: string): string => {
      if (value.startsWith('"') && value.endsWith('"')) {
        return value.slice(1, -1).replace(/""/g, '"');
      }
      return value;
    };

    return lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values: string[] = [];
        let currentValue = '';
        let insideQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            insideQuotes = !insideQuotes;
          } else if (char === ',' && !insideQuotes) {
            values.push(parseValue(currentValue));
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        values.push(parseValue(currentValue));

        const [fecha_hora, codigo_barra, nombre_producto, cantidad_vendida, cajero] = values;
        return {
          fecha_hora,
          codigo_barra,
          nombre_producto,
          cantidad_vendida: parseInt(cantidad_vendida) || 0,
          cajero
        };
      });
  } catch (error) {
    console.error('Error parsing sales CSV:', error);
    return [];
  }
};

// ✅ Nueva función para cargar desde el backend
const loadFromBackend = async (endpoint: string): Promise<string> => {
  try {
    const response = await fetch(`/api/${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error loading from backend ${endpoint}:`, error);
    // Fallback a localStorage
    return loadCSV(`/stockcsv/${endpoint}.csv`);
  }
};

// ✅ Nueva función para guardar en el backend
const saveToBackend = async (data: any[], headers: string[], filename: string): Promise<boolean> => {
  try {
    const csvContent = [
      headers.join(','),
      ...data.map(item => 
        headers.map(header => escapeCSV(item[header])).join(',')
      )
    ].join('\n');

    const response = await fetch(`/api/save-csv/${filename}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: csvContent
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // También guardar en localStorage como backup
    localStorage.setItem(`/stockcsv/${filename}`, csvContent);
    return true;
  } catch (error) {
    console.error(`Error saving to backend ${filename}:`, error);
    // Fallback a localStorage
    return saveToCSV(data, headers, `/stockcsv/${filename}`);
  }
};

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Referencias para evitar guardados innecesarios
  const lastProductsRef = useRef<string>('');
  const lastSalesRef = useRef<string>('');

  // ✅ Carga inicial desde el backend
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [productsCSV, salesCSV] = await Promise.all([
          loadFromBackend('products'),
          loadFromBackend('sales')
        ]);

        if (productsCSV) {
          const parsedProducts = parseCSVToProducts(productsCSV);
          setProducts(parsedProducts);
          lastProductsRef.current = JSON.stringify(parsedProducts);
        }

        if (salesCSV) {
          const parsedSales = parseCSVToSales(salesCSV);
          setSales(parsedSales);
          lastSalesRef.current = JSON.stringify(parsedSales);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // ✅ Auto-guardado cada 5 segundos
  useEffect(() => {
    const autoSave = async () => {
      if (isLoading) return;

      const currentProducts = JSON.stringify(products);
      const currentSales = JSON.stringify(sales);

      let saved = false;

      // Solo guardar si hay cambios
      if (currentProducts !== lastProductsRef.current) {
        const productHeaders = ['codigo', 'nombre', 'stock', 'precio', 'categoria', 'imagen', 'stockMinimo'];
        const productData = Object.values(products);
        await saveToBackend(productData, productHeaders, 'products.csv');
        lastProductsRef.current = currentProducts;
        saved = true;
      }

      if (currentSales !== lastSalesRef.current) {
        const salesHeaders = ['fecha_hora', 'codigo_barra', 'nombre_producto', 'cantidad_vendida', 'cajero'];
        await saveToBackend(sales, salesHeaders, 'sales.csv');
        lastSalesRef.current = currentSales;
        saved = true;
      }

      if (saved) {
        setLastSaved(new Date());
      }
    };

    const interval = setInterval(autoSave, 5000); // 5 segundos
    return () => clearInterval(interval);
  }, [products, sales, isLoading]);

  const addProduct = (product: Product) => {
    setProducts(prev => ({
      ...prev,
      [product.codigo]: product
    }));
  };

  const updateProduct = (product: Product) => {
    setProducts(prev => ({
      ...prev,
      [product.codigo]: {
        ...prev[product.codigo],
        ...product
      }
    }));
  };

  const addSale = (sale: Sale) => {
    setSales(prev => [...prev, sale]);
  };

  const decreaseStock = (codigo: string, cantidad: number): boolean => {
    if (!products[codigo] || products[codigo].stock < cantidad) {
      return false;
    }

    setProducts(prev => ({
      ...prev,
      [codigo]: {
        ...prev[codigo],
        stock: prev[codigo].stock - cantidad
      }
    }));

    return true;
  };

  const getProduct = (codigo: string): Product | null => {
    return products[codigo] || null;
  };

  return (
    <DataContext.Provider
      value={{
        products,
        sales,
        addProduct,
        updateProduct,
        addSale,
        decreaseStock,
        getProduct,
        isLoading,
        lastSaved
      }}
    >
      {children}
    </DataContext.Provider>
  );
};