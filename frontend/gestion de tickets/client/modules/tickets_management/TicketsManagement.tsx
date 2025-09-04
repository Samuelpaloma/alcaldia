import "./TicketsManagement.css";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/i18n";

export type Ticket = {
  id: string;
  subject: string;
  requester: string;
  status: "open" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  updatedAt: string;
};

const SAMPLE: Ticket[] = [
  { id: "#1045", subject: "Email service down", requester: "Alice Johnson", status: "open", priority: "high", updatedAt: "2025-09-01 10:12" },
  { id: "#1044", subject: "Cannot reset password", requester: "Carlos Pérez", status: "in_progress", priority: "medium", updatedAt: "2025-09-01 09:41" },
  { id: "#1043", subject: "VPN access request", requester: "Wei Chen", status: "resolved", priority: "low", updatedAt: "2025-08-31 16:05" },
  { id: "#1042", subject: "Broken printer in floor 3", requester: "María Gómez", status: "open", priority: "low", updatedAt: "2025-08-31 12:20" },
];

export default function TicketsManagement() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("");
  const [priority, setPriority] = useState<string>("");

  const filtered = useMemo(() => {
    return SAMPLE.filter((tk) => {
      const matchesQuery = `${tk.id} ${tk.subject} ${tk.requester}`.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status ? tk.status === status : true;
      const matchesPriority = priority ? tk.priority === priority : true;
      return matchesQuery && matchesStatus && matchesPriority;
    });
  }, [query, status, priority]);

  return (
    <div className="tickets-page section">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title">{t("tickets.title")}</h1>
          <p className="page-subtitle">{t("tickets.subtitle")}</p>
        </div>
        <Button className="btn-contrast">{t("tickets.new")}</Button>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base font-medium text-muted-foreground">{t("filters")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder={t("tickets.search_placeholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select className="generic-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">{t("tickets.status")}</option>
              <option value="open">{t("tickets.status.open")}</option>
              <option value="in_progress">{t("tickets.status.in_progress")}</option>
              <option value="resolved">{t("tickets.status.resolved")}</option>
            </select>
            <select className="generic-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="">{t("tickets.priority")}</option>
              <option value="low">{t("tickets.priority.low")}</option>
              <option value="medium">{t("tickets.priority.medium")}</option>
              <option value="high">{t("tickets.priority.high")}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">{t("tickets.table.id")}</TableHead>
                  <TableHead>{t("tickets.table.subject")}</TableHead>
                  <TableHead>{t("tickets.table.requester")}</TableHead>
                  <TableHead>{t("tickets.table.status")}</TableHead>
                  <TableHead>{t("tickets.table.priority")}</TableHead>
                  <TableHead className="text-right">{t("tickets.table.updated")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((tk) => (
                  <TableRow key={tk.id}>
                    <TableCell className="font-medium">{tk.id}</TableCell>
                    <TableCell>{tk.subject}</TableCell>
                    <TableCell>{tk.requester}</TableCell>
                    <TableCell>
                      <span className={`status-pill ${tk.status}`}>{t(`tickets.status.${tk.status}`)}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`priority-pill ${tk.priority}`}>{t(`tickets.priority.${tk.priority}`)}</span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{tk.updatedAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
