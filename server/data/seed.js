const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const connectDB = require('../config/db');
const User = require('../models/user');
const Specialty = require('../models/specialty');
const Clinic = require('../models/clinic');
const Doctor = require('../models/doctor');
const Patient = require('../models/patient');
const Appointment = require('../models/appointment');
const Prescription = require('../models/prescription');
const MedicalRecord = require('../models/medicalRecord');
const Todo = require('../models/todo');

const clearCollections = async () => {
  await Promise.all([
    User.deleteMany({}),
    Specialty.deleteMany({}),
    Clinic.deleteMany({}),
    Doctor.deleteMany({}),
    Patient.deleteMany({}),
    Appointment.deleteMany({}),
    Prescription.deleteMany({}),
    MedicalRecord.deleteMany({})
  ]);
};

const seed = async () => {
  try {
    await connectDB();
    await clearCollections();

    const specialties = await Specialty.create([
      {
        name: 'Cardiology',
        description: 'Heart and cardiovascular care',
        icon: '🫀'
      },
      {
        name: 'Dermatology',
        description: 'Skin, hair, and nail treatment',
        icon: '🧴'
      },
      {
        name: 'Pediatrics',
        description: 'Medical care for infants and children',
        icon: '👶'
      }
    ]);

    const clinics = await Clinic.create([
      {
        name: 'BrightCare Medical Center',
        phone: '+201001234567',
        email: 'contact@brightcare.com',
        image: 'https://example.com/clinic.jpg',
        address: {
          street: '12 El-Nasr Street',
          city: 'Cairo',
          state: 'Cairo',
          country: 'Egypt'
        }
      },
      {
        name: 'Wellness Dental Clinic',
        phone: '+201112345678',
        email: 'info@wellnessclinic.com',
        image: 'https://example.com/dental.jpg',
        address: {
          street: '8 Mohammed Ali Street',
          city: 'Alexandria',
          state: 'Alexandria',
          country: 'Egypt'
        }
      }
    ]);

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      phone: '+201000000001',
      role: 'admin'
    });

    const doctorUser = await User.create({
      name: 'Dr. Sarah Ahmed',
      email: 'doctor@example.com',
      password: 'password123',
      phone: '+201000000002',
      role: 'doctor'
    });

    const patientUser = await User.create({
      name: 'John Doe',
      email: 'patient@example.com',
      password: 'password123',
      phone: '+201000000003',
      role: 'patient'
    });

    const doctorProfile = await Doctor.create({
      _id: doctorUser._id,
      bio: 'Experienced physician specialized in cardiology and internal medicine.',
      experienceYears: 10,
      specialtyId: specialties[0]._id,
      clinics: [
        {
          clinicId: clinics[0]._id,
          consultationFee: 250,
          availability: [
            { day: ['monday', 'wednesday', 'friday'], startTime: '09:00', endTime: '13:00' },
            { day: ['tuesday', 'thursday'], startTime: '15:00', endTime: '19:00' }
          ],
          isActiveAtClinic: true
        }
      ],
      rating: { average: 4.8, count: 42 },
      bookingStats: { totalAppointments: 18, completedAppointments: 15, cancelledAppointments: 1 }
    });

    const patientProfile = await Patient.create({
      _id: patientUser._id,
      dateOfBirth: new Date('1990-05-10'),
      gender: 'male',
      address: {
        city: 'Cairo',
        state: 'Cairo',
        country: 'Egypt'
      },
      favoriteDoctors: [doctorProfile._id],
      preferredPaymentMethod: 'online',
      notificationsEnabled: true
    });

    const appointments = await Appointment.create([
      {
        patientId: patientProfile._id,
        doctorId: doctorProfile._id,
        clinicId: clinics[0]._id,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        startTime: '10:00',
        endTime: '10:30',
        status: 'confirmed',
        paymentMethod: 'online',
        paymentStatus: 'paid',
        fee: 250
      },
      {
        patientId: patientProfile._id,
        doctorId: doctorProfile._id,
        clinicId: clinics[0]._id,
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        startTime: '15:00',
        endTime: '15:30',
        status: 'pending',
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        fee: 250
      }
    ]);

    const prescription = await Prescription.create({
      patientId: patientProfile._id,
      doctorId: doctorProfile._id,
      appointmentId: appointments[0]._id,
      medications: [
        {
          name: 'Aspirin',
          dosage: '100mg',
          frequency: 'Once Daily',
          times: ['08:00'],
          duration: '7 days',
          notes: 'Take after breakfast'
        }
      ],
      generalNotes: 'Monitor blood pressure regularly.',
      issuedDate: new Date()
    });

    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;

    await Todo.create({
      patientId: patientProfile._id,
      appointmentId: appointments[0]._id,
      prescriptionId: prescription._id,
      items: [
        {
          name: 'Aspirin',
          dosage: '100mg',
          frequency: 'Once Daily',
          notes: 'Take after breakfast',
          schedule: [
            {
              time: currentTime,
              completed: false,
              completedAt: null,
              reminderSent: false
            }
          ]
        }
      ]
    });

    await MedicalRecord.create({
      patientId: patientProfile._id,
      doctorId: doctorProfile._id,
      appointmentId: appointments[0]._id,
      diagnosis: 'Mild hypertension',
      symptoms: 'Headache, dizziness',
      notes: 'Patient advised to reduce salt intake',
      attachments: [],
      visitDate: new Date()
    });

    console.log('Database seeded successfully.');
    console.log('Login credentials:');
    console.log('Admin -> admin@example.com / password123');
    console.log('Doctor -> doctor@example.com / password123');
    console.log('Patient -> patient@example.com / password123');
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
