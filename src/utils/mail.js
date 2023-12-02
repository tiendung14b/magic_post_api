const nodemailer = require("nodemailer");
const response = require('./response')
// Defines recipients

exports.send_password = async (subject, content, email_target) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "mail.gmail.com",
      port: 465,
      secure: true,
      service: 'gmail',
      auth: {
        user: process.env.SERVER_MAIL,
        pass: process.env.MAIL_PASS,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        // ⚠️ Use environment variables set on the server for these values when deploying
      },
    });
  
    let info = await transporter.sendMail({
      from: '"Magic Post" <magicpost.uet@gmail.com>',
      to: email_target, // Mails to array of recipients
      subject: subject,
      html: `
        <p>Chào bạn,</p>
        <p>Mật khẩu mới của bạn là: <b>'+ ${content} + '</b></p>
        <p>Trân trọng,</p>
        <p>Magic Post</p>
        <img src="https://i.imgur.com/ctJvI6P.jpg" />`,
    });
  } catch (err) {
    err.file = 'utils/mail.js'
    err.function = 'mail'
    console.log(err)
  }
}