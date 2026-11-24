package com.kasumio.evidence;

import com.kasumio.organization.Organization;
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

    @Query("SELECT vr FROM VerificationRequest vr JOIN FETCH vr.opportunity o JOIN FETCH vr.evidence e JOIN FETCH e.skill s JOIN FETCH vr.student st WHERE vr.recruiter.organization = :org")
    List<VerificationRequest> findQueueByOrganizationWithDetails(@Param("org") Organization org);

    @Query("SELECT COUNT(vr) > 0 FROM VerificationRequest vr WHERE vr.evidence.id = :evidenceId AND vr.recruiter.organization.id = :orgId")
    boolean existsByEvidenceIdAndOrganizationId(@Param("evidenceId") Long evidenceId, @Param("orgId") Long orgId);

    @Query("SELECT DISTINCT vr.evidence FROM VerificationRequest vr WHERE vr.recruiter.organization = :org AND vr.status = com.kasumio.evidence.VerificationStatus.REQUESTED AND NOT EXISTS (SELECT v FROM Verification v WHERE v.evidence = vr.evidence)")
    List<Evidence> findPendingEvidenceByOrganization(@Param("org") Organization org);
}
