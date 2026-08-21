package com.kasumio.action;

import com.kasumio.action.dto.*;
import com.kasumio.common.SecurityUtils;
import com.kasumio.student.Student;
import com.kasumio.student.StudentRepository;
import com.kasumio.user.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student/outcome-intelligence")
@Tag(name = "Evidence -> Outcome Intelligence Engine", description = "Deterministic capability transitions, decision traces, real opportunity impact calculation, and graphical progress")
public class OutcomeIntelligenceController {

    private final OutcomeIntelligenceService outcomeService;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public OutcomeIntelligenceController(
            OutcomeIntelligenceService outcomeService,
            StudentRepository studentRepository,
            UserRepository userRepository) {
        this.outcomeService = outcomeService;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get full Evidence -> Outcome Intelligence summary for current student")
    public ResponseEntity<OutcomeIntelligenceDto> getOutcomeIntelligence() {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        return ResponseEntity.ok(outcomeService.getOutcomeIntelligence(student));
    }

    @GetMapping("/traces")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get full chronological decision trace log for current student")
    public ResponseEntity<List<DecisionTraceDto>> getDecisionTraces() {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        return ResponseEntity.ok(outcomeService.getDecisionTraces(student));
    }

    @PostMapping("/recalculate")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Triggers deterministic outcome intelligence recalculation")
    public ResponseEntity<OutcomeIntelligenceDto> recalculate() {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        return ResponseEntity.ok(outcomeService.getOutcomeIntelligence(student));
    }
}
