# Public Hosting Plan — What's On My Plate

## Summary

| Layer | Self-hosted (current) | Public hosted |
|---|---|---|
| Frontend | Local dev / Docker | **GitHub Pages** |
| Backend | Local Express on port 3001 | **Railway** (free tier) |
| Database | Local PostgreSQL | **Railway PostgreSQL** (free tier) |
| Auth | None | **GitHub OAuth + Google OAuth** (via Passport.js) |

---

## Architecture Overview

```
GitHub Pages (static)
  └── React app (VITE_API_URL → Railway)
        └── /api/auth/github   → Passport GitHub strategy
        └── /api/auth/google   → Passport Google strategy
        └── /api/tasks         → JWT middleware → userId-scoped queries
        └── /api/tasks/:id/... → JWT middleware → userId-scoped queries

Self-hosted (SELF_HOSTED=true)
  └── React app (VITE_API_URL → localhost:3001)
        └── All API routes → no auth middleware → no userId scoping
```

---

## Mode Switching

A single environment variable controls the behavior on both sides:

- **Backend**: `SELF_HOSTED=true` → skip all auth middleware, all queries run without a userId filter
- **Frontend**: `VITE_SELF_HOSTED=true` → hide all auth UI (no login page, no logout button)

When self-hosted, the app behaves exactly as it does today.

---

## Infrastructure

### Railway (backend + database)
- **Why Railway**: Railway's free tier includes one project with $5 credit/month. A small Express app + PostgreSQL comfortably stays within this. No cold starts (unlike Render's free tier). Great GitHub integration.
- One Railway service: `whats-on-my-plate-api` (Node.js)
- One Railway plugin: PostgreSQL (managed, same project)
- Auto-deploy from `main` branch via Railway's GitHub integration
- Environment variables set in Railway dashboard

### GitHub Pages (frontend)
- `vite.config.ts` needs a `base` option set to `/whats-on-my-plate/` (or `/` if using a custom domain)
- GitHub Actions workflow builds the frontend and pushes to `gh-pages` branch
- `VITE_API_URL` and `VITE_SELF_HOSTED` injected at build time via GitHub Actions secrets

---

## Phase 1 — Backend: OAuth Auth System

### 1.1 New npm packages (server)

```
passport
passport-github2
passport-google-oauth20
jsonwebtoken
express-session
@types/passport
@types/passport-github2
@types/passport-google-oauth20
@types/jsonwebtoken
@types/express-session
```

### 1.2 Prisma schema changes

Add a `User` model and a `userId` field on `Task`:

```prisma
model User {
  id         String   @id @default(uuid())
  email      String   @unique
  name       String?
  avatarUrl  String?
  githubId   String?  @unique
  googleId   String?  @unique
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  tasks      Task[]
}

model Task {
  // ... all existing fields ...
  userId     String?          // nullable so existing self-hosted data still works
  user       User?   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

Run `prisma migrate dev --name add-users-and-user-id`.

### 1.3 New auth routes — `server/src/routes/auth.routes.ts`

```
GET  /api/auth/github           → redirect to GitHub OAuth
GET  /api/auth/github/callback  → exchange code, issue JWT, redirect to frontend
GET  /api/auth/google           → redirect to Google OAuth
GET  /api/auth/google/callback  → exchange code, issue JWT, redirect to frontend
GET  /api/auth/me               → return current user (requires JWT)
POST /api/auth/logout           → clear session (optional, frontend just deletes token)
```

**OAuth callback flow:**
1. Passport exchanges the OAuth code for a profile
2. Look up `User` by `githubId` / `googleId`; create if not found
3. Sign a short-lived JWT (`{ sub: user.id, email: user.email }`, 7-day expiry)
4. Redirect to frontend: `https://<github-pages-url>/#token=<jwt>` (hash prevents the token being logged in server access logs)
5. Frontend reads the hash, stores the JWT in `localStorage`, removes the hash from the URL

### 1.4 Auth middleware — `server/src/middleware/auth.middleware.ts`

```typescript
// Pseudo-code
export function requireAuth(req, res, next) {
  if (process.env.SELF_HOSTED === 'true') {
    req.userId = 'self-hosted';   // sentinel value
    return next();
  }
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

Apply `requireAuth` to all `/api/tasks`, `/api/tasks/:id/...` routes.

### 1.5 TaskService scoping changes

Every `TaskService` method gains a `userId: string` parameter. Prisma `where` clauses are updated:

```typescript
// Self-hosted: userId === 'self-hosted', treated as "no filter"
const userFilter = userId !== 'self-hosted' ? { userId } : {};

