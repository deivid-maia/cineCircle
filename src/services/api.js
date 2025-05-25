// FUNções de requisição à API do The Movie Database (TMDB)
import axios from 'axios';

const API_KEY = '016f73598274b62d7b8bfa183e10ec31';
const BASE_URL = 'https://api.themoviedb.org/3';

// Criar uma instância axios configurada
const api = axios.create({
    baseURL: BASE_URL,
    params: {
        api_key: API_KEY,
        language: 'pt-BR',
    },
});

// Obter filmes populares
export const getPopularMovies = async () => {
    try {
        const response = await api.get('/movie/popular');
        return response.data.results;
    } catch (error) {
        console.error('Erro ao buscar filmes populares:', error);
        return [];
    }
};

// Obter detalhes de um filme
// export const getMovieDetails = async (movieId) => {
//     try {
//         const response = await api.get(`/movie/${movieId}`);
//         return response.data;
//     } catch (error) {
//         console.error('Erro ao buscar detalhes do filme:', error);
//         return null;
//     }
// };
// Obter detalhes de um filme com informações adicionais
export const getMovieDetails = async (movieId) => {
    try {
        const response = await api.get(`/movie/${movieId}`, {
            params: {
                append_to_response: 'credits,videos,images',
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar detalhes do filme:', error);
        return null;
    }
};

// Obter recomendações de filmes similares
export const getMovieRecommendations = async (movieId, page = 1) => {
    try {
        const response = await api.get(`/movie/${movieId}/recommendations`, {
            params: {
                page,
            },
        });
        return response.data.results;
    } catch (error) {
        console.error('Erro ao buscar recomendações de filmes:', error);
        return [];
    }
};

// Adicionar função para filmes em destaque (necessária para a tela Home)
export const getTrendingMovies = async () => {
    try {
        const response = await api.get('/trending/movie/day');
        return response.data.results;
    } catch (error) {
        console.error('Erro ao buscar filmes em destaque:', error);
        return [];
    }
};

// Buscar filmes por gênero
export const getMoviesByGenre = async (genreId, page = 1) => {
    try {
        const response = await api.get('/discover/movie', {
        params: {
            with_genres: genreId,
            page,
        },
        });
        return response.data.results;
    } catch (error) {
        console.error('Erro ao buscar filmes por gênero:', error);
        return [];
    }
};

// Buscar filmes por busca
export const searchMovies = async (query, page = 1) => {
    try {
        const response = await api.get('/search/movie', {
        params: {
            query,
            page,
        },
        });
        return response.data.results;
    } catch (error) {
        console.error('Erro ao buscar filmes:', error);
        return [];
    }
};

// Obter lista de gêneros
export const getGenres = async () => {
    try {
        const response = await api.get('/genre/movie/list');
        return response.data.genres;
    } catch (error) {
        console.error('Erro ao buscar gêneros:', error);
        return [];
    }
};