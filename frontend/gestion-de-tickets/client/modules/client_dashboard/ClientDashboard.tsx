import "./ClientDashboard.css";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useI18n } from "@/i18n";

type ClientTicket = { id: string; subject: string; status: "open"|"in_progress"|"resolved"; createdAt: string };

export default function ClientDashboard() {
  const { t } = useI18n();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [tickets, setTickets] = useState<ClientTicket[]>([
    { id: "C-1001", subject: "VPN issue", status: "in_progress", createdAt: "2025-09-01" },
    { id: "C-1000", subject: "Password reset", status: "resolved", createdAt: "2025-08-29" },
  ]);
  const hasForm = useMemo(()=>subject.trim().length>2 && description.trim().length>5,[subject,description]);

  const createTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket: ClientTicket = { id: `C-${1000 + tickets.length + 1}`, subject, status: "open", createdAt: new Date().toISOString().slice(0,10) };
    setTickets([newTicket, ...tickets]);
    setSubject("");
    setDescription("");
  };

  return (
    <div className="section grid gap-6">
      <div>
        <h1 className="page-title">{t("client.title")}</h1>
        <p className="page-subtitle">{t("client.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-muted-foreground">{t("client.create_ticket")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid md:grid-cols-3 gap-3" onSubmit={createTicket}>
            <Input value={subject} onChange={(e)=>setSubject(e.target.value)} placeholder={t("client.subject_placeholder")} className="md:col-span-1" />
            <Input value={description} onChange={(e)=>setDescription(e.target.value)} placeholder={t("client.description_placeholder")} className="md:col-span-2" />
            <div className="md:col-span-3">
              <Button disabled={!hasForm} className="btn-contrast">{t("client.submit_ticket")}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-muted-foreground">{t("client.my_tickets")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">ID</TableHead>
                <TableHead>{t("client.table.subject")}</TableHead>
                <TableHead>{t("client.table.status")}</TableHead>
                <TableHead className="text-right">{t("client.table.created")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((tk)=> (
                <TableRow key={tk.id}>
                  <TableCell className="font-medium">{tk.id}</TableCell>
                  <TableCell>{tk.subject}</TableCell>
                  <TableCell><span className={`status-pill ${tk.status}`}>{t(`tickets.status.${tk.status}`)}</span></TableCell>
                  <TableCell className="text-right text-muted-foreground">{tk.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
