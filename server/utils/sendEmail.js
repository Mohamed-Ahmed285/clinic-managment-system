const nodemailer = require("nodemailer");

// دالة عامة لإرسال أي إيميل، بنستخدمها في forgetPassword ومستقبلا في أي حاجة تانية
// (زي تأكيد الحجز، أو ترحيب بعد التسجيل)
const sendEmail = async(options)=>{
    var transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: Number(process.env.EMAIL_PORT) === 465, // true لو بورت 465 (SSL)، غير كده false (TLS)
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    var mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || "ClinIQ"}" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;