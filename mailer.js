const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 465,
  secure: true,
  auth: {
    user: 'username',
    pass: 'password'
  },
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false
  }
});

const mailOptions = {
  from: 'sender@example.com',
  to: 'recipient@example.com',
  subject: 'Test Email with Attachment',
  text: 'Hello, this is a test email with an attachment!',
  attachments: [
    {
      filename: 'test.txt',
      content: 'Hello world!'
    }
  ]
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log(error);
  }
  console.log('Message sent: %s', info.messageId);
});
