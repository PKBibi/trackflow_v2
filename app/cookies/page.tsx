import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy - TrackFlow',
  description: 'Learn about how TrackFlow uses cookies and similar technologies',
};

export default function CookiePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-16 px-4">
        <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies</h2>
            <p className="mb-4">
              Cookies are small data files that are placed on your computer or mobile device when you visit a website.
              Cookies are widely used by website owners to make their websites work more efficiently and to provide
              reporting information.
            </p>
            <p>
              We use cookies to enhance your experience on TrackFlow, remember your preferences, and analyze how our
              service is used to improve functionality and performance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Types of Cookies We Use</h2>

            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3">Essential Cookies</h3>
              <p className="mb-2">These cookies are necessary for the website to function properly:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Authentication:</strong> Keep you logged in and maintain your session</li>
                <li><strong>Security:</strong> Protect against cross-site request forgery and other security threats</li>
                <li><strong>Preferences:</strong> Remember your language, timezone, and display settings</li>
                <li><strong>Load Balancing:</strong> Ensure the website functions correctly across our servers</li>
              </ul>
              <p className="mt-2 text-sm text-muted-foreground">
                These cookies cannot be disabled as they are essential for the service to function.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3">Analytics Cookies</h3>
              <p className="mb-2">Help us understand how visitors interact with our website:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Google Analytics:</strong> Track page views, user behavior, and performance metrics</li>
                <li><strong>PostHog:</strong> Product analytics to improve user experience</li>
                <li><strong>Vercel Analytics:</strong> Performance monitoring and Core Web Vitals</li>
              </ul>
              <p className="mt-2 text-sm text-muted-foreground">
                You can opt out of these cookies through our cookie preferences or browser settings.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3">Marketing Cookies</h3>
              <p className="mb-2">Used to track visitors across websites for marketing purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Conversion Tracking:</strong> Measure the effectiveness of our advertising campaigns</li>
                <li><strong>Retargeting:</strong> Show relevant ads on other websites</li>
                <li><strong>Social Media:</strong> Enable sharing and social media integrations</li>
              </ul>
              <p className="mt-2 text-sm text-muted-foreground">
                These cookies require your explicit consent and can be disabled.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Cookie Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Cookie Name</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Purpose</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Duration</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">supabase-auth-token</td>
                    <td className="border border-gray-300 px-4 py-2">Authentication session</td>
                    <td className="border border-gray-300 px-4 py-2">7 days</td>
                    <td className="border border-gray-300 px-4 py-2">Essential</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">trackflow-preferences</td>
                    <td className="border border-gray-300 px-4 py-2">User interface preferences</td>
                    <td className="border border-gray-300 px-4 py-2">1 year</td>
                    <td className="border border-gray-300 px-4 py-2">Essential</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">_ga</td>
                    <td className="border border-gray-300 px-4 py-2">Google Analytics user identification</td>
                    <td className="border border-gray-300 px-4 py-2">2 years</td>
                    <td className="border border-gray-300 px-4 py-2">Analytics</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">_ga_*</td>
                    <td className="border border-gray-300 px-4 py-2">Google Analytics session data</td>
                    <td className="border border-gray-300 px-4 py-2">2 years</td>
                    <td className="border border-gray-300 px-4 py-2">Analytics</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">ph_*</td>
                    <td className="border border-gray-300 px-4 py-2">PostHog analytics</td>
                    <td className="border border-gray-300 px-4 py-2">1 year</td>
                    <td className="border border-gray-300 px-4 py-2">Analytics</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Managing Your Cookie Preferences</h2>

            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3">Browser Settings</h3>
              <p className="mb-4">
                You can control and/or delete cookies as you wish. Most browsers allow you to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>See what cookies you have and delete them on an individual basis</li>
                <li>Block third-party cookies</li>
                <li>Block cookies from particular sites</li>
                <li>Block all cookies from being set</li>
                <li>Delete all cookies when you close your browser</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                Note: Deleting or blocking essential cookies may affect the functionality of TrackFlow.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3">Opt-Out Links</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Google Analytics:</strong>{' '}
                  <a
                    href="https://tools.google.com/dlpage/gaoptout"
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google Analytics Opt-out Browser Add-on
                  </a>
                </li>
                <li>
                  <strong>PostHog:</strong> Disabled through our cookie consent banner or account settings
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Third-Party Cookies</h2>
            <p className="mb-4">
              Some cookies on our site are set by third-party services. We have no control over these cookies,
              and they are subject to the respective third party's privacy policies:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Stripe:</strong> Payment processing -
                <a
                  href="https://stripe.com/privacy"
                  className="text-blue-600 hover:underline ml-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Stripe Privacy Policy
                </a>
              </li>
              <li>
                <strong>Google Analytics:</strong> Website analytics -
                <a
                  href="https://policies.google.com/privacy"
                  className="text-blue-600 hover:underline ml-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Privacy Policy
                </a>
              </li>
              <li>
                <strong>PostHog:</strong> Product analytics -
                <a
                  href="https://posthog.com/privacy"
                  className="text-blue-600 hover:underline ml-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  PostHog Privacy Policy
                </a>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. When we do, we will post the updated policy
              on this page and update the "Last updated" date. We encourage you to review this policy periodically
              to stay informed about how we use cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Cookie Policy, please contact us:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email: privacy@track-flow.app</li>
              <li>Website: <a href="/contact" className="text-blue-600 hover:underline">Contact Form</a></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}