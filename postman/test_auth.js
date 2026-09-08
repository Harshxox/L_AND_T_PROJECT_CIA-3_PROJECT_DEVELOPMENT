const http = require('http');

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data: JSON.parse(data) });
      });
    });
    
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

(async () => {
  try {
    const email = `test${Date.now()}@test.com`;
    console.log('1. Registering user...');
    const regRes = await request('POST', '/api/auth/register', { name: 'Test', email, password: 'password123' });
    console.log('RegStatus:', regRes.status, 'Expected: 201');
    
    console.log('2. Duplicate registration...');
    const dupRes = await request('POST', '/api/auth/register', { name: 'Test2', email, password: 'password123' });
    console.log('DupStatus:', dupRes.status, 'Expected: 409');
    
    console.log('3. Wrong password login...');
    const wrongRes = await request('POST', '/api/auth/login', { email, password: 'wrongpassword' });
    console.log('WrongStatus:', wrongRes.status, 'Expected: 401');

    console.log('4. Correct login...');
    const logRes = await request('POST', '/api/auth/login', { email, password: 'password123' });
    console.log('LogStatus:', logRes.status, 'Expected: 200');
    const token = logRes.data.data.token;

    console.log('5. Missing token on protected route...');
    const missRes = await request('GET', '/api/auth/me');
    console.log('MissStatus:', missRes.status, 'Expected: 401');

    console.log('6. Invalid token on protected route...');
    const invRes = await request('GET', '/api/auth/me', null, 'invalidtoken');
    console.log('InvStatus:', invRes.status, 'Expected: 401');

    console.log('7. Valid token on /me...');
    const meRes = await request('GET', '/api/auth/me', null, token);
    console.log('MeStatus:', meRes.status, 'Expected: 200');

    console.log('8. MEMBER hitting ADMIN route...');
    const adminRes = await request('GET', '/api/auth/admin-only', null, token);
    console.log('AdminStatus:', adminRes.status, 'Expected: 403');

  } catch (err) {
    console.error(err);
  }
})();
