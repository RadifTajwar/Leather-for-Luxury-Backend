export const Verification_User_Template = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email</title>
</head>
<body style="margin:0;padding:0;background-color:#f6f5f3;">
  <!-- Preheader: the grey line shown next to the subject in most inboxes -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Your verification code is {verificationCode}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f6f5f3;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
               style="max-width:480px;background-color:#ffffff;border:1px solid #e8e5e0;">

          <tr>
            <td align="center" style="padding:36px 32px 8px 32px;">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;letter-spacing:1px;color:#111111;">
                Leather For Luxury
              </div>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:0 32px;">
              <div style="height:1px;background-color:#e8e5e0;margin:20px 0 28px 0;"></div>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:0 32px;">
              <h1 style="margin:0 0 10px 0;font-family:Helvetica,Arial,sans-serif;font-size:19px;font-weight:600;color:#111111;">
                Confirm your email address
              </h1>
              <p style="margin:0 0 28px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#6b6660;">
                Enter this code to finish setting up your account.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:0 32px;">
              <div style="background-color:#faf9f7;border:1px solid #e8e5e0;padding:20px 24px;">
                <div style="font-family:'Courier New',Courier,monospace;font-size:34px;font-weight:700;letter-spacing:10px;color:#111111;text-indent:10px;">
                  {verificationCode}
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:24px 32px 36px 32px;">
              <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:20px;color:#8a847c;">
                Didn't create an account? You can ignore this email.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="background-color:#faf9f7;border-top:1px solid #e8e5e0;padding:18px 32px;">
              <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#9a948c;">
                &copy; ${new Date().getFullYear()} Leather For Luxury
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

export const Welcome_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Our Community</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
              color: #333;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #ddd;
          }
          .header {
              background-color: #007BFF;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 26px;
              font-weight: bold;
          }
          .content {
              padding: 25px;
              line-height: 1.8;
          }
          .welcome-message {
              font-size: 18px;
              margin: 20px 0;
          }
          .user-password {
              display: block;
              margin: 20px 0;
              font-size: 22px;
              color: #007BFF;
              background: #e6f0ff;
              border: 1px dashed #007BFF;
              padding: 10px;
              text-align: center;
              border-radius: 5px;
              font-weight: bold;
              letter-spacing: 2px;
          }
          .button {
              display: inline-block;
              padding: 12px 25px;
              margin: 20px 0;
              background-color: #007BFF;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              text-align: center;
              font-size: 16px;
              font-weight: bold;
              transition: background-color 0.3s;
          }
          .button:hover {
              background-color: #0056b3;
          }
          .footer {
              background-color: #f4f4f4;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #ddd;
          }
          p {
              margin: 0 0 15px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Welcome to Our Community!</div>
          <div class="content">
              <p class="welcome-message">Hello {name},</p>
              <p>🎉 Thank you for signing up! Here is your password:</p>
              <span class="user-password">{password}</span>

              <p>👉 Please go to our website 
                 <a href="https://www.leather-for-luxury.com/" target="_blank" style="color:#007BFF; font-weight:bold;">
                 www.leather-for-luxury.com</a>, 
                 log in using this password, and start exploring your account.
              </p>

              <p>We’re thrilled to have you join us! Your registration was successful, and we’re committed to providing you with the best experience possible.</p>
              <p>Here’s how you can get started:</p>
              <ul>
                  <li>Explore our features and customize your experience.</li>
                  <li>Stay informed by checking out our blog for the latest updates and tips.</li>
                  <li>Reach out to our support team if you have any questions or need assistance.</li>
              </ul>
              <a href="https://www.leather-for-luxury.com/" class="button">Get Started</a>
              <p>If you need any help, don’t hesitate to contact us. We’re here to support you every step of the way.</p>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Leather For Luxury. All rights reserved.</p>
              <p><a href="https://www.leather-for-luxury.com/" style="color:#007BFF; text-decoration:none;">www.leather-for-luxury.com</a></p>
          </div>
      </div>
  </body>
  </html>
`;

export const Password_Reset_Template = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background-color:#f6f5f3;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Your password reset code is {resetCode}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f6f5f3;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
               style="max-width:480px;background-color:#ffffff;border:1px solid #e8e5e0;">

          <tr>
            <td align="center" style="padding:36px 32px 8px 32px;">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;letter-spacing:1px;color:#111111;">
                Leather For Luxury
              </div>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:0 32px;">
              <div style="height:1px;background-color:#e8e5e0;margin:20px 0 28px 0;"></div>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:0 32px;">
              <h1 style="margin:0 0 10px 0;font-family:Helvetica,Arial,sans-serif;font-size:19px;font-weight:600;color:#111111;">
                Reset your password
              </h1>
              <p style="margin:0 0 28px 0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#6b6660;">
                Enter this code to choose a new password. It expires in {expiryMinutes} minutes.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:0 32px;">
              <div style="background-color:#faf9f7;border:1px solid #e8e5e0;padding:20px 24px;">
                <div style="font-family:'Courier New',Courier,monospace;font-size:34px;font-weight:700;letter-spacing:10px;color:#111111;text-indent:10px;">
                  {resetCode}
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:24px 32px 36px 32px;">
              <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:20px;color:#8a847c;">
                Didn't ask for this? Ignore this email — your password stays as it is.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="background-color:#faf9f7;border-top:1px solid #e8e5e0;padding:18px 32px;">
              <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#9a948c;">
                &copy; ${new Date().getFullYear()} Leather For Luxury
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
