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

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   Image,
//   KeyboardAvoidingView,
//   Platform,
//   Modal,
//   ActivityIndicator,
//   ScrollView,
//   StatusBar,
//   Alert
// } from 'react-native';
// import { Feather } from '@expo/vector-icons';
// import { searchMovies } from '../services/api';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useMovies } from '../contexts/useMovies';

// const AddContentScreen = ({ navigation }) => {
//     // Estados existentes
//     const [searchQuery, setSearchQuery] = useState('');
//     const [searchResults, setSearchResults] = useState([]);
//     const [selectedMovie, setSelectedMovie] = useState(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const [modalVisible, setModalVisible] = useState(false);
//     const [contentType, setContentType] = useState('');
//     const [rating, setRating] = useState(0);
//     const [review, setReview] = useState('');
//     const [recommendTo, setRecommendTo] = useState([]);
//     const [recommendModalVisible, setRecommendModalVisible] = useState(false);
//     const insets = useSafeAreaInsets();

//     // ✅ Hook do contexto de filmes
//     const { 
//         addMovieToList, 
//         loading: moviesLoading,
//         isMovieInList,
//         isFavorite,
//         getUserMovie
//     } = useMovies();

//     // ✅ Estados para controlar status atual do filme
//     const [movieStatus, setMovieStatus] = useState({
//         isWatched: false,
//         isFavorited: false,
//         isInWatchlist: false
//     });

//     // Amigos mockados para a função de recomendação
//     const friends = [
//         { id: 1, name: 'Ana Silva', avatar: 'https://i.pravatar.cc/150?img=1' },
//         { id: 2, name: 'Carlos Mendes', avatar: 'https://i.pravatar.cc/150?img=2' },
//         { id: 3, name: 'Julia Costa', avatar: 'https://i.pravatar.cc/150?img=5' },
//         { id: 4, name: 'Pedro Alves', avatar: 'https://i.pravatar.cc/150?img=8' },
//         { id: 5, name: 'Mariana Dias', avatar: 'https://i.pravatar.cc/150?img=9' },
//     ];

//     // Busca filmes quando o usuário digita
//     useEffect(() => {
//         const delayDebounceFn = setTimeout(async () => {
//             if (searchQuery.length > 2) {
//                 setIsLoading(true);
//                 try {
//                     const results = await searchMovies(searchQuery);
//                     setSearchResults(results.slice(0, 10));
//                 } catch (error) {
//                     console.error('Erro ao buscar filmes:', error);
//                 } finally {
//                     setIsLoading(false);
//                 }
//             } else {
//                 setSearchResults([]);
//             }
//         }, 500);

//         return () => clearTimeout(delayDebounceFn);
//     }, [searchQuery]);

//     // ✅ NOVA FUNÇÃO: Verificar se o filme já está nas listas
//     const checkMovieStatus = async (movie) => {
//         try {
//             const [watched, favorited, watchlist] = await Promise.all([
//                 isMovieInList(movie.id, 'watched'),
//                 isFavorite(movie.id),
//                 isMovieInList(movie.id, 'watchlist')
//             ]);

//             setMovieStatus({
//                 isWatched: watched,
//                 isFavorited: favorited,
//                 isInWatchlist: watchlist
//             });

//             // Se já assistiu, carregar rating e review existentes
//             if (watched) {
//                 const userMovie = getUserMovie(movie.id);
//                 if (userMovie) {
//                     setRating(userMovie.userRating || 0);
//                     setReview(userMovie.userReview || '');
//                 }
//             }

//             console.log('🎬 Status do filme:', {
//                 watched,
//                 favorited,
//                 watchlist,
//                 title: movie.title
//             });
//         } catch (error) {
//             console.error('Erro ao verificar status do filme:', error);
//             setMovieStatus({
//                 isWatched: false,
//                 isFavorited: false,
//                 isInWatchlist: false
//             });
//         }
//     };

//     // Seleciona um filme e abre o modal
//     const selectMovie = async (movie) => {
//         setSelectedMovie(movie);
//         setModalVisible(true);
//         setContentType('');
//         setRating(0);
//         setReview('');
//         setRecommendTo([]);

//         // ✅ VERIFICAR STATUS ATUAL DO FILME
//         await checkMovieStatus(movie);
//     };

//     // ✅ FUNÇÃO CORRIGIDA: Adicionar conteúdo com integração Firebase
//     const addContent = async () => {
//         if (!contentType || !selectedMovie) {
//             Alert.alert('Erro', 'Por favor, selecione uma opção primeiro.');
//             return;
//         }

//         setIsLoading(true);
//         try {
//             console.log('🎬 Adicionando filme:', selectedMovie.title, 'Tipo:', contentType);
            
//             // Preparar opções baseadas no tipo de conteúdo
//             const options = {};
            
//             if (contentType === 'watched') {
//                 if (rating === 0) {
//                     Alert.alert('Avaliação obrigatória', 'Por favor, avalie o filme com estrelas.');
//                     setIsLoading(false);
//                     return;
//                 }
//                 options.rating = rating;
//                 options.review = review.trim();
//             } else if (contentType === 'watchlist') {
//                 options.review = review.trim();
//             } else if (contentType === 'favorite') {
//                 options.isFavorite = true;
//                 options.review = review.trim();
//             } else if (contentType === 'recommend') {
//                 if (rating === 0) {
//                     Alert.alert('Avaliação obrigatória', 'Por favor, avalie o filme para recomendar.');
//                     setIsLoading(false);
//                     return;
//                 }
//                 if (recommendTo.length === 0) {
//                     Alert.alert('Selecione amigos', 'Por favor, selecione pelo menos um amigo para recomendar.');
//                     setIsLoading(false);
//                     return;
//                 }
//                 options.rating = rating;
//                 options.review = review.trim();
//                 options.recommendTo = recommendTo;
//             }

//             // ✅ CHAMADA REAL PARA O FIREBASE
//             const result = await addMovieToList(selectedMovie, contentType, options);
            
//             if (result.success) {
//                 const successMessages = {
//                     watched: '✅ Filme marcado como assistido!',
//                     watchlist: '📋 Filme adicionado à sua lista!',
//                     favorite: '❤️ Filme adicionado aos favoritos!',
//                     recommend: `🎯 Filme recomendado para ${recommendTo.length} amigo${recommendTo.length > 1 ? 's' : ''}!`
//                 };
                
