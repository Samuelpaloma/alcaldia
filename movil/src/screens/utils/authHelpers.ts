import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../config/api';

export const checkAuthStatus = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const userInfoStr = await AsyncStorage.getItem('userInfo');

    if (!token) {
      return { isAuthenticated: false, userInfo: null };
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
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