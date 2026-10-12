import { prisma } from '@/lib/db/prisma';
import { classifyWasteItem } from './wasteService';
import bcrypt from 'bcryptjs';

export interface SubmitReportInput {
  userId?: string;
  imageBase64?: string;
  itemHint?: string;
  location?: string;
  notes?: string;
  fileName?: string;
  stationId?: string;
}

export interface ReportResult {
  scanId: string;
  detectedItem: string;
  category: string;
  pointsProposed: number;
  totalPoints: number;
  confidenceScore: number;
  aiSuggestion: string;
  primaryBin: string;
  disposalLocation: string;
  prepInstructions: string[];
  isHazardous: boolean;
  hazardousWarning: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface StudentLeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  department: string;
  points: number;
  reportsCount: number;
  badge: string;
  isCurrentUser: boolean;
  avatarColor: string;
}

export interface UserEcoStats {
  userId: string;
  name: string;
  email: string;
  points: number;
  rank: number;
  level: number;
  levelTitle: string;
  nextLevelPoints: number;
  levelProgressPct: number;
  approvedReportsCount: number;
  pendingReportsCount: number;
  badge: string;
}

export function calculateCategoryPoints(category: string, isHazardous = false): number {
  if (isHazardous || category === 'HAZARDOUS') return 50;
  if (category === 'E_WASTE') return 40;
  if (category === 'ORGANIC_WET') return 30;
  if (category === 'RECYCLABLE_DRY') return 25;
  return 20; // LANDFILL_RESIDUAL
}

const PEER_STUDENT_SEEDS = [
  {
    name: 'Diya Patel',
    email: 'diya@svvv.in',
    department: 'CSE - 3rd Year',
    avatarColor: 'from-amber-400 to-amber-600',
    baseReports: [
      { item: 'Plastic Beverage Bottle (PET #1)', cat: 'RECYCLABLE_DRY', bin: 'BLUE_RECYCLABLE', pts: 25 },
      { item: 'Canteen Cardboard Carton', cat: 'RECYCLABLE_DRY', bin: 'BLUE_RECYCLABLE', pts: 25 },
      { item: 'Discarded Laptop Battery', cat: 'HAZARDOUS', bin: 'RED_HAZARDOUS', pts: 50 },
      { item: 'Campus Vermicompost Scraps', cat: 'ORGANIC_WET', bin: 'GREEN_ORGANIC', pts: 30 },
      { item: 'E-Waste Monitor Cable', cat: 'E_WASTE', bin: 'YELLOW_EWASTE', pts: 40 },
      { item: 'Aluminium Beverage Can', cat: 'RECYCLABLE_DRY', bin: 'BLUE_RECYCLABLE', pts: 25 },
      { item: 'Chemical Reagent Bottle', cat: 'HAZARDOUS', bin: 'RED_HAZARDOUS', pts: 50 },
      { item: 'Library Paper Pamphlets', cat: 'RECYCLABLE_DRY', bin: 'BLUE_RECYCLABLE', pts: 25 },
      { item: 'Food Hall Vegetable Peels', cat: 'ORGANIC_WET', bin: 'GREEN_ORGANIC', pts: 30 },
      { item: 'Old Smartphone Motherboard', cat: 'E_WASTE', bin: 'YELLOW_EWASTE', pts: 40 },
    ],
  },
  {
    name: 'Rohan Mehta',
    email: 'rohan@svvv.in',
    department: 'Mechanical - 4th Year',
    avatarColor: 'from-slate-400 to-slate-600',
    baseReports: [
      { item: 'Stainless Steel Flask Cap', cat: 'RECYCLABLE_DRY', bin: 'BLUE_RECYCLABLE', pts: 25 },
      { item: 'Workshop Machine Lithium Cells', cat: 'HAZARDOUS', bin: 'RED_HAZARDOUS', pts: 50 },
      { item: 'Discarded Copper Wiring', cat: 'E_WASTE', bin: 'YELLOW_EWASTE', pts: 40 },
      { item: 'Plastic Lubricant Canister', cat: 'RECYCLABLE_DRY', bin: 'BLUE_RECYCLABLE', pts: 25 },
      { item: 'Canteen Coffee Cups', cat: 'LANDFILL_RESIDUAL', bin: 'BLACK_LANDFILL', pts: 20 },
      { item: 'CAD Lab Ribbon Cables', cat: 'E_WASTE', bin: 'YELLOW_EWASTE', pts: 40 },
      { item: 'Metal Lathe Swarf Container', cat: 'RECYCLABLE_DRY', bin: 'BLUE_RECYCLABLE', pts: 25 },
    ],
  },
  {
    name: 'Sneha Joshi',
    email: 'sneha@svvv.in',
    department: 'Biotechnology - 2nd Year',
    avatarColor: 'from-amber-600 to-amber-800',
    baseReports: [
      { item: 'Chemistry Lab Reagent Vials', cat: 'HAZARDOUS', bin: 'RED_HAZARDOUS', pts: 50 },
      { item: 'Biology Lawn Botanical Scraps', cat: 'ORGANIC_WET', bin: 'GREEN_ORGANIC', pts: 30 },
      { item: 'Clean Glass Flask Packaging', cat: 'RECYCLABLE_DRY', bin: 'BLUE_RECYCLABLE', pts: 25 },
      { item: 'Fruit Peels & Lunchbox Scraps', cat: 'ORGANIC_WET', bin: 'GREEN_ORGANIC', pts: 30 },
      { item: 'Single-use Specimen Tubes', cat: 'LANDFILL_RESIDUAL', bin: 'BLACK_LANDFILL', pts: 20 },
    ],
  },
  {
    name: 'Kabir Singh',
    email: 'kabir@svvv.in',
    department: 'Electrical - 3rd Year',
    avatarColor: 'from-blue-500 to-indigo-600',
    baseReports: [
      { item: 'Burned Out Multimeter Probe', cat: 'E_WASTE', bin: 'YELLOW_EWASTE', pts: 40 },
      { item: 'Transformer Coil Insulation Film', cat: 'LANDFILL_RESIDUAL', bin: 'BLACK_LANDFILL', pts: 20 },
      { item: 'Lead-Acid Small Backup Cell', cat: 'HAZARDOUS', bin: 'RED_HAZARDOUS', pts: 50 },
    ],
  },
];