//                 Alert.alert('Sucesso!', successMessages[contentType], [
//                     {
//                         text: 'OK',
//                         onPress: () => {
//                             setModalVisible(false);
//                             setSelectedMovie(null);
//                             setContentType('');
//                             setRating(0);
//                             setReview('');
//                             setRecommendTo([]);
//                             setSearchQuery('');
//                             setSearchResults([]);
                            
//                             if (contentType === 'watched') {
//                                 navigation.navigate('ProfileTab');
//                             }
//                         }
//                     }
//                 ]);
//             } else {
//                 throw new Error(result.error || 'Erro desconhecido');
//             }
            
//         } catch (error) {
//             console.error('❌ Erro ao adicionar filme:', error);
//             Alert.alert(
//                 'Erro ao adicionar', 
//                 error.message || 'Não foi possível adicionar o filme. Tente novamente.',
//                 [{ text: 'OK' }]
//             );
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Renderiza os resultados da busca
//     const renderMovieItem = ({ item }) => (
//         <TouchableOpacity style={styles.movieItem} onPress={() => selectMovie(item)}>
//             <Image
//                 source={{
//                 uri: item.poster_path
//                     ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
//                     : 'https://via.placeholder.com/92x138?text=No+Image'
//                 }}
//                 style={styles.moviePoster}
//             />
//             <View style={styles.movieInfo}>
//                 <Text style={styles.movieTitle} numberOfLines={1}>{item.title}</Text>
//                 <Text style={styles.movieYear}>
//                 {item.release_date ? item.release_date.substring(0, 4) : 'N/A'}
//                 </Text>
//             </View>
//             <Feather name="plus-circle" size={24} color="#BD0DC0" />
//         </TouchableOpacity>
//     );

//     // Renderiza o seletor de classificação por estrelas
//     const renderStars = () => {
//         return (
//         <View style={styles.ratingContainer}>
//             {[1, 2, 3, 4, 5].map((star) => (
//             <TouchableOpacity
//                 key={star}
//                 onPress={() => setRating(star)}
//                 style={styles.starButton}
//             >
//                 <Feather
//                 name="star"
//                 size={32}
//                 color={rating >= star ? "#FFD700" : "#3A3A3D"}
//                 />
//             </TouchableOpacity>
//             ))}
//         </View>
//         );
//     };

//     // Alternar a seleção de amigos para recomendação
//     const toggleFriendSelection = (friend) => {
//         if (recommendTo.some(f => f.id === friend.id)) {
//         setRecommendTo(recommendTo.filter(f => f.id !== friend.id));
//         } else {
//         setRecommendTo([...recommendTo, friend]);
//         }
//     };

//     return (
//         <SafeAreaView style={styles.container}>
//             <StatusBar barStyle="light-content" backgroundColor="#18181B" />
            
//             <View style={{ height: insets.top > 0 ? 0 : 12 }} />
            
//             <KeyboardAvoidingView
//                 behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//                 style={{ flex: 1 }}
//                 keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
//             >
//                 {/* Header */}
//                 <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 4 : 16 }]}>
//                     <Text style={styles.headerTitle}>Adicionar Conteúdo</Text>
//                 </View>

//                 {/* Search Input */}
//                 <View style={styles.searchContainer}>
//                 <Feather name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
//                 <TextInput
//                     style={styles.searchInput}
//                     placeholder="Buscar um filme ou série..."
//                     placeholderTextColor="#9CA3AF"
//                     value={searchQuery}
//                     onChangeText={setSearchQuery}
//                 />
//                 {searchQuery.length > 0 && (
//                     <TouchableOpacity onPress={() => setSearchQuery('')}>
//                     <Feather name="x" size={20} color="#9CA3AF" />
//                     </TouchableOpacity>
//                 )}
//                 </View>

//                 {/* Loading Indicator */}
//                 {isLoading && !modalVisible && (
//                     <View style={styles.loadingContainer}>
//                         <ActivityIndicator size="large" color="#BD0DC0" />
//                     </View>
//                 )}

//                 {/* Empty State */}
//                 {!isLoading && searchResults.length === 0 && searchQuery.length === 0 && (
//                     <View style={styles.emptyContainer}>
//                         <Feather name="film" size={60} color="#3A3A3D" />
//                         <Text style={styles.emptyTitle}>Adicione um filme ou série</Text>
//                         <Text style={styles.emptySubtitle}>
//                         Busque um título e selecione se você já assistiu, quer assistir ou deseja recomendar a um amigo.
//                         </Text>
//                     </View>
//                 )}

//                 {/* Search Results */}
//                 {!isLoading && searchResults.length > 0 && (
//                     <FlatList
//                         data={searchResults}
//                         renderItem={renderMovieItem}
//                         keyExtractor={(item) => item.id.toString()}
//                         contentContainerStyle={[
//                             styles.resultsList,
//                             { paddingBottom: insets.bottom + 70 }
//                         ]}
//                     />
//                 )}

//                 {/* No Results Message */}
//                 {!isLoading && searchQuery.length > 2 && searchResults.length === 0 && (
//                     <View style={styles.noResultsContainer}>
//                         <Feather name="search" size={40} color="#3A3A3D" />
//                         <Text style={styles.noResultsText}>
//                             Nenhum resultado encontrado para "{searchQuery}"
//                         </Text>
//                     </View>
//                 )}

//                 {/* Modal para adicionar conteúdo */}
//                 <Modal
//                     animationType="slide"
//                     transparent={true}
//                     visible={modalVisible}
//                     onRequestClose={() => setModalVisible(false)}
//                 >
//                     <View style={styles.modalOverlay}>
//                         <View style={[styles.modalContainer, { paddingBottom: insets.bottom + 16 }]}>
//                             {/* Modal Header */}
//                             <View style={styles.modalHeader}>
//                                 <Text style={styles.modalTitle}>Adicionar Conteúdo</Text>
//                                 <TouchableOpacity onPress={() => setModalVisible(false)}>
//                                 <Feather name="x" size={24} color="white" />
//                                 </TouchableOpacity>
//                             </View>

