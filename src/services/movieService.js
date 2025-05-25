import { db, auth } from './firebase';

// Serviço para gerenciar filmes do usuário no Firebase
const movieService = {
    // Adicionar filme à lista do usuário
    addMovieToList: async (movie, listType, rating = null, review = null) => {
        try {
            console.log(`MovieService - Adicionando filme à lista ${listType}:`, movie.title);

            const currentUser = auth.currentUser;
            if (!currentUser) {
                return { success: false, error: 'Usuário não autenticado' };
            }

            const movieData = {
                id: movie.id,
                title: movie.title,
                posterPath: movie.poster_path,
                backdropPath: movie.backdrop_path,
                releaseDate: movie.release_date,
                overview: movie.overview,
                voteAverage: movie.vote_average,
                genres: movie.genres || [],
                runtime: movie.runtime || null,
                addedAt: new Date(),
                listType: listType, // 'watched', 'favorites', 'watchlist'
                rating: rating, // Rating do usuário (1-5 estrelas)
                review: review || null, // Resenha do usuário
                updatedAt: new Date()
            };

            // Usar o ID do filme como documento para evitar duplicatas
            await db
                .collection('users')
                .doc(currentUser.uid)
                .collection('movies')
                .doc(`${movie.id}_${listType}`)
                .set(movieData, { merge: true });

            console.log('MovieService - Filme adicionado com sucesso');
            return { success: true, movieData };
        } catch (error) {
            console.error('MovieService - Erro ao adicionar filme:', error);
            return { success: false, error: error.message || 'Erro ao adicionar filme.' };
        }
    },

    // Obter todos os filmes de uma lista específica
    getMoviesByList: async (listType, limit = 50) => {
        try {
            console.log(`MovieService - Buscando filmes da lista ${listType}`);

            const currentUser = auth.currentUser;
            if (!currentUser) {
                return { success: false, error: 'Usuário não autenticado' };
            }

            // Busca SEM orderBy para evitar erro de índice
            const snapshot = await db
                .collection('users')
                .doc(currentUser.uid)
                .collection('movies')
                .where('listType', '==', listType)
                .limit(limit)
                .get();

            const movies = [];
            snapshot.forEach(doc => {
                movies.push({
                    docId: doc.id,
                    ...doc.data()
                });
            });

            // Ordenar no cliente (JavaScript) em vez do servidor
            movies.sort((a, b) => {
                if (a.addedAt && b.addedAt) {
                    return b.addedAt.toDate() - a.addedAt.toDate();
                }
                return 0;
            });

            console.log(`MovieService - ${movies.length} filmes encontrados`);
            return { success: true, movies };
        } catch (error) {
            console.error('MovieService - Erro ao buscar filmes:', error);
            // Retornar array vazio em caso de erro para não quebrar a UI
            return { success: true, movies: [] };
        }
    },


    // Obter todos os filmes de uma lista específica
    //   getMoviesByList: async (listType, limit = 50) => {
    //     try {
    //       console.log(`MovieService - Buscando filmes da lista ${listType}`);

    //       const currentUser = auth.currentUser;
    //       if (!currentUser) {
    //         return { success: false, error: 'Usuário não autenticado' };
    //       }

    //       const snapshot = await db
    //         .collection('users')
    //         .doc(currentUser.uid)
    //         .collection('movies')
    //         .where('listType', '==', listType)
    //         .orderBy('addedAt', 'desc')
    //         .limit(limit)
    //         .get();

    //       const movies = [];
    //       snapshot.forEach(doc => {
    //         movies.push({
    //           docId: doc.id,
    //           ...doc.data()
    //         });
    //       });

    //       console.log(`MovieService - ${movies.length} filmes encontrados`);
    //       return { success: true, movies };
    //     } catch (error) {
    //       console.error('MovieService - Erro ao buscar filmes:', error);
    //       return { success: false, error: error.message || 'Erro ao buscar filmes.' };
    //     }
    //   },

    // Obter estatísticas do usuário
    getUserStats: async () => {
        try {
            console.log('MovieService - Buscando estatísticas do usuário');

            const currentUser = auth.currentUser;
            if (!currentUser) {
                return { success: false, error: 'Usuário não autenticado' };
            }

            const snapshot = await db
                .collection('users')
                .doc(currentUser.uid)
                .collection('movies')
                .get();

            const stats = {
                watched: 0,
                favorites: 0,
                watchlist: 0,
                totalReviews: 0,
                averageRating: 0
            };

            let totalRating = 0;
            let ratingCount = 0;

            snapshot.forEach(doc => {
                const data = doc.data();

                // Contar por tipo de lista
                if (data.listType === 'watched') stats.watched++;
                else if (data.listType === 'favorites') stats.favorites++;
                else if (data.listType === 'watchlist') stats.watchlist++;

                // Contar resenhas
                if (data.review && data.review.trim()) {
                    stats.totalReviews++;
                }

                // Calcular média de rating
                if (data.rating && data.rating > 0) {
                    totalRating += data.rating;
                    ratingCount++;
                }
            });

            // Calcular média de rating
            if (ratingCount > 0) {
                stats.averageRating = (totalRating / ratingCount).toFixed(1);
            }

            console.log('MovieService - Estatísticas calculadas:', stats);
            return { success: true, stats };
        } catch (error) {
            console.error('MovieService - Erro ao buscar estatísticas:', error);
            return { success: false, error: error.message || 'Erro ao buscar estatísticas.' };
        }
    },

    // Verificar se filme está em uma lista específica
    isMovieInList: async (movieId, listType) => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                return { success: false, error: 'Usuário não autenticado' };
            }

            const doc = await db
                .collection('users')
                .doc(currentUser.uid)
                .collection('movies')
                .doc(`${movieId}_${listType}`)
                .get();

            return { success: true, exists: doc.exists, data: doc.data() };
        } catch (error) {
            console.error('MovieService - Erro ao verificar filme:', error);
            return { success: false, error: error.message };
        }
    },

    // Remover filme da lista
    removeMovieFromList: async (movieId, listType) => {
        try {
            console.log(`MovieService - Removendo filme da lista ${listType}:`, movieId);

            const currentUser = auth.currentUser;
            if (!currentUser) {
                return { success: false, error: 'Usuário não autenticado' };
            }

            await db
                .collection('users')
                .doc(currentUser.uid)
                .collection('movies')
                .doc(`${movieId}_${listType}`)
                .delete();

            console.log('MovieService - Filme removido com sucesso');
            return { success: true };
        } catch (error) {
            console.error('MovieService - Erro ao remover filme:', error);
            return { success: false, error: error.message || 'Erro ao remover filme.' };
        }
    }
};

export default movieService;