import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('📝 Seeding users...');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  // Create regular users
  const user1 = await prisma.user.create({
    data: {
      username: 'johndoe',
      email: 'john.doe@example.com',
      password: hashedPassword,
      role: 'user',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'janedoe',
      email: 'jane.doe@example.com',
      password: hashedPassword,
      role: 'user',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      username: 'bobsmith',
      email: 'bob.smith@example.com',
      password: hashedPassword,
      role: 'user',
    },
  });

  console.log('✅ Users created:');
  console.log(`   - ${admin.username} (${admin.email}) - Role: ${admin.role}`);
  console.log(`   - ${user1.username} (${user1.email}) - Role: ${user1.role}`);
  console.log(`   - ${user2.username} (${user2.email}) - Role: ${user2.role}`);
  console.log(`   - ${user3.username} (${user3.email}) - Role: ${user3.role}`);
  console.log('\n🔑 All users have password: Password123!');

  console.log('\n✨ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });