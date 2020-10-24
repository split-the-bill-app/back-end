require('dotenv').config();
const moment = require('moment');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


exports.twilioNotification = (email, activeUserFirstName, activeUserLastName, split_each_amount, description, created_at) => {
  
    const msg = {
      to: email,
      from: 'notifications@SplitTheBillApp',
      subject: `${activeUserFirstName} sent you a bill notification from SplitTheBillApp`,
      text: `${activeUserFirstName} has sent you a bill notification from <a href='https://www.splitthebillmain.netlify.com/'>SplitTheBillMain.netlify.com</a>`,
      html: `You owe <strong style="color:#5557FE;">&nbsp;${activeUserFirstName} ${activeUserLastName}&nbsp;</strong> $${split_each_amount} for ${description} on ${created_at}.`
    };
    sgMail.send(msg);
};