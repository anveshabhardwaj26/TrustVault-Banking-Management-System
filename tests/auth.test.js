const { app, request, setupTestDatabase, getAuthenticatedAgent } = require('./test-helper');

describe('Authentication API Tests (/api/auth)', () => {
  beforeEach(() => {
    setupTestDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should successfully register a customer and auto-create an account', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'John Doe',
          email: 'john@example.com',
          phone: '+919876543210',
          password: 'Password@123'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('john@example.com');
      expect(res.body.data.user.role).toBe('customer');
      expect(res.body.data.user.password_hash).toBeUndefined();
      expect(res.body.data.account).toBeDefined();
      expect(res.body.data.account.account_number).toMatch(/^TV\d{10}$/);
      expect(res.body.data.account.balance_paise).toBe(0);
    });

    it('should reject registration with a duplicate email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'First User',
          email: 'duplicate@example.com',
          phone: '+919876543210',
          password: 'Password@123'
        });

      // Second registration with duplicate email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Second User',
          email: 'duplicate@example.com',
          phone: '+919876543211',
          password: 'Password@123'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should reject registration with missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Incomplete User',
          email: 'incomplete@example.com'
          // missing phone and password
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/required/i);
    });

    it('should reject registration with an invalid email address format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Invalid Email User',
          email: 'not-an-email',
          phone: '+919876543210',
          password: 'Password@123'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/email/i);
    });

    it('should reject registration if role is specified as admin', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Hacker Admin',
          email: 'adminwannabe@example.com',
          phone: '+919876543210',
          password: 'Password@123',
          role: 'admin'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/role cannot be admin|restricted/i);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Alice Wonder',
          email: 'alice@example.com',
          phone: '+919876543210',
          password: 'Password@123'
        });
    });

    it('should successfully log in with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'alice@example.com',
          password: 'Password@123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('alice@example.com');
      expect(res.body.data.user.password_hash).toBeUndefined();
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should reject login with an invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'alice@example.com',
          password: 'WrongPassword@123'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    it('should reject login for a non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ghost@example.com',
          password: 'Password@123'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return profile and account info for authenticated user', async () => {
      const agent = request.agent(app);

      // Register and login
      await agent
        .post('/api/auth/register')
        .send({
          full_name: 'Bob Ross',
          email: 'bob@example.com',
          phone: '+919876543210',
          password: 'Password@123'
        });

      const res = await agent.get('/api/auth/me');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('bob@example.com');
      expect(res.body.data.account).toBeDefined();
      expect(res.body.data.account.account_number).toBeDefined();
    });

    it('should return 401 unauthenticated when not logged in', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/authentication required/i);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear session upon logout', async () => {
      const agent = request.agent(app);

      await agent
        .post('/api/auth/register')
        .send({
          full_name: 'Carol Danvers',
          email: 'carol@example.com',
          phone: '+919876543210',
          password: 'Password@123'
        });

      // Verify authenticated
      const meBefore = await agent.get('/api/auth/me');
      expect(meBefore.status).toBe(200);

      // Logout
      const logoutRes = await agent.post('/api/auth/logout');
      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.success).toBe(true);

      // Verify session terminated
      const meAfter = await agent.get('/api/auth/me');
      expect(meAfter.status).toBe(401);
    });
  });
});
