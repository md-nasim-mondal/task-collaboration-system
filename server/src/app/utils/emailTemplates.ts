export const emailTemplates = {
  forgetPassword: (name: string, resetUILink: string, code: string) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f9; }
        .wrapper { width: 100%; padding: 40px 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background-color: #1a73e8; padding: 30px; text-align: center; color: #ffffff; }
        .content { padding: 40px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 13px; color: #777; border-top: 1px solid #eee; }
        .btn { display: inline-block; padding: 14px 28px; background-color: #1a73e8; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 25px; transition: background 0.3s ease; }
        h1 { margin: 0; font-size: 24px; letter-spacing: 0.5px; }
        h2 { color: #1a73e8; margin-top: 0; }
        p { margin-bottom: 20px; color: #555; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>Password Security</h1>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>We received a request to reset the password associated with your account. If you made this request, please click the button below to secure your account:</p>
            <div style="text-align: center;">
              <a href="${resetUILink}" class="btn">Securely Reset Password</a>
            </div>
            <p>Alternatively, you can use the following 4-digit code to reset your password:</p>
            <div style="text-align: center; font-size: 24px; font-weight: bold; color: #1a73e8; letter-spacing: 5px; margin: 20px 0;">
              ${code}
            </div>
            <p style="margin-top: 30px; font-size: 14px; color: #888;">This link will expire in 10 minutes for your security. If you didn't request this change, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Basic Server. All rights reserved.<br>
            Made with excellence.
          </div>
        </div>
      </div>
    </body>
    </html>
  `,

  otp: (name: string, otp: string) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f0f2f5; }
        .wrapper { width: 100%; padding: 40px 0; }
        .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .header { background-color: #111827; padding: 30px; text-align: center; color: #ffffff; }
        .content { padding: 40px; text-align: center; }
        .otp-box { background-color: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 12px; padding: 20px; margin: 30px 0; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #111827; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; }
        h1 { margin: 0; font-size: 22px; font-weight: 600; }
        p { color: #4b5563; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>Verification Required</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${name}</strong>,</p>
            <p>To complete your authentication, please use the following one-time password (OTP):</p>
            <div class="otp-box">${otp}</div>
            <p style="font-size: 14px;">This code is valid for <strong>2 minutes</strong>. Please do not share this code with anyone.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Basic Server. Secure Auth System.
          </div>
        </div>
      </div>
    </body>
    </html>
  `,

  invoice: (name: string, amount: string, paymentId: string) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #444; background-color: #fff; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); font-size: 16px; line-height: 24px; }
        .invoice-box table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
        .invoice-box table td { padding: 5px; vertical-align: top; }
        .invoice-box table tr td:nth-child(2) { text-align: right; }
        .invoice-box table tr.top table td { padding-bottom: 20px; }
        .invoice-box table tr.information table td { padding-bottom: 40px; }
        .invoice-box table tr.heading td { background: #f3f4f6; border-bottom: 1px solid #ddd; font-weight: bold; }
        .invoice-box table tr.item td { border-bottom: 1px solid #eee; }
        .invoice-box table tr.total td:nth-child(2) { border-top: 2px solid #eee; font-weight: bold; }
        .header-title { font-size: 45px; line-height: 45px; color: #333; font-weight: 300; }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <table>
          <tr class="top">
            <td colspan="2">
              <table>
                <tr>
                  <td class="header-title">INVOICE</td>
                  <td>
                    Invoice #: ${Math.floor(Math.random() * 100000)}<br>
                    Created: ${new Date().toLocaleDateString()}<br>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr class="information">
            <td colspan="2">
              <table>
                <tr>
                  <td>
                    Basic Server Corp.<br>
                    12345 Tech Avenue<br>
                    Silicon Valley, CA
                  </td>
                  <td>
                    ${name}<br>
                    Customer ID: ${Math.floor(Math.random() * 1000)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr class="heading">
            <td>Payment Method</td>
            <td>Transaction ID #</td>
          </tr>
          <tr class="details">
            <td>Credit Card / Digital Wallet</td>
            <td>${paymentId}</td>
          </tr>
          <tr class="heading">
            <td>Service / Product</td>
            <td>Price</td>
          </tr>
          <tr class="item">
            <td>Platform Subscription / Booking Service</td>
            <td>${amount}</td>
          </tr>
          <tr class="total">
            <td></td>
            <td>Total: ${amount}</td>
          </tr>
        </table>
        <p style="margin-top: 40px; text-align: center; color: #888; font-size: 14px;">Thank you for your business!</p>
      </div>
    </body>
    </html>
  `,
  verifyEmail: (name: string, code: string) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f9; }
        .wrapper { width: 100%; padding: 40px 0; }
        .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background-color: #10b981; padding: 30px; text-align: center; color: #ffffff; }
        .content { padding: 40px; text-align: center; }
        .code-box { background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 30px 0; font-size: 32px; font-weight: 700; letter-spacing: 10px; color: #059669; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 13px; color: #777; border-top: 1px solid #eee; }
        h1 { margin: 0; font-size: 24px; }
        p { color: #555; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>Email Verification</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${name}</strong>,</p>
            <p>Thank you for registering! Please use the 4-digit code below to verify your email address:</p>
            <div class="code-box">${code}</div>
            <p style="font-size: 14px; color: #888;">This code will expire in 10 minutes. If you didn't create an account, you can ignore this email.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Basic Server. All rights reserved.
          </div>
        </div>
      </div>
    </body>
    </html>
  `,
};

export type TEmailTemplateName = keyof typeof emailTemplates;
