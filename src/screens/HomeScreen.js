import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ScrollView,
  SafeAreaView,
  StatusBar,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Animated
} from 'react-native';
import { getPopularMovies, getTrendingMovies, getMovieDetails } from '../services/api';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const MOVIE_ITEM_WIDTH = width * 0.32; // Ligeiramente maior para melhor visualização

// Definir categorias com IDs de gênero do TMDB
const categories = [
  { name: 'Romance', icon: 'heart', color: '#FF6B6B', genreId: 10749 },
  { name: 'Ação', icon: 'zap', color: '#4361EE', genreId: 28 },
  { name: 'Comédia', icon: 'smile', color: '#3FBD69', genreId: 35 },
  { name: 'Drama', icon: 'award', color: '#9B51E0', genreId: 18 },
  { name: 'Terror', icon: 'eye', color: '#E74C3C', genreId: 27 },
  { name: 'Ficção', icon: 'star', color: '#00D4FF', genreId: 878 },
  { name: 'Aventura', icon: 'map', color: '#F39C12', genreId: 12 },
  { name: 'Animação', icon: 'camera', color: '#8E44AD', genreId: 16 },
  { name: 'Crime', icon: 'shield', color: '#34495E', genreId: 80 },
  { name: 'Fantasia', icon: 'feather', color: '#1ABC9C', genreId: 14 },
  { name: 'Mistério', icon: 'search', color: '#95A5A6', genreId: 9648 },
  { name: 'Thriller', icon: 'activity', color: '#E67E22', genreId: 53 }
];

