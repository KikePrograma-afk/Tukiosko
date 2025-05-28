import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

// Definir las props para el componente Login
interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === 'Kiosko1') {
      localStorage.setItem('authToken', 'logged-in');
      onLoginSuccess(); // Llamar a la función de callback
      navigate('/'); // Navegar a la página principal
    } else {
      setError('Contraseña incorrecta');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Lock className="text-blue-600 h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Acceso al Kiosko</h1>
          <p className="text-gray-500">Ingrese la contraseña de administrador</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              placeholder="Contraseña"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};