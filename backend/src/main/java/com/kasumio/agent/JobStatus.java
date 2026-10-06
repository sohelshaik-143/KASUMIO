package com.kasumio.agent;

public enum JobStatus {
    ANALYZING,          // Parsing intent, extracting taxonomy, discovering candidates
    READY_FOR_REVIEW,   // Intent understood, candidates scored, ready for recruiter approval
    APPROVED,           // Recruiter approved candidate shortlist and outreach
    EXECUTING,          // Executing publishing, connections, and message dispatches
    COMPLETED,          // Workflow successfully executed
    FAILED,             // Workflow halted due to critical error
    CANCELLED           // Dismissed by recruiter
}
