package com.kasumio.evidence;

import com.kasumio.common.SecurityUtils;
import com.kasumio.evidence.dto.*;
import com.kasumio.opportunity.*;
import com.kasumio.opportunity.dto.CandidateMatchResponse;
import com.kasumio.student.Student;
import com.kasumio.student.StudentRepository;
import com.kasumio.user.Role;
import com.kasumio.user.User;
import com.kasumio.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class VerificationRequestService {

    private static final int EXPIRATION_DAYS = 7;

    private final VerificationRequestRepository verificationRequestRepository;
    private final OpportunityRepository opportunityRepository;
    private final EvidenceRepository evidenceRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final CandidateAliasService candidateAliasService;
    private final MatchingEngineService matchingEngineService;
    private final OpportunityInterestRepository interestRepository;

    public VerificationRequestService(
            VerificationRequestRepository verificationRequestRepository,
            OpportunityRepository opportunityRepository,
            EvidenceRepository evidenceRepository,
            StudentRepository studentRepository,
            UserRepository userRepository,
            CandidateAliasService candidateAliasService,
            MatchingEngineService matchingEngineService,
            OpportunityInterestRepository interestRepository) {
        this.verificationRequestRepository = verificationRequestRepository;
        this.opportunityRepository = opportunityRepository;
        this.evidenceRepository = evidenceRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.candidateAliasService = candidateAliasService;
        this.matchingEngineService = matchingEngineService;
        this.interestRepository = interestRepository;
    }

    @Transactional
    public VerificationQueueItemResponse requestVerification(Long opportunityId, String candidateAlias, Long evidenceId) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        if (recruiter.getRole() != Role.RECRUITER && recruiter.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only recruiters or administrators can request verification");
        }

        Opportunity opp = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Opportunity not found"));

        if (recruiter.getRole() != Role.ADMIN && !opp.getRecruiter().getId().equals(recruiter.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to opportunity created by another recruiter");
        }

        if (opp.getStatus() != OpportunityStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot request verification for an unpublished or closed opportunity");
        }

        Student student = candidateAliasService.findStudentByAlias(candidateAlias)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate alias not found"));

        // Validate candidate is matched to this opportunity
        List<CandidateMatchResponse> matches = matchingEngineService.findMatchesForOpportunity(opp);
        boolean isMatched = matches.stream().anyMatch(m -> m.getCandidateAlias().equals(candidateAlias));
        if (!isMatched) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Candidate is not matched to this opportunity");
        }

        Evidence evidence = evidenceRepository.findById(evidenceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evidence not found"));

        if (!evidence.getStudent().getId().equals(student.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Evidence does not belong to the specified candidate");
        }

        // Validate evidence matches opportunity required/preferred skills
        boolean skillRelevant = opp.getSkills().stream()
                .anyMatch(os -> os.getSkill().getId().equals(evidence.getSkill().getId()));
        if (!skillRelevant) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Evidence is not relevant to this opportunity's skill requirements");
        }

        // Check for existing active verification request
        Optional<VerificationRequest> existingOpt = verificationRequestRepository
                .findByOpportunityIdAndEvidenceIdAndRecruiterId(opp.getId(), evidence.getId(), recruiter.getId());

        VerificationRequest req;
        Instant now = Instant.now();
        Instant expirationThreshold = now.minus(EXPIRATION_DAYS, ChronoUnit.DAYS);

        if (existingOpt.isPresent()) {
            VerificationRequest existing = existingOpt.get();
            if (existing.getStatus() == VerificationStatus.REQUESTED) {
                if (existing.getRequestedAt().isAfter(expirationThreshold)) {
                    // Active duplicate request -> 409 Conflict
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "An active verification request already exists for this evidence");
                } else {
                    // Expired request -> Re-open as new active request
                    existing.setStatus(VerificationStatus.REQUESTED);
                    existing.setRequestedAt(now);
                    existing.setRespondedAt(null);
                    existing.setRecruiterComment(null);
                    req = verificationRequestRepository.save(existing);
                }
            } else {
                // Previously VERIFIED, REJECTED, or EXPIRED -> Re-request
                existing.setStatus(VerificationStatus.REQUESTED);
                existing.setRequestedAt(now);
                existing.setRespondedAt(null);
                existing.setRecruiterComment(null);
                req = verificationRequestRepository.save(existing);
            }
        } else {
            req = new VerificationRequest(opp, evidence, recruiter, student);
            req = verificationRequestRepository.save(req);
        }

        boolean hasInterest = interestRepository.existsByOpportunityIdAndStudentIdAndStatus(
                opp.getId(), student.getId(), InterestStatus.INTERESTED);

        return mapToQueueItem(req, candidateAlias, hasInterest);
    }

    @Transactional
    public List<VerificationQueueItemResponse> getRecruiterQueue() {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        if (recruiter.getRole() != Role.RECRUITER && recruiter.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only recruiters or administrators can access the verification queue");
        }

        List<VerificationRequest> list = (recruiter.getRole() == Role.ADMIN)
                ? verificationRequestRepository.findAll()
                : verificationRequestRepository.findQueueByRecruiterWithDetails(recruiter);

        Instant expirationThreshold = Instant.now().minus(EXPIRATION_DAYS, ChronoUnit.DAYS);

        // Logical expiration pass
        for (VerificationRequest vr : list) {
            if (vr.getStatus() == VerificationStatus.REQUESTED && vr.getRequestedAt().isBefore(expirationThreshold)) {
                vr.setStatus(VerificationStatus.EXPIRED);
                verificationRequestRepository.save(vr);
            }
        }

        // Deterministic Prioritization (Zero AI):
        // 1. Pending status (REQUESTED)
        // 2. Opportunity is still PUBLISHED
        // 3. Candidate has expressed interest
        // 4. Most recent requested_at
        return list.stream()
                .map(vr -> {
                    String alias = candidateAliasService.getOrCreateAlias(vr.getStudent());
                    boolean hasInterest = interestRepository.existsByOpportunityIdAndStudentIdAndStatus(
                            vr.getOpportunity().getId(), vr.getStudent().getId(), InterestStatus.INTERESTED);
                    return mapToQueueItem(vr, alias, hasInterest);
                })
                .sorted((a, b) -> {
                    // Priority 1: Pending (REQUESTED) first
                    boolean aPending = a.getStatus() == VerificationStatus.REQUESTED;
                    boolean bPending = b.getStatus() == VerificationStatus.REQUESTED;
                    if (aPending != bPending) return aPending ? -1 : 1;

                    // Priority 2: Candidate has expressed interest
                    if (a.isHasExpressedInterest() != b.isHasExpressedInterest()) {
                        return a.isHasExpressedInterest() ? -1 : 1;
                    }

                    // Priority 3: Most recent request
                    return b.getRequestedAt().compareTo(a.getRequestedAt());
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public VerificationDetailResponse getVerificationDetail(Long id) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        VerificationRequest vr = verificationRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Verification request not found"));

        if (recruiter.getRole() != Role.ADMIN && !vr.getRecruiter().getId().equals(recruiter.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to verification request belonging to another recruiter");
        }

        // Expiration check
        Instant expirationThreshold = Instant.now().minus(EXPIRATION_DAYS, ChronoUnit.DAYS);
        if (vr.getStatus() == VerificationStatus.REQUESTED && vr.getRequestedAt().isBefore(expirationThreshold)) {
            vr.setStatus(VerificationStatus.EXPIRED);
            vr = verificationRequestRepository.save(vr);
        }

        String alias = candidateAliasService.getOrCreateAlias(vr.getStudent());
        boolean hasInterest = interestRepository.existsByOpportunityIdAndStudentIdAndStatus(
                vr.getOpportunity().getId(), vr.getStudent().getId(), InterestStatus.INTERESTED);

        return mapToDetailResponse(vr, alias, hasInterest);
    }

    @Transactional
    public VerificationDetailResponse verifyRequest(Long id, VerificationActionRequest action) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        VerificationRequest vr = verificationRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Verification request not found"));

        if (recruiter.getRole() != Role.ADMIN && !vr.getRecruiter().getId().equals(recruiter.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to verification request belonging to another recruiter");
        }

        if (vr.getStatus() == VerificationStatus.VERIFIED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This verification request has already been verified");
        }

        vr.setStatus(VerificationStatus.VERIFIED);
        vr.setRespondedAt(Instant.now());
        if (action != null && action.getComment() != null) {
            vr.setRecruiterComment(action.getComment().trim());
        }

        vr = verificationRequestRepository.save(vr);
        String alias = candidateAliasService.getOrCreateAlias(vr.getStudent());
        boolean hasInterest = interestRepository.existsByOpportunityIdAndStudentIdAndStatus(
                vr.getOpportunity().getId(), vr.getStudent().getId(), InterestStatus.INTERESTED);

        return mapToDetailResponse(vr, alias, hasInterest);
    }

    @Transactional
    public VerificationDetailResponse rejectRequest(Long id, VerificationActionRequest action) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        VerificationRequest vr = verificationRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Verification request not found"));

        if (recruiter.getRole() != Role.ADMIN && !vr.getRecruiter().getId().equals(recruiter.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to verification request belonging to another recruiter");
        }

        if (vr.getStatus() == VerificationStatus.REJECTED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This verification request has already been rejected");
        }

        vr.setStatus(VerificationStatus.REJECTED);
        vr.setRespondedAt(Instant.now());
        if (action != null && action.getComment() != null) {
            vr.setRecruiterComment(action.getComment().trim());
        }

        vr = verificationRequestRepository.save(vr);
        String alias = candidateAliasService.getOrCreateAlias(vr.getStudent());
        boolean hasInterest = interestRepository.existsByOpportunityIdAndStudentIdAndStatus(
                vr.getOpportunity().getId(), vr.getStudent().getId(), InterestStatus.INTERESTED);

        return mapToDetailResponse(vr, alias, hasInterest);
    }

    @Transactional(readOnly = true)
    public List<StudentEvidenceVerificationStatusResponse> getStudentVerificationStatus() {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        List<Evidence> studentEvidence = evidenceRepository.findByStudentOrderByCreatedAtDesc(student);
        Instant expirationThreshold = Instant.now().minus(EXPIRATION_DAYS, ChronoUnit.DAYS);

        List<StudentEvidenceVerificationStatusResponse> result = new ArrayList<>();

        for (Evidence ev : studentEvidence) {
            List<VerificationRequest> requests = verificationRequestRepository.findByEvidenceId(ev.getId());

            List<OpportunityVerificationItemDto> verifItems = requests.stream()
                    .map(vr -> {
                        VerificationStatus status = vr.getStatus();
                        if (status == VerificationStatus.REQUESTED && vr.getRequestedAt().isBefore(expirationThreshold)) {
                            status = VerificationStatus.EXPIRED;
                        }
                        return new OpportunityVerificationItemDto(
                                vr.getOpportunity().getId(),
                                vr.getOpportunity().getTitle(),
                                status,
                                vr.getRequestedAt(),
                                vr.getRespondedAt()
                        );
                    })
                    .collect(Collectors.toList());

            result.add(new StudentEvidenceVerificationStatusResponse(
                    ev.getId(),
                    ev.getTitle(),
                    ev.getSkill().getName(),
                    ev.getSkill().getCategory(),
                    verifItems
            ));
        }

        return result;
    }

    private VerificationQueueItemResponse mapToQueueItem(VerificationRequest vr, String candidateAlias, boolean hasInterest) {
        return new VerificationQueueItemResponse(
                vr.getId(),
                vr.getOpportunity().getId(),
                vr.getOpportunity().getTitle(),
                vr.getOpportunity().getType(),
                candidateAlias,
                vr.getEvidence().getId(),
                vr.getEvidence().getTitle(),
                vr.getEvidence().getEvidenceType(),
                vr.getEvidence().getSkill().getName(),
                vr.getEvidence().getSkill().getCategory(),
                vr.getStatus(),
                vr.getRequestedAt(),
                vr.getRespondedAt(),
                vr.getRecruiterComment(),
                hasInterest
        );
    }

    private VerificationDetailResponse mapToDetailResponse(VerificationRequest vr, String candidateAlias, boolean hasInterest) {
        return new VerificationDetailResponse(
                vr.getId(),
                vr.getOpportunity().getId(),
                vr.getOpportunity().getTitle(),
                vr.getOpportunity().getType(),
                candidateAlias,
                vr.getEvidence().getId(),
                vr.getEvidence().getTitle(),
                vr.getEvidence().getDescription(),
                vr.getEvidence().getEvidenceUrl(),
                vr.getEvidence().getEvidenceType(),
                vr.getEvidence().getSkill().getName(),
                vr.getEvidence().getSkill().getCategory(),
                vr.getStatus(),
                vr.getRequestedAt(),
                vr.getRespondedAt(),
                vr.getRecruiterComment(),
                hasInterest
        );
    }
}
