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
        startHour: '09:00',
        endHour: '17:00',
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
        startHour: '10:00',
        endHour: '18:00',
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

    const doctorUser2 = await User.create({
      name: 'Dr. Karim Youssef',
      email: 'doctor2@example.com',
      password: 'password123',
      phone: '+201000000004',
      role: 'doctor'
    });

    const patientUser = await User.create({
      name: 'John Doe',
      email: 'patient@example.com',
      password: 'password123',
      phone: '+201000000003',
      role: 'patient'
    });

    const patientUser2 = await User.create({
      name: 'Mona Adel',
      email: 'patient2@example.com',
      password: 'password123',
      phone: '+201000000005',
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

    // Assigned to BOTH clinics, so deleting clinics[0] should only strip
    // that one entry from his `clinics` array and leave clinics[1] intact.
    const doctorProfile2 = await Doctor.create({
      _id: doctorUser2._id,
      bio: 'Dermatologist with a focus on cosmetic and clinical skin care.',
      experienceYears: 6,
      specialtyId: specialties[1]._id,
      clinics: [
        {
          clinicId: clinics[0]._id,
          consultationFee: 300,
          availability: [
            { day: ['sunday', 'tuesday'], startTime: '09:00', endTime: '14:00' }
          ],
          isActiveAtClinic: true
        },
        {
          clinicId: clinics[1]._id,
          consultationFee: 200,
          availability: [
            { day: ['monday', 'wednesday'], startTime: '10:00', endTime: '16:00' }
          ],
          isActiveAtClinic: true
        }
      ],
      rating: { average: 4.5, count: 20 },
      bookingStats: { totalAppointments: 10, completedAppointments: 7, cancelledAppointments: 1 }
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

    const patientProfile2 = await Patient.create({
      _id: patientUser2._id,
      dateOfBirth: new Date('1995-02-20'),
      gender: 'female',
      address: {
        city: 'Cairo',
        state: 'Cairo',
        country: 'Egypt'
      },
      favoriteDoctors: [doctorProfile2._id],
      preferredPaymentMethod: 'cash',
      notificationsEnabled: true
    });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const threeDaysFromNow = new Date(startOfToday);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const threeDaysAgo = new Date(startOfToday);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const fiveDaysAgo = new Date(startOfToday);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    // These cover every branch the clinic-delete cascade needs to handle:
    // paid-online/today, cash/today, paid-online/future, a past-dated
    // pending one (should be left alone), an already-cancelled one
    // (should be left alone / not re-notified), a completed one (left
    // alone), and one appointment at the OTHER clinic (untouched entirely).
    const appointments = await Appointment.create([
      {
        // today, online + paid -> should be cancelled AND marked "refunded"
        patientId: patientProfile._id,
        doctorId: doctorProfile._id,
        clinicId: clinics[0]._id,
        date: startOfToday,
        startTime: '10:00',
        endTime: '10:30',
        durationMinutes: 30,
        status: 'confirmed',
        paymentMethod: 'online',
        paymentStatus: 'paid',
        fee: 250
      },
      {
        // today, cash + pending -> should be cancelled, no refund needed
        patientId: patientProfile._id,
        doctorId: doctorProfile._id,
        clinicId: clinics[0]._id,
        date: startOfToday,
        startTime: '15:00',
        endTime: '15:30',
        durationMinutes: 30,
        status: 'pending',
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        fee: 250
      },
      {
        // future date, online + paid, second doctor -> cancelled + refunded
        patientId: patientProfile2._id,
        doctorId: doctorProfile2._id,
        clinicId: clinics[0]._id,
        date: threeDaysFromNow,
        startTime: '11:00',
        endTime: '11:30',
        durationMinutes: 30,
        status: 'confirmed',
        paymentMethod: 'online',
        paymentStatus: 'paid',
        fee: 300
      },
      {
        // past-dated and still "pending" -> left alone (only today+future affected)
        patientId: patientProfile2._id,
        doctorId: doctorProfile._id,
        clinicId: clinics[0]._id,
        date: threeDaysAgo,
        startTime: '09:30',
        endTime: '10:00',
        durationMinutes: 30,
        status: 'pending',
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        fee: 250
      },
      {
        // today but already cancelled -> left alone, not double-notified
        patientId: patientProfile._id,
        doctorId: doctorProfile2._id,
        clinicId: clinics[0]._id,
        date: startOfToday,
        startTime: '09:00',
        endTime: '09:30',
        durationMinutes: 30,
        status: 'cancelled',
        cancelledBy: 'patient',
        cancellationReason: 'Personal reasons',
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        fee: 300
      },
      {
        // in the past and completed -> left alone
        patientId: patientProfile2._id,
        doctorId: doctorProfile._id,
        clinicId: clinics[0]._id,
        date: fiveDaysAgo,
        startTime: '09:00',
        endTime: '09:30',
        durationMinutes: 30,
        status: 'completed',
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        fee: 250
      },
      {
        // at the OTHER clinic entirely -> completely unaffected by clinics[0] deletion
        patientId: patientProfile2._id,
        doctorId: doctorProfile2._id,
        clinicId: clinics[1]._id,
        date: startOfToday,
        startTime: '13:00',
        endTime: '13:30',
        durationMinutes: 30,
        status: 'confirmed',
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        fee: 200
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
    console.log('Doctor 1 (BrightCare only) -> doctor@example.com / password123');
    console.log('Doctor 2 (BrightCare + Wellness Dental) -> doctor2@example.com / password123');
    console.log('Patient 1 -> patient@example.com / password123');
    console.log('Patient 2 -> patient2@example.com / password123');
    console.log('');
    // console.log('BrightCare Medical Center clinic id:', clinics[0]._id.toString());
    // console.log('Delete that clinic to exercise the cascade: today/future appointments cancelled (online-paid ones marked "refunded"), patients notified in-app, and it is removed from both doctors\' `clinics[]` while Doctor 2 keeps Wellness Dental.');
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
