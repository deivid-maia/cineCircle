import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const FriendSearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('sugeridos');
  const [loadingData, setLoadingData] = useState(false);
  
  // Dados de exemplo
  const sugeridosAmigos = [
    { id: 1, nome: 'Ana Silva', username: '@anasilva', avatar: 'https://i.pravatar.cc/150?img=1', mutual: 5, filmes: 32 },
    { id: 2, nome: 'Carlos Mendes', username: '@carlosm', avatar: 'https://i.pravatar.cc/150?img=2', mutual: 8, filmes: 47 },
    { id: 3, nome: 'Julia Costa', username: '@juliac', avatar: 'https://i.pravatar.cc/150?img=5', mutual: 3, filmes: 56 }
  ];
  
  const meusAmigos = [
    { id: 7, nome: 'Pedro Alves', username: '@pedroalves', avatar: 'https://i.pravatar.cc/150?img=8', filmes: 72, generos: ['Ação', 'Sci-Fi'] },
    { id: 8, nome: 'Mariana Dias', username: '@maridias', avatar: 'https://i.pravatar.cc/150?img=9', filmes: 93, generos: ['Drama', 'Romance'] },
    { id: 9, nome: 'Lucas Gomes', username: '@lucasg', avatar: 'https://i.pravatar.cc/150?img=12', filmes: 41, generos: ['Terror', 'Suspense'] }
  ];
  
  // Filtrar amigos com base na busca
  const filteredAmigos = searchQuery.length > 2 
    ? sugeridosAmigos.filter(amigo => 
        amigo.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        amigo.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Função para renderizar estrelas
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating / 2);
    const halfStar = rating % 2 >= 1;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Feather key={i} name="star" size={12} color="#FFD700" style={styles.starIcon} />);
      } else if (i === fullStars && halfStar) {
        stars.push(<Feather key={i} name="star" size={12} color="#FFD700" style={[styles.starIcon, { opacity: 0.5 }]} />);
      } else {
        stars.push(<Feather key={i} name="star" size={12} color="#FFD700" style={[styles.starIcon, { opacity: 0.2 }]} />);
      }
    }
    
    return <View style={{ flexDirection: 'row' }}>{stars}</View>;
  };

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#BD0DC0" />
        <Text style={styles.loadingText}>Carregando amigos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conectar Amigos</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Feather name="x" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Barra de pesquisa */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar amigos por nome ou @username"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      
      {/* Abas */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sugeridos' && styles.activeTab]}
          onPress={() => setActiveTab('sugeridos')}
        >
          <Text style={[styles.tabText, activeTab === 'sugeridos' && styles.activeTabText]}>
            Sugeridos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'meus' && styles.activeTab]}
          onPress={() => setActiveTab('meus')}
        >
          <Text style={[styles.tabText, activeTab === 'meus' && styles.activeTabText]}>
            Meus Amigos
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Conteúdo das abas */}
      <FlatList
        data={searchQuery.length > 2 ? filteredAmigos : (activeTab === 'sugeridos' ? sugeridosAmigos : meusAmigos)}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <Text style={styles.listHeader}>
            {searchQuery.length > 2 
              ? `Resultados da busca "${searchQuery}"` 
              : activeTab === 'sugeridos'
                ? 'Pessoas que você pode conhecer'
                : 'Veja os filmes que seus amigos assistem'
            }
          </Text>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Feather name="search" size={40} color="#9CA3AF" style={styles.emptyIcon} />
            <Text style={styles.emptyText}>
              Nenhum resultado encontrado para "{searchQuery}"
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.friendCard}>
            <View style={styles.friendCardHeader}>
              <View style={styles.friendInfo}>
                <Image
                  source={{ uri: item.avatar }}
                  style={[
                    styles.avatar,
                    activeTab === 'meus' && styles.avatarWithBorder
                  ]}
                />
                <View style={styles.friendDetails}>
                  <Text style={styles.friendName}>{item.nome}</Text>
                  <Text style={styles.friendUsername}>{item.username}</Text>
                  
                  {activeTab !== 'meus' && searchQuery.length <= 2 && (
                    <View style={styles.friendStats}>
                      <View style={styles.statItem}>
                        <Feather name="users" size={12} color="#9CA3AF" />
                        <Text style={styles.statText}>{item.mutual} amigos</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Feather name="calendar" size={12} color="#9CA3AF" />
                        <Text style={styles.statText}>{item.filmes} filmes</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
              
              {activeTab === 'meus' || searchQuery.length > 2 ? (
                <Feather name="chevron-right" size={20} color="#9CA3AF" />
              ) : (
                <TouchableOpacity style={styles.connectButton}>
                  <Feather name="user-plus" size={16} color="white" style={styles.connectIcon} />
                  <Text style={styles.connectText}>Conectar</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {activeTab === 'meus' && (
              <View style={styles.friendContentContainer}>
                <View style={styles.friendMovieStats}>
                  <View style={styles.movieStatItem}>
                    <Feather name="calendar" size={12} color="#9CA3AF" />
                    <Text style={styles.movieStatText}>{item.filmes} filmes assistidos</Text>
                  </View>
                  {renderStars(7)}
                </View>
                
                <View style={styles.genresContainer}>
                  {item.generos && item.generos.map((genero, idx) => (
                    <View key={idx} style={styles.genreTag}>
                      <Text style={styles.genreText}>{genero}</Text>
                    </View>
                  ))}
                </View>
                
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Feather name="bookmark" size={14} color="white" />
                    <Text style={styles.actionButtonText}>Quero ver</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.actionButton}>
                    <Feather name="check-circle" size={14} color="white" />
                    <Text style={styles.actionButtonText}>Já vi</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={[styles.actionButton, styles.recommendButton]}>
                    <Feather name="share-2" size={14} color="white" />
                    <Text style={styles.actionButtonText}>Recomendar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      />
      
      {/* Botão flutuante */}
      <TouchableOpacity style={styles.fabButton}>
        <Feather name="user-plus" size={24} color="white" />
      </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerButton: {
    padding: 4,
  },
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 46,
    color: '#FFFFFF',
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#BD0DC0',
  },
  tabText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  activeTabText: {
    color: '#BD0DC0',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Espaço para o FAB
  },
  listHeader: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    color: '#9CA3AF',
    textAlign: 'center',
  },
  friendCard: {
    backgroundColor: '#27272A',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  friendCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3A3A3D',
  },
  avatarWithBorder: {
    borderWidth: 2,
    borderColor: '#BD0DC0',
  },
  friendDetails: {
    marginLeft: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  friendUsername: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  friendStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  statText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderWidth: 1,
    borderColor: '#BD0DC0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  connectIcon: {
    marginRight: 6,
  },
  connectText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  friendContentContainer: {
    marginTop: 12,
    marginLeft: 68,
  },
  friendMovieStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  movieStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  movieStatText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  starIcon: {
    marginRight: 1,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  genreTag: {
    backgroundColor: '#18181B',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  genreText: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27272A',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  recommendButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#BD0DC0',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#BD0DC0',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default FriendSearchScreen;