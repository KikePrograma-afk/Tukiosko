import React, { useState, useEffect } from 'react';
import { Tabs } from './components/Tabs';
import { SaveStatus } from './components/SaveStatus';
import { Dashboard } from './components/Dashboard';
import ProductManagement from './pages/ProductManagement';
import SalesRegistration from './pages/SalesRegistration';
import Reports from './pages/Reports';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';
import { AlertCircle } from 'lucide-react';
import { Login } from './components/Auth/Login';

function App() {
  const [activeTab, setActiveTab] = useState(0);
  // Estado para verificar si la autenticación inicial se ha comprobado
  const [authChecked, setAuthChecked] = useState(false);
  // Estado para rastrear si el usuario está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));

  useEffect(() => {
    // Solo necesitamos verificar el token una vez al cargar la aplicación
    // para el estado inicial de isAuthenticated.
    // authChecked es para evitar el parpadeo de la interfaz.
    if (!authChecked) {
        setIsAuthenticated(!!localStorage.getItem('authToken'));
        setAuthChecked(true);
    }
  }, [authChecked]); // Dependencia para asegurar que solo se ejecute cuando authChecked cambie

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    // No es necesario navegar aquí si Login.tsx ya lo hace.
    // Si Login.tsx navega a '/', App.tsx se volverá a renderizar
    // y como isAuthenticated será true, mostrará el contenido principal.
  };

  // Mientras se verifica la autenticación, no mostrar nada o un loader
  if (!authChecked) {
    return null; // O un componente de carga: <LoadingSpinner />
  }

  // Si no está autenticado (después de la verificación), mostrar Login
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Si está autenticado, mostrar la aplicación principal
  const tabs = [
    { title: '📊 Dashboard', content: <Dashboard /> },
    { title: 'Gestión de Productos', content: <ProductManagement /> },
    { title: 'Registro de Ventas', content: <SalesRegistration /> },
    { title: 'Reportes', content: <Reports /> },
  ];

  return (
    <DataProvider>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-blue-600 text-white p-4 shadow-md">
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={24} />
                <h1 className="text-xl font-bold">Sistema de Gestión de Stock para Kiosko</h1>
              </div>
              <SaveStatus />
            </div>
          </header>
          
          <main className="container mx-auto p-4 mt-4">
            <Tabs 
              tabs={tabs.map(tab => tab.title)} 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
            />
            <div className="mt-4 bg-white rounded-lg shadow-md p-6">
              {tabs[activeTab].content}
            </div>
          </main>
          
          <footer className="bg-gray-100 p-4 border-t mt-auto">
            <div className="container mx-auto text-center text-gray-600 text-sm">
              © {new Date().getFullYear()} Sistema de Gestión de Stock para Kiosko
            </div>
          </footer>
        </div>
      </ToastProvider>
    </DataProvider>
  );
}

export default App;