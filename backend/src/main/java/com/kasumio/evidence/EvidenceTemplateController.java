package com.kasumio.evidence;

import com.kasumio.evidence.dto.EvidenceTemplateResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/evidence-templates")
@Tag(name = "Evidence Templates", description = "Standardized templates to help students structure credible evidence submissions")
public class EvidenceTemplateController {

    private final EvidenceTemplateRepository templateRepository;

    public EvidenceTemplateController(EvidenceTemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    @GetMapping
    @Operation(summary = "List all structured evidence templates")
    public ResponseEntity<List<EvidenceTemplateResponse>> getAllTemplates() {
        List<EvidenceTemplateResponse> templates = templateRepository.findAll()
                .stream()
                .map(t -> new EvidenceTemplateResponse(
                        t.getId(),
                        t.getTitle(),
                        t.getDescription(),
                        t.getEvidenceType(),
                        t.getSuggestedFields()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(templates);
    }
}