/**
 * Seed peer student profiles if they don't already exist
 */
export async function ensureCampusStudentsSeeded() {
  try {
    const existingCount = await prisma.user.count({ where: { role: 'STUDENT' } });
    if (existingCount >= 4) return;

    const defaultPasswordHash = await bcrypt.hash('student', 10);

    for (const peer of PEER_STUDENT_SEEDS) {
      const user = await prisma.user.upsert({
        where: { email: peer.email },
        update: {
          name: peer.name,
          role: 'STUDENT',
        },
        create: {
          name: peer.name,
          email: peer.email,
          passwordHash: defaultPasswordHash,
          role: 'STUDENT',
        },
      });

      const userScanCount = await prisma.wasteScan.count({ where: { userId: user.id } });
      if (userScanCount === 0) {
        for (const rep of peer.baseReports) {
          await prisma.wasteScan.create({
            data: {
              userId: user.id,
              detectedItem: rep.item,
              detectedCategory: rep.cat,
              confidenceScore: 0.94,
              finalBinRecommended: rep.bin,
              feedbackStatus: 'APPROVED',
              feedbackComment: JSON.stringify({
                location: 'Campus Academic Complex',
                notes: 'Verified cleanup report',
                pointsAwarded: rep.pts,
                pointsProposed: rep.pts,
                aiSuggestion: `Deposit into ${rep.bin.replace('_', ' ')} bin.`,
                status: 'APPROVED',
                adminNote: 'Auto-verified campus telemetry',
              }),
            },
          });
        }
      }
    }
  } catch (err) {
    console.warn('Campus student seeding skipped or already completed:', err);
  }
}

/**
 * Student submits a waste report query
 * It is pre-analyzed by AI and stored with status = PENDING.
 * Points are credited only when approved by an Admin!
 */
