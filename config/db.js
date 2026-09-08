const mongoose = require('mongoose');

const seedDemoData = async () => {
  const User = require('../models/User');
  const Trainer = require('../models/Trainer');
  const MembershipPlan = require('../models/MembershipPlan');
  const Class = require('../models/Class');
  const Equipment = require('../models/Equipment');

  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('Seeding initial demo data...');
    
    // Seed Admin
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@gymland.com',
      passwordHash,
      role: 'BRANCH ADMIN'
    });

    // Seed Trainer User & Doc
    const trainerUser = await User.create({
      name: 'Coach Marcus',
      email: 'trainer@gymland.com',
      passwordHash,
      role: 'TRAINER',
      phone: '+1 555-0192'
    });

    const trainer = await Trainer.create({
      userId: trainerUser._id,
      name: 'Coach Marcus',
      email: 'trainer@gymland.com',
      specialization: 'Strength & Conditioning',
      bio: 'Elite Strength Coach & Nutrition Specialist',
      hourlyRate: 50,
      rating: 4.9,
      ratingCount: 12
    });

    // Seed Member User
    const member = await User.create({
      name: 'Alex Johnson',
      email: 'member@gymland.com',
      passwordHash,
      role: 'MEMBER',
      phone: '+1 555-4829',
      ptSessionsBalance: 3,
      assignedTrainerId: trainer._id,
      medicalNotes: 'Previous mild shoulder strain, cleared for lifting.',
      emergencyContact: {
        name: 'Sarah Johnson',
        phone: '+1 555-9988',
        relation: 'Spouse'
      }
    });

    // Seed Plans
    const plan1 = await MembershipPlan.create({
      name: 'Monthly Iron Access',
      description: 'Full gym floor access & locker room',
      price: 60,
      durationMonths: 1,
      isActive: true
    });

    const plan2 = await MembershipPlan.create({
      name: 'Quarterly Athlete',
      description: 'Full access + group classes included',
      price: 150,
      durationMonths: 3,
      isActive: true
    });

    const plan3 = await MembershipPlan.create({
      name: 'Annual VIP Gold',
      description: 'Unlimited access + 2 free PT sessions + guest passes',
      price: 500,
      durationMonths: 12,
      isActive: true
    });

    // Seed Classes
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await Class.create({
      trainerId: trainer._id,
      instructorName: 'Coach Marcus',
      title: 'Heavy Barbell Strength',
      category: 'STRENGTH',
      date: today,
      startTime: '08:00',
      endTime: '09:00',
      capacity: 15,
      bookedCount: 3,
      room: 'Main Studio'
    });

    await Class.create({
      trainerId: trainer._id,
      instructorName: 'Coach Marcus',
      title: 'High-Octane Iron HIIT',
      category: 'HIIT',
      date: tomorrow,
      startTime: '10:00',
      endTime: '11:00',
      capacity: 20,
      bookedCount: 5,
      room: 'Arena 2'
    });

    // Seed Equipment
    await Equipment.create({
      name: 'Hammer Strength Iso-Lateral Chest Press',
      serialNumber: 'EQ-CP-101',
      category: 'MACHINES',
      status: 'OPERATIONAL'
    });

    await Equipment.create({
      name: 'Concept2 RowErg Machine',
      serialNumber: 'EQ-ROW-202',
      category: 'CARDIO',
      status: 'OPERATIONAL'
    });

    await Equipment.create({
      name: 'Eleiko Olympic Power Rack #1',
      serialNumber: 'EQ-RACK-303',
      category: 'FREE_WEIGHTS',
      status: 'OPERATIONAL'
    });

    console.log('✅ Demo data seeded successfully (Admin, Trainer, Member, Plans, Classes, Equipment)!');
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 4000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedDemoData();
  } catch (error) {
    console.warn(`Could not connect to MongoDB URI (${error.message}). Launching in-memory database server fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log(`✅ In-Memory MongoDB Server Connected successfully at: ${uri}`);
      await seedDemoData();
    } catch (memErr) {
      console.error(`Database startup error: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = { connectDB };
