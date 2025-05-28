import React from 'react';
import { useData } from '../context/DataContext';
import { Save, Loader } from 'lucide-react';

export const SaveStatus: React.FC = () => {
  const { isLoading, lastSaved } = useData();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-blue-600">
        <Loader className="animate-spin" size={16} />
        <span className="text-sm">Cargando datos...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-green-600">
      <Save size={16} />
      <span className="text-sm">
        {lastSaved 
          ? `Guardado: ${lastSaved.toLocaleTimeString()}`
          : 'Datos sincronizados'
        }
      </span>
    </div>
  );
};