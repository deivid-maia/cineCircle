import { auth, db } from './firebase';

class RecommendationService {
  
  // 📨 ENVIAR RECOMENDAÇÃO PARA AMIGO
  async sendRecommendation(friendId, movieData, message = '', isPrivate = false) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      console.log('📨 Enviando recomendação:', movieData.title, 'para:', friendId);

      // Verificar se são amigos
      const friendshipQuery = await db.collection('friendships')
        .where('users', 'array-contains', currentUser.uid)
        .get();

      const isFriend = friendshipQuery.docs.some(doc => {
        const data = doc.data();
        return data.users.includes(friendId) && data.status === 'accepted';
      });

      if (!isFriend) {
        return { success: false, error: 'Você só pode recomendar filmes para amigos' };
      }

      // Buscar dados do remetente
      const senderDoc = await db.collection('users').doc(currentUser.uid).get();
      const senderData = senderDoc.exists ? senderDoc.data() : {};

      // Criar recomendação
      const recommendationData = {
        // IDs e relacionamentos
        fromUserId: currentUser.uid,
        toUserId: friendId,
        movieId: movieData.id,
        
        // Dados do remetente
        fromUser: {
          uid: currentUser.uid,
          displayName: senderData.displayName || currentUser.displayName || 'Usuário',
          photoURL: senderData.photoURL || currentUser.photoURL || null,
          email: currentUser.email
        },
        
        // Dados do filme
        movie: {
          id: movieData.id,
          title: movieData.title,
          posterPath: movieData.poster_path,
          overview: movieData.overview,
          releaseDate: movieData.release_date,
          voteAverage: movieData.vote_average,
          genres: movieData.genres || []
        },
        
        // Conteúdo da recomendação
        message: message.trim(),
        isPrivate,
        
        // Status e timestamps
        status: 'pending', // pending, viewed, accepted, declined
        createdAt: new Date(),
        viewedAt: null,
        respondedAt: null,
        
        // Metadados
        type: 'movie_recommendation',
        notificationSent: false
      };

      const docRef = await db.collection('recommendations').add(recommendationData);

      console.log('✅ Recomendação enviada com ID:', docRef.id);

      // Criar notificação para o destinatário
      await this.createNotification(friendId, {
        type: 'recommendation_received',
        fromUserId: currentUser.uid,
        fromUserName: recommendationData.fromUser.displayName,
        movieTitle: movieData.title,
        recommendationId: docRef.id,
        message: message
      });

