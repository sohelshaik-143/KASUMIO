package com.kasumio.opportunity;

import com.kasumio.common.SecurityUtils;
import com.kasumio.evidence.Evidence;
import com.kasumio.evidence.EvidenceRepository;
import com.kasumio.evidence.Verification;
import com.kasumio.evidence.VerificationRepository;
import com.kasumio.opportunity.dto.*;
import com.kasumio.skill.Skill;
import com.kasumio.skill.SkillRepository;
import com.kasumio.student.Student;
import com.kasumio.user.Role;
import com.kasumio.user.User;
import com.kasumio.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OpportunityService {

    private final OpportunityRepository opportunityRepository;
    private final OpportunitySkillRepository opportunitySkillRepository;
    private final SkillRepository skillRepository;
    private final UserRepository userRepository;
    private final MatchingEngineService matchingEngineService;
    private final CandidateAliasService candidateAliasService;
    private final EvidenceRepository evidenceRepository;
    private final VerificationRepository verificationRepository;
    private final com.kasumio.evidence.VerificationRequestRepository verificationRequestRepository;

    public OpportunityService(
            OpportunityRepository opportunityRepository,
            OpportunitySkillRepository opportunitySkillRepository,
            SkillRepository skillRepository,
            UserRepository userRepository,
            MatchingEngineService matchingEngineService,
            CandidateAliasService candidateAliasService,
            EvidenceRepository evidenceRepository,
            VerificationRepository verificationRepository,
            com.kasumio.evidence.VerificationRequestRepository verificationRequestRepository) {
        this.opportunityRepository = opportunityRepository;
        this.opportunitySkillRepository = opportunitySkillRepository;
        this.skillRepository = skillRepository;
        this.userRepository = userRepository;
        this.matchingEngineService = matchingEngineService;
        this.candidateAliasService = candidateAliasService;
        this.evidenceRepository = evidenceRepository;
        this.verificationRepository = verificationRepository;
        this.verificationRequestRepository = verificationRequestRepository;
    }

    @Transactional
    public OpportunityResponse createOpportunity(OpportunityRequest request) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        if (recruiter.getRole() != Role.RECRUITER && recruiter.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only recruiters or administrators can create opportunities");
        }

        Opportunity opportunity = new Opportunity(
                recruiter,
                request.getTitle().trim(),
                request.getDescription().trim(),
                request.getType(),
                request.getLocation() != null ? request.getLocation().trim() : null,
                request.getWorkType()
        );

        opportunity = opportunityRepository.save(opportunity);
        attachSkills(opportunity, request.getSkills());

        return mapToResponse(opportunity, 0);
    }

    @Transactional(readOnly = true)
    public List<OpportunitySummaryResponse> getMyOpportunities() {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        List<Opportunity> list = (recruiter.getRole() == Role.ADMIN)
                ? opportunityRepository.findAll()
                : opportunityRepository.findByRecruiterOrderByCreatedAtDesc(recruiter);

        return list.stream().map(opp -> {
            int reqCount = (int) opp.getSkills().stream().filter(s -> s.getSkillType() == SkillRequirementType.REQUIRED).count();
            int prefCount = (int) opp.getSkills().stream().filter(s -> s.getSkillType() == SkillRequirementType.PREFERRED).count();
            long matchCount = (opp.getStatus() == OpportunityStatus.PUBLISHED)
                    ? matchingEngineService.findMatchesForOpportunity(opp).size()
                    : 0;

            return new OpportunitySummaryResponse(
                    opp.getId(),
                    opp.getTitle(),
                    opp.getType(),
                    opp.getLocation(),
                    opp.getWorkType(),
                    opp.getStatus(),
                    opp.getCreatedAt(),
                    reqCount,
                    prefCount,
                    matchCount
            );
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OpportunityResponse getOpportunityById(Long id) {
        User currentUser = SecurityUtils.getCurrentUser(userRepository);
        Opportunity opp = opportunityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Opportunity not found"));

        if (currentUser.getRole() != Role.ADMIN && !opp.getRecruiter().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to opportunity created by another recruiter");
        }

        long matchCount = (opp.getStatus() == OpportunityStatus.PUBLISHED)
                ? matchingEngineService.findMatchesForOpportunity(opp).size()
                : 0;

        return mapToResponse(opp, matchCount);
    }

    @Transactional
    public OpportunityResponse updateOpportunity(Long id, OpportunityRequest request) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        Opportunity opp = opportunityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Opportunity not found"));

        if (recruiter.getRole() != Role.ADMIN && !opp.getRecruiter().getId().equals(recruiter.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to opportunity created by another recruiter");
        }

        if (opp.getStatus() != OpportunityStatus.DRAFT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only DRAFT opportunities can be modified");
        }

        opp.setTitle(request.getTitle().trim());
        opp.setDescription(request.getDescription().trim());
        opp.setType(request.getType());
        opp.setLocation(request.getLocation() != null ? request.getLocation().trim() : null);
        opp.setWorkType(request.getWorkType());

        opportunitySkillRepository.deleteByOpportunityId(opp.getId());
        opp.getSkills().clear();
        attachSkills(opp, request.getSkills());

        opp = opportunityRepository.save(opp);
        return mapToResponse(opp, 0);
    }

    @Transactional
    public OpportunityResponse publishOpportunity(Long id) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        Opportunity opp = opportunityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Opportunity not found"));

        if (recruiter.getRole() != Role.ADMIN && !opp.getRecruiter().getId().equals(recruiter.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to opportunity created by another recruiter");
        }

        if (opp.getStatus() == OpportunityStatus.CLOSED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Closed opportunities cannot be republished");
        }
        if (opp.getStatus() == OpportunityStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Opportunity is already published");
        }

        // Validate required fields
        if (!StringUtils.hasText(opp.getTitle()) || !StringUtils.hasText(opp.getDescription()) || opp.getType() == null || opp.getWorkType() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot publish opportunity with incomplete required fields");
        }

        // Validate at least ONE REQUIRED skill
        boolean hasRequiredSkill = opp.getSkills().stream()
                .anyMatch(s -> s.getSkillType() == SkillRequirementType.REQUIRED);

        if (!hasRequiredSkill) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A published opportunity must have at least one REQUIRED skill");
        }

        opp.setStatus(OpportunityStatus.PUBLISHED);
        opp = opportunityRepository.save(opp);

        long matchCount = matchingEngineService.findMatchesForOpportunity(opp).size();
        return mapToResponse(opp, matchCount);
    }

    @Transactional
    public OpportunityResponse closeOpportunity(Long id) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        Opportunity opp = opportunityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Opportunity not found"));

        if (recruiter.getRole() != Role.ADMIN && !opp.getRecruiter().getId().equals(recruiter.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to opportunity created by another recruiter");
        }

        if (opp.getStatus() != OpportunityStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PUBLISHED opportunities can be closed");
        }

        opp.setStatus(OpportunityStatus.CLOSED);
        opp = opportunityRepository.save(opp);
        return mapToResponse(opp, 0);
    }

    @Transactional
    public List<CandidateMatchResponse> getMatches(Long id) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        Opportunity opp = opportunityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Opportunity not found"));

        if (recruiter.getRole() != Role.ADMIN && !opp.getRecruiter().getId().equals(recruiter.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to matches for an opportunity created by another recruiter");
        }

        if (opp.getStatus() != OpportunityStatus.PUBLISHED) {
            return Collections.emptyList();
        }

        return matchingEngineService.findMatchesForOpportunity(opp);
    }

    @Transactional(readOnly = true)
    public List<CandidateEvidenceResponse> getCandidateEvidence(Long id, String candidateAlias) {
        User recruiter = SecurityUtils.getCurrentUser(userRepository);
        Opportunity opp = opportunityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Opportunity not found"));

        // Security Gate 1: Recruiter ownership check
        if (recruiter.getRole() != Role.ADMIN && !opp.getRecruiter().getId().equals(recruiter.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to opportunity matches");
        }

        // Security Gate 2: Published status check
        if (opp.getStatus() != OpportunityStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot inspect candidate evidence for unpublished opportunity");
        }

        // Security Gate 3: Candidate Alias validation
        Student student = candidateAliasService.findStudentByAlias(candidateAlias)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate alias not found"));

        // Security Gate 4: Candidate must actually match the opportunity
        List<CandidateMatchResponse> matches = matchingEngineService.findMatchesForOpportunity(opp);
        boolean isMatched = matches.stream().anyMatch(m -> m.getCandidateAlias().equals(candidateAlias));
        if (!isMatched) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Candidate is not matched to this opportunity");
        }

        // Security Gate 5: Fetch only evidence relevant to the opportunity's required/preferred skills
        Set<Long> opportunitySkillIds = opp.getSkills().stream()
                .map(os -> os.getSkill().getId())
                .collect(Collectors.toSet());

        List<Evidence> studentEvidence = evidenceRepository.findByStudentOrderByCreatedAtDesc(student);
        Instant sixMonthsAgo = Instant.now().minus(180, ChronoUnit.DAYS);
        Instant expirationThreshold = Instant.now().minus(7, ChronoUnit.DAYS);

        return studentEvidence.stream()
                .filter(e -> opportunitySkillIds.contains(e.getSkill().getId()))
                .map(e -> {
                    Optional<Verification> vOpt = verificationRepository.findByEvidenceId(e.getId());
                    boolean verified = vOpt.isPresent();
                    String orgName = verified ? vOpt.get().getOrganization().getName() : null;
                    boolean recent = e.getCreatedAt().isAfter(sixMonthsAgo);

                    Optional<com.kasumio.evidence.VerificationRequest> reqOpt = verificationRequestRepository
                            .findByOpportunityIdAndEvidenceIdAndRecruiterId(opp.getId(), e.getId(), recruiter.getId());

                    com.kasumio.evidence.VerificationStatus vStatus = com.kasumio.evidence.VerificationStatus.UNVERIFIED;
                    if (reqOpt.isPresent()) {
                        com.kasumio.evidence.VerificationRequest vr = reqOpt.get();
                        vStatus = vr.getStatus();
                        if (vStatus == com.kasumio.evidence.VerificationStatus.REQUESTED && vr.getRequestedAt().isBefore(expirationThreshold)) {
                            vStatus = com.kasumio.evidence.VerificationStatus.EXPIRED;
                        }
                    }

                    return new CandidateEvidenceResponse(
                            e.getId(),
                            e.getSkill().getName(),
                            e.getSkill().getCategory(),
                            e.getTitle(),
                            e.getDescription(),
                            e.getEvidenceUrl(),
                            e.getEvidenceType(),
                            verified,
                            orgName,
                            vStatus,
                            e.getCreatedAt(),
                            recent
                    );
                })
                .collect(Collectors.toList());
    }

    private void attachSkills(Opportunity opportunity, List<SkillRequirementDto> skillDtos) {
        if (skillDtos == null || skillDtos.isEmpty()) return;

        Set<Long> seenSkillIds = new HashSet<>();
        for (SkillRequirementDto dto : skillDtos) {
            if (seenSkillIds.contains(dto.getSkillId())) {
                continue; // Prevent duplicate skills
            }
            seenSkillIds.add(dto.getSkillId());

            Skill skill = skillRepository.findById(dto.getSkillId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Skill ID " + dto.getSkillId() + " does not exist"));

            OpportunitySkill oppSkill = new OpportunitySkill(opportunity, skill, dto.getSkillType());
            opportunity.getSkills().add(oppSkill);
        }
    }

    private OpportunityResponse mapToResponse(Opportunity opp, long matchedCount) {
        List<SkillRequirementDto> req = new ArrayList<>();
        List<SkillRequirementDto> pref = new ArrayList<>();

        for (OpportunitySkill s : opp.getSkills()) {
            SkillRequirementDto dto = new SkillRequirementDto(
                    s.getSkill().getId(),
                    s.getSkill().getName(),
                    s.getSkill().getCategory(),
                    s.getSkillType()
            );
            if (s.getSkillType() == SkillRequirementType.REQUIRED) {
                req.add(dto);
            } else {
                pref.add(dto);
            }
        }

        String orgName = opp.getRecruiter().getOrganization() != null 
                ? opp.getRecruiter().getOrganization().getName() 
                : null;

        return new OpportunityResponse(
                opp.getId(),
                opp.getRecruiter().getId(),
                orgName,
                opp.getTitle(),
                opp.getDescription(),
                opp.getType(),
                opp.getLocation(),
                opp.getWorkType(),
                opp.getStatus(),
                opp.getCreatedAt(),
                req,
                pref,
                matchedCount
        );
    }
}
