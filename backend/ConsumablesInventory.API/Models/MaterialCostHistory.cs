namespace ConsumablesInventory.API.Models
{
    public class MaterialCostHistory
    {
        public int Id { get; set; }
        public int MaterialId { get; set; }
        public Material? Material { get; set; }

        public decimal PreviousCost { get; set; } = 0.00m;
        public decimal NewCost { get; set; } = 0.00m;
        public string ChangeReason { get; set; } = string.Empty;
        public string? ChangedBy { get; set; }
        public DateTime EffectiveDate { get; set; } = DateTime.UtcNow;
        public string? Notes { get; set; }
    }
}
