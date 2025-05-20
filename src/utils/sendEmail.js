const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"E-Commerce" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      text,
      html,
    });
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw new Error('Error sending email');
  }
};

// Pre-built email templates
exports.sendOrderConfirmation = async (user, order) => {
  const subject = `Order Confirmation #${order._id}`;
  const html = `
    <h1>Thank you for your order!</h1>
    <p>Dear ${user.name},</p>
    <p>Your order has been received and is being processed.</p>
    <h2>Order Details:</h2>
    <ul>
      ${order.products.map(p => `
        <li>${p.product.name} x ${p.qty} - $${p.priceAtPurchase}</li>
      `).join('')}
    </ul>
    <p>Total: $${order.products.reduce((sum, p) => sum + (p.priceAtPurchase * p.qty), 0)}</p>
    <p>Payment Method: ${order.paymentMethod}</p>
  `;
  
  return exports.sendEmail({
    to: user.email,
    subject,
    html,
  });
};