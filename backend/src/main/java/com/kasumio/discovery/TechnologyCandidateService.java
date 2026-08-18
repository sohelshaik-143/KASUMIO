package com.kasumio.discovery;

import com.kasumio.discovery.dto.TechnologyCandidateDto;
import com.kasumio.skill.Skill;
import com.kasumio.skill.SkillRepository;
import com.kasumio.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Dynamic Technology Candidate Service
 * 
 * Implements the 14-step dynamic discovery lifecycle:
 * 1. Detect unknown technology term
 * 2. Normalize it (trim, casing)
 * 3. Identify potential aliases
 * 4. Identify suggested category
 * 5. Identify suggested subcategory
 * 6. Identify suggested ecosystem
 * 7. Identify potential relationships
 * 8. Identify prerequisites where possible
 * 9. Identify version information
 * 10. Record source (Opportunity description, student submission, search query)
 * 11. Assign confidence score
 * 12. Mark initial verification state (DISCOVERED / UNVERIFIED)
 * 13. Persist as technology candidate
 * 14. Promote to verified technology in taxonomy only after authorized verification
 */
@Service
public class TechnologyCandidateService {

    private final TechnologyCandidateRepository candidateRepository;
    private final SkillRepository skillRepository;
    private final SkillAliasRepository aliasRepository;
    private final SkillRelationshipRepository relationshipRepository;

    private static final Pattern VERSION_PATTERN = Pattern.compile("^(.+?)\\s+(\\d+(?:\\.\\d+)*)$");

    public TechnologyCandidateService(TechnologyCandidateRepository candidateRepository,
                                      SkillRepository skillRepository,
                                      SkillAliasRepository aliasRepository,
                                      SkillRelationshipRepository relationshipRepository) {
        this.candidateRepository = candidateRepository;
        this.skillRepository = skillRepository;
        this.aliasRepository = aliasRepository;
        this.relationshipRepository = relationshipRepository;
    }

    /**
     * 14-Step Discovery Flow: Detect and record an unknown technology term.
     */
    @Transactional
    public TechnologyCandidate discoverOrRecordCandidate(String rawTerm, String source) {
        if (rawTerm == null || rawTerm.isBlank()) {
            return null;
        }

        String trimmed = rawTerm.trim();

        // Check if already in verified taxonomy
        if (skillRepository.findByNameIgnoreCase(trimmed).isPresent() ||
            aliasRepository.findByAliasNameIgnoreCase(trimmed).isPresent()) {
            return null; // Already confirmed technology
        }

        // Step 2: Normalize
        String normalized = normalizeTerm(trimmed);

        // Check if candidate already exists
        Optional<TechnologyCandidate> existingOpt = candidateRepository.findByNormalizedNameIgnoreCase(normalized);
        if (existingOpt.isPresent()) {
            TechnologyCandidate existing = existingOpt.get();
            existing.incrementOccurrence();
            return candidateRepository.save(existing);
        }

        // Step 3-9: Infer metadata
        String versionInfo = extractVersion(trimmed);
        String category = inferCategory(normalized);
        String subcategory = inferSubcategory(category, normalized);
        String ecosystem = inferEcosystem(normalized);
        String aliasList = generateCandidateAliases(normalized);
        double confidence = calculateInitialConfidence(normalized, source);

        // Step 10-13: Create and persist candidate
        TechnologyCandidate candidate = new TechnologyCandidate(
                trimmed,
                normalized,
                category,
                subcategory,
                ecosystem,
                versionInfo,
                aliasList,
                source != null ? source : "DISCOVERY_STREAM",
                confidence
        );

        return candidateRepository.save(candidate);
    }

    /**
     * Step 14: Promote candidate to confirmed verified Skill and create its aliases/relationships.
     */
    @Transactional
    public Skill promoteToVerifiedSkill(Long candidateId, User verifier) {
        TechnologyCandidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found: " + candidateId));

        if ("VERIFIED".equals(candidate.getStatus())) {
            return skillRepository.findByNameIgnoreCase(candidate.getNormalizedName())
                    .orElseThrow(() -> new IllegalStateException("Skill marked verified but missing from skills table"));
        }

        // Check if already exists in skills
        Optional<Skill> existingSkill = skillRepository.findByNameIgnoreCase(candidate.getNormalizedName());
        Skill skill;
        if (existingSkill.isPresent()) {
            skill = existingSkill.get();
        } else {
            skill = new Skill();
            skill.setName(candidate.getNormalizedName());
            skill.setCategory(candidate.getSuggestedCategory() != null ? candidate.getSuggestedCategory() : "Emerging Technology");
            skill.setSubcategory(candidate.getSuggestedSubcategory());
            skill.setEcosystem(candidate.getSuggestedEcosystem());
            skill.setCanonicalName(candidate.getNormalizedName());
            skill.setVersionInfo(candidate.getVersionInfo());
            skill.setTechnologyStatus("ACTIVE");
            skill = skillRepository.save(skill);
        }

        // Add raw name as alias if different from normalized
        if (!candidate.getRawName().equalsIgnoreCase(candidate.getNormalizedName())) {
            if (aliasRepository.findByAliasNameIgnoreCase(candidate.getRawName()).isEmpty()) {
                aliasRepository.save(new SkillAlias(candidate.getRawName(), skill));
            }
        }

        // Mark candidate as VERIFIED
        candidate.setStatus("VERIFIED");
        candidate.setVerifiedAt(Instant.now());
        candidate.setVerifiedBy(verifier);
        candidateRepository.save(candidate);

        return skill;
    }

