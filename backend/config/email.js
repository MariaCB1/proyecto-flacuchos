const axios = require('axios');

const RESEND_API_KEY = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.SMTP_USER;

const transporter = {
  async sendMail(mailOptions) {
    const { to, subject, html } = mailOptions;

    await axios.post('https://api.resend.com/emails', {
      from: `Flacuchos Baena <${FROM_EMAIL}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html
    }, {
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
  }
};

module.exports = transporter;
