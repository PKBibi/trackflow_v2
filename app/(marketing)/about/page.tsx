import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-8">
            About TrackFlow
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <p className="text-xl text-gray-500 dark:text-gray-400">
              TrackFlow was born from a simple frustration: tracking time shouldn't be hard.
            </p>
            
            <h2 className="text-2xl font-bold mt-12 mb-4">Our Story</h2>
            <p>
              Founded in 2024, TrackFlow emerged from the real-world experiences of freelancers 
              and consultants who struggled with existing time tracking solutions. We believed 
              there had to be a better way to track time, manage projects, and get paid—all 
              without the complexity and bloat of enterprise software.
            </p>
            
            <p>
              Today, TrackFlow serves thousands of professionals worldwide, from solo freelancers 
              to growing agencies. Our mission remains the same: make time tracking so simple 
              and intuitive that it becomes second nature.
            </p>
            
            <h2 className="text-2xl font-bold mt-12 mb-4">Our Values</h2>
            
            <div className="grid gap-6 mt-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Simplicity First</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  We believe powerful software doesn't have to be complicated. Every feature 
                  we build must pass the simplicity test.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Time is Valuable</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  We respect your time. Our tools are designed to save you hours every week, 
                  not add to your workload.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Fair Pricing</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  We offer transparent, affordable pricing because we believe everyone deserves 
                  access to professional tools.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Privacy Matters</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Your data is yours. We never sell it, share it, or use it for anything other 
                  than providing you great service.
                </p>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mt-12 mb-4">The Team</h2>
            <p>
              TrackFlow is built by a distributed team of designers, developers, and customer 
              success specialists who are passionate about productivity and great user experiences. 
              We're headquartered in San Francisco but work from around the world.
            </p>
            
            <div className="mt-12 p-8 bg-primary/5 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Join Our Journey</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                We're always looking for talented people who share our vision for making work 
                life better. Check out our open positions or reach out to say hello.
              </p>
              <div className="flex gap-4">
                <Link href="/careers">
                  <Button>View Careers</Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline">Contact Us</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

