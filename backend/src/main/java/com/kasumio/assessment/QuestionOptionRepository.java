package com.kasumio.assessment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionOptionRepository extends JpaRepository<QuestionOption, Long> {
    List<QuestionOption> findByQuestionOrderByOrderIndexAsc(AssessmentQuestion question);
    List<QuestionOption> findByQuestionIdOrderByOrderIndexAsc(Long questionId);
}