export async function submitWasteReport(input: SubmitReportInput): Promise<ReportResult> {
  const { userId, imageBase64, itemHint, location, notes, fileName, stationId } = input;

  // 1. Run AI vision & campus rule classifier
  const classification = await classifyWasteItem({
    imageBase64,
    itemHint,
    stationId,
    userId,
    fileName,
  });

  const rule = classification.rule;
  const isHazardous = rule?.isHazardous ?? false;
  const category = classification.detectedCategory;

  // 2. Compute points for this report (pending admin approval)
  const pointsProposed = calculateCategoryPoints(category, isHazardous);

  // 3. Create context-aware AI suggestion
  let suggestion = `Deposit into the ${classification.rule?.primaryBin.replace('_', ' ') || 'appropriate'} bin.`;
  if (isHazardous) {
    suggestion = `⚠️ Hazardous Item Detected! Do not discard into regular bins. Hand over at ${rule?.disposalLocation || 'designated hazardous collection'}.`;
  } else if (category === 'RECYCLABLE_DRY') {
    suggestion = `Rinse clean and place in the Blue Dry Recyclables Bin at ${location || rule?.disposalLocation || 'the nearest campus station'}.`;
  } else if (category === 'ORGANIC_WET') {
    suggestion = `Great for campus vermicomposting! Deposit into Green Wet Bin at ${location || 'the cafeteria quad'}.`;
  } else if (category === 'E_WASTE') {
    suggestion = `Valuable electronics recovered. Hand over at Yellow E-Waste Kiosk in Academic Block 2.`;
  }

  // 4. Update the created scan with PENDING status and full query metadata
  await prisma.wasteScan.update({
    where: { id: classification.scanId },
    data: {
      userId: userId || null,
      imageUrl: imageBase64 || null,
      feedbackStatus: 'PENDING',
      feedbackComment: JSON.stringify({
        location: location || 'Campus Grounds',
        notes: notes || '',
        pointsProposed,
        aiSuggestion: suggestion,
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
      }),
    },
  });

  // 5. Calculate student's current approved points
  let currentApprovedPoints = 0;
  if (userId) {
    const approvedScans = await prisma.wasteScan.findMany({
      where: { userId, feedbackStatus: 'APPROVED' },
    });
    currentApprovedPoints = approvedScans.reduce((sum, s) => {
      try {
        const parsed = s.feedbackComment ? JSON.parse(s.feedbackComment) : null;
        return sum + (parsed?.pointsAwarded || parsed?.pointsProposed || calculateCategoryPoints(s.detectedCategory));
      } catch {
        return sum + calculateCategoryPoints(s.detectedCategory);
      }
    }, 0);
  }

  return {
    scanId: classification.scanId,
    detectedItem: classification.detectedItem,
    category,
    pointsProposed,
    totalPoints: currentApprovedPoints,
    confidenceScore: classification.confidenceScore,
    aiSuggestion: suggestion,
    primaryBin: rule?.primaryBin || 'BLUE_RECYCLABLE',
    disposalLocation: rule?.disposalLocation || (location || 'Nearest Campus Bin Station'),
    prepInstructions: rule?.prepInstructions || ['Follow standard SVVV campus disposal guide.'],
    isHazardous,
    hazardousWarning: rule?.hazardousWarning || null,
    status: 'PENDING',
  };
}

/**
 * Fetch dynamic leaderboard and current student statistics
 */
