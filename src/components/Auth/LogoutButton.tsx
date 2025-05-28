import React from 'react';

export const LogoutButton: React.FC = () => {
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.reload();
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
    >
      Cerrar Sesión
    </button>
  );
};