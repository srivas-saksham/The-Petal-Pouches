// backend/src/templates/WelcomeEmailTemplate.js

function WelcomeEmailTemplate({ name, frontendUrl }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Rizara Luxe</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              
              <!-- Header -->
              <tr>
                <td style="padding: 60px 60px 40px; border-bottom: 1px solid #e5e5e5;">
                  <h1 style="margin: 0; font-size: 14px; font-weight: 400; letter-spacing: 3px; text-transform: uppercase; color: #1a1a1a; text-align: center;">
                    Rizara Luxe
                  </h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 60px;">
                  <h2 style="margin: 0 0 24px; font-size: 28px; font-weight: 300; color: #1a1a1a; letter-spacing: -0.5px;">
                    Welcome to Rizara Luxe
                  </h2>
                  
                  <p style="margin: 0 0 32px; font-size: 15px; line-height: 24px; color: #525252;">
                    Dear ${name},
                  </p>
                  
                  <p style="margin: 0 0 32px; font-size: 15px; line-height: 24px; color: #525252;">
                    Thank you for joining the Rizara Luxe family. We are delighted to have you with us and look forward to being part of your journey in discovering timeless elegance.
                  </p>

                  <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #525252;">
                    Your account has been successfully created. You now have access to:
                  </p>

                  <!-- Benefits List -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 40px;">
                    <tr>
                      <td style="padding: 16px 0; border-bottom: 1px solid #f5f5f5;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width: 32px; vertical-align: top;">
                              <div style="width: 6px; height: 6px; background-color: #1a1a1a; border-radius: 50%; margin-top: 8px;"></div>
                            </td>
                            <td style="font-size: 14px; line-height: 22px; color: #525252;">
                              Exclusive collections and new arrivals
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 16px 0; border-bottom: 1px solid #f5f5f5;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width: 32px; vertical-align: top;">
                              <div style="width: 6px; height: 6px; background-color: #1a1a1a; border-radius: 50%; margin-top: 8px;"></div>
                            </td>
                            <td style="font-size: 14px; line-height: 22px; color: #525252;">
                              Personalized wishlist and saved items
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 16px 0; border-bottom: 1px solid #f5f5f5;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width: 32px; vertical-align: top;">
                              <div style="width: 6px; height: 6px; background-color: #1a1a1a; border-radius: 50%; margin-top: 8px;"></div>
                            </td>
                            <td style="font-size: 14px; line-height: 22px; color: #525252;">
                              Order tracking and purchase history
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 16px 0;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width: 32px; vertical-align: top;">
                              <div style="width: 6px; height: 6px; background-color: #1a1a1a; border-radius: 50%; margin-top: 8px;"></div>
                            </td>
                            <td style="font-size: 14px; line-height: 22px; color: #525252;">
                              Priority access to special offers
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 40px;">
                    <tr>
                      <td align="center">
                        <a href="${frontendUrl}/shop" style="display: inline-block; padding: 16px 48px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; border-radius: 2px; font-weight: 400;">
                          Explore Collection
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 0 0 8px; font-size: 14px; line-height: 22px; color: #737373;">
                    Should you have any questions, our dedicated support team is here to assist you.
                  </p>
                  
                  <p style="margin: 0; font-size: 14px; line-height: 22px; color: #737373;">
                    With warm regards,<br>
                    <span style="color: #1a1a1a;">The Rizara Luxe Team</span>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 40px 60px; border-top: 1px solid #e5e5e5; text-align: center;">
                  <p style="margin: 0 0 8px; font-size: 12px; line-height: 18px; color: #a3a3a3;">
                    © ${new Date().getFullYear()} Rizara Luxe. All rights reserved.
                  </p>
                  <p style="margin: 0; font-size: 11px; line-height: 16px; color: #d4d4d4;">
                    This is an automated message. Please do not reply to this email.
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

module.exports = WelcomeEmailTemplate;