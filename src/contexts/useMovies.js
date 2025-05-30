import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db, auth } from '../services/firebase';
import activityService from '../services/activityService';

// Criar o contexto
const MoviesContext = createContext({});

// Hook personalizado para usar o contexto
export const useMovies = () => {
  const context = useContext(MoviesContext);
  if (!context) {
    throw new Error('useMovies deve ser usado dentro de um MoviesProvider');
  }
  return context;
};

// Provider do contexto de filmes
export const MoviesProvider = ({ children }) => {
  const { user } = useAuth();
  const [userMovies, setUserMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  // Carregar filmes do usuário quando ele logar
  useEffect(() => {
    if (user) {
      console.log('🎬 MoviesContext - Usuário logado, carregando filmes...', user.uid);
      refreshUserMovies();
    } else {
      console.log('🚫 MoviesContext - Usuário deslogado, limpando dados...');
      setUserMovies([]);
    }
  }, [user]);

  // Função para recarregar filmes do usuário
  const refreshUserMovies = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('❌ Sem usuário autenticado');
      return;
    }

    setLoading(true);
    try {
      console.log('📋 Carregando filmes do usuário:', currentUser.uid);
      
      const snapshot = await db.collection('userMovies')
        .where('userId', '==', currentUser.uid)
        .get();

      const movies = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        movies.push({
          id: doc.id,
          ...data,
          addedAt: data.addedAt?.toDate() || new Date()
        });
      });

      console.log('📊 Filmes carregados:', movies.length);
      setUserMovies(movies);
    } catch (error) {
      console.error('❌ Erro ao carregar filmes:', error);
      setUserMovies([]);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar filme à lista
  // const addMovieToList = async (movieData, status, options = {}) => {
  //   const currentUser = auth.currentUser;
  //   if (!currentUser) {
  //     throw new Error('Usuário não autenticado');
  //   }

  //   try {
  //     console.log('➕ Adicionando filme:', movieData.title, 'Status:', status);

  //     // Verificar se o filme já existe
  //     const existingQuery = await db.collection('userMovies')
  //       .where('userId', '==', currentUser.uid)
  //       .where('movieId', '==', movieData.id)
  //       .get();

  //     if (!existingQuery.empty) {
  //       // Atualizar filme existente
  //       const docRef = existingQuery.docs[0].ref;
  //       const currentData = existingQuery.docs[0].data();
        
  //       await docRef.update({
  //         status,
  //         isFavorite: options.isFavorite !== undefined ? options.isFavorite : currentData.isFavorite,
  //         userRating: options.rating || currentData.userRating,
  //         userReview: options.review || currentData.userReview,
  //         updatedAt: new Date()
  //       });
  //       console.log('✅ Filme atualizado');
  //     } else {
  //       // Criar novo filme
  //       const newMovie = {
  //         userId: currentUser.uid,
  //         movieId: movieData.id,
  //         title: movieData.title,
  //         posterPath: movieData.poster_path,
  //         releaseDate: movieData.release_date,
  //         overview: movieData.overview,
  //         voteAverage: movieData.vote_average,
  //         status,
  //         isFavorite: options.isFavorite || false,
  //         userRating: options.rating || null,
  //         userReview: options.review || '',
  //         addedAt: new Date(),
  //         updatedAt: new Date()
  //       };

  //       await db.collection('userMovies').add(newMovie);
  //       console.log('✅ Filme adicionado');
  //     }

  //     // Recarregar lista (mas não aguardar para melhor UX)
  //     setTimeout(() => refreshUserMovies(), 500);
  //     return { success: true };

  //   } catch (error) {
  //     console.error('❌ Erro ao adicionar filme:', error);
  //     throw error;
  //   }
  // };

  const addMovieToList = async (movieData, status, options = {}) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Usuário não autenticado');
  }

  try {
    console.log('➕ Adicionando filme:', movieData.title, 'Status:', status);

    // Verificar se o filme já existe
    const existingQuery = await db.collection('userMovies')
      .where('userId', '==', currentUser.uid)
      .where('movieId', '==', movieData.id)
      .get();

    let isNewMovie = existingQuery.empty;
    let activityType = null;

    if (!existingQuery.empty) {
      // Atualizar filme existente
      const docRef = existingQuery.docs[0].ref;
      const currentData = existingQuery.docs[0].data();
      
      await docRef.update({
        status,
        isFavorite: options.isFavorite !== undefined ? options.isFavorite : currentData.isFavorite,
        userRating: options.rating || currentData.userRating,
        userReview: options.review || currentData.userReview,
        updatedAt: new Date()
      });

      // Determinar tipo de atividade para filme existente
      if (options.rating && !currentData.userRating) {
        activityType = 'movie_rated';
      } else if (options.review && !currentData.userReview) {
        activityType = 'movie_reviewed';
      }

    } else {
      // Criar novo filme
      const newMovie = {
        userId: currentUser.uid,
        movieId: movieData.id,
        title: movieData.title,
        posterPath: movieData.poster_path,
        releaseDate: movieData.release_date,
        overview: movieData.overview,
        voteAverage: movieData.vote_average,
        status,
        isFavorite: options.isFavorite || false,
        userRating: options.rating || null,
        userReview: options.review || '',
        addedAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('userMovies').add(newMovie);

      // Determinar tipo de atividade para novo filme
      if (status === 'watched' && options.rating) {
        activityType = 'movie_rated';
      } else if (status) {
        activityType = 'movie_added';
      }
    }

    // 🔥 REGISTRAR ATIVIDADE
    if (activityType) {
      await activityService.recordMovieActivity(activityType, movieData, {
        rating: options.rating,
        review: options.review,
        isPublic: true // Você pode adicionar configuração de privacidade
      });
    }

    // Recarregar lista
    setTimeout(() => refreshUserMovies(), 500);
    return { success: true };

  } catch (error) {
    console.error('❌ Erro ao adicionar filme:', error);
    throw error;
  }
};


  // 🔥 FUNÇÃO CORRIGIDA - Alternar favorito
  const toggleFavorite = async (movieData) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    try {
      console.log('⭐ Alternando favorito:', movieData.title);
      
      const existingQuery = await db.collection('userMovies')
        .where('userId', '==', currentUser.uid)
        .where('movieId', '==', movieData.id)
        .get();

      if (!existingQuery.empty) {
        const doc = existingQuery.docs[0];
        const currentData = doc.data();
        const newFavoriteStatus = !currentData.isFavorite;
        
        // 🔥 LÓGICA CORRIGIDA: verificar se deve manter ou remover o filme
        if (newFavoriteStatus === false && (!currentData.status || currentData.status === null)) {
          // 🔥 Se não é mais favorito E não tem status, REMOVER COMPLETAMENTE
          await doc.ref.delete();
          
          // Remover do estado local
          setUserMovies(prevMovies => 
            prevMovies.filter(movie => movie.movieId !== movieData.id)
          );
          
          console.log('✅ Filme removido completamente (não favorito + sem status)');
        } else {
          // 🔥 Se ainda tem status OU vai ser favorito, apenas atualizar favorito
          await doc.ref.update({
            isFavorite: newFavoriteStatus,
            updatedAt: new Date()
          });
          
          // Atualizar estado local
          setUserMovies(prevMovies => 
            prevMovies.map(movie => 
              movie.movieId === movieData.id 
                ? { ...movie, isFavorite: newFavoriteStatus }
                : movie
            )
          );
          
          console.log('✅ Favorito alternado para:', newFavoriteStatus);
        }
      } else {
        // 🔥 FILME NÃO EXISTE - CRIAR APENAS COMO FAVORITO (sem status)
        const newMovie = {
          userId: currentUser.uid,
          movieId: movieData.id,
          title: movieData.title,
          posterPath: movieData.poster_path,
          releaseDate: movieData.release_date,
          overview: movieData.overview,
          voteAverage: movieData.vote_average,
          status: null, // 🔥 SEM STATUS INICIAL
          isFavorite: true, // 🔥 APENAS FAVORITO
          userRating: null,
          userReview: '',
          addedAt: new Date(),
          updatedAt: new Date()
        };

        await db.collection('userMovies').add(newMovie);
        
        // Atualizar estado local
        setUserMovies(prevMovies => [...prevMovies, {
          id: 'temp-' + Date.now(),
          ...newMovie,
          addedAt: new Date()
        }]);
        
        console.log('✅ Filme adicionado apenas como favorito');
      }

      return { success: true };

    } catch (error) {
      console.error('❌ Erro ao alterar favorito:', error);
      throw error;
    }
  };

  // 🔥 NOVA FUNÇÃO - Remover apenas status específico (mantém favorito se existir)
  const removeMovieStatus = async (movieId, statusToRemove) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    try {
      console.log('🔄 Removendo status:', statusToRemove, 'do filme ID:', movieId);
      
      const snapshot = await db.collection('userMovies')
        .where('userId', '==', currentUser.uid)
        .where('movieId', '==', movieId)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const currentData = doc.data();
        
        console.log('📋 Dados atuais do filme:', {
          status: currentData.status,
          isFavorite: currentData.isFavorite
        });
        
        // 🔥 LÓGICA INTELIGENTE: verificar o que manter
        const willRemoveStatus = currentData.status === statusToRemove;
        const isFavorite = currentData.isFavorite === true || currentData.isFavorite === 'true';
        
        if (willRemoveStatus && isFavorite) {
          // 🔥 REMOVER APENAS O STATUS, MANTER COMO FAVORITO
          await doc.ref.update({
            status: null, // Remove o status
            // Mantém isFavorite, userRating, userReview se existirem
            updatedAt: new Date()
          });
          
          // Atualizar estado local
          setUserMovies(prevMovies => 
            prevMovies.map(movie => 
              movie.movieId === movieId 
                ? { ...movie, status: null }
                : movie
            )
          );
          
          console.log('✅ Status removido, favorito mantido');
          return { success: true, action: 'status_removed_favorite_kept' };
          
        } else if (willRemoveStatus && !isFavorite) {
          // 🔥 NÃO É FAVORITO, REMOVER FILME COMPLETAMENTE
          await doc.ref.delete();
          
          // Atualizar estado local
          setUserMovies(prevMovies => 
            prevMovies.filter(movie => movie.movieId !== movieId)
          );
          
          console.log('✅ Filme removido completamente (não é favorito)');
          return { success: true, action: 'movie_removed_completely' };
          
        } else {
          // 🔥 STATUS NÃO CORRESPONDE, NÃO FAZER NADA
          console.log('⚠️ Status não corresponde ao solicitado para remoção');
          return { success: false, error: 'Status não corresponde' };
        }
        
      } else {
        console.log('⚠️ Filme não encontrado');
        return { success: false, error: 'Filme não encontrado' };
      }
    } catch (error) {
      console.error('❌ Erro ao remover status:', error);
      throw error;
    }
  };

  // 🔥 MANTER FUNÇÃO removeMovie PARA REMOÇÃO COMPLETA (quando necessário)
  const removeMovie = async (movieId) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    try {
      console.log('🗑️ Removendo filme completamente ID:', movieId);
      
      const snapshot = await db.collection('userMovies')
        .where('userId', '==', currentUser.uid)
        .where('movieId', '==', movieId)
        .get();

      if (!snapshot.empty) {
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        
        // Atualizar estado local
        setUserMovies(prevMovies => 
          prevMovies.filter(movie => movie.movieId !== movieId)
        );
        
        console.log('✅ Filme removido completamente');
        return { success: true };
      } else {
        console.log('⚠️ Filme não encontrado');
        return { success: false, error: 'Filme não encontrado' };
      }
    } catch (error) {
      console.error('❌ Erro ao remover filme:', error);
      throw error;
    }
  };

  // Funções de consulta
  const isMovieInList = (movieId, status = null) => {
    const movie = userMovies.find(m => m.movieId === movieId);
    if (!movie) return false;
    if (!status) return true;
    return movie.status === status;
  };

  const isFavorite = (movieId) => {
    const movie = userMovies.find(m => m.movieId === movieId);
    return movie?.isFavorite || false;
  };

  const getUserMovie = (movieId) => {
    return userMovies.find(m => m.movieId === movieId);
  };

  const getMoviesByStatus = (status) => {
    return userMovies.filter(movie => movie.status === status);
  };

  const getFavorites = () => {
    return userMovies.filter(movie => movie.isFavorite === true);
  };

  // 🔥 ESTATÍSTICAS CORRIGIDAS
  const getStats = () => {
    const watched = userMovies.filter(m => m.status === 'watched').length;
    const watchlist = userMovies.filter(m => m.status === 'watchlist').length;
    const recommendations = userMovies.filter(m => m.status === 'recommendation').length;
    const reviews = userMovies.filter(m => m.userReview && m.userReview.trim()).length;
    const ratings = userMovies.filter(m => m.userRating && m.userRating > 0).length;
    
    // 🔥 CORRIGIR CONTAGEM DE FAVORITOS
    const favorites = userMovies.filter(m => {
      const isFav = m.isFavorite === true || m.isFavorite === 'true';
      return isFav;
    }).length;
    
    // 🔥 CORRIGIR TOTAL - apenas filmes com status válido OU favoritos
    const total = userMovies.filter(m => {
      const hasValidStatus = m.status && m.status !== null && m.status !== '';
      const isFavorite = m.isFavorite === true || m.isFavorite === 'true';
      return hasValidStatus || isFavorite;
    }).length;

    console.log('📊 Estatísticas calculadas:', {
      watched,
      favorites,
      watchlist,
      recommendations,
      reviews,
      ratings,
      total,
      totalUserMovies: userMovies.length
    });

    return { 
      watched, 
      favorites, 
      watchlist, 
      recommendations,
      reviews, 
      ratings, 
      total 
    };
  };

  // 🧹 FUNÇÃO OPCIONAL - Limpar filmes órfãos
  const cleanupOrphanMovies = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    try {
      console.log('🧹 Iniciando limpeza de filmes órfãos...');
      
      const snapshot = await db.collection('userMovies')
        .where('userId', '==', currentUser.uid)
        .get();

      const batch = db.batch();
      let orphanCount = 0;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        
        // Identificar filmes órfãos
        const hasValidStatus = data.status && data.status !== null && data.status !== '';
        const isFavorite = data.isFavorite === true || data.isFavorite === 'true';
        
        if (!hasValidStatus && !isFavorite) {
          console.log(`🗑️ Removendo filme órfão: ${data.title}`);
          batch.delete(doc.ref);
          orphanCount++;
        }
      });

      if (orphanCount > 0) {
        await batch.commit();
        console.log(`✅ ${orphanCount} filmes órfãos removidos`);
        
        // Recarregar lista
        await refreshUserMovies();
      } else {
        console.log('✨ Nenhum filme órfão encontrado');
      }

      return { success: true, removedCount: orphanCount };
    } catch (error) {
      console.error('❌ Erro na limpeza:', error);
      throw error;
    }
  };

  // Testar conexão Firebase
  const testFirebaseConnection = async () => {
    try {
      console.log('🔥 Testando conexão Firebase...');
      const testQuery = await db.collection('userMovies').limit(1).get();
      console.log('✅ Conexão Firebase funcionando');
      return { success: true, message: 'Conexão estabelecida' };
    } catch (error) {
      console.error('❌ Erro na conexão Firebase:', error);
      return { success: false, error: error.message };
    }
  };

  // 🔥 VALOR DO CONTEXTO COM TODAS AS FUNÇÕES
  const value = {
    // Estado
    userMovies,
    loading,
    
    // Funções principais
    refreshUserMovies,
    addMovieToList,
    toggleFavorite,
    removeMovie, // 🔥 REMOÇÃO COMPLETA
    removeMovieStatus, // 🔥 REMOÇÃO INTELIGENTE DE STATUS
    
    // Funções de consulta
    isMovieInList,
    isFavorite,
    getUserMovie,
    getMoviesByStatus,
    getFavorites,
    getStats,
    
    // Função de limpeza
    cleanupOrphanMovies,
    
    // Função de teste
    testFirebaseConnection,
    
    // Estados computados
    stats: getStats(),
  };

  console.log('🎬 MoviesContext - Estado atual:', {
    totalMovies: userMovies.length,
    loading,
    hasUser: !!user,
    stats: getStats()
  });

  return (
    <MoviesContext.Provider value={value}>
      {children}
    </MoviesContext.Provider>
  );
};