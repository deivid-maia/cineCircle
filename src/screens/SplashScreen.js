// import React, { useEffect, useRef } from 'react';
// import { 
//   StyleSheet, 
//   Text, 
//   View, 
//   Image, 
//   Animated, 
//   Easing, 
//   Dimensions,
//   StatusBar
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';

// const { width, height } = Dimensions.get('window');

// export default function SplashScreen({ navigation }) {
//   // Animações
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const scaleAnim = useRef(new Animated.Value(0.9)).current;
//   const translateYAnim = useRef(new Animated.Value(20)).current;

//   // Carrega a tela principal após um tempo
//   useEffect(() => {
//     // Iniciar animações
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 1000,
//         useNativeDriver: true,
//         easing: Easing.out(Easing.ease),
//       }),
//       Animated.timing(scaleAnim, {
//         toValue: 1,
//         duration: 1000,
//         useNativeDriver: true,
//         easing: Easing.out(Easing.ease),
//       }),
//       Animated.timing(translateYAnim, {
//         toValue: 0,
//         duration: 1000,
//         useNativeDriver: true,
//         easing: Easing.out(Easing.ease),
//       }),
//     ]).start();

//     // Timer para navegar para a próxima tela
//     const timer = setTimeout(() => {
//       // Animação de saída antes de navegar
//       Animated.parallel([
//         Animated.timing(fadeAnim, {
//           toValue: 0,
//           duration: 500,
//           useNativeDriver: true,
//           easing: Easing.in(Easing.ease),
//         }),
//         Animated.timing(scaleAnim, {
//           toValue: 1.1,
//           duration: 500,
//           useNativeDriver: true,
//           easing: Easing.in(Easing.ease),
//         }),
//       ]).start(() => {
//         // Navegar para a tela Inicial após a animação de saída
//         navigation.replace('Inicial');
//       });
//     }, 3000); // 3 segundos

//     return () => clearTimeout(timer);
//   }, [navigation, fadeAnim, scaleAnim, translateYAnim]);

//   return (
//     <View style={styles.container}>
//       <StatusBar backgroundColor="#18181B" barStyle="light-content" />
      
//       {/* Círculos decorativos em gradiente */}
//       <View style={styles.backgroundCircle1} />
//       <View style={styles.backgroundCircle2} />
      
//       {/* Container principal */}
//       <Animated.View 
//         style={[
//           styles.contentContainer,
//           {
//             opacity: fadeAnim,
//             transform: [
//               { scale: scaleAnim },
//               { translateY: translateYAnim }
//             ]
//           }
//         ]}
//       >
//         {/* Logo Container */}
//         <View style={styles.logoContainer}>
//           {/* Usando a imagem de logo fornecida */}
//           <View style={styles.logoWrapper}>
//             <Image 
//               source={require('../../assets/logo.jpeg')} 
//               style={styles.logo}
//               resizeMode="contain"
//             />
//           </View>
//         </View>
        
//         {/* Texto do App */}
//         <Text style={styles.title}>CineCircle</Text>
//         {/* <Text style={styles.subtitle}>Compartilhe suas experiências cinematográficas</Text> */}
        
//         {/* Versão do App */}
//         {/* <Text style={styles.version}>v1.0.0</Text> */}
//       </Animated.View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000000',
//     alignItems: 'center',
//     justifyContent: 'center',
//     position: 'relative',
//     overflow: 'hidden',
//   },
//   backgroundCircle1: {
//     position: 'absolute',
//     width: width * 1.5,
//     height: width * 1.5,
//     borderRadius: width * 0.75,
//     backgroundColor: 'rgba(189, 13, 192, 0.03)',
//     top: -width * 0.5,
//     left: -width * 0.25,
//   },
//   backgroundCircle2: {
//     position: 'absolute',
//     width: width * 1.2,
//     height: width * 1.2,
//     borderRadius: width * 0.6,
//     backgroundColor: 'rgba(189, 13, 192, 0.02)',
//     bottom: -width * 0.4,
//     right: -width * 0.2,
//   },
//   contentContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: '80%',
//   },
//   logoContainer: {
//     marginBottom: 40,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   logoWrapper: {
//     width: 150,
//     height: 150,
//     borderRadius: 75,
//     overflow: 'hidden',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#000',
//     shadowColor: '#BD0DC0',
//     shadowOffset: {
//       width: 0,
//       height: 8,
//     },
//     shadowOpacity: 0.44,
//     shadowRadius: 10.32,
//     elevation: 16,
//   },
//   logo: {
//     width: 150,
//     height: 150,
//   },
//   title: {
//     fontSize: 36,
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//     marginBottom: 12,
//     letterSpacing: 1,
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: 16,
//     color: 'rgba(255, 255, 255, 0.7)',
//     textAlign: 'center',
//     maxWidth: '80%',
//     lineHeight: 22,
//   },
//   version: {
//     position: 'absolute',
//     bottom: -120,
//     color: 'rgba(255, 255, 255, 0.5)',
//     fontSize: 12,
//   }
// });