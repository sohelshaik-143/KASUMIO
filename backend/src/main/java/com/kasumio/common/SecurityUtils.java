package com.kasumio.common;

import com.kasumio.student.Student;
import com.kasumio.student.StudentRepository;
import com.kasumio.user.User;
import com.kasumio.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }
        return authentication.getName();
    }

    public static User getCurrentUser(UserRepository userRepository) {
        String email = getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User account not found"));
    }

    public static synchronized Student getCurrentStudent(StudentRepository studentRepository, UserRepository userRepository) {
        User user = getCurrentUser(userRepository);
        return studentRepository.findByUser(user)
                .orElseGet(() -> {
                    try {
                        Student s = new Student();
                        s.setUser(user);
                        s.setFullName(user.getFullName() != null && !user.getFullName().isBlank() ? user.getFullName() : "Student");
                        return studentRepository.save(s);
                    } catch (Exception e) {
                        return studentRepository.findByUser(user)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to initialize student profile"));
                    }
                });
    }
}