const HomeScreen = ({ navigation }) => {
  const [popularMovies, setPopularMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRecommendation, setLastRecommendation] = useState(null);
  const insets = useSafeAreaInsets(); // Obter as insets da área segura
  const scrollY = new Animated.Value(0);

  // Dados do usuário mockados (integrar com o Firebase Auth depois)
  const user = {
    name: 'Julia',
    avatar: 'https://i.pravatar.cc/300?img=5' // Avatar de exemplo
  };

  // Efeitos de animação para o cabeçalho
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 70],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Buscar filmes populares
        const popularData = await getPopularMovies();
        
        // Buscar filmes em destaque
        const trendingData = await getTrendingMovies();
        
        // Definir última recomendação (primeiro filme dos populares)
        if (popularData && popularData.length > 0) {
          setLastRecommendation(popularData[0]);
          
          // Opcionalmente, buscar detalhes do filme para ter mais informações
          try {
            const details = await getMovieDetails(popularData[0].id);
            if (details) {
              setLastRecommendation(details);
            }
          } catch (error) {
            console.error("Erro ao buscar detalhes do filme:", error);
          }
        }
        
        setPopularMovies(popularData);
        setTrendingMovies(trendingData || []);
      } catch (error) {
        console.error("Erro ao carregar filmes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Função para navegar para a tela de categoria
  const handleCategoryPress = (category) => {
    navigation.navigate('Categoria', {
      categoryName: category.name,
      genreId: category.genreId,
      categoryColor: category.color
    });
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
              : 'https://via.placeholder.com/150x225?text=No+Image'
          }}
          style={styles.moviePoster}
          resizeMode="cover"
        />
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>
            {item.vote_average ? item.vote_average.toFixed(1) : '7.0'}
          </Text>
        </View>
      </View>
      <Text style={styles.movieTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.movieYear}>
        {item.release_date ? item.release_date.substring(0, 4) : '2022'}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#BD0DC0" />
        <Text style={styles.loadingText}>Carregando filmes...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Espaço superior extra para compensar a remoção do cabeçalho */}
      <View style={{ height: insets.top > 0 ? 0 : 20 }} />
      
      {/* Header animado com logo do app e avatar */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <View style={styles.appBrandContainer}>
          <View style={styles.logoWrapper}>
            <Image source={require('../../assets/cineCircle-logo-horizontalTexto.png')} style={styles.logo} />
          </View>
        </View>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => navigation.openDrawer()}
        >
          <Feather name="menu" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>
      
      <Animated.ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: insets.bottom + 70 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Categorias populares - agora em scroll horizontal */}
        <View style={styles.categoriesSection}>
          <View style={styles.categoryHeader}>
            <Text style={styles.sectionTitle}>Categorias</Text>
          </View>
          <FlatList
            data={categories}
            renderItem={({ item: category }) => (
              <TouchableOpacity 
                key={category.name}
                style={styles.categoryButton}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.7}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <Feather name={category.icon} size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.categoryText}>{category.name}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.name}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesListContent}
          />
        </View>
        
        {/* Minhas recomendações */}
        <View style={styles.recommendationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Minhas recomendações</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>Ver tudo</Text>
              <Feather name="chevron-right" size={16} color="#BD0DC0" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={popularMovies.slice(0, 10)}
            renderItem={renderMovieCard}
            keyExtractor={(item) => `recommendation-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalListContent}
          />
        </View>
        
        {/* Em destaque hoje */}
        <View style={styles.trendingSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, styles.purpleText]}>Em destaque hoje</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>Ver tudo</Text>
              <Feather name="chevron-right" size={16} color="#BD0DC0" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={trendingMovies.slice(0, 10)}
            renderItem={renderMovieCard}
            keyExtractor={(item) => `trending-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalListContent}
          />
        </View>
      </Animated.ScrollView>
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
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16, // Aumentado para dar mais espaço
    marginTop: 16, // Aumentado para descer mais o cabeçalho
  },
  appBrandContainer: {
    flexDirection: 'column',
  },
  appName: {
    color: '#BD0DC0',
    fontSize: 26, // Aumentado para dar mais destaque
    fontWeight: 'bold',
    //marginBottom: 5, // Aumentado para separar mais do nome do usuário
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4, // Adicionado para dar mais espaço entre o logo e o usuário
  },
  avatar: {
    width: 40, // Aumentado ligeiramente
    height: 40, // Aumentado ligeiramente
    borderRadius: 20,
    borderWidth: 2, // Aumentado para destacar mais
    borderColor: '#19A1BE',
    marginRight: 12,
  },
  welcomeText: {
    color: '#9CA3AF',
    fontSize: 13, // Ligeiramente maior
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 17, // Ligeiramente maior
    fontWeight: '600', // Um pouco mais negrito
  },
  menuButton: {
    padding: 10, // Aumentado para dar mais área de toque
    backgroundColor: '#27272A',
    borderRadius: 12,
    width: 46, // Aumentado ligeiramente
    height: 46, // Aumentado ligeiramente
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20, // Aumentado
    fontWeight: 'bold',
  },
  purpleText: {
    color: '#BD0DC0',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: '#BD0DC0',
    fontSize: 14,
    marginRight: 4,
  },
  recommendationsSection: {
    marginBottom: 32, // Aumentado para dar mais espaço entre seções
  },
  trendingSection: {
    marginBottom: 32, // Aumentado para dar mais espaço entre seções
  },
  horizontalListContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  movieCard: {
    width: MOVIE_ITEM_WIDTH,
    marginRight: 12,
    marginBottom: 8,
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
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
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
  },
  movieYear: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  categoriesSection: {
    marginBottom: 32, // Aumentado para dar mais espaço entre seções
  },
  categoryHeader: {
    paddingHorizontal: 16,
    marginBottom: 20, // Espaço entre o título e o scroll
  },
  categoriesListContent: {
    paddingHorizontal: 16,
    paddingRight: 32, // Espaço extra no final
  },
  categoryButton: {
    alignItems: 'center',
    marginRight: 20, // Espaço entre categorias
    width: 70, // Largura fixa para manter alinhamento
  },
  categoryIcon: {
    width: 56, // Aumentado ligeiramente
    height: 56, // Aumentado ligeiramente
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    // Adicionado sombra suave para destacar os ícones
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 13, // Ligeiramente maior
    marginTop: 4, // Adicionado para dar mais espaço entre o ícone e o texto
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  logo: {
    width: 220,
    height: 40,
    marginRight: 10,
    borderRadius: 8, // Logo com cantos arredondados como na imagem
  },
});

export default HomeScreen;