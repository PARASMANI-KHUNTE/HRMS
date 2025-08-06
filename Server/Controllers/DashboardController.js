const User = require('../Models/User');
const Hospital = require('../Models/Hospital');
const Invoice = require('../Models/Invoice');
const { startOfMonth, endOfMonth, subMonths, format } = require('date-fns');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private (Superadmin)
const getDashboardStats = async (req, res) => {
  try {
    const staffRoles = ['doctor', 'receptionist', 'pharmacist', 'labtechnician', 'accountant', 'nurse'];

    const hospitalCount = await Hospital.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const staffCount = await User.countDocuments({ role: { $in: staffRoles } });
    const patientCount = await User.countDocuments({ role: 'patient' });

    res.status(200).json({
      hospitals: hospitalCount,
      admins: adminCount,
      staff: staffCount,
      patients: patientCount,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard statistics.' });
  }
};

const getReportData = async (req, res) => {
  try {
    // 1. Monthly patient registrations for the last 12 months
    const monthlyRegistrations = [];
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const startDate = startOfMonth(date);
      const endDate = endOfMonth(date);
      const count = await User.countDocuments({
        role: 'patient',
        createdAt: { $gte: startDate, $lte: endDate },
      });
      monthlyRegistrations.push({ name: format(startDate, 'MMM yy'), patients: count });
    }

    // 2. Monthly revenue for the last 12 months
    const monthlyRevenue = [];
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const startDate = startOfMonth(date);
      const endDate = endOfMonth(date);
      const result = await Invoice.aggregate([
        { $match: { status: 'paid', createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]);
      monthlyRevenue.push({ name: format(startDate, 'MMM yy'), revenue: result[0]?.total || 0 });
    }

    // 3. Staff distribution by role
    const staffRoles = ['doctor', 'receptionist', 'pharmacist', 'labtechnician', 'accountant', 'nurse'];
    const staffDistribution = await User.aggregate([
      { $match: { role: { $in: staffRoles } } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } },
    ]);

    // 4. Hospital performance metrics
    const hospitalPerformance = await Hospital.aggregate([
        { 
            $lookup: { from: 'users', localField: '_id', foreignField: 'hospitalId', as: 'staff' } 
        },
        { 
            $lookup: { from: 'invoices', localField: '_id', foreignField: 'hospitalId', as: 'invoices' } 
        },
        {
            $project: {
                name: 1,
                patientCount: { $size: { $filter: { input: '$staff', as: 's', cond: { $eq: ['$$s.role', 'patient'] } } } },
                staffCount: { $size: { $filter: { input: '$staff', as: 's', cond: { $in: ['$$s.role', staffRoles] } } } },
                totalRevenue: { $sum: { $map: { 
                    input: { $filter: { input: '$invoices', as: 'i', cond: { $eq: ['$$i.status', 'paid'] } } },
                    as: 'inv',
                    in: '$$inv.totalAmount'
                }}}
            }
        }
    ]);

    res.status(200).json({
      monthlyRegistrations,
      monthlyRevenue,
      staffDistribution,
      hospitalPerformance
    });

  } catch (error) {
    console.error('Error fetching report data:', error);
    res.status(500).json({ message: 'Server error while fetching report data.' });
  }
};

module.exports = { getDashboardStats, getReportData };
