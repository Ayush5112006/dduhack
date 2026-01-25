import { z } from 'zod';

/**
 * Zod validation schemas for testing
 * These match the schemas used in actual API endpoints
 */

export const registrationInputSchema = z.object({
  hackathonId: z.string().min(1, 'Hackathon ID is required'),
  mode: z.enum(['individual', 'team'], {
    errorMap: () => ({ message: 'Mode must be individual or team' }),
  }),
  teamName: z.string().min(2, 'Team name must be at least 2 characters').optional(),
  memberEmails: z
    .array(z.string().email('Invalid email address'))
    .min(1, 'At least one member email required')
    .optional(),
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  university: z.string().min(2, 'University name is required').optional(),
  enrollmentNumber: z.string().optional(),
  branch: z.string().optional(),
  year: z.enum(['1st', '2nd', '3rd', '4th']).optional(),
  techStack: z.string().min(10, 'Please describe your tech skills').optional(),
  experience: z.string().optional(),
  github: z.string().url('Invalid GitHub URL').optional(),
  linkedin: z.string().url('Invalid LinkedIn URL').optional(),
  portfolio: z.string().url('Invalid portfolio URL').optional(),
  projectIdea: z.string().optional(),
  motivation: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

export const submissionInputSchema = z.object({
  hackathonId: z.string().min(1, 'Hackathon ID required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  githubUrl: z.string().url('Invalid GitHub URL'),
  demoUrl: z.string().url('Invalid demo URL').optional(),
  videoUrl: z.string().url('Invalid video URL').optional(),
  techStack: z
    .array(z.string())
    .min(1, 'At least one technology is required'),
  fileUrls: z.array(z.string().url()).optional(),
});

export const scoreInputSchema = z.object({
  submissionId: z.string().min(1, 'Submission ID required'),
  innovation: z.number().min(1).max(10),
  technical: z.number().min(1).max(10),
  design: z.number().min(1).max(10),
  impact: z.number().min(1).max(10),
  presentation: z.number().min(1).max(10),
  feedback: z.string().optional(),
});

describe('Validation Schemas', () => {
  describe('Registration Input Validation', () => {
    it('should validate correct individual registration', () => {
      const validData = {
        hackathonId: 'hack-123',
        mode: 'individual' as const,
        fullName: 'John Doe',
        email: 'john@example.com',
        consent: true,
      };

      const result = registrationInputSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate correct team registration', () => {
      const validData = {
        hackathonId: 'hack-123',
        mode: 'team' as const,
        teamName: 'Code Warriors',
        memberEmails: ['member1@example.com', 'member2@example.com'],
        fullName: 'John Doe',
        email: 'john@example.com',
        consent: true,
      };

      const result = registrationInputSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing full name', () => {
      const invalidData = {
        hackathonId: 'hack-123',
        mode: 'individual' as const,
        email: 'john@example.com',
        consent: true,
      };

      const result = registrationInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        hackathonId: 'hack-123',
        mode: 'individual' as const,
        fullName: 'John Doe',
        email: 'not-an-email',
        consent: true,
      };

      const result = registrationInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing consent', () => {
      const invalidData = {
        hackathonId: 'hack-123',
        mode: 'individual' as const,
        fullName: 'John Doe',
        email: 'john@example.com',
        consent: false,
      };

      const result = registrationInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should allow individual registration without team fields', () => {
      const validData = {
        hackathonId: 'hack-123',
        mode: 'individual' as const,
        fullName: 'John Doe',
        email: 'john@example.com',
        consent: true,
      };

      const result = registrationInputSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Submission Input Validation', () => {
    it('should validate correct submission', () => {
      const validData = {
        hackathonId: 'hack-123',
        title: 'AI Chat Application',
        githubUrl: 'https://github.com/user/project',
        demoUrl: 'https://demo.example.com',
        techStack: ['React', 'Node.js', 'MongoDB'],
      };

      const result = submissionInputSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject submission without GitHub URL', () => {
      const invalidData = {
        hackathonId: 'hack-123',
        title: 'AI Chat Application',
        techStack: ['React', 'Node.js'],
      };

      const result = submissionInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject submission without tech stack', () => {
      const invalidData = {
        hackathonId: 'hack-123',
        title: 'AI Chat Application',
        githubUrl: 'https://github.com/user/project',
        techStack: [],
      };

      const result = submissionInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject submission with short title', () => {
      const invalidData = {
        hackathonId: 'hack-123',
        title: 'AI',
        githubUrl: 'https://github.com/user/project',
        techStack: ['React'],
      };

      const result = submissionInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should allow submission with only required fields', () => {
      const minimalData = {
        hackathonId: 'hack-123',
        title: 'My Project',
        githubUrl: 'https://github.com/user/project',
        techStack: ['JavaScript'],
      };

      const result = submissionInputSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });
  });

  describe('Score Input Validation', () => {
    it('should validate correct score submission', () => {
      const validData = {
        submissionId: 'sub-123',
        innovation: 8,
        technical: 9,
        design: 7,
        impact: 8,
        presentation: 9,
        feedback: 'Great project with excellent execution.',
      };

      const result = scoreInputSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject score below minimum (1)', () => {
      const invalidData = {
        submissionId: 'sub-123',
        innovation: 0,
        technical: 9,
        design: 7,
        impact: 8,
        presentation: 9,
      };

      const result = scoreInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject score above maximum (10)', () => {
      const invalidData = {
        submissionId: 'sub-123',
        innovation: 11,
        technical: 9,
        design: 7,
        impact: 8,
        presentation: 9,
      };

      const result = scoreInputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should allow score without feedback', () => {
      const validData = {
        submissionId: 'sub-123',
        innovation: 8,
        technical: 9,
        design: 7,
        impact: 8,
        presentation: 9,
      };

      const result = scoreInputSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate all perfect scores', () => {
      const validData = {
        submissionId: 'sub-123',
        innovation: 10,
        technical: 10,
        design: 10,
        impact: 10,
        presentation: 10,
      };

      const result = scoreInputSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should calculate average correctly', () => {
      const scores = {
        innovation: 8,
        technical: 9,
        design: 7,
        impact: 8,
        presentation: 9,
      };
      const average = (scores.innovation + scores.technical + scores.design + scores.impact + scores.presentation) / 5;
      expect(average).toBe(8.2);
    });
  });
});
