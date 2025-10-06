import React from 'react';
import { useSystemColors } from '../hooks/useSystemColors';

const SystemColorLoader: React.FC = () => {
  const { colors } = useSystemColors();

  // Este componente no renderiza nada, solo carga y aplica colores
  return null;
};

export default SystemColorLoader;
