package com.kasumio.opportunity;

import com.kasumio.opportunity.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/opportunities")
@Tag(name = "Opportunities", description = "Recruiter opportunity definition, lifecycle management, and evidence-based candidate matching")
public class OpportunityController {

    private final OpportunityService opportunityService;

    public OpportunityController(OpportunityService opportunityService) {
        this.opportunityService = opportunityService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Create a new DRAFT opportunity with required and preferred skills")
    public ResponseEntity<OpportunityResponse> createOpportunity(@Valid @RequestBody OpportunityRequest request) {
        return new ResponseEntity<>(opportunityService.createOpportunity(request), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "List current recruiter's opportunities")
    public ResponseEntity<List<OpportunitySummaryResponse>> getMyOpportunities() {
        return ResponseEntity.ok(opportunityService.getMyOpportunities());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Get opportunity details by ID (Owner or Admin)")
    public ResponseEntity<OpportunityResponse> getOpportunityById(@PathVariable Long id) {
        return ResponseEntity.ok(opportunityService.getOpportunityById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Update DRAFT opportunity details and skill requirements")
    public ResponseEntity<OpportunityResponse> updateOpportunity(
            @PathVariable Long id,
            @Valid @RequestBody OpportunityRequest request) {
        return ResponseEntity.ok(opportunityService.updateOpportunity(id, request));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Publish a DRAFT opportunity (Requires at least 1 REQUIRED skill)")
    public ResponseEntity<OpportunityResponse> publishOpportunity(@PathVariable Long id) {
        return ResponseEntity.ok(opportunityService.publishOpportunity(id));
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Close an active PUBLISHED opportunity")
    public ResponseEntity<OpportunityResponse> closeOpportunity(@PathVariable Long id) {
        return ResponseEntity.ok(opportunityService.closeOpportunity(id));
    }

    @GetMapping("/{id}/matches")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Discover anonymous candidates matching opportunity skills (>=50% required threshold)")
    public ResponseEntity<List<CandidateMatchResponse>> getMatches(@PathVariable Long id) {
        return ResponseEntity.ok(opportunityService.getMatches(id));
    }

    @GetMapping("/{id}/matches/{candidateAlias}/evidence")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Inspect anonymous candidate evidence relevant to opportunity skills")
    public ResponseEntity<List<CandidateEvidenceResponse>> getCandidateEvidence(
            @PathVariable Long id,
            @PathVariable String candidateAlias) {
        return ResponseEntity.ok(opportunityService.getCandidateEvidence(id, candidateAlias));
    }
}
