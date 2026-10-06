package com.kasumio.agent;

import com.kasumio.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecruiterAuditLogRepository extends JpaRepository<RecruiterAuditLog, Long> {
    List<RecruiterAuditLog> findByRecruiterOrderByCreatedAtDesc(User recruiter);
    List<RecruiterAuditLog> findByJobIdOrderByCreatedAtDesc(String jobId);
}
