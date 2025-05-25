import { Alert } from 'react-native';
import { useAuth } from './AuthContext';

export const useLogout = () => {
  const { logout, loading } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await logout();
              if (result.success) {
                console.log('Logout realizado com sucesso');
                // A navegação será gerenciada automaticamente pelo AuthContext
                // Não precisamos fazer reset manual
              } else {
                Alert.alert(
                  'Erro',
                  result.error || 'Erro ao fazer logout',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              console.error('Erro no logout:', error);
              Alert.alert(
                'Erro',
                'Ocorreu um erro inesperado ao fazer logout',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  return {
    handleLogout,
    loading,
  };
};