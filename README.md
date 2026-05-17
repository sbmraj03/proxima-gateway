#  Proxima — Programmable API Gateway

A production-grade API Gateway built from scratch in Node.js — featuring reverse proxying, JWT authentication, rate limiting, circuit breaking, load balancing, and a real-time analytics dashboard.

> Built during my backend internship at Equal Identity (OneMoney), where I worked on a large-scale AWS Lambda-based Account Aggregator platform - and wanted to deeply understand the infrastructure layer by building it from scratch.

---

## Live Demo

| | URL |
|--|--|
| **Dashboard** | `http://3.109.56.77/dashboard` |
| **Public API** | `http://3.109.56.77/api/public` |
| **Analytics** | `http://3.109.56.77/analytics` |
---

## Features

| Feature | Description |
|--------|-------------|
| **Reverse Proxy** | Forward requests to backend services with full header passthrough |
| **JWT Authentication** | Per-route auth - some routes public, some protected |
| **Rate Limiting** | Token Bucket algorithm, configurable per route |
| **Load Balancer** | Round Robin across multiple backend instances |
| **Circuit Breaker** | Auto open/half-open/close with configurable thresholds |
| **Health Checks** | Proactive backend health checks every 30 seconds |
| **Retry Logic** | Exponential backoff — up to 2 retries on failure |
| **Timeout Handling** | 5s request timeout with 504 Gateway Timeout response |
| **Request ID Tracing** | UUID per request, propagated to backend via `x-request-id` header |
| **Structured Logging** | Winston - JSON logs with timestamp, level, requestId |
| **Analytics Persistence** | Analytics data persisted in Redis - survives restarts |
| **Real-time Dashboard** | React + Recharts - live request stats, circuit breaker status, time-series graph |
| **Nginx Edge Server** | Static file serving + routing via Nginx reverse proxy |
| **Docker** | Fully containerized with Docker Compose |
| **AWS EC2** | Deployed and running on AWS EC2 |

---

##  Architecture

```
Internet
    ↓
Nginx (port 80)
    ├── /dashboard  →  React Dashboard (static files)
    └── /           →  Proxima Gateway (port 3000)
                            ↓
                ┌─────────────────────────────┐
                │  1. Parse Request            │
                │  2. Rate Limit Check (Redis) │
                │  3. Route Match              │
                │  4. JWT Auth (if required)   │
                │  5. Circuit Breaker Check    │
                │  6. Load Balancer            │
                │  7. Forward to Backend       │
                │  8. Retry on failure         │
                └─────────────────────────────┘
                            ↓
                Backend Services (4001 / 4002)
```

---

## 📁 Project Structure

```
proxima-gateway/
  src/
    core/
      analytics.js      # Request analytics + Redis persistence
      healthCheck.js    # Proactive backend health checks
      logger.js         # Winston structured logging
      parser.js         # HTTP request parser + UUID
      proxy.js          # Reverse proxy + retry logic
      redisClient.js    # Shared Redis client
      router.js         # Route matching
    lb/
      roundRobin.js     # Round Robin load balancer
    middleware/
      auth.js           # JWT validation
      circuitBreaker.js # Circuit breaker (closed/open/half-open)
      rateLimiter.js    # Token bucket rate limiter
  dashboard/            # React + Tailwind + Recharts dashboard
  config/
    routes.json         # Route configuration
  nginx.conf            # Nginx edge server config
  docker-compose.yml
  Dockerfile
```

---

## Configuration

Routes are configured in `config/routes.json`:

```json
{
  "routes": [
    {
      "method": "GET",
      "path": "/api/users",
      "auth": true,
      "rateLimit": {
        "maxTokens": 5,
        "refillRate": 1
      },
      "targets": ["${BACKEND1_URL}", "${BACKEND2_URL}"]
    }
  ]
}
```

Environment variables in `.env`:

```
BACKEND1_URL=http://localhost:4001
BACKEND2_URL=http://localhost:4002
REDIS_URL=redis://localhost:6379
```

---

## 🐳 Run with Docker

```bash
git clone https://github.com/sbmraj03/proxima-gateway
cd proxima-gateway
cp .env.docker.example .env.docker
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Dashboard | `http://localhost/dashboard` |
| Public API | `http://localhost/api/public` |
| Analytics | `http://localhost/analytics` |

---

## 🖥️ Run Locally

```bash
npm install
npm run dev
```

Start backends in separate terminals:

```bash
node test/backend1.js
node test/backend2.js
```

Dashboard:

```bash
cd dashboard
npm install
npm run dev
# runs at http://localhost:5173
```

---

## API Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /analytics` | No | Real-time gateway analytics |
| `GET /api/users` | Yes (JWT) | Protected route |
| `GET /api/public` | No | Public route |

### Generate JWT Token

```bash
node test/generateToken.js
```

Use as: `Authorization: Bearer <token>`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Edge Server | Nginx |
| Cache / Rate Limiting | Redis |
| Logging | Winston |
| Dashboard | React, Tailwind CSS, Recharts |
| Infrastructure | Docker, Docker Compose, AWS EC2 |

---

## Performance

### Load Test — 50 Concurrent Users (k6)

| Metric | Result |
|--------|--------|
| Total Requests | 4431 |
| Requests/sec | ~36 req/sec |
| Avg Latency | 23ms |
| P95 Latency | 29ms |
| Response time < 500ms | 100% |

### Rate Limiter Accuracy
| Metric | Result |
|--------|--------|
| Concurrent Users | 50 |
| Total Requests fired | 4431 |
| Correctly throttled (429) | 79.93% |
| Avg latency (passed requests) | 25ms |