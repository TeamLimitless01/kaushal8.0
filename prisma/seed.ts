import { prisma } from '../src/lib/db/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log("Seeding EcoCampus users and roles...");

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
  const adminPasswordHash = await bcrypt.hash('admin', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@svvv.in' },
    update: {
      name: 'Campus Administrator',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
    create: {
      name: 'Campus Administrator',
      email: 'admin@svvv.in',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });
  console.log("Admin user verified:", admin.email);

  // 3. Ensure Student User exists (student@svvv.in / student123)
  const studentPasswordHash = await bcrypt.hash('student123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@svvv.in' },
    update: {
      name: 'Aarav Sharma (Student Rep)',
      passwordHash: studentPasswordHash,
      role: 'USER',
    },
    create: {
      name: 'Aarav Sharma (Student Rep)',
      email: 'student@svvv.in',
      passwordHash: studentPasswordHash,
      role: 'USER',
    },
  });
  console.log("Student user verified:", student.email);

  // 4. Ensure Faculty User exists (faculty@svvv.in / faculty123)
  const facultyPasswordHash = await bcrypt.hash('faculty123', 10);
  const faculty = await prisma.user.upsert({
    where: { email: 'faculty@svvv.in' },
    update: {
      name: 'Dr. Priya Verma (Faculty Lead)',
      passwordHash: facultyPasswordHash,
      role: 'MANAGER',
    },
    create: {
      name: 'Dr. Priya Verma (Faculty Lead)',
      email: 'faculty@svvv.in',
      passwordHash: facultyPasswordHash,
      role: 'MANAGER',
    },
  });
  console.log("Faculty user verified:", faculty.email);

  console.log("Database seed completed successfully with all campus roles!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
