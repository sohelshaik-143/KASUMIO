package com.kasumio.discovery.dto;

import java.time.Instant;

public class TechnologyCandidateDto {
    private Long id;
    private String rawName;
    private String normalizedName;
    private String suggestedCategory;
    private String suggestedSubcategory;
    private String suggestedEcosystem;
    private String versionInfo;
    private String aliases;
    private String source;
    private double confidence;
    private String status;
    private int occurrenceCount;
    private Instant createdAt;

    public TechnologyCandidateDto() {}

    public TechnologyCandidateDto(Long id, String rawName, String normalizedName, String suggestedCategory,
                                  String suggestedSubcategory, String suggestedEcosystem, String versionInfo,
                                  String aliases, String source, double confidence, String status,
                                  int occurrenceCount, Instant createdAt) {
        this.id = id;
        this.rawName = rawName;
        this.normalizedName = normalizedName;
        this.suggestedCategory = suggestedCategory;
        this.suggestedSubcategory = suggestedSubcategory;
        this.suggestedEcosystem = suggestedEcosystem;
        this.versionInfo = versionInfo;
        this.aliases = aliases;
        this.source = source;
        this.confidence = confidence;
        this.status = status;
        this.occurrenceCount = occurrenceCount;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getRawName() { return rawName; }
    public String getNormalizedName() { return normalizedName; }
    public String getSuggestedCategory() { return suggestedCategory; }
    public String getSuggestedSubcategory() { return suggestedSubcategory; }
    public String getSuggestedEcosystem() { return suggestedEcosystem; }
    public String getVersionInfo() { return versionInfo; }
    public String getAliases() { return aliases; }
    public String getSource() { return source; }
    public double getConfidence() { return confidence; }
    public String getStatus() { return status; }
    public int getOccurrenceCount() { return occurrenceCount; }
    public Instant getCreatedAt() { return createdAt; }
}
