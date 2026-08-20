package com.kasumio.discovery;

import com.kasumio.common.SecurityUtils;
import com.kasumio.discovery.dto.*;
import com.kasumio.opportunity.*;
import com.kasumio.skill.Skill;
import com.kasumio.skill.SkillRepository;
import com.kasumio.student.Student;
import com.kasumio.student.StudentRepository;
import com.kasumio.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Opportunity Discovery Service
 * 
 * Central orchestration for student opportunity discovery, natural language query processing,
 * smart filtering, personalized feeds, detailed match inspections, and tracking.
 */
@Service
public class OpportunityDiscoveryService {

    private final OpportunityRepository opportunityRepository;
    private final OpportunityInterestRepository interestRepository;
    private final OpportunitySavedRepository savedRepository;
    private final SkillRepository skillRepository;
    private final SkillAliasRepository aliasRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final DeterministicMatchScorer matchScorer;
    private final TechnologyNormalizationService normalizationService;
    private final GapAnalysisService gapAnalysisService;
    private final NextBestActionService nextBestActionService;
    private final RecommendationRepository recommendationRepository;

    public OpportunityDiscoveryService(
            OpportunityRepository opportunityRepository,
            OpportunityInterestRepository interestRepository,
            OpportunitySavedRepository savedRepository,
            SkillRepository skillRepository,
            SkillAliasRepository aliasRepository,
            StudentRepository studentRepository,
            UserRepository userRepository,
            DeterministicMatchScorer matchScorer,
            TechnologyNormalizationService normalizationService,
            GapAnalysisService gapAnalysisService,
            NextBestActionService nextBestActionService,
            RecommendationRepository recommendationRepository) {
        this.opportunityRepository = opportunityRepository;
        this.interestRepository = interestRepository;
        this.savedRepository = savedRepository;
        this.skillRepository = skillRepository;
        this.aliasRepository = aliasRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.matchScorer = matchScorer;
        this.normalizationService = normalizationService;
        this.gapAnalysisService = gapAnalysisService;
        this.nextBestActionService = nextBestActionService;
        this.recommendationRepository = recommendationRepository;
    }

    /**
     * Get personalized opportunity recommendations for authenticated student.
     */
    @Transactional(readOnly = true)
    public List<OpportunityDiscoverySummaryResponse> getPersonalizedRecommendations(OpportunityFilterRequest filter) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        List<Opportunity> publishedOpps = opportunityRepository.findPublishedWithSkills(OpportunityStatus.PUBLISHED);

        // Pre-parse natural language query if present
        OpportunityFilterRequest effectiveFilter = parseNaturalLanguageQuery(filter);

        List<OpportunityDiscoverySummaryResponse> results = new ArrayList<>();

