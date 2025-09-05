import Link from 'next/link'
import { Calendar, Clock, User } from 'lucide-react'

const blogPosts = [
  {
    id: 1,
    title: '10 Time Tracking Tips for Digital Marketing Freelancers',
    excerpt: 'Master time tracking with campaign-specific strategies, channel allocation insights, and productivity patterns that boost your billable hours.',
    author: 'Sarah Chen',
    date: '2024-01-15',
    readTime: '7 min read',
    category: 'Productivity',
    slug: '10-time-tracking-tips-for-freelancers',
  },
  {
    id: 2,
    title: 'How to Price Your Digital Marketing Services in 2024',
    excerpt: 'Learn value-based pricing strategies, calculate your true hourly rate, and discover what top marketers charge for PPC, SEO, and social media services.',
    author: 'Michael Rodriguez',
    date: '2024-01-12',
    readTime: '10 min read',
    category: 'Business',
    slug: 'how-to-price-your-services',
  },
  {
    id: 3,
    title: 'State of Digital Marketing Rates: 2024 Report',
    excerpt: 'Comprehensive analysis of current marketing rates by service, region, and experience level. See how your rates compare to industry standards.',
    author: 'Emily Johnson',
    date: '2024-01-08',
    readTime: '8 min read',
    category: 'Industry Insights',
    slug: 'state-of-digital-marketing-rates-2024',
  },
  {
    id: 4,
    title: '5 Ways to Automate Your Marketing Agency Workflow',
    excerpt: 'From automated time tracking to AI-powered reporting, discover tools and strategies that save agencies 10+ hours per week.',
    author: 'David Kim',
    date: '2024-01-05',
    readTime: '6 min read',
    category: 'Automation',
    slug: '5-ways-to-automate-agency-workflow',
  },
  {
    id: 5,
    title: 'Managing Retainer Clients Without Burnout',
    excerpt: 'Best practices for tracking retainer usage, setting boundaries, and maintaining profitable long-term client relationships.',
    author: 'Lisa Wang',
    date: '2023-12-28',
    readTime: '5 min read',
    category: 'Client Relations',
    slug: 'managing-retainer-clients',
  },
  {
    id: 6,
    title: 'The Complete Guide to Campaign ROI Tracking',
    excerpt: 'Learn how to accurately track time costs against campaign performance to identify your most profitable marketing channels.',
    author: 'James Wilson',
    date: '2023-12-20',
    readTime: '9 min read',
    category: 'Analytics',
    slug: 'campaign-roi-tracking-guide',
  },
]

const categories = ['All', 'Productivity', 'Business', 'Industry Insights', 'Automation', 'Client Relations', 'Analytics']

export default function BlogPage() {
  return (
    <div className="py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Blog & Resources
          </h1>
          <p className="max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            Tips, insights, and strategies to help you grow your freelance business.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === 'All' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <article key={post.id} className="group relative flex flex-col space-y-2">
              <div className="rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow h-full flex flex-col">
                <div className="mb-2">
                  <span className="text-xs font-medium text-primary">
                    {post.category}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 flex-grow">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <nav className="flex gap-2">
            <button className="px-4 py-2 rounded-md border bg-background hover:bg-accent">
              Previous
            </button>
            <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground">
              1
            </button>
            <button className="px-4 py-2 rounded-md border bg-background hover:bg-accent">
              2
            </button>
            <button className="px-4 py-2 rounded-md border bg-background hover:bg-accent">
              3
            </button>
            <button className="px-4 py-2 rounded-md border bg-background hover:bg-accent">
              Next
            </button>
          </nav>
        </div>

        <div className="mt-16 p-8 bg-primary/5 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Get the latest tips and insights delivered to your inbox every week.
          </p>
          <form className="flex gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-md border bg-background"
            />
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

