import { useState, useEffect, useCallback } from 'react';
import movieService from '../services/movieService';
import { useAuth } from './AuthContext';

export const useMovies = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [userStats, setUserStats] = useState({
    watched: 0,
    favorites: 0,
    watchlist: 0,
    totalReviews: 0,
    averageRating: 0
  });

  // Carregar filmes de uma lista específica
  const loadMoviesList = useCallback(async (listType) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };
    
    setLoading(true);
    try {
      const result = await movieService.getMoviesByList(listType);
      
      if (result.success) {
        switch (listType) {
          case 'watched':
            setWatchedMovies(result.movies);
            break;
          case 'favorites':
            setFavoriteMovies(result.movies);
            break;
          case 'watchlist':
            setWatchlistMovies(result.movies);
            break;
        }
      }
      
      return result;
    } catch (error) {
      console.error('useMovies - Erro ao carregar lista:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Carregar estatísticas do usuário
  const loadUserStats = useCallback(async () => {
    if (!user) return;
    
    try {
      const result = await movieService.getUserStats();
      if (result.success) {
        setUserStats(result.stats);
      }
    } catch (error) {
      console.error('useMovies - Erro ao carregar estatísticas:', error);
    }
  }, [user]);

  // Adicionar filme a uma lista
  const addMovieToList = async (movie, listType, rating = null, review = null) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };
    
    setLoading(true);
    try {
      const result = await movieService.addMovieToList(movie, listType, rating, review);
      
      if (result.success) {
        // Atualizar a lista local correspondente
        const newMovie = result.movieData;
        
        switch (listType) {
          case 'watched':
            setWatchedMovies(prev => [newMovie, ...prev]);
            break;
          case 'favorites':
            setFavoriteMovies(prev => [newMovie, ...prev]);
            break;
          case 'watchlist':
            setWatchlistMovies(prev => [newMovie, ...prev]);
            break;
        }
        
        // Atualizar estatísticas
        await loadUserStats();
      }
      
      return result;
    } catch (error) {
      console.error('useMovies - Erro ao adicionar filme:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Remover filme de uma lista
  const removeMovieFromList = async (movieId, listType) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };
    
    setLoading(true);
    try {
      const result = await movieService.removeMovieFromList(movieId, listType);
      
      if (result.success) {
        // Remover da lista local correspondente
        const filterFn = (movie) => movie.id !== movieId;
        
        switch (listType) {
          case 'watched':
            setWatchedMovies(prev => prev.filter(filterFn));
            break;
          case 'favorites':
            setFavoriteMovies(prev => prev.filter(filterFn));
            break;
          case 'watchlist':
            setWatchlistMovies(prev => prev.filter(filterFn));
            break;
        }
        
        // Atualizar estatísticas
        await loadUserStats();
      }
      
      return result;
    } catch (error) {
      console.error('useMovies - Erro ao remover filme:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Verificar se um filme está em uma lista
  const isMovieInList = async (movieId, listType) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };
    
    try {
      return await movieService.isMovieInList(movieId, listType);
    } catch (error) {
      console.error('useMovies - Erro ao verificar filme:', error);
      return { success: false, error: error.message };
    }
  };

  // Carregar dados iniciais quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      loadUserStats();
      loadMoviesList('watched');
      loadMoviesList('favorites');
      loadMoviesList('watchlist');
    } else {
      // Limpar dados quando não há usuário
      setWatchedMovies([]);
      setFavoriteMovies([]);
      setWatchlistMovies([]);
      setUserStats({
        watched: 0,
        favorites: 0,
        watchlist: 0,
        totalReviews: 0,
        averageRating: 0
      });
    }
  }, [user, loadUserStats, loadMoviesList]);

  return {
    // Estados
    loading,
    watchedMovies,
    favoriteMovies,
    watchlistMovies,
    userStats,
    
    // Funções
    addMovieToList,
    removeMovieFromList,
    isMovieInList,
    loadMoviesList,
    loadUserStats,
  };
};