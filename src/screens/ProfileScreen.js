import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useLogout } from '../contexts/useLogout';
import { useMovies } from '../contexts/useMovies';

const ProfileScreen = ({ navigation }) => {
    const { user } = useAuth();
    const { handleLogout, loading } = useLogout();
    const { stats } = useMovies(); // 🔥 USAR ESTATÍSTICAS REAIS

    // Função para gerar avatar se o usuário tiver photoURL
    const getAvatarUrl = () => {
        if (user?.photoURL) return user.photoURL;
        return null; // Sem foto
    };

    const hasAvatar = getAvatarUrl() !== null;

    // Extrair nome do usuário
    const getUserName = () => {
        if (user?.displayName) {
            return user.displayName;
        }
        if (user?.email) {
            return user.email.split('@')[0];
        }
        return 'Usuário';
    };

    // Data de criação da conta (simulada - você pode salvar isso no Firestore)
    const getMemberSince = () => {
        if (user?.metadata?.creationTime) {
            const date = new Date(user.metadata.creationTime);
            return date.toLocaleDateString('pt-BR', { 
                month: 'long', 
                year: 'numeric' 
            });
        }
        return 'Recente';
    };

    // 🔥 FUNÇÕES DE NAVEGAÇÃO COM FILTROS ESPECÍFICOS
    const navigateToWatched = () => {
        navigation.navigate('UserMovies', { 
            initialFilter: 'watched',
            screenTitle: 'Filmes Assistidos'
        });
    };

    const navigateToFavorites = () => {
        navigation.navigate('UserMovies', { 
            initialFilter: 'favorites',
            screenTitle: 'Meus Favoritos'
        });
    };

    const navigateToWatchlist = () => {
        navigation.navigate('UserMovies', { 
            initialFilter: 'watchlist',
            screenTitle: 'Quero Assistir'
        });
    };

    const navigateToAllLists = () => {
        navigation.navigate('UserMovies', { 
            initialFilter: 'all',
            screenTitle: 'Todas as Listas'
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView style={styles.scrollView}>
                {/* Header do Perfil */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        {hasAvatar ? (
                            <Image 
                                source={{ uri: getAvatarUrl() }} 
                                style={styles.avatar}
                            />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Feather name="user" size={32} color="#9CA3AF" />
                            </View>
                        )}
                        <TouchableOpacity style={styles.editButton}>
                            <Feather name="camera" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{getUserName()}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                    <Text style={styles.memberSince}>Membro desde {getMemberSince()}</Text>
                </View>

                {/* 🔥 ESTATÍSTICAS CLICÁVEIS COM NAVEGAÇÃO ESPECÍFICA */}
                <View style={styles.statsContainer}>
                    <TouchableOpacity 
                        style={styles.statItem}
                        onPress={navigateToWatched}
                    >
                        <Text style={styles.statNumber}>{stats.watched}</Text>
                        <Text style={styles.statLabel}>Assistidos</Text>
                    </TouchableOpacity>
                    <View style={styles.statDivider} />
                    <TouchableOpacity 
                        style={styles.statItem}
                        onPress={navigateToFavorites}
                    >
                        <Text style={styles.statNumber}>{stats.favorites}</Text>
                        <Text style={styles.statLabel}>Favoritos</Text>
                    </TouchableOpacity>
                    <View style={styles.statDivider} />
                    <TouchableOpacity 
                        style={styles.statItem}
                        onPress={navigateToWatchlist}
                    >
                        <Text style={styles.statNumber}>{stats.watchlist}</Text>
                        <Text style={styles.statLabel}>Quero Ver</Text>
                    </TouchableOpacity>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.reviews}</Text>
                        <Text style={styles.statLabel}>Resenhas</Text>
                    </View>
                </View>

                {/* Menu de Opções */}
                <View style={styles.menuSection}>
                    
                    {/* Meu Conteúdo */}
                    <Text style={styles.sectionTitle}>Meu Conteúdo</Text>
                    
                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={navigateToWatched}
                    >
                        <View style={styles.menuItemLeft}>
                            <Feather name="check-circle" size={20} color="#9CA3AF" />
                            <Text style={styles.menuText}>Filmes/Séries Assistidos</Text>
                        </View>
                        <View style={styles.menuItemRight}>
                            <Text style={styles.countBadge}>{stats.watched}</Text>
                            <Feather name="chevron-right" size={20} color="#9CA3AF" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={navigateToFavorites}
                    >
                        <View style={styles.menuItemLeft}>
                            <Feather name="heart" size={20} color="#9CA3AF" />
                            <Text style={styles.menuText}>Favoritos</Text>
                        </View>
                        <View style={styles.menuItemRight}>
                            <Text style={styles.countBadge}>{stats.favorites}</Text>
                            <Feather name="chevron-right" size={20} color="#9CA3AF" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={navigateToWatchlist}
                    >
                        <View style={styles.menuItemLeft}>
                            <Feather name="bookmark" size={20} color="#9CA3AF" />
                            <Text style={styles.menuText}>Quero Assistir</Text>
                        </View>
                        <View style={styles.menuItemRight}>
                            <Text style={styles.countBadge}>{stats.watchlist}</Text>
                            <Feather name="chevron-right" size={20} color="#9CA3AF" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuItemLeft}>
                            <Feather name="edit-3" size={20} color="#9CA3AF" />
                            <Text style={styles.menuText}>Minhas Resenhas</Text>
                        </View>
                        <View style={styles.menuItemRight}>
                            <Text style={styles.countBadge}>{stats.reviews}</Text>
                            <Feather name="chevron-right" size={20} color="#9CA3AF" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuItemLeft}>
                            <Feather name="star" size={20} color="#9CA3AF" />
                            <Text style={styles.menuText}>Minhas Avaliações</Text>
                        </View>
                        <View style={styles.menuItemRight}>
                            <Text style={styles.countBadge}>{stats.ratings}</Text>
                            <Feather name="chevron-right" size={20} color="#9CA3AF" />
                        </View>
                    </TouchableOpacity>

                    {/* 🔥 TODAS AS LISTAS - SEÇÃO SEPARADA */}
                    <TouchableOpacity 
                        style={[styles.menuItem, styles.allListsItem]}
                        onPress={navigateToAllLists}
                    >
                        <View style={styles.menuItemLeft}>
                            <Feather name="list" size={20} color="#BD0DC0" />
                            <Text style={[styles.menuText, styles.allListsText]}>Todas as Listas</Text>
                        </View>
                        <View style={styles.menuItemRight}>
                            <Text style={[styles.countBadge, styles.allListsBadge]}>{stats.total}</Text>
                            <Feather name="chevron-right" size={20} color="#BD0DC0" />
                        </View>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Social */}
                    <Text style={styles.sectionTitle}>Social</Text>

                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('FriendsTab')}
                    >
                        <View style={styles.menuItemLeft}>
                            <Feather name="users" size={20} color="#9CA3AF" />
                            <Text style={styles.menuText}>Meus Amigos</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuItemLeft}>
                            <Feather name="award" size={20} color="#9CA3AF" />
                            <Text style={styles.menuText}>Ranking de Amigos</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuItemLeft}>
                            <Feather name="message-circle" size={20} color="#9CA3AF" />
                            <Text style={styles.menuText}>Recomendações Recebidas</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuItemLeft}>
                            <Feather name="share-2" size={20} color="#9CA3AF" />
                            <Text style={styles.menuText}>Minhas Recomendações</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Configurações */}
                    <Text style={styles.sectionTitle}>Configurações</Text>

                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <View style={styles.menuItemLeft}>
                            <Feather name="user" size={20} color="#9CA3AF" />
                            <Text style={styles.menuText}>Editar Perfil</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <View style={styles.menuItemLeft}>
                            <Feather name="bell" size={20} color="#9CA3AF" />
                            <Text style={styles.menuText}>Notificações</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('Settings')}
                    >
                        <View style={styles.menuItemLeft}>
                            <Feather name="settings" size={20} color="#9CA3AF" />
                            <Text style={styles.menuText}>Configurações</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('Help')}
                    >
                        <View style={styles.menuItemLeft}>
                            <Feather name="help-circle" size={20} color="#9CA3AF" />
                            <Text style={styles.menuText}>Ajuda</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                {/* Botão de Logout */}
                <TouchableOpacity 
                    style={[
                        styles.logoutButton,
                        loading && styles.logoutButtonDisabled
                    ]}
                    onPress={handleLogout}
                    disabled={loading}
                >
                    <Feather name="log-out" size={20} color="#EF4444" />
                    <Text style={[
                        styles.logoutText,
                        loading && styles.logoutTextDisabled
                    ]}>
                        {loading ? 'Saindo da conta...' : 'Sair da conta'}
                    </Text>
                </TouchableOpacity>

                {/* Versão do App */}
                <Text style={styles.version}>CineCircle v1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#18181B',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#27272A',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: '#BD0DC0',
        backgroundColor: '#27272A',
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: '#27272A',
        borderStyle: 'dashed',
        backgroundColor: '#27272A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editButton: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#BD0DC0',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#18181B',
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#9CA3AF',
        marginBottom: 4,
    },
    memberSince: {
        fontSize: 12,
        color: '#6B7280',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#27272A',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#27272A',
        marginHorizontal: 8,
    },
    menuSection: {
        paddingHorizontal: 0,
        paddingTop: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#9CA3AF',
        marginBottom: 8,
        marginTop: 16,
        paddingHorizontal: 20,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#27272A',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuText: {
        fontSize: 16,
        color: '#FFFFFF',
        marginLeft: 16,
    },
    countBadge: {
        backgroundColor: '#27272A',
        color: '#9CA3AF',
        fontSize: 12,
        fontWeight: '600',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
        minWidth: 24,
        textAlign: 'center',
    },
    // 🔥 ESTILOS ESPECIAIS PARA "TODAS AS LISTAS"
    allListsItem: {
        backgroundColor: 'rgba(189, 13, 192, 0.05)',
        marginHorizontal: 16,
        borderRadius: 8,
        marginVertical: 8,
    },
    allListsText: {
        color: '#BD0DC0',
        fontWeight: '600',
    },
    allListsBadge: {
        backgroundColor: '#BD0DC0',
        color: '#FFFFFF',
    },
    divider: {
        height: 1,
        backgroundColor: '#27272A',
        marginVertical: 8,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        marginVertical: 24,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: '#EF4444',
        borderRadius: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    logoutButtonDisabled: {
        opacity: 0.6,
    },
    logoutText: {
        fontSize: 16,
        color: '#EF4444',
        fontWeight: '600',
        marginLeft: 8,
    },
    logoutTextDisabled: {
        color: '#9CA3AF',
    },
    version: {
        textAlign: 'center',
        fontSize: 12,
        color: '#6B7280',
        paddingBottom: 32,
    },
});

