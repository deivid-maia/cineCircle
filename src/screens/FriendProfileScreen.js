import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar,
  TouchableOpacity,
  Image,
  ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const FriendProfileScreen = ({ route, navigation }) => {
  // Parâmetros passados na navegação (dados do amigo)
  const { friend } = route.params || {};

  if (!friend) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Feather name="user-x" size={48} color="#9CA3AF" />
          <Text style={styles.errorText}>Perfil não encontrado</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Função para gerar avatar padrão
  const getDefaultAvatar = (name, email) => {
    const displayName = name || (email ? email.split('@')[0] : 'Usuario');
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=BD0DC0&color=fff`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Feather name="more-horizontal" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Seção do Avatar e Info Básica */}
        <View style={styles.profileSection}>
          <Image
            source={{ 
              uri: friend.photoURL || getDefaultAvatar(friend.displayName, friend.email)
            }}
            style={styles.avatar}
          />
          <Text style={styles.displayName}>
            {friend.displayName || (friend.email ? friend.email.split('@')[0] : 'Usuário')}
          </Text>
          <Text style={styles.username}>
            @{friend.email ? friend.email.split('@')[0] : 'usuario'}
          </Text>
          
          {friend.bio && (
            <Text style={styles.bio}>{friend.bio}</Text>
          )}
          
          {/* Estatísticas do amigo */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>42</Text>
              <Text style={styles.statLabel}>Filmes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>18</Text>
              <Text style={styles.statLabel}>Favoritos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>23</Text>
              <Text style={styles.statLabel}>Resenhas</Text>
            </View>
          </View>
        </View>

        {/* Botões de Ação */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Feather name="message-circle" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Mensagem</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
            <Feather name="share-2" size={20} color="#BD0DC0" />
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              Recomendar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Seções do Perfil */}
        <View style={styles.sectionsContainer}>
          {/* Filmes Recentes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Assistidos Recentemente</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.emptySection}>
              <Feather name="film" size={32} color="#9CA3AF" />
              <Text style={styles.emptySectionText}>
                Nenhum filme assistido recentemente
              </Text>
            </View>
          </View>

          {/* Favoritos */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Favoritos</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.emptySection}>
              <Feather name="heart" size={32} color="#9CA3AF" />
              <Text style={styles.emptySectionText}>
                Nenhum filme favoritado ainda
              </Text>
            </View>
          </View>

          {/* Resenhas */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Últimas Resenhas</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.emptySection}>
              <Feather name="edit-3" size={32} color="#9CA3AF" />
              <Text style={styles.emptySectionText}>
                Nenhuma resenha ainda
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet