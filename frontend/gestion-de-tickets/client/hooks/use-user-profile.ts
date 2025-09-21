import { useState, useEffect } from 'react';
import { api } from '@shared/api';

interface UserProfile {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  ubicacion: string;
  departamento: string;
  cargo: string;
  tipoUsuario: string;
  activo: boolean;
  require2fa: boolean;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Recargar token antes de hacer la petición
      api.reloadToken();
      
      const profileData = await api.getMyProfile();
      setProfile(profileData);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err instanceof Error ? err.message : 'Error al obtener perfil del usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: {
    nombre: string;
    apellido: string;
    telefono?: string;
    ubicacion?: string;
    departamento?: string;
    cargo?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedProfile = await api.updateMyProfile(data);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('Error updating user profile:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar perfil del usuario');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { 
    profile, 
    isLoading, 
    error, 
    updateProfile, 
    refetch: fetchProfile 
  };
}
