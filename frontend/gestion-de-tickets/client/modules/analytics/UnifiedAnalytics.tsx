import React, { useState, useEffect } from 'react';
import './UnifiedAnalytics.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  FileText,
  Star,
  Users,
  Clock
} from 'lucide-react';

const UnifiedAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [loading, setLoading] = useState(false);

  return (
    <div className="unified-analytics">
      <div className="analytics-header">
        <div className="header-content">
          <h1 className="analytics-title">Análisis y Reportes</h1>
          <p className="analytics-subtitle">Análisis completo, reportes y tendencias del sistema</p>
        </div>
        <div className="header-actions">
          <Button onClick={() => {}} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={() => {}}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reports">Reportes</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfacción</TabsTrigger>
          <TabsTrigger value="evidences">Evidencias</TabsTrigger>
        </TabsList>

        {/* Pestaña Reportes */}
        <TabsContent value="reports" className="space-y-6">
          <div className="stats-grid">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Reportes</p>
                    <p className="text-2xl font-bold text-gray-900">24</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Download className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Descargas</p>
                    <p className="text-2xl font-bold text-gray-900">1,247</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tipos</p>
                    <p className="text-2xl font-bold text-gray-900">4</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="content-grid">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Reportes Recientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Reporte Mensual - Enero 2024</p>
                        <p className="text-sm text-gray-500">2.3 MB • Hace 1 día</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Descargar
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">Reporte de Satisfacción Q1</p>
                        <p className="text-sm text-gray-500">1.8 MB • Hace 2 días</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Descargar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Generar Nuevo Reporte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Reporte Mensual
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Star className="w-4 h-4 mr-2" />
                    Reporte de Satisfacción
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Reporte de Rendimiento
                  </Button>
                  <Button className="w-full" variant="outline">
                    <PieChart className="w-4 h-4 mr-2" />
                    Reporte por Categorías
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña Tendencias */}
        <TabsContent value="trends" className="space-y-6">
          <div className="metrics-grid">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tendencia General</p>
                    <p className="text-2xl font-bold text-green-600">+12%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                    <p className="text-2xl font-bold text-gray-900">4.2h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Eficiencia</p>
                    <p className="text-2xl font-bold text-gray-900">87%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Evolución Mensual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { mes: 'Ene', cantidad: 98, tendencia: '+5%' },
                    { mes: 'Feb', cantidad: 112, tendencia: '+14%' },
                    { mes: 'Mar', cantidad: 134, tendencia: '+20%' },
                    { mes: 'Abr', cantidad: 156, tendencia: '+16%' },
                    { mes: 'May', cantidad: 189, tendencia: '+21%' },
                    { mes: 'Jun', cantidad: 203, tendencia: '+7%' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium">{item.mes}</span>
                        <span className="text-sm text-gray-600">{item.cantidad} tickets</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-green-600">{item.tendencia}</span>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Distribución por Categoría
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { categoria: 'Redes', cantidad: 234, porcentaje: 35 },
                    { categoria: 'Sistemas', cantidad: 189, porcentaje: 28 },
                    { categoria: 'Hardware', cantidad: 156, porcentaje: 23 },
                    { categoria: 'Software', cantidad: 89, porcentaje: 14 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">{item.categoria}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{item.cantidad}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${item.porcentaje}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña Satisfacción */}
        <TabsContent value="satisfaction" className="space-y-6">
          <div className="stats-grid">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Satisfacción Promedio</p>
                    <p className="text-2xl font-bold text-gray-900">4.6/5</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Respuestas</p>
                    <p className="text-2xl font-bold text-gray-900">892</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Mejora</p>
                    <p className="text-2xl font-bold text-green-600">+8%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Distribución de Calificaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { estrellas: 5, cantidad: 456, porcentaje: 51 },
                    { estrellas: 4, cantidad: 234, porcentaje: 26 },
                    { estrellas: 3, cantidad: 123, porcentaje: 14 },
                    { estrellas: 2, cantidad: 56, porcentaje: 6 },
                    { estrellas: 1, cantidad: 23, porcentaje: 3 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= item.estrellas ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{item.estrellas} estrella{item.estrellas !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{item.cantidad}</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${item.porcentaje}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Comentarios Recientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">Hace 2 horas</span>
                    </div>
                    <p className="text-sm">"Excelente atención, problema resuelto rápidamente"</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4].map((star) => (
                          <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                        <Star className="w-4 h-4 text-gray-300" />
                      </div>
                      <span className="text-sm text-gray-500">Hace 4 horas</span>
                    </div>
                    <p className="text-sm">"Buen servicio, pero tardó un poco más de lo esperado"</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña Evidencias */}
        <TabsContent value="evidences" className="space-y-6">
          <div className="stats-grid">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Evidencias</p>
                    <p className="text-2xl font-bold text-gray-900">1,247</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Download className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Descargas</p>
                    <p className="text-2xl font-bold text-gray-900">3,456</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tipos</p>
                    <p className="text-2xl font-bold text-gray-900">6</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="content-grid">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Evidencias Recientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Screenshot_error_red.png</p>
                        <p className="text-sm text-gray-500">Ticket #1234 • Hace 2 horas</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">Log_sistema_2024.pdf</p>
                        <p className="text-sm text-gray-500">Ticket #1235 • Hace 4 horas</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="font-medium">Video_demostracion.mp4</p>
                        <p className="text-sm text-gray-500">Ticket #1236 • Hace 6 horas</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Tipos de Evidencias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { tipo: 'Imágenes', cantidad: 456, porcentaje: 37 },
                    { tipo: 'Documentos', cantidad: 234, porcentaje: 19 },
                    { tipo: 'Videos', cantidad: 189, porcentaje: 15 },
                    { tipo: 'Logs', cantidad: 156, porcentaje: 13 },
                    { tipo: 'Otros', cantidad: 212, porcentaje: 17 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">{item.tipo}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{item.cantidad}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${item.porcentaje}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Evidencias por Ticket
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { ticket: '#1234', evidencias: 5, estado: 'Resuelto' },
                    { ticket: '#1235', evidencias: 3, estado: 'En Progreso' },
                    { ticket: '#1236', evidencias: 7, estado: 'Resuelto' },
                    { ticket: '#1237', evidencias: 2, estado: 'Abierto' },
                    { ticket: '#1238', evidencias: 4, estado: 'En Progreso' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">{item.ticket}</span>
                        </div>
                        <div>
                          <p className="font-medium">{item.ticket}</p>
                          <p className="text-xs text-gray-500">{item.evidencias} evidencias</p>
                        </div>
                      </div>
                      <Badge className={
                        item.estado === 'Resuelto' ? 'bg-green-100 text-green-800' :
                        item.estado === 'En Progreso' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {item.estado}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nueva evidencia subida</p>
                      <p className="text-xs text-gray-500">Ticket #1234 • Hace 1 hora</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Evidencia descargada</p>
                      <p className="text-xs text-gray-500">Log_sistema.pdf • Hace 3 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Evidencia eliminada</p>
                      <p className="text-xs text-gray-500">Archivo_duplicado.jpg • Hace 5 horas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedAnalytics;