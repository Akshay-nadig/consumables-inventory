// Seed Data for Company Consumables Inventory Management System
// 16 Exact Categories from image + Realistic items (<5 items each) + Transaction History
// Realistic Indian Rupee (INR ₹) valuations

export const SEED_CATEGORIES = [
  { id: 1, name: "IT Spares", code: "CAT-IT", description: "Replacement computer peripherals, cables, and adapters", icon: "Cpu" },
  { id: 2, name: "Electronic Gadgets", code: "CAT-EG", description: "Workplace gadgets, presentation remotes, and batteries", icon: "Smartphone" },
  { id: 3, name: "Network Related Materials", code: "CAT-NET", description: "Ethernet patch cables, RJ45 connectors, and ties", icon: "Network" },
  { id: 4, name: "Toner Cartridge for Printers", code: "CAT-TONER", description: "Toner cartridges and drums for office printers", icon: "Printer" },
  { id: 5, name: "Stationery Items", code: "CAT-STAT", description: "General office desk stationery and paper supplies", icon: "FileText" },
  { id: 6, name: "Printed Stationery Items", code: "CAT-PSTAT", description: "Letterheads, visitor pass books, and branded cards", icon: "BookOpen" },
  { id: 7, name: "Electrical Spare Parts", code: "CAT-ELEC", description: "LED tubes, switches, plugs, and insulation materials", icon: "Zap" },
  { id: 8, name: "Plumbing Spare Parts", code: "CAT-PLUMB", description: "Teflon tapes, connectors, washers, and valves", icon: "Wrench" },
  { id: 9, name: "Furniture & Fitting Spare Parts", code: "CAT-FURN", description: "Casters, chair gas lifts, screws, and hinges", icon: "Armchair" },
  { id: 10, name: "Gift Articles", code: "CAT-GIFT", description: "Corporate welcome gifts, mugs, and executive packs", icon: "Gift" },
  { id: 11, name: "Reference Books & Project Reports", code: "CAT-BOOK", description: "Standards manuals, policy books, and reports", icon: "Book" },
  { id: 12, name: "Event Related Materials", code: "CAT-EVENT", description: "Lanyards, roll-up banners, and exhibition tags", icon: "Calendar" },
  { id: 13, name: "Health & First Aid Equipments", code: "CAT-FIRSTAID", description: "First aid kits, sanitizers, bandages, and monitors", icon: "HeartPulse" },
  { id: 14, name: "Office Equipments", code: "CAT-OFEQUIP", description: "Laminating sheets, punchers, and whiteboard care", icon: "Briefcase" },
  { id: 15, name: "Housekeeping Materials", code: "CAT-HOUSE", description: "Disinfectants, microfiber wipes, and bin liners", icon: "Sparkles" },
  { id: 16, name: "Cutlery Set", code: "CAT-CUTLERY", description: "Pantry paper cups, wooden cutlery, and pantry mugs", icon: "Coffee" }
];

