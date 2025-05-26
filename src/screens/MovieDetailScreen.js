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

  // 🔥 NOVA FUNÇÃO - Toggle Watchlist (adiciona/remove)
  const handleWatchlistToggle = async () => {
    if (!movie || actionLoading) return;
    
    try {
      setActionLoading(true);
      
      const isCurrentlyInWatchlist = isMovieInList(movie.id, 'watchlist');
      
      if (isCurrentlyInWatchlist) {
        // Se já está na watchlist, remover
        await removeMovie(movie.id);
        // Alert.alert('Removido', 'Filme removido da sua lista "Quero Ver"!');
      } else {
        // Se não está, adicionar
        await addMovieToList(movie, 'watchlist');
        // Alert.alert('Adicionado', 'Filme adicionado à sua lista "Quero Ver"!');
      }
      
    } catch (error) {
      console.error('Erro ao alterar watchlist:', error);
      Alert.alert('Erro', 'Não foi possível alterar a lista. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  // 🔥 NOVA FUNÇÃO - Toggle Watched (adiciona/remove)
  const handleWatchedToggle = async () => {
    if (!movie || actionLoading) return;
    
    try {
      setActionLoading(true);
      
      const isCurrentlyWatched = isMovieInList(movie.id, 'watched');
      
      if (isCurrentlyWatched) {
        // Se já está como assistido, remover
        await removeMovie(movie.id);
        // Alert.alert('Removido', 'Filme removido da lista de assistidos!');
      } else {
        // Se não está, marcar como assistido
        await addMovieToList(movie, 'watched');
        // Alert.alert('Marcado', 'Filme marcado como assistido!');
      }
      
    } catch (error) {
      console.error('Erro ao alterar status assistido:', error);
      Alert.alert('Erro', 'Não foi possível alterar o status. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  // 🔥 FUNÇÃO FAVORITO - Já faz toggle automaticamente
  const handleFavoriteToggle = async () => {
    if (!movie || actionLoading) return;
    
    try {
      setActionLoading(true);
      await toggleFavorite(movie);
      
      // const isCurrentlyFavorite = isFavorite(movie.id);
      // Alert.alert(
      //   'Sucesso', 
      //   isCurrentlyFavorite ? 'Adicionado aos favoritos!' : 'Removido dos favoritos!'
      // );
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
      Alert.alert('Erro', 'Não foi possível alterar favorito. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
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

  // Verificar status atual
  const isInWatchlist = isMovieInList(movie.id, 'watchlist');
  const isWatched = isMovieInList(movie.id, 'watched');
  const movieIsFavorite = isFavorite(movie.id);

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
          
          {/* 🔥 BOTÕES ATUALIZADOS COM TOGGLE */}
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
                size={20} 
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
                size={20} 
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

          {/* 🔥 DEBUG INFO - Remove depois de testar */}
          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>
              🎬 Debug: {movie.title} (ID: {movie.id})
            </Text>
            <Text style={styles.debugText}>
              📋 Watchlist: {isInWatchlist ? 'SIM' : 'NÃO'}
            </Text>
            <Text style={styles.debugText}>
              ✅ Assistido: {isWatched ? 'SIM' : 'NÃO'}
            </Text>
            <Text style={styles.debugText}>
              ❤️ Favorito: {movieIsFavorite ? 'SIM' : 'NÃO'}
            </Text>
          </View>
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
    transform: [{ scale: 1.02 }], // Leve aumento no tamanho
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
    transform: [{ scale: 1.02 }], // Leve aumento no tamanho
  },
  favoriteButtonTextActive: {
    color: '#EF4444',
    fontWeight: '600',
  },
  // 🔥 DEBUG STYLES - Remover depois
  debugContainer: {
    backgroundColor: '#27272A',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  debugText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
  },
});

export default MovieDetailScreen