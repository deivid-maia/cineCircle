import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  ScrollView, 
  TouchableOpacity,
  Linking,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const HelpScreen = ({ navigation }) => {
    const [expandedSection, setExpandedSection] = useState(null);

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const handleContactSupport = () => {
        Alert.alert(
            "Entrar em contato",
            "Escolha uma opção para entrar em contato conosco:",
            [
                {
                    text: "Email",
                    onPress: () => Linking.openURL('mailto:suporte@cinecircle.com?subject=Dúvida sobre o app')
                },
                {
                    text: "WhatsApp",
                    onPress: () => Linking.openURL('https://wa.me/5518981175031?text=Olá, preciso de ajuda com o CineCircle')
                },
                {
                    text: "Cancelar",
                    style: "cancel"
                }
            ]
        );
    };

    const faqData = [
        {
            id: 'account',
            question: 'Como criar uma conta?',
            answer: 'Para criar uma conta, toque em "Criar Conta" na tela inicial, insira seu email e crie uma senha. Você receberá um email de confirmação.'
        },
        {
            id: 'friends',
            question: 'Como adicionar amigos?',
            answer: 'Vá para a aba "Amigos", use a barra de pesquisa para encontrar seus amigos pelo nome ou @username, e toque em "Conectar".'
        },
        {
            id: 'movies',
            question: 'Como marcar filmes como assistidos?',
            answer: 'Toque no botão "+" na barra inferior, busque o filme desejado, selecione "Já vi", avalie com estrelas e escreva sua opinião.'
        },
        {
            id: 'recommendations',
            question: 'Como fazer recomendações?',
            answer: 'Encontre um filme, toque em "Recomendar", escolha seus amigos, adicione uma nota explicando por que recomendam e envie.'
        },
        {
            id: 'privacy',
            question: 'Minhas informações estão seguras?',
            answer: 'Sim! Suas informações são protegidas e nunca compartilhadas com terceiros. Você pode revisar nossa política de privacidade nas configurações.'
        },
        {
            id: 'notifications',
            question: 'Como gerenciar notificações?',
            answer: 'Vá em Configurações > Notificações para personalizar quais alertas você deseja receber sobre recomendações, novos amigos, etc.'
        }
    ];

    const renderFAQItem = (item) => (
        <View key={item.id} style={styles.faqItem}>
            <TouchableOpacity 
                style={styles.faqQuestion}
                onPress={() => toggleSection(item.id)}
            >
                <Text style={styles.questionText}>{item.question}</Text>
                <Feather 
                    name={expandedSection === item.id ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#9CA3AF" 
                />
            </TouchableOpacity>
            {expandedSection === item.id && (
                <View style={styles.faqAnswer}>
                    <Text style={styles.answerText}>{item.answer}</Text>
                </View>
            )}
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
                <Text style={styles.headerTitle}>Central de Ajuda</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.content}>
                {/* Introdução */}
                <View style={styles.introSection}>
                    <Feather name="help-circle" size={40} color="#BD0DC0" style={styles.introIcon} />
                    <Text style={styles.introTitle}>Como podemos ajudar?</Text>
                    <Text style={styles.introText}>
                        Encontre respostas para as dúvidas mais comuns sobre o CineCircle ou entre em contato conosco.
                    </Text>
                </View>

                {/* Ações Rápidas */}
                <View style={styles.quickActionsSection}>
                    <Text style={styles.sectionTitle}>Ações Rápidas</Text>
                    
                    <TouchableOpacity 
                        style={styles.actionItem}
                        onPress={handleContactSupport}
                    >
                        <View style={styles.actionLeft}>
                            <View style={[styles.actionIcon, { backgroundColor: '#10B981' }]}>
                                <Feather name="message-circle" size={20} color="#FFFFFF" />
                            </View>
                            <View>
                                <Text style={styles.actionTitle}>Falar com Suporte</Text>
                                <Text style={styles.actionSubtitle}>Resposta em até 24h</Text>
                            </View>
                        </View>
                        <Feather name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    {/* <TouchableOpacity 
                        style={styles.actionItem}
                        onPress={() => Linking.openURL('https://cinecircle.com/termos')}
                    >
                        <View style={styles.actionLeft}>
                            <View style={[styles.actionIcon, { backgroundColor: '#3B82F6' }]}>
                                <Feather name="file-text" size={20} color="#FFFFFF" />
                            </View>
                            <View>
                                <Text style={styles.actionTitle}>Termos de Uso</Text>
                                <Text style={styles.actionSubtitle}>Leia nossas políticas</Text>
                            </View>
                        </View>
                        <Feather name="external-link" size={20} color="#9CA3AF" />
                    </TouchableOpacity> */}

                    {/* <TouchableOpacity 
                        style={styles.actionItem}
                        onPress={() => Linking.openURL('https://cinecircle.com/tutorial')}
                    >
                        <View style={styles.actionLeft}>
                            <View style={[styles.actionIcon, { backgroundColor: '#F59E0B' }]}>
                                <Feather name="play-circle" size={20} color="#FFFFFF" />
                            </View>
                            <View>
                                <Text style={styles.actionTitle}>Tutorial do App</Text>
                                <Text style={styles.actionSubtitle}>Vídeo explicativo</Text>
                            </View>
                        </View>
                        <Feather name="external-link" size={20} color="#9CA3AF" />
                    </TouchableOpacity> */}
                </View>

                {/* Perguntas Frequentes */}
                <View style={styles.faqSection}>
                    <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
                    {faqData.map(renderFAQItem)}
                </View>

                {/* Dicas de Uso */}
                <View style={styles.tipsSection}>
                    <Text style={styles.sectionTitle}>Dicas para Aproveitar Melhor</Text>
                    
                    <View style={styles.tipItem}>
                        <Feather name="users" size={16} color="#BD0DC0" style={styles.tipIcon} />
                        <Text style={styles.tipText}>
                            Adicione amigos para receber recomendações personalizadas
                        </Text>
                    </View>
                    
                    <View style={styles.tipItem}>
                        <Feather name="star" size={16} color="#BD0DC0" style={styles.tipIcon} />
                        <Text style={styles.tipText}>
                            Avalie filmes para melhorar suas recomendações
                        </Text>
                    </View>
                    
                    <View style={styles.tipItem}>
                        <Feather name="bell" size={16} color="#BD0DC0" style={styles.tipIcon} />
                        <Text style={styles.tipText}>
                            Ative notificações para não perder recomendações dos amigos
                        </Text>
                    </View>
                </View>

                {/* Informações do App */}
                <View style={styles.appInfoSection}>
                    <Text style={styles.sectionTitle}>Informações do App</Text>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Versão</Text>
                            <Text style={styles.infoValue}>1.0.0</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Última Atualização</Text>
                            <Text style={styles.infoValue}>Mai 2025</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Ainda tem dúvidas? Entre em contato conosco!
                    </Text>
                    <TouchableOpacity 
                        style={styles.contactButton}
                        onPress={handleContactSupport}
                    >
                        <Text style={styles.contactButtonText}>Falar com Suporte</Text>
                    </TouchableOpacity>
                </View>

                <View  style={styles.spacer} /> 
                    
                
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
    introSection: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#27272A',
    },
    introIcon: {
        marginBottom: 16,
    },
    introTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 12,
        textAlign: 'center',
    },
    introText: {
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 22,
    },
    quickActionsSection: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#27272A',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#27272A',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    actionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    actionSubtitle: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    faqSection: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#27272A',
    },
    faqItem: {
        marginBottom: 8,
        backgroundColor: '#27272A',
        borderRadius: 8,
        overflow: 'hidden',
    },
    faqQuestion: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    questionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
        flex: 1,
        marginRight: 12,
    },
    faqAnswer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: '#3A3A3D',
    },
    answerText: {
        fontSize: 14,
        color: '#D1D5DB',
        lineHeight: 20,
    },
    tipsSection: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#27272A',
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    tipIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    tipText: {
        fontSize: 14,
        color: '#D1D5DB',
        flex: 1,
        lineHeight: 20,
    },
    appInfoSection: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#27272A',
    },
    infoGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoItem: {
        flex: 1,
        backgroundColor: '#27272A',
        borderRadius: 8,
        padding: 16,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    footer: {
        padding: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
        marginBottom: 16,
    },
    contactButton: {
        backgroundColor: '#BD0DC0',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    contactButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    spacer: {
        height: 40,
    },
});

export default HelpScreen;