package com.atlasi.backend.controller;

import com.atlasi.backend.model.AdminUser;
import com.atlasi.backend.repository.AdminUserRepository;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AuthController {

    @Autowired
    private AdminUserRepository adminUserRepository;

    // ── Bootstrap ───────────────────────────────────────────────────

    @PostConstruct
    private void ensureDefaultAdmins() {
        // Primary admin — always MAIN_ADMIN
        Optional<AdminUser> primaryOpt = adminUserRepository.findByEmail("brahimkardous@gmail.com");
        if (primaryOpt.isEmpty()) {
            AdminUser a = new AdminUser();
            a.setEmail("brahimkardous@gmail.com");
            a.setPassword("brahim 12345");
            a.setFullName("Brahim Kardous");
            a.setTitle("مشرف رئيسي");
            a.setRole(AdminUser.Role.MAIN_ADMIN);
            adminUserRepository.save(a);
        } else {
            // Fix legacy record that may have null role
            AdminUser a = primaryOpt.get();
            if (a.getRole() != AdminUser.Role.MAIN_ADMIN) {
                a.setRole(AdminUser.Role.MAIN_ADMIN);
                if (a.getTitle() == null) a.setTitle("مشرف رئيسي");
                adminUserRepository.save(a);
            }
        }

        // Default editor account
        if (adminUserRepository.findByEmail("admin@atlasi.com").isEmpty()) {
            AdminUser a = new AdminUser();
            a.setEmail("admin@atlasi.com");
            a.setPassword("password123");
            a.setFullName("Atlasi Admin");
            a.setTitle("مشرف");
            a.setRole(AdminUser.Role.EDITOR);
            adminUserRepository.save(a);
        }
    }

    // ── Role helper ─────────────────────────────────────────────────

    /**
     * Resolves the caller's AdminUser from the X-Admin-Id request header and
     * returns it only if the caller has MAIN_ADMIN role.
     * Returns a 403 error response if the check fails.
     */
    private AdminUser resolveMainAdmin(HttpServletRequest request) {
        String idHeader = request.getHeader("X-Admin-Id");
        if (idHeader == null || idHeader.isBlank()) return null;
        try {
            Long callerId = Long.parseLong(idHeader.trim());
            return adminUserRepository.findById(callerId)
                    .filter(a -> a.getEffectiveRole() == AdminUser.Role.MAIN_ADMIN)
                    .orElse(null);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Map<String, Object> adminToMap(AdminUser a) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",       a.getId());
        m.put("email",    a.getEmail());
        m.put("fullName", a.getFullName()  == null ? "" : a.getFullName());
        m.put("title",    a.getTitle()     == null ? "" : a.getTitle());
        m.put("role",     a.getEffectiveRole().name());
        return m;
    }

    // ── Auth ────────────────────────────────────────────────────────

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email    = credentials.get("email");
        String password = credentials.get("password");

        Optional<AdminUser> userOpt = adminUserRepository.findByEmail(email);

        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            AdminUser user = userOpt.get();
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("success",  true);
            body.put("message",  "Login successful");
            body.put("id",       user.getId());
            body.put("fullName", user.getFullName()  == null ? "" : user.getFullName());
            body.put("title",    user.getTitle()     == null ? "" : user.getTitle());
            body.put("email",    user.getEmail());
            body.put("role",     user.getEffectiveRole().name());
            return ResponseEntity.ok(body);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "message", "Invalid email or password"
        ));
    }

    // ── Admin CRUD (MAIN_ADMIN only) ─────────────────────────────────

    @GetMapping("/admins")
    public ResponseEntity<?> getAdmins(HttpServletRequest request) {
        if (resolveMainAdmin(request) == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false, "message", "غير مصرح لك بعرض قائمة المشرفين"));
        }
        List<Map<String, Object>> list = adminUserRepository.findAll()
                .stream().map(this::adminToMap).toList();
        return ResponseEntity.ok(list);
    }

    @PostMapping("/admins")
    public ResponseEntity<?> createAdmin(@RequestBody Map<String, String> body,
                                         HttpServletRequest request) {
        if (resolveMainAdmin(request) == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false, "message", "غير مصرح لك بإضافة مشرف"));
        }

        String email    = body.get("email");
        String password = body.get("password");
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false, "message", "Email and password are required"));
        }
        if (adminUserRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "success", false, "message", "Admin already exists"));
        }

        AdminUser admin = new AdminUser();
        admin.setEmail(email.trim());
        admin.setPassword(password);
        admin.setFullName(body.getOrDefault("fullName", "").trim());
        admin.setTitle(body.getOrDefault("title", "مشرف").trim());

        String roleStr = body.getOrDefault("role", "EDITOR");
        admin.setRole("MAIN_ADMIN".equalsIgnoreCase(roleStr)
                ? AdminUser.Role.MAIN_ADMIN : AdminUser.Role.EDITOR);

        AdminUser saved = adminUserRepository.save(admin);
        return ResponseEntity.ok(adminToMap(saved));
    }

    @PutMapping("/admins/{id}")
    public ResponseEntity<?> updateAdmin(@PathVariable Long id,
                                         @RequestBody Map<String, String> body,
                                         HttpServletRequest request) {
        if (resolveMainAdmin(request) == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false, "message", "غير مصرح لك بتعديل بيانات المشرفين"));
        }

        AdminUser admin = adminUserRepository.findById(id).orElse(null);
        if (admin == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false, "message", "Admin not found"));
        }

        if (body.containsKey("fullName")) admin.setFullName(body.get("fullName").trim());
        if (body.containsKey("title"))    admin.setTitle(body.get("title").trim());
        if (body.containsKey("email")) {
            String newEmail = body.get("email").trim();
            if (!newEmail.equals(admin.getEmail()) &&
                adminUserRepository.findByEmail(newEmail).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                        "success", false, "message", "Email already in use"));
            }
            admin.setEmail(newEmail);
        }
        if (body.containsKey("password") && !body.get("password").isBlank()) {
            admin.setPassword(body.get("password"));
        }
        if (body.containsKey("role")) {
            String roleStr = body.get("role");
            admin.setRole("MAIN_ADMIN".equalsIgnoreCase(roleStr)
                    ? AdminUser.Role.MAIN_ADMIN : AdminUser.Role.EDITOR);
        }

        AdminUser saved = adminUserRepository.save(admin);
        return ResponseEntity.ok(adminToMap(saved));
    }

    @DeleteMapping("/admins/{id}")
    public ResponseEntity<?> deleteAdmin(@PathVariable Long id,
                                         HttpServletRequest request) {
        if (resolveMainAdmin(request) == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false, "message", "غير مصرح لك بحذف المشرفين"));
        }
        if (!adminUserRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false, "message", "Admin not found"));
        }
        if (adminUserRepository.count() <= 1) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false, "message", "Cannot delete the last admin"));
        }
        adminUserRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // ── Self profile update (any authenticated admin) ────────────────

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body,
                                           HttpServletRequest request) {
        String idHeader = request.getHeader("X-Admin-Id");
        if (idHeader == null || idHeader.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false, "message", "Missing X-Admin-Id header"));
        }

        Long callerId;
        try { callerId = Long.parseLong(idHeader.trim()); }
        catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false, "message", "Invalid X-Admin-Id"));
        }

        AdminUser admin = adminUserRepository.findById(callerId).orElse(null);
        if (admin == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false, "message", "Admin not found"));
        }

        if (body.containsKey("fullName")) admin.setFullName(body.get("fullName").trim());
        if (body.containsKey("title"))    admin.setTitle(body.get("title").trim());
        if (body.containsKey("email")) {
            String newEmail = body.get("email").trim();
            if (!newEmail.equals(admin.getEmail()) &&
                adminUserRepository.findByEmail(newEmail).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                        "success", false, "message", "Email already in use"));
            }
            admin.setEmail(newEmail);
        }
        if (body.containsKey("password") && !body.get("password").isBlank()) {
            admin.setPassword(body.get("password"));
        }

        AdminUser saved = adminUserRepository.save(admin);
        return ResponseEntity.ok(adminToMap(saved));
    }
}
