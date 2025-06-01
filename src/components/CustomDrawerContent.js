import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useAuth } from '../contexts/AuthContext';
import { useLogout } from '../contexts/useLogout';
import { useMovies } from '../contexts/useMovies';
import { useFriends } from '../contexts/FriendsContext';

const CustomDrawerContent = (props) => {
    const { navigation, state } = props;
    const { user } = useAuth();
    const { handleLogout, loading } = useLogout();
    const { stats } = useMovies();
    const { friends, stats: friendsStats } = useFriends();
    
    // Função de navegação para as telas do Drawer
    const navigateToScreen = (screenName) => {
        navigation.navigate(screenName);
    };

    // Função para avatar
    const getAvatarUrl = () => {
        if (user?.photoURL) return user.photoURL;
        return null;
    };

    const hasAvatar = getAvatarUrl() !== null;

    // Função para nome do usuário
    const getUserName = () => {
        if (user?.displayName) {
            return user.displayName;
        }
        if (user?.email) {
            return user.email.split('@')[0];
        }
        return 'Usuário';
    };

    // Função para username
    const getUserUsername = () => {
        if (user?.email) {
            return `@${user.email.split('@')[0]}`;
        }
        return '@usuario';
    };

    // Função para gerar avatar padrão
    const getDefaultAvatar = () => {
        const name = getUserName();
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=BD0DC0&color=fff&size=160`;
    };

    return (
        <DrawerContentScrollView
            {...props}
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            {/* Header com avatar e info do usuário */}
            <View style={styles.userInfoSection}>
                {hasAvatar ? (
                    <Image 
                        source={{ uri: getAvatarUrl() }} 
                        style={styles.avatar} 
                        onError={() => console.log('Erro ao carregar avatar do usuário')}
                    />
                ) : (
                    <Image 
                        source={{ uri: getDefaultAvatar() }} 
                        style={styles.avatar}
                        onError={() => (
                            <View style={styles.avatarPlaceholder}>
                                <Feather name="user" size={32} color="#9CA3AF" />
                            </View>
                        )}
                    />
                )}
                
                <Text style={styles.userName}>{getUserName()}</Text>
                <Text style={styles.userUsername}>{getUserUsername()}</Text>
                
                {/* Estatísticas reais */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats?.total || 0}</Text>
                        <Text style={styles.statLabel}>Filmes</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{friends?.length || 0}</Text>
                        <Text style={styles.statLabel}>Amigos</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats?.ratings || 0}</Text>
                        <Text style={styles.statLabel}>Avaliações</Text>
                    </View>
                </View>
            </View>

            {/* Itens do menu principal */}
            <View style={styles.drawerItemsContainer}>
                <TouchableOpacity 
                    style={[
                        styles.drawerItem, 
                        state?.index === 0 && styles.activeDrawerItem
                    ]} 
                    onPress={() => navigateToScreen('MainTabs')}
                >
                    <Feather 
                        name="home" 
                        size={22} 
                        color={state?.index === 0 ? "#BD0DC0" : "#FFF"} 
                        style={styles.drawerIcon} 
                    />
                    <Text style={[
                        styles.drawerItemText,
                        state?.index === 0 && styles.activeDrawerItemText
                    ]}>
                        Início
                    </Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.divider} />

            {/* Menu de configurações */}
            <View style={styles.drawerItemsContainer}>
                <TouchableOpacity 
                    style={[
                        styles.drawerItem, 
                        state?.index === 1 && styles.activeDrawerItem
                    ]} 
                    onPress={() => navigateToScreen('Settings')}
                >
                    <Feather 
                        name="settings" 
                        size={22} 
                        color={state?.index === 1 ? "#BD0DC0" : "#9CA3AF"} 
                        style={styles.drawerIcon} 
                    />
                    <Text style={[
                        styles.drawerItemText,
                        state?.index === 1 && styles.activeDrawerItemText
                    ]}>
                        Configurações
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[
                        styles.drawerItem, 
                        state?.index === 2 && styles.activeDrawerItem
                    ]} 
                    onPress={() => navigateToScreen('Notifications')}
                >
                    <Feather 
                        name="bell" 
                        size={22} 
                        color={state?.index === 2 ? "#BD0DC0" : "#9CA3AF"} 
                        style={styles.drawerIcon} 
                    />
                    <Text style={[
                        styles.drawerItemText,
                        state?.index === 2 && styles.activeDrawerItemText
                    ]}>
                        Notificações
                    </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[
                        styles.drawerItem, 
                        state?.index === 3 && styles.activeDrawerItem
                    ]} 
                    onPress={() => navigateToScreen('Help')}
                >
                    <Feather 
                        name="help-circle" 
                        size={22} 
                        color={state?.index === 3 ? "#BD0DC0" : "#9CA3AF"} 
                        style={styles.drawerIcon} 
                    />
                    <Text style={[
                        styles.drawerItemText,
                        state?.index === 3 && styles.activeDrawerItemText
                    ]}>
                        Ajuda
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Footer com logout */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[
                        styles.logoutButton,
                        loading && styles.logoutButtonDisabled
                    ]} 
                    onPress={handleLogout}
                    disabled={loading}
                >
                    <Feather 
                        name="log-out" 
                        size={22} 
                        color={loading ? "#9CA3AF" : "#EF4444"} 
                        style={styles.drawerIcon} 
                    />
                    <Text style={[
                        styles.logoutText,
                        loading && styles.logoutTextDisabled
                    ]}>
                        {loading ? 'Saindo...' : 'Sair do aplicativo'}
                    </Text>
                </TouchableOpacity>
                
                {user?.email && (
                    <Text style={styles.userEmail} numberOfLines={1}>
                        {user.email}
                    </Text>
                )}
            </View>
        </DrawerContentScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#18181B',
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        paddingTop: 20,
        paddingBottom: 20,
    },
    userInfoSection: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#27272A',
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: '#BD0DC0',
        marginBottom: 10,
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
        marginBottom: 10,
    },
    userName: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    userUsername: {
        color: '#9CA3AF',
        fontSize: 14,
        marginBottom: 10,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        color: '#9CA3AF',
        fontSize: 12,
    },
    statDivider: {
        width: 1,
        height: '100%',
        backgroundColor: '#27272A',
    },
    drawerItemsContainer: {
        paddingVertical: 10,
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    activeDrawerItem: {
        backgroundColor: 'rgba(189, 13, 192, 0.1)',
    },
    drawerIcon: {
        marginRight: 15,
        width: 22,
    },
    drawerItemText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    activeDrawerItemText: {
        color: '#BD0DC0',
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#27272A',
        marginVertical: 10,
        marginHorizontal: 15,
    },
    footer: {
        marginTop: 'auto',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#27272A',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    logoutButtonDisabled: {
        opacity: 0.6,
    },
    logoutText: {
        color: '#EF4444',
        fontSize: 16,
    },
    logoutTextDisabled: {
        color: '#9CA3AF',
    },
    userEmail: {
        color: '#6B7280',
        fontSize: 12,
        marginTop: 8,
        fontStyle: 'italic',
    },
});


export default CustomDrawerContent;