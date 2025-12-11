import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import {
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  getVerificationById,
} from '../../services/api';

function VerificationQueue({ onStatsUpdate }) {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterRole, setFilterRole] = useState('all');

  // Dialog states
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadVerifications();
  }, [page, filterStatus, filterRole]);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        status: filterStatus,
      };
      if (filterRole !== 'all') {
        params.role = filterRole;
      }

      const response = await getPendingVerifications(params);
      setVerifications(response.data.verifications);
      setTotalPages(response.data.pagination.pages);
      setError(null);
    } catch (err) {
      console.error('Error loading verifications:', err);
      setError('Failed to load verifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (verification) => {
    try {
      const response = await getVerificationById(verification.id);
      setSelectedVerification(response.data.verification);
      setViewDialogOpen(true);
    } catch (err) {
      console.error('Error loading verification details:', err);
      setError('Failed to load verification details.');
    }
  };

  const handleOpenActionDialog = (verification, type) => {
    setSelectedVerification(verification);
    setActionType(type);
    setAdminNotes('');
    setActionDialogOpen(true);
  };

  const handleAction = async () => {
    if (!selectedVerification) return;

    try {
      setActionLoading(true);
      const data = { admin_notes: adminNotes };

      if (actionType === 'approve') {
        await approveVerification(selectedVerification.id, data);
      } else {
        await rejectVerification(selectedVerification.id, data);
      }

      setActionDialogOpen(false);
      setAdminNotes('');
      await loadVerifications();
      if (onStatsUpdate) onStatsUpdate();
      
      setError(null);
    } catch (err) {
      console.error('Error processing verification:', err);
      setError(`Failed to ${actionType} verification. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'student':
        return <SchoolIcon />;
      case 'teacher':
        return <PersonIcon />;
      case 'employee':
        return <WorkIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
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

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            label="Status"
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={filterRole}
            label="Role"
            onChange={(e) => {
              setFilterRole(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value="student">Students</MenuItem>
            <MenuItem value="teacher">Teachers</MenuItem>
            <MenuItem value="employee">Employees</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Verification Cards */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : verifications.length === 0 ? (
        <Alert severity="info">No verification requests found.</Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {verifications.map((verification) => (
              <Grid item xs={12} key={verification.id}>
                <Card>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item>
                        <Avatar sx={{ width: 60, height: 60 }}>
                          {getRoleIcon(verification.requested_role)}
                        </Avatar>
                      </Grid>

                      <Grid item xs>
                        <Typography variant="h6">{verification.full_name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {verification.email}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip
                            label={verification.requested_role.toUpperCase()}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={verification.status.toUpperCase()}
                            size="small"
                            color={getStatusColor(verification.status)}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Submitted: {new Date(verification.submitted_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            startIcon={<ViewIcon />}
                            onClick={() => handleViewDetails(verification)}
                          >
                            View
                          </Button>
                          {verification.status === 'pending' && (
                            <>
                              <Button
                                variant="contained"
                                color="success"
                                startIcon={<ApproveIcon />}
                                onClick={() => handleOpenActionDialog(verification, 'approve')}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                startIcon={<RejectIcon />}
                                onClick={() => handleOpenActionDialog(verification, 'reject')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </>
      )}

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Verification Details</DialogTitle>
        <DialogContent>
          {selectedVerification && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Full Name
                </Typography>
                <Typography variant="body1">{selectedVerification.full_name}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{selectedVerification.email}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Requested Role
                </Typography>
                <Typography variant="body1">
                  {selectedVerification.requested_role.toUpperCase()}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={selectedVerification.status.toUpperCase()}
                  color={getStatusColor(selectedVerification.status)}
                  size="small"
                />
              </Grid>

              {selectedVerification.id_card_url && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    ID Card
                  </Typography>
                  <Box
                    component="img"
                    src={selectedVerification.id_card_url}
                    alt="ID Card"
                    sx={{
                      width: '100%',
                      maxHeight: 400,
                      objectFit: 'contain',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  />
                </Grid>
              )}

              {selectedVerification.extracted_data && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Extracted Data (AWS Textract)
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      overflowX: 'auto',
                    }}
                  >
                    <pre>{JSON.stringify(selectedVerification.extracted_data, null, 2)}</pre>
                  </Box>
                </Grid>
              )}

              {selectedVerification.admin_notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Admin Notes
                  </Typography>
                  <Typography variant="body2">{selectedVerification.admin_notes}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Approve/Reject Dialog */}
      <Dialog open={actionDialogOpen} onClose={() => !actionLoading && setActionDialogOpen(false)}>
        <DialogTitle>
          {actionType === 'approve' ? 'Approve' : 'Reject'} Verification
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to {actionType} this verification request?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Admin Notes (Optional)"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add any notes about your decision..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleAction}
            variant="contained"
            color={actionType === 'approve' ? 'success' : 'error'}
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default VerificationQueue;
