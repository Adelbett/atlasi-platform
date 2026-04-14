package com.atlasi.backend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Data
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "request_id")
    private AtlasiRequest request;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime appointmentDate;
    private String startTime;
    private Integer duration;
    private String status;
    private String location;
    private String agentName;
    private String appointmentType; // زيارة ميدانية أو تركيب
    private String note;

    @PrePersist
    protected void onCreate() {
        if (duration == null || duration <= 0) {
            duration = 60;
        }
        if (status == null || status.isBlank()) {
            status = "قادمة";
        }
        if ((startTime == null || startTime.isBlank()) && appointmentDate != null) {
            startTime = appointmentDate.format(DateTimeFormatter.ofPattern("HH:mm"));
        }
    }
}
