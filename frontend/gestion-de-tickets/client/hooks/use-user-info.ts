import { useState, useEffect } from 'react';
import { api } from '@shared/api';

interface UserInfo {
  email: string;
  nombre: string;
  ubicacion: string;
  departamento: string;
  cargo: string;
}

export function useUserInfo() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Recargar token antes de hacer la petición
        api.reloadToken();
        
        const info = await api.getUsuarioInfo();
        setUserInfo(info);
      } catch (err) {
        console.error('Error fetching user info:', err);
        setError(err instanceof Error ? err.message : 'Error al obtener información del usuario');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  return { userInfo, isLoading, error };
}
