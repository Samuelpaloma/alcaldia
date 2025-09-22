import { api, TicketResponseDTO, TicketRequestDTO, HistorialTicketResponseDTO } from '@shared/api';

export type TicketStatus = "open" | "in_progress" | "pending" | "resolved" | "closed";
export type Priority = "high" | "medium" | "low";

// Adaptador para convertir TicketResponseDTO a Ticket del frontend
export type Ticket = {
  id: string;
  name: string;
  location: string;
  message: string;
  priority: Priority;
  attachmentName?: string;
  status: TicketStatus;
  technician: string;
  createdAt: string;
  closedAt?: string;
  events: TicketEvent[];
};

export type TicketEvent = { 
  at: string; 
  author: "client" | "technician" | "system"; 
  message: string; 
  type: "comment" | "status" 
};

// Estado global
let tickets: Ticket[] = [];
let isLoading = false;
let error: string | null = null;
const listeners = new Set<() => void>();

// Funciones de notificación
function notify() {
  listeners.forEach((fn) => fn());
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getTickets() {
  return tickets.slice();
}

export function getTicket(id: string) {
  return tickets.find(t => t.id === id) || null;
}

export function getLoadingState() {
  return { isLoading, error };
}

// Función para convertir TicketResponseDTO a Ticket
function convertToTicket(dto: TicketResponseDTO): Ticket {
  return {
    id: dto.id.toString(),
    name: dto.creador?.nombre || 'Usuario',
    location: dto.ubicacion,
    message: dto.consulta || dto.categoria,
    priority: dto.prioridad,
    attachmentName: dto.nombreArchivo,
    status: dto.estado as TicketStatus,
    technician: dto.tecnicoAsignado?.nombre || 'Sin asignar',
    createdAt: dto.fechaCreacion,
    closedAt: dto.estado === 'closed' ? dto.fechaActualizacion : undefined,
    events: [
      {
        at: dto.fechaCreacion,
        author: "system",
        message: "Ticket creado",
        type: "status"
      },
      ...(dto.tecnicoAsignado ? [{
        at: dto.fechaCreacion,
        author: "system" as const,
        message: `Asignado a ${dto.tecnicoAsignado.nombre}`,
        type: "status" as const
      }] : [])
    ]
  };
}

// Función para convertir TicketRequestDTO desde el frontend
function convertToRequestDTO(input: {
  name: string;
  location: string;
  message: string;
  subject?: string;
  category?: string;
  priority: Priority;
  attachmentName?: string;
}): TicketRequestDTO {
  // Mapear categorías de texto a IDs numéricos basado en la base de datos
  const categoryMap: { [key: string]: number } = {
    "Atención al Ciudadano": 1,
    "Quejas y Reclamos": 2,
    "Solicitudes": 3,
    "General": 4,
    "Administración y Gestión": 5,
    "Contabilidad": 6,
    "Recursos Humanos": 7,
    "Gestión Documental": 8,
    "Tecnología e IT": 9,
    "Sistemas de Información": 10,
    "Redes y Comunicaciones": 11,
    "Desarrollo de Software": 12,
    "Infraestructura y Mantenimiento": 13,
    "Mantenimiento": 14,
    "Servicios Generales": 15,
    "Hardware": 16,
    "Software": 17,
    "Redes": 18,
    "Soporte Técnico": 19
  };
  
  // Obtener el ID de la categoría seleccionada o usar 1 por defecto
  const categoriaId = input.category ? categoryMap[input.category] || 1 : 1;
  
  return {
    ubicacion: input.location,
    consulta: input.message,
    categoriaId: categoriaId, // Usar el ID correcto de la categoría seleccionada
    prioridad: input.priority,
    nombreArchivo: input.attachmentName
  };
}

// Cargar tickets desde el backend
export async function loadTickets() {
  if (isLoading) return;
  
  isLoading = true;
  error = null;
  notify();

  try {
    // Recargar token antes de hacer la petición
    api.reloadToken();
    
    const response = await api.getHistorialTickets(0, 100); // Cargar los primeros 100 tickets
    tickets = response.content.map(convertToTicket);
    notify();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Error al cargar tickets';
    console.error('Error loading tickets:', err);
    notify();
  } finally {
    isLoading = false;
    notify();
  }
}

// Crear ticket usando la API real
export async function createTicket(input: {
  name: string;
  location: string;
  message: string;
  subject?: string;
  category?: string;
  priority: Priority;
  attachmentName?: string;
}): Promise<Ticket> {
  isLoading = true;
  error = null;
  notify();

  try {
    const requestData = convertToRequestDTO(input);
    const response = await api.createTicket(requestData);
    
    // Crear un ticket temporal hasta que se actualice la lista
    const tempTicket: Ticket = {
      id: response.id.toString(),
      name: input.name,
      location: input.location,
      message: input.message,
      priority: input.priority,
      attachmentName: input.attachmentName,
      status: "open",
      technician: "Sin asignar",
      createdAt: new Date().toISOString(),
      events: [
        {
          at: new Date().toISOString(),
          author: "system",
          message: "Ticket creado",
          type: "status"
        }
      ]
    };

    tickets = [tempTicket, ...tickets];
    notify();

    // Recargar la lista para obtener el ticket real del backend
    await loadTickets();
    
    return tempTicket;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Error al crear ticket';
    console.error('Error creating ticket:', err);
    notify();
    throw err;
  } finally {
    isLoading = false;
    notify();
  }
}

// Reabrir ticket
export async function reopenTicket(id: string) {
  const ticket = getTicket(id);
  if (!ticket) return;

  try {
    // Actualizar el estado local
    ticket.status = "open";
    ticket.closedAt = undefined;
    ticket.events.push({
      at: new Date().toISOString(),
      author: "client",
      message: "Ticket reabierto por el cliente",
      type: "status"
    });
    
    notify();
    
    // Aquí podrías agregar una llamada a la API para reabrir el ticket
    // await api.reopenTicket(parseInt(id));
    
  } catch (err) {
    error = err instanceof Error ? err.message : 'Error al reabrir ticket';
    console.error('Error reopening ticket:', err);
    notify();
  }
}

// Agregar comentario
export function addComment(id: string, author: TicketEvent["author"], message: string) {
  const ticket = getTicket(id);
  if (!ticket) return;
  
  ticket.events.push({
    at: new Date().toISOString(),
    author,
    message,
    type: "comment"
  });
  
  notify();
}

// Cambiar estado
export function changeStatus(id: string, status: TicketStatus, message?: string) {
  const ticket = getTicket(id);
  if (!ticket) return;
  
  ticket.status = status;
  if (status === "closed") {
    ticket.closedAt = new Date().toISOString();
  }
  
  if (message) {
    ticket.events.push({
      at: new Date().toISOString(),
      author: "system",
      message,
      type: "status"
    });
  }
  
  notify();
}

// Los tickets se cargarán cuando el usuario esté autenticado
