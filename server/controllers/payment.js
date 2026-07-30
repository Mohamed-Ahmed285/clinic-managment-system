const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Doctor = require("../models/doctor");
const Appointment = require("../models/appointment");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");

const createCheckoutSession = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const doctor = await Doctor.findById(appointment.doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const doctorUser = await User.findById(doctor._id);
    if (!doctorUser) {
      return res.status(404).json({ message: "Doctor user not found" });
    }

    const clinic = doctor.clinics.find(
      (item) => item.clinicId.toString() === appointment.clinicId.toString()
    );
    if (!clinic) {
      return res.status(404).json({ message: "Clinic not found" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      metadata: { appointmentId: appointment._id.toString() },
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "egp",
            product_data: { name: `Appointment with Dr. ${doctorUser.name}` },
            unit_amount: clinic.consultationFee * 100,
          },
          quantity: 1,
        },
      ],
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const webhook = async (req, res) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error.message);
    return res.status(400).send("Invalid webhook signature");
  }

  if (event.type !== "checkout.session.completed") {
    return res.status(200).send("Webhook received");
  }

  try {
    const session = event.data.object;
    const appointmentId = session.metadata?.appointmentId;

    if (!appointmentId) {
      return res.status(400).send("Missing appointment metadata");
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).send("Appointment not found");
    }

    appointment.paymentStatus = "paid";
    appointment.status = "confirmed";
    await appointment.save();

    
    res.status(200).send("Webhook received");

  
    (async () => {
      try {
        const user = await User.findById(appointment.patientId);
        const doctor = await Doctor.findById(appointment.doctorId);
        const doctorUser = doctor
          ? await User.findById(doctor._id)
          : null;

        if (!user || !doctorUser) {
          console.error("Patient or doctor user not found");
          return;
        }

        await sendEmail({
          to: user.email,
          subject: "Appointment Confirmation",
          html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #ddd;border-radius:10px;overflow:hidden;">
            <div style="background:#0d6efd;color:white;padding:20px;text-align:center;">
              <h1>NO-Q</h1>
              <h2>Appointment Confirmation</h2>
            </div>

            <div style="padding:25px;color:#333;">
              <p>Hello <strong>${user.name}</strong>,</p>

              <p>We are pleased to inform you that your payment has been received successfully.</p>

              <p>
                <strong>Doctor:</strong> Dr. ${doctorUser.name}<br>
                <strong>Payment Status:</strong>
                <span style="color:green;">Paid ✅</span>
              </p>

              <p>Your appointment has been successfully confirmed.</p>

              <p>Thank you for choosing <strong>NO-Q</strong>.</p>

              <hr>

              <p style="font-size:13px;color:#777;">
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </div>
          `,
        });

        console.log("Confirmation email sent successfully");
      } catch (err) {
        console.error("Email sending failed:", err.message);
      }
    })();
  } catch (error) {
    console.error("Stripe webhook processing failed:", error);
    return res.status(500).send("Webhook processing failed");
  }
};