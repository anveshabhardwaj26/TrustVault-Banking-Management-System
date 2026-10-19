const auditRepo = require('../repositories/audit.repository');

/**
 * Audit Logging Middleware
 * Generates an immutable trail in the audit_logs table for compliance and security tracking.
 * @param {string} action - Short identifier for the action (e.g. 'UPDATE_CUSTOMER_STATUS', 'APPROVE_LOAN')
 * @param {string} entityType - Target resource type (e.g. 'USER', 'ACCOUNT', 'LOAN')
 */
function auditLog(action, entityType) {
  return (req, res, next) => {
    res.on('finish', () => {
      // Only record successfully processed actions
      if (res.statusCode >= 200 && res.statusCode < 400) {
        try {
          const actorUserId = (req.session && req.session.userId) ? req.session.userId : null;
          const entityId = req.params && req.params.id ? parseInt(req.params.id, 10) : null;

          const details = {
            ip: req.ip,
            url: req.originalUrl,
            params: req.params,
            timestamp: new Date().toISOString()
          };

          auditRepo.createAuditLog({
            actor_user_id: actorUserId,
            action,
            entity_type: entityType,
            entity_id: isNaN(entityId) ? null : entityId,
            details: JSON.stringify(details)
          });
        } catch (err) {
          // Never let audit logging failure bring down the request/response cycle
          console.error('[Audit] Failed to create audit log entry:', err.message);
        }
      }
    });

    next();
  };
}

module.exports = {
  auditLog
};
