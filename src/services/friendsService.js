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

      // 🔥 USAR BATCH PARA OPERAÇÕES ATÔMICAS (sem FieldValue)
      const batch = db.batch();

      // 1. Atualizar status da solicitação
      const requestRef = db.collection('friendRequests').doc(requestId);
      batch.update(requestRef, {
        status: 'accepted',
        updatedAt: new Date()
      });

      // 2. Criar amizade
      const friendshipRef = db.collection('friendships').doc();
      batch.set(friendshipRef, {
        user1Id: fromUserId,
        user2Id: toUserId,
        status: 'active',
        createdAt: new Date()
      });

      // Executar todas as operações
      await batch.commit();

      console.log('FriendsService - Solicitação aceita com sucesso');
      return { success: true };

    } catch (error) {
      console.error('FriendsService - Erro ao aceitar solicitação:', error);
      return { success: false, error: error.message };
    }
  },
  // acceptFriendRequest: async (requestId) => {
  //   try {
  //     const currentUserId = auth.currentUser?.uid;
  //     if (!currentUserId) {
  //       return { success: false, error: 'Usuário não autenticado' };
  //     }

  //     console.log('FriendsService - Aceitando solicitação:', requestId);

  //     // Buscar dados da solicitação
  //     const requestDoc = await db.collection('friendRequests').doc(requestId).get();
  //     if (!requestDoc.exists) {
  //       return { success: false, error: 'Solicitação não encontrada' };
  //     }

  //     const requestData = requestDoc.data();
  //     const { fromUserId, toUserId } = requestData;

  //     // Verificar se o usuário atual pode aceitar
  //     if (toUserId !== currentUserId) {
  //       return { success: false, error: 'Você não pode aceitar esta solicitação' };
  //     }

  //     // 🔥 USAR BATCH PARA OPERAÇÕES ATÔMICAS
  //     const batch = db.batch();

  //     // 1. Atualizar status da solicitação
  //     const requestRef = db.collection('friendRequests').doc(requestId);
  //     batch.update(requestRef, {
  //       status: 'accepted',
  //       updatedAt: new Date()
  //     });

  //     // 2. Criar amizade (cria a coleção automaticamente)
  //     const friendshipRef = db.collection('friendships').doc();
  //     batch.set(friendshipRef, {
  //       user1Id: fromUserId,
  //       user2Id: toUserId,
  //       status: 'active',
  //       createdAt: new Date()
  //     });

  //     // 3. Atualizar lista de amigos do usuário 1
  //     const user1FriendsRef = db.collection('userFriends').doc(fromUserId);
  //     batch.set(user1FriendsRef, {
  //       friendIds: db.FieldValue.arrayUnion(toUserId),
  //       friendCount: db.FieldValue.increment(1),
  //       lastUpdated: new Date()
  //     }, { merge: true });

  //     // 4. Atualizar lista de amigos do usuário 2
  //     const user2FriendsRef = db.collection('userFriends').doc(toUserId);
  //     batch.set(user2FriendsRef, {
  //       friendIds: db.FieldValue.arrayUnion(fromUserId),
  //       friendCount: db.FieldValue.increment(1),
  //       lastUpdated: new Date()
  //     }, { merge: true });

  //     // Executar todas as operações
  //     await batch.commit();

  //     console.log('FriendsService - Solicitação aceita com sucesso');
  //     return { success: true };

  //   } catch (error) {
  //     console.error('FriendsService - Erro ao aceitar solicitação:', error);
  //     return { success: false, error: error.message };
  //   }
  // },

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

  // 📋 BUSCAR SOLICITAÇÕES RECEBIDAS - VERSÃO PARA GERAR LINK DO ÍNDICE
  getFriendRequests: async () => {
    try {
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) {
        console.log('❌ Usuário não autenticado');
        return { success: false, error: 'Usuário não autenticado' };
      }

      console.log('🔍 Buscando solicitações para usuário:', currentUserId);

      // 🔥 VERIFICAR COLLECTION friendRequests
      console.log('📊 Verificando collection friendRequests...');
      const testSnapshot = await db.collection('friendRequests').limit(5).get();
      console.log('📊 Collection friendRequests existe:', !testSnapshot.empty);
      console.log('📊 Total docs na collection:', testSnapshot.size);

      // Listar todas as solicitações (para debug)
      testSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log('📄 Solicitação na collection:', {
          id: doc.id,
          fromUserId: data.fromUserId,
          toUserId: data.toUserId,
          status: data.status
        });
      });

      // 🔥 QUERY SIMPLES (sem orderBy)
      const requestsSnapshot = await db
        .collection('friendRequests')
        .where('toUserId', '==', currentUserId)
        .where('status', '==', 'pending')
        .get();

      console.log('📊 Resultado da query filtrada:', {
        size: requestsSnapshot.size,
        empty: requestsSnapshot.empty
      });

      if (requestsSnapshot.empty) {
        console.log('📭 Nenhuma solicitação encontrada para este usuário');
        return { success: true, requests: [] };
      }

      const requests = [];
      for (const doc of requestsSnapshot.docs) {
        const requestData = doc.data();
        console.log('📄 Solicitação encontrada:', {
          id: doc.id,
          fromUserId: requestData.fromUserId,
          toUserId: requestData.toUserId,
          status: requestData.status,
          createdAt: requestData.createdAt
        });

        let createdAtDate = new Date();
        if (requestData.createdAt) {
          if (requestData.createdAt.toDate) {
            createdAtDate = requestData.createdAt.toDate();
          } else if (requestData.createdAt instanceof Date) {
            createdAtDate = requestData.createdAt;
          } else if (typeof requestData.createdAt === 'string') {
            createdAtDate = new Date(requestData.createdAt);
          }
        }

        try {
          console.log('👤 Buscando dados do usuário:', requestData.fromUserId);
          const fromUserDoc = await db.collection('users').doc(requestData.fromUserId).get();

          if (!fromUserDoc.exists) {
            console.log('⚠️ Usuário remetente não encontrado:', requestData.fromUserId);
          }

          const fromUserData = fromUserDoc.exists ? fromUserDoc.data() : null;
          console.log('👤 Dados do remetente:', fromUserData);

          requests.push({
            id: doc.id,
            senderId: requestData.fromUserId,
            senderName: fromUserData?.displayName || 'Usuário',
            senderAvatar: fromUserData?.photoURL || null,
            message: requestData.message || '',
            createdAt: createdAtDate,
            ...requestData
          });
        } catch (userError) {
          console.error('❌ Erro ao buscar dados do usuário:', userError);
          requests.push({
            id: doc.id,
            senderId: requestData.fromUserId,
            senderName: 'Usuário',
            senderAvatar: null,
            message: requestData.message || '',
            createdAt: createdAtDate,
            ...requestData
          });
        }
      }

      requests.sort((a, b) => b.createdAt - a.createdAt);

      console.log('✅ Solicitações processadas:', requests.length);
      console.log('📋 Lista final de solicitações:', requests);

      return { success: true, requests };

    } catch (error) {
      console.error('❌ Erro ao buscar solicitações:', error);
      console.error('❌ Detalhes do erro:', {
        code: error.code,
        message: error.message
      });
      return { success: false, error: error.message };
    }
  },

   // 👥 BUSCAR AMIGOS DO USUÁRIO
