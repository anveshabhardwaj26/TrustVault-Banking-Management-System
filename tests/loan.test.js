const bcrypt = require('bcrypt');
const { app, request, setupTestDatabase } = require('./test-helper');
const userRepo = require('../src/repositories/user.repository');

describe('Loan API Tests (/api/loans and /api/admin/loans)', () => {
  let customer1Agent;
  let customer2Agent;
  let adminAgent;
  let customer1User;
  let customer2User;

  beforeEach(async () => {
    setupTestDatabase();

    customer1Agent = request.agent(app);
    customer2Agent = request.agent(app);
    adminAgent = request.agent(app);

    // Register Customer 1
    const res1 = await customer1Agent
      .post('/api/auth/register')
      .send({
        full_name: 'David Miller',
        email: 'david@example.com',
        phone: '+919876543201',
        password: 'Password@123'
      });
    customer1User = res1.body.data.user;

    // Register Customer 2
    const res2 = await customer2Agent
      .post('/api/auth/register')
      .send({
        full_name: 'Emma Watson',
        email: 'emma@example.com',
        phone: '+919876543202',
        password: 'Password@123'
      });
    customer2User = res2.body.data.user;

    // Seed Admin user
    const adminHash = await bcrypt.hash('Admin@123', 10);
    userRepo.createUser({
      full_name: 'Chief Credit Officer',
      email: 'admin@trustvault.com',
      phone: '+919876543000',
      password_hash: adminHash,
      role: 'admin'
    });

    // Login as Admin
    await adminAgent
      .post('/api/auth/login')
      .send({
        email: 'admin@trustvault.com',
        password: 'Admin@123'
      });
  });

  describe('Customer Loan Application', () => {
    it('should successfully submit a valid loan application', async () => {
      const res = await customer1Agent
        .post('/api/loans')
        .send({
          loan_type: 'personal',
          requested_amount: 100000, // ₹1,00,000.00
          tenure_months: 24,
          description: 'Home renovation'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.requested_amount_paise).toBe(10000000);
      expect(res.body.data.tenure_months).toBe(24);
    });

    it('should reject loan application with invalid or zero amount', async () => {
      const resZero = await customer1Agent
        .post('/api/loans')
        .send({
          loan_type: 'personal',
          requested_amount: 0,
          tenure_months: 12
        });

      expect(resZero.status).toBe(400);
      expect(resZero.body.success).toBe(false);

      const resNeg = await customer1Agent
        .post('/api/loans')
        .send({
          loan_type: 'personal',
          requested_amount: -50000,
          tenure_months: 12
        });

      expect(resNeg.status).toBe(400);
      expect(resNeg.body.success).toBe(false);
    });

    it('should reject loan application with missing loan type', async () => {
      const res = await customer1Agent
        .post('/api/loans')
        .send({
          requested_amount: 50000,
          tenure_months: 12
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Loan Ownership and Visibility', () => {
    let loan1Id;
    let loan2Id;

    beforeEach(async () => {
      const res1 = await customer1Agent
        .post('/api/loans')
        .send({
          loan_type: 'home',
          requested_amount: 500000,
          tenure_months: 60
        });
      loan1Id = res1.body.data.id;

      const res2 = await customer2Agent
        .post('/api/loans')
        .send({
          loan_type: 'education',
          requested_amount: 200000,
          tenure_months: 36
        });
      loan2Id = res2.body.data.id;
    });

    it('customer sees only own loans when requesting /api/loans/me', async () => {
      const res = await customer1Agent.get('/api/loans/me');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].id).toBe(loan1Id);
      expect(res.body.data[0].user_id).toBe(customer1User.id);
    });

    it('customer cannot see another customer loan via /api/loans/:id', async () => {
      const res = await customer1Agent.get(`/api/loans/${loan2Id}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/access denied/i);
    });

    it('customer can view their own loan by ID', async () => {
      const res = await customer1Agent.get(`/api/loans/${loan1Id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(loan1Id);
    });
  });

  describe('Admin Loan Decisions', () => {
    let pendingLoanId;

    beforeEach(async () => {
      const res = await customer1Agent
        .post('/api/loans')
        .send({
          loan_type: 'vehicle',
          requested_amount: 300000,
          tenure_months: 36,
          description: 'Car financing'
        });
      pendingLoanId = res.body.data.id;
    });

    it('admin can approve a pending loan', async () => {
      const res = await adminAgent
        .patch(`/api/admin/loans/${pendingLoanId}/decision`)
        .send({
          decision: 'approved',
          decision_note: 'Applicant has excellent credit score.'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('approved');
      expect(res.body.data.decision_note).toBe('Applicant has excellent credit score.');
      expect(res.body.data.reviewed_by).toBeDefined();
    });

    it('admin can reject a pending loan', async () => {
      const res = await adminAgent
        .patch(`/api/admin/loans/${pendingLoanId}/decision`)
        .send({
          decision: 'rejected',
          decision_note: 'Debt-to-income ratio too high.'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('rejected');
      expect(res.body.data.decision_note).toBe('Debt-to-income ratio too high.');
    });

    it('customer cannot approve or reject loans (forbidden)', async () => {
      const res = await customer1Agent
        .patch(`/api/admin/loans/${pendingLoanId}/decision`)
        .send({
          decision: 'approved'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/administrator privileges required/i);
    });
  });
});
