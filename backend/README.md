# Household Command Center - Backend API

Express.js backend with PostgreSQL for chore data persistence.

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Update .env with your PostgreSQL connection string

# Start development server
npm run dev
```

Server runs on http://localhost:3001

### Production (Railway)

Railway automatically:
- Installs dependencies
- Provides `DATABASE_URL` for PostgreSQL
- Runs `npm start`

## API Endpoints

### Health Check
```
GET /health
```

### Get All Chore Data
```
GET /api/chores
```

Returns:
```json
{
  "Rory": { ... },
  "Addy": { ... },
  "Elly": { ... }
}
```

### Get Specific Kid Data
```
GET /api/chores/:kidName
```

### Save All Chore Data
```
POST /api/chores
Content-Type: application/json

{
  "Rory": { ... },
  "Addy": { ... },
  "Elly": { ... }
}
```

### Update Specific Kid
```
PUT /api/chores/:kidName
Content-Type: application/json

{
  "kidName": "Rory",
  "previousStreakDays": 5,
  "weeklyPointsSoFar": 45,
  "lastUpdated": "2024-01-15T10:30:00Z",
  "history": [...]
}
```

### Delete All Data
```
DELETE /api/chores
```

## Database Schema

### Table: `chore_data`

| Column | Type | Description |
|--------|------|-------------|
| `kid_name` | VARCHAR(50) | Primary key, kid's name |
| `data` | JSONB | All chore data for this kid |
| `updated_at` | TIMESTAMP | Last update timestamp |

## Environment Variables

- `PORT` - Server port (default: 3001)
- `DATABASE_URL` - PostgreSQL connection string
- `FRONTEND_URL` - Frontend URL for CORS
- `NODE_ENV` - Environment (development/production)

## Dependencies

- **express** - Web framework
- **pg** - PostgreSQL client
- **cors** - CORS middleware
- **dotenv** - Environment variables

## Development

```bash
# Watch mode
npm run dev

# Production mode
npm start
```

## Testing

Test health endpoint:
```bash
curl http://localhost:3001/health
```

Test chore data:
```bash
curl http://localhost:3001/api/chores
```

## Deployment

See [RAILWAY_SETUP.md](../RAILWAY_SETUP.md) for complete deployment guide.
