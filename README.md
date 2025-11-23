# Campus Gigs

A social platform for university students, teachers, and employees to connect, share, and collaborate.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- PostgreSQL
- Firebase account (optional - for media storage)

### Installation

```bash
# Install dependencies for both frontend and backend
npm install

# Start both servers concurrently
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

### Manual Setup

```bash
# Backend
cd BackEnd
npm install
npm start

# Frontend (in new terminal)
cd FrontEnd
npm install
npm run dev
```

## 📦 Features

### ✅ User Management

- Registration & Login (JWT authentication)
- Three user types: Students, Teachers, Employees
- Detailed user profiles with interests, skills, education
- Profile viewing and editing

### ✅ Social Posts

- Create posts with text and media
- Upload images, videos, documents
- Like, share, and comment on posts
- Delete own posts
- Full-screen image viewer with navigation
- Post editing capability

### ✅ Media Handling

- **Firebase Storage Integration** (recommended)
- Support for images, videos, documents, archives
- Up to 50MB per file, 10 files per post
- Automatic fallback to local storage

### ✅ User Interface

- Modern, responsive design
- Dark/Light mode support
- Smooth animations
- Mobile-friendly
- Image viewer with keyboard controls
- Delete confirmation modals

## 🗂️ Project Structure

```
Campus/
├── BackEnd/              # Node.js/Express API
│   ├── config/           # Database, Firebase, Passport
│   ├── controllers/      # Business logic
│   ├── middleware/       # Authentication
│   ├── models/          # PostgreSQL models
│   ├── routes/          # API endpoints
│   └── server.js        # Entry point
├── FrontEnd/            # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API services
│   │   └── index.jsx    # Entry point
│   └── vite.config.js   # Vite configuration
└── package.json         # Root package (concurrently)
```

## 🔥 Firebase Storage Setup

Media files are stored in Firebase Storage for better scalability and performance.

**Quick Setup:**

1. See [BackEnd/FIREBASE_SETUP.md](./BackEnd/FIREBASE_SETUP.md) for detailed instructions
2. Create Firebase project
3. Enable Storage
4. Add credentials to `BackEnd/.env`

**Without Firebase:** App automatically uses local storage.

## 🗄️ Database Setup

### PostgreSQL

```sql
-- Create database
CREATE DATABASE "PG Antu";

-- Tables are auto-created by the application
```

### Schema

- **users**: User accounts and authentication
- **students**: Student-specific profiles
- **teachers**: Teacher-specific profiles
- **employees**: Employee-specific profiles
- **posts**: User posts and content
- **post_likes**: Post likes tracking
- **post_shares**: Post shares tracking
- **post_comments**: Post comments

## 🔌 API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Posts

- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/share` - Share/unshare post
- `POST /api/posts/:id/comment` - Add comment

### Users

- `GET /api/users/:id` - Get user profile
- `GET /api/students/:id` - Get student profile
- `GET /api/teachers/:id` - Get teacher profile
- `GET /api/employees/:id` - Get employee profile

### Uploads

- `POST /api/upload` - Upload files

## 🛠️ Environment Configuration

### Backend (.env)

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=PG Antu
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key

# Firebase Storage (optional)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-email
FIREBASE_PRIVATE_KEY="your-key"
FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
```

## 📱 Supported File Types

### Images

JPEG, JPG, PNG, GIF, WEBP

### Videos

MP4, MOV, AVI, WEBM

### Documents

PDF, DOC, DOCX, TXT, ODT, RTF, PPT, PPTX, XLS, XLSX, CSV

### Archives

ZIP, RAR

**Limits:**

- Max size: 50MB per file
- Max files: 10 per post

## 🧪 Testing

```bash
# Test backend
curl http://localhost:5000/api/posts

# Test file upload
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@image.jpg"
```

## 📚 Tech Stack

### Frontend

- React 18
- Vite
- CSS3 (Custom styling)

### Backend

- Node.js
- Express.js
- PostgreSQL
- Firebase Storage
- JWT Authentication
- Multer (file uploads)

## 🔒 Security

- ✅ JWT token authentication
- ✅ Password hashing (bcrypt)
- ✅ Protected API routes
- ✅ File type validation
- ✅ File size limits
- ✅ Firebase Storage rules

## 🚀 Deployment

### Backend

- Configure environment variables
- Deploy to Heroku, Railway, or AWS
- Ensure PostgreSQL database is accessible
- Add Firebase credentials

### Frontend

- Build: `npm run build`
- Deploy to Vercel, Netlify, or Cloudflare Pages
- Update API endpoint in production

## 🐛 Troubleshooting

### "Firebase Storage not initialized"

→ Check Firebase credentials in `.env` or continue with local storage

### "Port already in use"

→ Change PORT in `.env` or kill existing process

### "Database connection failed"

→ Verify PostgreSQL is running and credentials are correct

### Posts not loading

→ Check backend server is running on port 5000

## 📖 Documentation

- [Backend README](./BackEnd/README.md)
- [Firebase Setup Guide](./BackEnd/FIREBASE_SETUP.md)
- [Firebase Integration Summary](./BackEnd/FIREBASE_INTEGRATION_SUMMARY.md)
- [Frontend README](./FrontEnd/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

## 📝 License

This project is for educational purposes.

## 👥 User Types

### Students

- University, degree, year
- Interests, skills, certificates
- Bio and personal information

### Teachers

- University, department
- Subjects taught
- Research interests
- Publications and certificates

### Employees

- Company, position
- Years of experience
- Professional skills
- Career achievements

## ✨ Recent Updates

### Firebase Storage Integration

- ✅ Video upload support
- ✅ Increased file size to 50MB
- ✅ Automatic media deletion
- ✅ CDN delivery for faster loading
- ✅ Fallback to local storage

### UI/UX Improvements

- ✅ Full-screen image viewer
- ✅ Image navigation (prev/next)
- ✅ Download images
- ✅ Keyboard shortcuts (ESC, arrows)
- ✅ Delete confirmation modal
- ✅ Stylish delete button

### Code Quality

- ✅ Removed unnecessary files
- ✅ Cleaned unused code
- ✅ Fixed import paths
- ✅ Better error handling
- ✅ Comprehensive documentation

## 📧 Support

For questions or issues:

- Check documentation in `BackEnd/` and `FrontEnd/`
- Review setup guides
- Check server console for error messages

---

**Happy Coding! 🎓💼**
