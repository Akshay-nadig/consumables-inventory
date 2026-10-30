using ConsumablesInventory.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ConsumablesInventory.API.Data
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(AppDbContext context)
        {
            await context.Database.EnsureCreatedAsync();

            if (await context.Categories.AnyAsync())
            {
                return; // Already seeded
            }

            // 1. Categories (16 specific categories)
            var categories = new List<Category>
            {
                new() { Name = "IT Spares", Code = "CAT-IT", Description = "Computer replacement spares, dongles and peripherals" },
                new() { Name = "Electronic Gadgets", Code = "CAT-EG", Description = "Presentation remotes, memory sticks and batteries" },
                new() { Name = "Network Related Materials", Code = "CAT-NET", Description = "Ethernet cords, patch panels, crimps and ties" },
                new() { Name = "Toner Cartridge for Printers", Code = "CAT-TONER", Description = "Laser toner cartridges and printer imaging units" },
                new() { Name = "Stationery Items", Code = "CAT-STAT", Description = "Writing pens, sticky pads, clips and staples" },
                new() { Name = "Printed Stationery Items", Code = "CAT-PSTAT", Description = "Letterheads, envelopes, voucher pads and visitor badges" },
                new() { Name = "Electrical Spare Parts", Code = "CAT-ELEC", Description = "Lighting tubes, 3-pin power plugs, switches and tape" },
                new() { Name = "Plumbing Spare Parts", Code = "CAT-PLUMB", Description = "Thread seal PTFE tapes, push valves and flexi-hoses" },
                new() { Name = "Furniture & Fitting Spare Parts", Code = "CAT-FURN", Description = "Chair casters, gas lifts, drawer locks and screws" },
                new() { Name = "Gift Articles", Code = "CAT-GIFT", Description = "Corporate executive kits, insulated mugs and gifts" },
                new() { Name = "Reference Books & Project Reports", Code = "CAT-BOOK", Description = "Taxation books, policy standards and spiral reports" },
                new() { Name = "Event Related Materials", Code = "CAT-EVENT", Description = "Roll-up standees, conference lanyards and table covers" },
                new() { Name = "Health & First Aid Equipments", Code = "CAT-FIRSTAID", Description = "Sterile plaster strips, antiseptic liquids and scanners" },
                new() { Name = "Office Equipments", Code = "CAT-OFEQUIP", Description = "Laminating pouches, hole punches and board cleaners" },
                new() { Name = "Housekeeping Materials", Code = "CAT-HOUSE", Description = "Disinfectant cans, microfiber dusters and trash bags" },
                new() { Name = "Cutlery Set", Code = "CAT-CUTLERY", Description = "Biodegradable paper cups, wooden spoons and mugs" }
            };

            await context.Categories.AddRangeAsync(categories);
            await context.SaveChangesAsync();

            // 2. Materials (<5 items per category: 2-3 items each, INR ₹ prices)
            var materials = new List<Material>
            {
                // IT Spares
                new() { ItemCode = "CON-IT-001", Name = "USB-C to HDMI Display Adapter", CategoryId = categories[0].Id, Description = "4K 60Hz compatible display dongle for workstations", UnitOfMeasure = "Pcs", CurrentStock = 18, MinimumReorderLevel = 5, UnitPrice = 1450.00m, StorageLocation = "IT Rack A-01" },
                new() { ItemCode = "CON-IT-002", Name = "Wireless Optical Mouse (Quiet Click)", CategoryId = categories[0].Id, Description = "Standard 2.4GHz USB dongle ergonomic mouse", UnitOfMeasure = "Pcs", CurrentStock = 25, MinimumReorderLevel = 8, UnitPrice = 650.00m, StorageLocation = "IT Rack A-02" },
                new() { ItemCode = "CON-IT-003", Name = "Thermal Heatsink Paste 4g Tube", CategoryId = categories[0].Id, Description = "High conductivity CPU cooling compound", UnitOfMeasure = "Tube", CurrentStock = 4, MinimumReorderLevel = 6, UnitPrice = 420.00m, StorageLocation = "IT Rack A-03" },

                // Electronic Gadgets
                new() { ItemCode = "CON-EG-001", Name = "Wireless Presentation Clicker Remote", CategoryId = categories[1].Id, Description = "Laser pointer remote with USB receiver for conference rooms", UnitOfMeasure = "Pcs", CurrentStock = 12, MinimumReorderLevel = 4, UnitPrice = 1850.00m, StorageLocation = "Cabinet E-01" },
                new() { ItemCode = "CON-EG-002", Name = "USB 3.0 Flash Drive 64GB", CategoryId = categories[1].Id, Description = "Encrypted hardware ready portable flash drive", UnitOfMeasure = "Pcs", CurrentStock = 30, MinimumReorderLevel = 10, UnitPrice = 550.00m, StorageLocation = "Cabinet E-02" },
                new() { ItemCode = "CON-EG-003", Name = "AAA Alkaline Batteries 4-Pack", CategoryId = categories[1].Id, Description = "Long-life power cells for remote controls and accessories", UnitOfMeasure = "Pack", CurrentStock = 3, MinimumReorderLevel = 10, UnitPrice = 160.00m, StorageLocation = "Cabinet E-03" },

                // Network Related Materials
                new() { ItemCode = "CON-NET-001", Name = "Cat6 Snagless Patch Cable 2m (Blue)", CategoryId = categories[2].Id, Description = "High speed gigabit patch cord for desk connectivity", UnitOfMeasure = "Pcs", CurrentStock = 65, MinimumReorderLevel = 20, UnitPrice = 180.00m, StorageLocation = "Network Bay 1" },
                new() { ItemCode = "CON-NET-002", Name = "RJ45 Modular Plug Connectors (100-Pack)", CategoryId = categories[2].Id, Description = "Gold plated 8P8C pass-through crimp connectors", UnitOfMeasure = "Box", CurrentStock = 8, MinimumReorderLevel = 3, UnitPrice = 450.00m, StorageLocation = "Network Bay 2" },
                new() { ItemCode = "CON-NET-003", Name = "Hook & Loop Velcro Cable Roll 5m", CategoryId = categories[2].Id, Description = "Reusable wire management tidy wrap", UnitOfMeasure = "Roll", CurrentStock = 22, MinimumReorderLevel = 5, UnitPrice = 280.00m, StorageLocation = "Network Bay 3" },

                // Toner Cartridge for Printers
                new() { ItemCode = "CON-TON-001", Name = "HP LaserJet Black Toner 85A", CategoryId = categories[3].Id, Description = "Standard black toner cartridge yield 1600 pages", UnitOfMeasure = "Cartridge", CurrentStock = 6, MinimumReorderLevel = 4, UnitPrice = 3850.00m, StorageLocation = "Print Supply Room 1" },
                new() { ItemCode = "CON-TON-002", Name = "Canon Color Cyan Toner Cartridge 054", CategoryId = categories[3].Id, Description = "High yield cyan toner for marketing floor laser printer", UnitOfMeasure = "Cartridge", CurrentStock = 2, MinimumReorderLevel = 3, UnitPrice = 4200.00m, StorageLocation = "Print Supply Room 2" },
                new() { ItemCode = "CON-TON-003", Name = "Xerox Waste Toner Recovery Box", CategoryId = categories[3].Id, Description = "Replacement excess toner container unit", UnitOfMeasure = "Unit", CurrentStock = 5, MinimumReorderLevel = 2, UnitPrice = 1400.00m, StorageLocation = "Print Supply Room 3" },

                // Stationery Items
                new() { ItemCode = "CON-STA-001", Name = "Ballpoint Pens Blue 0.7mm (Box of 50)", CategoryId = categories[4].Id, Description = "Smooth flow executive office ballpoint writing pens", UnitOfMeasure = "Box", CurrentStock = 14, MinimumReorderLevel = 5, UnitPrice = 350.00m, StorageLocation = "Stationery Bin 101" },
                new() { ItemCode = "CON-STA-002", Name = "Yellow Sticky Notes 3x3 (12-Pads Pack)", CategoryId = categories[4].Id, Description = "Self-adhesive reminder notes 100 sheets each pad", UnitOfMeasure = "Pack", CurrentStock = 28, MinimumReorderLevel = 8, UnitPrice = 280.00m, StorageLocation = "Stationery Bin 102" },
                new() { ItemCode = "CON-STA-003", Name = "Standard Stapler Pins No. 10 (Box of 1000)", CategoryId = categories[4].Id, Description = "Heavy zinc coated steel wire staples", UnitOfMeasure = "Box", CurrentStock = 45, MinimumReorderLevel = 15, UnitPrice = 45.00m, StorageLocation = "Stationery Bin 103" },

                // Printed Stationery Items
                new() { ItemCode = "CON-PST-001", Name = "Corporate Letterhead A4 100GSM (Ream 500)", CategoryId = categories[5].Id, Description = "Watermarked official embossed company letterhead sheets", UnitOfMeasure = "Ream", CurrentStock = 15, MinimumReorderLevel = 5, UnitPrice = 750.00m, StorageLocation = "Print Archive Shelf A" },
                new() { ItemCode = "CON-PST-002", Name = "Security Visitor Badges (Pack of 50)", CategoryId = categories[5].Id, Description = "Pre-printed sequential number reception passes", UnitOfMeasure = "Pack", CurrentStock = 9, MinimumReorderLevel = 3, UnitPrice = 480.00m, StorageLocation = "Front Desk Cabinet" },
                new() { ItemCode = "CON-PST-003", Name = "Finance Payment Voucher Books (100 Sheets)", CategoryId = categories[5].Id, Description = "Duplicate numbered carbonless expense vouchers", UnitOfMeasure = "Book", CurrentStock = 20, MinimumReorderLevel = 6, UnitPrice = 120.00m, StorageLocation = "Finance Records Room" },

                // Electrical Spare Parts
                new() { ItemCode = "CON-ELE-001", Name = "LED Tube Light 18W T8 4ft Cool White", CategoryId = categories[6].Id, Description = "Energy efficient ceiling replacement tube", UnitOfMeasure = "Pcs", CurrentStock = 16, MinimumReorderLevel = 6, UnitPrice = 240.00m, StorageLocation = "Maintenance Room B" },
                new() { ItemCode = "CON-ELE-002", Name = "Universal 3-Pin Power Plug Top 16A", CategoryId = categories[6].Id, Description = "Heavy duty polycarbonate grounded mains plug", UnitOfMeasure = "Pcs", CurrentStock = 35, MinimumReorderLevel = 10, UnitPrice = 95.00m, StorageLocation = "Maintenance Room B" },
                new() { ItemCode = "CON-ELE-003", Name = "PVC Electrical Insulation Tape (Pack of 5)", CategoryId = categories[6].Id, Description = "Fire retardant grade multi-colored wiring tape", UnitOfMeasure = "Pack", CurrentStock = 19, MinimumReorderLevel = 5, UnitPrice = 110.00m, StorageLocation = "Maintenance Room B" },

                // Plumbing Spare Parts
                new() { ItemCode = "CON-PLU-001", Name = "PTFE Teflon Thread Seal Tape 12mm", CategoryId = categories[7].Id, Description = "Water leak sealing thread tape 10m roll", UnitOfMeasure = "Roll", CurrentStock = 24, MinimumReorderLevel = 8, UnitPrice = 35.00m, StorageLocation = "Plumbing Bin P-1" },
                new() { ItemCode = "CON-PLU-002", Name = "Push-Button Restroom Tap Spindle Cartridge", CategoryId = categories[7].Id, Description = "Timed shutoff brass replacement cartridge valve", UnitOfMeasure = "Pcs", CurrentStock = 1, MinimumReorderLevel = 3, UnitPrice = 380.00m, StorageLocation = "Plumbing Bin P-2" },
                new() { ItemCode = "CON-PLU-003", Name = "Flexible Braided Water Hose 1/2\" x 18\"", CategoryId = categories[7].Id, Description = "Stainless steel braided sink inlet connector", UnitOfMeasure = "Pcs", CurrentStock = 11, MinimumReorderLevel = 4, UnitPrice = 220.00m, StorageLocation = "Plumbing Bin P-3" },

                // Furniture & Fitting Spare Parts
                new() { ItemCode = "CON-FUR-001", Name = "Office Chair Caster Wheels 50mm (Set of 5)", CategoryId = categories[8].Id, Description = "Heavy duty twin roller polyurethane smooth gliding casters", UnitOfMeasure = "Set", CurrentStock = 10, MinimumReorderLevel = 3, UnitPrice = 650.00m, StorageLocation = "Store Room 204" },
                new() { ItemCode = "CON-FUR-002", Name = "Class 4 Hydraulic Gas Lift Cylinder", CategoryId = categories[8].Id, Description = "Replacement pneumatic height adjuster for desk chairs", UnitOfMeasure = "Pcs", CurrentStock = 5, MinimumReorderLevel = 2, UnitPrice = 1200.00m, StorageLocation = "Store Room 204" },
                new() { ItemCode = "CON-FUR-003", Name = "Pedestal Drawer Cam Lock with 2 Keys", CategoryId = categories[8].Id, Description = "Desk cabinet zinc alloy cylinder replacement lock", UnitOfMeasure = "Pcs", CurrentStock = 14, MinimumReorderLevel = 4, UnitPrice = 180.00m, StorageLocation = "Store Room 204" },

                // Gift Articles
                new() { ItemCode = "CON-GFT-001", Name = "Executive Matte Black Notebook & Pen Set", CategoryId = categories[9].Id, Description = "Hardcover ruled corporate journal with laser engraved pen", UnitOfMeasure = "Set", CurrentStock = 32, MinimumReorderLevel = 10, UnitPrice = 650.00m, StorageLocation = "HR Gift Storage" },
                new() { ItemCode = "CON-GFT-002", Name = "Stainless Steel Thermal Travel Tumbler 500ml", CategoryId = categories[9].Id, Description = "Double-wall vacuum insulated flask with company logo", UnitOfMeasure = "Pcs", CurrentStock = 28, MinimumReorderLevel = 10, UnitPrice = 450.00m, StorageLocation = "HR Gift Storage" },
                new() { ItemCode = "CON-GFT-003", Name = "New Joiner Welcome Kit Box", CategoryId = categories[9].Id, Description = "Contains branded tote bag, notebook, pen, and keychain", UnitOfMeasure = "Box", CurrentStock = 15, MinimumReorderLevel = 5, UnitPrice = 1250.00m, StorageLocation = "HR Gift Storage" },

                // Reference Books & Project Reports
                new() { ItemCode = "CON-BOK-001", Name = "Corporate Compliance & Tax Guide 2026", CategoryId = categories[10].Id, Description = "Annual regulatory compliance handbook print edition", UnitOfMeasure = "Copy", CurrentStock = 8, MinimumReorderLevel = 2, UnitPrice = 1500.00m, StorageLocation = "Library Shelf 3" },
                new() { ItemCode = "CON-BOK-002", Name = "Company ESG & Safety Policy Handbook", CategoryId = categories[10].Id, Description = "Spiral bound safety code of conduct guide for sites", UnitOfMeasure = "Copy", CurrentStock = 22, MinimumReorderLevel = 6, UnitPrice = 350.00m, StorageLocation = "Library Shelf 1" },

                // Event Related Materials
                new() { ItemCode = "CON-EVT-001", Name = "Retractable Roll-Up Banner Standee 6x3ft", CategoryId = categories[11].Id, Description = "Aluminum base portable company showcase banner", UnitOfMeasure = "Unit", CurrentStock = 6, MinimumReorderLevel = 2, UnitPrice = 2400.00m, StorageLocation = "Marketing Closet" },
                new() { ItemCode = "CON-EVT-002", Name = "Branded Conference Lanyard with Badge Clips", CategoryId = categories[11].Id, Description = "Satin navy blue neck ribbons with quick release swivel", UnitOfMeasure = "Pack", CurrentStock = 18, MinimumReorderLevel = 5, UnitPrice = 850.00m, StorageLocation = "Marketing Closet" },

                // Health & First Aid Equipments
                new() { ItemCode = "CON-MED-001", Name = "Sterile Adhesive Bandage Strips (Box of 100)", CategoryId = categories[12].Id, Description = "Breathable flexible adhesive first aid dressings", UnitOfMeasure = "Box", CurrentStock = 25, MinimumReorderLevel = 8, UnitPrice = 180.00m, StorageLocation = "First Aid Cabinet A" },
                new() { ItemCode = "CON-MED-002", Name = "Antiseptic Disinfectant Liquid 500ml", CategoryId = categories[12].Id, Description = "Hospital grade chloroxylenol wound wash solution", UnitOfMeasure = "Bottle", CurrentStock = 12, MinimumReorderLevel = 4, UnitPrice = 210.00m, StorageLocation = "First Aid Cabinet A" },
                new() { ItemCode = "CON-MED-003", Name = "Infrared Non-Contact Forehead Thermometer", CategoryId = categories[12].Id, Description = "Instant reading digital temperature scanner", UnitOfMeasure = "Unit", CurrentStock = 7, MinimumReorderLevel = 2, UnitPrice = 1650.00m, StorageLocation = "First Aid Cabinet B" },

                // Office Equipments
                new() { ItemCode = "CON-OEQ-001", Name = "Thermal Laminating Pouches A4 (Pack of 100)", CategoryId = categories[13].Id, Description = "Glossy 80-micron document protective pouches", UnitOfMeasure = "Pack", CurrentStock = 15, MinimumReorderLevel = 4, UnitPrice = 580.00m, StorageLocation = "Pantry Bay Upper" },
                new() { ItemCode = "CON-OEQ-002", Name = "Heavy Duty 2-Hole Desktop Puncher 40-Sheet", CategoryId = categories[13].Id, Description = "Metal punch machine with centering paper guide", UnitOfMeasure = "Unit", CurrentStock = 9, MinimumReorderLevel = 3, UnitPrice = 650.00m, StorageLocation = "Stationery Bin 104" },
                new() { ItemCode = "CON-OEQ-003", Name = "Whiteboard Cleaner Spray 250ml", CategoryId = categories[13].Id, Description = "Streak-free dry erase board conditioning spray", UnitOfMeasure = "Bottle", CurrentStock = 20, MinimumReorderLevel = 6, UnitPrice = 160.00m, StorageLocation = "Stationery Bin 105" },

                // Housekeeping Materials
                new() { ItemCode = "CON-HSK-001", Name = "Surface Disinfectant Floor Cleaner 5L", CategoryId = categories[14].Id, Description = "Concentrated multi-surface floral sanitizing liquid", UnitOfMeasure = "Can", CurrentStock = 11, MinimumReorderLevel = 4, UnitPrice = 650.00m, StorageLocation = "Housekeeping Store" },
                new() { ItemCode = "CON-HSK-002", Name = "Ultra Microfiber Cleaning Towels (Pack of 10)", CategoryId = categories[14].Id, Description = "Lint-free absorbent dusters for screens and desks", UnitOfMeasure = "Pack", CurrentStock = 22, MinimumReorderLevel = 6, UnitPrice = 380.00m, StorageLocation = "Housekeeping Store" },
                new() { ItemCode = "CON-HSK-003", Name = "Heavy Duty Waste Bin Trash Liners (Roll of 50)", CategoryId = categories[14].Id, Description = "Tear-resistant 30-gallon black polythene bags", UnitOfMeasure = "Roll", CurrentStock = 35, MinimumReorderLevel = 10, UnitPrice = 290.00m, StorageLocation = "Housekeeping Store" },

                // Cutlery Set
                new() { ItemCode = "CON-CUT-001", Name = "Biodegradable Paper Hot Cups 200ml (Pack 100)", CategoryId = categories[15].Id, Description = "Compostable ripple coffee and tea cups for cafeteria", UnitOfMeasure = "Pack", CurrentStock = 40, MinimumReorderLevel = 12, UnitPrice = 140.00m, StorageLocation = "Cafeteria Pantry 1" },
                new() { ItemCode = "CON-CUT-002", Name = "Eco Birchwood Disposable Spoons (Box of 100)", CategoryId = categories[15].Id, Description = "Smooth splinter-free wooden dining spoons", UnitOfMeasure = "Box", CurrentStock = 28, MinimumReorderLevel = 8, UnitPrice = 180.00m, StorageLocation = "Cafeteria Pantry 1" },
                new() { ItemCode = "CON-CUT-003", Name = "Ceramic Office Coffee Mug 350ml (White)", CategoryId = categories[15].Id, Description = "Microwave and dishwasher safe porcelain mug", UnitOfMeasure = "Pcs", CurrentStock = 48, MinimumReorderLevel = 15, UnitPrice = 120.00m, StorageLocation = "Cafeteria Pantry 2" }
            };

            foreach (var m in materials)
            {
                m.CurrentCostStock = m.CurrentStock;
                m.PreviousCostStock = 0;
                m.PreviousCost = 0.00m;
            }

            await context.Materials.AddRangeAsync(materials);
            await context.SaveChangesAsync();

            // 2.1 Seed Initial Cost History for all materials
            var initialCostHistories = materials.Select(m => new MaterialCostHistory
            {
                MaterialId = m.Id,
                PreviousCost = 0.00m,
                NewCost = m.UnitPrice,
                ChangeReason = "Initial Item Registration",
                ChangedBy = "System Administrator",
                EffectiveDate = m.CreatedAt,
                Notes = $"Initial standard unit cost recorded at ₹{m.UnitPrice:F2}"
            }).ToList();

            await context.MaterialCostHistories.AddRangeAsync(initialCostHistories);
            await context.SaveChangesAsync();

            // 3. Transactions (Inward and Outward seed in INR ₹)
            var transactions = new List<InventoryTransaction>
            {
                new() {
                    MaterialId = materials[0].Id,
                    TransactionType = "INWARD",
                    Quantity = 20,
                    UnitPrice = 1450.00m,
                    TotalAmount = 29000.00m,
                    BalanceAfter = 20,
                    ReferenceNumber = "PO-2026-0811",
                    PartyName = "TechCom Supplies Ltd",
                    HandledBy = "Robert Fox",
                    Remarks = "Initial bulk stock receipt for Q3",
                    TransactionDate = DateTime.UtcNow.AddDays(-60)
                },
                new() {
                    MaterialId = materials[0].Id,
                    TransactionType = "OUTWARD",
                    Quantity = 2,
                    UnitPrice = 1450.00m,
                    TotalAmount = 2900.00m,
                    BalanceAfter = 18,
                    ReferenceNumber = "REQ-2026-104",
                    PartyName = "Engineering Dept (Alice Chen)",
                    HandledBy = "Marcus Vance",
                    Remarks = "Issued for new developer MacBook setup",
                    TransactionDate = DateTime.UtcNow.AddDays(-42)
                },
                new() {
                    MaterialId = materials[1].Id,
                    TransactionType = "INWARD",
                    Quantity = 30,
                    UnitPrice = 650.00m,
                    TotalAmount = 19500.00m,
                    BalanceAfter = 30,
                    ReferenceNumber = "PO-2026-0820",
                    PartyName = "Peripheral Hub India",
                    HandledBy = "Robert Fox",
                    Remarks = "Quarterly inventory replenishment",
                    TransactionDate = DateTime.UtcNow.AddDays(-55)
                },
                new() {
                    MaterialId = materials[1].Id,
                    TransactionType = "OUTWARD",
                    Quantity = 5,
                    UnitPrice = 650.00m,
                    TotalAmount = 3250.00m,
                    BalanceAfter = 25,
                    ReferenceNumber = "REQ-2026-145",
                    PartyName = "Design Dept",
                    HandledBy = "Marcus Vance",
                    Remarks = "Replacement mice for creative team workstations",
                    TransactionDate = DateTime.UtcNow.AddDays(-26)
                },
                new() {
                    MaterialId = materials[2].Id,
                    TransactionType = "INWARD",
                    Quantity = 10,
                    UnitPrice = 420.00m,
                    TotalAmount = 4200.00m,
                    BalanceAfter = 10,
                    ReferenceNumber = "PO-2026-0701",
                    PartyName = "Cooler Master Distributors",
                    HandledBy = "Robert Fox",
                    Remarks = "Stocking workshop spares",
                    TransactionDate = DateTime.UtcNow.AddDays(-90)
                },
                new() {
                    MaterialId = materials[2].Id,
                    TransactionType = "OUTWARD",
                    Quantity = 6,
                    UnitPrice = 420.00m,
                    TotalAmount = 2520.00m,
                    BalanceAfter = 4,
                    ReferenceNumber = "REQ-2026-099",
                    PartyName = "IT Helpdesk Repair Bench",
                    HandledBy = "Marcus Vance",
                    Remarks = "Server rack and workstation maintenance overhaul",
                    TransactionDate = DateTime.UtcNow.AddDays(-15)
                },
                new() {
                    MaterialId = materials[9].Id,
                    TransactionType = "INWARD",
                    Quantity = 10,
                    UnitPrice = 3850.00m,
                    TotalAmount = 38500.00m,
                    BalanceAfter = 10,
                    ReferenceNumber = "PO-2026-0899",
                    PartyName = "Toner World Enterprise",
                    HandledBy = "Robert Fox",
                    Remarks = "Bulk laser printer supply order",
                    TransactionDate = DateTime.UtcNow.AddDays(-48)
                },
                new() {
                    MaterialId = materials[9].Id,
                    TransactionType = "OUTWARD",
                    Quantity = 4,
                    UnitPrice = 3850.00m,
                    TotalAmount = 15400.00m,
                    BalanceAfter = 6,
                    ReferenceNumber = "REQ-2026-240",
                    PartyName = "Finance & Accounts",
                    HandledBy = "Marcus Vance",
                    Remarks = "Quarter-end audit ledger printings",
                    TransactionDate = DateTime.UtcNow.AddDays(-14)
                },
                new() {
                    MaterialId = materials[12].Id,
                    TransactionType = "INWARD",
                    Quantity = 20,
                    UnitPrice = 350.00m,
                    TotalAmount = 7000.00m,
                    BalanceAfter = 20,
                    ReferenceNumber = "PO-2026-0902",
                    PartyName = "Stationery Kingdom",
                    HandledBy = "Sarah Jenkins",
                    Remarks = "Monthly office stationery intake",
                    TransactionDate = DateTime.UtcNow.AddDays(-40)
                },
                new() {
                    MaterialId = materials[12].Id,
                    TransactionType = "OUTWARD",
                    Quantity = 6,
                    UnitPrice = 350.00m,
                    TotalAmount = 2100.00m,
                    BalanceAfter = 14,
                    ReferenceNumber = "REQ-2026-267",
                    PartyName = "HR & Administration",
                    HandledBy = "Marcus Vance",
                    Remarks = "Distributed to Floor 1 and Floor 2 supply caddies",
                    TransactionDate = DateTime.UtcNow.AddDays(-19)
                },
                new() {
                    MaterialId = materials[40].Id,
                    TransactionType = "INWARD",
                    Quantity = 15,
                    UnitPrice = 650.00m,
                    TotalAmount = 9750.00m,
                    BalanceAfter = 15,
                    ReferenceNumber = "PO-2026-0915",
                    PartyName = "CleanPro Hygiene Solutions",
                    HandledBy = "Sarah Jenkins",
                    Remarks = "Facility cleaning supplies intake",
                    TransactionDate = DateTime.UtcNow.AddDays(-35)
                },
                new() {
                    MaterialId = materials[40].Id,
                    TransactionType = "OUTWARD",
                    Quantity = 4,
                    UnitPrice = 650.00m,
                    TotalAmount = 2600.00m,
                    BalanceAfter = 11,
                    ReferenceNumber = "REQ-2026-302",
                    PartyName = "Facilities & Housekeeping",
                    HandledBy = "Marcus Vance",
                    Remarks = "Weekly sanitation cycle for towers A & B",
                    TransactionDate = DateTime.UtcNow.AddDays(-9)
                },
                new() {
                    MaterialId = materials[43].Id,
                    TransactionType = "INWARD",
                    Quantity = 50,
                    UnitPrice = 140.00m,
                    TotalAmount = 7000.00m,
                    BalanceAfter = 50,
                    ReferenceNumber = "PO-2026-0918",
                    PartyName = "EcoPantry Goods",
                    HandledBy = "Sarah Jenkins",
                    Remarks = "Cafeteria pantry stock intake",
                    TransactionDate = DateTime.UtcNow.AddDays(-32)
                },
                new() {
                    MaterialId = materials[43].Id,
                    TransactionType = "OUTWARD",
                    Quantity = 10,
                    UnitPrice = 140.00m,
                    TotalAmount = 1400.00m,
                    BalanceAfter = 40,
                    ReferenceNumber = "REQ-2026-315",
                    PartyName = "Employee Lounge & Pantry",
                    HandledBy = "Marcus Vance",
                    Remarks = "Replenished tea/coffee station dispensers",
                    TransactionDate = DateTime.UtcNow.AddDays(-6)
                }
            };

            await context.InventoryTransactions.AddRangeAsync(transactions);
            await context.SaveChangesAsync();
        }
    }
}
