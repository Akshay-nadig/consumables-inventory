-- ============================================================================
-- Consumables Inventory Management System - Microsoft SQL Server Database Setup
-- Description: Schema and Demo Seed Data (tracks only consumables in a company)
-- Currency: Indian Rupee (INR ₹)
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ConsumablesInventoryDb')
BEGIN
    CREATE DATABASE ConsumablesInventoryDb;
END
GO

USE ConsumablesInventoryDb;
GO

-- 1. Create Categories Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Categories')
BEGIN
    CREATE TABLE Categories (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL UNIQUE,
        Code NVARCHAR(20) NOT NULL UNIQUE,
        Description NVARCHAR(255) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END
GO

-- 2. Create Materials Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Materials')
BEGIN
    CREATE TABLE Materials (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        ItemCode NVARCHAR(50) NOT NULL UNIQUE,
        Name NVARCHAR(150) NOT NULL,
        CategoryId INT NOT NULL FOREIGN KEY REFERENCES Categories(Id) ON DELETE CASCADE,
        Description NVARCHAR(500) NULL,
        UnitOfMeasure NVARCHAR(50) NOT NULL,
        CurrentStock INT NOT NULL DEFAULT 0,
        MinimumReorderLevel INT NOT NULL DEFAULT 10,
        UnitPrice DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        PreviousCost DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        PreviousCostStock INT NOT NULL DEFAULT 0,
        CurrentCostStock INT NOT NULL DEFAULT 0,
        StorageLocation NVARCHAR(100) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL
    );
END
GO

-- 3. Create InventoryTransactions Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InventoryTransactions')
BEGIN
    CREATE TABLE InventoryTransactions (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        MaterialId INT NOT NULL FOREIGN KEY REFERENCES Materials(Id) ON DELETE CASCADE,
        TransactionType NVARCHAR(20) NOT NULL, -- 'INWARD' or 'OUTWARD'
        Quantity INT NOT NULL,
        UnitPrice DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        TotalAmount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        BalanceAfter INT NOT NULL,
        ReferenceNumber NVARCHAR(100) NULL,  -- PO No. / Requisition No.
        PartyName NVARCHAR(150) NULL,        -- Supplier / Requesting Department or Employee
        HandledBy NVARCHAR(100) NULL,        -- Received By / Issued By
        Remarks NVARCHAR(500) NULL,
        TransactionDate DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END
GO

-- 4. Create MaterialCostHistories Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MaterialCostHistories')
BEGIN
    CREATE TABLE MaterialCostHistories (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        MaterialId INT NOT NULL FOREIGN KEY REFERENCES Materials(Id) ON DELETE CASCADE,
        PreviousCost DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        NewCost DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        ChangeReason NVARCHAR(255) NOT NULL,
        ChangedBy NVARCHAR(100) NULL,
        EffectiveDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        Notes NVARCHAR(500) NULL
    );
END
GO

-- Indexes for optimal querying
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Materials_CategoryId')
    CREATE INDEX IX_Materials_CategoryId ON Materials(CategoryId);
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Transactions_MaterialId')
    CREATE INDEX IX_Transactions_MaterialId ON InventoryTransactions(MaterialId);
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Transactions_Date')
    CREATE INDEX IX_Transactions_Date ON InventoryTransactions(TransactionDate);
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Transactions_Type')
    CREATE INDEX IX_Transactions_Type ON InventoryTransactions(TransactionType);
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_MaterialCostHistories_MaterialId')
    CREATE INDEX IX_MaterialCostHistories_MaterialId ON MaterialCostHistories(MaterialId);
GO
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_MaterialCostHistories_Date')
    CREATE INDEX IX_MaterialCostHistories_Date ON MaterialCostHistories(EffectiveDate);
GO

-- ============================================================================
-- SEED DATA: 16 Required Consumable Categories
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM Categories)
BEGIN
    INSERT INTO Categories (Name, Code, Description) VALUES
    ('IT Spares', 'CAT-IT', 'Replacement computer peripherals, cables, and adapters'),
    ('Electronic Gadgets', 'CAT-EG', 'Workplace gadgets, presentation remotes, and batteries'),
    ('Network Related Materials', 'CAT-NET', 'Ethernet patch cables, RJ45 connectors, and ties'),
    ('Toner Cartridge for Printers', 'CAT-TONER', 'Toner cartridges and drums for office printers'),
    ('Stationery Items', 'CAT-STAT', 'General office desk stationery and paper supplies'),
    ('Printed Stationery Items', 'CAT-PSTAT', 'Letterheads, visitor pass books, and branded cards'),
    ('Electrical Spare Parts', 'CAT-ELEC', 'LED tubes, switches, plugs, and insulation materials'),
    ('Plumbing Spare Parts', 'CAT-PLUMB', 'Teflon tapes, connectors, washers, and valves'),
    ('Furniture & Fitting Spare Parts', 'CAT-FURN', 'Casters, chair gas lifts, screws, and hinges'),
    ('Gift Articles', 'CAT-GIFT', 'Corporate welcome gifts, mugs, and executive packs'),
    ('Reference Books & Project Reports', 'CAT-BOOK', 'Standards manuals, policy books, and reports'),
    ('Event Related Materials', 'CAT-EVENT', 'Lanyards, roll-up banners, and exhibition tags'),
    ('Health & First Aid Equipments', 'CAT-FIRSTAID', 'First aid kits, sanitizers, bandages, and monitors'),
    ('Office Equipments', 'CAT-OFEQUIP', 'Laminating sheets, punchers, and whiteboard care'),
    ('Housekeeping Materials', 'CAT-HOUSE', 'Disinfectants, microfiber wipes, and bin liners'),
    ('Cutlery Set', 'CAT-CUTLERY', 'Pantry paper cups, wooden cutlery, and pantry mugs');
END
GO

-- ============================================================================
-- SEED DATA: Consumable Materials (<5 items per category: 2-3 items each)
-- All prices in Indian Rupee (INR ₹)
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM Materials)
BEGIN
    -- 1. IT Spares
    INSERT INTO Materials (ItemCode, Name, CategoryId, Description, UnitOfMeasure, CurrentStock, MinimumReorderLevel, UnitPrice, StorageLocation)
    VALUES
    ('CON-IT-001', 'USB-C to HDMI Display Adapter', 1, '4K 60Hz compatible display dongle for workstations', 'Pcs', 18, 5, 1450.00, 'IT Rack A-01'),
    ('CON-IT-002', 'Wireless Optical Mouse (Quiet Click)', 1, 'Standard 2.4GHz USB dongle ergonomic mouse', 'Pcs', 25, 8, 650.00, 'IT Rack A-02'),
    ('CON-IT-003', 'Thermal Heatsink Paste 4g Tube', 1, 'High conductivity CPU cooling compound', 'Tube', 4, 6, 420.00, 'IT Rack A-03'); -- Low stock!

    -- 2. Electronic Gadgets
    INSERT INTO Materials (ItemCode, Name, CategoryId, Description, UnitOfMeasure, CurrentStock, MinimumReorderLevel, UnitPrice, StorageLocation)
    VALUES
    ('CON-EG-001', 'Wireless Presentation Clicker Remote', 2, 'Laser pointer remote with USB receiver for conference rooms', 'Pcs', 12, 4, 1850.00, 'Cabinet E-01'),
    ('CON-EG-002', 'USB 3.0 Flash Drive 64GB', 2, 'Encrypted hardware ready portable flash drive', 'Pcs', 30, 10, 550.00, 'Cabinet E-02'),
    ('CON-EG-003', 'AAA Alkaline Batteries 4-Pack', 2, 'Long-life power cells for remote controls and accessories', 'Pack', 3, 10, 160.00, 'Cabinet E-03'); -- Low stock!

    -- 3. Network Related Materials
    INSERT INTO Materials (ItemCode, Name, CategoryId, Description, UnitOfMeasure, CurrentStock, MinimumReorderLevel, UnitPrice, StorageLocation)
    VALUES
    ('CON-NET-001', 'Cat6 Snagless Patch Cable 2m (Blue)', 3, 'High speed gigabit patch cord for desk connectivity', 'Pcs', 65, 20, 180.00, 'Network Bay 1'),
    ('CON-NET-002', 'RJ45 Modular Plug Connectors (100-Pack)', 3, 'Gold plated 8P8C pass-through crimp connectors', 'Box', 8, 3, 450.00, 'Network Bay 2'),
    ('CON-NET-003', 'Hook & Loop Velcro Cable Roll 5m', 3, 'Reusable wire management tidy wrap', 'Roll', 22, 5, 280.00, 'Network Bay 3');

    -- 4. Toner Cartridge for Printers
    INSERT INTO Materials (ItemCode, Name, CategoryId, Description, UnitOfMeasure, CurrentStock, MinimumReorderLevel, UnitPrice, StorageLocation)
    VALUES
    ('CON-TON-001', 'HP LaserJet Black Toner 85A (CE285A)', 4, 'Standard black toner cartridge yield 1600 pages', 'Cartridge', 6, 4, 3850.00, 'Print Supply Room 1'),
    ('CON-TON-002', 'Canon Color Cyan Toner Cartridge 054', 4, 'High yield cyan toner for marketing floor laser printer', 'Cartridge', 2, 3, 4200.00, 'Print Supply Room 2'), -- Low stock!
    ('CON-TON-003', 'Xerox Waste Toner Recovery Box', 4, 'Replacement excess toner container unit', 'Unit', 5, 2, 1400.00, 'Print Supply Room 3');

    -- 5. Stationery Items
    INSERT INTO Materials (ItemCode, Name, CategoryId, Description, UnitOfMeasure, CurrentStock, MinimumReorderLevel, UnitPrice, StorageLocation)
    VALUES
    ('CON-STA-001', 'Ballpoint Pens Blue 0.7mm (Box of 50)', 5, 'Smooth flow executive office ballpoint writing pens', 'Box', 14, 5, 350.00, 'Stationery Bin 101'),
    ('CON-STA-002', 'Yellow Sticky Notes 3x3 (12-Pads Pack)', 5, 'Self-adhesive reminder notes 100 sheets each pad', 'Pack', 28, 8, 280.00, 'Stationery Bin 102'),
    ('CON-STA-003', 'Standard Stapler Pins No. 10 (Box of 1000)', 5, 'Heavy zinc coated steel wire staples', 'Box', 45, 15, 45.00, 'Stationery Bin 103');

    -- 6. Printed Stationery Items
    INSERT INTO Materials (ItemCode, Name, CategoryId, Description, UnitOfMeasure, CurrentStock, MinimumReorderLevel, UnitPrice, StorageLocation)
    VALUES
    ('CON-PST-001', 'Corporate Letterhead A4 100GSM (Ream 500)', 6, 'Watermarked official embossed company letterhead sheets', 'Ream', 15, 5, 750.00, 'Print Archive Shelf A'),
    ('CON-PST-002', 'Security Visitor Badges (Pack of 50)', 6, 'Pre-printed sequential number reception passes', 'Pack', 9, 3, 480.00, 'Front Desk Cabinet'),
    ('CON-PST-003', 'Finance Payment Voucher Books (100 Sheets)', 6, 'Duplicate numbered carbonless expense vouchers', 'Book', 20, 6, 120.00, 'Finance Records Room');

    -- 7. Electrical Spare Parts
    INSERT INTO Materials (ItemCode, Name, CategoryId, Description, UnitOfMeasure, CurrentStock, MinimumReorderLevel, UnitPrice, StorageLocation)
    VALUES
    ('CON-ELE-001', 'LED Tube Light 18W T8 4ft Cool White', 7, 'Energy efficient ceiling replacement tube', 'Pcs', 16, 6, 240.00, 'Maintenance Room B'),
    ('CON-ELE-002', 'Universal 3-Pin Power Plug Top 16A', 7, 'Heavy duty polycarbonate grounded mains plug', 'Pcs', 35, 10, 95.00, 'Maintenance Room B'),
    ('CON-ELE-003', 'PVC Electrical Insulation Tape (Pack of 5)', 7, 'Fire retardant grade multi-colored wiring tape', 'Pack', 19, 5, 110.00, 'Maintenance Room B');

    -- 8. Plumbing Spare Parts
    INSERT INTO Materials (ItemCode, Name, CategoryId, Description, UnitOfMeasure, CurrentStock, MinimumReorderLevel, UnitPrice, StorageLocation)
    VALUES
    ('CON-PLU-001', 'PTFE Teflon Thread Seal Tape 12mm', 8, 'Water leak sealing thread tape 10m roll', 'Roll', 24, 8, 35.00, 'Plumbing Bin P-1'),
    ('CON-PLU-002', 'Push-Button Restroom Tap Spindle Cartridge', 8, 'Timed shutoff brass replacement cartridge valve', 'Pcs', 1, 3, 380.00, 'Plumbing Bin P-2'), -- Low stock!
    ('CON-PLU-003', 'Flexible Braided Water Hose 1/2" x 18"', 8, 'Stainless steel braided sink inlet connector', 'Pcs', 11, 4, 220.00, 'Plumbing Bin P-3');

    -- 9. Furniture & Fitting Spare Parts
    INSERT INTO Materials (ItemCode, Name, CategoryId, Description, UnitOfMeasure, CurrentStock, MinimumReorderLevel, UnitPrice, StorageLocation)
    VALUES
    ('CON-FUR-001', 'Office Chair Caster Wheels 50mm (Set of 5)', 9, 'Heavy duty twin roller polyurethane smooth gliding casters', 'Set', 10, 3, 650.00, 'Store Room 204'),
    ('CON-FUR-002', 'Class 4 Hydraulic Gas Lift Cylinder', 9, 'Replacement pneumatic height adjuster for desk chairs', 'Pcs', 5, 2, 1200.00, 'Store Room 204'),
    ('CON-FUR-003', 'Pedestal Drawer Cam Lock with 2 Keys', 9, 'Desk cabinet zinc alloy cylinder replacement lock', 'Pcs', 14, 4, 180.00, 'Store Room 204');

    -- 10. Gift Articles
    INSERT INTO Materials (ItemCode, Name, CategoryId, Description, UnitOfMeasure, CurrentStock, MinimumReorderLevel, UnitPrice, StorageLocation)
    VALUES
    ('CON-GFT-001', 'Executive Matte Black Notebook & Pen Set', 10, 'Hardcover ruled corporate journal with laser engraved pen', 'Set', 32, 10, 650.00, 'HR Gift Storage'),
    ('CON-GFT-002', 'Stainless Steel Thermal Travel Tumbler 500ml', 10, 'Double-wall vacuum insulated flask with company logo', 'Pcs', 28, 10, 450.00, 'HR Gift Storage'),
    ('CON-GFT-003', 'New Joiner Welcome Kit Box', 10, 'Contains branded tote bag, notebook, pen, and keychain', 'Box', 15, 5, 1250.00, 'HR Gift Storage');

    -- 11. Reference Books & Project Reports
    INSERT INTO Materials (ItemCode, Name, CategoryId, Description, UnitOfMeasure, CurrentStock, MinimumReorderLevel, UnitPrice, StorageLocation)
    VALUES
    ('CON-BOK-001', 'Corporate Compliance & Tax Guide 2026', 11, 'Annual regulatory compliance handbook print edition', 'Copy', 8, 2, 1500.00, 'Library Shelf 3'),
    ('CON-BOK-002', 'Company ESG & Safety Policy Handbook', 11, 'Spiral bound safety code of conduct guide for sites', 'Copy', 22, 6, 350.00, 'Library Shelf 1');

    -- 12. Event Related Materials
    INSERT INTO Materials (ItemCode, Name, CategoryId, Description, UnitOfMeasure, CurrentStock, MinimumReorderLevel, UnitPrice, StorageLocation)
    VALUES
    ('CON-EVT-001', 'Retractable Roll-Up Banner Standee 6x3ft', 12, 'Aluminum base portable company showcase banner', 'Unit', 6, 2, 2400.00, 'Marketing Closet'),
    ('CON-EVT-002', 'Branded Conference Lanyard with Badge Clips', 12, 'Satin navy blue neck ribbons with quick release swivel', 'Pack', 18, 5, 850.00, 'Marketing Closet');

    -- 13. Health & First Aid Equipments
    INSERT INTO Materials (ItemCode, Name, CategoryId, Description, UnitOfMeasure, CurrentStock, MinimumReorderLevel, UnitPrice, StorageLocation)
    VALUES
    ('CON-MED-001', 'Sterile Adhesive Bandage Strips (Box of 100)', 13, 'Breathable flexible adhesive first aid dressings', 'Box', 25, 8, 180.00, 'First Aid Cabinet A'),
    ('CON-MED-002', 'Antiseptic Disinfectant Liquid 500ml', 13, 'Hospital grade chloroxylenol wound wash solution', 'Bottle', 12, 4, 210.00, 'First Aid Cabinet A'),
    ('CON-MED-003', 'Infrared Non-Contact Forehead Thermometer', 13, 'Instant reading digital temperature scanner', 'Unit', 7, 2, 1650.00, 'First Aid Cabinet B');

    -- 14. Office Equipments
    INSERT INTO Materials (ItemCode, Name, CategoryId, Description, UnitOfMeasure, CurrentStock, MinimumReorderLevel, UnitPrice, StorageLocation)
    VALUES
    ('CON-OEQ-001', 'Thermal Laminating Pouches A4 (Pack of 100)', 14, 'Glossy 80-micron document protective pouches', 'Pack', 15, 4, 580.00, 'Pantry Bay Upper'),
    ('CON-OEQ-002', 'Heavy Duty 2-Hole Desktop Puncher 40-Sheet', 14, 'Metal punch machine with centering paper guide', 'Unit', 9, 3, 650.00, 'Stationery Bin 104'),
    ('CON-OEQ-003', 'Whiteboard Cleaner Spray 250ml', 14, 'Streak-free dry erase board conditioning spray', 'Bottle', 20, 6, 160.00, 'Stationery Bin 105');

    -- 15. Housekeeping Materials
    INSERT INTO Materials (ItemCode, Name, CategoryId, Description, UnitOfMeasure, CurrentStock, MinimumReorderLevel, UnitPrice, StorageLocation)
    VALUES
    ('CON-HSK-001', 'Surface Disinfectant Floor Cleaner 5L', 15, 'Concentrated multi-surface floral sanitizing liquid', 'Can', 11, 4, 650.00, 'Housekeeping Store'),
    ('CON-HSK-002', 'Ultra Microfiber Cleaning Towels (Pack of 10)', 15, 'Lint-free absorbent dusters for screens and desks', 'Pack', 22, 6, 380.00, 'Housekeeping Store'),
    ('CON-HSK-003', 'Heavy Duty Waste Bin Trash Liners (Roll of 50)', 15, 'Tear-resistant 30-gallon black polythene bags', 'Roll', 35, 10, 290.00, 'Housekeeping Store');

    -- 16. Cutlery Set
    INSERT INTO Materials (ItemCode, Name, CategoryId, Description, UnitOfMeasure, CurrentStock, MinimumReorderLevel, UnitPrice, StorageLocation)
    VALUES
    ('CON-CUT-001', 'Biodegradable Paper Hot Cups 200ml (Pack 100)', 16, 'Compostable ripple coffee and tea cups for cafeteria', 'Pack', 40, 12, 140.00, 'Cafeteria Pantry 1'),
    ('CON-CUT-002', 'Eco Birchwood Disposable Spoons (Box of 100)', 16, 'Smooth splinter-free wooden dining spoons', 'Box', 28, 8, 180.00, 'Cafeteria Pantry 1'),
    ('CON-CUT-003', 'Ceramic Office Coffee Mug 350ml (White)', 16, 'Microwave and dishwasher safe porcelain mug', 'Pcs', 48, 15, 120.00, 'Cafeteria Pantry 2');
