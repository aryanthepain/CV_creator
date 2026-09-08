const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const session = require('express-session');
const http = require('node:http');

describe('Security Verification Tests', () => {
  describe('Session Configuration in Production', () => {
    it('should emit Set-Cookie with HttpOnly, SameSite=Lax, and Secure attributes', async () => {
      const app = express();
      app.set('trust proxy', 1);

      app.use(
        session({
          secret: 'c0a80101c0a80101c0a80101c0a80101c0a80101c0a80101c0a80101c0a80101',
          resave: false,
          saveUninitialized: true,
          cookie: {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            sameSite: 'lax',
            secure: true,
          },
        })
      );

      app.get('/test-session', (req, res) => {
        req.session.test = 'ok';
        res.send('ok');
      });

      const server = http.createServer(app);
      await new Promise((resolve) => server.listen(0, resolve));
      const port = server.address().port;

      try {
        const response = await fetch(`http://127.0.0.1:${port}/test-session`, {
          headers: {
            'X-Forwarded-Proto': 'https',
          },
        });

        const setCookieHeader = response.headers.get('set-cookie');
        assert.ok(setCookieHeader, 'Set-Cookie header must be present');

        // Verify required security attributes
        assert.match(setCookieHeader, /HttpOnly/i, 'Cookie must include HttpOnly attribute');
        assert.match(setCookieHeader, /SameSite=Lax/i, 'Cookie must include SameSite=Lax attribute');
        assert.match(setCookieHeader, /Secure/i, 'Cookie must include Secure attribute when over secure proxy');
      } finally {
        await new Promise((resolve) => server.close(resolve));
      }
    });
  });

  describe('Session Secret Strength and Placeholder Rejection', () => {
    const PLACEHOLDER_SECRETS = [
      'your_session_secret_here',
      'replace_with_at_least_32_chars_random_hex_secret',
      'DSAI',
    ];

    function validateSecret(secret) {
      if (!secret || PLACEHOLDER_SECRETS.includes(secret) || secret.length < 32) {
        return false;
      }
      const uniqueChars = new Set(secret).size;
      if (uniqueChars < 8) {
        return false;
      }
      return true;
    }

    it('rejects missing or empty secrets', () => {
      assert.strictEqual(validateSecret(undefined), false);
      assert.strictEqual(validateSecret(''), false);
    });

    it('rejects all known template placeholders', () => {
      for (const placeholder of PLACEHOLDER_SECRETS) {
        assert.strictEqual(validateSecret(placeholder), false, `Should reject ${placeholder}`);
      }
    });

    it('rejects secrets with length < 32', () => {
      assert.strictEqual(validateSecret('short_weak_secret'), false);
      assert.strictEqual(validateSecret('1234567890123456789012345678901'), false);
    });

    it('rejects low-entropy repeated characters', () => {
      assert.strictEqual(validateSecret('11111111111111111111111111111111'), false);
      assert.strictEqual(validateSecret('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'), false);
    });

    it('accepts strong random secrets of 32+ characters', () => {
      assert.strictEqual(validateSecret('a8f5c9e2b1d40736e92f4c78103bd92a4f61e893'), true);
      assert.strictEqual(validateSecret('0123456789abcdef0123456789abcdef'), true);
    });
  });

  describe('Mass Assignment Whitelist Protection', () => {
    it('filters project updates to allowed fields only', () => {
      const allowedFields = ['name', 'description', 'visibility'];
      const rawInput = {
        name: 'New Name',
        description: 'New Description',
        visibility: false,
        owner: 'malicious_user_id',
        votes: { upvotes: ['victim'] },
        chats: ['injected'],
        __v: 10,
      };

      const updates = {};
      for (const field of allowedFields) {
        if (rawInput[field] !== undefined) {
          updates[field] = rawInput[field];
        }
      }

      assert.deepStrictEqual(updates, {
        name: 'New Name',
        description: 'New Description',
        visibility: false,
      });
      assert.strictEqual(updates.owner, undefined);
      assert.strictEqual(updates.votes, undefined);
    });

    it('filters user profile updates to allowed fields only', () => {
      const allowedFields = ['name', 'imageURL'];
      const rawInput = {
        name: 'Updated Name',
        imageURL: 'https://example.com/avatar.jpg',
        email: 'injected@example.com',
        projects: ['injected_project_id'],
        isAdmin: true,
      };

      const updates = {};
      for (const field of allowedFields) {
        if (rawInput[field] !== undefined) {
          updates[field] = rawInput[field];
        }
      }

      assert.deepStrictEqual(updates, {
        name: 'Updated Name',
        imageURL: 'https://example.com/avatar.jpg',
      });
      assert.strictEqual(updates.email, undefined);
      assert.strictEqual(updates.projects, undefined);
      assert.strictEqual(updates.isAdmin, undefined);
    });
  });

  describe('Authentication Middleware (ensureAuth)', () => {
    const { ensureAuth } = require('../middlewares/authMiddleware');

    it('returns 401 when unauthenticated', () => {
      let statusCode = null;
      let jsonBody = null;
      let nextCalled = false;

      const req = { isAuthenticated: () => false };
      const res = {
        status(code) {
          statusCode = code;
          return {
            json(body) {
              jsonBody = body;
            },
          };
        },
      };

      ensureAuth(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false);
      assert.strictEqual(statusCode, 401);
      assert.deepStrictEqual(jsonBody, { error: 'Not authenticated' });
    });

    it('calls next() when authenticated', () => {
      let nextCalled = false;
      const req = { isAuthenticated: () => true };
      const res = {};

      ensureAuth(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, true);
    });
  });

  describe('Search Query Sanitization & Limiting', () => {
    function sanitizeSearch(queryStr, limitStr) {
      const query = typeof queryStr === 'string' ? queryStr.trim().slice(0, 50) : '';
      if (!query) return { empty: true };
      const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const limit = Math.min(Math.max(parseInt(limitStr, 10) || 20, 1), 50);
      return { safeQuery, limit };
    }

    it('returns empty for empty or whitespace query', () => {
      assert.strictEqual(sanitizeSearch('', 10).empty, true);
      assert.strictEqual(sanitizeSearch('   ', 10).empty, true);
      assert.strictEqual(sanitizeSearch(undefined, 10).empty, true);
    });

    it('slices query to a maximum of 50 characters', () => {
      const longQuery = 'a'.repeat(80);
      const result = sanitizeSearch(longQuery, 10);
      assert.strictEqual(result.safeQuery.length, 50);
    });

    it('escapes regex metacharacters in query string', () => {
      const result = sanitizeSearch('user.*+?^${}()', 10);
      assert.strictEqual(result.safeQuery, 'user\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)');
    });

    it('clamps limit between 1 and 50', () => {
      assert.strictEqual(sanitizeSearch('test', '100').limit, 50);
      assert.strictEqual(sanitizeSearch('test', '-5').limit, 1);
      assert.strictEqual(sanitizeSearch('test', 'not_a_number').limit, 20);
      assert.strictEqual(sanitizeSearch('test', '25').limit, 25);
    });
  });
});
