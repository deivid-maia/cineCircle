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
  ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFriends } from '../contexts/FriendsContext';
import { useAuth } from '../contexts/AuthContext';
import { useMovies } from '../contexts/useMovies';
import friendsService from '../services/friendsService';

const FriendsRankingScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { friends } = useFriends();
  const { stats: myStats } = useMovies();
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('total');

  useEffect(() => {
    loadRankingData();
  }, [friends]);

  const loadRankingData = async () => {
    if (!user || friends.length === 0) {
      setLoading(false);
      return;
    }

    try {
      console.log('📊 Carregando dados de ranking para', friends.length, 'amigos');
      
      const friendsWithStats = await Promise.all(
        friends.map(async (friend) => {
          try {
            const result = await friendsService.getFriendMovies(friend.uid);
            let stats = { watched: 0, favorites: 0, watchlist: 0, ratings: 0, reviews: 0, total: 0 };
            
            if (result.success && result.movies) {
              stats = friendsService.getFriendStats(result.movies);
            }
            
            return {
              ...friend,
              stats,
              isCurrentUser: false
            };
          } catch (error) {
            console.error('Erro ao carregar stats do amigo:', friend.uid, error);
            return {
              ...friend,
              stats: { watched: 0, favorites: 0, watchlist: 0, ratings: 0, reviews: 0, total: 0 },
              isCurrentUser: false
            };
          }
        })
      );

      // Adicionar o usuário atual ao ranking
      const allUsers = [
        {
          uid: user.uid,
          displayName: user.displayName || 'Você',
          email: user.email,
          photoURL: user.photoURL,
          stats: myStats,
          isCurrentUser: true
        },
        ...friendsWithStats
      ];

      setRankingData(allUsers);
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRankingData();
    setRefreshing(false);
  };

  const getSortedRanking = () => {
    return rankingData
      .sort((a, b) => (b.stats[activeCategory] || 0) - (a.stats[activeCategory] || 0))
      .map((user, index) => ({ ...user, position: index + 1 }));
  };

  const getDefaultAvatar = (name, email) => {
    const displayName = name || (email ? email.split('@')[0] : 'Usuario');
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=BD0DC0&color=fff`;
  };

  const getRankIcon = (position) => {
    switch (position) {
      case 1: return { icon: 'award', color: '#FFD700', bg: 'rgba(255, 215, 0, 0.1)' };
      case 2: return { icon: 'award', color: '#C0C0C0', bg: 'rgba(192, 192, 192, 0.1)' };
      case 3: return { icon: 'award', color: '#CD7F32', bg: 'rgba(205, 127, 50, 0.1)' };
      default: return { icon: 'user', color: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.1)' };
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      total: 'Total de Filmes',
      watched: 'Filmes Assistidos',
      favorites: 'Filmes Favoritos',
      ratings: 'Avaliações Feitas',
      reviews: 'Resenhas Escritas',
      watchlist: 'Lista de Desejos'
    };
    return labels[category] || category;
  };

  const renderCategoryButton = (category, label, icon) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryButton,
        activeCategory === category && styles.activeCategoryButton
      ]}
      onPress={() => setActiveCategory(category)}
    >
      <Feather 
        name={icon} 
        size={16} 
        color={activeCategory === category ? '#BD0DC0' : '#9CA3AF'} 
      />
      <Text style={[
        styles.categoryButtonText,
        activeCategory === category && styles.activeCategoryButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderRankingItem = ({ item }) => {
    const rankInfo = getRankIcon(item.position);
    const statValue = item.stats[activeCategory] || 0;

    return (
      <TouchableOpacity
        style={[
          styles.rankingItem,
          item.isCurrentUser && styles.currentUserItem
        ]}
        onPress={() => {
          if (!item.isCurrentUser) {
            navigation.navigate('FriendProfile', { friend: item });
          }
        }}
        disabled={item.isCurrentUser}
      >
        {/* Posição e Avatar */}
        <View style={styles.rankingLeft}>
          <View style={[styles.positionContainer, { backgroundColor: rankInfo.bg }]}>
            {item.position <= 3 ? (
              <Feather name={rankInfo.icon} size={20} color={rankInfo.color} />
            ) : (
              <Text style={styles.positionText}>{item.position}</Text>
            )}
          </View>
          
          <Image
            source={{
              uri: item.photoURL || getDefaultAvatar(item.displayName, item.email)
            }}
            style={[
              styles.userAvatar,
              item.isCurrentUser && styles.currentUserAvatar
            ]}
          />
          
          <View style={styles.userInfo}>
            <View style={styles.userNameContainer}>
              <Text style={[
                styles.userName,
                item.isCurrentUser && styles.currentUserName
              ]}>
                {item.displayName || (item.email ? item.email.split('@')[0] : 'Usuário')}
              </Text>
              {item.isCurrentUser && (
                <View style={styles.youBadge}>
                  <Text style={styles.youBadgeText}>VOCÊ</Text>
                </View>
              )}
            </View>
            
            {item.position <= 3 && (
              <Text style={[styles.rankLabel, { color: rankInfo.color }]}>
                {item.position === 1 ? '🥇 Campeão!' : 
                 item.position === 2 ? '🥈 Vice-campeão!' : 
                 '🥉 Terceiro lugar!'}
              </Text>
            )}
          </View>
        </View>

        {/* Estatística */}
        <View style={styles.rankingRight}>
          <Text style={styles.statValue}>{statValue}</Text>
          <Text style={styles.statLabel}>
            {activeCategory === 'total' ? 'filmes' :
             activeCategory === 'watched' ? 'assistidos' :
             activeCategory === 'favorites' ? 'favoritos' :
             activeCategory === 'ratings' ? 'avaliações' :
             activeCategory === 'reviews' ? 'resenhas' :
             'na lista'}
          </Text>
        </View>

        {!item.isCurrentUser && (
          <Feather name="chevron-right" size={20} color="#9CA3AF" />
        )}
      </TouchableOpacity>
    );
  };

  const getMyPosition = () => {
    const sorted = getSortedRanking();
    const myPosition = sorted.find(user => user.isCurrentUser)?.position;
    return myPosition || '?';
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="award" size={64} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>Sem amigos para ranking</Text>
      <Text style={styles.emptyText}>
        Adicione amigos para ver o ranking competitivo e descobrir quem assiste mais filmes!
      </Text>
      <TouchableOpacity 
        style={styles.addFriendsButton}
        onPress={() => navigation.navigate('MainTabs', { screen: 'FriendsTab' })}
      >
        <Feather name="user-plus" size={20} color="#FFFFFF" />
        <Text style={styles.addFriendsText}>Adicionar Amigos</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#BD0DC0" />
        <Text style={styles.loadingText}>Calculando ranking...</Text>
      </View>
    );
  }

  const sortedRanking = getSortedRanking();

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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Ranking de Amigos</Text>
          <Text style={styles.headerSubtitle}>
            Sua posição: #{getMyPosition()} de {rankingData.length}
          </Text>
        </View>
        <TouchableOpacity onPress={onRefresh}>
          <Feather name="refresh-cw" size={24} color="#BD0DC0" />
        </TouchableOpacity>
      </View>

      {rankingData.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Categorias */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {renderCategoryButton('total', 'Total', 'film')}
            {renderCategoryButton('watched', 'Assistidos', 'eye')}
            {renderCategoryButton('favorites', 'Favoritos', 'heart')}
            {renderCategoryButton('ratings', 'Avaliações', 'star')}
            {renderCategoryButton('reviews', 'Resenhas', 'edit-3')}
            {renderCategoryButton('watchlist', 'Lista', 'bookmark')}
          </ScrollView>

          {/* Pódio dos Top 3 */}
          {sortedRanking.length >= 3 && (
            <View style={styles.podiumContainer}>
              <Text style={styles.podiumTitle}>🏆 Pódio - {getCategoryLabel(activeCategory)}</Text>
              <View style={styles.podium}>
                {/* 2º lugar */}
                <View style={[styles.podiumItem, styles.secondPlace]}>
                  <Image
                    source={{
                      uri: sortedRanking[1]?.photoURL || getDefaultAvatar(sortedRanking[1]?.displayName, sortedRanking[1]?.email)
                    }}
                    style={styles.podiumAvatar}
                  />
                  <Text style={styles.podiumPosition}>🥈</Text>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {sortedRanking[1]?.isCurrentUser ? 'Você' : 
                     (sortedRanking[1]?.displayName || 'Usuário')}
                  </Text>
                  <Text style={styles.podiumScore}>{sortedRanking[1]?.stats[activeCategory] || 0}</Text>
                </View>

                {/* 1º lugar */}
                <View style={[styles.podiumItem, styles.firstPlace]}>
                  <Image
                    source={{
                      uri: sortedRanking[0]?.photoURL || getDefaultAvatar(sortedRanking[0]?.displayName, sortedRanking[0]?.email)
                    }}
                    style={styles.podiumAvatar}
                  />
                  <Text style={styles.podiumPosition}>🥇</Text>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {sortedRanking[0]?.isCurrentUser ? 'Você' : 
                     (sortedRanking[0]?.displayName || 'Usuário')}
                  </Text>
                  <Text style={styles.podiumScore}>{sortedRanking[0]?.stats[activeCategory] || 0}</Text>
                </View>

                {/* 3º lugar */}
                <View style={[styles.podiumItem, styles.thirdPlace]}>
                  <Image
                    source={{
                      uri: sortedRanking[2]?.photoURL || getDefaultAvatar(sortedRanking[2]?.displayName, sortedRanking[2]?.email)
                    }}
                    style={styles.podiumAvatar}
                  />
                  <Text style={styles.podiumPosition}>🥉</Text>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {sortedRanking[2]?.isCurrentUser ? 'Você' : 
                     (sortedRanking[2]?.displayName || 'Usuário')}
                  </Text>
                  <Text style={styles.podiumScore}>{sortedRanking[2]?.stats[activeCategory] || 0}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Lista completa do ranking */}
          <FlatList
            data={sortedRanking}
            renderItem={renderRankingItem}
            keyExtractor={(item) => item.uid}
            contentContainerStyle={styles.rankingList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#BD0DC0"
              />
            }
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
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
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  categoriesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeCategoryButton: {
    backgroundColor: 'rgba(189, 13, 192, 0.15)',
    borderColor: '#BD0DC0',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 6,
  },
  activeCategoryButtonText: {
    color: '#BD0DC0',
    fontWeight: '500',
  },
  podiumContainer: {
    backgroundColor: '#27272A',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    padding: 16,
  },
  podiumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  podiumItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    padding: 12,
    borderRadius: 8,
  },
  firstPlace: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    transform: [{ scale: 1.1 }],
  },
  secondPlace: {
    backgroundColor: 'rgba(192, 192, 192, 0.1)',
  },
  thirdPlace: {
    backgroundColor: 'rgba(205, 127, 50, 0.1)',
  },
  podiumAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  podiumPosition: {
    fontSize: 24,
    marginBottom: 4,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  podiumScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#BD0DC0',
  },
  rankingList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  currentUserItem: {
    backgroundColor: 'rgba(189, 13, 192, 0.1)',
    borderWidth: 1,
    borderColor: '#BD0DC0',
  },
  rankingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  positionContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  positionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  currentUserAvatar: {
    borderWidth: 2,
    borderColor: '#BD0DC0',
  },
  userInfo: {
    flex: 1,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  currentUserName: {
    color: '#BD0DC0',
  },
  youBadge: {
    backgroundColor: '#BD0DC0',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  youBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  rankLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  rankingRight: {
    alignItems: 'center',
    marginRight: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  addFriendsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#BD0DC0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFriendsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default FriendsRankingScreen;