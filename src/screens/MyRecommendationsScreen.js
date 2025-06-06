// src/screens/recommendations/MyRecommendationsScreen.js
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RecommendationsContext } from '../../contexts/RecommendationsContext';
import { AuthContext } from '../../contexts/AuthContext';
import MovieCard from '../../components/MovieCard';

const MyRecommendationsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { getSentRecommendations, deleteRecommendation } = useContext(RecommendationsContext);
  
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const sent = await getSentRecommendations(user.id);
      setRecommendations(sent);
    } catch (error) {
      console.error('Erro ao carregar recomendações enviadas:', error);
      Alert.alert('Erro', 'Não foi possível carregar suas recomendações');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadRecommendations();
  };

  const handleMoviePress = (movie) => {
    navigation.navigate('MovieDetail', { movie });
  };

  const handleDeleteRecommendation = (recommendationId, movieTitle, toUserName) => {
    Alert.alert(
      'Excluir Recomendação',
      `Tem certeza que deseja excluir a recomendação de "${movieTitle}" para ${toUserName}?`,
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
              await deleteRecommendation(recommendationId);
              Alert.alert('Sucesso', 'Recomendação excluída com sucesso!');
              loadRecommendations();
            } catch (error) {
              console.error('Erro ao excluir recomendação:', error);
              Alert.alert('Erro', 'Não foi possível excluir a recomendação');
            }
          }
        }
      ]
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'liked': return '👍';
      case 'watched': return '⭐';
      case 'added_to_list': return '📋';
      case 'not_interested': return '❌';
      case 'read': return '👁️';
      default: return '📤';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'liked': return 'Amigo gostou';
      case 'watched': return 'Já assistiu';
      case 'added_to_list': return 'Adicionou à lista';
      case 'not_interested': return 'Sem interesse';
      case 'read': return 'Visualizada';
      default: return 'Enviada';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'liked': return '#4CAF50';
      case 'watched': return '#FF9800';
      case 'added_to_list': return '#2196F3';
      case 'not_interested': return '#F44336';
      case 'read': return '#9E9E9E';
      default: return '#666';
    }
  };

  const renderRecommendation = ({ item }) => (
    <View style={styles.recommendationCard}>
      {/* Header da recomendação */}
      <View style={styles.recommendationHeader}>
        <View style={styles.userInfo}>
          <Icon name="person" size={20} color="#666" />
          <Text style={styles.userName}>Para: {item.toUserName}</Text>
          <Text style={styles.recommendDate}>
            {new Date(item.createdAt).toLocaleDateString('pt-BR')}
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={() => handleDeleteRecommendation(item.id, item.movieTitle, item.toUserName)}
          style={styles.deleteButton}
        >
          <Icon name="delete" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>

      {/* Status da recomendação */}
      <View style={[styles.statusContainer, { backgroundColor: getStatusColor(item.status) + '20' }]}>
        <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {getStatusText(item.status)}
        </Text>
      </View>

      {/* Sua mensagem */}
      {item.message && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageLabel}>Sua mensagem:</Text>
          <Text style={styles.messageText}>"{item.message}"</Text>
        </View>
      )}

      {/* Card do filme */}
      <TouchableOpacity 
        onPress={() => handleMoviePress(item.movie)}
        style={styles.movieContainer}
      >
        <MovieCard movie={item.movie} />
      </TouchableOpacity>

      {/* Resposta do amigo */}
      {item.responseMessage && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseLabel}>Resposta de {item.toUserName}:</Text>
          <Text style={styles.responseText}>"{item.responseMessage}"</Text>
          <Text style={styles.responseDate}>
            {new Date(item.respondedAt).toLocaleDateString('pt-BR')} às {new Date(item.respondedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      )}

      {/* Botão de ver detalhes */}
      <TouchableOpacity
        style={styles.detailButton}
        onPress={() => handleMoviePress(item.movie)}
      >
        <Icon name="info" size={20} color="#007AFF" />
        <Text style={styles.detailButtonText}>Ver Detalhes do Filme</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="send" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>Nenhuma recomendação enviada</Text>
      <Text style={styles.emptySubtitle}>
        Comece a recomendar filmes para seus amigos! Eles aparecerão aqui.
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

  // Agrupar recomendações por status
  const groupedRecommendations = recommendations.reduce((groups, recommendation) => {
    const status = recommendation.status || 'pending';
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(recommendation);
    return groups;
  }, {});

  const renderHeader = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{recommendations.length}</Text>
        <Text style={styles.statLabel}>Total Enviadas</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
          {(groupedRecommendations.liked || []).length}
        </Text>
        <Text style={styles.statLabel}>Aprovadas</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: '#FF9800' }]}>
          {(groupedRecommendations.watched || []).length}
        </Text>
        <Text style={styles.statLabel}>Assistidas</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: '#666' }]}>
          {(groupedRecommendations.pending || []).length}
        </Text>
        <Text style={styles.statLabel}>Pendentes</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Carregando suas recomendações...</Text>
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
        <Text style={styles.headerTitle}>Minhas Recomendações</Text>
        <View style={styles.headerRight}>
          <Text style={styles.countBadge}>{recommendations.length}</Text>
        </View>
      </View>

      <FlatList
        data={recommendations}
        renderItem={renderRecommendation}
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
        ListHeaderComponent={recommendations.length > 0 ? renderHeader : null}
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
  headerRight: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  countBadge: {
    backgroundColor: '#007AFF',
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    textAlign: 'center',
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
  recommendationCard: {
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
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#000',
  },
  recommendDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  deleteButton: {
    padding: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  messageContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  messageLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  movieContainer: {
    marginBottom: 12,
  },
  responseContainer: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  responseLabel: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    color: '#1B5E20',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  responseDate: {
    fontSize: 11,
    color: '#4CAF50',
  },
  detailButton: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    justifyContent: 'center',
  },
  detailButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 14,
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

export default MyRecommendationsScreen;