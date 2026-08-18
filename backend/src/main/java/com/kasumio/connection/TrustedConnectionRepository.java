package com.kasumio.connection;

import com.kasumio.opportunity.Opportunity;
import com.kasumio.student.Student;
import com.kasumio.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrustedConnectionRepository extends JpaRepository<TrustedConnection, Long> {

    Optional<TrustedConnection> findByOpportunityAndStudent(Opportunity opportunity, Student student);

    Optional<TrustedConnection> findByOpportunityIdAndStudentId(Long opportunityId, Long studentId);

    @Query("SELECT tc FROM TrustedConnection tc JOIN FETCH tc.opportunity o LEFT JOIN FETCH o.recruiter r LEFT JOIN FETCH r.organization WHERE tc.student = :student ORDER BY tc.createdAt DESC")
    List<TrustedConnection> findByStudentWithDetails(@Param("student") Student student);

    @Query("SELECT tc FROM TrustedConnection tc JOIN FETCH tc.opportunity o JOIN FETCH tc.student s WHERE tc.recruiter = :recruiter ORDER BY tc.createdAt DESC")
    List<TrustedConnection> findByRecruiterWithDetails(@Param("recruiter") User recruiter);

    List<TrustedConnection> findByOpportunityOrderByCreatedAtDesc(Opportunity opportunity);

    long countByStudentAndStatus(Student student, ConnectionStatus status);

    long countByRecruiterAndStatus(User recruiter, ConnectionStatus status);
}
