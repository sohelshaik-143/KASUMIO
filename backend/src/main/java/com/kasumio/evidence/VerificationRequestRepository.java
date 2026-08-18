package com.kasumio.evidence;

import com.kasumio.student.Student;
import com.kasumio.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationRequestRepository extends JpaRepository<VerificationRequest, Long> {

    List<VerificationRequest> findByRecruiterOrderByRequestedAtDesc(User recruiter);

    List<VerificationRequest> findByStudentOrderByRequestedAtDesc(Student student);

    Optional<VerificationRequest> findByOpportunityIdAndEvidenceIdAndRecruiterId(Long opportunityId, Long evidenceId, Long recruiterId);

    List<VerificationRequest> findByOpportunityIdAndStudentId(Long opportunityId, Long studentId);

    List<VerificationRequest> findByEvidenceId(Long evidenceId);

    @Query("SELECT vr FROM VerificationRequest vr JOIN FETCH vr.opportunity o JOIN FETCH vr.evidence e JOIN FETCH e.skill s JOIN FETCH vr.student st WHERE vr.recruiter = :recruiter")
    List<VerificationRequest> findQueueByRecruiterWithDetails(@Param("recruiter") User recruiter);
}
