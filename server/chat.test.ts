import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { Request, Response } from "express";

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: "Welcome to NEON Energy! How can I help you today?",
        },
      },
    ],
  }),
}));

describe("Chat Router", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let publicContext: TrpcContext;

  beforeEach(() => {
    mockReq = {
      headers: { origin: "http://localhost:3000" },
      cookies: {},
    };
    mockRes = {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    };
    publicContext = {
      req: mockReq as Request,
      res: mockRes as Response,
      user: null,
    };
  });

  describe("chat.send", () => {
    it("should send a message and receive a response in English", async () => {
      const caller = appRouter.createCaller(publicContext);
      const result = await caller.chat.send({
        message: "Tell me about NEON Energy",
        language: "en",
        context: "sales",
      });

      expect(result).toHaveProperty("message");
      expect(typeof result.message).toBe("string");
      expect(result.message.length).toBeGreaterThan(0);
    });

    it("should accept Spanish language parameter", async () => {
      const caller = appRouter.createCaller(publicContext);
      const result = await caller.chat.send({
        message: "Cuéntame sobre NEON Energy",
        language: "es",
        context: "sales",
      });

      expect(result).toHaveProperty("message");
      expect(typeof result.message).toBe("string");
    });

    it("should accept French language parameter", async () => {
      const caller = appRouter.createCaller(publicContext);
      const result = await caller.chat.send({
        message: "Parlez-moi de NEON Energy",
        language: "fr",
        context: "sales",
      });

      expect(result).toHaveProperty("message");
      expect(typeof result.message).toBe("string");
    });

    it("should accept German language parameter", async () => {
      const caller = appRouter.createCaller(publicContext);
      const result = await caller.chat.send({
        message: "Erzählen Sie mir von NEON Energy",
        language: "de",
        context: "sales",
      });

      expect(result).toHaveProperty("message");
      expect(typeof result.message).toBe("string");
    });

    it("should accept Italian language parameter", async () => {
      const caller = appRouter.createCaller(publicContext);
      const result = await caller.chat.send({
        message: "Parlami di NEON Energy",
        language: "it",
        context: "sales",
      });

      expect(result).toHaveProperty("message");
      expect(typeof result.message).toBe("string");
    });

    it("should accept Chinese language parameter", async () => {
      const caller = appRouter.createCaller(publicContext);
      const result = await caller.chat.send({
        message: "告诉我关于NEON能量饮料",
        language: "zh",
        context: "sales",
      });

      expect(result).toHaveProperty("message");
      expect(typeof result.message).toBe("string");
    });

    it("should accept Japanese language parameter", async () => {
      const caller = appRouter.createCaller(publicContext);
      const result = await caller.chat.send({
        message: "NEON Energyについて教えてください",
        language: "ja",
        context: "sales",
      });

      expect(result).toHaveProperty("message");
      expect(typeof result.message).toBe("string");
    });

    it("should default to English for unknown languages", async () => {
      const caller = appRouter.createCaller(publicContext);
      const result = await caller.chat.send({
        message: "Hello",
        language: "unknown",
        context: "sales",
      });

      expect(result).toHaveProperty("message");
      expect(typeof result.message).toBe("string");
    });

    it("should accept different context types", async () => {
      const caller = appRouter.createCaller(publicContext);
      
      const salesResult = await caller.chat.send({
        message: "I want to buy",
        language: "en",
        context: "sales",
      });
      expect(salesResult).toHaveProperty("message");

      const supportResult = await caller.chat.send({
        message: "I need help",
        language: "en",
        context: "support",
      });
      expect(supportResult).toHaveProperty("message");

      const generalResult = await caller.chat.send({
        message: "General question",
        language: "en",
        context: "general",
      });
      expect(generalResult).toHaveProperty("message");
    });

    it("should reject empty messages", async () => {
      const caller = appRouter.createCaller(publicContext);
      
      await expect(
        caller.chat.send({
          message: "",
          language: "en",
          context: "sales",
        })
      ).rejects.toThrow();
    });
  });
});
