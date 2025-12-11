const pool = require('../config/db');

async function fixPaymentTables() {
  console.log('🔧 Starting payment tables schema fix...\n');

  try {
    // Check current payment_transactions structure
    const tableCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'payment_transactions'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Current payment_transactions columns:');
    tableCheck.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    console.log('');

    // Add missing columns to payment_transactions
    const alterations = [
      {
        name: 'subscription_id',
        sql: `
          DO $$ 
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name='payment_transactions' AND column_name='subscription_id'
            ) THEN
              ALTER TABLE payment_transactions 
              ADD COLUMN subscription_id INTEGER REFERENCES subscriptions(id);
              RAISE NOTICE 'Added subscription_id column';
            ELSE
              RAISE NOTICE 'subscription_id column already exists';
            END IF;
          END $$;
        `
      },
      {
        name: 'transaction_id',
        sql: `
          DO $$ 
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name='payment_transactions' AND column_name='transaction_id'
            ) THEN
              ALTER TABLE payment_transactions 
              ADD COLUMN transaction_id VARCHAR(255) UNIQUE;
              RAISE NOTICE 'Added transaction_id column';
            ELSE
              RAISE NOTICE 'transaction_id column already exists';
            END IF;
          END $$;
        `
      },
      {
        name: 'gateway_response',
        sql: `
          DO $$ 
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name='payment_transactions' AND column_name='gateway_response'
            ) THEN
              ALTER TABLE payment_transactions 
              ADD COLUMN gateway_response JSONB;
              RAISE NOTICE 'Added gateway_response column';
            ELSE
              RAISE NOTICE 'gateway_response column already exists';
            END IF;
          END $$;
        `
      },
      {
        name: 'plan_type',
        sql: `
          DO $$ 
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name='payment_transactions' AND column_name='plan_type'
            ) THEN
              ALTER TABLE payment_transactions 
              ADD COLUMN plan_type VARCHAR(50);
              RAISE NOTICE 'Added plan_type column';
            ELSE
              RAISE NOTICE 'plan_type column already exists';
            END IF;
          END $$;
        `
      },
      {
        name: 'payment_intent_id',
        sql: `
          DO $$ 
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name='payment_transactions' AND column_name='payment_intent_id'
            ) THEN
              ALTER TABLE payment_transactions 
              ADD COLUMN payment_intent_id VARCHAR(255);
              RAISE NOTICE 'Added payment_intent_id column';
            ELSE
              RAISE NOTICE 'payment_intent_id column already exists';
            END IF;
          END $$;
        `
      },
      {
        name: 'ssl_val_id',
        sql: `
          DO $$ 
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name='payment_transactions' AND column_name='ssl_val_id'
            ) THEN
              ALTER TABLE payment_transactions 
              ADD COLUMN ssl_val_id VARCHAR(255);
              RAISE NOTICE 'Added ssl_val_id column';
            ELSE
              RAISE NOTICE 'ssl_val_id column already exists';
            END IF;
          END $$;
        `
      },
      {
        name: 'ssl_card_type',
        sql: `
          DO $$ 
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name='payment_transactions' AND column_name='ssl_card_type'
            ) THEN
              ALTER TABLE payment_transactions 
              ADD COLUMN ssl_card_type VARCHAR(100);
              RAISE NOTICE 'Added ssl_card_type column';
            ELSE
              RAISE NOTICE 'ssl_card_type column already exists';
            END IF;
          END $$;
        `
      },
      {
        name: 'ssl_card_brand',
        sql: `
          DO $$ 
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name='payment_transactions' AND column_name='ssl_card_brand'
            ) THEN
              ALTER TABLE payment_transactions 
              ADD COLUMN ssl_card_brand VARCHAR(100);
              RAISE NOTICE 'Added ssl_card_brand column';
            ELSE
              RAISE NOTICE 'ssl_card_brand column already exists';
            END IF;
          END $$;
        `
      },
      {
        name: 'ssl_bank_tran_id',
        sql: `
          DO $$ 
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name='payment_transactions' AND column_name='ssl_bank_tran_id'
            ) THEN
              ALTER TABLE payment_transactions 
              ADD COLUMN ssl_bank_tran_id VARCHAR(255);
              RAISE NOTICE 'Added ssl_bank_tran_id column';
            ELSE
              RAISE NOTICE 'ssl_bank_tran_id column already exists';
            END IF;
          END $$;
        `
      }
    ];

    // Execute all alterations
    for (const alteration of alterations) {
      console.log(`🔄 Processing ${alteration.name}...`);
      await pool.query(alteration.sql);
    }

    console.log('\n✅ All payment_transactions schema fixes completed!');
    
    // Show final structure
    const finalCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'payment_transactions'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Updated payment_transactions structure:');
    finalCheck.rows.forEach(col => {
      console.log(`  ✓ ${col.column_name}: ${col.data_type}`);
    });

  } catch (error) {
    console.error('❌ Error fixing payment tables:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the fix
fixPaymentTables()
  .then(() => {
    console.log('\n✅ Payment tables fix completed successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Payment tables fix failed:', err);
    process.exit(1);
  });
