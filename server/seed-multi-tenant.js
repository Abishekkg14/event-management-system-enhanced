require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');
const Organization = require('./models/Organization');
const Client = require('./models/Client');
const Vendor = require('./models/Vendor');
const Contract = require('./models/Contract');
const Checkin = require('./models/Checkin');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management';

async function seedDatabase() {
    try {
        await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to DB...');

        // Clear existing
        await User.deleteMany({});
        await Event.deleteMany({});
        await Booking.deleteMany({});
        await Payment.deleteMany({});
        await Organization.deleteMany({});
        await Client.deleteMany({});
        await Vendor.deleteMany({});
        await Contract.deleteMany({});
        await Checkin.deleteMany({});

        // 1. Create Organization
        const rootOrg = await new Organization({ name: 'Root Organization', domain: 'root.com' }).save();

        // 2. Create Users (1 Admin, 1 Organizer, 1 Vendor, 1 Client, 146 Attendees = 150 total)
        const users = [];

        // Super Admin
        const superAdmin = new User({
            firstName: 'Super',
            lastName: 'Admin',
            email: 'superadmin@root.com',
            password: 'password123',
            role: 'Super Admin',
            organizationId: rootOrg._id
        });
        await superAdmin.save();
        users.push(superAdmin);

        // Admin
        const admin = new User({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@root.com',
            password: 'password123',
            role: 'Admin',
            organizationId: rootOrg._id
        });
        await admin.save();
        users.push(admin);

        // Organizer
        const organizer = new User({
            firstName: 'Org',
            lastName: 'User',
            email: 'organizer@root.com',
            password: 'password123',
            role: 'Organizer',
            organizationId: rootOrg._id
        });
        await organizer.save();
        users.push(organizer);

        // Vendor User
        const vendorUser = new User({
            firstName: 'Ven',
            lastName: 'User',
            email: 'vendor@root.com',
            password: 'password123',
            role: 'Vendor',
            organizationId: rootOrg._id
        });
        await vendorUser.save();
        users.push(vendorUser);

        // Client User
        const clientUser = new User({
            firstName: 'Cli',
            lastName: 'User',
            email: 'client@root.com',
            password: 'password123',
            role: 'Client',
            organizationId: rootOrg._id
        });
        await clientUser.save();
        users.push(clientUser);

        // 145 Attendees
        const attendees = [];
        for (let i = 0; i < 145; i++) {
            attendees.push({
                firstName: 'Attendee',
                lastName: `${i}`,
                email: `attendee${i}@root.com`,
                password: 'password123',
                role: 'Attendee',
                organizationId: rootOrg._id
            });
        }
        const insertedAttendees = await User.insertMany(attendees);

        // 3. Create Client Profiles & Vendor Profiles
        const clients = [];
        const vendors = [];

        clients.push(await new Client({
            organizationId: rootOrg._id,
            companyName: 'Acme Corp',
            contactPerson: { firstName: 'John', lastName: 'Doe', email: 'john@acme.com' },
            status: 'active',
            assignedTo: clientUser._id
        }).save());

        clients.push(await new Client({
            organizationId: rootOrg._id,
            companyName: 'Global Tech',
            contactPerson: { firstName: 'Jane', lastName: 'Smith', email: 'jane@globaltech.com' },
            status: 'active',
            assignedTo: clientUser._id
        }).save());

        vendors.push(await new Vendor({
            organizationId: rootOrg._id,
            businessName: 'Vendor Goods',
            contactPerson: { firstName: 'Ven', lastName: 'User', email: 'vendor@root.com' },
            services: ['catering'],
            status: 'active'
        }).save());

        vendors.push(await new Vendor({
            organizationId: rootOrg._id,
            businessName: 'Elite A/V',
            contactPerson: { firstName: 'Mike', lastName: 'Audio', email: 'mike@eliteav.com' },
            services: ['audio-visual'],
            status: 'active' // Ensure active vendors show up
        }).save());

        // 4. Create 10 Events (Mix of Past and Future)
        const events = [];
        const eventDataList = [];

        for (let i = 0; i < 10; i++) {
            const isCompleted = i < 4; // 4 completed events
            const dateOffset = isCompleted ? -15 + i : 5 + i; // Days offset

            const startDate = new Date();
            startDate.setDate(startDate.getDate() + dateOffset);

            const endDate = new Date(startDate);
            endDate.setHours(endDate.getHours() + 8);

            eventDataList.push({
                organizationId: rootOrg._id,
                title: `${isCompleted ? 'Past' : 'Upcoming'} Event ${i + 1}`,
                description: `Description for event ${i + 1}`,
                eventType: 'conference',
                startDate: startDate,
                endDate: endDate,
                location: { venue: `Venue ${i + 1}`, address: { street: `123 Event St`, city: 'Metro' } },
                capacity: 50,
                currentRegistrations: 40, // We will insert 40 bookings
                status: isCompleted ? 'completed' : 'published',
                organizer: organizer._id,
                client: clients[i % 2]._id,
                budget: { allocated: 15000, spent: isCompleted ? 14000 : 2000 }
            });
        }
        const insertedEvents = await Event.insertMany(eventDataList);

        // 5. Create 400 Bookings, Checkins & Payments
        const bookings = [];
        const payments = [];
        const checkins = [];

        // Distribute 400 bookings across the 10 events (40 each) and across 145 attendees
        for (let i = 0; i < 10; i++) {
            const dbEvent = insertedEvents[i];

            // Loop for generating bookings/checkins
            for (let j = 0; j < 40; j++) {
                const attendee = insertedAttendees[Math.floor(Math.random() * insertedAttendees.length)];

                const booking = new Booking({
                    organizationId: rootOrg._id,
                    eventId: dbEvent._id,
                    userId: attendee._id,
                    status: 'confirmed',
                    amount: 100 // Ticket cost
                });
                bookings.push(booking);

                // Add Checkins
                if (j < 32 || dbEvent.status === 'completed') {
                    checkins.push({
                        organizationId: rootOrg._id,
                        eventId: dbEvent._id,
                        bookingId: booking._id
                    });
                }
            }

            // Generating high-level B2B Client Payments for the specific event
            // This is what the Payments Dashboard actually monitors instead of singular ticket sales.
            const paymentStatus = dbEvent.status === 'completed' ? 'completed' : (i % 2 === 0 ? 'completed' : 'pending');
            const amount = 15000;

            payments.push({
                organizationId: rootOrg._id,
                event: dbEvent._id,
                client: dbEvent.client,
                amount: amount,
                paymentType: paymentStatus === 'completed' ? 'full' : 'partial',
                paymentMethod: 'bank-transfer',
                status: paymentStatus,
                transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                invoiceNumber: `INV-${new Date().getFullYear()}-${String(i + 1).padStart(3, '0')}`,
                dueDate: dbEvent.startDate,
                paymentDate: paymentStatus === 'completed' ? new Date(dbEvent.startDate.getTime() - 86400000 * 5) : null,
                processedBy: admin._id,
                description: `B2B Contract for ${dbEvent.title}`
            });
        }

        await Booking.insertMany(bookings);
        await Payment.insertMany(payments);
        await Checkin.insertMany(checkins);

        console.log('Seeding complete! 150 users, 10 events, 400 bookings, and active vendors/clients added.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding DB:', error);
        process.exit(1);
    }
}

seedDatabase();
