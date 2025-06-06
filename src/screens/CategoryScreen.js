import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { getMoviesByGenre } from '../services/api';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const MOVIE_ITEM_WIDTH = (width - 48) / 2; // 2 colunas com margens

const CategoryScreen = ({ route, navigation }) => {
  const { categoryName, genreId, categoryColor } = route.params;
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    console.log(`🎬 [CategoryScreen] Iniciada para: ${categoryName} (ID: ${genreId})`);
    console.log(`🎨 [CategoryScreen] Cor da categoria: ${categoryColor}`);
    
    // 🔥 RESETAR ESTADO QUANDO MUDAR DE CATEGORIA
    setMovies([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
    
    fetchMovies();
  }, [genreId, categoryName]); // 🔥 DEPENDÊNCIAS IMPORTANTES

  const fetchMovies = async (pageNumber = 1, loadMore = false) => {
    try {
      console.log(`🔄 [CategoryScreen] Carregando ${categoryName} - Página ${pageNumber} - LoadMore: ${loadMore}`);
      console.log(`🎯 [CategoryScreen] Estado atual - Total de filmes: ${movies.length}`);
      
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        // 🔥 LIMPAR FILMES SE FOR NOVA BUSCA
        if (pageNumber === 1) {
          console.log(`🧹 [CategoryScreen] Limpando filmes anteriores...`);
          setMovies([]);
        }
      }

      // 🔥 CHAMADA DA API COM LOG DETALHADO
      console.log(`📡 [CategoryScreen] Fazendo chamada da API para gênero ${genreId}...`);
      const newMovies = await getMoviesByGenre(genreId, pageNumber);
      
      console.log(`📊 [CategoryScreen] Resultado para ${categoryName}:`, {
        categoryName,
        genreId,
        pageNumber,
        moviesCount: newMovies.length,
        firstMovieTitle: newMovies[0]?.title || 'Nenhum',
        lastMovieTitle: newMovies[newMovies.length - 1]?.title || 'Nenhum'
      });

      // Verificar se são filmes únicos
      if (newMovies.length > 0) {
        const movieIds = newMovies.map(m => m.id);
        const uniqueIds = [...new Set(movieIds)];
        console.log(`🔢 [CategoryScreen] IDs únicos: ${uniqueIds.length}/${movieIds.length}`);
        
        // Log dos gêneros dos primeiros filmes
        newMovies.slice(0, 3).forEach(movie => {
          console.log(`🎭 [CategoryScreen] "${movie.title}" - Gêneros: ${movie.genre_ids?.join(', ') || 'N/A'}`);
        });
      }

      if (loadMore) {
        setMovies(prev => {
          const combined = [...prev, ...newMovies];
          console.log(`📈 [CategoryScreen] Total de filmes após carregar mais: ${combined.length}`);
          return combined;
        });
      } else {
        // 🔥 SEMPRE SETAR FILMES NOVOS (NÃO COMBINAR)
        console.log(`🔄 [CategoryScreen] Definindo novos filmes (substituindo): ${newMovies.length}`);
        setMovies(newMovies);
      }

      if (newMovies.length < 20) {
        setHasMore(false);
        console.log(`🏁 [CategoryScreen] Sem mais filmes para ${categoryName}`);
      }

      setPage(pageNumber);
    } catch (error) {
      console.error(`❌ [CategoryScreen] Erro ao carregar ${categoryName}:`, error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreMovies = () => {
    if (!loadingMore && hasMore) {
      console.log(`📖 Carregando mais filmes de ${categoryName}...`);
      fetchMovies(page + 1, true);
    }
  };

  const renderMovieCard = ({ item }) => (
    <TouchableOpacity
      style={styles.movieCard}
      onPress={() => navigation.navigate('Detalhes', { movieId: item.id })}
    >
      <View style={styles.moviePosterContainer}>
        <Image
          source={{ 
            uri: item.poster_path 
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
              : 'https://via.placeholder.com/300x450?text=No+Image'
          }}
          style={styles.moviePoster}
          resizeMode="cover"
        />
        <View style={[styles.ratingBadge, { backgroundColor: categoryColor || '#BD0DC0' }]}>
          <Text style={styles.ratingText}>
            {item.vote_average ? item.vote_average.toFixed(1) : '7.0'}
          </Text>
        </View>
      </View>
      <Text style={styles.movieTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.movieYear}>
        {item.release_date ? item.release_date.substring(0, 4) : '2022'}
      </Text>
    </TouchableOpacity>
  );

  const renderLoadingFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#BD0DC0" />
        <Text style={styles.loadingMoreText}>Carregando mais filmes...</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="film" size={64} color="#9CA3AF" />
      <Text style={styles.emptyStateTitle}>Nenhum filme encontrado</Text>
      <Text style={styles.emptyStateText}>
        Não encontramos filmes de {categoryName.toLowerCase()} no momento.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{categoryName}</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#BD0DC0" />
          <Text style={styles.loadingText}>Carregando filmes de {categoryName.toLowerCase()}...</Text>
          {/* 🔥 DEBUG INFO */}
          <Text style={styles.debugText}>Gênero ID: {genreId}</Text>
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
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryName}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Subtitle com quantidade de filmes */}
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>
          {movies.length} filme{movies.length !== 1 ? 's' : ''} encontrado{movies.length !== 1 ? 's' : ''}
        </Text>
        {/* 🔥 DEBUG INFO */}
        <Text style={styles.debugText}>Gênero ID: {genreId}</Text>
      </View>

      {/* Lista de filmes */}
      <FlatList
        data={movies}
        renderItem={renderMovieCard}
        keyExtractor={(item) => `${categoryName}-${item.id}`}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.moviesList,
          { paddingBottom: insets.bottom + 20 }
        ]}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderLoadingFooter}
        onEndReached={loadMoreMovies}
        onEndReachedThreshold={0.5}
      />
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
  },
  backButton: {
    padding: 8,
    backgroundColor: '#27272A',
    borderRadius: 12,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  placeholder: {
    width: 44, // Mesmo tamanho do botão de voltar para centralizar o título
  },
  subtitleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  debugText: {
    color: '#BD0DC0',
    fontSize: 12,
    marginTop: 4,
  },
  moviesList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  movieCard: {
    width: MOVIE_ITEM_WIDTH,
    marginRight: 16,
    marginBottom: 24,
  },
  moviePosterContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  moviePoster: {
    width: '100%',
    height: MOVIE_ITEM_WIDTH * 1.5,
    borderRadius: 12,
    backgroundColor: '#27272A',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(189, 13, 192, 0.9)',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  movieTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    lineHeight: 18,
  },
  movieYear: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  loadingFooter: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingMoreText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});

export default CategoryScreen;