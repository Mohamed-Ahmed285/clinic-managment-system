require("dotenv").config();

//console.log("Stripe key =", process.env.STRIPE_SECRET_KEY);
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);//get secret key from env file
const Doctor = require("../models/doctor");
const Appointment = require("../models/appointment");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");
//check out session
const createCheckoutSession = async (req,res)=>{
    

 try {
    const { appointmentId } = req.body; // byakhod el data mn el front
    const appointment = await Appointment.findById(appointmentId);

   if (!appointment) {
    return res.status(404).json({
        message: "Appointment not found"
    });
}
    const doctor = await Doctor.findById(appointment.doctorId);
    const doctorUser = await User.findById(doctor._id);
    if (!doctor) {
    return res.status(404).json({ message: "Doctor not found" });
  }
    const clinic = doctor.clinics.find(
  (c) => c.clinicId.toString() === appointment.clinicId.toString()
);
if (!clinic) {
    return res.status(404).json({ message: "Clinic not found" });
  }
  /*if (!clinic.isActiveAtClinic) {
    return res.status(400).json({
        message: "This doctor is not available in this clinic"
    });
}*/
const fee = clinic.consultationFee;
    const session = await stripe.checkout.sessions.create({

      payment_method_types: ["card"],

      metadata: {
        appointmentId: appointment._id.toString(),
    },

      
      mode: "payment",
      line_items: [
    {
      price_data: {
        currency: "egp",
        product_data: {
          name: `Appointment with Dr. ${doctorUser.name}`

        },
        unit_amount: fee * 100,
      },
      quantity: 1,
    },
  ],
  success_url: "http://localhost:4200/profile?payment=success",
cancel_url: "http://localhost:4200/profile?payment=cancel",
});
return res.status(200).json({
    url: session.url
});
    } catch (error) {
  return res.status(500).json({
    message: error.message,
  });
}


}

const webhook = async (req, res) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("Event:", event.type);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const appointmentId = session.metadata.appointmentId;

    const appointment = await Appointment.findById(appointmentId);

    if (appointment) {
      appointment.paymentStatus = "paid";
      appointment.status = "confirmed";
      

      await appointment.save();

const user = await User.findById(appointment.patientId);
const doctor = await Doctor.findById(appointment.doctorId);

const doctorUser = await User.findById(doctor._id);

if (user) {
    await sendEmail({
        to: user.email,

        subject: "Appointment Confirmation",

       html: `
    <h2>Payment Successful ✅</h2>

    <p>Hello ${user.name},</p>

    <p>Your appointment with <b>Dr. ${doctorUser.name}</b> has been confirmed.</p>

    <p>Payment Status: <b>Paid</b></p>

    <p>Thank you for using NO-Q.</p>
`
    });
}
    }
  }

  res.status(200).send("Webhook received");
};

module.exports = {
    createCheckoutSession,
     webhook,
}