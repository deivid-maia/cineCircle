import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/firebase';
import authService from '../services/authService';

// Criar o contexto
const AuthContext = createContext({});

// Hook personalizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Provider do contexto de autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Monitorar mudanças no estado de autenticação
  useEffect(() => {
    console.log('AuthContext - Configurando listener de auth');
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('AuthContext - Auth state changed:', user ? `Logged in: ${user.email}` : 'Logged out');
      setUser(user);
      
      if (initializing) {
        setInitializing(false);
        console.log('AuthContext - Inicialização completa');
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('AuthContext - Removendo listener de auth');
      unsubscribe();
    };
  }, [initializing]);

  // Função de login
  const login = async (email, password) => {
    setLoading(true);
    try {
      console.log('AuthContext - Iniciando login');
      const result = await authService.login(email, password);
      console.log('AuthContext - Resultado do login:', result.success);
      return result;
    } catch (error) {
      console.error('AuthContext - Erro no login:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Função de registro
  const register = async (email, password, displayName = '') => {
    setLoading(true);
    try {
      console.log('AuthContext - Iniciando registro');
      const result = await authService.register(email, password, displayName);
      console.log('AuthContext - Resultado do registro:', result.success);
      return result;
    } catch (error) {
      console.error('AuthContext - Erro no registro:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = async () => {
    setLoading(true);
    try {
      console.log('AuthContext - Iniciando logout');
      const result = await authService.logout();
      console.log('AuthContext - Resultado do logout:', result.success);
      return result;
    } catch (error) {
      console.error('AuthContext - Erro no logout:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Função de redefinição de senha
  const resetPassword = async (email) => {
    try {
      console.log('AuthContext - Iniciando reset de senha');
      const result = await authService.resetPassword(email);
      console.log('AuthContext - Resultado do reset:', result.success);
      return result;
    } catch (error) {
      console.error('AuthContext - Erro no reset:', error);
      return { success: false, error: error.message };
    }
  };

  // Função de exclusão de conta
  const deleteAccount = async () => {
    setLoading(true);
    try {
      console.log('AuthContext - Iniciando exclusão de conta');
      const result = await authService.deleteAccount();
      console.log('AuthContext - Resultado da exclusão:', result.success);
      return result;
    } catch (error) {
      console.error('AuthContext - Erro na exclusão:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Funções de edição de perfil
  const updateDisplayName = async (displayName) => {
    try {
      return await authService.updateDisplayName(displayName);
    } catch (error) {
      console.error('AuthContext - Erro ao atualizar nome:', error);
      return { success: false, error: error.message };
    }
  };

  const uploadProfilePhoto = async (imageUri) => {
    try {
      return await authService.uploadProfilePhoto(imageUri);
    } catch (error) {
      console.error('AuthContext - Erro no upload da foto:', error);
      return { success: false, error: error.message };
    }
  };

  const removeProfilePhoto = async () => {
    try {
      return await authService.removeProfilePhoto();
    } catch (error) {
      console.error('AuthContext - Erro ao remover foto:', error);
      return { success: false, error: error.message };
    }
  };

  const updateEmail = async (currentPassword, newEmail) => {
    try {
      return await authService.updateEmail(currentPassword, newEmail);
    } catch (error) {
      console.error('AuthContext - Erro ao atualizar email:', error);
      return { success: false, error: error.message };
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      return await authService.updatePassword(currentPassword, newPassword);
    } catch (error) {
      console.error('AuthContext - Erro ao atualizar senha:', error);
      return { success: false, error: error.message };
    }
  };

  const updateBio = async (bio) => {
    try {
      return await authService.updateBio(bio);
    } catch (error) {
      console.error('AuthContext - Erro ao salvar biografia:', error);
      return { success: false, error: error.message };
    }
  };

  const getBio = async () => {
    try {
      return await authService.getBio();
    } catch (error) {
      console.error('AuthContext - Erro ao carregar biografia:', error);
      return { success: false, error: error.message };
    }
  };

  // E adicionar no value do contexto:
  const value = {
    user,
    loading,
    initializing,
    login,
    register,
    logout,
    resetPassword,
    deleteAccount,
    // Funções de edição de perfil - ESTAS DEVEM ESTAR AQUI:
    updateDisplayName,
    uploadProfilePhoto,
    removeProfilePhoto,
    updateEmail,
    updatePassword,
    updateBio,
    getBio,
    isAuthenticated: !!user,
  };

  console.log('AuthContext - Estado atual:', {
    hasUser: !!user,
    loading,
    initializing,
    isAuthenticated: !!user
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};