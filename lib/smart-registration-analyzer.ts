// Smart analytics and tracking for registration history

export interface RegistrationHistory {
  hackathonId: string
  hackathonTitle: string
  registrationDate: Date
  mode: "individual" | "team"
  status: "registered" | "completed" | "won" | "rejected"
  skills: string[]
  teamSize?: number
}

export interface SmartAnalytics {
  totalRegistrations: number
  completionRate: number
  averageSkillsPerRegistration: number
  preferredMode: "individual" | "team" | "mixed"
  topSkills: { skill: string; frequency: number }[]
  winRate: number
  commonPatterns: string[]
}

export class SmartRegistrationAnalyzer {
  static analyzeHistory(history: RegistrationHistory[]): SmartAnalytics {
    const totalRegistrations = history.length
    const completedRegistrations = history.filter((r) => r.status === "completed").length
    const wonRegistrations = history.filter((r) => r.status === "won").length

    // Calculate skill frequency
    const skillFrequency = new Map<string, number>()
    history.forEach((reg) => {
      reg.skills.forEach((skill) => {
        skillFrequency.set(skill, (skillFrequency.get(skill) || 0) + 1)
      })
    })

    const topSkills = Array.from(skillFrequency.entries())
      .map(([skill, frequency]) => ({ skill, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5)

    // Calculate mode preference
    const individualCount = history.filter((r) => r.mode === "individual").length
    const teamCount = history.filter((r) => r.mode === "team").length
    const preferredMode = individualCount > teamCount ? "individual" : teamCount > individualCount ? "team" : "mixed"

    // Calculate average skills
    const totalSkills = history.reduce((sum, reg) => sum + reg.skills.length, 0)
    const averageSkillsPerRegistration = totalRegistrations > 0 ? totalSkills / totalRegistrations : 0

    // Identify patterns
    const commonPatterns: string[] = []
    if (preferredMode === "team") {
      const avgTeamSize = history.filter((r) => r.mode === "team" && r.teamSize).reduce((sum, r) => sum + (r.teamSize || 0), 0) / teamCount
      commonPatterns.push(`Prefers team registration (avg size: ${avgTeamSize.toFixed(1)})`)
    }
    if (winRate > 0.2) {
      commonPatterns.push("High win rate - Strong competitor")
    }
    if (averageSkillsPerRegistration > 5) {
      commonPatterns.push("Diverse skill set - Good for interdisciplinary projects")
    }

    return {
      totalRegistrations,
      completionRate: totalRegistrations > 0 ? (completedRegistrations / totalRegistrations) * 100 : 0,
      averageSkillsPerRegistration,
      preferredMode,
      topSkills,
      winRate: totalRegistrations > 0 ? (wonRegistrations / totalRegistrations) * 100 : 0,
      commonPatterns,
    }
  }

  static getSmartInsights(analytics: SmartAnalytics): string[] {
    const insights: string[] = []

    if (analytics.completionRate > 80) {
      insights.push("✨ You consistently complete registrations - Great dedication!")
    }

    if (analytics.winRate > 30) {
      insights.push("🏆 Impressive win rate! You're a strong competitor.")
    }

    if (analytics.topSkills.length > 0) {
      const topSkill = analytics.topSkills[0]
      insights.push(`🎯 Your strongest skill: ${topSkill.skill} (used in ${topSkill.frequency} projects)`)
    }

    if (analytics.averageSkillsPerRegistration < 3) {
      insights.push("💡 Tip: Adding more diverse skills could improve your project prospects")
    }

    if (analytics.preferredMode === "individual" && analytics.totalRegistrations > 2) {
      insights.push("👥 Suggestion: Try team registration to collaborate and learn from others")
    }

    return insights
  }

  static predictRegistrationSuccess(
    skills: string[],
    mode: "individual" | "team",
    experience: string,
    history: RegistrationHistory[]
  ): number {
    let score = 50 // Base score

    // Add points for skill diversity
    if (skills.length > 3) score += 15
    if (skills.length > 5) score += 10

    // Add points for experience
    if (experience === "advanced") score += 15
    else if (experience === "intermediate") score += 10

    // Add points for team participation
    if (mode === "team" && history.some((r) => r.mode === "team" && r.status === "won")) {
      score += 10
    }

    // Reduce score if overconfident (too few skills with advanced experience)
    if (experience === "advanced" && skills.length < 2) {
      score -= 10
    }

    // Check for relevant skills in history
    const previousSkills = new Set<string>()
    history.forEach((r) => r.skills.forEach((s) => previousSkills.add(s)))
    const relevantSkills = skills.filter((s) => previousSkills.has(s)).length
    if (relevantSkills > skills.length * 0.5) {
      score += 10
    }

    return Math.min(Math.max(score, 0), 100)
  }
}

// Smart recommendations engine
export class SmartRecommendationEngine {
  static recommendSkills(currentSkills: string[], history: RegistrationHistory[]): string[] {
    const recommendedSkills = new Map<string, number>()

    // Find skills used in winning projects
    history
      .filter((r) => r.status === "won")
      .forEach((reg) => {
        reg.skills.forEach((skill) => {
          if (!currentSkills.includes(skill)) {
            recommendedSkills.set(skill, (recommendedSkills.get(skill) || 0) + 3)
          }
        })
      })

    // Find complementary skills to current ones
    const skillPairs = new Map<string, number>()
    history.forEach((reg) => {
      for (let i = 0; i < reg.skills.length; i++) {
        for (let j = i + 1; j < reg.skills.length; j++) {
          const pair = [reg.skills[i], reg.skills[j]].sort().join("|")
          skillPairs.set(pair, (skillPairs.get(pair) || 0) + 1)
        }
      }
    })

    // Recommend skills that pair well with current skills
    for (const [pair, count] of skillPairs.entries()) {
      const [skill1, skill2] = pair.split("|")
      if (currentSkills.includes(skill1) && !currentSkills.includes(skill2)) {
        recommendedSkills.set(skill2, (recommendedSkills.get(skill2) || 0) + count)
      }
      if (currentSkills.includes(skill2) && !currentSkills.includes(skill1)) {
        recommendedSkills.set(skill1, (recommendedSkills.get(skill1) || 0) + count)
      }
    }

    return Array.from(recommendedSkills.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill]) => skill)
  }

  static recommendHackathons(userProfile: any, history: RegistrationHistory[]): string[] {
    // This would integrate with hackathon data
    // Returns IDs of recommended hackathons
    return []
  }

  static recommendTeamMembers(userSkills: string[], userEmail: string): string[] {
    // This would integrate with platform user data
    // Returns emails of recommended team members with complementary skills
    return []
  }
}
