import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFriends } from '../contexts/FriendsContext';
import { useAuth } from '../contexts/AuthContext';
import activityService from '../services/activityService';
import friendsService from '../services/friendsService';

const ExploreScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { friends } = useFriends();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeed();
  }, [friends]);

  const loadFeed = async () => {
    if (!user || friends.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const friendIds = friends.map(friend => friend.uid);
      console.log('📱 Carregando feed para amigos:', friendIds);
      
      const feedActivities = await activityService.getFriendsActivities(friendIds);
      setActivities(feedActivities);
      
      console.log('📱 Atividades carregadas:', feedActivities.length);
    } catch (error) {
      console.error('❌ Erro ao carregar feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Recente';
    
    const now = new Date();
    const activityDate = date.toDate ? date.toDate() : new Date(date);
    const diffInHours = Math.floor((now - activityDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora há pouco';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInHours < 48) return 'Ontem';
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} dias atrás`;
    
    return activityDate.toLocaleDateString('pt-BR');
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'movie_rated': return { icon: 'star', color: '#FFD700' };
      case 'movie_reviewed': return { icon: 'edit-3', color: '#BD0DC0' };
      case 'movie_added': return { icon: 'plus', color: '#10B981' };
      case 'friend_added': return { icon: 'user-plus', color: '#3B82F6' };
      default: return { icon: 'activity', color: '#9CA3AF' };
    }
  };

  const getActivityText = (activity) => {
    const { type, userData, movieData, rating, review } = activity;
    const userName = userData?.displayName || 'Alguém';
    
    switch (type) {
      case 'movie_rated':
        return `${userName} avaliou "${movieData?.title}" com ${rating} estrelas`;
      case 'movie_reviewed':
        return `${userName} escreveu uma resenha sobre "${movieData?.title}"`;
      case 'movie_added':
        return `${userName} adicionou "${movieData?.title}" à sua lista`;
      case 'friend_added':
        return `${userName} fez uma nova amizade`;
      default:
        return `${userName} teve uma atividade`;
    }
  };

  const getDefaultAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=BD0DC0&color=fff`;
  };

  const renderActivityItem = ({ item }) => {
    const activityIcon = getActivityIcon(item.type);
    const activityText = getActivityText(item);

    return (
      <View style={styles.activityCard}>
        {/* Header da atividade */}
        <View style={styles.activityHeader}>
          <Image
            source={{ 
              uri: item.userData?.photoURL || getDefaultAvatar(item.userData?.displayName)
            }}
            style={styles.userAvatar}
          />
          <View style={styles.activityInfo}>
            <Text style={styles.activityText}>{activityText}</Text>
            <Text style={styles.activityTime}>{formatTimeAgo(item.createdAt)}</Text>
          </View>
          <View style={[styles.activityIcon, { backgroundColor: activityIcon.color }]}>
            <Feather name={activityIcon.icon} size={16} color="#FFFFFF" />
          </View>
        </View>

        {/* Conteúdo da atividade */}
        {item.movieData && (
          <TouchableOpacity
            style={styles.movieContent}
            onPress={() => navigation.navigate('Detalhes', { 
              movieId: item.movieId,
              friendOpinion: {
                friendName: item.userData?.displayName || 'Amigo',
                rating: item.rating,
                review: item.review,
                status: 'watched',
                isFavorite: false,
                addedAt: item.createdAt
              }
            })}
          >
            <Image
              source={{
                uri: item.movieData.posterPath
                  ? `https://image.tmdb.org/t/p/w200${item.movieData.posterPath}`
                  : 'https://via.placeholder.com/60x90?text=No+Image'
              }}
              style={styles.moviePoster}
            />
            <View style={styles.movieInfo}>
              <Text style={styles.movieTitle}>{item.movieData.title}</Text>
              <Text style={styles.movieYear}>
                {item.movieData.releaseDate ? item.movieData.releaseDate.substring(0, 4) : 'N/A'}
              </Text>
              
              {/* Avaliação */}
              {item.rating && (
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Feather
                      key={star}
                      name="star"
                      size={14}
                      color={star <= item.rating ? '#FFD700' : '#3A3A3D'}
                    />
                  ))}
                  <Text style={styles.ratingText}>{item.rating}/5</Text>
                </View>
              )}
              
              {/* Resenha (prévia) */}
              {item.review && (
                <Text style={styles.reviewPreview} numberOfLines={2}>
                  "{item.review}"
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* Ações */}
        <View style={styles.activityActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="heart" size={16} color="#9CA3AF" />
            <Text style={styles.actionText}>Curtir</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="message-circle" size={16} color="#9CA3AF" />
            <Text style={styles.actionText}>Comentar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="share-2" size={16} color="#9CA3AF" />
            <Text style={styles.actionText}>Compartilhar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const EmptyFeed = () => (
    <View style={styles.emptyContainer}>
      <Feather name="users" size={64} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>
        {friends.length === 0 ? 'Nenhum amigo ainda' : 'Feed vazio'}
      </Text>
      <Text style={styles.emptyText}>
        {friends.length === 0 
          ? 'Adicione amigos para ver suas atividades aqui!'
          : 'Suas atividades dos amigos aparecerão aqui'
        }
      </Text>
      {friends.length === 0 && (
        <TouchableOpacity 
          style={styles.addFriendsButton}
          onPress={() => navigation.navigate('FriendsTab')}
        >
          <Feather name="user-plus" size={20} color="#FFFFFF" />
          <Text style={styles.addFriendsText}>Encontrar Amigos</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feed de Amigos</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Feather name="refresh-cw" size={24} color="#BD0DC0" />
        </TouchableOpacity>
      </View>

      {/* Estatísticas rápidas */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{friends.length}</Text>
          <Text style={styles.statLabel}>Amigos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{activities.length}</Text>
          <Text style={styles.statLabel}>Atividades</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {activities.filter(a => a.type === 'movie_rated').length}
          </Text>
          <Text style={styles.statLabel}>Avaliações</Text>
        </View>
      </View>

      {/* Feed */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#BD0DC0" />
          <Text style={styles.loadingText}>Carregando feed...</Text>
        </View>
      ) : (
        <FlatList
          data={activities}
          renderItem={renderActivityItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={activities.length === 0 ? styles.emptyListContainer : styles.feedContainer}
          ListEmptyComponent={EmptyFeed}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#BD0DC0"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#27272A',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 16,
  },
  feedContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyListContainer: {
    flex: 1,
  },
  activityCard: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  movieContent: {
    flexDirection: 'row',
    backgroundColor: '#18181B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  moviePoster: {
    width: 60,
    height: 90,
    borderRadius: 6,
    marginRight: 12,
  },
  movieInfo: {
    flex: 1,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  movieYear: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  reviewPreview: {
    fontSize: 12,
    color: '#D1D5DB',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  activityActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#3A3A3D',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  addFriendsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#BD0DC0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFriendsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ExploreScreen;

// import React from 'react';
// import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

// const ExploreScreen = () => {
//     return (
//         <SafeAreaView style={styles.container}>
//             <StatusBar barStyle="light-content" />
//             <View style={styles.content}>
//                 <Text style={styles.title}>Explorar</Text>
//                 <Text style={styles.description}>Tela em desenvolvimento</Text>
//             </View>
//         </SafeAreaView>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#18181B',
//     },
//     content: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 20,
//     },
//     title: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         color: '#FFFFFF',
//         marginBottom: 16,
//     },
//     description: {
//         fontSize: 16,
//         color: '#9CA3AF',
//         textAlign: 'center',
//     },
// });

// export default ExploreScreen;