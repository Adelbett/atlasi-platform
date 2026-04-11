package com.atlasi.backend;

import com.atlasi.backend.model.AdminUser;
import com.atlasi.backend.repository.AdminUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	CommandLineRunner initAdmin(AdminUserRepository adminRepo) {
		return args -> {
			// Create the specific admin account if it doesn't already exist
			String email = "brahimkardous@gmail.com";
			if (adminRepo.findByEmail(email).isEmpty()) {
				AdminUser admin = new AdminUser();
				admin.setEmail(email);
				admin.setPassword("brahim 12345");
				admin.setFullName("Brahim Kardous");
				adminRepo.save(admin);
				System.out.println("Admin account created successfully: " + email);
			}
		};
	}

}
