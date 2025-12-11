# AWS Textract ID Verification System - Setup Guide

## ✅ What's Been Implemented

Complete ID card verification system with AWS Textract OCR for students, teachers, and employees.

---

## 📋 Features Implemented

### 1. **Database Schema**
- ✅ `verification_requests` table for storing verification data
- ✅ Admin role column in users table (`role`: user, admin, super_admin)
- ✅ User verification status (`is_verified`, `verified_at`, `verified_by`)
- ✅ Admin activity logs table
- ✅ Database views for admin dashboard
- ✅ Automatic triggers for status updates

### 2. **Backend Services**
- ✅ AWS Textract service for ID card OCR
- ✅ Text extraction with confidence scores
- ✅ ID card quality validation
- ✅ Institution name detection
- ✅ Image optimization with Sharp

### 3. **API Endpoints**

**User Endpoints:**
- `POST /api/verification/submit` - Submit ID card for verification
- `GET /api/verification/status` - Get user's verification status
- `GET /api/verification/:id` - Get verification details

**Admin Endpoints:**
- `GET /api/verification/admin/pending` - Get pending verifications
- `GET /api/verification/admin/stats` - Get verification statistics
- `GET /api/verification/admin/by-status/:status` - Filter by status
- `POST /api/verification/admin/approve/:id` - Approve verification
- `POST /api/verification/admin/reject/:id` - Reject verification

### 4. **Middleware**
- ✅ Admin authorization middleware
- ✅ Super admin middleware
- ✅ File upload validation
- ✅ Image size and format restrictions

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration

```bash
cd Campus/BackEnd
psql -U postgres -d your_database_name -f migrations/create_verification_system.sql
```

Or using pgAdmin:
1. Open pgAdmin
2. Connect to your database
3. Open Query Tool
4. Copy-paste contents of `migrations/create_verification_system.sql`
5. Execute (F5)

### Step 2: Configure AWS Credentials

#### A. Create AWS Account
1. Go to https://aws.amazon.com
2. Sign up (free tier includes 1,000 Textract documents/month)

#### B. Create IAM User
1. Go to AWS Console → IAM → Users
2. Click "Add User"
3. User name: `campus-gigs-textract`
4. Select "Programmatic access"
5. Click "Next: Permissions"

#### C. Attach Textract Policy
1. Click "Attach existing policies directly"
2. Search for `AmazonTextractFullAccess`
3. Select it and click "Next: Tags"
4. Skip tags, click "Next: Review"
5. Click "Create User"

#### D. Save Credentials
**⚠️ IMPORTANT: Save these credentials immediately! They're only shown once.**

You'll get:
- **Access Key ID**: `AKIAIOSFODNN7EXAMPLE`
- **Secret Access Key**: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

### Step 3: Update .env File

Copy `.env.example` to `.env` and add your AWS credentials:

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_REGION=ap-south-1

# ID Verification Settings
MAX_ID_CARD_SIZE=5242880
ALLOWED_ID_FORMATS=image/jpeg,image/png,image/jpg,application/pdf
ADMIN_EMAIL=your-email@example.com
```

**Recommended AWS Regions:**
- `ap-south-1` (Mumbai) - Best for Bangladesh/India
- `ap-southeast-1` (Singapore) - Good for Asia
- `us-east-1` (Virginia) - Cheapest but farther

### Step 4: Create Admin User

**Option 1: Using SQL**
```sql
-- Update your email to be admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

**Option 2: Create new admin user**
```sql
INSERT INTO users (full_name, email, password, role, terms_agreed, is_verified)
VALUES (
  'Admin User',
  'admin@campus-gigs.com',
  '$2a$10$yourHashedPasswordHere',  -- Use bcrypt to hash your password
  'admin',
  true,
  true
);
```

To hash a password with bcrypt:
```javascript
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash('your_password', 10);
console.log(hashedPassword);
```

### Step 5: Restart Server

```bash
cd Campus/BackEnd
npm start
```

You should see:
```
✅ AWS Textract initialized for ID card verification
✅ Database connected: your_database_name
✅ Server running on port 5000
```

---

## 🧪 Testing the System

### Test 1: Submit Verification Request

**API Call:**
```bash
POST http://localhost:5000/api/verification/submit
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

Body:
- id_card_front: [image file]
- id_card_back: [image file] (optional)
- user_type: student
- institutional_email: student@university.edu
```

**Using Postman:**
1. Method: POST
2. URL: `http://localhost:5000/api/verification/submit`
3. Headers: `Authorization: Bearer YOUR_TOKEN`
4. Body → form-data:
   - `id_card_front`: Select image file
   - `user_type`: student
   - `institutional_email`: your-email@university.edu

