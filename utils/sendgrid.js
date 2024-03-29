require('dotenv').config();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.twilioNotification = (email, activeUserFirstName, activeUserLastName, split_each_amount, description, created_at) => {    
  if(!description || description === null || description === ''){
    description = 'a bill';
  }

  const msg = {
    to: email,
    from: 'notifications@SplitTheBillApp',
    subject: `${activeUserFirstName} sent you a bill notification from SplitTheBillApp`,
    text: `${activeUserFirstName} sent you a bill notification from <a href='https://split-the-bill-main.netlify.app/'>split-the-bill-main.netlify.app/</a>`,
    html: `You owe <strong style="color:#5557FE;">&nbsp;${activeUserFirstName} ${activeUserLastName}&nbsp;</strong> $${split_each_amount} for ${description} on ${created_at}.`
  };
  sgMail.send(msg)
  .then(() => {
    console.log('sgMail email sent successfully.');
  })
  .catch((error) => {
    console.error('sgMail email sent error:', error);
  })
};