//                             <ScrollView style={styles.modalContent}>
//                                 {/* Filme Selecionado */}
//                                 {selectedMovie && (
//                                     <View style={styles.selectedMovieContainer}>
//                                         <Image
//                                             source={{
//                                                 uri: selectedMovie.poster_path
//                                                 ? `https://image.tmdb.org/t/p/w185${selectedMovie.poster_path}`
//                                                 : 'https://via.placeholder.com/185x278?text=No+Image'
//                                             }}
//                                             style={styles.selectedMoviePoster}
//                                         />
//                                         <View style={styles.selectedMovieInfo}>
//                                             <Text style={styles.selectedMovieTitle}>{selectedMovie.title}</Text>
//                                             <Text style={styles.selectedMovieYear}>
//                                                 {selectedMovie.release_date ? selectedMovie.release_date.substring(0, 4) : 'N/A'}
//                                             </Text>
//                                             {/* ✅ SINOPSE ADICIONADA */}
//                                             {selectedMovie.overview && (
//                                                 <Text style={styles.selectedMovieOverview} numberOfLines={3}>
//                                                     {selectedMovie.overview}
//                                                 </Text>
//                                             )}
//                                         </View>
//                                     </View>
//                                 )}

//                                 {/* Opções de Tipo de Conteúdo */}
//                                 <Text style={styles.sectionTitle}>O que você deseja fazer?</Text>
                                
//                                 {/* Primeira linha de botões */}
//                                 <View style={styles.contentTypeContainer}>
//                                     <TouchableOpacity
//                                         style={[
//                                             styles.contentTypeButton,
//                                             (contentType === 'watched' || movieStatus.isWatched) && styles.contentTypeButtonActive,
//                                             movieStatus.isWatched && styles.alreadyInListButton
//                                         ]}
//                                         onPress={() => setContentType('watched')}
//                                     >
//                                         <Feather
//                                             name="check-circle"
//                                             size={24}
//                                             color={(contentType === 'watched' || movieStatus.isWatched) ? "#BD0DC0" : "#FFFFFF"}
//                                         />
//                                         <Text
//                                             style={[
//                                                 styles.contentTypeText,
//                                                 (contentType === 'watched' || movieStatus.isWatched) && styles.contentTypeTextActive
//                                             ]}
//                                         >
//                                             {movieStatus.isWatched ? 'Assistido ✓' : 'Já vi'}
//                                         </Text>
//                                     </TouchableOpacity>

//                                     <TouchableOpacity
//                                         style={[
//                                             styles.contentTypeButton,
//                                             (contentType === 'watchlist' || movieStatus.isInWatchlist) && styles.contentTypeButtonActive,
//                                             movieStatus.isInWatchlist && styles.alreadyInListButton
//                                         ]}
//                                         onPress={() => setContentType('watchlist')}
//                                     >
//                                         <Feather
//                                             name="bookmark"
//                                             size={24}
//                                             color={(contentType === 'watchlist' || movieStatus.isInWatchlist) ? "#BD0DC0" : "#FFFFFF"}
//                                         />
//                                         <Text
//                                             style={[
//                                                 styles.contentTypeText,
//                                                 (contentType === 'watchlist' || movieStatus.isInWatchlist) && styles.contentTypeTextActive
//                                             ]}
//                                         >
//                                             {movieStatus.isInWatchlist ? 'Na Lista ✓' : 'Quero ver'}
//                                         </Text>
//                                     </TouchableOpacity>
//                                 </View>

//                                 {/* Segunda linha de botões */}
//                                 <View style={styles.contentTypeContainer}>
//                                     <TouchableOpacity
//                                         style={[
//                                             styles.contentTypeButton,
//                                             (contentType === 'favorite' || movieStatus.isFavorited) && styles.contentTypeButtonActive,
//                                             movieStatus.isFavorited && styles.favoriteActiveButton
//                                         ]}
//                                         onPress={() => setContentType('favorite')}
//                                     >
//                                         <Feather
//                                             name="heart"
//                                             size={24}
//                                             color={(contentType === 'favorite' || movieStatus.isFavorited) ? "#EF4444" : "#FFFFFF"}
//                                         />
//                                         <Text
//                                             style={[
//                                                 styles.contentTypeText,
//                                                 (contentType === 'favorite' || movieStatus.isFavorited) && { color: "#EF4444" }
//                                             ]}
//                                         >
//                                             {movieStatus.isFavorited ? 'Favorito ✓' : 'Favoritar'}
//                                         </Text>
//                                     </TouchableOpacity>

//                                     <TouchableOpacity
//                                         style={[
//                                             styles.contentTypeButton,
//                                             contentType === 'recommend' && styles.contentTypeButtonActive
//                                         ]}
//                                         onPress={() => setContentType('recommend')}
//                                     >
//                                         <Feather
//                                             name="share-2"
//                                             size={24}
//                                             color={contentType === 'recommend' ? "#BD0DC0" : "#FFFFFF"}
//                                         />
//                                         <Text
//                                             style={[
//                                                 styles.contentTypeText,
//                                                 contentType === 'recommend' && styles.contentTypeTextActive
//                                             ]}
//                                         >
//                                             Recomendar
//                                         </Text>
//                                     </TouchableOpacity>
//                                 </View>

//                                 {/* Campos adicionais baseados no tipo selecionado */}
//                                 {contentType === 'watched' && (
//                                     <View style={styles.additionalFieldsContainer}>
//                                         <Text style={styles.sectionTitle}>Avaliação</Text>
//                                         {renderStars()}

//                                         <Text style={styles.sectionTitle}>Sua opinião (opcional)</Text>
//                                         <TextInput
//                                             style={styles.reviewInput}
//                                             placeholder="O que você achou deste filme?"
//                                             placeholderTextColor="#9CA3AF"
//                                             multiline
//                                             numberOfLines={4}
//                                             value={review}
//                                             onChangeText={setReview}
//                                         />
//                                     </View>
//                                 )}

//                                 {contentType === 'watchlist' && (
//                                     <View style={styles.additionalFieldsContainer}>
//                                         <Text style={styles.sectionTitle}>Observação (opcional)</Text>
//                                         <TextInput
//                                             style={styles.reviewInput}
//                                             placeholder="Por que você quer assistir este filme?"
//                                             placeholderTextColor="#9CA3AF"
//                                             multiline
//                                             numberOfLines={4}
//                                             value={review}
//                                             onChangeText={setReview}
//                                         />
//                                     </View>
//                                 )}

//                                 {contentType === 'favorite' && (
//                                     <View style={styles.additionalFieldsContainer}>
//                                         <Text style={styles.sectionTitle}>Por que é especial? (opcional)</Text>
//                                         <TextInput
//                                             style={styles.reviewInput}
//                                             placeholder="O que torna este filme especial para você?"
//                                             placeholderTextColor="#9CA3AF"
//                                             multiline
//                                             numberOfLines={4}
//                                             value={review}
//                                             onChangeText={setReview}
//                                         />
//                                     </View>
//                                 )}

