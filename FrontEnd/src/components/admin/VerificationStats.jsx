import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';

function VerificationStats({ stats }) {
  if (!stats) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No statistics available
        </Typography>
      </Box>
    );
  }

  const calculatePercentage = (value, total) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  };

  const approvalRate = calculatePercentage(stats.approved, stats.total);
  const rejectionRate = calculatePercentage(stats.rejected, stats.total);
  const pendingRate = calculatePercentage(stats.pending, stats.total);

  return (
    <Grid container spacing={3}>
      {/* Overview Stats */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Verification Overview
          </Typography>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Approval Rate
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    {approvalRate}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={approvalRate}
                  color="success"
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Rejection Rate
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="error.main">
                    {rejectionRate}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={rejectionRate}
                  color="error"
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Pending Rate
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="warning.main">
                    {pendingRate}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={pendingRate}
                  color="warning"
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Role Breakdown */}
      {stats.by_role && Object.keys(stats.by_role).length > 0 && (
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Requests by Role
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Role</TableCell>
                      <TableCell align="right">Pending</TableCell>
                      <TableCell align="right">Approved</TableCell>
                      <TableCell align="right">Rejected</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(stats.by_role).map(([role, data]) => (
                      <TableRow key={role}>
                        <TableCell>
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {role}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{data.pending || 0}</TableCell>
                        <TableCell align="right">{data.approved || 0}</TableCell>
                        <TableCell align="right">{data.rejected || 0}</TableCell>
                        <TableCell align="right">
                          <strong>{data.total || 0}</strong>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Recent Activity */}
      {stats.recent_approvals && stats.recent_approvals.length > 0 && (
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Approvals
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recent_approvals.slice(0, 5).map((approval, index) => (
                      <TableRow key={index}>
                        <TableCell>{approval.full_name}</TableCell>
                        <TableCell sx={{ textTransform: 'capitalize' }}>
                          {approval.requested_role}
                        </TableCell>
                        <TableCell>
                          {new Date(approval.reviewed_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Summary */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Typography variant="h6" gutterBottom>
            Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Requests
              </Typography>
              <Typography variant="h4">{stats.total || 0}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Verified Users
              </Typography>
              <Typography variant="h4">{stats.approved || 0}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Awaiting Review
              </Typography>
              <Typography variant="h4">{stats.pending || 0}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Success Rate
              </Typography>
              <Typography variant="h4">{approvalRate}%</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default VerificationStats;
