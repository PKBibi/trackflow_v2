'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

// Simple icon components
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const LinkedInIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0077B5">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-2">Get Started</h1>
          <p className="text-gray-600 mb-8">
            Start your 14-day free trial. No credit card required.
          </p>

          {/* Social Auth */}
          <div className="space-y-3 mb-6">
            <button className="w-full py-3 px-4 border border-gray-300 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors">
              <GoogleIcon /> Continue with Google
            </button>
            <button className="w-full py-3 px-4 border border-gray-300 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors">
              <LinkedInIcon /> Continue with LinkedIn
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium mb-2">Full Name</label>
              <input 
                type="text" 
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">Work Email</label>
              <input 
                type="email" 
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required
              />
            </div>
            
            <div>
              <label htmlFor="company" className="block text-sm font-medium mb-2">Company</label>
              <input 
                type="text" 
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
              <input 
                type="password" 
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 8 characters with one uppercase letter
              </p>
            </div>

            <button 
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Start 14-Day Free Trial
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Right: Benefits */}
      <div className="hidden lg:flex items-center justify-center p-12 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Time tracking built for digital marketers
          </h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <CheckCircle className="text-blue-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold mb-1">Track by Campaign & Channel</h3>
                <p className="text-gray-600">Organize time by PPC, SEO, Social, and more</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <CheckCircle className="text-blue-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold mb-1">Built for Agencies</h3>
                <p className="text-gray-600">Retainer tracking, white-label reports, team management</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <CheckCircle className="text-blue-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold mb-1">Invoice from Timesheets</h3>
                <p className="text-gray-600">Generate professional invoices in one click</p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600 italic mb-4">
              "TrackFlow cut our invoicing time by 70% and helped us identify 
              our most profitable services."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">SC</span>
              </div>
              <div>
                <p className="font-semibold">Sarah Chen</p>
                <p className="text-sm text-gray-500">Growth Digital Agency</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
