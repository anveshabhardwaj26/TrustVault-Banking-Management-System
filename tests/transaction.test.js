const { app, db, request, setupTestDatabase } = require('./test-helper');
const accountRepo = require('../src/repositories/account.repository');

describe('Transaction API Tests (/api/transactions)', () => {
  let customer1Agent;
  let customer2Agent;
  let customer1Account;
  let customer2Account;

  beforeEach(async () => {
    setupTestDatabase();

    customer1Agent = request.agent(app);
    customer2Agent = request.agent(app);

    // Register Customer 1
    const res1 = await customer1Agent
      .post('/api/auth/register')
      .send({
        full_name: 'Alice Smith',
        email: 'alice.smith@example.com',
        phone: '+919876543201',
        password: 'Password@123'
      });
    customer1Account = res1.body.data.account;

    // Register Customer 2
    const res2 = await customer2Agent
      .post('/api/auth/register')
      .send({
        full_name: 'Bob Jones',
        email: 'bob.jones@example.com',
        phone: '+919876543202',
        password: 'Password@123'
      });
    customer2Account = res2.body.data.account;
  });

  describe('Deposit', () => {
    it('should process a valid deposit and update balance correctly', async () => {
      const res = await customer1Agent
        .post('/api/transactions/deposit')
        .send({ amount: 1500, description: 'Initial Salary Deposit' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.account.new_balance_paise).toBe(150000); // 1500 rupees in paise
      expect(res.body.data.transaction.transaction_type).toBe('deposit');

      // Verify directly from repository
      const acc = accountRepo.findById(customer1Account.id);
      expect(acc.balance_paise).toBe(150000);
    });

    it('should reject a deposit with zero amount', async () => {
      const res = await customer1Agent
        .post('/api/transactions/deposit')
        .send({ amount: 0 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/positive number|greater than zero/i);
    });

    it('should reject a deposit with negative amount', async () => {
      const res = await customer1Agent
        .post('/api/transactions/deposit')
        .send({ amount: -500 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/positive number|greater than zero/i);
    });

    it('should reject deposit if account is closed or blocked', async () => {
      // Block customer1 account
      accountRepo.updateStatus(customer1Account.id, 'blocked');

      const res = await customer1Agent
        .post('/api/transactions/deposit')
        .send({ amount: 1000 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/blocked/i);
    });
  });

  describe('Withdrawal', () => {
    beforeEach(async () => {
      // Pre-fund customer 1 with ₹2,000.00
      await customer1Agent
        .post('/api/transactions/deposit')
        .send({ amount: 2000 });
    });

    it('should process a valid withdrawal and deduct balance', async () => {
      const res = await customer1Agent
        .post('/api/transactions/withdraw')
        .send({ amount: 500, description: 'ATM Withdrawal' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.account.new_balance_paise).toBe(150000); // 2000 - 500 = 1500 rupees
    });

    it('should allow withdrawal of exact available balance', async () => {
      const res = await customer1Agent
        .post('/api/transactions/withdraw')
        .send({ amount: 2000 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.account.new_balance_paise).toBe(0);
    });

    it('should reject withdrawal exceeding current balance', async () => {
      const res = await customer1Agent
        .post('/api/transactions/withdraw')
        .send({ amount: 2500 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/insufficient balance/i);

      // Verify balance did not change
      const acc = accountRepo.findById(customer1Account.id);
      expect(acc.balance_paise).toBe(200000);
    });

    it('should reject withdrawal with zero or negative amount', async () => {
      const resZero = await customer1Agent
        .post('/api/transactions/withdraw')
        .send({ amount: 0 });

      expect(resZero.status).toBe(400);
      expect(resZero.body.success).toBe(false);

      const resNeg = await customer1Agent
        .post('/api/transactions/withdraw')
        .send({ amount: -100 });

      expect(resNeg.status).toBe(400);
      expect(resNeg.body.success).toBe(false);
    });
  });

  describe('Fund Transfer & Atomicity', () => {
    beforeEach(async () => {
      // Fund Alice with ₹3,000.00
      await customer1Agent
        .post('/api/transactions/deposit')
        .send({ amount: 3000 });
    });

    it('should execute a valid transfer and update both account balances atomically', async () => {
      const res = await customer1Agent
        .post('/api/transactions/transfer')
        .send({
          destination_account_number: customer2Account.account_number,
          amount: 1000,
          description: 'Payment for services'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sender_account.new_balance_paise).toBe(200000); // 3000 - 1000

      // Verify database state for both parties
      const aliceAcc = accountRepo.findById(customer1Account.id);
      const bobAcc = accountRepo.findById(customer2Account.id);

      expect(aliceAcc.balance_paise).toBe(200000); // ₹2,000.00
      expect(bobAcc.balance_paise).toBe(100000);   // ₹1,000.00

      // Verify transaction table entry
      const tx = db.prepare("SELECT * FROM transactions WHERE transaction_type = 'transfer' ORDER BY id DESC LIMIT 1").get();
      expect(tx).toBeDefined();
      expect(tx.source_account_id).toBe(customer1Account.id);
      expect(tx.destination_account_id).toBe(customer2Account.id);
      expect(tx.amount_paise).toBe(100000);
      expect(tx.status).toBe('completed');
    });

    it('should reject transfer when sender has insufficient balance', async () => {
      const res = await customer1Agent
        .post('/api/transactions/transfer')
        .send({
          destination_account_number: customer2Account.account_number,
          amount: 5000 // Alice only has 3000
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/insufficient/i);

      // Verify neither balance was changed
      const aliceAcc = accountRepo.findById(customer1Account.id);
      const bobAcc = accountRepo.findById(customer2Account.id);
      expect(aliceAcc.balance_paise).toBe(300000);
      expect(bobAcc.balance_paise).toBe(0);
    });

    it('should reject transfer to an invalid beneficiary account', async () => {
      const res = await customer1Agent
        .post('/api/transactions/transfer')
        .send({
          destination_account_number: 'TV9999999999',
          amount: 500
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/destination account not found/i);
    });

    it('should reject transfer when destination is the same account', async () => {
      const res = await customer1Agent
        .post('/api/transactions/transfer')
        .send({
          destination_account_number: customer1Account.account_number,
          amount: 500
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/same account/i);
    });

    it('should reject transfer with zero or negative amount', async () => {
      const res = await customer1Agent
        .post('/api/transactions/transfer')
        .send({
          destination_account_number: customer2Account.account_number,
          amount: 0
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should ensure atomicity: failed transfer leaves both balances unchanged', async () => {
      // Intentionally block Bob's account to induce failure during transfer validation
      accountRepo.updateStatus(customer2Account.id, 'blocked');

      const initialAliceBalance = accountRepo.findById(customer1Account.id).balance_paise;
      const initialBobBalance = accountRepo.findById(customer2Account.id).balance_paise;

      const res = await customer1Agent
        .post('/api/transactions/transfer')
        .send({
          destination_account_number: customer2Account.account_number,
          amount: 500
        });

      expect(res.status).toBe(400);

      // Verify balances are completely unchanged
      const finalAliceBalance = accountRepo.findById(customer1Account.id).balance_paise;
      const finalBobBalance = accountRepo.findById(customer2Account.id).balance_paise;

      expect(finalAliceBalance).toBe(initialAliceBalance);
      expect(finalBobBalance).toBe(initialBobBalance);
    });
  });
});
