// backend/src/templates/PasswordResetOTPTemplate.js

function PasswordResetOTPTemplate({ name, otp }) {
  const otpDigits = otp.toString().split('');
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
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

              <!-- Content -->
              <tr>
                <td style="padding: 30px 16px;">
                  <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 300; color: #1a1a1a; letter-spacing: -0.5px;">
                    Password Reset Request
                  </h2>
                  
                  <p style="margin: 0 0 16px; font-size: 13px; line-height: 20px; color: #525252;">
                    Hello ${name || 'valued customer'},
                  </p>
                  
                  <p style="margin: 0 0 24px; font-size: 13px; line-height: 20px; color: #525252;">
                    We received a request to reset your password. Please use the following code to proceed. This code will expire in 10 minutes.
                  </p>

                  <!-- OTP Container -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">
                    <tr>
                      <td style="background-color: #fafafa; border: 1px solid #e5e5e5; padding: 20px 8px; text-align: center; border-radius: 2px;">
                        <p style="margin: 0 0 12px; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #737373;">
                          Reset Code
                        </p>
                        <table cellpadding="0" cellspacing="0" align="center">
                          <tr>
                            <td style="letter-spacing: -2px;">
                              ${otpDigits.map(digit => `<span style="display: inline-block; width: 36px; height: 44px; background-color: #ffffff; border: 1px solid #d95669; text-align: center; line-height: 44px; font-size: 20px; font-weight: 500; color: #1a1a1a; letter-spacing: 0; margin: 0 2px;">${digit}</span>`).join('')}
                            </td>
                          </tr>
                        </table>
                        <p style="margin: 12px 0 0; font-size: 12px; color: #d95669;">
                          Your security is our priority. Reset your password to keep your account safe
                        </p>
                        <p style="margin: 12px 0 0; font-size: 11px; color: #737373;">
                          Valid for 10 minutes
                        </p>
                      </td>
                    </tr>
                  </table>

                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 20px; background-color: #fafafa; border-left: 2px solid #1a1a1a;">
                    <tr>
                      <td style="padding: 12px 16px;">
                        <p style="margin: 0; font-size: 11px; line-height: 18px; color: #525252;">
                          <strong style="color: #1a1a1a;">Security Alert:</strong> If you did not request a password reset, please ignore this email and ensure your account is secure. Your password will remain unchanged.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 0; font-size: 12px; line-height: 18px; color: #737373;">
                    This is an automated security notification from Rizara Luxe.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 20px 16px; border-top: 1px solid #e5e5e5; text-align: center;">
                  <p style="margin: 0; font-size: 11px; line-height: 16px; color: #a3a3a3;">
                    © ${new Date().getFullYear()} Rizara Luxe. All rights reserved.
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

module.exports = PasswordResetOTPTemplate;