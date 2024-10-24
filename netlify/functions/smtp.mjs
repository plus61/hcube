import nodemailer from 'nodemailer';

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { action, settings } = JSON.parse(event.body);

  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  if (action === 'send-email') {
    const { to, subject, text } = settings;
    try {
      await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to,
        subject,
        text,
      });
      return { 
        statusCode: 200, 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'Email sent successfully' }) 
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return { 
        statusCode: 500, 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'Failed to send email', error: error.message }) 
      };
    }
  } else if (action === 'update-smtp') {
    try {
      const { host, port, secure, auth } = settings;
      transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth,
      });

      // Test the connection
      await transporter.verify();

      return { 
        statusCode: 200, 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'SMTP settings updated and verified successfully' }) 
      };
    } catch (error) {
      console.error('Error updating SMTP settings:', error);
      return { 
        statusCode: 500, 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'Failed to update SMTP settings', error: error.message }) 
      };
    }
  } else {
    return { 
      statusCode: 400, 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'Invalid action' }) 
    };
  }
};