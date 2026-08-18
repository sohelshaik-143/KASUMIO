package com.kasumio.opportunity;

import com.kasumio.student.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OpportunityInterestRepository extends JpaRepository<OpportunityInterest, Long> {
    Optional<OpportunityInterest> findByOpportunityIdAndStudentId(Long opportunityId, Long studentId);
    Optional<OpportunityInterest> findByOpportunityAndStudent(Opportunity opportunity, Student student);
    List<OpportunityInterest> findByOpportunityId(Long opportunityId);
    List<OpportunityInterest> findByStudentOrderByCreatedAtDesc(Student student);
    boolean existsByOpportunityIdAndStudentIdAndStatus(Long opportunityId, Long studentId, InterestStatus status);
}
