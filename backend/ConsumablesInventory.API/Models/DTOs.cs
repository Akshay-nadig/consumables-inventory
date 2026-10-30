using System.ComponentModel.DataAnnotations;

namespace ConsumablesInventory.API.Models
{
    public class CreateMaterialDto
    {
        [Required]
        public string ItemCode { get; set; } = string.Empty;

        [Required]
        [StringLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public int CategoryId { get; set; }

        public string? Description { get; set; }

        [Required]
        public string UnitOfMeasure { get; set; } = "Pcs";

        [Range(0, 1000000)]
        public int InitialStock { get; set; } = 0;

        [Range(1, 100000)]
        public int MinimumReorderLevel { get; set; } = 10;

        [Range(0, 1000000)]
        public decimal UnitPrice { get; set; } = 0.00m;

        public string? StorageLocation { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? EffectiveDate { get; set; }
        public DateTime? TransactionDate { get; set; }
    }

    public class UpdateMaterialDto
    {
        [Required]
        [StringLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public int CategoryId { get; set; }

        public string? Description { get; set; }

        [Required]
        public string UnitOfMeasure { get; set; } = "Pcs";

        [Range(1, 100000)]
        public int MinimumReorderLevel { get; set; } = 10;

        [Range(0, 1000000)]
        public decimal UnitPrice { get; set; } = 0.00m;

        public string? StorageLocation { get; set; }

        public string? ChangedBy { get; set; }
        public string? ChangeReason { get; set; }
        public DateTime? EffectiveDate { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateInwardTransactionDto
    {
        [Required]
        public int MaterialId { get; set; }

        [Required]
        [Range(1, 100000)]
        public int Quantity { get; set; }

        public decimal? UnitPrice { get; set; }

        [StringLength(100)]
        public string? ReferenceNumber { get; set; } // PO Number or Invoice Number

        [StringLength(150)]
        public string? SupplierName { get; set; }

        [StringLength(100)]
        public string? ReceivedBy { get; set; }

        public string? Remarks { get; set; }

        [StringLength(200)]
        public string? StorageLocation { get; set; }

        public DateTime? TransactionDate { get; set; }
    }

    public class CreateOutwardTransactionDto
    {
        [Required]
        public int MaterialId { get; set; }

        [Required]
        [Range(1, 100000)]
        public int Quantity { get; set; }

        [StringLength(100)]
        public string? ReferenceNumber { get; set; } // Requisition / Work order #

        [Required]
        [StringLength(150)]
        public string DepartmentOrEmployee { get; set; } = string.Empty;

        [StringLength(100)]
        public string? IssuedBy { get; set; }

        public string? Remarks { get; set; }

        public DateTime? TransactionDate { get; set; }
    }

    public class DashboardSummaryDto
    {
        public int TotalItems { get; set; }
        public int TotalStockUnits { get; set; }
        public int LowStockItemsCount { get; set; }
        public int OutOfStockItemsCount { get; set; }
        public decimal TotalInventoryValue { get; set; }
        public int ThisMonthInwardQuantity { get; set; }
        public int ThisMonthOutwardQuantity { get; set; }
        public List<CategoryStockSummaryDto> CategoryBreakdown { get; set; } = new();
        public List<MonthlyMovementSummaryDto> MonthlyTrend { get; set; } = new();
        public List<Material> LowStockAlerts { get; set; } = new();
        public List<InventoryTransaction> RecentTransactions { get; set; } = new();
    }

    public class CategoryStockSummaryDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int TotalItems { get; set; }
        public int TotalUnits { get; set; }
        public decimal Valuation { get; set; }
        public int LowStockCount { get; set; }
    }

    public class MonthlyMovementSummaryDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthLabel { get; set; } = string.Empty;
        public int InwardQuantity { get; set; }
        public int OutwardQuantity { get; set; }
        public decimal InwardValue { get; set; }
        public decimal OutwardValue { get; set; }
        public int NetMovement { get; set; }
    }

    public class MonthlyMovementReportDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName { get; set; } = string.Empty;
        public int TotalInwardUnits { get; set; }
        public int TotalOutwardUnits { get; set; }
        public decimal TotalInwardAmount { get; set; }
        public decimal TotalOutwardAmount { get; set; }
        public int NetStockChange { get; set; }
        public List<ItemMonthlyMovementDto> Items { get; set; } = new();
    }

    public class ItemMonthlyMovementDto
    {
        public int MaterialId { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string UnitOfMeasure { get; set; } = string.Empty;
        public int OpeningStock { get; set; }
        public int InwardQuantity { get; set; }
        public int OutwardQuantity { get; set; }
        public int ClosingStock { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalInwardValue { get; set; }
        public decimal TotalOutwardValue { get; set; }
    }

    public class MaterialCostHistoryDto
    {
        public int Id { get; set; }
        public int MaterialId { get; set; }
        public string MaterialName { get; set; } = string.Empty;
        public string ItemCode { get; set; } = string.Empty;
        public decimal PreviousCost { get; set; }
        public decimal NewCost { get; set; }
        public decimal Difference => NewCost - PreviousCost;
        public decimal PercentageChange => PreviousCost > 0 ? ((NewCost - PreviousCost) / PreviousCost) * 100 : 0;
        public string ChangeReason { get; set; } = string.Empty;
        public string? ChangedBy { get; set; }
        public DateTime EffectiveDate { get; set; }
        public string? Notes { get; set; }
    }
}
