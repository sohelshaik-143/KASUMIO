package com.kasumio.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Sliding-window rate limiter for sensitive public endpoints:
 * - /api/auth/login
 * - /api/auth/register
 * - /api/discovery/candidates/discover
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int LOGIN_LIMIT_PER_MINUTE = 10;
    private static final int REGISTER_LIMIT_PER_MINUTE = 5;
    private static final int DISCOVERY_LIMIT_PER_MINUTE = 30;
    private static final long WINDOW_MS = 60_000L;

    private final Map<String, Deque<Long>> requestLog = new ConcurrentHashMap<>();

    public void resetForTesting() {
        requestLog.clear();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String uri = request.getRequestURI();
        String method = request.getMethod();

        int limit = -1;
        if (uri.startsWith("/api/auth/register")) {
            limit = REGISTER_LIMIT_PER_MINUTE;
        } else if (uri.startsWith("/api/auth/login")) {
            limit = LOGIN_LIMIT_PER_MINUTE;
        } else if (uri.startsWith("/api/discovery/candidates/discover") && "POST".equalsIgnoreCase(method)) {
            limit = DISCOVERY_LIMIT_PER_MINUTE;
        }

        if (limit > 0) {
            String clientKey = getClientIp(request) + ":" + uri;
            long now = System.currentTimeMillis();

            Deque<Long> timestamps = requestLog.computeIfAbsent(clientKey, k -> new ArrayDeque<>());
            synchronized (timestamps) {
                while (!timestamps.isEmpty() && now - timestamps.peekFirst() > WINDOW_MS) {
                    timestamps.pollFirst();
                }
                if (timestamps.size() >= limit) {
                    response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setHeader("Retry-After", "60");
                    response.getWriter().write("{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Rate limit exceeded. Please wait before retrying.\"}");
                    return;
                }
                timestamps.addLast(now);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
    }
}
