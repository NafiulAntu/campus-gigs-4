const VerificationRequest = require('../models/VerificationRequest');
const User = require('../models/User');
const textractService = require('../services/textractService');
const { uploadToFirebase } = require('../config/firebase');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Verification Controller
 * Handles ID card verification requests
 */

/**
 * Submit verification request
 * POST /api/verification/submit
 */
exports.submitVerification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { user_type, institutional_email } = req.body;
    const files = req.files;

    console.log('📤 Verification request received:', { userId, user_type, institutional_email });

    // Validation
    if (!user_type || !['student', 'teacher', 'employee'].includes(user_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type. Must be: student, teacher, or employee'
      });
    }

    if (!files || !files.id_card_front) {
      return res.status(400).json({
        success: false,
        message: 'ID card front image is required'
      });
    }

    // Check if user already has pending verification
    const hasPending = await VerificationRequest.hasPendingVerification(userId);
    if (hasPending) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending verification request'
      });
    }

    // Process front image
    const frontImage = files.id_card_front[0];
    let frontImageUrl;
    let extractedData = {};

    try {
      // Optimize image with sharp
      const optimizedBuffer = await sharp(frontImage.buffer)
        .resize(1500, 1500, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Upload to Firebase or local storage
      frontImageUrl = await uploadToFirebase(
        optimizedBuffer,
        `verifications/${userId}/id_front_${Date.now()}.jpg`,
        'image/jpeg'
      );

      console.log('✅ ID card uploaded:', frontImageUrl);

      // Extract text using AWS Textract
      if (textractService.isEnabled) {
        console.log('🔍 Starting AWS Textract analysis...');
        extractedData = await textractService.extractTextFromIDCard(optimizedBuffer);
        
        // Validate quality
        const validation = textractService.validateIDCardQuality(extractedData);
        
        if (!validation.isValid) {
          return res.status(400).json({
            success: false,
            message: 'ID card image quality is too low',
            issues: validation.issues,
            suggestion: 'Please retake the photo in good lighting with the ID card clearly visible'
          });
        }

        console.log('✅ Text extraction complete. Confidence:', extractedData.confidence);
      } else {
        console.log('⚠️  AWS Textract not configured - skipping OCR');
      }

    } catch (error) {
      console.error('❌ Image processing error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to process ID card image',
        error: error.message
      });
    }

    // Process back image (optional)
    let backImageUrl = null;
    if (files.id_card_back && files.id_card_back[0]) {
      try {
        const backImage = files.id_card_back[0];
        const optimizedBackBuffer = await sharp(backImage.buffer)
          .resize(1500, 1500, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();

        backImageUrl = await uploadToFirebase(
          optimizedBackBuffer,
          `verifications/${userId}/id_back_${Date.now()}.jpg`,
          'image/jpeg'
        );

        console.log('✅ ID card back uploaded:', backImageUrl);
      } catch (error) {
        console.error('⚠️  Failed to process back image:', error);
        // Continue without back image
      }
    }

    // Extract email domain
    let emailDomain = null;
    if (institutional_email) {
      emailDomain = institutional_email.split('@')[1];
    }

    // Create verification request
    const verification = await VerificationRequest.create({
      user_id: userId,
      user_type,
      id_card_url: frontImageUrl,
      id_card_back_url: backImageUrl,
      extracted_data: extractedData,
      institutional_email: institutional_email || null,
      email_domain: emailDomain
    });

    console.log('✅ Verification request created:', verification.id);

    res.status(201).json({
      success: true,
      message: 'Verification request submitted successfully',
      data: {
        verification_id: verification.id,
        status: verification.status,
        extracted_data: extractedData,
        confidence: extractedData.confidence || 0
      }
    });

  } catch (error) {
    console.error('❌ Submit verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit verification request',
      error: error.message
    });
  }
};

/**
 * Get user's verification status
 * GET /api/verification/status
 */
exports.getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const verification = await VerificationRequest.getLatestByUserId(userId);

    if (!verification) {
      return res.json({
        success: true,
        data: {
          has_verification: false,
          is_verified: false,
          status: null
        }
      });
    }

    res.json({
      success: true,
      data: {
        has_verification: true,
        is_verified: verification.status === 'approved',
        status: verification.status,
        verification_id: verification.id,
        user_type: verification.user_type,
        submitted_at: verification.created_at,
        reviewed_at: verification.reviewed_at,
        rejection_reason: verification.rejection_reason
      }
    });

  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get verification status',
      error: error.message
    });
  }
};

/**
 * Get verification request details
 * GET /api/verification/:id
 */
exports.getVerificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const verification = await VerificationRequest.findById(id);

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification request not found'
      });
    }

    // Only allow user to view their own verification (unless admin)
    if (verification.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    res.json({
      success: true,
      data: verification
    });

  } catch (error) {
    console.error('Get verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get verification details',
      error: error.message
    });
  }
};

/**
 * Get all pending verifications (Admin only)
 * GET /api/verification/admin/pending
 */
exports.getPendingVerifications = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const verifications = await VerificationRequest.getPending(limit, offset);

    res.json({
      success: true,
      count: verifications.length,
      data: verifications
    });

  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending verifications',
      error: error.message
    });
  }
};

/**
 * Approve verification (Admin only)
 * POST /api/verification/admin/approve/:id
 */
exports.approveVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { admin_notes } = req.body;

    const verification = await VerificationRequest.findById(id);

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification request not found'
      });
    }

    if (verification.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Verification already approved'
      });
    }

    // Update verification status
    const updated = await VerificationRequest.updateStatus(
      id,
      'approved',
      adminId,
      null,
      admin_notes
    );

    console.log(`✅ Verification ${id} approved by admin ${adminId}`);

    // TODO: Send notification to user
    // await notificationService.sendVerificationApproved(verification.user_id);

    res.json({
      success: true,
      message: 'Verification approved successfully',
      data: updated
    });

  } catch (error) {
    console.error('Approve verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve verification',
      error: error.message
    });
  }
};

/**
 * Reject verification (Admin only)
 * POST /api/verification/admin/reject/:id
 */
exports.rejectVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { rejection_reason, admin_notes } = req.body;

    if (!rejection_reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const verification = await VerificationRequest.findById(id);

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification request not found'
      });
    }

    // Update verification status
    const updated = await VerificationRequest.updateStatus(
      id,
      'rejected',
      adminId,
      rejection_reason,
      admin_notes
    );

    console.log(`❌ Verification ${id} rejected by admin ${adminId}`);

    // TODO: Send notification to user
    // await notificationService.sendVerificationRejected(verification.user_id, rejection_reason);

    res.json({
      success: true,
      message: 'Verification rejected',
      data: updated
    });

  } catch (error) {
    console.error('Reject verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject verification',
      error: error.message
    });
  }
};

/**
 * Get verification statistics (Admin only)
 * GET /api/verification/admin/stats
 */
exports.getVerificationStats = async (req, res) => {
  try {
    const stats = await VerificationRequest.getStatistics();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get verification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get verification statistics',
      error: error.message
    });
  }
};

/**
 * Get all verifications by status (Admin only)
 * GET /api/verification/admin/by-status/:status
 */
exports.getVerificationsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const verifications = await VerificationRequest.getByStatus(status, limit, offset);

    res.json({
      success: true,
      count: verifications.length,
      data: verifications
    });

  } catch (error) {
    console.error('Get verifications by status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get verifications',
      error: error.message
    });
  }
};

module.exports = exports;
