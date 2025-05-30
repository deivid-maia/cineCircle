import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Image
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const FriendMoviesListScreen = ({ route, navigation }) => {
  const { movies, friendName, sectionTitle, filter } = route.params || {};

  const renderMovieItem = ({ item }) => (
    <TouchableOpacity
      style={styles.movieItem}
      onPress={() => navigation.navigate('Detalhes', { movieId: item.movieId })}
    >
      <View style={styles.moviePosterContainer}>
        <Image
          source={{
            uri: item.posterPath
              ? `https://image.tmdb.org/t/p/w200${item.posterPath}`
              : 'https://via.placeholder.com/100x150?text=No+Image'
          }}
          style={styles.moviePoster}
        />
      </View>
      
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.movieYear}>
          {item.releaseDate ? item.releaseDate.substring(0, 4) : 'N/A'}
        </Text>

        {/* Avaliação do amigo */}
        {item.userRating && (
          <View style={styles.ratingContainer}>
            <Feather name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.userRating}/5</Text>
          </View>
        )}

        {/* Resenha do amigo */}
        {item.userReview && item.userReview.trim() && (
          <View style={styles.reviewContainer}>
            <Feather name="message-circle" size={14} color="#BD0DC0" />
            <Text style={styles.reviewText} numberOfLines={2}>
              "{item.userReview}"
            </Text>
          </View>
        )}

        {/* Badges de status */}
        <View style={styles.badgesContainer}>
          {filter === 'watched' && (
            <View style={[styles.badge, styles.watchedBadge]}>
              <Feather name="check" size={12} color="#10B981" />
              <Text style={[styles.badgeText, { color: '#10B981' }]}>Assistido</Text>
            </View>
          )}
          {filter === 'favorites' && (
            <View style={[styles.badge, styles.favoriteBadge]}>
              <Feather name="heart" size={12} color="#EF4444" />
              <Text style={[styles.badgeText, { color: '#EF4444' }]}>Favorito</Text>
            </View>
          )}
          {filter === 'watchlist' && (
            <View style={[styles.badge, styles.watchlistBadge]}>
              <Feather name="bookmark" size={12} color="#3B82F6" />
              <Text style={[styles.badgeText, { color: '#3B82F6' }]}>Quero ver</Text>
            </View>
          )}
        </View>
      </View>
      
      <Feather name="chevron-right" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>{sectionTitle}</Text>
          <Text style={styles.headerSubtitle}>{friendName}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Lista de filmes */}
      {movies && movies.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="film" size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>Nenhum filme encontrado</Text>
          <Text style={styles.emptySubtitle}>
            {friendName} ainda não tem filmes nesta categoria
          </Text>
        </View>
      ) : (
        <FlatList
          data={movies}
          renderItem={renderMovieItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
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
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  headerSpacer: {
    width: 32,
  },
  listContent: {
    paddingBottom: 20,
  },
  movieItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  moviePosterContainer: {
    marginRight: 16,
  },
  moviePoster: {
    width: 60,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#3A3A3D',
  },
  movieInfo: {
    flex: 1,
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
    marginBottom: 8,
  },
  ratingText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  reviewContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    backgroundColor: 'rgba(189, 13, 192, 0.1)',
    padding: 8,
    borderRadius: 8,
  },
  reviewText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontStyle: 'italic',
    marginLeft: 6,
    flex: 1,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  watchedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  watchlistBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  favoriteBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
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
  emptySubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default FriendMoviesListScreen;