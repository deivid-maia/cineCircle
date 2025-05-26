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
    ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useMovies } from '../contexts/useMovies';

const UserMoviesScreen = ({ route, navigation }) => {
    // 🔥 RECEBER PARÂMETROS DA NAVEGAÇÃO
    const { initialFilter = 'all', screenTitle = 'Minhas Listas' } = route.params || {};

    console.log('🎬 UserMoviesScreen - Parâmetros recebidos:', { initialFilter, screenTitle });

    const { userMovies, stats, loading } = useMovies();
    const [activeFilter, setActiveFilter] = useState(initialFilter); // 🔥 USAR FILTRO INICIAL

    console.log('🎬 UserMoviesScreen - Estado atual:', {
        activeFilter,
        totalMovies: userMovies.length,
        stats
    });

    // 🔥 DEFINIR TÍTULO DA TELA DINAMICAMENTE
    useEffect(() => {
        navigation.setOptions({
            title: screenTitle
        });
    }, [navigation, screenTitle]);

    // 🔥 ATUALIZAR FILTRO QUANDO OS PARÂMETROS MUDAREM
    useEffect(() => {
        console.log('🔄 Atualizando filtro para:', initialFilter);
        setActiveFilter(initialFilter);
    }, [initialFilter]);

    // Função para filtrar filmes
    const getFilteredMovies = () => {
        console.log('🔍 Filtrando filmes com filtro:', activeFilter);
        console.log('📋 Total de filmes:', userMovies.length);

        // 🔥 LOG DETALHADO DOS FILMES PARA DEBUG
        userMovies.forEach(movie => {
            console.log(`📽️ ${movie.title}:`, {
                status: movie.status,
                isFavorite: movie.isFavorite,
                movieId: movie.movieId
            });
        });

        switch (activeFilter) {
            case 'watched':
                const watchedMovies = userMovies.filter(movie => movie.status === 'watched');
                console.log('👁️ Filmes assistidos encontrados:', watchedMovies.length);
                return watchedMovies;

            case 'watchlist':
                const watchlistMovies = userMovies.filter(movie => movie.status === 'watchlist');
                console.log('📋 Filmes da watchlist encontrados:', watchlistMovies.length);
                return watchlistMovies;

            case 'favorites':
                // 🔥 CORRIGIR FILTRO DE FAVORITOS
                const favoriteMovies = userMovies.filter(movie => {
                    const isFav = movie.isFavorite === true || movie.isFavorite === 'true';
                    console.log(`❤️ Verificando ${movie.title}: isFavorite =`, movie.isFavorite, 'resultado:', isFav);
                    return isFav;
                });
                console.log('❤️ Filmes favoritos encontrados:', favoriteMovies.length);
                return favoriteMovies;

            case 'recommendations':
                const recommendationMovies = userMovies.filter(movie => movie.status === 'recommendation');
                console.log('💡 Recomendações encontradas:', recommendationMovies.length);
                return recommendationMovies;

            default: // 'all'
                // 🔥 PROBLEMA IDENTIFICADO: Filtrar apenas filmes COM STATUS OU FAVORITOS
                const allValidMovies = userMovies.filter(movie => {
                    const hasStatus = movie.status && movie.status !== null && movie.status !== '';
                    const isFavorite = movie.isFavorite === true || movie.isFavorite === 'true';

                    console.log(`🎬 ${movie.title}:`, {
                        hasStatus,
                        isFavorite,
                        shouldInclude: hasStatus || isFavorite
                    });

                    return hasStatus || isFavorite;
                });

                console.log('📚 Filmes válidos para "todas":', allValidMovies.length);
                return allValidMovies;
        }
    };

    const filteredMovies = getFilteredMovies();

    // Função para obter contagem de cada filtro
    const getFilterCount = (filter) => {
        switch (filter) {
            case 'watched': return stats.watched;
            case 'watchlist': return stats.watchlist;
            case 'favorites': return stats.favorites;
            case 'recommendations': return stats.recommendations;
            default: return stats.total;
        }
    };

    // Renderizar item do filme
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
                {/* 🔥 REMOVER ESTE BADGE DE FOGO - ERA PARA DEBUG */}
                {/* {item.fromFirebase && (
          <View style={styles.firebaseBadge}>
            <Feather name="trending-up" size={16} color="#FF6B6B" />
          </View>
        )} */}
            </View>
            <View style={styles.movieInfo}>
                <Text style={styles.movieTitle} numberOfLines={2}>
                    {item.title}
                </Text>
                <Text style={styles.movieYear}>
                    {item.releaseDate ? item.releaseDate.substring(0, 4) : 'N/A'}
                </Text>

                {/* Badges de status */}
                <View style={styles.badgesContainer}>
                    {item.status === 'watched' && (
                        <View style={[styles.badge, styles.watchedBadge]}>
                            <Feather name="check" size={12} color="#10B981" />
                            <Text style={[styles.badgeText, { color: '#10B981' }]}>Assistido</Text>
                        </View>
                    )}
                    {item.status === 'watchlist' && (
                        <View style={[styles.badge, styles.watchlistBadge]}>
                            <Feather name="bookmark" size={12} color="#3B82F6" />
                            <Text style={[styles.badgeText, { color: '#3B82F6' }]}>Quero ver</Text>
                        </View>
                    )}
                    {item.isFavorite && (
                        <View style={[styles.badge, styles.favoriteBadge]}>
                            <Feather name="heart" size={12} color="#EF4444" />
                            <Text style={[styles.badgeText, { color: '#EF4444' }]}>Favorito</Text>
                        </View>
                    )}
                </View>

                {/* Rating se existir */}
                {item.userRating && (
                    <View style={styles.ratingContainer}>
                        <Feather name="star" size={14} color="#FFD700" />
                        <Text style={styles.ratingText}>{item.userRating}/5</Text>
                    </View>
                )}
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );

    // Renderizar filtros
    const FilterButton = ({ filter, title, count }) => (
        <TouchableOpacity
            style={[
                styles.filterButton,
                activeFilter === filter && styles.filterButtonActive
            ]}
            onPress={() => setActiveFilter(filter)}
        >
            <Text style={[
                styles.filterText,
                activeFilter === filter && styles.filterTextActive
            ]}>
                {title}
            </Text>
            <View style={[
                styles.filterCount,
                activeFilter === filter && styles.filterCountActive
            ]}>
                <Text style={[
                    styles.filterCountText,
                    activeFilter === filter && styles.filterCountTextActive
                ]}>
                    {count}
                </Text>
            </View>
        </TouchableOpacity>
    );

    // Estado de loading
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

            {/* Header com botão voltar */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{screenTitle}</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Filtros */}
            <View style={styles.filtersContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersScrollContainer}
                >
                    <FilterButton filter="all" title="Todas" count={stats.total} />
                    <FilterButton filter="watched" title="Assistidos" count={stats.watched} />
                    <FilterButton filter="watchlist" title="Quero ver" count={stats.watchlist} />
                    <FilterButton filter="favorites" title="Favoritos" count={stats.favorites} />
                </ScrollView>
            </View>

            {/* Lista de filmes */}
            {filteredMovies.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Feather name="film" size={48} color="#9CA3AF" />
                    <Text style={styles.emptyTitle}>
                        {activeFilter === 'all'
                            ? 'Nenhum filme na sua lista'
                            : `Nenhum filme em "${getFilterTitle(activeFilter)}"`
                        }
                    </Text>
                    <Text style={styles.emptySubtitle}>
                        {activeFilter === 'all'
                            ? 'Adicione filmes à sua lista para vê-los aqui'
                            : 'Filmes adicionados a esta categoria aparecerão aqui'
                        }
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredMovies}
                    renderItem={renderMovieItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};

