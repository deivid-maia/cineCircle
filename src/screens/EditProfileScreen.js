import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';

const EditProfileScreen = ({ navigation }) => {
    const { 
        user, 
        updateDisplayName, 
        uploadProfilePhoto, 
        removeProfilePhoto,
        updateEmail,
        updatePassword,
        updateBio,
        getBio
    } = useAuth();
    
    const [loading, setLoading] = useState(false);
    const [imageUri, setImageUri] = useState(null);
    
    // Estados do formulário
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [bio, setBio] = useState('');
    
    // Estados de erro
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [currentPasswordError, setCurrentPasswordError] = useState('');
    const [newPasswordError, setNewPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    
    // Estados de UI
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [showEmailSection, setShowEmailSection] = useState(false);

    // Carregar biografia ao abrir a tela
    useEffect(() => {
        loadBio();
    }, []);

    const loadBio = async () => {
        try {
            const result = await getBio();
            if (result.success) {
                setBio(result.bio || '');
            }
        } catch (error) {
            console.error('Erro ao carregar biografia:', error);
        }
    };

    // Avatar do usuário - só mostra se ele tiver foto
    const getAvatarUrl = () => {
        if (imageUri) return imageUri; // Foto escolhida pelo usuário
        if (user?.photoURL) return user.photoURL; // Foto salva no Firebase
        return null; // Sem foto - mostra placeholder
    };

    const hasAvatar = getAvatarUrl() !== null;

    // Solicitar permissão para acessar galeria
    const requestPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permissão necessária',
                'Precisamos de permissão para acessar sua galeria de fotos.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    // Escolher imagem da galeria
    const pickImage = async () => {
        const hasPermission = await requestPermission();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1], // Quadrado
                quality: 0.8,
                base64: false,
            });

            if (!result.canceled && result.assets[0]) {
                setImageUri(result.assets[0].uri);
                // Aqui você implementaria o upload para o Firebase Storage
                // await uploadImageToFirebase(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Erro ao selecionar imagem:', error);
            Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
        }
    };

    // Tirar foto com câmera
    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permissão necessária',
                'Precisamos de permissão para usar a câmera.',
                [{ text: 'OK' }]
            );
            return;
        }

        try {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setImageUri(result.assets[0].uri);
                console.log('Foto tirada para upload');
            }
        } catch (error) {
            console.error('Erro ao tirar foto:', error);
            Alert.alert('Erro', 'Não foi possível tirar a foto.');
        }
    };

    // Remover foto
    const removePhoto = async () => {
        try {
            setLoading(true);
            const result = await removeProfilePhoto();
            if (result.success) {
                setImageUri(null);
                Alert.alert('Sucesso', 'Foto removida com sucesso!');
            } else {
                Alert.alert('Erro', result.error || 'Não foi possível remover a foto.');
            }
        } catch (error) {
            console.error('Erro ao remover foto:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao remover a foto.');
        } finally {
            setLoading(false);
        }
    };

    // Mostrar opções de imagem
    const showImageOptions = () => {
        const options = [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Galeria', onPress: pickImage },
            { text: 'Câmera', onPress: takePhoto },
        ];

        // Se já tem foto, adiciona opção de remover
        if (hasAvatar) {
            options.splice(1, 0, { 
                text: 'Remover foto', 
                onPress: removePhoto,
                style: 'destructive'
            });
        }

        Alert.alert(
            hasAvatar ? 'Alterar foto' : 'Adicionar foto',
            'Como você gostaria de ' + (hasAvatar ? 'alterar' : 'adicionar') + ' sua foto?',
            options
        );
    };

    // Validação completa
    const validateFields = () => {
        let isValid = true;
        
        // Reset errors
        setNameError('');
        setEmailError('');
        setCurrentPasswordError('');
        setNewPasswordError('');
        setConfirmPasswordError('');

        // Validar nome
        if (!displayName.trim()) {
            setNameError('Nome é obrigatório');
            isValid = false;
        } else if (displayName.trim().length < 2) {
            setNameError('Nome deve ter pelo menos 2 caracteres');
            isValid = false;
        }

        // Validar email (se está sendo alterado)
        if (showEmailSection && email !== user?.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email.trim()) {
                setEmailError('Email é obrigatório');
                isValid = false;
            } else if (!emailRegex.test(email)) {
                setEmailError('Email inválido');
                isValid = false;
            }
            
            if (!currentPassword.trim()) {
                setCurrentPasswordError('Senha atual é obrigatória para alterar email');
                isValid = false;
            }
        }

        // Validar senhas (se está sendo alterada)
        if (showPasswordSection) {
            if (!currentPassword.trim()) {
                setCurrentPasswordError('Senha atual é obrigatória');
                isValid = false;
            }
            
            if (!newPassword.trim()) {
                setNewPasswordError('Nova senha é obrigatória');
                isValid = false;
            } else if (newPassword.length < 6) {
                setNewPasswordError('Nova senha deve ter pelo menos 6 caracteres');
                isValid = false;
            }
            
            if (!confirmPassword.trim()) {
                setConfirmPasswordError('Confirmação de senha é obrigatória');
                isValid = false;
            } else if (newPassword !== confirmPassword) {
                setConfirmPasswordError('Senhas não coincidem');
                isValid = false;
            }
        }

        return isValid;
    };

    // Salvar todas as alterações
    const saveProfile = async () => {
        if (!validateFields()) {
            return;
        }

        setLoading(true);
        try {
            let updatesMade = [];
            let errors = [];

            // 1. Atualizar foto se mudou
            if (imageUri) {
                const photoResult = await uploadProfilePhoto(imageUri);
                if (photoResult.success) {
                    updatesMade.push('foto');
                } else {
                    errors.push(`Foto: ${photoResult.error}`);
                }
            }
            
            // 2. Atualizar nome se mudou
            if (displayName.trim() !== (user?.displayName || '')) {
                const nameResult = await updateDisplayName(displayName.trim());
                if (nameResult.success) {
                    updatesMade.push('nome');
                } else {
                    errors.push(`Nome: ${nameResult.error}`);
                }
            }
            
            // 3. Atualizar email se mudou
            if (showEmailSection && email !== user?.email) {
                const emailResult = await updateEmail(currentPassword, email);
                if (emailResult.success) {
                    updatesMade.push('email');
                } else {
                    errors.push(`Email: ${emailResult.error}`);
                }
            }
            
            // 4. Atualizar senha se mudou
            if (showPasswordSection) {
                const passwordResult = await updatePassword(currentPassword, newPassword);
                if (passwordResult.success) {
                    updatesMade.push('senha');
                } else {
                    errors.push(`Senha: ${passwordResult.error}`);
                }
            }

            // 5. Atualizar biografia
            const bioResult = await updateBio(bio);
            if (bioResult.success) {
                updatesMade.push('biografia');
            } else {
                errors.push(`Biografia: ${bioResult.error}`);
            }

            // Mostrar resultado
            if (errors.length > 0) {
                Alert.alert(
                    'Alguns problemas ocorreram',
                    `Atualizações realizadas: ${updatesMade.join(', ') || 'nenhuma'}\n\nErros:\n${errors.join('\n')}`,
                    [{ text: 'OK' }]
                );
            } else {
                const message = updatesMade.length > 0 
                    ? `${updatesMade.join(', ')} atualizado(s) com sucesso!`
                    : 'Perfil atualizado com sucesso!';
                    
                Alert.alert(
                    'Sucesso', 
                    message,
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.goBack()
                        }
                    ]
                );
            }
            
        } catch (error) {
            console.error('Erro ao salvar perfil:', error);
            Alert.alert('Erro', 'Não foi possível atualizar o perfil. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    // Cancelar edição
    const handleCancel = () => {
        const hasChanges = 
            displayName !== (user?.displayName || '') || 
            imageUri ||
            (showEmailSection && email !== user?.email) ||
            showPasswordSection ||
            bio.trim();
            
        if (hasChanges) {
            Alert.alert(
                'Descartar alterações',
                'Você tem alterações não salvas. Deseja descartá-las?',
                [
                    { text: 'Continuar editando', style: 'cancel' },
                    { 
                        text: 'Descartar', 
                        style: 'destructive',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } else {
            navigation.goBack();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.headerButton}
                        onPress={handleCancel}
                        disabled={loading}
                    >
                        <Text style={[styles.headerButtonText, loading && styles.disabledText]}>
                            Cancelar
                        </Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.headerTitle}>Editar Perfil</Text>
                    
                    <TouchableOpacity 
                        style={styles.headerButton}
                        onPress={saveProfile}
                        disabled={loading}
                    >
                        <Text style={[
                            styles.headerButtonText, 
                            styles.saveButtonText,
                            loading && styles.disabledText
                        ]}>
                            {loading ? 'Salvando...' : 'Salvar'}
                        </Text>
                    </TouchableOpacity>
                </View>
                
                <ScrollView 
                    style={styles.scrollView} 
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Avatar Section */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarContainer}>
                            {hasAvatar ? (
                                <Image
                                    source={{ uri: getAvatarUrl() }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Feather name="user" size={40} color="#9CA3AF" />
                                </View>
                            )}
                            
                            <TouchableOpacity
                                style={styles.cameraButton}
                                onPress={showImageOptions}
                                disabled={loading}
                            >
                                <Feather 
                                    name={hasAvatar ? "edit-2" : "camera"} 
                                    size={16} 
                                    color="#FFFFFF" 
                                />
                            </TouchableOpacity>
                        </View>
                        
                        <Text style={styles.avatarHint}>
                            Toque para {hasAvatar ? 'alterar' : 'adicionar'} sua foto
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        {/* Nome */}
                        <Input
                            label="Nome"
                            placeholder="Seu nome completo"
                            value={displayName}
                            onChangeText={(text) => {
                                setDisplayName(text);
                                if (nameError && text.trim()) {
                                    setNameError('');
                                }
                            }}
                            autoCapitalize="words"
                            error={nameError}
                            editable={!loading}
                        />

                        {/* Email */}
                        <View style={styles.sectionContainer}>
                            <TouchableOpacity 
                                style={styles.sectionHeader}
                                onPress={() => setShowEmailSection(!showEmailSection)}
                                disabled={loading}
                            >
                                <Text style={styles.sectionTitle}>Alterar Email</Text>
                                <Feather 
                                    name={showEmailSection ? "chevron-up" : "chevron-down"} 
                                    size={20} 
                                    color="#9CA3AF" 
                                />
                            </TouchableOpacity>
                            
                            {!showEmailSection && (
                                <Text style={styles.currentValue}>Atual: {user?.email}</Text>
                            )}
                            
                            {showEmailSection && (
                                <View style={styles.sectionContent}>
                                    <Input
                                        label="Novo Email"
                                        placeholder="novo@email.com"
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
                                        editable={!loading}
                                    />
                                    
                                    <Input
                                        label="Senha Atual"
                                        placeholder="Digite sua senha atual"
                                        value={currentPassword}
                                        onChangeText={(text) => {
                                            setCurrentPassword(text);
                                            if (currentPasswordError && text.trim()) {
                                                setCurrentPasswordError('');
                                            }
                                        }}
                                        secureTextEntry={true}
                                        error={currentPasswordError}
                                        editable={!loading}
                                    />
                                    
                                    <Text style={styles.warningText}>
                                        ⚠️ Você precisará fazer login novamente após alterar o email
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Senha */}
                        <View style={styles.sectionContainer}>
                            <TouchableOpacity 
                                style={styles.sectionHeader}
                                onPress={() => setShowPasswordSection(!showPasswordSection)}
                                disabled={loading}
                            >
                                <Text style={styles.sectionTitle}>Alterar Senha</Text>
                                <Feather 
                                    name={showPasswordSection ? "chevron-up" : "chevron-down"} 
                                    size={20} 
                                    color="#9CA3AF" 
                                />
                            </TouchableOpacity>
                            
                            {!showPasswordSection && (
                                <Text style={styles.currentValue}>••••••••</Text>
                            )}
                            
                            {showPasswordSection && (
                                <View style={styles.sectionContent}>
                                    <Input
                                        label="Senha Atual"
                                        placeholder="Digite sua senha atual"
                                        value={currentPassword}
                                        onChangeText={(text) => {
                                            setCurrentPassword(text);
                                            if (currentPasswordError && text.trim()) {
                                                setCurrentPasswordError('');
                                            }
                                        }}
                                        secureTextEntry={true}
                                        error={currentPasswordError}
                                        editable={!loading}
                                    />
                                    
                                    <Input
                                        label="Nova Senha"
                                        placeholder="Digite sua nova senha"
                                        value={newPassword}
                                        onChangeText={(text) => {
                                            setNewPassword(text);
                                            if (newPasswordError && text.trim()) {
                                                setNewPasswordError('');
                                            }
                                        }}
                                        secureTextEntry={true}
                                        error={newPasswordError}
                                        editable={!loading}
                                    />
                                    
                                    <Input
                                        label="Confirmar Nova Senha"
                                        placeholder="Digite novamente a nova senha"
                                        value={confirmPassword}
                                        onChangeText={(text) => {
                                            setConfirmPassword(text);
                                            if (confirmPasswordError && text.trim()) {
                                                setConfirmPasswordError('');
                                            }
                                        }}
                                        secureTextEntry={true}
                                        error={confirmPasswordError}
                                        editable={!loading}
                                    />
                                    
                                    <Text style={styles.hintText}>
                                        A nova senha deve ter pelo menos 6 caracteres
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Biografia */}
                        <Input
                            label="Biografia (Opcional)"
                            placeholder="Conte um pouco sobre você e seus filmes favoritos..."
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            numberOfLines={3}
                            maxLength={150}
                            editable={!loading}
                        />
                        
                        <Text style={styles.charCount}>
                            {bio.length}/150 caracteres
                        </Text>
                    </View>

                    {/* Info Section */}
                    <View style={styles.infoSection}>
                        <View style={styles.infoItem}>
                            <Feather name="calendar" size={16} color="#9CA3AF" />
                            <Text style={styles.infoText}>
                                Membro desde {new Date().toLocaleDateString('pt-BR', { 
                                    month: 'long', 
                                    year: 'numeric' 
                                })}
                            </Text>
                        </View>
                    </View>

                    {/* Bottom spacing */}
                    <View style={styles.bottomSpacing} />
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#27272A',
        paddingTop: 40,
    },
    headerButton: {
        minWidth: 60,
    },
    headerButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
    },
    saveButtonText: {
        color: '#BD0DC0',
        fontWeight: '600',
        textAlign: 'right',
    },
    disabledText: {
        opacity: 0.5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#27272A',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#BD0DC0',
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#27272A',
        borderStyle: 'dashed',
        backgroundColor: '#27272A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#BD0DC0',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#18181B',
    },
    avatarHint: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    formSection: {
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    sectionContainer: {
        marginBottom: 24,
        backgroundColor: '#27272A',
        borderRadius: 12,
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    currentValue: {
        fontSize: 14,
        color: '#9CA3AF',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    sectionContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: '#3F3F46',
    },
    warningText: {
        fontSize: 12,
        color: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    hintText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 8,
    },
    charCount: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'right',
        marginTop: -8,
        marginBottom: 16,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    emailContainer: {
        backgroundColor: '#27272A',
        borderRadius: 8,
        padding: 16,
        borderWidth: 1,
        borderColor: '#3F3F46',
    },
    emailText: {
        fontSize: 16,
        color: '#D1D5DB',
        marginBottom: 4,
    },
    emailHint: {
        fontSize: 12,
        color: '#9CA3AF',
        lineHeight: 16,
    },
    infoSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#27272A',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#9CA3AF',
        marginLeft: 8,
    },
    bottomSpacing: {
        height: 40,
    },
});

export default EditProfileScreen;