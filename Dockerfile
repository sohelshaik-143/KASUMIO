# =============================================================================
# Root Dockerfile for KASUMIO Spring Boot Backend
# Enables zero-config deployment on Render / Koyeb / Fly.io from repository root
# =============================================================================

# Stage 1: Build the Application
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /workspace

# Cache dependencies
COPY backend/pom.xml .
COPY backend/.mvn .mvn
COPY backend/mvnw* .
RUN mvn dependency:go-offline -B

# Copy backend source and compile package
COPY backend/src ./src
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

ENV PORT=8080
EXPOSE 8080

# JVM flags optimized for free-tier 512MB RAM
ENTRYPOINT ["sh", "-c", "exec java -XX:+UseSerialGC -Xss512k -XX:MaxRAMPercentage=70.0 -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-prod} -jar app.jar"]