export default ProfileScreen

// import React from 'react';
// import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, Image } from 'react-native';
// import { Feather } from '@expo/vector-icons';
// import { useAuth } from '../contexts/AuthContext';
// import { useLogout } from '../contexts/useLogout';
// import { useMovies } from '../contexts/useMovies';

// const ProfileScreen = ({ navigation }) => {
//     const { user } = useAuth();
//     const { handleLogout, loading } = useLogout();
//     const { stats } = useMovies(); // 🎯 USAR ESTATÍSTICAS REAIS

//     // Função para gerar avatar se o usuário tiver photoURL
//     const getAvatarUrl = () => {
//         if (user?.photoURL) return user.photoURL;
//         return null; // Sem foto
//     };

//     const hasAvatar = getAvatarUrl() !== null;

//     // Extrair nome do usuário
//     const getUserName = () => {
//         if (user?.displayName) {
//             return user.displayName;
//         }
//         if (user?.email) {
//             return user.email.split('@')[0];
//         }
//         return 'Usuário';
//     };

//     // Data de criação da conta
//     const getMemberSince = () => {
//         if (user?.metadata?.creationTime) {
//             const date = new Date(user.metadata.creationTime);
//             return date.toLocaleDateString('pt-BR', { 
//                 month: 'long', 
//                 year: 'numeric' 
//             });
//         }
//         return 'Recente';
//     };

