const Event = require('../models/Event');
const Client = require('../models/Client');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Organization = require('../models/Organization');

class EventService {
    async getEvents(query, user) {
        const {
            page = 1,
            limit = 10,
            status,
            eventType,
            startDate,
            endDate,
            search,
            sortBy = 'startDate',
            sortOrder = 'asc'
        } = query;

        const filter = {};
        if (user.role !== 'Super Admin') {
            filter.organizationId = user.organizationId;
        }

        if (status) filter.status = status;
        if (eventType) filter.eventType = eventType;
        if (startDate || endDate) {
            filter.startDate = {};
            if (startDate) filter.startDate.$gte = new Date(startDate);
            if (endDate) filter.startDate.$lte = new Date(endDate);
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'location.venue': { $regex: search, $options: 'i' } }
            ];
        }

        if (user.role === 'Client') {
            filter.client = user.id;
        } else if (user.role === 'Organizer') {
            filter.organizer = user.id;
        }

        const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const limitNum = parseInt(limit, 10) || 10;
        const pageNum = parseInt(page, 10) || 1;

        const events = await Event.find(filter)
            .populate('organizer', 'firstName lastName email')
            .populate('client', 'companyName contactPerson')
            .populate('vendors.vendor', 'businessName services')
            .populate('staff.user', 'firstName lastName email')
            .sort(sortOptions)
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        const total = await Event.countDocuments(filter);

        return {
            events,
            totalPages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            total
        };
    }

    async getEventById(id, user) {
        const event = await Event.findById(id)
            .populate('organizer', 'firstName lastName email phone')
            .populate('client', 'companyName contactPerson address')
            .populate('vendors.vendor', 'businessName services contactPerson pricing')
            .populate('staff.user', 'firstName lastName email phone');

        if (!event) {
            const error = new Error('Event not found');
            error.status = 404;
            throw error;
        }

        if (user.role !== 'Super Admin' && event.organizationId.toString() !== user.organizationId.toString()) {
            const error = new Error('Access denied');
            error.status = 403;
            throw error;
        }

        if (user.role === 'Client' && event.client._id.toString() !== user.id) {
            const error = new Error('Access denied');
            error.status = 403;
            throw error;
        }

        return event;
    }

    async createEvent(data, user) {
        const client = await Client.findById(data.client);
        if (!client) {
            const error = new Error('Client not found');
            error.status = 400;
            throw error;
        }

        // Assign organizationId from the user, or from request body if Super Admin specifies one
        const eventData = { ...data, organizer: user.id };
        if (user.role === 'Super Admin') {
            // Super Admin can specify an organizationId, or fall back to their own
            eventData.organizationId = data.organizationId || user.organizationId;
        } else {
            eventData.organizationId = user.organizationId;
        }

        if (!eventData.organizationId) {
            // Last resort: find default organization
            const defaultOrg = await Organization.findOne({ status: 'active' }).sort({ createdAt: 1 });
            if (!defaultOrg) {
                const error = new Error('No active organization found');
                error.status = 400;
                throw error;
            }
            eventData.organizationId = defaultOrg._id;
        }

        const event = new Event(eventData);
        await event.save();

        await event.populate([
            { path: 'organizer', select: 'firstName lastName email' },
            { path: 'client', select: 'companyName contactPerson' }
        ]);

        return event;
    }

    async updateEvent(id, data, user) {
        const event = await Event.findById(id);
        if (!event) {
            const error = new Error('Event not found');
            error.status = 404;
            throw error;
        }

        if (user.role !== 'Super Admin' && event.organizationId.toString() !== user.organizationId.toString()) {
            const error = new Error('Access denied');
            error.status = 403;
            throw error;
        }

        if (user.role !== 'Super Admin' && user.role !== 'Admin' && event.organizer.toString() !== user.id) {
            const error = new Error('Access denied');
            error.status = 403;
            throw error;
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        )
            .populate('organizer', 'firstName lastName email')
            .populate('client', 'companyName contactPerson');

        return updatedEvent;
    }

    async deleteEvent(id, user) {
        const event = await Event.findById(id);
        if (!event) {
            const error = new Error('Event not found');
            error.status = 404;
            throw error;
        }

        if (user.role !== 'Super Admin' && event.organizationId.toString() !== user.organizationId.toString()) {
            const error = new Error('Access denied');
            error.status = 403;
            throw error;
        }

        await Event.findByIdAndDelete(id);
        return { message: 'Event deleted successfully' };
    }

    async addVendor(id, vendorData, user) {
        const event = await Event.findById(id);
        if (!event) {
            const error = new Error('Event not found');
            error.status = 404;
            throw error;
        }

        if (user.role !== 'Super Admin' && event.organizationId.toString() !== user.organizationId.toString()) {
            const error = new Error('Access denied');
            error.status = 403;
            throw error;
        }

        const vendor = await Vendor.findById(vendorData.vendor);
        if (!vendor) {
            const error = new Error('Vendor not found');
            error.status = 400;
            throw error;
        }

        const existingVendor = event.vendors.find(v => v.vendor.toString() === vendorData.vendor);
        if (existingVendor) {
            const error = new Error('Vendor already added to this event');
            error.status = 400;
            throw error;
        }

        event.vendors.push({
            vendor: vendorData.vendor,
            service: vendorData.service,
            cost: vendorData.cost
        });

        await event.save();
        await event.populate('vendors.vendor', 'businessName services');
        return event;
    }

    async addStaff(id, staffData, user) {
        const event = await Event.findById(id);
        if (!event) {
            const error = new Error('Event not found');
            error.status = 404;
            throw error;
        }

        if (user.role !== 'Super Admin' && event.organizationId.toString() !== user.organizationId.toString()) {
            const error = new Error('Access denied');
            error.status = 403;
            throw error;
        }

        const staffUser = await User.findById(staffData.user);
        if (!staffUser) {
            const error = new Error('User not found');
            error.status = 400;
            throw error;
        }

        const existingStaff = event.staff.find(s => s.user.toString() === staffData.user);
        if (existingStaff) {
            const error = new Error('User already assigned to this event');
            error.status = 400;
            throw error;
        }

        event.staff.push({
            user: staffData.user,
            role: staffData.role,
            responsibilities: staffData.responsibilities
        });

        await event.save();
        await event.populate('staff.user', 'firstName lastName email');
        return event;
    }
}

module.exports = new EventService();
