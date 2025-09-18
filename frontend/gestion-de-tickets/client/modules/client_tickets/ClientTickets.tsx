import CreateTicket from "../client_create/CreateTicket";
import ClientTracking from "../client_tracking/ClientTracking";
import ClientHistory from "../client_history/ClientHistory";

export default function ClientTickets() {
  return (
    <div className="grid gap-6">
      <CreateTicket />
      <ClientTracking />
      <ClientHistory />
    </div>
  );
}
