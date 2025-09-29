import AsyncStorage from '@react-native-async-storage/async-storage';

export interface EvidenceRequest {
  ticketId: number;
  descripcion: string;
  tipoEvidencia: string;
  archivo: {
    uri: string;
    type: string;
    name: string;
  };
}

export interface EvidenceResponse {
  idEvidencia: number;
  ticketId: number;
  tipoEvidencia: string;
  descripcion: string;
  nombreArchivo: string;
  extensionArchivo: string;
  tamanioArchivo: number;
  urlArchivo: string;
  fechaSubida: string;
  subidoPor: string;
  subidoPorEmail: string;
}

class EvidenceService {
  private baseUrl = 'http://localhost:8080/api';

  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    };
  }

  /**
   * Probar endpoint de evidencias
   */
  async testEndpoint(evidenceData: EvidenceRequest): Promise<any> {
    try {
      console.log('🧪 Probando endpoint de evidencias...');
      console.log('🧪 Base URL:', this.baseUrl);
      console.log('🧪 Token:', await AsyncStorage.getItem('authToken') ? 'Presente' : 'Ausente');
      
      // Primero probar conectividad básica
      console.log('🧪 Probando conectividad básica...');
      try {
        const healthResponse = await fetch(`${this.baseUrl.replace('/api', '')}/actuator/health`);
        console.log('🧪 Health check status:', healthResponse.status);
      } catch (healthError) {
        console.log('🧪 Health check falló:', healthError.message);
      }
      
      const token = await AsyncStorage.getItem('authToken');
      
      // Primero probar sin archivo
      console.log('🧪 Probando sin archivo...');
      const simpleFormData = new FormData();
      simpleFormData.append('ticketId', evidenceData.ticketId.toString());
      simpleFormData.append('descripcion', evidenceData.descripcion);

      const simpleResponse = await fetch(`${this.baseUrl}/evidencias/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: simpleFormData,
      });

      console.log('🧪 Simple test status:', simpleResponse.status);
      const simpleData = await simpleResponse.json();
      console.log('🧪 Simple test response:', simpleData);

      // Si el simple test funciona, probar con archivo
      if (simpleResponse.ok) {
        console.log('🧪 Probando con archivo...');
        const formData = new FormData();
        formData.append('ticketId', evidenceData.ticketId.toString());
        formData.append('descripcion', evidenceData.descripcion);
        
        // Para web, necesitamos convertir el blob URL a File
        if (evidenceData.archivo.uri.startsWith('blob:')) {
          const response = await fetch(evidenceData.archivo.uri);
          const blob = await response.blob();
          const file = new File([blob], evidenceData.archivo.name, { type: evidenceData.archivo.type });
          formData.append('archivo', file);
        } else {
          formData.append('archivo', {
            uri: evidenceData.archivo.uri,
            type: evidenceData.archivo.type,
            name: evidenceData.archivo.name,
          } as any);
        }

        const response = await fetch(`${this.baseUrl}/evidencias/test`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        console.log('🧪 File test status:', response.status);
        const data = await response.json();
        console.log('🧪 File test response:', data);
        return data;
      }

      return simpleData;
    } catch (error) {
      console.error('❌ Error en test:', error);
      throw error;
    }
  }

  /**
   * Subir evidencia para un ticket usando el endpoint correcto
   */
  async subirEvidencia(evidenceData: EvidenceRequest): Promise<EvidenceResponse> {
    try {
      console.log('📎 Subiendo evidencia para ticket:', evidenceData.ticketId);
      
      const token = await AsyncStorage.getItem('authToken');
      
      const formData = new FormData();
      formData.append('ticketId', evidenceData.ticketId.toString());
      formData.append('descripcion', evidenceData.descripcion);
      
      // Para web, necesitamos convertir el blob URL a File
      if (evidenceData.archivo.uri.startsWith('blob:')) {
        // Es un blob URL, necesitamos convertirlo a File
        const response = await fetch(evidenceData.archivo.uri);
        const blob = await response.blob();
        const file = new File([blob], evidenceData.archivo.name, { type: evidenceData.archivo.type });
        formData.append('archivo', file);
      } else {
        // Es un URI normal (móvil)
        formData.append('archivo', {
          uri: evidenceData.archivo.uri,
          type: evidenceData.archivo.type,
          name: evidenceData.archivo.name,
        } as any);
      }

      console.log('📎 Enviando FormData:', {
        ticketId: evidenceData.ticketId,
        descripcion: evidenceData.descripcion,
        archivo: {
          name: evidenceData.archivo.name,
          type: evidenceData.archivo.type,
          size: evidenceData.archivo.size
        }
      });

      const response = await fetch(`${this.baseUrl}/evidencias/subir`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // NO incluir Content-Type para FormData - el navegador lo establece automáticamente
        },
        body: formData,
      });

      console.log('📎 Response status:', response.status);
      console.log('📎 Response ok:', response.ok);
      console.log('📎 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Evidencia subida:', data);
      return data;
    } catch (error) {
      console.error('❌ Error subiendo evidencia:', error);
      throw error;
    }
  }

  /**
   * Obtener evidencias de un ticket
   */
  async obtenerEvidencias(ticketId: number): Promise<EvidenceResponse[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/evidencias/movil/ticket/${ticketId}`, {
        method: 'GET',
        headers: {
          'Authorization': headers.Authorization,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || data; // El endpoint móvil devuelve {success, data, message}
    } catch (error) {
      console.error('Error obteniendo evidencias:', error);
      throw error;
    }
  }
}

export default new EvidenceService();
