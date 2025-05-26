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
  Alert
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

  // Hook do contexto com funções corrigidas
  const { 
    addMovieToList, 
    toggleFavorite, 
    removeMovie,
    removeMovieStatus,
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

  // Função Toggle Watchlist
  const handleWatchlistToggle = async () => {
    if (!movie || actionLoading) return;
    
    try {
      setActionLoading(true);
      
      const isCurrentlyInWatchlist = isMovieInList(movie.id, 'watchlist');
      
      if (isCurrentlyInWatchlist) {
        const result = await removeMovieStatus(movie.id, 'watchlist');
        if (result.success) {
          console.log('✅ Watchlist toggle:', result.action);
        } else {
          Alert.alert('Erro', result.error || 'Não foi possível remover da lista.');
        }
      } else {
        await addMovieToList(movie, 'watchlist');
        console.log('✅ Adicionado à watchlist');
      }
      
    } catch (error) {
      console.error('Erro ao alterar watchlist:', error);
      Alert.alert('Erro', 'Não foi possível alterar a lista. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  // Função Toggle Watched
  const handleWatchedToggle = async () => {
    if (!movie || actionLoading) return;
    
    try {
      setActionLoading(true);
      
      const isCurrentlyWatched = isMovieInList(movie.id, 'watched');
      
      if (isCurrentlyWatched) {
        const result = await removeMovieStatus(movie.id, 'watched');
        if (result.success) {
          console.log('✅ Watched toggle:', result.action);
        } else {
          Alert.alert('Erro', result.error || 'Não foi possível remover da lista.');
        }
      } else {
        await addMovieToList(movie, 'watched');
        console.log('✅ Marcado como assistido');
      }
      
    } catch (error) {
      console.error('Erro ao alterar status assistido:', error);
      Alert.alert('Erro', 'Não foi possível alterar o status. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  // Função Favorito
  const handleFavoriteToggle = async () => {
    if (!movie || actionLoading) return;
    
    try {
      setActionLoading(true);
      await toggleFavorite(movie);
      console.log('✅ Favorito alternado');
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
      Alert.alert('Erro', 'Não foi possível alterar favorito. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  // Função para abrir modal de avaliação (se implementar no futuro)
  const handleRateMovie = () => {
    console.log('📝 Abrir modal de avaliação para:', movie.title);
  };

  // Função para recomendar filme
  const handleRecommendMovie = () => {
    console.log('📢 Recomendar filme:', movie.title);
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

  const renderStars = (rating) => {
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
    
    return stars;
  };

  // Verificar status atual do filme
  const isInWatchlist = isMovieInList(movie.id, 'watchlist');
  const isWatched = isMovieInList(movie.id, 'watched');
  const movieIsFavorite = isFavorite(movie.id);
  const userMovie = getUserMovie(movie.id);

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
              
              <View style={styles.ratingContainer}>
                {renderStars(movie.vote_average)}
                <Text style={styles.ratingText}>
                  {movie.vote_average ? `${movie.vote_average.toFixed(1)}/10` : 'N/A'}
                </Text>
              </View>
              
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
          
          {/* 🔥 BOTÕES DE AÇÃO COM TEXTO FIXO */}
          <View style={styles.actionButtonsContainer}>
            {/* Botão Quero Ver - TEXTO FIXO */}
            <TouchableOpacity 
              style={[
                styles.actionButton,
                isInWatchlist && styles.actionButtonActive,
                actionLoading && styles.actionButtonDisabled
              ]}
              onPress={handleWatchlistToggle}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather 
                    name="bookmark" 
                    size={20} 
                    color={isInWatchlist ? "#BD0DC0" : "white"} 
                  />
                  <Text style={[
                    styles.actionButtonText,
                    isInWatchlist && styles.actionButtonTextActive
                  ]}>
                    Quero ver
                  </Text>
                </>
              )}
            </TouchableOpacity>
            
            {/* Botão Já Vi - TEXTO FIXO */}
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
                name="check" 
                size={20} 
                color={isWatched ? "#BD0DC0" : "white"} 
              />
              <Text style={[
                styles.actionButtonText,
                isWatched && styles.actionButtonTextActive
              ]}>
                Já vi
              </Text>
            </TouchableOpacity>
            
            {/* Botão Favorito - TEXTO FIXO */}
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
                name="heart" 
                size={20} 
                color={movieIsFavorite ? "#EF4444" : "white"} 
              />
              <Text style={[
                styles.actionButtonText,
                movieIsFavorite && styles.favoriteButtonTextActive
              ]}>
                Favorito
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botões Secundários */}
          <View style={styles.secondaryActionsContainer}>
            {/* Botão Avaliar */}
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleRateMovie}
            >
              <Feather name="star" size={18} color="#9CA3AF" />
              <Text style={styles.secondaryButtonText}>
                {userMovie?.userRating ? 'Editar Avaliação' : 'Avaliar'}
              </Text>
            </TouchableOpacity>

            {/* Botão Recomendar */}
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleRecommendMovie}
            >
              <Feather name="share-2" size={18} color="#9CA3AF" />
              <Text style={styles.secondaryButtonText}>Recomendar</Text>
            </TouchableOpacity>
          </View>

          {/* Review do usuário (se existir) */}
          {userMovie?.userReview && (
            <View style={styles.userReviewContainer}>
              <Text style={styles.userReviewTitle}>Sua Opinião</Text>
              <Text style={styles.userReviewText}>{userMovie.userReview}</Text>
              <TouchableOpacity 
                style={styles.editReviewButton}
                onPress={handleRateMovie}
              >
                <Feather name="edit-2" size={14} color="#BD0DC0" />
                <Text style={styles.editReviewText}>Editar</Text>
              </TouchableOpacity>
            </View>
          )}
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
  secondaryActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3F3F46',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: width * 0.4,
  },
  secondaryButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginLeft: 8,
  },
  userReviewContainer: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  userReviewTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  userReviewText: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  editReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  editReviewText: {
    color: '#BD0DC0',
    fontSize: 14,
    marginLeft: 4,
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
//   Alert
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

//   // 🔥 HOOK DO CONTEXTO COM FUNÇÕES CORRIGIDAS
//   const { 
//     addMovieToList, 
//     toggleFavorite, 
//     removeMovie,
//     removeMovieStatus, // 🔥 NOVA FUNÇÃO IMPORTADA
//     isMovieInList, 
//     isFavorite, 
//     getUserMovie 
//   } = useMovies();

//   useEffect(() => {
//     const fetchMovieDetails = async () => {
//       try {
//         const details = await getMovieDetails(movieId);
//         setMovie(details);
//       } catch (error) {
//         console.error('Erro ao buscar detalhes do filme:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMovieDetails();
//   }, [movieId]);

//   // 🔥 FUNÇÃO CORRIGIDA - Toggle Watchlist (usar remoção inteligente)
//   const handleWatchlistToggle = async () => {
//     if (!movie || actionLoading) return;
    
//     try {
//       setActionLoading(true);
      
//       const isCurrentlyInWatchlist = isMovieInList(movie.id, 'watchlist');
      
//       if (isCurrentlyInWatchlist) {
//         // 🔥 USAR REMOÇÃO INTELIGENTE - remove apenas status 'watchlist'
//         const result = await removeMovieStatus(movie.id, 'watchlist');
//         if (result.success) {
//           console.log('✅ Watchlist toggle:', result.action);
//           // Opcional: mostrar feedback baseado na ação
//           if (result.action === 'status_removed_favorite_kept') {
//             console.log('ℹ️ Removido da lista, mas mantido nos favoritos');
//           } else if (result.action === 'movie_removed_completely') {
//             console.log('ℹ️ Filme removido completamente');
//           }
//         } else {
//           Alert.alert('Erro', result.error || 'Não foi possível remover da lista.');
//         }
//       } else {
//         // Se não está, adicionar
//         await addMovieToList(movie, 'watchlist');
//         console.log('✅ Adicionado à watchlist');
//       }
      
//     } catch (error) {
//       console.error('Erro ao alterar watchlist:', error);
//       Alert.alert('Erro', 'Não foi possível alterar a lista. Tente novamente.');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // 🔥 FUNÇÃO CORRIGIDA - Toggle Watched (usar remoção inteligente)
//   const handleWatchedToggle = async () => {
//     if (!movie || actionLoading) return;
    
//     try {
//       setActionLoading(true);
      
//       const isCurrentlyWatched = isMovieInList(movie.id, 'watched');
      
//       if (isCurrentlyWatched) {
//         // 🔥 USAR REMOÇÃO INTELIGENTE - remove apenas status 'watched'
//         const result = await removeMovieStatus(movie.id, 'watched');
//         if (result.success) {
//           console.log('✅ Watched toggle:', result.action);
//           // Opcional: mostrar feedback baseado na ação
//           if (result.action === 'status_removed_favorite_kept') {
//             console.log('ℹ️ Removido dos assistidos, mas mantido nos favoritos');
//           } else if (result.action === 'movie_removed_completely') {
//             console.log('ℹ️ Filme removido completamente');
//           }
//         } else {
//           Alert.alert('Erro', result.error || 'Não foi possível remover da lista.');
//         }
//       } else {
//         // Se não está, marcar como assistido
//         await addMovieToList(movie, 'watched');
//         console.log('✅ Marcado como assistido');
//       }
      
//     } catch (error) {
//       console.error('Erro ao alterar status assistido:', error);
//       Alert.alert('Erro', 'Não foi possível alterar o status. Tente novamente.');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // 🔥 FUNÇÃO FAVORITO - MANTÉM COMO ESTÁ (já usa toggleFavorite que é inteligente)
//   const handleFavoriteToggle = async () => {
//     if (!movie || actionLoading) return;
    
//     try {
//       setActionLoading(true);
//       await toggleFavorite(movie); // Esta função já é inteligente
//       console.log('✅ Favorito alternado');
//     } catch (error) {
//       console.error('Erro ao alterar favorito:', error);
//       Alert.alert('Erro', 'Não foi possível alterar favorito. Tente novamente.');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // 🔥 FUNÇÃO PARA ABRIR MODAL DE AVALIAÇÃO (se implementar no futuro)
//   const handleRateMovie = () => {
//     // Implementar modal de avaliação
//     console.log('📝 Abrir modal de avaliação para:', movie.title);
//     // navigation.navigate('RateMovie', { movie });
//   };

//   // 🔥 FUNÇÃO PARA RECOMENDAR FILME
//   const handleRecommendMovie = () => {
//     // Implementar funcionalidade de recomendação
//     console.log('📢 Recomendar filme:', movie.title);
//     // navigation.navigate('RecommendMovie', { movie });
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

//   // 🔥 VERIFICAR STATUS ATUAL DO FILME
//   const isInWatchlist = isMovieInList(movie.id, 'watchlist');
//   const isWatched = isMovieInList(movie.id, 'watched');
//   const movieIsFavorite = isFavorite(movie.id);
//   const userMovie = getUserMovie(movie.id);

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
              
//               <View style={styles.ratingContainer}>
//                 {renderStars(movie.vote_average)}
//                 <Text style={styles.ratingText}>
//                   {movie.vote_average ? `${movie.vote_average.toFixed(1)}/10` : 'N/A'}
//                 </Text>
//               </View>
              
//               <View style={styles.genresContainer}>
//                 {movie.genres && movie.genres.map(genre => (
//                   <View key={genre.id} style={styles.genreTag}>
//                     <Text style={styles.genreText}>{genre.name}</Text>
//                   </View>
//                 ))}
//               </View>
//             </View>
//           </View>
          
//           {/* 🔥 SEÇÃO DE STATUS DO USUÁRIO */}
//           {userMovie && (
//             <View style={styles.userStatusContainer}>
//               <Text style={styles.userStatusTitle}>Seu Status</Text>
//               <View style={styles.userStatusContent}>
//                 {isWatched && (
//                   <View style={styles.statusBadge}>
//                     <Feather name="check-circle" size={16} color="#10B981" />
//                     <Text style={[styles.statusText, { color: '#10B981' }]}>Assistido</Text>
//                   </View>
//                 )}
//                 {isInWatchlist && (
//                   <View style={styles.statusBadge}>
//                     <Feather name="bookmark" size={16} color="#3B82F6" />
//                     <Text style={[styles.statusText, { color: '#3B82F6' }]}>Quero Ver</Text>
//                   </View>
//                 )}
//                 {movieIsFavorite && (
//                   <View style={styles.statusBadge}>
//                     <Feather name="heart" size={16} color="#EF4444" />
//                     <Text style={[styles.statusText, { color: '#EF4444' }]}>Favorito</Text>
//                   </View>
//                 )}
//                 {userMovie.userRating && (
//                   <View style={styles.statusBadge}>
//                     <Feather name="star" size={16} color="#FFD700" />
//                     <Text style={[styles.statusText, { color: '#FFD700' }]}>
//                       {userMovie.userRating}/5
//                     </Text>
//                   </View>
//                 )}
//               </View>
//             </View>
//           )}
          
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
          
//           {/* 🔥 BOTÕES DE AÇÃO CORRIGIDOS */}
//           <View style={styles.actionButtonsContainer}>
//             {/* Botão Quero Ver */}
//             <TouchableOpacity 
//               style={[
//                 styles.actionButton,
//                 isInWatchlist && styles.actionButtonActive,
//                 actionLoading && styles.actionButtonDisabled
//               ]}
//               onPress={handleWatchlistToggle}
//               disabled={actionLoading}
//             >
//               {actionLoading ? (
//                 <ActivityIndicator size="small" color="#FFFFFF" />
//               ) : (
//                 <>
//                   <Feather 
//                     name={isInWatchlist ? "bookmark" : "bookmark"} 
//                     size={20} 
//                     color={isInWatchlist ? "#BD0DC0" : "white"} 
//                   />
//                   <Text style={[
//                     styles.actionButtonText,
//                     isInWatchlist && styles.actionButtonTextActive
//                   ]}>
//                     {isInWatchlist ? 'Na Lista' : 'Quero ver'}
//                   </Text>
//                 </>
//               )}
//             </TouchableOpacity>
            
//             {/* Botão Já Vi */}
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
//                 size={20} 
//                 color={isWatched ? "#BD0DC0" : "white"} 
//               />
//               <Text style={[
//                 styles.actionButtonText,
//                 isWatched && styles.actionButtonTextActive
//               ]}>
//                 {isWatched ? 'Assistido' : 'Já vi'}
//               </Text>
//             </TouchableOpacity>
            
//             {/* Botão Favoritar */}
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
//                 size={20} 
//                 color={movieIsFavorite ? "#EF4444" : "white"} 
//               />
//               <Text style={[
//                 styles.actionButtonText,
//                 movieIsFavorite && styles.favoriteButtonTextActive
//               ]}>
//                 {movieIsFavorite ? 'Favorito' : 'Favoritar'}
//               </Text>
//             </TouchableOpacity>
//           </View>

//           {/* 🔥 BOTÕES SECUNDÁRIOS */}
//           <View style={styles.secondaryActionsContainer}>
//             {/* Botão Avaliar */}
//             <TouchableOpacity 
//               style={styles.secondaryButton}
//               onPress={handleRateMovie}
//             >
//               <Feather name="star" size={18} color="#9CA3AF" />
//               <Text style={styles.secondaryButtonText}>
//                 {userMovie?.userRating ? 'Editar Avaliação' : 'Avaliar'}
//               </Text>
//             </TouchableOpacity>

//             {/* Botão Recomendar */}
//             <TouchableOpacity 
//               style={styles.secondaryButton}
//               onPress={handleRecommendMovie}
//             >
//               <Feather name="share-2" size={18} color="#9CA3AF" />
//               <Text style={styles.secondaryButtonText}>Recomendar</Text>
//             </TouchableOpacity>
//           </View>

//           {/* 🔥 REVIEW DO USUÁRIO (se existir) */}
//           {userMovie?.userReview && (
//             <View style={styles.userReviewContainer}>
//               <Text style={styles.userReviewTitle}>Sua Opinião</Text>
//               <Text style={styles.userReviewText}>{userMovie.userReview}</Text>
//               <TouchableOpacity 
//                 style={styles.editReviewButton}
//                 onPress={handleRateMovie}
//               >
//                 <Feather name="edit-2" size={14} color="#BD0DC0" />
//                 <Text style={styles.editReviewText}>Editar</Text>
//               </TouchableOpacity>
//             </View>
//           )}

//           {/* 🔥 DEBUG INFO - Remover em produção */}
//           {__DEV__ && (
//             <View style={styles.debugContainer}>
//               <Text style={styles.debugTitle}>🔍 Debug Info</Text>
//               <Text style={styles.debugText}>
//                 🎬 Filme: {movie.title} (ID: {movie.id})
//               </Text>
//               <Text style={styles.debugText}>
//                 📋 Watchlist: {isInWatchlist ? 'SIM' : 'NÃO'}
//               </Text>
//               <Text style={styles.debugText}>
//                 ✅ Assistido: {isWatched ? 'SIM' : 'NÃO'}
//               </Text>
//               <Text style={styles.debugText}>
//                 ❤️ Favorito: {movieIsFavorite ? 'SIM' : 'NÃO'}
//               </Text>
//               {userMovie && (
//                 <Text style={styles.debugText}>
//                   📊 Rating: {userMovie.userRating || 'N/A'} | Review: {userMovie.userReview ? 'SIM' : 'NÃO'}
//                 </Text>
//               )}
//             </View>
//           )}
//         </View>
//       </ScrollView>
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
//   },
//   genresContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
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
//   userStatusContainer: {
//     backgroundColor: '#27272A',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 24,
//   },
//   userStatusTitle: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 12,
//   },
//   userStatusContent: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//   },
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#18181B',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     marginRight: 8,
//     marginBottom: 8,
//   },
//   statusText: {
//     fontSize: 14,
//     fontWeight: '500',
//     marginLeft: 6,
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
//   secondaryActionsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: 24,
//   },
//   secondaryButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'transparent',
//     borderWidth: 1,
//     borderColor: '#3F3F46',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 8,
//     minWidth: width * 0.4,
//   },
//   secondaryButtonText: {
//     color: '#9CA3AF',
//     fontSize: 14,
//     marginLeft: 8,
//   },
//   userReviewContainer: {
//     backgroundColor: '#27272A',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 24,
//   },
//   userReviewTitle: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   userReviewText: {
//     color: '#D1D5DB',
//     fontSize: 14,
//     lineHeight: 20,
//     marginBottom: 12,
//   },
//   editReviewButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     alignSelf: 'flex-start',
//   },
//   editReviewText: {
//     color: '#BD0DC0',
//     fontSize: 14,
//     marginLeft: 4,
//   },
//   debugContainer: {
//     backgroundColor: '#27272A',
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 16,
//   },
//   debugTitle: {
//     color: '#FFD700',
//     fontSize: 14,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   debugText: {
//     color: '#9CA3AF',
//     fontSize: 12,
//     marginBottom: 4,
//   },
// });

// export default MovieDetailScreen;
