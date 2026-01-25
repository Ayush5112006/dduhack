import { z } from "zod"

/**
 * Comprehensive input validation schemas
 * Using Zod for runtime validation and type safety
 */

// Email validation schema
export const emailSchema = z
  .string()
  .email("Invalid email format")
  .toLowerCase()
  .max(255, "Email too long")

// Password validation schema with strong requirements
export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128, "Password too long")
  .regex(/[A-Z]/, "Password must contain uppercase letter")
  .regex(/[a-z]/, "Password must contain lowercase letter")
  .regex(/[0-9]/, "Password must contain number")
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/, "Password must contain special character")
  .refine((pwd) => {
    // Prevent common weak patterns
    const weakPatterns = [
      /(.)\1{2,}/, // Repeating characters
      /^[a-z0-9]*$/, // No uppercase
      /qwerty/i, // Keyboard patterns
    ]
    return !weakPatterns.some((pattern) => pattern.test(pwd))
  }, "Password contains common weak patterns")

// Username validation
export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(32, "Username max 32 characters")
  .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscore, hyphen")

// Name validation
export const nameSchema = z
  .string()
  .min(2, "Name too short")
  .max(100, "Name too long")
  .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters")

// Role validation
export const roleSchema = z.enum(["participant", "organizer", "admin"])

// Authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password required"),
  role: roleSchema.optional().default("participant"),
})

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  userName: usernameSchema,
  userRole: roleSchema.optional().default("participant"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password required"),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
})

// Hackathon validation schemas
export const hackathonInputSchema = z.object({
  title: z.string().min(3, "Title required").max(255),
  description: z.string().max(5000).optional(),
  category: z.string().min(1, "Category required").max(100),
  mode: z.enum(["online", "offline", "hybrid"]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  prizeAmount: z.number().int().nonnegative().optional(),
  prize: z.string().max(500).optional(),
  location: z.string().max(255).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  registrationDeadline: z.string().datetime(),
  eligibility: z.string().max(1000).optional(),
  banner: z.string().url().optional(),
  tags: z.array(z.string().max(50)).optional(),
  isFree: z.boolean().optional(),
  featured: z.boolean().optional(),
}).refine((data) => {
  const start = new Date(data.startDate)
  const end = new Date(data.endDate)
  const deadline = new Date(data.registrationDeadline)
  return deadline <= start && start < end
}, {
  message: "Invalid date range: deadline must be before/equal start, start before end",
  path: ["startDate"],
})

// Profile update schema
export const profileUpdateSchema = z.object({
  name: nameSchema.optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone").optional(),
  institution: z.string().max(255).optional(),
  major: z.string().max(100).optional(),
})

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

// Search schema
export const searchSchema = z.object({
  q: z.string().max(255),
  category: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  status: z.enum(["upcoming", "live", "past"]).optional(),
})

// Admin user creation schema
export const adminCreateUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema.exclude(["participant"]), // Prevent creating participants via admin
})

/**
 * Generic validation function with error handling
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: boolean
  data?: T
  error?: string
  details?: Record<string, string[]>
} {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.flatten().fieldErrors
      const message = Object.entries(details)
        .map(([field, errors]) => `${field}: ${errors?.join(", ")}`)
        .join("; ")
      return {
        success: false,
        error: message,
        details: details as Record<string, string[]>,
      }
    }
    return {
      success: false,
      error: "Validation failed",
    }
  }
}

/**
 * Strict string validation to prevent injection
 */
export function validateString(
  value: unknown,
  options: {
    min?: number
    max?: number
    pattern?: RegExp
    allowSpecialChars?: boolean
  } = {}
): { valid: boolean; error?: string } {
  if (typeof value !== "string") {
    return { valid: false, error: "Must be a string" }
  }

  const { min = 1, max = 255, pattern, allowSpecialChars = true } = options

  if (value.length < min || value.length > max) {
    return { valid: false, error: `Length must be ${min}-${max}` }
  }

  if (pattern && !pattern.test(value)) {
    return { valid: false, error: "Invalid format" }
  }

  if (!allowSpecialChars) {
    const dangerousChars = /<|>|"|'|;|&|\||`/g
    if (dangerousChars.test(value)) {
      return { valid: false, error: "Contains invalid characters" }
    }
  }

  return { valid: true }
}

/**
 * Validate numeric input
 */
export function validateNumber(
  value: unknown,
  options: {
    min?: number
    max?: number
  } = {}
): { valid: boolean; error?: string } {
  const num = Number(value)

  if (isNaN(num)) {
    return { valid: false, error: "Must be a valid number" }
  }

  const { min, max } = options

  if (min !== undefined && num < min) {
    return { valid: false, error: `Must be at least ${min}` }
  }

  if (max !== undefined && num > max) {
    return { valid: false, error: `Must be at most ${max}` }
  }

  return { valid: true }
}

/**
 * Validate file uploads
 */
export function validateFile(
  file: File | undefined,
  options: {
    maxSize?: number // in bytes
    allowedMimes?: string[]
  } = {}
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "File required" }
  }

  const { maxSize = 10 * 1024 * 1024, allowedMimes = ["image/jpeg", "image/png", "application/pdf"] } = options

  if (file.size > maxSize) {
    return { valid: false, error: `File too large (max ${maxSize / 1024 / 1024}MB)` }
  }

  if (!allowedMimes.includes(file.type)) {
    return { valid: false, error: "File type not allowed" }
  }

  return { valid: true }
}
