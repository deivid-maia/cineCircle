import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFriends } from '../contexts/FriendsContext';
import { useMovies } from '../contexts/useMovies';

const FriendsRankingScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [friendsRanking, setFriendsRanking] = useState([]);
  const { friends } = useFriends();
  const { stats: myStats } = useMovies();

  useEffect(() => {
    loadFriendsRanking();
  }, [friends]);

  const loadFriendsRanking = async () => {
    setLoading(true);
    try {
      // Simular dados dos amigos (em uma implementação real, buscaria do Firestore)
      const rankingData = friends.map(friend => ({
        ...friend,
        stats: {
          watched: Math.floor(Math.random() * 200) + 10,
          favorites: Math.floor(Math.random() * 50) + 5,
          reviews: Math.floor(Math.random() * 30) + 2,
        }
      }));

      // Adicionar o usuário atual
      rankingData.push({
        uid: 'current_user',
        displayName: 'Você',
        email: 'current_user',
        photoURL: null,
        isCurrentUser: true,
        stats: myStats
      });

      // Ordenar por filmes assistidos
      const sorted = rankingData.sort((a, b) => b.stats.watched - a.stats.watched);
      setFriendsRanking(sorted);
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (position) => {
    switch(position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${position}º`;
    }
  };

  const getRankColor = (position) => {
    switch(position) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return '#9CA3AF';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#BD0DC0" />
        <Text style={styles.loadingText}>Carregando ranking...</Text>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Ranking de Amigos</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Ranking List */}
        <View style={styles.rankingContainer}>
          <Text style={styles.sectionTitle}>🏆 Filmes Assistidos</Text>
          
          {friendsRanking.map((friend, index) => {
            const position = index + 1;
            const isCurrentUser = friend.isCurrentUser;
            
            return (
              <View 
                key={friend.uid} 
                style={[
                  styles.rankingItem,
                  isCurrentUser && styles.currentUserItem
                ]}
              >
                {/* Posição */}
                <View style={[styles.rankPosition, { borderColor: getRankColor(position) }]}>
                  <Text style={[styles.rankText, { color: getRankColor(position) }]}>
                    {getRankIcon(position)}
                  </Text>
                </View>

                {/* Avatar */}
                <View style={styles.userInfo}>
                  {friend.photoURL ? (
                    <Image source={{ uri: friend.photoURL }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {friend.displayName[0]?.toUpperCase() || 'U'}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.userDetails}>
                    <Text style={[
                      styles.userName,
                      isCurrentUser && styles.currentUserName
                    ]}>
                      {friend.displayName}
                      {isCurrentUser && ' 👤'}
                    </Text>
                  </View>
                </View>

                {/* Score */}
                <View style={styles.scoreContainer}>
                  <Text style={[styles.scoreText, { color: getRankColor(position) }]}>
                    {friend.stats.watched}
                  </Text>
                  <Text style={styles.scoreLabel}>filmes</Text>
                </View>
              </View>
            );
          })}
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#18181B',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  rankingContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  currentUserItem: {
    borderColor: '#BD0DC0',
    borderWidth: 2,
    backgroundColor: 'rgba(189, 13, 192, 0.1)',
  },
  rankPosition: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#BD0DC0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  currentUserName: {
    color: '#BD0DC0',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
});

export default FriendsRankingScreen;