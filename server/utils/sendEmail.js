// دالة عامة لإرسال أي إيميل، بنستخدمها في forgetPassword ومستقبلا في أي حاجة تانية
// (زي تأكيد الحجز، أو ترحيب بعد التسجيل)
//
// Sends via Brevo's HTTP API instead of raw SMTP. Railway blocks outbound
// SMTP ports (25/465/587) on the Hobby plan, so nodemailer could never
// succeed there no matter how the connection was configured. This goes
// over plain HTTPS (port 443) instead, which isn't affected by that block.
const sendEmail = async (options) => {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "api-key": process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
            sender: {
                name: process.env.EMAIL_FROM_NAME || "NO-Q",
                email: process.env.EMAIL_USER, // must be a verified sender in Brevo
            },
            to: [{ email: options.to }],
            subject: options.subject,
            htmlContent: options.html,
            textContent: options.text,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Brevo API error (${response.status}): ${errorBody}`);
    }

    return response.json();
};

module.exports = sendEmail;