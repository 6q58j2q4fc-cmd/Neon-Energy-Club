import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypt sensitive data (SSN, EIN, bank account numbers)
 * Uses AES-256-GCM for authenticated encryption
 */
export function encrypt(text: string): string {
  if (!text) return "";
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = Buffer.from(ENCRYPTION_KEY.substring(0, 64), "hex");
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:encryptedData
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) return "";
  
  const parts = encryptedData.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted data format");
  }
  
  const [ivHex, authTagHex, encrypted] = parts;
  
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const key = Buffer.from(ENCRYPTION_KEY.substring(0, 64), "hex");
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

/**
 * Mask SSN for display (show only last 4 digits)
 * Input: 123-45-6789 or 123456789
 * Output: ***-**-6789
 */
export function maskSSN(ssn: string): string {
  if (!ssn) return "";
  
  const cleaned = ssn.replace(/\D/g, "");
  if (cleaned.length !== 9) return "***-**-****";
  
  return `***-**-${cleaned.slice(-4)}`;
}

/**
 * Mask EIN for display (show only last 4 digits)
 * Input: 12-3456789 or 123456789
 * Output: **-***6789
 */
export function maskEIN(ein: string): string {
  if (!ein) return "";
  
  const cleaned = ein.replace(/\D/g, "");
  if (cleaned.length !== 9) return "**-*******";
  
  return `**-***${cleaned.slice(-4)}`;
}

/**
 * Mask bank account number (show only last 4 digits)
 */
export function maskBankAccount(accountNumber: string): string {
  if (!accountNumber) return "";
  
  const cleaned = accountNumber.replace(/\D/g, "");
  if (cleaned.length < 4) return "****";
  
  return `****${cleaned.slice(-4)}`;
}

/**
 * Validate SSN format
 * Accepts: 123-45-6789 or 123456789
 */
export function validateSSN(ssn: string): boolean {
  const cleaned = ssn.replace(/\D/g, "");
  
  // Must be exactly 9 digits
  if (cleaned.length !== 9) return false;
  
  // Cannot be all zeros or start with 000, 666, or 900-999
  if (cleaned === "000000000") return false;
  if (cleaned.startsWith("000")) return false;
  if (cleaned.startsWith("666")) return false;
  if (parseInt(cleaned.substring(0, 3)) >= 900) return false;
  
  return true;
}

/**
 * Validate EIN format
 * Accepts: 12-3456789 or 123456789
 */
export function validateEIN(ein: string): boolean {
  const cleaned = ein.replace(/\D/g, "");
  
  // Must be exactly 9 digits
  if (cleaned.length !== 9) return false;
  
  // Cannot be all zeros
  if (cleaned === "000000000") return false;
  
  return true;
}

/**
 * Format SSN with dashes
 * Input: 123456789
 * Output: 123-45-6789
 */
export function formatSSN(ssn: string): string {
  const cleaned = ssn.replace(/\D/g, "");
  if (cleaned.length !== 9) return ssn;
  
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
}

/**
 * Format EIN with dash
 * Input: 123456789
 * Output: 12-3456789
 */
export function formatEIN(ein: string): string {
  const cleaned = ein.replace(/\D/g, "");
  if (cleaned.length !== 9) return ein;
  
  return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
}
