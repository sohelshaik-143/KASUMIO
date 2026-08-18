package com.kasumio.discovery;

import com.kasumio.opportunity.Opportunity;
import com.kasumio.student.Student;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "opportunity_saved",
       uniqueConstraints = @UniqueConstraint(columnNames = {"opportunity_id", "student_id"}))
public class OpportunitySaved {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "opportunity_id", nullable = false)
    private Opportunity opportunity;

    @Column(name = "save_status", nullable = false, length = 50)
    private String saveStatus = "SAVED"; // SAVED, APPLIED, REJECTED, ARCHIVED

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public OpportunitySaved() {}

    public OpportunitySaved(Student student, Opportunity opportunity, String saveStatus) {
        this.student = student;
        this.opportunity = opportunity;
        this.saveStatus = saveStatus;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public Opportunity getOpportunity() { return opportunity; }
    public void setOpportunity(Opportunity opportunity) { this.opportunity = opportunity; }
    public String getSaveStatus() { return saveStatus; }
    public void setSaveStatus(String saveStatus) { this.saveStatus = saveStatus; this.updatedAt = Instant.now(); }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
