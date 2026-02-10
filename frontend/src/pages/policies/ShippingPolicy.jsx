// frontend/src/pages/policies/ShippingPolicy.jsx
import { Link } from 'react-router-dom';
import SEO from '../../components/seo/SEO';

export default function ShippingPolicy() {
  return (
    <>
      <SEO
        title="Shipping & Delivery - Policy"
        description="Shipping and Delivery Policy for Rizara Luxe. Learn about delivery timelines, shipping charges, and tracking information."
        canonical="https://www.rizara.in/shipping-policy"
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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Shipping & Delivery Policy</h1>
          <p className="text-sm text-gray-500 mb-6 sm:mb-8">Last updated: January 2026</p>

          <div className="space-y-6 sm:space-y-8 text-gray-700">
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">1. Overview</h2>
              <p className="leading-relaxed text-sm sm:text-base">
                <strong>Rizara Luxe</strong> is committed to delivering your luxury jewelry and gifts safely and on time. 
                This policy outlines our shipping process, delivery timelines, and charges.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">2. Shipping Coverage</h2>
              <p className="leading-relaxed mb-3 text-sm sm:text-base">
                We currently ship to all locations across <strong>India</strong>.
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm sm:text-base">
                <li><strong>Metro Cities:</strong> Delhi, Mumbai, Bangalore, Hyderabad, Chennai, Kolkata, Pune, etc.</li>
                <li><strong>Tier 2/3 Cities:</strong> All major towns and cities</li>
                <li><strong>Remote Areas:</strong> Subject to courier serviceability (we'll notify you if undeliverable)</li>
              </ul>
              <p className="leading-relaxed mt-3 text-gray-600 italic text-sm sm:text-base">
                International shipping is not available at this time.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">3. Processing Time</h2>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 mb-4">
                <p className="font-semibold text-blue-900 text-sm sm:text-base">Order Processing:</p>
                <p className="text-blue-800 mt-2 text-sm sm:text-base">
                  Orders are typically processed within <strong>1-2 business days</strong> after payment confirmation.
                </p>
              </div>
              <p className="leading-relaxed mb-3 text-sm sm:text-base">Processing includes:</p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm sm:text-base">
                <li>Payment verification</li>
                <li>Quality check</li>
                <li>Secure packaging</li>
                <li>Handover to courier partner</li>
              </ul>
              <p className="leading-relaxed mt-3 text-gray-600 text-sm sm:text-base">
                <strong>Note:</strong> Processing time may increase during festive seasons or promotional sales.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">4. Delivery Timeline</h2>
              <div className="overflow-x-auto -mx-6 sm:mx-0">
                <div className="inline-block min-w-full px-6 sm:px-0">
                  <table className="min-w-full border border-gray-300 mt-4 text-sm sm:text-base">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold">Location Type</th>
                        <th className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold">Delivery Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3">Metro Cities</td>
                        <td className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3">3-5 business days</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3">Tier 2 Cities</td>
                        <td className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3">5-7 business days</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3">Tier 3 Cities & Towns</td>
                        <td className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3">7-10 business days</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3">Remote Areas</td>
                        <td className="border border-gray-300 px-3 sm:px-4 py-2 sm:py-3">10-14 business days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="leading-relaxed mt-4 text-gray-600 italic text-sm sm:text-base">
                Delivery timelines are estimates and may vary due to external factors beyond our control.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">5. Shipping Charges</h2>
              <div className="space-y-4">
                <div className="bg-green-50 border-l-4 border-green-500 p-3 sm:p-4">
                  <p className="font-semibold text-green-900 text-sm sm:text-base">✓ FREE Shipping</p>
                  <p className="text-green-800 mt-1 text-sm sm:text-base">
                    On orders above ₹1,000
                  </p>
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 sm:p-4">
                  <p className="font-semibold text-yellow-900 text-sm sm:text-base">Standard Shipping</p>
                  <p className="text-yellow-800 mt-1 text-sm sm:text-base">
                    ₹99 for orders below ₹1,000
                  </p>
                </div>
              </div>
              <p className="leading-relaxed mt-4 text-sm sm:text-base">
                Shipping charges (if applicable) will be calculated and displayed at checkout before payment.
              </p>
              <div className="bg-orange-50 border-l-4 border-orange-500 p-3 sm:p-4 mt-4">
                <p className="font-semibold text-orange-900 text-sm sm:text-base">⚠️ Important Note:</p>
                <p className="text-orange-800 mt-1 text-sm sm:text-base">
                  The shipping charge of ₹99 is <strong>non-refundable</strong> in case of order cancellation or return. Please refer to our Refund Policy for complete details.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">6. Shipping Partners</h2>
              <p className="leading-relaxed mb-3 text-sm sm:text-base">
                We partner with trusted courier services to ensure safe and timely delivery:
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm sm:text-base">
                <li><strong>Delhivery</strong></li>
                <li><strong>Blue Dart</strong></li>
                <li><strong>DTDC</strong></li>
                <li>Other reputable logistics providers</li>
              </ul>
              <p className="leading-relaxed mt-3 text-sm sm:text-base">
                The courier partner is automatically selected based on your delivery location for optimal service.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">7. Order Tracking</h2>
              <p className="leading-relaxed mb-3 text-sm sm:text-base">
                Once your order is shipped, you will receive:
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm sm:text-base">
                <li><strong>Shipment confirmation email</strong> with tracking number</li>
                <li><strong>SMS notification</strong> with tracking link</li>
                <li><strong>Real-time tracking</strong> through "My Orders" on our website</li>
              </ul>
              <p className="leading-relaxed mt-3 text-sm sm:text-base">
                You can also track your order directly on the courier partner's website using the tracking number.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">8. Delivery Attempts</h2>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm sm:text-base">
                <li>The courier will make <strong>up to 3 delivery attempts</strong></li>
                <li>You will be notified via SMS/call before each attempt</li>
                <li>If all attempts fail, the order will be returned to us</li>
                <li>Return shipping charges may apply for re-delivery</li>
              </ul>
              <p className="leading-relaxed mt-3 text-orange-700 font-medium text-sm sm:text-base">
                ⚠️ Please ensure someone is available to receive the package or provide alternate delivery instructions.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">9. Delivery Issues</h2>
              
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 mt-4">9.1 Delayed Delivery</h3>
              <p className="leading-relaxed mb-3 text-sm sm:text-base">
                Delays may occur due to:
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm sm:text-base">
                <li>Natural calamities or extreme weather</li>
                <li>Political unrest or strikes</li>
                <li>Public holidays</li>
                <li>Incorrect address or contact details</li>
                <li>Courier serviceability issues</li>
              </ul>
              <p className="leading-relaxed mt-3 text-sm sm:text-base">
                We will proactively notify you of any significant delays and provide updated delivery estimates.
              </p>

              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 mt-6">9.2 Lost or Damaged in Transit</h3>
              <p className="leading-relaxed mb-3 text-sm sm:text-base">
                If your order is lost or damaged during shipping:
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm sm:text-base">
                <li>Contact us immediately at <a href="mailto:officialrizara@gmail.com" className="text-pink-600 hover:underline break-all">officialrizara@gmail.com</a></li>
                <li>Provide your order number and photos (for damaged items)</li>
                <li>We will file a claim with the courier</li>
                <li>Full refund or replacement will be provided</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">10. Address Changes</h2>
              <p className="leading-relaxed text-sm sm:text-base">
                Address changes are only possible <strong>before the order is shipped</strong>. 
                Contact us immediately at <a href="mailto:officialrizara@gmail.com" className="text-pink-600 hover:underline break-all">officialrizara@gmail.com</a> if you need to update your delivery address.
              </p>
              <p className="leading-relaxed mt-3 text-gray-600 text-sm sm:text-base">
                Once shipped, the address cannot be modified. You may need to refuse delivery and place a new order.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">11. Packaging</h2>
              <p className="leading-relaxed text-sm sm:text-base">
                All orders are carefully packaged to ensure your items arrive in perfect condition:
              </p>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 mt-3 text-sm sm:text-base">
                <li>Premium gift packaging for jewelry items</li>
                <li>Bubble wrap and protective cushioning</li>
                <li>Tamper-proof sealed boxes</li>
                <li>Fragile stickers for delicate items</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">12. Contact Us for Shipping Queries</h2>
              <p className="leading-relaxed mb-3 text-sm sm:text-base">
                For any shipping-related questions or concerns:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg text-sm sm:text-base">
                <p className="font-semibold">Rizara Luxe</p>
                <p className="mt-1">Email: <a href="mailto:officialrizara@gmail.com" className="text-pink-600 hover:underline break-all">officialrizara@gmail.com</a></p>
                <p className="mt-1">Response Time: Within 24 hours</p>
                <p className="mt-1">Website: <a href="https://www.rizara.in" className="text-pink-600 hover:underline break-all">www.rizara.in</a></p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}