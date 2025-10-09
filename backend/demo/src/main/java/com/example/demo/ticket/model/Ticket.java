package com.example.demo.ticket.model;

import com.example.demo.usuario.model.Usuario;
import com.example.demo.categoria.model.Categoria;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // User who creates the ticket (can be normal user or admin)
    @ManyToOne
    @JoinColumn(name = "creator_id")
    private Usuario creator;

    // Technician assigned to the ticket
    @ManyToOne
    @JoinColumn(name = "assigned_technician_id")
    private Usuario assignedTechnician;
    
    // Assigned technician email (for compatibility)
    @Column(name = "assigned_technician_email")
    private String assignedTechnicianEmail;

    // Ticket category
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Categoria category;

    // Ticket status
    private String status;

    // Employee form fields
    @Column(name = "location", nullable = false)
    private String location;

    @Column(name = "query", columnDefinition = "TEXT")
    private String query;

    // Category as string (for temporary compatibility)
    @Column(name = "category_string")
    private String categoryString;

    // Category field (required by table)
    @Column(name = "category_name")
    private String categoryName;

    @Column(name = "attached_file")
    private String attachedFile;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // SLA fields
    @Column(name = "sla_configuration_id")
    private Long slaConfigurationId;
    
    @Column(name = "sla_response_deadline")
    private LocalDateTime slaResponseDeadline;
    
    @Column(name = "sla_resolution_deadline")
    private LocalDateTime slaResolutionDeadline;
    
    @Column(name = "sla_response_time_hours")
    private Integer slaResponseTimeHours;
    
    @Column(name = "sla_resolution_time_hours")
    private Integer slaResolutionTimeHours;
    
    @Column(name = "sla_violated")
    private Boolean slaViolated = false;

    // Existing fields
    private String subject;
    private String description;
    private String priority;

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getCreator() { return creator; }
    public void setCreator(Usuario creator) { this.creator = creator; }
    
    // Convenience methods to get creator data
    public String getCreatorName() {
        return creator != null ? creator.getFullName() : "Unknown User";
    }
    
    public String getCreatorEmail() {
        return creator != null ? creator.getEmail() : null;
    }

    public Usuario getAssignedTechnician() { return assignedTechnician; }
    public void setAssignedTechnician(Usuario assignedTechnician) { this.assignedTechnician = assignedTechnician; }
    
    public String getAssignedTechnicianEmail() { return assignedTechnicianEmail; }
    public void setAssignedTechnicianEmail(String assignedTechnicianEmail) { this.assignedTechnicianEmail = assignedTechnicianEmail; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    // Getters and setters for form fields
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public Categoria getCategory() { return category; }
    public void setCategory(Categoria category) { this.category = category; }

    public String getCategoryString() { return categoryString; }
    public void setCategoryString(String categoryString) { this.categoryString = categoryString; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getAttachedFile() { return attachedFile; }
    public void setAttachedFile(String attachedFile) { this.attachedFile = attachedFile; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Getters and setters for SLA fields
    public Long getSlaConfigurationId() { return slaConfigurationId; }
    public void setSlaConfigurationId(Long slaConfigurationId) { this.slaConfigurationId = slaConfigurationId; }
    
    public LocalDateTime getSlaResponseDeadline() { return slaResponseDeadline; }
    public void setSlaResponseDeadline(LocalDateTime slaResponseDeadline) { this.slaResponseDeadline = slaResponseDeadline; }
    
    public LocalDateTime getSlaResolutionDeadline() { return slaResolutionDeadline; }
    public void setSlaResolutionDeadline(LocalDateTime slaResolutionDeadline) { this.slaResolutionDeadline = slaResolutionDeadline; }
    
    public Integer getSlaResponseTimeHours() { return slaResponseTimeHours; }
    public void setSlaResponseTimeHours(Integer slaResponseTimeHours) { this.slaResponseTimeHours = slaResponseTimeHours; }
    
    public Integer getSlaResolutionTimeHours() { return slaResolutionTimeHours; }
    public void setSlaResolutionTimeHours(Integer slaResolutionTimeHours) { this.slaResolutionTimeHours = slaResolutionTimeHours; }
    
    public Boolean getSlaViolated() { return slaViolated; }
    public void setSlaViolated(Boolean slaViolated) { this.slaViolated = slaViolated; }

    // Method to initialize dates
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
