require('dotenv').config();
const moment = require('moment');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


exports.twilioNotification = (email, activeUserFirstName, activeUserLastName, split_each_amount, description, created_at) => {
  
    const msg = {
      to: email,
      from: 'notifications@SplittheBillApp',
      subject: `${activeUserFirstName} has sent you a bill notification from SplittheBillApp`,
      text: `${activeUserFirstName} has sent you a bill notification from <a href='https://www.splitthebillmain.netlify.com/'>SplittheBillMain.netlify.com</a>`,
      html: `<section style="display:flex; align-items:center; justify-content:center; text-align:center; justify-items:center; vertical-align:center;">              
             You owe <strong style="color:#5557FE;"> ${activeUserFirstName} ${activeUserLastName}</strong> ${split_each_amount} for ${description} on ${created_at}.
             </section>`
    };
    sgMail.send(msg);

};