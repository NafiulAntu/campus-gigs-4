import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Verified as VerifiedIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { getVerificationStats } from '../services/api';
import VerificationQueue from '../components/admin/VerificationQueue';
import VerificationStats from '../components/admin/VerificationStats';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ paddingTop: '24px' }}>
      {value === index && children}
    </div>
  );
}

function AdminDashboard() {
  const [currentTab, setCurrentTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await getVerificationStats();
      setStats(response.data.stats);
      setError(null);
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Failed to load statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage user verifications and view platform statistics
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Pending
                    </Typography>
                    <Typography variant="h4">{stats.pending || 0}</Typography>
                  </Box>
                  <PendingIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Approved
                    </Typography>
                    <Typography variant="h4">{stats.approved || 0}</Typography>
                  </Box>
                  <VerifiedIcon sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Rejected
                    </Typography>
                    <Typography variant="h4">{stats.rejected || 0}</Typography>
                  </Box>
                  <CancelIcon sx={{ fontSize: 40, color: 'error.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Total Requests
                    </Typography>
                    <Typography variant="h4">{stats.total || 0}</Typography>
                  </Box>
                  <AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Verification Queue" />
          <Tab label="Statistics & Reports" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={currentTab} index={0}>
        <VerificationQueue onStatsUpdate={loadStats} />
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <VerificationStats stats={stats} />
      </TabPanel>
    </Container>
  );
}

export default AdminDashboard;
