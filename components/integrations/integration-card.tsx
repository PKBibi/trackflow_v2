'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

interface Tool {
  name: string
  status: string
  description: string
  icon: string
}

interface IntegrationCardProps {
  tool: Tool
}

export function IntegrationCard({ tool }: IntegrationCardProps) {
  const router = useRouter()
  const { toast } = useToast()

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Available</Badge>
      case 'coming-soon':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Coming Soon</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Planned</Badge>
    }
  }

  const handleConfigure = () => {
    if (tool.name === 'Stripe') {
      router.push('/dashboard/billing')
      toast({
        title: "Opening Stripe Configuration",
        description: "Set up payment processing and subscription billing.",
      })
    } else if (tool.name === 'CSV Export') {
      router.push('/dashboard/settings/export')
      toast({
        title: "Opening Export Settings",
        description: "Export your time entries to CSV for external accounting software.",
      })
    }
  }

  const handleComingSoon = () => {
    toast({
      title: "Coming Soon!",
      description: `${tool.name} integration is currently in development. We'll notify you when it's ready.`,
    })
  }

  const handlePlanned = () => {
    toast({
      title: "On Our Roadmap",
      description: `${tool.name} integration is planned for a future release. Request it to increase priority!`,
    })
  }

  return (
    <Card className="relative p-6 hover:shadow-lg transition-shadow">
      <div className="absolute top-4 right-4">
        {getStatusBadge(tool.status)}
      </div>
      <div className="mb-4">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl mb-4">
          {tool.icon}
        </div>
        <h3 className="font-semibold text-lg mb-2">{tool.name}</h3>
        <p className="text-sm text-gray-600">{tool.description}</p>
      </div>
      
      {tool.status === 'available' && (
        <Button 
          size="sm" 
          className="w-full"
          onClick={handleConfigure}
        >
          Configure
        </Button>
      )}
      
      {tool.status === 'coming-soon' && (
        <Button 
          size="sm" 
          className="w-full"
          variant="outline"
          onClick={handleComingSoon}
        >
          Coming Soon
        </Button>
      )}
      
      {tool.status === 'planned' && (
        <Button 
          size="sm" 
          className="w-full"
          variant="ghost"
          onClick={handlePlanned}
        >
          Request Integration
        </Button>
      )}
    </Card>
  )
}