// frontend/src/pages/policies/PrivacyPolicy.jsx
import SEO from '../../components/seo/SEO';

export default function PrivacyPolicy() {
  return (
    <>
      <SEO
        title="Privacy Policy - Policy"
        description="Privacy Policy for Rizara Luxe. Learn how we collect, use, and protect your personal information."
        canonical="https://www.rizara.in/privacy-policy"
        noindex={false}
      />

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: January 2026</p>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="leading-relaxed">
                At <strong>Rizara Luxe</strong>, we are committed to protecting your privacy and ensuring the security 
                of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard 
                your information when you visit our website <strong>www.rizara.in</strong> or make a purchase from us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              <p className="leading-relaxed mb-3">We collect the following types of information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Personal Information:</strong> Name, email address, phone number, shipping address, and billing address</li>
                <li><strong>Payment Information:</strong> Processed securely through Razorpay. We do not store your card details on our servers</li>
                <li><strong>Order Information:</strong> Purchase history, product preferences, and order details</li>
                <li><strong>Technical Information:</strong> IP address, browser type, device information, and cookies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="leading-relaxed mb-3">We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders and account</li>
                <li>Send promotional emails (with your consent)</li>
                <li>Improve our website and customer service</li>
                <li>Prevent fraud and ensure security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Payment Security</h2>
              <p className="leading-relaxed">
                All payment transactions are processed through <strong>Razorpay</strong>, a secure and PCI-DSS compliant 
                payment gateway. We do not store or have access to your complete credit/debit card information. 
                Razorpay uses industry-standard encryption to protect your payment details.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Sharing and Disclosure</h2>
              <p className="leading-relaxed mb-3">We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Payment Processors:</strong> Razorpay for processing payments</li>
                <li><strong>Shipping Partners:</strong> Delhivery and other logistics providers for order delivery</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
              </ul>
              <p className="leading-relaxed mt-3">
                We <strong>never</strong> sell your personal information to third parties for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies</h2>
              <p className="leading-relaxed">
                We use cookies to enhance your browsing experience, remember your preferences, and analyze website traffic. 
                You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Security</h2>
              <p className="leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
                over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Your Rights</h2>
              <p className="leading-relaxed mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access and review your personal information</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your data (subject to legal requirements)</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an 
                updated revision date. We encourage you to review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Us</h2>
              <p className="leading-relaxed mb-3">
                If you have any questions about this Privacy Policy or how we handle your data, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold">Rizara Luxe</p>
                <p>Email: <a href="mailto:support@rizara.in" className="text-pink-600 hover:underline">support@rizara.in</a></p>
                <p>Website: <a href="https://www.rizara.in" className="text-pink-600 hover:underline">www.rizara.in</a></p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}