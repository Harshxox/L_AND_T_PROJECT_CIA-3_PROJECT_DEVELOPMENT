const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Load models
const User = require('../models/User');
const Trainer = require('../models/Trainer');
const MembershipPlan = require('../models/MembershipPlan');
const Membership = require('../models/Membership');
const Class = require('../models/Class');
const Booking = require('../models/Booking');
const Attendance = require('../models/Attendance');
const WorkoutPlan = require('../models/WorkoutPlan');
const Notification = require('../models/Notification');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gymlandt');

const seedData = async () => {
  try {
    await User.deleteMany();
    await Trainer.deleteMany();
    await MembershipPlan.deleteMany();
    await Membership.deleteMany();
    await Class.deleteMany();
    await Booking.deleteMany();
    await Attendance.deleteMany();
    await WorkoutPlan.deleteMany();
    await Notification.deleteMany();

    console.log('Data Cleared');

    // 1. Create Users (Admin, Trainers, Members)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const admin = await User.create({
      name: 'Admin User', email: 'admin@gym.com', passwordHash, role: 'BRANCH ADMIN'
    });

    const t1User = await User.create({ name: 'Trainer One', email: 'trainer1@gym.com', passwordHash, role: 'TRAINER' });
    const t2User = await User.create({ name: 'Trainer Two', email: 'trainer2@gym.com', passwordHash, role: 'TRAINER' });

    const members = await User.insertMany([
      { name: 'Member One', email: 'member1@gym.com', passwordHash, role: 'MEMBER' },
      { name: 'Member Two', email: 'member2@gym.com', passwordHash, role: 'MEMBER' },
      { name: 'Member Three', email: 'member3@gym.com', passwordHash, role: 'MEMBER' },
      { name: 'Member Four', email: 'member4@gym.com', passwordHash, role: 'MEMBER' },
      { name: 'Member Five', email: 'member5@gym.com', passwordHash, role: 'MEMBER' }
    ]);

    // 2. Create Trainers
    const t1 = await Trainer.create({ userId: t1User._id, name: t1User.name, email: t1User.email, specialization: 'Yoga' });
    const t2 = await Trainer.create({ userId: t2User._id, name: t2User.name, email: t2User.email, specialization: 'HIIT' });

    // Assign trainers to some members
    members[0].assignedTrainerId = t1._id; await members[0].save();
    members[1].assignedTrainerId = t1._id; await members[1].save();
    members[2].assignedTrainerId = t2._id; await members[2].save();

    // 3. Create Plans
    const plans = await MembershipPlan.insertMany([
      { name: 'Basic', description: 'Gym access only', durationMonths: 1, price: 30, status: 'ACTIVE' },
      { name: 'Standard', description: 'Gym + Classes', durationMonths: 6, price: 150, status: 'ACTIVE' },
      { name: 'Premium', description: 'All access + Personal Training', durationMonths: 12, price: 250, status: 'ACTIVE' }
    ]);

    // 4. Create Memberships
    const activeDate = new Date();
    const activeEndDate = new Date(); activeEndDate.setMonth(activeDate.getMonth() + 1);
    
    const expiredDate = new Date(); expiredDate.setMonth(expiredDate.getMonth() - 2);
    const expiredEndDate = new Date(); expiredEndDate.setMonth(expiredEndDate.getMonth() - 1);

    await Membership.insertMany([
      { memberId: members[0]._id, planId: plans[1]._id, startDate: activeDate, endDate: activeEndDate, status: 'ACTIVE' },
      { memberId: members[1]._id, planId: plans[0]._id, startDate: activeDate, endDate: activeEndDate, status: 'ACTIVE' },
      { memberId: members[2]._id, planId: plans[2]._id, startDate: activeDate, endDate: activeEndDate, status: 'ACTIVE' },
      { memberId: members[3]._id, planId: plans[0]._id, startDate: expiredDate, endDate: expiredEndDate, status: 'EXPIRED' }
    ]);

    // 5. Create Classes
    const c1 = await Class.create({ trainerId: t1._id, title: 'Morning Yoga', date: new Date(), startTime: '08:00', endTime: '09:00', capacity: 20 });
    const c2 = await Class.create({ trainerId: t2._id, title: 'Evening HIIT', date: new Date(), startTime: '18:00', endTime: '19:00', capacity: 15 });

    // 6. Create Bookings & Attendance
    await Booking.create({ classId: c1._id, memberId: members[0]._id, status: 'CONFIRMED' });
    c1.bookedCount = 1; await c1.save();
    
    await Attendance.create({ memberId: members[0]._id, classId: c1._id, trainerId: t1._id, type: 'CLASS' });
    await Attendance.create({ memberId: members[1]._id, type: 'GYM_VISIT' });

    // 7. Workout Plans
    await WorkoutPlan.create({
      memberId: members[0]._id, trainerId: t1._id, title: 'Beginner Yoga Routine', goals: 'Flexibility',
      exercises: [{ name: 'Downward Dog', sets: 3, reps: 5, notes: 'Hold for 30s' }]
    });

    // 8. Notifications
    await Notification.create({
      userId: members[3]._id, type: 'EXPIRY_REMINDER', title: 'Membership Expired', message: 'Your membership has expired.', read: false
    });

    console.log('Demo Data Seeded Successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
