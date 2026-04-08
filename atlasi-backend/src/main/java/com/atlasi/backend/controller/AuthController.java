package com.atlasi.backend.controller;

import com.atlasi.backend.model.AdminUser;
import com.atlasi.backend.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // For React
public class AuthController {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        // Hardcode a default admin if DB is empty for demo purposes
        if (adminUserRepository.count() == 0) {
            AdminUser defaultAdmin = new AdminUser();
            defaultAdmin.setEmail("admin@atlasi.com");
            defaultAdmin.setPassword("password123");
            defaultAdmin.setFullName("Atlasi Admin");
            adminUserRepository.save(defaultAdmin);
        }

        Optional<AdminUser> userOpt = adminUserRepository.findByEmail(email);
        
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            AdminUser user = userOpt.get();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Login successful",
                "fullName", user.getFullName(),
                "email", user.getEmail()
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "message", "Invalid email or password"
            ));
        }
    }
}
