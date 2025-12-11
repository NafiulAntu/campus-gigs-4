import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Autocomplete,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { searchPosts, getSearchSuggestions, getPopularCategories, getPopularTags } from '../services/api';

function JobSearchBar({ onSearchResults, onLoading, onError }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    jobType: '',
    tags: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategoriesAndTags();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      loadSuggestions();
    }
  }, [searchQuery]);

  const loadCategoriesAndTags = async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        getPopularCategories(),
        getPopularTags(),
      ]);
      setCategories(categoriesRes.data.categories || []);
      setTags(tagsRes.data.tags || []);
    } catch (err) {
      console.error('Error loading categories/tags:', err);
    }
  };

  const loadSuggestions = async () => {
    try {
      const response = await getSearchSuggestions(searchQuery);
      setSuggestions(response.data.suggestions || []);
    } catch (err) {
      console.error('Error loading suggestions:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() && !filters.category && !filters.jobType && !filters.location) {
      return;
    }

    try {
      setLoading(true);
      if (onLoading) onLoading(true);

      const params = {
        q: searchQuery,
        category: filters.category || undefined,
        location: filters.location || undefined,
        jobType: filters.jobType || undefined,
        tags: filters.tags.join(',') || undefined,
        jobsOnly: true, // Only search job posts
      };

      const response = await searchPosts(params);
      if (onSearchResults) {
        onSearchResults(response.data.results || []);
      }
    } catch (err) {
      console.error('Error searching:', err);
      if (onError) onError('Failed to search jobs. Please try again.');
    } finally {
      setLoading(false);
      if (onLoading) onLoading(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setFilters({
      category: '',
      location: '',
      jobType: '',
      tags: [],
    });
    if (onSearchResults) onSearchResults(null); // Reset to all posts
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Paper sx={{ p: 2 }}>
        {/* Main Search Bar */}
        <Box sx={{ display: 'flex', gap: 2, mb: showFilters ? 2 : 0 }}>
          <Autocomplete
            freeSolo
            fullWidth
            options={suggestions}
            inputValue={searchQuery}
            onInputChange={(event, newValue) => setSearchQuery(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search for jobs (Frontend, Backend, Design...)"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <>
                      {loading && <CircularProgress size={20} />}
                      {searchQuery && (
                        <IconButton size="small" onClick={handleClear}>
                          <ClearIcon />
                        </IconButton>
                      )}
                    </>
                  ),
                }}
                onKeyPress={handleKeyPress}
              />
            )}
          />
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          <Button variant="contained" onClick={handleSearch} disabled={loading}>
            Search
          </Button>
        </Box>

        {/* Advanced Filters */}
        {showFilters && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                label="Category"
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.category} value={cat.category}>
                    {cat.category} ({cat.count})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Job Type</InputLabel>
              <Select
                value={filters.jobType}
                label="Job Type"
                onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="full-time">Full Time</MenuItem>
                <MenuItem value="part-time">Part Time</MenuItem>
                <MenuItem value="contract">Contract</MenuItem>
                <MenuItem value="internship">Internship</MenuItem>
                <MenuItem value="freelance">Freelance</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Location"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              sx={{ minWidth: 200 }}
              placeholder="e.g. Dhaka, Remote"
            />

            <Autocomplete
              multiple
              sx={{ minWidth: 300 }}
              options={tags.map((t) => t.tag)}
              value={filters.tags}
              onChange={(event, newValue) => setFilters({ ...filters, tags: newValue })}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option} {...getTagProps({ index })} size="small" />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} label="Tags" placeholder="Select tags" />
              )}
            />
          </Box>
        )}

        {/* Active Filters Display */}
        {(filters.category || filters.jobType || filters.location || filters.tags.length > 0) && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {filters.category && (
              <Chip
                label={`Category: ${filters.category}`}
                onDelete={() => setFilters({ ...filters, category: '' })}
                size="small"
              />
            )}
            {filters.jobType && (
              <Chip
                label={`Type: ${filters.jobType}`}
                onDelete={() => setFilters({ ...filters, jobType: '' })}
                size="small"
              />
            )}
            {filters.location && (
              <Chip
                label={`Location: ${filters.location}`}
                onDelete={() => setFilters({ ...filters, location: '' })}
                size="small"
              />
            )}
            {filters.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() =>
                  setFilters({ ...filters, tags: filters.tags.filter((t) => t !== tag) })
                }
                size="small"
              />
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default JobSearchBar;
