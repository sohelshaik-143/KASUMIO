package com.kasumio.opportunity;

import com.kasumio.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OpportunityRepository extends JpaRepository<Opportunity, Long> {
    List<Opportunity> findByRecruiterOrderByCreatedAtDesc(User recruiter);
    Optional<Opportunity> findByIdAndRecruiter(Long id, User recruiter);
    List<Opportunity> findByStatusOrderByCreatedAtDesc(OpportunityStatus status);

    @Query("SELECT DISTINCT o FROM Opportunity o LEFT JOIN FETCH o.skills os LEFT JOIN FETCH os.skill WHERE o.status = :status ORDER BY o.createdAt DESC")
    List<Opportunity> findPublishedWithSkills(@Param("status") OpportunityStatus status);
}
