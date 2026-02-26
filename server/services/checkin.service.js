const Checkin = require('../models/Checkin');
const Booking = require('../models/Booking');

class CheckinService {
    async processCheckin(data, user) {
        if (user.role !== 'Admin' && user.role !== 'Super Admin' && user.role !== 'Organizer') {
            throw { status: 403, message: 'Not authorized to process check-ins' };
        }

        const booking = await Booking.findById(data.bookingId);
        if (!booking || booking.eventId.toString() !== data.eventId) {
            throw { status: 400, message: 'Invalid booking for this event' };
        }

        if (user.role !== 'Super Admin' && booking.organizationId.toString() !== user.organizationId.toString()) {
            throw { status: 403, message: 'Booking belongs to a different organization' };
        }

        try {
            const checkin = new Checkin({
                organizationId: booking.organizationId,
                eventId: booking.eventId,
                bookingId: booking._id
            });
            await checkin.save();
            return { message: 'Check-in successful', checkin };
        } catch (error) {
            if (error.code === 11000) {
                throw { status: 400, message: 'Duplicate check-in: Attendee already registered' };
            }
            throw error;
        }
    }
}

module.exports = new CheckinService();
