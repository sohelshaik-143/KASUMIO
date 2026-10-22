package com.kasumio.common;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Public Health Check Endpoint for Cloud Hosting Probes (Render, Railway, Fly.io, Kubernetes)
 */
@RestController
public class HealthController {

    @GetMapping({"/", "/api", "/api/health"})
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "kasumio-backend",
            "timestamp", Instant.now().toString()
        ));
    }
}