//     // 🎯 NAVEGAR PARA LISTAS COM FILTRO ESPECÍFICO
//     const navigateToUserMovies = (filter = 'all') => {
//         navigation.navigate('UserMovies', { initialFilter: filter });
//     };

//     return (
//         <SafeAreaView style={styles.container}>
//             <StatusBar barStyle="light-content" />
//             <ScrollView style={styles.scrollView}>
//                 {/* Header do Perfil */}
//                 <View style={styles.header}>
//                     <View style={styles.avatarContainer}>
//                         {hasAvatar ? (
//                             <Image 
//                                 source={{ uri: getAvatarUrl() }} 
//                                 style={styles.avatar}
//                             />
//                         ) : (
//                             <View style={styles.avatarPlaceholder}>
//                                 <Feather name="user" size={32} color="#9CA3AF" />
//                             </View>
//                         )}
//                         <TouchableOpacity 
//                             style={styles.editButton}
//                             onPress={() => navigation.navigate('EditProfile')}
//                         >
//                             <Feather name="camera" size={16} color="#FFFFFF" />
//                         </TouchableOpacity>
//                     </View>
//                     <Text style={styles.userName}>{getUserName()}</Text>
//                     <Text style={styles.userEmail}>{user?.email}</Text>
//                     <Text style={styles.memberSince}>Membro desde {getMemberSince()}</Text>
//                 </View>

