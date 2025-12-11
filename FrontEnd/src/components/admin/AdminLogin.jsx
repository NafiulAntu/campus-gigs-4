import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Lock as LockIcon,
  Email as EmailIcon,
  Visibility,
  VisibilityOff,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { signin } from '../../services/api';

function AdminLogin() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await signin(credentials);
      
      // Check if user is admin
      const user = response.data.user;
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        setError('Access Denied: You do not have admin privileges');
        setLoading(false);
        return;
      }

      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Redirect to admin panel
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: 2,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            padding: 4,
            borderRadius: 3,
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #dc2626 0%, #7c2d12 100%)',
                mb: 2,
                boxShadow: '0 8px 24px rgba(220, 38, 38, 0.4)'
              }}
            >
              <AdminIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#f1f5f9' }}>
              Admin Panel
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Secure Access Portal
            </Typography>
          </Box>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              placeholder="Email Address"
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  color: '#f1f5f9',
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: '#334155',
                  },
                  '&:hover fieldset': {
                    borderColor: '#64748b',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#dc2626',
                    borderWidth: '2px',
                  },
                },
                '& input': {
                  padding: '14px 16px',
                  '&:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 100px #1e293b inset !important',
                    WebkitTextFillColor: '#f1f5f9 !important',
                    transition: 'background-color 5000s ease-in-out 0s',
                  },
                  '&:-webkit-autofill:hover': {
                    WebkitBoxShadow: '0 0 0 100px #1e293b inset !important',
                    WebkitTextFillColor: '#f1f5f9 !important',
                  },
                  '&:-webkit-autofill:focus': {
                    WebkitBoxShadow: '0 0 0 100px #1e293b inset !important',
                    WebkitTextFillColor: '#f1f5f9 !important',
                  },
                  '&:-webkit-autofill:active': {
                    WebkitBoxShadow: '0 0 0 100px #1e293b inset !important',
                    WebkitTextFillColor: '#f1f5f9 !important',
                  },
                }
              }}
            />

            <TextField
              fullWidth
              placeholder="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={credentials.password}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ 
                        color: '#94a3b8',
                        '&:hover': {
                          color: '#f1f5f9',
                          backgroundColor: 'transparent'
                        }
                      }}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  color: '#f1f5f9',
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: '#334155',
                  },
                  '&:hover fieldset': {
                    borderColor: '#64748b',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#dc2626',
                    borderWidth: '2px',
                  },
                },
                '& input': {
                  padding: '14px 16px',
                  '&:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 100px #1e293b inset !important',
                    WebkitTextFillColor: '#f1f5f9 !important',
                    transition: 'background-color 5000s ease-in-out 0s',
                  },
                  '&:-webkit-autofill:hover': {
                    WebkitBoxShadow: '0 0 0 100px #1e293b inset !important',
                    WebkitTextFillColor: '#f1f5f9 !important',
                  },
                  '&:-webkit-autofill:focus': {
                    WebkitBoxShadow: '0 0 0 100px #1e293b inset !important',
                    WebkitTextFillColor: '#f1f5f9 !important',
                  },
                  '&:-webkit-autofill:active': {
                    WebkitBoxShadow: '0 0 0 100px #1e293b inset !important',
                    WebkitTextFillColor: '#f1f5f9 !important',
                  },
                }
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #dc2626 0%, #7c2d12 100%)',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In to Admin Panel'
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              background: 'rgba(220, 38, 38, 0.1)',
              border: '1px solid rgba(220, 38, 38, 0.2)'
            }}
          >
            <Typography variant="caption" sx={{ color: '#94a3b8' }} textAlign="center" display="block">
              🔒 This is a secure admin-only area. All activities are logged and monitored.
            </Typography>
          </Box>

          {/* Back to Home */}
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/')}
            sx={{ 
              mt: 2, 
              textTransform: 'none',
              color: '#94a3b8',
              '&:hover': {
                color: '#f1f5f9',
                background: 'rgba(148, 163, 184, 0.1)'
              }
            }}
          >
            ← Back to Home
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

export default AdminLogin;
