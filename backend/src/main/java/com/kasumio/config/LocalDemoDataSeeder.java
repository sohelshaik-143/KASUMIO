package com.kasumio.config;

import com.kasumio.organization.Organization;
import com.kasumio.organization.OrganizationApprovalStatus;
import com.kasumio.organization.OrganizationRepository;
import com.kasumio.organization.OrganizationType;
import com.kasumio.student.Student;
import com.kasumio.student.StudentRepository;
import com.kasumio.user.Role;
import com.kasumio.user.User;
import com.kasumio.user.UserRepository;
import com.kasumio.user.UserStatus;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds demo accounts and sample organization when running under the "local" profile.
 */
@Component
@Profile("local")
public class LocalDemoDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;

    public LocalDemoDataSeeder(UserRepository userRepository,
                               StudentRepository studentRepository,
                               OrganizationRepository organizationRepository,
                               PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        Organization acme = organizationRepository.findByNameIgnoreCase("Acme Engineering")
                .orElseGet(() -> {
                    Organization org = new Organization();
                    org.setName("Acme Engineering");
                    org.setType(OrganizationType.COMPANY);
                    org.setWebsite("https://acme.example.com");
                    org.setApprovalStatus(OrganizationApprovalStatus.APPROVED);
                    return organizationRepository.save(org);
                });

        // 1. Admin account
        if (userRepository.findByEmail("admin@kasumio.com").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@kasumio.com");
            admin.setPasswordHash(passwordEncoder.encode("password123"));
            admin.setRole(Role.ADMIN);
            admin.setStatus(UserStatus.ACTIVE);
            admin.setOrganization(acme);
            userRepository.save(admin);
        }

        // 2. Recruiter account
        if (userRepository.findByEmail("recruiter@kasumio.com").isEmpty()) {
            User recruiter = new User();
            recruiter.setEmail("recruiter@kasumio.com");
            recruiter.setPasswordHash(passwordEncoder.encode("password123"));
            recruiter.setRole(Role.RECRUITER);
            recruiter.setStatus(UserStatus.ACTIVE);
            recruiter.setOrganization(acme);
            userRepository.save(recruiter);
        }

        // 3. Student account
        if (userRepository.findByEmail("student@kasumio.com").isEmpty()) {
            User studentUser = new User();
            studentUser.setEmail("student@kasumio.com");
            studentUser.setPasswordHash(passwordEncoder.encode("password123"));
            studentUser.setRole(Role.STUDENT);
            studentUser.setStatus(UserStatus.ACTIVE);
            studentUser = userRepository.save(studentUser);

            Student student = new Student();
            student.setUser(studentUser);
            student.setFullName("Alex Rivera");
            student.setBio("Software Engineering Student focusing on Distributed Systems and Full-Stack Engineering.");
            student.setUniversity("Berkeley University");
            student.setGraduationYear(2026);
            studentRepository.save(student);
        }
    }
}
