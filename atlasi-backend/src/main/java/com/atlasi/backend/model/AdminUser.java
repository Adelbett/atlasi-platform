package com.atlasi.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class AdminUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password; // In a production env, this should be hashed (e.g., BCrypt)
    
    private String fullName;
}
