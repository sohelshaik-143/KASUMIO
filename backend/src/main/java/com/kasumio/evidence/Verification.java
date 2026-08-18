package com.kasumio.evidence;

import com.kasumio.organization.Organization;
import com.kasumio.user.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "verifications")
public class Verification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evidence_id", nullable = false, unique = true)
    private Evidence evidence;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by_user_id", nullable = false)
    private User verifiedByUser;

    @Column(name = "verified_at", nullable = false, updatable = false)
    private Instant verifiedAt = Instant.now();

    public Verification() {}

    public Verification(Evidence evidence, Organization organization, User verifiedByUser) {
        this.evidence = evidence;
        this.organization = organization;
        this.verifiedByUser = verifiedByUser;
        this.verifiedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Evidence getEvidence() {
        return evidence;
    }

    public void setEvidence(Evidence evidence) {
        this.evidence = evidence;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public User getVerifiedByUser() {
        return verifiedByUser;
    }

    public void setVerifiedByUser(User verifiedByUser) {
        this.verifiedByUser = verifiedByUser;
    }

    public Instant getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(Instant verifiedAt) {
        this.verifiedAt = verifiedAt;
    }
}
