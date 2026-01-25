import { JudgePanel } from '@/components/dashboard/judge-panel'

export const metadata = {
  title: 'Judge Panel | Dashboard',
  description: 'Review and score hackathon submissions',
}

export default function JudgePanelPage() {
  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Judge Panel</h1>
        <p className="text-muted-foreground mt-2">
          Review submitted projects and score them based on our evaluation rubric.
        </p>
      </div>

      <JudgePanel />
    </div>
  )
}
