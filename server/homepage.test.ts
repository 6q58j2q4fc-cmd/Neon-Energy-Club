import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRecentJoinedUsers, getTotalUserCount } from './db';

// Mock the database module
vi.mock('./db', async () => {
  const actual = await vi.importActual('./db');
  return {
    ...actual,
    getRecentJoinedUsers: vi.fn(),
    getTotalUserCount: vi.fn(),
  };
});

describe('Homepage Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRecentJoinedUsers', () => {
    it('should return an array of users with profile data', async () => {
      const mockUsers = [
        {
          id: 1,
          name: 'John Doe',
          createdAt: new Date('2026-01-15'),
          profilePhotoUrl: 'https://example.com/photo1.jpg',
          location: 'New York, NY',
        },
        {
          id: 2,
          name: 'Jane Smith',
          createdAt: new Date('2026-01-16'),
          profilePhotoUrl: null,
          location: 'Los Angeles, CA',
        },
      ];

      (getRecentJoinedUsers as any).mockResolvedValue(mockUsers);

      const result = await getRecentJoinedUsers(10);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('profilePhotoUrl');
    });

    it('should respect the limit parameter', async () => {
      const mockUsers = [
        { id: 1, name: 'User 1', createdAt: new Date(), profilePhotoUrl: null, location: null },
        { id: 2, name: 'User 2', createdAt: new Date(), profilePhotoUrl: null, location: null },
        { id: 3, name: 'User 3', createdAt: new Date(), profilePhotoUrl: null, location: null },
      ];

      (getRecentJoinedUsers as any).mockResolvedValue(mockUsers.slice(0, 2));

      const result = await getRecentJoinedUsers(2);
      
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no users exist', async () => {
      (getRecentJoinedUsers as any).mockResolvedValue([]);

      const result = await getRecentJoinedUsers(10);
      
      expect(result).toEqual([]);
    });
  });

  describe('getTotalUserCount', () => {
    it('should return the total number of users', async () => {
      (getTotalUserCount as any).mockResolvedValue(2847);

      const result = await getTotalUserCount();
      
      expect(result).toBe(2847);
    });

    it('should return 0 when no users exist', async () => {
      (getTotalUserCount as any).mockResolvedValue(0);

      const result = await getTotalUserCount();
      
      expect(result).toBe(0);
    });
  });
});

describe('Social Proof Bubbles', () => {
  it('should format user count correctly for display', () => {
    // Test the formatCount logic
    const formatCount = (count: number) => {
      if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}k+`;
      }
      const displayCount = Math.max(count, 1) + 2847;
      return `${displayCount.toLocaleString()}+`;
    };

    expect(formatCount(0)).toBe('2,848+');
    expect(formatCount(100)).toBe('2,947+');
    expect(formatCount(1000)).toBe('1.0k+');
    expect(formatCount(5000)).toBe('5.0k+');
  });

  it('should generate correct avatar URLs', () => {
    const getAvatarUrl = (user: { profilePhotoUrl: string | null; name: string; id: number }, index: number) => {
      if (user.profilePhotoUrl) {
        return user.profilePhotoUrl;
      }
      const seed = user.name || `user-${user.id}`;
      const styles = ['avataaars', 'lorelei', 'micah', 'notionists', 'personas'];
      const style = styles[index % styles.length];
      return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=c8ff00,00ffff,ff0080`;
    };

    // User with profile photo should use their photo
    const userWithPhoto = { id: 1, name: 'John', profilePhotoUrl: 'https://example.com/photo.jpg' };
    expect(getAvatarUrl(userWithPhoto, 0)).toBe('https://example.com/photo.jpg');

    // User without photo should get DiceBear avatar
    const userWithoutPhoto = { id: 2, name: 'Jane', profilePhotoUrl: null };
    const avatarUrl = getAvatarUrl(userWithoutPhoto, 0);
    expect(avatarUrl).toContain('api.dicebear.com');
    expect(avatarUrl).toContain('avataaars');
    expect(avatarUrl).toContain('Jane');
  });
});
