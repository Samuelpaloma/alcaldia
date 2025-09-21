import "./ClientTracking.css";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/i18n";
import { api } from "@shared/api";
import { getTickets, subscribe, Ticket } from "../client_tickets/apiStore";
import ChatSystem from "./ChatSystem";

interface TicketTracking {
  id: number;
  asunto: string;
  descripcion: string;
  categoria: string;
  estado: string;
  prioridad: string;
  tecnicoAsignado?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  comentarios?: Array<{
    id: number;
    autor: string;
    mensaje: string;
    fechaCreacion: string;
  }>;
}

export default function ClientTracking() {
  const { t } = useI18n();
  const [tickets, setTickets] = useState<Ticket[]>(getTickets());
  const [selected, setSelected] = useState<string | undefined>(tickets[0]?.id);
  const [trackingData, setTrackingData] = useState<TicketTracking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribe(() => setTickets(getTickets()));
    return () => unsub();
  }, []);

  const ticket = useMemo(() => tickets.find(t => t.id === selected), [tickets, selected]);

  // Cargar datos de seguimiento cuando se selecciona un ticket
  useEffect(() => {
    if (selected) {
      loadTrackingData(parseInt(selected));
    }
  }, [selected]);

  const loadTrackingData = async (ticketId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      api.reloadToken();
      const data = await api.getTicketTracking(ticketId);
      setTrackingData(data);
    } catch (err) {
      console.error('Error cargando seguimiento:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar seguimiento');
    } finally {
      setIsLoading(false);
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
            {tickets.length > 0 ? (
              tickets.map(t => (
                <option key={t.id} value={t.id}>
                  #{t.id} • {t.message.slice(0,40)}... • {t.status}
                </option>
              ))
            ) : (
              <option value="">No hay tickets disponibles</option>
            )}
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
              {isLoading ? (
                <div className="text-center text-sm text-muted-foreground">
                  Cargando información del ticket...
                </div>
              ) : error ? (
                <div className="text-center text-sm text-red-500">
                  Error: {error}
                </div>
              ) : trackingData ? (
                <div className="grid gap-1 text-sm">
                  <div><b>{t("tickets.table.id")}:</b> {trackingData.id}</div>
                  <div><b>Asunto:</b> {trackingData.asunto}</div>
                  <div><b>Categoría:</b> {trackingData.categoria}</div>
                  <div><b>{t("tickets.priority")}:</b> {trackingData.prioridad}</div>
                  <div><b>{t("tickets.status")}:</b> {trackingData.estado}</div>
                  <div><b>{t("tickets.technician")}:</b> {trackingData.tecnicoAsignado || 'Sin asignar'}</div>
                  <div><b>{t("client.table.created")}:</b> {new Date(trackingData.fechaCreacion).toLocaleString()}</div>
                  <div><b>Última actualización:</b> {new Date(trackingData.fechaActualizacion).toLocaleString()}</div>
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  Selecciona un ticket para ver su información
                </div>
              )}
            </CardContent>
          </Card>
          <div className="md:col-span-2">
            {selected && trackingData ? (
              <ChatSystem 
                ticketId={trackingData.id} 
                onMessageSent={(message) => {
                  console.log('Mensaje enviado:', message);
                  // Recargar datos del ticket para actualizar la vista
                  loadTrackingData(trackingData.id);
                }}
              />
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-sm text-muted-foreground">
                    Selecciona un ticket para ver el chat
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
