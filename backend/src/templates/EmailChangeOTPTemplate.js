// backend/src/templates/EmailChangeOTPTemplate.js

function EmailChangeOTPTemplate({ name, otp }) {
  const otpDigits = otp.toString().split('');
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Change Verification</title>
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
                    Rizara Jewels
                  </h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 60px;">
                  <h2 style="margin: 0 0 24px; font-size: 24px; font-weight: 300; color: #1a1a1a; letter-spacing: -0.5px;">
                    Email Address Change
                  </h2>
                  
                  <p style="margin: 0 0 32px; font-size: 15px; line-height: 24px; color: #525252;">
                    Hello ${name},
                  </p>
                  
                  <p style="margin: 0 0 40px; font-size: 15px; line-height: 24px; color: #525252;">
                    You have requested to change your email address. Please verify this action using the code below. This code will expire in 10 minutes.
                  </p>

                  <!-- OTP Container -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 40px;">
                    <tr>
                      <td style="background-color: #fafafa; border: 1px solid #e5e5e5; padding: 32px; text-align: center; border-radius: 2px;">
                        <p style="margin: 0 0 16px; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #737373;">
                          Verification Code
                        </p>
                        <table cellpadding="0" cellspacing="0" align="center">
                          <tr>
                            ${otpDigits.map(digit => `
                              <td style="padding: 0 4px;">
                                <div style="width: 48px; height: 56px; background-color: #ffffff; border: 1px solid #d4d4d4; display: inline-block; text-align: center; line-height: 56px; font-size: 24px; font-weight: 500; color: #1a1a1a; letter-spacing: 0;">
                                  ${digit}
                                </div>
                              </td>
                            `).join('')}
                          </tr>
                        </table>
                        <p style="margin: 20px 0 0; font-size: 13px; color: #737373;">
                          Valid for 10 minutes
                        </p>
                      </td>
                    </tr>
                  </table>

                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px; background-color: #fafafa; border-left: 2px solid #1a1a1a;">
                    <tr>
                      <td style="padding: 20px 24px;">
                        <p style="margin: 0; font-size: 13px; line-height: 20px; color: #525252;">
                          <strong style="color: #1a1a1a;">Important:</strong> If you did not request this email change, please contact our support team immediately to secure your account.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 0; font-size: 14px; line-height: 22px; color: #737373;">
                    This change will take effect once verification is complete.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 40px 60px; border-top: 1px solid #e5e5e5; text-align: center;">
                  <p style="margin: 0; font-size: 12px; line-height: 18px; color: #a3a3a3;">
                    © ${new Date().getFullYear()} Rizara Jewels. All rights reserved.
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

module.exports = EmailChangeOTPTemplate;