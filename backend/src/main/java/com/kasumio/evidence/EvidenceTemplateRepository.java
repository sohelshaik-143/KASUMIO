package com.kasumio.evidence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EvidenceTemplateRepository extends JpaRepository<EvidenceTemplate, Long> {
}
