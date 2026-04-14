package com.atlasi.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class AtlasiRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String confirmationNumber; // e.g. ATL-2024-XXXX

    private String clientName;
    private String clientPhone; // Added client phone
    private String designType; // Pyramidal / Arqué / Console
    private String sizeInfo; // Grand SUV / Petit Sedan
    private String fixationType; // Murale / Sur poteaux
    private String fabricColor;
    private String address; // Added to store map location or text address
    private Double latitude; // Location linked to this specific order
    private Double longitude; // Location linked to this specific order
    private String mapUrl; // Optional maps link for this order
    
    private LocalDateTime requestDate;
    private String status; // En attente, Confirmée, Annulée, Visite planifiée

    private Double estimatedPrice; // Prix estimé (après remise fidélité si applicable)
    private String adminNotes;     // Notes internes Admin (non visibles par le client)
    
    @PrePersist
    protected void onCreate() {
        requestDate = LocalDateTime.now();
        if (status == null) {
            status = "En attente";
        }
    }
}
