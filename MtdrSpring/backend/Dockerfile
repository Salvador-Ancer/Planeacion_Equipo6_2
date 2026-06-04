# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /build

# Descarga dependencias primero (capa cacheada mientras pom.xml no cambie)
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copia el código fuente y construye (incluyendo el frontend via frontend-maven-plugin)
COPY src ./src
RUN mvn clean package -DskipTests -q

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine AS runtime

# Usuario no-root para mayor seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

WORKDIR /app

# Solo el JAR del stage de build
COPY --from=builder /build/target/MyTodoList-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

# Perfil prod activo por defecto; se puede sobreescribir con env var
ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java", "-jar", "app.jar"]