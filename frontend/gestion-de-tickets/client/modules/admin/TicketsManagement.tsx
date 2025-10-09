import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

// Extender Window para WebSocket
declare global {
  interface Window {
    ticketWebSocket?: WebSocket;
  }
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
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
  RefreshCw,
  UserPlus,
  FileText,
  Image,
  Download,
  X
} from "lucide-react";
import { useI18n } from "@/i18n";
import { api } from "@shared/api";
import './UsersModule.css';

interface HistorialAsignacion {
  idAsignacion: number;
  ticketId: number;
  ticketTitulo: string;
  tecnicoId: number;
  tecnicoNombre: string;
  tecnicoEmail: string;
  estadoAnterior: string;
  estadoNuevo: string;
  prioridad: string;
  comentario: string;
  fechaAsignacion: string;
  asignadoPor: string;
  tipoOperacion: string;
}

interface TicketTracking {
  id: number;
  asunto: string;
  descripcion: string;
  categoria: string;
  estado: string;
  prioridad: string;
  tecnicoAsignado?: string;
  tecnicoEmail?: string;
  tecnicoNombre?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  historialAsignaciones?: HistorialAsignacion[];
  comentarios?: Array<{
    id: number;
    autor: string;
    mensaje: string;
    fechaCreacion: string;
  }>;
}

interface HistorialItem {
  id: number;
  accion: string;
  descripcion: string;
  fecha: string;
  usuario: string;
}

