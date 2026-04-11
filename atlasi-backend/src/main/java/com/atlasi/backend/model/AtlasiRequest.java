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
    
    private LocalDateTime requestDate;
    private String status; // En attente, Confirmée, Annulée, Visite planifiée
    
    @PrePersist
    protected void onCreate() {
        requestDate = LocalDateTime.now();
        if (status == null) {
            status = "En attente";
        }
    }
}
