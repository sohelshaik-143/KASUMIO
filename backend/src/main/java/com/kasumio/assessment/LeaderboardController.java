package com.kasumio.assessment;

import com.kasumio.assessment.dto.LeaderboardEntryDto;
import com.kasumio.common.SecurityUtils;
import com.kasumio.student.Student;
import com.kasumio.student.StudentRepository;
import com.kasumio.user.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaderboard")
@Tag(name = "Demonstrated Capability Leaderboard", description = "Privacy-preserving capability leaderboard based strictly on verified candidate assessment data")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public LeaderboardController(LeaderboardService leaderboardService,
                                 StudentRepository studentRepository,
                                 UserRepository userRepository) {
        this.leaderboardService = leaderboardService;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    @Operation(summary = "Get capability leaderboard ranked by problems solved, score, and verified skills")
    public ResponseEntity<List<LeaderboardEntryDto>> getLeaderboard(
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String university) {
        return ResponseEntity.ok(leaderboardService.getLeaderboard(skill, university));
    }

    @GetMapping("/privacy")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Candidate retrieves their public leaderboard visibility preference")
    public ResponseEntity<Map<String, Boolean>> getPrivacy() {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        boolean isPublic = leaderboardService.getPrivacyStatus(student);
        return ResponseEntity.ok(Map.of("isPublic", isPublic));
    }

    @PutMapping("/privacy")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Candidate toggles their public leaderboard visibility preference")
    public ResponseEntity<Map<String, Boolean>> updatePrivacy(@RequestBody Map<String, Boolean> body) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        boolean isPublic = body.getOrDefault("isPublic", true);
        boolean updated = leaderboardService.updatePrivacy(student, isPublic);
        return ResponseEntity.ok(Map.of("isPublic", updated));
    }
}
