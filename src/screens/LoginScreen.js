
//opção com esqueceu a senha junto com criar conta
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
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../contexts/AuthContext'

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    
    const { login, loading } = useAuth();

    // Validação de email
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Validação dos campos
    const validateFields = () => {
        let isValid = true;
        
        // Reset errors
        setEmailError('');
        setPasswordError('');

        // Validar email
        if (!email.trim()) {
            setEmailError('Por favor, digite seu email');
            isValid = false;
        } else if (!validateEmail(email)) {
            setEmailError('Por favor, digite um email válido');
            isValid = false;
        }

        // Validar senha
        if (!password.trim()) {
            setPasswordError('Por favor, digite sua senha');
            isValid = false;
        } else if (password.length < 6) {
            setPasswordError('A senha deve ter pelo menos 6 caracteres');
            isValid = false;
        }

        // Se ambos os campos estiverem vazios, mostrar uma mensagem geral
        if (!email.trim() && !password.trim()) {
            Alert.alert(
                'Campos obrigatórios',
                'Por favor, preencha seu email e senha para continuar.',
                [{ text: 'OK' }]
            );
        }

        return isValid;
    };

    const handleLogin = async () => {
        // Validar campos antes de tentar fazer login
        if (!validateFields()) {
            return;
        }

        Keyboard.dismiss();

        try {
            const result = await login(email.trim(), password);
            
            if (result.success) {
                console.log('Login realizado com sucesso');
                // Limpar campos após login bem-sucedido
                setEmail('');
                setPassword('');
                setEmailError('');
                setPasswordError('');
                // A navegação será gerenciada automaticamente pelo AuthContext
            } else {
                Alert.alert(
                    'Erro no Login',
                    result.error || 'Falha ao fazer login. Tente novamente.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Erro no login:', error);
            Alert.alert(
                'Erro',
                'Ocorreu um erro inesperado. Tente novamente.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleCreateAccount = () => {
        navigation.navigate('Cadastro');
    };

    const handleForgotPassword = () => {
        navigation.navigate('RedefinirSenha');
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
                    {/* Logo e Texto */}
                    <View style={styles.header}>
                        <Image 
                            source={require('../../assets/cineCircle-logoTexto.png')} 
                            style={styles.logo}
                        />
                        
                        <View style={styles.taglineContainer}>
                            <Text style={styles.taglinePurple}>
                                Conecte. Descubra. Compartilhe.
                            </Text>
                        </View>
                    </View>

                    {/* Formulário */}
                    <View style={styles.form}>
                        <Input 
                            label="Email" 
                            placeholder="julia@example.com" 
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                // Limpar erro quando o usuário começar a digitar
                                if (emailError && text.trim()) {
                                    setEmailError('');
                                }
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={emailError}
                        />
                        
                        <Input 
                            label="Senha" 
                            placeholder="••••••" 
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                // Limpar erro quando o usuário começar a digitar
                                if (passwordError && text.trim()) {
                                    setPasswordError('');
                                }
                            }}
                            secureTextEntry={true}
                            error={passwordError}
                        />
                        
                        <Button 
                            title="ENTRAR" 
                            onPress={handleLogin}
                            loading={loading}
                            disabled={loading}
                        />
                    </View>

                    {/* Links na mesma linha */}
                    <View style={styles.linksRow}>
                        <TouchableOpacity 
                            onPress={handleForgotPassword}
                            disabled={loading}
                        >
                            <Text style={styles.forgotPasswordText}>
                                Esqueceu a senha?
                            </Text>
                        </TouchableOpacity>
                        
                        <Text style={styles.separatorText}> | </Text>
                        
                        <TouchableOpacity 
                            onPress={handleCreateAccount}
                            disabled={loading}
                        >
                            <Text style={styles.createAccountText}>
                                Criar Conta
                            </Text>
                        </TouchableOpacity>
                    </View>
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
        alignItems: 'center',
        marginTop: 50,
        marginBottom: 30,
    },
    logo: {
        width: 181,
        height: 100,
        marginBottom: 16,
    },
    taglineContainer: {
        alignItems: 'center',
    },
    taglinePurple: {
        fontSize: 16,
        color: '#BD0DC0',
        textAlign: 'center',
        marginTop: 4,
    },
    form: {
        width: '100%',
        marginBottom: 20,
    },
    linksRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    separatorText: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    createAccountText: {
        fontSize: 14,
        color: '#BD0DC0',
        fontWeight: '500',
        textAlign: 'center',
    },
});

export default LoginScreen;