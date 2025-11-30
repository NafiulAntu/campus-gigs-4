# User-to-User Transaction System

## Overview
A peer-to-peer money transfer system that allows users to send money to each other directly within the Campus Gigs platform.

## Features

### ✨ Key Capabilities
- **Send Money**: Transfer funds to any user on the platform
- **Transaction History**: View complete transaction records with filters
- **Real-time Balance**: Check current wallet balance
- **Transaction Types**: Support for transfers, payments, tips, and refunds
- **Transaction Notes**: Add optional messages with transactions
- **Notifications**: Recipients receive real-time notifications

### 🔒 Security & Validation
- Authentication required for all operations
- Balance validation before transactions
- Cannot send money to yourself
- Minimum amount validation
- Transaction rollback on errors
- Automatic balance updates via database triggers

## Setup Instructions

### 1. Database Migration
Run the migration to create the transaction system:

```bash
psql -U postgres -d "PG Antu" -f BackEnd/migrations/create_user_transactions.sql
```

This will:
- Create `user_transactions` table
- Add `balance` column to `users` table
- Create indexes for performance
- Set up automatic balance update triggers

### 2. Server Integration
The transaction routes are already integrated in `server.js`:
```javascript
app.use('/api/transactions', transactionRoutes);
```

### 3. Initial User Balances
To add initial balance to users (for testing):

**Via API:**
```bash
POST /api/transactions/balance/add
Authorization: Bearer <token>
{
  "amount": 1000
}
```

**Via SQL:**
```sql
UPDATE users SET balance = 1000 WHERE id = <user_id>;
```

## API Endpoints

### Transaction Operations

#### Send Money
```
POST /api/transactions/send
Authorization: Bearer <token>

Body:
{
  "receiver_id": 123,
  "amount": 500.00,
  "transaction_type": "transfer", // transfer, payment, tip, refund
  "notes": "Optional message"
}

Response:
{
  "success": true,
  "message": "Money sent successfully",
  "transaction": {
    "id": 1,
    "sender_id": 456,
    "receiver_id": 123,
    "amount": 500.00,
    "transaction_type": "transfer",
    "status": "completed",
    "notes": "Optional message",
    "created_at": "2025-11-29T10:00:00Z"
  }
}
```

#### Get Transaction History
```
GET /api/transactions/history?limit=50
Authorization: Bearer <token>

Response:
{
  "success": true,
  "transactions": [
    {
      "id": 1,
      "sender_id": 456,
      "receiver_id": 123,
      "amount": 500.00,
      "transaction_type": "transfer",
      "status": "completed",
      "notes": "Optional message",
      "sender_name": "John Doe",
      "sender_username": "johndoe",
      "sender_picture": "url",
      "receiver_name": "Jane Smith",
      "receiver_username": "janesmith",
      "receiver_picture": "url",
      "created_at": "2025-11-29T10:00:00Z"
    }
  ],
  "count": 1
}
```

#### Get Transaction by ID
```
GET /api/transactions/:transactionId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "transaction": { ... }
}
```

#### Get Current Balance
```
GET /api/transactions/balance/current
Authorization: Bearer <token>

Response:
{
  "success": true,
  "balance": 1500.00
}
```

#### Add Balance (Testing/Admin)
```
POST /api/transactions/balance/add
Authorization: Bearer <token>

Body:
{
  "amount": 1000.00
}

Response:
{
  "success": true,
  "message": "Balance added successfully",
  "balance": 2500.00
}
```

## Frontend Usage

### Send Money from User Profile
1. Navigate to any user's profile
2. Click the green **Send Money** button (💸 icon)
3. Enter amount and optional notes
4. Select transaction type
5. Review and confirm

### View Transactions
Import and use the Transactions component:

```javascript
import Transactions from './components/Post/Transactions';

// In your component
<Transactions onBack={() => setCurrentView('home')} />
```

### Programmatically Send Money
```javascript
import { sendMoney } from '../../services/api';

const handleSendMoney = async () => {
  try {
    const response = await sendMoney({
      receiver_id: 123,
      amount: 500,
      transaction_type: 'transfer',
      notes: 'Thanks for the help!'
    });
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Check Balance
```javascript
import { getBalance } from '../../services/api';

const fetchBalance = async () => {
  try {
    const response = await getBalance();
    console.log('Balance:', response.data.balance);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Database Schema

### `user_transactions` Table
```sql
CREATE TABLE user_transactions (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(id),
  receiver_id INTEGER REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  transaction_type VARCHAR(50) DEFAULT 'transfer',
  status VARCHAR(20) DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `users` Table Addition
```sql
ALTER TABLE users ADD COLUMN balance DECIMAL(10, 2) DEFAULT 0.00;
```

## Transaction Types
- **transfer**: General money transfer between users
- **payment**: Payment for goods/services
- **tip**: Voluntary tip/donation
- **refund**: Money return/refund

## Transaction Status
- **pending**: Transaction initiated but not completed
- **completed**: Successfully completed (default)
- **failed**: Transaction failed
- **refunded**: Transaction was refunded

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Users can only view their own transactions
3. **Balance Validation**: System checks sufficient balance before transfer
4. **Self-Transfer Prevention**: Cannot send money to yourself
5. **Database Transactions**: All operations are atomic with rollback support
6. **Trigger-Based Updates**: Balance updates are handled by database triggers for consistency

## Testing

### Test Scenarios

1. **Successful Transfer**
```bash
# Add balance to sender
POST /api/transactions/balance/add
{ "amount": 1000 }

# Send money
POST /api/transactions/send
{ "receiver_id": 123, "amount": 500, "transaction_type": "transfer" }
```

2. **Insufficient Balance**
```bash
POST /api/transactions/send
{ "receiver_id": 123, "amount": 5000 } # Should fail
```

3. **Self-Transfer Prevention**
```bash
POST /api/transactions/send
{ "receiver_id": <own_id>, "amount": 100 } # Should fail
```

## Error Handling

Common errors and their meanings:

- `400 Bad Request`: Invalid input (missing fields, negative amount, etc.)
- `404 Not Found`: Receiver user not found
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Server-side error

## Future Enhancements

- [ ] Transaction limits (daily/monthly)
- [ ] Transaction fees
- [ ] Escrow/hold transactions
- [ ] Recurring transfers
- [ ] QR code payments
- [ ] Integration with external payment gateways
- [ ] Transaction disputes/reports
- [ ] Admin dashboard for monitoring

## Support

For issues or questions:
1. Check the error message in the response
2. Verify authentication token is valid
3. Ensure sufficient balance exists
4. Check database connection
5. Review server logs for detailed errors

---

**Last Updated**: November 29, 2025
