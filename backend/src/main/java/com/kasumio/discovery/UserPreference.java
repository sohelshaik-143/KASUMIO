package com.kasumio.discovery;

import com.kasumio.student.Student;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
    name = "user_preferences",
    uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "preference_key", "preference_value"})
)
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "preference_key", nullable = false, length = 100)
    private String preferenceKey; // AVOID_ROLE, AVOID_TECH, PREFER_ROLE, PREFER_TECH

    @Column(name = "preference_value", nullable = false)
    private String preferenceValue;

    @Column(nullable = false)
    private double weight = 1.0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public UserPreference() {}

    public UserPreference(Student student, String preferenceKey, String preferenceValue, double weight) {
        this.student = student;
        this.preferenceKey = preferenceKey;
        this.preferenceValue = preferenceValue;
        this.weight = weight;
        this.createdAt = Instant.now();
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

    public String getPreferenceKey() {
        return preferenceKey;
    }

    public void setPreferenceKey(String preferenceKey) {
        this.preferenceKey = preferenceKey;
    }

    public String getPreferenceValue() {
        return preferenceValue;
    }

    public void setPreferenceValue(String preferenceValue) {
        this.preferenceValue = preferenceValue;
    }

    public double getWeight() {
        return weight;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
