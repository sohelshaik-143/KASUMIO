package com.kasumio.evidence;

import com.kasumio.evidence.dto.EvidenceResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/evidence")
@Tag(name = "Verification", description = "Evidence verification by authorized recruiters and administrators")
public class VerificationController {

    private final VerificationService verificationService;

    public VerificationController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @PostMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Verify an evidence submission on behalf of an authorized organization")
    public ResponseEntity<EvidenceResponse> verifyEvidence(
            @PathVariable Long id,
            @RequestParam(required = false) Long organizationId) {
        return ResponseEntity.ok(verificationService.verifyEvidence(id, organizationId));
    }
}
