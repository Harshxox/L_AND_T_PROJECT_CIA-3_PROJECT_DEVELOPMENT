const fs = require('fs');

const baseUrl = '{{baseUrl}}';

const generateRequest = (name, method, urlPath, body = null, token = true) => {
  const req = {
    name,
    request: {
      method,
      header: [],
      url: {
        raw: `${baseUrl}${urlPath}`,
        host: [baseUrl],
        path: urlPath.split('/').filter(p => p)
      }
    }
  };

  if (token) {
    req.request.header.push({ key: 'Authorization', value: 'Bearer {{token}}' });
  }

  if (body) {
    req.request.header.push({ key: 'Content-Type', value: 'application/json' });
    req.request.body = { mode: 'raw', raw: JSON.stringify(body, null, 2) };
  }

  return req;
};

const collection = {
  info: {
    name: 'Gym Management API',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  variable: [
    { key: 'baseUrl', value: 'http://localhost:5000', type: 'string' },
    { key: 'token', value: '', type: 'string' }
  ],
  item: [
    {
      name: 'Authentication',
      item: [
        {
          name: 'Login Admin',
          event: [{
            listen: 'test',
            script: {
              exec: [
                'const res = pm.response.json();',
                'if (res.success) pm.collectionVariables.set("token", res.data.token);'
              ]
            }
          }],
          request: generateRequest('Login Admin', 'POST', '/api/auth/login', { email: 'admin@gym.com', password: 'password123' }, false).request
        },
        generateRequest('Login Validation Failure', 'POST', '/api/auth/login', { email: 'invalid' }, false),
        generateRequest('Login Auth Failure', 'POST', '/api/auth/login', { email: 'admin@gym.com', password: 'wrong' }, false),
        generateRequest('Register Member', 'POST', '/api/auth/register', { name: 'New Mem', email: 'new@gym.com', password: 'password123' }, false),
        generateRequest('Get Me', 'GET', '/api/auth/me', null, true),
        generateRequest('Auth Failure No Token', 'GET', '/api/auth/me', null, false)
      ]
    },
    {
      name: 'Membership Plans',
      item: [
        generateRequest('Get Plans', 'GET', '/api/plans', null, false),
        generateRequest('Create Plan (Happy Path)', 'POST', '/api/plans', { name: 'Elite', description: 'All', durationMonths: 1, price: 50 }, true),
        generateRequest('Create Plan (Validation Failure)', 'POST', '/api/plans', { name: 'Elite', price: -10 }, true)
      ]
    },
    {
      name: 'Memberships',
      item: [
        generateRequest('Purchase Membership', 'POST', '/api/memberships', { planId: '64e5...dummy' }, true),
        generateRequest('Purchase Validation Failure', 'POST', '/api/memberships', {}, true),
        generateRequest('Get My Memberships', 'GET', '/api/memberships/my', null, true)
      ]
    },
    {
      name: 'Trainers',
      item: [
        generateRequest('Get Trainers', 'GET', '/api/trainers', null, false),
        generateRequest('Create Trainer', 'POST', '/api/trainers', { userId: 'dummy', name: 'T3', email: 't3@gym.com', specialization: 'Cardio' }, true)
      ]
    },
    {
      name: 'Classes',
      item: [
        generateRequest('Get Classes', 'GET', '/api/classes', null, false),
        generateRequest('Create Class', 'POST', '/api/classes', { trainerId: 'dummy', title: 'Spin', date: '2027-01-01', startTime: '10:00', endTime: '11:00', capacity: 10 }, true),
        generateRequest('Create Class Validation Fail', 'POST', '/api/classes', { trainerId: 'dummy', title: 'Spin', date: '2027-01-01', startTime: '11:00', endTime: '10:00', capacity: 10 }, true)
      ]
    },
    {
      name: 'Bookings',
      item: [
        generateRequest('Book Class', 'POST', '/api/classes/dummyClassId/book', null, true),
        generateRequest('Get My Bookings', 'GET', '/api/bookings/my', null, true),
        generateRequest('Cancel Booking', 'DELETE', '/api/bookings/dummyBookingId', null, true)
      ]
    },
    {
      name: 'Attendance',
      item: [
        generateRequest('Check In', 'POST', '/api/attendance/checkin', { memberId: 'dummy', type: 'GYM_VISIT' }, true),
        generateRequest('Check In Duplicate Fail', 'POST', '/api/attendance/checkin', { memberId: 'dummy', type: 'GYM_VISIT' }, true),
        generateRequest('Get My Attendance', 'GET', '/api/attendance/my', null, true)
      ]
    },
    {
      name: 'Waitlist',
      item: [
        generateRequest('Get Waitlist', 'GET', '/api/classes/dummyClassId/waitlist', null, true),
        generateRequest('Join Waitlist', 'POST', '/api/classes/dummyClassId/waitlist', null, true)
      ]
    },
    {
      name: 'Workout Plans',
      item: [
        generateRequest('Get My Workout Plans', 'GET', '/api/workout-plans/my', null, true),
        generateRequest('Create Workout Plan', 'POST', '/api/workout-plans', { memberId: 'dummy', title: 'Leg Day' }, true)
      ]
    },
    {
      name: 'Notifications',
      item: [
        generateRequest('Get Notifications', 'GET', '/api/notifications', null, true),
        generateRequest('Trigger Expiry Job', 'POST', '/api/notifications/trigger-expiry-job', null, true)
      ]
    },
    {
      name: 'Reports',
      item: [
        generateRequest('Get Attendance Report', 'GET', '/api/admin/reports/attendance', null, true),
        generateRequest('Get Memberships Report', 'GET', '/api/admin/reports/membership-plans', null, true),
        generateRequest('Get Renewals Report', 'GET', '/api/admin/reports/renewals', null, true),
        generateRequest('Authz Failure (Member accessing Admin)', 'GET', '/api/admin/reports/attendance', null, true)
      ]
    }
  ]
};

fs.writeFileSync('Gym-Management-API.postman_collection.json', JSON.stringify(collection, null, 2));
console.log('Postman collection generated.');
