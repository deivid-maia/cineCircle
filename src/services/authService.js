import { auth, db, storage } from './firebase';

// Serviço de autenticação usando Firebase compat
const authService = {
  // Registrar novo usuário
  register: async (email, password, displayName = '') => {
    try {
      console.log('AuthService - Tentando registrar usuário:', email);
      
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      console.log('AuthService - Usuário criado:', userCredential.user.uid);
      
      // Se tiver um displayName, atualize o perfil
      if (displayName.trim()) {
        console.log('AuthService - Atualizando perfil com nome:', displayName);
        await userCredential.user.updateProfile({
          displayName: displayName.trim()
        });
      }
      
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('AuthService - Erro no registro:', error);
      let errorMessage = 'Falha ao criar conta.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este email já está em uso.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Operação não permitida. Contate o suporte.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Erro de conexão. Verifique sua internet.';
          break;
        default:
          errorMessage = error.message || 'Erro desconhecido ao criar conta.';
          break;
      }
      
      return { success: false, error: errorMessage };
    }
  },
  
  // Login com email e senha
  login: async (email, password) => {
    try {
      console.log('AuthService - Tentando fazer login:', email);
      
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      console.log('AuthService - Login realizado:', userCredential.user.uid);
      
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('AuthService - Erro no login:', error);
      let errorMessage = 'Falha ao fazer login.';
      
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Email ou senha incorretos.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Esta conta foi desativada.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Erro de conexão. Verifique sua internet.';
          break;
        default:
          errorMessage = error.message || 'Erro desconhecido ao fazer login.';
          break;
      }
      
      return { success: false, error: errorMessage };
    }
  },
  
  // Logout
  logout: async () => {
    try {
      console.log('AuthService - Fazendo logout');
      await auth.signOut();
      console.log('AuthService - Logout realizado');
      return { success: true };
    } catch (error) {
      console.error('AuthService - Erro no logout:', error);
      return { success: false, error: error.message || 'Erro ao fazer logout.' };
    }
  },
  
  // Redefinição de senha
  resetPassword: async (email) => {
    try {
      console.log('AuthService - Enviando email de recuperação:', email);
      await auth.sendPasswordResetEmail(email);
      console.log('AuthService - Email de recuperação enviado');
      return { success: true };
    } catch (error) {
      console.error('AuthService - Erro na recuperação:', error);
      let errorMessage = 'Falha ao enviar email de recuperação.';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Email inválido.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Nenhuma conta encontrada com este email.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Erro de conexão. Verifique sua internet.';
          break;
        default:
          errorMessage = error.message || 'Erro ao enviar email de recuperação.';
          break;
      }
      
      return { success: false, error: errorMessage };
    }
  },

  // Excluir conta do usuário
  deleteAccount: async () => {
    try {
      console.log('AuthService - Iniciando exclusão de conta');
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: 'Usuário não encontrado' };
      }

      // Excluir a conta do Firebase Auth
      await currentUser.delete();
      console.log('AuthService - Conta excluída com sucesso');
      
      return { success: true };
    } catch (error) {
      console.error('AuthService - Erro na exclusão:', error);
      let errorMessage = 'Falha ao excluir conta.';
      
      switch (error.code) {
        case 'auth/requires-recent-login':
          errorMessage = 'Por segurança, você precisa fazer login novamente antes de excluir sua conta.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Erro de conexão. Verifique sua internet.';
          break;
        default:
          errorMessage = error.message || 'Erro ao excluir conta.';
          break;
      }
      
      return { success: false, error: errorMessage };
    }
  },

  // Atualizar nome do usuário
  updateDisplayName: async (displayName) => {
    try {
      console.log('AuthService - Atualizando nome:', displayName);
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: 'Usuário não encontrado' };
      }

      await currentUser.updateProfile({
        displayName: displayName.trim()
      });
      
      console.log('AuthService - Nome atualizado com sucesso');
      return { success: true };
    } catch (error) {
      console.error('AuthService - Erro ao atualizar nome:', error);
      return { success: false, error: error.message || 'Erro ao atualizar nome.' };
    }
  },

  // Upload de foto para Firebase Storage
  uploadProfilePhoto: async (imageUri) => {
    try {
      console.log('AuthService - Fazendo upload da foto');
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: 'Usuário não encontrado' };
      }

      // Converter URI em blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Referência no Storage
      const photoRef = storage.ref().child(`profile_photos/${currentUser.uid}`);
      
      // Upload
      await photoRef.put(blob);
      
      // Obter URL de download
      const downloadURL = await photoRef.getDownloadURL();
      
      // Atualizar perfil com nova URL
      await currentUser.updateProfile({
        photoURL: downloadURL
      });
      
      console.log('AuthService - Foto atualizada com sucesso');
      return { success: true, photoURL: downloadURL };
    } catch (error) {
      console.error('AuthService - Erro no upload da foto:', error);
      return { success: false, error: error.message || 'Erro ao fazer upload da foto.' };
    }
  },

  // Remover foto do perfil
  removeProfilePhoto: async () => {
    try {
      console.log('AuthService - Removendo foto do perfil');
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: 'Usuário não encontrado' };
      }

      // Remover do Storage
      try {
        const photoRef = storage.ref().child(`profile_photos/${currentUser.uid}`);
        await photoRef.delete();
      } catch (storageError) {
        console.log('Foto não existia no storage:', storageError);
      }
      
      // Remover URL do perfil
      await currentUser.updateProfile({
        photoURL: null
      });
      
      console.log('AuthService - Foto removida com sucesso');
      return { success: true };
    } catch (error) {
      console.error('AuthService - Erro ao remover foto:', error);
      return { success: false, error: error.message || 'Erro ao remover foto.' };
    }
  },

  // Reautenticar usuário
  reauthenticate: async (currentPassword) => {
    try {
      console.log('AuthService - Reautenticando usuário');
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: 'Usuário não encontrado' };
      }

      const credential = auth.EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      
      await currentUser.reauthenticateWithCredential(credential);
      console.log('AuthService - Reautenticação realizada com sucesso');
      return { success: true };
    } catch (error) {
      console.error('AuthService - Erro na reautenticação:', error);
      let errorMessage = 'Senha atual incorreta.';
      
      switch (error.code) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Senha atual incorreta.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
          break;
        default:
          errorMessage = error.message || 'Erro na verificação da senha.';
          break;
      }
      
      return { success: false, error: errorMessage };
    }
  },

  // Atualizar email
  updateEmail: async (currentPassword, newEmail) => {
    try {
      console.log('AuthService - Atualizando email para:', newEmail);
      
      // Primeiro reautenticar
      const reauthResult = await authService.reauthenticate(currentPassword);
      if (!reauthResult.success) {
        return reauthResult;
      }
      
      const currentUser = auth.currentUser;
      await currentUser.updateEmail(newEmail);
      
      console.log('AuthService - Email atualizado com sucesso');
      return { success: true };
    } catch (error) {
      console.error('AuthService - Erro ao atualizar email:', error);
      let errorMessage = 'Erro ao atualizar email.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este email já está em uso por outra conta.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido.';
          break;
        case 'auth/requires-recent-login':
          errorMessage = 'Por segurança, faça login novamente e tente alterar o email.';
          break;
        default:
          errorMessage = error.message || 'Erro ao atualizar email.';
          break;
      }
      
      return { success: false, error: errorMessage };
    }
  },

  // Atualizar senha
  updatePassword: async (currentPassword, newPassword) => {
    try {
      console.log('AuthService - Atualizando senha');
      
      // Primeiro reautenticar
      const reauthResult = await authService.reauthenticate(currentPassword);
      if (!reauthResult.success) {
        return reauthResult;
      }
      
      const currentUser = auth.currentUser;
      await currentUser.updatePassword(newPassword);
      
      console.log('AuthService - Senha atualizada com sucesso');
      return { success: true };
    } catch (error) {
      console.error('AuthService - Erro ao atualizar senha:', error);
      let errorMessage = 'Erro ao atualizar senha.';
      
      switch (error.code) {
        case 'auth/weak-password':
          errorMessage = 'A nova senha é muito fraca.';
          break;
        case 'auth/requires-recent-login':
          errorMessage = 'Por segurança, faça login novamente e tente alterar a senha.';
          break;
        default:
          errorMessage = error.message || 'Erro ao atualizar senha.';
          break;
      }
      
      return { success: false, error: errorMessage };
    }
  },

  // Salvar biografia no Firestore
  updateBio: async (bio) => {
    try {
      console.log('AuthService - Salvando biografia');
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: 'Usuário não encontrado' };
      }

      await db.collection('users').doc(currentUser.uid).set({
        bio: bio.trim(),
        updatedAt: new Date()
      }, { merge: true });
      
      console.log('AuthService - Biografia salva com sucesso');
      return { success: true };
    } catch (error) {
      console.error('AuthService - Erro ao salvar biografia:', error);
      return { success: false, error: error.message || 'Erro ao salvar biografia.' };
    }
  },

  // Obter biografia do Firestore
  getBio: async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: 'Usuário não encontrado' };
      }

      const userDoc = await db.collection('users').doc(currentUser.uid).get();
      
      if (userDoc.exists) {
        const data = userDoc.data();
        return { success: true, bio: data.bio || '' };
      } else {
        return { success: true, bio: '' };
      }
    } catch (error) {
      console.error('AuthService - Erro ao obter biografia:', error);
      return { success: false, error: error.message || 'Erro ao carregar biografia.' };
    }
  },
    
  // Obter o usuário atual
  getCurrentUser: () => {
    return auth.currentUser;
  },
  
  // Escutar mudanças de autenticação
  onAuthStateChanged: (callback) => {
    return auth.onAuthStateChanged(callback);
  }
};

export default authService;