export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using this cryptocurrency exchange platform, you accept and agree to be bound by the terms and provision of this agreement.
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">2. Eligibility</h2>
              <p>
                You must be at least 18 years old and legally capable of entering into contracts to use our services.
                By using our platform, you represent and warrant that you meet these eligibility requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">3. Account Registration and Security</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide accurate and complete information during registration</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>We reserve the right to suspend or terminate accounts that violate our terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">4. Trading Rules and Restrictions</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>All trades are final once executed</li>
                <li>We reserve the right to cancel trades that appear to be fraudulent or manipulative</li>
                <li>Market manipulation, wash trading, and other abusive practices are strictly prohibited</li>
                <li>We may implement trading limits and restrictions as necessary</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">5. Fees and Charges</h2>
              <p>
                Our platform charges fees for various services including trading, deposits, and withdrawals.
                Current fee schedules are available on our website and may be updated from time to time with notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">6. Risk Disclosure</h2>
              <p>
                Cryptocurrency trading involves substantial risk of loss and is not suitable for all investors.
                You should carefully consider whether trading is appropriate for you in light of your circumstances, knowledge, and financial resources.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">7. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">8. Intellectual Property</h2>
              <p>
                All content, features, and functionality of our platform are owned by us and are protected by copyright,
                trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">9. Modifications to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.
                Your continued use of the platform constitutes acceptance of any changes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">10. Contact Information</h2>
              <p>
                If you have any questions about these Terms and Conditions, please contact us at support@coindexy.com
              </p>
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