// frontend/src/pages/policies/RefundPolicy.jsx
import SEO from '../../components/seo/SEO';

export default function RefundPolicy() {
  return (
    <>
      <SEO
        title="Refund & Cancellation - Policy"
        description="Refund and Cancellation Policy for Rizara Luxe. Learn about our return process, refund timelines, and cancellation terms."
        canonical="https://www.rizara.in/refund-policy"
        noindex={false}
      />

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Refund & Cancellation Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: January 2025</p>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Overview</h2>
              <p className="leading-relaxed">
                At <strong>Rizara Luxe</strong>, we want you to be completely satisfied with your purchase. 
                This policy outlines the terms for order cancellations and refunds.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Order Cancellation</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">2.1 Before Shipment</h3>
              <p className="leading-relaxed mb-3">
                You can cancel your order anytime before it is shipped. To cancel:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Log in to your account and go to "My Orders"</li>
                <li>Select the order you wish to cancel</li>
                <li>Click "Cancel Order" and confirm</li>
                <li>Or email us at <a href="mailto:support@rizara.in" className="text-pink-600 hover:underline">support@rizara.in</a> with your order number</li>
              </ul>
              <p className="leading-relaxed mt-3 text-green-700 font-medium">
                ✓ Full refund will be initiated within 24-48 hours
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.2 After Shipment</h3>
              <p className="leading-relaxed">
                Once the order has been shipped, cancellation is not possible. However, you may return the product 
                after delivery as per our return policy (see Section 3).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Return Policy</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">3.1 Eligibility for Returns</h3>
              <p className="leading-relaxed mb-3">
                You can return products within <strong>7 days</strong> of delivery if:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Product is damaged or defective</li>
                <li>Wrong item was delivered</li>
                <li>Product does not match the description</li>
                <li>Missing parts or accessories</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.2 Non-Returnable Items</h3>
              <p className="leading-relaxed mb-3">
                The following items cannot be returned:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Customized or personalized jewelry</li>
                <li>Products with broken seals or tampered packaging</li>
                <li>Items damaged due to misuse</li>
                <li>Items without original packaging and tags</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.3 Return Process</h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Contact us at <a href="mailto:support@rizara.in" className="text-pink-600 hover:underline">support@rizara.in</a> within 7 days of delivery</li>
                <li>Provide your order number and reason for return</li>
                <li>We will arrange a pickup or provide return instructions</li>
                <li>Pack the item securely in its original packaging</li>
                <li>Our team will inspect the returned item</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Refund Process</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">4.1 Refund Timeline</h3>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                <p className="font-semibold text-blue-900">Standard Refund Timeline:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2 text-blue-800">
                  <li>Inspection: 2-3 business days after receiving the return</li>
                  <li>Refund initiation: Within 24 hours of approval</li>
                  <li>Credit to your account: 5-7 business days</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.2 Refund Method</h3>
              <p className="leading-relaxed mb-3">
                Refunds will be processed to the <strong>original payment method</strong> used during purchase:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Credit/Debit Card:</strong> 5-7 business days</li>
                <li><strong>UPI/Net Banking:</strong> 3-5 business days</li>
                <li><strong>Wallets:</strong> 2-3 business days</li>
              </ul>
              <p className="leading-relaxed mt-3 text-gray-600 italic">
                Note: Refund timelines may vary depending on your bank or payment provider.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.3 Partial Refunds</h3>
              <p className="leading-relaxed mb-3">
                Partial refunds may be granted in cases where:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Item is returned with signs of use or wear</li>
                <li>Packaging is damaged but product is intact</li>
                <li>Return is made after the 7-day window (at our discretion)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Exchanges</h2>
              <p className="leading-relaxed">
                We do not offer direct exchanges. If you wish to exchange a product:
              </p>
              <ol className="list-decimal pl-6 space-y-2 mt-3">
                <li>Return the original item for a refund</li>
                <li>Place a new order for the desired product</li>
              </ol>
              <p className="leading-relaxed mt-3">
                This ensures faster processing and gives you more flexibility in choosing your replacement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Damaged or Defective Products</h2>
              <p className="leading-relaxed mb-3">
                If you receive a damaged or defective product:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Contact us immediately with photos of the damage</li>
                <li>Do not discard the packaging</li>
                <li>We will arrange a free pickup</li>
                <li>Full refund or replacement will be provided</li>
                <li>No questions asked for genuine cases</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Payment Gateway Refunds</h2>
              <p className="leading-relaxed">
                All refunds are processed through <strong>Razorpay</strong>, our secure payment gateway. 
                Razorpay will credit the refund amount to your original payment method. The refund timeline 
                depends on your bank's processing time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Shipping Charges</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Defective/Wrong Item:</strong> We cover all return shipping costs</li>
                <li><strong>Change of Mind:</strong> Customer is responsible for return shipping</li>
                <li><strong>Order Cancellation (before shipment):</strong> No shipping charges</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Us for Refunds</h2>
              <p className="leading-relaxed mb-3">
                For any questions or to initiate a return/refund:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold">Rizara Luxe</p>
                <p>Email: <a href="mailto:support@rizara.in" className="text-pink-600 hover:underline">support@rizara.in</a></p>
                <p>Response Time: Within 24 hours</p>
                <p>Website: <a href="https://www.rizara.in" className="text-pink-600 hover:underline">www.rizara.in</a></p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}