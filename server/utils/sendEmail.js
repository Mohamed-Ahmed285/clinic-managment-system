const nodemailer = require("nodemailer");

// دالة عامة لإرسال أي إيميل، بنستخدمها في forgetPassword ومستقبلا في أي حاجة تانية
// (زي تأكيد الحجز، أو ترحيب بعد التسجيل)
const sendEmail = async(options)=>{
    const emailPassword = process.env.EMAIL_PASS?.replace(/\s/g, "");
    var transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        requireTLS: Number(process.env.EMAIL_PORT) === 587,
        secure: Number(process.env.EMAIL_PORT) === 465, // true لو بورت 465 (SSL)، غير كده false (TLS)
        auth:{
            user: process.env.EMAIL_USER,
            pass: emailPassword
        }
    });

    var mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || "ClinIQ"}" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
         text: options.text,
        html: options.html
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
