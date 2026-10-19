const bcrypt = require('bcrypt');
const db = require('../config/database');
const { initDatabase } = require('./initialize');
const userRepo = require('../repositories/user.repository');
const accountRepo = require('../repositories/account.repository');
const transactionRepo = require('../repositories/transaction.repository');
const loanRepo = require('../repositories/loan.repository');
const { generateAccountNumber, generateTransactionRef, formatAmount } = require('../utils/responses');

/**
 * Database Seed Script
 * Populates initial administrative, customer, account, transaction, and loan data.
 * Safe to re-run: skips entities if they already exist.
 */
async function seedDatabase(targetDb = db) {
  // Ensure tables exist before attempting seed
  initDatabase(targetDb);

  console.log('\n[TrustVault Seed] Commencing database seeding...');

  // 1. Seed Administrator
  let admin = userRepo.findByEmail('admin@trustvault.com');
  if (!admin) {
    const adminHash = await bcrypt.hash('Admin@123', 10);
    admin = userRepo.createUser({
      full_name: 'TrustVault Administrator',
      email: 'admin@trustvault.com',
      phone: '+919876543210',
      password_hash: adminHash,
      role: 'admin'
    });
    console.log(' -> Created Admin: admin@trustvault.com (Admin@123)');
  } else {
    console.log(' -> Admin admin@trustvault.com already exists.');
  }

  // 2. Seed Fictional Customers and Accounts
  const customerPasswordHash = await bcrypt.hash('Customer@1', 10);
  const customersConfig = [
    {
      full_name: 'Arjun Sharma',
      email: 'arjun@example.com',
      phone: '+919876500001',
      account_type: 'savings',
      starting_balance_paise: 5000000 // ₹50,000.00
    },
    {
      full_name: 'Priya Patel',
      email: 'priya@example.com',
      phone: '+919876500002',
      account_type: 'current',
      starting_balance_paise: 12000000 // ₹1,20,000.00
    },
    {
      full_name: 'Rahul Verma',
      email: 'rahul@example.com',
      phone: '+919876500003',
      account_type: 'savings',
      starting_balance_paise: 2500000 // ₹25,000.00
    }
  ];

  const seededUsers = {};
  const seededAccounts = {};

  for (const config of customersConfig) {
    let user = userRepo.findByEmail(config.email);
    if (!user) {
      user = userRepo.createUser({
        full_name: config.full_name,
        email: config.email,
        phone: config.phone,
        password_hash: customerPasswordHash,
        role: 'customer'
      });
      console.log(` -> Created Customer: ${user.full_name} (${user.email})`);
    } else {
      console.log(` -> Customer ${user.email} already exists.`);
    }
    seededUsers[config.email] = user;

    let account = accountRepo.findByUserId(user.id);
    if (!account) {
      account = accountRepo.createAccount({
        account_number: generateAccountNumber(),
        user_id: user.id,
        account_type: config.account_type,
        balance_paise: config.starting_balance_paise,
        status: 'active'
      });
      console.log(`    Account ${account.account_number} created with ₹${formatAmount(account.balance_paise)}.`);
    } else {
      console.log(`    Account ${account.account_number} already exists.`);
    }
    seededAccounts[config.email] = account;
  }

  // 3. Seed Sample Transactions (10+ realistic transactions)
  const txCount = targetDb.prepare('SELECT COUNT(*) as count FROM transactions').get().count;
  if (txCount === 0) {
    console.log(' -> Seeding 12 sample transactions...');
    const arjunAcc = seededAccounts['arjun@example.com'];
    const priyaAcc = seededAccounts['priya@example.com'];
    const rahulAcc = seededAccounts['rahul@example.com'];

    const sampleTransactions = [
      // Deposits
      { type: 'deposit', src: null, dst: arjunAcc.id, paise: 2000000, desc: 'Initial Salary Deposit' },
      { type: 'deposit', src: null, dst: priyaAcc.id, paise: 5000000, desc: 'Client Consulting Inflow' },
      { type: 'deposit', src: null, dst: rahulAcc.id, paise: 1000000, desc: 'Cheque Clearance' },
      // Withdrawals
      { type: 'withdrawal', src: arjunAcc.id, dst: null, paise: 500000, desc: 'ATM Cash Withdrawal' },
      { type: 'withdrawal', src: priyaAcc.id, dst: null, paise: 1500000, desc: 'Vendor Payment Cash' },
      { type: 'withdrawal', src: rahulAcc.id, dst: null, paise: 200000, desc: 'Grocery Store POS' },
      // Transfers
      { type: 'transfer', src: arjunAcc.id, dst: priyaAcc.id, paise: 500000, desc: 'Apartment Maintenance Fee' },
      { type: 'transfer', src: priyaAcc.id, dst: rahulAcc.id, paise: 300000, desc: 'Design Subcontracting' },
      { type: 'transfer', src: rahulAcc.id, dst: arjunAcc.id, paise: 150000, desc: 'Dinner Bill Split' },
      { type: 'transfer', src: arjunAcc.id, dst: rahulAcc.id, paise: 250000, desc: 'Emergency Loan Repayment' },
      // More deposits & activities
      { type: 'deposit', src: null, dst: arjunAcc.id, paise: 3500000, desc: 'Quarterly Bonus Credited' },
      { type: 'deposit', src: null, dst: priyaAcc.id, paise: 8500000, desc: 'Business Contract Advance' }
    ];

    for (const tx of sampleTransactions) {
      transactionRepo.createTransaction({
        transaction_reference: generateTransactionRef(),
        transaction_type: tx.type,
        source_account_id: tx.src,
        destination_account_id: tx.dst,
        amount_paise: tx.paise,
        status: 'completed',
        description: tx.desc
      }, targetDb);
    }
    console.log(' -> Successfully seeded 12 transactions.');
  } else {
    console.log(` -> Transactions already present (${txCount} records). Skipping.`);
  }

  // 4. Seed Pending Loan Applications
  const loanCount = targetDb.prepare('SELECT COUNT(*) as count FROM loan_applications').get().count;
  if (loanCount === 0) {
    console.log(' -> Seeding pending loan applications...');
    const arjun = seededUsers['arjun@example.com'];
    const rahul = seededUsers['rahul@example.com'];

    loanRepo.createLoan({
      user_id: arjun.id,
      loan_type: 'personal',
      requested_amount_paise: 20000000, // ₹2,00,000.00
      tenure_months: 24,
      application_description: 'Home renovation and appliance upgrade.'
    });

    loanRepo.createLoan({
      user_id: rahul.id,
      loan_type: 'education',
      requested_amount_paise: 50000000, // ₹5,00,000.00
      tenure_months: 36,
      application_description: 'Higher education tuition and academic supplies.'
    });

    console.log(' -> Seeded 2 pending loan applications for Arjun Sharma and Rahul Verma.');
  } else {
    console.log(` -> Loan applications already present (${loanCount} records). Skipping.`);
  }

  console.log('[TrustVault Seed] Database seeding finished successfully!\n');
}

if (require.main === module) {
  seedDatabase().catch(err => {
    console.error('[TrustVault Seed] Seeding error:', err);
    process.exit(1);
  });
}

module.exports = {
  seedDatabase
};
