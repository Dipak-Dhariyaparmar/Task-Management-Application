import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User';
import connectDB from '../config/database';

const seedUsers = async () => {
  try {
    await connectDB();

    await User.deleteMany({});
    console.log('Cleared existing users');

    const users = [
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin',
      },
      {
        name: 'User One',
        email: 'user1@test.com',
        password: 'user123',
        role: 'user',
      },
      {
        name: 'User Two',
        email: 'user2@test.com',
        password: 'user123',
        role: 'user',
      },
    ];

    await User.create(users);

    console.log('Users seeded successfully');
    console.log('Test Credentials:');
    console.log('Admin: admin@test.com / admin123');
    console.log('User1: user1@test.com / user123');
    console.log('User2: user2@test.com / user123');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedUsers();