import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sanitizeInput, detectSQLInjection, generateCSRFToken, validateCSRFToken } from './security';

describe('Security Module', () => {
  describe('sanitizeInput', () => {
    it('should sanitize XSS script tags', () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const sanitized = sanitizeInput(maliciousInput);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
    });

    it('should sanitize javascript: protocol', () => {
      const maliciousInput = 'javascript:alert(1)';
      const sanitized = sanitizeInput(maliciousInput);
      expect(sanitized).not.toContain('javascript:');
    });

    it('should sanitize event handlers', () => {
      const maliciousInput = '<img onerror="alert(1)">';
      const sanitized = sanitizeInput(maliciousInput);
      expect(sanitized).not.toContain('onerror=');
    });

    it('should encode HTML special characters', () => {
      const input = '<div class="test">&</div>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toContain('&lt;');
      expect(sanitized).toContain('&gt;');
      expect(sanitized).toContain('&amp;');
      expect(sanitized).toContain('&quot;');
    });

    it('should handle nested objects', () => {
      const input = {
        name: '<script>alert(1)</script>',
        nested: {
          value: 'javascript:void(0)',
        },
      };
      const sanitized = sanitizeInput(input);
      expect(sanitized.name).not.toContain('<script>');
      expect(sanitized.nested.value).not.toContain('javascript:');
    });

    it('should handle arrays', () => {
      const input = ['<script>alert(1)</script>', 'normal text'];
      const sanitized = sanitizeInput(input);
      expect(sanitized[0]).not.toContain('<script>');
      expect(sanitized[1]).toContain('normal text');
    });

    it('should preserve safe strings', () => {
      const safeInput = 'Hello World 123';
      const sanitized = sanitizeInput(safeInput);
      expect(sanitized).toBe('Hello World 123');
    });
  });

  describe('detectSQLInjection', () => {
    it('should detect SELECT injection', () => {
      expect(detectSQLInjection('SELECT * FROM users')).toBe(true);
    });

    it('should detect DROP injection', () => {
      // DROP is detected as part of the SQL keywords pattern
      expect(detectSQLInjection('DROP TABLE users;')).toBe(true);
    });

    it('should detect UNION injection', () => {
      expect(detectSQLInjection('1 UNION SELECT password FROM users')).toBe(true);
    });

    it('should detect comment-based injection', () => {
      expect(detectSQLInjection("admin'--")).toBe(true);
    });

    it('should detect OR-based injection', () => {
      expect(detectSQLInjection("' OR 1=1")).toBe(true);
    });

    it('should not flag normal text', () => {
      expect(detectSQLInjection('Hello World')).toBe(false);
    });

    it('should not flag normal email', () => {
      expect(detectSQLInjection('user@example.com')).toBe(false);
    });
  });

  describe('CSRF Token', () => {
    it('should generate unique tokens', () => {
      const token1 = generateCSRFToken('session1');
      const token2 = generateCSRFToken('session2');
      expect(token1).not.toBe(token2);
    });

    it('should validate correct token', () => {
      const sessionId = 'test-session';
      const token = generateCSRFToken(sessionId);
      expect(validateCSRFToken(sessionId, token)).toBe(true);
    });

    it('should reject invalid token', () => {
      const sessionId = 'test-session';
      generateCSRFToken(sessionId);
      expect(validateCSRFToken(sessionId, 'invalid-token')).toBe(false);
    });

    it('should reject token for wrong session', () => {
      const token = generateCSRFToken('session1');
      expect(validateCSRFToken('session2', token)).toBe(false);
    });
  });
});