getUserFriends: async (userId = null) => {
  console.log('🚀 ENTRANDO NO getUserFriends - INÍCIO');
  
  try {
    const targetUserId = userId || auth.currentUser?.uid;
    if (!targetUserId) {
      console.log('❌ Usuário não especificado');
      return { success: false, error: 'Usuário não especificado' };
    }

    console.log('🔍 FriendsService - Buscando amigos de:', targetUserId);
    console.log('🔍 Firebase db disponível:', !!db);

    // 🔥 BUSCAR AMIZADES ONDE O USUÁRIO PARTICIPA
    console.log('📊 Executando query em friendships...');
    const friendshipsSnapshot = await db
      .collection('friendships')
      .where('status', '==', 'active')
      .get();

    console.log('📊 Resultado da query friendships:', {
      size: friendshipsSnapshot.size,
      empty: friendshipsSnapshot.empty
    });

    // Listar todas as amizades para debug
    friendshipsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log('🤝 Amizade encontrada:', {
        id: doc.id,
        user1Id: data.user1Id,
        user2Id: data.user2Id,
        status: data.status,
        isUser1: data.user1Id === targetUserId,
        isUser2: data.user2Id === targetUserId
      });
    });

    const friendIds = [];
    friendshipsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      // Se o usuário é user1Id, adicionar user2Id como amigo
      if (data.user1Id === targetUserId) {
        console.log('➕ Adicionando amigo (user2):', data.user2Id);
        friendIds.push(data.user2Id);
      }
      // Se o usuário é user2Id, adicionar user1Id como amigo  
      else if (data.user2Id === targetUserId) {
        console.log('➕ Adicionando amigo (user1):', data.user1Id);
        friendIds.push(data.user1Id);
      }
    });

    console.log('📊 IDs dos amigos encontrados:', friendIds);
    console.log('📊 Total de amigos:', friendIds.length);

    if (friendIds.length === 0) {
      console.log('📭 Nenhum amigo encontrado');
      return { success: true, friends: [] };
    }

    // Buscar dados dos amigos (máximo 10 por vez)
    console.log('👤 Buscando dados dos usuários amigos...');
    const friends = [];
    const chunks = [];
    for (let i = 0; i < friendIds.length; i += 10) {
      chunks.push(friendIds.slice(i, i + 10));
    }

    console.log('📦 Total de chunks para buscar:', chunks.length);

    for (const chunk of chunks) {
  try {
    console.log('🔍 Buscando chunk:', chunk);
    const usersSnapshot = await db
      .collection('users')
      .where('__name__', 'in', chunk)  // 🔥 CORREÇÃO AQUI
      .get();

    console.log('👥 Usuários encontrados no chunk:', usersSnapshot.size);

    usersSnapshot.docs.forEach(doc => {
      const userData = doc.data();
      console.log('👤 Dados do amigo:', {
        id: doc.id,
        displayName: userData.displayName,
        email: userData.email
      });

      friends.push({
        uid: doc.id,
        id: doc.id,
        ...userData
      });
    });
  } catch (chunkError) {
    console.error('❌ Erro ao buscar chunk de amigos:', chunkError);
  }
}

    console.log('✅ FriendsService - Total de amigos processados:', friends.length);
    console.log('👥 Lista final de amigos:', friends);
    
    return { success: true, friends };

  } catch (error) {
    console.error('❌ FriendsService - Erro ao buscar amigos:', error);
    console.error('❌ Detalhes do erro:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    return { success: false, error: error.message };
  }
},

  
  // 🔍 BUSCAR USUÁRIOS POR NOME/EMAIL
  searchUsers: async (query) => {
    try {
      if (!query || query.length < 2) {
        return { success: true, users: [] };
      }

      console.log('🔍 FriendsService - Buscando usuários:', query);

      // 🔥 VERIFICAR SE A COLLECTION 'users' EXISTE
      console.log('📊 Verificando collection users...');
      const testSnapshot = await db.collection('users').limit(1).get();
      console.log('📊 Collection users existe:', !testSnapshot.empty);
      console.log('📊 Total docs na collection users:', testSnapshot.size);

      // Buscar por displayName
      console.log('🔍 Buscando por displayName:', query);
      const displayNameQuery = db
        .collection('users')
        .where('displayName', '>=', query)
        .where('displayName', '<=', query + '\uf8ff')
        .limit(10);

      // Buscar por email (se contiver @)
      let emailQuery = null;
      if (query.includes('@')) {
        console.log('📧 Buscando por email:', query);
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

      console.log('📊 Resultado das queries:');
      snapshots.forEach((snapshot, index) => {
        console.log(`Query ${index + 1}: ${snapshot.size} resultados`);
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log(`📄 Doc encontrado:`, {
            id: doc.id,
            email: data.email,
            displayName: data.displayName
          });
        });
      });

      const userMap = new Map();
      snapshots.forEach(snapshot => {
        snapshot.docs.forEach(doc => {
          const userData = doc.data();
          if (doc.id !== auth.currentUser?.uid) {
            userMap.set(doc.id, {
              uid: doc.id,
              id: doc.id,
              ...userData
            });
          }
        });
      });

      const users = Array.from(userMap.values()).slice(0, 20);

      console.log('✅ FriendsService - Usuários encontrados:', users.length);
      console.log('👥 Lista de usuários:', users);
      return { success: true, users };

    } catch (error) {
      console.error('❌ FriendsService - Erro na busca:', error);
      return { success: false, error: error.message };
    }
  },
  
  // 🎯 OBTER SUGESTÕES DE AMIGOS (funcionalidade básica)
  // 🎯 OBTER SUGESTÕES DE AMIGOS (corrigida - sem this)
