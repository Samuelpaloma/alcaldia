import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";
import { useTickets } from "../../hooks/use-tickets";
import { reopenTicket } from "../client_tickets/apiStore";
import { isAuthenticated } from "../auth/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Wrench,
  Eye
} from "lucide-react";

export default function ClientHistory(){
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { tickets, isLoading, error } = useTickets();
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam) : 1;
  });
  const ticketsPerPage = 20;
  
  // Calcular tickets paginados
  const totalPages = Math.ceil(tickets.length / ticketsPerPage);
  const startIndex = (currentPage - 1) * ticketsPerPage;
  const endIndex = startIndex + ticketsPerPage;
  const paginatedTickets = tickets.slice(startIndex, endIndex);
  
  // Función para cambiar de página
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', newPage.toString());
    setSearchParams(newSearchParams);
  };
  
  // Efecto para manejar parámetro de página desde la URL
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam) {
      const pageFromUrl = parseInt(pageParam);
      if (pageFromUrl !== currentPage && pageFromUrl >= 1 && pageFromUrl <= totalPages) {
        setCurrentPage(pageFromUrl);
      }
    }
  }, [searchParams, currentPage, totalPages]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'pendiente':
        return <Clock className="w-4 h-4" />;
      case 'in_progress':
      case 'en_ejecucion':
        return <Wrench className="w-4 h-4" />;
      case 'resolved':
      case 'terminado':
        return <CheckCircle className="w-4 h-4" />;
      case 'closed':
      case 'cerrado':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
      case 'en_ejecucion':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
      case 'terminado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
      case 'cerrado':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'alta':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
      case 'baja':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const localeCode = locale === 'en' ? 'en-US' : 'es-ES';
    return new Date(dateString).toLocaleDateString(localeCode, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const translateStatus = (status: string) => {
    // Mapear estados específicos a sus claves de traducción
    const statusMap: Record<string, string> = {
      'ASIGNADO': 'client.status.assigned',
      'PENDIENTE': 'client.status.pending',
      'EN_PROGRESO': 'client.status.in_progress',
      'RESUELTO': 'client.status.resolved',
      'CERRADO': 'client.status.closed',
      'ASSIGNED': 'client.status.assigned',
      'PENDING': 'client.status.pending',
      'IN_PROGRESS': 'client.status.in_progress',
      'RESOLVED': 'client.status.resolved',
      'CLOSED': 'client.status.closed'
    };
    
    const translationKey = statusMap[status.toUpperCase()];
    if (translationKey) {
      const translation = t(translationKey);
      // Si la traducción es diferente a la clave, usarla
      if (translation !== translationKey) {
        return translation;
      }
    }
    
    // Fallback: usar el estado original en mayúsculas
    return status.toUpperCase();
  };

  const scrollToTracking = (ticketId: string) => {
    // Navegar a la página de seguimiento con el ticket seleccionado
    navigate(`/client/seguimiento?ticket=${ticketId}`);
  };
  return (
    <div className="section grid gap-6">
      <div>
        <h1 className="page-title">{t("client.history")}</h1>
        <p className="page-subtitle">{t("client.history")}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">{t("client.my_tickets")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">{t("client.loading")}</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => loadTickets()} variant="outline">
                {t("client.retry")}
              </Button>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t("client.no_tickets")}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">{t("client.table.id")}</TableHead>
                  <TableHead className="w-[200px]">{t("client.table.subject")}</TableHead>
                  <TableHead className="w-[120px]">{t("tickets.priority")}</TableHead>
                  <TableHead className="w-[140px]">{t("tickets.status")}</TableHead>
                  <TableHead className="w-[120px]">{t("client.table.technician")}</TableHead>
                  <TableHead className="w-[100px]">{t("client.table.created")}</TableHead>
                  <TableHead className="w-[100px]">{t("tickets.status.closed")}</TableHead>
                  <TableHead className="w-[120px] text-right">{t("tickets.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTickets.map(ticket => (
                  <TableRow key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell className="font-mono font-medium">#{ticket.id}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={ticket.message}>
                      {ticket.message}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority === 'medium' ? t("client.priority.medium") : ticket.priority.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(ticket.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(ticket.status)}
                        {translateStatus(ticket.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {ticket.technician || t("client.table.unassigned")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(ticket.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {ticket.closedAt ? formatDate(ticket.closedAt) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex items-center gap-1"
                          title={t("client.table.view_tracking")}
                          onClick={() => scrollToTracking(ticket.id.toString())}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        {(ticket.status === "closed" || ticket.status === "resolved") && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={()=>reopenTicket(ticket.id)}
                            className="text-xs"
                            title={t("client.table.reopen_ticket")}
                          >
                            {t("client.reopen")}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {/* Controles de paginación */}
          {!isLoading && !error && tickets.length > ticketsPerPage && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-muted-foreground">
                {t("client.pagination.showing")} {startIndex + 1}-{Math.min(endIndex, tickets.length)} {t("client.pagination.of")} {tickets.length} {t("client.pagination.tickets")}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  {t("client.pagination.previous")}
                </Button>
                <span className="text-sm font-medium px-3">
                  {t("client.pagination.page")} {currentPage} {t("client.pagination.of")} {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  {t("client.pagination.next")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
