const pool = require('../config/db');

/**
 * Simple notification helper - creates and sends notification via Socket.io
 */
async function createAndSend({ userId, actorId, type, title, message, data = {}, link = null, io }) {
  try {
    // Don't notify self
    if (userId === actorId) {
      console.log('⏩ Skipped notification: user is actor (userId === actorId)');
      return null;
    }

    console.log(`📝 Creating notification: userId=${userId}, actorId=${actorId}, type=${type}`);

    // Create notification in database
    const query = `
      INSERT INTO notifications (user_id, type, title, message, data, actor_id, link)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [userId, type, title, message, JSON.stringify(data), actorId, link];
    const result = await pool.query(query, values);
    const notification = result.rows[0];

    console.log(`✅ Notification created in DB: ID=${notification.id}`);

    // Send via Socket.io if available
    if (io) {
      const roomName = `user_${userId}`;
      console.log(`📡 Emitting to Socket.io room: ${roomName}`);
      io.to(roomName).emit('notification:new', notification);
      console.log(`✅ Notification emitted to room ${roomName}`);
    } else {
      console.warn('⚠️ Socket.io instance not available, notification not sent real-time');
    }

    return notification;
  } catch (error) {
    console.error('❌ Error in createAndSend:', error.message);
    throw error;
  }
}

/**
 * Notify when someone likes a post
 */
async function notifySup(userId, actorId, actorName, postId, io) {
  const displayName = actorName || 'Someone';
  return createAndSend({
    userId,
    actorId,
    type: 'sup',
    title: '👍 New Sup',
    message: `${displayName} supped your post`,
    data: { postId },
    link: `/post/${postId}`,
    io
  });
}

/**
 * Notify when someone shares/reposts
 */
async function notifyRepost(userId, actorId, actorName, postId, io) {
  const displayName = actorName || 'Someone';
  return createAndSend({
    userId,
    actorId,
    type: 'repost',
    title: '🔄 Post Shared',
    message: `${displayName} shared your post`,
    data: { postId },
    link: `/post/${postId}`,
    io
  });
}

/**
 * Notify when someone sends content
 */
async function notifySend(userId, actorId, actorName, contentType, io) {
  return createAndSend({
    userId,
    actorId,
    type: 'send',
    title: 'Content Sent',
    message: `${actorName} sent you ${contentType}`,
    data: { contentType },
    io
  });
}

/**
 * Notify when someone comments on a post
 */
async function notifyComment(userId, actorId, actorName, postId, commentPreview, io) {
  const displayName = actorName || 'Someone';
  const preview = commentPreview?.substring(0, 50) || 'your post';
  return createAndSend({
    userId,
    actorId,
    type: 'comment',
    title: '💬 New Comment',
    message: `${displayName} commented on your post`,
    data: { postId, commentPreview: preview },
    link: `/post/${postId}`,
    io
  });
}

/**
 * Notify when receiving a new message
 */
async function notifyMessage(userId, actorId, actorName, conversationId, messagePreview, io) {
  return createAndSend({
    userId,
    actorId,
    type: 'message',
    title: 'New Message',
    message: `${actorName}: ${messagePreview}`,
    data: { conversationId },
    link: `/messages/${conversationId}`,
    io
  });
}

/**
 * Notify when job application is accepted
 */
async function notifyJobAccept(userId, actorId, actorName, jobId, jobTitle, io) {
  return createAndSend({
    userId,
    actorId,
    type: 'accept',
    title: 'Application Accepted!',
    message: `${actorName} accepted your application for ${jobTitle}`,
    data: { jobId, jobTitle },
    link: `/jobs/${jobId}`,
    io
  });
}

/**
 * Notify when job application is rejected
 */
async function notifyJobReject(userId, actorId, actorName, jobId, jobTitle, io) {
  return createAndSend({
    userId,
    actorId,
    type: 'reject',
    title: 'Application Update',
    message: `Your application for ${jobTitle} was not accepted`,
    data: { jobId, jobTitle },
    link: `/jobs/${jobId}`,
    io
  });
}

/**
 * Notify about new job posting
 */
async function notifyJobAlert(userId, actorId, jobId, jobTitle, io) {
  return createAndSend({
    userId,
    actorId,
    type: 'job_alert',
    title: 'New Job Posted',
    message: `New job opportunity: ${jobTitle}`,
    data: { jobId, jobTitle },
    link: `/jobs/${jobId}`,
    io
  });
}

/**
 * Notify when someone follows you
 */
async function notifyFollow(userId, actorId, actorName, io) {
  return createAndSend({
    userId,
    actorId,
    type: 'follow',
    title: 'New Follower',
    message: `${actorName} started following you`,
    data: { followerId: actorId },
    link: `/profile/${actorId}`,
    io
  });
}

module.exports = {
  notifySup,
  notifyRepost,
  notifySend,
  notifyMessage,
  notifyComment,
  notifyJobAccept,
  notifyJobReject,
  notifyJobAlert,
  notifyFollow
};
