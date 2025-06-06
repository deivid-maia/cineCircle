// src/screens/profile/MyRatingsScreen.js
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
import { RatingContext } from '../../contexts/RatingContext';
import { AuthContext } from '../../contexts/AuthContext';

const MyRatingsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { getUserRatings, deleteRating, updateRating } = useContext(RatingContext);
  
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, 1, 2, 3, 4, 5
  const [sortBy, setSortBy] = useState('recent'); // recent, rating_high, rating_low, title

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    try {
      const userRatings = await getUserRatings(user.id);
      setRatings(userRatings);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
      Alert.alert('Erro', 'Não foi possível carregar suas avaliações');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadRatings();
  };

  const handleMoviePress = (movie) => {
    navigation.navigate('MovieDetail', { movie });
  };

  const handleRatingPress = (currentRating, movieId, movieTitle) => {
    Alert.alert(
      'Alterar Avaliação',
      `Filme: ${movieTitle}\nAvaliação atual: ${currentRating}/5`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: '⭐ 1', onPress: () => updateMovieRating(movieId, 1) },
        { text: '⭐⭐ 2', onPress: () => updateMovieRating(movieId, 2) },
        { text: '⭐⭐⭐ 3', onPress: () => updateMovieRating(movieId, 3) },
        { text: '⭐⭐⭐⭐ 4', onPress: () => updateMovieRating(movieId, 4) },
        { text: '⭐⭐⭐⭐⭐ 5', onPress: () => updateMovieRating(movieId, 5) },
        { text: '🗑️ Remover', style: 'destructive', onPress: () => removeRating(movieId, movieTitle) },
      ]
    );
  };

  const updateMovieRating = async (movieId, newRating) => {
    try {
      await updateRating(movieId, newRating);
      Alert.alert('Sucesso', `Avaliação atualizada para ${newRating}/5!`);
      loadRatings();
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a avaliação');
    }
  };

  const removeRating = (movieId, movieTitle) => {
    Alert.alert(
      'Remover Avaliação',
      `Tem certeza que deseja remover sua avaliação de "${movieTitle}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRating(movieId);
              Alert.alert('Sucesso', 'Avaliação removida com sucesso!');
              loadRatings();
            } catch (error) {
              console.error('Erro ao remover avaliação:', error);
              Alert.alert('Erro', 'Não foi possível remover a avaliação');
            }
          }
        }
      ]
    );
  };

  const getRatingStars = (rating, size = 16) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon 
          key={i} 
          name={i <= rating ? "star" : "star-border"} 
          size={size} 
          color="#FFD700" 
        />
      );
    }
    return stars;
  };

  const getFilteredAndSortedRatings = () => {
    let filtered = ratings;

    // Aplicar filtro
    if (filter !== 'all') {
      filtered = ratings.filter(rating => rating.rating === parseInt(filter));
    }

    // Aplicar ordenação
    switch (sortBy) {
      case 'rating_high':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating_low':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case 'title':
        filtered.sort((a, b) => a.movie.title.localeCompare(b.movie.title));
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return filtered;
  };

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Filtrar por nota:</Text>
        <View style={styles.filterButtons}>
          {['all', '5', '4', '3', '2', '1'].map((filterValue) => (
            <TouchableOpacity
              key={filterValue}
              style={[
                styles.filterButton,
                filter === filterValue && styles.filterButtonActive
              ]}
              onPress={() => setFilter(filterValue)}
            >
              <Text style={[
                styles.filterButtonText,
                filter === filterValue && styles.filterButtonTextActive
              ]}>
                {filterValue === 'all' ? 'Todas' : `${filterValue}⭐`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Ordenar por:</Text>
        <View style={styles.filterButtons}>
          {[
            { key: 'recent', label: 'Recente' },
            { key: 'rating_high', label: 'Maior nota' },
            { key: 'rating_low', label: 'Menor nota' },
            { key: 'title', label: 'Título' }
          ].map((sortOption) => (
            <TouchableOpacity
              key={sortOption.key}
              style={[
                styles.sortButton,
                sortBy === sortOption.key && styles.sortButtonActive
              ]}
              onPress={() => setSortBy(sortOption.key)}
            >
              <Text style={[
                styles.sortButtonText,
                sortBy === sortOption.key && styles.sortButtonTextActive
              ]}>
                {sortOption.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderRating = ({ item }) => (
    <TouchableOpacity 
      style={styles.ratingCard}
      onPress={() => handleMoviePress(item.movie)}
    >
      <View style={styles.movieContent}>
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
          
          <TouchableOpacity 
            style={styles.ratingContainer}
            onPress={() => handleRatingPress(item.rating, item.movieId, item.movie.title)}
          >
            <View style={styles.starsContainer}>
              {getRatingStars(item.rating, 18)}
            </View>
            <Text style={styles.ratingText}>{item.rating}/5</Text>
            <Icon name="edit" size={16} color="#666" style={styles.editIcon} />
          </TouchableOpacity>
          
          <Text style={styles.ratingDate}>
            Avaliado em {new Date(item.createdAt).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </View>

      {/* Genres */}
      {item.movie.genres && (
        <View style={styles.genresContainer}>
          {item.movie.genres.slice(0, 3).map((genre) => (
            <View key={genre.id} style={styles.genreTag}>
              <Text style={styles.genreText}>{genre.name}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="star-border" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>
        {filter === 'all' ? 'Nenhuma avaliação feita' : `Nenhum filme com ${filter} estrela${filter > 1 ? 's' : ''}`}
      </Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'all' 
          ? 'Comece a avaliar os filmes que você assistiu!'
          : `Você ainda não avaliou nenhum filme com ${filter} estrela${filter > 1 ? 's' : ''}.`
        }
      </Text>
      {filter === 'all' && (
        <TouchableOpacity 
          style={styles.exploreButton}
          onPress={() => navigation.navigate('MovieSearch')}
        >
          <Icon name="search" size={20} color="#fff" />
          <Text style={styles.exploreButtonText}>Explorar Filmes</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderHeader = () => {
    const filteredRatings = getFilteredAndSortedRatings();
    
    if (ratings.length === 0) return null;

    const averageRating = ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length;
    const ratingDistribution = [1, 2, 3, 4, 5].map(star => 
      ratings.filter(rating => rating.rating === star).length
    );

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{ratings.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#FFD700' }]}>
            {averageRating.toFixed(1)}
          </Text>
          <Text style={styles.statLabel}>Média</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
            {ratingDistribution[4]}
          </Text>
          <Text style={styles.statLabel}>5 ⭐</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#FF5722' }]}>
            {ratingDistribution[0]}
          </Text>
          <Text style={styles.statLabel}>1 ⭐</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Carregando suas avaliações...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filteredData = getFilteredAndSortedRatings();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas Avaliações</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('MovieSearch')}
        >
          <Icon name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderRating}
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
        ListHeaderComponent={() => (
          <>
            {renderHeader()}
            {renderFilterButtons()}
          </>
        )}
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
  filterContainer: {
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
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  sortButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  sortButtonActive: {
    backgroundColor: '#4CAF50',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  ratingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  movieContent: {
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
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    marginRight: 4,
  },
  editIcon: {
    marginLeft: 4,
  },
  ratingDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  genreTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genreText: {
    fontSize: 11,
    color: '#1976D2',
    fontWeight: '500',
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
    textAlign: 'center',
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

export default MyRatingsScreen;