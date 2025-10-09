import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Plus, 
  Users, 
  Clock, 
  Play,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  User,
  Tag,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  RefreshCw
} from "lucide-react";
import { useI18n } from "@/i18n";
import { api } from "@shared/api";

export default function TicketsManagement() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [technicianFilter, setTechnicianFilter] = useState("");

  // Tickets de prueba para demostración
  const demoTickets = [
    {
      id: 1,
      asunto: "Problema de conectividad de red",
      descripcion: "Los usuarios no pueden acceder a internet desde sus estaciones de trabajo",
      estado: "asignado",
      prioridad: "high",
      tecnico: "Juan Pérez",
      solicitante: "Rober Rodrigues",
      fechaCreacion: "2024-01-15",
      categoria: "Redes",
      tiempoEstimado: "2 horas"
    },
    {
      id: 2,
      asunto: "Error en base de datos",
      descripcion: "La aplicación no puede conectar con la base de datos principal",
      estado: "escalado",
      prioridad: "high",
      tecnico: "María García",
      solicitante: "Carlos López",
      fechaCreacion: "2024-01-14",
      categoria: "Sistemas",
      tiempoEstimado: "4 horas"
    },
    {
      id: 3,
      asunto: "Problema con impresoras",
      descripcion: "Las impresoras del piso 3 no están funcionando correctamente",
      estado: "pendiente",
      prioridad: "medium",
      tecnico: null,
      solicitante: "Ana Martínez",
      fechaCreacion: "2024-01-13",
      categoria: "Hardware",
      tiempoEstimado: "1 hora"
    },
    {
      id: 4,
      asunto: "Actualización de software",
      descripcion: "Necesitamos actualizar el software de contabilidad a la última versión",
      estado: "resuelto",
      prioridad: "low",
      tecnico: "Pedro Sánchez",
      solicitante: "Elena Vargas",
      fechaCreacion: "2024-01-12",
      categoria: "Software",
      tiempoEstimado: "3 horas"
    },
    {
      id: 5,
      asunto: "Configuración de email",
      descripcion: "Configurar cuentas de correo para nuevos empleados",
      estado: "asignado",
      prioridad: "medium",
      tecnico: "Laura Fernández",
      solicitante: "Miguel Torres",
      fechaCreacion: "2024-01-11",
      categoria: "Comunicaciones",
      tiempoEstimado: "1 hora"
    },
    {
      id: 6,
      asunto: "Mantenimiento de servidor",
      descripcion: "Realizar mantenimiento preventivo del servidor principal",
      estado: "escalado",
      prioridad: "high",
      tecnico: "Roberto Silva",
      solicitante: "Patricia Morales",
      fechaCreacion: "2024-01-10",
      categoria: "Infraestructura",
      tiempoEstimado: "6 horas"
    },
    {
      id: 7,
      asunto: "Instalación de antivirus",
      descripcion: "Instalar y configurar antivirus en todas las estaciones",
      estado: "pendiente",
      prioridad: "medium",
      tecnico: null,
      solicitante: "Diego Herrera",
      fechaCreacion: "2024-01-09",
      categoria: "Seguridad",
      tiempoEstimado: "2 horas"
    },
    {
      id: 8,
      asunto: "Backup de datos",
      descripcion: "Realizar backup completo de la base de datos",
      estado: "resuelto",
      prioridad: "high",
      tecnico: "Carmen Ruiz",
      solicitante: "Fernando Castro",
      fechaCreacion: "2024-01-08",
      categoria: "Respaldo",
      tiempoEstimado: "4 horas"
    }
  ];

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setTickets(demoTickets);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = ticket.asunto.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           ticket.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           ticket.solicitante.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !statusFilter || ticket.estado === statusFilter;
      const matchesPriority = !priorityFilter || ticket.prioridad === priorityFilter;
      const matchesTechnician = !technicianFilter || ticket.tecnico === technicianFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesTechnician;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter, technicianFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'asignado': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Users, label: t('tickets.status.ASIGNADO') },
      'en_proceso': { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Play, label: t('tickets.status.EN_PROCESO') },
      'EN_PROCESO': { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Play, label: t('tickets.status.EN_PROCESO') },
      'escalado': { color: 'bg-red-100 text-red-800 border-red-200', icon: ArrowUp, label: t('tickets.status.ESCALADO') },
      'pendiente': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: t('tickets.status.PENDIENTE') },
      'resuelto': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: t('tickets.status.resolved') },
      // estados finales adicionales que pueden venir en minúscula
      'cerrado': { color: 'bg-green-200 text-green-900 border-green-300', icon: CheckCircle, label: t('tickets.status.closed') },
      'terminado': { color: 'bg-green-200 text-green-900 border-green-300', icon: CheckCircle, label: t('tickets.status.TERMINADO') },
      // y en mayúscula por si llegan sin normalizar
      'CERRADO': { color: 'bg-green-200 text-green-900 border-green-300', icon: CheckCircle, label: t('tickets.status.closed') },
      'TERMINADO': { color: 'bg-green-200 text-green-900 border-green-300', icon: CheckCircle, label: t('tickets.status.TERMINADO') }
    };
    
    const config = statusConfig[status] || statusConfig['pendiente'];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} border font-semibold`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'high': { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle, label: t('tickets.priority.ALTA') },
      'medium': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: t('tickets.priority.MEDIA') },
      'low': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: t('tickets.priority.BAJA') }
    };
    
    const config = priorityConfig[priority] || priorityConfig['medium'];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} border font-semibold`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Redes': 'bg-blue-50 text-blue-700',
      'Sistemas': 'bg-purple-50 text-purple-700',
      'Hardware': 'bg-orange-50 text-orange-700',
      'Software': 'bg-green-50 text-green-700',
      'Comunicaciones': 'bg-cyan-50 text-cyan-700',
      'Infraestructura': 'bg-gray-50 text-gray-700',
      'Seguridad': 'bg-red-50 text-red-700',
      'Respaldo': 'bg-indigo-50 text-indigo-700'
    };
    return colors[category] || 'bg-gray-50 text-gray-700';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestión de Tickets</h1>
            <p className="text-blue-100 text-lg">Administra y supervisa todos los tickets del sistema</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="secondary" 
              size="lg" 
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={() => navigate('/client/crear')}
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Ticket
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-xl">
            <Filter className="w-5 h-5 mr-2 text-blue-600" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="asignado">Asignado</SelectItem>
                  <SelectItem value="escalado">Escalado</SelectItem>
                  <SelectItem value="resuelto">Resuelto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prioridad */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Prioridad</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las prioridades</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Técnico */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Técnico</label>
              <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los técnicos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los técnicos</SelectItem>
                  <SelectItem value="Juan Pérez">Juan Pérez</SelectItem>
                  <SelectItem value="María García">María García</SelectItem>
                  <SelectItem value="Pedro Sánchez">Pedro Sánchez</SelectItem>
                  <SelectItem value="Laura Fernández">Laura Fernández</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tickets.filter(t => t.estado === 'pendiente').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Asignados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tickets.filter(t => t.estado === 'asignado').length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resueltos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tickets.filter(t => t.estado === 'resuelto' || t.estado === 'cerrado' || t.estado === 'terminado' || t.estado === 'RESUELTO' || t.estado === 'CERRADO' || t.estado === 'TERMINADO').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Grid - CUADRADAS Y RESPONSIVAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 overflow-hidden">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-2">
                      {ticket.asunto}
                    </h3>
                    <p className="text-sm text-gray-500">#{ticket.id}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {getStatusBadge(ticket.estado)}
                {getPriorityBadge(ticket.prioridad)}
                <Badge className={`${getCategoryColor(ticket.categoria)} border font-medium`}>
                  <Tag className="w-3 h-3 mr-1" />
                  {ticket.categoria}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {ticket.descripcion}
              </p>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span><strong>Solicitante:</strong> {ticket.solicitante}</span>
                </div>
                {ticket.tecnico && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span><strong>Técnico:</strong> {ticket.tecnico}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span><strong>Fecha:</strong> {new Date(ticket.fechaCreacion).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span><strong>Tiempo:</strong> {ticket.tiempoEstimado}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </Button>
                {ticket.estado === 'pendiente' && (
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Asignar
                  </Button>
                )}
                {ticket.estado === 'asignado' && (
                  <Button size="sm" variant="outline" className="flex-1">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    Escalar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredTickets.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron tickets</h3>
            <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}