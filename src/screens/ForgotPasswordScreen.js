import React, { useState } from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    SafeAreaView, 
    TouchableOpacity, 
    Image, 
    ScrollView,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../contexts/AuthContext';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const { resetPassword } = useAuth();

    // Validação de email
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Validação do campo
    const validateField = () => {
        setEmailError('');

        if (!email.trim()) {
            setEmailError('Por favor, digite seu email');
            return false;
        } 
        
        if (!validateEmail(email)) {
            setEmailError('Por favor, digite um email válido');
            return false;
        }

        return true;
    };

    const handleSendResetEmail = async () => {
        if (!validateField()) {
            return;
        }

        Keyboard.dismiss();
        setIsLoading(true);

        try {
            const result = await resetPassword(email.trim());
            
            if (result.success) {
                setEmailSent(true);
                // Não mostra Alert aqui porque já temos a tela de sucesso
                console.log('Email de recuperação enviado com sucesso');
            } else {
                Alert.alert(
                    'Erro ao enviar email',
                    result.error || 'Não foi possível enviar o email de recuperação. Verifique se o email está correto e tente novamente.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Erro na recuperação de senha:', error);
            Alert.alert(
                'Erro',
                'Ocorreu um erro inesperado. Verifique sua conexão e tente novamente.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigation.navigate('Login');
    };

    const handleCreateAccount = () => {
        navigation.navigate('Cadastro');
    };

    const handleResendEmail = async () => {
        await handleSendResetEmail();
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header com botão de voltar */}
                    <View style={styles.header}>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={handleBackToLogin}
                        >
                            <Feather name="arrow-left" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Logo e Texto */}
                    <View style={styles.logoSection}>
                        <Image 
                            source={require('../../assets/cineCircle-logoTexto.png')} 
                            style={styles.logo}
                        />
                    </View>

                    {/* Conteúdo principal */}
                    <View style={styles.content}>
                        {!emailSent ? (
                            // Formulário para enviar email
                            <>
                                <View style={styles.titleSection}>
                                    <Text style={styles.title}>Esqueceu sua senha?</Text>
                                    <Text style={styles.subtitle}>
                                        Não se preocupe! Digite seu email e enviaremos um link para redefinir sua senha.
                                    </Text>
                                </View>

                                <View style={styles.form}>
                                    <Input 
                                        label="Email" 
                                        placeholder="Digite seu email cadastrado" 
                                        value={email}
                                        onChangeText={(text) => {
                                            setEmail(text);
                                            if (emailError && text.trim()) {
                                                setEmailError('');
                                            }
                                        }}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        error={emailError}
                                    />
                                    
                                    <Button 
                                        title="ENVIAR LINK DE RECUPERAÇÃO" 
                                        onPress={handleSendResetEmail}
                                        loading={isLoading}
                                        disabled={isLoading}
                                    />
                                </View>
                            </>
                        ) : (
                            // Tela de confirmação
                            <>
                                <View style={styles.successSection}>
                                    <View style={styles.successIcon}>
                                        <Feather name="mail" size={48} color="#10B981" />
                                    </View>
                                    <Text style={styles.successTitle}>Email enviado!</Text>
                                    <Text style={styles.successMessage}>
                                        Enviamos um link de redefinição de senha para:
                                    </Text>
                                    <Text style={styles.emailDisplay}>{email.trim()}</Text>
                                    <Text style={styles.successInstructions}>
                                        Verifique sua caixa de entrada e spam. O link expira em 1 hora.
                                    </Text>
                                </View>

                                <View style={styles.actionButtons}>
                                    <Button 
                                        title="REENVIAR EMAIL" 
                                        onPress={handleResendEmail}
                                        loading={isLoading}
                                        disabled={isLoading}
                                    />
                                    
                                    <TouchableOpacity 
                                        style={styles.backToLoginButton}
                                        onPress={handleBackToLogin}
                                        disabled={isLoading}
                                    >
                                        <Text style={[
                                            styles.backToLoginText,
                                            isLoading && styles.disabledText
                                        ]}>
                                            Voltar para o login
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Footer - só aparece se não enviou email ainda */}
                    {!emailSent && (
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                Não tem uma conta?{' '}
                                <Text 
                                    style={styles.footerLink}
                                    onPress={handleCreateAccount}
                                >
                                    Criar conta
                                </Text>
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#18181B',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 16,
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 150,
        height: 83, // Proporção mantida mas menor
    },
    content: {
        flex: 1,
    },
    titleSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 8,
    },
    form: {
        width: '100%',
        marginBottom: 32,
    },
    successSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    successMessage: {
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
        marginBottom: 8,
    },
    emailDisplay: {
        fontSize: 16,
        color: '#BD0DC0',
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 16,
    },
    successInstructions: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 16,
    },
    actionButtons: {
        width: '100%',
    },
    backToLoginButton: {
        alignItems: 'center',
        paddingVertical: 16,
        marginTop: 8,
    },
    backToLoginText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    disabledText: {
        opacity: 0.5,
    },
    footer: {
        alignItems: 'center',
        marginTop: 'auto',
        paddingTop: 20,
    },
    footerText: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    footerLink: {
        color: '#BD0DC0',
        fontWeight: '500',
    },
});

export default ForgotPasswordScreen;