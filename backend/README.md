
# QEVN RealtyOS Backend

FastAPI-based backend for property management, customer enquiries, site visits, sales CRM, role-based authentication, and AI-assisted property discovery.

## Technology

- Python 3.12
- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- Pydantic
- GroqCloud-compatible AI API
- Cloudinary
- Pytest
- Docker
- GitHub Actions

## Local setup

Open PowerShell in the backend directory.

Create and activate the virtual environment:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
python -m pip install -r requirements.txt
```

Create `.env` using `.env.example` as a template.

Configure the database and API credentials.

Run migrations:

```powershell
alembic upgrade head
```

Create the initial Admin:

```powershell
python -m scripts.seed_admin --email admin@example.com --name "QEVN Admin"
```

Create demonstration listings:

```powershell
python -m scripts.seed_demo --admin-email admin@example.com
```

Start FastAPI:

```powershell
python -m uvicorn app.main:app --reload
```

API documentation:

http://127.0.0.1:8000/docs

Health endpoint:

http://127.0.0.1:8000/health

## Authentication

Admin and Agent users authenticate with email and password.

Session tokens are stored in HTTP-only cookies.

Protected write requests require the X-CSRF-Token header.

Roles:

- ADMIN: manages properties, agents, leads, and visits.
- AGENT: manages assigned customer leads and site visits.

Public visitors do not require an account to browse listings.

## API Endpoints

Base URL: /api/v1

### Properties

GET /properties
GET /properties/{slug}

### Customer enquiries

POST /leads

### Site visits

POST /site-visits

### AI Concierge

POST /ai/chat
POST /ai/actions/confirm

### Authentication

POST /auth/login
POST /auth/logout
GET /auth/me

### Admin

GET /admin/dashboard
GET /admin/properties
POST /admin/properties
PATCH /admin/properties/{property_id}
DELETE /admin/properties/{property_id}

POST /admin/properties/{property_id}/images
DELETE /admin/properties/{property_id}/images/{image_id}

GET /admin/leads
GET /admin/leads/{lead_id}
PATCH /admin/leads/{lead_id}
POST /admin/leads/{lead_id}/notes
GET /admin/leads/{lead_id}/activity

GET /admin/agents
POST /admin/agents
PATCH /admin/agents/{agent_id}

GET /admin/visits
PATCH /admin/visits/{visit_id}

### Agent

GET /agent/leads
GET /agent/leads/{lead_id}
PATCH /agent/leads/{lead_id}
POST /agent/leads/{lead_id}/notes

GET /agent/visits
PATCH /agent/visits/{visit_id}

## AI Architecture

The AI assistant uses a GroqCloud-compatible API.

The model can request permissioned tools to:

1. Search published property records.
2. Retrieve individual property details.
3. Prepare customer enquiries.
4. Prepare site-visit requests.

The model does not directly write customer enquiries or visits.

A pending action is created first.

The customer reviews the action and explicitly confirms it.

Only then does the backend save the action to the database.

## Testing

```powershell
python -m compileall -q app scripts
python -m ruff check app scripts tests
python -m pytest -q
```

The CI workflow also performs migrations against PostgreSQL and runs a dependency audit.

## Frontend Integration

The Next.js frontend uses /api/v1 endpoints.

Public requests return real database records.

Authenticated requests require cookies and CSRF protection.

The AI response contains:

- conversation_id
- message
- property_matches
- pending_action

The frontend must display the pending action details before asking the customer to confirm.

## Security

- Argon2 password hashing
- HTTP-only session cookies
- CSRF verification
- Role-based access control
- Restricted published-property access
- Server-side AI API credentials
- Customer confirmation for AI actions
- Request rate limiting

## Deployment

The application is designed for:

- Backend: Render or a comparable container host
- Database: Managed PostgreSQL
- Frontend: Vercel
- Image storage: Cloudinary

Production secrets must be configured through the hosting platform.

Run Alembic migrations against the production database before deployment.

## Limitations

The included sample properties are fictional.

AI-generated responses require verification against the database.

GroqCloud integration should not be represented as a verified implementation of another product called Groqbot.

Additional production hardening is needed for rate limiting, concurrent appointments, logging, data retention, and automated deployment.

All AI-assisted development should be disclosed accurately in the internship submission.