        for (Opportunity opp : publishedOpps) {
            // Ignore expired unless specifically requested
            if (opp.isExpired() && !"ALL".equalsIgnoreCase(effectiveFilter.getDeadlineFilter())) {
                continue;
            }

            // Apply filter dimensions
            if (!matchesFilter(opp, effectiveFilter)) {
                continue;
            }

            DeterministicMatchScorer.MatchResult match = matchScorer.calculateMatch(student, opp);

            // Filter by match strength
            if (effectiveFilter.getMatchStrength() != null && !effectiveFilter.getMatchStrength().isBlank()) {
                String ms = effectiveFilter.getMatchStrength().toUpperCase();
                if ("STRONG".equals(ms) && !match.getMatchCategory().equals("Strong Match")) continue;
                if ("POTENTIAL".equals(ms) && !match.getMatchCategory().equals("Potential Match")) continue;
                if ("STRETCH".equals(ms) && !match.getMatchCategory().equals("Stretch Opportunity")) continue;
            }

            Optional<OpportunityInterest> interestOpt = interestRepository.findByOpportunityIdAndStudentId(opp.getId(), student.getId());
            boolean hasInterest = interestOpt.map(i -> i.getStatus() == InterestStatus.INTERESTED).orElse(false);

            Optional<OpportunitySaved> savedOpt = savedRepository.findByOpportunityIdAndStudentId(opp.getId(), student.getId());
            boolean isSaved = savedOpt.isPresent();
            String saveStatus = savedOpt.map(OpportunitySaved::getSaveStatus).orElse(null);

            String orgName = opp.getRecruiter().getOrganization() != null 
                    ? opp.getRecruiter().getOrganization().getName() 
                    : "Verified Partner";

            List<String> strongSkills = match.getMatchedSkills().stream()
                    .map(m -> m.getSkill().getName())
                    .limit(4)
                    .collect(Collectors.toList());

            List<String> missingSkills = match.getMissingSkills().stream()
                    .map(m -> m.getSkill().getName())
                    .limit(3)
                    .collect(Collectors.toList());

            List<Skill> missingSkillEntities = match.getMissingSkills().stream()
                    .map(DeterministicMatchScorer.TechnologyMatchDetail::getSkill)
                    .collect(Collectors.toList());

            NextBestActionService.NextBestActionResult nba = nextBestActionService.determineNextAction(student, opp, missingSkillEntities);

            // Persist recommendation record for tracking feedback loop
            try {
                Optional<Recommendation> recOpt = recommendationRepository.findByStudentAndOpportunity(student, opp);
                if (recOpt.isEmpty()) {
                    recommendationRepository.save(new Recommendation(
                            student,
                            opp,
                            match.getReadinessState(),
                            nba.getEvidenceRoi()
                    ));
                }
            } catch (Exception ignored) {}

            results.add(new OpportunityDiscoverySummaryResponse(
                    opp.getId(),
                    opp.getTitle(),
                    orgName,
                    opp.getType(),
                    opp.getLocation(),
                    opp.getWorkType(),
                    opp.getStatus(),
                    opp.getCreatedAt(),
                    opp.getDeadline(),
                    opp.getCompensation(),
                    opp.getDuration(),
                    opp.getVerificationStatus(),
                    match.getOverallScore(),
                    match.getMatchCategory(),
                    match.getWhyRecommended(),
                    match.getDeadlineNote(),
                    strongSkills,
                    missingSkills,
                    hasInterest,
                    isSaved,
                    saveStatus,
                    match.getReadinessState(),
                    nba.getEvidenceRoi(),
                    nba.getRecommendedAction(),
                    match.getWhyNotRecommended()
            ));
        }

        // Apply sorting
        sortResults(results, effectiveFilter.getSortBy());

