const { SMTPServer } = require('smtp-server');
const simpleParser = require('mailparser').simpleParser;

const server = new SMTPServer({
  onData(stream, session, callback) {
    simpleParser(stream)
      .then(parsed => {
        console.log(parsed);
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

server.listen(2525, () => {
  console.log('SMTP server is listening on port 2525');
});
