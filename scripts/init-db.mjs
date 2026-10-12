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

    // Ensure Role enum contains USER
    await sql`
      DO $$ BEGIN
        ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'USER';
      EXCEPTION
        WHEN others THEN null;
      END $$;
    `;

    // Create WasteCategory enum
    await sql`
      DO $$ BEGIN
        CREATE TYPE "WasteCategory" AS ENUM ('RECYCLABLE_DRY', 'ORGANIC_WET', 'HAZARDOUS', 'E_WASTE', 'LANDFILL_RESIDUAL', 'SPECIAL_HANDLING');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Create BinType enum
    await sql`
      DO $$ BEGIN
        CREATE TYPE "BinType" AS ENUM ('BLUE_RECYCLABLE', 'GREEN_ORGANIC', 'RED_HAZARDOUS', 'YELLOW_EWASTE', 'BLACK_LANDFILL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Create waste_rules table
    await sql`
      CREATE TABLE IF NOT EXISTS waste_rules (
        id TEXT PRIMARY KEY,
        "itemName" TEXT UNIQUE NOT NULL,
        aliases TEXT[] NOT NULL DEFAULT '{}',
        category "WasteCategory" NOT NULL,
        "primaryBin" "BinType" NOT NULL,
        material TEXT NOT NULL,
        "prepInstructions" TEXT[] NOT NULL DEFAULT '{}',
        "disposalLocation" TEXT NOT NULL DEFAULT 'Campus Quad Waste Stations',
        "isHazardous" BOOLEAN NOT NULL DEFAULT false,
        "hazardousWarning" TEXT,
        "requiresClarification" BOOLEAN NOT NULL DEFAULT false,
        "clarificationQuestion" TEXT,
        "clarificationOptions" JSONB,
        "searchKeywords" TEXT[] NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create waste_stations table
    await sql`
      CREATE TABLE IF NOT EXISTS waste_stations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        "availableBins" TEXT[] NOT NULL DEFAULT ARRAY['BLUE_RECYCLABLE', 'GREEN_ORGANIC', 'BLACK_LANDFILL'],
        "hasEwasteDrop" BOOLEAN NOT NULL DEFAULT false,
        "hasBatteryDrop" BOOLEAN NOT NULL DEFAULT false,
        "qrCodeData" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create waste_scans table
    await sql`
      CREATE TABLE IF NOT EXISTS waste_scans (
        id TEXT PRIMARY KEY,
        "userId" TEXT REFERENCES users(id) ON DELETE SET NULL,
        "stationId" TEXT REFERENCES waste_stations(id) ON DELETE SET NULL,
        "imageUrl" TEXT,
        "detectedItem" TEXT NOT NULL,
        "detectedCategory" TEXT NOT NULL,
        "confidenceScore" DOUBLE PRECISION NOT NULL,
        "wasClarified" BOOLEAN NOT NULL DEFAULT false,
        "userClarification" TEXT,
        "finalBinRecommended" TEXT NOT NULL,
        "feedbackStatus" TEXT,
        "feedbackComment" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`CREATE INDEX IF NOT EXISTS "waste_scans_createdAt_idx" ON waste_scans("createdAt");`;
    await sql`CREATE INDEX IF NOT EXISTS "waste_scans_userId_idx" ON waste_scans("userId");`;

    console.log("All tables, constraints, and indexes created successfully on Neon PostgreSQL!");
  } catch (err) {
    console.error("Error setting up database:", err);
    process.exit(1);
  }
}

init();
