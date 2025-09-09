package com.example.demo.ticket.repository;

import com.example.demo.ticket.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    // Puedes agregar métodos personalizados aquí si lo necesitas
}
