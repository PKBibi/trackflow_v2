import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy - TrackFlow',
  description: 'Cookie Policy for TrackFlow - How we use cookies and similar technologies',
};

export default function CookiePolicyPage() {
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
            <p>
              Cookies are small text files that are placed on your device when you visit our website. They help us 
              provide you with a better experience by remembering your preferences, analyzing how you use our service, 
              and enabling certain functionalities.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
            <p>TrackFlow uses cookies for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Authentication:</strong> To keep you signed in and maintain your session</li>
              <li><strong>Preferences:</strong> To remember your settings and preferences</li>
              <li><strong>Security:</strong> To help protect against fraud and unauthorized access</li>
              <li><strong>Analytics:</strong> To understand how you use our service and improve it</li>
              <li><strong>Performance:</strong> To monitor and optimize the performance of our service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-medium mb-3">Essential Cookies</h3>
            <p className="mb-2">Required for the service to function properly. Cannot be disabled.</p>
            <div className="bg-muted rounded-lg p-4 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Cookie Name</th>
                    <th className="text-left py-2">Purpose</th>
                    <th className="text-left py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">trackflow_session</td>
                    <td className="py-2">Maintains user session</td>
                    <td className="py-2">Session</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">csrf_token</td>
                    <td className="py-2">Security token</td>
                    <td className="py-2">Session</td>
                  </tr>
                  <tr>
                    <td className="py-2">auth_token</td>
                    <td className="py-2">Authentication</td>
                    <td className="py-2">30 days</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-medium mb-3">Functional Cookies</h3>
            <p className="mb-2">Enable personalized features and remember your preferences.</p>
            <div className="bg-muted rounded-lg p-4 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Cookie Name</th>
                    <th className="text-left py-2">Purpose</th>
                    <th className="text-left py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">theme</td>
                    <td className="py-2">Dark/light mode preference</td>
                    <td className="py-2">1 year</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">timezone</td>
                    <td className="py-2">User timezone</td>
                    <td className="py-2">1 year</td>
                  </tr>
                  <tr>
                    <td className="py-2">language</td>
                    <td className="py-2">Language preference</td>
                    <td className="py-2">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-medium mb-3">Analytics Cookies</h3>
            <p className="mb-2">Help us understand how visitors interact with our service. Requires consent.</p>
            <div className="bg-muted rounded-lg p-4 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Cookie Name</th>
                    <th className="text-left py-2">Provider</th>
                    <th className="text-left py-2">Purpose</th>
                    <th className="text-left py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">_ga</td>
                    <td className="py-2">Google Analytics</td>
                    <td className="py-2">Distinguish users</td>
                    <td className="py-2">2 years</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">_ga_*</td>
                    <td className="py-2">Google Analytics</td>
                    <td className="py-2">Maintain session state</td>
                    <td className="py-2">2 years</td>
                  </tr>
                  <tr>
                    <td className="py-2">_gid</td>
                    <td className="py-2">Google Analytics</td>
                    <td className="py-2">Distinguish users</td>
                    <td className="py-2">24 hours</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Third-Party Cookies</h2>
            <p>
              Some third-party services we use may set their own cookies. These include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Stripe:</strong> Payment processing (essential for transactions)</li>
              <li><strong>Google Analytics:</strong> Usage analytics (only with consent)</li>
              <li><strong>Intercom:</strong> Customer support chat (if enabled)</li>
            </ul>
            <p className="mt-4">
              We recommend reviewing the privacy policies of these third-party services to understand their cookie practices.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Managing Cookies</h2>
            
            <h3 className="text-xl font-medium mb-3">Cookie Consent</h3>
            <p>
              When you first visit TrackFlow, we'll ask for your consent before setting any non-essential cookies. 
              You can change your preferences at any time through the cookie settings in your account.
            </p>

            <h3 className="text-xl font-medium mb-3 mt-4">Browser Settings</h3>
            <p>
              You can control cookies through your browser settings. Most browsers allow you to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>View what cookies are stored on your device</li>
              <li>Delete cookies individually or all at once</li>
              <li>Block third-party cookies</li>
              <li>Block all cookies from specific websites</li>
              <li>Block all cookies entirely</li>
            </ul>
            
            <p className="mt-4">
              Note that blocking essential cookies may prevent you from using certain features of TrackFlow.
            </p>

            <h3 className="text-xl font-medium mb-3 mt-4">Browser Instructions</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><a href="https://support.google.com/chrome/answer/95647" className="text-primary hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" className="text-primary hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" className="text-primary hover:underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/help/4027947/microsoft-edge-delete-cookies" className="text-primary hover:underline">Microsoft Edge</a></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Do Not Track</h2>
            <p>
              TrackFlow respects Do Not Track (DNT) browser settings. When we detect a DNT signal, we do not load 
              analytics cookies or other tracking technologies that are not essential to the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Local Storage</h2>
            <p>
              In addition to cookies, we use local storage (localStorage and sessionStorage) to store information 
              on your device. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Temporary form data to prevent loss</li>
              <li>UI state and preferences</li>
              <li>Cache data for performance</li>
              <li>Recently used items for quick access</li>
            </ul>
            <p className="mt-4">
              You can clear local storage through your browser's developer tools or by clearing your browsing data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, 
              operational, or regulatory reasons. We'll notify you of any material changes by posting the new policy 
              on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p>
              If you have questions about our use of cookies, please contact us:
            </p>
            <div className="mt-4">
              <p>Email: privacy@track-flow.app</p>
              <p>Address: 167-169 Great Portland Street, 5th Floor, London, W1W 5PF</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}


