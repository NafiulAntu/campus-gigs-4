# Campus Gigs - Backend

Node.js/Express backend with PostgreSQL database and Firebase Storage integration.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database and Firebase credentials

# Start server
npm start
```

Server runs on: `http://localhost:5000`

## 📦 Features

- ✅ User authentication (JWT)
- ✅ Post CRUD operations
- ✅ File uploads (Firebase Storage)
- ✅ User profiles (Students, Teachers, Employees)
- ✅ Like/Share/Comment system
- ✅ PostgreSQL database

## 🔥 Firebase Storage Setup

**Media files (images, videos, documents) are stored in Firebase Storage.**

See **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** for complete setup instructions.

### Quick Setup:

1. Create Firebase project
2. Enable Storage
3. Get service account credentials
4. Add to `.env`:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
```

**Without Firebase:** App falls back to local storage automatically.

## 📁 Project Structure

```
BackEnd/
├── config/
│   ├── db.js              # PostgreSQL connection
│   ├── firebase.js        # Firebase Storage setup
│   ├── passport.js        # Authentication strategies
│   └── sequelize.js       # Sequelize ORM
├── controllers/           # Business logic
├── middleware/            # Auth middleware
├── models/               # Database models
├── routes/               # API endpoints
├── uploads/              # Local file storage (fallback)
└── server.js             # Entry point
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Posts

- `GET /api/posts` - Get all posts
- `GET /api/posts/:postId` - Get specific post
- `POST /api/posts` - Create post
- `PUT /api/posts/:postId` - Update post
- `DELETE /api/posts/:postId` - Delete post
- `POST /api/posts/:postId/like` - Like/unlike post
- `POST /api/posts/:postId/share` - Share/unshare post
- `POST /api/posts/:postId/comment` - Add comment
- `GET /api/posts/:postId/comments` - Get comments

### Users

- `GET /api/users/:userId` - Get user profile
- `GET /api/students/:studentId` - Get student profile
- `GET /api/teachers/:teacherId` - Get teacher profile
- `GET /api/employees/:employeeId` - Get employee profile

### Uploads

- `POST /api/upload` - Upload files (images, videos, docs)

## 🗄️ Database Schema

### Users Table

- id, username, email, password, profession, full_name, phone

### Posts Table

- id, user_id, content, media_urls (JSON array), likes_count, shares_count, created_at

### Profiles Tables

- students: university, degree, year, bio, interests, skills, certificates
- teachers: university, department, subjects, bio, interests, skills, certificates
- employees: company, position, experience, bio, interests, skills, certificates

## 🛠️ Environment Variables

```env
# Server
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-secret-key

# Firebase Storage
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## 📦 Dependencies

- **express** - Web framework
- **pg** - PostgreSQL client
- **firebase-admin** - Firebase Storage
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **multer** - File upload handling
- **cors** - Cross-origin requests
- **dotenv** - Environment variables

## 🧪 Testing

```bash
# Start development server
npm run dev

# Test with curl
curl http://localhost:5000/api/posts

# Test file upload
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@image.jpg"
```

## 📝 File Upload Details

### Supported Formats

- **Images**: JPG, PNG, GIF, WEBP
- **Videos**: MP4, MOV, AVI, WEBM
- **Documents**: PDF, DOC, DOCX, TXT, ODT, RTF, PPT, PPTX, XLS, XLSX, CSV
- **Archives**: ZIP, RAR

### Limits

- Max file size: **50MB**
- Max files per post: **10**

### Storage

- **Firebase Storage**: Primary (requires setup)
- **Local Storage**: Fallback (automatic)

## 🔐 Security

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Protected routes
- ✅ File type validation
- ✅ Firebase Storage rules

## 🐛 Troubleshooting

### "Firebase Storage not initialized"

→ Check `.env` for Firebase credentials

### "Database connection failed"

→ Verify PostgreSQL is running and credentials are correct

### "Port 5000 already in use"

→ Change PORT in `.env` or kill existing process

## 📚 Resources

- [Express.js Docs](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Firebase Storage Docs](https://firebase.google.com/docs/storage)
- [JWT.io](https://jwt.io/)
