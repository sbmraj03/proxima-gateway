#  Proxima — Programmable API Gateway

A production-grade API Gateway built from scratch in Node.js — featuring reverse proxying, JWT authentication, rate limiting, circuit breaking, load balancing, and a real-time analytics dashboard.

> Built after 6 months of hands-on experience working on a large-scale AWS Lambda-based Account Aggregator platform at Equal Identity (OneMoney).

---

## Features

| Feature | Description |
|--------|-------------|
| **Reverse Proxy** | Forward requests to backend services with full header passthrough |
| **JWT Authentication** | Per-route auth — some routes public, some protected |
| **Rate Limiting** | Token Bucket algorithm, configurable per route |
| **Load Balancer** | Round Robin across multiple backend instances |
| **Circuit Breaker** | Auto open/half-open/close with configurable thresholds |
| **Health Checks** | Proactive backend health checks every 30 seconds |
| **Retry Logic** | Exponential backoff — up to 2 retries on failure |
| **Timeout Handling** | 5s request timeout with 504 Gateway Timeout response |
| **Request ID Tracing** | UUID per request, propagated to backend via `x-request-id` header |
| **Structured Logging** | Winston — JSON logs with timestamp, level, requestId |
| **Analytics Persistence** | Analytics data persisted in Redis — survives restarts |
| **Real-time Dashboard** | React + Recharts — live request stats, circuit breaker status, time-series graph |
| **Docker** | Fully containerized with Docker Compose |
| **AWS EC2** | Deployed and running on AWS EC2 |

---

## 🏗️ Architecture

```
Client Request
      ↓
Proxima Gateway (Port 3000)
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
  docker-compose.yml
  Dockerfile
```

---

## ⚙️ Configuration

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
docker-compose up --build
```

Proxima will be available at `http://localhost:3000`

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

---

## 📊 Dashboard

```bash
cd dashboard
npm install
npm run dev
```

Dashboard runs at `http://localhost:5173`

---

## 🔌 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /analytics` | Real-time gateway analytics — requests, response times, circuit breaker states, health status |
| `GET /api/users` | Protected route — requires JWT |
| `GET /api/public` | Public route — no auth required |

### Generate JWT Token

```bash
node test/generateToken.js
```

Use the token as: `Authorization: Bearer <token>`

---

## 🌐 Live Demo

Gateway: `http://3.109.56.77:3000/analytics`

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Cache / Rate Limiting:** Redis
- **Logging:** Winston
- **Dashboard:** React, Tailwind CSS, Recharts
- **Infrastructure:** Docker, Docker Compose, AWS EC2