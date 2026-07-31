const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const connectDB = require('../config/db');
const User = require('../models/user');

// One-off migration: accounts created before the email-verification feature
// existed have no isEmailVerified value. Rather than lock every existing
// user out, this grandfathers them all in as verified.
const verifyExistingUsers = async () => {
  try {
    await connectDB();

    const result = await User.updateMany(
      { isEmailVerified: { $ne: true } },
      {
        $set: { isEmailVerified: true },
        $unset: { emailVerificationToken: '', emailVerificationExpire: '' }
      }
    );

    console.log(`Done. Matched ${result.matchedCount ?? result.n}, verified ${result.modifiedCount ?? result.nModified} user(s).`);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

verifyExistingUsers();