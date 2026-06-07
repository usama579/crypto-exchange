export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Name, email address, phone number</li>
                    <li>Government-issued identification documents</li>
                    <li>Proof of address documentation</li>
                    <li>Financial information for verification purposes</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Usage Information</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Trading activity and transaction history</li>
                    <li>Device information and IP addresses</li>
                    <li>Browser type and operating system</li>
                    <li>Pages visited and time spent on our platform</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide and improve our cryptocurrency exchange services</li>
                <li>To verify your identity and comply with regulatory requirements</li>
                <li>To process transactions and maintain accurate records</li>
                <li>To detect and prevent fraud, money laundering, and other illegal activities</li>
                <li>To communicate with you about your account and our services</li>
                <li>To comply with legal obligations and regulatory requirements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">3. Information Sharing and Disclosure</h2>
              <p className="mb-4">We may share your information in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>With regulatory authorities and law enforcement when required by law</li>
                <li>With third-party service providers who assist in operating our platform</li>
                <li>With financial institutions for payment processing</li>
                <li>In connection with a merger, acquisition, or sale of assets</li>
                <li>When we have your explicit consent</li>
              </ul>
              <p className="mt-4">We do not sell your personal information to third parties for marketing purposes.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">4. Data Security</h2>
              <div className="space-y-2">
                <p>We implement industry-standard security measures to protect your information:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>SSL encryption for data transmission</li>
                  <li>Multi-factor authentication for account access</li>
                  <li>Cold storage for cryptocurrency assets</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Employee background checks and access controls</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">5. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to provide our services and comply with legal obligations.
                Transaction records and identity verification documents may be retained for regulatory compliance purposes even after account closure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">6. Your Rights and Choices</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access and review your personal information</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your information (subject to legal requirements)</li>
                <li>Object to processing of your information</li>
                <li>Data portability where technically feasible</li>
                <li>Withdraw consent for optional data processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">7. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar technologies to improve your experience, analyze usage patterns, and provide personalized content.
                You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">8. Third-Party Links</h2>
              <p>
                Our platform may contain links to third-party websites. We are not responsible for the privacy practices
                of these external sites and encourage you to review their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">9. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your residence.
                We ensure appropriate safeguards are in place to protect your information during such transfers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">10. Children's Privacy</h2>
              <p>
                Our services are not intended for individuals under 18 years of age.
                We do not knowingly collect personal information from children under 18.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">11. Changes to Privacy Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of significant changes
                through email or prominent notices on our platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">12. Contact Information</h2>
              <p>
                If you have questions about this privacy policy or our data practices, please contact us at:
              </p>
              <div className="mt-2">
                <p>Email: privacy@coindexy.com</p>
                <p>Address: [Your Company Address]</p>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}