package com.kasumio.assessment;

import com.kasumio.assessment.dto.*;
import com.kasumio.assessment.storage.StorageService;
import com.kasumio.common.SecurityUtils;
import com.kasumio.student.Student;
import com.kasumio.student.StudentRepository;
import com.kasumio.user.Role;
import com.kasumio.user.User;
import com.kasumio.user.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@RestController
@RequestMapping("/api/assessments")
@Tag(name = "Recruiter Assessment Builder", description = "Recruiter question authoring, validation, versioning, cloning and image management")
public class AssessmentBuilderController {

    private final AssessmentBuilderService builderService;
    private final AssessmentQuestionRepository questionRepository;
    private final AssessmentAttemptRepository attemptRepository;
    private final StorageService storageService;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    public AssessmentBuilderController(AssessmentBuilderService builderService,
                                       AssessmentQuestionRepository questionRepository,
                                       AssessmentAttemptRepository attemptRepository,
                                       StorageService storageService,
                                       UserRepository userRepository,
                                       StudentRepository studentRepository) {
        this.builderService = builderService;
        this.questionRepository = questionRepository;
        this.attemptRepository = attemptRepository;
        this.storageService = storageService;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
    }

    @GetMapping("/builder/opportunity/{opportunityId}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Get or create recruiter draft assessment for an opportunity")
    public ResponseEntity<AssessmentBuilderDto> getOrCreateBuilder(@PathVariable Long opportunityId) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(builderService.getOrCreateDraftAssessment(opportunityId, recruiter));
    }

    @GetMapping("/builder/{assessmentId}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Get assessment builder detail")
    public ResponseEntity<AssessmentBuilderDto> getAssessmentBuilder(@PathVariable Long assessmentId) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(builderService.getAssessmentBuilder(assessmentId, recruiter));
    }

    @PostMapping("/builder/{assessmentId}/questions")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Add question to assessment")
    public ResponseEntity<QuestionBuilderDto> addQuestion(@PathVariable Long assessmentId,
                                                          @RequestBody AssessmentQuestionRequest request) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(builderService.addQuestion(assessmentId, request, recruiter));
    }

    @PutMapping("/builder/{assessmentId}/questions/{questionId}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Update question (forks new version if published)")
    public ResponseEntity<QuestionBuilderDto> updateQuestion(@PathVariable Long assessmentId,
                                                             @PathVariable Long questionId,
                                                             @RequestBody AssessmentQuestionRequest request) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(builderService.updateQuestion(assessmentId, questionId, request, recruiter));
    }

    @DeleteMapping("/builder/{assessmentId}/questions/{questionId}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Delete question")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long assessmentId,
                                               @PathVariable Long questionId) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        builderService.deleteQuestion(assessmentId, questionId, recruiter);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/builder/{assessmentId}/validate")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Validate assessment rules before publication")
    public ResponseEntity<AssessmentValidationResultDto> validateAssessment(@PathVariable Long assessmentId) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(builderService.validateAssessment(assessmentId, recruiter));
    }

    @PostMapping("/builder/{assessmentId}/publish")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Publish assessment (makes current version immutable)")
    public ResponseEntity<AssessmentBuilderDto> publishAssessment(@PathVariable Long assessmentId) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(builderService.publishAssessment(assessmentId, recruiter));
    }

    @PostMapping("/builder/{assessmentId}/clone/{targetOpportunityId}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Clone assessment blueprint with all questions, rubrics, and images")
    public ResponseEntity<AssessmentBuilderDto> cloneAssessment(@PathVariable Long assessmentId,
                                                                @PathVariable Long targetOpportunityId) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(builderService.cloneAssessment(assessmentId, targetOpportunityId, recruiter));
    }

    @PostMapping(value = "/builder/{assessmentId}/questions/{questionId}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Upload image for assessment question (PNG, JPEG, WebP; SVGs forbidden)")
    public ResponseEntity<String> uploadQuestionImage(@PathVariable Long assessmentId,
                                                      @PathVariable Long questionId,
                                                      @RequestParam("file") MultipartFile file,
                                                      @RequestParam("altText") String altText,
                                                      @RequestParam(value = "caption", required = false) String caption) throws IOException {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        String url = builderService.uploadQuestionImage(assessmentId, questionId, file.getInputStream(),
                file.getOriginalFilename(), file.getContentType(), file.getSize(), altText, caption, recruiter);
        return ResponseEntity.ok(url);
    }

    @DeleteMapping("/builder/{assessmentId}/questions/{questionId}/image")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Remove image from question")
    public ResponseEntity<Void> deleteQuestionImage(@PathVariable Long assessmentId,
                                                    @PathVariable Long questionId) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        builderService.deleteQuestionImage(assessmentId, questionId, recruiter);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/images/{storageKey}")
    @Operation(summary = "Securely download question image for authorized recruiters or active student attempts")
    public ResponseEntity<byte[]> getQuestionImage(@PathVariable String storageKey) {
        User currentUser = SecurityUtils.getCurrentUser(userRepository);
        verifyImageAccess(storageKey, currentUser);

        byte[] data = storageService.load(storageKey);
        MediaType mediaType = storageKey.endsWith(".png") ? MediaType.IMAGE_PNG : MediaType.IMAGE_JPEG;
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CACHE_CONTROL, "private, max-age=3600")
                .body(data);
    }

    private void verifyImageAccess(String storageKey, User user) {
        if (user.getRole() == Role.ADMIN) return;

        Optional<AssessmentQuestion> questionOpt = questionRepository.findByImageStorageKey(storageKey);
        if (questionOpt.isEmpty()) {
            throw new AccessDeniedException("Image not found or access denied.");
        }
        AssessmentQuestion question = questionOpt.get();
        Assessment assessment = question.getAssessment();

        // If recruiter, check ownership of opportunity
        if (user.getRole() == Role.RECRUITER) {
            User recruiter = assessment.getOpportunity().getRecruiter();
            if (recruiter != null && recruiter.getId().equals(user.getId())) {
                return;
            }
            throw new AccessDeniedException("Recruiters cannot access images of other organizations' assessments.");
        }

        // If student, check if they have an active IN_PROGRESS attempt on this assessment
        if (user.getRole() == Role.STUDENT) {
            Student student = studentRepository.findByUser(user)
                    .orElseThrow(() -> new AccessDeniedException("Student profile not found."));
            boolean hasActiveAttempt = attemptRepository.findByAssessmentAndStudent(assessment, student).stream()
                    .anyMatch(att -> att.getStatus() == AttemptStatus.IN_PROGRESS);
            if (hasActiveAttempt && assessment.getStatus() == AssessmentStatus.PUBLISHED) {
                return;
            }
            throw new AccessDeniedException("Students can only view question images during an active assessment attempt.");
        }

        throw new AccessDeniedException("Access denied.");
    }
}
