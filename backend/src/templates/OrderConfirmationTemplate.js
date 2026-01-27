// backend/src/templates/OrderConfirmationTemplate.js

function OrderConfirmationTemplate({ name, order }) {
  const {
    id: orderId,
    created_at,
    subtotal,
    express_charge,
    discount,
    final_total,
    shipping_address,
    payment_method,
    status,
    items = [],
    delivery_metadata = {}
  } = order;

  // Format date
  const orderDate = new Date(created_at).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Format delivery date if available
  const expectedDelivery = delivery_metadata.expected_delivery_date
    ? new Date(delivery_metadata.expected_delivery_date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Will be updated soon';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 8px;">
        <tr>
          <td align="center">
            <table width="100%" style="max-width: 600px;" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              
              <!-- Header -->
              <tr>
                <td style="padding: 30px 16px 20px; border-bottom: 1px solid #e5e5e5;">
                  <h1 style="margin: 0; font-size: 12px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; color: #1a1a1a; text-align: center;">
                    Rizara Luxe
                  </h1>
                </td>
              </tr>

              <!-- Success Message -->
              <tr>
                <td style="padding: 30px 16px 20px; text-align: center; background-color: #f0fdf4; border-bottom: 1px solid #86efac;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <div style="display: inline-block; width: 48px; height: 48px; background-color: #22c55e; border-radius: 50%; margin-bottom: 12px; position: relative;">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      </td>
                    </tr>
                  </table>
                  <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 500; color: #166534;">
                    Order Confirmed
                  </h2>
                  <p style="margin: 0; font-size: 13px; color: #15803d;">
                    Thank you for your purchase, ${name}
                  </p>
                </td>
              </tr>

              <!-- Order Info -->
              <tr>
                <td style="padding: 24px 16px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                    <tr>
                      <td style="padding: 12px; background-color: #fafafa; border-radius: 4px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 4px 0;">
                              <span style="font-size: 11px; color: #737373; text-transform: uppercase; letter-spacing: 0.5px;">Order ID</span>
                            </td>
                            <td align="right" style="padding: 4px 0;">
                              <span style="font-size: 13px; color: #1a1a1a; font-weight: 500;">#${orderId}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 4px 0;">
                              <span style="font-size: 11px; color: #737373; text-transform: uppercase; letter-spacing: 0.5px;">Order Date</span>
                            </td>
                            <td align="right" style="padding: 4px 0;">
                              <span style="font-size: 13px; color: #1a1a1a;">${orderDate}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 4px 0;">
                              <span style="font-size: 11px; color: #737373; text-transform: uppercase; letter-spacing: 0.5px;">Status</span>
                            </td>
                            <td align="right" style="padding: 4px 0;">
                              <span style="display: inline-block; padding: 4px 12px; background-color: #fef3c7; color: #92400e; font-size: 11px; font-weight: 500; text-transform: uppercase; border-radius: 12px; letter-spacing: 0.5px;">${status}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Order Items -->
                  <h3 style="margin: 0 0 12px; font-size: 14px; font-weight: 500; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">
                    Order Items
                  </h3>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 4px; margin-bottom: 20px;">
                    ${items.map((item, index) => `
                      <tr style="border-bottom: ${index < items.length - 1 ? '1px solid #e5e5e5' : 'none'};">
                        <td style="padding: 12px;">
                          <div style="font-size: 13px; color: #1a1a1a; font-weight: 500; margin-bottom: 4px;">
                            ${item.bundle_title || item.product_title || 'Product'}
                          </div>
                          <div style="font-size: 11px; color: #737373;">
                            ${item.bundle_origin === 'brand-bundle' ? 'Bundle' : 'Product'} × ${item.quantity}
                          </div>
                        </td>
                        <td align="right" style="padding: 12px;">
                          <div style="font-size: 13px; color: #1a1a1a; font-weight: 500;">
                            ₹${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </table>

                  <!-- Price Breakdown -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #f5f5f5;">
                        <span style="font-size: 13px; color: #525252;">Subtotal</span>
                      </td>
                      <td align="right" style="padding: 8px 0; border-bottom: 1px solid #f5f5f5;">
                        <span style="font-size: 13px; color: #1a1a1a;">₹${subtotal.toFixed(2)}</span>
                      </td>
                    </tr>
                    ${express_charge > 0 ? `
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #f5f5f5;">
                        <span style="font-size: 13px; color: #525252;">Express Delivery</span>
                      </td>
                      <td align="right" style="padding: 8px 0; border-bottom: 1px solid #f5f5f5;">
                        <span style="font-size: 13px; color: #1a1a1a;">₹${express_charge.toFixed(2)}</span>
                      </td>
                    </tr>
                    ` : ''}
                    ${discount > 0 ? `
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #f5f5f5;">
                        <span style="font-size: 13px; color: #16a34a;">Discount</span>
                      </td>
                      <td align="right" style="padding: 8px 0; border-bottom: 1px solid #f5f5f5;">
                        <span style="font-size: 13px; color: #16a34a;">-₹${discount.toFixed(2)}</span>
                      </td>
                    </tr>
                    ` : ''}
                    <tr>
                      <td style="padding: 12px 0;">
                        <span style="font-size: 15px; color: #1a1a1a; font-weight: 600;">Total</span>
                      </td>
                      <td align="right" style="padding: 12px 0;">
                        <span style="font-size: 16px; color: #1a1a1a; font-weight: 600;">₹${final_total.toFixed(2)}</span>
                      </td>
                    </tr>
                  </table>

                  <!-- Delivery Info -->
                  <h3 style="margin: 0 0 12px; font-size: 14px; font-weight: 500; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">
                    Delivery Information
                  </h3>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                    <tr>
                      <td style="padding: 12px; background-color: #fafafa; border-radius: 4px; border-left: 3px solid #d95669;">
                        <div style="font-size: 12px; color: #1a1a1a; line-height: 18px;">
                          <div style="font-weight: 500; margin-bottom: 4px;">${name}</div>
                          <div style="color: #525252;">
                            ${shipping_address.line1}${shipping_address.line2 ? ', ' + shipping_address.line2 : ''}<br>
                            ${shipping_address.landmark ? shipping_address.landmark + '<br>' : ''}
                            ${shipping_address.city}, ${shipping_address.state} ${shipping_address.zip_code}<br>
                            ${shipping_address.country || 'India'}<br>
                            Phone: ${shipping_address.phone}
                          </div>
                        </div>
                      </td>
                    </tr>
                  </table>

                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                    <tr>
                      <td style="padding: 12px; background-color: #eff6ff; border-radius: 4px; border-left: 3px solid #3b82f6;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width: 24px; vertical-align: top; padding-top: 2px;">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="1" y="3" width="15" height="13"></rect>
                                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                <circle cx="18.5" cy="18.5" r="2.5"></circle>
                              </svg>
                            </td>
                            <td style="padding-left: 12px;">
                              <div style="font-size: 12px; color: #1e40af; line-height: 18px;">
                                <div style="font-weight: 500; margin-bottom: 4px;">Expected Delivery</div>
                                <div style="color: #1e3a8a;">${expectedDelivery}</div>
                                <div style="margin-top: 8px; color: #1e3a8a; font-weight: 500;">
                                  Tracking will be available once the order is processed
                                </div>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Payment Method -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                    <tr>
                      <td style="padding: 12px; background-color: #fafafa; border-radius: 4px;">
                        <div style="font-size: 11px; color: #737373; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                          Payment Method
                        </div>
                        <div style="font-size: 13px; color: #1a1a1a; font-weight: 500;">
                          ${payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Help Section -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e5e5;">
                    <tr>
                        <td style="text-align: center;">
                        <p style="margin: 0 0 16px; font-size: 13px; color: #525252;">
                            Questions about your order?
                        </p>
                        <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                            <tr>
                            <td style="padding-right: 8px;">
                                <a href="mailto:officialrizara@gmail.com" style="display: inline-block; padding: 10px 20px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase; border-radius: 4px;">
                                Email Us
                                </a>
                            </td>
                            <td style="padding-left: 8px;">
                                <a href="https://wa.me/919217791695" style="display: inline-block; padding: 10px 20px; background-color: #25D366; color: #ffffff; text-decoration: none; font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase; border-radius: 4px;">
                                WhatsApp
                                </a>
                            </td>
                            </tr>
                        </table>
                        <p style="margin: 12px 0 0; font-size: 11px; color: #737373;">
                            officialrizara@gmail.com • +91 92177 91695
                        </p>
                        </td>
                    </tr>
                    </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 20px 16px; border-top: 1px solid #e5e5e5; text-align: center;">
                  <p style="margin: 0 0 8px; font-size: 11px; line-height: 16px; color: #a3a3a3;">
                    © ${new Date().getFullYear()} Rizara Luxe. All rights reserved.
                  </p>
                  <p style="margin: 0; font-size: 10px; line-height: 14px; color: #d4d4d4;">
                    This is an automated confirmation email.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

module.exports = OrderConfirmationTemplate;