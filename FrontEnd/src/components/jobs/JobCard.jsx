import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  Box,
  Avatar,
  Stack,
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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const JobCard = ({ job }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/jobs/${job.id}`);
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

  const getJobTypeColor = () => {
    switch (job.job_type) {
      case 'full-time':
        return 'success';
      case 'part-time':
        return 'info';
      case 'contract':
        return 'warning';
      case 'internship':
        return 'secondary';
      case 'remote':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
        border: job.is_featured ? '2px solid #1976d2' : '1px solid #e0e0e0',
        position: 'relative',
      }}
    >
      {job.is_featured && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bgcolor: '#1976d2',
            color: 'white',
            px: 1,
            py: 0.5,
            borderBottomLeftRadius: 8,
            fontSize: '0.75rem',
            fontWeight: 'bold',
          }}
        >
          FEATURED
        </Box>
      )}

      {job.is_urgent && (
        <Chip
          label="URGENT"
          color="error"
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            fontWeight: 'bold',
          }}
        />
      )}

      <CardContent sx={{ flexGrow: 1, pt: job.is_urgent ? 5 : 2 }}>
        {/* Company Logo and Name */}
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <Avatar
            src={job.company_logo}
            alt={job.company}
            sx={{ width: 56, height: 56 }}
          >
            <BusinessCenter />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
              {job.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {job.company}
            </Typography>
          </Box>
        </Stack>

        {/* Job Details */}
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {job.location}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoney fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {formatSalary()}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Experience: {formatExperience()}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarToday fontSize="small" color="action" />
            <Typography
              variant="body2"
              color={formatDeadline() === 'Today' || formatDeadline() === 'Tomorrow' ? 'error' : 'text.secondary'}
              sx={{ fontWeight: formatDeadline() === 'Today' || formatDeadline() === 'Tomorrow' ? 'bold' : 'normal' }}
            >
              Deadline: {formatDeadline()}
            </Typography>
          </Box>
        </Stack>

        {/* Job Type and Category */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={job.job_type.replace('-', ' ').toUpperCase()}
            size="small"
            color={getJobTypeColor()}
            variant="outlined"
          />
          <Chip
            label={job.category}
            size="small"
            variant="outlined"
          />
        </Box>

        {/* Skills */}
        {job.skills && job.skills.length > 0 && job.skills[0]?.skill_name && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Required Skills:
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {job.skills.slice(0, 4).map((skill, index) => (
                skill?.skill_name && (
                  <Chip
                    key={index}
                    label={skill.skill_name}
                    size="small"
                    sx={{ fontSize: '0.7rem' }}
                  />
                )
              ))}
              {job.skills.length > 4 && (
                <Chip
                  label={`+${job.skills.length - 4} more`}
                  size="small"
                  sx={{ fontSize: '0.7rem' }}
                />
              )}
            </Box>
          </Box>
        )}

        {/* Posted Time */}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          <AccessTime fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
          Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
        </Typography>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleViewDetails}
          sx={{
            bgcolor: '#1976d2',
            '&:hover': {
              bgcolor: '#1565c0',
            },
          }}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default JobCard;
