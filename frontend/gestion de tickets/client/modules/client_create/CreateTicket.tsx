import "./CreateTicket.css";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n";
import { createTicket, Priority } from "../client_tickets/store";

export default function CreateTicket() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [fileName, setFileName] = useState<string | undefined>();

  const canSubmit = name && location && message && priority;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const tkt = createTicket({ name, location, message, priority, attachmentName: fileName });
    toast({ title: t("client.ticket_created"), description: `${t("client.ticket_id")}: ${tkt.id}` });
    setName(""); setLocation(""); setMessage(""); setPriority("medium"); setFileName(undefined);
  };

  return (
    <div className="section grid gap-6">
      <div>
        <h1 className="page-title">{t("client.create_ticket_panel")}</h1>
        <p className="page-subtitle">{t("client.create_ticket_desc")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">{t("client.create_ticket")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={submit}>
            <label className="grid gap-1">
              <span className="label">{t("client.form.name")}</span>
              <Input value={name} onChange={(e)=>setName(e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className="label">{t("client.form.location")}</span>
              <Input value={location} onChange={(e)=>setLocation(e.target.value)} />
            </label>
            <label className="grid gap-1 md:col-span-2">
              <span className="label">{t("client.form.message")}</span>
              <Input value={message} onChange={(e)=>setMessage(e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className="label">{t("client.form.priority")}</span>
              <select className="generic-select" value={priority} onChange={(e)=>setPriority(e.target.value as Priority)}>
                <option value="high">{t("tickets.priority.high")}</option>
                <option value="medium">{t("tickets.priority.medium")}</option>
                <option value="low">{t("tickets.priority.low")}</option>
              </select>
            </label>
            <label className="grid gap-1">
              <span className="label">{t("client.form.attach")}</span>
              <input type="file" onChange={(e)=>setFileName(e.target.files?.[0]?.name)} />
              {fileName && <span className="text-xs text-muted-foreground">{fileName}</span>}
            </label>
            <div className="md:col-span-2">
              <Button disabled={!canSubmit} className="btn-contrast">{t("client.submit_ticket")}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
