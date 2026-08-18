package com.kasumio.evidence;

import com.kasumio.student.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EvidenceRepository extends JpaRepository<Evidence, Long> {
    List<Evidence> findByStudentOrderByCreatedAtDesc(Student student);
    List<Evidence> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    Optional<Evidence> findByIdAndStudent(Long id, Student student);
    long countByStudent(Student student);

    @Query("SELECT COUNT(v) FROM Verification v WHERE v.evidence.student = :student")
    long countVerifiedByStudent(@Param("student") Student student);

    @Query("SELECT e FROM Evidence e LEFT JOIN Verification v ON v.evidence.id = e.id WHERE v.id IS NULL ORDER BY e.createdAt DESC")
    List<Evidence> findUnverifiedEvidence();
}
