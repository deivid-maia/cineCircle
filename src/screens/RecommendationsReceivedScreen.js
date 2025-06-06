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
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRecommendations } from '../contexts/RecommendationsContext';

const RecommendationsReceivedScreen = ({ navigation }) => {
  const { 
    receivedRecommendations, 
    respondToRecommendation, 
    markAsViewed, 
    deleteRecommendation,
    loadReceivedRecommendations,
    loading 
  } = useRecommendations();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, viewed, responded
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    loadReceivedRecommendations();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReceivedRecommendations();
    setRefreshing(false);
  };

  const getFilteredRecommendations = () => {
    switch (filter) {
      case 'pending':
        return receivedRecommendations.filter(r => r.status === 'pending');
      case 'viewed':
        return receivedRecommendations.filter(r => r.status === 'viewed');
      case 'responded':
        return receivedRecommendations.filter(r => ['accepted', 'declined'].includes(r.status));
      default:
        return receivedRecommendations;
    }
  };

  const handleMarkAsViewed = async (recommendationId) => {
    try {
      await markAsViewed(recommendationId);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível marcar como vista');
    }
  };

  const handleRespond = (recommendation, response) => {
    setSelectedRecommendation({ ...recommendation, response });
    setResponseMessage('');
    setModalVisible(true);
  };

  const handleSendResponse = async () => {
    if (!selectedRecommendation) return;

    setResponding(true);
    try {
      const result = await respondToRecommendation(
        selectedRecommendation.id,
        selectedRecommendation.response,
        responseMessage.trim()
      );

      if (result.success) {
        setModalVisible(false);
        const action = selectedRecommendation.response === 'accepted' ? 'aceita' : 'rejeitada';
        Alert.alert('Sucesso!', `Recomendação ${action} com sucesso`);
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível enviar resposta');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado');
    } finally {
      setResponding(false);
    }
  };

  const handleDeleteRecommendation = (recommendation) => {
    Alert.alert(
      'Excluir Recomendação',
      `Deseja excluir a recomendação de "${recommendation.movie.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecommendation(recommendation.id, false);
              Alert.alert('Sucesso', 'Recomendação excluída');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a recomendação');
            }
          }
        }
      ]
    );
  };

  const formatDate = (date) => {
    if (!date) return 'Data inválida';
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'viewed': return '#3B82F6';
      case 'accepted': return '#10B981';
      case 'declined': return '#EF4444';
      default: return '#9CA3AF';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Nova';
      case 'viewed': return 'Vista';
      case 'accepted': return 'Aceita';
      case 'declined': return 'Rejeitada';
      default: return status;
    }
  };

  const renderFilterButton = (filterKey, label, count) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === filterKey && styles.activeFilterButton
      ]}
      onPress={() => setFilter(filterKey)}
    >
      <Text style={[
        styles.filterButtonText,
        filter === filterKey && styles.activeFilterButtonText
      ]}>
        {label}
      </Text>
      {count > 0 && (
        <View style={styles.filterBadge}>
          <Text style={styles.filterBadgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderRecommendationItem = ({ item }) => (
    <View style={styles.recommendationCard}>
      {/* Header com info do remetente */}
      <View style={styles.senderInfo}>
        <Image
          source={{ 
            uri: item.fromUser?.photoURL || 
                 `https://ui-avatars.com/api/?name=${encodeURIComponent(item.fromUser?.displayName || 'User')}&background=BD0DC0&color=fff`
          }}
          style={styles.senderAvatar}
        />
        <View style={styles.senderDetails}>
          <Text style={styles.senderName}>{item.fromUser?.displayName || 'Amigo'}</Text>
          <Text style={styles.recommendationDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      {/* Informações do filme */}
      <TouchableOpacity
        style={styles.movieSection}
        onPress={() => {
          handleMarkAsViewed(item.id);
          navigation.navigate('Detalhes', { movieId: item.movieId });
        }}
      >
        <Image
          source={{
            uri: item.movie?.posterPath
              ? `https://image.tmdb.org/t/p/w200${item.movie.posterPath}`
              : 'https://via.placeholder.com/200x300/27272A/9CA3AF?text=Sem+Poster'
          }}
          style={styles.moviePoster}
        />
        <View style={styles.movieInfo}>
          <Text style={styles.movieTitle}>{item.movie?.title || 'Filme'}</Text>
          <Text style={styles.movieYear}>
            {item.movie?.releaseDate ? item.movie.releaseDate.substring(0, 4) : 'N/A'}
          </Text>
          {item.movie?.voteAverage > 0 && (
            <View style={styles.ratingContainer}>
              <Feather name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{item.movie.voteAverage.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Mensagem da recomendação */}
      {item.message && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>"{item.message}"</Text>
        </View>
      )}

      {/* Resposta do usuário (se houver) */}
      {item.responseMessage && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseLabel}>Sua resposta:</Text>
          <Text style={styles.responseText}>"{item.responseMessage}"</Text>
        </View>
      )}

      {/* Ações */}
      <View style={styles.actionsContainer}>
        {item.status === 'pending' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleRespond(item, 'accepted')}
            >
              <Feather name="check" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Aceitar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => handleRespond(item, 'declined')}
            >
              <Feather name="x" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Rejeitar</Text>
            </TouchableOpacity>
          </>
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => {
            handleMarkAsViewed(item.id);
            navigation.navigate('Detalhes', { movieId: item.movieId });
          }}
        >
          <Feather name="eye" size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Ver Filme</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => handleDeleteRecommendation(item)}
        >
          <Feather name="more-horizontal" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredRecommendations = getFilteredRecommendations();
  const pendingCount = receivedRecommendations.filter(r => r.status === 'pending').length;
  const viewedCount = receivedRecommendations.filter(r => r.status === 'viewed').length;
  const respondedCount = receivedRecommendations.filter(r => ['accepted', 'declined'].includes(r.status)).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Recomendações</Text>
          <Text style={styles.headerSubtitle}>Recebidas</Text>
        </View>
        <TouchableOpacity onPress={onRefresh}>
          <Feather name="refresh-cw" size={20} color="#BD0DC0" />
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {renderFilterButton('all', 'Todas', receivedRecommendations.length)}
        {renderFilterButton('pending', 'Novas', pendingCount)}
        {renderFilterButton('viewed', 'Vistas', viewedCount)}
        {renderFilterButton('responded', 'Respondidas', respondedCount)}
      </ScrollView>

      {/* Lista de recomendações */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#BD0DC0" />
          <Text style={styles.loadingText}>Carregando recomendações...</Text>
        </View>
      ) : filteredRecommendations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="mail" size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>
            {filter === 'all' ? 'Nenhuma recomendação' : `Nenhuma recomendação ${filter === 'pending' ? 'nova' : filter === 'viewed' ? 'vista' : 'respondida'}`}
          </Text>
          <Text style={styles.emptyText}>
            {filter === 'all' 
              ? 'Quando seus amigos recomendarem filmes, eles aparecerão aqui'
              : 'Tente alterar o filtro para ver outras recomendações'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecommendations}
          renderItem={renderRecommendationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
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

      {/* Modal de Resposta */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedRecommendation?.response === 'accepted' ? 'Aceitar Recomendação' : 'Rejeitar Recomendação'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalQuestion}>
                {selectedRecommendation?.response === 'accepted' 
                  ? 'Deseja adicionar uma mensagem de agradecimento?'
                  : 'Deseja explicar por que está rejeitando?'
                }
              </Text>
              
              <TextInput
                style={styles.responseInput}
                placeholder={
                  selectedRecommendation?.response === 'accepted'
                    ? 'Obrigado pela recomendação!'
                    : 'Não é meu tipo de filme...'
                }
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                value={responseMessage}
                onChangeText={setResponseMessage}
                maxLength={200}
              />
              <Text style={styles.charCount}>{responseMessage.length}/200</Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelModalButton]}
                  onPress={() => setModalVisible(false)}
                  disabled={responding}
                >
                  <Text style={styles.cancelModalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    selectedRecommendation?.response === 'accepted' ? styles.acceptModalButton : styles.declineModalButton
                  ]}
                  onPress={handleSendResponse}
                  disabled={responding}
                >
                  {responding ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.actionModalButtonText}>
                      {selectedRecommendation?.response === 'accepted' ? 'Aceitar' : 'Rejeitar'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  backButton: {
    padding: 4,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  filtersContainer: {
    paddingVertical: 16,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#27272A',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeFilterButton: {
    backgroundColor: 'rgba(189, 13, 192, 0.15)',
    borderColor: '#BD0DC0',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#BD0DC0',
  },
  filterBadge: {
    backgroundColor: '#BD0DC0',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  recommendationCard: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  senderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  senderDetails: {
    flex: 1,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recommendationDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  movieSection: {
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
    justifyContent: 'center',
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
  },
  rating: {
    color: '#FFD700',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  messageContainer: {
    backgroundColor: '#18181B',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#BD0DC0',
  },
  messageText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  responseContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  responseLabel: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  responseText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  declineButton: {
    backgroundColor: '#EF4444',
  },
  viewButton: {
    backgroundColor: '#BD0DC0',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  moreButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#18181B',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
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
  modalQuestion: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  responseInput: {
    backgroundColor: '#27272A',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    textAlignVertical: 'top',
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#3F3F46',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelModalButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  cancelModalButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptModalButton: {
    backgroundColor: '#10B981',
  },
  declineModalButton: {
    backgroundColor: '#EF4444',
  },
  actionModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RecommendationsReceivedScreen;