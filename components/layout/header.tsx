'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Header() {
  return (
    <header className="border-b bg-white/80 dark:bg-[#0B1220]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          TrackFlow
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/features" className="text-sm hover:text-blue-600 transition-colors">
            Features
          </Link>
          <Link href="/pricing" className="text-sm hover:text-blue-600 transition-colors">
            Pricing
          </Link>
          <Link href="/templates" className="text-sm hover:text-blue-600 transition-colors">
            Templates
          </Link>
          <Link href="/about" className="text-sm hover:text-blue-600 transition-colors">
            About
          </Link>
          <Link href="/contact" className="text-sm hover:text-blue-600 transition-colors">
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button className="btn-primary hover:bg-blue-800">
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
