const mongoose = require("mongoose");

const todoItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dosage: { type: String },
    frequency: { type: String },
    notes: { type: String },
    schedule:[
    {
        time:{
           type: String,
           required: true
        },
        completed: {
            type: Boolean,
            default: false
        },
        completedAt:{
            type:Date,
            default: null
        }
    }
    ]
  }
);

const todoSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "patient", required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "appointment" },
    prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "prescription" },
    items: [todoItemSchema]
  },
  { timestamps: true }
);

const todoModel = mongoose.model("todo", todoSchema);
module.exports = todoModel;
