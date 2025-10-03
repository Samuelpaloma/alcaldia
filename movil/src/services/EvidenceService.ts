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

import { API_CONFIG } from '../config/api';

class EvidenceService {
  // Detectar la IP correcta para React Native
  private getBaseUrl(): string {
    return API_CONFIG.BASE_URL;
  }

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
      const baseUrl = this.getBaseUrl();
      console.log('🧪 Base URL:', baseUrl);
      console.log('🧪 Token:', await AsyncStorage.getItem('authToken') ? 'Presente' : 'Ausente');
      
      // Primero probar conectividad básica
      console.log('🧪 Probando conectividad básica...');
      try {
        const healthResponse = await fetch(`${baseUrl.replace('/api', '')}/actuator/health`);
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

      const simpleResponse = await fetch(`${baseUrl}/evidencias/test`, {
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

        const response = await fetch(`${baseUrl}/evidencias/test`, {
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
   * @param evidenceData Datos de la evidencia a subir
   * @param isFinalEvidence true = evidencia final (tabla evidencias), false = archivo de chat
   */
  async subirEvidencia(evidenceData: EvidenceRequest, isFinalEvidence: boolean = false): Promise<EvidenceResponse> {
    try {
      const tipoTexto = isFinalEvidence ? 'evidencia final' : 'archivo de chat';
      console.log(`📎 Subiendo ${tipoTexto} para ticket:`, evidenceData.ticketId);
      
      const token = await AsyncStorage.getItem('authToken');
      
      // Usar endpoint específico según el tipo de evidencia
      const baseUrl = this.getBaseUrl();
      const endpoint = isFinalEvidence 
        ? `${baseUrl}/evidencias/subir`        // Tabla evidencias - evidencias finales (FormData)
        : `${baseUrl}/archivos-ticket/subir`;  // Tabla archivos_ticket - archivos del chat (JSON + Base64)

      console.log('📎 Endpoint:', endpoint);

      let response: Response;

      if (isFinalEvidence) {
        // Evidencias finales: usar FormData
        const formData = new FormData();
        formData.append('ticketId', evidenceData.ticketId.toString());
        formData.append('descripcion', evidenceData.descripcion);
        
        // Para React Native, usar el formato correcto
        formData.append('archivo', {
          uri: evidenceData.archivo.uri,
          type: evidenceData.archivo.type,
          name: evidenceData.archivo.name,
        } as any);

        console.log('📎 Enviando FormData para evidencia final');
        console.log('📎 FormData ticketId:', evidenceData.ticketId);
        console.log('📎 FormData descripcion:', evidenceData.descripcion);
        console.log('📎 FormData archivo:', {
          uri: evidenceData.archivo.uri,
          type: evidenceData.archivo.type,
          name: evidenceData.archivo.name,
        });

        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            // No especificar Content-Type para FormData - el navegador lo establece automáticamente
          },
          body: formData,
        });
      } else {
        // Archivos del chat: usar JSON con Base64
        // Convertir archivo a Base64
        let contenidoBase64 = '';
        
        if (evidenceData.archivo.uri.startsWith('blob:')) {
          const blobResponse = await fetch(evidenceData.archivo.uri);
          const blob = await blobResponse.blob();
          contenidoBase64 = await this.blobToBase64(blob);
        } else {
          // Móvil nativo
          contenidoBase64 = evidenceData.archivo.uri;
        }

        // Extraer extensión del nombre del archivo
        const extension = evidenceData.archivo.name.split('.').pop() || '';
        
        const requestBody = {
          ticketId: evidenceData.ticketId,
          nombreArchivo: evidenceData.archivo.name,
          tipoMime: evidenceData.archivo.type,
          tamañoArchivo: evidenceData.archivo.size || 0,
          extension: extension,
          contenidoArchivo: contenidoBase64,
          comentario: evidenceData.descripcion
        };

        console.log('📎 Enviando JSON con Base64 para archivo del chat:', {
          ticketId: requestBody.ticketId,
          nombreArchivo: requestBody.nombreArchivo,
          tipoMime: requestBody.tipoMime,
          tamañoArchivo: requestBody.tamañoArchivo,
          extension: requestBody.extension,
          comentario: requestBody.comentario,
          contenidoBase64Length: contenidoBase64.length
        });

        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
      }

      console.log('📎 Response status:', response.status);
      console.log('📎 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ ${tipoTexto.charAt(0).toUpperCase() + tipoTexto.slice(1)} subida:`, data);
      return data;
    } catch (error) {
      console.error('❌ Error subiendo evidencia:', error);
      throw error;
    }
  }

  /**
   * Convertir Blob a Base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remover el prefijo "data:*/*;base64,"
        const base64 = base64String.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Obtener evidencias de un ticket
   */
  async obtenerEvidencias(ticketId: number): Promise<EvidenceResponse[]> {
    try {
      const headers = await this.getAuthHeaders();
      const baseUrl = this.getBaseUrl();
      const response = await fetch(`${baseUrl}/evidencias/movil/ticket/${ticketId}`, {
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
