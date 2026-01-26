import { defineConfig } from '@prisma/client'

// Prisma v7+ config: keep datasource URL out of schema.prisma
export default defineConfig({
  datasource: {
    provider: 'postgresql',
    url: { fromEnvVar: 'DATABASE_URL' },
  },
})
