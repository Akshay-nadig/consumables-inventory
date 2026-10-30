using System.Text.Json.Serialization;

namespace ConsumablesInventory.API.Models
{
    public class Material
    {
        public int Id { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int CategoryId { get; set; }
        public Category? Category { get; set; }
        public string? Description { get; set; }
        public string UnitOfMeasure { get; set; } = "Pcs";
        public int CurrentStock { get; set; } = 0;
        public int MinimumReorderLevel { get; set; } = 10;
        public decimal UnitPrice { get; set; } = 0.00m;
        public decimal PreviousCost { get; set; } = 0.00m;
        public int PreviousCostStock { get; set; } = 0;
        public int CurrentCostStock { get; set; } = 0;
        public decimal TotalValue => (PreviousCostStock * PreviousCost) + (CurrentCostStock * UnitPrice);

        public string? StorageLocation { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        [JsonIgnore]
        public ICollection<InventoryTransaction> Transactions { get; set; } = new List<InventoryTransaction>();

        [JsonIgnore]
        public ICollection<MaterialCostHistory> CostHistories { get; set; } = new List<MaterialCostHistory>();
    }
}
