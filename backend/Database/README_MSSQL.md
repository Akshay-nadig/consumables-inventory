# Consumables Inventory Management - Microsoft SQL Server Setup

This project uses **Microsoft SQL Server** as its database engine and **ASP.NET Core 8 Web API** as the backend framework.

## 1. Database Setup via SSMS (SQL Server Management Studio)
1. Open **SQL Server Management Studio (SSMS)** or **Azure Data Studio**.
2. Connect to your SQL Server instance (e.g. `localhost`, `.\SQLEXPRESS`, or your server name).
3. Open the file `backend/Database/DatabaseSetup.sql`.
4. Click **Execute** (or press `F5`).
5. This script will:
   - Create the database `ConsumablesInventoryDb`
   - Create tables `Categories`, `Materials`, and `InventoryTransactions`
   - Create indexes on frequently filtered fields
   - Insert all **16 company consumable categories** (as specified)
   - Insert initial consumable materials with **< 5 items per category**
   - Insert inward and outward transaction audit history across months

## 2. Configure Connection String
Open `backend/ConsumablesInventory.API/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ConsumablesInventoryDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true;"
  }
}
```
If you are using SQL Server Express with a username and password:
```json
"DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=ConsumablesInventoryDb;User Id=sa;Password=YourPassword123!;TrustServerCertificate=True;"
```

## 3. Running the ASP.NET Core Web API
In terminal or Visual Studio:
```bash
cd backend/ConsumablesInventory.API
dotnet restore
dotnet run
```
The API will launch at `http://localhost:5000` with Swagger UI available at `http://localhost:5000/swagger`.
