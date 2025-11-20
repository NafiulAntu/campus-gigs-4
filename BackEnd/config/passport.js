const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require('../models/User');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findByProvider('google', profile.id);
      
      if (user) {
        return done(null, user);
      }

      // Create new user
      user = await User.createOAuth({
        full_name: profile.displayName,
        email: profile.emails[0].value,
        provider: 'google',
        provider_id: profile.id,
        profile_picture: profile.photos[0]?.value
      });

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/api/auth/github/callback',
    scope: ['user:email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findByProvider('github', profile.id);
      
      if (user) {
        return done(null, user);
      }

      user = await User.createOAuth({
        full_name: profile.displayName || profile.username,
        email: profile.emails[0].value,
        provider: 'github',
        provider_id: profile.id,
        profile_picture: profile.photos[0]?.value
      });

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
));

// LinkedIn OAuth Strategy
passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: '/api/auth/linkedin/callback',
    scope: ['r_emailaddress', 'r_liteprofile']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findByProvider('linkedin', profile.id);
      
      if (user) {
        return done(null, user);
      }

      user = await User.createOAuth({
        full_name: profile.displayName,
        email: profile.emails[0].value,
        provider: 'linkedin',
        provider_id: profile.id,
        profile_picture: profile.photos[0]?.value
      });

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
));

module.exports = passport;