//                                 {contentType === 'recommend' && (
//                                     <View style={styles.additionalFieldsContainer}>
//                                         <Text style={styles.sectionTitle}>Avaliação</Text>
//                                         {renderStars()}

//                                         <Text style={styles.sectionTitle}>Por que você recomenda?</Text>
//                                         <TextInput
//                                             style={styles.reviewInput}
//                                             placeholder="Diga por que seus amigos deveriam assistir este filme"
//                                             placeholderTextColor="#9CA3AF"
//                                             multiline
//                                             numberOfLines={4}
//                                             value={review}
//                                             onChangeText={setReview}
//                                         />

//                                         <View style={styles.recommendToContainer}>
//                                             <Text style={styles.sectionTitle}>Recomendar para</Text>
//                                             <TouchableOpacity
//                                                 style={styles.selectFriendsButton}
//                                                 onPress={() => setRecommendModalVisible(true)}
//                                             >
//                                                 <Text style={styles.selectFriendsText}>
//                                                     {recommendTo.length === 0
//                                                         ? "Selecionar amigos"
//                                                         : `${recommendTo.length} amigo${recommendTo.length > 1 ? 's' : ''} selecionado${recommendTo.length > 1 ? 's' : ''}`}
//                                                 </Text>
//                                                 <Feather name="chevron-right" size={20} color="#BD0DC0" />
//                                             </TouchableOpacity>

//                                             {recommendTo.length > 0 && (
//                                                 <View style={styles.selectedFriendsContainer}>
//                                                     {recommendTo.map((friend) => (
//                                                         <View key={friend.id} style={styles.selectedFriendItem}>
//                                                             <Image source={{ uri: friend.avatar }} style={styles.friendAvatar} />
//                                                             <Text style={styles.friendName}>{friend.name}</Text>
//                                                         </View>
//                                                     ))}
//                                                 </View>
//                                             )}
//                                         </View>
//                                     </View>
//                                 )}

//                                 {/* Botão de Adicionar */}
//                                 <TouchableOpacity
//                                     style={[
//                                         styles.addButton,
//                                         (!contentType || isLoading || moviesLoading) && styles.addButtonDisabled
//                                     ]}
//                                     onPress={addContent}
//                                     disabled={!contentType || isLoading || moviesLoading}
//                                 >
//                                     {(isLoading || moviesLoading) ? (
//                                         <ActivityIndicator size="small" color="#FFFFFF" />
//                                     ) : (
//                                         <Text style={styles.addButtonText}>
//                                             {contentType === 'watched'
//                                                 ? "Marcar como assistido"
//                                                 : contentType === 'watchlist'
//                                                 ? "Adicionar à lista"
//                                                 : contentType === 'favorite'
//                                                 ? "Adicionar aos favoritos"
//                                                 : contentType === 'recommend'
//                                                 ? "Recomendar"
//                                                 : "Adicionar"
//                                             }
//                                         </Text>
//                                     )}
//                                 </TouchableOpacity>
//                             </ScrollView>
//                         </View>
//                     </View>
//                 </Modal>

//                 {/* Modal para selecionar amigos */}
//                 <Modal
//                     animationType="slide"
//                     transparent={true}
//                     visible={recommendModalVisible}
//                     onRequestClose={() => setRecommendModalVisible(false)}
//                 >
//                     <View style={styles.modalOverlay}>
//                         <View style={[styles.modalContainer, { paddingBottom: insets.bottom + 16 }]}>
//                             <View style={styles.modalHeader}>
//                                 <Text style={styles.modalTitle}>Selecionar Amigos</Text>
//                                 <TouchableOpacity onPress={() => setRecommendModalVisible(false)}>
//                                     <Feather name="x" size={24} color="white" />
//                                 </TouchableOpacity>
//                             </View>

//                             <FlatList
//                                 data={friends}
//                                 keyExtractor={(item) => item.id.toString()}
//                                 renderItem={({ item }) => (
//                                     <TouchableOpacity
//                                         style={styles.friendItem}
//                                         onPress={() => toggleFriendSelection(item)}
//                                     >
//                                         <View style={styles.friendInfo}>
//                                             <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
//                                             <Text style={styles.friendName}>{item.name}</Text>
//                                         </View>
//                                         <View style={styles.checkboxContainer}>
//                                             {recommendTo.some(f => f.id === item.id) ? (
//                                                 <Feather name="check-square" size={24} color="#BD0DC0" />
//                                             ) : (
//                                                 <Feather name="square" size={24} color="#3A3A3D" />
//                                             )}
//                                         </View>
//                                     </TouchableOpacity>
//                                 )}
//                                 contentContainerStyle={styles.friendsList}
//                             />

//                             <TouchableOpacity
//                                 style={styles.confirmButton}
//                                 onPress={() => setRecommendModalVisible(false)}
//                             >
//                                 <Text style={styles.confirmButtonText}>Confirmar</Text>
//                             </TouchableOpacity>
//                         </View>
//                     </View>
//                 </Modal>

//             </KeyboardAvoidingView>
//         </SafeAreaView>
//     );
// };


// // import React from 'react';
// // import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

// // const AddContentScreen = () => {
// //     return (
// //         <SafeAreaView style={styles.container}>
// //             <StatusBar barStyle="light-content" />
// //             <View style={styles.content}>
// //                 <Text style={styles.title}>Adicionar amigos</Text>
// //                 <Text style={styles.description}>Tela em desenvolvimento</Text>
// //             </View>
// //         </SafeAreaView>
// //     );
// // };

// // const styles = StyleSheet.create({
// //     container: {
// //         flex: 1,
// //         backgroundColor: '#18181B',
// //     },
// //     content: {
// //         flex: 1,
// //         justifyContent: 'center',
// //         alignItems: 'center',
// //         padding: 20,
// //     },
// //     title: {
// //         fontSize: 24,
// //         fontWeight: 'bold',
// //         color: '#FFFFFF',
// //         marginBottom: 16,
// //     },
// //     description: {
// //         fontSize: 16,
// //         color: '#9CA3AF',
// //         textAlign: 'center',
// //     },
// // });

// // export default AddContentScreen;

