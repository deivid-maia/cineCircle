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
    Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useMovies } from '../contexts/useMovies';

const MyReviewsScreen = ({ navigation }) => {
    const { userMovies, loading } = useMovies();
    const [refreshing, setRefreshing] = useState(false);

    // Filtrar apenas filmes com resenhas
    const moviesWithReviews = userMovies.filter(movie => 
        movie.userReview && movie.userReview.trim().length > 0
    );

    const onRefresh = async () => {
        setRefreshing(true);
        // Aqui você pode adicionar lógica para recarregar as resenhas
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    };

    const formatDate = (date) => {
        if (!date) return 'Data não disponível';
        
        try {
            let dateObj;
            if (date.toDate && typeof date.toDate === 'function') {
                dateObj = date.toDate();
            } else if (date instanceof Date) {
                dateObj = date;
            } else if (typeof date === 'string') {
                dateObj = new Date(date);
            } else {
                return 'Data inválida';
            }
            
            return dateObj.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return 'Data inválida';
        }
    };

    const navigateToSearch = () => {
        // 🔥 CORREÇÃO: Navegar para a aba correta
        navigation.navigate('MainTabs', { 
            screen: 'AddContent' 
        });
    };

    const renderReviewItem = ({ item }) => (
        <TouchableOpacity
            style={styles.reviewCard}
            onPress={() => navigation.navigate('Detalhes', { movieId: item.movieId })}
        >
            <View style={styles.movieHeader}>
                <Image
                    source={{
                        uri: item.posterPath
                            ? `https://image.tmdb.org/t/p/w200${item.posterPath}`
                            : 'https://via.placeholder.com/80x120?text=No+Image'
                    }}
                    style={styles.moviePoster}
                />
                
                <View style={styles.movieInfo}>
                    <Text style={styles.movieTitle} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <Text style={styles.movieYear}>
                        {item.releaseDate ? item.releaseDate.substring(0, 4) : 'N/A'}
                    </Text>
                    
                    {/* Data da resenha */}
                    <Text style={styles.reviewDate}>
                        Resenha em {formatDate(item.updatedAt || item.addedAt)}
                    </Text>
                    
                    {/* Avaliação */}
                    {item.userRating && (
                        <View style={styles.ratingContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Feather
                                    key={star}
                                    name="star"
                                    size={16}
                                    color={star <= item.userRating ? '#FFD700' : '#3A3A3D'}
                                />
                            ))}
                            <Text style={styles.ratingText}>{item.userRating}/5</Text>
                        </View>
                    )}
                </View>
                
                <Feather name="chevron-right" size={20} color="#9CA3AF" />
            </View>
            
            {/* Resenha */}
            <View style={styles.reviewContent}>
                <Text style={styles.reviewText} numberOfLines={4}>
                    {item.userReview}
                </Text>
                
                {/* Badges de status */}
                <View style={styles.badgesContainer}>
                    {item.status === 'watched' && (
                        <View style={[styles.badge, styles.watchedBadge]}>
                            <Feather name="check" size={12} color="#10B981" />
                            <Text style={[styles.badgeText, { color: '#10B981' }]}>Assistido</Text>
                        </View>
                    )}
                    {item.isFavorite && (
                        <View style={[styles.badge, styles.favoriteBadge]}>
                            <Feather name="heart" size={12} color="#EF4444" />
                            <Text style={[styles.badgeText, { color: '#EF4444' }]}>Favorito</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <Feather name="edit-3" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Nenhuma resenha ainda</Text>
            <Text style={styles.emptyText}>
                Suas resenhas de filmes aparecerão aqui. Comece avaliando e escrevendo sobre os filmes que você assistiu!
            </Text>
            <TouchableOpacity 
                style={styles.addReviewButton}
                onPress={navigateToSearch}
            >
                <Feather name="plus" size={20} color="#FFFFFF" />
                <Text style={styles.addReviewText}>Buscar Filmes</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#BD0DC0" />
                <Text style={styles.loadingText}>Carregando resenhas...</Text>
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
                <Text style={styles.headerTitle}>Minhas Resenhas</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={navigateToSearch}
                >
                    <Feather name="plus" size={24} color="#BD0DC0" />
                </TouchableOpacity>
            </View>

            {/* Estatísticas */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{moviesWithReviews.length}</Text>
                    <Text style={styles.statLabel}>Resenhas</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                        {moviesWithReviews.filter(m => m.userRating >= 4).length}
                    </Text>
                    <Text style={styles.statLabel}>Bem Avaliados</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                        {moviesWithReviews.filter(m => m.isFavorite).length}
                    </Text>
                    <Text style={styles.statLabel}>Favoritos</Text>
                </View>
            </View>

            {/* Lista de resenhas */}
            <FlatList
                data={moviesWithReviews}
                renderItem={renderReviewItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={
                    moviesWithReviews.length === 0 
                        ? styles.emptyListContainer 
                        : styles.listContent
                }
                ListEmptyComponent={EmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#BD0DC0"
                    />
                }
                showsVerticalScrollIndicator={false}
            />
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
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    addButton: {
        padding: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#27272A',
        marginHorizontal: 16,
        marginVertical: 16,
        borderRadius: 12,
        paddingVertical: 16,
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    emptyListContainer: {
        flex: 1,
    },
    reviewCard: {
        backgroundColor: '#27272A',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    movieHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    moviePoster: {
        width: 60,
        height: 90,
        borderRadius: 8,
        marginRight: 12,
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
        marginBottom: 4,
    },
    reviewDate: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        color: '#FFD700',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 6,
    },
    reviewContent: {
        backgroundColor: '#18181B',
        borderRadius: 8,
        padding: 12,
    },
    reviewText: {
        fontSize: 14,
        color: '#D1D5DB',
        lineHeight: 20,
        marginBottom: 12,
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
    addReviewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#BD0DC0',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    addReviewText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default MyReviewsScreen;