export const SEED_MATERIALS = [
  // 1. IT Spares
  { id: 1, itemCode: "CON-IT-001", name: "USB-C to HDMI Display Adapter", categoryId: 1, description: "4K 60Hz compatible display dongle for workstations", unitOfMeasure: "Pcs", currentStock: 18, minimumReorderLevel: 5, unitPrice: 1450.00, storageLocation: "IT Rack A-01" },
  { id: 2, itemCode: "CON-IT-002", name: "Wireless Optical Mouse (Quiet Click)", categoryId: 1, description: "Standard 2.4GHz USB dongle ergonomic mouse", unitOfMeasure: "Pcs", currentStock: 25, minimumReorderLevel: 8, unitPrice: 650.00, storageLocation: "IT Rack A-02" },
  { id: 3, itemCode: "CON-IT-003", name: "Thermal Heatsink Paste 4g Tube", categoryId: 1, description: "High conductivity CPU cooling compound", unitOfMeasure: "Tube", currentStock: 4, minimumReorderLevel: 6, unitPrice: 420.00, storageLocation: "IT Rack A-03" },

  // 2. Electronic Gadgets
  { id: 4, itemCode: "CON-EG-001", name: "Wireless Presentation Clicker Remote", categoryId: 2, description: "Laser pointer remote with USB receiver for conference rooms", unitOfMeasure: "Pcs", currentStock: 12, minimumReorderLevel: 4, unitPrice: 1850.00, storageLocation: "Cabinet E-01" },
  { id: 5, itemCode: "CON-EG-002", name: "USB 3.0 Flash Drive 64GB", categoryId: 2, description: "Encrypted hardware ready portable flash drive", unitOfMeasure: "Pcs", currentStock: 30, minimumReorderLevel: 10, unitPrice: 550.00, storageLocation: "Cabinet E-02" },
  { id: 6, itemCode: "CON-EG-003", name: "AAA Alkaline Batteries 4-Pack", categoryId: 2, description: "Long-life power cells for remote controls and accessories", unitOfMeasure: "Pack", currentStock: 3, minimumReorderLevel: 10, unitPrice: 160.00, storageLocation: "Cabinet E-03" },

  // 3. Network Related Materials
  { id: 7, itemCode: "CON-NET-001", name: "Cat6 Snagless Patch Cable 2m (Blue)", categoryId: 3, description: "High speed gigabit patch cord for desk connectivity", unitOfMeasure: "Pcs", currentStock: 65, minimumReorderLevel: 20, unitPrice: 180.00, storageLocation: "Network Bay 1" },
  { id: 8, itemCode: "CON-NET-002", name: "RJ45 Modular Plug Connectors (100-Pack)", categoryId: 3, description: "Gold plated 8P8C pass-through crimp connectors", unitOfMeasure: "Box", currentStock: 8, minimumReorderLevel: 3, unitPrice: 450.00, storageLocation: "Network Bay 2" },
  { id: 9, itemCode: "CON-NET-003", name: "Hook & Loop Velcro Cable Roll 5m", categoryId: 3, description: "Reusable wire management tidy wrap", unitOfMeasure: "Roll", currentStock: 22, minimumReorderLevel: 5, unitPrice: 280.00, storageLocation: "Network Bay 3" },

  // 4. Toner Cartridge for Printers
  { id: 10, itemCode: "CON-TON-001", name: "HP LaserJet Black Toner 85A", categoryId: 4, description: "Standard black toner cartridge yield 1600 pages", unitOfMeasure: "Cartridge", currentStock: 6, minimumReorderLevel: 4, unitPrice: 3850.00, storageLocation: "Print Supply Room 1" },
  { id: 11, itemCode: "CON-TON-002", name: "Canon Color Cyan Toner Cartridge 054", categoryId: 4, description: "High yield cyan toner for marketing floor laser printer", unitOfMeasure: "Cartridge", currentStock: 2, minimumReorderLevel: 3, unitPrice: 4200.00, storageLocation: "Print Supply Room 2" },
  { id: 12, itemCode: "CON-TON-003", name: "Xerox Waste Toner Recovery Box", categoryId: 4, description: "Replacement excess toner container unit", unitOfMeasure: "Unit", currentStock: 5, minimumReorderLevel: 2, unitPrice: 1400.00, storageLocation: "Print Supply Room 3" },

  // 5. Stationery Items
  { id: 13, itemCode: "CON-STA-001", name: "Ballpoint Pens Blue 0.7mm (Box of 50)", categoryId: 5, description: "Smooth flow executive office ballpoint writing pens", unitOfMeasure: "Box", currentStock: 14, minimumReorderLevel: 5, unitPrice: 350.00, storageLocation: "Stationery Bin 101" },
  { id: 14, itemCode: "CON-STA-002", name: "Yellow Sticky Notes 3x3 (12-Pads Pack)", categoryId: 5, description: "Self-adhesive reminder notes 100 sheets each pad", unitOfMeasure: "Pack", currentStock: 28, minimumReorderLevel: 8, unitPrice: 280.00, storageLocation: "Stationery Bin 102" },
  { id: 15, itemCode: "CON-STA-003", name: "Standard Stapler Pins No. 10 (Box of 1000)", categoryId: 5, description: "Heavy zinc coated steel wire staples", unitOfMeasure: "Box", currentStock: 45, minimumReorderLevel: 15, unitPrice: 45.00, storageLocation: "Stationery Bin 103" },

  // 6. Printed Stationery Items
  { id: 16, itemCode: "CON-PST-001", name: "Corporate Letterhead A4 100GSM (Ream 500)", categoryId: 6, description: "Watermarked official embossed company letterhead sheets", unitOfMeasure: "Ream", currentStock: 15, minimumReorderLevel: 5, unitPrice: 750.00, storageLocation: "Print Archive Shelf A" },
  { id: 17, itemCode: "CON-PST-002", name: "Security Visitor Badges (Pack of 50)", categoryId: 6, description: "Pre-printed sequential number reception passes", unitOfMeasure: "Pack", currentStock: 9, minimumReorderLevel: 3, unitPrice: 480.00, storageLocation: "Front Desk Cabinet" },
  { id: 18, itemCode: "CON-PST-003", name: "Finance Payment Voucher Books (100 Sheets)", categoryId: 6, description: "Duplicate numbered carbonless expense vouchers", unitOfMeasure: "Book", currentStock: 20, minimumReorderLevel: 6, unitPrice: 120.00, storageLocation: "Finance Records Room" },

  // 7. Electrical Spare Parts
  { id: 19, itemCode: "CON-ELE-001", name: "LED Tube Light 18W T8 4ft Cool White", categoryId: 7, description: "Energy efficient ceiling replacement tube", unitOfMeasure: "Pcs", currentStock: 16, minimumReorderLevel: 6, unitPrice: 240.00, storageLocation: "Maintenance Room B" },
  { id: 20, itemCode: "CON-ELE-002", name: "Universal 3-Pin Power Plug Top 16A", categoryId: 7, description: "Heavy duty polycarbonate grounded mains plug", unitOfMeasure: "Pcs", currentStock: 35, minimumReorderLevel: 10, unitPrice: 95.00, storageLocation: "Maintenance Room B" },
  { id: 21, itemCode: "CON-ELE-003", name: "PVC Electrical Insulation Tape (Pack of 5)", categoryId: 7, description: "Fire retardant grade multi-colored wiring tape", unitOfMeasure: "Pack", currentStock: 19, minimumReorderLevel: 5, unitPrice: 110.00, storageLocation: "Maintenance Room B" },

  // 8. Plumbing Spare Parts
  { id: 22, itemCode: "CON-PLU-001", name: "PTFE Teflon Thread Seal Tape 12mm", categoryId: 8, description: "Water leak sealing thread tape 10m roll", unitOfMeasure: "Roll", currentStock: 24, minimumReorderLevel: 8, unitPrice: 35.00, storageLocation: "Plumbing Bin P-1" },
  { id: 23, itemCode: "CON-PLU-002", name: "Push-Button Restroom Tap Spindle Cartridge", categoryId: 8, description: "Timed shutoff brass replacement cartridge valve", unitOfMeasure: "Pcs", currentStock: 1, minimumReorderLevel: 3, unitPrice: 380.00, storageLocation: "Plumbing Bin P-2" },
  { id: 24, itemCode: "CON-PLU-003", name: "Flexible Braided Water Hose 1/2\" x 18\"", categoryId: 8, description: "Stainless steel braided sink inlet connector", unitOfMeasure: "Pcs", currentStock: 11, minimumReorderLevel: 4, unitPrice: 220.00, storageLocation: "Plumbing Bin P-3" },

  // 9. Furniture & Fitting Spare Parts
  { id: 25, itemCode: "CON-FUR-001", name: "Office Chair Caster Wheels 50mm (Set of 5)", categoryId: 9, description: "Heavy duty twin roller polyurethane smooth gliding casters", unitOfMeasure: "Set", currentStock: 10, minimumReorderLevel: 3, unitPrice: 650.00, storageLocation: "Store Room 204" },
  { id: 26, itemCode: "CON-FUR-002", name: "Class 4 Hydraulic Gas Lift Cylinder", categoryId: 9, description: "Replacement pneumatic height adjuster for desk chairs", unitOfMeasure: "Pcs", currentStock: 5, minimumReorderLevel: 2, unitPrice: 1200.00, storageLocation: "Store Room 204" },
  { id: 27, itemCode: "CON-FUR-003", name: "Pedestal Drawer Cam Lock with 2 Keys", categoryId: 9, description: "Desk cabinet zinc alloy cylinder replacement lock", unitOfMeasure: "Pcs", currentStock: 14, minimumReorderLevel: 4, unitPrice: 180.00, storageLocation: "Store Room 204" },

  // 10. Gift Articles
  { id: 28, itemCode: "CON-GFT-001", name: "Executive Matte Black Notebook & Pen Set", categoryId: 10, description: "Hardcover ruled corporate journal with laser engraved pen", unitOfMeasure: "Set", currentStock: 32, minimumReorderLevel: 10, unitPrice: 650.00, storageLocation: "HR Gift Storage" },
  { id: 29, itemCode: "CON-GFT-002", name: "Stainless Steel Thermal Travel Tumbler 500ml", categoryId: 10, description: "Double-wall vacuum insulated flask with company logo", unitOfMeasure: "Pcs", currentStock: 28, minimumReorderLevel: 10, unitPrice: 450.00, storageLocation: "HR Gift Storage" },
  { id: 30, itemCode: "CON-GFT-003", name: "New Joiner Welcome Kit Box", categoryId: 10, description: "Contains branded tote bag, notebook, pen, and keychain", unitOfMeasure: "Box", currentStock: 15, minimumReorderLevel: 5, unitPrice: 1250.00, storageLocation: "HR Gift Storage" },

  // 11. Reference Books & Project Reports
  { id: 31, itemCode: "CON-BOK-001", name: "Corporate Compliance & Tax Guide 2026", categoryId: 11, description: "Annual regulatory compliance handbook print edition", unitOfMeasure: "Copy", currentStock: 8, minimumReorderLevel: 2, unitPrice: 1500.00, storageLocation: "Library Shelf 3" },
  { id: 32, itemCode: "CON-BOK-002", name: "Company ESG & Safety Policy Handbook", categoryId: 11, description: "Spiral bound safety code of conduct guide for sites", unitOfMeasure: "Copy", currentStock: 22, minimumReorderLevel: 6, unitPrice: 350.00, storageLocation: "Library Shelf 1" },

  // 12. Event Related Materials
  { id: 33, itemCode: "CON-EVT-001", name: "Retractable Roll-Up Banner Standee 6x3ft", categoryId: 12, description: "Aluminum base portable company showcase banner", unitOfMeasure: "Unit", currentStock: 6, minimumReorderLevel: 2, unitPrice: 2400.00, storageLocation: "Marketing Closet" },
  { id: 34, itemCode: "CON-EVT-002", name: "Branded Conference Lanyard with Badge Clips", categoryId: 12, description: "Satin navy blue neck ribbons with quick release swivel", unitOfMeasure: "Pack", currentStock: 18, minimumReorderLevel: 5, unitPrice: 850.00, storageLocation: "Marketing Closet" },

  // 13. Health & First Aid Equipments
  { id: 35, itemCode: "CON-MED-001", name: "Sterile Adhesive Bandage Strips (Box of 100)", categoryId: 13, description: "Breathable flexible adhesive first aid dressings", unitOfMeasure: "Box", currentStock: 25, minimumReorderLevel: 8, unitPrice: 180.00, storageLocation: "First Aid Cabinet A" },
  { id: 36, itemCode: "CON-MED-002", name: "Antiseptic Disinfectant Liquid 500ml", categoryId: 13, description: "Hospital grade chloroxylenol wound wash solution", unitOfMeasure: "Bottle", currentStock: 12, minimumReorderLevel: 4, unitPrice: 210.00, storageLocation: "First Aid Cabinet A" },
  { id: 37, itemCode: "CON-MED-003", name: "Infrared Non-Contact Forehead Thermometer", categoryId: 13, description: "Instant reading digital temperature scanner", unitOfMeasure: "Unit", currentStock: 7, minimumReorderLevel: 2, unitPrice: 1650.00, storageLocation: "First Aid Cabinet B" },

  // 14. Office Equipments
  { id: 38, itemCode: "CON-OEQ-001", name: "Thermal Laminating Pouches A4 (Pack of 100)", categoryId: 14, description: "Glossy 80-micron document protective pouches", unitOfMeasure: "Pack", currentStock: 15, minimumReorderLevel: 4, unitPrice: 580.00, storageLocation: "Pantry Bay Upper" },
  { id: 39, itemCode: "CON-OEQ-002", name: "Heavy Duty 2-Hole Desktop Puncher 40-Sheet", categoryId: 14, description: "Metal punch machine with centering paper guide", unitOfMeasure: "Unit", currentStock: 9, minimumReorderLevel: 3, unitPrice: 650.00, storageLocation: "Stationery Bin 104" },
  { id: 40, itemCode: "CON-OEQ-003", name: "Whiteboard Cleaner Spray 250ml", categoryId: 14, description: "Streak-free dry erase board conditioning spray", unitOfMeasure: "Bottle", currentStock: 20, minimumReorderLevel: 6, unitPrice: 160.00, storageLocation: "Stationery Bin 105" },

  // 15. Housekeeping Materials
  { id: 41, itemCode: "CON-HSK-001", name: "Surface Disinfectant Floor Cleaner 5L", categoryId: 15, description: "Concentrated multi-surface floral sanitizing liquid", unitOfMeasure: "Can", currentStock: 11, minimumReorderLevel: 4, unitPrice: 650.00, storageLocation: "Housekeeping Store" },
  { id: 42, itemCode: "CON-HSK-002", name: "Ultra Microfiber Cleaning Towels (Pack of 10)", categoryId: 15, description: "Lint-free absorbent dusters for screens and desks", unitOfMeasure: "Pack", currentStock: 22, minimumReorderLevel: 6, unitPrice: 380.00, storageLocation: "Housekeeping Store" },
  { id: 43, itemCode: "CON-HSK-003", name: "Heavy Duty Waste Bin Trash Liners (Roll of 50)", categoryId: 15, description: "Tear-resistant 30-gallon black polythene bags", unitOfMeasure: "Roll", currentStock: 35, minimumReorderLevel: 10, unitPrice: 290.00, storageLocation: "Housekeeping Store" },

  // 16. Cutlery Set
  { id: 44, itemCode: "CON-CUT-001", name: "Biodegradable Paper Hot Cups 200ml (Pack 100)", categoryId: 16, description: "Compostable ripple coffee and tea cups for cafeteria", unitOfMeasure: "Pack", currentStock: 40, minimumReorderLevel: 12, unitPrice: 140.00, storageLocation: "Cafeteria Pantry 1" },
  { id: 45, itemCode: "CON-CUT-002", name: "Eco Birchwood Disposable Spoons (Box of 100)", categoryId: 16, description: "Smooth splinter-free wooden dining spoons", unitOfMeasure: "Box", currentStock: 28, minimumReorderLevel: 8, unitPrice: 180.00, storageLocation: "Cafeteria Pantry 1" },
  { id: 46, itemCode: "CON-CUT-003", name: "Ceramic Office Coffee Mug 350ml (White)", categoryId: 16, description: "Microwave and dishwasher safe porcelain mug", unitOfMeasure: "Pcs", currentStock: 48, minimumReorderLevel: 15, unitPrice: 120.00, storageLocation: "Cafeteria Pantry 2" }
];

