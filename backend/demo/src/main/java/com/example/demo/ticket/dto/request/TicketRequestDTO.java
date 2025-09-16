package com.example.demo.ticket.dto.request;

public class TicketRequestDTO {
     private String descripcion;
    private String prioridad;

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getPrioridad() { return prioridad; }
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; }
}
