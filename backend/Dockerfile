# =============================================================================
# Multi-Stage Production Dockerfile for KASUMIO Spring Boot Backend
# Optimized for Cloud Free-Tier (Render / Koyeb / Fly.io with 512MB RAM)
# =============================================================================

# Stage 1: Build the Application
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /workspace

# Cache dependencies
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw* .
RUN mvn dependency:go-offline -B

# Copy source and build jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal Secure Runtime
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Create unprivileged application user
RUN groupadd -r spring && useradd -r -g spring spring

# Install curl for container health checks
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Copy jar from builder
COPY --from=builder /workspace/target/kasumio-backend-0.0.1-SNAPSHOT.jar app.jar
RUN chown -R spring:spring /app

USER spring:spring

# Expose default application port (Render/Koyeb inject PORT environment variable)
ENV PORT=8080
EXPOSE 8080

# Configure JVM flags optimized for 512MB free-tier container memory limit:
# - UseSerialGC minimizes GC memory overhead
# - MaxRAMPercentage=70 caps heap to ~350MB of 512MB limit, leaving room for metaspace & OS
# - ExitOnOutOfMemoryError ensures immediate container restart on OOM
ENTRYPOINT ["sh", "-c", "exec java -XX:+UseSerialGC -Xss512k -XX:MaxRAMPercentage=70.0 -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-prod} -jar app.jar"]