// // import React, { useState, useEffect } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   SafeAreaView,
// //   TextInput,
// //   TouchableOpacity,
// //   FlatList,
// //   Image,
// //   KeyboardAvoidingView,
// //   Platform,
// //   Modal,
// //   ActivityIndicator,
// //   ScrollView,
// //   StatusBar
// // } from 'react-native';
// // import { Feather } from '@expo/vector-icons';
// // import { searchMovies } from '../services/api'; // Função para buscar filmes da API
// // import { useSafeAreaInsets } from 'react-native-safe-area-context';
// // import { useMovies } from '../contexts/useMovies';

// // const AddContentScreen = ({ navigation }) => {
// //     // Estados
// //     const [searchQuery, setSearchQuery] = useState('');
// //     const [searchResults, setSearchResults] = useState([]);
// //     const [selectedMovie, setSelectedMovie] = useState(null);
// //     const [isLoading, setIsLoading] = useState(false);
// //     const [modalVisible, setModalVisible] = useState(false);
// //     const [contentType, setContentType] = useState(''); // 'watched', 'watchlist', 'recommend'
// //     const [rating, setRating] = useState(0);
// //     const [review, setReview] = useState('');
// //     const [recommendTo, setRecommendTo] = useState([]);
// //     const [recommendModalVisible, setRecommendModalVisible] = useState(false);
// //     const insets = useSafeAreaInsets(); // Obter as insets da área segura

// //     // Amigos mockados para a função de recomendação
// //     const friends = [
// //         { id: 1, name: 'Ana Silva', avatar: 'https://i.pravatar.cc/150?img=1' },
// //         { id: 2, name: 'Carlos Mendes', avatar: 'https://i.pravatar.cc/150?img=2' },
// //         { id: 3, name: 'Julia Costa', avatar: 'https://i.pravatar.cc/150?img=5' },
// //         { id: 4, name: 'Pedro Alves', avatar: 'https://i.pravatar.cc/150?img=8' },
// //         { id: 5, name: 'Mariana Dias', avatar: 'https://i.pravatar.cc/150?img=9' },
// //     ];

// //     // Busca filmes quando o usuário digita
// //     useEffect(() => {
// //         const delayDebounceFn = setTimeout(async () => {
// //             if (searchQuery.length > 2) {
// //                 setIsLoading(true);
// //                 try {
// //                     const results = await searchMovies(searchQuery);
// //                     setSearchResults(results.slice(0, 10)); // Limita a 10 resultados
// //                 } catch (error) {
// //                     console.error('Erro ao buscar filmes:', error);
// //                 } finally {
// //                     setIsLoading(false);
// //                 }
// //             } else {
// //                 setSearchResults([]);
// //             }
// //         }, 500); // Espera 500ms após o usuário parar de digitar

// //         return () => clearTimeout(delayDebounceFn);
// //     }, [searchQuery]);

// //     // Seleciona um filme e abre o modal
// //     const selectMovie = (movie) => {
// //         setSelectedMovie(movie);
// //         setModalVisible(true);
// //         setContentType(''); // Reset tipo de conteúdo
// //         setRating(0); // Reset rating
// //         setReview(''); // Reset review
// //         setRecommendTo([]); // Reset recomendações
// //     };

// //     // Renderiza os resultados da busca
// //     const renderMovieItem = ({ item }) => (
// //         <TouchableOpacity style={styles.movieItem} onPress={() => selectMovie(item)}>
// //         <Image
// //             source={{
// //             uri: item.poster_path
// //                 ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
// //                 : 'https://via.placeholder.com/92x138?text=No+Image'
// //             }}
// //             style={styles.moviePoster}
// //         />
// //         <View style={styles.movieInfo}>
// //             <Text style={styles.movieTitle} numberOfLines={1}>{item.title}</Text>
// //             <Text style={styles.movieYear}>
// //             {item.release_date ? item.release_date.substring(0, 4) : 'N/A'}
// //             </Text>
// //         </View>
// //         <Feather name="plus-circle" size={24} color="#BD0DC0" />
// //         </TouchableOpacity>
// //     );

// //     // Renderiza o seletor de classificação por estrelas
// //     const renderStars = () => {
// //         return (
// //         <View style={styles.ratingContainer}>
// //             {[1, 2, 3, 4, 5].map((star) => (
// //             <TouchableOpacity
// //                 key={star}
// //                 onPress={() => setRating(star)}
// //                 style={styles.starButton}
// //             >
// //                 <Feather
// //                 name={rating >= star ? "star" : "star"}
// //                 size={32}
// //                 color={rating >= star ? "#FFD700" : "#3A3A3D"}
// //                 />
// //             </TouchableOpacity>
// //             ))}
// //         </View>
// //         );
// //     };

// //     // Função para adicionar conteúdo
// //     const addContent = async () => {
// //         if (!contentType || !selectedMovie) return;

// //         setIsLoading(true);
// //         try {
// //         // Aqui você implementará a lógica para salvar no Firebase
// //         // Ex: const movieData = {
// //         //   movieId: selectedMovie.id,
// //         //   title: selectedMovie.title,
// //         //   posterPath: selectedMovie.poster_path,
// //         //   contentType,
// //         //   rating,
// //         //   review,
// //         //   timestamp: new Date().toISOString(),
// //         //   recommendTo: contentType === 'recommend' ? recommendTo : []
// //         // };
// //         // await addMovieToUserCollection(movieData);

// //         // Feedback de sucesso
// //         setModalVisible(false);
// //         // Opcional: notificação de sucesso
// //         // Alert.alert('Sucesso', 'Filme adicionado com sucesso!');
        
// //         // Implementação simulada para exemplo
// //         console.log('Filme adicionado:', {
// //             movie: selectedMovie.title,
// //             type: contentType,
// //             rating,
// //             review,
// //             recommendTo: recommendTo.map(friend => friend.name)
// //         });
        
// //         // Navegar para a tela apropriada
// //         if (contentType === 'recommend' && recommendTo.length > 0) {
// //             // Sucesso na recomendação
// //             setModalVisible(false);
// //             setTimeout(() => {
// //             // Você pode navegar para uma tela de confirmação ou feed
// //             navigation.navigate('HomeTab'); 
// //             }, 1500);
// //         } else {
// //             setModalVisible(false);
// //         }
// //         } catch (error) {
// //         console.error('Erro ao adicionar filme:', error);
// //         // Alert.alert('Erro', 'Não foi possível adicionar o filme. Tente novamente.');
// //         } finally {
// //         setIsLoading(false);
// //         }
// //     };

