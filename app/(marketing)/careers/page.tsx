import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Users, Zap, Heart, Globe, Coffee } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Careers - TrackFlow | Join Our Team',
  description: 'Join the TrackFlow team. We\'re building the future of time tracking for digital marketers. Remote-first, maker culture.',
  keywords: 'trackflow careers, marketing tech jobs, remote developer jobs, startup careers',
  openGraph: {
    title: 'Careers at TrackFlow - Join Our Mission',
    description: 'Help us build the time tracking tool that digital marketers actually want to use.',
    images: ['/og-careers.png'],
  },
  alternates: {
    canonical: 'https://trackflow.app/careers',
  },
}

export default function CareersPage() {
  const values = [
    {
      icon: Globe,
      title: "Remote First",
      description: "Work from anywhere in the world. We believe great talent isn't limited by geography."
    },
    {
      icon: Zap,
      title: "Ship Fast",
      description: "We move quickly, iterate often, and learn from real user feedback."
    },
    {
      icon: Users,
      title: "Customer Obsessed",
      description: "We build what marketers actually need, not what we think they need."
    },
    {
      icon: Heart,
      title: "Work-Life Balance",
      description: "We practice what we preach - track your time, but enjoy your life."
    },
    {
      icon: Coffee,
      title: "Maker Culture",
      description: "Everyone codes, everyone talks to customers, everyone contributes ideas."
    },
    {
      icon: MapPin,
      title: "Small Team, Big Impact",
      description: "Every team member directly impacts thousands of users worldwide."
    }
  ]

  const benefits = [
    "Competitive salary + equity",
    "Unlimited PTO (minimum 3 weeks)",
    "$2,000 home office budget",
    "$500 monthly wellness stipend",
    "Latest MacBook Pro or PC",
    "Annual team retreats",
    "Learning & development budget",
    "Health, dental, and vision insurance"
  ]

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4 border-b border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-600 border-blue-200">
            We're Hiring
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Join Our Mission
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            We're a small, passionate team building the future of time tracking for digital marketers.
            If you love building products that people actually want to use, we'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Current Status */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              We're always looking for exceptional talent
            </h2>
            <p className="text-gray-600 mb-6">
              While we don't have open positions right now, we'd love to hear from talented 
              developers, designers, and marketers who are passionate about productivity tools.
            </p>
            <p className="text-gray-600 mb-8">
              Tell us about yourself, what you've built, and why you're excited about TrackFlow.
            </p>
            <a href="mailto:careers@trackflow.app">
              <Button size="lg" className="btn-primary">
                Send Us Your Story
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How We Work
            </h2>
            <p className="text-xl text-gray-600">
              Our values shape everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <Card key={value.title} className="border-gray-200">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{value.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Benefits & Perks
            </h2>
            <p className="text-xl text-gray-600">
              We take care of our team so they can take care of our customers
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 bg-white p-4 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Our Tech Stack
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            We use modern tools to build a modern product
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {['Next.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Supabase', 'Vercel', 'GitHub', 'Linear'].map((tech) => (
              <Badge key={tech} variant="secondary" className="px-4 py-2 text-sm">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Make an Impact?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Even if we don't have the perfect role right now, we'd love to connect with passionate builders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:careers@trackflow.app">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                Get in Touch
              </Button>
            </a>
            <Link href="/about">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Learn More About Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
