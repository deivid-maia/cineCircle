import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import recommendationService from '../services/recommendationService';

// Criar o contexto
const RecommendationsContext = createContext({});

// Hook personalizado para usar o contexto
export const useRecommendations = () => {
  const context = useContext(RecommendationsContext);
  if (!context) {
    throw new Error('useRecommendations deve ser usado dentro de um RecommendationsProvider');
  }
  return context;
};

// Provider do contexto de recomendações
export const RecommendationsProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Estados
  const [receivedRecommendations, setReceivedRecommendations] = useState([]);
  const [sentRecommendations, setSentRecommendations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Carregar dados quando usuário logar
  useEffect(() => {
    if (user) {
      console.log('🎬 RecommendationsContext - Usuário logado, carregando recomendações');
      loadAllData();
    } else {
      console.log('🚫 RecommendationsContext - Usuário deslogado, limpando dados');
      clearData();
    }
  }, [user]);

  // Limpar dados ao fazer logout
  const clearData = () => {
    setReceivedRecommendations([]);
    setSentRecommendations([]);
    setStats(null);
  };

  // Carregar todos os dados
  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadReceivedRecommendations(),
        loadSentRecommendations(),
        loadStats()
      ]);
    } catch (error) {
      console.error('❌ Erro ao carregar dados de recomendações:', error);
    } finally {
      setLoading(false);
    }
  };

  // 📬 CARREGAR RECOMENDAÇÕES RECEBIDAS
  const loadReceivedRecommendations = async () => {
    try {
      const result = await recommendationService.getReceivedRecommendations();
      if (result.success) {
        setReceivedRecommendations(result.recommendations);
        console.log('✅ Recomendações recebidas carregadas:', result.recommendations.length);
      } else {
        console.error('❌ Erro ao carregar recomendações recebidas:', result.error);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar recomendações recebidas:', error);
    }
  };

  // 📤 CARREGAR RECOMENDAÇÕES ENVIADAS
  const loadSentRecommendations = async () => {
    try {
      const result = await recommendationService.getSentRecommendations();
      if (result.success) {
        setSentRecommendations(result.recommendations);
        console.log('✅ Recomendações enviadas carregadas:', result.recommendations.length);
      } else {
        console.error('❌ Erro ao carregar recomendações enviadas:', result.error);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar recomendações enviadas:', error);
    }
  };

  // 📊 CARREGAR ESTATÍSTICAS
  const loadStats = async () => {
    try {
      const result = await recommendationService.getRecommendationStats();
      if (result.success) {
        setStats(result.stats);
        console.log('✅ Estatísticas carregadas:', result.stats);
      } else {
        console.error('❌ Erro ao carregar estatísticas:', result.error);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
    }
  };

  // 📨 ENVIAR RECOMENDAÇÃO
  const sendRecommendation = async (friendId, movieData, message = '') => {
    try {
      const result = await recommendationService.sendRecommendation(friendId, movieData, message);
      
      if (result.success) {
        // Recarregar dados para refletir a nova recomendação
        await loadSentRecommendations();
        await loadStats();
        
        console.log('✅ Recomendação enviada com sucesso');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao enviar recomendação:', error);
      return { success: false, error: error.message };
    }
  };

  // ✅ RESPONDER À RECOMENDAÇÃO
  const respondToRecommendation = async (recommendationId, response, message = '') => {
    try {
      const result = await recommendationService.respondToRecommendation(
        recommendationId, 
        response, 
        message
      );
      
      if (result.success) {
        // Atualizar lista local
        setReceivedRecommendations(prev => 
          prev.map(rec => 
            rec.id === recommendationId
              ? { 
                  ...rec, 
                  status: response,
                  responseMessage: message,
                  respondedAt: new Date()
                }
              : rec
          )
        );
        
        console.log('✅ Resposta enviada com sucesso');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao responder recomendação:', error);
      return { success: false, error: error.message };
    }
  };

  // 👁️ MARCAR COMO VISTA
  const markAsViewed = async (recommendationId) => {
    try {
      const result = await recommendationService.markAsViewed(recommendationId);
      
      if (result.success) {
        // Atualizar lista local
        setReceivedRecommendations(prev => 
          prev.map(rec => 
            rec.id === recommendationId
              ? { ...rec, status: 'viewed', viewedAt: new Date() }
              : rec
          )
        );
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao marcar como vista:', error);
      return { success: false, error: error.message };
    }
  };

  // 🗑️ DELETAR RECOMENDAÇÃO
  const deleteRecommendation = async (recommendationId, isSent = false) => {
    try {
      const result = await recommendationService.deleteRecommendation(recommendationId);
      
      if (result.success) {
        if (isSent) {
          // Remover da lista de enviadas
          setSentRecommendations(prev => 
            prev.filter(rec => rec.id !== recommendationId)
          );
        } else {
          // Remover da lista de recebidas
          setReceivedRecommendations(prev => 
            prev.filter(rec => rec.id !== recommendationId)
          );
        }
        
        // Atualizar estatísticas
        await loadStats();
        
        console.log('✅ Recomendação deletada com sucesso');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao deletar recomendação:', error);
      return { success: false, error: error.message };
    }
  };

  // 🔄 ATUALIZAR DADOS
  const refreshData = async () => {
    await loadAllData();
  };

  // 📊 OBTER CONTADORES RÁPIDOS
  const getQuickStats = () => {
    const pendingReceived = receivedRecommendations.filter(r => r.status === 'pending').length;
    const totalReceived = receivedRecommendations.length;
    const totalSent = sentRecommendations.length;
    
    return {
      pendingReceived,
      totalReceived,
      totalSent,
      hasNewRecommendations: pendingReceived > 0
    };
  };

  // 🎬 BUSCAR RECOMENDAÇÕES POR FILME
  const getRecommendationsByMovie = async (movieId) => {
    try {
      return await recommendationService.getRecommendationsByMovie(movieId);
    } catch (error) {
      console.error('❌ Erro ao buscar recomendações do filme:', error);
      return { success: false, error: error.message, recommendations: [] };
    }
  };

  // Valor do contexto
  const value = {
    // Estados
    receivedRecommendations,
    sentRecommendations,
    stats,
    loading,
    
    // Funções principais
    sendRecommendation,
    respondToRecommendation,
    markAsViewed,
    deleteRecommendation,
    
    // Funções de carregamento
    loadReceivedRecommendations,
    loadSentRecommendations,
    loadStats,
    refreshData,
    
    // Funções de utilidade
    getQuickStats,
    getRecommendationsByMovie,
    
    // Estados computados
    quickStats: getQuickStats()
  };

  console.log('🎬 RecommendationsContext - Estado atual:', {
    receivedCount: receivedRecommendations.length,
    sentCount: sentRecommendations.length,
    loading,
    hasStats: !!stats,
    quickStats: getQuickStats()
  });

  return (
    <RecommendationsContext.Provider value={value}>
      {children}
    </RecommendationsContext.Provider>
  );
};