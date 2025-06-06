import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useMovies } from '../contexts/useMovies';

const MovieActions = ({ movie, style = {}, showLabels = true, size = 'medium', onRecommend }) => {

  console.log('MovieActions renderizando');

  const {
    addMovieToList,
    removeMovieFromList,
    isMovieInList,
    loading
  } = useMovies();

  const [movieStatus, setMovieStatus] = useState({
    watched: false,
    favorites: false,
    watchlist: false,
    recommendations: false // Adicionado
  });
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); // 'watched', 'review'
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [updating, setUpdating] = useState(false);

  // Verificar status do filme ao carregar
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
          watchlist: watchlistResult.success && watchlistResult.exists,
          recommendations: false // Por enquanto sempre false, pode ser implementado depois
        });

        // Se já assistiu, carregar rating e review existentes
        if (watchedResult.success && watchedResult.exists && watchedResult.data) {
          setRating(watchedResult.data.rating || 0);
          setReview(watchedResult.data.review || '');
        }
      } catch (error) {
        console.error('Erro ao verificar status do filme:', error);
      }
    };

    checkMovieStatus();
  }, [movie?.id, isMovieInList]);

  // Tamanhos dos botões
  const sizes = {
    small: { icon: 16, padding: 8, fontSize: 12 },
    medium: { icon: 20, padding: 12, fontSize: 14 },
    large: { icon: 24, padding: 16, fontSize: 16 }
  };

  const currentSize = sizes[size] || sizes.medium;

  // Adicionar/remover da lista de assistidos
  const handleWatchedToggle = async () => {
    if (movieStatus.watched) {
      // Se já assistiu, mostrar modal para editar review
      setModalType('review');
      setModalVisible(true);
    } else {
      // Primeiro vez assistindo - mostrar modal para avaliar
      setModalType('watched');
      setRating(0);
      setReview('');
      setModalVisible(true);
    }
  };

  // Adicionar/remover dos favoritos
  const handleFavoritesToggle = async () => {
    setUpdating(true);
    try {
      if (movieStatus.favorites) {
        const result = await removeMovieFromList(movie.id, 'favorites');
        if (result.success) {
          setMovieStatus(prev => ({ ...prev, favorites: false }));
        } else {
          Alert.alert('Erro', result.error);
        }
      } else {
        const result = await addMovieToList(movie, 'favorites');
        if (result.success) {
          setMovieStatus(prev => ({ ...prev, favorites: true }));
        } else {
          Alert.alert('Erro', result.error);
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado');
    } finally {
      setUpdating(false);
    }
  };

  // Adicionar/remover da watchlist
  const handleWatchlistToggle = async () => {
    setUpdating(true);
    try {
      if (movieStatus.watchlist) {
        const result = await removeMovieFromList(movie.id, 'watchlist');
        if (result.success) {
          setMovieStatus(prev => ({ ...prev, watchlist: false }));
        } else {
          Alert.alert('Erro', result.error);
        }
      } else {
        const result = await addMovieToList(movie, 'watchlist');
        if (result.success) {
          setMovieStatus(prev => ({ ...prev, watchlist: true }));
        } else {
          Alert.alert('Erro', result.error);
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado');
    } finally {
      setUpdating(false);
    }
  };

  // Função para recomendar filme
  const handleRecommendToggle = () => {
    if (onRecommend) {
      onRecommend(movie);
    } else {
      Alert.alert('Recomendar', 'Funcionalidade de recomendação em desenvolvimento');
    }
  };

  // Salvar avaliação
  const handleSaveReview = async () => {
    if (rating === 0) {
      Alert.alert('Avaliação obrigatória', 'Por favor, avalie o filme com estrelas.');
      return;
    }

    setUpdating(true);
    try {
      const result = await addMovieToList(movie, 'watched', rating, review);
      if (result.success) {
        setMovieStatus(prev => ({ ...prev, watched: true }));
        setModalVisible(false);
        Alert.alert('Sucesso!', 'Filme marcado como assistido!');
      } else {
        Alert.alert('Erro', result.error);
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado');
    } finally {
      setUpdating(false);
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

  if (!movie) return null;

  return (
    <View style={[styles.container, style]}>
      {/* Primeira linha - 3 botões principais */}
      <View style={styles.actionRow}>
        {/* Botão Watchlist */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            { padding: currentSize.padding },
            movieStatus.watchlist && styles.activeButton
          ]}
          onPress={handleWatchlistToggle}
          disabled={loading || updating}
        >
          {updating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Feather
                name="bookmark"
                size={currentSize.icon}
                color={movieStatus.watchlist ? "#BD0DC0" : "#FFFFFF"}
              />
              {showLabels && (
                <Text style={[
                  styles.buttonText,
                  { fontSize: currentSize.fontSize },
                  movieStatus.watchlist && styles.activeButtonText
                ]}>
                  {movieStatus.watchlist ? 'Na Lista' : 'Quero Ver'}
                </Text>
              )}
            </>
          )}
        </TouchableOpacity>

        {/* Botão Assistido */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            { padding: currentSize.padding },
            movieStatus.watched && styles.activeButton
          ]}
          onPress={handleWatchedToggle}
          disabled={loading || updating}
        >
          <Feather
            name="check-circle"
            size={currentSize.icon}
            color={movieStatus.watched ? "#BD0DC0" : "#FFFFFF"}
          />
          {showLabels && (
            <Text style={[
              styles.buttonText,
              { fontSize: currentSize.fontSize },
              movieStatus.watched && styles.activeButtonText
            ]}>
              {movieStatus.watched ? 'Assistido' : 'Marcar'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Botão Favoritos */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            { padding: currentSize.padding },
            movieStatus.favorites && styles.activeButton
          ]}
          onPress={handleFavoritesToggle}
          disabled={loading || updating}
        >
          <Feather
            name="heart"
            size={currentSize.icon}
            color={movieStatus.favorites ? "#BD0DC0" : "#FFFFFF"}
          />
          {showLabels && (
            <Text style={[
              styles.buttonText,
              { fontSize: currentSize.fontSize },
              movieStatus.favorites && styles.activeButtonText
            ]}>
              {movieStatus.favorites ? 'Favorito' : 'Favoritar'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Segunda linha - Botão Recomendar (largura total) */}
      <View style={styles.recommendRow}>
        <TouchableOpacity
          style={[
            styles.recommendButton,
            { padding: currentSize.padding },
            movieStatus.recommendations && styles.activeRecommendButton
          ]}
          onPress={handleRecommendToggle}
          disabled={loading || updating}
        >
          <Feather
            name="send"
            size={currentSize.icon}
            color={movieStatus.recommendations ? "#007AFF" : "#FFFFFF"}
          />
          {showLabels && (
            <Text style={[
              styles.recommendButtonText,
              { fontSize: currentSize.fontSize },
              movieStatus.recommendations && styles.activeRecommendButtonText
            ]}>
              {movieStatus.recommendations ? 'Filme Recomendado' : 'Recomendar para Amigos'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal para Avaliação/Review */}
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
                {modalType === 'watched' ? 'Avaliar Filme' : 'Editar Avaliação'}
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
                  disabled={updating || rating === 0}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {modalType === 'watched' ? 'Salvar Avaliação' : 'Atualizar'}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                  disabled={updating}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  recommendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27272A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    flex: 1,
  },
  activeButton: {
    backgroundColor: 'rgba(189, 13, 192, 0.15)',
    borderColor: '#BD0DC0',
  },
  recommendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  activeRecommendButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.25)',
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontWeight: '500',
    textAlign: 'center',
    fontSize: 12,
  },
  activeButtonText: {
    color: '#BD0DC0',
  },
  recommendButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
  activeRecommendButtonText: {
    color: '#007AFF',
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
  ratingText: {
    fontSize: 14,
    color: '#FFD700',
    textAlign: 'center',
    fontWeight: '500',
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

export default MovieActions;