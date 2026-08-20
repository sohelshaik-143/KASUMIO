package com.kasumio.action;

import com.kasumio.action.dto.*;
import com.kasumio.common.SecurityUtils;
import com.kasumio.student.Student;
import com.kasumio.student.StudentRepository;
import com.kasumio.user.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student/career")
@Tag(name = "Personal Career Action & Adaptive Growth Engine", description = "Adaptive next-move recommendations, action details, action history, and feedback customization")
public class CareerActionController {

    private final CareerActionService actionService;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public CareerActionController(
            CareerActionService actionService,
            StudentRepository studentRepository,
            UserRepository userRepository) {
        this.actionService = actionService;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/next-action")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get single primary 'Your Next Move' action and up to 2 contextually relevant alternatives")
    public ResponseEntity<CareerActionResponseDto> getNextAction() {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        return ResponseEntity.ok(actionService.findNextBestAction(student));
    }

    @GetMapping("/actions/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get full action detail: what to do, why, reused project, capability strengthened, targeted opportunities")
    public ResponseEntity<CareerActionDetailDto> getActionDetails(@PathVariable String id) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        return ResponseEntity.ok(actionService.getActionDetails(student, id));
    }

    @PostMapping("/actions/{id}/start")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Record action as STARTED in student action history")
    public ResponseEntity<Void> startAction(@PathVariable String id) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        actionService.startAction(student, id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/actions/{id}/complete")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Record action as COMPLETED and link to uploaded evidence ID")
    public ResponseEntity<Void> completeAction(
            @PathVariable String id,
            @RequestParam(required = false) Long evidenceId) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        actionService.completeAction(student, id, evidenceId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/actions/{id}/skip")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Record action as SKIPPED in student action history")
    public ResponseEntity<Void> skipAction(@PathVariable String id) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        actionService.skipAction(student, id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get full chronological history of student career actions and outcomes")
    public ResponseEntity<java.util.List<CareerActionHistory>> getActionHistory() {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        return ResponseEntity.ok(actionService.getStudentHistory(student));
    }

    @GetMapping("/action-impact/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Calculate readiness impact of completing a specific action")
    public ResponseEntity<CareerActionImpactDto> getActionImpact(@PathVariable String id) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        return ResponseEntity.ok(actionService.calculateActionImpact(student, id));
    }

    @PostMapping("/feedback")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Submit per-student action recommendation feedback (e.g. ALREADY_KNOW, TOO_DIFFICULT, WRONG_GOAL, NOT_INTERESTED)")
    public ResponseEntity<Void> submitFeedback(@Valid @RequestBody CareerActionFeedbackRequest request) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        actionService.submitFeedback(student, request);
        return ResponseEntity.ok().build();
    }
}
