# QEVN RealtyOS Backend

FastAPI + SQLAlchemy + Alembic CRM backend. The real estate listings in the demo seed are fictional.

## Local Windows setup

Open a PowerShell terminal in `backend/`:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
alembic upgrade head
python -m scripts.seed_admin --email admin@example.com --name "QEVN Admin"
python -m scripts.seed_demo --admin-email admin@example.com
python -m uvicorn app.main:app --reload
```

The local SQLite URL is only for development. For deployment set `DATABASE_URL` to a managed PostgreSQL connection and run reviewed `alembic upgrade head` against that database. Never commit real `.env` values.

## API contract for frontend integration

Base prefix: `/api/v1`.

| Role | Method | Path |
| --- | --- | --- |
| Public | GET | `/properties` |
| Public | GET | `/properties/{slug}` |
| Public | POST | `/leads` |
| Public | POST | `/site-visits` |
| Public | POST | `/ai/chat` |
| Public | POST | `/ai/actions/confirm` |
| Staff | POST | `/auth/login` |
| Staff | POST | `/auth/logout` |
| Staff | GET | `/auth/me` |
| Admin | GET | `/admin/dashboard` |
| Admin | GET, POST | `/admin/properties` |
| Admin | PATCH, DELETE | `/admin/properties/{id}` |
| Admin | POST | `/admin/properties/{id}/images` |
| Admin | GET, PATCH | `/admin/leads/{id}` |
| Admin | GET | `/admin/leads` |
| Admin | POST | `/admin/leads/{id}/notes` |
| Admin | GET, POST | `/admin/agents` |
| Admin | GET, PATCH | `/admin/visits/{id}` |
| Agent | GET | `/agent/leads` |
| Agent | GET, PATCH | `/agent/leads/{id}` |
| Agent | POST | `/agent/leads/{id}/notes` |
| Agent | GET, PATCH | `/agent/visits/{id}` |

GET `/properties` returns `{items, total, page, limit}` using published records only.
Login expects `{email,password}`, sets HttpOnly `qevn_session` and readable `qevn_csrf` cookies, and responds with `{id,full_name,email,role,is_active}`.
Authenticated POST/PATCH/DELETE requests must include `X-CSRF-Token` equal to the `qevn_csrf` cookie value, and `credentials: 'include'`.
AI chat accepts `{conversation_id: null | string, message: string}`. Continue conversations with the returned ID and unchanged browser session cookies. AI write actions return `pending_action` with `confirmation_ref`, which the frontend must display and send to `/ai/actions/confirm` **only after explicit human confirmation**.
Site visits are `REQUESTED` until a staff member confirms them.

For deployed frontend/backend on different origins, use a same-origin Next.js rewrite/proxy and ensure cookies, trusted origins and CSRF handling are correct. Never embed Groq, PostgreSQL or Cloudinary secrets in browser variables.

## Checks

```powershell
python -m compileall -q app scripts
python -m ruff check app scripts tests
python -m pytest -q
```

CI runs these checks along with PostgreSQL migrations, dependency auditing and a Docker build. A passing CI run is not a substitute for live provider/Cloudinary checks or a frontend end-to-end test.

## AI provider limitation

This code implements a GroqCloud-compatible provider; the interviewer's separately named “Groqbot” was not verified as an API with the same interface. Treat this as an explicit alternate integration, not a claim of native Groqbot support.

## Production to-do

- Configure PostgreSQL, HTTPS and trusted frontend origin.
- Use Redis-backed rate limits for multi-instance deployment.
- Set and protect real session/AI/storage keys in hosting provider configuration.
- Verify provider access, data retention, logging/privacy rules, and clean up expired conversations.
- Add more integration tests for upload and concurrent booking edge cases.
- Document remaining limitations truthfully in the assessment submission.
