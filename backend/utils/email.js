import nodemailer from 'nodemailer'


const transporter = () => {
  return nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  })
}

export const sendEmail = async (to, subject, text) => {

  try {

    const transport = transporter()

    console.log('Sending email:', { to, subject, text })
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    }

    await transport.sendMail(mailOptions)

  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Email sending failed')
    
  }
}

export const sendWelcomeEmail = async (email) => {
  const subject = '🎉 Welcome to KM Wear Newsletter - You\'re In!'
  
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to KM Wear Newsletter</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                background-color: #f8fafc;
                padding: 20px;
            }
            .container {
                background-color: #ffffff;
                border-radius: 16px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                letter-spacing: -0.5px;
            }
            .header p {
                margin: 10px 0 0 0;
                font-size: 16px;
                opacity: 0.9;
            }
            .content {
                padding: 40px 30px;
            }
            .welcome-message {
                font-size: 18px;
                margin-bottom: 25px;
                color: #4a5568;
            }
            .benefits {
                background-color: #f7fafc;
                border-radius: 12px;
                padding: 25px;
                margin: 25px 0;
            }
            .benefits h3 {
                color: #2d3748;
                margin-top: 0;
                font-size: 20px;
            }
            .benefit-item {
                display: flex;
                align-items: center;
                margin: 15px 0;
                color: #4a5568;
            }
            .benefit-icon {
                width: 20px;
                height: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                margin-right: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: white;
                font-weight: bold;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
                transition: all 0.3s ease;
            }
            .footer {
                background-color: #2d3748;
                color: #cbd5e0;
                padding: 30px;
                text-align: center;
                font-size: 14px;
            }
            .footer a {
                color: #90cdf4;
                text-decoration: none;
            }
            .social-links {
                margin: 20px 0;
            }
            .social-links a {
                display: inline-block;
                margin: 0 10px;
                color: #90cdf4;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to KM Wear!</h1>
                <p>You're now part of our exclusive fashion community</p>
            </div>
            
            <div class="content">
                <div class="welcome-message">
                    <strong>Hi there!</strong><br>
                    Thank you for subscribing to the KM Wear newsletter! We're thrilled to have you join our community of fashion enthusiasts who love quality clothing and exclusive deals.
                </div>
                
                <div class="benefits">
                    <h3>🌟 Here's what you can expect:</h3>
                    
                    <div class="benefit-item">
                        <div class="benefit-icon">✨</div>
                        <div><strong>Exclusive Offers:</strong> Be the first to know about sales, discounts, and special promotions</div>
                    </div>
                    
                    <div class="benefit-item">
                        <div class="benefit-icon">👕</div>
                        <div><strong>New Arrivals:</strong> Get early access to our latest collections and trending styles</div>
                    </div>
                    
                    <div class="benefit-item">
                        <div class="benefit-icon">💡</div>
                        <div><strong>Style Tips:</strong> Fashion advice, styling guides, and seasonal trend insights</div>
                    </div>
                    
                    <div class="benefit-item">
                        <div class="benefit-icon">🎁</div>
                        <div><strong>VIP Treatment:</strong> Subscriber-only events and exclusive member benefits</div>
                    </div>
                </div>
                
                <p style="color: #4a5568; margin: 25px 0;">
                    Ready to explore our latest collection? Check out our website and discover your next favorite outfit!
                </p>
                
                <div style="text-align: center;">
                    <a href="#" class="cta-button">🛍️ Shop Now</a>
                </div>
                
                <p style="color: #718096; font-size: 14px; margin-top: 30px;">
                    <strong>Follow us on social media</strong> for daily fashion inspiration and behind-the-scenes content!
                </p>
            </div>
            
            <div class="footer">
                <div class="social-links">
                    <a href="#">📘 Facebook</a>
                    <a href="#">📷 Instagram</a>
                    <a href="#">🐦 Twitter</a>
                </div>
                
                <p>
                    <strong>KM Wear</strong><br>
                    Your trusted fashion destination<br>
                    📧 Email: support@kmwear.com
                </p>
                
                <p style="margin-top: 20px; font-size: 12px; opacity: 0.8;">
                    You're receiving this email because you subscribed to our newsletter.<br>
                    If you no longer wish to receive these emails, you can 
                    <a href="#" style="color: #90cdf4;">unsubscribe here</a>.
                </p>
            </div>
        </div>
    </body>
    </html>
  `

  const textContent = `
🎉 Welcome to KM Wear Newsletter!

Hi there!

Thank you for subscribing to the KM Wear newsletter! We're thrilled to have you join our community of fashion enthusiasts who love quality clothing and exclusive deals.

Here's what you can expect:

✨ Exclusive Offers: Be the first to know about sales, discounts, and special promotions
👕 New Arrivals: Get early access to our latest collections and trending styles  
💡 Style Tips: Fashion advice, styling guides, and seasonal trend insights
🎁 VIP Treatment: Subscriber-only events and exclusive member benefits

Ready to explore our latest collection? Visit our website and discover your next favorite outfit!

Follow us on social media for daily fashion inspiration and behind-the-scenes content!

Best regards,
The KM Wear Team

---
KM Wear - Your trusted fashion destination
Email: support@kmwear.com

You're receiving this email because you subscribed to our newsletter. 
If you no longer wish to receive these emails, please contact us to unsubscribe.
  `

  try {
    const transport = transporter()

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text: textContent,
      html: htmlContent
    }

    await transport.sendMail(mailOptions)
    console.log(`Welcome email sent successfully to: ${email}`)
  } catch (error) {
    console.error('Error sending welcome email:', error)
    throw new Error('Welcome email sending failed')
  }
}