// //     // Alternar a seleção de amigos para recomendação
// //     const toggleFriendSelection = (friend) => {
// //         if (recommendTo.some(f => f.id === friend.id)) {
// //         setRecommendTo(recommendTo.filter(f => f.id !== friend.id));
// //         } else {
// //         setRecommendTo([...recommendTo, friend]);
// //         }
// //     };

// //     return (
// //         <SafeAreaView style={styles.container}>
// //             <StatusBar barStyle="light-content" backgroundColor="#18181B" />
            
// //             {/* Espaço superior extra para compensar a remoção do cabeçalho */}
// //             <View style={{ height: insets.top > 0 ? 0 : 12 }} />
            
// //             <KeyboardAvoidingView
// //                 behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
// //                 style={{ flex: 1 }}
// //                 keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
// //             >
// //                 {/* Header */}
// //                 <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 4 : 16 }]}>
// //                     <Text style={styles.headerTitle}>Adicionar Conteúdo</Text>
// //                 </View>

// //                 {/* Search Input */}
// //                 <View style={styles.searchContainer}>
// //                 <Feather name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
// //                 <TextInput
// //                     style={styles.searchInput}
// //                     placeholder="Buscar um filme ou série..."
// //                     placeholderTextColor="#9CA3AF"
// //                     value={searchQuery}
// //                     onChangeText={setSearchQuery}
// //                 />
// //                 {searchQuery.length > 0 && (
// //                     <TouchableOpacity onPress={() => setSearchQuery('')}>
// //                     <Feather name="x" size={20} color="#9CA3AF" />
// //                     </TouchableOpacity>
// //                 )}
// //                 </View>

// //                 {/* Loading Indicator */}
// //                 {isLoading && !modalVisible && (
// //                     <View style={styles.loadingContainer}>
// //                         <ActivityIndicator size="large" color="#BD0DC0" />
// //                     </View>
// //                 )}

// //                 {/* Empty State - Instruções Iniciais */}
// //                 {!isLoading && searchResults.length === 0 && searchQuery.length === 0 && (
// //                     <View style={styles.emptyContainer}>
// //                         <Feather name="film" size={60} color="#3A3A3D" />
// //                         <Text style={styles.emptyTitle}>Adicione um filme ou série</Text>
// //                         <Text style={styles.emptySubtitle}>
// //                         Busque um título e selecione se você já assistiu, quer assistir ou deseja recomendar a um amigo.
// //                         </Text>
// //                     </View>
// //                 )}

// //                 {/* Search Results */}
// //                 {!isLoading && searchResults.length > 0 && (
// //                     <FlatList
// //                         data={searchResults}
// //                         renderItem={renderMovieItem}
// //                         keyExtractor={(item) => item.id.toString()}
// //                         contentContainerStyle={[
// //                             styles.resultsList,
// //                             { paddingBottom: insets.bottom + 70 } // Adiciona padding para a tab bar
// //                         ]}
// //                     />
// //                 )}

// //                 {/* No Results Message */}
// //                 {!isLoading && searchQuery.length > 2 && searchResults.length === 0 && (
// //                     <View style={styles.noResultsContainer}>
// //                         <Feather name="search" size={40} color="#3A3A3D" />
// //                         <Text style={styles.noResultsText}>
// //                             Nenhum resultado encontrado para "{searchQuery}"
// //                         </Text>
// //                     </View>
// //                 )}

// //                 {/* Modal para adicionar conteúdo */}
// //                 <Modal
// //                     animationType="slide"
// //                     transparent={true}
// //                     visible={modalVisible}
// //                     onRequestClose={() => setModalVisible(false)}
// //                 >
// //                     <View style={styles.modalOverlay}>
// //                         <View style={[styles.modalContainer, { paddingBottom: insets.bottom + 16 }]}>
// //                             {/* Modal Header */}
// //                             <View style={styles.modalHeader}>
// //                                 <Text style={styles.modalTitle}>Adicionar Conteúdo</Text>
// //                                 <TouchableOpacity onPress={() => setModalVisible(false)}>
// //                                 <Feather name="x" size={24} color="white" />
// //                                 </TouchableOpacity>
// //                             </View>

// //                             <ScrollView style={styles.modalContent}>
// //                                 {/* Filme Selecionado */}
// //                                 {selectedMovie && (
// //                                     <View style={styles.selectedMovieContainer}>
// //                                         <Image
// //                                             source={{
// //                                                 uri: selectedMovie.poster_path
// //                                                 ? `https://image.tmdb.org/t/p/w185${selectedMovie.poster_path}`
// //                                                 : 'https://via.placeholder.com/185x278?text=No+Image'
// //                                             }}
// //                                             style={styles.selectedMoviePoster}
// //                                         />
// //                                         <View style={styles.selectedMovieInfo}>
// //                                             <Text style={styles.selectedMovieTitle}>{selectedMovie.title}</Text>
// //                                             <Text style={styles.selectedMovieYear}>
// //                                                 {selectedMovie.release_date ? selectedMovie.release_date.substring(0, 4) : 'N/A'}
// //                                             </Text>
// //                                         </View>
// //                                     </View>
// //                                 )}

// //                                 {/* Opções de Tipo de Conteúdo */}
// //                                 <Text style={styles.sectionTitle}>O que você deseja fazer?</Text>
// //                                 <View style={styles.contentTypeContainer}>
// //                                     <TouchableOpacity
// //                                         style={[
// //                                             styles.contentTypeButton,
// //                                             contentType === 'watched' && styles.contentTypeButtonActive
// //                                         ]}
// //                                         onPress={() => setContentType('watched')}
// //                                     >
// //                                         <Feather
// //                                             name="check-circle"
// //                                             size={24}
// //                                             color={contentType === 'watched' ? "#BD0DC0" : "#FFFFFF"}
// //                                         />
// //                                         <Text
// //                                             style={[
// //                                                 styles.contentTypeText,
// //                                                 contentType === 'watched' && styles.contentTypeTextActive
// //                                             ]}
// //                                         >
// //                                             Já vi
// //                                         </Text>
// //                                     </TouchableOpacity>

