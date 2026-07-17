const permissions = require("../config/permissions");

const authorize = (...requiredPermissions) => {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required."
            });
        }

        const rolePermissions = permissions[req.user.role];

        if (!rolePermissions) {
            return res.status(403).json({
                message: "Unknown role."
            });
        }

        const hasPermission = requiredPermissions.every(permission =>
            rolePermissions.includes(permission)
        );

        if (!hasPermission) {
            return res.status(403).json({
                message: "Access denied."
            });
        }

        next();
    };
};

module.exports = authorize;