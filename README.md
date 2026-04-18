# Relaxafter — Roster & Staff Scheduling (SaaS MVP)

A multi-tenant SaaS web app for cleaning companies to manage sites, staff, and shifts on a Google Calendar-style interface.

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + react-big-calendar
- **Backend:** ASP.NET Core 8 Web API + Entity Framework Core + SQLite (swap for SQL Server/PostgreSQL in prod)
- **Auth:** JWT access tokens + refresh tokens, BCrypt password hashing, role-based authorization

## Folder structure

```
Relaxafter/
├── backend/
│   └── RelaxafterApi/
│       ├── Controllers/        # Auth, Users, Sites, Shifts, Dashboard
│       ├── Data/               # EF Core DbContext
│       ├── DTOs/               # Request/response contracts
│       ├── Models/             # Company, User, Site, Shift, UserRole
│       ├── Services/           # AuthService (JWT + refresh), CurrentUser
│       ├── Program.cs          # App composition, DI, auth, CORS, Swagger
│       └── appsettings.json
└── frontend/
    ├── src/
    │   ├── app/                # App Router pages
    │   │   ├── login/          # Sign in
    │   │   ├── register/       # Create company + admin
    │   │   ├── dashboard/      # Stat cards
    │   │   ├── calendar/       # Monthly/weekly/daily scheduling
    │   │   ├── users/          # CRUD staff (admin)
    │   │   └── sites/          # CRUD cleaning sites
    │   ├── components/         # AppShell, Sidebar, Modal, CalendarView
    │   ├── context/AuthContext.jsx
    │   └── lib/api.js          # Fetch client with auto-refresh
    ├── package.json
    └── tailwind.config.js
```

## Features

- **Multi-tenant:** every company is isolated via `CompanyId` scoping on every query. A JWT claim pins every request to the caller's tenant.
- **Roles:** `Admin` (full control), `Manager` (manage shifts/sites, view staff), `Staff` (view own schedule only).
- **Auth:** Register creates a company + admin. Login returns access + refresh tokens. Frontend auto-refreshes access tokens on 401.
- **Calendar (main feature):** Month / Week / Day views. Click a date → modal to create a shift (staff, site, start, end, notes). Color-coded by site. Filter by staff or site.
- **Dashboard:** total staff, active sites, total shifts, upcoming shifts.
- **Validation & errors:** server-side DTO validation, friendly error messages surfaced in UI.

## Data model

| Table      | Fields                                                          |
| ---------- | --------------------------------------------------------------- |
| Companies  | Id, Name, SubscriptionPlan, CreatedAt                           |
| Users      | Id, Name, Email, PasswordHash, Role, CompanyId, RefreshToken…   |
| Sites      | Id, Name, Address, Notes, Color, CompanyId                      |
| Shifts     | Id, UserId, SiteId, CompanyId, StartTime, EndTime, Notes        |

## Backend API

Base URL: `http://localhost:5080`

| Method | Route                        | Auth        | Notes                                   |
| ------ | ---------------------------- | ----------- | --------------------------------------- |
| POST   | `/api/auth/register`         | Public      | Creates company + admin user            |
| POST   | `/api/auth/login`            | Public      | Returns access + refresh                |
| POST   | `/api/auth/refresh`          | Public      | Rotates tokens                          |
| POST   | `/api/auth/logout`           | Any user    | Invalidates refresh                     |
| GET    | `/api/auth/me`               | Any user    | Current user profile                    |
| GET    | `/api/dashboard`             | Any user    | Tenant stats                            |
| GET    | `/api/users`                 | Manager+    | List users in company                   |
| POST   | `/api/users`                 | Admin       | Create user                             |
| PUT    | `/api/users/{id}`            | Admin       | Update user (optional password)         |
| DELETE | `/api/users/{id}`            | Admin       | Delete (blocked if shifts exist)        |
| GET    | `/api/sites`                 | Any user    | List sites in company                   |
| POST   | `/api/sites`                 | Manager+    | Create site                             |
| PUT    | `/api/sites/{id}`            | Manager+    | Update site                             |
| DELETE | `/api/sites/{id}`            | Admin       | Delete (blocked if shifts exist)        |
| GET    | `/api/shifts?from&to&userId&siteId` | Any user | Staff see own only; managers+ see all |
| POST   | `/api/shifts`                | Manager+    | Create                                  |
| PUT    | `/api/shifts/{id}`           | Manager+    | Update                                  |
| DELETE | `/api/shifts/{id}`           | Manager+    | Delete                                  |

Swagger UI: `http://localhost:5080/swagger` (development only).

## Setup & run

### Prerequisites

- Node.js 18+ and npm
- .NET 8 SDK

### Backend

```bash
cd backend/RelaxafterApi
dotnet restore
dotnet run
```

- On first run, `relaxafter.db` (SQLite) is created via `EnsureCreated`.
- API listens on `http://localhost:5080`.
- To use SQL Server or Postgres, swap the `UseSqlite` call in `Program.cs` for `UseSqlServer` / `UseNpgsql` and update `ConnectionStrings:DefaultConnection` in `appsettings.json`.
- For production, replace the `Jwt:Key` in `appsettings.json` with a long random secret (≥ 32 chars) and set `Cors:AllowedOrigins` to your frontend URL.

### Frontend

```bash
cd frontend
cp .env.local.example .env.local   # adjust NEXT_PUBLIC_API_URL if needed
npm install
npm run dev
```

Open <http://localhost:3000>. Register a new company → you become the admin.

### Typical end-to-end flow

1. Register as `Acme Cleaning` → you are Admin.
2. Go to **Sites** → add "Downtown Office", pick a color.
3. Go to **Users** → add a Staff member (email + password).
4. Go to **Calendar** → click a date → assign the staff to a site with start/end times.
5. Staff logs in with their credentials → sees only their own shifts on the calendar.

## Production notes

- Move JWT key and connection strings to environment variables / secret manager.
- Rotate refresh tokens on every refresh (already done) and consider storing a hashed value server-side.
- Add rate limiting on `/api/auth/*` and audit logging for CRUD endpoints.
- Run EF Core migrations instead of `EnsureCreated` (`dotnet ef migrations add Initial`).
- Serve behind HTTPS; tighten CORS to your frontend origin.
