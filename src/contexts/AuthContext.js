import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../services/firebase'; // ✅ Adicionar db import
import authService from '../services/authService';
import friendsService from '../services/friendsService'; // ✅ Import direto no topo

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

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('AuthContext - Auth state changed:', user ? `Logged in: ${user.email}` : 'Logged out');

      if (user) {
        // 🔥 CRIAR PERFIL AUTOMATICAMENTE
        await createUserProfile(user);
      }

      setUser(user);

      if (initializing) {
        setInitializing(false);
        console.log('AuthContext - Inicialização completa');
      }
      setLoading(false);
    });

    return () => {
      console.log('AuthContext - Removendo listener de auth');
      unsubscribe();
    };
  }, [initializing]);

  // 🚀 FUNÇÃO PARA CRIAR PERFIL PÚBLICO
  const createUserProfile = async (user) => {
    try {
      if (!user) return;

      console.log('AuthContext - Criando/atualizando perfil público para:', user.uid);

      const userDoc = await db.collection('users').doc(user.uid).get();

      if (!userDoc.exists) {
        // Criar perfil inicial
        await db.collection('users').doc(user.uid).set({
          displayName: user.displayName || 'Usuário',
          email: user.email,
          photoURL: user.photoURL || null,
          bio: '',
          isPublic: true,
          createdAt: new Date(),
          lastSeen: new Date()
        });
        console.log('AuthContext - Perfil público criado');
      } else {
        // Atualizar dados básicos se necessário (manter bio existente)
        const existingData = userDoc.data();
        await db.collection('users').doc(user.uid).update({
          displayName: user.displayName || existingData.displayName || 'Usuário',
          email: user.email,
          photoURL: user.photoURL || existingData.photoURL || null,
          lastSeen: new Date()
        });
        console.log('AuthContext - Perfil público atualizado');
      }
    } catch (error) {
      console.error('AuthContext - Erro ao criar/atualizar perfil:', error);
    }
  };


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

      if (result.success) {
        // Criar perfil do usuário no Firestore após registro bem-sucedido
        await createUserProfile(result.user);
      }

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
  const updateDisplayName = async (displayName) => {
    try {
      console.log('AuthContext - Atualizando nome para:', displayName);

      const result = await authService.updateDisplayName(displayName);
      if (result.success) {
        // SINCRONIZAR COM FIRESTORE
        const currentUser = auth.currentUser;
        if (currentUser) {
          await db.collection('users').doc(currentUser.uid).update({
            displayName: displayName.trim(),
            updatedAt: new Date()
          });
          console.log('AuthContext - Nome sincronizado no Firestore');
        }

        // Atualizar contexto local
        await refreshUser();
      }
      return result;
    } catch (error) {
      console.error('AuthContext - Erro ao atualizar nome:', error);
      return { success: false, error: error.message };
    }
  }

  const uploadProfilePhoto = async (imageUri) => {
    try {
      console.log('AuthContext - Iniciando upload de foto');
      const result = await authService.uploadProfilePhoto(imageUri);

      if (result.success) {
        console.log('AuthContext - Upload bem-sucedido, sincronizando com Firestore...');

        // SINCRONIZAR COM FIRESTORE
        const currentUser = auth.currentUser;
        if (currentUser && result.photoURL) {
          await db.collection('users').doc(currentUser.uid).update({
            photoURL: result.photoURL,
            updatedAt: new Date()
          });
          console.log('AuthContext - Foto sincronizada no Firestore');
        }

        // Fazer refresh do usuário
        await refreshUser();

        // Aguardar um pouco e fazer outro refresh
        setTimeout(async () => {
          await refreshUser();
          console.log('AuthContext - Refresh adicional concluído');
        }, 1000);
      }

      return result;
    } catch (error) {
      console.error('AuthContext - Erro no upload da foto:', error);
      return { success: false, error: error.message };
    }
  };

  const removeProfilePhoto = async () => {
    try {
      const result = await authService.removeProfilePhoto();
      if (result.success) {
        // SINCRONIZAR COM FIRESTORE
        const currentUser = auth.currentUser;
        if (currentUser) {
          await db.collection('users').doc(currentUser.uid).update({
            photoURL: null,
            updatedAt: new Date()
          });
          console.log('AuthContext - Remoção sincronizada no Firestore');
        }

        // Atualizar contexto local
        await refreshUser();
      }
      return result;
    } catch (error) {
      console.error('AuthContext - Erro ao remover foto:', error);
      return { success: false, error: error.message };
    }
  };


  // const removeProfilePhoto = async () => {
  //   try {
  //     const result = await authService.removeProfilePhoto();
  //     if (result.success) {
  //       // Atualizar contexto local
  //       await refreshUser();
  //     }
  //     return result;
  //   } catch (error) {
  //     console.error('AuthContext - Erro ao remover foto:', error);
  //     return { success: false, error: error.message };
  //   }
  // };

  const updateEmail = async (currentPassword, newEmail) => {
    try {
      const result = await authService.updateEmail(currentPassword, newEmail);
      if (result.success) {
        // Atualizar contexto local
        await refreshUser();
      }
      return result;
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

  // 🚀 NOVA FUNÇÃO: Refresh manual do usuário
  const refreshUser = async () => {
    try {
      console.log('AuthContext - Fazendo refresh do usuário');
      const currentUser = auth.currentUser;

      if (currentUser) {
        // Recarregar dados do Firebase
        await currentUser.reload();

        // Forçar atualização do token
        await currentUser.getIdToken(true);

        // Atualizar estado local (força re-render)
        setUser({ ...auth.currentUser });

        console.log('AuthContext - Refresh concluído');
        return { success: true };
      } else {
        console.log('AuthContext - Nenhum usuário para refresh');
        return { success: false, error: 'Nenhum usuário logado' };
      }
    } catch (error) {
      console.error('AuthContext - Erro no refresh:', error);
      return { success: false, error: error.message };
    }
  };

  const syncUserProfile = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return { success: false, error: 'Usuário não encontrado' };

      // Buscar dados atuais do Firestore
      const userDoc = await db.collection('users').doc(currentUser.uid).get();

      if (userDoc.exists) {
        const firestoreData = userDoc.data();

        // Verificar se há diferenças entre Auth e Firestore
        const authData = {
          displayName: currentUser.displayName,
          email: currentUser.email,
          photoURL: currentUser.photoURL
        };

        const needsUpdate =
          authData.displayName !== firestoreData.displayName ||
          authData.photoURL !== firestoreData.photoURL;

        if (needsUpdate) {
          console.log('AuthContext - Sincronizando diferenças entre Auth e Firestore');
          await db.collection('users').doc(currentUser.uid).update({
            displayName: authData.displayName || firestoreData.displayName,
            photoURL: authData.photoURL || firestoreData.photoURL,
            email: authData.email,
            lastSeen: new Date()
          });
        }
      } else {
        // Se não existe, criar
        await createUserProfile(currentUser);
      }

      return { success: true };
    } catch (error) {
      console.error('AuthContext - Erro na sincronização:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    initializing,
    login,
    register,
    logout,
    resetPassword,
    deleteAccount,
    // Funções de edição de perfil
    updateDisplayName,
    uploadProfilePhoto,
    removeProfilePhoto,
    updateEmail,
    updatePassword,
    updateBio,
    getBio,
    // 🚀 NOVA FUNÇÃO
    refreshUser,
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