import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - TrackFlow',
  description: 'Privacy Policy for TrackFlow - How we collect, use, and protect your data',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-16 px-4">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              TrackFlow ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains 
              how we collect, use, disclose, and safeguard your information when you use our time tracking service. 
              We are committed to privacy-first principles and comply with GDPR, CCPA, and other data protection regulations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-medium mb-3">Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Account Information:</strong> Name, email address, company name, timezone</li>
              <li><strong>Profile Data:</strong> Avatar, professional information, service categories</li>
              <li><strong>Business Data:</strong> Client information, project details, time entries, invoices</li>
              <li><strong>Payment Information:</strong> Processed securely through Stripe (we don't store card details)</li>
              <li><strong>Communications:</strong> Support tickets, feedback, survey responses</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Information Collected Automatically</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Usage Data:</strong> Features used, time spent, interaction patterns</li>
              <li><strong>Device Information:</strong> Browser type, operating system, device type</li>
              <li><strong>Log Data:</strong> IP address, access times, pages viewed</li>
              <li><strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies (with consent)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain the TrackFlow service</li>
              <li>Process your transactions and manage subscriptions</li>
              <li>Send service-related notifications and updates</li>
              <li>Respond to your comments, questions, and support requests</li>
              <li>Improve and personalize your experience</li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>Detect, prevent, and address technical issues</li>
              <li>Comply with legal obligations</li>
              <li>Send marketing communications (with your consent)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Sharing and Disclosure</h2>
            <p>We do not sell, trade, or rent your personal information. We may share your information only in these circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Providers:</strong> With trusted third parties who assist in operating our service (e.g., hosting, analytics)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to respond to legal process</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
              <li><strong>Aggregated Data:</strong> Non-identifiable aggregated data for analytics and improvements</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encryption of data in transit (TLS/SSL) and at rest</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Regular backups and disaster recovery procedures</li>
              <li>Employee training on data protection and security</li>
              <li>Incident response and breach notification procedures</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
            <p>You have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Objection:</strong> Object to certain processing of your data</li>
              <li><strong>Restriction:</strong> Request restriction of processing</li>
              <li><strong>Withdrawal:</strong> Withdraw consent at any time</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at privacy@trackflow.app. We will respond within 30 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p>
              We retain your personal data only for as long as necessary to provide the Service and fulfill the purposes 
              described in this Policy. When determining retention periods, we consider:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The nature and sensitivity of the data</li>
              <li>Legal and regulatory requirements</li>
              <li>Business and operational needs</li>
              <li>User expectations and requirements</li>
            </ul>
            <p className="mt-4">
              Account data is retained for the duration of your subscription plus 90 days. You can request deletion at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence. 
              We ensure appropriate safeguards are in place for such transfers, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Standard contractual clauses approved by the European Commission</li>
              <li>Data processing agreements with all service providers</li>
              <li>Compliance with Privacy Shield principles (where applicable)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
            <p>
              TrackFlow is not intended for children under 13 years of age. We do not knowingly collect personal 
              information from children under 13. If we discover that we have collected information from a child 
              under 13, we will delete it immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Third-Party Services</h2>
            <p>We use the following third-party services that may collect data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Stripe:</strong> Payment processing (PCI compliant)</li>
              <li><strong>Google Analytics:</strong> Usage analytics (optional, with consent)</li>
              <li><strong>Vercel:</strong> Hosting and infrastructure</li>
              <li><strong>Supabase:</strong> Database and authentication</li>
            </ul>
            <p className="mt-4">
              Each service has its own privacy policy. We encourage you to review their policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. California Privacy Rights (CCPA)</h2>
            <p>
              California residents have additional rights under the CCPA, including the right to know what personal 
              information we collect, the right to delete personal information, the right to opt-out of the sale of 
              personal information (we do not sell personal information), and the right to non-discrimination.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Updates to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by 
              posting the new Privacy Policy on this page and updating the "Last updated" date. For significant 
              changes, we will provide additional notice via email or in-app notification.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
            <p>If you have questions or concerns about this Privacy Policy, please contact us:</p>
            <div className="mt-4">
              <p><strong>TrackFlow Privacy Team</strong></p>
              <p>Email: privacy@trackflow.app</p>
              <p>Data Protection Officer: dpo@trackflow.app</p>
              <p>Address: [Your Business Address]</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}


