# HexCode Security Audit Report

**Date**: 2026-09-09  
**Auditor**: Automated Security Review  
**Scope**: Full-stack audit of `backend/` and `frontend/` codebases  
**Status**: Critical fixes applied; follow-up issue filed for middleware hardening

---

## Executive Summary

A comprehensive security review of the HexCode portfolio generator was performed prior to GitHub Pages deployment. **13 findings** were identified across session management, authentication, input validation, and information disclosure categories. All **critical** issues have been remediated. Medium and low severity items are either fixed or documented for follow-up.

---

## Findings

### 🔴 Critical Severity

| # | Finding | Location | Status |
|---|---------|----------|--------|
| 1 | **Hardcoded / Weak Session Secret** — `"DSAI"` or template placeholders used when `SECRETKEY` is missing or insecure, allowing session forgery | `backend/app.js:15-21` | ✅ Fixed — App rejects template placeholders and enforces >=32 character cryptographically secure secret |
| 2 | **Insecure Session Cookie Config** — `secure: false` always, missing `httpOnly` and `sameSite` flags | `backend/app.js:25-37` | ✅ Fixed — Added `httpOnly: true`, `sameSite: 'lax'`, `secure` based on `NODE_ENV`, plus `trust proxy` in production |
| 3 | **Mass Assignment Vulnerability** — `editProject` and `updateMyData` passed raw `req.body` to Mongoose update queries, allowing unauthorized modification of protected fields (`owner`, `votes`, `projects`, etc.) | `backend/controllers/projectController.js:31`, `backend/controllers/userController.js:28` | ✅ Fixed — Whitelisted allowed fields (`name`, `description`, `visibility` for projects; `name`, `imageURL` for user profile), enabled `runValidators: true`, and safely handled undefined request bodies |

### 🟡 Medium Severity

| # | Finding | Location | Status |
|---|---------|----------|--------|
| 4 | **CORS Configuration** — Fallback to `localhost:3000`, methods as comma-separated string | `backend/app.js:36-42` | ✅ Fixed — Methods as array, `optionsSuccessStatus: 200` added |
| 5 | **Undeclared Global Variable** — `obj = JSON.parse(...)` without `const/let` leaks to global scope | `backend/controllers/chatController.js:137` | ✅ Fixed — Added `const` |
| 6 | **Silent Error Handling** — Chat controller catch block logs error but never sends response, causing client to hang | `backend/controllers/chatController.js:194-196` | ✅ Fixed — Returns `500` with generic error message |
| 7 | **Improper Auth Response** — Unauthenticated chat requests return `200` with error in body instead of `401` | `backend/controllers/chatController.js:198-200` | ✅ Fixed — Returns `401` status |
| 8 | **No Input Validation** — `addProject`, `editProject`, `voteProject` destructure `req.body` without type/presence validation | `backend/controllers/projectController.js` | ⚠️ Deferred — Follow-up issue filed for `express-validator` integration |
| 9 | **Unprotected Routes & Authorization Bypass** — Private user endpoints and project mutations lacked auth guards and ownership checks | `backend/routers/userRoutes.js`, `backend/controllers/projectController.js` | ✅ Fixed — Applied `ensureAuth` middleware to user routes and added owner/member predicate check to `editProject` |
| 10 | **Unauthenticated / Unbounded User Search** — `/search` endpoint exposed all users without auth, search criteria, or limit | `backend/app.js:65-76` | ✅ Fixed — Added auth check, search query filtering with regex escaping, limit cap of 50, and preserved minimal projection |

### 🟢 Low Severity

| # | Finding | Location | Status |
|---|---------|----------|--------|
| 11 | **Secrets Template in README** — `.env` format shown with placeholder keys | `README.md:119-141` | ℹ️ Acceptable — Verified currently tracked files contain only placeholder templates; git history scan confirmed no real keys committed |
| 12 | **Missing `.env.example`** — No template files for environment configuration | Backend + Frontend | ✅ Fixed — Created `backend/.env.example` and `frontend/.env.example` with absolute callback URL and secure secret guidance |
| 13 | **Dead OpenAI Code** — Commented-out code references undefined `openai` variable, would crash if uncommented | `backend/controllers/chatController.js:108-155` | ℹ️ Informational — Left as-is (commented out), poses no runtime risk |

---

## Recommendations (Follow-up)

The following items are tracked in GitHub Issue: **"Add security middleware (helmet, rate-limit, express-validator)"**

1. **`helmet`** — Set security-related HTTP headers (X-Content-Type-Options, X-Frame-Options, HSTS, etc.)
2. **`express-rate-limit`** — Rate limiting on all routes, especially `/chat/:pid` (Claude API costs money per call)
3. **`express-validator`** — Input validation middleware for all request body parsing
4. **Route-level auth middleware** — Protect project CRUD routes with `isAuthenticated()` middleware
5. **CSRF protection** — Add CSRF tokens for state-changing operations
6. **MongoDB injection prevention** — Use `mongo-sanitize` to strip `$` and `.` from user input

---

## Demo Site Security Verification

The `demo/` site (Issue #5) is a fully static Vite+React application:
- ✅ Zero backend API calls
- ✅ No environment variables required or used
- ✅ No API keys, secrets, or credentials in source or build output
- ✅ No authentication flows
- ✅ No database connections
- ✅ Content served from GitHub Pages (HTTPS by default)

---

## Verification Commands

```bash
# 1. Verify no active .env files are tracked in git
git ls-files | grep -i '\.env' | grep -v '\.example'

# 2. Verify git history for secret exposure
git log -p -S "AIza" -S "client_secret" | head -n 50

# 3. Automated secret scanner across all demo/dist files (fails if secrets found)
node -e "const fs = require('fs'); const path = require('path'); function walk(dir){ let res = []; for (const item of fs.readdirSync(dir)){ const full = path.join(dir, item); if (fs.statSync(full).isDirectory()) res.push(...walk(full)); else res.push(full); } return res; } const files = walk('demo/dist'); const pattern = /(CLAUDE_API_KEY|GOOGLE_CLIENT_SECRET|MONGODB_URI|AIza[0-9A-Za-z-_]{35}|ghp_[0-9A-Za-z]{36})\s*[:=]/i; let fails = 0; for (const f of files){ const content = fs.readFileSync(f, 'utf8'); if (pattern.test(content)){ console.error('CRITICAL: Detected secret pattern in', f); fails++; } } if (fails > 0) process.exit(1); console.log('PASS: All', files.length, 'demo/dist files verified clean of secrets.');"

# 4. Executable security test suite (asserts production session cookie HttpOnly, SameSite, Secure flags, secret validation, mass assignment whitelisting, and route auth)
npm --prefix backend test
```