prisma.task.findMany({
  where: { ...userFilter, archived: false },
  ...
})
```

`createTask` sets `userId` on the new record (skipped when self-hosted).

`SubtaskService` and `LinkService` don't need changes — they are always scoped by `taskId`, and `taskId` ownership is implicitly validated via the parent task lookup.

### 1.6 New environment variables (server)

```
SELF_HOSTED=false
JWT_SECRET=<random 64-byte hex string>
GITHUB_CLIENT_ID=<from GitHub OAuth app>
GITHUB_CLIENT_SECRET=<from GitHub OAuth app>
GITHUB_CALLBACK_URL=https://<railway-url>/api/auth/github/callback
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
GOOGLE_CALLBACK_URL=https://<railway-url>/api/auth/google/callback
FRONTEND_URL=https://<github-username>.github.io/whats-on-my-plate
```

For self-hosted `.env`:
```
SELF_HOSTED=true
# JWT_SECRET, GITHUB_*, GOOGLE_* not needed
```

---

## Phase 2 — Frontend: Auth UI

### 2.1 Auth context — `client/src/context/AuthContext.tsx`

```typescript
interface AuthState {
  token: string | null;
  user: { id: string; name: string; avatarUrl: string } | null;
  isLoading: boolean;
}
```

- On mount: read `token` from `localStorage`; if present, call `GET /api/auth/me` to validate and populate `user`
- Also on mount: check `window.location.hash` for `#token=...` (OAuth callback), store it, strip hash
- `logout()`: remove from `localStorage`, clear state
- If `VITE_SELF_HOSTED=true`: `AuthContext` returns a mock authenticated user, no API calls

### 2.2 Update API client — `client/src/api/client.ts`

```typescript
// Add auth header to every request
const headers: HeadersInit = {
  'Content-Type': 'application/json',
};
const token = localStorage.getItem('auth_token');
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

### 2.3 Login/signup view

A new `AuthView` component (consistent with the existing single-page no-router approach):

- Shown when `!authContext.user && !VITE_SELF_HOSTED`
- Two buttons: "Sign in with GitHub" and "Sign in with Google"
- Clicking either redirects `window.location.href` to the Railway backend OAuth start URL
- Minimal design matching the existing app theme (cream background, same font)

### 2.4 Logged-in header changes

- Show user avatar + name in the header (top-right)
- "Sign out" button that calls `authContext.logout()`
- Hidden entirely when `VITE_SELF_HOSTED=true`

### 2.5 New environment variables (client)

```
VITE_API_URL=https://<railway-url>/api
VITE_SELF_HOSTED=false
```

For self-hosted:
```
VITE_API_URL=http://localhost:3001/api   (or leave unset for the default)
VITE_SELF_HOSTED=true
```

---

## Phase 3 — Deployment

### 3.1 GitHub Actions — Frontend deploy to GitHub Pages

File: `.github/workflows/deploy-frontend.yml`

```yaml
on:
  push:
    branches: [main]
    paths: ['client/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
        working-directory: client
      - run: npm run build
        working-directory: client
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_SELF_HOSTED: 'false'
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: client/dist
```

### 3.2 GitHub Pages SPA routing fix

GitHub Pages returns 404 for deep paths. Add `client/public/404.html` that redirects to `index.html` using the standard SPA trick (or configure the app to only use hash routing).

### 3.3 Vite base path

```typescript
// vite.config.ts
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  // ... rest unchanged
})
```

Set `VITE_BASE_PATH=/whats-on-my-plate/` in the GitHub Actions workflow (matching the repo name).

### 3.4 Railway backend deploy

- Connect Railway project to the GitHub repo
- Set root directory to `server/`
- Build command: `npm install && npx prisma migrate deploy && npm run build`
- Start command: `node dist/index.js`
- Add all environment variables in Railway dashboard
- Railway auto-deploys on push to `main`

### 3.5 OAuth app registration

**GitHub OAuth App** (github.com → Settings → Developer settings → OAuth Apps):
- Homepage URL: `https://<username>.github.io/whats-on-my-plate`
- Callback URL: `https://<railway-url>/api/auth/github/callback`

**Google OAuth** (console.cloud.google.com → APIs & Services → Credentials):
- Authorized redirect URI: `https://<railway-url>/api/auth/google/callback`

---

## Phase 4 — Data Migration (Self-hosted → Cloud)

Existing self-hosted data has no `userId`. Options:

1. **Leave it**: If you start fresh on the public version, no migration needed
2. **Assign to first user**: A one-time migration script assigns all existing tasks to the first registered user's `userId`
3. **Export/import**: A future export feature lets users download their data as JSON and re-import it

For now, option 1 is fine — the self-hosted and cloud deployments are independent.

---

## Implementation Order

1. **Prisma schema** — Add `User` model + nullable `userId` on `Task`, run migration
2. **Auth routes + Passport setup** — GitHub OAuth only first (faster to test), then add Google
3. **Auth middleware** — `requireAuth` with `SELF_HOSTED` bypass
4. **TaskService scoping** — Add `userId` param, update all `where` clauses
5. **Frontend AuthContext** — Token storage, hash parsing, `/api/auth/me` call
6. **Frontend API client** — Add `Authorization` header
7. **Login view** — OAuth buttons, redirect flow
8. **User avatar/logout in header**
9. **Vite config** — `base` path for GitHub Pages
10. **GitHub Actions workflow** — Frontend CI/CD to `gh-pages`
11. **Railway setup** — Connect repo, set env vars, deploy
12. **OAuth app registration** — GitHub + Google credentials
13. **End-to-end test** — Full OAuth flow on Railway + GitHub Pages

---

## What Stays the Same

- All existing Express routes, controllers, services, and Zod validation schemas need only minimal changes
- Prisma client usage stays the same — just adding `where: { userId }` to task queries
- The frontend task management UI is completely unchanged
- Docker/self-hosted setup continues to work exactly as-is with `SELF_HOSTED=true`