export const SEED_TRANSACTIONS = [
  {
    id: 1,
    materialId: 1,
    transactionType: "INWARD",
    quantity: 20,
    unitPrice: 1450.00,
    totalAmount: 29000.00,
    balanceAfter: 20,
    referenceNumber: "PO-2026-0811",
    partyName: "TechCom Supplies Ltd",
    handledBy: "Robert Fox",
    remarks: "Initial bulk stock receipt for Q3",
    transactionDate: "2026-08-15T09:30:00Z"
  },
  {
    id: 2,
    materialId: 1,
    transactionType: "OUTWARD",
    quantity: 2,
    unitPrice: 1450.00,
    totalAmount: 2900.00,
    balanceAfter: 18,
    referenceNumber: "REQ-2026-104",
    partyName: "Engineering Dept (Alice Chen)",
    handledBy: "Marcus Vance",
    remarks: "Issued for new developer MacBook setup",
    transactionDate: "2026-09-02T14:15:00Z"
  },
  {
    id: 3,
    materialId: 2,
    transactionType: "INWARD",
    quantity: 30,
    unitPrice: 650.00,
    totalAmount: 19500.00,
    balanceAfter: 30,
    referenceNumber: "PO-2026-0820",
    partyName: "Peripheral Hub India",
    handledBy: "Robert Fox",
    remarks: "Quarterly inventory replenishment",
    transactionDate: "2026-08-20T11:00:00Z"
  },
  {
    id: 4,
    materialId: 2,
    transactionType: "OUTWARD",
    quantity: 5,
    unitPrice: 650.00,
    totalAmount: 3250.00,
    balanceAfter: 25,
    referenceNumber: "REQ-2026-145",
    partyName: "Design Dept",
    handledBy: "Marcus Vance",
    remarks: "Replacement mice for creative team workstations",
    transactionDate: "2026-09-18T10:45:00Z"
  },
  {
    id: 5,
    materialId: 3,
    transactionType: "INWARD",
    quantity: 10,
    unitPrice: 420.00,
    totalAmount: 4200.00,
    balanceAfter: 10,
    referenceNumber: "PO-2026-0701",
    partyName: "Cooler Master Distributors",
    handledBy: "Robert Fox",
    remarks: "Stocking workshop spares",
    transactionDate: "2026-07-10T10:00:00Z"
  },
  {
    id: 6,
    materialId: 3,
    transactionType: "OUTWARD",
    quantity: 6,
    unitPrice: 420.00,
    totalAmount: 2520.00,
    balanceAfter: 4,
    referenceNumber: "REQ-2026-099",
    partyName: "IT Helpdesk Repair Bench",
    handledBy: "Marcus Vance",
    remarks: "Server rack and workstation maintenance overhaul",
    transactionDate: "2026-09-29T16:30:00Z"
  },
  {
    id: 7,
    materialId: 10,
    transactionType: "INWARD",
    quantity: 10,
    unitPrice: 3850.00,
    totalAmount: 38500.00,
    balanceAfter: 10,
    referenceNumber: "PO-2026-0899",
    partyName: "Toner World Enterprise",
    handledBy: "Robert Fox",
    remarks: "Bulk laser printer supply order",
    transactionDate: "2026-08-28T10:30:00Z"
  },
  {
    id: 8,
    materialId: 10,
    transactionType: "OUTWARD",
    quantity: 4,
    unitPrice: 3850.00,
    totalAmount: 15400.00,
    balanceAfter: 6,
    referenceNumber: "REQ-2026-240",
    partyName: "Finance & Accounts",
    handledBy: "Marcus Vance",
    remarks: "Quarter-end audit ledger printings",
    transactionDate: "2026-09-30T15:45:00Z"
  },
  {
    id: 9,
    materialId: 13,
    transactionType: "INWARD",
    quantity: 20,
    unitPrice: 350.00,
    totalAmount: 7000.00,
    balanceAfter: 20,
    referenceNumber: "PO-2026-0902",
    partyName: "Stationery Kingdom",
    handledBy: "Sarah Jenkins",
    remarks: "Monthly office stationery intake",
    transactionDate: "2026-09-05T11:30:00Z"
  },
  {
    id: 10,
    materialId: 13,
    transactionType: "OUTWARD",
    quantity: 6,
    unitPrice: 350.00,
    totalAmount: 2100.00,
    balanceAfter: 14,
    referenceNumber: "REQ-2026-267",
    partyName: "HR & Administration",
    handledBy: "Marcus Vance",
    remarks: "Distributed to Floor 1 and Floor 2 supply caddies",
    transactionDate: "2026-09-25T14:00:00Z"
  },
  {
    id: 11,
    materialId: 16,
    transactionType: "INWARD",
    quantity: 20,
    unitPrice: 750.00,
    totalAmount: 15000.00,
    balanceAfter: 20,
    referenceNumber: "PO-2026-0888",
    partyName: "PrintCraft Press",
    handledBy: "Sarah Jenkins",
    remarks: "Annual legal documentation reams",
    transactionDate: "2026-08-18T16:00:00Z"
  },
  {
    id: 12,
    materialId: 16,
    transactionType: "OUTWARD",
    quantity: 5,
    unitPrice: 750.00,
    totalAmount: 3750.00,
    balanceAfter: 15,
    referenceNumber: "REQ-2026-290",
    partyName: "Legal Department",
    handledBy: "Marcus Vance",
    remarks: "Corporate client contract documentation",
    transactionDate: "2026-10-02T10:00:00Z"
  },
  {
    id: 13,
    materialId: 41,
    transactionType: "INWARD",
    quantity: 15,
    unitPrice: 650.00,
    totalAmount: 9750.00,
    balanceAfter: 15,
    referenceNumber: "PO-2026-0915",
    partyName: "CleanPro Hygiene Solutions",
    handledBy: "Sarah Jenkins",
    remarks: "Facility cleaning supplies intake",
    transactionDate: "2026-09-10T08:30:00Z"
  },
  {
    id: 14,
    materialId: 41,
    transactionType: "OUTWARD",
    quantity: 4,
    unitPrice: 650.00,
    totalAmount: 2600.00,
    balanceAfter: 11,
    referenceNumber: "REQ-2026-302",
    partyName: "Facilities & Housekeeping",
    handledBy: "Marcus Vance",
    remarks: "Weekly sanitation cycle for towers A & B",
    transactionDate: "2026-10-05T08:00:00Z"
  },
  {
    id: 15,
    materialId: 44,
    transactionType: "INWARD",
    quantity: 50,
    unitPrice: 140.00,
    totalAmount: 7000.00,
    balanceAfter: 50,
    referenceNumber: "PO-2026-0918",
    partyName: "EcoPantry Goods",
    handledBy: "Sarah Jenkins",
    remarks: "Cafeteria pantry stock intake",
    transactionDate: "2026-09-12T14:00:00Z"
  },
  {
    id: 16,
    materialId: 44,
    transactionType: "OUTWARD",
    quantity: 10,
    unitPrice: 140.00,
    totalAmount: 1400.00,
    balanceAfter: 40,
    referenceNumber: "REQ-2026-315",
    partyName: "Employee Lounge & Pantry",
    handledBy: "Marcus Vance",
    remarks: "Replenished tea/coffee station dispensers",
    transactionDate: "2026-10-08T09:30:00Z"
  }
];

// Ensure all seed materials have two-bucket properties initialized
SEED_MATERIALS.forEach(m => {
  if (m.previousCost === undefined) m.previousCost = 0;
  if (m.previousCostStock === undefined) m.previousCostStock = 0;
  if (m.currentCostStock === undefined) m.currentCostStock = m.currentStock || 0;
  if (m.totalValue === undefined) m.totalValue = (m.previousCostStock * m.previousCost) + (m.currentCostStock * m.unitPrice);
});

// Initial cost histories for all seed items
export const SEED_COST_HISTORIES = SEED_MATERIALS.map((m, idx) => ({
  id: idx + 1,
  materialId: m.id,
  materialName: m.name,
  itemCode: m.itemCode,
  previousCost: 0.00,
  newCost: m.unitPrice,
  difference: m.unitPrice,
  percentageChange: 0,
  changeReason: "Initial Item Registration",
  changedBy: "System Administrator",
  effectiveDate: "2026-10-14T07:37:16.49Z",
  notes: `Initial standard unit cost recorded at ₹${m.unitPrice.toFixed(2)}`
}));
