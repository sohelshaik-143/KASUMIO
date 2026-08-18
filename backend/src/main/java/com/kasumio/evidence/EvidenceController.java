package com.kasumio.evidence;

import com.kasumio.evidence.dto.EvidenceRequest;
import com.kasumio.evidence.dto.EvidenceResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evidence")
@Tag(name = "Evidence", description = "Student evidence submission, tracking, and retrieval")
public class EvidenceController {

    private final EvidenceService evidenceService;

    public EvidenceController(EvidenceService evidenceService) {
        this.evidenceService = evidenceService;
    }

    @GetMapping
    @Operation(summary = "List all evidence submitted by authenticated student")
    public ResponseEntity<List<EvidenceResponse>> getMyEvidence() {
        return ResponseEntity.ok(evidenceService.getMyEvidence());
    }

    @PostMapping
    @Operation(summary = "Create and submit new evidence linked to a skill")
    public ResponseEntity<EvidenceResponse> createEvidence(@Valid @RequestBody EvidenceRequest request) {
        return new ResponseEntity<>(evidenceService.createEvidence(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get evidence details by ID (Owner, authorized recruiter, or admin)")
    public ResponseEntity<EvidenceResponse> getEvidenceById(@PathVariable Long id) {
        return ResponseEntity.ok(evidenceService.getEvidenceById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update evidence by ID (Student owner only)")
    public ResponseEntity<EvidenceResponse> updateEvidence(@PathVariable Long id, @Valid @RequestBody EvidenceRequest request) {
        return ResponseEntity.ok(evidenceService.updateEvidence(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete evidence by ID (Student owner only)")
    public ResponseEntity<Void> deleteEvidence(@PathVariable Long id) {
        evidenceService.deleteEvidence(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/pending-verification")
    @Operation(summary = "List unverified evidence for verifiers (Recruiters / Admins)")
    public ResponseEntity<List<EvidenceResponse>> getPendingVerificationEvidence() {
        return ResponseEntity.ok(evidenceService.getPendingVerificationEvidence());
    }
}
