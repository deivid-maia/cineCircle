import { StyleSheet, View, Image, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const DiagonalMoviesImage = () => {
    return (
        <View style={styles.moviesCollageContainer}>
            {/* Container da colagem com rotação */}
            <View style={styles.diagonalContainer}>
                {/* Faixas de filmes */}
                <View style={styles.moviesCollage}>
                <Image source={require('../../assets/filme2.jpg')} style={styles.movieStrip} />
                <Image source={require('../../assets/filme3.jpg')} style={styles.movieStrip} />
                <Image source={require('../../assets/filme4.jpg')} style={styles.movieStrip} />
                <Image source={require('../../assets/filme2.jpg')} style={styles.movieStrip} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    moviesCollageContainer: {
        width: '100%',
        height: height * 0.3, // 30% da altura da tela
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginTop: 10,
        marginBottom: 30,
    },
    diagonalContainer: {
        width: width * 1.2, // Um pouco mais largo que o card
        height: height * 0.45, // Maior que o container para dar espaço após rotação
        transform: [{ rotate: '-10deg' }], // Rotação para criar o efeito diagonal
        overflow: 'hidden',
    },
    moviesCollage: {
        width: '100%',
        height: '100%',
        justifyContent: 'space-between',
        paddingHorizontal: 20, // Espaço nas laterais para compensar a rotação
    },
    movieStrip: {
        width: '100%',
        height: '20%', // Altura para acomodar 4 strips com espaçamento
        borderRadius: 8,
        marginVertical: 5,
        resizeMode: 'cover',
    },
});

export default DiagonalMoviesImage;