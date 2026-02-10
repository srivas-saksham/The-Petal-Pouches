// frontend/src/pages/policies/TermsConditions.jsx
import { Link } from 'react-router-dom';
import SEO from '../../components/seo/SEO';

export default function TermsConditions() {
  return (
    <>
      <SEO
        title="Terms & Conditions - Policy"
        description="Terms and Conditions for Rizara Luxe. Read our terms of service, usage policies, and legal agreements."
        canonical="https://www.rizara.in/terms-and-conditions"
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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
          <p className="text-sm text-gray-500 mb-6 sm:mb-8">Last updated: January 2026</p>

          <div className="space-y-6 sm:space-y-8 text-gray-700">
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">1. Agreement to Terms</h2>
              <p className="leading-relaxed text-sm sm:text-base">
                By accessing and using <strong>Rizara Luxe</strong> website (<strong>www.rizara.in</strong>), 
                you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, 
                you must not use our website or services.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">2. Business Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg text-sm sm:text-base">
                <p><strong>Brand Name:</strong> Rizara Luxe</p>
                <p className="mt-1"><strong>Website:</strong> <span className="break-all">www.rizara.in</span></p>
                <p className="mt-1"><strong>Business Type:</strong> Luxury Jewelry & Gifting</p>
                <p className="mt-1"><strong>Country:</strong> India</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">3. Products and Services</h2>
              <p className="leading-relaxed mb-3 text-sm sm:text-base">
                Rizara Luxe offers luxury jewelry and curated gift bundles. All product descriptions, images, 
                and specifications are provided for informational purposes and may vary slightly from the actual product.
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm sm:text-base">
                <li>Product availability is subject to change without notice</li>
                <li>Prices are listed in Indian Rupees (INR) and include applicable taxes</li>
                <li>We reserve the right to modify prices at any time</li>
                <li>Product colors may vary slightly due to screen display settings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">4. Account Registration</h2>
              <p className="leading-relaxed mb-3 text-sm sm:text-base">To make a purchase, you may need to create an account. You agree to:</p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm sm:text-base">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">5. Orders and Payments</h2>
              <p className="leading-relaxed mb-3 text-sm sm:text-base">
                All payments are processed securely through <strong>Razorpay</strong>. By placing an order, you agree that:
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm sm:text-base">
                <li>You are authorized to use the payment method provided</li>
                <li>Order confirmation does not guarantee product availability</li>
                <li>We reserve the right to cancel orders for any reason</li>
                <li>Payment must be received before order processing</li>
                <li>Failed payments will result in order cancellation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">6. Shipping and Delivery</h2>
              <p className="leading-relaxed mb-3 text-sm sm:text-base">
                Shipping and delivery terms are governed by our Shipping Policy. Key points include:
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm sm:text-base">
                <li>We ship across India using trusted courier partners</li>
                <li>Free shipping on orders above ₹1,000</li>
                <li>Standard shipping charge of ₹99 for orders below ₹1,000</li>
                <li>Delivery timelines vary by location (3-14 business days)</li>
                <li>Please refer to our <a href="/shipping-policy" className="text-pink-600 hover:underline">Shipping Policy</a> for complete details</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">7. Returns and Refunds</h2>
              <p className="leading-relaxed mb-3 text-sm sm:text-base">
                Our return and refund policy allows for returns within 7 days of delivery under specific conditions:
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm sm:text-base">
                <li>Returns accepted for damaged, defective, or incorrect items</li>
                <li>Customized/personalized items cannot be returned</li>
                <li>Shipping charges (₹99) are non-refundable except for defective/wrong items</li>
                <li>Refunds processed within 5-7 business days after approval</li>
                <li>Please refer to our <a href="/refund-policy" className="text-pink-600 hover:underline">Refund Policy</a> for complete details</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">8. Pricing and Availability</h2>
              <p className="leading-relaxed text-sm sm:text-base">
                We make every effort to display accurate prices and product availability. However, we reserve the right to:
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 mt-3 text-sm sm:text-base">
                <li>Correct pricing errors</li>
                <li>Cancel orders affected by pricing errors</li>
                <li>Update product availability in real-time</li>
                <li>Limit quantities per customer</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">9. Intellectual Property</h2>
              <p className="leading-relaxed text-sm sm:text-base">
                All content on Rizara Luxe website, including text, images, logos, designs, and graphics, 
                is the property of Rizara Luxe and protected by Indian copyright laws. You may not:
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 mt-3 text-sm sm:text-base">
                <li>Reproduce or distribute our content without permission</li>
                <li>Use our trademarks or branding</li>
                <li>Modify or create derivative works</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">10. User Conduct</h2>
              <p className="leading-relaxed mb-3 text-sm sm:text-base">You agree not to:</p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm sm:text-base">
                <li>Use the website for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Transmit viruses or malicious code</li>
                <li>Harass or harm other users</li>
                <li>Submit false or misleading information</li>
                <li>Engage in fraudulent activities or payment disputes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">11. Privacy and Data Protection</h2>
              <p className="leading-relaxed text-sm sm:text-base">
                We are committed to protecting your privacy. Your use of our website is also governed by our <a href="/privacy-policy" className="text-pink-600 hover:underline">Privacy Policy</a>, which explains how we collect, use, and protect your personal information. By using our services, you consent to our data practices as described in the Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">12. Limitation of Liability</h2>
              <p className="leading-relaxed text-sm sm:text-base">
                To the maximum extent permitted by law, Rizara Luxe shall not be liable for any indirect, 
                incidental, special, or consequential damages arising from:
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 mt-3 text-sm sm:text-base">
                <li>Use or inability to use our website</li>
                <li>Unauthorized access to your data</li>
                <li>Errors or omissions in content</li>
                <li>Delays or failures in delivery due to third-party courier services</li>
                <li>Product quality issues (covered separately by our return policy)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">13. Force Majeure</h2>
              <p className="leading-relaxed text-sm sm:text-base">
                Rizara Luxe shall not be held liable for any failure or delay in performance due to circumstances beyond our reasonable control, including but not limited to natural disasters, acts of government, war, terrorism, labor strikes, internet failures, or courier service disruptions.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">14. Severability</h2>
              <p className="leading-relaxed text-sm sm:text-base">
                If any provision of these Terms and Conditions is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">15. Governing Law</h2>
              <p className="leading-relaxed text-sm sm:text-base">
                These Terms and Conditions are governed by the laws of <strong>India</strong>. 
                Any disputes shall be subject to the exclusive jurisdiction of the courts in India.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">16. Changes to Terms</h2>
              <p className="leading-relaxed text-sm sm:text-base">
                We reserve the right to modify these Terms and Conditions at any time. Changes will be effective 
                immediately upon posting. Your continued use of the website constitutes acceptance of the updated terms. We encourage you to review this page periodically.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">17. Contact Information</h2>
              <p className="leading-relaxed mb-3 text-sm sm:text-base">
                For questions about these Terms and Conditions, please contact us:
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