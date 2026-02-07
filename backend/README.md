# Pristine Hospital Backend (Auth & Identity)

This folder contains a minimal NestJS authentication and identity module aligned to the Pristine Hospital schema.

Quick start:

1. Copy `.env.example` to `.env` and update values.
2. Install dependencies:

```bash
npm install
```

3. Start in development:

```bash
npm run start:dev
```

Security notes:
- JWT access tokens signed with `JWT_SECRET`.
- Refresh tokens are rotated and stored as a SHA-256 hash in `user_sessions`.
- All sensitive actions are recorded to `audit_logs`.
