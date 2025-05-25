import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    useWindowDimensions,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Button = ({
    title,
    onPress,
    disabled = false,
    loading = false,
}) => {
    const [pressed, setPressed] = useState(false);
    const { width: screenWidth } = useWindowDimensions();

    // Definindo largura como 70% da tela e altura relativa
    const buttonWidth = screenWidth * 0.7;
    const buttonHeight = buttonWidth * 0.20; // 20% da largura para manter proporção

    // O botão está desabilitado se disabled=true OU loading=true
    const isDisabled = disabled || loading;

    return (
        <View style={styles.wrap}>
            {/* Glow externo - aparece quando pressionado e não está desabilitado */}
            {pressed && !isDisabled && (
                <LinearGradient
                    colors={['#19A1BE', '#7D4192']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        styles.outerGlow,
                        {
                            width: buttonWidth * 1.1,
                            height: buttonHeight * 1.1,
                            borderRadius: (buttonHeight * 1.1) / 2,
                        },
                    ]}
                />
            )}

            {/* Glow externo suave - sempre visível, exceto quando desabilitado */}
            {!isDisabled && (
                <LinearGradient
                    colors={['rgba(25,161,190,0.15)', 'rgba(125,65,146,0.15)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        styles.constantGlow,
                        {
                            width: buttonWidth * 1.05,
                            height: buttonHeight * 1.05,
                            borderRadius: (buttonHeight * 1.05) / 2,
                        },
                    ]}
                />
            )}

            <View
                style={[
                    styles.container,
                    {
                        width: buttonWidth,
                        height: buttonHeight,
                        borderRadius: buttonHeight / 2,
                    },
                    pressed && !isDisabled && styles.containerPressed,
                ]}
            >
                <LinearGradient
                    colors={
                        isDisabled 
                            ? ['#1D2B3A', '#1D2B3A'] 
                            : ['#19A1BE', '#7D4192']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        styles.gradientBorder,
                        {
                            borderRadius: buttonHeight / 2,
                            padding: buttonHeight * 0.03, // 3% da altura como border
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.innerButton,
                            {
                                borderRadius: buttonHeight / 2 - buttonHeight * 0.03,
                            },
                        ]}
                    >
                        {/* Gradiente interno - mais luminoso quando pressionado, sutilmente visível sempre */}
                        <LinearGradient
                            colors={
                                pressed && !isDisabled
                                    ? ['rgba(25,161,190,0.4)', 'rgba(125,65,146,0.4)'] // Mais brilhante quando pressionado
                                    : isDisabled
                                    ? ['rgba(29,43,58,0.3)', 'rgba(29,43,58,0.3)'] // Escuro quando desabilitado
                                    : ['rgba(25,161,190,0.15)', 'rgba(125,65,146,0.15)'] // Sutil quando não pressionado
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[
                                StyleSheet.absoluteFill,
                                {
                                    borderRadius: buttonHeight / 2 - buttonHeight * 0.03,
                                },
                            ]}
                        />

                        {/* Efeito de iluminação interna superior - simula luz 3D */}
                        {!isDisabled && (
                            <LinearGradient
                                colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 0.5 }}
                                style={[
                                    styles.innerShine,
                                    {
                                        borderTopLeftRadius: buttonHeight / 2 - buttonHeight * 0.03,
                                        borderTopRightRadius: buttonHeight / 2 - buttonHeight * 0.03,
                                    }
                                ]}
                            />
                        )}

                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={onPress}
                            disabled={isDisabled}
                            onPressIn={() => !isDisabled && setPressed(true)}
                            onPressOut={() => setPressed(false)}
                            style={styles.touchable}
                        >
                            {loading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator 
                                        size="small" 
                                        color="#FFFFFF" 
                                        style={styles.loadingIndicator}
                                    />
                                    <Text style={[styles.buttonText, styles.loadingText]}>
                                        CARREGANDO...
                                    </Text>
                                </View>
                            ) : (
                                <Text style={[
                                    styles.buttonText,
                                    isDisabled && styles.disabledText
                                ]}>
                                    {typeof title === 'string' ? title.toUpperCase() : title}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrap: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 12,
        position: 'relative',
    },
    outerGlow: {
        position: 'absolute',
        opacity: 0.35,
        ...Platform.select({
            ios: {
                shadowColor: '#19A1BE',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 15,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    constantGlow: {
        position: 'absolute',
        opacity: 0.2,
        ...Platform.select({
            ios: {
                shadowColor: '#19A1BE',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    container: {
        ...Platform.select({
            ios: {
                shadowColor: '#19A1BE',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    containerPressed: {
        ...Platform.select({
            ios: {
                shadowOpacity: 0.6,
                shadowRadius: 15,
            },
            android: {
                elevation: 12,
            },
        }),
    },
    gradientBorder: {
        flex: 1,
    },
    innerButton: {
        flex: 1,
        backgroundColor: '#18181B',
        overflow: 'hidden',
        position: 'relative',
    },
    innerShine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%', // Afeta metade superior do botão
        opacity: 0.6,
    },
    touchable: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        // Sombra do texto para destacar mais
        ...Platform.select({
            ios: {
                textShadowColor: 'rgba(0, 0, 0, 0.2)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
            },
            android: {
                // Android não suporta textShadow, mas podemos usar elevação 
                // ou se preferir manter consistência, remova essa parte
                elevation: 1,
            },
        }),
    },
    disabledText: {
        color: '#9CA3AF',
        opacity: 0.6,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingIndicator: {
        marginRight: 8,
    },
    loadingText: {
        fontSize: 16, // Ligeiramente menor para acomodar o indicator
    },
});

export default Button;