    /**
     * Reject an unconfirmed technology candidate.
     */
    @Transactional
    public void rejectCandidate(Long candidateId, User rejector) {
        TechnologyCandidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found: " + candidateId));

        candidate.setStatus("REJECTED");
        candidate.setVerifiedAt(Instant.now());
        candidate.setVerifiedBy(rejector);
        candidateRepository.save(candidate);
    }

    /**
     * List candidates by status.
     */
    @Transactional(readOnly = true)
    public List<TechnologyCandidateDto> getCandidates(String status) {
        List<TechnologyCandidate> list = status != null && !status.isBlank()
                ? candidateRepository.findByStatusOrderByOccurrenceCountDesc(status.toUpperCase())
                : candidateRepository.findAllByOrderByCreatedAtDesc();

        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private TechnologyCandidateDto mapToDto(TechnologyCandidate c) {
        return new TechnologyCandidateDto(
                c.getId(),
                c.getRawName(),
                c.getNormalizedName(),
                c.getSuggestedCategory(),
                c.getSuggestedSubcategory(),
                c.getSuggestedEcosystem(),
                c.getVersionInfo(),
                c.getAliases(),
                c.getSource(),
                c.getConfidence(),
                c.getStatus(),
                c.getOccurrenceCount(),
                c.getCreatedAt()
        );
    }

    private String normalizeTerm(String raw) {
        Matcher m = VERSION_PATTERN.matcher(raw);
        if (m.matches()) {
            return m.group(1).trim();
        }
        return raw;
    }

    private String extractVersion(String raw) {
        Matcher m = VERSION_PATTERN.matcher(raw);
        if (m.matches()) {
            return m.group(2).trim();
        }
        return null;
    }

    private String inferCategory(String term) {
        String lower = term.toLowerCase();
        if (lower.contains("db") || lower.contains("sql") || lower.contains("database") || lower.contains("redis") || lower.contains("store")) {
            return "Database Management";
        }
        if (lower.contains("cloud") || lower.contains("aws") || lower.contains("azure") || lower.contains("gcp") || lower.contains("serverless")) {
            return "Cloud Computing";
        }
        if (lower.contains("docker") || lower.contains("k8s") || lower.contains("ci/cd") || lower.contains("deploy") || lower.contains("ops")) {
            return "DevOps & Infrastructure";
        }
        if (lower.contains("ai") || lower.contains("ml") || lower.contains("gpt") || lower.contains("llm") || lower.contains("agent") || lower.contains("vision")) {
            return "Artificial Intelligence";
        }
        if (lower.contains("sec") || lower.contains("auth") || lower.contains("crypto") || lower.contains("identity")) {
            return "Cybersecurity";
        }
        if (lower.contains("js") || lower.contains("ui") || lower.contains("css") || lower.contains("front") || lower.contains("react")) {
            return "Frontend Development";
        }
        return "Software Engineering";
    }

    private String inferSubcategory(String category, String term) {
        String lower = term.toLowerCase();
        if (category.equals("Database Management")) {
            if (lower.contains("vector") || lower.contains("embed")) return "Vector Database";
            if (lower.contains("no") || lower.contains("mongo")) return "NoSQL Database";
            return "Relational Database";
        }
        if (category.equals("Artificial Intelligence")) {
            if (lower.contains("agent")) return "AI Agents";
            if (lower.contains("rag")) return "RAG Architecture";
            if (lower.contains("llm") || lower.contains("model")) return "Large Language Models";
            return "Machine Learning";
        }
        return "Framework";
    }

    private String inferEcosystem(String term) {
        String lower = term.toLowerCase();
        if (lower.contains("py") || lower.contains("torch") || lower.contains("pandas")) return "Python";
        if (lower.contains("js") || lower.contains("node") || lower.contains("react") || lower.contains("ts")) return "JavaScript";
        if (lower.contains("spring") || lower.contains("java") || lower.contains("jvm") || lower.contains("kotlin")) return "JVM";
        if (lower.contains("rust") || lower.contains("cargo")) return "Rust";
        if (lower.contains("go") || lower.contains("golang")) return "Go";
        return "General";
    }

    private String generateCandidateAliases(String term) {
        List<String> list = new ArrayList<>();
        if (term.contains(" ")) {
            list.add(term.replace(" ", ""));
            list.add(term.replace(" ", "-"));
            list.add(term.replace(" ", "_"));
        }
        return String.join(", ", list);
    }

    private double calculateInitialConfidence(String term, String source) {
        if (source != null && source.contains("OPPORTUNITY")) return 0.70;
        if (source != null && source.contains("VERIFIED")) return 0.85;
        return 0.50;
    }
}
