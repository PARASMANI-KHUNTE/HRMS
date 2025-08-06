const AuditLog = require('../Models/AuditLog');

/**
 * Fetches all audit logs, sorted by the most recent.
 * Populates the 'actor' field with the user's first and last name.
 */
const getAuditLogs = async (req, res) => {
    try {
        const { action, page = 1, limit = 15 } = req.query;

        const filter = {};
        if (action) {
            // Case-insensitive regex search for the action
            filter.action = { $regex: action, $options: 'i' };
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const totalLogs = await AuditLog.countDocuments(filter);
        const logs = await AuditLog.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('actor', 'firstName lastName');

        res.status(200).json({
            logs,
            currentPage: pageNum,
            totalPages: Math.ceil(totalLogs / limitNum),
            totalLogs,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching audit logs.', error: err.message });
    }
};

module.exports = { getAuditLogs };
