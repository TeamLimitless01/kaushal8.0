import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_LZdTg2EN8OlP@ep-summer-resonance-b4bfzhha-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";
const sql = neon(connectionString);

async function init() {
  console.log("Initializing database schema on Neon...");
  try {
    // Create enums if not exist
    await sql`
      DO $$ BEGIN
        CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'VIEWER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE "ResourceType" AS ENUM ('ELECTRICITY', 'WATER', 'WASTE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE "ImportStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED', 'PARTIAL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        "passwordHash" TEXT NOT NULL,
        role "Role" NOT NULL DEFAULT 'ADMIN',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create campuses table
    await sql`
      CREATE TABLE IF NOT EXISTS campuses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL DEFAULT 'SVVV Campus',
        location TEXT NOT NULL DEFAULT 'Indore',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create buildings table
    await sql`
      CREATE TABLE IF NOT EXISTS buildings (
        id TEXT PRIMARY KEY,
        "campusId" TEXT NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "buildings_campusId_name_key" UNIQUE ("campusId", name)
      );
    `;

    // Create rooms table
    await sql`
      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        "buildingId" TEXT NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "rooms_buildingId_name_key" UNIQUE ("buildingId", name)
      );
    `;

    // Create imports table
    await sql`
      CREATE TABLE IF NOT EXISTS imports (
        id TEXT PRIMARY KEY,
        "campusId" TEXT NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
        "uploadedById" TEXT REFERENCES users(id) ON DELETE SET NULL,
        "fileName" TEXT NOT NULL,
        "cloudinaryUrl" TEXT,
        "publicId" TEXT,
        "rowCount" INTEGER NOT NULL DEFAULT 0,
        "validRowCount" INTEGER NOT NULL DEFAULT 0,
        "invalidRowCount" INTEGER NOT NULL DEFAULT 0,
        "dateFrom" DATE,
        "dateTo" DATE,
        status "ImportStatus" NOT NULL DEFAULT 'PROCESSING',
        summary JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create resource_usages table
    await sql`
      CREATE TABLE IF NOT EXISTS resource_usages (
        id TEXT PRIMARY KEY,
        "campusId" TEXT NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
        "buildingId" TEXT NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
        "roomId" TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        "resourceType" "ResourceType" NOT NULL,
        usage DOUBLE PRECISION NOT NULL,
        unit TEXT NOT NULL,
        "operatingHours" DOUBLE PRECISION,
        "recordedDate" DATE NOT NULL,
        "importId" TEXT REFERENCES imports(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "resource_usages_campusId_buildingId_roomId_resourceType_recordedDate_key" UNIQUE ("campusId", "buildingId", "roomId", "resourceType", "recordedDate")
      );
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS "resource_usages_recordedDate_idx" ON resource_usages("recordedDate");`;
    await sql`CREATE INDEX IF NOT EXISTS "resource_usages_resourceType_idx" ON resource_usages("resourceType");`;
    await sql`CREATE INDEX IF NOT EXISTS "resource_usages_buildingId_idx" ON resource_usages("buildingId");`;

    console.log("All tables, constraints, and indexes created successfully on Neon PostgreSQL!");
  } catch (err) {
    console.error("Error setting up database:", err);
    process.exit(1);
  }
}

init();
