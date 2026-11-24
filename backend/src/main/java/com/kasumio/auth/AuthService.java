package com.kasumio.auth;

import com.kasumio.auth.dto.AuthResponse;
import com.kasumio.auth.dto.LoginRequest;
import com.kasumio.auth.dto.RegisterRequest;
import com.kasumio.auth.dto.UserDto;
import com.kasumio.organization.Organization;
import com.kasumio.organization.OrganizationRepository;
import com.kasumio.student.Student;
import com.kasumio.student.StudentRepository;
import com.kasumio.user.Role;
import com.kasumio.user.User;
import com.kasumio.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(
            UserRepository userRepository,
            StudentRepository studentRepository,
            OrganizationRepository organizationRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }

        if (request.getPassword() == null || request.getPassword().length() < 10) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 10 characters long");
        }

        Role role = request.getRole() != null ? request.getRole() : Role.STUDENT;
        if (role == Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Registration as an administrator is prohibited. Admins must be provisioned out-of-band.");
        }
        if (role != Role.STUDENT && role != Role.RECRUITER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid registration role. Only STUDENT and RECRUITER are supported.");
        }

        Organization organization = null;
        com.kasumio.user.UserStatus userStatus = com.kasumio.user.UserStatus.ACTIVE;

        if (role == Role.RECRUITER) {
            // Recruiters start PENDING until an admin approves their organization
            userStatus = com.kasumio.user.UserStatus.PENDING;
            if (StringUtils.hasText(request.getOrganizationName())) {
                String orgName = request.getOrganizationName().trim();
                organization = organizationRepository.findByNameIgnoreCase(orgName)
                        .orElseGet(() -> organizationRepository.save(new com.kasumio.organization.Organization(
                                orgName,
                                com.kasumio.organization.OrganizationType.COMPANY,
                                null,
                                com.kasumio.organization.OrganizationApprovalStatus.PENDING)));
                if (organization.getApprovalStatus() == com.kasumio.organization.OrganizationApprovalStatus.APPROVED) {
                    userStatus = com.kasumio.user.UserStatus.ACTIVE;
                }
            } else if (request.getOrganizationId() != null) {
                organization = organizationRepository.findById(request.getOrganizationId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Specified organization does not exist"));
                if (organization.getApprovalStatus() == com.kasumio.organization.OrganizationApprovalStatus.APPROVED) {
                    userStatus = com.kasumio.user.UserStatus.ACTIVE;
                }
            }
        }

        User user = new User(
                normalizedEmail,
                passwordEncoder.encode(request.getPassword()),
                role,
                organization,
                userStatus
        );
        if (StringUtils.hasText(request.getFullName())) {
            user.setFullName(request.getFullName().trim());
        }
        user = userRepository.save(user);

        Student student = null;
        if (role == Role.STUDENT) {
            String fullName = StringUtils.hasText(request.getFullName()) 
                    ? request.getFullName().trim() 
                    : normalizedEmail.split("@")[0];
            student = new Student(user, fullName, null, null, null);
            student = studentRepository.save(student);
        }

        String token = jwtTokenProvider.generateToken(user);
        UserDto userDto = buildUserDto(user, student);

        return new AuthResponse(token, userDto);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        Student student = null;
        if (user.getRole() == Role.STUDENT) {
            student = studentRepository.findByUser(user).orElse(null);
        }

        String token = jwtTokenProvider.generateToken(user);
        UserDto userDto = buildUserDto(user, student);

        return new AuthResponse(token, userDto);
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUserDto(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found"));

        Student student = null;
        if (user.getRole() == Role.STUDENT) {
            student = studentRepository.findByUser(user).orElse(null);
        }

        return buildUserDto(user, student);
    }

    @Transactional
    public UserDto updateUserProfile(String email, com.kasumio.auth.dto.UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found"));

        if (StringUtils.hasText(request.getFullName())) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl().trim().isEmpty() ? null : request.getAvatarUrl().trim());
        }

        Student student = null;
        if (user.getRole() == Role.STUDENT) {
            student = studentRepository.findByUser(user).orElse(null);
            if (student != null) {
                if (StringUtils.hasText(request.getFullName())) {
                    student.setFullName(request.getFullName().trim());
                }
                if (request.getAvatarUrl() != null) {
                    student.setAvatarUrl(request.getAvatarUrl().trim().isEmpty() ? null : request.getAvatarUrl().trim());
                }
                if (request.getBio() != null) {
                    student.setBio(request.getBio().trim());
                }
                if (request.getUniversity() != null) {
                    student.setUniversity(request.getUniversity().trim());
                }
                if (request.getGraduationYear() != null) {
                    student.setGraduationYear(request.getGraduationYear());
                }
                student = studentRepository.save(student);
            }
        } else if (user.getRole() == Role.RECRUITER && StringUtils.hasText(request.getOrganizationName())) {
            if (user.getOrganization() != null) {
                user.getOrganization().setName(request.getOrganizationName().trim());
                organizationRepository.save(user.getOrganization());
            }
        }

        user = userRepository.save(user);
        return buildUserDto(user, student);
    }

    private UserDto buildUserDto(User user, Student student) {
        Long orgId = user.getOrganization() != null ? user.getOrganization().getId() : null;
        String orgName = user.getOrganization() != null ? user.getOrganization().getName() : null;
        Long studentId = student != null ? student.getId() : null;
        String fullName = student != null && student.getFullName() != null ? student.getFullName() : user.getFullName();
        String avatarUrl = student != null && student.getAvatarUrl() != null ? student.getAvatarUrl() : user.getAvatarUrl();

        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                orgId,
                orgName,
                studentId,
                fullName,
                avatarUrl,
                user.getStatus() != null ? user.getStatus().name() : "ACTIVE",
                user.getCreatedAt()
        );
    }
}
