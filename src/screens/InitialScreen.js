import { StyleSheet, Text, View, SafeAreaView, StatusBar, Image, TouchableOpacity, Dimensions } from 'react-native';
import Button from '../components/Button';
import DiagonalMoviesImage from '../components/DiagonalMoviesImage';

const { width, height } = Dimensions.get('window');

const InitialScreen = ({ navigation }) => {
  // Função para lidar com o botão de entrar
    const handleLogin = () => {
        console.log('Login pressionado');
        navigation.navigate('Login');
    };

  // Função para lidar com o link de criar conta
    const handleCreateAccount = () => {
        console.log('Criar conta pressionado');
        navigation.navigate('Cadastro');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            <View style={styles.card}>

                {/* Componente de colagem de filmes */}
                <DiagonalMoviesImage />
                
                
                {/* Logo e texto */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoWrapper}>
                        <Image source={require('../../assets/cineCircle-logo-horizontalTexto.png')} style={styles.logo} />
                        {/* <Text style={styles.logoText}>CineCircle</Text> */}
                    </View>
                    <Text style={styles.tagline}>
                        Confira filmes e séries de{'\n'}seus amigos
                    </Text>
                </View>
                
                {/* Botões */}
                <View style={styles.buttonContainer}>
                    <Button 
                        title="ENTRAR" 
                        onPress={handleLogin} 
                    />
                
                    <View style={styles.createAccountContainer}>
                        <Text style={styles.createAccountText}>
                            ou{" "}
                            <Text 
                                style={styles.createAccountLink}
                                onPress={handleCreateAccount}
                            >
                                Criar Conta
                            </Text>
                        </Text>
                    </View>
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
        overflow: 'hidden',
        alignItems: 'center',
        padding: 20,
        paddingTop: 30,
        paddingBottom: 50,
        justifyContent: 'space-between',
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        //marginBottom: 40,
    },
    logoWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 220,
        height: 40,
        marginRight: 10,
        borderRadius: 8, // Logo com cantos arredondados como na imagem
    },
    logoText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    tagline: {
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 22,
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
    },
    createAccountContainer: {
        marginTop: 15,
        alignItems: 'center',
    },
    createAccountText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    createAccountLink: {
        color: '#C64FC8', // Cor roxa
        fontWeight: '500',
    },
});

export default InitialScreen;