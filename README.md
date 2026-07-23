# Fixonaut
Java Spring boot and React

## Live Demo

Frontend:
https://fixonaut-ochre.vercel.app

Backend health:
https://fixonaut-backend.onrender.com/actuator/health

## Architecture

React/Vite frontend deployed on Vercel.

Java Spring Boot backend deployed on Render.

PostgreSQL database hosted on Neon.

## Local development

### Start PostgreSQL

docker compose up -d postgres

### Start backend

cd backend
mvnw.cmd spring-boot:run

### Start frontend

cd frontend
npm install
npm run dev

## Technology stack

- Java 21
- Spring Boot 3.5.14
- React
- TypeScript
- PostgreSQL
- Spring Security
- JWT
- Docker
- Vercel
- Render
- Neon
