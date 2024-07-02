const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('users.db');

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
