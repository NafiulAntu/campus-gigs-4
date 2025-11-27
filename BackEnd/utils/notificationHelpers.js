/**
 * Notification Helper Utility
 * Functions to trigger notifications from various parts of the application
 */

const { createAndSendNotification } = require('../controllers/notificationController');

/**
 * Send notification when someone sups a post
 */
async function notifySup(postAuthorId, actorId, actorName, postId, io) {
  return await createAndSendNotification({
    userId: postAuthorId,
    type: 'sup',
    title: 'New Sup!',
    message: `${actorName} said sup to your post`,
    data: { postId, actorId },
    actorId,
    link: `/post/${postId}`,
    io
  });
}

/**
 * Send notification when someone reposts
 */
async function notifyRepost(postAuthorId, actorId, actorName, postId, io) {
  return await createAndSendNotification({
    userId: postAuthorId,
    type: 'repost',
    title: 'New Repost',
    message: `${actorName} reposted your post`,
    data: { postId, actorId },
    actorId,
    link: `/post/${postId}`,
    io
  });
}

/**
 * Send notification when someone sends a post
 */
async function notifySend(postAuthorId, actorId, actorName, postId, io) {
  return await createAndSendNotification({
    userId: postAuthorId,
    type: 'send',
    title: 'Post Sent',
    message: `${actorName} sent your post`,
    data: { postId, actorId },
    actorId,
    link: `/post/${postId}`,
    io
  });
}

/**
 * Send notification for new message
 */
async function notifyMessage(receiverId, senderId, senderName, conversationId, io) {
  return await createAndSendNotification({
    userId: receiverId,
    type: 'message',
    title: 'New Message',
    message: `${senderName} sent you a message`,
    data: { senderId, conversationId },
    actorId: senderId,
    link: `/messages?conversation=${conversationId}`,
    io
  });
}

/**
 * Send notification when job application is accepted
 */
async function notifyJobAccept(applicantId, jobId, jobTitle, companyName, io) {
  return await createAndSendNotification({
    userId: applicantId,
    type: 'accept',
    title: 'Application Accepted! 🎉',
    message: `Your application for ${jobTitle} at ${companyName} has been accepted`,
    data: { jobId },
    link: `/jobs/${jobId}`,
    io
  });
}

/**
 * Send notification when job application is rejected
 */
async function notifyJobReject(applicantId, jobId, jobTitle, companyName, io) {
  return await createAndSendNotification({
    userId: applicantId,
    type: 'reject',
    title: 'Application Update',
    message: `Your application for ${jobTitle} at ${companyName} was not selected this time`,
    data: { jobId },
    link: `/jobs/${jobId}`,
    io
  });
}

/**
 * Send notification for new job alert matching user preferences
 */
async function notifyJobAlert(userId, jobId, jobTitle, company, io) {
  return await createAndSendNotification({
    userId,
    type: 'job_alert',
    title: 'New Job Match! 💼',
    message: `${jobTitle} at ${company} matches your preferences`,
    data: { jobId },
    link: `/jobs/${jobId}`,
    io
  });
}

/**
 * Send notification when someone follows you
 */
async function notifyFollow(followedUserId, followerId, followerName, io) {
  return await createAndSendNotification({
    userId: followedUserId,
    type: 'follow',
    title: 'New Follower',
    message: `${followerName} started following you`,
    data: { followerId },
    actorId: followerId,
    link: `/profile/${followerId}`,
    io
  });
}

module.exports = {
  notifySup,
  notifyRepost,
  notifySend,
  notifyMessage,
  notifyJobAccept,
  notifyJobReject,
  notifyJobAlert,
  notifyFollow
};
