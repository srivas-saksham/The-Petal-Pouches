// backend/src/templates/AdminOrderNotificationTemplate.js

function AdminOrderNotificationTemplate({ order, user }) {
  const {
    id: orderId,
    created_at,
    subtotal,
    express_charge,
    discount,
    final_total,
    shipping_address,
    payment_method,
    payment_status,
    status,
    items = [],
    delivery_metadata = {},
    notes,
    gift_wrap,
    gift_message
  } = order;

  const {
    name: userName = 'Customer',
    email: userEmail = 'N/A',
    phone: userPhone = shipping_address?.phone || 'N/A'
  } = user || {};

  // Format date with time
  const orderDate = new Date(created_at).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const deliveryMode = delivery_metadata.mode || 'surface';
  const estimatedDays = delivery_metadata.estimated_days || 'N/A';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Notification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 8px;">
        <tr>
          <td align="center">
            <table width="100%" style="max-width: 650px;" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 2px; box-shadow: 0 2px 4px rgba(0,0,0,0.08);">
              
              <!-- Header -->
              <tr>
                <td style="padding: 30px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 2px 2px 0 0;">
                  <h1 style="margin: 0; font-size: 13px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #ffffff; text-align: center;">
                    Rizara Luxe - Admin
                  </h1>
                </td>
              </tr>

              <!-- Alert Banner -->
              <tr>
                <td style="padding: 20px; text-align: center; background-color: #fef3c7; border-bottom: 2px solid #fbbf24;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 8px;">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </td>
                    </tr>
                  </table>
                  <h2 style="margin: 0 0 6px; font-size: 18px; font-weight: 600; color: #92400e;">
                    New Order Received
                  </h2>
                  <p style="margin: 0; font-size: 13px; color: #78350f;">
                    Order #${orderId} requires your attention
                  </p>
                </td>
              </tr>

              <!-- Order Summary -->
              <tr>
                <td style="padding: 24px 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 16px; background-color: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td colspan="2" style="padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
                              <h3 style="margin: 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">
                                Order Details
                              </h3>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;">
                              <span style="font-size: 12px; color: #6b7280;">Order ID</span>
                            </td>
                            <td align="right" style="padding: 8px 0;">
                              <span style="font-size: 13px; color: #111827; font-weight: 600;">#${orderId}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;">
                              <span style="font-size: 12px; color: #6b7280;">Date & Time</span>
                            </td>
                            <td align="right" style="padding: 8px 0;">
                              <span style="font-size: 12px; color: #111827;">${orderDate}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;">
                              <span style="font-size: 12px; color: #6b7280;">Order Status</span>
                            </td>
                            <td align="right" style="padding: 8px 0;">
                              <span style="display: inline-block; padding: 4px 10px; background-color: #fef3c7; color: #92400e; font-size: 10px; font-weight: 600; text-transform: uppercase; border-radius: 10px;">${status}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;">
                              <span style="font-size: 12px; color: #6b7280;">Payment Status</span>
                            </td>
                            <td align="right" style="padding: 8px 0;">
                              <span style="display: inline-block; padding: 4px 10px; background-color: ${payment_status === 'paid' ? '#d1fae5' : '#fee2e2'}; color: ${payment_status === 'paid' ? '#065f46' : '#991b1b'}; font-size: 10px; font-weight: 600; text-transform: uppercase; border-radius: 10px;">${payment_status}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;">
                              <span style="font-size: 12px; color: #6b7280;">Payment Method</span>
                            </td>
                            <td align="right" style="padding: 8px 0;">
                              <span style="font-size: 12px; color: #111827; font-weight: 500;">${payment_method === 'cod' ? 'COD' : 'Online'}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;">
                              <span style="font-size: 12px; color: #6b7280;">Delivery Mode</span>
                            </td>
                            <td align="right" style="padding: 8px 0;">
                              <span style="font-size: 12px; color: #111827; font-weight: 500; text-transform: capitalize;">${deliveryMode} (${estimatedDays} days)</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Customer Information -->
                  <h3 style="margin: 0 0 12px; font-size: 13px; font-weight: 600; color: #111827; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                    Customer Information
                  </h3>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 14px; background-color: #eff6ff; border-radius: 6px; border-left: 4px solid #3b82f6;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width: 28px; vertical-align: top; padding-top: 2px;">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                              </svg>
                            </td>
                            <td style="padding-left: 12px;">
                              <div style="font-size: 14px; color: #1e40af; font-weight: 600; margin-bottom: 6px;">
                                ${userName}
                              </div>
                              <div style="font-size: 12px; color: #1e3a8a; margin-bottom: 4px;">
                                <strong>Email:</strong> ${userEmail}
                              </div>
                              <div style="font-size: 12px; color: #1e3a8a;">
                                <strong>Phone:</strong> ${userPhone}
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Order Items -->
                  <h3 style="margin: 0 0 12px; font-size: 13px; font-weight: 600; color: #111827; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                    Order Items
                  </h3>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 20px; overflow: hidden;">
                    <tr style="background-color: #f9fafb;">
                      <th align="left" style="padding: 10px 12px; font-size: 11px; color: #6b7280; font-weight: 600; text-transform: uppercase; border-bottom: 1px solid #e5e7eb;">
                        Item
                      </th>
                      <th align="center" style="padding: 10px 12px; font-size: 11px; color: #6b7280; font-weight: 600; text-transform: uppercase; border-bottom: 1px solid #e5e7eb;">
                        Qty
                      </th>
                      <th align="right" style="padding: 10px 12px; font-size: 11px; color: #6b7280; font-weight: 600; text-transform: uppercase; border-bottom: 1px solid #e5e7eb;">
                        Price
                      </th>
                      <th align="right" style="padding: 10px 12px; font-size: 11px; color: #6b7280; font-weight: 600; text-transform: uppercase; border-bottom: 1px solid #e5e7eb;">
                        Total
                      </th>
                    </tr>
                    ${items.map((item, index) => `
                      <tr style="border-bottom: ${index < items.length - 1 ? '1px solid #f3f4f6' : 'none'};">
                        <td style="padding: 12px;">
                          <div style="font-size: 13px; color: #111827; font-weight: 500; margin-bottom: 4px;">
                            ${item.bundle_title || item.product_title || 'Product'}
                          </div>
                          <div style="font-size: 10px; color: #6b7280; text-transform: uppercase;">
                            ${item.bundle_origin === 'brand-bundle' ? 'Bundle' : 'Product'}
                          </div>
                        </td>
                        <td align="center" style="padding: 12px;">
                          <span style="display: inline-block; padding: 4px 10px; background-color: #e5e7eb; color: #374151; font-size: 12px; font-weight: 600; border-radius: 4px;">
                            ${item.quantity}
                          </span>
                        </td>
                        <td align="right" style="padding: 12px;">
                          <span style="font-size: 12px; color: #6b7280;">
                            ₹${item.price.toFixed(2)}
                          </span>
                        </td>
                        <td align="right" style="padding: 12px;">
                          <span style="font-size: 13px; color: #111827; font-weight: 600;">
                            ₹${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    `).join('')}
                  </table>

                  <!-- Financial Summary -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 14px; background-color: #f9fafb; border-radius: 6px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                              <span style="font-size: 12px; color: #6b7280;">Subtotal</span>
                            </td>
                            <td align="right" style="padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                              <span style="font-size: 13px; color: #111827;">₹${subtotal.toFixed(2)}</span>
                            </td>
                          </tr>
                          ${express_charge > 0 ? `
                          <tr>
                            <td style="padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                              <span style="font-size: 12px; color: #6b7280;">Express Delivery Charge</span>
                            </td>
                            <td align="right" style="padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                              <span style="font-size: 13px; color: #111827;">₹${express_charge.toFixed(2)}</span>
                            </td>
                          </tr>
                          ` : ''}
                          ${discount > 0 ? `
                          <tr>
                            <td style="padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                              <span style="font-size: 12px; color: #059669;">Discount Applied</span>
                            </td>
                            <td align="right" style="padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                              <span style="font-size: 13px; color: #059669;">-₹${discount.toFixed(2)}</span>
                            </td>
                          </tr>
                          ` : ''}
                          <tr>
                            <td style="padding: 12px 0 0 0;">
                              <span style="font-size: 15px; color: #111827; font-weight: 700;">Order Total</span>
                            </td>
                            <td align="right" style="padding: 12px 0 0 0;">
                              <span style="font-size: 18px; color: #111827; font-weight: 700;">₹${final_total.toFixed(2)}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Shipping Address -->
                  <h3 style="margin: 0 0 12px; font-size: 13px; font-weight: 600; color: #111827; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                    Shipping Address
                  </h3>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 14px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width: 28px; vertical-align: top; padding-top: 2px;">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                              </svg>
                            </td>
                            <td style="padding-left: 12px;">
                              <div style="font-size: 12px; color: #92400e; line-height: 18px;">
                                <div style="font-weight: 600; margin-bottom: 4px;">${userName}</div>
                                <div style="color: #78350f;">
                                  ${shipping_address.line1}${shipping_address.line2 ? ', ' + shipping_address.line2 : ''}<br>
                                  ${shipping_address.landmark ? shipping_address.landmark + '<br>' : ''}
                                  ${shipping_address.city}, ${shipping_address.state} ${shipping_address.zip_code}<br>
                                  ${shipping_address.country || 'India'}<br>
                                  <strong>Phone:</strong> ${shipping_address.phone}
                                </div>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  ${notes || gift_wrap ? `
                  <!-- Special Instructions -->
                  <h3 style="margin: 0 0 12px; font-size: 13px; font-weight: 600; color: #111827; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                    Special Instructions
                  </h3>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 14px; background-color: #fef2f2; border-radius: 6px; border-left: 4px solid #ef4444;">
                        ${gift_wrap ? `
                        <div style="margin-bottom: 10px;">
                          <span style="display: inline-block; padding: 4px 10px; background-color: #fee2e2; color: #991b1b; font-size: 10px; font-weight: 600; text-transform: uppercase; border-radius: 10px; margin-bottom: 6px;">
                            Gift Wrap Requested
                          </span>
                        </div>
                        ` : ''}
                        ${gift_message ? `
                        <div style="font-size: 12px; color: #7f1d1d; margin-bottom: 10px;">
                          <strong>Gift Message:</strong><br>
                          <em>${gift_message}</em>
                        </div>
                        ` : ''}
                        ${notes ? `
                        <div style="font-size: 12px; color: #7f1d1d;">
                          <strong>Customer Notes:</strong><br>
                          ${notes}
                        </div>
                        ` : ''}
                      </td>
                    </tr>
                  </table>
                  ` : ''}

                  <!-- Action Required -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px; padding-top: 24px; border-top: 2px solid #e5e7eb;">
                    <tr>
                      <td style="text-align: center;">
                        <p style="margin: 0 0 16px; font-size: 14px; color: #374151; font-weight: 500;">
                          Please process this order and create shipment
                        </p>
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/orders" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; border-radius: 6px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                          View in Admin Panel
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 20px; border-top: 1px solid #e5e7eb; text-align: center; background-color: #f9fafb;">
                  <p style="margin: 0 0 6px; font-size: 11px; line-height: 16px; color: #6b7280;">
                    © ${new Date().getFullYear()} Rizara Luxe Admin Panel
                  </p>
                  <p style="margin: 0; font-size: 10px; line-height: 14px; color: #9ca3af;">
                    This is an automated notification. Do not reply to this email.
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

module.exports = AdminOrderNotificationTemplate;