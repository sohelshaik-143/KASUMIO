package com.kasumio.assessment;

import com.kasumio.assessment.dto.*;
import com.kasumio.common.SecurityUtils;
import com.kasumio.student.Student;
import com.kasumio.student.StudentRepository;
import com.kasumio.user.User;
import com.kasumio.user.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assessments")
@Tag(name = "Technical Assessments & Screening Engine", description = "AI-assisted technical assessment generation, adaptive screening, sandboxed execution, and evaluation")
public class AssessmentController {

    private final AssessmentService assessmentService;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public AssessmentController(AssessmentService assessmentService,
                                StudentRepository studentRepository,
                                UserRepository userRepository) {
        this.assessmentService = assessmentService;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    @Operation(summary = "List all active technical assessments across opportunities")
    public ResponseEntity<List<AssessmentDto>> getAllAssessments() {
        return ResponseEntity.ok(assessmentService.getAllAssessments());
    }

    @GetMapping("/opportunity/{opportunityId}")
    @Operation(summary = "Get or generate technical screening assessment for an opportunity")
    public ResponseEntity<AssessmentDto> getAssessmentForOpportunity(@PathVariable Long opportunityId) {
        return ResponseEntity.ok(assessmentService.getOrCreateAssessmentForOpportunity(opportunityId));
    }

    @PostMapping("/generate/{opportunityId}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Recruiter generates or updates assessment blueprint for an opportunity")
    public ResponseEntity<AssessmentDto> generateAssessmentBlueprint(@PathVariable Long opportunityId) {
        return ResponseEntity.ok(assessmentService.getOrCreateAssessmentForOpportunity(opportunityId));
    }

    @PutMapping("/{assessmentId}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Recruiter customizes assessment blueprint thresholds and metadata")
    public ResponseEntity<AssessmentDto> updateAssessment(@PathVariable Long assessmentId,
                                                          @RequestBody UpdateAssessmentRequest request) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(assessmentService.updateAssessment(assessmentId, request, recruiter));
    }

    @PostMapping("/{assessmentId}/start")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Candidate starts or resumes a Round-1 technical assessment attempt with transparency confirmation")
    public ResponseEntity<AssessmentAttemptDto> startAttempt(@PathVariable Long assessmentId,
                                                             @RequestBody(required = false) StartAssessmentRequest request) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        return ResponseEntity.ok(assessmentService.startAttempt(assessmentId, student, request));
    }

    @PostMapping("/attempts/{attemptId}/telemetry")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Ingests real-time non-punitive assessment signals telemetry")
    public ResponseEntity<Void> recordTelemetry(@PathVariable Long attemptId,
                                                @RequestBody TelemetryIngestRequest request) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        assessmentService.recordTelemetry(attemptId, request, student);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/attempts/{attemptId}/recruiter-decision")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Recruiter records evaluation action (VERIFIED, REQUEST_ADDITIONAL_ASSESSMENT, CONNECTED, ARCHIVED)")
    public ResponseEntity<AssessmentResultDto> recordRecruiterDecision(@PathVariable Long attemptId,
                                                                       @RequestBody RecruiterDecisionRequest request) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(assessmentService.recordRecruiterDecision(attemptId, request, recruiter));
    }

    @GetMapping("/attempts/{attemptId}/next-question")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Fetch next adaptive question based on candidate demonstrated capability")
    public ResponseEntity<QuestionDetailDto> getNextQuestion(@PathVariable Long attemptId) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        return assessmentService.getNextAdaptiveQuestion(attemptId, student)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/attempts/{attemptId}/questions/{questionId}/run-code")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Execute candidate code safely in isolated sandbox against sample test cases")
    public ResponseEntity<RunCodeResponse> runCode(@PathVariable Long attemptId,
                                                    @PathVariable Long questionId,
                                                    @RequestBody RunCodeRequest request) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        return ResponseEntity.ok(assessmentService.runCode(attemptId, questionId, request, student));
    }

    @PostMapping("/attempts/{attemptId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Submit code or MCQ answer for deterministic evaluation and adaptive score update")
    public ResponseEntity<SubmitQuestionResponse> submitQuestion(@PathVariable Long attemptId,
                                                                 @RequestBody SubmitQuestionRequest request) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        return ResponseEntity.ok(assessmentService.submitQuestion(attemptId, request, student));
    }

    @PostMapping("/attempts/{attemptId}/complete")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Finalize assessment attempt, calculate verified score, and mint portfolio evidence")
    public ResponseEntity<AssessmentResultDto> completeAttempt(@PathVariable Long attemptId) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        return ResponseEntity.ok(assessmentService.completeAttempt(attemptId, student));
    }

    @GetMapping("/attempts/{attemptId}/result")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Candidate retrieves their completed assessment results, feedback, and complexity tips")
    public ResponseEntity<AssessmentResultDto> getAttemptResult(@PathVariable Long attemptId) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        return ResponseEntity.ok(assessmentService.getAttemptResult(attemptId, student));
    }

    @GetMapping("/opportunity/{opportunityId}/candidate-results/{studentId}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Recruiter inspects candidate assessment submission code, deterministic test results, and feedback")
    public ResponseEntity<AssessmentResultDto> getCandidateAssessmentForRecruiter(@PathVariable Long opportunityId,
                                                                                 @PathVariable Long studentId) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(assessmentService.getCandidateAssessmentForRecruiter(opportunityId, studentId, recruiter));
    }

    @GetMapping("/opportunity/{opportunityId}/candidate-alias-results/{candidateAlias}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Recruiter inspects candidate assessment submission code, deterministic test results, and feedback by anonymous alias")
    public ResponseEntity<AssessmentResultDto> getCandidateAssessmentByAliasForRecruiter(@PathVariable Long opportunityId,
                                                                                        @PathVariable String candidateAlias) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(assessmentService.getCandidateAssessmentByAliasForRecruiter(opportunityId, candidateAlias, recruiter));
    }

    @PostMapping("/{assessmentId}/agent-take")
    @PreAuthorize("hasAnyRole('STUDENT', 'RECRUITER', 'ADMIN')")
    @Operation(summary = "Agent autonomously takes the technical assessment on behalf of the user/candidate")
    public ResponseEntity<AssessmentResultDto> agentTakeAssessment(@PathVariable Long assessmentId) {
        User currentUser = SecurityUtils.getCurrentUser(userRepository);
        Student student;
        if (currentUser.getRole() == com.kasumio.user.Role.STUDENT) {
            student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        } else {
            student = studentRepository.findAll().stream().findFirst()
                    .orElseGet(() -> {
                        User studentUser = userRepository.save(new User("candidate.demo@kasumo.internal", "password123", com.kasumio.user.Role.STUDENT, currentUser.getOrganization()));
                        return studentRepository.save(new Student(studentUser, "Alex Mercer (Verified Candidate)", null, null, null));
                    });
        }
        return ResponseEntity.ok(assessmentService.autoTakeAssessment(assessmentId, student));
    }
}
