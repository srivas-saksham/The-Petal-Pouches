// frontend/src/pages/policies/ContactUs.jsx
import { Link } from 'react-router-dom';
import SEO from '../../components/seo/SEO';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function ContactUs() {
  return (
    <>
      <SEO
        title="Contact Us - Policy"
        description="Get in touch with Rizara Luxe. Contact our customer support team for queries about orders, products, or any assistance."
        canonical="https://www.rizara.in/contact-us"
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

        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-sm rounded-lg p-6 sm:p-8 md:p-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Contact Us</h1>
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
              We're here to help! Reach out to us for any queries, support, or feedback.
            </p>

            <div className="space-y-6 sm:space-y-8">
              {/* Contact Information Cards */}
              <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Email */}
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 sm:p-6">
                  <div className="flex items-center mb-3">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600 mr-2 sm:mr-3 flex-shrink-0" />
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Email Us</h2>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 mb-2">For general inquiries and support:</p>
                  <a 
                    href="mailto:officialrizara@gmail.com" 
                    className="text-pink-600 hover:text-pink-700 font-semibold text-base sm:text-lg break-all"
                  >
                    officialrizara@gmail.com
                  </a>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">
                    We typically respond within 24 hours
                  </p>
                </div>

                {/* Phone */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                  <div className="flex items-center mb-3">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Call Us</h2>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 mb-2">Customer support hotline:</p>
                  <a 
                    href="tel:+919876543210" 
                    className="text-blue-600 hover:text-blue-700 font-semibold text-base sm:text-lg"
                  >
                    +91 98765 43210
                  </a>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">
                    Mon-Sat: 10:00 AM - 7:00 PM IST
                  </p>
                </div>

                {/* Business Location */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
                  <div className="flex items-center mb-3">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2 sm:mr-3 flex-shrink-0" />
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Location</h2>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 font-semibold">Rizara Luxe</p>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    India
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">
                    Serving customers across India
                  </p>
                </div>

                {/* Business Hours */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 sm:p-6">
                  <div className="flex items-center mb-3">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mr-2 sm:mr-3 flex-shrink-0" />
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Support Hours</h2>
                  </div>
                  <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                    <li><strong>Monday - Friday:</strong> 10:00 AM - 7:00 PM</li>
                    <li><strong>Saturday:</strong> 10:00 AM - 5:00 PM</li>
                    <li><strong>Sunday:</strong> Closed</li>
                  </ul>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">
                    Email support available 24/7
                  </p>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-gray-100 rounded-lg p-4 sm:p-6 mt-6 sm:mt-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">Quick Links</h2>
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-2">Customer Support</h3>
                    <ul className="space-y-2 text-sm sm:text-base text-gray-600">
                      <li>
                        <a href="/faqs" className="hover:text-pink-600 transition-colors">
                          Frequently Asked Questions
                        </a>
                      </li>
                      <li>
                        <a href="/shipping-policy" className="hover:text-pink-600 transition-colors">
                          Shipping & Delivery
                        </a>
                      </li>
                      <li>
                        <a href="/refund-policy" className="hover:text-pink-600 transition-colors">
                          Returns & Refunds
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-2">Legal</h3>
                    <ul className="space-y-2 text-sm sm:text-base text-gray-600">
                      <li>
                        <a href="/privacy-policy" className="hover:text-pink-600 transition-colors">
                          Privacy Policy
                        </a>
                      </li>
                      <li>
                        <a href="/terms-and-conditions" className="hover:text-pink-600 transition-colors">
                          Terms & Conditions
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* What We Can Help With */}
              <div className="mt-6 sm:mt-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">What We Can Help With</h2>
                <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-2">Orders</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Order status & tracking</li>
                      <li>• Order modifications</li>
                      <li>• Cancellations</li>
                    </ul>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-2">Products</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Product information</li>
                      <li>• Customization options</li>
                      <li>• Gift recommendations</li>
                    </ul>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-2">Account</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Account issues</li>
                      <li>• Password reset</li>
                      <li>• Address updates</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 sm:p-6 mt-6 sm:mt-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">Business Information</h2>
                <div className="space-y-2 text-sm sm:text-base text-gray-700">
                  <p><strong>Business Name:</strong> Rizara Luxe</p>
                  <p><strong>Website:</strong> <a href="https://www.rizara.in" className="text-pink-600 hover:underline break-all">www.rizara.in</a></p>
                  <p><strong>Email:</strong> <a href="mailto:officialrizara@gmail.com" className="text-pink-600 hover:underline break-all">officialrizara@gmail.com</a></p>
                  <p><strong>Country:</strong> India</p>
                </div>
              </div>

              {/* Note */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4 mt-6">
                <p className="text-xs sm:text-sm text-yellow-800">
                  <strong>Note:</strong> For urgent order-related queries, please include your order number 
                  in your email subject line for faster assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}