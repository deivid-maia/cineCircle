//tela de exemplo, pq essa tem que ser criada por ultimo
import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    StatusBar, 
    ScrollView, 
    TouchableOpacity,
    RefreshControl
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const NotificationsScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    
    // Dados mockados de notificações - em produção viria do Firebase
    const [notifications, setNotifications] = useState([
        {
            id: '1',
            type: 'friend_request',
            title: 'Nova solicitação de amizade',
            message: 'Maria Silva quer se conectar com você',
            time: '2 min atrás',
            read: false,
            icon: 'user-plus',
            color: '#10B981'
        },
        {
            id: '2',
            type: 'recommendation',
            title: 'Nova recomendação',
            message: 'João recomendou "Parasita" para você',
            time: '1 hora atrás',
            read: false,
            icon: 'share-2',
            color: '#BD0DC0'
        },
        {
            id: '3',
            type: 'movie_release',
            title: 'Novo filme disponível',
            message: 'O filme que você queria assistir está em cartaz',
            time: '3 horas atrás',
            read: true,
            icon: 'film',
            color: '#F59E0B'
        },
        {
            id: '4',
            type: 'review',
            title: 'Alguém curtiu sua resenha',
            message: 'Ana curtiu sua resenha de "Interestelar"',
            time: '1 dia atrás',
            read: true,
            icon: 'heart',
            color: '#EF4444'
        },
        {
            id: '5',
            type: 'system',
            title: 'Bem-vindo ao CineCircle!',
            message: 'Complete seu perfil para ter uma experiência personalizada',
            time: '2 dias atrás',
            read: true,
            icon: 'info',
            color: '#3B82F6'
        }
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        // Simular carregamento
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    const markAsRead = (id) => {
        setNotifications(prev => 
            prev.map(notification => 
                notification.id === id 
                    ? { ...notification, read: true }
                    : notification
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => 
            prev.map(notification => ({ ...notification, read: true }))
        );
    };

    const deleteNotification = (id) => {
        setNotifications(prev => 
            prev.filter(notification => notification.id !== id)
        );
    };

    const NotificationItem = ({ item }) => (
        <TouchableOpacity 
            style={[
                styles.notificationItem,
                !item.read && styles.unreadNotification
            ]}
            onPress={() => markAsRead(item.id)}
        >
            <View style={styles.notificationLeft}>
                <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                    <Feather name={item.icon} size={16} color="#FFFFFF" />
                </View>
                <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.notificationMessage}>{item.message}</Text>
                    <Text style={styles.notificationTime}>{item.time}</Text>
                </View>
            </View>
            <View style={styles.notificationRight}>
                {!item.read && <View style={styles.unreadDot} />}
                <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => deleteNotification(item.id)}
                >
                    <Feather name="x" size={16} color="#9CA3AF" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const EmptyState = () => (
        <View style={styles.emptyState}>
            <Feather name="bell" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
            <Text style={styles.emptyMessage}>
                Quando você receber notificações, elas aparecerão aqui
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Feather name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Notificações</Text>
                    {unreadCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{unreadCount}</Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity 
                    style={styles.markAllButton}
                    onPress={markAllAsRead}
                    disabled={unreadCount === 0}
                >
                    <Feather 
                        name="check" 
                        size={20} 
                        color={unreadCount > 0 ? "#BD0DC0" : "#9CA3AF"} 
                    />
                </TouchableOpacity>
            </View>

            {notifications.length === 0 ? (
                <EmptyState />
            ) : (
                <ScrollView 
                    style={styles.content}
                    refreshControl={
                        <RefreshControl 
                            refreshing={refreshing} 
                            onRefresh={onRefresh}
                            tintColor="#BD0DC0"
                        />
                    }
                >
                    {notifications.map((item) => (
                        <NotificationItem key={item.id} item={item} />
                    ))}
                    
                    {/* Espaço extra no final */}
                    <View style={styles.bottomSpacing} />
                </ScrollView>
            )}
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
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    badge: {
        backgroundColor: '#BD0DC0',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    markAllButton: {
        padding: 4,
    },
    content: {
        flex: 1,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#27272A',
    },
    unreadNotification: {
        backgroundColor: 'rgba(189, 13, 192, 0.05)',
    },
    notificationLeft: {
        flexDirection: 'row',
        flex: 1,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    notificationMessage: {
        fontSize: 14,
        color: '#D1D5DB',
        lineHeight: 20,
        marginBottom: 4,
    },
    notificationTime: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    notificationRight: {
        alignItems: 'center',
        marginLeft: 12,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#BD0DC0',
        marginBottom: 8,
    },
    deleteButton: {
        padding: 4,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyMessage: {
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 22,
    },
    bottomSpacing: {
        height: 40,
    },
});

export default NotificationsScreen;