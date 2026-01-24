export type Hackathon = {
  id: string
  title: string
  organizer: string
  banner: string
  prize: string
  mode: string
  deadline: string
  startDate: string
  endDate: string
  category: string
  participants: number
  tags: string[]
  difficulty: string
  isFree: boolean
  featured: boolean
  description: string
}

export const hackathons: Hackathon[] = []

export const categories = []

export const winners = []

export const sponsors = []
