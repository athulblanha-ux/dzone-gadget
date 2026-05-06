/**
 * Role-based access control middleware
 */

/**
 * Authorize specific roles
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}.`,
      });
    }
    next();
  };
};

/**
 * Admin only shorthand
 */
const adminOnly = authorize('admin', 'superadmin');

/**
 * Superadmin only shorthand
 */
const superAdminOnly = authorize('superadmin');

module.exports = { authorize, adminOnly, superAdminOnly };
