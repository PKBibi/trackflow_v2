import { Metadata } from 'next'
import InsightsDashboard from '@/components/insights/insights-dashboard'

export const metadata: Metadata = {
  title: 'AI Insights | TrackFlow',
  description: 'Get intelligent insights about your productivity, revenue, and time management patterns.',
}

export default function InsightsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <InsightsDashboard />
      </div>
    </div>
  )
}
