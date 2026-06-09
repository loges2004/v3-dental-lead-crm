# V3 Dental Clinic — Lead CRM

Lightweight React CRM for a dental clinic. Leads are stored in **Google Sheets**, follow-up reminders use **Google Calendar**, and the app deploys free on **Vercel**.

## Features

- Secure team login (any staff member uses the same clinic username and password)
- Dashboard KPIs, status breakdown, recent activity
- Fast **Add Lead** flow with **Save & New**
- Lead list with filters, sort, pagination, edit/delete
- Overdue / today / upcoming follow-up highlighting
- Excel export (all or filtered)
- Dark mode and mobile-responsive UI

## Clinic login

Any team member can sign in with the same credentials:

| Field | Value |
|--------|--------|
| Username | `v3dentalclinic@gmail.com` |
| Password | `v3clinic@123` |

Override with `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env` or on Vercel if you change them later.

---

## Step 1 — Install locally

```bash
cd V3_CRM_LEADS
npm install
```

Copy environment template:

```bash
copy .env.example .env
```

Edit `.env` with your Google and admin settings (Steps 2–3).

Run the app (two terminals):

```bash
# Terminal 1 — API (port 3001)
npm run dev:api

# Terminal 2 — React (port 5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Step 2 — Google Cloud & Sheets setup

### 2.1 Create a Google Cloud project

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project (e.g. `dental-lead-crm`).
3. Enable APIs:
   - **Google Sheets API**
   - **Google Calendar API**

### 2.2 Service account

1. **IAM & Admin → Service Accounts → Create service account**
2. Name it `dental-crm-sheets`.
3. Create a **JSON key** and download it.
4. From the JSON file, copy:
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `GOOGLE_PRIVATE_KEY` (keep `\n` line breaks; in Vercel paste the full key with quotes)

### 2.3 Google Sheet

1. Create a new Google Sheet (e.g. `Dental Leads CRM`).
2. Copy the **Spreadsheet ID** from the URL:
   `https://docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`
3. Set `GOOGLE_SHEET_ID` in `.env`.
4. **Share the sheet** with the service account email as **Editor**.

The app creates a `Leads` tab and header row automatically on first save.

### 2.4 Google Calendar reminders

1. Open [Google Calendar](https://calendar.google.com).
2. Create a calendar (e.g. `Dental Follow-ups`) or use `primary`.
3. **Settings → Share with specific people** → add the **service account email** with **Make changes to events**.
4. For `primary`, you may need a dedicated calendar owned by a clinic Gmail account shared with the service account.
5. Set `GOOGLE_CALENDAR_ID` to the calendar ID (Settings → Integrate calendar) or `primary`.

When a lead has a **Follow-up Date**, the API creates an event with popup reminders **1 day before** and **on the day** (syncs to mobile via Google Calendar app).

---

## Step 3 — Environment variables

| Variable | Description |
|----------|-------------|
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password |
| `JWT_SECRET` | Long random string for session tokens |
| `GOOGLE_SHEET_ID` | Spreadsheet ID |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | From service account JSON |
| `GOOGLE_PRIVATE_KEY` | From service account JSON |
| `GOOGLE_CALENDAR_ID` | Calendar ID or `primary` |

---

## Step 4 — Create a GitHub repository

1. Install [Git](https://git-scm.com/) if needed.
2. In the project folder:

```bash
git init
git add .
git commit -m "Initial Dental Lead CRM"
```

3. On GitHub: **New repository** → name e.g. `dental-lead-crm` → **Create** (no README if you already have one).
4. Link and push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/dental-lead-crm.git
git branch -M main
git push -u origin main
```

Never commit `.env` — it is listed in `.gitignore`.

---

## Step 5 — Deploy on Vercel (free)

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. **Add New Project** → import your `dental-lead-crm` repo.
3. Framework preset: **Vite**.
4. Add **Environment Variables** (same as `.env`) for Production.
5. Deploy.

Vercel runs:

- Static frontend from `npm run build`
- Serverless functions in `/api` for auth and Google Sheets

After deploy, open your Vercel URL and log in.

---

## Project structure

```
api/                 # Vercel serverless routes
  auth/              # login, logout, me
  leads/             # CRUD + Calendar side effects
  lib/               # Google Sheets, JWT helpers
src/
  pages/             # Dashboard, Add Lead, Lead List, Login
  components/        # UI building blocks
server/dev-server.js # Local API for development
```

---

## Troubleshooting

| Issue | Fix |
|--------|-----|
| `Missing GOOGLE_SHEET_ID` | Set env vars on Vercel and redeploy |
| `403` from Google | Share Sheet (and Calendar) with service account email |
| Login works locally but not on Vercel | Set `JWT_SECRET`, `ADMIN_*` on Vercel |
| Calendar events not created | Enable Calendar API; share calendar with service account |
| Private key errors | Escape newlines as `\n` in one line for Vercel env |

---

## Tech stack

- React 18 + Vite + Tailwind CSS
- Google Sheets API + Google Calendar API
- Vercel hosting (no paid database)

---

## License

Private use for your dental clinic. Customize as needed.
