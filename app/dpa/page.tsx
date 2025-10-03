import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Processing Agreement - TrackFlow',
  description: 'Data Processing Agreement for enterprise customers and GDPR compliance',
};

export default function DPAPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-16 px-4">
        <h1 className="text-4xl font-bold mb-8">Data Processing Agreement</h1>
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Enterprise Customers</h3>
            <p className="text-blue-800">
              This Data Processing Agreement (DPA) applies to Enterprise plan customers who need additional
              data protection guarantees for GDPR, CCPA, and other regulatory compliance.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Definitions</h2>
            <dl className="space-y-4">
              <div>
                <dt className="font-semibold">Controller:</dt>
                <dd>The customer organization that determines the purposes and means of processing personal data.</dd>
              </div>
              <div>
                <dt className="font-semibold">Processor:</dt>
                <dd>TrackFlow Inc., which processes personal data on behalf of the Controller.</dd>
              </div>
              <div>
                <dt className="font-semibold">Personal Data:</dt>
                <dd>Any information relating to an identified or identifiable natural person.</dd>
              </div>
              <div>
                <dt className="font-semibold">Processing:</dt>
                <dd>Any operation performed on personal data, including collection, storage, use, and deletion.</dd>
              </div>
              <div>
                <dt className="font-semibold">Sub-processor:</dt>
                <dd>Any third-party data processor engaged by TrackFlow to assist in processing personal data.</dd>
              </div>
            </dl>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Scope and Purpose of Processing</h2>

            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3">Categories of Personal Data</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Identity Data:</strong> Name, username, email address</li>
                <li><strong>Contact Data:</strong> Business address, phone number</li>
                <li><strong>Professional Data:</strong> Job title, company information, work schedule</li>
                <li><strong>Usage Data:</strong> Time tracking records, project data, billing information</li>
                <li><strong>Technical Data:</strong> IP address, browser data, device information</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3">Categories of Data Subjects</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Customer employees and contractors</li>
                <li>Customer clients and business contacts</li>
                <li>End users of the customer's services</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3">Purpose of Processing</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Providing time tracking and project management services</li>
                <li>Generating reports and analytics</li>
                <li>Client and invoice management</li>
                <li>Account administration and customer support</li>
                <li>Service improvement and feature development</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. TrackFlow's Obligations</h2>

            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3">Data Protection Measures</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process personal data only on documented instructions from the Controller</li>
                <li>Ensure personnel processing personal data are bound by confidentiality</li>
                <li>Implement appropriate technical and organizational security measures</li>
                <li>Engage sub-processors only with prior written authorization</li>
                <li>Assist with data subject rights requests</li>
                <li>Notify of data breaches within 72 hours</li>
                <li>Delete or return personal data upon termination</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3">Security Measures</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Encryption:</strong> Data encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
                <li><strong>Access Controls:</strong> Role-based access, multi-factor authentication</li>
                <li><strong>Infrastructure:</strong> SOC 2 compliant hosting (Supabase/AWS)</li>
                <li><strong>Monitoring:</strong> 24/7 security monitoring and incident response</li>
                <li><strong>Audits:</strong> Regular security assessments and penetration testing</li>
                <li><strong>Backup:</strong> Automated daily backups with point-in-time recovery</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Sub-processors</h2>
            <p className="mb-4">
              TrackFlow engages the following sub-processors to provide the service:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Sub-processor</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Purpose</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Location</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Supabase Inc.</td>
                    <td className="border border-gray-300 px-4 py-2">Database hosting and authentication</td>
                    <td className="border border-gray-300 px-4 py-2">United States</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Vercel Inc.</td>
                    <td className="border border-gray-300 px-4 py-2">Application hosting and delivery</td>
                    <td className="border border-gray-300 px-4 py-2">United States</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Stripe Inc.</td>
                    <td className="border border-gray-300 px-4 py-2">Payment processing</td>
                    <td className="border border-gray-300 px-4 py-2">United States</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Resend Inc.</td>
                    <td className="border border-gray-300 px-4 py-2">Email delivery</td>
                    <td className="border border-gray-300 px-4 py-2">United States</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Sentry</td>
                    <td className="border border-gray-300 px-4 py-2">Error monitoring</td>
                    <td className="border border-gray-300 px-4 py-2">United States</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              All sub-processors have been assessed for GDPR compliance and have appropriate data protection measures in place.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Subject Rights</h2>
            <p className="mb-4">
              TrackFlow will assist the Controller in fulfilling data subject rights requests:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Access:</strong> Provide copies of personal data being processed</li>
              <li><strong>Rectification:</strong> Correct inaccurate or incomplete personal data</li>
              <li><strong>Erasure:</strong> Delete personal data when legally required</li>
              <li><strong>Portability:</strong> Export data in machine-readable format</li>
              <li><strong>Restriction:</strong> Limit processing in specific circumstances</li>
              <li><strong>Objection:</strong> Allow objection to processing for specific purposes</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Data subject requests should be directed to: privacy@track-flow.app
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Data Retention and Deletion</h2>
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-3">Retention Periods</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Data:</strong> Retained while account is active</li>
                <li><strong>Time Tracking Data:</strong> Retained for 7 years for tax/accounting purposes</li>
                <li><strong>Backup Data:</strong> Automatically deleted after 90 days</li>
                <li><strong>Log Data:</strong> Deleted after 12 months</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Upon account termination, all data is securely deleted within 30 days unless legal retention is required.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Data Breach Notification</h2>
            <p className="mb-4">
              In the event of a personal data breach, TrackFlow will:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Notify the Controller within 72 hours of becoming aware of the breach</li>
              <li>Provide details of the nature of the breach and categories of data affected</li>
              <li>Describe measures taken to address the breach and mitigate harm</li>
              <li>Assist with breach notification to supervisory authorities if required</li>
              <li>Provide regular updates on investigation and remediation efforts</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. International Transfers</h2>
            <p className="mb-4">
              Personal data may be transferred to and processed in countries outside the EEA:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>United States:</strong> Protected by Standard Contractual Clauses (SCCs)</li>
              <li><strong>Transfer Mechanism:</strong> EU-approved Standard Contractual Clauses</li>
              <li><strong>Adequacy Decision:</strong> We monitor adequacy decisions and update accordingly</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              All international transfers comply with applicable data protection laws and include appropriate safeguards.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Audits and Compliance</h2>
            <p className="mb-4">
              TrackFlow maintains compliance through:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Annual SOC 2 Type II audits</li>
              <li>Regular penetration testing and security assessments</li>
              <li>Compliance monitoring and internal audits</li>
              <li>Staff training on data protection requirements</li>
              <li>Documentation of all processing activities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <p className="mb-4">
              Upon termination of this Agreement:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>TrackFlow will cease processing personal data</li>
              <li>Customer data will be made available for export for 30 days</li>
              <li>All personal data will be securely deleted within 30 days</li>
              <li>Deletion certificates will be provided upon request</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Data Protection Officer</h3>
              <p className="mb-2"><strong>Email:</strong> dpo@track-flow.app</p>
              <p className="mb-2"><strong>Privacy Team:</strong> privacy@track-flow.app</p>
              <p className="mb-4"><strong>Legal:</strong> legal@track-flow.app</p>

              <h4 className="font-semibold mb-2">Company Address:</h4>
              <p>
                TrackFlow Inc.<br />
                123 Business Street, Suite 100<br />
                San Francisco, CA 94105<br />
                United States
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Signature and Acceptance</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-blue-800 mb-4">
                This DPA is incorporated into and forms part of the Master Service Agreement between
                the parties. By using TrackFlow's Enterprise services, both parties agree to the terms
                of this Data Processing Agreement.
              </p>
              <p className="text-sm text-blue-700">
                For questions about this DPA or to request a signed copy, please contact our legal team
                at legal@track-flow.app.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}