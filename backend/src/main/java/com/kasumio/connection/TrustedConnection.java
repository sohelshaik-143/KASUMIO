package com.kasumio.connection;

import com.kasumio.opportunity.Opportunity;
import com.kasumio.student.Student;
import com.kasumio.user.User;
import jakarta.persistence.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Entity
@Table(
    name = "trusted_connections",
    uniqueConstraints = @UniqueConstraint(columnNames = {"opportunity_id", "student_id"})
)
public class TrustedConnection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id", nullable = false)
    private Opportunity opportunity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private User recruiter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ConnectionStatus status = ConnectionStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "responded_at")
    private Instant respondedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "recruiter_note", columnDefinition = "TEXT")
    private String recruiterNote;

    @Column(name = "share_full_name", nullable = false)
    private boolean shareFullName = false;

    @Column(name = "share_email", nullable = false)
    private boolean shareEmail = false;

    @Column(name = "share_bio", nullable = false)
    private boolean shareBio = false;

    @Column(name = "share_university", nullable = false)
    private boolean shareUniversity = false;

    @Column(name = "share_graduation_year", nullable = false)
    private boolean shareGraduationYear = false;

    @Column(name = "custom_message", columnDefinition = "TEXT")
    private String customMessage;

    public TrustedConnection() {}

    public TrustedConnection(Opportunity opportunity, Student student, User recruiter, String recruiterNote) {
        this.opportunity = opportunity;
        this.student = student;
        this.recruiter = recruiter;
        this.recruiterNote = recruiterNote;
        this.status = ConnectionStatus.PENDING;
        this.createdAt = Instant.now();
        this.expiresAt = Instant.now().plus(14, ChronoUnit.DAYS);
    }

    public boolean isExpired() {
        return status == ConnectionStatus.PENDING && expiresAt != null && Instant.now().isAfter(expiresAt);
    }

    public ConnectionStatus getEffectiveStatus() {
        if (status == ConnectionStatus.PENDING && isExpired()) {
            return ConnectionStatus.EXPIRED;
        }
        return status;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Opportunity getOpportunity() {
        return opportunity;
    }

    public void setOpportunity(Opportunity opportunity) {
        this.opportunity = opportunity;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public User getRecruiter() {
        return recruiter;
    }

    public void setRecruiter(User recruiter) {
        this.recruiter = recruiter;
    }

    public ConnectionStatus getStatus() {
        return status;
    }

    public void setStatus(ConnectionStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getRespondedAt() {
        return respondedAt;
    }

    public void setRespondedAt(Instant respondedAt) {
        this.respondedAt = respondedAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public String getRecruiterNote() {
        return recruiterNote;
    }

    public void setRecruiterNote(String recruiterNote) {
        this.recruiterNote = recruiterNote;
    }

    public boolean isShareFullName() {
        return shareFullName;
    }

    public void setShareFullName(boolean shareFullName) {
        this.shareFullName = shareFullName;
    }

    public boolean isShareEmail() {
        return shareEmail;
    }

    public void setShareEmail(boolean shareEmail) {
        this.shareEmail = shareEmail;
    }

    public boolean isShareBio() {
        return shareBio;
    }

    public void setShareBio(boolean shareBio) {
        this.shareBio = shareBio;
    }

    public boolean isShareUniversity() {
        return shareUniversity;
    }

    public void setShareUniversity(boolean shareUniversity) {
        this.shareUniversity = shareUniversity;
    }

    public boolean isShareGraduationYear() {
        return shareGraduationYear;
    }

    public void setShareGraduationYear(boolean shareGraduationYear) {
        this.shareGraduationYear = shareGraduationYear;
    }

    public String getCustomMessage() {
        return customMessage;
    }

    public void setCustomMessage(String customMessage) {
        this.customMessage = customMessage;
    }
}