      return { 
        success: true, 
        recommendationId: docRef.id,
        message: 'Recomendação enviada com sucesso!' 
      };

    } catch (error) {
      console.error('❌ Erro ao enviar recomendação:', error);
      return { success: false, error: error.message };
    }
  }

  // 📬 BUSCAR RECOMENDAÇÕES RECEBIDAS
  async getReceivedRecommendations(limit = 20) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      console.log('📬 Buscando recomendações recebidas...');

      const snapshot = await db.collection('recommendations')
        .where('toUserId', '==', currentUser.uid)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const recommendations = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        recommendations.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          viewedAt: data.viewedAt?.toDate() || null,
          respondedAt: data.respondedAt?.toDate() || null
        });
      });

      console.log('✅ Recomendações recebidas:', recommendations.length);
      return { success: true, recommendations };

    } catch (error) {
      console.error('❌ Erro ao buscar recomendações recebidas:', error);
      return { success: false, error: error.message, recommendations: [] };
    }
  }

  // 📤 BUSCAR RECOMENDAÇÕES ENVIADAS
  async getSentRecommendations(limit = 20) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      console.log('📤 Buscando recomendações enviadas...');

      const snapshot = await db.collection('recommendations')
        .where('fromUserId', '==', currentUser.uid)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const recommendations = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Buscar dados do destinatário (pode estar desatualizado)
        recommendations.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          viewedAt: data.viewedAt?.toDate() || null,
          respondedAt: data.respondedAt?.toDate() || null
        });
      });

      // Enriquecer com dados atuais dos destinatários
      const enrichedRecommendations = await Promise.all(
        recommendations.map(async (rec) => {
          try {
            const userDoc = await db.collection('users').doc(rec.toUserId).get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              return {
                ...rec,
                toUser: {
                  uid: rec.toUserId,
                  displayName: userData.displayName || 'Usuário',
                  photoURL: userData.photoURL || null
                }
              };
            }
          } catch (error) {
            console.log('⚠️ Erro ao buscar dados do destinatário:', rec.toUserId);
          }
          return rec;
        })
      );

      console.log('✅ Recomendações enviadas:', enrichedRecommendations.length);
      return { success: true, recommendations: enrichedRecommendations };

    } catch (error) {
      console.error('❌ Erro ao buscar recomendações enviadas:', error);
      return { success: false, error: error.message, recommendations: [] };
    }
  }

  // 👁️ MARCAR RECOMENDAÇÃO COMO VISTA
  async markAsViewed(recommendationId) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      const docRef = db.collection('recommendations').doc(recommendationId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return { success: false, error: 'Recomendação não encontrada' };
      }

      const data = doc.data();
      if (data.toUserId !== currentUser.uid) {
        return { success: false, error: 'Sem permissão para esta ação' };
      }

      // Atualizar apenas se ainda não foi vista
      if (data.status === 'pending') {
        await docRef.update({
          status: 'viewed',
          viewedAt: new Date()
        });

        console.log('✅ Recomendação marcada como vista');
      }

      return { success: true };

    } catch (error) {
      console.error('❌ Erro ao marcar como vista:', error);
      return { success: false, error: error.message };
    }
  }

  // ✅ RESPONDER À RECOMENDAÇÃO (aceitar/recusar)
  async respondToRecommendation(recommendationId, response, responseMessage = '') {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      console.log('✅ Respondendo à recomendação:', recommendationId, response);

      const docRef = db.collection('recommendations').doc(recommendationId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return { success: false, error: 'Recomendação não encontrada' };
      }

      const data = doc.data();
      if (data.toUserId !== currentUser.uid) {
        return { success: false, error: 'Sem permissão para esta ação' };
      }

      // Validar resposta
      if (!['accepted', 'declined'].includes(response)) {
        return { success: false, error: 'Resposta inválida' };
      }

      // Atualizar recomendação
      await docRef.update({
        status: response,
        responseMessage: responseMessage.trim(),
        respondedAt: new Date(),
        viewedAt: data.viewedAt || new Date() // Marcar como vista se ainda não foi
      });

      // Notificar remetente sobre a resposta
      await this.createNotification(data.fromUserId, {
        type: 'recommendation_response',
        fromUserId: currentUser.uid,
        fromUserName: currentUser.displayName || 'Usuário',
        movieTitle: data.movie.title,
        response: response,
        responseMessage: responseMessage,
        recommendationId: recommendationId
      });

      console.log('✅ Resposta registrada:', response);
      return { success: true };

    } catch (error) {
      console.error('❌ Erro ao responder recomendação:', error);
      return { success: false, error: error.message };
    }
  }

  // 🗑️ DELETAR RECOMENDAÇÃO
  async deleteRecommendation(recommendationId) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      const docRef = db.collection('recommendations').doc(recommendationId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return { success: false, error: 'Recomendação não encontrada' };
      }

      const data = doc.data();
      
      // Só pode deletar se for o remetente OU destinatário
      if (data.fromUserId !== currentUser.uid && data.toUserId !== currentUser.uid) {
        return { success: false, error: 'Sem permissão para deletar esta recomendação' };
      }

      await docRef.delete();
      console.log('✅ Recomendação deletada');

      return { success: true };

    } catch (error) {
      console.error('❌ Erro ao deletar recomendação:', error);
      return { success: false, error: error.message };
    }
  }

  // 🔔 CRIAR NOTIFICAÇÃO
  async createNotification(userId, notificationData) {
    try {
      const notification = {
        userId: userId,
        ...notificationData,
        read: false,
        createdAt: new Date()
      };

      await db.collection('notifications').add(notification);
      console.log('🔔 Notificação criada para:', userId);

    } catch (error) {
      console.error('❌ Erro ao criar notificação:', error);
    }
  }

  // 📊 ESTATÍSTICAS DE RECOMENDAÇÕES
  async getRecommendationStats() {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      // Buscar todas as recomendações (enviadas e recebidas)
      const [sentSnapshot, receivedSnapshot] = await Promise.all([
        db.collection('recommendations')
          .where('fromUserId', '==', currentUser.uid)
          .get(),
        db.collection('recommendations')
          .where('toUserId', '==', currentUser.uid)
          .get()
      ]);

      // Calcular estatísticas
      let sentTotal = 0;
      let sentAccepted = 0;
      let sentPending = 0;

      sentSnapshot.forEach(doc => {
        const data = doc.data();
        sentTotal++;
        if (data.status === 'accepted') sentAccepted++;
        if (data.status === 'pending') sentPending++;
      });

      let receivedTotal = 0;
      let receivedAccepted = 0;
      let receivedPending = 0;

      receivedSnapshot.forEach(doc => {
        const data = doc.data();
        receivedTotal++;
        if (data.status === 'accepted') receivedAccepted++;
        if (data.status === 'pending') receivedPending++;
      });

      const stats = {
        sent: {
          total: sentTotal,
          accepted: sentAccepted,
          pending: sentPending,
          declined: sentTotal - sentAccepted - sentPending,
          acceptanceRate: sentTotal > 0 ? Math.round((sentAccepted / sentTotal) * 100) : 0
        },
        received: {
          total: receivedTotal,
          accepted: receivedAccepted,
          pending: receivedPending,
          declined: receivedTotal - receivedAccepted - receivedPending,
          responseRate: receivedTotal > 0 ? Math.round(((receivedAccepted + (receivedTotal - receivedAccepted - receivedPending)) / receivedTotal) * 100) : 0
        }
      };

      return { success: true, stats };

    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
      return { success: false, error: error.message };
    }
  }

  // 🎬 BUSCAR RECOMENDAÇÕES POR FILME
  async getRecommendationsByMovie(movieId) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      const snapshot = await db.collection('recommendations')
        .where('movieId', '==', movieId)
        .where('toUserId', '==', currentUser.uid)
        .orderBy('createdAt', 'desc')
        .get();

      const recommendations = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        recommendations.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });

      return { success: true, recommendations };

    } catch (error) {
      console.error('❌ Erro ao buscar recomendações do filme:', error);
      return { success: false, error: error.message, recommendations: [] };
    }
  }
}

export default new RecommendationService();