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
| 1 | **Hardcoded Session Secret Fallback** — `"DSAI"` used when `SECRETKEY` env var is missing, allowing session forgery | `backend/app.js:21` | ✅ Fixed — App now exits on startup if `SECRETKEY` is not set |
| 2 | **Insecure Session Cookie Config** — `secure: false` always, missing `httpOnly` and `sameSite` flags | `backend/app.js:24-26` | ✅ Fixed — Added `httpOnly: true`, `sameSite: 'lax'`, `secure` based on `NODE_ENV` |
| 3 | **Mass Assignment Vulnerability** — `editProject` passes raw `req.body` to `findByIdAndUpdate`, allowing attackers to modify `owner`, `votes`, `chats`, and other protected fields | `backend/controllers/projectController.js:31` | ✅ Fixed — Whitelisted allowed fields: `name`, `description`, `visibility` |

### 🟡 Medium Severity

| # | Finding | Location | Status |
|---|---------|----------|--------|
| 4 | **CORS Configuration** — Fallback to `localhost:3000`, methods as comma-separated string | `backend/app.js:36-42` | ✅ Fixed — Methods as array, `optionsSuccessStatus: 200` added |
| 5 | **Undeclared Global Variable** — `obj = JSON.parse(...)` without `const/let` leaks to global scope | `backend/controllers/chatController.js:137` | ✅ Fixed — Added `const` |
| 6 | **Silent Error Handling** — Chat controller catch block logs error but never sends response, causing client to hang | `backend/controllers/chatController.js:194-196` | ✅ Fixed — Returns `500` with generic error message |
| 7 | **Improper Auth Response** — Unauthenticated chat requests return `200` with error in body instead of `401` | `backend/controllers/chatController.js:198-200` | ✅ Fixed — Returns `401` status |
| 8 | **No Input Validation** — `addProject`, `editProject`, `voteProject` destructure `req.body` without type/presence validation | `backend/controllers/projectController.js` | ⚠️ Deferred — Follow-up issue filed for `express-validator` integration |
| 9 | **Unprotected Routes** — Project CRUD routes lack authentication middleware | `backend/routers/projectRoutes.js` | ⚠️ Deferred — Follow-up issue filed |
| 10 | **Unauthenticated User Search** — `/search` endpoint exposes all users' `_id`, `name`, and `email` without auth | `backend/app.js:56-65` | ✅ Fixed — Added auth check, removed `email` from projection |

### 🟢 Low Severity

| # | Finding | Location | Status |
|---|---------|----------|--------|
| 11 | **Secrets Template in README** — `.env` format shown with placeholder keys (acceptable, no real secrets) | `README.md:119-141` | ℹ️ Acceptable — Verified no real keys in git history |
| 12 | **Missing `.env.example`** — No template files for environment configuration | Backend + Frontend | ✅ Fixed — Created `backend/.env.example` and `frontend/.env.example` |
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
# Verify no .env files are tracked in git
git ls-files | grep -i '\.env' | grep -v '\.example'

# Verify no secrets in demo build output
grep -r "localhost\|API_KEY\|SECRET\|MONGODB\|CLAUDE\|GOOGLE_CLIENT" demo/dist/

# Verify session config
grep -A 10 "session(" backend/app.js
```
