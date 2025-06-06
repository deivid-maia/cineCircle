import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFriends } from '../contexts/FriendsContext';
import { useRecommendations } from '../contexts/RecommendationsContext';

const RecommendMovieModal = ({ visible, onClose, movie }) => {
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  const { friends } = useFriends();
  const { sendRecommendation } = useRecommendations();

  // Limpar dados ao abrir/fechar modal
  useEffect(() => {
    if (visible) {
      setSelectedFriends([]);
      setMessage('');
    }
  }, [visible]);

  const toggleFriendSelection = (friend) => {
    setSelectedFriends(prev => {
      const isSelected = prev.some(f => f.uid === friend.uid);
      if (isSelected) {
        return prev.filter(f => f.uid !== friend.uid);
      } else {
        return [...prev, friend];
      }
    });
  };

  const handleSendRecommendations = async () => {
    if (selectedFriends.length === 0) {
      Alert.alert('Selecione amigos', 'Escolha pelo menos um amigo para recomendar.');
      return;
    }

    if (!movie) {
      Alert.alert('Erro', 'Filme não encontrado.');
      return;
    }

    setSending(true);
    try {
      const recommendations = selectedFriends.map(friend => 
        sendRecommendation(friend.uid, movie, message.trim())
      );

      const results = await Promise.all(recommendations);
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      if (successful > 0) {
        const friendNames = selectedFriends.slice(0, 2).map(f => f.displayName).join(', ');
        const moreText = selectedFriends.length > 2 ? ` e mais ${selectedFriends.length - 2}` : '';
        
        Alert.alert(
          'Recomendações Enviadas!',
          `"${movie.title}" foi recomendado para ${friendNames}${moreText}`,
          [{ text: 'OK', onPress: onClose }]
        );
      }

      if (failed > 0) {
        Alert.alert(
          'Alguns Erros',
          `${failed} recomendação${failed > 1 ? 'ões' : ''} não puderam ser enviadas.`
        );
      }

    } catch (error) {
      console.error('Erro ao enviar recomendações:', error);
      Alert.alert('Erro', 'Falha ao enviar recomendações. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  if (!movie) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Recomendar Filme</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Informações do Filme */}
            <View style={styles.movieSection}>
              <Image
                source={{
                  uri: movie.poster_path 
                    ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                    : 'https://via.placeholder.com/200x300/27272A/9CA3AF?text=Sem+Poster'
                }}
                style={styles.moviePoster}
              />
              <View style={styles.movieInfo}>
                <Text style={styles.movieTitle}>{movie.title}</Text>
                <Text style={styles.movieYear}>
                  {movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}
                </Text>
                {movie.vote_average > 0 && (
                  <View style={styles.ratingContainer}>
                    <Feather name="star" size={16} color="#FFD700" />
                    <Text style={styles.rating}>{movie.vote_average.toFixed(1)}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Mensagem Personalizada */}
            <View style={styles.messageSection}>
              <Text style={styles.sectionTitle}>Mensagem (Opcional)</Text>
              <TextInput
                style={styles.messageInput}
                placeholder="Por que você recomenda este filme?"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                value={message}
                onChangeText={setMessage}
                maxLength={200}
              />
              <Text style={styles.charCount}>{message.length}/200</Text>
            </View>

            {/* Lista de Amigos */}
            <View style={styles.friendsSection}>
              <Text style={styles.sectionTitle}>
                Selecionar Amigos ({selectedFriends.length})
              </Text>
              
              {friends.length === 0 ? (
                <View style={styles.noFriendsContainer}>
                  <Feather name="users" size={48} color="#9CA3AF" />
                  <Text style={styles.noFriendsText}>Você ainda não tem amigos adicionados</Text>
                </View>
              ) : (
                <View style={styles.friendsList}>
                  {friends.map((friend) => {
                    const isSelected = selectedFriends.some(f => f.uid === friend.uid);
                    
                    return (
                      <TouchableOpacity
                        key={friend.uid}
                        style={[
                          styles.friendItem,
                          isSelected && styles.friendItemSelected
                        ]}
                        onPress={() => toggleFriendSelection(friend)}
                      >
                        {friend.photoURL ? (
                          <Image 
                            source={{ uri: friend.photoURL }} 
                            style={styles.friendAvatar} 
                          />
                        ) : (
                          <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                              {(friend.displayName || 'U')[0].toUpperCase()}
                            </Text>
                          </View>
                        )}
                        
                        <View style={styles.friendInfo}>
                          <Text style={styles.friendName}>{friend.displayName}</Text>
                          <Text style={styles.friendEmail}>{friend.email}</Text>
                        </View>
                        
                        <View style={[
                          styles.checkbox,
                          isSelected && styles.checkboxSelected
                        ]}>
                          {isSelected && (
                            <Feather name="check" size={16} color="#FFFFFF" />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer com Botões */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={sending}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.button, 
                styles.sendButton,
                (selectedFriends.length === 0 || sending) && styles.sendButtonDisabled
              ]}
              onPress={handleSendRecommendations}
              disabled={selectedFriends.length === 0 || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="send" size={16} color="#FFFFFF" />
                  <Text style={styles.sendButtonText}>
                    Enviar{selectedFriends.length > 0 ? ` (${selectedFriends.length})` : ''}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#18181B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  movieSection: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
  },
  moviePoster: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 16,
  },
  movieInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  movieYear: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: '#FFD700',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  messageSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  messageInput: {
    backgroundColor: '#27272A',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    textAlignVertical: 'top',
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  friendsSection: {
    marginBottom: 20,
  },
  noFriendsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noFriendsText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  friendsList: {
    gap: 8,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#27272A',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  friendItemSelected: {
    borderColor: '#BD0DC0',
    backgroundColor: 'rgba(189, 13, 192, 0.1)',
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#BD0DC0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  friendEmail: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#BD0DC0',
    borderColor: '#BD0DC0',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#27272A',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  cancelButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
  sendButton: {
    backgroundColor: '#BD0DC0',
  },
  sendButtonDisabled: {
    backgroundColor: '#3F3F46',
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RecommendMovieModal;