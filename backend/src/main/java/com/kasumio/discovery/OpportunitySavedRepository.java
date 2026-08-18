package com.kasumio.discovery;

import com.kasumio.student.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OpportunitySavedRepository extends JpaRepository<OpportunitySaved, Long> {
    Optional<OpportunitySaved> findByOpportunityIdAndStudentId(Long opportunityId, Long studentId);
    List<OpportunitySaved> findByStudentAndSaveStatusOrderByUpdatedAtDesc(Student student, String saveStatus);
    List<OpportunitySaved> findByStudentOrderByUpdatedAtDesc(Student student);
    boolean existsByOpportunityIdAndStudentId(Long opportunityId, Long studentId);
}
