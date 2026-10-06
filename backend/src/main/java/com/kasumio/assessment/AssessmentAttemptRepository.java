package com.kasumio.assessment;

import com.kasumio.student.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentAttemptRepository extends JpaRepository<AssessmentAttempt, Long> {
    List<AssessmentAttempt> findByStudentOrderByCreatedAtDesc(Student student);
    List<AssessmentAttempt> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    Optional<AssessmentAttempt> findFirstByAssessmentIdAndStudentIdOrderByCreatedAtDesc(Long assessmentId, Long studentId);
    List<AssessmentAttempt> findByAssessmentIdOrderByScoreDesc(Long assessmentId);

    @Query("SELECT a FROM AssessmentAttempt a WHERE a.assessment.opportunity.id = :opportunityId AND a.student.id = :studentId ORDER BY a.score DESC")
    List<AssessmentAttempt> findByOpportunityIdAndStudentId(@Param("opportunityId") Long opportunityId, @Param("studentId") Long studentId);

    @Query("SELECT a FROM AssessmentAttempt a WHERE a.status = 'COMPLETED' AND a.student.leaderboardPublic = true ORDER BY a.score DESC, a.completedAt ASC")
    List<AssessmentAttempt> findPublicCompletedAttempts();
}
