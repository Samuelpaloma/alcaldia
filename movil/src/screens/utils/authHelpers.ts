import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../config/api';

export const checkAuthStatus = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const userInfoStr = await AsyncStorage.getItem('userInfo');

    if (!token) {
      return { isAuthenticated: false, userInfo: null };
    }

    const isValid = await authAPI.verifyToken();

    if (isValid) {
      return { 
        isAuthenticated: true, 
        userInfo: userInfoStr ? JSON.parse(userInfoStr) : null 
      };
    } else {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userInfo');
      return { isAuthenticated: false, userInfo: null };
    }
  } catch (error) {
    console.error('Error verificando sesión:', error);
    return { isAuthenticated: false, userInfo: null };
  }
};