require("dotenv").config();

//console.log("Stripe key =", process.env.STRIPE_SECRET_KEY);
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);//get secret key from env file
const Doctor = require("../models/doctor");
const Appointment = require("../models/appointment");

//check out session
const createCheckoutSession = async (req,res)=>{
    

 try {
    const { doctorId, clinicId } = req.body; // byakhod el data mn el front
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
    return res.status(404).json({ message: "Doctor not found" });
  }
    const clinic = doctor.clinics.find(
  (c) => c.clinicId.toString() === clinicId
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
  mode: "payment",
  line_items: [
    {
      price_data: {
        currency: "egp",
        product_data: {
          name: `Appointment with Dr. ${doctor.name}`

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
    }
  }

  res.status(200).send("Webhook received");
};

module.exports = {
    createCheckoutSession,
     webhook,
}