getSuggestedFriends: async () => {
  try {
    console.log('FriendsService - Buscando sugestões');

    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // 🔥 OBTER AMIGOS ATUAIS DIRETO DO FIRESTORE
    console.log('👥 Buscando amigos atuais...');
    const friendshipsSnapshot = await db
      .collection('friendships')
      .where('status', '==', 'active')
      .get();

    const currentFriendIds = [];
    friendshipsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      // Se o usuário é user1Id, adicionar user2Id como amigo
      if (data.user1Id === currentUserId) {
        currentFriendIds.push(data.user2Id);
      }
      // Se o usuário é user2Id, adicionar user1Id como amigo  
      else if (data.user2Id === currentUserId) {
        currentFriendIds.push(data.user1Id);
      }
    });
    
    console.log('👥 IDs dos amigos atuais:', currentFriendIds);

    // 🔥 OBTER SOLICITAÇÕES PENDENTES (enviadas e recebidas)
    console.log('📨 Obtendo solicitações pendentes...');
    const sentRequestsSnapshot = await db
      .collection('friendRequests')
      .where('fromUserId', '==', currentUserId)
      .where('status', '==', 'pending')
      .get();

    const receivedRequestsSnapshot = await db
      .collection('friendRequests')
      .where('toUserId', '==', currentUserId)
      .where('status', '==', 'pending')
      .get();

    const pendingUserIds = [];
    
    // Adicionar IDs das solicitações enviadas
    sentRequestsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      pendingUserIds.push(data.toUserId);
    });
    
    // Adicionar IDs das solicitações recebidas
    receivedRequestsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      pendingUserIds.push(data.fromUserId);
    });

    console.log('📨 IDs com solicitações pendentes:', pendingUserIds);

    // 🔥 COMBINAR LISTAS PARA EXCLUIR
    const excludeIds = [...currentFriendIds, ...pendingUserIds, currentUserId];
    console.log('🚫 IDs para excluir das sugestões:', excludeIds);

    // Buscar usuários que NÃO estão na lista de exclusão
    const usersSnapshot = await db
      .collection('users')
      .limit(50) // Buscar mais para ter opções após filtrar
      .get();

    const suggestions = [];
    usersSnapshot.docs.forEach(doc => {
      const userData = doc.data();
      
      // 🔥 FILTROS DE EXCLUSÃO
      if (!excludeIds.includes(doc.id) && 
          userData && 
          (userData.displayName || userData.email) &&
          userData.isPublic !== false) { // Só usuários públicos
        
        suggestions.push({
          uid: doc.id,
          id: doc.id,
          ...userData,
          mutualFriends: Math.floor(Math.random() * 3) // Simulado por enquanto
        });
      }
    });

    // Limitar a 10 sugestões e embaralhar
    const shuffledSuggestions = suggestions
      .sort(() => 0.5 - Math.random())
      .slice(0, 10);

    console.log('✅ FriendsService - Sugestões filtradas:', shuffledSuggestions.length);
    
    return { success: true, suggestions: shuffledSuggestions };

  } catch (error) {
    console.error('❌ FriendsService - Erro ao buscar sugestões:', error);
    return { success: false, error: error.message };
  }
},
  
