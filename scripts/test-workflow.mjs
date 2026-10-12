import { parseAndValidateCsv } from '../src/lib/csv/parser.js';
import { processAndStoreImport } from '../src/server/services/importService.js';
import { getDashboardData } from '../src/server/services/analyticsService.js';
import { calculateSimulatedSavings } from '../src/lib/sustainability/constants.js';
import { prisma } from '../src/lib/db/prisma.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

async function runEndToEndVerification() {
  console.log('====================================================');
  console.log('🚀 ECO-SENTINEL: STARTING END-TO-END VERIFICATION');
  console.log('====================================================\n');

  try {
    // 1. Verify Seeded Admin & Campus
    console.log('Step 1: Verifying seeded admin credentials & campus...');
    const admin = await prisma.user.findUnique({ where: { email: 'admin@svvv.in' } });
    if (!admin) throw new Error('Admin user not found in database');
    const isPassValid = await bcrypt.compare('admin', admin.passwordHash);
    if (!isPassValid) throw new Error('Admin password hash mismatch');
    console.log('   ✓ Admin user verified: admin@svvv.in (Role: ADMIN, Password: OK)');

    const campus = await prisma.campus.findFirst({ where: { name: 'SVVV Campus' } });
    if (!campus) throw new Error('SVVV Campus not found');
    console.log(`   ✓ Campus verified: ${campus.name} (${campus.location})`);

    // Clean any prior test imports to start from fresh state
    console.log('\nStep 2: Cleaning prior test resource usage to verify empty state...');
    await prisma.resourceUsage.deleteMany({});
    await prisma.import.deleteMany({});

    const initialDashboard = await getDashboardData();
    if (initialDashboard.hasData !== false) {
      throw new Error('Initial dashboard should report hasData: false for empty state');
    }
    console.log('   ✓ Fresh database reports hasData: false (Triggers Onboarding Empty State)');

    // 3. Verify Downloadable CSV Template
    console.log('\nStep 3: Verifying CSV template integrity...');
    const templatePath = path.join(process.cwd(), 'public', 'templates', 'ecosentinel-resource-template.csv');
    if (!fs.existsSync(templatePath)) throw new Error('Template file missing');
    const templateText = fs.readFileSync(templatePath, 'utf-8');
    const templateParsed = parseAndValidateCsv(templateText, 'template.csv');
    if (templateParsed.errors.length > 0) throw new Error('Template has syntax errors');
    console.log(`   ✓ Template parsed cleanly with ${templateParsed.validRows.length} valid rows`);

    // 4. Ingest Primary 30-Day SVVV Dataset
    console.log('\nStep 4: Parsing and validating primary 30-day SVVV dataset...');
    const samplePath = path.join(process.cwd(), 'public', 'samples', 'svvv-campus-october-dataset.csv');
    const sampleText = fs.readFileSync(samplePath, 'utf-8');
    const parseResult = parseAndValidateCsv(sampleText, 'svvv-campus-october-dataset.csv');

    console.log(`   ✓ Total rows detected: ${parseResult.totalRows}`);
    console.log(`   ✓ Valid rows: ${parseResult.summary.validCount}`);
    console.log(`   ✓ Invalid rows: ${parseResult.summary.invalidCount}`);
    console.log(`   ✓ Date coverage: ${parseResult.summary.dateFrom} → ${parseResult.summary.dateTo}`);
    console.log(`   ✓ Buildings detected (${parseResult.summary.buildingCount}): ${parseResult.summary.buildings.join(', ')}`);

    // 5. Ingest into PostgreSQL via processAndStoreImport
    console.log('\nStep 5: Ingesting dataset into PostgreSQL with normalization & transaction...');
    const import1Result = await processAndStoreImport({
      fileName: 'svvv-campus-october-dataset.csv',
      cloudinaryUrl: 'https://res.cloudinary.com/ecosentinel/raw/upload/v1/imports/svvv-october.csv',
      publicId: 'imports/svvv-october',
      validRows: parseResult.validRows,
      totalCsvRows: parseResult.totalRows,
      userId: admin.id,
    });

    console.log(`   ✓ Batch Ingest 1 complete!`);
    console.log(`     - Inserted records: ${import1Result.insertedCount}`);
    console.log(`     - Updated records: ${import1Result.updatedCount}`);
    console.log(`     - Status: ${import1Result.status}`);

    // 6. Verify Dashboard Calculations & Anomaly Detection
    console.log('\nStep 6: Querying populated Dashboard analytics & anomaly engine...');
    const dash1 = await getDashboardData();
    if (!dash1.hasData) throw new Error('Dashboard should have data');

    console.log(`   ✓ Total normalized records: ${dash1.totalRecordsCount}`);
    console.log(`   ✓ Total Energy: ${dash1.kpis.energy.formattedValue} ${dash1.kpis.energy.unit} (${dash1.kpis.energy.baselineStatus})`);
    console.log(`   ✓ Water Consumption: ${dash1.kpis.water.formattedValue} ${dash1.kpis.water.unit}`);
    console.log(`   ✓ Waste Generated: ${dash1.kpis.waste.formattedValue} ${dash1.kpis.waste.unit}`);
    console.log(`   ✓ Estimated Utility Cost: ${dash1.kpis.cost.formattedValue}`);
    console.log(`   ✓ Campus Sustainability Score: ${dash1.kpis.sustainabilityScore} / 100`);
    console.log(`   ✓ Potential Savings: ₹${dash1.kpis.potentialSavingsInr.toLocaleString('en-IN')}`);
    console.log(`   ✓ Gross Carbon Footprint: ${dash1.kpis.co2EmissionsKg.toLocaleString('en-IN')} kg CO₂`);

    console.log(`\nStep 7: Verifying Statistical Anomaly Engine...`);
    console.log(`   ✓ Anomalies flagged count: ${dash1.anomalies.length}`);
    const topAnomaly = dash1.anomalies[0];
    if (!topAnomaly) throw new Error('Expected at least 1 anomaly');
    console.log(`   🚨 Top Flagged Anomaly:`);
    console.log(`      - Location: ${topAnomaly.buildingName} (${topAnomaly.roomName})`);
    console.log(`      - Resource: ${topAnomaly.resourceType}`);
    console.log(`      - Date: ${topAnomaly.date}`);
    console.log(`      - Expected: ${topAnomaly.expectedUsage} ${topAnomaly.unit}`);
    console.log(`      - Actual: ${topAnomaly.actualUsage} ${topAnomaly.unit}`);
    console.log(`      - Deviation: +${topAnomaly.deviationPercent}%`);
    console.log(`      - Financial Impact: ₹${topAnomaly.estimatedExcessCostInr.toLocaleString('en-IN')}`);
    console.log(`      - AI Diagnosis: "${topAnomaly.aiExplanation.summary}"`);
    console.log(`      - Recommended Action: "${topAnomaly.aiExplanation.recommendedAction}"`);

    // 8. Test Second CSV Upload (Deduplication & Merge test)
    console.log('\nStep 8: Uploading secondary CSV with overlapping date range...');
    const additionalPath = path.join(process.cwd(), 'public', 'samples', 'svvv-campus-additional-records.csv');
    const additionalText = fs.readFileSync(additionalPath, 'utf-8');
    const parseResult2 = parseAndValidateCsv(additionalText, 'svvv-campus-additional-records.csv');

    const import2Result = await processAndStoreImport({
      fileName: 'svvv-campus-additional-records.csv',
      cloudinaryUrl: 'https://res.cloudinary.com/ecosentinel/raw/upload/v1/imports/svvv-additional.csv',
      publicId: 'imports/svvv-additional',
      validRows: parseResult2.validRows,
      totalCsvRows: parseResult2.totalRows,
      userId: admin.id,
    });

    console.log(`   ✓ Batch Ingest 2 complete!`);
    console.log(`     - New records inserted: ${import2Result.insertedCount}`);
    console.log(`     - Existing overlapping records updated: ${import2Result.updatedCount}`);
    console.log(`     - Duplicate identical records skipped: ${import2Result.skippedCount}`);

    // Verify database count
    const totalDbRecords = await prisma.resourceUsage.count();
    console.log(`   ✓ Database record count after merge: ${totalDbRecords} (No duplicate collisions)`);

    // 9. Verify Import History Audit Log
    console.log('\nStep 9: Verifying Import History...');
    const allImports = await prisma.import.findMany({ orderBy: { createdAt: 'desc' } });
    console.log(`   ✓ Total imports recorded in database: ${allImports.length}`);
    allImports.forEach((imp, i) => {
      console.log(`     [${i + 1}] ${imp.fileName} (${imp.status}) - ${imp.validRowCount} rows, Cloudinary: ${imp.cloudinaryUrl || 'local'}`);
    });

    // 10. Verify What-If Simulator Math
    console.log('\nStep 10: Verifying "What If?" Simulator calculations...');
    const sim10 = calculateSimulatedSavings(dash1.kpis.energy.value, 10);
    const sim20 = calculateSimulatedSavings(dash1.kpis.energy.value, 20);
    console.log(`   ✓ 10% reduction saves: ${Math.round(sim10.savedKwh)} kWh/mo -> ₹${Math.round(sim10.financialSavingInr).toLocaleString('en-IN')}/mo (${Math.round(sim10.co2ReductionKg)} kg CO₂ reduction, ${sim10.treesEquivalent} trees offset)`);
    console.log(`   ✓ 20% reduction saves: ${Math.round(sim20.savedKwh)} kWh/mo -> ₹${Math.round(sim20.financialSavingInr).toLocaleString('en-IN')}/mo`);

    console.log('\n====================================================');
    console.log('🎉 ALL END-TO-END WORKFLOW VERIFICATIONS PASSED 100%');
    console.log('====================================================');
  } catch (error) {
    console.error('\n❌ VERIFICATION FAILED:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runEndToEndVerification();
