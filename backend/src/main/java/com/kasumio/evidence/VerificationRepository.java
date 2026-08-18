package com.kasumio.evidence;

import com.kasumio.organization.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationRepository extends JpaRepository<Verification, Long> {
    Optional<Verification> findByEvidenceId(Long evidenceId);
    boolean existsByEvidenceId(Long evidenceId);
    List<Verification> findByOrganization(Organization organization);
}
