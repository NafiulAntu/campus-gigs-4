import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Chip,
  Stack,
  Avatar,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  LocationOn,
  Work,
  BusinessCenter,
  AccessTime,
  AttachMoney,
  School,
  TrendingUp,
  CalendarToday,
  ArrowBack,
  Share,
  Bookmark,
  CheckCircle,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById, applyForJob } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await getJobById(id);
      setJob(response.data.job);
    } catch (error) {
      console.error('Error fetching job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      setApplyLoading(true);
      setApplyError('');
      await applyForJob(id, { cover_letter: coverLetter });
      setApplySuccess(true);
      setTimeout(() => {
        setApplyDialogOpen(false);
        setApplySuccess(false);
      }, 2000);
    } catch (error) {
      setApplyError(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplyLoading(false);
    }
  };

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) {
      return 'Negotiable';
    }
    if (job.salary_type === 'negotiable') {
      return 'Negotiable';
    }
    if (job.salary_min && job.salary_max) {
      return `৳${job.salary_min.toLocaleString()} - ৳${job.salary_max.toLocaleString()}/${job.salary_type || 'month'}`;
    }
    if (job.salary_min) {
      return `৳${job.salary_min.toLocaleString()}+/${job.salary_type || 'month'}`;
    }
    return 'Negotiable';
  };

  const formatExperience = () => {
    if (job.experience_min === 0 && job.experience_max === 0) {
      return 'Fresh Graduate';
    }
    if (job.experience_min && job.experience_max) {
      return `${job.experience_min}-${job.experience_max} years`;
    }
    if (job.experience_min) {
      return `${job.experience_min}+ years`;
    }
    return 'Any';
  };

  const formatDeadline = () => {
    const deadline = new Date(job.deadline);
    const today = new Date();
    const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return 'Expired';
    } else if (daysLeft === 0) {
      return 'Today';
    } else if (daysLeft === 1) {
      return 'Tomorrow';
    } else if (daysLeft <= 7) {
      return `${daysLeft} days left`;
    } else {
      return deadline.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!job) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Job not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3 }}
        >
          Back to Jobs
        </Button>

        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4 }}>
              {/* Company Header */}
              <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                <Avatar
                  src={job.company_logo}
                  alt={job.company}
                  sx={{ width: 80, height: 80 }}
                >
                  <BusinessCenter sx={{ fontSize: 40 }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {job.title}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {job.company}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={1}>
                    <Chip label={job.job_type.replace('-', ' ').toUpperCase()} size="small" color="primary" />
                    <Chip label={job.category} size="small" variant="outlined" />
                    {job.is_featured && <Chip label="FEATURED" size="small" color="info" />}
                    {job.is_urgent && <Chip label="URGENT" size="small" color="error" />}
                  </Stack>
                </Box>
              </Stack>

              <Divider sx={{ my: 3 }} />

              {/* Job Overview */}
              <Grid container spacing={2} mb={4}>
                <Grid item xs={6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocationOn color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="body2">{job.location}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AttachMoney color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Salary
                      </Typography>
                      <Typography variant="body2">{formatSalary()}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TrendingUp color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Experience
                      </Typography>
                      <Typography variant="body2">{formatExperience()}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <School color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Education
                      </Typography>
                      <Typography variant="body2">{job.education_level || 'Not specified'}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarToday color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Deadline
                      </Typography>
                      <Typography variant="body2" color={formatDeadline().includes('days left') ? 'error' : 'inherit'}>
                        {formatDeadline()}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccessTime color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Posted
                      </Typography>
                      <Typography variant="body2">
                        {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Job Description */}
              <Box mb={4}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Job Description
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                  {job.description}
                </Typography>
              </Box>

              {/* Requirements */}
              {job.requirements && (
                <Box mb={4}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Requirements
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                    {job.requirements}
                  </Typography>
                </Box>
              )}

              {/* Responsibilities */}
              {job.responsibilities && (
                <Box mb={4}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Responsibilities
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                    {job.responsibilities}
                  </Typography>
                </Box>
              )}

              {/* Benefits */}
              {job.benefits && (
                <Box mb={4}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Benefits
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                    {job.benefits}
                  </Typography>
                </Box>
              )}

              {/* Skills */}
              {job.skills && job.skills.length > 0 && job.skills[0]?.skill_name && (
                <Box mb={4}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Required Skills
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {job.skills.map((skill, index) => (
                      skill?.skill_name && (
                        <Chip key={index} label={skill.skill_name} />
                      )
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{ mb: 2 }}
                onClick={() => setApplyDialogOpen(true)}
              >
                Apply Now
              </Button>

              <Stack spacing={2}>
                <Button variant="outlined" fullWidth startIcon={<Share />}>
                  Share Job
                </Button>
                <Button variant="outlined" fullWidth startIcon={<Bookmark />}>
                  Save Job
                </Button>
              </Stack>

              <Divider sx={{ my: 3 }} />

              {/* Company Info */}
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                About Company
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {job.company}
              </Typography>
              {job.industry && (
                <Typography variant="body2" color="text.secondary">
                  Industry: {job.industry}
                </Typography>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Job Stats */}
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Job Statistics
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Views
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {job.views || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Applications
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {job.applications || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Vacancies
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {job.vacancy_count || 1}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Apply Dialog */}
      <Dialog open={applyDialogOpen} onClose={() => setApplyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply for {job.title}</DialogTitle>
        <DialogContent>
          {applySuccess ? (
            <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }}>
              Your application has been submitted successfully!
            </Alert>
          ) : (
            <>
              {applyError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {applyError}
                </Alert>
              )}
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Cover Letter"
                placeholder="Tell us why you're a good fit for this position..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                sx={{ mt: 2 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Note: Your profile information will be automatically included with your application.
              </Typography>
            </>
          )}
        </DialogContent>
        {!applySuccess && (
          <DialogActions>
            <Button onClick={() => setApplyDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleApply}
              disabled={applyLoading || !coverLetter.trim()}
            >
              {applyLoading ? <CircularProgress size={24} /> : 'Submit Application'}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
};

export default JobDetails;
