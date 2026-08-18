package com.kasumio.opportunity;

import com.kasumio.connection.ConnectionStatus;
import com.kasumio.connection.TrustedConnection;
import com.kasumio.connection.TrustedConnectionRepository;
import com.kasumio.evidence.Evidence;
import com.kasumio.evidence.EvidenceRepository;
import com.kasumio.evidence.VerificationRepository;
import com.kasumio.goal.CareerGoal;
import com.kasumio.goal.CareerGoalRepository;
import com.kasumio.opportunity.dto.CandidateMatchResponse;
import com.kasumio.opportunity.dto.CandidateSkillMatchDto;
import com.kasumio.opportunity.dto.StudentOpportunityResponse;
import com.kasumio.opportunity.dto.StudentSkillEvaluationDto;
import com.kasumio.skill.Skill;
import com.kasumio.student.Student;
import com.kasumio.student.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MatchingEngineService {

    private final EvidenceRepository evidenceRepository;
    private final VerificationRepository verificationRepository;
    private final CandidateAliasService candidateAliasService;
    private final OpportunityInterestRepository interestRepository;
    private final CareerGoalRepository careerGoalRepository;
    private final StudentRepository studentRepository;
    private final TrustedConnectionRepository trustedConnectionRepository;

    public MatchingEngineService(
            EvidenceRepository evidenceRepository,
            VerificationRepository verificationRepository,
            CandidateAliasService candidateAliasService,
            OpportunityInterestRepository interestRepository,
            CareerGoalRepository careerGoalRepository,
            StudentRepository studentRepository,
            TrustedConnectionRepository trustedConnectionRepository) {
        this.evidenceRepository = evidenceRepository;
        this.verificationRepository = verificationRepository;
        this.candidateAliasService = candidateAliasService;
        this.interestRepository = interestRepository;
        this.careerGoalRepository = careerGoalRepository;
        this.studentRepository = studentRepository;
        this.trustedConnectionRepository = trustedConnectionRepository;
    }

    /**
     * Surfacing anonymous candidates matching a published opportunity.
     * Deterministic, zero AI, traceable to actual database evidence records.
     */
    @Transactional
    public List<CandidateMatchResponse> findMatchesForOpportunity(Opportunity opportunity) {
        if (opportunity.getStatus() != OpportunityStatus.PUBLISHED) {
            return Collections.emptyList();
        }

        List<OpportunitySkill> requiredOppSkills = opportunity.getSkills().stream()
                .filter(s -> s.getSkillType() == SkillRequirementType.REQUIRED)
                .toList();

        List<OpportunitySkill> preferredOppSkills = opportunity.getSkills().stream()
                .filter(s -> s.getSkillType() == SkillRequirementType.PREFERRED)
                .toList();

        if (opportunity.getSkills().isEmpty()) {
            return Collections.emptyList();
        }

        List<Student> allStudents = studentRepository.findAll();
        List<CandidateMatchResponse> matchedCandidates = new ArrayList<>();

        for (Student student : allStudents) {
            List<Evidence> studentEvidence = evidenceRepository.findByStudentOrderByCreatedAtDesc(student);

            // Check student interest
            Optional<OpportunityInterest> interestOpt = interestRepository.findByOpportunityIdAndStudentId(opportunity.getId(), student.getId());
            boolean hasExpressedInterest = interestOpt.map(i -> i.getStatus() == InterestStatus.INTERESTED).orElse(false);
            InterestStatus interestStatus = interestOpt.map(OpportunityInterest::getStatus).orElse(null);

            // Group evidence by skill ID
            Map<Long, List<Evidence>> evidenceBySkillId = studentEvidence.stream()
                    .collect(Collectors.groupingBy(e -> e.getSkill().getId()));

            // Evaluate required skills
            int demonstratedRequiredCount = 0;
            List<CandidateSkillMatchDto> requiredMatches = new ArrayList<>();

            for (OpportunitySkill reqOppSkill : requiredOppSkills) {
                Long skillId = reqOppSkill.getSkill().getId();
                String skillName = reqOppSkill.getSkill().getName();
                List<Evidence> evList = evidenceBySkillId.getOrDefault(skillId, Collections.emptyList());

                CandidateSkillMatchDto matchDto = evaluateSkillEvidence(skillName, evList);
                requiredMatches.add(matchDto);

                if (matchDto.getStatus() != EvidenceLevel.NO_EVIDENCE) {
                    demonstratedRequiredCount++;
                }
            }

            // Evaluate preferred skills
            int demonstratedPreferredCount = 0;
            List<CandidateSkillMatchDto> preferredMatches = new ArrayList<>();
            for (OpportunitySkill prefOppSkill : preferredOppSkills) {
                Long skillId = prefOppSkill.getSkill().getId();
                String skillName = prefOppSkill.getSkill().getName();
                List<Evidence> evList = evidenceBySkillId.getOrDefault(skillId, Collections.emptyList());

                CandidateSkillMatchDto matchDto = evaluateSkillEvidence(skillName, evList);
                preferredMatches.add(matchDto);

                if (matchDto.getStatus() != EvidenceLevel.NO_EVIDENCE) {
                    demonstratedPreferredCount++;
                }
            }

            int totalRequired = requiredOppSkills.size();
            double demonstratedRatio = totalRequired > 0 ? ((double) demonstratedRequiredCount / totalRequired) : 0.0;

            // Strict threshold: Must have expressed interest OR demonstrated >= 50% of required skills (minimum 1 demonstrated)
            // If no required skills are defined, must have at least 1 preferred skill demonstrated.
            boolean isMatched = hasExpressedInterest
                    || (totalRequired > 0 && demonstratedRequiredCount >= 1 && demonstratedRatio >= 0.5)
                    || (totalRequired == 0 && demonstratedPreferredCount >= 1);

            if (isMatched) {
                String alias = candidateAliasService.getOrCreateAlias(student);
                String whySurfaced = generateRecruiterWhySurfaced(requiredMatches, preferredMatches);
                if (hasExpressedInterest && !studentEvidence.isEmpty()) {
                    whySurfaced = "Candidate expressed mutual interest. " + whySurfaced;
                } else if (hasExpressedInterest && studentEvidence.isEmpty()) {
                    whySurfaced = "Candidate expressed direct interest in this opportunity.";
                }

                Optional<TrustedConnection> connOpt = trustedConnectionRepository.findByOpportunityAndStudent(opportunity, student);
                ConnectionStatus connectionStatus = connOpt.map(TrustedConnection::getEffectiveStatus).orElse(null);
                Long connectionId = connOpt.map(TrustedConnection::getId).orElse(null);

                matchedCandidates.add(new CandidateMatchResponse(
                        alias,
                        requiredMatches,
                        preferredMatches,
                        whySurfaced,
                        hasExpressedInterest,
                        interestStatus,
                        connectionStatus,
                        connectionId
                ));
            }
        }

        return matchedCandidates;
    }

    /**
     * Evaluate relevance of a published opportunity for a specific authenticated student.
     */
    @Transactional(readOnly = true)
    public Optional<StudentOpportunityResponse> evaluateStudentRelevance(Opportunity opportunity, Student student) {
        if (opportunity.getStatus() != OpportunityStatus.PUBLISHED) {
            return Optional.empty();
        }

        List<Evidence> studentEvidence = evidenceRepository.findByStudentOrderByCreatedAtDesc(student);
        Map<Long, List<Evidence>> evidenceBySkillId = studentEvidence.stream()
                .collect(Collectors.groupingBy(e -> e.getSkill().getId()));

        List<OpportunitySkill> requiredOppSkills = opportunity.getSkills().stream()
                .filter(s -> s.getSkillType() == SkillRequirementType.REQUIRED)
                .toList();

        List<OpportunitySkill> preferredOppSkills = opportunity.getSkills().stream()
                .filter(s -> s.getSkillType() == SkillRequirementType.PREFERRED)
                .toList();

        List<StudentSkillEvaluationDto> checklist = new ArrayList<>();
        int demonstratedRequiredCount = 0;
        List<String> demonstratedNames = new ArrayList<>();
        List<String> missingRequiredNames = new ArrayList<>();

        for (OpportunitySkill oppSkill : opportunity.getSkills()) {
            Long skillId = oppSkill.getSkill().getId();
            String skillName = oppSkill.getSkill().getName();
            String skillCategory = oppSkill.getSkill().getCategory();
            List<Evidence> evList = evidenceBySkillId.getOrDefault(skillId, Collections.emptyList());

            EvidenceLevel level;
            if (evList.isEmpty()) {
                level = EvidenceLevel.NO_EVIDENCE;
            } else if (evList.size() == 1) {
                level = EvidenceLevel.LIMITED_EVIDENCE;
            } else {
                level = EvidenceLevel.STRONG_EVIDENCE;
            }

            boolean isVerified = evList.stream().anyMatch(e -> verificationRepository.existsByEvidenceId(e.getId()));
            boolean isDemonstrated = level != EvidenceLevel.NO_EVIDENCE;

            if (isDemonstrated && oppSkill.getSkillType() == SkillRequirementType.REQUIRED) {
                demonstratedRequiredCount++;
                demonstratedNames.add(skillName);
            } else if (!isDemonstrated && oppSkill.getSkillType() == SkillRequirementType.REQUIRED) {
                missingRequiredNames.add(skillName);
            } else if (isDemonstrated) {
                demonstratedNames.add(skillName);
            }

            checklist.add(new StudentSkillEvaluationDto(
                    skillId,
                    skillName,
                    skillCategory,
                    oppSkill.getSkillType(),
                    isDemonstrated,
                    evList.size(),
                    isVerified,
                    level
            ));
        }

        Optional<OpportunityInterest> interestOpt = interestRepository.findByOpportunityIdAndStudentId(opportunity.getId(), student.getId());
        boolean hasExpressedInterest = interestOpt.map(i -> i.getStatus() == InterestStatus.INTERESTED).orElse(false);
        InterestStatus interestStatus = interestOpt.map(OpportunityInterest::getStatus).orElse(null);

        // Student relevance rule: Must have at least 1 demonstrated skill (required or preferred) or expressed interest
        if (demonstratedNames.isEmpty() && !hasExpressedInterest) {
            return Optional.empty();
        }

        // Check secondary career goal context
        List<CareerGoal> goals = careerGoalRepository.findByStudentOrderByTitleAsc(student);
        String careerGoalContext = null;
        if (!goals.isEmpty()) {
            for (CareerGoal g : goals) {
                if (opportunity.getTitle().toLowerCase().contains(g.getTargetRole().toLowerCase()) ||
                    g.getTargetRole().toLowerCase().contains(opportunity.getTitle().toLowerCase())) {
                    careerGoalContext = g.getTargetRole();
                    break;
                }
            }
        }

        String whyRelevant;
        if (demonstratedNames.isEmpty()) {
            whyRelevant = "Explore required skills and submit demonstrable evidence to strengthen your candidate match.";
        } else {
            whyRelevant = generateStudentWhyRelevant(demonstratedNames, missingRequiredNames, careerGoalContext);
        }

        String orgName = opportunity.getRecruiter().getOrganization() != null 
                ? opportunity.getRecruiter().getOrganization().getName() 
                : "Verified Hiring Partner";

        return Optional.of(new StudentOpportunityResponse(
                opportunity.getId(),
                orgName,
                opportunity.getTitle(),
                opportunity.getDescription(),
                opportunity.getType(),
                opportunity.getLocation(),
                opportunity.getWorkType(),
                opportunity.getStatus(),
                opportunity.getCreatedAt(),
                whyRelevant,
                checklist,
                hasExpressedInterest,
                interestStatus
        ));
    }

    private CandidateSkillMatchDto evaluateSkillEvidence(String skillName, List<Evidence> evList) {
        if (evList.isEmpty()) {
            return new CandidateSkillMatchDto(skillName, EvidenceLevel.NO_EVIDENCE, false, false, false);
        }

        EvidenceLevel level = evList.size() >= 2 ? EvidenceLevel.STRONG_EVIDENCE : EvidenceLevel.LIMITED_EVIDENCE;
        boolean verified = evList.stream().anyMatch(e -> verificationRepository.existsByEvidenceId(e.getId()));

        Instant sixMonthsAgo = Instant.now().minus(180, ChronoUnit.DAYS);
        boolean recent = evList.stream().anyMatch(e -> e.getCreatedAt().isAfter(sixMonthsAgo));
        boolean multiple = evList.size() >= 2;

        return new CandidateSkillMatchDto(skillName, level, verified, recent, multiple);
    }

    private String generateRecruiterWhySurfaced(
            List<CandidateSkillMatchDto> requiredMatches,
            List<CandidateSkillMatchDto> preferredMatches) {
        List<String> strongOrMultiple = new ArrayList<>();
        List<String> limited = new ArrayList<>();

        for (CandidateSkillMatchDto r : requiredMatches) {
            if (r.getStatus() == EvidenceLevel.STRONG_EVIDENCE) {
                strongOrMultiple.add(r.getSkill());
            } else if (r.getStatus() == EvidenceLevel.LIMITED_EVIDENCE) {
                limited.add(r.getSkill());
            }
        }

        for (CandidateSkillMatchDto p : preferredMatches) {
            if (p.getStatus() == EvidenceLevel.STRONG_EVIDENCE) {
                strongOrMultiple.add(p.getSkill());
            } else if (p.getStatus() == EvidenceLevel.LIMITED_EVIDENCE) {
                limited.add(p.getSkill());
            }
        }

        StringBuilder sb = new StringBuilder();
        if (!strongOrMultiple.isEmpty()) {
            sb.append("Relevant evidence exists for ").append(formatList(strongOrMultiple)).append(".");
        }
        if (!limited.isEmpty()) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(formatList(limited)).append(" evidence is currently limited.");
        }

        return sb.length() > 0 ? sb.toString() : "Demonstrated evidence aligns with core requirements.";
    }

    private String generateStudentWhyRelevant(List<String> demonstrated, List<String> missingRequired, String careerGoalRole) {
        StringBuilder sb = new StringBuilder();
        sb.append("Relevant because your existing evidence demonstrates ").append(formatList(demonstrated)).append(".");
        
        if (careerGoalRole != null) {
            sb.append(" Aligns with your defined career goal (").append(careerGoalRole).append(").");
        }

        if (!missingRequired.isEmpty()) {
            sb.append(" ").append(formatList(missingRequired)).append(" evidence is not currently present.");
        }

        return sb.toString();
    }

    private String formatList(List<String> items) {
        if (items.isEmpty()) return "";
        if (items.size() == 1) return items.get(0);
        if (items.size() == 2) return items.get(0) + " and " + items.get(1);
        return String.join(", ", items.subList(0, items.size() - 1)) + " and " + items.get(items.size() - 1);
    }
}
