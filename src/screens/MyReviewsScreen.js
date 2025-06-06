// src/screens/profile/MyReviewsScreen.js
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ReviewContext } from '../../contexts/ReviewContext';
import { AuthContext } from '../../contexts/AuthContext';

const MyReviewsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { getUserReviews, deleteReview } = useContext(ReviewContext);
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const userReviews = await getUserReviews(user.id);
      // Ordenar por data mais recente
      const sortedReviews = userReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setReviews(sortedReviews);
    } catch (error) {
      console.error('Erro ao carregar reviews:', error);
      Alert.alert('Erro', 'Não foi possível carregar suas resenhas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadReviews();
  };

  const handleMoviePress = (movie) => {
    navigation.navigate('MovieDetail', { movie });
  };

  const handleEditReview = (review) => {
    navigation.navigate('WriteReview', { 
      movie: review.movie, 
      existingReview: review 
    });
  };

  const handleDeleteReview = (reviewId, movieTitle) => {
    Alert.alert(
      'Excluir Resenha',
      `Tem certeza que deseja excluir sua resenha de "${movieTitle}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReview(reviewId);
              Alert.alert('Sucesso', 'Resenha excluída com sucesso!');
              loadReviews();
            } catch (error) {
              console.error('Erro ao excluir resenha:', error);
              Alert.alert('Erro', 'Não foi possível excluir a resenha');
            }
          }
        }
      ]
    );
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Icon key={i} name="star" size={16} color="#FFD700" />);
    }

    if (hasHalfStar) {
      stars.push(<Icon key="half" name="star-half" size={16} color="#FFD700" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Icon key={`empty-${i}`} name="star-border" size={16} color="#FFD700" />);
    }

    return stars;
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      {/* Header do filme */}
      <TouchableOpacity 
        onPress={() => handleMoviePress(item.movie)}
        style={styles.movieHeader}
      >
        <Image 
          source={{ uri: `https://image.tmdb.org/t/p/w92${item.movie.poster_path}` }}
          style={styles.moviePoster}
        />
        <View style={styles.movieInfo}>
          <Text style={styles.movieTitle} numberOfLines={2}>
            {item.movie.title}
          </Text>
          <Text style={styles.movieYear}>
            {new Date(item.movie.release_date).getFullYear()}
          </Text>
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {getRatingStars(item.rating)}
            </View>
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}/5</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Review content */}
      <View style={styles.reviewContent}>
        {item.title && (
          <Text style={styles.reviewTitle}>"{item.title}"</Text>
        )}
        <Text style={styles.reviewText}>
          {truncateText(item.content)}
        </Text>
        
        {item.content.length > 150 && (
          <TouchableOpacity
            onPress={() => navigation.navigate('ReviewDetail', { review: item })}
            style={styles.readMoreButton}
          >
            <Text style={styles.readMoreText}>Ler mais</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Metadata */}
      <View style={styles.reviewMeta}>
        <Text style={styles.reviewDate}>
          {new Date(item.createdAt).toLocaleDateString('pt-BR')} às {new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
        
        {item.likes > 0 && (
          <View style={styles.likesContainer}>
            <Icon name="thumb-up" size={14} color="#4CAF50" />
            <Text style={styles.likesText}>{item.likes}</Text>
          </View>
        )}
      </View>

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditReview(item)}
        >
          <Icon name="edit" size={18} color="#007AFF" />
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteReview(item.id, item.movie.title)}
        >
          <Icon name="delete" size={18} color="#F44336" />
          <Text style={styles.deleteButtonText}>Excluir</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => navigation.navigate('ReviewDetail', { review: item })}
        >
          <Icon name="visibility" size={18} color="#666" />
          <Text style={styles.shareButtonText}>Ver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="rate-review" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>Nenhuma resenha escrita</Text>
      <Text style={styles.emptySubtitle}>
        Comece a escrever resenhas dos filmes que você assistiu!
      </Text>
      <TouchableOpacity 
        style={styles.exploreButton}
        onPress={() => navigation.navigate('MovieSearch')}
      >
        <Icon name="search" size={20} color="#fff" />
        <Text style={styles.exploreButtonText}>Explorar Filmes</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => {
    if (reviews.length === 0) return null;

    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    const totalLikes = reviews.reduce((sum, review) => sum + (review.likes || 0), 0);

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{reviews.length}</Text>
          <Text style={styles.statLabel}>Resenhas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#FFD700' }]}>
            {averageRating.toFixed(1)}
          </Text>
          <Text style={styles.statLabel}>Nota Média</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
            {totalLikes}
          </Text>
          <Text style={styles.statLabel}>Curtidas</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Carregando suas resenhas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas Resenhas</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('MovieSearch')}
        >
          <Icon name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  addButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  movieHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  moviePoster: {
    width: 60,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  movieInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    lineHeight: 20,
  },
  movieYear: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  reviewContent: {
    marginBottom: 12,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  readMoreButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  reviewMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    flex: 1,
    marginRight: 4,
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    flex: 1,
    marginLeft: 4,
    justifyContent: 'center',
  },
  shareButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  exploreButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
});

export default MyReviewsScreen;