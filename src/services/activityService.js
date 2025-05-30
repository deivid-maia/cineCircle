import { db, auth } from './firebase';

const activityService = {
  // Registrar atividade de filme
  recordMovieActivity: async (type, movieData, options = {}) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Obter dados do usuário para a atividade
      const userDoc = await db.collection('users').doc(currentUser.uid).get();
      const userData = userDoc.data();

      const activity = {
        userId: currentUser.uid,
        type, // 'movie_rated', 'movie_added', 'movie_reviewed'
        movieId: movieData.id,
        movieData: {
          title: movieData.title,
          posterPath: movieData.poster_path,
          releaseDate: movieData.release_date
        },
        rating: options.rating || null,
        review: options.review || '',
        isPublic: options.isPublic !== false, // Público por padrão
        createdAt: new Date(),
        userData: {
          displayName: userData?.displayName || currentUser.displayName || 'Usuário',
          photoURL: userData?.photoURL || currentUser.photoURL || null
        }
      };

      await db.collection('user_activities').add(activity);
      console.log(`📱 Atividade registrada: ${type} - ${movieData.title}`);

    } catch (error) {
      console.error('❌ Erro ao registrar atividade:', error);
    }
  },

  // Registrar atividade de nova amizade
  recordFriendActivity: async (newFriendData) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userDoc = await db.collection('users').doc(currentUser.uid).get();
      const userData = userDoc.data();

      const activity = {
        userId: currentUser.uid,
        type: 'friend_added',
        isPublic: true,
        createdAt: new Date(),
        friendData: newFriendData,
        userData: {
          displayName: userData?.displayName || currentUser.displayName || 'Usuário',
          photoURL: userData?.photoURL || currentUser.photoURL || null
        }
      };

      await db.collection('user_activities').add(activity);
      console.log('📱 Atividade de amizade registrada');

    } catch (error) {
      console.error('❌ Erro ao registrar atividade de amizade:', error);
    }
  },

  // Obter atividades dos amigos para o feed
  getFriendsActivities: async (friendIds, limit = 50) => {
    try {
      if (!friendIds || friendIds.length === 0) return [];

      // Firestore limita 'in' a 10 itens, então vamos processar em lotes
      const activityPromises = [];
      const batchSize = 10;
      
      for (let i = 0; i < friendIds.length; i += batchSize) {
        const batch = friendIds.slice(i, i + batchSize);
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const query = db.collection('user_activities')
          .where('userId', 'in', batch)
          .where('isPublic', '==', true)
          .where('createdAt', '>=', thirtyDaysAgo)
          .orderBy('createdAt', 'desc')
          .limit(Math.ceil(limit / Math.ceil(friendIds.length / batchSize)));
          
        activityPromises.push(query.get());
      }

      const snapshots = await Promise.all(activityPromises);
      
      let activities = [];
      snapshots.forEach(snapshot => {
        snapshot.forEach(doc => {
          activities.push({ id: doc.id, ...doc.data() });
        });
      });

      // Ordenar por data e limitar
      activities = activities
        .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
        .slice(0, limit);

      console.log(`📱 ${activities.length} atividades de amigos carregadas`);
      return activities;

    } catch (error) {
      console.error('❌ Erro ao carregar atividades dos amigos:', error);
      return [];
    }
  },

  // Limpar atividades antigas (executar periodicamente)
  cleanOldActivities: async (daysToKeep = 90) => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const oldActivities = await db.collection('user_activities')
        .where('createdAt', '<', cutoffDate)
        .get();

      const batch = db.batch();
      oldActivities.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      if (oldActivities.docs.length > 0) {
        await batch.commit();
        console.log(`🧹 ${oldActivities.docs.length} atividades antigas removidas`);
      }

    } catch (error) {
      console.error('❌ Erro ao limpar atividades antigas:', error);
    }
  }
};

export default activityService;