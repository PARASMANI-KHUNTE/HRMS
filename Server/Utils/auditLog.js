const AuditLog = require('../Models/AuditLog');
const logger = require('./logger');

/**
 * Records an audit log entry in the database and writes to app logs.
 * @param {Object} params
 * @param {ObjectId|null} params.actor - User ID (or null for unauthenticated)
 * @param {string} params.action - Action performed (e.g. 'CREATE_USER')
 * @param {string} params.target - Target entity (e.g. 'User')
 * @param {ObjectId|string} [params.targetId] - Target entity ID
 * @param {Object} [params.details] - Additional details (payload, before/after, etc.)
 * @param {string} [params.ip] - IP address
 * @param {string} [params.userAgent] - User agent string
 */
async function recordAuditLog({ actor, action, target, targetId, details, ip, userAgent }) {
  try {
    await AuditLog.create({
      actor,
      action,
      target,
      targetId,
      details,
      ip,
      userAgent
    });
    logger.info(`[AUDIT] ${action} on ${target}${targetId ? ' (' + targetId + ')' : ''} by ${actor || 'anonymous'}${ip ? ' from ' + ip : ''}`);
  } catch (err) {
    logger.error('Failed to record audit log:', err);
  }
}

module.exports = { recordAuditLog };
