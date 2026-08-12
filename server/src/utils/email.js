const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Email templates
 */
const templates = {
  welcome: (data) => ({
    subject: 'Welcome to DZONE GADGET!',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        <div style="background:linear-gradient(135deg,#FF6B6B,#FFE66D);padding:40px;text-align:center">
          <h1 style="color:#fff;font-size:32px;margin:0">DZONE GADGET</h1>
          <p style="color:rgba(255,255,255,0.9);margin:8px 0 0">Where Play Comes to Life</p>
        </div>
        <div style="padding:40px">
          <h2 style="color:#1a1a2e;margin:0 0 16px">Welcome, ${data.name}! 🎉</h2>
          <p style="color:#555;line-height:1.6">Thank you for joining DZONE GADGET. We're thrilled to have you on board!</p>
          <p style="color:#555;line-height:1.6">Start exploring our amazing collection of toys designed to spark joy and creativity.</p>
          <a href="${process.env.CLIENT_URL}/shop" style="display:inline-block;background:linear-gradient(135deg,#FF6B6B,#FFE66D);color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:600;margin-top:24px">Shop Now 🛍️</a>
        </div>
        <div style="background:#f9f9f9;padding:20px;text-align:center">
          <p style="color:#999;font-size:12px;margin:0">© 2025 DZONE GADGET. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  resetPassword: (data) => ({
    subject: 'DZONE GADGET — Password Reset Request',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        <div style="background:linear-gradient(135deg,#FF6B6B,#FFE66D);padding:40px;text-align:center">
          <h1 style="color:#fff;font-size:32px;margin:0">DZONE GADGET</h1>
        </div>
        <div style="padding:40px">
          <h2 style="color:#1a1a2e">Reset Your Password</h2>
          <p style="color:#555;line-height:1.6">Hi ${data.name}, click the button below to reset your password. This link expires in 30 minutes.</p>
          <a href="${data.resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#FF6B6B,#FFE66D);color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:600;margin-top:16px">Reset Password</a>
          <p style="color:#999;font-size:13px;margin-top:24px">If you didn't request this, ignore this email. Your password won't change.</p>
        </div>
      </div>
    `,
  }),

  orderConfirmed: (data) => ({
    subject: `✅ Order Confirmed — ${data.order.orderNumber}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#FF6B6B,#FFE66D);padding:40px;text-align:center">
          <h1 style="color:#fff;font-size:32px;margin:0">DZONE GADGET</h1>
        </div>
        <div style="padding:40px">
          <h2 style="color:#1a1a2e">Your Order is Confirmed! 🎉</h2>
          <p style="color:#555">Hi ${data.name}, we've received your order.</p>
          <div style="background:#f9f9f9;border-radius:8px;padding:20px;margin:20px 0">
            <p style="margin:0"><strong>Order Number:</strong> ${data.order.orderNumber}</p>
            <p style="margin:8px 0 0"><strong>Total:</strong> ₹${data.order.total}</p>
            <p style="margin:8px 0 0"><strong>Payment:</strong> ${data.order.paymentMethod.toUpperCase()}</p>
          </div>
          <a href="${process.env.CLIENT_URL}/orders/${data.order._id}" style="display:inline-block;background:linear-gradient(135deg,#FF6B6B,#FFE66D);color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:600">Track Order</a>
        </div>
      </div>
    `,
  }),

  orderStatusUpdate: (data) => ({
    subject: `📦 Order Update — ${data.order.orderNumber}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#FF6B6B,#FFE66D);padding:40px;text-align:center">
          <h1 style="color:#fff;font-size:32px;margin:0">DZONE GADGET</h1>
        </div>
        <div style="padding:40px">
          <h2 style="color:#1a1a2e">Order Status Update</h2>
          <p style="color:#555">Hi ${data.name}, your order <strong>${data.order.orderNumber}</strong> is now <strong>${data.status}</strong>.</p>
          ${data.message ? `<p style="color:#555">${data.message}</p>` : ''}
          <a href="${process.env.CLIENT_URL}/orders/${data.order._id}" style="display:inline-block;background:linear-gradient(135deg,#FF6B6B,#FFE66D);color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:600;margin-top:16px">View Order</a>
        </div>
      </div>
    `,
  }),
};

/**
 * Send email
 * @param {object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.template - template key
 * @param {object} options.data - template data
 * @param {string} options.html - raw HTML (if no template)
 */
const sendEmail = async ({ to, subject, template, data, html }) => {
  const content = template && templates[template] ? templates[template](data) : { subject, html };
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'DZONE GADGET <noreply@dzonegadgetindia.com>',
    to,
    subject: content.subject || subject,
    html: content.html || html,
  });
};

module.exports = { sendEmail };
