const AuditLog = require('../Models/AuditLog');

/**
 * Logs an action to the audit trail.
 * @param {object} options - The options for logging.
 * @param {string} [options.actor] - The user ID of the person performing the action.
 * @param {string} options.action - The action being performed (e.g., 'USER_LOGIN', 'CREATE_ADMIN').
 * @param {string} [options.target] - The model being affected (e.g., 'User').
 * @param {string} [options.targetId] - The ID of the document being affected.
 * @param {object} [options.details] - Any additional details to store.
 * @param {object} [req] - The Express request object to get IP and User-Agent.
 */
const logAction = async (options, req) => {
  try {
    const { actor, action, target, targetId, details } = options;

    const logEntry = new AuditLog({
      actor,
      action,
      target,
      targetId,
      details,
      ip: req?.ip,
      userAgent: req?.get('User-Agent'),
    });

    await logEntry.save();
  } catch (error) {
    console.error('Failed to write to audit log:', error);
  }
};

module.exports = { logAction };
