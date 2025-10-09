import React, { useState, useEffect } from 'react';
import './Reports.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Calendar, 
  BarChart3, 
  PieChart,
  TrendingUp,
  Users,
  Clock,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  X
} from 'lucide-react';
import { api, EstadisticasReportes, ReporteMensual } from '../../../shared/api';
import { useI18n } from '../../i18n';
import { useTickets } from '@/hooks/use-tickets';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  id: number;
  nombre: string;
  tipo: string;
  fechaGeneracion: string;
  tamaño: string;
  descripcion: string;
}

const Reports: React.FC = () => {
  const { t } = useI18n();
  const { tickets, refreshTickets } = useTickets();
  const [allTickets, setAllTickets] = useState<any[]>([]);
  const [reportes, setReportes] = useState<ReportData[]>([]);
  const [reportesMensuales, setReportesMensuales] = useState<ReporteMensual[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasReportes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para el nuevo sistema de reportes por período
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    tipo: '',
    fecha: ''
  });

  const loadReportes = async () => {
    try {
      console.log('🔍 [REPORTS-FRONTEND] Iniciando carga de reportes');
      setLoading(true);
      setError(null);
      
      // Cargar estadísticas básicas desde la API (más eficiente)
      console.log('🔍 [REPORTS-FRONTEND] Solicitando estadísticas básicas al backend...');
      const estadisticasResponse = await api.getReportesEstadisticasBasicas();
      console.log('🔍 [REPORTS-FRONTEND] Respuesta de estadísticas básicas:', estadisticasResponse);
      
      if (estadisticasResponse.success) {
        console.log('🔍 [REPORTS-FRONTEND] Estadísticas básicas cargadas:', estadisticasResponse.data);
        
        // Convertir a formato EstadisticasReportes
        const estadisticasData: EstadisticasReportes = {
          totalTickets: estadisticasResponse.data.totalTickets,
          ticketsResueltos: estadisticasResponse.data.ticketsResueltos,
          ticketsPendientes: estadisticasResponse.data.ticketsPendientes,
          ticketsEnProceso: estadisticasResponse.data.ticketsEnProceso,
          tiempoPromedioResolucion: estadisticasResponse.data.tiempoPromedioResolucion,
          satisfaccionPromedio: estadisticasResponse.data.satisfaccionPromedio,
          ticketsPorCategoria: {}, // Se puede cargar por separado si es necesario
          ticketsPorTecnico: {}, // Se puede cargar por separado si es necesario
          tendenciaMensual: {} // Se puede cargar por separado si es necesario
        };
        
        setEstadisticas(estadisticasData);
      } else {
        throw new Error(estadisticasResponse.message);
      }

      // Cargar reportes mensuales desde la API
      console.log('🔍 [REPORTS-FRONTEND] Solicitando reportes mensuales al backend...');
      const reportesMensualesResponse = await api.getReportesMensuales(0, 10);
      console.log('🔍 [REPORTS-FRONTEND] Respuesta de reportes mensuales:', reportesMensualesResponse);
      
      if (reportesMensualesResponse.success) {
        console.log('🔍 [REPORTS-FRONTEND] Reportes mensuales cargados:', reportesMensualesResponse.data);
        setReportesMensuales(reportesMensualesResponse.data);
      } else {
        throw new Error(reportesMensualesResponse.message);
      }

      // Cargar reportes generales (mantener para compatibilidad)
      const reportesData: ReportData[] = [];
      setReportes(reportesData);
      console.log('🔍 [REPORTS-FRONTEND] Carga de reportes completada exitosamente');
    } catch (err) {
      console.error('🔍 [REPORTS-FRONTEND] Error cargando reportes:', err);
      setError('Error al cargar reportes: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setLoading(false);
      console.log('🔍 [REPORTS-FRONTEND] Estado de carga finalizado');
    }
  };

  useEffect(() => {
    loadReportes();
    loadAllTickets();
    loadSavedReports();
  }, []);

  // Función para cargar reportes guardados del localStorage
  const loadSavedReports = () => {
    try {
      const savedReportsData = localStorage.getItem('savedReports');
      if (savedReportsData) {
        const reports = JSON.parse(savedReportsData);
        setSavedReports(reports);
        console.log('🔍 [REPORTS-FRONTEND] Reportes guardados cargados:', reports.length);
      }
    } catch (error) {
      console.error('🔍 [REPORTS-FRONTEND] Error cargando reportes guardados:', error);
      setSavedReports([]);
    }
  };

  // Función para guardar reportes en localStorage
  const saveReportsToLocalStorage = (reports: any[]) => {
    try {
      localStorage.setItem('savedReports', JSON.stringify(reports));
      console.log('🔍 [REPORTS-FRONTEND] Reportes guardados en localStorage:', reports.length);
    } catch (error) {
      console.error('🔍 [REPORTS-FRONTEND] Error guardando reportes en localStorage:', error);
    }
  };

  // Función para cargar todos los tickets del sistema
  const loadAllTickets = async () => {
    try {
      console.log('🔍 [REPORTS-FRONTEND] Cargando todos los tickets del sistema...');
      
      // Intentar múltiples APIs para obtener todos los tickets
      const allTicketsData: any[] = [];
      
      try {
        // 1. Intentar con getTicketsHistory
        console.log('🔍 [REPORTS-FRONTEND] Intentando getTicketsHistory...');
        const response1 = await api.getTicketsHistory(0, 1000);
        console.log('🔍 [REPORTS-FRONTEND] getTicketsHistory devolvió:', response1.content.length, 'tickets');
        allTicketsData.push(...response1.content);
      } catch (err1) {
        console.warn('🔍 [REPORTS-FRONTEND] getTicketsHistory falló:', err1);
      }
      
      try {
        // 2. Intentar con tickets sin asignar (admin)
        console.log('🔍 [REPORTS-FRONTEND] Intentando getTicketsSinAsignarAdmin...');
        const response2 = await api.getTicketsSinAsignarAdmin();
        console.log('🔍 [REPORTS-FRONTEND] getTicketsSinAsignarAdmin devolvió:', response2.length, 'tickets');
        allTicketsData.push(...response2);
      } catch (err2) {
        console.warn('🔍 [REPORTS-FRONTEND] getTicketsSinAsignarAdmin falló:', err2);
      }
      
      try {
        // 3. Intentar con tickets por estado (CERRADO)
        console.log('🔍 [REPORTS-FRONTEND] Intentando getTicketsPorEstado CERRADO...');
        const response3 = await api.getTicketsPorEstado('CERRADO');
        console.log('🔍 [REPORTS-FRONTEND] getTicketsPorEstado CERRADO devolvió:', response3.length, 'tickets');
        allTicketsData.push(...response3);
      } catch (err3) {
        console.warn('🔍 [REPORTS-FRONTEND] getTicketsPorEstado CERRADO falló:', err3);
      }
      
      try {
        // 4. Intentar con tickets por estado (PENDIENTE)
        console.log('🔍 [REPORTS-FRONTEND] Intentando getTicketsPorEstado PENDIENTE...');
        const response4 = await api.getTicketsPorEstado('PENDIENTE');
        console.log('🔍 [REPORTS-FRONTEND] getTicketsPorEstado PENDIENTE devolvió:', response4.length, 'tickets');
        allTicketsData.push(...response4);
      } catch (err4) {
        console.warn('🔍 [REPORTS-FRONTEND] getTicketsPorEstado PENDIENTE falló:', err4);
      }
      
      try {
        // 5. Intentar con tickets por estado (ASIGNADO)
        console.log('🔍 [REPORTS-FRONTEND] Intentando getTicketsPorEstado ASIGNADO...');
        const response5 = await api.getTicketsPorEstado('ASIGNADO');
        console.log('🔍 [REPORTS-FRONTEND] getTicketsPorEstado ASIGNADO devolvió:', response5.length, 'tickets');
        allTicketsData.push(...response5);
      } catch (err5) {
        console.warn('🔍 [REPORTS-FRONTEND] getTicketsPorEstado ASIGNADO falló:', err5);
      }
      
      try {
        // 6. Intentar con tickets por estado (ESCALADO)
        console.log('🔍 [REPORTS-FRONTEND] Intentando getTicketsPorEstado ESCALADO...');
        const response6 = await api.getTicketsPorEstado('ESCALADO');
        console.log('🔍 [REPORTS-FRONTEND] getTicketsPorEstado ESCALADO devolvió:', response6.length, 'tickets');
        allTicketsData.push(...response6);
      } catch (err6) {
        console.warn('🔍 [REPORTS-FRONTEND] getTicketsPorEstado ESCALADO falló:', err6);
      }
      
      // Eliminar duplicados por ID
      console.log('🔍 [REPORTS-FRONTEND] Total tickets antes de eliminar duplicados:', allTicketsData.length);
      
      const uniqueTickets = allTicketsData.filter((ticket, index, self) => 
        index === self.findIndex(t => t.id === ticket.id)
      );
      
      console.log('🔍 [REPORTS-FRONTEND] Total tickets únicos cargados:', uniqueTickets.length);
      console.log('🔍 [REPORTS-FRONTEND] IDs de tickets únicos:', uniqueTickets.map(t => t.id));
      
      setAllTickets(uniqueTickets);
      
    } catch (err) {
      console.error('🔍 [REPORTS-FRONTEND] Error cargando tickets:', err);
      setAllTickets([]);
    }
  };

  // Calcular estadísticas dinámicas desde todos los tickets
  useEffect(() => {
    const ticketsToUse = allTickets.length > 0 ? allTickets : tickets;
    if (!ticketsToUse || ticketsToUse.length === 0) return;

    console.log('🔍 [REPORTS-FRONTEND] Calculando estadísticas desde tickets:', ticketsToUse.length);

    const isFinal = (estado: string) => {
      const estadoUpper = estado?.toUpperCase();
      return estadoUpper === 'RESUELTO' || estadoUpper === 'CERRADO' || estadoUpper === 'TERMINADO' ||
             estado === 'resuelto' || estado === 'cerrado' || estado === 'terminado';
    };
    const isPending = (estado: string) => {
      const estadoUpper = estado?.toUpperCase();
      // Solo considerar pendientes los que están ASIGNADO, EN_PROGRESO o ESCALADO (con técnico)
      return estadoUpper === 'ASIGNADO' || estadoUpper === 'EN_PROGRESO' || estadoUpper === 'ESCALADO' ||
             estado === 'asignado' || estado === 'en_progreso' || estado === 'escalado';
    };
    const isUnassigned = (ticket: any) => {
      // Sin asignar = PENDIENTE o sin técnico asignado
      const estadoUpper = ticket.estado?.toUpperCase();
      return estadoUpper === 'PENDIENTE' || ticket.estado === 'pendiente' || 
             (!ticket.tecnicoEmail && !ticket.tecnicoNombre && !ticket.tecnicoAsignado);
    };

    const totalTickets = ticketsToUse.length;
    const ticketsResueltos = ticketsToUse.filter(t => isFinal(t.estado)).length;
    const ticketsPendientes = ticketsToUse.filter(t => isPending(t.estado)).length;
    const ticketsSinAsignar = ticketsToUse.filter(t => isUnassigned(t)).length;

    // Debug detallado de cada ticket
    console.log('🔍 [REPORTS-FRONTEND] Análisis detallado de tickets:');
    ticketsToUse.forEach((ticket, index) => {
      const esFinal = isFinal(ticket.estado);
      const esPendiente = isPending(ticket.estado);
      const esSinAsignar = isUnassigned(ticket);
      console.log(`  Ticket ${index + 1}: ID=${ticket.id}, Estado="${ticket.estado}", Técnico="${ticket.tecnicoEmail || ticket.tecnicoNombre || 'Sin asignar'}", EsFinal=${esFinal}, EsPendiente=${esPendiente}, EsSinAsignar=${esSinAsignar}`);
    });

    console.log('🔍 [REPORTS-FRONTEND] Estadísticas calculadas:', {
      totalTickets,
      ticketsResueltos,
      ticketsPendientes,
      ticketsSinAsignar
    });

    // Siempre actualizar con datos reales
    setEstadisticas({
      totalTickets,
      ticketsResueltos,
      ticketsPendientes,
      ticketsEnProceso: Math.max(totalTickets - ticketsResueltos - ticketsPendientes, 0),
      tiempoPromedioResolucion: 0, // Se puede calcular si hay datos de fechas
      satisfaccionPromedio: 0, // Se puede calcular si hay datos de satisfacción
      ticketsPorCategoria: {},
      ticketsPorTecnico: {},
      tendenciaMensual: {}
    });
  }, [allTickets, tickets]);

  const reportesFiltrados = reportes.filter(reporte => {
    const cumpleBusqueda = !filtros.busqueda || 
      reporte.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      reporte.descripcion.toLowerCase().includes(filtros.busqueda.toLowerCase());
    const cumpleTipo = !filtros.tipo || filtros.tipo === 'all' || reporte.tipo === filtros.tipo;
    
    return cumpleBusqueda && cumpleTipo;
  });

  const reportesMensualesFiltrados = reportesMensuales.filter(reporte => {
    const cumpleBusqueda = !filtros.busqueda || 
      `${reporte.mes} ${reporte.año}`.toLowerCase().includes(filtros.busqueda.toLowerCase());
    const cumpleTipo = !filtros.tipo || filtros.tipo === 'all' || filtros.tipo === 'Mensual';
    
    return cumpleBusqueda && cumpleTipo;
  });

  const descargarReporte = (reporte: ReportData) => {
    // Simular descarga
    console.log(`Descargando reporte: ${reporte.nombre}`);
    alert(`Descargando ${reporte.nombre}...`);
  };

  const descargarReporteMensual = async (reporte: ReporteMensual) => {
    try {
      console.log('🔍 [REPORTS-FRONTEND] Iniciando descarga de reporte mensual:', reporte);
      
      // Usar el cliente API que ya maneja el token correctamente
      console.log('🔍 [REPORTS-FRONTEND] Usando cliente API para descarga...');
      
      // Descargar usando el cliente API
      const response = await api.descargarReporteMensual(reporte.id);
      
      if (response.success) {
        console.log('🔍 [REPORTS-FRONTEND] Archivo descargado, tamaño:', response.data.size, 'bytes');
        
        // Crear URL temporal para descarga
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = reporte.nombreArchivo || `reporte-${reporte.mes}-${reporte.año}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Limpiar URL temporal
        window.URL.revokeObjectURL(url);
        console.log('🔍 [REPORTS-FRONTEND] Descarga completada exitosamente');
      } else {
        throw new Error(response.message || 'Error al descargar reporte');
      }
      
    } catch (err) {
      console.error('🔍 [REPORTS-FRONTEND] Error descargando reporte:', err);
      setError('Error al descargar reporte: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
  };

  // Función para generar PDF desde el frontend con datos reales
  const generarPDFLocal = () => {
    const ticketsToUse = allTickets.length > 0 ? allTickets : tickets;
    if (!ticketsToUse || ticketsToUse.length === 0) {
      alert('No hay tickets disponibles para generar el reporte');
      return;
    }

    // Calcular estadísticas reales
    const isFinal = (estado: string) => {
      const estadoUpper = estado?.toUpperCase();
      return estadoUpper === 'RESUELTO' || estadoUpper === 'CERRADO' || estadoUpper === 'TERMINADO' ||
             estado === 'resuelto' || estado === 'cerrado' || estado === 'terminado';
    };
    const isPending = (estado: string) => {
      const estadoUpper = estado?.toUpperCase();
      // Solo considerar pendientes los que están ASIGNADO, EN_PROGRESO o ESCALADO (con técnico)
      return estadoUpper === 'ASIGNADO' || estadoUpper === 'EN_PROGRESO' || estadoUpper === 'ESCALADO' ||
             estado === 'asignado' || estado === 'en_progreso' || estado === 'escalado';
    };
    const isUnassigned = (ticket: any) => {
      // Sin asignar = PENDIENTE o sin técnico asignado
      const estadoUpper = ticket.estado?.toUpperCase();
      return estadoUpper === 'PENDIENTE' || ticket.estado === 'pendiente' || 
             (!ticket.tecnicoEmail && !ticket.tecnicoNombre && !ticket.tecnicoAsignado);
    };

    const totalTickets = ticketsToUse.length;
    const ticketsResueltos = ticketsToUse.filter(t => isFinal(t.estado)).length;
    const ticketsPendientes = ticketsToUse.filter(t => isPending(t.estado)).length;
    const ticketsSinAsignar = ticketsToUse.filter(t => isUnassigned(t)).length;

    // Estadísticas por categoría
    const categoriaStats = ticketsToUse.reduce((acc: any, ticket) => {
      const categoria = ticket.categoria || ticket.asunto || 'Sin categoría';
      acc[categoria] = (acc[categoria] || 0) + 1;
      return acc;
    }, {});

    // Estadísticas por técnico
    const tecnicoStats = ticketsToUse.reduce((acc: any, ticket) => {
      const tecnico = ticket.tecnicoNombre || ticket.tecnicoEmail || ticket.tecnicoAsignado || 'Sin asignar';
      acc[tecnico] = (acc[tecnico] || 0) + 1;
      return acc;
    }, {});

    // Crear PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Encabezado
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE TICKETS', pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 40, { align: 'center' });
    doc.text(`Generado por: Sistema de Gestión de Tickets`, pageWidth / 2, 46, { align: 'center' });

    let yPosition = 60;

    // Resumen ejecutivo
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN EJECUTIVO', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de tickets: ${totalTickets}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Tickets resueltos: ${ticketsResueltos}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Tickets pendientes: ${ticketsPendientes}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Tickets sin asignar: ${ticketsSinAsignar}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Tiempo promedio de resolución: ${estadisticas?.tiempoPromedioResolucion || 0} días`, 20, yPosition);
    yPosition += 8;
    doc.text(`Satisfacción promedio: ${estadisticas?.satisfaccionPromedio || 0}/5`, 20, yPosition);
    yPosition += 20;

    // Tabla de tickets por estado
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TICKETS POR ESTADO', 20, yPosition);
    yPosition += 10;

    const estadoData = [
      ['Estado', 'Cantidad', 'Porcentaje'],
      ['Resueltos', ticketsResueltos.toString(), `${((ticketsResueltos / totalTickets) * 100).toFixed(1)}%`],
      ['Pendientes', ticketsPendientes.toString(), `${((ticketsPendientes / totalTickets) * 100).toFixed(1)}%`],
      ['Sin Asignar', ticketsSinAsignar.toString(), `${((ticketsSinAsignar / totalTickets) * 100).toFixed(1)}%`],
      ['Total', totalTickets.toString(), '100%']
    ];

    autoTable(doc, {
      head: [estadoData[0]],
      body: estadoData.slice(1),
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // Tabla de tickets por categoría (Top 5)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOP 5 CATEGORÍAS', 20, yPosition);
    yPosition += 10;

    const topCategorias = Object.entries(categoriaStats)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([categoria, cantidad]) => [categoria, cantidad.toString()]);

    const categoriaData = [
      ['Categoría', 'Cantidad'],
      ...topCategorias
    ];

    autoTable(doc, {
      head: [categoriaData[0]],
      body: categoriaData.slice(1),
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [92, 184, 92] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // Tabla de tickets por técnico (Top 5)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOP 5 TÉCNICOS', 20, yPosition);
    yPosition += 10;

    const topTecnicos = Object.entries(tecnicoStats)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([tecnico, cantidad]) => [tecnico, cantidad.toString()]);

    const tecnicoData = [
      ['Técnico', 'Tickets Asignados'],
      ...topTecnicos
    ];

    autoTable(doc, {
      head: [tecnicoData[0]],
      body: tecnicoData.slice(1),
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [240, 173, 78] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // Lista de tickets resueltos
    const ticketsResueltosList = ticketsToUse.filter(t => isFinal(t.estado));
    if (ticketsResueltosList.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('TICKETS RESUELTOS', 20, yPosition);
      yPosition += 10;

      const ticketsData = ticketsResueltosList.map(ticket => [
        `#${ticket.id}`,
        ticket.asunto || 'Sin asunto',
        ticket.categoria || 'Sin categoría',
        ticket.tecnicoNombre || ticket.tecnicoEmail || 'Sin asignar',
        new Date(ticket.fechaCreacion).toLocaleDateString('es-ES')
      ]);

      const ticketsTableData = [
        ['ID', 'Asunto', 'Categoría', 'Técnico', 'Fecha Creación'],
        ...ticketsData
      ];

      autoTable(doc, {
        head: [ticketsTableData[0]],
        body: ticketsTableData.slice(1),
        startY: yPosition,
        theme: 'grid',
        headStyles: { fillColor: [92, 184, 92] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 50 },
          2: { cellWidth: 30 },
          3: { cellWidth: 40 },
          4: { cellWidth: 30 }
        }
      });
    }

    // Pie de página
    const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 20 : yPosition;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Este reporte fue generado automáticamente por el Sistema de Gestión de Tickets', 
             pageWidth / 2, finalY, { align: 'center' });

    // Descargar el PDF
    const fileName = `reporte-tickets-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    console.log('🔍 [REPORTS-FRONTEND] PDF generado exitosamente:', fileName);
  };

  // Función para verificar si se puede generar un reporte
  const canGenerateReport = () => {
    if (!selectedPeriod) return false;
    
    switch (selectedPeriod) {
      case 'daily':
        return selectedDate !== '';
      case 'monthly':
        return selectedMonth !== '';
      case 'yearly':
        return selectedYear !== '';
      default:
        return false;
    }
  };

  // Función para generar reporte por período
  const generatePeriodReport = () => {
    const ticketsToUse = allTickets.length > 0 ? allTickets : tickets;
    if (!ticketsToUse || ticketsToUse.length === 0) {
      alert('No hay tickets disponibles para generar el reporte');
      return;
    }

    // Filtrar tickets por período seleccionado
    let filteredTickets = ticketsToUse;
    const now = new Date();

    switch (selectedPeriod) {
      case 'daily':
        if (selectedDate) {
          // Usar la fecha seleccionada directamente sin conversión problemática
          const targetDateStr = selectedDate; // Formato YYYY-MM-DD
          filteredTickets = ticketsToUse.filter(ticket => {
            const ticketDate = new Date(ticket.fechaCreacion);
            const ticketDateStr = ticketDate.toISOString().split('T')[0]; // Convertir a YYYY-MM-DD
            return ticketDateStr === targetDateStr;
          });
        }
        break;
      case 'monthly':
        if (selectedMonth) {
          const [year, month] = selectedMonth.split('-');
          filteredTickets = ticketsToUse.filter(ticket => {
            const ticketDate = new Date(ticket.fechaCreacion);
            return ticketDate.getFullYear() === parseInt(year) && 
                   ticketDate.getMonth() === parseInt(month) - 1;
          });
        }
        break;
      case 'yearly':
        if (selectedYear) {
          const targetYear = parseInt(selectedYear);
          filteredTickets = ticketsToUse.filter(ticket => {
            const ticketDate = new Date(ticket.fechaCreacion);
            return ticketDate.getFullYear() === targetYear;
          });
        }
        break;
    }

    // Calcular estadísticas para el período
    const isFinal = (estado: string) => {
      const estadoUpper = estado?.toUpperCase();
      return estadoUpper === 'RESUELTO' || estadoUpper === 'CERRADO' || estadoUpper === 'TERMINADO';
    };
    const isPending = (estado: string) => {
      const estadoUpper = estado?.toUpperCase();
      return estadoUpper === 'ASIGNADO' || estadoUpper === 'EN_PROGRESO' || estadoUpper === 'ESCALADO';
    };
    const isUnassigned = (ticket: any) => {
      const estadoUpper = ticket.estado?.toUpperCase();
      return estadoUpper === 'PENDIENTE' || 
             (!ticket.tecnicoEmail && !ticket.tecnicoNombre && !ticket.tecnicoAsignado);
    };

    const totalTickets = filteredTickets.length;
    const ticketsResueltos = filteredTickets.filter(t => isFinal(t.estado)).length;
    const ticketsPendientes = filteredTickets.filter(t => isPending(t.estado)).length;
    const ticketsSinAsignar = filteredTickets.filter(t => isUnassigned(t)).length;

    // Estadísticas por categoría
    const categoriaStats = filteredTickets.reduce((acc: any, ticket) => {
      const categoria = ticket.categoria || ticket.asunto || 'Sin categoría';
      acc[categoria] = (acc[categoria] || 0) + 1;
      return acc;
    }, {});

    // Estadísticas por técnico
    const tecnicoStats = filteredTickets.reduce((acc: any, ticket) => {
      const tecnico = ticket.tecnicoNombre || ticket.tecnicoEmail || ticket.tecnicoAsignado || 'Sin asignar';
      acc[tecnico] = (acc[tecnico] || 0) + 1;
      return acc;
    }, {});

    // Crear el reporte
    const report = {
      title: `Reporte ${selectedPeriod === 'daily' ? 'Diario' : selectedPeriod === 'monthly' ? 'Mensual' : 'Anual'}`,
      subtitle: selectedPeriod === 'daily' ? 
        `Análisis del ${selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES') : ''}` :
        selectedPeriod === 'monthly' ?
        `Análisis de ${new Date(selectedMonth + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}` :
        `Análisis del año ${selectedYear}`,
      period: selectedPeriod === 'daily' ? 'Diario' : selectedPeriod === 'monthly' ? 'Mensual' : 'Anual',
      stats: {
        total: totalTickets,
        resolved: ticketsResueltos,
        pending: ticketsPendientes,
        unassigned: ticketsSinAsignar
      },
      topCategories: Object.entries(categoriaStats)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([categoria, cantidad]) => ({ categoria, cantidad })),
      topTechnicians: Object.entries(tecnicoStats)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([tecnico, tickets]) => ({ tecnico, tickets })),
      tickets: filteredTickets
    };

    setGeneratedReport(report);
    console.log('🔍 [REPORTS-FRONTEND] Reporte generado:', report);
  };

  // Función para descargar el reporte generado
  const downloadGeneratedReport = () => {
    if (!generatedReport) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Encabezado
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(generatedReport.title.toUpperCase(), pageWidth / 2, 30, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(generatedReport.subtitle, pageWidth / 2, 40, { align: 'center' });
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 46, { align: 'center' });

    let yPosition = 60;

    // Resumen ejecutivo
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN EJECUTIVO', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de tickets: ${generatedReport.stats.total}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Tickets resueltos: ${generatedReport.stats.resolved}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Tickets pendientes: ${generatedReport.stats.pending}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Tickets sin asignar: ${generatedReport.stats.unassigned}`, 20, yPosition);
    yPosition += 20;

    // Tabla de estadísticas
    const statsData = [
      ['Métrica', 'Cantidad', 'Porcentaje'],
      ['Resueltos', generatedReport.stats.resolved.toString(), `${((generatedReport.stats.resolved / generatedReport.stats.total) * 100).toFixed(1)}%`],
      ['Pendientes', generatedReport.stats.pending.toString(), `${((generatedReport.stats.pending / generatedReport.stats.total) * 100).toFixed(1)}%`],
      ['Sin Asignar', generatedReport.stats.unassigned.toString(), `${((generatedReport.stats.unassigned / generatedReport.stats.total) * 100).toFixed(1)}%`],
      ['Total', generatedReport.stats.total.toString(), '100%']
    ];

    autoTable(doc, {
      head: [statsData[0]],
      body: statsData.slice(1),
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // Top categorías
    if (generatedReport.topCategories.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('TOP CATEGORÍAS', 20, yPosition);
      yPosition += 10;

      const categoriaData = [
        ['Categoría', 'Cantidad'],
        ...generatedReport.topCategories.map((cat: any) => [cat.categoria, cat.cantidad.toString()])
      ];

      autoTable(doc, {
        head: [categoriaData[0]],
        body: categoriaData.slice(1),
        startY: yPosition,
        theme: 'grid',
        headStyles: { fillColor: [92, 184, 92] },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }

    // Top técnicos
    if (generatedReport.topTechnicians.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('TOP TÉCNICOS', 20, yPosition);
      yPosition += 10;

      const tecnicoData = [
        ['Técnico', 'Tickets Asignados'],
        ...generatedReport.topTechnicians.map((tech: any) => [tech.tecnico, tech.tickets.toString()])
      ];

      autoTable(doc, {
        head: [tecnicoData[0]],
        body: tecnicoData.slice(1),
        startY: yPosition,
        theme: 'grid',
        headStyles: { fillColor: [240, 173, 78] },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });
    }

    // Descargar el PDF
    const fileName = `reporte-${selectedPeriod}-${selectedDate || selectedMonth || selectedYear}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    // Guardar el reporte en la lista de reportes guardados
    const savedReport = {
      id: Date.now(), // ID único basado en timestamp
      title: generatedReport.title,
      subtitle: generatedReport.subtitle,
      period: generatedReport.period,
      periodType: selectedPeriod,
      periodValue: selectedDate || selectedMonth || selectedYear,
      fileName: fileName,
      stats: generatedReport.stats,
      topCategories: generatedReport.topCategories,
      topTechnicians: generatedReport.topTechnicians,
      fechaGeneracion: new Date().toISOString(),
      reportData: generatedReport // Guardar todos los datos del reporte
    };

    // Agregar a la lista de reportes guardados
    const newSavedReports = [savedReport, ...savedReports];
    setSavedReports(newSavedReports);
    
    // Guardar en localStorage
    saveReportsToLocalStorage(newSavedReports);

    console.log('🔍 [REPORTS-FRONTEND] Reporte por período descargado y guardado:', fileName);
  };

  // Función para re-descargar un reporte guardado
  const redownloadSavedReport = (savedReport: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Encabezado
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(savedReport.title.toUpperCase(), pageWidth / 2, 30, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(savedReport.subtitle, pageWidth / 2, 40, { align: 'center' });
    doc.text(`Fecha de generación: ${new Date(savedReport.fechaGeneracion).toLocaleDateString('es-ES')}`, pageWidth / 2, 46, { align: 'center' });

    let yPosition = 60;

    // Resumen ejecutivo
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN EJECUTIVO', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de tickets: ${savedReport.stats.total}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Tickets resueltos: ${savedReport.stats.resolved}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Tickets pendientes: ${savedReport.stats.pending}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Tickets sin asignar: ${savedReport.stats.unassigned}`, 20, yPosition);
    yPosition += 20;

    // Tabla de estadísticas
    const statsData = [
      ['Métrica', 'Cantidad', 'Porcentaje'],
      ['Resueltos', savedReport.stats.resolved.toString(), `${((savedReport.stats.resolved / savedReport.stats.total) * 100).toFixed(1)}%`],
      ['Pendientes', savedReport.stats.pending.toString(), `${((savedReport.stats.pending / savedReport.stats.total) * 100).toFixed(1)}%`],
      ['Sin Asignar', savedReport.stats.unassigned.toString(), `${((savedReport.stats.unassigned / savedReport.stats.total) * 100).toFixed(1)}%`],
      ['Total', savedReport.stats.total.toString(), '100%']
    ];

    autoTable(doc, {
      head: [statsData[0]],
      body: statsData.slice(1),
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // Top categorías
    if (savedReport.topCategories && savedReport.topCategories.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('TOP CATEGORÍAS', 20, yPosition);
      yPosition += 10;

      const categoriaData = [
        ['Categoría', 'Cantidad'],
        ...savedReport.topCategories.map((cat: any) => [cat.categoria, cat.cantidad.toString()])
      ];

      autoTable(doc, {
        head: [categoriaData[0]],
        body: categoriaData.slice(1),
        startY: yPosition,
        theme: 'grid',
        headStyles: { fillColor: [92, 184, 92] },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    }

    // Top técnicos
    if (savedReport.topTechnicians && savedReport.topTechnicians.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('TOP TÉCNICOS', 20, yPosition);
      yPosition += 10;

      const tecnicoData = [
        ['Técnico', 'Tickets Asignados'],
        ...savedReport.topTechnicians.map((tech: any) => [tech.tecnico, tech.tickets.toString()])
      ];

      autoTable(doc, {
        head: [tecnicoData[0]],
        body: tecnicoData.slice(1),
        startY: yPosition,
        theme: 'grid',
        headStyles: { fillColor: [240, 173, 78] },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });
    }

    // Descargar el PDF
    doc.save(savedReport.fileName);
    console.log('🔍 [REPORTS-FRONTEND] Reporte guardado re-descargado:', savedReport.fileName);
  };

  // Función para eliminar un reporte guardado
  const deleteSavedReport = (reportId: number) => {
    const newSavedReports = savedReports.filter(report => report.id !== reportId);
    setSavedReports(newSavedReports);
    
    // Actualizar localStorage
    saveReportsToLocalStorage(newSavedReports);
    
    console.log('🔍 [REPORTS-FRONTEND] Reporte eliminado:', reportId);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Mensual': return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'Satisfacción': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'Rendimiento': return <Users className="w-5 h-5 text-purple-500" />;
      case 'Categorías': return <PieChart className="w-5 h-5 text-orange-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Mensual': return 'bg-blue-100 text-blue-800';
      case 'Satisfacción': return 'bg-green-100 text-green-800';
      case 'Rendimiento': return 'bg-purple-100 text-purple-800';
      case 'Categorías': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="reports">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t("reports.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports">
      <div className="reports-header">
        <div className="header-content">
          <h1 className="reports-title">{t("reports.title")}</h1>
          <p className="reports-subtitle">{t("reports.subtitle")}</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      {/* Estadísticas Principales */}
      {estadisticas && (
      <div className="stats-grid">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t("reports.total_tickets")}</p>
                  <p className="text-2xl font-bold text-gray-900">{(estadisticas.totalTickets || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {estadisticas.ticketsResueltos || 0} {t("reports.resolved")} • {estadisticas.ticketsPendientes || 0} {t("reports.pending")}
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">{t("reports.average_time")}</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.tiempoPromedioResolucion || 0} {t("reports.resolution_days")}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("reports.ticket_resolution")}
                  </p>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t("reports.satisfaction")}</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.satisfaccionPromedio || 0}/5</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("reports.average_rating")}
                  </p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Filtros */}
      <Card className="filters-card">
        <CardContent className="p-6">
          <div className="filters-grid">
            <div className="filter-group">
              <Label htmlFor="busqueda">{t("reports.search")}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="busqueda"
                  placeholder={t("reports.search_placeholder")}
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="filter-group">
              <Label htmlFor="tipo">{t("reports.type")}</Label>
              <Select
                value={filtros.tipo}
                onValueChange={(value) => setFiltros({ ...filtros, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("reports.all_types")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("reports.all_types")}</SelectItem>
                  <SelectItem value="Mensual">{t("reports.monthly")}</SelectItem>
                  <SelectItem value="Satisfacción">{t("reports.satisfaction_report")}</SelectItem>
                  <SelectItem value="Rendimiento">{t("reports.performance_report")}</SelectItem>
                  <SelectItem value="Categorías">{t("reports.categories_report")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Botón para generar PDF local */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex gap-2 mb-2">
              <Button 
                onClick={generarPDFLocal}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Generar Reporte PDF (Datos Reales)
              </Button>
              <Button 
                onClick={() => {
                  console.log('🔍 [DEBUG] Tickets actuales:', tickets);
                  console.log('🔍 [DEBUG] Estadísticas actuales:', estadisticas);
                  
                  const ticketsToUse = allTickets.length > 0 ? allTickets : tickets;
                  
                  // Debug detallado de estados
                  if (ticketsToUse && ticketsToUse.length > 0) {
                    console.log('🔍 [DEBUG] Estados de tickets:');
                    ticketsToUse.forEach((ticket, index) => {
                      console.log(`  Ticket ${index + 1}: ID=${ticket.id}, Estado="${ticket.estado}", Técnico="${ticket.tecnicoEmail || ticket.tecnicoNombre || 'Sin asignar'}"`);
                    });
                    
                    const estados = ticketsToUse.map(t => t.estado);
                    const estadosUnicos = [...new Set(estados)];
                    console.log('🔍 [DEBUG] Estados únicos encontrados:', estadosUnicos);
                  }
                  
                  alert(`Debug: ${ticketsToUse?.length || 0} tickets cargados (${allTickets.length} del sistema, ${tickets?.length || 0} del cliente). Ver consola para detalles de estados.`);
                }}
                variant="outline"
                size="sm"
              >
                Debug Datos
              </Button>
              <Button 
                onClick={() => {
                  console.log('🔍 [REPORTS-FRONTEND] Recargando tickets manualmente...');
                  loadAllTickets();
                  alert('Recargando tickets... Ver consola para detalles.');
                }}
                variant="outline"
                size="sm"
                className="ml-2"
              >
                Recargar Tickets
              </Button>
              <Button 
                onClick={() => {
                  console.log('🔍 [REPORTS-FRONTEND] Forzando recálculo de estadísticas...');
                  const ticketsToUse = allTickets.length > 0 ? allTickets : tickets;
                  console.log('🔍 [REPORTS-FRONTEND] Tickets a usar para recálculo:', ticketsToUse.length);
                  
                  if (ticketsToUse.length > 0) {
                    // Forzar recálculo manual
                    const isFinal = (estado: string) => {
                      const estadoUpper = estado?.toUpperCase();
                      return estadoUpper === 'RESUELTO' || estadoUpper === 'CERRADO' || estadoUpper === 'TERMINADO';
                    };
                    const isPending = (estado: string) => {
                      const estadoUpper = estado?.toUpperCase();
                      // Solo considerar pendientes los que están ASIGNADO, EN_PROGRESO o ESCALADO (con técnico)
                      return estadoUpper === 'ASIGNADO' || estadoUpper === 'EN_PROGRESO' || estadoUpper === 'ESCALADO';
                    };
                    const isUnassigned = (ticket: any) => {
                      // Sin asignar = PENDIENTE o sin técnico asignado
                      const estadoUpper = ticket.estado?.toUpperCase();
                      return estadoUpper === 'PENDIENTE' || 
                             (!ticket.tecnicoEmail && !ticket.tecnicoNombre && !ticket.tecnicoAsignado);
                    };

                    const totalTickets = ticketsToUse.length;
                    const ticketsResueltos = ticketsToUse.filter(t => isFinal(t.estado)).length;
                    const ticketsPendientes = ticketsToUse.filter(t => isPending(t.estado)).length;
                    const ticketsSinAsignar = ticketsToUse.filter(t => isUnassigned(t)).length;

                    console.log('🔍 [REPORTS-FRONTEND] Recálculo manual:', {
                      totalTickets,
                      ticketsResueltos,
                      ticketsPendientes,
                      ticketsSinAsignar
                    });

                    setEstadisticas({
                      totalTickets,
                      ticketsResueltos,
                      ticketsPendientes,
                      ticketsEnProceso: Math.max(totalTickets - ticketsResueltos - ticketsPendientes, 0),
                      tiempoPromedioResolucion: 0,
                      satisfaccionPromedio: 0,
                      ticketsPorCategoria: {},
                      ticketsPorTecnico: {},
                      tendenciaMensual: {}
                    });
                  }
                  
                  alert(`Recálculo forzado. Total: ${ticketsToUse.length} tickets. Ver consola para detalles.`);
                }}
                variant="outline"
                size="sm"
                className="ml-2"
              >
                Recalcular Stats
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Genera un reporte PDF con los datos actuales de tickets: {estadisticas?.totalTickets || 0} total, 
              {estadisticas?.ticketsResueltos || 0} resueltos, 
              {estadisticas?.ticketsPendientes || 0} pendientes, 
              {(allTickets.length > 0 ? allTickets : tickets)?.filter(t => !t.tecnicoEmail && !t.tecnicoNombre && !t.tecnicoAsignado).length || 0} sin asignar
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Generador de Reportes por Período */}
      <div className="reports-section">
        <h2 className="section-title">Generar Reporte por Período</h2>
        
        {/* Selector de Período */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tipo de Período */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tipo de Período</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha/Período Específico */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {selectedPeriod === 'daily' ? 'Fecha' : 
                   selectedPeriod === 'monthly' ? 'Mes y Año' : 'Año'}
                </label>
                {selectedPeriod === 'daily' && (
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                )}
                {selectedPeriod === 'monthly' && (
                  <Input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                )}
                {selectedPeriod === 'yearly' && (
                  <Input
                    type="number"
                    placeholder="2025"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    min="2020"
                    max="2030"
                  />
                )}
              </div>

              {/* Botón Generar */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">&nbsp;</label>
                <Button 
                  onClick={generatePeriodReport}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!canGenerateReport}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generar Reporte
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Área de Reporte Generado */}
        {generatedReport && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <div>
                    <CardTitle className="text-lg">{generatedReport.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{generatedReport.subtitle}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {generatedReport.period}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                {/* Métricas del reporte */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Resueltos</p>
                    <p className="text-2xl font-bold text-green-600">{generatedReport.stats.resolved}</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-600">{generatedReport.stats.pending}</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Sin Asignar</p>
                    <p className="text-2xl font-bold text-red-600">{generatedReport.stats.unassigned}</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-blue-600">{generatedReport.stats.total}</p>
                  </div>
                </div>

                {/* Top categorías */}
                {generatedReport.topCategories && generatedReport.topCategories.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-medium text-gray-900">Top Categorías</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {generatedReport.topCategories.slice(0, 6).map((cat, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">{cat.categoria}</span>
                          <Badge variant="secondary">{cat.cantidad}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top técnicos */}
                {generatedReport.topTechnicians && generatedReport.topTechnicians.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-medium text-gray-900">Top Técnicos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {generatedReport.topTechnicians.slice(0, 6).map((tech, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">{tech.tecnico}</span>
                          <Badge variant="secondary">{tech.tickets}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    <p>Generado el: {new Date().toLocaleDateString()}</p>
                    <p>Período: {generatedReport.period}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => downloadGeneratedReport()}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setGeneratedReport(null)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cerrar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reportes Guardados */}
      {savedReports.length > 0 && (
        <div className="reports-section">
          <h2 className="section-title">Reportes Guardados</h2>
          <div className="reports-grid">
            {savedReports.map(report => (
              <Card key={report.id} className="report-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{report.subtitle}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {report.period}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Métricas del reporte */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">Resueltos</span>
                        <span className="font-semibold">{report.stats.resolved}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <span className="text-gray-600">Pendientes</span>
                        <span className="font-semibold">{report.stats.pending}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-gray-600">Sin Asignar</span>
                        <span className="font-semibold">{report.stats.unassigned}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-600">Total</span>
                        <span className="font-semibold">{report.stats.total}</span>
                      </div>
                    </div>

                    {/* Top categorías */}
                    {report.topCategories && report.topCategories.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Top Categorías</p>
                        <div className="space-y-1">
                          {report.topCategories.slice(0, 3).map((cat: any, index: number) => (
                            <div key={index} className="flex justify-between text-xs">
                              <span className="text-gray-600">{cat.categoria}</span>
                              <span className="font-medium">{cat.cantidad}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(report.fechaGeneracion).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="w-4 h-4" />
                        <span>PDF</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between space-x-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => redownloadSavedReport(report)}
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Descargar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteSavedReport(report.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Otros Reportes */}
      {reportesFiltrados.length > 0 && (
        <div className="reports-section">
          <h2 className="section-title">{t("reports.other_reports")}</h2>
      <div className="reports-grid">
        {reportesFiltrados.map(reporte => (
          <Card key={reporte.id} className="report-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getTipoIcon(reporte.tipo)}
                  <div>
                    <CardTitle className="text-lg">{reporte.nombre}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{reporte.descripcion}</p>
                  </div>
                </div>
                <Badge className={getTipoColor(reporte.tipo)}>
                  {reporte.tipo}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(reporte.fechaGeneracion).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="w-4 h-4" />
                    <span>{reporte.tamaño}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => descargarReporte(reporte)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Descargar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Reports;