// 🎬 BUSCAR FILMES DO AMIGO
getFriendMovies: async (friendId) => {
  try {
    console.log('🎬 Buscando filmes do amigo:', friendId);
    
    const snapshot = await db.collection('userMovies')
      .where('userId', '==', friendId)
      .orderBy('addedAt', 'desc')
      .get();
    
    const movies = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      movies.push({
        id: doc.id,
        ...data,
        addedAt: data.addedAt?.toDate() || new Date()
      });
    });
    
    console.log('✅ Filmes do amigo carregados:', movies.length);
    return { success: true, movies };
  } catch (error) {
    console.error('❌ Erro ao buscar filmes do amigo:', error);
    return { success: false, error: error.message };
  }
},

// 📊 CALCULAR ESTATÍSTICAS DO AMIGO
getFriendStats: (movies) => {
  const watched = movies.filter(m => m.status === 'watched').length;
  const favorites = movies.filter(m => m.isFavorite === true).length;
  const watchlist = movies.filter(m => m.status === 'watchlist').length;
  const ratings = movies.filter(m => m.userRating && m.userRating > 0).length;
  const reviews = movies.filter(m => m.userReview && m.userReview.trim()).length;
  
  return { watched, favorites, watchlist, ratings, reviews, total: movies.length };
},

  
  
}



export default friendsService;