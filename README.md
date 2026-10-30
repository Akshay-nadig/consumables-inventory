# Company Consumables Inventory Management System

A dedicated, enterprise-grade inventory management system designed specifically for tracking **only consumables** within an organization. Built with **React** (Vite), **ASP.NET Core 8 Web API**, and **Microsoft SQL Server**.

---

## 🌟 Key Features

1. **Enterprise Dashboard & Stock Overview**
   - Real-time stock status: Available Stock Units, Active Consumable SKUs, Inventory Valuation ($), and Low Stock Alerts.
   - **Inward vs Outward Movement Trends**: 6-month visual comparison tracking monthly intake vs department consumption.
   - **Re-order Watchlist**: Priority alerts highlighting materials that have breached minimum reorder levels.
   - **16 Consumable Categories Overview**: Interactive cards with item counts, available stock, and valuations.

2. **Full Materials Catalog & Search**
   - Quick category filtering across all **16 official categories**.
   - Search by Item Name, SKU Code, or Physical Storage Location.
   - Stock health progress bars with dynamic status pills (*In Stock*, *Low Stock*, *Depleted*).
   - Instant action triggers: `+ Inward`, `- Outward`, and `Edit Material`.

3. **Form for Adding / Registering Consumables**
   - Category assignment from the 16 predefined categories.
   - One-click **Auto-Generate SKU** button (e.g. `CON-IT-004`, `CON-NET-005`).
   - Unit of Measure (UoM) selector (Pcs, Box, Pack, Ream, Roll, Cartridge, Bottle, Can, etc.).
   - Threshold management (Minimum Reorder Point, Opening Stock, Unit Cost, Rack Location).

4. **Inward Stock Receipts Tracking**
   - Record delivery batches from suppliers.
   - Fields: Supplier/Vendor, PO / Invoice reference number, Quantity, Unit purchase cost, Receiving staff, and remarks.
   - Real-time projected stock calculation before submission.

5. **Outward Stock Issuance Tracking**
   - Issue consumable items to departments or employees (Engineering, HR, Marketing, Accounts, Facilities, etc.).
   - **Strict Quantity Validation**: Prevents issuing more than available physical stock.
   - **Re-order Warning**: Warns staff if the issue drops inventory below safety threshold.
   - Logs requisition/ticket number and issuing staff.

6. **Monthly Stock Movement Report (Inward vs Outward)**
   - Monthly and yearly selector (e.g. October 2026, September 2026, etc.).
   - Category filtering for targeted monthly auditing.
   - **Stock Flow Matrix**:
     $$\text{Closing Stock} = \text{Opening Stock} + \text{Inward} - \text{Outward}$$
   - Total Inward Value ($), Total Outward Value ($), and Net Movement Trend indicators.
   - **Export to CSV**: Instant spreadsheet download.
   - **Print-Ready Styles**: Clean print view for physical audits.

---

## 📋 The 16 Consumable Categories

The system is configured with the 16 exact consumable categories:
1. `IT Spares`
2. `Electronic Gadgets`
3. `Network Related Materials`
4. `Toner Cartridge for Printers`
5. `Stationery Items`
6. `Printed Stationery Items`
7. `Electrical Spare Parts`
8. `Plumbing Spare Parts`
9. `Furniture & Fitting Spare Parts`
10. `Gift Articles`
11. `Reference Books & Project Reports`
12. `Event Related Materials`
13. `Health & First Aid Equipments`
14. `Office Equipments`
15. `Housekeeping Materials`
16. `Cutlery Set`

*Every category is pre-populated in the basic demo with less than 5 items (2 to 3 realistic items each).*

---

## 🚀 Running the System

### 1. Frontend (React + Vite)
The React application includes a dual-mode API layer that connects seamlessly to the ASP.NET Core API or runs in standalone interactive mode with full localStorage persistence and pre-seeded demo data:

```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 2. Backend (ASP.NET Core Web API)
```bash
cd backend/ConsumablesInventory.API
dotnet run
```
API endpoints will run at `http://localhost:5000` with Swagger UI at `http://localhost:5000/swagger`.

### 3. Database (Microsoft SQL Server)
1. Open **SQL Server Management Studio (SSMS)** or **Azure Data Studio**.
2. Connect to your SQL Server instance.
3. Open `backend/Database/DatabaseSetup.sql`.
4. Press `F5` to execute. The database `ConsumablesInventoryDb` with all tables, indexes, and demo data will be created automatically.
