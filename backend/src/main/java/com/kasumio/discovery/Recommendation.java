package com.kasumio.discovery;

import com.kasumio.opportunity.EvidenceRoi;
import com.kasumio.opportunity.Opportunity;
import com.kasumio.opportunity.ReadinessState;
import com.kasumio.student.Student;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
    name = "recommendations",
    uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "opportunity_id"})
)
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id", nullable = false)
    private Opportunity opportunity;

    @Enumerated(EnumType.STRING)
    @Column(name = "readiness_state", nullable = false, length = 50)
    private ReadinessState readinessState;

    @Enumerated(EnumType.STRING)
    @Column(name = "evidence_roi", length = 50)
    private EvidenceRoi evidenceRoi;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Recommendation() {}

    public Recommendation(Student student, Opportunity opportunity, ReadinessState readinessState, EvidenceRoi evidenceRoi) {
        this.student = student;
        this.opportunity = opportunity;
        this.readinessState = readinessState;
        this.evidenceRoi = evidenceRoi;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public Opportunity getOpportunity() {
        return opportunity;
    }

    public void setOpportunity(Opportunity opportunity) {
        this.opportunity = opportunity;
    }

    public ReadinessState getReadinessState() {
        return readinessState;
    }

    public void setReadinessState(ReadinessState readinessState) {
        this.readinessState = readinessState;
    }

    public EvidenceRoi getEvidenceRoi() {
        return evidenceRoi;
    }

    public void setEvidenceRoi(EvidenceRoi evidenceRoi) {
        this.evidenceRoi = evidenceRoi;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