// //                                     <TouchableOpacity
// //                                         style={[
// //                                         styles.contentTypeButton,
// //                                         contentType === 'watchlist' && styles.contentTypeButtonActive
// //                                         ]}
// //                                         onPress={() => setContentType('watchlist')}
// //                                     >
// //                                         <Feather
// //                                         name="bookmark"
// //                                         size={24}
// //                                         color={contentType === 'watchlist' ? "#BD0DC0" : "#FFFFFF"}
// //                                         />
// //                                         <Text
// //                                         style={[
// //                                             styles.contentTypeText,
// //                                             contentType === 'watchlist' && styles.contentTypeTextActive
// //                                         ]}
// //                                         >
// //                                         Quero ver
// //                                         </Text>
// //                                     </TouchableOpacity>

// //                                     <TouchableOpacity
// //                                         style={[
// //                                             styles.contentTypeButton,
// //                                             contentType === 'recommend' && styles.contentTypeButtonActive
// //                                         ]}
// //                                         onPress={() => setContentType('recommend')}
// //                                     >
// //                                         <Feather
// //                                             name="share-2"
// //                                             size={24}
// //                                             color={contentType === 'recommend' ? "#BD0DC0" : "#FFFFFF"}
// //                                         />
// //                                         <Text
// //                                             style={[
// //                                                 styles.contentTypeText,
// //                                                 contentType === 'recommend' && styles.contentTypeTextActive
// //                                             ]}
// //                                         >
// //                                             Recomendar
// //                                         </Text>
// //                                     </TouchableOpacity>
// //                                 </View>

// //                                 {/* Campos adicionais baseados no tipo selecionado */}
// //                                 {contentType === 'watched' && (
// //                                     <View style={styles.additionalFieldsContainer}>
// //                                         <Text style={styles.sectionTitle}>Avaliação</Text>
// //                                         {renderStars()}

// //                                         <Text style={styles.sectionTitle}>Sua opinião (opcional)</Text>
// //                                         <TextInput
// //                                             style={styles.reviewInput}
// //                                             placeholder="O que você achou deste filme?"
// //                                             placeholderTextColor="#9CA3AF"
// //                                             multiline
// //                                             numberOfLines={4}
// //                                             value={review}
// //                                             onChangeText={setReview}
// //                                         />
// //                                     </View>
// //                                 )}

// //                                 {contentType === 'watchlist' && (
// //                                     <View style={styles.additionalFieldsContainer}>
// //                                         <Text style={styles.sectionTitle}>Observação (opcional)</Text>
// //                                         <TextInput
// //                                             style={styles.reviewInput}
// //                                             placeholder="Por que você quer assistir este filme?"
// //                                             placeholderTextColor="#9CA3AF"
// //                                             multiline
// //                                             numberOfLines={4}
// //                                             value={review}
// //                                             onChangeText={setReview}
// //                                         />
// //                                     </View>
// //                                 )}

// //                                 {contentType === 'recommend' && (
// //                                     <View style={styles.additionalFieldsContainer}>
// //                                         <Text style={styles.sectionTitle}>Avaliação</Text>
// //                                         {renderStars()}

// //                                         <Text style={styles.sectionTitle}>Por que você recomenda?</Text>
// //                                         <TextInput
// //                                             style={styles.reviewInput}
// //                                             placeholder="Diga por que seus amigos deveriam assistir este filme"
// //                                             placeholderTextColor="#9CA3AF"
// //                                             multiline
// //                                             numberOfLines={4}
// //                                             value={review}
// //                                             onChangeText={setReview}
// //                                         />

// //                                         <View style={styles.recommendToContainer}>
// //                                             <Text style={styles.sectionTitle}>Recomendar para</Text>
// //                                             <TouchableOpacity
// //                                                 style={styles.selectFriendsButton}
// //                                                 onPress={() => setRecommendModalVisible(true)}
// //                                             >
// //                                                 <Text style={styles.selectFriendsText}>
// //                                                     {recommendTo.length === 0
// //                                                         ? "Selecionar amigos"
// //                                                         : `${recommendTo.length} amigo${recommendTo.length > 1 ? 's' : ''} selecionado${recommendTo.length > 1 ? 's' : ''}`}
// //                                                 </Text>
// //                                                 <Feather name="chevron-right" size={20} color="#BD0DC0" />
// //                                             </TouchableOpacity>

// //                                             {/* Exibir amigos selecionados */}
// //                                             {recommendTo.length > 0 && (
// //                                                 <View style={styles.selectedFriendsContainer}>
// //                                                     {recommendTo.map((friend) => (
// //                                                         <View key={friend.id} style={styles.selectedFriendItem}>
// //                                                             <Image source={{ uri: friend.avatar }} style={styles.friendAvatar} />
// //                                                             <Text style={styles.friendName}>{friend.name}</Text>
// //                                                         </View>
// //                                                     ))}
// //                                                 </View>
// //                                             )}
// //                                         </View>
// //                                     </View>
// //                                 )}

// //                                 {/* Botão de Adicionar */}
// //                                 <TouchableOpacity
// //                                     style={[
// //                                         styles.addButton,
// //                                         (!contentType || isLoading) && styles.addButtonDisabled
// //                                     ]}
// //                                     onPress={addContent}
// //                                     disabled={!contentType || isLoading}
// //                                 >
// //                                     {isLoading ? (
// //                                         <ActivityIndicator size="small" color="#FFFFFF" />
// //                                     ) : (
// //                                         <Text style={styles.addButtonText}>
// //                                             {contentType === 'watched'
// //                                                 ? "Marcar como assistido"
// //                                                 : contentType === 'watchlist'
// //                                                 ? "Adicionar à lista"
// //                                                 : contentType === 'recommend'
// //                                                 ? "Recomendar"
// //                                                 : "Adicionar"
// //                                             }
// //                                         </Text>
// //                                     )}
// //                                 </TouchableOpacity>
// //                             </ScrollView>
// //                         </View>
// //                     </View>
// //                 </Modal>

// //                 {/* Modal para selecionar amigos */}
// //                 <Modal
// //                     animationType="slide"
// //                     transparent={true}
// //                     visible={recommendModalVisible}
// //                     onRequestClose={() => setRecommendModalVisible(false)}
// //                 >
// //                     <View style={styles.modalOverlay}>
// //                         <View style={[styles.modalContainer, { paddingBottom: insets.bottom + 16 }]}>
// //                             <View style={styles.modalHeader}>
// //                                 <Text style={styles.modalTitle}>Selecionar Amigos</Text>
// //                                 <TouchableOpacity onPress={() => setRecommendModalVisible(false)}>
// //                                     <Feather name="x" size={24} color="white" />
// //                                 </TouchableOpacity>
// //                             </View>

