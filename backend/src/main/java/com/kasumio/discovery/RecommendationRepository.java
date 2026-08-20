package com.kasumio.discovery;

import com.kasumio.opportunity.Opportunity;
import com.kasumio.student.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    Optional<Recommendation> findByStudentAndOpportunity(Student student, Opportunity opportunity);
    Optional<Recommendation> findByStudentIdAndOpportunityId(Long studentId, Long opportunityId);
    List<Recommendation> findByStudent(Student student);
}
