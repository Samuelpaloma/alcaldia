import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { getTickets, subscribe, Ticket, reopenTicket, loadTickets, getLoadingState } from "../client_tickets/apiStore";
import { isAuthenticated } from "../auth/auth";

export default function ClientHistory(){
  const { t } = useI18n();
  const [tickets, setTickets] = useState<Ticket[]>(getTickets());
  const { isLoading, error } = getLoadingState();
  
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
                  <TableHead className="w-[120px]">ID</TableHead>
                  <TableHead>{t("tickets.priority")}</TableHead>
                  <TableHead>{t("tickets.status")}</TableHead>
                  <TableHead>{t("client.table.created")}</TableHead>
                  <TableHead className="text-right">{t("tickets.status.closed")}</TableHead>
                  <TableHead className="text-right">{t("tickets.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map(ticket => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.id}</TableCell>
                    <TableCell>{t(`tickets.priority.${ticket.priority}`)}</TableCell>
                    <TableCell>{t(`tickets.status.${ticket.status}`)}</TableCell>
                    <TableCell>{ticket.createdAt.slice(0,10)}</TableCell>
                    <TableCell className="text-right">{ticket.closedAt?.slice(0,10) ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      {ticket.status === "closed" && (
                        <Button size="sm" variant="outline" onClick={()=>reopenTicket(ticket.id)}>{t("client.reopen")}</Button>
                      )}
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
