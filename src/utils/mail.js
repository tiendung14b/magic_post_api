const nodemailer = require("nodemailer");
const response = require('./response')
// Defines recipients

const sendMail = async (subject, content, email_target) => {
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
      html: content,
    });
  } catch (err) {
    err.file = 'utils/mail.js'
    err.function = 'mail'
    console.log(err)
  }
}

exports.send_password = async (content, email) => {
  const html = `
    <p>Chào bạn,</p>
    <p>Mật khẩu khởi tạo của bạn là: <b>${content}</b></p>
    <p>Trân trọng,</p>
    <p>Magic Post</p>
    <img src="https://i.pinimg.com/736x/be/f8/a8/bef8a85dbd73a4adcd609cdea81f0869.jpg" />`
  await sendMail('Mật khẩu khởi tạo', html, email)
}

exports.send_reset_password = async (content, email) => {
  const html = `
    <p>Chào bạn,</p>
    <p>Mật khẩu mới của bạn là: <b>${content}</b></p>
    <p>Trân trọng,</p>
    <p>Magic Post</p>
    <img src="https://i.pinimg.com/736x/be/f8/a8/bef8a85dbd73a4adcd609cdea81f0869.jpg" />`
  await sendMail('Mật khẩu mới', html, email)
}

exports.send_verify_code = async (content, email) => {
  const html = `
    <p>Chào bạn,</p>
    <p>Mã xác thực của bạn là: <b>${content}</b></p>
    <p>Trân trọng,</p>
    <p>Magic Post</p>
    <img src="https://d28hgpri8am2if.cloudfront.net/book_images/cvr9781421505954_9781421505954_hr.jpg?fbclid=IwAR3V4Kz4zcyteaOmsdoMg_j53mLVEYkQeeL1FLB8WUut7AJYSNM9aTY7TyU" />`
  await sendMail('Mã xác thực', html, email)
}