package com.kasumio.config;

import com.kasumio.user.Role;
import com.kasumio.user.User;
import com.kasumio.user.UserRepository;
import com.kasumio.user.UserStatus;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Clean data initializer: provides base login accounts with ZERO predefined mock data.
 * No dummy candidates, opportunities, assessments, or evidence are seeded.
 */
@Component
@Profile("local")
public class LocalDemoDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public LocalDemoDataSeeder(UserRepository userRepository,
                               PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Clean admin account
        if (userRepository.findByEmail("admin@kasumio.com").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@kasumio.com");
            admin.setFullName("Administrator");
            admin.setPasswordHash(passwordEncoder.encode("password123"));
            admin.setRole(Role.ADMIN);
            admin.setStatus(UserStatus.ACTIVE);
            userRepository.save(admin);
        }

        // 2. Clean recruiter account - 0 opportunities, 0 candidates
        if (userRepository.findByEmail("recruiter@kasumio.com").isEmpty()) {
            User recruiter = new User();
            recruiter.setEmail("recruiter@kasumio.com");
            recruiter.setFullName("Recruiter");
            recruiter.setPasswordHash(passwordEncoder.encode("password123"));
            recruiter.setRole(Role.RECRUITER);
            recruiter.setStatus(UserStatus.ACTIVE);
            userRepository.save(recruiter);
        }

        // 3. Clean student account - 0 evidence, 0 dummy data
        if (userRepository.findByEmail("student@kasumio.com").isEmpty()) {
            User studentUser = new User();
            studentUser.setEmail("student@kasumio.com");
            studentUser.setFullName("Student");
            studentUser.setPasswordHash(passwordEncoder.encode("password123"));
            studentUser.setRole(Role.STUDENT);
            studentUser.setStatus(UserStatus.ACTIVE);
            userRepository.save(studentUser);
        }
    }
}
