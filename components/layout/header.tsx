'use client'

import TeamSwitcher from '@/components/team/TeamSwitcher'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="border-b bg-white/80 dark:bg-[#0B1220]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl" onClick={closeMobileMenu}>
          TrackFlow
        </Link>

        {/* Desktop Navigation */}
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

        {/* Desktop CTA Buttons + Team Switcher */}
        <div className="hidden md:flex items-center gap-4">
          <TeamSwitcher />
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

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-white dark:bg-[#0B1220] shadow-lg">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            <Link
              href="/features"
              className="block py-2 text-sm hover:text-blue-600 transition-colors"
              onClick={closeMobileMenu}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="block py-2 text-sm hover:text-blue-600 transition-colors"
              onClick={closeMobileMenu}
            >
              Pricing
            </Link>
            <Link
              href="/use-cases"
              className="block py-2 text-sm hover:text-blue-600 transition-colors"
              onClick={closeMobileMenu}
            >
              Use Cases
            </Link>
            <Link
              href="/alternatives"
              className="block py-2 text-sm hover:text-blue-600 transition-colors"
              onClick={closeMobileMenu}
            >
              Alternatives
            </Link>
            <Link
              href="/templates"
              className="block py-2 text-sm hover:text-blue-600 transition-colors"
              onClick={closeMobileMenu}
            >
              Templates
            </Link>
            <Link
              href="/about"
              className="block py-2 text-sm hover:text-blue-600 transition-colors"
              onClick={closeMobileMenu}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block py-2 text-sm hover:text-blue-600 transition-colors"
              onClick={closeMobileMenu}
            >
              Contact
            </Link>

            {/* Mobile CTA Buttons */}
            <div className="pt-4 space-y-3 border-t">
              <Link href="/login" onClick={closeMobileMenu}>
                <Button variant="ghost" className="w-full">Sign In</Button>
              </Link>
              <Link href="/signup" onClick={closeMobileMenu}>
                <Button className="w-full btn-primary hover:bg-blue-800">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
