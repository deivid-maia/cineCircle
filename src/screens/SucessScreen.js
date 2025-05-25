import React, { useEffect } from 'react';
    import { 
    StyleSheet, 
    View, 
    Text, 
    SafeAreaView, 
    StatusBar, 
    Image, 
    Dimensions
} from 'react-native';
import Button from '../components/Button';

const { width, height } = Dimensions.get('window');

const SuccessScreen = ({ navigation, route }) => {
    // Opcionalmente receber mensagens personalizadas
    const { message, subtitle } = route.params || {};
    
    const handleContinue = () => {
        // Navegar para a tela principal do app após o registro bem-sucedido
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }], 
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            <View style={styles.card}>
                {/* Logo ou ícone de sucesso */}
                <View style={styles.logoContainer}>
                    <Image 
                        source={require('../../assets/logo.jpeg')} 
                        style={styles.logo}
                    />
                    <View style={styles.checkmarkContainer}>
                        <Text style={styles.checkmark}>✓</Text>
                    </View>
                </View>
                
                {/* Mensagem de sucesso */}
                <View style={styles.messageContainer}>
                    <Text style={styles.title}>
                        {message || "Sua conta foi criada com sucesso!"}
                    </Text>
                    <Text style={styles.subtitle}>
                        {subtitle || "Sua jornada cinematográfica começa aqui!"}
                    </Text>
                </View>
                
                {/* Botão para continuar */}
                <View style={styles.buttonContainer}>
                    <Button 
                        title="ENTRAR" 
                        onPress={handleContinue} 
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000', // Fundo preto
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        width: width * 0.9,
        height: height * 0.85,
        backgroundColor: '#18181B', // Cor de fundo escura
        borderRadius: 30, // Cantos arredondados
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginBottom: 60,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 25,
    },
    checkmarkContainer: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        backgroundColor: '#7D4192', // Cor roxa
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    messageContainer: {
        alignItems: 'center',
        marginBottom: 80,
        paddingHorizontal: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
        opacity: 0.8,
    },
    buttonContainer: {
        width: '100%',
    },
});

export default SuccessScreen;
