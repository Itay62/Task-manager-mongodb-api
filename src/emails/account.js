const formData = require('form-data');
const Mailgun = require('mailgun.js');
const domain = "sandbox1bddf8dc964c4cd491d58cd9a8f6bb22.mailgun.org"
const mailgun = new Mailgun(formData);  
const mg = mailgun.client({username: 'Itay Jacobson', key: process.env.MAILGUN_API_KEY});

const sendWelcomeEmail = (email, name) => {
    mg.messages.create(domain, {
        from: 'itay62@gmail.com',
        to: email,
        subject: 'Welcome to our app!',
        text: `Welcome, ${name}. Thanks for joining us!`
    })
}

const sendCancelEmail = (email, name) => {
    mg.messages.create(domain, {
        from: 'itay62@gmail.com',
        to: email,
        subject: 'Cancelation email',
        text: `Hey, ${name}. Happy you chose to spend that time with us.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}

