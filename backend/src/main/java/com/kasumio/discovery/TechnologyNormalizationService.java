package com.kasumio.discovery;

import com.kasumio.skill.Skill;
import com.kasumio.skill.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Technology Normalization Service
 * 
 * Resolves aliases → canonical skills.
 * Handles version-aware matching (Java 17 → Java).
 * Detects unknown technology candidates.
 * Supports dynamic technology addition without code changes.
 */
@Service
public class TechnologyNormalizationService {

    private final SkillRepository skillRepository;
    private final SkillAliasRepository aliasRepository;

    // Pattern to extract version info: "Java 17", "Python 3.12", "React 18"
    private static final Pattern VERSION_PATTERN = Pattern.compile("^(.+?)\\s+(\\d+(?:\\.\\d+)*)$");

    public TechnologyNormalizationService(SkillRepository skillRepository, SkillAliasRepository aliasRepository) {
        this.skillRepository = skillRepository;
        this.aliasRepository = aliasRepository;
    }

    /**
     * Resolve a technology name to its canonical Skill entity.
     * Checks: exact name match → alias match → version-stripped match.
     */
    @Transactional(readOnly = true)
    public Optional<Skill> resolve(String technologyName) {
        if (technologyName == null || technologyName.isBlank()) {
            return Optional.empty();
        }

        String trimmed = technologyName.trim();

        // 1. Direct name match (case-insensitive)
        Optional<Skill> direct = skillRepository.findByNameIgnoreCase(trimmed);
        if (direct.isPresent()) {
            return direct;
        }

        // 2. Alias match
        Optional<SkillAlias> alias = aliasRepository.findByAliasNameIgnoreCase(trimmed);
        if (alias.isPresent()) {
            return Optional.of(alias.get().getSkill());
        }

        // 3. Version-stripped match: "Java 17" → "Java"
        Matcher versionMatcher = VERSION_PATTERN.matcher(trimmed);
        if (versionMatcher.matches()) {
            String baseName = versionMatcher.group(1).trim();
            Optional<Skill> versionStripped = skillRepository.findByNameIgnoreCase(baseName);
            if (versionStripped.isPresent()) {
                return versionStripped;
            }
            // Also try alias for the base name
            Optional<SkillAlias> versionAlias = aliasRepository.findByAliasNameIgnoreCase(baseName);
            if (versionAlias.isPresent()) {
                return Optional.of(versionAlias.get().getSkill());
            }
        }

        return Optional.empty();
    }

    /**
     * Resolve multiple technology names, returning found skills
     * and tracking unresolved names separately.
     */
    @Transactional(readOnly = true)
    public NormalizationResult resolveAll(List<String> technologyNames) {
        List<Skill> resolved = new ArrayList<>();
        List<String> unresolved = new ArrayList<>();

        Set<Long> seenSkillIds = new HashSet<>();

        for (String name : technologyNames) {
            Optional<Skill> skill = resolve(name);
            if (skill.isPresent()) {
                if (!seenSkillIds.contains(skill.get().getId())) {
                    resolved.add(skill.get());
                    seenSkillIds.add(skill.get().getId());
                }
                // Alias/duplicate — skip silently (do not double-count)
            } else {
                unresolved.add(name);
            }
        }

        return new NormalizationResult(resolved, unresolved);
    }

    /**
     * Extract technology names from free text description.
     * Uses all known skill names and aliases for matching.
     */
    @Transactional(readOnly = true)
    public List<Skill> extractFromText(String text) {
        if (text == null || text.isBlank()) {
            return Collections.emptyList();
        }

        String lowerText = text.toLowerCase();
        Set<Long> matchedSkillIds = new LinkedHashSet<>();
        List<Skill> allSkills = skillRepository.findAll();
        List<SkillAlias> allAliases = aliasRepository.findAll();

        // Sort by name length descending to match longer names first (e.g., "Spring Boot" before "Spring")
        allSkills.sort((a, b) -> b.getName().length() - a.getName().length());

        for (Skill skill : allSkills) {
            if (containsTechnology(lowerText, skill.getName().toLowerCase())) {
                matchedSkillIds.add(skill.getId());
            }
        }

        for (SkillAlias alias : allAliases) {
            if (containsTechnology(lowerText, alias.getAliasName().toLowerCase())) {
                matchedSkillIds.add(alias.getSkill().getId());
            }
        }

        // Fetch resolved skills in order
        return allSkills.stream()
                .filter(s -> matchedSkillIds.contains(s.getId()))
                .collect(Collectors.toList());
    }

    /**
     * Check if text contains the technology name as a word boundary match.
     */
    private boolean containsTechnology(String text, String techName) {
        // Use word boundary matching to avoid false positives (e.g., "React" in "Reactive")
        String escaped = Pattern.quote(techName);
        Pattern pattern = Pattern.compile("(?i)(?<![\\w])(" + escaped + ")(?![\\w])", Pattern.CASE_INSENSITIVE);
        return pattern.matcher(text).find();
    }

    /**
     * Extract version information from a technology name.
     */
    public Optional<String> extractVersion(String technologyName) {
        if (technologyName == null) return Optional.empty();
        Matcher m = VERSION_PATTERN.matcher(technologyName.trim());
        if (m.matches()) {
            return Optional.of(m.group(2));
        }
        return Optional.empty();
    }

    /**
     * Dynamically registers a newly discovered technology or framework into the catalog.
     * Guarantees KASUMO is aware of any emerging technologies created in the future.
     */
    @Transactional
    public Skill registerDynamicSkillIfAbsent(String name, String category, String subcategory, String ecosystem) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Technology name cannot be blank");
        }
        String trimmed = name.trim();
        Optional<Skill> existing = resolve(trimmed);
        if (existing.isPresent()) {
            return existing.get();
        }

        Skill newSkill = new Skill();
        newSkill.setName(trimmed);
        newSkill.setCategory(category != null && !category.isBlank() ? category : "Emerging Technology");
        newSkill.setSubcategory(subcategory != null && !subcategory.isBlank() ? subcategory : "General");
        newSkill.setEcosystem(ecosystem != null && !ecosystem.isBlank() ? ecosystem : "Open Ecosystem");
        newSkill.setCanonicalName(trimmed);
        newSkill.setTechnologyStatus("ACTIVE");

        return skillRepository.save(newSkill);
    }

    /**
     * Result container for batch normalization.
     */
    public static class NormalizationResult {
        private final List<Skill> resolved;
        private final List<String> unresolved;

        public NormalizationResult(List<Skill> resolved, List<String> unresolved) {
            this.resolved = resolved;
            this.unresolved = unresolved;
        }

        public List<Skill> getResolved() { return resolved; }
        public List<String> getUnresolved() { return unresolved; }
    }
}