// 🔥 FUNÇÃO AUXILIAR PARA TÍTULOS
const getFilterTitle = (filter) => {
    switch (filter) {
        case 'watched': return 'Assistidos';
        case 'watchlist': return 'Quero ver';
        case 'favorites': return 'Favoritos';
        case 'recommendations': return 'Recomendações';
        default: return 'Todas';
    }
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
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    headerSpacer: {
        width: 32,
    },
    filtersContainer: {
        // 🔥 LAYOUT CORRIGIDO PARA 4 BOTÕES
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#27272A',
        // 🔥 OPÇÃO 1: Scroll horizontal (recomendado)
        overflow: 'hidden',
    },

    // 🔥 WRAPPER PARA SCROLL HORIZONTAL (adicionar ao JSX)
    filtersScrollContainer: {
        flexDirection: 'row',
    },

    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#27272A',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'transparent',
        minWidth: 85,
    },

    filterButtonActive: {
        backgroundColor: 'rgba(189, 13, 192, 0.15)',
        borderColor: '#BD0DC0',
    },

    filterText: {
        color: '#9CA3AF',
        fontSize: 13,
        fontWeight: '500',
        marginRight: 6,
        flexShrink: 1,
    },

    filterTextActive: {
        color: '#BD0DC0',
    },

    filterCount: {
        backgroundColor: '#18181B',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 18,
    },

    filterCountActive: {
        backgroundColor: '#BD0DC0',
    },

    filterCountText: {
        color: '#9CA3AF',
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    filterCountTextActive: {
        color: '#FFFFFF',
    },

    // filtersContainer: {
    //     flexDirection: 'row',
    //     paddingHorizontal: 16,
    //     paddingVertical: 16,
    //     borderBottomWidth: 1,
    //     borderBottomColor: '#27272A',
    //     justifyContent: 'space-between'
    // },
    // filterButton: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     backgroundColor: '#27272A',
    //     paddingHorizontal: 12,
    //     paddingVertical: 8,
    //     borderRadius: 20,
    //     marginRight: 12,
    //     borderWidth: 1,
    //     borderColor: 'transparent',
    // },
    // filterButtonActive: {
    //     backgroundColor: 'rgba(189, 13, 192, 0.15)',
    //     borderColor: '#BD0DC0',
    // },
    // filterText: {
    //     color: '#9CA3AF',
    //     fontSize: 14,
    //     fontWeight: '500',
    //     marginRight: 6,
    // },
    // filterTextActive: {
    //     color: '#BD0DC0',
    // },
    // filterCount: {
    //     backgroundColor: '#18181B',
    //     paddingHorizontal: 6,
    //     paddingVertical: 2,
    //     borderRadius: 10,
    //     minWidth: 20,
    // },
    // filterCountActive: {
    //     backgroundColor: '#BD0DC0',
    // },
    // filterCountText: {
    //     color: '#9CA3AF',
    //     fontSize: 12,
    //     fontWeight: 'bold',
    //     textAlign: 'center',
    // },
    // filterCountTextActive: {
    //     color: '#FFFFFF',
    // },
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
    moviePoster: {
        width: 60,
        height: 90,
        borderRadius: 8,
        backgroundColor: '#3A3A3D',
    },
    movieInfo: {
        flex: 1,
        marginLeft: 16,
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
    badgesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
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
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        color: '#FFD700',
        fontSize: 14,
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

export default UserMoviesScreen;
