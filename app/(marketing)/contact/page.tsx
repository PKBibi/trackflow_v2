'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Metadata } from 'next'

import { Mail, MessageSquare, Phone, MapPin, Send, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

const faqs = [
  {
    question: "How does TrackFlow help with client billing?",
    answer: "TrackFlow automatically generates professional invoices based on your tracked time and hourly rates. You can organize time by client, project, and campaign to ensure accurate billing."
  },
  {
    question: "Can I track time for different marketing channels?",
    answer: "Yes! TrackFlow is built specifically for digital marketers. You can categorize your time by campaign, channel (SEO, PPC, Social Media, etc.), and client for better organization."
  },
  {
    question: "Is there a free trial available?",
    answer: "Absolutely! We offer a 14-day free trial with no credit card required. You can test all features and see how TrackFlow fits your workflow."
  },
  {
    question: "Can I integrate with other tools?",
    answer: "TrackFlow integrates with popular tools like Google Calendar, Slack, and Stripe. We're constantly adding new integrations based on user feedback."
  },
  {
    question: "How secure is my data?",
    answer: "Security is our top priority. We use enterprise-grade encryption, regular security audits, and comply with GDPR and SOC 2 standards to protect your data."
  }
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  })
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement contact form submission
    // Process contact form submission
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions about TrackFlow? We're here to help. Send us a message and we'll get back to you within 24 hours.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* FAQ JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map(f => ({
                '@type': 'Question',
                name: f.question,
                acceptedAnswer: { '@type': 'Answer', text: f.answer }
              }))
            })
          }}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      name="company"
                      placeholder="Enter your company name (optional)"
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us how we can help..."
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center space-x-3 text-gray-600">
                <Mail className="h-5 w-5 text-blue-600" />
                <span>
                  <strong>Email:</strong>{' '}
                <a href="mailto:support@track-flow.app" className="text-blue-600 hover:text-blue-500">
                    support@track-flow.app
                </a>
                </span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <span>
                  <strong>Response time:</strong> Within 24 hours
                </span>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600">
                Find quick answers to common questions about TrackFlow.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-gray-200">
                  <CardHeader 
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleFaq(index)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-medium text-gray-900">
                        {faq.question}
                      </CardTitle>
                      {openFaq === index ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </CardHeader>
                  {openFaq === index && (
                    <CardContent className="pt-0">
                      <p className="text-gray-600">{faq.answer}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>

            {/* Additional Support */}
            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Need immediate help?
              </h3>
              <p className="text-blue-800 mb-4">
                Check out our comprehensive documentation and video tutorials to get started quickly.
              </p>
              <div className="space-y-2">
                <Link href="/docs">
                  <Button variant="outline" className="w-full" size="sm">
                    View Documentation
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button variant="outline" className="w-full" size="sm">
                    Watch Tutorials
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

                 {/* Office Information */}
         <div className="mt-16 text-center">
           <div className="border-t border-gray-200 mb-8" />
           <h2 className="text-2xl font-bold text-gray-900 mb-6">
            TrackFlow Headquarters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center space-y-2">
              <MapPin className="h-8 w-8 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Address</h3>
              <p className="text-gray-600 text-sm text-center">
                167-169 Great Portland Street, 5th Floor,<br />
                London, W1W 5PF
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Phone className="h-8 w-8 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Phone</h3>
              <p className="text-gray-600 text-sm">020 8156 6441</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Mail className="h-8 w-8 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Email</h3>
              <p className="text-gray-600 text-sm">hello@track-flow.app</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

