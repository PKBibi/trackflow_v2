import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - TrackFlow',
  description: 'Terms of Service for TrackFlow time tracking application',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-16 px-4">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using TrackFlow ("the Service"), you agree to be bound by these Terms of Service ("Terms"). 
              If you disagree with any part of these terms, you do not have permission to access the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p>
              TrackFlow is a time tracking and project management platform designed specifically for digital marketing 
              professionals, freelancers, and agencies. The Service includes features for time tracking, client management, 
              project organization, invoicing, and reporting.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must provide accurate, complete, and current information during registration</li>
              <li>You are responsible for safeguarding your account password</li>
              <li>You agree to notify us immediately of any unauthorized access to your account</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>You must be at least 13 years old to use the Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any illegal purpose or to solicit illegal activities</li>
              <li>Transmit any malicious code, viruses, or harmful content</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Copy, modify, or distribute the Service's software or content</li>
              <li>Use the Service to send spam or unsolicited messages</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Subscription and Payment</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Some features of the Service require a paid subscription</li>
              <li>Subscription fees are billed in advance on a monthly or annual basis</li>
              <li>All fees are non-refundable except as required by law</li>
              <li>We reserve the right to modify pricing with 30 days notice</li>
              <li>Failure to pay may result in termination of your access to the Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by TrackFlow and are protected 
              by international copyright, trademark, patent, trade secret, and other intellectual property laws. You 
              retain ownership of any content you submit to the Service, but grant us a license to use, modify, and 
              display that content as necessary to provide the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Privacy and Data Protection</h2>
            <p>
              Your use of the Service is also governed by our Privacy Policy. By using the Service, you consent to 
              the collection and use of information as described in our Privacy Policy. We are committed to protecting 
              your data and maintaining compliance with applicable data protection regulations including GDPR and CCPA.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, TrackFlow shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred 
              directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason, 
              including breach of these Terms. Upon termination, your right to use the Service will cease immediately. 
              You may terminate your account at any time through the account settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will 
              provide at least 30 days notice prior to any new terms taking effect. Continued use of the Service after 
              changes become effective constitutes acceptance of the revised terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="mt-4">
              <p>TrackFlow</p>
              <p>Email: legal@trackflow.app</p>
              <p>Address: [Your Business Address]</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

