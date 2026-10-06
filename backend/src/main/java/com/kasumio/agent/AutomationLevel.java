package com.kasumio.agent;

public enum AutomationLevel {
    COPILOT,          // Level 1: AI recommends, recruiter conducts operations manually
    DELEGATED,        // Level 2: AI drafts and discovers, recruiter approves with one click, AI executes
    POLICY_BOUNDED    // Level 3: AI executes autonomously within explicit organizational boundaries
}
