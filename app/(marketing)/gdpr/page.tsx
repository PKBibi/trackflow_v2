import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, FileText, Users, Lock, Download, Trash2, Edit, AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'GDPR Compliance - TrackFlow | Your Data Rights',
  description: 'TrackFlow is fully GDPR compliant. Learn about your data rights, how we protect your information, and how to exercise your rights.',
  keywords: 'GDPR compliance, data protection, privacy rights, data controller, data processing',
  openGraph: {
    title: 'TrackFlow GDPR Compliance - Your Data, Your Rights',
    description: 'Full transparency about how we handle your data under GDPR.',
    images: ['/og-gdpr.png'],
  },
  alternates: {
    canonical: 'https://trackflow.app/gdpr',
  },
}

export default function GDPRPage() {
  const rights = [
    {
      icon: FileText,
      title: "Right to Access",
      description: "Request a copy of all personal data we hold about you"
    },
    {
      icon: Edit,
      title: "Right to Rectification",
      description: "Correct any inaccurate or incomplete personal data"
    },
    {
      icon: Trash2,
      title: "Right to Erasure",
      description: "Request deletion of your personal data ('right to be forgotten')"
    },
    {
      icon: Download,
      title: "Right to Data Portability",
      description: "Export your data in a machine-readable format"
    },
    {
      icon: AlertCircle,
      title: "Right to Object",
      description: "Object to processing of your personal data"
    },
    {
      icon: Lock,
      title: "Right to Restrict",
      description: "Request restriction of processing your personal data"
    }
  ]

  const dataCategories = [
    {
      category: "Account Information",
      data: ["Name", "Email address", "Company name", "Job title"],
      purpose: "Account creation and management",
      retention: "Until account deletion"
    },
    {
      category: "Time Tracking Data",
      data: ["Projects", "Clients", "Time entries", "Tasks"],
      purpose: "Core service functionality",
      retention: "Until account deletion + 30 days"
    },
    {
      category: "Billing Information",
      data: ["Payment method", "Billing address", "Invoice history"],
      purpose: "Payment processing and accounting",
      retention: "7 years (legal requirement)"
    },
    {
      category: "Usage Analytics",
      data: ["Feature usage", "Login times", "Browser information"],
      purpose: "Product improvement",
      retention: "2 years"
    }
  ]

  const lawfulBases = [
    {
      basis: "Contract",
      description: "Processing necessary to provide our services as outlined in our Terms of Service"
    },
    {
      basis: "Legitimate Interest",
      description: "Processing for business operations, security, and fraud prevention"
    },
    {
      basis: "Legal Obligation",
      description: "Processing required by law (e.g., tax records, legal requests)"
    },
    {
      basis: "Consent",
      description: "Processing based on your explicit consent (e.g., marketing communications)"
    }
  ]

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4 border-b border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">
            GDPR Compliant
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            GDPR Compliance
          </h1>
          <p className="text-xl text-gray-600">
            TrackFlow is fully compliant with the General Data Protection Regulation (GDPR). 
            We respect your privacy rights and give you complete control over your personal data.
          </p>
        </div>
      </section>

      {/* Your Rights */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your Rights Under GDPR
            </h2>
            <p className="text-xl text-gray-600">
              You have complete control over your personal data
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rights.map((right) => {
              const Icon = right.icon
              return (
                <Card key={right.title} className="border-gray-200">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{right.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{right.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Data We Collect */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Data We Collect & Why
            </h2>
            <p className="text-xl text-gray-600">
              Complete transparency about data collection
            </p>
          </div>
          <div className="space-y-6">
            {dataCategories.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle>{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Data Collected</h4>
                      <ul className="space-y-1">
                        {category.data.map((item) => (
                          <li key={item} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5"></div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Purpose</h4>
                      <p className="text-sm text-gray-600">{category.purpose}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Retention Period</h4>
                      <p className="text-sm text-gray-600">{category.retention}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Lawful Basis */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Lawful Basis for Processing
            </h2>
            <p className="text-xl text-gray-600">
              We only process data when we have a legal basis to do so
            </p>
          </div>
          <div className="space-y-4">
            {lawfulBases.map((item) => (
              <Card key={item.basis}>
                <CardHeader>
                  <CardTitle className="text-lg">{item.basis}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Controller */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Data Controller Information
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4">Data Controller</h3>
                  <p className="text-gray-600">
                    TrackFlow Inc.<br />
                    123 Market Street<br />
                    San Francisco, CA 94105<br />
                    United States
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Data Protection Officer</h3>
                  <p className="text-gray-600">
                    Email: <a href="mailto:privacy@trackflow.app" className="text-blue-600 hover:underline">privacy@trackflow.app</a><br />
                    Phone: +1 (555) 123-4567<br />
                    Response time: Within 48 hours
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Exercise Your Rights */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How to Exercise Your Rights
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Exercising your GDPR rights is simple and straightforward
          </p>
          <div className="bg-blue-50 rounded-lg p-8 mb-8">
            <div className="max-w-2xl mx-auto space-y-4 text-left">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Submit Your Request</h3>
                  <p className="text-gray-600">Email privacy@trackflow.app with your specific request</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Identity Verification</h3>
                  <p className="text-gray-600">We'll verify your identity to protect your data</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Request Processing</h3>
                  <p className="text-gray-600">We'll process your request within 30 days</p>
                </div>
              </div>
            </div>
          </div>
          <a href="mailto:privacy@trackflow.app">
            <Button size="lg" className="btn-primary">
              Contact Privacy Team
            </Button>
          </a>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Additional Resources
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/privacy">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Privacy Policy</CardTitle>
                  <CardDescription>Full details about data handling</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/security">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <Lock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Security</CardTitle>
                  <CardDescription>How we protect your data</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/terms">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Terms of Service</CardTitle>
                  <CardDescription>Our service agreement</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
