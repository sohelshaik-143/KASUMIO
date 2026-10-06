package com.kasumio.agent;

import com.kasumio.agent.dto.ParsedIntentDto;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Personalized Outreach Drafter
 * 
 * Generates truthful, respectful, non-manipulative connection messages for candidates
 * based strictly on their actual demonstrable evidence and the recruiter's opportunity context.
 */
@Service
public class PersonalizedOutreachDrafter {

    public String draftMessage(ParsedIntentDto intent, List<String> observedProjects,
                               List<String> verifiedEvidence, List<String> matchedSkills, String companyName) {
        StringBuilder sb = new StringBuilder();
        String org = (companyName != null && !companyName.isBlank()) ? companyName : "Our engineering team";

        sb.append("Hi there! ").append(org).append(" reviewed your demonstrable portfolio on KASUMIO and noticed your ");

        if (!verifiedEvidence.isEmpty()) {
            sb.append("verified achievements in ").append(formatList(verifiedEvidence)).append(". ");
        } else if (!observedProjects.isEmpty()) {
            sb.append("projects involving ").append(formatList(matchedSkills)).append(". ");
        } else if (!matchedSkills.isEmpty()) {
            sb.append("demonstrated skills in ").append(formatList(matchedSkills)).append(". ");
        } else {
            sb.append("background and project contributions. ");
        }

        sb.append("We have an open ").append(intent.getRoleTitle())
          .append(" (").append(intent.getWorkType().name().toLowerCase())
          .append(") opportunity that strongly aligns with your demonstrated capabilities.\n\n");

        sb.append("We would value the chance to connect with you and discuss next steps. Feel free to review this opportunity and accept if you are interested!");

        return sb.toString();
    }

    private String formatList(List<String> items) {
        if (items == null || items.isEmpty()) return "";
        if (items.size() == 1) return items.get(0);
        if (items.size() == 2) return items.get(0) + " and " + items.get(1);
        return String.join(", ", items.subList(0, items.size() - 1)) + " and " + items.get(items.size() - 1);
    }
}
