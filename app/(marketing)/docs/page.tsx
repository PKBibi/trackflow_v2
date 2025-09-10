import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DocsLandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Documentation</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find guides and resources to get the most out of TrackFlow.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Account setup and first steps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/signup" className="text-blue-600 hover:text-blue-500 block">Create your account</Link>
              <Link href="/demo" className="text-blue-600 hover:text-blue-500 block">Watch a quick demo</Link>
              <Link href="/features" className="text-blue-600 hover:text-blue-500 block">Explore features</Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connect your tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/integrations" className="text-blue-600 hover:text-blue-500 block">Available integrations</Link>
              <Link href="/contact" className="text-blue-600 hover:text-blue-500 block">Request an integration</Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>Pre-built workflows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/templates" className="text-blue-600 hover:text-blue-500 block">Use a quick-start template</Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>Your data, protected</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/security" className="text-blue-600 hover:text-blue-500 block">Security overview</Link>
              <Link href="/gdpr" className="text-blue-600 hover:text-blue-500 block">GDPR</Link>
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500 block">Privacy Policy</Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
              <CardDescription>Plans and invoices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/pricing" className="text-blue-600 hover:text-blue-500 block">View pricing</Link>
              <Link href="/contact" className="text-blue-600 hover:text-blue-500 block">Billing questions</Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>We usually respond within 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/contact">
                <Button className="w-full">Contact Support</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

