import { createContext, useContext, useState, useEffect } from 'react';
import { authApi, userApi } from '../api/api';

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const result = await authApi.verify();
          setUser(result.user);
          if (result.user.email_verificado) {
            localStorage.removeItem('pendingVerificationEmail');
          }
        } catch {
          localStorage.removeItem('pendingVerificationEmail');
          authApi.logout();
        }
      } else {
        localStorage.removeItem('pendingVerificationEmail');
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, contrasena) => {
    setError(null);
    try {
      const data = await authApi.login(email, contrasena);
      setUser(data.user);
      if (data.user.email_verificado === false) {
        localStorage.setItem('pendingVerificationEmail', data.user.email);
      } else {
        localStorage.removeItem('pendingVerificationEmail');
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const registro = async (nombre, email, contrasena) => {
    setError(null);
    try {
      const data = await authApi.registro(nombre, email, contrasena);
      setUser(data.user);
      if (data.user.email_verificado === false) {
        localStorage.setItem('pendingVerificationEmail', email);
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const clearPendingVerification = () => {
    localStorage.removeItem('pendingVerificationEmail');
  };

  const logout = () => {
    authApi.logout();
    localStorage.removeItem('pendingVerificationEmail');
    setUser(null);
  };

  const updatePerfil = async (datos) => {
    try {
      const updatedUser = await userApi.updatePerfil(datos);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const refreshUser = async () => {
    try {
      const perfil = await userApi.getPerfil();
      setUser(perfil);
      return perfil;
    } catch (err) {
      console.error('Error al refreshing:', err);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    registro,
    logout,
    updatePerfil,
    refreshUser,
    clearPendingVerification,
    isAuthenticated: !!user,
    isEmailVerificado: user?.email_verificado === true,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;