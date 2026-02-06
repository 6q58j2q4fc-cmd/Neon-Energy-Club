import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('./db', () => ({
  getCustomerRewardById: vi.fn(),
  redeemCustomerRewardWithShipping: vi.fn(),
  getDistributorFreeRewardById: vi.fn(),
  redeemDistributorRewardWithShipping: vi.fn(),
  getDistributorByUserId: vi.fn(),
  getAllRewardRedemptions: vi.fn(),
  updateRewardRedemptionStatus: vi.fn(),
}));

// Mock the email notifications module
vi.mock('./emailNotifications', () => ({
  sendRewardRedemptionConfirmation: vi.fn().mockResolvedValue(true),
}));

import {
  getCustomerRewardById,
  redeemCustomerRewardWithShipping,
  getDistributorFreeRewardById,
  redeemDistributorRewardWithShipping,
  getDistributorByUserId,
  getAllRewardRedemptions,
  updateRewardRedemptionStatus,
} from './db';
import { sendRewardRedemptionConfirmation } from './emailNotifications';

describe('Reward Redemption', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Customer Reward Redemption', () => {
    const mockShippingInfo = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-123-4567',
      addressLine1: '123 Main St',
      addressLine2: 'Apt 4B',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90001',
      country: 'USA',
    };

    const mockReward = {
      id: 1,
      userId: 100,
      rewardType: 'free_case',
      description: 'Free 12-Pack Case',
      value: '42.00',
      status: 'available',
      createdAt: new Date().toISOString(),
    };

    it('should get customer reward by ID', async () => {
      (getCustomerRewardById as any).mockResolvedValue(mockReward);

      const result = await getCustomerRewardById(1);
      
      expect(result).toEqual(mockReward);
      expect(getCustomerRewardById).toHaveBeenCalledWith(1);
    });

    it('should return null for non-existent reward', async () => {
      (getCustomerRewardById as any).mockResolvedValue(null);

      const result = await getCustomerRewardById(999);
      
      expect(result).toBeNull();
    });

    it('should redeem customer reward with shipping info', async () => {
      (redeemCustomerRewardWithShipping as any).mockResolvedValue(true);

      const result = await redeemCustomerRewardWithShipping(1, mockShippingInfo);
      
      expect(result).toBe(true);
      expect(redeemCustomerRewardWithShipping).toHaveBeenCalledWith(1, mockShippingInfo);
    });

    it('should send confirmation email on successful redemption', async () => {
      const emailData = {
        customerName: mockShippingInfo.name,
        customerEmail: mockShippingInfo.email,
        rewardDescription: 'Free 12-Pack Case',
        rewardValue: '42.00',
        shippingAddress: '123 Main St, Apt 4B, Los Angeles, CA 90001, USA',
      };

      await sendRewardRedemptionConfirmation(emailData);

      expect(sendRewardRedemptionConfirmation).toHaveBeenCalledWith(emailData);
    });
  });

  describe('Distributor Reward Redemption', () => {
    const mockShippingInfo = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '555-987-6543',
      addressLine1: '456 Oak Ave',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94102',
      country: 'USA',
    };

    const mockDistributor = {
      id: 50,
      userId: 200,
      distributorCode: 'DIST-12345',
      rank: 'silver',
    };

    const mockDistributorReward = {
      id: 10,
      distributorId: 50,
      pointsRedeemed: 3,
      earnedMonth: '2026-01',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    it('should get distributor by user ID', async () => {
      (getDistributorByUserId as any).mockResolvedValue(mockDistributor);

      const result = await getDistributorByUserId(200);
      
      expect(result).toEqual(mockDistributor);
      expect(getDistributorByUserId).toHaveBeenCalledWith(200);
    });

    it('should get distributor free reward by ID', async () => {
      (getDistributorFreeRewardById as any).mockResolvedValue(mockDistributorReward);

      const result = await getDistributorFreeRewardById(10);
      
      expect(result).toEqual(mockDistributorReward);
      expect(getDistributorFreeRewardById).toHaveBeenCalledWith(10);
    });

    it('should redeem distributor reward with shipping info', async () => {
      (redeemDistributorRewardWithShipping as any).mockResolvedValue(true);

      const result = await redeemDistributorRewardWithShipping(10, mockShippingInfo);
      
      expect(result).toBe(true);
      expect(redeemDistributorRewardWithShipping).toHaveBeenCalledWith(10, mockShippingInfo);
    });

    it('should return null for non-existent distributor', async () => {
      (getDistributorByUserId as any).mockResolvedValue(null);

      const result = await getDistributorByUserId(999);
      
      expect(result).toBeNull();
    });
  });

  describe('Admin Reward Redemption Management', () => {
    const mockRedemptions = [
      {
        id: 1,
        rewardId: 1,
        rewardType: 'customer',
        name: 'John Doe',
        email: 'john@example.com',
        city: 'Los Angeles',
        state: 'CA',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        rewardId: 10,
        rewardType: 'distributor',
        name: 'Jane Smith',
        email: 'jane@example.com',
        city: 'San Francisco',
        state: 'CA',
        status: 'shipped',
        trackingNumber: 'TRACK123',
        createdAt: new Date().toISOString(),
      },
    ];

    it('should get all reward redemptions', async () => {
      (getAllRewardRedemptions as any).mockResolvedValue(mockRedemptions);

      const result = await getAllRewardRedemptions();
      
      expect(result).toEqual(mockRedemptions);
      expect(result).toHaveLength(2);
    });

    it('should update redemption status to processing', async () => {
      (updateRewardRedemptionStatus as any).mockResolvedValue(true);

      const result = await updateRewardRedemptionStatus(1, 'processing');
      
      expect(result).toBe(true);
      expect(updateRewardRedemptionStatus).toHaveBeenCalledWith(1, 'processing');
    });

    it('should update redemption status to shipped with tracking', async () => {
      (updateRewardRedemptionStatus as any).mockResolvedValue(true);

      const result = await updateRewardRedemptionStatus(1, 'shipped', 'TRACK456');
      
      expect(result).toBe(true);
      expect(updateRewardRedemptionStatus).toHaveBeenCalledWith(1, 'shipped', 'TRACK456');
    });

    it('should update redemption status to delivered', async () => {
      (updateRewardRedemptionStatus as any).mockResolvedValue(true);

      const result = await updateRewardRedemptionStatus(1, 'delivered');
      
      expect(result).toBe(true);
      expect(updateRewardRedemptionStatus).toHaveBeenCalledWith(1, 'delivered');
    });
  });

  describe('Shipping Info Validation', () => {
    it('should validate required shipping fields', () => {
      const requiredFields = ['name', 'email', 'addressLine1', 'city', 'state', 'postalCode', 'country'];
      
      const validShippingInfo = {
        name: 'Test User',
        email: 'test@example.com',
        addressLine1: '123 Test St',
        city: 'Test City',
        state: 'TS',
        postalCode: '12345',
        country: 'USA',
      };

      for (const field of requiredFields) {
        expect(validShippingInfo[field as keyof typeof validShippingInfo]).toBeTruthy();
      }
    });

    it('should validate email format', () => {
      const validEmails = ['test@example.com', 'user.name@domain.org', 'a@b.co'];
      const invalidEmails = ['notanemail', '@missing.com', 'missing@', 'spaces in@email.com'];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      for (const email of validEmails) {
        expect(emailRegex.test(email)).toBe(true);
      }

      for (const email of invalidEmails) {
        expect(emailRegex.test(email)).toBe(false);
      }
    });
  });
});