**Expected Response:**
```json
{
  "success": true,
  "message": "Verification request submitted successfully",
  "data": {
    "verification_id": 1,
    "status": "pending",
    "extracted_data": {
      "fullText": ["Student ID", "John Doe", "ID: 12345"],
      "fields": {
        "fullName": { "value": "John Doe", "confidence": 95.5 },
        "idNumber": { "value": "12345", "confidence": 98.2 }
      },
      "confidence": 96.8
    }
  }
}
```

### Test 2: Check Verification Status

**API Call:**
```bash
GET http://localhost:5000/api/verification/status
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "has_verification": true,
    "is_verified": false,
    "status": "pending",
    "verification_id": 1,
    "user_type": "student",
    "submitted_at": "2025-12-09T10:30:00Z"
  }
}
```

### Test 3: Admin - View Pending Verifications

**API Call:**
```bash
GET http://localhost:5000/api/verification/admin/pending
Authorization: Bearer ADMIN_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "user_id": 123,
      "user_type": "student",
      "full_name": "John Doe",
      "email": "john@example.com",
      "id_card_url": "https://...",
      "extracted_data": {...},
      "status": "pending",
      "created_at": "2025-12-09T10:30:00Z"
    }
  ]
}
```

### Test 4: Admin - Approve Verification

**API Call:**
```bash
POST http://localhost:5000/api/verification/admin/approve/1
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "admin_notes": "ID verified successfully"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Verification approved successfully",
  "data": {
    "id": 1,
    "status": "approved",
    "reviewed_at": "2025-12-09T11:00:00Z"
  }
}
```

---

## 📊 Database Queries for Testing

### Check verification requests
```sql
SELECT * FROM verification_requests ORDER BY created_at DESC;
```

### Check verified users
```sql
SELECT id, email, is_verified, verified_at, role 
FROM users 
WHERE is_verified = true;
```

### Check admin activity logs
```sql
SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 20;
```

### Get verification statistics
```sql
SELECT * FROM verification_stats;
```

### Get pending verifications
```sql
SELECT * FROM pending_verifications;
```

---

## 💰 AWS Costs

### Free Tier (First 12 Months)
- **1,000 pages/month FREE**
- Perfect for testing and small campuses

### After Free Tier
- **$1.50 per 1,000 pages**
- If 100 students/month verify: **$0.15/month** (basically free!)
- If 1,000 students/month verify: **$1.50/month**

### Cost Calculation
```
Monthly verifications: 200
Cost: 200 × $1.50 / 1000 = $0.30
```

---

## 🔒 Security Best Practices

1. **Never commit .env file to git**
   ```bash
   # Already in .gitignore
   .env
   ```

2. **Rotate AWS credentials regularly**
   - Every 90 days recommended
   - Use AWS IAM to rotate keys

3. **Limit IAM permissions**
   - Only grant Textract access
   - Don't use root AWS account

4. **Encrypt ID card images**
   - Images stored in Firebase/local storage
   - Consider encryption at rest

5. **Admin access logging**
   - All admin actions logged in `admin_logs` table
   - Track who approved/rejected verifications

---

## 🐛 Troubleshooting

### Error: "AWS Textract not configured"
**Solution:** Check your `.env` file has AWS credentials:
```env
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJalr...
AWS_REGION=ap-south-1
```

### Error: "InvalidClientTokenId"
**Solution:** AWS credentials are incorrect. Verify:
1. Access Key ID is correct
2. Secret Access Key is correct
3. No extra spaces in .env file

### Error: "AccessDeniedException"
**Solution:** IAM user doesn't have Textract permissions. Add `AmazonTextractFullAccess` policy.

### Error: "Image quality too low"
**Solution:** 
- Take photo in good lighting
- Ensure ID card is flat and clearly visible
- Use rear camera, not front camera
- Minimum 1 megapixel recommended

### Error: "Admin access required"
**Solution:** User doesn't have admin role. Run:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

---

## 📝 Next Steps

### 1. Build Frontend UI
- ID card upload form
- Camera capture component
- Verification status badge
- Admin dashboard

### 2. Add Email Verification
- Send verification email to institutional email
- Verify email domain matches institution
- Require both ID + email for approval

### 3. Add Notifications
- Notify user when verification approved/rejected
- Email notifications
- In-app notifications

### 4. Analytics Dashboard
- Total verifications by type (student/teacher/employee)
- Approval rates
- Average review time
- Top institutions

---

## 📚 API Documentation

Full API documentation: See `verificationController.js` for detailed endpoint documentation.

---

## ✅ Verification System Complete!

You now have a complete ID card verification system with:
- AWS Textract OCR
- Admin approval workflow
- Database tracking
- Activity logging
- Quality validation

**Ready to move to next phase:** PostgreSQL Full-Text Search or Admin Panel UI? 🚀
