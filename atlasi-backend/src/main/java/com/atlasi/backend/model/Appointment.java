package com.atlasi.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "request_id")
    private AtlasiRequest request;

    private LocalDateTime appointmentDate;
    private String agentName;
    private String appointmentType; // Prise de mesures, Livraison, Installation
    private String notes;
}
