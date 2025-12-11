# Authentication Context Update Guide

## Adding Role to Auth Context

To make the admin dashboard and protected routes work properly, you need to include the user's `role` in your authentication context.

### Step 1: Update Your Auth Context

If you're using Firebase authentication, update your `AuthContext.jsx` (or similar file):

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase'; // Your Firebase config
import { onAuthStateChanged } from 'firebase/auth';
import { getUserProfile } from '../services/api'; // API call to get user profile

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get full user profile from your backend (includes role, is_verified, etc.)
          const response = await getUserProfile();
          setUser({
            ...firebaseUser,
            ...response.data.user, // This should include: role, is_verified, etc.
          });
        } catch (error) {
          console.error('Error loading user profile:', error);
          setUser(firebaseUser); // Fallback to Firebase user only
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

### Step 2: Add getUserProfile API Endpoint

Add this to your `FrontEnd/src/services/api.js`:

```javascript
// User Profile API
export const getUserProfile = () => API.get('/users/profile');
```

### Step 3: Create Backend Route for User Profile

Add this to your `BackEnd/routes/userRoutes.js`:

```javascript
// Get current user's profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, firebase_uid, email, role, is_verified, verified_at, 
              full_name, phone, profession, username, is_premium, created_at
       FROM users 
       WHERE id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
```

### Step 4: Alternative - Simpler Implementation

If you already have user data stored locally (e.g., in localStorage after login), you can modify the ProtectedRoute component to read from there:

**Update `ProtectedRoute.jsx`:**

```javascript
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getUserProfile } from '../services/api';

function ProtectedRoute({ children, requireAdmin = false }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await getUserProfile();
      setUser(response.data.user);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Admin access required.</p>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
```

### Step 5: Check Your Current Implementation

Look for these files in your project:
- `AuthContext.jsx` or `AuthProvider.jsx`
- `useAuth` hook
- Where user data is stored after login

The key requirement is that `user.role` should be available to check admin access.

---

## Quick Test

After updating, test admin access:

```javascript
// In any component
import { useAuth } from '../contexts/AuthContext';

function SomeComponent() {
  const { user } = useAuth();
  
  console.log('User role:', user?.role);
  console.log('Is admin:', user?.role === 'admin');
  
  return (
    <div>
      {user?.role === 'admin' && <p>You are an admin!</p>}
    </div>
  );
}
```

---

## Notes

1. Make sure the backend returns `role` field when authenticating users
2. Update the `users` table query to include `role` in SELECT statements
3. Store the role in your auth context/state management
4. The role should persist across page refreshes (use localStorage or session storage)

---

## If You Don't Have Auth Context Yet

Create a basic one:

```javascript
// FrontEnd/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Load user from localStorage on mount
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

Then wrap your app:

```javascript
// FrontEnd/src/main.jsx or App.jsx
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Your routes and components */}
    </AuthProvider>
  );
}
```
