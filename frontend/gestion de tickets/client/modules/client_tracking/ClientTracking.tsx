import "./ClientTracking.css";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { addComment, getTickets, subscribe, Ticket } from "../client_tickets/store";

export default function ClientTracking() {
  const { t } = useI18n();
  const [tickets, setTickets] = useState<Ticket[]>(getTickets());
  const [selected, setSelected] = useState<string | undefined>(tickets[0]?.id);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const unsub = subscribe(() => setTickets(getTickets()));
    return () => unsub();
  }, []);

  const ticket = useMemo(() => tickets.find(t => t.id === selected), [tickets, selected]);

  const send = () => {
    if (ticket && comment.trim()) {
      addComment(ticket.id, "client", comment.trim());
      setComment("");
    }
  };

  return (
    <div className="section grid gap-6">
      <div>
        <h1 className="page-title">{t("client.tracking_title")}</h1>
        <p className="page-subtitle">{t("client.tracking_desc")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">{t("client.select_ticket")}</CardTitle>
        </CardHeader>
        <CardContent>
          <select className="generic-select" value={selected} onChange={(e)=>setSelected(e.target.value)}>
            {tickets.map(t => (<option key={t.id} value={t.id}>{t.id} • {t.message.slice(0,40)}</option>))}
          </select>
        </CardContent>
      </Card>

      {ticket && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">{t("client.ticket_info")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-1 text-sm">
                <div><b>ID:</b> {ticket.id}</div>
                <div><b>{t("tickets.priority")}:</b> {t(`tickets.priority.${ticket.priority}`)}</div>
                <div><b>{t("tickets.status")}:</b> {ticket.status}</div>
                <div><b>Tech:</b> {ticket.technician}</div>
                <div><b>{t("client.table.created")}:</b> {ticket.createdAt.slice(0,16).replace('T',' ')}</div>
                {ticket.closedAt && <div><b>Closed:</b> {ticket.closedAt.slice(0,16).replace('T',' ')}</div>}
              </div>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">{t("client.activity")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="timeline">
                {ticket.events.slice().reverse().map((e, idx) => (
                  <div className={`event ${e.author}`} key={idx}>
                    <div className="meta">{e.at.slice(11,19)} • {e.author}</div>
                    <div className="msg">{e.message}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Input value={comment} onChange={(e)=>setComment(e.target.value)} placeholder={t("client.comment_placeholder")} />
                <Button onClick={send}>{t("client.send")}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
