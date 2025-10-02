package com.example.demo.categoria.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "categories")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Categoria {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    
    @Column(name = "name", nullable = false, length = 100, unique = true)
    private String name;
    
    @Column(name = "description", length = 500)
    private String description;
    
    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;
    
    @Column(name = "color_hex", length = 7)
    private String colorHex; // For UI: #FF5733
    
    @Column(name = "icon", length = 50)
    private String icon; // For UI: "fa-tools", "fa-user", etc.
    
    @Column(name = "sort_order")
    @Builder.Default
    private Integer order = 0; // For ordering in lists
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationship with tickets (optional, for statistics)
    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    private List<com.example.demo.ticket.model.Ticket> tickets;
    
    // Utility methods
    public boolean isActiva() {
        return Boolean.TRUE.equals(active);
    }
    
    public String getFullName() {
        return name + (description != null ? " - " + description : "");
    }
    
    // Getter para compatibilidad con código existente
    public Long getIdCategoria() {
        return id;
    }
    
    // Setter para compatibilidad con código existente
    public void setIdCategoria(Long idCategoria) {
        this.id = idCategoria;
    }
}
