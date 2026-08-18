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

    public VerificationService(
            VerificationRepository verificationRepository,
            EvidenceRepository evidenceRepository,
            OrganizationRepository organizationRepository,
            UserRepository userRepository,
            EvidenceService evidenceService) {
        this.verificationRepository = verificationRepository;
        this.evidenceRepository = evidenceRepository;
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.evidenceService = evidenceService;
    }

    @Transactional
    public EvidenceResponse verifyEvidence(Long evidenceId, Long explicitOrgId) {
        User verifier = SecurityUtils.getCurrentUser(userRepository);

        // Security check: Only ADMIN or RECRUITER can verify
        if (verifier.getRole() != Role.ADMIN && verifier.getRole() != Role.RECRUITER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only authorized recruiters or administrators can verify evidence");
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

        Evidence evidence = evidenceRepository.findById(evidenceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evidence not found"));

        if (verificationRepository.existsByEvidenceId(evidenceId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This evidence has already been verified");
        }

        Verification verification = new Verification(evidence, organization, verifier);
        verificationRepository.save(verification);

        return evidenceService.mapToResponse(evidence);
    }
}
