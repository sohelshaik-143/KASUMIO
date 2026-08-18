package com.kasumio.student;

import com.kasumio.common.SecurityUtils;
import com.kasumio.evidence.EvidenceRepository;
import com.kasumio.goal.CareerGoalRepository;
import com.kasumio.student.dto.StudentDashboardResponse;
import com.kasumio.student.dto.StudentProfileRequest;
import com.kasumio.student.dto.StudentProfileResponse;
import com.kasumio.user.Role;
import com.kasumio.user.User;
import com.kasumio.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final EvidenceRepository evidenceRepository;
    private final CareerGoalRepository careerGoalRepository;

    public StudentService(
            StudentRepository studentRepository,
            UserRepository userRepository,
            EvidenceRepository evidenceRepository,
            CareerGoalRepository careerGoalRepository) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.evidenceRepository = evidenceRepository;
        this.careerGoalRepository = careerGoalRepository;
    }

    @Transactional(readOnly = true)
    public StudentProfileResponse getCurrentProfile() {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        return mapToResponse(student);
    }

    @Transactional
    public StudentProfileResponse updateProfile(StudentProfileRequest request) {
        User user = SecurityUtils.getCurrentUser(userRepository);
        if (user.getRole() != Role.STUDENT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only students can have a student profile");
        }

        Student student = studentRepository.findByUser(user)
                .orElseGet(() -> new Student(user, request.getFullName(), request.getBio(), request.getUniversity(), request.getGraduationYear()));

        student.setFullName(request.getFullName().trim());
        student.setBio(request.getBio() != null ? request.getBio().trim() : null);
        student.setUniversity(request.getUniversity() != null ? request.getUniversity().trim() : null);
        student.setGraduationYear(request.getGraduationYear());

        student = studentRepository.save(student);
        return mapToResponse(student);
    }

    @Transactional(readOnly = true)
    public StudentProfileResponse getProfileById(Long studentId) {
        User currentUser = SecurityUtils.getCurrentUser(userRepository);

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        // Students can only view their own profile via this endpoint; Recruiters & Admins can view authorized student profile
        if (currentUser.getRole() == Role.STUDENT && !student.getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access another student's private profile");
        }

        return mapToResponse(student);
    }

    @Transactional(readOnly = true)
    public StudentDashboardResponse getDashboardMetrics() {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);

        long totalEvidence = evidenceRepository.countByStudent(student);
        long verifiedEvidence = evidenceRepository.countVerifiedByStudent(student);
        long careerGoals = careerGoalRepository.countByStudent(student);
        boolean profileComplete = StringUtils.hasText(student.getFullName()) && StringUtils.hasText(student.getUniversity());

        return new StudentDashboardResponse(totalEvidence, verifiedEvidence, careerGoals, profileComplete);
    }

    private StudentProfileResponse mapToResponse(Student student) {
        return new StudentProfileResponse(
                student.getId(),
                student.getUser().getId(),
                student.getUser().getEmail(),
                student.getFullName(),
                student.getBio(),
                student.getUniversity(),
                student.getGraduationYear()
        );
    }
}
