import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFriends } from '../contexts/FriendsContext';
import { useAuth } from '../contexts/AuthContext';

const FriendsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const {
    friends,
    suggestedFriends,
    friendRequests,
    searchResults,
    loading,
    stats,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    refreshData,
    clearSearchResults
  } = useFriends();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('sugeridos');
  const [refreshing, setRefreshing] = useState(false);

  // Buscar usuários quando o texto de busca mudar
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        await searchUsers(searchQuery);
      } else {
        clearSearchResults();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Função de refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // Função para enviar solicitação
  const handleSendRequest = async (targetUserId, targetName) => {
    try {
      const result = await sendFriendRequest(targetUserId);

      if (result.success) {
        Alert.alert('Sucesso!', `Solicitação enviada para ${targetName}`);
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível enviar a solicitação');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado');
    }
  };

  // Função para aceitar solicitação
  const handleAcceptRequest = async (requestId, senderName) => {
    try {
      const result = await acceptFriendRequest(requestId);

      if (result.success) {
        Alert.alert('Sucesso!', `Agora você e ${senderName} são amigos!`);
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível aceitar a solicitação');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado');
    }
  };

  // Função para rejeitar solicitação
  const handleRejectRequest = async (requestId, senderName) => {
    Alert.alert(
      'Rejeitar solicitação',
      `Deseja rejeitar a solicitação de ${senderName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rejeitar',
          style: 'destructive',
          onPress: async () => {
            const result = await rejectFriendRequest(requestId);
            if (result.success) {
              Alert.alert('Solicitação rejeitada');
            }
          }
        }
      ]
    );
  };

  // Função para remover amigo
  const handleRemoveFriend = async (friendId, friendName) => {
    Alert.alert(
      'Remover amigo',
      `Deseja remover ${friendName} da sua lista de amigos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            const result = await removeFriend(friendId);
            if (result.success) {
              Alert.alert('Amigo removido');
            }
          }
        }
      ]
    );
  };

  // 🔥 FUNÇÃO AUXILIAR PARA FORMATAR DATA SEGURA
  const formatDateSafely = (date) => {
    try {
      if (!date) return 'Recente';

      // Se é um objeto Date válido
      if (date instanceof Date && !isNaN(date.getTime())) {
        return date.toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      // Se tem método toDate (Timestamp do Firestore)
      if (date.toDate && typeof date.toDate === 'function') {
        return date.toDate().toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      // Tentar converter de string
      if (typeof date === 'string') {
        const converted = new Date(date);
        if (!isNaN(converted.getTime())) {
          return converted.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      }

      // Fallback
      return 'Recente';
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Recente';
    }
  };

  // Função para gerar avatar padrão
  const getDefaultAvatar = (name, email) => {
    const displayName = name || (email ? email.split('@')[0] : 'Usuario');
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=BD0DC0&color=fff`;
  };

  // Renderizar item de usuário sugerido
  const renderSuggestedItem = ({ item }) => (
    <View style={styles.friendCard}>
      <View style={styles.friendCardHeader}>
        <View style={styles.friendInfo}>
          <Image
            source={{
              uri: item.photoURL || getDefaultAvatar(item.displayName, item.email)
            }}
            style={styles.avatar}
          />
          <View style={styles.friendDetails}>
            <Text style={styles.friendName}>
              {item.displayName || (item.email ? item.email.split('@')[0] : 'Usuário')}
            </Text>
            <Text style={styles.friendUsername}>
              @{item.email ? item.email.split('@')[0] : 'usuario'}
            </Text>
            <View style={styles.friendStats}>
              <View style={styles.statItem}>
                <Feather name="users" size={12} color="#9CA3AF" />
                <Text style={styles.statText}>{item.mutualFriends || 0} amigos</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.connectButton}
          onPress={() => handleSendRequest(item.uid, item.displayName || item.email || 'Usuário')}
          disabled={loading}
        >
          <Feather name="user-plus" size={16} color="white" style={styles.connectIcon} />
          <Text style={styles.connectText}>Conectar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Renderizar item de amigo
  // Renderizar item de amigo
  const renderFriendItem = ({ item }) => (
    <View style={styles.friendCard}>
      {/* Área clicável para ir ao perfil */}
      <TouchableOpacity
        style={styles.friendCardMain}
        onPress={() => navigation.navigate('FriendProfile', {
          friend: item
        })}
      >
        <View style={styles.friendInfo}>
          <Image
            source={{
              uri: item.photoURL || getDefaultAvatar(item.displayName, item.email)
            }}
            style={[styles.avatar, styles.avatarWithBorder]}
          />
          <View style={styles.friendDetails}>
            <Text style={styles.friendName}>
              {item.displayName || (item.email ? item.email.split('@')[0] : 'Usuário')}
            </Text>
            <Text style={styles.friendUsername}>
              @{item.email ? item.email.split('@')[0] : 'usuario'}
            </Text>
            {item.friendsSince && (
              <Text style={styles.friendsSince}>
                Amigos desde {formatDateSafely(item.friendsSince)}
              </Text>
            )}
          </View>
        </View>

        {/* Ícone de seta indicando que é clicável */}
        <Feather name="chevron-right" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Botão de menu (não clicável junto com o card) */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => showFriendMenu(item)}
      >
        <Feather name="more-vertical" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );

  // Função para mostrar menu do amigo
  const showFriendMenu = (friend) => {
    Alert.alert(
      friend.displayName || friend.email || 'Amigo',
      'O que você gostaria de fazer?',
      [
        {
          text: 'Ver Perfil',
          onPress: () => navigation.navigate('FriendProfile', { friend })
        },
        {
          text: 'Remover Amigo',
          style: 'destructive',
          onPress: () => handleRemoveFriend(friend.uid, friend.displayName || friend.email || 'Usuário')
        },
        {
          text: 'Cancelar',
          style: 'cancel'
        }
      ]
    );
  };
  // const renderFriendItem = ({ item }) => (
  //   <View style={styles.friendCard}>
  //     <View style={styles.friendCardHeader}>
  //       <View style={styles.friendInfo}>
  //         <Image
  //           source={{
  //             uri: item.photoURL || getDefaultAvatar(item.displayName, item.email)
  //           }}
  //           style={[styles.avatar, styles.avatarWithBorder]}
  //         />
  //         <View style={styles.friendDetails}>
  //           <Text style={styles.friendName}>
  //             {item.displayName || (item.email ? item.email.split('@')[0] : 'Usuário')}
  //           </Text>
  //           <Text style={styles.friendUsername}>
  //             @{item.email ? item.email.split('@')[0] : 'usuario'}
  //           </Text>
  //           {item.friendsSince && (
  //             <Text style={styles.friendsSince}>
  //               Amigos desde {formatDateSafely(item.friendsSince)}
  //             </Text>
  //           )}
  //         </View>
  //         <TouchableOpacity
  //           style={styles.friendCard}
  //           onPress={() => navigation.navigate('FriendProfile', {
  //             friend: item,
  //             friendId: item.uid
  //           })}
  //         ></TouchableOpacity>
  //       </View>

  //       <TouchableOpacity
  //         onPress={() => handleRemoveFriend(item.uid, item.displayName || item.email || 'Usuário')}
  //       >
  //         <Feather name="more-vertical" size={20} color="#9CA3AF" />
  //       </TouchableOpacity>
  //     </View>
  //   </View>
  // );

  // 🔥 RENDERIZAR SOLICITAÇÃO COM FORMATAÇÃO SEGURA DE DATA
  const renderRequestItem = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.friendInfo}>
        <Image
          source={{
            uri: item.senderAvatar || getDefaultAvatar(item.senderName, null)
          }}
          style={styles.avatar}
        />
        <View style={styles.friendDetails}>
          <Text style={styles.friendName}>{item.senderName}</Text>
          <Text style={styles.requestTime}>
            {formatDateSafely(item.createdAt)}
          </Text>
          {item.message && (
            <Text style={styles.requestMessage}>{item.message}</Text>
          )}
        </View>
      </View>

      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.requestButton, styles.acceptButton]}
          onPress={() => handleAcceptRequest(item.id, item.senderName)}
          disabled={loading}
        >
          <Feather name="check" size={16} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.requestButton, styles.rejectButton]}
          onPress={() => handleRejectRequest(item.id, item.senderName)}
          disabled={loading}
        >
          <Feather name="x" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Renderizar resultados de busca
  const renderSearchItem = ({ item }) => (
    <View style={styles.friendCard}>
      <View style={styles.friendCardHeader}>
        <View style={styles.friendInfo}>
          <Image
            source={{
              uri: item.photoURL || getDefaultAvatar(item.displayName, item.email)
            }}
            style={styles.avatar}
          />
          <View style={styles.friendDetails}>
            <Text style={styles.friendName}>
              {item.displayName || (item.email ? item.email.split('@')[0] : 'Usuário')}
            </Text>
            <Text style={styles.friendUsername}>
              @{item.email ? item.email.split('@')[0] : 'usuario'}
            </Text>
            {item.bio && (
              <Text style={styles.userBio} numberOfLines={1}>{item.bio}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.connectButton}
          onPress={() => handleSendRequest(item.uid, item.displayName || item.email || 'Usuário')}
          disabled={loading}
        >
          <Feather name="user-plus" size={16} color="white" style={styles.connectIcon} />
          <Text style={styles.connectText}>Conectar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Obter dados da aba atual
  const getCurrentTabData = () => {
    if (searchQuery.length > 2) {
      return searchResults;
    }

    switch (activeTab) {
      case 'sugeridos':
        return suggestedFriends;
      case 'amigos':
        return friends;
      case 'solicitacoes':
        return friendRequests;
      default:
        return [];
    }
  };

  // Obter função de renderização da aba atual
  const getCurrentRenderFunction = () => {
    if (searchQuery.length > 2) {
      return renderSearchItem;
    }

    switch (activeTab) {
      case 'sugeridos':
        return renderSuggestedItem;
      case 'amigos':
        return renderFriendItem;
      case 'solicitacoes':
        return renderRequestItem;
      default:
        return renderSuggestedItem;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Amigos</Text>
        <View style={styles.headerStats}>
          <Text style={styles.statsText}>
            {stats.totalFriends} amigos
          </Text>
          {stats.pendingRequests > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>{stats.pendingRequests}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Barra de pesquisa */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar pessoas por nome ou email"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Abas */}
      {searchQuery.length <= 2 && (
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sugeridos' && styles.activeTab]}
            onPress={() => setActiveTab('sugeridos')}
          >
            <Text style={[styles.tabText, activeTab === 'sugeridos' && styles.activeTabText]}>
              Sugeridos
            </Text>
            <Text style={styles.tabCount}>({suggestedFriends.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'amigos' && styles.activeTab]}
            onPress={() => setActiveTab('amigos')}
          >
            <Text style={[styles.tabText, activeTab === 'amigos' && styles.activeTabText]}>
              Meus Amigos
            </Text>
            <Text style={styles.tabCount}>({friends.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'solicitacoes' && styles.activeTab]}
            onPress={() => setActiveTab('solicitacoes')}
          >
            <Text style={[styles.tabText, activeTab === 'solicitacoes' && styles.activeTabText]}>
              Solicitações
            </Text>
            {friendRequests.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{friendRequests.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Lista */}
      <FlatList
        data={getCurrentTabData()}
        keyExtractor={(item) => item.id || item.uid}
        renderItem={getCurrentRenderFunction()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#BD0DC0"
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Feather
              name={
                searchQuery.length > 2
                  ? "search"
                  : activeTab === 'amigos'
                    ? "users"
                    : activeTab === 'solicitacoes'
                      ? "mail"
                      : "user-plus"
              }
              size={48}
              color="#9CA3AF"
            />
            <Text style={styles.emptyTitle}>
              {searchQuery.length > 2
                ? 'Nenhum usuário encontrado'
                : activeTab === 'amigos'
                  ? 'Nenhum amigo ainda'
                  : activeTab === 'solicitacoes'
                    ? 'Nenhuma solicitação'
                    : 'Nenhuma sugestão'
              }
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery.length > 2
                ? `Não encontramos ninguém com "${searchQuery}"`
                : activeTab === 'amigos'
                  ? 'Quando você adicionar amigos, eles aparecerão aqui'
                  : activeTab === 'solicitacoes'
                    ? 'Solicitações de amizade aparecerão aqui'
                    : 'Conecte-se com pessoas que você conhece'
              }
            </Text>
          </View>
        )}
        ListHeaderComponent={() => (
          <Text style={styles.listHeader}>
            {searchQuery.length > 2
              ? `Resultados para "${searchQuery}"`
              : activeTab === 'sugeridos'
                ? 'Pessoas que você pode conhecer'
                : activeTab === 'amigos'
                  ? 'Seus amigos no CineCircle'
                  : 'Solicitações pendentes'
            }
          </Text>
        )}
      />

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#BD0DC0" />
        </View>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginRight: 8,
  },
  notificationBadge: {
    backgroundColor: '#BD0DC0',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
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
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#BD0DC0',
  },
  tabText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginRight: 4,
  },
  activeTabText: {
    color: '#BD0DC0',
    fontWeight: '500',
  },
  tabCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  tabBadge: {
    backgroundColor: '#BD0DC0',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  listHeader: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  friendCard: {
    backgroundColor: '#27272A',
    borderRadius: 12,
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
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3A3A3D',
  },
  avatarWithBorder: {
    borderWidth: 2,
    borderColor: '#BD0DC0',
  },
  friendDetails: {
    marginLeft: 12,
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  friendUsername: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  friendsSince: {
    fontSize: 12,
    color: '#6B7280',
  },
  userBio: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  friendStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  statText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#BD0DC0',
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
    fontWeight: '500',
  },
  requestCard: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requestTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  requestMessage: {
    fontSize: 12,
    color: '#D1D5DB',
    fontStyle: 'italic',
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  requestButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(24, 24, 27, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendCard: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendCardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    padding: 8,
    marginLeft: 12,
  },
});

export default FriendsScreen;