// //                             <FlatList
// //                                 data={friends}
// //                                 keyExtractor={(item) => item.id.toString()}
// //                                 renderItem={({ item }) => (
// //                                     <TouchableOpacity
// //                                         style={styles.friendItem}
// //                                         onPress={() => toggleFriendSelection(item)}
// //                                     >
// //                                         <View style={styles.friendInfo}>
// //                                             <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
// //                                             <Text style={styles.friendName}>{item.name}</Text>
// //                                         </View>
// //                                         <View style={styles.checkboxContainer}>
// //                                             {recommendTo.some(f => f.id === item.id) ? (
// //                                                 <Feather name="check-square" size={24} color="#BD0DC0" />
// //                                             ) : (
// //                                                 <Feather name="square" size={24} color="#3A3A3D" />
// //                                             )}
// //                                         </View>
// //                                     </TouchableOpacity>
// //                                 )}
// //                                 contentContainerStyle={styles.friendsList}
// //                             />

// //                             <TouchableOpacity
// //                                 style={styles.confirmButton}
// //                                 onPress={() => setRecommendModalVisible(false)}
// //                             >
// //                                 <Text style={styles.confirmButtonText}>Confirmar</Text>
// //                             </TouchableOpacity>
// //                         </View>
// //                     </View>
// //                 </Modal>

// //             </KeyboardAvoidingView>
// //         </SafeAreaView>
// //     );
// // };

// const styles = StyleSheet.create({
//   selectedMovieOverview: {
//     fontSize: 13,
//     color: '#D1D5DB',
//     lineHeight: 18,
//     marginTop: 8,
// },

// alreadyInListButton: {
//     backgroundColor: 'rgba(16, 185, 129, 0.15)',
//     borderColor: '#10B981',
// },

// favoriteActiveButton: {
//     backgroundColor: 'rgba(239, 68, 68, 0.15)',
//     borderColor: '#EF4444',
// },

//   container: {
//     flex: 1,
//     backgroundColor: '#18181B',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 16,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#27272A',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//     marginTop: 25,
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#27272A',
//     borderRadius: 8,
//     marginHorizontal: 16,
//     marginVertical: 16,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   searchInput: {
//     flex: 1,
//     color: '#FFFFFF',
//     fontSize: 16,
//     paddingVertical: 2,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 40,
//   },
//   emptyTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptySubtitle: {
//     fontSize: 16,
//     color: '#9CA3AF',
//     textAlign: 'center',
//     lineHeight: 22,
//   },
//   resultsList: {
//     paddingHorizontal: 16,
//   },
//   movieItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#27272A',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 12,
//   },
//   moviePoster: {
//     width: 46,
//     height: 70,
//     borderRadius: 4,
//     backgroundColor: '#3A3A3D',
//   },
//   movieInfo: {
//     flex: 1,
//     marginLeft: 14,
//   },
//   movieTitle: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#FFFFFF',
//     marginBottom: 4,
//   },
//   movieYear: {
//     fontSize: 14,
//     color: '#9CA3AF',
//   },
//   noResultsContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 40,
//   },
//   noResultsText: {
//     fontSize: 16,
//     color: '#9CA3AF',
//     textAlign: 'center',
//     marginTop: 16,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.7)',
//     justifyContent: 'flex-end',
//   },
//   modalContainer: {
//     backgroundColor: '#18181B',
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//     maxHeight: '85%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#27272A',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//   },
//   modalContent: {
//     padding: 16,
//   },
//   selectedMovieContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   selectedMoviePoster: {
//     width: 80,
//     height: 120,
//     borderRadius: 8,
//     backgroundColor: '#3A3A3D',
//   },
//   selectedMovieInfo: {
//     flex: 1,
//     marginLeft: 16,
//   },
//   selectedMovieTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//     marginBottom: 4,
//   },
//   selectedMovieYear: {
//     fontSize: 14,
//     color: '#9CA3AF',
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#FFFFFF',
//     marginBottom: 12,
//   },
//   contentTypeContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 24,
//   },
//   contentTypeButton: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#27272A',
//     borderRadius: 8,
//     paddingVertical: 12,
//     marginHorizontal: 4,
//   },
//   contentTypeButtonActive: {
//     backgroundColor: 'rgba(189, 13, 192, 0.15)',
//     borderWidth: 1,
//     borderColor: '#BD0DC0',
//   },
//   contentTypeText: {
//     fontSize: 14,
//     color: '#FFFFFF',
//     marginTop: 6,
//   },
//   contentTypeTextActive: {
//     color: '#BD0DC0',
//     fontWeight: '500',
//   },
//   additionalFieldsContainer: {
//     marginTop: 8,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginBottom: 24,
//   },
//   starButton: {
//     marginHorizontal: 8,
//   },
//   reviewInput: {
//     backgroundColor: '#27272A',
//     borderRadius: 8,
//     padding: 12,
//     color: '#FFFFFF',
//     textAlignVertical: 'top',
//     minHeight: 120,
//     marginBottom: 24,
//   },
//   recommendToContainer: {
//     marginTop: 8,
//   },
//   selectFriendsButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: '#27272A',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//   },
//   selectFriendsText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//   },
//   selectedFriendsContainer: {
//     marginBottom: 16,
//   },
//   selectedFriendItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#27272A',
//     borderRadius: 8,
//     padding: 8,
//     marginBottom: 8,
//   },
//   friendItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#27272A',
//   },
//   friendInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   friendAvatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     marginRight: 12,
//   },
//   friendName: {
//     fontSize: 16,
//     color: '#FFFFFF',
//   },
//   checkboxContainer: {
//     padding: 4,
//   },
//   friendsList: {
//     paddingBottom: 16,
//   },
//   addButton: {
//     backgroundColor: '#BD0DC0',
//     borderRadius: 8,
//     paddingVertical: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 8,
//     marginBottom: 16,
//   },
//   addButtonDisabled: {
//     backgroundColor: '#3A3A3D',
//   },
//   addButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   confirmButton: {
//     backgroundColor: '#BD0DC0',
//     borderRadius: 8,
//     paddingVertical: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginHorizontal: 16,
//     marginBottom: 16,
//   },
//   confirmButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '500',
//   },
// });

// export default AddContentScreen;