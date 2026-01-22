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

export const hackathons: Hackathon[] = [
  {
    id: "1",
    title: "AI Innovation Challenge 2026",
    organizer: "TechCorp Global",
    banner: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    prize: "$50,000",
    mode: "Online",
    deadline: "Feb 15, 2026",
    startDate: "Feb 20, 2026",
    endDate: "Feb 22, 2026",
    category: "AI",
    participants: 1234,
    tags: ["Machine Learning", "NLP", "Computer Vision"],
    difficulty: "Intermediate",
    isFree: true,
    featured: true,
    description: "Join the largest AI hackathon of the year! Build innovative solutions using cutting-edge AI technologies.",
  },
  {
    id: "2",
    title: "Web3 Builders Summit",
    organizer: "Blockchain Foundation",
    banner: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop",
    prize: "$75,000",
    mode: "Hybrid",
    deadline: "Mar 1, 2026",
    startDate: "Mar 10, 2026",
    endDate: "Mar 12, 2026",
    category: "Blockchain",
    participants: 856,
    tags: ["DeFi", "NFT", "Smart Contracts"],
    difficulty: "Advanced",
    isFree: false,
    featured: true,
    description: "Build the future of decentralized applications at the premier Web3 hackathon.",
  },
  {
    id: "3",
    title: "GreenTech Sustainability Hack",
    organizer: "EcoInnovate Labs",
    banner: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=400&fit=crop",
    prize: "$30,000",
    mode: "Online",
    deadline: "Feb 28, 2026",
    startDate: "Mar 5, 2026",
    endDate: "Mar 7, 2026",
    category: "Web",
    participants: 542,
    tags: ["Climate", "Sustainability", "IoT"],
    difficulty: "Beginner",
    isFree: true,
    featured: true,
    description: "Create technology solutions to combat climate change and promote sustainability.",
  },
  {
    id: "4",
    title: "HealthTech Revolution",
    organizer: "MedTech Alliance",
    banner: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=400&fit=crop",
    prize: "$40,000",
    mode: "Offline",
    deadline: "Mar 15, 2026",
    startDate: "Mar 20, 2026",
    endDate: "Mar 22, 2026",
    category: "Mobile",
    participants: 678,
    tags: ["Healthcare", "AI", "Wearables"],
    difficulty: "Intermediate",
    isFree: true,
    featured: false,
    description: "Revolutionize healthcare with innovative digital solutions and medical technologies.",
  },
  {
    id: "5",
    title: "CyberShield Security Challenge",
    organizer: "SecureNet Foundation",
    banner: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=400&fit=crop",
    prize: "$60,000",
    mode: "Online",
    deadline: "Apr 1, 2026",
    startDate: "Apr 5, 2026",
    endDate: "Apr 7, 2026",
    category: "Security",
    participants: 423,
    tags: ["Cybersecurity", "Ethical Hacking", "Cryptography"],
    difficulty: "Advanced",
    isFree: false,
    featured: false,
    description: "Test your cybersecurity skills and build robust security solutions.",
  },
  {
    id: "6",
    title: "Mobile App Masters",
    organizer: "AppDev Community",
    banner: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop",
    prize: "$25,000",
    mode: "Online",
    deadline: "Mar 20, 2026",
    startDate: "Mar 25, 2026",
    endDate: "Mar 27, 2026",
    category: "Mobile",
    participants: 912,
    tags: ["iOS", "Android", "Flutter"],
    difficulty: "Beginner",
    isFree: true,
    featured: false,
    description: "Create the next breakthrough mobile application that changes how people live.",
  },
]

export const categories = [
  {
    name: "AI & ML",
    icon: "Brain",
    count: 45,
    color: "from-cyan-500/20 to-blue-500/20",
  },
  {
    name: "Web Dev",
    icon: "Globe",
    count: 78,
    color: "from-green-500/20 to-emerald-500/20",
  },
  {
    name: "Mobile",
    icon: "Smartphone",
    count: 34,
    color: "from-orange-500/20 to-amber-500/20",
  },
  {
    name: "Blockchain",
    icon: "Blocks",
    count: 29,
    color: "from-indigo-500/20 to-violet-500/20",
  },
  {
    name: "Security",
    icon: "Shield",
    count: 21,
    color: "from-red-500/20 to-rose-500/20",
  },
  {
    name: "IoT",
    icon: "Cpu",
    count: 18,
    color: "from-teal-500/20 to-cyan-500/20",
  },
]

export const winners = [
  {
    name: "Team Quantum",
    project: "AI-Powered Healthcare Assistant",
    hackathon: "HealthTech 2025",
    prize: "$50,000",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "ByteBuilders",
    project: "Decentralized Identity Platform",
    hackathon: "Web3 Summit 2025",
    prize: "$75,000",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "GreenCoders",
    project: "Carbon Footprint Tracker",
    hackathon: "EcoHack 2025",
    prize: "$30,000",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "CyberSquad",
    project: "Zero-Trust Security Framework",
    hackathon: "CyberShield 2025",
    prize: "$60,000",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  },
]

export const sponsors = [
  { name: "TechCorp", logo: "TC" },
  { name: "InnovateLabs", logo: "IL" },
  { name: "FutureTech", logo: "FT" },
  { name: "CodeBase", logo: "CB" },
  { name: "DataDrive", logo: "DD" },
  { name: "CloudNine", logo: "CN" },
]
