import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { checkServerConnectivity, getNetworkConfig, logNetworkInfo } from '../utils/networkUtils';

interface NetworkDiagnosticProps {
  onClose?: () => void;
}

export default function NetworkDiagnostic({ onClose }: NetworkDiagnosticProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [networkInfo, setNetworkInfo] = useState<any>(null);

  useEffect(() => {
    loadNetworkInfo();
  }, []);

  const loadNetworkInfo = () => {
    const config = getNetworkConfig();
    setNetworkInfo(config);
    logNetworkInfo();
  };

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const connected = await checkServerConnectivity();
      setIsConnected(connected);
      
      if (!connected) {
        Alert.alert(
          'Problema de Conectividad',
          'No se puede conectar al servidor. Verifica:\n\n' +
          '1. Que el servidor backend esté funcionando\n' +
          '2. Que estés en la misma red WiFi\n' +
          '3. Que la IP del servidor sea correcta\n' +
          `\nIP actual: ${networkInfo?.baseUrl}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusColor = () => {
    if (isConnected === null) return '#666';
    return isConnected ? '#4CAF50' : '#F44336';
  };

  const getStatusText = () => {
    if (isConnected === null) return 'Sin verificar';
    return isConnected ? 'Conectado' : 'Desconectado';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diagnóstico de Red</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Plataforma:</Text>
        <Text style={styles.value}>{networkInfo?.isEmulator ? 'Emulador' : 'Dispositivo Físico'}</Text>
        
        <Text style={styles.label}>URL Base:</Text>
        <Text style={styles.value}>{networkInfo?.baseUrl}</Text>
        
        <Text style={styles.label}>WebSocket:</Text>
        <Text style={styles.value}>{networkInfo?.wsUrl}</Text>
        
        <Text style={styles.label}>Timeout:</Text>
        <Text style={styles.value}>{networkInfo?.timeout}ms</Text>
      </View>

      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>Estado: {getStatusText()}</Text>
      </View>

      <TouchableOpacity 
        style={[styles.button, isChecking && styles.buttonDisabled]} 
        onPress={checkConnection}
        disabled={isChecking}
      >
        <Text style={styles.buttonText}>
          {isChecking ? 'Verificando...' : 'Verificar Conexión'}
        </Text>
      </TouchableOpacity>

      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Cerrar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  value: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#666',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 12,
  },
});
