package com.kasumio.discovery;

import com.kasumio.opportunity.Opportunity;
import com.kasumio.student.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecommendationFeedbackRepository extends JpaRepository<RecommendationFeedback, Long> {
    List<RecommendationFeedback> findByStudent(Student student);
    List<RecommendationFeedback> findByOpportunity(Opportunity opportunity);
    List<RecommendationFeedback> findByFeedbackType(String feedbackType);

    @Query("SELECT rf.feedbackType, COUNT(rf) FROM RecommendationFeedback rf GROUP BY rf.feedbackType")
    List<Object[]> countByFeedbackTypeGrouped();

    @Query("SELECT COUNT(rf) FROM RecommendationFeedback rf WHERE rf.opportunity.id = :opportunityId AND rf.feedbackType IN ('WRONG_REQUIREMENT', 'WRONG_TECHNOLOGY')")
    long countTechnologyMismatchReports(Long opportunityId);
}
