# E-Commerce Microservices - Bootcamp Project

## 🏗️ Architecture

Java 21 + Spring Boot 3.3 microservices project with Maven multi-module structure.

```
├── backend/
│   ├── common/              → Shared DTOs, exceptions, utilities
│   ├── eureka-server/       → Service Discovery (port 8761)
│   ├── api-gateway/         → API Gateway with JWT filter (port 8080)
│   ├── auth-service/        → Authentication & JWT (port 8081)
│   ├── product-service/     → Product CRUD & Pagination (port 8082)
│   └── order-service/       → Cart, Orders & Iyzico Payment (port 8083)
├── frontend/                → React & Vite application
```

## 🚀 Quick Start

### Prerequisites
- Java 21
- Maven 3.9+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Run with Docker Compose
```bash
# Build all services
cd backend && mvn clean package -DskipTests

# Start everything
docker-compose up -d
```

### Run Locally (Development)
```bash
# Start PostgreSQL
docker-compose up -d postgres

# Build common module first
cd backend && mvn clean install -pl common

# Start services (in order)
cd backend/eureka-server && mvn spring-boot:run &
cd backend/api-gateway && mvn spring-boot:run &
cd backend/auth-service && mvn spring-boot:run &
cd backend/product-service && mvn spring-boot:run &
cd backend/order-service && mvn spring-boot:run &
```

### Run Frontend Locally
```bash
cd frontend
npm install
npm run dev
```

## 📋 API Endpoints

### Auth Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Kullanıcı kayıt |
| POST | `/api/auth/login` | JWT token alma |
| GET | `/api/auth/validate` | Token doğrulama |

### Product Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products?page=0&size=10` | Ürün listeleme (paginated) |
| GET | `/api/products/{id}` | Ürün detay |
| GET | `/api/products/search?keyword=` | Ürün arama |
| POST | `/api/products` | Ürün oluştur (Admin) |
| PUT | `/api/products/{id}` | Ürün güncelle (Admin) |
| DELETE | `/api/products/{id}` | Ürün sil (Admin) |

### Order Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Sepet görüntüleme |
| POST | `/api/cart/items` | Sepete ekleme |
| PUT | `/api/cart/items/{id}` | Sepet güncelleme |
| DELETE | `/api/cart/items/{id}` | Sepetten çıkarma |
| POST | `/api/orders` | Sipariş oluşturma |
| GET | `/api/orders` | Siparişleri listeleme |
| POST | `/api/payments/process` | Ödeme (Iyzico) |

## 📖 Swagger Documentation
- Auth Service: http://localhost:8081/swagger-ui.html
- Product Service: http://localhost:8082/swagger-ui.html
- Order Service: http://localhost:8083/swagger-ui.html

## 🧪 Testing
```bash
# Run all tests
cd backend && mvn test

# Run specific service tests
cd backend && mvn test -pl auth-service
cd backend && mvn test -pl product-service
cd backend && mvn test -pl order-service
```

## 🐳 Docker & Jib
```bash
# Build images with Jib
mvn compile jib:dockerBuild

# Push to Docker Hub
mvn compile jib:build -Djib.to.auth.username=YOUR_USER -Djib.to.auth.password=YOUR_PASS
```

## ☁️ Coolify Deployment
- **PostgreSQL**: Single database instance with logical schemas
- **Loki & Grafana**: Centralized lightweight JSON logging
- **CI/CD**: GitHub Actions pipeline auto-pushing to GHCR and triggering Webhooks

## 🔐 Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `DB_URL` | PostgreSQL URL | `jdbc:postgresql://localhost:5432/xxx_db` |
| `DB_USERNAME` | DB username | `postgres` |
| `DB_PASSWORD` | DB password | `postgres` |
| `JWT_SECRET` | JWT signing key | key |
| `EUREKA_URI` | Eureka server URL | `http://localhost:8761/eureka` |
| `IYZICO_API_KEY` | Iyzico API key | `sandbox-apikey` |
| `IYZICO_SECRET_KEY` | Iyzico secret | `sandbox-secretkey` |
| `LOKI_URL` | Loki URL | `http://localhost:3100` |

## 📊 Tech Stack
Java 21 • Spring Boot 3.3 • Spring Cloud • Maven • PostgreSQL • JWT • Iyzico • Docker • Jib • GitHub Actions • AWS
