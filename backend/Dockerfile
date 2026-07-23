FROM eclipse-temurin:21-jdk-jammy AS build

WORKDIR /app

COPY .mvn .mvn
COPY mvnw pom.xml ./

RUN chmod +x mvnw
RUN ./mvnw -B dependency:go-offline

COPY src src

RUN ./mvnw -B clean package -DskipTests


FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s \
    --timeout=5s \
    --start-period=45s \
    --retries=3 \
    CMD curl --fail http://localhost:8080/actuator/health/readiness \
    || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]