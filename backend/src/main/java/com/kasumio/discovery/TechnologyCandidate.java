package com.kasumio.discovery;

import com.kasumio.user.User;
import jakarta.persistence.*;
import java.time.Instant;

/**
 * Technology Candidate Entity
 * 
 * Supports dynamic unknown technology discovery and the 14-step verification lifecycle.
 * Statuses: DISCOVERED, UNVERIFIED, VERIFIED, REJECTED.
 */
@Entity
@Table(name = "technology_candidates")
public class TechnologyCandidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "raw_name", nullable = false, unique = true, length = 100)
    private String rawName;

    @Column(name = "normalized_name", nullable = false, length = 100)
    private String normalizedName;

    @Column(name = "suggested_category", length = 100)
    private String suggestedCategory;

    @Column(name = "suggested_subcategory", length = 100)
    private String suggestedSubcategory;

    @Column(name = "suggested_ecosystem", length = 100)
    private String suggestedEcosystem;

    @Column(name = "version_info", length = 50)
    private String versionInfo;

    @Column(columnDefinition = "TEXT")
    private String aliases;

    @Column(nullable = false, length = 255)
    private String source;

    @Column(nullable = false)
    private double confidence = 0.5;

    @Column(nullable = false, length = 50)
    private String status = "DISCOVERED"; // DISCOVERED, UNVERIFIED, VERIFIED, REJECTED

    @Column(name = "occurrence_count", nullable = false)
    private int occurrenceCount = 1;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by_user_id")
    private User verifiedBy;

    public TechnologyCandidate() {}

    public TechnologyCandidate(String rawName, String normalizedName, String suggestedCategory,
                               String suggestedSubcategory, String suggestedEcosystem,
                               String versionInfo, String aliases, String source, double confidence) {
        this.rawName = rawName;
        this.normalizedName = normalizedName;
        this.suggestedCategory = suggestedCategory;
        this.suggestedSubcategory = suggestedSubcategory;
        this.suggestedEcosystem = suggestedEcosystem;
        this.versionInfo = versionInfo;
        this.aliases = aliases;
        this.source = source;
        this.confidence = confidence;
        this.status = "DISCOVERED";
        this.occurrenceCount = 1;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRawName() { return rawName; }
    public void setRawName(String rawName) { this.rawName = rawName; }

    public String getNormalizedName() { return normalizedName; }
    public void setNormalizedName(String normalizedName) { this.normalizedName = normalizedName; }

    public String getSuggestedCategory() { return suggestedCategory; }
    public void setSuggestedCategory(String suggestedCategory) { this.suggestedCategory = suggestedCategory; }

    public String getSuggestedSubcategory() { return suggestedSubcategory; }
    public void setSuggestedSubcategory(String suggestedSubcategory) { this.suggestedSubcategory = suggestedSubcategory; }

    public String getSuggestedEcosystem() { return suggestedEcosystem; }
    public void setSuggestedEcosystem(String suggestedEcosystem) { this.suggestedEcosystem = suggestedEcosystem; }

    public String getVersionInfo() { return versionInfo; }
    public void setVersionInfo(String versionInfo) { this.versionInfo = versionInfo; }

    public String getAliases() { return aliases; }
    public void setAliases(String aliases) { this.aliases = aliases; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public double getConfidence() { return confidence; }
    public void setConfidence(double confidence) { this.confidence = confidence; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getOccurrenceCount() { return occurrenceCount; }
    public void setOccurrenceCount(int occurrenceCount) { this.occurrenceCount = occurrenceCount; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(Instant verifiedAt) { this.verifiedAt = verifiedAt; }

    public User getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(User verifiedBy) { this.verifiedBy = verifiedBy; }

    public void incrementOccurrence() {
        this.occurrenceCount++;
    }
}
