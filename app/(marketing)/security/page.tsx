import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Lock, Key, Server, CheckCircle, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Security - TrackFlow | Enterprise-Grade Security',
  description: 'Learn about TrackFlow\'s security measures. 256-bit SSL encryption, GDPR compliant, SOC 2 Type II in progress, and regular security audits.',
  keywords: 'trackflow security, data encryption, GDPR compliance, SOC 2, SSL security',
  openGraph: {
    title: 'TrackFlow Security - Your Data is Safe',
    description: 'Enterprise-grade security for your time tracking data.',
    images: ['/images/og-security.png'],
  },
  alternates: {
    canonical: 'https://track-flow.app/security',
  },
}

export default function SecurityPage() {
  const securityFeatures = [
    {
      icon: Lock,
      title: "256-bit SSL Encryption",
      description: "All data transmission is encrypted using industry-standard SSL/TLS protocols."
    },
    {
      icon: Server,
      title: "Encrypted Database",
      description: "Your data is encrypted at rest using AES-256 encryption on secure servers."
    },
    {
      icon: Shield,
      title: "Regular Security Audits",
      description: "We conduct quarterly security audits and penetration testing."
    },
    {
      icon: Key,
      title: "Two-Factor Authentication",
      description: "Optional 2FA adds an extra layer of security to your account."
    }
  ]

  const compliance = [
    {
      name: "GDPR Compliant",
      status: "active",
      description: "Full compliance with EU data protection regulations"
    },
    {
      name: "SOC 2 Type II",
      status: "in-progress",
      description: "Currently undergoing SOC 2 Type II certification"
    },
    {
      name: "CCPA Compliant",
      status: "active",
      description: "California Consumer Privacy Act compliance"
    },
    {
      name: "ISO 27001",
      status: "planned",
      description: "Information security management certification"
    }
  ]

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4 border-b border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">
            Security First
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Your Data is Safe with TrackFlow
          </h1>
          <p className="text-xl text-gray-600">
            We take security seriously. Your time tracking data is protected by 
            enterprise-grade security measures and industry best practices.
          </p>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Security Features
            </h2>
            <p className="text-xl text-gray-600">
              Multiple layers of protection for your data
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {securityFeatures.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="border-gray-200">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-green-700" />
                      </div>
                      <div>
                        <CardTitle className="text-lg mb-2">{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Infrastructure */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Infrastructure & Operations
          </h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hosting & Infrastructure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  TrackFlow is hosted on Vercel's enterprise infrastructure with:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">Automatic scaling and load balancing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">DDoS protection and WAF</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">99.99% uptime SLA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">Global CDN for fast performance</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Backup & Recovery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Your data is protected with comprehensive backup strategies:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">Automated daily backups</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">Point-in-time recovery up to 30 days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">Geographically distributed backups</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">Regular disaster recovery testing</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Compliance & Certifications
            </h2>
            <p className="text-xl text-gray-600">
              Meeting and exceeding industry standards
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {compliance.map((item) => (
              <Card key={item.name} className="relative">
                <div className="absolute top-4 right-4">
                  {item.status === 'active' ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                  ) : item.status === 'in-progress' ? (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">In Progress</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-600 border-gray-200">Planned</Badge>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Practices */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Security Best Practices
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">For Your Team</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Enable two-factor authentication</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Use strong, unique passwords</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Regular access reviews</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Train team on security awareness</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Our Commitment</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Regular security updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Transparent incident reporting</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Continuous monitoring</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Employee security training</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Report Security Issue */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
            <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Report a Security Issue
            </h2>
            <p className="text-gray-600 mb-6">
              Found a vulnerability? We appreciate responsible disclosure. 
              Please report security issues directly to our security team.
            </p>
            <a href="mailto:security@track-flow.app">
              <Button size="lg" className="bg-yellow-600 hover:bg-yellow-700">
                security@track-flow.app
              </Button>
            </a>
            <p className="text-sm text-gray-500 mt-4">
              We respond to all security reports within 24 hours
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">
            Have Security Questions?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Our security team is here to help answer any questions about how we protect your data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                Contact Security Team
              </Button>
            </Link>
            <Link href="/gdpr">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View GDPR Compliance
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
