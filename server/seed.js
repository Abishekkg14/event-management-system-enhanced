const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Organization = require('./models/Organization');
const User = require('./models/User');
const Client = require('./models/Client');
const Vendor = require('./models/Vendor');
const Event = require('./models/Event');
const Payment = require('./models/Payment');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management');
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await Organization.deleteMany({});
    await User.deleteMany({});
    await Client.deleteMany({});
    await Vendor.deleteMany({});
    await Event.deleteMany({});
    await Payment.deleteMany({});

    console.log('Cleared existing data');

    // 1. Create Organization
    const org = await Organization.create({
      name: 'EventPro Global',
      domain: 'eventpro.com',
      settings: {
        currency: 'USD',
        timezone: 'UTC'
      }
    });
    console.log(`Created Organization: ${org.name}`);

    // 2. Create Users
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const users = await User.insertMany([
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'admin@eventpro.com',
        password: 'admin123', // Hashing will be handled by pre-save hook IF using .create, 
        // but insertMany doesn't trigger hooks unless specified.
        // Actually, seed.js previously manually hashed. Let's stick to that for reliability or use .create
        organizationId: org._id,
        role: 'Super Admin',
        phone: '+1-555-0123'
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'manager@eventpro.com',
        password: 'manager123',
        organizationId: org._id,
        role: 'Admin',
        phone: '+1-555-0124'
      },
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'staff@eventpro.com',
        password: 'staff123',
        organizationId: org._id,
        role: 'Organizer',
        phone: '+1-555-0125'
      }
    ]);
    // Note: I'll use .create for users to ensure the pre-save hook hashes passwords correctly
    // Or manually hash since seed scripts often do that. Let's use User.create in a loop.
    await User.deleteMany({}); // clearing again to use create
    const createdUsers = [];
    const userDatas = [
      { firstName: 'Admin', lastName: 'User', email: 'admin@eventpro.com', password: 'admin123', role: 'Super Admin', organizationId: org._id },
      { firstName: 'Manager', lastName: 'User', email: 'manager@eventpro.com', password: 'manager123', role: 'Admin', organizationId: org._id },
      { firstName: 'Staff', lastName: 'User', email: 'staff@eventpro.com', password: 'staff123', role: 'Organizer', organizationId: org._id }
    ];
    for (const data of userDatas) {
      createdUsers.push(await User.create(data));
    }
    console.log(`Created ${createdUsers.length} users with hashed passwords`);

    // 3. Create Clients
    const clients = await Client.insertMany([
      {
        organizationId: org._id,
        companyName: 'TechCorp Solutions',
        contactPerson: {
          firstName: 'Sarah',
          lastName: 'Wilson',
          email: 'sarah.wilson@techcorp.com',
          phone: '+1-555-0201',
          position: 'Event Manager'
        },
        industry: 'Technology',
        companySize: 'large',
        status: 'active'
      }
    ]);
    console.log(`Created ${clients.length} clients`);

    // 4. Create Vendors
    const vendors = await Vendor.insertMany([
      {
        organizationId: org._id,
        businessName: 'Elite Catering Co',
        contactPerson: {
          firstName: 'Maria',
          lastName: 'Garcia',
          email: 'maria@elitecatering.com',
          phone: '+1-555-0301',
          position: 'Owner'
        },
        services: ['catering'],
        status: 'active'
      }
    ]);
    console.log(`Created ${vendors.length} vendors`);

    // 5. Create Events
    const events = await Event.insertMany([
      {
        organizationId: org._id,
        title: 'TechCorp Annual Conference 2024',
        description: 'Annual technology conference featuring the latest innovations.',
        eventType: 'conference',
        startDate: new Date('2024-06-15T09:00:00Z'),
        endDate: new Date('2024-06-17T17:00:00Z'),
        location: {
          venue: 'San Francisco Convention Center',
          address: {
            street: '747 Howard St',
            city: 'San Francisco',
            state: 'CA',
            country: 'USA',
            zipCode: '94103'
          }
        },
        capacity: 500,
        status: 'published',
        organizer: createdUsers[0]._id,
        client: clients[0]._id
      }
    ]);
    console.log(`Created ${events.length} events`);

    console.log('Database seeding successfully completed!');
    console.log('\nLogin Credentials:');
    console.log('Email: admin@eventpro.com | Password: admin123 (Super Admin)');
    console.log('Email: manager@eventpro.com | Password: manager123 (Admin)');
    console.log('Email: staff@eventpro.com | Password: staff123 (Organizer)');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.disconnect();
  }
};

connectDB().then(() => {
  seedDatabase();
});


