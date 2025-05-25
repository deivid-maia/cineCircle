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
  Dimensions
} from 'react-native';

import { useMovies } from '../contexts/useMovies';
import { Feather } from '@expo/vector-icons';
import { getMovieDetails } from '../services/api';

const { width } = Dimensions.get('window');

const MovieDetailScreen = ({ route, navigation }) => {
  const { movieId } = route.params;
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  // Adicionar estas funções dentro do componente:
  const handleWatchlist = async () => {
    try {
      if (movieStatus.watchlist) {
        const result = await removeMovieFromList(movie.id, 'watchlist');
        if (result.success) {
          setMovieStatus(prev => ({ ...prev, watchlist: false }));
        }
      } else {
        const result = await addMovieToList(movie, 'watchlist');
        if (result.success) {
          setMovieStatus(prev => ({ ...prev, watchlist: true }));
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar watchlist:', error);
    }
  };

  const handleFavorites = async () => {
    try {
      if (movieStatus.favorites) {
        const result = await removeMovieFromList(movie.id, 'favorites');
        if (result.success) {
          setMovieStatus(prev => ({ ...prev, favorites: false }));
        }
      } else {
        const result = await addMovieToList(movie, 'favorites');
        if (result.success) {
          setMovieStatus(prev => ({ ...prev, favorites: true }));
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar favoritos:', error);
    }
  };

  const handleWatched = async () => {
    // Para assistidos, podemos abrir um modal simples ou usar rating padrão
    try {
      if (movieStatus.watched) {
        const result = await removeMovieFromList(movie.id, 'watched');
        if (result.success) {
          setMovieStatus(prev => ({ ...prev, watched: false }));
        }
      } else {
        // Adicionar com rating padrão de 3 estrelas (pode melhorar depois)
        const result = await addMovieToList(movie, 'watched', 3, null);
        if (result.success) {
          setMovieStatus(prev => ({ ...prev, watched: true }));
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar assistidos:', error);
    }
  };

  const {
    addMovieToList,
    removeMovieFromList,
    isMovieInList,
    loading: moviesLoading
  } = useMovies();

  const [movieStatus, setMovieStatus] = useState({
    watched: false,
    favorites: false,
    watchlist: false
  });

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

  useEffect(() => {
    const checkMovieStatus = async () => {
      if (!movie?.id) return;

      try {
        const [watchedResult, favoritesResult, watchlistResult] = await Promise.all([
          isMovieInList(movie.id, 'watched'),
          isMovieInList(movie.id, 'favorites'),
          isMovieInList(movie.id, 'watchlist')
        ]);

        setMovieStatus({
          watched: watchedResult.success && watchedResult.exists,
          favorites: favoritesResult.success && favoritesResult.exists,
          watchlist: watchlistResult.success && watchlistResult.exists
        });
      } catch (error) {
        console.error('Erro ao verificar status do filme:', error);
      }
    };

    if (movie) {
      checkMovieStatus();
    }
  }, [movie, isMovieInList]);

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
        {/* <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity> */}
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Botão Voltar */}
      {/* <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Feather name="arrow-left" size={24} color="white" />
      </TouchableOpacity> */}

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

          {/* Botões de Ação */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                movieStatus.watchlist && styles.activeActionButton
              ]}
              onPress={handleWatchlist}
              disabled={moviesLoading}
            >
              <Feather
                name="bookmark"
                size={20}
                color={movieStatus.watchlist ? "#BD0DC0" : "white"}
              />
              <Text style={[
                styles.actionButtonText,
                movieStatus.watchlist && styles.activeActionButtonText
              ]}>
                {movieStatus.watchlist ? "Na Lista" : "Quero ver"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                movieStatus.watched && styles.activeActionButton
              ]}
              onPress={handleWatched}
              disabled={moviesLoading}
            >
              <Feather
                name="check-circle"
                size={20}
                color={movieStatus.watched ? "#BD0DC0" : "white"}
              />
              <Text style={[
                styles.actionButtonText,
                movieStatus.watched && styles.activeActionButtonText
              ]}>
                {movieStatus.watched ? "Assistido" : "Já vi"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.recommendButton,
                movieStatus.favorites && styles.activeActionButton
              ]}
              onPress={handleFavorites}
              disabled={moviesLoading}
            >
              <Feather
                name="heart"
                size={20}
                color={movieStatus.favorites ? "#BD0DC0" : "white"}
              />
              <Text style={[
                styles.actionButtonText,
                movieStatus.favorites && styles.activeActionButtonText
              ]}>
                {movieStatus.favorites ? "Favorito" : "Favoritar"}
              </Text>
            </TouchableOpacity>
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
    position: 'absolute',
    top: 10,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  backButtonText: {
    color: '#19A1BE',
    fontSize: 16,
    fontWeight: '500',
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
    backgroundColor: 'transparent',
    backgroundGradient: 'linear',
    backgroundGradientFrom: 'rgba(24, 24, 27, 0)',
    backgroundGradientTo: '#18181B',
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
  },
  recommendButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#19A1BE',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 6,
  },
  
  activeActionButton: {
    backgroundColor: 'rgba(189, 13, 192, 0.15)',
    borderColor: '#BD0DC0',
  },
  activeActionButtonText: {
    color: '#BD0DC0',
  },
});

export default MovieDetailScreen;