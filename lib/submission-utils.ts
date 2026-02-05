// Submission validation and utilities

export interface SubmissionValidation {
  isValid: boolean
  errors: { field: string; message: string }[]
  warnings: string[]
}

export const validateSubmission = (submission: any): SubmissionValidation => {
  const errors: { field: string; message: string }[] = []
  const warnings: string[] = []

  // Required fields
  if (!submission.title || submission.title.trim().length === 0) {
    errors.push({ field: "title", message: "Project title is required" })
  } else if (submission.title.length < 5) {
    errors.push({ field: "title", message: "Title must be at least 5 characters" })
  } else if (submission.title.length > 100) {
    errors.push({ field: "title", message: "Title cannot exceed 100 characters" })
  }

  if (!submission.description || submission.description.trim().length === 0) {
    errors.push({ field: "description", message: "Description is required" })
  } else if (submission.description.length < 50) {
    errors.push({ field: "description", message: "Description must be at least 50 characters" })
  } else if (submission.description.length > 5000) {
    errors.push({ field: "description", message: "Description cannot exceed 5000 characters" })
  }

  if (!submission.technologiesUsed || submission.technologiesUsed.length === 0) {
    errors.push({ field: "technologiesUsed", message: "At least one technology is required" })
  } else if (submission.technologiesUsed.length > 20) {
    warnings.push("Too many technologies listed. Consider limiting to 10-15.")
  }

  // At least one link required
  const hasLink = submission.gitHubLink || submission.liveLink || submission.deploymentLink
  if (!hasLink) {
    errors.push({ field: "links", message: "Provide at least one project link (GitHub, Live, or Deployment)" })
  }

  // Validate URLs
  const urlFields = ["gitHubLink", "liveLink", "deploymentLink", "video", "documentation"]
  urlFields.forEach((field) => {
    if (submission[field]) {
      try {
        new URL(submission[field])
      } catch {
        errors.push({ field, message: `Invalid URL in ${field}` })
      }
    }
  })

  // File size validation
  if (submission.files && submission.files.length > 0) {
    const totalSize = submission.files.reduce((sum: number, file: File) => sum + file.size, 0)
    if (totalSize > 100 * 1024 * 1024) {
      errors.push({ field: "files", message: "Total file size cannot exceed 100MB" })
    }

    // Check file count
    if (submission.files.length > 20) {
      warnings.push("Too many files. Limit to 20 files or use a ZIP archive.")
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// Calculate submission completeness score
export const calculateSubmissionScore = (submission: any): number => {
  let score = 0
  const maxScore = 100

  // Description quality (30 points)
  const descLength = submission.description?.length || 0
  score += Math.min(30, (descLength / 500) * 30)

  // Links provided (40 points)
  const linksScore =
    (submission.gitHubLink ? 15 : 0) +
    (submission.liveLink ? 15 : 0) +
    (submission.video ? 10 : 0) +
    (submission.documentation ? 5 : 0)
  score += Math.min(40, linksScore)

  // Technologies listed (15 points)
  const techScore = Math.min(15, (submission.technologiesUsed?.length || 0) * 1.5)
  score += techScore

  // Files attached (15 points)
  const fileScore = submission.files?.length > 0 ? 15 : 0
  score += fileScore

  return Math.min(maxScore, Math.round(score))
}

// Generate submission statistics
export interface SubmissionStats {
  totalSubmissions: number
  byStatus: Record<string, number>
  averageScore: number
  successRate: number
}

export const calculateSubmissionStats = (submissions: any[]): SubmissionStats => {
  const stats: SubmissionStats = {
    totalSubmissions: submissions.length,
    byStatus: {},
    averageScore: 0,
    successRate: 0,
  }

  // Count by status
  submissions.forEach((sub) => {
    stats.byStatus[sub.status] = (stats.byStatus[sub.status] || 0) + 1
  })

  // Calculate average score
  const scores = submissions.filter((s) => s.score !== undefined).map((s) => s.score)
  if (scores.length > 0) {
    stats.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }

  // Calculate success rate (won / total)
  const wonCount = stats.byStatus["won"] || 0
  stats.successRate = submissions.length > 0 ? Math.round((wonCount / submissions.length) * 100) : 0

  return stats
}

// Detect common issues in submission
export const detectSubmissionIssues = (submission: any): string[] => {
  const issues: string[] = []

  // Check for incomplete GitHub link
  if (submission.gitHubLink && !submission.gitHubLink.includes("github.com")) {
    issues.push("GitHub link doesn't seem to be a valid GitHub URL")
  }

  // Check for empty description with only spaces
  if (submission.description && submission.description.trim().length < 20) {
    issues.push("Description is too short. Provide more details about your project.")
  }

  // Check if only GitHub link provided
  if (submission.gitHubLink && !submission.liveLink && !submission.deploymentLink) {
    issues.push("Consider adding a live demo or deployment link for better visibility")
  }

  // Check for missing video
  if (!submission.video) {
    issues.push("Consider adding a video demo to showcase your project")
  }

  // Check for missing documentation
  if (!submission.documentation) {
    issues.push("Add documentation link (README, Wiki, etc.) for better understanding")
  }

  // Check technology count
  if (!submission.technologiesUsed || submission.technologiesUsed.length < 2) {
    issues.push("List more technologies to showcase your technical breadth")
  }

  return issues
}

// Get submission recommendations
export const getSubmissionRecommendations = (submission: any): string[] => {
  const recommendations: string[] = []

  // Based on technologies
  if (submission.technologiesUsed?.includes("AI") || submission.technologiesUsed?.includes("ML")) {
    recommendations.push("Your AI/ML project might benefit from detailed technical documentation")
  }

  if (submission.technologiesUsed?.includes("Web")) {
    recommendations.push("Include a live demo link for better impact on judges")
  }

  // Based on description length
  if ((submission.description?.length || 0) > 1000) {
    recommendations.push("Your description is quite detailed - consider adding a TL;DR section")
  }

  // Based on links
  if (submission.video) {
    recommendations.push("Great! Including a video demo significantly improves submission quality")
  }

  // Team submissions
  if (submission.teamContributions) {
    recommendations.push("Clear team roles mentioned - this helps judges understand the work distribution")
  }

  return recommendations
}

// Check if submission is locked
export const isSubmissionLocked = (submission: any, hackathon?: any): boolean => {
  // Check if submission is explicitly locked by admin
  if (submission.locked) {
    return true
  }

  // Check if hackathon deadline has passed (only lock on draft status)
  if (hackathon && hackathon.endDate && submission.status === "draft") {
    const now = new Date()
    const endDate = new Date(hackathon.endDate)
    return now > endDate
  }

  return false
}

// Get the reason why submission is locked
export const getSubmissionLockReason = (submission: any, hackathon?: any): string => {
  if (submission.locked && submission.lockedReason) {
    return submission.lockedReason
  }
  if (submission.locked) {
    return "This submission has been locked by an administrator"
  }
  if (hackathon && hackathon.endDate && submission.status === "draft") {
    const now = new Date()
    const endDate = new Date(hackathon.endDate)
    if (now > endDate) {
      return `Submission deadline passed on ${endDate.toLocaleDateString('en-US')}`
    }
  }
  return ""
}

// Get time remaining until submission deadline
export const getTimeUntilDeadline = (hackathon?: any): { remaining: number; formatted: string } | null => {
  if (!hackathon || !hackathon.endDate) {
    return null
  }

  const now = new Date()
  const endDate = new Date(hackathon.endDate)
  const remaining = endDate.getTime() - now.getTime()

  if (remaining <= 0) {
    return { remaining: 0, formatted: "Deadline passed" }
  }

  const hours = Math.floor(remaining / (1000 * 60 * 60))
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
  const days = Math.floor(hours / 24)

  let formatted = ""
  if (days > 0) {
    formatted = `${days}d ${hours % 24}h remaining`
  } else if (hours > 0) {
    formatted = `${hours}h ${minutes}m remaining`
  } else {
    formatted = `${minutes}m remaining`
  }

  return { remaining, formatted }
}
