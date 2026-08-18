package com.kasumio.connection;

import com.kasumio.connection.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Trusted Connections", description = "Mutual professional connections between students and recruiters with granular consent")
public class TrustedConnectionController {

    private final TrustedConnectionService trustedConnectionService;

    public TrustedConnectionController(TrustedConnectionService trustedConnectionService) {
        this.trustedConnectionService = trustedConnectionService;
    }

    // ==========================================
    // RECRUITER ENDPOINTS
    // ==========================================

    @PostMapping("/api/opportunities/{id}/candidates/{candidateAlias}/connect")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Express interest and request trusted connection with an anonymous matched candidate")
    public ResponseEntity<RecruiterConnectionResponse> requestConnection(
            @PathVariable Long id,
            @PathVariable String candidateAlias,
            @RequestBody(required = false) ConnectionRequestDto request) {
        return new ResponseEntity<>(trustedConnectionService.requestConnection(id, candidateAlias, request), HttpStatus.CREATED);
    }

    @GetMapping("/api/recruiter/connections")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "List all connection requests and established connections for the recruiter")
    public ResponseEntity<List<RecruiterConnectionResponse>> getRecruiterConnections() {
        return ResponseEntity.ok(trustedConnectionService.getRecruiterConnections());
    }

    @GetMapping("/api/recruiter/connections/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Get detailed connection record and disclosed profile (if accepted)")
    public ResponseEntity<RecruiterConnectionResponse> getRecruiterConnectionById(@PathVariable Long id) {
        return ResponseEntity.ok(trustedConnectionService.getRecruiterConnectionById(id));
    }

    @PostMapping("/api/recruiter/connections/{id}/cancel")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Cancel or revoke a connection request or established connection")
    public ResponseEntity<Void> cancelRecruiterConnection(@PathVariable Long id) {
        trustedConnectionService.cancelConnection(id);
        return ResponseEntity.ok().build();
    }

    // ==========================================
    // STUDENT ENDPOINTS
    // ==========================================

    @GetMapping("/api/student/connections")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "List all incoming recruiter connection requests and active connections for the authenticated student")
    public ResponseEntity<List<StudentConnectionResponse>> getStudentConnections() {
        return ResponseEntity.ok(trustedConnectionService.getStudentConnections());
    }

    @PostMapping("/api/student/connections/{id}/accept")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Accept a connection request and explicitly choose what professional information to disclose")
    public ResponseEntity<StudentConnectionResponse> acceptConnection(
            @PathVariable Long id,
            @RequestBody(required = false) ConnectionConsentRequest consent) {
        return ResponseEntity.ok(trustedConnectionService.acceptConnection(id, consent));
    }

    @PostMapping("/api/student/connections/{id}/decline")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Decline a connection request (without any penalty to matching, evidence, or reputation)")
    public ResponseEntity<StudentConnectionResponse> declineConnection(@PathVariable Long id) {
        return ResponseEntity.ok(trustedConnectionService.declineConnection(id));
    }

    @PostMapping("/api/student/connections/{id}/cancel")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Revoke or cancel an established trusted connection")
    public ResponseEntity<Void> cancelStudentConnection(@PathVariable Long id) {
        trustedConnectionService.cancelConnection(id);
        return ResponseEntity.ok().build();
    }
}
