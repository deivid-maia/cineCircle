import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { searchMovies } from '../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AddContentScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const insets = useSafeAreaInsets();

    // Busca filmes quando o usuário digita
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length > 2) {
                setIsLoading(true);
                try {
                    const results = await searchMovies(searchQuery);
                    setSearchResults(results.slice(0, 10));
                } catch (error) {
                    console.error('Erro ao buscar filmes:', error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // ✅ SIMPLIFICADO: Navega direto para detalhes
    const selectMovie = (movie) => {
        navigation.navigate('Detalhes', { movieId: movie.id });
    };

    // Renderiza os resultados da busca
    const renderMovieItem = ({ item }) => (
        <TouchableOpacity style={styles.movieItem} onPress={() => selectMovie(item)}>
            <Image
                source={{
                uri: item.poster_path
                    ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                    : 'https://via.placeholder.com/92x138?text=No+Image'
                }}
                style={styles.moviePoster}
            />
            <View style={styles.movieInfo}>
                <Text style={styles.movieTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.movieYear}>
                {item.release_date ? item.release_date.substring(0, 4) : 'N/A'}
                </Text>
                {/* ✅ Prévia da sinopse */}
                {item.overview && (
                    <Text style={styles.movieOverview} numberOfLines={2}>
                        {item.overview}
                    </Text>
                )}
            </View>
            <Feather name="chevron-right" size={24} color="#BD0DC0" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#18181B" />
            
            <View style={{ height: insets.top > 0 ? 0 : 12 }} />
            
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Buscar Filmes</Text>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
                <Feather name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar filmes e séries..."
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Feather name="x" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Loading Indicator */}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#BD0DC0" />
                    <Text style={styles.loadingText}>Buscando filmes...</Text>
                </View>
            )}

            {/* Empty State - Instruções Iniciais */}
            {!isLoading && searchResults.length === 0 && searchQuery.length === 0 && (
                <View style={styles.emptyContainer}>
                    <Feather name="search" size={60} color="#3A3A3D" />
                    <Text style={styles.emptyTitle}>Encontre seu próximo filme</Text>
                    <Text style={styles.emptySubtitle}>
                        Digite o nome de um filme ou série para começar a busca.
                    </Text>
                    <Text style={styles.emptyHint}>
                        💡 Dica: Você pode adicionar à sua lista, avaliar ou recomendar aos amigos!
                    </Text>
                </View>
            )}

            {/* Search Results */}
            {!isLoading && searchResults.length > 0 && (
                <View style={styles.resultsContainer}>
                    <Text style={styles.resultsHeader}>
                        {searchResults.length} resultado{searchResults.length > 1 ? 's' : ''} encontrado{searchResults.length > 1 ? 's' : ''}
                    </Text>
                    <FlatList
                        data={searchResults}
                        renderItem={renderMovieItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={[
                            styles.resultsList,
                            { paddingBottom: insets.bottom + 70 }
                        ]}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            )}

            {/* No Results Message */}
            {!isLoading && searchQuery.length > 2 && searchResults.length === 0 && (
                <View style={styles.noResultsContainer}>
                    <Feather name="search" size={40} color="#3A3A3D" />
                    <Text style={styles.noResultsTitle}>Nenhum resultado encontrado</Text>
                    <Text style={styles.noResultsText}>
                        Não encontramos nada para "{searchQuery}"
                    </Text>
                    <Text style={styles.noResultsHint}>
                        Tente buscar com palavras diferentes ou verifique a ortografia.
                    </Text>
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
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  emptyHint: {
    fontSize: 14,
    color: '#BD0DC0',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    fontSize: 14,
    color: '#9CA3AF',
    marginHorizontal: 16,
    marginBottom: 12,
    fontWeight: '500',
  },
  resultsList: {
    paddingHorizontal: 16,
  },
  movieItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  moviePoster: {
    width: 50,
    height: 75,
    borderRadius: 8,
    backgroundColor: '#3A3A3D',
  },
  movieInfo: {
    flex: 1,
    marginLeft: 16,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  movieYear: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  movieOverview: {
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 18,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 12,
  },
  noResultsHint: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AddContentScreen;
