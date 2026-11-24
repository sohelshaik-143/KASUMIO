package com.kasumio.evidence;

import com.kasumio.common.SecurityUtils;
import com.kasumio.evidence.dto.EvidenceResponse;
import com.kasumio.evidence.dto.VerificationResponse;
import com.kasumio.organization.Organization;
import com.kasumio.organization.OrganizationRepository;
import com.kasumio.user.Role;
import com.kasumio.user.User;
import com.kasumio.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class VerificationService {

    private final VerificationRepository verificationRepository;
    private final EvidenceRepository evidenceRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final EvidenceService evidenceService;
    private final VerificationRequestRepository verificationRequestRepository;
    private final com.kasumio.action.OutcomeIntelligenceService outcomeIntelligenceService;

    public VerificationService(
            VerificationRepository verificationRepository,
            EvidenceRepository evidenceRepository,
            OrganizationRepository organizationRepository,
            UserRepository userRepository,
            EvidenceService evidenceService,
            VerificationRequestRepository verificationRequestRepository,
            com.kasumio.action.OutcomeIntelligenceService outcomeIntelligenceService) {
        this.verificationRepository = verificationRepository;
        this.evidenceRepository = evidenceRepository;
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.evidenceService = evidenceService;
        this.verificationRequestRepository = verificationRequestRepository;
        this.outcomeIntelligenceService = outcomeIntelligenceService;
    }

    @Transactional
    public EvidenceResponse verifyEvidence(Long evidenceId, Long explicitOrgId) {
        User verifier = SecurityUtils.getCurrentUser(userRepository);

        // Security check: Only ADMIN or RECRUITER can verify
        if (verifier.getRole() != Role.ADMIN && verifier.getRole() != Role.RECRUITER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only authorized recruiters or administrators can verify evidence");
        }

        // Recruiter approval check
        if (verifier.getRole() == Role.RECRUITER && verifier.getStatus() == com.kasumio.user.UserStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Recruiter account is pending administrator approval");
        }

        // Organization affiliation check
        Organization organization = verifier.getOrganization();
        if (organization == null) {
            if (verifier.getRole() == Role.ADMIN && explicitOrgId != null) {
                organization = organizationRepository.findById(explicitOrgId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Specified organization does not exist"));
            } else if (verifier.getRole() == Role.ADMIN) {
                // If admin without explicit org, use first available org or throw
                organization = organizationRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No organization configured for verification attribution"));
            } else {
                // Recruiter with no organization cannot verify
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Recruiter must be affiliated with an active organization to verify evidence");
            }
        }

        // Recruiter organization must be approved
        if (verifier.getRole() == Role.RECRUITER && !organization.isApproved()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Recruiter organization is pending administrator approval");
        }

        Evidence evidence = evidenceRepository.findById(evidenceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evidence not found"));

        // Abuse prevention: Never verify evidence they own
        if (evidence.getStudent() != null && evidence.getStudent().getUser() != null
                && evidence.getStudent().getUser().getId().equals(verifier.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Verifiers are strictly prohibited from verifying their own evidence");
        }

        // Scope check: A recruiter may only verify evidence requested from their own approved org
        if (verifier.getRole() != Role.ADMIN) {
            boolean requestedByOrg = verificationRequestRepository.existsByEvidenceIdAndOrganizationId(evidenceId, organization.getId());
            if (!requestedByOrg) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Verifiers may only verify evidence requested from their own approved organization");
            }
        }

        if (verificationRepository.existsByEvidenceId(evidenceId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This evidence has already been verified");
        }

        Verification verification = new Verification(evidence, organization, verifier);
        verification = verificationRepository.save(verification);

        outcomeIntelligenceService.recordEvidenceVerified(evidence.getStudent(), evidence, verification.getId(), organization.getName());

        return evidenceService.mapToResponse(evidence);
    }
}