//                 {/* 📊 ESTATÍSTICAS DINÂMICAS */}
//                 <View style={styles.statsContainer}>
//                     <TouchableOpacity 
//                         style={styles.statItem}
//                         onPress={() => navigateToUserMovies('watched')}
//                     >
//                         <Text style={styles.statNumber}>{stats.watched}</Text>
//                         <Text style={styles.statLabel}>Assistidos</Text>
//                     </TouchableOpacity>
//                     <View style={styles.statDivider} />
//                     <TouchableOpacity 
//                         style={styles.statItem}
//                         onPress={() => navigateToUserMovies('favorites')}
//                     >
//                         <Text style={styles.statNumber}>{stats.favorites}</Text>
//                         <Text style={styles.statLabel}>Favoritos</Text>
//                     </TouchableOpacity>
//                     <View style={styles.statDivider} />
//                     <TouchableOpacity 
//                         style={styles.statItem}
//                         onPress={() => navigateToUserMovies('watchlist')}
//                     >
//                         <Text style={styles.statNumber}>{stats.watchlist}</Text>
//                         <Text style={styles.statLabel}>Quero Ver</Text>
//                     </TouchableOpacity>
//                     <View style={styles.statDivider} />
//                     <TouchableOpacity 
//                         style={styles.statItem}
//                         onPress={() => navigateToUserMovies('all')}
//                     >
//                         <Text style={styles.statNumber}>{stats.reviews}</Text>
//                         <Text style={styles.statLabel}>Resenhas</Text>
//                     </TouchableOpacity>
//                 </View>

//                 {/* Menu de Opções */}
//                 <View style={styles.menuSection}>
                    
//                     {/* 🎬 MINHAS LISTAS - Navegação unificada */}
//                     <Text style={styles.sectionTitle}>Minhas Listas</Text>
                    
//                     <TouchableOpacity 
//                         style={styles.menuItem}
//                         onPress={() => navigateToUserMovies('all')}
//                     >
//                         <View style={styles.menuItemLeft}>
//                             <Feather name="grid" size={20} color="#9CA3AF" />
//                             <Text style={styles.menuText}>Todas as Listas</Text>
//                         </View>
//                         <View style={styles.menuItemRight}>
//                             <Text style={styles.countText}>{stats.total}</Text>
//                             <Feather name="chevron-right" size={20} color="#9CA3AF" />
//                         </View>
//                     </TouchableOpacity>

//                     <TouchableOpacity 
//                         style={styles.menuItem}
//                         onPress={() => navigateToUserMovies('watched')}
//                     >
//                         <View style={styles.menuItemLeft}>
//                             <Feather name="check-circle" size={20} color="#10B981" />
//                             <Text style={styles.menuText}>Filmes Assistidos</Text>
//                         </View>
//                         <View style={styles.menuItemRight}>
//                             <Text style={styles.countText}>{stats.watched}</Text>
//                             <Feather name="chevron-right" size={20} color="#9CA3AF" />
//                         </View>
//                     </TouchableOpacity>

//                     <TouchableOpacity 
//                         style={styles.menuItem}
//                         onPress={() => navigateToUserMovies('favorites')}
//                     >
//                         <View style={styles.menuItemLeft}>
//                             <Feather name="heart" size={20} color="#EF4444" />
//                             <Text style={styles.menuText}>Favoritos</Text>
//                         </View>
//                         <View style={styles.menuItemRight}>
//                             <Text style={styles.countText}>{stats.favorites}</Text>
//                             <Feather name="chevron-right" size={20} color="#9CA3AF" />
//                         </View>
//                     </TouchableOpacity>

//                     <TouchableOpacity 
//                         style={styles.menuItem}
//                         onPress={() => navigateToUserMovies('watchlist')}
//                     >
//                         <View style={styles.menuItemLeft}>
//                             <Feather name="bookmark" size={20} color="#3B82F6" />
//                             <Text style={styles.menuText}>Quero Assistir</Text>
//                         </View>
//                         <View style={styles.menuItemRight}>
//                             <Text style={styles.countText}>{stats.watchlist}</Text>
//                             <Feather name="chevron-right" size={20} color="#9CA3AF" />
//                         </View>
//                     </TouchableOpacity>