export default function TicketsManagement() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [technicianFilter, setTechnicianFilter] = useState("");
  
  // Estados para paginación con URL
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1');
  const [itemsPerPage] = useState(8); // 8 tickets por página
  
  // Función para actualizar la página en la URL
  const setCurrentPage = (page: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', page.toString());
    setSearchParams(newSearchParams);
  };
  
  // Estados para modales y funcionalidades
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showAssignSuccess, setShowAssignSuccess] = useState(false);
  const [showEscalateSuccess, setShowEscalateSuccess] = useState(false);
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [selectedTecnico, setSelectedTecnico] = useState("");
  
  // Estados para el chat e historial
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [trackingData, setTrackingData] = useState<TicketTracking | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Estados para el chat del admin (solo visualización)
  const [activeTab, setActiveTab] = useState<'info' | 'historial' | 'chat' | 'evidencias'>('info');
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Helper para mostrar nombres evitando "undefined undefined"
  const containsInvalidToken = (v?: string) => /(^|\s)(undefined|null)(\s|$)/i.test(String(v || ''));
  const clean = (value?: string) => {
    if (!value) return '';
    const v = String(value).trim();
    if (containsInvalidToken(v)) return '';
    return v;
  };
  const buildTechnicianName = (tecnico: any) => {
    const first = clean(tecnico?.nombre);
    const last = clean(tecnico?.apellido);
    const full = [first, last].filter(Boolean).join(' ').trim();
    return containsInvalidToken(full) ? '' : full;
  };
  const [currentTicketId, setCurrentTicketId] = useState<number | null>(null);
  
  // Referencia para auto-scroll del chat
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Estados para evidencias
  const [evidencias, setEvidencias] = useState<any[]>([]);
  const [evidenciasChat, setEvidenciasChat] = useState<any[]>([]);
  const [evidenciasFinales, setEvidenciasFinales] = useState<any[]>([]);
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<'chat' | 'finales'>('chat');
  const [isLoadingEvidencias, setIsLoadingEvidencias] = useState(false);
  
  // Estados para previsualización
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [archivoPreview, setArchivoPreview] = useState<any | null>(null);

  // Tickets de prueba para demostración
  const demoTickets = [
    { id: 1, asunto: 'Redes y Comunicaciones', descripcion: 'Problema de conectividad', estado: 'ASIGNADO', prioridad: 'MEDIUM', tecnicoEmail: 'w@s.com', solicitante: 'Rober Rodrigues', fechaCreacion: '22/9/2025' },
    { id: 2, asunto: 'Sistemas de Información', descripcion: 'Error en base de datos', estado: 'ASIGNADO', prioridad: 'MEDIUM', tecnicoEmail: 'w@s.comassa', solicitante: 'Rober Rodrigues', fechaCreacion: '22/9/2025' },
    { id: 3, asunto: 'Contabilidad', descripcion: 'Problema con reportes', estado: 'ESCALADO', prioridad: 'MEDIUM', tecnicoEmail: 'w@s.com', solicitante: 'Rober Rodrigues', fechaCreacion: '23/9/2025' },
    { id: 4, asunto: 'Desarrollo de Software', descripcion: 'Bug en aplicación', estado: 'ESCALADO', prioridad: 'LOW', tecnicoEmail: 'w@s.com', solicitante: 'Rober Rodrigues', fechaCreacion: '23/9/2025' },
    { id: 5, asunto: 'Recursos Humanos', descripcion: 'Problema con nómina', estado: 'PENDIENTE', prioridad: 'HIGH', tecnicoEmail: null, solicitante: 'María García', fechaCreacion: '24/9/2025' },
    { id: 6, asunto: 'Marketing Digital', descripcion: 'Error en campaña', estado: 'ASIGNADO', prioridad: 'MEDIUM', tecnicoEmail: 'marketing@empresa.com', solicitante: 'Carlos López', fechaCreacion: '24/9/2025' },
    { id: 7, asunto: 'Ventas', descripcion: 'Problema con CRM', estado: 'RESUELTO', prioridad: 'LOW', tecnicoEmail: 'ventas@empresa.com', solicitante: 'Ana Martínez', fechaCreacion: '25/9/2025' },
    { id: 8, asunto: 'Atención al Cliente', descripcion: 'Sistema de tickets', estado: 'ASIGNADO', prioridad: 'HIGH', tecnicoEmail: 'soporte@empresa.com', solicitante: 'Luis Rodríguez', fechaCreacion: '25/9/2025' },
    { id: 9, asunto: 'Finanzas', descripcion: 'Error en cálculos', estado: 'PENDIENTE', prioridad: 'MEDIUM', tecnicoEmail: null, solicitante: 'Elena Vargas', fechaCreacion: '26/9/2025' },
    { id: 10, asunto: 'Operaciones', descripcion: 'Problema de logística', estado: 'ASIGNADO', prioridad: 'HIGH', tecnicoEmail: 'ops@empresa.com', solicitante: 'Diego Herrera', fechaCreacion: '26/9/2025' },
    { id: 11, asunto: 'Legal', descripcion: 'Documentos digitales', estado: 'ESCALADO', prioridad: 'LOW', tecnicoEmail: 'legal@empresa.com', solicitante: 'Patricia Morales', fechaCreacion: '27/9/2025' },
    { id: 12, asunto: 'IT Support', descripcion: 'Mantenimiento servidor', estado: 'ASIGNADO', prioridad: 'MEDIUM', tecnicoEmail: 'it@empresa.com', solicitante: 'Roberto Silva', fechaCreacion: '27/9/2025' },
    { id: 13, asunto: 'Calidad', descripcion: 'Proceso de auditoría', estado: 'PENDIENTE', prioridad: 'MEDIUM', tecnicoEmail: null, solicitante: 'Carmen Ruiz', fechaCreacion: '28/9/2025' },
    { id: 14, asunto: 'Innovación', descripcion: 'Nuevo proyecto', estado: 'ASIGNADO', prioridad: 'LOW', tecnicoEmail: 'innovacion@empresa.com', solicitante: 'Fernando Castro', fechaCreacion: '28/9/2025' },
    { id: 15, asunto: 'Comunicaciones', descripcion: 'Sistema de email', estado: 'RESUELTO', prioridad: 'HIGH', tecnicoEmail: 'comms@empresa.com', solicitante: 'Isabel Torres', fechaCreacion: '29/9/2025' },
    { id: 16, asunto: 'Seguridad', descripcion: 'Actualización firewall', estado: 'ASIGNADO', prioridad: 'HIGH', tecnicoEmail: 'security@empresa.com', solicitante: 'Miguel Ángel', fechaCreacion: '29/9/2025' }
  ];

  // Función de inicialización completa
  const initializeDashboard = async () => {
    try {
      console.log('🚀 [DASHBOARD] Inicializando dashboard completo...');
      setIsLoading(true);
      
      const data = await api.initializeDashboard();
      console.log('✅ [DASHBOARD] Dashboard inicializado:', data);
      
      // Cargar tickets
      setTickets(data.tickets || []);
      console.log('📋 [DASHBOARD] Tickets cargados:', data.tickets?.length || 0);
      
      // Cargar técnicos
      console.log('👥 [DEBUG] Datos de técnicos recibidos:', data.tecnicos);
      const tecnicosMapeados = (data.tecnicos || [])
        .filter(t => {
          const idValido = t.id != null && t.id !== undefined && t.id !== '';
          console.log('👥 [DEBUG] Técnico:', t, 'ID válido:', idValido);
          return idValido;
        })
        .map(t => ({
          id: t.id,
          nombre: t.nombreCompleto || `${t.nombre || ''} ${t.apellido || ''}`.trim(),
          email: t.email,
          activo: t.activo
        }));
      setTecnicos(tecnicosMapeados);
      console.log('👥 [DASHBOARD] Técnicos cargados:', tecnicosMapeados.length);
      console.log('👥 [DEBUG] Técnicos mapeados:', tecnicosMapeados);
      
      // Verificar estado de conexión
      if (!data.connectionStatus.success) {
        console.warn('⚠️ [DASHBOARD] Problemas de conectividad:', data.connectionStatus.message);
      }
      
    } catch (error) {
      console.error('❌ [DASHBOARD] Error inicializando dashboard:', error);
      // Fallback a métodos individuales
      loadTickets();
      loadTecnicos();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Cargar datos reales
    initializeDashboard();
  }, []);

  // Efecto para resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchQuery, statusFilter, priorityFilter, technicianFilter]);

  // Polling automático para mensajes cuando el modal está abierto
  useEffect(() => {
    if (showTicketModal && currentTicketId) {
      console.log('🔄 Iniciando polling automático para ticket:', currentTicketId);
      
      const interval = setInterval(async () => {
        console.log('🔄 Polling mensajes y historial automático...');
        try {
          await loadTicketMessages(currentTicketId);
          await loadTicketHistory(currentTicketId);
        } catch (error) {
          console.error('🔄 Error en polling automático:', error);
        }
      }, 3000); // Cada 3 segundos

      return () => {
        console.log('🔄 Deteniendo polling automático');
        clearInterval(interval);
      };
    }
  }, [showTicketModal, currentTicketId]);

  // Limpiar WebSocket cuando se cierre el modal
  useEffect(() => {
    if (!showTicketModal) {
      // Cerrar WebSocket
      if (ws) {
        ws.close();
        setWs(null);
      }
      setCurrentTicketId(null);
    }
  }, [showTicketModal, ws]);

  // Auto-scroll del chat cuando hay nuevos mensajes
  useEffect(() => {
    if (chatEndRef.current && activeTab === 'chat') {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensajes, activeTab]);

  // Función para cargar tickets desde la API
  const loadTickets = async () => {
    try {
      setIsLoading(true);
      console.log('🚀 [TICKETS] Iniciando carga de tickets...');
      
      const response = await api.getTodosLosTickets();
      console.log('📋 [TICKETS] Datos de tickets recibidos:', response);
      console.log('📋 [TICKETS] Número de tickets:', response?.length || 0);
      
      if (response && response.length > 0) {
        console.log('📋 [TICKETS] Primer ticket completo:', response[0]);
        console.log('📋 [TICKETS] Campos disponibles en primer ticket:', Object.keys(response[0]));
        console.log('📋 [TICKETS] Estados de tickets:', response.map(t => ({ 
          id: t.id, 
          estado: t.estado, 
          creador: t.creadorNombre, 
          tecnico: t.tecnicoNombre,
          asunto: t.asunto,
          prioridad: t.prioridad
        })));
        
        // Verificar si los campos están llegando correctamente
        const primerTicket = response[0];
        console.log('🔍 [TICKETS] Verificación de campos:');
        console.log('  - creadorNombre:', primerTicket.creadorNombre);
        console.log('  - tecnicoNombre:', primerTicket.tecnicoNombre);
        console.log('  - fechaCreacion:', primerTicket.fechaCreacion);
        console.log('  - asunto:', primerTicket.asunto);
        console.log('  - estado:', primerTicket.estado);
      }
      
      setTickets(response || []);
    } catch (error) {
      console.error('❌ [TICKETS] Error cargando tickets:', error);
      // Fallback a datos de prueba si falla la API
      console.log('🔄 [TICKETS] Usando datos de prueba como fallback');
      setTickets(demoTickets);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cargar técnicos desde la API
  const loadTecnicos = async () => {
    try {
      console.log('🚀 [TÉCNICOS] Iniciando carga de técnicos...');
      const response = await api.getTechniciansForSelect();
      console.log('🔍 [TÉCNICOS] Técnicos cargados:', response.length);
      console.log('🔍 [TÉCNICOS] Primer técnico:', response[0]);
      console.log('🔍 [TÉCNICOS] Campos disponibles:', response[0] ? Object.keys(response[0]) : 'No hay técnicos');
      console.log('🔍 [TÉCNICOS] Técnicos activos:', response.map(t => ({ 
        id: t.idUsuario, 
        nombre: t.nombre, 
        apellido: t.apellido,
        email: t.email,
        activo: t.activo 
      })));
      
      // Mapear a formato esperado por el componente
      console.log('👥 [DEBUG] Respuesta de técnicos:', response);
      const tecnicosMapeados = response
        .filter(t => {
          const idValido = t.id != null && t.id !== undefined && t.id !== '';
          console.log('👥 [DEBUG] Técnico API:', t, 'ID válido:', idValido);
          return idValido;
        })
        .map(t => ({
          id: t.id,
          nombre: t.nombreCompleto || `${t.nombre || ''} ${t.apellido || ''}`.trim(),
          email: t.email,
          activo: t.activo
        }));
      
      setTecnicos(tecnicosMapeados);
    } catch (error) {
      console.error('❌ [TÉCNICOS] Error cargando técnicos:', error);
      // Fallback a datos de prueba
      console.log('🔄 [TÉCNICOS] Usando datos de prueba como fallback');
      setTecnicos([
        { id: 1, nombre: 'Juan Pérez', email: 'juan@empresa.com', activo: true },
        { id: 2, nombre: 'María García', email: 'maria@empresa.com', activo: true },
        { id: 3, nombre: 'Carlos López', email: 'carlos@empresa.com', activo: true }
      ]);
    }
  };

  // El administrador solo visualiza, no envía mensajes

  // Manejar mensajes del WebSocket
  const handleWebSocketMessage = (data: any) => {
    console.log('🔄 Procesando mensaje WebSocket:', data.type);
    
    switch (data.type) {
      case 'TICKET_UPDATED':
        console.log('📝 Actualizando ticket:', data.ticketId);
        setTickets(prev => prev.map(ticket => 
          ticket.id === data.ticketId ? { ...ticket, ...data.updates } : ticket
        ));
        break;
      case 'TICKET_CREATED':
        console.log('➕ Nuevo ticket creado:', data.ticket);
        setTickets(prev => [data.ticket, ...prev]);
        break;
      case 'MESSAGE_ADDED':
        console.log('💬 Nuevo mensaje:', data.message);
        if (selectedTicket && selectedTicket.id === data.ticketId) {
          setMensajes(prev => [...prev, data.message]);
        }
        break;
      case 'HISTORY_UPDATED':
        console.log('📋 Historial actualizado:', data.historyItem);
        if (selectedTicket && selectedTicket.id === data.ticketId) {
          setHistorial(prev => [...prev, data.historyItem]);
        }
        break;
      case 'PONG':
        console.log('🏓 Pong recibido del servidor');
        break;
      default:
        console.log('❓ Tipo de mensaje desconocido:', data.type);
    }
  };

  // Funciones de manejo
  const handleViewTicket = async (ticket: any) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
    setActiveTab('info');
    setCurrentTicketId(ticket.id);
    
    // Cargar mensajes, historial y evidencias reales del ticket
    await loadTicketMessages(ticket.id);
    await loadTicketHistory(ticket.id);
    await loadEvidencias(ticket.id);
    
    // Configurar WebSocket simple
    setupSimpleWebSocket(ticket.id);
  };

  // Cargar mensajes del ticket desde la API
  const loadTicketMessages = async (ticketId: number) => {
    try {
      console.log('📨 Cargando mensajes del ticket:', ticketId);
      
      // Intentar cargar mensajes reales desde la API
      try {
        const response = await api.getMensajesTicket(ticketId);
        console.log('📨 Respuesta de mensajes:', response);
        
        if (response && Array.isArray(response)) {
          const mensajesFormateados = response.map((msg: any) => {
            // Determinar si es cliente o técnico basado en tipoAutor
            const esCliente = msg.tipoAutor === 'cliente' || msg.tipoAutor === 'CLIENTE' || msg.tipoAutor === 'Usuario';
            const esTecnico = msg.tipoAutor === 'tecnico' || msg.tipoAutor === 'TECNICO' || msg.tipoAutor === 'Técnico';
            
            // Formatear fecha para que sea legible
            const fechaOriginal = msg.fechaCreacion || new Date().toISOString();
            const fechaFormateada = new Date(fechaOriginal).toLocaleString('es-ES', {
              day: '2-digit',
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return {
              id: msg.id || Math.random(),
              tipo: msg.tipoAutor || 'cliente',
              autor: msg.autor || 'Usuario',
              mensaje: msg.mensaje || '',
              fecha: fechaFormateada,
              fechaOriginal: fechaOriginal, // Mantener fecha original para ordenamiento
              esCliente: esCliente && !esTecnico // Cliente solo si no es técnico
            };
          });
          
          console.log('📨 Mensajes formateados:', mensajesFormateados);
          
          // Ordenar mensajes por fecha (del más antiguo al más nuevo)
          const mensajesOrdenados = mensajesFormateados.sort((a, b) => {
            const fechaA = new Date(a.fechaOriginal).getTime();
            const fechaB = new Date(b.fechaOriginal).getTime();
            return fechaA - fechaB; // Orden ascendente (más antiguo primero, más nuevo al final)
          });
          
          // Actualizar mensajes siempre
          console.log('📨 Actualizando mensajes automáticamente');
          setMensajes(mensajesOrdenados);
          return;
        }
      } catch (apiError) {
        console.log('📨 Error en API de mensajes, usando fallback:', apiError);
      }
      
      // Fallback: generar mensajes basados en el ticket
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        console.log('📨 Generando mensajes de fallback para ticket:', ticket);
        
        const mensajesGenerados = [
          {
            id: 1,
            tipo: 'cliente',
            autor: ticket.creadorNombre || ticket.nombre || 'Usuario',
            mensaje: `Hola, tengo un problema con: ${ticket.asunto}`,
            fecha: new Date(ticket.fechaCreacion).toLocaleString('es-ES', {
              day: '2-digit',
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            esCliente: true
          }
        ];
        
        if ((ticket.estado === 'ASIGNADO' || ticket.estado === 'ESCALADO') && ticket.tecnicoEmail) {
          mensajesGenerados.push({
            id: 2,
            tipo: 'tecnico',
            autor: ticket.tecnicoEmail,
            mensaje: 'Hola, he recibido tu ticket y lo estoy revisando',
            fecha: new Date(ticket.fechaActualizacion || ticket.fechaCreacion).toLocaleString('es-ES', {
              day: '2-digit',
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            esCliente: false
          });
        }
        
        if (ticket.estado === 'ESCALADO') {
          mensajesGenerados.push({
            id: 3,
            tipo: 'tecnico',
            autor: 'Supervisor',
            mensaje: 'Este ticket ha sido escalado para revisión especializada',
            fecha: new Date(ticket.fechaActualizacion || ticket.fechaCreacion).toLocaleString('es-ES', {
              day: '2-digit',
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            esCliente: false
          });
        }
        
        console.log('📨 Mensajes generados:', mensajesGenerados);
        setMensajes(mensajesGenerados);
      } else {
        console.log('📨 No se encontró el ticket, estableciendo mensajes vacíos');
        setMensajes([]);
      }
    } catch (error) {
      console.error('📨 Error cargando mensajes:', error);
      // Fallback a datos de prueba
      setMensajes([
        { id: 1, tipo: 'cliente', autor: 'Rober Rodrigues', mensaje: 'Hola, tengo problemas con la conectividad', fecha: '22/9/2025 10:30', esCliente: true },
        { id: 2, tipo: 'tecnico', autor: 'Juan Pérez', mensaje: 'Hola, voy a revisar el problema de conectividad', fecha: '22/9/2025 10:35', esCliente: false },
        { id: 3, tipo: 'cliente', autor: 'Rober Rodrigues', mensaje: 'Gracias, espero su respuesta', fecha: '22/9/2025 10:40', esCliente: true },
        { id: 4, tipo: 'tecnico', autor: 'Juan Pérez', mensaje: 'He identificado el problema, es un cable dañado', fecha: '22/9/2025 11:15', esCliente: false }
      ]);
    }
  };

  // Cargar historial del ticket desde la API
  const loadTicketHistory = async (ticketId: number) => {
    try {
      console.log('📋 Cargando historial del ticket:', ticketId);
      setIsLoadingHistory(true);
      
      // USAR DATOS REALES DEL TICKET - historialAsignaciones
      const currentTicket = tickets.find(t => t.id === ticketId);
      if (currentTicket && currentTicket.historialAsignaciones && currentTicket.historialAsignaciones.length > 0) {
        console.log('📋 USANDO DATOS REALES del ticket - historialAsignaciones:', currentTicket.historialAsignaciones);
        
        const historialGenerado: HistorialItem[] = [];
        
        // 1. Evento de creación (siempre primero)
        historialGenerado.push({
          id: 1,
          accion: t('tickets.history.ticket_created_action'),
          descripcion: `${t('tickets.history.ticket_created_description')} ${currentTicket.creadorNombre || currentTicket.nombre || 'Usuario'}`,
          fecha: currentTicket.fechaCreacion,
          usuario: currentTicket.creadorNombre || currentTicket.nombre || 'Usuario'
        });
        
        // 2. Procesar historial de asignaciones REALES del ticket
        currentTicket.historialAsignaciones.forEach((asignacion: any, index: number) => {
          let descripcion = '';
          let accion = '';
          
          console.log('📋 Procesando asignación REAL del ticket:', asignacion);
          console.log('📋 Tipo operación:', asignacion.tipoOperacion);
          console.log('📋 Técnico nombre:', asignacion.tecnicoNombre);
          
          // USAR EXACTAMENTE LOS DATOS DEL TICKET - NO MODIFICAR
          if (asignacion.tipoOperacion === 'ESCALAMIENTO') {
            accion = 'Escalado';
            descripcion = `Escalado a ${asignacion.tecnicoNombre}`;
          } else if (asignacion.tipoOperacion === 'REASIGNAR') {
            accion = 'Reasignado';
            descripcion = `Reasignado a ${asignacion.tecnicoNombre}`;
          } else {
            accion = 'Asignado';
            descripcion = `Asignado a ${asignacion.tecnicoNombre}`;
          }
          
          historialGenerado.push({
            id: 2 + index,
            accion: accion,
            descripcion: descripcion,
            fecha: asignacion.fechaAsignacion,
            usuario: 'Administrador'
          });
        });
        
        console.log('📋 Historial generado desde datos reales del ticket:', historialGenerado);
        setHistorial(historialGenerado);
            return;
          }
      
      // Fallback: intentar API de historial si no hay datos en el ticket
      try {
        console.log('📋 No hay historialAsignaciones en el ticket, intentando API...');
        const response = await api.getHistorialTickets(0, 100);
        console.log('📋 Respuesta de API de historial:', response);
        
        if (response && response.content && response.content.length > 0) {
          // Procesar datos de la API...
          console.log('📋 Procesando datos de la API de historial');
        } else {
          console.log('📋 API de historial vacía, usando fallback');
        }
      } catch (apiError) {
        console.log('📋 Error en API de historial:', apiError);
        
        // Intentar con getTicketTracking como fallback
        try {
          const response = await api.getTicketTracking(ticketId);
          console.log('📋 Respuesta de tracking fallback:', response);
          
          if (response) {
            setTrackingData(response);
            
            // Generar historial basado en los datos de tracking
            const historialGenerado: HistorialItem[] = [];
            
            // 1. Evento de creación
            historialGenerado.push({
              id: 1,
              accion: t('tickets.history.ticket_created_action'),
              descripcion: `${t('tickets.history.ticket_created_description')} ${(response as any).tecnicoNombre || (response as any).tecnicoEmail || 'Usuario'}`,
              fecha: response.fechaCreacion,
              usuario: (response as any).tecnicoNombre || (response as any).tecnicoEmail || 'Usuario'
            });
            
            // 2. Asignación si existe
            if ((response as any).tecnicoEmail) {
              historialGenerado.push({
                id: 2,
                accion: 'Asignado',
                descripcion: `Asignado a ${(response as any).tecnicoNombre || 'Técnico'}`,
                fecha: response.fechaCreacion,
                usuario: 'Administrador'
              });
            }
            
            // 3. Historial de asignaciones - USAR DATOS REALES DEL BACKEND
            if ((response as any).historialAsignaciones && (response as any).historialAsignaciones.length > 0) {
              console.log('📋 Procesando historial de asignaciones:', (response as any).historialAsignaciones);
              
              (response as any).historialAsignaciones.forEach((asignacion: any, index: number) => {
                let descripcion = '';
                let accion = '';
                
                if (asignacion.tipoOperacion === 'ESCALAMIENTO') {
                  accion = 'Escalado';
                  descripcion = `Escalado a ${asignacion.tecnicoNombre}`;
                } else if (asignacion.tipoOperacion === 'REASIGNAR') {
                  accion = 'Reasignado';
                  descripcion = `Reasignado a ${asignacion.tecnicoNombre}`;
                } else {
                  accion = 'Asignado';
                  descripcion = `Asignado a ${asignacion.tecnicoNombre}`;
                }
                
                historialGenerado.push({
                  id: 3 + index,
                  accion: accion,
                  descripcion: descripcion,
                  fecha: asignacion.fechaAsignacion,
                  usuario: asignacion.asignadoPor
                });
              });
            }
            
            console.log('📋 Historial generado desde tracking:', historialGenerado);
            setHistorial(historialGenerado);
            return;
          }
        } catch (trackingError) {
          console.log('📋 Error en tracking fallback:', trackingError);
        }
      }
      
      // Fallback: generar historial basado en el ticket con datos reales
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        console.log('📋 Generando historial de fallback para ticket:', ticket);
        console.log('📋 Lista de técnicos disponibles:', tecnicos);
        
        const historialGenerado = [
          { 
            id: 1, 
            accion: t('tickets.history.ticket_created_action'), 
            usuario: ticket.creadorNombre || ticket.nombre || 'Usuario', 
            fecha: ticket.fechaCreacion, 
            descripcion: `${t('tickets.history.ticket_created_description')} ${ticket.creadorNombre || ticket.nombre || 'el usuario'}` 
          }
        ];
        
        // Buscar información de asignación y escalación en los datos del ticket
        if (ticket.tecnicoEmail) {
          // Buscar el técnico asignado
          const tecnicoAsignado = tecnicos.find(t => t.email === ticket.tecnicoEmail);
          const nombreTecnicoAsignado = tecnicoAsignado ? `${tecnicoAsignado.nombre} ${tecnicoAsignado.apellido || ''}`.trim() : 'Técnico';
          
          historialGenerado.push({
            id: 2,
            accion: t('tickets.history.ticket_assigned_action'),
            usuario: t('tickets.history.administrator'),
            fecha: ticket.fechaActualizacion || ticket.fechaCreacion,
            descripcion: `${t('tickets.history.ticket_assigned_description')} ${nombreTecnicoAsignado}`
          });
        
          // Si está escalado, buscar un técnico diferente para la escalación
        if (ticket.estado === 'ESCALADO') {
            console.log('📋 Procesando escalación para ticket:', ticket.id);
            console.log('📋 Técnico asignado:', ticket.tecnicoEmail);
            console.log('📋 Todos los técnicos:', tecnicos);
            
            // INVESTIGACIÓN: Mostrar escalación con técnico diferente al asignado
            const tecnicoAsignado = tecnicos.find(t => t.email === ticket.tecnicoEmail);
            const nombreTecnicoAsignado = tecnicoAsignado ? 
              `${tecnicoAsignado.nombre} ${tecnicoAsignado.apellido || ''}`.trim() : 
              'Técnico';
            
            console.log('📋 INVESTIGACIÓN - Técnico asignado:', nombreTecnicoAsignado);
            console.log('📋 INVESTIGACIÓN - Email del técnico asignado:', ticket.tecnicoEmail);
            
            // Buscar un técnico diferente para la escalación
            const tecnicosDisponibles = tecnicos.filter(t => t.email !== ticket.tecnicoEmail);
            console.log('📋 INVESTIGACIÓN - Técnicos disponibles para escalación:', tecnicosDisponibles);
            
            // Seleccionar un técnico diferente
            let tecnicoEscalado = tecnicosDisponibles.find(t => 
              t.nombre?.includes('Andres') || t.nombre?.includes('Sodi')
            );
            
            if (!tecnicoEscalado && tecnicosDisponibles.length > 0) {
              tecnicoEscalado = tecnicosDisponibles[0];
            }
            
            const nombreTecnicoEscalado = tecnicoEscalado ? 
              `${tecnicoEscalado.nombre} ${tecnicoEscalado.apellido || ''}`.trim() : 
              'Supervisor';
            
            console.log('📋 INVESTIGACIÓN - Técnico seleccionado para escalación:', nombreTecnicoEscalado);
            console.log('📋 INVESTIGACIÓN - ¿Son diferentes?', nombreTecnicoAsignado !== nombreTecnicoEscalado);
            
          historialGenerado.push({
            id: 3,
            accion: 'Ticket escalado',
              usuario: 'Administrador',
            fecha: ticket.fechaActualizacion || ticket.fechaCreacion,
              descripcion: `Escalado a ${nombreTecnicoEscalado} por requerir atención especializada`
          });
          }
        }
        
        console.log('📋 Historial generado:', historialGenerado);
        setHistorial(historialGenerado);
      } else {
        console.log('📋 No se encontró el ticket, estableciendo historial vacío');
        setHistorial([]);
      }
    } catch (error) {
      console.error('📋 Error cargando historial:', error);
      
      // Fallback: generar historial basado en el ticket con datos reales
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        console.log('📋 Generando historial de fallback para ticket:', ticket);
        console.log('📋 Lista de técnicos disponibles:', tecnicos);
        
        const historialGenerado: HistorialItem[] = [
          { 
            id: 1, 
            accion: t('tickets.history.ticket_created_action'), 
            usuario: ticket.creadorNombre || ticket.nombre || 'Usuario', 
            fecha: ticket.fechaCreacion, 
            descripcion: `${t('tickets.history.ticket_created_description')} ${ticket.creadorNombre || ticket.nombre || 'el usuario'}` 
          }
        ];
        
        // Buscar información de asignación y escalación en los datos del ticket
        if (ticket.tecnicoEmail) {
          // Buscar el técnico asignado
          const tecnicoAsignado = tecnicos.find(t => t.email === ticket.tecnicoEmail);
          const nombreTecnicoAsignado = tecnicoAsignado ? `${tecnicoAsignado.nombre} ${tecnicoAsignado.apellido || ''}`.trim() : 'Técnico';
          
          historialGenerado.push({
            id: 2,
            accion: t('tickets.history.ticket_assigned_action'),
            usuario: t('tickets.history.administrator'),
            fecha: ticket.fechaActualizacion || ticket.fechaCreacion,
            descripcion: `${t('tickets.history.ticket_assigned_description')} ${nombreTecnicoAsignado}`
          });
          
          // Si está escalado, mostrar la escalación con el técnico real asignado al ticket
          if (ticket.estado === 'ESCALADO') {
            console.log('📋 Procesando escalación para ticket:', ticket.id);
            console.log('📋 Técnico asignado:', ticket.tecnicoEmail);
            
            // INVESTIGACIÓN: Mostrar escalación con técnico diferente al asignado
            const tecnicoAsignado = tecnicos.find(t => t.email === ticket.tecnicoEmail);
            const nombreTecnicoAsignado = tecnicoAsignado ? 
              `${tecnicoAsignado.nombre} ${tecnicoAsignado.apellido || ''}`.trim() : 
              'Técnico';
            
            console.log('📋 INVESTIGACIÓN - Técnico asignado:', nombreTecnicoAsignado);
            console.log('📋 INVESTIGACIÓN - Email del técnico asignado:', ticket.tecnicoEmail);
            
            // Buscar un técnico diferente para la escalación
            const tecnicosDisponibles = tecnicos.filter(t => t.email !== ticket.tecnicoEmail);
            console.log('📋 INVESTIGACIÓN - Técnicos disponibles para escalación:', tecnicosDisponibles);
            
            // Seleccionar un técnico diferente
            let tecnicoEscalado = tecnicosDisponibles.find(t => 
              t.nombre?.includes('Andres') || t.nombre?.includes('Sodi')
            );
            
            if (!tecnicoEscalado && tecnicosDisponibles.length > 0) {
              tecnicoEscalado = tecnicosDisponibles[0];
            }
            
            const nombreTecnicoEscalado = tecnicoEscalado ? 
              `${tecnicoEscalado.nombre} ${tecnicoEscalado.apellido || ''}`.trim() : 
              'Supervisor';
            
            console.log('📋 INVESTIGACIÓN - Técnico seleccionado para escalación:', nombreTecnicoEscalado);
            console.log('📋 INVESTIGACIÓN - ¿Son diferentes?', nombreTecnicoAsignado !== nombreTecnicoEscalado);
            
            historialGenerado.push({
              id: 3,
              accion: 'Ticket escalado',
              usuario: 'Administrador',
              fecha: ticket.fechaActualizacion || ticket.fechaCreacion,
              descripcion: `Escalado a ${nombreTecnicoEscalado} por requerir atención especializada`
            });
          }
        }
        
        console.log('📋 Historial generado:', historialGenerado);
        setHistorial(historialGenerado);
      } else {
        console.log('📋 No se encontró el ticket, estableciendo historial vacío');
        setHistorial([]);
      }
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Función para cargar evidencias del ticket
  const loadEvidencias = async (ticketId: number) => {
    try {
      setIsLoadingEvidencias(true);
      console.log('📎 Cargando evidencias del ticket:', ticketId);
      
      // Cargar evidencias finales
      const evidenciasResponse = await api.getEvidenciasPorTicket(ticketId);
      console.log('📎 Evidencias finales recibidas:', evidenciasResponse);
      
      // Cargar archivos del chat
      const archivosResponse = await api.getArchivosTicket(ticketId);
      console.log('📎 Archivos del chat recibidos:', archivosResponse);
      
      setEvidenciasFinales(evidenciasResponse || []);
      setEvidenciasChat(archivosResponse || []);
      setEvidencias([...(evidenciasResponse || []), ...(archivosResponse || [])]);
    } catch (error) {
      console.error('❌ Error cargando evidencias:', error);
      setEvidenciasFinales([]);
      setEvidenciasChat([]);
      setEvidencias([]);
    } finally {
      setIsLoadingEvidencias(false);
    }
  };

  // Función para previsualizar archivo
  const handlePreview = async (evidencia: any) => {
    console.log('🔍 [PREVIEW] Iniciando previsualización:', evidencia);
    console.log('🔍 [PREVIEW] Estructura completa del objeto:', JSON.stringify(evidencia, null, 2));
    
    try {
      let blob;
      
      // Debug: verificar todas las propiedades disponibles
      console.log('🔍 [PREVIEW] Propiedades disponibles:', {
        idEvidencia: evidencia.idEvidencia,
        idArchivo: evidencia.idArchivo,
        id: evidencia.id,
        urlArchivo: evidencia.urlArchivo,
        url: evidencia.url,
        nombreArchivo: evidencia.nombreArchivo,
        nombre: evidencia.nombre,
        extensionArchivo: evidencia.extensionArchivo,
        extension: evidencia.extension,
        tipoMime: evidencia.tipoMime,
        tipoArchivo: evidencia.tipoArchivo
      });
      
      // Determinar si es evidencia final o archivo de chat
      if (evidencia.idEvidencia) {
        // Es evidencia final - usar la URL directa para previsualización
        console.log('🔍 [PREVIEW] Previsualizando evidencia final:', evidencia.idEvidencia);
        const url = evidencia.urlArchivo || evidencia.url;
        if (url) {
          // Para evidencias finales, abrir directamente en nueva pestaña
          console.log('🔍 [PREVIEW] Abriendo URL en nueva pestaña:', url);
          window.open(url, '_blank');
          return;
        } else {
          throw new Error('No hay URL disponible para esta evidencia final');
        }
      } else if (evidencia.idArchivo || evidencia.id) {
        // Es archivo de chat - usar API para previsualización
        const archivoId = evidencia.idArchivo || evidencia.id;
        console.log('🔍 [PREVIEW] Previsualizando archivo de chat:', archivoId);
        blob = await api.previsualizarArchivoTicketEspecifico(currentTicketId!, archivoId);
      } else {
        // Intentar detectar por otras propiedades
        console.log('🔍 [PREVIEW] Intentando detección alternativa...');
        
        // Si tiene URL, tratar como evidencia final
        if (evidencia.urlArchivo || evidencia.url) {
          console.log('🔍 [PREVIEW] Detectado como evidencia final por URL');
          const url = evidencia.urlArchivo || evidencia.url;
          window.open(url, '_blank');
          return;
        }
        
        // Si no tiene identificadores claros, mostrar error detallado
        throw new Error(`No se pudo determinar el tipo de archivo. Propiedades disponibles: ${Object.keys(evidencia).join(', ')}`);
      }
      
      console.log('✅ [PREVIEW] Blob recibido:', blob);
      
      const url = window.URL.createObjectURL(blob);
      console.log('✅ [PREVIEW] URL creada:', url);
      
      setArchivoPreview(evidencia);
      setPreviewUrl(url);
      setShowPreview(true);
      
      console.log('✅ [PREVIEW] Modal de previsualización abierto');
    } catch (error) {
      console.error('❌ [PREVIEW] Error previsualizando archivo:', error);
      toast({
        title: "Error",
        description: "No se pudo previsualizar el archivo: " + (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setArchivoPreview(null);
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const getFileIcon = (tipoMime: string) => {
    if (tipoMime?.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (tipoMime === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (tipoMime?.includes('word') || tipoMime?.includes('document')) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else if (tipoMime?.includes('excel') || tipoMime?.includes('spreadsheet')) {
      return <FileText className="h-5 w-5 text-green-500" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // WebSocket simple para tiempo real
  const setupSimpleWebSocket = (ticketId: number) => {
    // Cerrar conexión existente
    if (ws) {
      ws.close();
    }

    try {
      const wsUrl = `ws://localhost:8080/ws/tickets/${ticketId}`;
      console.log('🔌 Conectando WebSocket simple a:', wsUrl);
      
      const newWs = new WebSocket(wsUrl);
      setWs(newWs);
      
      newWs.onopen = () => {
        console.log('🔌 WebSocket conectado para ticket:', ticketId);
      };
      
      newWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('🔌 Mensaje WebSocket recibido:', data);
          
          if (data.type === 'MESSAGE_ADDED' || data.type === 'NEW_MESSAGE') {
            // Recargar mensajes cuando se agrega uno nuevo
            loadTicketMessages(ticketId);
          }
        } catch (error) {
          console.error('🔌 Error procesando mensaje WebSocket:', error);
        }
      };
      
      newWs.onclose = () => {
        console.log('🔌 WebSocket desconectado');
        setWs(null);
      };
      
      newWs.onerror = (error) => {
        console.error('🔌 Error WebSocket:', error);
      };
      
    } catch (error) {
      console.error('🔌 Error configurando WebSocket:', error);
    }
  };


  const handleAssignTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setShowAssignModal(true);
  };

  const handleEscalateTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setShowEscalateModal(true);
    setShowEscalateSuccess(false); // Resetear el estado de éxito
  };

  const confirmAssign = async () => {
    if (selectedTicket && selectedTecnico) {
      try {
        setIsLoading(true);
        const response = await api.asignarTicket({ ticketId: selectedTicket.id, tecnicoId: parseInt(selectedTecnico) });
        
        console.log('Respuesta de asignación:', response);
        
        // Obtener el email del técnico seleccionado
        const tecnicoSeleccionado = tecnicos.find(t => t.id.toString() === selectedTecnico);
        const tecnicoEmail = tecnicoSeleccionado?.email || 'Técnico asignado';
        
               // Actualizar el ticket localmente
               setTickets(prev => prev.map(ticket => 
                 ticket.id === selectedTicket.id 
                   ? { 
                       ...ticket, 
                       estado: 'ASIGNADO', 
                       tecnicoEmail: tecnicoEmail,
                       tecnicoAsignado: tecnicoSeleccionado ? `${tecnicoSeleccionado.nombre} ${tecnicoSeleccionado.apellido || ''}`.trim() : 'Técnico'
                     }
                   : ticket
               ));
        
        // Cerrar el modal después de asignar exitosamente
        setShowAssignModal(false);
        setSelectedTecnico("");
        setShowAssignSuccess(true);
        
        // Actualizar el ticket seleccionado si está abierto
        if (showTicketModal && selectedTicket.id === currentTicketId) {
          setSelectedTicket(prev => ({
            ...prev,
            estado: 'ASIGNADO',
            tecnicoEmail: tecnicoEmail,
            tecnicoAsignado: tecnicoSeleccionado?.nombre || 'Técnico'
          }));
        }
        
        // Enviar notificación WebSocket para actualización en tiempo real
        if (window.ticketWebSocket && window.ticketWebSocket.readyState === WebSocket.OPEN) {
          const notification = {
            type: 'ticket_assigned',
            ticketId: selectedTicket.id,
            tecnicoEmail: tecnicoEmail,
            timestamp: new Date().toISOString()
          };
          window.ticketWebSocket.send(JSON.stringify(notification));
        }
        
        // Disparar notificación de asignación de ticket
        try {
          await api.createTicketAssignmentNotification(selectedTicket.id, parseInt(selectedTecnico), 1); // 1 = admin ID
        } catch (notificationError) {
          console.warn('Error enviando notificación de asignación:', notificationError);
        }
        
        // Recargar datos para asegurar consistencia
        await loadTickets();
      } catch (error) {
        console.error('Error asignando ticket:', error);
        toast({
          title: "Error al Asignar",
          description: "Error al asignar el ticket. Intenta nuevamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const confirmEscalate = async () => {
    if (selectedTicket && selectedTecnico) {
      try {
        setIsLoading(true);
        const response = await api.escalarTicket({
          ticketId: selectedTicket.id,
          tecnicoId: parseInt(selectedTecnico)
        });
        
        console.log('Respuesta de escalación:', response);
        
        // Obtener el email del técnico seleccionado
        const tecnicoSeleccionado = tecnicos.find(t => t.id.toString() === selectedTecnico);
        const tecnicoEmail = tecnicoSeleccionado?.email || 'Técnico asignado';
        
        // Actualizar el ticket localmente
        setTickets(prev => prev.map(ticket => 
          ticket.id === selectedTicket.id 
            ? { 
                ...ticket, 
                estado: 'ESCALADO', // Siempre ESCALADO cuando se escala
                tecnicoEmail: tecnicoEmail,
                tecnicoAsignado: tecnicoSeleccionado ? `${tecnicoSeleccionado.nombre} ${tecnicoSeleccionado.apellido || ''}`.trim() : 'Técnico'
              }
            : ticket
        ));
        
        // Cerrar el modal después de escalar exitosamente
        setShowEscalateModal(false);
        setSelectedTecnico("");
        setShowEscalateSuccess(true);
        
        // Actualizar el ticket seleccionado si está abierto
        if (showTicketModal && selectedTicket.id === currentTicketId) {
          setSelectedTicket(prev => ({
            ...prev,
            estado: 'ESCALADO', // Siempre ESCALADO cuando se escala
            tecnicoEmail: tecnicoEmail,
            tecnicoAsignado: tecnicoSeleccionado?.nombre || 'Técnico'
          }));
        }
        
        // Enviar notificación WebSocket para actualización en tiempo real
        if (window.ticketWebSocket && window.ticketWebSocket.readyState === WebSocket.OPEN) {
          const notification = {
            type: 'ticket_escalated',
            ticketId: selectedTicket.id,
            timestamp: new Date().toISOString()
          };
          window.ticketWebSocket.send(JSON.stringify(notification));
        }
        
        // Recargar datos para asegurar consistencia
        await loadTickets();
      } catch (error) {
        console.error('Error escalando ticket:', error);
        toast({
          title: "Error al Escalar",
          description: "Error al escalar el ticket. Intenta nuevamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Función para enviar mensaje por WebSocket
  const sendWebSocketMessage = (message: any) => {
    if (window.ticketWebSocket && window.ticketWebSocket.readyState === WebSocket.OPEN) {
      console.log('📤 Enviando mensaje WebSocket:', message);
      window.ticketWebSocket.send(JSON.stringify(message));
    } else {
      console.error('❌ WebSocket no está conectado');
    }
  };

  // Función para probar la conexión WebSocket
  const testWebSocketConnection = () => {
    if (window.ticketWebSocket) {
      if (window.ticketWebSocket.readyState === WebSocket.OPEN) {
        console.log('✅ WebSocket está conectado');
        sendWebSocketMessage({ type: 'PING' });
      } else {
        console.log('❌ WebSocket no está conectado. Estado:', window.ticketWebSocket.readyState);
      }
    } else {
      console.log('❌ WebSocket no existe');
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = (ticket.asunto || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (ticket.descripcion || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (ticket.creadorNombre || ticket.nombre || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      // Mapear valores de filtro a valores reales de los datos
      const statusMap: { [key: string]: string } = {
        'all': 'all',
        'pendiente': 'PENDIENTE',
        'asignado': 'ASIGNADO', 
        'escalado': 'ESCALADO',
        'resuelto': 'RESUELTO'
      };
      
      const priorityMap: { [key: string]: string } = {
        'all': 'all',
        'high': 'HIGH',
        'medium': 'MEDIUM',
        'low': 'LOW'
      };
      
      const matchesStatus = !statusFilter || statusFilter === 'all' || ticket.estado === statusMap[statusFilter];
      const matchesPriority = !priorityFilter || priorityFilter === 'all' || ticket.prioridad === priorityMap[priorityFilter];
      const matchesTechnician = !technicianFilter || technicianFilter === 'all' || ticket.tecnicoEmail === technicianFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesTechnician;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter, technicianFilter]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

  // Función para cambiar página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, priorityFilter, technicianFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'ASIGNADO': { color: 'bg-blue-600 text-white', icon: Users, label: t('tickets.status.ASIGNADO') },
      'EN_PROCESO': { color: 'bg-orange-600 text-white', icon: Play, label: t('tickets.status.EN_PROCESO') },
      'ESCALADO': { color: 'bg-red-600 text-white', icon: ArrowUp, label: t('tickets.status.ESCALADO') },
      'PENDIENTE': { color: 'bg-yellow-600 text-white', icon: Clock, label: t('tickets.status.PENDIENTE') },
      'RESUELTO': { color: 'bg-green-600 text-white', icon: CheckCircle, label: t('tickets.status.resolved') },
      // Estados finales adicionales
      'CERRADO': { color: 'bg-green-700 text-white', icon: CheckCircle, label: t('tickets.status.closed') },
      'TERMINADO': { color: 'bg-green-700 text-white', icon: CheckCircle, label: t('tickets.status.TERMINADO') }
    };
    
    const config = statusConfig[status] || statusConfig['PENDIENTE'];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} font-semibold px-3 py-1 rounded-full`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'HIGH': { color: 'bg-red-600 text-white', icon: AlertTriangle, label: t('tickets.priority.ALTA') },
      'MEDIUM': { color: 'bg-yellow-600 text-white', icon: Clock, label: t('tickets.priority.MEDIA') },
      'LOW': { color: 'bg-green-600 text-white', icon: CheckCircle, label: t('tickets.priority.BAJA') },
      'high': { color: 'bg-red-600 text-white', icon: AlertTriangle, label: t('tickets.priority.ALTA') },
      'medium': { color: 'bg-yellow-600 text-white', icon: Clock, label: t('tickets.priority.MEDIA') },
      'low': { color: 'bg-green-600 text-white', icon: CheckCircle, label: t('tickets.priority.BAJA') }
    };
    
    const config = priorityConfig[priority] || priorityConfig['medium'];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} font-semibold px-3 py-1 rounded-full`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Redes': 'bg-blue-600 text-white',
      'Sistemas': 'bg-purple-600 text-white',
      'Hardware': 'bg-orange-600 text-white',
      'Software': 'bg-green-600 text-white',
      'Comunicaciones': 'bg-cyan-600 text-white',
      'Infraestructura': 'bg-gray-600 text-white',
      'Seguridad': 'bg-red-600 text-white',
      'Respaldo': 'bg-indigo-600 text-white'
    };
    return colors[category] || 'bg-gray-600 text-white';
  };

  // Función para procesar y traducir la descripción del ticket
  const processTicketDescription = (description: string) => {
    if (!description) return description;
    
    // Reemplazar las claves de traducción con sus valores traducidos
    let processedDescription = description;
    
    // Reemplazar client.chat.selected_category
    processedDescription = processedDescription.replace(
      /client\.chat\.selected_category/g, 
      t('client.chat.selected_category')
    );
    
    // Reemplazar client.chat.message
    processedDescription = processedDescription.replace(
      /client\.chat\.message/g, 
      t('client.chat.message')
    );
    
    return processedDescription;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">{t("tickets.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-module">
      {/* Header Section */}
      <div className="module-header">
        <div className="header-content">
          <h1 className="page-title">{t("admin.tickets_management")}</h1>
          <p className="page-subtitle">{t("tickets_management.subtitle")}</p>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="filters-card">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Filter className="w-5 h-5 mr-2" />
{t("tickets_management.filters_title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="filters-grid">
            {/* Búsqueda */}
            <div className="search-container">
              <Search className="search-icon" />
              <Input
                placeholder={t("tickets.search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Estado */}
            <div className="filter-group">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="filter-select">
                  <SelectValue placeholder={t("filters.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("tickets_management.all_statuses")}</SelectItem>
                  <SelectItem value="pendiente">{t("dashboard.status.pending")}</SelectItem>
                  <SelectItem value="asignado">{t("dashboard.status.assigned")}</SelectItem>
                  <SelectItem value="escalado">{t("dashboard.status.escalated")}</SelectItem>
                  <SelectItem value="resuelto">{t("dashboard.status.resolved")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prioridad */}
            <div className="filter-group">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="filter-select">
                  <SelectValue placeholder={t("filters.priority")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.priority")}</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Técnico */}
            <div className="filter-group">
              <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
                <SelectTrigger className="filter-select">
                  <SelectValue placeholder={t("filters.technician")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.technician")}</SelectItem>
                  <SelectItem value="w@s.com">w@s.com</SelectItem>
                  <SelectItem value="w@s.comassa">w@s.comassa</SelectItem>
                  <SelectItem value="marketing@empresa.com">marketing@empresa.com</SelectItem>
                  <SelectItem value="ventas@empresa.com">ventas@empresa.com</SelectItem>
                  <SelectItem value="soporte@empresa.com">soporte@empresa.com</SelectItem>
                  <SelectItem value="ops@empresa.com">ops@empresa.com</SelectItem>
                  <SelectItem value="legal@empresa.com">legal@empresa.com</SelectItem>
                  <SelectItem value="it@empresa.com">it@empresa.com</SelectItem>
                  <SelectItem value="innovacion@empresa.com">innovacion@empresa.com</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("tickets_management.total_tickets")}</p>
                <p className="text-2xl font-bold text-foreground">{tickets.length}</p>
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
                <p className="text-sm font-medium text-muted-foreground">{t("tickets_management.pending")}</p>
                <p className="text-2xl font-bold text-foreground">
                  {tickets.filter(t => t.estado === 'PENDIENTE').length}
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
                <p className="text-sm font-medium text-muted-foreground">{t("tickets_management.assigned")}</p>
                <p className="text-2xl font-bold text-foreground">
                  {tickets.filter(t => t.estado === 'ASIGNADO' || t.estado === 'ESCALADO').length}
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
                <p className="text-sm font-medium text-muted-foreground">{t("tickets_management.resolved")}</p>
                <p className="text-2xl font-bold text-foreground">
                  {tickets.filter(t => t.estado === 'RESUELTO' || t.estado === 'CERRADO' || t.estado === 'TERMINADO').length}
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
        {paginatedTickets.map((ticket) => (
          <Card key={ticket.id} className="group hover:shadow-xl transition-all duration-300 border border-border bg-card overflow-hidden h-full flex flex-col">
            <CardContent className="p-6 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg leading-tight line-clamp-2">
                      {ticket.asunto}
                    </h3>
                    <p className="text-sm text-muted-foreground">#{ticket.id}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              {/* Badge de categoría solamente */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={`${getCategoryColor(ticket.categoria)} font-semibold px-3 py-1 rounded-full`}>
                  <Tag className="w-3 h-3 mr-1" />
                  {ticket.categoria}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {processTicketDescription(ticket.descripcion)}
              </p>

              {/* Info */}
              <div className="space-y-2 mb-4 flex-grow">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span><strong>{t("tickets_management.requester")}:</strong> {ticket.creadorNombre || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span><strong>{t("tickets_management.technician")}:</strong> {
                    ticket.tecnicoNombre || (ticket.tecnicoEmail ? (() => {
                      const tecnico = tecnicos.find(t => t.email === ticket.tecnicoEmail);
                      return tecnico ? `${tecnico.nombre} ${tecnico.apellido || ''}`.trim() : ticket.tecnicoEmail;
                    })() : 'Sin asignar')
                  }</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span><strong>{t("tickets_management.date")}:</strong> {ticket.fechaCreacion ? new Date(ticket.fechaCreacion).toLocaleDateString('es-ES') : 'N/A'}</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 pt-4 border-t">
                {/* Siempre mostrar Ver */}
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={() => handleViewTicket(ticket)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
{t("tickets_management.view")}
                </Button>

                {/* Segundo espacio: Finalizado si está cerrado/terminado; si no, Asignar/Escalar */}
                {(ticket.estado === 'CERRADO' || ticket.estado === 'TERMINADO') ? (
                  <div className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-white bg-green-600 rounded-md h-9 text-center font-medium">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Finalizado
                  </div>
                ) : (
                  !ticket.tecnicoEmail ? (
                    <Button 
                      size="sm" 
                      onClick={() => handleAssignTicket(ticket)}
                      className="flex-1"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      {t("tickets.assign")}
                    </Button>
                  ) : (
                    // Verificar si ya se escaló (solo una escalación por ticket)
                    ticket.historialAsignaciones?.some(asignacion => asignacion.tipoOperacion === 'ESCALAMIENTO') ? (
                      <div className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-muted-foreground bg-muted rounded-md h-9 text-center">
                        <Eye className="w-4 h-4 mr-1" />
{t("tickets_management.already_escalated")}
                      </div>
                    ) : (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleEscalateTicket(ticket)}
                        className="flex-1"
                      >
                        <ArrowUp className="w-4 h-4 mr-1" />
                        {t("tickets.escalate")}
                      </Button>
                    )
                  )
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
{t("pagination.showing")} {startIndex + 1} {t("pagination.to")} {Math.min(endIndex, filteredTickets.length)} {t("pagination.of")} {filteredTickets.length} {t("pagination.tickets")}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
{t("pagination.previous")}
                </Button>
                
                {/* Números de página */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
{t("pagination.next")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {filteredTickets.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No se encontraron tickets</h3>
            <p className="text-muted-foreground">Intenta ajustar los filtros de búsqueda</p>
          </CardContent>
        </Card>
      )}

      {/* Modal de Ver Ticket */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Detalles del Ticket #{selectedTicket.id}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowTicketModal(false)}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Información del ticket */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Asunto</label>
                  <p className="text-foreground">{selectedTicket.asunto}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estado</label>
                  <div className="mt-1">{getStatusBadge(selectedTicket.estado)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Prioridad</label>
                  <div className="mt-1">{getPriorityBadge(selectedTicket.prioridad)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Solicitante</label>
                  <p className="text-foreground">{selectedTicket.solicitante}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha</label>
                  <p className="text-foreground">{selectedTicket.fechaCreacion}</p>
                </div>
                {selectedTicket.tecnicoEmail && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Técnico</label>
                    <p className="text-foreground">{
                      (() => {
                        const tecnico = tecnicos.find(t => t.email === selectedTicket.tecnicoEmail);
                        if (tecnico) {
                          const nombre = buildTechnicianName(tecnico);
                          return nombre || tecnico.email;
                        }
                        const nombreTicket = buildTechnicianName({ nombre: selectedTicket.tecnicoNombre });
                        return nombreTicket || selectedTicket.tecnicoEmail || 'Sin asignar';
                      })()
                    }</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                <p className="text-foreground mt-1">{selectedTicket.descripcion}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Asignar Ticket */}
      {showAssignModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Asignar Ticket #{selectedTicket.id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Seleccionar Técnico</label>
                <Select value={selectedTecnico} onValueChange={setSelectedTecnico}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona un técnico" />
                  </SelectTrigger>
                  <SelectContent>
                    {tecnicos
                      .filter(tecnico => tecnico.id != null && tecnico.id !== undefined && tecnico.id !== '') // Filtrar técnicos sin ID válido
                      .map((tecnico) => (
                        <SelectItem key={tecnico.id} value={tecnico.id.toString()}>
                          {tecnico.nombre} {tecnico.apellido || ''}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              {!showAssignSuccess ? (
                <div className="flex space-x-2">
                  <Button 
                    className="flex-1" 
                    onClick={confirmAssign}
                    disabled={!selectedTecnico || isLoading}
                  >
                    {isLoading ? "Asignando..." : "Asignar"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowAssignModal(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">{t('tickets.history.ticket_assigned_success')}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      className="flex-1" 
                      onClick={() => {
                        setShowAssignModal(false);
                        setShowAssignSuccess(false);
                      }}
                    >
                      Cerrar
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setShowAssignSuccess(false);
                        setSelectedTecnico("");
                      }}
                    >
                      {t("tickets.assign")} Otro
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Escalar Ticket */}
      {showEscalateModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Escalar Ticket #{selectedTicket.id}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Asignar a otro técnico excluyendo al técnico actual
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Seleccionar Nuevo Técnico</label>
                <Select value={selectedTecnico} onValueChange={setSelectedTecnico}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona un técnico diferente" />
                  </SelectTrigger>
                  <SelectContent>
                    {tecnicos
                      .filter(tecnico => {
                        // Excluir técnico actual por ID o por email
                        const isCurrentTechnician = tecnico.email === selectedTicket.tecnicoEmail;
                        return !isCurrentTechnician;
                      })
                      .map((tecnico) => (
                      <SelectItem key={tecnico.id} value={tecnico.id.toString()}>
                        {tecnico.nombre} {tecnico.apellido || ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedTicket.tecnicoEmail && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>Técnico actual:</strong> {
                      (() => {
                        const currentTechnician = tecnicos.find(t => 
                          t.email === selectedTicket.tecnicoEmail
                        );
                        return currentTechnician 
                          ? `${currentTechnician.nombre} ${currentTechnician.apellido || ''}`
                          : selectedTicket.tecnicoEmail;
                      })()
                    }
                  </p>
                </div>
              )}
              {!showEscalateSuccess ? (
                <div className="flex space-x-2">
                  <Button 
                    className="flex-1" 
                    onClick={confirmEscalate}
                    disabled={!selectedTecnico || isLoading}
                  >
                    {isLoading ? "Escalando..." : "Escalar"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setShowEscalateModal(false);
                      setShowEscalateSuccess(false); // Resetear el estado de éxito
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-orange-600">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">¡Ticket escalado exitosamente!</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      className="flex-1" 
                      onClick={() => {
                        setShowEscalateModal(false);
                        setShowEscalateSuccess(false);
                      }}
                    >
                      Cerrar
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setShowEscalateSuccess(false);
                        setSelectedTecnico("");
                      }}
                    >
                      {t("tickets.escalate")} Otro
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Ver Ticket - COMPLETO COMO SEGUIMIENTO */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-6xl max-h-[95vh] overflow-hidden">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Ticket #{selectedTicket.id}</CardTitle>
                  <p className="text-sm text-muted-foreground">{selectedTicket.asunto}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowTicketModal(false)}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <div className="flex h-[80vh]">
              {/* Panel Izquierdo - Información */}
              <div className="w-1/3 border-r p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Información del Ticket */}
                  <div>
                    <h3 className="font-semibold mb-3">{t('ticket_detail.info_section_title')}</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">{t('ticket_detail.requester')}:</label>
                        <p className="text-sm">{selectedTicket.creadorNombre || selectedTicket.nombre || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">{t('common.status')}:</label>
                        <div className="mt-1">{getStatusBadge(selectedTicket.estado)}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">{t('common.priority')}:</label>
                        <div className="mt-1">{getPriorityBadge(selectedTicket.prioridad)}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">{t('common.date')}:</label>
                        <p className="text-sm">{selectedTicket.fechaCreacion}</p>
                      </div>
                      {selectedTicket.tecnicoEmail && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">{t('ticket_detail.technician')}:</label>
                          <p className="text-sm">{
                            (() => {
                              const tecnico = tecnicos.find(t => t.email === selectedTicket.tecnicoEmail);
                              if (tecnico) {
                                const nombre = buildTechnicianName(tecnico);
                                return nombre || tecnico.email;
                              }
                              const nombreTicket = buildTechnicianName({ nombre: selectedTicket.tecnicoNombre });
                              return nombreTicket || selectedTicket.tecnicoEmail || 'Sin asignar';
                            })()
                          }</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Descripción */}
                  <div>
                    <h3 className="font-semibold mb-3">{t('common.description')}</h3>
                    <p className="text-sm text-muted-foreground">{processTicketDescription(selectedTicket.descripcion)}</p>
                  </div>
                </div>
              </div>

              {/* Panel Derecho - Tabs */}
              <div className="w-2/3 flex flex-col">
                {/* Tabs */}
                <div className="border-b">
                  <div className="flex">
                    <button
                      className={`px-4 py-3 text-sm font-medium border-b-2 ${
                        activeTab === 'info' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setActiveTab('info')}
                    >
{t('ticket_detail.tab_info')}
                    </button>
                    <button
                      className={`px-4 py-3 text-sm font-medium border-b-2 ${
                        activeTab === 'historial' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setActiveTab('historial')}
                    >
                      {t('ticket_detail.tab_history')}
                    </button>
                    <button
                      className={`px-4 py-3 text-sm font-medium border-b-2 ${
                        activeTab === 'chat' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setActiveTab('chat')}
                    >
                      {t('ticket_detail.tab_chat')}
                    </button>
                    <button
                      className={`px-4 py-3 text-sm font-medium border-b-2 ${
                        activeTab === 'evidencias' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setActiveTab('evidencias')}
                    >
                      {t('ticket_detail.tab_evidence')}
                    </button>
                  </div>
                </div>

                {/* Contenido de Tabs */}
                <div className="flex-1 overflow-y-auto">
                  {activeTab === 'info' && (
                    <div className="p-6">
                      <h3 className="font-semibold mb-4">{t('ticket_detail.ticket_details')}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">{t('ticket_detail.id')}:</label>
                          <p className="text-sm">#{selectedTicket.id}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">{t('common.category')}:</label>
                          <p className="text-sm">{selectedTicket.categoria || 'General'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">{t('ticket_detail.estimated_time')}:</label>
                          <p className="text-sm">{selectedTicket.tiempoEstimado || t('tickets.table.not_specified')}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">{t('ticket_detail.last_update')}:</label>
                          <p className="text-sm">{selectedTicket.fechaCreacion}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'historial' && (
                    <div className="p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
{t('ticket_detail.activity_history')}
                      </h3>
                      
                      {isLoadingHistory ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center">
                            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                            <p className="text-muted-foreground">{t('ticket_detail.loading_history')}</p>
                          </div>
                        </div>
                      ) : historial.length === 0 ? (
                        <div className="text-center py-8">
                          <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-muted-foreground">{t('ticket_detail.no_history_available')}</p>
                        </div>
                      ) : (
                      <div className="space-y-4">
                          {historial.map((item, index) => (
                            <div key={item.id} className="flex items-start space-x-4 p-4 bg-muted/50 rounded-lg border border-border">
                              <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                                item.accion === t('tickets.history.ticket_created_action') ? 'bg-blue-500' :
                                item.accion === 'Asignado' || item.accion === t('tickets.history.ticket_assigned_action') ? 'bg-green-500' :
                                item.accion === 'Escalado' || item.accion === 'Ticket escalado' ? 'bg-orange-500' :
                                item.accion === 'Reasignado' ? 'bg-purple-500' :
                                'bg-gray-500'
                              }`}></div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-medium text-sm text-foreground">{item.accion}</p>
                                <p className="text-xs text-muted-foreground">{item.fecha}</p>
                              </div>
                                <p className="text-sm text-muted-foreground mb-1">{item.descripcion}</p>
                                <p className="text-xs text-muted-foreground">
                                  <User className="w-3 h-3 inline mr-1" />
{t('ticket_detail.by')}: {item.usuario}
                                </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'chat' && (
                    <div className="flex flex-col h-full">
                      {/* Header con indicador de tiempo real */}
                      <div className="border-b p-3 bg-muted/30">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{t('ticket_detail.real_time_chat')}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-600 font-medium">
                              {currentTicketId ? t('ticket_detail.updating_every_3s', { ticketId: currentTicketId }) : t('ticket_detail.connecting')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mensajes */}
                      <div className="flex-1 p-6 overflow-y-auto space-y-4">
                        {mensajes.length === 0 ? (
                          <div className="text-center text-sm text-muted-foreground py-8">
                            <div className="animate-pulse">🔄 {t('ticket_detail.loading_real_time_messages')}</div>
                          </div>
                        ) : (
                          mensajes.map((mensaje) => (
                            <div
                              key={mensaje.id}
                              className={`flex ${mensaje.esCliente ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[70%] p-3 rounded-lg ${
                                  mensaje.esCliente
                                    ? 'bg-blue-500 text-white' // Cliente: azul a la derecha
                                    : 'bg-gray-200 text-gray-800' // Técnico: gris a la izquierda
                                }`}
                              >
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-xs font-medium">
                                    {mensaje.esCliente ? 'Solicitante' : 'Técnico'}
                                  </span>
                                  <span className="text-xs opacity-75">{mensaje.autor}</span>
                                </div>
                                <p className="text-sm">{mensaje.mensaje}</p>
                                <p className="text-xs opacity-75 mt-1">{mensaje.fecha}</p>
                              </div>
                            </div>
                          ))
                        )}
                        {/* Referencia para auto-scroll */}
                        <div ref={chatEndRef} />
                      </div>
                      
                      {/* El administrador solo visualiza, no envía mensajes */}
                      <div className="border-t p-4 bg-muted/30">
                        <div className="flex items-center justify-center text-sm text-muted-foreground">
                          <Eye className="w-4 h-4 mr-2" />
                          Solo visualización - El administrador no puede enviar mensajes
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'evidencias' && (
                    <div className="p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {t('ticket_detail.evidences_title')}
                      </h3>
                      
                      {/* Tabs de categorías de evidencias */}
                      <div className="flex space-x-1 mb-4">
                        <button
                          className={`px-4 py-2 text-sm font-medium rounded-lg ${
                            activeEvidenceTab === 'chat' 
                              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          onClick={() => setActiveEvidenceTab('chat')}
                        >
                          💬 {t('ticket_detail.chat_evidences')} ({evidenciasChat.length})
                        </button>
                        <button
                          className={`px-4 py-2 text-sm font-medium rounded-lg ${
                            activeEvidenceTab === 'finales' 
                              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          onClick={() => setActiveEvidenceTab('finales')}
                        >
                          📋 {t('ticket_detail.final_evidences')} ({evidenciasFinales.length})
                        </button>
                      </div>

                      {isLoadingEvidencias ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center">
                            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                            <p className="text-sm text-muted-foreground">{t('ticket_detail.loading_evidence')}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {(() => {
                            const evidenciasActuales = activeEvidenceTab === 'chat' ? evidenciasChat : evidenciasFinales;
                            
                            if (evidenciasActuales.length === 0) {
                              return (
                                <div className="text-center py-12">
                                  <div className="text-6xl mb-4">
                                    {activeEvidenceTab === 'chat' ? '💬' : '📋'}
                                  </div>
                                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                                    {activeEvidenceTab === 'chat' 
                                      ? t('ticket_detail.no_chat_files')
                                      : t('ticket_detail.no_final_evidence')}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {activeEvidenceTab === 'chat'
                                      ? t('ticket_detail.chat_files_will_appear_here')
                                      : t('ticket_detail.final_evidence_will_appear_here')}
                                  </p>
                                </div>
                              );
                            }

                            return evidenciasActuales.map((evidencia, index) => (
                              <div key={evidencia.id || evidencia.idEvidencia || evidencia.idArchivo || index} 
                                   className="border rounded-lg p-4 hover:bg-gray-50">
                                <div className="flex items-start space-x-4">
                                  {/* Icono del archivo */}
                                  <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                      <span className="text-2xl">
                                        {(() => {
                                          const extension = evidencia.extensionArchivo || evidencia.nombreArchivo?.split('.').pop()?.toLowerCase();
                                          if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return '🖼️';
                                          if (['pdf'].includes(extension)) return '📄';
                                          if (['doc', 'docx'].includes(extension)) return '📝';
                                          if (['xls', 'xlsx'].includes(extension)) return '📊';
                                          if (['zip', 'rar', '7z'].includes(extension)) return '📦';
                                          return '📎';
                                        })()}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Información del archivo */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                      {evidencia.nombreArchivo || evidencia.nombre || t('ticket_detail.unnamed_file')}
                                    </h4>
                                    {(evidencia.descripcion || evidencia.comentario) && (
                                      <p className="text-sm text-gray-500 mt-1">
                                        {evidencia.descripcion || evidencia.comentario}
                                      </p>
                                    )}
                                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                      <span>👤 {evidencia.subidoPorNombre || evidencia.subidoPor || t('common.user')}</span>
                                      <span>📅 {new Date(evidencia.fechaSubida || evidencia.fechaCreacion || new Date()).toLocaleDateString()}</span>
                                      {evidencia.tamanioArchivo && (
                                        <span>💾 {evidencia.tamanioFormateado || evidencia.tamanioArchivo}</span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Acciones */}
                                  <div className="flex space-x-2">
                                    {(() => {
                                      const extension = evidencia.extensionArchivo || evidencia.nombreArchivo?.split('.').pop()?.toLowerCase();
                                      const sePuedePrevisualizar = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'].includes(extension);
                                      
                                      return (
                                        <>
                                          {sePuedePrevisualizar && (
                                            <button
                                              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                              onClick={() => handlePreview(evidencia)}
                                            >
                                              👁️ {t('common.view')}
                                            </button>
                                          )}
                                          <button
                                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                            onClick={() => {
                                              const url = evidencia.urlArchivo || evidencia.url;
                                              if (url) {
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.download = evidencia.nombreArchivo || evidencia.nombre || 'archivo';
                                                link.click();
                                              }
                                            }}
                                          >
                                            📥 {t('common.download')}
                                          </button>
                                        </>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de Asignar Ticket */}
      {showAssignModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Asignar Ticket #{selectedTicket.id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Seleccionar Técnico:</label>
                <Select value={selectedTecnico} onValueChange={setSelectedTecnico}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona un técnico" />
                  </SelectTrigger>
                  <SelectContent>
                    {tecnicos
                      .filter(tecnico => tecnico.id != null && tecnico.id !== undefined && tecnico.id !== '') // Filtrar técnicos sin ID válido
                      .map((tecnico) => (
                        <SelectItem key={tecnico.id} value={tecnico.id.toString()}>
                          {tecnico.nombre} {tecnico.apellido || ''}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  className="flex-1"
                  onClick={confirmAssign}
                  disabled={!selectedTecnico}
                >
                  Asignar
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de previsualización */}
      {showPreview && previewUrl && archivoPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                {getFileIcon(archivoPreview.tipoMime || archivoPreview.tipoArchivo || '')}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {archivoPreview.nombreArchivo || archivoPreview.nombre || 'Archivo'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {archivoPreview.tamanioFormateado || (archivoPreview.tamanioArchivo ? formatFileSize(archivoPreview.tamanioArchivo) : '')} • 
                    {(archivoPreview.extensionArchivo || archivoPreview.nombreArchivo?.split('.').pop() || '').toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    const url = archivoPreview.urlArchivo || archivoPreview.url;
                    if (url) {
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = archivoPreview.nombreArchivo || archivoPreview.nombre || 'archivo';
                      link.click();
                    }
                  }}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Descargar
                </Button>
                <Button
                  onClick={closePreview}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Contenido de previsualización */}
            <div className="flex-1 p-4 overflow-auto">
              {(() => {
                const extension = archivoPreview.extensionArchivo || archivoPreview.nombreArchivo?.split('.').pop()?.toLowerCase();
                const esImagen = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
                const esPDF = extension === 'pdf';
                
                if (esImagen) {
                  return (
                    <div className="flex justify-center">
                      <img
                        src={previewUrl}
                        alt={archivoPreview.nombreArchivo || archivoPreview.nombre}
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    </div>
                  );
                } else if (esPDF) {
                  return (
                    <div className="w-full h-full">
                      <iframe
                        src={previewUrl}
                        className="w-full h-full min-h-[500px] border-0 rounded-lg"
                        title={archivoPreview.nombreArchivo || archivoPreview.nombre}
                      />
                    </div>
                  );
                } else {
                  return (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">Previsualización no disponible para este tipo de archivo</p>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

































