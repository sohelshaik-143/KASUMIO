package com.kasumio.opportunity;

import com.kasumio.student.Student;
import jakarta.persistence.*;

@Entity
@Table(name = "candidate_aliases")
public class CandidateAlias {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    private Student student;

    @Column(name = "public_alias", nullable = false, unique = true, length = 20)
    private String publicAlias;

    public CandidateAlias() {}

    public CandidateAlias(Student student, String publicAlias) {
        this.student = student;
        this.publicAlias = publicAlias;
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

    public String getPublicAlias() {
        return publicAlias;
    }

    public void setPublicAlias(String publicAlias) {
        this.publicAlias = publicAlias;
    }
}
