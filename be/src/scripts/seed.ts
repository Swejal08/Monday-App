import { connectDatabase, disconnectDatabase } from '../config/database';
import { User, Task } from '../models';

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await connectDatabase();

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create sample users
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
      },
    ]);

    console.log(`👥 Created ${users.length} users`);

    // Create sample tasks
    const tasks = await Task.create([
      {
        title: 'Setup project structure',
        description:
          'Initialize the Monday app with proper folder structure and dependencies',
        status: 'done',
        priority: 'high',
        createdBy: users[0]._id,
        assignedTo: users[0]._id,
      },
      {
        title: 'Design user interface',
        description: 'Create wireframes and mockups for the main dashboard',
        status: 'in-progress',
        priority: 'medium',
        createdBy: users[0]._id,
        assignedTo: users[1]._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        title: 'Implement authentication',
        description: 'Add user login and registration functionality',
        status: 'todo',
        priority: 'high',
        createdBy: users[1]._id,
        assignedTo: users[2]._id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      },
      {
        title: 'Write API documentation',
        description: 'Document all API endpoints with examples',
        status: 'todo',
        priority: 'low',
        createdBy: users[0]._id,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      },
      {
        title: 'Setup CI/CD pipeline',
        description: 'Configure automated testing and deployment',
        status: 'todo',
        priority: 'medium',
        createdBy: users[2]._id,
        assignedTo: users[0]._id,
      },
    ]);

    console.log(`📋 Created ${tasks.length} tasks`);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Tasks: ${tasks.length}`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await disconnectDatabase();
  }
};

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedData();
}

export default seedData;
