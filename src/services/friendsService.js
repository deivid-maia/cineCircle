import { db, auth } from './firebase';

const friendsService = {
  
  // 🚀 FUNÇÃO DE INICIALIZAÇÃO - Cria estrutura automaticamente
  initializeUserFriendsStructure: async (userId) => {
    try {
      console.log('FriendsService - Inicializando estrutura para:', userId);
      
      // Verificar se já existe
      const userFriendsDoc = await db.collection('userFriends').doc(userId).get();
      
      if (!userFriendsDoc.exists) {
        // Criar documento inicial do usuário
        await db.collection('userFriends').doc(userId).set({
          friendIds: [],
          friendCount: 0,
          lastUpdated: new Date(),
          createdAt: new Date()
        });
        
        console.log('FriendsService - Estrutura criada para:', userId);
      }
      
      return { success: true };
    } catch (error) {
      console.error('FriendsService - Erro ao inicializar:', error);
      return { success: false, error: error.message };
    }
  },

  // ✅ ENVIAR SOLICITAÇÃO DE AMIZADE
  sendFriendRequest: async (toUserId, message = '') => {
    try {
      const fromUserId = auth.currentUser?.uid;
      if (!fromUserId) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      console.log('FriendsService - Enviando solicitação:', fromUserId, '->', toUserId);

      // Verificar se já existe solicitação pendente - QUERY SIMPLIFICADA
      const existingRequest = await db
        .collection('friendRequests')
        .where('fromUserId', '==', fromUserId)
        .where('toUserId', '==', toUserId)
        .where('status', '==', 'pending')
        .get();

      if (!existingRequest.empty) {
        return { success: false, error: 'Solicitação já enviada' };
      }

      // Verificar se já são amigos
      const existingFriendship = await db
        .collection('friendships')
        .where('user1Id', 'in', [fromUserId, toUserId])
        .where('user2Id', 'in', [fromUserId, toUserId])
        .where('status', '==', 'active')
        .get();

      if (!existingFriendship.empty) {
        return { success: false, error: 'Vocês já são amigos' };
      }

      // 🔥 CRIAR SOLICITAÇÃO (cria a coleção automaticamente)
      const requestData = {
        fromUserId,
        toUserId,
        status: 'pending',
        message: message.trim(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await db.collection('friendRequests').add(requestData);
      
      console.log('FriendsService - Solicitação criada:', docRef.id);
      return { success: true, requestId: docRef.id };

    } catch (error) {
      console.error('FriendsService - Erro ao enviar solicitação:', error);
      return { success: false, error: error.message };
    }
  },

  // ✅ ACEITAR SOLICITAÇÃO
  acceptFriendRequest: async (requestId) => {
    try {
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      console.log('FriendsService - Aceitando solicitação:', requestId);

      // Buscar dados da solicitação
      const requestDoc = await db.collection('friendRequests').doc(requestId).get();
      if (!requestDoc.exists) {
        return { success: false, error: 'Solicitação não encontrada' };
      }

      const requestData = requestDoc.data();
      const { fromUserId, toUserId } = requestData;

      // Verificar se o usuário atual pode aceitar
      if (toUserId !== currentUserId) {
        return { success: false, error: 'Você não pode aceitar esta solicitação' };
      }

      // 🔥 USAR BATCH PARA OPERAÇÕES ATÔMICAS
      const batch = db.batch();

      // 1. Atualizar status da solicitação
      const requestRef = db.collection('friendRequests').doc(requestId);
      batch.update(requestRef, { 
        status: 'accepted', 
        updatedAt: new Date() 
      });

      // 2. Criar amizade (cria a coleção automaticamente)
      const friendshipRef = db.collection('friendships').doc();
      batch.set(friendshipRef, {
        user1Id: fromUserId,
        user2Id: toUserId,
        status: 'active',
        createdAt: new Date()
      });

      // 3. Atualizar lista de amigos do usuário 1
      const user1FriendsRef = db.collection('userFriends').doc(fromUserId);
      batch.set(user1FriendsRef, {
        friendIds: db.FieldValue.arrayUnion(toUserId),
        friendCount: db.FieldValue.increment(1),
        lastUpdated: new Date()
      }, { merge: true });

      // 4. Atualizar lista de amigos do usuário 2
      const user2FriendsRef = db.collection('userFriends').doc(toUserId);
      batch.set(user2FriendsRef, {
        friendIds: db.FieldValue.arrayUnion(fromUserId),
        friendCount: db.FieldValue.increment(1),
        lastUpdated: new Date()
      }, { merge: true });

      // Executar todas as operações
      await batch.commit();

      console.log('FriendsService - Solicitação aceita com sucesso');
      return { success: true };

    } catch (error) {
      console.error('FriendsService - Erro ao aceitar solicitação:', error);
      return { success: false, error: error.message };
    }
  },

  // ✅ REJEITAR SOLICITAÇÃO
  rejectFriendRequest: async (requestId) => {
    try {
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      console.log('FriendsService - Rejeitando solicitação:', requestId);

      // Buscar e verificar solicitação
      const requestDoc = await db.collection('friendRequests').doc(requestId).get();
      if (!requestDoc.exists) {
        return { success: false, error: 'Solicitação não encontrada' };
      }

      const requestData = requestDoc.data();
      if (requestData.toUserId !== currentUserId) {
        return { success: false, error: 'Você não pode rejeitar esta solicitação' };
      }

      // Atualizar status
      await db.collection('friendRequests').doc(requestId).update({
        status: 'rejected',
        updatedAt: new Date()
      });

      console.log('FriendsService - Solicitação rejeitada');
      return { success: true };

    } catch (error) {
      console.error('FriendsService - Erro ao rejeitar solicitação:', error);
      return { success: false, error: error.message };
    }
  },

  // 📋 BUSCAR SOLICITAÇÕES RECEBIDAS - QUERY SIMPLIFICADA COM CORREÇÃO DE DATA
  getFriendRequests: async () => {
    try {
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      console.log('FriendsService - Buscando solicitações para:', currentUserId);

      // 🔥 QUERY SIMPLIFICADA - sem orderBy para evitar erro de index
      const requestsSnapshot = await db
        .collection('friendRequests')
        .where('toUserId', '==', currentUserId)
        .where('status', '==', 'pending')
        .get();

      const requests = [];
      for (const doc of requestsSnapshot.docs) {
        const requestData = doc.data();
        
        // 🔥 CONVERTER TIMESTAMP DO FIRESTORE PARA DATE
        let createdAtDate = new Date(); // Fallback para data atual
        
        if (requestData.createdAt) {
          if (requestData.createdAt.toDate) {
            // É um Timestamp do Firestore
            createdAtDate = requestData.createdAt.toDate();
          } else if (requestData.createdAt instanceof Date) {
            // Já é um objeto Date
            createdAtDate = requestData.createdAt;
          } else if (typeof requestData.createdAt === 'string') {
            // É uma string, tentar converter
            createdAtDate = new Date(requestData.createdAt);
          }
        }
        
        // Buscar dados do remetente
        try {
          const fromUserDoc = await db.collection('users').doc(requestData.fromUserId).get();
          const fromUserData = fromUserDoc.exists ? fromUserDoc.data() : null;

          requests.push({
            id: doc.id,
            senderId: requestData.fromUserId,
            senderName: fromUserData?.displayName || 'Usuário',
            senderAvatar: fromUserData?.photoURL || null,
            message: requestData.message || '',
            createdAt: createdAtDate, // 🔥 SEMPRE UM OBJETO DATE VÁLIDO
            ...requestData
          });
        } catch (userError) {
          console.error('Erro ao buscar dados do usuário:', userError);
          // Continuar mesmo se não conseguir buscar dados do usuário
          requests.push({
            id: doc.id,
            senderId: requestData.fromUserId,
            senderName: 'Usuário',
            senderAvatar: null,
            message: requestData.message || '',
            createdAt: createdAtDate, // 🔥 SEMPRE UM OBJETO DATE VÁLIDO
            ...requestData
          });
        }
      }

      // 🔥 ORDENAR NO CLIENT-SIDE
      requests.sort((a, b) => b.createdAt - a.createdAt);

      console.log('FriendsService - Solicitações encontradas:', requests.length);
      return { success: true, requests };

    } catch (error) {
      console.error('FriendsService - Erro ao buscar solicitações:', error);
      return { success: false, error: error.message };
    }
  },

  // 👥 BUSCAR AMIGOS DO USUÁRIO
  getUserFriends: async (userId = null) => {
    try {
      const targetUserId = userId || auth.currentUser?.uid;
      if (!targetUserId) {
        return { success: false, error: 'Usuário não especificado' };
      }

      console.log('FriendsService - Buscando amigos de:', targetUserId);

      // Buscar lista de IDs dos amigos
      const userFriendsDoc = await db.collection('userFriends').doc(targetUserId).get();
      
      if (!userFriendsDoc.exists) {
        // Inicializar estrutura se não existir
        await this.initializeUserFriendsStructure(targetUserId);
        return { success: true, friends: [] };
      }

      const { friendIds = [] } = userFriendsDoc.data();

      if (friendIds.length === 0) {
        return { success: true, friends: [] };
      }

      // Buscar dados dos amigos (máximo 10 por vez - limitação do Firestore)
      const friends = [];
      const chunks = [];
      for (let i = 0; i < friendIds.length; i += 10) {
        chunks.push(friendIds.slice(i, i + 10));
      }

      for (const chunk of chunks) {
        try {
          const usersSnapshot = await db
            .collection('users')
            .where(db.FieldPath.documentId(), 'in', chunk)
            .get();

          usersSnapshot.docs.forEach(doc => {
            friends.push({
              uid: doc.id,
              id: doc.id, // Adicionar também 'id' para compatibilidade
              ...doc.data()
            });
          });
        } catch (chunkError) {
          console.error('Erro ao buscar chunk de amigos:', chunkError);
          // Continuar com outros chunks mesmo se um falhar
        }
      }

      console.log('FriendsService - Amigos encontrados:', friends.length);
      return { success: true, friends };

    } catch (error) {
      console.error('FriendsService - Erro ao buscar amigos:', error);
      return { success: false, error: error.message };
    }
  },

  // 🔍 BUSCAR USUÁRIOS POR NOME/EMAIL
  searchUsers: async (query) => {
    try {
      if (!query || query.length < 2) {
        return { success: true, users: [] };
      }

      console.log('FriendsService - Buscando usuários:', query);

      // Buscar por displayName
      const displayNameQuery = db
        .collection('users')
        .where('displayName', '>=', query)
        .where('displayName', '<=', query + '\uf8ff')
        .limit(10);

      // Buscar por email (se contiver @)
      let emailQuery = null;
      if (query.includes('@')) {
        emailQuery = db
          .collection('users')
          .where('email', '>=', query)
          .where('email', '<=', query + '\uf8ff')
          .limit(10);
      }

      const promises = [displayNameQuery.get()];
      if (emailQuery) {
        promises.push(emailQuery.get());
      }

      const snapshots = await Promise.all(promises);
      
      const userMap = new Map();
      snapshots.forEach(snapshot => {
        snapshot.docs.forEach(doc => {
          const userData = doc.data();
          // Não incluir o próprio usuário
          if (doc.id !== auth.currentUser?.uid) {
            userMap.set(doc.id, {
              uid: doc.id,
              id: doc.id, // Adicionar também 'id' para compatibilidade
              ...userData
            });
          }
        });
      });

      const users = Array.from(userMap.values()).slice(0, 20);

      console.log('FriendsService - Usuários encontrados:', users.length);
      return { success: true, users };

    } catch (error) {
      console.error('FriendsService - Erro na busca:', error);
      return { success: false, error: error.message };
    }
  },

  // 🎯 OBTER SUGESTÕES DE AMIGOS (funcionalidade básica)
  getSuggestedFriends: async () => {
    try {
      console.log('FriendsService - Buscando sugestões');

      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Obter IDs dos amigos atuais para excluir das sugestões
      let currentFriendIds = [];
      try {
        const userFriendsDoc = await db.collection('userFriends').doc(currentUserId).get();
        if (userFriendsDoc.exists) {
          currentFriendIds = userFriendsDoc.data().friendIds || [];
        }
      } catch (error) {
        console.log('Erro ao buscar amigos atuais:', error);
      }

      // Buscar usuários aleatórios que não são amigos
      const usersSnapshot = await db
        .collection('users')
        .limit(20)
        .get();

      const suggestions = [];
      usersSnapshot.docs.forEach(doc => {
        // Não incluir o próprio usuário nem amigos atuais
        if (doc.id !== currentUserId && !currentFriendIds.includes(doc.id)) {
          const userData = doc.data();
          // ✅ VALIDAR DADOS ANTES DE ADICIONAR
          if (userData && (userData.displayName || userData.email)) {
            suggestions.push({
              uid: doc.id,
              id: doc.id, // Adicionar também 'id' para compatibilidade
              ...userData,
              mutualFriends: Math.floor(Math.random() * 5) // Simulado por enquanto
            });
          }
        }
      });

      // Limitar a 10 sugestões
      const limitedSuggestions = suggestions.slice(0, 10);

      console.log('FriendsService - Sugestões encontradas:', limitedSuggestions.length);
      return { success: true, suggestions: limitedSuggestions };

    } catch (error) {
      console.error('FriendsService - Erro ao buscar sugestões:', error);
      return { success: false, error: error.message };
    }
  }
};

export default friendsService;