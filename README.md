
# Node.js SMTP Server with TLS, Logging, and Advanced Features

This project sets up a simple yet robust SMTP email server using Node.js, complete with TLS encryption, logging, attachment handling, and advanced authentication using SQLite.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Setup](#setup)
  - [Step 1: Create an SMTP Server](#step-1-create-an-smtp-server)
  - [Step 2: Enhance Email Sending with Attachments](#step-2-enhance-email-sending-with-attachments)
  - [Step 3: Generate SSL Certificates](#step-3-generate-ssl-certificates)
  - [Step 4: Run and Test](#step-4-run-and-test)
  - [Step 5: Advanced Authentication](#step-5-advanced-authentication)
- [Conclusion](#conclusion)

## Features

- **TLS Encryption**: Secure communication with TLS.
- **Logging**: Logs email details to a file.
- **Advanced Authentication**: Authentication using SQLite database.
- **Attachment Handling**: Send emails with attachments.

## Prerequisites

- Node.js installed on your system.
- OpenSSL installed for generating SSL certificates.
- SQLite installed for database authentication.

## Installation

1. Clone this repository:
   \`\`\`bash
   git clone <repository-url>
   cd <repository-directory>
   \`\`\`

2. Install necessary Node.js packages:
   \`\`\`bash
   npm install smtp-server mailparser nodemailer fs tls sqlite3
   \`\`\`

## Setup

### Step 1: Create an SMTP Server

Create \`server.js\`:

\`\`\`javascript
const { SMTPServer } = require('smtp-server');
const simpleParser = require('mailparser').simpleParser;
const fs = require('fs');
const tls = require('tls');
const logger = fs.createWriteStream('smtp.log', { flags: 'a' });
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('users.db');

const server = new SMTPServer({
  secure: true,
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert'),
  onData(stream, session, callback) {
    simpleParser(stream)
      .then(parsed => {
        logger.write(\`Email received from \${session.envelope.mailFrom.address} to \${session.envelope.rcptTo[0].address} at \${new Date().toISOString()}
\`);
        logger.write(\`Subject: \${parsed.subject}

\`);
        callback(null, 'Message received');
      })
      .catch(err => {
        console.error(err);
        callback(err);
      });
  },
  onAuth(auth, session, callback) {
    db.get('SELECT password FROM users WHERE username = ?', [auth.username], (err, row) => {
      if (err) return callback(new Error('Authentication error'));
      if (row && row.password === auth.password) {
        callback(null, { user: 'authenticated' });
      } else {
        return callback(new Error('Invalid username or password'));
      }
    });
  }
});

server.listen(465, () => {
  console.log('SMTP server is listening on port 465');
});
\`\`\`

### Step 2: Enhance Email Sending with Attachments

Create \`mailer.js\`:

\`\`\`javascript
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
\`\`\`

### Step 3: Generate SSL Certificates

Generate self-signed certificates for TLS:

\`\`\`bash
openssl req -nodes -new -x509 -keyout server.key -out server.cert
\`\`\`

### Step 4: Run and Test

1. **Run the SMTP Server**:
   \`\`\`bash
   node smtp-server.js
   \`\`\`

2. **Send an Email**:
   \`\`\`bash
   node send-email.js
   \`\`\`

### Step 5: Advanced Authentication

Create a SQLite database with user credentials:

\`\`\`bash
sqlite3 users.db "CREATE TABLE users (username TEXT, password TEXT);"
sqlite3 users.db "INSERT INTO users (username, password) VALUES ('username', 'password');"
\`\`\`

The SMTP server script already includes the necessary code for database authentication.

## Conclusion

You now have a fully functional SMTP server in Node.js with TLS encryption, logging, advanced authentication using SQLite, and the ability to send emails with attachments. This setup provides a strong foundation for further enhancements and customization based on your specific requirements.
