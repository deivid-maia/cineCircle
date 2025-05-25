import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../contexts/AuthContext';

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        label: '',
        color: '#9CA3AF'
    });

    const { register, loading } = useAuth();

    // Avaliar a força da senha sempre que ela mudar
    useEffect(() => {
        checkPasswordStrength(password);
    }, [password]);

    // Função para verificar a força da senha
    const checkPasswordStrength = (pass) => {
        let score = 0;
        let label = '';
        let color = '#9CA3AF';

        if (pass.length > 0) score += 1;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;

        if (pass.length === 0) {
            label = '';
        } else if (score < 3) {
            label = 'Fraca';
            color = '#EF4444';
        } else if (score < 5) {
            label = 'Média';
            color = '#F59E0B';
        } else {
            label = 'Forte';
            color = '#10B981';
        }

        setPasswordStrength({ score, label, color });
    };

    // Validação de email
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Validação dos campos
    const validateFields = () => {
        let isValid = true;
        
        // Reset errors
        setNameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');

        // Validar nome
        if (!name.trim()) {
            setNameError('Nome é obrigatório');
            isValid = false;
        } else if (name.trim().length < 2) {
            setNameError('Nome deve ter pelo menos 2 caracteres');
            isValid = false;
        }

        // Validar email
        if (!email.trim()) {
            setEmailError('Email é obrigatório');
            isValid = false;
        } else if (!validateEmail(email)) {
            setEmailError('Email inválido');
            isValid = false;
        }

        // Validar senha
        if (!password.trim()) {
            setPasswordError('Senha é obrigatória');
            isValid = false;
        } else if (password.length < 6) {
            setPasswordError('Senha deve ter pelo menos 6 caracteres');
            isValid = false;
        }

        // Validar confirmação de senha
        if (!confirmPassword.trim()) {
            setConfirmPasswordError('Confirmação de senha é obrigatória');
            isValid = false;
        } else if (password !== confirmPassword) {
            setConfirmPasswordError('Senhas não coincidem');
            isValid = false;
        }

        return isValid;
    };

    const handleRegister = async () => {
        if (!validateFields()) {
            return;
        }

        Keyboard.dismiss();

        try {
            const result = await register(email.trim(), password, name.trim());
            
            if (result.success) {
                console.log('Conta criada com sucesso');
                // Opcional: navegar para tela de sucesso
                // navigation.navigate('Sucesso');
                // A navegação será gerenciada automaticamente pelo AuthContext
            } else {
                Alert.alert(
                    'Erro ao Criar Conta',
                    result.error || 'Falha ao criar conta. Tente novamente.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Erro no registro:', error);
            Alert.alert(
                'Erro',
                'Ocorreu um erro inesperado. Tente novamente.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleLoginRedirect = () => {
        navigation.navigate('Login');
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
                        
                        <View style={styles.welcomeContainer}>
                            <Text style={styles.welcomeText}>
                                Sua jornada cinematográfica começa aqui!
                            </Text>
                            <Text style={styles.welcomeText}>
                                Vamos começar criando uma conta.
                            </Text>
                        </View>
                    </View>

                    {/* Formulário */}
                    <View style={styles.form}>
                        <Input 
                            label="Nome" 
                            placeholder="Seu nome completo" 
                            value={name}
                            onChangeText={(text) => {
                                setName(text);
                                if (nameError) setNameError('');
                            }}
                            autoCapitalize="words"
                            error={nameError}
                        />

                        <Input 
                            label="Email" 
                            placeholder="example@example.com" 
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (emailError) setEmailError('');
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={emailError}
                        />
                        
                        <Input 
                            label="Criar uma senha" 
                            placeholder="Senha" 
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (passwordError) setPasswordError('');
                            }}
                            secureTextEntry={true}
                            error={passwordError}
                        />
                        
                        {/* Indicador de força da senha */}
                        {password.length > 0 && (
                            <View style={styles.passwordStrengthContainer}>
                                <Text style={styles.passwordStrengthLabel}>
                                    Força da senha:
                                </Text>
                                <Text style={[
                                    styles.passwordStrengthText, 
                                    { color: passwordStrength.color }
                                ]}>
                                    {passwordStrength.label}
                                </Text>
                                <View style={styles.strengthMeter}>
                                    <View 
                                        style={[
                                            styles.strengthIndicator, 
                                            { 
                                                width: `${(passwordStrength.score / 5) * 100}%`,
                                                backgroundColor: passwordStrength.color 
                                            }
                                        ]} 
                                    />
                                </View>
                            </View>
                        )}

                        <Input 
                            label="Confirmar senha" 
                            placeholder="Confirme sua senha" 
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                if (confirmPasswordError) setConfirmPasswordError('');
                            }}
                            secureTextEntry={true}
                            error={confirmPasswordError}
                        />
                        
                        {/* Termos e condições */}
                        <Text style={styles.termsText}>
                            Ao criar uma conta, você declara estar de acordo com nossos{' '}
                            <Text style={styles.linkText}>Termos & Condições</Text>
                            {' '}& <Text style={styles.linkText}>Política de Privacidade</Text>.
                        </Text>
                        
                        <Button 
                            title="CRIAR CONTA" 
                            onPress={handleRegister}
                            loading={loading}
                            disabled={loading}
                        />
                    </View>

                    {/* Link para login */}
                    <View style={styles.loginLinkContainer}>
                        <Text style={styles.loginText}>
                            Já possui uma conta?{' '}
                            <Text 
                                style={styles.loginLink}
                                onPress={handleLoginRedirect}
                            >
                                Entre com ela
                            </Text>
                        </Text>
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
    welcomeContainer: {
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 24,
    },
    form: {
        width: '100%',
        marginBottom: 20,
    },
    passwordStrengthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    passwordStrengthLabel: {
        fontSize: 12,
        color: '#FFFFFF',
        marginRight: 5,
    },
    passwordStrengthText: {
        fontSize: 12,
        fontWeight: '500',
    },
    strengthMeter: {
        height: 4,
        backgroundColor: '#4B5563',
        borderRadius: 2,
        marginTop: 5,
        width: '100%',
    },
    strengthIndicator: {
        height: '100%',
        borderRadius: 2,
    },
    termsText: {
        fontSize: 12,
        color: '#FFFFFF',
        textAlign: 'center',
        marginVertical: 20,
        lineHeight: 18,
    },
    linkText: {
        color: '#BD0DC0',
        fontWeight: '500',
    },
    loginLinkContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    loginText: {
        fontSize: 14,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    loginLink: {
        color: '#BD0DC0',
        fontWeight: '500',
    },
});

export default RegisterScreen;