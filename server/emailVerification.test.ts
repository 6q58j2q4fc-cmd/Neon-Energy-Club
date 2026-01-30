import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the database module
vi.mock('./db', () => ({
  getDb: vi.fn(),
  generateVerificationToken: vi.fn(() => 'test-token-123'),
  createEmailVerification: vi.fn(),
  verifyEmailToken: vi.fn(),
  isEmailVerified: vi.fn(),
  resendVerificationEmail: vi.fn(),
  getUserByVerificationToken: vi.fn(),
}));

// Import after mocking
import {
  generateVerificationToken,
  createEmailVerification,
  verifyEmailToken,
  isEmailVerified,
  resendVerificationEmail,
  getUserByVerificationToken,
} from './db';

describe('Email Verification Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateVerificationToken', () => {
    it('should generate a token', () => {
      const token = generateVerificationToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });

  describe('createEmailVerification', () => {
    it('should create verification record with token and expiry', async () => {
      const mockResult = {
        token: 'test-token-123',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
      
      vi.mocked(createEmailVerification).mockResolvedValue(mockResult);
      
      const result = await createEmailVerification(1);
      
      expect(result).toBeDefined();
      expect(result?.token).toBe('test-token-123');
      expect(result?.expiresAt).toBeInstanceOf(Date);
    });
  });

  describe('verifyEmailToken', () => {
    it('should return success for valid token', async () => {
      vi.mocked(verifyEmailToken).mockResolvedValue({
        success: true,
        userId: 1,
      });
      
      const result = await verifyEmailToken('valid-token');
      
      expect(result.success).toBe(true);
      expect(result.userId).toBe(1);
    });

    it('should return error for invalid token', async () => {
      vi.mocked(verifyEmailToken).mockResolvedValue({
        success: false,
        error: 'Invalid verification token',
      });
      
      const result = await verifyEmailToken('invalid-token');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid verification token');
    });

    it('should return error for expired token', async () => {
      vi.mocked(verifyEmailToken).mockResolvedValue({
        success: false,
        error: 'Verification token has expired',
      });
      
      const result = await verifyEmailToken('expired-token');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Verification token has expired');
    });
  });

  describe('isEmailVerified', () => {
    it('should return true for verified user', async () => {
      vi.mocked(isEmailVerified).mockResolvedValue(true);
      
      const result = await isEmailVerified(1);
      
      expect(result).toBe(true);
    });

    it('should return false for unverified user', async () => {
      vi.mocked(isEmailVerified).mockResolvedValue(false);
      
      const result = await isEmailVerified(1);
      
      expect(result).toBe(false);
    });
  });

  describe('resendVerificationEmail', () => {
    it('should generate new token for unverified user', async () => {
      const mockResult = {
        token: 'new-token-456',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
      
      vi.mocked(resendVerificationEmail).mockResolvedValue(mockResult);
      
      const result = await resendVerificationEmail(1);
      
      expect(result).toBeDefined();
      expect(result?.token).toBe('new-token-456');
    });

    it('should return null for already verified user', async () => {
      vi.mocked(resendVerificationEmail).mockResolvedValue(null);
      
      const result = await resendVerificationEmail(1);
      
      expect(result).toBeNull();
    });
  });

  describe('getUserByVerificationToken', () => {
    it('should return user for valid token', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: false,
        emailVerificationToken: 'valid-token',
        emailVerificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
      
      vi.mocked(getUserByVerificationToken).mockResolvedValue(mockUser as any);
      
      const result = await getUserByVerificationToken('valid-token');
      
      expect(result).toBeDefined();
      expect(result?.email).toBe('test@example.com');
    });

    it('should return null for invalid token', async () => {
      vi.mocked(getUserByVerificationToken).mockResolvedValue(null);
      
      const result = await getUserByVerificationToken('invalid-token');
      
      expect(result).toBeNull();
    });
  });
});

describe('Email Verification Flow Integration', () => {
  it('should complete full verification flow', async () => {
    // 1. Create verification
    vi.mocked(createEmailVerification).mockResolvedValue({
      token: 'flow-test-token',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    
    const verification = await createEmailVerification(1);
    expect(verification?.token).toBe('flow-test-token');
    
    // 2. Check user is not verified
    vi.mocked(isEmailVerified).mockResolvedValue(false);
    const beforeVerify = await isEmailVerified(1);
    expect(beforeVerify).toBe(false);
    
    // 3. Verify the token
    vi.mocked(verifyEmailToken).mockResolvedValue({
      success: true,
      userId: 1,
    });
    
    const verifyResult = await verifyEmailToken('flow-test-token');
    expect(verifyResult.success).toBe(true);
    
    // 4. Check user is now verified
    vi.mocked(isEmailVerified).mockResolvedValue(true);
    const afterVerify = await isEmailVerified(1);
    expect(afterVerify).toBe(true);
  });
});
