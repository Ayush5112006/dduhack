/**
 * OTP (One-Time Password) Generator
 * Generates secure 6-digit OTP codes for email verification
 */

/**
 * Generate a random 6-digit OTP
 * @returns A 6-digit numeric string (000000-999999)
 */
export function generateOTP(): string {
  const otp = Math.floor(Math.random() * 1000000)
  return otp.toString().padStart(6, '0')
}

/**
 * Calculate OTP expiration time
 * @param minutesFromNow - Minutes until OTP expires (default: 10)
 * @returns Future Date when OTP expires
 */
export function getOTPExpirationTime(minutesFromNow: number = 10): Date {
  const expirationTime = new Date()
  expirationTime.setMinutes(expirationTime.getMinutes() + minutesFromNow)
  return expirationTime
}

/**
 * Check if an OTP has expired
 * @param expiresAt - Expiration time of the OTP
 * @returns True if OTP has expired, false otherwise
 */
export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}

/**
 * Format OTP for display in email (e.g., "123 456")
 * @param otp - The 6-digit OTP
 * @returns Formatted OTP string with space in the middle
 */
export function formatOTPForDisplay(otp: string): string {
  return `${otp.substring(0, 3)} ${otp.substring(3, 6)}`
}
