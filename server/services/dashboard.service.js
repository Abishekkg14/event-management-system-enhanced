const Event = require('../models/Event');
const Client = require('../models/Client');
const Vendor = require('../models/Vendor');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Checkin = require('../models/Checkin');
const Contract = require('../models/Contract');

class DashboardService {
    async getStats(user) {
        const filter = {};
        if (user.role !== 'Super Admin') {
            filter.organizationId = user.organizationId;
        }

        // 1. Total Revenue
        const revenueAggr = await Payment.aggregate([
            { $match: { ...filter, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueAggr[0]?.total || 0;

        // 2. Ticket Conversion Rate = Total Bookings / Total Capacity of Published Events
        const capacityAggr = await Event.aggregate([
            { $match: { ...filter, status: 'published' } },
            { $group: { _id: null, totalCapacity: { $sum: '$capacity' } } }
        ]);
        const totalCapacity = capacityAggr[0]?.totalCapacity || 1; // avoid div by 0
        const totalBookings = await Booking.countDocuments({ ...filter, status: 'confirmed' });
        const ticketConversionRate = ((totalBookings / totalCapacity) * 100).toFixed(2);

        // 3. Monthly Growth (Revenue per month)
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const monthlyGrowth = await Payment.aggregate([
            { $match: { ...filter, status: 'completed', paymentDate: { $gte: startOfYear } } },
            {
                $group: {
                    _id: { month: { $month: '$paymentDate' } },
                    revenue: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.month': 1 } }
        ]);

        // 4. Vendor Performance
        const vendorPerformance = await Contract.aggregate([
            { $match: { ...filter, status: 'accepted' } },
            {
                $group: {
                    _id: '$vendorId',
                    totalContracts: { $sum: 1 },
                    totalValue: { $sum: '$amount' }
                }
            },
            { $sort: { totalValue: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'vendors',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'vendorInfo'
                }
            },
            { $unwind: '$vendorInfo' },
            {
                $project: {
                    vendorName: '$vendorInfo.businessName',
                    totalContracts: 1,
                    totalValue: 1
                }
            }
        ]);

        // 5. Attendance Rate (Checkins / Bookings)
        const totalCheckins = await Checkin.countDocuments(filter);
        const attendanceRate = totalBookings > 0 ? ((totalCheckins / totalBookings) * 100).toFixed(2) : 0;

        // Additional generic stats
        const totalEvents = await Event.countDocuments(filter);
        const totalClients = await Client.countDocuments(filter);

        // Add new frontend required queries:
        const now = new Date();
        const activeEvents = await Event.countDocuments({ ...filter, status: 'published' });
        const completedEvents = await Event.countDocuments({ ...filter, status: 'completed' });
        const cancelledEvents = await Event.countDocuments({ ...filter, status: 'cancelled' });
        const draftEvents = await Event.countDocuments({ ...filter, status: 'draft' });
        const upcomingEventsCount = await Event.countDocuments({ ...filter, startDate: { $gte: now }, status: { $nin: ['cancelled', 'completed'] } });

        const activeClients = await Client.countDocuments({ ...filter, status: 'active' });

        const totalVendors = await Vendor.countDocuments(filter);
        const activeVendors = await Vendor.countDocuments({ ...filter, status: 'active' });

        const currentMonthStart = new Date(currentYear, now.getMonth(), 1);
        const monthlyRevenueAggr = await Payment.aggregate([
            { $match: { ...filter, status: 'completed', paymentDate: { $gte: currentMonthStart } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const monthlyRevenue = monthlyRevenueAggr[0]?.total || 0;

        const recentEvents = await Event.find(filter)
            .populate('client', 'companyName')
            .sort({ createdAt: -1 })
            .limit(5);

        const upcomingEventsList = await Event.find({ ...filter, startDate: { $gte: now }, status: { $nin: ['cancelled', 'completed'] } })
            .populate('client', 'companyName')
            .sort({ startDate: 1 })
            .limit(5);

        const monthlyTrends = await Event.aggregate([
            { $match: { ...filter, createdAt: { $gte: startOfYear } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        return {
            events: { total: totalEvents, active: activeEvents, completed: completedEvents, cancelled: cancelledEvents, draft: draftEvents, upcoming: upcomingEventsCount },
            clients: { total: totalClients, active: activeClients },
            vendors: { total: totalVendors, active: activeVendors },
            revenue: {
                total: totalRevenue,
                monthly: monthlyRevenue
            },
            recentEvents,
            upcomingEvents: upcomingEventsList,
            monthlyTrends,
            // Extra stats for other views
            conversion: { rate: parseFloat(ticketConversionRate), totalBookings, totalCapacity },
            monthlyGrowth,
            vendorPerformance,
            attendance: { rate: parseFloat(attendanceRate), checkins: totalCheckins, bookings: totalBookings },
            overview: { totalEvents, totalClients }
        };
    }
}

module.exports = new DashboardService();
