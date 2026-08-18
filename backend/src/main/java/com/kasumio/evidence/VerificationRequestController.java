package com.kasumio.evidence;

import com.kasumio.evidence.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Evidence Verification Requests", description = "Contextual, lightweight evidence verification workflow for recruiters and students")
public class VerificationRequestController {

    private final VerificationRequestService verificationRequestService;

    public VerificationRequestController(VerificationRequestService verificationRequestService) {
        this.verificationRequestService = verificationRequestService;
    }

    @PostMapping("/api/opportunities/{opportunityId}/matches/{candidateAlias}/evidence/{evidenceId}/verification-request")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Request verification for specific candidate evidence relevant to an opportunity")
    public ResponseEntity<VerificationQueueItemResponse> requestVerification(
            @PathVariable Long opportunityId,
            @PathVariable String candidateAlias,
            @PathVariable Long evidenceId) {
        return new ResponseEntity<>(
                verificationRequestService.requestVerification(opportunityId, candidateAlias, evidenceId),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/api/recruiter/verifications")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Get prioritized verification queue for recruiter's opportunities")
    public ResponseEntity<List<VerificationQueueItemResponse>> getRecruiterQueue() {
        return ResponseEntity.ok(verificationRequestService.getRecruiterQueue());
    }

    @GetMapping("/api/recruiter/verifications/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Get detailed verification request for review")
    public ResponseEntity<VerificationDetailResponse> getVerificationDetail(@PathVariable Long id) {
        return ResponseEntity.ok(verificationRequestService.getVerificationDetail(id));
    }

    @PostMapping("/api/recruiter/verifications/{id}/verify")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Verify candidate evidence for the opportunity with optional comment")
    public ResponseEntity<VerificationDetailResponse> verifyRequest(
            @PathVariable Long id,
            @RequestBody(required = false) VerificationActionRequest request) {
        return ResponseEntity.ok(verificationRequestService.verifyRequest(id, request));
    }

    @PostMapping("/api/recruiter/verifications/{id}/reject")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Reject candidate evidence verification with optional comment")
    public ResponseEntity<VerificationDetailResponse> rejectRequest(
            @PathVariable Long id,
            @RequestBody(required = false) VerificationActionRequest request) {
        return ResponseEntity.ok(verificationRequestService.rejectRequest(id, request));
    }

    @GetMapping("/api/student/evidence/verification-status")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get contextual verification status across opportunities for authenticated student's evidence")
    public ResponseEntity<List<StudentEvidenceVerificationStatusResponse>> getStudentVerificationStatus() {
        return ResponseEntity.ok(verificationRequestService.getStudentVerificationStatus());
    }
}
