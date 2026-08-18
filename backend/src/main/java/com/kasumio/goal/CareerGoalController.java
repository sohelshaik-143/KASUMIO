package com.kasumio.goal;

import com.kasumio.goal.dto.CareerGoalRequest;
import com.kasumio.goal.dto.CareerGoalResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/career-goals")
@Tag(name = "Career Goals", description = "Student career goals and target role definition")
public class CareerGoalController {

    private final CareerGoalService careerGoalService;

    public CareerGoalController(CareerGoalService careerGoalService) {
        this.careerGoalService = careerGoalService;
    }

    @GetMapping
    @Operation(summary = "List career goals for authenticated student")
    public ResponseEntity<List<CareerGoalResponse>> getMyCareerGoals() {
        return ResponseEntity.ok(careerGoalService.getMyCareerGoals());
    }

    @PostMapping
    @Operation(summary = "Create a new career goal for authenticated student")
    public ResponseEntity<CareerGoalResponse> createCareerGoal(@Valid @RequestBody CareerGoalRequest request) {
        return new ResponseEntity<>(careerGoalService.createCareerGoal(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update career goal by ID (Student owner only)")
    public ResponseEntity<CareerGoalResponse> updateCareerGoal(@PathVariable Long id, @Valid @RequestBody CareerGoalRequest request) {
        return ResponseEntity.ok(careerGoalService.updateCareerGoal(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete career goal by ID (Student owner only)")
    public ResponseEntity<Void> deleteCareerGoal(@PathVariable Long id) {
        careerGoalService.deleteCareerGoal(id);
        return ResponseEntity.noContent().build();
    }
}
