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

// 🔥 FUNÇÃO CORRIGIDA - Buscar filmes por gênero
export const getMoviesByGenre = async (genreId, page = 1) => {
    try {
        console.log(`🔍 [API] Buscando filmes do gênero ${genreId}, página ${page}`);
        
        const response = await api.get('/discover/movie', {
            params: {
                with_genres: genreId,
                page: page,
                sort_by: 'popularity.desc',
                vote_count_gte: 100, // Apenas filmes com pelo menos 100 votos
                include_adult: false, // Excluir conteúdo adulto
                'primary_release_date.gte': '1990-01-01', // Filmes a partir de 1990
            }
        });
        
        const movies = response.data.results || [];
        
        console.log(`✅ [API] Gênero ${genreId}: ${movies.length} filmes encontrados`);
        
        // Log dos primeiros filmes para debug
        if (movies.length > 0) {
            console.log(`📽️ [API] Primeiros filmes do gênero ${genreId}:`, 
                movies.slice(0, 5).map(movie => `"${movie.title}" (${movie.id})`)
            );
        } else {
            console.log(`⚠️ [API] Nenhum filme encontrado para gênero ${genreId}`);
        }
        
        return movies;
    } catch (error) {
        console.error(`❌ [API] Erro ao buscar filmes do gênero ${genreId}:`, error);
        console.error(`❌ [API] Detalhes do erro:`, {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
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