package com.kasumio.goal;

import com.kasumio.common.SecurityUtils;
import com.kasumio.goal.dto.CareerGoalRequest;
import com.kasumio.goal.dto.CareerGoalResponse;
import com.kasumio.student.Student;
import com.kasumio.student.StudentRepository;
import com.kasumio.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CareerGoalService {

    private final CareerGoalRepository careerGoalRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public CareerGoalService(
            CareerGoalRepository careerGoalRepository,
            StudentRepository studentRepository,
            UserRepository userRepository) {
        this.careerGoalRepository = careerGoalRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<CareerGoalResponse> getMyCareerGoals() {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);
        return careerGoalRepository.findByStudentOrderByTitleAsc(student)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CareerGoalResponse createCareerGoal(CareerGoalRequest request) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);

        CareerGoal goal = new CareerGoal(
                student,
                request.getTitle().trim(),
                request.getDescription() != null ? request.getDescription().trim() : null,
                request.getTargetRole().trim()
        );

        goal = careerGoalRepository.save(goal);
        return mapToResponse(goal);
    }

    @Transactional
    public CareerGoalResponse updateCareerGoal(Long id, CareerGoalRequest request) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);

        CareerGoal goal = careerGoalRepository.findByIdAndStudent(id, student)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Career goal not found or access denied"));

        goal.setTitle(request.getTitle().trim());
        goal.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        goal.setTargetRole(request.getTargetRole().trim());

        goal = careerGoalRepository.save(goal);
        return mapToResponse(goal);
    }

    @Transactional
    public void deleteCareerGoal(Long id) {
        Student student = SecurityUtils.getCurrentStudent(studentRepository, userRepository);

        CareerGoal goal = careerGoalRepository.findByIdAndStudent(id, student)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Career goal not found or access denied"));

        careerGoalRepository.delete(goal);
    }

    private CareerGoalResponse mapToResponse(CareerGoal goal) {
        return new CareerGoalResponse(
                goal.getId(),
                goal.getStudent().getId(),
                goal.getTitle(),
                goal.getDescription(),
                goal.getTargetRole()
        );
    }
}
