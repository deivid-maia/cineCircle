import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getMovieDetails } from '../services/api';
import { useMovies } from '../contexts/useMovies';

const { width } = Dimensions.get('window');

const MovieDetailScreen = ({ route, navigation }) => {
  const { movieId } = route.params;
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  // Hook do contexto
  const { 
    addMovieToList, 
    toggleFavorite, 
    removeMovie,
    isMovieInList, 
    isFavorite, 
    getUserMovie 
  } = useMovies();

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const details = await getMovieDetails(movieId);
        setMovie(details);
      } catch (error) {
        console.error('Erro ao buscar detalhes do filme:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId]);

  // Toggle Watchlist (adiciona/remove)
  const handleWatchlistToggle = async () => {
    if (!movie || actionLoading) return;
    
    try {
      setActionLoading(true);
      
      const isCurrentlyInWatchlist = isMovieInList(movie.id, 'watchlist');
      
      if (isCurrentlyInWatchlist) {
        await removeMovie(movie.id);
      } else {
        await addMovieToList(movie, 'watchlist');
      }
      
    } catch (error) {
      console.error('Erro ao alterar watchlist:', error);
      Alert.alert('Erro', 'Não foi possível alterar a lista. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Watched (adiciona/remove)
  const handleWatchedToggle = async () => {
    if (!movie || actionLoading) return;
    
    try {
      setActionLoading(true);
      
      const isCurrentlyWatched = isMovieInList(movie.id, 'watched');
      
      if (isCurrentlyWatched) {
        await removeMovie(movie.id);
      } else {
        await addMovieToList(movie, 'watched');
      }
      
    } catch (error) {
      console.error('Erro ao alterar status assistido:', error);
      Alert.alert('Erro', 'Não foi possível alterar o status. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Favorito
  const handleFavoriteToggle = async () => {
    if (!movie || actionLoading) return;
    
    try {
      setActionLoading(true);
      await toggleFavorite(movie);
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
      Alert.alert('Erro', 'Não foi possível alterar favorito. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  // Função para avaliar filme - abre modal de avaliação
  const handleEvaluateMovie = () => {
    if (hasUserRating) {
      // Se já tem avaliação, carrega os dados existentes
      setRating(userMovie.userRating || 0);
      setReview(userMovie.userReview || '');
    } else {
      // Nova avaliação
      setRating(0);
      setReview('');
    }
    setModalVisible(true);
  };

  // Salvar avaliação
  const handleSaveReview = async () => {
    if (rating === 0) {
      Alert.alert('Avaliação obrigatória', 'Por favor, avalie o filme com estrelas.');
      return;
    }

    try {
      setActionLoading(true);
      await addMovieToList(movie, 'watched', { rating, review });
      setModalVisible(false);
      Alert.alert('Sucesso!', 'Filme avaliado com sucesso!');
    } catch (error) {
      console.error('Erro ao avaliar filme:', error);
      Alert.alert('Erro', 'Não foi possível salvar a avaliação. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  // Renderizar estrelas para avaliação
  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Feather
              name="star"
              size={32}
              color={rating >= star ? "#FFD700" : "#3A3A3D"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#BD0DC0" />
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={50} color="#BD0DC0" />
        <Text style={styles.errorText}>Não foi possível carregar o filme</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Renderizar estrelas e rating do TMDb
  const renderStarsAndRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating / 2);
    const halfStar = rating % 2 >= 1;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Feather key={i} name="star" size={16} color="#FFD700" style={styles.starIcon} />);
      } else if (i === fullStars && halfStar) {
        stars.push(<Feather key={i} name="star" size={16} color="#FFD700" style={[styles.starIcon, { opacity: 0.5 }]} />);
      } else {
        stars.push(<Feather key={i} name="star" size={16} color="#FFD700" style={[styles.starIcon, { opacity: 0.2 }]} />);
      }
    }
    
    return (
      <View style={styles.ratingContainer}>
        {stars}
        <Text style={styles.ratingText}>
          {rating ? `${rating.toFixed(1)}/10` : 'N/A'}
        </Text>
        <Text style={styles.tmdbText}>TMDb</Text>
      </View>
    );
  };

  // Verificar status atual
  const isInWatchlist = isMovieInList(movie.id, 'watchlist');
  const isWatched = isMovieInList(movie.id, 'watched');
  const movieIsFavorite = isFavorite(movie.id);
  
  // Verificar se usuário já avaliou o filme
  const userMovie = getUserMovie(movie.id);
  const hasUserRating = userMovie && userMovie.userRating && userMovie.userRating > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView>
        {/* Imagem de Fundo do Filme */}
        <View style={styles.backdropContainer}>
          <Image
            source={{
              uri: movie.backdrop_path
                ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`
                : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            }}
            style={styles.backdropImage}
            resizeMode="cover"
          />
          <View style={styles.backdropGradient} />
          
          {/* Botão Voltar */}
          <TouchableOpacity 
            style={styles.backButtonFloating}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Informações do Filme */}
        <View style={styles.movieInfoContainer}>
          <View style={styles.posterAndInfo}>
            <Image
              source={{
                uri: movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : 'https://via.placeholder.com/150x225?text=No+Image'
              }}
              style={styles.posterImage}
              resizeMode="cover"
            />
            
            <View style={styles.infoContainer}>
              <Text style={styles.title}>{movie.title}</Text>
              
              <View style={styles.detailsRow}>
                <Text style={styles.year}>
                  {movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}
                </Text>
                <Text style={styles.runtime}>
                  {movie.runtime ? `${movie.runtime} min` : 'N/A'}
                </Text>
              </View>
              
              {/* Rating TMDb */}
              {renderStarsAndRating(movie.vote_average)}
              
              <View style={styles.genresContainer}>
                {movie.genres && movie.genres.map(genre => (
                  <View key={genre.id} style={styles.genreTag}>
                    <Text style={styles.genreText}>{genre.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          
          {/* Sinopse */}
          <View style={styles.overviewContainer}>
            <Text style={styles.overviewTitle}>Sinopse</Text>
            <Text style={styles.overviewText}>
              {movie.overview || 'Sinopse não disponível para este filme.'}
            </Text>
          </View>
          
          {/* Produção */}
          {movie.production_companies && movie.production_companies.length > 0 && (
            <View style={styles.productionContainer}>
              <Text style={styles.productionTitle}>Produção</Text>
              <View style={styles.companiesContainer}>
                {movie.production_companies.slice(0, 3).map(company => (
                  <Text key={company.id} style={styles.companyText}>
                    {company.name}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Sua Avaliação (só aparece se já avaliou) */}
          {hasUserRating && (
            <View style={styles.userRatingContainer}>
              <Text style={styles.userRatingTitle}>Sua avaliação:</Text>
              <View style={styles.userRatingContent}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Feather
                    key={star}
                    name="star"
                    size={20}
                    color={userMovie.userRating >= star ? "#FFD700" : "#3A3A3D"}
                    style={styles.userStarIcon}
                  />
                ))}
                <Text style={styles.userRatingText}>
                  {userMovie.userRating}/5
                </Text>
              </View>
            </View>
          )}
          
          {/* Botões de Ação */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={[
                styles.actionButton,
                isInWatchlist && styles.actionButtonActive,
                actionLoading && styles.actionButtonDisabled
              ]}
              onPress={handleWatchlistToggle}
              disabled={actionLoading}
            >
              <Feather 
                name={isInWatchlist ? "bookmark" : "bookmark"} 
                size={17} 
                color={isInWatchlist ? "#BD0DC0" : "white"} 
              />
              <Text style={[
                styles.actionButtonText,
                isInWatchlist && styles.actionButtonTextActive
              ]}>
                Quero ver
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.actionButton,
                isWatched && styles.actionButtonActive,
                actionLoading && styles.actionButtonDisabled
              ]}
              onPress={handleWatchedToggle}
              disabled={actionLoading}
            >
              <Feather 
                name={isWatched ? "check" : "plus"} 
                size={17} 
                color={isWatched ? "#BD0DC0" : "white"} 
              />
              <Text style={[
                styles.actionButtonText,
                isWatched && styles.actionButtonTextActive
              ]}>
                Já vi
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                styles.favoriteButton,
                movieIsFavorite && styles.favoriteButtonActive,
                actionLoading && styles.actionButtonDisabled
              ]}
              onPress={handleFavoriteToggle}
              disabled={actionLoading}
            >
              <Feather 
                name={movieIsFavorite ? "heart" : "heart"} 
                size={17} 
                color={movieIsFavorite ? "#EF4444" : "white"} 
              />
              <Text style={[
                styles.actionButtonText,
                movieIsFavorite && styles.favoriteButtonTextActive
              ]}>
                Favoritar
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botão de Avaliação/Editar Avaliação */}
          <TouchableOpacity 
            style={styles.evaluateButton}
            onPress={handleEvaluateMovie}
            disabled={actionLoading}
          >
            <Feather name="star" size={20} color="#FFD700" />
            <Text style={styles.evaluateButtonText}>
              {hasUserRating ? "Editar Avaliação" : "Avaliar Filme"}
            </Text>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Modal para Avaliação */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                {/* Header do Modal */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {hasUserRating ? 'Editar Avaliação' : 'Avaliar Filme'}
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Feather name="x" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                  {/* Informações do Filme */}
                  <View style={styles.movieInfo}>
                    <Text style={styles.movieTitle}>{movie.title}</Text>
                    <Text style={styles.movieYear}>
                      {movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}
                    </Text>
                  </View>

                  {/* Avaliação com Estrelas */}
                  <View style={styles.ratingSection}>
                    <Text style={styles.sectionTitle}>Sua Avaliação *</Text>
                    {renderStars()}
                    {rating > 0 && (
                      <Text style={styles.ratingText}>
                        {rating} estrela{rating > 1 ? 's' : ''}
                      </Text>
                    )}
                  </View>

                  {/* Campo de Review */}
                  <View style={styles.reviewSection}>
                    <Text style={styles.sectionTitle}>Sua Opinião (Opcional)</Text>
                    <TextInput
                      style={styles.reviewInput}
                      placeholder="O que você achou deste filme?"
                      placeholderTextColor="#9CA3AF"
                      multiline
                      numberOfLines={4}
                      value={review}
                      onChangeText={setReview}
                      maxLength={500}
                    />
                    <Text style={styles.charCount}>{review.length}/500</Text>
                  </View>

                  {/* Botões de Ação */}
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.saveButton]}
                      onPress={handleSaveReview}
                      disabled={actionLoading || rating === 0}
                    >
                      {actionLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.saveButtonText}>
                          {hasUserRating ? 'Atualizar' : 'Salvar Avaliação'}
                        </Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => setModalVisible(false)}
                      disabled={actionLoading}
                    >
                      <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#18181B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#18181B',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#BD0DC0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backdropContainer: {
    width: '100%',
    height: 240,
    position: 'relative',
  },
  backdropImage: {
    width: '100%',
    height: '100%',
  },
  backdropGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(24, 24, 27, 0.8)',
  },
  backButtonFloating: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },
  movieInfoContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  posterAndInfo: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  posterImage: {
    width: width * 0.3,
    height: width * 0.45,
    borderRadius: 12,
    backgroundColor: '#27272A',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'flex-start',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  year: {
    color: '#9CA3AF',
    fontSize: 14,
    marginRight: 16,
  },
  runtime: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starIcon: {
    marginRight: 2,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
  },
  tmdbText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginLeft: 8,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreTag: {
    backgroundColor: '#27272A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  genreText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  overviewContainer: {
    marginBottom: 24,
  },
  overviewTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  overviewText: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 22,
  },
  productionContainer: {
    marginBottom: 24,
  },
  productionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  companiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  companyText: {
    color: '#D1D5DB',
    fontSize: 14,
    marginRight: 16,
    marginBottom: 4,
  },
  userRatingContainer: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#BD0DC0',
  },
  userRatingTitle: {
    color: '#BD0DC0',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  userRatingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userStarIcon: {
    marginRight: 4,
  },
  userRatingText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27272A',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: width * 0.28,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actionButtonActive: {
    backgroundColor: 'rgba(189, 13, 192, 0.15)',
    borderColor: '#BD0DC0',
    transform: [{ scale: 1.02 }],
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 6,
  },
  actionButtonTextActive: {
    color: '#BD0DC0',
    fontWeight: '600',
  },
  favoriteButton: {
    borderColor: 'transparent',
  },
  favoriteButtonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
    transform: [{ scale: 1.02 }],
  },
  favoriteButtonTextActive: {
    color: '#EF4444',
    fontWeight: '600',
  },
  evaluateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  evaluateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#18181B',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalContent: {
    padding: 20,
  },
  movieInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  movieYear: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  ratingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  starButton: {
    padding: 8,
  },
  reviewSection: {
    marginBottom: 24,
  },
  reviewInput: {
    backgroundColor: '#27272A',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    textAlignVertical: 'top',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  modalActions: {
    gap: 12,
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#BD0DC0',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
});

export default MovieDetailScreen;

// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   StatusBar,
//   SafeAreaView,
//   Dimensions,
//   Alert,
//   Modal,
//   TextInput
// } from 'react-native';
// import { Feather } from '@expo/vector-icons';
// import { getMovieDetails } from '../services/api';
// import { useMovies } from '../contexts/useMovies';

// const { width } = Dimensions.get('window');

// const MovieDetailScreen = ({ route, navigation }) => {
//   const { movieId } = route.params;
//   const [movie, setMovie] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState(false);
  
//   // Estados para o modal de avaliação
//   const [modalVisible, setModalVisible] = useState(false);
//   const [userRating, setUserRating] = useState(0);
//   const [userReview, setUserReview] = useState('');

//   // Hook do contexto
//   const { 
//     addMovieToList, 
//     toggleFavorite, 
//     removeMovie,
//     isMovieInList, 
//     isFavorite, 
//     getUserMovie 
//   } = useMovies();

//   useEffect(() => {
//     const fetchMovieDetails = async () => {
//       try {
//         const details = await getMovieDetails(movieId);
//         setMovie(details);
        
//         // Carregar avaliação do usuário se existir
//         const userMovie = getUserMovie(movieId);
//         if (userMovie && userMovie.userRating) {
//           setUserRating(userMovie.userRating);
//           setUserReview(userMovie.userReview || '');
//         }
//       } catch (error) {
//         console.error('Erro ao buscar detalhes do filme:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMovieDetails();
//   }, [movieId, getUserMovie]);

//   // 🔥 NOVA FUNÇÃO - Toggle Watchlist (adiciona/remove)
//   const handleWatchlistToggle = async () => {
//     if (!movie || actionLoading) return;
    
//     try {
//       setActionLoading(true);
      
//       const isCurrentlyInWatchlist = isMovieInList(movie.id, 'watchlist');
      
//       if (isCurrentlyInWatchlist) {
//         // Se já está na watchlist, remover
//         await removeMovie(movie.id);
//       } else {
//         // Se não está, adicionar
//         await addMovieToList(movie, 'watchlist');
//       }
      
//     } catch (error) {
//       console.error('Erro ao alterar watchlist:', error);
//       Alert.alert('Erro', 'Não foi possível alterar a lista. Tente novamente.');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // 🔥 NOVA FUNÇÃO - Toggle Watched (adiciona/remove)
//   const handleWatchedToggle = async () => {
//     if (!movie || actionLoading) return;
    
//     try {
//       setActionLoading(true);
      
//       const isCurrentlyWatched = isMovieInList(movie.id, 'watched');
      
//       if (isCurrentlyWatched) {
//         // Se já está como assistido, remover
//         await removeMovie(movie.id);
//       } else {
//         // Se não está, marcar como assistido
//         await addMovieToList(movie, 'watched');
//       }
      
//     } catch (error) {
//       console.error('Erro ao alterar status assistido:', error);
//       Alert.alert('Erro', 'Não foi possível alterar o status. Tente novamente.');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // 🔥 FUNÇÃO FAVORITO - Já faz toggle automaticamente
//   const handleFavoriteToggle = async () => {
//     if (!movie || actionLoading) return;
    
//     try {
//       setActionLoading(true);
//       await toggleFavorite(movie);
//     } catch (error) {
//       console.error('Erro ao alterar favorito:', error);
//       Alert.alert('Erro', 'Não foi possível alterar favorito. Tente novamente.');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // 🌟 FUNÇÃO PARA SALVAR AVALIAÇÃO
//   const handleSaveReview = async () => {
//     if (userRating === 0) {
//       Alert.alert('Avaliação obrigatória', 'Por favor, avalie o filme com estrelas.');
//       return;
//     }

//     setActionLoading(true);
//     try {
//       await addMovieToList(movie, 'watched', { rating: userRating, review: userReview });
//       setModalVisible(false);
//       Alert.alert('Sucesso!', 'Avaliação salva com sucesso!');
//     } catch (error) {
//       console.error('Erro ao salvar avaliação:', error);
//       Alert.alert('Erro', 'Não foi possível salvar a avaliação. Tente novamente.');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // Renderizar estrelas para o modal
//   const renderModalStars = () => {
//     return (
//       <View style={styles.modalStarsContainer}>
//         {[1, 2, 3, 4, 5].map((star) => (
//           <TouchableOpacity
//             key={star}
//             onPress={() => setUserRating(star)}
//             style={styles.modalStarButton}
//           >
//             <Feather
//               name="star"
//               size={32}
//               color="#FFD700"
//               style={{ opacity: userRating >= star ? 1 : 0.3 }}
//             />
//           </TouchableOpacity>
//         ))}
//       </View>
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#BD0DC0" />
//         <Text style={styles.loadingText}>Carregando detalhes...</Text>
//       </View>
//     );
//   }

//   if (!movie) {
//     return (
//       <View style={styles.errorContainer}>
//         <Feather name="alert-circle" size={50} color="#BD0DC0" />
//         <Text style={styles.errorText}>Não foi possível carregar o filme</Text>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//         >
//           <Text style={styles.backButtonText}>Voltar</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   const renderStars = (rating) => {
//     const stars = [];
//     const fullStars = Math.floor(rating / 2);
//     const halfStar = rating % 2 >= 1;
    
//     for (let i = 0; i < 5; i++) {
//       if (i < fullStars) {
//         stars.push(<Feather key={i} name="star" size={16} color="#FFD700" style={styles.starIcon} />);
//       } else if (i === fullStars && halfStar) {
//         stars.push(<Feather key={i} name="star" size={16} color="#FFD700" style={[styles.starIcon, { opacity: 0.5 }]} />);
//       } else {
//         stars.push(<Feather key={i} name="star" size={16} color="#FFD700" style={[styles.starIcon, { opacity: 0.2 }]} />);
//       }
//     }
    
//     return stars;
//   };

//   // Verificar status atual
//   const isInWatchlist = isMovieInList(movie.id, 'watchlist');
//   const isWatched = isMovieInList(movie.id, 'watched');
//   const movieIsFavorite = isFavorite(movie.id);

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" />
      
//       <ScrollView>
//         {/* Imagem de Fundo do Filme */}
//         <View style={styles.backdropContainer}>
//           <Image
//             source={{
//               uri: movie.backdrop_path
//                 ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`
//                 : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
//             }}
//             style={styles.backdropImage}
//             resizeMode="cover"
//           />
//           <View style={styles.backdropGradient} />
          
//           {/* Botão Voltar */}
//           <TouchableOpacity 
//             style={styles.backButtonFloating}
//             onPress={() => navigation.goBack()}
//           >
//             <Feather name="arrow-left" size={24} color="white" />
//           </TouchableOpacity>
//         </View>
        
//         {/* Informações do Filme */}
//         <View style={styles.movieInfoContainer}>
//           <View style={styles.posterAndInfo}>
//             <Image
//               source={{
//                 uri: movie.poster_path
//                   ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
//                   : 'https://via.placeholder.com/150x225?text=No+Image'
//               }}
//               style={styles.posterImage}
//               resizeMode="cover"
//             />
            
//             <View style={styles.infoContainer}>
//               <Text style={styles.title}>{movie.title}</Text>
              
//               <View style={styles.detailsRow}>
//                 <Text style={styles.year}>
//                   {movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}
//                 </Text>
//                 <Text style={styles.runtime}>
//                   {movie.runtime ? `${movie.runtime} min` : 'N/A'}
//                 </Text>
//               </View>
              
//               {/* Avaliação TMDb */}
//               <View style={styles.ratingContainer}>
//                 {renderStars(movie.vote_average)}
//                 <Text style={styles.ratingText}>
//                   {movie.vote_average ? `${movie.vote_average.toFixed(1)}/10` : 'N/A'}
//                 </Text>
//                 <Text style={styles.ratingSource}>TMDb</Text>
//               </View>
//             </View>
//           </View>
          
//           {/* SUA AVALIAÇÃO - Seção com cor correta */}
//           <View style={styles.userRatingContainer}>
//             <Text style={styles.userRatingTitle}>Sua avaliação:</Text>
//             <View style={styles.userRatingDisplay}>
//               {userRating > 0 ? (
//                 <View style={styles.ratingDisplay}>
//                   {[1, 2, 3, 4, 5].map((star) => (
//                     <Feather
//                       key={star}
//                       name="star"
//                       size={24}
//                       color="#FFD700"
//                       style={{ 
//                         opacity: userRating >= star ? 1 : 0.3,
//                         marginRight: 4 
//                       }}
//                     />
//                   ))}
//                 </View>
//               ) : (
//                 <View style={styles.noRatingDisplay}>
//                   {[1, 2, 3, 4, 5].map((star) => (
//                     <Feather
//                       key={star}
//                       name="star"
//                       size={24}
//                       color="#FFD700"
//                       style={{ opacity: 0.3, marginRight: 4 }}
//                     />
//                   ))}
//                 </View>
//               )}
//             </View>
//           </View>

//           {/* Botão Editar Avaliação */}
//           <TouchableOpacity 
//             style={styles.editRatingButton}
//             onPress={() => setModalVisible(true)}
//           >
//             <Feather name="star" size={20} color="#FFD700" />
//             <Text style={styles.editRatingText}>Editar Avaliação</Text>
//             <Feather name="chevron-down" size={20} color="#9CA3AF" />
//           </TouchableOpacity>

//           {/* Gêneros logo após a avaliação */}
//           <View style={styles.genresContainer}>
//             {movie.genres && movie.genres.map(genre => (
//               <View key={genre.id} style={styles.genreTag}>
//                 <Text style={styles.genreText}>{genre.name}</Text>
//               </View>
//             ))}
//           </View>
          
//           {/* Sinopse */}
//           <View style={styles.overviewContainer}>
//             <Text style={styles.overviewTitle}>Sinopse</Text>
//             <Text style={styles.overviewText}>
//               {movie.overview || 'Sinopse não disponível para este filme.'}
//             </Text>
//           </View>
          
//           {/* Produção */}
//           {movie.production_companies && movie.production_companies.length > 0 && (
//             <View style={styles.productionContainer}>
//               <Text style={styles.productionTitle}>Produção</Text>
//               <View style={styles.companiesContainer}>
//                 {movie.production_companies.slice(0, 3).map(company => (
//                   <Text key={company.id} style={styles.companyText}>
//                     {company.name}
//                   </Text>
//                 ))}
//               </View>
//             </View>
//           )}
          
//           {/* Botões de ação */}
//           <View style={styles.actionButtonsContainer}>
//             <TouchableOpacity 
//               style={[
//                 styles.actionButton,
//                 isInWatchlist && styles.actionButtonActive,
//                 actionLoading && styles.actionButtonDisabled
//               ]}
//               onPress={handleWatchlistToggle}
//               disabled={actionLoading}
//             >
//               <Feather 
//                 name={isInWatchlist ? "bookmark" : "bookmark"} 
//                 size={17} 
//                 color={isInWatchlist ? "#BD0DC0" : "white"} 
//               />
//               <Text style={[
//                 styles.actionButtonText,
//                 isInWatchlist && styles.actionButtonTextActive
//               ]}>
//                 Quero ver
//               </Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={[
//                 styles.actionButton,
//                 isWatched && styles.actionButtonActive,
//                 actionLoading && styles.actionButtonDisabled
//               ]}
//               onPress={handleWatchedToggle}
//               disabled={actionLoading}
//             >
//               <Feather 
//                 name={isWatched ? "check" : "plus"} 
//                 size={17} 
//                 color={isWatched ? "#BD0DC0" : "white"} 
//               />
//               <Text style={[
//                 styles.actionButtonText,
//                 isWatched && styles.actionButtonTextActive
//               ]}>
//                 Já vi
//               </Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={[
//                 styles.actionButton, 
//                 styles.favoriteButton,
//                 movieIsFavorite && styles.favoriteButtonActive,
//                 actionLoading && styles.actionButtonDisabled
//               ]}
//               onPress={handleFavoriteToggle}
//               disabled={actionLoading}
//             >
//               <Feather 
//                 name={movieIsFavorite ? "heart" : "heart"} 
//                 size={17} 
//                 color={movieIsFavorite ? "#EF4444" : "white"} 
//               />
//               <Text style={[
//                 styles.actionButtonText,
//                 movieIsFavorite && styles.favoriteButtonTextActive
//               ]}>
//                 Favoritar
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>

//       {/* Modal para Avaliação */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             {/* Header do Modal */}
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Editar sua avaliação</Text>
//               <TouchableOpacity onPress={() => setModalVisible(false)}>
//                 <Feather name="x" size={24} color="#FFFFFF" />
//               </TouchableOpacity>
//             </View>

//             <ScrollView style={styles.modalContent}>
//               {/* Sua nota */}
//               <Text style={styles.modalSectionTitle}>Sua nota:</Text>
//               {renderModalStars()}
//               {userRating > 0 && (
//                 <Text style={styles.ratingText}>
//                   {userRating}/5 estrelas
//                 </Text>
//               )}

//               {/* Sua opinião */}
//               <Text style={styles.modalSectionTitle}>Sua opinião (opcional):</Text>
//               <TextInput
//                 style={styles.reviewInput}
//                 placeholder="Ótimo"
//                 placeholderTextColor="#9CA3AF"
//                 multiline
//                 numberOfLines={4}
//                 value={userReview}
//                 onChangeText={setUserReview}
//                 maxLength={500}
//               />
//               <Text style={styles.charCount}>{userReview.length}/500</Text>

//               {/* Botões */}
//               <View style={styles.modalButtons}>
//                 <TouchableOpacity
//                   style={styles.cancelButton}
//                   onPress={() => setModalVisible(false)}
//                 >
//                   <Text style={styles.cancelButtonText}>Cancelar</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={styles.updateButton}
//                   onPress={handleSaveReview}
//                   disabled={actionLoading}
//                 >
//                   {actionLoading ? (
//                     <ActivityIndicator size="small" color="#FFFFFF" />
//                   ) : (
//                     <Text style={styles.updateButtonText}>Atualizar</Text>
//                   )}
//                 </TouchableOpacity>
//               </View>
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#18181B',
//   },
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: '#18181B',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     marginTop: 16,
//   },
//   errorContainer: {
//     flex: 1,
//     backgroundColor: '#18181B',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   errorText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     textAlign: 'center',
//     marginTop: 16,
//     marginBottom: 24,
//   },
//   backButton: {
//     backgroundColor: '#BD0DC0',
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   backButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   backdropContainer: {
//     width: '100%',
//     height: 240,
//     position: 'relative',
//   },
//   backdropImage: {
//     width: '100%',
//     height: '100%',
//   },
//   backdropGradient: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: 100,
//     backgroundColor: 'rgba(24, 24, 27, 0.8)',
//   },
//   backButtonFloating: {
//     position: 'absolute',
//     top: 16,
//     left: 16,
//     backgroundColor: 'rgba(0, 0, 0, 0.6)',
//     borderRadius: 20,
//     padding: 8,
//   },
//   movieInfoContainer: {
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 40,
//   },
//   posterAndInfo: {
//     flexDirection: 'row',
//     marginBottom: 24,
//   },
//   posterImage: {
//     width: width * 0.3,
//     height: width * 0.45,
//     borderRadius: 12,
//     backgroundColor: '#27272A',
//   },
//   infoContainer: {
//     flex: 1,
//     marginLeft: 16,
//     justifyContent: 'flex-start',
//   },
//   title: {
//     color: '#FFFFFF',
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   detailsRow: {
//     flexDirection: 'row',
//     marginBottom: 12,
//   },
//   year: {
//     color: '#9CA3AF',
//     fontSize: 14,
//     marginRight: 16,
//   },
//   runtime: {
//     color: '#9CA3AF',
//     fontSize: 14,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   starIcon: {
//     marginRight: 2,
//   },
//   ratingText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     marginLeft: 8,
//     marginRight: 8,
//   },
//   ratingSource: {
//     color: '#9CA3AF',
//     fontSize: 12,
//     fontStyle: 'italic',
//     backgroundColor: '#27272A',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 4,
//   },
//   userRatingContainer: {
//     backgroundColor: 'rgba(189, 13, 192, 0.1)', // Cor roxa escura como na imagem
//     borderRadius: 12,
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     marginBottom: 16,
//   },
//   userRatingTitle: {
//     color: '#BD0DC0', // Rosa como na imagem
//     fontSize: 18,
//     fontWeight: '500',
//     marginBottom: 12,
//   },
//   userRatingDisplay: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   ratingDisplay: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   noRatingDisplay: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   editRatingButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: '#27272A',
//     borderRadius: 8,
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: '#FFD700',
//   },
//   editRatingText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '500',
//     flex: 1,
//     marginLeft: 12,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.7)',
//     justifyContent: 'flex-end',
//   },
//   modalContainer: {
//     backgroundColor: '#18181B',
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//     maxHeight: '85%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#27272A',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//   },
//   modalContent: {
//     padding: 20,
//   },
//   modalSectionTitle: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#FFFFFF',
//     marginBottom: 12,
//     marginTop: 8,
//   },
//   modalStarsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginBottom: 12,
//   },
//   modalStarButton: {
//     padding: 8,
//   },
//   ratingText: {
//     fontSize: 14,
//     color: '#FFD700',
//     textAlign: 'center',
//     fontWeight: '500',
//     marginBottom: 20,
//   },
//   reviewInput: {
//     backgroundColor: '#27272A',
//     borderRadius: 8,
//     padding: 16,
//     color: '#FFFFFF',
//     textAlignVertical: 'top',
//     minHeight: 120,
//     borderWidth: 1,
//     borderColor: '#3F3F46',
//     fontSize: 16,
//   },
//   charCount: {
//     fontSize: 12,
//     color: '#9CA3AF',
//     textAlign: 'right',
//     marginTop: 4,
//     marginBottom: 20,
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 12,
//   },
//   cancelButton: {
//     flex: 1,
//     backgroundColor: 'transparent',
//     borderRadius: 8,
//     paddingVertical: 14,
//     alignItems: 'center',
//   },
//   cancelButtonText: {
//     color: '#9CA3AF',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   updateButton: {
//     flex: 1,
//     backgroundColor: '#BD0DC0',
//     borderRadius: 8,
//     paddingVertical: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   updateButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   genresContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginBottom: 24,
//   },
//   genreTag: {
//     backgroundColor: '#27272A',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 4,
//     marginRight: 8,
//     marginBottom: 8,
//   },
//   genreText: {
//     color: '#FFFFFF',
//     fontSize: 12,
//   },
//   overviewContainer: {
//     marginBottom: 24,
//   },
//   overviewTitle: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   overviewText: {
//     color: '#D1D5DB',
//     fontSize: 14,
//     lineHeight: 22,
//   },
//   productionContainer: {
//     marginBottom: 24,
//   },
//   productionTitle: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   companiesContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//   },
//   companyText: {
//     color: '#D1D5DB',
//     fontSize: 14,
//     marginRight: 16,
//     marginBottom: 4,
//   },
//   actionButtonsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 8,
//     marginBottom: 16,
//   },
//   actionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#27272A',
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     borderRadius: 8,
//     minWidth: width * 0.28,
//     borderWidth: 1,
//     borderColor: 'transparent',
//   },
//   actionButtonActive: {
//     backgroundColor: 'rgba(189, 13, 192, 0.15)',
//     borderColor: '#BD0DC0',
//     transform: [{ scale: 1.02 }], 
//   },
//   actionButtonDisabled: {
//     opacity: 0.6,
//   },
//   actionButtonText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     marginLeft: 6,
//   },
//   actionButtonTextActive: {
//     color: '#BD0DC0',
//     fontWeight: '600',
//   },
//   favoriteButton: {
//     borderColor: 'transparent',
//   },
//   favoriteButtonActive: {
//     backgroundColor: 'rgba(239, 68, 68, 0.15)',
//     borderColor: '#EF4444',
//     transform: [{ scale: 1.02 }], 
//   },
//   favoriteButtonTextActive: {
//     color: '#EF4444',
//     fontWeight: '600',
//   },
// });

// export default MovieDetailScreen