export async function getLeaderboardAndStats(userId?: string): Promise<{
  userStats: UserEcoStats;
  leaderboard: StudentLeaderboardEntry[];
}> {
  await ensureCampusStudentsSeeded();

  // Find all students with their scans
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    include: {
      scans: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  // Resolve current student
  let currentStudentUser = userId ? students.find((s) => s.id === userId) : null;
  if (!currentStudentUser) {
    currentStudentUser = students.find((s) => s.email === 'student@svvv.in') || students[0];
  }

  // Calculate points for every student strictly from their approved scans
  const computedList = students.map((st) => {
    const approvedScans = st.scans.filter((s) => s.feedbackStatus === 'APPROVED');
    const pendingScans = st.scans.filter((s) => s.feedbackStatus === 'PENDING');

    const totalPoints = approvedScans.reduce((sum, s) => {
      try {
        const parsed = s.feedbackComment ? JSON.parse(s.feedbackComment) : null;
        return sum + (parsed?.pointsAwarded || parsed?.pointsProposed || calculateCategoryPoints(s.detectedCategory));
      } catch {
        return sum + calculateCategoryPoints(s.detectedCategory);
      }
    }, 0);

    // Department mapping
    let department = 'SVVV Student';
    if (st.email === 'student@svvv.in') department = 'Information Tech - 3rd Year';
    else if (st.email === 'diya@svvv.in') department = 'CSE - 3rd Year';
    else if (st.email === 'rohan@svvv.in') department = 'Mechanical - 4th Year';
    else if (st.email === 'sneha@svvv.in') department = 'Biotechnology - 2nd Year';
    else if (st.email === 'kabir@svvv.in') department = 'Electrical - 3rd Year';

    // Badge
    let badge = '🌱 Eco Scout';
    if (totalPoints >= 350) badge = '🥇 Campus EcoLeader';
    else if (totalPoints >= 250) badge = '🥈 Silver Recycler';
    else if (totalPoints >= 150) badge = '🥉 Bronze Sentinel';
    else if (totalPoints >= 70) badge = '🌿 Green Guardian';

    return {
      id: st.id,
      name: st.name || 'Campus Student',
      email: st.email,
      department,
      points: totalPoints,
      approvedReportsCount: approvedScans.length,
      pendingReportsCount: pendingScans.length,
      badge,
      isCurrentUser: currentStudentUser ? st.id === currentStudentUser.id : false,
      avatarColor:
        st.email === 'diya@svvv.in'
          ? 'from-amber-400 to-amber-600'
          : st.email === 'rohan@svvv.in'
            ? 'from-slate-400 to-slate-600'
            : st.email === 'sneha@svvv.in'
              ? 'from-amber-600 to-amber-800'
              : st.email === 'kabir@svvv.in'
                ? 'from-blue-500 to-indigo-600'
                : 'from-emerald-500 to-teal-600',
    };
  });

  // Sort descending by points
  const sorted = computedList.sort((a, b) => b.points - a.points);
  const leaderboard: StudentLeaderboardEntry[] = sorted.map((item, idx) => ({
    rank: idx + 1,
    id: item.id,
    name: item.name,
    department: item.department,
    points: item.points,
    reportsCount: item.approvedReportsCount,
    badge: item.badge,
    isCurrentUser: item.isCurrentUser,
    avatarColor: item.avatarColor,
  }));

  const userEntry = leaderboard.find((l) => l.isCurrentUser) || leaderboard[0];
  const currentStudentComputed = computedList.find((c) => c.isCurrentUser) || computedList[0];

  const userTotalPoints = currentStudentComputed ? currentStudentComputed.points : 0;

  // Levels calculation
  let level = 1;
  let levelTitle = 'Eco Scout';
  let nextLevelPoints = 100;
  let prevThreshold = 0;

  if (userTotalPoints >= 350) {
    level = 4;
    levelTitle = 'Sustainability Pioneer';
    nextLevelPoints = 600;
    prevThreshold = 350;
  } else if (userTotalPoints >= 200) {
    level = 3;
    levelTitle = 'Eco Champion';
    nextLevelPoints = 350;
    prevThreshold = 200;
  } else if (userTotalPoints >= 100) {
    level = 2;
    levelTitle = 'Green Guardian';
    nextLevelPoints = 200;
    prevThreshold = 100;
  }

  const levelProgressPct = Math.min(
    100,
    Math.max(0, Math.round(((userTotalPoints - prevThreshold) / (nextLevelPoints - prevThreshold)) * 100))
  );

  const userStats: UserEcoStats = {
    userId: currentStudentUser?.id || 'current-student',
    name: currentStudentUser?.name || 'Aarav Sharma (Student Ambassador)',
    email: currentStudentUser?.email || 'student@svvv.in',
    points: userTotalPoints,
    rank: userEntry ? userEntry.rank : 1,
    level,
    levelTitle,
    nextLevelPoints,
    levelProgressPct,
    approvedReportsCount: currentStudentComputed?.approvedReportsCount || 0,
    pendingReportsCount: currentStudentComputed?.pendingReportsCount || 0,
    badge: currentStudentComputed?.badge || '🌱 Eco Scout',
  };

  return {
    userStats,
    leaderboard,
  };
}

/**
 * Get submissions for a specific student
 */
export async function getStudentSubmissions(userId?: string) {
  if (!userId) {
    const studentUser = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
    if (studentUser) userId = studentUser.id;
  }

  if (!userId) return [];

  const scans = await prisma.wasteScan.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return scans.map((s) => {
    let parsed: any = {};
    try {
      parsed = s.feedbackComment ? JSON.parse(s.feedbackComment) : {};
    } catch {
      parsed = {};
    }

    return {
      id: s.id,
      detectedItem: s.detectedItem,
      category: s.detectedCategory,
      primaryBin: s.finalBinRecommended,
      imageUrl: s.imageUrl,
      status: (s.feedbackStatus as 'PENDING' | 'APPROVED' | 'REJECTED') || 'PENDING',
      pointsProposed: parsed.pointsProposed || calculateCategoryPoints(s.detectedCategory),
      pointsAwarded: parsed.pointsAwarded || (s.feedbackStatus === 'APPROVED' ? calculateCategoryPoints(s.detectedCategory) : 0),
      location: parsed.location || 'Campus Grounds',
      notes: parsed.notes || '',
      aiSuggestion: parsed.aiSuggestion || '',
      adminNote: parsed.adminNote || '',
      createdAt: s.createdAt,
    };
  });
}

/**
 * Fetch all reports for administration review
 */
export async function getAllAdminReports(statusFilter?: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED') {
  const whereClause: any = {};
  if (statusFilter && statusFilter !== 'ALL') {
    whereClause.feedbackStatus = statusFilter;
  }

  const scans = await prisma.wasteScan.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return scans.map((s) => {
    let parsed: any = {};
    try {
      parsed = s.feedbackComment ? JSON.parse(s.feedbackComment) : {};
    } catch {
      parsed = {};
    }

    return {
      id: s.id,
      studentName: s.user?.name || 'Anonymous Student',
      studentEmail: s.user?.email || 'student@svvv.in',
      detectedItem: s.detectedItem,
      category: s.detectedCategory,
      primaryBin: s.finalBinRecommended,
      imageUrl: s.imageUrl,
      confidenceScore: s.confidenceScore,
      status: (s.feedbackStatus as 'PENDING' | 'APPROVED' | 'REJECTED') || 'PENDING',
      pointsProposed: parsed.pointsProposed || calculateCategoryPoints(s.detectedCategory),
      pointsAwarded: parsed.pointsAwarded || (s.feedbackStatus === 'APPROVED' ? calculateCategoryPoints(s.detectedCategory) : 0),
      location: parsed.location || 'Campus Grounds',
      notes: parsed.notes || '',
      aiSuggestion: parsed.aiSuggestion || '',
      adminNote: parsed.adminNote || '',
      createdAt: s.createdAt,
    };
  });
}

/**
 * Admin action: Approve or Reject a report query
 */
export async function reviewWasteReport(params: {
  reportId: string;
  action: 'APPROVE' | 'REJECT';
  points?: number;
  adminNote?: string;
}) {
  const { reportId, action, points, adminNote } = params;

  const scan = await prisma.wasteScan.findUnique({
    where: { id: reportId },
    include: { user: true },
  });

  if (!scan) {
    throw new Error('Report not found');
  }

  let existingMeta: any = {};
  try {
    existingMeta = scan.feedbackComment ? JSON.parse(scan.feedbackComment) : {};
  } catch {
    existingMeta = {};
  }

  const finalPoints = points ?? (existingMeta.pointsProposed || calculateCategoryPoints(scan.detectedCategory));
  const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

  const updatedMeta = {
    ...existingMeta,
    status: newStatus,
    pointsAwarded: action === 'APPROVE' ? finalPoints : 0,
    adminNote: adminNote || (action === 'APPROVE' ? 'Approved by Campus Administrator' : 'Rejected by Campus Administrator'),
    reviewedAt: new Date().toISOString(),
  };

  const updated = await prisma.wasteScan.update({
    where: { id: reportId },
    data: {
      feedbackStatus: newStatus,
      feedbackComment: JSON.stringify(updatedMeta),
    },
  });

  return {
    success: true,
    scanId: updated.id,
    status: newStatus,
    pointsAwarded: action === 'APPROVE' ? finalPoints : 0,
    studentId: scan.userId,
    studentName: scan.user?.name,
  };
}
