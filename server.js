const { SMTPServer } = require('smtp-server');
const simpleParser = require('mailparser').simpleParser;
const fs = require('fs');
const tls = require('tls');
const logger = fs.createWriteStream('smtp.log', { flags: 'a' });

const server = new SMTPServer({
  secure: true,
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert'),
  onData(stream, session, callback) {
    simpleParser(stream)
      .then(parsed => {
        logger.write(`Email received from ${session.envelope.mailFrom.address} to ${session.envelope.rcptTo[0].address} at ${new Date().toISOString()}\n`);
        logger.write(`Subject: ${parsed.subject}\n\n`);
        callback(null, 'Message received');
      })
      .catch(err => {
        console.error(err);
        callback(err);
      });
  },
  onAuth(auth, session, callback) {
    if (auth.username === 'username' && auth.password === 'password') {
      callback(null, { user: 'authenticated' });
    } else {
      return callback(new Error('Invalid username or password'));
    }
  }
});

server.listen(465, () => {
  console.log('SMTP server is listening on port 465');
});