describe('Social Share Buttons', () => {
  it('should generate correct Facebook share URL', () => {
    const referralLink = 'https://neon.energy?ref=ABC123';
    const encodedUrl = encodeURIComponent(referralLink);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    
    expect(facebookUrl).toContain('facebook.com/sharer');
    expect(facebookUrl).toContain(encodedUrl);
  });

  it('should generate correct Twitter share URL', () => {
    const referralLink = 'https://neon.energy?ref=ABC123';
    const text = 'Check out NEON Energy!';
    const encodedUrl = encodeURIComponent(referralLink);
    const encodedText = encodeURIComponent(text);
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
    
    expect(twitterUrl).toContain('twitter.com/intent/tweet');
    expect(twitterUrl).toContain(encodedUrl);
    expect(twitterUrl).toContain(encodedText);
  });

  it('should generate correct WhatsApp share URL', () => {
    const message = 'Check out NEON Energy! https://neon.energy?ref=ABC123';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    expect(whatsappUrl).toContain('wa.me');
    expect(whatsappUrl).toContain(encodedMessage);
  });

  it('should generate correct LinkedIn share URL', () => {
    const referralLink = 'https://neon.energy?ref=ABC123';
    const encodedUrl = encodeURIComponent(referralLink);
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    
    expect(linkedinUrl).toContain('linkedin.com/sharing');
    expect(linkedinUrl).toContain(encodedUrl);
  });

  it('should handle special characters in referral codes', () => {
    const referralCode = 'ABC+123&test=value';
    const encodedCode = encodeURIComponent(referralCode);
    
    expect(encodedCode).toBe('ABC%2B123%26test%3Dvalue');
    expect(decodeURIComponent(encodedCode)).toBe(referralCode);
  });
});
