const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const MembershipPlan = require('../models/MembershipPlan');
const Trainer = require('../models/Trainer');

let mongoServer;
let memberToken, adminToken, trainerToken;
let memberUser, trainerUser;
let testPlan;

jest.setTimeout(60000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Create Admin
  const adminReg = await request(app).post('/api/auth/register').send({
    name: 'Admin User',
    email: 'admin_test@gymland.com',
    password: 'Password123!'
  });
  await User.findByIdAndUpdate(adminReg.body.data.user._id, { role: 'BRANCH ADMIN' });
  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'admin_test@gymland.com',
    password: 'Password123!'
  });
  adminToken = adminLogin.body.data.token;

  // Create Member
  const memReg = await request(app).post('/api/auth/register').send({
    name: 'Member Test',
    email: 'member_test@gymland.com',
    password: 'Password123!'
  });
  memberUser = memReg.body.data.user;
  const memLogin = await request(app).post('/api/auth/login').send({
    email: 'member_test@gymland.com',
    password: 'Password123!'
  });
  memberToken = memLogin.body.data.token;

  // Create Trainer
  const trReg = await request(app).post('/api/auth/register').send({
    name: 'Coach Sarah',
    email: 'sarah_test@gymland.com',
    password: 'Password123!'
  });
  trainerUser = trReg.body.data.user;
  await User.findByIdAndUpdate(trainerUser._id, { role: 'TRAINER' });
  const trLogin = await request(app).post('/api/auth/login').send({
    email: 'sarah_test@gymland.com',
    password: 'Password123!'
  });
  trainerToken = trLogin.body.data.token;

  await Trainer.create({
    userId: trainerUser._id,
    name: 'Coach Sarah',
    email: 'sarah_test@gymland.com',
    specialization: 'Strength & Conditioning',
    hourlyRate: 50
  });

  // Create Membership Plan
  testPlan = await MembershipPlan.create({
    name: 'Gold Annual',
    description: '1 Year Full Access',
    price: 600,
    durationMonths: 12
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('New Features - Payment, QR, Progress, Equipment, Reviews', () => {
  test('Should validate coupon code WELCOME50 for 50% discount', async () => {
    const res = await request(app)
      .post('/api/payments/validate-coupon')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ couponCode: 'WELCOME50', amount: 600 });

    expect(res.status).toBe(200);
    expect(res.body.data.discountPercent).toBe(50);
    expect(res.body.data.discountAmount).toBe(300);
  });

  test('Should process dummy checkout for Membership with coupon and create receipt', async () => {
    const res = await request(app)
      .post('/api/payments/checkout')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        planId: testPlan._id,
        couponCode: 'WELCOME50',
        paymentMethod: 'DUMMY_CARD'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.transaction.finalAmount).toBe(300);
    expect(res.body.data.receipt.receiptNumber).toBeDefined();
    expect(res.body.data.membership.status).toBe('ACTIVE');
  });

  test('Should process dummy checkout for PT Sessions package', async () => {
    const res = await request(app)
      .post('/api/payments/checkout')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        ptPackageCount: 5,
        paymentMethod: 'DUMMY_UPI'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.transaction.finalAmount).toBe(200);

    const updatedMember = await User.findById(memberUser._id);
    expect(updatedMember.ptSessionsBalance).toBe(5);
  });

  test('Should verify dynamic QR code check-in for active member', async () => {
    const memberDoc = await User.findById(memberUser._id);
    const qrToken = memberDoc.qrToken;

    const res = await request(app)
      .post('/api/attendance/scan-qr')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ qrToken });

    expect(res.status).toBe(200);
    expect(res.body.data.member.name).toBe('Member Test');
  });

  test('Should log body progress metrics for member', async () => {
    const res = await request(app)
      .post('/api/progress')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        weightKg: 76.5,
        bodyFatPercentage: 14.8,
        muscleMassKg: 39.2,
        benchPressPR: 105,
        notes: 'Feeling stronger'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.log.weightKg).toBe(76.5);
  });

  test('Admin should add and update gym equipment', async () => {
    const createRes = await request(app)
      .post('/api/equipment')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Incline Chest Press',
        serialNumber: 'EQ-ICP-001',
        category: 'MACHINES',
        status: 'OPERATIONAL'
      });

    expect(createRes.status).toBe(201);
    const eqId = createRes.body.data.equipment._id;

    const updateRes = await request(app)
      .put(`/api/equipment/${eqId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'MAINTENANCE_REQUIRED' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.equipment.status).toBe('MAINTENANCE_REQUIRED');
  });

  test('Admin should view financial ledger with total revenue', async () => {
    const res = await request(app)
      .get('/api/payments/admin/ledger')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalRevenue).toBe(500); // 300 (membership) + 200 (PT)
    expect(res.body.data.transactionCount).toBe(2);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });
});
