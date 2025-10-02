# Dockerfile para Spring Boot en Render
FROM openjdk:21-jdk-slim

WORKDIR /app

# Copiar archivos de Maven
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

# Hacer ejecutable mvnw
RUN chmod +x mvnw

# Descargar dependencias
RUN ./mvnw dependency:go-offline -B

# Copiar código fuente
COPY src src

# Compilar la aplicación
RUN ./mvnw clean package -DskipTests

# Exponer puerto
EXPOSE 8080

# Comando para ejecutar
CMD ["java", "-jar", "target/demo-0.0.1-SNAPSHOT.jar"]