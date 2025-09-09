import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#0B1220] text-[#E5E7EB] py-12 min-h-[400px]">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">TrackFlow</h3>
            <p className="text-sm text-gray-400">
              Time tracking that speaks marketing. Built for freelancers and agencies.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/features" className="hover:text-white">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link href="/templates" className="hover:text-white">Templates</Link></li>
              <li><Link href="/integrations" className="hover:text-white">Integrations</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/security" className="hover:text-white">Security</Link></li>
              <li><Link href="/gdpr" className="hover:text-white">GDPR</Link></li>
            </ul>
          </div>
        </div>
        {/* Contact row */}
        <div className="mt-8 text-xs text-gray-400 border-t border-gray-800 pt-6 text-center">
          <p>
            167-169 Great Portland Street, 5th Floor, London, W1W 5PF<br />
            Tel: 020 8156 6441 • track-flow.app
          </p>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          © 2024 TrackFlow. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
