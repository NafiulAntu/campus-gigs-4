import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Article as PostIcon,
  TrendingUp as TrendingIcon,
  People as PeopleIcon,
  VerifiedUser as VerifiedIcon,
  Star as PremiumIcon,
  Refresh as RefreshIcon,
  ArrowBack as BackIcon,
  SupervisorAccount as SuperAdminIcon,
  Block as BlockIcon,
  Edit as EditIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  getAdminDashboardStats,
  getAdminUsers,
  getAdminUserDetails,
  getAdminUserPosts,
  approveAdminUser,
  updateUserRole,
  deleteAdminUser,
  checkAdminStatus
} from '../../services/api';

// Stats Card Component
const StatsCard = ({ title, value, icon, color, subtitle }) => {
  const theme = useTheme();
  return (
    <Card sx={{ 
      height: '100%',
      background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
      border: `1px solid ${alpha(color, 0.2)}`,
      transition: 'transform 0.2s',
      '&:hover': { transform: 'translateY(-4px)' }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: alpha(color, 0.15), color }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

// User Details Dialog
const UserDetailsDialog = ({ open, onClose, userId }) => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
    }
  }, [open, userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminUserDetails(userId);
      setUserData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon />
          User Details
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : userData ? (
          <>
            {/* User Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar
                src={userData.user.profile_picture}
                sx={{ width: 80, height: 80 }}
              >
                {userData.user.full_name?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {userData.user.full_name || 'No Name'}
                  {userData.user.is_verified && (
                    <VerifiedIcon sx={{ ml: 1, color: 'primary.main', fontSize: 20 }} />
                  )}
                  {userData.user.is_premium && (
                    <PremiumIcon sx={{ ml: 0.5, color: 'warning.main', fontSize: 20 }} />
                  )}
                </Typography>
                <Typography color="text.secondary">@{userData.user.username || 'no-username'}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip 
                    label={userData.user.role?.toUpperCase() || 'USER'} 
                    size="small" 
                    color={userData.user.role === 'admin' || userData.user.role === 'super_admin' ? 'error' : 'default'}
                  />
                  <Chip 
                    label={userData.user.profession || 'Not Set'} 
                    size="small" 
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Box>

            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
              <Tab label="Basic Info" />
              <Tab label={`Posts (${userData.posts?.length || 0})`} />
              <Tab label="Profile Data" />
              <Tab label="Activity" />
            </Tabs>

            {/* Basic Info Tab */}
            {activeTab === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography>{userData.user.email}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Phone</Typography>
                  <Typography>{userData.user.phone || 'Not set'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">User ID</Typography>
                  <Typography>{userData.user.id}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Firebase UID</Typography>
                  <Typography sx={{ fontSize: 12 }}>{userData.user.firebase_uid || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Balance</Typography>
                  <Typography>${parseFloat(userData.user.balance || 0).toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Provider</Typography>
                  <Typography>{userData.user.provider || 'email'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Created At</Typography>
                  <Typography>{new Date(userData.user.created_at).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                  <Typography>{new Date(userData.user.updated_at).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Posts Count</Typography>
                  <Typography>{userData.user.posts_count || 0}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Followers / Following</Typography>
                  <Typography>{userData.user.followers_count || 0} / {userData.user.following_count || 0}</Typography>
                </Grid>
                {userData.user.is_premium && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Premium Until</Typography>
                    <Typography>{new Date(userData.user.premium_until).toLocaleDateString()}</Typography>
                  </Grid>
                )}
              </Grid>
            )}

            {/* Posts Tab */}
            {activeTab === 1 && (
              <Box>
                {userData.posts?.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Post ID</TableCell>
                          <TableCell>Content</TableCell>
                          <TableCell>Likes</TableCell>
                          <TableCell>Comments</TableCell>
                          <TableCell>Created</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {userData.posts.map((post) => (
                          <TableRow key={post.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                #{post.id}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ maxWidth: 300 }} noWrap>
                                {post.content || 'No content'}
                              </Typography>
                            </TableCell>
                            <TableCell>{post.likes_count || 0}</TableCell>
                            <TableCell>{post.comments_count || 0}</TableCell>
                            <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary" align="center" py={4}>
                    No posts found
                  </Typography>
                )}
              </Box>
            )}

            {/* Profile Data Tab */}
            {activeTab === 2 && (
              <Box>
                {userData.profile ? (
                  <Grid container spacing={2}>
                    {Object.entries(userData.profile).map(([key, value]) => (
                      key !== 'id' && key !== 'user_id' && (
                        <Grid item xs={6} key={key}>
                          <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                            {key.replace(/_/g, ' ')}
                          </Typography>
                          <Typography>{value?.toString() || 'Not set'}</Typography>
                        </Grid>
                      )
                    ))}
                  </Grid>
                ) : (
                  <Typography color="text.secondary" align="center" py={4}>
                    No profile data available
                  </Typography>
                )}
              </Box>
            )}

            {/* Activity Tab */}
            {activeTab === 3 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>Verification History</Typography>
                {userData.verificationHistory?.length > 0 ? (
                  <List dense>
                    {userData.verificationHistory.map((v, i) => (
                      <ListItem key={i}>
                        <ListItemText
                          primary={`${v.document_type} - ${v.status}`}
                          secondary={new Date(v.created_at).toLocaleDateString()}
                        />
                        <Chip 
                          label={v.status} 
                          size="small" 
                          color={v.status === 'approved' ? 'success' : v.status === 'rejected' ? 'error' : 'warning'}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary" variant="body2">No verification history</Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>Recent Transactions</Typography>
                {userData.transactions?.length > 0 ? (
                  <List dense>
                    {userData.transactions.map((t, i) => (
                      <ListItem key={i}>
                        <ListItemText
                          primary={`$${t.amount} - ${t.type}`}
                          secondary={new Date(t.created_at).toLocaleDateString()}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary" variant="body2">No transactions</Typography>
                )}
              </Box>
            )}
          </>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Confirm Delete Dialog
const DeleteConfirmDialog = ({ open, onClose, user, onConfirm, loading }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle sx={{ color: 'error.main' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DeleteIcon />
        Confirm Delete User
      </Box>
    </DialogTitle>
    <DialogContent>
      <Alert severity="warning" sx={{ mb: 2 }}>
        This action cannot be undone! All user data will be permanently deleted.
      </Alert>
      <Typography>
        Are you sure you want to delete user <strong>{user?.full_name || user?.email}</strong>?
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        User ID: {user?.id}
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={loading}>Cancel</Button>
      <Button 
        onClick={onConfirm} 
        color="error" 
        variant="contained"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={16} /> : <DeleteIcon />}
      >
        Delete User
      </Button>
    </DialogActions>
  </Dialog>
);

// Change Role Dialog
const ChangeRoleDialog = ({ open, onClose, user, onConfirm, loading }) => {
  const [selectedRole, setSelectedRole] = useState(user?.role || 'user');

  useEffect(() => {
    if (user) setSelectedRole(user.role || 'user');
  }, [user]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AdminIcon />
          Change User Role
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Changing role for: <strong>{user?.full_name || user?.email}</strong>
        </Typography>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={selectedRole}
            label="Role"
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="super_admin">Super Admin</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={() => onConfirm(selectedRole)} 
          variant="contained"
          disabled={loading || selectedRole === user?.role}
          startIcon={loading ? <CircularProgress size={16} /> : <EditIcon />}
        >
          Update Role
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Admin Panel Component
const AdminPanel = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [professionFilter, setProfessionFilter] = useState('all');
  
  // Dialogs
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Check admin status on mount
  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/admin');
        return;
      }

      const response = await checkAdminStatus();
      if (response.data.isAdmin) {
        setIsAdmin(true);
        fetchDashboardData();
      } else {
        setIsAdmin(false);
        setError('Access Denied: You do not have admin privileges');
        setTimeout(() => navigate('/admin'), 2000);
      }
    } catch (err) {
      setIsAdmin(false);
      setError('Access Denied: Unable to verify admin status');
      setTimeout(() => navigate('/admin'), 2000);
    } finally {
      setCheckingAdmin(false);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResponse, usersResponse] = await Promise.all([
        getAdminDashboardStats(),
        getAdminUsers({
          page: page + 1,
          limit: rowsPerPage,
          search: searchTerm,
          status: statusFilter,
          role: roleFilter,
          profession: professionFilter
        })
      ]);
      setStats(statsResponse.data.data);
      setUsers(usersResponse.data.data);
      setTotalUsers(usersResponse.data.pagination.total);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users when filters or pagination change
  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [page, rowsPerPage, searchTerm, statusFilter, roleFilter, professionFilter, isAdmin]);

  const fetchUsers = async () => {
    try {
      const response = await getAdminUsers({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        status: statusFilter,
        role: roleFilter,
        profession: professionFilter
      });
      setUsers(response.data.data);
      setTotalUsers(response.data.pagination.total);
    } catch (err) {
      console.error('Fetch users error:', err);
    }
  };

  const handleViewUser = (userId) => {
    setSelectedUserId(userId);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await deleteAdminUser(selectedUser.id);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleClick = (user) => {
    setSelectedUser(user);
    setRoleDialogOpen(true);
  };

  const handleRoleConfirm = async (newRole) => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await updateUserRole(selectedUser.id, newRole);
      setRoleDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await approveAdminUser(userId, { role: 'user' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve user');
    }
  };

  // Show access denied
  if (!checkingAdmin && !isAdmin) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <BlockIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography color="text.secondary" paragraph>
            You do not have permission to access the Admin Panel.
            Only administrators can view this page.
          </Typography>
          <Button
            variant="contained"
            startIcon={<BackIcon />}
            onClick={() => navigate('/post')}
          >
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  // Show loading
  if (checkingAdmin) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/post')}>
              <BackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AdminIcon sx={{ color: 'primary.main' }} />
                Admin Panel
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage users, view statistics, and control platform settings
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchDashboardData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              icon={<PeopleIcon />}
              color={theme.palette.primary.main}
              subtitle={`+${stats?.newUsersThisWeek || 0} this week`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Verified Users"
              value={stats?.verifiedUsers || 0}
              icon={<VerifiedIcon />}
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Posts"
              value={stats?.totalPosts || 0}
              icon={<PostIcon />}
              color={theme.palette.info.main}
              subtitle={`+${stats?.newPostsThisWeek || 0} this week`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Premium Users"
              value={stats?.premiumUsers || 0}
              icon={<PremiumIcon />}
              color={theme.palette.warning.main}
            />
          </Grid>
        </Grid>

        {/* Users Table */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon />
            User Management
          </Typography>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search users..."
              size="small"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ minWidth: 250 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="verified">Verified</MenuItem>
                <MenuItem value="unverified">Unverified</MenuItem>
                <MenuItem value="pending">Pending Verification</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                label="Role"
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="super_admin">Super Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Profession</InputLabel>
              <Select
                value={professionFilter}
                label="Profession"
                onChange={(e) => {
                  setProfessionFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="all">All Professions</MenuItem>
                <MenuItem value="Student">Student</MenuItem>
                <MenuItem value="Teacher">Teacher</MenuItem>
                <MenuItem value="Employee">Employee</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Profession</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Posts</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No users found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                              user.is_premium ? (
                                <PremiumIcon sx={{ color: 'warning.main', fontSize: 14 }} />
                              ) : null
                            }
                          >
                            <Avatar src={user.profile_picture} sx={{ width: 40, height: 40 }}>
                              {user.full_name?.charAt(0)}
                            </Avatar>
                          </Badge>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {user.full_name || 'No Name'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              @{user.username || 'no-username'} • ID: {user.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{user.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.profession || 'Not Set'}
                          size="small"
                          color={
                            user.profession === 'Student' ? 'info' : 
                            user.profession === 'Teacher' ? 'success' : 
                            user.profession === 'Employee' ? 'secondary' : 'default'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role?.toUpperCase() || 'USER'}
                          size="small"
                          icon={user.role === 'super_admin' ? <SuperAdminIcon /> : user.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
                          color={user.role === 'super_admin' ? 'error' : user.role === 'admin' ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.is_verified ? 'Verified' : 'Unverified'}
                          size="small"
                          color={user.is_verified ? 'success' : 'default'}
                          variant={user.is_verified ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell>{user.posts_count || 0}</TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewUser(user.id)}
                            color="primary"
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        {!user.is_verified && (
                          <Tooltip title="Approve User">
                            <IconButton 
                              size="small" 
                              onClick={() => handleApproveUser(user.id)}
                              color="success"
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Change Role">
                          <IconButton 
                            size="small" 
                            onClick={() => handleRoleClick(user)}
                            color="warning"
                          >
                            <AdminIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteClick(user)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalUsers}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>

        {/* Dialogs */}
        <UserDetailsDialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          userId={selectedUserId}
        />
        
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          user={selectedUser}
          onConfirm={handleDeleteConfirm}
          loading={actionLoading}
        />

        <ChangeRoleDialog
          open={roleDialogOpen}
          onClose={() => setRoleDialogOpen(false)}
          user={selectedUser}
          onConfirm={handleRoleConfirm}
          loading={actionLoading}
        />
      </Container>
    </Box>
  );
};

export default AdminPanel;
