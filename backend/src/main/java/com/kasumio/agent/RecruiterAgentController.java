package com.kasumio.agent;

import com.kasumio.agent.dto.ApproveAndExecuteRequest;
import com.kasumio.agent.dto.RecruiterIntentRequest;
import com.kasumio.agent.dto.RecruiterJobResponse;
import com.kasumio.agent.dto.RecruiterPolicyDto;
import com.kasumio.common.SecurityUtils;
import com.kasumio.user.User;
import com.kasumio.user.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recruiter/agent")
@Tag(name = "Recruiter AI Agent", description = "Autonomous Recruiter Automation & Evidence Intelligence Engine")
public class RecruiterAgentController {

    private final RecruiterAgentWorkflowService workflowService;
    private final UserRepository userRepository;

    public RecruiterAgentController(RecruiterAgentWorkflowService workflowService, UserRepository userRepository) {
        this.workflowService = workflowService;
        this.userRepository = userRepository;
    }

    @PostMapping("/intent")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Express natural-language recruiter intent to parse requirements and discover evidence-backed candidates")
    public ResponseEntity<RecruiterJobResponse> initiateIntent(@Valid @RequestBody RecruiterIntentRequest request) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        RecruiterJobResponse response = workflowService.initiateIntentWorkflow(recruiter, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/jobs/{jobId}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Get automation job details, parsed requirements, and candidate recommendations")
    public ResponseEntity<RecruiterJobResponse> getJob(@PathVariable String jobId) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(workflowService.getJob(recruiter, jobId));
    }

    @PostMapping("/jobs/{jobId}/approve-and-execute")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "One-Approval Execution: publish opportunity and dispatch outreach to approved candidates")
    public ResponseEntity<RecruiterJobResponse> approveAndExecute(
            @PathVariable String jobId,
            @RequestBody ApproveAndExecuteRequest request) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(workflowService.approveAndExecute(recruiter, jobId, request));
    }

    @GetMapping("/policies")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Get recruiter automation policies and safety bounds")
    public ResponseEntity<RecruiterPolicyDto> getPolicy() {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(workflowService.getPolicy(recruiter));
    }

    @PutMapping("/policies")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "Update recruiter automation policies and safety bounds")
    public ResponseEntity<RecruiterPolicyDto> updatePolicy(@Valid @RequestBody RecruiterPolicyDto dto) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(workflowService.updatePolicy(recruiter, dto));
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasAnyRole('RECRUITER', 'ADMIN')")
    @Operation(summary = "List audit logs of recruiter automated workflows and actions")
    public ResponseEntity<List<RecruiterAuditLog>> getAuditLogs() {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(workflowService.getAuditLogs(recruiter));
    }
}
