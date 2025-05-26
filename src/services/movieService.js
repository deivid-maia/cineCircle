
import { db } from './firebase';

// Serviço para gerenciar filmes dos usuários no Firestore
const movieService = {

    // Testar conexão com Firebase
    testConnection: async () => {
        try {
            console.log('MovieService - Testando conexão com Firebase...');

            // Fazer uma query simples para testar
            const testQuery = await db
                .collection('userMovies')
                .limit(1)
                .get();

            console.log('MovieService - Conexão OK! Firebase funcionando.');
            return { success: true, message: 'Conexão estabelecida' };
        } catch (error) {
            console.error('MovieService - Erro na conexão:', error);
            return { success: false, error: error.message };
        }
    },

    // Obter todos os filmes do usuário
    getUserMovies: async (userId) => {
        try {
            console.log('MovieService - Buscando filmes do usuário:', userId);

            const snapshot = await db
                .collection('userMovies')
                .where('userId', '==', userId)
                .orderBy('addedAt', 'desc')
                .get();

            const movies = [];
            snapshot.forEach((doc) => {
                movies.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            console.log('MovieService - Filmes encontrados:', movies.length);
            return movies;
        } catch (error) {
            console.error('MovieService - Erro ao buscar filmes:', error);
            throw error;
        }
    },

    // Adicionar um filme de teste
    addTestMovie: async (userId) => {
        try {
            console.log('MovieService - Adicionando filme de teste...');

            const testMovie = {
                userId,
                movieId: 550,
                title: 'Clube da Luta',
                posterPath: '/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg',
                releaseDate: '1999-10-15',
                voteAverage: 8.8,
                status: 'watched',
                isFavorite: true,
                userRating: 5,
                userReview: 'Filme incrível!',
                addedAt: new Date(),
                updatedAt: new Date()
            };

            const movieRef = db
                .collection('userMovies')
                .doc(`${userId}_${testMovie.movieId}`);

            await movieRef.set(testMovie);
            console.log('MovieService - Filme de teste adicionado com sucesso!');

            return { success: true, movie: testMovie };
        } catch (error) {
            console.error('MovieService - Erro ao adicionar filme de teste:', error);
            return { success: false, error: error.message };
        }
    },

    // Limpar filmes de teste
    clearTestMovies: async (userId) => {
        try {
            console.log('MovieService - Limpando filmes de teste...');

            const snapshot = await db
                .collection('userMovies')
                .where('userId', '==', userId)
                .get();

            const batch = db.batch();
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            console.log('MovieService - Filmes de teste removidos!');

            return { success: true };
        } catch (error) {
            console.error('MovieService - Erro ao limpar filmes:', error);
            return { success: false, error: error.message };
        }
    },

    // Atualizar status do filme
    updateMovieStatus: async (userId, movieData, status, isFavorite = false) => {
        try {
            console.log('MovieService - Atualizando status:', movieData.title, status);

            const movieRef = db
                .collection('userMovies')
                .doc(`${userId}_${movieData.id}`);

            const movieDoc = await movieRef.get();

            const updateData = {
                userId,
                movieId: movieData.id,
                title: movieData.title,
                posterPath: movieData.poster_path,
                releaseDate: movieData.release_date,
                voteAverage: movieData.vote_average,
                status,
                isFavorite,
                updatedAt: new Date()
            };

            if (movieDoc.exists) {
                // Atualizar filme existente
                const currentData = movieDoc.data();
                await movieRef.update({
                    ...updateData,
                    userRating: currentData.userRating || null,
                    userReview: currentData.userReview || '',
                    addedAt: currentData.addedAt || new Date()
                });
                console.log('MovieService - Filme atualizado');
            } else {
                // Criar novo filme
                await movieRef.set({
                    ...updateData,
                    userRating: null,
                    userReview: '',
                    addedAt: new Date()
                });
                console.log('MovieService - Novo filme adicionado');
            }

            return { success: true };
        } catch (error) {
            console.error('MovieService - Erro ao atualizar status:', error);
            return { success: false, error: error.message };
        }
    }
};

export default movieService;
