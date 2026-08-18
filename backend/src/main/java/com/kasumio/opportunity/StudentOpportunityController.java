package com.kasumio.opportunity;

import com.kasumio.opportunity.dto.StudentOpportunityResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Student Opportunities", description = "Student opportunity discovery and expression of interest")
public class StudentOpportunityController {

    private final StudentOpportunityService studentOpportunityService;

    public StudentOpportunityController(StudentOpportunityService studentOpportunityService) {
        this.studentOpportunityService = studentOpportunityService;
    }

    @GetMapping("/api/student/opportunities")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get published opportunities relevant to the authenticated student based on demonstrated evidence")
    public ResponseEntity<List<StudentOpportunityResponse>> getRelevantOpportunities() {
        return ResponseEntity.ok(studentOpportunityService.getRelevantOpportunities());
    }

    @PostMapping("/api/opportunities/{id}/interest")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Express interest in a published opportunity (Student only, 409 if already active)")
    public ResponseEntity<Void> expressInterest(@PathVariable Long id) {
        studentOpportunityService.expressInterest(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/api/opportunities/{id}/interest")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Withdraw interest in a published opportunity (Student only)")
    public ResponseEntity<Void> withdrawInterest(@PathVariable Long id) {
        studentOpportunityService.withdrawInterest(id);
        return ResponseEntity.noContent().build();
    }
}
