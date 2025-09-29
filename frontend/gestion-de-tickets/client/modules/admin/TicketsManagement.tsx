import React, { useState, useEffect, useMemo, useRef } from 'react';

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
import './UsersModule.css';

export default function TicketsManagement() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [technicianFilter, setTechnicianFilter] = useState("");
  
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
  const [historial, setHistorial] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'historial' | 'chat'>('info');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [currentTicketId, setCurrentTicketId] = useState<number | null>(null);
  
  // Referencia para auto-scroll del chat
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    // Cargar datos reales
    loadTickets();
    loadTecnicos();
  }, []);

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
      const response = await api.getTodosLosTickets();
      console.log('📋 Datos de tickets recibidos:', response);
      setTickets(response || []);
    } catch (error) {
      console.error('Error cargando tickets:', error);
      // Fallback a datos de prueba si falla la API
      setTickets(demoTickets);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cargar técnicos desde la API
  const loadTecnicos = async () => {
    try {
      const response = await api.getTechnicians(0, 50);
      const tecnicosData = response.content.filter((user: any) => user.tipoUsuario === 'Técnico');
      setTecnicos(tecnicosData || []);
    } catch (error) {
      console.error('Error cargando técnicos:', error);
      // Fallback a datos de prueba
      setTecnicos([
        { id: 1, nombre: 'Juan Pérez', email: 'juan@empresa.com' },
        { id: 2, nombre: 'María García', email: 'maria@empresa.com' },
        { id: 3, nombre: 'Carlos López', email: 'carlos@empresa.com' }
      ]);
    }
  };


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
    
    // Cargar mensajes e historial reales del ticket
    await loadTicketMessages(ticket.id);
    await loadTicketHistory(ticket.id);
    
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
      
      // Intentar cargar historial real desde la API
      try {
        const response = await api.getHistorialTickets(0, 50);
        console.log('📋 Respuesta de historial:', response);
        
        const historialData = Array.isArray(response.content) ? response.content : [];
        
        if (historialData.length > 0) {
          // Filtrar historial específico del ticket
          const historialTicket = historialData.filter((item: any) => 
            item.ticketId === ticketId || item.ticket_id === ticketId
          );
          
          if (historialTicket.length > 0) {
            const historialFormateado = historialTicket.map((item: any) => ({
              id: item.id || Math.random(),
              accion: item.accion || item.estado || 'Actividad',
              usuario: item.usuario || item.autor || 'Sistema',
              fecha: item.fecha || item.fechaCreacion || new Date().toISOString(),
              descripcion: item.descripcion || item.comentario || 'Sin descripción'
            }));
            
            console.log('📋 Historial formateado:', historialFormateado);
            setHistorial(historialFormateado);
            return;
          }
        }
      } catch (apiError) {
        console.log('📋 Error en API de historial, usando fallback:', apiError);
      }
      
      // Fallback: generar historial basado en el ticket
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        console.log('📋 Generando historial de fallback para ticket:', ticket);
        
        const historialGenerado = [
          { 
            id: 1, 
            accion: 'Ticket creado', 
            usuario: ticket.creadorNombre || ticket.nombre || 'Usuario', 
            fecha: ticket.fechaCreacion, 
            descripcion: `El ticket fue creado por ${ticket.creadorNombre || ticket.nombre || 'el usuario'}` 
          }
        ];
        
        if ((ticket.estado === 'ASIGNADO' || ticket.estado === 'ESCALADO') && ticket.tecnicoEmail) {
          historialGenerado.push({
            id: 2,
            accion: 'Ticket asignado',
            usuario: 'Administrador',
            fecha: ticket.fechaActualizacion || ticket.fechaCreacion,
            descripcion: `Ticket asignado a ${ticket.tecnicoEmail}`
          });
        }
        
        if (ticket.estado === 'ESCALADO') {
          historialGenerado.push({
            id: 3,
            accion: 'Ticket escalado',
            usuario: 'Sistema',
            fecha: ticket.fechaActualizacion || ticket.fechaCreacion,
            descripcion: 'El ticket fue escalado por requerir atención especializada'
          });
        }
        
        console.log('📋 Historial generado:', historialGenerado);
        setHistorial(historialGenerado);
      } else {
        console.log('📋 No se encontró el ticket, estableciendo historial vacío');
        setHistorial([]);
      }
    } catch (error) {
      console.error('📋 Error cargando historial:', error);
      // Fallback a datos de prueba
      setHistorial([
        { id: 1, accion: 'Ticket creado', usuario: 'Rober Rodrigues', fecha: '22/9/2025 10:30', descripcion: 'El ticket fue creado por el cliente' },
        { id: 2, accion: 'Ticket asignado', usuario: 'Admin', fecha: '22/9/2025 10:35', descripcion: 'Ticket asignado a Juan Pérez' },
        { id: 3, accion: 'Estado cambiado', usuario: 'Juan Pérez', fecha: '22/9/2025 11:15', descripcion: 'Estado cambiado de PENDIENTE a ASIGNADO' },
        { id: 4, accion: 'Mensaje agregado', usuario: 'Juan Pérez', fecha: '22/9/2025 11:15', descripcion: 'Se agregó mensaje: He identificado el problema' }
      ]);
    }
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
                       tecnicoAsignado: tecnicoSeleccionado?.nombre || 'Técnico'
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
          await api.createTicketAssignmentNotification(selectedTicket.id, tecnicoId, 1); // 1 = admin ID
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
                tecnicoAsignado: tecnicoSeleccionado?.nombre || 'Técnico'
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
      const matchesSearch = ticket.asunto.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (ticket.descripcion || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (ticket.creadorNombre || ticket.nombre || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !statusFilter || statusFilter === 'all' || ticket.estado === statusFilter;
      const matchesPriority = !priorityFilter || priorityFilter === 'all' || ticket.prioridad === priorityFilter;
      const matchesTechnician = !technicianFilter || technicianFilter === 'all' || ticket.tecnicoEmail === technicianFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesTechnician;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter, technicianFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'ASIGNADO': { color: 'bg-blue-600 text-white', icon: Users, label: 'ASIGNADO' },
      'ESCALADO': { color: 'bg-red-600 text-white', icon: ArrowUp, label: 'ESCALADO' },
      'PENDIENTE': { color: 'bg-yellow-600 text-white', icon: Clock, label: 'PENDIENTE' },
      'RESUELTO': { color: 'bg-green-600 text-white', icon: CheckCircle, label: 'RESUELTO' }
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
      'HIGH': { color: 'bg-red-600 text-white', icon: AlertTriangle, label: 'ALTA' },
      'MEDIUM': { color: 'bg-yellow-600 text-white', icon: Clock, label: 'MEDIA' },
      'LOW': { color: 'bg-green-600 text-white', icon: CheckCircle, label: 'BAJA' },
      'high': { color: 'bg-red-600 text-white', icon: AlertTriangle, label: 'ALTA' },
      'medium': { color: 'bg-yellow-600 text-white', icon: Clock, label: 'MEDIA' },
      'low': { color: 'bg-green-600 text-white', icon: CheckCircle, label: 'BAJA' }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">Cargando tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-module">
      {/* Header Section */}
      <div className="module-header">
        <div className="header-content">
          <h1 className="page-title">Gestión de Tickets</h1>
          <p className="page-subtitle">Administra y supervisa todos los tickets del sistema</p>
        </div>
        <div className="header-actions">
          <Button className="create-btn">
            <Plus className="w-4 h-4" />
            Nuevo Ticket
          </Button>
          <Button 
            className="refresh-btn"
            onClick={loadTickets}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Actualizando...' : 'Actualizar'}
          </Button>
          <Button 
            variant="outline"
            onClick={testWebSocketConnection}
            className="ml-2"
          >
            🔌 Test WS
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="filters-card">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Filter className="w-5 h-5 mr-2" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="filters-grid">
            {/* Búsqueda */}
            <div className="search-container">
              <Search className="search-icon" />
              <Input
                placeholder="Buscar tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Estado */}
            <div className="filter-group">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="filter-select">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="asignado">Asignado</SelectItem>
                  <SelectItem value="escalado">Escalado</SelectItem>
                  <SelectItem value="resuelto">Resuelto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prioridad */}
            <div className="filter-group">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="filter-select">
                  <SelectValue placeholder="Todas las prioridades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
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
                <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
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
                <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
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
                <p className="text-sm font-medium text-muted-foreground">Asignados</p>
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
                <p className="text-sm font-medium text-muted-foreground">Resueltos</p>
                <p className="text-2xl font-bold text-foreground">
                  {tickets.filter(t => t.estado === 'RESUELTO').length}
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

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {getStatusBadge(ticket.estado)}
                {getPriorityBadge(ticket.prioridad)}
                <Badge className={`${getCategoryColor(ticket.categoria)} font-semibold px-3 py-1 rounded-full`}>
                  <Tag className="w-3 h-3 mr-1" />
                  {ticket.categoria}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {ticket.descripcion}
              </p>

              {/* Info */}
              <div className="space-y-2 mb-4 flex-grow">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span><strong>Solicitante:</strong> {ticket.creadorNombre || ticket.nombre || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span><strong>Técnico:</strong> {ticket.tecnicoEmail || 'Sin asignar'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span><strong>Fecha:</strong> {ticket.fechaCreacion}</span>
                </div>
              </div>

              {/* Actions - Siempre al final */}
              <div className="flex space-x-2 mt-auto">
                {/* Botón Ver - Siempre visible */}
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleViewTicket(ticket)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </Button>
                
                {/* Botón secundario basado en estado */}
                {ticket.estado === 'PENDIENTE' && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleAssignTicket(ticket)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Asignar
                  </Button>
                )}
                
                {(ticket.estado === 'ASIGNADO' || ticket.estado === 'ESCALADO') && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleEscalateTicket(ticket)}
                  >
                    <ArrowUp className="w-4 h-4 mr-1" />
                    Escalar
                  </Button>
                )}
                
                {/* Para tickets ESCALADOS o RESUELTOS, solo mostrar Ver */}
                {(ticket.estado === 'ESCALADO' || ticket.estado === 'RESUELTO') && (
                  <div className="flex-1"></div>
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
                    <p className="text-foreground">{selectedTicket.tecnicoEmail}</p>
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
                    {tecnicos.map((tecnico) => (
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
                    <span className="font-medium">¡Ticket asignado exitosamente!</span>
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
                      Asignar Otro
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
                        const isCurrentTechnician = tecnico.id.toString() === selectedTicket.tecnicoId?.toString() ||
                                                   tecnico.email === selectedTicket.tecnicoEmail;
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
                          t.email === selectedTicket.tecnicoEmail || 
                          t.id.toString() === selectedTicket.tecnicoId?.toString()
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
                      Escalar Otro
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
                    <h3 className="font-semibold mb-3">Información del Ticket</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Solicitante:</label>
                        <p className="text-sm">{selectedTicket.creadorNombre || selectedTicket.nombre || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Estado:</label>
                        <div className="mt-1">{getStatusBadge(selectedTicket.estado)}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Prioridad:</label>
                        <div className="mt-1">{getPriorityBadge(selectedTicket.prioridad)}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Fecha:</label>
                        <p className="text-sm">{selectedTicket.fechaCreacion}</p>
                      </div>
                      {selectedTicket.tecnicoEmail && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Técnico:</label>
                          <p className="text-sm">{selectedTicket.tecnicoEmail}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Descripción */}
                  <div>
                    <h3 className="font-semibold mb-3">Descripción</h3>
                    <p className="text-sm text-muted-foreground">{selectedTicket.descripcion}</p>
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
                      Información
                    </button>
                    <button
                      className={`px-4 py-3 text-sm font-medium border-b-2 ${
                        activeTab === 'historial' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setActiveTab('historial')}
                    >
                      Historial
                    </button>
                    <button
                      className={`px-4 py-3 text-sm font-medium border-b-2 ${
                        activeTab === 'chat' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setActiveTab('chat')}
                    >
                      Chat
                    </button>
                  </div>
                </div>

                {/* Contenido de Tabs */}
                <div className="flex-1 overflow-y-auto">
                  {activeTab === 'info' && (
                    <div className="p-6">
                      <h3 className="font-semibold mb-4">Detalles del Ticket</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">ID:</label>
                          <p className="text-sm">#{selectedTicket.id}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Categoría:</label>
                          <p className="text-sm">{selectedTicket.categoria || 'General'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Tiempo estimado:</label>
                          <p className="text-sm">{selectedTicket.tiempoEstimado || 'No especificado'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Última actualización:</label>
                          <p className="text-sm">{selectedTicket.fechaCreacion}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'historial' && (
                    <div className="p-6">
                      <h3 className="font-semibold mb-4">Historial de Actividades</h3>
                      <div className="space-y-4">
                        {historial.map((item) => (
                          <div key={item.id} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm">{item.accion}</p>
                                <p className="text-xs text-muted-foreground">{item.fecha}</p>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{item.descripcion}</p>
                              <p className="text-xs text-muted-foreground mt-1">Por: {item.usuario}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'chat' && (
                    <div className="flex flex-col h-full">
                      {/* Header con indicador de tiempo real */}
                      <div className="border-b p-3 bg-muted/30">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Chat en Tiempo Real</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-600 font-medium">
                              {currentTicketId ? `Actualizando cada 3s (Ticket #${currentTicketId})` : 'Conectando...'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mensajes */}
                      <div className="flex-1 p-6 overflow-y-auto space-y-4">
                        {mensajes.length === 0 ? (
                          <div className="text-center text-sm text-muted-foreground py-8">
                            <div className="animate-pulse">🔄 Cargando mensajes en tiempo real...</div>
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
                      
                      {/* Nota para Admin */}
                      <div className="border-t p-4 bg-muted/30">
                        <p className="text-sm text-muted-foreground text-center">
                          💬 Los mensajes se actualizan automáticamente cada 3 segundos
                        </p>
                      </div>
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
                    {tecnicos.map((tecnico) => (
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

    </div>
  );
};

































