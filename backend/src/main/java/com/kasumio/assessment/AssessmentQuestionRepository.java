package com.kasumio.assessment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentQuestionRepository extends JpaRepository<AssessmentQuestion, Long> {
    List<AssessmentQuestion> findByAssessmentOrderByOrderIndexAsc(Assessment assessment);
    List<AssessmentQuestion> findByAssessmentIdOrderByOrderIndexAsc(Long assessmentId);
    List<AssessmentQuestion> findByAssessmentIdAndDifficulty(Long assessmentId, DifficultyLevel difficulty);
}
