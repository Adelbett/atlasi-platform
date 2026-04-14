package com.atlasi.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class AdminUser {

    public enum Role { MAIN_ADMIN, EDITOR }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password; // In a production env, this should be hashed (e.g., BCrypt)

    private String fullName;  // الاسم الكامل

    private String title;     // اللقب

    @Enumerated(EnumType.STRING)
    private Role role;        // null treated as EDITOR for legacy records

    /** Returns effective role, treating null (legacy rows) as EDITOR. */
    public Role getEffectiveRole() {
        return role != null ? role : Role.EDITOR;
    }
}
