import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  ScrollView, 
  TouchableOpacity,
  Switch,
  Alert,
  Linking
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useLogout } from '../contexts/useLogout';

const SettingsScreen = ({ navigation }) => {
    const { user, deleteAccount } = useAuth();
    const { handleLogout, loading } = useLogout();
    
    // Estados para as configurações
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [friendRequests, setFriendRequests] = useState(true);
    const [recommendations, setRecommendations] = useState(true);
    const [newMovies, setNewMovies] = useState(false);
    const [movieUpdates, setMovieUpdates] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [autoPlay, setAutoPlay] = useState(false);
    const [dataUsage, setDataUsage] = useState(false);

    const handleDeleteAccount = () => {
        Alert.alert(
            "Excluir conta",
            "Esta ação não pode ser desfeita. Todos os seus dados, listas e recomendações serão permanentemente removidos.",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const result = await deleteAccount();
                            
                            if (result.success) {
                                Alert.alert(
                                    "Conta excluída",
                                    "Sua conta foi excluída com sucesso.",
                                    [{ text: "OK" }]
                                );
                                // A navegação será gerenciada automaticamente pelo AuthContext
                            } else {
                                Alert.alert(
                                    "Erro ao excluir conta",
                                    result.error || "Não foi possível excluir sua conta. Tente novamente.",
                                    [{ text: "OK" }]
                                );
                            }
                        } catch (error) {
                            console.error('Erro na exclusão:', error);
                            Alert.alert(
                                "Erro",
                                "Ocorreu um erro inesperado. Tente novamente.",
                                [{ text: "OK" }]
                            );
                        }
                    }
                }
            ]
        );
    };

    const SettingItem = ({ icon, title, subtitle, onPress, rightComponent, showArrow = false }) => (
        <TouchableOpacity 
            style={styles.settingItem}
            onPress={onPress}
            disabled={!onPress || loading}
        >
            <View style={styles.settingLeft}>
                <Feather name={icon} size={20} color="#9CA3AF" style={styles.settingIcon} />
                <View style={styles.settingTexts}>
                    <Text style={styles.settingTitle}>{title}</Text>
                    {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            <View style={styles.settingRight}>
                {rightComponent}
                {showArrow && <Feather name="chevron-right" size={20} color="#9CA3AF" />}
            </View>
        </TouchableOpacity>
    );

    const SectionHeader = ({ title }) => (
        <Text style={styles.sectionTitle}>{title}</Text>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                >
                    <Feather name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Configurações</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.content}>
                {/* Conta */}
                <SectionHeader title="CONTA" />
                
                <SettingItem
                    icon="user"
                    title="Editar Perfil"
                    subtitle="Nome, foto, email, senha e biografia"
                    onPress={() => navigation.navigate('EditProfile')}
                    showArrow
                />

                {/* Notificações */}
                <SectionHeader title="NOTIFICAÇÕES" />
                
                <SettingItem
                    icon="bell"
                    title="Notificações"
                    subtitle="Ativar/desativar todas as notificações"
                    rightComponent={
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ false: "#3A3A3D", true: "#BD0DC0" }}
                            thumbColor="#FFFFFF"
                            disabled={loading}
                        />
                    }
                />
                
                <SettingItem
                    icon="user-plus"
                    title="Solicitações de Amizade"
                    subtitle="Novos pedidos de conexão"
                    rightComponent={
                        <Switch
                            value={friendRequests}
                            onValueChange={setFriendRequests}
                            trackColor={{ false: "#3A3A3D", true: "#BD0DC0" }}
                            thumbColor="#FFFFFF"
                            disabled={!notificationsEnabled || loading}
                        />
                    }
                />
                
                <SettingItem
                    icon="share-2"
                    title="Recomendações"
                    subtitle="Quando amigos recomendam filmes"
                    rightComponent={
                        <Switch
                            value={recommendations}
                            onValueChange={setRecommendations}
                            trackColor={{ false: "#3A3A3D", true: "#BD0DC0" }}
                            thumbColor="#FFFFFF"
                            disabled={!notificationsEnabled || loading}
                        />
                    }
                />
                
                <SettingItem
                    icon="film"
                    title="Novos Filmes"
                    subtitle="Lançamentos e destaques"
                    rightComponent={
                        <Switch
                            value={newMovies}
                            onValueChange={setNewMovies}
                            trackColor={{ false: "#3A3A3D", true: "#BD0DC0" }}
                            thumbColor="#FFFFFF"
                            disabled={!notificationsEnabled || loading}
                        />
                    }
                />

                {/* Suporte */}
                <SectionHeader title="SUPORTE" />
                
                <SettingItem
                    icon="help-circle"
                    title="Central de Ajuda"
                    subtitle="Perguntas frequentes e tutoriais"
                    onPress={() => navigation.navigate('Help')}
                    showArrow
                />
                
                <SettingItem
                    icon="message-circle"
                    title="Fale Conosco"
                    subtitle="Entre em contato com nossa equipe"
                    onPress={() => Linking.openURL('mailto:suporte@cinecircle.com')}
                    showArrow
                />
                
                <SettingItem
                    icon="star"
                    title="Avaliar App"
                    subtitle="Nos ajude a melhorar"
                    onPress={() => {
                        // Link para a loja de apps
                        const storeUrl = Platform.OS === 'ios' 
                            ? 'https://apps.apple.com/app/cinecircle'
                            : 'https://play.google.com/store/apps/details?id=com.cinecircle';
                        Linking.openURL(storeUrl);
                    }}
                    showArrow
                />

                {/* Sobre */}
                <SectionHeader title="SOBRE" />
                
                <SettingItem
                    icon="info"
                    title="Versão do App"
                    subtitle="1.0.0"
                />
                
                <SettingItem
                    icon="file-text"
                    title="Termos de Uso"
                    onPress={() => Linking.openURL('https://cinecircle.com/termos')}
                    showArrow
                />
                
                <SettingItem
                    icon="shield"
                    title="Política de Privacidade"
                    onPress={() => Linking.openURL('https://cinecircle.com/privacidade')}
                    showArrow
                />

                {/* Ações da Conta */}
                <SectionHeader title="CONTA" />
                
                <TouchableOpacity 
                    style={[
                        styles.settingItem, 
                        styles.logoutButton,
                        loading && styles.disabledButton
                    ]}
                    onPress={handleLogout}
                    disabled={loading}
                >
                    <View style={styles.settingLeft}>
                        <Feather name="log-out" size={20} color="#EF4444" style={styles.settingIcon} />
                        <Text style={[styles.settingTitle, { color: '#EF4444' }]}>
                            {loading ? 'Saindo...' : 'Sair da Conta'}
                        </Text>
                    </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[
                        styles.settingItem, 
                        styles.deleteButton,
                        loading && styles.disabledButton
                    ]}
                    onPress={handleDeleteAccount}
                    disabled={loading}
                >
                    <View style={styles.settingLeft}>
                        <Feather name="trash-2" size={20} color="#DC2626" style={styles.settingIcon} />
                        <Text style={[styles.settingTitle, { color: '#DC2626' }]}>Excluir Conta</Text>
                    </View>
                </TouchableOpacity>

                {/* Espaço extra no final */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#18181B',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#27272A',
        paddingTop: 30,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    headerSpacer: {
        width: 32,
    },
    content: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9CA3AF',
        marginTop: 24,
        marginBottom: 8,
        marginHorizontal: 20,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#27272A',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingIcon: {
        marginRight: 16,
        width: 20,
    },
    settingTexts: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 2,
    },
    settingSubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        marginHorizontal: 20,
        borderRadius: 8,
        marginTop: 8,
    },
    deleteButton: {
        backgroundColor: 'rgba(220, 38, 38, 0.05)',
        marginHorizontal: 20,
        borderRadius: 8,
        marginTop: 8,
        marginBottom: 8,
    },
    disabledButton: {
        opacity: 0.6,
    },
    bottomSpacing: {
        height: 40,
    },
});

export default SettingsScreen;