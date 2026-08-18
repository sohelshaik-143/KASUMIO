package com.kasumio.student;

import com.kasumio.student.dto.StudentDashboardResponse;
import com.kasumio.student.dto.StudentProfileRequest;
import com.kasumio.student.dto.StudentProfileResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
@Tag(name = "Students", description = "Student profile and dashboard metrics management")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/profile")
    @Operation(summary = "Get current authenticated student's profile")
    public ResponseEntity<StudentProfileResponse> getCurrentProfile() {
        return ResponseEntity.ok(studentService.getCurrentProfile());
    }

    @PutMapping("/profile")
    @Operation(summary = "Create or update current authenticated student's profile")
    public ResponseEntity<StudentProfileResponse> updateProfile(@Valid @RequestBody StudentProfileRequest request) {
        return ResponseEntity.ok(studentService.updateProfile(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get student profile by ID (Owner, authorized recruiter, or admin)")
    public ResponseEntity<StudentProfileResponse> getProfileById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getProfileById(id));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get truthful, calculated dashboard statistics for authenticated student")
    public ResponseEntity<StudentDashboardResponse> getDashboardMetrics() {
        return ResponseEntity.ok(studentService.getDashboardMetrics());
    }
}
