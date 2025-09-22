import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";
import { getTickets, subscribe, Ticket, reopenTicket, loadTickets, getLoadingState } from "../client_tickets/apiStore";
import { isAuthenticated } from "../auth/auth";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Wrench,
  Eye,
  MessageSquare
} from "lucide-react";

export default function ClientHistory(){
  const { t } = useI18n();
  const [tickets, setTickets] = useState<Ticket[]>(getTickets());
  const { isLoading, error } = getLoadingState();

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
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };
  
  useEffect(() => {
    const unsubscribe = subscribe(() => setTickets(getTickets()));
    
    // Solo cargar tickets si el usuario está autenticado
    if (isAuthenticated()) {
      loadTickets();
    }
    
    return () => {
      unsubscribe();
    };
  }, []);
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
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead className="w-[200px]">Asunto</TableHead>
                  <TableHead className="w-[120px]">{t("tickets.priority")}</TableHead>
                  <TableHead className="w-[140px]">{t("tickets.status")}</TableHead>
                  <TableHead className="w-[120px]">Técnico</TableHead>
                  <TableHead className="w-[100px]">{t("client.table.created")}</TableHead>
                  <TableHead className="w-[100px]">{t("tickets.status.closed")}</TableHead>
                  <TableHead className="w-[120px] text-right">{t("tickets.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map(ticket => (
                  <TableRow key={ticket.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono font-medium">#{ticket.id}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={ticket.message}>
                      {ticket.message}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(ticket.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(ticket.status)}
                        {ticket.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {ticket.technician || 'Sin asignar'}
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
                          title="Ver detalles"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex items-center gap-1"
                          title="Chat"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </Button>
                        {ticket.status === "closed" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={()=>reopenTicket(ticket.id)}
                            className="text-xs"
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
        </CardContent>
      </Card>
    </div>
  );
}
