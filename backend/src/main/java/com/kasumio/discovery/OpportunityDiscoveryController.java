package com.kasumio.discovery;

import com.kasumio.common.SecurityUtils;
import com.kasumio.discovery.dto.*;
import com.kasumio.opportunity.OpportunityType;
import com.kasumio.opportunity.WorkType;
import com.kasumio.student.Student;
import com.kasumio.student.StudentRepository;
import com.kasumio.user.User;
import com.kasumio.user.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discovery")
@Tag(name = "Opportunity Discovery & Technology Intelligence", description = "Personalized discovery feed, explainable matching, technology gap analysis, dynamic candidate discovery, and career intelligence")
public class OpportunityDiscoveryController {

    private final OpportunityDiscoveryService discoveryService;
    private final CareerIntelligenceService careerIntelligenceService;
    private final TechnologyCandidateService candidateService;
    private final FeedbackIntelligenceService feedbackIntelligenceService;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public OpportunityDiscoveryController(
            OpportunityDiscoveryService discoveryService,
            CareerIntelligenceService careerIntelligenceService,
            TechnologyCandidateService candidateService,
            FeedbackIntelligenceService feedbackIntelligenceService,
            StudentRepository studentRepository,
            UserRepository userRepository) {
        this.discoveryService = discoveryService;
        this.careerIntelligenceService = careerIntelligenceService;
        this.candidateService = candidateService;
        this.feedbackIntelligenceService = feedbackIntelligenceService;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/opportunities")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get personalized opportunity recommendations with natural language & smart filters")
    public ResponseEntity<List<OpportunityDiscoverySummaryResponse>> getRecommendations(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) OpportunityType type,
            @RequestParam(required = false) WorkType workType,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) List<String> technologies,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String matchStrength,
            @RequestParam(required = false) String deadlineFilter,
            @RequestParam(required = false) String sortBy) {

        OpportunityFilterRequest filter = new OpportunityFilterRequest();
        filter.setQuery(query);
        filter.setType(type);
        filter.setWorkType(workType);
        filter.setLocation(location);
        filter.setTechnologies(technologies);
        filter.setCategory(category);
        filter.setMatchStrength(matchStrength);
        filter.setDeadlineFilter(deadlineFilter);
        filter.setSortBy(sortBy);

        return ResponseEntity.ok(discoveryService.getPersonalizedRecommendations(filter));
    }

    @GetMapping("/opportunities/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get full opportunity detail with deterministic match breakdown and gap analysis")
    public ResponseEntity<OpportunityDiscoveryDetailResponse> getOpportunityDetail(@PathVariable Long id) {
        return ResponseEntity.ok(discoveryService.getOpportunityDetail(id));
    }

    @GetMapping("/opportunities/{id}/readiness")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get multi-dimensional readiness, evidence strength, and opportunity distance breakdown")
    public ResponseEntity<OpportunityReadinessDto> getOpportunityReadiness(@PathVariable Long id) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        return ResponseEntity.ok(careerIntelligenceService.getOpportunityReadiness(student, id));
    }

    @GetMapping("/gaps")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get comprehensive student technology gap report across the entire technology ecosystem")
    public ResponseEntity<StudentGapReportDto> getGapReport() {
        return ResponseEntity.ok(discoveryService.getStudentGapReport());
    }

    @GetMapping("/career-intelligence")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get aggregated career intelligence: technology demand, opportunity clusters, skill leverage rankings, and evidence ROI")
    public ResponseEntity<CareerIntelligenceDto> getCareerIntelligence() {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        return ResponseEntity.ok(careerIntelligenceService.getCareerIntelligence(student));
    }

    @PostMapping("/career-what-if")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Simulate counterfactual career what-if scenario (e.g. 'What if I learn Docker?')")
    public ResponseEntity<CareerWhatIfResponse> simulateCareerWhatIf(@RequestBody CareerWhatIfRequest request) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        return ResponseEntity.ok(careerIntelligenceService.simulateCareerWhatIf(student, request));
    }

    @GetMapping("/technology-graph")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get nodes and edges for interactive Career Capability Map (Graph 1)")
    public ResponseEntity<TechnologyGraphDto> getTechnologyGraph() {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        return ResponseEntity.ok(careerIntelligenceService.getTechnologyGraph(student));
    }

    @PostMapping("/opportunities/{id}/save")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Save or update status of an opportunity bookmark (SAVED, APPLIED, REJECTED)")
    public ResponseEntity<Void> saveOpportunity(
            @PathVariable Long id,
            @RequestBody(required = false) SaveOpportunityRequest request) {
        String status = request != null ? request.getStatus() : "SAVED";
        discoveryService.saveOpportunity(id, status);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/opportunities/{id}/save")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Remove saved bookmark")
    public ResponseEntity<Void> unsaveOpportunity(@PathVariable Long id) {
        discoveryService.unsaveOpportunity(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/opportunities/saved")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "List student's saved and bookmarked opportunities")
    public ResponseEntity<List<OpportunityDiscoverySummaryResponse>> getSavedOpportunities() {
        return ResponseEntity.ok(discoveryService.getSavedOpportunities());
    }

    @GetMapping("/technologies")
    @Operation(summary = "Get full technology catalog for taxonomy lookups and smart filters")
    public ResponseEntity<List<TechnologyCatalogDto>> getTechnologyCatalog() {
        return ResponseEntity.ok(discoveryService.getTechnologyCatalog());
    }

    @GetMapping("/technologies/{id}")
    @Operation(summary = "Get single technology detail by ID")
    public ResponseEntity<TechnologyCatalogDto> getTechnologyDetail(@PathVariable Long id) {
        return ResponseEntity.ok(discoveryService.getTechnologyDetail(id));
    }

    // Dynamic Technology Candidate Endpoints

    @GetMapping("/candidates")
    @Operation(summary = "List dynamic technology candidates by verification status")
    public ResponseEntity<List<TechnologyCandidateDto>> getCandidates(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(candidateService.getCandidates(status));
    }

    @PostMapping("/candidates/discover")
    @Operation(summary = "Detect and record an unknown technology candidate")
    public ResponseEntity<TechnologyCandidate> discoverCandidate(
            @RequestParam String term,
            @RequestParam(required = false) String source) {
        TechnologyCandidate candidate = candidateService.discoverOrRecordCandidate(term, source);
        if (candidate == null) {
            return ResponseEntity.status(HttpStatus.ALREADY_REPORTED).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(candidate);
    }

    @PostMapping("/candidates/{id}/verify")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    @Operation(summary = "Verify and promote technology candidate to confirmed taxonomy")
    public ResponseEntity<Void> verifyCandidate(@PathVariable Long id) {
        User user = SecurityUtils.getCurrentUser(userRepository);
        candidateService.promoteToVerifiedSkill(id, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/candidates/{id}/reject")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    @Operation(summary = "Reject unconfirmed technology candidate")
    public ResponseEntity<Void> rejectCandidate(@PathVariable Long id) {
        User user = SecurityUtils.getCurrentUser(userRepository);
        candidateService.rejectCandidate(id, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/opportunities/{id}/feedback")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Submit deterministic recommendation feedback (e.g. RELEVANT, NOT_RELEVANT, WRONG_REQUIREMENT)")
    public ResponseEntity<Void> submitFeedback(
            @PathVariable Long id,
            @RequestBody RecommendationFeedbackRequest request) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        feedbackIntelligenceService.submitFeedback(student, id, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/analytics/feedback")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER') or hasRole('STUDENT')")
    @Operation(summary = "Get internal recommendation system quality metrics")
    public ResponseEntity<FeedbackAnalyticsDto> getFeedbackAnalytics() {
        return ResponseEntity.ok(feedbackIntelligenceService.getFeedbackAnalytics());
    }
}
