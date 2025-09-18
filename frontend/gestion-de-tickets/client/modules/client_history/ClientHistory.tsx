import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { getTickets, subscribe, Ticket, reopenTicket } from "../client_tickets/store";

export default function ClientHistory(){
  const { t } = useI18n();
  const [tickets, setTickets] = useState<Ticket[]>(getTickets());
  useEffect(()=>{ const u = subscribe(()=>setTickets(getTickets())); return ()=>{ u(); }; },[]);
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
        </CardContent>
      </Card>
    </div>
  );
}
