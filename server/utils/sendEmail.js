const nodemailer = require("nodemailer");
const dns = require("dns").promises;

// دالة عامة لإرسال أي إيميل، بنستخدمها في forgetPassword ومستقبلا في أي حاجة تانية
// (زي تأكيد الحجز، أو ترحيب بعد التسجيل)
const sendEmail = async(options)=>{
    const emailHost = process.env.EMAIL_HOST;
    let connectHost = emailHost;
    try {
        const addresses = await dns.resolve4(emailHost);
        if (addresses && addresses.length > 0) {
            connectHost = addresses[0];
        }
    } catch (dnsErr) {
        console.error("IPv4 lookup for EMAIL_HOST failed, falling back to hostname:", dnsErr.message);
    }

    var transporter = nodemailer.createTransport({
        host: connectHost,
        port: process.env.EMAIL_PORT,
        secure: Number(process.env.EMAIL_PORT) === 465, // true لو بورت 465 (SSL)، غير كده false (TLS)
        family: 4,
        tls: {
            servername: emailHost,
        },
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
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