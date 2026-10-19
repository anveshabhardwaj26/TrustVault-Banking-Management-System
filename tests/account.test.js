const { app, request, setupTestDatabase } = require('./test-helper');

describe('Account API Tests (/api/accounts)', () => {
  let customer1Agent;
  let customer2Agent;
  let customer1Account;

  beforeEach(async () => {
    setupTestDatabase();

    customer1Agent = request.agent(app);
    customer2Agent = request.agent(app);

    const res1 = await customer1Agent
      .post('/api/auth/register')
      .send({
        full_name: 'Customer One',
        email: 'customer1@example.com',
        phone: '+919876543211',
        password: 'Password@123'
      });
    customer1Account = res1.body.data.account;

    await customer2Agent
      .post('/api/auth/register')
      .send({
        full_name: 'Customer Two',
        email: 'customer2@example.com',
        phone: '+919876543212',
        password: 'Password@123'
      });
  });

  describe('GET /api/accounts/me', () => {
    it('should return account details for authenticated customer', async () => {
      const res = await customer1Agent.get('/api/accounts/me');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.account.account_number).toBe(customer1Account.account_number);
      expect(res.body.data.owner.email).toBe('customer1@example.com');
    });

    it('should return 401 unauthenticated when not logged in', async () => {
      const res = await request(app).get('/api/accounts/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/authentication required/i);
    });

    it('customer cannot see another customer account data', async () => {
      const res2 = await customer2Agent.get('/api/accounts/me');

      expect(res2.status).toBe(200);
      expect(res2.body.data.account.account_number).not.toBe(customer1Account.account_number);
      expect(res2.body.data.owner.email).toBe('customer2@example.com');
    });
  });

  describe('GET /api/accounts/me/balance', () => {
    it('should return current balance for authenticated customer', async () => {
      const res = await customer1Agent.get('/api/accounts/me/balance');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.balance_paise).toBe(0);
      expect(res.body.data.balance_rupees).toBe('0.00');
      expect(res.body.data.currency).toBe('INR');
    });
  });
});
