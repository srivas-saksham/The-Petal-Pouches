// frontend/src/pages/policies/TermsConditions.jsx
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

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: January 2025</p>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="leading-relaxed">
                By accessing and using <strong>Rizara Luxe</strong> website (<strong>www.rizara.in</strong>), 
                you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, 
                you must not use our website or services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Business Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Brand Name:</strong> Rizara Luxe</p>
                <p><strong>Website:</strong> www.rizara.in</p>
                <p><strong>Business Type:</strong> Luxury Jewelry & Gifting</p>
                <p><strong>Country:</strong> India</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Products and Services</h2>
              <p className="leading-relaxed mb-3">
                Rizara Luxe offers luxury jewelry and curated gift bundles. All product descriptions, images, 
                and specifications are provided for informational purposes and may vary slightly from the actual product.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Product availability is subject to change without notice</li>
                <li>Prices are listed in Indian Rupees (INR) and include applicable taxes</li>
                <li>We reserve the right to modify prices at any time</li>
                <li>Product colors may vary slightly due to screen display settings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Account Registration</h2>
              <p className="leading-relaxed mb-3">To make a purchase, you may need to create an account. You agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Orders and Payments</h2>
              <p className="leading-relaxed mb-3">
                All payments are processed securely through <strong>Razorpay</strong>. By placing an order, you agree that:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are authorized to use the payment method provided</li>
                <li>Order confirmation does not guarantee product availability</li>
                <li>We reserve the right to cancel orders for any reason</li>
                <li>Payment must be received before order processing</li>
                <li>Failed payments will result in order cancellation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Pricing and Availability</h2>
              <p className="leading-relaxed">
                We make every effort to display accurate prices and product availability. However, we reserve the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Correct pricing errors</li>
                <li>Cancel orders affected by pricing errors</li>
                <li>Update product availability in real-time</li>
                <li>Limit quantities per customer</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p className="leading-relaxed">
                All content on Rizara Luxe website, including text, images, logos, designs, and graphics, 
                is the property of Rizara Luxe and protected by Indian copyright laws. You may not:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Reproduce or distribute our content without permission</li>
                <li>Use our trademarks or branding</li>
                <li>Modify or create derivative works</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. User Conduct</h2>
              <p className="leading-relaxed mb-3">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the website for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Transmit viruses or malicious code</li>
                <li>Harass or harm other users</li>
                <li>Submit false or misleading information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="leading-relaxed">
                To the maximum extent permitted by law, Rizara Luxe shall not be liable for any indirect, 
                incidental, special, or consequential damages arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Use or inability to use our website</li>
                <li>Unauthorized access to your data</li>
                <li>Errors or omissions in content</li>
                <li>Product quality issues (covered separately by our warranty)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Governing Law</h2>
              <p className="leading-relaxed">
                These Terms and Conditions are governed by the laws of <strong>India</strong>. 
                Any disputes shall be subject to the exclusive jurisdiction of the courts in India.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="leading-relaxed">
                We reserve the right to modify these Terms and Conditions at any time. Changes will be effective 
                immediately upon posting. Your continued use of the website constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="leading-relaxed mb-3">
                For questions about these Terms and Conditions, please contact us:
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