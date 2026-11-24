package com.kasumio.common;

import com.kasumio.auth.AuthService;
import com.kasumio.auth.dto.UpdateProfileRequest;
import com.kasumio.auth.dto.UserDto;
import com.kasumio.student.Student;
import com.kasumio.student.StudentRepository;
import com.kasumio.user.User;
import com.kasumio.user.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller for authenticated user profile updates and secure profile photo uploads.
 */
@RestController
@RequestMapping("/api/me")
@Tag(name = "User Profile & Photo", description = "Endpoints for user profile editing and avatar photo management")
public class FileUploadController {

    private static final Logger log = LoggerFactory.getLogger(FileUploadController.class);
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final Path UPLOAD_DIR = Paths.get("uploads", "avatars").toAbsolutePath().normalize();

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final AuthService authService;

    public FileUploadController(UserRepository userRepository,
                                StudentRepository studentRepository,
                                AuthService authService) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.authService = authService;
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(UPLOAD_DIR);
            log.info("Initialized avatar storage directory at: {}", UPLOAD_DIR);
        } catch (IOException e) {
            log.error("Could not create avatar storage directory", e);
        }
    }

    @PutMapping("/profile")
    @Operation(summary = "Update authenticated user's profile details")
    public ResponseEntity<UserDto> updateProfile(@RequestBody UpdateProfileRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        UserDto updated = authService.updateUserProfile(email, request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload profile photo for current user (JPG, PNG, WebP up to 5MB)")
    public ResponseEntity<Map<String, Object>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please select an image file to upload.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File size exceeds the 5MB limit.");
        }

        String extension = validateAndExtractImageExtension(file);

        User currentUser = SecurityUtils.getCurrentUser(userRepository);

        String filename = "avatar_" + currentUser.getId() + "_" + System.currentTimeMillis() + "." + extension;
        Path targetPath = UPLOAD_DIR.resolve(filename);

        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("Failed to store uploaded avatar image", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save profile photo.");
        }

        String avatarUrl = "/uploads/avatars/" + filename;

        currentUser.setAvatarUrl(avatarUrl);
        userRepository.save(currentUser);

        studentRepository.findByUser(currentUser).ifPresent(student -> {
            student.setAvatarUrl(avatarUrl);
            studentRepository.save(student);
        });

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("avatarUrl", avatarUrl);
        response.put("message", "Profile photo uploaded successfully.");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/avatar")
    @Operation(summary = "Remove profile photo for current user")
    public ResponseEntity<Map<String, Object>> removeAvatar() {
        User currentUser = SecurityUtils.getCurrentUser(userRepository);
        String oldUrl = currentUser.getAvatarUrl();

        currentUser.setAvatarUrl(null);
        userRepository.save(currentUser);

        studentRepository.findByUser(currentUser).ifPresent(student -> {
            student.setAvatarUrl(null);
            studentRepository.save(student);
        });

        // Optionally remove old file from disk
        if (oldUrl != null && oldUrl.startsWith("/uploads/avatars/")) {
            String filename = oldUrl.substring("/uploads/avatars/".length());
            try {
                Files.deleteIfExists(UPLOAD_DIR.resolve(filename));
            } catch (Exception ignored) {}
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("avatarUrl", null);
        response.put("message", "Profile photo removed.");
        return ResponseEntity.ok(response);
    }

    private String validateAndExtractImageExtension(MultipartFile file) {
        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";

        byte[] header = new byte[12];
        try (InputStream is = file.getInputStream()) {
            int read = is.read(header);
            if (read < 4) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid image file format.");
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not verify image signature.");
        }

        // JPEG Magic Bytes: FF D8 FF
        if ((header[0] & 0xFF) == 0xFF && (header[1] & 0xFF) == 0xD8 && (header[2] & 0xFF) == 0xFF) {
            return "jpg";
        }

        // PNG Magic Bytes: 89 50 4E 47
        if ((header[0] & 0xFF) == 0x89 && (header[1] & 0xFF) == 0x50 && (header[2] & 0xFF) == 0x4E && (header[3] & 0xFF) == 0x47) {
            return "png";
        }

        // WebP: RIFF ... WEBP
        if (header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F' &&
            header[8] == 'W' && header[9] == 'E' && header[10] == 'B' && header[11] == 'P') {
            return "webp";
        }

        // Fallback check against known content types
        if ("image/jpeg".equalsIgnoreCase(contentType) || "image/jpg".equalsIgnoreCase(contentType) || originalFilename.endsWith(".jpg") || originalFilename.endsWith(".jpeg")) {
            return "jpg";
        }
        if ("image/png".equalsIgnoreCase(contentType) || originalFilename.endsWith(".png")) {
            return "png";
        }
        if ("image/webp".equalsIgnoreCase(contentType) || originalFilename.endsWith(".webp")) {
            return "webp";
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported image type. Allowed: JPG, PNG, WebP.");
    }
}
