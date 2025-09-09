export type TicketStatus = "open" | "in_progress" | "pending" | "resolved" | "closed";
export type Priority = "high" | "medium" | "low";
export type TicketEvent = { at: string; author: "client" | "technician" | "system"; message: string; type: "comment" | "status" };
export type Ticket = {
  id: string;
  name: string;
  location: string;
  message: string;
  priority: Priority;
  attachmentName?: string;
  status: TicketStatus;
  technician: string;
  createdAt: string;
  closedAt?: string;
  events: TicketEvent[];
};

const KEY = "client_tickets";
let tickets: Ticket[] = load();
const listeners = new Set<() => void>();
const timeouts = new Map<string, number[]>();

function save() {
  localStorage.setItem(KEY, JSON.stringify(tickets));
}
function load(): Ticket[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function notify() { save(); listeners.forEach((fn) => fn()); }

export function subscribe(fn: () => void) { listeners.add(fn); return () => listeners.delete(fn); }
export function getTickets() { return tickets.slice(); }
export function getTicket(id: string) { return tickets.find(t => t.id === id) || null; }

function scheduleProgress(id: string) {
  const steps: TicketStatus[] = ["in_progress", "pending", "resolved", "closed"];
  let delay = 1500;
  const ids: number[] = [];
  steps.forEach((st, idx) => {
    const tid = window.setTimeout(() => {
      changeStatus(id, st, `Status changed to ${st}`);
    }, delay * (idx + 1));
    ids.push(tid);
  });
  timeouts.set(id, ids);
}

function clearProgress(id: string) {
  const arr = timeouts.get(id); if (!arr) return; arr.forEach((tid) => clearTimeout(tid)); timeouts.delete(id);
}

export function createTicket(input: { name: string; location: string; message: string; priority: Priority; attachmentName?: string; }): Ticket {
  const id = `T-${Date.now()}`;
  const technician = assignTechnician(input);
  const now = new Date().toISOString();
  const t: Ticket = {
    id,
    name: input.name,
    location: input.location,
    message: input.message,
    priority: input.priority,
    attachmentName: input.attachmentName,
    status: "open",
    technician,
    createdAt: now,
    events: [
      { at: now, author: "system", message: "Ticket created", type: "status" },
      { at: now, author: "system", message: `Assigned to ${technician}`, type: "status" },
    ],
  };
  tickets = [t, ...tickets];
  notify();
  scheduleProgress(id);
  return t;
}

export function addComment(id: string, author: TicketEvent["author"], message: string) {
  const t = getTicket(id); if (!t) return;
  t.events.push({ at: new Date().toISOString(), author, message, type: "comment" });
  notify();
}

export function changeStatus(id: string, status: TicketStatus, message?: string) {
  const t = getTicket(id); if (!t) return;
  t.status = status;
  if (status === "closed") t.closedAt = new Date().toISOString();
  if (message) t.events.push({ at: new Date().toISOString(), author: "system", message, type: "status" });
  notify();
}

export function reopenTicket(id: string) {
  clearProgress(id);
  const t = getTicket(id); if (!t) return;
  t.status = "open"; t.closedAt = undefined;
  t.events.push({ at: new Date().toISOString(), author: "client", message: "Ticket reopened by client", type: "status" });
  notify();
  scheduleProgress(id);
}

function assignTechnician(input: { location: string; priority: Priority }): string {
  if (input.priority === "high") return "Alice (L1)";
  if (input.location.toLowerCase().includes("hq")) return "Bob (HQ)";
  return "Support Team";
}