//                     {/* Divider */}
//                     <View style={styles.divider} />

//                     {/* Social */}
//                     <Text style={styles.sectionTitle}>Social</Text>

//                     <TouchableOpacity 
//                         style={styles.menuItem}
//                         onPress={() => navigation.navigate('FriendsTab')}
//                     >
//                         <View style={styles.menuItemLeft}>
//                             <Feather name="users" size={20} color="#9CA3AF" />
//                             <Text style={styles.menuText}>Meus Amigos</Text>
//                         </View>
//                         <Feather name="chevron-right" size={20} color="#9CA3AF" />
//                     </TouchableOpacity>

//                     <TouchableOpacity style={styles.menuItem}>
//                         <View style={styles.menuItemLeft}>
//                             <Feather name="award" size={20} color="#9CA3AF" />
//                             <Text style={styles.menuText}>Ranking de Amigos</Text>
//                         </View>
//                         <Feather name="chevron-right" size={20} color="#9CA3AF" />
//                     </TouchableOpacity>

//                     <TouchableOpacity style={styles.menuItem}>
//                         <View style={styles.menuItemLeft}>
//                             <Feather name="message-circle" size={20} color="#9CA3AF" />
//                             <Text style={styles.menuText}>Recomendações Recebidas</Text>
//                         </View>
//                         <Feather name="chevron-right" size={20} color="#9CA3AF" />
//                     </TouchableOpacity>

//                     <TouchableOpacity style={styles.menuItem}>
//                         <View style={styles.menuItemLeft}>
//                             <Feather name="share-2" size={20} color="#9CA3AF" />
//                             <Text style={styles.menuText}>Minhas Recomendações</Text>
//                         </View>
//                         <Feather name="chevron-right" size={20} color="#9CA3AF" />
//                     </TouchableOpacity>

//                     {/* Divider */}
//                     <View style={styles.divider} />

//                     {/* Configurações */}
//                     <Text style={styles.sectionTitle}>Configurações</Text>

//                     <TouchableOpacity 
//                         style={styles.menuItem}
//                         onPress={() => navigation.navigate('EditProfile')}
//                     >
//                         <View style={styles.menuItemLeft}>
//                             <Feather name="user" size={20} color="#9CA3AF" />
//                             <Text style={styles.menuText}>Editar Perfil</Text>
//                         </View>
//                         <Feather name="chevron-right" size={20} color="#9CA3AF" />
//                     </TouchableOpacity>

//                     <TouchableOpacity 
//                         style={styles.menuItem}
//                         onPress={() => navigation.navigate('Notifications')}
//                     >
//                         <View style={styles.menuItemLeft}>
//                             <Feather name="bell" size={20} color="#9CA3AF" />
//                             <Text style={styles.menuText}>Notificações</Text>
//                         </View>
//                         <Feather name="chevron-right" size={20} color="#9CA3AF" />
//                     </TouchableOpacity>

//                     <TouchableOpacity 
//                         style={styles.menuItem}
//                         onPress={() => navigation.navigate('Settings')}
//                     >
//                         <View style={styles.menuItemLeft}>
//                             <Feather name="settings" size={20} color="#9CA3AF" />
//                             <Text style={styles.menuText}>Configurações</Text>
//                         </View>
//                         <Feather name="chevron-right" size={20} color="#9CA3AF" />
//                     </TouchableOpacity>

//                     <TouchableOpacity 
//                         style={styles.menuItem}
//                         onPress={() => navigation.navigate('Help')}
//                     >
//                         <View style={styles.menuItemLeft}>
//                             <Feather name="help-circle" size={20} color="#9CA3AF" />
//                             <Text style={styles.menuText}>Ajuda</Text>
//                         </View>
//                         <Feather name="chevron-right" size={20} color="#9CA3AF" />
//                     </TouchableOpacity>
//                 </View>

//                 {/* Botão de Logout */}
//                 <TouchableOpacity 
//                     style={[
//                         styles.logoutButton,
//                         loading && styles.logoutButtonDisabled
//                     ]}
//                     onPress={handleLogout}
//                     disabled={loading}
//                 >
//                     <Feather name="log-out" size={20} color="#EF4444" />
//                     <Text style={[
//                         styles.logoutText,
//                         loading && styles.logoutTextDisabled
//                     ]}>
//                         {loading ? 'Saindo da conta...' : 'Sair da conta'}
//                     </Text>
//                 </TouchableOpacity>

