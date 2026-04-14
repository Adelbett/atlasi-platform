package com.atlasi.backend.controller;

import com.atlasi.backend.model.Appointment;
import com.atlasi.backend.model.AtlasiRequest;
import com.atlasi.backend.repository.AppointmentRepository;
import com.atlasi.backend.repository.AtlasiRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*") // For development with React
public class AdminController {

    private static final Set<String> ALLOWED_VISIT_TYPES = Set.of("زيارة ميدانية", "تركيب");

    @Autowired
    private AtlasiRequestRepository requestRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    // --- Demandes (Requests) ---
    
    @GetMapping("/requests")
    public List<AtlasiRequest> getAllRequests() {
        return requestRepository.findAll();
    }

    @PostMapping("/requests")
    public AtlasiRequest createRequest(@RequestBody AtlasiRequest request) {
        return requestRepository.save(request);
    }

    @PutMapping("/requests/{id}/accept")
    public AtlasiRequest acceptRequest(@PathVariable Long id) {
        AtlasiRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        
        request.setStatus("Confirmée");
        // Keep existing confirmationNumber if already set by the client
        if (request.getConfirmationNumber() == null || request.getConfirmationNumber().isBlank()) {
            String randomSuffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
            request.setConfirmationNumber("ATL-" + randomSuffix);
        }
        
        return requestRepository.save(request);
    }

    @PutMapping("/requests/{id}/reject")
    public AtlasiRequest rejectRequest(@PathVariable Long id) {
        AtlasiRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        
        request.setStatus("Annulée");
        return requestRepository.save(request);
    }

    // --- Rendez-vous (Appointments) ---

    @GetMapping("/appointments")
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @PostMapping("/appointments")
    public Appointment createAppointment(@RequestBody Appointment appointment) {
        if (!ALLOWED_VISIT_TYPES.contains(appointment.getAppointmentType())) {
            appointment.setAppointmentType("زيارة ميدانية");
        }

        if (appointment.getRequest() != null && appointment.getRequest().getId() != null) {
            requestRepository.findById(appointment.getRequest().getId()).ifPresentOrElse(req -> {
                req.setStatus("Visite planifiée");
                requestRepository.save(req);
                appointment.setRequest(req);
            }, () -> appointment.setRequest(null));
        }

        if (appointment.getStatus() == null || appointment.getStatus().isBlank()) {
            appointment.setStatus("قادمة");
        }
        return appointmentRepository.save(appointment);
    }

    @PutMapping("/appointments/{id}/complete")
    public Appointment completeAppointment(@PathVariable Long id) {
        return setAppointmentStatus(id, "مكتملة", "تركيب مكتمل");
    }

    @PutMapping("/appointments/{id}/postpone")
    public Appointment postponeAppointment(@PathVariable Long id) {
        return setAppointmentStatus(id, "مرجأة", null);
    }

    @PutMapping("/appointments/{id}/cancel")
    public Appointment cancelAppointment(@PathVariable Long id) {
        return setAppointmentStatus(id, "ملغاة", "Annulée");
    }

    private Appointment setAppointmentStatus(Long id, String apptStatus, String linkedRequestStatus) {
        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appt.setStatus(apptStatus);
        if (linkedRequestStatus != null && appt.getRequest() != null) {
            appt.getRequest().setStatus(linkedRequestStatus);
            requestRepository.save(appt.getRequest());
        }
        return appointmentRepository.save(appt);
    }
}