END
GO

-- ============================================================================
-- SEED DATA: Inward and Outward Inventory Transactions
-- ============================================================================
IF NOT EXISTS (SELECT 1 FROM InventoryTransactions)
BEGIN
    INSERT INTO InventoryTransactions (MaterialId, TransactionType, Quantity, UnitPrice, TotalAmount, BalanceAfter, ReferenceNumber, PartyName, HandledBy, Remarks, TransactionDate)
    VALUES
    (1, 'INWARD', 20, 1450.00, 29000.00, 20, 'PO-2026-0811', 'TechCom Supplies Ltd', 'Robert Fox', 'Initial bulk stock receipt for Q3', '2026-08-15 09:30:00'),
    (1, 'OUTWARD', 2, 1450.00, 2900.00, 18, 'REQ-2026-104', 'Engineering Dept (Alice Chen)', 'Marcus Vance', 'Issued for new developer MacBook setup', '2026-09-02 14:15:00'),

    (2, 'INWARD', 30, 650.00, 19500.00, 30, 'PO-2026-0820', 'Peripheral Hub India', 'Robert Fox', 'Quarterly inventory replenishment', '2026-08-20 11:00:00'),
    (2, 'OUTWARD', 5, 650.00, 3250.00, 25, 'REQ-2026-145', 'Design Dept', 'Marcus Vance', 'Replacement mice for creative team workstations', '2026-09-18 10:45:00'),

    (3, 'INWARD', 10, 420.00, 4200.00, 10, 'PO-2026-0701', 'Cooler Master Distributors', 'Robert Fox', 'Stocking workshop spares', '2026-07-10 10:00:00'),
    (3, 'OUTWARD', 6, 420.00, 2520.00, 4, 'REQ-2026-099', 'IT Helpdesk Repair Bench', 'Marcus Vance', 'Server rack and workstation maintenance overhaul', '2026-09-29 16:30:00'),

    (10, 'INWARD', 10, 3850.00, 38500.00, 10, 'PO-2026-0899', 'Toner World Enterprise', 'Robert Fox', 'Bulk laser printer supply order', '2026-08-28 10:30:00'),
    (10, 'OUTWARD', 4, 3850.00, 15400.00, 6, 'REQ-2026-240', 'Finance & Accounts', 'Marcus Vance', 'Quarter-end audit ledger printings', '2026-09-30 15:45:00'),

    (13, 'INWARD', 20, 350.00, 7000.00, 20, 'PO-2026-0902', 'Stationery Kingdom', 'Sarah Jenkins', 'Monthly office stationery intake', '2026-09-05 11:30:00'),
    (13, 'OUTWARD', 6, 350.00, 2100.00, 14, 'REQ-2026-267', 'HR & Administration', 'Marcus Vance', 'Distributed to Floor 1 and Floor 2 supply caddies', '2026-09-25 14:00:00'),

    (16, 'INWARD', 20, 750.00, 15000.00, 20, 'PO-2026-0888', 'PrintCraft Press', 'Sarah Jenkins', 'Annual legal documentation reams', '2026-08-18 16:00:00'),
    (16, 'OUTWARD', 5, 750.00, 3750.00, 15, 'REQ-2026-290', 'Legal Department', 'Marcus Vance', 'Corporate client contract documentation', '2026-10-02 10:00:00'),

    (41, 'INWARD', 15, 650.00, 9750.00, 15, 'PO-2026-0915', 'CleanPro Hygiene Solutions', 'Sarah Jenkins', 'Facility cleaning supplies intake', '2026-09-10 08:30:00'),
    (41, 'OUTWARD', 4, 650.00, 2600.00, 11, 'REQ-2026-302', 'Facilities & Housekeeping', 'Marcus Vance', 'Weekly sanitation cycle for towers A & B', '2026-10-05 08:00:00'),

    (44, 'INWARD', 50, 140.00, 7000.00, 50, 'PO-2026-0918', 'EcoPantry Goods', 'Sarah Jenkins', 'Cafeteria pantry stock intake', '2026-09-12 14:00:00'),
    (44, 'OUTWARD', 10, 140.00, 1400.00, 40, 'REQ-2026-315', 'Employee Lounge & Pantry', 'Marcus Vance', 'Replenished tea/coffee station dispensers', '2026-10-08 09:30:00');
END
GO

PRINT 'ConsumablesInventoryDb schema and seed data created successfully with INR valuations!';
GO
