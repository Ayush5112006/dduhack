// Smart validation system with intelligent error messages and suggestions

export interface ValidationError {
  field: string
  message: string
  suggestion?: string
  severity: "error" | "warning"
}

export interface FieldValidationResult {
  isValid: boolean
  errors: ValidationError[]
  suggestions: string[]
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/
const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/

export const smartValidators = {
  email: (value: string): FieldValidationResult => {
    const errors: ValidationError[] = []
    const suggestions: string[] = []

    if (!value) {
      errors.push({
        field: "email",
        message: "Email is required",
        severity: "error",
      })
    } else if (!emailRegex.test(value)) {
      errors.push({
        field: "email",
        message: "Invalid email format",
        suggestion: "Use format: yourname@example.com",
        severity: "error",
      })
    } else if (value.includes("..")) {
      errors.push({
        field: "email",
        message: "Email contains consecutive dots",
        severity: "warning",
      })
    }

    return {
      isValid: errors.filter((e) => e.severity === "error").length === 0,
      errors,
      suggestions,
    }
  },

  phone: (value: string): FieldValidationResult => {
    const errors: ValidationError[] = []
    const suggestions: string[] = []

    if (!value) {
      errors.push({
        field: "phone",
        message: "Phone number is required",
        severity: "error",
      })
    } else if (!phoneRegex.test(value)) {
      errors.push({
        field: "phone",
        message: "Invalid phone number format",
        suggestion: "Enter at least 10 digits. Format: +91 9999999999",
        severity: "error",
      })
    }

    return {
      isValid: errors.filter((e) => e.severity === "error").length === 0,
      errors,
      suggestions,
    }
  },

  fullName: (value: string): FieldValidationResult => {
    const errors: ValidationError[] = []
    const suggestions: string[] = []

    if (!value) {
      errors.push({
        field: "fullName",
        message: "Full name is required",
        severity: "error",
      })
    } else if (value.length < 3) {
      errors.push({
        field: "fullName",
        message: "Name is too short",
        severity: "error",
      })
    } else if (value.length > 100) {
      errors.push({
        field: "fullName",
        message: "Name is too long",
        severity: "error",
      })
    } else if (!value.match(/^[a-zA-Z\s]+$/)) {
      suggestions.push("Name should contain only letters and spaces")
    }

    return {
      isValid: errors.filter((e) => e.severity === "error").length === 0,
      errors,
      suggestions,
    }
  },

  skills: (skills: string[]): FieldValidationResult => {
    const errors: ValidationError[] = []
    const suggestions: string[] = []

    if (skills.length === 0) {
      errors.push({
        field: "skills",
        message: "Add at least one skill",
        suggestion: "This helps us understand your expertise",
        severity: "error",
      })
    } else if (skills.length > 15) {
      errors.push({
        field: "skills",
        message: "Too many skills (max 15)",
        severity: "warning",
      })
    }

    // Check for duplicate skills
    if (new Set(skills).size !== skills.length) {
      suggestions.push("Remove duplicate skills")
    }

    return {
      isValid: errors.filter((e) => e.severity === "error").length === 0,
      errors,
      suggestions,
    }
  },

  projectIdea: (value: string): FieldValidationResult => {
    const errors: ValidationError[] = []
    const suggestions: string[] = []

    if (!value) {
      errors.push({
        field: "projectIdea",
        message: "Project idea is required",
        severity: "error",
      })
    } else if (value.length < 20) {
      errors.push({
        field: "projectIdea",
        message: "Project idea should be more detailed",
        suggestion: "Provide at least 20 characters to describe your idea",
        severity: "warning",
      })
    } else if (value.length > 1000) {
      errors.push({
        field: "projectIdea",
        message: "Project idea is too long",
        severity: "warning",
      })
    }

    // Check for meaningful content
    const words = value.trim().split(/\s+/).length
    if (words < 5) {
      suggestions.push("Add more details to your project idea")
    }

    return {
      isValid: errors.filter((e) => e.severity === "error").length === 0,
      errors,
      suggestions,
    }
  },

  url: (value: string, fieldName: string = "URL"): FieldValidationResult => {
    const errors: ValidationError[] = []
    const suggestions: string[] = []

    if (value && !urlRegex.test(value)) {
      errors.push({
        field: "url",
        message: `Invalid ${fieldName} format`,
        suggestion: "Use format: https://example.com",
        severity: "error",
      })
    }

    return {
      isValid: errors.filter((e) => e.severity === "error").length === 0,
      errors,
      suggestions,
    }
  },

  university: (value: string): FieldValidationResult => {
    const errors: ValidationError[] = []
    const suggestions: string[] = []

    if (!value) {
      errors.push({
        field: "university",
        message: "University/College is required",
        severity: "error",
      })
    } else if (value.length < 3) {
      errors.push({
        field: "university",
        message: "Please enter a valid institution name",
        severity: "error",
      })
    }

    return {
      isValid: errors.filter((e) => e.severity === "error").length === 0,
      errors,
      suggestions,
    }
  },
}

// Smart field recommendations based on user input
export const getSmartRecommendations = (formData: any): string[] => {
  const recommendations: string[] = []

  if (formData.skills && formData.skills.length > 0 && !formData.projectIdea) {
    recommendations.push("Your skills match well with projects that use " + formData.skills.join(", "))
  }

  if (formData.experience === "beginner" && formData.skills) {
    recommendations.push("Consider joining beginner-friendly tracks for your first hackathon")
  }

  if (!formData.githubProfile && formData.skills?.includes("JavaScript")) {
    recommendations.push("Add your GitHub profile to showcase your code repositories")
  }

  if (formData.mode === "team" && formData.skills && formData.skills.length < 3) {
    recommendations.push("Build a diverse team with complementary skills")
  }

  return recommendations
}
