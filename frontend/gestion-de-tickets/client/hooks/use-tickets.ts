import { useState, useEffect } from "react";
import { getTickets, subscribe, Ticket, loadTickets, getLoadingState } from "../modules/client_tickets/apiStore";

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>(getTickets());
  const { isLoading, error } = getLoadingState();

  useEffect(() => {
    console.log('useTickets: Inicializando hook');
    const unsub = subscribe(() => {
      console.log('useTickets: Actualizando tickets desde store');
      setTickets(getTickets());
    });
    // Cargar tickets al montar el componente
    console.log('useTickets: Cargando tickets del backend');
    loadTickets();
    return unsub;
  }, []);

  return {
    tickets,
    isLoading,
    error,
    refreshTickets: loadTickets
  };
}
