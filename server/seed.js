const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Client = require('./models/Client');
const Vendor = require('./models/Vendor');
const Event = require('./models/Event');
const Payment = require('./models/Payment');

// Sample data
const sampleUsers = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'admin@eventpro.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1-555-0123'
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'manager@eventpro.com',
    password: 'manager123',
    role: 'manager',
    phone: '+1-555-0124'
  },
  {
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'staff@eventpro.com',
    password: 'staff123',
    role: 'staff',
    phone: '+1-555-0125'
  }
];

const sampleClients = [
  {
    companyName: 'TechCorp Solutions',
    contactPerson: {
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@techcorp.com',
      phone: '+1-555-0201',
      position: 'Event Manager'
    },
    address: {
      street: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      zipCode: '94105'
    },
    industry: 'Technology',
    companySize: 'large',
    website: 'https://techcorp.com',
    status: 'active',
    totalEvents: 5,
    totalSpent: 50000
  },
  {
    companyName: 'HealthFirst Inc',
    contactPerson: {
      firstName: 'Dr. Robert',
      lastName: 'Brown',
      email: 'robert.brown@healthfirst.com',
      phone: '+1-555-0202',
      position: 'Director of Events'
    },
    address: {
      street: '456 Health Avenue',
      city: 'Boston',
      state: 'MA',
      country: 'USA',
      zipCode: '02101'
    },
    industry: 'Healthcare',
    companySize: 'medium',
    website: 'https://healthfirst.com',
    status: 'active',
    totalEvents: 3,
    totalSpent: 25000
  }
];

const sampleVendors = [
  {
    businessName: 'Elite Catering Co',
    contactPerson: {
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria@elitecatering.com',
      phone: '+1-555-0301',
      position: 'Owner'
    },
    services: ['catering', 'entertainment'],
    address: {
      street: '789 Food Court',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10001'
    },
    website: 'https://elitecatering.com',
    pricing: {
      hourly: 150,
      daily: 1200,
      package: 5000,
      currency: 'USD'
    },
    status: 'active',
    rating: {
      average: 4.8,
      count: 25
    },
    totalEvents: 15,
    totalEarnings: 75000
  },
  {
    businessName: 'Pro AV Solutions',
    contactPerson: {
      firstName: 'David',
      lastName: 'Lee',
      email: 'david@proav.com',
      phone: '+1-555-0302',
      position: 'Technical Director'
    },
    services: ['audio-visual', 'photography', 'videography'],
    address: {
      street: '321 Media Lane',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      zipCode: '90210'
    },
    website: 'https://proav.com',
    pricing: {
      hourly: 200,
      daily: 1500,
      package: 8000,
      currency: 'USD'
    },
    status: 'active',
    rating: {
      average: 4.9,
      count: 18
    },
    totalEvents: 12,
    totalEarnings: 60000
  }
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Client.deleteMany({});
    await Vendor.deleteMany({});
    await Event.deleteMany({});
    await Payment.deleteMany({});

    console.log('Cleared existing data');

    // Create users (ensure passwords are hashed)
    const usersToInsert = await Promise.all(
      sampleUsers.map(async (u) => {
        const salt = await bcrypt.genSalt(12);
        const hashed = await bcrypt.hash(u.password, salt);
        return { ...u, password: hashed };
      })
    );

    const users = await User.insertMany(usersToInsert);
    console.log(`Created ${users.length} users`);

    // Create clients
    const clients = await Client.insertMany(sampleClients);
    console.log(`Created ${clients.length} clients`);

    // Create vendors
    const vendors = await Vendor.insertMany(sampleVendors);
    console.log(`Created ${vendors.length} vendors`);

    // Create sample events
    const sampleEvents = [
      {
        title: 'TechCorp Annual Conference 2024',
        description: 'Annual technology conference featuring the latest innovations in AI, cloud computing, and cybersecurity.',
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
        currentRegistrations: 350,
        pricing: {
          earlyBird: { amount: 299, endDate: new Date('2024-04-15') },
          regular: { amount: 399 },
          vip: { amount: 599 }
        },
        status: 'published',
        organizer: users[0]._id,
        client: clients[0]._id,
        vendors: [
          {
            vendor: vendors[0]._id,
            service: 'Catering',
            cost: 15000,
            status: 'confirmed'
          },
          {
            vendor: vendors[1]._id,
            service: 'Audio Visual',
            cost: 25000,
            status: 'confirmed'
          }
        ],
        staff: [
          {
            user: users[1]._id,
            role: 'Event Manager',
            responsibilities: ['Overall coordination', 'Vendor management']
          }
        ],
        budget: {
          total: 100000,
          allocated: 80000,
          spent: 45000,
          currency: 'USD'
        }
      },
      {
        title: 'HealthFirst Medical Summit',
        description: 'Healthcare innovation summit focusing on telemedicine and digital health solutions.',
        eventType: 'seminar',
        startDate: new Date('2024-07-20T10:00:00Z'),
        endDate: new Date('2024-07-20T16:00:00Z'),
        location: {
          venue: 'Boston Medical Center',
          address: {
            street: '1 Boston Medical Center Pl',
            city: 'Boston',
            state: 'MA',
            country: 'USA',
            zipCode: '02118'
          }
        },
        capacity: 200,
        currentRegistrations: 120,
        pricing: {
          regular: { amount: 199 }
        },
        status: 'published',
        organizer: users[1]._id,
        client: clients[1]._id,
        budget: {
          total: 50000,
          allocated: 40000,
          spent: 20000,
          currency: 'USD'
        }
      }
    ];

    const events = await Event.insertMany(sampleEvents);
    console.log(`Created ${events.length} events`);

    // Create sample payments
    const samplePayments = [
      {
        event: events[0]._id,
        client: clients[0]._id,
        amount: 15000,
        currency: 'USD',
        paymentType: 'deposit',
        paymentMethod: 'credit-card',
        status: 'completed',
        paymentDate: new Date('2024-01-15'),
        description: 'Initial deposit for TechCorp Conference',
        processedBy: users[0]._id
      },
      {
        event: events[1]._id,
        client: clients[1]._id,
        amount: 10000,
        currency: 'USD',
        paymentType: 'deposit',
        paymentMethod: 'bank-transfer',
        status: 'completed',
        paymentDate: new Date('2024-02-01'),
        description: 'Initial deposit for HealthFirst Summit',
        processedBy: users[1]._id
      }
    ];

    const payments = await Payment.insertMany(samplePayments);
    console.log(`Created ${payments.length} payments`);

    console.log('Database seeding completed successfully!');
    console.log('\nDefault login credentials:');
    console.log('Admin: admin@eventpro.com / admin123');
    console.log('Manager: manager@eventpro.com / manager123');
    console.log('Staff: staff@eventpro.com / staff123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run seeding
connectDB().then(() => {
  seedDatabase();
});


