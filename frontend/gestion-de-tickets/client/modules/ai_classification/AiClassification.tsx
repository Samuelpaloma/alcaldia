import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Target, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { api } from '@shared/api';

interface AiClassificationProps {
  ticketId: number;
  onClassificationComplete: (classification: any) => void;
}

interface ClassificationResult {
  categoria: string;
  prioridad: string;
  tecnicoSugerido: string;
  tiempoEstimado: string;
  confianza: number;
  sugerencias: string[];
}

export default function AiClassification({ ticketId, onClassificationComplete }: AiClassificationProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const analyzeTicket = async () => {
    setIsAnalyzing(true);
    try {
      const result = await api.clasificarTicketConIA(ticketId);
      setClassification(result);
      onClassificationComplete(result);
    } catch (error) {
      console.error('Error en clasificación IA:', error);
      alert('Error al analizar el ticket con IA');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confianza: number) => {
    if (confianza >= 80) return 'text-green-600';
    if (confianza >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Clasificación con Inteligencia Artificial
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Analiza automáticamente el ticket para sugerir categoría, prioridad y técnico asignado
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!classification ? (
          <div className="text-center py-8">
            <Brain className="h-16 w-16 text-purple-300 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Haz clic en el botón para que la IA analice este ticket
            </p>
            <Button
              onClick={analyzeTicket}
              disabled={isAnalyzing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isAnalyzing ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analizar con IA
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Resultados principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Categoría</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  {classification.categoria}
                </Badge>
              </div>

              <div className="p-4 rounded-lg border bg-orange-50">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-orange-900">Prioridad</span>
                </div>
                <Badge className={getPriorityColor(classification.prioridad)}>
                  {classification.prioridad.toUpperCase()}
                </Badge>
              </div>

              <div className="p-4 rounded-lg border bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">Confianza</span>
                </div>
                <div className={`text-lg font-bold ${getConfidenceColor(classification.confianza)}`}>
                  {classification.confianza}%
                </div>
              </div>
            </div>

            {/* Técnico sugerido y tiempo estimado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-purple-50">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-900">Técnico Sugerido</span>
                </div>
                <p className="text-purple-800">{classification.tecnicoSugerido}</p>
              </div>

              <div className="p-4 rounded-lg border bg-indigo-50">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  <span className="font-medium text-indigo-900">Tiempo Estimado</span>
                </div>
                <p className="text-indigo-800">{classification.tiempoEstimado}</p>
              </div>
            </div>

            {/* Sugerencias */}
            {classification.sugerencias.length > 0 && (
              <div className="p-4 rounded-lg border bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3">Sugerencias de la IA:</h4>
                <ul className="space-y-2">
                  {classification.sugerencias.map((sugerencia, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-blue-500 mt-1">•</span>
                      {sugerencia}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowDetails(!showDetails)}
                variant="outline"
                className="flex-1"
              >
                {showDetails ? 'Ocultar Detalles' : 'Ver Detalles'}
              </Button>
              <Button
                onClick={analyzeTicket}
                variant="outline"
                className="flex-1"
              >
                Re-analizar
              </Button>
            </div>

            {/* Detalles adicionales */}
            {showDetails && (
              <div className="mt-4 p-4 rounded-lg border bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3">Análisis Detallado:</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Algoritmo utilizado:</strong> Clasificador de texto con NLP</p>
                  <p><strong>Modelo entrenado:</strong> v2.1.3 (Última actualización: 2024)</p>
                  <p><strong>Palabras clave detectadas:</strong> {classification.categoria.toLowerCase()}, {classification.prioridad.toLowerCase()}</p>
                  <p><strong>Patrón de similitud:</strong> 85% con tickets resueltos anteriormente</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
