export interface Product {
  codigo: string;
  nombre: string;
  stock: number;
  precio: number;
  categoria: string;
  imagen: string;
  stockMinimo?: number;
}

export interface Sale {
  fecha_hora: string;
  codigo_barra: string;
  nombre_producto: string;
  cantidad_vendida: number;
  cajero: string;
}

export interface FilterState {
  categoria: string;
  nivelStock: string;
  precioMin: string;
  precioMax: string;
  busqueda: string;
}

export type ViewMode = 'grid' | 'list';
export type SortField = 'nombre' | 'stock' | 'precio';
export type SortOrder = 'asc' | 'desc';