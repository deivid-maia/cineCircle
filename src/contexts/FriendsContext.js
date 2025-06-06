import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import friendsService from '../services/friendsService';

// Criar o contexto
const FriendsContext = createContext({});

// Hook personalizado para usar o contexto
export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error('useFriends deve ser usado dentro de um FriendsProvider');
  }
  return context;
};

// Provider do contexto de amigos
export const FriendsProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Estados
  const [friends, setFriends] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalFriends: 0, pendingRequests: 0 });

  // Carregar dados ao fazer login
  useEffect(() => {
    if (user) {
      console.log('👥 FriendsContext - Usuário logado, carregando dados de amigos');
      loadInitialData();
    } else {
      console.log('🚫 FriendsContext - Usuário deslogado, limpando dados');
      clearData();
    }
  }, [user]);

  // Limpar dados ao fazer logout
  const clearData = () => {
    setFriends([]);
    setSuggestedFriends([]);
    setFriendRequests([]);
    setSearchResults([]);
    setStats({ totalFriends: 0, pendingRequests: 0 });
  };

  // Carregar dados iniciais
  const loadInitialData = async () => {
    console.log('🚀 CARREGANDO DADOS INICIAIS - FriendsContext');
    
    setLoading(true);
    try {
      await Promise.all([
        loadFriends(),
        loadSuggestedFriends(),
        loadFriendRequests(),
        loadStats()
      ]);
      console.log('✅ Promise.all concluído');
    } catch (error) {
      console.error('❌ Erro ao carregar dados iniciais:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 👥 CARREGAR LISTA DE AMIGOS
  const loadFriends = async () => {
    try {
      const result = await friendsService.getUserFriends();
      
      if (result.success) {
        setFriends(result.friends || []);
        console.log('✅ Amigos carregados:', result.friends?.length || 0);
      } else {
        console.error('❌ Erro no resultado:', result.error);
        setFriends([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar amigos:', error);
      setFriends([]);
    }
  };

  // 👥 CARREGAR SUGESTÕES DE AMIGOS
  const loadSuggestedFriends = async () => {
    try {
      const result = await friendsService.getSuggestedFriends();
      if (result.success) {
        // ✅ FILTRAR DADOS VÁLIDOS
        const validSuggestions = (result.suggestions || []).filter(suggestion => 
          suggestion && suggestion.uid && (suggestion.email || suggestion.displayName)
        );
        setSuggestedFriends(validSuggestions);
        console.log('✅ Sugestões carregadas:', validSuggestions.length);
      } else {
        console.error('❌ Erro ao carregar sugestões:', result.error);
        setSuggestedFriends([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar sugestões:', error);
      setSuggestedFriends([]);
    }
  };

  // 📨 CARREGAR SOLICITAÇÕES DE AMIZADE
  const loadFriendRequests = async () => {
    try {
      const result = await friendsService.getFriendRequests();
      if (result.success) {
        setFriendRequests(result.requests || []);
        console.log('✅ Solicitações carregadas:', result.requests?.length || 0);
      } else {
        console.error('❌ Erro ao carregar solicitações:', result.error);
        setFriendRequests([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar solicitações:', error);
      setFriendRequests([]);
    }
  };

  // 📊 CARREGAR ESTATÍSTICAS
  const loadStats = async () => {
    try {
      const friendsCount = friends.length;
      const requestsCount = friendRequests.length;
      
      setStats({
        totalFriends: friendsCount,
        pendingRequests: requestsCount
      });
      
      console.log('📊 Estatísticas atualizadas:', { friendsCount, requestsCount });
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
    }
  };

  // 🔍 BUSCAR USUÁRIOS
  const searchUsers = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return { success: true, users: [] };
    }

    setLoading(true);
    try {
      const result = await friendsService.searchUsers(query);
      if (result.success) {
        setSearchResults(result.users || []);
        console.log('🔍 Busca concluída:', result.users?.length || 0, 'usuários encontrados');
      }
      return result;
    } catch (error) {
      console.error('❌ Erro na busca:', error);
      return { success: false, error: error.message, users: [] };
    } finally {
      setLoading(false);
    }
  };

  // 📨 ENVIAR SOLICITAÇÃO DE AMIZADE
  const sendFriendRequest = async (targetUserId) => {
    try {
      const result = await friendsService.sendFriendRequest(targetUserId);
      
      if (result.success) {
        // Atualizar sugestões (remover o usuário da lista)
        setSuggestedFriends(prev => 
          prev.filter(friend => friend.uid !== targetUserId)
        );
        
        // Atualizar resultados de busca se necessário
        setSearchResults(prev => 
          prev.map(user => 
            user.uid === targetUserId 
              ? { ...user, friendshipStatus: 'request_sent' }
              : user
          )
        );
        
        console.log('✅ Solicitação enviada com sucesso');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao enviar solicitação:', error);
      return { success: false, error: error.message };
    }
  };

  // ✅ ACEITAR SOLICITAÇÃO DE AMIZADE
  const acceptFriendRequest = async (requestId) => {
    try {
      const result = await friendsService.acceptFriendRequest(requestId);
      
      if (result.success) {
        // Remover da lista de solicitações
        setFriendRequests(prev => 
          prev.filter(request => request.id !== requestId)
        );
        
        // Recarregar amigos e estatísticas
        await Promise.all([loadFriends(), loadStats()]);
        
        console.log('✅ Solicitação aceita com sucesso');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao aceitar solicitação:', error);
      return { success: false, error: error.message };
    }
  };

  // ❌ REJEITAR SOLICITAÇÃO DE AMIZADE
  const rejectFriendRequest = async (requestId) => {
    try {
      const result = await friendsService.rejectFriendRequest(requestId);
      
      if (result.success) {
        // Remover da lista de solicitações
        setFriendRequests(prev => 
          prev.filter(request => request.id !== requestId)
        );
        
        // Atualizar estatísticas
        await loadStats();
        
        console.log('✅ Solicitação rejeitada');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao rejeitar solicitação:', error);
      return { success: false, error: error.message };
    }
  };

  // 🗑️ REMOVER AMIGO
  const removeFriend = async (friendId) => {
    try {
      console.log('🗑️ Removendo amigo:', friendId);
      
      // Por enquanto, apenas remover localmente
      setFriends(prev => prev.filter(friend => friend.uid !== friendId));
      await loadStats();
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao remover amigo:', error);
      return { success: false, error: error.message };
    }
  };

  // 🔍 VERIFICAR STATUS DE AMIZADE
  const checkFriendshipStatus = async (targetUserId) => {
    try {
      return { status: 'none' };
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      return { status: 'none' };
    }
  };

  // 🔄 ATUALIZAR DADOS
  const refreshData = async () => {
    await loadInitialData();
  };

  // Log do estado atual (FORA do JSX)
  console.log('👥 FriendsContext - Estado atual:', {
    totalFriends: friends.length,
    suggestedFriends: suggestedFriends.length,
    pendingRequests: friendRequests.length,
    searchResults: searchResults.length,
    loading,
    stats
  });

  // Valor do contexto
  const value = {
    // Estados
    friends,
    suggestedFriends,
    friendRequests,
    searchResults,
    loading,
    stats,
    
    // Funções
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    checkFriendshipStatus,
    refreshData,
    
    // Funções de carregamento
    loadFriends,
    loadSuggestedFriends,
    loadFriendRequests,
    loadStats,
    
    // Funções utilitárias
    clearSearchResults: () => setSearchResults([])
  };

  return (
    <FriendsContext.Provider value={value}>
      {children}
    </FriendsContext.Provider>
  );
};