        return results;
    }

    /**
     * Get detailed opportunity inspection with complete match and gap breakdown.
     */
    @Transactional(readOnly = true)
    public OpportunityDiscoveryDetailResponse getOpportunityDetail(Long id) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        Opportunity opp = opportunityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Opportunity not found"));

        if (opp.getStatus() != OpportunityStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Opportunity is not published");
        }

        DeterministicMatchScorer.MatchResult match = matchScorer.calculateMatch(student, opp);

        List<TechnologySkillEvaluationDto> evaluations = new ArrayList<>();

        for (DeterministicMatchScorer.TechnologyMatchDetail m : match.getMatchedSkills()) {
            evaluations.add(mapEvaluationDto(m, "MATCHED"));
        }
        for (DeterministicMatchScorer.TechnologyMatchDetail p : match.getPartialSkills()) {
            evaluations.add(mapEvaluationDto(p, "PARTIAL"));
        }
        for (DeterministicMatchScorer.TechnologyMatchDetail miss : match.getMissingSkills()) {
            evaluations.add(mapEvaluationDto(miss, "MISSING"));
        }

        // Specific gaps for this opportunity
        List<PrioritizedGapDto> oppGaps = new ArrayList<>();
        for (DeterministicMatchScorer.TechnologyMatchDetail miss : match.getMissingSkills()) {
            boolean isReq = miss.getRequirementType() == SkillRequirementType.REQUIRED;
            String priority = isReq ? "HIGH" : "MEDIUM";
            String reason = isReq ? "Required skill for this role." : "Preferred differentiator for this role.";
            String action = "Add a verified project or code sample for " + miss.getSkill().getName() + ".";

            oppGaps.add(new PrioritizedGapDto(
                    miss.getSkill().getId(),
                    miss.getSkill().getName(),
                    miss.getSkill().getCategory(),
                    miss.getSkill().getSubcategory(),
                    miss.getSkill().getEcosystem(),
                    priority,
                    1,
                    isReq,
                    reason,
                    action,
                    List.of(opp.getTitle())
            ));
        }

        Optional<OpportunityInterest> interestOpt = interestRepository.findByOpportunityIdAndStudentId(opp.getId(), student.getId());
        boolean hasInterest = interestOpt.map(i -> i.getStatus() == InterestStatus.INTERESTED).orElse(false);

        Optional<OpportunitySaved> savedOpt = savedRepository.findByOpportunityIdAndStudentId(opp.getId(), student.getId());
        boolean isSaved = savedOpt.isPresent();
        String saveStatus = savedOpt.map(OpportunitySaved::getSaveStatus).orElse(null);

        String orgName = opp.getRecruiter().getOrganization() != null 
                ? opp.getRecruiter().getOrganization().getName() 
                : "Verified Partner";

        List<Skill> missingSkillEntities = match.getMissingSkills().stream()
                .map(DeterministicMatchScorer.TechnologyMatchDetail::getSkill)
                .collect(Collectors.toList());

        NextBestActionService.NextBestActionResult nba = nextBestActionService.determineNextAction(student, opp, missingSkillEntities);

        return new OpportunityDiscoveryDetailResponse(
                opp.getId(),
                opp.getTitle(),
                orgName,
                opp.getType(),
                opp.getDescription(),
                opp.getLocation(),
                opp.getWorkType(),
                opp.getStatus(),
                opp.getCreatedAt(),
                opp.getDeadline(),
                opp.getSource(),
                opp.getSourceUrl(),
                opp.getPostedAt(),
                opp.getLastVerifiedAt(),
                opp.getVerificationStatus(),
                opp.getCompensation(),
                opp.getDuration(),
                opp.getEligibility(),
                opp.getEducationRequirements(),
                opp.getExperienceRequirements(),
                match.getOverallScore(),
                match.getMatchCategory(),
                match.isEligible(),
                match.getEligibilityReason(),
                match.getWhyRecommended(),
                match.getCareerAlignmentNote(),
                match.getDeadlineNote(),
                evaluations,
                oppGaps,
                hasInterest,
                isSaved,
                saveStatus,
                match.getReadinessState(),
                nba.getEvidenceRoi(),
                nba.getRecommendedAction(),
                nba.getReasoning(),
                match.getWhyNotRecommended()
        );
    }

    /**
     * Get student gap report across all active opportunities.
     */
    @Transactional(readOnly = true)
    public StudentGapReportDto getStudentGapReport() {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        GapAnalysisService.StudentGapReport report = gapAnalysisService.generateStudentGapReport(student);

        List<PrioritizedGapDto> high = report.getHighPriorityGaps().stream().map(this::mapGapDto).toList();
        List<PrioritizedGapDto> med = report.getMediumPriorityGaps().stream().map(this::mapGapDto).toList();
        List<PrioritizedGapDto> low = report.getLowPriorityGaps().stream().map(this::mapGapDto).toList();

        return new StudentGapReportDto(
                report.getTotalOpportunitiesAnalyzed(),
                high,
                med,
                low,
                report.getGapsByCategory()
        );
    }

    /**
     * Save or bookmark an opportunity for tracking.
     */
    @Transactional
    public void saveOpportunity(Long opportunityId, String status) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        Opportunity opp = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Opportunity not found"));

        Optional<OpportunitySaved> existing = savedRepository.findByOpportunityIdAndStudentId(opp.getId(), student.getId());
        if (existing.isPresent()) {
            OpportunitySaved saved = existing.get();
            saved.setSaveStatus(status != null ? status : "SAVED");
            savedRepository.save(saved);
        } else {
            OpportunitySaved saved = new OpportunitySaved(student, opp, status != null ? status : "SAVED");
            savedRepository.save(saved);
        }
    }

    /**
     * Remove saved bookmark.
     */
    @Transactional
    public void unsaveOpportunity(Long opportunityId) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        Optional<OpportunitySaved> existing = savedRepository.findByOpportunityIdAndStudentId(opportunityId, student.getId());
        existing.ifPresent(savedRepository::delete);
    }

    /**
     * List all saved opportunities for student.
     */
    @Transactional(readOnly = true)
    public List<OpportunityDiscoverySummaryResponse> getSavedOpportunities() {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        List<OpportunitySaved> savedList = savedRepository.findByStudentOrderByUpdatedAtDesc(student);

        List<OpportunityDiscoverySummaryResponse> results = new ArrayList<>();
        for (OpportunitySaved saved : savedList) {
            Opportunity opp = saved.getOpportunity();
            DeterministicMatchScorer.MatchResult match = matchScorer.calculateMatch(student, opp);

            Optional<OpportunityInterest> interestOpt = interestRepository.findByOpportunityIdAndStudentId(opp.getId(), student.getId());
            boolean hasInterest = interestOpt.map(i -> i.getStatus() == InterestStatus.INTERESTED).orElse(false);

            String orgName = opp.getRecruiter().getOrganization() != null 
                    ? opp.getRecruiter().getOrganization().getName() 
                    : "Verified Partner";

            List<Skill> missingSkillEntities = match.getMissingSkills().stream()
                    .map(DeterministicMatchScorer.TechnologyMatchDetail::getSkill)
                    .collect(Collectors.toList());

            NextBestActionService.NextBestActionResult nba = nextBestActionService.determineNextAction(student, opp, missingSkillEntities);

            results.add(new OpportunityDiscoverySummaryResponse(
                    opp.getId(),
                    opp.getTitle(),
                    orgName,
                    opp.getType(),
                    opp.getLocation(),
                    opp.getWorkType(),
                    opp.getStatus(),
                    opp.getCreatedAt(),
                    opp.getDeadline(),
                    opp.getCompensation(),
                    opp.getDuration(),
                    opp.getVerificationStatus(),
                    match.getOverallScore(),
                    match.getMatchCategory(),
                    match.getWhyRecommended(),
                    match.getDeadlineNote(),
                    match.getMatchedSkills().stream().map(m -> m.getSkill().getName()).limit(4).toList(),
                    match.getMissingSkills().stream().map(m -> m.getSkill().getName()).limit(3).toList(),
                    hasInterest,
                    true,
                    saved.getSaveStatus(),
                    match.getReadinessState(),
                    nba.getEvidenceRoi(),
                    nba.getRecommendedAction(),
                    match.getWhyNotRecommended()
            ));
        }

        return results;
    }

    /**
     * Get full technology catalog for smart filters and taxonomy lookups.
     */
    @Transactional(readOnly = true)
    public List<TechnologyCatalogDto> getTechnologyCatalog() {
        List<Skill> allSkills = skillRepository.findAll();
        List<SkillAlias> allAliases = aliasRepository.findAll();

        Map<Long, List<String>> aliasesBySkillId = allAliases.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getSkill().getId(),
                        Collectors.mapping(SkillAlias::getAliasName, Collectors.toList())
                ));

        return allSkills.stream()
                .sorted(Comparator.comparing(Skill::getName))
                .map(s -> new TechnologyCatalogDto(
                        s.getId(),
                        s.getName(),
                        s.getCategory(),
                        s.getSubcategory(),
                        s.getEcosystem(),
                        s.getCanonicalName(),
                        aliasesBySkillId.getOrDefault(s.getId(), Collections.emptyList())
                ))
                .collect(Collectors.toList());
    }

    /**
     * Get single technology detail by ID.
     */
    @Transactional(readOnly = true)
    public TechnologyCatalogDto getTechnologyDetail(Long id) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Technology not found"));
        List<SkillAlias> aliases = aliasRepository.findBySkill(skill);
        List<String> aliasNames = aliases.stream().map(SkillAlias::getAliasName).collect(Collectors.toList());
        return new TechnologyCatalogDto(
                skill.getId(),
                skill.getName(),
                skill.getCategory(),
                skill.getSubcategory(),
                skill.getEcosystem(),
                skill.getCanonicalName(),
                aliasNames
        );
    }

    // ---------------- Helper methods ----------------

    private OpportunityFilterRequest parseNaturalLanguageQuery(OpportunityFilterRequest filter) {
        if (filter == null) return new OpportunityFilterRequest();
        if (filter.getQuery() == null || filter.getQuery().isBlank()) return filter;

        String q = filter.getQuery().toLowerCase();

        // Detect Opportunity Type
        if (filter.getType() == null) {
            if (q.contains("internship") || q.contains("intern")) filter.setType(OpportunityType.INTERNSHIP);
            else if (q.contains("hackathon")) filter.setType(OpportunityType.HACKATHON);
            else if (q.contains("project")) filter.setType(OpportunityType.PROJECT);
            else if (q.contains("research")) filter.setType(OpportunityType.RESEARCH);
            else if (q.contains("fellowship")) filter.setType(OpportunityType.FELLOWSHIP);
            else if (q.contains("freelance")) filter.setType(OpportunityType.FREELANCE);
            else if (q.contains("job") || q.contains("full time") || q.contains("engineer")) filter.setType(OpportunityType.JOB);
        }

        // Detect Work Type
        if (filter.getWorkType() == null) {
            if (q.contains("remote") || q.contains("work from home")) filter.setWorkType(WorkType.REMOTE);
            else if (q.contains("hybrid")) filter.setWorkType(WorkType.HYBRID);
            else if (q.contains("on-site") || q.contains("onsite") || q.contains("in-office")) filter.setWorkType(WorkType.ON_SITE);
        }

        // Detect Deadline intent
        if (filter.getDeadlineFilter() == null) {
            if (q.contains("closing soon") || q.contains("closing this week") || q.contains("deadline")) {
                filter.setDeadlineFilter("CLOSING_SOON");
            } else if (q.contains("closing today")) {
                filter.setDeadlineFilter("CLOSING_TODAY");
            }
        }

        // Detect Match strength intent
        if (filter.getMatchStrength() == null) {
            if (q.contains("strong match") || q.contains("best match") || q.contains("i am a strong match")) {
                filter.setMatchStrength("STRONG");
            } else if (q.contains("stretch")) {
                filter.setMatchStrength("STRETCH");
            }
        }

        // Extract technologies mentioned in query
        List<Skill> querySkills = normalizationService.extractFromText(filter.getQuery());
        if (!querySkills.isEmpty() && (filter.getTechnologies() == null || filter.getTechnologies().isEmpty())) {
            filter.setTechnologies(querySkills.stream().map(Skill::getName).collect(Collectors.toList()));
        }

        return filter;
    }

    private boolean matchesFilter(Opportunity opp, OpportunityFilterRequest filter) {
        if (filter.getType() != null && opp.getType() != filter.getType()) return false;
        if (filter.getWorkType() != null && opp.getWorkType() != filter.getWorkType()) return false;
        if (filter.getLocation() != null && !filter.getLocation().isBlank()) {
            if (opp.getLocation() == null || !opp.getLocation().toLowerCase().contains(filter.getLocation().toLowerCase())) {
                return false;
            }
        }

        if (filter.getDeadlineFilter() != null && !"ALL".equalsIgnoreCase(filter.getDeadlineFilter())) {
            if (opp.getDeadline() == null) return false;
            long days = ChronoUnit.DAYS.between(Instant.now(), opp.getDeadline());
            if ("CLOSING_TODAY".equalsIgnoreCase(filter.getDeadlineFilter()) && (days < 0 || days > 1)) return false;
            if ("CLOSING_SOON".equalsIgnoreCase(filter.getDeadlineFilter()) && (days < 0 || days > 7)) return false;
        }

        if (filter.getTechnologies() != null && !filter.getTechnologies().isEmpty()) {
            Set<String> oppTechNames = opp.getSkills().stream()
                    .map(os -> os.getSkill().getName().toLowerCase())
                    .collect(Collectors.toSet());

            boolean hasAnyTech = filter.getTechnologies().stream()
                    .anyMatch(t -> oppTechNames.contains(t.toLowerCase()));
            if (!hasAnyTech) return false;
        }

        return true;
    }

    private void sortResults(List<OpportunityDiscoverySummaryResponse> results, String sortBy) {
        if (sortBy == null || "MATCH_SCORE".equalsIgnoreCase(sortBy)) {
            results.sort((a, b) -> Integer.compare(b.getMatchScore(), a.getMatchScore()));
        } else if ("DEADLINE".equalsIgnoreCase(sortBy)) {
            results.sort((a, b) -> {
                if (a.getDeadline() == null && b.getDeadline() == null) return 0;
                if (a.getDeadline() == null) return 1;
                if (b.getDeadline() == null) return -1;
                return a.getDeadline().compareTo(b.getDeadline());
            });
        } else if ("RECENT".equalsIgnoreCase(sortBy)) {
            results.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        } else if ("TITLE".equalsIgnoreCase(sortBy)) {
            results.sort(Comparator.comparing(OpportunityDiscoverySummaryResponse::getTitle));
        }
    }

    private TechnologySkillEvaluationDto mapEvaluationDto(DeterministicMatchScorer.TechnologyMatchDetail m, String status) {
        return new TechnologySkillEvaluationDto(
                m.getSkill().getId(),
                m.getSkill().getName(),
                m.getSkill().getCategory(),
                m.getSkill().getSubcategory(),
                m.getSkill().getEcosystem(),
                m.getRequirementType(),
                status,
                m.getEvidenceLevel(),
                0,
                m.getEvidenceLevel() == EvidenceLevel.VERIFIED,
                m.getExplanation()
        );
    }

    private PrioritizedGapDto mapGapDto(GapAnalysisService.PrioritizedSkillGap g) {
        return new PrioritizedGapDto(
                g.getSkill().getId(),
                g.getSkill().getName(),
                g.getSkill().getCategory(),
                g.getSkill().getSubcategory(),
                g.getSkill().getEcosystem(),
                g.getPriority(),
                g.getOpportunitiesAffectedCount(),
                g.isRequiredInKeyRole(),
                g.getPriorityReason(),
                g.getRecommendedAction(),
                g.getRelatedOpportunityTitles()
        );
    }
}
