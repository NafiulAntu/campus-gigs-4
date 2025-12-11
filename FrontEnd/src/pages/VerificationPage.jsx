import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Avatar,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { submitVerification, getVerificationStatus } from '../services/api';

function VerificationPage() {
  const [formData, setFormData] = useState({
    role: '',
    fullName: '',
    email: '',
  });
  const [idCardFile, setIdCardFile] = useState(null);
  const [idCardPreview, setIdCardPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    loadVerificationStatus();
  }, []);

  const loadVerificationStatus = async () => {
    try {
      setStatusLoading(true);
      const response = await getVerificationStatus();
      setStatus(response.data.verification);
    } catch (err) {
      // User might not have submitted verification yet
      console.log('No verification status found');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setIdCardFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdCardPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.role || !formData.fullName || !formData.email || !idCardFile) {
      setError('Please fill all fields and upload your ID card');
      return;
    }

    try {
      setLoading(true);

      const submitData = new FormData();
      submitData.append('role', formData.role);
      submitData.append('fullName', formData.fullName);
      submitData.append('email', formData.email);
      submitData.append('idCard', idCardFile);

      await submitVerification(submitData);

      setSuccess(true);
      setFormData({ role: '', fullName: '', email: '' });
      setIdCardFile(null);
      setIdCardPreview(null);

      // Reload status after 2 seconds
      setTimeout(() => {
        loadVerificationStatus();
      }, 2000);
    } catch (err) {
      console.error('Error submitting verification:', err);
      setError(
        err.response?.data?.message || 'Failed to submit verification. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statusValue) => {
    switch (statusValue) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (statusValue) => {
    switch (statusValue) {
      case 'pending':
        return <PendingIcon />;
      case 'approved':
        return <CheckIcon />;
      case 'rejected':
        return <CancelIcon />;
      default:
        return null;
    }
  };

  if (statusLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // If user has a verification request, show status
  if (status) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  margin: '0 auto 16px',
                  bgcolor: `${getStatusColor(status.status)}.main`,
                }}
              >
                {getStatusIcon(status.status)}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                Verification Status
              </Typography>
              <Chip
                label={status.status.toUpperCase()}
                color={getStatusColor(status.status)}
                size="large"
              />
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Role:</strong> {status.requested_role.toUpperCase()}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Name:</strong> {status.full_name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Email:</strong> {status.email}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Submitted:</strong>{' '}
                {new Date(status.submitted_at).toLocaleDateString()}
              </Typography>

              {status.reviewed_at && (
                <Typography variant="body1" gutterBottom>
                  <strong>Reviewed:</strong>{' '}
                  {new Date(status.reviewed_at).toLocaleDateString()}
                </Typography>
              )}

              {status.admin_notes && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <strong>Admin Notes:</strong> {status.admin_notes}
                </Alert>
              )}

              {status.status === 'pending' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Your verification request is being reviewed. You will be notified once it's
                  processed.
                </Alert>
              )}

              {status.status === 'approved' && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Congratulations! Your account has been verified. You now have access to all{' '}
                  {status.requested_role} features.
                </Alert>
              )}

              {status.status === 'rejected' && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Your verification request was rejected. Please contact support for more
                  information.
                </Alert>
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Show verification submission form
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Account Verification
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Submit your ID card for verification to access exclusive features for students, teachers,
          and employees.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Verification request submitted successfully! We'll review it within 24-48 hours.
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>I am a</InputLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              label="I am a"
              required
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="employee">Employee</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            required
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            sx={{ mb: 3 }}
          />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Upload ID Card
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please upload a clear photo of your student/employee/teacher ID card. Supported
              formats: JPG, PNG (Max 10MB)
            </Typography>

            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              fullWidth
              sx={{ mb: 2 }}
            >
              Choose File
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </Button>

            {idCardPreview && (
              <Box
                sx={{
                  mt: 2,
                  border: '2px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1,
                }}
              >
                <img
                  src={idCardPreview}
                  alt="ID Card Preview"
                  style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
                />
              </Box>
            )}
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Verification Request'}
          </Button>
        </form>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Privacy Notice:</strong> Your ID card will be processed using AWS Textract for
            verification purposes only. We do not store or share your personal information.
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
}

export default VerificationPage;