//                 {/* Versão do App */}
//                 <Text style={styles.version}>CineCircle v1.0.0</Text>
//             </ScrollView>
//         </SafeAreaView>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#18181B',
//     },
//     scrollView: {
//         flex: 1,
//     },
//     header: {
//         alignItems: 'center',
//         paddingVertical: 32,
//         paddingHorizontal: 20,
//         borderBottomWidth: 1,
//         borderBottomColor: '#27272A',
//     },
//     avatarContainer: {
//         position: 'relative',
//         marginBottom: 16,
//     },
//     avatar: {
//         width: 80,
//         height: 80,
//         borderRadius: 40,
//         borderWidth: 2,
//         borderColor: '#BD0DC0',
//         backgroundColor: '#27272A',
//     },
//     avatarPlaceholder: {
//         width: 80,
//         height: 80,
//         borderRadius: 40,
//         borderWidth: 2,
//         borderColor: '#27272A',
//         borderStyle: 'dashed',
//         backgroundColor: '#27272A',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     editButton: {
//         position: 'absolute',
//         bottom: -2,
//         right: -2,
//         backgroundColor: '#BD0DC0',
//         width: 28,
//         height: 28,
//         borderRadius: 14,
//         justifyContent: 'center',
//         alignItems: 'center',
//         borderWidth: 2,
//         borderColor: '#18181B',
//     },
//     userName: {
//         fontSize: 20,
//         fontWeight: 'bold',
//         color: '#FFFFFF',
//         marginBottom: 4,
//     },
//     userEmail: {
//         fontSize: 14,
//         color: '#9CA3AF',
//         marginBottom: 4,
//     },
//     memberSince: {
//         fontSize: 12,
//         color: '#6B7280',
//     },
//     statsContainer: {
//         flexDirection: 'row',
//         paddingVertical: 24,
//         paddingHorizontal: 20,
//         borderBottomWidth: 1,
//         borderBottomColor: '#27272A',
//     },
//     statItem: {
//         flex: 1,
//         alignItems: 'center',
//         paddingVertical: 8,
//     },
//     statNumber: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         color: '#FFFFFF',
//         marginBottom: 4,
//     },
//     statLabel: {
//         fontSize: 12,
//         color: '#9CA3AF',
//         textAlign: 'center',
//     },
//     statDivider: {
//         width: 1,
//         backgroundColor: '#27272A',
//         marginHorizontal: 8,
//     },
//     menuSection: {
//         paddingHorizontal: 0,
//         paddingTop: 16,
//     },
//     sectionTitle: {
//         fontSize: 14,
//         fontWeight: '600',
//         color: '#9CA3AF',
//         marginBottom: 8,
//         marginTop: 16,
//         paddingHorizontal: 20,
//         textTransform: 'uppercase',
//         letterSpacing: 0.5,
//     },
//     menuItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingVertical: 16,
//         paddingHorizontal: 20,
//         borderBottomWidth: 1,
//         borderBottomColor: '#27272A',
//     },
//     menuItemLeft: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         flex: 1,
//     },
//     menuItemRight: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     menuText: {
//         fontSize: 16,
//         color: '#FFFFFF',
//         marginLeft: 16,
//     },
//     countText: {
//         fontSize: 14,
//         color: '#9CA3AF',
//         marginRight: 8,
//         minWidth: 24,
//         textAlign: 'center',
//     },
//     divider: {
//         height: 1,
//         backgroundColor: '#27272A',
//         marginVertical: 8,
//     },
//     logoutButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginHorizontal: 20,
//         marginVertical: 24,
//         paddingVertical: 16,
//         borderWidth: 1,
//         borderColor: '#EF4444',
//         borderRadius: 8,
//         backgroundColor: 'rgba(239, 68, 68, 0.1)',
//     },
//     logoutButtonDisabled: {
//         opacity: 0.6,
//     },
//     logoutText: {
//         fontSize: 16,
//         color: '#EF4444',
//         fontWeight: '600',
//         marginLeft: 8,
//     },
//     logoutTextDisabled: {
//         color: '#9CA3AF',
//     },
//     version: {
//         textAlign: 'center',
//         fontSize: 12,
//         color: '#6B7280',
//         paddingBottom: 32,
//     },
// });

// export default ProfileScreen;