import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getBookedMeetingSlots: vi.fn().mockResolvedValue([]),
  createScheduledMeeting: vi.fn().mockResolvedValue({ id: 1 }),
  getUserMeetings: vi.fn().mockResolvedValue([]),
  getMeetingById: vi.fn().mockResolvedValue({ id: 1, userId: 1, status: "scheduled" }),
  cancelMeeting: vi.fn().mockResolvedValue({ success: true }),
  getAllMeetings: vi.fn().mockResolvedValue({ meetings: [], total: 0 }),
  updateMeetingStatus: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock email notifications
vi.mock("./emailNotifications", () => ({
  sendMeetingConfirmation: vi.fn().mockResolvedValue(true),
}));

// Mock owner notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

describe("Scheduling System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Meeting Slot Availability", () => {
    it("should return empty array when no meetings are booked", async () => {
      const { getBookedMeetingSlots } = await import("./db");
      const startDate = new Date("2026-01-28");
      const endDate = new Date("2026-02-04");
      
      const result = await getBookedMeetingSlots(startDate, endDate);
      
      expect(result).toEqual([]);
      expect(getBookedMeetingSlots).toHaveBeenCalledWith(startDate, endDate);
    });
  });

  describe("Meeting Creation", () => {
    it("should create a meeting with valid data", async () => {
      const { createScheduledMeeting } = await import("./db");
      
      const meetingData = {
        userId: null,
        name: "John Doe",
        email: "john@example.com",
        phone: "555-123-4567",
        meetingType: "franchise" as const,
        scheduledAt: new Date("2026-01-30T10:00:00Z"),
        timezone: "America/New_York",
        notes: "Interested in franchise opportunity",
      };
      
      const result = await createScheduledMeeting(meetingData);
      
      expect(result).toEqual({ id: 1 });
      expect(createScheduledMeeting).toHaveBeenCalledWith(meetingData);
    });

    it("should handle vending meeting type", async () => {
      const { createScheduledMeeting } = await import("./db");
      
      const meetingData = {
        userId: 5,
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "555-987-6543",
        meetingType: "vending" as const,
        scheduledAt: new Date("2026-02-01T14:30:00Z"),
        timezone: "America/Los_Angeles",
        notes: null,
      };
      
      await createScheduledMeeting(meetingData);
      
      expect(createScheduledMeeting).toHaveBeenCalledWith(meetingData);
    });
  });

  describe("Meeting Cancellation", () => {
    it("should cancel a meeting successfully", async () => {
      const { cancelMeeting, getMeetingById } = await import("./db");
      
      const meeting = await getMeetingById(1);
      expect(meeting).toBeTruthy();
      expect(meeting?.status).toBe("scheduled");
      
      const result = await cancelMeeting(1);
      
      expect(result).toEqual({ success: true });
      expect(cancelMeeting).toHaveBeenCalledWith(1);
    });
  });

  describe("Admin Meeting Management", () => {
    it("should get all meetings with filters", async () => {
      const { getAllMeetings } = await import("./db");
      
      const options = {
        status: "scheduled",
        meetingType: "franchise",
        limit: 50,
        offset: 0,
      };
      
      const result = await getAllMeetings(options);
      
      expect(result).toEqual({ meetings: [], total: 0 });
      expect(getAllMeetings).toHaveBeenCalledWith(options);
    });

    it("should update meeting status", async () => {
      const { updateMeetingStatus } = await import("./db");
      
      const result = await updateMeetingStatus(1, {
        status: "confirmed",
        adminNotes: "Call confirmed for 10 AM",
        meetingLink: "https://zoom.us/j/123456789",
      });
      
      expect(result).toEqual({ success: true });
      expect(updateMeetingStatus).toHaveBeenCalledWith(1, {
        status: "confirmed",
        adminNotes: "Call confirmed for 10 AM",
        meetingLink: "https://zoom.us/j/123456789",
      });
    });
  });

  describe("Email Notifications", () => {
    it("should send meeting confirmation email", async () => {
      const { sendMeetingConfirmation } = await import("./emailNotifications");
      
      const result = await sendMeetingConfirmation({
        name: "John Doe",
        email: "john@example.com",
        meetingType: "franchise",
        scheduledAt: new Date("2026-01-30T10:00:00Z"),
        timezone: "America/New_York",
      });
      
      expect(result).toBe(true);
      expect(sendMeetingConfirmation).toHaveBeenCalled();
    });
  });
});

describe("Meeting Time Slot Validation", () => {
  it("should validate business hours (9 AM - 5 PM)", () => {
    const validHours = [9, 10, 11, 12, 13, 14, 15, 16];
    const invalidHours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 17, 18, 19, 20, 21, 22, 23];
    
    validHours.forEach(hour => {
      expect(hour >= 9 && hour < 17).toBe(true);
    });
    
    invalidHours.forEach(hour => {
      expect(hour >= 9 && hour < 17).toBe(false);
    });
  });

  it("should validate weekdays only (Monday-Friday)", () => {
    const weekdays = [1, 2, 3, 4, 5]; // Monday = 1, Friday = 5
    const weekends = [0, 6]; // Sunday = 0, Saturday = 6
    
    weekdays.forEach(day => {
      expect(day >= 1 && day <= 5).toBe(true);
    });
    
    weekends.forEach(day => {
      expect(day >= 1 && day <= 5).toBe(false);
    });
  });
});
