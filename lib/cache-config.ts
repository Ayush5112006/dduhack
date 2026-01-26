// API Response Cache Configuration
export const cacheConfig = {
  // Hackathons list - 5 minutes
  hackathonsList: {
    revalidate: 300,
    tags: ['hackathons'],
  },
  
  // User dashboard - 1 minute
  userDashboard: {
    revalidate: 60,
    tags: ['user-dashboard'],
  },
  
  // Submissions - 30 seconds
  submissions: {
    revalidate: 30,
    tags: ['submissions'],
  },
  
  // Static content - 1 hour
  static: {
    revalidate: 3600,
    tags: ['static'],
  },
}

// Browser Cache Headers
export const browserCache = {
  static: 'public, max-age=31536000, immutable',
  dynamic: 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
  private: 'private, no-cache, no-store, must-revalidate',
}
