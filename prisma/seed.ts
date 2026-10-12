import { prisma } from '../src/lib/db/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log("Seeding EcoSentinel database...");

  // 1. Ensure SVVV Campus exists
  const campus = await prisma.campus.upsert({
    where: { id: 'svvv-main-campus' },
    update: {
      name: 'SVVV Campus',
      location: 'Indore, Madhya Pradesh',
    },
    create: {
      id: 'svvv-main-campus',
      name: 'SVVV Campus',
      location: 'Indore, Madhya Pradesh',
    },
  });
  console.log("Campus verified:", campus.name);

  // 2. Ensure Admin User exists (admin@svvv.in / admin)
  const passwordHash = await bcrypt.hash('admin', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@svvv.in' },
    update: {
      name: 'Campus Administrator',
      passwordHash,
      role: 'ADMIN',
    },
    create: {
      name: 'Campus Administrator',
      email: 'admin@svvv.in',
      passwordHash,
      role: 'ADMIN',
    },
  });
  console.log("Admin user verified:", admin.email);

  console.log("Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
