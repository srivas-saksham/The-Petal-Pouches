// frontend/src/pages/policies/PrivacyPolicy.jsx
import { Link } from 'react-router-dom';
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

      <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
        {/* Back to Home Link */}
        <div className="max-w-4xl mx-auto mb-4">
          <Link 
            to="/" 
            className="inline-flex items-center text-tpppink hover:text-pink-700 font-medium transition-colors"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Back to Home
          </Link>
        </div>

        <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-6 sm:p-8 md:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-6 sm:mb-8">Last updated: January 2026</p>

          <div className="space-y-6 sm:space-y-8 text-gray-700">
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">1. Introduction</h2>
              <p className="leading-relaxed text-sm sm:text-base">
                At <strong>Rizara Luxe</strong>, we are committed to protecting your privacy and ensuring the security 
                of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard 
                your information when you visit our website <strong>www.rizara.in</strong> or make a purchase from us.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">2. Information We Collect</h2>
              <p className="leading-relaxed mb-3 text-sm sm:text-base">We collect the following types of information:</p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm sm:text-base">
                <li><strong>Personal Information:</strong> Name, email address, phone number, shipping address, and billing address</li>
                <li><strong>Payment Information:</strong> Processed securely through Razorpay. We do not store your card details on our servers</li>
                <li><strong>Order Information:</strong> Purchase history, product preferences, and order details</li>
                <li><strong>Technical Information:</strong> IP address, browser type, device information, and cookies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">3. How We Use Your Information</h2>
              <p className="leading-relaxed mb-3 text-sm sm:text-base">We use your information to:</p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm sm:text-base">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders and account</li>
                <li>Send promotional emails (with your consent)</li>
                <li>Improve our website and customer service</li>
                <li>Prevent fraud and ensure security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">4. Payment Security</h2>
              <p className="leading-relaxed text-sm sm:text-base">
                All payment transactions are processed through <strong>Razorpay</strong>, a secure and PCI-DSS compliant 
                payment gateway. We do not store or have access to your complete credit/debit card information. 
                Razorpay uses industry-standard encryption to protect your payment details.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">5. Data Sharing and Disclosure</h2>
              <p className="leading-relaxed mb-3 text-sm sm:text-base">We may share your information with:</p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm sm:text-base">
                <li><strong>Payment Processors:</strong> Razorpay for processing payments</li>
                <li><strong>Shipping Partners:</strong> Delhivery, Blue Dart, DTDC, and other logistics providers for order delivery</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
              </ul>
              <p className="leading-relaxed mt-3 text-sm sm:text-base">
                We <strong>never</strong> sell your personal information to third parties for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">6. Cookies</h2>
              <p className="leading-relaxed text-sm sm:text-base">
                We use cookies to enhance your browsing experience, remember your preferences, and analyze website traffic. 
                You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">7. Data Security</h2>
              <p className="leading-relaxed text-sm sm:text-base">
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
                over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">8. Your Rights</h2>
              <p className="leading-relaxed mb-3 text-sm sm:text-base">You have the right to:</p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm sm:text-base">
                <li>Access and review your personal information</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your data (subject to legal requirements)</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">9. Data Retention</h2>
              <p className="leading-relaxed text-sm sm:text-base">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this 
                Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements. Order and 
                transaction data may be retained for accounting and tax purposes as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">10. Children's Privacy</h2>
              <p className="leading-relaxed text-sm sm:text-base">
                Our website and services are not intended for individuals under the age of 18. We do not knowingly 
                collect personal information from children. If you believe we have inadvertently collected information 
                from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">11. Changes to This Policy</h2>
              <p className="leading-relaxed text-sm sm:text-base">
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an 
                updated revision date. We encourage you to review this policy periodically to stay informed about 
                how we protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">12. Contact Us</h2>
              <p className="leading-relaxed mb-3 text-sm sm:text-base">
                If you have any questions about this Privacy Policy or how we handle your data, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg text-sm sm:text-base">
                <p className="font-semibold">Rizara Luxe</p>
                <p className="mt-1">Email: <a href="mailto:officialrizara@gmail.com" className="text-pink-600 hover:underline break-all">officialrizara@gmail.com</a></p>
                <p className="mt-1">Website: <a href="https://www.rizara.in" className="text-pink-600 hover:underline break-all">www.rizara.in</a></p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}