import fs from 'fs';
import path from 'path';

const publicDir = path.join(process.cwd(), 'public');
const templatesDir = path.join(publicDir, 'templates');
const samplesDir = path.join(publicDir, 'samples');

if (!fs.existsSync(templatesDir)) fs.mkdirSync(templatesDir, { recursive: true });
if (!fs.existsSync(samplesDir)) fs.mkdirSync(samplesDir, { recursive: true });

// 1. Generate Clean Template
const templateCsv = `date,building,room,resource,usage,unit,operating_hours
2026-10-01,Block A,A101,electricity,42.5,kWh,8
2026-10-01,Block A,A102,electricity,38.0,kWh,8
2026-10-01,Block B,B201,electricity,91.2,kWh,8
2026-10-01,Central Library,L101,water,1250,L,12
2026-10-01,Hostel Block 1,H101,waste,45.0,kg,16
2026-10-02,Block A,A101,electricity,44.1,kWh,8
2026-10-02,Block B,B201,electricity,94.0,kWh,8
`;

fs.writeFileSync(path.join(templatesDir, 'ecosentinel-resource-template.csv'), templateCsv);
console.log('Template created at public/templates/ecosentinel-resource-template.csv');

// 2. Generate 30-day realistic SVVV dataset
const buildings = [
  { name: 'Block A (CSE & IT)', rooms: ['A101 Lab', 'A102 Server Rm', 'A201 Smart Class'], baseElec: 45, baseWater: 400, baseWaste: 20 },
  { name: 'Block B (Mech & Electrical)', rooms: ['B201 Heavy Power Lab', 'B202 Robotics Lab', 'B301 Workshop'], baseElec: 88, baseWater: 350, baseWaste: 35 },
  { name: 'Block C (Management)', rooms: ['C101 Auditorium', 'C201 Seminar Hall'], baseElec: 55, baseWater: 450, baseWaste: 25 },
  { name: 'Central Library', rooms: ['L101 Reading Hall', 'L201 Digital Stacks'], baseElec: 62, baseWater: 850, baseWaste: 18 },
  { name: 'Boys Hostel Kalam Bhavan', rooms: ['H101 Wing A', 'H201 Mess & Kitchen'], baseElec: 120, baseWater: 3200, baseWaste: 85 },
  { name: 'Girls Hostel Sarojini Bhavan', rooms: ['G101 Wing B', 'G201 Dining Hall'], baseElec: 110, baseWater: 2900, baseWaste: 75 },
  { name: 'Administrative Complex', rooms: ['AD101 Secretariat', 'AD102 Exam Cell'], baseElec: 50, baseWater: 500, baseWaste: 22 },
];

const mainRows = ['date,building,room,resource,usage,unit,operating_hours'];

// 30 days from 2026-09-15 to 2026-10-15
const startDate = new Date('2026-09-15T00:00:00Z');

for (let day = 0; day < 30; day++) {
  const currentDate = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
  const dateStr = currentDate.toISOString().split('T')[0];
  const dayOfWeek = currentDate.getUTCDay(); // 0 is Sunday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  for (const b of buildings) {
    for (const r of b.rooms) {
      // Operating hours
      const opHours = isWeekend ? 4 : (r.includes('Hostel') ? 18 : 8);

      // 1. Electricity
      let elecVariation = (Math.random() * 0.2 - 0.1); // +/- 10%
      let elec = b.baseElec * (1 + elecVariation) * (isWeekend ? 0.4 : 1.0);

      // Plant deliberate anomaly on Day 23 (2026-10-07) in Block B Heavy Power Lab
      if (day === 23 && b.name.includes('Block B') && r.includes('Heavy Power Lab')) {
        elec = 248.5; // Huge anomaly: +182% above historical baseline!
      }

      mainRows.push(`${dateStr},"${b.name}","${r}",electricity,${elec.toFixed(1)},kWh,${opHours}`);

      // 2. Water
      let waterVariation = (Math.random() * 0.25 - 0.12);
      let water = b.baseWater * (1 + waterVariation) * (isWeekend ? 0.6 : 1.0);

      // Plant water anomaly on Day 28 in Central Library
      if (day === 28 && b.name.includes('Central Library') && r.includes('Reading Hall')) {
        water = 3850; // Pipe burst anomaly
      }

      mainRows.push(`${dateStr},"${b.name}","${r}",water,${Math.round(water)},L,${opHours}`);

      // 3. Waste
      let wasteVariation = (Math.random() * 0.3 - 0.15);
      let waste = b.baseWaste * (1 + wasteVariation) * (isWeekend ? 0.3 : 1.0);
      mainRows.push(`${dateStr},"${b.name}","${r}",waste,${waste.toFixed(1)},kg,${opHours}`);
    }
  }
}

fs.writeFileSync(path.join(samplesDir, 'svvv-campus-october-dataset.csv'), mainRows.join('\n'));
console.log(`Main sample dataset created: ${mainRows.length - 1} rows!`);

// 3. Generate secondary overlapping dataset (to demo multi-upload merge without duplication)
const additionalRows = ['date,building,room,resource,usage,unit,operating_hours'];
// Overlaps days 26 to 29, adds days 30 to 35
for (let day = 26; day <= 35; day++) {
  const currentDate = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
  const dateStr = currentDate.toISOString().split('T')[0];
  const b = buildings[0]; // Block A
  for (const r of b.rooms) {
    const elec = (b.baseElec * (1 + (Math.random() * 0.1 - 0.05))).toFixed(1);
    additionalRows.push(`${dateStr},"${b.name}","${r}",electricity,${elec},kWh,8`);
  }
}

fs.writeFileSync(path.join(samplesDir, 'svvv-campus-additional-records.csv'), additionalRows.join('\n'));
console.log(`Secondary test dataset created: ${additionalRows.length - 1} rows!`);
