import { prisma } from '../src/lib/db/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log("Seeding EcoSentinel database with campus rules, stations, and users...");

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
  console.log("✓ Campus verified:", campus.name);

  // 2. Ensure Users (Admin & Standard Student User)
  const adminPassword = await bcrypt.hash('admin', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@svvv.in' },
    update: {
      name: 'Campus Administrator',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
    create: {
      name: 'Campus Administrator',
      email: 'admin@svvv.in',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log("✓ Admin user verified:", admin.email);

  const studentPassword = await bcrypt.hash('student', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@svvv.in' },
    update: {
      name: 'Aarav Sharma (Student Ambassador)',
      passwordHash: studentPassword,
      role: 'USER',
    },
    create: {
      name: 'Aarav Sharma (Student Ambassador)',
      email: 'student@svvv.in',
      passwordHash: studentPassword,
      role: 'USER',
    },
  });
  console.log("✓ Campus Student user verified:", student.email);

  // 3. Ensure Campus Waste Stations
  const stations = [
    {
      id: 'SVVV-STATION-CAFE-01',
      name: 'Central Cafeteria Quad Station',
      location: 'Courtyard outside Main Dining Hall',
      availableBins: ['BLUE_RECYCLABLE', 'GREEN_ORGANIC', 'BLACK_LANDFILL'],
      hasEwasteDrop: false,
      hasBatteryDrop: true,
      qrCodeData: 'https://ecosentinel.svvv.in/scan?station=SVVV-STATION-CAFE-01',
    },
    {
      id: 'SVVV-STATION-ENGG-02',
      name: 'Academic Block 2 (CSE & IT Hub)',
      location: 'Ground Floor Atrium, near Innovation Hub',
      availableBins: ['BLUE_RECYCLABLE', 'GREEN_ORGANIC', 'YELLOW_EWASTE', 'BLACK_LANDFILL'],
      hasEwasteDrop: true,
      hasBatteryDrop: true,
      qrCodeData: 'https://ecosentinel.svvv.in/scan?station=SVVV-STATION-ENGG-02',
    },
    {
      id: 'SVVV-STATION-LIB-03',
      name: 'Central Library Main Entrance Kiosk',
      location: 'Library Foyer, East Wing Entrance',
      availableBins: ['BLUE_RECYCLABLE', 'YELLOW_EWASTE', 'RED_HAZARDOUS', 'BLACK_LANDFILL'],
      hasEwasteDrop: true,
      hasBatteryDrop: true,
      qrCodeData: 'https://ecosentinel.svvv.in/scan?station=SVVV-STATION-LIB-03',
    },
    {
      id: 'SVVV-STATION-SCI-04',
      name: 'Science & Chemistry Complex Station',
      location: 'Science Block Ground Floor Lab Entrance',
      availableBins: ['BLUE_RECYCLABLE', 'GREEN_ORGANIC', 'RED_HAZARDOUS', 'BLACK_LANDFILL'],
      hasEwasteDrop: false,
      hasBatteryDrop: true,
      qrCodeData: 'https://ecosentinel.svvv.in/scan?station=SVVV-STATION-SCI-04',
    },
  ];

  for (const st of stations) {
    await prisma.wasteStation.upsert({
      where: { id: st.id },
      update: st,
      create: st,
    });
  }
  console.log(`✓ Seeded ${stations.length} campus waste stations.`);

  // 4. Ensure Authoritative SVVV Campus Waste Disposal Rules
  const rules = [
    {
      itemName: 'Single-use Paper / Coffee Cup',
      aliases: ['coffee cup', 'tea cup', 'paper cup', 'disposable cup', 'chai cup', 'starbucks cup', 'cafe cup', 'paper cup with lid'],
      category: 'LANDFILL_RESIDUAL' as const,
      primaryBin: 'BLACK_LANDFILL' as const,
      material: 'Polyethylene (PE)-lined paperboard',
      prepInstructions: [
        'Empty all leftover liquid into a sink or drain before disposing.',
        'Remove the plastic lid: plastic lids (PP #5 / PS #6) go separately into the Blue Dry Recyclables Bin.',
        'Standard takeaway paper cups have a thin plastic coating inside to prevent leaks; they cannot be pulped into recycled paper.',
        'If verified 100% uncoated compostable or certified PLA, deposit into Green Organic Bin.',
      ],
      disposalLocation: 'Campus Quad Bin Station - Black General / Landfill Bin',
      isHazardous: false,
      hazardousWarning: null,
      requiresClarification: true,
      clarificationQuestion: 'Does this cup have a shiny interior plastic lining, or is it certified 100% uncoated compostable?',
      clarificationOptions: [
        {
          id: 'lined',
          label: 'Shiny plastic or wax lining inside (Standard takeaway)',
          destinationBin: 'BLACK_LANDFILL',
          note: 'SVVV paper pulping partner cannot dissolve plastic linings. Must be placed in Black Landfill Bin.',
        },
        {
          id: 'compostable',
          label: '100% uncoated paper / certified compostable PLA',
          destinationBin: 'GREEN_ORGANIC',
          note: 'Acceptable in Green Organic Bin for the SVVV campus vermicomposting pit.',
        },
        {
          id: 'plastic_cup',
          label: 'Clear recyclable plastic cup (PET #1 / PP #5)',
          destinationBin: 'BLUE_RECYCLABLE',
          note: 'Rinse liquid clean and place in Blue Dry Recyclables Bin.',
        },
      ],
      searchKeywords: ['coffee', 'tea', 'cup', 'chai', 'disposable', 'paper cup', 'beverage', 'drink'],
    },
    {
      itemName: 'Lithium-Ion & Household Batteries',
      aliases: ['battery', 'batteries', 'aa battery', 'aaa battery', 'lithium battery', 'laptop battery', 'cell', 'power bank', 'button cell'],
      category: 'HAZARDOUS' as const,
      primaryBin: 'RED_HAZARDOUS' as const,
      material: 'Heavy metals (Lithium, Nickel, Cadmium, Cobalt, Lead)',
      prepInstructions: [
        'NEVER place batteries in standard Blue, Green, or Black bins.',
        'Tape exposed metal terminals with insulating Scotch or electrical tape to prevent friction sparks.',
        'Keep separate from damp items and metallic paperclips.',
        'Deposit in designated Red Battery Drop Stations across campus.',
      ],
      disposalLocation: 'SVVV Central Library Kiosk - Battery Drop Box (Ground Floor) or Dept of Electrical Engg Lab 102',
      isHazardous: true,
      hazardousWarning: 'CRITICAL FIRE & CHEMICAL HAZARD: Crushed batteries can trigger thermal runaway fires in campus garbage compactors and leach neurotoxic heavy metals. Deposit exclusively at designated battery collection boxes.',
      requiresClarification: false,
      clarificationQuestion: null,
      clarificationOptions: null,
      searchKeywords: ['battery', 'batteries', 'cell', 'lithium', 'powerbank', 'rechargeable', 'fire', 'hazard', 'hazardous'],
    },
    {
      itemName: 'Electronic Waste & Peripheral Cables',
      aliases: ['cable', 'charger', 'e-waste', 'electronics', 'circuit board', 'mouse', 'keyboard', 'headphones', 'adapter', 'usb cable', 'pcb', 'wire', 'phone charger'],
      category: 'E_WASTE' as const,
      primaryBin: 'YELLOW_EWASTE' as const,
      material: 'Copper wire, PVC elastomer, printed circuit boards, electronic solder',
      prepInstructions: [
        'Bundle loose cords and cables neatly with a rubber band or twist tie.',
        'Remove any rechargeable batteries first and deposit them in the Red Battery box.',
        'Ensure electronic equipment is disconnected from power sources.',
        'Collected periodically for certified R2-standard campus e-waste recycling.',
      ],
      disposalLocation: 'SVVV Academic Block 2 (CSE Dept E-Waste Bin) or Central Library East Wing',
      isHazardous: true,
      hazardousWarning: 'CONTAINS TOXIC SOLDER & LEAD: Electronic components contain toxic heavy metals and require certified dismantlers. Never discard into regular trash.',
      requiresClarification: false,
      clarificationQuestion: null,
      clarificationOptions: null,
      searchKeywords: ['cable', 'charger', 'ewaste', 'e-waste', 'usb', 'wire', 'laptop', 'mouse', 'keyboard', 'phone'],
    },
    {
      itemName: 'Plastic Beverage Bottle (PET #1)',
      aliases: ['plastic bottle', 'water bottle', 'soda bottle', 'coke bottle', 'pet bottle', 'mineral water', 'soft drink bottle'],
      category: 'RECYCLABLE_DRY' as const,
      primaryBin: 'BLUE_RECYCLABLE' as const,
      material: 'Polyethylene Terephthalate (PETE #1)',
      prepInstructions: [
        'Empty all leftover liquid contents completely.',
        'Lightly crush the bottle to conserve volume inside campus collection bins.',
        'Screw the plastic cap back on (caps are recovered alongside the bottle during processing).',
        'Place in the Blue Dry Recyclables Bin.',
      ],
      disposalLocation: 'Blue Dry Recyclables Bin (All Quad Stations)',
      isHazardous: false,
      hazardousWarning: null,
      requiresClarification: false,
      clarificationQuestion: null,
      clarificationOptions: null,
      searchKeywords: ['bottle', 'plastic', 'water', 'pet', 'soda', 'coke', 'drink'],
    },
    {
      itemName: 'Food Scraps, Peels & Organic Waste',
      aliases: ['food scraps', 'banana peel', 'apple core', 'leftover food', 'roti', 'rice', 'organic waste', 'fruit peel', 'tea leaves', 'canteen waste'],
      category: 'ORGANIC_WET' as const,
      primaryBin: 'GREEN_ORGANIC' as const,
      material: '100% Biodegradable organic matter',
      prepInstructions: [
        'Strip off any plastic wrappers, plastic stickers on fruit, or toothpicks.',
        'Drain off excess runny gravies into cafeteria drain traps.',
        'Deposit into Green Wet Waste Bin for SVVV on-campus vermicomposting.',
      ],
      disposalLocation: 'Green Organic / Wet Waste Bin (Cafeteria & Dining areas)',
      isHazardous: false,
      hazardousWarning: null,
      requiresClarification: false,
      clarificationQuestion: null,
      clarificationOptions: null,
      searchKeywords: ['food', 'fruit', 'vegetable', 'peel', 'banana', 'lunch', 'canteen', 'organic', 'wet'],
    },
    {
      itemName: 'Pizza Box & Food Cardboard',
      aliases: ['pizza box', 'greasy box', 'takeout box', 'food cardboard', 'dominos box', 'burger box'],
      category: 'LANDFILL_RESIDUAL' as const,
      primaryBin: 'BLACK_LANDFILL' as const,
      material: 'Corrugated cardboard with grease & cheese residue',
      prepInstructions: [
        'Inspect the box: Clean, grease-free portions can be torn off and placed in the Blue Bin.',
        'Sections contaminated with cheese, butter, or tomato oil cannot be recycled and must go to the Black Bin.',
        'Remove plastic sauce cups, plastic tripods, and parchment liners.',
      ],
      disposalLocation: 'Campus Quad Bin Station',
      isHazardous: false,
      hazardousWarning: null,
      requiresClarification: true,
      clarificationQuestion: 'Is this pizza box stained with grease, oil, or food cheese?',
      clarificationOptions: [
        {
          id: 'greasy',
          label: 'Greasy / Food Stained',
          destinationBin: 'BLACK_LANDFILL',
          note: 'Food grease ruins the paper pulping slurry. Must be disposed in the Black Landfill Bin.',
        },
        {
          id: 'clean',
          label: 'Clean & Dry (No food oil)',
          destinationBin: 'BLUE_RECYCLABLE',
          note: 'Flatten clean cardboard and deposit into Blue Dry Recyclables Bin.',
        },
      ],
      searchKeywords: ['pizza', 'box', 'cardboard', 'greasy', 'dominos', 'takeout', 'food'],
    },
    {
      itemName: 'Aluminum Beverage Can',
      aliases: ['soda can', 'coke can', 'aluminum can', 'tin can', 'cold drink can', 'pepsi can', 'red bull can'],
      category: 'RECYCLABLE_DRY' as const,
      primaryBin: 'BLUE_RECYCLABLE' as const,
      material: '100% Recyclable Aluminum',
      prepInstructions: [
        'Pour out any leftover beverage drops.',
        'Leave the metal pull tab attached to the can.',
        'Crush flat if bin is full to save space.',
        'Deposit into Blue Dry Recyclables Bin.',
      ],
      disposalLocation: 'Blue Dry Recyclables Bin (All Stations)',
      isHazardous: false,
      hazardousWarning: null,
      requiresClarification: false,
      clarificationQuestion: null,
      clarificationOptions: null,
      searchKeywords: ['can', 'tin', 'aluminum', 'soda', 'coke', 'pepsi', 'drink'],
    },
    {
      itemName: 'Laboratory Chemicals & Solvents',
      aliases: ['chemical', 'acid', 'solvent', 'reagent', 'lab waste', 'broken test tube', 'beaker', 'toxic liquid'],
      category: 'HAZARDOUS' as const,
      primaryBin: 'RED_HAZARDOUS' as const,
      material: 'Hazardous chemicals & contaminated lab glass',
      prepInstructions: [
        'DO NOT DISPOSE IN GENERAL CAMPUS TRASH BINS OR POUR DOWN DRAINS.',
        'Seal in airtight, secondary containment container with GHS hazard label.',
        'Hand over directly to the SVVV Chemistry / Biotechnology Lab Waste Manager.',
      ],
      disposalLocation: 'Science Complex Lab A-04 Chemical Waste Storage Room',
      isHazardous: true,
      hazardousWarning: 'ACUTE TOXICITY & CORROSIVE HAZARD: Severe risk to sanitation staff and groundwater contamination. Must follow strict lab safety manifest protocol.',
      requiresClarification: false,
      clarificationQuestion: null,
      clarificationOptions: null,
      searchKeywords: ['chemical', 'acid', 'lab', 'reagent', 'solvent', 'hazardous', 'toxic'],
    },
    {
      itemName: 'Styrofoam / Thermocol Container',
      aliases: ['styrofoam', 'thermocol', 'foam container', 'polystyrene box', 'packaging foam'],
      category: 'LANDFILL_RESIDUAL' as const,
      primaryBin: 'BLACK_LANDFILL' as const,
      material: 'Expanded Polystyrene (EPS #6)',
      prepInstructions: [
        'Wipe out food debris.',
        'Cannot be economically recycled by campus municipal recyclers.',
        'Break down into small pieces and place into Black Landfill Bin.',
      ],
      disposalLocation: 'Black Landfill Bin',
      isHazardous: false,
      hazardousWarning: null,
      requiresClarification: false,
      clarificationQuestion: null,
      clarificationOptions: null,
      searchKeywords: ['styrofoam', 'thermocol', 'foam', 'packaging', 'polystyrene'],
    },
    {
      itemName: 'Clean Glass Bottle & Jar',
      aliases: ['glass bottle', 'jam jar', 'glass jar', 'sauce bottle', 'beverage glass'],
      category: 'RECYCLABLE_DRY' as const,
      primaryBin: 'BLUE_RECYCLABLE' as const,
      material: '100% Recyclable Silica Glass',
      prepInstructions: [
        'Rinse with water to remove food/sugar residue.',
        'Remove metal lid (dispose metal lid in Blue Bin separately).',
        'If the glass is broken into sharp shards, wrap securely in cardboard or newspaper before disposal.',
      ],
      disposalLocation: 'Blue Dry Recyclables Bin',
      isHazardous: false,
      hazardousWarning: null,
      requiresClarification: false,
      clarificationQuestion: null,
      clarificationOptions: null,
      searchKeywords: ['glass', 'jar', 'bottle', 'sauce', 'glassware'],
    },
    {
      itemName: 'Fluorescent Tube Light & CFL Bulb',
      aliases: ['tube light', 'cfl', 'fluorescent bulb', 'mercury bulb', 'light bulb'],
      category: 'HAZARDOUS' as const,
      primaryBin: 'RED_HAZARDOUS' as const,
      material: 'Mercury vapor, phosphor coating, glass tube',
      prepInstructions: [
        'Handle with extreme care to avoid shattering.',
        'Place inside the original cardboard protective sleeve if available.',
        'Do not drop into standard bins.',
        'Hand over to Campus Maintenance Depot.',
      ],
      disposalLocation: 'Campus Facilities Maintenance Depot - Hazardous Lighting Crate',
      isHazardous: true,
      hazardousWarning: 'CONTAINS TOXIC MERCURY VAPOR: Inhalation of mercury powder from broken bulbs poses serious neurological health risks. Hand over intact to maintenance staff.',
      requiresClarification: false,
      clarificationQuestion: null,
      clarificationOptions: null,
      searchKeywords: ['bulb', 'tube', 'cfl', 'mercury', 'light', 'fluorescent', 'hazard'],
    },
    {
      itemName: 'Polythene Bags & Thin Plastic Film (LDPE / HDPE)',
      aliases: ['polythin', 'polythene', 'polythene bag', 'plastic bag', 'carry bag', 'shopping bag', 'poly bag', 'cling film', 'bubble wrap', 'plastic pouch'],
      category: 'LANDFILL_RESIDUAL' as const,
      primaryBin: 'BLACK_LANDFILL' as const,
      material: 'Low-Density Polyethylene (LDPE #4) / HDPE #2 thin film',
      prepInstructions: [
        'Do NOT place loose polythene bags in the Blue Dry Recycling bin (they jam conveyor rollers at campus sorting facilities).',
        'If the bag is clean and tear-free, save it for shopping, book covers, or reuse.',
        'Deposit single, torn, or dirty polythene bags into the Black Landfill Bin.',
        'If SVVV Green Tech hosts a plastic film drive, bundle 20+ dry bags into one single bag before dropping.',
      ],
      disposalLocation: 'Black Landfill Bin (or Dedicated Film Recycling Station)',
      isHazardous: false,
      hazardousWarning: null,
      requiresClarification: true,
      clarificationQuestion: 'Is this polythene bag clean and dry, or contaminated with food / oil?',
      clarificationOptions: [
        {
          id: 'clean_film',
          label: 'Clean, dry, stretchy carry bag',
          destinationBin: 'BLACK_LANDFILL',
          note: 'Not allowed in campus commingled blue bins due to machine entanglement. Dispose in Black Bin unless dedicated film box is present.',
        },
        {
          id: 'soiled_poly',
          label: 'Soiled with food, grease, or liquids',
          destinationBin: 'BLACK_LANDFILL',
          note: 'Contaminated thin film cannot be recycled. Dispose in Black Landfill Bin.',
        },
      ],
      searchKeywords: ['polythin', 'polythene', 'plastic bag', 'carry bag', 'polybag', 'plastic wrap', 'film', 'shopping bag'],
    },
    {
      itemName: 'Stainless Steel Water Bottle & Metal Flask',
      aliases: ['steal water bottel', 'steel bottle', 'steel water bottle', 'metal bottle', 'thermos', 'metal flask', 'stainless steel bottle', 'milton bottle', 'sipper'],
      category: 'RECYCLABLE_DRY' as const,
      primaryBin: 'BLUE_RECYCLABLE' as const,
      material: 'Food-grade Stainless Steel (SS 304 / 316)',
      prepInstructions: [
        'Empty all leftover water or beverage completely.',
        'Pry out any silicone or rubber leak-proof gasket rings from the lid (gaskets go into Black Bin).',
        'Stainless steel bottles are 100% recyclable high-value metals.',
        'If intact and functional, consider donating to the SVVV Student Lost & Found / Reuse Center instead of binning.',
      ],
      disposalLocation: 'Blue Dry Recyclables Bin or Campus Material Recovery Center',
      isHazardous: false,
      hazardousWarning: null,
      requiresClarification: false,
      clarificationQuestion: null,
      clarificationOptions: null,
      searchKeywords: ['steel', 'metal', 'flask', 'thermos', 'milton', 'stainless', 'bottle', 'steal'],
    },
    {
      itemName: 'Ballpoint Pens, Gel Pens & Markers',
      aliases: ['pen', 'pens', 'ballpoint pen', 'gel pen', 'marker', 'sketch pen', 'highlighter', 'refill', 'fountain pen', 'use and throw pen'],
      category: 'LANDFILL_RESIDUAL' as const,
      primaryBin: 'BLACK_LANDFILL' as const,
      material: 'Mixed multi-polymers (Polystyrene barrel, tungsten carbide ball, brass tip, oily ink)',
      prepInstructions: [
        'Due to fused mixed materials and ink residue, single-use pens cannot be mechanically recycled curbside.',
        'Separate metal pocket clips if easily detachable (metal clip goes in Blue Bin).',
        'Place empty pen bodies in Black Landfill bin.',
        'Consider purchasing refillable fountain pens or refill cartridges for campus work.',
      ],
      disposalLocation: 'Black Landfill Bin',
      isHazardous: false,
      hazardousWarning: null,
      requiresClarification: false,
      clarificationQuestion: null,
      clarificationOptions: null,
      searchKeywords: ['pen', 'pens', 'marker', 'sketch', 'highlighter', 'refill', 'ballpen', 'gelpen', 'stationery'],
    },
    {
      itemName: 'Wooden Pencils & Pencil Sharpenings',
      aliases: ['pencil', 'pencils', 'wooden pencil', 'graphite pencil', 'colored pencil', 'pencil shavings', 'lead pencil', 'apsara pencil', 'natraj pencil'],
      category: 'ORGANIC_WET' as const,
      primaryBin: 'GREEN_ORGANIC' as const,
      material: 'Natural cedar wood and non-toxic graphite clay core',
      prepInstructions: [
        'Pencil shavings from sharpeners are 100% natural wood and graphite: deposit into Green Organic Bin.',
        'For pencil stubs with metal ferrule and pink rubber eraser, pull off the metal ferrule and eraser before composting the wooden stub.',
        'Metal ferrule goes into Blue Bin, rubber eraser into Black Bin.',
      ],
      disposalLocation: 'Green Organic Bin (for shavings/wood) or Black Bin (if composite with eraser)',
      isHazardous: false,
      hazardousWarning: null,
      requiresClarification: true,
      clarificationQuestion: 'Are you disposing of pencil shavings/pure wood, or a full pencil with metal ferrule and rubber eraser?',
      clarificationOptions: [
        {
          id: 'shavings',
          label: 'Pencil shavings / 100% wooden body',
          destinationBin: 'GREEN_ORGANIC',
          note: 'Compostable organic matter. Great for SVVV campus soil aeration.',
        },
        {
          id: 'with_eraser',
          label: 'Stub with metal clamp & rubber eraser',
          destinationBin: 'BLACK_LANDFILL',
          note: 'Mixed rubber and metal composite. Place in Black Bin or pry off eraser.',
        },
      ],
      searchKeywords: ['pencil', 'pencils', 'wood', 'graphite', 'shavings', 'stationery', 'eraser', 'lead'],
    },
    {
      itemName: 'Small & Large Electrical Appliances',
      aliases: ['electronic appliance', 'electrical appliance', 'kettle', 'electric kettle', 'toaster', 'iron', 'hair dryer', 'microwave', 'fan', 'heater', 'monitor', 'printer', 'computer', 'appliance', 'appliances'],
      category: 'E_WASTE' as const,
      primaryBin: 'YELLOW_EWASTE' as const,
      material: 'Copper motor windings, heating coils, flame-retardant ABS, electronic PCB',
      prepInstructions: [
        'Unplug from wall outlet and wrap the power cable securely around the appliance.',
        'Do NOT smash, dismantle, or place inside campus outdoor quad bins.',
        'Bring to SVVV Central Workshop or Academic Block 2 E-Waste Depot.',
      ],
      disposalLocation: 'SVVV Academic Block 2 Ground Floor E-Waste Kiosk or Central Engineering Workshop',
      isHazardous: true,
      hazardousWarning: 'ELECTRONIC APPLIANCE DISPOSAL PROTOCOL: Contains electronic boards, heavy metals, and recyclable copper coils. Strict university e-waste protocol requires logging at campus workshop.',
      requiresClarification: false,
      clarificationQuestion: null,
      clarificationOptions: null,
      searchKeywords: ['appliance', 'kettle', 'toaster', 'iron', 'heater', 'microwave', 'electronics', 'gadget', 'machine'],
    },
    {
      itemName: 'Scrap Metals, Utensils, Foil & Hardware',
      aliases: ['matels', 'metal', 'metals', 'steel spoon', 'metal utensil', 'aluminum foil', 'screw', 'nut', 'bolt', 'metal rod', 'tin', 'key', 'wire mesh', 'brass'],
      category: 'RECYCLABLE_DRY' as const,
      primaryBin: 'BLUE_RECYCLABLE' as const,
      material: 'High-grade ferrous and non-ferrous metals (Steel, Aluminum, Brass, Copper)',
      prepInstructions: [
        'Wipe away food oils from foil or utensils.',
        'Crumple clean aluminum foil into a ball (at least golf-ball size) so it doesn\'t get lost in sorting.',
        'Place in Blue Dry Recyclables Bin.',
      ],
      disposalLocation: 'Blue Dry Recyclables Bin',
      isHazardous: false,
      hazardousWarning: null,
      requiresClarification: false,
      clarificationQuestion: null,
      clarificationOptions: null,
      searchKeywords: ['metal', 'metals', 'matel', 'matels', 'steel', 'aluminum', 'foil', 'spoon', 'utensil', 'screw', 'iron', 'brass'],
    },
    {
      itemName: 'Rigid Plastics, Containers & Disposable Cutlery',
      aliases: ['plastic', 'plastics', 'plastic container', 'tupperware', 'plastic plate', 'plastic spoon', 'plastic fork', 'plastic box', 'takeaway container', 'pp box', 'tiffin'],
      category: 'RECYCLABLE_DRY' as const,
      primaryBin: 'BLUE_RECYCLABLE' as const,
      material: 'Polypropylene (PP #5) / High-Density Polyethylene (HDPE #2)',
      prepInstructions: [
        'Rinse food gravy or oil with a small amount of water.',
        'Dry lightly before binning (damp containers cause odor in dry recycling).',
        'Place in Blue Dry Recyclables Bin.',
      ],
      disposalLocation: 'Blue Dry Recyclables Bin',
      isHazardous: false,
      hazardousWarning: null,
      requiresClarification: false,
      clarificationQuestion: null,
      clarificationOptions: null,
      searchKeywords: ['plastic', 'plastics', 'container', 'tiffin', 'cutlery', 'spoon', 'plate', 'box', 'pp'],
    },
    {
      itemName: 'Notebooks, Office Paper & Exam Sheets',
      aliases: ['paper', 'notebook', 'book', 'exam sheet', 'white paper', 'loose sheets', 'newspaper', 'magazine', 'flyer', 'document'],
      category: 'RECYCLABLE_DRY' as const,
      primaryBin: 'BLUE_RECYCLABLE' as const,
      material: '100% Recyclable Cellulose Wood Pulp',
      prepInstructions: [
        'Remove plastic covers, spiral metal bindings, or plastic folders.',
        'Keep clean and dry (wet paper molds and cannot be recycled).',
        'Stack flat and deposit in Blue Dry Recyclables Bin.',
      ],
      disposalLocation: 'Blue Dry Recyclables Bin',
      isHazardous: false,
      hazardousWarning: null,
      requiresClarification: false,
      clarificationQuestion: null,
      clarificationOptions: null,
      searchKeywords: ['paper', 'notebook', 'book', 'sheet', 'newspaper', 'document', 'printout'],
    },
  ];

  for (const rule of rules) {
    const data: any = {
      ...rule,
      clarificationOptions: rule.clarificationOptions ?? undefined,
    };
    await prisma.wasteRule.upsert({
      where: { itemName: rule.itemName },
      update: data,
      create: data,
    });
  }
  console.log(`✓ Seeded ${rules.length} authoritative SVVV campus waste disposal rules.`);

  console.log("\n=================================================");
  console.log("🎉 Database seeding completed successfully!");
  console.log("Users available:");
  console.log("  • Admin:   admin@svvv.in / admin (Role: ADMIN)");
  console.log("  • Student: student@svvv.in / student (Role: USER)");
  console.log("=================================================");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
