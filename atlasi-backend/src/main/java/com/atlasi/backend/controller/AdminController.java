package com.atlasi.backend.controller;

import com.atlasi.backend.model.Appointment;
import com.atlasi.backend.model.AtlasiRequest;
import com.atlasi.backend.repository.AppointmentRepository;
import com.atlasi.backend.repository.AtlasiRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*") // For development with React
public class AdminController {

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
        // Generate unique confirmation number
        String randomSuffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        request.setConfirmationNumber("ATL-2024-" + randomSuffix);
        
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
        if (appointment.getRequest() != null && appointment.getRequest().getId() != null) {
            AtlasiRequest req = requestRepository.findById(appointment.getRequest().getId())
                    .orElseThrow(() -> new RuntimeException("Request not found"));
            req.setStatus("Visite planifiée");
            requestRepository.save(req);
            appointment.setRequest(req);
        }
        return appointmentRepository.save(appointment);
    }
}
