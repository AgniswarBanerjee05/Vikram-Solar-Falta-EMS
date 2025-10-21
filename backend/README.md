# Falta EMS Prototype – Backend Services

This directory now contains a lightweight backend stack that complements the existing Vite
dashboard. Two independent Express services share a common SQLite data layer so that admins
can manage staff accounts while end users can authenticate against a separate API.

```
backend/
├── admin-server/   # Admin registration, login, and user-management APIs
├── shared/         # SQLite database + auth helpers used by both services
└── user-server/    # Normal user login + self-service password flows
```

## 1. Prerequisites

- Node.js v18 or newer
- npm (ships with Node)

The servers rely on SQLite (`better-sqlite3`). No external database is required; a file-based
database is created automatically inside `backend/data/ems.sqlite` by default.

## 2. Installing dependencies

Install dependencies for the shared layer and each service once:

```bash
cd backend/shared && npm install
cd ../admin-server && npm install
cd ../user-server && npm install
```

> Tip: After the first install you only need to run `npm install` again when dependencies change.

## 3. Environment variables

Both services read from environment variables (via `dotenv`). You can create `.env` files
inside each server directory or export variables in your shell.

| Variable | Description | Default |
| --- | --- | --- |
| `FALTA_EMS_DB_PATH` | Path to the SQLite file shared by both services. | `backend/data/ems.sqlite` |
| `FALTA_EMS_JWT_SECRET` | Secret used to sign JWTs for admins and users. | `change-me-in-production` |
| `ADMIN_REGISTRATION_KEY` | Optional shared secret required to register a new admin. | *(unset)* |
| `ADMIN_SERVER_PORT` | Port for the admin API. | `4000` |
| `USER_SERVER_PORT` | Port for the user API. | `5000` |

### Email Configuration (New!)

The system now sends automatic confirmation emails when accounts are created. Configure these
environment variables to enable email functionality:

| Variable | Description | Example |
| --- | --- | --- |
| `EMAIL_USER` | SMTP username (usually your email address) | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | SMTP password or app-specific password | `your-app-password` |
| `EMAIL_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP server port | `587` (TLS) or `465` (SSL) |
| `EMAIL_SECURE` | Use SSL/TLS (true for 465, false for 587) | `false` |
| `EMAIL_FROM` | Sender email address | `noreply@vikramsolar.com` |
| `EMAIL_FROM_NAME` | Sender name shown in emails | `Vikram Solar - Falta EMS` |
| `DASHBOARD_URL` | Dashboard URL for login link | `https://your-dashboard-url.com` |

**📧 See [EMAIL_SETUP.md](./EMAIL_SETUP.md) for detailed setup instructions and troubleshooting.**

> **Note:** Email is optional. If `EMAIL_USER` and `EMAIL_PASSWORD` are not configured, the system
> will log credentials to the console instead. All other functionality works normally.

If you set `ADMIN_REGISTRATION_KEY`, a client must supply the same value either via the
`x-registration-key` header or a `registrationKey` field in the registration payload.

## 4. Running the services

Start the admin API:

```bash
cd backend/admin-server
npm run start
# or for auto-reload while developing:
npm run dev
```

Start the user API in another terminal:

```bash
cd backend/user-server
npm run start
```

Each service exposes a `/health` endpoint you can hit to confirm it is running.

## 5. Key API endpoints

### Admin service (`http://localhost:4000` by default)

| Method & Path | Description |
| --- | --- |
| `POST /api/admin/register` | Create the first admin account. Accepts `{ email, password, fullName? }`. Returns admin profile + JWT. Optional `registrationKey` check. **Sends confirmation email to admin.** |
| `POST /api/admin/login` | Admin login. Returns JWT token. |
| `POST /api/users` | **Requires Bearer token**. Creates a normal user. Supply `{ email, fullName?, password?, status? }`. If password is omitted a temporary one is generated and returned in the response. **Sends confirmation email to user.** |
| `GET /api/users` | List all users (admin view). |
| `GET /api/users/:id` | Fetch a single user. |
| `PUT /api/users/:id` | Update email, name, or status. |
| `POST /api/users/:id/reset-password` | Reset (or set) a user password. Returns the temporary credentials for distribution. |
| `DELETE /api/users/:id` | Remove a user account. |

Every admin-protected route expects an `Authorization: Bearer <token>` header containing the JWT
returned from the login/register endpoints.

### User service (`http://localhost:5000` by default)

| Method & Path | Description |
| --- | --- |
| `POST /api/login` | Normal user login. Requires `email` + `password`. |
| `GET /api/me` | Returns the authenticated user profile (requires Bearer token). |
| `PUT /api/me/password` | Allows a user to change their password given the current password. |

JWTs issued by the user service are scoped with `role: "user"`, while admin tokens use `role: "admin"`.
This separation ensures the admin API cannot be called with a user token and vice versa.

## 6. Database & data model

The SQLite schema contains two tables:

- `admins`: stores admin credentials (email, password hash, optional name).
- `users`: stores normal user accounts plus metadata about the admin who created them.

Timestamps are tracked automatically (`created_at`, `updated_at`). Passwords are always stored as
BCrypt hashes—plaintext values only ever appear in API responses when an admin explicitly creates
or resets a user and a temporary password is generated.

## 7. Quick sanity check

After installing dependencies you can quickly verify the database initialises correctly:

```bash
cd backend/admin-server
node -e "const { getDb } = require('../shared/database'); getDb(); console.log('DB ready');"
```

From this point you can wire the dashboard UI to these endpoints or extend the APIs further
(add auditing, refresh tokens, role-based permissions, etc.).
