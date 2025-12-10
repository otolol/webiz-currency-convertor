# Currency Converter API

A NestJS REST API for currency conversion using live exchange rates from Monobank.

---

## Application Start Instructions

### Using Docker (Recommended)

```bash
# Start the application with Redis
docker-compose up --build

# Run in background
docker-compose up --build -d

# Stop the application
docker-compose down
```

Application runs at: `http://localhost:3001`

### Without Docker

**Prerequisites:** Node.js 18+, Redis

**1. Start Redis**

```bash
# Using Docker
docker run -d --name redis -p 6379:6379 redis:alpine

# Or install locally
# macOS: brew install redis && brew services start redis
# Ubuntu: sudo apt install redis-server && sudo systemctl start redis
```

**2. Install dependencies and run**

```bash
npm install

# Development (with hot-reload)
npm run start:dev

Application runs at: `http://localhost:3000`

---

## API Documentation

### Swagger UI

Interactive documentation available at: `http://localhost:3000/api/docs`

## Environment Configuration

Create a `.env` file in the project root:

```env
PORT=3000
REDIS_URL=redis://localhost:6379
MONOBANK_API_URL=https://api.monobank.ua/bank/currency
CACHE_TTL=300
```

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `REDIS_URL` | Redis connection URL | `redis://redis:6379` |
| `MONOBANK_API_URL` | Monobank API endpoint | `https://api.monobank.ua/bank/currency` |
| `CACHE_TTL` | Cache TTL in seconds | `300` |

**Docker environment variables** are configured in `docker-compose.yml`:

```yaml
environment:
  - REDIS_HOST=redis
  - REDIS_PORT=6379
  - MONOBANK_API_URL=https://api.monobank.ua/bank/currency
```

