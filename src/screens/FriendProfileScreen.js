import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import friendsService from '../services/friendsService';

const FriendProfileScreen = ({ route, navigation }) => {
  const { friend } = route.params || {};
  const [friendMovies, setFriendMovies] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriendData();
  }, []);

  const loadFriendData = async () => {
    if (!friend?.uid) return;
    
    setLoading(true);
    try {
      const result = await friendsService.getFriendMovies(friend.uid);
      if (result.success) {
        setFriendMovies(result.movies);
        const calculatedStats = friendsService.getFriendStats(result.movies);
        setStats(calculatedStats);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do amigo:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultAvatar = (name, email) => {
    const displayName = name || (email ? email.split('@')[0] : 'Usuario');
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=BD0DC0&color=fff`;
  };

  const navigateToMoviesList = (filter, title) => {
    const filteredMovies = getMoviesByFilter(filter);
    navigation.navigate('FriendMoviesList', {
      movies: filteredMovies,
      friendName: friend.displayName || friend.email?.split('@')[0] || 'Amigo',
      sectionTitle: title,
      filter
    });
  };

  const getMoviesByFilter = (filter) => {
    switch (filter) {
      case 'watched':
        return friendMovies.filter(m => m.status === 'watched');
      case 'favorites':
        return friendMovies.filter(m => m.isFavorite === true);
      case 'watchlist':
        return friendMovies.filter(m => m.status === 'watchlist');
      default:
        return [];
    }
  };

  if (!friend) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Feather name="user-x" size={48} color="#9CA3AF" />
          <Text style={styles.errorText}>Perfil não encontrado</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Feather name="more-horizontal" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Seção do Perfil */}
        <View style={styles.profileSection}>
          <Image
            source={{ 
              uri: friend.photoURL || getDefaultAvatar(friend.displayName, friend.email)
            }}
            style={styles.avatar}
          />
          <Text style={styles.displayName}>
            {friend.displayName || (friend.email ? friend.email.split('@')[0] : 'Usuário')}
          </Text>
          <Text style={styles.username}>
            @{friend.email ? friend.email.split('@')[0] : 'usuario'}
          </Text>
          
          {friend.bio && (
            <Text style={styles.bio}>{friend.bio}</Text>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#BD0DC0" />
            <Text style={styles.loadingText}>Carregando filmes...</Text>
          </View>
        ) : (
          <>
            {/* Estatísticas */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.total || 0}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.favorites || 0}</Text>
                <Text style={styles.statLabel}>Favoritos</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.ratings || 0}</Text>
                <Text style={styles.statLabel}>Avaliações</Text>
              </View>
            </View>

            {/* Seções de Filmes */}
            <View style={styles.sectionsContainer}>
              
              {/* Filmes Assistidos */}
              <TouchableOpacity 
                style={styles.section}
                onPress={() => navigateToMoviesList('watched', 'Filmes Assistidos')}
              >
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionLeft}>
                    <Feather name="eye" size={24} color="#10B981" />
                    <Text style={styles.sectionTitle}>Assistidos</Text>
                  </View>
                  <View style={styles.sectionRight}>
                    <Text style={styles.sectionCount}>{stats.watched || 0}</Text>
                    <Feather name="chevron-right" size={20} color="#9CA3AF" />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Favoritos */}
              <TouchableOpacity 
                style={styles.section}
                onPress={() => navigateToMoviesList('favorites', 'Favoritos')}
              >
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionLeft}>
                    <Feather name="heart" size={24} color="#EF4444" />
                    <Text style={styles.sectionTitle}>Favoritos</Text>
                  </View>
                  <View style={styles.sectionRight}>
                    <Text style={styles.sectionCount}>{stats.favorites || 0}</Text>
                    <Feather name="chevron-right" size={20} color="#9CA3AF" />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Quero Ver */}
              <TouchableOpacity 
                style={styles.section}
                onPress={() => navigateToMoviesList('watchlist', 'Quero Ver')}
              >
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionLeft}>
                    <Feather name="bookmark" size={24} color="#3B82F6" />
                    <Text style={styles.sectionTitle}>Quero Ver</Text>
                  </View>
                  <View style={styles.sectionRight}>
                    <Text style={styles.sectionCount}>{stats.watchlist || 0}</Text>
                    <Feather name="chevron-right" size={20} color="#9CA3AF" />
                  </View>
                </View>
              </TouchableOpacity>

            </View>
          </>
        )}
      </ScrollView>
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
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3A3A3D',
    marginBottom: 16,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#27272A',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 20,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#3A3A3D',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sectionsContainer: {
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionCount: {
    fontSize: 16,
    color: '#9CA3AF',
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#FFFFFF',
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
});

export default FriendProfileScreen;
