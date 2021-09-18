const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'ourbookclubapp@gmail.com',
    pass: 'Anaconda.1980'
  }
});

transporter
  .sendMail({
    to: 'ourbookclubapp@gmail.com',
    subject: 'Hello from José',
    text: 'This is an email sent by José'
  })
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.log(error);
  });
